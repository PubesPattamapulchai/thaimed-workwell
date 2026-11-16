import content from '../content.generated.json'
import { adviceForGroup, getStep2Questions, poseForGroup, workTipsFor, WORK_QUESTION_ID } from '../engine/assess.js'
import Icon from './Icon.jsx'
import Img from './Img.jsx'

const LEVEL_LABEL = { selfcare: 'ไม่พบสัญญาณผิดปกติ', exam: 'ควรตรวจเพิ่มเติม', emergency: 'พบสัญญาณฉุกเฉิน' }
const LEVEL_ICON = { selfcare: 'shield', exam: 'stethoscope', emergency: 'warning' }

// ข้อความขั้นตอนรูปแบบ "ชื่อขั้น: วิธีทำ" → ชื่อขั้นเป็นตัวหนา (ตามภาพตัวอย่างท่าแก้ลมปัตฆาต)
function StepText({ text }) {
  const i = text.indexOf(': ')
  if (i > 0 && i <= 16) return <p><strong className="step-name">{text.slice(0, i)}</strong>{text.slice(i + 2)}</p>
  return <p>{text}</p>
}

function labelOf(q, value) {
  const ids = Array.isArray(value) ? value : [value]
  return ids.map((id) => q.options.find((o) => o.id === id)?.label).filter(Boolean).join(', ')
}

export default function Step4({ state, result, onNext, onBack }) {
  const position = content.positions.find((p) => p.id === state.position)
  const group = position?.group
  const outcome = content.outcomes.find((o) => o.level === result.level)
  const advice = group ? adviceForGroup(content, group) : null
  const pose = group ? poseForGroup(content, group) : null
  const workId = state.symptoms[WORK_QUESTION_ID]
  const workTips = workTipsFor(content, workId)
  const questions = getStep2Questions(content)
  const durationQ = questions.find((q) => q.id === 'q_duration')

  return (
    <section className="result">
      <aside className="summary" aria-label="สรุปข้อมูลของคุณ">
        <h3>สรุปข้อมูลของคุณ</h3>
        <ul>
          <li>
            <Icon name="user" size={28} className="s-icon" />
            <span className="s-label">ตำแหน่งที่มีอาการ</span>
            <span className="rail-pill">{position?.label ?? '-'}</span>
          </li>
          <li>
            <Icon name="gauge" size={28} className="s-icon" />
            <span className="s-label">ระดับความปวด</span>
            <span className="s-value"><b>{state.nrs ?? '-'}</b> / 10</span>
          </li>
          {durationQ ? (
            <li>
              <Icon name="calendar" size={28} className="s-icon" />
              <span className="s-label">ระยะเวลา</span>
              <span className="s-value sm">{labelOf(durationQ, state.symptoms[durationQ.id]) || '-'}</span>
            </li>
          ) : null}
          <li>
            <Icon name="laptop" size={28} className="s-icon" />
            <span className="s-label">ผลการคัดกรองเบื้องต้น</span>
            <span className={`chip lv-${result.level}`}>
              <Icon name={result.level === 'selfcare' ? 'check' : 'warning'} size={14} strokeWidth={2.8} />
              {LEVEL_LABEL[result.level]}
            </span>
          </li>
        </ul>
      </aside>

      <div className="result-main">
        <div className={`outcome lv-${result.level}`}>
          <Icon name={LEVEL_ICON[result.level]} size={44} className="outcome-icon" />
          <div>
            <h2>{outcome?.title}</h2>
            <p>{outcome?.message}</p>
            {result.reasons.length ? (
              <>
                <h4>เหตุผลที่ระบบแจ้งเตือน</h4>
                <ul className="reasons">{result.reasons.map((r) => <li key={r.id}>{r.reason}</li>)}</ul>
              </>
            ) : null}
            {result.level === 'emergency' ? (
              <a className="btn danger" href="tel:1669"><Icon name="phone" size={20} /> โทร 1669 (เหตุฉุกเฉิน)</a>
            ) : null}
            {!result.showPoses ? <p className="notice"><Icon name="info" size={18} /> ระบบไม่แสดงท่าฤๅษีดัดตนในกรณีนี้ เพื่อความปลอดภัย</p> : null}
          </div>
        </div>

        {result.showPoses ? (
          <div className="advice-layout">
            <div className="panel advice">
              <header className="panel-head">
                <Icon name="clipboard" size={38} className="panel-icon" />
                <div>
                  <h2>{advice?.title ?? 'คำแนะนำการดูแลตนเอง'}</h2>
                  {advice?.intro ? <p>{advice.intro}</p> : null}
                </div>
              </header>

              {pose ? (
                <div className="pose">
                  <div className="pose-banner">
                    <span className="pose-title"><Icon name="activity" size={22} /> ท่าฤๅษีดัดตน: {pose.name}</span>
                    {pose.summary ? <span className="pose-sum">{pose.summary}</span> : null}
                  </div>
                  <ol className="pose-steps">
                    {pose.steps.map((st) => (
                      <li key={st.n}>
                        <span className="step-badge">{st.n}</span>
                        <Img file={st.image} label={`ภาพท่าขั้นที่ ${st.n}`} className="pose-img" />
                        <StepText text={st.text} />
                        {st.hold ? <small className="hold">{st.hold}</small> : null}
                      </li>
                    ))}
                  </ol>
                  {pose.rounds ? (
                    <p className="rounds"><Icon name="refresh" size={22} /> <strong>จำนวนรอบการบริหาร</strong><span>{pose.rounds}</span></p>
                  ) : null}
                  {pose.source ? <p className="src"><Icon name="book" size={16} /> อ้างอิง: {pose.source}</p> : null}
                </div>
              ) : (
                <p className="notice"><Icon name="info" size={18} /> ขณะนี้ระบบต้นแบบยังไม่มีท่าฤๅษีดัดตนสำหรับตำแหน่งนี้ หากต้องการท่าบริหาร ควรปรึกษาแพทย์แผนไทย</p>
              )}
            </div>

            <div className="advice-side">
              {advice?.behaviours.length || workTips.length ? (
                <div className="tips">
                  <h3><Icon name="user" size={22} /> การปรับพฤติกรรม</h3>
                  <ul>
                    {advice?.behaviours.map((t) => <li key={t}><Icon name="check" size={18} strokeWidth={3} />{t}</li>)}
                  </ul>
                  {workTips.length ? (
                    <>
                      <h4 className="tips-sub">ตามลักษณะงานของคุณ</h4>
                      <ul>
                        {workTips.map((t) => <li key={t} className="work-tip"><Icon name="check" size={18} strokeWidth={3} />{t}</li>)}
                      </ul>
                    </>
                  ) : null}
                </div>
              ) : null}
              {advice?.cautions.length ? (
                <div className="caution">
                  <h3><Icon name="warning" size={22} /> ข้อควรระวัง</h3>
                  <ul>{advice.cautions.map((t) => <li key={t}><span className="dot" />{t}</li>)}</ul>
                </div>
              ) : null}
              {advice?.followUp ? <p className="follow"><Icon name="calendar" size={20} /> {advice.followUp}</p> : null}
            </div>
          </div>
        ) : null}

        <div className="actions center">
          <button type="button" className="btn" onClick={onBack}><Icon name="chevronLeft" size={18} strokeWidth={2.6} /> ย้อนกลับ</button>
          <button type="button" className="btn primary" onClick={onNext}>
            <Icon name="pin" size={20} /> ดูหน่วยบริการใกล้บ้าน <Icon name="chevronRight" size={20} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </section>
  )
}




