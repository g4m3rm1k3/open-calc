import { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import "./App.css";

const CANVAS_W = 800;
const CANVAS_H = 600;

const SWATCHES = [
  "#1e1e1e", "#ffffff", "#e24b4a", "#ef9f27",
  "#639922", "#1d9e75", "#378ade", "#7f77dd", "#d4537e",
];

const TOOLS = [
  { id: "select", label: "Select", icon: "↖" },
  { id: "pen", label: "Draw (freehand)", icon: "✎" },
  { id: "line", label: "Line", icon: "╱" },
  { id: "rect", label: "Rectangle", icon: "▭" },
  { id: "ellipse", label: "Ellipse", icon: "◯" },
  { id: "triangle", label: "Triangle", icon: "△" },
  { id: "text", label: "Text", icon: "T" },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);

  const [tool, setTool] = useState("select");
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState(null);
  const [layers, setLayers] = useState([]);
  const [fillColor, setFillColor] = useState("#378ade");
  const [strokeColor, setStrokeColor] = useState("#1e1e1e");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [history, setHistory] = useState({ stack: [], idx: -1 });
  const isRestoring = useRef(false);
  const drawStart = useRef(null);
  const drawShape = useRef(null);

  // ---------- init fabric canvas ----------
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    const refreshLayers = () => {
      const objs = canvas.getObjects();
      setLayers(
        objs.map((o) => ({
          id: o.__id,
          type: o.type,
          name: o.__name || o.type,
          visible: o.visible !== false,
        })).reverse()
      );
    };

    const onSelection = () => {
      const obj = canvas.getActiveObject();
      setSelected(obj || null);
    };

    canvas.on("selection:created", onSelection);
    canvas.on("selection:updated", onSelection);
    canvas.on("selection:cleared", () => setSelected(null));
    canvas.on("object:added", (e) => {
      if (e.target && !e.target.__id) e.target.__id = uid();
      refreshLayers();
    });
    canvas.on("object:removed", refreshLayers);
    canvas.on("object:modified", () => {
      refreshLayers();
      pushHistory();
    });

    let saveTimer = null;
    const pushHistory = () => {
      if (isRestoring.current) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const json = JSON.stringify(canvas.toDatalessJSON(["__id", "__name"]));
        setHistory((h) => {
          const stack = h.stack.slice(0, h.idx + 1);
          stack.push(json);
          return { stack, idx: stack.length - 1 };
        });
      }, 250);
    };
    canvas.on("object:added", pushHistory);
    canvas.on("object:modified", pushHistory);
    canvas.on("object:removed", pushHistory);
    canvas.on("path:created", pushHistory);

    // seed initial history state
    setHistory({ stack: [JSON.stringify(canvas.toDatalessJSON(["__id", "__name"]))], idx: 0 });

    return () => canvas.dispose();
  }, []);

  // ---------- keyboard shortcuts ----------
  useEffect(() => {
    const onKey = (e) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.key === "Delete" || e.key === "Backspace")) {
        const active = canvas.getActiveObjects();
        if (active.length) {
          active.forEach((o) => canvas.remove(o));
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          e.preventDefault();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        duplicateSelected();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        canvas.discardActiveObject();
        const sel = new fabric.ActiveSelection(canvas.getObjects(), { canvas });
        canvas.setActiveObject(sel);
        canvas.requestRenderAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // ---------- drawing-tool mouse handlers ----------
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = tool === "pen";
    if (tool === "pen") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
    }

    canvas.selection = tool === "select";
    canvas.getObjects().forEach((o) => {
      o.selectable = tool === "select";
      o.evented = tool === "select";
    });

    const onDown = (opt) => {
      if (tool === "select" || tool === "pen") return;
      const p = canvas.getScenePoint(opt.e);
      drawStart.current = p;

      if (tool === "text") {
        const t = new fabric.IText("Edit me", {
          left: p.x,
          top: p.y,
          fontSize: 28,
          fill: fillColor,
          fontFamily: "-apple-system, sans-serif",
        });
        t.__id = uid();
        t.__name = "Text";
        canvas.add(t);
        canvas.setActiveObject(t);
        t.enterEditing();
        setTool("select");
        return;
      }

      let shape;
      const common = {
        left: p.x,
        top: p.y,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth,
      };
      if (tool === "rect") {
        shape = new fabric.Rect({ ...common, width: 1, height: 1 });
      } else if (tool === "ellipse") {
        shape = new fabric.Ellipse({ ...common, rx: 1, ry: 1 });
      } else if (tool === "triangle") {
        shape = new fabric.Triangle({ ...common, width: 1, height: 1 });
      } else if (tool === "line") {
        shape = new fabric.Line([p.x, p.y, p.x, p.y], {
          stroke: strokeColor,
          strokeWidth,
        });
      }
      if (shape) {
        shape.__id = uid();
        shape.__name = tool[0].toUpperCase() + tool.slice(1);
        drawShape.current = shape;
        canvas.add(shape);
      }
    };

    const onMove = (opt) => {
      if (!drawShape.current || !drawStart.current) return;
      const p = canvas.getScenePoint(opt.e);
      const s = drawStart.current;
      const shape = drawShape.current;

      if (tool === "rect" || tool === "triangle") {
        shape.set({
          left: Math.min(s.x, p.x),
          top: Math.min(s.y, p.y),
          width: Math.abs(p.x - s.x),
          height: Math.abs(p.y - s.y),
        });
      } else if (tool === "ellipse") {
        shape.set({
          left: Math.min(s.x, p.x),
          top: Math.min(s.y, p.y),
          rx: Math.abs(p.x - s.x) / 2,
          ry: Math.abs(p.y - s.y) / 2,
        });
      } else if (tool === "line") {
        shape.set({ x2: p.x, y2: p.y });
      }
      canvas.requestRenderAll();
    };

    const onUp = () => {
      if (drawShape.current) {
        const shape = drawShape.current;
        drawShape.current = null;
        drawStart.current = null;
        canvas.setActiveObject(shape);
        canvas.fire("object:modified");
        setTool("select");
      }
    };

    canvas.on("mouse:down", onDown);
    canvas.on("mouse:move", onMove);
    canvas.on("mouse:up", onUp);
    return () => {
      canvas.off("mouse:down", onDown);
      canvas.off("mouse:move", onMove);
      canvas.off("mouse:up", onUp);
    };
  }, [tool, fillColor, strokeColor, strokeWidth]);

  // ---------- history ----------
  const restore = useCallback((json) => {
    const canvas = fabricRef.current;
    if (!canvas || !json) return;
    isRestoring.current = true;
    canvas.loadFromJSON(JSON.parse(json), () => {
      canvas.requestRenderAll();
      isRestoring.current = false;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.idx <= 0) return h;
      const idx = h.idx - 1;
      restore(h.stack[idx]);
      return { ...h, idx };
    });
  }, [restore]);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.idx >= h.stack.length - 1) return h;
      const idx = h.idx + 1;
      restore(h.stack[idx]);
      return { ...h, idx };
    });
  }, [restore]);

  // ---------- object actions ----------
  const duplicateSelected = useCallback(async () => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (!active) return;
    const clone = await active.clone();
    clone.set({ left: active.left + 16, top: active.top + 16, __id: uid() });
    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.requestRenderAll();
    canvas.fire("object:modified");
  }, []);

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObjects();
    if (!active?.length) return;
    active.forEach((o) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);

  const bringForward = () => {
    const c = fabricRef.current;
    const o = c?.getActiveObject();
    if (o) { c.bringObjectForward(o); c.requestRenderAll(); c.fire("object:modified"); }
  };
  const sendBackward = () => {
    const c = fabricRef.current;
    const o = c?.getActiveObject();
    if (o) { c.sendObjectBackwards(o); c.requestRenderAll(); c.fire("object:modified"); }
  };
  const bringToFront = () => {
    const c = fabricRef.current;
    const o = c?.getActiveObject();
    if (o) { c.bringObjectToFront(o); c.requestRenderAll(); c.fire("object:modified"); }
  };
  const sendToBack = () => {
    const c = fabricRef.current;
    const o = c?.getActiveObject();
    if (o) { c.sendObjectToBack(o); c.requestRenderAll(); c.fire("object:modified"); }
  };

  const align = (where) => {
    const c = fabricRef.current;
    const o = c?.getActiveObject();
    if (!o) return;
    const w = o.getScaledWidth();
    const h = o.getScaledHeight();
    if (where === "left") o.set({ left: 0 });
    if (where === "centerH") o.set({ left: (CANVAS_W - w) / 2 });
    if (where === "right") o.set({ left: CANVAS_W - w });
    if (where === "top") o.set({ top: 0 });
    if (where === "centerV") o.set({ top: (CANVAS_H - h) / 2 });
    if (where === "bottom") o.set({ top: CANVAS_H - h });
    o.setCoords();
    c.requestRenderAll();
    c.fire("object:modified");
  };

  // ---------- zoom ----------
  const applyZoom = (z) => {
    const canvas = fabricRef.current;
    const clamped = Math.min(4, Math.max(0.1, z));
    canvas.setZoom(clamped);
    canvas.setDimensions({ width: CANVAS_W * clamped, height: CANVAS_H * clamped });
    setZoom(clamped);
  };

  // ---------- import / export ----------
  const exportSVG = () => {
    const canvas = fabricRef.current;
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drawing.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    const canvas = fabricRef.current;
    const prevZoom = canvas.getZoom();
    canvas.setZoom(1);
    canvas.setDimensions({ width: CANVAS_W, height: CANVAS_H });
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
    canvas.setZoom(prevZoom);
    canvas.setDimensions({ width: CANVAS_W * prevZoom, height: CANVAS_H * prevZoom });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "drawing.png";
    a.click();
  };

  const importSVGFile = (file) => {
    const canvas = fabricRef.current;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = await fabric.loadSVGFromString(String(reader.result));
      const objects = result.objects.filter(Boolean);
      const group = fabric.util.groupSVGElements(objects, result.options);
      group.__id = uid();
      group.__name = file.name.replace(/\.svg$/i, "");
      group.set({
        left: (CANVAS_W - group.width) / 2,
        top: (CANVAS_H - group.height) / 2,
      });
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
      canvas.fire("object:modified");
    };
    reader.readAsText(file);
  };

  const newCanvas = () => {
    if (!window.confirm("Clear the canvas? This can't be undone.")) return;
    const canvas = fabricRef.current;
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.requestRenderAll();
    setHistory({ stack: [JSON.stringify(canvas.toDatalessJSON(["__id", "__name"]))], idx: 0 });
  };

  // ---------- selected-object property editing ----------
  const updateSelected = (props) => {
    const canvas = fabricRef.current;
    const o = canvas?.getActiveObject();
    if (!o) return;
    o.set(props);
    o.setCoords();
    canvas.requestRenderAll();
    canvas.fire("object:modified");
    setSelected(o); // re-render panel without losing focus issues since inputs are controlled per-change
  };

  const selectLayer = (id) => {
    const canvas = fabricRef.current;
    const obj = canvas.getObjects().find((o) => o.__id === id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      setTool("select");
    }
  };

  const removeLayer = (id, e) => {
    e.stopPropagation();
    const canvas = fabricRef.current;
    const obj = canvas.getObjects().find((o) => o.__id === id);
    if (obj) {
      canvas.remove(obj);
      canvas.requestRenderAll();
    }
  };

  const toggleVisible = (id, e) => {
    e.stopPropagation();
    const canvas = fabricRef.current;
    const obj = canvas.getObjects().find((o) => o.__id === id);
    if (obj) {
      obj.visible = !obj.visible;
      canvas.requestRenderAll();
      canvas.fire("object:modified");
    }
  };

  return (
    <div className="app">
      {/* ---------------- TOP BAR ---------------- */}
      <div className="topbar">
        <span className="brand">SVG Studio</span>

        <button className="tbtn" onClick={newCanvas}>New</button>
        <button className="tbtn" onClick={() => fileInputRef.current.click()}>Import SVG</button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="file-input-hidden"
          onChange={(e) => {
            if (e.target.files[0]) importSVGFile(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <button className="tbtn primary" onClick={exportSVG}>Export SVG</button>
        <button className="tbtn" onClick={exportPNG}>Export PNG</button>

        <div className="divider" />

        <button className="tbtn" onClick={undo} disabled={history.idx <= 0}>Undo</button>
        <button className="tbtn" onClick={redo} disabled={history.idx >= history.stack.length - 1}>Redo</button>
        <button className="tbtn" onClick={duplicateSelected} disabled={!selected}>Duplicate</button>
        <button className="tbtn" onClick={deleteSelected} disabled={!selected}>Delete</button>

        <div className="spacer" />

        <button className="tbtn" onClick={() => applyZoom(zoom - 0.1)}>−</button>
        <span className="zoom-readout">{Math.round(zoom * 100)}%</span>
        <button className="tbtn" onClick={() => applyZoom(zoom + 0.1)}>+</button>
        <button className="tbtn" onClick={() => applyZoom(1)}>Reset</button>
      </div>

      {/* ---------------- LEFT TOOL RAIL ---------------- */}
      <div className="toolrail">
        <div className="tool-section-label">Tools</div>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={"tool-btn" + (tool === t.id ? " active" : "")}
            onClick={() => setTool(t.id)}
          >
            <span className="icon">{t.icon}</span>
            {t.label}
          </button>
        ))}

        <div className="tool-section-label">Fill</div>
        <div className="field-row" style={{ padding: "0 6px" }}>
          <input
            type="color"
            value={fillColor}
            onChange={(e) => {
              setFillColor(e.target.value);
              if (selected) updateSelected({ fill: e.target.value });
            }}
          />
          <input
            type="text"
            value={fillColor}
            onChange={(e) => {
              setFillColor(e.target.value);
              if (selected) updateSelected({ fill: e.target.value });
            }}
          />
        </div>
        <div className="swatch-row">
          {SWATCHES.map((c) => (
            <div
              key={c}
              className="swatch"
              style={{ background: c }}
              onClick={() => {
                setFillColor(c);
                if (selected) updateSelected({ fill: c });
              }}
            />
          ))}
        </div>

        <div className="tool-section-label">Stroke</div>
        <div className="field-row" style={{ padding: "0 6px" }}>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => {
              setStrokeColor(e.target.value);
              if (selected) updateSelected({ stroke: e.target.value });
            }}
          />
          <input
            type="number"
            min="0"
            max="40"
            value={strokeWidth}
            onChange={(e) => {
              const v = Number(e.target.value);
              setStrokeWidth(v);
              if (selected) updateSelected({ strokeWidth: v });
            }}
          />
        </div>
      </div>

      {/* ---------------- CANVAS ---------------- */}
      <div className="canvas-wrap">
        <div className="canvas-shadow">
          <canvas ref={canvasElRef} />
        </div>
      </div>

      {/* ---------------- RIGHT PANEL ---------------- */}
      <div className="sidepanel">
        <div className="panel-title">Properties</div>
        {!selected && (
          <p className="panel-empty">
            Select an object on the canvas to edit its position, size, rotation,
            color, and stacking order.
          </p>
        )}

        {selected && (
          <>
            <div className="field-row">
              <label>X / Y</label>
              <div className="field-pair">
                <input
                  type="number"
                  value={Math.round(selected.left)}
                  onChange={(e) => updateSelected({ left: Number(e.target.value) })}
                />
                <input
                  type="number"
                  value={Math.round(selected.top)}
                  onChange={(e) => updateSelected({ top: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="field-row">
              <label>Width / H</label>
              <div className="field-pair">
                <input
                  type="number"
                  value={Math.round(selected.getScaledWidth())}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    const baseW = selected.width || 1;
                    updateSelected({ scaleX: w / baseW });
                  }}
                />
                <input
                  type="number"
                  value={Math.round(selected.getScaledHeight())}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    const baseH = selected.height || 1;
                    updateSelected({ scaleY: h / baseH });
                  }}
                />
              </div>
            </div>

            <div className="field-row">
              <label>Rotate</label>
              <input
                type="range"
                min="0"
                max="360"
                value={Math.round(selected.angle || 0)}
                onChange={(e) => updateSelected({ angle: Number(e.target.value) })}
              />
              <span style={{ width: 32, fontSize: 12, color: "#9d9da2" }}>
                {Math.round(selected.angle || 0)}°
              </span>
            </div>

            <div className="field-row">
              <label>Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selected.opacity ?? 1}
                onChange={(e) => updateSelected({ opacity: Number(e.target.value) })}
              />
            </div>

            {"fill" in selected && (
              <div className="field-row">
                <label>Fill</label>
                <input
                  type="color"
                  value={typeof selected.fill === "string" ? selected.fill : "#000000"}
                  onChange={(e) => updateSelected({ fill: e.target.value })}
                />
                <input
                  type="text"
                  value={typeof selected.fill === "string" ? selected.fill : ""}
                  onChange={(e) => updateSelected({ fill: e.target.value })}
                />
              </div>
            )}

            <div className="field-row">
              <label>Stroke</label>
              <input
                type="color"
                value={selected.stroke || "#000000"}
                onChange={(e) => updateSelected({ stroke: e.target.value })}
              />
              <input
                type="number"
                min="0"
                max="60"
                value={selected.strokeWidth || 0}
                onChange={(e) => updateSelected({ strokeWidth: Number(e.target.value) })}
              />
            </div>

            {selected.type === "i-text" && (
              <div className="field-row">
                <label>Font size</label>
                <input
                  type="number"
                  value={selected.fontSize || 28}
                  onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                />
              </div>
            )}

            <div className="section-divider" />
            <div className="panel-title">Arrange</div>
            <div className="align-grid">
              <button onClick={() => align("left")}>Left</button>
              <button onClick={() => align("centerH")}>Center H</button>
              <button onClick={() => align("right")}>Right</button>
              <button onClick={() => align("top")}>Top</button>
              <button onClick={() => align("centerV")}>Center V</button>
              <button onClick={() => align("bottom")}>Bottom</button>
            </div>

            <div className="section-divider" />
            <div className="align-grid">
              <button onClick={bringToFront}>To front</button>
              <button onClick={bringForward}>Forward</button>
              <button onClick={sendBackward}>Backward</button>
              <button onClick={sendToBack}>To back</button>
            </div>
          </>
        )}

        <div className="section-divider" />
        <div className="panel-title">Layers</div>
        <div className="layer-list">
          {layers.length === 0 && (
            <p className="panel-empty">No objects yet — pick a tool and draw on the canvas.</p>
          )}
          {layers.map((l) => (
            <div
              key={l.id}
              className={"layer-row" + (selected?.__id === l.id ? " selected" : "")}
              onClick={() => selectLayer(l.id)}
            >
              <span className="layer-icon">{l.visible ? "●" : "○"}</span>
              <span className="layer-name">{l.name}</span>
              <button onClick={(e) => toggleVisible(l.id, e)} title="Toggle visibility">
                {l.visible ? "Hide" : "Show"}
              </button>
              <button onClick={(e) => removeLayer(l.id, e)} title="Delete">✕</button>
            </div>
          ))}
        </div>

        <div className="help-hint">
          Shortcuts: Delete removes selection, ⌘/Ctrl+D duplicates, ⌘/Ctrl+Z undo,
          ⌘/Ctrl+Shift+Z redo, ⌘/Ctrl+A select all. Use corner handles to scale,
          the top handle to rotate.
        </div>
      </div>
    </div>
  );
}
