import React, { useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import { AppModal, AppText, Button, SelectField, StatusDot, TextField } from '../components';
import { FigmaAssets } from '../assets';
import { RIGHT_OPTIONS, SERVICE_OPTIONS } from '../state/mockData';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';

/** ภาพบัตรประชาชนจริงจากไฟล์ Figma (node I31:12223;31:12142) */
const IdCardArt: React.FC = () => (
  <Image source={FigmaAssets.idCard} style={{ width: 118, height: 118 }} resizeMode="contain" />
);

/**
 * Modal ลงทะเบียนคนไข้ใหม่ · อ่านบัตรประชาชน (Figma node 31:12070 → 31:12234 → 31:12267)
 * step 1 ไม่พร้อมใช้งาน → step 2 พร้อมอ่าน → step 3 อ่านสำเร็จ + ฟอร์มตรวจสอบข้อมูล
 */
export const RegisterModal: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();

  const [right, setRight] = useState(RIGHT_OPTIONS[0]);
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [allergyMode, setAllergyMode] = useState<'deny' | 'has'>('deny');
  const [allergyDrug, setAllergyDrug] = useState('');

  // เปิด modal ใหม่ → ล้างฟอร์ม
  useEffect(() => {
    if (state.regOpen) {
      setRight(RIGHT_OPTIONS[0]);
      setService(SERVICE_OPTIONS[0]);
      setAllergyMode('deny');
      setAllergyDrug('');
    }
  }, [state.regOpen]);

  // อ่านบัตรสำเร็จ → เติมค่าตั้งต้นจากบัตร
  useEffect(() => {
    if (state.card) {
      setService(SERVICE_OPTIONS.includes(state.card.service) ? state.card.service : SERVICE_OPTIONS[0]);
      if (state.card.allergy) {
        setAllergyMode('has');
        setAllergyDrug(state.card.allergy);
      } else {
        setAllergyMode('deny');
        setAllergyDrug('');
      }
    }
  }, [state.card]);

  const reader = state.reader;
  const panel =
    reader === 'idle'
      ? {
          bg: c.surface2,
          border: c.border,
          title: c.foreground,
          dot: c.mutedForeground,
          text: 'ไม่พร้อมใช้งาน · กรุณาลองเชื่อมเครื่องอ่านบัตรอีกครั้ง',
        }
      : reader === 'read'
        ? {
            bg: t.isDark ? t.tones.success.bg : '#F0FDF5',
            border: t.tones.success.border,
            title: c.primary,
            dot: c.success,
            text: 'อ่านสำเร็จ · ตรวจสอบข้อมูลก่อนบันทึก',
          }
        : {
            bg: t.tones.info.bg,
            border: t.tones.info.border,
            title: t.tones.info.fg,
            dot: reader === 'reading' ? c.warning : c.success,
            text: reader === 'reading' ? 'กำลังอ่านข้อมูลจากชิพ…' : 'พร้อมอ่าน · กรุณาเสียบบัตรประชาชนในเครื่องอ่าน',
          };

  const card = state.card;

  return (
    <AppModal
      visible={state.regOpen}
      onClose={actions.closeReg}
      title="ลงทะเบียนคนไข้ใหม่ · อ่านบัตรประชาชน"
      maxWidth={620}
      footer={
        reader === 'read' ? (
          <>
            <Button label="ยกเลิก" variant="outline" onPress={actions.closeReg} />
            <Button
              label="ยืนยัน"
              variant="strong"
              disabled={!card}
              onPress={() =>
                actions.confirmReg({ right, service, allergy: allergyMode === 'has' ? allergyDrug || (card?.allergy ?? '') : '' })
              }
            />
          </>
        ) : undefined
      }
    >
      {/* แผงสถานะเครื่องอ่านบัตร */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          borderRadius: t.radius.lg,
          backgroundColor: panel.bg,
          borderWidth: 1,
          borderColor: panel.border,
        }}
      >
        <View style={{ flex: 1, gap: 8 }}>
          <AppText size="md" weight="700" color={panel.title}>
            บัตรประชาชน
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <StatusDot color={panel.dot} size={7} />
            <AppText size="sm" weight="600" muted style={{ flexShrink: 1 }}>
              {panel.text}
            </AppText>
          </View>
          {reader === 'idle' ? (
            <Button label="เชื่อมต่อเครื่องอ่านบัตร" variant="outline" size="sm" onPress={actions.connectReader} style={{ alignSelf: 'flex-start' }} />
          ) : reader === 'read' ? (
            <Button label="อ่านบัตรใหม่" variant="outline" size="sm" onPress={actions.rereadCard} style={{ alignSelf: 'flex-start' }} />
          ) : (
            <Button
              label={reader === 'reading' ? 'กำลังอ่าน…' : 'อ่านบัตร'}
              size="sm"
              loading={reader === 'reading'}
              onPress={actions.readCard}
              style={{ alignSelf: 'flex-start', backgroundColor: t.tones.info.fg }}
            />
          )}
        </View>
        <IdCardArt />
      </View>

      {/* step 3: ฟอร์มข้อมูล */}
      {reader === 'read' && card ? (
        <View style={{ gap: 16, marginTop: 16 }}>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: c.primary }} />
              <AppText size="md" weight="700">
                ข้อมูลผู้ป่วย
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <TextField label="เลขบัตรประชาชน (จากบัตร)" value={card.cid} readonly mono containerStyle={{ flex: 1, minWidth: 200 }} />
              <TextField label="ชื่อ-นามสกุล" value={card.name} readonly containerStyle={{ flex: 1.2, minWidth: 200 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <TextField label="เพศ" value={card.sex} readonly containerStyle={{ flex: 0.6, minWidth: 90 }} />
              <TextField label="วันเกิด" value={card.dob} readonly mono containerStyle={{ flex: 0.9, minWidth: 120 }} />
              <TextField label="ที่อยู่ตามบัตร" value={card.address} readonly containerStyle={{ flex: 2, minWidth: 220 }} />
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: c.info }} />
              <AppText size="md" weight="700">
                ข้อมูลการรับบริการ
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <SelectField label="สิทธิ์การรักษา" required value={right} options={RIGHT_OPTIONS} onChange={setRight} containerStyle={{ flex: 1, minWidth: 200 }} />
              <SelectField label="ประเภทบริการ" required value={service} options={SERVICE_OPTIONS} onChange={setService} containerStyle={{ flex: 1, minWidth: 200 }} />
            </View>
            <View style={{ gap: 6 }}>
              <AppText size="sm" weight="600">
                ประวัติแพ้ยา (สอบถามผู้ป่วย)
              </AppText>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {(
                  [
                    ['deny', 'ปฏิเสธการแพ้ยา'],
                    ['has', 'มีประวัติแพ้ยา'],
                  ] as Array<['deny' | 'has', string]>
                ).map(([mode, label]) => {
                  const on = allergyMode === mode;
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setAllergyMode(mode)}
                      style={{
                        height: t.density.inputH,
                        paddingHorizontal: 16,
                        borderRadius: t.radius.md,
                        borderWidth: on ? 1.5 : 1,
                        borderColor: on ? c.primary : c.border,
                        backgroundColor: on ? t.tones.primary.bg : c.card,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppText size="md" color={on ? c.accent : c.foreground} weight={on ? '600' : '400'}>
                        {label}
                      </AppText>
                    </Pressable>
                  );
                })}
                <TextField
                  value={allergyDrug}
                  onChangeText={setAllergyDrug}
                  placeholder="ระบุชื่อยา"
                  editable={allergyMode === 'has'}
                  containerStyle={{ flex: 1, minWidth: 150, opacity: allergyMode === 'has' ? 1 : 0.5 }}
                />
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </AppModal>
  );
};
