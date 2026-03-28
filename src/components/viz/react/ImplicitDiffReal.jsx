import { useState, useEffect, useRef } from 'react'

function useColors() {
  const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg: dark?'#0f172a':'#f8fafc', surface: dark?'#1e293b':'#ffffff',
    surface2: dark?'#0f172a':'#f1f5f9', border: dark?'#334155':'#e2e8f0',
    text: dark?'#e2e8f0':'#1e293b', muted: dark?'#94a3b8':'#64748b', hint: dark?'#475569':'#94a3b8',
    blue: dark?'#38bdf8':'#0284c7', blueBg: dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)', blueBd: dark?'#38bdf8':'#0284c7',
    amber: dark?'#fbbf24':'#d97706', amberBg: dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)', amberBd: dark?'#fbbf24':'#d97706',
    green: dark?'#4ade80':'#16a34a', greenBg: dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)', greenBd: dark?'#4ade80':'#16a34a',
    red: dark?'#f87171':'#dc2626', redBg: dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)', redBd: dark?'#f87171':'#dc2626',
    purple: dark?'#a78bfa':'#7c3aed', purpleBg: dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)', purpleBd: dark?'#a78bfa':'#7c3aed',
    teal: dark?'#2dd4bf':'#0d9488', tealBg: dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)', tealBd: dark?'#2dd4bf':'#0d9488',
  }
}

