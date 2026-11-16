// ภาพร่างกายแบบ SVG สำหรับกดเลือกตำแหน่งปวด (องค์ประกอบของหน้าจอ ไม่ใช่รูปประกอบ)
// จุดเรืองแสง + ป้ายชื่อโยงเส้น ตามภาพตัวอย่างในเอกสาร
const FRONT = [
  { id: 'neck', x: 150, y: 62, side: 'right', lx: 262, ly: 40 },
  { id: 'shoulder', x: 108, y: 80, side: 'left', lx: 44, ly: 104 },
  { id: 'shoulder', x: 192, y: 80, key: 'shoulder-r' },
]
const BACK = [
  { id: 'back_upper', x: 150, y: 108, side: 'right', lx: 282, ly: 92 },
  { id: 'back_lower', x: 150, y: 168, side: 'right', lx: 282, ly: 168 },
]

// นับเฉพาะตัวอักษรที่มองเห็น (ตัดสระ/วรรณยุกต์ลอย) เพื่อคำนวณความกว้างป้าย
const visibleLength = (s) => s.replace(/[ัิ-ฺ็-๎]/g, '').length

export function Silhouette({ back = false }) {
  return (
    <g className="body-shape">
      {/* ขา */}
      <path d="M113 212 L148 212 L146 290 Q146 298 138 298 L124 298 Q115 298 115 290 Z" />
      <path d="M152 212 L187 212 L185 290 Q185 298 176 298 L162 298 Q154 298 154 290 Z" />
      {/* แขน + มือ */}
      <path d="M105 79 C92 81 84 93 82 110 L76 158 C75 166 79 172 86 171 C92 170 95 165 96 158 L104 118 Z" />
      <path d="M195 79 C208 81 216 93 218 110 L224 158 C225 166 221 172 214 171 C208 170 205 165 204 158 L196 118 Z" />
      <ellipse cx="85" cy="176" rx="8" ry="9" />
      <ellipse cx="215" cy="176" rx="8" ry="9" />
      {/* คอ + ลำตัว */}
      <path d="M141 52 L141 68 Q150 74 159 68 L159 52 Z" />
      <path d="M141 67 C128 69 113 72 105 79 C98 85 98 95 100 112 L103 150 C104 158 108 162 113 164 L187 164 C192 162 196 158 197 150 L200 112 C202 95 202 85 195 79 C187 72 172 69 159 67 Q150 72 141 67 Z" />
      {/* กางเกงขาสั้น */}
      <path d="M108 160 L192 160 L197 218 Q150 230 103 218 Z" className="shorts" />
      <path d="M108 160 L192 160" className="waist" />
      {/* ศีรษะ */}
      <ellipse cx="131" cy="36" rx="4" ry="6" />
      <ellipse cx="169" cy="36" rx="4" ry="6" />
      <ellipse cx="150" cy="34" rx="19" ry="22" />
      {back ? (
        <>
          <path d="M131 32 C130 10 170 10 169 32 C169 44 162 52 150 54 C138 52 131 44 131 32 Z" className="hair" />
          <path d="M150 72 L150 158" className="detail" />
          <path d="M120 88 Q134 102 150 98 Q166 102 180 88" className="detail" fill="none" />
        </>
      ) : (
        <>
          <path d="M130 33 C128 8 172 8 170 33 C166 22 158 17 150 17 C142 17 134 22 130 33 Z" className="hair" />
          <ellipse cx="143" cy="36" rx="1.8" ry="2.4" className="face" />
          <ellipse cx="157" cy="36" rx="1.8" ry="2.4" className="face" />
          <path d="M144 45 Q150 50 156 45" className="face-line" fill="none" />
          <path d="M124 86 Q150 96 176 86" className="detail" fill="none" />
          <circle cx="150" cy="140" r="1.4" className="face" />
        </>
      )}
    </g>
  )
}

function Callout({ spot, label, active }) {
  const w = Math.max(54, visibleLength(label) * 10 + 26)
  const x = spot.lx - w / 2
  const edgeX = spot.side === 'left' ? spot.lx + w / 2 : spot.lx - w / 2
  return (
    <g className={`callout${active ? ' on' : ''}`} aria-hidden="true">
      <path d={`M${spot.x} ${spot.y} L${edgeX} ${spot.ly}`} className="callout-line" />
      <rect x={x} y={spot.ly - 13} width={w} height="26" rx="13" className="callout-pill" />
      <text x={spot.lx} y={spot.ly + 5} textAnchor="middle" className="callout-text">{label}</text>
    </g>
  )
}

