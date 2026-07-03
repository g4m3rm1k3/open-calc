import styles from "./HtmlLab.module.css";

const ELEMENTS = [
  { tag: "div",     label: "div",     title: "Generic container" },
  { tag: "section", label: "section", title: "Section container" },
  { tag: "article", label: "article", title: "Article container" },
  { tag: "header",  label: "header",  title: "Header container" },
  { tag: "footer",  label: "footer",  title: "Footer container" },
  { tag: "nav",     label: "nav",     title: "Navigation container" },
  { tag: "ul",      label: "ul",      title: "Unordered list" },
  { tag: "ol",      label: "ol",      title: "Ordered list" },
  { tag: "li",      label: "li",      title: "List item" },
  { tag: "p",       label: "p",       title: "Paragraph" },
  { tag: "h1",      label: "H1",      title: "Heading 1" },
  { tag: "h2",      label: "H2",      title: "Heading 2" },
  { tag: "h3",      label: "H3",      title: "Heading 3" },
  { tag: "button",  label: "button",  title: "Button" },
  { tag: "span",    label: "span",    title: "Inline container" },
  { tag: "a",       label: "a",       title: "Anchor / link" },
  { tag: "img",     label: "img",     title: "Image placeholder" },
  { tag: "hr",      label: "hr",      title: "Horizontal rule" },
  { tag: "blockquote", label: "quote", title: "Blockquote" },
  { tag: "pre",     label: "pre",     title: "Preformatted code block" },
  { tag: "code",    label: "code",    title: "Inline code" },
  { tag: "label",   label: "label",   title: "Form label" },
  { tag: "video",   label: "video",   title: "Video player" },
  { tag: "audio",   label: "audio",   title: "Audio player" },
];

interface Props {
  showOverlay: boolean;
  showLabels: boolean;
  showComponents: boolean;
  showLibraries: boolean;
  previewMode: boolean;
  multiPageMode: boolean;
  onAddElement: (tag: string) => void;
  onToggleOverlay: () => void;
  onToggleLabels: () => void;
  onToggleComponents: () => void;
  onToggleLibraries: () => void;
  onTogglePreview: () => void;
  onToggleMultiPage: () => void;
  onImport: () => void;
  onNew: () => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
  onExportSplit: () => void;
  canUndo: boolean;
  onBack?: () => void;
  onApplyGlobalTheme?: (theme: string) => void;
  onLoadExample: () => void;
}

export default function Toolbar({
  showOverlay,
  showLabels,
  showComponents,
  showLibraries,
  previewMode,
  multiPageMode,
  onAddElement,
  onToggleOverlay,
  onToggleLabels,
  onToggleComponents,
  onToggleLibraries,
  onTogglePreview,
  onToggleMultiPage,
  onImport,
  onNew,
  onUndo,
  onClear,
  onExport,
  onExportSplit,
  canUndo,
  onBack,
  onApplyGlobalTheme,
  onLoadExample,
}: Props) {
  return (
    <div className={styles.toolbar}>
      {onBack && (
        <button className={styles.backBtn} onClick={onBack} title="Back to Labs">
          ← Labs
        </button>
      )}
      <span className={styles.toolbarLogo}>HTML Lab</span>
      <div className={styles.toolbarSep} />

      <div className={styles.modePill}>
        <button
          className={`${styles.modeBtn} ${!showComponents && !showLibraries ? styles.modeBtnActive : ""}`}
          onClick={() => (showComponents || showLibraries) && onToggleComponents()}
        >
          Elements
        </button>
        <button
          className={`${styles.modeBtn} ${showComponents ? styles.modeBtnActive : ""}`}
          onClick={() => !showComponents && onToggleComponents()}
        >
          Components
        </button>
        <button
          className={`${styles.modeBtn} ${showLibraries ? styles.modeBtnActive : ""}`}
          onClick={onToggleLibraries}
        >
          Libraries
        </button>
      </div>
      <div className={styles.toolbarSep} />

      {!showComponents && !showLibraries && (
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
        className={`${styles.tbBtn} ${multiPageMode ? styles.tbBtnActive : ""}`}
        onClick={onToggleMultiPage}
        title={multiPageMode ? "Join all pages into one" : "Split into multiple pages"}
      >
        {multiPageMode ? "⊟ Single page" : "⊞ Multi-page"}
      </button>

      <button
        className={styles.tbBtn}
        onClick={onImport}
        title="Import HTML, CSS, or JS files (select multiple to batch-import)"
      >
        ↑ Import
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
        title={multiPageMode ? "Download all pages as separate self-contained HTML files" : "Download as single self-contained index.html"}
      >
        {multiPageMode ? "↓ Export All" : "↓ Export"}
      </button>
      {!multiPageMode && (
        <button
          className={styles.tbBtn}
          onClick={onExportSplit}
          title="Download as 3 separate files: index.html + styles.css + script.js"
        >
          ↓ Split files
        </button>
      )}

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
