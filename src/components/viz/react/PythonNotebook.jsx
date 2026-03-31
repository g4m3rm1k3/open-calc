// PythonNotebook.jsx
// Interactive Python notebook with Pyodide + Monaco Editor.
// Detects opencalc Figure output and renders it via FigureRenderer.
// Drop-in replacement for the provided PythonNotebook component.

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import FigureRenderer from './FigureRenderer'
import { parseProse } from '../../math/parseProse.jsx'

// ── Colors hook (same as all viz components) ─────────────────────────────────
function useColors() {
  const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg: dark ? '#0f172a' : '#f8fafc', surface: dark ? '#1e293b' : '#ffffff',
    surface2: dark ? '#0f172a' : '#f1f5f9', border: dark ? '#334155' : '#e2e8f0',
    text: dark ? '#e2e8f0' : '#1e293b', muted: dark ? '#94a3b8' : '#64748b', hint: dark ? '#475569' : '#94a3b8',
    blue: dark ? '#38bdf8' : '#0284c7', blueBg: dark ? 'rgba(56,189,248,0.12)' : 'rgba(2,132,199,0.08)', blueBd: dark ? '#38bdf8' : '#0284c7',
    amber: dark ? '#fbbf24' : '#d97706', amberBg: dark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.08)', amberBd: dark ? '#fbbf24' : '#d97706',
    green: dark ? '#4ade80' : '#16a34a', greenBg: dark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)', greenBd: dark ? '#4ade80' : '#16a34a',
    red: dark ? '#f87171' : '#dc2626', redBg: dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', redBd: dark ? '#f87171' : '#dc2626',
    teal: dark ? '#2dd4bf' : '#0d9488', tealBg: dark ? 'rgba(45,212,191,0.12)' : 'rgba(13,148,136,0.08)', tealBd: dark ? '#2dd4bf' : '#0d9488',
    purple: dark ? '#a78bfa' : '#7c3aed', purpleBg: dark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)', purpleBd: dark ? '#a78bfa' : '#7c3aed',
  }
}

// ── Detect opencalc figure JSON ───────────────────────────────────────────────
function isFigureOutput(str) {
  if (typeof str !== 'string') return false
  const trimmed = str.trim()
  return trimmed.startsWith('{"type":"opencalc_figure"') ||
    trimmed.startsWith('{"type": "opencalc_figure"')
}

