import { useState, useEffect, useRef } from 'react'

// ── colour tokens ────────────────────────────────────────────────────────────
function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg:       dark ? '#0f172a' : '#f8fafc',
    surface:  dark ? '#1e293b' : '#ffffff',
    surface2: dark ? '#0f172a' : '#f1f5f9',
    border:   dark ? '#334155' : '#e2e8f0',
    text:     dark ? '#e2e8f0' : '#1e293b',
    muted:    dark ? '#94a3b8' : '#64748b',
    hint:     dark ? '#475569' : '#94a3b8',
    blue:     dark ? '#38bdf8' : '#0284c7',
    blueBg:   dark ? 'rgba(56,189,248,0.12)' : 'rgba(2,132,199,0.08)',
    blueBd:   dark ? '#38bdf8' : '#0284c7',
    amber:    dark ? '#fbbf24' : '#d97706',
    amberBg:  dark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.08)',
    amberBd:  dark ? '#fbbf24' : '#d97706',
    green:    dark ? '#4ade80' : '#16a34a',
    greenBg:  dark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)',
    greenBd:  dark ? '#4ade80' : '#16a34a',
    red:      dark ? '#f87171' : '#dc2626',
    redBg:    dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)',
    redBd:    dark ? '#f87171' : '#dc2626',
    purple:   dark ? '#a78bfa' : '#7c3aed',
    purpleBg: dark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)',
  }
}

// ── shared primitives ────────────────────────────────────────────────────────
function Tag({ label, color, C }) {
  const bg = { blue:C.blueBg, amber:C.amberBg, green:C.greenBg, red:C.redBg, purple:C.purpleBg }[color] || C.blueBg
  const tc = { blue:C.blue, amber:C.amber, green:C.green, red:C.red, purple:C.purple }[color] || C.blue
  return <span style={{ display:'inline-block', fontSize:11, padding:'2px 9px',
    borderRadius:6, background:bg, color:tc, fontWeight:500, marginBottom:10 }}>{label}</span>
}

function Prose({ children, C }) {
  return <p style={{ fontSize:13, color:C.muted, lineHeight:1.75, marginBottom:10 }}>{children}</p>
}

function CodeBox({ children, C }) {
  return <div style={{ background:C.surface2, borderRadius:8, padding:'10px 14px',
    fontFamily:'monospace', fontSize:13, color:C.text, lineHeight:1.9, marginBottom:10, whiteSpace:'pre-wrap' }}>
    {children}
  </div>
}

function Callout({ children, color, C }) {
  const bg = { blue:C.blueBg, green:C.greenBg, red:C.redBg, amber:C.amberBg, purple:C.purpleBg }[color] || C.amberBg
  const bd = { blue:C.blueBd, green:C.greenBd, red:C.redBd, amber:C.amberBd, purple:C.purple }[color] || C.amberBd
  const tc = { blue:C.blue, green:C.green, red:C.red, amber:C.amber, purple:C.purple }[color] || C.amber
  return <div style={{ borderLeft:`2px solid ${bd}`, background:bg,
    borderRadius:'0 6px 6px 0', padding:'8px 12px', marginBottom:10 }}>
    <p style={{ fontSize:13, color:tc, lineHeight:1.6, margin:0 }}>{children}</p>
  </div>
}

function AhaBox({ title, children, C }) {
  return <div style={{ background:C.greenBg, border:`1px solid ${C.greenBd}`,
    borderRadius:12, padding:'1rem 1.25rem', marginBottom:10 }}>
    <div style={{ fontSize:14, fontWeight:500, color:C.green, marginBottom:6 }}>{title}</div>
    <p style={{ fontSize:13, color:C.green, lineHeight:1.6, margin:0 }}>{children}</p>
  </div>
}

function StepChain({ steps, C }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
    {steps.map((s, i) => (
      <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
        <div style={{ width:22, height:22, borderRadius:'50%', background:C.blueBg,
          color:C.blue, fontSize:11, fontWeight:500, flexShrink:0, marginTop:2,
          display:'flex', alignItems:'center', justifyContent:'center' }}>{i+1}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'monospace', fontSize:13, color:C.text,
            background:C.surface2, padding:'5px 10px', borderRadius:6, marginBottom:3 }}>{s.eq}</div>
          <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{s.why}</div>
        </div>
      </div>
    ))}
  </div>
}

