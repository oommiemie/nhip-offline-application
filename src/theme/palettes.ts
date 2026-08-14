import type { BaseColors, FestivalId, KpiColors, Mode, PaletteId, Tone, ToneStyle } from './types';

/** แปลง token HSL แบบ '200 40% 98%' (รูปแบบเดียวกับ CSS variables ของ desktop comp) เป็นสีที่ RN ใช้ได้ */
const h = (v: string): string => {
  const [hue, s, l] = v.split(' ');
  return `hsl(${hue}, ${s}, ${l})`;
};

/** เติมความโปร่งใสให้สี hex (#RRGGBB) หรือ hsl(...) */
export const withAlpha = (color: string, alpha: number): string => {
  if (color.startsWith('#') && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('hsl(')) {
    return color.replace('hsl(', 'hsla(').replace(/\)$/, `, ${alpha})`);
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(/\)$/, `, ${alpha})`);
  }
  return color;
};

/* ------------------------------------------------------------------ */
/* 1) ธีมหลัก MOPH Green — ค่าตรงจากไฟล์ Figma "NHIP Offline Application" */
/* ------------------------------------------------------------------ */

const mophLight: BaseColors = {
  background: '#F8FAFC',
  foreground: '#212529',
  card: '#FFFFFF',
  cardForeground: '#212529',
  popover: '#FFFFFF',
  popoverForeground: '#212529',
  primary: '#2D6A4F',
  primaryForeground: '#FFFFFF',
  primaryStrong: '#134E3A',
  secondary: '#1B4332',
  secondaryForeground: '#FFFFFF',
  muted: '#F1F3F5',
  mutedForeground: '#6C757D',
  accent: '#40916C',
  accentForeground: '#FFFFFF',
  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',
  success: '#16A34A',
  successForeground: '#FFFFFF',
  warning: '#F59E0B',
  warningForeground: '#78350F',
  info: '#2563EB',
  infoForeground: '#FFFFFF',
  purple: '#7C3AED',
  border: '#E5E7EB',
  input: '#E5E7EB',
  inputBg: '#F1F3F5',
  ring: '#52B788',
  surface1: '#FFFFFF',
  surface2: '#F8F9FA',
  surface3: '#F1F3F5',
  sidebar: '#DBF2E3',
  sidebarActive: '#B7E4C7',
  tableHeader: '#F8F9FA',
  tableRowAlt: '#FBFCFD',
  tableRowSelected: '#E7F5EC',
  alertBand: '#B91C1C',
  alertBandForeground: '#FFFFFF',
  terminalBg: '#0B2D22',
  terminalCmd: '#D8F3DC',
  terminalOk: '#74C69D',
  terminalErr: '#F8A0A0',
  terminalInfo: '#8FB8A5',
};

const mophDark: BaseColors = {
  background: '#0D1512',
  foreground: '#E4EDE7',
  card: '#131E18',
  cardForeground: '#E4EDE7',
  popover: '#16231C',
  popoverForeground: '#E4EDE7',
  primary: '#52B788',
  primaryForeground: '#06110C',
  primaryStrong: '#2D6A4F',
  secondary: '#1E3128',
  secondaryForeground: '#DFEDE4',
  muted: '#1C2922',
  mutedForeground: '#9DB4A6',
  accent: '#74C69D',
  accentForeground: '#06110C',
  destructive: '#F87171',
  destructiveForeground: '#1F0606',
  success: '#4ADE80',
  successForeground: '#052E16',
  warning: '#FBBF24',
  warningForeground: '#271A03',
  info: '#60A5FA',
  infoForeground: '#061426',
  purple: '#A78BFA',
  border: '#26382E',
  input: '#2C4136',
  inputBg: '#1A2620',
  ring: '#52B788',
  surface1: '#131E18',
  surface2: '#182620',
  surface3: '#1E2F26',
  sidebar: '#0F1E17',
  sidebarActive: '#1D3A2B',
  tableHeader: '#182620',
  tableRowAlt: '#111B15',
  tableRowSelected: '#1D3A2C',
  alertBand: '#9F1D1D',
  alertBandForeground: '#FFE9E9',
  terminalBg: '#08211A',
  terminalCmd: '#C9EBD2',
  terminalOk: '#74C69D',
  terminalErr: '#F8A0A0',
  terminalInfo: '#84A996',
};

