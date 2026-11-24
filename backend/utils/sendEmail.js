const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const smtpEmail = process.env.SMTP_EMAIL || process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;

    if (!smtpEmail || !smtpPassword) {
        throw new Error('SMTP credentials missing. Please set SMTP_EMAIL and SMTP_PASSWORD in backend/.env');
    }

    let transporter;
    if (smtpHost) {
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpEmail,
                pass: smtpPassword,
            },
        });
    } else {
        // Default to Gmail service
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpEmail,
                pass: smtpPassword,
            },
        });
    }

    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'EssSmartSeller';
    const otpMatch = options.message && options.message.match(/\b\d{6}\b/);
    const otpCode = otpMatch ? otpMatch[0] : '';

    const message = {
        from: `"${appName}" <${smtpEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px;">
                    <h2 style="color: #1e3a8a; margin: 0; font-size: 22px;">${appName} Admin Verification</h2>
                </div>
                <p style="color: #334155; font-size: 15px; margin: 0 0 16px;">Hello,</p>
                <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">Use the following real One-Time Password (OTP) to complete your admin login:</p>
                <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #2563eb;">${otpCode || options.message}</span>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 16px 0 0;">
                    This code is valid for <strong>10 minutes</strong>. If you did not attempt to log in, please secure your account immediately.
                </p>
                <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 12px; text-align: center;">
                    <span style="color: #94a3b8; font-size: 12px;">© ${appName} Security System</span>
                </div>
            </div>
        `
    };

    const info = await transporter.sendMail(message);
    console.log('[sendEmail] Real email dispatched successfully! Message ID: %s', info.messageId);
    return info;
};

module.exports = sendEmail;