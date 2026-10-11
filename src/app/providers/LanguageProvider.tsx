/**
 * i18n Language provider. Phase 10 + Language picker: keys, es locale, display names.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useAuth } from '../../core/auth/AuthContext';
import { useSettingsQuery } from '../../core/repositories';
import {
  getStoredLanguage,
  setStoredLanguage,
} from '../../core/config/languageStorage';

const enTranslation = {
  appName: 'MyTube',
  home: 'Videos',
  downloads: 'Downloads',
  subscriptions: 'Subscriptions',
  collections: 'Collections',
  settings: 'Settings',
  video: 'Video',
  collection: 'Collection',
  author: 'Author',
  manage: 'Manage',
  search: 'Search',
  instruction: 'Instruction',
  account: 'Account',
  about: 'About',
  logOut: 'Log out',
  loading: 'Loading…',
  language: 'Language',
  languageEn: 'English',
  languageEs: 'Español',
  languageZh: '中文',

  tabAllVideos: 'ALL VIDEOS',
  tabCollections: 'COLLECTIONS',
  tabHistory: 'HISTORY',

  emptyCollections: 'No collections yet.',
  emptyHistory: 'No history yet.',
  emptyDownloadQueue: 'No active or queued downloads.',
  emptyDownloadHistory: 'No download history yet.',
  emptyVideos: 'No videos found.',

  modalAddToCollection: 'Add to collection',
  modalPlaybackSpeed: 'Playback speed',
  modalDeleteVideoTitle: 'Delete video?',
  modalDeleteCollectionTitle: 'Delete collection?',
  modalTagsTitle: 'Edit tags',

  actionSave: 'Save',
  actionCancel: 'Cancel',
  actionDelete: 'Delete',
  actionRetry: 'Retry',
  actionBack: 'Back',

  sectionQueue: 'Queue',
  sectionHistory: 'History',
  loadingDownloads: 'Loading downloads…',
  searchVideosPlaceholder: 'Search videos',
  menu: 'Menu',
  goToHome: 'Go to home',

  startupSlow:
    'Startup is taking longer than expected. Check backend URL/server and retry.',
  retryStartup: 'Retry startup',
  changeBackendUrl: 'Change backend URL',

  appLock: 'App lock',
  appLockEnable: 'Enable app lock',
  appLockChange: 'Change app lock password',
  appLockDisable: 'Disable app lock',
  appLockCurrentPassword: 'Current password',
  appLockNewPassword: 'New password (min 4 chars)',
  appLockConfirmPassword: 'Confirm new password',
  appLockMismatch: 'Passwords do not match',
  appLockTooShort: 'Password must be at least 4 characters',
  appLockEnterPassword: 'Enter app lock password',
  appLockUnlock: 'Unlock',
  appLockWrongPassword: 'Wrong password, {{count}} attempts left',
  appLockLockedOut: 'Too many attempts, retry in {{seconds}}s',
  appLockHint:
    'Screen lock only, not a security boundary. Forgot the password? Clear the app data in system settings.',
  appLockSaved: 'App lock updated.',
};

const esTranslation = {
  appName: 'MyTube',
  home: 'Vídeos',
  downloads: 'Descargas',
  subscriptions: 'Suscripciones',
  collections: 'Colecciones',
  settings: 'Ajustes',
  video: 'Vídeo',
  collection: 'Colección',
  author: 'Autor',
  manage: 'Gestionar',
  search: 'Buscar',
  instruction: 'Instrucción',
  account: 'Cuenta',
  about: 'Acerca de',
  logOut: 'Cerrar sesión',
  loading: 'Cargando…',
  language: 'Idioma',
  languageEn: 'English',
  languageEs: 'Español',
  languageZh: '中文',

  tabAllVideos: 'TODOS LOS VÍDEOS',
  tabCollections: 'COLECCIONES',
  tabHistory: 'HISTORIAL',

  emptyCollections: 'Aún no hay colecciones.',
  emptyHistory: 'Aún no hay historial.',
  emptyDownloadQueue: 'No hay descargas activas ni en cola.',
  emptyDownloadHistory: 'Aún no hay historial de descargas.',
  emptyVideos: 'No se encontraron vídeos.',

  modalAddToCollection: 'Añadir a colección',
  modalPlaybackSpeed: 'Velocidad de reproducción',
  modalDeleteVideoTitle: '¿Eliminar vídeo?',
  modalDeleteCollectionTitle: '¿Eliminar colección?',
  modalTagsTitle: 'Editar etiquetas',

  actionSave: 'Guardar',
  actionCancel: 'Cancelar',
  actionDelete: 'Eliminar',
  actionRetry: 'Reintentar',
  actionBack: 'Atrás',

  sectionQueue: 'Cola',
  sectionHistory: 'Historial',
  loadingDownloads: 'Cargando descargas…',
  searchVideosPlaceholder: 'Buscar vídeos',
  menu: 'Menú',
  goToHome: 'Ir al inicio',

  startupSlow:
    'El inicio está tardando más de lo esperado. Verifica la URL del servidor y reintenta.',
  retryStartup: 'Reintentar inicio',
  changeBackendUrl: 'Cambiar URL del servidor',

  appLock: 'Bloqueo de aplicación',
  appLockEnable: 'Activar bloqueo de aplicación',
  appLockChange: 'Cambiar contraseña de bloqueo',
  appLockDisable: 'Desactivar bloqueo de aplicación',
  appLockCurrentPassword: 'Contraseña actual',
  appLockNewPassword: 'Nueva contraseña (mín. 4)',
  appLockConfirmPassword: 'Confirmar nueva contraseña',
  appLockMismatch: 'Las contraseñas no coinciden',
  appLockTooShort: 'Mínimo 4 caracteres',
  appLockEnterPassword: 'Introduce la contraseña de bloqueo',
  appLockUnlock: 'Desbloquear',
  appLockWrongPassword: 'Contraseña incorrecta, {{count}} intentos restantes',
  appLockLockedOut: 'Demasiados intentos, reintenta en {{seconds}}s',
  appLockHint:
    'Solo bloqueo de pantalla, no es un límite de seguridad. ¿Olvidaste la contraseña? Borra los datos de la app.',
  appLockSaved: 'Bloqueo de aplicación actualizado.',
};

const zhTranslation = {
  appName: 'MyTube',
  home: '视频',
  downloads: '下载',
  subscriptions: '订阅',
  collections: '收藏',
  settings: '设置',
  video: '视频',
  collection: '收藏夹',
  author: '作者',
  manage: '管理',
  search: '搜索',
  instruction: '使用说明',
  account: '账户',
  about: '关于',
  logOut: '退出登录',
  loading: '加载中…',
  language: '语言',
  languageEn: 'English',
  languageEs: 'Español',
  languageZh: '中文',

  tabAllVideos: '所有视频',
  tabCollections: '收藏夹',
  tabHistory: '历史',

  emptyCollections: '尚无收藏。',
  emptyHistory: '尚无历史记录。',
  emptyDownloadQueue: '没有进行中或排队的下载。',
  emptyDownloadHistory: '尚无下载历史。',
  emptyVideos: '未找到视频。',

  modalAddToCollection: '加入收藏夹',
  modalPlaybackSpeed: '播放速度',
  modalDeleteVideoTitle: '删除该视频?',
  modalDeleteCollectionTitle: '删除该收藏夹?',
  modalTagsTitle: '编辑标签',

  actionSave: '保存',
  actionCancel: '取消',
  actionDelete: '删除',
  actionRetry: '重试',
  actionBack: '返回',

  sectionQueue: '队列',
  sectionHistory: '历史',
  loadingDownloads: '正在加载下载…',
  searchVideosPlaceholder: '搜索视频',
  menu: '菜单',
  goToHome: '回到首页',

  startupSlow: '启动时间比预期更长。请检查服务器地址并重试。',
  retryStartup: '重试启动',
  changeBackendUrl: '更改服务器地址',

  appLock: '启动密码',
  appLockEnable: '开启启动密码',
  appLockChange: '修改启动密码',
  appLockDisable: '关闭启动密码',
  appLockCurrentPassword: '当前密码',
  appLockNewPassword: '新密码(至少 4 位)',
  appLockConfirmPassword: '确认新密码',
  appLockMismatch: '两次输入不一致',
  appLockTooShort: '密码至少 4 位',
  appLockEnterPassword: '输入启动密码',
  appLockUnlock: '解锁',
  appLockWrongPassword: '密码错误,剩余 {{count}} 次机会',
  appLockLockedOut: '尝试次数过多,{{seconds}} 秒后再试',
  appLockHint: '仅屏幕锁,非安全边界。忘记密码请在系统设置中清除本应用数据。',
  appLockSaved: '启动密码已更新。',
};

const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  zh: { translation: zhTranslation },
};

/** Locale codes supported by the language picker. */
export const SUPPORTED_LOCALE_CODES = ['en', 'es', 'zh'] as const;
export type SupportedLocaleCode = (typeof SUPPORTED_LOCALE_CODES)[number];
const DEFAULT_LOCALE_CODE: SupportedLocaleCode = 'en';

