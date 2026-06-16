import { useState, useEffect, useRef } from 'react'

// ── dark-mode aware colour tokens ─────────────────────────────────────────────
function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => obs.disconnect()
  }, [])
  return {
    bg:        dark ? '#0f172a' : '#f8fafc',
    surface:   dark ? '#1e293b' : '#ffffff',
    surface2:  dark ? '#0f172a' : '#f1f5f9',
    border:    dark ? '#334155' : '#e2e8f0',
    text:      dark ? '#e2e8f0' : '#1e293b',
    muted:     dark ? '#94a3b8' : '#64748b',
    hint:      dark ? '#475569' : '#94a3b8',
    blue:      dark ? '#38bdf8' : '#0284c7',
    blueBg:    dark ? 'rgba(56,189,248,0.12)'  : 'rgba(2,132,199,0.08)',
    blueBd:    dark ? '#38bdf8' : '#0284c7',
    amber:     dark ? '#fbbf24' : '#d97706',
    amberBg:   dark ? 'rgba(251,191,36,0.12)'  : 'rgba(217,119,6,0.08)',
    amberBd:   dark ? '#fbbf24' : '#d97706',
    green:     dark ? '#4ade80' : '#16a34a',
    greenBg:   dark ? 'rgba(74,222,128,0.12)'  : 'rgba(22,163,74,0.08)',
    greenBd:   dark ? '#4ade80' : '#16a34a',
    red:       dark ? '#f87171' : '#dc2626',
    redBg:     dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)',
    redBd:     dark ? '#f87171' : '#dc2626',
    purple:    dark ? '#a78bfa' : '#7c3aed',
    purpleBg:  dark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)',
    purpleBd:  dark ? '#a78bfa' : '#7c3aed',
    teal:      dark ? '#2dd4bf' : '#0d9488',
    tealBg:    dark ? 'rgba(45,212,191,0.12)'  : 'rgba(13,148,136,0.08)',
    tealBd:    dark ? '#2dd4bf' : '#0d9488',
  }
}

// ── primitives ────────────────────────────────────────────────────────────────
const s = (obj) => Object.entries(obj).map(([k,v])=>`${k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}:${v}`).join(';')

function Tag({ label, color, C }) {
  const map = { blue:[C.blueBg,C.blue], amber:[C.amberBg,C.amber], green:[C.greenBg,C.green],
                red:[C.redBg,C.red], purple:[C.purpleBg,C.purple], teal:[C.tealBg,C.teal] }
  const [bg, tc] = map[color] || map.blue
  return <span style={{ display:'inline-block', fontSize:11, padding:'2px 9px', borderRadius:6,
    background:bg, color:tc, fontWeight:500, marginBottom:10 }}>{label}</span>
}

function H({ children, C }) {
  return <h3 style={{ fontSize:16, fontWeight:500, color:C.text, marginBottom:8, lineHeight:1.4 }}>{children}</h3>
}

function P({ children, C }) {
  return <p style={{ fontSize:13, color:C.muted, lineHeight:1.75, marginBottom:10 }}>{children}</p>
}

function B({ children }) { return <span style={{ fontWeight:500 }}>{children}</span> }

function Code({ children, C }) {
  return <div style={{ background:C.surface2, borderRadius:8, padding:'10px 14px', fontFamily:'monospace',
    fontSize:13, color:C.text, lineHeight:2, marginBottom:10, whiteSpace:'pre-wrap' }}>{children}</div>
}

function Callout({ children, color, C, title }) {
  const map = { blue:[C.blueBg,C.blueBd,C.blue], amber:[C.amberBg,C.amberBd,C.amber],
                green:[C.greenBg,C.greenBd,C.green], red:[C.redBg,C.redBd,C.red],
                purple:[C.purpleBg,C.purpleBd,C.purple], teal:[C.tealBg,C.tealBd,C.teal] }
  const [bg, bd, tc] = map[color] || map.amber
  return <div style={{ borderLeft:`2px solid ${bd}`, background:bg, borderRadius:'0 6px 6px 0',
    padding:'8px 12px', marginBottom:10 }}>
    {title && <div style={{ fontSize:12, fontWeight:500, color:tc, marginBottom:4 }}>{title}</div>}
    <p style={{ fontSize:13, color:tc, lineHeight:1.6, margin:0 }}>{children}</p>
  </div>
}

function AhaBox({ title, children, C }) {
  return <div style={{ background:C.greenBg, border:`1px solid ${C.greenBd}`, borderRadius:12,
    padding:'1rem 1.25rem', marginBottom:10 }}>
    <div style={{ fontSize:14, fontWeight:500, color:C.green, marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13, color:C.green, lineHeight:1.65 }}>{children}</div>
  </div>
}

function WarnBox({ title, children, C }) {
  return <div style={{ background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:12,
    padding:'1rem 1.25rem', marginBottom:10 }}>
    <div style={{ fontSize:14, fontWeight:500, color:C.red, marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13, color:C.red, lineHeight:1.65 }}>{children}</div>
  </div>
}

function Steps({ steps, C }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
    {steps.map((s, i) => (
      <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
        <div style={{ width:22, height:22, borderRadius:'50%', background:C.blueBg, color:C.blue,
          fontSize:11, fontWeight:500, flexShrink:0, marginTop:2,
          display:'flex', alignItems:'center', justifyContent:'center' }}>{i+1}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'monospace', fontSize:13, color:C.text, background:C.surface2,
            padding:'5px 10px', borderRadius:6, marginBottom:3 }}>{s.eq}</div>
          {s.why && <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{s.why}</div>}
        </div>
      </div>
    ))}
  </div>
}

