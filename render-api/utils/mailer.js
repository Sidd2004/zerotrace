import nodemailer from 'nodemailer';

// ─── Lazy-initialized transporter (created on first use, NOT at build time) ───
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error('⚠️ SMTP credentials not configured. Emails will not be sent.');
    return null;
  }

  _transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return _transporter;
}

/**
 * Send an email using the configured SMTP transporter.
 * Fails gracefully — logs errors but never throws.
 */
export async function sendEmail(to, subject, html) {
  const transporter = getTransporter();
  if (!transporter) {
    console.error(`⚠️ Cannot send email to ${to} — SMTP not configured.`);
    return false;
  }

  const fromName = process.env.SMTP_FROM_NAME || 'ZeroTrace Security';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`⚠️ Failed to send email to ${to}:`, err.message);
    return false;
  }
}

/**
 * Verify SMTP connection. Call this at server startup, not during build.
 */
export async function verifySmtp() {
  const transporter = getTransporter();
  if (!transporter) return;

  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
  } catch (err) {
    console.error('⚠️ SMTP verification failed:', err.message);
  }
}
