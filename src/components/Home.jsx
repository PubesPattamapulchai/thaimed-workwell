import content from '../content.generated.json'
import Icon from './Icon.jsx'
import { HeroFigure } from './BodyPicker.jsx'

const STEPS = ['เลือกตำแหน่งปวด', 'ประเมินอาการ', 'คัดกรองความเสี่ยง', 'รับคำแนะนำ', 'หน่วยบริการใกล้บ้าน']
const LEVEL_ICON = { selfcare: 'activity', exam: 'stethoscope', emergency: 'warning' }

export default function Home() {
  return (
    <div className="stack">
      <section className="panel hero">
        <HeroFigure positions={content.positions} />
        <div className="hero-text">
          <h1>ประเมินเบื้องต้นอย่างปลอดภัย เรียนรู้ท่าฤๅษีดัดตน และเข้าถึงบริการใกล้บ้าน</h1>
          <p>
            ตอบคำถามสั้น ๆ เกี่ยวกับอาการปวดคอ บ่า หรือหลัง ระบบจะคัดกรองข้อควรระวังก่อนทุกครั้ง แล้วแสดงคำแนะนำการดูแลตนเอง
            หรือแนะนำให้เข้ารับการตรวจ ใช้งานได้ทันทีโดยไม่ต้องสมัครสมาชิก และไม่เก็บข้อมูลที่ระบุตัวบุคคล
          </p>
          <a className="btn primary big" href="#/assess">เริ่มประเมินอาการ <Icon name="chevronRight" size={20} strokeWidth={2.6} /></a>
        </div>
        <ol className="steps-overview" aria-label="5 ขั้นตอนของระบบ">
          {STEPS.map((s, i) => (
            <li key={s}><span className="num">{i + 1}</span>{s}</li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <header className="panel-head">
          <Icon name="clipboard" size={34} className="panel-icon" />
          <div>
            <h2>กรณีสาธิตสำหรับกรรมการ</h2>
            <p>กดแล้วระบบกรอกคำตอบให้อัตโนมัติและแสดงผลทันที ย้อนกลับไปดูคำตอบแต่ละขั้นได้</p>
          </div>
        </header>
        <div className="demo-grid">
          {content.demoCases.map((d) => (
            <a key={d.id} className={`demo-card lv-${d.expectedLevel}`} href={`#/assess/${d.id}`}>
              <Icon name={LEVEL_ICON[d.expectedLevel]} size={30} className="demo-icon" />
              <strong>{d.title}</strong>
              <span>{d.scenario}</span>
              <small>คาดว่าจะ: {d.expectedText}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="quick-links">
        <a className="btn" href="#/services"><Icon name="pin" size={20} /> ค้นหาหน่วยบริการแพทย์แผนไทย</a>
        <a className="btn" href="#/survey"><Icon name="heart" size={20} /> ทำแบบประเมินความพึงพอใจ</a>
        <a className="btn" href="#/about"><Icon name="info" size={20} /> เกี่ยวกับต้นแบบนี้</a>
      </section>
    </div>
  )
}
