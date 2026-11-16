import content from '../content.generated.json'
import { getStep2Questions, toggleMulti } from '../engine/assess.js'
import Icon from './Icon.jsx'
import Rail from './Rail.jsx'

const answered = (v) => (Array.isArray(v) ? v.length > 0 : Boolean(v))
const ROW_ICONS = ['calendar', 'clipboard', 'laptop', 'bars']

export default function Step2({ state, patch, onNext, onBack }) {
  const questions = getStep2Questions(content)
  const ready = questions.every((q) => answered(state.symptoms[q.id]))
  const position = content.positions.find((p) => p.id === state.position)
  const choose = (q, optionId) =>
    patch((s) => ({
      symptoms: { ...s.symptoms, [q.id]: q.type === 'multi' ? toggleMulti(q, s.symptoms[q.id], optionId) : optionId },
    }))

  return (
    <section className="panel">
      <header className="panel-head">
        <Icon name="clipboard" size={38} className="panel-icon" />
        <div>
          <h2>ประเมินรายละเอียดอาการปวด{position?.label ?? ''}</h2>
          <p>กรุณาตอบคำถามเพิ่มเติม เพื่อให้ระบบแสดงคำแนะนำที่เหมาะสมกับคุณ</p>
        </div>
      </header>

      <div className="with-rail">
        <Rail state={state} />
        <div className="q-list">
          {questions.map((q, i) => {
            const multi = q.type === 'multi'
            const cur = state.symptoms[q.id]
            return (
              <fieldset key={q.id} className="question q-row">
                <legend>
                  <Icon name={ROW_ICONS[i % ROW_ICONS.length]} size={26} className="q-icon" />
                  <span>{i + 1}. {q.text}</span>
                </legend>
                <div className="pill-opts">
                  {q.options.map((o) => {
                    const on = multi ? (cur ?? []).includes(o.id) : cur === o.id
                    return (
                      <button
                        key={o.id}
                        type="button"
                        role={multi ? 'checkbox' : 'radio'}
                        aria-checked={on}
                        className={`opt${on ? ' on' : ''}${multi ? ' box' : ''}`}
                        onClick={() => choose(q, o.id)}
                      >
                        <span className="mark" aria-hidden="true">{on ? (multi ? <Icon name="check" size={14} strokeWidth={3.4} /> : <i />) : null}</span>
                        <span>{o.label}</span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )
          })}

          <div className="next-note">
            <Icon name="shield" size={40} className="note-icon" />
            <div>
              <strong>ขั้นตอนถัดไป: คัดกรองอาการอันตราย</strong>
              <p>ระบบจะสอบถามอาการที่สำคัญเพิ่มเติม เช่น ประวัติการบาดเจ็บ อาการชา หรืออ่อนแรง เพื่อตรวจสอบความปลอดภัยก่อนให้คำแนะนำ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="actions center">
        <button type="button" className="btn" onClick={onBack}><Icon name="chevronLeft" size={18} strokeWidth={2.6} /> ย้อนกลับ</button>
        <button type="button" className="btn primary" disabled={!ready} onClick={onNext}>
          ถัดไป: คัดกรองความเสี่ยง <Icon name="chevronRight" size={20} strokeWidth={2.6} />
        </button>
      </div>
      {!ready ? <p className="hint center">ตอบให้ครบทุกข้อเพื่อไปต่อ</p> : null}
    </section>
  )
}
