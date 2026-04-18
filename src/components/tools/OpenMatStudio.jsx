import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  RefreshCw,
  Cpu,
  LineChart,
  Sigma,
  Rows3,
  AlertCircle,
} from "lucide-react";
import FigureRenderer from "../viz/react/FigureRenderer.jsx";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";

function useColors() {
  const isDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return {
    bg: dark ? "#08111f" : "#f5f7fb",
    surface: dark ? "#0f172a" : "#ffffff",
    surface2: dark ? "#111c2d" : "#eef4ff",
    border: dark ? "#2b3a55" : "#d6deee",
    text: dark ? "#e5eefc" : "#132238",
    muted: dark ? "#8ca0bf" : "#5f6f86",
    hint: dark ? "#60718d" : "#8b99ae",
    blue: dark ? "#5bb6ff" : "#1769d1",
    amber: dark ? "#f6b94d" : "#b26a00",
    green: dark ? "#41d69f" : "#198754",
    red: dark ? "#ff8b8b" : "#c03535",
    purple: dark ? "#b89cff" : "#6f42c1",
    teal: dark ? "#2fd0c4" : "#0f8d85",
  };
}

const DEFAULT_CODE = `A = [1 2 3; 4 5 6; 7 8 10];
b = [3; 3; 4];
x = A \\ b

t = linspace(0, 2*pi, 200);
y = sin(2*t) .* exp(-0.15*t);
plot(t, y)
`;

const EXAMPLES = [
  {
    id: "linear-system",
    label: "Linear System",
    icon: Rows3,
    description: "Solve Ax = b and inspect the matrix inverse.",
    code: `A = [3 -1 2; 2 4 1; -1 2 5];
b = [10; 8; 7];
x = A \\ b
inv(A)
`,
  },
  {
    id: "signals",
    label: "Signals",
    icon: LineChart,
    description: "Generate a damped wave and plot it.",
    code: `t = linspace(0, 8*pi, 400);
y = sin(t) + 0.35*sin(3*t);
envelope = exp(-0.05*t);
plot(t, y .* envelope)
`,
  },
  {
    id: "eigen",
    label: "Eigenvalues",
    icon: Sigma,
    description: "Compute eigenvalues and eigenvectors.",
    code: `A = [4 1; 2 3];
[V, D] = eig(A)
D
V
`,
  },
  {
    id: "range-plot",
    label: "Range Syntax",
    icon: Cpu,
    description: "Use MATLAB-style colon ranges and vector math.",
    code: `x = -4:0.05:4;
y = x.^3 - 3*x;
plot(x, y)
`,
  },
];

