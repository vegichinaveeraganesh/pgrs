/**
 * Mailer Utility
 * Sends real OTP emails via nodemailer (Gmail SMTP).
 * Falls back to console.log in development if credentials are not set.
 */
const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

function isConfigured(str) {
  if (!str) return false;
  const s = str.trim().toLowerCase();
  return s !== '' && !s.includes('your-email') && !s.includes('your-16-letter') && !s.includes('placeholder') && !s.includes('example.com');
}

function getTransporter() {
  if (transporter) return transporter;

  const validUser = isConfigured(env.smtpUser) ? env.smtpUser : null;
  const validPass = isConfigured(env.smtpPass) ? env.smtpPass : null;

  if (env.smtpHost && validUser && validPass) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: parseInt(env.smtpPort, 10) || 587,
      secure: false,
      auth: {
        user: validUser,
        pass: validPass
      }
    });
  } else if (validUser && validPass) {
    // Gmail shortcut
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: validUser,
        pass: validPass
      }
    });
  }

  return transporter;
}

/**
 * Send OTP verification email
 * @param {string} toEmail - recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - recipient name
 */
async function sendOtpEmail(toEmail, otp, name = 'Officer') {
  // Always log prominently to terminal console
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║ 🔑 PGRS OTP VERIFICATION CODE                        ║`);
  console.log(`║ 👤 Name:  ${(name || 'Officer').slice(0, 40).padEnd(41)}║`);
  console.log(`║ 📧 Email: ${toEmail.slice(0, 40).padEnd(41)}║`);
  console.log(`║ 🔢 OTP CODE: >>> ${otp} <<<                          ║`);
  console.log(`║ ⏰ Valid for 15 minutes                              ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const mailer = getTransporter();

  if (!mailer) {
    console.log('[MAILER] No SMTP credentials configured. OTP logged to console above.');
    return { simulated: true, otp };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { color: #1e40af; font-size: 22px; font-weight: bold; }
        .otp-box { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #1e40af; }
        .note { color: #64748b; font-size: 13px; text-align: center; margin-top: 20px; }
        .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏛️ RDO Bhimunipatnam – PGRS</div>
          <p style="color:#64748b;margin:8px 0 0">Public Grievance Redressal System</p>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Use the verification code below to complete your registration. This code is valid for <strong>15 minutes</strong>.</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="note">Do not share this code with anyone. If you did not request this, please ignore this email.</p>
        <div class="footer">RDO Bhimunipatnam | Government of Andhra Pradesh</div>
      </div>
    </body>
    </html>
  `;

  try {
    await mailer.sendMail({
      from: `"RDO PGRS Portal" <${env.smtpUser}>`,
      to: toEmail,
      subject: `${otp} – Your PGRS Verification Code`,
      html
    });
    console.log(`✅ [MAILER] Real OTP email sent successfully to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`⚠️ [MAILER] Could not deliver email via SMTP (${err.message}). Using console OTP.`);
    return { simulated: true, otp, error: err.message };
  }
}

module.exports = { sendOtpEmail };