function FlowBoxes({ boxes, C }) {
  return <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:10 }}>
    {boxes.map((b, i) => (
      <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ padding:'7px 12px', borderRadius:8, fontSize:12, fontFamily:'monospace',
          border:`0.5px solid ${b.color==='amber' ? C.amberBd : b.color==='green' ? C.greenBd : C.blueBd}`,
          background:b.color==='amber' ? C.amberBg : b.color==='green' ? C.greenBg : C.blueBg,
          color:b.color==='amber' ? C.amber : b.color==='green' ? C.green : C.blue }}>
          {b.label}
        </div>
        {i < boxes.length-1 && <span style={{ color:C.hint, fontSize:16 }}>×</span>}
      </div>
    ))}
  </div>
}

function TwoCol({ left, right }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>{left}{right}</div>
}

function MiniCard({ label, value, color, C }) {
  const tc = { blue:C.blue, green:C.green, amber:C.amber }[color] || C.text
  return <div style={{ background:C.surface2, borderRadius:8, padding:'10px 12px' }}>
    <div style={{ fontSize:11, color:C.hint, marginBottom:3 }}>{label}</div>
    <div style={{ fontFamily:'monospace', fontSize:13, color:tc, whiteSpace:'pre-wrap' }}>{value}</div>
  </div>
}

// ── Part 1 example cards ─────────────────────────────────────────────────────
const PART1_CASES = [
  { n:2, result:'(1/2)·x^(−1/2)', exp:'(2−1)/2 = 1/2', denom:'2·x^(1/2)' },
  { n:3, result:'(1/3)·x^(−2/3)', exp:'(3−1)/3 = 2/3', denom:'3·x^(2/3)' },
  { n:4, result:'(1/4)·x^(−3/4)', exp:'(4−1)/4 = 3/4', denom:'4·x^(3/4)' },
]

// ── PAGES ────────────────────────────────────────────────────────────────────
function Page0({ C }) {
  return <>
    <Tag label="The goal" color="blue" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>What are we proving?</h3>
    <Prose C={C}>We want to differentiate x^(m/n) — numbers like x^(2/3) or x^(3/4). The integer power rule says d/dx[xᵏ] = k·xᵏ⁻¹. The claim is that the exact same formula works for fractions too.</Prose>
    <AhaBox title="The result we're building toward" C={C}>
      {'d/dx[x^(m/n)] = (m/n) · x^(m/n − 1)'}
    </AhaBox>
    <Prose C={C}>But we can't just assume the power rule works for fractions — we have to prove it from things we already know. The proof uses two tools you've already seen:</Prose>
    <TwoCol
      left={<div style={{ background:C.blueBg, border:`0.5px solid ${C.blueBd}`, borderRadius:8, padding:'10px 12px' }}>
        <div style={{ fontSize:11, color:C.blue, marginBottom:4, fontWeight:500 }}>Part 1 — the setup</div>
        <div style={{ fontSize:13, color:C.blue }}>Differentiate x^(1/n)</div>
        <div style={{ fontSize:12, color:C.blue, marginTop:4, opacity:.8 }}>Use the inverse function formula — because x^(1/n) is the inverse of xⁿ</div>
      </div>}
      right={<div style={{ background:C.amberBg, border:`0.5px solid ${C.amberBd}`, borderRadius:8, padding:'10px 12px' }}>
        <div style={{ fontSize:11, color:C.amber, marginBottom:4, fontWeight:500 }}>Part 2 — the extension</div>
        <div style={{ fontSize:13, color:C.amber }}>Extend to x^(m/n)</div>
        <div style={{ fontSize:12, color:C.amber, marginTop:4, opacity:.8 }}>Rewrite x^(m/n) = (x^(1/n))^m and use the chain rule</div>
      </div>}
    />
    <Callout color="blue" C={C}>Why do we need the inverse function approach? Because we don't yet have a rule for fractional exponents — we have to build one from the integer power rule plus the inverse derivative formula.</Callout>
  </>
}

