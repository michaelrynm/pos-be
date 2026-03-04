import {
  Injectable,
  Inject,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DRIZZLE, users } from 'db';
import { UuidService } from '../common/uuid.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import * as schema from '../db';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly uuidService: UuidService,
  ) {}
  async create(
    createUserDto: CreateUserDto,
    currentUser: {
      id: string;
      username: string;
      role: string;
    },
  ) {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Unauthorized!');
    }

    const existing = await this.db.query.users.findFirst({
      where: eq(users.username, createUserDto.username),
    });

    if (existing) {
      throw new ConflictException(
        'Username Already Exist! Please use another username',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const [user] = await this.db
      .insert(users)
      .values({
        id: this.uuidService.generate(),
        email: createUserDto.email,
        name: createUserDto.fullname,
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return { message: 'Register successfuly', user };
  }

  async findAll() {
    const response = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);
    return {
      message: 'Data retrieved succesfully',
      users: response,
    };
  }

  async findOne(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;

    return {
      message: 'Date Retrieved succesfully!',
      user: result,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    // If username is being changed, check for duplicates
    if (
      updateUserDto.username &&
      updateUserDto.username !== existing.username
    ) {
      const duplicate = await this.db.query.users.findFirst({
        where: eq(users.username, updateUserDto.username),
      });
      if (duplicate) {
        throw new ConflictException('Username already exists!');
      }
    }

    // Hash password if it's being updated
    const updateData: Record<string, any> = {};
    if (updateUserDto.fullname) updateData.name = updateUserDto.fullname;
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.username) updateData.username = updateUserDto.username;
    if (updateUserDto.role) updateData.role = updateUserDto.role;
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    updateData.updatedAt = new Date();

    const [updatedUser] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        role: users.role,
        updatedAt: users.updatedAt,
      });

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  async remove(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const res = await this.db.delete(users).where(eq(users.id, id)).returning({
      user_id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
    });

    return {
      message: 'User Deleted',
      result: res,
    };
  }
}