function Tag({ label, color, C }) {
  const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]}
  const [bg,tc]=m[color]||m.blue
  return <span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>
}
function Heading({children,C}){return<h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>}
function Para({children,C}){return<p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>}
function Strong({children}){return<span style={{fontWeight:500}}>{children}</span>}
function Callout({children,color,title,C}){
  const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]}
  const [bg,bd,tc]=m[color]||m.amber
  return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>
}
function AhaBox({title,children,C}){return<div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}
function WarnBox({title,children,C}){return<div style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.red,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.red,lineHeight:1.65}}>{children}</div></div>}
function CodeBox({children,C}){return<div style={{background:C.surface2,borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:13,color:C.text,lineHeight:2.1,marginBottom:10,whiteSpace:'pre-wrap'}}>{children}</div>}
function TwoCol({children}){return<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>{children}</div>}
function Stat({label,value,color,C}){return<div style={{background:C.surface2,borderRadius:8,padding:'8px 12px'}}><div style={{fontSize:11,color:C.hint,marginBottom:2}}>{label}</div><div style={{fontFamily:'monospace',fontSize:12,color:color||C.text,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{value}</div></div>}
function Tabs({tabs,active,onChange,C}){return<div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>{tabs.map((t,i)=><button key={i} onClick={()=>onChange(i)} style={{fontSize:12,padding:'5px 12px',borderRadius:8,cursor:'pointer',border:`0.5px solid ${active===i?C.blueBd:C.border}`,background:active===i?C.blueBg:'transparent',color:active===i?C.blue:C.muted,fontWeight:active===i?500:400}}>{t}</button>)}</div>}

function Steps({steps,C}){
  return<div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>{steps.map((s,i)=><div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
    <div style={{width:22,height:22,borderRadius:'50%',background:C.blueBg,color:C.blue,fontSize:11,fontWeight:500,flexShrink:0,marginTop:2,display:'flex',alignItems:'center',justifyContent:'center'}}>{i+1}</div>
    <div style={{flex:1}}>
      <div style={{fontFamily:'monospace',fontSize:13,color:C.text,background:C.surface2,padding:'5px 10px',borderRadius:6,marginBottom:3,lineHeight:1.8}}>{s.eq}</div>
      {s.why&&<div style={{fontSize:12,color:C.muted,lineHeight:1.55,whiteSpace:'pre-wrap'}}>{s.why}</div>}
    </div>
  </div>)}</div>
}

function ExpCanvas({C}){
  const cvRef=useRef(null),roRef=useRef(null)
  const [xVal,setXVal]=useState(2.0)
  useEffect(()=>{
    const draw=()=>{
      const cv=cvRef.current;if(!cv)return
      const cw=cv.offsetWidth||500,ch=240
      cv.width=cw;cv.height=ch
      const ctx=cv.getContext('2d')
      const pl=52,pr=20,pt=20,pb=36
      const iw=cw-pl-pr,ih=ch-pt-pb
      const xMin=0.08,xMax=8,yMin=-1,yMax=2.2
      const tx=x=>pl+((x-xMin)/(xMax-xMin))*iw
      const ty=y=>pt+ih-((y-yMin)/(yMax-yMin))*ih
      ctx.clearRect(0,0,cw,ch)
      for(let x=1;x<=8;x++){
        ctx.strokeStyle=C.border;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tx(x),pt);ctx.lineTo(tx(x),pt+ih);ctx.stroke()
        ctx.fillStyle=C.muted;ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(x,tx(x),pt+ih+14)
      }
      for(let y=-1;y<=2;y+=0.5){
        ctx.strokeStyle=C.border;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pl,ty(y));ctx.lineTo(pl+iw,ty(y));ctx.stroke()
        ctx.fillStyle=C.muted;ctx.font='11px sans-serif';ctx.textAlign='right';ctx.fillText(y.toFixed(1),pl-4,ty(y)+4)
      }
      ctx.strokeStyle=C.hint;ctx.lineWidth=1.5
      ctx.beginPath();ctx.moveTo(pl,ty(0));ctx.lineTo(pl+iw,ty(0));ctx.stroke()
      ctx.strokeStyle=C.blue;ctx.lineWidth=2.5;ctx.beginPath()
      let first=true
      for(let xi=0.09;xi<=xMax;xi+=0.04){
        const yi=Math.log(xi)
        if(yi<yMin-0.2||yi>yMax+0.2){first=true;continue}
        first?ctx.moveTo(tx(xi),ty(yi)):ctx.lineTo(tx(xi),ty(yi));first=false
      }
      ctx.stroke()
      ctx.fillStyle=C.blue;ctx.font='500 12px sans-serif';ctx.textAlign='left'
      ctx.fillText('eʸ = x  (same curve as y = ln x)',tx(0.12),ty(1.85))
      const yv=Math.log(xVal),slope=1/xVal,tlen=1.0
      ctx.strokeStyle=C.amber;ctx.lineWidth=2
      ctx.beginPath();ctx.moveTo(tx(xVal-tlen),ty(yv-tlen*slope));ctx.lineTo(tx(xVal+tlen),ty(yv+tlen*slope));ctx.stroke()
      ctx.fillStyle=C.amber;ctx.beginPath();ctx.arc(tx(xVal),ty(yv),6,0,Math.PI*2);ctx.fill()
      const lx=tx(xVal)+10,ly=ty(yv)-8
      ctx.fillStyle=C.text;ctx.font='500 12px sans-serif';ctx.textAlign='left'
      ctx.fillText('x='+xVal.toFixed(2)+',  y='+yv.toFixed(3),lx,ly)
      ctx.fillStyle=C.amber;ctx.font='11px sans-serif'
      ctx.fillText('tangent slope = dy/dx = 1/eʸ = 1/x = '+slope.toFixed(3),lx,ly+15)
      ctx.fillStyle=C.muted;ctx.font='12px sans-serif';ctx.textAlign='center'
      ctx.fillText('x',pl+iw/2,ch-4)
      ctx.save();ctx.translate(13,pt+ih/2);ctx.rotate(-Math.PI/2);ctx.fillText('y',0,0);ctx.restore()
    }
    draw()
    if(!roRef.current){roRef.current=new ResizeObserver(draw);if(cvRef.current?.parentElement)roRef.current.observe(cvRef.current.parentElement)}
    return()=>{if(roRef.current){roRef.current.disconnect();roRef.current=null}}
  },[xVal,C])
  return<div>
    <canvas ref={cvRef} style={{width:'100%',height:240,display:'block'}}/>
    <div style={{display:'flex',alignItems:'center',gap:10,marginTop:6}}>
      <span style={{fontSize:12,color:C.muted,minWidth:40}}>x =</span>
      <input type="range" min={0.2} max={7.5} step={0.05} value={xVal} onChange={e=>setXVal(+e.target.value)} style={{flex:1}}/>
      <span style={{fontFamily:'monospace',fontSize:12,color:C.amber,minWidth:44}}>{xVal.toFixed(2)}</span>
    </div>
  </div>
}

