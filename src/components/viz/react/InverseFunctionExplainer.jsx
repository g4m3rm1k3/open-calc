import { useState, useEffect, useRef } from 'react'

// ── colour tokens (dark-mode aware) ─────────────────────────────────────────
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
  }
}

// ── tiny shared components ───────────────────────────────────────────────────
function Tag({ label, color, C }) {
  const bg   = color === 'blue' ? C.blueBg : color === 'amber' ? C.amberBg : color === 'green' ? C.greenBg : C.redBg
  const text = color === 'blue' ? C.blue   : color === 'amber' ? C.amber   : color === 'green' ? C.green   : C.red
  return (
    <span style={{ display:'inline-block', fontSize:11, padding:'2px 9px',
      borderRadius:6, background:bg, color:text, fontWeight:500, marginBottom:10 }}>
      {label}
    </span>
  )
}

function Prose({ children, C }) {
  return <p style={{ fontSize:13, color:C.muted, lineHeight:1.75, marginBottom:10 }}>{children}</p>
}

function CodeBox({ children, C }) {
  return (
    <div style={{ background:C.surface2, borderRadius:8, padding:'10px 14px',
      fontFamily:'monospace', fontSize:13, color:C.text, lineHeight:1.9, marginBottom:10 }}>
      {children}
    </div>
  )
}

function Callout({ children, color, C }) {
  const bg = color === 'blue' ? C.blueBg : color === 'green' ? C.greenBg : color === 'red' ? C.redBg : C.amberBg
  const bd = color === 'blue' ? C.blueBd : color === 'green' ? C.greenBd : color === 'red' ? C.redBd : C.amberBd
  const tc = color === 'blue' ? C.blue   : color === 'green' ? C.green   : color === 'red' ? C.red   : C.amber
  return (
    <div style={{ borderLeft:`2px solid ${bd}`, background:bg, borderRadius:'0 6px 6px 0',
      padding:'8px 12px', marginBottom:10 }}>
      <p style={{ fontSize:13, color:tc, lineHeight:1.6, margin:0 }}>{children}</p>
    </div>
  )
}

function StepChain({ steps, C }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
          <div style={{ width:22, height:22, borderRadius:'50%', background:C.blueBg,
            color:C.blue, fontSize:11, fontWeight:500, display:'flex',
            alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
            {i + 1}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'monospace', fontSize:13, color:C.text,
              background:C.surface2, padding:'5px 10px', borderRadius:6, marginBottom:3 }}>
              {s.eq}
            </div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{s.why}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Machine({ boxes, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:10 }}>
      {boxes.map((b, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{
            padding:'7px 12px', borderRadius:8, fontSize:13, fontFamily:'monospace',
            border:`0.5px solid ${b.type === 'fn' ? C.amberBd : b.type === 'in' ? C.blueBd : b.type === 'inv' ? C.redBd : C.greenBd}`,
            background:b.type === 'fn' ? C.amberBg : b.type === 'in' ? C.blueBg : b.type === 'inv' ? C.redBg : C.greenBg,
            color:b.type === 'fn' ? C.amber : b.type === 'in' ? C.blue : b.type === 'inv' ? C.red : C.green,
          }}>{b.label}</div>
          {i < boxes.length - 1 && <span style={{ color:C.hint, fontSize:16 }}>→</span>}
        </div>
      ))}
    </div>
  )
}

function AhaBox({ title, children, C }) {
  return (
    <div style={{ background:C.greenBg, border:`1px solid ${C.greenBd}`,
      borderRadius:12, padding:'1rem 1.25rem', marginBottom:10 }}>
      <div style={{ fontSize:14, fontWeight:500, color:C.green, marginBottom:6 }}>{title}</div>
      <p style={{ fontSize:13, color:C.green, lineHeight:1.6, margin:0 }}>{children}</p>
    </div>
  )
}

function TwoCol({ left, right }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
      {left}{right}
    </div>
  )
}

