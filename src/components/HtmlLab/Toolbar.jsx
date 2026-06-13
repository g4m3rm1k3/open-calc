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
  showLabels,
  showComponents,
  previewMode,
  onAddElement,
  onToggleOverlay,
  onToggleLabels,
  onToggleComponents,
  onTogglePreview,
  onNew,
  onUndo,
  onClear,
  onExport,
  canUndo,
  onBack,
  onApplyGlobalTheme,
  onLoadExample,
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

      {/* Mode toggle */}
      <div className={styles.modePill}>
        <button
          className={`${styles.modeBtn} ${!showComponents ? styles.modeBtnActive : ""}`}
          onClick={() => showComponents && onToggleComponents()}
        >
          Elements
        </button>
        <button
          className={`${styles.modeBtn} ${showComponents ? styles.modeBtnActive : ""}`}
          onClick={() => !showComponents && onToggleComponents()}
        >
          Components
        </button>
      </div>
      <div className={styles.toolbarSep} />

      {!showComponents && (
        <>
          <span className={styles.toolbarLabel}>Add:</span>
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
        </>
      )}

      <div className={styles.toolbarSep} />

      <button
        className={`${styles.tbBtn} ${previewMode ? styles.tbBtnPreview : ""}`}
        onClick={onTogglePreview}
        title={previewMode ? "Back to editor (Esc)" : "Preview with live JavaScript"}
      >
        {previewMode ? "✎ Edit" : "▶ Preview"}
      </button>

      <button
        className={`${styles.tbBtn} ${showLabels ? styles.tbBtnActive : ""}`}
        onClick={onToggleLabels}
        title="Show/hide element tag labels"
      >
        &lt;/&gt; Labels
      </button>

      <button
        className={`${styles.tbBtn} ${showOverlay ? styles.tbBtnActive : ""}`}
        onClick={onToggleOverlay}
        title="Toggle box model overlay on selected element"
      >
        ⬜ Box model
      </button>

      <button
        className={`${styles.tbBtn} ${styles.tbBtnDanger}`}
        onClick={onNew}
        title="Start a new blank project"
      >
        + New
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
        className={styles.tbBtn}
        onClick={onExport}
        title="Download as index.html"
      >
        ↓ Export
      </button>

      <button
        className={`${styles.tbBtn} ${styles.tbBtnDanger}`}
        onClick={onClear}
        title="Clear canvas"
      >
        ✕ Clear
      </button>

      <div className={styles.toolbarSep} />

      <select
        className={styles.tbSelect}
        onChange={(e) => {
          if (onApplyGlobalTheme && e.target.value) {
            onApplyGlobalTheme(e.target.value);
            e.target.value = "";
          }
        }}
        defaultValue=""
        title="Apply a theme to all compatible components"
      >
        <option value="" disabled>Global Theme</option>
        <option value="Clean">Clean</option>
        <option value="Dark">Dark</option>
        <option value="Glass">Glass</option>
      </select>

      <button
        className={styles.tbBtn}
        onClick={onLoadExample}
        title="Load a full example project"
      >
        🌟 Load Example
      </button>
    </div>
  );
}
