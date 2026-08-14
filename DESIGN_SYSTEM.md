# NHIP Offline Application — Design System & Developer Guideline

เอกสารส่งมอบสำหรับทีมพัฒนา ครอบคลุม design tokens, คอมโพเนนต์, แพตเทิร์นหน้าจอ และจุดที่ต้องต่อระบบจริง
อ้างอิงจากไฟล์ Figma **"NHIP Offline Application"** (`wtkuh6YbxR00NBu2n6vBR6`) และ desktop comp เดิม (`NHIP Desktop.dc.html`)

> TL;DR สำหรับเดฟ: ทุกสี/ขนาด/ฟอนต์ **ห้าม hard-code** — ดึงจาก `useTheme()` เท่านั้น,
> ทุกข้อความใช้ `<AppText>`, ปุ่มใช้ `<Button>`, ป้ายสถานะใช้ `<Badge tone=...>`
> แล้วหน้าจอใหม่จะได้ธีม 10 แบบ + dark mode + ปรับขนาดฟอนต์/ความหนาแน่นฟรีทันที

---

## 1. สแตกและภาพรวม

| หัวข้อ | รายละเอียด |
|---|---|
| Framework | React Native ผ่าน **Expo** (TypeScript, template `blank-typescript`) |
| การนำทาง | state-based ผ่าน `AppContext` (`view`: login → setup → app, `screen`: dashboard/oss/sync/settings) — ยังไม่ใช้ react-navigation เพื่อให้พอร์ตเข้า navigator ที่ทีมเลือกได้ง่าย |
| สถานะ/ข้อมูล | `src/state/AppContext.tsx` + mock data (`src/state/mockData.ts`) พร้อม simulation ครบ flow (อ่านบัตร 3 step / SSO / นำเข้าข้อมูล / ซิงค์) |
| ธีม | `src/theme/` — ThemeProvider + `useTheme()` รองรับ 10 palette × light/dark × 4 ธีมเทศกาล |
| ฟอนต์ | Google Fonts ผ่าน `@expo-google-fonts/*` (โหลดใน `App.tsx`) |
| รันโปรเจกต์ | `npm install` แล้ว `npx expo start` (กด `i` = iOS simulator, `a` = Android) |

### โครงสร้างโฟลเดอร์

```
nhip-app/
├── App.tsx                  # โหลดฟอนต์ + ThemeProvider + AppProvider + StatusBar
├── DESIGN_SYSTEM.md         # เอกสารนี้
└── src/
    ├── theme/               # ★ design tokens ทั้งหมด
    │   ├── types.ts         #   Theme/BaseColors/Tone/... (สัญญา type ของธีม)
    │   ├── palettes.ts      #   ค่าสีทุก palette + festival + ตัว resolve
    │   ├── fonts.ts         #   ตารางฟอนต์ + FONT_ASSETS สำหรับ useFonts
    │   └── ThemeContext.tsx #   ThemeProvider, useTheme(), useThemeContext()
    ├── components/          # ★ คอมโพเนนต์กลาง (ดูตาราง §5)
    ├── state/               # AppContext + types + mockData
    ├── screens/             # หน้าจอหลัก 7 หน้า
    ├── modals/              # Register(3 step) / EditRecord / OpdCard / History / Sso
    ├── navigation/          # AppShell (sidebar/topbar/bottom-tabs) + Root
    └── utils/format.ts      # nowHM, thaiToday, greeting, fmtInt
```

### Map หน้าจอ ↔ Figma ↔ ไฟล์

