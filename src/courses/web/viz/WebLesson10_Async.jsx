import { useState, useEffect, useRef } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>,Warn:({title,children,C})=><div style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.red,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.red,lineHeight:1.65}}>{children}</div></div>}

function PromiseViz({C}){
  const [state,setState]=useState('idle')
  const [latency,setLatency]=useState(1500)
  const [shouldFail,setShouldFail]=useState(false)
  const timerRef=useRef(null)

  const run=()=>{
    setState('pending')
    clearTimeout(timerRef.current)
    timerRef.current=setTimeout(()=>setState(shouldFail?'rejected':'fulfilled'),latency)
  }
  const reset=()=>{clearTimeout(timerRef.current);setState('idle')}

  const stateColors={idle:[C.hint,C.surface2],pending:[C.amber,C.amberBg],fulfilled:[C.green,C.greenBg],rejected:[C.red,C.redBg]}
  const [tc,bg]=stateColors[state]

  return<div>
    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
      <div style={{fontSize:11,color:C.hint,minWidth:60}}>Latency</div>
      <input type="range" min={500} max={4000} step={500} value={latency} onChange={e=>setLatency(+e.target.value)} style={{flex:1}}/>
      <span style={{fontFamily:'monospace',fontSize:12,color:C.amber,minWidth:48}}>{latency}ms</span>
      <button onClick={()=>setShouldFail(!shouldFail)} style={{fontSize:11,padding:'3px 10px',borderRadius:6,cursor:'pointer',border:`0.5px solid ${shouldFail?C.redBd:C.border}`,background:shouldFail?C.redBg:'transparent',color:shouldFail?C.red:C.muted}}>{shouldFail?'Fail':'Succeed'}</button>
    </div>
    <div style={{background:bg,border:`1px solid ${tc}`,borderRadius:10,padding:'14px',marginBottom:8,transition:'all .3s',minHeight:80,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontSize:22,fontWeight:500,color:tc,marginBottom:4,fontFamily:'monospace'}}>{state}</div>
      <div style={{fontSize:12,color:tc,opacity:.8}}>
        {state==='idle'&&'Promise not yet created'}
        {state==='pending'&&'Waiting for async operation...'}
        {state==='fulfilled'&&'Success! .then() callback runs'}
        {state==='rejected'&&'Failed. .catch() callback runs'}
      </div>
      {state==='pending'&&<div style={{marginTop:8,display:'flex',gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:C.amber,animation:`pulse .8s ${i*0.2}s infinite`}}/>)}</div>}
    </div>
    <div style={{display:'flex',gap:6}}>
      <button onClick={run} disabled={state==='pending'} style={{fontSize:12,padding:'6px 14px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:state==='pending'?'default':'pointer',opacity:state==='pending'?.5:1}}>Run</button>
      <button onClick={reset} style={{fontSize:12,padding:'6px 12px',borderRadius:7,border:`0.5px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer'}}>Reset</button>
    </div>
  </div>
}

function PagePromises({C}){
  return<>
    <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    <ui.Tag label="Lesson 10 — Promises" color="blue" C={C}/>
    <ui.H C={C}>A Promise is a placeholder for a value that doesn't exist yet</ui.H>
    <ui.P C={C}>When you ask for data from a server, you don't get it immediately. A Promise represents the eventual result. It starts pending, then becomes either fulfilled (success) or rejected (error). You cannot go back.</ui.P>
    <PromiseViz C={C}/>
    <div style={{marginTop:10,background:C.surface2,borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:C.text,lineHeight:1.9,marginBottom:10}}>
      {`fetch("/api/data")            // returns a Promise (pending)
  .then(res => res.json())    // runs when fulfilled
  .then(data => {             // chains: data is now usable
    updateUI(data)
  })
  .catch(err => {             // runs if anything fails
    showError(err)
  })`}
    </div>
    <ui.Aha title="Promises replaced callbacks — here is why" C={C}>
      Before Promises, async code used callbacks: doSomething(data, function(result) {'{'} doMore(result, function(final) {'{'} ... {'}}'} {'}'}). Nesting callbacks created "callback hell" — unreadable, undebuggable code. Promises flatten this into a chain: .then().then().catch(). async/await (next page) flattens it further to look like synchronous code.
    </ui.Aha>
  </>
}

function PageAsyncAwait({C}){
  const [step,setStep]=useState(0)
  const [running,setRunning]=useState(false)
  const [output,setOutput]=useState([])
  const timerRef=useRef(null)

  const simulate=async()=>{
    setRunning(true);setOutput([]);setStep(0)
    const delay=ms=>new Promise(r=>setTimeout(r,ms))
    const add=(msg,color)=>setOutput(o=>[...o,{msg,color}])
    add('Starting fetch...',C.muted)
    setStep(1);await delay(600)
    add('→ Request sent to server',C.blue)
    setStep(2);await delay(1000)
    add('→ Response received: {user: "Alice"}',C.green)
    setStep(3);await delay(400)
    add('→ Updating UI with data',C.amber)
    setStep(4);await delay(300)
    add('Done.',C.green)
    setRunning(false)
  }

  const steps=[
    {label:'const data = await fetch(url)'},
    {label:'→ Paused here, waiting for network'},
    {label:'→ fetch resolves with Response'},
    {label:'const json = await res.json()'},
    {label:'→ json is ready, code continues'},
  ]

  return<>
    <ui.Tag label="Lesson 10 — async/await" color="amber" C={C}/>
    <ui.H C={C}>async/await makes async code look and read like synchronous code</ui.H>
    <ui.P C={C}>await pauses the function until a Promise resolves, then continues. The code reads top-to-bottom like normal — no .then() chains. Under the hood it is still Promises, but the syntax is far cleaner.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div>
        <div style={{background:C.surface2,borderRadius:8,padding:'10px 12px',fontFamily:'monospace',fontSize:12,color:C.text,lineHeight:1.9,marginBottom:8}}>
          {`async function loadUser() {
  const res = await fetch('/api/user')
  const data = await res.json()
  updateUI(data)
}`}
        </div>
        <button onClick={simulate} disabled={running} style={{fontSize:12,padding:'7px 16px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:running?'default':'pointer',opacity:running?.5:1}}>{running?'Running...':'▶ Simulate'}</button>
      </div>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:4}}>EXECUTION TRACE</div>
        <div style={{background:C.surface2,borderRadius:8,padding:'8px',minHeight:150,fontFamily:'monospace',fontSize:11}}>
          {output.map((o,i)=><div key={i} style={{color:o.color,marginBottom:2}}>{o.msg}</div>)}
          {!running&&output.length===0&&<div style={{color:C.hint}}>Click Simulate...</div>}
        </div>
      </div>
    </div>
    <ui.Callout color="amber" title="await only pauses the async function, not the whole thread" C={C}>
      While an async function is awaiting, JavaScript goes back to the event loop and processes other events. Other code can still run. This is why async/await does not block — the function suspends and resumes, but the thread is free.
    </ui.Callout>
    <ui.Warn title="Forgetting to await is a common bug" C={C}>
      {`const data = fetch('/api/user')  // data is a Promise, not the response!
const data = await fetch('/api/user')  // correct`}
      Without await, you get a Promise object instead of the value. The bug is silent — your code runs but data is wrong.
    </ui.Warn>
  </>
}

const PAGES=[PagePromises,PageAsyncAwait]
const PAGE_LABELS=['Promises','async/await']
export default function WebLesson10_Async({params={}}){
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
