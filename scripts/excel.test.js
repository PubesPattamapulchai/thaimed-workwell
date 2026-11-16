import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { sampleContent } from './sample-content.mjs'
import { contentToWorkbook, workbookToContent, validateContent, SHEETS } from './lib/excel.mjs'

const clone = (x) => JSON.parse(JSON.stringify(x))

describe('Excel ⇄ เนื้อหา', () => {
  it('สร้างเวิร์กบุ๊กครบทุกชีตที่ต้องใช้', () => {
    const wb = contentToWorkbook(sampleContent)
    for (const name of Object.values(SHEETS)) expect(wb.SheetNames).toContain(name)
  })

  it('แปลงไป-กลับแล้วได้เนื้อหาเดิมทุกประการ', () => {
    const wb = contentToWorkbook(sampleContent)
    expect(workbookToContent(wb)).toEqual(sampleContent)
  })

  it('แปลงไป-กลับผ่านไบนารี .xlsx จริงได้', () => {
    const buf = XLSX.write(contentToWorkbook(sampleContent), { type: 'buffer', bookType: 'xlsx' })
    expect(workbookToContent(XLSX.read(buf))).toEqual(sampleContent)
  })

  it('แถวที่เว้นรหัสว่างในชีตท่า/คำถาม ถือเป็นแถวต่อเนื่องของรายการก่อนหน้า', () => {
    const wb = contentToWorkbook(sampleContent)
    const ws = wb.Sheets[SHEETS.poses]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
    // แถวขั้นที่ 2 ของท่าแก้เกียจ: ลบรหัสท่าออก
    const idx = rows.findIndex((r) => r[0] === 'pose_shoulder_1' && r[6] === 2)
    rows[idx][0] = ''
    wb.Sheets[SHEETS.poses] = XLSX.utils.aoa_to_sheet(rows)
    const shoulder = workbookToContent(wb).poses.find((p) => p.id === 'pose_shoulder_1')
    expect(shoulder.steps.map((s) => s.n)).toEqual([1, 2, 3])
  })

  it('หัวตารางที่มีช่องว่างท้ายยังอ่านค่าได้ (ไม่ทำให้คอลัมน์ว่างเงียบ ๆ)', () => {
    const wb = contentToWorkbook(sampleContent)
    const ws = wb.Sheets[SHEETS.questions]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
    rows[0] = rows[0].map((h) => (h === 'เลือกแยกเดี่ยว' || h === 'ตัวเลือก' ? `${h} ` : h))
    wb.Sheets[SHEETS.questions] = XLSX.utils.aoa_to_sheet(rows)
    const q = workbookToContent(wb).symptomQuestions.find((x) => x.id === 'q_assoc')
    expect(q.options.find((o) => o.id === 'a_none').exclusive).toBe(true)
    expect(q.options[0].label).not.toBe('')
  })

  it('โยนข้อผิดพลาดภาษาไทยเมื่อชีตหาย', () => {
    const wb = contentToWorkbook(sampleContent)
    delete wb.Sheets[SHEETS.rules]
    wb.SheetNames = wb.SheetNames.filter((n) => n !== SHEETS.rules)
    expect(() => workbookToContent(wb)).toThrow(/ไม่พบชีต/)
  })
})

