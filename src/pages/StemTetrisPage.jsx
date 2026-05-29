import StemTetris from '../components/tools/StemTetris.jsx'

export default function StemTetrisPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#050a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 12px',
      overflowX: 'auto',
    }}>
      <StemTetris />
    </div>
  )
}
