import { useRef, useEffect, useState, useMemo } from 'react'
import { useProgress } from '../../hooks/useProgress.js'

const W        = 168   // display px  (SVG viewBox 210)
const H        = 64    // display px  (SVG viewBox 80)
const SPEED    = 0.5
const BOTTOM   = 4
const TAIL_X   = 8
const HEAD_X   = 168
const CENTER_Y = 40
const N_PTS    = 52    // wave sample points

function msUntilMidnight() {
  const m = new Date(); m.setHours(24,0,0,0); return m - new Date()
}

// Compute polyline points string for the body wave
function bodyPts(amp, freq, phase) {
  let s = ''
  for (let i = 0; i <= N_PTS; i++) {
    const bx = TAIL_X + (HEAD_X - TAIL_X) * (i / N_PTS)
    const by = CENTER_Y + amp * Math.sin(bx * freq + phase)
    s += `${bx.toFixed(1)},${by.toFixed(1)} `
  }
  return s
}

const CSS = `
.monty-wrap {
  position: fixed; bottom: ${BOTTOM}px; z-index: 60;
  cursor: pointer; user-select: none;
  width: ${W}px; height: ${H}px;
}
@media(max-width:767px){ .monty-wrap { display:none; } }
.ms-eye { animation: ms-eye  2.8s ease-in-out infinite; }
.ms-tng { animation: ms-tng  4.2s linear infinite; transform-origin:30px 2px; }
.mb1    { animation: mb1 3.3s linear infinite; }
.mb2    { animation: mb2 4.5s linear infinite; }
.mb3    { animation: mb3 2.8s linear infinite; }
.mb4    { animation: mb4 5.0s linear infinite; }
@keyframes ms-eye { 0%,100%{opacity:.78} 50%{opacity:1} }
@keyframes ms-tng {
  0%,82%,100%{opacity:0; transform:scaleX(1)}
  84%,91%{opacity:1; transform:scaleX(1)}
  88%{opacity:1; transform:scaleX(1.08)}
  93%{opacity:0}
}
@keyframes mb1 { 0%,7.9%,11.1%,43%,46.1%,73%,76.1%,100%{opacity:0} 8%,11%{opacity:1} 43.1%,46%{opacity:.9} 73.1%,76%{opacity:1} }
@keyframes mb2 { 0%,19.9%,23.1%,56%,59.1%,88%,91.1%,100%{opacity:0} 20%,23%{opacity:1} 56.1%,59%{opacity:.85} 88.1%,91%{opacity:1} }
@keyframes mb3 { 0%,34.9%,38.1%,66%,69.1%,100%{opacity:0} 35%,38%{opacity:.9} 66.1%,69%{opacity:1} }
@keyframes mb4 { 0%,4.9%,7.1%,49%,52.1%,79%,82.1%,100%{opacity:0} 5%,7%{opacity:1} 49.1%,52%{opacity:.85} 79.1%,82%{opacity:1} }
`

// Bolt shape: drawn relative to origin (0,0), arcs upward by default
const BOLT_UP   = 'M0,-2 L-4,-12 L-1,-11 L-5,-21'
const BOLT_DOWN = 'M0,2  L4,12  L1,11   L5,21'

function BoltPaths({ d, color, gc }) {
  return (
    <>
      <path d={d} stroke={gc}    strokeWidth="4.5" fill="none" strokeLinecap="round" opacity=".45" filter="url(#mf-gw)"/>
      <path d={d} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".9"/>
      <path d={d} stroke="white" strokeWidth=".7"  fill="none" strokeLinecap="round"/>
    </>
  )
}

