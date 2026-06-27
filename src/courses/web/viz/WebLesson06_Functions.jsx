import { useState, useEffect } from 'react'

import { useThemeColors } from '../../../hooks/useThemeColors';
const ui={Tag:({label,color,C})=>{const m={blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber],green:[C.greenBg,C.green],red:[C.redBg,C.red],purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal]};const[bg,tc]=m[color]||m.blue;return<span style={{display:'inline-block',fontSize:11,padding:'2px 9px',borderRadius:6,background:bg,color:tc,fontWeight:500,marginBottom:10}}>{label}</span>},H:({children,C})=><h3 style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:8,lineHeight:1.4}}>{children}</h3>,P:({children,C})=><p style={{fontSize:13,color:C.muted,lineHeight:1.75,marginBottom:10}}>{children}</p>,Callout:({children,color,title,C})=>{const m={blue:[C.blueBg,C.blueBd,C.blue],amber:[C.amberBg,C.amberBd,C.amber],green:[C.greenBg,C.greenBd,C.green],red:[C.redBg,C.redBd,C.red],purple:[C.purpleBg,C.purpleBd,C.purple],teal:[C.tealBg,C.tealBd,C.teal]};const[bg,bd,tc]=m[color]||m.amber;return<div style={{borderLeft:`2px solid ${bd}`,background:bg,borderRadius:'0 6px 6px 0',padding:'8px 12px',marginBottom:10}}>{title&&<div style={{fontSize:12,fontWeight:500,color:tc,marginBottom:4}}>{title}</div>}<p style={{fontSize:13,color:tc,lineHeight:1.6,margin:0}}>{children}</p></div>},Aha:({title,children,C})=><div style={{background:C.greenBg,border:`1px solid ${C.greenBd}`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:10}}><div style={{fontSize:14,fontWeight:500,color:C.green,marginBottom:6}}>{title}</div><div style={{fontSize:13,color:C.green,lineHeight:1.65}}>{children}</div></div>}

const MACHINES = [
  {id:'double',label:'double(n)',code:'n => n * 2',fn:n=>n*2,inputLabel:'number',inputType:'number',inputMin:0,inputMax:20,inputDef:5,outputLabel:'number'},
  {id:'greet',label:'greet(name)',code:'name => "Hello, " + name + "!"',fn:n=>`Hello, ${n}!`,inputLabel:'string',inputType:'text',inputDef:'World',outputLabel:'string'},
  {id:'isEven',label:'isEven(n)',code:'n => n % 2 === 0',fn:n=>n%2===0,inputLabel:'number',inputType:'number',inputMin:0,inputMax:20,inputDef:4,outputLabel:'boolean'},
  {id:'clamp',label:'clamp(n)',code:'n => Math.max(0, Math.min(100, n))',fn:n=>Math.max(0,Math.min(100,n)),inputLabel:'number',inputType:'number',inputMin:-20,inputMax:120,inputDef:50,outputLabel:'number'},
]

function FunctionMachine({machine,C}){
  const [input,setInput]=useState(machine.inputDef)
  const output=machine.fn(input)
  const outType=typeof output
  const typeColor={number:C.blue,string:C.green,boolean:C.purple}
  return<div style={{display:'grid',gridTemplateColumns:'1fr 60px 1fr',gap:8,alignItems:'center',marginBottom:8}}>
    <div style={{background:C.surface2,borderRadius:8,padding:'8px 10px'}}>
      <div style={{fontSize:10,color:C.hint,marginBottom:3}}>INPUT</div>
      {machine.inputType==='number'
        ?<input type="range" min={machine.inputMin} max={machine.inputMax} step={1} value={input} onChange={e=>setInput(+e.target.value)} style={{width:'100%',marginBottom:4}}/>
        :<input type="text" value={input} onChange={e=>setInput(e.target.value)} style={{width:'100%',fontFamily:'monospace',fontSize:12,padding:'4px 7px',borderRadius:5,border:`0.5px solid ${C.border}`,background:C.bg,color:C.text,marginBottom:4}}/>}
      <div style={{fontFamily:'monospace',fontSize:13,color:C.amber}}>{typeof input==='string'?`"${input}"`:input}</div>
    </div>
    <div style={{background:C.amberBg,border:`0.5px solid ${C.amberBd}`,borderRadius:8,padding:'6px 4px',textAlign:'center'}}>
      <div style={{fontSize:9,color:C.amber,marginBottom:2}}>function</div>
      <div style={{fontFamily:'monospace',fontSize:9,color:C.amber,wordBreak:'break-all'}}>{machine.label.split('(')[0]}</div>
    </div>
    <div style={{background:C.surface2,borderRadius:8,padding:'8px 10px'}}>
      <div style={{fontSize:10,color:C.hint,marginBottom:3}}>OUTPUT</div>
      <div style={{fontFamily:'monospace',fontSize:13,color:typeColor[outType]||C.text,background:(typeColor[outType]||C.muted)+'22',padding:'4px 8px',borderRadius:5}}>
        {outType==='string'?`"${output}"`:String(output)}
      </div>
      <div style={{fontSize:9,color:typeColor[outType]||C.hint,marginTop:2}}>{outType}</div>
    </div>
  </div>
}

