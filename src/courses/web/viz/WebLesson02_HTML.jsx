import { useState, useEffect } from 'react'

function useColors() {
  const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',
    border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',
    blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',
    amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',
    green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',
    red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',
    purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',
    teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488',
  }
}
const ui={
  Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},
  H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,
  P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,
  Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},
  Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>,
  Warn:({title,children,C})=><div style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.red,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.red,lineHeight:1.65}}>{children}</div></div>,
}

const SEMANTIC = [
  {bad:'<div id="nav">',good:'<nav>',why:'Tells browsers and screen readers "this is navigation". Keyboard users can jump directly to it.'},
  {bad:'<div class="header">',good:'<header>',why:'Marks the page header. Screen readers announce it. Search engines weight it differently.'},
  {bad:'<div class="main">',good:'<main>',why:'The primary content. There should be only one <main>. Screen readers can skip to it.'},
  {bad:'<div class="article">',good:'<article>',why:'Self-contained content that could be syndicated independently (a blog post, a news story).'},
  {bad:'<span onclick="...">',good:'<button>',why:'Buttons get keyboard focus, Enter/Space activation, and ARIA role="button" for free.'},
  {bad:'<div onclick="...">',good:'<a href="...">',why:'Links are keyboard navigable, right-clickable, openable in new tabs. Divs are none of these.'},
]

function PageSemantic({C}){
  const [idx,setIdx]=useState(0)
  const item=SEMANTIC[idx]
  return<>
    <ui.Tag label="Lesson 2 — Semantic HTML" color="blue" C={C}/>
    <ui.H C={C}>HTML defines meaning, not appearance</ui.H>
    <ui.P C={C}>Two pages can look identical but have completely different HTML. The one with semantic tags tells the browser, search engines, and assistive technology <strong style={{fontWeight:500}}>what each piece of content is</strong> — not just how it looks.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
      <div style={{background:C.redBg,border:`0.5px solid ${C.redBd}`,borderRadius:8,padding:'10px 12px'}}>
        <div style={{fontSize:10,color:C.red,fontWeight:500,marginBottom:6}}>NON-SEMANTIC (invisible to machines)</div>
        {SEMANTIC.map((s,i)=><div key={i} onClick={()=>setIdx(i)} style={{fontFamily:'monospace',fontSize:12,color:idx===i?C.red:C.hint,padding:'2px 6px',borderRadius:4,cursor:'pointer',background:idx===i?C.redBg:'transparent',marginBottom:2}}>{s.bad}</div>)}
      </div>
      <div style={{background:C.greenBg,border:`0.5px solid ${C.greenBd}`,borderRadius:8,padding:'10px 12px'}}>
        <div style={{fontSize:10,color:C.green,fontWeight:500,marginBottom:6}}>SEMANTIC (meaningful)</div>
        {SEMANTIC.map((s,i)=><div key={i} onClick={()=>setIdx(i)} style={{fontFamily:'monospace',fontSize:12,color:idx===i?C.green:C.hint,padding:'2px 6px',borderRadius:4,cursor:'pointer',background:idx===i?C.greenBg:'transparent',marginBottom:2}}>{s.good}</div>)}
      </div>
    </div>
    <div style={{background:C.surface2,borderRadius:10,padding:'12px 14px',marginBottom:10}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
        <code style={{fontFamily:'monospace',fontSize:13,color:C.red}}>{item.bad}</code>
        <span style={{color:C.hint}}>→</span>
        <code style={{fontFamily:'monospace',fontSize:13,color:C.green}}>{item.good}</code>
      </div>
      <p style={{fontSize:12,color:C.muted,lineHeight:1.6,margin:0}}>{item.why}</p>
    </div>
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,color:C.hint,marginBottom:6}}>What a screen reader announces:</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div style={{background:C.redBg,borderRadius:8,padding:'10px 12px',fontFamily:'monospace',fontSize:11,color:C.red}}>
          {'"div" — no role announced'}<br/>
          {'"click on me" — how do I activate?'}<br/>
          {'"div" — just a generic container'}
        </div>
        <div style={{background:C.greenBg,borderRadius:8,padding:'10px 12px',fontFamily:'monospace',fontSize:11,color:C.green}}>
          {'"navigation" — landmark region'}<br/>
          {'"Subscribe, button" — press Enter'}<br/>
          {'"main content" — skip here'}
        </div>
      </div>
    </div>
    <ui.Aha title="HTML is an API for browsers, not a visual format" C={C}>
      CSS controls how things look. HTML controls what things are. A blind user's screen reader, Google's crawler, and a browser's reader mode all parse the HTML — none of them see the visual result. Semantic HTML is the contract between your content and any system that processes it.
    </ui.Aha>
  </>
}

const NESTING_TREE = {
  valid: [
    {tag:'article',children:[
      {tag:'h2',text:'Blog Post Title'},
      {tag:'p',text:'First paragraph...'},
      {tag:'ul',children:[
        {tag:'li',text:'Item one'},
        {tag:'li',text:'Item two'},
      ]},
    ]},
  ],
  broken: [
    {tag:'p',children:[
      {tag:'p',text:'Paragraph inside paragraph'},
    ]},
    {tag:'ul',children:[
      {tag:'div',text:'div inside ul (not li!)'},
    ]},
  ]
}

