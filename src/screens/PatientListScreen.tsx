import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AnimatedPressable,
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Pagination,
  SelectField,
  TextField,
  usePressScale,
  webFocusRing,
} from '../components';
import type { Column } from '../components';
import { STAGE_META } from '../state/mockData';
import { useApp } from '../state/AppContext';
import type { QueueStage, VisitRecord } from '../state/types';
import { useTheme, withAlpha } from '../theme';
import { initials } from '../utils/format';

type StageFilter = 'all' | QueueStage;

/** ชิปกรองสถานะคิว — พื้นสีอ่อนของสถานะ กดแล้วพื้นเต็มสีตัวอักษรขาว */
const StageChip: React.FC<{
  label: string;
  count: number;
  active: boolean;
  tone: string;
  onPress: () => void;
}> = ({ label, count, active, tone, onPress }) => {
  const t = useTheme();
  const c = t.colors;
  const press = usePressScale(0.95);
  return (
    <AnimatedPressable
      {...press.handlers}
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          height: 38,
          paddingHorizontal: 14,
          borderRadius: t.radius.pill,
          borderWidth: 1,
          borderColor: active ? tone : withAlpha(tone, 0.22),
          backgroundColor: active ? tone : withAlpha(tone, 0.07),
        },
        press.pressStyle,
        webFocusRing(c.ring),
      ]}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: active ? '#FFFFFF' : tone }} />
      <AppText size="sm" weight={active ? '700' : '500'} color={active ? '#FFFFFF' : c.foreground}>
        {label}
      </AppText>
      <AppText size="sm" weight="700" mono color={active ? '#FFFFFF' : tone}>
        {count}
      </AppText>
    </AnimatedPressable>
  );
};

