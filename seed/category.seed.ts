import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/db';

export const categoryConstantData = [
  {
    id: 'ce9a4406-911d-4a72-85c7-33317bb7a2f6',
    name: 'Coffee',
    parentId: null,
  },
  {
    id: '1ca599ba-ff18-4574-a0d7-5f8b02ba8acf',
    name: 'Non Coffee',
    parentId: null,
  },
];

export const subCategoryConstantData = [
  {
    id: '1d98acb7-c24c-45de-bfde-9d1729a829f0',
    name: 'Latte',
    parentId: categoryConstantData[0].id,
  },
  {
    id: 'd54d6448-ff56-42f7-b942-9232528a7740',
    name: 'Espresso',
    parentId: categoryConstantData[0].id,
  },
  {
    id: '7d03af95-35e1-4b66-9f75-d9a798a435ba',
    name: 'Tea',
    parentId: categoryConstantData[1].id,
  },
  {
    id: '35da0fb7-86b9-4ed8-936e-799a4a3918c4',
    name: 'Chocolate',
    parentId: categoryConstantData[1].id,
  },
];

export async function seedCategories() {
  const db = drizzle({ connection: process.env.DATABASE_URL || '', schema });
  console.log('🌱 Seeding categories...');

  await db
    .insert(schema.categories)
    .values(categoryConstantData)
    .onConflictDoNothing();
  await db
    .insert(schema.categories)
    .values(subCategoryConstantData)
    .onConflictDoNothing();

  console.log('✅ Categories seeded');
}
