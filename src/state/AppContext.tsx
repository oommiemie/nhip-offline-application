import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { nowHM } from '../utils/format';
import { BRANCHES, CARDS, FACILITIES, IMPORT_TABLES, SYNC_FAILS, tablesForFacility } from './mockData';
import type {
  AppNotice,
  AppState,
  Facility,
  ImportTable,
  LogLine,
  OssTabId,
  PatientCard,
  QueueStage,
  RegisterPayload,
  ScreenId,
  VisitRecord,
} from './types';

const HN_BASE = 6800124;
const HN_STEP = 137;

/* ---------------- แจ้งเตือน ---------------- */

let noticeSeq = 0;
const nextNoticeId = (): string => `n${++noticeSeq}`;

/** ต่อแจ้งเตือนใหม่ไว้บนสุด เก็บไม่เกิน 30 รายการ */
const pushNotice = (list: AppNotice[], n: Omit<AppNotice, 'id' | 'time' | 'read'> & { time?: string }): AppNotice[] =>
  [{ id: nextNoticeId(), time: n.time ?? nowHM(), read: false, ...n }, ...list].slice(0, 30);

const seedNotices = (): AppNotice[] => [
  {
    id: nextNoticeId(),
    tone: 'warning',
    title: 'มีรายการรอซิงค์ขึ้น Cloud',
    detail: 'ข้อมูลผู้ป่วยเช้านี้ยังไม่ได้อัปโหลด — ยืนยันตัวตน MOPH SSO ก่อนเริ่ม',
    time: '09:12',
    read: false,
    screen: 'sync',
  },
  {
    id: nextNoticeId(),
    tone: 'info',
    title: 'ฐานข้อมูลพื้นฐานเป็นปัจจุบัน',
    detail: 'ตรวจสอบเวอร์ชันรหัสยาและ ICD-10 ล่าสุดเมื่อ 08:40 น.',
    time: '08:40',
    read: false,
  },
  {
    id: nextNoticeId(),
    tone: 'success',
    title: 'เข้าสู่ระบบสำเร็จ',
    detail: 'เริ่มกะเช้า OPD ห้องตรวจ 102',
    time: '08:00',
    read: true,
  },
];

const makeRecord = (
  card: PatientCard,
  index: number,
  extra: Partial<Pick<VisitRecord, 'time' | 'stage' | 'right' | 'service' | 'allergy'>> = {}
): VisitRecord => ({
  ...card,
  hn: String(HN_BASE + index * HN_STEP),
  queueNo: `A-${String(index + 1).padStart(3, '0')}`,
  time: extra.time ?? nowHM(),
  right: extra.right ?? (index % 4 === 1 ? 'ประกันสังคม' : index % 4 === 3 ? 'ข้าราชการ' : 'บัตรทอง (UC)'),
  service: extra.service ?? card.service,
  allergy: extra.allergy ?? card.allergy,
  stage: extra.stage ?? 'wait',
  fHist: true,
  fPe: true,
  fDrug: card.drugs.length > 0,
  fLab: card.labs.length > 0,
  fXray: card.xray.length > 0,
  fVax: card.vax.length > 0,
  sync: null,
  error: '',
  errorField: '',
  errorValue: '',
});

/** seed คิว 5 รายแรกให้หน้าจอมีข้อมูลเหมือนดีไซน์ Figma ตั้งแต่เปิดแอป */
const SEED_STAGES: QueueStage[] = ['screen', 'wait', 'done', 'lab', 'wait'];
const SEED_TIMES = ['08:52', '09:03', '09:10', '09:15', '09:28'];

const seedRecords = (): VisitRecord[] =>
  CARDS.slice(0, 5).map((c, i) => makeRecord(c, i, { stage: SEED_STAGES[i], time: SEED_TIMES[i] }));

