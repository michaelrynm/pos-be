import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/db';

export const areaConstantData = [
  {
    id: 'cc294e6e-1ae8-48d7-839b-0bfe94818ca2',
    name: 'OUTDOOR',
  },
  {
    id: '334dfd49-9873-4339-bbe3-c368e166f100',
    name: 'INDOOR',
  },
  {
    id: '88817201-5653-473d-83a6-e5bc4b91c1b8',
    name: 'SMOKING INDOOR',
  },
];

export async function seedAreas() {
  const db = drizzle({ connection: process.env.DATABASE_URL || '', schema });
  console.log('🌱 Seeding areas...');

  await db.insert(schema.areas).values(areaConstantData).onConflictDoNothing();

  console.log('✅ Areas seeded');
}