function MiniCard({ label, value, color, C }) {
  const tc = color === 'blue' ? C.blue : color === 'green' ? C.green : C.text
  return (
    <div style={{ background:C.surface2, borderRadius:8, padding:'10px 12px' }}>
      <div style={{ fontSize:11, color:C.hint, marginBottom:3 }}>{label}</div>
      <div style={{ fontFamily:'monospace', fontSize:13, color:tc }}>{value}</div>
    </div>
  )
}

// ── slope canvas (page 5) ────────────────────────────────────────────────────
function SlopeCanvas({ xv, C }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const W = cv.offsetWidth || 300
    const H = 200
    cv.width = W; cv.height = H
    const ctx = cv.getContext('2d')
    const sc = 2.2, pad = 32
    const cx = x => pad + (x + sc) / (2 * sc) * (W - 2 * pad)
    const cy = y => H - pad - (y + sc) / (2 * sc) * (H - 2 * pad)

    ctx.clearRect(0, 0, W, H)

    // grid
    for (let v = -2; v <= 2; v++) {
      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx(v), pad); ctx.lineTo(cx(v), H - pad); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(pad, cy(v)); ctx.lineTo(W - pad, cy(v)); ctx.stroke()
    }
    // mirror
    ctx.strokeStyle = C.hint; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.moveTo(cx(-sc), cy(-sc)); ctx.lineTo(cx(sc), cy(sc)); ctx.stroke()
    ctx.setLineDash([])

    const drawCurve = (fn, col, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2
      if (dash) ctx.setLineDash([5, 4]); else ctx.setLineDash([])
      ctx.beginPath(); let first = true
      for (let i = -200; i <= 200; i++) {
        const x = i / 100 * sc / 2, y = fn(x)
        if (Math.abs(y) > sc + 0.2) { first = true; continue }
        first ? ctx.moveTo(cx(x), cy(y)) : ctx.lineTo(cx(x), cy(y))
        first = false
      }
      ctx.stroke(); ctx.setLineDash([])
    }
    drawCurve(x => x * x * x, C.blue, false)
    drawCurve(x => Math.cbrt(x), C.red, true)

    ctx.fillStyle = C.blue; ctx.font = `11px sans-serif`
    ctx.fillText('f(x) = x^3', cx(0.9), cy(1.8))
    ctx.fillStyle = C.red
    ctx.fillText('f^-1(x) = cbrt(x)', cx(1.1), cy(0.75))

    const fy = xv * xv * xv
    const slope = 3 * xv * xv
    const slopeInv = Math.abs(slope) < 0.001 ? 999 : 1 / slope
    const tlen = 0.35

    ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(cx(xv - tlen), cy(fy - tlen * slope))
    ctx.lineTo(cx(xv + tlen), cy(fy + tlen * slope))
    ctx.stroke()
    ctx.fillStyle = C.amber; ctx.beginPath()
    ctx.arc(cx(xv), cy(fy), 5, 0, Math.PI * 2); ctx.fill()

    const ix = fy, iy = xv
    ctx.strokeStyle = C.green; ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(cx(ix - tlen), cy(iy - tlen * slopeInv))
    ctx.lineTo(cx(ix + tlen), cy(iy + tlen * slopeInv))
    ctx.stroke()
    ctx.fillStyle = C.green; ctx.beginPath()
    ctx.arc(cx(ix), cy(iy), 5, 0, Math.PI * 2); ctx.fill()

    ctx.strokeStyle = C.hint; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(cx(xv), cy(fy)); ctx.lineTo(cx(ix), cy(iy)); ctx.stroke()
    ctx.setLineDash([])
  }, [xv, C])

  return <canvas ref={ref} style={{ width:'100%', height:200, display:'block' }} />
}

