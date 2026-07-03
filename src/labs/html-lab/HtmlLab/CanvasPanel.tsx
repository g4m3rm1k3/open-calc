import { useRef, useState, useCallback } from "react";
import styles from "./HtmlLab.module.css";
import { CONTAINER_TAGS, TABLE_ROLE_TAGS } from "./labReducer";
import type { LabElement, BodyStyles } from "./types";

const VOID_TAGS = new Set(["img", "br", "hr", "input"]);

// Every element's real tag is wrapped in an administrative div (drag handle +
// tag badge). Mirroring the element's own `display` onto that wrapper is only
// correct for genuinely inline-flow values — it's what keeps e.g. inline <a>
// tags sitting side by side instead of each forcing its own line. Mirroring a
// shrink-to-fit *table* display instead breaks it: the wrapper becomes its
// own zero-width-until-content table box with no width of its own, so a real
// `<table style="width:100%">` inside it resolves 100% against that shrunk
// wrapper and collapses to content width, stranded at the left — exactly the
// "ignores the CSS, squished left in edit, fine in Preview" symptom. Same
// trap for `display:none`: mirroring it would hide the wrapper (and its
// select/drag handle) entirely, making a hidden element impossible to select
// and un-hide in the editor. Blocklist-style allow only the inline values
// that need it; everything else (block/flex/grid/table/table-*/none/unset)
// falls back to a plain block wrapper — the real tag underneath still gets
// its own actual `display` applied and lays out its own children normally.
const INLINE_FLOW_DISPLAYS = new Set(["inline", "inline-block", "inline-flex", "inline-grid", "list-item"]);
function wrapperDisplay(elDisplay: string | undefined): string {
  return elDisplay && INLINE_FLOW_DISPLAYS.has(elDisplay) ? elDisplay : "block";
}

interface DropTarget {
  parentId: string | null;
  order: number;
  type?: string;
}

interface Props {
  elements: LabElement[];
  selectedId: string | null;
  showOverlay: boolean;
  showLabels?: boolean;
  bodyStyles?: BodyStyles;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  onDelete: (id: string) => void;
  onNest: (childId: string, parentId: string, order: number) => void;
  onMoveToRoot: (id: string, order: number) => void;
  onReorder: (id: string, parentId: string | null, order: number) => void;
}

