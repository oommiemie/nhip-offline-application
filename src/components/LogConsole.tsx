import React, { useEffect, useRef } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { LogLine } from '../state/types';
import { AppText } from './AppText';

export interface LogConsoleProps {
  lines: LogLine[];
  emptyText?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * กล่อง terminal log พื้นเขียวเข้ม (#0B2D22) ตาม Figma
 * โทนสี: cmd = ข้อความคำสั่ง, ok = สำเร็จ (เขียว), err = ผิดพลาด (แดง), info = รายละเอียด
 * เลื่อนลงล่างสุดอัตโนมัติเมื่อมีบรรทัดใหม่
 */
export const LogConsole: React.FC<LogConsoleProps> = ({ lines, emptyText, height = 200, style }) => {
  const t = useTheme();
  const c = t.colors;
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    const id = setTimeout(() => ref.current?.scrollToEnd({ animated: !t.reduceMotion }), 40);
    return () => clearTimeout(id);
  }, [lines.length, t.reduceMotion]);

  const toneColor: Record<LogLine['tone'], string> = {
    cmd: c.terminalCmd,
    ok: c.terminalOk,
    err: c.terminalErr,
    info: c.terminalInfo,
  };

  return (
    <View
      style={[
        { height, borderRadius: t.radius.md, backgroundColor: c.terminalBg, overflow: 'hidden' },
        style,
      ]}
    >
      <ScrollView ref={ref} contentContainerStyle={{ padding: 12, gap: 3 }}>
        {lines.length === 0 && emptyText ? (
          <AppText size="xs" mono color={c.terminalInfo} style={{ opacity: 0.75 }}>
            {emptyText}
          </AppText>
        ) : (
          lines.map((l, i) => (
            <AppText key={`${i}-${l.text.slice(0, 12)}`} size="xs" mono color={toneColor[l.tone]}>
              {l.text}
            </AppText>
          ))
        )}
      </ScrollView>
    </View>
  );
};
