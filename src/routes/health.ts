import type { FastifyInstance } from 'fastify';

export const healthRoute = async (fastify: FastifyInstance) => {
  fastify.get('/health', function healthHandler() {
    return { status: 'ok' };
  });
};