function PageWhyItExists({C}){
  return<>
    <Tag label="The big picture" color="blue" C={C}/>
    <Heading C={C}>Why implicit differentiation exists — what problem it solves</Heading>
    <Para C={C}>Every rule you have learned so far works on <Strong>explicit functions</Strong>: y is alone on one side. y = x², y = sin(x), y = eˣ. Differentiate the right side, done.</Para>
    <Para C={C}>But physics and mathematics are full of equations where you <Strong>cannot isolate y</Strong> — or where isolating it would be so messy it destroys the meaning. These are all real:</Para>
    <CodeBox C={C}>{`eʸ = x              ← can isolate (y = ln x), but useful NOT to
PV = nRT            ← four variables, which do you want?
x² + y² = r²        ← circle: two solutions, cannot isolate cleanly
x³ + y³ = 6xy       ← algebraically impossible to isolate
sin(xy) = x + y     ← completely impossible
v² = u² + 2as       ← kinematics: differentiate both sides directly`}</CodeBox>
    <Para C={C}>Implicit differentiation finds dy/dx directly from the equation as written. It works because of one idea: <Strong>y is a function of x even when we have not written it that way.</Strong></Para>
    <AhaBox title="The key insight" C={C}>
      When we write x² + y² = 25, we know y depends on x — moving along the circle, as x changes, y must change to keep the equation true. We do not know the explicit rule, but we know it exists. Implicit differentiation treats y as "some function of x I have not named yet" and uses the chain rule to handle it. The chain rule is the only new ingredient.
    </AhaBox>
    <TwoCol>
      <Stat label="Use explicit diff when" color={C.blue} C={C} value={"y = f(x) is already isolated\nJust differentiate the right side\nAnswer has only x in it"}/>
      <Stat label="Use implicit diff when" color={C.amber} C={C} value={"y is tangled with x\nCannot or should not isolate y\nAnswer will have both x and y"}/>
    </TwoCol>
    <Callout color="teal" title="Where you will see this in your course" C={C}>
      Three places: (1) tangent lines to curves that are not functions, (2) deriving inverse trig derivatives — d/dx[arcsin x] comes entirely from implicit differentiation, (3) related rates — where multiple quantities change with time and you differentiate a connecting equation. It is one of the most applied techniques in Calc 1.
    </Callout>
  </>
}

function PageExpExample({C}){
  return<>
    <Tag label="Core example" color="amber" C={C}/>
    <Heading C={C}>eʸ = x — the example that ties it all together</Heading>
    <Para C={C}>This is the most important example because it <Strong>proves d/dx[ln x] = 1/x from scratch</Strong>, and it shows exactly how the chain rule fires on a y term. We want dy/dx.</Para>
    <Steps C={C} steps={[
      {eq:'Start:  eʸ = x',why:'The equation as given. y is in the exponent — we cannot isolate it without knowing ln already, so we differentiate implicitly instead.'},
      {eq:'d/dx[ eʸ ] = d/dx[ x ]',why:'Differentiate BOTH sides with respect to x. This is always the first move. Whatever is on the left, whatever is on the right — differentiate both.'},
      {eq:'eʸ · dy/dx = 1',why:'LEFT: chain rule on eʸ. Rule: d/dx[eᵘ] = eᵘ · du/dx. Here u = y, so du/dx = dy/dx. Result: eʸ · dy/dx.\n\nRIGHT: d/dx[x] = 1. This 1 is NOT magic — it is just the derivative of x. That is where the "1 in the numerator" comes from in the inverse function formula.'},
      {eq:'dy/dx = 1 / eʸ',why:'Divide both sides by eʸ to isolate dy/dx.'},
      {eq:'dy/dx = 1 / x',why:'Since eʸ = x from our original equation, substitute x for eʸ. Now the answer is in terms of x only.'},
      {eq:'Therefore: d/dx[ln x] = 1/x  ✓',why:'Since eʸ = x means y = ln(x), we have proved the ln derivative using implicit differentiation — without needing to know it in advance. This is how the formula was originally derived.'},
    ]}/>
    <Para C={C}>Drag the slider — the tangent slope is always exactly 1/x:</Para>
    <ExpCanvas C={C}/>
    <AhaBox title="Why the chain rule gives · dy/dx on every y term" C={C}>
      The chain rule: d/dx[f(y)] = f′(y) · dy/dx. For f(y) = eʸ, f′(y) = eʸ. So d/dx[eʸ] = eʸ · dy/dx. The · dy/dx is the chain rule accounting for the fact that y changes with x. This is not optional — missing it gives the wrong answer every single time.
    </AhaBox>
    <WarnBox title="The most common mistake" C={C}>
      Writing d/dx[eʸ] = eʸ and stopping — forgetting the · dy/dx. That treats y as if it were a constant. But y is not constant — it changes as x moves along the curve. Without the · dy/dx there is nothing to solve for, and your final answer is wrong.
    </WarnBox>
  </>
}