// ── PAGES ────────────────────────────────────────────────────────────────────
const EXAMPLES = [
  { label:'2x + 1', steps:[
    { eq:'Write: y = 2x + 1', why:'Name the output y. We want to find x in terms of y.' },
    { eq:'Swap x and y: x = 2y + 1', why:'Swapping is the algebraic version of reflecting the graph. Now y is the input to the inverse.' },
    { eq:'Solve for y: y = (x − 1) / 2', why:'Undo +1 by subtracting 1, then undo ×2 by dividing.' },
    { eq:'f⁻¹(x) = (x − 1) / 2', why:'Rename y as f⁻¹(x). Done.' },
    { eq:'Check: f(f⁻¹(3)) = f(1) = 2(1)+1 = 3 ✓', why:'Put 3 through f⁻¹ to get 1, then through f to get 3 back.' },
  ]},
  { label:'x³', steps:[
    { eq:'Write: y = x³', why:'Name the output.' },
    { eq:'Swap: x = y³', why:'Swap x and y.' },
    { eq:'Solve: y = x^(1/3) = ∛x', why:'Take the cube root of both sides. x³ is one-to-one everywhere so no restriction needed.' },
    { eq:'f⁻¹(x) = ∛x', why:'Done.' },
    { eq:'Check: f(f⁻¹(8)) = f(2) = 2³ = 8 ✓', why:'∛8 = 2, then 2³ = 8. Back to start.' },
  ]},
  { label:'(x+3)/5', steps:[
    { eq:'Write: y = (x+3)/5', why:'Name the output.' },
    { eq:'Swap: x = (y+3)/5', why:'Swap x and y.' },
    { eq:'Multiply by 5: 5x = y + 3', why:'Clear the fraction first.' },
    { eq:'Solve: y = 5x − 3', why:'Subtract 3 from both sides.' },
    { eq:'f⁻¹(x) = 5x − 3. Check: f(f⁻¹(2)) = f(7) = 10/5 = 2 ✓', why:'Done.' },
  ]},
]

const EX7 = [
  { input:8,  finv:2,  fprimeVal:12, neg:false },
  { input:1,  finv:1,  fprimeVal:3,  neg:false },
  { input:27, finv:3,  fprimeVal:27, neg:false },
  { input:-8, finv:-2, fprimeVal:12, neg:true  },
]

function Page0({ C }) {
  const [x, setX] = useState(3)
  return <>
    <Tag label="Start here" color="blue" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>What even is a function? A plain-English refresh</h3>
    <Prose C={C}>A function is just a <strong style={{fontWeight:500,color:C.text}}>rule that takes a number in and gives exactly one number out</strong>. Think of it like a vending machine — you press a button (put in a number), and one specific thing comes out.</Prose>
    <Prose C={C}>We write it as <strong style={{fontWeight:500,color:C.text}}>f(x)</strong>. All that means is: "the function called f, applied to the number x." It's just a name for the rule. The x is a placeholder — it means "whatever number you put in."</Prose>
    <Machine boxes={[
      { label:'x = 3', type:'in' },
      { label:'f(x) = 2x + 1\ndouble it, add 1', type:'fn' },
      { label:'f(3) = 7', type:'out' },
    ]} C={C} />
    <Callout color="blue" C={C}>Why the letter f? No special reason — it stands for "function." We sometimes use g, h, or any letter. They're all just names for rules. When you see f and g in the same problem, it just means "two different rules."</Callout>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
      <span style={{ fontSize:12, color:C.muted, minWidth:60 }}>Input x</span>
      <input type="range" min={-5} max={5} step={1} value={x}
        onChange={e => setX(+e.target.value)} style={{ flex:1 }} />
      <span style={{ fontFamily:'monospace', fontSize:13, color:C.text, minWidth:32 }}>{x}</span>
    </div>
    <Machine boxes={[
      { label:`x = ${x}`, type:'in' },
      { label:'f(x) = 2x + 1', type:'fn' },
      { label:`f(${x}) = ${2*x+1}`, type:'out' },
    ]} C={C} />
  </>
}

