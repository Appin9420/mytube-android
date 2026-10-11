import {
  isAppLockEnabled,
  setAppLockPassword,
  clearAppLock,
  verifyAppLockPassword,
  getRemainingAttempts,
  APP_LOCK_MAX_ATTEMPTS,
  APP_LOCK_MIN_PASSWORD_LENGTH,
} from '../../../src/core/config/appLockStorage';

describe('appLockStorage (in-memory fallback)', () => {
  beforeEach(() => {
    clearAppLock();
  });

  test('disabled by default', () => {
    expect(isAppLockEnabled()).toBe(false);
    expect(getRemainingAttempts()).toBe(APP_LOCK_MAX_ATTEMPTS);
  });

  test('setAppLockPassword enables and verifies the right password', () => {
    setAppLockPassword('secret1');
    expect(isAppLockEnabled()).toBe(true);
    expect(verifyAppLockPassword('secret1')).toBe('ok');
    expect(verifyAppLockPassword('secret2')).toBe('wrong');
    expect(getRemainingAttempts()).toBe(APP_LOCK_MAX_ATTEMPTS - 1);
  });

  test('locks out after max failed attempts, recovers after the window', () => {
    jest.useFakeTimers();
    const now = Date.now();
    const dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);
    try {
      setAppLockPassword('secret1');
      for (let i = 0; i < APP_LOCK_MAX_ATTEMPTS; i++) {
        expect(verifyAppLockPassword('wrong')).toBe('wrong');
      }
      // Counter resets when the lockout starts; while locked, verify is 'locked'.
      expect(verifyAppLockPassword('secret1')).toBe('locked');

      dateSpy.mockImplementation(() => now + 31_000);
      expect(verifyAppLockPassword('secret1')).toBe('ok');
    } finally {
      dateSpy.mockRestore();
      jest.useRealTimers();
    }
  });

  test('successful verify resets the failure counter', () => {
    setAppLockPassword('secret1');
    verifyAppLockPassword('wrong');
    verifyAppLockPassword('secret1');
    expect(getRemainingAttempts()).toBe(APP_LOCK_MAX_ATTEMPTS);
    expect(verifyAppLockPassword('wrong')).toBe('wrong');
    expect(getRemainingAttempts()).toBe(APP_LOCK_MAX_ATTEMPTS - 1);
  });

  test('changing the password via setAppLockPassword re-hashes', () => {
    setAppLockPassword('old-pass');
    setAppLockPassword('new-pass');
    expect(verifyAppLockPassword('old-pass')).toBe('wrong');
    expect(verifyAppLockPassword('new-pass')).toBe('ok');
  });

  test('clearAppLock disables the lock', () => {
    setAppLockPassword('secret1');
    clearAppLock();
    expect(isAppLockEnabled()).toBe(false);
    expect(verifyAppLockPassword('secret1')).toBe('ok');
  });

  test('min password length constant matches desktop parity expectations', () => {
    expect(APP_LOCK_MIN_PASSWORD_LENGTH).toBeGreaterThanOrEqual(4);
  });
});
