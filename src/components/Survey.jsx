import { useState } from 'react'
import { SURVEY_ITEMS, getLastSessionId, saveSurvey } from '../store/stats.js'

const LEVELS = [
  [1, 'น้อยที่สุด'],
  [2, 'น้อย'],
  [3, 'ปานกลาง'],
  [4, 'มาก'],
  [5, 'มากที่สุด'],
]

export default function Survey() {
  const [scores, setScores] = useState({})
  const [comment, setComment] = useState('')
  const [obstacles, setObstacles] = useState('')
  const [done, setDone] = useState(false)
  const ready = SURVEY_ITEMS.every((i) => scores[i.key])

  if (done) {
    return (
      <section className="panel center">
        <h2>ขอบคุณสำหรับความคิดเห็น</h2>
        <p className="muted">บันทึกแบบไม่ระบุตัวตนในเครื่องนี้เรียบร้อยแล้ว</p>
        <a className="btn primary" href="#/">กลับหน้าหลัก</a>
      </section>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    if (!ready) return
    saveSurvey({ sessionId: getLastSessionId(), scores, comment, obstacles })
    setDone(true)
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2>แบบประเมินความพึงพอใจ</h2>
      <p className="muted">เลือกระดับความพึงพอใจ 1–5 ในแต่ละข้อ (ไม่ต้องระบุชื่อ)</p>

      {SURVEY_ITEMS.map((item) => (
        <fieldset key={item.key} className="question">
          <legend>{item.label}</legend>
          <div className="options row" role="radiogroup" aria-label={item.label}>
            {LEVELS.map(([n, label]) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={scores[item.key] === n}
                className={`opt scale${scores[item.key] === n ? ' on' : ''}`}
                onClick={() => setScores((cur) => ({ ...cur, [item.key]: n }))}
              >
                <strong>{n}</strong>
                <small>{label}</small>
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <label className="field">
        <span>ข้อเสนอแนะ (ไม่บังคับ)</span>
        <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} />
      </label>
      <label className="field">
        <span>อุปสรรคหรือจุดที่ใช้งานยาก (ไม่บังคับ)</span>
        <textarea rows="3" value={obstacles} onChange={(e) => setObstacles(e.target.value)} />
      </label>

      <div className="actions">
        <a className="btn" href="#/">ยกเลิก</a>
        <button type="submit" className="btn primary" disabled={!ready}>ส่งแบบประเมิน</button>
      </div>
    </form>
  )
}

