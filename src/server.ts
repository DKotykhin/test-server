import Fastify, { type FastifyInstance } from 'fastify';
import { drizzle } from 'drizzle-orm/node-postgres';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';

//routes
import { healthRoute } from './routes/health.ts';
import { userRoute } from './routes/user.ts';
import { authRoute } from './routes/auth.ts';

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
  ajv: {
    customOptions: {
      allErrors: true,
      removeAdditional: false,
    },
  },
});

// check db connection
fastify.addHook('onReady', async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error('DB_URL is not defined in environment variables');
    }
    await db.execute(`SELECT 1`);
    fastify.log.info('Database connection established successfully.');
  } catch (error) {
    fastify.log.error(error instanceof Error ? error.message : 'Failed to connect to the database');
    process.exit(1);
  }
});

// Register cookie plugin
await fastify.register(cookie);

// Register JWT plugin
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET!,
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});

// Register Swagger for API documentation
await fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'My API',
      description: 'Fastify Swagger API',
      version: '1.0.0',
    },
  },
});

// Swagger UI
await fastify.register(fastifySwaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
});

//Register routes
fastify.register(healthRoute);
fastify.register(userRoute);
fastify.register(authRoute);

//Global error handler
fastify.register(async (instance) => {
  instance.setErrorHandler((error, res) => {
    errorHandler(error, res);
    fastify.log.error(`Global Error Handler: ${error instanceof Error ? error.message : String(error)}`);
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
