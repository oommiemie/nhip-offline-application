import React, { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label?: string;
  required?: boolean;
  value: string;
  options: Array<SelectOption | string>;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const ROW_H = 40;

/**
 * Dropdown แบบกางใต้ช่อง (anchored) — วัดตำแหน่งช่องด้วย measureInWindow
 * แล้ววางเมนูกว้างเท่าช่องไว้ด้านล่าง (กางขึ้นบนอัตโนมัติเมื่อที่ไม่พอ)
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  required = false,
  value,
  options,
  onChange,
  placeholder = 'เลือก…',
  disabled = false,
  containerStyle,
}) => {
  const t = useTheme();
  const c = t.colors;
  const { width: winW, height: winH } = useWindowDimensions();
  const fieldRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const items: SelectOption[] = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const selected = items.find((o) => o.value === value);

  const openMenu = () => {
    fieldRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, w, h });
      setOpen(true);
    });
  };
  const close = () => setOpen(false);

  const menuH = Math.min(items.length * ROW_H + 10, 288);
  const spaceBelow = anchor ? winH - (anchor.y + anchor.h) : 0;
  const openUp = anchor ? spaceBelow < menuH + 14 && anchor.y > menuH + 14 : false;
  const menuTop = anchor ? (openUp ? anchor.y - menuH - 6 : anchor.y + anchor.h + 6) : 0;
  const menuLeft = anchor ? Math.max(8, Math.min(anchor.x, winW - anchor.w - 8)) : 0;

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

      <Pressable
        ref={fieldRef}
        disabled={disabled}
        onPress={openMenu}
        style={{
          height: t.density.inputH,
          paddingHorizontal: 12,
          borderRadius: t.radius.md,
          backgroundColor: c.inputBg,
          borderWidth: 1.5,
          borderColor: open ? c.ring : c.inputBg === c.background ? c.input : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <AppText size="md" color={selected ? c.foreground : c.mutedForeground} style={{ flex: 1 }} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </AppText>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Ionicons name="chevron-down" size={16} color={c.mutedForeground} />
        </View>
      </Pressable>

      <Modal visible={open && !!anchor} transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
        {/* backdrop โปร่งใส — แตะที่ไหนก็ปิด */}
        <Pressable style={{ flex: 1 }} onPress={close}>
          {/* เมนูมินิมอล: การ์ดลอยไร้กรอบ (มีเส้นบางเฉพาะโหมดมืด) เงานุ่ม แถวโปร่ง */}
          <View
            style={[
              {
                position: 'absolute',
                top: menuTop,
                left: menuLeft,
                width: anchor?.w ?? 0,
                maxHeight: menuH,
                borderRadius: t.radius.md,
                backgroundColor: c.popover,
                borderWidth: t.isDark ? 1 : 0,
                borderColor: c.border,
                overflow: 'hidden',
              },
              t.shadow.md,
            ]}
          >
            <ScrollView contentContainerStyle={{ paddingVertical: 6 }}>
              {items.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      onChange(o.value);
                      close();
                    }}
                    style={({ pressed }) => ({
                      minHeight: ROW_H,
                      paddingHorizontal: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: pressed ? c.surface2 : 'transparent',
                    })}
                  >
                    <AppText
                      size="sm"
                      weight={active ? '600' : '400'}
                      color={active ? c.primary : c.foreground}
                      style={{ flex: 1 }}
                      numberOfLines={1}
                    >
                      {o.label}
                    </AppText>
                    {active ? <Ionicons name="checkmark" size={15} color={c.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