// ── The Python source of opencalc.py, embedded as a string ───────────────────
// This gets written to Pyodide's virtual filesystem so students can import it.
// Update this when opencalc_python_lib.py changes.
const OPENCALC_LIB_SOURCE = `
import json
import math

BLUE='blue';AMBER='amber';GREEN='green';RED='red';PURPLE='purple';TEAL='teal';GRAY='gray'

class Figure:
    def __init__(self,width=None,height=None,square=False,xmin=-5,xmax=5,ymin=-5,ymax=5,title=None):
        self._elements=[];self._width=width;self._height=height;self._square=square
        self._xmin=xmin;self._xmax=xmax;self._ymin=ymin;self._ymax=ymax;self._title=title
    def grid(self,step=1,color='border'):
        self._elements.append({'type':'grid','step':step,'color':color});return self
    def axes(self,labels=True,ticks=True):
        self._elements.append({'type':'axes','labels':labels,'ticks':ticks});return self
    def arrow(self,start,end,color='blue',label=None,width=2.5,dashed=False,alpha=1.0):
        self._elements.append({'type':'arrow','start':list(start),'end':list(end),'color':color,'label':label,'width':width,'dashed':dashed,'alpha':alpha});return self
    def vector(self,v,color='blue',label=None,origin=None,width=2.5):
        ox,oy=(origin or [0,0]);self._elements.append({'type':'arrow','start':[ox,oy],'end':[ox+v[0],oy+v[1]],'color':color,'label':label or f'[{v[0]},{v[1]}]','width':width,'dashed':False,'alpha':1.0});return self
    def point(self,pos,color='amber',label=None,radius=6):
        self._elements.append({'type':'point','pos':list(pos),'color':color,'label':label,'radius':radius});return self
    def line(self,start,end,color='muted',width=1.5,dashed=False,alpha=1.0):
        self._elements.append({'type':'line','start':list(start),'end':list(end),'color':color,'width':width,'dashed':dashed,'alpha':alpha});return self
    def hline(self,y,color='muted',width=1,dashed=True):
        self._elements.append({'type':'line','start':[self._xmin,y],'end':[self._xmax,y],'color':color,'width':width,'dashed':dashed,'alpha':0.7});return self
    def vline(self,x,color='muted',width=1,dashed=True):
        self._elements.append({'type':'line','start':[x,self._ymin],'end':[x,self._ymax],'color':color,'width':width,'dashed':dashed,'alpha':0.7});return self
    def plot(self,fn,xmin=None,xmax=None,steps=300,color='blue',width=2.5,label=None,fill=False,fill_alpha=0.15):
        x0=xmin if xmin is not None else self._xmin;x1=xmax if xmax is not None else self._xmax
        xs=[x0+(x1-x0)*i/steps for i in range(steps+1)];ys=[]
        for x in xs:
            try:
                y=fn(x);ys.append(float('inf') if y!=y else y)
            except:ys.append(None)
        self._elements.append({'type':'curve','xs':xs,'ys':ys,'color':color,'width':width,'label':label,'fill':fill,'fill_alpha':fill_alpha});return self
    def scatter(self,xs,ys,color='blue',radius=4,labels=None):
        self._elements.append({'type':'scatter','xs':list(xs),'ys':list(ys),'color':color,'radius':radius,'labels':labels});return self
    def parametric(self,xfn,yfn,tmin=0,tmax=2*math.pi,steps=300,color='purple',width=2):
        ts=[tmin+(tmax-tmin)*i/steps for i in range(steps+1)];xs=[];ys=[]
        for t in ts:
            try:xs.append(xfn(t))
            except:xs.append(None)
            try:ys.append(yfn(t))
            except:ys.append(None)
        self._elements.append({'type':'curve','xs':xs,'ys':ys,'color':color,'width':width,'label':None,'fill':False,'fill_alpha':0});return self
    def fill_between(self,fn_top,fn_bottom=None,xmin=None,xmax=None,color='blue',alpha=0.2,steps=200):
        x0=xmin if xmin is not None else self._xmin;x1=xmax if xmax is not None else self._xmax
        xs=[x0+(x1-x0)*i/steps for i in range(steps+1)];tops=[];bottoms=[]
        for x in xs:
            try:tops.append(fn_top(x))
            except:tops.append(None)
            if fn_bottom:
                try:bottoms.append(fn_bottom(x))
                except:bottoms.append(None)
            else:bottoms.append(0)
        self._elements.append({'type':'region','xs':xs,'tops':tops,'bottoms':bottoms,'color':color,'alpha':alpha});return self
    def text(self,pos,content,color='text',size=13,align='center',bold=False):
        self._elements.append({'type':'text','pos':list(pos),'content':str(content),'color':color,'size':size,'align':align,'bold':bold});return self
    def polygon(self,points,color='blue',fill=True,alpha=0.2,stroke=True,stroke_width=1.5):
        self._elements.append({'type':'polygon','points':[list(p) for p in points],'color':color,'fill':fill,'alpha':alpha,'stroke':stroke,'stroke_width':stroke_width});return self
    def rect(self,x,y,w,h,color='blue',fill=True,alpha=0.2):
        return self.polygon([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],color=color,fill=fill,alpha=alpha)
    def circle(self,center,radius,color='blue',fill=False,alpha=0.2,steps=60):
        pts=[[center[0]+radius*math.cos(2*math.pi*i/steps),center[1]+radius*math.sin(2*math.pi*i/steps)] for i in range(steps+1)]
        self._elements.append({'type':'polygon','points':pts,'color':color,'fill':fill,'alpha':alpha,'stroke':True,'stroke_width':1.5});return self
    def transformed_grid(self,matrix,color_h='blue',color_v='green',range_=5,alpha=0.7):
        a,b=matrix[0];c,d=matrix[1]
        self._elements.append({'type':'transformed_grid','a':a,'b':b,'c':c,'d':d,'range':range_,'color_h':color_h,'color_v':color_v,'alpha':alpha});return self
    def riemann(self,fn,a,b,n=10,method='midpoint',color='blue',alpha=0.3):
        rects=[];width=(b-a)/n
        for i in range(n):
            x_left=a+i*width;x_eval=x_left+(width/2 if method=='midpoint' else width if method=='right' else 0)
            try:h=fn(x_eval);rects.append({'x':x_left,'w':width,'h':h})
            except:pass
        self._elements.append({'type':'riemann','rects':rects,'color':color,'alpha':alpha});return self
    def tangent(self,fn,x0,length=2,color='amber',width=2,label=None):
        dx=1e-5;slope=(fn(x0+dx)-fn(x0-dx))/(2*dx);y0=fn(x0)
        self._elements.append({'type':'tangent','x0':x0,'y0':y0,'slope':slope,'x1':x0-length/2,'x2':x0+length/2,'color':color,'width':width,'label':label or f'slope = {slope:.3f}'});return self
    def bars(self,labels,values,color='blue',alpha=0.8):
        self._elements.append({'type':'bars','labels':[str(l) for l in labels],'values':[float(v) for v in values],'color':color,'alpha':alpha});return self
    def show(self):
        return json.dumps({'type':'opencalc_figure','width':self._width,'height':self._height,'square':self._square,'xmin':self._xmin,'xmax':self._xmax,'ymin':self._ymin,'ymax':self._ymax,'title':self._title,'elements':self._elements})

def quick_plot(fn,xmin=-5,xmax=5,color='blue',label=None,title=None):
    fig=Figure(xmin=xmin,xmax=xmax,ymin=-10,ymax=10,title=title)
    fig.grid().axes();fig.plot(fn,color=color,label=label);return fig.show()

def quick_vectors(*vectors,labels=None):
    colors=['blue','amber','green','red','purple','teal']
    fig=Figure(square=True,xmin=-6,xmax=6,ymin=-6,ymax=6)
    fig.grid().axes()
    for i,v in enumerate(vectors):
        lbl=labels[i] if labels and i<len(labels) else f'v{i+1}'
        fig.vector(v,color=colors[i%len(colors)],label=lbl)
    return fig.show()

def quick_transform(matrix,vector=None):
    fig=Figure(square=True,xmin=-5,xmax=5,ymin=-5,ymax=5)
    fig.grid();fig.transformed_grid(matrix)
    a,b=matrix[0];c,d=matrix[1]
    fig.vector([a,b],color='red',label='î→');fig.vector([c,d],color='green',label='ĵ→')
    if vector:
        vx,vy=vector;fig.vector([vx,vy],color='purple',label='v')
        fig.vector([a*vx+c*vy,b*vx+d*vy],color='purple',label='Tv')
    return fig.show()
`

