import type { FastifyReply, FastifyRequest } from 'fastify';

import { ApiError } from '../utils/apiError.ts';
import { AuthService } from './authService.ts';

class AuthController {
  async getUserById(req: FastifyRequest, res: FastifyReply) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw ApiError.unauthorized('Unauthorized');
      }
      const user = await AuthService.getUserById(userId);
      if (user && user?.isEmailVerified === false) {
        throw ApiError.forbidden('Email not verified');
      }
      if (user) {
        res.status(200).send(user);
      } else {
        throw ApiError.notFound('User not found');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async signUp(req: FastifyRequest<{ Body: { name: string; email: string; password: string } }>, res: FastifyReply) {
    try {
      const { name, email, password } = req.body;
      await AuthService.signUp({ name, email, password });
      res.status(201).send({ message: 'User registered successfully. Please check your email to verify your account.' });
    } catch (error: any) {
      throw error;
    }
  }

  async verifyEmail(req: FastifyRequest<{ Querystring: { token: string } }>, res: FastifyReply) {
    try {
      const { token } = req.query;
      await AuthService.verifyEmail(token);
      res.status(200).send({ message: 'Email verified successfully' });
    } catch (error: any) {
      throw error;
    }
  }

  async signIn(req: FastifyRequest<{ Body: { email: string; password: string } }>) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.signIn(email, password);
      if (user && user?.isEmailVerified === false) {
        throw ApiError.forbidden('Email not verified');
      }

      return user;
    } catch (error: any) {
      throw error;
    }
  }
}

export { AuthController };
