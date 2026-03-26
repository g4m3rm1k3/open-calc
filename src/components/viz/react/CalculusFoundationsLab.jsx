import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── UTILS & CONSTANTS ───────────────────────────────────────────────────────

const COLORS = {
  x: '#f59e0b',       // Amber - Independent
  y: '#3b82f6',       // Blue - Dependent
  func: '#10b981',    // Emerald - Function/Mapping
  change: '#ef4444',  // Red - Rate of Change
  semantic: '#8b5cf6',// Violet - Meaning/Context
  muted: '#64748b',   // Slate
  border: 'rgba(148, 163, 184, 0.1)',
  glass: 'rgba(15, 23, 42, 0.6)',
}

const Tag = ({ children, color }) => (
  <span style={{ 
    display: 'inline-block', padding: '1px 6px', borderRadius: '4px', fontSize: '0.85em', 
    background: color + '22', color: color, fontWeight: 500, margin: '0 2px', border: `1px solid ${color}44` 
  }}>
    {children}
  </span>
)

// ─── MODULES ────────────────────────────────────────────────────────────────

function Module1({ C, x, setX }) {
  // x -> y -> sin(y)
  const y = 2 * x 
  const z = Math.sin(y)

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm">1</span>
          Variable Dependency Engine
        </h3>
        <p className="text-slate-400 mb-6 text-sm">
          A variable is <Tag color={COLORS.y}>Dependent</Tag> if changing the <Tag color={COLORS.x}>Independent</Tag> knob forces it to move.
        </p>

        <div className="flex flex-col gap-8 items-center py-4">
          {/* Dependency Chain */}
          <div className="flex items-center gap-4 text-lg font-mono">
             <div className="flex flex-col items-center">
               <span className="text-amber-500 font-bold text-2xl">{x.toFixed(2)}</span>
               <span className="text-[10px] text-slate-500 uppercase tracking-tighter">x (Knob)</span>
             </div>
             <div className="text-slate-600">→</div>
             <div className="flex flex-col items-center">
               <motion.span animate={{ scale: [1, 1.1, 1] }} key={y} className="text-blue-400 font-bold text-2xl">{y.toFixed(2)}</motion.span>
               <span className="text-[10px] text-slate-500 uppercase tracking-tighter">y = 2x</span>
             </div>
             <div className="text-slate-600">→</div>
             <div className="flex flex-col items-center">
               <motion.span animate={{ scale: [1, 1.1, 1] }} key={z} className="text-emerald-400 font-bold text-2xl">{z.toFixed(2)}</motion.span>
               <span className="text-[10px] text-slate-500 uppercase tracking-tighter">sin(y)</span>
             </div>
          </div>

          <div className="w-full max-w-sm space-y-2">
             <div className="flex justify-between text-xs text-slate-500">
                <span>TURN THE KNOB (x)</span>
                <span>{x.toFixed(2)}</span>
             </div>
             <input 
               type="range" min="-2" max="2" step="0.01" value={x} 
               onChange={e => setX(parseFloat(e.target.value))}
               className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
          <div className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-1 font-mono">Assertion</div>
          <div className="text-slate-200 text-sm italic">"y is a function of x"</div>
        </div>
        <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
          <div className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-1 font-mono">Semantic Meaning</div>
          <div className="text-slate-200 text-sm italic">"If x moves, y MUST move."</div>
        </div>
      </div>
    </div>
  )
}

function Module2({ C, x, setX }) {
   // With Respect To
   return (
     <div className="space-y-6">
       <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
         <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
           <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm">2</span>
           "With Respect To" Decoder
         </h3>
         <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-6">
           <div className="text-violet-400 font-bold text-xs mb-1 font-mono">FORMAL DEFINITION</div>
           <p className="text-slate-300 text-sm">
             <span className="font-mono text-lg italic">"w.r.t. x"</span> = Treat <Tag color={COLORS.x}>x</Tag> as the thing that moves. Everything else is frozen unless it depends on x.
           </p>
         </div>

         <div className="space-y-8 py-4">
           {/* Case 1: Simple */}
           <div className="flex flex-col md:flex-row gap-6 items-center">
             <div className="flex-1 space-y-2">
               <div className="text-xs font-mono text-slate-500">CASE 1: d/dx [ sin(x) ]</div>
               <div className="text-2xl font-mono text-slate-200">cos(x)</div>
               <p className="text-xs text-slate-400">x moves, sine reacts. No chain rule needed because x is the source of motion.</p>
             </div>
             <div className="w-24 h-1 bg-slate-800 rounded-full md:w-1 md:h-12" />
             <div className="flex-1 space-y-2">
               <div className="text-xs font-mono text-slate-500">CASE 2: d/dx [ sin(y) ]</div>
               <div className="text-2xl font-mono text-slate-200">
                 cos(y) · <span className="text-blue-400">dy/dx</span>
               </div>
               <p className="text-xs text-slate-400">y moves <span className="italic">because</span> x moves. We must account for that propagation.</p>
             </div>
           </div>
         </div>
       </div>

       <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5 flex gap-4 items-start">
         <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl shrink-0">💡</div>
         <div>
           <div className="text-slate-200 font-bold text-sm mb-1">Analogy: The Knob and the String</div>
           <p className="text-slate-400 text-xs leading-relaxed">
             x is the knob. y is a string attached to the knob. If you differentiate <span className="font-mono italic">with respect to x</span>, you are asking: "How fast is the end of the string moving when I turn the knob?"
           </p>
         </div>
       </div>
     </div>
   )
}

