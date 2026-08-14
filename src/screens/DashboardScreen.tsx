import React, { useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';

import {
  AppText,
  Badge,
  Button,
  DataTable,
  EmptyState,
  KpiCard,
  Pagination,
  WireMesh,
} from '../components';
import type { Column } from '../components';
import { FigmaAssets } from '../assets';
import { DOCTORS, STAGE_META } from '../state/mockData';
import { useApp } from '../state/AppContext';
import type { VisitRecord } from '../state/types';
import { useTheme } from '../theme';
import { greeting, thaiToday } from '../utils/format';

/** เขียวมิ้นต์ของ Figma — ใช้เป็นตัวหนังสือรองบนพื้นเขียวเข้ม และพื้น avatar */
const MINT = '#B7E4C7';

/** การ์ดสรุปงานกะปัจจุบัน (Figma 16:859 · session-tracker · #0B2D22 r24 pad16 gap16) */
const ShiftSummary: React.FC = () => {
  const t = useTheme();
  const { state, derived } = useApp();
  const rows: Array<{ label: string; value: string; color?: string }> = [
    { label: 'ลงทะเบียนสะสม', value: `${state.records.length} ราย` },
    { label: 'รอซิงค์คลาวด์', value: `${derived.pendingCount} ราย`, color: '#F59E0B' },
    { label: 'ซิงค์ผ่านแล้ว', value: `${derived.passCount} ราย` },
    { label: 'ไม่ผ่าน · ต้องแก้ไข', value: `${derived.failCount} ราย`, color: '#FF3B30' },
  ];
  return (
    <View style={{ borderRadius: t.radius.xl, backgroundColor: t.colors.terminalBg, padding: 16, gap: 16 }}>
      <AppText size="md" weight="700" color="#FFFFFF">
        สรุปงานกะปัจจุบัน
      </AppText>
      <View style={{ gap: 12 }}>
        {rows.map((r) => (
          <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText size="sm" color={MINT} style={{ flex: 1 }}>
              {r.label}
            </AppText>
            <AppText size="base" weight="700" mono color={r.color ?? '#FFFFFF'}>
              {r.value}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

/** สถานะห้องปฏิบัติงาน (Figma 16:859 · Frame 33 + user-badge-card) */
const RoomStatus: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={{ borderRadius: t.radius.xl, backgroundColor: c.card, padding: 16, gap: 8 }}>
      <AppText size="md" weight="700">
        สถานะห้องปฏิบัติงาน
      </AppText>
      <View>
        {DOCTORS.map((d, i) => (
          <View
            key={d.name}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 12,
              borderBottomWidth: i === DOCTORS.length - 1 ? 0 : 1,
              borderBottomColor: t.tones.neutral.bg,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: MINT,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText size="md" weight="600" color={c.secondary}>
                {d.name.replace(/^[^.]*\./, '').slice(0, 2)}
              </AppText>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <AppText size="base" weight="500" numberOfLines={1} style={{ flex: 1 }}>
                  {d.name}
                </AppText>
                <Badge
                  label={d.status === 'busy' ? 'กำลังตรวจ' : 'ว่าง'}
                  tone={d.status === 'busy' ? 'info' : 'neutral'}
                  size="sm"
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppText size="sm" weight="600" color={c.primary} mono>
                  {d.room}
                </AppText>
                <AppText size="xs" muted>
                  •
                </AppText>
                <AppText size="sm">{d.roomLabel}</AppText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

/** หน้า 02 — แดชบอร์ดคิววันนี้ (Figma node 16:859) */
export const DashboardScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions, derived } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= 1180;

  /** ขนาดจริงของแบนเนอร์ — ใช้สร้างตาข่ายเส้นให้พอดีกล่อง */
  const [hero, setHero] = useState({ w: 0, h: 0 });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(state.records.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => state.records.slice((safePage - 1) * pageSize, safePage * pageSize),
    [state.records, safePage, pageSize],
  );

  const columns: Array<Column<VisitRecord>> = [
    {
      key: 'queue',
      title: 'คิว',
      width: 96,
      render: (r) => (
        <View style={{ gap: 4 }}>
          <AppText size="base" weight="700" color={c.primary} mono>
            {r.queueNo}
          </AppText>
          <AppText size="sm" muted mono>
            {r.time}
          </AppText>
        </View>
      ),
    },
    {
      key: 'hn',
      title: 'HN',
      width: 88,
      render: (r) => (
        <AppText size="sm" weight="600" mono>
          {r.hn}
        </AppText>
      ),
    },
    {
      key: 'name',
      title: 'ชื่อ-นามสกุล',
      flex: 1.3,
      render: (r) => (
        <View style={{ gap: 4 }}>
          <AppText size="base" weight="600" numberOfLines={1}>
            {r.name}
          </AppText>
          <AppText size="sm" muted>
            {r.age} ปี
          </AppText>
        </View>
      ),
    },
    {
      key: 'allergy',
      title: 'แพ้ยา',
      width: 126,
      render: (r) =>
        r.allergy ? (
          <Badge label={r.allergy} tone="destructive" size="sm" />
        ) : (
          <AppText size="sm" muted>
            –
          </AppText>
        ),
    },
    { key: 'service', title: 'ประเภทรับบริการ', flex: 1, render: (r) => <AppText size="sm">{r.service}</AppText> },
    {
      key: 'room',
      title: 'ห้องตรวจ',
      width: 138,
      render: (r) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AppText size="sm" mono>
            {r.room}
          </AppText>
          <AppText size="xs" muted>
            •
          </AppText>
          <AppText size="sm">ห้องตรวจ</AppText>
        </View>
      ),
    },
    {
      key: 'status',
      title: 'สถานะ',
      width: 130,
      align: 'right',
      render: (r) => <Badge label={STAGE_META[r.stage].label} tone={STAGE_META[r.stage].tone} size="sm" />,
    },
  ];

  /* การ์ดคิว: หัวข้อ + ปุ่มลงทะเบียน · ตาราง · แถบแบ่งหน้า (Figma Frame 32) */
  const queueCard = (
    <View
      style={{
        flex: wide ? 1 : undefined,
        borderRadius: t.radius.xl,
        backgroundColor: c.card,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          flexWrap: 'wrap',
        }}
      >
        <AppText size="md" weight="700" style={{ flex: 1 }}>
          คิวผู้ป่วยวันนี้
        </AppText>
        <Button label="อ่านบัตรประชาชน · ลงทะเบียน" onPress={actions.openReg} />
      </View>

      <DataTable
        columns={columns}
        data={pageRows}
        keyExtractor={(r) => r.hn}
        minWidth={840}
        onRowPress={(_, i) => actions.openEncounter((safePage - 1) * pageSize + i)}
        empty={
          <EmptyState
            icon="card-outline"
            title="ยังไม่มีคิวเช้านี้"
            subtitle="เริ่มรับคนไข้รายแรกด้วยการอ่านบัตรประชาชน"
            actionLabel="อ่านบัตรประชาชน · ลงทะเบียน"
            onAction={actions.openReg}
          />
        }
      />

      {state.records.length > 0 ? (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      ) : null}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* แบนเนอร์ทักทาย + KPI อยู่ในการ์ดเดียวกันตาม Figma (Frame 30) */}
      <View
        style={[
          { borderRadius: t.radius.xl, backgroundColor: c.primaryStrong, padding: 16, gap: 24, overflow: 'hidden' },
          t.shadow.md,
        ]}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          setHero((s) => (Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 1 ? s : { w, h }));
        }}
      >
        {/* ตาข่ายเส้นภูมิประเทศแบบเคลื่อนไหว (แทนภาพ mesh นิ่งของ Figma node 28:9617) */}
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden' }}>
          <WireMesh
            width={hero.w}
            height={hero.h}
            color={MINT}
            opacity={0.28}
            fade="up"
            reduceMotion={t.reduceMotion}
          />
        </View>
        <View style={{ gap: 8, zIndex: 1 }}>
          <AppText size="base" weight="600" color="#FFFFFF">
            {thaiToday()}
          </AppText>
          <AppText size="xxl" weight="700" color="#FFFFFF">
            {greeting()}, {state.userName}
          </AppText>
          <AppText size="base" color={MINT}>
            {state.facility.name} • สาขา {state.branch} • ประจำ {state.room}
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, zIndex: 1 }}>
          <KpiCard label="รอตรวจ" value={derived.waitCount} accent={t.kpi.wait} image={FigmaAssets.kpiWait} caption="คิวหนาแน่นปานกลาง" />
          <KpiCard label="กำลังตรวจ" value={derived.examCount} accent={t.kpi.progress} image={FigmaAssets.kpiExam} caption="คัดกรองเบื้องต้น" />
          <KpiCard label="เสร็จสิ้น" value={derived.doneCount} accent={t.kpi.done} image={FigmaAssets.kpiDone} caption="จ่ายยาและกลับบ้านแล้ว" />
          <KpiCard label="รอผล Lab" value={derived.labCount} accent={t.kpi.lab} image={FigmaAssets.kpiLab} caption="แล็บเคมีคลินิก" />
          <KpiCard
            label="เวลารอเฉลี่ย"
            value={state.records.length ? 18 : 0}
            unit="นาที"
            accent={t.kpi.neutral}
            image={FigmaAssets.kpiAvg}
            caption="เป้าหมายต่ำกว่า 20 นาที"
          />
        </View>
      </View>

      {/* คิว + คอลัมน์ขวา (Figma Frame 31 — ขวากว้าง 282) */}
      {wide ? (
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
          {queueCard}
          <View style={{ width: 282, gap: 16 }}>
            <RoomStatus />
            <ShiftSummary />
          </View>
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {queueCard}
          <RoomStatus />
          <ShiftSummary />
        </View>
      )}
    </ScrollView>
  );
};
