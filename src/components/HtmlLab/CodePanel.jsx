import { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import styles from "./HtmlLab.module.css";

const TABS = [
  { key: "html", label: "HTML", language: "html" },
  { key: "css", label: "CSS", language: "css" },
  { key: "javascript", label: "JavaScript", language: "javascript" },
];

export default function CodePanel({
  html,
  css,
  javascript,
  width,
  onHtmlChange,
  onCssChange,
  onJavascriptChange,
}) {
  const debounceRef = useRef(null);
  const editorRef = useRef(null);
  const isFocused = useRef(false);
  const [activeTab, setActiveTab] = useState("html");

  const sources = { html, css, javascript };
  const handlers = {
    html: onHtmlChange,
    css: onCssChange,
    javascript: onJavascriptChange,
  };
  const activeSource = sources[activeTab] ?? "";
  const activeLanguage = TABS.find((tab) => tab.key === activeTab)?.language || "html";

  // When canvas changes, push new value into Monaco (only if not typing)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (isFocused.current) return;
    const currentVal = editor.getValue();
    if (currentVal !== activeSource) {
      editor.setValue(activeSource);
    }
  }, [activeSource]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    editor.setValue(activeSource);

    editor.onDidFocusEditorText(() => { isFocused.current = true; });
    editor.onDidBlurEditorText(() => { isFocused.current = false; });
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
        <span className={styles.panelHint}>Monaco editor · auto-syncs both ways</span>
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
