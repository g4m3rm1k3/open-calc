import { useState, useEffect, useRef } from 'react'

function useColors() {
  const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg: dark?'#0f172a':'#f8fafc', surface: dark?'#1e293b':'#ffffff',
    surface2: dark?'#0f172a':'#f1f5f9', border: dark?'#334155':'#e2e8f0',
    text: dark?'#e2e8f0':'#1e293b', muted: dark?'#94a3b8':'#64748b', hint: dark?'#475569':'#94a3b8',
    blue: dark?'#38bdf8':'#0284c7', blueBg: dark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)', blueBd: dark?'#38bdf8':'#0284c7',
    amber: dark?'#fbbf24':'#d97706', amberBg: dark?'rgba(251,191,36,0.12)':'rgba(217,119,6,0.08)', amberBd: dark?'#fbbf24':'#d97706',
    green: dark?'#4ade80':'#16a34a', greenBg: dark?'rgba(74,222,128,0.12)':'rgba(22,163,74,0.08)', greenBd: dark?'#4ade80':'#16a34a',
    red: dark?'#f87171':'#dc2626', redBg: dark?'rgba(248,113,113,0.12)':'rgba(220,38,38,0.08)', redBd: dark?'#f87171':'#dc2626',
    purple: dark?'#a78bfa':'#7c3aed', purpleBg: dark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)', purpleBd: dark?'#a78bfa':'#7c3aed',
    teal: dark?'#2dd4bf':'#0d9488', tealBg: dark?'rgba(45,212,191,0.12)':'rgba(13,148,136,0.08)', tealBd: dark?'#2dd4bf':'#0d9488',
  }
}

function Tag({label,color,C}){const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>}
function Heading({children,C}){return<h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>}
function Para({children,C}){return<p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>}
function Strong({children}){return<span style={{fontWeight:500}}>{children}</span>}
function Callout({children,color,title,C}){const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>}
function AhaBox({title,children,C}){return<div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}
function WarnBox({title,children,C}){return<div style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.red,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.red,lineHeight:1.65}}>{children}</div></div>}
function CodeBox({children,C}){return<div style={{background:C.surface2,borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:C.text,lineHeight:1.9,marginBottom:10,whiteSpace:'pre-wrap'}}>{children}</div>}

// ── Event loop simulation ─────────────────────────────────────────────────────
const SCENARIOS = [
  {
    label:'setTimeout(fn, 0)',
    code:`console.log("A");          // runs now — synchronous
setTimeout(() => {            // schedules fn for task queue
  console.log("B");           // runs AFTER current stack clears
}, 0);
console.log("C");             // runs now — still synchronous

// Output: A, C, B
// Even though timeout is 0ms, B runs last`,
    steps:[
      {action:'Call stack: log("A")', stack:['log("A")'], queue:[], output:['A'], note:'Synchronous — runs immediately'},
      {action:'setTimeout schedules callback', stack:['setTimeout(fn,0)'], queue:[], output:['A'], note:'setTimeout itself runs synchronously, but the callback goes to the timer. Output not yet.'},
      {action:'Callback moved to task queue', stack:[], queue:['()=>{log("B")}'], output:['A'], note:'After 0ms (actually after current stack), callback enters the task queue'},
      {action:'Call stack: log("C")', stack:['log("C")'], queue:['()=>{log("B")}'], output:['A','C'], note:'Still synchronous. Stack is not empty yet.'},
      {action:'Stack empty — event loop checks queue', stack:[], queue:['()=>{log("B")}'], output:['A','C'], note:'Current synchronous code finished. Event loop: "is the stack empty? yes. is there a task? yes."'},
      {action:'Callback moves to stack and runs', stack:['log("B")'], queue:[], output:['A','C','B'], note:'The queued callback executes. B is logged last.'},
    ]
  },
  {
    label:'Promise vs setTimeout',
    code:`console.log("start");

setTimeout(() => console.log("timeout"), 0);   // task queue

Promise.resolve().then(() => console.log("promise")); // microtask queue

console.log("end");

// Output: start, end, promise, timeout
// Microtasks run before tasks — promises are always faster`,
    steps:[
      {action:'log("start") — synchronous', stack:['log("start")'], queue:[], micro:[], output:['start'], note:'Runs immediately, synchronously'},
      {action:'setTimeout schedules callback → task queue', stack:['setTimeout'], queue:['timeout cb'], micro:[], output:['start'], note:'setTimeout callback goes to the task queue (macrotask queue)'},
      {action:'Promise.resolve().then(...) → microtask queue', stack:['Promise.resolve()'], queue:['timeout cb'], micro:['promise cb'], output:['start'], note:'Resolved promise callbacks go to the microtask queue — a separate, higher-priority queue'},
      {action:'log("end") — synchronous', stack:['log("end")'], queue:['timeout cb'], micro:['promise cb'], output:['start','end'], note:'Still synchronous. The "end" runs before either callback.'},
      {action:'Stack empty — microtasks run first', stack:['promise cb'], queue:['timeout cb'], micro:[], output:['start','end','promise'], note:'Microtask queue drains completely before any task queue item runs'},
      {action:'Then task queue runs', stack:['timeout cb'], queue:[], micro:[], output:['start','end','promise','timeout'], note:'Only now does the setTimeout callback execute'},
    ]
  }
]

