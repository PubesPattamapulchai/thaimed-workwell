// สร้างไฟล์ Excel ต้นแบบจากข้อมูลตัวอย่าง  (npm run content:template)
// จะไม่เขียนทับไฟล์ที่แก้ไว้แล้ว ยกเว้นสั่ง  npm run content:template -- --force
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'
import { sampleContent } from './sample-content.mjs'
import { contentToWorkbook } from './lib/excel.mjs'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const XLSX_PATH = path.join(ROOT, 'content', 'เนื้อหาระบบ.xlsx')

export function writeTemplate({ force = false } = {}) {
  if (fs.existsSync(XLSX_PATH) && !force) return false
  fs.mkdirSync(path.dirname(XLSX_PATH), { recursive: true })
  const buf = XLSX.write(contentToWorkbook(sampleContent), { type: 'buffer', bookType: 'xlsx' })
  fs.writeFileSync(XLSX_PATH, buf)
  return true
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const force = process.argv.includes('--force')
  const wrote = writeTemplate({ force })
  console.log(wrote ? `สร้างไฟล์แล้ว: ${XLSX_PATH}` : `มีไฟล์อยู่แล้ว ไม่เขียนทับ (ใช้ --force หากต้องการเริ่มใหม่): ${XLSX_PATH}`)
}
