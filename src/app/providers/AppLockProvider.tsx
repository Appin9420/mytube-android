/**
 * App lock (startup password) state, mirroring the desktop build:
 * locked once per launch, re-locks when the app stays backgrounded for a
 * while, verifies against the device-local hash in appLockStorage.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import {
  clearAppLock,
  isAppLockEnabled,
  setAppLockPassword,
  verifyAppLockPassword,
  type AppLockVerifyResult,
} from '../../core/config/appLockStorage';

const RELOCK_BACKGROUND_MS = 30_000;

interface AppLockContextValue {
  locked: boolean;
  isEnabled: boolean;
  unlock: (password: string) => AppLockVerifyResult;
  enable: (password: string) => void;
  disable: (password: string) => AppLockVerifyResult;
  change: (current: string, next: string) => AppLockVerifyResult;
}

const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(isAppLockEnabled);
  const [locked, setLocked] = useState(isEnabled);
  const backgroundedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        const at = backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        if (at != null && Date.now() - at >= RELOCK_BACKGROUND_MS && isAppLockEnabled()) {
          setLocked(true);
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        backgroundedAtRef.current = Date.now();
      }
    });
    return () => subscription.remove();
  }, []);

  const unlock = useCallback((password: string): AppLockVerifyResult => {
    const result = verifyAppLockPassword(password);
    if (result === 'ok') {
      setLocked(false);
    }
    return result;
  }, []);

  const enable = useCallback((password: string) => {
    setAppLockPassword(password);
    setIsEnabled(true);
    setLocked(false);
  }, []);

  const disable = useCallback((password: string): AppLockVerifyResult => {
    const result = verifyAppLockPassword(password);
    if (result === 'ok') {
      clearAppLock();
      setIsEnabled(false);
      setLocked(false);
    }
    return result;
  }, []);

  const change = useCallback((current: string, next: string): AppLockVerifyResult => {
    const result = verifyAppLockPassword(current);
    if (result === 'ok') {
      setAppLockPassword(next);
    }
    return result;
  }, []);

  const value = useMemo(
    () => ({ locked, isEnabled, unlock, enable, disable, change }),
    [locked, isEnabled, unlock, enable, disable, change]
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock(): AppLockContextValue {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock must be used within AppLockProvider');
  return ctx;
}
