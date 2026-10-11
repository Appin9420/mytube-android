/**
 * Local persistence for the UI language. The backend settings API has no
 * `language` field (PATCH /settings drops unknown fields via the
 * prepare-settings whitelist), so the chosen locale has to live on-device.
 * Mirrors backendUrlStorage.ts: MMKV with an in-memory fallback so module
 * import stays safe in Jest/node.
 */

const LANGUAGE_KEY = 'settings.language';

type LanguageStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

function createMemoryStorage(): LanguageStorage {
  const memory = new Map<string, string>();
  return {
    getString: key => memory.get(key),
    set: (key, value) => memory.set(key, value),
    delete: key => memory.delete(key),
  };
}

function createStorage(): LanguageStorage {
  try {
    const mmkv = require('react-native-mmkv') as {
      MMKV?: new (config?: { id?: string }) => LanguageStorage;
      createMMKV?: (config?: { id?: string }) => LanguageStorage;
    };
    if (typeof mmkv.MMKV === 'function') {
      return new mmkv.MMKV({ id: 'app-settings-storage' });
    }
    if (typeof mmkv.createMMKV === 'function') {
      return mmkv.createMMKV({ id: 'app-settings-storage' });
    }
  } catch {
    // fall through to in-memory fallback
  }
  return createMemoryStorage();
}

const storage = createStorage();

export function getStoredLanguage(): string | null {
  try {
    return storage.getString(LANGUAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setStoredLanguage(language: string): void {
  try {
    storage.set(LANGUAGE_KEY, language);
  } catch {
    // ignore storage write failure
  }
}