function PagePhysics({C}){
  const [tab,setTab]=useState(0)
  const physics=[
    {
      label:'PV = nRT',
      title:'Ideal Gas Law — how pressure and volume trade off',
      scenario:'A gas is in a cylinder. Temperature and amount are fixed. A piston moves, changing volume V. How fast does pressure P change per unit change in volume?',
      steps:[
        {eq:'PV = nRT',why:'The ideal gas law. n = moles, R = 8.314 J/mol·K, T = temperature (K). Treat n, R, T as constants for this process — only P and V change.'},
        {eq:'d/dV[ PV ] = d/dV[ nRT ]',why:'Differentiate both sides with respect to V. We want dP/dV. Right side: nRT is a constant so its derivative is 0.'},
        {eq:'P + V · dP/dV = 0',why:'Left side: product rule on PV. d/dV[P·V] = dP/dV · V + P · 1. We get P + V·dP/dV. Right side = 0.'},
        {eq:'V · dP/dV = −P',why:'Move P to the right side.'},
        {eq:'dP/dV = −P/V = −nRT/V²',why:'Divide by V. Sub P = nRT/V to get the pure form. Negative: pressure drops as volume grows. The V² means compressing a small gas is far harder than a large one — the same ΔV produces far more ΔP at small V.'},
      ],
      insight:'dP/dV = −nRT/V² is the sensitivity of pressure to volume. At small V the magnitude is huge — a tiny compression spikes the pressure. At large V it is gentle. This is why car tires feel rock-hard when nearly full.',
      insightColor:'blue',
    },
    {
      label:'v² = u² + 2as',
      title:'Kinematics — linking velocity, acceleration and position directly',
      scenario:'A car brakes from initial speed u, with constant deceleration a. v and s both change. Differentiate to find how velocity changes with position — without parametric time.',
      steps:[
        {eq:'v² = u² + 2as',why:'Kinematic equation. u = initial speed (constant), a = acceleration (constant). v = current velocity and s = displacement both change.'},
        {eq:'d/ds[ v² ] = d/ds[ u² + 2as ]',why:'Differentiate both sides with respect to s (displacement). We want dv/ds — velocity rate with respect to position, not time.'},
        {eq:'2v · dv/ds = 0 + 2a',why:'Left: chain rule on v². d/ds[v²] = 2v · dv/ds. Right: d/ds[u²] = 0 (constant). d/ds[2as] = 2a.'},
        {eq:'dv/ds = a / v',why:'Divide both sides by 2v. This says: the rate of velocity change with position equals acceleration divided by velocity. Fast-moving objects change velocity slowly per metre — slow objects change it quickly.'},
        {eq:'This also gives us: dv/ds · v = a = dv/dt  (since ds/dt = v)',why:'Multiply both sides by v: v · dv/ds = a. But v = ds/dt so v · dv/ds = dv/dt = a. We just re-derived Newton\'s second law from kinematics using implicit differentiation.'},
      ],
      insight:'dv/ds = a/v links three quantities directly. At high v, a given deceleration a changes your speed slowly per metre — you coast. At low v the same deceleration is brutal per metre. This is why the last few km/h of braking feel longest.',
      insightColor:'purple',
    },
    {
      label:'x² + y² = r²',
      title:'Circle — tangent lines without solving for y',
      scenario:'A point moves along a circle of radius r. We want the tangent slope at any point (x, y) — without splitting into top and bottom halves.',
      steps:[
        {eq:'x² + y² = r²',why:'Equation of a circle. If we tried to isolate y: y = ±√(r²−x²). Two branches, messy derivatives, and we lose points near the x-axis. Implicit is cleaner.'},
        {eq:'d/dx[ x² + y² ] = d/dx[ r² ]',why:'Differentiate both sides with respect to x. Right: r is a constant so d/dx[r²] = 0.'},
        {eq:'2x + 2y · dy/dx = 0',why:'Left: d/dx[x²] = 2x (normal). d/dx[y²] = 2y · dy/dx (chain rule — y gets the · dy/dx). Right = 0.'},
        {eq:'2y · dy/dx = −2x',why:'Move 2x to the right.'},
        {eq:'dy/dx = −x / y',why:'Divide by 2y. Final answer. Notice the answer has both x and y — you need both coordinates to know which of the two y values you are at, so this is correct and expected.'},
      ],
      insight:'dy/dx = −x/y works for BOTH the top and bottom halves simultaneously. At (3, 4): slope = −3/4. At (3, −4): slope = 3/4. The same formula covers both branches — far cleaner than solving for y separately.',
      insightColor:'green',
    },
  ]
  const p=physics[tab]
  return<>
    <Tag label="Physics & real equations" color="purple" C={C}/>
    <Heading C={C}>Implicit differentiation on real physics formulas</Heading>
    <Para C={C}>In physics, equations connect multiple quantities. Implicit differentiation lets you find the rate of change of any one with respect to any other — without rearranging first. Pick an equation below.</Para>
    <Tabs tabs={physics.map(p=>p.label)} active={tab} onChange={setTab} C={C}/>
    <div style={{background:C.purpleBg,border:`0.5px solid ${C.purpleBd}`,borderRadius:8,padding:'8px 12px',marginBottom:10}}>
      <div style={{fontSize:11,color:C.purple,fontWeight:500,marginBottom:2}}>{p.title}</div>
      <div style={{fontSize:12,color:C.muted}}>{p.scenario}</div>
    </div>
    <Steps C={C} steps={p.steps}/>
    <Callout color={p.insightColor} title="Physical meaning of the result" C={C}>{p.insight}</Callout>
    {tab===0&&<Para C={C}>Try adjusting n and T below to see how the PV hyperbola changes — the steepness at any point is dP/dV = −nRT/V²:</Para>}
  </>
}

