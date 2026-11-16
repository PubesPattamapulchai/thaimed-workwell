// แปลงเนื้อหาระบบ ⇄ ไฟล์ Excel (แพทย์แผนไทยแก้ใน Excel แล้วสร้างเว็บใหม่)
import * as XLSX from 'xlsx'
import { parseCondition } from '../../src/engine/conditions.js'
import { assess, stateFromDemo, getStep2Questions } from '../../src/engine/assess.js'

export const SHEETS = {
  readme: 'อ่านก่อน',
  positions: 'ตำแหน่งปวด',
  advice: 'คำแนะนำตามกลุ่ม',
  poses: 'ท่าฤๅษีดัดตน',
  work: 'ลักษณะงาน',
  questions: 'คำถามอาการ',
  rules: 'กฎความปลอดภัย',
  outcomes: 'ข้อความผลลัพธ์',
  services: 'หน่วยบริการ',
  demo: 'กรณีสาธิต',
  refs: 'เอกสารอ้างอิง',
}

const LEVEL_TH = { selfcare: 'ดูแลตนเอง', exam: 'ตรวจเพิ่ม', emergency: 'ฉุกเฉิน' }
const KIND_TH = { ask: 'ถามผู้ใช้', auto: 'อัตโนมัติ' }
const TYPE_TH = { single: 'เลือกข้อเดียว', multi: 'เลือกหลายข้อ' }
const invert = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]))
const LEVEL_FROM = invert(LEVEL_TH)
const KIND_FROM = invert(KIND_TH)
const TYPE_FROM = invert(TYPE_TH)

const H = {
  positions: ['รหัส', 'ชื่อ', 'กลุ่มเนื้อหา', 'คำอธิบายสั้น'],
  advice: ['กลุ่มเนื้อหา', 'ชื่อกลุ่ม', 'หัวข้อคำแนะนำ', 'คำอธิบาย', 'การปรับพฤติกรรม (บรรทัดละข้อ)', 'ข้อควรระวัง (บรรทัดละข้อ)', 'การติดตามผล'],
  poses: ['รหัสท่า', 'กลุ่มเนื้อหา', 'ชื่อท่า', 'สรุป', 'จำนวนรอบ', 'อ้างอิง', 'ขั้นที่', 'วิธีปฏิบัติ', 'ค้าง/ระยะเวลา', 'ไฟล์รูปขั้นนี้'],
  work: ['รหัส', 'ชื่อลักษณะงาน', 'เคล็ดลับ (บรรทัดละข้อ)'],
  questions: ['รหัสคำถาม', 'คำถาม', 'ชนิด', 'รหัสตัวเลือก', 'ตัวเลือก', 'flag', 'เลือกแยกเดี่ยว'],
  rules: ['รหัสกฎ', 'ชนิด', 'ระดับ', 'คำถามหรือเงื่อนไข', 'เหตุผลที่แสดง'],
  outcomes: ['ระดับ', 'หัวข้อ', 'ข้อความ'],
  services: ['รหัส', 'ชื่อหน่วยบริการ', 'อำเภอ', 'ตำบล', 'บริการ (คั่นด้วย ;)', 'เวลาให้บริการ', 'โทรศัพท์', 'ละติจูด', 'ลองจิจูด', 'ตำแหน่งบนแผนที่ X (0-100)', 'ตำแหน่งบนแผนที่ Y (0-100)', 'ไฟล์รูป'],
  demo: ['รหัส', 'ชื่อกรณี', 'ข้อมูลสมมติ', 'ผลที่คาดหวัง (ข้อความ)', 'ระดับที่คาดหวัง', 'รหัสตำแหน่ง', 'NRS', 'คำตอบขั้นที่ 2 (รหัสตัวเลือก คั่นด้วย ;)', 'ตอบ "มี" ในขั้นที่ 3 (รหัสกฎ คั่นด้วย ;)'],
  refs: ['ลำดับ', 'เอกสารอ้างอิง', 'ลิงก์'],
}