function MontySVG({ bodyRef, bodyGlRef, headRef, tailRef, bolt1Ref, bolt2Ref }) {
  return (
    <svg viewBox="0 0 210 80" width={W} height={H}
         style={{ overflow:'visible', display:'block' }}>
      <defs>
        <filter id="mf-eg" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="mf-gw" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/></feMerge>
        </filter>
        <radialGradient id="mf-hg" cx="35%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#FFFFFF"/>
          <stop offset="65%"  stopColor="#F0F6FF"/>
          <stop offset="100%" stopColor="#C4D8EE"/>
        </radialGradient>
      </defs>

      {/* Ground shadow — static */}
      <ellipse cx="88" cy="78" rx="76" ry="4" fill="rgba(0,0,0,.20)"/>

      {/* Body polylines — points set each frame by rAF */}
      <polyline ref={bodyGlRef} fill="none"
        stroke="rgba(110,195,255,0.16)" strokeWidth="28"
        strokeLinecap="round" strokeLinejoin="round"/>
      <polyline ref={bodyRef} fill="none"
        stroke="white" strokeWidth="14"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Underbelly sheen on same line — static-looking, updated via ref too */}
      {/* (rendered as a slightly lighter polyline; we update it alongside bodyRef) */}

      {/* Tail group — translated + rotated each frame */}
      <g ref={tailRef}>
        <polygon points="0,-3 0,3 -15,0" fill="#EEFAFF" opacity=".88"/>
        <polygon points="0,-1.5 0,1.5 -15,0" fill="#C4DCEE" opacity=".55"/>
      </g>

      {/* Lightning bolts tracked on body (positions updated each frame) */}
      <g ref={bolt1Ref} className="mb1">
        <BoltPaths d={BOLT_UP} color="#FFFFFF" gc="#00AAFF"/>
      </g>
      <g ref={bolt2Ref} className="mb3">
        <BoltPaths d={BOLT_DOWN} color="#FFE566" gc="#FFA500"/>
      </g>

      {/* Head group — translated + rotated each frame */}
      <g ref={headRef}>
        {/* Head shape, facing +x, connected to body at origin */}
        <path
          d="M-3,0 C0,-10 20,-10 30,0 C33,5 30,11 26,13 C18,15 -1,12 -3,6 Z"
          fill="url(#mf-hg)"
        />
        {/* Top sheen */}
        <path d="M2,-4 C10,-8 22,-7 28,0"
              stroke="rgba(255,255,255,.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Scale lines */}
        <path d="M6,-2 C11,-5 19,-4 23,-1"
              stroke="rgba(130,195,235,.32)" strokeWidth=".8" fill="none"/>
        {/* Nostril */}
        <ellipse cx="29" cy="2" rx="1.5" ry="1" fill="rgba(90,150,200,.55)"/>
        {/* Heat pit */}
        <ellipse cx="26" cy="8" rx="1.5" ry="1.1" fill="rgba(0,90,170,.4)"/>

        {/* EYE — large, slit pupil */}
        <circle cx="14" cy="1" r="6.5" fill="#050515"/>
        <circle cx="14" cy="1" r="4.5" fill="#00D0FF"
                className="ms-eye" filter="url(#mf-eg)"/>
        <circle cx="14" cy="1" r="2.5" fill="#66EEFF"/>
        {/* Vertical slit */}
        <rect x="13" y="-3.5" width="2" height="9" rx="1" fill="#020210" opacity=".9"/>
        {/* Highlight */}
        <circle cx="12.5" cy="-1.5" r="1" fill="white" opacity=".9"/>

        {/* TONGUE */}
        <g className="ms-tng">
          <line x1="30" y1="3" x2="39" y2="3"
                stroke="#FF1060" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="39" y1="3" x2="46" y2="-2"
                stroke="#FF1060" strokeWidth="1.1" strokeLinecap="round"/>
          <line x1="39" y1="3" x2="46" y2="8"
                stroke="#FF1060" strokeWidth="1.1" strokeLinecap="round"/>
        </g>

        {/* Lightning bolt on head */}
        <g className="mb2">
          <BoltPaths d="M6,-14 L10,-22 L7,-21 L11,-29" color="#00D4FF" gc="#0066FF"/>
        </g>
        {/* Tail-area bolt (attached to head group so it's always visible) */}
        <g className="mb4" transform="translate(-140,0)">
          <BoltPaths d={BOLT_UP} color="#00E5FF" gc="#0044FF"/>
        </g>
      </g>
    </svg>
  )
}

