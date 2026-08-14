import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText, MedicalParticles, PARTICLE_SHAPES } from '../components';
import type { ParticleShape } from '../components';
import { FigmaAssets } from '../assets';
import { useTheme, withAlpha } from '../theme';

/**
 * แผงแบรนด์ฝั่งซ้ายของหน้า Login / SSO (Figma node 15:6 "Hero-Panel-Left")
 * โครงตาม Figma: padding 64 · แถวแนวนอน [ตรากระทรวง 130] gap 16 [NHIP 48/800 + tagline 20/500]
 * พื้นที่ว่างมี MedicalParticles — จุดเรียงเป็นรูปทางการแพทย์ 3 แบบ สลับได้/ลากเอียงได้
 */
export const BrandPanel: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const pad = compact ? 20 : width >= 1200 ? 64 : 36;
  const logo = compact ? 52 : 124;

  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  // รูปเริ่มต้นเปลี่ยนได้ด้วย hash (เว็บ): /#cross /#heart /#dna /#neuron — โหมด QA จะปักหมุดรูปนั้น (ไม่ auto-cycle)
  const pinned = useRef(false);
  const [shape, setShape] = useState<ParticleShape>(() => {
    const h = (globalThis as { location?: { hash?: string } }).location?.hash ?? '';
    const id = h.slice(1) as ParticleShape;
    if (PARTICLE_SHAPES.some((x) => x.id === id)) {
      pinned.current = true;
      return id;
    }
    return 'cross';
  });

  const nd = Platform.OS !== 'web';
  const e1 = useRef(new Animated.Value(0)).current;
  const e2 = useRef(new Animated.Value(0)).current;
  const e3 = useRef(new Animated.Value(0)).current;

  // entrance: โลโก้ → ชื่อระบบ → แถบล่าง ไล่กันเข้ามา
  useEffect(() => {
    if (t.reduceMotion) {
      e1.setValue(1);
      e2.setValue(1);
      e3.setValue(1);
      return;
    }
    Animated.stagger(150, [
      Animated.timing(e1, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: nd }),
      Animated.timing(e2, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: nd }),
      Animated.timing(e3, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: nd }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.reduceMotion]);

  const rise = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  });

  // สลับรูปอัตโนมัติ (หยุดเมื่อผู้ใช้ลดการเคลื่อนไหว หรือเปิดแบบปักหมุดรูปผ่าน hash)
  useEffect(() => {
    if (compact || t.reduceMotion || pinned.current) return;
    const id = setInterval(() => {
      setShape((cur) => {
        const i = PARTICLE_SHAPES.findIndex((x) => x.id === cur);
        return PARTICLE_SHAPES[(i + 1) % PARTICLE_SHAPES.length].id;
      });
    }, 8000);
    return () => clearInterval(id);
  }, [compact, t.reduceMotion]);

  const nextShape = () =>
    setShape((cur) => {
      const i = PARTICLE_SHAPES.findIndex((x) => x.id === cur);
      return PARTICLE_SHAPES[(i + 1) % PARTICLE_SHAPES.length].id;
    });

  if (compact) {
    return (
      <View style={{ padding: pad }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Image source={FigmaAssets.logoMoph} style={{ width: logo, height: logo, borderRadius: logo / 2 }} resizeMode="contain" />
          <View style={{ gap: 2, flex: 1, justifyContent: 'center' }}>
            <AppText size={26} weight="700" color="#FFFFFF" style={{ letterSpacing: 1, lineHeight: 32 }}>
              NHIP
            </AppText>
            <AppText size="sm" color={withAlpha('#FFFFFF', 0.92)}>
              ระบบสารสนเทศสำหรับ{'\n'}โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.)
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {/* สนามอนุภาค — อยู่หลังเนื้อหา รับ gesture จากพื้นที่ว่าง */}
      {size ? (
        <MedicalParticles width={size.w} height={size.h} shape={shape} onTap={nextShape} reduceMotion={t.reduceMotion} />
      ) : null}

      {/* เนื้อหาแบรนด์ (box-none ให้ gesture ทะลุลงสนามอนุภาคตรงพื้นที่ว่าง) */}
      <View pointerEvents="box-none" style={{ flex: 1, padding: pad, justifyContent: 'space-between' }}>
        <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
          <Animated.View
            style={{
              opacity: e1,
              transform: [{ scale: e1.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }],
            }}
          >
            <Image source={FigmaAssets.logoMoph} style={{ width: logo, height: logo, borderRadius: logo / 2 }} resizeMode="contain" />
          </Animated.View>
          <Animated.View style={[{ gap: 14, flex: 1, justifyContent: 'center' }, rise(e2)]}>
            <AppText size={48} weight="700" color="#FFFFFF" style={{ letterSpacing: 1, lineHeight: 58 }}>
              NHIP
            </AppText>
            <AppText size={20} weight="500" color={withAlpha('#FFFFFF', 0.92)} style={{ lineHeight: 30 }}>
              ระบบสารสนเทศสำหรับ{'\n'}โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.)
            </AppText>
          </Animated.View>
        </View>

        <Animated.View style={rise(e3)}>
          <AppText size={12} color="#B7E4C7">
            v2.0.1 (Stable)
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
};

/**
 * ทรานซิชันเข้าหน้าของการ์ดฝั่งขวา (Login ↔ SSO ↔ Setup)
 * สไลด์ + จาง + ขยายเล็กน้อยตอน mount · from = ทิศที่การ์ดสไลด์เข้ามา
 */
export const AuthCardIn: React.FC<{ children: React.ReactNode; from?: 'left' | 'right' }> = ({
  children,
  from = 'right',
}) => {
  const t = useTheme();
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (t.reduceMotion) {
      v.setValue(1);
      return;
    }
    Animated.timing(v, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: v,
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [from === 'right' ? 56 : -56, 0] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
};

/** โครงหน้า split: แบรนด์เขียวซ้าย + การ์ดขาวขวา 632px margin 8 (ย่อเป็นแนวตั้งบนจอแคบ) */
export const SplitAuthLayout: React.FC<{ children: React.ReactNode; panelMaxWidth?: number }> = ({
  children,
  panelMaxWidth = 648,
}) => {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const glow = useRef(new Animated.Value(0)).current;

  // แสงหายใจคลุม "ทั้งพื้นหลัง" (ไม่ใช่เฉพาะแผงซ้าย — กันเกิดรอยต่อแนวตั้ง)
  useEffect(() => {
    if (t.reduceMotion) return;
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 4600, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(glow, { toValue: 0, duration: 4600, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.reduceMotion]);

  return (
    <LinearGradient colors={['#2D6A4F', '#40916C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.85] }),
        }}
      >
        <LinearGradient
          colors={[withAlpha('#D8F3DC', 0.16), 'transparent', withAlpha('#0B2D22', 0.18)]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      {wide ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <BrandPanel />
          <View style={{ width: Math.min(panelMaxWidth, width * 0.52), padding: 8 }}>{children}</View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <BrandPanel compact />
          <View style={{ flex: 1, padding: 8 }}>{children}</View>
        </View>
      )}
    </LinearGradient>
  );
};
