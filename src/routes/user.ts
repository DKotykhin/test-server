import type { FastifyInstance } from 'fastify';

import { UserController } from '../users/userController.js';
import { UserSchema } from '../validation/userSchema.ts';
import type { UserCreate } from '../users/userTypes.ts';

export const userRoute = async (fastify: FastifyInstance) => {
  const userController = new UserController();
  const userSchema = new UserSchema();

  fastify.get<{ Params: { id: string } }>(
    '/user/:id',
    { schema: userSchema.getUserById() },
    async (request, reply) => {
      return userController.getUser(request, reply);
    }
  );

  fastify.post<{ Body: UserCreate }>(
    '/user/create',
    { schema: userSchema.createUser() },
    async (request, reply) => {
      return userController.createUser(request, reply);
    }
  );

  fastify.post<{ Params: { id: string }; Body: { password: string } }>(
    '/user/:id/confirm-password',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            password: { type: 'string' },
          },
          required: ['password'],
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      return userController.confirmPassword(request, reply);
    }
  );

  fastify.post<{ Params: { id: string }; Body: { newPassword: string } }>(
    '/user/:id/update-password',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            newPassword: { type: 'string', minLength: 6 },
          },
          required: ['newPassword'],
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      return userController.updatePassword(request, reply);
    }
  );

  fastify.patch<{ Params: { id: string }; Body: { isEmailVerified: boolean } }>(
    '/user/:id/verify-email',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            isEmailVerified: { type: 'boolean' },
          },
          required: ['isEmailVerified'],
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
    return userController.updateUser(request, reply);
  });

   fastify.patch<{ Params: { id: string }; Body: { name: string } }>(
    '/user/:id/update-name',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      return userController.updateUser(request, reply);
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/user/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      return userController.deleteUser(request, reply);
    }
  );
};