/** หน้า 03 — One Stop Service · รายการรับบริการ (ค้นหา → กรองสถานะ → เปิดบันทึก) */
export const PatientListScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= 980;

  const [q, setQ] = useState('');
  const [stage, setStage] = useState<StageFilter>('all');
  const [more, setMore] = useState(false);
  const [right, setRight] = useState('ทั้งหมด');
  const [village, setVillage] = useState('ทั้งหมด');
  const [lastVisit, setLastVisit] = useState('ไม่จำกัด');

  /** ช่องเดียวค้นได้ทั้ง HN · เลขบัตร · ชื่อ — เจ้าหน้าที่ไม่ต้องเลือกก่อนว่าจะค้นด้วยอะไร */
  const filtered = useMemo(() => {
    const key = q.trim();
    const digits = key.replace(/\D/g, '');
    return state.records
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => {
        if (key) {
          const hit =
            r.name.includes(key) ||
            r.hn.includes(digits) ||
            (digits.length >= 4 && r.cid.replace(/-/g, '').includes(digits));
          if (!hit) return false;
        }
        if (stage !== 'all' && r.stage !== stage) return false;
        if (right !== 'ทั้งหมด' && r.right !== right) return false;
        return true;
      });
  }, [state.records, q, stage, right]);

  // แบ่งหน้า — index ที่ใช้เปิดหน้าตรวจติดมากับแต่ละแถวอยู่แล้ว (x.i) จึงไม่ต้องบวก offset
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );
  // เปลี่ยนคำค้น/ตัวกรองแล้วต้องกลับไปหน้าแรกเสมอ ไม่งั้นจะเห็นหน้าว่าง
  useEffect(() => {
    setPage(1);
  }, [q, stage, right]);

  /** สีประจำสถานะคิว — ใช้ทั้งแถบซ้ายของแถว วงอักษรย่อ และชิปกรอง */
  const stageColor = (st: QueueStage) => t.tones[STAGE_META[st].tone].fg;

  const countOf = (s: StageFilter) =>
    s === 'all' ? state.records.length : state.records.filter((r) => r.stage === s).length;

  // ครบทุกสถานะที่คิวเป็นไปได้ — ไม่มีคนไข้ตกหล่นจากตัวกรอง
  const stageChips: Array<[StageFilter, string, string]> = [
    ['all', 'ทั้งหมด', c.primary],
    ['wait', STAGE_META.wait.label, t.tones.warning.fg],
    ['screen', STAGE_META.screen.label, t.tones.info.fg],
    ['pending', STAGE_META.pending.label, t.tones.warning.fg],
    ['lab', STAGE_META.lab.label, t.tones.purple.fg],
    ['done', STAGE_META.done.label, t.tones.success.fg],
  ];

  const columns: Array<Column<{ r: VisitRecord; i: number }>> = [
    {
      key: 'patient',
      title: 'ผู้ป่วย',
      flex: 1.6,
      render: ({ r }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          {/* แถบสีบอกสถานะคิว — กวาดตาลงคอลัมน์เดียวก็รู้ว่างานอยู่ขั้นไหน */}
          <View style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: stageColor(r.stage) }} />
          <Avatar
            label={initials(r.name)}
            size={34}
            bg={withAlpha(stageColor(r.stage), 0.14)}
            fg={stageColor(r.stage)}
          />
          <View style={{ gap: 1, flex: 1 }}>
            <AppText size="sm" weight="700" numberOfLines={1}>
              {r.name}
            </AppText>
            <AppText size="xs" muted numberOfLines={1}>
              HN <AppText size="xs" mono muted>{r.hn}</AppText> · {r.sex} {r.age} ปี · {r.right}
            </AppText>
          </View>
        </View>
      ),
    },
    {
      key: 'warn',
      title: 'ข้อควรระวัง',
      width: 190,
      // แสดงเฉพาะเมื่อมีข้อมูลจริง — แถวที่ไม่มีอะไรต้องระวังปล่อยว่างไว้ให้สายตาพัก
      render: ({ r }) => {
        const chronic = r.chronic && r.chronic !== '—' ? r.chronic : '';
        if (!r.allergy && !chronic) {
          return (
            <AppText size="sm" muted>
              –
            </AppText>
          );
        }
        return (
          <View style={{ gap: 3 }}>
            {r.allergy ? <Badge label={`แพ้ ${r.allergy}`} tone="destructive" size="sm" /> : null}
            {chronic ? (
              <AppText size="xs" muted numberOfLines={1}>
                โรคประจำตัว {chronic}
              </AppText>
            ) : null}
          </View>
        );
      },
    },
    {
      key: 'time',
      title: 'มาถึง',
      width: 76,
      align: 'right',
      render: ({ r }) => (
        <AppText size="sm" mono>
          {r.time}
        </AppText>
      ),
    },
    {
      key: 'status',
      title: 'สถานะ',
      width: 128,
      render: ({ r }) => <Badge label={STAGE_META[r.stage].label} tone={STAGE_META[r.stage].tone} size="sm" />,
    },
    {
      key: 'go',
      title: '',
      width: 132,
      align: 'right',
      render: ({ i }) => (
        <Button
          label="เปิดบันทึก"
          variant="outline"
          size="sm"
          iconRight={<Ionicons name="chevron-forward" size={14} color={c.primary} />}
          onPress={() => actions.openEncounter(i)}
        />
      ),
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* แผงควบคุมงานประจำวัน — ค้นหา · กรอง · รับคนใหม่ รวมอยู่ในกล่องเดียว */}
      <Card rounded="xl" padded={0}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, flexWrap: 'wrap' }}>
          <TextField
            value={q}
            onChangeText={setQ}
            placeholder="ค้นหา HN · เลขบัตรประชาชน · ชื่อ-นามสกุล"
            icon="search-outline"
            containerStyle={{ flex: 1, minWidth: 240, maxWidth: 460 }}
          />
          <Button
            label={more ? 'ซ่อนตัวกรอง' : 'ตัวกรอง'}
            variant={more ? 'subtle' : 'outline'}
            icon={<Ionicons name="options-outline" size={16} color={more ? c.foreground : c.primary} />}
            onPress={() => setMore((v) => !v)}
          />
          <View style={{ flex: 1, minWidth: 4 }} />
          <AppText size="xs" mono muted>
            แสดง {filtered.length} / {state.records.length} ราย
          </AppText>
          <Button
            label="ลงทะเบียนคนไข้ใหม่"
            icon={<Ionicons name="card-outline" size={16} color={c.primaryForeground} />}
            onPress={actions.openReg}
          />
        </View>

        {more ? (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            <View style={{ flexDirection: wide ? 'row' : 'column', gap: 10 }}>
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
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingHorizontal: 14, paddingBottom: 14 }}>
          {stageChips.map(([id, label, tone]) => (
            <StageChip
              key={id}
              label={label}
              count={countOf(id)}
              tone={tone}
              active={stage === id}
              onPress={() => setStage(id)}
            />
          ))}
        </View>
      </Card>

      <Card rounded="xl" padded={0}>
        <DataTable
          columns={columns}
          data={pageRows}
          keyExtractor={({ r }) => r.hn}
          minWidth={860}
          selectedIndex={state.curIdx !== null ? pageRows.findIndex((x) => x.i === state.curIdx) : null}
          onRowPress={({ i }) => actions.openEncounter(i)}
          empty={
            <EmptyState
              icon="card-outline"
              title={q || stage !== 'all' ? 'ไม่พบคนไข้ตามเงื่อนไขที่ค้น' : 'ยังไม่มีรายการรับบริการในกะนี้'}
              subtitle={
                q || stage !== 'all'
                  ? 'ลองล้างคำค้นหรือเลือกสถานะ “ทั้งหมด”'
                  : 'อ่านบัตรประชาชนเพื่อเปิดคิวคนไข้รายแรกของวัน'
              }
              actionLabel={q || stage !== 'all' ? 'ล้างการค้นหา' : 'อ่านบัตรประชาชน · ลงทะเบียน'}
              onAction={
                q || stage !== 'all'
                  ? () => {
                      setQ('');
                      setStage('all');
                    }
                  : actions.openReg
              }
            />
          }
        />
        {filtered.length ? (
          <View style={{ borderTopWidth: 1, borderTopColor: c.border }}>
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />
          </View>
        ) : null}
      </Card>
    </ScrollView>
  );
};
