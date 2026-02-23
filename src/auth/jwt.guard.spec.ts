import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtGuard } from './jwt.guard';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

describe('JwtGuard', () => {
  let guard: JwtGuard;
  let reflector: Reflector;

  // ── Helpers ───────────────────────────────────────────────────────────
  const createMockExecutionContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
    }) as unknown as ExecutionContext;

  // ── Module Setup ──────────────────────────────────────────────────────
  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtGuard(reflector);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Basic sanity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should be an instance of JwtGuard', () => {
    expect(guard).toBeInstanceOf(JwtGuard);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // canActivate()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('canActivate()', () => {
    it('should return true immediately for public routes', () => {
      const context = createMockExecutionContext();

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should call reflector.getAllAndOverride with IS_PUBLIC_KEY', () => {
      const context = createMockExecutionContext();
      const spy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(true);

      guard.canActivate(context);

      expect(spy).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should delegate to super.canActivate for non-public routes', () => {
      const context = createMockExecutionContext();

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(false);

      // AuthGuard('jwt').canActivate will try passport validation,
      // which will fail in unit tests without a proper JWT setup.
      // We spy on the parent class to verify delegation.
      const superCanActivate = jest
        .spyOn(Object.getPrototypeOf(JwtGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(superCanActivate).toHaveBeenCalledWith(context);
      expect(result).toBe(true);

      superCanActivate.mockRestore();
    });

    it('should delegate to super.canActivate when isPublic is undefined', () => {
      const context = createMockExecutionContext();

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(undefined);

      const superCanActivate = jest
        .spyOn(Object.getPrototypeOf(JwtGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      guard.canActivate(context);

      expect(superCanActivate).toHaveBeenCalledWith(context);

      superCanActivate.mockRestore();
    });

    it('should delegate to super.canActivate when isPublic is null', () => {
      const context = createMockExecutionContext();

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(null);

      const superCanActivate = jest
        .spyOn(Object.getPrototypeOf(JwtGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      guard.canActivate(context);

      expect(superCanActivate).toHaveBeenCalledWith(context);

      superCanActivate.mockRestore();
    });
  });
});
