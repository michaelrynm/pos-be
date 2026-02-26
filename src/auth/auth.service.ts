import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { DRIZZLE } from 'db';
import * as schema from '../db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.query.users.findFirst({
      where: eq(schema.users.username, dto.username),
    });

    if (existing) {
      throw new ConflictException('Username already used!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const [user] = await this.db
      .insert(schema.users)
      .values({
        email: dto.email,
        name: dto.name,
        username: dto.username,
        password: hashedPassword,
      })
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        createdAt: schema.users.createdAt,
      });

    return { message: 'Register successfuly', user };
  }

  async login(dto: LoginDto): Promise<{ message: string; token: string }> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.username, dto.username),
    });

    if (!user) {
      throw new UnauthorizedException('Username or Password is wrong!');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Username or Password is wrong!');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    });

    return {
      message: 'Login successfuly',
      token,
    };
  }

  async me(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;

    return {
      message: 'Data retreived successfuly',
      result,
    };
  }
}
