import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme';

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  height?: number;
  /** บังคับสีแถบ (ถ้าไม่ส่ง จะไล่จาก primary → success อัตโนมัติเมื่อครบ 100%) */
  color?: string;
  /** แถบแสงวิ่งระหว่างกำลังทำงาน — ปิดเองเมื่อ 0% / 100% / reduce motion */
  shimmer?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** ความกว้างของแถบแสงที่วิ่งผ่านส่วนที่โหลดแล้ว */
const SHEEN_W = 84;

/**
 * แถบความคืบหน้า (ดาวน์โหลด/นำเข้า)
 * - ความกว้างวิ่งแบบ ease-out ไม่กระโดดเป็นขั้นตาม tick ของข้อมูล
 * - มีแสงวิ่งวน (sheen) ระหว่างกำลังทำงาน เพื่อบอกว่าระบบยังไม่ค้าง
 * - สีไล่เป็น success เมื่อครบ 100%
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ value, height = 6, color, shimmer = true, style }) => {
  const t = useTheme();
  const c = t.colors;
  const clamped = Math.max(0, Math.min(100, value));
  const done = clamped >= 100;
  const running = clamped > 0 && !done;

  const pct = useRef(new Animated.Value(clamped)).current;
  const doneMix = useRef(new Animated.Value(done ? 1 : 0)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const [trackW, setTrackW] = useState(0);

  // ความกว้าง: ไล่ตามค่าใหม่แบบนุ่ม แทนการกระโดดทีละ tick
  useEffect(() => {
    if (t.reduceMotion) {
      pct.setValue(clamped);
      return;
    }
    const a = Animated.timing(pct, {
      toValue: clamped,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [clamped, pct, t.reduceMotion]);

  // เปลี่ยนเป็นเขียว success ตอนครบ
  useEffect(() => {
    const a = Animated.timing(doneMix, {
      toValue: done ? 1 : 0,
      duration: t.reduceMotion ? 0 : 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [done, doneMix, t.reduceMotion]);

  // แสงวิ่งวนเฉพาะตอนกำลังโหลด
  useEffect(() => {
    if (!shimmer || !running || t.reduceMotion || trackW <= 0) {
      sheen.stopAnimation(() => sheen.setValue(0));
      return;
    }
    const loop = Animated.loop(
      Animated.timing(sheen, { toValue: 1, duration: 1150, easing: Easing.linear, useNativeDriver: false }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer, running, t.reduceMotion, trackW, sheen]);

  const width = pct.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const fill = color ?? doneMix.interpolate({ inputRange: [0, 1], outputRange: [c.primary, c.success] });
  const sheenX = sheen.interpolate({ inputRange: [0, 1], outputRange: [-SHEEN_W, trackW + SHEEN_W] });
  const showSheen = shimmer && running && !t.reduceMotion && trackW > 0;

  return (
    <View
      onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
      style={[
        { height, borderRadius: height / 2, backgroundColor: c.muted, overflow: 'hidden', flexGrow: 1 },
        style,
      ]}
    >
      <Animated.View
        style={{
          width,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: fill,
          overflow: 'hidden',
        }}
      >
        {showSheen ? (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: SHEEN_W,
              transform: [{ translateX: sheenX }],
            }}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  );
};
