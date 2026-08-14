import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface TooltipProps {
  /** ข้อความสั้น ๆ บอกหน้าที่ของปุ่ม เช่น "ออกจากระบบ SSO" */
  label: string;
  children: React.ReactNode;
  /** ตำแหน่งป้าย (ค่าเริ่มต้น: ใต้ปุ่ม) */
  position?: 'top' | 'bottom';
  style?: StyleProp<ViewStyle>;
}

/**
 * Tooltip มินิมอล — ป้ายทึบเรียบ จางเข้าเมื่อชี้ค้าง ~250ms (เว็บ/เมาส์เท่านั้น)
 * บนจอสัมผัสไม่แสดง ให้ตั้ง accessibilityLabel ที่ปุ่มควบคู่กันเสมอ
 */
export const Tooltip: React.FC<TooltipProps> = ({ label, children, position = 'bottom', style }) => {
  const t = useTheme();
  const [show, setShow] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const below = position === 'bottom';

  useEffect(() => {
    Animated.timing(fade, {
      toValue: show ? 1 : 0,
      duration: show ? 140 : 100,
      delay: show ? 250 : 0,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [show, fade]);

  return (
    <View
      style={[{ position: 'relative' }, style]}
      onPointerEnter={() => setShow(true)}
      onPointerLeave={() => setShow(false)}
    >
      {children}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          ...(below ? { top: '100%', marginTop: 6 } : { bottom: '100%', marginBottom: 6 }),
          left: -70,
          right: -70,
          alignItems: 'center',
          opacity: fade,
          transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: below ? [-2, 0] : [2, 0] }) }],
        }}
      >
        <View
          style={{
            backgroundColor: t.isDark ? '#E7F8EC' : '#0B2D22',
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <AppText size="xs" weight="500" color={t.isDark ? '#0B2D22' : '#F0FBF4'} numberOfLines={1}>
            {label}
          </AppText>
        </View>
      </Animated.View>
    </View>
  );
};
