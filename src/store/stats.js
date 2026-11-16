// สถิติการใช้งานแบบไม่ระบุตัวตน เก็บใน localStorage ของเครื่องนั้น ๆ เท่านั้น (ไม่ส่งออกอินเทอร์เน็ต)
// ไม่เก็บชื่อ/ข้อมูลสุขภาพที่ระบุตัวบุคคล: เก็บเฉพาะ ขั้นที่ไปถึง ระยะเวลา ระดับผลลัพธ์ และคะแนนแบบประเมิน

export const SURVEY_ITEMS = [
  { key: 'understand', label: 'เข้าใจขั้นตอนและคำแนะนำได้ง่าย' },
  { key: 'easy', label: 'ใช้งานสะดวก' },
  { key: 'useful', label: 'คำแนะนำเป็นประโยชน์' },
  { key: 'overall', label: 'ความพึงพอใจโดยรวม' },
]

const K_SESS = 'twws:sessions'
const K_SURV = 'twws:surveys'

// ---------- ตัวคำนวณ (ฟังก์ชันล้วน) ----------
export function satisfactionMean(scores) {
  const vals = SURVEY_ITEMS.map((i) => Number(scores[i.key])).filter((n) => Number.isFinite(n))
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

export function summarize(sessions, surveys, { includeDemo = false } = {}) {
  const demoIds = new Set(sessions.filter((s) => s.demo).map((s) => s.id))
  const ss = sessions.filter((s) => includeDemo || !s.demo)
  const vs = surveys.filter((v) => includeDemo || !demoIds.has(v.sessionId))
  const done = ss.filter((s) => s.completed)

  const byFurthestStep = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  ss.filter((s) => !s.completed).forEach((s) => { byFurthestStep[s.furthestStep] = (byFurthestStep[s.furthestStep] ?? 0) + 1 })
  done.forEach((s) => { byFurthestStep[5] += 1 })

  const outcomes = { selfcare: 0, exam: 0, emergency: 0 }
  ss.forEach((s) => { if (s.outcome in outcomes) outcomes[s.outcome] += 1 })

  const avgByItem = Object.fromEntries(SURVEY_ITEMS.map((i) => [i.key, avg(vs.map((v) => Number(v.scores[i.key])).filter((n) => Number.isFinite(n)))]))
  const satisfied = vs.filter((v) => satisfactionMean(v.scores) >= 4).length

  return {
    started: ss.length,
    completed: done.length,
    completionRate: ss.length ? (done.length / ss.length) * 100 : 0,
    avgDurationSec: avg(done.map((s) => (s.durationMs ?? 0) / 1000)),
    byFurthestStep,
    outcomes,
    surveyCount: vs.length,
    avgByItem,
    satisfiedPct: vs.length ? (satisfied / vs.length) * 100 : 0,
    obstacles: vs.map((v) => v.obstacles).filter(Boolean),
    comments: vs.map((v) => v.comment).filter(Boolean),
  }
}

const csvCell = (v) => {
  const t = v === null || v === undefined ? '' : String(v)
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
}

export function toCsv(headers, rows) {
  return `﻿${[headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`
}

export function sessionsCsv(sessions) {
  return toCsv(
    ['รหัส', 'เริ่มเมื่อ', 'กรณีสาธิต', 'ขั้นสุดท้ายที่ไปถึง', 'ทำครบ', 'ระยะเวลา(วินาที)', 'ผลลัพธ์', 'ตำแหน่ง', 'NRS'],
    sessions.map((s) => [s.id, new Date(s.startedAt).toISOString(), s.demo ? 'ใช่' : '', s.furthestStep, s.completed ? 'ใช่' : '', s.durationMs == null ? '' : Math.round(s.durationMs / 1000), s.outcome ?? '', s.position ?? '', s.nrs ?? '']),
  )
}

export function surveysCsv(surveys) {
  return toCsv(
    ['รหัส', 'รหัสการใช้งาน', 'เวลา', ...SURVEY_ITEMS.map((i) => i.label), 'ข้อเสนอแนะ', 'อุปสรรคที่พบ'],
    surveys.map((v) => [v.id, v.sessionId ?? '', new Date(v.at).toISOString(), ...SURVEY_ITEMS.map((i) => v.scores[i.key] ?? ''), v.comment, v.obstacles]),
  )
}

// ---------- ที่เก็บข้อมูล (ล้มเหลวเงียบ ๆ ได้ เช่น โหมดส่วนตัว) ----------
function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* เก็บไม่ได้ ก็ใช้งานเว็บต่อได้ตามปกติ */
  }
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
let lastSessionId = null

export const getSessions = () => read(K_SESS)
export const getSurveys = () => read(K_SURV)
export const getLastSessionId = () => lastSessionId

export function startSession({ demo = false } = {}) {
  const id = uid()
  lastSessionId = id
  write(K_SESS, [...getSessions(), { id, startedAt: Date.now(), demo, furthestStep: 1, completed: false, durationMs: null, outcome: null, position: null, nrs: null }])
  return id
}

export function updateSession(id, patch) {
  if (!id) return
  const list = getSessions()
  const i = list.findIndex((s) => s.id === id)
  if (i < 0) return
  const cur = list[i]
  const next = { ...cur, ...patch }
  next.furthestStep = Math.max(cur.furthestStep, patch.furthestStep ?? 0)
  if (next.furthestStep >= 5 && !cur.completed) {
    next.completed = true
    next.durationMs = Date.now() - cur.startedAt
  }
  list[i] = next
  write(K_SESS, list)
}

export function saveSurvey({ sessionId, scores, comment, obstacles }) {
  write(K_SURV, [...getSurveys(), { id: uid(), sessionId: sessionId ?? null, at: Date.now(), scores, comment: comment.trim(), obstacles: obstacles.trim() }])
}

export function clearAll() {
  write(K_SESS, [])
  write(K_SURV, [])
}
