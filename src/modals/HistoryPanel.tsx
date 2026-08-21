import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText, Badge, Button, SidePanel } from '../components';
import { useApp } from '../state/AppContext';
import { useTheme, withAlpha } from '../theme';
import { useT } from '../i18n';

interface HistoryEntry {
  date: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /** ค่าสำคัญของครั้งนั้น แสดงเป็นชิปเล็ก ๆ */
  tags: string[];
}

const ENTRIES: HistoryEntry[] = [
  { date: '28/07/69', title: 'ติดตามโรคเรื้อรัง', icon: 'heart-pulse', tags: ['DM/HT', 'BP 148/90', 'ปรับ Amlodipine'] },
  { date: '14/06/69', title: 'เยี่ยมบ้าน ม.4', icon: 'home-heart', tags: ['ประเมิน ADL', '18 คะแนน'] },
  { date: '02/05/69', title: 'ผลตรวจทางห้องปฏิบัติการ', icon: 'flask-outline', tags: ['HbA1c 7.8%', 'LDL 132'] },
  { date: '11/03/69', title: 'ตรวจโรคทั่วไป', icon: 'stethoscope', tags: ['URI', 'จ่าย Paracetamol'] },
];

/**
 * ประวัติการรักษาย้อนหลัง — ไทม์ไลน์การ์ดลอยบน drawer กระจก
 * โหนดเป็นไอคอนประจำประเภทการมา · ครั้งล่าสุดเด่นสุด (เขียวทึบ + วงแสง + ป้ายล่าสุด)
 */
export const HistoryPanel: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions, derived } = useApp();
  const tt = useT();

  return (
    <SidePanel
      visible={state.historyOpen}
      onClose={() => actions.setHistoryOpen(false)}
      title={tt('ประวัติการรักษาย้อนหลัง')}
      caption={tt('{name} · {n} ครั้งล่าสุดในเครื่องนี้', { name: derived.current?.name ?? tt('ตัวอย่างข้อมูล'), n: ENTRIES.length })}
      footer={
        <>
          <Button label={tt('ปิด')} variant="outline" onPress={() => actions.setHistoryOpen(false)} />
          <Button label={tt('นำไปใช้ในการตรวจ')} onPress={() => actions.setHistoryOpen(false)} />
        </>
      }
    >
      <View>
        {ENTRIES.map((e, i) => {
          const latest = i === 0;
          const last = i === ENTRIES.length - 1;
          return (
            <View key={e.date} style={{ flexDirection: 'row', gap: 12 }}>
              {/* รางไทม์ไลน์: โหนดไอคอน + เส้นไล่จางลงตามอายุข้อมูล */}
              <View style={{ alignItems: 'center', width: 40 }}>
                <View
                  style={{
                    width: latest ? 40 : 34,
                    height: latest ? 40 : 34,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: latest ? c.primary : t.tones.primary.bg,
                    marginTop: latest ? 0 : 3,
                    // วงแสงรอบครั้งล่าสุด
                    ...(latest
                      ? {
                          shadowColor: c.primary,
                          shadowOpacity: 0.45,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 3 },
                          elevation: 5,
                        }
                      : null),
                  }}
                >
                  <MaterialCommunityIcons
                    name={e.icon}
                    size={latest ? 20 : 17}
                    color={latest ? c.primaryForeground : t.tones.primary.fg}
                  />
                </View>
                {!last ? (
                  <LinearGradient
                    colors={[withAlpha(c.primary, latest ? 0.45 : 0.28), withAlpha(c.primary, 0.1)]}
                    style={{ flex: 1, width: 2, borderRadius: 1, marginVertical: 5 }}
                  />
                ) : null}
              </View>

              {/* การ์ดรายการ — ใบขาวลอยบนกระจก */}
              <View
                style={[
                  {
                    flex: 1,
                    gap: 8,
                    padding: 13,
                    borderRadius: t.radius.lg,
                    backgroundColor: withAlpha(t.isDark ? c.card : '#FFFFFF', t.isDark ? 0.85 : 0.9),
                    marginBottom: last ? 0 : 14,
                  },
                  t.shadow.sm,
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <View
                    style={{
                      paddingHorizontal: 9,
                      paddingVertical: 2,
                      borderRadius: t.radius.pill,
                      backgroundColor: latest ? c.primary : t.tones.primary.bg,
                    }}
                  >
                    <AppText size="xs" weight="700" mono color={latest ? c.primaryForeground : t.tones.primary.fg}>
                      {e.date}
                    </AppText>
                  </View>
                  <AppText size="sm" weight="700" style={{ flex: 1 }} numberOfLines={1}>
                    {tt(e.title)}
                  </AppText>
                  {latest ? <Badge label={tt('ล่าสุด')} tone="success" size="sm" /> : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {e.tags.map((tag) => (
                    <View
                      key={tag}
                      style={{
                        paddingHorizontal: 9,
                        paddingVertical: 3,
                        borderRadius: t.radius.pill,
                        backgroundColor: t.isDark ? c.surface3 : c.surface2,
                      }}
                    >
                      <AppText size="xs" weight="600" color={c.mutedForeground}>
                        {tag}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          );
        })}

        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 9,
            padding: 12,
            borderRadius: t.radius.md,
            backgroundColor: t.tones.warning.bg,
          }}
        >
          <MaterialCommunityIcons name="cloud-off-outline" size={16} color={t.tones.warning.fg} style={{ marginTop: 1 }} />
          <AppText size="xs" color={t.tones.warning.fg} style={{ flex: 1 }}>
            {tt('โหมดออฟไลน์ — แสดงเฉพาะประวัติที่เก็บในเครื่องนี้ ประวัติจากหน่วยบริการอื่นจะดึงจาก Cloud เมื่อออนไลน์')}
          </AppText>
        </View>
      </View>
    </SidePanel>
  );
};
