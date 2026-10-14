import { Resend } from 'resend';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export async function POST(request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = (process.env.ADMIN_EMAIL || 'support@superstartravelcabs.com').trim();
    const fromAddress = (process.env.EMAIL_FROM || process.env.RESEND_FROM || 'onboarding@resend.dev').trim();

    if (!apiKey) {
      return Response.json(
        { error: 'Email service is not configured. Please set RESEND_API_KEY in your environment.' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const body = await request.json();
    const { firstName, lastName, email, phone, subject, message } = body;

    // Basic validation
    if (!firstName || !email || !message) {
      return Response.json(
        { error: 'First name, email and message are required.' },
        { status: 400 }
      );
    }

    if (!isEmail(email) || !isEmail(adminEmail)) {
      return Response.json(
        { error: 'Invalid email address configured for sending.' },
        { status: 500 }
      );
    }

    const subjectLabels = {
      booking: 'New Booking',
      quote: 'Request a Quote',
      modify: 'Modify Existing Booking',
      cancel: 'Cancellation',
      other: 'General Enquiry',
    };
    const subjectLabel = subjectLabels[subject] || subject || 'Contact Form';

    await resend.emails.send({
      from: `Super Star Travel <${fromAddress}>`,
      to: adminEmail,
      replyTo: email,
      subject: `[${subjectLabel}] New message from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden;">
          <div style="background: #0a1f44; padding: 28px 32px;">
            <h1 style="color: #f97316; font-size: 22px; margin: 0;">Super Star Travel</h1>
            <p style="color: rgba(245,240,232,0.6); font-size: 13px; margin: 6px 0 0;">New contact form submission</p>
          </div>
          <div style="padding: 32px; background: #ffffff;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; color: #888; width: 140px; vertical-align: top;">Name</td>
                <td style="padding: 10px 0; color: #111; font-weight: 600;">${firstName} ${lastName}</td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; vertical-align: top;">Email</td>
                <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #0a1f44;">${email}</a></td>
              </tr>
              ${phone ? `
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; vertical-align: top;">Phone / WhatsApp</td>
                <td style="padding: 10px 0; color: #111;">${phone}</td>
              </tr>` : ''}
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; vertical-align: top;">Subject</td>
                <td style="padding: 10px 0; color: #111;">${subjectLabel}</td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; color: #111; line-height: 1.6; white-space: pre-wrap;">${message}</td>
              </tr>
            </table>
          </div>
          <div style="padding: 20px 32px; background: #f5f0e8; text-align: center;">
            <a href="mailto:${email}" style="display: inline-block; background: #f97316; color: #080808; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">Reply to ${firstName}</a>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}