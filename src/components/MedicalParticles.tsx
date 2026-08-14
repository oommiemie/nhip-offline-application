import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable } from 'react-native';

/**
 * สนามอนุภาคแบบ volumetric 3D (แนว particle-cloud ของ getlayers)
 * - จุด ~560 เม็ดมีพิกัด x,y,z จริง + ผงดาวพื้นหลัง ~46 เม็ด
 * - หมุนควบ 2 แกน (yaw ±37° + pitch ±13°) แบบ tumble — วงโคจรคำนวณล่วงหน้าเป็น
 *   keyframe ของ interpolate → ไม่มีการคิดเลขต่อเฟรม
 * - ความลึกกำหนด ขนาด/ความสว่าง/foreshortening + สี 5 ชั้นตามระยะ
 * - เปลี่ยนรูป: จุด "กระจายตัว" ออกทั่วบริเวณ แล้วบินกลับมาเรียงเป็นทรงใหม่ทีละเม็ด
 * - interactive: ลาก/hover เอียงมุมกล้อง · แตะสลับรูป · เคารพ reduceMotion
 */

export type ParticleShape = 'cross' | 'heart' | 'dna' | 'neuron' | 'stetho';

export const PARTICLE_SHAPES: Array<{ id: ParticleShape; label: string }> = [
  { id: 'cross', label: 'กากบาท' },
  { id: 'heart', label: 'หัวใจ' },
  { id: 'dna', label: 'เกลียว DNA' },
  { id: 'neuron', label: 'เซลล์ประสาท' },
  { id: 'stetho', label: 'หูฟังแพทย์' },
];

interface P3 {
  x: number;
  y: number;
  z: number;
}

const N = 800;
const DUST = 60;

const fit = (pts: P3[]): P3[] => {
  const out: P3[] = [];
  for (let i = 0; i < N; i++) out.push(pts[Math.floor((i * pts.length) / N) % pts.length]);
  return out;
};

const jit = (v: number, amt: number): number => v + (Math.random() - 0.5) * amt;

/** กากบาทการแพทย์แบบมีความหนา (slab 3 แกน) */
const cross3d = (s: number): P3[] => {
  const pts: P3[] = [];
  const arm = s * 0.72;
  const th = s * 0.23;
  const step = s * 0.034;
  for (let x = -arm; x <= arm; x += step) {
    for (let y = -arm; y <= arm; y += step) {
      if (Math.abs(x) <= th || Math.abs(y) <= th) {
        pts.push({ x: jit(x, step * 0.6), y: jit(y, step * 0.6), z: (Math.random() * 2 - 1) * th });
      }
    }
  }
  return fit(pts);
};

/** หัวใจพองแบบ 3D — จุดในสมการหัวใจ ดันความหนาตามความลึกเข้าเนื้อ */
const heart3d = (s: number): P3[] => {
  const pts: P3[] = [];
  const R = s * 0.78;
  const g = 0.046;
  for (let gx = -1.35; gx <= 1.35; gx += g) {
    for (let gy = -1.15; gy <= 1.45; gy += g) {
      const v = Math.pow(gx * gx + gy * gy - 1, 3) - gx * gx * Math.pow(gy, 3);
      if (v <= 0) {
        const puff = Math.min(1, Math.pow(-v, 0.32));
        pts.push({
          x: jit(gx * R, g * R * 0.5),
          y: jit(-gy * R + s * 0.08, g * R * 0.5),
          z: (Math.random() * 2 - 1) * s * 0.3 * puff,
        });
      }
    }
  }
  return fit(pts);
};

/** เกลียวคู่ DNA — 3D แท้ (z ตามเฟสเกลียว) */
const dna3d = (s: number): P3[] => {
  const pts: P3[] = [];
  const H = s * 2.5;
  const R = s * 0.55;
  const turns = 2;
  const per = 250;
  for (let i = 0; i < per; i++) {
    const t = i / (per - 1);
    const y = (t - 0.5) * H;
    const ph = t * turns * Math.PI * 2;
    pts.push({ x: jit(Math.sin(ph) * R, 3), y: jit(y, 2), z: jit(Math.cos(ph) * R, 3) });
    pts.push({ x: jit(-Math.sin(ph) * R, 3), y: jit(y, 2), z: jit(-Math.cos(ph) * R, 3) });
  }
  const rungs = 24;
  for (let j = 0; j < rungs; j++) {
    const t = j / (rungs - 1);
    const y = (t - 0.5) * H;
    const ph = t * turns * Math.PI * 2;
    for (let d = 1; d <= 12; d++) {
      const f = (d / 13) * 2 - 1;
      pts.push({ x: jit(Math.sin(ph) * R * f, 2), y: jit(y, 2), z: jit(Math.cos(ph) * R * f, 2) });
    }
  }
  return fit(pts);
};

