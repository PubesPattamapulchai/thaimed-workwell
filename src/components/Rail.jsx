import content from '../content.generated.json'
import { BodyMini } from './BodyPicker.jsx'

// แผงสรุปด้านซ้ายของขั้น 2–3: ตำแหน่งที่เลือก + ภาพย่อ + ระดับความปวด (ตามภาพตัวอย่างในเอกสาร)
export default function Rail({ state, label = 'ตำแหน่งที่เลือก' }) {
  const position = content.positions.find((p) => p.id === state.position)
  return (
    <aside className="rail" aria-label="สรุปข้อมูลที่เลือก">
      <p className="rail-label">{label}</p>
      <div className="rail-pill">{position?.label ?? '-'}</div>
      <BodyMini positionId={state.position} />
      <p className="rail-label">ระดับความปวด<br /><small>(ที่เลือกไว้)</small></p>
      <div className="rail-nrs"><b>{state.nrs ?? '-'}</b> / 10</div>
    </aside>
  )
}

