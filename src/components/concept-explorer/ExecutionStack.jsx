export default function ExecutionStack({ stack, topicMap, onJumpTo }) {
  if (stack.length <= 1) return null;

  return (
    <div className="mb-8 rounded-2xl border border-slate-700/50 bg-[#0e0e1a]/80 px-6 py-4 shadow-lg backdrop-blur-sm">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Execution Stack</div>
      <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
        {stack.map((id, i) => {
          const topic = topicMap[id];
          const isLast = i === stack.length - 1;
          return (
            <div key={id + i} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-600 font-normal">→</span>}
              {isLast ? (
                <span className="text-white px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                  {topic?.title ?? id}
                </span>
              ) : (
                <button
                  onClick={() => onJumpTo(i)}
                  className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-indigo-500/20"
                >
                  {topic?.title ?? id}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
