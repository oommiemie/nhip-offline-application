import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, withAlpha } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** สถานะว่างมาตรฐาน: ไอคอนในกล่องเทา + หัวข้อ + ปุ่มชวนทำสิ่งแรก */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'card-outline', title, subtitle, actionLabel, onAction }) => {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 20 }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          // ธีมเทศกาล: กล่องไอคอนโทนทองอุ่นแทนเทา
          backgroundColor: t.festive ? withAlpha(c.accent, 0.14) : c.surface3,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={24} color={t.festive ? c.accentStrong : c.mutedForeground} />
      </View>
      <AppText size="md" weight="600" center>
        {title}
      </AppText>
      {subtitle ? (
        <AppText size="sm" muted center style={{ maxWidth: 340 }}>
          {subtitle}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} style={{ marginTop: 4 }} /> : null}
    </View>
  );
};
