import content from '../content.generated.json'
import BodyPicker from './BodyPicker.jsx'
import Icon from './Icon.jsx'
import Img from './Img.jsx'

// หน้าตาแทนค่า NRS ที่ปลายและกลางแถบ (วาดเป็น SVG)
function Face({ mood }) {
  const color = mood === 'happy' ? '#3fa55a' : mood === 'mid' ? '#e0a800' : '#d93a3a'
  const mouth = mood === 'happy' ? 'M8 14.5c1 1.6 2.4 2.3 4 2.3s3-.7 4-2.3' : mood === 'mid' ? 'M8.5 15.5h7' : 'M8 17c1-1.6 2.4-2.3 4-2.3s3 .7 4 2.3'
  return (
    <svg className="face" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill={color} />
      <circle cx="8.8" cy="9.6" r="1.3" fill="#fff" />
      <circle cx="15.2" cy="9.6" r="1.3" fill="#fff" />
      <path d={mouth} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function Step1({ state, patch, onNext }) {
  const ready = Boolean(state.position) && state.nrs !== null
  return (
    <section className="panel">
      <header className="panel-head center">
        <Icon name="clipboard" size={38} className="panel-icon" />
        <div>
          <h2>กรุณาเลือกบริเวณที่มีอาการปวดมากที่สุด</h2>
          <p>เลือกได้เพียง 1 ตำแหน่ง แล้วระบุระดับความปวด เพื่อประเมินอาการและรับคำแนะนำที่เหมาะสม</p>
        </div>
      </header>

      <div className="step1-grid">
        <div className="pos-list" role="radiogroup" aria-label="ตำแหน่งที่ปวด">
          {content.positions.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={state.position === p.id}
              className={`pos-card${state.position === p.id ? ' on' : ''}`}
              onClick={() => patch({ position: p.id })}
            >
              <Img file={`region-${p.id}.png`} label={p.label} className="thumb compact" />
              <span className="pos-text">
                <strong>{p.label}</strong>
                <small>{p.hint}</small>
              </span>
              {state.position === p.id ? <Icon name="check" size={20} strokeWidth={3} className="pos-check" /> : null}
            </button>
          ))}
        </div>
        <BodyPicker positions={content.positions} selected={state.position} onSelect={(id) => patch({ position: id })} />
      </div>

      <div className="nrs" role="radiogroup" aria-label="ระดับความปวด">
        <div className="nrs-title">
          <strong>ระดับความปวด</strong>
          <span>มาตรา NRS 0–10 ({state.nrs === null ? 'ยังไม่ได้เลือก' : `เลือก ${state.nrs}`})</span>
        </div>
        <div className="nrs-scale">
          <div className="nrs-row">
            {Array.from({ length: 11 }, (_, n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={state.nrs === n}
                className={`nrs-btn n${n}${state.nrs === n ? ' on' : ''}`}
                onClick={() => patch({ nrs: n })}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="nrs-bar" aria-hidden="true" />
          <div className="nrs-legend">
            <span><Face mood="happy" />ไม่ปวด</span>
            <span><Face mood="mid" />ปวดปานกลาง</span>
            <span><Face mood="sad" />ปวดมากที่สุด</span>
          </div>
        </div>
      </div>

      <div className="actions center">
        <button type="button" className="btn primary big" disabled={!ready} onClick={onNext}>
          ถัดไป <Icon name="chevronRight" size={20} strokeWidth={2.6} />
        </button>
        {!ready ? <p className="hint">เลือกตำแหน่งและระดับความปวดให้ครบ</p> : null}
      </div>
    </section>
  )
}