function PageFunctions({C}){
  const [selected,setSelected]=useState(0)
  return<>
    <ui.Tag label="Lesson 6 — Functions" color="blue" C={C}/>
    <ui.H C={C}>A function is a machine: input goes in, output comes out</ui.H>
    <ui.P C={C}>A function is a named, reusable transformation. You give it inputs (parameters), it does work, and it returns an output. The same function always does the same thing — given the same input, you always get the same output. That predictability is what makes functions useful.</ui.P>
    <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
      {MACHINES.map((m,i)=><button key={i} onClick={()=>setSelected(i)} style={{fontSize:11,padding:'4px 10px',borderRadius:6,cursor:'pointer',fontFamily:'monospace',border:`0.5px solid ${selected===i?C.blueBd:C.border}`,background:selected===i?C.blueBg:'transparent',color:selected===i?C.blue:C.muted}}>{m.label}</button>)}
    </div>
    <div style={{background:C.surface2,borderRadius:7,padding:'6px 10px',fontFamily:'monospace',fontSize:12,color:C.text,marginBottom:10}}>
      const {MACHINES[selected].label.replace('n)','number)').replace('name)','name)')} = {MACHINES[selected].code}
    </div>
    <FunctionMachine machine={MACHINES[selected]} C={C}/>
    <ui.Aha title="Functions are the unit of reuse" C={C}>
      Without functions, you would copy-paste the same logic everywhere — and when it needs to change, you would update every copy. Functions let you write logic once, name it, and call it from anywhere. Every piece of software ever written is built from functions calling other functions.
    </ui.Aha>
    <ui.Callout color="amber" title="Parameters are local variables" C={C}>
      When you call double(5), the number 5 is assigned to the parameter n inside the function. n only exists while the function is running — it disappears when the function returns. This isolation means functions cannot accidentally break things outside themselves.
    </ui.Callout>
  </>
}

function PageComposition({C}){
  const [x,setX]=useState(7)
  const double=n=>n*2
  const addOne=n=>n+1
  const square=n=>n*n
  const clamp=n=>Math.max(0,Math.min(100,n))
  const steps=[
    {fn:'double',result:double(x)},
    {fn:'addOne',result:addOne(double(x))},
    {fn:'square',result:square(addOne(double(x)))},
    {fn:'clamp(0-100)',result:clamp(square(addOne(double(x))))},
  ]
  return<>
    <ui.Tag label="Lesson 6 — Composition" color="amber" C={C}/>
    <ui.H C={C}>Functions compose — the output of one becomes the input of the next</ui.H>
    <ui.P C={C}>The power of functions is that they chain. The output of one function feeds directly into the input of the next. Complex behavior is built from simple functions composed together.</ui.P>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
      <span style={{fontSize:12,color:C.muted,minWidth:60}}>Input x</span>
      <input type="range" min={0} max={20} step={1} value={x} onChange={e=>setX(+e.target.value)} style={{flex:1}}/>
      <span style={{fontFamily:'monospace',fontSize:13,color:C.amber,minWidth:24}}>{x}</span>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:0,marginBottom:10}}>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:C.blueBg,borderRadius:'8px 8px 0 0',border:`0.5px solid ${C.blueBd}`}}>
        <span style={{fontFamily:'monospace',fontSize:13,color:C.blue,minWidth:110}}>start: {x}</span>
        <span style={{fontSize:11,color:C.muted}}>the input</span>
      </div>
      {steps.map((s,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:C.surface2,borderTop:`0.5px solid ${C.border}`,borderLeft:`0.5px solid ${C.border}`,borderRight:`0.5px solid ${C.border}`,borderBottom:i===steps.length-1?`0.5px solid ${C.border}`:'none',borderRadius:i===steps.length-1?'0 0 8px 8px':0}}>
          <span style={{fontSize:11,color:C.hint,minWidth:14}}>→</span>
          <span style={{fontFamily:'monospace',fontSize:12,color:C.amber,minWidth:110}}>{s.fn}()</span>
          <span style={{fontFamily:'monospace',fontSize:13,color:C.green,fontWeight:500}}>{s.result}</span>
        </div>
      ))}
    </div>
    <div style={{background:C.surface2,borderRadius:7,padding:'8px 12px',fontFamily:'monospace',fontSize:12,color:C.text,marginBottom:10}}>
      {`clamp(square(addOne(double(${x})))) = ${clamp(square(addOne(double(x))))}`}
    </div>
    <ui.Callout color="purple" title="This is how all software is built" C={C}>
      Every app, every framework, every library is functions calling functions. A button click calls handleClick, which calls validateForm, which calls submitToAPI, which calls formatResponse, which calls updateUI. The entire chain is just functions composing. Understanding this is understanding software architecture.
    </ui.Callout>
  </>
}

const PAGES=[PageFunctions,PageComposition]
const PAGE_LABELS=['Function machine','Composition']
export default function WebLesson06_Functions({params={}}){
  const C=useThemeColors();const[page,setPage]=useState(params.currentStep??0)
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
