import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  X,
  Play,
  Plus,
  Trash2,
  Terminal,
  Cpu,
  Database,
  Save,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import PopoutWindow from "./PopoutWindow.jsx";
import KatexBlock from "../math/KatexBlock.jsx";

const LATEX_MARKER = "__LATEX__:";

function renderNotebookOutput(output, isError) {
  const plainClass = `whitespace-pre-wrap ${isError ? "text-rose-400" : "text-slate-300"}`;
  if (!output) return null;

  const VIZ_MARKER = "__VIZ__:";
  const lines = output.split("\n");
  const parts = [];
  let plainBuffer = [];

  const flushPlain = () => {
    if (!plainBuffer.length) return;
    const text = plainBuffer.join("\n");
    parts.push(
      <pre key={`plain-${parts.length}`} className={plainClass}>
        {text}
      </pre>,
    );
    plainBuffer = [];
  };

  lines.forEach((line, idx) => {
    if (!isError && line.startsWith(LATEX_MARKER)) {
      flushPlain();
      const expr = line.slice(LATEX_MARKER.length).trim();
      if (expr) {
        parts.push(
          <div
            key={`latex-${idx}`}
            className="rounded-lg bg-slate-950/60 p-2 overflow-x-auto"
          >
            <KatexBlock expr={expr} />
          </div>,
        );
      }
      return;
    }
    if (!isError && line.startsWith(VIZ_MARKER)) {
      flushPlain();
      try {
        const payload = JSON.parse(line.slice(VIZ_MARKER.length));
        parts.push(
          <div key={`viz-${idx}`} className="my-2">
            {/* Placeholder: Replace with actual visualization component */}
            <div className="rounded-lg bg-indigo-950/60 p-2 text-indigo-200">
              <strong>Visualization:</strong> {payload.method || "custom"}
              <br />
              <span className="text-xs">{JSON.stringify(payload.data)}</span>
              {payload.kwargs && (
                <div className="text-xs mt-1">
                  Args: {JSON.stringify(payload.kwargs)}
                </div>
              )}
              <div className="text-xs italic mt-1">
                (Interactive 2D/3D visualization will appear here)
              </div>
            </div>
          </div>,
        );
      } catch (e) {
        parts.push(
          <div key={`viz-error-${idx}`} className="text-rose-400">
            [viz parse error]
          </div>,
        );
      }
      return;
    }
    plainBuffer.push(line);
  });

  flushPlain();
  return parts;
}

/**
 * GlobalPythonNotebook component
 * A standalone, draggable, and resizable Python environment.
 * Features:
 * - Persistent execution state across cells
 * - Pre-installed libraries (NumPy, SciPy, Matplotlib, SymPy)
 * - Auto-disables app shortcuts when active
 * - Modern Glassmorphism UI
 */
