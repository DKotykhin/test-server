import { asc, eq } from 'drizzle-orm';

import { db, fastify } from '../server.js';
import { ApiError } from '../utils/_index.ts';
import { menuCategoriesTable, languages, menuItemsTable } from '../db/schema/menu.ts';

class MenuService {
  static async getMenuByLanguage(language: (typeof languages)[number] = 'EN') {
    const cachedMenu = await fastify.redis.get(`menu:${language}`);
    if (cachedMenu) {
      return JSON.parse(cachedMenu);
    }
    
    const menu = await db
      .select()
      .from(menuCategoriesTable)
      .where(eq(menuCategoriesTable.language, language))
      .orderBy(asc(menuCategoriesTable.position), asc(menuItemsTable.position))
      .leftJoin(menuItemsTable, eq(menuItemsTable.categoryId, menuCategoriesTable.id));
    if (!menu || menu.length === 0) {
      throw new ApiError(404, `Menu not found for language: ${language}`);
    }
    const map = new Map();

    for (const row of menu) {
      const category = row.menu_categories;
      const item = row.menu_items;

      if (!map.has(category.id)) {
        map.set(category.id, {
          ...category,
          items: [],
        });
      }

      if (item) {
        map.get(category.id).items.push(item);
      }
    }

    const menuList = Array.from(map.values());

    await fastify.redis.set(`menu:${language}`, JSON.stringify(menuList), 'EX', 1 * 60); // Cache for 1 minute

    return menuList;
  }
}

export { MenuService };
