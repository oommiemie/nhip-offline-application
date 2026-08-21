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
  Tooltip,
} from '../components';
import { AddIcdModal } from '../modals/AddIcdModal';
import { EditPatientModal } from '../modals/EditPatientModal';
import { useApp } from '../state/AppContext';
import { useTheme, withAlpha } from '../theme';
import { initials } from '../utils/format';
import { useT } from '../i18n';

/** ช่องในกล่องค่าตรวจไม่วาด outline ของตัวเอง — สถานะโฟกัสแสดงที่ขอบกล่องนอกแทน */
const NO_INNER_OUTLINE =
  Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as TextStyle) : null;

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
  /** บังคับสถานะโฟกัสจากภายนอก (กล่องความดันมี 2 ช่องใน) */
  focused?: boolean;
  children?: React.ReactNode;
}> = ({ label, unit, value, onChangeText, readonly = false, bad = false, flex = 1, minWidth = 118, focused = false, children }) => {
  const t = useTheme();
  const c = t.colors;
  const [innerFocus, setInnerFocus] = useState(false);
  const hasFocus = focused || innerFocus;
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
          // โฟกัส = ขอบนอกเขียวทั้งกล่อง แบบเดียวกับ TextField ช่องอื่น ๆ
          borderWidth: 1.5,
          borderColor: bad ? withAlpha(c.destructive, 0.5) : hasFocus ? c.ring : 'transparent',
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
            onFocus={() => setInnerFocus(true)}
            onBlur={() => setInnerFocus(false)}
            style={[
              {
                flex: 1,
                minWidth: 0,
                paddingVertical: 0,
                fontFamily: t.mono('600'),
                fontSize: t.fs.md,
                color: bad ? c.destructive : readonly ? c.mutedForeground : c.foreground,
              },
              NO_INNER_OUTLINE,
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
  const tt = useT();
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
  /** ขยายการ์ดผู้ป่วยดูสัญชาติ/เชื้อชาติ/ศาสนา/ที่อยู่ (Figma 126:462) */
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  /** โฟกัสของช่องคู่ความดัน — ใช้จุดเดียวให้ขอบกล่องนอกติดพร้อมกัน */
  const [bpFocus, setBpFocus] = useState(false);
  const [icdOpen, setIcdOpen] = useState(false);

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
          title={tt('ยังไม่มีคนไข้ในโฟกัสงานนี้')}
          subtitle={tt('เลือกจากรายการรับบริการ หรืออ่านบัตรประชาชนเพื่อเปิดคิวใหม่')}
          actionLabel={tt('อ่านบัตรประชาชน · ลงทะเบียน')}
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
                  label={tt('ประวัติเดิม')}
                  variant="outline"
                  size="sm"
                  onPress={() => actions.setHistoryOpen(true)}
                  style={{ paddingHorizontal: 14 }}
                />
                <View style={{ flex: 1 }} />
                <Tooltip label={expanded ? tt('ย่อข้อมูล') : tt('ดูข้อมูลเพิ่มเติม')}>
                  <IconBtn
                    name={expanded ? 'contract-outline' : 'expand-outline'}
                    size={32}
                    onPress={() => setExpanded((v) => !v)}
                  />
                </Tooltip>
                <Tooltip label={tt('แก้ไขข้อมูลผู้ป่วย')}>
                  <IconBtn name="pencil" size={32} onPress={() => setEditOpen(true)} />
                </Tooltip>
              </View>

              <View style={{ alignItems: 'center', gap: 12, marginTop: 16 }}>
                <Avatar label={initials(cur.name)} size={80} />
                <AppText size="xl" weight="700" center>
                  {cur.name}
                </AppText>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <MintChip label={`HN ${cur.hn}`} mono />
                  <MintChip label={tt(cur.right)} />
                  <MintChip label={tt(cur.service)} />
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: c.border, marginVertical: 16 }} />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText size="xs" muted>
                    {tt('เลขบัตรประชาชน')}
                  </AppText>
                  <AppText size="sm" weight="600" mono numberOfLines={1}>
                    {cur.cid}
                  </AppText>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText size="xs" muted>
                    {tt('เบอร์โทรศัพท์')}
                  </AppText>
                  <AppText size="sm" weight="600" mono numberOfLines={1}>
                    {cur.phone || '—'}
                  </AppText>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <MiniTile label={tt('เพศ')} value={tt(cur.sex)} />
                <MiniTile label={tt('อายุ')} value={tt('{n} ปี', { n: cur.age })} />
                <MiniTile label={tt('หมู่เลือด')} value={tt(cur.bloodType)} />
              </View>

              {expanded ? (
                <>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <MiniTile label={tt('สัญชาติ')} value={tt(cur.nationality)} />
                    <MiniTile label={tt('เชื้อชาติ')} value={tt(cur.race)} />
                    <MiniTile label={tt('ศาสนา')} value={tt(cur.religion)} />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <MiniTile label={tt('ที่อยู่')} value={cur.address} />
                  </View>
                </>
              ) : null}
            </Card>

            <BarCard title={tt('แพ้ยา')} danger={!!cur.allergy}>
              <AppText size="sm" weight="600" color={cur.allergy ? c.alertBandForeground : c.mutedForeground}>
                {cur.allergy || tt('ไม่พบประวัติแพ้ยา — สอบถามซ้ำทุกครั้ง')}
              </AppText>
            </BarCard>

            <BarCard title={tt('โรคประจำตัว')}>
              <AppText size="sm" weight="600">
                {cur.chronic && cur.chronic !== '—' ? cur.chronic : tt('ไม่มีโรคประจำตัวในระบบ')}
              </AppText>
            </BarCard>

            <BarCard title={tt('ยาที่ใช้อยู่')}>
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
                  {tt('ไม่มีรายการยาเดิมในเครื่อง · ดึงจาก Cloud เมื่อออนไลน์')}
                </AppText>
              )}
            </BarCard>
          </View>

          {/* คอลัมน์ขวา — ฟอร์มบันทึกการตรวจ */}
          <View style={{ flex: 1, gap: 16 }}>
            <InfoCard title={tt('สัญญาณชีพ')} icon="clipboard-pulse-outline" style={[{ borderWidth: 0, borderRadius: t.radius.xl }, t.shadow.md]}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <VitalField label={tt('ความดันโลหิต (mmHg)')} unit="" value="" bad={bpHigh} focused={bpFocus}>
                  <TextInput
                    value={sys}
                    onChangeText={setSys}
                    placeholder="—"
                    placeholderTextColor={c.mutedForeground}
                    keyboardType="numeric"
                    inputMode="numeric"
                    onFocus={() => setBpFocus(true)}
                    onBlur={() => setBpFocus(false)}
                    style={[
                      {
                        minWidth: 0,
                        flex: 1,
                        paddingVertical: 0,
                        fontFamily: t.mono('600'),
                        fontSize: t.fs.md,
                        color: bpHigh ? c.destructive : c.foreground,
                      },
                      NO_INNER_OUTLINE,
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
                    onFocus={() => setBpFocus(true)}
                    onBlur={() => setBpFocus(false)}
                    style={[
                      {
                        minWidth: 0,
                        flex: 1,
                        paddingVertical: 0,
                        fontFamily: t.mono('600'),
                        fontSize: t.fs.md,
                        color: bpHigh ? c.destructive : c.foreground,
                      },
                      NO_INNER_OUTLINE,
                    ]}
                  />
                </VitalField>
                <VitalField label={tt('ชีพจร')} unit={tt('นาที')} value={pulse} onChangeText={setPulse} />
                <VitalField label={tt('หายใจ')} unit={tt('นาที')} value={resp} onChangeText={setResp} />
                <VitalField label={tt('อุณหภูมิ')} unit="°C" value={temp} onChangeText={setTemp} bad={tempHigh} />
                <VitalField label="SpO₂" unit="%" value={spo2} onChangeText={setSpo2} bad={spo2Low} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <VitalField label={tt('น้ำหนัก')} unit={tt('กก.')} value={weight} onChangeText={setWeight} />
                <VitalField label={tt('ส่วนสูง')} unit={tt('ซม.')} value={height} onChangeText={setHeight} />
                <VitalField label="BMI" unit="kg/m²" value={bmi} readonly />
                <VitalField label={tt('รอบเอว')} unit={tt('ซม.')} value={waist} onChangeText={setWaist} />
                <VitalField label="DTX" unit="mg/dL" value={dtx} onChangeText={setDtx} bad={dtxHigh} />
              </View>
            </InfoCard>

            <InfoCard title={tt('ซักประวัติ / ตรวจร่างกาย')} icon="clipboard-text-outline" style={[{ borderWidth: 0, borderRadius: t.radius.xl }, t.shadow.md]}>
              <View style={{ gap: 12 }}>
                <TextField label={tt('อาการสำคัญ (CC)')} required value={cc} onChangeText={setCc} placeholder={tt('พิมพ์อาการสำคัญ')} />
                <TextField label={tt('ประวัติปัจจุบัน (HPI)')} value={hpi} onChangeText={setHpi} placeholder={tt('พิมพ์ประวัติปัจจุบัน')} />
                <TextField label={tt('ตรวจร่างกาย (PE)')} value={pe} onChangeText={setPe} placeholder={tt('ผลการตรวจร่างกาย')} />
              </View>
            </InfoCard>

            <InfoCard title={tt('แผนการรักษา / คำแนะนำ')} icon="clipboard-check-outline" style={[{ borderWidth: 0, borderRadius: t.radius.xl }, t.shadow.md]}>
              <TextField
                value={plan}
                onChangeText={setPlan}
                placeholder={tt('สรุปแผนการรักษา คำแนะนำที่ให้ผู้ป่วย และการนัดครั้งถัดไป')}
              />
            </InfoCard>

            <InfoCard
              title={tt('การวินิจฉัย (ICD-10)')}
              icon="stethoscope"
              style={[{ borderWidth: 0, borderRadius: t.radius.xl }, t.shadow.md]}
              right={
                <Button
                  label={tt('เพิ่ม')}
                  variant="outline"
                  size="sm"
                  icon={<Ionicons name="add" size={15} color={c.primary} />}
                  onPress={() => setIcdOpen(true)}
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
                      <Badge label={tt(kind)} tone={kind === 'หลัก' ? 'primary' : 'neutral'} size="sm" />
                      <Tooltip label={tt('ลบ')}>
                        <IconBtn
                          name="trash-outline"
                          size={30}
                          onPress={() =>
                            actions.showAlert({
                              kind: 'delete',
                              title: tt('ลบการวินิจฉัยนี้?'),
                              message: name,
                              detail: `${code} · ${kind}`,
                              cancelLabel: tt('ยกเลิก'),
                              confirmLabel: tt('ลบ'),
                              onConfirm: () => {
                                if (state.curIdx !== null) actions.removeIcd(state.curIdx, code);
                              },
                            })
                          }
                        />
                      </Tooltip>
                    </View>
                  ))}
                </View>
              ) : (
                <AppText size="sm" muted center style={{ paddingVertical: 10 }}>
                  {tt('ยังไม่มีการวินิจฉัย — กด “เพิ่ม” เพื่อค้นรหัส ICD-10')}
                </AppText>
              )}
            </InfoCard>
          </View>
        </View>
      </ScrollView>

      <EditPatientModal visible={editOpen} record={cur} index={state.curIdx} onClose={() => setEditOpen(false)} />
      <AddIcdModal
        visible={icdOpen}
        existingCodes={cur.icd.map(([code]) => code)}
        onClose={() => setIcdOpen(false)}
        onAdd={(code, name, kind) => {
          if (state.curIdx !== null) actions.addIcd(state.curIdx, code, name, kind);
        }}
      />

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
              {tt('ร่างแบบบันทึกถูกเก็บในเครื่องอัตโนมัติ — ยังไม่ส่งขึ้น Cloud จนกว่าจะซิงค์')}
            </AppText>
          </View>
          <View style={{ flex: 1 }} />
          {/* ปุ่มคู่ท้ายบาร์กว้างเท่ากัน 100 ตาม Figma (btn 100x47) */}
          <Button label={tt('ยกเลิก')} variant="outline" onPress={() => actions.setOssTab('list')} style={{ width: 100 }} />
          <Button label={tt('บันทึก')} onPress={actions.saveEncounter} style={{ width: 100 }} />
        </View>
      </View>
    </View>
  );
};
