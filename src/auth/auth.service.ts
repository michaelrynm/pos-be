import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { DRIZZLE, users } from 'db';
import * as schema from '../db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UuidService } from '../common/uuid.service';
import { RegisterResponseDto } from './dto/register-response.dto';
import { MeResponseDto } from './dto/me-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly uuidService: UuidService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.username, dto.username),
    });

    if (existing) {
      throw new ConflictException('Username already used!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const [user] = await this.db
      .insert(users)
      .values({
        id: this.uuidService.generate(),
        email: dto.email,
        name: dto.name,
        username: dto.username,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    return { message: 'Register successfuly', user };
  }

  async login(dto: LoginDto): Promise<{ message: string; token: string }> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.username, dto.username),
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
      role: user.role,
    });

    return {
      message: 'Login successfuly',
      token,
    };
  }

  async me(userId: string): Promise<MeResponseDto> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
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
