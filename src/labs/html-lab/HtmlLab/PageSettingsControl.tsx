import { useEffect, useRef, useState } from "react";
import styles from "./HtmlLab.module.css";

interface Props {
  pageTitle: string;
  faviconUrl: string;
  onChange: (next: { pageTitle?: string; faviconUrl?: string }) => void;
}

// Page-level settings (title, favicon) live outside the canvas — there's no
// element to select for them — so this is a small standalone popover rather
// than a Properties panel row. Shared by both HtmlLab.tsx (Toolbar) and
// HtmlLabLesson.tsx (LessonToolbar) instead of duplicating the same markup.
export default function PageSettingsControl({ pageTitle, faviconUrl, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onOutsideClick(e: MouseEvent): void {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onOutsideClick);
    return () => window.removeEventListener("mousedown", onOutsideClick);
  }, [open]);

  return (
    <div className={styles.pageSettingsWrap} ref={wrapRef}>
      <button
        className={`${styles.tbBtn} ${open ? styles.tbBtnActive : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="Page title & favicon"
      >
        ⚙ Page Settings
      </button>
      {open && (
        <div className={styles.pageSettingsPanel}>
          <label className={styles.pageSettingsLabel}>
            Page title
            <input
              className={styles.pageSettingsInput}
              value={pageTitle}
              placeholder="My Page"
              onChange={(e) => onChange({ pageTitle: e.target.value })}
            />
          </label>
          <label className={styles.pageSettingsLabel}>
            Favicon URL
            <input
              className={styles.pageSettingsInput}
              value={faviconUrl}
              placeholder="https://example.com/favicon.ico"
              onChange={(e) => onChange({ faviconUrl: e.target.value })}
            />
          </label>
        </div>
      )}
    </div>
  );
}
