import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { DRIZZLE } from 'db';
import { UuidService } from '../common/uuid.service';
import { UserRole } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let db: any;

  // ── Helpers ───────────────────────────────────────────────────────────
  const mockUser = {
    id: 'uuid-1234',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'hashed_password_123',
    role: 'kasir',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const adminUser = {
    id: 'admin-uuid',
    username: 'admin',
    role: 'admin',
  };

  const nonAdminUser = {
    id: 'kasir-uuid',
    username: 'kasir01',
    role: 'kasir',
  };

  const createUserDto = {
    fullname: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'password123',
    role: UserRole.KASIR,
  };

  // ── Mock DB ───────────────────────────────────────────────────────────
  const mockInsertReturning = jest.fn();
  const mockInsertValues = jest
    .fn()
    .mockReturnValue({ returning: mockInsertReturning });
  const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });

  const mockUpdateReturning = jest.fn();
  const mockUpdateWhere = jest
    .fn()
    .mockReturnValue({ returning: mockUpdateReturning });
  const mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
  const mockUpdate = jest.fn().mockReturnValue({ set: mockUpdateSet });

  const mockDeleteReturning = jest.fn();
  const mockDeleteWhere = jest
    .fn()
    .mockReturnValue({ returning: mockDeleteReturning });
  const mockDelete = jest.fn().mockReturnValue({ where: mockDeleteWhere });

  const mockSelectFrom = jest.fn();
  const mockSelect = jest.fn().mockReturnValue({ from: mockSelectFrom });

  const mockQueryUsersFindFirst = jest.fn();

  const mockUuidService = {
    generate: jest.fn().mockReturnValue('generated-uuid'),
  };

  const mockDb = {
    query: {
      users: {
        findFirst: mockQueryUsersFindFirst,
      },
    },
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    select: mockSelect,
  };

  // ── Module Setup ──────────────────────────────────────────────────────
  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset chain mocks
    mockInsert.mockReturnValue({ values: mockInsertValues });
    mockInsertValues.mockReturnValue({ returning: mockInsertReturning });
    mockUpdate.mockReturnValue({ set: mockUpdateSet });
    mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdateWhere.mockReturnValue({ returning: mockUpdateReturning });
    mockDelete.mockReturnValue({ where: mockDeleteWhere });
    mockDeleteWhere.mockReturnValue({ returning: mockDeleteReturning });
    mockSelect.mockReturnValue({ from: mockSelectFrom });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
        {
          provide: UuidService,
          useValue: mockUuidService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get(DRIZZLE);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Basic sanity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // create()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('create()', () => {
    it('should throw ForbiddenException when current user is not admin', async () => {
      await expect(service.create(createUserDto, nonAdminUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException with correct message for non-admin', async () => {
      await expect(service.create(createUserDto, nonAdminUser)).rejects.toThrow(
        'Unauthorized!',
      );
    });

    it('should not query the database when user is not admin', async () => {
      await expect(
        service.create(createUserDto, nonAdminUser),
      ).rejects.toThrow();
      expect(mockQueryUsersFindFirst).not.toHaveBeenCalled();
    });

    it('should create a new user successfully when admin', async () => {
      const createdUser = {
        id: 'generated-uuid',
        name: createUserDto.fullname,
        email: createUserDto.email,
        role: createUserDto.role,
        createdAt: new Date('2025-01-01'),
      };

      mockQueryUsersFindFirst.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_123');
      mockInsertReturning.mockResolvedValue([createdUser]);

      const result = await service.create(createUserDto, adminUser);

      expect(result).toEqual({
        message: 'Register successfuly',
        user: createdUser,
      });
    });

    it('should hash the password with salt rounds of 10', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      mockInsertReturning.mockResolvedValue([{ id: '1' }]);

      await service.create(createUserDto, adminUser);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should throw ConflictException when username already exists', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto, adminUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException with correct message when username exists', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto, adminUser)).rejects.toThrow(
        'Username Already Exist! Please use another username',
      );
    });

    it('should not attempt to insert when username already exists', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto, adminUser)).rejects.toThrow();
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should propagate unexpected database errors', async () => {
      mockQueryUsersFindFirst.mockRejectedValue(
        new Error('DB connection lost'),
      );

      await expect(service.create(createUserDto, adminUser)).rejects.toThrow(
        'DB connection lost',
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // findAll()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('findAll()', () => {
    it('should return all users successfully', async () => {
      const usersList = [
        {
          id: 'uuid-1',
          name: 'John',
          email: 'john@example.com',
          username: 'john',
          role: 'admin',
          createdAt: new Date(),
        },
        {
          id: 'uuid-2',
          name: 'Jane',
          email: 'jane@example.com',
          username: 'jane',
          role: 'kasir',
          createdAt: new Date(),
        },
      ];

      mockSelectFrom.mockResolvedValue(usersList);

      const result = await service.findAll();

      expect(result).toEqual({
        message: 'Data retrieved succesfully',
        users: usersList,
      });
    });

    it('should return empty array when no users exist', async () => {
      mockSelectFrom.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result.users).toEqual([]);
    });

    it('should call db.select().from()', async () => {
      mockSelectFrom.mockResolvedValue([]);

      await service.findAll();

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSelectFrom).toHaveBeenCalledTimes(1);
    });

    it('should propagate unexpected database errors', async () => {
      mockSelectFrom.mockRejectedValue(new Error('DB error'));

      await expect(service.findAll()).rejects.toThrow('DB error');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // findOne()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('findOne()', () => {
    it('should return user without password', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      const result = await service.findOne('uuid-1234');

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          username: mockUser.username,
        }),
      );
    });

    it('should return success message', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);

      const result = await service.findOne('uuid-1234');

      expect(result.message).toBe('Date Retrieved succesfully!');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException with correct message', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        'User not found',
      );
    });

    it('should propagate unexpected database errors', async () => {
      mockQueryUsersFindFirst.mockRejectedValue(new Error('DB error'));

      await expect(service.findOne('uuid-1234')).rejects.toThrow('DB error');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // update()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('update()', () => {
    const updateDto = { fullname: 'Updated Name' };

    it('should update a user successfully', async () => {
      const updatedUser = {
        id: 'uuid-1234',
        name: 'Updated Name',
        email: 'john@example.com',
        username: 'johndoe',
        role: 'kasir',
        updatedAt: new Date(),
      };

      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      mockUpdateReturning.mockResolvedValue([updatedUser]);

      const result = await service.update('uuid-1234', updateDto);

      expect(result).toEqual({
        message: 'User updated successfully',
        user: updatedUser,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when new username already exists', async () => {
      const anotherUser = { ...mockUser, id: 'uuid-5678', username: 'taken' };

      // First call: find the user to update
      mockQueryUsersFindFirst
        .mockResolvedValueOnce(mockUser)
        // Second call: check duplicate username
        .mockResolvedValueOnce(anotherUser);

      await expect(
        service.update('uuid-1234', { username: 'taken' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password when password is being updated', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_pw');
      mockUpdateReturning.mockResolvedValue([{ id: 'uuid-1234' }]);

      await service.update('uuid-1234', { password: 'newpassword123' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });

    it('should not hash password when password is not being updated', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      mockUpdateReturning.mockResolvedValue([{ id: 'uuid-1234' }]);

      await service.update('uuid-1234', { fullname: 'New Name' });

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should not check for duplicate username when username is unchanged', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      mockUpdateReturning.mockResolvedValue([{ id: 'uuid-1234' }]);

      await service.update('uuid-1234', {
        username: mockUser.username,
      });

      // findFirst should only be called once (to find the user), not twice
      expect(mockQueryUsersFindFirst).toHaveBeenCalledTimes(1);
    });

    it('should propagate unexpected database errors', async () => {
      mockQueryUsersFindFirst.mockRejectedValue(new Error('DB error'));

      await expect(service.update('uuid-1234', updateDto)).rejects.toThrow(
        'DB error',
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // remove()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('remove()', () => {
    it('should delete a user successfully', async () => {
      const deletedResult = [
        {
          user_id: 'uuid-1234',
          username: 'johndoe',
          name: 'John Doe',
          email: 'john@example.com',
        },
      ];

      mockQueryUsersFindFirst.mockResolvedValue(mockUser);
      mockDeleteReturning.mockResolvedValue(deletedResult);

      const result = await service.remove('uuid-1234');

      expect(result).toEqual({
        message: 'User Deleted',
        result: deletedResult,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException with correct message', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.remove('non-existent')).rejects.toThrow(
        'User not found',
      );
    });

    it('should not attempt to delete when user does not exist', async () => {
      mockQueryUsersFindFirst.mockResolvedValue(undefined);

      await expect(service.remove('non-existent')).rejects.toThrow();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should propagate unexpected database errors', async () => {
      mockQueryUsersFindFirst.mockRejectedValue(new Error('DB error'));

      await expect(service.remove('uuid-1234')).rejects.toThrow('DB error');
    });
  });
});
