import { useState, useEffect, useRef } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}

function PageRenderPipeline({C}){
  const [changes,setChanges]=useState([])
  const add=(type,cost,desc)=>setChanges(c=>[{type,cost,desc,id:Date.now()+Math.random()},...c].slice(0,8))

  const ops=[
    {label:'Change color (no layout)',fn:()=>add('paint','~0.1ms','color change → repaint only — fast, no layout recalc'),color:C.green},
    {label:'Change opacity (GPU)',fn:()=>add('composite','~0.01ms','opacity → GPU composited — fastest possible change'),color:C.teal},
    {label:'Change width (layout)',fn:()=>add('layout','~5-20ms','width change → full layout recalc → repaint → composite'),color:C.red},
    {label:'Read offsetHeight',fn:()=>add('forced','~10ms','reading layout property forces synchronous reflow — avoid in loops'),color:C.amber},
    {label:'Animate with transform',fn:()=>add('composite','~0.01ms','transform is GPU composited — use instead of top/left'),color:C.teal},
  ]

  const costColors={composite:C.teal,paint:C.green,layout:C.red,forced:C.amber}

  return<>
    <ui.Tag label="Lesson 16 — Performance" color="red" C={C}/>
    <ui.H C={C}>Not all DOM changes cost the same — some trigger full layout recalc</ui.H>
    <ui.P C={C}>The browser renders in a pipeline: Layout → Paint → Composite. Changing a property that affects layout (width, height, margin) forces the browser to restart from the beginning. Changing only paint properties (color, background) skips layout. Composite-only changes (transform, opacity) skip both.</ui.P>
    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
      {ops.map((op,i)=><button key={i} onClick={op.fn} style={{fontSize:11,padding:'5px 12px',borderRadius:7,cursor:'pointer',border:`0.5px solid ${op.color}22`,background:op.color+'11',color:op.color}}>{op.label}</button>)}
    </div>
    <div style={{marginBottom:10}}>
      <div style={{display:'flex',gap:4,marginBottom:4}}>
        {['Layout','Paint','Composite'].map((stage,i)=>(
          <div key={stage} style={{flex:1,padding:'6px 4px',textAlign:'center',borderRadius:6,background:i===0?C.redBg:i===1?C.greenBg:C.tealBg,border:`0.5px solid ${i===0?C.redBd:i===1?C.greenBd:C.tealBd}`}}>
            <div style={{fontSize:10,fontWeight:500,color:i===0?C.red:i===1?C.green:C.teal}}>Stage {i+1}</div>
            <div style={{fontSize:11,color:i===0?C.red:i===1?C.green:C.teal}}>{stage}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:4}}>
        {changes.map(ch=><div key={ch.id} style={{display:'flex',gap:8,background:C.surface2,borderRadius:6,padding:'6px 10px',alignItems:'center'}}>
          <span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:costColors[ch.type]+'22',color:costColors[ch.type],minWidth:60,textAlign:'center',fontWeight:500}}>{ch.cost}</span>
          <span style={{fontSize:11,color:C.muted,flex:1}}>{ch.desc}</span>
        </div>)}
        {changes.length===0&&<div style={{fontSize:11,color:C.hint,padding:'8px 0'}}>Click an operation above...</div>}
      </div>
    </div>
    <ui.Aha title="The GPU compositing trick" C={C}>
      The browser can hand off certain operations to the GPU: transform (translate, scale, rotate) and opacity. GPU changes happen outside the main thread — they never block JavaScript or cause layout recalc. Animating transform: translateX() is up to 60× faster than animating left: for the same visual result. Always prefer transform and opacity for animations.
    </ui.Aha>
    <ui.Callout color="amber" title="Reading layout properties forces a synchronous reflow" C={C}>
      Reading offsetHeight, clientWidth, getBoundingClientRect() inside a loop that also writes layout properties (width, height) forces the browser to recalculate layout synchronously for each read. This is called "layout thrashing" and is one of the most common performance killers. Batch all reads before all writes.
    </ui.Callout>
  </>
}

const PAGES=[PageRenderPipeline]
const PAGE_LABELS=['Render pipeline']
export default function WebLesson16_Performance({params={}}){
  const C=useColors();const[page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return<div style={{width:'100%',fontFamily:'sans-serif'}}>
    <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:12}}><PageComponent C={C}/></div>
  </div>
}
