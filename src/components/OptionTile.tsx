import React, { useState } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, withAlpha } from '../theme';
import { AnimatedPressable, usePressScale } from './usePressScale';

/** ปิดเส้น focus outline น้ำเงินของเบราว์เซอร์ (เว็บ) — สถานะ active มีขอบเขียวของตัวเองแล้ว */
const WEB_NO_OUTLINE = Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as ViewStyle) : null;

export interface OptionTileProps {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
  /** แสดงเครื่องหมายถูกมุมขวาเมื่อ active */
  check?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * กล่องตัวเลือกแบบเลือกได้ (เลือกธีม/ฟอนต์/หน่วยงาน)
 * active = ขอบ primary + วงแหวน ring จาง · hover (เว็บ/เมาส์) = ขอบ/พื้นติดเขียวอ่อน + ยกตัวเล็กน้อย
 */
export const OptionTile: React.FC<OptionTileProps> = ({ active, onPress, children, check = false, style }) => {
  const t = useTheme();
  const c = t.colors;
  const [hover, setHover] = useState(false);
  const press = usePressScale(0.985);

  return (
    <AnimatedPressable
      onPress={onPress}
      {...press.handlers}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={[
        {
          borderRadius: t.radius.lg,
          borderWidth: active ? 1.5 : 1,
          borderColor: active ? c.primary : hover ? withAlpha(c.primary, 0.55) : c.border,
          backgroundColor: active
            ? withAlpha(c.primary, 0.06)
            : hover
              ? withAlpha(c.primary, 0.04)
              : c.card,
          padding: 12,
          gap: 7,
          ...WEB_NO_OUTLINE,
        },
        !active && hover ? { transform: [{ translateY: -1 }] } : null,
        active
          ? { shadowColor: c.ring, shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 2 }
          : hover
            ? t.shadow.md
            : t.shadow.sm,
        press.pressStyle,
        style,
      ]}
    >
      {check && active ? (
        <View style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
          <Ionicons name="checkmark" size={18} color={c.primary} />
        </View>
      ) : null}
      {children}
    </AnimatedPressable>
  );
};
