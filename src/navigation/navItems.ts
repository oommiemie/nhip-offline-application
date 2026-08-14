import type { Ionicons } from '@expo/vector-icons';

import type { ScreenId } from '../state/types';

export interface NavDef {
  id: ScreenId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  section: 'บริการ' | 'ตั้งค่า';
}

/** เมนูหลักของแอป — ใช้ร่วมกันระหว่าง sidebar, bottom tab และ Spotlight */
export const NAV: NavDef[] = [
  { id: 'dashboard', label: 'หน้าหลัก', icon: 'home-outline', section: 'บริการ' },
  { id: 'oss', label: 'One Stop Service', icon: 'add-circle-outline', section: 'บริการ' },
  { id: 'sync', label: 'Sync ข้อมูล', icon: 'sync-outline', section: 'ตั้งค่า' },
  { id: 'settings', label: 'ตั้งค่า', icon: 'options-outline', section: 'ตั้งค่า' },
];
