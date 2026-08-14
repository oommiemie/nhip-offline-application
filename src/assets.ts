import logoMoph from '../assets/figma/logo-moph.png';
import setupIllustration from '../assets/figma/setup-illustration.png';
import kpiWait from '../assets/figma/kpi-wait.png';
import kpiExam from '../assets/figma/kpi-exam.png';
import kpiDone from '../assets/figma/kpi-done.png';
import kpiLab from '../assets/figma/kpi-lab.png';
import kpiAvg from '../assets/figma/kpi-avg.png';
import cloudQueue from '../assets/figma/cloud-queue.png';
import cloudPass from '../assets/figma/cloud-pass.png';
import cloudFail from '../assets/figma/cloud-fail.png';
import cloudLast from '../assets/figma/cloud-last.png';
import idCard from '../assets/figma/id-card.png';

/**
 * รูปจริงที่ export จากไฟล์ Figma "NHIP Offline Application" (scale 2x)
 * โฟลเดอร์ assets/figma/ — export ใหม่ได้ด้วย images API (node id ระบุใน DESIGN_SYSTEM.md)
 */
export const FigmaAssets = {
  /** ตรากระทรวงสาธารณสุข (node 16:58) — หน้า Login/SSO */
  logoMoph,
  /** ภาพ 3D เซิร์ฟเวอร์นำเข้าข้อมูล (node 16:648) — หน้า Setup */
  setupIllustration,
  /** ไอคอน 3D การ์ด KPI หน้า Dashboard (nodes 28:106xx) */
  kpiWait,
  kpiExam,
  kpiDone,
  kpiLab,
  kpiAvg,
  /** ไอคอน 3D เมฆ หน้า Sync (nodes 32/33:1xxxx) */
  cloudQueue,
  cloudPass,
  cloudFail,
  cloudLast,
  /** ภาพบัตรประชาชน (node I31:12223;31:12142) — modal ลงทะเบียน */
  idCard,
};
