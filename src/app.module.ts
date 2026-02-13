import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './db/drizzle.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [DrizzleModule, CustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
