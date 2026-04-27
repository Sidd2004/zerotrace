/**
 * scheduler.js — ZeroTrace Meeting Scheduler
 *
 * Standalone module that integrates with Google Calendar (for scheduling)
 * and Resend (for transactional email). Auth is read entirely from
 * process.env — no credentials files required.
 *
 * Exported functions:
 *   - check_calendar(date, start_time, end_time, timezone)
 *   - create_meeting(title, date, start_time, end_time, attendee_email, timezone)
 *   - send_email(to_email, subject, body_html)
 */

import { google } from 'googleapis';
import { Resend } from 'resend';

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Returns an authenticated OAuth2 client built solely from process.env.
 * Throws a descriptive error if any required env var is missing.
 */
function getOAuthClient() {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    const missing = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'GOOGLE_REFRESH_TOKEN']
      .filter((k) => !process.env[k]);
    throw new Error(`Google OAuth setup incomplete. Missing env vars: ${missing.join(', ')}`);
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

// ─── Helper: build ISO datetime string ───────────────────────────────────────

/**
 * Combines a date string (YYYY-MM-DD) and time string (HH:MM or HH:MM:SS)
 * into a full RFC3339-compatible ISO string with timezone offset.
 *
 * @param {string} date  - "YYYY-MM-DD"
 * @param {string} time  - "HH:MM" or "HH:MM:SS"
 * @param {string} tz    - IANA timezone, e.g. "Asia/Kolkata"
 * @returns {string}     - ISO 8601 string understood by Google APIs
 */
function buildDateTime(date, time, tz) {
  // Google Calendar API accepts "dateTime" with timeZone specified separately,
  // so we just combine them into "YYYY-MM-DDTHH:MM:SS" and let the API apply tz.
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalizedTime}`;
}

// ─── 1. check_calendar ───────────────────────────────────────────────────────

/**
 * Checks the primary Google Calendar for free/busy status in the given window.
 *
 * @param {string} date        - "YYYY-MM-DD"
 * @param {string} start_time  - "HH:MM"
 * @param {string} end_time    - "HH:MM"
 * @param {string} [timezone]  - IANA timezone (default: "Asia/Kolkata")
 * @returns {{ available: true } | { available: false, next_free_slot: string }}
 */
export async function check_calendar(date, start_time, end_time, timezone = 'Asia/Kolkata') {
  if (!date || !start_time || !end_time) {
    throw new Error('check_calendar: date, start_time, and end_time are required.');
  }

  try {
    const auth     = getOAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const timeMin = new Date(`${buildDateTime(date, start_time, timezone)}`);
    const timeMax = new Date(`${buildDateTime(date, end_time, timezone)}`);

    // Interpret the naive datetime strings in the requested timezone
    const timeMinISO = toISOWithTz(date, start_time, timezone);
    const timeMaxISO = toISOWithTz(date, end_time, timezone);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMinISO,
        timeMax: timeMaxISO,
        timeZone: timezone,
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = response.data?.calendars?.primary?.busy ?? [];

    if (busySlots.length === 0) {
      return { available: true };
    }

    // Find the end of the last busy block, then add 30 minutes
    const lastBusyEnd = busySlots.reduce((latest, slot) => {
      const endMs = new Date(slot.end).getTime();
      return endMs > latest ? endMs : latest;
    }, 0);

    const nextFreeMs   = lastBusyEnd + 30 * 60 * 1000;
    const nextFreeDate = new Date(nextFreeMs);

    // Format as "YYYY-MM-DDTHH:MM" in the requested timezone
    const next_free_slot = formatInTimezone(nextFreeDate, timezone);

    return { available: false, next_free_slot };
  } catch (err) {
    throw new Error(`check_calendar failed: ${err.message}`);
  }
}

// ─── 2. create_meeting ───────────────────────────────────────────────────────

/**
 * Creates a Google Calendar event with an auto-generated Google Meet link
 * and sends calendar invites to the attendee.
 *
 * @param {string} title           - Meeting title
 * @param {string} date            - "YYYY-MM-DD"
 * @param {string} start_time      - "HH:MM"
 * @param {string} end_time        - "HH:MM"
 * @param {string} attendee_email  - Attendee's email address
 * @param {string} [timezone]      - IANA timezone (default: "Asia/Kolkata")
 * @returns {{ event_id: string, meet_link: string, calendar_link: string }}
 */
export async function create_meeting(title, date, start_time, end_time, attendee_email, timezone = 'Asia/Kolkata') {
  if (!title || !date || !start_time || !end_time || !attendee_email) {
    throw new Error('create_meeting: title, date, start_time, end_time, and attendee_email are all required.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee_email)) {
    throw new Error(`create_meeting: "${attendee_email}" is not a valid email address.`);
  }

  try {
    const auth     = getOAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: title,
      start: {
        dateTime: buildDateTime(date, start_time, timezone),
        timeZone: timezone,
      },
      end: {
        dateTime: buildDateTime(date, end_time, timezone),
        timeZone: timezone,
      },
      attendees: [{ email: attendee_email }],
      conferenceData: {
        createRequest: {
          requestId: `zt-meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: event,
    });

    const createdEvent = response.data;
    const event_id     = createdEvent.id;
    const meet_link    = createdEvent.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri ?? createdEvent.hangoutLink ?? '';
    const calendar_link = createdEvent.htmlLink ?? '';

    if (!event_id) {
      throw new Error('Google Calendar did not return an event ID.');
    }

    console.log(`✅ Meeting created [ID: ${event_id}] — Meet: ${meet_link}`);
    return { event_id, meet_link, calendar_link };
  } catch (err) {
    throw new Error(`create_meeting failed: ${err.message}`);
  }
}

