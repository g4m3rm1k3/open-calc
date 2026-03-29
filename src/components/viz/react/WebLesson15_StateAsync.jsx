import { useState, useEffect, useRef } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}

const USERS_DB = [
  {id:1,name:'Alice Chen',posts:12,role:'admin'},
  {id:2,name:'Bob Martin',posts:7,role:'user'},
  {id:3,name:'Carol White',posts:34,role:'moderator'},
]

function DataWidget({C}){
  const [status,setStatus]=useState('idle') // idle | loading | success | error
  const [data,setData]=useState(null)
  const [latency,setLatency]=useState(1000)
  const [failRate,setFailRate]=useState(0)
  const timerRef=useRef(null)

  const load=()=>{
    setStatus('loading');setData(null)
    clearTimeout(timerRef.current)
    timerRef.current=setTimeout(()=>{
      if(Math.random()<failRate){setStatus('error')}
      else{setStatus('success');setData(USERS_DB)}
    },latency)
  }

  return<div>
    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
      <div style={{fontSize:11,color:C.hint,minWidth:60}}>Latency</div>
      <input type="range" min={200} max={3000} step={200} value={latency} onChange={e=>setLatency(+e.target.value)} style={{flex:1}}/>
      <span style={{fontFamily:'monospace',fontSize:11,color:C.amber,minWidth:48}}>{latency}ms</span>
    </div>
    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10,flexWrap:'wrap'}}>
      <div style={{fontSize:11,color:C.hint,minWidth:60}}>Fail rate</div>
      <input type="range" min={0} max={1} step={0.1} value={failRate} onChange={e=>setFailRate(+e.target.value)} style={{flex:1}}/>
      <span style={{fontFamily:'monospace',fontSize:11,color:C.red,minWidth:32}}>{Math.round(failRate*100)}%</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
      <div style={{background:C.surface2,borderRadius:8,padding:'10px 12px'}}>
        <div style={{fontSize:10,color:C.hint,marginBottom:4}}>STATE</div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {[{k:'status',v:`"${status}"`},{k:'data',v:data?`[${data.length} users]`:'null'},{k:'loading',v:String(status==='loading')}].map(({k,v})=>(
            <div key={k} style={{display:'flex',gap:6,fontFamily:'monospace',fontSize:11}}>
              <span style={{color:C.hint,minWidth:60}}>{k}:</span>
              <span style={{color:status==='error'&&k==='status'?C.red:status==='success'&&k==='status'?C.green:status==='loading'&&k==='status'?C.amber:C.text}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:C.surface2,borderRadius:8,padding:'10px 12px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',minHeight:90}}>
        {status==='idle'&&<>
          <div style={{fontSize:12,color:C.hint,marginBottom:6}}>No data loaded</div>
          <button onClick={load} style={{fontSize:12,padding:'6px 14px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:'pointer'}}>Load users</button>
        </>}
        {status==='loading'&&<>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${C.amber}`,borderTopColor:'transparent',animation:'spin 1s linear infinite',marginBottom:6}}/>
          <div style={{fontSize:11,color:C.amber}}>Loading...</div>
        </>}
        {status==='error'&&<>
          <div style={{fontSize:20,marginBottom:4}}>⚠</div>
          <div style={{fontSize:11,color:C.red,marginBottom:6}}>Failed to load data</div>
          <button onClick={load} style={{fontSize:11,padding:'4px 12px',borderRadius:6,border:`0.5px solid ${C.redBd}`,background:C.redBg,color:C.red,cursor:'pointer'}}>Retry</button>
        </>}
        {status==='success'&&data&&<>
          <div style={{width:'100%'}}>
            {data.map(u=><div key={u.id} style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
              <span style={{color:C.text}}>{u.name}</span>
              <span style={{color:C.hint}}>{u.role}</span>
            </div>)}
          </div>
          <button onClick={load} style={{marginTop:6,fontSize:10,padding:'3px 8px',borderRadius:5,border:`0.5px solid ${C.border}`,background:'transparent',color:C.hint,cursor:'pointer'}}>Reload</button>
        </>}
      </div>
    </div>
    <ui.Callout color="blue" title="These three states are non-negotiable in real apps" C={C}>
      Every data fetch has exactly three outcomes: loading (show a spinner), error (show a retry), success (show data). Skipping any one creates bad UX. Users need feedback that something is happening. They need a way to recover from errors. They need to know when it's done.
    </ui.Callout>
  </div>
}

function PageStateAsync({C}){
  return<>
    <ui.Tag label="Lesson 15 — State + Async" color="teal" C={C}/>
    <ui.H C={C}>Real apps = state + async + UI — all three together</ui.H>
    <ui.P C={C}>The previous lessons built the pieces. This is where they combine. A data fetch changes state (status, data). That state drives the UI (spinner, error, content). Adjust the latency and failure rate to see how the state machine responds.</ui.P>
    <DataWidget C={C}/>
    <ui.Aha title="The async state machine pattern" C={C}>
      Every async operation in a real app follows this state machine: idle → loading → (success | error). Idle is before the user has triggered anything. Loading is while the request is in flight. Success and error are the two outcomes. Model this as explicit state — never infer loading from the absence of data.
    </ui.Aha>
    <div style={{background:C.surface2,borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:C.text,lineHeight:1.9}}>
      {`// The pattern every senior dev uses
const [status, setStatus] = useState('idle')
const [data,   setData]   = useState(null)
const [error,  setError]  = useState(null)

async function load() {
  setStatus('loading')
  try {
    const result = await fetchData()
    setData(result)
    setStatus('success')
  } catch (e) {
    setError(e.message)
    setStatus('error')
  }
}`}
    </div>
  </>
}

const PAGES=[PageStateAsync]
const PAGE_LABELS=['State + Async combined']
export default function WebLesson15_StateAsync({params={}}){
  const C=useColors();const[page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return<div style={{width:'100%',fontFamily:'sans-serif'}}>
    <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:12}}><PageComponent C={C}/></div>
  </div>
}
