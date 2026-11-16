// ภาษาเงื่อนไขอย่างง่ายสำหรับชีต "กฎความปลอดภัย" (แพทย์แผนไทยแก้ใน Excel ได้เอง)
//   flag:ชื่อ        จริงเมื่อคำตอบใดคำตอบหนึ่งทำให้เกิด flag นั้น
//   nrs>=7 / nrs<=2 / nrs>5 / nrs<3 / nrs=5   เปรียบเทียบคะแนนความปวด 0-10
//   a|b   หรือ     a&b   และ   (& ผูกแน่นกว่า |)

const NRS_RE = /^nrs(>=|<=|>|<|=)(\d{1,2})$/
const FLAG_RE = /^flag:([^\s|&]+)$/

function fail(expr, why) {
  throw new Error(`เงื่อนไข "${expr}" ไม่ถูกต้อง: ${why}`)
}

function parseTerm(raw, whole) {
  const t = raw.replace(/\s+/g, '').toLowerCase()
  if (!t) fail(whole, 'มีส่วนที่ว่างเปล่า')
  let m = t.match(FLAG_RE)
  if (m) return { type: 'flag', name: m[1] }
  m = t.match(NRS_RE)
  if (m) return { type: 'nrs', op: m[1], value: Number(m[2]) }
  return fail(whole, `ไม่รู้จัก "${raw.trim()}" (ใช้ flag:ชื่อ หรือ nrs>=ตัวเลข)`)
}

export function parseCondition(expr) {
  if (typeof expr !== 'string' || !expr.trim()) fail(String(expr ?? ''), 'เว้นว่างไม่ได้')
  return expr.split('|').map((group) => group.split('&').map((term) => parseTerm(term, expr)))
}

function compare(op, a, b) {
  switch (op) {
    case '>=': return a >= b
    case '<=': return a <= b
    case '>': return a > b
    case '<': return a < b
    default: return a === b
  }
}

function termHolds(term, ctx) {
  if (term.type === 'flag') return ctx.flags.has(term.name)
  if (ctx.nrs === null || ctx.nrs === undefined) return false
  return compare(term.op, ctx.nrs, term.value)
}

export function evaluateCondition(expr, ctx) {
  return parseCondition(expr).some((andGroup) => andGroup.every((term) => termHolds(term, ctx)))
}
