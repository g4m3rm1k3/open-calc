import { useEffect, useMemo, useRef, useState } from 'react';

const FLAG_INFO = [
  { flag: 'g', label: 'g — global', hint: 'find every match, not just the first', pyEquivalent: 'finditer() vs. search()' },
  { flag: 'i', label: 'i — ignore case', hint: '"A" and "a" match each other', pyEquivalent: 're.IGNORECASE' },
  { flag: 'm', label: 'm — multiline', hint: '^ and $ match at each line break, not just start/end of string', pyEquivalent: 're.MULTILINE' },
  { flag: 's', label: 's — dotAll', hint: '. also matches newline characters', pyEquivalent: 're.DOTALL' },
  { flag: 'u', label: 'u — unicode', hint: 'treats the pattern as a sequence of code points, enables \\p{...}', pyEquivalent: null },
  { flag: 'y', label: 'y — sticky', hint: 'next match must start exactly at lastIndex, no skipping ahead', pyEquivalent: null },
];

const JS_TIMEOUT_MS = 500;
const PY_TIMEOUT_MS = 2500;
const PYODIDE_VERSION = 'v0.26.4';

// Runs entirely inside a Web Worker so a pathological pattern (this reference
// literally has a lesson on catastrophic backtracking — learners WILL type
// one in) can be killed by terminating the worker instead of freezing the tab.
const JS_WORKER_SRC = `
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

// Same idea, but the "engine" is a real CPython `re` running under Pyodide
// (WASM), so a learner can see genuine Python behavior, not a JS approximation
// of it — including the cases where it genuinely errors (\\p{...}, JS-style
// named groups) instead of matching. Runs in its own worker for the same
// reason as the JS one: Python's `re` is also a backtracking engine, equally
// capable of catastrophic backtracking, and this reference has a demo that
// deliberately triggers it.
const PY_WORKER_SRC = `
importScripts('https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js');

const pyodideReady = (async () => {
  self.pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/',
    fullStdLib: false,
  });
  self.postMessage({ type: 'ready' });
})().catch((err) => {
  self.postMessage({ type: 'load-error', error: String(err) });
});

const PY_SCRIPT = \`
import re, json

_flags = 0
if 'i' in py_flags_str: _flags |= re.IGNORECASE
if 'm' in py_flags_str: _flags |= re.MULTILINE
if 's' in py_flags_str: _flags |= re.DOTALL

_result = {"ok": True, "matches": [], "error": None}
try:
    _compiled = re.compile(py_pattern, _flags)
    if 'g' in py_flags_str:
        _found = list(_compiled.finditer(py_test_string))
    else:
        _m = _compiled.search(py_test_string)
        _found = [_m] if _m else []
    for _m in _found:
        _result["matches"].append({
            "full": _m.group(0),
            "index": _m.start(),
            "captures": list(_m.groups()),
            "groups": _m.groupdict() or None,
        })
except re.error as e:
    _result["ok"] = False
    _result["error"] = str(e)

py_result_json = json.dumps(_result)
\`;

self.onmessage = async function (e) {
  const { pattern, flags, testString, reqId } = e.data;
  await pyodideReady;
  try {
    self.pyodide.globals.set('py_pattern', pattern);
    self.pyodide.globals.set('py_flags_str', flags);
    self.pyodide.globals.set('py_test_string', testString);
    self.pyodide.runPython(PY_SCRIPT);
    const result = JSON.parse(self.pyodide.globals.get('py_result_json'));
    if (result.ok) self.postMessage({ reqId, ok: true, matches: result.matches });
    else self.postMessage({ reqId, ok: false, error: result.error });
  } catch (err) {
    self.postMessage({ reqId, ok: false, error: String(err && err.message || err) });
  }
};
`;

// Every request routed to a shared worker needs a globally unique id — several
// RegexDemo instances (e.g. "Expand All" on the Reference page) can share the
// one Pyodide worker below, and a locally-incrementing per-instance counter
// would let one instance's listener accept a different instance's response.
let globalReqCounter = 0;
const nextReqId = () => ++globalReqCounter;