| หน้าจอ | Figma node | ไฟล์ |
|---|---|---|
| Login | `15:6` (nhip-login) | `screens/LoginScreen.tsx` |
| ยืนยันตัวตน MOPH SSO | `16:142` (nhip-MOPH SSO) | `screens/SetupScreen.tsx` (`SsoStep`) + `modals/SsoModal.tsx` |
| ตั้งค่าครั้งแรก / นำเข้าข้อมูล | `16:235` (nhip-setup) | `screens/SetupScreen.tsx` — หลังยืนยัน SSO การ์ดขยายจากตำแหน่งการ์ด SSO ออกเต็มผืน (เหลือขอบเขียว 8px ตาม Figma) · QA: `/#import` |
| Dashboard คิววันนี้ | `16:859` (nhip-dashboard) | `screens/DashboardScreen.tsx` |
| ลงทะเบียน · อ่านบัตร step 1–3 | `31:12070`, `31:12234`, `31:12267` | `modals/RegisterModal.tsx` |
| Sync ข้อมูลขึ้น Cloud | `32:12410` (nhip-Sync on Cloud) | `screens/SyncScreen.tsx` |
| One Stop Service (รายการ/ตรวจรักษา) | — (จาก desktop comp เดิม, จัดธีมตาม Figma) | `screens/OssScreen.tsx`, `PatientListScreen.tsx`, `EncounterScreen.tsx` |
| ตั้งค่ารูปลักษณ์ | — (จาก desktop comp เดิม) | `screens/SettingsScreen.tsx` |

---

## 2. Design Tokens — สี

### 2.1 ธีมหลัก "MOPH Green" (ค่าเริ่มต้น · ตรงกับ Figma)

Semantic tokens ทั้งหมดอยู่ใน `src/theme/palettes.ts` (`mophLight` / `mophDark`) — ใช้ผ่าน `useTheme().colors.*`

| Token | Light | ใช้กับ |
|---|---|---|
| `background` | `#F8FAFC` | พื้นหลังพื้นที่เนื้อหา |
| `foreground` | `#212529` | ตัวอักษรหลัก |
| `card` | `#FFFFFF` | การ์ด/พาเนล |
| `primary` | `#2D6A4F` | ปุ่มหลัก (pill), ลิงก์, ตัวเลขเน้น |
| `primaryStrong` | `#134E3A` | ปุ่ม submit ฟอร์ม, แบนเนอร์ทึบ, hero |
| `secondary` | `#1B4332` | หัวข้อเขียวเข้ม, ข้อความ nav active |
| `muted` / `mutedForeground` | `#F1F3F5` / `#6C757D` | พื้นจาง / ตัวอักษรรอง |
| `accent` | `#40916C` | ตัวเลือก active, ไฮไลต์รอง |
| `border` / `input` | `#E5E7EB` | เส้นขอบทั้งหมด |
| `inputBg` | `#F1F3F5` | พื้น input แบบ filled (ตาม Figma) |
| `ring` | `#52B788` | focus ring |
| `sidebar` / `sidebarActive` | `#DBF2E3` / `#C7E8D4` | แถบเมนูซ้าย (mint) / เมนู active |
| `surface2` / `surface3` | `#F8F9FA` / `#F1F3F5` | พื้นผิวรอง (แผงใน modal ฯลฯ) |
| `tableHeader` / `tableRowAlt` / `tableRowSelected` | `#F8F9FA` / `#FBFCFD` / `#E7F5EC` | ตาราง |
| `alertBand` | `#B91C1C` | แถบเตือนแพ้ยา (ตัวอักษรขาวเสมอ) |
| `terminalBg` | `#0B2D22` | กล่อง log, การ์ดสรุปกะ (เขียวเข้มสุด) |
| `destructive` / `success` / `warning` / `info` / `purple` | `#DC2626` / `#16A34A` / `#F59E0B` / `#2563EB` / `#7C3AED` | สีสถานะ |

สเกลเขียวอ้างอิงของแบรนด์ (ใช้เลือกสีใหม่ให้เข้าชุด): `#D8F3DC → #B7E4C7 → #95D5B2 → #74C69D → #52B788 → #40916C → #2D6A4F → #1B4332 → #0B2D22`

### 2.2 สีป้ายสถานะ (Badge tones — ตรงกับ pill ใน Figma)

ใช้ผ่าน `useTheme().tones[tone]` → `{ bg, fg, border }` หรือสะดวกสุดคือ `<Badge tone="...">`

