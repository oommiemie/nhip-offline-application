import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, withAlpha } from '../theme';
import { AppText } from './AppText';

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** ป้าย/monospace ต่อท้าย title เช่น HN */
  titleBadge?: React.ReactNode;
  maxWidth?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** ปิดไม่ได้ระหว่างทำงาน (เช่นกำลังซิงค์) */
  dismissable?: boolean;
}

/** Modal กลางจอ การ์ดขาวมุม 24 ตาม Figma (ลงทะเบียนคนไข้ใหม่ ฯลฯ) */
export const AppModal: React.FC<AppModalProps> = ({
  visible,
  onClose,
  title,
  titleBadge,
  maxWidth = 620,
  children,
  footer,
  dismissable = true,
}) => {
  const t = useTheme();
  const c = t.colors;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismissable ? onClose : () => {}}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable
          onPress={dismissable ? onClose : undefined}
          style={{
            flex: 1,
            backgroundColor: withAlpha('#0B2D22', 0.5),
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              {
                width: '100%',
                maxWidth,
                maxHeight: '92%',
                borderRadius: t.radius.xl,
                backgroundColor: c.popover,
                overflow: 'hidden',
              },
              t.shadow.lg,
            ]}
          >
            {title ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                }}
              >
                <AppText size="lg" weight="700" style={{ flex: 1 }}>
                  {title}
                </AppText>
                {titleBadge}
                <Pressable
                  onPress={onClose}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: c.muted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={18} color={c.foreground} />
                </Pressable>
              </View>
            ) : null}
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: footer ? 8 : 20 }}>
              {children}
            </ScrollView>
            {footer ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: c.border,
                }}
              >
                {footer}
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};