/* ------------------------------------------------------------------ */
/* 2) ธีมทางเลือก — พอร์ต HSL variables จาก NHIP Desktop.dc.html        */
/* ------------------------------------------------------------------ */

/** ชุด HSL บางส่วน (รูปแบบเดียวกับบล็อก [data-theme] ใน CSS เดิม) */
interface HslSet {
  background?: string;
  foreground?: string;
  card?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  destructive?: string;
  success?: string;
  warning?: string;
  warningForeground?: string;
  info?: string;
  border?: string;
  input?: string;
  ring?: string;
  surface1?: string;
  surface2?: string;
  surface3?: string;
  tableHeader?: string;
  tableRowAlt?: string;
  tableRowSelected?: string;
  alertBand?: string;
}

const oceanLight: Required<Omit<HslSet, 'primaryForeground' | 'warningForeground'>> & HslSet = {
  background: '200 40% 98%',
  foreground: '205 45% 15%',
  card: '0 0% 100%',
  primary: '178 62% 33%',
  primaryForeground: '180 40% 98%',
  secondary: '206 55% 22%',
  muted: '200 30% 94%',
  mutedForeground: '205 14% 44%',
  accent: '190 70% 40%',
  destructive: '4 62% 50%',
  success: '158 52% 36%',
  warning: '38 88% 44%',
  warningForeground: '40 60% 12%',
  info: '200 72% 42%',
  border: '200 28% 87%',
  input: '200 28% 90%',
  ring: '178 62% 40%',
  surface1: '0 0% 100%',
  surface2: '200 35% 96%',
  surface3: '200 32% 92%',
  tableHeader: '200 34% 95%',
  tableRowAlt: '200 30% 98%',
  tableRowSelected: '178 40% 92%',
  alertBand: '6 66% 46%',
};

const oceanDark: typeof oceanLight = {
  background: '205 35% 10%',
  foreground: '195 22% 92%',
  card: '205 32% 13%',
  primary: '176 52% 45%',
  primaryForeground: '205 40% 8%',
  secondary: '203 28% 21%',
  muted: '205 25% 18%',
  mutedForeground: '200 14% 66%',
  accent: '188 58% 48%',
  destructive: '4 58% 56%',
  success: '158 42% 45%',
  warning: '38 78% 55%',
  warningForeground: '40 60% 10%',
  info: '200 62% 55%',
  border: '205 20% 23%',
  input: '205 20% 25%',
  ring: '176 52% 52%',
  surface1: '205 32% 13%',
  surface2: '205 28% 16%',
  surface3: '205 26% 20%',
  tableHeader: '205 28% 17%',
  tableRowAlt: '205 30% 15%',
  tableRowSelected: '176 32% 22%',
  alertBand: '6 58% 44%',
};

