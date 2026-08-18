import React from 'react';
import { Platform, Pressable, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../state/AppContext';
import { useTheme, withAlpha } from '../theme';
import { AnimatedPressable, AppText, StatusDot, Tooltip, useHoverFade, usePressScale } from '../components';
import { NAV, type NavDef } from './navItems';
import { Spotlight } from '../modals/Spotlight';
import { NoticeBell } from '../modals/NoticePanel';

/** โลโก้ NHIP — วงกลมเขียวเข้ม + ตัว N (Figma 16:859 · Frame 7 · 48px #1B4332) */
export const NhipMark: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const t = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: t.colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText size={Math.round(size * 0.67)} weight="600" color="#FFFFFF" style={{ lineHeight: size * 0.82 }}>
        N
      </AppText>
    </View>
  );
};

/** นิยามเมนูอยู่ที่ navItems.ts — Spotlight ใช้ชุดเดียวกัน */

const NavItem: React.FC<{ def: NavDef; active: boolean; compact: boolean; badge?: number; onPress: () => void }> = ({
  def,
  active,
  compact,
  badge,
  onPress,
}) => {
  const t = useTheme();
  const c = t.colors;
  /*
   * เมนูที่ไม่ได้เลือก = ไม่มีพื้นปุ่ม (โปร่งใสบนพื้นมิ้นต์) มีแค่ตอนชี้เมาส์เป็นไฮไลต์จาง ๆ ที่ค่อย ๆ ไล่เข้ามา
   * เมนูที่เลือก = เขียวทึบตัวหนังสือขาว ตัดกับพื้นมิ้นต์ชัดว่าอยู่หน้าไหน
   */
  const fg = active ? c.primaryForeground : t.isDark ? c.foreground : c.primaryStrong;
  const press = usePressScale(0.96);
  const h = useHoverFade();
  return (
    <AnimatedPressable
      onPress={onPress}
      {...press.handlers}
      {...h.handlers}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          height: 44,
          paddingHorizontal: compact ? 0 : 14,
          justifyContent: compact ? 'center' : 'flex-start',
          borderRadius: t.radius.md,
          backgroundColor: active ? c.primary : h.mix('transparent', withAlpha(c.card, 0.6)),
        },
        active ? t.shadow.md : null,
        press.pressStyle,
      ]}
    >
      <Ionicons name={def.icon} size={20} color={fg} />
      {compact ? null : (
        <AppText size="base" weight={active ? '600' : '500'} color={fg} style={{ flex: 1 }}>
          {def.label}
        </AppText>
      )}
      {!compact && badge ? (
        <View
          style={{
            minWidth: 22,
            paddingHorizontal: 6,
            height: 20,
            borderRadius: 10,
            backgroundColor: active ? withAlpha('#FFFFFF', 0.22) : t.tones.warning.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText size="xs" weight="600" mono color={active ? '#FFFFFF' : t.tones.warning.fg}>
            {badge}
          </AppText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
};

/** การ์ดผู้ใช้ท้าย sidebar (เขียวเข้ม) — ปุ่มลูกศร = ออกจากระบบ */
const UserCard: React.FC<{ compact: boolean }> = ({ compact }) => {
  const t = useTheme();
  const { state, actions, derived } = useApp();
  if (compact) {
    return (
      <Tooltip label="ออกจากระบบ" position="top" style={{ alignSelf: 'center' }}>
        <Pressable
          onPress={actions.logout}
          accessibilityLabel="ออกจากระบบ"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: t.colors.primaryStrong,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="log-out-outline" size={19} color="#FFFFFF" />
        </Pressable>
      </Tooltip>
    );
  }
  // Figma: 64 สูง · r100 · pad 8 · avatar 48 ขาว · ชื่อ 16/500 · สังกัด 12/400 · ปุ่มลูกศร 32 โปร่ง
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: t.radius.pill,
        backgroundColor: t.colors.primaryStrong,
      }}
    >
      <View
        style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}
      >
        <AppText size="md" weight="700" color={t.colors.primaryStrong}>
          สม
        </AppText>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText size="lg" weight="500" color="#FFFFFF" numberOfLines={1}>
          {state.userName}
        </AppText>
        <AppText size="xs" color="#FFFFFF" numberOfLines={1}>
          {derived.branchLabel}
        </AppText>
      </View>
      <Tooltip label="ออกจากระบบ" position="top">
        <Pressable
          onPress={actions.logout}
          accessibilityLabel="ออกจากระบบ"
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: withAlpha('#FFFFFF', 0.16),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-forward" size={15} color="#F1F3F5" />
        </Pressable>
      </Tooltip>
    </View>
  );
};