function Tabs({ tabs, active, onChange, C }) {
  return <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
    {tabs.map((t, i) => (
      <button key={i} onClick={() => onChange(i)}
        style={{ fontSize:12, padding:'5px 12px', borderRadius:8, cursor:'pointer',
          border:`0.5px solid ${active===i ? C.blueBd : C.border}`,
          background:active===i ? C.blueBg : 'transparent',
          color:active===i ? C.blue : C.muted, fontWeight:active===i?500:400 }}>{t}</button>
    ))}
  </div>
}

function Grid2({ left, right }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
    {left}{right}
  </div>
}

function Mini({ label, value, color, C }) {
  const tc = { blue:C.blue, green:C.green, amber:C.amber, red:C.red, purple:C.purple, teal:C.teal }[color] || C.text
  return <div style={{ background:C.surface2, borderRadius:8, padding:'10px 12px' }}>
    <div style={{ fontSize:11, color:C.hint, marginBottom:3 }}>{label}</div>
    <div style={{ fontFamily:'monospace', fontSize:13, color:tc, whiteSpace:'pre-wrap', lineHeight:1.7 }}>{value}</div>
  </div>
}

// ── circle canvas for page 0 ──────────────────────────────────────────────────
function CircleCanvas({ C }) {
  const ref = useRef(null)
  const [pt, setPt] = useState({ x: 3, y: 4 })

  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const W = cv.offsetWidth || 320, H = 240
    cv.width = W; cv.height = H
    const ctx = cv.getContext('2d')
    const r = 5
    const sc = Math.min(W, H) / 2 - 20
    const ox = W / 2, oy = H / 2
    const px = x => ox + x * sc / r
    const py = y => oy - y * sc / r

    ctx.clearRect(0, 0, W, H)
    // grid
    for (let v = -5; v <= 5; v++) {
      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(px(v), py(-r - 0.5)); ctx.lineTo(px(v), py(r + 0.5)); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(px(-r - 0.5), py(v)); ctx.lineTo(px(r + 0.5), py(v)); ctx.stroke()
    }
    // axes
    ctx.strokeStyle = C.hint; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(px(-r), py(0)); ctx.lineTo(px(r), py(0)); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(px(0), py(-r)); ctx.lineTo(px(0), py(r)); ctx.stroke()

    // circle x²+y²=25
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.arc(ox, oy, sc, 0, Math.PI * 2); ctx.stroke()

    // point
    const { x, y } = pt
    ctx.fillStyle = C.amber; ctx.beginPath()
    ctx.arc(px(x), py(y), 6, 0, Math.PI * 2); ctx.fill()

    // tangent: slope = -x/y
    if (Math.abs(y) > 0.1) {
      const slope = -x / y
      const tlen = 1.8
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(px(x - tlen), py(y - tlen * slope))
      ctx.lineTo(px(x + tlen), py(y + tlen * slope))
      ctx.stroke()
    }

    // labels
    ctx.fillStyle = C.blue; ctx.font = `12px sans-serif`
    ctx.fillText('x² + y² = 25', px(-r + 0.1), py(r - 0.3))
    ctx.fillStyle = C.text; ctx.font = `11px sans-serif`
    ctx.fillText(`(${x.toFixed(1)}, ${y.toFixed(1)})`, px(x) + 8, py(y) - 8)
    if (Math.abs(y) > 0.1) {
      ctx.fillStyle = C.amber
      ctx.fillText(`slope = ${(-x / y).toFixed(3)}`, px(x) + 8, py(y) + 16)
    }
  }, [pt, C])

  const handleMove = (e) => {
    const cv = ref.current; if (!cv) return
    const rect = cv.getBoundingClientRect()
    const r = 5, sc = Math.min(cv.width, cv.height) / 2 - 20
    const ox = cv.width / 2, oy = cv.height / 2
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const wx = (mx - ox) / sc * r, wy = -(my - oy) / sc * r
    const dist = Math.sqrt(wx * wx + wy * wy)
    if (dist < 0.3) return
    const scale = 5 / dist
    setPt({ x: parseFloat((wx * scale).toFixed(2)), y: parseFloat((wy * scale).toFixed(2)) })
  }

  return (
    <div>
      <canvas ref={ref} onMouseMove={handleMove} onClick={handleMove}
        style={{ width:'100%', height:240, display:'block', cursor:'crosshair' }} />
      <p style={{ fontSize:11, color:C.hint, marginTop:4, textAlign:'center' }}>
        Move cursor over circle to see the tangent slope at any point
      </p>
    </div>
  )
}

// ── PAGE CONTENT ──────────────────────────────────────────────────────────────

