import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface CheckSquareProps {
  checked: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** ช่องติ๊กแสดงผลอย่างเดียว (ใช้ในคอลัมน์ขั้นตอนการตรวจของหน้า Sync) */
export const CheckSquare: React.FC<CheckSquareProps> = ({ checked, size = 18, style }) => {
  const t = useTheme();
  const c = t.colors;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: checked ? c.primary : c.border,
          backgroundColor: checked ? c.primary : c.surface3,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {checked ? <Ionicons name="checkmark" size={size - 5} color={c.primaryForeground} /> : null}
    </View>
  );
};

export interface CheckboxProps {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <Pressable
      onPress={() => onChange?.(!checked)}
      disabled={disabled || !onChange}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, opacity: disabled ? 0.5 : 1 }}
    >
      <CheckSquare checked={checked} />
      {label ? <AppText size="md">{label}</AppText> : null}
    </Pressable>
  );
};
