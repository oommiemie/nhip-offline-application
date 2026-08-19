import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
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
} from '../components';
import type { Column } from '../components';
import { STAGE_META } from '../state/mockData';
import { useApp } from '../state/AppContext';
import type { QueueStage, VisitRecord } from '../state/types';
import { useTheme } from '../theme';
import { initials } from '../utils/format';

type StageFilter = 'all' | QueueStage;

/** หน้า 03 — One Stop Service · รายการรับบริการ (ค้นหา → กรองสถานะ → เปิดบันทึก) */
export const PatientListScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= 980;

  const [q, setQ] = useState('');
  const [stage, setStage] = useState<StageFilter>('all');

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
        return true;
      });
  }, [state.records, q, stage]);

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
  }, [q, stage]);

  const countOf = (s: StageFilter) =>
    s === 'all' ? state.records.length : state.records.filter((r) => r.stage === s).length;

  // dropdown กรองสถานะ — ป้ายมีจำนวนต่อท้าย เช่น "รอเรียกตรวจ (8)" · แปลงกลับเป็นค่าได้จากตาราง
  const stageItems: Array<[StageFilter, string]> = [
    ['all', `ทั้งหมด (${countOf('all')})`],
    ['wait', `${STAGE_META.wait.label} (${countOf('wait')})`],
    ['screen', `${STAGE_META.screen.label} (${countOf('screen')})`],
    ['pending', `${STAGE_META.pending.label} (${countOf('pending')})`],
    ['lab', `${STAGE_META.lab.label} (${countOf('lab')})`],
    ['done', `${STAGE_META.done.label} (${countOf('done')})`],
  ];
  const stageLabel = stageItems.find(([id]) => id === stage)?.[1] ?? stageItems[0][1];

  const columns: Array<Column<{ r: VisitRecord; i: number }>> = [
    {
      key: 'patient',
      title: 'ผู้ป่วย',
      flex: 1.6,
      render: ({ r }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          {/* อวาตาร์โทนมิ้นต์เดียวกันทั้งตาราง — สถานะดูที่คอลัมน์ badge อยู่แล้ว */}
          <Avatar label={initials(r.name)} size={34} />
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
      {/* แผงควบคุมงานประจำวัน — ค้นหา · dropdown กรองสถานะ · รับคนใหม่ จบในแถวเดียว */}
      <Card rounded="xl" padded={0} shadow="md" style={{ borderWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, flexWrap: 'wrap' }}>
          <TextField
            value={q}
            onChangeText={setQ}
            placeholder="ค้นหา HN · เลขบัตรประชาชน · ชื่อ-นามสกุล"
            icon="search-outline"
            containerStyle={{ flex: 1, minWidth: 240, maxWidth: 460 }}
          />
          <SelectField
            value={stageLabel}
            options={stageItems.map(([, label]) => label)}
            onChange={(v) => setStage(stageItems.find(([, label]) => label === v)?.[0] ?? 'all')}
            containerStyle={{ width: 210 }}
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
      </Card>

      <Card rounded="xl" padded={0} shadow="md" style={{ borderWidth: 0 }}>
        {/* หัวตารางแบบหน้าหลัก: ชื่อ + จำนวนราย (ไม่มีเส้นคั่น — แถบหัวคอลัมน์สีเทาคั่นให้เอง) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
          <AppText size="md" weight="700" style={{ flex: 1 }}>
            รายการรับบริการวันนี้
          </AppText>
          <AppText size="sm" muted mono>
            {filtered.length} ราย
          </AppText>
        </View>
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
