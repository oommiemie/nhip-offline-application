import type { BaseColors, FestivalId, FestiveDecor, KpiColors, Mode, PaletteId, Tone, ToneStyle } from './types';

/** แปลง token HSL แบบ '200 40% 98%' (รูปแบบเดียวกับ CSS variables ของ desktop comp) เป็นสีที่ RN ใช้ได้ */
const h = (v: string): string => {
  const [hue, s, l] = v.split(' ');
  return `hsl(${hue}, ${s}, ${l})`;
};

/**
 * ปรับความสว่างของสีในเฉดเดิม (amount < 0 = เข้มขึ้น, > 0 = สว่างขึ้น)
 * ใช้ทำไล่เฉดสีเดียวโดยไม่เอาสีอื่นมาผสม
 */
export const shade = (color: string, amount: number): string => {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const mixTo = amount < 0 ? 0 : 255;
  const k = Math.abs(amount);
  if (color.startsWith('#') && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const to = (v: number) => clamp(v + (mixTo - v) * k);
    return `rgb(${to(r)}, ${to(g)}, ${to(b)})`;
  }
  // hsl(h, s%, l%) — ขยับเฉพาะ lightness ให้คงเฉดเดิมเป๊ะ
  const m = color.match(/hsla?\(([^,]+),\s*([^,]+),\s*([^,)]+)/);
  if (m) {
    const l = parseFloat(m[3]);
    const nl = Math.max(0, Math.min(100, amount < 0 ? l * (1 - k) : l + (100 - l) * k));
    return `hsl(${m[1].trim()}, ${m[2].trim()}, ${nl.toFixed(1)}%)`;
  }
  return color;
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
  accentStrong: '#40916C',
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
  accentStrong: '#74C69D',
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

/**
 * คีย์ที่ "ธีมเทศกาล" override ได้ — กว้างกว่า HslSet เพราะเทศกาลแต่งได้ถึงพื้น sidebar/ตาราง/terminal
 * แยกชนิดออกจาก HslSet เพราะ buildHslPalette คาดหวังคีย์ครบตาม HslSet เท่านั้น
 */
type FestivalSet = HslSet & {
  inputBg?: string;
  sidebar?: string;
  sidebarActive?: string;
  purple?: string;
  accentStrong?: string;
  accentForeground?: string;
  terminalBg?: string;
  terminalCmd?: string;
  terminalOk?: string;
  terminalErr?: string;
  terminalInfo?: string;
};

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
  deepsea: {
    light: { background: '210 30% 96%', foreground: '212 55% 13%', primary: '212 62% 26%', secondary: '212 55% 18%', muted: '210 26% 91%', mutedForeground: '212 16% 40%', accent: '180 62% 34%', border: '210 24% 84%', input: '210 24% 88%', ring: '180 62% 38%', surface2: '210 30% 94%', surface3: '210 26% 90%', tableHeader: '210 28% 93%', tableRowAlt: '210 26% 97%', tableRowSelected: '180 34% 90%' },
    dark: { background: '213 42% 8%', foreground: '196 24% 91%', card: '213 38% 11%', primary: '178 55% 45%', secondary: '213 34% 18%', muted: '213 28% 16%', mutedForeground: '203 16% 64%', accent: '186 60% 50%', border: '213 26% 21%', input: '213 26% 23%', surface1: '213 38% 11%', surface2: '213 32% 14%', surface3: '213 28% 18%', tableHeader: '213 30% 15%', tableRowAlt: '213 36% 12%', tableRowSelected: '178 34% 20%' },
  },
  sky: {
    light: { background: '0 0% 100%', foreground: '212 60% 8%', primary: '212 88% 30%', secondary: '212 70% 16%', muted: '210 24% 93%', mutedForeground: '212 26% 30%', accent: '200 80% 34%', border: '210 26% 76%', input: '210 26% 80%', ring: '212 88% 36%', surface2: '206 32% 96%', surface3: '206 28% 92%', tableHeader: '206 30% 94%', tableRowAlt: '206 26% 97.5%', tableRowSelected: '212 44% 90%', success: '158 60% 26%', warning: '34 92% 34%', warningForeground: '0 0% 100%', destructive: '2 72% 40%', info: '206 80% 32%' },
    dark: { background: '214 40% 7%', foreground: '0 0% 99%', card: '214 34% 11%', primary: '203 82% 62%', primaryForeground: '214 45% 8%', secondary: '214 28% 20%', muted: '214 24% 17%', mutedForeground: '206 20% 78%', accent: '196 76% 58%', border: '214 22% 28%', input: '214 22% 30%', surface1: '214 34% 11%', surface2: '214 28% 15%', surface3: '214 24% 19%', tableHeader: '214 26% 16%', tableRowAlt: '214 32% 12.5%', tableRowSelected: '206 36% 24%', success: '158 48% 54%', warning: '38 88% 62%', destructive: '4 70% 64%' },
  },
  violet: {
    light: { background: '270 40% 98%', foreground: '268 36% 16%', primary: '268 50% 46%', secondary: '250 44% 26%', muted: '270 26% 94%', mutedForeground: '268 13% 44%', accent: '300 48% 48%', border: '270 22% 88%', input: '270 22% 90%', ring: '268 50% 52%', surface2: '270 34% 96%', surface3: '270 28% 93%', tableHeader: '270 30% 95%', tableRowAlt: '270 28% 98%', tableRowSelected: '268 38% 94%' },
    dark: { background: '268 26% 10%', foreground: '270 18% 92%', card: '268 24% 13%', primary: '270 58% 66%', secondary: '250 26% 23%', muted: '268 20% 18%', mutedForeground: '270 14% 68%', accent: '300 50% 64%', border: '268 18% 23%', input: '268 18% 25%', surface1: '268 24% 13%', surface2: '268 20% 16%', surface3: '268 18% 20%', tableHeader: '268 20% 17%', tableRowAlt: '268 22% 15%', tableRowSelected: '270 32% 24%' },
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
    accentStrong: h(m.accent),
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

const FESTIVALS: Record<Exclude<FestivalId, 'none'>, { light: FestivalSet; dark: FestivalSet }> = {
  // Christmas แต่งเต็มชุด: เขียวสน + แดงครานเบอร์รี + ทองเทียน — คุมโทนทุกพื้นผิวไม่ใช่แค่ปุ่ม/ฮีโร่
  christmas: {
    light: {
      primary: '150 44% 25%',
      secondary: '355 48% 26%',
      accent: '45 68% 44%',
      accentStrong: '42 84% 32%',
      accentForeground: '45 62% 12%',
      ring: '150 50% 34%',
      sidebarActive: '355 44% 88%',
      // พื้นโครงสร้าง — ไล่โทนเขียวสนแทนเทากลาง
      background: '150 25% 98%',
      mutedForeground: '150 9% 38%',
      muted: '150 18% 94%',
      sidebar: '355 45% 93%',
      surface2: '150 24% 94%',
      surface3: '150 20% 91%',
      border: '150 14% 90%',
      input: '150 16% 87%',
      inputBg: '150 20% 96%',
      tableHeader: '150 24% 93%',
      tableRowAlt: '150 26% 98%',
      tableRowSelected: '150 30% 91%',
      // สีสถานะชุดอัญมณี — เข้มขึ้นเพื่อคอนทราสต์ที่ดีกว่าชุดพื้นฐาน
      success: '150 58% 30%',
      warning: '32 90% 33%',
      info: '205 62% 38%',
      purple: '328 52% 36%',
      destructive: '358 70% 45%',
      // กล่อง log — เขียวสนเข้ม ตัวหนังสือครีมเทียน
      terminalBg: '150 52% 8%',
      terminalCmd: '42 62% 86%',
      terminalOk: '150 54% 60%',
      terminalErr: '355 78% 76%',
      terminalInfo: '150 14% 62%',
    },
    dark: {
      primary: '150 40% 46%',
      secondary: '355 26% 24%',
      accent: '45 66% 56%',
      accentStrong: '45 66% 56%',
      ring: '150 46% 52%',
      sidebarActive: '355 30% 26%',
      background: '150 20% 6%',
      mutedForeground: '150 8% 66%',
      muted: '150 12% 18%',
      sidebar: '150 26% 8%',
      surface2: '150 16% 16%',
      surface3: '150 14% 21%',
      border: '150 12% 24%',
      input: '150 12% 27%',
      inputBg: '150 14% 14%',
      tableHeader: '150 14% 17%',
      tableRowAlt: '150 16% 12%',
      tableRowSelected: '150 26% 21%',
      success: '150 52% 52%',
      warning: '38 88% 58%',
      info: '205 66% 62%',
      purple: '328 58% 70%',
      destructive: '358 74% 70%',
      terminalBg: '150 46% 6%',
      terminalCmd: '42 58% 84%',
      terminalOk: '150 50% 58%',
      terminalErr: '355 74% 74%',
      terminalInfo: '150 12% 58%',
    },
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
  halloween: {
    light: { primary: '25 88% 44%', secondary: '270 28% 20%', accent: '270 42% 48%', surface2: '25 44% 96%', tableRowSelected: '25 56% 92%' },
    dark: { primary: '25 86% 54%', secondary: '270 22% 20%', accent: '270 44% 58%', surface2: '25 22% 15%', tableRowSelected: '25 36% 21%' },
  },
  cny: {
    light: { primary: '0 68% 42%', secondary: '0 58% 25%', accent: '45 85% 48%', surface2: '0 42% 96%', tableRowSelected: '45 60% 92%' },
    dark: { primary: '0 64% 58%', secondary: '0 34% 22%', accent: '45 80% 56%', surface2: '0 20% 15%', tableRowSelected: '45 34% 21%' },
  },
};

/* ------------------------------------------------------------------ */
/* 4) ประกอบร่างธีม                                                     */
/* ------------------------------------------------------------------ */

/**
 * ชั้นตกแต่งประจำเทศกาล — สีของหิมะ/อนุภาค/แสงเรือง/ฉากหลัง modal
 * เป็น module constant เพื่อให้ identity คงที่ ป้อนเข้า useMemo ของอนุภาคได้โดยไม่สร้างใหม่ทุกเฟรม
 */
const FESTIVE_DECOR: Partial<Record<Exclude<FestivalId, 'none'>, { light: FestiveDecor; dark: FestiveDecor }>> = {
  christmas: {
    light: {
      ornaments: ['#F6D779', '#75D1A3', '#E37881', '#AAD7EE'],
      snow: ['#FFFFFF', '#FFFFFF', '#F6D779', '#FFFFFF', '#AAD7EE', '#FFFFFF', '#F6D779', '#75D1A3', '#FFFFFF', '#E37881'],
      gold: '#966D0D',
      goldLight: '#F6D779',
      glow: '#F6D779',
      dust: '#F1E4C5',
      scrimBase: '#2D1012',
    },
    dark: {
      ornaments: ['#E7C868', '#5FB98C', '#D2757D', '#9CCBE2'],
      snow: ['#E9F2EE', '#E9F2EE', '#E7C868', '#E9F2EE', '#9CCBE2', '#E9F2EE', '#E7C868', '#5FB98C', '#E9F2EE', '#D2757D'],
      gold: '#E2BB55',
      goldLight: '#E7C868',
      glow: '#E7C868',
      dust: '#CBBB90',
      scrimBase: '#0A0607',
    },
  },
};

/** สีชั้นตกแต่งของเทศกาลที่เปิดอยู่ — null = ธีมปกติ (คอมโพเนนต์ตกแต่งกลับไปใช้ค่าเดิม) */
export const resolveFestive = (festival: FestivalId, mode: Mode): FestiveDecor | null =>
  festival === 'none' ? null : (FESTIVE_DECOR[festival]?.[mode] ?? null);

/** คีย์ที่ยอมให้ธีมเทศกาล override ได้ตรง ๆ (ค่าเป็น HSL triplet เสมอ) */
const FESTIVAL_KEYS = [
  'background', 'foreground', 'card', 'primary', 'secondary', 'muted', 'mutedForeground',
  'accent', 'accentStrong', 'accentForeground', 'destructive', 'success', 'warning', 'warningForeground',
  'info', 'purple', 'border', 'input', 'inputBg', 'ring', 'surface1', 'surface2', 'surface3',
  'sidebar', 'sidebarActive', 'tableHeader', 'tableRowAlt', 'tableRowSelected', 'alertBand',
  'terminalBg', 'terminalCmd', 'terminalOk', 'terminalErr', 'terminalInfo',
] as const satisfies readonly (keyof BaseColors & keyof FestivalSet)[];

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
    // input แบบ filled ของบางธีมใช้สีเดียวกับพื้นหน้า — จำไว้ก่อนเพื่อรักษาความสัมพันธ์นี้หลัง override
    const inputWasFlush = colors.inputBg === colors.background;
    if (f.primary) {
      const pri = h(f.primary);
      colors.primary = pri;
      colors.ring = pri;
      colors.sidebarActive = withAlpha(pri, 0.16);
      // ปุ่มเข้ม (variant strong) ยึดโทนเดียวกับสีหลักของเทศกาลเสมอ เช่น Christmas = เขียว
      colors.primaryStrong = shade(pri, -0.18);
    }
    // secondary = สีคู่ประจำเทศกาล (ใช้เป็นพื้นหลังหน้า auth/hero) — ไม่ลากไปเป็นสีปุ่ม
    // คีย์ที่เทศกาลระบุมาเองมาทีหลังเสมอ จึงชนะค่า derive ด้านบน (เช่น ring / sidebarActive)
    for (const k of FESTIVAL_KEYS) {
      const v = f[k];
      if (v) colors[k] = h(v);
    }
    if (f.accentStrong === undefined && f.accent) colors.accentStrong = h(f.accent);
    if (mode === 'light') colors.primaryForeground = '#FFFFFF';
    if (inputWasFlush) colors.inputBg = colors.background;
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

/** ชุด badge เทศกาล Christmas — โทนอัญมณี (สน/ครานเบอร์รี/ทองเทียน/น้ำเงินน้ำแข็ง/พลัม) คอนทราสต์ ≥ 6.6:1 */
const XMAS_TONES: Record<Tone, ToneStyle> = {
  primary: { bg: '#DFF1E8', fg: '#1F5138', border: '#BCDCCC' },
  success: { bg: '#DDF3E6', fg: '#185938', border: '#B8E0C9' },
  warning: { bg: '#FAEED1', fg: '#7D4608', border: '#EAD39F' },
  destructive: { bg: '#FAE0E2', fg: '#7E2028', border: '#EDC5C8' },
  info: { bg: '#DEEDF8', fg: '#1F4D75', border: '#BCD5E6' },
  purple: { bg: '#F7E8F0', fg: '#752952', border: '#E7CBDA' },
  neutral: { bg: '#EEF2F0', fg: '#404F47', border: '#D7E0DB' },
};

export const resolveTones = (
  colors: BaseColors,
  palette: PaletteId,
  mode: Mode,
  festival: FestivalId,
): Record<Tone, ToneStyle> => {
  if (palette === 'moph' && mode === 'light') return festival === 'christmas' ? XMAS_TONES : MOPH_TONES;
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

/** ตัวเลข KPI ชุดเทศกาล Christmas — ยังแยก 6 สีตามความหมายเดิม แต่เป็นโทนอัญมณี */
const XMAS_KPI: KpiColors = {
  wait: '#B07807',
  progress: '#236B9F',
  done: '#1E7147',
  lab: '#8C2C5F',
  fail: '#B4222E',
  neutral: '#1F2E26',
};

export const resolveKpi = (colors: BaseColors, palette: PaletteId, mode: Mode, festival: FestivalId): KpiColors => {
  if (palette === 'moph' && mode === 'light') {
    if (festival === 'christmas') return XMAS_KPI;
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
  { id: 'moph', name: 'Mint to be', desc: 'เขียวมิ้นต์ตัวมัม สายสาธารณสุขต้องอันนี้', tag: 'ค่าเริ่มต้น', swatches: ['#2D6A4F', '#1B4332', '#F8FAFC', '#52B788'] },
  { id: 'ocean', name: 'Aqua Vibe', desc: 'ฟ้าอควาชิล ๆ นั่งยาวทั้งเวรก็ไม่ล้าตา', tag: 'ธีมหลัก', swatches: [h('178 62% 33%'), h('206 55% 22%'), h('200 40% 98%'), h('190 70% 40%')] },
  { id: 'deepsea', name: 'Midnight Mood', desc: 'น้ำเงินดึกมู้ดดี้ เวรตีสามจอไม่แสบตา', tag: 'ธีมหลัก', swatches: [h('178 55% 45%'), h('213 42% 12%'), h('213 30% 20%'), h('186 60% 50%')] },
  { id: 'sky', name: 'Sky Clean', desc: 'ฟ้าใสคลีน ๆ คอนทราสต์ปัง อ่านชัดทุกแสง', tag: 'ธีมหลัก', swatches: [h('212 88% 30%'), h('212 70% 16%'), '#FFFFFF', h('200 80% 34%')] },
  { id: 'violet', name: 'Lavender Soft', desc: 'ม่วงละมุนเซฟใจ สายงานสุขภาพจิตเลิฟ', tag: 'ธีมหลัก', swatches: [h('268 50% 46%'), h('250 44% 26%'), h('270 40% 98%'), h('300 48% 48%')] },
  { id: 'berry', name: 'Berry Pop', desc: 'เบอร์รีจัดจ้าน แสบซ่า เด่นสุดบนจอสว่าง', tag: 'ธีมหลัก', swatches: [h('335 56% 40%'), h('300 38% 24%'), h('340 36% 98%'), h('12 60% 48%')] },
];

export interface FestivalMeta {
  id: Exclude<FestivalId, 'none'>;
  name: string;
  desc: string;
  swatches: [string, string, string, string];
}

export const FESTIVAL_LIST: FestivalMeta[] = [
  {
    id: 'christmas',
    name: 'Christmas',
    desc: '20 ธ.ค. – 1 ม.ค. · เขียวสน แดงครานเบอร์รี ทองเทียน',
    // ดึงจากค่าจริงของธีม — ตัวอย่างสีจะไม่มีวันเพี้ยนจากที่เห็นในแอป
    swatches: [
      h(FESTIVALS.christmas.light.primary!),
      h(FESTIVALS.christmas.light.secondary!),
      h(FESTIVALS.christmas.light.accent!),
      h(FESTIVALS.christmas.light.sidebar!),
    ],
  },
  { id: 'newyear', name: 'New Year', desc: '28 ธ.ค. – 5 ม.ค. · น้ำเงินทองฉลองปีใหม่', swatches: [h('222 52% 27%'), h('44 74% 50%'), h('210 20% 72%'), h('222 24% 95%')] },
  { id: 'valentine', name: 'Valentine', desc: '10 – 15 ก.พ. · ชมพูอ่อนโยน', swatches: [h('335 44% 46%'), h('202 58% 58%'), h('340 60% 70%'), h('335 30% 96%')] },
  { id: 'songkran', name: 'Songkran', desc: '10 – 18 เม.ย. · ฟ้าน้ำและสีสันสงกรานต์', swatches: [h('192 62% 38%'), h('48 84% 52%'), h('196 50% 24%'), h('192 32% 96%')] },
  { id: 'halloween', name: 'Halloween', desc: '25 ต.ค. – 1 พ.ย. · ส้มฟักทองและม่วงมนต์', swatches: [h('25 88% 44%'), h('270 42% 48%'), h('270 28% 20%'), h('25 44% 96%')] },
  { id: 'cny', name: 'Chinese New Year', desc: 'ตรุษจีน · แดงทองมงคล', swatches: [h('0 68% 42%'), h('45 85% 48%'), h('0 58% 25%'), h('0 42% 96%')] },
];
