import { describe, it, expect, beforeAll } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import content from './content.generated.json'
import { emptyState, stateFromDemo, assess } from './engine/assess.js'
import Home from './components/Home.jsx'
import Wizard from './components/Wizard.jsx'
import Step1 from './components/Step1.jsx'
import Step2 from './components/Step2.jsx'
import Step3 from './components/Step3.jsx'
import Step4 from './components/Step4.jsx'
import Services from './components/Services.jsx'
import Survey from './components/Survey.jsx'
import About from './components/About.jsx'
import Stats from './components/Stats.jsx'
import App from './App.jsx'
import Img from './components/Img.jsx'

const html = (el) => renderToStaticMarkup(el)
const noop = () => {}

beforeAll(() => {
  globalThis.window = { location: { hash: '' }, addEventListener: noop, removeEventListener: noop, scrollTo: noop }
})

describe('ทุกหน้าแสดงผลได้ไม่ error', () => {
  it('หน้าแรก: มีปุ่มกรณีสาธิตครบทุกกรณี', () => {
    const out = html(<Home />)
    for (const d of content.demoCases) expect(out).toContain(`#/assess/${d.id}`)
  })

  it('App (เมนู + ป้ายระบบต้นแบบ)', () => {
    const out = html(<App />)
    expect(out).toContain('ระบบต้นแบบ')
    expect(out).toContain('ThaiMed WorkWell')
  })

  it('ขั้น 1: มี 4 ตำแหน่งและปุ่ม NRS 0–10', () => {
    const out = html(<Step1 state={emptyState()} patch={noop} onNext={noop} />)
    for (const p of content.positions) expect(out).toContain(p.label)
    expect((out.match(/class="nrs-btn/g) ?? []).length).toBe(11)
  })

  it('ขั้น 2 และ 3 แสดงคำถามทั้งหมด', () => {
    const s2 = html(<Step2 state={emptyState()} patch={noop} onNext={noop} onBack={noop} />)
    for (const q of content.symptomQuestions) expect(s2).toContain(q.text)
    expect(s2).toContain('ลักษณะงาน')
    const s3 = html(<Step3 state={emptyState()} patch={noop} onNext={noop} onBack={noop} />)
    for (const r of content.rules.filter((x) => x.kind === 'ask')) expect(s3).toContain(r.text.slice(0, 20))
  })

  it('หน่วยบริการ, แบบประเมิน, เกี่ยวกับ, สถิติ', () => {
    expect(html(<Services standalone />)).toContain('พบหน่วยบริการ')
    expect(html(<Services standalone />)).toContain('ข้อมูลจำลอง')
    expect(html(<Survey />)).toContain('แบบประเมินความพึงพอใจ')
    // ปุ่มดาวน์โหลดแสดงเฉพาะเมื่อมีไฟล์ public/docs/proposal.docx ตอน build (ใน CI/repo ไม่มีไฟล์นี้)
    expect(html(<About />).includes('proposal.docx')).toBe(__HAS_PROPOSAL__)
    expect(html(<Stats />)).toContain('ทำครบ')
  })

  // หมายเหตุ: การสลับเป็นกรอบเมื่อไฟล์รูปโหลดไม่ได้ (onError) เกิดเฉพาะในเบราว์เซอร์ ทดสอบฝั่งเซิร์ฟเวอร์ไม่ได้
  it('ช่องรูป: ไม่ระบุชื่อไฟล์ → กรอบ "ใส่รูปที่นี่"; ระบุชื่อไฟล์ → อ้าง images/<ชื่อไฟล์>', () => {
    expect(html(<Img label="ภาพท่า" />)).toContain('ใส่รูปที่นี่')
    const out = html(<Services standalone />)
    expect(out).toContain('src="./images/service-sv1.jpg"')
  })
})

describe('กรณีสาธิตผ่านหน้าจอจริง (ขั้น 4)', () => {
  it('กรณี 1: ดูแลตนเอง แสดงท่าแก้เกียจ + เคล็ดลับตามลักษณะงาน', () => {
    const out = html(<Wizard demoId="demo1" />)
    expect(out).toContain('ท่าแก้เกียจ')
    expect(out).toContain('ท่าฤๅษีดัดตน:')
    expect(out).toContain(content.workTypes[0].tips[0])
  })

  it('กรณี 2: ตรวจเพิ่มเติม ไม่แสดงท่า', () => {
    const out = html(<Wizard demoId="demo2" />)
    expect(out).toContain('ควรรับการตรวจเพิ่มเติมก่อนเลือกท่า')
    expect(out).not.toContain('ท่าฤๅษีดัดตน:')
    expect(out).not.toContain('ท่าแก้เกียจ')
    expect(out).toContain('ระบบไม่แสดงท่าฤๅษีดัดตน')
  })

  it('กรณี 3: ฉุกเฉิน มีปุ่มโทร 1669 และไม่แสดงท่า', () => {
    const out = html(<Wizard demoId="demo3" />)
    expect(out).toContain('tel:1669')
    expect(out).not.toContain('ท่าฤๅษีดัดตน:')
  })

  it('Step4 ไม่เคยแสดงท่าเมื่อผลไม่ใช่ดูแลตนเอง (ทุกกรณี)', () => {
    for (const d of content.demoCases) {
      const state = stateFromDemo(content, d)
      const result = assess(content, state)
      const out = html(<Step4 state={state} result={result} onNext={noop} onBack={noop} />)
      expect(out.includes('ท่าฤๅษีดัดตน:')).toBe(result.level === 'selfcare')
    }
  })

  it('ไม่ระบุกรณีสาธิต: เริ่มที่ขั้น 1 พร้อมตัวบอกขั้น 5 ขั้น', () => {
    const out = html(<Wizard />)
    expect(out).toContain('กรุณาเลือกบริเวณที่มีอาการปวดมากที่สุด')
    expect((out.match(/class="num"/g) ?? []).length).toBe(5)
  })
})


