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
    bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',
    border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',
    blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',
    amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',
    green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',
    red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',
    purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',
    teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488',
  }
}
const ui={
  Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},
  H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,
  P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,
  Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},
  Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>,
  Warn:({title,children,C})=><div style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.red,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.red,lineHeight:1.65}}>{children}</div></div>,
}

function MemoryBox({name,value,type,changed,C}){
  const typeColors={number:[C.blueBg,C.blue],string:[C.greenBg,C.green],boolean:[C.purpleBg,C.purple],null:[C.redBg,C.red],undefined:[C.redBg,C.red],object:[C.amberBg,C.amber]}
  const [bg,tc]=typeColors[type]||typeColors.null
  return<div style={{background:changed?C.amberBg:C.surface2,border:`0.5px solid ${changed?C.amberBd:C.border}`,borderRadius:8,padding:'8px 10px',transition:'all .2s'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
      <span style={{fontFamily:'monospace',fontSize:12,color:C.text,fontWeight:500}}>{name}</span>
      <span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:bg,color:tc}}>{type}</span>
    </div>
    <div style={{fontFamily:'monospace',fontSize:13,color:tc,background:bg,padding:'4px 8px',borderRadius:5,minHeight:24,display:'flex',alignItems:'center'}}>
      {type==='string'?`"${value}"`:String(value)}
    </div>
    {changed&&<div style={{fontSize:10,color:C.amber,marginTop:3}}>← just changed</div>}
  </div>
}

function PageVariables({C}){
  const [count,setCount]=useState(0)
  const [name,setName]=useState('Alice')
  const [active,setActive]=useState(true)
  const [lastChanged,setLastChanged]=useState(null)
  const change=(which,fn)=>{ fn(); setLastChanged(which); setTimeout(()=>setLastChanged(null),800) }

  return<>
    <ui.Tag label="Lesson 5 — Variables" color="blue" C={C}/>
    <ui.H C={C}>Variables are named boxes in memory — interact with them here</ui.H>
    <ui.P C={C}>A variable is a labelled location in memory that holds a value. When the value changes, anything that reads that variable sees the new value. Interact with the variables below and watch the memory boxes update.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
      <MemoryBox name="count" value={count} type="number" changed={lastChanged==='count'} C={C}/>
      <MemoryBox name="name" value={name} type="string" changed={lastChanged==='name'} C={C}/>
      <MemoryBox name="active" value={active} type="boolean" changed={lastChanged==='active'} C={C}/>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <span style={{fontSize:12,color:C.muted,minWidth:80}}>count</span>
        <button onClick={()=>change('count',()=>setCount(c=>c+1))} style={{fontSize:12,padding:'4px 12px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer'}}>count + 1</button>
        <button onClick={()=>change('count',()=>setCount(c=>c*2))} style={{fontSize:12,padding:'4px 12px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer'}}>count × 2</button>
        <button onClick={()=>change('count',()=>setCount(0))} style={{fontSize:12,padding:'4px 12px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer'}}>reset</button>
      </div>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <span style={{fontSize:12,color:C.muted,minWidth:80}}>name</span>
        {['Alice','Bob','Carol','Dave'].map(n=><button key={n} onClick={()=>change('name',()=>setName(n))} style={{fontSize:12,padding:'4px 10px',borderRadius:6,border:`0.5px solid ${name===n?C.greenBd:C.border}`,background:name===n?C.greenBg:C.surface2,color:name===n?C.green:C.text,cursor:'pointer'}}>{n}</button>)}
      </div>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <span style={{fontSize:12,color:C.muted,minWidth:80}}>active</span>
        <button onClick={()=>change('active',()=>setActive(a=>!a))} style={{fontSize:12,padding:'4px 14px',borderRadius:6,border:`0.5px solid ${active?C.greenBd:C.redBd}`,background:active?C.greenBg:C.redBg,color:active?C.green:C.red,cursor:'pointer'}}>{active?'true → false':'false → true'}</button>
      </div>
    </div>
    <div style={{background:C.surface2,borderRadius:8,padding:'10px 14px',marginBottom:10}}>
      <div style={{fontSize:10,color:C.hint,marginBottom:6}}>UI that reads from these variables — updates automatically:</div>
      <div style={{padding:'10px 14px',background:C.surface,borderRadius:6,border:`0.5px solid ${C.border}`}}>
        <div style={{fontSize:14,fontWeight:500,color:C.text,marginBottom:4}}>Hello, {name}!</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:4}}>You have clicked {count} time{count!==1?'s':''}.</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 10px',borderRadius:12,background:active?C.greenBg:C.redBg,border:`0.5px solid ${active?C.greenBd:C.redBd}`}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:active?C.green:C.red}}/>
          <span style={{fontSize:11,color:active?C.green:C.red}}>{active?'Active':'Inactive'}</span>
        </div>
      </div>
    </div>
    <ui.Aha title="State is what makes a UI interactive" C={C}>
      A static page has no variables — it always looks the same. An interactive page has state: values that change in response to user actions, and a UI that reflects those values. Every interactive thing on the web — a shopping cart count, a form with validation, a dark mode toggle — is a variable change connected to a visual update.
    </ui.Aha>
  </>
}

