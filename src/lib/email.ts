import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !portRaw || !user || !pass || !from) {
    return null;
  }

  const port = Number(portRaw);
  if (Number.isNaN(port)) return null;

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from,
  };
}

export function isEmailRecoveryConfigured() {
  return Boolean(getSmtpConfig());
}

function getRecoveryOtpEmailHtml(otpCode: string, expiryMinutes: number = 10) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 48px; letter-spacing: 8px; font-weight: bold; color: #667eea; font-family: monospace; }
        .expiry { color: #d32f2f; font-weight: bold; margin: 10px 0; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested to reset your admin password for <strong>ABCD Work Platform</strong>. Use the recovery code below:</p>
          
          <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #999; font-size: 14px;">Recovery Code</p>
            <div class="otp-code">${otpCode}</div>
          </div>
          
          <div class="expiry">
            ⏱️ Expires in ${expiryMinutes} minutes
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. The ABCD team will never ask for it.
          </div>
          
          <p>If you did not request this password reset, please:</p>
          <ol>
            <li>Ignore this email</li>
            <li>Contact your system administrator if you believe your account is compromised</li>
          </ol>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
        <div class="footer">
          <p>ABCD Work Platform © 2026 | Security Email</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendAdminRecoveryOtp(email: string, otpCode: string) {
  const config = getSmtpConfig();
  if (!config) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "🔐 ABCD Work Platform - Password Reset Code",
    text: `Your admin password reset code is: ${otpCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
    html: getRecoveryOtpEmailHtml(otpCode, 10),
  });
}

