export default function ExecutionStack({ stack, topicMap, onJumpTo }) {
  if (stack.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 font-mono text-[13px] transition-colors duration-500">
      {stack.map((id, i) => {
        const topic = topicMap[id];
        const isLast = i === stack.length - 1;
        return (
          <div key={id + i} className="flex flex-col">
            {i > 0 && <div className={`pl-[11px] py-1 text-[16px] font-bold transition-colors duration-500 ${isLast ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 dark:text-slate-600'}`}>↓</div>}
            <div className="flex items-start gap-3 relative">
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 transition-all duration-500 ${isLast ? 'bg-brand-500 shadow-[0_0_8px_rgba(var(--tw-custom-brand-500),0.6)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
              {isLast ? (
                <div className="flex flex-col font-sans">
                  <span className={`font-bold leading-tight transition-colors duration-500 text-brand-600 dark:text-brand-400`}>
                    {topic?.title ?? id}
                  </span>
                  <span className={`text-[10px] uppercase tracking-widest font-bold mt-1 transition-colors duration-500 text-brand-600 dark:text-brand-400`}>Current</span>
                </div>
              ) : (
                <button
                  onClick={() => onJumpTo(i)}
                  className={`font-sans text-left font-medium leading-tight transition-colors duration-500 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400`}
                >
                  {topic?.title ?? id}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
