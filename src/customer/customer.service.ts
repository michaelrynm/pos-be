import { Inject, Injectable } from '@nestjs/common';
import { eq, ilike } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE, categories, products } from '../db';
import * as schema from '../db';
import { GetActiveProductResponseDto, GetCategoryTreeResponseDto } from './dto';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(DRIZZLE)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async findActiveProducts(): Promise<GetActiveProductResponseDto[]> {
    const query = await this.db.query.products.findMany({
      with: { category: true },
      where: eq(products.isActive, true),
    });

    for (const product of query) {
      if (product.category.parentId) {
        const parentCategory = await this.db.query.categories.findFirst({
          where: eq(categories.id, product.category.parentId),
        });

        if (parentCategory) {
          product.category.name = `${parentCategory.name} > ${product.category.name}`;
        }
      }
    }

    return query.map(
      ({ name, category, description, thumbnail, basePrice }) => ({
        category: category.name,
        name: name,
        description: description ?? '-',
        thumbnail: thumbnail ?? '-',
        basePrice,
      }),
    );
  }

  async searchProducts(searchTerm: string) {
    const query = await this.db
      .select()
      .from(products)
      .rightJoin(categories, eq(categories.id, products.categoryId))
      .where(ilike(products.name, `%${searchTerm}%`))
      .limit(5);

    for (const product of query) {
      if (product.categories.parentId) {
        const parentCategory = await this.db.query.categories.findFirst({
          where: eq(categories.id, product.categories.parentId),
        });

        if (parentCategory) {
          product.categories.name = `${parentCategory.name} > ${product.categories.name}`;
        }
      }
    }

    const mappedData = query.map((product) => {
      const { name } = product.categories;
      return {
        ...product.products,
        category: name,
      };
    });

    return mappedData.map(
      ({ name, category, description, thumbnail, basePrice }) => ({
        category,
        name: name ?? '-',
        description: description ?? '-',
        thumbnail: thumbnail ?? '-',
        basePrice: basePrice ?? 0,
      }),
    );
  }

  async findCategoryTree(): Promise<GetCategoryTreeResponseDto[]> {
    const categories = await this.db.query.categories.findMany();

    const roots = categories.filter((cat) => cat.parentId === null);

    return roots.map((root) => ({
      ...root,
      children: categories.filter((cat) => cat.parentId === root.id),
    }));
  }
}
