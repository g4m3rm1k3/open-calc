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
}

function PageBoxModel({C}){
  const [m,setM]=useState(16),[p,setP]=useState(16),[b,setB]=useState(2),[showBox,setShowBox]=useState(true)
  const inner=120,W=inner+p*2+b*2,outer=W+m*2
  return<>
    <ui.Tag label="Lesson 4 — Box model" color="blue" C={C}/>
    <ui.H C={C}>Every element is a box inside a box inside a box</ui.H>
    <ui.P C={C}>The box model is CSS's fundamental layout unit. Every element occupies a rectangular area made of four layers. Drag the sliders to see each layer.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:10}}>
      <div>
        {[{label:'margin',val:m,set:setM,color:C.amber,max:40},{label:'padding',val:p,set:setP,color:C.teal,max:40},{label:'border',val:b,set:setB,color:C.purple,max:12}].map(s=>(
          <div key={s.label} style={{marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
              <span style={{fontSize:12,color:s.color,fontWeight:500}}>{s.label}</span>
              <span style={{fontFamily:'monospace',fontSize:12,color:s.color}}>{s.val}px</span>
            </div>
            <input type="range" min={0} max={s.max} step={2} value={s.val} onChange={e=>s.set(+e.target.value)} style={{width:'100%'}}/>
          </div>
        ))}
        <div style={{marginTop:8,background:C.surface2,borderRadius:6,padding:'8px 10px',fontFamily:'monospace',fontSize:11,color:C.text,lineHeight:2}}>
          Total width: {outer}px<br/>
          Content: {inner}px<br/>
          + padding×2: +{p*2}px<br/>
          + border×2: +{b*2}px<br/>
          + margin×2: +{m*2}px
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{position:'relative',display:'inline-block'}}>
          {showBox&&<div style={{position:'absolute',inset:0,background:C.amberBg,border:`1px dashed ${C.amber}`,borderRadius:4}}/>}
          <div style={{position:'relative',margin:m,border:`${b}px solid ${C.purple}`,padding:p,background:C.tealBg,width:inner,boxSizing:'content-box'}}>
            <div style={{background:C.blueBg,border:`0.5px solid ${C.blue}`,height:40,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:C.blue,borderRadius:4}}>content</div>
            {showBox&&<>
              <div style={{position:'absolute',top:-b-p,left:-b-p,right:-b-p,bottom:-b-p,border:`1px dashed ${C.teal}`,pointerEvents:'none',borderRadius:2}}/>
            </>}
          </div>
        </div>
      </div>
    </div>
    <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
      {[{label:'margin (orange)',desc:'Space OUTSIDE the border. Pushes other elements away. Transparent — shows parent background. Can collapse between siblings.'},
        {label:'border',desc:'The visible edge. Adds to the total size by default (box-sizing: content-box).'},
        {label:'padding (teal)',desc:'Space INSIDE the border. Between content and the edge. Takes background color of the element.'},
        {label:'content (blue)',desc:'Where text and child elements actually live. Width/height properties set this zone.'},
      ].map((x,i)=><div key={i} style={{background:C.surface2,borderRadius:7,padding:'7px 10px',fontSize:11,color:C.muted,flex:'1 1 180px'}}><strong style={{fontWeight:500,color:C.text,display:'block',marginBottom:2}}>{x.label}</strong>{x.desc}</div>)}
    </div>
    <ui.Callout color="amber" title="box-sizing: border-box is almost always what you want" C={C}>
      By default, width/height sets the content area — padding and border add on top. With box-sizing: border-box, width includes padding and border. So a 200px element stays 200px regardless of padding. Almost every CSS reset includes {'* { box-sizing: border-box }'} for this reason.
    </ui.Callout>
  </>
}

function PageFlex({C}){
  const [justify,setJustify]=useState('flex-start')
  const [align,setAlign]=useState('stretch')
  const [dir,setDir]=useState('row')
  const [wrap,setWrap]=useState('nowrap')
  const [gap,setGap]=useState(8)
  const items=[{h:40},{h:60},{h:50},{h:44},{h:55}]
  const justifyOpts=['flex-start','center','flex-end','space-between','space-around','space-evenly']
  const alignOpts=['stretch','flex-start','center','flex-end','baseline']
  return<>
    <ui.Tag label="Lesson 4 — Flexbox" color="amber" C={C}/>
    <ui.H C={C}>Flexbox: the browser solves layout constraints for you</ui.H>
    <ui.P C={C}>Flexbox is a constraint system. You declare rules — "put these items in a row, centre them, with space between" — and the browser solves the geometry. You don't calculate positions. Change the controls and watch the layout recalculate.</ui.P>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {[{label:'flex-direction',val:dir,set:setDir,opts:['row','row-reverse','column','column-reverse']},
          {label:'justify-content',val:justify,set:setJustify,opts:justifyOpts},
          {label:'align-items',val:align,set:setAlign,opts:alignOpts},
          {label:'flex-wrap',val:wrap,set:setWrap,opts:['nowrap','wrap']},
        ].map(ctrl=>(
          <div key={ctrl.label}>
            <div style={{fontSize:11,color:C.hint,marginBottom:3,fontFamily:'monospace'}}>{ctrl.label}</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {ctrl.opts.map(o=><button key={o} onClick={()=>ctrl.set(o)} style={{fontSize:10,padding:'3px 7px',borderRadius:5,cursor:'pointer',border:`0.5px solid ${ctrl.val===o?C.blueBd:C.border}`,background:ctrl.val===o?C.blueBg:'transparent',color:ctrl.val===o?C.blue:C.hint}}>{o}</button>)}
            </div>
          </div>
        ))}
        <div>
          <div style={{fontSize:11,color:C.hint,marginBottom:3,fontFamily:'monospace'}}>gap: {gap}px</div>
          <input type="range" min={0} max={24} step={4} value={gap} onChange={e=>setGap(+e.target.value)} style={{width:'100%'}}/>
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>LIVE RESULT</div>
        <div style={{background:C.surface2,border:`1px dashed ${C.border}`,borderRadius:8,padding:8,minHeight:140,display:'flex',flexDirection:dir,justifyContent:justify,alignItems:align,flexWrap:wrap,gap}}>
          {items.map((item,i)=>(
            <div key={i} style={{background:C.blue,borderRadius:5,width:dir.includes('column')?'auto':40,height:item.h,minWidth:dir.includes('column')?40:undefined,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',fontWeight:500}}>{i+1}</div>
          ))}
        </div>
        <div style={{marginTop:8,background:C.surface2,borderRadius:6,padding:'6px 10px',fontFamily:'monospace',fontSize:11,color:C.text,lineHeight:1.7}}>
          {`.container {\n  display: flex;\n  flex-direction: ${dir};\n  justify-content: ${justify};\n  align-items: ${align};\n  flex-wrap: ${wrap};\n  gap: ${gap}px;\n}`}
        </div>
      </div>
    </div>
    <ui.Aha title="justify-content vs align-items — the axis trick" C={C}>
      justify-content controls the main axis (the direction flex is going). align-items controls the cross axis (perpendicular). In a row: justify is left-right, align is up-down. In a column: justify is up-down, align is left-right. The axes flip when direction flips.
    </ui.Aha>
  </>
}

function PageGrid({C}){
  const [cols,setCols]=useState('1fr 1fr 1fr')
  const [rows,setRows]=useState('auto auto')
  const [gapV,setGapV]=useState(8),[gapH,setGapH]=useState(8)
  const presets=[
    {label:'3 equal cols','cols':'1fr 1fr 1fr','rows':'auto'},
    {label:'Sidebar layout','cols':'200px 1fr','rows':'auto'},
    {label:'Holy grail','cols':'160px 1fr 160px','rows':'60px 1fr 40px'},
    {label:'Card grid','cols':'repeat(3, 1fr)','rows':'auto auto'},
  ]
  const itemCount=6
  return<>
    <ui.Tag label="Lesson 4 — Grid" color="purple" C={C}/>
    <ui.H C={C}>Grid: two-dimensional layout control</ui.H>
    <ui.P C={C}>CSS Grid controls rows AND columns simultaneously. Use it when you need precise two-dimensional placement — dashboards, page layouts, card grids.</ui.P>
    <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
      {presets.map(p=><button key={p.label} onClick={()=>{setCols(p.cols);setRows(p.rows)}} style={{fontSize:11,padding:'4px 10px',borderRadius:6,cursor:'pointer',border:`0.5px solid ${C.border}`,background:C.surface2,color:C.muted}}>{p.label}</button>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {[{label:'grid-template-columns',val:cols,set:setCols},{label:'grid-template-rows',val:rows,set:setRows}].map(ctrl=>(
          <div key={ctrl.label}>
            <div style={{fontSize:11,color:C.hint,marginBottom:3,fontFamily:'monospace'}}>{ctrl.label}</div>
            <input value={ctrl.val} onChange={e=>ctrl.set(e.target.value)} style={{width:'100%',fontFamily:'monospace',fontSize:11,padding:'5px 8px',borderRadius:6,border:`0.5px solid ${C.border}`,background:C.surface2,color:C.text}}/>
          </div>
        ))}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
          {[{label:'column-gap',val:gapH,set:setGapH},{label:'row-gap',val:gapV,set:setGapV}].map(ctrl=>(
            <div key={ctrl.label}>
              <div style={{fontSize:10,color:C.hint,marginBottom:2,fontFamily:'monospace'}}>{ctrl.label}: {ctrl.val}px</div>
              <input type="range" min={0} max={24} step={4} value={ctrl.val} onChange={e=>ctrl.set(+e.target.value)} style={{width:'100%'}}/>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:C.hint,marginBottom:6}}>LIVE RESULT</div>
        <div style={{background:C.surface2,border:`1px dashed ${C.border}`,borderRadius:8,padding:8,display:'grid',gridTemplateColumns:cols,gridTemplateRows:rows,columnGap:gapH,rowGap:gapV,minHeight:120}}>
          {Array.from({length:itemCount},(_,i)=>(
            <div key={i} style={{background:C.purple,borderRadius:5,height:36,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',fontWeight:500}}>{i+1}</div>
          ))}
        </div>
      </div>
    </div>
    <ui.Callout color="amber" title="1fr means 'one fraction of available space'" C={C}>
      fr is a grid-only unit. 1fr 1fr 1fr splits the space into three equal columns. 200px 1fr gives a fixed sidebar and a flexible main area that takes all remaining space. You cannot use fr in flexbox — it only exists in grid.
    </ui.Callout>
    <ui.Callout color="blue" title="When to use Flex vs Grid" C={C}>
      Flex is one-dimensional: items in a row or column. Grid is two-dimensional: rows and columns simultaneously. Use Flex for navigation bars, button groups, centering one item. Use Grid for page layout, card grids, anything that needs rows AND columns to align.
    </ui.Callout>
  </>
}

const PAGES=[PageBoxModel,PageFlex,PageGrid]
const PAGE_LABELS=['Box model','Flexbox','Grid']
export default function WebLesson04_Layout({params={}}){
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
