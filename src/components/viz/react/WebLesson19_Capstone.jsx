import { useState, useEffect, useRef } from 'react'
function useColors(){const isDark=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('dark');const[dark,setDark]=useState(isDark);useEffect(()=>{const obs=new MutationObserver(()=>setDark(isDark()));obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return()=>obs.disconnect()},[]);return{bg:dark?'#0f172a':'#f8fafc',surface:dark?'#1e293b':'#ffffff',surface2:dark?'#0f172a':'#f1f5f9',border:dark?'#334155':'#e2e8f0',text:dark?'#e2e8f0':'#1e293b',muted:dark?'#94a3b8':'#64748b',hint:dark?'#475569':'#94a3b8',blue:dark?'#38bdf8':'#0284c7',blueBg:dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)',blueBd:dark?'#38bdf8':'#0284c7',amber:dark?'#fbbf24':'#d97706',amberBg:dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)',amberBd:dark?'#fbbf24':'#d97706',green:dark?'#4ade80':'#16a34a',greenBg:dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)',greenBd:dark?'#4ade80':'#16a34a',red:dark?'#f87171':'#dc2626',redBg:dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)',redBd:dark?'#f87171':'#dc2626',purple:dark?'#a78bfa':'#7c3aed',purpleBg:dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)',purpleBd:dark?'#a78bfa':'#7c3aed',teal:dark?'#2dd4bf':'#0d9488',tealBg:dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)',tealBd:dark?'#2dd4bf':'#0d9488'}}

// ─── A full mini-dashboard that uses every concept from the course ─────────────
// Layer annotations show which concept each piece uses

const FAKE_DB = {
  users:[
    {id:1,name:'Alice Chen',role:'admin',active:true,score:92},
    {id:2,name:'Bob Martin',role:'user',active:true,score:74},
    {id:3,name:'Carol White',role:'moderator',active:false,score:88},
    {id:4,name:'Dave Kim',role:'user',active:true,score:55},
    {id:5,name:'Eve Ross',role:'user',active:true,score:81},
  ],
  metrics:{totalSessions:1842,avgScore:78,activeNow:3}
}

function MetricCard({label,value,color,C}){
  return<div style={{background:C.surface2,borderRadius:10,padding:'12px 14px',border:`0.5px solid ${C.border}`}}>
    <div style={{fontSize:11,color:C.hint,marginBottom:4}}>{label}</div>
    <div style={{fontSize:22,fontWeight:500,color:color||C.text}}>{value}</div>
  </div>
}

function UserRow({user,onToggle,C}){
  const roleColors={admin:[C.purpleBg,C.purple],moderator:[C.amberBg,C.amber],user:[C.surface2,C.muted]}
  const [rbg,rtc]=roleColors[user.role]||roleColors.user
  return<div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:C.surface2,borderRadius:8,marginBottom:5}}>
    <div style={{width:28,height:28,borderRadius:'50%',background:user.active?C.greenBg:C.surface2,border:`0.5px solid ${user.active?C.greenBd:C.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,color:user.active?C.green:C.hint,flexShrink:0}}>{user.name[0]}</div>
    <div style={{flex:1}}>
      <div style={{fontSize:12,fontWeight:500,color:C.text}}>{user.name}</div>
    </div>
    <span style={{fontSize:10,padding:'1px 7px',borderRadius:8,background:rbg,color:rtc}}>{user.role}</span>
    <div style={{fontFamily:'monospace',fontSize:12,color:user.score>=80?C.green:user.score>=60?C.amber:C.red,minWidth:28,textAlign:'right'}}>{user.score}</div>
    <button onClick={()=>onToggle(user.id)} style={{fontSize:10,padding:'2px 8px',borderRadius:5,cursor:'pointer',border:`0.5px solid ${user.active?C.greenBd:C.border}`,background:user.active?C.greenBg:'transparent',color:user.active?C.green:C.hint}}>{user.active?'active':'inactive'}</button>
  </div>
}

function PageCapstone({C}){
  // ─ STATE LAYER ─
  const [loadStatus,setLoadStatus]=useState('idle')
  const [users,setUsers]=useState([])
  const [metrics,setMetrics]=useState(null)
  const [filter,setFilter]=useState('all')
  const [sort,setSort]=useState('name')
  const [layer,setLayer]=useState(null)
  const timerRef=useRef(null)

  // ─ DATA LAYER ─
  const loadData=()=>{
    setLoadStatus('loading')
    clearTimeout(timerRef.current)
    timerRef.current=setTimeout(()=>{
      setUsers(FAKE_DB.users)
      setMetrics(FAKE_DB.metrics)
      setLoadStatus('success')
    },900)
  }

  // ─ LOGIC LAYER ─
  const toggleUser=id=>setUsers(u=>u.map(x=>x.id===id?{...x,active:!x.active}:x))

  const filteredUsers=users
    .filter(u=>filter==='all'||u.active===(filter==='active'))
    .sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):b.score-a.score)

  const LAYER_INFO={
    dom:{color:C.blue,label:'DOM Layer',desc:'HTML structure — the tree of elements. Every div, button, and span you see is a DOM node. JS manipulates this tree to update the page.'},
    state:{color:C.amber,label:'State Layer',desc:'loadStatus, users, metrics, filter, sort — all the values that can change. When state changes, the UI re-renders automatically to match.'},
    events:{color:C.green,label:'Events Layer',desc:'User clicks, input changes, button presses. Each fires an event that calls a handler, which updates state, which updates the UI.'},
    async:{color:C.purple,label:'Async Layer',desc:'loadData() uses a simulated async call (setTimeout = fake network). Real apps use fetch(). The loading/success states come from this layer.'},
    components:{color:C.teal,label:'Components Layer',desc:'MetricCard and UserRow are reusable components — defined once, used multiple times with different props. The dashboard is a tree of components.'},
  }

  const sel=layer?LAYER_INFO[layer]:null

  return<div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
      <div style={{fontSize:14,fontWeight:500,color:C.text}}>Dashboard — every lesson, one app</div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {Object.entries(LAYER_INFO).map(([k,v])=><button key={k} onClick={()=>setLayer(layer===k?null:k)} style={{fontSize:10,padding:'2px 8px',borderRadius:5,cursor:'pointer',border:`0.5px solid ${layer===k?v.color:C.border}`,background:layer===k?v.color+'22':'transparent',color:layer===k?v.color:C.hint}}>{v.label.split(' ')[0]}</button>)}
      </div>
    </div>

    {sel&&<div style={{background:sel.color+'11',border:`0.5px solid ${sel.color}`,borderRadius:8,padding:'8px 12px',marginBottom:10}}>
      <div style={{fontSize:12,fontWeight:500,color:sel.color,marginBottom:3}}>{sel.label}</div>
      <div style={{fontSize:11,color:sel.color,opacity:.9}}>{sel.desc}</div>
    </div>}

    {loadStatus==='idle'&&<div style={{textAlign:'center',padding:'24px',color:C.muted}}>
      <div style={{fontSize:13,marginBottom:10}}>Dashboard not loaded</div>
      <button onClick={loadData} style={{fontSize:13,padding:'8px 20px',borderRadius:8,border:'none',background:C.blue,color:'#fff',cursor:'pointer'}}>Load Dashboard</button>
    </div>}

    {loadStatus==='loading'&&<div style={{textAlign:'center',padding:'24px',color:C.amber}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:24,height:24,borderRadius:'50%',border:`2px solid ${C.amber}`,borderTopColor:'transparent',animation:'spin 1s linear infinite',margin:'0 auto 10px'}}/>
      <div style={{fontSize:12}}>Loading data from API...</div>
    </div>}

    {loadStatus==='success'&&metrics&&<>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
        <MetricCard label="Total sessions" value={metrics.totalSessions.toLocaleString()} color={C.blue} C={C}/>
        <MetricCard label="Avg score" value={metrics.avgScore} color={C.green} C={C}/>
        <MetricCard label="Active now" value={metrics.activeNow} color={C.amber} C={C}/>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:4}}>
          {['all','active','inactive'].map(f=><button key={f} onClick={()=>setFilter(f)} style={{fontSize:11,padding:'3px 9px',borderRadius:6,cursor:'pointer',border:`0.5px solid ${filter===f?C.blueBd:C.border}`,background:filter===f?C.blueBg:'transparent',color:filter===f?C.blue:C.hint}}>{f}</button>)}
        </div>
        <div style={{display:'flex',gap:4}}>
          {['name','score'].map(s=><button key={s} onClick={()=>setSort(s)} style={{fontSize:11,padding:'3px 9px',borderRadius:6,cursor:'pointer',border:`0.5px solid ${sort===s?C.amberBd:C.border}`,background:sort===s?C.amberBg:'transparent',color:sort===s?C.amber:C.hint}}>sort: {s}</button>)}
        </div>
      </div>
      <div>
        {filteredUsers.map(u=><UserRow key={u.id} user={u} onToggle={toggleUser} C={C}/>)}
        {filteredUsers.length===0&&<div style={{fontSize:11,color:C.hint,padding:'12px 0',textAlign:'center'}}>No {filter} users</div>}
      </div>
      <button onClick={loadData} style={{marginTop:10,fontSize:11,padding:'4px 12px',borderRadius:6,border:`0.5px solid ${C.border}`,background:'transparent',color:C.hint,cursor:'pointer'}}>Reload</button>
    </>}
  </div>
}

function PageConceptMap({C}){
  const lessons=[
    {num:'1',label:'DOM Tree',desc:'Every element is a node in a tree',color:C.blue},
    {num:'2',label:'HTML',desc:'Structure and semantic meaning',color:C.blue},
    {num:'3',label:'CSS Cascade',desc:'Specificity resolves conflicts',color:C.blue},
    {num:'4',label:'Layout',desc:'Box model, Flex, Grid',color:C.blue},
    {num:'5',label:'Variables',desc:'State lives in named memory',color:C.amber},
    {num:'6',label:'Functions',desc:'Input → output transformations',color:C.amber},
    {num:'7',label:'Events',desc:'Code reacts to user actions',color:C.amber},
    {num:'8',label:'DOM Manipulation',desc:'JS changes the tree',color:C.amber},
    {num:'9',label:'Event Loop',desc:'Single thread, task queue',color:C.purple},
    {num:'10',label:'Async',desc:'Promises and async/await',color:C.purple},
    {num:'11',label:'State→UI',desc:'UI = f(state)',color:C.green},
    {num:'12',label:'Components',desc:'Reusable, encapsulated pieces',color:C.green},
    {num:'13',label:'Reactive',desc:'Describe, don\'t tell',color:C.green},
    {num:'14',label:'APIs',desc:'Request → Response → JSON',color:C.teal},
    {num:'15',label:'State+Async',desc:'idle→loading→done|error',color:C.teal},
    {num:'16',label:'Performance',desc:'Layout→Paint→Composite',color:C.red},
    {num:'17',label:'Abstraction',desc:'Frameworks handle the plumbing',color:C.purple},
    {num:'18',label:'Architecture',desc:'UI / Logic / Data layers',color:C.purple},
  ]
  return<>
    <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:10}}>The full map — everything you have learned</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:12}}>
      {lessons.map(l=><div key={l.num} style={{background:C.surface2,borderRadius:8,padding:'8px 10px',border:`0.5px solid ${l.color}33`}}>
        <div style={{display:'flex',gap:5,alignItems:'baseline',marginBottom:2}}>
          <span style={{fontFamily:'monospace',fontSize:10,color:l.color}}>{l.num}</span>
          <span style={{fontSize:11,fontWeight:500,color:C.text}}>{l.label}</span>
        </div>
        <div style={{fontSize:10,color:C.hint,lineHeight:1.4}}>{l.desc}</div>
      </div>)}
    </div>
    <div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem'}}>
      <div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>The through-line</div>
      <div style={{fontSize:13,color:C.green,lineHeight:1.65}}>
        HTML builds a tree (DOM). CSS styles the tree. JavaScript reads events, changes state, and updates the tree. The event loop schedules when code runs. Components encapsulate reusable pieces. State drives UI automatically. Async patterns handle delays. Architecture organises how it all fits together. Every concept is one piece of the same system — how interactive software works.
      </div>
    </div>
  </>
}

const PAGES=[PageCapstone,PageConceptMap]
const PAGE_LABELS=['Full dashboard','Concept map']
export default function WebLesson19_Capstone({params={}}){
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