const README = [
  ['ไฟล์เนื้อหาระบบ ThaiMed WorkWell Sakhon'],
  [''],
  ['วิธีใช้'],
  ['1. แก้เนื้อหาในแต่ละชีตได้โดยตรง แล้วบันทึกไฟล์ (ปิด Excel ก่อนสั่งสร้างเว็บ)'],
  ['2. รันคำสั่ง  npm run build  (หรือ  npm run dev  เพื่อดูตัวอย่าง) ระบบจะอ่านไฟล์นี้และตรวจความถูกต้องให้ ถ้ามีจุดผิดจะแจ้งเป็นภาษาไทย'],
  ['3. อย่าเปลี่ยนชื่อชีตและชื่อหัวตาราง (แถวแรกของแต่ละชีต) แต่เพิ่ม/ลบ/แก้แถวได้'],
  [''],
  ['ข้อควรรู้'],
  ['• เนื้อหาเริ่มต้นร่างไว้ให้แล้ว แก้ไขหรือแทนที่ได้ทุกชีต ระบบจะตรวจความถูกต้องตอน build'],
  ['• ชีต "ท่าฤๅษีดัดตน" และ "คำถามอาการ": แถวที่เว้นรหัสว่างไว้ = แถวต่อเนื่องของรายการข้างบน (เช่น ขั้นที่ 2, 3 ของท่าเดียวกัน)'],
  ['• ชีต "กฎความปลอดภัย": ชนิด "ถามผู้ใช้" = เป็นคำถามในขั้นที่ 3 (ตอบ "มี" จึงเข้าเงื่อนไข) / ชนิด "อัตโนมัติ" = เงื่อนไขคำนวณจากขั้นที่ 1–2'],
  ['   รูปแบบเงื่อนไข:  flag:ชื่อ  (ตัวเลือกที่ตั้ง flag นี้ถูกเลือก),  nrs>=7  (คะแนนความปวด),  ใช้ | = หรือ,  & = และ'],
  ['   flag ที่ระบบสร้างให้เอง: unsure (ตอบไม่แน่ใจ), incomplete (ข้อมูลไม่ครบ), position:รหัสตำแหน่ง, group:กลุ่มเนื้อหา'],
  ['• ระดับผลลัพธ์: ฉุกเฉิน > ตรวจเพิ่ม > ดูแลตนเอง  ท่าฤๅษีดัดตนจะแสดงเฉพาะผล "ดูแลตนเอง" เท่านั้น'],
  ['• ชีต "กรณีสาธิต": ระบบตรวจให้ว่าผลที่คำนวณได้ตรงกับ "ระดับที่คาดหวัง" ถ้าไม่ตรงจะสร้างเว็บไม่ผ่าน'],
  ['• รูปภาพ: วางไฟล์ในโฟลเดอร์ public/images/ ตามชื่อที่ระบุในชีต (ไม่ต้องแก้โค้ด) ดูรายการชื่อไฟล์ใน public/images/README.txt'],
]

// ---------- ตัวช่วยแปลงค่าในเซลล์ ----------
const s = (v) => String(v ?? '').trim()
const lines = (v) => s(v).split(/\r?\n/).map((x) => x.trim()).filter(Boolean)
const semi = (v) => s(v).split(';').map((x) => x.trim()).filter(Boolean)
const num = (v) => (s(v) === '' ? NaN : Number(v))

function addSheet(wb, name, rows, widths) {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  if (widths) ws['!cols'] = widths.map((wch) => ({ wch }))
  XLSX.utils.book_append_sheet(wb, ws, name)
}