/** เซลล์ประสาท 3D — โซมา + เดนไดรต์แตกกิ่ง + แอกซอนยาว + ปลายประสาท */
const neuron3d = (s: number): P3[] => {
  const pts: P3[] = [];
  const somaY = -s * 0.55;
  const somaR = s * 0.2;

  for (let i = 0; i < 300; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r = somaR * Math.cbrt(Math.random());
    pts.push({
      x: r * Math.sin(ph) * Math.cos(th),
      y: somaY + r * Math.cos(ph) * 0.85,
      z: r * Math.sin(ph) * Math.sin(th),
    });
  }

  for (let d = 0; d < 7; d++) {
    const az = (d / 7) * Math.PI * 2 + jit(0, 0.5);
    const up = 0.5 + Math.random() * 0.9;
    const len = Math.hypot(Math.cos(az), up, Math.sin(az));
    const dir = { x: Math.cos(az) / len, y: -up / len, z: Math.sin(az) / len };
    const L = s * (0.5 + Math.random() * 0.32);
    for (let k = 1; k <= 30; k++) {
      const t = k / 30;
      const wob = Math.sin(t * 4 + d) * s * 0.045;
      pts.push({
        x: jit(dir.x * L * t + wob, 2),
        y: jit(somaY + dir.y * L * t, 2),
        z: jit(dir.z * L * t - wob, 2),
      });
    }
    const bz = az + (d % 2 ? 0.7 : -0.7);
    const bdir = { x: Math.cos(bz) / len, y: -(up * 0.8) / len, z: Math.sin(bz) / len };
    for (let k = 1; k <= 14; k++) {
      const t = k / 14;
      pts.push({
        x: jit(dir.x * L * 0.55 + bdir.x * L * 0.45 * t, 2),
        y: jit(somaY + dir.y * L * 0.55 + bdir.y * L * 0.45 * t, 2),
        z: jit(dir.z * L * 0.55 + bdir.z * L * 0.45 * t, 2),
      });
    }
    pts.push({ x: jit(dir.x * L * 1.08, 4), y: jit(somaY + dir.y * L * 1.08, 4), z: jit(dir.z * L * 1.08, 4) });
    pts.push({ x: jit(dir.x * L * 1.16, 6), y: jit(somaY + dir.y * L * 1.16, 6), z: jit(dir.z * L * 1.16, 6) });
  }

  const axTop = somaY + somaR * 0.9;
  const axL = s * 1.5;
  let axEnd: P3 = { x: 0, y: axTop + axL, z: 0 };
  for (let k = 0; k <= 100; k++) {
    const t = k / 100;
    const p = {
      x: Math.sin(t * 2.6) * s * 0.1,
      y: axTop + t * axL,
      z: Math.cos(t * 2.2) * s * 0.09 - s * 0.09,
    };
    pts.push({ x: jit(p.x, 1.5), y: jit(p.y, 1.5), z: jit(p.z, 1.5) });
    if (k % 3 === 0) pts.push({ x: jit(p.x, 5), y: jit(p.y, 3), z: jit(p.z, 5) });
    if (k === 70) axEnd = p;
  }

  for (let b = 0; b < 5; b++) {
    const az = (b / 5) * Math.PI * 2;
    const dir = { x: Math.cos(az) * 0.8, y: 0.7 + Math.random() * 0.4, z: Math.sin(az) * 0.8 };
    for (let k = 1; k <= 12; k++) {
      const t = k / 12;
      pts.push({
        x: jit(axEnd.x + dir.x * s * 0.28 * t, 2),
        y: jit(axEnd.y + dir.y * s * 0.24 * t, 2),
        z: jit(axEnd.z + dir.z * s * 0.28 * t, 2),
      });
    }
  }

  const a = -0.12;
  return fit(pts.map((p) => ({ x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a), z: p.z })));
};

/** เส้นโค้ง Catmull-Rom ผ่าน waypoints (พิกัดหน่วย unit) */
const spline = (ws: Array<[number, number]>, samples: number): Array<[number, number]> => {
  const out: Array<[number, number]> = [];
  const cr = (a: number, b: number, c: number, d: number, u: number) =>
    0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  for (let i = 0; i < samples; i++) {
    const t = (i / (samples - 1)) * (ws.length - 1);
    const seg = Math.min(ws.length - 2, Math.floor(t));
    const u = t - seg;
    const p0 = ws[Math.max(0, seg - 1)];
    const p1 = ws[seg];
    const p2 = ws[seg + 1];
    const p3 = ws[Math.min(ws.length - 1, seg + 2)];
    out.push([cr(p0[0], p1[0], p2[0], p3[0], u), cr(p0[1], p1[1], p2[1], p3[1], u)]);
  }
  return out;
};

