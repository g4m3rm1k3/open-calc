import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DSA02LinkedLists from '../components/viz/dsa/DSA02LinkedLists.jsx'

export default function DSALinkedListsLabPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Linked Lists Lab — UpSkillOS'
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
      <DSA02LinkedLists onBack={() => navigate(-1)} />
    </div>
  )
}
