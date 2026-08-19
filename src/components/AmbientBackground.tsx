import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, View, type ViewStyle } from 'react-native';

import { useTheme, withAlpha } from '../theme';

const NATIVE = Platform.OS !== 'web';

/** วงกลมสีนุ่ม 1 ดวง — ลอยวนช้า ๆ ด้วย translate + scale (native driver ล้วน) */
const Blob: React.FC<{
  color: string;
  size: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  /** ระยะแกว่ง (px) และคาบเวลา (ms) — ต่างกันทีละดวงให้ดูเป็นธรรมชาติ */
  driftX: number;
  driftY: number;
  durationMs: number;
  reduceMotion: boolean;
}> = ({ color, size, top, left, right, bottom, driftX, driftY, durationMs, reduceMotion }) => {
  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    phase.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(phase, { toValue: 1, duration: durationMs, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
        Animated.timing(phase, { toValue: 0, duration: durationMs, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, durationMs, reduceMotion]);

  const tx = phase.interpolate({ inputRange: [0, 1], outputRange: [0, driftX] });
  const ty = phase.interpolate({ inputRange: [0, 1], outputRange: [0, driftY] });
  const sc = phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.07, 1] });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
          right,
          bottom,
          transform: reduceMotion ? undefined : ([{ translateX: tx }, { translateY: ty }, { scale: sc }] as never),
        } as ViewStyle,
        // เว็บ: เบลอหนัก ๆ ให้กลายเป็นแสงสีจาง ๆ · native ไม่มี filter จึงพึ่ง opacity ต่ำแทน
        Platform.OS === 'web' ? ({ filter: 'blur(80px)' } as unknown as ViewStyle) : null,
      ]}
    />
  );
};

/**
 * พื้นหลังแอมเบียนต์ของแผงเนื้อหาหลัก — แสงสีเขียวอ่อนหลายโทนลอยวนช้า ๆ
 * วางเป็นชั้นล่างสุดใต้ทุกหน้า (การ์ดขาวลอยอยู่ด้านบน) · เคารพ reduce motion
 */
export const AmbientBackground: React.FC = () => {
  const t = useTheme();
  const dim = t.isDark;
  // วางบนพื้นมิ้นต์รอบนอก — ใช้แสงขาวเรือง + เขียวเข้มจาง ให้เห็นความต่างจากพื้น
  const a = dim ? 0.06 : NATIVE ? 0.14 : 0.55;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Blob color={withAlpha('#FFFFFF', a)} size={480} top="-14%" left="-6%" driftX={54} driftY={40} durationMs={13000} reduceMotion={t.reduceMotion} />
      <Blob color={withAlpha(dim ? '#52B788' : '#74C69D', a * 0.62)} size={400} top="34%" left="-9%" driftX={44} driftY={-34} durationMs={17000} reduceMotion={t.reduceMotion} />
      <Blob color={withAlpha('#FFFFFF', a * 0.8)} size={420} bottom="-10%" left="4%" driftX={38} driftY={-40} durationMs={21000} reduceMotion={t.reduceMotion} />
      <Blob color={withAlpha(dim ? '#40916C' : '#52B788', a * 0.5)} size={340} bottom="20%" right="-7%" driftX={-42} driftY={-28} durationMs={15000} reduceMotion={t.reduceMotion} />
    </View>
  );
};
