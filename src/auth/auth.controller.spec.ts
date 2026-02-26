import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // ── Mock AuthService ──────────────────────────────────────────────────
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
  };

  // ── Mock Response ─────────────────────────────────────────────────────
  const mockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  // ── Module Setup ──────────────────────────────────────────────────────
  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Basic sanity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // register()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('register()', () => {
    const registerDto: RegisterDto = {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'password123',
    };

    it('should call authService.register with the correct DTO', async () => {
      mockAuthService.register.mockResolvedValue({ message: 'ok', user: {} });

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should return the result from authService.register', async () => {
      const expectedResult = {
        message: 'Register successfuly',
        user: {
          id: 'uuid-1234',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors thrown by authService.register', async () => {
      mockAuthService.register.mockRejectedValue(
        new Error('Username already used!'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Username already used!',
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // login()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('login()', () => {
    const loginDto: LoginDto = {
      username: 'johndoe',
      password: 'password123',
    };

    it('should call authService.login with the correct DTO', async () => {
      const res = mockResponse();
      mockAuthService.login.mockResolvedValue({
        message: 'Login successfuly',
        token: 'jwt-token-xyz',
      });

      await controller.login(loginDto, res);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should set the access_token cookie with httpOnly flag', async () => {
      const res = mockResponse();
      mockAuthService.login.mockResolvedValue({
        message: 'Login successfuly',
        token: 'jwt-token-xyz',
      });

      await controller.login(loginDto, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token-xyz',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });

    it('should return only the message without the token', async () => {
      const res = mockResponse();
      mockAuthService.login.mockResolvedValue({
        message: 'Login successfuly',
        token: 'jwt-token-xyz',
      });

      const result = await controller.login(loginDto, res);

      expect(result).toEqual({ message: 'Login successfuly' });
      expect(result).not.toHaveProperty('token');
    });

    it('should propagate errors thrown by authService.login', async () => {
      const res = mockResponse();
      mockAuthService.login.mockRejectedValue(
        new Error('Username or Password is wrong!'),
      );

      await expect(controller.login(loginDto, res)).rejects.toThrow(
        'Username or Password is wrong!',
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // logout()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('logout()', () => {
    it('should clear the access_token cookie', () => {
      const res = mockResponse();

      controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });

    it('should return a success message', () => {
      const res = mockResponse();

      const result = controller.logout(res);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // me()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('me()', () => {
    const mockCurrentUser = { id: 'uuid-1234', username: 'johndoe' };

    it('should call authService.me with the user id from @CurrentUser()', async () => {
      mockAuthService.me.mockResolvedValue({ message: 'ok', result: {} });

      await controller.me(mockCurrentUser);

      expect(authService.me).toHaveBeenCalledWith(mockCurrentUser.id);
      expect(authService.me).toHaveBeenCalledTimes(1);
    });

    it('should return the result from authService.me', async () => {
      const expectedResult = {
        message: 'Data retreived successfuly',
        result: {
          id: 'uuid-1234',
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockAuthService.me.mockResolvedValue(expectedResult);

      const result = await controller.me(mockCurrentUser);

      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors thrown by authService.me', async () => {
      mockAuthService.me.mockRejectedValue(new Error('Unauthorized'));

      await expect(controller.me(mockCurrentUser)).rejects.toThrow(
        'Unauthorized',
      );
    });

    it('should pass user.id — not the entire user object — to authService.me', async () => {
      mockAuthService.me.mockResolvedValue({ message: 'ok', result: {} });

      await controller.me(mockCurrentUser);

      // Verify it calls with string id, not the whole object
      expect(authService.me).toHaveBeenCalledWith('uuid-1234');
      expect(authService.me).not.toHaveBeenCalledWith(mockCurrentUser);
    });
  });
});
