// สร้างภาพประกอบต้นฉบับ (SVG) ให้ช่องรูปทั้งหมดใน public/images — วาดเอง ไม่ใช้รูป/ไอคอนของผู้อื่นเป็นภาพหลัก
// รันซ้ำได้: node scripts/make-assets.mjs   (ไฟล์ .jpg/.png ที่วางชื่อเดียวกันจะถูกใช้ก่อน SVG เสมอ)
// ไอคอนเส้นในภาพคำถามคัดกรองมาจาก Lucide (ISC License) — ดูเครดิตในหน้า "เกี่ยวกับต้นแบบ"
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'images')
fs.mkdirSync(OUT, { recursive: true })
const write = (name, svg) => fs.writeFileSync(path.join(OUT, name), svg.trim() + '\n', 'utf8')

const SKIN = '#f6dcc8'
const SKIN_LINE = '#deb99c'
const HAIR = '#4b3a2e'
const SHIRT = '#58b36a'
const PANTS = '#35506b'

// ---------- โลโก้ ----------
write('logo.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="โลโก้ ThaiMed WorkWell Sakhon">
  <defs>
    <linearGradient id="lf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9bd96f"/><stop offset="1" stop-color="#2e9d4a"/></linearGradient>
    <linearGradient id="bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3a64b"/><stop offset="1" stop-color="#b9742a"/></linearGradient>
  </defs>
  <path d="M128 206 C58 212 16 164 20 108 C68 114 112 148 128 206Z" fill="url(#lf)"/>
  <path d="M128 206 C198 212 240 164 236 108 C188 114 144 148 128 206Z" fill="url(#lf)"/>
  <path d="M128 198 C98 160 98 108 128 64 C158 108 158 160 128 198Z" fill="#43b05c"/>
  <path d="M128 198 C114 160 116 112 128 80" fill="none" stroke="#2e9d4a" stroke-width="3" stroke-linecap="round"/>
  <g transform="rotate(24 128 122)"><rect x="120" y="66" width="16" height="92" rx="8" fill="#ecc16a"/><circle cx="128" cy="66" r="13" fill="#ecc16a"/></g>
  <path d="M78 150 H178 C178 190 158 208 128 208 C98 208 78 190 78 150Z" fill="url(#bw)"/>
  <rect x="72" y="143" width="112" height="13" rx="6.5" fill="#d4934a"/>
  <circle cx="176" cy="118" r="7" fill="#f08a3c"/><circle cx="190" cy="130" r="5" fill="#f2a24d"/>
  <ellipse cx="128" cy="228" rx="60" ry="8" fill="#cfe8d5"/>
</svg>`)

// ---------- ไอคอนตำแหน่งปวด (ตัดช่วงของร่างกาย + จุดเรืองแสง) ----------
const body = (back) => `
  <g fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.4" stroke-linejoin="round">
    <path d="M105 79 C92 81 84 93 82 110 L76 158 C75 166 79 172 86 171 C92 170 95 165 96 158 L104 118 Z"/>
    <path d="M195 79 C208 81 216 93 218 110 L224 158 C225 166 221 172 214 171 C208 170 205 165 204 158 L196 118 Z"/>
    <path d="M141 52 L141 68 Q150 74 159 68 L159 52 Z"/>
    <path d="M141 67 C128 69 113 72 105 79 C98 85 98 95 100 112 L103 150 C104 158 108 162 113 164 L187 164 C192 162 196 158 197 150 L200 112 C202 95 202 85 195 79 C187 72 172 69 159 67 Q150 72 141 67 Z"/>
    <ellipse cx="131" cy="36" rx="4" ry="6"/><ellipse cx="169" cy="36" rx="4" ry="6"/>
    <ellipse cx="150" cy="34" rx="19" ry="22"/>
    ${back
      ? `<path d="M131 32 C130 10 170 10 169 32 C169 44 162 52 150 54 C138 52 131 44 131 32 Z" fill="${HAIR}" stroke="none"/><path d="M150 72 L150 160" fill="none" stroke="#e4c3a8" stroke-width="1.3"/>`
      : `<path d="M130 33 C128 8 172 8 170 33 C166 22 158 17 150 17 C142 17 134 22 130 33 Z" fill="${HAIR}" stroke="none"/><ellipse cx="143" cy="36" rx="1.8" ry="2.4" fill="${HAIR}" stroke="none"/><ellipse cx="157" cy="36" rx="1.8" ry="2.4" fill="${HAIR}" stroke="none"/><path d="M144 45 Q150 50 156 45" fill="none" stroke="#b4684f" stroke-width="1.7" stroke-linecap="round"/>`}
  </g>`

function regionIcon(file, { box, back, glows }) {
  const g = glows.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="url(#g)"/><circle cx="${x}" cy="${y}" r="6" fill="#e5484d" stroke="#fff" stroke-width="2.4"/>`).join('')
  write(file, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="ภาพแสดงตำแหน่ง">
  <defs><radialGradient id="g"><stop offset="0" stop-color="#e5484d" stop-opacity=".6"/><stop offset="1" stop-color="#e5484d" stop-opacity="0"/></radialGradient></defs>
  <rect x="${box.split(' ')[0]}" y="${box.split(' ')[1]}" width="${box.split(' ')[2]}" height="${box.split(' ')[3]}" fill="#eaf5ec"/>
  ${body(back)}${g}
</svg>`)
}
regionIcon('region-neck.svg', { box: '92 8 116 116', back: false, glows: [[150, 62]] })
regionIcon('region-shoulder.svg', { box: '72 30 156 156', back: false, glows: [[108, 80], [192, 80]] })
regionIcon('region-back_upper.svg', { box: '72 48 156 156', back: true, glows: [[150, 108]] })
regionIcon('region-back_lower.svg', { box: '72 100 156 156', back: true, glows: [[150, 168]] })

// ---------- ภาพประกอบคำถามคัดกรอง (ไอคอนเส้นบนแผ่นสีอ่อน) ----------
const ICONS = {
  droplets: '<path d="M7 16.3c2.2 0 4-1.8 4-4 0-1.2-.6-2.3-1.7-3.2S7.3 6.8 7 5.3c-.3 1.5-1.1 2.8-2.3 3.8S3 11.1 3 12.3c0 2.2 1.8 4 4 4Z"/><path d="M12.6 6.6A11 11 0 0 0 14 3c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a7 7 0 0 1-11.9 5"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
  thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  warning: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/>',
  move: '<path d="m5 9-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
}
function screenIcon(file, icon, tint, ink) {
  write(file, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="ภาพประกอบคำถาม">
  <rect width="128" height="128" rx="26" fill="${tint}"/>
  <circle cx="64" cy="64" r="40" fill="#fff" opacity=".75"/>
  <g transform="translate(32 32) scale(2.67)" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[icon]}</g>
</svg>`)
}
screenIcon('screen-r_bowel.svg', 'droplets', '#fdeaea', '#c93a40')
screenIcon('screen-r_weak.svg', 'hand', '#fdeaea', '#c93a40')
screenIcon('screen-r_chest.svg', 'heart', '#fdeaea', '#c93a40')
screenIcon('screen-r_fever.svg', 'thermometer', '#fdeaea', '#c93a40')
screenIcon('screen-r_trauma.svg', 'warning', '#fff3dc', '#b86e00')
screenIcon('screen-r_limit.svg', 'move', '#fff3dc', '#b86e00')

