import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, View, type StyleProp, type ViewStyle } from 'react-native';

/** จำนวนคีย์เฟรมต่อ 1 รอบคลื่น — คำนวณล่วงหน้าแล้วให้ Animated interpolate ต่อ (ไม่คิดเลขทุกเฟรม) */
const K = 24;
/** แถวตามแนวลึก (บน = ไกล, ล่าง = ใกล้) */
const ROWS = 12;
/** ช่องต่อแถว → จุดยอด COLS+1 จุด (แถวใกล้จะล้นออกนอกกรอบแล้วถูกตัดทิ้ง) */
const COLS = 26;

const USE_NATIVE = Platform.OS !== 'web';

interface Vertex {
  x: number;
  y: number;
}

/** เส้น 1 ท่อน: กล่องฐานคงที่ + คีย์เฟรมของ translateY / rotate / scale */
interface Seg {
  left: number;
  top: number;
  w: number;
  h: number;
  opacity: number;
  ty: number[];
  rot: string[];
  scale: number[];
  axis: 'x' | 'y';
}

export interface WireMeshProps {
  width: number;
  height: number;
  color?: string;
  /** ความจางรวมของทั้งเมช */
  opacity?: number;
  /** ทิศไล่จาง: 'down' = ชัดบนจางลงล่าง · 'up' = ชัดล่างจางขึ้นบน */
  fade?: 'down' | 'up';
  /** วินาทีต่อ 1 รอบคลื่น */
  cycleMs?: number;
  /** ปิดการเคลื่อนไหว (ธีม reduce motion) — ยังวาดเมชนิ่ง ๆ ให้ */
  reduceMotion?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * ตาข่ายเส้น 3 มิติแบบภูมิประเทศที่คลื่นวิ่งตลอดเวลา
 * ใช้เป็นพื้นหลังแบนเนอร์ (แทนภาพ mesh นิ่งจาก Figma node 28:9617)
 *
 * เทคนิค: จุดยอดขยับเฉพาะแกน Y เท่านั้น ตำแหน่ง X คงที่
 * → จุดกึ่งกลางเส้นแต่ละท่อนไม่ขยับตามแกน X ทำให้เหลือแค่ translateY + rotate + scale
 *   ซึ่งเป็น transform ล้วน ๆ วิ่งบน native driver ได้ ไม่ต้อง re-layout
 */
export const WireMesh: React.FC<WireMeshProps> = ({
  width,
  height,
  color = '#D8F3DC',
  opacity = 0.5,
  fade = 'down',
  cycleMs = 16000,
  reduceMotion = false,
  style,
}) => {
  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion || width <= 0) return;
    phase.setValue(0);
    const loop = Animated.loop(
      Animated.timing(phase, { toValue: 1, duration: cycleMs, easing: Easing.linear, useNativeDriver: USE_NATIVE }),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, cycleMs, reduceMotion, width]);

  const segs = useMemo<Seg[]>(() => {
    if (width <= 0 || height <= 0) return [];

    // จุดยอดของทุกคีย์เฟรม: vs[k][r][c]
    const vs: Vertex[][][] = [];
    for (let k = 0; k < K; k++) {
      const ph = (k / K) * Math.PI * 2;
      const rows: Vertex[][] = [];
      for (let r = 0; r < ROWS; r++) {
        const t = r / (ROWS - 1);
        // เปอร์สเปกทีฟ: แถวไกลสุดกว้างเต็มกรอบพอดี แถวใกล้ล้นออกไป → ตาข่ายเต็มการ์ดทุกมุม
        const persp = 1.06 + 1.7 * t * t;
        const baseY = height * (-0.04 + 1.12 * t * t);
        const amp = height * 0.22 * (0.2 + 0.8 * t);
        const cols: Vertex[] = [];
        for (let c = 0; c <= COLS; c++) {
          const x = width / 2 + (c - COLS / 2) * (width / COLS) * persp;
          const h =
            amp *
            (0.62 * Math.sin(c * 0.52 + r * 0.3 + ph) + 0.38 * Math.sin(c * 0.21 - r * 0.46 - ph * 0.75));
          cols.push({ x, y: baseY - h });
        }
        rows.push(cols);
      }
      vs.push(rows);
    }

    const out: Seg[] = [];
    const build = (r1: number, c1: number, r2: number, c2: number, axis: 'x' | 'y') => {
      const cx = (vs[0][r1][c1].x + vs[0][r2][c2].x) / 2; // X ไม่ขึ้นกับเฟส → คงที่
      const cy: number[] = [];
      const len: number[] = [];
      const ang: number[] = [];
      for (let k = 0; k < K; k++) {
        const a = vs[k][r1][c1];
        const b = vs[k][r2][c2];
        cy.push((a.y + b.y) / 2);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        len.push(Math.hypot(dx, dy));
        ang.push(Math.atan2(dy, dx));
      }
      const base = len.reduce((s, v) => s + v, 0) / K;
      if (base < 0.5) return;
      // ตัดท่อนที่อยู่นอกกรอบทิ้ง (แถวใกล้ล้นออกไปเยอะ) — ไม่ต้องเสีย animation ให้ของที่มองไม่เห็น
      const half = axis === 'x' ? base / 2 : 0.5;
      if (cx + half < -24 || cx - half > width + 24) return;
      // ไล่จาง — คิดจากตำแหน่ง Y จริงบนจอ ไม่ใช่ลำดับแถว (แถวไม่ได้เรียงห่างเท่ากันเพราะเปอร์สเปกทีฟ)
      const meanY = cy.reduce((s, v) => s + v, 0) / K;
      const yf = Math.max(0, Math.min(1, meanY / height));
      const op = Math.pow(fade === 'up' ? yf : 1 - yf, 1.3);
      if (op < 0.03) return;
      const wrap = <T,>(a: T[]): T[] => [...a, a[0]]; // ปิดลูปให้ต่อเนื่อง
      out.push({
        axis,
        opacity: op,
        left: axis === 'x' ? cx - base / 2 : cx - 0.5,
        top: axis === 'x' ? -0.5 : -base / 2,
        w: axis === 'x' ? base : 1,
        h: axis === 'x' ? 1 : base,
        ty: wrap(cy),
        rot: wrap(ang.map((a) => `${axis === 'x' ? a : a - Math.PI / 2}rad`)),
        scale: wrap(len.map((l) => l / base)),
      });
    };

    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) build(r, c, r, c + 1, 'x');
    for (let r = 0; r < ROWS - 1; r++) for (let c = 0; c <= COLS; c++) build(r, c, r + 1, c, 'y');
    return out;
  }, [width, height, fade]);

  const input = useMemo(() => Array.from({ length: K + 1 }, (_, i) => i / K), []);

  if (width <= 0 || height <= 0) return null;

  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'hidden', opacity }, style]}
    >
      {segs.map((s, i) => {
        const ty = reduceMotion ? s.ty[0] : phase.interpolate({ inputRange: input, outputRange: s.ty });
        const rot = reduceMotion ? s.rot[0] : phase.interpolate({ inputRange: input, outputRange: s.rot });
        const sc = reduceMotion ? s.scale[0] : phase.interpolate({ inputRange: input, outputRange: s.scale });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: s.left,
              top: s.top,
              width: s.w,
              height: s.h,
              backgroundColor: color,
              opacity: s.opacity,
              transform: [
                { translateY: ty },
                { rotate: rot },
                s.axis === 'x' ? { scaleX: sc } : { scaleY: sc },
              ] as never,
            }}
          />
        );
      })}
    </View>
  );
};