const HSL_THEMES: Record<Exclude<PaletteId, 'moph' | 'ocean'>, { light: HslSet; dark: HslSet }> = {
  mint: {
    light: { background: '150 32% 98%', foreground: '170 35% 14%', primary: '162 48% 34%', secondary: '190 45% 23%', muted: '150 26% 93%', mutedForeground: '170 12% 42%', accent: '172 52% 38%', border: '150 20% 86%', input: '150 20% 89%', ring: '162 48% 40%', surface2: '150 28% 96%', surface3: '150 24% 92%', tableHeader: '150 28% 95%', tableRowAlt: '150 26% 98%', tableRowSelected: '162 34% 91%' },
    dark: { background: '168 22% 10%', foreground: '150 18% 92%', card: '168 20% 13%', primary: '160 44% 46%', secondary: '180 20% 21%', muted: '168 18% 18%', mutedForeground: '150 12% 66%', accent: '172 46% 48%', border: '168 16% 23%', input: '168 16% 25%', surface1: '168 20% 13%', surface2: '168 18% 16%', surface3: '168 16% 20%', tableHeader: '168 18% 17%', tableRowAlt: '168 20% 15%', tableRowSelected: '160 30% 22%' },
  },
  deepsea: {
    light: { background: '210 30% 96%', foreground: '212 55% 13%', primary: '212 62% 26%', secondary: '212 55% 18%', muted: '210 26% 91%', mutedForeground: '212 16% 40%', accent: '180 62% 34%', border: '210 24% 84%', input: '210 24% 88%', ring: '180 62% 38%', surface2: '210 30% 94%', surface3: '210 26% 90%', tableHeader: '210 28% 93%', tableRowAlt: '210 26% 97%', tableRowSelected: '180 34% 90%' },
    dark: { background: '213 42% 8%', foreground: '196 24% 91%', card: '213 38% 11%', primary: '178 55% 45%', secondary: '213 34% 18%', muted: '213 28% 16%', mutedForeground: '203 16% 64%', accent: '186 60% 50%', border: '213 26% 21%', input: '213 26% 23%', surface1: '213 38% 11%', surface2: '213 32% 14%', surface3: '213 28% 18%', tableHeader: '213 30% 15%', tableRowAlt: '213 36% 12%', tableRowSelected: '178 34% 20%' },
  },
  sky: {
    light: { background: '0 0% 100%', foreground: '212 60% 8%', primary: '212 88% 30%', secondary: '212 70% 16%', muted: '210 24% 93%', mutedForeground: '212 26% 30%', accent: '200 80% 34%', border: '210 26% 76%', input: '210 26% 80%', ring: '212 88% 36%', surface2: '206 32% 96%', surface3: '206 28% 92%', tableHeader: '206 30% 94%', tableRowAlt: '206 26% 97.5%', tableRowSelected: '212 44% 90%', success: '158 60% 26%', warning: '34 92% 34%', warningForeground: '0 0% 100%', destructive: '2 72% 40%', info: '206 80% 32%' },
    dark: { background: '214 40% 7%', foreground: '0 0% 99%', card: '214 34% 11%', primary: '203 82% 62%', primaryForeground: '214 45% 8%', secondary: '214 28% 20%', muted: '214 24% 17%', mutedForeground: '206 20% 78%', accent: '196 76% 58%', border: '214 22% 28%', input: '214 22% 30%', surface1: '214 34% 11%', surface2: '214 28% 15%', surface3: '214 24% 19%', tableHeader: '214 26% 16%', tableRowAlt: '214 32% 12.5%', tableRowSelected: '206 36% 24%', success: '158 48% 54%', warning: '38 88% 62%', destructive: '4 70% 64%' },
  },
  warm: {
    light: { background: '38 32% 97%', foreground: '28 28% 15%', card: '36 40% 99%', primary: '178 44% 31%', secondary: '196 34% 24%', muted: '36 24% 92%', mutedForeground: '30 14% 40%', accent: '22 48% 44%', border: '36 20% 84%', input: '36 20% 88%', ring: '178 44% 38%', surface1: '36 40% 99%', surface2: '36 28% 95%', surface3: '36 24% 91%', tableHeader: '36 26% 94%', tableRowAlt: '36 24% 97%', tableRowSelected: '178 26% 90%' },
    dark: { background: '28 16% 10%', foreground: '36 20% 91%', card: '28 14% 13%', primary: '176 40% 44%', secondary: '30 14% 21%', muted: '28 12% 18%', mutedForeground: '34 12% 66%', accent: '24 44% 52%', border: '28 12% 23%', input: '28 12% 25%', surface1: '28 14% 13%', surface2: '28 12% 16%', surface3: '28 10% 20%', tableHeader: '28 12% 17%', tableRowAlt: '28 14% 15%', tableRowSelected: '176 24% 21%' },
  },
  coral: {
    light: { background: '26 45% 98%', foreground: '16 32% 16%', primary: '12 70% 46%', secondary: '352 44% 26%', muted: '26 32% 93%', mutedForeground: '18 15% 42%', accent: '36 80% 46%', border: '26 26% 86%', input: '26 26% 89%', ring: '12 70% 50%', surface2: '26 40% 96%', surface3: '26 34% 92%', tableHeader: '26 36% 95%', tableRowAlt: '26 34% 98%', tableRowSelected: '12 48% 93%' },
    dark: { background: '14 24% 9%', foreground: '26 20% 92%', card: '14 22% 12%', primary: '14 66% 56%', secondary: '352 26% 22%', muted: '14 18% 17%', mutedForeground: '24 14% 66%', accent: '36 74% 56%', border: '14 16% 22%', input: '14 16% 24%', surface1: '14 22% 12%', surface2: '14 18% 15%', surface3: '14 16% 19%', tableHeader: '14 18% 16%', tableRowAlt: '14 20% 14%', tableRowSelected: '14 34% 22%' },
  },
  violet: {
    light: { background: '270 40% 98%', foreground: '268 36% 16%', primary: '268 50% 46%', secondary: '250 44% 26%', muted: '270 26% 94%', mutedForeground: '268 13% 44%', accent: '300 48% 48%', border: '270 22% 88%', input: '270 22% 90%', ring: '268 50% 52%', surface2: '270 34% 96%', surface3: '270 28% 93%', tableHeader: '270 30% 95%', tableRowAlt: '270 28% 98%', tableRowSelected: '268 38% 94%' },
    dark: { background: '268 26% 10%', foreground: '270 18% 92%', card: '268 24% 13%', primary: '270 58% 66%', secondary: '250 26% 23%', muted: '268 20% 18%', mutedForeground: '270 14% 68%', accent: '300 50% 64%', border: '268 18% 23%', input: '268 18% 25%', surface1: '268 24% 13%', surface2: '268 20% 16%', surface3: '268 18% 20%', tableHeader: '268 20% 17%', tableRowAlt: '268 22% 15%', tableRowSelected: '270 32% 24%' },
  },
  forest: {
    light: { background: '120 26% 97%', foreground: '150 32% 13%', primary: '146 44% 28%', secondary: '168 40% 20%', muted: '120 20% 93%', mutedForeground: '150 12% 40%', accent: '88 46% 34%', border: '120 18% 85%', input: '120 18% 88%', ring: '146 44% 34%', surface2: '120 24% 95%', surface3: '120 20% 91%', tableHeader: '120 22% 94%', tableRowAlt: '120 20% 97%', tableRowSelected: '146 32% 91%' },
    dark: { background: '150 22% 9%', foreground: '120 16% 92%', card: '150 20% 12%', primary: '145 40% 46%', secondary: '168 24% 21%', muted: '150 16% 17%', mutedForeground: '120 12% 66%', accent: '88 42% 48%', border: '150 14% 22%', input: '150 14% 24%', surface1: '150 20% 12%', surface2: '150 16% 15%', surface3: '150 14% 19%', tableHeader: '150 16% 16%', tableRowAlt: '150 18% 14%', tableRowSelected: '145 28% 21%' },
  },
  berry: {
    light: { background: '340 36% 98%', foreground: '335 34% 16%', primary: '335 56% 40%', secondary: '300 38% 24%', muted: '340 24% 94%', mutedForeground: '335 12% 42%', accent: '12 60% 48%', border: '340 20% 88%', input: '340 20% 90%', ring: '335 56% 46%', surface2: '340 30% 96%', surface3: '340 24% 93%', tableHeader: '340 26% 95%', tableRowAlt: '340 24% 98%', tableRowSelected: '335 38% 93%' },
    dark: { background: '335 24% 10%', foreground: '340 16% 92%', card: '335 22% 13%', primary: '335 50% 58%', secondary: '300 22% 22%', muted: '335 18% 18%', mutedForeground: '340 12% 68%', accent: '14 56% 58%', border: '335 16% 23%', input: '335 16% 25%', surface1: '335 22% 13%', surface2: '335 18% 16%', surface3: '335 16% 20%', tableHeader: '335 18% 17%', tableRowAlt: '335 20% 15%', tableRowSelected: '335 30% 23%' },
  },
};