function RenderTree({nodes,depth=0,C}){
  const colorMap={article:[C.tealBg,C.teal],h2:[C.purpleBg,C.purple],p:[C.blueBg,C.blue],ul:[C.amberBg,C.amber],li:[C.greenBg,C.green],div:[C.redBg,C.red]}
  return<div style={{paddingLeft:depth>0?16:0}}>{nodes.map((n,i)=>{
    const [bg,tc]=colorMap[n.tag]||[C.surface2,C.muted]
    return<div key={i} style={{marginBottom:4}}>
      <div style={{display:'flex',alignItems:'center',gap:5}}>
        <span style={{fontFamily:'monospace',fontSize:11,color:tc,background:bg,padding:'2px 7px',borderRadius:4}}>{'<'+n.tag+'>'}</span>
        {n.text&&<span style={{fontSize:11,color:C.muted}}>{n.text}</span>}
      </div>
      {n.children&&<RenderTree nodes={n.children} depth={depth+1} C={C}/>}
    </div>
  })}</div>
}

function PageNesting({C}){
  const [mode,setMode]=useState('valid')
  return<>
    <ui.Tag label="Lesson 2 — Nesting rules" color="amber" C={C}/>
    <ui.H C={C}>Not everything can go inside everything — nesting has rules</ui.H>
    <ui.P C={C}>HTML elements have content models. Some can only contain certain types of children. Breaking these rules causes the browser to silently fix the tree in unpredictable ways.</ui.P>
    <div style={{display:'flex',gap:6,marginBottom:10}}>
      {['valid','broken'].map(m=><button key={m} onClick={()=>setMode(m)} style={{fontSize:12,padding:'5px 14px',borderRadius:7,cursor:'pointer',border:`0.5px solid ${mode===m?(m==='valid'?C.greenBd:C.redBd):C.border}`,background:mode===m?(m==='valid'?C.greenBg:C.redBg):'transparent',color:mode===m?(m==='valid'?C.green:C.red):C.muted}}>{m==='valid'?'Valid nesting':'Broken nesting'}</button>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div style={{background:C.surface2,borderRadius:8,padding:'10px 12px'}}>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>TREE STRUCTURE</div>
        <RenderTree nodes={NESTING_TREE[mode]} C={C}/>
      </div>
      <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'10px 12px'}}>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>BROWSER RENDERS</div>
        {mode==='valid'?
          <div>
            <h4 style={{margin:0,marginBottom:6,fontSize:14,color:C.text}}>Blog Post Title</h4>
            <p style={{margin:0,marginBottom:6,fontSize:12,color:C.muted}}>First paragraph...</p>
            <ul style={{margin:0,paddingLeft:16,fontSize:12,color:C.muted}}><li>Item one</li><li>Item two</li></ul>
          </div>:
          <div>
            <p style={{fontSize:12,color:C.red,margin:0,marginBottom:4}}>⚠ Browser auto-fixes tree</p>
            <p style={{fontSize:11,color:C.muted,margin:0,marginBottom:4}}>{'<p> inside <p>'} → browser closes first p early</p>
            <p style={{fontSize:11,color:C.muted,margin:0}}>{'<div> inside <ul>'} → unpredictable rendering</p>
          </div>
        }
      </div>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
      {[
        {rule:'<ul> and <ol> can only contain <li>',ok:true},
        {rule:'<p> cannot contain block elements (<div>,<h1>,<ul>...)',ok:false},
        {rule:'<li> can contain anything — text, images, nested lists',ok:true},
        {rule:'<button> cannot contain another <button>',ok:false},
        {rule:'<a> cannot contain another <a>',ok:false},
        {rule:'<table> must have <tr> → <td>/<th> structure',ok:false},
      ].map((r,i)=><div key={i} style={{display:'flex',gap:8,alignItems:'center',background:C.surface2,borderRadius:6,padding:'6px 10px'}}>
        <span style={{fontSize:12,color:r.ok?C.green:C.red,minWidth:14}}>{r.ok?'✓':'✗'}</span>
        <span style={{fontFamily:'monospace',fontSize:11,color:C.text}}>{r.rule}</span>
      </div>)}
    </div>
    <ui.Warn title="Why broken nesting causes mysterious bugs" C={C}>
      The browser's auto-correction algorithm is not standardized. Different browsers fix broken HTML differently. A {'<p>'} inside a {'<p>'} might become two sibling {'<p>'} elements in Chrome but something else in Safari. Always validate your nesting — your mental model of the tree must match what the browser actually builds.
    </ui.Warn>
  </>
}

const PAGES=[PageSemantic,PageNesting]
const PAGE_LABELS=['Semantic meaning','Nesting rules']
export default function WebLesson02_HTML({params={}}){
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