function PageHowToRead({C}){
  const [eq,setEq]=useState(0)
  const examples=[
    {
      label:'3xy² − x = 8',
      parts:[
        {term:'3xy²',breakdown:'Product of x and y². Need BOTH product rule AND chain rule.',d:'d/dx[3xy²] = 3·(1·y² + x·2y·dy/dx) = 3y² + 6xy·dy/dx'},
        {term:'−x',breakdown:'Plain x term. Normal derivative.',d:'d/dx[−x] = −1'},
        {term:'8',breakdown:'Constant. Derivative is zero.',d:'d/dx[8] = 0'},
        {term:'Result',breakdown:'Collect and solve.',d:'3y² + 6xy·dy/dx − 1 = 0  →  dy/dx = (1 − 3y²) / (6xy)'},
      ],
    },
    {
      label:'sin(y) + x² = 5',
      parts:[
        {term:'sin(y)',breakdown:'Trig function OF y. Chain rule fires.',d:'d/dx[sin(y)] = cos(y) · dy/dx'},
        {term:'x²',breakdown:'Plain x term.',d:'d/dx[x²] = 2x'},
        {term:'5',breakdown:'Constant.',d:'d/dx[5] = 0'},
        {term:'Result',breakdown:'Solve for dy/dx.',d:'cos(y)·dy/dx + 2x = 0  →  dy/dx = −2x / cos(y)'},
      ],
    },
    {
      label:'eˣʸ = x + y',
      parts:[
        {term:'eˣʸ',breakdown:'Exponential of xy. Chain rule: d/dx[eᵘ] = eᵘ · du/dx. Then d/dx[xy] needs product rule.',d:'d/dx[eˣʸ] = eˣʸ · d/dx[xy] = eˣʸ · (y + x·dy/dx)'},
        {term:'x + y',breakdown:'Both x and y terms.',d:'d/dx[x+y] = 1 + dy/dx'},
        {term:'Expand',breakdown:'Distribute eˣʸ.',d:'y·eˣʸ + x·eˣʸ·dy/dx = 1 + dy/dx'},
        {term:'Result',breakdown:'Collect dy/dx terms, factor, divide.',d:'dy/dx·(x·eˣʸ − 1) = 1 − y·eˣʸ\ndy/dx = (1 − y·eˣʸ) / (x·eˣʸ − 1)'},
      ],
    },
  ]
  const ex=examples[eq]
  return<>
    <Tag label="How to read any equation" color="teal" C={C}/>
    <Heading C={C}>Scanning a formula before you differentiate — a decision process</Heading>
    <Para C={C}>Before writing a single derivative, scan every term and classify it. Three categories — x only, y only, or mixed. Mixed terms need both product rule and chain rule. Choose an equation to see the scan in action:</Para>
    <Tabs tabs={examples.map(e=>e.label)} active={eq} onChange={setEq} C={C}/>
    <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
      {ex.parts.map((part,i)=>(
        <div key={i} style={{background:C.surface2,borderRadius:8,padding:'10px 12px',border:`0.5px solid ${i===ex.parts.length-1?C.greenBd:C.border}`}}>
          <div style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:4}}>
            <span style={{fontFamily:'monospace',fontSize:14,color:i===ex.parts.length-1?C.green:C.amber,fontWeight:500,minWidth:90}}>{part.term}</span>
            <span style={{fontSize:12,color:C.muted}}>{part.breakdown}</span>
          </div>
          <div style={{fontFamily:'monospace',fontSize:12,color:i===ex.parts.length-1?C.green:C.text,background:i===ex.parts.length-1?C.greenBg:C.bg,padding:'4px 8px',borderRadius:5,whiteSpace:'pre-wrap'}}>{part.d}</div>
        </div>
      ))}
    </div>
    <Callout color="amber" title="The scanning checklist" C={C}>
      For every term: (1) Is it x only? Normal rule. (2) Is it y only? Normal rule PLUS · dy/dx. (3) Is it mixed — like xy, x²y, or f(xy)? Product rule on the x and y parts, PLUS · dy/dx on any y sub-expression. After differentiating, collect all dy/dx terms on one side, factor out dy/dx, then divide.
    </Callout>
  </>
}

