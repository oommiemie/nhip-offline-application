import { useMemo } from 'react';

import { useThemeContext } from '../theme';
import { translate } from './lang';

export { setLang, getLang, tr, translate, fill } from './lang';
export type { Lang } from './lang';
export { EN } from './en';

export type Translate = (th: string, vars?: Record<string, string | number>) => string;

/**
 * hook แปลข้อความในคอมโพเนนต์ — เปลี่ยนภาษาแล้วทุกหน้าจะ re-render ตามเอง
 * ใช้ชื่อตัวแปรว่า tt เพื่อไม่ชนกับ t ที่เป็นธีม เช่น const tt = useT();
 */
export const useT = (): Translate => {
  const { settings } = useThemeContext();
  const lang = settings.language;
  return useMemo<Translate>(() => (th, vars) => translate(lang, th, vars), [lang]);
};
