import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { create, all, format as mathFormat } from "mathjs";
import {
  Play,
  RefreshCw,
  Cpu,
  LineChart,
  Sigma,
  Rows3,
  AlertCircle,
  Waves,
  Download,
  Upload,
} from "lucide-react";
import FigureRenderer from "../viz/react/FigureRenderer.jsx";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";
import { useGrapher } from "../../context/GrapherContext.jsx";

const math = create(all);
math.config({ matrix: "Array", number: "number" });

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
    isDark: dark,
    pageBg: dark ? "#07111e" : "#f4f7fb",
    pageGlow: dark ? "rgba(33, 102, 255, 0.10)" : "rgba(33, 102, 255, 0.08)",
    surface: dark ? "#0f172a" : "#ffffff",
    surface2: dark ? "#132033" : "#edf4ff",
    surface3: dark ? "#0b1424" : "#f8fbff",
    border: dark ? "#2b3a55" : "#d5dfef",
    text: dark ? "#e6eefb" : "#15253a",
    muted: dark ? "#90a4c2" : "#607188",
    hint: dark ? "#61738e" : "#8a99ae",
    blue: dark ? "#63b8ff" : "#1769d1",
    amber: dark ? "#f0b44c" : "#b36d05",
    green: dark ? "#46d89f" : "#198754",
    red: dark ? "#ff8b8b" : "#c03535",
    purple: dark ? "#b89cff" : "#6f42c1",
    teal: dark ? "#31d0c4" : "#0f8d85",
    heroBg: dark
      ? "linear-gradient(135deg, #091324 0%, #0a314e 52%, #0f5f64 100%)"
      : "linear-gradient(135deg, #eef6ff 0%, #daeefe 48%, #ddfbf3 100%)",
    heroBorder: dark ? "rgba(148, 184, 255, 0.18)" : "rgba(23, 105, 209, 0.16)",
    heroText: dark ? "#ffffff" : "#10243e",
    heroMuted: dark ? "#d8e5f5" : "#3d5878",
    heroBadgeBg: dark ? "rgba(255,255,255,0.10)" : "rgba(23, 105, 209, 0.10)",
    heroBadgeBorder: dark ? "rgba(255,255,255,0.18)" : "rgba(23, 105, 209, 0.18)",
    heroBadgeText: dark ? "#d9f9ff" : "#1769d1",
    heroPillBg: dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.66)",
    heroPillText: dark ? "#e7f4ff" : "#244667",
  };
}

const DEFAULT_CODE = `A = [1 2 3; 4 5 6; 7 8 10];
b = [3; 3; 4];
x = A \\ b

[V, D] = eig(A);
[Q, R] = qr(A);

t = linspace(0, 2*pi, 240);
y = sin(2*t) .* exp(-0.12*t);
plot(t, y)
title('Damped Signal')
xlabel('t')
ylabel('y')
`;

const EXAMPLES = [
  {
    id: "linear-system",
    label: "Linear System",
    icon: Rows3,
    description: "Solve Ax = b, inspect inverse, and check residuals.",
    code: `A = [3 -1 2; 2 4 1; -1 2 5];
b = [10; 8; 7];
x = A \\ b
inv(A)
A*x - b
`,
  },
  {
    id: "signals",
    label: "Signals",
    icon: Waves,
    description: "Combine waves, use hold on, and compare envelopes.",
    code: `t = linspace(0, 8*pi, 500);
y1 = sin(t) + 0.35*sin(3*t);
y2 = exp(-0.06*t);
plot(t, y1 .* y2)
hold on
plot(t, y2)
title('Signal + Envelope')
xlabel('time')
ylabel('amplitude')
`,
  },
  {
    id: "eigen-qr",
    label: "Eigen / QR",
    icon: Sigma,
    description: "Use multi-output assignment with eig and qr.",
    code: `A = [4 1; 2 3];
[V, D] = eig(A)
[Q, R] = qr(A)
Q * R
`,
  },
  {
    id: "range-plot",
    label: "Range Syntax",
    icon: Cpu,
    description: "Use colon ranges, elementwise power, and indexing.",
    code: `x = -4:0.05:4;
y = x.^3 - 3*x;
plot(x, y)
y(1:5)
`,
  },
];

