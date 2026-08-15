import { useState, useEffect, useRef } from "react";
import { evalSchemeSource } from "../../engines/scheme/schemeEngine.js";

// The REPL evaluates one form at a time; this is the other real way Scheme
// gets used — a whole buffer, run top to bottom in one shot, closer to a
// real .scm file. Shares `env` with SchemeRepl (owned by index.jsx), so a
// `define` written here is callable from the REPL tab and vice versa.

const FILE_LS_KEY = "little-schemer-scratch-file";

const DEFAULT_FILE = `; Write a whole program here, then click Run (or Cmd/Ctrl+Enter).
; This runs top to bottom in one shot, unlike the REPL's one-line-at-a-time.
; Saved locally in your browser as you type.

(define lat?
  (lambda (l)
    (cond
      ((null? l) #t)
      ((atom? (car l)) (lat? (cdr l)))
      (else #f))))

(lat? '(a b c))
(lat? '(a (b c)))
`;

function loadFile() {
  try {
    return localStorage.getItem(FILE_LS_KEY) ?? DEFAULT_FILE;
  } catch {
    return DEFAULT_FILE;
  }
}

function lineColor(type) {
  switch (type) {
    case "result":
      return "#4ec9b0";
    case "output":
      return "#9cdcfe";
    case "dim":
    case "info":
      return "#6a9955";
    case "error":
      return "#f48771";
    default:
      return "#cccccc";
  }
}

export default function SchemeFileEditor({ env }) {
  const [code, setCode] = useState(loadFile);
  const [output, setOutput] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(FILE_LS_KEY, code);
    } catch {
      // localStorage unavailable (private browsing, quota) — the buffer
      // still works for the session, it just won't survive a reload.
    }
  }, [code]);

  const run = () => {
    const lines = [];
    evalSchemeSource(code, env, (line) => lines.push(line));
    setOutput(lines.length ? lines : [{ type: "dim", text: "(no output)" }]);
  };

  const handleKey = (e) => {
    if (e.key === "Tab") {
      // Default Tab behavior moves focus out of the textarea — not useful
      // when the whole point is indenting code.
      e.preventDefault();
      const el = textareaRef.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = code.slice(0, start) + "  " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    }
  };

  return (
    <div
      className="h-full flex flex-col font-mono text-[13px]"
      style={{ background: "#0c0c0c", color: "#cccccc" }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderBottom: "1px solid #1e1e1e" }}
      >
        <span className="text-[11px]" style={{ color: "#8b8b8b" }}>
          scratch.scm — saved locally in your browser
        </span>
        <button
          onClick={run}
          className="text-[11px] px-2 py-0.5 rounded font-semibold transition-colors hover:opacity-90"
          style={{ color: "#0c0c0c", background: "#4ec9b0" }}
          title="Run the whole file (Cmd/Ctrl + Enter)"
        >
          ▶ Run
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKey}
        spellCheck={false}
        className="flex-[2] min-h-0 outline-none bg-transparent p-3 resize-none"
        style={{ color: "#ffffff", caretColor: "#fff", lineHeight: 1.5 }}
      />
      <div
        className="flex-1 min-h-0 overflow-auto p-3 space-y-0.5 leading-5"
        style={{ borderTop: "1px solid #1e1e1e" }}
      >
        <div
          className="text-[10px] uppercase tracking-widest mb-1"
          style={{ color: "#6a9955" }}
        >
          Output
        </div>
        {output.map((l, i) => (
          <div
            key={i}
            style={{ color: lineColor(l.type), whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