// ── Starter cells ─────────────────────────────────────────────────────────────
const STARTER_CELLS = [
  {
    id: 1,
    code: `# Python Sandbox\n# Type code here and press Shift+Enter to run\n\nprint("Hello, open-calc!")`,
    output: '', status: 'idle', figureJson: null,
  }
];

// ── CellOutput ────────────────────────────────────────────────────────────────
function CellOutput({ cell, C }) {
  if (!cell.output && !cell.figureJson) return null

  return (
    <div style={{ borderTop: `0.5px solid ${C.border}` }}>
      <div style={{
        fontSize: 10, color: C.hint, padding: '6px 14px 2px',
        fontFamily: 'monospace', fontWeight: 500
      }}>
        Out [{cell.id}]
      </div>

      {/* Figure canvas */}
      {cell.figureJson && (
        <div style={{ padding: '0 14px 10px' }}>
          <FigureRenderer figureJson={cell.figureJson} C={C} />
        </div>
      )}

      {/* Text output */}
      {cell.output && (
        <pre style={{
          margin: 0, padding: '4px 14px 12px',
          fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6,
          color: cell.status === 'error' ? C.red : C.text,
          background: 'transparent', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
        }}>
          {cell.output}
        </pre>
      )}

      {/* Test Feedback Banner */}
      {cell.testResult && (
        <div style={{
          margin: '0 14px 14px', padding: '12px 16px', borderRadius: 10,
          background: cell.testResult.success ? C.tealBg : C.redBg,
          border: `1px solid ${cell.testResult.success ? C.tealBd : C.redBd}`,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: 20 }}>{cell.testResult.success ? '🎉' : '❌'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: 13, fontWeight: 600, 
              color: cell.testResult.success ? C.teal : C.red 
            }}>
              {cell.testResult.success ? 'Challenge Complete!' : 'Not quite there yet'}
            </div>
            <div style={{ fontSize: 12, color: cell.testResult.success ? C.teal : C.red, opacity: 0.8 }}>
              {cell.testResult.message}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Pyodide Singleton Management ──────────────────────────────────────────
// We use a global promise to ensure Pyodide is only loaded ONCE even if 
// multiple notebook components are mounted (e.g. lesson sandbox + global sandbox).
let pyodidePromise = null;

async function getPyodide() {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    // 1. Load the script strictly once
    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Pyodide CDN'));
        document.head.appendChild(script);
      });
    }

    // 2. Initialize
    const py = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
      fullStdLib: false
    });

    // 3. Setup filesystem
    py.FS.writeFile('/home/pyodide/opencalc.py', OPENCALC_LIB_SOURCE);

    // 4. Pre-load only strictly necessary heavy packages
    // Small ones like micropip are core and don't need explicit loadPackage usually,
    // but we can ensure they are ready.
    await py.loadPackage(['numpy']);
    
    await py.runPythonAsync('from opencalc import Figure; print("opencalc ready")');
    return py;
  })();

  return pyodidePromise;
}

