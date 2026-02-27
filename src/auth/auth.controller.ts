import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user account.
   * @param dto - The registration payload (name, email, username, password).
   * @returns The created user's info and a success message.
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  /**
   * Authenticate a user and set an httpOnly access_token cookie.
   * @param dto - The login credentials (username, password).
   * @param res - Express response object used to set the cookie.
   * @returns A success message. The JWT token is sent via httpOnly cookie.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { token, message } = await this.authService.login(dto);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day — matches JWT expiry
    });

    return { message };
  }

  /**
   * Log out the current user by clearing the access_token cookie.
   * @param res - Express response object used to clear the cookie.
   * @returns A success message.
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Retrieve the currently authenticated user's profile.
   * @param user - The user extracted from the JWT token.
   * @returns The user's profile data (excluding password).
   */
  @Get('me')
  async me(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<MeResponseDto> {
    return this.authService.me(user.id);
  }
}
