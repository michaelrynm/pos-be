import { Controller, Get } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { GetActiveProductResponseDto } from './dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async getActiveProduct(): Promise<GetActiveProductResponseDto[]> {
    return await this.customerService.findActiveProducts();
  }
}
