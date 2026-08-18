export type View = 'login' | 'setup' | 'app';
export type ScreenId = 'dashboard' | 'oss' | 'sync' | 'settings';

export type OssTabId =
  | 'list'
  | 'enc'
  | 'drug'
  | 'lab'
  | 'appt'
  | 'vax'
  | 'ncd'
  | 'visit'
  | 'anc'
  | 'dent'
  | 'refer';

export type SsoState = 'out' | 'busy' | 'in';

/** สถานะเครื่องอ่านบัตรใน modal ลงทะเบียน (ตรงกับ Figma 3 step) */
/** เครื่องอ่านบัตร: ยังไม่เชื่อม → กำลังเชื่อม → พร้อมอ่าน → กำลังอ่าน → อ่านสำเร็จ */
export type ReaderState = 'idle' | 'connecting' | 'ready' | 'reading' | 'read';

/** ขั้นตอนคิวของคนไข้ → ใช้ map เป็น badge สถานะ */
export type QueueStage = 'wait' | 'screen' | 'pending' | 'lab' | 'done';

export type SyncResult = null | 'busy' | 'pass' | 'fail';

export interface PatientCard {
  cid: string;
  name: string;
  sex: 'ชาย' | 'หญิง';
  dob: string;
  age: number;
  address: string;
  /** จากบัตรประชาชน */
  race: string;
  nationality: string;
  religion: string;
  /** ไม่มีบนบัตร — สอบถามผู้ป่วยตอนลงทะเบียน */
  bloodType: string;
  allergy: string;
  chronic: string;
  service: string;
  room: string;
  cc: string;
  hpi: string;
  pe: string;
  vitals: Array<[string, string]>;
  icd: Array<[string, string, string]>;
  drugs: string[];
  labs: string[];
  xray: string[];
  vax: string[];
}

export interface VisitRecord extends PatientCard {
  hn: string;
  queueNo: string;
  time: string;
  right: string;
  /** เบอร์โทรติดต่อกลับที่บันทึกตอนลงทะเบียน (ว่าง = ยังไม่ได้ระบุ) */
  phone: string;
  stage: QueueStage;
  fHist: boolean;
  fPe: boolean;
  fDrug: boolean;
  fLab: boolean;
  fXray: boolean;
  fVax: boolean;
  sync: SyncResult;
  error: string;
  errorField: string;
  errorValue: string;
}

export interface LogLine {
  text: string;
  tone: 'cmd' | 'ok' | 'err' | 'info';
}

export interface ImportTable {
  label: string;
  file: string;
  rows: number;
  size: string;
  pct: number;
}

export interface Facility {
  code: string;
  name: string;
  area: string;
}

export interface Branch {
  code: string;
  name: string;
  rooms: string[];
}

export interface Doctor {
  name: string;
  room: string;
  roomLabel: string;
  status: 'busy' | 'free';
}

export interface RegisterPayload {
  right: string;
  service: string;
  allergy: string;
  bloodType: string;
  /** เบอร์โทรติดต่อกลับ — ไม่มีบนบัตรประชาชน ต้องสอบถามผู้ป่วย (ว่างได้) */
  phone: string;
}

export type NoticeTone = 'success' | 'warning' | 'destructive' | 'info';

/** แจ้งเตือนในแอป (กระดิ่งมุมขวาบน) */
export interface AppNotice {
  id: string;
  tone: NoticeTone;
  title: string;
  detail?: string;
  /** เวลาแบบ HH:MM */
  time: string;
  read: boolean;
  /** กดแล้วพาไปหน้าไหน */
  screen?: ScreenId;
}

export interface AppState {
  view: View;
  screen: ScreenId;
  ossTab: OssTabId;
  branch: string;
  room: string;
  userName: string;
  configured: boolean;
  facility: Facility;
  pick: string;
  sso: SsoState;
  ssoUser: string;
  ssoTime: string;
  ssoModalOpen: boolean;
  syncAfterAuth: boolean;
  setupTables: ImportTable[];
  setupLog: LogLine[];
  setupRunning: boolean;
  setupDone: boolean;
  records: VisitRecord[];
  curIdx: number | null;
  seq: number;
  regOpen: boolean;
  reader: ReaderState;
  card: PatientCard | null;
  syncing: boolean;
  syncPct: number;
  syncLog: LogLine[];
  lastSync: string;
  editingIdx: number | null;
  opdIdx: number | null;
  historyOpen: boolean;
  notices: AppNotice[];
}
