import type { FastifyInstance } from 'fastify';

export const healthRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    '/health',
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
};
