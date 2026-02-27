import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { categories } from './category';

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

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));