const HELP_TEXT = [
  "Supported MATLAB-like syntax:",
  "A = [1 2; 3 4]",
  "x = 0:0.1:2*pi",
  "A \\ b",
  "A' transpose",
  "x(1:5) indexing",
  ".*  ./  .^ elementwise ops",
  "[V, D] = eig(A)",
  "[Q, R] = qr(A)",
  "plot, scatter, bar, stem, area, hold on/off, clf",
  "title, xlabel, ylabel, legend, grid on/off, xlim, ylim",
  "zeros, ones, eye, rand, linspace, logspace, meshgrid",
  "polyfit, polyval, diff, cumsum, cumprod, dot, cross",
  "det, inv, pinv, fft, ifft, norm, trace, diag",
  "who, clear, clc, disp, help",
].join("\n");

const SERIES_COLORS = ["teal", "blue", "amber", "purple", "red", "green"];

function toPlain(value) {
  if (value && typeof value.valueOf === "function") {
    const plain = value.valueOf();
    if (plain !== value) return toPlain(plain);
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    if ("re" in value && "im" in value && Object.keys(value).length <= 3) {
      return value;
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
}

function isComplexLike(value) {
  return value && typeof value === "object" && "re" in value && "im" in value;
}

function realValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (isComplexLike(value)) return Number(value.re ?? 0);
  return Number(value);
}

function flattenNumbers(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain)) return [realValue(plain)];
  return plain.flat(Infinity).map(realValue);
}

function normalizeVector(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain)) return [realValue(plain)];
  if (Array.isArray(plain[0]) && plain[0].length === 1) {
    return plain.map((row) => realValue(row[0]));
  }
  return plain.flat().map(realValue);
}

function makeDiagonal(values) {
  const vector = normalizeVector(values);
  return vector.map((value, index) =>
    vector.map((_, column) => (column === index ? value : 0)),
  );
}

function makeRandomArray(shape) {
  if (shape.length === 0) return Math.random();
  const [head, ...tail] = shape;
  return Array.from({ length: Number(head) }, () => makeRandomArray(tail));
}

function isMatrix(value) {
  return Array.isArray(value) && Array.isArray(value[0]);
}

function toColumnSeries(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain)) return [[realValue(plain)]];
  if (!isMatrix(plain)) return [normalizeVector(plain)];
  const columnCount = Math.max(...plain.map((row) => row.length), 0);
  return Array.from({ length: columnCount }, (_, column) =>
    plain.map((row) => realValue(row[column] ?? 0)),
  );
}

function buildLinspace(start, stop, count = 100) {
  const n = Math.max(1, Math.round(Number(count)));
  const a = Number(start);
  const b = Number(stop);
  if (n === 1) return [a];
  const step = (b - a) / (n - 1);
  return Array.from({ length: n }, (_, index) => a + step * index);
}

function buildLogspace(a, b, count = 50) {
  return buildLinspace(Number(a), Number(b), count).map((value) => 10 ** value);
}

function meshgrid(xValues, yValues = xValues) {
  const x = normalizeVector(xValues);
  const y = normalizeVector(yValues);
  return {
    __multi: [
      y.map(() => [...x]),
      y.map((value) => Array.from({ length: x.length }, () => value)),
    ],
  };
}

function diffArray(value) {
  const vector = normalizeVector(value);
  return vector.slice(1).map((entry, index) => entry - vector[index]);
}

function cumulative(values, reducer, initial) {
  const vector = normalizeVector(values);
  const output = [];
  let acc = initial;
  vector.forEach((value, index) => {
    acc = index === 0 && initial == null ? value : reducer(acc, value);
    output.push(acc);
  });
  return output;
}

function dotProduct(a, b) {
  const left = normalizeVector(a);
  const right = normalizeVector(b);
  const length = Math.min(left.length, right.length);
  return Array.from({ length }, (_, index) => left[index] * right[index]).reduce(
    (sum, value) => sum + value,
    0,
  );
}

function crossProduct(a, b) {
  const [ax, ay, az] = normalizeVector(a);
  const [bx, by, bz] = normalizeVector(b);
  return [
    ay * bz - az * by,
    az * bx - ax * bz,
    ax * by - ay * bx,
  ];
}

function polyfit(xValues, yValues, degree) {
  const x = normalizeVector(xValues);
  const y = normalizeVector(yValues);
  const n = Math.max(0, Math.round(Number(degree)));
  const vandermonde = x.map((value) =>
    Array.from({ length: n + 1 }, (_, index) => value ** (n - index)),
  );
  const coeffs = toPlain(math.multiply(math.pinv(vandermonde), y));
  return normalizeVector(coeffs);
}

