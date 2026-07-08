import { useState, useMemo, useRef } from 'react';
import { runPythonInline, runOpenMATInline } from '../../utils/inlineRunner.js';

function buildSource(items, commentToken) {
  const body = items
    .map(item => (item.note ? `${item.line}  ${commentToken} ${item.note}` : item.line))
    .join('\n');
  // These snippets were written as continuations of a tutorial (numpy already
  // imported as `np` from an earlier lesson), so standalone runs need it back.
  if (commentToken === '#' && /\bnp\./.test(body) && !/import numpy/.test(body)) {
    return `import numpy as np\n\n${body}`;
  }
  return body;
}

export default function CodeBlock({ python = [], matlab = [] }) {
  const [lang, setLang] = useState('python');
  const pythonSource = useMemo(() => buildSource(python, '#'), [python]);
  const matlabSource = useMemo(() => buildSource(matlab, '%'), [matlab]);

  const [pythonCode, setPythonCode] = useState(pythonSource);
  const [matlabCode, setMatlabCode] = useState(matlabSource);
  const code = lang === 'python' ? pythonCode : matlabCode;
  const setCode = lang === 'python' ? setPythonCode : setMatlabCode;
  const original = lang === 'python' ? pythonSource : matlabSource;

  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState([]);
  const runIdRef = useRef(0);

  async function run() {
    setRunning(true);
    setOutput([]);
    const runId = ++runIdRef.current;
    const append = line => {
      if (runIdRef.current !== runId) return;
      setOutput(o => [...o, line]);
    };

    if (lang === 'python') {
      append({ type: 'dim', text: '» Starting Python runtime (first run downloads Pyodide — may take a few seconds)…' });
      const { error } = await runPythonInline(code, append);
      if (error) append({ type: 'error', text: error });
    } else {
      const { output: out, error } = runOpenMATInline(code);
      if (error) append({ type: 'error', text: error });
      else append({ type: 'output', text: out });
    }
    if (runIdRef.current === runId) setRunning(false);
  }

  function reset() {
    setCode(original);
    setOutput([]);
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2 mb-2">
        {['python', 'matlab'].map(l => (
          <button
            key={l}
            onClick={() => { setLang(l); setOutput([]); }}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
              lang === l
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 dark:bg-slate- text-slate-700 dark:text-slate- hover:bg-slate-300 dark:hover:bg-slate-'
            }`}
          >
            {l === 'python' ? 'Python / NumPy' : 'MATLAB'}
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-300 dark:border-slate- bg-white dark:bg-slate- shadow-sm">
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          rows={Math.max(4, code.split('\n').length)}
          className="w-full font-mono text-[13px] leading-6 px-4 py-3 bg-transparent text-slate-800 dark:text-emerald-300 outline-none resize-none"
        />
        <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-200 dark:border-slate- bg-slate-50 dark:bg-slate-">
          <button
            onClick={run}
            disabled={running}
            className="px-3 py-1 rounded text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-wait text-white transition-colors"
          >
            {running ? '⏳ running…' : '▶ Run'}
          </button>
          {code !== original && (
            <button
              onClick={reset}
              className="px-3 py-1 rounded text-xs font-mono text-slate-500 dark:text-slate- hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              ↺ reset to example
            </button>
          )}
          <span className="text-[11px] text-slate-400 dark:text-slate- ml-auto">
            edit the code — try your own numbers
          </span>
        </div>

        {output.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate- bg-slate-900 dark:bg-black px-4 py-3 font-mono text-[13px] leading-6 max-h-72 overflow-y-auto">
            {output.map((line, i) =>
              line.type === 'image' ? (
                <img key={i} src={`data:image/png;base64,${line.src}`} alt="plot output" className="my-2 rounded max-w-full" />
              ) : (
                <div
                  key={i}
                  className={
                    line.type === 'error' ? 'text-red-400' :
                    line.type === 'dim' ? 'text-slate- italic' :
                    'text-emerald-300'
                  }
                >
                  {line.text}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
