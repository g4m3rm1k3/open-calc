import styles from "./HtmlLab.module.css";

const ELEMENTS = [
  { tag: "div",     label: "div",     title: "Generic container" },
  { tag: "section", label: "section", title: "Section container" },
  { tag: "article", label: "article", title: "Article container" },
  { tag: "header",  label: "header",  title: "Header container" },
  { tag: "footer",  label: "footer",  title: "Footer container" },
  { tag: "ul",      label: "ul",      title: "Unordered list" },
  { tag: "li",      label: "li",      title: "List item" },
  { tag: "p",       label: "p",       title: "Paragraph" },
  { tag: "h1",      label: "H1",      title: "Heading 1" },
  { tag: "h2",      label: "H2",      title: "Heading 2" },
  { tag: "h3",      label: "H3",      title: "Heading 3" },
  { tag: "button",  label: "button",  title: "Button" },
  { tag: "span",    label: "span",    title: "Inline container" },
  { tag: "a",       label: "a",       title: "Anchor / link" },
  { tag: "img",     label: "img",     title: "Image placeholder" },
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
      {ELEMENTS.map(({ tag, label, title }) => (
        <button
          key={tag}
          className={styles.elemBtn}
          onClick={() => onAddElement(tag)}
          title={title}
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
