import React, { useState, useMemo } from 'react';
import PythonNotebook from '../notebooks/PythonNotebook.jsx';
import OpenMatNotebook from '../notebooks/OpenMatNotebook.jsx';

function buildSource(items, commentToken) {
  const body = items
    .map(item => (item.note ? `${item.line}  ${commentToken} ${item.note}` : item.line))
    .join('\n');
  if (commentToken === '#' && /\bnp\./.test(body) && !/import numpy/.test(body)) {
    return `import numpy as np\n\n${body}`;
  }
  return body;
}

export default function CodeBlock({ python = [], matlab = [] }) {
  const [lang, setLang] = useState('python');

  const pythonSource = useMemo(() => buildSource(python, '#'), [python]);
  const matlabSource = useMemo(() => buildSource(matlab, '%'), [matlab]);

  const pythonParams = useMemo(() => ({
    initialCells: [{ id: 1, code: pythonSource, output: "", status: "idle", figureJson: null }]
  }), [pythonSource]);

  const matlabParams = useMemo(() => ({
    initialCells: [{ id: 1, code: matlabSource, output: "", status: "idle", figureJson: null }]
  }), [matlabSource]);

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
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {l === 'python' ? 'Python / NumPy' : 'MATLAB'}
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden shadow-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0d1117]">
        {lang === 'python' ? (
          <PythonNotebook params={pythonParams} />
        ) : (
          <OpenMatNotebook params={matlabParams} />
        )}
      </div>
    </div>
  );
}
