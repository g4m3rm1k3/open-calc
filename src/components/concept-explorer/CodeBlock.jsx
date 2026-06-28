import { useState } from 'react';

export default function CodeBlock({ python = [], matlab = [] }) {
  const [lang, setLang] = useState('python');
  const lines = lang === 'python' ? python : matlab;

  return (
    <div className="mt-3">
      <div className="flex gap-2 mb-2">
        {['python', 'matlab'].map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
              lang === l
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {l === 'python' ? 'Python / NumPy' : 'MATLAB'}
          </button>
        ))}
      </div>
      <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
        {lines.map((item, i) => (
          <div
            key={i}
            className={`grid text-xs font-mono ${item.note ? 'grid-cols-[1fr_auto]' : 'grid-cols-1'} gap-0`}
          >
            <div className={`px-4 py-1 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'}`}>
              <span className="text-gray-500 select-none mr-3">{String(i + 1).padStart(2, ' ')}</span>
              <span className="text-emerald-300">{item.line}</span>
            </div>
            {item.note && (
              <div className={`px-4 py-1 border-l border-gray-700 text-gray-400 italic max-w-xs text-right ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'}`}>
                {item.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
