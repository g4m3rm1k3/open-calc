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

// ── The tree data ─────────────────────────────────────────────────────────────
const INITIAL_TREE = {
  id:'html',tag:'html',label:'html',color:'purple',
  children:[
    {id:'head',tag:'head',label:'head',color:'teal',
      children:[
        {id:'title',tag:'title',label:'title',color:'teal',children:[{id:'title-t',tag:'#text',label:'"My Page"',color:'amber',children:[]}]},
      ]
    },
    {id:'body',tag:'body',label:'body',color:'blue',
      children:[
        {id:'h1',tag:'h1',label:'h1',color:'blue',children:[{id:'h1-t',tag:'#text',label:'"Hello"',color:'amber',children:[]}]},
        {id:'p',tag:'p',label:'p',color:'blue',children:[{id:'p-t',tag:'#text',label:'"Some text"',color:'amber',children:[]}]},
        {id:'div',tag:'div',label:'div',color:'blue',
          children:[
            {id:'img',tag:'img',label:'img',color:'green',children:[]},
            {id:'a',tag:'a',label:'a',color:'green',children:[{id:'a-t',tag:'#text',label:'"Click me"',color:'amber',children:[]}]},
          ]
        },
      ]
    }
  ]
}

function findNode(tree, id) {
  if (tree.id === id) return tree
  for (const c of tree.children) { const f = findNode(c, id); if (f) return f }
  return null
}

function TreeNode({node, depth, hoverId, setHoverId, deletedIds, onDelete, C}) {
  const colorMap = {
    purple:[C.purpleBg,C.purple], teal:[C.tealBg,C.teal],
    blue:[C.blueBg,C.blue], green:[C.greenBg,C.green], amber:[C.amberBg,C.amber]
  }
  const [bg,tc] = colorMap[node.color]||colorMap.blue
  const isHovered = hoverId === node.id
  const isDeleted = deletedIds.includes(node.id)
  if (isDeleted) return null
  const isText = node.tag === '#text'
  return(
    <div style={{marginLeft: depth > 0 ? 18 : 0}}>
      <div
        onMouseEnter={()=>setHoverId(node.id)}
        onMouseLeave={()=>setHoverId(null)}
        style={{display:'flex',alignItems:'center',gap:6,padding:'3px 7px',borderRadius:6,cursor:'pointer',
          background:isHovered?(isText?C.amberBg:bg):'transparent',
          border:`0.5px solid ${isHovered?(isText?C.amberBd:tc):'transparent'}`,
          marginBottom:2,transition:'all .15s'}}
      >
        {!isText&&<span style={{width:6,height:6,borderRadius:'50%',background:tc,flexShrink:0}}/>}
        <span style={{fontFamily:'monospace',fontSize:12,color:isText?C.amber:tc,fontWeight:isText?400:500}}>
          {isText?node.label:`<${node.label}>`}
        </span>
        {!isText&&node.children.length===0&&<span style={{fontFamily:'monospace',fontSize:11,color:C.hint}}>empty</span>}
        {!isText&&<button onClick={()=>onDelete(node.id)} style={{marginLeft:'auto',fontSize:10,color:C.hint,background:'transparent',border:'none',cursor:'pointer',opacity:isHovered?1:0,transition:'opacity .15s',padding:'0 4px'}} title="Remove this node">✕</button>}
      </div>
      {node.children.filter(c=>!deletedIds.includes(c.id)).map(child=>(
        <TreeNode key={child.id} node={child} depth={depth+1} hoverId={hoverId} setHoverId={setHoverId} deletedIds={deletedIds} onDelete={onDelete} C={C}/>
      ))}
    </div>
  )
}

function PreviewPane({hoverId, deletedIds, C}) {
  const h1Gone = deletedIds.some(id=>['h1','h1-t','body'].includes(id))
  const pGone = deletedIds.some(id=>['p','p-t','body'].includes(id))
  const imgGone = deletedIds.some(id=>['img','div','body'].includes(id))
  const aGone = deletedIds.some(id=>['a','a-t','div','body'].includes(id))
  const bodyGone = deletedIds.includes('body')
  const headGone = deletedIds.includes('head')
  const titleGone = deletedIds.some(id=>['title','title-t','head'].includes(id))

  const hl = (id) => hoverId === id
  const hStyle = (id) => ({
    outline: hl(id) ? `2px solid ${C.amber}` : 'none',
    borderRadius:3, transition:'outline .1s', display:'inline-block'
  })

  return(
    <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'12px 14px',minHeight:180}}>
      {bodyGone
        ? <div style={{color:C.red,fontSize:12,fontFamily:'monospace'}}>{'<body> removed — page is blank'}</div>
        : <>
          {!h1Gone&&<div style={{...hStyle('h1'),fontSize:18,fontWeight:700,color:C.text,marginBottom:6,display:'block'}}>Hello</div>}
          {!pGone&&<p style={{...hStyle('p'),fontSize:13,color:C.muted,marginBottom:8,margin:0,marginBottom:6}}>Some text</p>}
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {!imgGone&&<div style={{...hStyle('img'),width:36,height:36,background:C.surface2,border:`0.5px solid ${C.border}`,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:C.hint}}>img</div>}
            {!aGone&&<span style={{...hStyle('a'),color:C.blue,textDecoration:'underline',fontSize:13,cursor:'pointer'}}>Click me</span>}
          </div>
          {(h1Gone||pGone||imgGone||aGone)&&<div style={{marginTop:8,color:C.red,fontSize:11,fontFamily:'monospace'}}>⚠ Some elements removed</div>}
        </>
      }
      {headGone&&<div style={{marginTop:6,color:C.amber,fontSize:11,fontFamily:'monospace'}}>⚠ {'<head>'} removed — page has no title or metadata</div>}
    </div>
  )
}

