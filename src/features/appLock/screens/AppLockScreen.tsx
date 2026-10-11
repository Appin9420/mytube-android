/**
 * Startup lock screen shown by the app lock gate. Screen lock only —
 * mirror of the desktop build's startup password window.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppLock } from '../../../app/providers/AppLockProvider';
import { getLockoutRemainingMs } from '../../../core/config/appLockStorage';

export function AppLockScreen() {
  const { t } = useTranslation();
  const { unlock } = useAppLock();
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      const remainingMs = getLockoutRemainingMs();
      setLockoutSeconds(Math.ceil(remainingMs / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = useCallback(() => {
    const result = unlock(password);
    if (result === 'ok') {
      setPassword('');
      setErrorText(null);
      return;
    }
    if (result === 'locked') {
      const seconds = Math.ceil(getLockoutRemainingMs() / 1000);
      setLockoutSeconds(seconds);
      setErrorText(t('appLockLockedOut', { seconds }));
      return;
    }
    setErrorText(t('appLockWrongPassword'));
  }, [unlock, password, t]);

  const lockedOut = lockoutSeconds > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('appName')}</Text>
      <Text style={styles.subtitle}>{t('appLockEnterPassword')}</Text>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={password}
        onChangeText={text => {
          setPassword(text);
          setErrorText(null);
        }}
        placeholder={t('appLockEnterPassword')}
        placeholderTextColor="#666"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSubmit}
        editable={!lockedOut}
        autoFocus
      />
      {errorText != null && <Text style={styles.errorText}>{errorText}</Text>}
      <TouchableOpacity
        style={[styles.unlockButton, lockedOut && styles.unlockButtonDisabled]}
        onPress={handleSubmit}
        disabled={lockedOut || password.length === 0}
        accessibilityLabel={t('appLockUnlock')}
        accessibilityRole="button"
      >
        <Text style={styles.unlockButtonText}>
          {lockedOut ? t('appLockLockedOut', { seconds: lockoutSeconds }) : t('appLockUnlock')}
        </Text>
      </TouchableOpacity>
      <Text style={styles.hintText}>{t('appLockHint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
  },
  unlockButton: {
    marginTop: 20,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  unlockButtonDisabled: {
    backgroundColor: '#3a3a3a',
  },
  unlockButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  hintText: {
    marginTop: 28,
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
