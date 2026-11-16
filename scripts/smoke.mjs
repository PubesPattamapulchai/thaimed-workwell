// Smoke test ในเบราว์เซอร์จริง (Edge/Chrome แบบ headless): เปิด dist/index.html ผ่าน file:// แล้วกดไล่ทั้ง flow
// ใช้:  npm run build  แล้ว  npm run smoke      (จับบั๊กที่เทสต์ render ฝั่งเซิร์ฟเวอร์ไม่เห็น เช่น effect ที่ crash ตอนเปลี่ยนหน้า)
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist', 'index.html')
const CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
]
const browser = process.env.BROWSER_PATH || CANDIDATES.find((p) => fs.existsSync(p))
if (!browser) { console.error('ไม่พบ Edge/Chrome (ตั้ง BROWSER_PATH ได้)'); process.exit(2) }
if (!fs.existsSync(DIST)) { console.error('ยังไม่มี dist/index.html — รัน npm run build ก่อน'); process.exit(2) }

const url = 'file:///' + DIST.replace(/\\/g, '/')
const port = 9300 + Math.floor(Math.random() * 500)
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'twws-smoke-'))
const proc = spawn(browser, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let ws
const failures = []
const jsErrors = []
let msgId = 0
const pending = new Map()

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
      const page = targets.find((t) => t.type === 'page')
      if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j }); return }
    } catch { /* ยังไม่พร้อม */ }
    await sleep(250)
  }
  throw new Error('เชื่อมต่อเบราว์เซอร์ไม่ได้')
}

const send = (method, params = {}) => new Promise((r) => { const id = ++msgId; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })) })
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value
const main = () => ev('document.querySelector(".site-main")?.innerText ?? ""')

async function until(label, predicate, timeout = 4000) {
  const t0 = Date.now()
  for (;;) {
    const text = await main()
    if (predicate(text)) return text
    if (Date.now() - t0 > timeout) { failures.push(`${label} — ไม่พบข้อความที่คาดไว้ ข้อความที่เห็น: "${String(text).slice(0, 120).replace(/\n/g, ' | ')}"`); return text }
    await sleep(100)
  }
}
const has = (s) => (t) => t.includes(s)
const click = (text, sel = 'a,button', mode = 'startsWith') => ev(`(()=>{const el=[...document.querySelectorAll(${JSON.stringify(sel)})].find(e=>e.textContent.trim().${mode}(${JSON.stringify(text)}));if(!el)return false;el.click();return true})()`)
const clickFirstOfEach = () => ev('document.querySelectorAll(".question").forEach(q=>q.querySelector(".opt")?.click())')
const goHash = async (h) => { await ev(`location.hash=${JSON.stringify(h)}`); await sleep(200) }