/** แถบบนของพื้นที่เนื้อหา: ค้นหา + สถานะออฟไลน์ + กระดิ่ง */
export const TopBar: React.FC<{ showLogo?: boolean; onSearch?: () => void }> = ({ showLogo = false, onSearch }) => {
  const t = useTheme();
  const c = t.colors;
  const { state, derived } = useApp();
  const { width } = useWindowDimensions();
  const compactInfo = width < 900;
  const [searchHover, setSearchHover] = React.useState(false);

  // Figma 16:859 · Frame 22 — สูง 84 · pad16 · ค้นหา 350×52 r12 · ขวา gap16: แท็บสถานะ · เส้นคั่น · กระดิ่ง 40
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 16 }}>
      {showLogo ? <NhipMark size={40} /> : null}
      <Pressable
        onPress={onSearch}
        disabled={!onSearch}
        onPointerEnter={() => setSearchHover(true)}
        onPointerLeave={() => setSearchHover(false)}
        style={{
          flex: 1,
          maxWidth: 300,
          height: 40,
          borderRadius: t.radius.md,
          backgroundColor: c.inputBg,
          borderWidth: 1,
          borderColor: searchHover ? withAlpha(c.primary, 0.4) : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
          paddingHorizontal: 13,
        }}
      >
        <Ionicons name="search" size={17} color={c.mutedForeground} />
        <AppText size="sm" muted numberOfLines={1} style={{ flex: 1 }}>
          ค้นหาผู้ป่วย...
        </AppText>
        {/* คีย์ลัดเปิด Spotlight */}
        {Platform.OS === 'web' && width >= 900 ? (
          <View
            style={{
              paddingHorizontal: 6,
              height: 20,
              borderRadius: 5,
              backgroundColor: withAlpha(c.mutedForeground, 0.13),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText size={10} weight="600" muted>
              ⌘K
            </AppText>
          </View>
        ) : null}
      </Pressable>
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            height: 28,
            paddingHorizontal: 12,
            borderRadius: t.radius.pill,
            backgroundColor: t.tones.neutral.bg,
          }}
        >
          <StatusDot color={c.mutedForeground} size={8} />
          <AppText size="sm" weight="600" muted numberOfLines={1}>
            {compactInfo
              ? `ออฟไลน์ · รอซิงค์ ${derived.pendingCount}`
              : `ออฟไลน์ · รอซิงค์ ${derived.pendingCount} รายการ · ซิงค์ล่าสุด ${state.lastSync}`}
          </AppText>
        </View>
        <View style={{ width: 1, height: 40, backgroundColor: c.border }} />
        <NoticeBell />
      </View>
    </View>
  );
};

export interface AppShellProps {
  children: React.ReactNode;
}

/**
 * โครงหน้าจอหลักหลัง login:
 * ≥1080px  → sidebar เต็ม (240px)  |  760–1079px → rail ไอคอน (72px)  |  <760px → bottom tab bar
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions, derived } = useApp();
  const { width } = useWindowDimensions();

  const layout: 'full' | 'rail' | 'phone' = width >= 1080 ? 'full' : width >= 760 ? 'rail' : 'phone';
  const compact = layout === 'rail';

  const [spotlight, setSpotlight] = React.useState(false);
  // คีย์ลัดเปิด Spotlight: ⌘K (mac) / Ctrl+K
  React.useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlight(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Figma 16:859 · Frame 21 — 250 กว้าง · โปร่งใสบนพื้นมิ้นต์ · pad16
  const sidebar = layout !== 'phone' && (
    <View
      style={{
        width: layout === 'full' ? 250 : 80,
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 20,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          justifyContent: compact ? 'center' : 'flex-start',
          paddingHorizontal: 2,
        }}
      >
        <NhipMark size={44} />
        {compact ? null : (
          <View style={{ flex: 1 }}>
            <AppText size="lg" weight="700" color={c.secondary} numberOfLines={1}>
              NHIP
            </AppText>
            <AppText size="xs" color={withAlpha(c.secondary, 0.7)} numberOfLines={1}>
              {state.facility.name}
            </AppText>
          </View>
        )}
      </View>

      <View style={{ gap: 18 }}>
        {(['บริการ', 'ตั้งค่า'] as const).map((section) => (
          <View key={section} style={{ gap: 6 }}>
            {compact ? null : (
              <AppText
                size="xs"
                weight="600"
                color={withAlpha(c.secondary, 0.55)}
                style={{ letterSpacing: 0.8, paddingHorizontal: 4, marginBottom: 2 }}
              >
                {section.toUpperCase()}
              </AppText>
            )}
            {NAV.filter((n) => n.section === section).map((n) => (
              <NavItem
                key={n.id}
                def={n}
                compact={compact}
                active={state.screen === n.id}
                badge={n.id === 'sync' && derived.pendingCount > 0 ? derived.pendingCount : undefined}
                onPress={() => actions.go(n.id)}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />
      <UserCard compact={compact} />
    </View>
  );

  const bottomBar = layout === 'phone' && (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: c.border,
        backgroundColor: c.card,
        paddingBottom: 6,
      }}
    >
      {NAV.map((n) => {
        const active = state.screen === n.id;
        return (
          <Pressable
            key={n.id}
            onPress={() => actions.go(n.id)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 8, gap: 3 }}
          >
            <View
              style={{
                width: 46,
                height: 28,
                borderRadius: 14,
                backgroundColor: active ? c.sidebarActive : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={n.icon} size={19} color={active ? (t.isDark ? c.primary : c.secondary) : c.mutedForeground} />
            </View>
            <AppText size={10} weight={active ? '600' : '400'} color={active ? (t.isDark ? c.primary : c.secondary) : c.mutedForeground}>
              {n.label === 'One Stop Service' ? 'บริการ OSS' : n.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  // Figma: พื้นหน้าเป็นมิ้นต์ #DBF2E3 · padding 8 · แผงเนื้อหาเป็นการ์ด #F8FAFC มุม 24
  const desktop = layout !== 'phone';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: desktop ? c.sidebar : c.background }}>
      <View style={{ flex: 1, flexDirection: 'row', padding: desktop ? 8 : 0 }}>
        {sidebar}
        <View
          style={{
            flex: 1,
            backgroundColor: c.background,
            borderRadius: desktop ? t.radius.xl : 0,
            overflow: 'hidden',
          }}
        >
          <TopBar showLogo={layout === 'phone'} onSearch={() => setSpotlight(true)} />
          <View style={{ flex: 1 }}>{children}</View>
        </View>
      </View>
      {bottomBar}
      <Spotlight visible={spotlight} onClose={() => setSpotlight(false)} />
    </SafeAreaView>
  );
};
