import React from 'react';
import { Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import { AppText } from './AppText';

const WEB_NO_OUTLINE = Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as ViewStyle) : null;

/** ปุ่มกลม 40×40 ของแถบแบ่งหน้า (Figma 16:859 · page-*) */
const PageDot: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  soft?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}> = ({ children, active = false, soft = false, disabled = false, onPress }) => {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? c.primary : soft ? c.surface2 : c.card,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        WEB_NO_OUTLINE,
      ]}
    >
      {children}
    </Pressable>
  );
};

/** สร้างชุดเลขหน้าแบบย่อ: 1 … รอบ ๆ หน้าปัจจุบัน … หน้าสุดท้าย */
const pagesFor = (page: number, total: number): Array<number | '…'> => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | '…'> = [];
  const start = Math.max(1, Math.min(page - 1, total - 3));
  const end = Math.min(total, start + 2);
  if (start > 1) out.push(1);
  if (start > 2) out.push('…');
  for (let p = start; p <= end; p++) out.push(p);
  if (end < total - 1) out.push('…');
  if (end < total) out.push(total);
  return out;
};

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** จำนวนรายการต่อหน้า + ตัวเลือก — ไม่ส่งมาก็ไม่แสดงฝั่งซ้าย */
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * แถบแบ่งหน้าใต้ตาราง (Figma 16:859 · Frame 40)
 * ซ้าย: แสดง [10 ▾] รายการ · ขวา: ‹ 1 … 2 … 12 ›  (หน้าปัจจุบัน = วงกลมเขียวทึบ)
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageSizeChange,
  style,
}) => {
  const t = useTheme();
  const c = t.colors;
  const items = pagesFor(page, Math.max(1, totalPages));

  const cyclePageSize = () => {
    if (!pageSize || !onPageSizeChange) return;
    const i = pageSizeOptions.indexOf(pageSize);
    onPageSizeChange(pageSizeOptions[(i + 1) % pageSizeOptions.length]);
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: c.card,
        },
        style,
      ]}
    >
      {pageSize ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <AppText size="md" muted>
            แสดง
          </AppText>
          <Pressable
            onPress={cyclePageSize}
            disabled={!onPageSizeChange}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                height: 42,
                paddingHorizontal: 16,
                borderRadius: t.radius.md,
                backgroundColor: c.inputBg,
                opacity: pressed ? 0.7 : 1,
              },
              WEB_NO_OUTLINE,
            ]}
          >
            <AppText size="sm" mono>
              {pageSize}
            </AppText>
            <Ionicons name="chevron-down" size={16} color={c.foreground} />
          </Pressable>
          <AppText size="md" muted>
            รายการ
          </AppText>
        </View>
      ) : null}

      <View style={{ flex: 1, minWidth: 12 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <PageDot soft disabled={page <= 1} onPress={() => onPageChange(page - 1)}>
          <Ionicons name="chevron-back" size={16} color={c.foreground} />
        </PageDot>
        {items.map((p, i) =>
          p === '…' ? (
            <PageDot key={`gap-${i}`}>
              <AppText size="sm" weight="600" muted>
                …
              </AppText>
            </PageDot>
          ) : (
            <PageDot key={p} active={p === page} onPress={() => onPageChange(p)}>
              <AppText size="sm" weight={p === page ? '700' : '600'} mono color={p === page ? '#FFFFFF' : c.mutedForeground}>
                {p}
              </AppText>
            </PageDot>
          ),
        )}
        <PageDot soft disabled={page >= totalPages} onPress={() => onPageChange(page + 1)}>
          <Ionicons name="chevron-forward" size={16} color={c.foreground} />
        </PageDot>
      </View>
    </View>
  );
};
