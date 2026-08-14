import React from 'react';
import { View } from 'react-native';

import { AppText, Button, SidePanel } from '../components';
import { useApp } from '../state/AppContext';
import { useTheme, useThemeContext } from '../theme';

const ENTRIES: Array<[string, string]> = [
  ['28/07/69', 'ติดตาม DM/HT · BP 148/90 · ปรับ Amlodipine'],
  ['14/06/69', 'เยี่ยมบ้าน ม.4 · ประเมิน ADL 18 คะแนน'],
  ['02/05/69', 'Lab · HbA1c 7.8% · LDL 132'],
  ['11/03/69', 'ตรวจโรคทั่วไป · URI · Paracetamol'],
];

/**
 * ประวัติการรักษาย้อนหลัง — ตัวอย่างการใช้ <SidePanel> ซึ่งสลับได้ระหว่าง
 * drawer ขวา / modal กลางจอ ตามการตั้งค่า "รูปแบบ panel" ของผู้ใช้
 */
export const HistoryPanel: React.FC = () => {
  const t = useTheme();
  const { settings } = useThemeContext();
  const { state, actions, derived } = useApp();

  return (
    <SidePanel
      visible={state.historyOpen}
      onClose={() => actions.setHistoryOpen(false)}
      title="ประวัติการรักษาย้อนหลัง"
      caption={`${derived.current?.name ?? 'ตัวอย่างข้อมูล'} · โหมด ${settings.panelMode === 'drawer' ? 'Right drawer 560px' : 'Modal กลางจอ'}`}
      footer={
        <>
          <Button label="ปิด" variant="outline" onPress={() => actions.setHistoryOpen(false)} />
          <Button label="นำไปใช้ในการตรวจ" onPress={() => actions.setHistoryOpen(false)} />
        </>
      }
    >
      <View style={{ gap: 12 }}>
        {ENTRIES.map(([date, text]) => (
          <View key={date} style={{ flexDirection: 'row', gap: 12 }}>
            <AppText size="sm" mono muted style={{ minWidth: 66 }}>
              {date}
            </AppText>
            <AppText size="sm" style={{ flex: 1 }}>
              {text}
            </AppText>
          </View>
        ))}
        <View style={{ padding: 10, borderRadius: t.radius.md, backgroundColor: t.colors.surface2 }}>
          <AppText size="xs" muted>
            โหมดออฟไลน์ — แสดงเฉพาะประวัติที่เก็บในเครื่องนี้ ประวัติจากหน่วยบริการอื่นจะดึงจาก Cloud เมื่อออนไลน์
          </AppText>
        </View>
      </View>
    </SidePanel>
  );
};
