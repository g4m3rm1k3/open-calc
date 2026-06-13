import { useState, useReducer, useCallback, useRef, useMemo } from "react";
import Toolbar from "./Toolbar";
import CanvasPanel from "./CanvasPanel";
import CodePanel from "./CodePanel";
import PropertiesPanel from "./PropertiesPanel";
import { labReducer, initialState } from "./labReducer";
import { COMPONENTS, BODY_THEMES, detectComponents, buildThemeUpdates } from "./componentLibrary";
import {
  applyCssToElements,
  elementsToCss,
  elementsToHtml,
  htmlToElements,
  generateExportHtml,
} from "./htmlSync";
import { generateExampleProject } from "./exampleProject";
import styles from "./HtmlLab.module.css";

export default function HtmlLab({ onBack }) {
  const [state, dispatch] = useReducer(labReducer, initialState);
  const [codePanelWidth, setCodePanelWidth] = useState(360);
  const [showComponents, setShowComponents] = useState(false);
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);

  // Detect which components match the selected element's direct children
  const matchedComponents = useMemo(() => {
    if (!state.selectedId) return [];
    return detectComponents(state.selectedId, state.elements);
  }, [state.selectedId, state.elements]);

  // True when the body background is dark enough to warrant dark component defaults
  const bodyIsDark = useMemo(() => {
    const bg = state.bodyStyles.backgroundColor || "";
    if (bg.startsWith("#") && bg.length === 7) {
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.35;
    }
    const gradient = state.bodyStyles.background || "";
    return gradient.includes("0f172a") || gradient.includes("1e293b");
  }, [state.bodyStyles]);
  // Synthesise a shared-value element for multi-select property editing
  const multiElement = useMemo(() => {
    if (multiSelectedIds.length < 2) return null;
    const els = multiSelectedIds.map(id => state.elements.find(e => e.id === id)).filter(Boolean);
    // Compute shared styles (properties where ALL found elements agree)
    const allProps = [...new Set(els.flatMap(e => Object.keys(e.styles || {})))];
    const sharedStyles = {};
    if (els.length > 0) {
      allProps.forEach(prop => {
        const vals = els.map(e => e.styles?.[prop]);
        if (vals.every(v => v === vals[0] && v !== undefined)) sharedStyles[prop] = vals[0];
      });
    }
    return { id: "__multi__", tag: "div", styles: sharedStyles, attrs: {}, content: "", parentId: null, mediaQueries: [] };
  }, [multiSelectedIds, state.elements]);

  const dividerDragging = useRef(false);
  const dividerStartX = useRef(0);
  const dividerStartW = useRef(0);

  const generatedCode = elementsToHtml(state.elements);
  const generatedCss = elementsToCss(state.elements, state.customCss, state.bodyStyles);

  const selectedElement = state.selectedId
    ? state.elements.find((e) => e.id === state.selectedId) || null
    : { id: "__body__", tag: "body", styles: state.bodyStyles, content: "", attrs: {}, mediaQueries: [] };

  const handleCodeChange = useCallback(
    (newCode) => {
      const parsed = htmlToElements(newCode, state.elements, state.javascript);
      if (parsed) dispatch({ type: "SET_FROM_CODE", payload: parsed });
    },
    [state.elements, state.javascript],
  );

  const handleCssChange = useCallback(
    (newCss) => {
      const parsed = applyCssToElements(newCss, state.elements);
      dispatch({ type: "SET_FROM_CSS", payload: parsed });
    },
    [state.elements],
  );

  const handleDividerMouseDown = (e) => {
    dividerDragging.current = true;
    dividerStartX.current = e.clientX;
    dividerStartW.current = codePanelWidth;
    e.preventDefault();
    const onMouseMove = (e) => {
      if (!dividerDragging.current) return;
      const delta = e.clientX - dividerStartX.current;
      setCodePanelWidth(
        Math.max(200, Math.min(640, dividerStartW.current + delta)),
      );
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
        showLabels={state.showLabels}
        showComponents={showComponents}
        onAddElement={(tag) => dispatch({ type: "ADD_ELEMENT", payload: tag })}
        onToggleOverlay={() => dispatch({ type: "TOGGLE_OVERLAY" })}
        onToggleLabels={() => dispatch({ type: "TOGGLE_LABELS" })}
        onToggleComponents={() => setShowComponents(v => !v)}
        onUndo={() => dispatch({ type: "UNDO" })}
        onClear={() => dispatch({ type: "CLEAR" })}
        onExport={() => {
          const html = generateExportHtml(
            state.elements,
            state.bodyStyles,
            state.customCss,
            state.javascript,
          );
          const blob = new Blob([html], { type: "text/html" });
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement("a");
          a.href     = url;
          a.download = "index.html";
          a.click();
          URL.revokeObjectURL(url);
        }}
        canUndo={state.history.length > 0}
        onBack={onBack}
        onApplyGlobalTheme={(themeName) => {
          // Find the corresponding body theme
          const bodyTheme = BODY_THEMES.find(t => t.name.toLowerCase().includes(themeName.toLowerCase()) || t.id.toLowerCase().includes(themeName.toLowerCase()));
          
          const updates = [];
          
          // Check all potential component roots
          for (const el of state.elements) {
            const matched = detectComponents(el.id, state.elements);
            if (matched.length > 0) {
              const comp = matched[0];
              // Find the theme in this component that matches the themeName
              const compTheme = comp.themeGroups.flatMap(g => g.themes).find(t => 
                t.name.toLowerCase().includes(themeName.toLowerCase()) || t.id.toLowerCase().includes(themeName.toLowerCase())
              );
              
              if (compTheme) {
                const compUpdates = buildThemeUpdates(el.id, state.elements, compTheme);
                updates.push(...compUpdates);
              }
            }
          }
          
          dispatch({ 
            type: "APPLY_GLOBAL_THEME", 
            payload: { updates, bodyStyles: bodyTheme?.styles } 
          });
        }}
        onLoadExample={() => {
          if (window.confirm("This will replace your current canvas. Load example project?")) {
            dispatch({ type: "LOAD_EXAMPLE", payload: generateExampleProject() });
          }
        }}
      />

      {showComponents && (
        <div className={styles.compPanel}>
          {COMPONENTS.map(comp => (
            <button
              key={comp.id}
              className={styles.compCard}
              onClick={() => {
                // Find dark theme variant if body is dark
                const autoTheme = bodyIsDark
                  ? comp.themeGroups.flatMap(g => g.themes).find(t =>
                      t.name.toLowerCase() === "dark" || t.id.endsWith("-dark")
                    ) ?? null
                  : null;
                dispatch({ type: "INSERT_TEMPLATE", payload: { template: comp.template, autoTheme } });
                setShowComponents(false);
              }}
              title={comp.description}
            >
              <span className={styles.compIcon}>{comp.icon}</span>
              <span className={styles.compName}>{comp.name}</span>
              <span className={styles.compCat}>{comp.category}</span>
            </button>
          ))}
        </div>
      )}
      {/* Layout: [Code] | [Canvas] | [Properties] */}
      <div className={styles.main}>
        <CodePanel
          html={generatedCode}
          css={generatedCss}
          javascript={state.javascript}
          width={codePanelWidth}
          selectedId={state.selectedId}
          elements={state.elements}
          multiSelectedIds={multiSelectedIds}
          onHtmlChange={handleCodeChange}
          onCssChange={handleCssChange}
          onJavascriptChange={(value) =>
            dispatch({ type: "SET_JAVASCRIPT", payload: value })
          }
          onSelectElement={(id) => {
            dispatch({ type: "SELECT", payload: id });
            setMultiSelectedIds([]);
          }}
          onToggleMultiSelect={(id) =>
            setMultiSelectedIds(prev => {
              const s = new Set(prev);
              if (s.has(id)) s.delete(id); else s.add(id);
              return [...s];
            })
          }
          onDeleteElement={(id) => dispatch({ type: "DELETE_ELEMENT", payload: id })}
        />

        <div className={styles.divider} onMouseDown={handleDividerMouseDown} />

        <CanvasPanel
          elements={state.elements}
          selectedId={state.selectedId}
          showOverlay={state.showOverlay}
          showLabels={state.showLabels}
          bodyStyles={state.bodyStyles}
          onSelect={(id) => {
            dispatch({ type: "SELECT", payload: id });
            setMultiSelectedIds([]);
          }}
          onDeselect={() => {
            dispatch({ type: "SELECT", payload: null });
            setMultiSelectedIds([]);
          }}
          onDelete={(id) => dispatch({ type: "DELETE_ELEMENT", payload: id })}
          onNest={(childId, parentId, order) =>
            dispatch({
              type: "NEST_ELEMENT",
              payload: { childId, parentId, order },
            })
          }
          onMoveToRoot={(id, order) =>
            dispatch({ type: "MOVE_TO_ROOT", payload: { id, order } })
          }
          onReorder={(id, parentId, order) =>
            dispatch({
              type: "REORDER_ELEMENT",
              payload: { id, parentId, order },
            })
          }
        />

        <PropertiesPanel
          element={selectedElement}
          multiSelectedIds={multiSelectedIds}
          multiElement={multiElement}
          matchedComponents={matchedComponents}
          bodyThemes={!state.selectedId ? BODY_THEMES : null}
          onDelete={(id) => dispatch({ type: "DELETE_ELEMENT", payload: id })}
          onApplyComponentTheme={(theme) => {
            const updates = buildThemeUpdates(state.selectedId, state.elements, theme);
            dispatch({ type: "APPLY_COMPONENT_THEME", payload: { updates } });
          }}
          onApplyBodyTheme={(theme) =>
            theme.reset
              ? dispatch({ type: "RESET_BODY_STYLES" })
              : dispatch({ type: "APPLY_BODY_THEME", payload: theme.styles })
          }
          onChange={(prop, value) =>
            state.selectedId
              ? dispatch({ type: "UPDATE_STYLE", payload: { prop, value } })
              : dispatch({ type: "UPDATE_BODY_STYLE", payload: { prop, value } })
          }
          onMultiStyleChange={(prop, value) =>
            dispatch({ type: "UPDATE_MULTI_STYLE", payload: { ids: multiSelectedIds, prop, value } })
          }
          onContentChange={(value) =>
            dispatch({ type: "UPDATE_CONTENT", payload: value })
          }
          onTagChange={(tag) => dispatch({ type: "UPDATE_TAG", payload: tag })}
          onAttrChange={(prop, value) =>
            dispatch({ type: "UPDATE_ATTR", payload: { prop, value } })
          }
          javascript={state.javascript}
          onInsertJavascript={(snippet) =>
            dispatch({
              type: "SET_JAVASCRIPT",
              payload: appendJavascriptSnippet(state.javascript, snippet),
            })
          }
          onInsertJsPreset={(template, code) => {
            dispatch({ type: "INSERT_TEMPLATE", payload: { template } });
            dispatch({
              type: "SET_JAVASCRIPT",
              payload: appendJavascriptSnippet(state.javascript, code),
            });
          }}
          onApplyPreset={(presetStyles) =>
            dispatch({ type: "APPLY_PRESET", payload: presetStyles })
          }
          onAddMediaQuery={(mq) =>
            dispatch({ type: "ADD_MEDIA_QUERY", payload: mq })
          }
          onRemoveMediaQuery={(index) =>
            dispatch({ type: "REMOVE_MEDIA_QUERY", payload: index })
          }
        />
      </div>
    </div>
  );
}

function appendJavascriptSnippet(current, snippet) {
  const trimmed = current.trimEnd();
  if (trimmed.includes(snippet.trim())) return current;
  return `${trimmed}${trimmed ? "\n\n" : ""}${snippet}`;
}
