import type { TextStyle, ViewStyle } from 'react-native';

/** รหัสชุดสี — 'moph' คือธีมหลักตามดีไซน์ Figma, ที่เหลือพอร์ตมาจาก desktop comp เดิม */
export type PaletteId =
  | 'moph'
  | 'ocean'
  | 'mint'
  | 'deepsea'
  | 'sky'
  | 'warm'
  | 'coral'
  | 'violet'
  | 'forest'
  | 'berry';

export type Mode = 'light' | 'dark';
export type FestivalId = 'none' | 'christmas' | 'newyear' | 'valentine' | 'songkran';
export type FontId = 'googlesans' | 'noto' | 'sarabun' | 'plex' | 'prompt' | 'kanit';
export type FontSizeId = '12' | '13' | '14' | '16' | '18';
export type DensityId = 'compact' | 'normal' | 'comfortable';
export type PanelMode = 'drawer' | 'modal';
export type FontWeight = '400' | '500' | '600' | '700';

/** โทนสถานะที่ใช้กับ Badge / Chip ทั้งระบบ */
export type Tone = 'success' | 'warning' | 'destructive' | 'info' | 'purple' | 'neutral' | 'primary';

/** สีดิบของธีมหนึ่งโหมด (ยังไม่รวมค่า derive เช่น badge) */
export interface BaseColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  /** สีหลักของปุ่ม/ลิงก์ (#2D6A4F ในธีม MOPH) */
  primary: string;
  primaryForeground: string;
  /** สีเขียวเข้มสำหรับปุ่ม submit / แบนเนอร์ (#134E3A ในธีม MOPH) */
  primaryStrong: string;
  /** สีหมึกเข้ม (#1B4332) ใช้กับหัวข้อ/แถบบน */
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  /** ม่วงสำหรับสถานะ "รอผล Lab" */
  purple: string;
  border: string;
  /** สีเส้นขอบ input */
  input: string;
  /** สีพื้น input แบบ filled (#F1F3F5 ในธีม MOPH) */
  inputBg: string;
  ring: string;
  surface1: string;
  surface2: string;
  surface3: string;
  /** พื้น sidebar (mint #DBF2E3 ในธีม MOPH) */
  sidebar: string;
  /** พื้นเมนู active ใน sidebar */
  sidebarActive: string;
  tableHeader: string;
  tableRowAlt: string;
  tableRowSelected: string;
  /** แถบเตือนแพ้ยา */
  alertBand: string;
  alertBandForeground: string;
  /** กล่อง terminal log (#0B2D22 ในธีม MOPH) */
  terminalBg: string;
  terminalCmd: string;
  terminalOk: string;
  terminalErr: string;
  terminalInfo: string;
}

export interface ToneStyle {
  bg: string;
  fg: string;
  border: string;
}

/** สีตัวเลขเด่นบน KPI card */
export interface KpiColors {
  wait: string;
  progress: string;
  done: string;
  lab: string;
  fail: string;
  neutral: string;
}

export interface DensitySpec {
  /** ความสูงแถวตาราง */
  rowH: number;
  /** ความสูงปุ่ม/คอนโทรลมาตรฐาน */
  controlH: number;
  /** ความสูง input */
  inputH: number;
  /** หน่วยช่องไฟฐาน */
  sp: number;
}

export interface FontSizes {
  xs: number;
  sm: number;
  base: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  kpi: number;
  hero: number;
}

export interface RadiusSpec {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
}

/** ธีมที่ resolve แล้ว — ใช้ผ่าน useTheme() เท่านั้น */
export interface Theme {
  palette: PaletteId;
  mode: Mode;
  isDark: boolean;
  festival: FestivalId;
  colors: BaseColors;
  tones: Record<Tone, ToneStyle>;
  kpi: KpiColors;
  /** คืนชื่อฟอนต์ UI ตามน้ำหนัก เช่น t.font('600') */
  font: (weight?: FontWeight) => string;
  /** คืนชื่อฟอนต์ mono (JetBrains Mono) ตามน้ำหนัก */
  mono: (weight?: FontWeight) => string;
  fs: FontSizes;
  density: DensitySpec;
  radius: RadiusSpec;
  shadow: { sm: ViewStyle; md: ViewStyle; lg: ViewStyle };
  reduceMotion: boolean;
}

export interface ThemeSettings {
  palette: PaletteId;
  mode: Mode;
  festival: FestivalId;
  fontId: FontId;
  fontSize: FontSizeId;
  density: DensityId;
  panelMode: PanelMode;
  reduceMotion: boolean;
}

export type TextTone = keyof Pick<
  BaseColors,
  'foreground' | 'mutedForeground' | 'primary' | 'destructive' | 'success' | 'warning' | 'info'
>;

export type NamedTextStyle = TextStyle;
