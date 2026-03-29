import { useState, useEffect } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}

function PageStateUI({C}){
  const [state,setState]=useState({count:0,filter:'all',darkMode:false,user:null,loading:false})
  const [flash,setFlash]=useState(null)
  const update=(key,val)=>{setState(s=>({...s,[key]:val}));setFlash(key);setTimeout(()=>setFlash(null),600)}

  const items=[{id:1,text:'Buy milk',done:true},{id:2,text:'Write code',done:false},{id:3,text:'Exercise',done:false}]
  const filtered=state.filter==='all'?items:state.filter==='done'?items.filter(i=>i.done):items.filter(i=>!i.done)

  return<>
    <ui.Tag label="Lesson 11 — State drives UI" color="blue" C={C}/>
    <ui.H C={C}>UI is a function of state — change state, UI updates automatically</ui.H>
    <ui.P C={C}>The core idea: your UI should always reflect the current state. You never manually update individual elements — you update state, and the UI re-renders to match. This is the model behind every modern framework.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>STATE OBJECT (change these)</div>
        <div style={{background:C.surface2,borderRadius:8,padding:'10px 12px',marginBottom:8}}>
          {Object.entries(state).map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,padding:'4px 8px',borderRadius:5,background:flash===k?C.amberBg:'transparent',border:`0.5px solid ${flash===k?C.amberBd:'transparent'}`,transition:'all .15s'}}>
              <span style={{fontFamily:'monospace',fontSize:11,color:C.muted}}>{k}:</span>
              <span style={{fontFamily:'monospace',fontSize:11,color:C.amber,maxWidth:120,textAlign:'right',overflow:'hidden',textOverflow:'ellipsis'}}>{JSON.stringify(v)}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          <button onClick={()=>update('count',state.count+1)} style={{fontSize:11,padding:'5px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer',textAlign:'left'}}>count + 1</button>
          <div style={{display:'flex',gap:4}}>
            {['all','done','active'].map(f=><button key={f} onClick={()=>update('filter',f)} style={{flex:1,fontSize:11,padding:'4px',borderRadius:5,border:`0.5px solid ${state.filter===f?C.blueBd:C.border}`,background:state.filter===f?C.blueBg:'transparent',color:state.filter===f?C.blue:C.hint,cursor:'pointer'}}>{f}</button>)}
          </div>
          <button onClick={()=>update('darkMode',!state.darkMode)} style={{fontSize:11,padding:'5px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer',textAlign:'left'}}>toggle darkMode</button>
          <button onClick={()=>update('user',state.user?null:{name:'Alice',role:'admin'})} style={{fontSize:11,padding:'5px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer',textAlign:'left'}}>toggle user (logged in/out)</button>
          <button onClick={()=>{update('loading',true);setTimeout(()=>update('loading',false),1500)}} style={{fontSize:11,padding:'5px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer',textAlign:'left'}}>simulate loading</button>
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>RENDERED UI (reflects state)</div>
        <div style={{background:state.darkMode?'#1e293b':'#ffffff',border:`0.5px solid ${C.border}`,borderRadius:8,padding:'12px',minHeight:200,transition:'background .3s'}}>
          {state.loading?<div style={{display:'flex',alignItems:'center',gap:8,color:C.amber,fontSize:12}}><div style={{width:14,height:14,borderRadius:'50%',border:`2px solid ${C.amber}`,borderTopColor:'transparent',animation:'spin 1s linear infinite'}}/> Loading...</div>:<>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontFamily:'monospace',fontSize:14,fontWeight:500,color:state.darkMode?'#e2e8f0':'#1e293b'}}>count: {state.count}</span>
              {state.user&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:10,background:C.greenBg,color:C.green}}>{state.user.name} ({state.user.role})</span>}
              {!state.user&&<span style={{fontSize:11,color:C.hint}}>Not logged in</span>}
            </div>
            <div style={{display:'flex',gap:4,marginBottom:8}}>
              {['all','done','active'].map(f=><span key={f} style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:state.filter===f?(state.darkMode?C.blueBg:C.blueBg):'transparent',color:state.filter===f?C.blue:(state.darkMode?'#94a3b8':'#64748b'),border:`0.5px solid ${state.filter===f?C.blue:'transparent'}`}}>{f}</span>)}
            </div>
            {filtered.map(item=><div key={item.id} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:item.done?(state.darkMode?'#475569':'#94a3b8'):(state.darkMode?'#e2e8f0':'#1e293b'),textDecoration:item.done?'line-through':'none',marginBottom:4}}>
              <div style={{width:12,height:12,borderRadius:3,background:item.done?C.green:C.hint,flexShrink:0}}/>
              {item.text}
            </div>)}
            {filtered.length===0&&<div style={{fontSize:11,color:C.hint,fontStyle:'italic'}}>No {state.filter} items</div>}
          </>}
        </div>
      </div>
    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <ui.Aha title="UI = f(state) is the most important idea in modern web development" C={C}>
      Every change you make to the state object immediately re-renders the UI to match. You never say "find that element and change its text" — you say "the state is now X" and the UI figures itself out. This makes large UIs predictable: if the UI looks wrong, the state is wrong. Debug the state, not the DOM.
    </ui.Aha>
    <ui.Callout color="amber" title="This is exactly what React, Vue, and Svelte implement" C={C}>
      These frameworks formalise the UI = f(state) pattern. They track when state changes, compute the new UI, and update only the parts of the DOM that changed. You write the state and what the UI should look like given that state — the framework handles the rest.
    </ui.Callout>
  </>
}

const PAGES=[PageStateUI]
const PAGE_LABELS=['State drives UI']
export default function WebLesson11_StateUI({params={}}){
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
