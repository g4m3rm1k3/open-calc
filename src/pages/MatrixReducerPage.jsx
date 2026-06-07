import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MatrixReducer from '../components/viz/react/MatrixReducer.jsx'

export default function MatrixReducerPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Matrix Reducer — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'auto', zIndex: 50 }}>
      <MatrixReducer onBack={() => navigate('/labs')} />
    </div>
  )
}
