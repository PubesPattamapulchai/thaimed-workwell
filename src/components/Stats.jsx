import { useMemo, useState } from 'react'
import { SURVEY_ITEMS, clearAll, getSessions, getSurveys, sessionsCsv, summarize, surveysCsv } from '../store/stats.js'
import { STEP_NAMES } from './Wizard.jsx'

const OUTCOME_LABEL = { selfcare: 'ดูแลตนเอง', exam: 'ควรตรวจเพิ่มเติม', emergency: 'ฉุกเฉิน' }

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function Stats() {
  const [tick, setTick] = useState(0)
  const [includeDemo, setIncludeDemo] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sessions = useMemo(getSessions, [tick])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const surveys = useMemo(getSurveys, [tick])
  const r = summarize(sessions, surveys, { includeDemo })
  const f1 = (n) => n.toFixed(1)

  return (
    <div className="stack">
      <section className="panel">
        <h2>สรุปสถิติการใช้งาน (เครื่องนี้)</h2>
        <p className="muted">
          เก็บแบบไม่ระบุตัวตนในเบราว์เซอร์ของเครื่องนี้เท่านั้น ต้นแบบนี้รวมข้อมูลข้ามเครื่องไม่ได้
          (หากต้องการรวมข้อมูลจากอาสาสมัครหลายเครื่อง ให้ส่งออก CSV จากแต่ละเครื่อง)
        </p>
        <label className="inline-check">
          <input type="checkbox" checked={includeDemo} onChange={(e) => setIncludeDemo(e.target.checked)} /> นับรวมการใช้งานกรณีสาธิต
        </label>

        <div className="kpis">
          <div className="kpi"><b>{r.started}</b><span>เริ่มใช้งาน</span></div>
          <div className="kpi"><b>{r.completed}</b><span>ทำครบ 5 ขั้น</span></div>
          <div className="kpi"><b>{f1(r.completionRate)}%</b><span>อัตราทำครบ</span></div>
          <div className="kpi"><b>{f1(r.avgDurationSec)} วิ</b><span>เวลาเฉลี่ยของผู้ทำครบ</span></div>
          <div className="kpi"><b>{r.surveyCount}</b><span>ผู้ตอบแบบประเมิน</span></div>
          <div className="kpi"><b>{f1(r.satisfiedPct)}%</b><span>พึงพอใจระดับมาก (≥ 4)</span></div>
        </div>
      </section>

      <section className="panel">
        <h3>ขั้นสุดท้ายที่ผู้ใช้ไปถึง</h3>
        <table className="table">
          <tbody>
            {STEP_NAMES.map((n, i) => (
              <tr key={n}><td>ขั้นที่ {i + 1} {n}</td><td>{r.byFurthestStep[i + 1] ?? 0} ครั้ง</td></tr>
            ))}
          </tbody>
        </table>
        <h3>ผลลัพธ์ที่ระบบแสดง</h3>
        <table className="table">
          <tbody>
            {Object.entries(OUTCOME_LABEL).map(([k, label]) => (
              <tr key={k}><td>{label}</td><td>{r.outcomes[k]} ครั้ง</td></tr>
            ))}
          </tbody>
        </table>
        <h3>ค่าเฉลี่ยความพึงพอใจ (1–5)</h3>
        <table className="table">
          <tbody>
            {SURVEY_ITEMS.map((i) => (
              <tr key={i.key}><td>{i.label}</td><td>{r.surveyCount ? r.avgByItem[i.key].toFixed(2) : '-'}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h3>อุปสรรคที่พบ ({r.obstacles.length})</h3>
        {r.obstacles.length ? <ul>{r.obstacles.map((t, i) => <li key={i}>{t}</li>)}</ul> : <p className="muted">ยังไม่มี</p>}
        <h3>ข้อเสนอแนะ ({r.comments.length})</h3>
        {r.comments.length ? <ul>{r.comments.map((t, i) => <li key={i}>{t}</li>)}</ul> : <p className="muted">ยังไม่มี</p>}
      </section>

      <section className="panel actions-col">
        <button type="button" className="btn" onClick={() => download('twws-sessions.csv', sessionsCsv(sessions))}>ส่งออกการใช้งาน (CSV)</button>
        <button type="button" className="btn" onClick={() => download('twws-surveys.csv', surveysCsv(surveys))}>ส่งออกแบบประเมิน (CSV)</button>
        {confirmClear ? (
          <span className="confirm">
            ลบข้อมูลทั้งหมดในเครื่องนี้ถาวร?{' '}
            <button type="button" className="btn danger" onClick={() => { clearAll(); setConfirmClear(false); setTick((t) => t + 1) }}>ลบเลย</button>{' '}
            <button type="button" className="btn" onClick={() => setConfirmClear(false)}>ยกเลิก</button>
          </span>
        ) : (
          <button type="button" className="btn" onClick={() => setConfirmClear(true)}>ล้างข้อมูลในเครื่องนี้</button>
        )}
      </section>
    </div>
  )
}