function Page1({ C }) {
  const [x, setX] = useState(3)
  const fx = 2*x+1
  return <>
    <Tag label="The core idea" color="blue" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>What is an inverse function?</h3>
    <Prose C={C}>An inverse function <strong style={{fontWeight:500,color:C.text}}>undoes what the original function did</strong>. If f takes 3 and gives 7, then the inverse takes 7 and gives back 3.</Prose>
    <Machine boxes={[{label:'3',type:'in'},{label:'f: double, add 1',type:'fn'},{label:'7',type:'out'}]} C={C} />
    <Machine boxes={[{label:'7',type:'out'},{label:'f⁻¹: subtract 1, halve',type:'inv'},{label:'3',type:'in'}]} C={C} />
    <Prose C={C}>We write the inverse as <strong style={{fontWeight:500,color:C.text}}>f⁻¹</strong>. That little −1 is NOT a power — it's a label meaning "the undo version." Think of it as a name tag, not an exponent.</Prose>
    <Callout color="red" C={C}>Common trap: f⁻¹(x) does NOT mean 1/f(x). It means the inverse function. If f(x) = 2x+1 then f⁻¹(x) = (x−1)/2, not 1/(2x+1). Completely different things.</Callout>
    <CodeBox C={C}>
      f⁻¹( f(x) ) = x &nbsp;&nbsp; ← apply f, then undo it → back to x{'\n'}
      f( f⁻¹(x) ) = x &nbsp;&nbsp; ← undo first, then apply → also back to x
    </CodeBox>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
      <span style={{ fontSize:12, color:C.muted, minWidth:60 }}>Input x</span>
      <input type="range" min={-5} max={5} step={1} value={x}
        onChange={e => setX(+e.target.value)} style={{ flex:1 }} />
      <span style={{ fontFamily:'monospace', fontSize:13, color:C.text, minWidth:32 }}>{x}</span>
    </div>
    <StepChain steps={[
      { eq:`Start with x = ${x}`, why:'Our input' },
      { eq:`f(${x}) = 2(${x})+1 = ${fx}`, why:'Apply f — takes '+x+' to '+fx },
      { eq:`f⁻¹(${fx}) = (${fx}−1)/2 = ${x}`, why:"Apply f⁻¹ — takes "+fx+" back to "+x+". We're back!" },
    ]} C={C} />
  </>
}

function Page2({ C }) {
  const [ei, setEi] = useState(0)
  return <>
    <Tag label="Finding inverses" color="amber" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>How do you actually find an inverse? Step by step</h3>
    <Prose C={C}>Finding an inverse always uses the same 3-step recipe. The logic: if f takes x to y, then f⁻¹ takes y to x — so we <strong style={{fontWeight:500,color:C.text}}>swap x and y, then solve for y</strong>.</Prose>
    <Callout color="blue" C={C}>Think of it this way: the original rule says "given x, here's y." We want a new rule that says "given y, here's x." So we literally swap which one we're solving for.</Callout>
    <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
      {EXAMPLES.map((e, i) => (
        <button key={i} onClick={() => setEi(i)}
          style={{ fontSize:12, padding:'5px 12px', borderRadius:8, cursor:'pointer',
            border:`0.5px solid ${ei===i ? C.blueBd : C.border}`,
            background:ei===i ? C.blueBg : 'transparent',
            color:ei===i ? C.blue : C.muted, fontWeight:ei===i?500:400 }}>
          f(x) = {e.label}
        </button>
      ))}
    </div>
    <StepChain steps={EXAMPLES[ei].steps} C={C} />
  </>
}

