import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '../theme';
import type { FontSizes, FontWeight } from '../theme';

export interface AppTextProps extends TextProps {
  /** ขนาดตาม scale ของธีม หรือเลขพิกเซลตรง ๆ */
  size?: keyof FontSizes | number;
  weight?: FontWeight;
  color?: string;
  /** ใช้ JetBrains Mono (สำหรับ HN, รหัส, เวลา, ตัวเลขในตาราง) */
  mono?: boolean;
  center?: boolean;
  muted?: boolean;
}

/**
 * Text พื้นฐานของระบบ — เลือกไฟล์ฟอนต์ตามน้ำหนักโดยอัตโนมัติ
 * ห้ามใช้ fontWeight ใน style ตรง ๆ ให้ส่งผ่าน prop `weight` เท่านั้น
 */
export const AppText: React.FC<AppTextProps> = ({
  size = 'base',
  weight = '400',
  color,
  mono = false,
  center = false,
  muted = false,
  style,
  children,
  ...rest
}) => {
  const t = useTheme();
  const fontSize = typeof size === 'number' ? size : t.fs[size];
  const base: TextStyle = {
    fontFamily: mono ? t.mono(weight) : t.font(weight),
    fontSize,
    color: color ?? (muted ? t.colors.mutedForeground : t.colors.foreground),
    lineHeight: Math.round(fontSize * 1.45),
    ...(center ? { textAlign: 'center' as const } : null),
    ...(mono ? { fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] } : null),
  };
  return (
    <Text {...rest} style={[base, style]}>
      {children}
    </Text>
  );
};
