import type { FastifyInstance } from 'fastify';

import UserController from '../users/userController.js';
import type { UserCreate } from '../users/userTypes.ts';

export const userRoute = async (fastify: FastifyInstance) => {
  const userController = new UserController();

  fastify.get(
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
    async (req: any, res: any) => {
      return userController.getUser(req, res);
    }
  );

  fastify.post<{ Body: UserCreate }>(
    '/user/create',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            avatarUrl: { type: 'string', format: 'uri' },
            role: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      return userController.createUser(req, reply);
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
        },
      },
    },
    async (request, reply) => {
    return userController.updateUser(request, reply);
  });
};
