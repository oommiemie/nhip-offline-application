import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText, Button, SelectField, Snowfall, StatusDot, TextField } from '../components';
import { BRANCHES } from '../state/mockData';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';
import { AuthCardIn } from './BrandPanel';

/**
 * การ์ดเข้าสู่ระบบ (Figma node 15:6) — เนื้อหาฝั่งขวาเท่านั้น
 * ตัว SplitAuthLayout (แผงแบรนด์ซ้าย) ถูกถือโดย AuthFlow เพื่อให้คงอยู่ข้ามหน้า
 * โครงตาม Figma: การ์ดขาว r24 padding 80 (จอใหญ่) · ฟอร์มกว้าง 472
 */
export const LoginCard: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const { width } = useWindowDimensions();
  const cardPad = width >= 1100 ? 64 : 24;

  /** ธีมคริสต์มาส: หิมะเม็ดเล็กตกในปุ่มเข้าสู่ระบบ */
  const xmas = t.festival === 'christmas';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456789');
  const [branch, setBranch] = useState('OPD');
  const branchDef = useMemo(() => BRANCHES.find((b) => b.code === branch) ?? BRANCHES[0], [branch]);
  const [room, setRoom] = useState(branchDef.rooms[0]);

  const onBranchChange = (code: string) => {
    setBranch(code);
    const def = BRANCHES.find((b) => b.code === code) ?? BRANCHES[0];
    setRoom(def.rooms[0]);
  };

  /* ---- ตรวจความครบถ้วนของฟอร์ม ----
     ขอบแดง + ข้อความใต้ช่อง จะขึ้นเมื่อผู้ใช้เข้าไปแล้วออกจากช่องโดยยังว่าง (touched)
     ส่วนปุ่มจะกดไม่ได้ตราบใดที่ยังกรอกไม่ครบ */
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});
  const usernameError = touched.username && !username.trim() ? 'กรุณากรอกชื่อผู้ใช้งาน' : undefined;
  const passwordError = touched.password && !password.trim() ? 'กรุณากรอกรหัสผ่าน' : undefined;

  const missing = [
    !username.trim() ? 'ชื่อผู้ใช้งาน' : null,
    !password.trim() ? 'รหัสผ่าน' : null,
    !branch ? 'สาขาบริการ' : null,
    !room ? 'ห้องตรวจโรค' : null,
  ].filter((x): x is string => x !== null);
  const canSubmit = missing.length === 0;

  const submit = () => {
    if (!canSubmit) {
      setTouched({ username: true, password: true });
      return;
    }
    actions.login(branch, room);
  };

  return (
    <AuthCardIn from="left">
      {/* ไม่ใส่เงา — เงาใหญ่บนพื้น gradient จะเห็นเป็นแถบเขียวเข้มซ้อนรอบการ์ด */}
      <View style={{ flex: 1, borderRadius: t.radius.xl, backgroundColor: c.card, overflow: 'hidden' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: cardPad, paddingTop: Math.min(cardPad, 40) }}>
          {/* แถวสถานะบนสุด: หน่วยงาน (ซ้าย) · ซิงค์ล่าสุด (ขวา) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {state.configured ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  height: 28,
                  paddingHorizontal: 12,
                  borderRadius: t.radius.pill,
                  backgroundColor: t.tones.primary.bg,
                }}
              >
                <StatusDot color={c.success} size={8} />
                <AppText size="sm" weight="600" color={t.tones.primary.fg}>
                  {state.facility.name} · {state.facility.code}
                </AppText>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  height: 28,
                  paddingHorizontal: 12,
                  borderRadius: t.radius.pill,
                  backgroundColor: t.tones.warning.bg,
                }}
              >
                <StatusDot color={c.warning} size={8} />
                <AppText size="sm" weight="600" color={t.tones.warning.fg}>
                  ยังไม่ได้ตั้งค่าสถานพยาบาล
                </AppText>
              </View>
            )}
            <View style={{ flex: 1 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <StatusDot color={c.warning} size={8} />
              <AppText size="sm" muted>
                ซิงค์ล่าสุด {state.lastSync} น.
              </AppText>
            </View>
          </View>

          {/* ฟอร์มกลาง (กว้าง 472 ตาม Figma) */}
          <View style={{ flex: 1, justifyContent: 'center', maxWidth: 472, width: '100%', alignSelf: 'center', gap: 32, paddingVertical: 30 }}>
            <View style={{ gap: 12 }}>
              <AppText size="hero" weight="700" style={{ lineHeight: t.fs.hero * 1.25 }}>
                เข้าสู่ระบบ
              </AppText>
              <AppText size="md" muted>
                ลงชื่อเข้าใช้งานด้วยระบบสารสนเทศ รพ.สต. ยุคใหม่
              </AppText>
            </View>

            <View style={{ gap: 20 }}>
              <TextField
                label="ชื่อผู้ใช้งาน"
                icon="person-circle-outline"
                value={username}
                onChangeText={setUsername}
                onBlur={() => setTouched((s) => ({ ...s, username: true }))}
                errorText={usernameError}
                placeholder="กรอกชื่อผู้ใช้งาน"
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TextField
                label="รหัสผ่าน"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                errorText={passwordError}
                placeholder="กรอกรหัสผ่าน"
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={submit}
              />
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <SelectField
                  label="สาขาบริการ"
                  value={branch}
                  options={BRANCHES.map((b) => ({ value: b.code, label: b.name }))}
                  onChange={onBranchChange}
                  containerStyle={{ flex: 1 }}
                />
                <SelectField
                  label="ห้องตรวจโรค"
                  value={room}
                  options={branchDef.rooms}
                  onChange={setRoom}
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </View>

            <View style={{ gap: 10 }}>
              {/* ธีม Christmas: หิมะเกาะสันปุ่ม และสะบัดร่วงทุกครั้งที่กด */}
              <View style={{ position: 'relative' }}>
                <Button
                  label="เข้าสู่ระบบบริการ"
                  variant="strong"
                  rounded="md"
                  size="lg"
                  full
                  disabled={!canSubmit}
                  onPress={submit}
                />
                {xmas ? <Snowfall radius={t.radius.md} height={t.density.controlH + 6} reduceMotion={t.reduceMotion} /> : null}
              </View>
              {/* ความสูงคงที่ กันเลย์เอาต์ขยับตอนข้อความหาย */}
              <View style={{ minHeight: 18, justifyContent: 'center' }}>
                {canSubmit ? null : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center' }}>
                    <Ionicons name="information-circle-outline" size={14} color={c.mutedForeground} />
                    <AppText size="xs" muted>
                      กรอก {missing.join(' · ')} ให้ครบก่อนเข้าสู่ระบบ
                    </AppText>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ลิงก์ล่าง */}
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Pressable onPress={actions.openSetup} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppText size="sm" weight="600" color={c.primaryStrong}>
                ตั้งค่าสถานพยาบาลครั้งแรก
              </AppText>
              <Ionicons name="arrow-forward" size={14} color={c.primaryStrong} />
            </Pressable>
            <AppText size="xs" muted center>
              หากลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบเครือข่ายจังหวัด
            </AppText>
          </View>
        </ScrollView>
      </View>
    </AuthCardIn>
  );
};
