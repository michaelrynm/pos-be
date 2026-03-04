import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  // ── Mock UsersService ──────────────────────────────────────────────────
  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const mockCurrentUser = {
    id: 'admin-uuid',
    username: 'admin',
    role: 'admin',
  };

  // ── Module Setup ──────────────────────────────────────────────────────
  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Basic sanity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // create()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('create()', () => {
    const createUserDto = {
      fullname: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'password123',
      role: UserRole.KASIR,
    };

    it('should call usersService.create with the DTO and current user', async () => {
      mockUsersService.create.mockResolvedValue({ message: 'ok', user: {} });

      await controller.create(createUserDto, mockCurrentUser);

      expect(usersService.create).toHaveBeenCalledWith(
        createUserDto,
        mockCurrentUser,
      );
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('should return the result from usersService.create', async () => {
      const expectedResult = {
        message: 'Register successfuly',
        user: {
          id: 'uuid-1234',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'kasir',
          createdAt: new Date(),
        },
      };

      mockUsersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto, mockCurrentUser);

      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors thrown by usersService.create', async () => {
      mockUsersService.create.mockRejectedValue(new Error('Unauthorized!'));

      await expect(
        controller.create(createUserDto, mockCurrentUser),
      ).rejects.toThrow('Unauthorized!');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // findAll()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('findAll()', () => {
    it('should call usersService.findAll', async () => {
      mockUsersService.findAll.mockResolvedValue({ message: 'ok', users: [] });

      await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return the result from usersService.findAll', async () => {
      const expectedResult = {
        message: 'Data retrieved succesfully',
        users: [
          {
            id: 'uuid-1',
            name: 'John',
            email: 'john@example.com',
            username: 'john',
            role: 'admin',
            createdAt: new Date(),
          },
        ],
      };

      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors thrown by usersService.findAll', async () => {
      mockUsersService.findAll.mockRejectedValue(new Error('DB error'));

      await expect(controller.findAll()).rejects.toThrow('DB error');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // findOne()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('findOne()', () => {
    it('should call usersService.findOne with the correct id', async () => {
      mockUsersService.findOne.mockResolvedValue({ message: 'ok', user: {} });

      await controller.findOne('uuid-1234');

      expect(usersService.findOne).toHaveBeenCalledWith('uuid-1234');
      expect(usersService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return the result from usersService.findOne', async () => {
      const expectedResult = {
        message: 'Date Retrieved succesfully!',
        user: {
          id: 'uuid-1234',
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          role: 'kasir',
        },
      };

      mockUsersService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('uuid-1234');

      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors thrown by usersService.findOne', async () => {
      mockUsersService.findOne.mockRejectedValue(new Error('User not found'));

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        'User not found',
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // update()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('update()', () => {
    const updateUserDto = { fullname: 'Updated Name' };

    it('should call usersService.update with correct id and DTO', async () => {
      mockUsersService.update.mockResolvedValue({ message: 'ok', user: {} });

      await controller.update('uuid-1234', updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(
        'uuid-1234',
        updateUserDto,
      );
      expect(usersService.update).toHaveBeenCalledTimes(1);
    });

    it('should return the result from usersService.update', async () => {
      const expectedResult = {
        message: 'User updated successfully',
        user: {
          id: 'uuid-1234',
          name: 'Updated Name',
          email: 'john@example.com',
          username: 'johndoe',
          role: 'kasir',
          updatedAt: new Date(),
        },
      };

      mockUsersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('uuid-1234', updateUserDto);

      expect(result).toEqual(expectedResult);
    });

    it('should pass the id as string — not convert to number', async () => {
      mockUsersService.update.mockResolvedValue({ message: 'ok', user: {} });

      await controller.update('uuid-1234', updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(
        'uuid-1234',
        updateUserDto,
      );
      // Ensure it's a string, not a number
      const calledId = (usersService.update as jest.Mock).mock.calls[0][0];
      expect(typeof calledId).toBe('string');
    });

    it('should propagate errors thrown by usersService.update', async () => {
      mockUsersService.update.mockRejectedValue(new Error('User not found'));

      await expect(
        controller.update('non-existent', updateUserDto),
      ).rejects.toThrow('User not found');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // remove()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('remove()', () => {
    it('should call usersService.remove with the correct id', async () => {
      mockUsersService.remove.mockResolvedValue({ message: 'ok', result: [] });

      await controller.remove('uuid-1234');

      expect(usersService.remove).toHaveBeenCalledWith('uuid-1234');
      expect(usersService.remove).toHaveBeenCalledTimes(1);
    });

    it('should return the result from usersService.remove', async () => {
      const expectedResult = {
        message: 'User Deleted',
        result: [
          {
            user_id: 'uuid-1234',
            username: 'johndoe',
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
      };

      mockUsersService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('uuid-1234');

      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors thrown by usersService.remove', async () => {
      mockUsersService.remove.mockRejectedValue(new Error('User not found'));

      await expect(controller.remove('non-existent')).rejects.toThrow(
        'User not found',
      );
    });
  });
});