function SymbolInterpreter({ currentContext }) {
  const definitions = {
    'dy/dx': { mean: 'Growth Rate', detail: 'How much y changes for every 1 unit of x change.' },
    'cos(y)': { mean: 'Local Sensitivity', detail: 'How fast the sine function oscillates right now.' },
    '·': { mean: 'Propagation', detail: 'Multiplying the effects together through the chain.' },
    'f⁻¹(x)': { mean: 'The Undo Rule', detail: 'A process that maps the output back to the start.' },
  }

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Semantic Debugger</div>
      <div className="space-y-4">
        {Object.entries(definitions).map(([sym, data]) => (
          <div key={sym} className="group cursor-help">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-sm text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded border border-white/5">{sym}</span>
              <span className="text-[10px] font-bold text-brand-400 uppercase">{data.mean}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight group-hover:text-slate-300 transition-colors">{data.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const MODULE_LIST = [
  { id: 1, title: 'Variable Dependency', comp: Module1 },
  { id: 2, title: 'W.R.T. Decoder', comp: Module2 },
  { id: 3, title: 'Chain Propagation', comp: ({ x, setX }) => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
         <h3 className="text-xl font-semibold mb-4">Chain Rule Engine</h3>
         <p className="text-sm text-slate-500 mb-6">If <Tag color={COLORS.y}>y</Tag> depends on <Tag color={COLORS.x}>x</Tag>, and <Tag color={COLORS.semantic}>Z</Tag> depends on <Tag color={COLORS.y}>y</Tag>...</p>
         
         <div className="flex justify-center py-8">
            <div className="relative flex items-center gap-12">
               <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center font-mono text-2xl text-amber-500 relative">
                  x
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -inset-2 border-2 border-amber-500/20 rounded-3xl"
                  />
               </div>
               <div className="text-slate-600 text-2xl font-bold">→</div>
               <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center font-mono text-2xl text-blue-500">y</div>
               <div className="text-slate-600 text-2xl font-bold">→</div>
               <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center font-mono text-2xl text-emerald-500">Z</div>
            </div>
         </div>

         <div className="text-center space-y-2 mt-4 font-mono text-lg bg-slate-800/40 p-4 rounded-xl border border-white/5">
            <div className="text-slate-400 text-xs uppercase mb-2">Total Propagation</div>
            <div className="text-slate-100">
              dZ/dx = <Tag color={COLORS.func}>dZ/dy</Tag> · <Tag color={COLORS.y}>dy/dx</Tag>
            </div>
         </div>
      </div>
      
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
        <div className="text-emerald-400 font-bold text-xs mb-1 font-mono">THE GOLDEN RULE</div>
        <p className="text-slate-300 text-sm font-serif">"Every time a change passes through a layer, you multiply by that layer's response rate."</p>
      </div>
    </div>
  )},
  { id: 4, title: 'Implicit Mystery', comp: ({ x, setX }) => (
    <div className="space-y-6">
       <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
         <h3 className="text-xl font-semibold mb-4">Implicit vs Explicit</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="space-y-4">
               <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs font-bold inline-block">EXPLICIT</div>
               <div className="text-2xl font-mono text-slate-100">y = x²</div>
               <p className="text-xs text-slate-500 leading-relaxed">The dependency is direct. We know <span className="italic">exactly</span> how x controls y. We can just "look" at the RHS and differentiate.</p>
            </div>
            <div className="space-y-4">
               <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded text-violet-400 text-xs font-bold inline-block">IMPLICIT</div>
               <div className="text-2xl font-mono text-slate-100">x² + y² = 1</div>
               <p className="text-xs text-slate-500 leading-relaxed">The dependency is hidden in a relationship. y still depends on x, but they are "tangled up." We differentiate <span className="italic">the relationship itself</span>.</p>
            </div>
         </div>
       </div>
       <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 space-y-3">
          <div className="text-slate-200 font-bold text-sm">Key Mental Model</div>
          <p className="text-slate-400 text-xs">
            In implicit differentiation, you don't care <span className="italic">what</span> y's formula is. You just assume y = y(x) exists, and the chain rule handles the rest.
          </p>
          <div className="font-mono text-brand-400 text-sm">d/dx [ y² ] → 2y · dy/dx</div>
       </div>
    </div>
  )},
  { id: 5, title: 'Derivative Machine', comp: ({ x, setX }) => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-xl font-semibold mb-4 text-brand-400 font-serif italic">"Derivative = Response Rate"</h3>
        <p className="text-sm text-slate-500 mb-8">Replace the abstract "slope" with the concrete "response".</p>
        
        <div className="flex flex-col gap-10 items-center">
            <div className="w-full flex items-center gap-4">
               <div className="shrink-0 w-24 text-amber-500 font-bold text-sm">Input Shift (Δx)</div>
               <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                  <motion.div 
                    animate={{ width: `${Math.abs(x) * 20}%` }}
                    className="h-full bg-amber-500"
                  />
               </div>
            </div>
            <div className="w-full flex items-center gap-4">
               <div className="shrink-0 w-24 text-blue-400 font-bold text-sm">Output Shift (Δy)</div>
               <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                  <motion.div 
                    animate={{ width: `${Math.abs(Math.sin(x)) * 80}%` }}
                    className="h-full bg-blue-400"
                  />
               </div>
            </div>
            
            <div className="bg-slate-800/60 px-6 py-4 rounded-2xl border border-white/5 text-center">
               <div className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-tighter">Response Ratio</div>
               <div className="text-3xl font-mono text-slate-200">
                 { (Math.cos(x)).toFixed(4) }
                 <span className="text-xs text-slate-500 ml-2">units of y / unit of x</span>
               </div>
            </div>
            
            <div className="w-full max-w-sm">
             <input 
               type="range" min="-1" max="1" step="0.01" value={x} 
               onChange={e => setX(parseFloat(e.target.value))}
               className="w-full accent-brand-500"
             />
             <div className="text-center text-[10px] text-slate-500 mt-2 font-mono uppercase">Vary the point to see the local response rate</div>
          </div>
        </div>
      </div>
    </div>
  )},
  { id: 7, title: 'Inverse Semantics', comp: () => (
    <div className="space-y-6">
       <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
         <h3 className="text-xl font-semibold mb-4">Inverse Function Meaning</h3>
         <p className="text-sm text-slate-500 mb-6">f⁻¹(x) is a <span className="italic">process</span>, not an exponent.</p>
         
         <div className="flex justify-center gap-12 items-center py-6">
            <div className="flex flex-col items-center gap-2">
               <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">f</div>
               <div className="text-[10px] text-slate-500">FORWARD</div>
            </div>
            <div className="text-slate-600 text-2xl tracking-tighter">⇄</div>
            <div className="flex flex-col items-center gap-2">
               <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">f⁻¹</div>
               <div className="text-[10px] text-slate-500">BACKWARD</div>
            </div>
         </div>

         <div className="p-4 bg-slate-800/40 rounded-xl border border-white/5 font-mono text-sm text-center">
            f( f⁻¹(x) ) = x
         </div>
       </div>

       <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <div className="text-amber-500 font-bold text-xs mb-1">Semantic Rule</div>
          <p className="text-slate-400 text-xs">The inverse function <span className="text-slate-200">reverses the dependency</span>. If f mapped years to population, f⁻¹ maps population back to years.</p>
       </div>
    </div>
  )},
  { id: 8, title: 'Rules of Thumb', comp: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {[
         { t: 'Chain Trigger', d: 'Function inside a function? Use Chain Rule.' },
         { t: 'Implicit Trigger', d: 'y mixed with x? Differentiate BOTH sides.' },
         { t: 'Inverse Strategy', d: 'Stuck with inverse? Rewrite it as y = f⁻¹(x) → f(y) = x.' },
         { t: 'Dependency Check', d: 'Does it change if x changes? Then it needs a derivative term.' }
       ].map((rule, i) => (
         <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg border-l-4 border-l-brand-500">
            <div className="text-brand-400 font-bold text-sm mb-1">{rule.t}</div>
            <p className="text-slate-500 text-xs leading-relaxed">{rule.d}</p>
         </div>
       ))}
    </div>
  )},
  { id: 9, title: 'Failure Modes', comp: () => (
    <div className="space-y-4">
       <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
          <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
            <span className="text-lg">⚠️</span> Common Confusion Modes
          </h3>
          <div className="space-y-6">
             <div className="group">
                <div className="text-slate-200 font-mono text-sm mb-1">"Why multiply by dy/dx?"</div>
                <div className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400">Because y is moving! If y is a passenger on the x-train, and you ask how fast the passenger is moving relative to the ground, you can't just look at the passenger's speed relative to the train. You must add the train's speed too.</div>
             </div>
             <div className="group">
                <div className="text-slate-200 font-mono text-sm mb-1">"Why √(1-x²) in trig derivatives?"</div>
                <div className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400">It's not a magic trick. It's the Pythagorean theorem applied to the triangle we forced into the unit circle to visualize the inverse ratio. It's just geometry in symbolic clothes.</div>
             </div>
             <div className="group">
                <div className="text-slate-200 font-mono text-sm mb-1">"Can I just memorize the formulas?"</div>
                <div className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400">You can, but you'll fail as soon as the variables change names. Understanding the <span className="italic">propagation of change</span> is the only way to survive engineering or physics problems.</div>
             </div>
          </div>
       </div>
    </div>
  )},
  { id: 10, title: 'The Roadmap', comp: () => (
    <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
       <h3 className="text-xl font-semibold mb-6">The Calculus Flow State</h3>
       <div className="flex flex-col gap-4 items-center">
          {[
            { t: 'Expression', desc: 'Look at the tangle of symbols', c: 'slate' },
            { t: 'Identify Dependencies', desc: 'Who moves when x moves?', c: 'amber' },
            { t: 'Apply Physics-of-Change', desc: 'Rules (Power/Trig/etc)', c: 'blue' },
            { t: 'Propagation (Chain Rule)', desc: 'Carry the effects through', c: 'emerald' },
            { t: 'Symbolic Polish', desc: 'Simplify for the reader', c: 'slate' }
          ].map((item, i) => (
            <div key={i} className="contents">
              <div className={`p-4 bg-${item.c}-500/10 border border-${item.c}-500/20 rounded-xl w-full max-w-sm group hover:scale-[1.02] transition-transform cursor-default`}>
                 <div className={`text-${item.c}-400 font-bold text-sm mb-1 font-mono`}>{item.t}</div>
                 <div className="text-slate-500 text-xs italic">{item.desc}</div>
              </div>
              {i < 4 && <div className="text-slate-700 font-bold text-xl">↓</div>}
            </div>
          ))}
       </div>
    </div>
  )}
]

