import FormData from 'form-data';
import Mailgun from 'mailgun.js';

import { ApiError } from './apiError.ts';
import { fastify } from '../server.ts';

export async function mailSender({ to, name, token }: { to: string; name: string; token: string }) {
  const mailgun = new Mailgun(FormData);
  const emailDomain = process.env.EMAIL_DOMAIN;
  const key = process.env.EMAIL_API_KEY;

  if (!key) {
    throw ApiError.internal('API_KEY is not defined');
  }
  if (!emailDomain) {
    throw ApiError.internal('EMAIL_DOMAIN is not defined');
  }

  const mg = mailgun.client({
    username: 'api',
    key,
  });
  try {
    const data = await mg.messages.create(emailDomain, {
      from: 'Luckycat <info@luckycat.pp.ua>',
      to: [`${name} <${to}>`],
      subject: `Hello ${name}`,
      html: `
        <html>
          <body class="text-center">
            <h1>Congratulations ${name}!</h1>
            <p>You just registered on our platform. Please confirm your email address.</p>
            <p>Follow this link to confirm your email: <a href="${process.env.FRONT_URL}/confirm-email?token=${token}">Confirm Email</a></p>
          </body>
        </html>
      `,
    });

    fastify.log.info(`Email sent to ${to}: ${data.message}`);
  } catch (error) {
    throw ApiError.internal(error instanceof Error ? error.message : 'Failed to send email');
  }
}
