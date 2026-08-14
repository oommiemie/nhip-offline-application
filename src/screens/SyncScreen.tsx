import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AppText,
  Badge,
  Button,
  Card,
  CheckSquare,
  Chip,
  DataTable,
  EmptyState,
  KpiCard,
  LogConsole,
  ProgressBar,
  SectionCard,
  StatusDot,
} from '../components';
import type { Column } from '../components';
import { FigmaAssets } from '../assets';
import { SYNC_STEP_LABELS, syncSteps } from '../state/mockData';
import { useApp } from '../state/AppContext';
import type { VisitRecord } from '../state/types';
import { useTheme } from '../theme';

const syncBadge = (r: VisitRecord, syncing: boolean): { label: string; tone: 'success' | 'destructive' | 'info' | 'warning' } => {
  if (r.sync === 'pass') return { label: 'อัปเดตผ่าน', tone: 'success' };
  if (r.sync === 'fail') return { label: 'ไม่ผ่านเงื่อนไข', tone: 'destructive' };
  if (syncing) return { label: 'กำลังอัพเดต', tone: 'info' };
  return { label: 'รอการซิงค์', tone: 'warning' };
};

/** หน้า 07 — Sync ข้อมูลขึ้น Cloud (Figma node 32:12410) */
export const SyncScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions, derived } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= 1180;

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
      title: 'ชื่อ-นามสกุล',
      flex: 1.2,
      render: (r) => (
        <AppText size="sm" weight="600" numberOfLines={1}>
          {r.name}
        </AppText>
      ),
    },
    {
      key: 'time',
      title: 'เวลา',
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
      title: 'ขั้นตอนการตรวจ',
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
      title: 'ผลการอัปเดต',
      width: 132,
      render: (r) => {
        const b = syncBadge(r, state.syncing);
        return <Badge label={b.label} tone={b.tone} size="sm" />;
      },
    },
    {
      key: 'fix',
      title: '',
      width: 84,
      align: 'right',
      render: (r, i) =>
        r.sync === 'fail' ? (
          <Button label="แก้ไข" size="sm" variant="outline" onPress={() => actions.openEdit(i)} />
        ) : (
          <View />
        ),
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* ส่วนหัว */}
      <Card rounded="xl" padded={18} shadow="md">
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 260, gap: 4 }}>
            <AppText size="xxl" weight="700" color={t.isDark ? c.foreground : c.secondary}>
              Sync ข้อมูลขึ้น Cloud
            </AppText>
            {state.sso === 'in' ? (
              <>
                <AppText size="sm" weight="600" color={c.primaryStrong}>
                  ยืนยันตัวตน SSO สำเร็จแล้ว
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <AppText size="sm" muted mono>
                    {state.ssoUser} · {state.ssoTime}
                  </AppText>
                  <Chip
                    label="เปลี่ยนผู้ใช้งาน"
                    onPress={() => {
                      actions.ssoLogout();
                      actions.ssoOpen();
                    }}
                  />
                </View>
              </>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <StatusDot color={c.destructive} size={7} />
                  <AppText size="sm" muted>
                    ยังไม่ยืนยันตัวตน — ต้องเข้าสู่ระบบ MOPH SSO ก่อนเริ่มซิงค์
                  </AppText>
                </View>
                <Chip label="เข้าสู่ระบบ SSO" onPress={actions.ssoOpen} />
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button
              label="ดึงข้อมูลพื้นฐานใหม่"
              variant="outline"
              icon={<Ionicons name="arrow-down" size={15} color={c.primary} />}
              onPress={actions.openSetup}
            />
            <Button
              label={state.syncing ? 'กำลังซิงค์…' : 'เริ่มซิงค์ขึ้น Cloud'}
              icon={<Ionicons name="sync" size={15} color={c.primaryForeground} />}
              loading={state.syncing}
              disabled={state.syncing || state.records.length === 0}
              onPress={actions.startSync}
            />
          </View>
        </View>
      </Card>

      {/* KPI — ภาพเมฆ 3D จากไฟล์ Figma */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <KpiCard label="ในคิวรอซิงค์" value={derived.pendingCount} accent={t.kpi.wait} image={FigmaAssets.cloudQueue} />
        <KpiCard label="อัปเดตผ่าน" value={derived.passCount} accent={t.kpi.done} image={FigmaAssets.cloudPass} />
        <KpiCard label="ไม่ผ่าน · ต้องแก้ไข" value={derived.failCount} accent={t.kpi.fail} image={FigmaAssets.cloudFail} />
        <KpiCard label="ซิงค์ล่าสุด" value={state.lastSync} accent={t.kpi.neutral} image={FigmaAssets.cloudLast} />
      </View>

      {/* ตาราง + log */}
      <View style={wide ? { flexDirection: 'row', gap: 14, alignItems: 'flex-start' } : { gap: 14 }}>
        <SectionCard
          title="คิวผู้ป่วยวันนี้"
          caption="กดที่รายการเพื่อดู OPD Card · รายการไม่ผ่านกด “แก้ไข” เพื่ออัปโหลดซ้ำ"
          bodyPadding={0}
          style={wide ? { flex: 1 } : undefined}
        >
          <DataTable
            columns={columns}
            data={state.records}
            keyExtractor={(r) => r.hn}
            minWidth={860}
            onRowPress={(_, i) => actions.openOpd(i)}
            selectedIndex={state.opdIdx}
            empty={
              <EmptyState
                icon="cloud-upload-outline"
                title="ไม่มีรายการรับบริการในกะนี้"
                subtitle="ลงทะเบียนคนไข้ก่อน แล้วรายการจะมารอซิงค์ที่หน้านี้"
              />
            }
          />
        </SectionCard>

        <View style={[{ gap: 0 }, wide ? { width: 330 } : null]}>
          <SectionCard
            title="Log การซิงค์"
            right={
              <AppText size="sm" weight="700" color={c.primary} mono>
                {state.syncPct}% ({derived.passCount}/{state.records.length || 0} สำเร็จ)
              </AppText>
            }
            bodyPadding={14}
          >
            <View style={{ gap: 12 }}>
              <ProgressBar value={state.syncPct} height={7} />
              <LogConsole
                lines={state.syncLog}
                height={wide ? 420 : 260}
                emptyText="ยังไม่เริ่มซิงค์ — ยืนยันตัวตนด้วย MOPH SSO ก่อนอัปโหลดข้อมูล"
              />
            </View>
          </SectionCard>
        </View>
      </View>
    </ScrollView>
  );
};
