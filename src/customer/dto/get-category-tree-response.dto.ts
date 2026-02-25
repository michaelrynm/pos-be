export class GetCategoryTreeResponseDto {
  id: string;
  name: string;
  parentId: string | null;
  children?: GetCategoryTreeResponseDto[] = [];
}
