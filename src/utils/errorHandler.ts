import ApiError from './apiError.ts';

export function errorHandler(error: any, res: any) {
  if (error instanceof ApiError) {
    res.status(error.statusCode).send({ message: error.message });
  } else {
    res.status(500).send({ message: 'Internal server error' });
  }
}