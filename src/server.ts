import Fastify, { type FastifyInstance } from 'fastify';
import { loggerConfig } from './configs.js';

import 'dotenv/config';

const PORT = process.env.PORT || 4004;
// const NODE_ENV: 'development' | 'production' | 'test' = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
const NODE_ENV: 'development' | 'production' | 'test' = ['development', 'production', 'test'].includes(process.env.NODE_ENV || '')
  ? (process.env.NODE_ENV as 'development' | 'production' | 'test')
  : 'development';

// Create Fastify instance
const fastify: FastifyInstance = Fastify({
  logger: loggerConfig[NODE_ENV] ?? true,
});

// Declare a route
fastify.get('/', async function handler() {
  return { hello: 'world' };
});

// health check route
fastify.get('/health', async function healthHandler() {
  return { status: 'ok' };
});

//Run the server!
try {
  await fastify.listen({ port: Number(PORT) });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
export async function createServer(): Promise<FastifyInstance> {
  return fastify;
}
