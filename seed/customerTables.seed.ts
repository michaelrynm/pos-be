import { drizzle } from 'drizzle-orm/node-postgres';
import { areaConstantData } from './area.seed';
import * as schema from '../src/db';

export const customerTableConstantData = [
  {
    id: 'd610baf4-579a-4258-9a8c-2dd021a21b99',
    areaId: areaConstantData[0].id,
    tableNumber: '1',
    qrUrl: null,
    isActive: false,
  },
  {
    id: 'f0353f48-acc5-4181-906f-bef3fefc5024',
    areaId: areaConstantData[1].id,
    tableNumber: '2',
    qrUrl: null,
    isActive: false,
  },
  {
    id: 'b2800af5-fb35-47e4-98e9-caa88fcb45a7',
    areaId: areaConstantData[2].id,
    tableNumber: '3',
    qrUrl: null,
    isActive: false,
  },
];

export async function seedCustomerTables() {
  const db = drizzle({ connection: process.env.DATABASE_URL || '', schema });
  console.log('🌱 Seeding customer tables...');

  await db
    .insert(schema.customerTables)
    .values(customerTableConstantData)
    .onConflictDoNothing();

  console.log('✅ Customer tables seeded');
}
