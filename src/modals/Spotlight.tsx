import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../components';
import { NAV } from '../navigation/navItems';
import { useApp } from '../state/AppContext';
import { useTheme, withAlpha } from '../theme';

const WEB_NO_OUTLINE = Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as TextStyle) : null;
/**
 * แผ่นแก้วเบลอแบบ Spotlight ของ macOS
 * RN Web ตัด backdropFilter ทิ้งถ้าส่งผ่าน style prop → ต้องเซ็ตลง DOM node ตรง ๆ ผ่าน ref
 */
const applyGlass = (node: unknown) => {
  if (Platform.OS !== 'web' || !node) return;
  const el = node as HTMLElement;
  if (!el.style) return;
  const blur = 'blur(26px) saturate(170%)';
  el.style.backdropFilter = blur;
  el.style.setProperty('-webkit-backdrop-filter', blur);
};

interface Item {
  key: string;
  group: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  run: () => void;
}

export interface SpotlightProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * ค้นหาแบบ Spotlight — แผ่นลอยกลางจอ ค้นผู้ป่วย (ชื่อ/HN/คิว) หน้าจอ และคำสั่งลัด
 * เปิดด้วยการกดช่องค้นหาบนแถบบน หรือ ⌘K / Ctrl+K · เลื่อนด้วย ↑↓ · เปิดด้วย ↵ · ปิดด้วย esc
 */
