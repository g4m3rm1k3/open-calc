import { useState, useEffect, useRef } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>,Warn:({title,children,C})=><div style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.red,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.red,lineHeight:1.65}}>{children}</div></div>}

function PageEventPipeline({C}){
  const [log,setLog]=useState([])
  const [stage,setStage]=useState(null)
  const addLog=(msg,color)=>setLog(l=>[{msg,color,id:Date.now()+Math.random()},...l].slice(0,8))

  const handleClick=e=>{
    setStage('event'); setTimeout(()=>setStage('handler'),300); setTimeout(()=>setStage('dom'),700); setTimeout(()=>setStage(null),1400)
    addLog(`click at (${e.clientX}, ${e.clientY})`,C.amber)
    addLog(`→ handler runs`,C.blue)
    addLog(`→ DOM updated`,C.green)
  }
  const handleInput=e=>addLog(`input: "${e.target.value}"`,C.purple)
  const handleKey=e=>addLog(`keydown: "${e.key}"`,C.teal)

  const stages=[
    {id:'event',label:'Event fires',desc:'User does something (click, keypress, scroll). Browser creates an event object with details.'},
    {id:'handler',label:'Handler runs',desc:'The function attached via addEventListener is called with the event object as its argument.'},
    {id:'dom',label:'DOM updates',desc:'The handler changes state and/or updates the DOM. The browser re-renders.'},
  ]

  return<>
    <ui.Tag label="Lesson 7 — Events" color="blue" C={C}/>
    <ui.H C={C}>Programs react to events — not run top to bottom</ui.H>
    <ui.P C={C}>After a page loads, JavaScript does nothing until something happens. Events are the signals that trigger your code. Every interaction — every click, keypress, form submission — fires an event that your handlers respond to.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>INTERACT WITH THESE</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <button onClick={handleClick} style={{padding:'12px',borderRadius:8,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer',fontSize:13,fontWeight:500}}>Click me</button>
          <input onInput={handleInput} onKeyDown={handleKey} placeholder="Type something..." style={{padding:'8px 12px',borderRadius:8,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,fontSize:12}}/>
        </div>
        <div style={{marginTop:10}}>
          <div style={{fontSize:10,color:C.hint,marginBottom:4}}>EVENT PIPELINE</div>
          {stages.map(s=>(
            <div key={s.id} style={{display:'flex',gap:8,alignItems:'flex-start',padding:'6px 8px',borderRadius:6,marginBottom:4,background:stage===s.id?C.amberBg:C.surface2,border:`0.5px solid ${stage===s.id?C.amberBd:C.border}`,transition:'all .2s'}}>
              <div style={{width:8,height:8,borderRadius:'50%',marginTop:4,background:stage===s.id?C.amber:C.hint,flexShrink:0,transition:'background .2s'}}/>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:stage===s.id?C.amber:C.text}}>{s.label}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:4}}>EVENT LOG</div>
        <div style={{background:C.surface2,borderRadius:8,padding:'8px',minHeight:200,fontFamily:'monospace',fontSize:11}}>
          {log.length===0&&<div style={{color:C.hint,padding:'4px 0'}}>No events yet...</div>}
          {log.map(entry=>(
            <div key={entry.id} style={{color:entry.color,marginBottom:3,lineHeight:1.4}}>{entry.msg}</div>
          ))}
        </div>
      </div>
    </div>
    <ui.Aha title="The paradigm shift: from sequential to reactive" C={C}>
      Traditional code runs line by line, top to bottom. Event-driven code waits. It says: "when the user clicks this, run that function." The code does not know or care when events happen — it just describes what to do when they do. This reactive pattern is the foundation of all interactive software.
    </ui.Aha>
  </>
}

function PageBubbling({C}){
  const [log,setLog]=useState([])
  const [stopProp,setStopProp]=useState(false)
  const add=(who)=>setLog(l=>[who,...l].slice(0,10))

  const outerClick=e=>{if(!stopProp)add('outer div')}
  const middleClick=e=>{add('middle div');if(stopProp)e.stopPropagation()}
  const innerClick=e=>{add('inner button');if(stopProp)e.stopPropagation()}

  return<>
    <ui.Tag label="Lesson 7 — Bubbling" color="amber" C={C}/>
    <ui.H C={C}>Events bubble up the tree — every ancestor gets notified</ui.H>
    <ui.P C={C}>When you click an element, the event fires on that element, then its parent, then its grandparent, all the way to the document root. This is called bubbling. Click the inner button and watch which handlers fire.</ui.P>
    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
      <button onClick={()=>setStopProp(!stopProp)} style={{fontSize:12,padding:'5px 12px',borderRadius:7,cursor:'pointer',border:`0.5px solid ${stopProp?C.redBd:C.border}`,background:stopProp?C.redBg:'transparent',color:stopProp?C.red:C.muted}}>{stopProp?'stopPropagation: ON':'stopPropagation: OFF'}</button>
      <button onClick={()=>setLog([])} style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,background:'transparent',color:C.hint,cursor:'pointer'}}>clear</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div style={{padding:8,background:C.amberBg,border:`1px dashed ${C.amberBd}`,borderRadius:8,cursor:'pointer'}} onClick={outerClick}>
        <div style={{fontSize:10,color:C.amber,marginBottom:6}}>outer div (has listener)</div>
        <div style={{padding:8,background:C.blueBg,border:`1px dashed ${C.blueBd}`,borderRadius:6,cursor:'pointer'}} onClick={middleClick}>
          <div style={{fontSize:10,color:C.blue,marginBottom:6}}>middle div (has listener)</div>
          <button onClick={innerClick} style={{padding:'8px 14px',borderRadius:6,border:`1px solid ${C.green}`,background:C.greenBg,color:C.green,cursor:'pointer',fontSize:12,fontWeight:500}}>inner button (click me)</button>
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:4}}>FIRED IN ORDER:</div>
        <div style={{background:C.surface2,borderRadius:8,padding:'8px',minHeight:140,fontFamily:'monospace',fontSize:12}}>
          {log.length===0&&<div style={{color:C.hint,fontSize:11}}>Click the button...</div>}
          {log.map((who,i)=><div key={i} style={{color:who.includes('button')?C.green:who.includes('middle')?C.blue:C.amber,marginBottom:2}}>{i+1}. {who}</div>)}
        </div>
        {stopProp&&<div style={{marginTop:6,fontSize:11,color:C.red,background:C.redBg,padding:'5px 8px',borderRadius:5}}>stopPropagation() called — bubbling stopped at middle div</div>}
      </div>
    </div>
    <ui.Callout color="blue" title="Event delegation: listen once, handle everything" C={C}>
      Because events bubble, you can put ONE listener on a parent and handle events from all children. A list with 1000 items does not need 1000 listeners — one listener on the {'<ul>'} catches clicks on any {'<li>'}. Check event.target to see which child was actually clicked.
    </ui.Callout>
    <ui.Warn title="stopPropagation — use sparingly" C={C}>
      Stopping propagation breaks event delegation and can cause hard-to-debug behaviour when parent code never fires. Use it only when you genuinely need to prevent a parent handler from responding to a child's event — not as a general "prevent default" tool.
    </ui.Warn>
  </>
}

const PAGES=[PageEventPipeline,PageBubbling]
const PAGE_LABELS=['Event pipeline','Bubbling']
export default function WebLesson07_Events({params={}}){
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