export default function CalculusFoundationsLab({ params = {} }) {
  const [activeModule, setActiveModule] = useState(0)
  const [x, setX] = useState(0.5)
  const ModuleComp = MODULE_LIST[activeModule].comp

  return (
    <div className="w-full bg-slate-950 text-slate-200 font-sans p-2 sm:p-6 min-h-[600px] flex flex-col md:flex-row gap-6">
      
      {/* ─── SIDEBAR NAVIGATION ─── */}
      <div className="w-full md:w-64 shrink-0 space-y-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 font-mono">Foundations Lab</div>
           <nav className="flex flex-col gap-1">
             {MODULE_LIST.map((m, i) => (
               <button 
                 key={m.id}
                 onClick={() => setActiveModule(i)}
                 className={`text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group ${activeModule === i ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
               >
                 <span>{m.title}</span>
                 {activeModule === i && <motion.span layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-white" />}
               </button>
             ))}
           </nav>
        </div>

        <SymbolInterpreter />
        
        <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-2xl">
          <div className="text-[10px] font-mono text-brand-400/60 mb-2 uppercase italic tracking-widest font-bold">Mental Model Hint</div>
          <p className="text-[11px] text-slate-500 leading-relaxed italic">
            "Calculus isn't about curves. It's about tracking how motion in one place affects motion in another."
          </p>
        </div>
      </div>

      {/* ─── MAIN STAGE ─── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ModuleComp x={x} setX={setX} />
          </motion.div>
        </AnimatePresence>

        {/* Global Controls Overlay? No, keep it module specific or empty for now */}
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
          cursor: pointer;
          border: 2px solid #0f172a;
          margin-top: -6px;
        }
        input[type=range]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
          cursor: pointer;
          border: 2px solid #0f172a;
        }
      `}</style>
    </div>
  )
}
