import React, { useState, useEffect } from 'react';

export function HUD({ puzzle, targetPos, shipPos, phase, onAcceptMission, onSolve, onOpenCodex }) {
  const [inputs, setInputs] = useState({});
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (puzzle) {
      const initialInputs = {};
      puzzle.inputs.forEach(inp => { initialInputs[inp.id] = '' });
      setInputs(initialInputs);
      setFeedback(null);
    }
  }, [puzzle]);

  const handleInputChange = (id, val) => {
    setInputs(prev => ({ ...prev, [id]: val }));
  };

  const handleFire = () => {
    if (!puzzle) return;
    let allCorrect = true;
    puzzle.inputs.forEach(inp => {
      const v = parseFloat(inputs[inp.id]);
      if (isNaN(v) || Math.abs(v - inp.ans) > 0.05) allCorrect = false;
    });

    if (allCorrect) {
      setFeedback({ type: 'ok', msg: '✓ CORRECT — SOLUTION LOCKED' });
      setTimeout(() => {
        onSolve();
      }, 1000);
    } else {
      setFeedback({ type: 'err', msg: '✗ INCORRECT — Check your arithmetic' });
    }
  };

  const dist = targetPos && shipPos ? shipPos.distanceTo(targetPos).toFixed(1) : '---';

  return (
    <>
      {/* Free Flight Crosshair & Mission Prompt */}
      {phase === 'free_flight' && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-20">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="14" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="20" y1="2" x2="20" y2="10" stroke="#22d3ee" strokeWidth="1"/>
              <line x1="20" y1="30" x2="20" y2="38" stroke="#22d3ee" strokeWidth="1"/>
              <line x1="2" y1="20" x2="10" y2="20" stroke="#22d3ee" strokeWidth="1"/>
              <line x1="30" y1="20" x2="38" y2="20" stroke="#22d3ee" strokeWidth="1"/>
              <circle cx="20" cy="20" r="2" fill="#22d3ee" fillOpacity="0.7"/>
            </svg>
          </div>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <button 
              onClick={onAcceptMission}
              className="px-8 py-3 bg-red-500/20 border border-red-500 text-red-400 font-bold tracking-[0.2em] animate-pulse hover:bg-red-500/40 uppercase"
            >
              ⚠ INCOMING MISSION TRANSMISSION — CLICK TO ACCEPT ⚠
            </button>
          </div>
        </>
      )}

      {/* Math Puzzle Console */}
      {phase === 'math_puzzle' && puzzle && (
        <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 border-t border-cyan-500/30 text-cyan-200 font-mono pointer-events-auto z-50">
          <div className="flex items-center gap-4 px-6 py-2 border-b border-cyan-500/20">
            <div className="text-xs tracking-widest text-cyan-400 font-bold">▲ TARGETING CONSOLE</div>
            <div className="px-3 py-1 text-[10px] tracking-widest border border-orange-500/50 text-orange-400 bg-orange-500/10 rounded-sm">
              {puzzle.mode}
            </div>
            <button 
              onClick={onOpenCodex}
              className="ml-auto px-4 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-[10px] font-bold tracking-widest hover:bg-cyan-500/40"
            >
              [DATABANK]
            </button>
          </div>
          
          <div className="flex gap-8 p-6 items-start">
            <div className="flex-1 flex flex-col gap-3">
              <div className="text-xs text-cyan-300 leading-relaxed max-w-2xl whitespace-pre-line">
                {puzzle.desc}
              </div>
              <div className="text-sm text-yellow-300 bg-yellow-500/5 border-l-2 border-yellow-500/40 px-4 py-2 whitespace-pre-line tracking-wide">
                {puzzle.eq}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {puzzle.inputs.map(inp => (
                  <div key={inp.id} className="flex items-center gap-2">
                    <label className="text-[10px] text-emerald-400 tracking-widest">{inp.label}</label>
                    <input
                      type="number"
                      value={inputs[inp.id] || ''}
                      onChange={e => handleInputChange(inp.id, e.target.value)}
                      onKeyDown={e => { if(e.key === 'Enter') handleFire(); }}
                      className="w-16 h-8 bg-slate-900 border border-cyan-500/40 rounded text-center text-cyan-300 outline-none focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                    />
                  </div>
                ))}
                <button
                  onClick={handleFire}
                  className="ml-4 px-5 py-1.5 border border-red-500 text-red-400 text-xs tracking-widest uppercase hover:bg-red-500/10 rounded transition-colors font-bold"
                >
                  ▶ EXECUTE
                </button>
                <button
                  onClick={() => setFeedback({ type: 'hint', msg: puzzle.hint })}
                  className="px-3 py-1 text-[10px] text-cyan-400/60 border border-cyan-500/30 hover:bg-cyan-500/10 rounded"
                >
                  [H] HINT
                </button>
              </div>
              
              <div className="h-4 text-[11px] tracking-wide mt-1">
                {feedback && (
                  <span className={
                    feedback.type === 'ok' ? 'text-emerald-400' :
                    feedback.type === 'err' ? 'text-red-400' : 'text-amber-400'
                  }>
                    {feedback.msg}
                  </span>
                )}
              </div>
            </div>
            
            <div className="min-w-[200px] border-l border-cyan-500/20 pl-6 space-y-4">
              <div>
                <div className="text-[9px] text-emerald-500 tracking-widest">TARGET</div>
                <div className="text-sm text-cyan-300 font-bold">OBJECTIVE MARKER</div>
              </div>
              <div>
                <div className="text-[9px] text-emerald-500 tracking-widest">DISTANCE</div>
                <div className="text-sm text-cyan-300">{dist} km</div>
              </div>
              {targetPos && (
                <div>
                  <div className="text-[9px] text-emerald-500 tracking-widest">POSITION</div>
                  <div className="text-sm text-cyan-300">[{targetPos.toArray().map(v => v.toFixed(1)).join(', ')}]</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
