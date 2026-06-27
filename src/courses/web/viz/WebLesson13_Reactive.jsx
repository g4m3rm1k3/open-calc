import { useState, useEffect } from 'react'

import { useThemeColors } from '../../../hooks/useThemeColors';
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}

// The same feature — a counter with derived label — built two ways
// Imperative version: you manually update every affected element
const IMPERATIVE_OPS = [
  'document.getElementById("count").textContent = count',
  'if (count > 5) btn.classList.add("warning")',
  'else btn.classList.remove("warning")',
  'if (count === 0) resetBtn.setAttribute("disabled","")',
  'else resetBtn.removeAttribute("disabled")',
  'label.textContent = count===1 ? "click" : "clicks"',
  'if (count >= 10) { banner.style.display = "block" }',
  'else { banner.style.display = "none" }',
]

function PageImperativeVsDeclarative({C}){
  const [count,setCount]=useState(0)
  const [features,setFeatures]=useState(3)

  const imperativeOps = IMPERATIVE_OPS.slice(0,features)

  return<>
    <ui.Tag label="Lesson 13 — Reactive thinking" color="purple" C={C}/>
    <ui.H C={C}>Imperative: tell the browser what to do. Declarative: describe what you want.</ui.H>
    <ui.P C={C}>The same counter with warning, reset button, pluralisation, and a banner. The two columns show the same feature built two different ways. Add features with the slider and watch imperative complexity explode while declarative stays flat.</ui.P>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
      <span style={{fontSize:12,color:C.muted,minWidth:100}}>Active features</span>
      <input type="range" min={1} max={IMPERATIVE_OPS.length} step={1} value={features} onChange={e=>setFeatures(+e.target.value)} style={{flex:1}}/>
      <span style={{fontFamily:'monospace',fontSize:12,color:C.amber,minWidth:24}}>{features}</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div>
        <div style={{fontSize:10,fontWeight:500,color:C.red,marginBottom:6}}>IMPERATIVE — tell the DOM what to change</div>
        <div style={{background:C.surface2,borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11,color:C.text,lineHeight:1.8,minHeight:160,marginBottom:6}}>
          <div style={{color:C.hint,marginBottom:4}}>// After every state change, manually update:</div>
          {imperativeOps.map((op,i)=><div key={i} style={{color:i>=4?C.red:C.text,marginBottom:1}}>{op}</div>)}
        </div>
        <div style={{background:C.redBg,borderRadius:6,padding:'6px 10px',fontSize:11,color:C.red}}>
          {features} DOM operations every update. {features > 4 ? 'Easy to miss one.' : 'Getting complex.'} Each new feature adds more operations.
        </div>
      </div>
      <div>
        <div style={{fontSize:10,fontWeight:500,color:C.green,marginBottom:6}}>DECLARATIVE — describe what it should look like</div>
        <div style={{background:C.surface2,borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11,color:C.text,lineHeight:1.8,minHeight:160,marginBottom:6}}>
          <div style={{color:C.hint,marginBottom:4}}>// Describe the UI given the state:</div>
          <div style={{color:C.green}}>{`<span>{count}</span>`}</div>
          {features>=2&&<div style={{color:C.green}}>{`<button class={count>5?"warning":""}>`}</div>}
          {features>=3&&<div style={{color:C.green}}>{`<button disabled={count===0}>reset</button>`}</div>}
          {features>=4&&<div style={{color:C.green}}>{`{count===1 ? "click" : "clicks"}`}</div>}
          {features>=5&&<div style={{color:C.green}}>{`{count>=10 && <Banner/>}`}</div>}
          {features>=6&&<div style={{color:C.green}}>{`// + {features-5} more — still flat`}</div>}
        </div>
        <div style={{background:C.greenBg,borderRadius:6,padding:'6px 10px',fontSize:11,color:C.green}}>
          Always the same shape. Adding features adds lines, not complexity.
        </div>
      </div>
    </div>
    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
      <button onClick={()=>setCount(0)} disabled={count===0} style={{fontSize:12,padding:'5px 12px',borderRadius:7,border:`0.5px solid ${C.border}`,background:'transparent',color:count===0?C.hint:C.muted,cursor:count===0?'default':'pointer'}}>Reset</button>
      <button onClick={()=>setCount(c=>c+1)} style={{fontSize:12,padding:'5px 14px',borderRadius:7,border:`0.5px solid ${count>5?C.redBd:C.blueBd}`,background:count>5?C.redBg:C.blueBg,color:count>5?C.red:C.blue,cursor:'pointer'}}>+1</button>
      <span style={{fontFamily:'monospace',fontSize:16,color:C.text,fontWeight:500}}>{count}</span>
      <span style={{fontSize:12,color:C.muted}}>{count===1?'click':'clicks'}</span>
      {count>=10&&<span style={{fontSize:11,padding:'2px 10px',borderRadius:10,background:C.amberBg,color:C.amber,border:`0.5px solid ${C.amberBd}`}}>10+ milestone!</span>}
    </div>
    <ui.Aha title="Stop telling. Start describing." C={C}>
      Imperative code says: "find the button, add the class, find the label, change its text, check if the banner exists, show it." Declarative code says: "this is what the UI looks like when count is X." The framework figures out every DOM operation needed to get there. You describe the destination; the framework drives.
    </ui.Aha>
  </>
}

const PAGES=[PageImperativeVsDeclarative]
const PAGE_LABELS=['Imperative vs Declarative']
export default function WebLesson13_Reactive({params={}}){
  const C=useThemeColors();const[page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return<div style={{width:'100%',fontFamily:'sans-serif'}}>
    <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:12}}><PageComponent C={C}/></div>
  </div>
}
