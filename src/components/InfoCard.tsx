import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import type { Tone } from '../theme';
import { AppText } from './AppText';

export interface InfoCardProps {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /** ตัวเลขมุมขวา เช่น "2 รายการ" */
  count?: number;
  /** ปุ่ม/ป้ายมุมขวา (มาก่อน count) */
  right?: React.ReactNode;
  /** โทนสีของไอคอนหัวข้อ (ค่าเริ่มต้น = เขียวหลัก) */
  tone?: Tone;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * การ์ดหัวข้อของฟอร์ม/สรุปข้อมูล — ไอคอนวงกลม + ชื่อหัวข้อ + มุมขวา
 * ใช้ร่วมกันระหว่าง OPD Card และหน้าซักประวัติ/ตรวจรักษา ให้หน้าตาเป็นชุดเดียวกัน
 */
export const InfoCard: React.FC<InfoCardProps> = ({ title, icon, count, right, tone = 'primary', children, style }) => {
  const t = useTheme();
  const c = t.colors;
  const v = t.tones[tone];
  return (
    <View
      style={[
        {
          gap: 12,
          padding: 14,
          borderRadius: t.radius.lg,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.border,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 9,
            backgroundColor: v.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name={icon} size={16} color={v.fg} />
        </View>
        <AppText size="md" weight="700" style={{ flex: 1 }}>
          {title}
        </AppText>
        {right}
        {count !== undefined ? (
          <AppText size="xs" weight="600" mono muted>
            {count} รายการ
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
};
