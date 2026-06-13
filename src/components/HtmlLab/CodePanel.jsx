import { useRef, useEffect, useState } from "react";
import styles from "./HtmlLab.module.css";

export default function CodePanel({ code, width, onChange }) {
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);
  const [localValue, setLocalValue] = useState(code);
  const isFocused = useRef(false);

  // When canvas changes, update textarea only if not being edited
  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(code);
    }
  }, [code]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(val);
    }, 750);
  };

  return (
    <div className={styles.codePanel} style={{ width }}>
      <div className={styles.panelHeader}>
        <span>&lt;/&gt; HTML · inline CSS</span>
        <span className={styles.panelHint}>editable · auto-syncs both ways</span>
      </div>
      <textarea
        ref={textareaRef}
        className={styles.codeEditor}
        value={localValue}
        onChange={handleChange}
        onFocus={() => { isFocused.current = true; }}
        onBlur={() => { isFocused.current = false; }}
        spellCheck={false}
        placeholder="Elements you add will appear here as HTML with inline CSS..."
      />
    </div>
  );
}
