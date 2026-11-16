import { useEffect, useMemo, useRef, useState } from 'react'
import content from '../content.generated.json'
import { assess, emptyState, stateFromDemo } from '../engine/assess.js'
import { startSession, updateSession } from '../store/stats.js'
import Step1 from './Step1.jsx'
import Step2 from './Step2.jsx'
import Step3 from './Step3.jsx'
import Step4 from './Step4.jsx'
import Services from './Services.jsx'
import Icon from './Icon.jsx'

export const STEP_NAMES = ['เลือกตำแหน่ง', 'ประเมินอาการ', 'คัดกรองความเสี่ยง', 'รับคำแนะนำ', 'หน่วยบริการ']

function Stepper({ step, onGo }) {
  return (
    <ol className="stepper" aria-label="ขั้นตอน">
      {STEP_NAMES.map((name, i) => {
        const n = i + 1
        const cls = n === step ? 'now' : n < step ? 'done' : ''
        return (
          <li key={name} className={cls} aria-current={n === step ? 'step' : undefined}>
            <button type="button" disabled={n >= step} onClick={() => onGo(n)}>
              <span className="num">{n < step ? <Icon name="check" size={15} strokeWidth={3} /> : n}</span>
              <span className="name">{name}</span>
            </button>
            {n < STEP_NAMES.length ? <Icon name="chevronRight" size={16} className="sep" /> : null}
          </li>
        )
      })}
    </ol>
  )
}

export default function Wizard({ demoId }) {
  const demo = demoId ? content.demoCases.find((d) => d.id === demoId) : null
  const [state, setState] = useState(() => (demo ? stateFromDemo(content, demo) : emptyState()))
  const initialStep = demo ? 4 : 1
  const [step, setStep] = useState(initialStep)
  const sessionId = useRef(null)

  if (sessionId.current === null) sessionId.current = startSession({ demo: Boolean(demo) })

  const result = useMemo(() => assess(content, state), [state])

  useEffect(() => {
    updateSession(sessionId.current, { furthestStep: step, ...(step >= 4 ? { outcome: result.level, position: state.position, nrs: state.nrs } : {}) })
  }, [step, result.level, state.position, state.nrs])

  // เลื่อนขึ้นบนสุดเฉพาะเมื่อ "เปลี่ยนขั้น" (ไม่เลื่อนทุกครั้งที่ตอบคำถาม)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  // ปุ่ม Back ของเบราว์เซอร์/Android ย้อนทีละขั้นภายในเว็บ ไม่ออกจากการประเมินแล้วเสียคำตอบ
  useEffect(() => {
    try { window.history.replaceState({ twStep: initialStep }, '') } catch { /* ไม่รองรับ ก็ใช้งานต่อได้ */ }
    const onPop = (e) => {
      const n = e.state?.twStep
      if (typeof n === 'number') setStep(n)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [initialStep])

  const goTo = (n) => {
    setStep(n)
    try { window.history.pushState({ twStep: n }, '') } catch { /* เช่นเดียวกัน */ }
  }

  // รับได้ทั้งออบเจ็กต์ และฟังก์ชัน (s) => ออบเจ็กต์ — ใช้แบบฟังก์ชันเมื่อค่าใหม่ขึ้นกับค่าเดิม กันเขียนทับกันเมื่อกดติดกัน
  const patch = (p) => setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) }))
  const next = () => goTo(Math.min(5, step + 1))
  const back = () => goTo(Math.max(1, step - 1))

  return (
    <div className="stack">
      <Stepper step={step} onGo={goTo} />
      {demo ? <div className="demo-note">กำลังแสดง{demo.title}: {demo.scenario}</div> : null}
      {step === 1 ? <Step1 state={state} patch={patch} onNext={next} /> : null}
      {step === 2 ? <Step2 state={state} patch={patch} onNext={next} onBack={back} /> : null}
      {step === 3 ? <Step3 state={state} patch={patch} onNext={next} onBack={back} /> : null}
      {step === 4 ? <Step4 state={state} result={result} onNext={next} onBack={back} /> : null}
      {step === 5 ? <Services result={result} onBack={back} sessionId={sessionId.current} /> : null}
    </div>
  )
}