const SUPPORTED_LOCALE_CODES_SET = new Set<string>(SUPPORTED_LOCALE_CODES);

export function isSupportedLocaleCode(value: unknown): value is SupportedLocaleCode {
  return typeof value === 'string' && SUPPORTED_LOCALE_CODES_SET.has(value);
}

export function normalizeLocaleCode(
  value: unknown,
  fallback: SupportedLocaleCode = DEFAULT_LOCALE_CODE
): SupportedLocaleCode {
  return isSupportedLocaleCode(value) ? value : fallback;
}

/** Display name for each locale (for picker). Use t('languageEn'), t('languageEs') in UI. */
export const LOCALE_LABEL_KEYS: Record<(typeof SUPPORTED_LOCALE_CODES)[number], string> = {
  en: 'languageEn',
  es: 'languageEs',
  zh: 'languageZh',
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    // Restore the last locale chosen on this device; the backend settings API
    // does not persist a language field.
    lng: normalizeLocaleCode(getStoredLanguage() ?? undefined),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

interface LanguageContextValue {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { loading, loginRequired, hasValidSession } = useAuth();
  const [language, setLanguageState] = useState<string>(
    normalizeLocaleCode(i18n.language)
  );

  const canLoadSettingsLanguage = !loading && (!loginRequired || hasValidSession);
  const settingsQuery = useSettingsQuery({ enabled: canLoadSettingsLanguage });

  const setLanguage = useCallback((lang: string) => {
    const nextLanguage = normalizeLocaleCode(lang, normalizeLocaleCode(i18n.language));
    i18n.changeLanguage(nextLanguage);
    setStoredLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  useEffect(() => {
    const handleLanguageChanged = (nextLanguage: string) => {
      setLanguageState(normalizeLocaleCode(nextLanguage));
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  useEffect(() => {
    const serverLanguage = settingsQuery.data?.language;
    if (!isSupportedLocaleCode(serverLanguage)) return;
    if (serverLanguage === language) return;
    setLanguage(serverLanguage);
  }, [settingsQuery.data?.language, language, setLanguage]);

  const value: LanguageContextValue = { language, setLanguage };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
