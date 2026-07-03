import { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import styles from "./HtmlLab.module.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JS context files, no type declarations
import { useGlobalTheme } from "../../../context/ThemeContext.jsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JS hooks file, no type declarations
import { useThemeColors } from "../../../hooks/useThemeColors.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JS utils file, no type declarations
import { setupOpenCalcMonaco } from "../../../utils/monacoThemes.js";
import type { LabElement } from "./types";

type MonacoEditor = Parameters<OnMount>[0];
type MonacoApi    = Parameters<OnMount>[1];

const TABS = [
  { key: "html",       label: "HTML",       language: "html" },
  { key: "css",        label: "CSS",        language: "css" },
  { key: "javascript", label: "JavaScript", language: "javascript" },
  { key: "tree",       label: "Tree",       language: null },
] as const;

type TabKey = typeof TABS[number]["key"];

let glowStyleInjected = false;
function injectGlowStyle(): void {
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

// ── Element Tree ──────────────────────────────────────────────────────────────

interface TreeProps {
  elements: LabElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  multiSelectedIds: string[];
  onToggleMultiSelect: (id: string) => void;
}

function ElementTree({ elements, selectedId, onSelect, onDelete, multiSelectedIds, onToggleMultiSelect }: TreeProps) {
  return (
    <div className={styles.codeTreePanel}>
      <button
        className={`${styles.treeItem} ${!selectedId ? styles.treeItemSelected : ""}`}
        onClick={() => onSelect(null)}
        title="<body> — page root"
      >
        <span className={styles.treeTagBody}>&lt;body&gt;</span>
        <span className={styles.treeItemLabel}>page root</span>
      </button>
      <TreeBranch
        elements={elements}
        selectedId={selectedId}
        onSelect={onSelect}
        onDelete={onDelete}
        parentId={null}
        depth={1}
        multiSelectedIds={multiSelectedIds}
        onToggleMultiSelect={onToggleMultiSelect}
      />
    </div>
  );
}

interface BranchProps extends TreeProps {
  parentId: string | null;
  depth: number;
}

function TreeBranch({ elements, selectedId, onSelect, onDelete, parentId, depth, multiSelectedIds, onToggleMultiSelect }: BranchProps) {
  const children = (elements || [])
    .filter(e => (e.parentId ?? null) === (parentId ?? null))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return children.map(el => {
    const isSelected = el.id === selectedId;
    const isMulti = multiSelectedIds?.includes(el.id);
    return (
      <div key={el.id}>
        <button
          className={`${styles.treeItem} ${isSelected ? styles.treeItemSelected : ""} ${isMulti ? styles.treeItemMulti : ""}`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          title={`<${el.tag}>${el.content ? ` "${el.content.slice(0, 30)}"` : ""} — Ctrl+click to multi-select`}
          onClick={(e) => {
            if ((e.ctrlKey || e.metaKey) && onToggleMultiSelect) {
              e.preventDefault();
              onToggleMultiSelect(el.id);
            } else {
              onSelect(el.id);
            }
          }}
        >
          <span className={styles.treeTag}>&lt;{el.tag}&gt;</span>
          {el.content && (
            <span className={styles.treeItemLabel}>{el.content.slice(0, 24)}</span>
          )}
          {isMulti && <span className={styles.treeMultiBadge}>✓</span>}
          <button
            className={styles.treeDeleteBtn}
            onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
            title="Delete"
          >×</button>
        </button>
        <TreeBranch
          elements={elements}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
          parentId={el.id}
          depth={depth + 1}
          multiSelectedIds={multiSelectedIds}
          onToggleMultiSelect={onToggleMultiSelect}
        />
      </div>
    );
  });
}

// ── Range finders ─────────────────────────────────────────────────────────────

interface LineRange { start: number; end: number; }

function findHtmlRanges(text: string, selectedId: string): LineRange[] {
  const lines = text.split("\n");
  const marker = `data-lab-id="${selectedId}"`;

  let openLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(marker)) { openLine = i; break; }
  }
  if (openLine === -1) return [];

  if (lines[openLine].trimEnd().endsWith("/>")) {
    return [{ start: openLine + 1, end: openLine + 1 }];
  }

  const tagMatch = lines[openLine].match(/<(\w[\w-]*)/);
  if (!tagMatch) return [{ start: openLine + 1, end: openLine + 1 }];
  const tagName = tagMatch[1];

  const openRe  = new RegExp(`<${tagName}[\\s>/]`);
  const closeRe = new RegExp(`</${tagName}>`);

  let depth     = 0;
  let closeLine = openLine;

  for (let i = openLine; i < lines.length; i++) {
    const line  = lines[i];
    const opens  = (line.match(openRe)  || []).length;
    const closes = (line.match(closeRe) || []).length;
    depth += opens - closes;
    if (depth <= 0 && i >= openLine) { closeLine = i; break; }
  }

  return [{ start: openLine + 1, end: closeLine + 1 }];
}

function findCssRanges(text: string, selectedId: string): LineRange[] {
  const lines  = text.split("\n");
  const marker = `[data-lab-id="${selectedId}"]`;

  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(marker)) { startLine = i; break; }
  }
  if (startLine === -1) return [];

  let endLine = startLine;
  let depth   = 0;
  for (let i = startLine; i < lines.length; i++) {
    const opens  = (lines[i].match(/\{/g) || []).length;
    const closes = (lines[i].match(/\}/g) || []).length;
    depth += opens - closes;
    if (i > startLine && depth <= 0) { endLine = i; break; }
    if (i === startLine && opens > 0 && depth <= 0) { endLine = i; break; }
  }

  return [{ start: startLine + 1, end: endLine + 1 }];
}

