import React from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

import {
  AppText,
  Button,
  Checkbox,
  OptionTile,
  SectionCard,
  SegmentedPills,
} from '../components';
import { useApp } from '../state/AppContext';
import {
  FESTIVAL_LIST,
  FONT_LIST,
  PALETTE_LIST,
  uiFontFamily,
  useTheme,
  useThemeContext,
} from '../theme';
import type { DensityId, FontSizeId } from '../theme';

const Swatches: React.FC<{ colors: [string, string, string, string] }> = ({ colors }) => {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      {colors.map((col, i) => (
        <View
          key={`${col}-${i}`}
          style={{ width: 16, height: 16, borderRadius: 5, backgroundColor: col, borderWidth: 1, borderColor: t.colors.border }}
        />
      ))}
    </View>
  );
};

/** หน้า 05 — ตั้งค่ารูปลักษณ์ระบบ (ธีม/ฟอนต์/ความหนาแน่น/รูปแบบ panel) */
export const SettingsScreen: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { settings, setPalette, setMode, setFestival, setFontId, setFontSize, setDensity, setPanelMode, setReduceMotion, resetAppearance } =
    useThemeContext();
  const { actions } = useApp();
  const { width } = useWindowDimensions();
  const tileW = width >= 1100 ? '31.5%' : width >= 720 ? '47.5%' : '100%';

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 240 }}>
          <AppText size="xl" weight="700">
            ตั้งค่าระบบ · รูปลักษณ์
          </AppText>
          <AppText size="xs" muted>
            มีผลเฉพาะเครื่องนี้ · บันทึกอัตโนมัติ
          </AppText>
        </View>
        <Button label="คืนค่าเริ่มต้น" variant="outline" size="sm" onPress={resetAppearance} />
      </View>

      {/* ธีมสี */}
      <SectionCard
        title="ธีมสี"
        right={
          <SegmentedPills
            options={[
              { value: 'light', label: 'สว่าง' },
              { value: 'dark', label: 'มืด' },
            ]}
            value={settings.mode}
            onChange={setMode}
          />
        }
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {PALETTE_LIST.map((p) => {
            const active = settings.palette === p.id && settings.festival === 'none';
            return (
              <OptionTile key={p.id} active={active} onPress={() => setPalette(p.id)} style={{ width: tileW }}>
                <Swatches colors={p.swatches} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AppText size="sm" weight="700" style={{ flex: 1 }}>
                    {p.name}
                  </AppText>
                  <View
                    style={{
                      paddingHorizontal: 7,
                      paddingVertical: 1,
                      borderRadius: t.radius.pill,
                      backgroundColor: active ? c.primary : c.muted,
                    }}
                  >
                    <AppText size={10} weight="600" color={active ? c.primaryForeground : c.mutedForeground}>
                      {active ? 'ใช้อยู่' : p.tag}
                    </AppText>
                  </View>
                </View>
                <AppText size="xs" muted numberOfLines={2}>
                  {p.desc}
                </AppText>
              </OptionTile>
            );
          })}
        </View>

        <AppText size="sm" weight="600" style={{ marginTop: 14, marginBottom: 8 }}>
          ธีมเทศกาล (ทับสีหลักชั่วคราว)
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {FESTIVAL_LIST.map((f) => {
            const active = settings.festival === f.id;
            return (
              <OptionTile key={f.id} active={active} onPress={() => setFestival(f.id)} style={{ width: tileW }}>
                <Swatches colors={f.swatches} />
                <AppText size="sm" weight="700">
                  {f.name}
                </AppText>
                <AppText size="xs" muted numberOfLines={2}>
                  {f.desc}
                </AppText>
              </OptionTile>
            );
          })}
          <OptionTile active={settings.festival === 'none'} onPress={() => setFestival('none')} style={{ width: tileW }}>
            <AppText size="sm" weight="700">
              ปิดธีมเทศกาล
            </AppText>
            <AppText size="xs" muted>
              ใช้สีของธีมหลักล้วน ไม่มีของประดับ
            </AppText>
          </OptionTile>
        </View>
      </SectionCard>

      {/* ตัวอักษร */}
      <SectionCard title="ตัวอักษร">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {FONT_LIST.map((f) => (
            <OptionTile key={f.id} active={settings.fontId === f.id} onPress={() => setFontId(f.id)} style={{ width: tileW }}>
              <AppText size="lg" style={{ fontFamily: uiFontFamily(f.id, '500') }}>
                สบายดี รพ.สต. 2569
              </AppText>
              <AppText size="xs" muted>
                {f.name}
              </AppText>
            </OptionTile>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
          <AppText size="sm" weight="600">
            ขนาดตัวอักษรฐาน
          </AppText>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['12', '13', '14', '16', '18'] as FontSizeId[]).map((s) => {
              const on = settings.fontSize === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setFontSize(s)}
                  style={{
                    width: 44,
                    height: 38,
                    borderRadius: t.radius.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: on ? c.primary : c.surface2,
                    borderWidth: 1,
                    borderColor: on ? c.primary : c.border,
                  }}
                >
                  <AppText size={parseInt(s, 10)} weight={on ? '600' : '400'} mono color={on ? c.primaryForeground : c.foreground}>
                    {s}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText size="xs" muted>
            ตัวเลขและรหัส (HN, ICD-10) ใช้ JetBrains Mono เสมอ
          </AppText>
        </View>
      </SectionCard>

      {/* ความหนาแน่นตาราง */}
      <SectionCard title="ความหนาแน่นของตาราง">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {(
            [
              ['compact', 'กระชับ', '48px'],
              ['normal', 'ปกติ', '60px'],
              ['comfortable', 'สบาย', '72px'],
            ] as Array<[DensityId, string, string]>
          ).map(([id, name, px]) => (
            <OptionTile key={id} active={settings.density === id} onPress={() => setDensity(id)} style={{ width: tileW }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppText size="sm" weight="700">
                  {name}
                </AppText>
                <AppText size="xs" muted mono>
                  {px}
                </AppText>
              </View>
              <View style={{ gap: 3, width: '100%' }}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={{
                      height: id === 'compact' ? 6 : id === 'normal' ? 9 : 13,
                      borderRadius: 3,
                      backgroundColor: c.muted,
                      width: '100%',
                    }}
                  />
                ))}
              </View>
            </OptionTile>
          ))}
        </View>
      </SectionCard>

      {/* รูปแบบ panel */}
      <SectionCard
        title="รูปแบบ panel ของงานรอง"
        caption="ประวัติเดิม / อ่านอิงข้อมูล — เลือกได้ว่าจะเปิดแบบ drawer ขวาหรือ modal กลางจอ"
        right={<Button label="ดูตัวอย่าง" variant="outline" size="sm" onPress={() => actions.setHistoryOpen(true)} />}
      >
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <SegmentedPills
              options={[
                { value: 'drawer', label: 'Right drawer' },
                { value: 'modal', label: 'Modal' },
              ]}
              value={settings.panelMode}
              onChange={setPanelMode}
            />
            <AppText size="xs" muted style={{ flex: 1, minWidth: 200 }}>
              งานที่ต้องยืนยันรายการเสี่ยง (สั่งยา ฯลฯ) จะบังคับเป็น Modal เสมอ
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 240, gap: 6 }}>
              <AppText size="sm" weight="600">
                mode=&quot;drawer&quot;
              </AppText>
              <AppText size="xs" muted>
                • เห็นบริบทหน้าหลัก อ่านเทียบระหว่างกรอกฟอร์มได้{'\n'}• กว้าง 400 / 560 / 720px ตามงาน{'\n'}• เหมาะกับงานอ่านอิงที่ต้องดูข้อมูลสลับไปมา
              </AppText>
            </View>
            <View style={{ flex: 1, minWidth: 240, gap: 6 }}>
              <AppText size="sm" weight="600">
                mode=&quot;modal&quot;
              </AppText>
              <AppText size="xs" muted>
                • บังคับโฟกัสงานเดียว เหมาะกับการยืนยันรายการเสี่ยง{'\n'}• ใช้พื้นที่กลางจอ อ่านง่ายบนจอเล็ก{'\n'}• ปิดด้วยปุ่มชัดเจน กันการกดพลาด
              </AppText>
            </View>
          </View>
        </View>
      </SectionCard>

      {/* การเคลื่อนไหว */}
      <SectionCard title="การเคลื่อนไหว">
        <View style={{ gap: 10 }}>
          <Checkbox
            checked={settings.reduceMotion}
            onChange={setReduceMotion}
            label="ลดการเคลื่อนไหวทั้งระบบ (ปิดแอนิเมชันตกแต่ง)"
          />
          <AppText size="xs" muted>
            ระบบจะปิดการเคลื่อนไหวอัตโนมัติเมื่อเครื่องตั้งค่า “ลดการเคลื่อนไหว” (prefers-reduced-motion)
          </AppText>
        </View>
      </SectionCard>
    </ScrollView>
  );
};
