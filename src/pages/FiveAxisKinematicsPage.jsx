import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FiveAxisKinematics from '../components/tools/FiveAxisKinematics.jsx'

export default function FiveAxisKinematicsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '5-Axis Kinematics — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div style={{ position:'fixed', inset:0, background:'#0e0e12', overflow:'hidden', zIndex:50 }}>
      <FiveAxisKinematics onBack={() => navigate('/labs')} />
    </div>
  )
}
