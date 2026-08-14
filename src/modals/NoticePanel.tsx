import React, { useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText, StatusDot } from '../components';
import { useApp } from '../state/AppContext';
import type { AppNotice, NoticeTone } from '../state/types';
import { useTheme, withAlpha } from '../theme';
import type { Tone } from '../theme';

const PANEL_W = 360;

const ICON: Record<NoticeTone, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  warning: 'alert-circle',
  destructive: 'close-circle',
  info: 'information-circle',
};

/** แถวแจ้งเตือน 1 รายการ */
const NoticeRow: React.FC<{ n: AppNotice; onPress: () => void }> = ({ n, onPress }) => {
  const t = useTheme();
  const c = t.colors;
  const [hover, setHover] = useState(false);
  const tone = t.tones[n.tone as Tone];
  return (
    <Pressable
      onPress={onPress}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        flexDirection: 'row',
        gap: 11,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: hover ? withAlpha(c.primary, 0.05) : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: t.tones.neutral.bg,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: tone.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={ICON[n.tone]} size={17} color={tone.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <AppText size="sm" weight={n.read ? '500' : '600'} numberOfLines={2} style={{ flex: 1 }}>
            {n.title}
          </AppText>
          {n.read ? null : <StatusDot color={c.primary} size={7} />}
        </View>
        {n.detail ? (
          <AppText size="xs" muted numberOfLines={2}>
            {n.detail}
          </AppText>
        ) : null}
        <AppText size="xs" muted mono>
          {n.time} น.
        </AppText>
      </View>
    </Pressable>
  );
};

/**
 * กระดิ่งแจ้งเตือนบนแถบบน + แผงรายการที่กางออกใต้ปุ่ม
 * ตำแหน่งแผงวัดจากปุ่มจริงด้วย measureInWindow (แพทเทิร์นเดียวกับ SelectField)
 */
export const NoticeBell: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions, derived } = useApp();
  const { width: winW } = useWindowDimensions();
  const btnRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [anchor, setAnchor] = useState({ left: 0, top: 0 });
  const anim = useRef(new Animated.Value(0)).current;

  const unread = derived.unreadNotices;

  const show = () => {
    btnRef.current?.measureInWindow((x, y, w, h) => {
      // ชิดขวาปุ่ม แต่ไม่ให้ล้นขอบจอ
      const left = Math.max(12, Math.min(x + w - PANEL_W, winW - PANEL_W - 12));
      setAnchor({ left, top: y + h + 8 });
      setOpen(true);
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: t.reduceMotion ? 0 : 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
  };

  const pick = (n: AppNotice) => {
    setOpen(false);
    actions.markNoticeRead(n.id);
    if (n.screen) actions.go(n.screen);
  };

  return (
    <>
      <Pressable
        ref={btnRef}
        onPress={show}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        accessibilityLabel={unread ? `การแจ้งเตือน ${unread} รายการใหม่` : 'การแจ้งเตือน'}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: open || hover ? t.tones.primary.bg : c.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={unread ? 'notifications' : 'notifications-outline'}
          size={18}
          color={open || hover ? c.primaryStrong : c.mutedForeground}
        />
        {unread ? (
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 3,
              minWidth: 16,
              height: 16,
              paddingHorizontal: 4,
              borderRadius: 8,
              backgroundColor: c.destructive,
              borderWidth: 2,
              borderColor: c.background,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText size={9} weight="700" mono color="#FFFFFF">
              {unread > 9 ? '9+' : unread}
            </AppText>
          </View>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1 }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: anchor.left,
                top: anchor.top,
                width: PANEL_W,
                borderRadius: t.radius.lg,
                backgroundColor: c.popover,
                borderWidth: 1,
                borderColor: c.border,
                overflow: 'hidden',
                opacity: anim,
                transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
              },
              t.shadow.lg,
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* หัวแผง */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 14,
                  height: 46,
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                }}
              >
                <AppText size="sm" weight="700" style={{ flex: 1 }}>
                  การแจ้งเตือน
                </AppText>
                {unread ? (
                  <Pressable onPress={actions.markAllNoticesRead} hitSlop={6}>
                    <AppText size="xs" weight="600" color={c.primary}>
                      อ่านทั้งหมด
                    </AppText>
                  </Pressable>
                ) : null}
              </View>

              {state.notices.length === 0 ? (
                <View style={{ padding: 30, alignItems: 'center', gap: 8 }}>
                  <Ionicons name="notifications-off-outline" size={26} color={c.mutedForeground} />
                  <AppText size="sm" muted>
                    ยังไม่มีการแจ้งเตือน
                  </AppText>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: 400 }}>
                  {state.notices.map((n) => (
                    <NoticeRow key={n.id} n={n} onPress={() => pick(n)} />
                  ))}
                </ScrollView>
              )}

              {state.notices.length ? (
                <Pressable
                  onPress={actions.clearNotices}
                  style={{ height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface2 }}
                >
                  <AppText size="xs" weight="600" muted>
                    ล้างการแจ้งเตือนทั้งหมด
                  </AppText>
                </Pressable>
              ) : null}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};
