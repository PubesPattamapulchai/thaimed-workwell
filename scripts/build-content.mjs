// อ่าน content/เนื้อหาระบบ.xlsx → ตรวจความถูกต้อง → เขียน src/content.generated.json  (npm run content)
import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'
import { ROOT, XLSX_PATH } from './make-template.mjs'
import { workbookToContent, validateContent } from './lib/excel.mjs'

const OUT = path.join(ROOT, 'src', 'content.generated.json')

// ห้ามสร้างเว็บจากเนื้อหาตัวอย่างโดยเงียบ ๆ (เช่น ไฟล์ถูกย้าย/เปลี่ยนชื่อจาก OneDrive sync conflict)
if (!fs.existsSync(XLSX_PATH)) {
  console.error(`\n✖ ไม่พบไฟล์เนื้อหา: ${XLSX_PATH}\n  ถ้าไฟล์ถูกย้าย/เปลี่ยนชื่อ ให้นำกลับมาไว้ที่เดิม หรือเริ่มจากตัวอย่างด้วย  npm run content:template`)
  process.exit(1)
}

let content
try {
  content = workbookToContent(XLSX.read(fs.readFileSync(XLSX_PATH)))
} catch (e) {
  console.error(`\n✖ อ่านไฟล์ Excel ไม่ได้: ${e.message}\n  (ถ้าเปิดไฟล์ค้างใน Excel ให้บันทึกและปิดก่อน)`)
  process.exit(1)
}

const { errors, warnings } = validateContent(content)
warnings.forEach((w) => console.warn(`⚠ ${w}`))
if (errors.length) {
  console.error(`\n✖ พบข้อผิดพลาด ${errors.length} จุดในไฟล์เนื้อหา:`)
  errors.forEach((e) => console.error(`  - ${e}`))
  process.exit(1)
}

fs.writeFileSync(OUT, JSON.stringify(content, null, 2), 'utf8')
console.log(`✔ อ่านเนื้อหาสำเร็จ → ${path.relative(ROOT, OUT)}  (ตำแหน่ง ${content.positions.length}, ท่า ${content.poses.length}, กฎ ${content.rules.length}, หน่วยบริการ ${content.services.length}, กรณีสาธิต ${content.demoCases.length})`)