export const Spotlight: React.FC<SpotlightProps> = ({ visible, onClose }) => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const panelRef = useRef<unknown>(null);
  const anim = useRef(new Animated.Value(0)).current;

  /*
   * RN Web เขียนทับ inline style ของ node ทุกครั้งที่ re-render → backdrop-filter หลุดได้
   * จึงยัดกลับทุกเฟรมแรกหลังเปิด (สองรอบ rAF) เผื่อ node ยังไม่ถูก attach ตอน ref ทำงานครั้งแรก
   */
  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return undefined;
    const a = requestAnimationFrame(() => applyGlass(panelRef.current));
    const b = requestAnimationFrame(() => applyGlass(panelRef.current));
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [visible]);

  const items = useMemo<Item[]>(() => {
    const term = q.trim().toLowerCase();
    const out: Item[] = [];

    // ผู้ป่วยในคิววันนี้ — ค้นจากชื่อ / HN / เลขคิว
    const hits = term
      ? state.records
          .map((r, i) => ({ r, i }))
          .filter(
            ({ r }) =>
              r.name.toLowerCase().includes(term) ||
              r.hn.toLowerCase().includes(term) ||
              r.queueNo.toLowerCase().includes(term),
          )
      : [];
    hits.slice(0, 6).forEach(({ r, i }) => {
      out.push({
        key: `p-${r.hn}`,
        group: 'ผู้ป่วยในคิววันนี้',
        icon: 'person-outline',
        title: r.name,
        sub: `HN ${r.hn} · คิว ${r.queueNo} · ${r.age} ปี`,
        run: () => actions.openEncounter(i),
      });
    });

    // หน้าจอ
    NAV.filter((n) => !term || n.label.toLowerCase().includes(term)).forEach((n) =>
      out.push({
        key: `n-${n.id}`,
        group: 'ไปที่หน้า',
        icon: n.icon,
        title: n.label,
        sub: n.section,
        run: () => actions.go(n.id),
      }),
    );

    // คำสั่งลัด
    const cmds: Array<{ key: string; icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; run: () => void }> = [
      { key: 'reg', icon: 'card-outline', title: 'อ่านบัตรประชาชน · ลงทะเบียน', sub: 'รับผู้ป่วยรายใหม่เข้าคิว', run: actions.openReg },
      { key: 'sync', icon: 'cloud-upload-outline', title: 'เริ่มซิงค์ขึ้น Cloud', sub: 'อัปโหลดรายการที่ค้างอยู่', run: actions.startSync },
    ];
    cmds
      .filter((x) => !term || x.title.toLowerCase().includes(term))
      .forEach((x) => out.push({ key: `c-${x.key}`, group: 'คำสั่ง', icon: x.icon, title: x.title, sub: x.sub, run: x.run }));

    return out;
  }, [q, state.records, actions]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    if (visible) {
      setQ('');
      setSel(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: t.reduceMotion ? 0 : 170,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
      const id = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
    anim.setValue(0);
    return undefined;
  }, [visible, anim, t.reduceMotion]);

  // คีย์บอร์ดบนเว็บ: ↑↓ เลื่อน · ↵ เปิด · esc ปิด
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => (items.length ? (s + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => (items.length ? (s - 1 + items.length) % items.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const it = items[sel];
        if (it) {
          onClose();
          it.run();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    /*
     * ต้องดักที่ capture phase — RN Web TextInput เรียก stopPropagation() บน keydown
     * ทำให้ listener แบบ bubble ที่ document ไม่เคยได้รับ event เลยตอนเคอร์เซอร์อยู่ในช่องพิมพ์
     */
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [visible, items, sel, onClose]);

  // เลื่อนรายการที่เลือกให้อยู่ในสายตาเสมอเวลากดลูกศรลงไปเรื่อย ๆ
  const rowRefs = useRef<Record<number, unknown>>({});
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = rowRefs.current[sel] as HTMLElement | undefined;
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [sel]);

  const pick = (it: Item) => {
    onClose();
    it.run();
  };

  const panel = {
    opacity: anim,
    transform: [
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
    ],
  };

  let lastGroup = '';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: withAlpha('#0B2D22', 0.42), alignItems: 'center', paddingTop: '10%', paddingHorizontal: 20 }}
      >
        <Animated.View style={[{ width: '100%', maxWidth: 640 }, panel]}>
          <Pressable
            ref={(n) => {
              panelRef.current = n;
              applyGlass(n);
            }}
            onPress={(e) => e.stopPropagation()}
            style={[
              {
                borderRadius: 20,
                overflow: 'hidden',
                // ทึบพอให้อ่านง่าย เหลือความโปร่งไว้แค่พอให้เห็นว่าเป็นแผ่นแก้วลอย
                backgroundColor: withAlpha(c.popover, Platform.OS === 'web' ? 0.97 : 1),
                borderWidth: 1,
                borderColor: withAlpha(t.isDark ? '#FFFFFF' : c.border, t.isDark ? 0.14 : 1),
              },
              t.shadow.lg,
            ]}
          >
            {/* ช่องพิมพ์ */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, height: 60 }}>
              <Ionicons name="search" size={21} color={c.mutedForeground} />
              <TextInput
                ref={inputRef}
                value={q}
                onChangeText={setQ}
                placeholder="ค้นหาผู้ป่วย · หน้าจอ · คำสั่ง"
                placeholderTextColor={c.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={() => items[sel] && pick(items[sel])}
                style={[
                  { flex: 1, fontFamily: t.font('400'), fontSize: t.fs.xl, color: c.foreground, paddingVertical: 0 },
                  WEB_NO_OUTLINE,
                ]}
              />
              {q ? (
                <Pressable onPress={() => setQ('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={19} color={c.mutedForeground} />
                </Pressable>
              ) : null}
            </View>

            <View style={{ height: 1, backgroundColor: withAlpha(c.border, 0.9) }} />

            {items.length === 0 ? (
              <View style={{ padding: 28, alignItems: 'center', gap: 6 }}>
                <Ionicons name="search-outline" size={26} color={c.mutedForeground} />
                <AppText size="sm" muted>
                  ไม่พบ “{q}” ในคิววันนี้
                </AppText>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ paddingVertical: 6 }}>
                {items.map((it, i) => {
                  const head = it.group !== lastGroup ? it.group : null;
                  lastGroup = it.group;
                  const on = i === sel;
                  return (
                    <React.Fragment key={it.key}>
                      {head ? (
                        <AppText
                          size="xs"
                          weight="600"
                          muted
                          style={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 4, letterSpacing: 0.5 }}
                        >
                          {head}
                        </AppText>
                      ) : null}
                      <Pressable
                        ref={(n) => {
                          rowRefs.current[i] = n;
                        }}
                        onPress={() => pick(it)}
                        onPointerEnter={() => setSel(i)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          marginHorizontal: 8,
                          paddingHorizontal: 10,
                          height: 50,
                          borderRadius: t.radius.md,
                          backgroundColor: on ? withAlpha(c.primary, t.isDark ? 0.28 : 0.12) : 'transparent',
                        }}
                      >
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 9,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: on ? c.primary : withAlpha(c.mutedForeground, 0.14),
                          }}
                        >
                          <Ionicons name={it.icon} size={17} color={on ? '#FFFFFF' : c.mutedForeground} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <AppText size="base" weight="600" numberOfLines={1}>
                            {it.title}
                          </AppText>
                          {it.sub ? (
                            <AppText size="xs" muted numberOfLines={1} mono={it.group === 'ผู้ป่วยในคิววันนี้'}>
                              {it.sub}
                            </AppText>
                          ) : null}
                        </View>
                        {it.right}
                        {on ? <Ionicons name="return-down-back-outline" size={16} color={c.mutedForeground} /> : null}
                      </Pressable>
                    </React.Fragment>
                  );
                })}
              </ScrollView>
            )}

            {/* แถบคีย์ลัดล่างสุด */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingHorizontal: 18,
                height: 36,
                borderTopWidth: 1,
                borderTopColor: withAlpha(c.border, 0.9),
              }}
            >
              <AppText size="xs" muted>
                ↑↓ เลื่อน
              </AppText>
              <AppText size="xs" muted>
                ↵ เปิด
              </AppText>
              <AppText size="xs" muted>
                esc ปิด
              </AppText>
              <View style={{ flex: 1 }} />
              <AppText size="xs" muted mono>
                {items.length} รายการ
              </AppText>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};