/** หูฟังแพทย์ 3D — จุกหู 2 ข้าง + ท่อโค้งรวมที่จุด Y + ท่อหลักเป็นลูป + หัวฟังจานกลมหนา */
const stetho3d = (s: number): P3[] => {
  const pts: P3[] = [];

  // ท่อหูสองข้าง: จุกหูบนสุดโค้งลงมารวมกัน
  for (const side of [-1, 1] as const) {
    const tube = spline(
      [
        [side * 0.3, -0.98],
        [side * 0.42, -0.72],
        [side * 0.3, -0.45],
        [side * 0.08, -0.28],
        [0, -0.22],
      ],
      90
    );
    tube.forEach(([x, y], idx) => {
      const t = idx / (tube.length - 1);
      const z = side * s * 0.05 * (1 - t) + Math.sin(t * 3) * s * 0.02;
      pts.push({ x: jit(x * s, 2.5), y: jit(y * s, 2.5), z });
      if (idx % 3 === 0) pts.push({ x: jit(x * s, 6.5), y: jit(y * s, 6.5), z });
    });
    // จุกหู (olive) — ก้อนเล็กหนาแน่น
    for (let i = 0; i < 22; i++) {
      pts.push({ x: jit(side * 0.3 * s, s * 0.05), y: jit(-1.0 * s, s * 0.05), z: jit(side * s * 0.05, s * 0.04) });
    }
  }

  // ท่อหลัก: ทิ้งตัวลงล่าง วนเป็นลูป แล้วเชิดขึ้นหาหัวฟัง
  const main = spline(
    [
      [0, -0.22],
      [0.03, 0.1],
      [0.22, 0.45],
      [0.3, 0.8],
      [0.05, 1.02],
      [-0.28, 0.95],
      [-0.4, 0.68],
    ],
    200
  );
  main.forEach(([x, y], idx) => {
    const t = idx / (main.length - 1);
    const z = Math.sin(t * 4) * s * 0.07;
    pts.push({ x: jit(x * s, 2.5), y: jit(y * s, 2.5), z });
    if (idx % 3 === 0) pts.push({ x: jit(x * s, 7), y: jit(y * s, 7), z });
  });

  // หัวฟัง (chest piece) — วงแหวน 2 ชั้น + จานเต็มมีความหนา
  const ccx = -0.44 * s;
  const ccy = 0.6 * s;
  const crad = s * 0.17;
  for (let ring = 0; ring < 2; ring++) {
    const rr = crad * (1 - ring * 0.18);
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2;
      pts.push({
        x: jit(ccx + Math.cos(a) * rr, 1.5),
        y: jit(ccy + Math.sin(a) * rr, 1.5),
        z: jit((ring ? 1 : -1) * s * 0.03, s * 0.02),
      });
    }
  }
  for (let i = 0; i < 110; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = crad * 0.85 * Math.sqrt(Math.random());
    pts.push({ x: jit(ccx + Math.cos(a) * r, 1), y: jit(ccy + Math.sin(a) * r, 1), z: jit(0, s * 0.05) });
  }

  return fit(pts);
};

const GENERATORS: Record<ParticleShape, (s: number) => P3[]> = {
  cross: cross3d,
  heart: heart3d,
  dna: dna3d,
  neuron: neuron3d,
  stetho: stetho3d,
};

/** สี 5 ชั้น: ขาวร้อน → มินต์ → เขียวหมอก (สุ่มถ่วงน้ำหนัก) */
const pickColor = (): string => {
  const r = Math.random();
  if (r < 0.3) return '#FFFFFF';
  if (r < 0.55) return '#EFFDF3';
  if (r < 0.78) return '#CFF0DA';
  if (r < 0.92) return '#A8E3BF';
  return '#7FCC9F';
};

/** ขนาด 4 ระดับ: ผงละเอียด/เม็ดหลัก/เม็ดเด่น/ดวงไฮไลต์เรืองแสง */
const pickTier = (): { size: number; glow: 0 | 1 | 2 } => {
  const r = Math.random();
  if (r < 0.55) return { size: 3, glow: 0 };
  if (r < 0.85) return { size: 5, glow: 0 };
  if (r < 0.95) return { size: 7, glow: 1 };
  return { size: 10 + Math.random() * 2, glow: 2 };
};