/** dev shortcut (เว็บเท่านั้น): เปิด /#app /#oss /#sync /#settings เพื่อข้ามหน้า login ระหว่างพัฒนา */
const webHash = (): string => {
  const loc = (globalThis as { location?: { hash?: string } }).location;
  return loc?.hash ?? '';
};

const SCREEN_HASHES = ['#app', '#oss', '#sync', '#settings'];

const initialState = (): AppState => ({
  // '#import' = QA hash เปิดหน้า setup แบบยืนยันตัวตนแล้ว (ดูอนิเมชันการ์ดขยาย/นำเข้าข้อมูล)
  view: webHash() === '#import' ? 'setup' : SCREEN_HASHES.includes(webHash()) ? 'app' : 'login',
  screen: webHash() === '#sync' ? 'sync' : webHash() === '#oss' ? 'oss' : webHash() === '#settings' ? 'settings' : 'dashboard',
  ossTab: 'list',
  branch: 'OPD',
  room: BRANCHES[0].rooms[0],
  userName: 'พย.สมศรี ใจดี',
  configured: true,
  facility: FACILITIES[0],
  pick: FACILITIES[0].code,
  sso: webHash() === '#import' ? 'in' : 'out',
  ssoUser: webHash() === '#import' ? 'somsri.j@moph.go.th' : '',
  ssoTime: webHash() === '#import' ? '14:36' : '',
  ssoModalOpen: false,
  syncAfterAuth: false,
  setupTables: IMPORT_TABLES.map((t) => ({ ...t, pct: 0 })),
  setupLog: [],
  setupRunning: false,
  setupDone: false,
  records: seedRecords(),
  curIdx: null,
  seq: 5,
  regOpen: false,
  reader: 'idle',
  card: null,
  syncing: false,
  syncPct: 0,
  syncLog: [],
  lastSync: '09:12',
  editingIdx: null,
  opdIdx: null,
  historyOpen: false,
  notices: seedNotices(),
});

export interface AppActions {
  login: (branch: string, room: string) => void;
  logout: () => void;
  openSetup: () => void;
  finishSetup: () => void;
  backToLogin: () => void;
  go: (screen: ScreenId) => void;
  setOssTab: (tab: OssTabId) => void;
  selectPatient: (idx: number) => void;
  openEncounter: (idx: number) => void;
  saveEncounter: () => void;
  pickFacility: (code: string) => void;
  ssoOpen: () => void;
  ssoClose: () => void;
  ssoLogin: () => void;
  ssoLogout: () => void;
  startSetupImport: () => void;
  openReg: () => void;
  closeReg: () => void;
  connectReader: () => void;
  readCard: () => void;
  rereadCard: () => void;
  confirmReg: (payload: RegisterPayload) => void;
  startSync: () => void;
  openEdit: (idx: number) => void;
  closeEdit: () => void;
  resubmit: (idx: number, newValue: string) => void;
  openOpd: (idx: number) => void;
  closeOpd: () => void;
  setHistoryOpen: (open: boolean) => void;
  markNoticeRead: (id: string) => void;
  markAllNoticesRead: () => void;
  clearNotices: () => void;
}

export interface AppDerived {
  pendingCount: number;
  passCount: number;
  failCount: number;
  waitCount: number;
  examCount: number;
  doneCount: number;
  labCount: number;
  current: VisitRecord | null;
  branchLabel: string;
  unreadNotices: number;
}

interface AppContextValue {
  state: AppState;
  actions: AppActions;
  derived: AppDerived;
}

const AppContext = createContext<AppContextValue | null>(null);

