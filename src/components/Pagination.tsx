import React, { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { AnimatedPressable, usePressScale, webFocusRing } from './usePressScale';

const ROW_H = 34;

const WEB_NO_OUTLINE = Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as ViewStyle) : null;

/** ปุ่มกลมของแถบแบ่งหน้า — 32px (ย่อจาก 40 ของ Figma ให้เข้ากับความหนาแน่นของตาราง) */
const PageDot: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  soft?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}> = ({ children, active = false, soft = false, disabled = false, onPress }) => {
  const t = useTheme();
  const c = t.colors;
  const press = usePressScale(0.9);
  return (
    <AnimatedPressable
      {...(disabled ? {} : press.handlers)}
      onPress={disabled ? undefined : onPress}
      disabled={disabled || !onPress}
      style={[
        {
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? c.primary : soft ? c.surface2 : c.card,
          opacity: disabled ? 0.4 : 1,
        },
        disabled ? null : press.pressStyle,
        webFocusRing(c.ring),
      ]}
    >
      {children}
    </AnimatedPressable>
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
  const { width: winW, height: winH } = useWindowDimensions();
  const items = pagesFor(page, Math.max(1, totalPages));

  /* dropdown จำนวนรายการต่อหน้า — วัดตำแหน่งจากปุ่มจริง แบบเดียวกับ SelectField */
  const sizeRef = useRef<View>(null);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const menuH = pageSizeOptions.length * ROW_H + 12;
  const openUp = anchor.y + anchor.h + menuH + 14 > winH;

  const openSizeMenu = () => {
    sizeRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, w, h });
      setSizeOpen(true);
    });
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
          paddingVertical: 10,
          backgroundColor: c.card,
        },
        style,
      ]}
    >
      {pageSize ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <AppText size="sm" muted>
            แสดง
          </AppText>
          <Pressable
            ref={sizeRef}
            onPress={openSizeMenu}
            disabled={!onPageSizeChange}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                height: 34,
                paddingHorizontal: 12,
                borderRadius: t.radius.md,
                backgroundColor: c.inputBg,
                borderWidth: 1.5,
                borderColor: sizeOpen ? c.ring : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
              WEB_NO_OUTLINE,
            ]}
          >
            <AppText size="sm" mono>
              {pageSize}
            </AppText>
            <View style={{ transform: [{ rotate: sizeOpen ? '180deg' : '0deg' }] }}>
              <Ionicons name="chevron-down" size={14} color={c.foreground} />
            </View>
          </Pressable>
          <AppText size="sm" muted>
            รายการ
          </AppText>
        </View>
      ) : null}

      <View style={{ flex: 1, minWidth: 12 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <PageDot soft disabled={page <= 1} onPress={() => onPageChange(page - 1)}>
          <Ionicons name="chevron-back" size={15} color={c.foreground} />
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
          <Ionicons name="chevron-forward" size={15} color={c.foreground} />
        </PageDot>
      </View>

      {/* เมนูจำนวนรายการต่อหน้า — สไตล์เดียวกับ dropdown ของ SelectField */}
      <Modal visible={sizeOpen} transparent statusBarTranslucent animationType="fade" onRequestClose={() => setSizeOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setSizeOpen(false)}>
          <View
            style={[
              {
                position: 'absolute',
                top: openUp ? anchor.y - menuH - 6 : anchor.y + anchor.h + 6,
                left: Math.max(8, Math.min(anchor.x, winW - anchor.w - 8)),
                minWidth: anchor.w,
                borderRadius: t.radius.md,
                backgroundColor: c.popover,
                borderWidth: t.isDark ? 1 : 0,
                borderColor: c.border,
                overflow: 'hidden',
                paddingVertical: 6,
              },
              t.shadow.md,
            ]}
          >
            {pageSizeOptions.map((n) => {
              const on = n === pageSize;
              return (
                <Pressable
                  key={n}
                  onPress={() => {
                    setSizeOpen(false);
                    onPageSizeChange?.(n);
                  }}
                  style={({ pressed }) => ({
                    minHeight: ROW_H,
                    paddingHorizontal: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: pressed ? c.surface2 : 'transparent',
                  })}
                >
                  <AppText size="sm" mono weight={on ? '700' : '400'} color={on ? c.primary : c.foreground} style={{ flex: 1 }}>
                    {n}
                  </AppText>
                  {on ? <Ionicons name="checkmark" size={15} color={c.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