| tone | bg / fg (light) | ใช้กับสถานะ |
|---|---|---|
| `warning` | `#FEF3C7` / `#92400E` | รอเรียกตรวจ, รอดำเนินการ, รอการซิงค์ |
| `info` | `#DBEAFE` / `#1E40AF` | กำลังคัดกรอง, กำลังอัพเดต, กำลังตรวจ |
| `success` | `#D1FAE5` / `#065F46` | เสร็จสิ้น, อัปเดตผ่าน |
| `destructive` | `#FEE2E2` / `#991B1B` | แพ้ยา (PENICILLIN), ไม่ผ่านเงื่อนไข |
| `purple` | `#EDE9FE` / `#6D28D9` | รอผล Lab |
| `neutral` | `#F3F4F6` / `#374151` | ว่าง, สถานะกลาง |
| `primary` | `#D8F3DC` / `#1B4332` | ชิป/แท็บ active, ป้ายหน่วยงาน |

**กติกา:** ห้ามผูกสีกับข้อความเอง — ให้ map "สถานะ → tone" ที่เดียว (ดู `STAGE_META` ใน `state/mockData.ts` เป็นแบบ)

### 2.3 สีตัวเลข KPI

`useTheme().kpi` — ตัวเลขใหญ่บนการ์ดสรุป: `wait #FF9500` (ส้ม), `progress #2563EB`, `done #16A34A`, `lab #7C3AED`, `fail #EF4444`, `neutral #212529`

### 2.4 ธีมทางเลือก + ธีมเทศกาล

- อีก 9 palette (Ocean Calm, Mint Clinic, Deep Sea, Sky Paper, Aqua Warm, Coral Sunrise, Violet Care, Forest Ward, Berry Plum) พอร์ตจาก desktop comp — เก็บเป็น HSL ใน `HSL_THEMES`
- ธีมเทศกาล (christmas / newyear / valentine / songkran) override เฉพาะ `primary, secondary, accent, surface2, tableRowSelected` ทับ palette ปัจจุบัน
- ลำดับ resolve: `palette base → mode override → festival override` (ฟังก์ชัน `resolveColors`)

**วิธีเพิ่ม palette ใหม่:** เพิ่ม id ใน `PaletteId` (types.ts) → เพิ่มชุดสีใน `HSL_THEMES` (หรือ hex เต็มแบบ moph) → เพิ่มการ์ดใน `PALETTE_LIST` → เสร็จ (หน้า Settings แสดงให้อัตโนมัติ)

---

## 3. Design Tokens — Typography / ระยะ / ทรง

### 3.1 ฟอนต์

| บทบาท | ฟอนต์ | หมายเหตุ |
|---|---|---|
| UI (ไทย/อังกฤษ) | **Google Sans** (ค่าเริ่มต้น — มี subset ภาษาไทยในตัว) สลับได้: Noto Sans Thai, Sarabun, IBM Plex Sans Thai, Prompt, Kanit | Google Sans เปิดให้ใช้ผ่าน Google Fonts แล้ว (`@expo-google-fonts/google-sans`) ครอบคลุมไทย+ละตินในไฟล์เดียว |
| ตัวเลข/รหัส | **JetBrains Mono** | HN, CID, ICD-10, เวลา, log — เปิดด้วย prop `mono` ของ `AppText` (มี `tabular-nums` ให้แล้ว) |

**สำคัญ (RN):** เลือกน้ำหนักด้วย "ชื่อไฟล์ฟอนต์" ไม่ใช่ `fontWeight` — `AppText`/`t.font('600')` จัดการให้แล้ว
**ห้าม** ตั้ง `fontWeight` ใน style คู่กับ fontFamily เด็ดขาด (Android จะ fallback ฟอนต์ระบบ)

### 3.2 สเกลขนาดตัวอักษร

ผู้ใช้เลือกขนาดฐานได้ (12/13/14/16/18) — ใช้ผ่าน `t.fs.*` (ฐาน 14 → ตรงกับ Figma):

