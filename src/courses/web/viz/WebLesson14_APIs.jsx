import { useState, useEffect, useRef } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}

const SAMPLE_RESPONSE = {
  id: 1,
  name: "Leanne Graham",
  email: "sincere@april.biz",
  address: { city: "Gwenborough", zipcode: "92998-3874" },
  company: { name: "Romaguera-Crona", catchPhrase: "Multi-layered client-server neural-net" }
}

function PageRequestResponse({C}){
  const [latency,setLatency]=useState(800)
  const [shouldFail,setShouldFail]=useState(false)
  const [phase,setPhase]=useState('idle')
  const [response,setResponse]=useState(null)
  const timerRef=useRef(null)
  const [packets,setPackets]=useState([])
  const pRef=useRef(0)

  const run=()=>{
    setPhase('requesting');setResponse(null);setPackets([])
    pRef.current=0
    const addPkt=()=>{pRef.current++;setPackets(p=>[...p,{id:pRef.current,dir:pRef.current<=2?'up':'down'}])}
    addPkt();setTimeout(addPkt,latency*0.3);setTimeout(()=>{setPhase('waiting')},latency*0.4)
    setTimeout(addPkt,latency*0.6);setTimeout(addPkt,latency*0.8)
    setTimeout(()=>{
      if(shouldFail){setPhase('error');setResponse(null)}
      else{setPhase('done');setResponse(SAMPLE_RESPONSE)}
    },latency)
  }

  const phaseColors={idle:C.hint,requesting:C.amber,waiting:C.blue,done:C.green,error:C.red}
  const phaseLabels={idle:'Ready',requesting:'Sending request...',waiting:'Waiting for server...',done:'Response received',error:'Network error'}

  return<>
    <ui.Tag label="Lesson 14 — APIs" color="blue" C={C}/>
    <ui.H C={C}>An API call: your app sends a request, a server sends back data</ui.H>
    <ui.P C={C}>APIs (Application Programming Interfaces) let your frontend communicate with servers. Your browser sends an HTTP request — a message with a URL and method. The server processes it and replies with data, typically JSON.</ui.P>
    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
      <div style={{fontSize:11,color:C.hint,minWidth:60}}>Latency</div>
      <input type="range" min={300} max={3000} step={100} value={latency} onChange={e=>setLatency(+e.target.value)} style={{flex:1,maxWidth:160}}/>
      <span style={{fontFamily:'monospace',fontSize:11,color:C.amber,minWidth:48}}>{latency}ms</span>
      <button onClick={()=>setShouldFail(!shouldFail)} style={{fontSize:11,padding:'3px 10px',borderRadius:6,cursor:'pointer',border:`0.5px solid ${shouldFail?C.redBd:C.border}`,background:shouldFail?C.redBg:'transparent',color:shouldFail?C.red:C.muted}}>{shouldFail?'Fail mode ON':'Fail mode'}</button>
      <button onClick={run} disabled={phase==='requesting'||phase==='waiting'} style={{fontSize:12,padding:'5px 14px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:'pointer',opacity:phase==='requesting'||phase==='waiting'?.5:1}}>Send request</button>
    </div>
    <div style={{background:C.surface2,borderRadius:10,padding:'12px',marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontFamily:'monospace',fontSize:11,color:C.muted}}>GET /api/users/1</div>
        <div style={{display:'flex',alignItems:'center',gap:5}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:phaseColors[phase]}}/>
          <span style={{fontSize:11,color:phaseColors[phase]}}>{phaseLabels[phase]}</span>
        </div>
      </div>
      <div style={{position:'relative',height:40,background:C.bg,borderRadius:6,overflow:'hidden',marginBottom:10}}>
        <div style={{position:'absolute',left:'5%',top:'50%',transform:'translateY(-50%)',fontSize:10,color:C.blue}}>Browser</div>
        <div style={{position:'absolute',right:'5%',top:'50%',transform:'translateY(-50%)',fontSize:10,color:C.green}}>Server</div>
        {packets.map(p=>(
          <div key={p.id} style={{position:'absolute',top:'50%',transform:'translateY(-50%)',width:8,height:8,borderRadius:'50%',background:p.dir==='up'?C.amber:C.green,animation:`${p.dir==='up'?'slideRight':'slideLeft'} ${latency}ms linear forwards`}}/>
        ))}
      </div>
      <style>{`@keyframes slideRight{from{left:20%}to{left:75%}}@keyframes slideLeft{from{right:20%}to{right:75%}}`}</style>
      {phase==='done'&&response&&<div style={{background:C.bg,borderRadius:6,padding:'8px 10px',fontFamily:'monospace',fontSize:11,color:C.green,lineHeight:1.7}}>
        <div style={{color:C.hint,marginBottom:4}}>Response body (JSON):</div>
        {`{\n  id: ${response.id},\n  name: "${response.name}",\n  email: "${response.email}",\n  address: { city: "${response.address.city}" },\n  ...`}
      </div>}
      {phase==='error'&&<div style={{background:C.redBg,borderRadius:6,padding:'8px 10px',fontFamily:'monospace',fontSize:11,color:C.red}}>Error: Failed to fetch — network error or server unavailable</div>}
    </div>
    <div style={{background:C.surface2,borderRadius:8,padding:'10px 12px',fontFamily:'monospace',fontSize:12,color:C.text,lineHeight:1.9,marginBottom:10}}>
      {`async function loadUser(id) {
  const res  = await fetch(\`/api/users/\${id}\`)  // send request
  if (!res.ok) throw new Error('Network error')  // check for errors
  const data = await res.json()                   // parse JSON body
  return data                                     // usable object
}`}
    </div>
    <ui.Aha title="JSON is just a text format that looks like a JS object" C={C}>
      The server sends back plain text in JSON format — quotes around keys, no functions, no undefined. fetch() gets this text, and .json() parses it into a real JavaScript object you can use like any other. JSON is the universal language between servers and browsers.
    </ui.Aha>
    <ui.Callout color="amber" title="Always handle the error case" C={C}>
      fetch() only rejects (throws) on network failure. A 404 or 500 response still resolves — you have to check res.ok yourself. Forgetting this is a very common bug: your code thinks the request succeeded even when the server returned an error.
    </ui.Callout>
  </>
}

const PAGES=[PageRequestResponse]
const PAGE_LABELS=['Request & response']
export default function WebLesson14_APIs({params={}}){
  const C=useColors();const[page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return<div style={{width:'100%',fontFamily:'sans-serif'}}>
    <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:12}}><PageComponent C={C}/></div>
  </div>
}
