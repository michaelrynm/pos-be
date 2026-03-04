export class FindAllUserResponseDto {
  message: string;
  users: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    createdAt: Date;
  }[];
}