/** แปลงชุด HSL (ocean + override ของธีม) เป็น BaseColors เต็มรูปแบบ */
const buildHslPalette = (mode: Mode, override: HslSet = {}): BaseColors => {
  const base = mode === 'dark' ? oceanDark : oceanLight;
  const m: Required<HslSet> = { ...base, ...override } as Required<HslSet>;
  const primary = h(m.primary);
  const card = h(m.card);
  const foreground = h(m.foreground);
  return {
    background: h(m.background),
    foreground,
    card,
    cardForeground: foreground,
    popover: card,
    popoverForeground: foreground,
    primary,
    primaryForeground: m.primaryForeground ? h(m.primaryForeground) : '#FFFFFF',
    primaryStrong: h(m.secondary),
    secondary: h(m.secondary),
    secondaryForeground: mode === 'dark' ? foreground : h('200 40% 97%'),
    muted: h(m.muted),
    mutedForeground: h(m.mutedForeground),
    accent: h(m.accent),
    accentForeground: '#FFFFFF',
    destructive: h(m.destructive),
    destructiveForeground: '#FFFFFF',
    success: h(m.success),
    successForeground: '#FFFFFF',
    warning: h(m.warning),
    warningForeground: h(m.warningForeground),
    info: h(m.info),
    infoForeground: '#FFFFFF',
    purple: mode === 'dark' ? '#A78BFA' : '#7C3AED',
    border: h(m.border),
    input: h(m.input),
    inputBg: h(m.background),
    ring: h(m.ring),
    surface1: h(m.surface1),
    surface2: h(m.surface2),
    surface3: h(m.surface3),
    sidebar: h(m.surface2),
    sidebarActive: withAlpha(primary, 0.14),
    tableHeader: h(m.tableHeader),
    tableRowAlt: h(m.tableRowAlt),
    tableRowSelected: h(m.tableRowSelected),
    alertBand: h(m.alertBand),
    alertBandForeground: '#FFFFFF',
    terminalBg: 'hsl(213, 40%, 9%)',
    terminalCmd: 'hsl(160, 40%, 78%)',
    terminalOk: 'hsl(150, 45%, 62%)',
    terminalErr: 'hsl(4, 80% , 76%)',
    terminalInfo: 'hsl(200, 20%, 60%)',
  };
};

