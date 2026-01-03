import type { FastifyInstance } from 'fastify';

import { UserController } from '../users/userController.js';
import { UserSchema } from '../validation/userSchema.ts';

export const userRoute = (fastify: FastifyInstance) => {
  const userController = new UserController();
  const userSchema = new UserSchema();

  fastify.post<{ Params: { id: string }; Body: { password: string } }>(
    '/user/:id/confirm-password',
    { schema: userSchema.confirmPassword() },
    async (request, reply) => {
      return userController.confirmPassword(request, reply);
    }
  );

  fastify.patch<{ Params: { id: string }; Body: { password: string } }>(
    '/user/:id/update-password',
    { schema: userSchema.updateUserPassword() },
    async (request, reply) => {
      return userController.updateUser(request, reply);
    }
  );

  fastify.patch<{ Params: { id: string }; Body: { name: string } }>(
    '/user/:id/update-name',
    { schema: userSchema.updateUserName() },
    async (request, reply) => {
      return userController.updateUser(request, reply);
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/user/:id',
    { schema: userSchema.deleteUser() },
    async (request, reply) => {
      return userController.deleteUser(request, reply);
    }
  );
};