const line = (text: string, tone: LogLine['tone'] = 'cmd'): LogLine => ({ text, tone });

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const timers = useRef<{ setup?: ReturnType<typeof setInterval>; sync?: ReturnType<typeof setInterval> }>({});
  const timeouts = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const syncIdx = useRef(0);
  const setupIdx = useRef(0);
  const stateRef = useRef<AppState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(
    () => () => {
      if (timers.current.setup) clearInterval(timers.current.setup);
      if (timers.current.sync) clearInterval(timers.current.sync);
      timeouts.current.forEach(clearTimeout);
    },
    []
  );

  const later = useCallback((ms: number, fn: () => void) => {
    timeouts.current.push(setTimeout(fn, ms));
  }, []);

  /* ---------------- SSO ---------------- */

  const runSync = useCallback(() => {
    syncIdx.current = 0;
    setState((s) => {
      if (s.syncing || s.records.length === 0) return s;
      return {
        ...s,
        syncing: true,
        syncPct: 0,
        syncLog: [
          line(`$ nhip-sync push --facility ${s.facility.code} --encrypt=aes256`),
          line(`↳ ผู้ทำรายการตรวจสอบ: ${s.ssoUser || 'somsri.j@moph.go.th'}`, 'info'),
          line('↳ กำลังเข้ารหัสข้อมูลส่วนบุคคล TLS 1.3 …', 'info'),
        ],
      };
    });
    timers.current.sync = setInterval(() => {
      setState((s) => {
        const i = syncIdx.current;
        const records = s.records.map((r) => ({ ...r }));
        const log = [...s.syncLog];
        if (i >= records.length) {
          if (timers.current.sync) clearInterval(timers.current.sync);
          const pass = records.filter((r) => r.sync === 'pass').length;
          const fail = records.length - pass;
          log.push(line(`สรุป: อัปโหลดผ่าน ${pass} รายการ · ไม่ผ่าน ${fail} รายการ`, fail ? 'err' : 'ok'));
          log.push(line('ลบข้อมูลผู้ป่วยที่อัปโหลดผ่านออกจากคิวเครื่องแล้ว', 'info'));
          const notices = pushNotice(
            s.notices,
            fail
              ? {
                  tone: 'destructive',
                  title: `ซิงค์ไม่ผ่าน ${fail} รายการ`,
                  detail: `ผ่าน ${pass} รายการ — เปิดหน้า Sync เพื่อแก้ไขแล้วอัปโหลดซ้ำ`,
                  screen: 'sync',
                }
              : {
                  tone: 'success',
                  title: `ซิงค์สำเร็จ ${pass} รายการ`,
                  detail: 'ข้อมูลขึ้น Cloud เรียบร้อย ลบออกจากคิวเครื่องแล้ว',
                  screen: 'sync',
                },
          );
          return { ...s, syncing: false, syncPct: 100, syncLog: log, lastSync: nowHM(), notices };
        }
        const r = records[i];
        log.push(line(`$ POST /api/v2/visit  HN ${r.hn}  (${r.service})`));
        if (r.sync !== 'pass' && i % 3 === 2) {
          const f = SYNC_FAILS[i % SYNC_FAILS.length];
          r.sync = 'fail';
          r.error = f.error;
          r.errorField = f.field;
          r.errorValue = f.field === 'เลขบัตรประชาชน' ? r.cid : f.field === 'รหัส ICD-10' ? (r.icd[0]?.[0] ?? '—') : 'UCS-0000';
          log.push(line(`↳ [Error 422] ข้อมูลไม่สมบูรณ์: ${f.error}`, 'err'));
          log.push(line('↳ ระบบบันทึกข้อผิดพลาดใน Log เครื่อง เตรียมทำการแก้ไขซ้ำ', 'err'));
        } else {
          r.sync = 'pass';
          r.error = '';
          log.push(line('↳ [Success] 201 Created · อัปโหลดขึ้น Cloud เรียบร้อย', 'ok'));
        }
        syncIdx.current = i + 1;
        return { ...s, records, syncLog: log, syncPct: Math.round(((i + 1) / records.length) * 100) };
      });
    }, 320);
  }, []);

  const ssoLogin = useCallback(() => {
    setState((s) => {
      if (s.sso === 'busy') return s;
      const inSetup = s.view === 'setup';
      return {
        ...s,
        sso: 'busy',
        setupLog: inSetup
          ? [line('$ POST https://sso-uat.moph.go.th/admin/login'), line('↳ กำลังยืนยันตัวตน …', 'info')]
          : s.setupLog,
      };
    });
    later(1400, () => {
      let shouldSync = false;
      setState((s) => {
        const inSetup = s.view === 'setup';
        shouldSync = s.syncAfterAuth;
        const authedLog: LogLine[] = [
          line('$ POST https://sso-uat.moph.go.th/admin/login'),
          line('↳ 200 ยืนยันตัวตนสำเร็จ · somsri.j@moph.go.th', 'ok'),
          line('↳ ได้รับ access token (หมดอายุ 30 นาที)', 'ok'),
          line('$ GET /sso/authorized-organizations'),
          line(`↳ 200 พบหน่วยงานที่เข้าถึงได้ ${FACILITIES.length} แห่ง`, 'ok'),
        ];
        return {
          ...s,
          sso: 'in',
          ssoUser: 'somsri.j@moph.go.th',
          ssoTime: nowHM(),
          ssoModalOpen: false,
          syncAfterAuth: false,
          setupLog: inSetup ? authedLog : s.setupLog,
          syncLog: inSetup ? s.syncLog : [...s.syncLog, ...authedLog.slice(0, 3)],
        };
      });
      if (shouldSync) later(350, runSync);
    });
  }, [later, runSync]);

  /* ---------------- Setup import ---------------- */

  const startSetupImport = useCallback(() => {
    setupIdx.current = 0;
    setState((s) => {
      if (s.setupRunning || s.sso !== 'in') return s;
      const f = FACILITIES.find((x) => x.code === s.pick) ?? FACILITIES[0];
      return {
        ...s,
        setupRunning: true,
        setupDone: false,
        facility: f,
        setupTables: s.setupTables.map((t) => ({ ...t, pct: 0 })),
        setupLog: [
          ...s.setupLog,
          line(`$ nhip-sync pull --facility ${f.code}`),
          line(`↳ หน่วยงานที่เลือก: ${f.name}`, 'info'),
          line('↳ เชื่อมต่อ cloud endpoint … ok (142 ms)', 'ok'),
        ],
      };
    });
    timers.current.setup = setInterval(() => {
      setState((s) => {
        if (!s.setupRunning) return s;
        const tables: ImportTable[] = s.setupTables.map((t) => ({ ...t }));
        const log = [...s.setupLog];
        const i = setupIdx.current;
        const t = tables[i];
        if (!t) {
          if (timers.current.setup) clearInterval(timers.current.setup);
          const rows = tables.reduce((sum, x) => sum + x.rows, 0);
          log.push(line(`เสร็จสิ้น: นำเข้า ${tables.length} ตาราง · ${rows.toLocaleString('en-US')} แถว`, 'ok'));
          log.push(line('ฐานข้อมูลพื้นฐานพร้อมใช้งานในโหมดออฟไลน์ (ไม่มีข้อมูลผู้ป่วย)', 'info'));
          return {
            ...s,
            setupRunning: false,
            setupDone: true,
            configured: true,
            setupLog: log,
            notices: pushNotice(s.notices, {
              tone: 'success',
              title: 'นำเข้าข้อมูลพื้นฐานเสร็จสิ้น',
              detail: `${tables.length} ตาราง · ${rows.toLocaleString('en-US')} แถว พร้อมใช้งานออฟไลน์`,
            }),
          };
        }
        if (t.pct === 0) log.push(line(`$ GET /master/${t.file}  (${t.size})`));
        // ก้าวละ 10–24% ทุก 140 ms — ถี่พอให้แถบใน ProgressBar วิ่งต่อเนื่อง ไม่กระตุกเป็นขั้น
        t.pct = Math.min(100, t.pct + 10 + Math.random() * 14);
        if (t.pct >= 100) {
          t.pct = 100;
          log.push(line('↳ ดาวน์โหลดสำเร็จ · SHA256 ok', 'ok'));
          log.push(line(`↳ IMPORT ${t.file.replace('.json', '')} → ${t.rows.toLocaleString('en-US')} แถว (100%)`, 'ok'));
          setupIdx.current = i + 1;
        }
        return { ...s, setupTables: tables, setupLog: log };
      });
    }, 140);
  }, []);

  /* ---------------- Card reader ---------------- */

  const openReg = useCallback(() => {
    setState((s) => ({ ...s, regOpen: true, reader: 'idle', card: null }));
    // จำลองการเชื่อมต่อเครื่องอ่านบัตร: ไม่พร้อม → พร้อมอ่าน (Figma step 1 → 2)
    later(1100, () => {
      setState((s) => (s.regOpen && s.reader === 'idle' ? { ...s, reader: 'ready' } : s));
    });
  }, [later]);

  const readCard = useCallback(() => {
    setState((s) => {
      if (s.reader === 'reading') return s;
      return { ...s, reader: 'reading', card: null };
    });
    later(1200, () => {
      setState((s) => {
        if (!s.regOpen) return s;
        return { ...s, reader: 'read', card: CARDS[s.seq % CARDS.length] };
      });
    });
  }, [later]);

  const confirmReg = useCallback((payload: RegisterPayload) => {
    setState((s) => {
      if (!s.card) return s;
      const idx = s.records.length;
      const rec = makeRecord(s.card, idx, {
        right: payload.right,
        service: payload.service,
        allergy: payload.allergy,
      });
      return {
        ...s,
        records: [...s.records, rec],
        curIdx: idx,
        seq: s.seq + 1,
        regOpen: false,
        reader: 'idle',
        card: null,
        notices: pushNotice(s.notices, {
          tone: 'info',
          title: 'ลงทะเบียนผู้ป่วยใหม่',
          detail: `${rec.name} · คิว ${rec.queueNo} · ${rec.service}`,
          screen: 'dashboard',
        }),
      };
    });
  }, []);

  /* ---------------- misc actions ---------------- */

  const actions = useMemo<AppActions>(
    () => ({
      login: (branch, room) =>
        setState((s) => ({ ...s, view: 'app', screen: 'dashboard', branch, room })),
      logout: () => setState(() => initialState()),
      openSetup: () => setState((s) => ({ ...s, view: 'setup' })),
      finishSetup: () => setState((s) => ({ ...s, view: 'login' })),
      backToLogin: () => setState((s) => ({ ...s, view: 'login' })),
      go: (screen) => setState((s) => ({ ...s, screen, historyOpen: false })),
      setOssTab: (ossTab) => setState((s) => ({ ...s, ossTab })),
      selectPatient: (idx) => setState((s) => ({ ...s, curIdx: idx })),
      openEncounter: (idx) => setState((s) => ({ ...s, curIdx: idx, screen: 'oss', ossTab: 'enc' })),
      saveEncounter: () =>
        setState((s) => {
          if (s.curIdx === null) return s;
          const records = s.records.map((r, i) => (i === s.curIdx ? { ...r, stage: 'done' as QueueStage } : r));
          return { ...s, records, ossTab: 'list' };
        }),
      // เปลี่ยนหน่วยงาน → ลิสต์นำเข้าฝั่งขวาเปลี่ยนเป็นชุดข้อมูลของหน่วยงานนั้น + รีเซ็ตความคืบหน้า
      pickFacility: (code) =>
        setState((s) => {
          if (s.setupRunning || s.pick === code) return s;
          const f = FACILITIES.find((x) => x.code === code);
          return {
            ...s,
            pick: code,
            setupDone: false,
            setupTables: tablesForFacility(code).map((t) => ({ ...t, pct: 0 })),
            setupLog:
              s.sso === 'in'
                ? [...s.setupLog, line(`↳ เปลี่ยนหน่วยงานเป็น ${code} · ${f?.name ?? ''}`, 'info')]
                : s.setupLog,
          };
        }),
      ssoOpen: () => setState((s) => ({ ...s, ssoModalOpen: true })),
      ssoClose: () => setState((s) => ({ ...s, ssoModalOpen: false, syncAfterAuth: false })),
      ssoLogin,
      ssoLogout: () => setState((s) => ({ ...s, sso: 'out', ssoUser: '', ssoTime: '' })),
      startSetupImport,
      openReg,
      closeReg: () => setState((s) => ({ ...s, regOpen: false, reader: 'idle', card: null })),
      connectReader: () => setState((s) => ({ ...s, reader: 'ready' })),
      readCard,
      rereadCard: readCard,
      confirmReg,
      startSync: () => {
        const s = stateRef.current;
        if (s.syncing || s.records.length === 0) return;
        if (s.sso !== 'in') {
          setState((p) => ({ ...p, ssoModalOpen: true, syncAfterAuth: true }));
          return;
        }
        runSync();
      },
      openEdit: (idx) => setState((s) => ({ ...s, editingIdx: idx, opdIdx: null })),
      closeEdit: () => setState((s) => ({ ...s, editingIdx: null })),
      resubmit: (idx, newValue) =>
        setState((s) => {
          const records = s.records.map((r, i) =>
            i === idx ? { ...r, sync: 'pass' as const, error: '', errorField: '', errorValue: newValue } : r
          );
          const r = s.records[idx];
          return {
            ...s,
            records,
            editingIdx: null,
            lastSync: nowHM(),
            notices: pushNotice(s.notices, {
              tone: 'success',
              title: 'แก้ไขและอัปโหลดซ้ำสำเร็จ',
              detail: `HN ${r?.hn ?? ''} · ${r?.errorField ?? ''}`,
              screen: 'sync',
            }),
            syncLog: [
              ...s.syncLog,
              line(`$ PUT /api/v2/visit  HN ${r?.hn ?? ''}  (แก้ไข ${r?.errorField ?? ''})`),
              line('↳ [Success] 200 OK · อัปโหลดขึ้น Cloud เรียบร้อย', 'ok'),
            ],
          };
        }),
      openOpd: (idx) => setState((s) => ({ ...s, opdIdx: idx })),
      closeOpd: () => setState((s) => ({ ...s, opdIdx: null })),
      setHistoryOpen: (historyOpen) => setState((s) => ({ ...s, historyOpen })),
      markNoticeRead: (id) =>
        setState((s) => ({ ...s, notices: s.notices.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNoticesRead: () => setState((s) => ({ ...s, notices: s.notices.map((n) => ({ ...n, read: true })) })),
      clearNotices: () => setState((s) => ({ ...s, notices: [] })),
    }),
    [ssoLogin, startSetupImport, openReg, readCard, confirmReg, runSync, later]
  );

  const derived = useMemo<AppDerived>(() => {
    const rs = state.records;
    const branch = BRANCHES.find((b) => b.code === state.branch) ?? BRANCHES[0];
    return {
      pendingCount: rs.filter((r) => r.sync !== 'pass').length,
      passCount: rs.filter((r) => r.sync === 'pass').length,
      failCount: rs.filter((r) => r.sync === 'fail').length,
      waitCount: rs.filter((r) => r.stage === 'wait' || r.stage === 'pending').length,
      examCount: rs.filter((r) => r.stage === 'screen').length,
      doneCount: rs.filter((r) => r.stage === 'done').length,
      labCount: rs.filter((r) => r.stage === 'lab').length,
      current: state.curIdx !== null ? (rs[state.curIdx] ?? null) : null,
      branchLabel: `${branch.code} · ${state.room.split(' ')[0]}`,
      unreadNotices: state.notices.filter((n) => !n.read).length,
    };
  }, [state.records, state.curIdx, state.branch, state.room, state.notices]);

  const value = useMemo<AppContextValue>(() => ({ state, actions, derived }), [state, actions, derived]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp ต้องอยู่ภายใน <AppProvider>');
  return ctx;
};
