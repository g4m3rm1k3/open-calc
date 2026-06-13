import styles from "./HtmlLab.module.css";

const ELEMENTS = [
  { tag: "div",    label: "div" },
  { tag: "p",      label: "p" },
  { tag: "h1",     label: "H1" },
  { tag: "h2",     label: "H2" },
  { tag: "h3",     label: "H3" },
  { tag: "button", label: "button" },
  { tag: "span",   label: "span" },
  { tag: "img",    label: "img" },
  { tag: "a",      label: "a" },
  { tag: "ul",     label: "ul" },
];

export default function Toolbar({
  showOverlay,
  onAddElement,
  onToggleOverlay,
  onUndo,
  onClear,
  canUndo,
  onBack,
}) {
  return (
    <div className={styles.toolbar}>
      {onBack && (
        <button className={styles.backBtn} onClick={onBack} title="Back to Labs">
          ← Labs
        </button>
      )}
      <span className={styles.toolbarLogo}>HTML Lab</span>
      <div className={styles.toolbarSep} />

      <span className={styles.toolbarLabel}>Add element:</span>
      {ELEMENTS.map(({ tag, label }) => (
        <button
          key={tag}
          className={styles.elemBtn}
          onClick={() => onAddElement(tag)}
          title={`Add <${tag}>`}
        >
          {label}
        </button>
      ))}

      <div className={styles.toolbarSep} />

      <button
        className={`${styles.tbBtn} ${showOverlay ? styles.tbBtnActive : ""}`}
        onClick={onToggleOverlay}
        title="Toggle box model overlay"
      >
        ⬜ Box model
      </button>

      <button
        className={styles.tbBtn}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo last action"
      >
        ↩ Undo
      </button>

      <button
        className={`${styles.tbBtn} ${styles.tbBtnDanger}`}
        onClick={() => { if (window.confirm("Clear all elements?")) onClear(); }}
        title="Clear canvas"
      >
        ✕ Clear
      </button>
    </div>
  );
}
