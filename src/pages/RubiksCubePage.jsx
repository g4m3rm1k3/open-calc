import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RubiksCube from '../components/tools/RubiksCube.jsx'

export default function RubiksCubePage() {
  const navigate = useNavigate()
  useEffect(() => {
    document.title = "Rubik's Cube — UpSkillOS"
    return () => { document.title = 'UpSkillOS' }
  }, [])
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at 30% 20%, #0a1a2e 0%, #050810 60%, #0d0a20 100%)',
      overflow: 'auto',
      zIndex: 50,
    }}>
      <RubiksCube onBack={() => navigate('/games')} />
    </div>
  )
}
