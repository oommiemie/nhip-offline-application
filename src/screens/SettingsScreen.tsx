import React, { useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AnimatedPressable, AppText, Badge, Button, Card, OptionTile, usePressScale, webFocusRing } from '../components';
import {
  FESTIVAL_LIST,
  FONT_LIST,
  PALETTE_LIST,
  uiFontFamily,
  useTheme,
  useThemeContext,
  withAlpha,
} from '../theme';
import type { DensityId, FontSizeId, ModePref } from '../theme';
import { useT } from '../i18n';

/** หัวข้อในการ์ด: ขีดสีนำ + 16/700 + เส้นคั่นใต้ (ตาม Figma 146:1511) */
const SecTitle: React.FC<{ label: string }> = ({ label }) => {
  const t = useTheme();
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View style={{ width: 4, height: 17, borderRadius: 2, backgroundColor: t.colors.warning }} />
        <AppText size="lg" weight="700">
          {label}
        </AppText>
      </View>
      <View style={{ height: 1.5, backgroundColor: withAlpha(t.colors.border, 0.8) }} />
    </View>
  );
};

/** สวิตช์เขียวแบบในแบบ — เลื่อนนุ่ม ๆ เคารพ reduce motion */
const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => {
  const t = useTheme();
  const c = t.colors;
  const x = useRef(new Animated.Value(value ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(x, {
      toValue: value ? 1 : 0,
      duration: t.reduceMotion ? 0 : 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [value, x, t.reduceMotion]);
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={{ width: 46, height: 26, borderRadius: 13, justifyContent: 'center' }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          borderRadius: 13,
          backgroundColor: x.interpolate({ inputRange: [0, 1], outputRange: [c.surface3, c.primary] }) as never,
        }}
      />
      <Animated.View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [3, 23] }) }] as never,
        }}
      />
    </Pressable>
  );
};

/** แถวตั้งค่า: ป้ายซ้าย + ตัวควบคุมขวา */
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 34 }}>
    <AppText size="sm" weight="600" style={{ flex: 1 }}>
      {label}
    </AppText>
    {children}
  </View>
);

const RowDivider: React.FC = () => {
  const t = useTheme();
  return <View style={{ height: 1.5, backgroundColor: withAlpha(t.colors.border, 0.8) }} />;
};

/** ความกว้างต่อปุ่มของสวิตช์โหมด — เท่ากันทุกปุ่ม เพื่อให้พิลขาวไถลไปได้พอดีช่อง */
const MODE_ITEM_W = 88;

/** ปุ่มหนึ่งช่องของสวิตช์โหมด (แยกคอมโพเนนต์เพื่อให้มีอนิเมชันกดของตัวเอง) */
const ModeBtn: React.FC<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}> = ({ label, icon, active, onPress }) => {
  const t = useTheme();
  const c = t.colors;
  const press = usePressScale(0.94);
  return (
    <AnimatedPressable
      {...press.handlers}
      onPress={onPress}
      style={[
        {
          width: MODE_ITEM_W,
          height: 28,
          borderRadius: t.radius.pill,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
        },
        press.pressStyle,
        webFocusRing(c.ring),
      ]}
    >
      <Ionicons name={icon} size={13} color={active ? c.primaryStrong : withAlpha('#FFFFFF', 0.85)} />
      <AppText size="xs" weight={active ? '700' : '500'} color={active ? c.primaryStrong : withAlpha('#FFFFFF', 0.9)}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
};

/** สวิตช์ 3 ทาง สว่าง/มืด/อัตโนมัติ — พิลขาวไถลไปช่องที่เลือกด้วยสปริง */
const ModeSegment: React.FC<{ value: ModePref; onChange: (v: ModePref) => void }> = ({ value, onChange }) => {
  const t = useTheme();
  const tt = useT();
  const c = t.colors;
  const items: Array<[ModePref, string, keyof typeof Ionicons.glyphMap]> = [
    ['light', tt('สว่าง'), 'sunny-outline'],
    ['dark', tt('มืด'), 'moon-outline'],
    ['auto', tt('อัตโนมัติ'), 'time-outline'],
  ];
  const idx = Math.max(0, items.findIndex(([id]) => id === value));
  const slide = useRef(new Animated.Value(idx)).current;
  React.useEffect(() => {
    if (t.reduceMotion) {
      slide.setValue(idx);
      return;
    }
    Animated.spring(slide, { toValue: idx, friction: 9, tension: 120, useNativeDriver: true }).start();
  }, [idx, slide, t.reduceMotion]);
  return (
    <View style={{ flexDirection: 'row', padding: 3, borderRadius: t.radius.pill, backgroundColor: c.primaryStrong }}>
      {/* พิลขาวตัวชี้ตำแหน่ง — ไถลใต้ปุ่ม */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 3,
          top: 3,
          width: MODE_ITEM_W,
          height: 28,
          borderRadius: t.radius.pill,
          backgroundColor: '#FFFFFF',
          transform: [
            { translateX: slide.interpolate({ inputRange: [0, items.length - 1], outputRange: [0, MODE_ITEM_W * (items.length - 1)] }) },
          ] as never,
        }}
      />
      {items.map(([id, label, icon]) => (
        <ModeBtn key={id} label={label} icon={icon} active={value === id} onPress={() => onChange(id)} />
      ))}
    </View>
  );
};

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

