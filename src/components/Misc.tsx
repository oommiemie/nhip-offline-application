import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { AnimatedPressable, useHoverFade, usePressScale, webFocusRing } from './usePressScale';

/** วงกลมอักษรย่อ (เจ้าหน้าที่/ผู้ใช้) */
export const Avatar: React.FC<{ label: string; size?: number; bg?: string; fg?: string }> = ({
  label,
  size = 36,
  bg,
  fg,
}) => {
  const t = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg ?? t.tones.primary.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText size={Math.round(size * 0.34)} weight="600" color={fg ?? t.tones.primary.fg}>
        {label}
      </AppText>
    </View>
  );
};

/** ปุ่มไอคอนกลม (กระดิ่งแจ้งเตือน ฯลฯ) */
export const IconBtn: React.FC<{
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ name, onPress, size = 40, style }) => {
  const t = useTheme();
  const press = usePressScale(0.92);
  // hover: พื้นไล่จากเทา → เขียวอ่อน และไอคอนเปลี่ยนเป็นเขียวเข้ม
  const h = useHoverFade();
  return (
    <AnimatedPressable
      {...press.handlers}
      onPointerEnter={h.handlers.onPointerEnter}
      onPointerLeave={h.handlers.onPointerLeave}
      onPress={onPress}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: h.mix(t.colors.muted, t.tones.primary.bg),
          alignItems: 'center',
          justifyContent: 'center',
        },
        press.pressStyle,
        webFocusRing(t.colors.ring),
        style,
      ]}
    >
      <Ionicons
        name={name}
        size={Math.round(size * 0.45)}
        color={h.hover ? t.tones.primary.fg : t.colors.mutedForeground}
      />
    </AnimatedPressable>
  );
};

/**
 * แถบเตือนแพ้ยา / ไม่มีประวัติแพ้ยา บนหัว encounter และ OPD Card
 * variant 'danger' = พื้นแดงเข้มตัวหนังสือขาว (ห้ามลดความเด่น — ความปลอดภัยผู้ป่วย)
 */
export const AlertBand: React.FC<{
  variant: 'danger' | 'caution' | 'info';
  title: string;
  detail?: string;
  style?: StyleProp<ViewStyle>;
}> = ({ variant, title, detail, style }) => {
  const t = useTheme();
  const c = t.colors;
  const cfg =
    variant === 'danger'
      ? { bg: c.alertBand, fg: c.alertBandForeground, icon: 'alert' as const }
      : variant === 'caution'
        ? { bg: t.tones.warning.bg, fg: t.tones.warning.fg, icon: 'alert-circle-outline' as const }
        : { bg: t.tones.info.bg, fg: t.tones.info.fg, icon: 'information-outline' as const };
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
          paddingHorizontal: 14,
          paddingVertical: 9,
          backgroundColor: cfg.bg,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={cfg.icon} size={17} color={cfg.fg} />
      <AppText size="sm" weight="700" color={cfg.fg}>
        {title}
      </AppText>
      {detail ? (
        <AppText size="sm" color={cfg.fg} style={{ flex: 1, opacity: 0.92 }} numberOfLines={2}>
          {detail}
        </AppText>
      ) : null}
    </View>
  );
};

/** แถวข้อมูล label:value ใช้ใน OPD Card / สรุปต่าง ๆ */
export const KeyValue: React.FC<{ label: string; value: string; mono?: boolean; valueColor?: string }> = ({
  label,
  value,
  mono = false,
  valueColor,
}) => (
  <View style={{ gap: 2, minWidth: 120 }}>
    <AppText size="xs" muted>
      {label}
    </AppText>
    <AppText size="sm" weight="600" mono={mono} color={valueColor}>
      {value}
    </AppText>
  </View>
);
