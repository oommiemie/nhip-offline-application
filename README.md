# NHIP Offline Application (React Native · Expo)

แอปต้นแบบระบบสารสนเทศสำหรับ รพ.สต. ทำงานแบบ offline-first — พอร์ตจากดีไซน์ Figma
"NHIP Offline Application" (ธีมเขียว MOPH) + โครงหน้าจอจาก desktop comp เดิม

**เปิดดูตัวจริง → https://oommiemie.github.io/nhip-offline-application/**

## เริ่มใช้งาน

```bash
npm install
npx expo start        # i = iOS simulator · a = Android emulator · สแกน QR ด้วย Expo Go
```

เว็บ dev shortcut: `/#app` `/#oss` `/#sync` `/#settings` ข้ามหน้า login · `/#import` เปิดหน้า setup แบบยืนยัน SSO แล้ว (ดูอนิเมชันการ์ดขยาย) ·
`/#cross` `/#heart` `/#dna` `/#neuron` `/#stetho` เปิดหน้า login พร้อมปักหมุดรูปทรง particle นั้น (ไว้ QA เอฟเฟกต์)

Type-check: `npx tsc --noEmit`

## มีอะไรในเวอร์ชันนี้

- **Login** (split-screen gradient เขียว) → **ตั้งค่าครั้งแรก**: MOPH SSO → เลือกหน่วยงาน → ดาวน์โหลด/นำเข้าข้อมูลพื้นฐาน 8 ตาราง (จำลอง + terminal log)
- **Dashboard**: การ์ดทักทาย, KPI 5 ใบ, คิวผู้ป่วยวันนี้, สถานะห้องปฏิบัติงาน, สรุปงานกะ
- **One Stop Service**: แท็บ 11 เมนู, รายการรับบริการ + ตัวกรอง, หน้าซักประวัติ/ตรวจรักษา (สัญญาณชีพ+BMI อัตโนมัติ, แถบเตือนแพ้ยา, ICD-10)
- **ลงทะเบียน · อ่านบัตรประชาชน** modal 3 step (ไม่พร้อม → พร้อมอ่าน → อ่านสำเร็จ+ฟอร์ม)
- **Sync ขึ้น Cloud**: KPI, ตารางขั้นตอนการตรวจ 10 ช่อง/ราย, log สี success/error, รายการไม่ผ่าน → แก้ไข → อัปโหลดซ้ำ, OPD Card
- **ตั้งค่า**: ธีม 10 palette + dark mode + ธีมเทศกาล 4 แบบ, ฟอนต์ 6 แบบ (Google Sans เป็นค่าเริ่มต้น — รองรับไทยในตัว), ขนาดตัวอักษร, ความหนาแน่นตาราง, รูปแบบ panel (drawer/modal), ลดการเคลื่อนไหว

ข้อมูลทั้งหมดเป็น mock ใน `src/state/mockData.ts` — flow เครื่องอ่านบัตร/SSO/ซิงค์เป็น simulation ที่วางโครงให้ต่อ API จริงได้ทันที

## เอกสารสำหรับทีมพัฒนา

อ่าน **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** ก่อนเริ่มแก้โค้ด — รวม design tokens (สี/ฟอนต์/ระยะ),
คอมโพเนนต์ทั้งหมดพร้อม props, แพตเทิร์นหน้าจอ, mapping Figma → ไฟล์, จุดต่อระบบจริง และ checklist

ภาพอ้างอิงดีไซน์ทั้ง 8 หน้าจอจาก Figma อยู่ที่ `docs/figma/`

## Deploy

เว็บ deploy อัตโนมัติขึ้น GitHub Pages ทุกครั้งที่ push เข้า `main` ผ่าน
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — ขั้นตอนคือ `npm ci` → `tsc --noEmit` → `expo export -p web` → อัปโหลด `dist/`

> `app.json` ตั้ง `experiments.baseUrl` เป็น `/nhip-offline-application` เพราะ Pages เสิร์ฟใต้ path ชื่อ repo
> ถ้าเปลี่ยนชื่อ repo หรือย้ายไป custom domain ต้องแก้ค่านี้ด้วย ไม่งั้น asset จะ 404

Build เองในเครื่อง:

```bash
npx expo export -p web    # ได้ dist/
npx serve dist            # ลองเปิดดูก่อน deploy
```
