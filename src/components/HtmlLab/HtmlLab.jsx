import { useState, useReducer, useCallback, useRef, useMemo, useEffect } from "react";
import Toolbar from "./Toolbar";
import CanvasPanel from "./CanvasPanel";
import CodePanel from "./CodePanel";
import PropertiesPanel from "./PropertiesPanel";
import ConfirmDialog, { shouldSkip } from "./ConfirmDialog";
import ExamplePickerModal from "./ExamplePickerModal";
import { EXAMPLES } from "./exampleGallery";
import { labReducer, initialState } from "./labReducer";
import { COMPONENTS, BODY_THEMES, detectComponents, buildThemeUpdates } from "./componentLibrary";
import { JS_PRESETS } from "./jsPresets";
import { CDN_LIBRARIES, resolveCdnTags } from "./cdnLibraries";
import {
  applyCssToElements,
  elementsToCss,
  elementsToHtml,
  htmlToElements,
  generateExportHtml,
  parseHtmlDocument,
} from "./htmlSync";
import styles from "./HtmlLab.module.css";

export default function HtmlLab({ onBack }) {
  const [state, dispatch] = useReducer(labReducer, undefined, () => {
    const ex = (EXAMPLES.find(e => e.id === "showcase") ?? EXAMPLES[0]).generate();
    return { ...initialState, elements: ex.elements, bodyStyles: ex.bodyStyles, javascript: ex.javascript ?? "" };
  });
  const [codePanelWidth, setCodePanelWidth] = useState(360);
  const [propsPanelWidth, setPropsPanelWidth] = useState(280);
  const [showComponents, setShowComponents] = useState(false);
  const [showLibraries, setShowLibraries] = useState(false);
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showExamplePicker, setShowExamplePicker] = useState(false);

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
  const fileInputRef = useRef(null);

  const propsDividerDragging = useRef(false);
  const propsDividerStartX = useRef(0);
  const propsDividerStartW = useRef(0);

  const askConfirm = useCallback((storageKey, message) => {
    if (shouldSkip(storageKey)) return Promise.resolve(true);
    return new Promise((resolve) => {
      setConfirmDialog({ storageKey, message, resolve });
    });
  }, []);

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

  const handlePropsDividerMouseDown = (e) => {
    propsDividerDragging.current = true;
    propsDividerStartX.current = e.clientX;
    propsDividerStartW.current = propsPanelWidth;
    e.preventDefault();
    const onMouseMove = (e) => {
      if (!propsDividerDragging.current) return;
      const delta = propsDividerStartX.current - e.clientX;
      setPropsPanelWidth(Math.max(200, Math.min(560, propsDividerStartW.current + delta)));
    };
    const onUp = () => {
      propsDividerDragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleFileImport = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target.result;
      if (ext === "html") {
        const ok = await askConfirm("import_html", `Import "${file.name}"? This replaces your current canvas.`);
        if (!ok) return;
        const parsed = parseHtmlDocument(content);
        dispatch({ type: "LOAD_EXAMPLE", payload: { elements: parsed.elements, bodyStyles: { ...initialState.bodyStyles, ...parsed.bodyStyles }, javascript: parsed.javascript, customCss: parsed.css } });
      } else if (ext === "css") {
        dispatch({ type: "SET_FROM_CSS", payload: applyCssToElements(content, state.elements) });
      } else if (ext === "js") {
        dispatch({ type: "SET_JAVASCRIPT", payload: appendJavascriptSnippet(state.javascript, content) });
      }
    };
    reader.readAsText(file);
  }, [askConfirm, state.elements, state.javascript]);

  const exportPage = useCallback((page) => {
    const cdnTags = resolveCdnTags(state.cdnLinks);
    const html = generateExportHtml(page.elements, page.bodyStyles, page.customCss || "", page.javascript, cdnTags);
    const slug = page.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "page";
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${slug}.html`; a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className={styles.app}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.css,.js"
        style={{ display: "none" }}
        onChange={handleFileImport}
      />
      {confirmDialog && (
        <ConfirmDialog
          storageKey={confirmDialog.storageKey}
          message={confirmDialog.message}
          onConfirm={() => { confirmDialog.resolve(true); setConfirmDialog(null); }}
          onCancel={() => { confirmDialog.resolve(false); setConfirmDialog(null); }}
        />
      )}
      {showExamplePicker && (
        <ExamplePickerModal
          onSelect={async (ex) => {
            setShowExamplePicker(false);
            const ok = await askConfirm("load_example", `Load "${ex.name}"? This will replace your current canvas.`);
            if (ok) {
              const data = ex.generate();
              dispatch({ type: "LOAD_EXAMPLE", payload: data });
            }
          }}
          onClose={() => setShowExamplePicker(false)}
        />
      )}
      <Toolbar
        showOverlay={state.showOverlay}
        showLabels={state.showLabels}
        showComponents={showComponents}
        previewMode={previewMode}
        multiPageMode={state.mode === "multi"}
        onAddElement={(tag) => dispatch({ type: "ADD_ELEMENT", payload: tag })}
        onToggleOverlay={() => dispatch({ type: "TOGGLE_OVERLAY" })}
        onToggleLabels={() => dispatch({ type: "TOGGLE_LABELS" })}
        onToggleComponents={() => { setShowComponents(v => !v); setShowLibraries(false); }}
        onToggleLibraries={() => { setShowLibraries(v => !v); setShowComponents(false); }}
        showLibraries={showLibraries}
        onTogglePreview={() => setPreviewMode(v => !v)}
        onToggleMultiPage={() => dispatch({ type: "TOGGLE_MULTIPAGE" })}
        onImport={() => fileInputRef.current?.click()}
        onNew={async () => {
          const ok = await askConfirm("new_project", "Start a new blank project? This will clear everything.");
          if (ok) {
            dispatch({ type: "LOAD_EXAMPLE", payload: { elements: [], bodyStyles: { ...initialState.bodyStyles }, javascript: "" } });
            setPreviewMode(false);
            setMultiSelectedIds([]);
          }
        }}
        onUndo={() => dispatch({ type: "UNDO" })}
        onClear={async () => {
          const ok = await askConfirm("clear_canvas", "Clear all elements from the canvas?");
          if (ok) dispatch({ type: "CLEAR" });
        }}
        onExport={() => {
          if (state.mode === "multi") {
            // Save current page then export all with short delay between
            const pages = state.pages.map((p) =>
              p.id === state.activePageId
                ? { ...p, elements: state.elements, bodyStyles: state.bodyStyles, javascript: state.javascript, customCss: state.customCss }
                : p,
            );
            pages.forEach((page, i) => setTimeout(() => exportPage(page), i * 200));
          } else {
            exportPage({ name: "index", elements: state.elements, bodyStyles: state.bodyStyles, customCss: state.customCss, javascript: state.javascript });
          }
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
        onLoadExample={() => setShowExamplePicker(true)}
      />

      {state.mode === "multi" && (
        <PageTabStrip
          pages={state.pages}
          activePageId={state.activePageId}
          onSwitch={(id) => dispatch({ type: "SWITCH_PAGE", payload: id })}
          onAdd={() => dispatch({ type: "ADD_PAGE" })}
          onDelete={(id) => dispatch({ type: "DELETE_PAGE", payload: id })}
          onRename={(id, name) => dispatch({ type: "RENAME_PAGE", payload: { id, name } })}
        />
      )}

      {showComponents && (
        <div className={styles.compPanel}>
          {COMPONENTS.map(comp => (
            <button
              key={comp.id}
              className={styles.compCard}
              onClick={() => {
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
          <div className={styles.compDivider}>⚡ Interactive (JS)</div>
          {JS_PRESETS.filter(p => p.template).map(preset => (
            <button
              key={preset.id}
              className={styles.compCard}
              onClick={() => {
                dispatch({ type: "INSERT_TEMPLATE", payload: { template: preset.template } });
                dispatch({ type: "SET_JAVASCRIPT", payload: appendJavascriptSnippet(state.javascript, preset.code) });
                setShowComponents(false);
              }}
              title={preset.description}
            >
              <span className={styles.compIcon}>{preset.icon}</span>
              <span className={styles.compName}>{preset.label}</span>
              <span className={styles.compCat}>JavaScript</span>
            </button>
          ))}
        </div>
      )}
      {showLibraries && (
        <div className={styles.libPanel}>
          {CDN_LIBRARIES.map((lib) => {
            const active = state.cdnLinks.includes(lib.id);
            return (
              <button
                key={lib.id}
                className={`${styles.libCard} ${active ? styles.libCardActive : ""}`}
                onClick={() => dispatch({ type: "TOGGLE_CDN", payload: lib.id })}
                title={lib.url}
              >
                <span className={styles.libIcon}>{lib.icon}</span>
                <span className={styles.libName}>{lib.label}</span>
                <span className={styles.libCat}>{lib.category}</span>
                <span className={styles.libDesc}>{lib.description}</span>
                <span className={`${styles.libBadge} ${active ? styles.libBadgeOn : ""}`}>
                  {active ? "ON" : "OFF"}
                </span>
              </button>
            );
          })}
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

        {previewMode ? (
          <iframe
            key="preview-frame"
            className={styles.previewFrame}
            srcDoc={generateExportHtml(state.elements, state.bodyStyles, state.customCss, state.javascript, resolveCdnTags(state.cdnLinks))}
            title="Preview"
            sandbox="allow-scripts"
          />
        ) : (
          <>
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
                dispatch({ type: "NEST_ELEMENT", payload: { childId, parentId, order } })
              }
              onMoveToRoot={(id, order) =>
                dispatch({ type: "MOVE_TO_ROOT", payload: { id, order } })
              }
              onReorder={(id, parentId, order) =>
                dispatch({ type: "REORDER_ELEMENT", payload: { id, parentId, order } })
              }
            />

            <div className={styles.propsDivider} onMouseDown={handlePropsDividerMouseDown} />
            <PropertiesPanel
              style={{ width: propsPanelWidth, flexShrink: 0 }}
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
          </>
        )}
      </div>
    </div>
  );
}

function appendJavascriptSnippet(current, snippet) {
  const trimmed = current.trimEnd();
  if (trimmed.includes(snippet.trim())) return current;
  return `${trimmed}${trimmed ? "\n\n" : ""}${snippet}`;
}

function PageTabStrip({ pages, activePageId, onSwitch, onAdd, onDelete, onRename }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingId && inputRef.current) inputRef.current.select();
  }, [editingId]);

  function startRename(page, e) {
    e.stopPropagation();
    setEditingId(page.id);
    setDraft(page.name);
  }

  function commitRename() {
    if (editingId && draft.trim()) onRename(editingId, draft.trim());
    setEditingId(null);
  }

  return (
    <div className={styles.pageTabStrip}>
      {pages.map((page) => (
        <div
          key={page.id}
          className={`${styles.pageTab} ${page.id === activePageId ? styles.pageTabActive : ""}`}
          onClick={() => onSwitch(page.id)}
          onDoubleClick={(e) => startRename(page, e)}
          title="Double-click to rename"
        >
          {editingId === page.id ? (
            <input
              ref={inputRef}
              className={styles.pageTabInput}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setEditingId(null);
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={styles.pageTabName}>{page.name}</span>
          )}
          {pages.length > 1 && (
            <button
              className={styles.pageTabDel}
              onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}
              title="Delete page"
            >✕</button>
          )}
        </div>
      ))}
      <button className={styles.pageTabAdd} onClick={onAdd} title="Add page">+ Page</button>
    </div>
  );
}
