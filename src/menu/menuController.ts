import type { FastifyRequest } from 'fastify';

import { fastify } from '../server.ts';
import type { languages } from '../db/schema/menu.ts';
import { MenuService } from './menuService.ts';

class MenuController {
  async getMenuByLanguage(req: FastifyRequest<{ Querystring: { language: (typeof languages)[number] } }>) {
    try {
      const { language } = req.query;
      const menu = await MenuService.getMenuByLanguage(language);
      return menu;
    } catch (error: any) {
      fastify.log.error(`GetMenuByLanguage Error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export { MenuController };