// ── Challenge difficulty color map ────────────────────────────────────────────
function difficultyStyle(difficulty, C) {
  if (difficulty === 'easy')   return { bg: C.greenBg,  border: C.greenBd,  text: C.green }
  if (difficulty === 'hard')   return { bg: C.redBg,    border: C.redBd,    text: C.red }
  return { bg: C.amberBg, border: C.amberBd, text: C.amber } // medium default
}

// ── Memoized Cell Component ──────────────────────────────────────────────
const CellComponent = React.memo(({ cell, C, onRun, onClear, onRemove, onUpdate, isExecuting, isOnlyCell }) => {
  const [copied, setCopied] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)

  const isChallenge = !!cell.challengeType
  const isFillIn = cell.challengeType === 'fill-in'
  const dc = difficultyStyle(cell.difficulty, C)

  const handleCopy = () => {
    navigator.clipboard.writeText(cell.starterBlock || '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Compute Monaco height from line count
  const lineCount = (cell.code || '').split('\n').length
  const editorHeight = `${Math.min(320, Math.max(80, lineCount * 21 + 24))}px`

  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${cell.status === 'error' ? C.redBd : cell.status === 'running' ? C.tealBd : isChallenge ? C.purpleBd : C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color .2s',
      }}
    >
      {/* ── Challenge header ────────────────────────────────────────────── */}
      {isChallenge && (
        <div style={{ padding: '12px 16px', background: C.purpleBg, borderBottom: `0.5px solid ${C.purpleBd}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: cell.prompt ? 8 : 0 }}>
            {/* Number badge */}
            {cell.challengeNumber != null && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 24, height: 24, borderRadius: '50%', background: C.purple,
                color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {cell.challengeNumber}
              </span>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>
              {cell.challengeTitle || 'Challenge'}
            </span>
            {/* Type badge */}
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '2px 7px', borderRadius: 5,
              background: isFillIn ? C.blueBg : C.tealBg,
              border: `1px solid ${isFillIn ? C.blueBd : C.tealBd}`,
              color: isFillIn ? C.blue : C.teal,
            }}>
              {isFillIn ? 'Fill In' : 'Write'}
            </span>
            {/* Difficulty badge */}
            {cell.difficulty && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
                background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text,
              }}>
                {cell.difficulty}
              </span>
            )}
          </div>
          {/* Prompt */}
          {cell.prompt && (
            <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
              {cell.prompt}
            </p>
          )}
        </div>
      )}

      {/* ── Demo prose / instructions box ── */}
      {(cell.prose || cell.instructions || (!isChallenge && cell.cellTitle)) && (
        <div style={{ borderBottom: `0.5px solid ${C.border}` }}>
          {/* Title bar (only for non-challenges, challenges have their own header) */}
          {!isChallenge && cell.cellTitle && (
            <div style={{
              padding: '8px 16px 0',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: C.muted,
            }}>
              {cell.cellTitle}
            </div>
          )}
          {/* Prose */}
          {cell.prose && (
            <div style={{ padding: (!isChallenge && cell.cellTitle) ? '6px 16px 10px' : '10px 16px 10px' }}>
              {(Array.isArray(cell.prose) ? cell.prose : [cell.prose]).map((p, i) => (
                <p key={i} style={{
                  margin: i === 0 ? 0 : '8px 0 0',
                  fontSize: 13, color: C.text, lineHeight: 1.7,
                }}>
                  {parseProse(p)}
                </p>
              ))}
            </div>
          )}
          {/* Instructions highlight (amber) */}
          {cell.instructions && (
            <div style={{
              margin: '0 16px 12px',
              padding: '8px 12px',
              borderRadius: 8,
              background: C.amberBg,
              border: `1px solid ${C.amberBd}`,
              fontSize: 12, color: C.amber, lineHeight: 1.65,
            }} className="notebook-instructions">
              {parseProse(cell.instructions)}
            </div>
          )}
        </div>
      )}

      {/* ── Fill-in: copyable starter block ─────────────────────────────── */}
      {isFillIn && cell.starterBlock && (
        <div style={{ padding: '10px 16px', background: C.blueBg, borderBottom: `0.5px solid ${C.blueBd}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.blue }}>
              Starter — copy &amp; paste into the cell, then fill in the ___
            </span>
            <button onClick={handleCopy} style={{
              fontSize: 11, padding: '2px 10px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${C.blueBd}`, background: copied ? C.blue : 'transparent',
              color: copied ? '#fff' : C.blue, transition: 'all 0.2s',
            }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre style={{
            margin: 0, fontFamily: 'monospace', fontSize: 12.5, color: C.blue,
            lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>
            {cell.starterBlock}
          </pre>
        </div>
      )}

      {/* ── Cell header (In [n] label + buttons) ────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          background: C.surface2,
          borderBottom: `0.5px solid ${C.border}`,
        }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.hint }}>
          {cell.status === 'running'
            ? <span>In [<span style={{ color: C.teal }}>*</span>]</span>
            : <span>In [{cell.executionCount ?? ' '}]</span>
          }
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onRun(cell.id)}
            disabled={isExecuting}
            style={{
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 6,
              cursor: isExecuting ? 'default' : 'pointer',
              border: 'none',
              background: C.teal,
              color: '#fff',
              opacity: isExecuting ? 0.5 : 1,
            }}
          >
            {cell.status === 'running' ? '...' : '▶ Run'}
          </button>
          <button
            onClick={() => onClear(cell.id)}
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              border: `0.5px solid ${C.border}`,
              background: 'transparent',
              color: C.hint,
            }}
          >
            Clear
          </button>
          <button
            onClick={() => onRemove(cell.id)}
            disabled={isOnlyCell}
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 6,
              cursor: isOnlyCell ? 'default' : 'pointer',
              border: `0.5px solid ${C.border}`,
              background: 'transparent',
              color: C.hint,
              opacity: isOnlyCell ? 0.3 : 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height={editorHeight}
        defaultLanguage="python"
        theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs'}
        value={cell.code}
        onChange={(val) => onUpdate(cell.id, val || '')}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: 'on',
          padding: { top: 10, bottom: 10 },
          automaticLayout: true,
          scrollbar: {
            vertical: 'hidden',
            alwaysConsumeMouseWheel: false
          }
        }}
        onMount={(editor) => {
          // monaco.KeyMod.Shift | monaco.KeyCode.Enter = 1024 | 3
          // We use the numerical constants to avoid referencing a global 'monaco' object
          // which might not be in scope. Shift=1024, Enter=3
          editor.addCommand(1024 | 3, () => onRun(cell.id));
        }}
      />

      {/* Output */}
      <CellOutput cell={cell} C={C} />

      {/* Hint toggle (challenge cells only) */}
      {isChallenge && cell.hint && (
        <div style={{ borderTop: `0.5px solid ${C.border}` }}>
          <button
            onClick={() => setHintOpen(h => !h)}
            style={{
              width: '100%', padding: '8px 16px', background: 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              fontSize: 12, color: C.amber, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span>{hintOpen ? '▾' : '▸'}</span>
            {hintOpen ? 'Hide hint' : 'Show hint'}
          </button>
          {hintOpen && (
            <div style={{
              padding: '8px 16px 12px', background: C.amberBg,
              borderTop: `0.5px solid ${C.amberBd}`,
              fontSize: 13, color: C.amber, lineHeight: 1.6,
            }}>
              {cell.hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ── Main notebook ─────────────────────────────────────────────────────────────
export default function PythonNotebook({ params, onParamChange }) {
  const C = useColors()
  const [pyodide, setPyodide] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  // Use initialCells from params if provided, otherwise fallback to STARTER_CELLS
  const initialCells = params?.initialCells || STARTER_CELLS
  const [cells, setCells] = useState(initialCells)
  const [isExecuting, setIsExecuting] = useState(false)
  const execCounterRef = useRef(0)  // global execution counter — increments each time any cell runs

  // Update cells if params.initialCells changes (mostly for HMR or switching lessons)
  useEffect(() => {
    if (params?.initialCells) {
      setCells(params.initialCells)
    }
  }, [params?.initialCells])

  // ── Load Pyodide via Singleton ─────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const py = await getPyodide();
        if (mounted) {
          setPyodide(py);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Pyodide init failed:', err);
          setLoadError(err.message);
          setIsLoading(false);
        }
      }
    }
    init();
    return () => { mounted = false; };
  }, [])

  // ── Run a cell ─────────────────────────────────────────────────────────────
  const runCell = useCallback(async (cellId) => {
    if (!pyodide || isExecuting) return
    setIsExecuting(true)
    setCells(prev => prev.map(c => c.id === cellId
      ? { ...c, status: 'running', output: '', figureJson: null } : c))

    const cell = cells.find(c => c.id === cellId)
    let textOutput = ''

    // Capture stdout
    pyodide.setStdout({ batched: msg => { textOutput += msg + '\n' } })
    pyodide.setStderr({ batched: msg => { textOutput += msg + '\n' } })

    try {
      // 1. Run user code
      const result = await pyodide.runPythonAsync(cell.code)
      
      let testFeedback = null
      
      // 2. Run test code if provided
      if (cell.testCode) {
        try {
          const testResult = await pyodide.runPythonAsync(cell.testCode)
          // Look for 'SUCCESS' or True
          const isSuccess = testResult === true || (typeof testResult === 'string' && testResult.includes('SUCCESS'))
          testFeedback = {
            success: isSuccess,
            message: typeof testResult === 'string' ? testResult.replace('SUCCESS:', '').trim() : (isSuccess ? 'Great job! Your code passed the test.' : 'The test failed. Try again!')
          }
        } catch (testErr) {
          testFeedback = { success: false, message: `Test Error: ${testErr.message}` }
        }
      }

      // Check if the return value is an opencalc figure
      const resultStr = result !== undefined && result !== null ? String(result) : ''
      const isFigure = isFigureOutput(resultStr)

      execCounterRef.current += 1
      setCells(prev => prev.map(c => c.id === cellId ? {
        ...c,
        status: 'idle',
        executionCount: execCounterRef.current,
        output: textOutput || (!isFigure && resultStr ? resultStr : ''),
        figureJson: isFigure ? resultStr : null,
        testResult: testFeedback
      } : c))

    } catch (err) {
      setCells(prev => prev.map(c => c.id === cellId ? {
        ...c,
        status: 'error',
        output: (textOutput ? textOutput + '\n' : '') + 'Error: ' + err.message,
        figureJson: null,
      } : c))
    } finally {
      setIsExecuting(false)
    }
  }, [pyodide, cells, isExecuting])

  // ── Run all cells in order ─────────────────────────────────────────────────
  const runAll = useCallback(async () => {
    for (const cell of cells) {
      await new Promise(resolve => {
        // Small delay between cells so state updates render
        setTimeout(resolve, 50)
      })
      await runCell(cell.id)
    }
  }, [cells, runCell])

  const addCell = () => {
    const newId = cells.length > 0 ? Math.max(...cells.map(c => c.id)) + 1 : 1
    setCells([...cells, {
      id: newId, code: '# New cell\n', output: '', status: 'idle', figureJson: null,
    }])
  }

  const updateCode = (id, code) =>
    setCells(prev => prev.map(c => c.id === id ? { ...c, code } : c))

  const removeCell = (id) => {
    if (cells.length > 1) setCells(prev => prev.filter(c => c.id !== id))
  }

  const clearOutput = (id) =>
    setCells(prev => prev.map(c => c.id === id
      ? { ...c, output: '', figureJson: null } : c))

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 60, gap: 16, fontFamily: 'sans-serif'
      }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `3px solid ${C.teal}`, borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>
          Loading Python runtime...
        </div>
        <div style={{ fontSize: 12, color: C.hint }}>
          Downloading Pyodide (WebAssembly) — first load takes ~10s
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <div style={{
          background: C.redBg, border: `1px solid ${C.redBd}`,
          borderRadius: 10, padding: '12px 16px', color: C.red
        }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Failed to load Python runtime</div>
          <div style={{ fontSize: 12 }}>{loadError}</div>
        </div>
      </div>
    )
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12,
        padding: '12px 18px', marginBottom: 16
      }}>
        <div>
          <div style={{
            fontSize: 15, fontWeight: 500, color: C.text, display: 'flex',
            alignItems: 'center', gap: 8
          }}>
            <span style={{
              background: C.teal, borderRadius: 6, padding: '3px 7px',
              fontSize: 12, color: '#fff'
            }}>{'<>'}</span>
            Python Notebook
          </div>
          <div style={{ fontSize: 11, color: C.hint, marginTop: 2 }}>
            Python 3.x · WebAssembly · opencalc visualisation library loaded
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowHelp(!showHelp)}
            style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              border: `0.5px solid ${showHelp ? C.teal : C.border}`,
              background: showHelp ? C.tealBg : 'transparent',
              color: showHelp ? C.teal : C.muted,
              transition: 'all 0.2s'
            }}>
            {showHelp ? '✕ Close Help' : 'Help & API'}
          </button>
          <button onClick={runAll} disabled={isExecuting}
            style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              border: 'none', background: C.teal, color: '#fff',
              opacity: isExecuting ? 0.5 : 1
            }}>
            ▶ Run all
          </button>
          <button onClick={addCell}
            style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              border: `0.5px solid ${C.border}`, background: 'transparent', color: C.muted
            }}>
            + Add cell
          </button>
        </div>
      </div>

      {/* API Help Panel */}
      {showHelp && (
        <div style={{
          background: C.surface, border: `1px solid ${C.tealBd}`, borderRadius: 12,
          padding: 20, marginBottom: 20, animation: 'fadeIn 0.3s ease-out',
          boxShadow: '0 10px 25px -5px rgba(45,212,191,0.1)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.teal, marginBottom: 16 }}>
            opencalc Visualization Library
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>The Figure Engine</h4>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
                Create a <code>Figure</code> object and chain methods to draw. End with <code>.show()</code>.
              </p>
              <pre style={{
                fontSize: 11, background: C.surface2, padding: 12, borderRadius: 8,
                color: C.blue, border: `0.5px solid ${C.border}`, overflowX: 'auto'
              }}>
{`from opencalc import Figure
fig = Figure(xmin=-5, xmax=5)
fig.grid().axes()
fig.plot(lambda x: x**2, color='teal')
fig.point([2, 4], label="(2,4)")
fig.show()`}
              </pre>
            </div>
            <div style={{ fontSize: 12, color: C.text }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Common Methods</h4>
              <ul style={{ paddingLeft: 16, spaceY: 6, color: C.muted }}>
                <li><code>.grid(step=1)</code>: Draw a background grid</li>
                <li><code>.axes()</code>: Draw X/Y coordinate axes</li>
                <li><code>.vector([x,y], origin=[0,0])</code>: Draw an arrow</li>
                <li><code>.plot(fn, color='blue')</code>: Plot math functions</li>
                <li><code>.parametric(xfn, yfn, steps=300)</code>: Parametric curves</li>
                <li><code>.riemann(fn, a, b, n=10)</code>: Draw integral rects</li>
                <li><code>.transformed_grid(matrix)</code>: Linear transformations</li>
              </ul>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 16, marginBottom: 8 }}>Quick Helpers</h4>
              <p style={{ fontSize: 11, color: C.muted }}>
                <code>quick_plot(fn)</code><br/>
                <code>quick_vectors(v1, v2, ...)</code><br/>
                <code>quick_transform(matrix, vector=v)</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cells */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cells.map((cell) => (
          <CellComponent
            key={cell.id}
            cell={cell}
            C={C}
            onRun={runCell}
            onClear={clearOutput}
            onRemove={removeCell}
            onUpdate={updateCode}
            isExecuting={isExecuting}
            isOnlyCell={cells.length <= 1}
          />
        ))}
      </div>

      {/* Add cell button */}
      <button onClick={addCell}
        style={{
          width: '100%', marginTop: 12, padding: 16,
          border: `1.5px dashed ${C.border}`, borderRadius: 12,
          background: 'transparent', color: C.hint, fontSize: 13,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 6
        }}>
        + Add cell
      </button>

      {/* Footer */}
      <div style={{
        marginTop: 24, paddingTop: 16, borderTop: `0.5px solid ${C.border}`,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 12, color: C.hint, marginBottom: 8 }}>
          All cells share a single Python kernel. Variables persist between cells.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11, color: C.hint }}>
          {['Python 3.11+', 'WebAssembly', 'opencalc viz library', 'Shift+Enter to run'].map(t => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.teal, display: 'inline-block' }} />
              {t}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