describe('validateContent', () => {
  it('ข้อมูลตัวอย่างไม่มีข้อผิดพลาด', () => {
    expect(validateContent(sampleContent).errors).toEqual([])
  })

  it('จับ flag ที่พิมพ์ผิดในกฎอัตโนมัติ (กันกฎความปลอดภัยเงียบหาย)', () => {
    const c = clone(sampleContent)
    c.rules.find((r) => r.id === 'a_numb').text = 'flag:numbnes'
    const { errors } = validateContent(c)
    expect(errors.join('\n')).toMatch(/numbnes/)
  })

  it('จับเงื่อนไขที่รูปแบบผิด', () => {
    const c = clone(sampleContent)
    c.rules.find((r) => r.id === 'a_nrs').text = 'nrs>=สูง'
    expect(validateContent(c).errors.join('\n')).toMatch(/เงื่อนไข/)
  })

  it('จับรหัสซ้ำ', () => {
    const c = clone(sampleContent)
    c.positions.push({ ...c.positions[0] })
    expect(validateContent(c).errors.join('\n')).toMatch(/ซ้ำ/)
  })

  it('จับกลุ่มเนื้อหาของตำแหน่งที่ไม่มีคำแนะนำรองรับ', () => {
    const c = clone(sampleContent)
    c.positions[0].group = 'knee'
    expect(validateContent(c).errors.join('\n')).toMatch(/knee/)
  })

  it('จับกรณีสาธิตที่อ้างรหัสตัวเลือกที่ไม่มีอยู่', () => {
    const c = clone(sampleContent)
    c.demoCases[0].answers.push('zzz')
    expect(validateContent(c).errors.join('\n')).toMatch(/zzz/)
  })

  it('จับกรณีสาธิตที่ผลจริงไม่ตรงกับผลที่คาดหวัง', () => {
    const c = clone(sampleContent)
    c.demoCases.push({ ...clone(c.demoCases[0]), id: 'demo1b' }) // ยังครอบคลุมระดับดูแลตนเองอยู่
    c.demoCases[0].expectedLevel = 'emergency'
    expect(validateContent(c).errors.join('\n')).toMatch(/ไม่ตรง/)
  })

  it('จับข้อความผลลัพธ์ที่ขาดไป', () => {
    const c = clone(sampleContent)
    c.outcomes = c.outcomes.filter((o) => o.level !== 'emergency')
    expect(validateContent(c).errors.join('\n')).toMatch(/emergency|ฉุกเฉิน/)
  })

  const errs = (c) => validateContent(c).errors.join('\n')

  it('ไม่มีคำถามคัดกรองขั้น 3 เลย → error (ไม่ใช่แค่เตือน)', () => {
    const c = clone(sampleContent)
    c.rules = c.rules.filter((r) => r.kind !== 'ask')
    c.demoCases = c.demoCases.filter((d) => d.expectedLevel === 'selfcare')
    expect(errs(c)).toMatch(/คำถามคัดกรอง/)
  })

  it('กรณีสาธิตต้องครอบคลุมทั้ง 3 ระดับ', () => {
    const c = clone(sampleContent)
    c.demoCases = c.demoCases.filter((d) => d.expectedLevel !== 'emergency')
    expect(errs(c)).toMatch(/ฉุกเฉิน|emergency/)
  })

  it('จับเกณฑ์ NRS นอกช่วง 0–10 และเงื่อนไขที่ไม่มีวันเป็นจริง', () => {
    for (const bad of ['nrs>=70', 'nrs>10', 'nrs<0', 'nrs=11']) {
      const c = clone(sampleContent)
      c.rules.find((r) => r.id === 'a_nrs').text = bad
      expect(errs(c)).toMatch(/NRS/)
    }
  })

  it('จับข้อความที่เว้นว่าง: ผลลัพธ์, ป้ายตัวเลือก, ชื่อตำแหน่ง', () => {
    let c = clone(sampleContent)
    c.outcomes[2].message = ''
    expect(errs(c)).toMatch(/ข้อความผลลัพธ์/)
    c = clone(sampleContent)
    c.outcomes[2].title = ''
    expect(errs(c)).toMatch(/ข้อความผลลัพธ์/)
    c = clone(sampleContent)
    c.symptomQuestions[0].options[0].label = ''
    expect(errs(c)).toMatch(/ตัวเลือก/)
    c = clone(sampleContent)
    c.positions[0].label = ''
    expect(errs(c)).toMatch(/ตำแหน่ง/)
  })

  it('จับระดับผลลัพธ์ซ้ำ', () => {
    const c = clone(sampleContent)
    c.outcomes.push({ ...c.outcomes[0] })
    expect(errs(c)).toMatch(/ซ้ำ/)
  })

  it('เตือน (ไม่ใช่ error) เมื่อกลุ่มเนื้อหาไม่มีท่า', () => {
    const c = clone(sampleContent)
    c.poses = c.poses.filter((p) => p.group !== 'back')
    const r = validateContent(c)
    expect(r.errors).toEqual([])
    expect(r.warnings.join('\n')).toMatch(/ท่า/)
  })
})

