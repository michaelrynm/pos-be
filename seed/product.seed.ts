import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/db';
import { subCategoryConstantData } from './category.seed';

export async function seedProducts() {
  const db = drizzle({ connection: process.env.DATABASE_URL || '', schema });
  console.log('🌱 Seeding products...');

  const productConstantData = [
    // ☕ LATTE SERIES (Typical price: 30k - 40k)
    {
      id: 'fbb41e30-df22-47ba-93cb-83a48c1da205',
      categoryId: subCategoryConstantData[0].id,
      name: 'Cafe Latte',
      description: 'Espresso with steamed milk',
      basePrice: 32000, // Rp 32.000
      thumbnail: '/images/products/cafe-latte.png',
      isActive: true,
    },
    {
      id: '8166cc04-ce31-41f6-86da-693e57f70e25',
      categoryId: subCategoryConstantData[0].id,
      name: 'Caramel Latte',
      description: 'Latte with caramel syrup',
      basePrice: 38000, // Rp 38.000
      thumbnail: '/images/products/caramel-latte.png',
      isActive: true,
    },
    {
      id: '6c689b8c-63e6-4986-8ed6-46f8f67445ef',
      categoryId: subCategoryConstantData[0].id,
      name: 'Vanilla Latte',
      description: 'Latte with vanilla syrup',
      basePrice: 38000,
      thumbnail: '/images/products/vanilla-latte.png',
      isActive: true,
    },

    // ☕ ESPRESSO (Typical price: 20k - 30k)
    {
      id: '23c97134-a559-42bd-87b7-70ab84b9f6c5',
      categoryId: subCategoryConstantData[1].id,
      name: 'Americano',
      description: 'Espresso diluted with hot water',
      basePrice: 25000,
      thumbnail: '/images/products/americano.png',
      isActive: true,
    },
    {
      id: '0f8e9653-181a-4431-af7c-b3fa12d105eb',
      categoryId: subCategoryConstantData[1].id,
      name: 'Cappuccino',
      description: 'Espresso with steamed milk foam',
      basePrice: 32000,
      thumbnail: '/images/products/cappuccino.png',
      isActive: true,
    },
    {
      id: '76884024-a24b-414e-beb9-97b9544b7977',
      categoryId: subCategoryConstantData[1].id,
      name: 'Double Espresso',
      description: 'Two shots of espresso',
      basePrice: 28000,
      thumbnail: '/images/products/double-espresso.png',
      isActive: true,
    },

    // 🍵 TEA (Typical price: 15k - 25k)
    {
      id: '3a2ba84c-33d5-4200-97ad-801d933325ee',
      categoryId: subCategoryConstantData[2].id,
      name: 'Iced Tea',
      description: 'Fresh brewed iced tea',
      basePrice: 18000,
      thumbnail: '/images/products/iced-tea.png',
      isActive: true,
    },
    {
      id: '57128056-f97d-49b3-bbd9-bd0f5583c56b',
      categoryId: subCategoryConstantData[2].id,
      name: 'Lemon Tea',
      description: 'Tea with fresh lemon',
      basePrice: 22000,
      thumbnail: '/images/products/lemon-tea.png',
      isActive: true,
    },

    // 🍫 CHOCOLATE (Typical price: 30k - 40k)
    {
      id: 'b8761f50-18a8-4b4f-9969-7f911abb047d',
      categoryId: subCategoryConstantData[3].id,
      name: 'Hot Chocolate',
      description: 'Rich chocolate drink',
      basePrice: 35000,
      thumbnail: '/images/products/hot-chocolate.png',
      isActive: true,
    },
    {
      id: '94c2496b-ef79-4012-9a02-1f84e08e8558',
      categoryId: subCategoryConstantData[3].id,
      name: 'Iced Chocolate',
      description: 'Cold chocolate beverage',
      basePrice: 38000,
      thumbnail: '/images/products/iced-chocolate.png',
      isActive: true,
    },
  ];

  await db
    .insert(schema.products)
    .values(productConstantData)
    .onConflictDoNothing();

  console.log('✅ Products seeded');
}
