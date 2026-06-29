function MatDisplay({M,label,color='#38bdf8'}) {
  return (
    <div className="mb-3">
      <div className="text-[10px] font-black tracking-wide uppercase mb-1" style={{color}}>{label}</div>
      <div className="font-mono text-[10px] text-slate-300 leading-relaxed bg-black/40 rounded-lg p-2 border shadow-inner" style={{borderColor: color+'44'}}>
        {M.map((row,i)=>(
          <div key={i}>{i===0?'⎡':i===M.length-1?'⎣':'⎢'}{' '}
            {row.map(v=>(v>=0?' ':'')+v.toFixed(3)).join('  ')}{' '}
            {i===0?'⎤':i===M.length-1?'⎦':'⎥'}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixPanel({axes}) {
  const M_C=Rz(axes.C*Math.PI/180);
  const M_A=Rx(axes.A*Math.PI/180);
  const M_table=mat4mul(M_A,M_C);
  return (
    <div className="p-4 overflow-y-auto h-full box-border">
      <div className="font-mono text-[9px] text-slate-400 leading-relaxed mb-4 bg-white/5 dark:bg-black/20 rounded-lg p-2.5 border border-slate-200/20 dark:border-white/10 shadow-sm">
        <span className="text-sky-400 font-bold">p_machine</span> = Rx(A) · Rz(C) · p_part<br/>
        Tool = [0,0,−1] always &nbsp;·&nbsp; TABLE rotates, not spindle<br/>
        IK: C = atan2(nx,ny) &nbsp;·&nbsp; A = acos(nz) − lead
      </div>
      <MatDisplay M={M_C} label={`Rz(C) — table spin  C=${axes.C.toFixed(1)}°`} color='#fbbf24'/>
      <div className="text-[9px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
        Rotates part around Z axis. The 2×2 block in rows 0–1 is [cosC, −sinC; sinC, cosC].
        Spinning C brings any profile direction under the vertical spindle.
      </div>
      <MatDisplay M={M_A} label={`Rx(A) — tilt  A=${axes.A.toFixed(1)}°`} color='#f43f5e'/>
      <div className="text-[9px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
        Tilts entire C+table assembly around machine X. The 2×2 in rows 1–2 is [cosA, −sinA; sinA, cosA].
        A=0 = flat. A=90° = table tipped 90° on its side.
      </div>
      <MatDisplay M={M_table} label='M = Rx(A)·Rz(C)  (part→machine)' color='#a855f7'/>
      <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Combined rotation. det=1, rows are orthonormal — it's a pure rotation, no scaling/shearing.
        The 3×3 upper-left block fully determines the orientation.
      </div>
    </div>
  );
}

const MATH={
  egg:{title:'Ball-end / Bull-nose Surface Contouring',items:[
    {h:'Ellipsoid parameterization',c:'#38bdf8',b:'p(u,v)=[36·sinv·cosu, 36·sinv·sinu, rz·cosv]. Two angular parameters u∈[0,2π], v∈[0,π] cover every point — like longitude/latitude. The spiral toolpath increments both u and v simultaneously.'},
    {h:'Surface normal from gradient',c:'#f43f5e',b:'For ellipsoid F=x²/rx²+y²/ry²+z²/rz²=1, outward normal n=∇F/|∇F|=[x/rx², y/ry², z/rz²] normalized. This is the exact analytic normal — no numerical differentiation needed.'},
    {h:'IK: C = atan2(nx, ny)',c:'#34d399',b:'C spins the part so the X component of n goes to zero, landing n in the YZ plane. After Rz(C), n becomes [0, √(nx²+ny²), nz]. Think of it as choosing your longitude.'},
    {h:'IK: A = acos(nz) − lead',c:'#fbbf24',b:'A tilts until the normal faces up. Since nz=cos(A) at perfect tracking, A=acos(nz) is the exact solution. Subtracting lead tilts the table slightly less → ball contacts the side of the tool rather than the very tip → better chip flow.'},
  ]},
  cam:{title:'Side-wall & Swarf Milling',items:[
    {h:'Cam profile  r(u) = 28 + 16·cos²·⁵(u)',c:'#fbbf24',b:'The lobe rises quickly (cosine power 2.5) then falls gradually. This asymmetry means the chip cross-section varies around the profile — a real CAM system would modulate feed rate to keep chip load constant.'},
    {h:'Near-vertical walls → A ≈ 85°',c:'#38bdf8',b:'Side wall normals are horizontal: n≈[nx,ny,0]. The IK gives A=acos(0)=90°. Adding a 5° upward blend to the normal gives A≈85°, staying away from the mechanical limit while giving a useful side-contact geometry.'},
    {h:'C tracks the profile direction',c:'#34d399',b:'C=atan2(nx,ny) continuously changes as the tool traverses the cam profile. C effectively aims the "tilt direction" at the current wall face. The boustrophedon (zigzag) pattern is the standard contour strategy for side walls.'},
    {h:'Lead on a side wall = swarf',c:'#f43f5e',b:'Adding lead on a near-vertical wall brings the tool flank into contact — that\'s swarf milling. The side of the flute removes material. Extremely fast but requires a ruled surface (straight generator line) or the tool gouges.'},
  ]},
  bell:{title:'Dome & Flare — A-axis sweep',items:[
    {h:'Compound profile',c:'#34d399',b:'r(t)=22·sinα+18·t^2.5·sinα, z=56·cosα−10·t³·sinα. The t^2.5 flare widens the skirt rapidly with a curvature that changes throughout — typical for bell-housing and turbine cover shapes.'},
    {h:'A sweeps 0→~72°',c:'#38bdf8',b:'At the top nz≈1 → A≈0°. At the flare nz≈0.3 → A≈72°. The trunnion swings 72° to follow the surface. Watch the A slider during playback — the most active axis on this part.'},
    {h:'Curvature → required stepover',c:'#fbbf24',b:'Tight curvature means toolpath rows diverge less per unit height — smaller stepover needed to hit the surface finish spec. CAM computes this from the part\'s principal curvature κ₁ and κ₂ at each point.'},
    {h:'Polar singularity',c:'#f43f5e',b:'At the dome top n=[0,0,1] → C is undefined (any C value works). Post-processors handle this with "polar interpolation" — clamping C motion or using a smooth C=const pass through the pole.'},
  ]},
};

function MathPanel({shape}) {
  const [open,setOpen]=useState(0);
  const c=MATH[shape]||MATH.egg;
  return (
    <div className="p-4 overflow-y-auto h-full box-border">
      <div className="font-bold text-slate-700 dark:text-slate-200 text-[12px] mb-3">{c.title}</div>
      <div className="flex flex-col gap-2">
        {c.items.map((item,i)=>(
          <div key={i} className={`rounded-lg overflow-hidden transition-all duration-300 border ${open===i?'shadow-sm':'border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'}`} style={open===i?{borderColor: item.c+'55', background: item.c+'0a'}:{}}>
            <button onClick={()=>setOpen(open===i?-1:i)}
              className="w-full px-3 py-2.5 border-none cursor-pointer text-left font-bold text-[10.5px] flex justify-between items-center bg-transparent transition-colors"
              style={{color:open===i?item.c:'currentColor'}}>
              <span className={open!==i?'text-slate-600 dark:text-slate-400':''}>{item.h}</span>
              <span className={`transition-transform duration-300 text-[9px] ${open===i?'rotate-180 opacity-80':'opacity-40 text-slate-500'}`}>▼</span>
            </button>
            <div className={`transition-all duration-300 ease-in-out origin-top ${open===i?'max-h-40 opacity-100':'max-h-0 opacity-0'}`}>
              <div className="px-3 pb-3 text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {item.b}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const SHAPES=[
  {id:'egg', label:'Egg',  desc:'Normal tracking',     color:'#0ea5e9'},
  {id:'cam', label:'Cam',  desc:'Side-wall · swarf',   color:'#f59e0b'},
  {id:'bell',label:'Bell', desc:'Dome + flare',        color:'#10b981'},
];

export default function FiveAxisKinematics({onBack}) {
  const [shape,setShape]=useState('egg');
  const [axes,setAxes]=useState({X:0,Y:0,Z:0,A:0,C:0});
  const [leadDeg,setLeadDeg]=useState(5);
  const [shows,setShows]=useState({toolpath:true,normals:false,vectors:true,matrices:true,math:false});
  const [activeIdx,setActiveIdx]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [rightTab,setRightTab]=useState('matrices');
  const playRef=useRef(null);

  const geom=useMemo(()=>shape==='egg'?generateEgg():shape==='cam'?generateCam():generateBell(),[shape]);
  const path=useMemo(()=>makeToolpath(shape,leadDeg),[shape,leadDeg]);

  useEffect(()=>{
    if(!playing) return;
    playRef.current=setInterval(()=>{
      setActiveIdx(i=>{
        const next=i+1>=path.length?0:i+1;
        if(next===0){setPlaying(false);}
        const s=path[next]||path[0];
        if(s) setAxes({A:s.A_deg,C:s.C_deg,X:s.X,Y:s.Y,Z:s.Z});
        return next;
      });
    },28);
    return ()=>clearInterval(playRef.current);
  },[playing,path]);

  const toggle=k=>setShows(s=>({...s,[k]:!s[k]}));

  const TOGG=[
    {k:'toolpath',label:'Toolpath',c:'#eab308'},
    {k:'normals', label:'Normals', c:'#f43f5e'},
    {k:'vectors', label:'Vectors', c:'#38bdf8'},
    {k:'matrices',label:'Matrices',c:'#a855f7'},
    {k:'math',    label:'Math',    c:'#34d399'},
  ];
  const step=path[activeIdx]||null;
  const curShapeObj = SHAPES.find(s=>s.id===shape) || SHAPES[0];

  return (
    <div className="w-full h-full bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl text-slate-800 dark:text-slate-200 font-sans flex flex-col overflow-hidden relative shadow-2xl rounded-2xl border border-slate-200/50 dark:border-white/5">

      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/5 px-6 py-3 flex items-center gap-4 shrink-0 shadow-sm z-10 backdrop-blur-md transition-colors duration-500 flex-wrap">
        {onBack&&(
          <button onClick={onBack} className="bg-transparent border-none text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer text-[11px] tracking-widest font-sans font-bold px-0 transition-colors uppercase">
            ← Labs
          </button>
        )}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 hidden md:block"/>
        
        <div className="flex flex-col">
          <div className="text-[16px] font-black tracking-wide text-slate-800 dark:text-slate-100 font-sans">5-Axis Kinematics</div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase font-bold mt-0.5">
            Table/Trunnion · Spindle vertical · A &amp; C on table
          </div>
        </div>

        <div className="flex-1 min-w-[20px]"/>

        <div className="flex gap-2 flex-wrap items-center bg-slate-100/50 dark:bg-black/20 p-1.5 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-inner">
          {SHAPES.map(s=>(
            <button key={s.id} onClick={()=>{setShape(s.id);setActiveIdx(0);setPlaying(false);}}
              className={`px-3 py-1.5 rounded-lg cursor-pointer text-[10px] font-bold transition-all border flex items-center gap-2 ${shape===s.id ? 'shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
              style={shape===s.id ? { background: s.color, color: '#fff', borderColor: s.color } : { background: 'transparent', borderColor: 'transparent', color: 'currentColor' }}>
              <span>{s.label}</span>
              <span className={`text-[9px] ${shape===s.id ? 'opacity-90' : 'opacity-50'}`}>{s.desc}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 hidden lg:block"/>

        <div className="flex gap-1.5 flex-wrap items-center">
          {TOGG.map(({k,label,c})=>(
            <button key={k} onClick={()=>toggle(k)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all border shadow-sm`}
              style={shows[k] ? { background: c+'1e', borderColor: c, color: c } : { background: 'transparent', borderColor: 'rgba(100,116,139,0.3)', color: 'currentColor', opacity: 0.6 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-100/30 dark:bg-transparent">

        {/* Left Control Panel */}
        <div className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800/60 flex flex-col overflow-hidden bg-white/60 dark:bg-slate-950/40 z-10 backdrop-blur-md">

          {/* Machine Axes */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400/50"></span> Machine Axes
            </div>
            <div className="flex flex-col gap-3">
              {[{k:'X',min:-100,max:100,c:'#ef4444',u:'mm'},{k:'Y',min:-100,max:100,c:'#22c55e',u:'mm'},
                {k:'Z',min:-80,max:80,c:'#3b82f6',u:'mm'},{k:'A',min:-110,max:110,c:'#f59e0b',u:'°'},
                {k:'C',min:-180,max:180,c:'#a855f7',u:'°'}
              ].map(({k,min,max,c,u})=>(
                <div key={k} className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold text-[11px] font-mono" style={{color:c}}>{k}</span>
                  <input type='range' min={min} max={max} step={0.5} value={axes[k]}
                    onChange={e=>{setAxes(a=>({...a,[k]:parseFloat(e.target.value)}));setPlaying(false);}}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    style={{accentColor:c}}/>
                  <span className="w-12 text-right font-mono text-[9.5px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-900 px-1.5 py-1 rounded shadow-inner">
                    {axes[k].toFixed(1)}{u}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Angle */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400/50"></span> Lead Angle
            </div>
            <div className="flex items-center gap-2 mb-3">
              <input type='range' min={0} max={15} step={0.5} value={leadDeg}
                onChange={e=>setLeadDeg(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" style={{accentColor:'#f43f5e'}}/>
              <span className="font-mono text-[10px] text-rose-500 font-bold w-12 text-right bg-rose-50 dark:bg-rose-500/10 px-1.5 py-1 rounded shadow-inner">
                {leadDeg.toFixed(1)}°
              </span>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Offsets A past perfect IK. <span className="text-rose-500 font-bold">Red dot</span> = contact on bull nose.
            </div>
          </div>

          {/* Toolpath Controls */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400/50"></span> Toolpath
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={()=>setPlaying(v=>!v)}
                className={`flex-1 py-1.5 rounded-lg cursor-pointer font-bold text-[10px] uppercase tracking-wider transition-all border shadow-sm flex justify-center items-center gap-1.5 ${
                  playing ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                }`}>
                {playing?'⏸ Pause':'▶ Play'}
              </button>
              <button onClick={()=>{setActiveIdx(0);setPlaying(false);setAxes({X:0,Y:0,Z:0,A:0,C:0});}}
                className="px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors" title="Reset">
                ↺
              </button>
            </div>
            <div className="relative pt-1">
              <input type='range' min={0} max={Math.max(0,path.length-1)} value={activeIdx}
                onChange={e=>{
                  const idx=parseInt(e.target.value); setActiveIdx(idx); setPlaying(false);
                  if(path[idx]){const s=path[idx];setAxes({A:s.A_deg,C:s.C_deg,X:s.X,Y:s.Y,Z:s.Z});}
                }}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" style={{accentColor:curShapeObj.color}}/>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 text-center mt-3 font-mono font-medium tracking-wide">
              <span style={{color:curShapeObj.color}}>{activeIdx+1}</span> / {path.length} PTS
            </div>
          </div>

          {/* IK Solution Live Data */}
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400/50"></span> IK Solution
            </div>
            {step&&(
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[['A',step.A_deg,'°','#f59e0b'],['C',step.C_deg,'°','#a855f7'],
                  ['X',step.X,'mm','#ef4444'],['Y',step.Y,'mm','#22c55e'],['Z',step.Z,'mm','#3b82f6']
                ].map(([k,v,u,c])=>(
                  <div key={k} className="bg-slate-100/80 dark:bg-black/20 rounded-lg p-2 border border-slate-200/50 dark:border-white/5 shadow-inner">
                    <div className="text-[8px] text-slate-400 uppercase font-black">{k}</div>
                    <div className="font-mono text-[11px] font-bold" style={{color:c}}>{v.toFixed(1)}<span className="opacity-50 ml-0.5">{u}</span></div>
                  </div>
                ))}
              </div>
            )}
            {step?.nPart&&(
              <div className="text-[9.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-mono bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-3 mb-4 shadow-inner">
                <span className="text-indigo-500 dark:text-indigo-400 font-bold block mb-1">n_part</span>
                [{step.nPart.map(v=>v>=0?' '+v.toFixed(3):v.toFixed(3)).join(', ')}]
              </div>
            )}
            <div className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Tool axis [0,0,−1] always.<br/>
              Table rotates — spindle translates only.
            </div>
          </div>
        </div>

        {/* Viewport 3D */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#03060a] min-w-0 relative shadow-inner">
          <div className="flex-1 overflow-hidden relative">
            <Viewport3D geom={geom} path={path} axes={axes} shows={shows}
              activeIdx={activeIdx} leadDeg={leadDeg} shape={shape}/>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/60 text-[9px] text-slate-500 dark:text-slate-400 shrink-0 flex gap-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md uppercase tracking-wider font-bold shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <span className="flex items-center gap-1.5"><span className="text-[12px]">🖱️</span> Drag to rotate · Scroll to zoom</span>
            <span className="flex items-center gap-1.5 ml-auto"><span className="inline-block w-4 h-0 border-t border-dashed border-slate-400"></span> Part Frame</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0 border-t border-solid border-slate-400"></span> Machine Frame</span>
          </div>
        </div>

        {/* Right Info Panel */}
        {(shows.matrices||shows.math)&&(
          <div className="w-80 shrink-0 border-l border-slate-200 dark:border-slate-800/60 flex flex-col overflow-hidden bg-white/60 dark:bg-slate-950/40 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] backdrop-blur-md">
            {shows.matrices&&shows.math&&(
              <div className="flex border-b border-slate-200 dark:border-slate-800/60 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                {['matrices','math'].map(t=>(
                  <button key={t} onClick={()=>setRightTab(t)}
                    className={`flex-1 py-3 bg-transparent border-none cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${
                      rightTab===t 
                        ? 'text-slate-800 dark:text-white border-b-2 shadow-[inset_0_-2px_0_0_currentColor]' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-b-2 border-transparent'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
                {shows.matrices&&(!shows.math||rightTab==='matrices')&&<MatrixPanel axes={axes}/>}
                {shows.math&&(!shows.matrices||rightTab==='math')&&<MathPanel shape={shape}/>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
