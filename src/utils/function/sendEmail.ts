

import sgMail = require('@sendgrid/mail');
const email = process.env.SENDGRID_EMAIL;

export async function sendEmail(
  to: string,
  subject: string,
  content: string,
): Promise<void> {
  try {
    const msg = {
      to,
      from: `MPOUGADA LAUNDRY<${email}>`,
      subject,
      text: content,
      html: content,
    };

    await sgMail.send(msg);
  } catch (error) {
    throw new Error('Failed to send email');
  }
}
