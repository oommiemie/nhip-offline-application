import {
  GoogleSans_400Regular,
  GoogleSans_500Medium,
  GoogleSans_600SemiBold,
  GoogleSans_700Bold,
} from '@expo-google-fonts/google-sans';
import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
} from '@expo-google-fonts/noto-sans-thai';
import {
  Sarabun_400Regular,
  Sarabun_500Medium,
  Sarabun_600SemiBold,
  Sarabun_700Bold,
} from '@expo-google-fonts/sarabun';
import {
  IBMPlexSansThai_400Regular,
  IBMPlexSansThai_500Medium,
  IBMPlexSansThai_600SemiBold,
  IBMPlexSansThai_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-thai';
import {
  Prompt_400Regular,
  Prompt_500Medium,
  Prompt_600SemiBold,
  Prompt_700Bold,
} from '@expo-google-fonts/prompt';
import {
  Kanit_400Regular,
  Kanit_500Medium,
  Kanit_600SemiBold,
  Kanit_700Bold,
} from '@expo-google-fonts/kanit';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import type { FontId, FontWeight } from './types';

/**
 * ตารางฟอนต์ทั้งหมดที่ต้องโหลดผ่าน useFonts ใน App.tsx
 * RN เลือกน้ำหนักด้วย "ชื่อฟอนต์" ไม่ใช่ fontWeight ดังนั้นห้าม set fontWeight คู่กับ fontFamily เหล่านี้
 */
export const FONT_ASSETS = {
  GoogleSans_400Regular,
  GoogleSans_500Medium,
  GoogleSans_600SemiBold,
  GoogleSans_700Bold,
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
  Sarabun_400Regular,
  Sarabun_500Medium,
  Sarabun_600SemiBold,
  Sarabun_700Bold,
  IBMPlexSansThai_400Regular,
  IBMPlexSansThai_500Medium,
  IBMPlexSansThai_600SemiBold,
  IBMPlexSansThai_700Bold,
  Prompt_400Regular,
  Prompt_500Medium,
  Prompt_600SemiBold,
  Prompt_700Bold,
  Kanit_400Regular,
  Kanit_500Medium,
  Kanit_600SemiBold,
  Kanit_700Bold,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
};

const UI_FONTS: Record<FontId, Record<FontWeight, string>> = {
  googlesans: {
    '400': 'GoogleSans_400Regular',
    '500': 'GoogleSans_500Medium',
    '600': 'GoogleSans_600SemiBold',
    '700': 'GoogleSans_700Bold',
  },
  noto: {
    '400': 'NotoSansThai_400Regular',
    '500': 'NotoSansThai_500Medium',
    '600': 'NotoSansThai_600SemiBold',
    '700': 'NotoSansThai_700Bold',
  },
  sarabun: {
    '400': 'Sarabun_400Regular',
    '500': 'Sarabun_500Medium',
    '600': 'Sarabun_600SemiBold',
    '700': 'Sarabun_700Bold',
  },
  plex: {
    '400': 'IBMPlexSansThai_400Regular',
    '500': 'IBMPlexSansThai_500Medium',
    '600': 'IBMPlexSansThai_600SemiBold',
    '700': 'IBMPlexSansThai_700Bold',
  },
  prompt: {
    '400': 'Prompt_400Regular',
    '500': 'Prompt_500Medium',
    '600': 'Prompt_600SemiBold',
    '700': 'Prompt_700Bold',
  },
  kanit: {
    '400': 'Kanit_400Regular',
    '500': 'Kanit_500Medium',
    '600': 'Kanit_600SemiBold',
    '700': 'Kanit_700Bold',
  },
};

const MONO_FONTS: Record<FontWeight, string> = {
  '400': 'JetBrainsMono_400Regular',
  '500': 'JetBrainsMono_500Medium',
  '600': 'JetBrainsMono_600SemiBold',
  '700': 'JetBrainsMono_700Bold',
};

export const uiFontFamily = (font: FontId, weight: FontWeight = '400'): string => UI_FONTS[font][weight];
export const monoFontFamily = (weight: FontWeight = '400'): string => MONO_FONTS[weight];

export interface FontMeta {
  id: FontId;
  name: string;
}

export const FONT_LIST: FontMeta[] = [
  { id: 'googlesans', name: 'Google Sans · ค่าเริ่มต้น' },
  { id: 'noto', name: 'Noto Sans Thai' },
  { id: 'sarabun', name: 'Sarabun' },
  { id: 'plex', name: 'IBM Plex Sans Thai' },
  { id: 'prompt', name: 'Prompt' },
  { id: 'kanit', name: 'Kanit' },
];