function Defs() {
  return (
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#e5484d" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#e5484d" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glow-on" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1a7a3c" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#1a7a3c" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

function Figure({ title, back, spots, positions, selected, onSelect }) {
  return (
    <figure className="body-figure">
      <svg viewBox="0 0 340 300" role="group" aria-label={title}>
        <Defs />
        <Silhouette back={back} />
        {spots.filter((s) => s.lx).map((s) => {
          const pos = positions.find((p) => p.id === s.id)
          return pos ? <Callout key={`c-${s.id}`} spot={s} label={pos.label} active={selected === s.id} /> : null
        })}
        {spots.map((s) => {
          const pos = positions.find((p) => p.id === s.id)
          if (!pos) return null
          const active = selected === s.id
          const pick = () => onSelect(s.id)
          return (
            <g
              key={s.key ?? s.id}
              className={`hotspot${active ? ' active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`เลือกตำแหน่ง${pos.label}`}
              aria-pressed={active}
              onClick={pick}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick())}
            >
              <circle className="halo" cx={s.x} cy={s.y} r="22" fill={active ? 'url(#glow-on)' : 'url(#glow)'} />
              <circle className="dot" cx={s.x} cy={s.y} r="7.5" />
            </g>
          )
        })}
      </svg>
      <figcaption>{title}</figcaption>
    </figure>
  )
}

export default function BodyPicker({ positions, selected, onSelect }) {
  return (
    <div className="body-picker">
      <Figure title="ด้านหน้า" spots={FRONT} positions={positions} selected={selected} onSelect={onSelect} />
      <Figure title="ด้านหลัง" back spots={BACK} positions={positions} selected={selected} onSelect={onSelect} />
    </div>
  )
}

// รอยขีดแดงข้างจุดปวด (เหมือนภาพตัวอย่างในเอกสาร)
function Burst({ x, y, dir }) {
  const d = dir
  return (
    <g className="burst" strokeLinecap="round">
      <path d={`M${x + d * 16} ${y - 18} l${d * 7} -9`} />
      <path d={`M${x + d * 22} ${y - 6} l${d * 10} -4`} />
      <path d={`M${x + d * 8} ${y - 24} l${d * 2} -11`} />
    </g>
  )
}

// ภาพย่อ (ไม่โต้ตอบ) สำหรับแผงสรุปของขั้น 2–4: ซูมช่วงบนของร่างกาย + จุดเรืองแสง + รอยขีด
export function BodyMini({ positionId }) {
  const back = positionId === 'back_upper' || positionId === 'back_lower'
  const spots = back ? BACK : FRONT
  const mine = spots.filter((s) => s.id === positionId)
  return (
    <svg className="body-mini" viewBox={back ? '70 44 160 150' : '70 6 160 150'} role="img" aria-label={back ? 'ภาพร่างกายด้านหลัง' : 'ภาพร่างกายด้านหน้า'}>
      <defs>
        <radialGradient id="glow-mini" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e5484d" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#e5484d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Silhouette back={back} />
      {mine.map((s) => (
        <g key={s.key ?? s.id}>
          <circle cx={s.x} cy={s.y} r="26" fill="url(#glow-mini)" />
          {!back ? <Burst x={s.x} y={s.y} dir={s.x < 150 ? -1 : 1} /> : null}
        </g>
      ))}
    </svg>
  )
}

// ภาพเด่นหน้าแรก: ร่างกายด้านหน้า + จุดเรืองแสง + ป้ายชื่อ (ตกแต่ง ไม่โต้ตอบ)
export function HeroFigure({ positions }) {
  const label = (id) => positions.find((p) => p.id === id)?.label
  return (
    <svg className="hero-figure" viewBox="0 0 340 300" aria-hidden="true" focusable="false">
      <Defs />
      <Silhouette />
      {FRONT.filter((s) => s.lx).map((s) => (label(s.id) ? <Callout key={s.id} spot={s} label={label(s.id)} active={false} /> : null))}
      {FRONT.map((s) => (
        <g key={s.key ?? s.id} className="hotspot hero-spot">
          <circle className="halo" cx={s.x} cy={s.y} r="22" fill="url(#glow)" />
          <circle className="dot" cx={s.x} cy={s.y} r="7.5" />
        </g>
      ))}
    </svg>
  )
}