export default function AlphaMascot() {
  const { progress } = useProgress()

  const xp = useMemo(() => (
    Object.values(progress).reduce((s, p) =>
      s + (p.quiz?.correct ?? 0) * 5 + (p.completedCheckpoints?.length ?? 0) * 2, 0)
  ), [progress])
  const level     = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100

  const [hovered,  setHovered]  = useState(false)
  const [open,     setOpen]     = useState(false)
  const [ctxMenu,  setCtxMenu]  = useState(null)
  const [hidden,   setHidden]   = useState(() => {
    try {
      const s = localStorage.getItem('monty-hidden')
      return s ? Date.now() < JSON.parse(s).hiddenUntil : false
    } catch { return false }
  })

  // Refs — all movement via direct DOM to avoid 60fps React re-renders
  const wrapRef   = useRef(null)
  const bodyRef   = useRef(null)
  const bodyGlRef = useRef(null)
  const headRef   = useRef(null)
  const tailRef   = useRef(null)
  const bolt1Ref  = useRef(null)
  const bolt2Ref  = useRef(null)

  const xRef      = useRef(160)
  const dirRef    = useRef(1)
  const phaseRef  = useRef(0)
  const timeRef   = useRef(0)
  const prevTsRef = useRef(null)
  const pauseRef  = useRef(false)
  const rafRef    = useRef(null)

  useEffect(() => {
    const tick = (ts) => {
      const dt = prevTsRef.current ? Math.min(ts - prevTsRef.current, 50) : 16
      prevTsRef.current = ts
      timeRef.current += dt

      const t    = timeRef.current * 0.001
      const amp  = 11 + 5  * Math.sin(t * 0.36)           // amplitude drifts 6→16
      const freq = 0.062 + 0.018 * Math.sin(t * 0.23 + 1.5) // freq drifts loosely

      phaseRef.current += pauseRef.current ? 0.022 : 0.09 // slow idle, faster walking

      // Move horizontally
      if (!pauseRef.current && wrapRef.current) {
        const max = window.innerWidth - W - 24
        xRef.current += SPEED * dirRef.current
        if (xRef.current >= max) {
          xRef.current = max; dirRef.current = -1
          wrapRef.current.style.transform = `scaleX(-1) drop-shadow()`
          wrapRef.current.style.transform = 'scaleX(-1)'
        } else if (xRef.current <= 24) {
          xRef.current = 24; dirRef.current = 1
          wrapRef.current.style.transform = 'scaleX(1)'
        }
        wrapRef.current.style.left = xRef.current + 'px'
      }

      const ph = phaseRef.current

      // Update body polyline
      if (bodyRef.current && bodyGlRef.current) {
        const pts = bodyPts(amp, freq, ph)
        bodyRef.current.setAttribute('points', pts)
        bodyGlRef.current.setAttribute('points', pts)
      }

      // Position head at end of wave + rotate to match slope
      if (headRef.current) {
        const yh  = CENTER_Y + amp * Math.sin(HEAD_X * freq + ph)
        const dh  = amp * freq * Math.cos(HEAD_X * freq + ph)
        const ah  = Math.atan2(dh, 1) * 180 / Math.PI
        headRef.current.setAttribute('transform',
          `translate(${HEAD_X},${yh.toFixed(1)}) rotate(${ah.toFixed(1)})`)
      }

      // Position tail at start of wave
      if (tailRef.current) {
        const yt  = CENTER_Y + amp * Math.sin(TAIL_X * freq + ph)
        const dt2 = amp * freq * Math.cos(TAIL_X * freq + ph)
        const at  = Math.atan2(dt2, 1) * 180 / Math.PI
        tailRef.current.setAttribute('transform',
          `translate(${TAIL_X},${yt.toFixed(1)}) rotate(${at.toFixed(1)})`)
      }

      // Track two bolt groups on specific body x positions
      const bx1 = 62, bx2 = 122
      if (bolt1Ref.current) {
        const by1 = CENTER_Y + amp * Math.sin(bx1 * freq + ph)
        bolt1Ref.current.setAttribute('transform', `translate(${bx1},${by1.toFixed(1)})`)
      }
      if (bolt2Ref.current) {
        const by2 = CENTER_Y + amp * Math.sin(bx2 * freq + ph)
        bolt2Ref.current.setAttribute('transform', `translate(${bx2},${by2.toFixed(1)})`)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => { pauseRef.current = hovered || open }, [hovered, open])

  const hideFor = (ms) => {
    localStorage.setItem('monty-hidden', JSON.stringify({ hiddenUntil: Date.now() + ms }))
    setHidden(true); setCtxMenu(null); setOpen(false)
  }

  const glowStyle = hovered
    ? 'drop-shadow(0 0 16px rgba(0,210,255,.80)) drop-shadow(0 2px 10px rgba(0,0,0,.5))'
    : 'drop-shadow(0 0 9px rgba(0,210,255,.38)) drop-shadow(0 2px 8px rgba(0,0,0,.45))'

  // Read x at render time (fine — only renders on hover/open/state changes)
  const cx = xRef.current

  if (hidden) {
    return (
      <>
        <style>{CSS}</style>
        <button onClick={() => { localStorage.removeItem('monty-hidden'); setHidden(false) }}
          title="Bring Monty back"
          style={{
            position:'fixed', bottom:8, right:12, zIndex:60,
            background:'rgba(0,6,20,.82)', border:'1px solid rgba(0,212,255,.35)',
            borderRadius:8, padding:'5px 10px', color:'#00D4FF', fontSize:14,
            cursor:'pointer', backdropFilter:'blur(8px)',
            boxShadow:'0 0 10px rgba(0,212,255,.2)', lineHeight:1,
          }}>
          ⚡
        </button>
      </>
    )
  }

  return (
    <>
      <style>{CSS}</style>

      {/* Right-click context menu */}
      {ctxMenu && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:69 }} onClick={() => setCtxMenu(null)}/>
          <div style={{
            position:'fixed', left: Math.min(ctxMenu.x, window.innerWidth-196), top: ctxMenu.y - 4,
            zIndex:70, minWidth:185,
            background:'rgba(2,6,24,.97)', border:'1px solid rgba(0,212,255,.3)',
            borderRadius:10, overflow:'hidden',
            boxShadow:'0 8px 32px rgba(0,0,0,.65)', backdropFilter:'blur(16px)',
          }}>
            {[
              ['🍅  Hide 20 min (Pomodoro)', 20 * 60000],
              ['⏰  Hide for 1 hour',        60 * 60000],
              ['🌙  Hide for today',          msUntilMidnight()],
            ].map(([label, ms]) => (
              <button key={label} onClick={() => hideFor(ms)} style={{
                display:'block', width:'100%', padding:'10px 14px',
                background:'none', border:'none', borderBottom:'1px solid rgba(255,255,255,.05)',
                color:'rgba(255,255,255,.85)', fontSize:13, cursor:'pointer', textAlign:'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,.09)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                {label}
              </button>
            ))}
            <button onClick={() => setCtxMenu(null)} style={{
              display:'block', width:'100%', padding:'8px 14px',
              background:'none', border:'none',
              color:'rgba(255,255,255,.38)', fontSize:12, cursor:'pointer', textAlign:'left',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.65)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.38)'}>
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Snake */}
      <div
        ref={wrapRef}
        className="monty-wrap"
        style={{ left: cx, filter: glowStyle }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { setCtxMenu(null); setOpen(o => !o) }}
        onContextMenu={e => { e.preventDefault(); setOpen(false); setCtxMenu({ x: e.clientX, y: e.clientY }) }}
      >
        <MontySVG
          bodyRef={bodyRef} bodyGlRef={bodyGlRef}
          headRef={headRef} tailRef={tailRef}
          bolt1Ref={bolt1Ref} bolt2Ref={bolt2Ref}
        />
      </div>

      {/* Name tag */}
      {hovered && !open && (
        <div style={{
          position:'fixed', bottom: H + BOTTOM + 6, left: cx + W/2,
          transform:'translateX(-50%)', zIndex:62, pointerEvents:'none',
        }}>
          <div style={{
            background:'rgba(0,6,20,.92)', border:'1px solid rgba(0,212,255,.5)',
            borderRadius:8, padding:'4px 12px', color:'#00D4FF',
            fontSize:11, fontWeight:800, letterSpacing:'.12em', whiteSpace:'nowrap',
            backdropFilter:'blur(10px)', boxShadow:'0 0 14px rgba(0,212,255,.35)',
            textShadow:'0 0 8px rgba(0,212,255,.8)',
          }}>
            MONTY ⚡
          </div>
        </div>
      )}

      {/* Chat / XP bubble */}
      {open && (() => {
        const bw  = 256
        const bl  = Math.max(8, Math.min(cx + W/2 - bw/2, window.innerWidth - bw - 8))
        const arr = Math.min(Math.max(cx + W/2 - bl - 8, 12), bw - 28)
        return (
          <div style={{ position:'fixed', bottom: H + BOTTOM + 14, left: bl, zIndex:63, width: bw }}>
            <div style={{
              background:'rgba(2,6,24,.97)', border:'1px solid rgba(0,212,255,.32)',
              borderRadius:14, padding:'14px 16px',
              backdropFilter:'blur(16px)',
              boxShadow:'0 0 28px rgba(0,212,255,.18), 0 8px 32px rgba(0,0,0,.6)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span style={{ fontSize:15 }}>⚡</span>
                <span style={{ color:'#00D4FF', fontWeight:800, fontSize:11, letterSpacing:'.1em' }}>MONTY</span>
                <span style={{ color:'rgba(0,212,255,.45)', fontSize:10, marginLeft:2 }}>LV. {level}</span>
                <button onClick={e => { e.stopPropagation(); setOpen(false) }}
                  style={{ marginLeft:'auto', background:'none', border:'none',
                    color:'rgba(255,255,255,.3)', cursor:'pointer', fontSize:14, lineHeight:1, padding:'0 2px' }}>✕
                </button>
              </div>
              <p style={{ fontSize:13, lineHeight:1.6, margin:'0 0 12px', color:'rgba(255,255,255,.88)' }}>
                Ssss… I'm Monty — your electric python. <span style={{ color:'#00D4FF' }}>⚡</span><br/>
                <span style={{ color:'rgba(255,255,255,.42)', fontSize:11 }}>
                  {xp === 0 ? 'Complete a quiz to charge me up!' : `${xp} XP earned so far. Keep going!`}
                </span>
              </p>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10,
                  color:'rgba(0,212,255,.6)', marginBottom:5, fontWeight:700, letterSpacing:'.08em' }}>
                  <span>LV {level}</span><span>{xpInLevel} / 100 XP</span>
                </div>
                <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,.07)' }}>
                  <div style={{
                    height:'100%', width:`${xpInLevel}%`,
                    background:'linear-gradient(90deg,#00D4FF,#7DF9FF)',
                    borderRadius:2, boxShadow:'0 0 6px rgba(0,212,255,.5)',
                    transition:'width .6s ease',
                  }}/>
                </div>
              </div>
            </div>
            <div style={{
              position:'absolute', bottom:-8, left: arr, width:0, height:0,
              borderLeft:'8px solid transparent', borderRight:'8px solid transparent',
              borderTop:'8px solid rgba(0,212,255,.32)',
            }}/>
          </div>
        )
      })()}
    </>
  )
}
