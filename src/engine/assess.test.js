import { describe, it, expect } from 'vitest'
import { sampleContent as content } from '../../scripts/sample-content.mjs'
import {
  assess, emptyState, stateFromDemo, getStep2Questions, getAskRules, toggleMulti, poseForGroup, workTipsFor,
} from './assess.js'

// ผู้ใช้ที่ตอบครบทุกข้อและไม่มีอาการเสี่ยง
function cleanState(over = {}) {
  const s = emptyState()
  s.position = 'shoulder'
  s.nrs = 3
  s.symptoms = { q_duration: 'd1', q_assoc: ['a_none'], q_work: 'w_office', q_impact: 'i1' }
  for (const r of getAskRules(content)) s.yes[r.id] = 'no'
  return { ...s, ...over }
}
const withYes = (id, v = 'yes') => {
  const s = cleanState()
  s.yes[id] = v
  return s
}

describe('กรณีสาธิตตามภาคผนวก ข', () => {
  for (const demo of content.demoCases) {
    it(`${demo.title}: ${demo.scenario} → ${demo.expectedLevel}`, () => {
      const result = assess(content, stateFromDemo(content, demo))
      expect(result.level).toBe(demo.expectedLevel)
    })
  }

  it('กรณี 3 ฉุกเฉินแม้ NRS เพียง 2/10 และไม่แสดงท่า', () => {
    const demo = content.demoCases.find((d) => d.id === 'demo3')
    const r = assess(content, stateFromDemo(content, demo))
    expect(demo.nrs).toBe(2)
    expect(r.showPoses).toBe(false)
    expect(r.reasons.map((x) => x.id)).toContain('r_bowel')
  })
})

describe('ลำดับความปลอดภัย', () => {
  it('ไม่พบสัญญาณ → ดูแลตนเอง แสดงท่า ไม่มีเหตุผล', () => {
    const r = assess(content, cleanState())
    expect(r.level).toBe('selfcare')
    expect(r.showPoses).toBe(true)
    expect(r.reasons).toEqual([])
  })

  it('NRS 6 ยังดูแลตนเอง แต่ NRS 7 ต้องตรวจเพิ่ม', () => {
    expect(assess(content, cleanState({ nrs: 6 })).level).toBe('selfcare')
    const r = assess(content, cleanState({ nrs: 7 }))
    expect(r.level).toBe('exam')
    expect(r.reasons.map((x) => x.id)).toContain('a_nrs')
  })

  it('ฉุกเฉินชนะตรวจเพิ่ม แม้พบทั้งสองอย่างพร้อมกัน', () => {
    const s = withYes('r_chest')
    s.nrs = 9
    const r = assess(content, s)
    expect(r.level).toBe('emergency')
    expect(r.reasons[0].level).toBe('emergency')
    expect(r.reasons.map((x) => x.id)).toEqual(expect.arrayContaining(['r_chest', 'a_nrs']))
  })

  it('ตอบ "ไม่แน่ใจ" ในคำถามคัดกรอง → ตรวจเพิ่ม (ข้อมูลไม่เพียงพอ) ไม่เลือกท่า', () => {
    const r = assess(content, withYes('r_weak', 'unsure'))
    expect(r.level).toBe('exam')
    expect(r.reasons.map((x) => x.id)).toContain('a_unsure')
    expect(r.showPoses).toBe(false)
  })

  it('ข้อมูลไม่ครบ (ยังไม่ได้เลือกคะแนนความปวด) → ตรวจเพิ่ม', () => {
    const r = assess(content, cleanState({ nrs: null }))
    expect(r.level).toBe('exam')
    expect(r.reasons.map((x) => x.id)).toContain('a_incomplete')
  })

  it('ข้อมูลไม่ครบ (ไม่ได้ตอบคำถามขั้น 2) → ตรวจเพิ่ม', () => {
    const s = cleanState()
    delete s.symptoms.q_duration
    expect(assess(content, s).level).toBe('exam')
  })

  it('ข้อมูลไม่ครบ (ไม่ได้ตอบคำถามขั้น 3) → ตรวจเพิ่ม', () => {
    const s = cleanState()
    delete s.yes.r_trauma
    expect(assess(content, s).level).toBe('exam')
  })

  it('คำถามเลือกหลายข้อที่ไม่ได้เลือกอะไรเลย ถือว่าไม่ครบ', () => {
    const s = cleanState()
    s.symptoms.q_assoc = []
    expect(assess(content, s).level).toBe('exam')
  })

  const examTriggers = [
    ['q_duration', 'd3', 'a_dur'],
    ['q_assoc', ['a_numb'], 'a_numb'],
    ['q_assoc', ['a_stiff', 'a_radiate'], 'a_radiate'],
  ]
  for (const [q, val, ruleId] of examTriggers) {
    it(`คำตอบ ${JSON.stringify(val)} ใน ${q} → ตรวจเพิ่ม (${ruleId})`, () => {
      const s = cleanState()
      s.symptoms[q] = val
      const r = assess(content, s)
      expect(r.level).toBe('exam')
      expect(r.reasons.map((x) => x.id)).toContain(ruleId)
    })
  }

  for (const rule of content.rules.filter((r) => r.kind === 'ask')) {
    it(`ตอบ "มี" ที่ ${rule.id} → ${rule.level}`, () => {
      expect(assess(content, withYes(rule.id)).level).toBe(rule.level)
    })
  }

  it('ทุกตำแหน่ง × NRS 0–10 × สัญญาณเสี่ยงทุกแบบ: ถ้าไม่ใช่ดูแลตนเองจะไม่แสดงท่าเลย', () => {
    let checked = 0
    for (const pos of content.positions) {
      for (let nrs = 0; nrs <= 10; nrs++) {
        for (const rule of [null, ...getAskRules(content)]) {
          const s = cleanState({ position: pos.id, nrs })
          if (rule) s.yes[rule.id] = 'yes'
          const r = assess(content, s)
          if (r.level !== 'selfcare') expect(r.showPoses).toBe(false)
          else expect(r.showPoses).toBe(true)
          checked++
        }
      }
    }
    expect(checked).toBeGreaterThanOrEqual(12)
  })
})