function Page1({ C }) {
  return <>
    <Tag label="Part 1 — step 1" color="blue" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>g(x) = x^(1/n) is the inverse of f(x) = xⁿ</h3>
    <Prose C={C}>To use the inverse derivative formula, we first identify which function x^(1/n) is the inverse of. Answer: it's the inverse of xⁿ.</Prose>
    <CodeBox C={C}>
      {'f(x) = xⁿ  (restrict to x ≥ 0 so it is one-to-one)\ng(x) = x^(1/n) = f⁻¹(x)\n\nCheck: f(g(x)) = (x^(1/n))ⁿ = x^(n/n) = x  ✓'}
    </CodeBox>
    <Prose C={C}>Now recall the inverse derivative formula: g′(x) = 1 / f′(g(x)). We need f′(x) first, then we evaluate it at g(x) = x^(1/n).</Prose>
    <FlowBoxes boxes={[
      { label:'f(x) = xⁿ', color:'blue' },
      { label:"f′(x) = nxⁿ⁻¹", color:'amber' },
    ]} C={C} />
    <Prose C={C}>Now evaluate f′ at g(x) = x^(1/n) — this is the f′(g(x)) part of the formula:</Prose>
    <StepChain steps={[
      { eq:"f′(x) = nxⁿ⁻¹", why:'Differentiate f using the integer power rule — which we already know works for whole numbers.' },
      { eq:"f′( g(x) ) = f′( x^(1/n) ) = n · (x^(1/n))^(n−1)", why:"Substitute g(x) = x^(1/n) into f′. We're asking: how steep is f at the point x^(1/n)?" },
      { eq:"= n · x^((n−1)/n)", why:"Use the exponent rule (xᵃ)ᵇ = x^(ab): multiply (1/n)(n−1) = (n−1)/n." },
    ]} C={C} />
    <Callout color="amber" C={C}>The key move: substitute g(x) = x^(1/n) into f′. We're asking "what is the derivative of xⁿ, evaluated at the point x^(1/n)?" — not at x itself.</Callout>
  </>
}

function Page2({ C }) {
  const [ni, setNi] = useState(0)
  const c = PART1_CASES[ni]
  return <>
    <Tag label="Part 1 — step 2" color="blue" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>Simplify to get d/dx[x^(1/n)]</h3>
    <Prose C={C}>Plug f′(g(x)) into the inverse formula and simplify the exponent.</Prose>
    <StepChain steps={[
      { eq:"g′(x) = 1 / f′(g(x))", why:'The inverse derivative formula.' },
      { eq:"= 1 / ( n · x^((n−1)/n) )", why:'Substitute what we found for f′(g(x)) on the previous page.' },
      { eq:"= (1/n) · x^(−(n−1)/n)", why:'Split the fraction: 1/(n · xᵃ) = (1/n) · x^(−a).' },
      { eq:"= (1/n) · x^((1/n) − 1)", why:'Simplify the exponent: −(n−1)/n = (1−n)/n = 1/n − n/n = 1/n − 1. This matches the power rule pattern.' },
    ]} C={C} />
    <AhaBox title="Result of Part 1" C={C}>{'d/dx[ x^(1/n) ] = (1/n) · x^((1/n)−1)'}</AhaBox>
    <Prose C={C}>The exponent simplification is the step that trips people up. Here it is slowly: −(n−1)/n means flip the sign of (n−1)/n. That gives (1−n)/n. Then split: 1/n − n/n = 1/n − 1.</Prose>
    <Prose C={C}>Pick a value of n to see this spelled out:</Prose>
    <div style={{ display:'flex', gap:6, marginBottom:10 }}>
      {PART1_CASES.map((c, i) => (
        <button key={i} onClick={() => setNi(i)}
          style={{ fontSize:12, padding:'5px 12px', borderRadius:8, cursor:'pointer',
            border:`0.5px solid ${ni===i ? C.blueBd : C.border}`,
            background:ni===i ? C.blueBg : 'transparent',
            color:ni===i ? C.blue : C.muted, fontWeight:ni===i?500:400 }}>
          n = {c.n}
        </button>
      ))}
    </div>
    <StepChain steps={[
      { eq:`f(x) = x^${c.n},  f′(x) = ${c.n}x^(${c.n}−1)`, why:'Integer power rule.' },
      { eq:`f′(g(x)) = ${c.n}·x^(${c.n-1})/${c.n} = ${c.n}·x^(${c.exp.split('=')[0].trim()})`, why:'Evaluate at g(x) = x^(1/'+c.n+').' },
      { eq:`g′(x) = 1/(${c.denom}) = ${c.result}`, why:'Apply the formula and simplify.' },
    ]} C={C} />
  </>
}

