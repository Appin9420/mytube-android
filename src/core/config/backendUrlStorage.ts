import { normalizeApiBaseUrl } from '../utils/env';

const BACKEND_URL_KEY = 'config.backendApiUrl';

type BackendUrlStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

function createMemoryStorage(): BackendUrlStorage {
  const memory = new Map<string, string>();
  return {
    getString: key => memory.get(key),
    set: (key, value) => memory.set(key, value),
    delete: key => memory.delete(key),
  };
}

function createStorage(): BackendUrlStorage {
  let raw: BackendUrlStorage & { remove?: (key: string) => unknown } =
    createMemoryStorage();
  try {
    const mmkv = require('react-native-mmkv') as {
      MMKV?: new (config?: { id?: string }) => BackendUrlStorage;
      createMMKV?: (config?: { id?: string }) => BackendUrlStorage;
    };
    if (typeof mmkv.MMKV === 'function') {
      raw = new mmkv.MMKV({ id: 'backend-config-storage' });
    } else if (typeof mmkv.createMMKV === 'function') {
      raw = mmkv.createMMKV({ id: 'backend-config-storage' });
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

export function getStoredBackendApiUrl(): string | null {
  let raw: string | undefined;
  try {
    raw = storage.getString(BACKEND_URL_KEY);
  } catch {
    return null;
  }
  if (raw == null) return null;
  const normalized = normalizeApiBaseUrl(raw);
  if (!normalized) {
    try {
      storage.delete(BACKEND_URL_KEY);
    } catch {
      // ignore storage cleanup failure
    }
    return null;
  }
  return normalized;
}

export function setStoredBackendApiUrl(url: string | null): void {
  if (url == null) {
    try {
      storage.delete(BACKEND_URL_KEY);
    } catch {
      // ignore storage delete failure
    }
    return;
  }
  const normalized = normalizeApiBaseUrl(url);
  if (!normalized) {
    try {
      storage.delete(BACKEND_URL_KEY);
    } catch {
      // ignore storage delete failure
    }
    return;
  }
  try {
    storage.set(BACKEND_URL_KEY, normalized);
  } catch {
    // ignore storage set failure
  }
}
