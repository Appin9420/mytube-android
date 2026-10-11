/**
 * Device-local app lock (startup password), mirroring the desktop build's
 * startup password gate: scrypt there, iterated HMAC-SHA256 here (pure JS,
 * no native module). This is a screen lock, not a security boundary —
 * forgetting the password means clearing the app's data.
 */

import sha256 from 'js-sha256';

const KEY_ENABLED = 'lock.enabled';
const KEY_SALT = 'lock.salt';
const KEY_HASH = 'lock.hash';
const KEY_FAIL_COUNT = 'lock.failCount';
const KEY_LOCKED_UNTIL = 'lock.lockedUntil';

const PBKDF2_ITERATIONS = 12000;
export const APP_LOCK_MAX_ATTEMPTS = 5;
export const APP_LOCK_MIN_PASSWORD_LENGTH = 4;
const LOCKOUT_MS = 30_000;

type StringStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

function createMemoryStorage(): StringStorage {
  const memory = new Map<string, string>();
  return {
    getString: key => memory.get(key),
    set: (key, value) => memory.set(key, value),
    delete: key => memory.delete(key),
  };
}

function createStorage(): StringStorage {
  let raw: StringStorage & { remove?: (key: string) => unknown } =
    createMemoryStorage();
  try {
    const mmkv = require('react-native-mmkv') as {
      MMKV?: new (config?: { id?: string }) => StringStorage;
      createMMKV?: (config?: { id?: string }) => StringStorage;
    };
    if (typeof mmkv.MMKV === 'function') {
      raw = new mmkv.MMKV({ id: 'app-lock-storage' });
    } else if (typeof mmkv.createMMKV === 'function') {
      raw = mmkv.createMMKV({ id: 'app-lock-storage' });
    }
  } catch {
    // keep the in-memory fallback
  }
  return {
    getString: key => raw.getString(key),
    set: (key, value) => raw.set(key, value),
    // react-native-mmkv v4 renamed delete() to remove(); adapt so callers
    // can keep using the classic name.
    delete: key => {
      if (typeof raw.remove === 'function') {
        raw.remove(key);
      } else {
        raw.delete(key);
      }
    },
  };
}

const storage = createStorage();

/**
 * Standard PBKDF2-shaped iterated HMAC-SHA256 over js-sha256's hex-string
 * hmac chaining (input encoding is our own; only this module creates and
 * verifies hashes, so self-consistency is what matters). Iteration count
 * tuned so a derivation stays under ~1s on low-end Android hardware.
 */
function deriveHash(password: string, salt: string): string {
  let u = sha256.hmac(password, `${salt}\u0001`);
  for (let i = 1; i < PBKDF2_ITERATIONS; i++) {
    u = sha256.hmac(password, u);
  }
  return u;
}

function constantTimeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function randomSalt(): string {
  return sha256(`${Date.now()}:${Math.random()}:${Math.random()}`);
}

function getInt(key: string): number {
  const raw = storage.getString(key);
  const parsed = raw != null ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isAppLockEnabled(): boolean {
  return storage.getString(KEY_ENABLED) === '1' && storage.getString(KEY_HASH) != null;
}

export function setAppLockPassword(password: string): void {
  const salt = randomSalt();
  storage.set(KEY_SALT, salt);
  storage.set(KEY_HASH, deriveHash(password, salt));
  storage.set(KEY_ENABLED, '1');
  storage.delete(KEY_FAIL_COUNT);
  storage.delete(KEY_LOCKED_UNTIL);
}

export function clearAppLock(): void {
  storage.delete(KEY_ENABLED);
  storage.delete(KEY_SALT);
  storage.delete(KEY_HASH);
  storage.delete(KEY_FAIL_COUNT);
  storage.delete(KEY_LOCKED_UNTIL);
}

export function getLockoutRemainingMs(): number {
  const until = getInt(KEY_LOCKED_UNTIL);
  return Math.max(0, until - Date.now());
}

export function getRemainingAttempts(): number {
  return Math.max(0, APP_LOCK_MAX_ATTEMPTS - getInt(KEY_FAIL_COUNT));
}

export type AppLockVerifyResult = 'ok' | 'wrong' | 'locked';

export function verifyAppLockPassword(password: string): AppLockVerifyResult {
  if (!isAppLockEnabled()) return 'ok';
  if (getLockoutRemainingMs() > 0) return 'locked';

  const salt = storage.getString(KEY_SALT) ?? '';
  const storedHash = storage.getString(KEY_HASH) ?? '';
  if (constantTimeHexEqual(deriveHash(password, salt), storedHash)) {
    storage.delete(KEY_FAIL_COUNT);
    storage.delete(KEY_LOCKED_UNTIL);
    return 'ok';
  }

  const failCount = getInt(KEY_FAIL_COUNT) + 1;
  if (failCount >= APP_LOCK_MAX_ATTEMPTS) {
    storage.set(KEY_LOCKED_UNTIL, String(Date.now() + LOCKOUT_MS));
    storage.delete(KEY_FAIL_COUNT);
  } else {
    storage.set(KEY_FAIL_COUNT, String(failCount));
  }
  return 'wrong';
}
