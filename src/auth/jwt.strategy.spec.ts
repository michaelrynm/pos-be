import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const originalEnv = process.env;

  // ── Module Setup ──────────────────────────────────────────────────────
  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test_secret_key' };
    strategy = new JwtStrategy();
  });

  afterEach(() => {
    process.env = originalEnv;
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
  // Fallback secret
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('constructor / fallback secret', () => {
    it('should instantiate without errors when JWT_SECRET env is set', () => {
      process.env.JWT_SECRET = 'my_secret';
      const strat = new JwtStrategy();
      expect(strat).toBeDefined();
    });

    it('should instantiate without errors when JWT_SECRET env is undefined (uses fallback)', () => {
      delete process.env.JWT_SECRET;
      const strat = new JwtStrategy();
      expect(strat).toBeDefined();
    });
  });
});
