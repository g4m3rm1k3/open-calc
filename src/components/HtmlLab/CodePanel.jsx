import { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import styles from "./HtmlLab.module.css";

const TABS = [
  { key: "html", label: "HTML", language: "html" },
  { key: "css", label: "CSS", language: "css" },
  { key: "javascript", label: "JavaScript", language: "javascript" },
];

// Inject glow CSS into document head once — Monaco decorations are real DOM nodes
// so a regular stylesheet reaches them.
let glowStyleInjected = false;
function injectGlowStyle() {
  if (glowStyleInjected) return;
  glowStyleInjected = true;
  const el = document.createElement("style");
  el.textContent = `
    .htmllab-highlight-line {
      background: rgba(86, 156, 214, 0.13) !important;
      border-left: 3px solid #569cd6 !important;
    }
    .htmllab-highlight-gutter {
      background: #569cd6 !important;
      width: 3px !important;
      left: 0 !important;
    }
  `;
  document.head.appendChild(el);
}

// ── Range finders ─────────────────────────────────────────────────────────────

function findHtmlRanges(text, selectedId) {
  const lines = text.split("\n");
  const marker = `data-lab-id="${selectedId}"`;

  let openLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(marker)) { openLine = i; break; }
  }
  if (openLine === -1) return [];

  // Self-closing tag — single line
  if (lines[openLine].trimEnd().endsWith("/>")) {
    return [{ start: openLine + 1, end: openLine + 1 }];
  }

  // Extract the tag name so we can match its closing tag
  const tagMatch = lines[openLine].match(/<(\w[\w-]*)/);
  if (!tagMatch) return [{ start: openLine + 1, end: openLine + 1 }];
  const tagName = tagMatch[1];

  const openRe  = new RegExp(`<${tagName}[\\s>/]`);
  const closeRe = new RegExp(`</${tagName}>`);

  let depth   = 0;
  let closeLine = openLine;

  for (let i = openLine; i < lines.length; i++) {
    const line = lines[i];
    // Count opens and closes on this line
    const opens  = (line.match(openRe)  || []).length;
    const closes = (line.match(closeRe) || []).length;
    depth += opens - closes;
    if (depth <= 0 && i >= openLine) {
      closeLine = i;
      break;
    }
  }

  return [{ start: openLine + 1, end: closeLine + 1 }];
}

function findCssRanges(text, selectedId) {
  const lines = text.split("\n");
  const marker = `[data-lab-id="${selectedId}"]`;

  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(marker)) { startLine = i; break; }
  }
  if (startLine === -1) return [];

  let endLine = startLine;
  let depth = 0;
  for (let i = startLine; i < lines.length; i++) {
    const opens  = (lines[i].match(/\{/g) || []).length;
    const closes = (lines[i].match(/\}/g) || []).length;
    depth += opens - closes;
    if (i > startLine && depth <= 0) { endLine = i; break; }
    if (i === startLine && opens > 0 && depth <= 0) { endLine = i; break; }
  }

  return [{ start: startLine + 1, end: endLine + 1 }];
}

function findJsRanges(text, selectedId) {
  const lines = text.split("\n");
  return lines.reduce((acc, line, i) => {
    if (line.includes(selectedId)) acc.push({ start: i + 1, end: i + 1 });
    return acc;
  }, []);
}

function findRanges(text, selectedId, tab) {
  if (!text || !selectedId) return [];
  if (tab === "html")       return findHtmlRanges(text, selectedId);
  if (tab === "css")        return findCssRanges(text, selectedId);
  if (tab === "javascript") return findJsRanges(text, selectedId);
  return [];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CodePanel({
  html,
  css,
  javascript,
  width,
  selectedId,
  onHtmlChange,
  onCssChange,
  onJavascriptChange,
}) {
  const debounceRef    = useRef(null);
  const editorRef      = useRef(null);
  const monacoRef      = useRef(null);
  const decorationsRef = useRef([]);
  const isFocused      = useRef(false);
  const [activeTab, setActiveTab] = useState("html");

  const sources  = { html, css, javascript };
  const handlers = { html: onHtmlChange, css: onCssChange, javascript: onJavascriptChange };
  const activeSource   = sources[activeTab]   ?? "";
  const activeLanguage = TABS.find((t) => t.key === activeTab)?.language || "html";

  // Push new content into Monaco when canvas changes (skip while user is typing)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isFocused.current) return;
    if (editor.getValue() !== activeSource) editor.setValue(activeSource);
  }, [activeSource]);

  // ── Decoration: apply / clear whenever selection or tab changes ─────────────
  useEffect(() => {
    applyDecorations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, activeTab]);

  function applyDecorations() {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // Clear existing
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

    if (!selectedId) return;

    const text   = editor.getValue();
    const ranges = findRanges(text, selectedId, activeTab);
    if (ranges.length === 0) return;

    const newDecorations = ranges.map(({ start, end }) => ({
      range: new monaco.Range(start, 1, end, 1),
      options: {
        isWholeLine: true,
        className: "htmllab-highlight-line",
        linesDecorationsClassName: "htmllab-highlight-gutter",
        overviewRuler: {
          color: "#569cd6",
          position: monaco.editor.OverviewRulerLane.Right,
        },
      },
    }));

    decorationsRef.current = editor.deltaDecorations([], newDecorations);

    // Scroll to the first highlighted line, centred
    editor.revealLineInCenter(ranges[0].start, monaco.editor.ScrollType.Smooth);
  }

  const handleMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;
    injectGlowStyle();

    editor.setValue(activeSource);
    editor.onDidFocusEditorText(() => { isFocused.current = true;  });
    editor.onDidBlurEditorText(()  => { isFocused.current = false; });

    // Apply initial highlight if something is already selected
    setTimeout(applyDecorations, 0);
  };

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    clearTimeout(debounceRef.current);
    const editor = editorRef.current;
    if (editor) handlers[activeTab]?.(editor.getValue());
    isFocused.current = false;
    setActiveTab(tab);
    requestAnimationFrame(() => {
      const nextEditor = editorRef.current;
      if (nextEditor) nextEditor.setValue(sources[tab] ?? "");
    });
  };

  const handleChange = (val) => {
    clearTimeout(debounceRef.current);
    const tab = activeTab;
    debounceRef.current = setTimeout(() => {
      handlers[tab]?.(val ?? "");
    }, 750);
  };

  return (
    <div className={styles.codePanel} style={{ width }}>
      <div className={styles.panelHeader}>
        <div className={styles.codeTabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.codeTab} ${activeTab === tab.key ? styles.codeTabActive : ""}`}
              onClick={() => switchTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className={styles.panelHint}>Monaco · auto-syncs both ways</span>
      </div>
      <div className={styles.monacoWrap}>
        <Editor
          key={activeTab}
          defaultLanguage={activeLanguage}
          theme="vs-dark"
          options={{
            fontSize: 12,
            lineHeight: 19,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            renderLineHighlight: "line",
            padding: { top: 10, bottom: 10 },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
          onMount={handleMount}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
