import type { FastifyReply, FastifyRequest } from 'fastify';

import { fastify } from '../server.ts';
import { ApiError } from '../utils/apiError.ts';
import { UserService } from './userService.js';
import type { UserUpdate } from './userTypes.ts';

class UserController {
  async confirmPassword(req: FastifyRequest<{ Params: { id: string }; Body: { password: string } }>, res: FastifyReply) {
    try {
      const userId = req.params.id;
      const { password } = req.body;
      const isMatch = await UserService.confirmPassword(userId, password);
      res.status(200).send({ isMatch });
    } catch (error) {
      fastify.log.error(`ConfirmPassword Error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async updatePassword(req: FastifyRequest<{ Params: { id: string }; Body: { password: string } }>, res: FastifyReply) {
    try {
      const userId = req.params.id;
      const { password } = req.body;
      await UserService.updateUser(userId, { password });
      res.status(200).send({ message: 'Password updated successfully' });
    } catch (error) {
      fastify.log.error(`UpdatePassword Error: ${error instanceof Error ? error.message : String(error)}`);
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
      fastify.log.error(`UpdateUser Error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async deleteUser(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply) {
    try {
      const userId = req.params.id;
      const deleteResult = await UserService.deleteUser(userId);
      // console.log('Delete result:', deleteResult);
      if (deleteResult.rowCount === 0) {
        throw ApiError.notFound('User not found');
      }
      res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
      fastify.log.error(`DeleteUser Error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export { UserController };
