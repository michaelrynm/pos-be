import { relations } from 'drizzle-orm';
import { boolean, integer } from 'drizzle-orm/pg-core';
import { pgTable, timestamp, varchar, uuid } from 'drizzle-orm/pg-core';

// Example table - extend as needed for your POS system
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull(),
  username: varchar('username').notNull().unique(),
  password: varchar('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  parentId: varchar('parent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: varchar('id').primaryKey(),
  categoryId: varchar('category_id')
    .notNull()
    .references(() => categories.id),
  name: varchar('name').notNull(),
  description: varchar('description'),
  basePrice: integer('base_price').notNull(),
  thumbnail: varchar('thumbnail'),
  isActive: boolean('is_active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));
