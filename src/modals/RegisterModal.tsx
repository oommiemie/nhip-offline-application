import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, Pressable, View } from 'react-native';

import { AppModal, AppText, Button, SelectField, StatusDot, TextField } from '../components';
import { FigmaAssets } from '../assets';
import { BLOOD_OPTIONS, RIGHT_OPTIONS, SERVICE_OPTIONS } from '../state/mockData';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';
import { formatPhone, phoneDigits } from '../utils/format';

/** ภาพบัตรประชาชนจริงจากไฟล์ Figma (node I31:12223;31:12142) */
/**
 * ภาพบัตรประชาชน — ยึดมุมขวาล่างแล้วยื่นพ้นขอบการ์ด โดนครอปให้ดูเหมือนโผล่ขึ้นมาจากขอบ
 * ต้องระบุ zIndex เอง เพราะ RN Web ใส่ z-index:-1 ให้ Image ทำให้ตกไปอยู่หลังพื้นการ์ด
 */
const IdCardArt: React.FC = () => (
  <Image
    source={FigmaAssets.idCard}
    style={{ position: 'absolute', right: -12, bottom: -30, width: 130, height: 130, zIndex: 0 }}
    resizeMode="contain"
  />
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
  const [bloodType, setBloodType] = useState(BLOOD_OPTIONS[0]);
  const [phone, setPhone] = useState('');

  // เปิด modal ใหม่ → ล้างฟอร์ม
  useEffect(() => {
    if (state.regOpen) {
      setRight(RIGHT_OPTIONS[0]);
      setService(SERVICE_OPTIONS[0]);
      setAllergyMode('deny');
      setAllergyDrug('');
      setBloodType(BLOOD_OPTIONS[0]);
      setPhone('');
    }
  }, [state.regOpen]);

  // เบอร์โทรไม่บังคับ แต่ถ้ากรอกแล้วต้องครบ 9 หลัก (บ้าน) หรือ 10 หลัก (มือถือ)
  const phoneLen = phoneDigits(phone);
  const phoneBad = phoneLen > 0 && phoneLen < 9;

  // อ่านบัตรสำเร็จ → เติมค่าตั้งต้นจากบัตร
  useEffect(() => {
    if (state.card) {
      setService(SERVICE_OPTIONS.includes(state.card.service) ? state.card.service : SERVICE_OPTIONS[0]);
      setBloodType(state.card.bloodType || BLOOD_OPTIONS[0]);
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
  /*
   * แผงสถานะเครื่องอ่านบัตร — Figma component set "Hero CID" (node 31:12157)
   * Default พื้น #F8F9FA · Ready พื้น #DBEAFE หัวข้อ #1E40AF · Success พื้น #F0FDFA หัวข้อ #1B4332
   * โหมดมืดใช้โทนของธีมแทนค่าดิบ
   */
  const panel =
    reader === 'idle' || reader === 'connecting'
      ? {
          bg: t.isDark ? c.surface2 : '#F8F9FA',
          title: c.foreground,
          dot: reader === 'connecting' ? c.warning : c.mutedForeground,
          text:
            reader === 'connecting'
              ? 'กำลังเชื่อมต่อเครื่องอ่านบัตร…'
              : 'ไม่พร้อมใช้งาน · กรุณาลองเชื่อมเครื่องอ่านบัตรอีกครั้ง',
        }
      : reader === 'read'
        ? {
            bg: t.isDark ? t.tones.success.bg : '#F0FDFA',
            title: t.isDark ? c.primary : '#1B4332',
            dot: '#34C759',
            text: 'อ่านสำเร็จ · ตรวจสอบข้อมูลก่อนบันทึก',
          }
        : {
            bg: t.isDark ? t.tones.info.bg : '#DBEAFE',
            title: t.tones.info.fg,
            dot: reader === 'reading' ? c.warning : '#34C759',
            text: reader === 'reading' ? 'กำลังอ่านข้อมูลจากชิพ…' : 'พร้อมอ่าน · กรุณาเสียบบัตรประชาชนในเครื่องอ่าน',
          };

  const card = state.card;

  /*
   * อ่านบัตรเสร็จแล้วให้ modal "ค่อย ๆ ขยาย" ลงมาแทนที่จะกระโดดเป็นฟอร์มเต็มทันที
   * วัดความสูงจริงของฟอร์มด้วย onLayout แล้วไล่ height 0 → ค่านั้น (ต้องใช้ JS driver เพราะเป็น layout)
   */
  const [formH, setFormH] = useState(0);
  const [growing, setGrowing] = useState(true);
  const grow = React.useRef(new Animated.Value(0)).current;
  const showForm = reader === 'read' && !!card;

  useEffect(() => {
    if (!showForm) {
      grow.setValue(0);
      setFormH(0);
      setGrowing(true);
      return;
    }
    if (formH <= 0) return; // รอรู้ความสูงจริงก่อนค่อยเริ่มวิ่ง
    Animated.timing(grow, {
      toValue: 1,
      duration: t.reduceMotion ? 0 : 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      // ปล่อยความสูงคืนให้เนื้อหาเมื่อขยายจบ — ไม่งั้นฟอร์มที่สูงขึ้นทีหลังจะโดนครอปถาวร
      if (finished) setGrowing(false);
    });
  }, [showForm, formH, grow, t.reduceMotion]);

  return (
    <AppModal
      visible={state.regOpen}
      onClose={actions.closeReg}
      title="ลงทะเบียนคนไข้ใหม่ · อ่านบัตรประชาชน"
      // กว้าง 900 เพื่อให้ข้อมูลจากบัตร 6 ช่อง (เพศ…ศาสนา) เรียงจบในแถวเดียว
      maxWidth={900}
      footer={
        reader === 'read' ? (
          <>
            <Button label="ยกเลิก" variant="outline" onPress={actions.closeReg} />
            <Button
              label="ยืนยัน"
              variant="strong"
              disabled={!card || phoneBad}
              onPress={() =>
                actions.confirmReg({
                  right,
                  service,
                  bloodType,
                  allergy: allergyMode === 'has' ? allergyDrug || (card?.allergy ?? '') : '',
                  phone,
                })
              }
            />
          </>
        ) : undefined
      }
    >
      {/* แผงสถานะเครื่องอ่านบัตร — Figma 31:12157 · การ์ด r20 pad16 gap16 · ภาพบัตร 162 ล้นกรอบแล้วถูกครอป */}
      <View style={{ padding: 14, borderRadius: 20, backgroundColor: panel.bg, overflow: 'hidden' }}>
        {/* เว้นทางขวาให้ภาพบัตรที่ยื่นออกมา · zIndex 1 = อยู่เหนือภาพ */}
        <View style={{ gap: 10, paddingRight: 118, zIndex: 1 }}>
          <View style={{ gap: 6 }}>
            <AppText size="md" weight="700" color={panel.title}>
              บัตรประชาชน
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <StatusDot color={panel.dot} size={7} />
              <AppText size="sm" weight="600" muted style={{ flexShrink: 1 }}>
                {panel.text}
              </AppText>
            </View>
          </View>
          {/* ทั้ง 3 สถานะมีปุ่มในการ์ดเสมอ — การ์ดจะได้สูงเท่ากัน ไม่กระโดดตอนเปลี่ยนสถานะ */}
          {reader === 'idle' || reader === 'connecting' ? (
            <Button
              label={reader === 'connecting' ? 'กำลังเชื่อมต่อ…' : 'เชื่อมต่อเครื่องอ่านบัตร'}
              variant="outline"
              size="sm"
              loading={reader === 'connecting'}
              onPress={actions.connectReader}
              style={{ alignSelf: 'flex-start' }}
            />
          ) : reader === 'read' ? (
            <Button
              label="อ่านบัตรใหม่"
              variant="outline"
              size="sm"
              onPress={actions.rereadCard}
              style={{ alignSelf: 'flex-start' }}
            />
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

      {/* step 3: ฟอร์มข้อมูล — ไล่ความสูงจาก 0 ให้ modal ขยายลงมาแบบนุ่ม ๆ */}
      {showForm ? (
        <Animated.View
          style={{
            // ล็อกความสูงเฉพาะระหว่างขยาย · จบแล้วปล่อยให้เนื้อหากำหนดเองเพื่อไม่ให้โดนตัด
            overflow: growing ? 'hidden' : 'visible',
            opacity: grow,
            height: growing && formH > 0 ? grow.interpolate({ inputRange: [0, 1], outputRange: [0, formH] }) : undefined,
          }}
        >
        <View
          style={{ gap: 16, marginTop: 16 }}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - formH) > 1) setFormH(h);
          }}
        >
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: c.primary }} />
              <AppText size="md" weight="700">
                ข้อมูลผู้ป่วย
              </AppText>
            </View>
            {/* แถว 1: ตัวระบุตัวตน + ช่องติดต่อ · แถว 2: ข้อมูลจากบัตร 6 ช่อง · แถว 3: ที่อยู่เต็มแถว */}
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <TextField label="เลขบัตรประชาชน (จากบัตร)" value={card.cid} readonly mono containerStyle={{ flex: 1, minWidth: 170 }} />
              <TextField label="ชื่อ-นามสกุล" value={card.name} readonly containerStyle={{ flex: 1, minWidth: 170 }} />
              {/* เบอร์โทรไม่มีบนบัตร — สอบถามผู้ป่วย ใช้ติดต่อกลับเรื่องผลตรวจ/นัดหมาย */}
              <TextField
                label="เบอร์โทรศัพท์"
                value={phone}
                onChangeText={(v) => setPhone(formatPhone(v))}
                placeholder="081-234-5678"
                keyboardType="phone-pad"
                inputMode="tel"
                icon="call-outline"
                mono
                maxLength={12}
                errorText={phoneBad ? 'ต้องมี 9–10 หลัก' : undefined}
                containerStyle={{ flex: 1, minWidth: 170 }}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <TextField label="เพศ" value={card.sex} readonly containerStyle={{ flex: 1, minWidth: 104 }} />
              <TextField label="วันเกิด" value={card.dob} readonly mono containerStyle={{ flex: 1, minWidth: 104 }} />
              {/* หมู่เลือดไม่ได้อยู่บนบัตร — ต้องสอบถามผู้ป่วย จึงแก้ไขได้ */}
              <SelectField
                label="หมู่เลือด"
                value={bloodType}
                options={BLOOD_OPTIONS}
                onChange={setBloodType}
                containerStyle={{ flex: 1, minWidth: 104 }}
              />
              <TextField label="เชื้อชาติ" value={card.race} readonly containerStyle={{ flex: 1, minWidth: 104 }} />
              <TextField label="สัญชาติ" value={card.nationality} readonly containerStyle={{ flex: 1, minWidth: 104 }} />
              <TextField label="ศาสนา" value={card.religion} readonly containerStyle={{ flex: 1, minWidth: 104 }} />
            </View>
            <TextField label="ที่อยู่ตามบัตร" value={card.address} readonly containerStyle={{ flex: 1 }} />
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
              {/* ครึ่งซ้าย = ตัวเลือก · ครึ่งขวา = ช่องระบุชื่อยา */}
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <View style={{ flex: 1, minWidth: 190, flexDirection: 'row', gap: 8 }}>
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
                        flex: 1,
                        height: t.density.inputH,
                        paddingHorizontal: 10,
                        borderRadius: t.radius.md,
                        borderWidth: on ? 1.5 : 1,
                        borderColor: on ? c.primary : c.border,
                        backgroundColor: on ? t.tones.primary.bg : c.card,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppText size="sm" color={on ? c.accentStrong : c.foreground} weight={on ? '600' : '400'} numberOfLines={1}>
                        {label}
                      </AppText>
                    </Pressable>
                  );
                })}
                </View>
                <TextField
                  value={allergyDrug}
                  onChangeText={setAllergyDrug}
                  placeholder="ระบุชื่อยา"
                  editable={allergyMode === 'has'}
                  containerStyle={{ flex: 1, minWidth: 190, opacity: allergyMode === 'has' ? 1 : 0.5 }}
                />
              </View>
            </View>
          </View>
        </View>
        </Animated.View>
      ) : null}
    </AppModal>
  );
};
