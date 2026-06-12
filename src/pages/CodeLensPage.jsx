import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CodeLens from '../components/codelens/CodeLens.jsx'

// Read the handoff payload without deleting it — the initializer must be pure
// (StrictMode calls it twice in dev; deleting inside would wipe it on the first call).
function peekHandoff() {
  try {
    const raw = localStorage.getItem('codelens-handoff')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function CodeLensPage() {
  const navigate = useNavigate()
  // useState initializer is pure — only reads, never deletes
  const [handoff] = useState(peekHandoff)
  const cleanedUp = useRef(false)

  // Delete the item exactly once after the component has truly mounted
  useEffect(() => {
    if (!cleanedUp.current) {
      cleanedUp.current = true
      localStorage.removeItem('codelens-handoff')
    }
  }, [])

  useEffect(() => {
    document.title = 'CodeLens — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#080c14',
      overflow: 'hidden',
      zIndex: 50,
    }}>
      <CodeLens
        onBack={() => navigate(-1)}
        initialCode={handoff?.code}
        initialLang={handoff?.lang}
      />
    </div>
  )
}
