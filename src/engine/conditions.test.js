import { describe, it, expect } from 'vitest'
import { parseCondition, evaluateCondition } from './conditions.js'

const ctx = (nrs, ...flags) => ({ nrs, flags: new Set(flags) })

describe('evaluateCondition', () => {
  it('flag: จริงเมื่อมี flag นั้น', () => {
    expect(evaluateCondition('flag:numbness', ctx(3, 'numbness'))).toBe(true)
    expect(evaluateCondition('flag:numbness', ctx(3, 'other'))).toBe(false)
  })

  it('เปรียบเทียบคะแนน NRS ได้ครบทุกตัวดำเนินการ', () => {
    expect(evaluateCondition('nrs>=7', ctx(7))).toBe(true)
    expect(evaluateCondition('nrs>=7', ctx(6))).toBe(false)
    expect(evaluateCondition('nrs>7', ctx(7))).toBe(false)
    expect(evaluateCondition('nrs<=2', ctx(2))).toBe(true)
    expect(evaluateCondition('nrs<2', ctx(2))).toBe(false)
    expect(evaluateCondition('nrs=5', ctx(5))).toBe(true)
  })

  it('NRS ที่ยังไม่ได้เลือก (null) ทำให้เงื่อนไข nrs ไม่เป็นจริง', () => {
    expect(evaluateCondition('nrs>=7', ctx(null))).toBe(false)
  })

  it('| คือหรือ และ & คือและ (& ผูกแน่นกว่า |)', () => {
    expect(evaluateCondition('flag:a|flag:b', ctx(0, 'b'))).toBe(true)
    expect(evaluateCondition('flag:a&flag:b', ctx(0, 'b'))).toBe(false)
    expect(evaluateCondition('flag:a&nrs>=5|flag:z', ctx(6, 'a'))).toBe(true)
    expect(evaluateCondition('flag:a&nrs>=5|flag:z', ctx(4, 'a'))).toBe(false)
    expect(evaluateCondition('flag:a&nrs>=5|flag:z', ctx(4, 'z'))).toBe(true)
  })

  it('ยอมรับช่องว่างและตัวพิมพ์ใหญ่', () => {
    expect(evaluateCondition(' NRS >= 7 | FLAG: Numbness ', ctx(8))).toBe(true)
    expect(evaluateCondition(' NRS >= 7 | FLAG: Numbness ', ctx(1, 'numbness'))).toBe(true)
  })
})

describe('parseCondition', () => {
  it('โยนข้อผิดพลาดภาษาไทยเมื่อเงื่อนไขไม่ถูกต้อง', () => {
    expect(() => parseCondition('')).toThrow(/เงื่อนไข/)
    expect(() => parseCondition('abc')).toThrow(/เงื่อนไข/)
    expect(() => parseCondition('nrs>=x')).toThrow(/เงื่อนไข/)
    expect(() => parseCondition('flag:')).toThrow(/เงื่อนไข/)
  })
})
