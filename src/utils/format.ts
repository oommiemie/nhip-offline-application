import { getLang, tr } from '../i18n/lang';

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

/** เวลาปัจจุบันรูปแบบ HH:MM */
export const nowHM = (): string => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * วันที่ของวันนี้ตามภาษาที่เลือก
 * ไทย: "วันพฤหัสบดีที่ 14 สิงหาคม 2569" (พ.ศ.) · อังกฤษ: "Thursday 14 August 2026" (ค.ศ.)
 */
export const thaiToday = (): string => {
  const d = new Date();
  if (getLang() === 'en') return `${EN_DAYS[d.getDay()]} ${d.getDate()} ${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return `วัน${THAI_DAYS[d.getDay()]}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
};

/** คำทักทายตามช่วงเวลา */
export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return tr('สวัสดีตอนเช้า');
  if (h < 17) return tr('สวัสดีตอนบ่าย');
  return tr('สวัสดีตอนเย็น');
};

/** 1234 -> "1,234" */
export const fmtInt = (n: number): string => n.toLocaleString('en-US');

/**
 * จัดรูปเบอร์โทรไทยระหว่างพิมพ์ — เก็บแต่ตัวเลข สูงสุด 10 หลัก แล้วคั่นเป็น 3-3-4
 * ("0812345678" -> "081-234-5678" · เบอร์บ้าน 9 หลักได้ "043-123-456")
 */
export const formatPhone = (input: string): string => {
  const d = input.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
};

/** จำนวนหลักของเบอร์โทร (ใช้ตรวจความครบถ้วน — เบอร์บ้าน 9 หลัก มือถือ 10 หลัก) */
export const phoneDigits = (input: string): number => input.replace(/\D/g, '').length;

/** จัดรูปเลขบัตรประชาชน 13 หลักเป็น 1-2345-67890-12-3 ระหว่างพิมพ์ */
export const formatCid = (input: string): string => {
  const d = input.replace(/\D/g, '').slice(0, 13);
  return [d.slice(0, 1), d.slice(1, 5), d.slice(5, 10), d.slice(10, 12), d.slice(12, 13)].filter(Boolean).join('-');
};

/** จำนวนหลักของเลขบัตรประชาชน (ครบ = 13) */
export const cidDigits = (input: string): number => input.replace(/\D/g, '').length;

/** คำนำหน้าที่ตัดออกก่อนทำอักษรย่อในวงกลม */
const NAME_TITLES = ['นางสาว', 'เด็กชาย', 'เด็กหญิง', 'ด.ช.', 'ด.ญ.', 'น.ส.', 'นาง', 'นาย', 'พระ'];

/** อักษรย่อ 2 ตัวจากชื่อผู้ป่วย/เจ้าหน้าที่ (ตัดคำนำหน้าออกก่อน) */
export const initials = (name: string): string => {
  const bare = NAME_TITLES.reduce((s, p) => (s.startsWith(p) ? s.slice(p.length) : s), name.trim());
  return (bare.replace(/\s/g, '') || name).slice(0, 2);
};
