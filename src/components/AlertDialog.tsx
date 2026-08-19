import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, withAlpha } from '../theme';
import type { Tone } from '../theme';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { Button } from './Button';

const USE_NATIVE = Platform.OS !== 'web';

/**
 * ชนิดของกล่องแจ้งสถานะ (ข้อกำหนด 4.8)
 * add = เพิ่ม · edit = แก้ไข · delete = ลบ · error = ผิดพลาด · issue = พบปัญหา · warning = เตือน
 */
export type AlertKind = 'add' | 'edit' | 'delete' | 'error' | 'issue' | 'warning';

interface KindSpec {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone: Tone;
  title: string;
  confirm: string;
  /** ปุ่มยืนยันเป็นสีแดง (การกระทำที่ย้อนกลับไม่ได้ / แจ้งความล้มเหลว) */
  danger?: boolean;
  /** เวลานับถอยหลังก่อนปิดเอง (ms) · null = ต้องกดปุ่มเอง */
  auto: number | null;
}

export const ALERT_KINDS: Record<AlertKind, KindSpec> = {
  add: { icon: 'check', tone: 'success', title: 'เพิ่มข้อมูลสำเร็จ', confirm: 'ตกลง', auto: 3500 },
  edit: { icon: 'pencil', tone: 'info', title: 'แก้ไขข้อมูลสำเร็จ', confirm: 'ตกลง', auto: 3500 },
  delete: { icon: 'trash-can-outline', tone: 'destructive', title: 'ยืนยันการลบข้อมูล', confirm: 'ลบ', danger: true, auto: null },
  error: { icon: 'close', tone: 'destructive', title: 'ทำรายการไม่สำเร็จ', confirm: 'ปิด', danger: true, auto: 6000 },
  issue: { icon: 'exclamation', tone: 'warning', title: 'พบปัญหาที่ต้องแก้ไข', confirm: 'ดูรายการ', auto: 6000 },
  warning: { icon: 'alert-outline', tone: 'warning', title: 'โปรดตรวจสอบก่อนทำรายการ', confirm: 'เข้าใจแล้ว', auto: 5000 },
};

/**
 * วงแหวนนับถอยหลังรอบไอคอน — ไม่ใช้ svg (โปรเจกต์ไม่มี react-native-svg)
 * เทคนิค: วงกลมที่ระบายสีขอบบน+ขวา = ส่วนโค้ง 180° แล้วครอปทีละครึ่งซ้าย/ขวา
 * หมุนครึ่งขวาเดินหน้าจนครบ 180° ค่อยปล่อยครึ่งซ้ายเดินต่อ → กวาดครบ 360°
 * ขยับด้วย rotate/opacity ล้วน ๆ จึงวิ่งบน native driver ได้
 */
const CountdownRing: React.FC<{
  size: number;
  stroke: number;
  color: string;
  track: string;
  durationMs: number;
  /** false = ไม่นับถอยหลัง วาดแค่วงรอบจาง ๆ เป็นเส้นตกแต่ง */
  active: boolean;
  reduceMotion: boolean;
  onDone: () => void;
  children: React.ReactNode;
}> = ({ size, stroke, color, track, durationMs, active, reduceMotion, onDone, children }) => {
  const p = useRef(new Animated.Value(1)).current;
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      const id = setTimeout(() => done.current(), durationMs);
      return () => clearTimeout(id);
    }
    p.setValue(1);
    const anim = Animated.timing(p, {
      toValue: 0,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: USE_NATIVE,
    });
    anim.start(({ finished }) => {
      if (finished) done.current();
    });
    return () => anim.stop();
  }, [active, durationMs, p, reduceMotion]);

  const arc = {
    position: 'absolute' as const,
    top: 0,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: stroke,
    borderColor: 'transparent',
    borderTopColor: color,
    borderRightColor: color,
  };
  // ครึ่งขวา: กวาด 0→180° (มุมหมุน = องศาที่กวาดแล้ว − 135)
  const rotRight = p.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-135deg', '45deg', '45deg'] });
  // ครึ่งซ้าย: เริ่มทำงานหลังผ่านครึ่งวง จึงซ่อนไว้ก่อนด้วย opacity
  const rotLeft = p.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-135deg', '-135deg', '225deg'] });
  const opLeft = p.interpolate({ inputRange: [0, 0.499, 0.5, 1], outputRange: [0, 0, 1, 1] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: track,
        }}
      />
      {active ? (
        <>
          <View style={{ position: 'absolute', left: 0, top: 0, width: size / 2, height: size, overflow: 'hidden' }}>
            <Animated.View
              style={[
                arc,
                { left: 0, opacity: reduceMotion ? 1 : opLeft, transform: [{ rotate: reduceMotion ? '225deg' : rotLeft }] as never },
              ]}
            />
          </View>
          <View style={{ position: 'absolute', left: size / 2, top: 0, width: size / 2, height: size, overflow: 'hidden' }}>
            <Animated.View style={[arc, { left: -size / 2, transform: [{ rotate: reduceMotion ? '45deg' : rotRight }] as never }]} />
          </View>
        </>
      ) : null}
      {children}
    </View>
  );
};