function useSafeJsMatcher(pattern, flags, testString) {
  const [state, setState] = useState({ status: 'ok', matches: [], error: null });
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);
  const reqIdRef = useRef(0);
  const debounceRef = useRef(null);

  function spawnWorker() {
    const blob = new Blob([JS_WORKER_SRC], { type: 'application/javascript' });
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
      }, JS_TIMEOUT_MS);
      setState(s => ({ ...s, status: 'pending' }));
      workerRef.current?.postMessage({ pattern, flags, testString, reqId });
    }, 150);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, flags, testString]);

  return state;
}

// Module-level singleton: Pyodide (~10MB+ of WASM) loads once per page
// session and is shared by every RegexDemo instance, not once per instance.
let pyWorkerEntry = null;

function ensurePyodideWorker() {
  if (!pyWorkerEntry) {
    const blob = new Blob([PY_WORKER_SRC], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    const ready = new Promise((resolve, reject) => {
      const onFirst = (e) => {
        if (e.data?.type === 'ready') { worker.removeEventListener('message', onFirst); resolve(); }
        else if (e.data?.type === 'load-error') { worker.removeEventListener('message', onFirst); reject(new Error(e.data.error)); }
      };
      worker.addEventListener('message', onFirst);
    });
    pyWorkerEntry = { worker, ready };
  }
  return pyWorkerEntry;
}

function resetPyodideWorker() {
  pyWorkerEntry?.worker.terminate();
  pyWorkerEntry = null;
}

// Only loads/computes while `active` — switching to the Python tab is what
// triggers the (multi-second, first time) Pyodide download, never mounting.
function usePythonMatcher(pattern, flags, testString, active) {
  const [state, setState] = useState({ status: 'idle', matches: [], error: null });
  const reqIdRef = useRef(0);
  const timeoutRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let handler = null;
    let entry = null;

    (async () => {
      setState(s => (s.status === 'idle' || s.status === 'load-error' ? { status: 'loading', matches: [], error: null } : s));
      try {
        entry = ensurePyodideWorker();
        await entry.ready;
      } catch (err) {
        if (!cancelled) setState({ status: 'load-error', matches: [], error: err.message });
        return;
      }
      if (cancelled) return;

      handler = (e) => {
        if (e.data.reqId !== reqIdRef.current) return;
        clearTimeout(timeoutRef.current);
        if (e.data.ok) setState({ status: 'ok', matches: e.data.matches, error: null });
        else setState({ status: 'ok', matches: [], error: e.data.error });
      };
      entry.worker.addEventListener('message', handler);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const reqId = nextReqId();
        reqIdRef.current = reqId;
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          resetPyodideWorker();
          setState({ status: 'timeout', matches: [], error: null });
        }, PY_TIMEOUT_MS);
        setState(s => ({ ...s, status: 'pending' }));
        entry.worker.postMessage({ pattern, flags, testString, reqId });
      }, 150);
    })();

    return () => {
      cancelled = true;
      clearTimeout(debounceRef.current);
      clearTimeout(timeoutRef.current);
      if (handler && pyWorkerEntry) pyWorkerEntry.worker.removeEventListener('message', handler);
    };
  }, [pattern, flags, testString, active]);

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

function formatCapture(val) {
  return val === null || val === undefined ? '—' : JSON.stringify(val);
}

