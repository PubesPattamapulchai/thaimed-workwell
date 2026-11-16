import content from '../content.generated.json'
import { getAskRules } from '../engine/assess.js'
import Icon from './Icon.jsx'
import Img from './Img.jsx'
import Rail from './Rail.jsx'

// ลำดับตามภาพตัวอย่างในเอกสาร: มี / ไม่มี / ไม่แน่ใจ
const CHOICES = [
  ['yes', 'มี'],
  ['no', 'ไม่มี'],
  ['unsure', 'ไม่แน่ใจ'],
]

export default function Step3({ state, patch, onNext, onBack }) {
  const rules = getAskRules(content)
  const ready = rules.every((r) => state.yes[r.id])
  const position = content.positions.find((p) => p.id === state.position)
  const left = rules.filter((r) => !state.yes[r.id]).length

  return (
    <section className="panel">
      <header className="panel-head">
        <Icon name="clipboard" size={38} className="panel-icon" />
        <div>
          <h2>คัดกรองความเสี่ยงก่อนรับคำแนะนำ</h2>
          <p>สำหรับอาการปวด{position?.label ?? ''} กรุณาตอบคำถามตามความเป็นจริง เพื่อประเมินความเหมาะสมในการรับคำแนะนำดูแลตนเอง</p>
        </div>
      </header>

      <div className="with-rail">
        <Rail state={state} label="ตำแหน่งที่ประเมิน" />
        <div className="q-list">
          {rules.map((r, i) => (
            <fieldset key={r.id} className="question screen-row">
              <legend className="sr-only">{r.text}</legend>
              <span className="q-num" aria-hidden="true">{i + 1}</span>
              <Img file={`screen-${r.id}.png`} label="ภาพประกอบ" className="thumb compact" />
              <p className="q-text">{r.text}</p>
              <div className="seg" role="radiogroup" aria-label={r.text}>
                {CHOICES.map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={state.yes[r.id] === v}
                    className={`opt v-${v}${state.yes[r.id] === v ? ' on' : ''}`}
                    onClick={() => patch((s) => ({ yes: { ...s.yes, [r.id]: v } }))}
                  >
                    <span className="mark" aria-hidden="true">{state.yes[r.id] === v ? <i /> : null}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          <div className="next-note">
            <Icon name="shield" size={40} className="note-icon" />
            <div>
              <strong>ผลการคัดกรองจะช่วยให้ระบบแสดงคำแนะนำที่เหมาะสมและปลอดภัยสำหรับคุณ</strong>
              <p>หากตอบว่า “มี” หรือ “ไม่แน่ใจ” ในข้อใดข้อหนึ่ง ระบบจะแนะนำให้เข้ารับการประเมินจากบุคลากรทางการแพทย์ก่อน</p>
            </div>
          </div>
        </div>
      </div>

      <div className="actions center">
        <button type="button" className="btn" onClick={onBack}><Icon name="chevronLeft" size={18} strokeWidth={2.6} /> ย้อนกลับ</button>
        <button type="button" className="btn primary" disabled={!ready} onClick={onNext}>
          รับคำแนะนำ <Icon name="chevronRight" size={20} strokeWidth={2.6} />
        </button>
      </div>
      {!ready ? <p className="hint center">ยังเหลืออีก {left} ข้อ</p> : null}
    </section>
  )
}
