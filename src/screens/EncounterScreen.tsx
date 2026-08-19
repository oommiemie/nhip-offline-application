import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, TextInput, View, useWindowDimensions, type TextStyle, type ViewStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  IconBtn,
  InfoCard,
  TextField,
  webFocusRing,
} from '../components';
import { useApp } from '../state/AppContext';
import { useTheme, withAlpha } from '../theme';
import { initials } from '../utils/format';

const vitalOf = (vitals: Array<[string, string]>, key: string): string =>
  vitals.find(([k]) => k === key)?.[1] ?? '';

/** ชิปมิ้นต์ใต้ชื่อผู้ป่วย (HN · สิทธิ์ · บริการ) ตาม Figma 40:52173 */
const MintChip: React.FC<{ label: string; mono?: boolean }> = ({ label, mono = false }) => {
  const t = useTheme();
  return (
    <View
      style={{
        height: 29,
        justifyContent: 'center',
        paddingHorizontal: 12,
        borderRadius: t.radius.pill,
        backgroundColor: t.tones.primary.bg,
      }}
    >
      <AppText size="sm" weight="600" mono={mono} color={t.colors.primaryStrong}>
        {label}
      </AppText>
    </View>
  );
};

/** ป้ายค่าคงที่ในการ์ดผู้ป่วย (เพศ / อายุ / หมู่เลือด) */
const MiniTile: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const t = useTheme();
  return (
    <View style={{ flex: 1, gap: 2, paddingHorizontal: 12, paddingVertical: 9, borderRadius: t.radius.md, backgroundColor: t.colors.inputBg }}>
      <AppText size="xs" muted numberOfLines={1}>
        {label}
      </AppText>
      <AppText size="sm" weight="600" numberOfLines={1}>
        {value || '—'}
      </AppText>
    </View>
  );
};

/** การ์ดข้อมูลฝั่งซ้าย: หัวข้อมีแถบสีนำ + เส้นคั่น + เนื้อหา */
const BarCard: React.FC<{ title: string; danger?: boolean; children: React.ReactNode }> = ({
  title,
  danger = false,
  children,
}) => {
  const t = useTheme();
  const c = t.colors;
  const fg = danger ? c.alertBandForeground : c.foreground;
  return (
    <Card
      rounded="xl"
      padded={0}
      shadow="md"
      style={[{ borderWidth: 0 }, danger ? { backgroundColor: c.alertBand } : null]}
    >
      {/* หัวข้อไม่มีเส้นคั่น — เว้นจังหวะด้วยช่องไฟแทน */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ width: 3, height: 17, borderRadius: 2, backgroundColor: danger ? '#FFFFFF' : c.primary }} />
        <AppText size="md" weight="700" color={fg}>
          {title}
        </AppText>
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>{children}</View>
    </Card>
  );
};

/** ช่องกรอกค่าตรวจ — ป้ายด้านบน กล่องเทา ค่าอยู่ซ้าย หน่วยชิดขวาในกล่อง (ตาม Figma) */
const VitalField: React.FC<{
  label: string;
  unit: string;
  value: string;
  onChangeText?: (v: string) => void;
  readonly?: boolean;
  bad?: boolean;
  flex?: number;
  minWidth?: number;
  children?: React.ReactNode;
}> = ({ label, unit, value, onChangeText, readonly = false, bad = false, flex = 1, minWidth = 118, children }) => {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={{ flex, minWidth, gap: 7 }}>
      <AppText size="sm" weight="600" numberOfLines={1}>
        {label}
      </AppText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          height: 44,
          paddingHorizontal: 12,
          borderRadius: t.radius.md,
          backgroundColor: c.inputBg,
          borderWidth: 1.5,
          borderColor: bad ? withAlpha(c.destructive, 0.5) : 'transparent',
        }}
      >
        {children ?? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            editable={!readonly}
            placeholder="—"
            placeholderTextColor={c.mutedForeground}
            keyboardType="numeric"
            inputMode="numeric"
            style={[
              {
                flex: 1,
                minWidth: 0,
                paddingVertical: 0,
                fontFamily: t.mono('600'),
                fontSize: t.fs.md,
                color: bad ? c.destructive : readonly ? c.mutedForeground : c.foreground,
              },
              webFocusRing(c.ring) as TextStyle,
            ]}
          />
        )}
        <AppText size="xs" muted>
          {unit}
        </AppText>
      </View>
    </View>
  );
};

