import FormData from 'form-data';
import Mailgun from 'mailgun.js';

import { ApiError } from './apiError.ts';
import { fastify } from '../server.ts';

const emailTemplate = {
  confirmation: (name: string, token: string) => `
    <html>
      <body class="text-center">
        <h1>Congratulations ${name}!</h1>
        <p>You just registered on our platform. Please confirm your email address.</p>
        <p>Follow this link to confirm your email: <a href="${process.env.FRONT_URL}/confirm-email?token=${token}">Confirm Email</a></p>
      </body>
    </html>
  `,
  passwordReset: (name: string, token: string) => `
    <html>
      <body class="text-center">
        <h1>Password Reset Request</h1>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p><a href="${process.env.FRONT_URL}/reset-password?token=${token}">Reset Password</a></p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </body>
    </html>
  `,
}

export async function mailSender({ to, name, token, type = 'confirmation' }: { to: string; name: string; token: string; type: 'confirmation' | 'passwordReset' }) {
  const mailgun = new Mailgun(FormData);
  const emailDomain = process.env.EMAIL_DOMAIN;
  const key = process.env.EMAIL_API_KEY;

  if (!key) {
    fastify.log.error('API_KEY is not defined');
    throw ApiError.internal('API_KEY is not defined');
  }
  if (!emailDomain) {
    fastify.log.error('EMAIL_DOMAIN is not defined');
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
      html: emailTemplate[type](name, token),
    });

    fastify.log.info(`Email sent to ${to}: ${data.message}`);
  } catch (error) {
    fastify.log.error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : String(error)}`);
    throw ApiError.internal(error instanceof Error ? error.message : 'Failed to send email');
  }
}
