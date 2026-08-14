import { useRef } from 'react';
import { Animated, Easing, Platform, Pressable } from 'react-native';

import { useTheme } from '../theme';

const NATIVE = Platform.OS !== 'web';

/** Pressable ที่รับ Animated style ได้ตรง ๆ ไม่ต้องห่อ View เพิ่ม (กัน layout เพี้ยน) */
export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * ฟีดแบ็กตอนกด: ย่อลงเร็ว ๆ แล้วเด้งกลับ
 * ใช้คู่กับ `AnimatedPressable` — กระจาย handler ลงไปแล้วใส่ `pressStyle` ใน style array
 *
 *   const press = usePressScale();
 *   <AnimatedPressable {...press.handlers} style={[base, press.pressStyle]} />
 *
 * เคารพ reduceMotion ของธีมให้อัตโนมัติ
 */
export const usePressScale = (to = 0.96) => {
  const t = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const run = (v: number) => {
    if (t.reduceMotion) {
      scale.setValue(1);
      return;
    }
    Animated.timing(scale, {
      toValue: v,
      duration: v < 1 ? 90 : 170,
      // กดลง = หยุดนิ่ง ๆ · ปล่อย = เด้งเกินนิดหน่อยแล้วเข้าที่
      easing: v < 1 ? Easing.out(Easing.quad) : Easing.out(Easing.back(2.2)),
      useNativeDriver: NATIVE,
    }).start();
  };

  return {
    pressStyle: { transform: [{ scale }] },
    handlers: {
      onPressIn: () => run(to),
      onPressOut: () => run(1),
    },
  };
};
