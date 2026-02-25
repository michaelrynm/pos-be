import { relations } from 'drizzle-orm';
import { boolean, integer } from 'drizzle-orm/pg-core';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

// Example table - extend as needed for your POS system
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
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
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const areas = pgTable('areas', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customerTables = pgTable('customer_tables', {
  id: varchar('id').primaryKey(),
  areaId: varchar('area_id')
    .notNull()
    .references(() => areas.id),
  tableNumber: varchar('table_number').notNull(),
  qrUrl: varchar('qr_url'),
  isActive: boolean('is_active').default(false).notNull(),
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

export const areasRelations = relations(areas, ({ many }) => ({
  tables: many(customerTables),
}));

export const customerTablesRelations = relations(customerTables, ({ one }) => ({
  area: one(areas, {
    fields: [customerTables.areaId],
    references: [areas.id],
  }),
}));
