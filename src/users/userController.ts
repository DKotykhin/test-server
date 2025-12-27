import type { FastifyReply, FastifyRequest } from 'fastify';

import ApiError from '../utils/apiError.ts';
import UserService from './userService.js';
import type { UserCreate, UserUpdate } from './userTypes.ts';

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

  async createUser(req: FastifyRequest<{ Body: UserCreate }>, res: FastifyReply) {
    try {
      const userData = req.body;
      const newUser = await UserService.createUser(userData);
      res.status(201).send(newUser);
    } catch (error: any) {
      throw error;
    }
  }

  async updateUser(req: FastifyRequest<{ Params: { id: string }; Body: UserUpdate }>, res: FastifyReply) {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const updatedUser = await UserService.updateUser(userId, updateData);
      if (!updatedUser) {
        throw ApiError.notFound('User not found');
      }
      res.status(200).send(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply) {
    try {
      const userId = req.params.id;
      const deleteResult = await UserService.deleteUser(userId);
      if (deleteResult.rowCount === 0) {
        throw ApiError.notFound('User not found');
      }
      res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
      throw error;
    }
  }
}

export default UserController;