function polyval(coefficients, xValues) {
  const coeffs = normalizeVector(coefficients);
  return normalizeVector(xValues).map((value) =>
    coeffs.reduce((acc, coefficient) => acc * value + coefficient, 0),
  );
}

function isCollection(value) {
  return Array.isArray(toPlain(value));
}

function mapDeep(value, mapper) {
  const plain = toPlain(value);
  if (Array.isArray(plain)) {
    return plain.map((entry) => mapDeep(entry, mapper));
  }
  return mapper(plain);
}

function registerElementwiseUnary(parser, names) {
  names.forEach((name) => {
    const fn = math[name];
    if (typeof fn !== "function") return;
    parser.set(name, (value) => (isCollection(value) ? mapDeep(value, fn) : fn(value)));
  });
}

function normalizeMatrixSyntax(line) {
  return line.replace(/\[([^[\]]+)\]/g, (_, inner) => {
    const rows = inner.split(";").map((row) =>
      row
        .trim()
        .replace(/,/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .join(", "),
    );
    return `[${rows.join("; ")}]`;
  });
}

function replaceIndexing(line, variables) {
  if (variables.size === 0) return line;
  return line.replace(/\b([A-Za-z_]\w*)\s*\(([^()]+)\)/g, (match, name, inner) => {
    if (!variables.has(name)) return match;
    return `${name}[${inner}]`;
  });
}

function replaceBackslash(expr) {
  let depth = 0;
  for (let i = 0; i < expr.length; i += 1) {
    const char = expr[i];
    if (char === "[" || char === "(" || char === "{") depth += 1;
    if (char === "]" || char === ")" || char === "}") depth -= 1;
    if (char === "\\" && depth === 0) {
      const left = expr.slice(0, i).trim();
      const right = expr.slice(i + 1).trim();
      return `mldivide(${left}, ${right})`;
    }
  }
  return expr;
}

function preprocessLine(line, variables) {
  let output = line.replace(/%.*$/, "").trim();
  if (!output) return "";
  output = output.replace(/^hold\s+on$/i, "hold('on')");
  output = output.replace(/^hold\s+off$/i, "hold('off')");
  output = output.replace(/^grid\s+on$/i, "grid('on')");
  output = output.replace(/^grid\s+off$/i, "grid('off')");
  output = normalizeMatrixSyntax(output);
  output = replaceIndexing(output, variables);
  output = replaceBackslash(output);
  return output;
}

function formatValue(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (value && value.__multi) {
    return value.__multi.map((item) => formatValue(item)).join("\n\n");
  }
  const plain = toPlain(value);
  try {
    return mathFormat(plain, { precision: 6, notation: "auto" });
  } catch {
    return JSON.stringify(plain, null, 2);
  }
}

function buildFigureFromPlotState(plotState) {
  if (plotState.series.length === 0) return null;

  const xs = plotState.series.flatMap((series) =>
    series.kind === "bar"
      ? series.values.map((_, index) => index)
      : series.x,
  );
  const ys = plotState.series.flatMap((series) =>
    series.kind === "bar" ? series.values : series.y,
  );

  let xmin = Math.min(...xs);
  let xmax = Math.max(...xs);
  let ymin = Math.min(...ys);
  let ymax = Math.max(...ys);

  if (!Number.isFinite(xmin)) xmin = -1;
  if (!Number.isFinite(xmax)) xmax = 1;
  if (!Number.isFinite(ymin)) ymin = -1;
  if (!Number.isFinite(ymax)) ymax = 1;
  if (xmin === xmax) {
    xmin -= 1;
    xmax += 1;
  }
  if (ymin === ymax) {
    ymin -= 1;
    ymax += 1;
  }

  const padX = (xmax - xmin) * 0.08;
  const padY = (ymax - ymin) * 0.15;
  const xBounds =
    plotState.xlim?.length === 2 ? plotState.xlim : [xmin - padX, xmax + padX];
  const yBounds =
    plotState.ylim?.length === 2 ? plotState.ylim : [ymin - padY, ymax + padY];
  const elements = [];

  if (plotState.grid) {
    elements.push({
      type: "grid",
      step: Math.max((xBounds[1] - xBounds[0]) / 8, 1e-6),
      color: "border",
    });
  }

  elements.push({ type: "axes", labels: true, ticks: true });

  plotState.series.forEach((series, index) => {
    const color = SERIES_COLORS[index % SERIES_COLORS.length];
    if (series.kind === "plot") {
      elements.push({
        type: "curve",
        xs: series.x,
        ys: series.y,
        color,
        width: 2.5,
        label: series.label || null,
      });
    } else if (series.kind === "area") {
      elements.push({
        type: "curve",
        xs: series.x,
        ys: series.y,
        color,
        width: 2.5,
        fill: true,
        fill_alpha: 0.18,
        label: series.label || null,
      });
    } else if (series.kind === "scatter") {
      elements.push({
        type: "scatter",
        xs: series.x,
        ys: series.y,
        color,
        radius: 4,
        labels: null,
      });
    } else if (series.kind === "stem") {
      series.x.forEach((x, stemIndex) => {
        elements.push({
          type: "line",
          start: [x, 0],
          end: [x, series.y[stemIndex]],
          color,
          width: 1.5,
        });
      });
      elements.push({
        type: "scatter",
        xs: series.x,
        ys: series.y,
        color,
        radius: 4,
        labels: null,
      });
    } else if (series.kind === "bar") {
      elements.push({
        type: "bars",
        labels: series.labels,
        values: series.values,
        color,
        alpha: 0.8,
      });
    }
  });

  if (plotState.xlabel) {
    elements.push({
      type: "text",
      pos: [(xmin + xmax) / 2, ymin - padY * 0.55],
      content: plotState.xlabel,
      color: "muted",
      size: 12,
    });
  }

  if (plotState.ylabel) {
    elements.push({
      type: "text",
      pos: [xmin - padX * 0.35, (ymin + ymax) / 2],
      content: plotState.ylabel,
      color: "muted",
      size: 12,
    });
  }

  return JSON.stringify({
    type: "opencalc_figure",
    title: plotState.title || "OpenMAT Plot",
    xmin: xBounds[0],
    xmax: xBounds[1],
    ymin: yBounds[0],
    ymax: yBounds[1],
    height: 340,
    elements,
  });
}

function createExecutionEngine() {
  const parser = math.parser();
  const variables = new Set();
  const logs = [];
  const plotState = {
    series: [],
    hold: false,
    title: "",
    xlabel: "",
    ylabel: "",
    legend: [],
    grid: true,
    xlim: null,
    ylim: null,
  };

  const clearPlots = () => {
    plotState.series = [];
    plotState.hold = false;
    plotState.title = "";
    plotState.xlabel = "";
    plotState.ylabel = "";
    plotState.legend = [];
    plotState.xlim = null;
    plotState.ylim = null;
  };

  const registerPlot = (kind, first, second) => {
    if (!plotState.hold) {
      clearPlots();
    }
    if (kind === "bar") {
      const values = normalizeVector(first);
      const labels =
        second && Array.isArray(second)
          ? second.map(String)
          : values.map((_, index) => String(index + 1));
      plotState.series.push({ kind, values, labels });
      return values;
    }

    const ySeries = second == null ? toColumnSeries(first) : toColumnSeries(second);
    const xBase =
      second == null
        ? ySeries[0].map((_, index) => index)
        : normalizeVector(first);
    const startIndex = plotState.series.length;

    ySeries.forEach((y, seriesIndex) => {
      const x = xBase.slice(0, y.length);
      plotState.series.push({
        kind,
        x,
        y,
        label: plotState.legend[startIndex + seriesIndex] || null,
      });
    });

    return ySeries.length === 1 ? ySeries[0] : ySeries;
  };

  registerElementwiseUnary(parser, [
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "sinh",
    "cosh",
    "tanh",
    "exp",
    "log",
    "log10",
    "sqrt",
    "abs",
    "sign",
    "floor",
    "ceil",
    "round",
    "conj",
    "re",
    "im",
  ]);
  parser.set("real", (value) =>
    isCollection(value) ? mapDeep(value, math.re) : math.re(value),
  );
  parser.set("imag", (value) =>
    isCollection(value) ? mapDeep(value, math.im) : math.im(value),
  );

  parser.set("mldivide", (A, b) => toPlain(math.lusolve(A, b)));
  parser.set("linspace", (a, b, n = 100) => buildLinspace(a, b, n));
  parser.set("logspace", (a, b, n = 50) => buildLogspace(a, b, n));
  parser.set("rand", (...shape) => {
    if (shape.length === 0) return Math.random();
    return makeRandomArray(shape.map(Number));
  });
  parser.set("eye", (n) => toPlain(math.identity(Number(n))));
  parser.set("meshgrid", (x, y) => meshgrid(x, y));
  parser.set("diff", (value) => diffArray(value));
  parser.set("cumsum", (value) =>
    cumulative(value, (acc, entry) => acc + entry, null),
  );
  parser.set("cumprod", (value) =>
    cumulative(value, (acc, entry) => acc * entry, null),
  );
  parser.set("dot", (a, b) => dotProduct(a, b));
  parser.set("cross", (a, b) => crossProduct(a, b));
  parser.set("polyfit", (x, y, degree) => polyfit(x, y, degree));
  parser.set("polyval", (coefficients, x) => polyval(coefficients, x));
  parser.set("size", (value, dim) => {
    const size = toPlain(math.size(value));
    return dim == null ? size : size[Number(dim) - 1];
  });
  parser.set("length", (value) => {
    const size = toPlain(math.size(value));
    return Math.max(...size, 0);
  });
  parser.set("numel", (value) => flattenNumbers(value).length);
  parser.set("who", () => Array.from(variables));
  parser.set("disp", (value) => {
    logs.push(formatValue(value));
    return value;
  });
  parser.set("help", () => {
    logs.push(HELP_TEXT);
    return HELP_TEXT;
  });
  parser.set("clc", () => {
    logs.length = 0;
    return null;
  });
  parser.set("clf", () => {
    clearPlots();
    return null;
  });
  parser.set("hold", (mode = "on") => {
    plotState.hold = String(mode).toLowerCase() === "on";
    return plotState.hold;
  });
  parser.set("grid", (mode = "on") => {
    plotState.grid = String(mode).toLowerCase() === "on";
    return plotState.grid;
  });
  parser.set("title", (text) => {
    plotState.title = String(text);
    return text;
  });
  parser.set("xlabel", (text) => {
    plotState.xlabel = String(text);
    return text;
  });
  parser.set("ylabel", (text) => {
    plotState.ylabel = String(text);
    return text;
  });
  parser.set("xlim", (range) => {
    plotState.xlim = normalizeVector(range).slice(0, 2);
    return plotState.xlim;
  });
  parser.set("ylim", (range) => {
    plotState.ylim = normalizeVector(range).slice(0, 2);
    return plotState.ylim;
  });
  parser.set("legend", (...labels) => {
    plotState.legend = labels.map(String);
    plotState.series.forEach((series, index) => {
      series.label = plotState.legend[index] || series.label;
    });
    return labels;
  });
  parser.set("plot", (...args) => registerPlot("plot", args[0], args[1]));
  parser.set("scatter", (...args) => registerPlot("scatter", args[0], args[1]));
  parser.set("stem", (...args) => registerPlot("stem", args[0], args[1]));
  parser.set("area", (...args) => registerPlot("area", args[0], args[1]));
  parser.set("bar", (...args) =>
    args.length === 1
      ? registerPlot("bar", args[0], null)
      : registerPlot("bar", args[1], normalizeVector(args[0]).map(String)),
  );
  parser.set("eig", (A) => {
    const result = math.eigs(A);
    const values = normalizeVector(result.values);
    const vectors = result.eigenvectors.map((entry) => toPlain(entry.vector));
    return {
      __multi: [math.transpose(vectors), makeDiagonal(values)],
      values,
      eigenvectors: vectors,
    };
  });
  parser.set("qr", (A) => {
    const { Q, R } = math.qr(A);
    return { __multi: [toPlain(Q), toPlain(R)], Q: toPlain(Q), R: toPlain(R) };
  });

  return {
    parser,
    logs,
    plotState,
    variables,
    clearVariables(names) {
      if (names.length === 0) {
        Array.from(variables).forEach((name) => parser.remove(name));
        variables.clear();
        return;
      }
      names.forEach((name) => {
        parser.remove(name);
        variables.delete(name);
      });
    },
  };
}

function executeScript(source) {
  const engine = createExecutionEngine();
  const { parser, logs, plotState, variables } = engine;
  let lastVisibleResult = null;

  const lines = source.split(/\r?\n/);

  for (const rawLine of lines) {
    const trimmedRaw = rawLine.replace(/%.*$/, "").trim();
    if (!trimmedRaw) continue;

    const hasSemicolon = /;\s*$/.test(trimmedRaw);
    const withoutSemicolon = trimmedRaw.replace(/;\s*$/, "");

    if (/^clear(\s+.+)?$/i.test(withoutSemicolon)) {
      const args = withoutSemicolon
        .replace(/^clear/i, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      engine.clearVariables(args);
      continue;
    }

    const line = preprocessLine(withoutSemicolon, variables);
    if (!line) continue;

    const multiAssign = line.match(/^\[([^\]]+)\]\s*=\s*(.+)$/);
    if (multiAssign) {
      const names = multiAssign[1]
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      const result = toPlain(parser.evaluate(multiAssign[2]));
      const values = result?.__multi || [];
      names.forEach((name, index) => {
        parser.set(name, values[index]);
        variables.add(name);
      });
      if (!hasSemicolon) {
        lastVisibleResult = values.length === 1 ? values[0] : values;
      }
      continue;
    }

    const assign = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (assign) {
      const [, name, expr] = assign;
      const result = toPlain(parser.evaluate(expr));
      parser.set(name, result);
      parser.set("ans", result);
      variables.add(name);
      if (!hasSemicolon) {
        lastVisibleResult = result;
      }
      continue;
    }

    const result = toPlain(parser.evaluate(line));
    parser.set("ans", result);
    if (!hasSemicolon && result != null && result !== "") {
      lastVisibleResult = result;
    }
  }

  const figureJson = buildFigureFromPlotState(plotState);
  const outputBlocks = [];
  if (logs.length) outputBlocks.push(logs.filter(Boolean).join("\n"));
  if (lastVisibleResult != null && lastVisibleResult !== "") {
    outputBlocks.push(formatValue(lastVisibleResult));
  }

  return {
    output: outputBlocks.filter(Boolean).join("\n\n") || (figureJson ? "Plot rendered." : "No output."),
    figureJson,
  };
}

export default function OpenMatStudio() {
  const C = useColors();
  const { openGrapher } = useGrapher();
  const [code, setCode] = useLocalStorage("openmat-code", DEFAULT_CODE);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [figureJson, setFigureJson] = useState(null);
  const [normalizedPreview, setNormalizedPreview] = useState("");
  const [workspaceTab, setWorkspaceTab] = useLocalStorage("openmat-workspace-tab", "plot");
  const [browserTab, setBrowserTab] = useLocalStorage("openmat-browser-tab", "examples");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const outputRef = useRef(null);
  const importRef = useRef(null);

  const exampleMap = useMemo(
    () => Object.fromEntries(EXAMPLES.map((example) => [example.id, example])),
    [],
  );

  const workspaceTabs = [
    { id: "plot", label: "Figure", icon: LineChart },
    { id: "console", label: "Console", icon: Rows3 },
    { id: "reference", label: "Reference", icon: Sigma },
    { id: "normalized", label: "Normalized", icon: Cpu },
  ];
  const browserTabs = [
    { id: "examples", label: "Examples" },
    { id: "functions", label: "Functions" },
    { id: "notes", label: "Notes" },
  ];
  const referenceItems = [
    "Matrices: [1 2; 3 4], A', A \\\\ b, inv(A), det(A)",
    "Ranges: x = 0:0.1:2*pi, linspace, logspace, meshgrid",
    "Plots: plot, scatter, bar, stem, area, hold on/off, clf",
    "Axes: title, xlabel, ylabel, legend, grid, xlim, ylim",
    "Signals: sin, cos, tan, exp, log, fft, ifft, abs, real, imag",
    "Polynomials: polyfit, polyval, diff, cumsum, cumprod",
  ];

  const runCode = useCallback(() => {
    setRunning(true);
    try {
      const normalized = code
        .split(/\r?\n/)
        .map((line) => preprocessLine(line.replace(/;\s*$/, ""), new Set()))
        .filter(Boolean)
        .join("\n");
      setNormalizedPreview(normalized);
      const result = executeScript(code);
      setOutput(result.output);
      setFigureJson(result.figureJson);
      setWorkspaceTab(result.figureJson ? "plot" : "console");
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setFigureJson(null);
      setWorkspaceTab("console");
    } finally {
      setRunning(false);
      requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [code, setWorkspaceTab]);

  const resetWorkspace = useCallback(() => {
    setCode(DEFAULT_CODE);
    setOutput("");
    setFigureJson(null);
    setNormalizedPreview("");
  }, [setCode]);

  const loadExample = useCallback(
    (exampleId) => {
      const example = exampleMap[exampleId];
      if (!example) return;
      setCode(example.code);
      setOutput("");
      setFigureJson(null);
      setNormalizedPreview("");
    },
    [exampleMap, setCode],
  );

  const exportWorkspace = useCallback(() => {
    const payload = {
      code,
      browserTab,
      workspaceTab,
      exportedAt: new Date().toISOString(),
      app: "OpenMAT",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "openmat-workspace.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [browserTab, code, workspaceTab]);

  const importWorkspace = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const parsed = JSON.parse(String(loadEvent.target?.result || "{}"));
        if (typeof parsed.code === "string") setCode(parsed.code);
        if (typeof parsed.browserTab === "string") setBrowserTab(parsed.browserTab);
        if (typeof parsed.workspaceTab === "string") setWorkspaceTab(parsed.workspaceTab);
        setOutput("");
        setFigureJson(null);
        setNormalizedPreview("");
      } catch (error) {
        setOutput(`Error: Could not import workspace. ${error.message}`);
        setWorkspaceTab("console");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }, [setBrowserTab, setCode, setWorkspaceTab]);

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border"
      style={{
        background: C.surface,
        borderColor: C.border,
        color: C.text,
        boxShadow: `0 24px 70px ${C.pageGlow}`,
      }}
    >
      <div
        className="flex items-center justify-between gap-4 border-b px-4 py-2"
        style={{ background: C.surface3, borderColor: C.border }}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div
              className="rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ background: C.surface2, color: C.blue }}
            >
              OpenMAT
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">untitled.m</div>
              <div className="text-[11px]" style={{ color: C.muted }}>
                Matrix computing workspace • local engine • mobile-aware layout
              </div>
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
          >
            {sidebarOpen ? "Hide Browser" : "Show Browser"}
          </button>
          <button
            type="button"
            onClick={() => openGrapher({ mode: "3d", title: "OpenMAT Surface Lab" })}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
          >
            3D Grapher
          </button>
          <button
            type="button"
            onClick={runCode}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0f8d85, #1769d1)" }}
          >
            <Play className="h-3.5 w-3.5" />
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-2 border-b px-3 py-1.5 text-xs"
        style={{ borderColor: C.border, background: C.surface }}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen((value) => !value)}
          className="rounded-md px-2.5 py-1 font-medium"
          style={{ color: C.muted }}
        >
          {sidebarOpen ? "Hide Browser" : "Show Browser"}
        </button>
        <button
          type="button"
          onClick={exportWorkspace}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium"
          style={{ color: C.muted }}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
        <button
          type="button"
          onClick={() => importRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium"
          style={{ color: C.muted }}
        >
          <Upload className="h-3.5 w-3.5" />
          Import
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={importWorkspace}
        />
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2"
        style={{ borderColor: C.border, background: C.surface2 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetWorkspace}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.text,
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={runCode}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 md:hidden"
            style={{ background: "linear-gradient(135deg, #0f8d85, #1769d1)" }}
          >
            <Play className="h-3.5 w-3.5" />
            {running ? "Running..." : "Run"}
          </button>
          <button
            type="button"
            onClick={() => openGrapher({ mode: "3d", title: "OpenMAT Surface Lab" })}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold md:hidden"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
          >
            3D Grapher
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: C.muted }}>
          <span className="rounded-full px-2 py-1" style={{ background: C.surface3 }}>
            Matrix algebra
          </span>
          <span className="rounded-full px-2 py-1" style={{ background: C.surface3 }}>
            Plot stack
          </span>
          <span className="rounded-full px-2 py-1" style={{ background: C.surface3 }}>
            Ready for tablet refinement
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {sidebarOpen && (
          <div
            className="flex w-full shrink-0 flex-col border-b lg:w-[280px] lg:border-b-0 lg:border-r"
            style={{ borderColor: C.border, background: C.surface3 }}
          >
            <div className="flex items-center gap-1 border-b px-3 py-2" style={{ borderColor: C.border }}>
              {browserTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBrowserTab(tab.id)}
                  className="rounded-md px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: browserTab === tab.id ? C.surface : "transparent",
                    color: browserTab === tab.id ? C.text : C.muted,
                    border:
                      browserTab === tab.id
                        ? `1px solid ${C.border}`
                        : "1px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-3">
              {browserTab === "examples" && (
                <div className="space-y-3">
                  {EXAMPLES.map((example) => {
                    const Icon = example.icon;
                    return (
                      <button
                        key={example.id}
                        type="button"
                        onClick={() => loadExample(example.id)}
                        className="flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left"
                        style={{ borderColor: C.border, background: C.surface }}
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: "rgba(23, 105, 209, 0.12)" }}
                        >
                          <Icon className="h-4 w-4" style={{ color: C.blue }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{example.label}</div>
                          <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                            {example.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {browserTab === "functions" && (
                <div className="grid gap-2">
                  {referenceItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border px-3 py-2 text-xs font-mono"
                      style={{ borderColor: C.border, background: C.surface }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {browserTab === "notes" && (
                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 font-semibold">Roadmap</div>
                  <div style={{ color: C.muted }}>
                    The next MATLAB-like upgrades should focus on workflow: multi-file tabs,
                    subplot layouts, surface commands backed by the app&apos;s 3D grapher, and
                    more numeric helpers such as interpolation and integration tools.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b px-3 py-2" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-t-lg border border-b-0 px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: C.surface,
                  borderColor: C.border,
                  color: C.text,
                }}
              >
                untitled.m
              </button>
            </div>
            <div className="text-[11px]" style={{ color: C.muted }}>
              Cmd/Ctrl + Enter to run
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 p-2 md:p-3">
            <Editor
              height="100%"
              defaultLanguage="matlab"
              language="matlab"
              theme={C.isDark ? "vs-dark" : "vs"}
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

        <div
          className="flex w-full min-w-0 shrink-0 flex-col border-t lg:w-[360px] lg:border-l lg:border-t-0 xl:w-[390px]"
          style={{ borderColor: C.border, background: C.surface2 }}
        >
          <div
            className="flex items-center gap-1 border-b px-3 py-2"
            style={{ borderColor: C.border }}
          >
            {workspaceTabs.map((tab) => {
              const Icon = tab.icon;
              const active = workspaceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWorkspaceTab(tab.id)}
                  className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold"
                  style={{
                    background: active ? C.surface : "transparent",
                    color: active ? C.text : C.muted,
                    border: active ? `1px solid ${C.border}` : "1px solid transparent",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3">
            {workspaceTab === "plot" && (
              <div className="space-y-3">
                <div
                  className="rounded-2xl border p-3"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                    Figure
                  </div>
                  {figureJson ? (
                    <FigureRenderer figureJson={figureJson} C={C} />
                  ) : (
                    <div
                      className="rounded-xl border px-3 py-10 text-center text-sm"
                      style={{ borderColor: C.border, color: C.muted }}
                    >
                      Run a script with `plot`, `stem`, `area`, `scatter`, or `bar` to render a figure here.
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openGrapher({ mode: "3d", title: "OpenMAT Surface Lab" })}
                  className="w-full rounded-xl border px-3 py-2 text-sm font-semibold"
                  style={{ borderColor: C.border, background: C.surface, color: C.text }}
                >
                  Open 3D Grapher for surface-style work
                </button>
              </div>
            )}

            {workspaceTab === "console" && (
              <div
                ref={outputRef}
                className="min-h-[220px] rounded-2xl border p-4"
                style={{ borderColor: C.border, background: C.surface }}
              >
                <div
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: C.hint }}
                >
                  Console
                </div>
                <pre
                  className="whitespace-pre-wrap break-words text-sm leading-6"
                  style={{ color: output.startsWith("Error:") ? C.red : C.text }}
                >
                  {output || "Run a script to see matrix output, variables, or plots here."}
                </pre>
              </div>
            )}

            {workspaceTab === "reference" && (
              <div className="space-y-3">
                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-3 font-semibold">Supported features</div>
                  <div className="grid gap-2">
                    {[
                      "A = [1 2; 3 4]",
                      "x = A \\\\ b",
                      "A' transpose",
                      "x = 0:0.1:2*pi",
                      "x(1:5) indexing",
                      ".*  ./  .^",
                      "[V, D] = eig(A)",
                      "[Q, R] = qr(A)",
                      "plot / scatter / bar / stem / area",
                      "hold on / clf / legend / xlim / ylim",
                      "zeros / ones / eye / rand / meshgrid",
                      "polyfit / polyval / diff / cumsum",
                      "fft / ifft / norm / trace / diag",
                      "dot / cross / logspace",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border px-3 py-2 font-mono text-xs"
                        style={{ borderColor: C.border, background: C.surface2 }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl border px-4 py-3 text-sm leading-6"
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
                  This is already strong for matrix algebra, plotting, and classroom-style labs,
                  but it is still not full MATLAB yet. The next leap is desktop workflow polish:
                  multi-document tabs, richer subplot layouts, and deeper integration with the
                  app&apos;s 3D and symbolic tooling.
                </div>
              </div>
            )}

            {workspaceTab === "normalized" && (
              <pre
                className="max-h-full overflow-auto rounded-2xl border p-4 text-xs leading-6"
                style={{ borderColor: C.border, background: C.surface, color: C.text }}
              >
                {normalizedPreview || "Run a script to inspect the normalized form."}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
