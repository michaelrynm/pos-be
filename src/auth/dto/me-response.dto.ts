export class MeResponseDto {
  message: string;
  result: {
    id: string;
    name: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
