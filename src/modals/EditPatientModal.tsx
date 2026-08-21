import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppModal, AppText, Button, SelectField, TextField } from '../components';
import { BLOOD_OPTIONS, ETHNICITY_OPTIONS, RELIGION_OPTIONS, RIGHT_OPTIONS, SERVICE_OPTIONS } from '../state/mockData';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';
import { cidDigits, formatCid, formatPhone, phoneDigits } from '../utils/format';
import type { VisitRecord } from '../state/types';
import { useT } from '../i18n';

export interface EditPatientModalProps {
  visible: boolean;
  record: VisitRecord | null;
  /** index ของ record ใน state.records */
  index: number | null;
  onClose: () => void;
}

/**
 * แก้ไขข้อมูลผู้ป่วย — โครงฟอร์มเดียวกับลงทะเบียนด้วยบัตรประชาชน (RegisterModal step 3)
 * เปิดแก้ได้ทุกช่อง (กรณีอ่านบัตรไม่ได้/ข้อมูลบนบัตรผิด เจ้าหน้าที่แก้เองได้ทั้งหมด)
 */
export const EditPatientModal: React.FC<EditPatientModalProps> = ({ visible, record, index, onClose }) => {
  const t = useTheme();
  const c = t.colors;
  const { actions } = useApp();
  const tt = useT();

  const [cid, setCid] = useState('');
  const [name, setName] = useState('');
  const [sex, setSex] = useState<'ชาย' | 'หญิง'>('หญิง');
  const [dob, setDob] = useState('');
  const [race, setRace] = useState('');
  const [nationality, setNationality] = useState('');
  const [religion, setReligion] = useState('');
  const [address, setAddress] = useState('');
  const [right, setRight] = useState(RIGHT_OPTIONS[0]);
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [bloodType, setBloodType] = useState(BLOOD_OPTIONS[0]);
  const [phone, setPhone] = useState('');
  const [allergyMode, setAllergyMode] = useState<'deny' | 'has'>('deny');
  const [allergyDrug, setAllergyDrug] = useState('');

  // เปิดใหม่ → เติมค่าปัจจุบันของผู้ป่วยรายนี้
  useEffect(() => {
    if (visible && record) {
      setCid(record.cid);
      setName(record.name);
      setSex(record.sex);
      setDob(record.dob);
      setRace(record.race);
      setNationality(record.nationality);
      setReligion(record.religion);
      setAddress(record.address);
      setRight(RIGHT_OPTIONS.includes(record.right) ? record.right : RIGHT_OPTIONS[0]);
      setService(SERVICE_OPTIONS.includes(record.service) ? record.service : SERVICE_OPTIONS[0]);
      setBloodType(record.bloodType || BLOOD_OPTIONS[0]);
      setPhone(record.phone ? formatPhone(record.phone) : '');
      setAllergyMode(record.allergy ? 'has' : 'deny');
      setAllergyDrug(record.allergy);
    }
  }, [visible, record]);

  if (!record || index === null) return null;

  /** เผื่อค่าที่บันทึกไว้เดิมไม่อยู่ในลิสต์ — แทรกไว้บนสุดให้ยังเลือกค้างไว้ได้ */
  const withCurrent = (list: string[], v: string) => (v && !list.includes(v) ? [v, ...list] : list);

  const phoneLen = phoneDigits(phone);
  const phoneBad = phoneLen > 0 && phoneLen < 9;
  const cidBad = cidDigits(cid) !== 13;
  const nameBad = !name.trim();

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={tt('แก้ไขข้อมูลผู้ป่วย')}
      titleBadge={
        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: c.muted }}>
          <AppText size="xs" weight="600" mono>
            HN {record.hn}
          </AppText>
        </View>
      }
      maxWidth={900}
      footer={
        <>
          <Button label={tt('ยกเลิก')} variant="outline" onPress={onClose} />
          <Button
            label={tt('บันทึกการแก้ไข')}
            variant="strong"
            disabled={phoneBad || cidBad || nameBad}
            onPress={() => {
              actions.updatePatient(index, {
                cid,
                name: name.trim(),
                sex,
                dob: dob.trim(),
                race: race.trim(),
                nationality: nationality.trim(),
                religion: religion.trim(),
                address: address.trim(),
                right,
                service,
                bloodType,
                phone,
                allergy: allergyMode === 'has' ? allergyDrug.trim() : '',
              });
              onClose();
            }}
          />
        </>
      }
    >
      <View style={{ gap: 16 }}>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: c.primary }} />
            <AppText size="md" weight="700">
              {tt('ข้อมูลผู้ป่วย')}
            </AppText>
            <AppText size="xs" muted style={{ flex: 1 }}>
              {tt('แก้ไขได้ทุกช่อง — ใช้กรณีอ่านบัตรไม่ได้หรือข้อมูลบนบัตรไม่ตรง')}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <TextField
              label={tt('เลขบัตรประชาชน')}
              required
              value={cid}
              onChangeText={(v) => setCid(formatCid(v))}
              placeholder="1-2345-67890-12-3"
              keyboardType="numeric"
              inputMode="numeric"
              mono
              maxLength={17}
              errorText={cidBad ? tt('ต้องมี 13 หลัก') : undefined}
              containerStyle={{ flex: 1, minWidth: 170 }}
            />
            <TextField
              label={tt('ชื่อ-นามสกุล')}
              required
              value={name}
              onChangeText={setName}
              placeholder={tt('คำนำหน้า ชื่อ นามสกุล')}
              errorText={nameBad ? tt('ต้องระบุชื่อ') : undefined}
              containerStyle={{ flex: 1, minWidth: 170 }}
            />
            <TextField
              label={tt('เบอร์โทรศัพท์')}
              value={phone}
              onChangeText={(v) => setPhone(formatPhone(v))}
              placeholder="081-234-5678"
              keyboardType="phone-pad"
              inputMode="tel"
              icon="call-outline"
              mono
              maxLength={12}
              errorText={phoneBad ? tt('ต้องมี 9–10 หลัก') : undefined}
              containerStyle={{ flex: 1, minWidth: 170 }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <SelectField
              label={tt('เพศ')}
              value={sex}
              options={['หญิง', 'ชาย']}
              onChange={(v) => setSex(v as 'ชาย' | 'หญิง')}
              containerStyle={{ flex: 1, minWidth: 104 }}
            />
            <TextField
              label={tt('วันเกิด')}
              value={dob}
              onChangeText={setDob}
              placeholder={tt('วว/ดด/ปปปป')}
              mono
              containerStyle={{ flex: 1, minWidth: 104 }}
            />
            <SelectField
              label={tt('หมู่เลือด')}
              value={bloodType}
              options={BLOOD_OPTIONS}
              onChange={setBloodType}
              containerStyle={{ flex: 1, minWidth: 104 }}
            />
            <SelectField
              label={tt('เชื้อชาติ')}
              value={race}
              options={withCurrent(ETHNICITY_OPTIONS, race)}
              onChange={setRace}
              containerStyle={{ flex: 1, minWidth: 104 }}
            />
            <SelectField
              label={tt('สัญชาติ')}
              value={nationality}
              options={withCurrent(ETHNICITY_OPTIONS, nationality)}
              onChange={setNationality}
              containerStyle={{ flex: 1, minWidth: 104 }}
            />
            <SelectField
              label={tt('ศาสนา')}
              value={religion}
              options={withCurrent(RELIGION_OPTIONS, religion)}
              onChange={setReligion}
              containerStyle={{ flex: 1, minWidth: 104 }}
            />
          </View>
          <TextField
            label={tt('ที่อยู่ตามบัตร')}
            value={address}
            onChangeText={setAddress}
            placeholder={tt('บ้านเลขที่ หมู่ ตำบล อำเภอ จังหวัด')}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: c.info }} />
            <AppText size="md" weight="700">
              {tt('ข้อมูลการรับบริการ')}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <SelectField label={tt('สิทธิ์การรักษา')} required value={right} options={RIGHT_OPTIONS} onChange={setRight} containerStyle={{ flex: 1, minWidth: 200 }} />
            <SelectField label={tt('ประเภทบริการ')} required value={service} options={SERVICE_OPTIONS} onChange={setService} containerStyle={{ flex: 1, minWidth: 200 }} />
          </View>
          <View style={{ gap: 6 }}>
            <AppText size="sm" weight="600">
              ประวัติแพ้ยา (สอบถามผู้ป่วย)
            </AppText>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <View style={{ flex: 1, minWidth: 190, flexDirection: 'row', gap: 8 }}>
                {(
                  [
                    ['deny', tt('ปฏิเสธการแพ้ยา')],
                    ['has', tt('มีประวัติแพ้ยา')],
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
                placeholder={tt('ระบุชื่อยา')}
                editable={allergyMode === 'has'}
                containerStyle={{ flex: 1, minWidth: 190, opacity: allergyMode === 'has' ? 1 : 0.5 }}
              />
            </View>
          </View>
        </View>
      </View>
    </AppModal>
  );
};