/** จำนวน keyframe ของวงโคจร 1 รอบ */
const K = 28;
const SPIN_INPUT = Array.from({ length: K + 1 }, (_, k) => k / K);

export interface MedicalParticlesProps {
  width: number;
  height: number;
  shape: ParticleShape;
  onTap?: () => void;
  reduceMotion?: boolean;
}

export const MedicalParticles: React.FC<MedicalParticlesProps> = ({
  width,
  height,
  shape,
  onTap,
  reduceMotion = false,
}) => {
  const nativeDriver = Platform.OS !== 'web';
  const s = Math.min(width, height) * 0.38;
  const cx = width / 2;
  const cy = height * 0.55;
  const maxR = s * 1.2;

  const spin = useRef(new Animated.Value(0)).current;
  /** 0 = กระจายตัวเต็มที่ · 1 = เรียงเข้าทรงสมบูรณ์ */
  const assemble = useRef(new Animated.Value(0)).current;
  const tw1 = useRef(new Animated.Value(0)).current;
  const tw2 = useRef(new Animated.Value(0)).current;
  const floatV = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const [renderShape, setRenderShape] = useState<ParticleShape>(shape);

  // คุณสมบัติคงที่ต่อเม็ด — รวมทิศทาง/ระยะการกระจายตัวเฉพาะเม็ด
  const traits = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const ang = Math.random() * Math.PI * 2;
        const mag = 0.7 + Math.random() * 1.1;
        return {
          color: pickColor(),
          ...pickTier(),
          par: (Math.random() - 0.15) * 26,
          dim: 0.45 + Math.random() * 0.45,
          twSel: i % 2,
          floatAmp: 2 + Math.random() * 4,
          floatPhase: Math.random(),
          scatDX: Math.cos(ang) * mag,
          scatDY: Math.sin(ang) * mag * 0.85,
        };
      }),
    []
  );

  // ผงดาวพื้นหลัง — ตำแหน่งคงที่ ระยิบเบา ๆ
  const dust = useMemo(
    () =>
      Array.from({ length: DUST }, (_, i) => ({
        left: Math.random() * width,
        top: Math.random() * height,
        size: 2 + Math.random() * 1.6,
        base: 0.1 + Math.random() * 0.22,
        twSel: i % 2,
      })),
    [width, height]
  );

  // วงโคจร tumble 2 แกนของรูปปัจจุบัน + ระยะกระจายตัว (หด → 0 เมื่อ assemble → 1)
  const particles = useMemo(() => {
    const pts = GENERATORS[renderShape](s);
    return pts.map((p, i) => {
      const tr = traits[i];
      const xs: number[] = [];
      const ys: number[] = [];
      const sc: number[] = [];
      const op: number[] = [];
      for (let k = 0; k <= K; k++) {
        const ph = (k / K) * Math.PI * 2;
        const a = Math.sin(ph) * 0.65; // yaw ±37°
        const b = Math.sin(ph + Math.PI / 2) * 0.22; // pitch ±13° (เหลื่อมเฟส → tumble)
        const x1 = p.x * Math.cos(a) + p.z * Math.sin(a);
        const z1 = -p.x * Math.sin(a) + p.z * Math.cos(a);
        const y1 = p.y * Math.cos(b) - z1 * Math.sin(b);
        const z2 = p.y * Math.sin(b) + z1 * Math.cos(b);
        const depth = (z2 / maxR + 1) / 2; // 0 ไกล → 1 ใกล้
        const persp = 0.86 + depth * 0.3; // foreshortening
        xs.push(x1 * persp);
        ys.push(y1 * persp);
        sc.push(0.35 + depth * (tr.glow === 2 ? 1.5 : 1.15));
        op.push(0.2 + depth * 0.75);
      }
      return {
        orbX: spin.interpolate({ inputRange: SPIN_INPUT, outputRange: xs }),
        orbY: spin.interpolate({ inputRange: SPIN_INPUT, outputRange: ys }),
        // ระยะกระจายเฉพาะเม็ด: assemble 0 → เต็มระยะ · assemble 1 → 0 (เข้าที่)
        scatX: assemble.interpolate({ inputRange: [0, 1], outputRange: [tr.scatDX * s, 0] }),
        scatY: assemble.interpolate({ inputRange: [0, 1], outputRange: [tr.scatDY * s, 0] }),
        depthScale: spin.interpolate({ inputRange: SPIN_INPUT, outputRange: sc }),
        depthOpacity: spin.interpolate({ inputRange: SPIN_INPUT, outputRange: op }),
        twinkle: (tr.twSel ? tw1 : tw2).interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, tr.dim, 1] }),
        float: floatV.interpolate({
          inputRange: [0, 1],
          outputRange: [-tr.floatAmp * tr.floatPhase, tr.floatAmp * (1 - tr.floatPhase)],
        }),
        ...tr,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderShape, s]);

  // ลูปบรรยากาศ: tumble + twinkle + ลอยตัวจุลภาค
  useEffect(() => {
    if (reduceMotion) return;
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: nativeDriver })
    );
    const pulse = (v: Animated.Value, ms: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: nativeDriver }),
          Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: nativeDriver }),
        ])
      );
    const anims = [spinLoop, pulse(tw1, 2600), pulse(tw2, 3800), pulse(floatV, 5200)];
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [spin, tw1, tw2, floatV, nativeDriver, reduceMotion]);

  // prop shape เปลี่ยน → จุดกระจายตัวออกก่อน แล้วค่อยสลับทรง
  useEffect(() => {
    if (shape === renderShape) return;
    if (reduceMotion) {
      setRenderShape(shape);
      return;
    }
    Animated.timing(assemble, { toValue: 0, duration: 460, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }).start(
      () => setRenderShape(shape)
    );
  }, [shape, renderShape, assemble, nativeDriver, reduceMotion]);

  // ทรงใหม่พร้อม (รวม mount แรก) → จุดบินกลับเข้าเรียงเป็นทรง (มี overshoot เล็กน้อย)
  useEffect(() => {
    if (reduceMotion) {
      assemble.setValue(1);
      return;
    }
    Animated.timing(assemble, { toValue: 1, duration: 1000, easing: Easing.out(Easing.back(1.08)), useNativeDriver: nativeDriver }).start();
  }, [renderShape, assemble, nativeDriver, reduceMotion]);

  const setTilt = (lx: number, ly: number) => {
    tilt.setValue({
      x: Math.max(-1, Math.min(1, (lx / width) * 2 - 1)),
      y: Math.max(-1, Math.min(1, (ly / height) * 2 - 1)),
    });
  };
  const resetTilt = () =>
    Animated.timing(tilt, { toValue: { x: 0, y: 0 }, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: nativeDriver }).start();

  const rotateY = tilt.x.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] });
  const rotateX = tilt.y.interpolate({ inputRange: [-1, 1], outputRange: ['10deg', '-10deg'] });
  /** ตอนกระจายตัวจางลงเล็กน้อย ให้ตอนรวมทรงดู "ติดไฟ" ขึ้น */
  const cloudOpacity = assemble.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <Pressable
      style={{ position: 'absolute', top: 0, left: 0, width, height }}
      onPress={onTap}
      onTouchMove={(e) => setTilt(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      onTouchEnd={resetTilt}
      onPointerMove={(e) => {
        const ne = e.nativeEvent as unknown as { locationX?: number; locationY?: number; offsetX?: number; offsetY?: number };
        setTilt(ne.locationX ?? ne.offsetX ?? 0, ne.locationY ?? ne.offsetY ?? 0);
      }}
      onPointerLeave={resetTilt}
    >
      {/* ผงดาวพื้นหลัง */}
      {dust.map((d, i) => (
        <Animated.View
          key={`dust-${i}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            borderRadius: d.size / 2,
            backgroundColor: '#E7F8EC',
            opacity: (d.twSel ? tw1 : tw2).interpolate({ inputRange: [0, 0.5, 1], outputRange: [d.base, d.base * 0.35, d.base] }),
          }}
        />
      ))}

      {/* ชั้นกล้อง: เอียงตามผู้ใช้ → เม็ดอนุภาค (กระจาย/รวมทรงด้วย offset ต่อเม็ด) */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          opacity: cloudOpacity,
          transform: [{ perspective: 900 }, { rotateX }, { rotateY }],
        }}
      >
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: -p.size / 2,
              top: -p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.color,
              opacity: Animated.multiply(p.depthOpacity, p.twinkle),
              ...(p.glow > 0
                ? {
                    shadowColor: '#CFF3DA',
                    shadowOpacity: 1,
                    shadowRadius: p.glow === 2 ? 13 : 6,
                    shadowOffset: { width: 0, height: 0 },
                  }
                : null),
              transform: [
                { translateX: Animated.add(p.orbX, Animated.add(p.scatX, Animated.multiply(tilt.x, p.par))) },
                { translateY: Animated.add(p.orbY, Animated.add(p.scatY, Animated.add(p.float, Animated.multiply(tilt.y, p.par * 0.6)))) },
                { scale: p.depthScale },
              ],
            }}
          />
        ))}
      </Animated.View>
    </Pressable>
  );
};
