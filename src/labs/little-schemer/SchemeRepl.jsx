import { useState, useRef, useEffect } from "react";
import { evalSchemeSource, parenBalance } from "../../engines/scheme/schemeEngine.js";

// Modeled on src/tools/terminal-hub/PythonRepl.jsx's state shape, but
// simpler: the interpreter is synchronous and local (no CDN/WASM runtime to
// boot), so there's no loading state. The environment itself is owned by
// the parent (index.jsx) and passed in as a prop — shared with
// SchemeFileEditor, so a `define` made in either tab is visible in both.

const WELCOME = [
  {
    type: "info",
    text: "Little Schemer sandbox — type an expression and press Enter.\nMulti-line forms auto-continue until parens balance.",
  },
];

function lineColor(type) {
  switch (type) {
    case "input":
      return "#cccccc";
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

export default function SchemeRepl({ env }) {
  const [lines, setLines] = useState(WELCOME);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // A new `env` identity means the parent's Reset button was clicked —
  // clear this tab's own transcript to match.
  useEffect(() => {
    setLines(WELCOME);
    setPending([]);
  }, [env]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const prompt = pending.length > 0 ? "... " : "> ";

  const run = () => {
    const cmd = input;
    setInput("");
    if (cmd.trim() === "" && pending.length === 0) return;

    if (cmd.trim()) {
      setHistory((h) => [cmd, ...h]);
      setHistIdx(-1);
    }

    setLines((prev) => [...prev, { type: "input", prompt, text: cmd }]);

    const newPending = [...pending, cmd];
    const fullCode = newPending.join("\n");

    if (parenBalance(fullCode) > 0) {
      setPending(newPending);
      return;
    }

    setPending([]);
    const codeToRun = fullCode.trim();
    if (!codeToRun) return;

    const newLines = [];
    evalSchemeSource(codeToRun, env, (line) => newLines.push(line));
    if (newLines.length) setLines((prev) => [...prev, ...newLines]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      run();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      if (history[idx] !== undefined) setInput(history[idx]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : (history[idx] ?? ""));
    }
  };

  return (
    <div
      className="h-full flex flex-col font-mono text-[13px] select-text"
      style={{ background: "#0c0c0c", color: "#cccccc" }}
    >
      <div
        className="flex-1 overflow-auto p-3 space-y-0.5 leading-5"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            style={{ color: lineColor(l.type), whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {l.type === "input" ? (
              <>
                <span style={{ color: "#569cd6" }}>{l.prompt}</span>
                {l.text}
              </>
            ) : (
              l.text
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderTop: "1px solid #1e1e1e" }}
      >
        <span style={{ color: "#569cd6", flexShrink: 0, minWidth: 24 }}>{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          spellCheck={false}
          autoFocus
          className="flex-1 outline-none bg-transparent"
          style={{ color: "#ffffff", caretColor: "#fff" }}
        />
      </div>
    </div>
  );
}
