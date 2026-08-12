import { useEffect, useMemo, useRef, useState } from 'react';

const FLAG_INFO = [
  { flag: 'g', label: 'g — global', hint: 'find every match, not just the first' },
  { flag: 'i', label: 'i — ignore case', hint: '"A" and "a" match each other' },
  { flag: 'm', label: 'm — multiline', hint: '^ and $ match at each line break, not just start/end of string' },
  { flag: 's', label: 's — dotAll', hint: '. also matches newline characters' },
  { flag: 'u', label: 'u — unicode', hint: 'treats the pattern as a sequence of code points, enables \\p{...}' },
];

const TIMEOUT_MS = 500;

// Runs entirely inside a Web Worker so a pathological pattern (this reference
// literally has a lesson on catastrophic backtracking — learners WILL type
// one in) can be killed by terminating the worker instead of freezing the tab.
const WORKER_SRC = `
self.onmessage = function (e) {
  const { pattern, flags, testString, reqId } = e.data;
  try {
    const re = new RegExp(pattern, flags);
    const toMatch = (m) => ({
      full: m[0],
      index: m.index,
      groups: m.groups || null,
      captures: Array.from(m).slice(1),
    });
    let matches;
    if (flags.includes('g')) {
      matches = Array.from(testString.matchAll(re)).map(toMatch);
    } else {
      const m = re.exec(testString);
      matches = m ? [toMatch(m)] : [];
    }
    self.postMessage({ reqId, ok: true, matches });
  } catch (err) {
    self.postMessage({ reqId, ok: false, error: err.message });
  }
};
`;

function useSafeMatcher(pattern, flags, testString) {
  const [state, setState] = useState({ status: 'ok', matches: [], error: null });
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);
  const reqIdRef = useRef(0);
  const debounceRef = useRef(null);

  function spawnWorker() {
    const blob = new Blob([WORKER_SRC], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    worker.onmessage = (e) => {
      if (e.data.reqId !== reqIdRef.current) return; // stale response — input already changed again
      clearTimeout(timeoutRef.current);
      if (e.data.ok) setState({ status: 'ok', matches: e.data.matches, error: null });
      else setState({ status: 'ok', matches: [], error: e.data.error });
    };
    workerRef.current = worker;
  }

  useEffect(() => {
    spawnWorker();
    return () => workerRef.current?.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const reqId = ++reqIdRef.current;
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        // No response in time — this pattern/input is (almost certainly) backtracking
        // catastrophically. Kill the stuck worker and start a fresh one for next time.
        workerRef.current?.terminate();
        spawnWorker();
        setState({ status: 'timeout', matches: [], error: null });
      }, TIMEOUT_MS);
      setState(s => ({ ...s, status: 'pending' }));
      workerRef.current?.postMessage({ pattern, flags, testString, reqId });
    }, 150);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, flags, testString]);

  return state;
}

// Splits testString into alternating plain/matched segments so the JSX
// render pass never has to reason about overlapping ranges itself.
function buildSegments(testString, matches) {
  if (matches.length === 0) return [{ text: testString, isMatch: false }];
  const segments = [];
  let cursor = 0;
  for (const m of matches) {
    const start = m.index;
    const end = start + m.full.length;
    if (start > cursor) segments.push({ text: testString.slice(cursor, start), isMatch: false });
    segments.push({ text: testString.slice(start, end) || '(empty match)', isMatch: true });
    cursor = Math.max(cursor, end === start ? end + 1 : end); // avoid an infinite loop on zero-length matches
  }
  if (cursor < testString.length) segments.push({ text: testString.slice(cursor), isMatch: false });
  return segments;
}

