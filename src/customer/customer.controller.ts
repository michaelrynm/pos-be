import { Controller, Get, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { GetActiveProductResponseDto, GetCategoryTreeResponseDto } from './dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async getActiveProduct(): Promise<GetActiveProductResponseDto[]> {
    return await this.customerService.findActiveProducts();
  }

  @Get('search')
  async search(
    @Query('q') query: string,
  ): Promise<GetActiveProductResponseDto[]> {
    return await this.customerService.searchProducts(query);
  }

  @Get('/category')
  async getCategoryTree(): Promise<GetCategoryTreeResponseDto[]> {
    return await this.customerService.findCategoryTree();
  }
}