function PageGotchas({C}){
  const [tab,setTab]=useState(0)
  const gotchas=[
    {
      label:'Missing · dy/dx',
      wrong:'d/dx[y³] = 3y²',
      right:'d/dx[y³] = 3y² · dy/dx',
      explain:'y is not a constant — it changes with x. Every y term you differentiate must be multiplied by · dy/dx. Without it there is nothing to solve for.',
      fix:'After writing 3y², immediately ask: "is there a y in what I just differentiated?" If yes, add · dy/dx.',
    },
    {
      label:'Product rule on xy terms',
      wrong:'d/dx[x²y] = 2xy',
      right:'d/dx[x²y] = 2x·y + x²·dy/dx',
      explain:'x²y is a product of two things that both depend on x. The product rule gives (d/dx[x²])·y + x²·(d/dx[y]) = 2xy + x²·dy/dx. Missing the second term loses a dy/dx and your algebra will fail.',
      fix:'If you see xy, x²y, or any xⁿyᵐ term: use product rule first, THEN add · dy/dx to the y part.',
    },
    {
      label:'Not factoring dy/dx',
      wrong:'2y·dy/dx + x²·dy/dx = 5\n→ dy/dx = 5 − 2y·dy/dx ...(stuck)',
      right:'2y·dy/dx + x²·dy/dx = 5\n→ dy/dx(2y + x²) = 5\n→ dy/dx = 5/(2y + x²)',
      explain:'When dy/dx appears in multiple terms, you must factor it out before you can solve for it. Treat dy/dx as an unknown variable — collect terms with it on one side, factor, then divide.',
      fix:'After differentiating, circle every term containing dy/dx. Move them all to one side. Factor out dy/dx. Divide everything else to the other side.',
    },
    {
      label:'Differentiating a constant',
      wrong:'d/dx[r²] = 2r·dr/dx',
      right:'d/dx[r²] = 0  (if r is a constant)',
      explain:'In an equation like x² + y² = r², r is a fixed number — the radius. d/dx[constant] = 0. Only differentiate variables. If r were changing with x, the problem would tell you.',
      fix:'Before differentiating, label every symbol: is this a variable (x, y, something that changes) or a constant (a given number or fixed parameter)? Constants vanish when differentiated.',
    },
    {
      label:'Chain rule inside y terms',
      wrong:'d/dx[sin(y²)] = cos(y²) · dy/dx',
      right:'d/dx[sin(y²)] = cos(y²) · 2y · dy/dx',
      explain:'There are two chain rules firing here. Outer: d/dx[sin(u)] = cos(u) · du/dx where u = y². Inner: d/dx[y²] = 2y · dy/dx. Multiply all three together: cos(y²) · 2y · dy/dx.',
      fix:'Count the nesting. sin(y²) has y² inside sin. That is two levels. Each level contributes a factor to the chain rule. Write them all out before multiplying.',
    },
  ]
  const g=gotchas[tab]
  return<>
    <Tag label="Gotchas" color="red" C={C}/>
    <Heading C={C}>The 5 mistakes that will cost you marks — and exactly how to fix them</Heading>
    <Para C={C}>Every one of these appears on exams. They are all silent — no error message, just a wrong answer.</Para>
    <Tabs tabs={gotchas.map((g,i)=>`${i+1}. ${g.label}`)} active={tab} onChange={setTab} C={C}/>
    <div style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:8,padding:'10px 14px',marginBottom:8}}>
      <div style={{fontSize:11,color:C.red,marginBottom:4,fontWeight:500}}>Wrong</div>
      <div style={{fontFamily:'monospace',fontSize:13,color:C.red,whiteSpace:'pre-wrap'}}>{g.wrong}</div>
    </div>
    <div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:8,padding:'10px 14px',marginBottom:8}}>
      <div style={{fontSize:11,color:C.green,marginBottom:4,fontWeight:500}}>Correct</div>
      <div style={{fontFamily:'monospace',fontSize:13,color:C.green,whiteSpace:'pre-wrap'}}>{g.right}</div>
    </div>
    <Callout color="red" title="Why this happens" C={C}>{g.explain}</Callout>
    <Callout color="green" title="How to catch it" C={C}>{g.fix}</Callout>
  </>
}

