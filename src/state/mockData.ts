import type { Branch, Doctor, Facility, ImportTable, OssTabId, PatientCard, QueueStage } from './types';

/**
 * ข้อมูลจำลองทั้งหมดของแอป — พอร์ตจาก desktop comp (NHIP Desktop.dc.html)
 * และปรับข้อความให้ตรงกับไฟล์ Figma (เช่น ที่อยู่ "12 ม.4 ต.โนนสูง อ.เมือง จ.ขอนแก่น")
 */

export const CARDS: PatientCard[] = [
  {
    cid: '3-1012-00841-25-1',
    name: 'นางสมพร แก้วใส',
    sex: 'หญิง',
    dob: '14/03/2507',
    age: 62,
    address: '12 ม.4 ต.โนนสูง อ.เมือง จ.ขอนแก่น',
    allergy: 'PENICILLIN',
    chronic: 'DM, HT',
    service: 'ตรวจโรคทั่วไป',
    room: '102',
    cc: 'ปวดศีรษะท้ายทอย 3 วัน เวียนศีรษะเป็นพัก ๆ',
    hpi: 'ทานยาลดความดันสม่ำเสมอ ลืมยามื้อเย็น 2 วัน ปฏิเสธเจ็บแน่นหน้าอก',
    pe: 'GA alert ไม่ซีด, Heart normal S1S2, Lungs clear',
    vitals: [
      ['BP', '158/94'],
      ['ชีพจร', '82'],
      ['หายใจ', '18'],
      ['อุณหภูมิ', '36.8'],
      ['SpO2', '98'],
      ['DTX', '146'],
    ],
    icd: [
      ['I10', 'Essential hypertension', 'หลัก'],
      ['E11.9', 'Type 2 DM without complications', 'ร่วม'],
    ],
    drugs: ['Amlodipine 10 mg 1x1 pc', 'Metformin 500 mg 1x2 pc'],
    labs: ['FBS, Creatinine, HbA1c'],
    xray: [],
    vax: [],
  },
  {
    cid: '3-1012-01197-08-4',
    name: 'นายวิชัย ทองอยู่',
    sex: 'ชาย',
    dob: '02/11/2511',
    age: 58,
    address: '88 ม.1 ต.ศิลา อ.เมือง จ.ขอนแก่น',
    allergy: '',
    chronic: 'HT',
    service: 'คัดกรอง NCD',
    room: '104',
    cc: 'มาตามนัดคัดกรองความดัน-เบาหวาน',
    hpi: 'ไม่มีอาการผิดปกติ ออกกำลังกาย 2 ครั้ง/สัปดาห์',
    pe: 'BP 138/86, BMI 26.1 รอบเอว 94 ซม.',
    vitals: [
      ['BP', '138/86'],
      ['ชีพจร', '76'],
      ['หายใจ', '16'],
      ['อุณหภูมิ', '36.5'],
      ['SpO2', '99'],
      ['DTX', '108'],
    ],
    icd: [['Z13.6', 'Screening for cardiovascular disorders', 'หลัก']],
    drugs: [],
    labs: ['FBS, Lipid profile'],
    xray: [],
    vax: [],
  },
  {
    cid: '1-1012-04423-19-3',
    name: 'ด.ญ.พิมพ์ชนก มีสุข',
    sex: 'หญิง',
    dob: '20/06/2568',
    age: 1,
    address: '5 ม.7 ต.บ้านเป็ด อ.เมือง จ.ขอนแก่น',
    allergy: '',
    chronic: '—',
    service: 'วัคซีน / EPI',
    room: 'EPI',
    cc: 'มารับวัคซีนตามนัด อายุ 12 เดือน',
    hpi: 'ไม่มีไข้ ไม่มีชื้น กินนมได้ดี',
    pe: 'น้ำหนัก 9.4 กก. ส่วนสูง 74 ซม. ตามเกณฑ์',
    vitals: [
      ['น้ำหนัก', '9.4'],
      ['ส่วนสูง', '74'],
      ['อุณหภูมิ', '36.9'],
      ['ชีพจร', '112'],
      ['หายใจ', '28'],
      ['SpO2', '99'],
    ],
    icd: [['Z27.4', 'Vaccination MMR', 'หลัก']],
    drugs: ['Paracetamol syrup prn'],
    labs: [],
    xray: [],
    vax: ['MMR เข็ม 1 (LOT MM2405)', 'JE เข็ม 1'],
  },
  {
    cid: '3-1012-00912-77-2',
    name: 'นายประยุทธ นาคเงิน',
    sex: 'ชาย',
    dob: '09/01/2498',
    age: 71,
    address: '44 ม.4 ต.โนนสูง อ.เมือง จ.ขอนแก่น',
    allergy: 'NSAIDs',
    chronic: 'DM, CKD stage 3',
    service: 'ตรวจโรคทั่วไป',
    room: '103',
    cc: 'หกล้มในห้องน้ำ ปวดข้อมือขวา 1 วัน',
    hpi: 'ล้มก้นกระแทก ยันมือขวา ไม่มีศีรษะกระทบ ไม่สลบ',
    pe: 'ข้อมือขวาบวม กดเจ็บ ขยับได้จำกัด ชีพจรปลายมือดี',
    vitals: [
      ['BP', '146/88'],
      ['ชีพจร', '88'],
      ['หายใจ', '20'],
      ['อุณหภูมิ', '36.7'],
      ['SpO2', '97'],
      ['DTX', '172'],
    ],
    icd: [
      ['S62.9', 'Fracture of wrist, unspecified', 'หลัก'],
      ['E11.2', 'Type 2 DM with kidney complications', 'ร่วม'],
    ],
    drugs: ['Paracetamol 500 mg 1x3 pc'],
    labs: ['CBC, Creatinine'],
    xray: ['X-ray wrist right 2 views'],
    vax: [],
  },
  {
    cid: '3-1012-07339-41-6',
    name: 'น.ส.ชนกวรรณ ศรีสุข',
    sex: 'หญิง',
    dob: '25/09/2542',
    age: 27,
    address: '19 ม.2 ต.เมืองเก่า อ.เมือง จ.ขอนแก่น',
    allergy: '',
    chronic: 'G2P1 · GA 28 สัปดาห์',
    service: 'ANC',
    room: 'ANC1',
    cc: 'ตรวจครรภ์ตามนัด ครั้งที่ 4',
    hpi: 'ลูกดิ้นดี ไม่มีเลือดออก ไม่มีน้ำเดิน',
    pe: 'ยอดมดลูก 27 ซม. FHS 148 ครั้ง/นาที บวมเท้าเล็กน้อย',
    vitals: [
      ['BP', '112/70'],
      ['ชีพจร', '84'],
      ['น้ำหนัก', '62.5'],
      ['อุณหภูมิ', '36.6'],
      ['FHS', '148'],
      ['SpO2', '99'],
    ],
    icd: [['Z34.9', 'Supervision of normal pregnancy', 'หลัก']],
    drugs: ['Ferrous fumarate 1x1 pc', 'Folic acid 1x1 pc'],
    labs: ['CBC, OGTT'],
    xray: [],
    vax: ['dT เข็ม 2'],
  },
  {
    cid: '3-1012-05128-63-8',
    name: 'นายอนันต์ พูลสวัสดิ์',
    sex: 'ชาย',
    dob: '17/07/2524',
    age: 45,
    address: '7 ม.9 ต.ท่าพระ อ.เมือง จ.ขอนแก่น',
    allergy: '',
    chronic: '—',
    service: 'ทันตกรรม',
    room: 'DEN2',
    cc: 'ปวดฟันกรามล่างซ้าย 3 วัน',
    hpi: 'ปวดตุบ ๆ กลางคืน ทานยาแก้ปวดอาการดีขึ้นชั่วคราว',
    pe: 'ฟัน 36 ผุลึก เคาะเจ็บ เหงือกบวมเล็กน้อย',
    vitals: [
      ['BP', '126/78'],
      ['ชีพจร', '78'],
      ['หายใจ', '18'],
      ['อุณหภูมิ', '37.1'],
      ['SpO2', '98'],
      ['DTX', '—'],
    ],
    icd: [['K04.0', 'Pulpitis', 'หลัก']],
    drugs: ['Amoxicillin 500 mg 1x3 pc', 'Ibuprofen 400 mg 1x3 pc'],
    labs: [],
    xray: ['X-ray periapical 36'],
    vax: [],
  },
];

