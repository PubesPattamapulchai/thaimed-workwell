import { evaluateCondition } from './conditions.js'

// สถานะการประเมินของผู้ใช้
//   position : รหัสตำแหน่ง (ขั้น 1)        nrs : 0-10 หรือ null
//   symptoms : { รหัสคำถามขั้น 2 : รหัสตัวเลือก | [รหัสตัวเลือก] }
//   yes      : { รหัสกฎขั้น 3 : 'yes' | 'no' | 'unsure' }
export function emptyState() {
  return { position: null, nrs: null, symptoms: {}, yes: {} }
}

export const WORK_QUESTION_ID = 'q_work'
export const WORK_OTHER = { id: 'w_other', label: 'อื่น ๆ / ไม่ระบุ', flag: '', exclusive: false }

// คำถามขั้น 2 = คำถามจากชีต + คำถามลักษณะงาน (สร้างจากชีตลักษณะงาน) แทรกเป็นข้อที่ 3
export function getStep2Questions(content) {
  const work = {
    id: WORK_QUESTION_ID,
    text: 'ลักษณะงานหลักของคุณเป็นแบบใด',
    type: 'single',
    options: [...content.workTypes.map((w) => ({ id: w.id, label: w.label, flag: '', exclusive: false })), WORK_OTHER],
  }
  const qs = [...content.symptomQuestions]
  qs.splice(Math.min(2, qs.length), 0, work)
  return qs
}

export const getAskRules = (content) => content.rules.filter((r) => r.kind === 'ask')
const getAutoRules = (content) => content.rules.filter((r) => r.kind === 'auto')

function selectedOptionIds(value) {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

function isAnswered(q, value) {
  return selectedOptionIds(value).length > 0
}

function isComplete(content, state) {
  if (!state.position || state.nrs === null || state.nrs === undefined) return false
  if (!getStep2Questions(content).every((q) => isAnswered(q, state.symptoms[q.id]))) return false
  return getAskRules(content).every((r) => ['yes', 'no', 'unsure'].includes(state.yes[r.id]))
}

export function collectFlags(content, state) {
  const flags = new Set()
  const pos = content.positions.find((p) => p.id === state.position)
  if (pos) {
    flags.add(`position:${pos.id}`.toLowerCase())
    flags.add(`group:${pos.group}`.toLowerCase())
  }
  for (const q of getStep2Questions(content)) {
    for (const id of selectedOptionIds(state.symptoms[q.id])) {
      const opt = q.options.find((o) => o.id === id)
      if (opt?.flag) flags.add(opt.flag.toLowerCase())
    }
  }
  if (Object.values(state.yes).includes('unsure')) flags.add('unsure')
  if (!isComplete(content, state)) flags.add('incomplete')
  return flags
}

const ORDER = { emergency: 0, exam: 1 }

// ประมวลผล: ตรวจกฎความปลอดภัยก่อนเสมอ ฉุกเฉิน > ตรวจเพิ่ม > ดูแลตนเอง
// ท่าฤๅษีดัดตนแสดงเฉพาะเมื่อผลเป็น "ดูแลตนเอง" เท่านั้น
export function assess(content, state) {
  const flags = collectFlags(content, state)
  const ctx = { nrs: state.nrs, flags }
  const reasons = []
  for (const r of getAskRules(content)) {
    if (state.yes[r.id] === 'yes') reasons.push({ id: r.id, level: r.level, reason: r.reason })
  }
  for (const r of getAutoRules(content)) {
    if (evaluateCondition(r.text, ctx)) reasons.push({ id: r.id, level: r.level, reason: r.reason })
  }
  // พื้นความปลอดภัยที่ฝังในโค้ด ไม่ขึ้นกับว่ามีแถว a_unsure / a_incomplete ในชีตหรือไม่:
  // ตอบ "ไม่แน่ใจ" หรือข้อมูลไม่ครบ ต้องไม่ได้ผล "ดูแลตนเอง" เด็ดขาด
  if (!reasons.length && flags.has('incomplete')) {
    reasons.push({ id: 'builtin_incomplete', level: 'exam', reason: 'ข้อมูลไม่ครบ ระบบจึงไม่เลือกท่าให้อัตโนมัติ' })
  }
  if (!reasons.length && flags.has('unsure')) {
    reasons.push({ id: 'builtin_unsure', level: 'exam', reason: 'ข้อมูลไม่เพียงพอ (ตอบว่าไม่แน่ใจ)' })
  }
  reasons.sort((a, b) => ORDER[a.level] - ORDER[b.level])
  const level = reasons.some((r) => r.level === 'emergency') ? 'emergency' : reasons.length ? 'exam' : 'selfcare'
  return { level, reasons, flags, showPoses: level === 'selfcare' }
}

export function toggleMulti(question, current, optionId) {
  const list = selectedOptionIds(current)
  const opt = question.options.find((o) => o.id === optionId)
  if (list.includes(optionId)) return list.filter((x) => x !== optionId)
  if (opt?.exclusive) return [optionId]
  const exclusiveIds = question.options.filter((o) => o.exclusive).map((o) => o.id)
  return [...list.filter((x) => !exclusiveIds.includes(x)), optionId]
}

// แปลงกรณีสาธิต (รายการรหัสตัวเลือก) เป็นสถานะเต็ม
export function stateFromDemo(content, demo) {
  const state = emptyState()
  state.position = demo.position
  state.nrs = demo.nrs
  for (const q of getStep2Questions(content)) {
    const picked = q.options.filter((o) => demo.answers.includes(o.id)).map((o) => o.id)
    if (picked.length) state.symptoms[q.id] = q.type === 'multi' ? picked : picked[0]
  }
  for (const r of getAskRules(content)) state.yes[r.id] = demo.yes.includes(r.id) ? 'yes' : 'no'
  return state
}

export const poseForGroup = (content, group) => content.poses.find((p) => p.group === group) ?? null
export const adviceForGroup = (content, group) => content.groupAdvice.find((g) => g.group === group) ?? null
export const workTipsFor = (content, workId) => content.workTypes.find((w) => w.id === workId)?.tips ?? []

