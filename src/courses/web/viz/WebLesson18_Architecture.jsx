import { useState, useEffect } from 'react'

import { useThemeColors } from '../../../hooks/useThemeColors';
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}

const LAYERS=[
  {id:'ui',label:'UI Layer',desc:'Components, views, pages',color:'blue',resp:'Rendering, user interaction, displaying data',noKnow:'Business rules, where data comes from, API details'},
  {id:'logic',label:'Logic Layer',desc:'State management, business rules',color:'purple',resp:'Validating data, transforming it, deciding what to fetch',noKnow:'How things are rendered, HTTP details, SQL'},
  {id:'data',label:'Data Layer',desc:'API calls, local storage, cache',color:'teal',resp:'Fetching, caching, transforming raw API responses',noKnow:'How data is displayed, business rules, UI state'},
]

const DATA_FLOW=[
  {from:'User clicks "Save"',to:'UI Layer',color:'blue'},
  {from:'UI calls saveUser(data)',to:'Logic Layer',color:'purple'},
  {from:'Logic validates + calls api.put("/users/1")',to:'Data Layer',color:'teal'},
  {from:'API returns updated user',to:'Logic Layer (success)',color:'purple'},
  {from:'Logic updates state',to:'UI Layer re-renders',color:'blue'},
]

function PageArchitecture({C}){
  const [selected,setSelected]=useState(null)
  const [activeFlow,setActiveFlow]=useState(-1)
  const colorMap={blue:[C.blueBg,C.blue,C.blueBd],purple:[C.purpleBg,C.purple,C.purpleBd],teal:[C.tealBg,C.teal,C.tealBd]}

  const animate=()=>{
    setActiveFlow(0)
    DATA_FLOW.forEach((_,i)=>setTimeout(()=>setActiveFlow(i),i*600))
    setTimeout(()=>setActiveFlow(-1),DATA_FLOW.length*600+400)
  }

  const sel=selected?LAYERS.find(l=>l.id===selected):null

  return<>
    <ui.Tag label="Lesson 18 — Architecture" color="teal" C={C}/>
    <ui.H C={C}>Organising large systems: separation of concerns</ui.H>
    <ui.P C={C}>As apps grow, mixing UI, business logic, and data access in the same file creates code that is impossible to test, debug, or change. Architecture means splitting responsibilities so each layer only knows what it needs to.</ui.P>
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
      {LAYERS.map((layer,i)=>{
        const [bg,tc,bd]=colorMap[layer.color]
        const isSel=selected===layer.id
        return<div key={layer.id} onClick={()=>setSelected(isSel?null:layer.id)} style={{background:isSel?bg:C.surface2,border:`0.5px solid ${isSel?bd:C.border}`,borderRadius:10,padding:'10px 14px',cursor:'pointer',transition:'all .15s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <span style={{fontSize:13,fontWeight:500,color:isSel?tc:C.text}}>{layer.label}</span>
              <span style={{fontSize:11,color:C.muted,marginLeft:8}}>{layer.desc}</span>
            </div>
            <span style={{fontSize:10,color:C.hint}}>tap for details</span>
          </div>
          {isSel&&<div style={{marginTop:8,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div style={{background:C.greenBg,borderRadius:6,padding:'6px 10px'}}>
              <div style={{fontSize:10,color:C.green,fontWeight:500,marginBottom:3}}>Responsible for</div>
              <div style={{fontSize:11,color:C.green}}>{layer.resp}</div>
            </div>
            <div style={{background:C.redBg,borderRadius:6,padding:'6px 10px'}}>
              <div style={{fontSize:10,color:C.red,fontWeight:500,marginBottom:3}}>Should NOT know about</div>
              <div style={{fontSize:11,color:C.red}}>{layer.noKnow}</div>
            </div>
          </div>}
        </div>
      })}
    </div>
    <div style={{marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <div style={{fontSize:11,color:C.hint}}>Data flow through layers — click to animate</div>
        <button onClick={animate} style={{fontSize:11,padding:'3px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.muted,cursor:'pointer'}}>▶ Animate</button>
      </div>
      {DATA_FLOW.map((step,i)=>{
        const [bg,tc]=colorMap[step.color]
        const isActive=activeFlow===i
        return<div key={i} style={{display:'flex',gap:8,alignItems:'center',padding:'5px 8px',borderRadius:6,marginBottom:3,background:isActive?bg:C.surface2,border:`0.5px solid ${isActive?tc:C.border}`,transition:'all .2s'}}>
          <span style={{fontSize:10,fontWeight:500,color:isActive?tc:C.hint,minWidth:14}}>{i+1}</span>
          <span style={{fontSize:11,color:isActive?tc:C.muted,flex:1}}>{step.from}</span>
          <span style={{fontSize:10,color:isActive?tc:C.hint}}>→ {step.to}</span>
        </div>
      })}
    </div>
    <ui.Aha title="Separation of concerns = survivable change" C={C}>
      When your API endpoint changes, only the data layer needs updating — the UI and logic are untouched. When your design system changes, only the UI layer changes. When business rules change, only the logic layer changes. Each layer is independently testable, replaceable, and comprehensible. This is what "maintainable code" actually means.
    </ui.Aha>
  </>
}

const PAGES=[PageArchitecture]
const PAGE_LABELS=['App layers']
export default function WebLesson18_Architecture({params={}}){
  const C=useThemeColors();const[page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return<div style={{width:'100%',fontFamily:'sans-serif'}}>
    <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:12}}><PageComponent C={C}/></div>
  </div>
}
