import React from 'react';
import { View, useWindowDimensions } from 'react-native';

import { AlertBand, AppModal, AppText, Badge, Button, CheckSquare, KeyValue } from '../components';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';
import { thaiToday } from '../utils/format';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const t = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppText size="sm" weight="700">
          {title}
        </AppText>
        <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
      </View>
      {children}
    </View>
  );
};

/** OPD Card · สรุปการรับบริการของ 1 visit (เปิดจากแถวในหน้า Sync) */
export const OpdCardModal: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  const idx = state.opdIdx;
  const r = idx !== null ? state.records[idx] : null;
  if (idx === null || !r) return null;

  const syncBadge =
    r.sync === 'pass'
      ? { label: 'อัปเดตผ่าน', tone: 'success' as const }
      : r.sync === 'fail'
        ? { label: 'ไม่ผ่านเงื่อนไข', tone: 'destructive' as const }
        : { label: 'รอการซิงค์', tone: 'warning' as const };

  const steps: Array<[string, boolean]> = [
    ['ซักประวัติ', r.fHist],
    ['ตรวจร่างกาย', r.fPe],
    ['วินิจฉัย ICD-10', r.icd.length > 0],
    ['จ่ายยา', r.fDrug],
    ['Lab / X-ray', r.fLab || r.fXray],
    ['วัคซีน', r.fVax],
  ];

  const orders: Array<[string, string]> = [
    ...r.labs.map((x): [string, string] => ['LAB', x]),
    ...r.xray.map((x): [string, string] => ['X-RAY', x]),
    ...r.vax.map((x): [string, string] => ['วัคซีน', x]),
  ];

  return (
    <AppModal
      visible
      onClose={actions.closeOpd}
      title="OPD Card · สรุปการรับบริการ"
      titleBadge={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: c.muted }}>
            <AppText size="xs" weight="600" mono>
              V{r.hn}-{r.time.replace(':', '')}
            </AppText>
          </View>
          <Badge label={syncBadge.label} tone={syncBadge.tone} size="sm" />
        </View>
      }
      maxWidth={900}
    >
      <View style={{ gap: 14 }}>
        {/* ข้อมูลผู้ป่วย */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 14,
            padding: 14,
            borderRadius: t.radius.lg,
            backgroundColor: c.surface2,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <KeyValue label="HN" value={r.hn} mono />
          <KeyValue label="ชื่อ-นามสกุล" value={r.name} />
          <KeyValue label="เพศ / อายุ" value={`${r.sex} · ${r.age} ปี`} />
          <KeyValue label="เลขบัตรประชาชน" value={r.cid} mono />
          <KeyValue label="สิทธิ์การรักษา" value={r.right} />
          <KeyValue label="วัน-เวลารับบริการ" value={`${thaiToday()} ${r.time}`} />
          <View style={{ width: '100%' }}>
            <KeyValue label="ที่อยู่" value={r.address} />
          </View>
        </View>

        {r.allergy ? (
          <AlertBand variant="danger" title={`แพ้ยา ${r.allergy}`} detail="ตรวจสอบซ้ำก่อนสั่งยาทุกครั้ง" style={{ borderRadius: t.radius.md }} />
        ) : (
          <AlertBand variant="caution" title="ไม่พบประวัติแพ้ยา" detail="สอบถามและบันทึกซ้ำทุกครั้งที่รับบริการ" style={{ borderRadius: t.radius.md }} />
        )}

        {/* ขั้นตอนที่ทำแล้ว */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {steps.map(([label, on]) => (
            <View
              key={label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                paddingHorizontal: 10,
                paddingVertical: 7,
                borderRadius: t.radius.md,
                backgroundColor: on ? t.tones.primary.bg : c.surface2,
                borderWidth: 1,
                borderColor: on ? t.tones.primary.border : c.border,
              }}
            >
              <CheckSquare checked={on} size={15} />
              <AppText size="xs" weight={on ? '600' : '400'} color={on ? t.tones.primary.fg : c.mutedForeground}>
                {label}
              </AppText>
            </View>
          ))}
        </View>

        {/* สองคอลัมน์ */}
        <View style={wide ? { flexDirection: 'row', gap: 18 } : { gap: 18 }}>
          <View style={{ flex: 1, gap: 14 }}>
            <Section title="สัญญาณชีพ">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {r.vitals.map(([k, v]) => (
                  <View
                    key={k}
                    style={{ minWidth: 86, flex: 1, gap: 1, padding: 9, borderRadius: t.radius.md, backgroundColor: c.surface2 }}
                  >
                    <AppText size="xs" muted>
                      {k}
                    </AppText>
                    <AppText size="sm" weight="700" mono>
                      {v}
                    </AppText>
                  </View>
                ))}
              </View>
            </Section>
            <Section title="ซักประวัติ / ตรวจร่างกาย">
              <View style={{ gap: 8 }}>
                <KeyValue label="อาการสำคัญ (CC)" value={r.cc} />
                <KeyValue label="ประวัติปัจจุบัน (HPI)" value={r.hpi} />
                <KeyValue label="การตรวจร่างกาย (PE)" value={r.pe} />
                <KeyValue label="โรคประจำตัว" value={r.chronic} />
              </View>
            </Section>
          </View>
          <View style={{ flex: 1, gap: 14 }}>
            <Section title="การวินิจฉัย (ICD-10)">
              <View style={{ gap: 6 }}>
                {r.icd.length ? (
                  r.icd.map(([code, name, kind]) => (
                    <View
                      key={code}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 9, padding: 8, borderRadius: t.radius.md, backgroundColor: c.surface2 }}
                    >
                      <AppText size="sm" weight="700" mono color={c.primary} style={{ minWidth: 58 }}>
                        {code}
                      </AppText>
                      <AppText size="sm" style={{ flex: 1 }} numberOfLines={2}>
                        {name}
                      </AppText>
                      <AppText size="xs" muted>
                        {kind}
                      </AppText>
                    </View>
                  ))
                ) : (
                  <AppText size="sm" muted>
                    ยังไม่มีการวินิจฉัย
                  </AppText>
                )}
              </View>
            </Section>
            <Section title="ยาที่จ่าย">
              <View style={{ gap: 4 }}>
                {r.drugs.length ? (
                  r.drugs.map((d) => (
                    <AppText key={d} size="sm">
                      • {d}
                    </AppText>
                  ))
                ) : (
                  <AppText size="sm" muted>
                    ไม่มีการจ่ายยา
                  </AppText>
                )}
              </View>
            </Section>
            <Section title="Lab / X-ray / วัคซีน">
              <View style={{ gap: 5 }}>
                {orders.length ? (
                  orders.map(([kind, text]) => (
                    <View key={`${kind}-${text}`} style={{ flexDirection: 'row', gap: 8 }}>
                      <AppText size="xs" weight="600" mono muted style={{ minWidth: 46 }}>
                        {kind}
                      </AppText>
                      <AppText size="sm" style={{ flex: 1 }}>
                        {text}
                      </AppText>
                    </View>
                  ))
                ) : (
                  <AppText size="sm" muted>
                    ไม่มีรายการสั่งตรวจหรือวัคซีน
                  </AppText>
                )}
              </View>
            </Section>
          </View>
        </View>

        {/* สถานะซิงค์ */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 12,
            borderRadius: t.radius.md,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: c.border,
            marginBottom: 6,
          }}
        >
          <AppText size="sm" muted style={{ flex: 1 }}>
            สถานะการอัปโหลดขึ้น Cloud: <AppText size="sm" weight="700">{syncBadge.label}</AppText>
            {r.sync === 'fail' ? ` — ${r.error}` : ''}
          </AppText>
          {r.sync === 'fail' ? (
            <Button label="แก้ไขและอัปโหลดใหม่" variant="destructive" size="sm" onPress={() => actions.openEdit(idx)} />
          ) : null}
        </View>
      </View>
    </AppModal>
  );
};