export function contentToWorkbook(c) {
  const wb = XLSX.utils.book_new()
  addSheet(wb, SHEETS.readme, README, [140])
  addSheet(wb, SHEETS.positions, [H.positions, ...c.positions.map((p) => [p.id, p.label, p.group, p.hint])], [16, 18, 16, 50])
  addSheet(wb, SHEETS.advice, [H.advice, ...c.groupAdvice.map((g) => [g.group, g.label, g.title, g.intro, g.behaviours.join('\n'), g.cautions.join('\n'), g.followUp])], [16, 14, 30, 60, 60, 60, 24])

  const poseRows = []
  for (const p of c.poses) {
    p.steps.forEach((st, i) => {
      poseRows.push(i === 0
        ? [p.id, p.group, p.name, p.summary, p.rounds, p.source, st.n, st.text, st.hold, st.image]
        : [p.id, '', '', '', '', '', st.n, st.text, st.hold, st.image])
    })
  }
  addSheet(wb, SHEETS.poses, [H.poses, ...poseRows], [18, 14, 30, 50, 30, 40, 8, 60, 24, 24])

  addSheet(wb, SHEETS.work, [H.work, ...c.workTypes.map((w) => [w.id, w.label, w.tips.join('\n')])], [16, 40, 80])

  const qRows = []
  for (const q of c.symptomQuestions) {
    q.options.forEach((o, i) => {
      qRows.push(i === 0
        ? [q.id, q.text, TYPE_FROM_KEY(q.type), o.id, o.label, o.flag, o.exclusive ? 'ใช่' : '']
        : [q.id, '', '', o.id, o.label, o.flag, o.exclusive ? 'ใช่' : ''])
    })
  }
  addSheet(wb, SHEETS.questions, [H.questions, ...qRows], [16, 50, 16, 14, 40, 18, 14])

  addSheet(wb, SHEETS.rules, [H.rules, ...c.rules.map((r) => [r.id, KIND_TH[r.kind], LEVEL_TH[r.level], r.text, r.reason])], [14, 12, 12, 70, 50])
  addSheet(wb, SHEETS.outcomes, [H.outcomes, ...c.outcomes.map((o) => [LEVEL_TH[o.level], o.title, o.message])], [14, 40, 100])
  addSheet(wb, SHEETS.services, [H.services, ...c.services.map((v) => [v.id, v.name, v.district, v.subdistrict, v.types.join('; '), v.hours, v.phone, v.lat, v.lng, v.mapX, v.mapY, v.image])], [8, 30, 18, 14, 50, 28, 14, 10, 10, 14, 14, 20])
  addSheet(wb, SHEETS.demo, [H.demo, ...c.demoCases.map((d) => [d.id, d.title, d.scenario, d.expectedText, LEVEL_TH[d.expectedLevel], d.position, d.nrs, d.answers.join('; '), d.yes.join('; ')])], [10, 14, 50, 50, 14, 14, 6, 40, 30])
  addSheet(wb, SHEETS.refs, [H.refs, ...c.references.map((r) => [r.no, r.text, r.url])], [8, 100, 70])
  return wb
}

function TYPE_FROM_KEY(t) {
  return TYPE_TH[t]
}

// ---------- อ่านกลับ ----------
function readSheet(wb, name, headers) {
  const ws = wb.Sheets[name]
  if (!ws) throw new Error(`ไม่พบชีต "${name}" ในไฟล์ Excel (ห้ามเปลี่ยนชื่อชีต)`)
  // ตัดช่องว่างหัว/ท้ายของชื่อหัวตารางด้วย ไม่งั้นคอลัมน์จะอ่านได้เป็นค่าว่างโดยไม่มี error
  const rows = XLSX.utils
    .sheet_to_json(ws, { defval: '' })
    .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [s(k), v])))
  const present = new Set(XLSX.utils.sheet_to_json(ws, { header: 1 })[0]?.map(s) ?? [])
  for (const h of headers) {
    if (!present.has(h)) throw new Error(`ชีต "${name}" ไม่มีหัวตาราง "${h}" (ห้ามเปลี่ยนชื่อหัวตาราง)`)
  }
  return rows.filter((r) => Object.values(r).some((v) => s(v) !== ''))
}

// เว้นคอลัมน์แรกว่าง = แถวต่อเนื่องของรายการก่อนหน้า
function groupRows(rows, idKey) {
  const groups = []
  for (const r of rows) {
    const id = s(r[idKey])
    const last = groups.at(-1)
    // รหัสว่าง หรือรหัสเดียวกับแถวก่อนหน้า = แถวต่อเนื่องของรายการเดิม
    if (last && (!id || id === last.id)) last.rows.push(r)
    else if (id) groups.push({ id, rows: [r] })
  }
  return groups
}

