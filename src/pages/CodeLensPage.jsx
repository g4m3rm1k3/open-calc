import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CodeLens from '../components/codelens/CodeLens.jsx'

function peekHandoff() {
  try {
    const raw = localStorage.getItem('codelens-handoff')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function peekLessonReturn() {
  try {
    return {
      path:  sessionStorage.getItem('codelens_return_path')  || null,
      label: sessionStorage.getItem('codelens_return_label') || null,
    }
  } catch { return { path: null, label: null } }
}

export default function CodeLensPage() {
  const navigate = useNavigate()
  const [handoff] = useState(peekHandoff)
  const [lessonReturn] = useState(peekLessonReturn)
  const cleanedUp = useRef(false)

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

  function handleBack() {
    if (lessonReturn?.path) {
      try {
        sessionStorage.removeItem('codelens_return_path')
        sessionStorage.removeItem('codelens_return_label')
      } catch {}
      window.location.hash = lessonReturn.path.replace(/^#/, '')
    } else {
      navigate(-1)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#080c14',
      overflow: 'hidden',
      zIndex: 50,
    }}>
      <CodeLens
        onBack={handleBack}
        initialCode={handoff?.code}
        initialLang={handoff?.lang}
        backLabel={lessonReturn?.label || undefined}
      />
    </div>
  )
}
