import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  // ── Mock ConfigService ────────────────────────────────────────────────
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test_secret_key';
      return undefined;
    }),
  } as unknown as ConfigService;

  // ── Module Setup ──────────────────────────────────────────────────────
  beforeEach(() => {
    strategy = new JwtStrategy(mockConfigService);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Basic sanity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should be an instance of JwtStrategy', () => {
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // validate()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('validate()', () => {
    it('should return an object with id mapped from payload.sub', async () => {
      const payload = { sub: 'user-uuid-123', username: 'johndoe' };

      const result = await strategy.validate(payload);

      expect(result.id).toBe('user-uuid-123');
    });

    it('should return an object with the username from the payload', async () => {
      const payload = { sub: 'user-uuid-123', username: 'johndoe' };

      const result = await strategy.validate(payload);

      expect(result.username).toBe('johndoe');
    });

    it('should return the correct shape { id, username }', async () => {
      const payload = { sub: 'abc-def', username: 'testuser' };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ id: 'abc-def', username: 'testuser' });
    });

    it('should map sub → id (not keep "sub" as key)', async () => {
      const payload = { sub: 'some-id', username: 'user1' };

      const result = await strategy.validate(payload);

      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('sub');
    });

    it('should handle different user IDs correctly', async () => {
      const payloads = [
        { sub: 'uuid-1', username: 'alice' },
        { sub: 'uuid-2', username: 'bob' },
        { sub: 'uuid-3', username: 'charlie' },
      ];

      for (const payload of payloads) {
        const result = await strategy.validate(payload);
        expect(result).toEqual({
          id: payload.sub,
          username: payload.username,
        });
      }
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Constructor / ConfigService
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('constructor / ConfigService', () => {
    it('should instantiate without errors when JWT_SECRET is provided via ConfigService', () => {
      const strat = new JwtStrategy(mockConfigService);
      expect(strat).toBeDefined();
    });

    it('should read JWT_SECRET from ConfigService', () => {
      new JwtStrategy(mockConfigService);
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });
});
