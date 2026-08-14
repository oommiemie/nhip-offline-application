import React, { useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AppText,
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  SelectField,
  TextField,
} from '../components';
import type { Column } from '../components';
import { STAGE_META } from '../state/mockData';
import { useApp } from '../state/AppContext';
import type { VisitRecord } from '../state/types';
import { useTheme } from '../theme';

/** ชิปสรุปขั้นตอนบริการ 6 ขั้น (1·ลงทะเบียน ▸ … ▸ 6·เสร็จสิ้น) */
const FlowChips: React.FC = () => {
  const t = useTheme();
  const { state, derived } = useApp();
  const rs = state.records;
  const steps: Array<[string, number, boolean]> = [
    ['1 · ลงทะเบียน', rs.length, true],
    ['2 · ซักประวัติ', rs.filter((r) => r.fHist).length, false],
    ['3 · ตรวจรักษา', rs.filter((r) => r.icd.length > 0).length, false],
    ['4 · Lab', rs.filter((r) => r.fLab || r.fXray).length, false],
    ['5 · รับยา', rs.filter((r) => r.fDrug).length, false],
    ['6 · เสร็จสิ้น', derived.doneCount, false],
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, alignItems: 'center' }}>
      <AppText size="xs" muted style={{ marginRight: 4 }}>
        ขั้นตอนบริการ
      </AppText>
      {steps.map(([label, n, primary], i) => (
        <React.Fragment key={label}>
          {i > 0 ? <Ionicons name="chevron-forward" size={12} color={t.colors.mutedForeground} /> : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              height: 28,
              paddingHorizontal: 11,
              borderRadius: t.radius.pill,
              backgroundColor: primary ? t.colors.primary : t.colors.card,
              borderWidth: 1,
              borderColor: primary ? t.colors.primary : t.colors.border,
            }}
          >
            <AppText size="xs" weight={primary ? '600' : '400'} color={primary ? t.colors.primaryForeground : t.colors.foreground}>
              {label}
            </AppText>
            <AppText size="xs" weight="600" mono color={primary ? t.colors.primaryForeground : t.colors.mutedForeground}>
              {n}
            </AppText>
          </View>
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

/** หน้า 03 — One Stop Service · รายการรับบริการ */
export const PatientListScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= 980;

  const [qId, setQId] = useState('');
  const [qName, setQName] = useState('');
  const [right, setRight] = useState('ทั้งหมด');
  const [village, setVillage] = useState('ทั้งหมด');
  const [lastVisit, setLastVisit] = useState('ไม่จำกัด');

  const filtered = useMemo(() => {
    return state.records
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => {
        if (qId && !(r.hn.includes(qId) || r.cid.replace(/-/g, '').includes(qId.replace(/-/g, '')))) return false;
        if (qName && !r.name.includes(qName)) return false;
        if (right !== 'ทั้งหมด' && r.right !== right) return false;
        return true;
      });
  }, [state.records, qId, qName, right]);

  const columns: Array<Column<{ r: VisitRecord; i: number }>> = [
    { key: 'hn', title: 'HN', width: 92, render: ({ r }) => <AppText size="sm" mono>{r.hn}</AppText> },
    {
      key: 'name',
      title: 'ชื่อ-นามสกุล',
      flex: 1.4,
      render: ({ r }) => (
        <AppText size="sm" weight="600" numberOfLines={1}>
          {r.name}
        </AppText>
      ),
    },
    { key: 'sex', title: 'เพศ', width: 52, render: ({ r }) => <AppText size="sm">{r.sex === 'หญิง' ? 'ญ' : 'ช'}</AppText> },
    { key: 'age', title: 'อายุ', width: 56, align: 'right', render: ({ r }) => <AppText size="sm" mono>{r.age}</AppText> },
    { key: 'cid', title: 'เลขบัตรประชาชน', width: 152, render: ({ r }) => <AppText size="xs" mono>{r.cid}</AppText> },
    { key: 'right', title: 'สิทธิ์', width: 116, render: ({ r }) => <AppText size="sm" numberOfLines={1}>{r.right}</AppText> },
    { key: 'chronic', title: 'โรคประจำตัว', width: 128, render: ({ r }) => <AppText size="sm" numberOfLines={1}>{r.chronic}</AppText> },
    {
      key: 'allergy',
      title: 'แพ้ยา',
      width: 116,
      render: ({ r }) =>
        r.allergy ? <Badge label={r.allergy} tone="destructive" size="sm" /> : <AppText size="sm" muted>–</AppText>,
    },
    { key: 'time', title: 'มาล่าสุด', width: 76, align: 'right', render: ({ r }) => <AppText size="sm" mono>{r.time}</AppText> },
    {
      key: 'status',
      title: 'สถานะ',
      width: 122,
      render: ({ r }) => <Badge label={STAGE_META[r.stage].label} tone={STAGE_META[r.stage].tone} size="sm" />,
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 240, gap: 2 }}>
          <AppText size="xl" weight="700">
            รายการรับบริการวันนี้
          </AppText>
          <AppText size="xs" muted>
            {state.records.length} ราย · ข้อมูลเก็บในเครื่องแบบเข้ารหัส ไม่แสดงข้อมูลย้อนหลังจากเครื่องอื่น
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            label="ล้างตัวกรอง"
            variant="outline"
            size="sm"
            onPress={() => {
              setQId('');
              setQName('');
              setRight('ทั้งหมด');
              setVillage('ทั้งหมด');
              setLastVisit('ไม่จำกัด');
            }}
          />
          <Button label="อ่านบัตรประชาชน · ลงทะเบียน" size="sm" onPress={actions.openReg} />
        </View>
      </View>

      <FlowChips />

      {/* ตัวกรอง */}
      <Card rounded="xl" padded={14}>
        <View style={{ flexDirection: wide ? 'row' : 'column', gap: 10 }}>
          <TextField
            label="HN / เลขบัตรประชาชน"
            value={qId}
            onChangeText={setQId}
            placeholder="พิมพ์หรือสแกนบัตร"
            mono
            containerStyle={{ flex: 1.1 }}
          />
          <TextField
            label="ชื่อ / นามสกุล"
            value={qName}
            onChangeText={setQName}
            placeholder="เช่น สมพร แก้วใส"
            containerStyle={{ flex: 1.1 }}
          />
          <SelectField
            label="สิทธิ์การรักษา"
            value={right}
            options={['ทั้งหมด', 'บัตรทอง (UC)', 'ประกันสังคม', 'ข้าราชการ', 'ชำระเงินเอง']}
            onChange={setRight}
            containerStyle={{ flex: 1 }}
          />
          <SelectField
            label="หมู่บ้าน / เขตรับผิดชอบ"
            value={village}
            options={['ทั้งหมด', 'ม.1 บ้านโนนสูง', 'ม.4 บ้านหนองแวง']}
            onChange={setVillage}
            containerStyle={{ flex: 1 }}
          />
          <SelectField
            label="มารับบริการล่าสุด"
            value={lastVisit}
            options={['ไม่จำกัด', 'ภายใน 30 วัน', 'ภายใน 1 ปี']}
            onChange={setLastVisit}
            containerStyle={{ flex: 1 }}
          />
        </View>
      </Card>

      {/* ตาราง */}
      <Card rounded="xl" padded={0}>
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={({ r }) => r.hn}
          minWidth={1030}
          selectedIndex={state.curIdx !== null ? filtered.findIndex((x) => x.i === state.curIdx) : null}
          onRowPress={({ i }) => actions.openEncounter(i)}
          empty={
            <EmptyState
              icon="card-outline"
              title="เริ่มเวรกะนี้ใหม่ — ยังไม่มีรายการรับบริการ"
              subtitle="อ่านบัตรประชาชนเพื่อเปิดคิวคนไข้รายแรก หรือปรับตัวกรองการค้นหา"
              actionLabel="อ่านบัตรประชาชน · ลงทะเบียนคนไข้"
              onAction={actions.openReg}
            />
          }
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderTopWidth: 1,
            borderTopColor: c.border,
            backgroundColor: c.surface2,
            gap: 10,
          }}
        >
          <AppText size="xs" muted>
            {state.curIdx !== null ? 'เลือกอยู่ 1 รายการ' : 'แตะรายการเพื่อเปิดหน้าตรวจรักษา'}
          </AppText>
          <View style={{ flex: 1 }} />
          <AppText size="xs" mono muted>
            แสดง {filtered.length} / {state.records.length} รายการ
          </AppText>
        </View>
      </Card>
    </ScrollView>
  );
};
