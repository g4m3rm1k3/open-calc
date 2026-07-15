import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FiveAxisKinematics from './FiveAxisKinematics.tsx'

export default function FiveAxisKinematicsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '5-Axis Kinematics — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    // AppShell.jsx already wraps this route's <Outlet/> in a
    // h-[calc(100vh-44px)] container that reserves space for the persistent
    // taskbar (see its isFiveAxisRoute branch) — filling that normally
    // (rather than position:fixed;inset:0, which ignores the parent's size
    // and covers the full viewport, including the strip the taskbar sits
    // in) is what keeps this lab's own bottom content from ending up
    // rendered underneath the taskbar.
    <div style={{ width: '100%', height: '100%', background: '#0e0e12', overflow: 'hidden' }}>
      <FiveAxisKinematics onBack={() => navigate('/')} />
    </div>
  )
}