function Page3({ C }) {
  return <>
    <Tag label="Part 2 — chain rule" color="amber" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>Extending to x^(m/n) using the chain rule</h3>
    <Prose C={C}>Now the general case. The trick is to rewrite x^(m/n) as a composition — something inside something — so we can use the chain rule.</Prose>
    <CodeBox C={C}>{'x^(m/n) = (x^(1/n))^m\n\nThis is: outer function uᵐ applied to inner function u = x^(1/n)'}</CodeBox>
    <Prose C={C}>Chain rule says: derivative of a composition = (derivative of outer) × (derivative of inner).</Prose>
    <FlowBoxes boxes={[
      { label:'outer: uᵐ → m·uᵐ⁻¹', color:'amber' },
      { label:'inner: x^(1/n) → (1/n)·x^((1/n)−1)', color:'blue' },
    ]} C={C} />
    <StepChain steps={[
      { eq:"d/dx[(x^(1/n))^m] = m·(x^(1/n))^(m−1) · (1/n)·x^((1/n)−1)", why:'Chain rule: derivative of outer × derivative of inner. We substitute our Part 1 result for the inner derivative.' },
      { eq:"= (m/n) · x^((1/n)(m−1)) · x^((1/n)−1)", why:"Group the constants (m/n) and rewrite the first exponent: (1/n)·(m−1) = (m−1)/n." },
      { eq:"= (m/n) · x^((m−1)/n + (1/n)−1)", why:"Combine x^a · x^b = x^(a+b). The two exponents add together." },
      { eq:"exponent = (m−1)/n + 1/n − 1 = m/n − 1", why:"Add the fractions: (m−1)/n + 1/n = m/n. Then subtract 1. Clean." },
      { eq:"d/dx[x^(m/n)] = (m/n) · x^(m/n − 1)", why:"Final result. Same form as the power rule — bring the exponent down, subtract 1." },
    ]} C={C} />
    <Callout color="amber" C={C}>The exponent combination is just adding fractions: (m−1)/n + 1/n = m/n. Then the −1 from the inner derivative stays as −1. Result: m/n − 1 — exactly what the power rule would predict.</Callout>
  </>
}