export const FACILITIES: Facility[] = [
  { code: '11542', name: 'รพ.สต.บ้านโนนสูง', area: 'ต.โนนสูง อ.เมือง จ.ขอนแก่น · เขต 7' },
  { code: '11543', name: 'รพ.สต.บ้านหนองแวง', area: 'ต.ศิลา อ.เมือง จ.ขอนแก่น · เขต 7' },
  { code: '10670', name: 'รพ.ขอนแก่น (แม่ข่าย)', area: 'ต.ในเมือง อ.เมือง จ.ขอนแก่น · เขต 7' },
  { code: '11544', name: 'รพ.สต.บ้านเป็ด', area: 'ต.บ้านเป็ด อ.เมือง จ.ขอนแก่น · เขต 7' },
  { code: '11545', name: 'ศูนย์สุขภาพชุมชนเมืองเก่า', area: 'ต.เมืองเก่า อ.เมือง จ.ขอนแก่น · เขต 7' },
  { code: '11546', name: 'รพ.สต.ท่าพระ', area: 'ต.ท่าพระ อ.เมือง จ.ขอนแก่น · เขต 7' },
];

const IMPORT_BASE: Array<{ label: string; file: string; rows: number; kb: number }> = [
  { label: 'สถานพยาบาลและหน่วยบริการ', file: 'hospital.json', rows: 1842, kb: 182 },
  { label: 'รหัสยาและเวชภัณฑ์', file: 'drug_master.json', rows: 8412, kb: 2458 },
  { label: 'ICD-10 / ICD-9-CM', file: 'diagnosis.json', rows: 9655, kb: 3174 },
  { label: 'สิทธิ์การรักษา', file: 'insurance.json', rows: 126, kb: 24 },
  { label: 'วัคซีนและ LOT', file: 'vaccine_master.json', rows: 214, kb: 48 },
  { label: 'หมู่บ้าน / เขตรับผิดชอบ', file: 'village.json', rows: 1204, kb: 96 },
  { label: 'แพทย์และเจ้าหน้าที่', file: 'provider.json', rows: 318, kb: 36 },
  { label: 'แบบฟอร์มคัดกรองมาตรฐาน', file: 'screening_form.json', rows: 62, kb: 120 },
];

