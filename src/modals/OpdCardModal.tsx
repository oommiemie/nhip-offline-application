import React from 'react';
import { View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { AlertBand, AppModal, AppText, Avatar, Badge, Button, InfoCard } from '../components';
import { useApp } from '../state/AppContext';
import { useTheme, withAlpha } from '../theme';
import type { VisitRecord } from '../state/types';
import { initials, thaiToday } from '../utils/format';
import { useT } from '../i18n';

/** หน่วยของสัญญาณชีพแต่ละตัว (คีย์ตรงกับ mockData) */
const VITAL_UNITS: Record<string, string> = {
  BP: 'mmHg',
  ชีพจร: '/นาที',
  หายใจ: '/นาที',
  อุณหภูมิ: '°C',
  SpO2: '%',
  DTX: 'mg/dL',
};

type Flag = { tone: string; note: string } | null;

/**
 * เกณฑ์คัดกรองค่าผิดปกติของ รพ.สต. (ใช้เตือนสายตาเท่านั้น ไม่ใช่การวินิจฉัย)
 * ค่าที่เข้าเกณฑ์จะเปลี่ยนสีตัวเลข + ติดป้ายกำกับมุมขวาของไทล์
 */
const vitalFlag = (key: string, value: string, warn: string, bad: string): Flag => {
  const num = parseFloat(value);
  if (key === 'BP') {
    const [sys, dia] = value.split('/').map((n) => parseFloat(n));
    if (sys >= 160 || dia >= 100) return { tone: bad, note: 'สูงมาก' };
    if (sys >= 140 || dia >= 90) return { tone: warn, note: 'สูง' };
    if (sys && sys < 90) return { tone: bad, note: 'ต่ำ' };
    return null;
  }
  if (Number.isNaN(num)) return null;
  if (key === 'ชีพจร') return num > 100 ? { tone: warn, note: 'เร็ว' } : num < 60 ? { tone: warn, note: 'ช้า' } : null;
  if (key === 'หายใจ') return num > 20 ? { tone: warn, note: 'เร็ว' } : null;
  if (key === 'อุณหภูมิ') return num >= 37.5 ? { tone: warn, note: 'มีไข้' } : null;
  if (key === 'SpO2') return num < 95 ? { tone: bad, note: 'ต่ำ' } : null;
  if (key === 'DTX') return num >= 126 ? { tone: warn, note: 'สูง' } : num < 70 ? { tone: bad, note: 'ต่ำ' } : null;
  return null;
};

/** ป้ายข้อมูลย่อในหัวการ์ดผู้ป่วย */
const Pill: React.FC<{ label: string; mono?: boolean; icon?: keyof typeof Ionicons.glyphMap }> = ({
  label,
  mono = false,
  icon,
}) => {
  const t = useTheme();
  const c = t.colors;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        height: 26,
        paddingHorizontal: 10,
        borderRadius: t.radius.pill,
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: withAlpha(c.primary, 0.22),
      }}
    >
      {icon ? <Ionicons name={icon} size={13} color={c.primary} /> : null}
      <AppText size="xs" weight="600" mono={mono} color={c.primaryStrong}>
        {label}
      </AppText>
    </View>
  );
};

const Divider: React.FC = () => {
  const t = useTheme();
  return <View style={{ height: 1, backgroundColor: t.colors.border }} />;
};

/** ข้อความยาว: label เล็กด้านบน ค่าด้านล่าง */
const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={{ gap: 2 }}>
    <AppText size="xs" muted>
      {label}
    </AppText>
    <AppText size="sm" weight="600">
      {value || '—'}
    </AppText>
  </View>
);