function Page4({ C }) {
  const [m, setM] = useState(2)
  const [n, setN] = useState(3)
  const [xRaw, setXRaw] = useState(100)
  const x = xRaw / 100
  const exp = m / n
  const formulaVal = exp * Math.pow(x, exp - 1)
  const dx = 0.0001
  const numericVal = (Math.pow(x + dx, exp) - Math.pow(x, exp)) / dx
  const match = Math.abs(formulaVal - numericVal) < 0.002

  return <>
    <Tag label="The result" color="green" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>The rational power rule — live verification</h3>
    <AhaBox title="The rational power rule" C={C}>{'d/dx[x^(m/n)] = (m/n) · x^(m/n − 1)'}</AhaBox>
    <Prose C={C}>Try any m and n — the formula updates live and is verified numerically using the limit definition.</Prose>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
      <span style={{ fontSize:12, color:C.muted, minWidth:16 }}>m</span>
      <input type="range" min={1} max={7} step={1} value={m}
        onChange={e => setM(+e.target.value)} style={{ flex:1 }} />
      <span style={{ fontFamily:'monospace', fontSize:13, color:C.text, minWidth:24 }}>{m}</span>
    </div>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
      <span style={{ fontSize:12, color:C.muted, minWidth:16 }}>n</span>
      <input type="range" min={2} max={7} step={1} value={n}
        onChange={e => setN(+e.target.value)} style={{ flex:1 }} />
      <span style={{ fontFamily:'monospace', fontSize:13, color:C.text, minWidth:24 }}>{n}</span>
    </div>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
      <span style={{ fontSize:12, color:C.muted, minWidth:16 }}>x</span>
      <input type="range" min={10} max={300} step={1} value={xRaw}
        onChange={e => setXRaw(+e.target.value)} style={{ flex:1 }} />
      <span style={{ fontFamily:'monospace', fontSize:13, color:C.text, minWidth:40 }}>{x.toFixed(2)}</span>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
      <MiniCard label={`Formula: (${m}/${n})·x^(${m}/${n}−1)`} value={`at x=${x.toFixed(2)}:\n${formulaVal.toFixed(5)}`} color="blue" C={C} />
      <div style={{ background:C.surface2, borderRadius:8, padding:'10px 12px',
        border:`0.5px solid ${match ? C.greenBd : C.border}` }}>
        <div style={{ fontSize:11, color:C.hint, marginBottom:3 }}>Numeric check (limit definition)</div>
        <div style={{ fontFamily:'monospace', fontSize:13, color:match ? C.green : C.text }}>
          {numericVal.toFixed(5)} {match ? '✓ matches' : ''}
        </div>
      </div>
    </div>
    <Callout color="green" C={C}>Notice that m/n − 1 is just the original exponent minus 1, regardless of whether m/n is a whole number. The power rule d/dx[xᵏ] = k·xᵏ⁻¹ works for all rational k.</Callout>
    <Callout color="purple" C={C}>The numeric check uses [f(x+Δx)−f(x)]/Δx with Δx = 0.0001 — the limit definition of the derivative. It's not circular: it independently verifies the formula is correct at any specific point you choose.</Callout>
  </>
}

const PAGES = [Page0, Page1, Page2, Page3, Page4]
const PAGE_COUNT = PAGES.length

// ── main component ───────────────────────────────────────────────────────────
export default function RationalExponentProof({ params = {} }) {
  const C = useColors()
  const containerRef = useRef(null)
  const [page, setPage] = useState(params.currentStep ?? 0)

  useEffect(() => {
    if (params.currentStep !== undefined) setPage(Math.min(params.currentStep, PAGE_COUNT - 1))
  }, [params.currentStep])

  const PageComponent = PAGES[Math.min(page, PAGE_COUNT - 1)]

  return (
    <div ref={containerRef} style={{ width:'100%', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', gap:5, marginBottom:16 }}>
        {PAGES.map((_, i) => (
          <div key={i} onClick={() => setPage(i)} style={{ flex:1, height:4, borderRadius:2, cursor:'pointer',
            background: i < page ? C.blue : i === page ? C.amber : C.border,
            transition:'background .25s' }} />
        ))}
      </div>

      <div style={{ background:C.surface, border:`0.5px solid ${C.border}`,
        borderRadius:12, padding:'1.25rem', marginBottom:12 }}>
        <PageComponent C={C} />
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
          style={{ fontSize:13, padding:'7px 18px', borderRadius:8, cursor:page===0?'default':'pointer',
            border:`0.5px solid ${C.border}`, background:'transparent', color:C.text, opacity:page===0?0.3:1 }}>
          ← Back
        </button>
        <span style={{ fontSize:12, color:C.hint }}>{page + 1} of {PAGE_COUNT}</span>
        <button disabled={page === PAGE_COUNT - 1} onClick={() => setPage(p => p + 1)}
          style={{ fontSize:13, padding:'7px 18px', borderRadius:8,
            cursor:page===PAGE_COUNT-1?'default':'pointer',
            border:'none', background:C.text, color:C.bg, opacity:page===PAGE_COUNT-1?0.3:1 }}>
          Next →
        </button>
      </div>
    </div>
  )
}
