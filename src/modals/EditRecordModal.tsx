import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppModal, AppText, Button, TextField } from '../components';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';

/** Modal แก้ไขรายการที่ซิงค์ไม่ผ่าน แล้วอัปโหลดใหม่ */
export const EditRecordModal: React.FC = () => {
  const t = useTheme();
  const { state, actions } = useApp();
  const idx = state.editingIdx;
  const rec = idx !== null ? state.records[idx] : null;
  const [value, setValue] = useState('');

  useEffect(() => {
    if (rec) setValue(rec.errorValue);
  }, [state.editingIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (idx === null || !rec) return null;

  return (
    <AppModal
      visible
      onClose={actions.closeEdit}
      title="แก้ไขรายการที่ซิงค์ไม่ผ่าน"
      titleBadge={
        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: t.colors.muted }}>
          <AppText size="xs" weight="600" mono>
            HN {rec.hn}
          </AppText>
        </View>
      }
      maxWidth={560}
      footer={
        <>
          <Button label="ยกเลิก" variant="outline" onPress={actions.closeEdit} />
          <Button label="บันทึกและอัปโหลดใหม่" onPress={() => actions.resubmit(idx, value)} />
        </>
      }
    >
      <View style={{ gap: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 9,
            padding: 12,
            borderRadius: t.radius.md,
            backgroundColor: t.tones.destructive.bg,
            borderWidth: 1,
            borderColor: t.tones.destructive.border,
          }}
        >
          <AppText size="sm" weight="700" color={t.tones.destructive.fg}>
            ⚠
          </AppText>
          <AppText size="sm" color={t.tones.destructive.fg} style={{ flex: 1 }}>
            {rec.error}
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <TextField label="ชื่อ-นามสกุล" value={rec.name} readonly containerStyle={{ flex: 1.3, minWidth: 180 }} />
          <TextField label="รายการบริการ" value={rec.service} readonly containerStyle={{ flex: 1, minWidth: 140 }} />
        </View>
        <TextField
          label={rec.errorField}
          required
          error
          mono
          value={value}
          onChangeText={setValue}
          hint="แก้ไขค่าตามที่ระบบ Cloud แจ้ง แล้วกดอัปโหลดใหม่"
        />
      </View>
    </AppModal>
  );
};
