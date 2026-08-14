import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface CardProps {
  children: React.ReactNode;
  /** ระดับมุมโค้ง — การ์ดหลักของ Figma ใช้ 'xl' (24) การ์ดย่อย 'lg' (16) */
  rounded?: 'md' | 'lg' | 'xl';
  padded?: boolean | number;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, rounded = 'lg', padded = true, shadow = 'sm', style }) => {
  const t = useTheme();
  const padding = typeof padded === 'number' ? padded : padded ? 16 : 0;
  return (
    <View
      style={[
        {
          backgroundColor: t.colors.card,
          borderRadius: t.radius[rounded],
          borderWidth: 1,
          borderColor: t.colors.border,
          padding,
          overflow: padding === 0 ? 'hidden' : 'visible',
        },
        shadow !== 'none' ? t.shadow[shadow] : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};

export interface SectionCardProps extends Omit<CardProps, 'children'> {
  title: string;
  caption?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  /** padding เนื้อหาใต้หัวข้อ (0 เมื่อวางตารางชิดขอบ) */
  bodyPadding?: number;
}

/** การ์ดพร้อมแถวหัวข้อ + เส้นคั่น ใช้เป็นโครงหลักของทุก section ในหน้าจอ */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  caption,
  right,
  children,
  bodyPadding = 16,
  rounded = 'xl',
  shadow = 'sm',
  style,
}) => {
  const t = useTheme();
  return (
    <Card rounded={rounded} padded={0} shadow={shadow} style={style}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 13,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.border,
        }}
      >
        <View style={{ flex: 1, gap: 1 }}>
          <AppText size="md" weight="700">
            {title}
          </AppText>
          {caption ? (
            <AppText size="xs" muted>
              {caption}
            </AppText>
          ) : null}
        </View>
        {right}
      </View>
      <View style={{ padding: bodyPadding }}>{children}</View>
    </Card>
  );
};
