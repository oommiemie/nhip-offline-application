import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { resolveColors, resolveFestive, resolveKpi, resolveTones } from './palettes';
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
  ModePref,
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
  sidebar: 'normal',
  fontBold: false,
  language: 'th',
};

/** ตัวหนาทั้งระบบ = ดันน้ำหนักขึ้นหนึ่งขั้น (700 คงเดิม — ไม่มีไฟล์หนากว่านั้น) */
const BOLD_BUMP: Record<FontWeight, FontWeight> = { '400': '500', '500': '600', '600': '700', '700': '700' };

/** โหมดอัตโนมัติอิงเวลาเครื่อง: 06:00–17:59 สว่าง · 18:00–05:59 มืด */
const isNightNow = (): boolean => {
  const h = new Date().getHours();
  return h >= 18 || h < 6;
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
  setMode: (m: ModePref) => void;
  setFestival: (f: FestivalId) => void;
  setFontId: (f: FontId) => void;
  setFontSize: (s: FontSizeId) => void;
  setDensity: (d: DensityId) => void;
  setPanelMode: (p: PanelMode) => void;
  setReduceMotion: (v: boolean) => void;
  setSidebar: (v: 'normal' | 'compact') => void;
  setFontBold: (v: boolean) => void;
  setLanguage: (v: 'th' | 'en') => void;
  resetAppearance: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  // 'auto' = อิงเวลาเครื่อง — เช็คทุกนาทีเฉพาะตอนเปิดโหมดนี้ ข้ามเส้น 06:00/18:00 แล้วสลับเอง
  const [autoDark, setAutoDark] = useState(isNightNow);
  useEffect(() => {
    if (settings.mode !== 'auto') return;
    const check = () => setAutoDark(isNightNow());
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [settings.mode]);

  const theme = useMemo<Theme>(() => {
    const mode: Mode = settings.mode === 'auto' ? (autoDark ? 'dark' : 'light') : settings.mode;
    const colors = resolveColors(settings.palette, mode, settings.festival);
    const isDark = mode === 'dark';
    const shadowColor = isDark ? '#000000' : '#0F3D2E';
    return {
      palette: settings.palette,
      mode,
      isDark,
      festival: settings.festival,
      colors,
      tones: resolveTones(colors, settings.palette, mode, settings.festival),
      kpi: resolveKpi(colors, settings.palette, mode, settings.festival),
      festive: resolveFestive(settings.festival, mode),
      font: (weight: FontWeight = '400') => uiFontFamily(settings.fontId, settings.fontBold ? BOLD_BUMP[weight] : weight),
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
  }, [settings, autoDark]);

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
      setSidebar: (sidebar) => setSettings((s) => ({ ...s, sidebar })),
      setFontBold: (fontBold) => setSettings((s) => ({ ...s, fontBold })),
      setLanguage: (language) => setSettings((s) => ({ ...s, language })),
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
