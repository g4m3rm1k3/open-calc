/**
 * FullPageIDE.jsx
 * Full-screen IDE supporting three execution modes:
 *
 *  HTML  – srcdoc iframe (live HTML/CSS/JS preview)
 *  React – Babel standalone + React CDN (live JSX preview)
 *  C++   – Piston API remote execution (terminal output)
 *
 * Layout:
 *  ┌────────────┬──────────────────┬──────────────────────────┐
 *  │ Explorer   │  Monaco Editor   │  Live Preview / Output   │
 *  │ sidebar    │  (resizable ←→)  │                          │
 *  └────────────┴──────────────────┴──────────────────────────┘
 *
 * Props:
 *  cell     – { id, html, css, js, label?, files? }
 *  onChange – (updatedCell) => void
 *  onClose  – () => void
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
  Play,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
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
    purple: dark ? "#d2a8ff" : "#8250df",
    tab: dark ? "#0d1117" : "#ffffff",
    tabActive: dark ? "#161b22" : "#ffffff",
    editorBg: dark ? "#0d1117" : "#ffffff",
  };
}

// ── Build sandboxed iframe srcdoc – HTML mode ─────────────────────────────────
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

// ── Build sandboxed iframe srcdoc – React/JSX mode ────────────────────────────
// Uses Babel standalone + React UMD from CDN.
// Hooks are exposed as globals so users can write JSX without imports.
// Auto-renders <App /> if the user defines function App().
function buildReactDoc(jsx, css = "") {
  const uid = Math.random().toString(36).slice(2);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone@7/babel.min.js"><\/script>
<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
${css || ""}
</style>
</head>
<body>
<div id="root"></div>

<!-- Bootstrap: registers globals + console bridge BEFORE Babel runs -->
<script>
window.__id = '${uid}';

// Expose all React hooks as globals so users don't need imports
const {
  useState, useEffect, useRef, useCallback, useMemo, useReducer,
  useContext, createContext, memo, forwardRef, Fragment,
  useLayoutEffect, useId, useTransition, useDeferredValue,
} = React;

// Console bridge
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
})();
<\/script>

<!-- User code: processed by Babel for JSX support -->
<script type="text/babel" data-presets="react">
${jsx || "// Write your React component here!\nfunction App() {\n  return <h1>Hello from React!</h1>;\n}"}

// Auto-render App if defined
try {
  if (typeof App !== 'undefined') {
    ReactDOM.createRoot(document.getElementById('root')).render(
      React.createElement(App)
    );
  }
} catch(e) {
  console.error('Render error: ' + e.message);
}
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
  cpp: "cpp",
  cc: "cpp",
  c: "c",
  h: "cpp",
  txt: "plaintext",
  py: "python",
};
function fileLang(name) {
  const ext = name.split(".").pop();
  return LANG[ext] || "plaintext";
}

// ── Download project as zip ───────────────────────────────────────────────────
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

// ── Wandbox API – run C++ code remotely ──────────────────────────────────────
// Returns { status, compiler_error, compiler_output, program_output, program_error }
async function runCpp(code, stdin = "") {
  const res = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      compiler: "gcc-12.3.0",
      code,
      options: "-std=c++17 -O2",
      stdin,
    }),
  });
  if (!res.ok) throw new Error(`Compiler API error: ${res.status}`);
  return res.json();
}

// ── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATES = {
  html: {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
</head>
<body>
  <h1>Hello World!</h1>
  <p>Edit this file to get started.</p>
</body>
</html>`,
    "style.css": `body {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #333;
}`,
    "script.js": `// Your JavaScript here
console.log('Hello!');`,
  },

  jsx: {
    "App.jsx": `// React component – hooks are available as globals (no imports needed)
function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: "system-ui", padding: "2rem", textAlign: "center" }}>
      <h1>React Counter</h1>
      <p style={{ fontSize: "3rem", margin: "1rem 0", fontWeight: "bold" }}>{count}</p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={() => setCount(c => c - 1)}
          style={{ padding: ".5rem 1.5rem", fontSize: "1.2rem", cursor: "pointer" }}>−</button>
        <button onClick={() => setCount(0)}
          style={{ padding: ".5rem 1.5rem", fontSize: "1rem", cursor: "pointer" }}>Reset</button>
        <button onClick={() => setCount(c => c + 1)}
          style={{ padding: ".5rem 1.5rem", fontSize: "1.2rem", cursor: "pointer" }}>+</button>
      </div>
    </div>
  );
}`,
  },

  cppHello: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,

  cppDsa: `#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

// ── Binary Search ───────────────────────
int binarySearch(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};

    // Sort
    sort(arr.begin(), arr.end());
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;

    // Binary search
    int target = 25;
    int idx = binarySearch(arr, target);
    cout << "Found " << target << " at index " << idx << endl;

    return 0;
}`,

  cppLinkedList: `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
public:
    Node* head = nullptr;

    void pushFront(int val) {
        Node* n = new Node(val);
        n->next = head;
        head = n;
    }

    void pushBack(int val) {
        Node* n = new Node(val);
        if (!head) { head = n; return; }
        Node* cur = head;
        while (cur->next) cur = cur->next;
        cur->next = n;
    }

    void print() const {
        for (Node* cur = head; cur; cur = cur->next)
            cout << cur->data << " -> ";
        cout << "null" << endl;
    }

    ~LinkedList() {
        while (head) {
            Node* tmp = head;
            head = head->next;
            delete tmp;
        }
    }
};

int main() {
    LinkedList list;
    list.pushBack(1);
    list.pushBack(2);
    list.pushBack(3);
    list.pushFront(0);
    list.print();  // 0 -> 1 -> 2 -> 3 -> null
    return 0;
}`,
};

// ── Auto-detect IDE mode from file set ───────────────────────────────────────
function detectInitialMode(files) {
  const keys = Object.keys(files);
  if (keys.some((k) => /\.(cpp|cc|c)$/.test(k))) return "cpp";
  if (keys.some((k) => /\.(jsx|tsx)$/.test(k))) return "jsx";
  return "html";
}

// ── Build a nested file tree from flat path list ──────────────────────────────
// Returns { name: null } for files, { name: { children } } for dirs.
function buildFileTree(paths) {
  const root = {};
  for (const path of paths) {
    const parts = path.split("/").filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]];
    }
    const file = parts[parts.length - 1];
    if (file !== undefined) node[file] = null; // null = file
  }
  return root;
}

// ── FileTreeNode – recursive ──────────────────────────────────────────────────
function FileTreeNode({ name, node, prefix, activeFile, onOpen, onDelete, depth, T }) {
  const isFolder = node !== null && typeof node === "object";
  const fullPath = prefix ? `${prefix}/${name}` : name;
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);

  const indent = depth * 14;

  if (isFolder) {
    const sortedChildren = Object.entries(node).sort(([ak, av], [bk, bv]) => {
      const aIsDir = av !== null && typeof av === "object";
      const bIsDir = bv !== null && typeof bv === "object";
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return ak.localeCompare(bk);
    });
    return (
      <div>
        <div
          onClick={() => setExpanded((s) => !s)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: `3px 8px 3px ${indent + 6}px`,
            cursor: "pointer",
            background: hovered ? T.surface2 : "transparent",
            fontSize: 12,
            color: T.text,
            userSelect: "none",
          }}
        >
          <span style={{ color: T.muted, display: "flex", alignItems: "center" }}>
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
          <span style={{ color: T.orange, display: "flex", alignItems: "center" }}>
            {expanded ? <FolderOpen size={12} /> : <Folder size={12} />}
          </span>
          <span>{name}</span>
        </div>
        {expanded &&
          sortedChildren.map(([k, v]) => (
            <FileTreeNode
              key={k}
              name={k}
              node={v}
              prefix={fullPath}
              activeFile={activeFile}
              onOpen={onOpen}
              onDelete={onDelete}
              depth={depth + 1}
              T={T}
            />
          ))}
      </div>
    );
  }

  const isActive = fullPath === activeFile;
  return (
    <div
      onClick={() => onOpen(fullPath)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: `3px 8px 3px ${indent + 22}px`,
        cursor: "pointer",
        background: isActive ? T.accentBg : hovered ? T.surface2 : "transparent",
        borderRight: isActive ? `2px solid ${T.accent}` : "2px solid transparent",
        fontSize: 12,
        color: isActive ? T.accent : T.text,
        userSelect: "none",
      }}
    >
      <FileIcon name={name} T={T} />
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
      </span>
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(fullPath);
          }}
          title="Delete file"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.muted,
            padding: "0 2px",
            fontSize: 10,
            opacity: 0.7,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── FileExplorer sidebar ──────────────────────────────────────────────────────
function FileExplorer({ files, activeFile, onOpen, onDelete, onAdd, T }) {
  const tree = useMemo(() => buildFileTree(Object.keys(files)), [files]);
  const [addingFile, setAddingFile] = useState(false);
  const [newName, setNewName] = useState("");
  const inputRef = useRef(null);

  const sortedRoot = Object.entries(tree).sort(([ak, av], [bk, bv]) => {
    const aIsDir = av !== null && typeof av === "object";
    const bIsDir = bv !== null && typeof bv === "object";
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return ak.localeCompare(bk);
  });

  const commit = () => {
    const name = newName.trim();
    if (name) onAdd(name);
    setNewName("");
    setAddingFile(false);
  };

  return (
    <div
      style={{
        width: 175,
        flexShrink: 0,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: T.dark ? "#0d1117" : "#f6f8fa",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          borderBottom: `1px solid ${T.border}`,
          gap: 4,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: T.muted,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            flex: 1,
          }}
        >
          Explorer
        </span>
        <button
          onClick={() => {
            setAddingFile(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          title="New file"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.muted,
            padding: "2px 4px",
            display: "flex",
            alignItems: "center",
            borderRadius: 4,
          }}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* New file input */}
      {addingFile && (
        <div
          style={{
            padding: "4px 8px",
            display: "flex",
            gap: 4,
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setAddingFile(false);
            }}
            placeholder="filename.js"
            style={{
              flex: 1,
              background: T.surface2,
              border: `1px solid ${T.accent}`,
              color: T.text,
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 4,
              outline: "none",
            }}
          />
          <button
            onClick={commit}
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
      )}

      {/* Tree */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {sortedRoot.map(([k, v]) => (
          <FileTreeNode
            key={k}
            name={k}
            node={v}
            prefix=""
            activeFile={activeFile}
            onOpen={onOpen}
            onDelete={onDelete}
            depth={0}
            T={T}
          />
        ))}
      </div>
    </div>
  );
}

