import { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import styles from "./HtmlLab.module.css";

export default function CodePanel({ code, width, onChange }) {
  const debounceRef = useRef(null);
  const editorRef = useRef(null);
  const isFocused = useRef(false);

  // When canvas changes, push new value into Monaco (only if not typing)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (isFocused.current) return;
    const currentVal = editor.getValue();
    if (currentVal !== code) {
      editor.setValue(code);
    }
  }, [code]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    editor.setValue(code);

    editor.onDidFocusEditorText(() => { isFocused.current = true; });
    editor.onDidBlurEditorText(() => { isFocused.current = false; });
  };

  const handleChange = (val) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(val ?? "");
    }, 750);
  };

  return (
    <div className={styles.codePanel} style={{ width }}>
      <div className={styles.panelHeader}>
        <span>&lt;/&gt; HTML · inline CSS</span>
        <span className={styles.panelHint}>Monaco editor · auto-syncs both ways</span>
      </div>
      <div className={styles.monacoWrap}>
        <Editor
          defaultLanguage="html"
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
