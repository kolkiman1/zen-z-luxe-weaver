import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useThemeSettings, type ThemeId } from '@/hooks/useThemeSettings';
import { defaultThemePack } from '@/lib/themePack';

type ThemeContextValue = {
  /**
   * Theme selected globally (persisted in backend).
   * Note: UI should typically use `theme` (effective theme).
   */
  activeTheme: ThemeId;
  /**
   * Effective theme used for rendering.
   * If admin preview is enabled, this may differ from `activeTheme`.
   */
  theme: ThemeId;
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
  const themePack = data?.themePack ?? defaultThemePack;

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
  }, [effectiveTheme]);

  // Apply theme token overrides from backend (colors/typography/radius/shadows).
  useEffect(() => {
    const el = document.documentElement;
    const tokens = themePack.themes[effectiveTheme] ?? {};
    // Avoid token "leaks" when switching: set all keys from all themes.
    const allKeys = new Set<string>();
    (Object.values(themePack.themes) as Array<Record<string, string>>).forEach((t) => {
      Object.keys(t || {}).forEach((k) => allKeys.add(k));
    });

    allKeys.forEach((k) => {
      const v = tokens[k];
      if (typeof v === 'string' && v.length > 0) {
        el.style.setProperty(`--${k}`, v);
      } else {
        // If a key is missing in the current theme, clear it so CSS defaults apply.
        el.style.removeProperty(`--${k}`);
      }
    });
  }, [effectiveTheme, themePack]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      activeTheme,
      theme: effectiveTheme,
      previewTheme: previewTheme,
      isPreviewing: Boolean(previewEnabled && previewTheme),
    }),
    [activeTheme, effectiveTheme, previewEnabled, previewTheme]
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

