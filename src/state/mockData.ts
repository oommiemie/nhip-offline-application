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
    race: 'ไทย',
    nationality: 'ไทย',
    religion: 'พุทธ',
    bloodType: 'O',
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
    race: 'ไทย',
    nationality: 'ไทย',
    religion: 'พุทธ',
    bloodType: 'B',
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
    race: 'ไทย',
    nationality: 'ไทย',
    religion: 'พุทธ',
    bloodType: 'A',
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
    race: 'ไทย',
    nationality: 'ไทย',
    religion: 'พุทธ',
    bloodType: 'AB',
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
    race: 'ไทย',
    nationality: 'ไทย',
    religion: 'อิสลาม',
    bloodType: 'O',
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
    race: 'จีน',
    nationality: 'ไทย',
    religion: 'พุทธ',
    bloodType: 'B',
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

/**
 * รหัสห้อง → ชื่อห้อง (แหล่งเดียวของทั้งระบบ)
 * แตกมาจากสตริงใน BRANCHES เช่น '102 ห้องตรวจ 1' เพื่อไม่ให้ชื่อห้องในตารางคิว
 * กับในการ์ดสถานะห้องปฏิบัติงานเพี้ยนกัน
 */
const ROOMS: Record<string, string> = {};
BRANCHES.forEach((b) =>
  b.rooms.forEach((r) => {
    const i = r.indexOf(' ');
    if (i > 0) ROOMS[r.slice(0, i)] = r.slice(i + 1);
  }),
);
export const ROOM_LABELS: Readonly<Record<string, string>> = ROOMS;
export const roomLabel = (code: string): string => ROOMS[code] ?? '';

/**
 * เจ้าหน้าที่ประจำห้อง — ครบทุกห้องที่ประกาศไว้ใน BRANCHES (16 ห้อง)
 * รหัสห้องต้องมีอยู่ใน BRANCHES เท่านั้น ไม่งั้น roomLabel() จะคืนค่าว่าง
 */
