import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// ปุ่มดาวน์โหลดเอกสารในหน้า "เกี่ยวกับ" แสดงเฉพาะเมื่อมีไฟล์ public/docs/proposal.docx ตอน build
// (ไฟล์นี้ไม่ถูกใส่ใน repo เพราะมีชื่อบุคคล — ดู .gitignore)
const hasProposal = fs.existsSync(new URL('./public/docs/proposal.docx', import.meta.url))

// base './' + single-file build => dist/index.html opens by double-click (file://) and
// can be hosted in any sub-folder (GitHub Pages / Netlify). Images in public/images stay as separate files.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  define: { __HAS_PROPOSAL__: JSON.stringify(hasProposal) },
  test: { environment: 'node', include: ['src/**/*.test.{js,jsx}', 'scripts/**/*.test.js'] },
})
