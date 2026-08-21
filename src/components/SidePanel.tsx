import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, useThemeContext, withAlpha } from '../theme';
import { AppText } from './AppText';

const NATIVE = Platform.OS !== 'web';

export interface SidePanelProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  caption?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** บังคับโหมด — ปกติอ่านจากการตั้งค่า (drawer ขวา หรือ modal กลางจอ) */
  mode?: 'drawer' | 'modal';
  width?: number;
}

/**
 * <SidePanel> = คอมโพเนนต์เดียวใช้ได้ 2 โหมดตามการตั้งค่าผู้ใช้
 * - drawer: การ์ดกระจกลอยขอบขวา สไลด์เข้า-ออกทางขวา ไม่มีฉากหลังมืด
 * - modal:  การ์ดกลางจอ (เหมาะกับงานที่ต้องยืนยัน โฟกัสเดียว)
 */
export const SidePanel: React.FC<SidePanelProps> = ({
  visible,
  onClose,
  title,
  caption,
  children,
  footer,
  mode,
  width = 560,
}) => {
  const t = useTheme();
  const { settings } = useThemeContext();
  const c = t.colors;
  const drawer = (mode ?? settings.panelMode) === 'drawer';

  /*
   * สไลด์เอง (Modal ของ RN สไลด์จากล่างเท่านั้น):
   * เปิด = ไถลจากพ้นขอบขวาเข้าตำแหน่ง · ปิด = ไถลกลับออกไปทางขวา แล้วค่อยถอด Modal
   */
  const [mounted, setMounted] = useState(visible);
  const slide = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (!drawer) {
      setMounted(visible);
      return;
    }
    if (visible) {
      setMounted(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: t.reduceMotion ? 0 : 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE,
      }).start();
    } else {
      Animated.timing(slide, {
        toValue: 0,
        duration: t.reduceMotion ? 0 : 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: NATIVE,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, drawer, slide, t.reduceMotion]);

  if (!mounted && !visible) return null;

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [width + 48, 0] });

  return (
    <Modal
      visible={drawer ? mounted : visible}
      transparent
      animationType={drawer ? 'none' : 'fade'}
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          // drawer ไม่มีฉากหลังมืด — เห็นหน้าจอเดิมเต็ม ๆ (กดพื้นที่ว่างเพื่อปิดได้เหมือนเดิม)
          backgroundColor: drawer ? 'transparent' : withAlpha(t.festive?.scrimBase ?? '#0B2D22', 0.45),
          flexDirection: 'row',
          justifyContent: drawer ? 'flex-end' : 'center',
          alignItems: drawer ? 'stretch' : 'center',
          padding: drawer ? 16 : 20,
        }}
      >
        <Animated.View
          style={[
            { maxWidth: '92%' },
            drawer ? { width, transform: [{ translateX }] as never } : { width: '100%', maxWidth: 640, maxHeight: '85%' },
          ]}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              {
                flex: drawer ? 1 : undefined,
                borderRadius: t.radius.xl,
                overflow: 'hidden',
              },
              drawer
                ? {
                    // การ์ดกระจกลอยขอบขวา: พื้นโปร่ง + เบลอฉากหลัง (native ใช้พื้นเกือบทึบแทน)
                    backgroundColor: withAlpha(t.isDark ? c.popover : '#FFFFFF', Platform.OS === 'web' ? 0.72 : 0.97),
                    borderWidth: 1,
                    borderColor: withAlpha('#FFFFFF', t.isDark ? 0.08 : 0.6),
                  }
                : { backgroundColor: c.popover },
              drawer && Platform.OS === 'web'
                ? ({
                    backdropFilter: 'blur(26px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(26px) saturate(1.4)',
                  } as unknown as ViewStyle)
                : null,
              t.shadow.lg,
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: withAlpha(c.border, 0.55),
              }}
            >
              <View style={{ flex: 1 }}>
                <AppText size="md" weight="700">
                  {title}
                </AppText>
                {caption ? (
                  <AppText size="xs" muted>
                    {caption}
                  </AppText>
                ) : null}
              </View>
              <Pressable
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: c.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={17} color={c.foreground} />
              </Pressable>
            </View>
            <ScrollView style={{ flexGrow: drawer ? 1 : 0 }} contentContainerStyle={{ padding: 18 }}>
              {children}
            </ScrollView>
            {footer ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 10,
                  paddingHorizontal: 18,
                  paddingVertical: 13,
                  borderTopWidth: 1,
                  borderTopColor: withAlpha(c.border, 0.55),
                }}
              >
                {footer}
              </View>
            ) : null}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};