// ---------- ท่าแก้เกียจ ขั้น 1–3 (คนนั่งสมาธิ) ----------
const arm = (d) => `<path d="${d}" fill="none" stroke="${SKIN}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${SKIN_LINE}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity=".0"/>`
function person({ arms, hands, tilt = 0, headTilt = 0, headTurn = 0, extra = '' }) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" role="img" aria-label="ภาพประกอบท่าฤๅษีดัดตน">
  <rect width="320" height="240" rx="22" fill="#f1f8f2"/>
  <ellipse cx="160" cy="214" rx="104" ry="10" fill="#dbeadf"/>
  <!-- ขาไขว้ -->
  <path d="M96 196 C100 176 136 168 164 176 L164 206 C140 214 108 214 96 196Z" fill="${PANTS}"/>
  <path d="M224 196 C220 176 184 168 156 176 L156 206 C180 214 212 214 224 196Z" fill="#3d5b79"/>
  <ellipse cx="104" cy="204" rx="12" ry="8" fill="${SKIN}"/><ellipse cx="216" cy="204" rx="12" ry="8" fill="${SKIN}"/>
  <g transform="rotate(${tilt} 160 180)">
    <!-- ลำตัว -->
    <path d="M128 96 C140 88 180 88 192 96 C198 120 196 150 192 178 L128 178 C124 150 122 120 128 96Z" fill="${SHIRT}"/>
    <path d="M148 90 L172 90 L160 104Z" fill="#46a05a"/>
    <rect x="152" y="70" width="16" height="22" rx="7" fill="${SKIN}"/>
    <!-- ศีรษะ -->
    <g transform="rotate(${headTilt} 160 88)">
      <ellipse cx="160" cy="56" rx="23" ry="26" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.2"/>
      <path d="M136 52 C132 22 188 22 184 52 C180 40 172 34 160 34 C148 34 140 40 136 52Z" fill="${HAIR}"/>
      <ellipse cx="${151 + headTurn}" cy="58" rx="2" ry="2.8" fill="${HAIR}"/><ellipse cx="${169 + headTurn}" cy="58" rx="2" ry="2.8" fill="${HAIR}"/>
      <path d="M${152 + headTurn} 70 Q${160 + headTurn} 76 ${168 + headTurn} 70" fill="none" stroke="#b4684f" stroke-width="2" stroke-linecap="round"/>
    </g>
    ${arms.map(arm).join('')}
    ${hands}
  </g>
  ${extra}