export function workbookToContent(wb) {
  const content = {}
  const rd = (key) => readSheet(wb, SHEETS[key], H[key])

  content.positions = rd('positions').map((r) => ({ id: s(r['รหัส']), label: s(r['ชื่อ']), group: s(r['กลุ่มเนื้อหา']), hint: s(r['คำอธิบายสั้น']) }))
  content.groupAdvice = rd('advice').map((r) => ({
    group: s(r['กลุ่มเนื้อหา']), label: s(r['ชื่อกลุ่ม']), title: s(r['หัวข้อคำแนะนำ']), intro: s(r['คำอธิบาย']),
    behaviours: lines(r['การปรับพฤติกรรม (บรรทัดละข้อ)']), cautions: lines(r['ข้อควรระวัง (บรรทัดละข้อ)']), followUp: s(r['การติดตามผล']),
  }))
  content.poses = groupRows(rd('poses'), 'รหัสท่า').map(({ id, rows }) => {
    const f = rows[0]
    return {
      id, group: s(f['กลุ่มเนื้อหา']), name: s(f['ชื่อท่า']), summary: s(f['สรุป']), rounds: s(f['จำนวนรอบ']), source: s(f['อ้างอิง']),
      steps: rows.map((r, i) => ({ n: s(r['ขั้นที่']) === '' ? i + 1 : Number(r['ขั้นที่']), text: s(r['วิธีปฏิบัติ']), hold: s(r['ค้าง/ระยะเวลา']), image: s(r['ไฟล์รูปขั้นนี้']) })),
    }
  })
  content.workTypes = rd('work').map((r) => ({ id: s(r['รหัส']), label: s(r['ชื่อลักษณะงาน']), tips: lines(r['เคล็ดลับ (บรรทัดละข้อ)']) }))
  content.symptomQuestions = groupRows(rd('questions'), 'รหัสคำถาม').map(({ id, rows }) => ({
    id, text: s(rows[0]['คำถาม']), type: TYPE_FROM[s(rows[0]['ชนิด'])] ?? s(rows[0]['ชนิด']),
    options: rows.map((r) => ({ id: s(r['รหัสตัวเลือก']), label: s(r['ตัวเลือก']), flag: s(r['flag']), exclusive: s(r['เลือกแยกเดี่ยว']) === 'ใช่' })),
  }))
  content.rules = rd('rules').map((r) => ({ id: s(r['รหัสกฎ']), kind: KIND_FROM[s(r['ชนิด'])] ?? s(r['ชนิด']), level: LEVEL_FROM[s(r['ระดับ'])] ?? s(r['ระดับ']), text: s(r['คำถามหรือเงื่อนไข']), reason: s(r['เหตุผลที่แสดง']) }))
  content.outcomes = rd('outcomes').map((r) => ({ level: LEVEL_FROM[s(r['ระดับ'])] ?? s(r['ระดับ']), title: s(r['หัวข้อ']), message: s(r['ข้อความ']) }))
  content.services = rd('services').map((r) => ({
    id: s(r['รหัส']), name: s(r['ชื่อหน่วยบริการ']), district: s(r['อำเภอ']), subdistrict: s(r['ตำบล']), types: semi(r['บริการ (คั่นด้วย ;)']),
    hours: s(r['เวลาให้บริการ']), phone: s(r['โทรศัพท์']), lat: num(r['ละติจูด']), lng: num(r['ลองจิจูด']),
    mapX: num(r['ตำแหน่งบนแผนที่ X (0-100)']), mapY: num(r['ตำแหน่งบนแผนที่ Y (0-100)']), image: s(r['ไฟล์รูป']),
  }))
  content.demoCases = rd('demo').map((r) => ({
    id: s(r['รหัส']), title: s(r['ชื่อกรณี']), scenario: s(r['ข้อมูลสมมติ']), expectedText: s(r['ผลที่คาดหวัง (ข้อความ)']),
    expectedLevel: LEVEL_FROM[s(r['ระดับที่คาดหวัง'])] ?? s(r['ระดับที่คาดหวัง']), position: s(r['รหัสตำแหน่ง']), nrs: num(r['NRS']),
    answers: semi(r['คำตอบขั้นที่ 2 (รหัสตัวเลือก คั่นด้วย ;)']), yes: semi(r['ตอบ "มี" ในขั้นที่ 3 (รหัสกฎ คั่นด้วย ;)']),
  }))
  content.references = rd('refs').map((r) => ({ no: Number(r['ลำดับ']), text: s(r['เอกสารอ้างอิง']), url: s(r['ลิงก์']) }))
  return content
}

// ---------- ตรวจความถูกต้อง ----------
function dupes(list) {
  const seen = new Set()
  const out = []
  for (const x of list) {
    if (seen.has(x)) out.push(x)
    seen.add(x)
  }
  return out
}

