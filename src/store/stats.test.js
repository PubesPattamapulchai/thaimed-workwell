import { describe, it, expect } from 'vitest'
import { summarize, toCsv, satisfactionMean } from './stats.js'

const sess = (over) => ({ id: 's', startedAt: 0, demo: false, furthestStep: 1, completed: false, durationMs: null, outcome: null, ...over })
const survey = (sessionId, scores, extra = {}) => ({ id: `v-${sessionId}`, sessionId, at: 0, scores, comment: '', obstacles: '', ...extra })
const all = (n) => ({ understand: n, easy: n, useful: n, overall: n })

describe('summarize', () => {
  const sessions = [
    sess({ id: 'a', furthestStep: 5, completed: true, durationMs: 60000, outcome: 'selfcare' }),
    sess({ id: 'b', furthestStep: 5, completed: true, durationMs: 120000, outcome: 'exam' }),
    sess({ id: 'c', furthestStep: 2 }),
    sess({ id: 'd', furthestStep: 4 }),
    sess({ id: 'demo', demo: true, furthestStep: 5, completed: true, durationMs: 1000, outcome: 'emergency' }),
  ]
  const surveys = [
    survey('a', all(5), { obstacles: 'ปุ่มเล็ก' }),
    survey('b', all(3), { comment: 'ดี' }),
    survey('demo', all(1)),
  ]

  it('ไม่นับกรณีสาธิตโดยปริยาย: เริ่ม/ทำครบ/อัตราทำครบ', () => {
    const r = summarize(sessions, surveys)
    expect(r.started).toBe(4)
    expect(r.completed).toBe(2)
    expect(r.completionRate).toBeCloseTo(50)
    expect(r.avgDurationSec).toBeCloseTo(90)
  })

  it('นับกรณีสาธิตเมื่อสั่ง includeDemo', () => {
    const r = summarize(sessions, surveys, { includeDemo: true })
    expect(r.started).toBe(5)
    expect(r.surveyCount).toBe(3)
  })

  it('ความพึงพอใจ: ค่าเฉลี่ยรายข้อ และร้อยละผู้ที่ค่าเฉลี่ย ≥ 4 (ระดับมากขึ้นไป)', () => {
    const r = summarize(sessions, surveys)
    expect(r.surveyCount).toBe(2)
    expect(r.avgByItem.overall).toBeCloseTo(4)
    expect(r.satisfiedPct).toBeCloseTo(50)
  })

  it('รวมอุปสรรคและความเห็นปลายเปิด', () => {
    const r = summarize(sessions, surveys)
    expect(r.obstacles).toEqual(['ปุ่มเล็ก'])
    expect(r.comments).toEqual(['ดี'])
  })

  it('นับขั้นสุดท้ายที่ไปถึง และผลลัพธ์', () => {
    const r = summarize(sessions, surveys)
    expect(r.byFurthestStep).toEqual({ 1: 0, 2: 1, 3: 0, 4: 1, 5: 2 })
    expect(r.outcomes).toEqual({ selfcare: 1, exam: 1, emergency: 0 })
  })

  it('ไม่มีข้อมูลเลย: ไม่หารด้วยศูนย์', () => {
    const r = summarize([], [])
    expect(r.started).toBe(0)
    expect(r.completionRate).toBe(0)
    expect(r.avgDurationSec).toBe(0)
    expect(r.satisfiedPct).toBe(0)
  })
})

describe('satisfactionMean', () => {
  it('เฉลี่ยทุกข้อ', () => {
    expect(satisfactionMean({ understand: 5, easy: 4, useful: 4, overall: 3 })).toBe(4)
  })
})

describe('toCsv', () => {
  it('ใส่ BOM, escape เครื่องหมายคำพูดและขึ้นบรรทัดใหม่', () => {
    const csv = toCsv(['ก', 'ข'], [['a"b', 'x\ny'], [1, null]])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv).toContain('"a""b","x\ny"')
    expect(csv.trim().endsWith('1,')).toBe(true)
  })
})
