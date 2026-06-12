import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CodeLens from '../components/codelens/CodeLens.jsx'

export default function CodeLensPage() {
  const navigate = useNavigate()

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
      <CodeLens onBack={() => navigate(-1)} />
    </div>
  )
}