function findJsRanges(text: string, selectedId: string): LineRange[] {
  const lines = text.split("\n");
  return lines.reduce<LineRange[]>((acc, line, i) => {
    if (line.includes(selectedId)) acc.push({ start: i + 1, end: i + 1 });
    return acc;
  }, []);
}

function findRanges(text: string, selectedId: string, tab: string): LineRange[] {
  if (!text || !selectedId) return [];
  if (tab === "html")       return findHtmlRanges(text, selectedId);
  if (tab === "css")        return findCssRanges(text, selectedId);
  if (tab === "javascript") return findJsRanges(text, selectedId);
  return [];
}

// ── Component ─────────────────────────────────────────────────────────────────

interface CodePanelProps {
  html: string;
  css: string;
  javascript: string;
  width: string | number;
  selectedId: string | null;
  elements: LabElement[];
  multiSelectedIds: string[];
  onHtmlChange: (val: string) => void;
  onCssChange: (val: string) => void;
  onJavascriptChange: (val: string) => void;
  onSelectElement: (id: string | null) => void;
  onToggleMultiSelect: (id: string) => void;
  onDeleteElement: (id: string) => void;
}

export default function CodePanel({
  html,
  css,
  javascript,
  width,
  selectedId,
  elements,
  multiSelectedIds,
  onHtmlChange,
  onCssChange,
  onJavascriptChange,
  onSelectElement,
  onToggleMultiSelect,
  onDeleteElement,
}: CodePanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const C: any = useThemeColors();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { themeStyles }: any = useGlobalTheme();
  const monacoTheme: string = themeStyles?.monaco || (C.isDark ? "openmat-dark" : "openmat-light");

  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef      = useRef<MonacoEditor | null>(null);
  const monacoRef      = useRef<MonacoApi | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const isFocused      = useRef(false);
  const [activeTab, setActiveTab] = useState<TabKey>("html");

  const sources: Record<string, string>                     = { html, css, javascript };
  const handlers: Record<string, (val: string) => void>    = { html: onHtmlChange, css: onCssChange, javascript: onJavascriptChange };
  const activeSource   = sources[activeTab]   ?? "";
  const activeLanguage = TABS.find((t) => t.key === activeTab)?.language || "html";

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isFocused.current) return;
    if (editor.getValue() !== activeSource) editor.setValue(activeSource);
  }, [activeSource]);

  useEffect(() => {
    monacoRef.current?.editor.setTheme(monacoTheme);
  }, [monacoTheme]);

  useEffect(() => {
    applyDecorations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, activeTab]);

  function applyDecorations(): void {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

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
    editor.revealLineInCenter(ranges[0].start, monaco.editor.ScrollType.Smooth);
  }

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;
    injectGlowStyle();

    editor.setValue(activeSource);
    editor.onDidFocusEditorText(() => { isFocused.current = true;  });
    editor.onDidBlurEditorText(()  => { isFocused.current = false; });

    setTimeout(applyDecorations, 0);
  };

  const switchTab = (tab: TabKey): void => {
    if (tab === activeTab) return;
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    if (activeTab !== "tree") {
      const editor = editorRef.current;
      if (editor) handlers[activeTab]?.(editor.getValue());
    }
    isFocused.current = false;
    setActiveTab(tab);
    if (tab !== "tree") {
      requestAnimationFrame(() => {
        const nextEditor = editorRef.current;
        if (nextEditor) nextEditor.setValue(sources[tab] ?? "");
      });
    }
  };

  const handleChange = (val: string | undefined): void => {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
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
      </div>
      <div className={styles.monacoWrap}>
        {activeTab === "tree" ? (
          <ElementTree
            elements={elements}
            selectedId={selectedId}
            onSelect={onSelectElement}
            onDelete={onDeleteElement}
            multiSelectedIds={multiSelectedIds}
            onToggleMultiSelect={onToggleMultiSelect}
          />
        ) : (
          <Editor
            key={activeTab}
            defaultLanguage={activeLanguage ?? "html"}
            theme={monacoTheme}
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
            beforeMount={setupOpenCalcMonaco}
            onMount={handleMount}
            onChange={handleChange}
          />
        )}
      </div>
    </div>
  );
}
