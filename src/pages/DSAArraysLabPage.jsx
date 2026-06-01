import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DSA01Arrays from '../components/viz/dsa/DSA01Arrays.jsx'

export default function DSAArraysLabPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Arrays & Memory Lab — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#080c0f',
      overflow: 'hidden',
      zIndex: 50,
    }}>
      <DSA01Arrays onBack={() => navigate(-1)} />
    </div>
  )
}
