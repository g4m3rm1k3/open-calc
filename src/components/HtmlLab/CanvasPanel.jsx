import { useRef, useCallback } from "react";
import styles from "./HtmlLab.module.css";

const VOID_TAGS = new Set(["img", "br", "hr", "input"]);

export default function CanvasPanel({
  elements,
  selectedId,
  showOverlay,
  onSelect,
  onDeselect,
  onMove,
  onResize,
  onDelete,
  onMoveCommit,
}) {
  const canvasRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);

  // ── drag start ──────────────────────────────────────────────────────────────
  const handleWrapMouseDown = useCallback((e, el, isResizeHandle) => {
    e.stopPropagation();
    onSelect(el.id);

    if (isResizeHandle) {
      resizeState.current = {
        id: el.id,
        startX: e.clientX,
        startY: e.clientY,
        startW: parseInt(el.styles.width) || 100,
        startH: parseInt(el.styles.height) || 50,
      };
    } else {
      const wrap = e.currentTarget;
      const rect = wrap.getBoundingClientRect();
      dragState.current = {
        id: el.id,
        offX: e.clientX - rect.left,
        offY: e.clientY - rect.top,
      };
    }

    const onMove2 = (moveE) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();

      if (dragState.current) {
        const x = Math.max(0, moveE.clientX - canvasRect.left - dragState.current.offX);
        const y = Math.max(0, moveE.clientY - canvasRect.top - dragState.current.offY);
        onMove(dragState.current.id, Math.round(x), Math.round(y));
      }

      if (resizeState.current) {
        const dw = moveE.clientX - resizeState.current.startX;
        const dh = moveE.clientY - resizeState.current.startY;
        const w = Math.max(30, resizeState.current.startW + dw);
        const h = Math.max(20, resizeState.current.startH + dh);
        onResize(resizeState.current.id, Math.round(w), Math.round(h));
      }
    };

    const onUp = () => {
      if (dragState.current || resizeState.current) onMoveCommit();
      dragState.current = null;
      resizeState.current = null;
      window.removeEventListener("mousemove", onMove2);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove2);
    window.addEventListener("mouseup", onUp);
  }, [onSelect, onMove, onResize, onMoveCommit]);

  return (
    <div className={styles.canvasPanel}>
      <div className={styles.panelHeader}>
        <span>Canvas</span>
        <span className={styles.panelHint}>
          Click an element type above to add · drag to move · click to select
        </span>
      </div>

      <div
        ref={canvasRef}
        className={styles.canvasDrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) onDeselect();
        }}
      >
        {elements.length === 0 && (
          <div className={styles.emptyHint}>
            <div className={styles.emptyIcon}>↑</div>
            <p>Add elements from the toolbar above.<br />Click an element to edit its styles.</p>
          </div>
        )}

        {elements.map((el) => {
          const isSelected = el.id === selectedId;
          const wrapClass = [
            styles.cvWrap,
            isSelected ? styles.cvSelected : "",
            showOverlay ? styles.cvOverlay : "",
          ].join(" ");

          const innerStyles = { ...el.styles };
          // Width/height on wrapping div, not inner tag (so resize works cleanly)
          const w = innerStyles.width;
          const h = innerStyles.height;
          delete innerStyles.width;
          delete innerStyles.height;

          return (
            <div
              key={el.id}
              className={wrapClass}
              style={{
                position: "absolute",
                left: el.x,
                top: el.y,
                width: w || "auto",
                height: h || "auto",
                zIndex: isSelected ? 100 : 1,
                cursor: "grab",
              }}
              onMouseDown={(e) => handleWrapMouseDown(e, el, false)}
            >
              {/* tag label */}
              {isSelected && (
                <div className={styles.cvTagLabel}>&lt;{el.tag}&gt;</div>
              )}

              {/* delete button */}
              {isSelected && (
                <button
                  className={styles.cvDelete}
                  onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
                  title="Delete element"
                >
                  ×
                </button>
              )}

              {/* the actual element */}
              {renderInner(el, innerStyles)}

              {/* resize handle */}
              {isSelected && (
                <div
                  className={styles.cvResize}
                  onMouseDown={(e) => { e.stopPropagation(); handleWrapMouseDown(e, el, true); }}
                />
              )}

              {/* overlay badges */}
              {showOverlay && (
                <div className={styles.overlayLabels}>
                  <span className={styles.overlayMargin}>M: {el.styles.margin || "0"}</span>
                  <span className={styles.overlayPadding}>P: {el.styles.padding || "0"}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderInner(el, innerStyles) {
  const Tag = el.tag;
  const shared = {
    style: { ...innerStyles, width: "100%", height: "100%", boxSizing: "border-box", pointerEvents: "none", userSelect: "none" },
  };

  if (el.tag === "img") {
    return (
      <div
        style={{
          ...shared.style,
          backgroundImage: "repeating-linear-gradient(45deg, #ccc 0, #ccc 1px, transparent 0, transparent 50%)",
          backgroundSize: "10px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          color: "#888",
        }}
      >
        img
      </div>
    );
  }

  if (VOID_TAGS.has(el.tag)) {
    return <Tag {...shared} />;
  }

  return <Tag {...shared}>{el.content || ""}</Tag>;
}
