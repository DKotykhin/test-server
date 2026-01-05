import { boolean, pgTable, varchar, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

export const languages = ['EN', 'UA', 'RU'] as const;

// Menu categories table definition
export const menuCategoriesTable = pgTable('menu_categories', {
  id: uuid().primaryKey().defaultRandom(),
  language: varchar({ enum: languages }).notNull().default('EN'),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1024 }),
  isAvailable: boolean('is_available').notNull().default(true),
  position: integer().notNull().default(0),
  imageUrl: varchar('image_url', { length: 512 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type MenuCategory = InferSelectModel<typeof menuCategoriesTable>;
export type NewMenuCategory = InferInsertModel<typeof menuCategoriesTable>;

// Menu items table definition
export const menuItemsTable = pgTable('menu_items', {
  id: uuid().primaryKey().defaultRandom(),
  language: varchar({ enum: languages }).notNull().default('EN'),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1024 }),
  price: varchar({ length: 50 }).notNull(),
  imageUrl: varchar('image_url', { length: 512 }),
  isAvailable: boolean('is_available').notNull().default(true),
  position: integer().notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  categoryId: uuid('category_id').notNull().references(() => menuCategoriesTable.id, { onDelete: 'cascade' }),
});

export type MenuItem = InferSelectModel<typeof menuItemsTable>;
export type NewMenuItem = InferInsertModel<typeof menuItemsTable>;

// Define relations - one-to-many between categories and items
export const menuCategoryRelations = relations(menuCategoriesTable, ({ many }) => ({
  items: many(menuItemsTable),
}));

export const menuItemRelations = relations(menuItemsTable, ({ one }) => ({
  category: one(menuCategoriesTable, {
    fields: [menuItemsTable.categoryId],
    references: [menuCategoriesTable.id],
  }),
}));

export type MenuCategoryWithItems = MenuCategory & {
  items: MenuItem[];
};
export type MenuItemWithCategory = MenuItem & {
  category: MenuCategory;
};