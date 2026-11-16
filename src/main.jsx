import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './fonts.css'
import './styles.css'

// ไม่ใช้ StrictMode เพื่อไม่ให้ effect เริ่มเซสชันสถิติทำงานซ้ำสองครั้งในโหมด dev
createRoot(document.getElementById('root')).render(<App />)
