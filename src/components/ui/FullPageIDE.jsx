/**
 * FullPageIDE.jsx
 * Full-screen split-pane IDE for JS Playground cells.
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────┐
 *  │  Header: file tabs  ·  actions  ·  close             │
 *  ├────────────────────────┬─────────────────────────────┤
 *  │  Monaco Editor         │  Live Preview (iframe)       │
 *  │  (resizable ←→)        │                              │
 *  └────────────────────────┴─────────────────────────────┘
 *
 * Modes:
 *  - Simple  (default): srcdoc iframe, no dependencies
 *  - Node    (toggle):  @webcontainer/api – full Node.js in-browser
 *
 * Props:
 *  cell      – { id, html, css, js, label?, files? }
 *  onChange  – (updatedCell) => void
 *  onClose   – () => void
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { setupOpenCalcMonaco } from "../../utils/monacoThemes.js";
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";
import {
  X,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// ── Reactive colour tokens ────────────────────────────────────────────────────
function useColors() {
  const isDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return {
    dark,
    bg: dark ? "#0d1117" : "#ffffff",
    surface: dark ? "#161b22" : "#f6f8fa",
    surface2: dark ? "#21262d" : "#eaeef2",
    border: dark ? "#30363d" : "#d0d7de",
    text: dark ? "#e6edf3" : "#24292f",
    muted: dark ? "#7d8590" : "#57606a",
    accent: dark ? "#58a6ff" : "#0969da",
    accentBg: dark ? "rgba(88,166,255,0.12)" : "rgba(9,105,218,0.08)",
    green: dark ? "#3fb950" : "#1a7f37",
    greenBg: dark ? "rgba(63,185,80,0.12)" : "rgba(26,127,55,0.08)",
    orange: dark ? "#f0883e" : "#bc4c00",
    orangeBg: dark ? "rgba(240,136,62,0.12)" : "rgba(188,76,0,0.08)",
    red: dark ? "#f85149" : "#cf222e",
    redBg: dark ? "rgba(248,81,73,0.12)" : "rgba(207,34,46,0.08)",
    yellow: dark ? "#d29922" : "#9a6700",
    tab: dark ? "#0d1117" : "#ffffff",
    tabActive: dark ? "#161b22" : "#ffffff",
    editorBg: dark ? "#0d1117" : "#ffffff",
  };
}

// ── Build sandboxed iframe srcdoc (same as GlobalJSPlayground) ────────────────
function buildDoc(html, css, js) {
  const uid = Math.random().toString(36).slice(2);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 0; }
${css || ""}
</style>
</head>
<body>
${html || ""}
<script>
window.__id = '${uid}';
(function() {
  const _log  = console.log.bind(console);
  const _err  = console.error.bind(console);
  const _warn = console.warn.bind(console);
  function post(level, args) {
    const msg = args.map(a => {
      try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
      catch(_) { return String(a); }
    }).join(' ');
    window.parent.postMessage({ type: 'fide_console', level, msg, uid: window.__id }, '*');
  }
  console.log   = (...a) => { _log(...a);  post('log',   a); };
  console.error = (...a) => { _err(...a);  post('error', a); };
  console.warn  = (...a) => { _warn(...a); post('warn',  a); };
  window.addEventListener('error', e => {
    post('error', [e.message + ' (line ' + e.lineno + ')']); e.preventDefault();
  });
  window.addEventListener('unhandledrejection', e => {
    post('error', ['Unhandled: ' + e.reason]); e.preventDefault();
  });
})();
try {
${js || ""}
} catch(e) { console.error('Runtime error: ' + e.message); }
<\/script>
</body>
</html>`;
}

// ── File language map ─────────────────────────────────────────────────────────
const LANG = {
  html: "html",
  css: "css",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  md: "markdown",
  txt: "plaintext",
};
function fileLang(name) {
  const ext = name.split(".").pop();
  return LANG[ext] || "plaintext";
}

// ── Download project as zip (no node_modules) ─────────────────────────────────
function downloadZip(files, projectName = "project") {
  const entries = {};
  for (const [name, content] of Object.entries(files)) {
    if (!name.startsWith("node_modules")) {
      entries[`${projectName}/${name}`] = strToU8(content || "");
    }
  }
  const zipped = zipSync(entries);
  const blob = new Blob([zipped], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Upload zip / file → extract into files map ────────────────────────────────
function readUpload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = new Uint8Array(e.target.result);
      if (file.name.endsWith(".zip")) {
        try {
          const unzipped = unzipSync(buf);
          const files = {};
          for (const [path, data] of Object.entries(unzipped)) {
            // strip top-level folder prefix if present
            const parts = path.split("/");
            const name =
              parts.length > 1 && parts[0] ? parts.slice(1).join("/") : path;
            if (name && !name.endsWith("/")) {
              files[name] = strFromU8(data);
            }
          }
          resolve(files);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve({ [file.name]: strFromU8(buf) });
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ── Console strip ─────────────────────────────────────────────────────────────
function ConsoleLine({ level, msg, T }) {
  const color = { log: T.text, error: T.red, warn: T.yellow };
  const icon = { log: "›", error: "✗", warn: "⚠" };
  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 1.6,
        color: color[level] || T.text,
        display: "flex",
        gap: 8,
      }}
    >
      <span style={{ color: T.muted, flexShrink: 0 }}>{icon[level]}</span>
      <span style={{ wordBreak: "break-all" }}>{msg}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FullPageIDE({ cell, onChange, onClose }) {
  const T = useColors();

  // ── File state: merge cell html/css/js with any extra files ──────────────
  const coreFiles = useMemo(
    () => ({
      "index.html": cell.html || "",
      "style.css": cell.css || "",
      "script.js": cell.js || "",
      ...(cell.files || {}),
    }),
    [],
  ); // eslint-disable-line

  const [files, setFiles] = useState(coreFiles);
  const [activeFile, setActiveFile] = useState("index.html");
  const [newFileName, setNewFileName] = useState("");
  const [addingFile, setAddingFile] = useState(false);

  // ── Layout ────────────────────────────────────────────────────────────────
  const [splitPct, setSplitPct] = useState(48); // left panel %
  const [editorHidden, setEditorHidden] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const containerRef = useRef(null);
  const iframeUidRef = useRef(null);
  const uploadRef = useRef(null);

  // ── Preview state ─────────────────────────────────────────────────────────
  const [srcdocContent, setSrcdocContent] = useState(() =>
    buildDoc(
      files["index.html"] || "",
      files["style.css"] || "",
      files["script.js"] || "",
    ),
  );
  const [logs, setLogs] = useState([]);
  const addLog = useCallback((level, msg) => {
    setLogs((prev) => [...prev.slice(-199), { level, msg }]);
  }, []);

  // Flush preview on srcdoc rebuild
  const refreshPreview = useCallback(() => {
    setLogs([]);
    const doc = buildDoc(
      files["index.html"],
      files["style.css"],
      files["script.js"],
    );
    const match = doc.match(/window\.__id = '([^']+)'/);
    if (match) iframeUidRef.current = match[1];
    setSrcdocContent(doc);
  }, [files]);

  // Debounced auto-refresh
  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(refreshPreview, 600);
    return () => clearTimeout(debounceRef.current);
  }, [files, refreshPreview]);

  // Console message listener
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || e.data.type !== "fide_console") return;
      if (e.data.uid !== iframeUidRef.current) return;
      addLog(e.data.level, e.data.msg);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [addLog]);

  // ── Sync file changes back to parent cell ────────────────────────────────
  const updateFile = useCallback(
    (name, content) => {
      setFiles((prev) => {
        const next = { ...prev, [name]: content };
        // Keep cell props in sync
        onChange({
          ...cell,
          html: next["index.html"] ?? cell.html,
          css: next["style.css"] ?? cell.css,
          js: next["script.js"] ?? cell.js,
          files: Object.fromEntries(
            Object.entries(next).filter(
              ([k]) => !["index.html", "style.css", "script.js"].includes(k),
            ),
          ),
        });
        return next;
      });
    },
    [cell, onChange],
  );

  // ── Resize handle ─────────────────────────────────────────────────────────
  const onResizeMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startPct = splitPct;
      const onMove = (e) => {
        const dx = e.clientX - startX;
        const w = containerRef.current?.offsetWidth || window.innerWidth;
        const newPct = Math.min(80, Math.max(20, startPct + (dx / w) * 100));
        setSplitPct(newPct);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [splitPct],
  );

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = () => {
    downloadZip(
      files,
      cell.label ? cell.label.toLowerCase().replace(/\s+/g, "-") : "project",
    );
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const imported = await readUpload(file);
      setFiles((prev) => {
        const next = { ...prev, ...imported };
        // Sync back core files
        onChange({
          ...cell,
          html: next["index.html"] ?? cell.html,
          css: next["style.css"] ?? cell.css,
          js: next["script.js"] ?? cell.js,
          files: Object.fromEntries(
            Object.entries(next).filter(
              ([k]) => !["index.html", "style.css", "script.js"].includes(k),
            ),
          ),
        });
        return next;
      });
      // Switch to first imported file
      const first = Object.keys(imported)[0];
      if (first) setActiveFile(first);
    } catch (err) {
      addLog("error", "Upload failed: " + err.message);
    }
  };

  // ── Add new file ──────────────────────────────────────────────────────────
  const commitNewFile = () => {
    const name = newFileName.trim();
    if (!name || files[name] !== undefined) return;
    setFiles((prev) => ({ ...prev, [name]: "" }));
    setActiveFile(name);
    setNewFileName("");
    setAddingFile(false);
  };

  const removeFile = (name) => {
    if (["index.html", "style.css", "script.js"].includes(name)) return;
    setFiles((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (activeFile === name) setActiveFile("index.html");
  };

  const fileList = Object.keys(files);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        background: T.bg,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          height: 42,
          flexShrink: 0,
          background: T.dark
            ? "linear-gradient(90deg, #0d1117 0%, #161b22 100%)"
            : "linear-gradient(90deg, #f6f8fa 0%, #eaeef2 100%)",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {/* File tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            flex: 1,
            overflowX: "auto",
            height: "100%",
          }}
          className="no-scrollbar"
        >
          {fileList.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 14px",
                borderRight: `1px solid ${T.border}`,
                background: activeFile === name ? T.tabActive : "transparent",
                borderBottom:
                  activeFile === name
                    ? `2px solid ${T.accent}`
                    : "2px solid transparent",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: activeFile === name ? 600 : 400,
                color: activeFile === name ? T.text : T.muted,
                whiteSpace: "nowrap",
                userSelect: "none",
                position: "relative",
                transition: "background 0.1s",
              }}
              onClick={() => setActiveFile(name)}
            >
              <FileIcon name={name} T={T} />
              {name}
              {!["index.html", "style.css", "script.js"].includes(name) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(name);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: T.muted,
                    padding: "0 2px",
                    fontSize: 11,
                    lineHeight: 1,
                    opacity: 0.6,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Add file */}
          {addingFile ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                gap: 4,
              }}
            >
              <input
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitNewFile();
                  if (e.key === "Escape") setAddingFile(false);
                }}
                placeholder="filename.js"
                style={{
                  background: T.surface2,
                  border: `1px solid ${T.accent}`,
                  borderRadius: 4,
                  color: T.text,
                  fontSize: 12,
                  padding: "2px 8px",
                  outline: "none",
                  width: 120,
                }}
              />
              <button
                onClick={commitNewFile}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.green,
                  fontSize: 13,
                }}
              >
                ✓
              </button>
              <button
                onClick={() => setAddingFile(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.muted,
                  fontSize: 13,
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingFile(true)}
              title="New file"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.muted,
                padding: "0 12px",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
              }}
            >
              +
            </button>
          )}
        </div>

        {/* Right-side actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: "0 10px",
            flexShrink: 0,
          }}
        >
          {/* Terminal toggle */}
          <Btn
            title="Toggle console"
            onClick={() => setConsoleOpen((s) => !s)}
            T={T}
            active={consoleOpen}
          >
            <Terminal size={13} />
          </Btn>

          {/* Refresh */}
          <Btn title="Refresh preview" onClick={refreshPreview} T={T}>
            <RefreshCw size={13} />
          </Btn>

          {/* Upload */}
          <input
            ref={uploadRef}
            type="file"
            accept=".html,.htm,.css,.js,.jsx,.ts,.tsx,.json,.zip"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <Btn
            title="Upload file or project zip"
            onClick={() => uploadRef.current?.click()}
            T={T}
          >
            <Upload size={13} />
          </Btn>

          {/* Download */}
          <Btn title="Download project as zip" onClick={handleDownload} T={T}>
            <Download size={13} />
          </Btn>

          {/* Editor toggle */}
          <Btn
            title={editorHidden ? "Show editor" : "Hide editor (preview only)"}
            onClick={() => setEditorHidden((s) => !s)}
            T={T}
            active={editorHidden}
          >
            {editorHidden ? (
              <PanelLeftOpen size={13} />
            ) : (
              <PanelLeftClose size={13} />
            )}
          </Btn>

          {/* Close */}
          <div
            style={{
              width: 1,
              height: 18,
              background: T.border,
              margin: "0 4px",
            }}
          />
          <Btn title="Close IDE" onClick={onClose} T={T}>
            <X size={14} />
          </Btn>
        </div>
      </div>

      {/* ── Main body ────────────────────────────────────────────────────────*/}
      <div
        ref={containerRef}
        style={{ flex: 1, display: "flex", overflow: "hidden" }}
      >
        {/* Editor panel */}
        {!editorHidden && (
          <>
            <div
              style={{
                width: `${splitPct}%`,
                minWidth: 220,
                display: "flex",
                flexDirection: "column",
                borderRight: `1px solid ${T.border}`,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <Editor
                key={activeFile}
                height="100%"
                beforeMount={setupOpenCalcMonaco}
                language={fileLang(activeFile)}
                value={files[activeFile] ?? ""}
                onChange={(val) => updateFile(activeFile, val || "")}
                theme={T.dark ? "open-calc-dark" : "open-calc-light"}
                options={{
                  fontSize: 13,
                  lineHeight: 21,
                  minimap: { enabled: true, scale: 1 },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  tabSize: 2,
                  renderLineHighlight: "line",
                  folding: true,
                  lineDecorationsWidth: 4,
                  padding: { top: 12, bottom: 12 },
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  fontLigatures: true,
                }}
              />
            </div>

            {/* Resize handle */}
            <div
              onMouseDown={onResizeMouseDown}
              style={{
                width: 5,
                flexShrink: 0,
                cursor: "col-resize",
                background: T.dark ? "#21262d" : "#d0d7de",
                transition: "background 0.15s",
                zIndex: 10,
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = T.accent)}
              onMouseOut={(e) =>
                (e.currentTarget.style.background = T.dark
                  ? "#21262d"
                  : "#d0d7de")
              }
            />
          </>
        )}

        {/* Preview panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            background: T.surface,
            overflow: "hidden",
          }}
        >
          {/* Preview header */}
          <div
            style={{
              height: 36,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 14px",
              background: T.dark
                ? `linear-gradient(90deg, rgba(88,166,255,0.10) 0%, ${T.surface} 100%)`
                : `linear-gradient(90deg, rgba(9,105,218,0.06) 0%, ${T.surface} 100%)`,
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: T.accent,
                boxShadow: `0 0 6px ${T.accent}`,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.accent,
                letterSpacing: ".1em",
                textTransform: "uppercase",
              }}
            >
              Live Preview
            </span>
            <button
              onClick={refreshPreview}
              title="Refresh"
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.muted,
                display: "flex",
                alignItems: "center",
                padding: "4px 6px",
                borderRadius: 4,
              }}
            >
              <RefreshCw size={11} />
            </button>
          </div>

          {/* Iframe */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <iframe
              sandbox="allow-scripts"
              srcdoc={srcdocContent}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
              title="preview"
            />
          </div>

          {/* Console */}
          <AnimatePresence>
            {consoleOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 180 }}
                exit={{ height: 0 }}
                style={{ overflow: "hidden", flexShrink: 0 }}
              >
                <div
                  style={{
                    height: 180,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    background: T.dark ? "#0d1117" : "#f6f8fa",
                    borderTop: `1px solid ${T.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 12px",
                      borderBottom: `1px solid ${T.border}`,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: T.muted,
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Console
                    </span>
                    <button
                      onClick={() => setLogs([])}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: T.muted,
                        fontSize: 10,
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  <div
                    style={{ flex: 1, overflowY: "auto", padding: "6px 12px" }}
                  >
                    {logs.length === 0 ? (
                      <span
                        style={{
                          fontSize: 12,
                          color: T.muted,
                          fontFamily: "monospace",
                        }}
                      >
                        No output yet.
                      </span>
                    ) : (
                      logs.map((l, i) => (
                        <ConsoleLine
                          key={i}
                          level={l.level}
                          msg={l.msg}
                          T={T}
                        />
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ── Small helper components ───────────────────────────────────────────────────

function Btn({ children, onClick, title, T, active = false, activeColor }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: active
          ? activeColor
            ? `${activeColor}22`
            : T.accentBg
          : hover
            ? T.surface2
            : "transparent",
        border: `1px solid ${active ? (activeColor || T.accent) + "44" : "transparent"}`,
        borderRadius: 6,
        color: active ? activeColor || T.accent : hover ? T.text : T.muted,
        cursor: "pointer",
        padding: "5px 7px",
        display: "flex",
        alignItems: "center",
        transition: "all 0.12s",
      }}
    >
      {children}
    </button>
  );
}

const FILE_ICON = {
  html: { icon: "⬢", color: "#e34f26" },
  css: { icon: "⬡", color: "#1572b6" },
  js: { icon: "⬡", color: "#f7df1e" },
  jsx: { icon: "⬡", color: "#61dafb" },
  ts: { icon: "⬡", color: "#3178c6" },
  tsx: { icon: "⬡", color: "#3178c6" },
  json: { icon: "{}", color: "#cbcb41" },
  md: { icon: "✦", color: "#83a598" },
};

function FileIcon({ name, T }) {
  const ext = name.split(".").pop();
  const info = FILE_ICON[ext];
  if (!info) return null;
  return (
    <span
      style={{ fontSize: 9, fontWeight: 900, color: info.color, lineHeight: 1 }}
    >
      {info.icon}
    </span>
  );
}
