import content from '../content.generated.json'

export default function About() {
  return (
    <div className="stack">
      <section className="panel">
        <h2>เกี่ยวกับระบบต้นแบบ</h2>
        <p>
          <strong>ThaiMed WorkWell Sakhon</strong> เป็นเว็บไซต์ต้นแบบประกอบข้อเสนอวิสัยทัศน์ เรื่อง
          “การพัฒนาระบบประเมินอาการปวดและส่งเสริมการดูแลตนเองด้วยศาสตร์การแพทย์แผนไทย”
          เพื่อสาธิตกระบวนการเลือกตำแหน่งปวด ประเมินอาการ คัดกรองความเสี่ยง และแสดงคำแนะนำการดูแลตนเองเบื้องต้น พร้อมเชื่อมโยงข้อมูลหน่วยบริการแพทย์แผนไทย
        </p>
        <h3>วัตถุประสงค์</h3>
        <ol>
          <li>เพื่อพัฒนาเว็บไซต์ต้นแบบสำหรับประเมินอาการปวดคอ บ่า และหลังในประชาชนวัยทำงาน</li>
          <li>เพื่อออกแบบกระบวนการคัดกรองข้อควรระวังก่อนแสดงสื่อท่าฤๅษีดัดตนและคำแนะนำการดูแลตนเอง</li>
          <li>เพื่อเพิ่มช่องทางสืบค้นบริการแพทย์แผนไทยและประเมินความเหมาะสมของระบบสำหรับขยายผล</li>
        </ol>
      </section>

      <section className="panel caution">
        <h3>ข้อจำกัดสำคัญ</h3>
        <ul>
          <li>ระบบไม่ใช้เพื่อวินิจฉัยโรคหรือสั่งการรักษาโดยอัตโนมัติ</li>
          <li>ใช้ข้อมูลสมมติ ไม่เก็บข้อมูลสุขภาพที่ระบุตัวบุคคล สถิติการใช้งานเก็บแบบไม่ระบุตัวตนในเครื่องที่ใช้งานเท่านั้น</li>
          <li>เป็นระบบต้นแบบที่ยังไม่ผ่านการรับรองให้ใช้คัดกรองทางคลินิกจริง</li>
          <li>ข้อมูลหน่วยบริการจริงและเกณฑ์ทางคลินิกที่จะใช้กับประชาชน ต้องได้รับการตรวจสอบและอนุมัติก่อนนำไปใช้จริง</li>
          <li>คะแนนความปวดที่เปลี่ยนแปลงไม่ถือเป็นหลักฐานยืนยันผลการรักษา</li>
        </ul>
      </section>

      <section className="panel">
        <h3>เอกสารประกอบ</h3>
        {__HAS_PROPOSAL__ ? (
          <p>
            <a className="btn primary" href="./docs/proposal.docx" download>ดาวน์โหลดเอกสารข้อเสนอ (.docx)</a>
          </p>
        ) : null}
        <h3>เอกสารวิชาการอ้างอิง</h3>
        <ol className="refs">
          {content.references.map((r) => (
            <li key={r.no}>
              {r.text}{' '}
              {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.url}</a> : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h3>เครดิตและสัญญาอนุญาตของส่วนประกอบ</h3>
        <ul>
          <li>ภาพประกอบ (โลโก้ ภาพร่างกาย ภาพท่า ภาพอาคารหน่วยบริการ) วาดขึ้นเองสำหรับต้นแบบนี้</li>
          <li>
            ภาพแบนเนอร์หัวเว็บ: “<a href="https://commons.wikimedia.org/wiki/File:%E0%B8%97%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%A3%E0%B8%B7%E0%B8%AD%E0%B8%AA%E0%B8%A1%E0%B8%B8%E0%B8%97%E0%B8%A3%E0%B8%AA%E0%B8%B2%E0%B8%84%E0%B8%A3_-_panoramio.jpg" target="_blank" rel="noopener noreferrer">ท่าเรือสมุทรสาคร</a>”
            ถ่ายโดย :::=UT=::: (Panoramio) ผ่าน Wikimedia Commons ใช้ตามสัญญาอนุญาต{' '}
            <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.th" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>{' '}
            มีการดัดแปลง: ครอปเป็นแนวนอน ย่อขนาด และไล่เฉดสีที่ขอบภาพ (ภาพที่ดัดแปลงนี้เผยแพร่ภายใต้สัญญาอนุญาตเดียวกัน)
          </li>
          <li>ฟอนต์ <a href="https://fonts.google.com/specimen/Prompt" target="_blank" rel="noopener noreferrer">Prompt</a> — SIL Open Font License 1.1</li>
          <li>ไอคอนเส้นดัดแปลงจาก <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer">Lucide</a> — ISC License</li>
        </ul>
      </section>
    </div>
  )
}