/** ความสูงคงที่ของช่องป้าย "ใช้อยู่" — จองที่ไว้เสมอ ไทล์ที่ยังไม่ถูกเลือกจะได้สูงเท่ากัน */
const BADGE_SLOT_H = 24;

/** ช่องป้ายสถานะ — จองพื้นที่ไว้ตลอด แสดงป้ายเฉพาะตอนใช้อยู่ */
const BadgeSlot: React.FC<{ active: boolean; align?: 'flex-start' | 'flex-end' }> = ({ active, align = 'flex-end' }) => {
  const tt = useT();
  return (
    <View style={{ height: BADGE_SLOT_H, justifyContent: 'center', alignItems: align }}>
      {active ? <Badge label={tt('ใช้อยู่')} tone="primary" size="sm" /> : null}
    </View>
  );
};

/** คำอธิบายไทล์ — ล็อกความสูง 2 บรรทัดเสมอ ไม่ว่าข้อความสั้นหรือยาว */
const TileDesc: React.FC<{ children: string }> = ({ children }) => {
  const t = useTheme();
  const lineH = Math.round(t.fs.xs * 1.45);
  return (
    <AppText size="xs" muted numberOfLines={2} style={{ height: lineH * 2 }}>
      {children}
    </AppText>
  );
};

/** โครงเส้น 3 บรรทัดของไทล์ระยะห่าง — ถี่/ห่างต่างกันตามระดับ */
const DensityPreview: React.FC<{ gap: number; bar: number }> = ({ gap, bar }) => {
  const t = useTheme();
  return (
    <View style={{ height: 52, justifyContent: 'center', gap }}>
      {[0.95, 0.8, 0.6].map((w) => (
        <View key={w} style={{ height: bar, width: `${w * 100}%`, borderRadius: bar / 2, backgroundColor: t.colors.surface3 }} />
      ))}
    </View>
  );
};

/** ภาพย่อ sidebar สองขนาดของไทล์ตั้งค่า Sidebar */
const SidebarPreview: React.FC<{ compact: boolean }> = ({ compact }) => {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={{ flexDirection: 'row', gap: 6, height: 64 }}>
      <View style={{ width: compact ? 16 : 40, borderRadius: 6, backgroundColor: c.surface3, padding: 4, gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{ height: 5, borderRadius: 3, backgroundColor: c.mutedForeground, opacity: 0.35, width: compact ? 8 : '86%' }}
          />
        ))}
      </View>
      <View style={{ flex: 1, borderRadius: 6, backgroundColor: withAlpha(c.surface3, 0.55), padding: 5, gap: 4 }}>
        {[0.9, 0.65].map((w) => (
          <View key={w} style={{ height: 5, width: `${w * 100}%`, borderRadius: 3, backgroundColor: c.surface3 }} />
        ))}
      </View>
    </View>
  );
};