export default function CanvasPanel({
  elements,
  selectedId,
  showOverlay,
  showLabels = true,
  bodyStyles = {},
  onSelect,
  onDeselect,
  onDelete,
  onNest,
  onMoveToRoot,
  onReorder,
}: Props) {
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const overlayIds = showOverlay ? getSubtreeIds(elements, selectedId) : null;

  const childrenOf = useCallback((parentId: string | null): LabElement[] =>
    elements
      .filter((e) => (e.parentId ?? null) === (parentId ?? null))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  [elements]);

  const byId: Record<string, LabElement> = {};
  for (const e of elements) byId[e.id] = e;

  // ── Drag start ───────────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, el: LabElement): void => {
    e.stopPropagation();
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
    ghost.style.opacity = "0.6";
    ghost.style.position = "fixed";
    ghost.style.top = "-9999px";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", el.id);
    setDraggingId(el.id);
  };

  const handleDragEnd = (): void => {
    setDraggingId(null);
    setDropTarget(null);
  };

  // ── Drop zone enter ───────────────────────────────────────────────────────────
  const handleDropZoneEnter = (e: React.DragEvent, parentId: string | null, order: number): void => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ parentId: parentId ?? null, order });
  };

  const handleInsideEnter = (e: React.DragEvent, parentId: string): void => {
    e.preventDefault();
    e.stopPropagation();
    const children = childrenOf(parentId);
    setDropTarget({ parentId, order: children.length, type: "inside" });
  };
  void handleInsideEnter; // used via renderTag

  // ── Drop ─────────────────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent, parentId: string | null, order: number): void => {
    e.preventDefault();
    e.stopPropagation();
    const childId = e.dataTransfer.getData("text/plain");
    if (!childId) return;

    const child = byId[childId];
    if (!child) return;

    if (parentId === null) {
      const sameParent = child.parentId === null;
      if (sameParent) { onReorder(childId, null, order); }
      else            { onMoveToRoot(childId, order); }
    } else {
      const sameParent = child.parentId === parentId;
      if (sameParent) { onReorder(childId, parentId, order); }
      else            { onNest(childId, parentId, order); }
    }
    setDropTarget(null);
    setDraggingId(null);
  };

  const handleCanvasDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    const childId = e.dataTransfer.getData("text/plain");
    if (!childId) return;
    const roots = childrenOf(null);
    onMoveToRoot(childId, roots.length);
    setDropTarget(null);
    setDraggingId(null);
  };

  // ── Drop zone render ──────────────────────────────────────────────────────────
  const renderDropZone = (parentId: string | null, order: number, key: string): React.ReactNode => {
    const isActive =
      dropTarget &&
      (dropTarget.parentId ?? null) === (parentId ?? null) &&
      dropTarget.order === order;

    return (
      <div
        key={key}
        className={`${styles.dropZone} ${isActive ? styles.dropZoneActive : ""}`}
        onDragOver={(e) => { e.preventDefault(); handleDropZoneEnter(e, parentId, order); }}
        onDragEnter={(e) => handleDropZoneEnter(e, parentId, order)}
        onDrop={(e) => handleDrop(e, parentId, order)}
      />
    );
  };

  // ── Element render ────────────────────────────────────────────────────────────
  const renderElement = (el: LabElement): React.ReactNode => {
    const isSelected    = el.id === selectedId;
    const isDragging    = el.id === draggingId;
    const children      = childrenOf(el.id);
    const isContainer   = CONTAINER_TAGS.has(el.tag);
    const isInsideTarget = isContainer && dropTarget?.parentId === el.id;

    return (
      <div
        key={el.id}
        className={[
          styles.elWrap,
          isSelected    ? styles.elSelected    : "",
          isDragging    ? styles.elDragging    : "",
          isInsideTarget? styles.elDropInside  : "",
        ].join(" ")}
        style={{ display: wrapperDisplay(el.styles.display) }}
        draggable
        onDragStart={(e) => handleDragStart(e, el)}
        onDragEnd={handleDragEnd}
        onClick={(e) => { e.stopPropagation(); onSelect(el.id); }}
        onDragOver={(e) => {
          if (!isContainer) return;
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          if (!isContainer) return;
          const childId = e.dataTransfer.getData("text/plain");
          if (!childId || childId === el.id) return;
          e.stopPropagation();
          handleDrop(e, el.id, children.length);
        }}
      >
        <div className={`${styles.elTag}${!showLabels && !isSelected ? ` ${styles.elTagHidden}` : ""}`}>
          &lt;{el.tag}&gt;
          {isSelected && (
            <button
              className={styles.elDelete}
              onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
              title="Delete"
            >×</button>
          )}
        </div>

        {renderTag(el, children, renderElement, renderDropZone, isContainer, isInsideTarget)}

        {overlayIds?.has(el.id) && (
          <div className={styles.boxOverlay} aria-hidden="true">
            <div className={styles.boxOverlayMargin} />
            <div className={styles.boxOverlayBorder} />
            <div className={styles.boxOverlayPadding} />
            <div className={styles.boxOverlayContent} />
          </div>
        )}
      </div>
    );
  };

  const roots = childrenOf(null);

  return (
    <div className={styles.canvasPanel}>
      <div className={styles.panelHeader}>
        <span>Canvas</span>
        <span className={styles.panelHint}>
          Drag to move · drop onto a container to nest · drop between elements to reorder
        </span>
      </div>

      <div
        ref={canvasRef}
        className={styles.canvasDrop}
        style={{ ...bodyStyles, flex: 1, overflowY: "auto" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
        onClick={(e) => { if (e.target === e.currentTarget) onDeselect(); }}
      >
        {elements.length === 0 && (
          <div className={styles.emptyHint}>
            <div className={styles.emptyIcon}>↑</div>
            <p>Add elements from the toolbar above.<br />Drag to reorder or nest inside containers.</p>
          </div>
        )}

        {roots.length > 0 && renderDropZone(null, 0, "root-0")}
        {roots.map((el, i) => (
          <div key={el.id}>
            {renderElement(el)}
            {renderDropZone(null, i + 1, `root-${i + 1}`)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Render the actual HTML tag ────────────────────────────────────────────────
function renderTag(
  el: LabElement,
  children: LabElement[],
  renderElement: (el: LabElement) => React.ReactNode,
  renderDropZone: (parentId: string | null, order: number, key: string) => React.ReactNode,
  isContainer: boolean,
  isInsideTarget: boolean,
): React.ReactNode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = el.tag as any;
  const domAttrs = attrsToReactProps(el.attrs);
  const tagStyle: React.CSSProperties = {
    ...(el.styles as React.CSSProperties),
    boxSizing: "border-box",
    minHeight: isContainer && children.length === 0 ? "48px" : undefined,
  };

  if (el.tag === "img") {
    const placeholder =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160' viewBox='0 0 240 160'%3E%3Crect width='240' height='160' fill='%23e5e7eb'/%3E%3Cpath d='M28 122l46-46 34 34 28-28 76 76H28z' fill='%23cbd5e1'/%3E%3Ccircle cx='174' cy='46' r='18' fill='%2394a3b8'/%3E%3Ctext x='120' y='86' text-anchor='middle' font-family='Arial' font-size='16' fill='%2364748b'%3Eimg%3C/text%3E%3C/svg%3E";
    return (
      <img
        {...domAttrs}
        src={(domAttrs.src as string) || placeholder}
        alt={(domAttrs.alt as string) || "Image"}
        style={{
          ...tagStyle,
          width: tagStyle.width || "120px",
          height: tagStyle.height || "80px",
          objectFit: (tagStyle.objectFit as React.CSSProperties["objectFit"]) || "cover",
        }}
      />
    );
  }

  if (VOID_TAGS.has(el.tag)) {
    return <Tag {...(domAttrs as React.HTMLAttributes<HTMLElement>)} style={tagStyle} />;
  }

  if (isContainer) {
    return (
      <Tag {...(domAttrs as React.HTMLAttributes<HTMLElement>)} style={tagStyle}>
        {el.content && <span>{el.content}</span>}
        {children.length === 0 && isInsideTarget && (
          <div className={styles.emptyContainerHint}>drop here</div>
        )}
        {children.length > 0 && renderDropZone(el.id, 0, `${el.id}-dz-0`)}
        {children.map((child, i) => (
          <div
            key={child.id}
            style={TABLE_ROLE_TAGS.has(child.tag) ? { display: child.styles.display } : undefined}
          >
            {renderElement(child)}
            {renderDropZone(el.id, i + 1, `${el.id}-dz-${i + 1}`)}
          </div>
        ))}
      </Tag>
    );
  }

  const extraProps = el.tag === "a"
    ? { onClick: (e: React.MouseEvent) => e.preventDefault() }
    : {};

  // React specifically disallows setting a <textarea>'s initial text via
  // children (warns and won't render it) — it has to be defaultValue/value.
  if (el.tag === "textarea") {
    return (
      <Tag {...(domAttrs as React.HTMLAttributes<HTMLElement>)} style={tagStyle} defaultValue={el.content || ""} />
    );
  }

  return (
    <Tag {...(domAttrs as React.HTMLAttributes<HTMLElement>)} {...extraProps} style={tagStyle}>
      {el.content || ""}
    </Tag>
  );
}

function getSubtreeIds(elements: LabElement[], rootId: string | null): Set<string> {
  if (!rootId) return new Set(elements.map(e => e.id));
  const result = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const e of elements) {
      if (e.parentId === cur) { result.add(e.id); queue.push(e.id); }
    }
  }
  return result;
}

// A handful of real HTML attribute names aren't valid JSX prop names (`for`
// is a reserved word, `class` collides with the JS keyword) or use a
// different case than their DOM property (`datetime` -> `dateTime`,
// `colspan`/`rowspan` -> `colSpan`/`rowSpan`). LabElement.attrs always stores
// the real HTML name (that's what gets serialized to exported HTML in
// htmlSync.ts) — this is the one place it gets translated for React's canvas render.
const REACT_PROP_NAME: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  datetime: "dateTime",
  colspan: "colSpan",
  rowspan: "rowSpan",
  readonly: "readOnly",
  maxlength: "maxLength",
  tabindex: "tabIndex",
};
// Attributes React expects as an actual boolean, not the string "true"/"false"
// LabElement.attrs stores everything as (TAG_ATTRS is Record<string,string>).
const BOOLEAN_ATTRS = new Set(["controls", "checked", "disabled", "required", "readonly", "autoplay", "loop", "muted", "open", "selected"]);

function attrsToReactProps(attrs: Record<string, string> = {}): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  Object.entries(attrs).forEach(([key, value]) => {
    if (String(value || "").trim() === "") return;
    const propName = REACT_PROP_NAME[key] ?? key;
    props[propName] = BOOLEAN_ATTRS.has(key) ? value === "true" : value;
  });
  return props;
}
