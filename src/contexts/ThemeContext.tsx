import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useThemeSettings, type ThemeId } from '@/hooks/useThemeSettings';

type ThemeContextValue = {
  activeTheme: ThemeId;
  previewTheme: ThemeId | null;
  isPreviewing: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PREVIEW_ENABLED_KEY = 'zz_theme_preview_enabled';
const PREVIEW_THEME_KEY = 'zz_theme_preview_id';

const readPreview = (): { enabled: boolean; theme: ThemeId | null } => {
  try {
    const enabled = localStorage.getItem(PREVIEW_ENABLED_KEY) === 'true';
    const theme = (localStorage.getItem(PREVIEW_THEME_KEY) as ThemeId | null) ?? null;
    return { enabled, theme: theme && ['artisan', 'editorial', 'brutalist'].includes(theme) ? theme : null };
  } catch {
    return { enabled: false, theme: null };
  }
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data } = useThemeSettings();
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeId | null>(null);

  // Track preview changes (admin toggles) across tabs.
  useEffect(() => {
    const sync = () => {
      const p = readPreview();
      setPreviewEnabled(p.enabled);
      setPreviewTheme(p.theme);
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('zz-theme-preview-change', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('zz-theme-preview-change', sync as EventListener);
    };
  }, []);

  const activeTheme = (data?.activeTheme ?? 'editorial') as ThemeId;
  const effectiveTheme = previewEnabled && previewTheme ? previewTheme : activeTheme;

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
  }, [effectiveTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      activeTheme,
      previewTheme: previewTheme,
      isPreviewing: Boolean(previewEnabled && previewTheme),
    }),
    [activeTheme, previewEnabled, previewTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const themePreviewStorage = {
  enable(theme: ThemeId) {
    localStorage.setItem(PREVIEW_ENABLED_KEY, 'true');
    localStorage.setItem(PREVIEW_THEME_KEY, theme);
    window.dispatchEvent(new Event('zz-theme-preview-change'));
  },
  disable() {
    localStorage.setItem(PREVIEW_ENABLED_KEY, 'false');
    localStorage.removeItem(PREVIEW_THEME_KEY);
    window.dispatchEvent(new Event('zz-theme-preview-change'));
  },
};
