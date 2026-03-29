import { useState, useEffect } from 'react'

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

function Tag({label,color,C}){const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>}
function Heading({children,C}){return<h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>}
function Para({children,C}){return<p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>}
function Strong({children}){return<span style={{fontWeight:500}}>{children}</span>}
function Callout({children,color,title,C}){const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>}
function AhaBox({title,children,C}){return<div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}
function WarnBox({title,children,C}){return<div style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.red,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.red,lineHeight:1.65}}>{children}</div></div>}
function CodeBox({children,C}){return<div style={{background:C.surface2,borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:C.text,lineHeight:1.9,marginBottom:10,whiteSpace:'pre-wrap'}}>{children}</div>}

// specificity score calculation
function calcSpec(selector) {
  const ids = (selector.match(/#[a-zA-Z]/g)||[]).length
  const classes = (selector.match(/\.[a-zA-Z]/g)||[]).length + (selector.match(/\[[^\]]+\]/g)||[]).length + (selector.match(/:[a-zA-Z]/g)||[]).length
  const tags = (selector.match(/(?<![.#:[])(?<!\w)[a-zA-Z]+/g)||[]).length
  return {ids, classes, tags, score: ids*100 + classes*10 + tags}
}

function SpecBar({rule, isWinner, C}) {
  const s = calcSpec(rule.selector)
  const maxScore = 210
  return(
    <div style={{background:isWinner?C.greenBg:C.surface2,border:`0.5px solid ${isWinner?C.greenBd:C.border}`,borderRadius:8,padding:'10px 12px',marginBottom:6}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {isWinner&&<span style={{fontSize:10,background:C.green,color:'#fff',padding:'1px 6px',borderRadius:4,fontWeight:500}}>WINS</span>}
          <span style={{fontFamily:'monospace',fontSize:12,color:isWinner?C.green:C.text}}>{rule.selector}</span>
        </div>
        <span style={{fontFamily:'monospace',fontSize:11,color:C.hint}}>({s.ids},{s.classes},{s.tags}) = {s.score}</span>
      </div>
      <div style={{display:'flex',gap:4,marginBottom:6}}>
        {[{label:'IDs',val:s.ids,color:C.purple},{label:'Classes',val:s.classes,color:C.blue},{label:'Tags',val:s.tags,color:C.teal}].map((x,i)=>(
          <div key={i} style={{flex:1,background:C.bg,borderRadius:5,padding:'4px 6px',textAlign:'center'}}>
            <div style={{fontSize:16,fontWeight:500,color:x.color}}>{x.val}</div>
            <div style={{fontSize:9,color:C.hint}}>{x.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.bg,borderRadius:4,height:8,overflow:'hidden'}}>
        <div style={{width:`${(s.score/maxScore)*100}%`,height:'100%',background:isWinner?C.green:C.blue,borderRadius:4,transition:'width .4s'}}/>
      </div>
      <div style={{fontFamily:'monospace',fontSize:11,color:isWinner?C.green:C.muted,marginTop:4}}>color: {rule.color}</div>
    </div>
  )
}

function PageCascade({C}){
  const RULES = [
    {selector:'p', color:'black', desc:'Tag selector — matches all <p> elements'},
    {selector:'.intro', color:'blue', desc:'Class selector — matches elements with class="intro"'},
    {selector:'p.intro', color:'green', desc:'Tag + class — more specific than either alone'},
    {selector:'#main p', color:'purple', desc:'ID + tag — descendant combinator'},
    {selector:'#main .intro', color:'orange', desc:'ID + class — very specific'},
  ]
  const [activeRules, setActiveRules] = useState([0,1,2])
  const toggle = i => setActiveRules(a=>a.includes(i)?a.filter(x=>x!==i):[...a,i].sort())
  const active = activeRules.map(i=>RULES[i])
  const winner = active.reduce((best,r)=>{
    const sb = calcSpec(best?.selector||'')
    const sr = calcSpec(r.selector)
    if(!best) return r
    if(sr.score > sb.score) return r
    return best
  }, null)

  return<>
    <Tag label="Lesson 3 — Cascade" color="blue" C={C}/>
    <Heading C={C}>CSS is a rule resolver — the highest specificity wins</Heading>
    <Para C={C}>Multiple CSS rules can target the same element. CSS resolves the conflict using <Strong>specificity</Strong> — a score that determines which rule wins. Toggle rules on/off and watch the score battle.</Para>
    <Para C={C}>The element being styled: <code style={{fontFamily:'monospace',background:C.surface2,padding:'1px 5px',borderRadius:3,fontSize:12}}>{'<p id="main" class="intro">'}</code> inside a div with id="main".</Para>
    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
      {RULES.map((r,i)=>(
        <button key={i} onClick={()=>toggle(i)} style={{fontSize:11,padding:'4px 10px',borderRadius:7,cursor:'pointer',fontFamily:'monospace',border:`0.5px solid ${activeRules.includes(i)?C.blueBd:C.border}`,background:activeRules.includes(i)?C.blueBg:'transparent',color:activeRules.includes(i)?C.blue:C.hint}}>
          {r.selector}
        </button>
      ))}
    </div>
    <div style={{marginBottom:10}}>
      {active.length===0&&<div style={{color:C.hint,fontSize:12,fontFamily:'monospace',padding:'10px 0'}}>No rules active — element gets browser defaults</div>}
      {active.map((r,i)=><SpecBar key={i} rule={r} isWinner={winner&&r===winner} C={C}/>)}
    </div>
    {winner&&<div style={{background:C.surface2,borderRadius:8,padding:'10px 14px',marginBottom:10}}>
      <div style={{fontSize:11,color:C.hint,marginBottom:4}}>Computed result for this element:</div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:40,height:40,borderRadius:6,background:winner.color,border:`0.5px solid ${C.border}`}}/>
        <div>
          <div style={{fontFamily:'monospace',fontSize:13,color:C.text}}>color: {winner.color}</div>
          <div style={{fontSize:11,color:C.muted}}>from selector: {winner.selector} (score: {calcSpec(winner.selector).score})</div>
        </div>
      </div>
    </div>}
    <AhaBox title="Specificity is a three-column score, not a single number" C={C}>
      The score is (IDs, Classes, Tags). Column comparison beats total. 1 ID (1,0,0) beats 99 classes (0,99,0) — always. This is why developers avoid IDs in CSS — they create specificity that's very hard to override without adding !important or more IDs. The safest CSS uses only classes.
    </AhaBox>
    <Callout color="amber" title="The cascade order when specificity is equal" C={C}>
      When two rules have identical specificity, the one that appears LATER in the CSS file wins. This is the "cascade" in Cascading Style Sheets — rules flow down, and later rules override earlier ones at equal specificity.
    </Callout>
  </>
}

function PageInheritance({C}){
  const [showInherited, setShowInherited] = useState(true)
  return<>
    <Tag label="Lesson 3 — Inheritance" color="amber" C={C}/>
    <Heading C={C}>Some properties cascade down the tree automatically</Heading>
    <Para C={C}>Not all CSS properties work the same way. Some properties set on a parent automatically apply to all descendants — this is <Strong>inheritance</Strong>. Others only apply to the element they're set on.</Para>
    <div style={{display:'flex',gap:8,marginBottom:10}}>
      <button onClick={()=>setShowInherited(!showInherited)} style={{fontSize:12,padding:'5px 12px',borderRadius:7,cursor:'pointer',border:`0.5px solid ${C.border}`,background:showInherited?C.blueBg:'transparent',color:showInherited?C.blue:C.muted}}>
        {showInherited?'Inherited ON':'Inherited OFF'}
      </button>
    </div>
    <div style={{background:C.surface2,borderRadius:10,padding:'14px',marginBottom:10}}>
      <div style={{
        fontFamily:showInherited?'Georgia, serif':'sans-serif',
        color:showInherited?C.purple:C.text,
        fontSize:showInherited?15:13,
      }}>
        <div style={{marginBottom:8}}>
          <code style={{fontSize:11,color:C.hint}}>{'<div style="color: purple; font-family: Georgia">'}</code>
          <div style={{paddingLeft:12,marginTop:4}}>
            <p style={{margin:0,marginBottom:4}}>This paragraph inherits color and font-family</p>
            <strong>This strong also inherits — even though no rule targets it</strong>
            <div style={{marginTop:4}}>
              <em>Deeply nested em — still inherits from the ancestor div</em>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
      <div style={{background:C.greenBg,border:`0.5px solid ${C.greenBd}`,borderRadius:8,padding:'10px 12px'}}>
        <div style={{fontSize:11,fontWeight:500,color:C.green,marginBottom:6}}>Inherited by default</div>
        {['color','font-family','font-size','font-weight','line-height','text-align','cursor','visibility'].map(p=><div key={p} style={{fontFamily:'monospace',fontSize:11,color:C.green,marginBottom:1}}>{p}</div>)}
      </div>
      <div style={{background:C.redBg,border:`0.5px solid ${C.redBd}`,borderRadius:8,padding:'10px 12px'}}>
        <div style={{fontSize:11,fontWeight:500,color:C.red,marginBottom:6}}>NOT inherited by default</div>
        {['margin','padding','border','background','width','height','display','position'].map(p=><div key={p} style={{fontFamily:'monospace',fontSize:11,color:C.red,marginBottom:1}}>{p}</div>)}
      </div>
    </div>
    <Callout color="blue" title="The inherit keyword overrides the default" C={C}>
      You can force inheritance with inherit: border: inherit. Or block it with initial (reset to browser default) or unset. This matters most when you need a child element to behave differently from what it would inherit automatically.
    </Callout>
    <WarnBox title="Why background does not inherit" C={C}>
      If background were inherited, every element would have its parent's background stacked on top — elements would never be transparent. The default background: transparent lets parent backgrounds show through. This is intentional design, not an oversight.
    </WarnBox>
  </>
}

function PageSpecGame({C}){
  const challenges = [
    {
      element:'<p class="note" id="warn">',
      context:'Inside a <div class="card">',
      rules:[
        {selector:'p', color:'gray', on:true},
        {selector:'.note', color:'blue', on:true},
        {selector:'#warn', color:'red', on:true},
        {selector:'div p', color:'green', on:false},
        {selector:'.card .note', color:'orange', on:false},
      ],
      question:'Which rules are active? What color wins?'
    }
  ]
  const ch = challenges[0]
  const [active, setActive] = useState(ch.rules.map(r=>r.on))
  const activeRules = ch.rules.filter((_,i)=>active[i])
  const winner = activeRules.reduce((best,r)=>{
    if(!best) return r
    return calcSpec(r.selector).score > calcSpec(best.selector).score ? r : best
  }, null)

  return<>
    <Tag label="Lesson 3 — Practice" color="green" C={C}/>
    <Heading C={C}>Build your mental model — predict the winner</Heading>
    <Para C={C}>Toggle which rules are active, then predict which color the element will be before looking at the score.</Para>
    <div style={{background:C.surface2,borderRadius:8,padding:'10px 12px',marginBottom:10,fontFamily:'monospace',fontSize:12,color:C.text}}>
      {`<div class="card">\n  <p class="note" id="warn">...</p>\n</div>`}
    </div>
    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
      {ch.rules.map((r,i)=>(
        <button key={i} onClick={()=>setActive(a=>{const n=[...a];n[i]=!n[i];return n})} style={{fontSize:11,padding:'4px 10px',borderRadius:7,cursor:'pointer',fontFamily:'monospace',border:`0.5px solid ${active[i]?C.blueBd:C.border}`,background:active[i]?C.blueBg:'transparent',color:active[i]?C.blue:C.hint}}>
          {r.selector}
        </button>
      ))}
    </div>
    {activeRules.map((r,i)=><SpecBar key={i} rule={r} isWinner={winner&&r===winner} C={C}/>)}
    {winner&&<div style={{display:'flex',alignItems:'center',gap:10,background:C.greenBg,border:`0.5px solid ${C.greenBd}`,borderRadius:8,padding:'10px 14px',marginTop:6}}>
      <div style={{width:32,height:32,borderRadius:5,background:winner.color}}/>
      <div style={{fontSize:13,color:C.green}}>Result: <strong>{winner.color}</strong> wins via <code style={{fontFamily:'monospace'}}>{winner.selector}</code></div>
    </div>}
    <Callout color="purple" title="The devtools specificity view" C={C}>
      In Chrome DevTools, open Elements panel, select an element, look at the Styles panel. Overridden rules are shown with a strikethrough. Hover a selector to see its specificity score. This is the fastest way to debug "why isn't my CSS applying."
    </Callout>
  </>
}

const PAGES=[PageCascade,PageInheritance,PageSpecGame]
const PAGE_LABELS=['Specificity battle','Inheritance','Practice']

export default function WebLesson03_CSSCascade({params={}}){
  const C=useColors()
  const [page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return(
    <div style={{width:'100%',fontFamily:'sans-serif'}}>
      <div style={{display:'flex',gap:4,marginBottom:6}}>
        {PAGE_LABELS.map((_,i)=><div key={i} onClick={()=>setPage(i)} style={{flex:1,height:4,borderRadius:2,cursor:'pointer',transition:'background .25s',background:i<page?C.blue:i===page?C.amber:C.border}}/>)}
      </div>
      <div style={{display:'flex',gap:5,marginBottom:10}}>
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
