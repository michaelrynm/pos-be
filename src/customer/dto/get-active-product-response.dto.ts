import { ApiProperty } from '@nestjs/swagger';

export class GetActiveProductResponseDto {
  @ApiProperty({ example: 'Non Coffee > Tea' })
  category: string;

  @ApiProperty({ example: 'Iced Tea' })
  name: string;

  @ApiProperty({ example: 'Fresh brewed iced tea' })
  description: string;

  @ApiProperty({ example: 'https://image-url.com' })
  thumbnail: string;

  @ApiProperty({ example: '30' })
  basePrice: number;
}
