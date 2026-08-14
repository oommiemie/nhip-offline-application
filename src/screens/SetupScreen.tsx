import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { FigmaAssets } from '../assets';
import {
  AppText,
  Badge,
  Button,
  LogConsole,
  OptionTile,
  ProgressBar,
  StatusDot,
  StepperChips,
  TextField,
  Tooltip,
} from '../components';
import type { StepChipItem } from '../components';
import { FACILITIES } from '../state/mockData';
import { useApp } from '../state/AppContext';
import { useTheme, withAlpha } from '../theme';
import { AuthCardIn } from './BrandPanel';
import { fmtInt } from '../utils/format';

const stepsFor = (stage: 'sso' | 'pick' | 'import'): StepChipItem[] => [
  { label: 'เข้าสู่ระบบ SSO', state: stage === 'sso' ? 'active' : 'done' },
  { label: 'เลือกหน่วยงาน', state: stage === 'sso' ? 'pending' : stage === 'pick' ? 'active' : 'done' },
  { label: 'ดาวน์โหลด / นำเข้า', state: stage === 'import' ? 'active' : 'pending' },
];

/**
 * การ์ดยืนยันตัวตน MOPH SSO (Figma node 16:142) — เนื้อหาฝั่งขวาเท่านั้น
 * แผงแบรนด์ซ้ายถูกถือโดย AuthFlow (คงอยู่ข้ามหน้า ไม่ reload)
 */
export const SsoCard: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const { width } = useWindowDimensions();
  const cardPad = width >= 1100 ? 64 : 24;
  const [user, setUser] = useState('somsri.j@moph.go.th');
  const [pass, setPass] = useState('123456789');
  const busy = state.sso === 'busy';

  // กรอกไม่ครบ = กดยืนยันตัวตนไม่ได้ (เหมือนหน้าเข้าสู่ระบบ)
  const [touched, setTouched] = useState<{ user?: boolean; pass?: boolean }>({});
  const userError = touched.user && !user.trim() ? 'กรุณากรอกชื่อผู้ใช้ MOPH' : undefined;
  const passError = touched.pass && !pass.trim() ? 'กรุณากรอกรหัสผ่าน' : undefined;
  const ssoReady = !!user.trim() && !!pass.trim();

  return (
    <AuthCardIn from="right">
      {/* ไม่ใส่เงา — เงาใหญ่บนพื้น gradient จะเห็นเป็นแถบเขียวเข้มซ้อนรอบการ์ด */}
      <View style={{ flex: 1, borderRadius: t.radius.xl, backgroundColor: c.card, overflow: 'hidden' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: cardPad, paddingTop: Math.min(cardPad, 40) }}>
          <View style={{ alignItems: 'center' }}>
            <StepperChips steps={stepsFor('sso')} />
          </View>

          <View style={{ flex: 1, justifyContent: 'center', maxWidth: 472, width: '100%', alignSelf: 'center', gap: 32, paddingVertical: 30 }}>
            <View style={{ gap: 12 }}>
              <AppText size="hero" weight="700" style={{ lineHeight: t.fs.hero * 1.25 }}>
                ยืนยันตัวตนด้วย MOPH SSO
              </AppText>
              <AppText size="md" muted mono>
                sso-uat.moph.go.th
              </AppText>
            </View>
            <View style={{ gap: 20 }}>
              <TextField
                label="ชื่อผู้ใช้ MOPH"
                icon="person-circle-outline"
                value={user}
                onChangeText={setUser}
                onBlur={() => setTouched((s) => ({ ...s, user: true }))}
                errorText={userError}
                placeholder="กรอกชื่อผู้ใช้งาน"
                autoCapitalize="none"
                mono
              />
              <TextField
                label="รหัสผ่าน"
                icon="lock-closed-outline"
                value={pass}
                onChangeText={setPass}
                onBlur={() => setTouched((s) => ({ ...s, pass: true }))}
                errorText={passError}
                placeholder="กรอกรหัสผ่าน"
                secureTextEntry
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <StatusDot color={busy ? c.warning : c.info} size={8} />
                <AppText size="sm" muted style={{ flex: 1 }}>
                  {busy
                    ? 'กำลังเชื่อมต่อ sso-uat.moph.go.th …'
                    : 'เชื่อมต่อผ่าน OAuth 2.0 · ระบบไม่เก็บรหัสผ่านไว้บนเครื่อง'}
                </AppText>
              </View>
            </View>
            <Button
              label={busy ? 'กำลังยืนยันตัวตน…' : 'เข้าสู่ระบบ MOPH SSO'}
              variant="strong"
              rounded="md"
              size="lg"
              full
              loading={busy}
              disabled={!ssoReady}
              onPress={actions.ssoLogin}
            />
          </View>

          <Pressable onPress={actions.backToLogin} style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6 }}>
            <AppText size="sm" weight="600" color={c.primaryStrong}>
              กลับหน้าหลัก
            </AppText>
            <Ionicons name="arrow-forward" size={14} color={c.primaryStrong} />
          </Pressable>
        </ScrollView>
      </View>
    </AuthCardIn>
  );
};

