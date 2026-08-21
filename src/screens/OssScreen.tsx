import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AnimatedPressable, AppText, EmptyState, useHoverFade, usePressScale, webFocusRing } from '../components';
import { OSS_TABS } from '../state/mockData';
import { useApp } from '../state/AppContext';
import type { OssTabId } from '../state/types';
import { shade, useTheme, withAlpha } from '../theme';
import { PatientListScreen } from './PatientListScreen';
import { EncounterScreen } from './EncounterScreen';

/** ไอคอนประจำเมนู One Stop Service */
const TAB_ICONS: Record<OssTabId, keyof typeof MaterialCommunityIcons.glyphMap> = {
  list: 'account-group-outline',
  enc: 'stethoscope',
  drug: 'pill',
  lab: 'flask-outline',
  appt: 'calendar-check-outline',
  vax: 'needle',
  ncd: 'heart-pulse',
  visit: 'home-heart',
  anc: 'baby-face-outline',
  dent: 'tooth-outline',
  refer: 'ambulance',
};

const MINT = '#D8F3DC';
/** พื้นแถบแท็บตาม Figma 40:52173 (เท่ากับสี sidebar ของธีม MOPH) */

/** ปุ่มเมนูหนึ่งใบ — เกรเดียนต์เขียว + เงาสี + แสงขอบบน ให้ดูนูนเป็นชั้น */
const TabPill: React.FC<{
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  active: boolean;
  count?: number;
  onPress: () => void;
}> = ({ label, icon, active, count, onPress }) => {
  const t = useTheme();
  const c = t.colors;
  const press = usePressScale(0.94);
  const h = useHoverFade();
  return (
    <AnimatedPressable
      {...press.handlers}
      onPointerEnter={h.handlers.onPointerEnter}
      onPointerLeave={h.handlers.onPointerLeave}
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          height: 42,
          paddingHorizontal: 16,
          borderRadius: t.radius.pill,
          overflow: 'hidden',
          // ปุ่มที่ไม่ได้เลือก: โปร่ง → ขาวนวลตอนชี้เมาส์ (ไล่ค่านุ่ม ๆ)
          backgroundColor: active ? 'transparent' : h.mix(withAlpha('#FFFFFF', 0), withAlpha('#FFFFFF', 0.65)),
        },
        // เงาสีเขียวใต้ปุ่มที่เลือก — ลอยขึ้นจากราง
        active
          ? {
              shadowColor: c.primary,
              shadowOpacity: 0.38,
              shadowRadius: 9,
              shadowOffset: { width: 0, height: 5 },
              elevation: 5,
            }
          : null,
        press.pressStyle,
        webFocusRing(c.ring),
      ]}
    >
      {active ? (
        <>
          {/* พื้นเกรเดียนต์เขียวเข้ม→เขียว ทแยงลง */}
          <LinearGradient
            colors={[c.primaryStrong, c.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
          />
          {/* แสงสะท้อนครึ่งบน — ให้ผิวปุ่มดูโค้งนูน */}
          <LinearGradient
            colors={[withAlpha('#FFFFFF', 0.22), withAlpha('#FFFFFF', 0)]}
            style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 21 }}
          />
        </>
      ) : null}
      <MaterialCommunityIcons name={icon} size={18} color={active ? c.primaryForeground : c.primaryStrong} />
      <AppText
        size="sm"
        weight={active ? '700' : '600'}
        color={active ? c.primaryForeground : c.primaryStrong}
        style={{ userSelect: 'none' } as never}
      >
        {label}
      </AppText>
      {count ? (
        <View
          style={{
            minWidth: 24,
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: t.radius.pill,
            backgroundColor: active ? withAlpha('#FFFFFF', 0.24) : c.card,
          }}
        >
          <AppText size="xs" weight="700" mono center color={active ? c.primaryForeground : c.primaryStrong}>
            {count}
          </AppText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
};

/**
 * โครงหน้า One Stop Service
 * แถบเมนูเป็นการ์ดไล่สีเขียวเข้ม ปุ่มที่เลือกยกขึ้นเป็นพิลขาว — เป็นจุดนำสายตาของหน้านี้
 */
export const OssScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const [bar, setBar] = useState({ w: 0, h: 0 });

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
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View
          onLayout={(e) => {
            const { width: w, height: h } = e.nativeEvent.layout;
            setBar((s) => (Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 1 ? s : { w, h }));
          }}
          // รางพิลพื้นเรียบ — ความมีมิติอยู่ที่ตัวปุ่ม (เกรเดียนต์+เงา) ไม่ใส่เอฟเฟคพื้นหลัง
          // ธีมเทศกาล: รางใช้เฉดอ่อนของสีหลัก (Christmas = เขียวสน) ไม่ใช้พื้น sidebar ที่เป็นโทนแดง
          style={[
            {
              borderRadius: t.radius.pill,
              backgroundColor: t.festive ? shade(c.primary, 0.78) : c.sidebar,
              overflow: 'hidden',
            },
            t.shadow.md,
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 4, alignItems: 'center', padding: 8 }}
          >
            {OSS_TABS.map((tab) => (
              <TabPill
                key={tab.id}
                label={tab.label}
                icon={TAB_ICONS[tab.id]}
                active={state.ossTab === tab.id}
                count={tab.id === 'list' ? state.records.length : 0}
                onPress={() => actions.setOssTab(tab.id)}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={{ flex: 1 }}>{content}</View>
    </View>
  );
};
