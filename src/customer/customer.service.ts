import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../db';
import * as schema from '../db';
import { GetActiveProductResponseDto } from './dto';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(DRIZZLE)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async findActiveProducts(): Promise<GetActiveProductResponseDto[]> {
    const query = await this.db.query.products.findMany({
      with: { category: true },
      where: eq(schema.products.isActive, true),
    });

    const result = query.map(
      ({ name, category, description, thumbnail, basePrice }) => ({
        category: category.name,
        name: name,
        description: description ?? '-',
        thumbnail: thumbnail ?? '-',
        basePrice,
      }),
    );

    return result;
  }
}
