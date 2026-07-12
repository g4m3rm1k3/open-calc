import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DecompLab from './DecompLab.jsx'

export default function DecompLabPage() {
  const navigate = useNavigate()
  useEffect(() => {
    document.title = 'Decomp Lab — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 50 }}>
      <DecompLab onBack={() => navigate('/')} />
    </div>
  )
}