/* ------------------------------------------------------------------ */
/* 3) ธีมเทศกาล — override primary/secondary/accent บางส่วน            */
/* ------------------------------------------------------------------ */

const FESTIVALS: Record<Exclude<FestivalId, 'none'>, { light: HslSet; dark: HslSet }> = {
  christmas: {
    light: { primary: '150 44% 25%', secondary: '355 48% 26%', accent: '45 68% 44%', surface2: '150 22% 95%', tableRowSelected: '150 30% 91%' },
    dark: { primary: '150 40% 46%', secondary: '355 26% 24%', accent: '45 66% 56%', surface2: '150 16% 16%', tableRowSelected: '150 26% 21%' },
  },
  newyear: {
    light: { primary: '222 52% 27%', secondary: '222 46% 18%', accent: '44 74% 50%', surface2: '222 24% 95%', tableRowSelected: '44 48% 91%' },
    dark: { primary: '222 52% 60%', secondary: '222 28% 22%', accent: '44 72% 58%', surface2: '222 20% 16%', tableRowSelected: '44 34% 22%' },
  },
  valentine: {
    light: { primary: '335 44% 46%', secondary: '335 38% 26%', accent: '202 58% 58%', surface2: '335 30% 96%', tableRowSelected: '335 34% 93%' },
    dark: { primary: '335 50% 60%', secondary: '335 24% 24%', accent: '202 56% 62%', surface2: '335 18% 16%', tableRowSelected: '335 30% 23%' },
  },
  songkran: {
    light: { primary: '192 62% 38%', secondary: '196 50% 24%', accent: '48 84% 52%', surface2: '192 32% 96%', tableRowSelected: '48 56% 91%' },
    dark: { primary: '192 56% 50%', secondary: '196 28% 22%', accent: '48 80% 58%', surface2: '192 20% 16%', tableRowSelected: '48 34% 22%' },
  },
};