| token | ฐาน 14 | ใช้กับ |
|---|---|---|
| `xs` | 12 | caption, ป้ายเล็ก, log |
| `sm` | 13 | เนื้อหาตาราง, label ฟิลด์ |
| `base` | 14 | เนื้อความทั่วไป |
| `md` | 15 | ค่าใน input, ปุ่ม |
| `lg` | 16 | หัวข้อ section, ชื่อคนไข้ |
| `xl` | 20 | หัวข้อหน้า |
| `xxl` | 24 | หัวข้อ hero/banner |
| `kpi` / `hero` | 32 | ตัวเลข KPI, หัวข้อ Login |

### 3.3 มุมโค้ง (radius) — `t.radius`

`sm 8` (ป้ายเล็ก) · `md 12` (input, nav item, ปุ่มฟอร์มยืนยันตัวตน) · `lg 16` (การ์ด KPI/ย่อย) · `xl 24` (การ์ดหลัก, modal, hero) · `pill 999` (**ปุ่มทุกปุ่ม**, badge, chip)

> **กติกาปุ่ม:** `Button` ทุกตัวเป็นทรง **pill** (ค่าเริ่มต้น `rounded="pill"` — ไม่ต้องส่ง prop)
> ข้อยกเว้นเดียว: **ปุ่มยืนยันตัวตน** ใช้ `rounded="md"` ให้เข้ากับ input ในฟอร์มเดียวกัน ตาม Figma 15:6 —
> ได้แก่ `LoginScreen` (เข้าสู่ระบบบริการ), `SetupScreen` การ์ด SSO (เข้าสู่ระบบ MOPH SSO) และ `SsoModal`

### 3.4 ความหนาแน่น (density) — `t.density`

| ระดับ | rowH (แถวตาราง) | controlH (ปุ่ม) | inputH |
|---|---|---|---|
| compact | 48 | 40 | 44 |
| normal (ค่าเริ่มต้น) | 60 | 44 | 48 |
| comfortable | 72 | 48 | 52 |

ทุกค่า ≥ 44px เพื่อ touch target มาตรฐาน (เดสก์ท็อป comp เดิมใช้ 28–42px — จงใจขยายสำหรับแท็บเล็ต)

### 3.5 เงา — `t.shadow.sm/md/lg` (มี elevation สำหรับ Android แล้ว) · เงาสีเขียวเข้ม `#0F3D2E` โทนเดียวกับแบรนด์

---

## 4. วิธีใช้ธีมในโค้ด

```tsx
import { useTheme } from '../theme';
import { AppText, Button, Badge } from '../components';

const MyCard = () => {
  const t = useTheme();               // ← Theme ที่ resolve แล้ว
  return (
    <View style={{ backgroundColor: t.colors.card, borderRadius: t.radius.xl, ...t.shadow.sm }}>
      <AppText size="lg" weight="700">หัวข้อ</AppText>
      <AppText size="sm" muted>คำอธิบาย</AppText>
      <AppText mono weight="600">HN 6800124</AppText>
      <Badge label="รอเรียกตรวจ" tone="warning" />
      <Button label="บันทึก" onPress={save} />                              {/* pill เขียว #2D6A4F — ค่าเริ่มต้น */}
      <Button label="เข้าสู่ระบบ" variant="strong" rounded="md" full />       {/* เหลี่ยม — เฉพาะฟอร์มยืนยันตัวตน */}
    </View>
  );
};
```

การตั้งค่า (เปลี่ยน palette/mode/font/density) อยู่ที่ `useThemeContext()` — หน้า `SettingsScreen` เป็นตัวอย่างการใช้ครบทุก setter

---

## 5. Components Catalog (`src/components/`)