const MATLAB_PREAMBLE = `
import json
import math
import numpy as np
import scipy.linalg as la

_oc_last_value = None
_oc_last_plot = None

def _oc_scalar(value):
    if isinstance(value, np.generic):
        value = value.item()
    if isinstance(value, complex):
        re = round(value.real, 6)
        im = round(value.imag, 6)
        sign = "+" if im >= 0 else "-"
        return f"{re} {sign} {abs(im)}i"
    if isinstance(value, float):
        return f"{value:.6g}"
    return str(value)

def _oc_format(value):
    if value is None:
        return ""
    if isinstance(value, tuple):
        return "\\n\\n".join(_oc_format(item) for item in value)
    if isinstance(value, np.ndarray):
        return np.array2string(value, precision=5, suppress_small=True)
    if isinstance(value, list):
        return "\\n".join(_oc_format(item) for item in value)
    return _oc_scalar(value)

def zeros(*shape):
    return np.zeros(shape)

def ones(*shape):
    return np.ones(shape)

def eye(n):
    return np.eye(int(n))

def rand(*shape):
    return np.random.rand(*shape)

def linspace(a, b, n=100):
    return np.linspace(a, b, int(n))

def det(A):
    return np.linalg.det(A)

def inv(A):
    return np.linalg.inv(A)

def eig(A):
    vals, vecs = np.linalg.eig(A)
    return vecs, np.diag(vals)

def solve(A, b):
    return np.linalg.solve(A, b)

def oc_range(start, step=None, end=None):
    if end is None:
        end = step
        step = 1
    if step == 0:
        raise ValueError("Range step cannot be zero")
    count = int(math.floor(((end - start) / step) + 1e-12)) + 1
    if count <= 0:
        return np.array([])
    values = start + step * np.arange(count)
    return values

def _oc_array(value):
    arr = np.array(value)
    if arr.ndim == 0:
        arr = np.array([arr.item()])
    return arr.astype(float if np.isrealobj(arr) else complex)

def plot(*args):
    global _oc_last_plot, _oc_last_value
    if len(args) == 1:
        y = _oc_array(args[0]).reshape(-1)
        x = np.arange(len(y))
    elif len(args) >= 2:
        x = _oc_array(args[0]).reshape(-1)
        y = _oc_array(args[1]).reshape(-1)
    else:
        raise ValueError("plot expects y or x, y")

    n = min(len(x), len(y))
    x = x[:n]
    y = y[:n]

    xmin = float(np.min(x)) if n else -1
    xmax = float(np.max(x)) if n else 1
    ymin = float(np.min(y)) if n else -1
    ymax = float(np.max(y)) if n else 1

    if xmin == xmax:
        xmin -= 1
        xmax += 1
    if ymin == ymax:
        ymin -= 1
        ymax += 1

    pad_x = (xmax - xmin) * 0.08
    pad_y = (ymax - ymin) * 0.15

    fig = {
        "type": "opencalc_figure",
        "title": "OpenMAT Plot",
        "xmin": xmin - pad_x,
        "xmax": xmax + pad_x,
        "ymin": ymin - pad_y,
        "ymax": ymax + pad_y,
        "height": 320,
        "elements": [
            {"type": "grid", "step": max((xmax - xmin) / 8, 1e-6), "color": "border"},
            {"type": "axes", "labels": True, "ticks": True},
            {
                "type": "curve",
                "xs": x.tolist(),
                "ys": [float(v.real) if isinstance(v, complex) else float(v) for v in y.tolist()],
                "color": "teal",
                "width": 2.5
            }
        ]
    }
    _oc_last_plot = json.dumps(fig)
    _oc_last_value = y
    return y

def disp(value):
    print(_oc_format(value))
`;

let pyodidePromise = null;

async function getPyodide() {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load Pyodide"));
        document.head.appendChild(script);
      });
    }

    const py = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      fullStdLib: false,
    });

    await py.loadPackage(["numpy", "scipy"]);
    return py;
  })();

  return pyodidePromise;
}

function splitTopLevel(input, separator) {
  const parts = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === "[" || char === "(" || char === "{") depth += 1;
    if (char === "]" || char === ")" || char === "}") depth -= 1;

    if (char === separator && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function convertMatrixLiteral(expr) {
  const trimmed = expr.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return "np.array([])";

  const rows = splitTopLevel(inner, ";").map((row) =>
    splitTopLevel(row.replace(/,/g, " "), " ")
      .filter(Boolean)
      .join(", "),
  );

  if (rows.length === 1) {
    return `np.array([${rows[0]}], dtype=float)`;
  }

  return `np.array([${rows.map((row) => `[${row}]`).join(", ")}], dtype=float)`;
}

function replaceRanges(expr) {
  return expr.replace(
    /(?<![\w\]\)])(-?\d+(?:\.\d+)?|[A-Za-z_][\w\.]*|\([^()]+\))\s*:\s*(-?\d+(?:\.\d+)?|[A-Za-z_][\w\.]*|\([^()]+\))\s*:\s*(-?\d+(?:\.\d+)?|[A-Za-z_][\w\.]*|\([^()]+\))/g,
    "oc_range($1, $2, $3)",
  ).replace(
    /(?<![\w\]\)])(-?\d+(?:\.\d+)?|[A-Za-z_][\w\.]*|\([^()]+\))\s*:\s*(-?\d+(?:\.\d+)?|[A-Za-z_][\w\.]*|\([^()]+\))/g,
    "oc_range($1, $2)",
  );
}