/* ------------------------------------------------------------------ */
/* 4) ประกอบร่างธีม                                                     */
/* ------------------------------------------------------------------ */

export const resolveColors = (palette: PaletteId, mode: Mode, festival: FestivalId): BaseColors => {
  let colors: BaseColors;
  if (palette === 'moph') {
    colors = { ...(mode === 'dark' ? mophDark : mophLight) };
  } else if (palette === 'ocean') {
    colors = buildHslPalette(mode);
  } else {
    colors = buildHslPalette(mode, HSL_THEMES[palette][mode]);
  }
  if (festival !== 'none') {
    const f = FESTIVALS[festival][mode];
    if (f.primary) {
      colors.primary = h(f.primary);
      colors.ring = h(f.primary);
      colors.sidebarActive = withAlpha(h(f.primary), 0.16);
    }
    if (f.secondary) {
      colors.secondary = h(f.secondary);
      colors.primaryStrong = h(f.secondary);
    }
    if (f.accent) colors.accent = h(f.accent);
    if (f.surface2) colors.surface2 = h(f.surface2);
    if (f.tableRowSelected) colors.tableRowSelected = h(f.tableRowSelected);
    if (mode === 'light') colors.primaryForeground = '#FFFFFF';
  }
  return colors;
};

/** สี badge ตามดีไซน์ Figma (ใช้เมื่อเป็นธีม MOPH โหมดสว่างเท่านั้น) */
const MOPH_TONES: Record<Tone, ToneStyle> = {
  success: { bg: '#D1FAE5', fg: '#065F46', border: '#A7F3D0' },
  warning: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
  destructive: { bg: '#FEE2E2', fg: '#991B1B', border: '#FECACA' },
  info: { bg: '#DBEAFE', fg: '#1E40AF', border: '#BFDBFE' },
  purple: { bg: '#F5F3FF', fg: '#8B5CF6', border: '#DDD6FE' },
  neutral: { bg: '#F3F4F6', fg: '#374151', border: '#E5E7EB' },
  primary: { bg: '#D8F3DC', fg: '#1B4332', border: '#B7E4C7' },
};

export const resolveTones = (colors: BaseColors, palette: PaletteId, mode: Mode): Record<Tone, ToneStyle> => {
  if (palette === 'moph' && mode === 'light') return MOPH_TONES;
  const a = mode === 'dark' ? 0.18 : 0.13;
  const b = mode === 'dark' ? 0.42 : 0.34;
  const t = (c: string): ToneStyle => ({ bg: withAlpha(c, a), fg: c, border: withAlpha(c, b) });
  return {
    success: t(colors.success),
    warning: t(colors.warning),
    destructive: t(colors.destructive),
    info: t(colors.info),
    purple: t(colors.purple),
    neutral: { bg: colors.muted, fg: colors.mutedForeground, border: colors.border },
    primary: t(colors.primary),
  };
};

export const resolveKpi = (colors: BaseColors, palette: PaletteId, mode: Mode): KpiColors => {
  if (palette === 'moph' && mode === 'light') {
    return { wait: '#FF9500', progress: '#2563EB', done: '#16A34A', lab: '#7C3AED', fail: '#EF4444', neutral: '#212529' };
  }
  return {
    wait: colors.warning,
    progress: colors.info,
    done: colors.success,
    lab: colors.purple,
    fail: colors.destructive,
    neutral: colors.foreground,
  };
};

export interface PaletteMeta {
  id: PaletteId;
  name: string;
  desc: string;
  tag: string;
  /** สีตัวอย่าง 4 ช่องบนการ์ดเลือกธีม */
  swatches: [string, string, string, string];
}