export default function RegexDemo({ topic }) {
  const demo = topic.demo ?? { pattern: '', flags: 'g', testString: '' };

  const [lang, setLang] = useState('javascript');
  const [pattern, setPattern] = useState(demo.pattern);
  const [flags, setFlags] = useState(demo.flags ?? 'g');
  const [testString, setTestString] = useState(demo.testString ?? '');

  // A new topic ships its own example — reload it instead of carrying
  // whatever the learner was typing into the previous concept's demo.
  useEffect(() => {
    setLang('javascript');
    setPattern(demo.pattern);
    setFlags(demo.flags ?? 'g');
    setTestString(demo.testString ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  const jsState = useSafeJsMatcher(pattern, flags, testString);
  const pyState = usePythonMatcher(pattern, flags, testString, lang === 'python');
  const { status, matches, error } = lang === 'python' ? pyState : jsState;

  const segments = useMemo(() => buildSegments(testString, matches), [testString, matches]);

  function toggleFlag(f) {
    setFlags(prev => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  }

  const isTimedOut = status === 'timeout';
  const isLoadError = status === 'load-error';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-inner overflow-hidden">
      {/* Language tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40">
        {[
          { id: 'javascript', label: 'JavaScript' },
          { id: 'python', label: 'Python (re)' },
        ].map(l => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            className={`px-4 py-2 text-[12px] font-bold transition-all border-b-2 ${
              lang === l.id
                ? 'text-red-600 dark:text-red-400 border-red-500'
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* Pattern input */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">
            Pattern {lang === 'python' && <span className="normal-case font-normal text-slate-400 dark:text-slate-500">— same string, run through Python's re.compile()</span>}
          </label>
          <div className="flex items-center gap-1 font-mono text-sm">
            <span className="text-slate-400 dark:text-slate-600">{lang === 'python' ? 'r"' : '/'}</span>
            <input
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-slate-100 dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 focus:ring-1 focus:ring-red-400/30"
            />
            <span className="text-slate-400 dark:text-slate-600">{lang === 'python' ? '"' : `/${flags}`}</span>
          </div>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-1.5">
          {FLAG_INFO.map(({ flag, label, hint, pyEquivalent }) => {
            const disabledForPython = lang === 'python' && pyEquivalent === null;
            return (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                disabled={disabledForPython}
                title={disabledForPython ? `${hint} — no Python equivalent` : lang === 'python' ? `${hint} (Python: ${pyEquivalent})` : hint}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                  disabledForPython
                    ? 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800/40 text-slate-300 dark:text-slate-700 cursor-not-allowed line-through'
                    : flags.includes(flag)
                    ? 'bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-300'
                    : 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-red-400/50'
                }`}
              >
                {label}
              </button>
            );
          })}
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
            {isLoadError
              ? 'Python failed to load'
              : status === 'loading'
              ? 'Loading Python runtime…'
              : isTimedOut
              ? 'Timed out'
              : error
              ? lang === 'python' ? 'Python raised re.error' : 'Invalid pattern'
              : `Result — ${matches.length} match${matches.length === 1 ? '' : 'es'}`}
          </label>
          {status === 'loading' ? (
            <div className="rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 text-[13px] flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              Downloading CPython (WASM) — a few seconds the first time, cached after that.
            </div>
          ) : isLoadError ? (
            <div className="rounded-lg px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-[13px]">
              {error}
            </div>
          ) : isTimedOut ? (
            <div className="rounded-lg px-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[13px]">
              This pattern didn't finish in {lang === 'python' ? PY_TIMEOUT_MS : JS_TIMEOUT_MS}ms against this input — almost certainly catastrophic
              backtracking (see that concept in this reference). Try a shorter test string or a less ambiguous pattern.
            </div>
          ) : error ? (
            <div className="rounded-lg px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-[13px] font-mono">
              {error}
              {lang === 'python' && (
                <div className="mt-1.5 text-slate-500 dark:text-slate-400 font-sans italic">
                  This pattern uses syntax Python's re doesn't accept — a real divergence, not a bug in this demo.
                </div>
              )}
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
        {!isTimedOut && !isLoadError && status !== 'loading' && !error && matches.length > 0 && matches.some(m => m.captures.length > 0 || (m.groups && Object.keys(m.groups).length > 0)) && (
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
                      <span className="text-slate-700 dark:text-slate-300">{formatCapture(val)}</span>
                    </span>
                  ))}
                  {m.groups && Object.entries(m.groups).map(([name, val]) => (
                    <span key={name} className="mr-3">
                      <span className="text-red-500 dark:text-red-400">${'{'}{name}{'}'}=</span>
                      <span className="text-slate-700 dark:text-slate-300">{formatCapture(val)}</span>
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