function translateExpression(expr) {
  let out = expr.trim();
  const matrix = convertMatrixLiteral(out);
  if (matrix) return matrix;

  out = replaceRanges(out);
  out = out.replace(/\.\^/g, "**");
  out = out.replace(/\.\*/g, "*");
  out = out.replace(/\.\//g, "/");
  out = out.replace(/(?<![<>~])=(?!=)/g, "==");
  out = out.replace(/\^/g, "**");
  out = out.replace(/([A-Za-z_][A-Za-z0-9_\]\)]*)'/g, "($1).T");
  out = out.replace(/\bpi\b/g, "np.pi");
  out = out.replace(/\btrue\b/gi, "True");
  out = out.replace(/\bfalse\b/gi, "False");
  out = out.replace(/\bsize\s*\(/g, "np.shape(");
  out = out.replace(/\blength\s*\(/g, "len(");
  return out;
}

function translateMatlabToPython(source) {
  const lines = source.split(/\r?\n/);
  const python = [];
  let lastOutputEnabled = false;

  for (const rawLine of lines) {
    const commentless = rawLine.replace(/%.*$/, "");
    const trimmed = commentless.trim();

    if (!trimmed) {
      python.push("");
      continue;
    }

    const hasSemicolon = /;\s*$/.test(trimmed);
    const line = trimmed.replace(/;\s*$/, "");
    lastOutputEnabled = !hasSemicolon;

    const multiAssign = line.match(/^\[([^\]]+)\]\s*=\s*(.+)$/);
    if (multiAssign) {
      const names = multiAssign[1]
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .join(", ");
      const rhs = translateExpression(multiAssign[2]);
      python.push(`${names} = ${rhs}`);
      if (!hasSemicolon) {
        const firstName = multiAssign[1].split(",")[0].trim();
        python.push(`_oc_last_value = ${firstName}`);
      }
      continue;
    }

    const assignment = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (assignment) {
      const [, name, rhsRaw] = assignment;
      const rhs = rhsRaw.includes("\\")
        ? rhsRaw.replace(/(.+?)\\(.+)/, "solve($1, $2)")
        : translateExpression(rhsRaw);
      python.push(`${name} = ${rhs}`);
      if (!hasSemicolon) python.push(`_oc_last_value = ${name}`);
      continue;
    }

    if (/^[A-Za-z_][\w]*\(.+\)$/.test(line) || /^[A-Za-z_][\w]*$/.test(line)) {
      const expr = translateExpression(line);
      if (hasSemicolon) {
        python.push(expr);
      } else {
        python.push(`_oc_last_value = ${expr}`);
      }
      continue;
    }

    const expr = translateExpression(line);
    if (hasSemicolon) {
      python.push(expr);
    } else {
      python.push(`_oc_last_value = ${expr}`);
    }
  }

  if (!lastOutputEnabled) {
    python.push("_oc_last_value = None");
  }

  return python.join("\n");
}

function buildRunner(source) {
  const translated = translateMatlabToPython(source);
  return `${MATLAB_PREAMBLE}
_oc_last_value = None
_oc_last_plot = None
${translated}
if _oc_last_plot:
    print(_oc_last_plot)
elif _oc_last_value is not None:
    print(_oc_format(_oc_last_value))
`;
}

function outputToFigure(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return null;
  if (!trimmed.includes('"type": "opencalc_figure"') && !trimmed.includes('"type":"opencalc_figure"')) {
    return null;
  }
  return trimmed;
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      className="rounded-2xl border p-4 shadow-sm"
      style={{
        borderColor: accent.border,
        background: accent.bg,
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: accent.badge }}
        >
          <Icon className="h-4 w-4" style={{ color: accent.text }} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: accent.text }}>
          {label}
        </span>
      </div>
      <p className="text-sm leading-6" style={{ color: accent.copy }}>
        {value}
      </p>
    </div>
  );
}