function PageWhyItMatters({C}){
  return<>
    <Tag label="The importance" color="green" C={C}/>
    <Heading C={C}>Why implicit differentiation is one of the most important tools in calculus</Heading>
    <Para C={C}>It is tempting to treat implicit differentiation as a niche trick for weird curves. It is not. It is the foundation of three major areas:</Para>
    <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
      {[
        {num:'1',color:C.blue,bg:C.blueBg,title:'Inverse function derivatives',body:'Every inverse trig derivative (d/dx[arcsin x] = 1/√(1−x²), d/dx[arctan x] = 1/(1+x²)) is derived by implicit differentiation. You write sin(y) = x, differentiate implicitly, then use a trig identity. Without implicit differentiation, these formulas have no derivation.'},
        {num:'2',color:C.amber,bg:C.amberBg,title:'Related rates',body:'Two quantities connected by an equation both change with time t. You differentiate the connecting equation implicitly with respect to t. A ladder sliding down a wall, a balloon expanding, a shadow lengthening — all solved by implicit differentiation with t as the variable.'},
        {num:'3',color:C.purple,bg:C.purpleBg,title:'Physics equations with multiple variables',body:'PV = nRT, F = Gm₁m₂/r², v² = u² + 2as, E = mc². These equations connect quantities that all change. Implicit differentiation lets you find any rate with respect to any other directly from the law — without rearranging, without losing physics meaning.'},
        {num:'4',color:C.teal,bg:C.tealBg,title:'Curves that are not functions',body:'Ellipses, foliums, lemniscates — beautiful curves that fail the vertical line test. They have tangent lines everywhere but no explicit formula for y. Implicit differentiation gives you dy/dx at every point on the curve, regardless.'},
      ].map((item,i)=>(
        <div key={i} style={{background:item.bg,borderRadius:10,padding:'12px 14px',border:`0.5px solid ${item.color}22`}}>
          <div style={{display:'flex',gap:8,alignItems:'baseline',marginBottom:4}}>
            <span style={{fontFamily:'monospace',fontSize:13,color:item.color,fontWeight:500}}>{item.num}.</span>
            <span style={{fontSize:13,fontWeight:500,color:item.color}}>{item.title}</span>
          </div>
          <p style={{fontSize:12,color:item.color,lineHeight:1.65,margin:0,opacity:0.9}}>{item.body}</p>
        </div>
      ))}
    </div>
    <AhaBox title="The unifying idea" C={C}>
      Explicit differentiation is the special case where you happen to know y as a formula in x. Implicit differentiation is the general case — it works whether or not you can isolate y. Every time you have seen dy/dx in your course, implicit differentiation is the mechanism running underneath. It is not a separate technique; it is differentiation itself, fully expressed.
    </AhaBox>
    <Callout color="amber" title="When to reach for it on your assignments" C={C}>
      Reach for implicit differentiation whenever: (1) you see y in an equation that is not y = ..., (2) you see multiple changing quantities in a physics formula, (3) you need to differentiate an inverse function, or (4) the problem says "find the tangent to the curve." In all four cases, implicit differentiation is the right tool.
    </Callout>
  </>
}

