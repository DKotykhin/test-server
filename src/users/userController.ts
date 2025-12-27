import type { FastifyReply, FastifyRequest } from 'fastify';
import ApiError from '../utils/apiError.ts';
import UserService from './userService.js';
import type { UserData } from './userTypes.ts';

class UserController {
  async getUser(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply) {
    try {
      const userId = req.params.id;
      const user = await UserService.getUserById(userId);
      if (user) {
        res.status(200).send(user);
      } else {
        throw ApiError.notFound('User not found');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createUser(req: FastifyRequest<{ Body: UserData }>, res: FastifyReply) {
    try {
      const userData = req.body;
      const newUser = await UserService.createUser(userData);
      res.status(201).send(newUser);
    } catch (error: any) {
      res.status(500).send({ message: error.message || 'Internal server error' });
    }
  }

  async updateUserEmailVerification(req: FastifyRequest<{ Params: { id: string }; Body: { isEmailVerified: boolean } }>, res: FastifyReply) {
    try {
      const userId = req.params.id;
      const { isEmailVerified } = req.body;
      const updatedUser = await UserService.updateUserEmailVerificationStatus(userId, isEmailVerified);
      res.status(200).send(updatedUser);
    } catch (error) {
      res.status(500).send({ message: 'Internal server error' });
    }
  }
}

export default UserController;