export default function GlobalPythonNotebook({ isOpen, onClose }) {
  const [popouts, setPopouts] = useState([]); // {id, title, content}
  // Download cell code as .py file
  const downloadCellCode = (cell) => {
    const blob = new Blob([cell.code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cell-${cell.id}.py`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Upload code to a cell
  const uploadCellCode = (cellId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".py,.txt";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        updateCellCode(cellId, evt.target.result);
      };
      reader.readAsText(file);
    };
    input.click();
  };
  const [pyodide, setPyodide] = useState(null);
  const [runtimeStatus, setRuntimeStatus] = useState("loading"); // loading, ready, installing, error
  const [installProgress, setInstallProgress] = useState(0);
  const [cells, setCells] = useState([
    {
      id: 1,
      code: '# Welcome to the Global Python Notebook\nimport numpy as np\nimport math\nfrom sympy import symbols, sin\n\n# Variables persist across cells\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\nprint(f"Computed {len(x)} points of sin(x)")\n\n# SymPy LaTeX rendering\nt = symbols("t")\ndisplay(sin(t)**2)\n"Ready to go!"',
      output: "",
      status: "idle",
    },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);

  // -- Load Pyodide and Pre-install Libraries --
  useEffect(() => {
    if (!isOpen) return;
    if (pyodide) return; // Already loaded

    async function initPyodide() {
      try {
        if (window.loadPyodide) {
          const py = await window.loadPyodide();
          setPyodide(py);
          setRuntimeStatus("installing");
          await py.loadPackage(["numpy", "micropip"]);
          await py.runPythonAsync(`
            import micropip
            await micropip.install(['sympy', 'scipy', 'matplotlib'])
          `);
          setRuntimeStatus("ready");
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        script.onload = async () => {
          const py = await window.loadPyodide();

          setRuntimeStatus("installing");
          // Pre-load common libraries
          // loadPackage is faster than micropip for core packages
          await py.loadPackage(["numpy", "micropip"]);

          // Use micropip for more specific ones
          await py.runPythonAsync(`
            import micropip
            await micropip.install(['sympy', 'scipy', 'matplotlib'])
          `);

          setPyodide(py);
          setRuntimeStatus("ready");
        };
        document.head.appendChild(script);
      } catch (err) {
        setRuntimeStatus("error");
        console.error("Failed to init Pyodide:", err);
      }
    }
    initPyodide();
  }, [isOpen, pyodide]);

  // -- Shortcut Management --
  useEffect(() => {
    if (isOpen) {
      // Disable global app shortcuts by capturing events
      const stopShortcuts = (e) => {
        // We only stop if we're focused on the notebook or if it's open and it's a "single key" shortcut
        // usually OpenCalc uses 'g', '3', 'x', 's', 'c'.
        const activeTag = document.activeElement?.tagName;
        const isInput =
          activeTag === "INPUT" ||
          activeTag === "TEXTAREA" ||
          document.activeElement?.classList.contains("monaco-editor");

        // If it's one of OpenCalc's single-key shortcuts, stop it from bubbling if notebook is open
        if (
          !isInput &&
          ["g", "3", "x", "s", "c"].includes(e.key.toLowerCase())
        ) {
          e.stopPropagation();
        }
      };

      window.addEventListener("keydown", stopShortcuts, true); // Use capture phase
      return () => window.removeEventListener("keydown", stopShortcuts, true);
    }
  }, [isOpen]);

  const runCell = useCallback(
    async (cellId) => {
      if (!pyodide || isExecuting) return;

      setIsExecuting(true);
      setCells((prev) =>
        prev.map((c) => (c.id === cellId ? { ...c, status: "running" } : c)),
      );

      const cell = cells.find((c) => c.id === cellId);
      let output = "";

      pyodide.setStdout({
        batched: (msg) => {
          output += msg + "\n";
        },
      });

      try {
        // Inject helpers for LaTeX rendering
        await pyodide.runPythonAsync(`
    from builtins import print as _print
    import json as _json
    try:
      from sympy import latex as _sympy_latex, Basic as _sympy_Basic
      def show_latex(expr):
        _print("__LATEX__:" + _sympy_latex(expr))
      def print_latex(expr):
        show_latex(expr)
      def display(expr):
        show_latex(expr)
    except Exception:
      def show_latex(expr):
        _print("__LATEX__:" + str(expr))
      def print_latex(expr):
        show_latex(expr)
      def display(expr):
        show_latex(expr)

    def viz(obj, method=None, **kwargs):
      payload = {"data": obj}
      if method:
        payload["method"] = method
      if kwargs:
        payload["kwargs"] = kwargs
      _print("__VIZ__:" + _json.dumps(payload))
    `);

        // Run the cell code
        let lastExprResult;
        try {
          // 1. Execute the cell code as-is
          await pyodide.runPythonAsync(cell.code);
          // 2. Parse and evaluate the last expression using AST
          lastExprResult = await pyodide.runPythonAsync(`
import ast
import sys
_cell_code = sys._getframe(1).f_globals.get('_cell_code_src', None)
_last_expr = None
if _cell_code is not None:
    try:
        tree = ast.parse(_cell_code, mode='exec')
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            _last_expr_code = compile(ast.Expression(tree.body[-1].value), '<cell_last_expr>', 'eval')
            _last_expr = eval(_last_expr_code, globals())
    except Exception:
        _last_expr = None
if _last_expr is not None:
    try:
        from sympy import Basic as _sympy_Basic, latex as _sympy_latex
        if isinstance(_last_expr, _sympy_Basic):
            _print("__LATEX__:" + _sympy_latex(_last_expr))
        else:
            _print(str(_last_expr))
    except Exception:
        _print(str(_last_expr))
`);
        } catch (e) {
          throw e;
        }
        if (lastExprResult !== undefined) {
          output += String(lastExprResult);
        }
        setCells((prev) =>
          prev.map((c) =>
            c.id === cellId ? { ...c, output, status: "idle" } : c,
          ),
        );
      } catch (err) {
        setCells((prev) =>
          prev.map((c) =>
            c.id === cellId
              ? {
                  ...c,
                  output: output + "\nError: " + err.message,
                  status: "error",
                }
              : c,
          ),
        );
      } finally {
        setIsExecuting(false);
      }
    },
    [pyodide, cells, isExecuting],
  );

  const addCell = () => {
    const newId =
      cells.length > 0 ? Math.max(...cells.map((c) => c.id)) + 1 : 1;
    setCells([...cells, { id: newId, code: "", output: "", status: "idle" }]);
  };

  const updateCellCode = (id, newCode) => {
    setCells((prev) =>
      prev.map((c) => (c.id === id ? { ...c, code: newCode } : c)),
    );
  };

  const removeCell = (id) => {
    if (cells.length > 1) {
      setCells((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Drag and resize logic could be added here similar to ScratchPad,
  // but for now let's focus on a fixed-right overlay that feels premium.

  return (
    <>
      {popouts.map((pop) => (
        <PopoutWindow
          key={pop.id}
          title={pop.title}
          onClose={() =>
            setPopouts((prev) => prev.filter((p) => p.id !== pop.id))
          }
        >
          {pop.content}
        </PopoutWindow>
      ))}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] pointer-events-none flex justify-end p-4">
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto lg:hidden"
            />

            <motion.div
              initial={{ x: 600, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 600, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <header className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                    <Terminal size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                      Python Sandbox
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`w-2 h-2 rounded-full ${runtimeStatus === "ready" ? "bg-teal-500 animate-pulse" : "bg-amber-500"}`}
                      />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        {runtimeStatus === "loading"
                          ? "Initializing Core..."
                          : runtimeStatus === "installing"
                            ? "Hydrating Libraries (NumPy, SciPy, SymPy)..."
                            : "Kernel: Python 3.11 (WASM)"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <X size={20} />
                </button>
              </header>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {runtimeStatus === "ready" ? (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-2">
                      <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 text-center">
                        <Cpu
                          size={14}
                          className="mx-auto mb-1 text-teal-600 dark:text-teal-400"
                        />
                        <span className="block text-[10px] font-bold text-teal-700 dark:text-teal-300">
                          NumPy Loaded
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-center">
                        <Activity
                          size={14}
                          className="mx-auto mb-1 text-indigo-600 dark:text-indigo-400"
                        />
                        <span className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                          SciPy Ready
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-center">
                        <Database
                          size={14}
                          className="mx-auto mb-1 text-amber-600 dark:text-amber-400"
                        />
                        <span className="block text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          SymPy Ready
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      Use <span className="font-mono">display(expr)</span> (or{" "}
                      <span className="font-mono">print_latex(expr)</span>) for
                      rendered SymPy LaTeX output.
                    </p>

                    {cells.map((cell) => (
                      <div
                        key={cell.id}
                        className="group bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            In [{cell.id}]
                          </span>
                          <div className="flex items-center gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => downloadCellCode(cell)}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                              title="Download cell as .py"
                            >
                              <svg
                                width="14"
                                height="14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 5v14m0 0l-5-5m5 5l5-5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => uploadCellCode(cell.id)}
                              className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                              title="Upload code to cell"
                            >
                              <svg
                                width="14"
                                height="14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 19V5m0 0l-5 5m5-5l5 5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => runCell(cell.id)}
                              disabled={isExecuting}
                              className="p-1 px-3 text-[10px] font-bold bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {cell.status === "running" ? (
                                <>
                                  <span className="w-2 h-2 rounded-full border border-white border-t-transparent animate-spin" />{" "}
                                  RUNNING
                                </>
                              ) : (
                                <>
                                  <Play size={10} fill="currentColor" /> RUN
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => removeCell(cell.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="min-h-[80px]">
                          <Editor
                            height="140px"
                            defaultLanguage="python"
                            theme="vs-dark"
                            value={cell.code}
                            onChange={(val) => updateCellCode(cell.id, val)}
                            options={{
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              fontSize: 13,
                              lineNumbers: "on",
                              padding: { top: 12, bottom: 12 },
                              automaticLayout: true,
                              backgroundColor: "transparent",
                            }}
                          />
                        </div>

                        {cell.output && (
                          <div className="px-5 py-4 bg-slate-900 border-t border-slate-800 font-mono text-[12px] leading-relaxed relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                Result [{cell.id}]
                              </div>
                              <button
                                className="text-xs text-teal-400 hover:text-teal-200 bg-slate-800 rounded px-2 py-1 ml-2 border border-slate-700"
                                title="Pop out output"
                                onClick={() => {
                                  setPopouts((prev) => [
                                    ...prev,
                                    {
                                      id: `${cell.id}-${Date.now()}`,
                                      title: `Output [${cell.id}]`,
                                      content: renderNotebookOutput(
                                        cell.output,
                                        cell.status === "error",
                                      ),
                                    },
                                  ]);
                                }}
                              >
                                Pop Out
                              </button>
                            </div>
                            <div className="space-y-2">
                              {renderNotebookOutput(
                                cell.output,
                                cell.status === "error",
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={addCell}
                      className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-teal-500 hover:border-teal-500/50 hover:bg-teal-50 dark:hover:bg-teal-500/5 transition-all text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      ADD CODE CELL
                    </button>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center relative overflow-hidden">
                      <motion.div
                        animate={{ y: [0, -40, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-full h-full bg-teal-500/20 absolute bottom-0 left-0"
                      />
                      <Terminal className="text-teal-500" size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Setting up Python...
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                        Downloading high-performance math libraries. This
                        happens once per session.
                      </p>
                    </div>
                    {runtimeStatus === "error" && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-medium">
                        Network Error: Could not download Pyodide. Check your
                        connection.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <footer className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 rounded-b-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <Save size={12} /> SESSION PERSISTENT
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <Activity size={12} /> OPTIMIZED WASM
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-tighter">
                    All state is local to this tab
                  </p>
                </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
