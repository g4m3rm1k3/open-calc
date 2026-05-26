import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import ShellTerminal from "./ShellTerminal.jsx";

/**
 * CppLab — Split-pane C++ development environment.
 *
 * Left pane:  editable code editor (textarea) for the main .cpp file
 * Right pane: ShellTerminal with g++/make/./binary simulation
 *
 * When the user saves (button or ⌘S/Ctrl+S), the saved code is pushed
 * into the terminal's live filesystem via the `liveFiles` prop —
 * without resetting terminal history.
 *
 * Props (passed via `params`):
 *   mainFile      — filename shown in the editor header, default "main.cpp"
 *   initialFiles  — virtual filesystem seed (same format as ShellTerminal)
 *   programs      — predefined program outputs (same as ShellTerminal)
 *   welcomeMessage, prompt, hostname, initialCwd — forwarded to ShellTerminal
 */
export default function CppLab({ params = {} }) {
  const {
    mainFile = "main.cpp",
    initialFiles = {},
    instanceId,
    welcomeMessage,
    prompt: promptLabel,
    hostname,
    programs = {},
    initialCwd,
  } = params;

  // Resolve absolute path of mainFile within initialFiles
  const mainPath = useMemo(() => {
    const found = Object.keys(initialFiles).find(
      (k) => k === mainFile || k.endsWith("/" + mainFile),
    );
    return found ?? `/home/user/${mainFile}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultCode = useMemo(
    () =>
      initialFiles[mainPath] ??
      initialFiles[mainFile] ??
      `#include <iostream>\nusing namespace std;\n\n// __OUTPUT__: Hello, World!\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [code, setCode] = useState(defaultCode);
  const [savedCode, setSavedCode] = useState(defaultCode);
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setCode(e.target.value);
    setIsDirty(true);
  };

  const handleSave = useCallback(() => {
    setSavedCode((prev) => {
      const _ = prev;
      void _;
      return code;
    });
    setIsDirty(false);
  }, [code]);

  // Keyboard shortcut: ⌘S / Ctrl+S
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  // Tab key inserts 4 spaces instead of changing focus
  const handleTabKey = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      setCode(next);
      setIsDirty(true);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  // liveFiles reference only changes when savedCode changes → safe useEffect dep in ShellTerminal
  const liveFiles = useMemo(
    () => ({ ...initialFiles, [mainPath]: savedCode }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedCode],
  );

  const shellParams = {
    instanceId,
    initialFiles: liveFiles,
    liveFiles,
    welcomeMessage:
      welcomeMessage ??
      `C++ Lab ready.\nEdit ${mainFile} in the editor, save with ⌘S, then run:\n  g++ ${mainFile} -o app && ./app`,
    prompt: promptLabel,
    hostname,
    programs,
    initialCwd,
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        minHeight: 420,
        gap: 8,
        background: "#0d1117",
        padding: 4,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* ── Editor pane ─────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #30363d",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 12px",
            background: "#161b22",
            borderBottom: "1px solid #30363d",
            flexShrink: 0,
          }}
        >
          {/* macOS traffic-light dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ff5f57",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#febc2e",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#27c93f",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#8b949e",
                marginLeft: 8,
              }}
            >
              {mainFile}
              {isDirty && (
                <span style={{ color: "#f0883e", marginLeft: 6 }}>●</span>
              )}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={!isDirty}
            style={{
              fontSize: 11,
              padding: "2px 12px",
              borderRadius: 4,
              border: "1px solid",
              fontFamily: "monospace",
              cursor: isDirty ? "pointer" : "default",
              transition: "all 0.15s",
              background: isDirty ? "#1f6feb" : "#21262d",
              borderColor: isDirty ? "#1f6feb" : "#30363d",
              color: isDirty ? "#ffffff" : "#6e7681",
            }}
          >
            {isDirty ? "Save ⌘S" : "✓ Saved"}
          </button>
        </div>

        {/* Line numbers + code textarea */}
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            background: "#0d1117",
          }}
        >
          {/* Line numbers */}
          <LineNumbers code={code} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleTabKey}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            style={{
              flex: 1,
              background: "transparent",
              color: "#e6edf3",
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
              fontSize: 13,
              lineHeight: "1.65",
              padding: "12px 16px 12px 0",
              border: "none",
              outline: "none",
              resize: "none",
              tabSize: 4,
              whiteSpace: "pre",
              overflowX: "auto",
              overflowY: "auto",
            }}
          />
        </div>

        {/* Footer status bar */}
        <div
          style={{
            padding: "3px 12px",
            background: "#161b22",
            borderTop: "1px solid #30363d",
            fontSize: 10,
            color: "#6e7681",
            fontFamily: "monospace",
            display: "flex",
            gap: 16,
            flexShrink: 0,
          }}
        >
          <span>C++</span>
          <span>{code.split("\n").length} lines</span>
          <span style={{ marginLeft: "auto" }}>
            {isDirty ? "● Unsaved changes" : "All changes saved"}
          </span>
        </div>
      </div>

      {/* ── Terminal pane ────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ShellTerminal params={shellParams} />
      </div>
    </div>
  );
}

// ── Line numbers sidebar ───────────────────────────────────────────────────────
function LineNumbers({ code }) {
  const lines = code.split("\n");
  return (
    <div
      aria-hidden="true"
      style={{
        padding: "12px 8px 12px 12px",
        background: "#0d1117",
        color: "#484f58",
        fontFamily:
          "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
        fontSize: 13,
        lineHeight: "1.65",
        textAlign: "right",
        userSelect: "none",
        flexShrink: 0,
        minWidth: 36,
        borderRight: "1px solid #21262d",
        overflowY: "hidden",
        whiteSpace: "pre",
      }}
    >
      {lines.map((_, i) => `${i + 1}\n`).join("")}
    </div>
  );
}
