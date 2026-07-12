import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HtmlLab from './HtmlLab'

export default function HtmlLabPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'HTML Lab — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <HtmlLab onBack={() => navigate('/')} />
    </div>
  )
}