export interface AlertDialogProps {
  visible: boolean;
  kind: AlertKind;
  /** ไม่ส่ง = ใช้หัวข้อมาตรฐานของชนิดนั้น */
  title?: string;
  message?: string;
  /** บรรทัดข้อมูลอ้างอิง เช่น HN / รหัสข้อผิดพลาด */
  detail?: string;
  confirmLabel?: string;
  /** ใส่ = กล่องยืนยัน 2 ปุ่ม (ไม่ปิดเอง) · ไม่ใส่ = กล่องแจ้งผลปุ่มเดียว */
  cancelLabel?: string;
  /** override เวลานับถอยหลัง — null = ไม่ปิดเอง */
  autoCloseMs?: number | null;
  onConfirm?: () => void;
  onClose: () => void;
}

/**
 * กล่องแจ้งสถานะกลางจอ (ข้อกำหนด 4.8) — ดีไซน์มินิมอล
 * ไอคอนเล็กกลางวงแหวนนับถอยหลัง · หัวข้อ · คำอธิบาย · ปุ่มเดียวเต็มความกว้าง
 * กล่องแจ้งผลปิดตัวเองเมื่อวงแหวนเดินครบ ไม่ต้องกดตกลง (กล่องยืนยันจะไม่ปิดเอง)
 */
export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  kind,
  title,
  message,
  detail,
  confirmLabel,
  cancelLabel,
  autoCloseMs,
  onConfirm,
  onClose,
}) => {
  const t = useTheme();
  const c = t.colors;
  const spec = ALERT_KINDS[kind];
  const tone = t.tones[spec.tone];
  const isConfirm = !!cancelLabel;
  // กล่องที่ต้องตัดสินใจ (มีปุ่มยกเลิก) ไม่ปิดเองเด็ดขาด
  const countdown = isConfirm ? null : autoCloseMs !== undefined ? autoCloseMs : spec.auto;

  /* เข้าฉาก: ไอคอนสปริงเด้งขึ้นก่อน แล้วข้อความ/ปุ่มค่อยลอยตามทีหลังนิดหนึ่ง */
  const pop = useRef(new Animated.Value(t.reduceMotion ? 1 : 0)).current;
  const rise = useRef(new Animated.Value(t.reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    if (t.reduceMotion) return;
    const anim = Animated.parallel([
      Animated.spring(pop, { toValue: 1, friction: 6, tension: 90, useNativeDriver: USE_NATIVE }),
      Animated.timing(rise, {
        toValue: 1,
        duration: 260,
        delay: 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [pop, rise, t.reduceMotion]);

  const riseStyle = {
    opacity: rise,
    transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] as never,
  };

  return (
    <AppModal visible={visible} onClose={onClose} maxWidth={380}>
      <View style={{ alignItems: 'center', gap: 20, paddingTop: 30, paddingBottom: 24, paddingHorizontal: 6 }}>
        {/* ไอคอน: ฮาโลจาง → วงแหวนนับถอยหลัง → วงกลมไล่สี → ไอคอน */}
        <Animated.View
          style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            backgroundColor: withAlpha(tone.fg, 0.05),
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }] as never,
            opacity: pop,
          }}
        >
          <CountdownRing
            size={78}
            stroke={2}
            color={tone.fg}
            track={withAlpha(tone.fg, 0.13)}
            durationMs={countdown ?? 0}
            active={countdown !== null}
            reduceMotion={t.reduceMotion}
            onDone={onClose}
          >
            <LinearGradient
              colors={[tone.bg, withAlpha(tone.fg, 0.06)]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialCommunityIcons name={spec.icon} size={28} color={tone.fg} />
            </LinearGradient>
          </CountdownRing>
        </Animated.View>

        <Animated.View style={[{ gap: 7, alignItems: 'center', alignSelf: 'stretch' }, riseStyle]}>
          <AppText size="xl" weight="700" center style={{ letterSpacing: -0.2, lineHeight: t.fs.xl * 1.3 }}>
            {title ?? spec.title}
          </AppText>
          {message ? (
            <AppText size="base" muted center style={{ lineHeight: 22, maxWidth: 292 }}>
              {message}
            </AppText>
          ) : null}
          {detail ? (
            <View
              style={{
                marginTop: 4,
                paddingHorizontal: 11,
                paddingVertical: 5,
                borderRadius: t.radius.pill,
                backgroundColor: withAlpha(tone.fg, 0.07),
                maxWidth: '100%',
              }}
            >
              <AppText size="xs" weight="600" mono center color={tone.fg} numberOfLines={2}>
                {detail}
              </AppText>
            </View>
          ) : null}
        </Animated.View>

        {/* กล่องแจ้งผล = ปุ่มเดียวขนาดพอดีตัวกลางกล่อง · กล่องยืนยัน = สองปุ่มแบ่งครึ่ง */}
        <Animated.View
          style={[{ flexDirection: 'row', gap: 10 }, isConfirm ? { alignSelf: 'stretch' } : null, riseStyle]}
        >
          {cancelLabel ? (
            <Button label={cancelLabel} variant="outline" onPress={onClose} style={{ flex: 1 }} />
          ) : null}
          <Button
            label={confirmLabel ?? spec.confirm}
            variant={spec.danger && isConfirm ? 'destructive' : isConfirm ? 'primary' : 'subtle'}
            onPress={() => {
              onConfirm?.();
              onClose();
            }}
            style={isConfirm ? { flex: 1 } : { minWidth: 132 }}
          />
        </Animated.View>
      </View>
    </AppModal>
  );
};
