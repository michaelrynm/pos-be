import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';

const drizzleProvider = {
  provide: DRIZZLE,
  useFactory: () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    return drizzle(pool, { schema });
  },
};

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
