import { ApiProperty } from '@nestjs/swagger';

export class GetCategoryTreeResponseDto {
  @ApiProperty({ example: 'category-id' })
  id: string;

  @ApiProperty({ example: 'Non Coffee' })
  name: string;

  @ApiProperty({ example: 'parent-id' })
  parentId: string | null;

  @ApiProperty({
    example: [{ id: 'child-id', name: 'Tea', parentId: 'category-id' }],
  })
  children?: GetCategoryTreeResponseDto[] = [];
}
