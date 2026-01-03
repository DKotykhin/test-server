import { fastify } from '../server.ts';
import { ApiError } from './apiError.ts';

export function errorHandler(error: any, res: any) {
  if (error instanceof ApiError) {
    fastify.log.error(`API Error: ${error.message}`);
    res.status(error.statusCode).send({ message: error.message });
  } else {
    fastify.log.error(`Unexpected Error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).send({ message: 'Internal server error' });
  }
}