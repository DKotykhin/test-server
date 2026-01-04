import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { AuthSchema } from '../validation/authSchema.ts';
import { AuthController } from '../auth/authController.ts';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string | null;
  }
  interface FastifyInstance {
    verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<unknown> | unknown;
  }
}

export const authRoute = async (fastify: FastifyInstance) => {
  const authController = new AuthController();
  const authSchema = new AuthSchema();

  fastify.decorate('verifyAuth', async (request: FastifyRequest, reply) => {
    try {
      // await request.jwtVerify();
      const token = request.headers['authorization'];
      if (!token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      const decoded = fastify.jwt.verify(token.replace('Bearer ', '')) as { userId: string };
      request.userId = decoded.userId;
      return;
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.get(
    '/auth/me',
    { schema: authSchema.getCurrentUser(), preHandler: fastify.verifyAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {      
      return await authController.getUserById(request, reply);
    }
  );

  fastify.post(
    '/auth/sign-up',
    { schema: authSchema.signUp() },
    async (request: FastifyRequest<{ Body: { name: string; email: string; password: string } }>, reply: FastifyReply) => {
      await authController.signUp(request, reply);
    }
  );

  fastify.get(
    '/auth/verify-email',
    { schema: authSchema.verifyEmail() },
    async (request: FastifyRequest<{ Querystring: { token: string } }>, reply: FastifyReply) => {
      await authController.verifyEmail(request, reply);
    }
  );

  fastify.post(
    '/auth/sign-in',
    { schema: authSchema.signIn() },
    async (request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) => {
      const user = await authController.signIn(request);
      const token = fastify.jwt.sign({ userId: user?.id });
      reply.status(200).setCookie('token', token, { httpOnly: true }).send({ token });
    }
  );

  fastify.post(
    '/auth/resend-verification-email',
    { schema: authSchema.resendVerificationEmail() },
    async (request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) => {
      await authController.resendVerificationEmail(request, reply);
    }
  );
};