export default function RegexDemo({ topic }) {
  const demo = topic.demo ?? { pattern: '', flags: 'g', testString: '' };

  const [pattern, setPattern] = useState(demo.pattern);
  const [flags, setFlags] = useState(demo.flags ?? 'g');
  const [testString, setTestString] = useState(demo.testString ?? '');

  // A new topic ships its own example — reload it instead of carrying
  // whatever the learner was typing into the previous concept's demo.
  useEffect(() => {
    setPattern(demo.pattern);
    setFlags(demo.flags ?? 'g');
    setTestString(demo.testString ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  const { status, matches, error } = useSafeMatcher(pattern, flags, testString);
  const segments = useMemo(() => buildSegments(testString, matches), [testString, matches]);

  function toggleFlag(f) {
    setFlags(prev => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-inner overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Pattern input */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">
            Pattern
          </label>
          <div className="flex items-center gap-1 font-mono text-sm">
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <input
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-slate-100 dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 focus:ring-1 focus:ring-red-400/30"
            />
            <span className="text-slate-400 dark:text-slate-600">/{flags}</span>
          </div>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-1.5">
          {FLAG_INFO.map(({ flag, label, hint }) => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              title={hint}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                flags.includes(flag)
                  ? 'bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-300'
                  : 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-red-400/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Test string */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">
            Test string
          </label>
          <textarea
            value={testString}
            onChange={e => setTestString(e.target.value)}
            rows={3}
            spellCheck={false}
            className="w-full font-mono text-sm bg-slate-100 dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 focus:ring-1 focus:ring-red-400/30 resize-y"
          />
        </div>

        {/* Live highlighted result */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">
            {status === 'timeout'
              ? 'Timed out'
              : error
              ? 'Invalid pattern'
              : `Result — ${matches.length} match${matches.length === 1 ? '' : 'es'}`}
          </label>
          {status === 'timeout' ? (
            <div className="rounded-lg px-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[13px]">
              This pattern didn't finish in {TIMEOUT_MS}ms against this input — almost certainly catastrophic
              backtracking (see that concept in this reference). Try a shorter test string or a less ambiguous pattern.
            </div>
          ) : error ? (
            <div className="rounded-lg px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-[13px] font-mono">
              {error}
            </div>
          ) : (
            <div className="font-mono text-sm whitespace-pre-wrap break-words rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 min-h-[2.5rem]">
              {segments.map((seg, i) =>
                seg.isMatch ? (
                  <mark key={i} className="bg-red-400/30 text-red-900 dark:text-red-200 dark:bg-red-500/30 rounded px-0.5">
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i} className="text-slate-700 dark:text-slate-300">{seg.text}</span>
                ),
              )}
              {testString === '' && <span className="text-slate-400 dark:text-slate-600 italic">Type a test string above</span>}
            </div>
          )}
        </div>

        {/* Capture groups, when the matches actually carry any */}
        {status !== 'timeout' && !error && matches.length > 0 && matches.some(m => m.captures.length > 0 || (m.groups && Object.keys(m.groups).length > 0)) && (
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">
              Capture groups
            </label>
            <div className="space-y-1.5">
              {matches.map((m, mi) => (
                <div key={mi} className="text-[12px] font-mono bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-lg px-3 py-2">
                  <span className="text-slate-400 dark:text-slate-500">match {mi}: </span>
                  {m.captures.map((val, gi) => (
                    <span key={gi} className="mr-3">
                      <span className="text-red-500 dark:text-red-400">${gi + 1}=</span>
                      <span className="text-slate-700 dark:text-slate-300">{JSON.stringify(val)}</span>
                    </span>
                  ))}
                  {m.groups && Object.entries(m.groups).map(([name, val]) => (
                    <span key={name} className="mr-3">
                      <span className="text-red-500 dark:text-red-400">${'{'}{name}{'}'}=</span>
                      <span className="text-slate-700 dark:text-slate-300">{JSON.stringify(val)}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {demo.note && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 italic border-t border-slate-200 dark:border-slate-800/60 pt-3">
            {demo.note}
          </p>
        )}
      </div>
    </div>
  );
}
