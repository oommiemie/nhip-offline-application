import React from 'react';
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/** ปิดเส้น focus outline ของเบราว์เซอร์ (เว็บ) — เราวาดกรอบ focus เองที่ container แล้ว */
const WEB_NO_OUTLINE = Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as TextStyle) : null;
const WEB_NO_OUTLINE_VIEW = Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as ViewStyle) : null;

import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** จุดแดงหน้า label = ฟิลด์บังคับ */
  required?: boolean;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  mono?: boolean;
  readonly?: boolean;
  alignRight?: boolean;
  /** ไฮไลต์ขอบแดง (ฟิลด์ที่ซิงค์ไม่ผ่าน) */
  error?: boolean;
  /** ข้อความแจ้งปัญหาใต้ช่อง — ถ้ามีค่า ขอบจะเป็นสีแดงให้อัตโนมัติ และแทนที่ `hint` */
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Input แบบ filled ตามดีไซน์ Figma (พื้น #F1F3F5, มุม 12, ไอคอนนำหน้า)
 * ฟิลด์ readonly (ข้อมูลจากบัตรประชาชน) ใช้พื้น muted และไม่รับโฟกัส
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  required = false,
  hint,
  icon,
  mono = false,
  readonly = false,
  alignRight = false,
  error = false,
  errorText,
  containerStyle,
  multiline,
  ...inputProps
}) => {
  const t = useTheme();
  const c = t.colors;
  const [focused, setFocused] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);
  const invalid = error || !!errorText;
  // ช่องรหัสผ่านซ่อนค่าไว้เสมอ และมีปุ่มรูปตาให้กดดูได้
  const isPassword = !!inputProps.secureTextEntry;

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          {required ? (
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c.destructive }} />
          ) : null}
          <AppText size="sm" weight="600">
            {label}
          </AppText>
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: 8,
          minHeight: multiline ? t.density.inputH * 1.8 : t.density.inputH,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 10 : 0,
          borderRadius: t.radius.md,
          backgroundColor: readonly ? c.muted : c.inputBg,
          // ความหนาขอบคงที่ ป้องกันช่องขยับตอน focus
          borderWidth: 1.5,
          borderColor: invalid
            ? c.destructive
            : focused
              ? c.ring
              : readonly
                ? c.border
                : c.inputBg === c.background
                  ? c.input
                  : 'transparent',
        }}
      >
        {icon ? (
          <Ionicons name={icon} size={18} color={c.mutedForeground} style={multiline ? { marginTop: 2 } : null} />
        ) : null}
        <TextInput
          {...inputProps}
          multiline={multiline}
          editable={!readonly && inputProps.editable !== false}
          // ต่อ handler ของผู้เรียกไว้ด้วย (ใช้ทำ touched/validate ตอนออกจากช่อง)
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={c.mutedForeground}
          secureTextEntry={isPassword && !reveal}
          style={{
            flex: 1,
            fontFamily: mono ? t.mono('400') : t.font('400'),
            fontSize: t.fs.md,
            color: c.foreground,
            textAlign: alignRight ? 'right' : 'left',
            paddingVertical: 0,
            ...(multiline ? { minHeight: t.density.inputH * 1.4, textAlignVertical: 'top' as const } : null),
            ...WEB_NO_OUTLINE,
          }}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setReveal((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={reveal ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            style={({ pressed }) => [{ padding: 2, opacity: pressed ? 0.5 : 1 }, WEB_NO_OUTLINE_VIEW]}
          >
            <Ionicons
              name={reveal ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={reveal ? c.primary : c.mutedForeground}
            />
          </Pressable>
        ) : null}
      </View>
      {errorText ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="alert-circle" size={13} color={c.destructive} />
          <AppText size="xs" color={c.destructive}>
            {errorText}
          </AppText>
        </View>
      ) : hint ? (
        <AppText size="xs" muted>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
};
