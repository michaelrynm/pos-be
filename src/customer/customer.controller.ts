import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { GetActiveProductResponseDto, GetCategoryTreeResponseDto } from './dto';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOkResponse({
    description: 'Success',
    type: [GetActiveProductResponseDto],
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async getActiveProduct(): Promise<GetActiveProductResponseDto[]> {
    return await this.customerService.findActiveProducts();
  }

  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiOkResponse({
    description: 'Success',
    type: [GetActiveProductResponseDto],
  })
  @HttpCode(HttpStatus.OK)
  @Get('search')
  async search(
    @Query('q') query: string,
  ): Promise<GetActiveProductResponseDto[]> {
    return await this.customerService.searchProducts(query);
  }

  @ApiOkResponse({
    description: 'Success',
    type: [GetCategoryTreeResponseDto],
  })
  @HttpCode(HttpStatus.OK)
  @Get('/category')
  async getCategoryTree(): Promise<GetCategoryTreeResponseDto[]> {
    return await this.customerService.findCategoryTree();
  }
}
