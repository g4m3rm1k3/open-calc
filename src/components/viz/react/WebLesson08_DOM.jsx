import { useState, useEffect } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>,Warn:({title,children,C})=><div style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.red,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.red,lineHeight:1.65}}>{children}</div></div>}

function PageDomManipulation({C}){
  const [items,setItems]=useState(['First item','Second item','Third item'])
  const [heading,setHeading]=useState('My List')
  const [highlighted,setHighlighted]=useState(null)
  const [newItem,setNewItem]=useState('')
  const [ops,setOps]=useState([])
  const log=(op)=>setOps(o=>[op,...o].slice(0,6))

  const changeText=()=>{setHeading('Updated Heading!');log("heading.textContent = 'Updated Heading!'")}
  const addClass=()=>{setHighlighted(0);log("items[0].classList.add('highlight')")}
  const append=()=>{if(!newItem.trim())return;setItems(i=>[...i,newItem]);log(`ul.appendChild(li) // "${newItem}"`);setNewItem('')}
  const remove=(idx)=>{setItems(i=>i.filter((_,j)=>j!==idx));log(`items[${idx}].remove()`)}
  const reset=()=>{setItems(['First item','Second item','Third item']);setHeading('My List');setHighlighted(null);setOps([])}

  return<>
    <ui.Tag label="Lesson 8 — DOM manipulation" color="blue" C={C}/>
    <ui.H C={C}>JavaScript changes the DOM — the page updates immediately</ui.H>
    <ui.P C={C}>Every button below runs a real DOM operation. The left panel shows the resulting DOM structure. The right panel is the live rendered result. They are always in sync because the rendered page IS the DOM.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>DOM OPERATIONS</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <button onClick={changeText} style={{fontSize:12,padding:'7px 10px',borderRadius:7,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer',textAlign:'left'}}>heading.textContent = 'Updated Heading!'</button>
          <button onClick={addClass} style={{fontSize:12,padding:'7px 10px',borderRadius:7,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,cursor:'pointer',textAlign:'left'}}>items[0].classList.add('highlight')</button>
          <div style={{display:'flex',gap:5}}>
            <input value={newItem} onChange={e=>setNewItem(e.target.value)} placeholder="New item text..." style={{flex:1,padding:'6px 8px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,fontSize:12}}/>
            <button onClick={append} style={{fontSize:12,padding:'6px 10px',borderRadius:6,border:`0.5px solid ${C.greenBd}`,background:C.greenBg,color:C.green,cursor:'pointer'}}>appendChild</button>
          </div>
          <button onClick={reset} style={{fontSize:11,padding:'5px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,background:'transparent',color:C.hint,cursor:'pointer'}}>reset</button>
        </div>
        <div style={{marginTop:8,background:C.surface2,borderRadius:7,padding:'8px',fontFamily:'monospace',fontSize:11,minHeight:80}}>
          <div style={{color:C.hint,marginBottom:3}}>Operation log:</div>
          {ops.map((op,i)=><div key={i} style={{color:C.amber,marginBottom:1}}>{op}</div>)}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>LIVE RENDER</div>
        <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'12px'}}>
          <h4 style={{margin:0,marginBottom:8,fontSize:16,color:C.text,fontWeight:500}}>{heading}</h4>
          <ul style={{margin:0,padding:'0 0 0 16px'}}>
            {items.map((item,i)=>(
              <li key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4,color:i===highlighted?C.amber:C.muted,fontSize:13,background:i===highlighted?C.amberBg:'transparent',borderRadius:4,padding:'2px 4px'}}>
                {item}
                <button onClick={()=>remove(i)} style={{fontSize:10,color:C.hint,background:'transparent',border:'none',cursor:'pointer',padding:'0 4px'}}>✕</button>
              </li>
            ))}
          </ul>
          {items.length===0&&<div style={{fontSize:12,color:C.hint,fontStyle:'italic'}}>List is empty</div>}
        </div>
        <div style={{marginTop:8,background:C.surface2,borderRadius:7,padding:'8px',fontFamily:'monospace',fontSize:11}}>
          <div style={{color:C.hint,marginBottom:3}}>Current DOM structure:</div>
          <div style={{color:C.purple}}>{'<h4>'}{heading}{'</h4>'}</div>
          <div style={{color:C.blue}}>{'<ul>'}</div>
          {items.map((item,i)=><div key={i} style={{color:i===highlighted?C.amber:C.teal,paddingLeft:12}}>{'<li>'}{item}{'</li>'}</div>)}
          <div style={{color:C.blue}}>{'</ul>'}</div>
        </div>
      </div>
    </div>
    <ui.Aha title="The DOM is the source of truth — not the HTML file" C={C}>
      The HTML file was used to build the initial DOM. Every change you make via JavaScript happens to the DOM object in memory. If you refresh the page, the DOM is rebuilt from the HTML file and all changes disappear. This is why state management exists — to persist what the user has done.
    </ui.Aha>
  </>
}

function PageQueryingDom({C}){
  const methods=[
    {method:'getElementById("nav")',returns:'one element',desc:'Fastest. Matches the single element with id="nav". IDs must be unique.',example:'const nav = document.getElementById("nav")'},
    {method:'querySelector(".card")',returns:'first match',desc:'Returns the first element matching any CSS selector. Very flexible.',example:'const first = document.querySelector(".card")'},
    {method:'querySelectorAll(".card")',returns:'NodeList (all)',desc:'Returns all matching elements as a static list. Iterate with forEach.',example:'const cards = document.querySelectorAll(".card")'},
    {method:'getElementsByClassName("card")',returns:'live HTMLCollection',desc:'Like querySelectorAll but LIVE — updates automatically as DOM changes. Often confusing, prefer querySelectorAll.',example:'const cards = document.getElementsByClassName("card")'},
    {method:'closest(".modal")',returns:'nearest ancestor',desc:'Searches UP the tree from current element. Useful in event handlers to find the containing component.',example:'btn.addEventListener("click", e => {\n  const modal = e.target.closest(".modal")\n})'},
  ]
  const [selected,setSelected]=useState(0)
  const m=methods[selected]
  return<>
    <ui.Tag label="Lesson 8 — Querying" color="amber" C={C}/>
    <ui.H C={C}>Find elements before you can change them</ui.H>
    <ui.P C={C}>Before JavaScript can manipulate an element, it needs a reference to that DOM node. These methods give you that reference.</ui.P>
    <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:10}}>
      {methods.map((m,i)=><button key={i} onClick={()=>setSelected(i)} style={{fontSize:11,padding:'6px 10px',borderRadius:7,cursor:'pointer',textAlign:'left',fontFamily:'monospace',border:`0.5px solid ${selected===i?C.blueBd:C.border}`,background:selected===i?C.blueBg:C.surface2,color:selected===i?C.blue:C.text}}>{m.method}</button>)}
    </div>
    <div style={{background:C.surface2,borderRadius:10,padding:'12px 14px',marginBottom:10}}>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
        <span style={{fontSize:11,padding:'2px 8px',borderRadius:5,background:C.greenBg,color:C.green,fontWeight:500}}>{m.returns}</span>
      </div>
      <p style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:8,margin:0,marginBottom:8}}>{m.desc}</p>
      <div style={{fontFamily:'monospace',fontSize:12,color:C.teal,background:C.bg,padding:'6px 10px',borderRadius:6,whiteSpace:'pre-wrap'}}>{m.example}</div>
    </div>
    <ui.Callout color="amber" title="querySelector vs getElementById — when to use which" C={C}>
      Use getElementById when you know the exact ID and want maximum speed. Use querySelector for everything else — it accepts any CSS selector, making it far more flexible. querySelectorAll is the workhorse for collections. Avoid the live collection methods (getElementsByClassName, getElementsByTagName) unless you specifically need live updates.
    </ui.Callout>
  </>
}

const PAGES=[PageDomManipulation,PageQueryingDom]
const PAGE_LABELS=['Live manipulation','Querying elements']
export default function WebLesson08_DOM({params={}}){
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
