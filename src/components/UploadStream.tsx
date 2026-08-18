import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { withAlpha } from '../theme';

const USE_NATIVE = Platform.OS !== 'web';

/**
 * ตำแหน่งสายอนุภาคตามสัดส่วนความกว้างการ์ด
 * วัดจาก Figma node 32:12478 — สาย 4 เส้นอยู่กลางถึงค่อนขวา ไม่ทับบล็อกข้อความซ้าย
 */
const LANES = [0.33, 0.5, 0.68, 0.79];
/** ความกว้างที่เม็ดกระจายได้ในหนึ่งสาย */
const LANE_W = 14;

interface Dot {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export interface UploadStreamProps {
  width: number;
  height: number;
  /** สีเม็ดข้อมูล */
  color: string;
  /** สีพื้นการ์ด — ใช้ไล่จางหัว/ท้ายสายให้กลืนไปกับพื้น แทนการตัดขาดตรง ๆ */
  fadeColor: string;
  /** สัดส่วนตำแหน่งแนวนอนของแต่ละสาย (0–1) */
  lanes?: number[];
  /** มิลลิวินาทีต่อการไหลขึ้นหนึ่งรอบ */
  cycleMs?: number;
  /** ปิดการเคลื่อนไหว (ธีม reduce motion) — ยังวาดเม็ดนิ่ง ๆ ให้ */
  reduceMotion?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * สายเม็ดข้อมูลไหลขึ้น "คลาวด์" — พื้นหลังตกแต่งของ hero หน้า Sync (Figma node 32:12478)
 *
 * เทคนิควนลูปแบบไร้รอยต่อ: วาดชุดเม็ดซ้ำสองชุด (y และ y+height) ในกล่องสูง 2 เท่า
 * แล้วเลื่อนขึ้นทีละ height พอดี — เฟรมสุดท้ายจึงเหมือนเฟรมแรกเป๊ะ
 * ขยับด้วย translateY อย่างเดียว → วิ่งบน native driver ได้ ไม่ต้อง re-layout
 */
export const UploadStream: React.FC<UploadStreamProps> = ({
  width,
  height,
  color,
  fadeColor,
  lanes = LANES,
  cycleMs = 5200,
  reduceMotion = false,
  style,
}) => {
  // สองจังหวะสลับกันไปตามสาย — สายที่ไหลไม่พร้อมกันดูเป็นธรรมชาติกว่าสายเดียวกันทั้งหมด
  const fast = useRef(new Animated.Value(0)).current;
  const slow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion || height <= 0 || width <= 0) return;
    const spin = (v: Animated.Value, duration: number) => {
      v.setValue(0);
      const loop = Animated.loop(
        Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: USE_NATIVE }),
      );
      loop.start();
      return loop;
    };
    const a = spin(fast, cycleMs);
    const b = spin(slow, Math.round(cycleMs * 1.55));
    return () => {
      a.stop();
      b.stop();
    };
  }, [fast, slow, cycleMs, reduceMotion, height, width]);

  const columns = useMemo<Dot[][]>(() => {
    if (height <= 0) return [];
    // ความหนาแน่น: ราวหนึ่งเม็ดต่อ 7px ของความสูง — ใกล้เคียงความถี่ของเม็ดใน Figma
    const n = Math.max(8, Math.round(height / 7));
    return lanes.map(() =>
      Array.from({ length: n }, () => ({
        x: Math.random() * LANE_W,
        y: Math.random() * height,
        // ส่วนใหญ่เป็นผงละเอียด มีเม็ดเด่นแทรกราว 1 ใน 10
        size: 1 + Math.random() * (Math.random() < 0.1 ? 1.9 : 1.1),
        opacity: 0.18 + Math.random() * 0.5,
      })),
    );
  }, [height, lanes]);

  if (width <= 0 || height <= 0) return null;

  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'hidden' }, style]}
    >
      {columns.map((dots, li) => {
        const phase = li % 2 === 0 ? fast : slow;
        const shift = reduceMotion ? 0 : phase.interpolate({ inputRange: [0, 1], outputRange: [0, -height] });
        return (
          <View
            key={lanes[li]}
            style={{
              position: 'absolute',
              top: 0,
              left: width * lanes[li] - LANE_W / 2,
              width: LANE_W,
              height,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: LANE_W,
                height: height * 2,
                transform: [{ translateY: shift }] as never,
              }}
            >
              {dots.map((d, di) =>
                // ชุดล่าง + ชุดบน (เลื่อนลงหนึ่งช่วงความสูง) = ภาพต่อเนื่องเมื่อวนลูป
                [0, height].map((off) => (
                  <View
                    key={`${di}-${off}`}
                    style={{
                      position: 'absolute',
                      left: d.x,
                      top: d.y + off,
                      width: d.size,
                      height: d.size,
                      borderRadius: d.size / 2,
                      backgroundColor: color,
                      opacity: d.opacity,
                    }}
                  />
                )),
              )}
            </Animated.View>
          </View>
        );
      })}

      {/* หัวสายโผล่จากขอบบนการ์ด ปลายสายจางหายก่อนถึงแถว KPI */}
      <LinearGradient
        colors={[fadeColor, withAlpha(fadeColor, 0)]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 16 }}
      />
      <LinearGradient
        colors={[withAlpha(fadeColor, 0), fadeColor]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.round(height * 0.4) }}
      />
    </View>
  );
};
