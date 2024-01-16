/* eslint-disable prettier/prettier */
import sgMail = require('@sendgrid/mail');

export async function sendEmail(to: string, subject: string, content: string): Promise<void> {
    try {
      const msg = {
        to,
        from: 'LaundaryApp <ahsansaleem@esparkconsultants.com>',
        subject,
        text: content,
        html: `<p>${content}</p>`,
      };

      await sgMail.send(msg);
    } catch (error) {
      throw new Error('Failed to send emaiil');
    }
  }