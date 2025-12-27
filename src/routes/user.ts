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
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            avatarUrl: { type: 'string', format: 'uri' },
          },
          required: ['name', 'email', 'password'],
          additionalProperties: false
        },
      },
    },
    async (req, reply) => {
      return userController.createUser(req, reply);
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

  fastify.delete(
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
      return userController.deleteUser(req, res);
    }
  );
};