function Page3({ C }) {
  return <>
    <Tag label="One-to-one rule" color="amber" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>When does an inverse exist?</h3>
    <Prose C={C}>Not every function has an inverse. The rule: <strong style={{fontWeight:500,color:C.text}}>every output must come from exactly one input</strong>. If two different inputs give the same output, the inverse is stuck — it doesn't know which input to return.</Prose>
    <Prose C={C}>Example: f(x) = x². Both x = 3 and x = −3 give f = 9. If the inverse gets 9, which does it return?</Prose>
    <Machine boxes={[{label:'x=3 and x=−3',type:'in'},{label:'f(x) = x²',type:'fn'},{label:'9',type:'out'},{label:'f⁻¹(9) = ??? 3 or −3?',type:'inv'}]} C={C} />
    <Callout color="red" C={C}>The fix: restrict the domain. Agree to only use x ≥ 0. Now only x = 3 maps to 9, so the inverse safely returns 3. The inverse becomes √x, which only gives positive outputs.</Callout>
    <Prose C={C}>The calculus shortcut for checking: if <strong style={{fontWeight:500,color:C.text}}>f′(x) &gt; 0 everywhere</strong> (always going up) or <strong style={{fontWeight:500,color:C.text}}>f′(x) &lt; 0 everywhere</strong> (always going down), the function never doubles back — it's one-to-one.</Prose>
    <TwoCol
      left={<>
        <MiniCard label="Has inverse — full domain" value={'f(x) = x³\nf\'(x) = 3x² ≥ 0'} color="blue" C={C} />
        <div style={{height:8}}/>
        <MiniCard label="Has inverse — full domain" value={'f(x) = eˣ\nf\'(x) = eˣ > 0 always'} color="blue" C={C} />
      </>}
      right={<>
        <div style={{ background:C.surface2, borderRadius:8, padding:'10px 12px', border:`0.5px solid ${C.redBd}` }}>
          <div style={{ fontSize:11, color:C.red, marginBottom:3 }}>Needs restriction</div>
          <div style={{ fontFamily:'monospace', fontSize:13, color:C.text }}>{'f(x) = x²\nf\'(x) = 2x — changes sign\nrestrict to x ≥ 0'}</div>
        </div>
        <div style={{height:8}}/>
        <div style={{ background:C.surface2, borderRadius:8, padding:'10px 12px', border:`0.5px solid ${C.redBd}` }}>
          <div style={{ fontSize:11, color:C.red, marginBottom:3 }}>Needs restriction</div>
          <div style={{ fontFamily:'monospace', fontSize:13, color:C.text }}>{'f(x) = sin(x)\nrepeats forever\nrestrict to [−π/2, π/2]'}</div>
        </div>
      </>}
    />
  </>
}

function Page4({ C }) {
  const [xRaw, setXRaw] = useState(80)
  const xv = xRaw / 100
  const slope = 3 * xv * xv
  const slopeInv = Math.abs(slope) < 0.001 ? '∞' : (1 / slope).toFixed(3)
  return <>
    <Tag label="The key insight" color="green" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>Slopes flip when you take an inverse</h3>
    <Prose C={C}>When you take an inverse, the graph reflects across the diagonal line y = x. That swaps the x and y axes. Slope = rise/run. When axes swap, rise and run swap too — so slope m becomes 1/m.</Prose>
    <CodeBox C={C}>
      slope of f at a point &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = m{'\n'}
      slope of f⁻¹ at reflected point = 1/m
    </CodeBox>
    <AhaBox title="The aha moment" C={C}>A slope of 3 on f becomes a slope of 1/3 on f⁻¹. A slope of 1/2 becomes 2. Swapping the axes literally flips the fraction. This is the whole formula in one sentence.</AhaBox>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
      <span style={{ fontSize:12, color:C.muted, minWidth:80 }}>Point on f</span>
      <input type="range" min={-180} max={180} step={1} value={xRaw}
        onChange={e => setXRaw(+e.target.value)} style={{ flex:1 }} />
      <span style={{ fontFamily:'monospace', fontSize:12, color:C.text, minWidth:40 }}>x={xv.toFixed(2)}</span>
    </div>
    <SlopeCanvas xv={xv} C={C} />
    <TwoCol
      left={<MiniCard label="slope of f at this point" value={slope.toFixed(3)} color="blue" C={C} />}
      right={<MiniCard label="slope of f⁻¹ at reflected point" value={slopeInv} color="green" C={C} />}
    />
    <Prose C={C}>Notice: the two slopes always multiply to 1. That's not a coincidence — it's the key formula in disguise.</Prose>
  </>
}

