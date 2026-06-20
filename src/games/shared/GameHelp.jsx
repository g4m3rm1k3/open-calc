import { useState } from 'react'

/**
 * Drop-in "how do I play this" affordance for any game package.
 * Self-contained: renders its own floating trigger button and modal,
 * no state plumbing required from the parent game.
 *
 * sections: [{ heading: string, body: string }]
 */
export default function GameHelp({ title, sections = [], defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="How to play"
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 250,
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(20,20,24,0.85)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.25)',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
          cursor: 'pointer', pointerEvents: 'auto',
        }}
      >?</button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 260,
            background: 'rgba(5,8,12,0.75)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'auto', padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#11161d', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16, padding: '24px 28px', maxWidth: 460, width: '100%',
              maxHeight: '80vh', overflowY: 'auto', color: '#e8eef2',
              fontFamily: "'DM Sans', sans-serif", boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{title}</h2>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9aa7b0', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
              >✕</button>
            </div>
            {sections.map(s => (
              <div key={s.heading} style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8fd3ff', margin: '0 0 4px' }}>
                  {s.heading}
                </h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#c7d2d8', margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
