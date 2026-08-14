import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, useThemeContext, withAlpha } from '../theme';
import { AppText } from './AppText';

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
 * - drawer: สไลด์จากขวา เต็มความสูง (เหมาะกับงานอ่านอิงระหว่างกรอกฟอร์ม)
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

  return (
    <Modal visible={visible} transparent animationType={drawer ? 'slide' : 'fade'} onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: withAlpha('#0B2D22', 0.45),
          flexDirection: 'row',
          justifyContent: drawer ? 'flex-end' : 'center',
          alignItems: drawer ? 'stretch' : 'center',
          padding: drawer ? 0 : 20,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            drawer
              ? {
                  width,
                  maxWidth: '92%',
                  backgroundColor: c.popover,
                  borderLeftWidth: 1,
                  borderLeftColor: c.border,
                }
              : {
                  width: '100%',
                  maxWidth: 640,
                  maxHeight: '85%',
                  borderRadius: t.radius.xl,
                  backgroundColor: c.popover,
                  overflow: 'hidden',
                },
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
              borderBottomColor: c.border,
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
                borderTopColor: c.border,
              }}
            >
              {footer}
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