function EventLoopViz({scenario, C}) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)
  const maxStep = scenario.steps.length - 1
  const s = scenario.steps[Math.min(step, maxStep)]

  useEffect(()=>{
    if(playing){
      if(step>=maxStep){setPlaying(false);return}
      timerRef.current=setTimeout(()=>setStep(x=>x+1),1100)
      return()=>clearTimeout(timerRef.current)
    }
  },[playing,step])

  const reset=()=>{setStep(0);setPlaying(false)}
  const play=()=>{if(step>=maxStep)reset();setPlaying(true)}

  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div>
          <div style={{fontSize:10,color:C.hint,fontWeight:500,marginBottom:4}}>CALL STACK</div>
          <div style={{background:C.surface2,borderRadius:8,minHeight:80,padding:'8px',border:`0.5px solid ${C.border}`}}>
            {s.stack.map((item,i)=>(
              <div key={i} style={{background:C.blue,color:'#fff',borderRadius:5,padding:'5px 9px',marginBottom:4,fontFamily:'monospace',fontSize:11,textAlign:'center'}}>{item}</div>
            ))}
            {s.stack.length===0&&<div style={{fontSize:11,color:C.hint,textAlign:'center',paddingTop:8}}>empty</div>}
          </div>
        </div>
        <div>
          <div style={{fontSize:10,color:C.hint,fontWeight:500,marginBottom:4}}>TASK QUEUE{s.micro!==undefined?' (macrotask)':''}</div>
          <div style={{background:C.surface2,borderRadius:8,minHeight:s.micro!==undefined?40:80,padding:'8px',border:`0.5px solid ${C.border}`,marginBottom:s.micro!==undefined?4:0}}>
            {s.queue.map((item,i)=>(
              <div key={i} style={{background:C.amber,color:'#fff',borderRadius:5,padding:'5px 9px',marginBottom:4,fontFamily:'monospace',fontSize:11,textAlign:'center'}}>{item}</div>
            ))}
            {s.queue.length===0&&<div style={{fontSize:11,color:C.hint,textAlign:'center',paddingTop:4}}>empty</div>}
          </div>
          {s.micro!==undefined&&<>
            <div style={{fontSize:10,color:C.hint,fontWeight:500,marginBottom:4}}>MICROTASK QUEUE (promises)</div>
            <div style={{background:C.surface2,borderRadius:8,minHeight:40,padding:'8px',border:`0.5px solid ${C.purpleBd}`}}>
              {s.micro.map((item,i)=>(
                <div key={i} style={{background:C.purple,color:'#fff',borderRadius:5,padding:'5px 9px',marginBottom:4,fontFamily:'monospace',fontSize:11,textAlign:'center'}}>{item}</div>
              ))}
              {s.micro.length===0&&<div style={{fontSize:11,color:C.hint,textAlign:'center',paddingTop:4}}>empty</div>}
            </div>
          </>}
        </div>
      </div>
      <div style={{background:C.surface2,borderRadius:8,padding:'8px 12px',marginBottom:8,border:`0.5px solid ${C.border}`}}>
        <div style={{fontSize:10,color:C.hint,marginBottom:3}}>CONSOLE OUTPUT</div>
        <div style={{fontFamily:'monospace',fontSize:12,color:C.green,minHeight:20}}>
          {s.output.join(' → ')||(s.output.length===0?'(no output yet)':'')}
        </div>
      </div>
      <div style={{background:C.amberBg,borderRadius:8,padding:'8px 12px',marginBottom:8,border:`0.5px solid ${C.amberBd}`}}>
        <div style={{fontSize:11,fontWeight:500,color:C.amber,marginBottom:2}}>{s.action}</div>
        <div style={{fontSize:11,color:C.amber,opacity:.9}}>{s.note}</div>
      </div>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <button onClick={reset} style={{fontSize:12,padding:'5px 12px',borderRadius:7,border:`0.5px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer'}}>Reset</button>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{fontSize:12,padding:'5px 12px',borderRadius:7,border:`0.5px solid ${C.border}`,background:'transparent',color:C.text,cursor:step===0?'default':'pointer',opacity:step===0?.3:1}}>← Step</button>
        <button onClick={()=>setStep(s=>Math.min(maxStep,s+1))} disabled={step===maxStep} style={{fontSize:12,padding:'5px 12px',borderRadius:7,border:`0.5px solid ${C.border}`,background:'transparent',color:C.text,cursor:step===maxStep?'default':'pointer',opacity:step===maxStep?.3:1}}>Step →</button>
        <button onClick={playing?()=>setPlaying(false):play} style={{fontSize:12,padding:'5px 14px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:'pointer'}}>
          {playing?'Pause':'▶ Play'}
        </button>
        <span style={{fontSize:11,color:C.hint}}>{step+1}/{maxStep+1}</span>
      </div>
    </div>
  )
}

function PageEventLoop({C}){
  const [sc,setSc]=useState(0)
  return<>
    <Tag label="Lesson 9 — Event Loop" color="blue" C={C}/>
    <Heading C={C}>JavaScript is single-threaded — it can only do one thing at a time</Heading>
    <Para C={C}>JavaScript has one call stack. Only one function runs at a time. But the browser can do things while JS is idle — timers, network requests, user clicks. When those finish, their callbacks wait in a <Strong>queue</Strong>. The event loop's job is to move callbacks from the queue to the stack when the stack is empty.</Para>
    <div style={{display:'flex',gap:5,marginBottom:10}}>
      {SCENARIOS.map((s,i)=><button key={i} onClick={()=>setSc(i)} style={{fontSize:11,padding:'4px 12px',borderRadius:7,cursor:'pointer',border:`0.5px solid ${sc===i?C.blueBd:C.border}`,background:sc===i?C.blueBg:'transparent',color:sc===i?C.blue:C.muted,fontWeight:sc===i?500:400}}>{s.label}</button>)}
    </div>
    <CodeBox C={C}>{SCENARIOS[sc].code}</CodeBox>
    <EventLoopViz key={sc} scenario={SCENARIOS[sc]} C={C}/>
    <AhaBox title="The rule: stack must be empty before queue runs" C={C}>
      The event loop only moves a task from the queue to the stack when the stack is completely empty. This means: no matter how long your setTimeout delay is, the callback cannot run until the current synchronous code finishes. A setTimeout(fn, 0) does not mean "run immediately" — it means "run as soon as the stack is empty."
    </AhaBox>
  </>
}

function PageBlocking({C}){
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(0)
  const [blocked, setBlocked] = useState(false)

  const runNormal = () => {
    setCount(0)
    setRunning(true)
    let i=0
    const tick = () => {
      if(i>=10){setRunning(false);return}
      setTimeout(()=>{setCount(++i);tick()},100)
    }
    tick()
  }

  const runBlocked = () => {
    setBlocked(true)
    setCount(0)
    // Simulate what blocking looks like in explanation
    setTimeout(()=>{
      setBlocked(false)
      setCount(10)
    }, 2000)
  }

  return<>
    <Tag label="Lesson 9 — Blocking" color="red" C={C}/>
    <Heading C={C}>Blocking the stack freezes everything — the UI goes dead</Heading>
    <Para C={C}>Because JS is single-threaded, <Strong>any synchronous code that runs for a long time blocks the entire browser</Strong>. No clicks register. No animations play. No network responses are processed. The page is frozen.</Para>
    <Para C={C}>This is why you never see long loops in good JavaScript — and why async exists.</Para>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div style={{background:C.greenBg,border:`0.5px solid ${C.greenBd}`,borderRadius:10,padding:'12px'}}>
        <div style={{fontSize:12,fontWeight:500,color:C.green,marginBottom:8}}>Non-blocking (correct)</div>
        <CodeBox C={C}>{`// Each step is a separate task
function processItem(i) {
  doWork(i)
  if (i < 1000) {
    setTimeout(() => processItem(i+1), 0)
  }
}`}</CodeBox>
        <div style={{fontSize:12,color:C.green,marginBottom:8}}>Counter updating without blocking UI:</div>
        <div style={{fontFamily:'monospace',fontSize:28,color:C.green,marginBottom:8}}>{running?count:'-'}</div>
        <button onClick={runNormal} disabled={running} style={{fontSize:12,padding:'6px 14px',borderRadius:7,border:'none',background:C.green,color:'#fff',cursor:running?'default':'pointer',opacity:running?.6:1}}>Run</button>
      </div>
      <div style={{background:C.redBg,border:`0.5px solid ${C.redBd}`,borderRadius:10,padding:'12px'}}>
        <div style={{fontSize:12,fontWeight:500,color:C.red,marginBottom:8}}>Blocking (wrong)</div>
        <CodeBox C={C}>{`// One giant synchronous loop
for (let i = 0; i < 1000000; i++) {
  doWork(i)    // freezes browser
}              // for entire duration`}</CodeBox>
        <div style={{fontSize:12,color:C.red,marginBottom:8}}>{blocked?'UI frozen — you cannot click anything':'Click to simulate blocking:'}</div>
        <div style={{fontFamily:'monospace',fontSize:28,color:C.red,marginBottom:8}}>{blocked?'⚠ FROZEN':'-'}</div>
        <button onClick={runBlocked} disabled={blocked} style={{fontSize:12,padding:'6px 14px',borderRadius:7,border:'none',background:C.red,color:'#fff',cursor:blocked?'default':'pointer',opacity:blocked?.6:1}}>{blocked?'Unblocking...':'Simulate block'}</button>
      </div>
    </div>
    <WarnBox title="Why setTimeout(fn, 0) is a real pattern, not a hack" C={C}>
      Wrapping expensive work in setTimeout(fn, 0) deliberately yields control back to the event loop after each chunk. The browser can process a paint frame, a click event, or a scroll event between each chunk. It is not a hack — it is the correct way to do long-running work without freezing the UI.
    </WarnBox>
    <Callout color="blue" title="Web Workers: true parallelism" C={C}>
      For truly heavy computation, Web Workers run JS in a separate thread with its own event loop. They cannot touch the DOM directly, but can pass messages back to the main thread. They are the right answer when setTimeout chunking is not enough.
    </Callout>
  </>
}

const PAGES=[PageEventLoop,PageBlocking]
const PAGE_LABELS=['Step through it','Blocking']

export default function WebLesson09_EventLoop({params={}}){
  const C=useColors()
  const [page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return(
    <div style={{width:'100%',fontFamily:'sans-serif'}}>
      <div style={{display:'flex',gap:4,marginBottom:6}}>
        {PAGE_LABELS.map((_,i)=><div key={i} onClick={()=>setPage(i)} style={{flex:1,height:4,borderRadius:2,cursor:'pointer',transition:'background .25s',background:i<page?C.blue:i===page?C.amber:C.border}}/>)}
      </div>
      <div style={{display:'flex',gap:5,marginBottom:10}}>
        {PAGE_LABELS.map((label,i)=><button key={i} onClick={()=>setPage(i)} style={{fontSize:11,padding:'2px 8px',borderRadius:6,cursor:'pointer',border:`0.5px solid ${i===page?C.amberBd:C.border}`,background:i===page?C.amberBg:'transparent',color:i===page?C.amber:C.hint}}>{label}</button>)}
      </div>
      <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:12}}>
        <PageComponent C={C}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button disabled={page===0} onClick={()=>setPage(p=>p-1)} style={{fontSize:13,padding:'7px 18px',borderRadius:8,cursor:page===0?'default':'pointer',border:`0.5px solid ${C.border}`,background:'transparent',color:C.text,opacity:page===0?0.3:1}}>← Back</button>
        <span style={{fontSize:12,color:C.hint}}>{page+1} / {PAGES.length}</span>
        <button disabled={page===PAGES.length-1} onClick={()=>setPage(p=>p+1)} style={{fontSize:13,padding:'7px 18px',borderRadius:8,cursor:page===PAGES.length-1?'default':'pointer',border:'none',background:C.text,color:C.bg,opacity:page===PAGES.length-1?0.3:1}}>Next →</button>
      </div>
    </div>
  )
}