function Page0({ C }) {
  return <>
    <Tag label="What & why" color="blue" C={C} />
    <H C={C}>What is implicit differentiation?</H>
    <P C={C}>Until now, every function you've differentiated has been <B>explicit</B> — y is alone on one side: y = x² + 3x. You can just differentiate the right side and you're done.</P>
    <P C={C}>But lots of curves can't be written that way. The equation x² + y² = 25 describes a circle. You can't write y = (one clean formula) — you'd need two: y = √(25−x²) and y = −√(25−x²). And each one only covers half the circle.</P>
    <Callout color="blue" title="Implicit means y is tangled up with x" C={C}>
      In an implicit equation, x and y appear mixed together and you can't cleanly isolate y. Examples: x² + y² = 25, x³ + y³ = 6xy, sin(xy) = x + y. Implicit differentiation lets you find dy/dx directly without ever solving for y.
    </Callout>
    <P C={C}>Move your cursor over the circle below. The slope at each point comes from dy/dx = −x/y — which we'll derive in a moment.</P>
    <CircleCanvas C={C} />
    <AhaBox title="The key idea in one sentence" C={C}>
      Treat y as a function of x (even though we haven't written it that way), differentiate both sides of the equation, then solve the result for dy/dx.
    </AhaBox>
  </>
}

function Page1({ C }) {
  return <>
    <Tag label="The core rule" color="amber" C={C} />
    <H C={C}>The one rule that makes it all work: chain rule on y</H>
    <P C={C}>Here's the entire engine of implicit differentiation. When you differentiate a term that contains y, you must use the chain rule — because y is secretly a function of x.</P>
    <P C={C}>Think of it this way: if y = f(x) (some unknown function), then y² = [f(x)]². The chain rule says:</P>
    <Code C={C}>{`d/dx [y²] = 2y · dy/dx`}</Code>
    <P C={C}>The 2y comes from differentiating y² (just like d/dx[u²] = 2u). The dy/dx at the end is the chain rule's "times derivative of inside." Since y is inside, and y is a function of x, we multiply by dy/dx.</P>
    <Grid2
      left={<Mini label="Explicit — easy case" color="blue" C={C}
        value={`y = x²\ndy/dx = 2x\n\nThe x just differentiates normally.`} />}
      right={<Mini label="Implicit — chain rule fires" color="amber" C={C}
        value={`d/dx[y²] = 2y · dy/dx\n\nEvery y term gets\n· dy/dx tacked on.`} />}
    />
    <WarnBox title="The #1 mistake in implicit differentiation" C={C}>
      Forgetting to write dy/dx after differentiating a y term. If you write d/dx[y²] = 2y and stop, you've lost the dy/dx — your answer will be wrong. Every single y term that you differentiate must get a · dy/dx multiplied on.
    </WarnBox>
    <P C={C}>Here's the pattern for every y term you'll encounter:</P>
    <Code C={C}>{`d/dx[y]   = 1 · dy/dx = dy/dx
d/dx[y²]  = 2y · dy/dx
d/dx[y³]  = 3y² · dy/dx
d/dx[yⁿ]  = n·yⁿ⁻¹ · dy/dx

d/dx[sin(y)] = cos(y) · dy/dx
d/dx[eʸ]     = eʸ · dy/dx
d/dx[ln(y)]  = (1/y) · dy/dx`}</Code>
    <Callout color="green" title="The pattern to memorize" C={C}>
      Differentiate the y expression as if y were x, then multiply the whole thing by dy/dx. That's it. The dy/dx is always a factor at the end.
    </Callout>
  </>
}

function Page2({ C }) {
  return <>
    <Tag label="The method" color="blue" C={C} />
    <H C={C}>The 4-step method — applied to x² + y² = 25</H>
    <P C={C}>Let's do the full circle example step by step. Same 4 steps every time, no matter how complicated the equation.</P>
    <Steps C={C} steps={[
      {
        eq: 'Start: x² + y² = 25',
        why: 'The equation as given. We want dy/dx — the slope of the curve at any point (x, y).',
      },
      {
        eq: 'd/dx[x²] + d/dx[y²] = d/dx[25]',
        why: "Step 1: Differentiate both sides with respect to x. Every term, one at a time. The right side (25) is a constant, so its derivative is 0.",
      },
      {
        eq: '2x + 2y · dy/dx = 0',
        why: "Step 2: Apply the rules. d/dx[x²] = 2x (normal). d/dx[y²] = 2y · dy/dx (chain rule — y gets the ·dy/dx). d/dx[25] = 0.",
      },
      {
        eq: '2y · dy/dx = −2x',
        why: 'Step 3: Isolate the dy/dx terms. Move everything without dy/dx to the other side.',
      },
      {
        eq: 'dy/dx = −2x / 2y = −x/y',
        why: 'Step 4: Solve for dy/dx by dividing. Done. The answer has both x and y in it — that is normal and expected.',
      },
    ]} />
    <AhaBox title="Why does the answer have both x and y?" C={C}>
      For explicit functions y = f(x), the slope depends only on x. But for implicit curves, a single x value can give multiple points on the curve (e.g., x=3 gives both (3,4) and (3,−4) on the circle). So the slope naturally depends on both x and y — you need both coordinates to know which point you're at.
    </AhaBox>
    <Callout color="amber" title="Always leave dy/dx in the answer if needed" C={C}>
      Your final answer for dy/dx can contain y. That's completely valid. You do not need to substitute y back in terms of x unless the problem asks for the slope at a specific point.
    </Callout>
  </>
}

function Page3({ C }) {
  const [tab, setTab] = useState(0)
  const examples = [
    {
      label: 'x³ + y³ = 6',
      steps: [
        { eq: 'd/dx[x³] + d/dx[y³] = d/dx[6]', why: 'Differentiate both sides.' },
        { eq: '3x² + 3y² · dy/dx = 0', why: 'd/dx[x³] = 3x². d/dx[y³] = 3y² · dy/dx (chain rule on y). d/dx[6] = 0.' },
        { eq: '3y² · dy/dx = −3x²', why: 'Move 3x² to the right.' },
        { eq: 'dy/dx = −3x² / 3y² = −x²/y²', why: 'Divide both sides by 3y².' },
      ],
    },
    {
      label: 'x²y + y³ = 5',
      steps: [
        { eq: 'd/dx[x²y] + d/dx[y³] = d/dx[5]', why: 'Differentiate both sides. The x²y term needs the product rule.' },
        { eq: '(2x·y + x²·dy/dx) + 3y²·dy/dx = 0', why: 'd/dx[x²y]: product rule → (d/dx[x²])·y + x²·(d/dx[y]) = 2xy + x²·dy/dx. d/dx[y³] = 3y²·dy/dx.' },
        { eq: '2xy + x²·dy/dx + 3y²·dy/dx = 0', why: 'Expand.' },
        { eq: 'dy/dx(x² + 3y²) = −2xy', why: 'Factor out dy/dx from the two terms that have it.' },
        { eq: 'dy/dx = −2xy / (x² + 3y²)', why: 'Divide. Notice: product rule + implicit = both x and y in the answer.' },
      ],
    },
    {
      label: 'sin(y) = x',
      steps: [
        { eq: 'd/dx[sin(y)] = d/dx[x]', why: 'Differentiate both sides.' },
        { eq: 'cos(y) · dy/dx = 1', why: 'd/dx[sin(y)] = cos(y) · dy/dx (chain rule on y). d/dx[x] = 1.' },
        { eq: 'dy/dx = 1/cos(y)', why: 'Divide both sides by cos(y).' },
        { eq: 'dy/dx = sec(y)', why: '1/cos(y) = sec(y). This is how we derive d/dx[arcsin] — this is y = arcsin(x) rearranged!' },
      ],
    },
    {
      label: 'eˣʸ = x + y',
      steps: [
        { eq: 'd/dx[eˣʸ] = d/dx[x] + d/dx[y]', why: 'Differentiate both sides.' },
        { eq: 'eˣʸ · d/dx[xy] = 1 + dy/dx', why: 'd/dx[eˣʸ]: chain rule gives eˣʸ times derivative of xy. Right: 1 + dy/dx.' },
        { eq: 'eˣʸ · (y + x·dy/dx) = 1 + dy/dx', why: 'd/dx[xy] uses the product rule: d/dx[x]·y + x·d/dx[y] = y + x·dy/dx.' },
        { eq: 'y·eˣʸ + x·eˣʸ·dy/dx = 1 + dy/dx', why: 'Expand.' },
        { eq: 'x·eˣʸ·dy/dx − dy/dx = 1 − y·eˣʸ', why: 'Collect dy/dx terms on the left, everything else on the right.' },
        { eq: 'dy/dx(x·eˣʸ − 1) = 1 − y·eˣʸ', why: 'Factor out dy/dx.' },
        { eq: 'dy/dx = (1 − y·eˣʸ) / (x·eˣʸ − 1)', why: 'Divide. Done — complex but same 4 steps.' },
      ],
    },
  ]
  return <>
    <Tag label="More examples" color="blue" C={C} />
    <H C={C}>Practice examples — click to work through each one</H>
    <P C={C}>Each example introduces a new wrinkle. Work through them in order — they build on each other.</P>
    <Tabs tabs={examples.map(e => e.label)} active={tab} onChange={setTab} C={C} />
    <Steps C={C} steps={examples[tab].steps} />
    {tab === 1 && <Callout color="amber" title="Product rule + implicit = both rules at once" C={C}>
      When you have a term like x²y, you need the product rule AND the chain-rule-on-y pattern together. Treat x² as one factor and y as the other. After differentiating: d/dx[x²]·y + x²·d/dx[y] = 2xy + x²·dy/dx. The x² out front of dy/dx stays because x² is the coefficient of the y factor.
    </Callout>}
    {tab === 2 && <Callout color="green" title="Connection to inverse trig" C={C}>
      sin(y) = x is just y = arcsin(x) rewritten. Implicit differentiation gives dy/dx = 1/cos(y). Using the triangle identity cos(y) = √(1−x²), we get dy/dx = 1/√(1−x²) — the arcsin derivative formula. Implicit differentiation is how that formula is proved.
    </Callout>}
    {tab === 3 && <Callout color="amber" title="Factor out dy/dx — the key algebra move" C={C}>
      Whenever dy/dx appears in more than one term, you must factor it out before you can solve. Collect all terms with dy/dx on one side, factor, then divide. Don't try to solve for dy/dx term by term — group first, then divide.
    </Callout>}
  </>
}

function Page4({ C }) {
  const [tab, setTab] = useState(0)
  const GOTCHAS = [
    {
      label: 'Forgetting dy/dx',
      bad:   'd/dx[y³] = 3y²',
      good:  'd/dx[y³] = 3y² · dy/dx',
      why:   'y is a function of x. Every y term you differentiate needs · dy/dx at the end. Missing it means your equation has the wrong number of dy/dx terms and you cannot solve.',
      color: 'red',
    },
    {
      label: 'Product rule on xy terms',
      bad:   'd/dx[x²y] = 2xy',
      good:  'd/dx[x²y] = 2xy + x² · dy/dx',
      why:   "x²y is a product of two things that both depend on x. Use the product rule: d/dx[x²]·y + x²·d/dx[y] = 2x·y + x²·dy/dx. If you just power-rule it you'll lose the x²·dy/dx term.",
      color: 'red',
    },
    {
      label: 'Not factoring out dy/dx',
      bad:   '2y·dy/dx + x²·dy/dx = 5\n→ dy/dx = 5 − 2y·dy/dx − x²·dy/dx ...(stuck in a loop)',
      good:  '2y·dy/dx + x²·dy/dx = 5\n→ dy/dx(2y + x²) = 5\n→ dy/dx = 5/(2y + x²)',
      why:   'When dy/dx appears in multiple terms, you cannot solve for it term by term. Factor it out first, then divide. Treat dy/dx like an unknown variable you are solving for.',
      color: 'amber',
    },
    {
      label: 'Differentiating a constant as y',
      bad:   'd/dx[5] = dy/dx',
      good:  'd/dx[5] = 0',
      why:   "A plain number like 5 is a constant with respect to x. Its derivative is 0. Only an actual y term (where y appears) gives dy/dx. Don't confuse the numeral 5 with y.",
      color: 'red',
    },
    {
      label: 'Chain rule inside y terms',
      bad:   'd/dx[sin(y²)] = cos(y²) · dy/dx',
      good:  'd/dx[sin(y²)] = cos(y²) · 2y · dy/dx',
      why:   'When y itself is raised to a power or inside another function, you chain rule twice: first for the outer function (sin → cos), then for y² (→ 2y), then for y (→ dy/dx). All three factors multiply together.',
      color: 'amber',
    },
    {
      label: 'Forgetting the right-side dy/dx',
      bad:   'Equation: x + y = xy\nRight side: d/dx[xy] = y  (forgot the x·dy/dx)',
      good:  'd/dx[xy] = 1·y + x·dy/dx = y + x·dy/dx',
      why:   "The product rule applies everywhere — including on the right side of the equation. Don't only apply the chain rule on the left and forget it on the right.",
      color: 'red',
    },
  ]
  const g = GOTCHAS[tab]
  const bdColor = g.color === 'red' ? C.redBd : C.amberBd
  const bgColor = g.color === 'red' ? C.redBg : C.amberBg
  const tcColor = g.color === 'red' ? C.red : C.amber
  return <>
    <Tag label="Gotchas" color="red" C={C} />
    <H C={C}>The 6 mistakes everyone makes — and how to avoid them</H>
    <P C={C}>These are the most common errors on implicit differentiation assignments. Every one of them will cost you marks if you're not looking for them.</P>
    <Tabs tabs={GOTCHAS.map((g,i) => `${i+1}. ${g.label}`)} active={tab} onChange={setTab} C={C} />
    <div style={{ background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:8,
      padding:'10px 14px', marginBottom:8 }}>
      <div style={{ fontSize:11, color:C.red, marginBottom:4, fontWeight:500 }}>Wrong</div>
      <div style={{ fontFamily:'monospace', fontSize:13, color:C.red, whiteSpace:'pre-wrap' }}>{g.bad}</div>
    </div>
    <div style={{ background:C.greenBg, border:`1px solid ${C.greenBd}`, borderRadius:8,
      padding:'10px 14px', marginBottom:8 }}>
      <div style={{ fontSize:11, color:C.green, marginBottom:4, fontWeight:500 }}>Correct</div>
      <div style={{ fontFamily:'monospace', fontSize:13, color:C.green, whiteSpace:'pre-wrap' }}>{g.good}</div>
    </div>
    <Callout color={g.color} title="Why this happens and how to catch it" C={C}>{g.why}</Callout>
  </>
}

function Page5({ C }) {
  const [tab, setTab] = useState(0)
  const TANGENTS = [
    {
      label: 'Circle x²+y²=25 at (3,4)',
      steps: [
        { eq: 'Find dy/dx from the equation first', why: 'x² + y² = 25  →  dy/dx = −x/y  (we derived this on page 3)' },
        { eq: 'Plug in (3, 4)', why: 'dy/dx = −3/4.  This is the slope m of the tangent line at (3,4).' },
        { eq: 'Tangent line: y − y₀ = m(x − x₀)', why: 'Point-slope form with (x₀, y₀) = (3, 4) and m = −3/4.' },
        { eq: 'y − 4 = −(3/4)(x − 3)', why: 'Substitute.' },
        { eq: 'y = −(3/4)x + 9/4 + 4 = −(3/4)x + 25/4', why: 'Simplify. Done.' },
      ],
    },
    {
      label: 'Folium x³+y³=6xy at (2,2)',
      steps: [
        { eq: 'd/dx[x³+y³] = d/dx[6xy]', why: 'Differentiate both sides.' },
        { eq: '3x² + 3y²·dy/dx = 6(y + x·dy/dx)', why: 'd/dx[6xy] uses product rule: 6(1·y + x·dy/dx) = 6y + 6x·dy/dx.' },
        { eq: '3x² + 3y²·dy/dx = 6y + 6x·dy/dx', why: 'Expand right side.' },
        { eq: '3y²·dy/dx − 6x·dy/dx = 6y − 3x²', why: 'Collect dy/dx terms on left, rest on right.' },
        { eq: 'dy/dx(3y² − 6x) = 6y − 3x²', why: 'Factor out dy/dx.' },
        { eq: 'dy/dx = (6y − 3x²) / (3y² − 6x) = (2y − x²) / (y² − 2x)', why: 'Divide and simplify (factor out 3).' },
        { eq: 'At (2,2): dy/dx = (4 − 4) / (4 − 4) = 0/0', why: 'Indeterminate! This point is actually a special self-intersection — the tangent is vertical OR horizontal depending on approach. Not every point works cleanly.' },
        { eq: 'Try (0, 0) neighbourhood or another point', why: 'When numerator and denominator are both 0, the curve has a singular point — implicit differentiation cannot give the slope there directly.' },
      ],
    },
    {
      label: 'Ellipse x²/9 + y²/4 = 1 at (0,2)',
      steps: [
        { eq: 'd/dx[x²/9] + d/dx[y²/4] = d/dx[1]', why: 'Differentiate both sides.' },
        { eq: '(2x/9) + (2y/4)·dy/dx = 0', why: '(1/9)·2x and (1/4)·2y·dy/dx.' },
        { eq: '(y/2)·dy/dx = −2x/9', why: 'Move (2x/9) to the right, simplify (2y/4) to y/2.' },
        { eq: 'dy/dx = (−2x/9) · (2/y) = −4x / (9y)', why: 'Multiply both sides by 2/y.' },
        { eq: 'At (0, 2): dy/dx = −4(0)/(9·2) = 0', why: 'Slope = 0. The tangent is horizontal at (0,2) — the top of the ellipse. Makes geometric sense.' },
        { eq: 'Tangent line: y − 2 = 0(x − 0)  →  y = 2', why: 'Horizontal line through (0,2).' },
      ],
    },
  ]
  return <>
    <Tag label="Tangent lines" color="teal" C={C} />
    <H C={C}>Finding tangent lines with implicit differentiation</H>
    <P C={C}>Finding a tangent line is a two-step process: first get dy/dx using implicit differentiation, then evaluate it at the given point to get the slope, then use point-slope form.</P>
    <Code C={C}>{`Tangent line formula:  y − y₀ = m(x − x₀)
where m = dy/dx evaluated at (x₀, y₀)`}</Code>
    <Callout color="blue" title="Important: always substitute the point into dy/dx, not into the original equation" C={C}>
      You already know the point (x₀, y₀) is on the curve. Don't re-check that. Just plug (x₀, y₀) into your dy/dx expression to get the numerical slope m.
    </Callout>
    <Tabs tabs={TANGENTS.map(t => t.label)} active={tab} onChange={setTab} C={C} />
    <Steps C={C} steps={TANGENTS[tab].steps} />
    {tab === 1 && <WarnBox title="When 0/0 appears in dy/dx" C={C}>
      If plugging in a point gives 0/0, the curve has a singular point there — a self-intersection, cusp, or node. Implicit differentiation breaks down at these points. On an assignment, check you have the right point, or the problem will clarify it's a special case.
    </WarnBox>}
  </>
}

function Page6({ C }) {
  return <>
    <Tag label="Second derivative" color="purple" C={C} />
    <H C={C}>Finding d²y/dx² — the second derivative</H>
    <P C={C}>Sometimes assignments ask for the second derivative d²y/dx² (written y″). The process: differentiate dy/dx once more with respect to x — implicitly again.</P>
    <P C={C}>Example: find y″ for x² + y² = 25.</P>
    <Steps C={C} steps={[
      { eq: 'Start with dy/dx = −x/y', why: "We already found this. Now differentiate it again with respect to x." },
      { eq: "d²y/dx² = d/dx[−x/y]", why: "Apply d/dx to both sides of dy/dx = −x/y." },
      { eq: "= −(d/dx[x] · y − x · d/dx[y]) / y²", why: "Quotient rule: d/dx[−x/y] = −(y·1 − x·dy/dx) / y²." },
      { eq: "= −(y − x · dy/dx) / y²", why: "d/dx[x] = 1,  d/dx[y] = dy/dx." },
      { eq: "= −(y − x · (−x/y)) / y²", why: "Substitute dy/dx = −x/y back in." },
      { eq: "= −(y + x²/y) / y²", why: "Simplify: x·(x/y) = x²/y." },
      { eq: "= −(y² + x²) / y³", why: "Multiply numerator and denominator by y: (y + x²/y)·y = y² + x²." },
      { eq: "= −25 / y³", why: "Since x² + y² = 25 on the curve, substitute y² + x² = 25. Final answer." },
    ]} />
    <AhaBox title="The key move: substitute dy/dx back in" C={C}>
      After using the quotient/product rule to differentiate dy/dx, you'll have dy/dx appearing inside the expression. Always substitute your dy/dx formula back in and simplify. Also use the original equation to simplify if possible (like x²+y²=25 above).
    </AhaBox>
    <Callout color="purple" title="Step-by-step checklist for y″" C={C}>
      (1) Find dy/dx by implicit differentiation. (2) Write d/dx applied to both sides of dy/dx = (expression). (3) Differentiate the right side — treat dy/dx as a variable, use product/quotient rule as needed. (4) Substitute your dy/dx formula into the result. (5) Use the original equation to simplify further if possible.
    </Callout>
    <WarnBox title="Don't differentiate the original equation twice" C={C}>
      A common mistake: going back to the original equation (x² + y² = 25) and differentiating again instead of differentiating dy/dx. You must differentiate the dy/dx expression, not the original curve equation.
    </WarnBox>
  </>
}

function Page7({ C }) {
  const [tab, setTab] = useState(0)
  const PROBLEMS = [
    {
      label: 'Basic — find dy/dx',
      problem: 'x⁴ + y⁴ = 16',
      steps: [
        { eq: '4x³ + 4y³ · dy/dx = 0', why: 'Differentiate both sides. d/dx[x⁴] = 4x³. d/dx[y⁴] = 4y³ · dy/dx. d/dx[16] = 0.' },
        { eq: '4y³ · dy/dx = −4x³', why: 'Move 4x³ to the right.' },
        { eq: 'dy/dx = −x³/y³', why: 'Divide by 4y³. Done.' },
      ],
      note: null,
    },
    {
      label: 'Product rule needed',
      problem: 'x²y³ = 10',
      steps: [
        { eq: 'd/dx[x²y³] = d/dx[10]', why: 'Differentiate both sides.' },
        { eq: '2x·y³ + x²·3y²·dy/dx = 0', why: 'Product rule on left: (d/dx[x²])·y³ + x²·(d/dx[y³]) = 2x·y³ + x²·3y²·dy/dx.' },
        { eq: '3x²y²·dy/dx = −2xy³', why: 'Move 2xy³ to the right.' },
        { eq: 'dy/dx = −2xy³ / (3x²y²) = −2y/(3x)', why: 'Divide. Simplify by cancelling one x and one y².' },
      ],
      note: null,
    },
    {
      label: 'Trig equation',
      problem: 'sin(x+y) = y²cos(x)',
      steps: [
        { eq: 'd/dx[sin(x+y)] = d/dx[y²cos(x)]', why: 'Differentiate both sides.' },
        { eq: 'cos(x+y)·(1+dy/dx) = 2y·dy/dx·cos(x) + y²·(−sin(x))', why: 'Left: chain rule on sin(x+y) — derivative of inside is 1+dy/dx. Right: product rule on y²cos(x).' },
        { eq: 'cos(x+y) + cos(x+y)·dy/dx = 2y·cos(x)·dy/dx − y²sin(x)', why: 'Expand the left side.' },
        { eq: 'cos(x+y)·dy/dx − 2y·cos(x)·dy/dx = −y²sin(x) − cos(x+y)', why: 'Collect dy/dx terms on left.' },
        { eq: 'dy/dx[cos(x+y) − 2y·cos(x)] = −y²sin(x) − cos(x+y)', why: 'Factor out dy/dx.' },
        { eq: 'dy/dx = (−y²sin(x) − cos(x+y)) / (cos(x+y) − 2y·cos(x))', why: 'Divide. Done.' },
      ],
      note: 'On trig problems: chain rule fires on any composite like sin(x+y). The inside here is x+y, whose derivative is 1+dy/dx.',
    },
    {
      label: 'Find tangent at point',
      problem: 'y² − x² = 7  at  (1, −2√2)',
      steps: [
        { eq: '2y·dy/dx − 2x = 0', why: 'Differentiate both sides. d/dx[y²] = 2y·dy/dx. d/dx[x²] = 2x. d/dx[7] = 0.' },
        { eq: 'dy/dx = 2x / 2y = x/y', why: 'Solve for dy/dx.' },
        { eq: 'At (1, −2√2): dy/dx = 1/(−2√2) = −√2/4', why: 'Substitute x=1, y=−2√2. Rationalize: 1/(−2√2)·(√2/√2) = −√2/4.' },
        { eq: 'y − (−2√2) = (−√2/4)(x − 1)', why: 'Point-slope form.' },
        { eq: 'y = (−√2/4)x + √2/4 − 2√2', why: 'Simplify: −2√2 = −8√2/4, so constant = √2/4 − 8√2/4 = −7√2/4.' },
        { eq: 'y = (−√2/4)x − 7√2/4', why: 'Final tangent line equation.' },
      ],
      note: null,
    },
    {
      label: 'Second derivative',
      problem: 'Find y″ for  xy = 4',
      steps: [
        { eq: "y + x·dy/dx = 0", why: "Differentiate xy = 4 using product rule: d/dx[x]·y + x·d/dx[y] = 1·y + x·dy/dx = 0." },
        { eq: "dy/dx = −y/x", why: "Solve for dy/dx." },
        { eq: "d²y/dx² = d/dx[−y/x]", why: "Differentiate dy/dx = −y/x again with respect to x." },
        { eq: "= −(dy/dx · x − y · 1) / x²", why: "Quotient rule: d/dx[y/x] = (dy/dx · x − y) / x²." },
        { eq: "= −(x · dy/dx − y) / x²", why: "Rewrite." },
        { eq: "= −(x·(−y/x) − y) / x²", why: "Substitute dy/dx = −y/x." },
        { eq: "= −(−y − y) / x² = 2y/x²", why: "Simplify: −y − y = −2y, then −(−2y) = 2y." },
        { eq: "= 2(4/x) / x² = 8/x³", why: "Since xy = 4, y = 4/x. Substitute for cleaner form." },
      ],
      note: null,
    },
  ]
  const p = PROBLEMS[tab]
  return <>
    <Tag label="Assignment problems" color="purple" C={C} />
    <H C={C}>Full worked examples — every problem type you'll see</H>
    <P C={C}>These cover every category that appears on Calc 1 implicit differentiation assignments. Work through the ones that match your problem set.</P>
    <Tabs tabs={PROBLEMS.map(p => p.label)} active={tab} onChange={setTab} C={C} />
    <div style={{ background:C.blueBg, border:`0.5px solid ${C.blueBd}`, borderRadius:8,
      padding:'8px 14px', marginBottom:10 }}>
      <span style={{ fontSize:11, color:C.blue, fontWeight:500 }}>Problem: </span>
      <span style={{ fontFamily:'monospace', fontSize:13, color:C.blue }}>{p.problem}</span>
    </div>
    <Steps C={C} steps={p.steps} />
    {p.note && <Callout color="amber" title="Note for this type" C={C}>{p.note}</Callout>}
  </>
}

function Page8({ C }) {
  return <>
    <Tag label="Reference card" color="green" C={C} />
    <H C={C}>Everything on one page — your cheat sheet</H>
    <P C={C}>The complete reference for implicit differentiation. Keep this open during assignments.</P>
    <Code C={C}>{`THE 4-STEP METHOD
─────────────────────────────────────────
1. Differentiate BOTH sides w.r.t. x
2. Apply chain rule to every y term (add · dy/dx)
3. Move all dy/dx terms to one side, rest to other
4. Factor out dy/dx, then divide

KEY DERIVATIVE RULES FOR y TERMS
─────────────────────────────────────────
d/dx[y]         = dy/dx
d/dx[y²]        = 2y · dy/dx
d/dx[yⁿ]        = n·yⁿ⁻¹ · dy/dx
d/dx[sin(y)]    = cos(y) · dy/dx
d/dx[cos(y)]    = −sin(y) · dy/dx
d/dx[tan(y)]    = sec²(y) · dy/dx
d/dx[eʸ]        = eʸ · dy/dx
d/dx[ln(y)]     = (1/y) · dy/dx
d/dx[sin(y²)]   = cos(y²) · 2y · dy/dx  ← double chain rule

PRODUCT RULE WHEN x AND y ARE MIXED
─────────────────────────────────────────
d/dx[x·y]   = y + x · dy/dx
d/dx[x²y]   = 2xy + x² · dy/dx
d/dx[x·y³]  = y³ + x · 3y² · dy/dx

TANGENT LINE AT (x₀, y₀)
─────────────────────────────────────────
1. Find dy/dx from implicit differentiation
2. m = dy/dx evaluated at (x₀, y₀)
3. Line: y − y₀ = m(x − x₀)

SECOND DERIVATIVE y″
─────────────────────────────────────────
1. Find dy/dx
2. Differentiate dy/dx again (use quotient rule)
3. Substitute dy/dx back in
4. Use original equation to simplify if possible`}</Code>
    <WarnBox title="The 3 things that lose marks every time" C={C}>
      1. Missing · dy/dx on a y term after differentiating it.
      2. Not using product rule on mixed terms like x²y or xy³.
      3. Trying to solve for dy/dx before factoring it out when it appears multiple times.
    </WarnBox>
    <AhaBox title="How to check your answer" C={C}>
      Pick a specific point (x₀, y₀) on the curve. Plug it into your dy/dx formula to get a number. Then estimate the slope numerically: take two points very close together on the curve and compute Δy/Δx. If the numbers match, your dy/dx is correct.
    </AhaBox>
  </>
}

// ── page list ─────────────────────────────────────────────────────────────────
const PAGES = [
  { component: Page0, label: 'What & why' },
  { component: Page1, label: 'Core rule' },
  { component: Page2, label: '4-step method' },
  { component: Page3, label: 'More examples' },
  { component: Page4, label: 'Gotchas' },
  { component: Page5, label: 'Tangent lines' },
  { component: Page6, label: '2nd derivative' },
  { component: Page7, label: 'Assignment' },
  { component: Page8, label: 'Cheat sheet' },
]

// ── root component ────────────────────────────────────────────────────────────
export default function ImplicitDifferentiation({ params = {} }) {
  const C = useColors()
  const containerRef = useRef(null)
  const [page, setPage] = useState(params.currentStep ?? 0)

  useEffect(() => {
    if (params.currentStep !== undefined)
      setPage(Math.min(params.currentStep, PAGES.length - 1))
  }, [params.currentStep])

  const PageComponent = PAGES[Math.min(page, PAGES.length - 1)].component

  return (
    <div ref={containerRef} style={{ width: '100%', fontFamily: 'sans-serif' }}>
      {/* progress dots */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {PAGES.map((pg, i) => (
          <button key={i} onClick={() => setPage(i)}
            style={{ flex: '1 1 auto', height: 4, borderRadius: 2, cursor: 'pointer', border: 'none',
              minWidth: 20,
              background: i < page ? C.blue : i === page ? C.amber : C.border,
              transition: 'background .25s' }} />
        ))}
      </div>
      {/* page label */}
      <div style={{ fontSize: 11, color: C.hint, marginBottom: 10, display: 'flex',
        justifyContent: 'space-between' }}>
        <span>{PAGES[page].label}</span>
        <span>{page + 1} / {PAGES.length}</span>
      </div>

      {/* content */}
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`,
        borderRadius: 12, padding: '1.25rem', marginBottom: 12 }}>
        <PageComponent C={C} />
      </div>

      {/* nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
          style={{ fontSize: 13, padding: '7px 18px', borderRadius: 8,
            cursor: page === 0 ? 'default' : 'pointer',
            border: `0.5px solid ${C.border}`, background: 'transparent',
            color: C.text, opacity: page === 0 ? 0.3 : 1 }}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PAGES.map((pg, i) => (
            <button key={i} onClick={() => setPage(i)}
              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                border: `0.5px solid ${i === page ? C.amberBd : C.border}`,
                background: i === page ? C.amberBg : 'transparent',
                color: i === page ? C.amber : C.hint }}>
              {pg.label}
            </button>
          ))}
        </div>
        <button disabled={page === PAGES.length - 1} onClick={() => setPage(p => p + 1)}
          style={{ fontSize: 13, padding: '7px 18px', borderRadius: 8,
            cursor: page === PAGES.length - 1 ? 'default' : 'pointer',
            border: 'none', background: C.text, color: C.bg,
            opacity: page === PAGES.length - 1 ? 0.3 : 1 }}>
          Next →
        </button>
      </div>
    </div>
  )
}