const SIZE_ORDER: FontSizeId[] = ['12', '13', '14', '16', '18'];
const SIZE_LABELS: Record<FontSizeId, string> = {
  '12': 'เล็กมาก (86%)',
  '13': 'เล็ก (93%)',
  '14': 'กลาง (100%) — ค่าเริ่มต้น',
  '16': 'ใหญ่ (114%)',
  '18': 'ใหญ่มาก (129%)',
};

/** สไลเดอร์ขนาดตัวอักษร a — A · 5 ระดับ กดที่จุด/รางเพื่อเลือก */
const SizeSlider: React.FC<{ value: FontSizeId; onChange: (v: FontSizeId) => void }> = ({ value, onChange }) => {
  const t = useTheme();
  const tt = useT();
  const c = t.colors;
  const idx = Math.max(0, SIZE_ORDER.indexOf(value));
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <AppText size={13} weight="600" muted>
          a
        </AppText>
        <View style={{ flex: 1, height: 28, justifyContent: 'center' }}>
          {/* ราง + ส่วนที่ผ่านมาแล้วเป็นสีเขียว */}
          <View style={{ height: 5, borderRadius: 3, backgroundColor: c.surface3 }} />
          <View
            style={{
              position: 'absolute',
              left: 0,
              width: `${(idx / (SIZE_ORDER.length - 1)) * 100}%`,
              height: 5,
              borderRadius: 3,
              backgroundColor: c.primary,
            }}
          />
          {/* จุดแตะ 5 ระดับ — ระดับที่เลือกเป็นหัวลากขาวขอบเขียว */}
          <View style={{ position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
            {SIZE_ORDER.map((s, i) => {
              const on = i === idx;
              return (
                <Pressable key={s} onPress={() => onChange(s)} hitSlop={10} style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <View
                    style={
                      on
                        ? {
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: '#FFFFFF',
                            borderWidth: 2.5,
                            borderColor: c.primary,
                            shadowColor: '#0F3D2E',
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 3,
                          }
                        : { width: 8, height: 8, borderRadius: 4, backgroundColor: i < idx ? c.primary : c.border }
                    }
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
        <AppText size={19} weight="600" muted>
          A
        </AppText>
      </View>
      <AppText size="xs" muted>
        {tt('ระดับปัจจุบัน · {label}', { label: tt(SIZE_LABELS[value]) })}
      </AppText>
    </View>
  );
};

/** หน้า 05 — ตั้งค่าระบบ · รูปลักษณ์ ตาม Figma 146:1511 */
export const SettingsScreen: React.FC = () => {
  const t = useTheme();
  const tt = useT();
  const c = t.colors;
  const {
    settings,
    setPalette,
    setMode,
    setFestival,
    setFontId,
    setFontSize,
    setDensity,
    setSidebar,
    setFontBold,
    setLanguage,
    resetAppearance,
  } = useThemeContext();
  const { width } = useWindowDimensions();
  const twoCol = width >= 1180;
  const tileW = twoCol ? '31.2%' : width >= 720 ? '47.5%' : '100%';

  /** สวิตช์ธีมเทศกาล: เปิดเผยกริดเมื่อเปิด · ปิด = ล้างเทศกาลกลับธีมหลัก */
  const [festOpen, setFestOpen] = useState(settings.festival !== 'none');

  const themeCard = (
    <Card rounded="xl" padded={16} shadow="md" style={{ borderWidth: 0, gap: 14 }}>
      <SecTitle label={tt('ธีมสี')} />
      <Row label={tt('รูปลักษณ์')}>
        <ModeSegment value={settings.mode} onChange={setMode} />
      </Row>
      {settings.mode === 'auto' ? (
        <AppText size="xs" muted style={{ textAlign: 'right' }}>
          {tt('อัตโนมัติตามเวลาเครื่อง — สว่าง 06:00–17:59 · มืด 18:00–05:59')}
        </AppText>
      ) : null}
      <RowDivider />

      <AppText size="sm" weight="600">
        {tt('ธีมสีพื้นฐาน')}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {PALETTE_LIST.map((p) => {
          const active = settings.palette === p.id && settings.festival === 'none';
          return (
            <OptionTile key={p.id} active={active} onPress={() => setPalette(p.id)} style={{ width: tileW }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: BADGE_SLOT_H }}>
                <View style={{ flex: 1 }}>
                  <Swatches colors={p.swatches} />
                </View>
                <BadgeSlot active={active} />
              </View>
              <AppText size="sm" weight="700" numberOfLines={1}>
                {p.name}
              </AppText>
              <TileDesc>{tt(p.desc)}</TileDesc>
            </OptionTile>
          );
        })}
      </View>
      <RowDivider />

      <Row label={tt('เปลี่ยนตามเทศกาล')}>
        <Toggle
          value={festOpen}
          onChange={(v) => {
            setFestOpen(v);
            if (!v) setFestival('none');
          }}
        />
      </Row>

      {festOpen ? (
        <>
          <AppText size="sm" weight="600">
            {tt('ธีมสีพิเศษ')}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {FESTIVAL_LIST.map((f) => {
              const active = settings.festival === f.id;
              return (
                <OptionTile key={f.id} active={active} onPress={() => setFestival(f.id)} style={{ width: tileW }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', height: BADGE_SLOT_H }}>
                    <View style={{ flex: 1 }}>
                      <Swatches colors={f.swatches} />
                    </View>
                    <BadgeSlot active={active} />
                  </View>
                  <AppText size="sm" weight="700" numberOfLines={1}>
                    {f.name}
                  </AppText>
                  <TileDesc>{tt(f.desc)}</TileDesc>
                </OptionTile>
              );
            })}
          </View>
        </>
      ) : null}
    </Card>
  );

  const layoutCard = (
    <Card rounded="xl" padded={16} shadow="md" style={{ borderWidth: 0, gap: 14 }}>
      <SecTitle label={tt('โครงหน้าจอ')} />
      <AppText size="sm" weight="600">
        {tt('ระยะห่าง')}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {(
          [
            ['compact', tt('กระชับ'), 3, 6],
            ['normal', tt('ปกติ'), 6, 8],
            ['comfortable', tt('สบาย'), 9, 10],
          ] as Array<[DensityId, string, number, number]>
        ).map(([id, label, gap, bar]) => {
          const active = settings.density === id;
          return (
            <OptionTile key={id} active={active} onPress={() => setDensity(id)} style={{ width: tileW }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: BADGE_SLOT_H }}>
                <AppText size="sm" weight="700" style={{ flex: 1 }} numberOfLines={1}>
                  {label}
                </AppText>
                <BadgeSlot active={active} />
              </View>
              <DensityPreview gap={gap} bar={bar} />
            </OptionTile>
          );
        })}
      </View>
      <RowDivider />

      <AppText size="sm" weight="600">
        Sidebar
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {(
          [
            ['normal', tt('ปกติ')],
            ['compact', tt('เล็ก')],
          ] as Array<['normal' | 'compact', string]>
        ).map(([id, label]) => {
          const active = settings.sidebar === id;
          return (
            <OptionTile key={id} active={active} onPress={() => setSidebar(id)} style={{ width: tileW }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: BADGE_SLOT_H }}>
                <AppText size="sm" weight="700" style={{ flex: 1 }} numberOfLines={1}>
                  {label}
                </AppText>
                <BadgeSlot active={active} />
              </View>
              <SidebarPreview compact={id === 'compact'} />
            </OptionTile>
          );
        })}
      </View>
      <AppText size="xs" muted>
        {tt('มีผลบนจอกว้าง — จอแคบระบบย่อ Sidebar ให้อัตโนมัติอยู่แล้ว')}
      </AppText>
    </Card>
  );

  const fontCard = (
    <Card rounded="xl" padded={16} shadow="md" style={{ borderWidth: 0, gap: 14 }}>
      <SecTitle label={tt('ตัวอักษร')} />
      <AppText size="sm" weight="600">
        {tt('รูปลักษณ์')}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {FONT_LIST.map((f) => {
          const active = settings.fontId === f.id;
          return (
            <OptionTile key={f.id} active={active} onPress={() => setFontId(f.id)} style={{ width: twoCol ? '47.6%' : tileW }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <BadgeSlot active={active} align="flex-start" />
                  <AppText size="sm" weight="600" numberOfLines={1} style={{ fontFamily: uiFontFamily(f.id, '600') }}>
                    {tt('สบายดี')}
                  </AppText>
                  <TileDesc>{tt(f.name)}</TileDesc>
                </View>
                <AppText size={30} weight="700" color={withAlpha(c.mutedForeground, 0.55)} style={{ fontFamily: uiFontFamily(f.id, '700') }}>
                  Aa
                </AppText>
              </View>
            </OptionTile>
          );
        })}
      </View>
      <RowDivider />

      <Row label={tt('ตัวอักษรตัวหนา')}>
        <Toggle value={settings.fontBold} onChange={setFontBold} />
      </Row>
      <RowDivider />

      <AppText size="sm" weight="600">
        {tt('ขนาด')}
      </AppText>
      <SizeSlider value={settings.fontSize} onChange={setFontSize} />
    </Card>
  );

  const langCard = (
    <Card rounded="xl" padded={16} shadow="md" style={{ borderWidth: 0, gap: 14 }}>
      <SecTitle label={tt('ภาษา · Language')} />
      <View style={{ gap: 10 }}>
        {(
          [
            ['th', '🇹🇭', 'ไทย', 'Thai'],
            ['en', '🇬🇧', 'English', 'อังกฤษ'],
          ] as Array<['th' | 'en', string, string, string]>
        ).map(([id, flag, name, sub]) => {
          const active = settings.language === id;
          return (
            <OptionTile key={id} active={active} onPress={() => setLanguage(id)} style={{ width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: BADGE_SLOT_H }}>
                <AppText size={19}>{flag}</AppText>
                <AppText size="sm" weight="700" style={{ flex: 1 }} numberOfLines={1}>
                  {name}
                </AppText>
                <BadgeSlot active={active} />
              </View>
              <AppText size="xs" muted numberOfLines={1}>
                {sub}
              </AppText>
            </OptionTile>
          );
        })}
      </View>
      <AppText size="xs" muted>
        {tt('เปลี่ยนแล้วหน้าจอเปลี่ยนภาษาทันที — ข้อมูลผู้ป่วยยังคงแสดงตามที่บันทึกไว้เดิม')}
      </AppText>
    </Card>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 240, gap: 2 }}>
          <AppText size="xxl" weight="700" color={t.isDark ? c.foreground : c.secondary}>
            {tt('ตั้งค่าระบบ · รูปลักษณ์')}
          </AppText>
          <AppText size="sm" weight="600" color={t.isDark ? c.accent : c.primaryStrong}>
            {tt('มีผลเฉพาะเครื่องนี้ · บันทึกอัตโนมัติ')}
          </AppText>
        </View>
        <Button
          label={tt('คืนค่าเริ่มต้น')}
          variant="outline"
          icon={<Ionicons name="arrow-down-outline" size={15} color={c.primary} />}
          onPress={() => {
            setFestOpen(false);
            resetAppearance();
          }}
        />
      </View>

      {twoCol ? (
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
          <View style={{ flex: 2, gap: 16 }}>
            {themeCard}
            {layoutCard}
          </View>
          <View style={{ flex: 1, gap: 16 }}>
            {fontCard}
            {langCard}
          </View>
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {themeCard}
          {fontCard}
          {layoutCard}
          {langCard}
        </View>
      )}
    </ScrollView>
  );
};
