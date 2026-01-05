import Fastify, { type FastifyInstance } from 'fastify';
import { drizzle } from 'drizzle-orm/node-postgres';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import fastifyEnv from '@fastify/env';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

//routes
import { healthRoute } from './routes/health.ts';
import { authRoute } from './routes/auth.ts';
import { userRoute } from './routes/user.ts';

// other imports
import { loggerConfig } from './configs.ts';
import { errorHandler } from './utils/errorHandler.ts';

// Define environment variables schema
const schema = {
  type: 'object',
  required: ['DB_URL', 'JWT_SECRET', 'EMAIL_API_KEY', 'EMAIL_DOMAIN'],
  properties: {
    DB_URL: { type: 'string' },
    JWT_SECRET: { type: 'string' },
    EMAIL_API_KEY: { type: 'string' },
    EMAIL_DOMAIN: { type: 'string' },
    JWT_EXPIRES_IN: { type: 'string', default: '1d' },
    PORT: { type: 'string', default: '4004' },
    NODE_ENV: { type: 'string', default: 'development' },
    FRONT_URL: { type: 'string', default: 'http://localhost:3000' },
  },
} as const;

// register fastify-env plugin
await Fastify().register(fastifyEnv, {
  schema,
  dotenv: true,
  data: process.env,
});

export const ENVIRONMENTS = ['development', 'production', 'test'];
const PORT = process.env.PORT || 4004;
const NODE_ENV: (typeof ENVIRONMENTS)[number] = ENVIRONMENTS.includes(process.env.NODE_ENV || '')
  ? (process.env.NODE_ENV as (typeof ENVIRONMENTS)[number])
  : 'development';

// Initialize Postgres connection
export const db = drizzle(process.env.DB_URL!);

// Create Fastify instance
export const fastify: FastifyInstance = Fastify({
  logger: loggerConfig[NODE_ENV as keyof typeof loggerConfig] ?? true,
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
      title: 'My Test API',
      description: 'Fastify Swagger API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
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
fastify.register(authRoute);
fastify.register(userRoute);

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
