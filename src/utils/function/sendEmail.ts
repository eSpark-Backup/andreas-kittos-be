import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';
const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;

const mailgun = new Mailgun(FormData);
const client = mailgun.client({ username: 'api', key: API_KEY });

export async function sendEmail(
  to: string,
  subject: string,
  content: string,
): Promise<void> {
  try {
    const msg = {
      to,
      from: 'LaundaryApp <mailto:postmaster@sandboxc2ce3df94d4c477484836ef87cca6e4e.mailgun.org>',
      subject,
      text: content,
    };

    await client.messages.create(DOMAIN, msg);
    console.log('Email sent');
  } catch (error) {
    throw new Error('Failed to send emaiil');
  }
}
