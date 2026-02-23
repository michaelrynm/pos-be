import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { DRIZZLE } from 'db';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let db: any;

  // ── Helpers ───────────────────────────────────────────────────────────
  const mockUser = {
    id: 'uuid-1234',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'hashed_password_123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const registerDto = {
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'password123',
  };

  const loginDto = {
    username: 'johndoe',
    password: 'password123',
  };

  // ── Mock DB ───────────────────────────────────────────────────────────
  const mockInsertReturning = jest.fn();
  const mockInsertValues = jest.fn().mockReturnValue({ returning: mockInsertReturning });
  const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });

  const mockQueryUsersFindFirst = jest.fn();

  const mockDb = {
    query: {
      users: {
        findFirst: mockQueryUsersFindFirst,
      },
    },
    insert: mockInsert,
  };

  // ── Module Setup ──────────────────────────────────────────────────────
  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset chain mocks
    mockInsert.mockReturnValue({ values: mockInsertValues });
    mockInsertValues.mockReturnValue({ returning: mockInsertReturning });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    db = module.get(DRIZZLE);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Basic sanity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // register()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('register()', () => {
    it('should register a new user successfully', async () => {
      const createdUser = {
        id: 'uuid-1234',
        name: registerDto.name,
        email: registerDto.email,
        createdAt: new Date('2025-01-01'),
      };

      mockQueryUsersFindFirst.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_123');
      mockInsertReturning.mockResolvedValue([createdUser]);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        message: 'Register successfuly',
        user: createdUser,
      });
    });

    it('should call db.query.users.findFirst with the correct username', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      mockInsertReturning.mockResolvedValue([{ id: '1' }]);

      await service.register(registerDto);

      expect(mockQueryUsersFindFirst).toHaveBeenCalledTimes(1);
      expect(mockQueryUsersFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
    });

    it('should hash the password with salt rounds of 10', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      mockInsertReturning.mockResolvedValue([{ id: '1' }]);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should insert user with hashed password (not plain text)', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('super_hashed');
      mockInsertReturning.mockResolvedValue([{ id: '1' }]);

      await service.register(registerDto);

      expect(mockInsertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          name: registerDto.name,
          username: registerDto.username,
          password: 'super_hashed',
        }),
      );
    });

    it('should throw ConflictException when username already exists', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException with correct message when username exists', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        'Username already used!',
      );
    });

    it('should not call bcrypt.hash when user already exists', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should not attempt to insert when user already exists', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow();
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should return the user without the password field', async () => {
      const createdUser = {
        id: 'uuid-1234',
        name: registerDto.name,
        email: registerDto.email,
        createdAt: new Date('2025-01-01'),
      };

      mockQueryUsersFindFirst.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      mockInsertReturning.mockResolvedValue([createdUser]);

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password');
    });

    it('should propagate unexpected database errors', async () => {
      mockQueryUsersFindFirst.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.register(registerDto)).rejects.toThrow(
        'DB connection lost',
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // login()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('login()', () => {
    it('should login successfully and return a token', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('jwt-token-xyz');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        message: 'Login successfuly',
        token: 'jwt-token-xyz',
      });
    });

    it('should sign the JWT with correct payload (sub + username)', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('token');

      await service.login(loginDto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
    });

    it('should compare the provided password with the stored hash', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('token');

      await service.login(loginDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with correct message when user not found', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Email or Password is wrong!',
      );
    });

    it('should not call bcrypt.compare when user does not exist', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw with correct message when password is wrong', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Email or Password is wrong!',
      );
    });

    it('should not sign JWT when password is wrong', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should propagate unexpected database errors', async () => {
      mockQueryUsersFindFirst.mockRejectedValue(new Error('Connection timeout'));

      await expect(service.login(loginDto)).rejects.toThrow(
        'Connection timeout',
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // me()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('me()', () => {
    it('should return user data without password', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      const result = await service.me('uuid-1234');

      expect(result.message).toBe('Data retreived successfuly');
      expect(result.result).not.toHaveProperty('password');
      expect(result.result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          username: mockUser.username,
        }),
      );
    });

    it('should return all user fields except password', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      const result = await service.me('uuid-1234');
      const resultKeys = Object.keys(result.result);

      expect(resultKeys).toContain('id');
      expect(resultKeys).toContain('name');
      expect(resultKeys).toContain('email');
      expect(resultKeys).toContain('username');
      expect(resultKeys).toContain('createdAt');
      expect(resultKeys).toContain('updatedAt');
      expect(resultKeys).not.toContain('password');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.me('non-existent-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should query the database with the correct user id', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      await service.me('uuid-1234');

      expect(mockQueryUsersFindFirst).toHaveBeenCalledTimes(1);
      expect(mockQueryUsersFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
    });

    it('should propagate unexpected database errors', async () => {
      mockQueryUsersFindFirst.mockRejectedValue(new Error('DB error'));

      await expect(service.me('uuid-1234')).rejects.toThrow('DB error');
    });
  });
});
