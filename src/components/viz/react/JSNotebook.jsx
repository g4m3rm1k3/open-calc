/**
 * JSNotebook.jsx
 * CodePen-style interactive JavaScript learning environment.
 *
 * Layout per cell:
 *   1. Lesson instruction (prose)
 *   2. Live preview canvas (iframe)
 *   3. Tabbed editor — HTML | CSS | JS — using Monaco
 *   4. Console output panel
 *   5. Challenge feedback banner
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";

// ── Colour tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:       "var(--color-background-primary, #0f172a)",
  panel:    "var(--color-background-secondary, #1e293b)",
  border:   "var(--color-border-tertiary, #334155)",
  text:     "var(--color-text-primary, #e2e8f0)",
  muted:    "var(--color-text-tertiary, #64748b)",
  accent:   "#38bdf8",
  green:    "#34d399",
  red:      "#f87171",
  yellow:   "#fbbf24",
  purple:   "#a78bfa",
  editorBg: "#0c1222",
  runBtn:   "#0ea5e9",
};

const TABS = ["html", "css", "js"];
const TAB_LABEL = { html: "HTML", css: "CSS", js: "JavaScript" };
const MONACO_LANG = { html: "html", css: "css", js: "javascript" };

// ── Build sandboxed iframe document ──────────────────────────────────────────
function buildIframeDoc(html = "", css = "", js = "", cellIndex) {
  const uid = Math.random().toString(36).slice(2);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0; padding: 14px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 14px;
  background: #0f1923;
  color: #e2e8f0;
}
${css}
</style>
</head>
<body>
${html}
<script>
window.__cellId = '${uid}';
(function() {
  const _log = console.log.bind(console);
  const _err = console.error.bind(console);
  const _warn = console.warn.bind(console);
  function post(level, args) {
    const msg = args.map(a => {
      try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
      catch(_) { return String(a); }
    }).join(' ');
    window.parent.postMessage({ type: 'jsnb_console', level, msg, id: window.__cellId, cellIndex: ${cellIndex} }, '*');
  }
  console.log   = (...a) => { _log(...a);  post('log',  a); };
  console.error = (...a) => { _err(...a);  post('error',a); };
  console.warn  = (...a) => { _warn(...a); post('warn', a); };
  
  // Only capture real errors, avoid capturing the script source
  window.addEventListener('error', e => {
    if (e.error) post('error', [e.message]);
    e.preventDefault();
  }, true);
})();
try {
  (function() {
${js}
  })();
} catch(e) {
  console.error('Runtime error: ' + e.message);
}
<\/script>
</body>
</html>`;
}

// ── Render inline-code spans in instruction text ──────────────────────────────
function InstructionText({ text }) {
  if (!text) return null;
  return (
    <div style={{ fontSize: 14, lineHeight: 1.8, color: T.text }}>
      {text.split("\n").map((line, i) => {
        const parts = line.split(/(`[^`]+`)/g);
        return (
          <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0" }}>
            {parts.map((part, j) =>
              part.startsWith("`") ? (
                <code key={j} style={{ fontFamily: "monospace", background: "#0c1222", color: T.accent, padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>
                  {part.slice(1, -1)}
                </code>
              ) : part
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── Console output panel ──────────────────────────────────────────────────────
function ConsolePanel({ logs }) {
  const color = { log: T.text, error: T.red, warn: T.yellow };
  const icon  = { log: ">", error: "✗", warn: "⚠" };
  return (
    <div style={{ background: "#080e18", borderTop: `1px solid ${T.border}`, padding: "8px 14px", height: 120, overflowY: "auto" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Console</div>
      {logs.length === 0 ? (
        <div style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.6, color: T.muted }}>Run the cell to stream output here.</div>
      ) : (
        logs.map((log, i) => (
          <div key={i} style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.6, color: color[log.level] || T.text, display: "flex", gap: 8 }}>
            <span style={{ color: T.muted, flexShrink: 0 }}>{icon[log.level]}</span>
            <span style={{ wordBreak: "break-all" }}>{log.msg}</span>
          </div>
        ))
      )}
    </div>
  );
}

// ── Single CodePen-style cell ─────────────────────────────────────────────────
function NotebookCell({ cell, cellIndex }) {
  const iframeRef = useRef(null);
  // Default to the first meaningful tab — html if present, else js
  const defaultTab = cell.html ? "html" : "js";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [html, setHtml] = useState(cell.html || "");
  const [css,  setCss]  = useState(cell.css  || "");
  const [js,   setJs]   = useState(cell.startCode || "");
  const [logs, setLogs] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  const [challengeState, setChallengeState] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  // Listen for console messages from this cell's iframe
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || e.data.type !== "jsnb_console") return;
      // ONLY accept logs if they match this cell's index to prevent cross-talk
      if (e.data.cellIndex !== cellIndex) return;

      setLogs(prev => [...prev, { level: e.data.level, msg: e.data.msg }]);
      // Force console open if there's content
      setShowConsole(true);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [cellIndex]);

  const run = useCallback(() => {
    setLogs([]);
    setHasRun(true);
    const activeJs = showSolution ? (cell.solutionCode || js) : js;
    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildIframeDoc(html, css, activeJs, cellIndex);
    }
    if (cell.type === "challenge" && cell.check) {
      setTimeout(() => {
        try {
          const passed = cell.check(activeJs, logs, html);
          setChallengeState(passed ? "pass" : "fail");
        } catch (_) { setChallengeState("fail"); }
      }, 300);
    }
  }, [html, css, js, showSolution, cell, logs]);

  const reset = () => {
    setHtml(cell.html || "");
    setCss(cell.css || "");
    setJs(cell.startCode || "");
    setLogs([]);
    setHasRun(false);
    setShowConsole(false);
    setChallengeState(null);
    setShowSolution(false);
    if (iframeRef.current) iframeRef.current.srcdoc = "";
  };

  // Markdown-only cells
  if (cell.type === "markdown") {
    return (
      <div style={{ background: T.panel, borderRadius: 12, border: `1px solid ${T.border}`, padding: "20px 22px", marginBottom: 20 }}>
        <InstructionText text={cell.instruction} />
      </div>
    );
  }

  // Always show all three tabs — JS may be empty but is always available
  const visibleTabs = TABS.filter(t => {
    if (t === "html") return !!(cell.html);
    if (t === "css")  return !!(cell.css);
    return true;
  });

  const editorValue = showSolution
    ? (activeTab === "js" ? (cell.solutionCode || js) : activeTab === "html" ? html : css)
    : (activeTab === "js" ? js : activeTab === "html" ? html : css);

  const handleEditorChange = (val = "") => {
    if (showSolution) return;
    if (activeTab === "js")   setJs(val);
    if (activeTab === "html") setHtml(val);
    if (activeTab === "css")  setCss(val);
  };

  // Line count for Monaco height
  const lineCount = editorValue.split("\n").length;
  const editorHeight = Math.min(360, Math.max(120, lineCount * 20 + 28));

  return (
    <div style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>

      {/* ── Instruction ── */}
      {cell.instruction && (
        <div style={{ background: T.panel, padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          {cell.type === "challenge" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.yellow + "22", border: `1.5px solid ${T.yellow}`, color: T.yellow, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cellIndex + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: T.yellow, background: T.yellow + "18", padding: "2px 8px", borderRadius: 10, border: `0.5px solid ${T.yellow}` }}>Challenge</span>
            </div>
          )}
          <InstructionText text={cell.instruction} />
        </div>
      )}

      {/* ── Live preview canvas ── */}
      <div style={{ background: "#0a1016", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, letterSpacing: ".08em", textTransform: "uppercase", padding: "7px 14px 0" }}>Preview</div>
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts"
          style={{ width: "100%", height: cell.outputHeight || 160, border: "none", display: "block" }}
          title={`preview-${cellIndex}`}
        />
      </div>

      {/* ── Tab bar + action buttons ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0c1520", borderBottom: `1px solid ${T.border}`, padding: "0 10px" }}>
        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {visibleTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent",
                color: activeTab === tab ? T.accent : T.muted,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: ".04em",
                transition: "color .15s",
              }}
            >
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, padding: "6px 0" }}>
          <button
            onClick={() => setShowConsole(s => !s)}
            style={{ padding: "4px 11px", borderRadius: 6, border: `0.5px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 11, cursor: "pointer" }}
          >
            {showConsole ? "Hide Console" : "Show Console"}
          </button>
          {cell.solutionCode && (
            <button
              onClick={() => setShowSolution(s => !s)}
              style={{ padding: "4px 11px", borderRadius: 6, border: `0.5px solid ${T.muted}`, background: "transparent", color: T.muted, fontSize: 11, cursor: "pointer" }}
            >
              {showSolution ? "Hide solution" : "Show solution"}
            </button>
          )}
          <button
            onClick={reset}
            style={{ padding: "4px 11px", borderRadius: 6, border: `0.5px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 11, cursor: "pointer" }}
          >
            Reset
          </button>
          <button
            onClick={run}
            style={{ padding: "5px 16px", borderRadius: 6, border: "none", background: T.runBtn, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
          >
            ▶ Run
          </button>
        </div>
      </div>

      {/* ── Monaco editor ── */}
      <div style={{ background: T.editorBg }}>
        <Editor
          key={activeTab}
          height={editorHeight}
          language={MONACO_LANG[activeTab]}
          value={editorValue}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 13,
            lineHeight: 20,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            readOnly: showSolution && activeTab === "js",
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            folding: false,
            lineDecorationsWidth: 6,
            lineNumbersMinChars: 3,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      {/* ── Console output ── */}
      {showConsole && <ConsolePanel logs={logs} />}

      {/* ── Challenge feedback ── */}
      {cell.type === "challenge" && (
        <div style={{ minHeight: 44, padding: "10px 16px", borderTop: `1px solid ${T.border}`, background: !hasRun || !challengeState ? "transparent" : (challengeState === "pass" ? T.green + "14" : T.red + "12"), color: challengeState === "pass" ? T.green : (challengeState === "fail" ? T.red : T.muted), fontSize: 13, fontWeight: 500 }}>
          {!hasRun || !challengeState
            ? "Run your solution to unlock the next step."
            : (challengeState === "pass" ? (cell.successMessage || "✓ Challenge complete!") : (cell.failMessage || "✗ Not quite — try again."))}
        </div>
      )}
    </div>
  );
}

// ── Main JSNotebook component ─────────────────────────────────────────────────
export default function JSNotebook({ lesson: lessonProp, params = {} }) {
  const lesson = lessonProp ?? params.lesson;
  const { title, subtitle, cells = [] } = lesson || {};

  if (!lesson) return null;

  return (
    <div style={{ fontFamily: "var(--font-sans, system-ui)", color: T.text, padding: "4px 0" }}>
      {/* Lesson header */}
      {title && (
        <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.accent, marginBottom: 5 }}>
            JavaScript · Interactive Lesson
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: T.text, marginBottom: subtitle ? 6 : 0 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>{subtitle}</div>}
        </div>
      )}

      {/* Cells */}
      {cells.map((cell, i) => (
        <NotebookCell
          key={`${title}-${i}`}
          cell={cell}
          cellIndex={i}
        />
      ))}
    </div>
  );
}
