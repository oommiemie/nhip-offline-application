import React from 'react';
import { ScrollView, View } from 'react-native';

import { AppText, Chip, EmptyState, StatusDot } from '../components';
import { OSS_TABS } from '../state/mockData';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';
import { PatientListScreen } from './PatientListScreen';
import { EncounterScreen } from './EncounterScreen';

/** โครงหน้า One Stop Service: แถบแท็บ 11 เมนู + เนื้อหาตามแท็บ */
export const OssScreen: React.FC = () => {
  const t = useTheme();
  const { state, actions, derived } = useApp();

  const content =
    state.ossTab === 'list' ? (
      <PatientListScreen />
    ) : state.ossTab === 'enc' ? (
      <EncounterScreen />
    ) : (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          icon="construct-outline"
          title={OSS_TABS.find((x) => x.id === state.ossTab)?.label ?? ''}
          subtitle="เมนูนี้ยังไม่เปิดใช้ในเวอร์ชันต้นแบบ — โครงหน้าจอ ตาราง และฟอร์มใช้ชุดคอมโพเนนต์เดียวกับหน้าที่ทำไว้แล้ว"
          actionLabel="กลับหน้ารายการรับบริการ"
          onAction={() => actions.setOssTab('list')}
        />
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: t.colors.border,
          backgroundColor: t.colors.card,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 9, gap: 8, alignItems: 'center' }}>
          {OSS_TABS.map((tab) => (
            <Chip
              key={tab.id}
              label={tab.label}
              active={state.ossTab === tab.id}
              count={tab.id === 'list' && state.records.length ? state.records.length : undefined}
              onPress={() => actions.setOssTab(tab.id)}
            />
          ))}
          <View style={{ width: 8 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <StatusDot color={derived.current ? t.colors.success : t.colors.mutedForeground} size={7} />
            <AppText size="xs" muted>
              คนไข้ที่กำลังทำงาน:{' '}
              <AppText size="xs" weight="600">
                {derived.current ? derived.current.name : 'ยังไม่เลือก'}
              </AppText>
            </AppText>
          </View>
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>{content}</View>
    </View>
  );
};