export const DOCTORS: Doctor[] = [
  // OPD
  { name: 'นพ.ธนา วงศ์ดี', room: '102', roomLabel: roomLabel('102'), status: 'busy' },
  { name: 'พญ.ศิริพร ทองคำ', room: '103', roomLabel: roomLabel('103'), status: 'free' },
  { name: 'พย.มาลี สุขสม', room: '104', roomLabel: roomLabel('104'), status: 'busy' },
  { name: 'พย.อรพิน แก้วมณี', room: '105', roomLabel: roomLabel('105'), status: 'busy' },
  // วัคซีน / EPI
  { name: 'พย.กาญจนา ดีงาม', room: 'EPI1', roomLabel: roomLabel('EPI1'), status: 'busy' },
  { name: 'พย.สุดารัตน์ พิมพา', room: 'EPI2', roomLabel: roomLabel('EPI2'), status: 'free' },
  // แม่และเด็ก
  { name: 'พย.วรรณา ศรีทอง', room: 'ANC1', roomLabel: roomLabel('ANC1'), status: 'busy' },
  { name: 'พย.นิภา จันทร์เพ็ง', room: 'ANC2', roomLabel: roomLabel('ANC2'), status: 'free' },
  { name: 'พย.ชุติมา บุญมาก', room: 'WCC', roomLabel: roomLabel('WCC'), status: 'busy' },
  // คลินิก NCD
  { name: 'นพ.ปกรณ์ อินทร์ทอง', room: 'NCD1', roomLabel: roomLabel('NCD1'), status: 'busy' },
  { name: 'พย.สมหญิง เกษร', room: 'NCD2', roomLabel: roomLabel('NCD2'), status: 'busy' },
  { name: 'นวก.ธีระ พงษ์ไทย', room: 'NCD3', roomLabel: roomLabel('NCD3'), status: 'free' },
  // ทันตกรรม
  { name: 'ทพ.ภาสกร ใจซื่อ', room: 'DEN1', roomLabel: roomLabel('DEN1'), status: 'busy' },
  { name: 'ทพญ.ณิชา วารีรัตน์', room: 'DEN2', roomLabel: roomLabel('DEN2'), status: 'free' },
  // เยี่ยมบ้าน
  { name: 'พย.ประไพ ทองสุข', room: 'HHC', roomLabel: roomLabel('HHC'), status: 'busy' },
  { name: 'จนท.สมพงษ์ ยิ่งยง', room: 'MOB', roomLabel: roomLabel('MOB'), status: 'free' },
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

/* ---------------- ผู้ป่วยตัวอย่างในคิว (30 ราย) ---------------- */

interface SeedRow {
  name: string;
  sex: 'ชาย' | 'หญิง';
  age: number;
  /** ชุดข้อมูลทางคลินิกที่จะหยิบมาเติม (ดู CLINICAL) */
  kind: keyof typeof CLINICAL;
  room: string;
  stage: QueueStage;
  time: string;
  allergy?: string;
  chronic?: string;
}

/**
 * คิวเช้าหนึ่งกะของ รพ.สต. — เรียงตามเวลามาถึง
 * คนมาเช้าตรวจเสร็จแล้ว (done) ช่วงกลางกำลังรอผล/รอดำเนินการ ช่วงท้ายเพิ่งมาถึง (wait)
 */
const SEED_ROWS: SeedRow[] = [
  { name: 'นางสมพร แก้วใส', sex: 'หญิง', age: 62, kind: 'ht', room: '102', stage: 'screen', time: '07:42', allergy: 'PENICILLIN', chronic: 'DM, HT' },
  { name: 'นายวิชัย ทองอยู่', sex: 'ชาย', age: 58, kind: 'ncd', room: '104', stage: 'done', time: '07:48', chronic: 'HT' },
  { name: 'ด.ญ.พิมพ์ชนก มีสุข', sex: 'หญิง', age: 1, kind: 'epi', room: 'EPI1', stage: 'done', time: '07:55' },
  { name: 'นายประยุทธ นาคเงิน', sex: 'ชาย', age: 71, kind: 'dm', room: 'NCD1', stage: 'lab', time: '08:01', allergy: 'NSAIDs', chronic: 'DM' },
  { name: 'น.ส.ชนกวรรณ ศรีสุข', sex: 'หญิง', age: 27, kind: 'anc', room: 'ANC1', stage: 'done', time: '08:06' },
  { name: 'นางบุญมี ชัยวงศ์', sex: 'หญิง', age: 68, kind: 'ht', room: '102', stage: 'done', time: '08:12', chronic: 'HT, DLP' },
  { name: 'นายสมชาย ใจกล้า', sex: 'ชาย', age: 45, kind: 'gen', room: '103', stage: 'done', time: '08:17' },
  { name: 'ด.ช.ธนกฤต พูนผล', sex: 'ชาย', age: 3, kind: 'wcc', room: 'WCC', stage: 'done', time: '08:21' },
  { name: 'นางจันทร์เพ็ญ สุขสวัสดิ์', sex: 'หญิง', age: 55, kind: 'dm', room: 'NCD1', stage: 'lab', time: '08:26', chronic: 'DM' },
  { name: 'นายอนุชา แสงทอง', sex: 'ชาย', age: 39, kind: 'wound', room: '105', stage: 'done', time: '08:30', allergy: 'SULFA' },
  { name: 'นางสุนีย์ พรมมา', sex: 'หญิง', age: 73, kind: 'ht', room: '102', stage: 'pending', time: '08:35', chronic: 'HT, CKD' },
  { name: 'น.ส.ปิยะดา คำแก้ว', sex: 'หญิง', age: 31, kind: 'anc', room: 'ANC1', stage: 'done', time: '08:39' },
  { name: 'นายเกรียงไกร ดวงดี', sex: 'ชาย', age: 50, kind: 'ncd', room: '104', stage: 'done', time: '08:44' },
  { name: 'นางอำไพ บุญเรือง', sex: 'หญิง', age: 66, kind: 'dent', room: 'DEN1', stage: 'lab', time: '08:48' },
  { name: 'ด.ช.ณัฐพล มั่นคง', sex: 'ชาย', age: 2, kind: 'epi', room: 'EPI1', stage: 'done', time: '08:52' },
  { name: 'นายบุญส่ง ทับทิม', sex: 'ชาย', age: 64, kind: 'dm', room: 'NCD1', stage: 'pending', time: '08:57', chronic: 'DM, HT' },
  { name: 'นางวิไล ศรีนวล', sex: 'หญิง', age: 59, kind: 'gen', room: '103', stage: 'lab', time: '09:02', allergy: 'ASPIRIN' },
  { name: 'น.ส.กมลชนก อ่อนละมุน', sex: 'หญิง', age: 24, kind: 'anc', room: 'ANC1', stage: 'screen', time: '09:07' },
  { name: 'นายสุทัศน์ เรืองศรี', sex: 'ชาย', age: 47, kind: 'ncd', room: '104', stage: 'screen', time: '09:11' },
  { name: 'นางประนอม จันทร์หอม', sex: 'หญิง', age: 70, kind: 'ht', room: '102', stage: 'pending', time: '09:16', chronic: 'HT' },
  { name: 'ด.ญ.ศิริรัตน์ ดวงแก้ว', sex: 'หญิง', age: 5, kind: 'wcc', room: 'WCC', stage: 'screen', time: '09:20' },
  { name: 'นายมานพ ทองคำ', sex: 'ชาย', age: 53, kind: 'dent', room: 'DEN2', stage: 'pending', time: '09:25' },
  { name: 'นางเพ็ญศรี ภูมิดี', sex: 'หญิง', age: 61, kind: 'dm', room: 'NCD1', stage: 'wait', time: '09:31', chronic: 'DM' },
  { name: 'นายวีระ สอนดี', sex: 'ชาย', age: 42, kind: 'gen', room: '103', stage: 'wait', time: '09:36' },
  { name: 'น.ส.อรทัย พันธ์ดี', sex: 'หญิง', age: 29, kind: 'gen', room: '102', stage: 'wait', time: '09:42', allergy: 'PENICILLIN' },
  { name: 'นางทองใบ แสนสุข', sex: 'หญิง', age: 77, kind: 'ht', room: '102', stage: 'wait', time: '09:48', chronic: 'HT, DM, CKD' },
  { name: 'นายพิชิต ก้อนทอง', sex: 'ชาย', age: 36, kind: 'wound', room: '105', stage: 'wait', time: '09:55' },
  { name: 'ด.ช.กิตติภพ ใจดี', sex: 'ชาย', age: 4, kind: 'epi', room: 'EPI1', stage: 'wait', time: '10:02' },
  { name: 'นางลำดวน นาคสุข', sex: 'หญิง', age: 65, kind: 'ncd', room: '104', stage: 'wait', time: '10:10' },
  { name: 'นายถวิล ปัญญาดี', sex: 'ชาย', age: 69, kind: 'dm', room: 'NCD2', stage: 'wait', time: '10:18', chronic: 'DM, HT' },
];

/** รายละเอียดทางคลินิกแยกตามประเภทบริการ — ใช้เติมให้ทั้ง 30 รายโดยไม่ต้องเขียนซ้ำ */
const CLINICAL = {
  gen: {
    service: 'ตรวจโรคทั่วไป',
    cc: 'ไข้ ไอ เจ็บคอ 2 วัน',
    hpi: 'ไข้ต่ำ ๆ ไอมีเสมหะเล็กน้อย ปฏิเสธหอบเหนื่อย ยังทานอาหารได้',
    pe: 'GA alert, Pharynx injected เล็กน้อย, Lungs clear',
    icd: [['J06.9', 'Acute upper respiratory infection', 'หลัก']] as Array<[string, string, string]>,
    drugs: ['Paracetamol 500 mg 1x3 prn', 'Bromhexine 8 mg 1x3 pc'],
    labs: [] as string[],
    xray: [] as string[],
    vax: [] as string[],
  },
  ht: {
    service: 'ตรวจโรคทั่วไป',
    cc: 'มาตามนัดติดตามความดันโลหิต',
    hpi: 'ทานยาสม่ำเสมอ ปฏิเสธเจ็บแน่นหน้าอก ปวดศีรษะท้ายทอยเป็นพัก ๆ',
    pe: 'GA alert ไม่ซีด, Heart normal S1S2, Lungs clear, ไม่บวม',
    icd: [['I10', 'Essential hypertension', 'หลัก']] as Array<[string, string, string]>,
    drugs: ['Amlodipine 10 mg 1x1 pc', 'HCTZ 25 mg 1x1 เช้า'],
    labs: ['Creatinine, Electrolyte'] as string[],
    xray: [] as string[],
    vax: [] as string[],
  },
  ncd: {
    service: 'คัดกรอง NCD',
    cc: 'คัดกรองความเสี่ยงโรคเรื้อรังประจำปี',
    hpi: 'ไม่มีอาการผิดปกติ สูบบุหรี่ไม่ประจำ ออกกำลังกายสัปดาห์ละ 2 ครั้ง',
    pe: 'GA good, รอบเอวเกินเกณฑ์เล็กน้อย',
    icd: [['Z13.9', 'Special screening examination', 'หลัก']] as Array<[string, string, string]>,
    drugs: [] as string[],
    labs: ['FBS, Lipid profile'] as string[],
    xray: [] as string[],
    vax: [] as string[],
  },
  dm: {
    service: 'คลินิกเบาหวาน',
    cc: 'มาตามนัดคลินิกเบาหวาน เจาะน้ำตาลปลายนิ้ว',
    hpi: 'คุมอาหารได้บ้าง มีชาปลายเท้าเล็กน้อย ปฏิเสธแผลเรื้อรัง',
    pe: 'GA alert, ตรวจเท้าไม่พบแผล, Monofilament ปกติ',
    icd: [
      ['E11.9', 'Type 2 DM without complications', 'หลัก'],
      ['I10', 'Essential hypertension', 'ร่วม'],
    ] as Array<[string, string, string]>,
    drugs: ['Metformin 500 mg 1x2 pc', 'Glipizide 5 mg 1x1 ac'],
    labs: ['FBS, HbA1c, Creatinine, Urine microalbumin'] as string[],
    xray: [] as string[],
    vax: [] as string[],
  },
  epi: {
    service: 'วัคซีน / EPI',
    cc: 'มารับวัคซีนตามเกณฑ์อายุ',
    hpi: 'ไม่มีไข้ ไม่มีประวัติแพ้วัคซีน กินนมได้ปกติ',
    pe: 'GA active ร่าเริง, อุณหภูมิปกติ',
    icd: [['Z23', 'Encounter for immunization', 'หลัก']] as Array<[string, string, string]>,
    drugs: ['Paracetamol syrup prn (เผื่อไข้หลังฉีด)'],
    labs: [] as string[],
    xray: [] as string[],
    vax: ['DTP-HB-Hib เข็มกระตุ้น', 'OPV'] as string[],
  },
  wcc: {
    service: 'คลินิกเด็กดี',
    cc: 'ตรวจพัฒนาการและชั่งน้ำหนักตามนัด',
    hpi: 'กินได้ นอนหลับดี พัฒนาการสมวัยตามแบบประเมิน DSPM',
    pe: 'น้ำหนัก/ส่วนสูงตามเกณฑ์, ฟันไม่ผุ',
    icd: [['Z00.1', 'Routine child health examination', 'หลัก']] as Array<[string, string, string]>,
    drugs: ['Ferrous drop 0.6 ml OD'],
    labs: [] as string[],
    xray: [] as string[],
    vax: [] as string[],
  },
  anc: {
    service: 'ฝากครรภ์',
    cc: 'ฝากครรภ์ตามนัด อายุครรภ์ตามสมุดสีชมพู',
    hpi: 'ลูกดิ้นดี ปฏิเสธเลือดออกทางช่องคลอด ไม่มีน้ำเดิน',
    pe: 'ครรภ์สูงตามอายุครรภ์, FHS 148 ครั้ง/นาที',
    icd: [['Z34.9', 'Supervision of normal pregnancy', 'หลัก']] as Array<[string, string, string]>,
    drugs: ['Triferdine 1x1 pc', 'Calcium carbonate 1x2 pc'],
    labs: ['CBC, Urine analysis'] as string[],
    xray: [] as string[],
    vax: ['dT เข็มที่ 2'] as string[],
  },
  dent: {
    service: 'ทันตกรรม',
    cc: 'ปวดฟันกรามล่างขวา 3 วัน',
    hpi: 'ปวดตุบ ๆ เวลาเคี้ยว ทานยาแก้ปวดแล้วทุเลาชั่วคราว',
    pe: 'ฟัน 46 ผุลึก เคาะเจ็บ เหงือกบวมเล็กน้อย',
    icd: [['K02.9', 'Dental caries', 'หลัก']] as Array<[string, string, string]>,
    drugs: ['Amoxicillin 500 mg 1x3 pc', 'Ibuprofen 400 mg 1x3 pc'],
    labs: [] as string[],
    xray: ['Periapical film ฟัน 46'] as string[],
    vax: [] as string[],
  },
  wound: {
    service: 'ทำแผล',
    cc: 'มาทำแผลตามนัด แผลที่ขาขวา',
    hpi: 'แผลแห้งดีขึ้น ไม่มีไข้ ปฏิเสธปวดมากขึ้น',
    pe: 'แผลขนาด 2x3 ซม. granulation tissue ดี ไม่มีหนอง',
    icd: [['Z48.0', 'Attention to surgical dressing', 'หลัก']] as Array<[string, string, string]>,
    drugs: ['NSS irrigation + dressing'],
    labs: [] as string[],
    xray: [] as string[],
    vax: [] as string[],
  },
};

/** ตัวเลือกหมู่เลือดในฟอร์มลงทะเบียน */
export const BLOOD_OPTIONS = ['ไม่ทราบ', 'O', 'A', 'B', 'AB'];

/** หมู่เลือดตามสัดส่วนที่พบจริงในไทย (O และ B พบมากสุด) */
const BLOOD_TYPES = ['O', 'O', 'O', 'B', 'B', 'B', 'A', 'A', 'AB'];

const VILLAGES = [
  '12 ม.4 ต.โนนสูง', '88 ม.1 ต.ศิลา', '45 ม.7 ต.บ้านเป็ด', '203 ม.2 ต.เมืองเก่า',
  '9 ม.5 ต.ท่าพระ', '77/1 ม.3 ต.โนนสูง', '156 ม.6 ต.ศิลา', '31 ม.8 ต.ในเมือง',
];

/** สุ่มแบบ deterministic จากลำดับ — เปิดแอปกี่ครั้งข้อมูลชุดเดิมเสมอ ไม่เด้งมั่วตอนสาธิต */
const rnd = (i: number, salt: number): number => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const pad2 = (n: number): string => String(n).padStart(2, '0');

const buildCard = (r: SeedRow, i: number): PatientCard => {
  const cl = CLINICAL[r.kind];
  const old = r.age >= 60;
  const sick = (r.chronic ?? '').includes('HT');
  // สัญญาณชีพขยับตามอายุและโรคประจำตัว ให้ตัวเลขดูสมจริงแทนที่จะซ้ำกันทุกคน
  const sys = Math.round((sick ? 138 : old ? 126 : 116) + rnd(i, 1) * 22);
  const dia = Math.round((sick ? 84 : 72) + rnd(i, 2) * 14);
  const yearBE = 2569 - r.age;
  return {
    cid: `3-10${pad2(12 + (i % 6))}-${String(Math.floor(rnd(i, 3) * 89999) + 10000)}-${pad2(Math.floor(rnd(i, 4) * 89) + 10)}-${Math.floor(rnd(i, 5) * 9) + 1}`,
    name: r.name,
    sex: r.sex,
    dob: `${pad2(Math.floor(rnd(i, 6) * 27) + 1)}/${pad2(Math.floor(rnd(i, 7) * 11) + 1)}/${yearBE}`,
    age: r.age,
    address: `${VILLAGES[i % VILLAGES.length]} อ.เมือง จ.ขอนแก่น`,
    // เชื้อชาติ/สัญชาติ/ศาสนา อ่านได้จากบัตร · หมู่เลือดไม่มีบนบัตร ต้องสอบถามผู้ป่วย
    race: rnd(i, 13) < 0.9 ? 'ไทย' : 'จีน',
    nationality: 'ไทย',
    religion: rnd(i, 14) < 0.86 ? 'พุทธ' : rnd(i, 15) < 0.6 ? 'อิสลาม' : 'คริสต์',
    bloodType: BLOOD_TYPES[Math.floor(rnd(i, 16) * BLOOD_TYPES.length)],
    allergy: r.allergy ?? '',
    chronic: r.chronic ?? '—',
    service: cl.service,
    room: r.room,
    cc: cl.cc,
    hpi: cl.hpi,
    pe: cl.pe,
    vitals: [
      ['BP', `${sys}/${dia}`],
      ['ชีพจร', String(Math.round(68 + rnd(i, 8) * 24))],
      ['หายใจ', String(Math.round(16 + rnd(i, 9) * 4))],
      ['อุณหภูมิ', (36.4 + rnd(i, 10) * 1.1).toFixed(1)],
      ['SpO2', String(Math.round(96 + rnd(i, 11) * 3))],
      ['DTX', String(Math.round((r.kind === 'dm' ? 128 : 88) + rnd(i, 12) * 70))],
    ],
    icd: cl.icd,
    drugs: cl.drugs,
    labs: cl.labs,
    xray: cl.xray,
    vax: cl.vax,
  };
};

/** คิวตั้งต้นของแอป — การ์ดผู้ป่วยพร้อมสถานะและเวลามาถึง */
export const QUEUE_SEED: Array<{ card: PatientCard; stage: QueueStage; time: string }> = SEED_ROWS.map((r, i) => ({
  card: buildCard(r, i),
  stage: r.stage,
  time: r.time,
}));
