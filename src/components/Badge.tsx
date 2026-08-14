import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { Tone } from '../theme';
import { AppText } from './AppText';

export interface BadgeProps {
  label: string;
  tone?: Tone;
  /** แสดงจุดสีหน้าข้อความ */
  dot?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

/** ป้ายสถานะทรง pill ตามดีไซน์ Figma (เช่น รอเรียกตรวจ / กำลังคัดกรอง / เสร็จสิ้น) */
export const Badge: React.FC<BadgeProps> = ({ label, tone = 'neutral', dot = false, size = 'md', style }) => {
  const t = useTheme();
  const v = t.tones[tone];
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          alignSelf: 'flex-start',
          // ตรงตาม Figma 16:859 · badge-* → pad(6,12) สูง 27
          paddingHorizontal: 12,
          paddingVertical: size === 'sm' ? 5 : 4,
          borderRadius: t.radius.pill,
          backgroundColor: v.bg,
        },
        style,
      ]}
    >
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: v.fg }} /> : null}
      <AppText size={size === 'sm' ? 'xs' : 'sm'} weight="600" color={v.fg}>
        {label}
      </AppText>
    </View>
  );
};

export interface StatusDotProps {
  color: string;
  size?: number;
}

export const StatusDot: React.FC<StatusDotProps> = ({ color, size = 8 }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
);
