import React, { useState } from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, withAlpha } from '../theme';
import { AppText } from './AppText';
import { AnimatedPressable, usePressScale } from './usePressScale';

export type ButtonVariant = 'primary' | 'strong' | 'outline' | 'ghost' | 'destructive' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonRounded = 'md' | 'lg' | 'pill';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * ทุกปุ่มในระบบเป็นทรง pill (ค่าเริ่มต้น) ตาม design system
   * ข้อยกเว้นเดียว: ปุ่มยืนยันตัวตน (LoginScreen, การ์ด MOPH SSO, SsoModal) ใช้ 'md'
   * ให้มุมเข้ากับ input ในฟอร์มเดียวกัน ตาม Figma 15:6
   */
  rounded?: ButtonRounded;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  rounded = 'pill',
  icon,
  iconRight,
  disabled = false,
  loading = false,
  full = false,
  style,
  testID,
}) => {
  const t = useTheme();
  const c = t.colors;

  const height = size === 'sm' ? t.density.controlH - 10 : size === 'lg' ? t.density.controlH + 6 : t.density.controlH;
  const padH = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;
  const fontSize = size === 'sm' ? t.fs.sm : size === 'lg' ? t.fs.lg : t.fs.md;
  const radius = rounded === 'pill' ? t.radius.pill : rounded === 'lg' ? t.radius.lg : t.radius.md;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.primary, fg: c.primaryForeground },
    strong: { bg: c.primaryStrong, fg: '#FFFFFF' },
    outline: { bg: c.card, fg: c.primary, border: c.border },
    ghost: { bg: 'transparent', fg: c.primary },
    subtle: { bg: c.surface3, fg: c.foreground },
    destructive: { bg: c.destructive, fg: c.destructiveForeground },
  };
  const v = palette[variant];
  const dim = disabled || loading;
  const press = usePressScale(0.97);
  const [pressed, setPressed] = useState(false);

  return (
    <AnimatedPressable
      testID={testID}
      onPress={dim ? undefined : onPress}
      disabled={dim}
      onPressIn={() => {
        if (dim) return;
        setPressed(true);
        press.handlers.onPressIn();
      }}
      onPressOut={() => {
        setPressed(false);
        press.handlers.onPressOut();
      }}
      style={[
        {
          height,
          paddingHorizontal: padH,
          borderRadius: radius,
          backgroundColor: pressed && v.bg !== 'transparent' ? withAlpha(v.bg, 0.85) : v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: dim ? 0.55 : 1,
          alignSelf: full ? 'stretch' : 'auto',
        },
        variant === 'primary' || variant === 'strong' ? t.shadow.sm : null,
        press.pressStyle,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={v.fg} /> : icon ? <View>{icon}</View> : null}
      <AppText size={fontSize} weight="600" color={v.fg}>
        {label}
      </AppText>
      {iconRight ? <View>{iconRight}</View> : null}
    </AnimatedPressable>
  );
};
