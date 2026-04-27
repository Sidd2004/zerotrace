import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, verifySmtp } from './utils/mailer.js';
import { check_calendar, create_meeting, send_email as schedulerSendEmail } from './scheduler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───
app.use(helmet());
app.use(morgan('dev'));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://zerotrace.in', 'https://www.zerotrace.in'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many contact requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Utility ───
const sanitize = (str) => {
  if (!str) return '';
  return str.toString().trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// ─── Routes ───
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ZeroTrace API is active.' });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/contact
 * 1. Validates & sanitizes input
 * 2. Inserts into Supabase contact_messages table
 * 3. Sends admin notification email via SMTP
 * 4. Sends user acknowledgement email via SMTP
 */
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // 1. Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const sanitizedData = {
      name: sanitize(name),
      email: email.trim().toLowerCase(),
      phone: sanitize(phone) || null,
      service: sanitize(service) || 'General Inquiry',
      message: sanitize(message),
      status: 'new',
    };

    // 2. Insert into Supabase (lazy init — only reads env vars when called)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error: dbError } = await supabase
      .from('contact_messages')
      .insert([sanitizedData])
      .select('id')
      .single();

    if (dbError) {
      console.error('Supabase Insert Error:', dbError);
      throw new Error('Database insertion failed');
    }

    console.log(`✅ Contact message saved [ID: ${data.id}]`);

    // 3. Send Admin Notification Email
    const adminEmail = process.env.ADMIN_EMAIL || 'zerotrace2004@gmail.com';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    await sendEmail(
      adminEmail,
      `New Contact Request — ${sanitizedData.name}`,
      `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#f0f0f0;padding:24px;border-radius:12px;">
          <h2 style="color:#ef2f88;margin-top:0;">New Contact Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#999;">Name</td><td style="padding:8px 0;">${sanitizedData.name}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Email</td><td style="padding:8px 0;">${sanitizedData.email}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Phone</td><td style="padding:8px 0;">${sanitizedData.phone || 'Not provided'}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Service</td><td style="padding:8px 0;">${sanitizedData.service}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Timestamp</td><td style="padding:8px 0;">${timestamp}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#111;border-radius:8px;">
            <p style="color:#999;margin:0 0 8px;">Message:</p>
            <p style="margin:0;line-height:1.6;">${sanitizedData.message}</p>
          </div>
        </div>
      `
    );

    // 4. Send User Acknowledgement Email
    await sendEmail(
      sanitizedData.email,
      'We received your message — ZeroTrace',
      `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#f0f0f0;padding:24px;border-radius:12px;">
          <h2 style="color:#ef2f88;margin-top:0;">Thank you, ${sanitizedData.name}!</h2>
          <p style="color:#ccc;line-height:1.6;">We have received your message and our team will get back to you within 24 hours.</p>
          <p style="color:#ccc;line-height:1.6;">If your inquiry is urgent, please reach out directly at <a href="mailto:${adminEmail}" style="color:#ef2f88;">${adminEmail}</a>.</p>
          <hr style="border:none;border-top:1px solid #222;margin:24px 0;">
          <p style="color:#666;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ZeroTrace Security. All rights reserved.</p>
        </div>
      `
    );

    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('API /api/contact Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Scheduler Routes ─────────────────────────────────────────────────────────

/**
 * POST /api/scheduler/check-calendar
 * Body: { date, start_time, end_time, timezone? }
 * Returns: { available: true } | { available: false, next_free_slot: "YYYY-MM-DDTHH:MM" }
 */
app.post('/api/scheduler/check-calendar', async (req, res) => {
  try {
    const { date, start_time, end_time, timezone } = req.body;
    if (!date || !start_time || !end_time) {
      return res.status(400).json({ error: 'date, start_time, and end_time are required.' });
    }
    const result = await check_calendar(date, start_time, end_time, timezone);
    return res.status(200).json(result);
  } catch (err) {
    console.error('POST /api/scheduler/check-calendar error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scheduler/create-meeting
 * Body: { title, date, start_time, end_time, attendee_email, timezone? }
 * Returns: { event_id, meet_link, calendar_link }
 */
app.post('/api/scheduler/create-meeting', async (req, res) => {
  try {
    const { title, date, start_time, end_time, attendee_email, timezone } = req.body;
    if (!title || !date || !start_time || !end_time || !attendee_email) {
      return res.status(400).json({ error: 'title, date, start_time, end_time, and attendee_email are required.' });
    }
    const result = await create_meeting(title, date, start_time, end_time, attendee_email, timezone);
    return res.status(200).json(result);
  } catch (err) {
    console.error('POST /api/scheduler/create-meeting error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scheduler/send-email
 * Body: { to_email, subject, body_html }
 * Returns: { success: true }
 */
app.post('/api/scheduler/send-email', async (req, res) => {
  try {
    const { to_email, subject, body_html } = req.body;
    if (!to_email || !subject || !body_html) {
      return res.status(400).json({ error: 'to_email, subject, and body_html are required.' });
    }
    const result = await schedulerSendEmail(to_email, subject, body_html);
    return res.status(200).json(result);
  } catch (err) {
    console.error('POST /api/scheduler/send-email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── Start Server (runtime only — never reached during build) ───
app.listen(PORT, async () => {
  console.log(`✅ ZeroTrace API running on port ${PORT}`);

  const missing = [
    'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
    'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS',
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'GOOGLE_REFRESH_TOKEN',
  ].filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    console.warn('Some features may not work correctly.');
  }

  // Verify SMTP at runtime
  await verifySmtp();
});
