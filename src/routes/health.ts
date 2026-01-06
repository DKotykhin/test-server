import type { FastifyInstance } from 'fastify';
import { ApiError } from '../utils/apiError.ts';

export const healthRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    '/health/app',
    {
      schema: {
        summary: 'Health Check',
        description: 'Check the health status of the API',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
            },
          },
        },
      },
    },
    function healthHandler() {
      return { status: 'ok' };
    }
  );
  // fastify.route({
  //   method: 'GET',
  //   url: '/health',
  //   schema: {
  //     summary: 'Health Check',
  //     description: 'Check the health status of the API',
  //     tags: ['Health'],
  //     response: {
  //       200: {
  //         type: 'object',
  //         properties: {
  //           status: { type: 'string' },
  //         },
  //       },
  //     },
  //   },
  //   handler: function healthHandler() {
  //     return { status: 'ok' };
  //   },
  // });
  fastify.get(
    '/health/redis',
    {
      schema: {
        summary: 'Redis Health Check',
        description: 'Check the health status of the Redis connection',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async function redisHealthHandler() {
      try {
        const client = fastify.redis;
        await client.ping();
        return { status: 'ok' };
      } catch (error) {
        fastify.log.error(error, 'Redis health check failed');
        throw ApiError.internal('Redis connection failed');
      }
    }
  )
};
