import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { AnimatedPressable, usePressScale, webFocusRing } from './usePressScale';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  count?: string | number;
  dot?: string;
  /** ไอคอนนำหน้าป้าย (hero หน้า Sync ใช้ swap-horizontal ตาม Figma 32:12478) */
  icon?: React.ReactNode;
  /** โทนเขียว: ขอบ + ตัวอักษรใช้สี ring แทนสีเทา — ชิปบนพื้นการ์ดสว่างตาม Figma */
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** ชิปตัวกรอง/แท็บรอง ทรง pill — active = พื้นเขียวอ่อน ตัวอักษรเขียวเข้ม */
export const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  onPress,
  count,
  dot,
  icon,
  accent = false,
  style,
}) => {
  const t = useTheme();
  const c = t.colors;
  const tone = t.tones.primary;
  const fg = active ? tone.fg : accent ? c.ring : c.mutedForeground;
  const press = usePressScale(0.95);
  return (
    <AnimatedPressable
      {...(onPress ? press.handlers : {})}
      onPress={onPress}
      disabled={!onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          height: 32,
          paddingHorizontal: 12,
          borderRadius: t.radius.pill,
          backgroundColor: active ? tone.bg : c.card,
          borderWidth: 1,
          borderColor: active ? tone.border : accent ? c.ring : c.border,
        },
        onPress ? press.pressStyle : null,
        webFocusRing(c.ring),
        style,
      ]}
    >
      {dot ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} /> : null}
      {icon ? <View>{icon}</View> : null}
      <AppText size="sm" weight={active || accent ? '600' : '400'} color={fg}>
        {label}
      </AppText>
      {count !== undefined && count !== '' ? (
        <AppText size="xs" weight="600" mono color={fg}>
          {count}
        </AppText>
      ) : null}
    </AnimatedPressable>
  );
};

export interface StepChipItem {
  label: string;
  state: 'done' | 'active' | 'pending';
}

/** แถบ step ของ flow ตั้งค่า (เข้าสู่ระบบ SSO ▸ เลือกหน่วยงาน ▸ ดาวน์โหลด/นำเข้า) — บังคับแถวเดียว */
export const StepperChips: React.FC<{ steps: StepChipItem[]; style?: StyleProp<ViewStyle> }> = ({ steps, style }) => {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }, style]}>
      {steps.map((s, i) => {
        const activeLike = s.state !== 'pending';
        const tone = t.tones.primary;
        return (
          <React.Fragment key={s.label}>
            {i > 0 ? <Ionicons name="arrow-forward" size={12} color={c.mutedForeground} /> : null}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                height: 26,
                paddingHorizontal: 9,
                borderRadius: t.radius.pill,
                backgroundColor: activeLike ? tone.bg : c.surface2,
                borderWidth: 1,
                borderColor: activeLike ? tone.border : c.border,
                flexShrink: 1,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: s.state === 'pending' ? c.mutedForeground : t.colors.success,
                }}
              />
              <AppText
                size="xs"
                weight={s.state === 'active' ? '600' : '400'}
                color={activeLike ? tone.fg : c.mutedForeground}
                numberOfLines={1}
              >
                {s.label}
              </AppText>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

/** ปุ่มลูกของ SegmentedPills — แยกออกมาเพื่อให้แต่ละปุ่มมีอนิเมชันกดของตัวเอง */
const SegPill: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => {
  const t = useTheme();
  const c = t.colors;
  const press = usePressScale(0.94);
  return (
    <AnimatedPressable
      {...press.handlers}
      onPress={onPress}
      style={[
        {
          height: 30,
          paddingHorizontal: 14,
          borderRadius: t.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? c.card : 'transparent',
        },
        active ? t.shadow.sm : null,
        press.pressStyle,
        webFocusRing(c.ring),
      ]}
    >
      <AppText size="sm" weight={active ? '600' : '400'} color={active ? c.foreground : c.mutedForeground}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
};

export interface SegmentedOption<V extends string> {
  value: V;
  label: string;
}

/** ปุ่มสลับสองทาง (สว่าง/มืด, drawer/modal) ทรง pill ในราง */
export function SegmentedPills<V extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: Array<SegmentedOption<V>>;
  value: V;
  onChange: (v: V) => void;
  style?: StyleProp<ViewStyle>;
}): React.ReactElement {
  const t = useTheme();
  const c = t.colors;
  return (
    <View
      style={[
        { flexDirection: 'row', padding: 3, borderRadius: t.radius.pill, backgroundColor: c.muted, alignSelf: 'flex-start' },
        style,
      ]}
    >
      {options.map((o) => (
        <SegPill key={o.value} label={o.label} active={o.value === value} onPress={() => onChange(o.value)} />
      ))}
    </View>
  );
};