function Page5({ C }) {
  return <>
    <Tag label="Building the formula" color="green" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>Where (f⁻¹)′(x) = 1/f′(f⁻¹(x)) comes from</h3>
    <Prose C={C}>We just saw the geometric idea: slopes flip to their reciprocal. Now let's see how calculus writes that as a formula — every step in plain English.</Prose>
    <StepChain steps={[
      { eq:'f( f⁻¹(x) ) = x', why:'This is the definition of inverse — apply f⁻¹ then f, get back to x. Always true.' },
      { eq:'d/dx [ f( f⁻¹(x) ) ] = d/dx [ x ]', why:'Differentiate both sides. The right side is easy: d/dx[x] = 1. This is where the 1 comes from!' },
      { eq:'f′( f⁻¹(x) ) · (f⁻¹)′(x) = 1', why:"Left side uses the chain rule: derivative of outer × derivative of inner. Outer = f, inner = f⁻¹(x)." },
      { eq:'(f⁻¹)′(x) = 1 / f′( f⁻¹(x) )', why:"Divide both sides by f′(f⁻¹(x)). That's the formula." },
    ]} C={C} />
    <AhaBox title="Why is there a 1 in the numerator?" C={C}>Because d/dx[x] = 1. When you differentiate both sides of f(f⁻¹(x)) = x, the right side is just x — and the derivative of x is 1. That's it. The 1 isn't magic, it comes from differentiating x itself.</AhaBox>
    <Callout color="blue" C={C}>Reading the formula out loud: "the derivative of the inverse at x equals one divided by the derivative of f, evaluated at the inverse of x." The f′(f⁻¹(x)) part just means: first find where you are on f (that's f⁻¹(x)), then ask how steep f is there.</Callout>
  </>
}

function Page6({ C }) {
  const [ei, setEi] = useState(0)
  const e = EX7[ei]
  return <>
    <Tag label="Reading the formula" color="amber" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>Unpacking f′(f⁻¹(x)) — what does it mean?</h3>
    <Prose C={C}>The hardest part of the formula is reading f′(f⁻¹(x)). Let's break it down with a concrete example using f(x) = x³.</Prose>
    <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
      {EX7.map((e, i) => (
        <button key={i} onClick={() => setEi(i)}
          style={{ fontSize:12, padding:'5px 12px', borderRadius:8, cursor:'pointer',
            border:`0.5px solid ${ei===i ? C.blueBd : C.border}`,
            background:ei===i ? C.blueBg : 'transparent',
            color:ei===i ? C.blue : C.muted, fontWeight:ei===i?500:400 }}>
          (f⁻¹)′({e.input})
        </button>
      ))}
    </div>
    <StepChain steps={[
      { eq:`Find f⁻¹(${e.input}): solve x³ = ${e.input}`, why:`x = ${e.finv} because ${e.finv}³ = ${e.input}. So f⁻¹(${e.input}) = ${e.finv}.` },
      { eq:`f′(x) = 3x²`, why:'Differentiate f(x) = x³. This is the regular power rule.' },
      { eq:`f′(f⁻¹(${e.input})) = f′(${e.finv}) = 3·(${e.finv})² = ${e.fprimeVal}`, why:`Plug ${e.finv} into f′. This is how steep f is at x = ${e.finv}.` },
      { eq:`(f⁻¹)′(${e.input}) = 1 / ${e.fprimeVal}`, why:`Apply the formula. Slope of f was ${e.fprimeVal}, so slope of f⁻¹ is 1/${e.fprimeVal}.` },
    ]} C={C} />
    <Callout color="amber" C={C}>The key move everyone misses: you don't need to find a formula for f⁻¹(x). You just need one specific value — f⁻¹(8) = 2 — which just means solving f(?) = 8. Then differentiate f, not f⁻¹.</Callout>
  </>
}

function Page7({ C }) {
  return <>
    <Tag label="Full picture" color="green" C={C} />
    <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8 }}>The complete chain of logic</h3>
    <Prose C={C}>Every piece in one place — use this as a reference map when you're confused about where a step comes from.</Prose>
    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
      {[
        { color:C.amber, eq:"A function f has an inverse f^-1 when it's one-to-one", why:"One-to-one: no two inputs give the same output. Check: f'(x) doesn't change sign." },
        { color:C.amber, eq:'f( f^-1(x) ) = x — by definition', why:'This is what "inverse" means. Put in x, undo it, get x. Always true.' },
        { color:C.blue,  eq:'Differentiate both sides → chain rule on left', why:"d/dx[x] = 1 (right side). Chain rule on left: f'(f^-1(x)) * (f^-1)'(x) = 1." },
        { color:C.green, eq:"(f^-1)'(x) = 1 / f'(f^-1(x))", why:'Divide both sides by f\'(f^-1(x)). This is the formula.' },
        { color:C.green, eq:'To use it: find f⁻¹(x) by solving f(?) = x, then evaluate f′ there', why:"You don't need a formula for f⁻¹. Just find the specific input that gives output x." },
      ].map((s, i) => (
        <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
          <div style={{ width:22, height:22, borderRadius:'50%',
            background: i < 2 ? C.amberBg : i < 3 ? C.blueBg : C.greenBg,
            color:s.color, fontSize:11, fontWeight:500,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
            {String.fromCharCode(65+i)}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'monospace', fontSize:13, color:C.text,
              background:C.surface2, padding:'5px 10px', borderRadius:6, marginBottom:3 }}>
              {s.eq}
            </div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{s.why}</div>
          </div>
        </div>
      ))}
    </div>
    <AhaBox title="The whole thing in one sentence" C={C}>The slope of the inverse = 1 ÷ (slope of the original function at the corresponding point). The "corresponding point" is where you'd be standing on f — found by evaluating f⁻¹(x).</AhaBox>
    <TwoCol
      left={<MiniCard label='What f′(f⁻¹(x)) is asking' value='"How steep is f at the point that maps to x?"' color="blue" C={C} />}
      right={<MiniCard label='Why 1 in the numerator' value='d/dx[x] = 1. That is literally it.' color="green" C={C} />}
    />
  </>
}