const PAGES=[PageWhyItExists,PageExpExample,PagePhysics,PageHowToRead,PageGotchas,PageWhyItMatters]
const PAGE_LABELS=['Why it exists','eʸ = x deep dive','Physics formulas','Reading any equation','Gotchas','Why it matters']

export default function ImplicitDiffReal({params={}}){
  const C=useColors()
  const [page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return(
    <div style={{width:'100%',fontFamily:'sans-serif'}}>
      <div style={{display:'flex',gap:4,marginBottom:6}}>
        {PAGE_LABELS.map((_,i)=><div key={i} onClick={()=>setPage(i)} style={{flex:1,height:4,borderRadius:2,cursor:'pointer',transition:'background .25s',background:i<page?C.blue:i===page?C.amber:C.border}}/>)}
      </div>
      <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
        {PAGE_LABELS.map((label,i)=><button key={i} onClick={()=>setPage(i)} style={{fontSize:11,padding:'2px 8px',borderRadius:6,cursor:'pointer',border:`0.5px solid ${i===page?C.amberBd:C.border}`,background:i===page?C.amberBg:'transparent',color:i===page?C.amber:C.hint}}>{label}</button>)}
      </div>
      <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:12}}>
        <PageComponent C={C}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button disabled={page===0} onClick={()=>setPage(p=>p-1)} style={{fontSize:13,padding:'7px 18px',borderRadius:8,cursor:page===0?'default':'pointer',border:`0.5px solid ${C.border}`,background:'transparent',color:C.text,opacity:page===0?0.3:1}}>← Back</button>
        <span style={{fontSize:12,color:C.hint}}>{page+1} / {PAGES.length}</span>
        <button disabled={page===PAGES.length-1} onClick={()=>setPage(p=>p+1)} style={{fontSize:13,padding:'7px 18px',borderRadius:8,cursor:page===PAGES.length-1?'default':'pointer',border:'none',background:C.text,color:C.bg,opacity:page===PAGES.length-1?0.3:1}}>Next →</button>
      </div>
    </div>
  )
}
