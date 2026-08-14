import React from 'react';
import { Pressable, ScrollView, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export interface Column<T> {
  key: string;
  title: string;
  /** ความกว้างคงที่ (px) — ไม่ระบุ = ยืดตาม flex */
  width?: number;
  flex?: number;
  align?: 'left' | 'right' | 'center';
  render: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Array<Column<T>>;
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowPress?: (item: T, index: number) => void;
  selectedIndex?: number | null;
  /** ความกว้างขั้นต่ำของตาราง — ถ้าจอแคบกว่านี้จะเลื่อนแนวนอนได้ */
  minWidth?: number;
  /** แถวสลับสี — ค่าเริ่มต้นปิด ตาม Figma (แถวขาวล้วน คั่นด้วยเส้น #E5E7EB) */
  striped?: boolean;
  empty?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const alignToFlex = (a?: 'left' | 'right' | 'center') =>
  a === 'right' ? 'flex-end' : a === 'center' ? 'center' : 'flex-start';

/**
 * ตารางข้อมูลมาตรฐานของระบบ: หัวเทา, แถวสลับสี, แถวที่เลือกมีแถบเขียวซ้าย
 * ความสูงแถวมาจาก density ของธีม (compact/normal/comfortable)
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  selectedIndex = null,
  minWidth,
  striped = false,
  empty,
  style,
}: DataTableProps<T>): React.ReactElement {
  const t = useTheme();
  const c = t.colors;
  const { width: winW } = useWindowDimensions();
  const needScroll = !!minWidth && minWidth > winW - 48;
  const [hover, setHover] = React.useState<number | null>(null);

  const table = (
    <View style={{ minWidth: needScroll ? minWidth : undefined, flexGrow: 1 }}>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: c.tableHeader,
          paddingHorizontal: 8,
        }}
      >
        {columns.map((col) => (
          <View
            key={col.key}
            style={{
              width: col.width,
              flex: col.width ? undefined : (col.flex ?? 1),
              minHeight: 45,
              justifyContent: 'center',
              alignItems: alignToFlex(col.align),
              paddingHorizontal: 8,
            }}
          >
            <AppText size="base" weight="600" muted numberOfLines={1}>
              {col.title}
            </AppText>
          </View>
        ))}
      </View>
      {/* rows */}
      {data.length === 0 && empty ? (
        <View style={{ paddingVertical: 36, alignItems: 'center' }}>{empty}</View>
      ) : (
        data.map((item, i) => {
          const selected = selectedIndex === i;
          const rowBg = selected ? c.tableRowSelected : striped && i % 2 === 1 ? c.tableRowAlt : c.card;
          return (
            <Pressable
              key={keyExtractor(item, i)}
              onPress={onRowPress ? () => onRowPress(item, i) : undefined}
              disabled={!onRowPress}
              onPointerEnter={onRowPress ? () => setHover(i) : undefined}
              onPointerLeave={onRowPress ? () => setHover((h) => (h === i ? null : h)) : undefined}
              style={({ pressed }) => ({
                flexDirection: 'row',
                minHeight: t.density.rowH,
                backgroundColor: pressed || hover === i ? c.tableRowSelected : rowBg,
                borderBottomWidth: 1,
                borderBottomColor: c.border,
                borderLeftWidth: selected ? 3 : 0,
                borderLeftColor: c.primary,
                paddingHorizontal: 8,
              })}
            >
              {columns.map((col) => (
                <View
                  key={col.key}
                  style={{
                    width: col.width,
                    flex: col.width ? undefined : (col.flex ?? 1),
                    justifyContent: 'center',
                    alignItems: alignToFlex(col.align),
                    paddingHorizontal: 8,
                    paddingVertical: 12,
                  }}
                >
                  {col.render(item, i)}
                </View>
              ))}
            </Pressable>
          );
        })
      )}
    </View>
  );

  if (needScroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator style={style}>
        {table}
      </ScrollView>
    );
  }
  return <View style={style}>{table}</View>;
}