export default function OpenMatStudio() {
  const C = useColors();
  const [code, setCode] = useLocalStorage("openmat-code", DEFAULT_CODE);
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [figureJson, setFigureJson] = useState(null);
  const [pythonPreview, setPythonPreview] = useState(() =>
    translateMatlabToPython(DEFAULT_CODE),
  );
  const outputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const py = await getPyodide();
        if (!mounted) return;
        setPyodide(py);
        setLoading(false);
      } catch (error) {
        if (!mounted) return;
        setLoadError(error.message || "Failed to load runtime");
        setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setPythonPreview(translateMatlabToPython(code));
  }, [code, setPythonPreview]);

  const runCode = useCallback(async () => {
    if (!pyodide || running) return;

    setRunning(true);
    setOutput("");
    setFigureJson(null);

    let stdout = "";
    pyodide.setStdout({
      batched: (msg) => {
        stdout += `${msg}\n`;
      },
    });
    pyodide.setStderr({
      batched: (msg) => {
        stdout += `${msg}\n`;
      },
    });

    try {
      const runner = buildRunner(code);
      await pyodide.runPythonAsync(runner);
      const trimmed = stdout.trim();
      const maybeFigure = outputToFigure(trimmed);
      if (maybeFigure) {
        setFigureJson(maybeFigure);
        setOutput("Plot rendered in the preview panel.");
      } else {
        setOutput(trimmed || "No output.");
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setRunning(false);
      requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [code, pyodide, running]);

  const exampleMap = useMemo(
    () => Object.fromEntries(EXAMPLES.map((example) => [example.id, example])),
    [],
  );

  const accentCards = useMemo(
    () => ({
      blue: {
        bg: C.surface2,
        border: C.border,
        badge: "rgba(23, 105, 209, 0.12)",
        text: C.blue,
        copy: C.text,
      },
      teal: {
        bg: "rgba(15, 141, 133, 0.08)",
        border: "rgba(15, 141, 133, 0.24)",
        badge: "rgba(15, 141, 133, 0.14)",
        text: C.teal,
        copy: C.text,
      },
      amber: {
        bg: "rgba(178, 106, 0, 0.08)",
        border: "rgba(178, 106, 0, 0.24)",
        badge: "rgba(178, 106, 0, 0.14)",
        text: C.amber,
        copy: C.text,
      },
    }),
    [C],
  );

  return (
    <div className="space-y-8">
      <section
        className="overflow-hidden rounded-[32px] border shadow-[0_20px_70px_rgba(5,18,38,0.18)]"
        style={{
          background:
            "linear-gradient(135deg, rgba(9,19,36,1) 0%, rgba(10,46,78,1) 52%, rgba(16,86,96,1) 100%)",
          borderColor: "rgba(148, 184, 255, 0.18)",
        }}
      >
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.4fr_0.9fr] md:px-10 md:py-10">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              OpenMAT MVP
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
                A MATLAB-style lab built directly into open-calc.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
                This first version runs entirely in the browser, translates a useful
                MATLAB-like subset into NumPy code, and keeps the whole experience
                GitHub Pages friendly.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-100">
              <span className="rounded-full bg-white/10 px-3 py-1.5">Matrix algebra</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Linear systems</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Colon ranges</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">In-browser plots</span>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <StatCard
              icon={Cpu}
              label="Runtime"
              value="Pyodide + NumPy + SciPy in the browser. No backend needed."
              accent={accentCards.teal}
            />
            <StatCard
              icon={Rows3}
              label="Syntax"
              value="Supports matrices, transpose, solve with backslash, linspace, eig, inv, det, zeros, ones, and rand."
              accent={accentCards.blue}
            />
            <StatCard
              icon={LineChart}
              label="Plotting"
              value="Plots render through the existing open-calc figure pipeline so they stay static-hosting safe."
              accent={accentCards.amber}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div
          className="overflow-hidden rounded-[28px] border"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <div
            className="flex flex-col gap-4 border-b px-5 py-4 md:flex-row md:items-center md:justify-between"
            style={{ borderColor: C.border, background: C.surface2 }}
          >
            <div>
              <h2 className="text-lg font-bold" style={{ color: C.text }}>
                OpenMAT Editor
              </h2>
              <p className="text-sm" style={{ color: C.muted }}>
                Write MATLAB-like commands, then run them in the browser.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCode(DEFAULT_CODE);
                  setOutput("");
                  setFigureJson(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                style={{
                  color: C.text,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="button"
                onClick={runCode}
                disabled={loading || running || !!loadError}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0f8d85, #1769d1)" }}
              >
                <Play className="h-4 w-4" />
                {running ? "Running..." : "Run Script"}
              </button>
            </div>
          </div>

          <div className="border-b px-5 py-4" style={{ borderColor: C.border }}>
            <div className="flex flex-wrap gap-3">
              {EXAMPLES.map((example) => {
                const Icon = example.icon;
                return (
                  <button
                    key={example.id}
                    type="button"
                    onClick={() => {
                      setCode(exampleMap[example.id].code);
                      setOutput("");
                      setFigureJson(null);
                    }}
                    className="flex min-w-[180px] flex-1 items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-transform hover:-translate-y-0.5"
                    style={{ borderColor: C.border, background: C.surface2 }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "rgba(23, 105, 209, 0.12)" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: C.blue }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: C.text }}>
                        {example.label}
                      </div>
                      <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                        {example.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-2 py-2 md:px-3">
            <Editor
              height="540px"
              defaultLanguage="matlab"
              language="matlab"
              theme={document.documentElement.classList.contains("dark") ? "vs-dark" : "vs"}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 22,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
              }}
              onMount={(editor) => {
                editor.addCommand(1024 | 3, () => {
                  runCode();
                });
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div
            className="rounded-[28px] border p-5"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <div className="mb-4 flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "rgba(15, 141, 133, 0.12)" }}
              >
                <LineChart className="h-4 w-4" style={{ color: C.teal }} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: C.text }}>
                  Preview
                </h3>
                <p className="text-xs" style={{ color: C.muted }}>
                  Text output and plots share the same execution pass.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border px-4 py-5 text-sm" style={{ borderColor: C.border, color: C.muted }}>
                Loading Python runtime. First launch may take several seconds.
              </div>
            ) : loadError ? (
              <div
                className="rounded-2xl border px-4 py-5 text-sm"
                style={{
                  borderColor: "rgba(192, 53, 53, 0.28)",
                  background: "rgba(192, 53, 53, 0.08)",
                  color: C.red,
                }}
              >
                {loadError}
              </div>
            ) : (
              <div className="space-y-4">
                {figureJson && (
                  <div
                    className="overflow-hidden rounded-2xl border p-3"
                    style={{ borderColor: C.border, background: C.surface2 }}
                  >
                    <FigureRenderer figureJson={figureJson} C={C} />
                  </div>
                )}
                <div
                  ref={outputRef}
                  className="min-h-[180px] rounded-2xl border p-4"
                  style={{ borderColor: C.border, background: C.surface2 }}
                >
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                    Console
                  </div>
                  <pre
                    className="whitespace-pre-wrap break-words text-sm leading-6"
                    style={{ color: output.startsWith("Error:") ? C.red : C.text }}
                  >
                    {output || "Run a script to see matrices, vectors, or plots here."}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div
            className="rounded-[28px] border p-5"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <h3 className="text-base font-bold" style={{ color: C.text }}>
              Supported MVP syntax
            </h3>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              {[
                "A = [1 2; 3 4]",
                "A' for transpose",
                "x = 0:0.1:2*pi",
                "x = A \\ b",
                "linspace(a, b, n)",
                "plot(x, y)",
                "eig(A), inv(A), det(A)",
                "zeros, ones, eye, rand",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border px-3 py-2 font-mono text-xs"
                  style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                >
                  {item}
                </div>
              ))}
            </div>
            <div
              className="mt-5 rounded-2xl border px-4 py-3 text-sm leading-6"
              style={{
                borderColor: "rgba(178, 106, 0, 0.22)",
                background: "rgba(178, 106, 0, 0.08)",
                color: C.text,
              }}
            >
              <div className="mb-1 flex items-center gap-2 font-semibold" style={{ color: C.amber }}>
                <AlertCircle className="h-4 w-4" />
                Current limitation
              </div>
              This is a MATLAB-like subset, not full MATLAB compatibility. Simulink,
              toolboxes, advanced indexing edge cases, and full plotting APIs are not
              in this first build yet.
            </div>
          </div>

          <div
            className="rounded-[28px] border p-5"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <h3 className="text-base font-bold" style={{ color: C.text }}>
              Python translation
            </h3>
            <p className="mt-1 text-sm" style={{ color: C.muted }}>
              Useful for debugging the MATLAB-like compiler layer.
            </p>
            <pre
              className="mt-4 max-h-[260px] overflow-auto rounded-2xl border p-4 text-xs leading-6"
              style={{ borderColor: C.border, background: C.surface2, color: C.text }}
            >
              {pythonPreview}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