const PAGES = [Page0, Page1, Page2, Page3, Page4, Page5, Page6, Page7]
const PAGE_COUNT = PAGES.length

// ── main component ───────────────────────────────────────────────────────────
export default function InverseFunctionExplainer({ params = {} }) {
  const C = useColors()
  const containerRef = useRef(null)
  const [page, setPage] = useState(params.currentStep ?? 0)

  useEffect(() => {
    if (params.currentStep !== undefined) setPage(params.currentStep)
  }, [params.currentStep])

  const PageComponent = PAGES[Math.min(page, PAGE_COUNT - 1)]

  return (
    <div ref={containerRef} style={{ width:'100%', fontFamily:'sans-serif' }}>
      {/* progress bar */}
      <div style={{ display:'flex', gap:5, marginBottom:16 }}>
        {PAGES.map((_, i) => (
          <div key={i} onClick={() => setPage(i)} style={{ flex:1, height:4, borderRadius:2, cursor:'pointer',
            background: i < page ? C.blue : i === page ? C.amber : C.border,
            transition:'background .25s' }} />
        ))}
      </div>

      {/* page content */}
      <div style={{ background:C.surface, border:`0.5px solid ${C.border}`,
        borderRadius:12, padding:'1.25rem', marginBottom:12 }}>
        <PageComponent C={C} />
      </div>

      {/* nav */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
          style={{ fontSize:13, padding:'7px 18px', borderRadius:8, cursor:page===0?'default':'pointer',
            border:`0.5px solid ${C.border}`, background:'transparent', color:C.text,
            opacity:page===0?0.3:1 }}>
          ← Back
        </button>
        <span style={{ fontSize:12, color:C.hint }}>{page + 1} of {PAGE_COUNT}</span>
        <button disabled={page === PAGE_COUNT - 1} onClick={() => setPage(p => p + 1)}
          style={{ fontSize:13, padding:'7px 18px', borderRadius:8,
            cursor:page===PAGE_COUNT-1?'default':'pointer',
            border:'none', background:C.text, color:C.bg,
            opacity:page===PAGE_COUNT-1?0.3:1 }}>
          Next →
        </button>
      </div>
    </div>
  )
}