/** รางแสดงขั้นตอนที่บันทึกครบแล้ว — วงกลมติ๊กถูกเชื่อมด้วยเส้น */
const StepRail: React.FC<{ steps: Array<[string, boolean]> }> = ({ steps }) => {
  const t = useTheme();
  const tt = useT();
  const c = t.colors;
  return (
    <View style={{ flexDirection: 'row' }}>
      {steps.map(([label, on], i) => {
        const prevOn = i > 0 && steps[i - 1][1] && on;
        const nextOn = i < steps.length - 1 && steps[i + 1][1] && on;
        return (
          <View key={label} style={{ flex: 1, alignItems: 'center', gap: 7 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }}>
              <View style={{ flex: 1, height: 2, backgroundColor: i === 0 ? 'transparent' : prevOn ? c.primary : c.border }} />
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: on ? c.primary : c.surface3,
                  borderWidth: on ? 0 : 1,
                  borderColor: c.border,
                }}
              >
                {on ? (
                  <Ionicons name="checkmark" size={15} color={c.primaryForeground} />
                ) : (
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.mutedForeground }} />
                )}
              </View>
              <View
                style={{ flex: 1, height: 2, backgroundColor: i === steps.length - 1 ? 'transparent' : nextOn ? c.primary : c.border }}
              />
            </View>
            <AppText
              size="xs"
              weight={on ? '600' : '400'}
              center
              numberOfLines={2}
              color={on ? c.foreground : c.mutedForeground}
            >
              {tt(label)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
};

/** OPD Card · สรุปการรับบริการของ 1 visit (เปิดจากแถวในหน้า Sync) */
export const OpdCardModal: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const tt = useT();
  const { width } = useWindowDimensions();
  const wide = width >= 860;

  const idx = state.opdIdx;
  const r: VisitRecord | null = idx !== null ? (state.records[idx] ?? null) : null;
  if (idx === null || !r) return null;

  const syncBadge =
    r.sync === 'pass'
      ? { label: tt('อัปเดตผ่าน'), tone: 'success' as const }
      : r.sync === 'fail'
        ? { label: tt('ไม่ผ่านเงื่อนไข'), tone: 'destructive' as const }
        : { label: tt('รอการซิงค์'), tone: 'warning' as const };

  const steps: Array<[string, boolean]> = [
    ['ซักประวัติ', r.fHist],
    ['ตรวจร่างกาย', r.fPe],
    ['วินิจฉัย ICD-10', r.icd.length > 0],
    ['จ่ายยา', r.fDrug],
    ['Lab / X-ray', r.fLab || r.fXray],
    ['วัคซีน', r.fVax],
  ];
  const doneSteps = steps.filter(([, on]) => on).length;

  const orders: Array<[string, string, 'info' | 'purple' | 'success']> = [
    ...r.labs.map((x): [string, string, 'info'] => ['LAB', x, 'info']),
    ...r.xray.map((x): [string, string, 'purple'] => ['X-RAY', x, 'purple']),
    ...r.vax.map((x): [string, string, 'success'] => ['วัคซีน', x, 'success']),
  ];

  return (
    <AppModal
      visible
      onClose={actions.closeOpd}
      title={tt('OPD Card · สรุปการรับบริการ')}
      titleBadge={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: c.muted }}>
            <AppText size="xs" weight="600" mono>
              V{r.hn}-{r.time.replace(':', '')}
            </AppText>
          </View>
          <Badge label={syncBadge.label} tone={syncBadge.tone} size="sm" />
        </View>
      }
      maxWidth={980}
      footer={
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 240 }}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={17} color={c.mutedForeground} />
            <AppText size="sm" muted>
              {tt('สถานะอัปโหลดขึ้น Cloud')}
            </AppText>
            <Badge label={syncBadge.label} tone={syncBadge.tone} size="sm" />
            {r.sync === 'fail' && r.error ? (
              <AppText size="xs" color={c.destructive} numberOfLines={1} style={{ flex: 1 }}>
                {r.error}
              </AppText>
            ) : null}
          </View>
          {r.sync === 'fail' ? (
            <Button label={tt('แก้ไขและอัปโหลดใหม่')} variant="destructive" onPress={() => actions.openEdit(idx)} />
          ) : null}
          <Button label={tt('ปิด')} variant="outline" onPress={actions.closeOpd} />
        </View>
      }
    >
      <View style={{ gap: 14, paddingBottom: 6 }}>
        {/* หัวการ์ด: ตัวตนผู้ป่วย — ไล่สีเขียวจางให้ดูเป็นหัวเอกสาร */}
        <LinearGradient
          colors={[withAlpha(c.primary, t.isDark ? 0.22 : 0.13), withAlpha(c.primary, 0.02)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: t.radius.lg, borderWidth: 1, borderColor: withAlpha(c.primary, 0.18), padding: 16, gap: 14 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <Avatar label={initials(r.name)} size={52} />
            <View style={{ flex: 1, minWidth: 220, gap: 8 }}>
              <AppText size="xl" weight="700" color={t.isDark ? c.foreground : c.secondary}>
                {r.name}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <Pill label={`HN ${r.hn}`} mono icon="person-outline" />
                <Pill label={`${tt(r.sex)} · ${tt('{n} ปี', { n: r.age })}`} />
                <Pill label={tt(r.right)} icon="shield-checkmark-outline" />
                <Pill label={`คิว ${r.queueNo}`} mono />
              </View>
            </View>
            {/* ข้อมูลการมารับบริการ — ชิดขวาเมื่อจอกว้าง */}
            <View style={{ gap: 8, alignItems: wide ? 'flex-end' : 'flex-start', minWidth: 200 }}>
              <View style={{ alignItems: wide ? 'flex-end' : 'flex-start', gap: 2 }}>
                <AppText size="xs" muted>
                  {tt('วัน-เวลารับบริการ')}
                </AppText>
                <AppText size="sm" weight="600">
                  {thaiToday()} · {r.time}
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <Badge label={tt(r.service)} tone="primary" size="sm" />
                <AppText size="xs" muted mono>
                  ห้อง {r.room}
                </AppText>
              </View>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: withAlpha(c.primary, 0.16) }} />

          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Ionicons name="card-outline" size={15} color={c.mutedForeground} />
              <AppText size="sm" muted>
                {tt('เลขบัตรประชาชน')}
              </AppText>
              <AppText size="sm" weight="600" mono>
                {r.cid}
              </AppText>
            </View>
            {r.phone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <Ionicons name="call-outline" size={15} color={c.mutedForeground} />
                <AppText size="sm" muted>
                  {tt('โทร')}
                </AppText>
                <AppText size="sm" weight="600" mono>
                  {r.phone}
                </AppText>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1, minWidth: 260 }}>
              <Ionicons name="location-outline" size={15} color={c.mutedForeground} />
              <AppText size="sm" muted>
                {tt('ที่อยู่')}
              </AppText>
              <AppText size="sm" weight="600" style={{ flex: 1 }} numberOfLines={1}>
                {r.address}
              </AppText>
            </View>
          </View>
        </LinearGradient>

        {r.allergy ? (
          <AlertBand
            variant="danger"
            title={`แพ้ยา ${r.allergy}`}
            detail={tt('ตรวจสอบซ้ำก่อนสั่งยาทุกครั้ง')}
            style={{ borderRadius: t.radius.md }}
          />
        ) : (
          <AlertBand
            variant="caution"
            title={tt('ไม่พบประวัติแพ้ยา')}
            detail={tt('สอบถามและบันทึกซ้ำทุกครั้งที่รับบริการ')}
            style={{ borderRadius: t.radius.md }}
          />
        )}

        {/* ความครบถ้วนของการบันทึก */}
        <InfoCard title={tt('ขั้นตอนที่บันทึกแล้ว')} icon="progress-check">
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppText size="sm" weight="700" mono color={doneSteps === steps.length ? c.success : c.warning}>
                {doneSteps}/{steps.length}
              </AppText>
              <AppText size="sm" muted style={{ flex: 1 }}>
                {doneSteps === steps.length ? 'บันทึกครบทุกขั้นตอน พร้อมอัปโหลดขึ้น Cloud' : 'ขั้นตอนที่ยังไม่บันทึกจะไม่ถูกส่งขึ้น Cloud'}
              </AppText>
            </View>
            <StepRail steps={steps} />
          </View>
        </InfoCard>

        {/* เนื้อหา 2 คอลัมน์ */}
        <View style={wide ? { flexDirection: 'row', gap: 14, alignItems: 'flex-start' } : { gap: 14 }}>
          <View style={{ flex: 1, gap: 14 }}>
            <InfoCard title={tt('สัญญาณชีพ')} icon="heart-pulse">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {r.vitals.map(([k, v]) => {
                  const flag = vitalFlag(k, v, c.warning, c.destructive);
                  return (
                    <View
                      key={k}
                      style={{
                        flexBasis: '30%',
                        flexGrow: 1,
                        minWidth: 96,
                        gap: 3,
                        padding: 10,
                        borderRadius: t.radius.md,
                        backgroundColor: flag ? withAlpha(flag.tone, 0.09) : c.surface2,
                        borderWidth: 1,
                        borderColor: flag ? withAlpha(flag.tone, 0.32) : 'transparent',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <AppText size="xs" muted style={{ flex: 1 }} numberOfLines={1}>
                          {tt(k)}
                        </AppText>
                        {flag ? (
                          <AppText size="xs" weight="700" color={flag.tone}>
                            {tt(flag.note)}
                          </AppText>
                        ) : null}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                        <AppText size="lg" weight="700" mono color={flag ? flag.tone : undefined}>
                          {v}
                        </AppText>
                        {VITAL_UNITS[k] ? (
                          <AppText size="xs" muted>
                            {VITAL_UNITS[k]}
                          </AppText>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </InfoCard>

            <InfoCard title={tt('ซักประวัติ / ตรวจร่างกาย')} icon="clipboard-text-outline">
              <View style={{ gap: 10 }}>
                <Field label={tt('อาการสำคัญ (CC)')} value={r.cc} />
                <Divider />
                <Field label={tt('ประวัติปัจจุบัน (HPI)')} value={r.hpi} />
                <Divider />
                <Field label={tt('การตรวจร่างกาย (PE)')} value={r.pe} />
                <Divider />
                <Field label={tt('โรคประจำตัว')} value={r.chronic} />
              </View>
            </InfoCard>
          </View>

          <View style={{ flex: 1, gap: 14 }}>
            <InfoCard title={tt('การวินิจฉัย (ICD-10)')} icon="stethoscope" count={r.icd.length}>
              {r.icd.length ? (
                <View style={{ gap: 10 }}>
                  {r.icd.map(([code, name, kind], i) => (
                    <React.Fragment key={code}>
                      {i > 0 ? <Divider /> : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View
                          style={{
                            paddingHorizontal: 9,
                            paddingVertical: 4,
                            borderRadius: t.radius.sm,
                            backgroundColor: t.tones.primary.bg,
                          }}
                        >
                          <AppText size="sm" weight="700" mono color={t.tones.primary.fg}>
                            {code}
                          </AppText>
                        </View>
                        <AppText size="sm" weight="600" style={{ flex: 1 }} numberOfLines={2}>
                          {name}
                        </AppText>
                        <Badge label={tt(kind)} tone={kind === 'หลัก' ? 'primary' : 'neutral'} size="sm" />
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              ) : (
                <AppText size="sm" muted>
                  {tt('ยังไม่บันทึกการวินิจฉัย')}
                </AppText>
              )}
            </InfoCard>

            <InfoCard title={tt('ยาที่จ่าย')} icon="pill" count={r.drugs.length}>
              {r.drugs.length ? (
                <View style={{ gap: 9 }}>
                  {r.drugs.map((d) => {
                    // แยกชื่อยา (คำแรก) ออกจากขนาด/วิธีใช้ เพื่อเน้นชื่อยาให้อ่านเร็ว
                    const m = d.match(/^(\S+)\s+(.*)$/);
                    return (
                      <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                        <MaterialCommunityIcons name="pill" size={15} color={c.mutedForeground} />
                        <AppText size="sm" weight="600">
                          {m ? m[1] : d}
                        </AppText>
                        {m ? (
                          <AppText size="sm" muted mono style={{ flex: 1 }} numberOfLines={1}>
                            {m[2]}
                          </AppText>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <AppText size="sm" muted>
                  {tt('ไม่มีการจ่ายยาในครั้งนี้')}
                </AppText>
              )}
            </InfoCard>

            <InfoCard title={tt('Lab / X-ray / วัคซีน')} icon="flask-outline" count={orders.length}>
              {orders.length ? (
                <View style={{ gap: 9 }}>
                  {orders.map(([kind, text, tone]) => (
                    <View key={`${kind}-${text}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                      <View
                        style={{
                          minWidth: 54,
                          alignItems: 'center',
                          paddingHorizontal: 7,
                          paddingVertical: 3,
                          borderRadius: t.radius.sm,
                          backgroundColor: t.tones[tone].bg,
                        }}
                      >
                        <AppText size="xs" weight="700" mono color={t.tones[tone].fg}>
                          {kind}
                        </AppText>
                      </View>
                      <AppText size="sm" weight="600" style={{ flex: 1 }}>
                        {text}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : (
                <AppText size="sm" muted>
                  {tt('ไม่มีรายการสั่งตรวจหรือวัคซีน')}
                </AppText>
              )}
            </InfoCard>
          </View>
        </View>
      </View>
    </AppModal>
  );
};
