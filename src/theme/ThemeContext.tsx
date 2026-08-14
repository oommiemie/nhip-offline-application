import React, { createContext, useContext, useMemo, useState } from 'react';

import { resolveColors, resolveKpi, resolveTones } from './palettes';
import { monoFontFamily, uiFontFamily } from './fonts';
import type {
  DensityId,
  DensitySpec,
  FestivalId,
  FontId,
  FontSizeId,
  FontSizes,
  FontWeight,
  Mode,
  PaletteId,
  PanelMode,
  Theme,
  ThemeSettings,
} from './types';

const DEFAULT_SETTINGS: ThemeSettings = {
  palette: 'moph',
  mode: 'light',
  festival: 'none',
  fontId: 'googlesans',
  fontSize: '14',
  density: 'normal',
  panelMode: 'drawer',
  reduceMotion: false,
};

/** แถว/คอนโทรลตามระดับความหนาแน่น — ปรับให้เหมาะ touch target ของแท็บเล็ต (≥44px) */
const DENSITIES: Record<DensityId, DensitySpec> = {
  compact: { rowH: 48, controlH: 40, inputH: 44, sp: 6 },
  normal: { rowH: 60, controlH: 44, inputH: 48, sp: 8 },
  comfortable: { rowH: 72, controlH: 48, inputH: 52, sp: 11 },
};

/** สเกลตัวอักษรอิงขนาดฐาน — base 14 ให้ 12/13/14/15/16/20/24/32 ตรงกับไฟล์ Figma */
const buildFontSizes = (baseId: FontSizeId): FontSizes => {
  const base = parseInt(baseId, 10);
  return {
    xs: base - 2,
    sm: base - 1,
    base,
    md: base + 1,
    lg: base + 2,
    xl: base + 6,
    xxl: base + 10,
    kpi: base + 18,
    hero: base + 18,
  };
};

interface ThemeContextValue {
  theme: Theme;
  settings: ThemeSettings;
  setPalette: (p: PaletteId) => void;
  setMode: (m: Mode) => void;
  setFestival: (f: FestivalId) => void;
  setFontId: (f: FontId) => void;
  setFontSize: (s: FontSizeId) => void;
  setDensity: (d: DensityId) => void;
  setPanelMode: (p: PanelMode) => void;
  setReduceMotion: (v: boolean) => void;
  resetAppearance: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);

  const theme = useMemo<Theme>(() => {
    const colors = resolveColors(settings.palette, settings.mode, settings.festival);
    const isDark = settings.mode === 'dark';
    const shadowColor = isDark ? '#000000' : '#0F3D2E';
    return {
      palette: settings.palette,
      mode: settings.mode,
      isDark,
      festival: settings.festival,
      colors,
      tones: resolveTones(colors, settings.palette, settings.mode),
      kpi: resolveKpi(colors, settings.palette, settings.mode),
      font: (weight: FontWeight = '400') => uiFontFamily(settings.fontId, weight),
      mono: (weight: FontWeight = '400') => monoFontFamily(weight),
      fs: buildFontSizes(settings.fontSize),
      density: DENSITIES[settings.density],
      radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
      shadow: {
        sm: {
          shadowColor,
          shadowOpacity: isDark ? 0.35 : 0.05,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        },
        md: {
          shadowColor,
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
        lg: {
          shadowColor,
          shadowOpacity: isDark ? 0.55 : 0.18,
          shadowRadius: 28,
          shadowOffset: { width: 0, height: 14 },
          elevation: 12,
        },
      },
      reduceMotion: settings.reduceMotion,
    };
  }, [settings]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      settings,
      setPalette: (palette) => setSettings((s) => ({ ...s, palette, festival: 'none' })),
      setMode: (mode) => setSettings((s) => ({ ...s, mode })),
      setFestival: (festival) => setSettings((s) => ({ ...s, festival })),
      setFontId: (fontId) => setSettings((s) => ({ ...s, fontId })),
      setFontSize: (fontSize) => setSettings((s) => ({ ...s, fontSize })),
      setDensity: (density) => setSettings((s) => ({ ...s, density })),
      setPanelMode: (panelMode) => setSettings((s) => ({ ...s, panelMode })),
      setReduceMotion: (reduceMotion) => setSettings((s) => ({ ...s, reduceMotion })),
      resetAppearance: () => setSettings(DEFAULT_SETTINGS),
    }),
    [theme, settings]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext ต้องอยู่ภายใน <ThemeProvider>');
  return ctx;
};

/** hook หลักสำหรับดึงธีมไปใช้ในคอมโพเนนต์ */
export const useTheme = (): Theme => useThemeContext().theme;
