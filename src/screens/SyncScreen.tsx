import React, { useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AppText,
  Badge,
  Button,
  CheckSquare,
  Chip,
  DataTable,
  EmptyState,
  KpiCard,
  LogConsole,
  Pagination,
  ProgressBar,
  Snowfall,
  SectionCard,
  StatusDot,
  UploadStream,
  WireMesh,
} from '../components';
import type { Column } from '../components';
import { FigmaAssets } from '../assets';
import { SYNC_STEP_LABELS, syncSteps } from '../state/mockData';
import { useApp } from '../state/AppContext';
import type { VisitRecord } from '../state/types';
import { useTheme, withAlpha } from '../theme';
import { tr, useT } from '../i18n';

const syncBadge = (r: VisitRecord, syncing: boolean): { label: string; tone: 'success' | 'destructive' | 'info' | 'warning' } => {
  if (r.sync === 'pass') return { label: tr('อัปเดตผ่าน'), tone: 'success' };
  if (r.sync === 'fail') return { label: tr('ไม่ผ่านเงื่อนไข'), tone: 'destructive' };
  if (syncing) return { label: tr('กำลังอัพเดต'), tone: 'info' };
  return { label: tr('รอการซิงค์'), tone: 'warning' };
};

/** หน้า 07 — Sync ข้อมูลขึ้น Cloud (Figma node 32:12410) */
export const SyncScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions, derived } = useApp();
  const tt = useT();
  const { width } = useWindowDimensions();
  const wide = width >= 1180;
  /** ต้องยืนยันตัวตน MOPH SSO ก่อนจึงจะอัปโหลดข้อมูลขึ้น Cloud ได้ */
  const authed = state.sso === 'in';
  /** ธีม Christmas: hero เป็นการ์ดโทนแดง + หิมะตกแทนตาข่าย/สายข้อมูล */
  const xmas = t.festival === 'christmas';
  /** ตัวหนังสือบน hero — พื้นแดงเทศกาลใช้ตัวขาว */
  const heroFg = xmas ? '#FFFFFF' : undefined;
  const heroMuted = xmas ? withAlpha('#FFFFFF', 0.82) : undefined;
  // ขนาดจริงของ hero — พื้นหลังตกแต่ง (สายข้อมูล + ตาข่าย) วาดตามขนาดนี้
  const [hero, setHero] = useState({ w: 0, h: 0 });
  const meshH = Math.round(hero.h * 0.45);

  // แบ่งหน้าเหมือนตารางคิวหน้า Dashboard — index ที่ส่งเข้า actions ต้องบวก offset ของหน้าเสมอ
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(state.records.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;
  const pageRows = useMemo(
    () => state.records.slice(offset, offset + pageSize),
    [state.records, offset, pageSize],
  );
  const selectedOnPage =
    state.opdIdx !== null && state.opdIdx >= offset && state.opdIdx < offset + pageSize ? state.opdIdx - offset : null;

  const columns: Array<Column<VisitRecord>> = [
    {
      key: 'hn',
      title: 'HN',
      width: 92,
      render: (r) => (
        <AppText size="sm" weight="600" mono>
          {r.hn}
        </AppText>
      ),
    },
    {
      key: 'name',
      title: tt('ชื่อ-นามสกุล'),
      flex: 1.2,
      render: (r) => (
        <AppText size="sm" weight="600" numberOfLines={1}>
          {r.name}
        </AppText>
      ),
    },
    {
      key: 'time',
      title: tt('เวลา'),
      width: 66,
      align: 'right',
      render: (r) => (
        <AppText size="sm" mono>
          {r.time}
        </AppText>
      ),
    },
    {
      key: 'steps',
      title: tt('ขั้นตอนการตรวจ'),
      width: 236,
      render: (r) => (
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {syncSteps(r).map((on, i) => (
            <CheckSquare key={SYNC_STEP_LABELS[i]} checked={on} size={17} />
          ))}
        </View>
      ),
    },
    {
      key: 'result',
      title: tt('ผลการอัปเดต'),
      width: 132,
      align: 'right',
      render: (r) => {
        const b = syncBadge(r, state.syncing);
        // Badge ตั้ง alignSelf:'flex-start' มาเอง ต้อง override ไม่งั้นแท็กไม่ชิดขวาตามคอลัมน์
        return <Badge label={b.label} tone={b.tone} size="sm" style={{ alignSelf: 'flex-end' }} />;
      },
    },
    {
      key: 'fix',
      title: '',
      width: 84,
      align: 'right',
      render: (r, i) =>
        r.sync === 'fail' ? (
          <Button label={tt('แก้ไข')} size="sm" variant="outline" onPress={() => actions.openEdit(offset + i)} />
        ) : (
          <View />
        ),
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* hero — หัวเรื่อง + ปุ่ม + KPI อยู่ในการ์ดขาวใบเดียวกันตาม Figma node 32:12478 */}
      <View
        style={[
          {
            borderRadius: t.radius.xl,
            // ธีม Christmas: พื้น hero เป็นโทนแดงอ่อนของเทศกาล
            backgroundColor: xmas ? c.secondary : c.card,
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
        {xmas ? (
          /* ธีม Christmas: หิมะตกทั้งการ์ดแทนสายข้อมูล + ตาข่าย */
          <Snowfall
            height={hero.h}
            radius={t.radius.xl}
            count={Math.max(40, Math.round(hero.w / 19))}
            scale={1.8}
            colors={t.festive?.snow}
            reduceMotion={t.reduceMotion}
          />
        ) : (
          <>
            {/* สายเม็ดข้อมูลไหลขึ้นคลาวด์ (ผ่านหลังการ์ด KPI) */}
            <UploadStream
              width={hero.w}
              height={Math.round(hero.h * 0.62)}
              color={c.ring}
              fadeColor={c.card}
              reduceMotion={t.reduceMotion}
            />
            {/* ตาข่ายภูมิประเทศเขียวที่ขอบล่างการ์ด — ชัดที่ก้นการ์ดแล้วจางขึ้นบน */}
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: meshH, overflow: 'hidden' }}>
              <WireMesh
                width={hero.w}
                height={meshH}
                color={c.ring}
                opacity={t.isDark ? 0.34 : 0.5}
                fade="up"
                reduceMotion={t.reduceMotion}
              />
            </View>
          </>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', zIndex: 1 }}>
          <View style={{ flex: 1, minWidth: 260, gap: 8 }}>
            {/* หัวเรื่อง 32/700 — Figma ใช้ line-height แน่นกว่า body (1.2) ไม่งั้นบล็อกซ้ายจะสูงเกินแบบ */}
            <AppText
              size="hero"
              weight="700"
              color={heroFg ?? (t.isDark ? c.foreground : c.secondary)}
              style={{ lineHeight: Math.round(t.fs.hero * 1.2) }}
            >
              {tt('Sync ข้อมูลขึ้น Cloud')}
            </AppText>
            {/* บล็อกซ้ายเหลือ 2 บรรทัด: หัวเรื่อง + แถวสถานะผู้ทำรายการ (สถานะ · อีเมล · เวลา · ปุ่มสลับผู้ใช้) */}
            {state.sso === 'in' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="checkmark-circle" size={17} color={heroFg ?? (t.isDark ? c.accent : c.primary)} />
                  <AppText size="base" weight="600" color={heroFg ?? (t.isDark ? c.accent : c.primaryStrong)}>
                    {tt('ยืนยันตัวตน SSO แล้ว')}
                  </AppText>
                </View>
                <AppText size="base" muted={!heroMuted} color={heroMuted}>
                  ·
                </AppText>
                <AppText size="base" muted={!heroMuted} color={heroMuted} mono>
                  {state.ssoUser} · {state.ssoTime}
                </AppText>
                <Chip
                  label={tt('เปลี่ยนผู้ใช้งาน')}
                  accent
                  icon={<Ionicons name="swap-horizontal" size={15} color={c.ring} />}
                  onPress={() => {
                    actions.ssoLogout();
                    actions.ssoOpen();
                  }}
                />
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <StatusDot color={xmas ? '#FFD9DC' : c.destructive} size={7} />
                  <AppText size="base" muted={!heroMuted} color={heroMuted}>
                    {tt('ยังไม่ยืนยันตัวตน — ต้องเข้าสู่ระบบ MOPH SSO ก่อนเริ่มซิงค์')}
                  </AppText>
                </View>
                <Chip
                  label={tt('เข้าสู่ระบบ SSO')}
                  accent
                  icon={<Ionicons name="log-in-outline" size={15} color={c.ring} />}
                  onPress={actions.ssoOpen}
                />
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <Button
              label={tt('ดึงข้อมูลพื้นฐานใหม่')}
              variant="outline"
              icon={<Ionicons name="arrow-down" size={15} color={c.primary} />}
              onPress={actions.openSetup}
            />
            {/* ยังไม่ยืนยันตัวตน = ซิงค์ไม่ได้ ปุ่มถูกล็อกไว้ ต้องเข้าสู่ระบบ MOPH SSO ก่อน */}
            <Button
              label={state.syncing ? tt('กำลังซิงค์…') : tt('เริ่มซิงค์ขึ้น Cloud')}
              icon={
                <Ionicons
                  name={authed ? 'sync' : 'lock-closed'}
                  size={15}
                  color={c.primaryForeground}
                />
              }
              loading={state.syncing}
              disabled={!authed || state.syncing || state.records.length === 0}
              onPress={actions.startSync}
            />
          </View>
        </View>

        {/* KPI 5 ใบ จัดชุดเดียวกับหน้าหลัก — ภาพเมฆ 3D ยื่นพ้นมุมล่างขวา + คำอธิบายใต้ตัวเลข */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, zIndex: 1 }}>
          <KpiCard
            label={tt('ในคิวรอซิงค์')}
            value={derived.pendingCount}
            accent={t.kpi.wait}
            image={FigmaAssets.cloudQueue}
            caption={tt('รอส่งขึ้น Cloud')}
          />
          <KpiCard
            label={tt('อัปเดตผ่าน')}
            value={derived.passCount}
            accent={t.kpi.done}
            image={FigmaAssets.cloudPass}
            caption={tt('ขึ้นทะเบียนบน Cloud แล้ว')}
          />
          <KpiCard
            label={tt('ไม่ผ่าน · ต้องแก้ไข')}
            value={derived.failCount}
            accent={t.kpi.fail}
            image={FigmaAssets.cloudFail}
            caption={tt('แก้ไขแล้วอัปโหลดซ้ำได้')}
          />
          <KpiCard
            label={tt('ความคืบหน้า')}
            value={state.syncPct}
            unit="%"
            accent={t.kpi.progress}
            image={FigmaAssets.cloudProgress}
            caption={state.syncing ? tt('กำลังอัปโหลดขึ้น Cloud') : tt('ของรอบซิงค์ล่าสุด')}
          />
          <KpiCard
            label={tt('ซิงค์ล่าสุด')}
            value={state.lastSync}
            accent={t.kpi.neutral}
            image={FigmaAssets.cloudLast}
            caption={tt('เวลาที่ซิงค์สำเร็จครั้งก่อน')}
          />
        </View>
      </View>

      {/* ตาราง + log */}
      <View style={wide ? { flexDirection: 'row', gap: 16, alignItems: 'flex-start' } : { gap: 16 }}>
        {/* หัวตาราง: Figma มีแค่ชื่อ 16/700 กลางแถวสูง 78 ไม่มีคำอธิบายรอง ไม่มีเส้นคั่น (แถบหัวตารางคั่นเอง) */}
        <SectionCard
          title={tt('รายการข้อมูลผู้ป่วยรอ Sync ขึ้น Cloud')}
          divider={false}
          headerPaddingV={16}
          bodyPadding={0}
          shadow="md"
          style={[{ borderWidth: 0 }, wide ? { flex: 1 } : null]}
          right={
            <AppText size="sm" muted mono>
              {state.records.length} {tt('ราย')}
            </AppText>
          }
        >
          <DataTable
            columns={columns}
            data={pageRows}
            keyExtractor={(r) => r.hn}
            minWidth={860}
            onRowPress={(_, i) => actions.openOpd(offset + i)}
            selectedIndex={selectedOnPage}
            empty={
              <EmptyState
                icon="cloud-upload-outline"
                title={tt('ยังไม่มีข้อมูลผู้ป่วยรอ Sync')}
                subtitle={tt('ลงทะเบียนคนไข้ก่อน แล้วข้อมูลจะมารอซิงค์ขึ้น Cloud ที่หน้านี้')}
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
        </SectionCard>

        <View style={[{ gap: 0 }, wide ? { width: 330 } : null]}>
          <SectionCard
            title={tt('Log การซิงค์')}
            divider={false}
            headerPaddingV={16}
            shadow="md"
            style={{ borderWidth: 0 }}
            right={
              <AppText size="sm" weight="700" color={c.primary} mono>
                {tt('{pct}% ({pass}/{total} สำเร็จ)', { pct: state.syncPct, pass: derived.passCount, total: state.records.length || 0 })}
              </AppText>
            }
            bodyPadding={14}
          >
            <View style={{ gap: 12 }}>
              <ProgressBar value={state.syncPct} height={7} />
              <LogConsole
                lines={state.syncLog}
                height={wide ? 420 : 260}
                emptyText={tt('ยังไม่เริ่มซิงค์ — ยืนยันตัวตนด้วย MOPH SSO ก่อนอัปโหลดข้อมูล')}
              />
            </View>
          </SectionCard>
        </View>
      </View>
    </ScrollView>
  );
};
