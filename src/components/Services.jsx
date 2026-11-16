import { useMemo, useState } from 'react'
import content from '../content.generated.json'
import Icon, { SERVICE_ICON } from './Icon.jsx'
import Img from './Img.jsx'

const DISTRICTS = [
  { name: 'บ้านแพ้ว', points: '3,4 43,3 45,36 38,50 5,46', lx: 8, ly: 45 },
  { name: 'กระทุ่มแบน', points: '47,3 97,5 95,22 49,22', lx: 50, ly: 20.5 },
  { name: 'เมืองสมุทรสาคร', points: '47,24 95,24 93,46 60,52 47,50', lx: 52, ly: 47.5 },
]

const svcIcon = (t) => SERVICE_ICON[t] ?? 'leaf'

function ServiceMap({ items, activeId, onPick }) {
  return (
    <svg className="svc-map" viewBox="0 0 100 62.5" role="group" aria-label="แผนที่แบบย่อของหน่วยบริการ (ไม่ใช่มาตราส่งจริง)">
      <rect x="0" y="0" width="100" height="62.5" className="map-bg" />
      <rect x="0" y="52" width="100" height="10.5" className="map-sea" />
      <text x="50" y="59.5" className="map-sea-label" textAnchor="middle">อ่าวไทย</text>
      {DISTRICTS.map((d) => (
        <g key={d.name}>
          <polygon points={d.points} className="map-district" />
          <text x={d.lx} y={d.ly} className="map-label">{d.name}</text>
        </g>
      ))}
      {items.map((v) => {
        const x = v.mapX
        const y = v.mapY * 0.625
        const on = v.id === activeId
        const s = on ? 0.85 : 0.62
        return (
          <g
            key={v.id}
            className={`pin${on ? ' on' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`เลือก ${v.name}`}
            onClick={() => onPick(v.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick(v.id))}
          >
            <path
              transform={`translate(${x} ${y}) scale(${s})`}
              d="M0 0 C -1 -1.6, -3.4 -3.3, -3.4 -5.6 A3.4 3.4 0 1 1 3.4 -5.6 C 3.4 -3.3, 1 -1.6, 0 0 Z"
            />
            <path transform={`translate(${x} ${y}) scale(${s})`} d="M-1.5 -5.6 h3 M0 -7.1 v3" className="pin-plus" />
          </g>
        )
      })}
    </svg>
  )
}

export default function Services({ standalone = false, result, onBack }) {
  const [q, setQ] = useState('')
  const [district, setDistrict] = useState('')
  const [types, setTypes] = useState([])
  const [activeId, setActiveId] = useState(null)

  const allTypes = useMemo(() => [...new Set(content.services.flatMap((v) => v.types))], [])
  const districts = useMemo(() => [...new Set(content.services.map((v) => v.district))], [])

  const [sortBy, setSortBy] = useState('name')
  const items = content.services
    .filter((v) => {
      const text = `${v.name} ${v.subdistrict} ${v.district}`
      if (q.trim() && !text.includes(q.trim())) return false
      if (district && v.district !== district) return false
      if (types.length && !types.some((t) => v.types.includes(t))) return false
      return true
    })
    .sort((a, b) => (sortBy === 'district' ? a.district.localeCompare(b.district, 'th') || a.name.localeCompare(b.name, 'th') : sortBy === 'services' ? b.types.length - a.types.length || a.name.localeCompare(b.name, 'th') : a.name.localeCompare(b.name, 'th')))

  const toggleType = (t) => setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  const clear = () => { setQ(''); setDistrict(''); setTypes([]) }
  const mapsHref = (v) => `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`
  const filtered = q.trim() || district || types.length

  return (
    <section className="stack">
      <div className="panel">
        <header className="panel-head">
          <Icon name="pin" size={42} className="panel-icon pin-big" />
          <div>
            <h2>หน่วยบริการการแพทย์แผนไทยใกล้บ้าน</h2>
            <p>ค้นหาหน่วยบริการในสังกัด อบจ.สมุทรสาคร ที่ให้บริการด้านการแพทย์แผนไทย (ข้อมูลจำลองเพื่อการสาธิต)</p>
          </div>
        </header>

        {result?.level === 'emergency' ? (
          <div className="callout lv-emergency"><Icon name="warning" size={24} /><span><strong>มีสัญญาณที่อาจเป็นอันตราย</strong> ไม่ควรรอ ให้ไปสถานพยาบาลที่ใกล้ที่สุดทันที หรือโทร <a href="tel:1669">1669</a></span></div>
        ) : null}
        {result?.level === 'exam' ? (
          <div className="callout lv-exam"><Icon name="stethoscope" size={24} /><span><strong>ควรได้รับการตรวจเพิ่มเติม</strong> แนะนำให้ติดต่อหน่วยบริการด้านล่างเพื่อรับการประเมินจากบุคลากรวิชาชีพ</span></div>
        ) : null}

        <div className="svc-grid">
          <div className="filters">
            <label className="search-box">
              <Icon name="search" size={20} />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อหน่วยบริการ/ตำบล" aria-label="ค้นหาชื่อหน่วยบริการหรือตำบล" />
            </label>
            <label className="field">
              <span>เลือกพื้นที่ (อำเภอ)</span>
              <select value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="">ทุกอำเภอ</option>
                {districts.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <fieldset className="type-filter">
              <legend>ประเภทบริการ <em>{types.length ? '' : '(ไม่เลือก = ทุกประเภท)'}</em></legend>
              {allTypes.map((t) => (
                <label key={t} className={`check${types.includes(t) ? ' on' : ''}`}>
                  <input type="checkbox" checked={types.includes(t)} onChange={() => toggleType(t)} />
                  <span className="box" aria-hidden="true">{types.includes(t) ? <Icon name="check" size={14} strokeWidth={3.6} /> : null}</span>
                  <Icon name={svcIcon(t)} size={18} />
                  {t}
                </label>
              ))}
            </fieldset>
            {filtered ? <button type="button" className="btn small" onClick={clear}>ล้างตัวกรอง</button> : null}
          </div>
          <div className="map-col">
            <ServiceMap items={items} activeId={activeId} onPick={setActiveId} />
            <p className="map-caption">แผนที่แบบย่อ ไม่ใช่มาตราส่งจริง · กดหมุดเพื่อดูหน่วยบริการ</p>
          </div>
        </div>
      </div>

      <div className="list-head">
        <p className="count" aria-live="polite">พบหน่วยบริการ <strong>{items.length}</strong> แห่ง</p>
        <label className="sort">
          <span>เรียงตาม</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">ชื่อหน่วยบริการ</option>
            <option value="district">อำเภอ</option>
            <option value="services">จำนวนบริการ</option>
          </select>
        </label>
      </div>
      <ul className="svc-list">
        {items.map((v) => (
          <li key={v.id} className={`svc${v.id === activeId ? ' active' : ''}`} onClick={() => setActiveId(v.id)}>
            <Img file={v.image} label="รูปหน่วยบริการ" className="svc-img" />
            <div className="svc-body">
              <h3>{v.name} <span className="badge-mock">ข้อมูลจำลอง</span></h3>
              <p className="loc"><Icon name="pin" size={16} /> ต.{v.subdistrict} อ.{v.district}</p>
              <span className="svc-tag"><Icon name="leaf" size={14} /> บริการการแพทย์แผนไทย</span>
              <ul className="svc-types">
                {v.types.map((t) => <li key={t}><Icon name={svcIcon(t)} size={20} /><span>{t}</span></li>)}
              </ul>
              <p className="meta"><Icon name="clock" size={16} /> {v.hours}</p>
              <p className="meta"><Icon name="phone" size={16} /> <a href={`tel:${v.phone.replace(/[^0-9+]/g, '')}`}>{v.phone}</a></p>
            </div>
            <a className="btn small route" href={mapsHref(v)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Icon name="pin" size={16} /> ดูเส้นทาง
            </a>
          </li>
        ))}
        {!items.length ? <li className="empty">ไม่พบหน่วยบริการตามเงื่อนไขที่เลือก ลองล้างตัวกรองแล้วค้นหาใหม่</li> : null}
      </ul>

      <div className="actions">
        {onBack ? (
          <button type="button" className="btn" onClick={onBack}><Icon name="chevronLeft" size={18} strokeWidth={2.6} /> ย้อนกลับ</button>
        ) : (
          <a className="btn" href="#/"><Icon name="chevronLeft" size={18} strokeWidth={2.6} /> กลับหน้าหลัก</a>
        )}
        <span className="actions-right">
          <a className="btn" href="#/survey">ทำแบบประเมินความพึงพอใจ</a>
          {!standalone ? <a className="btn primary" href="#/"><Icon name="home" size={20} /> กลับสู่หน้าหลัก</a> : null}
        </span>
      </div>
    </section>
  )
}



