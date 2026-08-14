import React from 'react';
import { Image, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, withAlpha } from '../theme';
import { AppText } from './AppText';

export interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  caption?: string;
  /** สีของตัวเลขใหญ่ ใช้ค่าจาก theme.kpi.* */
  accent: string;
  /** ภาพ 3D จากไฟล์ Figma (FigmaAssets.kpi* / cloud*) — มาก่อน icon เสมอ */
  image?: ImageSourcePropType;
  /** ไอคอน fallback เมื่อไม่มีภาพ */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

/**
 * การ์ดตัวเลขสรุป (Figma 16:859 · kpi-card)
 * ขาว r16 · ขอบ #E5E7EB · padding 16 ทุกด้าน · ระยะ label→value 8
 * label 14/600 เทา · ตัวเลข 32/700 สีสถานะ · caption 12/400
 * ภาพ 3D วางชิดขวาแบบล้นขอบเล็กน้อยตาม Figma
 */
export const KpiCard: React.FC<KpiCardProps> = ({ label, value, unit, caption, accent, image, icon, style }) => {
  const t = useTheme();
  const c = t.colors;
  const [hover, setHover] = React.useState(false);
  return (
    <View
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={[
        {
          flex: 1,
          minWidth: 168,
          borderRadius: t.radius.lg,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: hover ? withAlpha(accent, 0.5) : c.border,
          padding: 16,
          gap: 8,
          // ครอปภาพ 3D ที่ยื่นพ้นมุมล่างขวา ให้ดูเหมือนโผล่ขึ้นมาจากขอบการ์ด
          overflow: 'hidden',
        },
        // hover: ยกตัวขึ้นเล็กน้อย + ขอบติดสีสถานะ + เงาลึกขึ้น
        hover ? [{ transform: [{ translateY: -2 }] }, t.shadow.md] : null,
        style,
      ]}
    >
      {/* เว้นทางขวาให้ภาพ 3D ไม่ทับตัวหนังสือ · zIndex 2 = อยู่เหนือเกรเดียนต์ที่ไล่จางภาพ */}
      <AppText size="sm" weight="600" muted numberOfLines={1} style={{ paddingRight: image ? 44 : 0, zIndex: 2 }}>
        {label}
      </AppText>
      <View style={{ gap: 2, paddingRight: image ? 44 : 0, zIndex: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
          <AppText size="kpi" weight="700" color={accent} style={{ lineHeight: t.fs.kpi * 1.2 }}>
            {value}
          </AppText>
          {unit ? (
            <AppText size="lg" weight="700" color={accent}>
              {unit}
            </AppText>
          ) : null}
        </View>
        {caption ? (
          <AppText size="xs" muted numberOfLines={1}>
            {caption}
          </AppText>
        ) : null}
      </View>

      {image ? (
        <>
          <Image
            source={image}
            // ยึดมุมล่างขวาแล้วยื่นพ้นขอบ — โดนการ์ดครอป เหลือครึ่งบนโผล่ขึ้นมา
            style={{ position: 'absolute', right: -12, bottom: -28, width: 104, height: 104, zIndex: 0 }}
            resizeMode="contain"
          />
          {/* ไล่จางก้นภาพให้กลืนขอบล่างการ์ด แทนการตัดขาดตรง ๆ */}
          <LinearGradient
            colors={['transparent', c.card]}
            style={{ position: 'absolute', right: 0, bottom: 0, width: 108, height: 52, zIndex: 1 }}
          />
        </>
      ) : icon ? (
        <View
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: withAlpha(accent, 0.12),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name={icon} size={22} color={accent} />
        </View>
      ) : null}
    </View>
  );
};