// ── ConsoleLine ───────────────────────────────────────────────────────────────
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

// ── CppPane – C++ output panel ────────────────────────────────────────────────
function CppPane({ output, running, stdin, onStdinChange, onRun, T }) {
  const run = output?.run;
  const hasOutput = output && !running;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: T.dark ? "#0d1117" : "#f8f9fa",
        overflow: "hidden",
      }}
    >
      {/* Stdin + Run row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "8px 12px",
          borderBottom: `1px solid ${T.border}`,
          alignItems: "center",
          flexShrink: 0,
          background: T.dark
            ? "linear-gradient(90deg, rgba(63,185,80,0.08) 0%, transparent 100%)"
            : "linear-gradient(90deg, rgba(26,127,55,0.06) 0%, transparent 100%)",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: T.muted,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            flexShrink: 0,
          }}
        >
          stdin
        </span>
        <input
          value={stdin}
          onChange={(e) => onStdinChange(e.target.value)}
          placeholder="optional program input…"
          style={{
            flex: 1,
            background: T.surface2,
            border: `1px solid ${T.border}`,
            color: T.text,
            padding: "3px 8px",
            borderRadius: 4,
            fontSize: 11,
            outline: "none",
            fontFamily: "monospace",
          }}
        />
        <button
          onClick={onRun}
          disabled={running}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: running ? T.surface2 : T.greenBg,
            border: `1px solid ${running ? T.border : T.green + "55"}`,
            borderRadius: 6,
            cursor: running ? "default" : "pointer",
            color: running ? T.muted : T.green,
            padding: "5px 14px",
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
            transition: "all 0.12s",
          }}
        >
          <Play size={11} />
          {running ? "Running…" : "Run"}
        </button>
      </div>

      {/* Output */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "12px 16px",
          fontSize: 13,
          lineHeight: 1.7,
          fontFamily: "monospace",
        }}
      >
        {running ? (
          <span style={{ color: T.muted }}>Compiling & running…</span>
        ) : hasOutput ? (
          <>
            {/* Compiler errors (build failure) */}
            {output.compiler_error && (
              <pre
                style={{
                  color: T.red,
                  margin: "0 0 8px 0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: T.dark ? "rgba(248,81,73,0.07)" : "rgba(207,34,46,0.05)",
                  borderRadius: 6,
                  padding: "8px 10px",
                }}
              >
                {output.compiler_error}
              </pre>
            )}
            {/* Program stdout */}
            {output.program_output && (
              <pre
                style={{
                  color: T.dark ? "#e6edf3" : "#24292f",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {output.program_output}
              </pre>
            )}
            {/* Program stderr */}
            {output.program_error && (
              <pre
                style={{
                  color: T.orange,
                  margin: "8px 0 0 0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {output.program_error}
              </pre>
            )}
            {!output.compiler_error && !output.program_output && !output.program_error && (
              <span style={{ color: T.muted }}>(no output)</span>
            )}
            {output.status !== undefined && !output.compiler_error && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: output.status === "0" ? T.green : T.red,
                  fontWeight: 600,
                }}
              >
                Exit code: {output.status}
              </div>
            )}
          </>
        ) : (
          <span style={{ color: T.muted, fontSize: 12 }}>
            Press{" "}
            <span style={{ color: T.green, fontWeight: 700 }}>Run</span> to
            compile and execute your C++ code.
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FullPageIDE({ cell, onChange, onClose }) {
  const T = useColors();

  // ── File state ────────────────────────────────────────────────────────────
  const coreFiles = useMemo(
    () => ({
      "index.html": cell.html || "",
      "style.css": cell.css || "",
      "script.js": cell.js || "",
      ...(cell.files || {}),
    }),
    [], // eslint-disable-line
  );

  const [files, setFiles] = useState(coreFiles);

  // ── Mode: html | jsx | cpp ────────────────────────────────────────────────
  const [mode, setMode] = useState(() => detectInitialMode(coreFiles));

  // ── Active file ───────────────────────────────────────────────────────────
  const [activeFile, setActiveFile] = useState(() => {
    if (mode === "cpp") {
      const cpp = Object.keys(coreFiles).find((k) => /\.(cpp|cc|c)$/.test(k));
      return cpp || "index.html";
    }
    if (mode === "jsx") {
      const jsx = Object.keys(coreFiles).find((k) => k.endsWith(".jsx"));
      return jsx || "index.html";
    }
    return "index.html";
  });

  // ── Layout state ──────────────────────────────────────────────────────────
  const [splitPct, setSplitPct] = useState(50);
  const [editorHidden, setEditorHidden] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [addingFile, setAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // ── Preview state (HTML + React modes) ───────────────────────────────────
  const [srcdocContent, setSrcdocContent] = useState(() => {
    if (mode === "jsx") return buildReactDoc(coreFiles["App.jsx"] || "");
    if (mode === "cpp") return "";
    return buildDoc(
      coreFiles["index.html"] || "",
      coreFiles["style.css"] || "",
      coreFiles["script.js"] || "",
    );
  });
  const [logs, setLogs] = useState([]);
  const addLog = useCallback((level, msg) => {
    setLogs((prev) => [...prev.slice(-199), { level, msg }]);
  }, []);

  // ── C++ state ─────────────────────────────────────────────────────────────
  const [cppOutput, setCppOutput] = useState(null);
  const [cppRunning, setCppRunning] = useState(false);
  const [cppStdin, setCppStdin] = useState("");

  const containerRef = useRef(null);
  const iframeUidRef = useRef(null);
  const uploadRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Build preview doc for current mode ───────────────────────────────────
  const buildCurrentDoc = useCallback(
    (f) => {
      if (mode === "jsx") return buildReactDoc(f["App.jsx"] || "");
      return buildDoc(
        f["index.html"] || "",
        f["style.css"] || "",
        f["script.js"] || "",
      );
    },
    [mode],
  );

  // ── Refresh preview ───────────────────────────────────────────────────────
  const refreshPreview = useCallback(() => {
    if (mode === "cpp") return;
    setLogs([]);
    const doc = buildCurrentDoc(files);
    const match = doc.match(/window\.__id = '([^']+)'/);
    if (match) iframeUidRef.current = match[1];
    setSrcdocContent(doc);
  }, [files, mode, buildCurrentDoc]);

  // Debounced auto-refresh (not for C++ mode)
  useEffect(() => {
    if (mode === "cpp") return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(refreshPreview, 600);
    return () => clearTimeout(debounceRef.current);
  }, [files, mode, refreshPreview]);

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

  // ── Mode switching ────────────────────────────────────────────────────────
  const switchMode = useCallback(
    (newMode) => {
      setMode(newMode);
      setCppOutput(null);
      setLogs([]);

      if (newMode === "cpp") {
        const hasCpp = Object.keys(files).some((k) => /\.(cpp|cc|c)$/.test(k));
        if (!hasCpp) {
          setFiles((prev) => ({ ...prev, "main.cpp": TEMPLATES.cppHello }));
          setActiveFile("main.cpp");
        } else {
          const cpp = Object.keys(files).find((k) => /\.(cpp|cc|c)$/.test(k));
          if (cpp) setActiveFile(cpp);
        }
      } else if (newMode === "jsx") {
        const hasJsx = Object.keys(files).some((k) => k.endsWith(".jsx"));
        if (!hasJsx) {
          setFiles((prev) => ({
            ...prev,
            "App.jsx": TEMPLATES.jsx["App.jsx"],
          }));
          setActiveFile("App.jsx");
        } else {
          const jsx = Object.keys(files).find((k) => k.endsWith(".jsx"));
          if (jsx) setActiveFile(jsx);
        }
      } else {
        setActiveFile("index.html");
      }
    },
    [files],
  );

  // ── Sync file changes back to parent ─────────────────────────────────────
  const updateFile = useCallback(
    (name, content) => {
      setFiles((prev) => {
        const next = { ...prev, [name]: content };
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

  // ── Run C++ ───────────────────────────────────────────────────────────────
  const handleRunCpp = useCallback(async () => {
    const cppFile =
      Object.keys(files).find((k) => /\.(cpp|cc|c)$/.test(k)) || activeFile;
    const code = files[cppFile] || "";
    setCppRunning(true);
    setCppOutput(null);
    try {
      const result = await runCpp(code, cppStdin);
      setCppOutput(result);
    } catch (err) {
      setCppOutput({ run: { stdout: "", stderr: err.message, code: 1 } });
    } finally {
      setCppRunning(false);
    }
  }, [files, activeFile, cppStdin]);

  // ── Resize ────────────────────────────────────────────────────────────────
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
      const first = Object.keys(imported)[0];
      if (first) setActiveFile(first);
    } catch (err) {
      addLog("error", "Upload failed: " + err.message);
    }
  };

  // ── Add / remove files ────────────────────────────────────────────────────
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

  // ── Mode config ───────────────────────────────────────────────────────────
  const MODES = [
    { id: "html", label: "HTML", color: T.orange },
    { id: "jsx", label: "React", color: T.accent },
    { id: "cpp", label: "C++", color: T.purple },
  ];

  // ── C++ template picker ───────────────────────────────────────────────────
  const [showCppTemplates, setShowCppTemplates] = useState(false);
  const CPP_TEMPLATES = [
    { label: "Hello World", code: TEMPLATES.cppHello },
    { label: "DSA / Algorithms", code: TEMPLATES.cppDsa },
    { label: "Linked List", code: TEMPLATES.cppLinkedList },
  ];

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
          height: 42,
          flexShrink: 0,
          background: T.dark
            ? "linear-gradient(90deg, #0d1117 0%, #161b22 100%)"
            : "linear-gradient(90deg, #f6f8fa 0%, #eaeef2 100%)",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {/* Mode selector */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            height: "100%",
            borderRight: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          {MODES.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => switchMode(id)}
              style={{
                background:
                  mode === id
                    ? T.dark
                      ? `${color}18`
                      : `${color}12`
                    : "transparent",
                border: "none",
                borderBottom:
                  mode === id
                    ? `2px solid ${color}`
                    : "2px solid transparent",
                borderRadius: 0,
                color: mode === id ? color : T.muted,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: mode === id ? 700 : 400,
                padding: "0 13px",
                letterSpacing: ".04em",
                transition: "all 0.1s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          ))}
        </div>

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
                padding: "0 12px",
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

          {/* Add file inline */}
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
          {/* C++ templates picker */}
          {mode === "cpp" && (
            <div style={{ position: "relative" }}>
              <Btn
                title="C++ templates"
                onClick={() => setShowCppTemplates((s) => !s)}
                T={T}
                active={showCppTemplates}
                activeColor={T.purple}
              >
                <span style={{ fontSize: 11, fontWeight: 600 }}>Templates</span>
              </Btn>
              {showCppTemplates && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    background: T.dark ? "#161b22" : "#ffffff",
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    zIndex: 300,
                    minWidth: 170,
                    padding: "4px 0",
                  }}
                >
                  {CPP_TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => {
                        const cppFile =
                          Object.keys(files).find((k) =>
                            /\.(cpp|cc|c)$/.test(k),
                          ) || "main.cpp";
                        updateFile(cppFile, t.code);
                        setActiveFile(cppFile);
                        setShowCppTemplates(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: T.text,
                        padding: "7px 14px",
                        fontSize: 12,
                        textAlign: "left",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* C++ Run */}
          {mode === "cpp" && (
            <Btn
              title="Run C++ (Piston API)"
              onClick={handleRunCpp}
              T={T}
              active={cppRunning}
              activeColor={T.green}
            >
              <Play size={13} />
            </Btn>
          )}

          {/* Console toggle (HTML + React modes) */}
          {mode !== "cpp" && (
            <Btn
              title="Toggle console"
              onClick={() => setConsoleOpen((s) => !s)}
              T={T}
              active={consoleOpen}
            >
              <Terminal size={13} />
            </Btn>
          )}

          {/* Refresh (HTML + React modes) */}
          {mode !== "cpp" && (
            <Btn title="Refresh preview" onClick={refreshPreview} T={T}>
              <RefreshCw size={13} />
            </Btn>
          )}

          {/* Explorer toggle */}
          <Btn
            title={explorerOpen ? "Close explorer" : "Open file explorer"}
            onClick={() => setExplorerOpen((s) => !s)}
            T={T}
            active={explorerOpen}
          >
            <Folder size={13} />
          </Btn>

          {/* Upload */}
          <input
            ref={uploadRef}
            type="file"
            accept=".html,.htm,.css,.js,.jsx,.ts,.tsx,.json,.cpp,.cc,.c,.h,.zip"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <Btn
            title="Upload file or zip"
            onClick={() => uploadRef.current?.click()}
            T={T}
          >
            <Upload size={13} />
          </Btn>

          {/* Download */}
          <Btn title="Download as zip" onClick={handleDownload} T={T}>
            <Download size={13} />
          </Btn>

          {/* Editor toggle */}
          <Btn
            title={editorHidden ? "Show editor" : "Hide editor"}
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

      {/* ── Main body ─────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ flex: 1, display: "flex", overflow: "hidden" }}
        onClick={() => showCppTemplates && setShowCppTemplates(false)}
      >
        {/* Left pane: explorer + editor */}
        {!editorHidden && (
          <>
            <div
              style={{
                width: `${splitPct}%`,
                minWidth: 220,
                display: "flex",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {/* File explorer sidebar */}
              {explorerOpen && (
                <FileExplorer
                  files={files}
                  activeFile={activeFile}
                  onOpen={setActiveFile}
                  onDelete={removeFile}
                  onAdd={(name) => {
                    if (!files[name]) {
                      setFiles((prev) => ({ ...prev, [name]: "" }));
                      setActiveFile(name);
                    }
                  }}
                  T={T}
                />
              )}

              {/* Monaco editor */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  borderRight: `1px solid ${T.border}`,
                  overflow: "hidden",
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
              onMouseOver={(e) =>
                (e.currentTarget.style.background = T.accent)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = T.dark
                  ? "#21262d"
                  : "#d0d7de")
              }
            />
          </>
        )}

        {/* Right pane: preview or C++ output */}
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
          {mode === "cpp" ? (
            <CppPane
              output={cppOutput}
              running={cppRunning}
              stdin={cppStdin}
              onStdinChange={setCppStdin}
              onRun={handleRunCpp}
              T={T}
            />
          ) : (
            <>
              {/* Preview header */}
              <div
                style={{
                  height: 36,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 14px",
                  background:
                    mode === "jsx"
                      ? T.dark
                        ? `linear-gradient(90deg, rgba(88,166,255,0.10) 0%, ${T.surface} 100%)`
                        : `linear-gradient(90deg, rgba(9,105,218,0.06) 0%, ${T.surface} 100%)`
                      : T.dark
                        ? `linear-gradient(90deg, rgba(240,136,62,0.10) 0%, ${T.surface} 100%)`
                        : `linear-gradient(90deg, rgba(188,76,0,0.06) 0%, ${T.surface} 100%)`,
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: mode === "jsx" ? T.accent : T.orange,
                    boxShadow: `0 0 6px ${mode === "jsx" ? T.accent : T.orange}`,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: mode === "jsx" ? T.accent : T.orange,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                  }}
                >
                  {mode === "jsx" ? "React Preview" : "Live Preview"}
                </span>
                {mode === "jsx" && (
                  <span
                    style={{
                      fontSize: 10,
                      color: T.muted,
                      marginLeft: 4,
                    }}
                  >
                    (Babel standalone · hooks available as globals)
                  </span>
                )}
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
                        style={{
                          flex: 1,
                          overflowY: "auto",
                          padding: "6px 12px",
                        }}
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
            </>
          )}
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
  cpp: { icon: "⬡", color: "#00599c" },
  cc: { icon: "⬡", color: "#00599c" },
  c: { icon: "⬡", color: "#a8b9cc" },
  h: { icon: "⬡", color: "#a8b9cc" },
  py: { icon: "⬡", color: "#3776ab" },
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
