import { useState, useEffect } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}

// Same todo app — raw JS vs React-style abstraction
const RAW_CODE = `// Raw JS — you manage every DOM operation
let items = ['Buy milk', 'Write tests']
const list = document.getElementById('list')

function addItem(text) {
  items.push(text)
  // Manually create and insert DOM node
  const li = document.createElement('li')
  li.textContent = text
  li.addEventListener('click', () => removeItem(li, text))
  list.appendChild(li)
  updateCount()
}

function removeItem(li, text) {
  items = items.filter(i => i !== text)
  list.removeChild(li)
  updateCount()
}

function updateCount() {
  document.getElementById('count').textContent =
    items.length + ' items'
}
// 25 lines of DOM management for a basic feature`

const REACT_CODE = `// React — describe the UI, framework handles DOM
function TodoApp() {
  const [items, setItems] = useState(['Buy milk', 'Write tests'])

  const add  = text => setItems([...items, text])
  const remove = text => setItems(items.filter(i => i !== text))

  return (
    <div>
      <p>{items.length} items</p>
      <ul>
        {items.map(item => (
          <li key={item} onClick={() => remove(item)}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
// 15 lines — no DOM management at all`

function PageAbstraction({C}){
  const [mode,setMode]=useState('raw')
  const [items,setItems]=useState(['Buy milk','Write tests'])
  const [input,setInput]=useState('')
  const add=()=>{if(input.trim()){setItems(i=>[...i,input]);setInput('')}}
  const remove=t=>setItems(i=>i.filter(x=>x!==t))

  return<>
    <ui.Tag label="Lesson 17 — Abstraction" color="purple" C={C}/>
    <ui.H C={C}>Frameworks solve repeated problems so you can focus on your problem</ui.H>
    <ui.P C={C}>A framework is an abstraction layer that handles the plumbing — DOM updates, event binding, state synchronisation — so your code only describes what your app does, not how to wire up every DOM operation. Same todo list, two approaches.</ui.P>
    <div style={{display:'flex',gap:6,marginBottom:10}}>
      {['raw','react'].map(m=><button key={m} onClick={()=>setMode(m)} style={{fontSize:12,padding:'5px 14px',borderRadius:7,cursor:'pointer',border:`0.5px solid ${mode===m?C.blueBd:C.border}`,background:mode===m?C.blueBg:'transparent',color:mode===m?C.blue:C.muted}}>{m==='raw'?'Raw JavaScript':'React-style abstraction'}</button>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div style={{background:C.surface2,borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11,color:C.text,lineHeight:1.75,whiteSpace:'pre-wrap',overflow:'auto',maxHeight:280}}>
        {mode==='raw'?RAW_CODE:REACT_CODE}
      </div>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>LIVE RESULT (same either way)</div>
        <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'12px'}}>
          <div style={{fontSize:13,color:C.muted,marginBottom:8}}>{items.length} item{items.length!==1?'s':''}</div>
          <div style={{display:'flex',gap:5,marginBottom:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Add item..." style={{flex:1,padding:'5px 8px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,fontSize:12}}/>
            <button onClick={add} style={{fontSize:12,padding:'5px 10px',borderRadius:6,border:'none',background:C.blue,color:'#fff',cursor:'pointer'}}>Add</button>
          </div>
          {items.map(item=><div key={item} onClick={()=>remove(item)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 8px',borderRadius:5,marginBottom:3,cursor:'pointer',background:C.surface2,fontSize:12,color:C.text}}>
            {item}<span style={{fontSize:10,color:C.hint}}>click to remove</span>
          </div>)}
        </div>
        <div style={{marginTop:8,background:mode==='raw'?C.redBg:C.greenBg,borderRadius:7,padding:'8px 10px',fontSize:11,color:mode==='raw'?C.red:C.green}}>
          {mode==='raw'?'Every feature requires manual DOM: create, append, remove, update. Each bug = a missing DOM operation.':'State change → automatic re-render. Add features by describing them, not by wiring up DOM.'}
        </div>
      </div>
    </div>
    <ui.Aha title="The abstraction bargain" C={C}>
      You give up: direct control of every DOM operation, zero overhead. You get: automatic DOM synchronisation, component reuse, massive ecosystem of libraries. For apps with more than a few interactive elements, the abstraction always wins — the complexity of manual DOM management grows faster than the app itself.
    </ui.Aha>
  </>
}

const PAGES=[PageAbstraction]
const PAGE_LABELS=['Raw vs Framework']
export default function WebLesson17_Abstraction({params={}}){
  const C=useColors();const[page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return<div style={{width:'100%',fontFamily:'sans-serif'}}>
    <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:12}}><PageComponent C={C}/></div>
  </div>
}
