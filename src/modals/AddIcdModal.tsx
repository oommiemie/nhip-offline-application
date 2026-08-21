import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppModal, AppText, Badge, Button, TextField } from '../components';
import { ICD_CATALOG } from '../state/mockData';
import { useTheme, withAlpha } from '../theme';
import { useT } from '../i18n';

export interface AddIcdModalProps {
  visible: boolean;
  /** รหัสที่มีอยู่แล้วของคนไข้ — ตัดออกจากรายการให้เลือก */
  existingCodes: string[];
  onClose: () => void;
  onAdd: (code: string, name: string, kind: string) => void;
}

/**
 * popup เพิ่มการวินิจฉัย ICD-10 — ค้นจากรหัสหรือชื่อโรค เลือกชนิดหลัก/ร่วม แล้วกดเพิ่ม
 * แคตตาล็อกเป็นรหัสที่พบบ่อยใน รพ.สต. (mock) — ของจริงต่อกับฐาน ICD-10 ที่ดาวน์โหลดตอน setup
 */
export const AddIcdModal: React.FC<AddIcdModalProps> = ({ visible, existingCodes, onClose, onAdd }) => {
  const t = useTheme();
  const tt = useT();
  const c = t.colors;
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<[string, string] | null>(null);
  const [kind, setKind] = useState<'หลัก' | 'ร่วม'>('หลัก');

  // เปิดใหม่ → ล้างคำค้น/ตัวเลือก และตั้งชนิดอัตโนมัติ: มีโรคหลักแล้วให้เริ่มที่ "ร่วม"
  useEffect(() => {
    if (visible) {
      setQ('');
      setPicked(null);
      setKind(existingCodes.length > 0 ? 'ร่วม' : 'หลัก');
    }
  }, [visible, existingCodes.length]);

  const results = useMemo(() => {
    const key = q.trim().toLowerCase();
    return ICD_CATALOG.filter(([code, name]) => {
      if (existingCodes.includes(code)) return false;
      if (!key) return true;
      return code.toLowerCase().includes(key) || name.toLowerCase().includes(key);
    });
  }, [q, existingCodes]);

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={tt('เพิ่มการวินิจฉัย (ICD-10)')}
      maxWidth={560}
      footer={
        <>
          <Button label={tt('ยกเลิก')} variant="outline" onPress={onClose} />
          <Button
            label={tt('เพิ่มการวินิจฉัย')}
            disabled={!picked}
            onPress={() => {
              if (picked) onAdd(picked[0], picked[1], kind);
              onClose();
            }}
          />
        </>
      }
    >
      <View style={{ gap: 12 }}>
        <TextField
          value={q}
          onChangeText={(v) => {
            setQ(v);
            setPicked(null);
          }}
          placeholder={tt('ค้นด้วยรหัส (เช่น I10) หรือชื่อโรค')}
          icon="search-outline"
        />

        {/* ชนิดการวินิจฉัย */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppText size="sm" weight="600" style={{ marginRight: 2 }}>
            {tt('ชนิด')}
          </AppText>
          {(['หลัก', 'ร่วม'] as const).map((k) => {
            const on = kind === k;
            return (
              <Pressable
                key={k}
                onPress={() => setKind(k)}
                style={{
                  paddingHorizontal: 16,
                  height: 34,
                  borderRadius: t.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: on ? c.primary : c.card,
                  borderWidth: 1,
                  borderColor: on ? c.primary : c.border,
                }}
              >
                <AppText size="sm" weight={on ? '700' : '400'} color={on ? c.primaryForeground : c.foreground}>
                  {tt(k)}
                </AppText>
              </Pressable>
            );
          })}
          <AppText size="xs" muted style={{ flex: 1 }}>
            {kind === 'หลัก' ? tt('โรคหลักของการมาครั้งนี้') : tt('โรคที่พบร่วม')}
          </AppText>
        </View>

        {/* ผลการค้นหา */}
        <View style={{ borderRadius: t.radius.md, backgroundColor: c.surface2, overflow: 'hidden' }}>
          <ScrollView style={{ maxHeight: 320 }}>
            {results.length ? (
              results.map(([code, name], i) => {
                const on = picked?.[0] === code;
                return (
                  <Pressable
                    key={code}
                    onPress={() => setPicked([code, name])}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 11,
                      paddingHorizontal: 13,
                      paddingVertical: 11,
                      backgroundColor: on ? t.tones.primary.bg : 'transparent',
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: withAlpha(c.border, 0.6),
                    }}
                  >
                    <AppText size="sm" weight="700" mono color={c.primary} style={{ minWidth: 58 }}>
                      {code}
                    </AppText>
                    <AppText size="sm" weight={on ? '600' : '400'} style={{ flex: 1 }} numberOfLines={1}>
                      {name}
                    </AppText>
                    {on ? <Ionicons name="checkmark-circle" size={18} color={c.primary} /> : null}
                  </Pressable>
                );
              })
            ) : (
              <AppText size="sm" muted center style={{ paddingVertical: 22 }}>
                ไม่พบรหัสที่ตรงกับ “{q}”
              </AppText>
            )}
          </ScrollView>
        </View>

        {picked ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppText size="sm" muted>
              {tt('จะเพิ่ม:')}
            </AppText>
            <AppText size="sm" weight="700" mono color={c.primary}>
              {picked[0]}
            </AppText>
            <AppText size="sm" weight="600" style={{ flex: 1 }} numberOfLines={1}>
              {picked[1]}
            </AppText>
            <Badge label={tt(kind)} tone={kind === 'หลัก' ? 'primary' : 'neutral'} size="sm" />
          </View>
        ) : null}
      </View>
    </AppModal>
  );
};
