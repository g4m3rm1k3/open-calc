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

  const generatedCode = elementsToHtml(state.elements);

  const handleCodeChange = useCallback((newCode) => {
    const parsed = htmlToElements(newCode, state.elements);
    if (parsed) dispatch({ type: "SET_FROM_CODE", payload: parsed });
  }, [state.elements]);

  const handleDividerMouseDown = (e) => {
    dividerDragging.current = true;
    dividerStartX.current = e.clientX;
    dividerStartW.current = codePanelWidth;
    e.preventDefault();
    const onMouseMove = (e) => {
      if (!dividerDragging.current) return;
      const delta = e.clientX - dividerStartX.current;
      setCodePanelWidth(Math.max(200, Math.min(640, dividerStartW.current + delta)));
    };
    const onUp = () => {
      dividerDragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMouseMove);
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
      {/* Layout: [Code] | [Canvas] | [Properties] */}
      <div className={styles.main}>
        <CodePanel
          code={generatedCode}
          width={codePanelWidth}
          onChange={handleCodeChange}
        />

        <div className={styles.divider} onMouseDown={handleDividerMouseDown} />

        <CanvasPanel
          elements={state.elements}
          selectedId={state.selectedId}
          showOverlay={state.showOverlay}
          onSelect={(id) => dispatch({ type: "SELECT", payload: id })}
          onDeselect={() => dispatch({ type: "SELECT", payload: null })}
          onDelete={(id) => dispatch({ type: "DELETE_ELEMENT", payload: id })}
          onNest={(childId, parentId, order) =>
            dispatch({ type: "NEST_ELEMENT", payload: { childId, parentId, order } })
          }
          onMoveToRoot={(id, order) =>
            dispatch({ type: "MOVE_TO_ROOT", payload: { id, order } })
          }
          onReorder={(id, parentId, order) =>
            dispatch({ type: "REORDER_ELEMENT", payload: { id, parentId, order } })
          }
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
