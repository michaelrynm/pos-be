import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'auth/decorators/current-user.decorator';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { FindAllUserResponseDto } from './dto/get-all-user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user account. Only admins can create users.
   * @param createUserDto - The user creation payload (fullname, email, username, password, role).
   * @param currentUser - The authenticated user extracted from the JWT token.
   * @returns The created user's info and a success message.
   */
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser()
    currentUser: {
      id: string;
      username: string;
      role: string;
    },
  ): Promise<CreateUserResponseDto> {
    return this.usersService.create(createUserDto, currentUser);
  }

  /**
   * Retrieve all users.
   * @returns A list of all users and a success message.
   */
  @Get()
  findAll(): Promise<FindAllUserResponseDto> {
    return this.usersService.findAll();
  }

  /**
   * Retrieve a single user by ID.
   * @param id - The UUID of the user to retrieve.
   * @returns The user's data (excluding password) and a success message.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Update a user's information by ID.
   * Only the provided fields will be updated (partial update).
   * @param id - The UUID of the user to update.
   * @param updateUserDto - The fields to update (all optional).
   * @returns The updated user's info and a success message.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Delete a user by ID.
   * @param id - The UUID of the user to delete.
   * @returns The deleted user's info and a success message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