try {
  await connect()
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data)
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d.error); pending.delete(d.id) }
    if (d.method === 'Runtime.exceptionThrown') jsErrors.push(d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text)
  }
  await send('Runtime.enable'); await send('Page.enable')
  await send('Page.navigate', { url })

  await until('หน้าแรก', has('เริ่มประเมินอาการ'))
  if (!(await click('เริ่มประเมินอาการ'))) failures.push('ไม่พบปุ่ม เริ่มประเมินอาการ')
  await until('ขั้น 1 (หลังกดเริ่ม)', has('กรุณาเลือกบริเวณที่มีอาการปวดมากที่สุด'))

  await click('บ่า', '.pos-card', 'includes')
  await click('3', '.nrs-btn')
  await click('ถัดไป')
  await until('ขั้น 2', has('ประเมินรายละเอียดอาการ'))
  await clickFirstOfEach()
  await click('ถัดไป')
  await until('ขั้น 3', has('คัดกรองความเสี่ยงก่อนรับคำแนะนำ'))
  await ev('document.querySelectorAll(".question").forEach(q=>[...q.querySelectorAll(".opt")].find(o=>o.textContent.trim()==="ไม่มี")?.click())')
  await click('รับคำแนะนำ')
  await until('ขั้น 4 (ดูแลตนเอง ต้องมีท่า)', has('ท่าแก้เกียจ'))

  // ปุ่ม Back ของเบราว์เซอร์ต้องย้อนทีละขั้น ไม่ทำให้หน้าว่าง
  await ev('history.back()')
  await until('Back → ขั้น 3', has('คัดกรองความเสี่ยงก่อนรับคำแนะนำ'))
  await ev('history.forward()')
  await until('Forward → ขั้น 4', has('ท่าแก้เกียจ'))

  await click('ดูหน่วยบริการใกล้บ้าน')
  await until('ขั้น 5', has('พบหน่วยบริการ'))
  await click('ทำแบบประเมินความพึงพอใจ')
  await until('แบบประเมิน', has('แบบประเมินความพึงพอใจ'))
  await ev('document.querySelectorAll(".question").forEach(q=>[...q.querySelectorAll(".opt")].at(-1).click())')
  await click('ส่งแบบประเมิน')
  await until('ขอบคุณ', has('ขอบคุณ'))

  await goHash('#/stats')
  const stats = await until('สถิติ', has('ทำครบ'))
  if (!/1\s*เริ่มใช้งาน/.test(stats) || !/1\s*ทำครบ/.test(stats)) failures.push(`สถิติไม่ตรง (คาดเริ่ม 1/ทำครบ 1): ${stats.slice(0, 160).replace(/\n/g, ' | ')}`)

  // กรณีสาธิตผ่านการกดจริง + ไม่เห็นท่าเมื่อไม่ใช่ดูแลตนเอง
  await goHash('#/')
  await click('กรณีที่ 2')
  const d2 = await until('กรณีสาธิต 2', has('ควรรับการตรวจเพิ่มเติมก่อนเลือกท่า'))
  if (d2.includes('ท่าฤๅษีดัดตน:')) failures.push('กรณีสาธิต 2 แสดงท่าทั้งที่ต้องตรวจเพิ่ม')
  await goHash('#/'); await click('กรณีที่ 3')
  const d3 = await until('กรณีสาธิต 3', has('ควรรับการประเมินฉุกเฉินทันที'))
  if (d3.includes('ท่าฤๅษีดัดตน:')) failures.push('กรณีสาธิต 3 แสดงท่าทั้งที่เป็นฉุกเฉิน')
  if (!(await ev('!!document.querySelector("a[href=\\"tel:1669\\"]")'))) failures.push('กรณีสาธิต 3 ไม่มีลิงก์โทร 1669')

  // แผนที่แบบย่อ: หมุดครบ และกดหมุดแล้วการ์ดหน่วยบริการถูกเลือก
  await goHash('#/services')
  await until('หน้าหน่วยบริการ', has('พบหน่วยบริการ'))
  const pins = await ev('document.querySelectorAll(".svc-map .pin").length')
  if (pins !== 8) failures.push('แผนที่ย่อมีหมุด ' + pins + ' (คาด 8)')
  await ev('document.querySelector(".svc-map .pin").dispatchEvent(new MouseEvent("click",{bubbles:true}))')
  await sleep(200)
  if (!(await ev('!!document.querySelector(".svc.active")'))) failures.push('กดหมุดแล้วการ์ดไม่ถูกเลือก')
  for (const [h, expect] of [['#/services', 'พบหน่วยบริการ'], ['#/about', 'วัตถุประสงค์'], ['#/survey', 'แบบประเมินความพึงพอใจ']]) {
    await goHash(h)
    await until(`หน้า ${h}`, has(expect))
  }
} catch (e) {
  failures.push(`สคริปต์ล้ม: ${e.message}`)
} finally {
  try { ws?.close() } catch { /* ignore */ }
  proc.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch { /* ignore */ }
}

if (jsErrors.length) failures.push(`JavaScript error ในหน้า:\n  ${[...new Set(jsErrors)].map((x) => String(x).split('\n')[0]).join('\n  ')}`)
if (failures.length) {
  console.error(`\n✖ smoke test ไม่ผ่าน ${failures.length} จุด:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('✔ smoke test ผ่าน: กดไล่ 5 ขั้น, Back/Forward, แบบประเมิน, สถิติ, กรณีสาธิต 2/3, หน้าอื่น ๆ — ไม่มี JavaScript error')
process.exit(0)




