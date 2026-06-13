import { useState, useReducer, useCallback, useRef } from "react";
import Toolbar from "./Toolbar";
import CanvasPanel from "./CanvasPanel";
import CodePanel from "./CodePanel";
import PropertiesPanel from "./PropertiesPanel";
import { labReducer, initialState } from "./labReducer";
import { elementsToHtml, htmlToElements } from "./htmlSync";
import styles from "./HtmlLab.module.css";

export default function HtmlLab({ onBack }) {
  const [state, dispatch] = useReducer(labReducer, initialState);
  const [codePanelWidth, setCodePanelWidth] = useState(360);
  const dividerDragging = useRef(false);
  const dividerStartX = useRef(0);
  const dividerStartW = useRef(0);

  // Sync: elements → code
  const generatedCode = elementsToHtml(state.elements);

  // Sync: code → elements
  const handleCodeChange = useCallback((newCode) => {
    const parsed = htmlToElements(newCode, state.elements);
    if (parsed) {
      dispatch({ type: "SET_FROM_CODE", payload: parsed });
    }
  }, [state.elements]);

  const handleDividerMouseDown = (e) => {
    dividerDragging.current = true;
    dividerStartX.current = e.clientX;
    dividerStartW.current = codePanelWidth;
    e.preventDefault();

    const onMove = (e) => {
      if (!dividerDragging.current) return;
      const delta = dividerStartX.current - e.clientX;
      setCodePanelWidth(Math.max(200, Math.min(640, dividerStartW.current + delta)));
    };
    const onUp = () => {
      dividerDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className={styles.app}>
      <Toolbar
        showOverlay={state.showOverlay}
        onAddElement={(tag) => dispatch({ type: "ADD_ELEMENT", payload: tag })}
        onToggleOverlay={() => dispatch({ type: "TOGGLE_OVERLAY" })}
        onUndo={() => dispatch({ type: "UNDO" })}
        onClear={() => dispatch({ type: "CLEAR" })}
        canUndo={state.history.length > 0}
        onBack={onBack}
      />
      <div className={styles.main}>
        <CanvasPanel
          elements={state.elements}
          selectedId={state.selectedId}
          showOverlay={state.showOverlay}
          onSelect={(id) => dispatch({ type: "SELECT", payload: id })}
          onDeselect={() => dispatch({ type: "SELECT", payload: null })}
          onMove={(id, x, y) => dispatch({ type: "MOVE_ELEMENT", payload: { id, x, y } })}
          onResize={(id, w, h) => dispatch({ type: "RESIZE_ELEMENT", payload: { id, w, h } })}
          onDelete={(id) => dispatch({ type: "DELETE_ELEMENT", payload: id })}
          onMoveCommit={() => dispatch({ type: "PUSH_HISTORY" })}
        />

        <div className={styles.divider} onMouseDown={handleDividerMouseDown} />

        <CodePanel
          code={generatedCode}
          width={codePanelWidth}
          onChange={handleCodeChange}
        />

        <PropertiesPanel
          element={state.elements.find((e) => e.id === state.selectedId) || null}
          onChange={(prop, value) =>
            dispatch({ type: "UPDATE_STYLE", payload: { prop, value } })
          }
          onContentChange={(value) =>
            dispatch({ type: "UPDATE_CONTENT", payload: value })
          }
          onTagChange={(tag) =>
            dispatch({ type: "UPDATE_TAG", payload: tag })
          }
        />
      </div>
    </div>
  );
}