/** หน้า 04 — ซักประวัติ / ตรวจรักษา · จัดตาม Figma node 40:52173 */
export const EncounterScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions, derived } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= 1180;
  const cur = derived.current;

  const bp = vitalOf(cur?.vitals ?? [], 'BP').split('/');
  const [sys, setSys] = useState(bp[0] ?? '');
  const [dia, setDia] = useState(bp[1] ?? '');
  const [pulse, setPulse] = useState(vitalOf(cur?.vitals ?? [], 'ชีพจร'));
  const [resp, setResp] = useState(vitalOf(cur?.vitals ?? [], 'หายใจ'));
  const [temp, setTemp] = useState(vitalOf(cur?.vitals ?? [], 'อุณหภูมิ'));
  const [spo2, setSpo2] = useState(vitalOf(cur?.vitals ?? [], 'SpO2'));
  const [weight, setWeight] = useState(vitalOf(cur?.vitals ?? [], 'น้ำหนัก'));
  const [height, setHeight] = useState(vitalOf(cur?.vitals ?? [], 'ส่วนสูง'));
  const [waist, setWaist] = useState('');
  const [dtx, setDtx] = useState(vitalOf(cur?.vitals ?? [], 'DTX'));
  const [cc, setCc] = useState(cur?.cc ?? '');
  const [hpi, setHpi] = useState(cur?.hpi ?? '');
  const [pe, setPe] = useState(cur?.pe ?? '');
  const [plan, setPlan] = useState('');

  useEffect(() => {
    const v = cur?.vitals ?? [];
    const b = vitalOf(v, 'BP').split('/');
    setSys(b[0] ?? '');
    setDia(b[1] ?? '');
    setPulse(vitalOf(v, 'ชีพจร'));
    setResp(vitalOf(v, 'หายใจ'));
    setTemp(vitalOf(v, 'อุณหภูมิ'));
    setSpo2(vitalOf(v, 'SpO2'));
    setWeight(vitalOf(v, 'น้ำหนัก'));
    setHeight(vitalOf(v, 'ส่วนสูง'));
    setWaist('');
    setDtx(vitalOf(v, 'DTX'));
    setCc(cur?.cc ?? '');
    setHpi(cur?.hpi ?? '');
    setPe(cur?.pe ?? '');
    setPlan('');
  }, [state.curIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h) return '';
    return (w / (h * h)).toFixed(1);
  }, [weight, height]);

  const bpHigh = parseFloat(sys) >= 140 || parseFloat(dia) >= 90;
  const tempHigh = parseFloat(temp) >= 37.5;
  const spo2Low = parseFloat(spo2) > 0 && parseFloat(spo2) < 95;
  const dtxHigh = parseFloat(dtx) >= 126;

  if (!cur) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          icon="card-outline"
          title="ยังไม่มีคนไข้ในโฟกัสงานนี้"
          subtitle="เลือกจากรายการรับบริการ หรืออ่านบัตรประชาชนเพื่อเปิดคิวใหม่"
          actionLabel="อ่านบัตรประชาชน · ลงทะเบียน"
          onAction={actions.openReg}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 12, paddingBottom: 106, gap: 16 }}>
        <View style={wide ? { flexDirection: 'row', gap: 16, alignItems: 'flex-start' } : { gap: 16 }}>
          {/* คอลัมน์ซ้าย 375 — ตัวตนผู้ป่วยและข้อมูลที่ต้องเห็นตลอด */}
          <View style={{ width: wide ? 375 : undefined, gap: 16 }}>
            <Card rounded="xl" padded={16} shadow="md" style={[{ borderWidth: 0, borderRadius: t.radius.xl }, t.shadow.md]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Button
                  label="ประวัติเดิม"
                  variant="outline"
                  size="sm"
                  onPress={() => actions.setHistoryOpen(true)}
                  style={{ paddingHorizontal: 14 }}
                />
                <View style={{ flex: 1 }} />
                <IconBtn name="expand-outline" size={32} onPress={() => actions.openOpd(state.curIdx ?? 0)} />
                <IconBtn name="create-outline" size={32} onPress={actions.openReg} />
              </View>

              <View style={{ alignItems: 'center', gap: 12, marginTop: 16 }}>
                <Avatar label={initials(cur.name)} size={80} />
                <AppText size="xl" weight="700" center>
                  {cur.name}
                </AppText>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <MintChip label={`HN ${cur.hn}`} mono />
                  <MintChip label={cur.right} />
                  <MintChip label={cur.service} />
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: c.border, marginVertical: 16 }} />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText size="xs" muted>
                    เลขบัตรประชาชน
                  </AppText>
                  <AppText size="sm" weight="600" mono numberOfLines={1}>
                    {cur.cid}
                  </AppText>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText size="xs" muted>
                    เบอร์โทรศัพท์
                  </AppText>
                  <AppText size="sm" weight="600" mono numberOfLines={1}>
                    {cur.phone || '—'}
                  </AppText>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <MiniTile label="เพศ" value={cur.sex} />
                <MiniTile label="อายุ" value={`${cur.age} ปี`} />
                <MiniTile label="หมู่เลือด" value={cur.bloodType} />
              </View>
            </Card>

            <BarCard title="แพ้ยา" danger={!!cur.allergy}>
              <AppText size="sm" weight="600" color={cur.allergy ? c.alertBandForeground : c.mutedForeground}>
                {cur.allergy || 'ไม่พบประวัติแพ้ยา — สอบถามซ้ำทุกครั้ง'}
              </AppText>
            </BarCard>

            <BarCard title="โรคประจำตัว">
              <AppText size="sm" weight="600">
                {cur.chronic && cur.chronic !== '—' ? cur.chronic : 'ไม่มีโรคประจำตัวในระบบ'}
              </AppText>
            </BarCard>

            <BarCard title="ยาที่ใช้อยู่">
              {cur.drugs.length ? (
                <View style={{ gap: 6 }}>
                  {cur.drugs.map((d) => (
                    <AppText key={d} size="sm" weight="600">
                      • {d}
                    </AppText>
                  ))}
                </View>
              ) : (
                <AppText size="sm" muted>
                  ไม่มีรายการยาเดิมในเครื่อง · ดึงจาก Cloud เมื่อออนไลน์
                </AppText>
              )}
            </BarCard>
          </View>

          {/* คอลัมน์ขวา — ฟอร์มบันทึกการตรวจ */}
          <View style={{ flex: 1, gap: 16 }}>
            <InfoCard title="สัญญาณชีพ" icon="clipboard-pulse-outline" style={[{ borderWidth: 0, borderRadius: t.radius.xl }, t.shadow.md]}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <VitalField label="ความดันโลหิต" unit="mmHg" value="" bad={bpHigh} flex={1.9} minWidth={196}>
                  <TextInput
                    value={sys}
                    onChangeText={setSys}
                    placeholder="—"
                    placeholderTextColor={c.mutedForeground}
                    keyboardType="numeric"
                    inputMode="numeric"
                    style={[
                      {
                        minWidth: 0,
                        flex: 1,
                        paddingVertical: 0,
                        fontFamily: t.mono('600'),
                        fontSize: t.fs.md,
                        color: bpHigh ? c.destructive : c.foreground,
                      },
                      webFocusRing(c.ring) as TextStyle,
                    ]}
                  />
                  <AppText size="md" mono color={bpHigh ? c.destructive : c.mutedForeground}>
                    /
                  </AppText>
                  <TextInput
                    value={dia}
                    onChangeText={setDia}
                    placeholder="—"
                    placeholderTextColor={c.mutedForeground}
                    keyboardType="numeric"
                    inputMode="numeric"
                    style={[
                      {
                        minWidth: 0,
                        flex: 1,
                        paddingVertical: 0,
                        fontFamily: t.mono('600'),
                        fontSize: t.fs.md,
                        color: bpHigh ? c.destructive : c.foreground,
                      },
                      webFocusRing(c.ring) as TextStyle,
                    ]}
                  />
                </VitalField>
                <VitalField label="ชีพจร" unit="นาที" value={pulse} onChangeText={setPulse} />
                <VitalField label="หายใจ" unit="นาที" value={resp} onChangeText={setResp} />
                <VitalField label="อุณหภูมิ" unit="°C" value={temp} onChangeText={setTemp} bad={tempHigh} />
                <VitalField label="SpO₂" unit="%" value={spo2} onChangeText={setSpo2} bad={spo2Low} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <VitalField label="น้ำหนัก" unit="กก." value={weight} onChangeText={setWeight} />
                <VitalField label="ส่วนสูง" unit="ซม." value={height} onChangeText={setHeight} />
                <VitalField label="BMI" unit="kg/m²" value={bmi} readonly />
                <VitalField label="รอบเอว" unit="ซม." value={waist} onChangeText={setWaist} />
                <VitalField label="DTX" unit="mg/dL" value={dtx} onChangeText={setDtx} bad={dtxHigh} />
              </View>
            </InfoCard>

            <InfoCard title="ซักประวัติ / ตรวจร่างกาย" icon="clipboard-text-outline" style={[{ borderWidth: 0, borderRadius: t.radius.xl }, t.shadow.md]}>
              <View style={{ gap: 12 }}>
                <TextField label="อาการสำคัญ (CC)" required value={cc} onChangeText={setCc} placeholder="พิมพ์อาการสำคัญ" />
                <TextField label="ประวัติปัจจุบัน (HPI)" value={hpi} onChangeText={setHpi} placeholder="พิมพ์ประวัติปัจจุบัน" />
                <TextField label="ตรวจร่างกาย (PE)" value={pe} onChangeText={setPe} placeholder="ผลการตรวจร่างกาย" />
              </View>
            </InfoCard>

            <InfoCard title="แผนการรักษา / คำแนะนำ" icon="clipboard-check-outline" style={[{ borderWidth: 0, borderRadius: t.radius.xl }, t.shadow.md]}>
              <TextField
                value={plan}
                onChangeText={setPlan}
                placeholder="สรุปแผนการรักษา คำแนะนำที่ให้ผู้ป่วย และการนัดครั้งถัดไป"
              />
            </InfoCard>

            <InfoCard
              title="การวินิจฉัย (ICD-10)"
              icon="stethoscope"
              style={[{ borderWidth: 0, borderRadius: t.radius.xl }, t.shadow.md]}
              right={
                <Button
                  label="เพิ่ม"
                  variant="outline"
                  size="sm"
                  icon={<Ionicons name="add" size={15} color={c.primary} />}
                  onPress={() => {}}
                />
              }
            >
              {cur.icd.length ? (
                <View style={{ gap: 0 }}>
                  {cur.icd.map(([code, name, kind], i) => (
                    <View
                      key={code}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingVertical: 12,
                        borderTopWidth: i === 0 ? 0 : 1,
                        borderTopColor: c.border,
                      }}
                    >
                      <AppText size="sm" weight="700" mono color={c.primary} style={{ minWidth: 62 }}>
                        {code}
                      </AppText>
                      <AppText size="sm" weight="600" style={{ flex: 1 }} numberOfLines={1}>
                        {name}
                      </AppText>
                      <Badge label={kind} tone={kind === 'หลัก' ? 'primary' : 'neutral'} size="sm" />
                      <IconBtn name="trash-outline" size={30} onPress={() => {}} />
                    </View>
                  ))}
                </View>
              ) : (
                <AppText size="sm" muted center style={{ paddingVertical: 10 }}>
                  ยังไม่มีการวินิจฉัย — กด “เพิ่ม” เพื่อค้นรหัส ICD-10
                </AppText>
              )}
            </InfoCard>
          </View>
        </View>
      </ScrollView>

      {/* บาร์ลอยด้านล่างแบบกระจกตาม Figma 40:52173 — ลอยเหนือเนื้อหา ไม่มีเส้นคั่นกับหน้า */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              minHeight: 66,
              paddingLeft: 8,
              paddingRight: 8,
              paddingVertical: 9,
              borderRadius: t.radius.pill,
              // กระจกโปร่งตาม Figma (ขาว ~30%) — อ่านออกเพราะฉากหลังถูกเบลอ+อิ่มสี
              backgroundColor: withAlpha(t.isDark ? c.card : '#FFFFFF', Platform.OS === 'web' ? 0.32 : 0.9),
              // ขอบแสงบาง ๆ ของขอบกระจก (ไม่ใช่เส้นการ์ด)
              borderWidth: 1,
              borderColor: withAlpha(t.isDark ? '#FFFFFF' : '#FFFFFF', t.isDark ? 0.08 : 0.55),
              ...(Platform.OS === 'web'
                ? ({
                    backdropFilter: 'blur(22px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
                  } as unknown as ViewStyle)
                : null),
            },
            t.shadow.lg,
          ]}
        >
          {/* ป้ายสถานะร่าง — จุดนำหน้า + ข้อความลอยบนกระจก ไม่มีพื้นหลัง */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 12,
              flexShrink: 1,
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.mutedForeground }} />
            <AppText size="xs" weight="600" muted numberOfLines={1} style={{ flexShrink: 1 }}>
              ร่างแบบบันทึกถูกเก็บในเครื่องอัตโนมัติ — ยังไม่ส่งขึ้น Cloud จนกว่าจะซิงค์
            </AppText>
          </View>
          <View style={{ flex: 1 }} />
          {/* ปุ่มคู่ท้ายบาร์กว้างเท่ากัน 100 ตาม Figma (btn 100x47) */}
          <Button label="ยกเลิก" variant="outline" onPress={() => actions.setOssTab('list')} style={{ width: 100 }} />
          <Button label="บันทึก" onPress={actions.saveEncounter} style={{ width: 100 }} />
        </View>
      </View>
    </View>
  );
};