function PageTypes({C}){
  const [input,setInput]=useState('42')
  const inferType = v => {
    if(v==='true'||v==='false') return 'boolean'
    if(v==='null') return 'null'
    if(v===''||v==='undefined') return 'undefined'
    if(!isNaN(v)&&v.trim()!=='') return 'number'
    return 'string'
  }
  const t=inferType(input)
  const typeColors={number:C.blue,string:C.green,boolean:C.purple,null:C.red,undefined:C.red}
  const examples=[
    {val:'42',type:'number',note:'No quotes → number'},
    {val:'"hello"',type:'string',note:'Quotes → string'},
    {val:'true',type:'boolean',note:'Only true/false → boolean'},
    {val:'null',type:'null',note:'Intentionally empty'},
    {val:'[1,2,3]',type:'object (array)',note:'Ordered list'},
    {val:'{"a":1}',type:'object',note:'Key-value map'},
  ]
  return<>
    <ui.Tag label="Lesson 5 — Types" color="amber" C={C}/>
    <ui.H C={C}>Every value has a type — and type determines what you can do with it</ui.H>
    <ui.P C={C}>JavaScript's type system is dynamic — variables can hold any type. But the type of a value determines which operations are valid. Adding two numbers gives a number. Adding two strings concatenates them. Adding a number and a string gives... a string (JavaScript coerces the number).</ui.P>
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,color:C.hint,marginBottom:4}}>Type what a JS value might look like:</div>
      <input value={input} onChange={e=>setInput(e.target.value)} style={{width:'100%',fontFamily:'monospace',fontSize:13,padding:'8px 12px',borderRadius:8,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,marginBottom:6}}/>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <div style={{flex:1,background:C.surface2,borderRadius:7,padding:'8px 12px',border:`0.5px solid ${typeColors[t]||C.border}`}}>
          <div style={{fontSize:10,color:C.hint,marginBottom:2}}>typeof</div>
          <div style={{fontFamily:'monospace',fontSize:14,color:typeColors[t]||C.muted,fontWeight:500}}>{t}</div>
        </div>
      </div>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:10}}>
      {examples.map((e,i)=><div key={i} onClick={()=>setInput(e.val.replace(/"/g,''))} style={{display:'grid',gridTemplateColumns:'100px 130px 1fr',gap:8,background:C.surface2,borderRadius:7,padding:'6px 10px',cursor:'pointer',alignItems:'center'}}>
        <code style={{fontFamily:'monospace',fontSize:12,color:C.amber}}>{e.val}</code>
        <span style={{fontSize:11,color:typeColors[e.type.split(' ')[0]]||C.muted,fontFamily:'monospace'}}>{e.type}</span>
        <span style={{fontSize:11,color:C.hint}}>{e.note}</span>
      </div>)}
    </div>
    <ui.Warn title="The coercion trap: + means different things" C={C}>
      {'"3" + 1 = "31" not 4. JavaScript converts the number to a string and concatenates. "3" - 1 = 2 (subtraction only works on numbers, so JS converts "3" to a number). This inconsistency causes real bugs. Always use explicit conversion: Number("3") + 1 = 4.'}
    </ui.Warn>
    <ui.Callout color="blue" title="null vs undefined — both mean 'no value' but differently" C={C}>
      undefined means a variable exists but was never assigned. null means a variable was deliberately set to nothing. You use null when you want to say "this intentionally has no value right now." undefined usually means something wasn't set up correctly.
    </ui.Callout>
  </>
}

const PAGES=[PageVariables,PageTypes]
const PAGE_LABELS=['Memory boxes','Types']
export default function WebLesson05_Variables({params={}}){
  const C=useColors();const[page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return<div style={{width:'100%',fontFamily:'sans-serif'}}>
    <div style={{display:'flex',gap:4,marginBottom:6}}>{PAGE_LABELS.map((_,i)=><div key={i} onClick={()=>setPage(i)} style={{flex:1,height:4,borderRadius:2,cursor:'pointer',transition:'background .25s',background:i<page?C.blue:i===page?C.amber:C.border}}/>)}</div>
    <div style={{display:'flex',gap:5,marginBottom:10}}>{PAGE_LABELS.map((label,i)=><button key={i} onClick={()=>setPage(i)} style={{fontSize:11,padding:'2px 8px',borderRadius:6,cursor:'pointer',border:`0.5px solid ${i===page?C.amberBd:C.border}`,background:i===page?C.amberBg:'transparent',color:i===page?C.amber:C.hint}}>{label}</button>)}</div>
    <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:12}}><PageComponent C={C}/></div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <button disabled={page===0} onClick={()=>setPage(p=>p-1)} style={{fontSize:13,padding:'7px 18px',borderRadius:8,cursor:page===0?'default':'pointer',border:`0.5px solid ${C.border}`,background:'transparent',color:C.text,opacity:page===0?0.3:1}}>← Back</button>
      <span style={{fontSize:12,color:C.hint}}>{page+1} / {PAGES.length}</span>
      <button disabled={page===PAGES.length-1} onClick={()=>setPage(p=>p+1)} style={{fontSize:13,padding:'7px 18px',borderRadius:8,cursor:page===PAGES.length-1?'default':'pointer',border:'none',background:C.text,color:C.bg,opacity:page===PAGES.length-1?0.3:1}}>Next →</button>
    </div>
  </div>
}
