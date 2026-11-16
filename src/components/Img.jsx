import { useState } from 'react'

// ช่องใส่รูป: ลองโหลด public/images/<file> ก่อน (jpg/png ที่คุณวางเอง) ถ้าไม่มีลอง <ชื่อเดียวกัน>.svg
// (ภาพประกอบต้นฉบับที่สร้างไว้) ถ้าไม่มีทั้งสองแบบ แสดงกรอบ "ใส่รูปที่นี่"
// className ที่มีคำว่า compact = กรอบเล็ก ซ่อนชื่อไฟล์ (CSS)
export default function Img({ file, label, className = '', alt }) {
  const candidates = file ? [...new Set([file, file.replace(/\.[^.]+$/, '') + '.svg'])] : []
  const [i, setI] = useState(0)
  const src = candidates[i]
  if (!src) {
    return (
      <div className={`img-slot ${className}`} role="img" aria-label={alt ?? label ?? 'ตำแหน่งรูปภาพ'}>
        <span>ใส่รูปที่นี่</span>
        {file ? <code>{file}</code> : null}
        {label ? <small>{label}</small> : null}
      </div>
    )
  }
  return <img className={className} src={`./images/${src}`} alt={alt ?? label ?? ''} onError={() => setI(i + 1)} />
}
