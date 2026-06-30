import { useState, useEffect } from 'react'

export default function CloneProgressModal({ onComplete, onError }) {
  const [phase, setPhase] = useState('downloading')
  const [percent, setPercent] = useState(0)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!window.openCalcDesktop) return

    const unsub = window.openCalcDesktop.onCloneProgress((data) => {
      if (data.phase === 'error') {
        setError(data.error)
        onError?.(data.error)
        return
      }
      setPhase(data.phase)
      setPercent(data.percent ?? 0)
      if (data.phase === 'done') {
        setDone(true)
        setTimeout(() => onComplete?.(), 1200)
      }
    })

    window.openCalcDesktop.cloneRepo()

    return () => unsub?.()
  }, [])

  const phaseLabel = {
    downloading: 'Downloading repository…',
    extracting: 'Unpacking files…',
    done: 'Ready!',
  }[phase] ?? 'Working…'

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div style={{
        background: '#0d1117', border: '1px solid #30363d', borderRadius: 14,
        width: 420, maxWidth: '92vw', padding: 32, textAlign: 'center',
      }}>
        {error ? (
          <>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: '#f87171', fontSize: 14, marginBottom: 8 }}>Clone failed</p>
            <p style={{ color: '#8b949e', fontSize: 12, fontFamily: 'monospace', marginBottom: 20 }}>{error}</p>
            <button
              onClick={() => onError?.(error)}
              style={{
                padding: '8px 20px', borderRadius: 6, border: '1px solid #30363d',
                background: 'transparent', color: '#8b949e', cursor: 'pointer', fontSize: 13,
              }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>
              {done ? '✅' : '📦'}
            </div>
            <p style={{ color: '#e6edf3', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
              {done ? 'Ready!' : 'Setting up contributor mode'}
            </p>
            <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 20 }}>
              {done ? 'Opening the editor…' : phaseLabel}
            </p>
            <div style={{ background: '#21262d', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 8 }}>
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: done ? '#3fb950' : '#58a6ff',
                  borderRadius: 8,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <p style={{ color: '#484f58', fontSize: 11 }}>{percent}%</p>
          </>
        )}
      </div>
    </div>
  )
}