describe('พื้นความปลอดภัยที่ไม่ขึ้นกับข้อมูลใน Excel', () => {
  // ถ้าแถว a_unsure / a_incomplete ถูกลบออกจากชีต ระบบต้องไม่ตกไปเป็น "ดูแลตนเอง"
  const stripped = { ...content, rules: content.rules.filter((r) => !['a_unsure', 'a_incomplete'].includes(r.id)) }

  it('ตอบ "ไม่แน่ใจ" → อย่างน้อยตรวจเพิ่ม ไม่แสดงท่า แม้ไม่มีกฎ a_unsure', () => {
    const s = cleanState()
    s.yes.r_weak = 'unsure'
    const r = assess(stripped, s)
    expect(r.level).toBe('exam')
    expect(r.showPoses).toBe(false)
    expect(r.reasons.length).toBeGreaterThan(0)
  })

  it('ข้อมูลไม่ครบ → อย่างน้อยตรวจเพิ่ม ไม่แสดงท่า แม้ไม่มีกฎ a_incomplete', () => {
    for (const s of [cleanState({ nrs: null }), (() => { const x = cleanState(); delete x.yes.r_trauma; return x })()]) {
      const r = assess(stripped, s)
      expect(r.level).toBe('exam')
      expect(r.showPoses).toBe(false)
    }
  })

  it('ฉุกเฉินยังชนะ แม้ข้อมูลไม่ครบ', () => {
    const s = cleanState({ nrs: null })
    s.yes.r_bowel = 'yes'
    expect(assess(stripped, s).level).toBe('emergency')
  })
})

describe('เนื้อหาตามตำแหน่งและลักษณะงาน', () => {
  it('หลังส่วนบนและหลังส่วนล่างใช้ชุดเนื้อหา "หลัง" เดียวกัน', () => {
    const up = content.positions.find((p) => p.id === 'back_upper')
    const lo = content.positions.find((p) => p.id === 'back_lower')
    expect(up.group).toBe('back')
    expect(poseForGroup(content, up.group)).toBe(poseForGroup(content, lo.group))
  })

  it('เคล็ดลับตามลักษณะงานที่เลือก และ "อื่น ๆ" ไม่มีเคล็ดลับเฉพาะ', () => {
    expect(workTipsFor(content, 'w_office').length).toBeGreaterThan(0)
    expect(workTipsFor(content, 'w_other')).toEqual([])
  })

  it('คำถามขั้น 2 มีคำถามลักษณะงานที่สร้างจากชีตลักษณะงาน + ตัวเลือก "อื่น ๆ"', () => {
    const q = getStep2Questions(content).find((x) => x.id === 'q_work')
    expect(q.options.map((o) => o.id)).toEqual([...content.workTypes.map((w) => w.id), 'w_other'])
  })
})

describe('toggleMulti', () => {
  const q = content.symptomQuestions.find((x) => x.id === 'q_assoc')
  it('เลือกข้อ "ไม่มี" (exclusive) จะล้างข้ออื่น และเลือกข้ออื่นจะล้าง "ไม่มี"', () => {
    let v = toggleMulti(q, [], 'a_stiff')
    v = toggleMulti(q, v, 'a_numb')
    expect(v).toEqual(['a_stiff', 'a_numb'])
    v = toggleMulti(q, v, 'a_none')
    expect(v).toEqual(['a_none'])
    v = toggleMulti(q, v, 'a_stiff')
    expect(v).toEqual(['a_stiff'])
    v = toggleMulti(q, v, 'a_stiff')
    expect(v).toEqual([])
  })
})