| Component | หน้าที่ / ใช้เมื่อ | props หลัก |
|---|---|---|
| `AppText` | ตัวอักษรทุกตัวในแอป (แทน `Text` เสมอ) | `size` (token/เลข), `weight` '400'–'700', `mono`, `muted`, `color`, `center` |
| `Button` | ปุ่มทุกแบบ — **ทรง pill เสมอ** ยกเว้นหน้าเข้าสู่ระบบ | `variant`: `primary`(เขียว #2D6A4F) `strong`(ทึบ #134E3A) `outline` `ghost` `subtle` `destructive` · `size` sm/md/lg · `rounded` pill(default)/lg/md · `icon`, `loading`, `disabled`, `full` |
| `TextField` | input filled ตาม Figma | `label`, `required`(จุดแดง), `icon`, `mono`, `readonly`(ข้อมูลจากบัตร), `alignRight`(ตัวเลข), `error`, `errorText`(ขอบแดง + ข้อความใต้ช่อง), `hint`, `multiline` · ใส่ `secureTextEntry` แล้วได้ปุ่มรูปตาเปิด/ปิดรหัสผ่านอัตโนมัติ |
| `SelectField` | dropdown กางใต้ช่องแบบ anchored (กางขึ้นบนอัตโนมัติเมื่อพื้นที่ล่างไม่พอ, ลูกศรหมุนตอนเปิด) | `label`, `value`, `options` (string หรือ `{value,label}`), `onChange`, `required` |
| `Badge` | ป้ายสถานะ pill | `label`, `tone` (§2.2), `dot`, `size` |
| `StatusDot` | จุดสถานะกลม 7px | `color`, `size` |
| `Card` / `SectionCard` | การ์ดพื้นฐาน / การ์ดมีแถวหัวข้อ+เส้นคั่น | `rounded` md/lg/xl, `padded`, `shadow` · SectionCard: `title`, `caption`, `right`(ปุ่มขวา), `bodyPadding` (=0 เมื่อวางตาราง) |
| `KpiCard` | การ์ดตัวเลขสรุป (แถวบน dashboard/sync) | `label`, `value`, `unit`, `caption`, `accent`(จาก `t.kpi`), `image`(ภาพ 3D จาก `FigmaAssets`), `icon`(fallback) |
| `Chip` | แท็บรอง/ตัวกรอง pill | `label`, `active`, `count`, `onPress` |
| `Pagination` | แถบแบ่งหน้าใต้ตาราง (Figma 16:859) | `page`, `totalPages`, `onPageChange` · `pageSize`, `pageSizeOptions`, `onPageSizeChange` (ไม่ส่ง = ไม่แสดง "แสดง N รายการ") |

| `WireMesh` | ตาข่ายเส้น 3 มิติแบบภูมิประเทศที่คลื่นวิ่งตลอด — พื้นหลังแบนเนอร์ Dashboard (แทนภาพ mesh นิ่ง Figma node 28:9617) | `width`, `height` (ต้องวัดจาก `onLayout`), `color`, `opacity`, `cycleMs`, `reduceMotion` |

> **ข้อควรระวังของ `Image` บนเว็บ (RN Web):** ถ้าจะวางภาพเป็นพื้นหลังเต็มกล่อง ต้องใส่ `width:'100%'` + `height:'100%'` และ `zIndex: 0` เสมอ
> — ใช้แค่ `left/right/top/bottom: 0` RN Web จะตั้งขนาดตามพิกเซลจริงของไฟล์ และมันใส่ `z-index:-1` ให้เอง ทำให้ภาพตกไปอยู่หลังพื้นสีของกล่องแม่
| `StepperChips` | แถบขั้นตอน setup (SSO ▸ หน่วยงาน ▸ นำเข้า) | `steps: {label, state: done/active/pending}[]` |
| `SegmentedPills` | สวิตช์สองทาง (สว่าง/มืด, drawer/modal) | `options`, `value`, `onChange` (generic) |
| `Checkbox` / `CheckSquare` | ติ๊กแบบกดได้ / แบบแสดงผล (ขั้นตอน 10 ช่องหน้า Sync) | `checked`, `onChange`, `label` / `size` |
| `ProgressBar` | แถบเปอร์เซ็นต์ (นำเข้าข้อมูล/ซิงค์) | `value` 0–100, `height`, `color` |
| `LogConsole` | terminal log พื้นเขียวเข้ม เลื่อนท้ายอัตโนมัติ | `lines: {text, tone: cmd/ok/err/info}[]`, `height`, `emptyText` |
| `DataTable<T>` | ตารางมาตรฐาน (หัวเทา, แถวสลับสี, แถวเลือกมีแถบเขียวซ้าย) | `columns` (`width` หรือ `flex`, `align`, `render`), `data`, `keyExtractor`, `onRowPress`, `selectedIndex`, `minWidth`(เลื่อนแนวนอนเมื่อจอแคบ), `empty` |
| `AppModal` | modal กลางจอ การ์ดขาวมุม 24 + หัวเรื่อง + footer | `visible`, `onClose`, `title`, `titleBadge`, `maxWidth`, `footer`, `dismissable` |
| `SidePanel` | พาเนลงานรอง สลับ drawer ขวา ↔ modal ตามการตั้งค่าผู้ใช้ | `visible`, `onClose`, `title`, `caption`, `footer`, `mode`(บังคับได้), `width` |
| `EmptyState` | สถานะว่างของตาราง/หน้าจอ + ปุ่มชวนทำสิ่งแรก | `icon`, `title`, `subtitle`, `actionLabel`, `onAction` |
| `OptionTile` | กล่องตัวเลือกแบบการ์ด (ธีม/ฟอนต์/หน่วยงาน) | `active`, `onPress`, `check` |
| `AlertBand` | แถบเตือนเต็มความกว้าง (แพ้ยา) | `variant`: `danger`(แดงทึบ) `caution`(เหลือง) `info` · `title`, `detail` |
| `Avatar` / `IconBtn` / `KeyValue` | วงกลมอักษรย่อ / ปุ่มไอคอนกลม / คู่ label-value | — |
| `Tooltip` | ป้าย hover สำหรับปุ่มไอคอนล้วน (เว็บ/เมาส์ · แสดงหลังชี้ 250ms) — ตั้ง `accessibilityLabel` ที่ปุ่มควบคู่เสมอสำหรับจอสัมผัส/screen reader | `label`, `position` top/bottom |
| `MedicalParticles` | สนามอนุภาค 3D หน้า Login/SSO — จุด ~800 เม็ด (x,y,z) + ผงดาวพื้นหลัง 60 เม็ด เรียงเป็น กากบาท/หัวใจ/เกลียว DNA/เซลล์ประสาท/หูฟังแพทย์ หมุนควบ 2 แกน (yaw ±37° + pitch ±13°), ขนาด 4 ระดับ + สี 5 ชั้นตามความลึก, glow+twinkle, เปลี่ยนรูปแบบ "กระจายตัว → บินกลับมารวมเป็นทรงใหม่" ต่อเม็ด, ลาก/hover เอียงมุมกล้อง | `width/height`, `shape`, `onTap`, `reduceMotion` · เพิ่มรูปใหม่ = เขียน generator คืน `{x,y,z}[]` ใน `GENERATORS` + เพิ่มรายการใน `PARTICLE_SHAPES` · วงโคจรคำนวณล่วงหน้าเป็น keyframe (ไม่มีเลขต่อเฟรม) · QA เฉพาะทรง: เปิดเว็บด้วย `/#cross` `/#heart` `/#dna` `/#neuron` `/#stetho` (ปักหมุด ไม่ auto-cycle) |

### กติกาการใช้ (do / don't)

- ✅ สถานะทุกชนิดแสดงด้วย `Badge` + tone จาก mapping กลาง — ❌ อย่าสร้าง pill สีเองในหน้าจอ
- ✅ ตารางทุกตัวมี `empty` (ใช้ `EmptyState`) — ❌ อย่าปล่อยตารางว่างเปล่าเงียบ ๆ
- ✅ ตารางกว้างกว่าจอ → ตั้ง `minWidth` ให้ DataTable จัดการเลื่อนแนวนอน — ❌ อย่าบีบคอลัมน์จนอ่านไม่ออก
- ✅ งานยืนยันรายการเสี่ยง (สั่งยา, ลบข้อมูล) ใช้ `AppModal` เสมอ · งานอ่านอิงใช้ `SidePanel` (ผู้ใช้เลือกโหมดได้)
- ✅ แถบแพ้ยาใช้ `AlertBand variant="danger"` เท่านั้น ห้ามลดความเด่น/เปลี่ยนสี — เป็นเรื่องความปลอดภัยผู้ป่วย
- ✅ ตัวเลขที่ต้องเทียบแนวตั้ง (HN, เวลา, จำนวน) ใช้ `mono`

---

## 6. แพตเทิร์นหน้าจอและ flow

### 6.1 Responsive breakpoints (ใน `AppShell`)

**โครงหลังล็อกอิน (Figma 16:859):** ทั้งหน้าเป็นพื้นมิ้นต์ `sidebar` #DBF2E3 padding 8 · sidebar **โปร่งใส** วางทับพื้นมิ้นต์ (เมนูเป็นการ์ดขาว r12 สูง 44, ตัวที่เลือกพื้น `sidebarActive` #B7E4C7) · เนื้อหาเป็น **การ์ด `background` #F8FAFC มุม 24** ที่ครอบ topbar + หน้าจอไว้ด้วยกัน

| ความกว้าง | โครง |
|---|---|
| ≥ 1080px | sidebar เต็ม 250px (โปร่งบนพื้น mint) + การ์ดเนื้อหา r24 |
| 760–1079px | rail ไอคอน 80px |
| < 760px | ไม่มี sidebar → bottom tab bar 4 เมนู (ไม่มีพื้นมิ้นต์/มุมโค้ง) |

คอลัมน์ขวาของ Dashboard/Sync ย้ายลงล่างเมื่อจอ < 1180px · หน้า auth (Login/SSO) เปลี่ยน split → stack เมื่อ < 900px

### 6.2 สถานะคิวคนไข้ (ที่เดียวจบ)

`QueueStage` = `wait | screen | pending | lab | done` → ป้าย+โทนอยู่ที่ `STAGE_META` (mockData.ts)
สถานะซิงค์ = `null (รอการซิงค์/warning) | busy (กำลังอัพเดต/info) | pass (อัปเดตผ่าน/success) | fail (ไม่ผ่านเงื่อนไข/destructive)`

### 6.3 Flow ที่จำลองไว้ (และจุดต่อของจริง)

| Flow | จำลองที่ | ต่อของจริง |
|---|---|---|
| อ่านบัตรประชาชน 3 step (ไม่พร้อม → พร้อม → อ่านสำเร็จ+ฟอร์ม) | `AppContext.openReg/connectReader/readCard` (timeout) | SDK เครื่องอ่าน smart card — แทนที่ตัว timer แล้วยิง state เดิม (`reader`, `card`) |
| MOPH SSO (OAuth 2.0) | `ssoLogin` (timeout 1.4s) | endpoint จริง `sso.moph.go.th` — เก็บ access token ในหน่วยความจำเท่านั้นตามดีไซน์ |
| นำเข้าข้อมูลพื้นฐาน 8 ตาราง | `startSetupImport` (interval) | ดาวน์โหลด JSON → เขียนลง SQLite แล้วอัป `pct` ต่อไฟล์ |
| ซิงค์ขึ้น Cloud + รายการ fail + แก้ไขอัปโหลดซ้ำ | `runSync` / `resubmit` | คิว push จริง — โครง log (`LogLine{tone}`) และ badge ใช้ต่อได้เลย |

### 6.4 ข้อมูลจริงที่ต้องแทน mock

- `state/mockData.ts` ทั้งไฟล์ (คนไข้ 6 ราย, หน่วยงาน 6 แห่ง, ตารางนำเข้า 8 ตาราง, เจ้าหน้าที่ 4 คน) — โครง type อยู่ที่ `state/types.ts`
- ฐานข้อมูล offline แนะนำ **SQLite (expo-sqlite) + เข้ารหัส** ตามข้อกำหนด "เข้ารหัส AES-256 ในเครื่อง"
- persist การตั้งค่าธีม: ต่อ `ThemeProvider` กับ AsyncStorage (ตอนนี้อยู่ในหน่วยความจำ)

### 6.5 Assets ภาพจากไฟล์ Figma (อยู่ที่ `assets/figma/` · ใช้ผ่าน `src/assets.ts` → `FigmaAssets`)

Export จากไฟล์ Figma ด้วย images API ที่ scale 2x — ถ้าดีไซน์อัปเดต ให้ export node เดิมซ้ำตาม id นี้:

| ไฟล์ | node id | ใช้ที่ |
|---|---|---|
| `logo-moph.png` | `16:58` | ตรากระทรวง หน้า Login/SSO (`BrandPanel`) |
| `kpi-wait/exam/done/lab/avg.png` | `28:10605–10628` | ภาพ 3D การ์ด KPI หน้า Dashboard |
| `cloud-queue/pass/fail/last.png` | `33:16571, 32:13470, 33:16580, 33:16588` | ภาพเมฆ 3D การ์ด KPI หน้า Sync |
| `id-card.png` | `I31:12223;31:12142` | ภาพบัตรประชาชนใน RegisterModal |
| `setup-illustration.png` | `16:648` | ภาพเซิร์ฟเวอร์ 3D หน้า Setup (แสดงเมื่อจอ ≥1180px) |

ยังเป็นตัวแทนอยู่จุดเดียว: โลโก้ NHIP ใน sidebar (`NhipMark` — กล่องเขียวตัว "N" ตามดีไซน์ Figma ซึ่งวาดเป็น shape ไม่ใช่ภาพ)

---

## 7. Accessibility & กติการวม

1. คอนทราสต์ข้อความปกติ ≥ 4.5:1 — ชุด badge ทุกคู่ผ่านแล้ว ถ้าเพิ่มสีใหม่ให้เช็คก่อน
2. Touch target ≥ 44×44px (density จัดการให้แล้ว — อย่า override ต่ำกว่านี้)
3. `reduceMotion` ใน settings ต้องถูกเช็คก่อนใส่แอนิเมชันตกแต่งทุกครั้ง (`useTheme().reduceMotion`)
4. ห้ามใช้สีเป็นช่องทางเดียวสื่อสถานะ — badge มีข้อความกำกับเสมอ
5. ภาษาไทยขึ้นบรรทัดใหม่: ใช้ `numberOfLines` + ellipsis ในตาราง, อย่าตัดคำกลางประโยคใน label ปุ่ม
6. ปีแสดงเป็น พ.ศ. (มี `thaiToday()` ให้ใน utils)

## 8. Checklist เพิ่มหน้าจอใหม่

- [ ] ห่อเนื้อหาด้วย `ScrollView` padding 16, ช่องไฟระหว่างการ์ด 12–14
- [ ] ทุก section เป็น `SectionCard` (rounded xl) — หัวข้อ + ปุ่ม action ขวา
- [ ] สี/ฟอนต์/ระยะจาก `useTheme()` ทั้งหมด (ค้นคำว่า `#` ในไฟล์ตัวเองก่อน commit — ไม่ควรเจอนอกไฟล์ theme)
- [ ] มี empty state + สถานะ loading ของปุ่ม (`loading` prop)
- [ ] ปุ่มทุกตัวเป็นทรง pill — **ห้ามส่ง `rounded="md"`** (มีได้เฉพาะปุ่มยืนยันตัวตน: login / MOPH SSO)
- [ ] ฟอร์มที่มีฟิลด์บังคับ: ปุ่มยืนยัน `disabled` จนกว่าจะกรอกครบ + `errorText` ขึ้นตอน blur ทั้งที่ว่าง + บอกใต้ปุ่มว่าขาดช่องไหน
- [ ] ทดสอบ 3 breakpoint + dark mode + ฟอนต์ 18 + density comfortable
- [ ] ถ้ามีสถานะใหม่ → เพิ่ม mapping ใน mockData/STAGE_META ไม่ใช่ในหน้าจอ