function PageDomTree({C}){
  const [hoverId,setHoverId]=useState(null)
  const [deletedIds,setDeletedIds]=useState([])
  const onDelete = id => setDeletedIds(d=>d.includes(id)?d:[...d,id])
  const reset = () => setDeletedIds([])

  return<>
    <Tag label="Lesson 1 — Intuition" color="blue" C={C}/>
    <Heading C={C}>A webpage is a tree of objects</Heading>
    <Para C={C}>When a browser loads a page, it does not see text — it builds a <Strong>tree of objects</Strong> called the DOM (Document Object Model). Every element is a node. Nodes have parents and children. The tree is what the browser actually renders.</Para>
    <Para C={C}><Strong>Hover any node</Strong> to see what it represents in the rendered page. <Strong>Click ✕</Strong> to remove a node and watch the page break.</Para>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:10}}>
      <div>
        <div style={{fontSize:11,color:C.hint,marginBottom:6,fontWeight:500}}>DOM TREE</div>
        <div style={{background:C.surface2,borderRadius:8,padding:'10px 12px',minHeight:220}}>
          <TreeNode node={INITIAL_TREE} depth={0} hoverId={hoverId} setHoverId={setHoverId} deletedIds={deletedIds} onDelete={onDelete} C={C}/>
        </div>
      </div>
      <div>
        <div style={{fontSize:11,color:C.hint,marginBottom:6,fontWeight:500}}>RENDERED PAGE</div>
        <PreviewPane hoverId={hoverId} deletedIds={deletedIds} C={C}/>
        {deletedIds.length>0&&<button onClick={reset} style={{marginTop:8,fontSize:11,padding:'4px 12px',borderRadius:6,border:`0.5px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer'}}>Reset tree</button>}
      </div>
    </div>
    <AhaBox title="The tree structure is the model, not the HTML" C={C}>
      HTML is just the instruction for building the tree. The browser reads HTML, creates DOM nodes, and renders from the tree. When JavaScript changes a page, it changes the tree — the HTML file on disk is never touched. You can delete the {'<body>'} node and the entire visible page vanishes, because the tree is what gets rendered.
    </AhaBox>
    <Callout color="amber" title="What parent/child means physically" C={C}>
      A child node is visually contained inside its parent. {'<div>'} contains {'<img>'} and {'<a>'} — they appear inside the div. {'<body>'} contains everything visible. {'<head>'} contains nothing visible — just metadata. The tree structure directly controls what contains what.
    </Callout>
    <WarnBox title="The DOM is not the HTML source" C={C}>
      If you "View Source" in a browser you see the original HTML. If you open DevTools you see the DOM. They can be different — JavaScript may have added, removed, or changed nodes after the page loaded. Always inspect via DevTools, not View Source, when debugging.
    </WarnBox>
  </>
}

function PageMentalModel({C}){
  const [selected, setSelected] = useState(null)
  const nodes = [
    {id:'root',label:'Document',desc:'The root of everything. Not an element — the container that holds the html element.',parent:null,color:'purple'},
    {id:'html',label:'<html>',desc:'Wraps the entire page. Has exactly two children: <head> and <body>. Always.',parent:'root',color:'purple'},
    {id:'head',label:'<head>',desc:'Metadata. Nothing here is visible to the user. Title, CSS links, scripts.',parent:'html',color:'teal'},
    {id:'body',label:'<body>',desc:'Everything visible lives here. If it\'s on screen, it\'s a descendant of <body>.',parent:'html',color:'blue'},
    {id:'h1',label:'<h1>',desc:'A heading node. Block-level — takes up the full width. Has a #text child node with the actual words.',parent:'body',color:'blue'},
    {id:'p',label:'<p>',desc:'A paragraph. Also block-level. Contains text or inline elements like <a> and <strong>.',parent:'body',color:'blue'},
    {id:'text',label:'#text',desc:'Not a tag — an actual piece of text content. Every visible word is a text node. Cannot have children.',parent:'p',color:'amber'},
  ]
  const sel = nodes.find(n=>n.id===selected)
  return<>
    <Tag label="Lesson 1 — Mental model" color="amber" C={C}/>
    <Heading C={C}>Every node has a type, a parent, and zero or more children</Heading>
    <Para C={C}>The DOM has specific rules about what can go where. Click a node to understand its role in the system.</Para>
    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
      {nodes.map(n=>{
        const colorMap={purple:[C.purpleBg,C.purple],teal:[C.tealBg,C.teal],blue:[C.blueBg,C.blue],amber:[C.amberBg,C.amber]}
        const [bg,tc]=colorMap[n.color]||colorMap.blue
        return<button key={n.id} onClick={()=>setSelected(n.id===selected?null:n.id)} style={{padding:'5px 12px',borderRadius:8,cursor:'pointer',fontFamily:'monospace',fontSize:12,border:`0.5px solid ${selected===n.id?tc:C.border}`,background:selected===n.id?bg:'transparent',color:selected===n.id?tc:C.muted,fontWeight:selected===n.id?500:400}}>{n.label}</button>
      })}
    </div>
    {sel&&<div style={{background:C.surface2,borderRadius:10,padding:'12px 14px',marginBottom:10}}>
      <div style={{fontFamily:'monospace',fontSize:14,color:C.amber,fontWeight:500,marginBottom:6}}>{sel.label}</div>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:8,margin:0,marginBottom:8}}>{sel.desc}</p>
      <div style={{display:'flex',gap:8}}>
        <div style={{background:C.bg,borderRadius:6,padding:'5px 10px',fontSize:11,color:C.hint}}>Parent: {sel.parent||'none (root)'}</div>
        {sel.id==='text'&&<div style={{background:C.redBg,borderRadius:6,padding:'5px 10px',fontSize:11,color:C.red}}>Can have children: NO</div>}
      </div>
    </div>}
    <Para C={C}>Three key relationships every developer uses constantly:</Para>
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
      {[
        {rel:'parent →  child',eg:'body → h1, p, div',desc:'Direct containment. A child is directly inside its parent.'},
        {rel:'ancestor → descendant',eg:'html → #text',desc:'Any level up. All nodes inside body are descendants of html.'},
        {rel:'sibling',eg:'h1, p, div (all inside body)',desc:'Same parent. CSS can target "next sibling" with the + selector.'},
      ].map((r,i)=><div key={i} style={{display:'flex',gap:10,background:C.surface2,borderRadius:8,padding:'8px 12px'}}>
        <div style={{fontFamily:'monospace',fontSize:11,color:C.blue,minWidth:140,flexShrink:0}}>{r.rel}</div>
        <div>
          <div style={{fontFamily:'monospace',fontSize:11,color:C.amber,marginBottom:2}}>{r.eg}</div>
          <div style={{fontSize:11,color:C.muted}}>{r.desc}</div>
        </div>
      </div>)}
    </div>
    <Callout color="blue" title="Why this matters for JavaScript" C={C}>
      Every DOM API uses tree relationships. document.querySelector() searches descendants. element.parentElement goes up one level. element.children gets direct children. Once you have the tree in your head, all of JavaScript's DOM methods become obvious.
    </Callout>
  </>
}

function PageFormalism({C}){
  return<>
    <Tag label="Lesson 1 — Formalism" color="purple" C={C}/>
    <Heading C={C}>The minimum HTML that creates the tree</Heading>
    <Para C={C}>Every valid HTML page creates the same root structure. Here is the minimum:</Para>
    <CodeBox C={C}>{`<!DOCTYPE html>          ← not a DOM node, just a declaration
<html>                   ← root element (document.documentElement)
  <head>                 ← metadata subtree
    <title>My Page</title>
  </head>
  <body>                 ← visible content subtree
    <h1>Hello</h1>
    <p>Some text</p>
  </body>
</html>`}</CodeBox>
    <Para C={C}>The browser creates this tree regardless of what your HTML says:</Para>
    <CodeBox C={C}>{`document                 ← always exists (not an element)
└── html                 ← document.documentElement
    ├── head             ← document.head
    └── body             ← document.body`}</CodeBox>
    <Para C={C}>Accessing the tree from JavaScript:</Para>
    <CodeBox C={C}>{`// Navigating up and down
document.body                  // the body element
document.body.parentElement    // html element
document.body.children         // HTMLCollection of body's direct children

// Finding any node
document.querySelector('h1')   // first h1 in the document
document.getElementById('nav') // node with id="nav"

// Reading relationships
h1.parentElement               // body
h1.nextElementSibling          // the p element
p.previousElementSibling       // the h1 element`}</CodeBox>
    <AhaBox title="The browser always fixes broken HTML" C={C}>
      Write {'<html><p>hello</p></html>'} with no head or body tags and the browser will insert them for you. Open DevTools — you will see a complete html/head/body structure even though you did not write it. The browser always produces a valid tree, even from invalid HTML.
    </AhaBox>
  </>
}

function PageExtension({C}){
  const [breakMode, setBreakMode] = useState(false)
  const [step, setStep] = useState(0)
  const questions=[
    {q:'What happens to the DOM when JavaScript runs document.body.innerHTML = ""?',a:'Every child of body is removed from the tree — the entire visible page disappears. The body element still exists, but it has no children. The HTML file is unchanged.'},
    {q:'Can the same node appear in two places in the tree?',a:'No. A node can only have one parent. If you "move" a node from one place to another (appendChild), it is automatically removed from its original position first.'},
    {q:'What is the difference between innerHTML and textContent?',a:'innerHTML gets/sets the full HTML markup of a node\'s subtree — it can contain tags. textContent gets/sets only the text, stripping all tags. Setting innerHTML to "<b>hi</b>" creates a b element node; setting textContent to the same string creates a literal text node containing "<b>hi</b>".'},
    {q:'Why do some developers say "avoid innerHTML"?',a:'Because it re-parses and recreates the entire subtree every time, which is slow. More critically: if you insert user-provided text via innerHTML, an attacker can inject <script> tags (XSS attack). Use textContent for text, and createElement/appendChild for building structure programmatically.'},
  ]
  return<>
    <Tag label="Lesson 1 — Extension" color="teal" C={C}/>
    <Heading C={C}>What breaks, what scales, what generalizes</Heading>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
      <button onClick={()=>setBreakMode(!breakMode)} style={{fontSize:12,padding:'5px 14px',borderRadius:8,cursor:'pointer',border:`0.5px solid ${breakMode?C.redBd:C.border}`,background:breakMode?C.redBg:'transparent',color:breakMode?C.red:C.muted}}>
        {breakMode?'Break mode ON ⚠':'Break mode — what happens when...'}
      </button>
    </div>
    {breakMode&&<WarnBox title="What breaks when the tree is wrong" C={C}>
      Browsers are extremely forgiving — they will try to build a valid tree from invalid HTML. But: (1) CSS selectors targeting specific parent-child relationships will stop working. (2) JavaScript traversal (parentElement, children) will return unexpected nodes. (3) Screen readers use the tree to announce content — a broken tree breaks accessibility. The tree must be semantically correct, not just visually correct.
    </WarnBox>}
    <Para C={C}>Common questions about the DOM:</Para>
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
      {questions.map((q,i)=>(
        <div key={i} style={{background:C.surface2,borderRadius:8,overflow:'hidden'}}>
          <button onClick={()=>setStep(step===i?-1:i)} style={{width:'100%',textAlign:'left',padding:'10px 12px',background:'transparent',border:'none',cursor:'pointer',fontSize:12,color:C.text,fontWeight:500,lineHeight:1.5}}>{q.q}</button>
          {step===i&&<div style={{padding:'0 12px 10px',fontSize:12,color:C.muted,lineHeight:1.65,borderTop:`0.5px solid ${C.border}`}}>{q.a}</div>}
        </div>
      ))}
    </div>
    <Callout color="purple" title="This scales to frameworks" C={C}>
      React, Vue, and Angular all work by maintaining their own virtual DOM — a JavaScript object that mirrors the real DOM tree. When state changes, they compare the old virtual tree to the new one, compute the minimum set of real DOM changes, and apply only those. The tree concept is the foundation of every modern framework.
    </Callout>
  </>
}

const PAGES=[PageDomTree,PageMentalModel,PageFormalism,PageExtension]
const PAGE_LABELS=['Interactive tree','Mental model','The code','What breaks']

export default function WebLesson01_DOMTree({params={}}){
  const C=useColors()
  const [page,setPage]=useState(params.currentStep??0)
  useEffect(()=>{if(params.currentStep!==undefined)setPage(Math.min(params.currentStep,PAGES.length-1))},[params.currentStep])
  const PageComponent=PAGES[Math.min(page,PAGES.length-1)]
  return(
    <div style={{width:'100%',fontFamily:'sans-serif'}}>
      <div style={{display:'flex',gap:4,marginBottom:6}}>
        {PAGE_LABELS.map((_,i)=><div key={i} onClick={()=>setPage(i)} style={{flex:1,height:4,borderRadius:2,cursor:'pointer',transition:'background .25s',background:i<page?C.blue:i===page?C.amber:C.border}}/>)}
      </div>
      <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
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
