import React, { useState, useEffect } from 'react';

export function HUD({ puzzle, targetPos, shipPos, onSolve }) {
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

  if (!puzzle) return null;

  const handleInputChange = (id, val) => {
    setInputs(prev => ({ ...prev, [id]: val }));
  };

  const handleFire = () => {
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
    <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 border-t border-cyan-500/30 text-cyan-200 font-mono pointer-events-auto z-10">
      <div className="flex items-center gap-4 px-6 py-2 border-b border-cyan-500/20">
        <div className="text-xs tracking-widest text-cyan-400 font-bold">▲ TARGETING CONSOLE</div>
        <div className="px-3 py-1 text-[10px] tracking-widest border border-orange-500/50 text-orange-400 bg-orange-500/10 rounded-sm">
          {puzzle.mode}
        </div>
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
  );
}