</svg>`
}
const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.2"/>`
const arrow = (d, head) => `<path d="${d}" fill="none" stroke="#f08a3c" stroke-width="5" stroke-linecap="round"/><path d="${head}" fill="#f08a3c"/>`
write('pose-shoulder-1.svg', person({
  arms: ['M134 104 L120 144 L158 130', 'M186 104 L200 144 L162 130'],
  hands: hand(160, 128),
}))
write('pose-shoulder-2.svg', person({
  arms: ['M134 106 L208 112', 'M186 106 L214 114'],
  hands: hand(226, 112),
  tilt: 6,
  extra: `${arrow('M96 150 C 80 130, 80 100, 100 82', 'M96 74 L112 84 L92 92Z')}${arrow('M230 60 C 252 74, 252 98, 238 114', 'M242 120 L228 108 L248 104Z')}`,
}))
write('pose-shoulder-3.svg', person({
  arms: ['M134 102 L126 62 L152 24', 'M186 102 L194 62 L168 24'],
  hands: hand(160, 18),
  extra: `${arrow('M92 120 L92 70', 'M82 76 L92 56 L102 76Z')}${arrow('M228 120 L228 70', 'M218 76 L228 56 L238 76Z')}`,
}))

// ---------- ท่าแก้ลมปัตฆาต (แก้ลมในเอว): นั่งเหยียดขา มองด้านข้าง ขั้น 1-6 (4-6 สลับข้าง = กลับซ้าย-ขวา) ----------
function seated({ mirror = false, arm, twist = false, toeUp = false, extra = '' }) {
  const faceX = twist ? -22 : 0
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" role="img" aria-label="ภาพประกอบท่าแก้ลมปัตฆาต">
  <rect width="320" height="240" rx="22" fill="#f1f8f2"/>
  <ellipse cx="160" cy="216" rx="130" ry="10" fill="#dbeadf"/>
  <g ${mirror ? 'transform="translate(320 0) scale(-1 1)"' : ''}>
    <path d="M130 192 L252 194" stroke="${PANTS}" stroke-width="24" stroke-linecap="round" fill="none"/>
    <g transform="rotate(${toeUp ? -28 : 0} 252 190)"><ellipse cx="262" cy="188" rx="9" ry="14" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.2"/></g>
    <path d="M130 192 L176 146 L214 190" stroke="#3d5b79" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <ellipse cx="216" cy="198" rx="14" ry="8" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.2"/>
    <path d="M130 192 L126 120" stroke="${SHIRT}" stroke-width="42" stroke-linecap="round" fill="none"/>
    <path d="M126 112 L126 96" stroke="${SKIN}" stroke-width="13" stroke-linecap="round"/>
    <circle cx="128" cy="78" r="22" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.2"/>
    <path d="M106 76 C104 50 152 50 150 76 C146 64 136 60 128 60 C118 60 110 66 106 76Z" fill="${HAIR}"/>
    <ellipse cx="${139 + faceX}" cy="80" rx="2" ry="2.8" fill="${HAIR}"/>
    <path d="M${136 + faceX} 90 Q${142 + faceX} 94 ${148 + faceX} 89" fill="none" stroke="#b4684f" stroke-width="2" stroke-linecap="round"/>
    ${arm}
    ${extra}
  </g>
</svg>`
}
const armGrab = `<path d="M126 124 L166 158 L212 190" fill="none" stroke="${SKIN}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${hand(214, 192)}`
const armReach = `<path d="M126 124 L182 118 L238 112" fill="none" stroke="${SKIN}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${hand(240, 112)}`
const armTwist = `<path d="M120 124 L98 156 L96 184" fill="none" stroke="${SKIN}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${hand(96, 186)}<path d="M126 124 L156 150 L176 148" fill="none" stroke="${SKIN}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${hand(178, 148)}`
const reachArrows = `${arrow('M250 100 L250 68', 'M242 74 L250 56 L258 74Z')}${arrow('M276 168 L276 134', 'M268 140 L276 122 L284 140Z')}`
const twistArrow = arrow('M92 104 C 66 124, 68 168, 98 186', 'M106 190 L88 188 L98 172Z')
write('pose-back-1.svg', seated({ arm: armGrab }))
write('pose-back-2.svg', seated({ arm: armReach, toeUp: true, extra: reachArrows }))
write('pose-back-3.svg', seated({ arm: armTwist, twist: true, extra: twistArrow }))
write('pose-back-4.svg', seated({ arm: armGrab, mirror: true }))
write('pose-back-5.svg', seated({ arm: armReach, toeUp: true, mirror: true, extra: reachArrows }))
write('pose-back-6.svg', seated({ arm: armTwist, twist: true, mirror: true, extra: twistArrow }))

// ---------- อาคารหน่วยบริการ (ภาพประกอบ ไม่ใช่ภาพถ่ายจริง) ----------
function building(file, { roof, wall, sign, tree }) {
  write(file, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 236" role="img" aria-label="ภาพประกอบหน่วยบริการ">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe9f7"/><stop offset="1" stop-color="#f4fbf6"/></linearGradient></defs>
  <rect width="300" height="236" fill="url(#sky)"/>
  <ellipse cx="236" cy="40" rx="34" ry="9" fill="#fff" opacity=".85"/><ellipse cx="70" cy="56" rx="26" ry="7" fill="#fff" opacity=".7"/>
  <rect y="176" width="300" height="60" fill="#8cc98a"/><rect y="196" width="300" height="40" fill="#cdbf9c" opacity=".55"/>
  <rect x="60" y="102" width="180" height="78" fill="${wall}"/>
  <path d="M46 106 L150 58 L254 106 Z" fill="${roof}"/><rect x="46" y="104" width="208" height="7" fill="#fff" opacity=".4"/>
  <rect x="132" y="130" width="36" height="50" rx="3" fill="#7a5a3a"/><circle cx="162" cy="156" r="2.4" fill="#e9c46a"/>
  <rect x="76" y="126" width="38" height="28" rx="3" fill="#bfe3f4" stroke="#fff" stroke-width="3"/><rect x="186" y="126" width="38" height="28" rx="3" fill="#bfe3f4" stroke="#fff" stroke-width="3"/>
  <rect x="116" y="84" width="68" height="22" rx="5" fill="#fff"/><rect x="120" y="88" width="60" height="14" rx="3" fill="${sign}"/>
  <path d="M146 91 h8 v-3 h4 v3 h8 v4 h-8 v3 h-4 v-3 h-8Z" fill="#fff" transform="translate(-4 1)"/>
  ${tree === 'left'
    ? '<rect x="26" y="130" width="8" height="50" fill="#7a5a3a"/><circle cx="30" cy="124" r="26" fill="#3f9d4d"/><circle cx="46" cy="136" r="16" fill="#58b36a"/>'
    : '<rect x="266" y="130" width="8" height="50" fill="#7a5a3a"/><circle cx="270" cy="124" r="26" fill="#3f9d4d"/><circle cx="254" cy="136" r="16" fill="#58b36a"/>'}
  <text x="292" y="228" text-anchor="end" font-family="sans-serif" font-size="10" fill="#5d7064">ภาพประกอบ</text>
</svg>`)
}
const variants = [
  ['#2f7fa8', '#fffaf0', '#1a7a3c', 'left'], ['#2e9d6a', '#f8f4ea', '#1f6aa8', 'right'],
  ['#c9663a', '#fff7ee', '#1a7a3c', 'left'], ['#3d6fb0', '#f6f9f2', '#1a7a3c', 'right'],
  ['#2f7fa8', '#fdf6ec', '#c62f3a', 'right'], ['#b8802f', '#f8f6ee', '#1a7a3c', 'left'],
  ['#2e9d6a', '#fffaf0', '#1f6aa8', 'left'], ['#6b5bb0', '#f7f6fb', '#1a7a3c', 'right'],
]
variants.forEach(([roof, wall, sign, tree], i) => building(`service-sv${i + 1}.svg`, { roof, wall, sign, tree }))

// ---------- แบนเนอร์หัวเว็บ (ท่าเรือประมง ภาพประกอบ) ----------
function boat(x, y, s, hull, cabin, flag) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 40 L180 40 L160 74 L24 74 Z" fill="${hull}"/><rect x="0" y="38" width="180" height="7" fill="#fff" opacity=".85"/>
    <rect x="56" y="6" width="62" height="34" rx="4" fill="${cabin}"/><rect x="64" y="14" width="14" height="12" fill="#cfe9f7"/><rect x="86" y="14" width="14" height="12" fill="#cfe9f7"/>
    <line x1="134" y1="40" x2="134" y2="-40" stroke="#5a4636" stroke-width="4"/>
    <path d="M134 -38 L170 -26 L134 -14 Z" fill="${flag}"/>
    <path d="M134 -30 Q60 -4 14 40" fill="none" stroke="#5a4636" stroke-width="1.6"/><path d="M134 -30 Q 160 0 176 40" fill="none" stroke="#5a4636" stroke-width="1.6"/>
  </g>`
}
write('banner.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="ภาพประกอบท่าเรือประมง">
  <defs>
    <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3ee"/><stop offset="1" stop-color="#eaf6fb"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb9d9"/><stop offset="1" stop-color="#2f8fb8"/></linearGradient>
  </defs>
  <rect width="1200" height="260" fill="url(#sk)"/>
  <g fill="#fff" opacity=".85"><ellipse cx="260" cy="56" rx="90" ry="16"/><ellipse cx="560" cy="34" rx="70" ry="12"/><ellipse cx="980" cy="62" rx="100" ry="15"/></g>
  <g fill="#b87d4b"><rect x="40" y="128" width="130" height="30"/><path d="M30 130 L105 96 L180 130Z" fill="#8f4f2b"/><rect x="230" y="124" width="110" height="34"/><path d="M220 126 L285 96 L350 126Z" fill="#c95b3d"/><rect x="900" y="126" width="150" height="32"/><path d="M890 128 L975 94 L1060 128Z" fill="#2f7fa8"/></g>
  <rect y="156" width="1200" height="104" fill="url(#sea)"/>
  <g stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"><path d="M30 196 h70M180 220 h90M420 204 h60M640 228 h80M860 200 h70M1040 224 h90"/></g>
  ${boat(120, 118, 1.0, '#d94b3d', '#f4d35e', '#f08a3c')}
  ${boat(420, 126, 0.85, '#2f7fa8', '#f5f0e6', '#d94b3d')}
  ${boat(700, 114, 1.05, '#f2b632', '#3d9f6a', '#2f7fa8')}
  ${boat(980, 132, 0.8, '#6b5bb0', '#f4d35e', '#d94b3d')}
</svg>`)

console.log('สร้างภาพประกอบเสร็จ →', path.relative(ROOT, OUT))

