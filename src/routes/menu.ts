import type { FastifyInstance } from 'fastify';

import { MenuController } from '../menu/menuController.ts';
import { MenuSchema } from '../validation/menuSchema.ts';

type MenuQuerystring = {
  language: 'EN' | 'UA' | 'RU';
};

export const menuRoute = async (fastify: FastifyInstance) => {
  const menuController = new MenuController();
  const menuSchema = new MenuSchema();

  fastify.get<{ Querystring: MenuQuerystring }>(
    '/menu',
    { schema: menuSchema.getMenuByLanguage() },
    async (req) => {
      return menuController.getMenuByLanguage(req);
    }
  );
};