const fmtSize = (kb: number): string => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`);

/**
 * ชุดข้อมูลนำเข้า "ต่างกันตามหน่วยงาน" — สุ่มแบบ deterministic จากรหัสหน่วยงาน
 * (เปิดซ้ำได้ชุดเดิมเสมอ · รพ.แม่ข่าย 10670 มีข้อมูลเยอะกว่า รพ.สต. ทั่วไป)
 */
export const tablesForFacility = (code: string): Omit<ImportTable, 'pct'>[] => {
  let seed = code.split('').reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const boost = code === '10670' ? 2.4 + rnd() * 0.5 : 0.55 + rnd() * 0.85;
  return IMPORT_BASE.map((t) => {
    const factor = boost * (0.72 + rnd() * 0.56);
    return {
      label: t.label,
      file: t.file,
      rows: Math.max(24, Math.round(t.rows * factor)),
      size: fmtSize(Math.max(8, t.kb * factor)),
    };
  });
};

/** ชุดของหน่วยงานแรก (ค่าเริ่มต้น) */
export const IMPORT_TABLES = tablesForFacility('11542');

export const BRANCHES: Branch[] = [
  { code: 'OPD', name: 'OPD ผู้ป่วยนอก', rooms: ['102 ห้องตรวจ 1', '103 ห้องตรวจ 2', '104 ห้องคัดกรอง', '105 ห้องทำแผล'] },
  { code: 'EPI', name: 'วัคซีน / EPI', rooms: ['EPI1 ห้องวัคซีน', 'EPI2 ห้องสังเกตอาการ'] },
  { code: 'ANC', name: 'แม่และเด็ก', rooms: ['ANC1 ห้องฝากครรภ์', 'ANC2 ห้องหลังคลอด', 'WCC คลินิกเด็กดี'] },
  { code: 'NCD', name: 'คลินิก NCD', rooms: ['NCD1 ห้องเบาหวาน', 'NCD2 ห้องความดัน', 'NCD3 ห้องให้คำปรึกษา'] },
  { code: 'DEN', name: 'ทันตกรรม', rooms: ['DEN1 ยูนิตทันตกรรม 1', 'DEN2 ยูนิตทันตกรรม 2'] },
  { code: 'HHC', name: 'เยี่ยมบ้าน', rooms: ['HHC ทีมลงพื้นที่', 'MOB รถพยาบาลเคลื่อนที่'] },
];

/** สถานะห้องปฏิบัติงาน (ตาม Figma dashboard) */
export const DOCTORS: Doctor[] = [
  { name: 'นพ.ธนา วงศ์ดี', room: '102', roomLabel: 'ห้องตรวจ 1', status: 'busy' },
  { name: 'พญ.ศิริพร ทองคำ', room: '103', roomLabel: 'ห้องตรวจ 2', status: 'free' },
  { name: 'พย.มาลี สุขสม', room: '104', roomLabel: 'ห้องตรวจ 3', status: 'busy' },
  { name: 'พย.กาญจนา ดีงาม', room: 'EPI', roomLabel: 'ห้องวัคซีน', status: 'busy' },
];

export const OSS_TABS: Array<{ id: OssTabId; label: string }> = [
  { id: 'list', label: 'รายการรับบริการ' },
  { id: 'enc', label: 'ซักประวัติ / ตรวจรักษา' },
  { id: 'drug', label: 'สั่งยา / จ่ายยา' },
  { id: 'lab', label: 'Lab / X-ray' },
  { id: 'appt', label: 'นัดหมาย' },
  { id: 'vax', label: 'วัคซีน / EPI' },
  { id: 'ncd', label: 'คัดกรอง NCD' },
  { id: 'visit', label: 'เยี่ยมบ้าน' },
  { id: 'anc', label: 'ANC / แม่และเด็ก' },
  { id: 'dent', label: 'ทันตกรรม' },
  { id: 'refer', label: 'ส่งต่อ / Refer' },
];

export const SYNC_FAILS: Array<{ error: string; field: string }> = [
  { error: 'เลขบัตรประชาชนตรวจสอบไม่ผ่าน (checksum)', field: 'เลขบัตรประชาชน' },
  { error: 'ไม่พบรหัสสิทธิ์การรักษาในทะเบียน Cloud', field: 'รหัสสิทธิ์การรักษา' },
  { error: 'รหัส ICD-10 ไม่อยู่ในชุดข้อมูลปีปัจจุบัน', field: 'รหัส ICD-10' },
];

export const RIGHT_OPTIONS = ['บัตรทอง (UC)', 'ประกันสังคม', 'ข้าราชการ', 'ชำระเงินเอง'];

export const SERVICE_OPTIONS = ['ตรวจโรคทั่วไป', 'คัดกรอง NCD', 'วัคซีน / EPI', 'ANC', 'ทันตกรรม', 'เยี่ยมบ้าน'];

/** ป้าย + โทนของแต่ละขั้นตอนคิว */
export const STAGE_META: Record<QueueStage, { label: string; tone: 'warning' | 'info' | 'purple' | 'success' | 'neutral' }> = {
  wait: { label: 'รอเรียกตรวจ', tone: 'warning' },
  screen: { label: 'กำลังคัดกรอง', tone: 'info' },
  pending: { label: 'รอดำเนินการ', tone: 'warning' },
  lab: { label: 'รอผล Lab', tone: 'purple' },
  done: { label: 'เสร็จสิ้น', tone: 'success' },
};

/** 10 ขั้นตอนการตรวจที่แสดงเป็น checkbox ในหน้า Sync (ตาม Figma) */
export const SYNC_STEP_LABELS = [
  'ลงทะเบียน',
  'ซักประวัติ',
  'สัญญาณชีพ',
  'ตรวจร่างกาย',
  'วินิจฉัย',
  'สั่งยา',
  'จ่ายยา',
  'Lab',
  'X-ray',
  'วัคซีน',
];

export const syncSteps = (r: {
  fHist: boolean;
  fPe: boolean;
  fDrug: boolean;
  fLab: boolean;
  fXray: boolean;
  fVax: boolean;
  icd: Array<[string, string, string]>;
}): boolean[] => [true, r.fHist, true, r.fPe, r.icd.length > 0, r.fDrug, r.fDrug, r.fLab, r.fXray, r.fVax];
