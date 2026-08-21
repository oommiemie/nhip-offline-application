import { EN } from './en';

export type Lang = 'th' | 'en';

/**
 * ภาษาที่ใช้อยู่ในระดับโมดูล — ThemeProvider เป็นคนอัปเดตให้เมื่อผู้ใช้เปลี่ยนภาษา
 * มีไว้ให้โค้ดที่ไม่ใช่คอมโพเนนต์ (เช่น action ใน AppContext ที่สร้างข้อความแจ้งเตือน) แปลข้อความได้
 */
let current: Lang = 'th';

export const setLang = (lang: Lang): void => {
  current = lang;
};

export const getLang = (): Lang => current;

/** แทนค่าในช่อง {ชื่อ} ของข้อความ */
export const fill = (text: string, vars?: Record<string, string | number>): string =>
  vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text;

/** แปลข้อความ (คีย์เป็นภาษาไทย) — ไม่มีคำแปลก็คืนภาษาไทยเดิม */
export const translate = (lang: Lang, th: string, vars?: Record<string, string | number>): string =>
  fill(lang === 'en' ? (EN[th] ?? th) : th, vars);

/** แปลด้วยภาษาที่ใช้อยู่ตอนนี้ — ใช้นอก React ได้ */
export const tr = (th: string, vars?: Record<string, string | number>): string => translate(current, th, vars);
