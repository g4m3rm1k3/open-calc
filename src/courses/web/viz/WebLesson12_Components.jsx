import { useState, useEffect } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}

const CARD_DATA = [
  {name:'Alice Chen',role:'Frontend Engineer',avatar:'AC',online:true,tags:['React','TypeScript']},
  {name:'Bob Martin',role:'Backend Engineer',avatar:'BM',online:false,tags:['Node','PostgreSQL']},
  {name:'Carol White',role:'Designer',avatar:'CW',online:true,tags:['Figma','CSS']},
  {name:'Dave Kim',role:'DevOps',avatar:'DK',online:true,tags:['Docker','AWS']},
]

function UserCard({name,role,avatar,online,tags,C}){
  return<div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:10,padding:'12px 14px',display:'flex',flexDirection:'column',gap:6}}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:36,height:36,borderRadius:'50%',background:C.blueBg,border:`0.5px solid ${C.blueBd}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:500,color:C.blue,flexShrink:0}}>{avatar}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:500,color:C.text}}>{name}</div>
        <div style={{fontSize:11,color:C.muted}}>{role}</div>
      </div>
      <div style={{width:8,height:8,borderRadius:'50%',background:online?C.green:C.hint}}/>
    </div>
    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
      {tags.map(t=><span key={t} style={{fontSize:10,padding:'1px 7px',borderRadius:8,background:C.surface2,color:C.muted,border:`0.5px solid ${C.border}`}}>{t}</span>)}
    </div>
  </div>
}

function PageComponents({C}){
  const [highlighted,setHighlighted]=useState(null)
  const [editIdx,setEditIdx]=useState(null)
  const [cards,setCards]=useState(CARD_DATA)
  const toggleOnline=i=>setCards(c=>c.map((card,j)=>j===i?{...card,online:!card.online}:card))

  return<>
    <ui.Tag label="Lesson 12 — Components" color="blue" C={C}/>
    <ui.H C={C}>A component is a reusable piece of UI — one definition, many instances</ui.H>
    <ui.P C={C}>The UserCard below is one component defined once. It's used four times with different data (props). Change the data, the UI changes. The structure, behaviour, and styling are all encapsulated in one place.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
      {cards.map((card,i)=>(
        <div key={i} onMouseEnter={()=>setHighlighted(i)} onMouseLeave={()=>setHighlighted(null)} style={{outline:highlighted===i?`2px solid ${C.amber}`:'2px solid transparent',borderRadius:12,transition:'outline .15s',cursor:'pointer'}} onClick={()=>toggleOnline(i)}>
          <UserCard {...card} C={C}/>
        </div>
      ))}
    </div>
    <div style={{background:C.surface2,borderRadius:8,padding:'10px 14px',marginBottom:10,fontFamily:'monospace',fontSize:12,color:C.text,lineHeight:1.9}}>
      {`// One component definition
function UserCard({ name, role, avatar, online, tags }) {
  return <div>...</div>  // same structure every time
}

// Four usages — each with different props
<UserCard name="Alice" role="Frontend" online={true} />
<UserCard name="Bob"   role="Backend"  online={false} />
<UserCard name="Carol" role="Designer" online={true} />`}
    </div>
    <ui.Callout color="amber" title="Click any card to toggle online status" C={C}>
      Each card manages its own data independently. Toggling one does not affect others. This is encapsulation — each component instance has its own state, isolated from siblings.
    </ui.Callout>
    <ui.Aha title="Components are the unit of reuse in modern UI" C={C}>
      Without components, you copy-paste HTML for every card — 100 users means 100 copies of the same markup. When the design changes you update 100 places. With components, you update one definition and all 100 instances update. This is why React, Vue, and Svelte are built around the component model.
    </ui.Aha>
  </>
}

function PageProps({C}){
  const [name,setName]=useState('Alice')
  const [role,setRole]=useState('Frontend Engineer')
  const [online,setOnline]=useState(true)
  const [tags,setTags]=useState('React,TypeScript')
  const tagArr=tags.split(',').map(t=>t.trim()).filter(Boolean)

  return<>
    <ui.Tag label="Lesson 12 — Props" color="amber" C={C}/>
    <ui.H C={C}>Props are the inputs to a component — data flows down</ui.H>
    <ui.P C={C}>Props (properties) are how you pass data into a component. They are read-only — a component receives props but does not modify them. Edit the props below and watch the card update.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:10}}>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {[{label:'name',val:name,set:setName},{label:'role',val:role,set:setRole},{label:'tags (comma separated)',val:tags,set:setTags}].map(f=>(
          <div key={f.label}>
            <div style={{fontSize:11,color:C.hint,marginBottom:3,fontFamily:'monospace'}}>{f.label}</div>
            <input value={f.val} onChange={e=>f.set(e.target.value)} style={{width:'100%',padding:'6px 10px',borderRadius:7,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text,fontSize:12,fontFamily:'monospace'}}/>
          </div>
        ))}
        <div>
          <div style={{fontSize:11,color:C.hint,marginBottom:3,fontFamily:'monospace'}}>online</div>
          <button onClick={()=>setOnline(!online)} style={{fontSize:12,padding:'5px 14px',borderRadius:7,cursor:'pointer',border:`0.5px solid ${online?C.greenBd:C.border}`,background:online?C.greenBg:'transparent',color:online?C.green:C.muted}}>{online?'true':'false'}</button>
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>LIVE COMPONENT OUTPUT</div>
        <UserCard name={name||'(empty)'} role={role||'(empty)'} avatar={(name||'?')[0].toUpperCase()+(name||'?')[1]?.toUpperCase()||'?'} online={online} tags={tagArr} C={C}/>
        <div style={{marginTop:8,background:C.surface2,borderRadius:7,padding:'8px 10px',fontFamily:'monospace',fontSize:11,color:C.text,lineHeight:1.8}}>
          {`<UserCard\n  name="${name}"\n  role="${role}"\n  online={${online}}\n  tags={[${tagArr.map(t=>`"${t}"`).join(',')}]}\n/>`}
        </div>
      </div>
    </div>
    <ui.Callout color="blue" title="Data flows one way: parent → child via props" C={C}>
      A parent passes data down to children as props. Children cannot directly change their parent's state. If a child needs to signal something upward (like a button click), the parent passes a callback function as a prop, and the child calls it. This one-way flow makes data tracing predictable.
    </ui.Callout>
  </>
}

const PAGES=[PageComponents,PageProps]
const PAGE_LABELS=['Reuse','Props']
export default function WebLesson12_Components({params={}}){
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
