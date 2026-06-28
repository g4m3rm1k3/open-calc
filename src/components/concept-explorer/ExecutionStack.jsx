export default function ExecutionStack({ stack, topicMap, onJumpTo }) {
  if (stack.length <= 1) return null;

  return (
    <div className="mb-4 rounded-lg border border-gray-700 bg-gray-850 px-4 py-3 font-mono text-sm">
      <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">Execution Stack</div>
      <div className="flex flex-col gap-1">
        {stack.map((id, i) => {
          const topic = topicMap[id];
          const isLast = i === stack.length - 1;
          return (
            <div key={id + i} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-600 pl-2">↓</span>}
              {isLast ? (
                <span className="text-white font-semibold">{topic?.title ?? id}</span>
              ) : (
                <button
                  onClick={() => onJumpTo(i)}
                  className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  {topic?.title ?? id}
                </button>
              )}
              {isLast && <span className="text-gray-500 italic">← you are here</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