export function validateContent(c) {
  const errors = []
  const warnings = []
  const err = (m) => errors.push(m)

  const checkDupes = (label, ids) => dupes(ids).forEach((d) => err(`${label}: รหัส "${d}" ซ้ำ`))
  const blank = (label, rows, key) => rows.forEach((r, i) => !s(r[key]) && err(`${label}: แถวที่ ${i + 1} ไม่มี ${key}`))

  if (!c.positions.length) err('ชีตตำแหน่งปวด: ต้องมีอย่างน้อย 1 ตำแหน่ง')
  checkDupes('ตำแหน่งปวด', c.positions.map((p) => p.id))
  blank('ตำแหน่งปวด', c.positions, 'id')
  c.positions.forEach((p) => !p.label && err(`ตำแหน่ง "${p.id}": ไม่มีชื่อตำแหน่ง`))
  const groups = new Set(c.groupAdvice.map((g) => g.group))
  checkDupes('คำแนะนำตามกลุ่ม', c.groupAdvice.map((g) => g.group))
  for (const p of c.positions) {
    if (!groups.has(p.group)) err(`ตำแหน่ง "${p.id}" ใช้กลุ่มเนื้อหา "${p.group}" แต่ไม่มีในชีตคำแนะนำตามกลุ่ม`)
  }
  for (const g of groups) {
    if (!c.poses.some((p) => p.group === g)) warnings.push(`กลุ่มเนื้อหา "${g}" ยังไม่มีท่าฤๅษีดัดตนในชีตท่า (หน้าคำแนะนำจะไม่แสดงท่า)`)
  }

  checkDupes('ท่าฤๅษีดัดตน', c.poses.map((p) => p.id))
  for (const p of c.poses) {
    if (!groups.has(p.group)) err(`ท่า "${p.id}" ใช้กลุ่มเนื้อหา "${p.group}" ที่ไม่มีในชีตคำแนะนำตามกลุ่ม`)
    if (!p.steps.length) err(`ท่า "${p.id}" ไม่มีขั้นตอน`)
  }

  const optionIds = []
  const flagsProduced = new Set(['unsure', 'incomplete'])
  checkDupes('ลักษณะงาน', c.workTypes.map((w) => w.id))
  c.workTypes.forEach((w) => optionIds.push(w.id))
  optionIds.push('w_other')
  if (c.workTypes.some((w) => w.id === 'w_other')) err('ลักษณะงาน: รหัส "w_other" สงวนไว้สำหรับตัวเลือก "อื่น ๆ" ที่ระบบเพิ่มให้เอง')
  checkDupes('คำถามอาการ', c.symptomQuestions.map((q) => q.id))
  for (const q of c.symptomQuestions) {
    if (q.id === 'q_work') err('คำถามอาการ: รหัส "q_work" สงวนไว้สำหรับคำถามลักษณะงาน')
    if (!['single', 'multi'].includes(q.type)) err(`คำถาม "${q.id}": ชนิดต้องเป็น เลือกข้อเดียว หรือ เลือกหลายข้อ`)
    if (!q.options.length) err(`คำถาม "${q.id}" ไม่มีตัวเลือก`)
    for (const o of q.options) {
      if (!o.id) err(`คำถาม "${q.id}" มีตัวเลือกที่ไม่มีรหัส`)
      if (!o.label) err(`คำถาม "${q.id}": ตัวเลือก "${o.id}" ไม่มีข้อความ`)
      optionIds.push(o.id)
      if (o.flag) flagsProduced.add(o.flag.toLowerCase())
    }
  }
  checkDupes('ตัวเลือก (รหัสตัวเลือกต้องไม่ซ้ำกันทั้งไฟล์)', optionIds)

  checkDupes('กฎความปลอดภัย', c.rules.map((r) => r.id))
  for (const r of c.rules) {
    if (!['ask', 'auto'].includes(r.kind)) err(`กฎ "${r.id}": ชนิดต้องเป็น ถามผู้ใช้ หรือ อัตโนมัติ`)
    if (!['exam', 'emergency'].includes(r.level)) err(`กฎ "${r.id}": ระดับต้องเป็น ตรวจเพิ่ม หรือ ฉุกเฉิน`)
    if (!r.text) err(`กฎ "${r.id}": ไม่มีคำถามหรือเงื่อนไข`)
    if (!r.reason) err(`กฎ "${r.id}": ไม่มีเหตุผลที่แสดง`)
    if (r.kind === 'auto' && r.text) {
      try {
        for (const group of parseCondition(r.text)) {
          for (const term of group) {
            if (term.type === 'nrs') {
              const { op, value } = term
              const impossible = value > 10 || (op === '>' && value >= 10) || (op === '<' && value <= 0)
              if (impossible) err(`กฎ "${r.id}": เกณฑ์ NRS "${r.text}" อยู่นอกช่วง 0–10 หรือไม่มีวันเป็นจริง กฎนี้จะไม่มีวันทำงาน`)
              continue
            }
            if (term.type !== 'flag') continue
            const ok = flagsProduced.has(term.name)
              || (term.name.startsWith('position:') && c.positions.some((p) => p.id.toLowerCase() === term.name.slice(9)))
              || (term.name.startsWith('group:') && groups.has(term.name.slice(6)))
            if (!ok) err(`กฎ "${r.id}": flag "${term.name}" ไม่มีตัวเลือกใดสร้าง flag นี้ (พิมพ์ผิดหรือไม่) กฎนี้จะไม่มีวันทำงาน`)
          }
        }
      } catch (e) {
        err(`กฎ "${r.id}": ${e.message}`)
      }
    }
  }
  if (!c.rules.some((r) => r.kind === 'ask')) err('ชีตกฎความปลอดภัย: ต้องมีคำถามคัดกรองขั้นที่ 3 (ชนิด ถามผู้ใช้) อย่างน้อย 1 ข้อ')

  checkDupes('ข้อความผลลัพธ์ (ระดับ)', c.outcomes.map((o) => o.level))
  for (const lv of ['selfcare', 'exam', 'emergency']) {
    if (!c.outcomes.some((o) => o.level === lv)) err(`ชีตข้อความผลลัพธ์: ไม่มีระดับ "${LEVEL_TH[lv]}" (${lv})`)
  }
  for (const o of c.outcomes) {
    if (!o.title || !o.message) err(`ชีตข้อความผลลัพธ์: ระดับ "${LEVEL_TH[o.level] ?? o.level}" ต้องมีทั้งหัวข้อและข้อความ`)
  }

  checkDupes('หน่วยบริการ', c.services.map((v) => v.id))
  for (const v of c.services) {
    for (const k of ['lat', 'lng']) if (Number.isNaN(v[k])) err(`หน่วยบริการ "${v.id}": ${k === 'lat' ? 'ละติจูด' : 'ลองจิจูด'}ต้องเป็นตัวเลข`)
    for (const k of ['mapX', 'mapY']) if (Number.isNaN(v[k]) || v[k] < 0 || v[k] > 100) err(`หน่วยบริการ "${v.id}": ตำแหน่งบนแผนที่ต้องเป็นตัวเลข 0-100`)
  }

  checkDupes('กรณีสาธิต', c.demoCases.map((d) => d.id))
  const askIds = c.rules.filter((r) => r.kind === 'ask').map((r) => r.id)
  for (const d of c.demoCases) {
    if (!c.positions.some((p) => p.id === d.position)) err(`กรณีสาธิต "${d.id}": ไม่มีรหัสตำแหน่ง "${d.position}"`)
    if (!(d.nrs >= 0 && d.nrs <= 10)) err(`กรณีสาธิต "${d.id}": NRS ต้องเป็น 0-10`)
    for (const a of d.answers) if (!optionIds.includes(a)) err(`กรณีสาธิต "${d.id}": ไม่มีรหัสตัวเลือก "${a}"`)
    for (const y of d.yes) if (!askIds.includes(y)) err(`กรณีสาธิต "${d.id}": "${y}" ไม่ใช่กฎชนิดถามผู้ใช้`)
  }

  // กรณีสาธิตต้องครอบคลุมครบ 3 ระดับ (เอกสารภาคผนวก ข) — กันการลบกฎแล้วไม่มีใครรู้
  for (const lv of ['selfcare', 'exam', 'emergency']) {
    if (!c.demoCases.some((d) => d.expectedLevel === lv)) err(`กรณีสาธิต: ต้องมีอย่างน้อย 1 กรณีที่คาดหวังระดับ "${LEVEL_TH[lv]}" (${lv})`)
  }

  // ตรวจกรณีสาธิตกับตัวประมวลผลจริง (ถ้าข้อมูลพื้นฐานผ่านแล้ว)
  if (!errors.length) {
    for (const d of c.demoCases) {
      const got = assess(c, stateFromDemo(c, d)).level
      if (got !== d.expectedLevel) err(`กรณีสาธิต "${d.id}": ผลที่คำนวณได้ (${LEVEL_TH[got]}) ไม่ตรงกับระดับที่คาดหวัง (${LEVEL_TH[d.expectedLevel] ?? d.expectedLevel})`)
    }
    // ทุกคำถามขั้น 2 ต้องมีตัวเลือก
    for (const q of getStep2Questions(c)) if (!q.options.length) err(`คำถาม "${q.id}" ไม่มีตัวเลือก`)
  }
  return { errors, warnings }
}