/** ไอคอนหมุนระหว่างกำลังดึงไฟล์ */
const Spinner: React.FC<{ size?: number; color: string }> = ({ size = 19, color }) => {
  const t = useTheme();
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (t.reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin, t.reduceMotion]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <MaterialCommunityIcons name="loading" size={size} color={color} />
    </Animated.View>
  );
};

/** สถานะของตารางหนึ่งรายการ — ใช้ทั้งไอคอนหน้าแถวและป้ายท้ายแถว */
const rowStatus = (pct: number): { label: string; tone: 'success' | 'warning' | 'neutral' } =>
  pct >= 100
    ? { label: 'นำเข้าแล้ว', tone: 'success' }
    : pct > 0
      ? { label: 'กำลังดึง', tone: 'warning' }
      : { label: 'รอคิว', tone: 'neutral' };

/** แถวตารางนำเข้าข้อมูล 1 ตาราง — ชื่อ/ไฟล์ · จำนวนแถว · ป้ายสถานะ · แถบความคืบหน้า */
const ImportRow: React.FC<{ label: string; file: string; rows: number; size: string; pct: number }> = ({
  label,
  file,
  rows,
  size,
  pct,
}) => {
  const t = useTheme();
  const c = t.colors;
  const done = pct >= 100;
  const running = pct > 0 && !done;
  const status = rowStatus(pct);
  return (
    <View style={{ paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: c.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {done ? (
          <Ionicons name="checkmark-circle" size={19} color={c.success} />
        ) : running ? (
          <Spinner size={19} color={c.warning} />
        ) : (
          <Ionicons name="ellipse-outline" size={19} color={c.mutedForeground} />
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText size="sm" weight="600" numberOfLines={1}>
            {label}
          </AppText>
          <AppText size="xs" muted mono numberOfLines={1}>
            {file} · {size}
          </AppText>
        </View>
        <AppText size="xs" muted mono>
          {fmtInt(rows)} แถว
        </AppText>
        {/* แถบความคืบหน้าอยู่แถวเดียวกับชื่อไฟล์ ชิดขวา — กว้างคงที่ ไม่ยืดตามพื้นที่ */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ProgressBar value={pct} height={6} style={{ width: 104, flexGrow: 0 }} />
          <AppText
            size="xs"
            weight="700"
            mono
            color={done ? c.success : running ? c.primary : c.mutedForeground}
            style={{ width: 34, textAlign: 'right' }}
          >
            {Math.round(pct)}%
          </AppText>
        </View>
        {/* ป้ายสถานะท้ายแถว — กว้างคงที่เพื่อให้ทุกแถวตรงคอลัมน์กัน */}
        <View style={{ width: 104, alignItems: 'flex-end', justifyContent: 'center' }}>
          <Badge label={status.label} tone={status.tone} size="sm" dot style={{ alignSelf: 'flex-end' }} />
        </View>
      </View>
    </View>
  );
};

/**
 * หน้า 00 — ตั้งค่าเครื่องครั้งแรก (Figma node 16:235)
 * โครงจอใหญ่: สูงเท่าจอ ไม่เลื่อนทั้งหน้า — ลิสต์หน่วยงาน / ลิสต์นำเข้า / กล่อง log
 * เลื่อนภายในของใครของมัน ส่วนหัว แบนเนอร์ และปุ่มยึดตำแหน่งคงที่
 */
export const SetupScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;

  // อนิเมชัน "การ์ดขยาย": เริ่มที่ความกว้างการ์ด SSO (ชิดขวา) → ถ่างออกเต็มผืนตาม Figma
  const [paneW, setPaneW] = useState<number | null>(null);
  const grow = useRef(new Animated.Value(0)).current;
  const started = useRef(false);

  useEffect(() => {
    if (paneW === null || started.current) return;
    started.current = true;
    if (t.reduceMotion) {
      grow.setValue(1);
      return;
    }
    // ปรับ layout width จึงใช้ JS driver (ครั้งเดียวตอนเข้า ไม่กระทบเฟรมงานอื่น)
    Animated.timing(grow, { toValue: 1, duration: 680, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [paneW, t.reduceMotion, grow]);

  // ระหว่างยังไม่ยืนยันตัวตน Root จะแสดง AuthFlow (การ์ด SSO) แทนหน้านี้
  if (state.sso !== 'in') return null;

  const startW = paneW ? Math.min(632, paneW * 0.52) : 0;
  const cardW = paneW ? grow.interpolate({ inputRange: [0, 1], outputRange: [startW, paneW] }) : undefined;
  const contentFade = grow.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 0.25, 1] });

  /** หุบการ์ดกลับเป็นขนาดการ์ด auth ก่อน แล้วค่อยทำ action (ออกจาก SSO / กลับหน้าหลัก) */
  const collapseThen = (after: () => void) => {
    if (t.reduceMotion) {
      after();
      return;
    }
    Animated.timing(grow, { toValue: 0, duration: 520, easing: Easing.in(Easing.cubic), useNativeDriver: false }).start(
      ({ finished }) => {
        if (finished) after();
      }
    );
  };
  const collapseAndLogout = () => collapseThen(actions.ssoLogout);
  const collapseAndBack = () => collapseThen(actions.backToLogin);

  const doneTables = state.setupTables.filter((x) => x.pct >= 100).length;
  const doneRows = state.setupTables.filter((x) => x.pct >= 100).reduce((s, x) => s + x.rows, 0);
  const stage = state.setupRunning || state.setupDone ? 'import' : 'pick';

  const facilityItems = FACILITIES.map((f) => {
    const active = state.pick === f.code;
    return (
      <OptionTile key={f.code} active={active} check onPress={() => actions.pickFacility(f.code)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.tones.primary.bg, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialCommunityIcons name="hospital-building" size={18} color={t.tones.primary.fg} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppText size="sm" weight="700" color={c.primary} mono>
                {f.code}
              </AppText>
              <AppText size="md" weight="700" numberOfLines={1} style={{ flexShrink: 1 }}>
                {f.name}
              </AppText>
            </View>
            <AppText size="xs" muted numberOfLines={1}>
              {f.area}
            </AppText>
          </View>
        </View>
      </OptionTile>
    );
  });

  const leftPane = (
    <View
      style={[
        { borderRadius: t.radius.xl, backgroundColor: c.card, padding: 20, gap: 24 },
        t.shadow.sm,
        wide ? { width: 460, alignSelf: 'stretch' } : null,
      ]}
    >
      <StepperChips steps={stepsFor(stage)} />

      {/* แบนเนอร์ยืนยันตัวตนแล้ว */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 10,
          paddingRight: 12,
          borderRadius: t.radius.pill,
          backgroundColor: c.primaryStrong,
        }}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="person" size={18} color={c.primaryStrong} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText size="md" weight="600" color="#FFFFFF">
            ยืนยันตัวตนแล้ว
          </AppText>
          <AppText size="xs" color="#B7E4C7" mono>
            {state.ssoUser} · {state.ssoTime}
          </AppText>
        </View>
        <Tooltip label="ออกจากระบบ SSO">
          <Pressable
            onPress={collapseAndLogout}
            accessibilityLabel="ออกจากระบบ SSO"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: withAlpha('#FFFFFF', 0.18),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
          </Pressable>
        </Tooltip>
      </View>

      {/* หัวข้อจับกลุ่มกับลิสต์ — จอใหญ่: ลิสต์เลื่อนภายใน ส่วนอื่นยึดตำแหน่ง */}
      <View style={{ gap: 12, ...(wide ? { flex: 1, minHeight: 0 } : null) }}>
        <AppText size="sm" weight="600" muted>
          เลือกสังกัด / หน่วยงานประจำเครื่อง
        </AppText>
        {wide ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 9, paddingBottom: 4 }} showsVerticalScrollIndicator={false}>
            {facilityItems}
          </ScrollView>
        ) : (
          <View style={{ gap: 9 }}>{facilityItems}</View>
        )}
      </View>

      <Pressable onPress={collapseAndBack} style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6, paddingVertical: 4 }}>
        <AppText size="sm" weight="600" color={c.primaryStrong}>
          กลับหน้าหลัก
        </AppText>
        <Ionicons name="arrow-forward" size={14} color={c.primaryStrong} />
      </Pressable>
    </View>
  );

  const importRows = state.setupTables.map((x) => (
    <ImportRow key={x.file} label={x.label} file={x.file} rows={x.rows} size={x.size} pct={x.pct} />
  ));

  // ความคืบหน้ารวมของทั้งชุด (เฉลี่ยจากทุกตาราง)
  const overallPct = state.setupTables.length
    ? state.setupTables.reduce((s, x) => s + x.pct, 0) / state.setupTables.length
    : 0;

  const rightPane = (
    <View style={{ flex: 1, gap: 14, ...(wide ? { alignSelf: 'stretch', minHeight: 0 } : null) }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 220, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <AppText size="xl" weight="700">
              ดึงและนำเข้าข้อมูลพื้นฐาน
            </AppText>
            <Badge
              label={state.setupDone ? 'พร้อมใช้งาน' : state.setupRunning ? 'กำลังดาวน์โหลด' : 'ยังไม่เริ่ม'}
              tone={state.setupDone ? 'success' : state.setupRunning ? 'warning' : 'neutral'}
              size="sm"
              dot
            />
          </View>
          {/* ตัวนับ + แถบรวมของทั้งชุด อยู่บรรทัดเดียวกัน */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <AppText size="sm" muted>
              {doneTables}/{state.setupTables.length} ตาราง · {fmtInt(doneRows)} แถว
            </AppText>
            <ProgressBar value={overallPct} height={6} style={{ width: 132, flexGrow: 0 }} />
            <AppText
              size="sm"
              weight="700"
              mono
              color={state.setupDone ? c.success : overallPct > 0 ? c.primary : c.mutedForeground}
            >
              {Math.round(overallPct)}%
            </AppText>
          </View>
        </View>
        {/* ปุ่มเดียว 3 สถานะ: ดาวน์โหลด → กำลังโหลด → เสร็จสิ้น·ไปหน้าเข้าสู่ระบบ */}
        <Button
          label={
            state.setupDone
              ? 'เสร็จสิ้น · ไปหน้าเข้าสู่ระบบ'
              : state.setupRunning
                ? 'กำลังดาวน์โหลด…'
                : 'ดาวน์โหลดและนำเข้าข้อมูล'
          }
          icon={
            state.setupDone ? (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            ) : (
              <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
            )
          }
          variant={state.setupDone ? 'strong' : 'primary'}
          loading={state.setupRunning}
          disabled={state.setupRunning}
          onPress={state.setupDone ? () => collapseThen(actions.finishSetup) : actions.startSetupImport}
        />
      </View>

      {/* ลิสต์นำเข้า — จอใหญ่: เลื่อนภายในการ์ด */}
      {wide ? (
        <View style={[{ flex: 1, minHeight: 0, borderRadius: t.radius.xl, backgroundColor: c.card, overflow: 'hidden' }, t.shadow.sm]}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6 }}>{importRows}</ScrollView>
        </View>
      ) : (
        <View style={[{ borderRadius: t.radius.xl, backgroundColor: c.card, paddingHorizontal: 16, paddingVertical: 6 }, t.shadow.sm]}>
          {importRows}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-end' }}>
        <LogConsole
          lines={state.setupLog}
          height={210}
          emptyText="รอเริ่มขั้นตอน — เลือกหน่วยงานแล้วกด “ดาวน์โหลดและนำเข้าข้อมูล”"
          style={{ flex: 1 }}
        />
        {width >= 1180 ? (
          <Image source={FigmaAssets.setupIllustration} style={{ width: 186, height: 198 }} resizeMode="contain" />
        ) : null}
      </View>
    </View>
  );

  return (
    // พื้น gradient เดียวกับหน้า auth → ตอนการ์ดขยายออก ฉากหลังต่อเนื่องไม่กระตุก (ตาม Figma เหลือขอบเขียว 8px)
    <LinearGradient colors={['#2D6A4F', '#40916C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <View
        style={{ flex: 1, padding: 8, flexDirection: 'row', justifyContent: 'flex-end' }}
        onLayout={(e) => setPaneW(e.nativeEvent.layout.width - 16)}
      >
        <Animated.View
          style={{
            width: cardW ?? '100%',
            borderRadius: t.radius.xl,
            backgroundColor: c.background,
            overflow: 'hidden',
            opacity: paneW === null ? 0 : 1,
          }}
        >
          <Animated.View style={{ flex: 1, opacity: contentFade }}>
            {wide ? (
              // จอใหญ่: สูงเท่าจอ ไม่เลื่อนทั้งหน้า — แต่ละลิสต์เลื่อนภายในตัวเอง
              <View style={{ flex: 1, flexDirection: 'row', gap: 16, padding: 16, minHeight: 0 }}>
                {leftPane}
                {rightPane}
              </View>
            ) : (
              // จอเล็ก: กลับไปเลื่อนทั้งหน้าตามปกติของมือถือ
              <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                {leftPane}
                {rightPane}
              </ScrollView>
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};
