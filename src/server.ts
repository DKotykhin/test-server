import Fastify, { type FastifyInstance } from 'fastify';
import { drizzle } from 'drizzle-orm/node-postgres';

//routes
import { healthRoute } from './routes/health.ts';
import { userRoute } from './routes/user.ts';
import { loggerConfig } from './configs.ts';

import { errorHandler } from './utils/errorHandler.ts';

import 'dotenv/config';

const PORT = process.env.PORT || 4004;
const NODE_ENV: 'development' | 'production' | 'test' = ['development', 'production', 'test'].includes(process.env.NODE_ENV || '')
  ? (process.env.NODE_ENV as 'development' | 'production' | 'test')
  : 'development';

// Initialize Postgres connection
export const db = drizzle(process.env.DB_URL!);

// Create Fastify instance
export const fastify: FastifyInstance = Fastify({
  logger: loggerConfig[NODE_ENV] ?? true,
  disableRequestLogging: NODE_ENV === 'development',
});

//Register routes
fastify.register(healthRoute);
fastify.register(userRoute);

//Global error handler
fastify.register(async (instance) => {
  instance.setErrorHandler((error, res) => {
    errorHandler(error, res);
  });
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
