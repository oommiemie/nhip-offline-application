import React, { useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AppText,
  Badge,
  Button,
  DataTable,
  EmptyState,
  KpiCard,
  StatusDot,
  Pagination,
  Snowfall,
  WireMesh,
} from '../components';
import type { Column } from '../components';
import { FigmaAssets } from '../assets';
import { DOCTORS, STAGE_META, roomLabel } from '../state/mockData';
import { useApp } from '../state/AppContext';
import type { VisitRecord } from '../state/types';
import { useTheme, withAlpha } from '../theme';
import { greeting, thaiToday } from '../utils/format';

/** เขียวมิ้นต์ของ Figma — ใช้เป็นตัวหนังสือรองบนพื้นเขียวเข้ม และพื้น avatar */
const MINT = '#B7E4C7';
/** ครีมเทียน — ข้อความรองบนพื้นเข้มของธีมเทศกาล (มิ้นต์จะขัดกับพื้นแดง) */
const FESTIVE_INK = '#F1E4C5';

/** การ์ดสรุปงานกะปัจจุบัน (Figma 16:859 · session-tracker · #0B2D22 r24 pad16 gap16) */
const ShiftSummary: React.FC = () => {
  const t = useTheme();
  const { state, derived } = useApp();
  const rows: Array<{ label: string; value: string; color?: string }> = [
    { label: 'ลงทะเบียนสะสม', value: `${state.records.length} ราย` },
    { label: 'รอซิงค์คลาวด์', value: `${derived.pendingCount} ราย`, color: t.festive ? t.festive.goldLight : '#F59E0B' },
    { label: 'ซิงค์ผ่านแล้ว', value: `${derived.passCount} ราย` },
    { label: 'ไม่ผ่าน · ต้องแก้ไข', value: `${derived.failCount} ราย`, color: t.festive ? t.colors.terminalErr : '#FF3B30' },
  ];
  return (
    <View style={[{ borderRadius: t.radius.xl, backgroundColor: t.colors.terminalBg, padding: 16, gap: 16 }, t.shadow.md]}>
      <AppText size="md" weight="700" color="#FFFFFF">
        สรุปงานกะปัจจุบัน
      </AppText>
      <View style={{ gap: 12 }}>
        {rows.map((r) => (
          <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText size="sm" color={t.festive ? FESTIVE_INK : MINT} style={{ flex: 1 }}>
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
    <View style={[{ borderRadius: t.radius.xl, backgroundColor: c.card, padding: 16, gap: 4 }, t.shadow.md]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {t.festive ? <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: t.colors.accent }} /> : null}
        <AppText size="md" weight="700" style={{ flex: 1 }}>
          สถานะห้องปฏิบัติงาน
        </AppText>
        <AppText size="xs" muted mono>
          {DOCTORS.filter((d) => d.status === 'busy').length}/{DOCTORS.length} ห้อง
        </AppText>
      </View>
      {/* 16 ห้องยาวเกินกว่าจะโชว์หมด — เลื่อนในการ์ด ไม่ดันการ์ดสรุปกะลงไปไกล */}
      <ScrollView style={{ maxHeight: 296 }} showsVerticalScrollIndicator={false}>
        {DOCTORS.map((d, i) => (
          <View
            key={d.name}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 9,
              borderBottomWidth: i === DOCTORS.length - 1 ? 0 : 1,
              borderBottomColor: t.tones.neutral.bg,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: MINT,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText size="sm" weight="600" color={c.secondary}>
                {d.name.replace(/^[^.]*\./, '').slice(0, 2)}
              </AppText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText size="sm" weight="600" numberOfLines={1}>
                {d.name}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText size="xs" weight="600" color={c.primary} mono>
                  {d.room}
                </AppText>
                <AppText size="xs" muted>
                  ·
                </AppText>
                <AppText size="xs" muted numberOfLines={1}>
                  {d.roomLabel}
                </AppText>
              </View>
            </View>
            {/* จุดสี + ข้อความ แทนป้ายทึบ — 3 ใน 4 แถวสถานะเดียวกัน ป้ายเต็มใบเลยดังเกินจำเป็น */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <StatusDot color={d.status === 'busy' ? c.info : c.mutedForeground} size={7} />
              <AppText size="xs" weight="600" color={d.status === 'busy' ? c.info : c.mutedForeground}>
                {d.status === 'busy' ? 'กำลังตรวจ' : 'ว่าง'}
              </AppText>
            </View>
          </View>
        ))}
      </ScrollView>
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
  /** ธีม Christmas: แบนเนอร์โทนแดง + หิมะตกแทนตาข่าย */
  const xmas = t.festival === 'christmas';

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
      // จุดยึดสายตาฝั่งซ้าย — เลขคิวคือสิ่งที่เจ้าหน้าที่ใช้เรียกจริง เลยทำเป็นชิปให้เด่นกว่าคอลัมน์อื่น
      key: 'queue',
      title: 'คิว',
      width: 92,
      render: (r) => (
        <View style={{ gap: 3 }}>
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: t.radius.sm,
              backgroundColor: t.tones.primary.bg,
            }}
          >
            <AppText size="sm" weight="700" mono color={t.tones.primary.fg}>
              {r.queueNo}
            </AppText>
          </View>
          <AppText size="xs" muted mono>
            {r.time}
          </AppText>
        </View>
      ),
    },
    {
      key: 'hn',
      title: 'HN',
      width: 84,
      render: (r) => (
        <AppText size="sm" muted mono>
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
    { key: 'service', title: 'ประเภทรับบริการ', flex: 1.1, render: (r) => <AppText size="sm">{r.service}</AppText> },
    {
      // รหัสห้องเป็นตัวนำ ชื่อห้องเป็นบรรทัดรอง — เข้าชุดกับคอลัมน์คิวและชื่อ
      key: 'room',
      title: 'ห้องตรวจ',
      width: 124,
      render: (r) => (
        <View style={{ gap: 3 }}>
          <AppText size="sm" weight="600" mono>
            {r.room}
          </AppText>
          <AppText size="xs" muted numberOfLines={1}>
            {roomLabel(r.room)}
          </AppText>
        </View>
      ),
    },
    {
      // จุดยึดสายตาฝั่งขวา — สถานะคือสิ่งที่ต้องกวาดหาว่าใครถึงคิวแล้ว
      key: 'status',
      title: 'สถานะ',
      width: 134,
      align: 'right',
      // Badge มี alignSelf:'flex-start' ในตัว ต้องสั่งทับถึงจะชิดขวาตาม align ของคอลัมน์
      render: (r) => (
        <Badge
          label={STAGE_META[r.stage].label}
          tone={STAGE_META[r.stage].tone}
          size="sm"
          dot
          style={{ alignSelf: 'flex-end' }}
        />
      ),
    },
  ];

  /* การ์ดคิว: หัวข้อ + ปุ่มลงทะเบียน · ตาราง · แถบแบ่งหน้า (Figma Frame 32) */
  const queueCard = (
    <View
      style={[
        {
          flex: wide ? 1 : undefined,
          borderRadius: t.radius.xl,
          backgroundColor: c.card,
          overflow: 'hidden',
        },
        t.shadow.md,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
        {t.festive ? <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: t.colors.accent }} /> : null}
        <AppText size="md" weight="700" style={{ flex: 1 }}>
          คิวผู้ป่วยวันนี้
        </AppText>
        <AppText size="sm" muted mono>
          {state.records.length} ราย
        </AppText>
      </View>

      <DataTable
        columns={columns}
        data={pageRows}
        keyExtractor={(r) => r.hn}
        minWidth={840}
        striped
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
          {
            borderRadius: t.radius.xl,
            // ธีม Christmas: แบนเนอร์เป็นโทนแดงเทศกาลแทนเขียวเข้ม
            backgroundColor: xmas ? c.secondary : c.primaryStrong,
            ...(xmas ? { borderWidth: 1, borderColor: withAlpha(c.accent, 0.45) } : null),
            padding: 16,
            gap: 24,
            overflow: 'hidden',
          },
          t.shadow.md,
        ]}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          setHero((s) => (Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 1 ? s : { w, h }));
        }}
      >
        {/* พื้นหลังแบนเนอร์: ปกติเป็นตาข่ายภูมิประเทศ · ธีม Christmas เปลี่ยนเป็นหิมะตก */}
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden' }}>
          {xmas ? (
            <Snowfall
              height={hero.h}
              radius={t.radius.xl}
              count={Math.max(40, Math.round(hero.w / 19))}
              scale={1.8}
              colors={t.festive?.snow}
              reduceMotion={t.reduceMotion}
            />
          ) : (
            <WireMesh width={hero.w} height={hero.h} color={MINT} opacity={0.28} fade="up" reduceMotion={t.reduceMotion} />
          )}
        </View>
        {/* ชิดบน — ให้ขอบบนปุ่มอยู่ที่ padding 16 ของการ์ด เสมอกับบรรทัดวันที่ */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', zIndex: 1 }}>
          <View style={{ gap: 8, flex: 1, minWidth: 260 }}>
            <AppText size="base" weight="600" color="#FFFFFF">
              {thaiToday()}
            </AppText>
            <AppText size="xxl" weight="700" color="#FFFFFF">
              {greeting()}, {state.userName}
            </AppText>
            <AppText size="base" color={xmas ? FESTIVE_INK : MINT}>
              {state.facility.name} • สาขา {state.branch} • ประจำ {state.room}
            </AppText>
          </View>
          {/* ปุ่มขาวบนพื้นเขียวเข้ม — งานหลักของหน้านี้ อยู่ระดับเดียวกับคำทักทาย */}
          <Button
            label="อ่านบัตรประชาชน · ลงทะเบียน"
            variant="outline"
            icon={<Ionicons name="card-outline" size={16} color={c.primary} />}
            onPress={actions.openReg}
          />
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