export const PALETTE_LIST: PaletteMeta[] = [
  { id: 'moph', name: 'MOPH Green', desc: 'ธีมหลักตามดีไซน์ Figma · โทนเขียวกระทรวงสาธารณสุข', tag: 'ค่าเริ่มต้น', swatches: ['#2D6A4F', '#1B4332', '#F8FAFC', '#52B788'] },
  { id: 'ocean', name: 'Ocean Calm', desc: 'มาตรฐานโรงพยาบาล สะอาด เป็นกลาง', tag: 'ธีมหลัก', swatches: [h('178 62% 33%'), h('206 55% 22%'), h('200 40% 98%'), h('190 70% 40%')] },
  { id: 'mint', name: 'Mint Clinic', desc: 'สดชื่น เบา เหมาะกับงานคัดกรอง', tag: 'ธีมหลัก', swatches: [h('162 48% 34%'), h('190 45% 23%'), h('150 32% 98%'), h('172 52% 38%')] },
  { id: 'deepsea', name: 'Deep Sea', desc: 'โทนน้ำเงินเข้ม เหมาะกับเวรดึก', tag: 'ธีมหลัก', swatches: [h('178 55% 45%'), h('213 42% 12%'), h('213 30% 20%'), h('186 60% 50%')] },
  { id: 'sky', name: 'Sky Paper', desc: 'คอนทราสต์สูง ผ่าน WCAG AAA', tag: 'ธีมหลัก', swatches: [h('212 88% 30%'), h('212 70% 16%'), '#FFFFFF', h('200 80% 34%')] },
  { id: 'warm', name: 'Aqua Warm', desc: 'ลดแสงฟ้า ถนอมสายตาที่สุด', tag: 'ธีมหลัก', swatches: [h('178 44% 31%'), h('22 48% 44%'), h('38 32% 97%'), h('196 34% 24%')] },
  { id: 'coral', name: 'Coral Sunrise', desc: 'อบอุ่นสดใส สำหรับงานส่งเสริมสุขภาพ', tag: 'ธีมหลัก', swatches: [h('12 70% 46%'), h('352 44% 26%'), h('26 45% 98%'), h('36 80% 46%')] },
  { id: 'violet', name: 'Violet Care', desc: 'นุ่มเย็น เหมาะกับงานสุขภาพจิต', tag: 'ธีมหลัก', swatches: [h('268 50% 46%'), h('250 44% 26%'), h('270 40% 98%'), h('300 48% 48%')] },
  { id: 'forest', name: 'Forest Ward', desc: 'เขียวธรรมชาติ เหมาะกับงานชุมชน', tag: 'ธีมหลัก', swatches: [h('146 44% 28%'), h('168 40% 20%'), h('120 26% 97%'), h('88 46% 34%')] },
  { id: 'berry', name: 'Berry Plum', desc: 'เข้มสดใส เห็นชัดบนจอสว่าง', tag: 'ธีมหลัก', swatches: [h('335 56% 40%'), h('300 38% 24%'), h('340 36% 98%'), h('12 60% 48%')] },
];

export interface FestivalMeta {
  id: Exclude<FestivalId, 'none'>;
  name: string;
  desc: string;
  swatches: [string, string, string, string];
}

export const FESTIVAL_LIST: FestivalMeta[] = [
  { id: 'christmas', name: 'Christmas', desc: '20 ธ.ค. – 1 ม.ค. · โทนเขียว-แดงเทศกาล', swatches: [h('150 44% 25%'), h('355 48% 26%'), h('45 68% 44%'), h('150 22% 95%')] },
  { id: 'newyear', name: 'New Year', desc: '28 ธ.ค. – 5 ม.ค. · น้ำเงินทองฉลองปีใหม่', swatches: [h('222 52% 27%'), h('44 74% 50%'), h('210 20% 72%'), h('222 24% 95%')] },
  { id: 'valentine', name: 'Valentine', desc: '10 – 15 ก.พ. · ชมพูอ่อนโยน', swatches: [h('335 44% 46%'), h('202 58% 58%'), h('340 60% 70%'), h('335 30% 96%')] },
  { id: 'songkran', name: 'Songkran', desc: '10 – 18 เม.ย. · ฟ้าน้ำและสีสันสงกรานต์', swatches: [h('192 62% 38%'), h('48 84% 52%'), h('196 50% 24%'), h('192 32% 96%')] },
];
