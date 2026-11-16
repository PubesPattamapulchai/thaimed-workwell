import { useEffect, useState } from 'react'
import Img from './components/Img.jsx'
import Home from './components/Home.jsx'
import Wizard from './components/Wizard.jsx'
import Services from './components/Services.jsx'
import Survey from './components/Survey.jsx'
import About from './components/About.jsx'
import Stats from './components/Stats.jsx'

const NAV = [
  ['', 'หน้าหลัก'],
  ['assess', 'ประเมินอาการ'],
  ['services', 'หน่วยบริการ'],
  ['survey', 'ความพึงพอใจ'],
  ['about', 'เกี่ยวกับต้นแบบ'],
]

function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  const [head, arg] = route.split('/')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  let page
  if (head === 'assess') page = <Wizard key={route} demoId={arg} />
  else if (head === 'services') page = <Services standalone />
  else if (head === 'survey') page = <Survey />
  else if (head === 'about') page = <About />
  else if (head === 'stats') page = <Stats />
  else page = <Home />

  return (
    <div className="app">
      <div className="proto-banner" role="note">
        ระบบต้นแบบ · ใช้ข้อมูลจำลอง · ไม่ใช่เครื่องมือวินิจฉัยโรคหรือสั่งการรักษา และยังไม่ผ่านการรับรองให้ใช้คัดกรองทางคลินิกจริง
      </div>
      <header className="site-header">
        <div className="header-art" aria-hidden="true">
          <Img file="banner.jpg" label="แบนเนอร์หัวเว็บ" className="header-banner" alt="" />
          <svg className="header-wave" viewBox="0 0 1200 110" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hill-l" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#8fd08f" />
                <stop offset="1" stopColor="#4fae5b" />
              </linearGradient>
              <linearGradient id="hill-r" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#d8d04a" />
                <stop offset="1" stopColor="#8cc63f" />
              </linearGradient>
            </defs>
            <path d="M0 62 C 140 14, 330 10, 520 70 C 560 84, 580 96, 600 110 L0 110 Z" fill="url(#hill-l)" opacity=".75" />
            <path d="M0 86 C 180 46, 360 52, 560 96 L580 110 L0 110 Z" fill="#3f9d4d" opacity=".85" />
            <path d="M520 110 C 700 58, 940 30, 1200 28 L1200 110 Z" fill="url(#hill-r)" opacity=".6" />
            <path d="M640 110 C 820 74, 1000 62, 1200 66 L1200 110 Z" fill="#7cbd3b" opacity=".85" />
          </svg>
        </div>
        <div className="header-inner">
          <a className="brand" href="#/">
            <Img file="logo.png" label="โลโก้" className="brand-logo" alt="โลโก้ ThaiMed WorkWell Sakhon" />
            <span className="brand-text">
              <strong>ThaiMed WorkWell <em>Sakhon</em></strong>
              <small>ประเมินอาการปวด • ดูแลสุขภาพด้วยศาสตร์การแพทย์แผนไทย<br />สำหรับประชาชนวัยทำงาน จังหวัดสมุทรสาคร</small>
            </span>
          </a>
          <nav className="main-nav" aria-label="เมนูหลัก">
            {NAV.map(([key, label]) => (
              <a key={key} href={`#/${key}`} className={head === key || (key === '' && !head) ? 'on' : ''}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="site-main">{page}</main>
      <footer className="site-footer">
        <svg className="footer-wave" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 H1200 V22 C 980 62, 760 4, 560 30 C 340 58, 160 6, 0 34 Z" fill="#f4faf5" />
        </svg>
        <p>ThaiMed WorkWell Sakhon · ระบบต้นแบบเพื่อการสาธิต · ข้อมูลหน่วยบริการและเกณฑ์ทางคลินิกต้องได้รับการตรวจสอบและอนุมัติก่อนนำไปใช้จริง</p>
      </footer>
    </div>
  )
}
