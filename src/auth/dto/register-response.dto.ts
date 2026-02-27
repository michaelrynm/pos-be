export class RegisterResponseDto {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}
