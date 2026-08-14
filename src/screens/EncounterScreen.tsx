import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';

import {
  AlertBand,
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  SectionCard,
  TextField,
} from '../components';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';

const vitalOf = (vitals: Array<[string, string]>, key: string): string =>
  vitals.find(([k]) => k === key)?.[1] ?? '';

/** หน้า 04 — ซักประวัติ / ตรวจรักษา (encounter) */
export const EncounterScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions, derived } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= 1140;
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

  // เปลี่ยนคนไข้ → โหลดค่าจาก record ใหม่
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

  const sideColumn = (
    <View style={{ gap: 12, width: wide ? 300 : undefined }}>
      <SectionCard title="ประวัติการมารับบริการ" bodyPadding={12} rounded="lg">
        <View style={{ gap: 8 }}>
          <AppText size="xs" muted>
            โหมดออฟไลน์ — ประวัติจากเครื่องอื่นจะดึงจาก Cloud เมื่อออนไลน์
          </AppText>
          <Button label="เปิดประวัติเดิมในเครื่อง" variant="outline" size="sm" onPress={() => actions.setHistoryOpen(true)} />
        </View>
      </SectionCard>
      <SectionCard title="ยาที่ใช้อยู่" bodyPadding={12} rounded="lg">
        <View style={{ gap: 5 }}>
          {cur.drugs.length ? (
            cur.drugs.map((d) => (
              <AppText key={d} size="sm">
                • {d}
              </AppText>
            ))
          ) : (
            <AppText size="sm" muted>
              ไม่มีรายการยาเดิมในเครื่อง · ดึงจาก Cloud เมื่อออนไลน์
            </AppText>
          )}
        </View>
      </SectionCard>
      <Card rounded="lg" padded={12} shadow="none" style={{ backgroundColor: t.tones.warning.bg, borderColor: t.tones.warning.border }}>
        <AppText size="sm" color={t.tones.warning.fg}>
          ⚠ ยังไม่บันทึกผลคัดกรอง 2Q/9Q ของปีนี้ — เปิดแท็บ “คัดกรอง NCD” เพื่อบันทึก
        </AppText>
      </Card>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* หัวคนไข้ */}
      <View style={{ backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, flexWrap: 'wrap' }}>
          <AppText size="lg" weight="700">
            {cur.name}
          </AppText>
          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: c.muted }}>
            <AppText size="xs" weight="600" mono>
              HN {cur.hn}
            </AppText>
          </View>
          <AppText size="sm" muted>
            {cur.sex} · {cur.age} ปี · เกิด {cur.dob}
          </AppText>
          <AppText size="sm">
            สิทธิ์ <AppText size="sm" weight="600">{cur.right}</AppText>
          </AppText>
          <AppText size="sm" muted numberOfLines={1} style={{ flexShrink: 1 }}>
            {cur.address}
          </AppText>
          <View style={{ flex: 1 }} />
          <Button label="ประวัติเดิม" variant="outline" size="sm" onPress={() => actions.setHistoryOpen(true)} />
        </View>
        {cur.allergy ? (
          <AlertBand
            variant="danger"
            title={`แพ้ยา ${cur.allergy}`}
            detail="ข้อมูลจากบัตรประชาชน/Cloud — ยืนยันกับผู้ป่วยซ้ำก่อนสั่งยา"
          />
        ) : (
          <AlertBand variant="caution" title="ยังไม่มีประวัติแพ้ยาในเครื่องนี้" detail="สอบถามและบันทึกซ้ำทุกครั้งที่รับบริการ" />
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={wide ? { flexDirection: 'row', gap: 12, alignItems: 'flex-start' } : { gap: 12 }}>
          <View style={{ flex: 1, gap: 12 }}>
            {/* สัญญาณชีพ */}
            <SectionCard title="สัญญาณชีพ" caption={`ผู้บันทึก ${state.userName}`}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                <View style={{ minWidth: 210, flex: 1.4, gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c.destructive }} />
                    <AppText size="sm" weight="600">
                      ความดันโลหิต (mmHg)
                    </AppText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TextField value={sys} onChangeText={setSys} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ flex: 1 }} />
                    <AppText size="lg" muted>
                      /
                    </AppText>
                    <TextField value={dia} onChangeText={setDia} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ flex: 1 }} />
                  </View>
                  <AppText size="xs" color={bpHigh ? c.destructive : c.mutedForeground}>
                    {bpHigh ? '⚠ เกินเกณฑ์เตือนความดันสูง ≥ 140/90' : 'เกณฑ์เตือนอัตโนมัติ ≥ 140/90'}
                  </AppText>
                </View>
                <TextField label="ชีพจร (/นาที)" value={pulse} onChangeText={setPulse} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ minWidth: 120, flex: 1 }} />
                <TextField label="หายใจ (/นาที)" value={resp} onChangeText={setResp} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ minWidth: 120, flex: 1 }} />
                <TextField label="อุณหภูมิ (°C)" value={temp} onChangeText={setTemp} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ minWidth: 120, flex: 1 }} />
                <TextField label="SpO₂ (%)" value={spo2} onChangeText={setSpo2} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ minWidth: 110, flex: 1 }} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                <TextField label="น้ำหนัก (กก.)" value={weight} onChangeText={setWeight} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ minWidth: 120, flex: 1 }} />
                <TextField label="ส่วนสูง (ซม.)" value={height} onChangeText={setHeight} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ minWidth: 120, flex: 1 }} />
                <TextField label="BMI (คำนวณ)" value={bmi} readonly placeholder="—" mono alignRight containerStyle={{ minWidth: 120, flex: 1 }} />
                <TextField label="รอบเอว (ซม.)" value={waist} onChangeText={setWaist} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ minWidth: 120, flex: 1 }} />
                <TextField label="DTX (mg/dL)" value={dtx} onChangeText={setDtx} placeholder="—" mono alignRight keyboardType="numeric" containerStyle={{ minWidth: 120, flex: 1 }} />
              </View>
            </SectionCard>

            {/* ซักประวัติ */}
            <SectionCard title="ซักประวัติ">
              <View style={{ gap: 10 }}>
                <TextField label="อาการสำคัญ (CC)" required value={cc} onChangeText={setCc} placeholder="พิมพ์อาการสำคัญ" />
                <TextField label="ประวัติปัจจุบัน (HPI)" value={hpi} onChangeText={setHpi} placeholder="พิมพ์ประวัติปัจจุบัน" multiline />
                <View style={{ flexDirection: wide ? 'row' : 'column', gap: 10 }}>
                  <TextField label="ตรวจร่างกาย (PE)" value={pe} onChangeText={setPe} placeholder="ผลการตรวจร่างกาย" multiline containerStyle={{ flex: 1 }} />
                  <TextField label="แผนการรักษา / คำแนะนำ" value={plan} onChangeText={setPlan} placeholder="แผนการรักษาและคำแนะนำ" multiline containerStyle={{ flex: 1 }} />
                </View>
              </View>
            </SectionCard>

            {/* วินิจฉัย */}
            <SectionCard
              title="การวินิจฉัย (ICD-10)"
              right={<Button label="+ เพิ่ม ICD-10" variant="outline" size="sm" onPress={() => {}} />}
              bodyPadding={10}
            >
              <View style={{ gap: 6 }}>
                {cur.icd.length ? (
                  cur.icd.map(([code, name, kind]) => (
                    <View
                      key={code}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: t.radius.md,
                        backgroundColor: c.surface2,
                      }}
                    >
                      <AppText size="sm" weight="700" mono color={c.primary} style={{ minWidth: 64 }}>
                        {code}
                      </AppText>
                      <AppText size="sm" style={{ flex: 1 }} numberOfLines={1}>
                        {name}
                      </AppText>
                      <Badge label={kind} tone={kind === 'หลัก' ? 'primary' : 'neutral'} size="sm" />
                    </View>
                  ))
                ) : (
                  <AppText size="sm" muted center style={{ paddingVertical: 12 }}>
                    ยังไม่มีการวินิจฉัย — กด “+ เพิ่ม ICD-10” หรือพิมพ์รหัสเพื่อค้นหา
                  </AppText>
                )}
              </View>
            </SectionCard>
          </View>

          {sideColumn}
        </View>
      </ScrollView>

      {/* แถบปุ่มล่าง */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: c.border,
          backgroundColor: c.surface2,
        }}
      >
        <AppText size="xs" muted style={{ flex: 1 }} numberOfLines={2}>
          ● ร่างแบบบันทึกถูกเก็บในเครื่องอัตโนมัติ — ยังไม่ส่งขึ้น Cloud จนกว่าจะซิงค์
        </AppText>
        <Button label="ยกเลิก" variant="ghost" size="sm" onPress={() => actions.setOssTab('list')} />
        <Button label="ส่งต่อ Lab" variant="outline" size="sm" onPress={() => {}} />
        <Button label="บันทึกและจบการตรวจ" size="sm" onPress={actions.saveEncounter} />
      </View>
    </View>
  );
};
