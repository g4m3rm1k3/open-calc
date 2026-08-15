import { useState } from "react";
import { Link } from "react-router-dom";
import { createEnv } from "../../engines/scheme/schemeEngine.js";
import SchemeRepl from "./SchemeRepl.jsx";
import SchemeFileEditor from "./SchemeFileEditor.jsx";

// FloatingWindow (src/components/desktop/FloatingWindow.jsx) renders labs in
// a `position: fixed` overlay that sits above the router entirely — it does
// not close on navigation. Without calling onClose here, clicking the
// "Open lessons in Studio" link changes the route underneath this window
// while the window itself stays put, fully covering the new page — from the
// user's side, indistinguishable from the link doing nothing.
export default function LittleSchemerLab({ onClose }) {
  const [env, setEnv] = useState(() => createEnv());
  const [mode, setMode] = useState("repl"); // 'repl' | 'file'

  const resetEnv = () => setEnv(createEnv());

  return (
    <div className="h-full flex flex-col" style={{ background: "#0c0c0c" }}>
      <div
        className="shrink-0 px-3 py-2 text-[11px] flex items-center justify-between gap-3"
        style={{ borderBottom: "1px solid #1e1e1e", color: "#8b8b8b" }}
      >
        <span>
          A sandbox for working through <em>The Little Schemer</em> — the
          REPL and File tabs share one environment, so your{" "}
          <code>define</code>s stay available in both.
        </span>
        <Link
          to="/studio"
          onClick={() => onClose?.()}
          className="shrink-0 underline hover:no-underline"
          style={{ color: "#9cdcfe" }}
        >
          Open lessons in Studio →
        </Link>
      </div>
      <div
        className="shrink-0 flex items-center justify-between px-3 py-1.5"
        style={{ borderBottom: "1px solid #1e1e1e" }}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("repl")}
            className="text-[11px] px-2 py-0.5 rounded transition-colors"
            style={
              mode === "repl"
                ? { color: "#4ec9b0", border: "1px solid #4ec9b0" }
                : { color: "#8b8b8b", border: "1px solid transparent" }
            }
          >
            REPL
          </button>
          <button
            onClick={() => setMode("file")}
            className="text-[11px] px-2 py-0.5 rounded transition-colors"
            style={
              mode === "file"
                ? { color: "#4ec9b0", border: "1px solid #4ec9b0" }
                : { color: "#8b8b8b", border: "1px solid transparent" }
            }
          >
            File
          </button>
        </div>
        <button
          onClick={resetEnv}
          className="text-[11px] px-2 py-0.5 rounded transition-colors hover:bg-white/5"
          style={{ color: "#cccccc", border: "1px solid #333" }}
          title="Clear all defines and start fresh, in both tabs"
        >
          Reset
        </button>
      </div>
      <div className="flex-1 min-h-0">
        {mode === "repl" ? <SchemeRepl env={env} /> : <SchemeFileEditor env={env} />}
      </div>
    </div>
  );
}
