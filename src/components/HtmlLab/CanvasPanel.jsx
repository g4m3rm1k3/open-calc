import { useRef, useState, useCallback } from "react";
import styles from "./HtmlLab.module.css";
import { CONTAINER_TAGS } from "./labReducer";

const VOID_TAGS = new Set(["img", "br", "hr", "input"]);

/**
 * CanvasPanel — document-flow HTML builder
 *
 * Mental model:
 *   • Elements flow in document order (no absolute positioning)
 *   • Dragging an element shows drop zones throughout the tree
 *   • Dropping INSIDE a container tag nests it as a child
 *   • Dropping BETWEEN elements reorders them
 */
export default function CanvasPanel({
  elements,
  selectedId,
  showOverlay,
  onSelect,
  onDeselect,
  onDelete,
  onNest,       // (childId, parentId, order)
  onMoveToRoot, // (id, order)
  onReorder,    // (id, parentId, order)
}) {
  // dropTarget: { parentId: string|null, order: number, type: "inside"|"before"|"after" }
  const [dropTarget, setDropTarget] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const canvasRef = useRef(null);

  // ── Sort helper ──────────────────────────────────────────────────────────────
  const childrenOf = useCallback((parentId) =>
    elements
      .filter((e) => (e.parentId ?? null) === (parentId ?? null))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  [elements]);

  const byId = {};
  for (const e of elements) byId[e.id] = e;

  // ── Drag start ───────────────────────────────────────────────────────────────
  const handleDragStart = (e, el) => {
    e.stopPropagation();
    // Use a ghost image
    const ghost = e.currentTarget.cloneNode(true);
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

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  // ── Drop zone enter/leave ────────────────────────────────────────────────────
  const handleDropZoneEnter = (e, parentId, order) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ parentId: parentId ?? null, order });
  };

  const handleInsideEnter = (e, parentId) => {
    e.preventDefault();
    e.stopPropagation();
    const children = childrenOf(parentId);
    setDropTarget({ parentId, order: children.length, type: "inside" });
  };

  // ── Drop ─────────────────────────────────────────────────────────────────────
  const handleDrop = (e, parentId, order) => {
    e.preventDefault();
    e.stopPropagation();
    const childId = e.dataTransfer.getData("text/plain");
    if (!childId) return;

    const child = byId[childId];
    if (!child) return;

    if (parentId === null) {
      // Drop to root
      const sameParent = child.parentId === null;
      if (sameParent) {
        onReorder(childId, null, order);
      } else {
        onMoveToRoot(childId, order);
      }
    } else {
      // Drop into a container
      const sameParent = child.parentId === parentId;
      if (sameParent) {
        onReorder(childId, parentId, order);
      } else {
        onNest(childId, parentId, order);
      }
    }
    setDropTarget(null);
    setDraggingId(null);
  };

  // ── Canvas-level drop (root, end) ────────────────────────────────────────────
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const childId = e.dataTransfer.getData("text/plain");
    if (!childId) return;
    const roots = childrenOf(null);
    onMoveToRoot(childId, roots.length);
    setDropTarget(null);
    setDraggingId(null);
  };

  // ── Render a between-sibling drop zone ───────────────────────────────────────
  const renderDropZone = (parentId, order, key) => {
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

  // ── Render one element ───────────────────────────────────────────────────────
  const renderElement = (el) => {
    const isSelected = el.id === selectedId;
    const isDragging = el.id === draggingId;
    const children = childrenOf(el.id);
    const isContainer = CONTAINER_TAGS.has(el.tag);

    // "Drop inside" highlight: user is hovering inside this container
    const isInsideTarget =
      isContainer &&
      dropTarget?.parentId === el.id;

    return (
      <div
        key={el.id}
        className={[
          styles.elWrap,
          isSelected ? styles.elSelected : "",
          isDragging ? styles.elDragging : "",
          isInsideTarget ? styles.elDropInside : "",
        ].join(" ")}
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
        {/* tag badge */}
        <div className={styles.elTag}>
          &lt;{el.tag}&gt;
          {isSelected && (
            <button
              className={styles.elDelete}
              onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
              title="Delete"
            >×</button>
          )}
        </div>

        {/* render the actual element */}
        <div className={styles.elInner}>
          {renderTag(el, children, renderElement, renderDropZone, isContainer, isInsideTarget)}
        </div>

        {/* overlay badges */}
        {showOverlay && (
          <>
            <div className={styles.boxOverlay} aria-hidden="true">
              <div className={styles.boxOverlayMargin} />
              <div className={styles.boxOverlayBorder} />
              <div className={styles.boxOverlayPadding} />
              <div className={styles.boxOverlayContent} />
            </div>
            <div className={styles.overlayLabels}>
              <span className={styles.overlayMargin}>M: {el.styles.margin || "0"}</span>
              <span className={styles.overlayBorder}>B: {el.styles.border || "0"}</span>
              <span className={styles.overlayPadding}>P: {el.styles.padding || "0"}</span>
            </div>
          </>
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

        {/* root-level drop zones interleaved with elements */}
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

// ── Render the actual HTML tag with styling applied ──────────────────────────
function renderTag(el, children, renderElement, renderDropZone, isContainer, isInsideTarget) {
  const Tag = el.tag;
  const domAttrs = attrsToReactProps(el.attrs);
  const tagStyle = {
    ...el.styles,
    boxSizing: "border-box",
    // Containers need visible min-height so you can drop into empty ones
    minHeight: isContainer && children.length === 0 ? "48px" : undefined,
  };

  if (el.tag === "img") {
    const placeholder =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160' viewBox='0 0 240 160'%3E%3Crect width='240' height='160' fill='%23e5e7eb'/%3E%3Cpath d='M28 122l46-46 34 34 28-28 76 76H28z' fill='%23cbd5e1'/%3E%3Ccircle cx='174' cy='46' r='18' fill='%2394a3b8'/%3E%3Ctext x='120' y='86' text-anchor='middle' font-family='Arial' font-size='16' fill='%2364748b'%3Eimg%3C/text%3E%3C/svg%3E";
    return (
      <img
        {...domAttrs}
        src={domAttrs.src || placeholder}
        alt={domAttrs.alt || "Image"}
        style={{
          ...tagStyle,
          width: tagStyle.width || "120px",
          height: tagStyle.height || "80px",
          objectFit: tagStyle.objectFit || "cover",
        }}
      />
    );
  }

  if (VOID_TAGS.has(el.tag)) {
    return <Tag {...domAttrs} style={tagStyle} />;
  }

  if (isContainer) {
    return (
      <Tag {...domAttrs} style={tagStyle}>
        {el.content && <span>{el.content}</span>}

        {/* interleave children with drop zones */}
        {children.length === 0 && isInsideTarget && (
          <div className={styles.emptyContainerHint}>drop here</div>
        )}
        {children.length > 0 && renderDropZone(el.id, 0, `${el.id}-dz-0`)}
        {children.map((child, i) => (
          <div key={child.id}>
            {renderElement(child)}
            {renderDropZone(el.id, i + 1, `${el.id}-dz-${i + 1}`)}
          </div>
        ))}
      </Tag>
    );
  }

  return <Tag {...domAttrs} style={tagStyle}>{el.content || ""}</Tag>;
}

function attrsToReactProps(attrs = {}) {
  const props = {};
  Object.entries(attrs).forEach(([key, value]) => {
    if (String(value || "").trim() === "") return;
    props[key === "class" ? "className" : key] = value;
  });
  return props;
}