// ─── 3. send_email ───────────────────────────────────────────────────────────

/**
 * Sends an HTML email via the Resend API.
 * Requires RESEND_API_KEY in process.env.
 * From address defaults to RESEND_FROM_EMAIL or 'meetings@zerotrace.in'.
 *
 * @param {string} to_email   - Recipient email address
 * @param {string} subject    - Email subject line
 * @param {string} body_html  - Full HTML body
 * @returns {{ success: true }}
 */
export async function send_email(to_email, subject, body_html) {
  if (!to_email || !subject || !body_html) {
    throw new Error('send_email: to_email, subject, and body_html are all required.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to_email)) {
    throw new Error(`send_email: "${to_email}" is not a valid email address.`);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('send_email: RESEND_API_KEY environment variable is not set.');
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'meetings@zerotrace.in';
  const fromName  = process.env.RESEND_FROM_NAME  || 'ZeroTrace';

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to:   [to_email],
      subject,
      html: body_html,
    });

    if (error) {
      throw new Error(error.message ?? JSON.stringify(error));
    }

    console.log(`✅ Email sent via Resend to ${to_email} [id: ${data?.id}]`);
    return { success: true };
  } catch (err) {
    throw new Error(`send_email failed: ${err.message}`);
  }
}

// ─── Timezone helpers ─────────────────────────────────────────────────────────

/**
 * Converts a naive "YYYY-MM-DD" + "HH:MM" pair into a proper ISO 8601 string
 * with the correct UTC offset for the given IANA timezone.
 * Uses Intl.DateTimeFormat to resolve the offset without external deps.
 */
function toISOWithTz(date, time, timezone) {
  const [year, month, day]   = date.split('-').map(Number);
  const [hour, minute]       = time.split(':').map(Number);

  // Create a Date at UTC midnight then find the offset
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  // Get the wall-clock time in the target timezone to compute offset
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(utcDate);

  const get = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const tzYear   = get('year');
  const tzMonth  = get('month');
  const tzDay    = get('day');
  const tzHour   = get('hour') % 24;
  const tzMin    = get('minute');
  const tzSec    = get('second');

  // Difference between requested wall time and the UTC date's tz wall time
  const tzWall = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, tzSec);
  const offsetMs = utcDate.getTime() - tzWall;

  // Shift the UTC date by offset to get the correct UTC moment
  const actualUtc = new Date(utcDate.getTime() + offsetMs);
  return actualUtc.toISOString();
}

/**
 * Formats a UTC Date object as "YYYY-MM-DDTHH:MM" in the given timezone.
 */
function formatInTimezone(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value ?? '00';
  const hour = String(Number(get('hour')) % 24).padStart(2, '0');
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`;
}
