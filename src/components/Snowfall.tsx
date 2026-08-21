import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';

const NATIVE = Platform.OS !== 'web';

/** ค่าเริ่มต้นเป็น module constant — identity คงที่ ไม่ทำให้ useMemo สร้างเกล็ดใหม่ทุกเฟรม */
const WHITE = ['#FFFFFF'];

interface FlakeSpec {
  id: number;
  x: number;
  size: number;
  drift: number;
  durationMs: number;
  /** ตำแหน่งเริ่มต้นในรอบการตก (0–1) — กระจายเกล็ดให้เต็มกรอบตั้งแต่เฟรมแรก */
  phase: number;
  color: string;
  opacity: number;
  travel: number;
}

/** เกล็ดหิมะเม็ดเดียวที่ตกวนไม่มีสะดุด (เริ่มกลางรอบตาม phase แล้วค่อยวนรอบเต็ม) */
const Flake: React.FC<FlakeSpec & { reduceMotion: boolean }> = ({
  x,
  size,
  drift,
  durationMs,
  phase,
  color,
  opacity,
  travel,
  reduceMotion,
}) => {
  const p = useRef(new Animated.Value(phase)).current;

  useEffect(() => {
    if (reduceMotion) {
      p.setValue(phase);
      return;
    }
    let loop: Animated.CompositeAnimation | null = null;
    p.setValue(phase);
    // ช่วงแรกวิ่งจาก phase ปัจจุบันไปจบรอบ แล้วจึงเข้าลูปเต็มรอบ — หิมะจึงตกต่อเนื่องไม่มีช่วงว่าง
    const intro = Animated.timing(p, {
      toValue: 1,
      duration: Math.max(120, durationMs * (1 - phase)),
      easing: Easing.linear,
      useNativeDriver: NATIVE,
    });
    intro.start(({ finished }) => {
      if (!finished) return;
      p.setValue(0);
      loop = Animated.loop(
        Animated.timing(p, { toValue: 1, duration: durationMs, easing: Easing.linear, useNativeDriver: NATIVE }),
      );
      loop.start();
    });
    return () => {
      intro.stop();
      loop?.stop();
    };
  }, [p, durationMs, phase, reduceMotion]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: -size,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: p.interpolate({ inputRange: [0, 0.1, 0.82, 1], outputRange: [0, opacity, opacity, 0] }),
        transform: [
          { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, travel] }) },
          { translateX: p.interpolate({ inputRange: [0, 0.4, 0.75, 1], outputRange: [0, drift, -drift * 0.7, 0] }) },
        ] as never,
      }}
    />
  );
};

export interface SnowfallProps {
  /** ความสูงของกรอบที่ให้หิมะตก (กำหนดระยะตกของเกล็ด) */
  height?: number;
  /** มุมโค้งของกรอบ — ครอปให้เกล็ดอยู่ในกรอบเท่านั้น */
  radius?: number;
  /** จำนวนเกล็ด */
  count?: number;
  /** ตัวคูณขนาดเกล็ด (1 = จิ๋วในปุ่ม · 1.8 = แบนเนอร์ hero) */
  scale?: number;
  /** ชุดสีเกล็ด — วนตามลำดับ (ไม่ใส่ = ขาวล้วน) เช่น t.festive.snow ของธีมเทศกาล */
  colors?: string[];
  /** ปิดการเคลื่อนไหว — วางเกล็ดนิ่งกระจายทั้งกรอบแทน */
  reduceMotion?: boolean;
}

/**
 * หิมะเม็ดเล็กตกภายในกรอบที่ครอบอยู่ (ธีม Christmas)
 * วางเป็นชั้นทับพื้นหลัง · ครอปตามมุมโค้งของกรอบ · pointerEvents none จึงกดของข้างใต้ได้ตามปกติ
 */
export const Snowfall: React.FC<SnowfallProps> = ({
  height = 52,
  radius = 12,
  count = 16,
  scale = 1,
  colors = WHITE,
  reduceMotion = false,
}) => {
  const flakes = useMemo<FlakeSpec[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        // เลขคี่ที่ไม่หารลงตัวกับ 100 → เกล็ดกระจายทั่วความกว้างโดยไม่ซ้ำตำแหน่ง
        x: (i * 37) % 100,
        size: (1.6 + ((i * 13) % 5) * 0.5) * scale,
        drift: (3 + ((i * 7) % 5)) * scale,
        durationMs: 2600 + ((i * 421) % 2200),
        phase: ((i * 29) % 100) / 100,
        color: colors[i % colors.length],
        // เกล็ดสีต้องทึบกว่าเกล็ดขาวเล็กน้อย ไม่งั้นจมหายไปกับพื้นแดงเข้ม
        opacity: (colors[i % colors.length] === '#FFFFFF' ? 0.5 : 0.62) + ((i * 11) % 5) * 0.1,
        travel: height + 6,
      })),
    [count, height, scale, colors],
  );

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: radius, overflow: 'hidden' }}
    >
      {flakes.map((f) => (
        <Flake key={f.id} {...f} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
};
