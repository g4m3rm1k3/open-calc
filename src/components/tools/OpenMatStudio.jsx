import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { create, all, format as mathFormat } from "mathjs";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  Plus,
  Pencil,
  RefreshCw,
  Cpu,
  LineChart,
  Sigma,
  Rows3,
  AlertCircle,
  Waves,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Scan,
  Grid3X3,
  Maximize2,
  X,
} from "lucide-react";
import FigureRenderer from "../viz/react/FigureRenderer.jsx";
import GlobalGrapher3D from "../ui/GlobalGrapher3D.jsx";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";
import { useGrapher } from "../../context/GrapherContext.jsx";
import { setupOpenCalcMonaco } from "../../utils/monacoThemes.js";

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
  {
    id: "subplots",
    label: "Subplots",
    icon: LineChart,
    description: "Multiple plots in a grid with subplot(rows, cols, idx).",
    code: `t = linspace(0, 2*pi, 200);

subplot(2, 2, 1)
plot(t, sin(t))
title('sin(t)')
xlabel('t')

subplot(2, 2, 2)
plot(t, cos(t))
title('cos(t)')
xlabel('t')

subplot(2, 2, 3)
plot(t, sin(t) .* exp(-0.3*t))
title('Damped sine')
xlabel('t')

subplot(2, 2, 4)
x = randn(1, 200);
hist(x, 15)
title('Normal dist')
`,
  },
  {
    id: "control-flow",
    label: "Control Flow",
    icon: Grid3X3,
    description: "if/else, for loops, while loops, and break.",
    code: `% Fibonacci with a for loop
n = 12;
fib = zeros(1, n);
fib(1) = 1;
fib(2) = 1;
for i = 3:n
  fib(i) = fib(i-1) + fib(i-2);
end
disp(fib)
bar(fib)
title('Fibonacci Numbers')

% while with break
x = 1;
while x < 500
  x = x * 2;
  if x > 200
    break
  end
end
disp(x)
`,
  },
  {
    id: "functions",
    label: "Functions",
    icon: Sigma,
    description: "Define and call your own functions.",
    code: `function result = factorial(n)
  if n <= 1
    result = 1;
  else
    result = n * factorial(n - 1);
  end
end

function [mn, mx, rng] = stats(v)
  mn = mean(v);
  mx = max(v);
  rng = mx - min(v);
end

disp(factorial(7))

data = [3 8 1 6 2 9 4 7 5];
[m, x, r] = stats(data)
disp(mean(data))
disp(std(data))
hist(data, 5)
title('Data Distribution')
`,
  },
  {
    id: "anonymous-3d",
    label: "Anonymous + 3D",
    icon: Waves,
    description: "Use anonymous functions, roots, integration, and launch a surface into the 3D grapher.",
    code: `f = @(x) x.^3 - 4*x + 1;
x = linspace(-3, 3, 200);
y = f(x);
plot(x, y)
grid on
title('Anonymous function')

coeffs = [1 0 -4 1];
roots(coeffs)
trapz(x, y)

[X, Y] = meshgrid(-4:0.4:4, -4:0.4:4);
Z = sin(sqrt(X.^2 + Y.^2));
surf(X, Y, Z)
`,
  },
  {
    id: "interactive-signal",
    label: "Interactive Signal",
    icon: Waves,
    description: "Drive a plot with sliders and rerun it live from the controls pane.",
    code: `amp = slider('amp', 0.2, 2.5, 0.1, 1.2);
freq = slider('freq', 0.5, 6, 0.1, 2.0);
damp = slider('damp', 0, 0.3, 0.01, 0.08);

t = linspace(0, 10, 600);
y = amp * sin(freq * t) .* exp(-damp * t);
plot(t, y)
grid on
title('Interactive Signal')
xlabel('time')
ylabel('amplitude')
`,
  },
  {
    id: "animated-wave",
    label: "Animated Wave",
    icon: Waves,
    description: "Use an animate control to scrub or play a time-like parameter.",
    code: `phase = animate('phase', 0, 2*pi, 0.08, 0, 1.2, 1);
x = linspace(0, 8*pi, 500);
y = sin(x - phase) .* exp(-0.03 * x);
plot(x, y)
grid on
title('Animated Wave')
xlabel('position')
ylabel('amplitude')
`,
  },
  {
    id: "pendulum-lab",
    label: "Pendulum Lab",
    icon: Sigma,
    description: "Animate a small-angle pendulum with tunable length, gravity, and release angle.",
    code: `t = animate('t', 0, 18, 0.06, 0, 1.0, 1);
L = slider('L', 0.6, 2.0, 0.1, 1.2);
g = slider('g', 1, 20, 0.5, 9.8);
theta0 = slider('theta0', 0.1, 1.1, 0.05, 0.75);

omega = sqrt(g / L);
theta = theta0 * cos(omega * t);
x = L * sin(theta);
y = -L * cos(theta);

trailT = linspace(max(0, t - 5), t, 120);
trailTheta = theta0 * cos(omega * trailT);
trailX = L * sin(trailTheta);
trailY = -L * cos(trailTheta);

plot([0 x], [0 y])
hold on
plot(trailX, trailY)
scatter(x, y)
grid on
axis equal
xlim(-L - 0.4, L + 0.4)
ylim(-L - 0.4, 0.4)
title('Pendulum Lab')
xlabel('horizontal position')
ylabel('vertical position')
`,
  },
  {
    id: "spring-mass-lab",
    label: "Spring-Mass",
    icon: Cpu,
    description: "Explore damping and stiffness with a one-dimensional spring-mass animation.",
    code: `t = animate('t', 0, 24, 0.05, 0, 1.0, 1);
A = slider('A', 0.3, 2.0, 0.05, 1.1);
k = slider('k', 0.5, 8.0, 0.1, 3.2);
m = slider('m', 0.5, 5.0, 0.1, 1.4);
c = slider('c', 0.0, 2.5, 0.05, 0.35);

alpha = c / (2 * m);
omega = sqrt(max(k / m - alpha^2, 0.001));
x = A * exp(-alpha * t) * cos(omega * t);

tt = linspace(max(0, t - 10), t, 220);
xx = A * exp(-alpha * tt) .* cos(omega * tt);

plot(tt, xx)
hold on
scatter(t, x)
grid on
xlim(max(0, t - 10), max(10, t))
ylim(-A * 1.3, A * 1.3)
title('Spring-Mass Response')
xlabel('time')
ylabel('displacement')
`,
  },
  {
    id: "projectile-lab",
    label: "Projectile Lab",
    icon: LineChart,
    description: "Animate a projectile arc and tune launch speed, angle, and gravity.",
    code: `t = animate('t', 0, 14, 0.05, 0, 1.0, 1);
v0 = slider('v0', 6, 40, 1, 22);
angle = slider('angle', 0.2, 1.3, 0.02, 0.85);
g = slider('g', 1, 20, 0.5, 9.8);

vx = v0 * cos(angle);
vy = v0 * sin(angle);
flight = max(2 * vy / g, 0.1);
tc = min(t, flight);
tt = linspace(0, tc, 180);
x = vx * tt;
y = vy * tt - 0.5 * g * tt.^2;

px = vx * tc;
py = vy * tc - 0.5 * g * tc.^2;
range = vx * flight;
peak = (vy^2) / (2 * g);

plot(x, y)
hold on
scatter(px, py)
grid on
xlim(0, range * 1.1 + 1)
ylim(0, peak * 1.35 + 1)
title('Projectile Lab')
xlabel('downrange')
ylabel('height')
`,
  },
];

const HELP_TEXT = [
  "Supported MATLAB-like syntax:",
  "",
  "── Language Model ──",
  "OpenMAT is a MATLAB-like dialect built on top of a local math engine.",
  "It is not raw JavaScript, Python, or full MATLAB compatibility.",
  "Docs source of truth: docs/OpenMAT.md",
  "",
  "── Matrices ──",
  "A = [1 2; 3 4]   A'   A \\ b   inv(A)   det(A)   trace(A)",
  "[V,D] = eig(A)   [Q,R] = qr(A)   [U,S,V] = svd(A)",
  "",
  "── Arrays ──",
  "x = 0:0.1:2*pi   linspace(a,b,n)   logspace(a,b,n)",
  "zeros(m,n)   ones(m,n)   eye(n)   rand(m,n)   randn(m,n)",
  "reshape(A,m,n)   repmat(A,m,n)   size   length   numel",
  "",
  "── Statistics ──",
  "mean  median  std  var  min  max  sum  prod",
  "sort  unique  find  any  all  hist(x,bins)",
  "interp1(x,y,xi)",
  "",
  "── Control Flow ──",
  "if cond ... elseif cond ... else ... end",
  "for i = 1:n ... end",
  "while cond ... end",
  "break   continue",
  "",
  "── Functions ──",
  "function [out1,out2] = myFunc(a, b)",
  "  out1 = a + b;",
  "  out2 = a * b;",
  "end",
  "f = @(x) x.^2 - 1",
  "",
  "── Plotting ──",
  "plot, scatter, bar, stem, area, hist, hold on/off, clf",
  "title, xlabel, ylabel, legend, grid on/off, xlim, ylim",
  "axis tight/equal/auto/[xmin xmax ymin ymax]",
  "surf(X,Y,Z)   mesh(X,Y,Z) -> opens the 3D Grapher",
  "slider('gain', min, max, step, default) -> interactive controls",
  "animate('t', min, max, step, default, speed, loop) -> play-ready control",
  "",
  "── Output ──",
  "disp(x)   sprintf('%g', x)   fprintf('val = %f\\n', x)",
  "num2str(x)   who   clear   clc",
  "",
  "── Extensions ──",
  "window.OpenMAT.registerExtension(name, { functions, onRun })",
].join("\n");

const SERIES_COLORS = ["teal", "blue", "amber", "purple", "red", "green"];
const OPENMAT_EXTENSION_REGISTRY = new Map();

function makeDocumentId() {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createOpenMatDocument(name = "untitled.m", code = "") {
  return {
    id: makeDocumentId(),
    name,
    code,
  };
}

function getNextUntitledName(documents) {
  const untitledCount = documents.filter((doc) => /^untitled(?: \d+)?\.m$/i.test(doc.name)).length;
  return untitledCount === 0 ? "untitled.m" : `untitled ${untitledCount + 1}.m`;
}

function normalizeImportedDocuments(value) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const docs = value
    .map((doc, index) => ({
      id: typeof doc?.id === "string" ? doc.id : makeDocumentId(),
      name: typeof doc?.name === "string" && doc.name.trim() ? doc.name.trim() : `script ${index + 1}.m`,
      code: typeof doc?.code === "string" ? doc.code : "",
    }));
  return docs.length ? docs : null;
}

function getInitialOpenMatDocuments() {
  if (typeof window === "undefined") {
    return [createOpenMatDocument("untitled.m", DEFAULT_CODE)];
  }
  try {
    const savedDocs = window.localStorage.getItem("openmat-documents");
    const parsedDocs = normalizeImportedDocuments(savedDocs ? JSON.parse(savedDocs) : null);
    if (parsedDocs) return parsedDocs;

    const legacyCode = window.localStorage.getItem("openmat-code");
    const parsedCode = legacyCode ? JSON.parse(legacyCode) : DEFAULT_CODE;
    return [createOpenMatDocument("untitled.m", typeof parsedCode === "string" ? parsedCode : DEFAULT_CODE)];
  } catch {
    return [createOpenMatDocument("untitled.m", DEFAULT_CODE)];
  }
}

function getInitialActiveDocumentId(documents) {
  if (typeof window === "undefined") return documents[0]?.id || null;
  try {
    const savedId = window.localStorage.getItem("openmat-active-document-id");
    const parsedId = savedId ? JSON.parse(savedId) : null;
    if (typeof parsedId === "string" && documents.some((doc) => doc.id === parsedId)) {
      return parsedId;
    }
  } catch {
    // fall through to first document
  }
  return documents[0]?.id || null;
}

function buildRecoverySnapshot({
  documents,
  activeDocumentId,
  browserTab,
  workspaceTab,
  controlValues,
  reason,
}) {
  return {
    documents,
    activeDocumentId,
    browserTab,
    workspaceTab,
    controlValues,
    reason,
    createdAt: new Date().toISOString(),
  };
}

function compactDocumentLabel(name, crowded = false) {
  const safeName = typeof name === "string" && name.trim() ? name.trim() : "untitled.m";
  if (!crowded) return safeName;

  const extIndex = safeName.lastIndexOf(".");
  const base = extIndex > 0 ? safeName.slice(0, extIndex) : safeName;
  const extension = extIndex > 0 ? safeName.slice(extIndex) : "";
  const compactBase = base.length <= 6 ? base : `${base.slice(0, 3)}...`;
  return `${compactBase}${extension}`;
}

function registerOpenMatExtension(name, extension) {
  if (!name || typeof name !== "string") {
    throw new Error("OpenMAT extensions require a string name.");
  }
  OPENMAT_EXTENSION_REGISTRY.set(name, { name, ...extension });
  return name;
}

function unregisterOpenMatExtension(name) {
  OPENMAT_EXTENSION_REGISTRY.delete(name);
}

function listOpenMatExtensions() {
  return Array.from(OPENMAT_EXTENSION_REGISTRY.values());
}

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

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
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

// ─── Statistics helpers ───────────────────────────────────────────────────────
function statMean(value) {
  const v = normalizeVector(value);
  return v.reduce((a, b) => a + b, 0) / v.length;
}
function statMedian(value) {
  const v = [...normalizeVector(value)].sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 === 0 ? (v[m - 1] + v[m]) / 2 : v[m];
}
function statStd(value, flag = 0) {
  const v = normalizeVector(value);
  const mu = statMean(v);
  const denom = flag === 1 ? v.length : v.length - 1;
  return Math.sqrt(v.reduce((s, x) => s + (x - mu) ** 2, 0) / denom);
}
function statVar(value, flag = 0) { return statStd(value, flag) ** 2; }
function statMin(value) {
  const v = normalizeVector(value);
  return Array.isArray(toPlain(value)) ? Math.min(...v) : v[0];
}
function statMax(value) {
  const v = normalizeVector(value);
  return Array.isArray(toPlain(value)) ? Math.max(...v) : v[0];
}
function statSum(value) { return normalizeVector(value).reduce((a, b) => a + b, 0); }
function statProd(value) { return normalizeVector(value).reduce((a, b) => a * b, 1); }
function statSort(value, dir = 'ascend') {
  const v = [...normalizeVector(value)];
  v.sort((a, b) => a - b);
  return dir === 'descend' ? v.reverse() : v;
}
function statUnique(value) { return [...new Set(normalizeVector(value))].sort((a, b) => a - b); }
function statMod(a, b) { return ((Number(a) % Number(b)) + Number(b)) % Number(b); }
function statRem(a, b) { return Number(a) % Number(b); }
function statFix(value) {
  const fn = (x) => x >= 0 ? Math.floor(x) : Math.ceil(x);
  return isCollection(value) ? mapDeep(value, fn) : fn(Number(value));
}

function statAny(value) { return normalizeVector(value).some(Boolean) ? 1 : 0; }
function statAll(value) { return normalizeVector(value).every(Boolean) ? 1 : 0; }
function statFind(value) {
  const v = normalizeVector(value);
  return v.map((x, i) => (x ? i + 1 : null)).filter((x) => x !== null);
}
function reshapeArray(value, rows, cols) {
  const flat = normalizeVector(value);
  const r = Number(rows), c = Number(cols);
  const out = [];
  for (let i = 0; i < r; i++) {
    out.push(flat.slice(i * c, i * c + c));
  }
  return out;
}
function repmatArray(value, m, n) {
  const plain = toPlain(value);
  const isVec = !isMatrix(plain);
  const mat = isVec ? [normalizeVector(plain)] : plain;
  const rowRep = Array.from({ length: m }, () => mat).flat();
  return rowRep.map((row) => Array.from({ length: n }, () => row).flat());
}
function histArray(value, bins = 10) {
  const v = normalizeVector(value);
  const mn = Math.min(...v), mx = Math.max(...v);
  const w = (mx - mn) / Number(bins);
  const counts = Array(Number(bins)).fill(0);
  v.forEach((x) => {
    const i = Math.min(Math.floor((x - mn) / w), Number(bins) - 1);
    counts[i]++;
  });
  const centers = Array.from({ length: Number(bins) }, (_, i) => mn + w * (i + 0.5));
  return { __histData: { centers, counts } };
}
function interp1Array(x, y, xi) {
  const xv = normalizeVector(x), yv = normalizeVector(y), xiv = normalizeVector(xi);
  return xiv.map((xq) => {
    if (xq <= xv[0]) return yv[0];
    if (xq >= xv[xv.length - 1]) return yv[yv.length - 1];
    let lo = 0;
    for (let i = 0; i < xv.length - 1; i++) { if (xv[i] <= xq && xq <= xv[i + 1]) { lo = i; break; } }
    const t = (xq - xv[lo]) / (xv[lo + 1] - xv[lo]);
    return yv[lo] + t * (yv[lo + 1] - yv[lo]);
  });
}
function trapzArray(x, y = null) {
  const xv = y == null ? null : normalizeVector(x);
  const yv = normalizeVector(y == null ? x : y);
  if (yv.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < yv.length - 1; i += 1) {
    const dx = xv ? xv[i + 1] - xv[i] : 1;
    total += dx * (yv[i] + yv[i + 1]) / 2;
  }
  return total;
}
function gradientArray(value, spacing = 1) {
  const v = normalizeVector(value);
  if (v.length <= 1) return v.map(() => 0);
  const h = Number(spacing) || 1;
  return v.map((entry, index) => {
    if (index === 0) return (v[1] - v[0]) / h;
    if (index === v.length - 1) return (v[index] - v[index - 1]) / h;
    return (v[index + 1] - v[index - 1]) / (2 * h);
  });
}
function companionRoots(coefficients) {
  const coeffs = normalizeVector(coefficients).map(Number);
  while (coeffs.length > 1 && Math.abs(coeffs[0]) < 1e-12) coeffs.shift();
  const degree = coeffs.length - 1;
  if (degree <= 0) return [];
  if (degree === 1) return [-coeffs[1] / coeffs[0]];
  const lead = coeffs[0];
  const companion = Array.from({ length: degree }, (_, row) =>
    Array.from({ length: degree }, (_, col) => {
      if (row === 0) return -(coeffs[col + 1] ?? 0) / lead;
      return col === row - 1 ? 1 : 0;
    }),
  );
  const eigen = math.eigs(companion);
  return toPlain(eigen.values ?? []);
}
function singularValues(A) {
  const result = math.svd(A);
  const raw = Array.isArray(result.S?.[0]) ? math.diag(result.S) : result.S;
  return normalizeVector(raw).map((entry) => Math.abs(Number(entry)));
}
function matrixRank(A, tolerance = null) {
  const s = singularValues(A);
  const max = Math.max(...s, 0);
  const tol = tolerance == null ? max * Math.max(inferSize(A)[0], inferSize(A)[1]) * 1e-10 : Number(tolerance);
  return s.filter((entry) => entry > tol).length;
}
function conditionNumber(A) {
  const s = singularValues(A).filter((entry) => entry > 1e-12);
  if (!s.length) return Infinity;
  return Math.max(...s) / Math.min(...s);
}
function orthonormalBasis(A, mode = "orth") {
  const { U, V, S } = math.svd(A);
  const singular = normalizeVector(Array.isArray(S?.[0]) ? math.diag(S) : S).map((entry) => Math.abs(Number(entry)));
  const tol = Math.max(...singular, 0) * Math.max(inferSize(A)[0], inferSize(A)[1]) * 1e-10;
  const source = mode === "null" ? toPlain(V) : toPlain(U);
  const columns = math.transpose(source);
  const keep = columns.filter((_, index) =>
    mode === "null" ? singular[index] <= tol : singular[index] > tol,
  );
  return keep.length ? math.transpose(keep) : [];
}
function normalizeSurfaceMatrices(x, y, z) {
  const Z = toPlain(z);
  const rows = Array.isArray(Z) ? Z.length : 0;
  const cols = rows ? Math.max(...Z.map((row) => row.length), 0) : 0;
  const defaultX = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => c - (cols - 1) / 2),
  );
  const defaultY = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => r - (rows - 1) / 2),
  );
  const expandGrid = (value, fallback) => {
    const plain = toPlain(value);
    if (!Array.isArray(plain)) return fallback;
    if (Array.isArray(plain[0])) return plain;
    if (plain.length === cols) {
      return Array.from({ length: rows }, () => [...plain]);
    }
    if (plain.length === rows) {
      return plain.map((entry) => Array.from({ length: cols }, () => entry));
    }
    return fallback;
  };
  return {
    X: x == null ? defaultX : expandGrid(x, defaultX),
    Y: y == null ? defaultY : expandGrid(y, defaultY),
    Z,
  };
}
function convertSurfaceTo3DConfig(kind, args, plotState) {
  let X;
  let Y;
  let Z;
  if (args.length === 1) {
    Z = args[0];
  } else if (args.length >= 3) {
    [X, Y, Z] = args;
  } else {
    Z = args[args.length - 1];
  }
  const surfaceData = normalizeSurfaceMatrices(X, Y, Z);
  return {
    mode: "3d",
    title: plotState.title || `OpenMAT ${kind === "mesh" ? "Mesh" : "Surface"} Lab`,
    replace: true,
    functions: [
      {
        id: Date.now(),
        latex: kind === "mesh" ? "mesh data" : "surface data",
        color: "#6366f1",
        visible: true,
        wireframe: kind === "mesh",
        opacity: kind === "mesh" ? 1 : 0.82,
        surfaceData,
      },
    ],
    settings: {
      range: Math.max(surfaceData.Z.length, surfaceData.Z[0]?.length || 10),
      resolution: Math.min(128, Math.max(surfaceData.Z.length, surfaceData.Z[0]?.length || 32)),
    },
  };
}
function svdDecomp(A) {
  const result = math.svd(A);
  const U = toPlain(result.U), S = toPlain(result.S), V = toPlain(result.V);
  const diagS = Array.isArray(S[0]) ? S : makeDiagonal(S);
  return { __multi: [U, diagS, V], U, S: diagS, V };
}
function sprintfFormat(fmt, ...args) {
  let i = 0;
  return String(fmt).replace(/%[\d.]*[diouxXeEfgGs]/g, (m) => {
    const val = args[i++];
    if (val == null) return m;
    if (m.endsWith('d') || m.endsWith('i')) return Math.round(Number(val)).toString();
    if (m.endsWith('f') || m.endsWith('e') || m.endsWith('g')) {
      const prec = (m.match(/\.(\d+)/) || [, '6'])[1];
      return Number(val).toFixed(Number(prec));
    }
    return String(val);
  });
}

// ─── Block-aware script parser ────────────────────────────────────────────────
// Parses MATLAB source into a tree of Statement nodes before execution.
// Handles: if/elseif/else/end, for/end, while/end, function/end

function parseBlocks(lines) {
  const stack = [{ type: 'root', body: [] }];
  const top = () => stack[stack.length - 1];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const stripped = raw.replace(/%.*$/, '').trim();
    if (!stripped) continue;

    const lower = stripped.toLowerCase();

    // function definition
    const fnMatch = stripped.match(/^function\s+(?:\[([^\]]*)\]\s*=\s*|([A-Za-z_]\w*)\s*=\s*)?([A-Za-z_]\w*)\s*\(([^)]*)\)/i);
    if (fnMatch) {
      const outMulti = fnMatch[1] ? fnMatch[1].split(',').map(s => s.trim()).filter(Boolean) : null;
      const outSingle = fnMatch[2] ? [fnMatch[2].trim()] : null;
      const outs = outMulti || outSingle || [];
      const name = fnMatch[3];
      const ins = fnMatch[4].split(',').map(s => s.trim()).filter(Boolean);
      const node = { type: 'function', name, ins, outs, body: [] };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // for loop
    const forMatch = stripped.match(/^for\s+([A-Za-z_]\w*)\s*=\s*(.+)$/i);
    if (forMatch) {
      const node = { type: 'for', varName: forMatch[1], iterExpr: forMatch[2], body: [] };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // while loop
    const whileMatch = stripped.match(/^while\s+(.+)$/i);
    if (whileMatch) {
      const node = { type: 'while', condExpr: whileMatch[1], body: [] };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // if
    const ifMatch = stripped.match(/^if\s+(.+)$/i);
    if (ifMatch) {
      const node = { type: 'if', branches: [{ cond: ifMatch[1], body: [] }], elseBody: null };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // elseif — attach to current if node
    const elseifMatch = stripped.match(/^elseif\s+(.+)$/i);
    if (elseifMatch) {
      const ifNode = top();
      if (ifNode.type === 'if') ifNode.branches.push({ cond: elseifMatch[1], body: [] });
      continue;
    }

    // else
    if (lower === 'else') {
      const ifNode = top();
      if (ifNode.type === 'if') ifNode.elseBody = [];
      continue;
    }

    // end
    if (lower === 'end') {
      if (stack.length > 1) stack.pop();
      continue;
    }

    // Resolve the correct body array for the current top node
    // (if nodes have branches/elseBody instead of a direct body)
    const getTargetBody = (node) => {
      if (node.type === 'if') {
        return node.elseBody !== null
          ? node.elseBody
          : node.branches[node.branches.length - 1].body;
      }
      return node.body;
    };

    // break / continue / return
    if (lower === 'break') { getTargetBody(top()).push({ type: 'break' }); continue; }
    if (lower === 'continue') { getTargetBody(top()).push({ type: 'continue' }); continue; }
    if (lower === 'return') { getTargetBody(top()).push({ type: 'return' }); continue; }

    // plain statement
    getTargetBody(top()).push({ type: 'line', raw: stripped });
  }

  return stack[0].body;
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

function replaceIndexing(line, variables, functionNames = new Set()) {
  if (variables.size === 0) return line;
  return line.replace(/\b([A-Za-z_]\w*)\s*\(([^()]+)\)/g, (match, name, inner) => {
    if (!variables.has(name) || functionNames.has(name)) return match;
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

function preprocessLine(line, variables, functionNames = new Set()) {
  let output = line.replace(/%.*$/, "").trim();
  if (!output) return "";
  output = output.replace(/^hold\s+on$/i, "hold('on')");
  output = output.replace(/^hold\s+off$/i, "hold('off')");
  output = output.replace(/^grid\s+on$/i, "grid('on')");
  output = output.replace(/^grid\s+off$/i, "grid('off')");
  output = output.replace(/^axis\s+tight$/i, "axis('tight')");
  output = output.replace(/^axis\s+equal$/i, "axis('equal')");
  output = output.replace(/^axis\s+auto$/i, "axis('auto')");
  output = normalizeMatrixSyntax(output);
  output = replaceIndexing(output, variables, functionNames);
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

function inferClass(value) {
  const plain = toPlain(value);
  if (plain == null) return "null";
  if (typeof plain === "number") return Number.isInteger(plain) ? "double" : "double";
  if (typeof plain === "string") return "char";
  if (typeof plain === "boolean") return "logical";
  if (isComplexLike(plain)) return "complex double";
  if (Array.isArray(plain)) return "double array";
  if (plain?.__multi) return "tuple";
  return typeof plain;
}

function inferSize(value) {
  const plain = toPlain(value);
  if (plain == null) return [0, 0];
  if (!Array.isArray(plain)) return [1, 1];
  if (!plain.length) return [0, 0];
  if (Array.isArray(plain[0])) {
    return [plain.length, Math.max(...plain.map((row) => row.length), 0)];
  }
  return [1, plain.length];
}

function estimateBytes(value) {
  const plain = toPlain(value);
  try {
    return new Blob([JSON.stringify(plain)]).size;
  } catch {
    return 0;
  }
}

function summarizeValue(value) {
  const text = formatValue(value).replace(/\s+/g, " ").trim();
  return text.length > 90 ? `${text.slice(0, 87)}...` : text || "(empty)";
}

function buildWorkspaceSnapshot(parser, variables) {
  return Array.from(variables)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const value = toPlain(parser.get(name));
      const size = inferSize(value);
      return {
        name,
        className: inferClass(value),
        size,
        bytes: estimateBytes(value),
        preview: summarizeValue(value),
        value,
      };
    });
}

function parseFigureJson(figureJson) {
  if (!figureJson) return null;
  try {
    return typeof figureJson === "string" ? JSON.parse(figureJson) : figureJson;
  } catch {
    return null;
  }
}

function stringifyFigure(fig) {
  return JSON.stringify(fig);
}

function updateFigureBounds(figureJson, updater) {
  const fig = parseFigureJson(figureJson);
  if (!fig) return figureJson;
  const nextBounds = updater({
    xmin: fig.xmin,
    xmax: fig.xmax,
    ymin: fig.ymin,
    ymax: fig.ymax,
  });
  if (!nextBounds) return figureJson;
  return stringifyFigure({ ...fig, ...nextBounds });
}

function scaleFigureBounds(figureJson, factor) {
  return updateFigureBounds(figureJson, ({ xmin, xmax, ymin, ymax }) => {
    const xCenter = (xmin + xmax) / 2;
    const yCenter = (ymin + ymax) / 2;
    const xHalf = ((xmax - xmin) * factor) / 2;
    const yHalf = ((ymax - ymin) * factor) / 2;
    return {
      xmin: xCenter - xHalf,
      xmax: xCenter + xHalf,
      ymin: yCenter - yHalf,
      ymax: yCenter + yHalf,
    };
  });
}

function toggleFigureGrid(figureJson) {
  const fig = parseFigureJson(figureJson);
  if (!fig) return figureJson;
  const hasGrid = fig.elements?.some((element) => element.type === "grid");
  const elements = hasGrid
    ? fig.elements.filter((element) => element.type !== "grid")
    : [
        {
          type: "grid",
          step: Math.max((fig.xmax - fig.xmin) / 8, 1e-6),
          color: "border",
        },
        ...(fig.elements || []),
      ];
  return stringifyFigure({ ...fig, elements });
}

function extractFigureMeta(figureJson) {
  const fig = parseFigureJson(figureJson);
  if (!fig) return { axisMode: "auto", hasGrid: true };
  return {
    axisMode: fig.axisMode || "auto",
    hasGrid: fig.elements?.some((element) => element.type === "grid") ?? true,
  };
}

function renderOpenMatFigure(figureJson, C, emptyHeight = 180) {
  const parsed = parseFigureJson(figureJson);
  if (parsed?.type === "opencalc_subplots") {
    const { cols, panels } = parsed;
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 8,
        }}
      >
        {panels.map((panel, idx) => (
          <div key={idx} style={{ minWidth: 0 }}>
            {panel ? (
              <FigureRenderer figureJson={panel} C={C} />
            ) : (
              <div
                style={{
                  height: emptyHeight,
                  borderRadius: 8,
                  background: C.surface2,
                  border: `1px solid ${C.border}`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
  return <FigureRenderer figureJson={figureJson} C={C} />;
}

function OpenMatPlotWindow({ isOpen, onClose, figureJson, figureMeta, C }) {
  if (!isOpen || !figureJson) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/55 backdrop-blur-md">
      <div
        className="flex h-full w-full flex-col"
        style={{ background: C.pageBg }}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: C.border, background: C.surface }}
        >
          <div>
            <div className="text-sm font-semibold" style={{ color: C.text }}>
              OpenMAT Plot Window
            </div>
            <div className="text-xs" style={{ color: C.muted }}>
              Larger figure view for dense plots and subplot layouts.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-xs md:block" style={{ color: C.muted }}>
              Axis mode: {figureMeta.axisMode}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: C.border, background: C.surface2, color: C.text }}
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          <div
            className="min-h-full rounded-3xl border p-4 md:p-6"
            style={{ borderColor: C.border, background: C.surface }}
          >
            {renderOpenMatFigure(figureJson, C, 280)}
          </div>
        </div>
      </div>
      <OpenMatPlotWindow
        isOpen={isPlotWindowOpen}
        onClose={() => setIsPlotWindowOpen(false)}
        figureJson={figureJson}
        figureMeta={figureMeta}
        C={C}
      />
    </div>
  );
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

  const isTight = plotState.axisMode === "tight";
  const padX = (xmax - xmin) * (isTight ? 0.02 : 0.08);
  const padY = (ymax - ymin) * (isTight ? 0.02 : 0.15);
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
    axisMode: plotState.axisMode,
    elements,
  });
}

function makePlotState() {
  return { series: [], hold: false, title: "", xlabel: "", ylabel: "", legend: [], grid: true, xlim: null, ylim: null, axisMode: "auto" };
}

function createExecutionEngine(options = {}) {
  const extensions = options.extensions || [];
  const controlValues = options.controlValues || {};
  const parser = math.parser();
  const variables = new Set();
  const functionNames = new Set();
  const logs = [];
  let plot3DRequest = null;
  const controls = [];
  const controlSet = new Set();

  // Subplot state: null = single figure, otherwise grid layout
  const subplotState = { active: false, rows: 1, cols: 1, slots: [], current: 0 };

  const plotState = makePlotState();

  const registerControl = (type, name, min, max, step = 1, defaultValue = null, meta = {}) => {
    const key = String(name);
    const lower = Number(min);
    const upper = Number(max);
    const safeMin = Number.isFinite(lower) ? lower : 0;
    const safeMax = Number.isFinite(upper) ? upper : safeMin + 1;
    const safeStep = Math.abs(Number(step)) || 1;
    const fallback = defaultValue == null ? safeMin : Number(defaultValue);
    const rawValue = Object.prototype.hasOwnProperty.call(controlValues, key)
      ? Number(controlValues[key])
      : fallback;
    const value = clampValue(
      Number.isFinite(rawValue) ? rawValue : fallback,
      Math.min(safeMin, safeMax),
      Math.max(safeMin, safeMax),
    );
    parser.set(key, value);
    variables.add(key);
    if (!controlSet.has(key)) {
      controls.push({
        name: key,
        type,
        min: Math.min(safeMin, safeMax),
        max: Math.max(safeMin, safeMax),
        step: safeStep,
        value,
        defaultValue: fallback,
        ...meta,
      });
      controlSet.add(key);
    }
    return value;
  };

  const clearPlots = () => {
    Object.assign(plotState, makePlotState());
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
  parser.set("axis", (mode) => {
    if (typeof mode === "string") {
      const normalized = mode.toLowerCase();
      if (["equal", "tight", "auto"].includes(normalized)) {
        plotState.axisMode = normalized;
        if (normalized === "auto") {
          plotState.xlim = null;
          plotState.ylim = null;
        }
        return normalized;
      }
    }
    const bounds = normalizeVector(mode).slice(0, 4);
    if (bounds.length === 4) {
      plotState.xlim = bounds.slice(0, 2);
      plotState.ylim = bounds.slice(2, 4);
      plotState.axisMode = "manual";
      return bounds;
    }
    return plotState.axisMode;
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
  parser.set("svd", (A) => svdDecomp(A));
  parser.set("trapz", (x, y = null) => trapzArray(x, y));
  parser.set("gradient", (value, spacing = 1) => gradientArray(value, spacing));
  parser.set("roots", (coefficients) => companionRoots(coefficients));
  parser.set("rank", (A, tolerance = null) => matrixRank(A, tolerance));
  parser.set("cond", (A) => conditionNumber(A));
  parser.set("orth", (A) => orthonormalBasis(A, "orth"));
  parser.set("null", (A) => orthonormalBasis(A, "null"));
  parser.set("surf", (...args) => {
    plot3DRequest = convertSurfaceTo3DConfig("surf", args, plotState);
    logs.push("3D surface ready. Opened in 3D Grapher.");
    return args[args.length - 1] ?? null;
  });
  parser.set("mesh", (...args) => {
    plot3DRequest = convertSurfaceTo3DConfig("mesh", args, plotState);
    logs.push("3D mesh ready. Opened in 3D Grapher.");
    return args[args.length - 1] ?? null;
  });
  parser.set("slider", (name, min, max, step = 1, defaultValue = null) =>
    registerControl("slider", name, min, max, step, defaultValue),
  );
  parser.set(
    "animate",
    (name, min, max, step = 1, defaultValue = null, speed = 1, loop = 1) =>
      registerControl("animate", name, min, max, step, defaultValue, {
        speed: Math.abs(Number(speed)) || 1,
        loop: Boolean(Number(loop)),
      }),
  );
  parser.set("whos", () => buildWorkspaceSnapshot(parser, variables));

  // ── Subplot ──
  parser.set("subplot", (rows, cols, idx) => {
    const r = Number(rows), c = Number(cols), i = Number(idx);
    if (!subplotState.active || subplotState.rows !== r || subplotState.cols !== c) {
      // Save any current plotState before switching
      if (subplotState.active && subplotState.current > 0) {
        subplotState.slots[subplotState.current - 1] = { ...makePlotState(), ...plotState, series: [...plotState.series] };
      }
      subplotState.active = true;
      subplotState.rows = r;
      subplotState.cols = c;
      subplotState.slots = Array.from({ length: r * c }, () => null);
    } else if (subplotState.current > 0) {
      // Save the current panel before moving to next
      subplotState.slots[subplotState.current - 1] = { ...makePlotState(), ...plotState, series: [...plotState.series] };
    }
    subplotState.current = i;
    // Reset plotState for the new panel
    Object.assign(plotState, makePlotState());
    return null;
  });

  // ── Statistics ──
  parser.set("mean", (v) => statMean(v));
  parser.set("median", (v) => statMedian(v));
  parser.set("std", (v, flag = 0) => statStd(v, Number(flag)));
  parser.set("var", (v, flag = 0) => statVar(v, Number(flag)));
  parser.set("min", (v) => statMin(v));
  parser.set("max", (v) => statMax(v));
  parser.set("sum", (v) => statSum(v));
  parser.set("prod", (v) => statProd(v));
  parser.set("sort", (v, dir = 'ascend') => statSort(v, String(dir)));
  parser.set("unique", (v) => statUnique(v));
  parser.set("any", (v) => statAny(v));
  parser.set("all", (v) => statAll(v));
  parser.set("find", (v) => statFind(v));
  parser.set("mod", (a, b) => statMod(a, b));
  parser.set("rem", (a, b) => statRem(a, b));
  parser.set("fix", (v) => statFix(v));
  parser.set("reshape", (v, r, c) => reshapeArray(v, r, c));
  parser.set("repmat", (v, m, n) => repmatArray(v, m, n));
  parser.set("hist", (v, bins = 10) => {
    const h = histArray(v, bins);
    registerPlot('bar', h.__histData.counts, h.__histData.centers.map(x => x.toFixed(2)));
    return h.__histData.counts;
  });
  parser.set("interp1", (x, y, xi) => interp1Array(x, y, xi));
  parser.set("sprintf", (fmt, ...args) => sprintfFormat(fmt, ...args));
  parser.set("fprintf", (fmt, ...args) => { logs.push(sprintfFormat(fmt, ...args)); return null; });
  parser.set("num2str", (v, fmt) => fmt ? sprintfFormat(`%${fmt}f`, v) : String(Number(v)));
  parser.set("str2num", (s) => Number(s));
  parser.set("isempty", (v) => (normalizeVector(v).length === 0 ? 1 : 0));
  parser.set("zeros", (m, n = null) => {
    const r = Number(m), c = n == null ? r : Number(n);
    if (r === 1) return Array(c).fill(0); // row vector → flat
    return Array.from({ length: r }, () => Array(c).fill(0));
  });
  parser.set("ones", (m, n = null) => {
    const r = Number(m), c = n == null ? r : Number(n);
    if (r === 1) return Array(c).fill(1); // row vector → flat
    return Array.from({ length: r }, () => Array(c).fill(1));
  });
  // randnormal via Box-Muller
  parser.set("randn", (...shape) => {
    const bm = () => {
      const u = 1 - Math.random(), v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    if (shape.length === 0) return bm();
    return makeRandomArray(shape.map(Number)).map ? (() => {
      function fill(arr) { return Array.isArray(arr) ? arr.map(fill) : bm(); }
      return fill(makeRandomArray(shape.map(Number)));
    })() : bm();
  });

  extensions.forEach((extension) => {
    Object.entries(extension?.functions || {}).forEach(([name, fn]) => {
      if (typeof fn !== "function") return;
      parser.set(name, (...args) =>
        toPlain(fn(...args, {
          math,
          parser,
          variables,
          logs,
          plotState,
          setPlot3DRequest: (config) => {
            plot3DRequest = config;
          },
        })),
      );
      functionNames.add(name);
    });
  });

  return {
    parser,
    logs,
    plotState,
    subplotState,
    variables,
    functionNames,
    getPlot3DRequest() {
      return plot3DRequest;
    },
    getControls() {
      return controls;
    },
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

// Signals for non-local flow inside block interpreter
const BREAK = Symbol('break');
const CONTINUE = Symbol('continue');
const RETURN = Symbol('return');

function executeScript(source, options = {}) {
  const extensions = options.extensions || [];
  const engine = createExecutionEngine({ extensions, controlValues: options.controlValues || {} });
  const { parser, logs, plotState, subplotState, variables, functionNames } = engine;

  // User-defined functions registry: name -> { ins, outs, body }
  const userFunctions = {};

  function isTruthy(val) {
    if (val == null) return false;
    if (typeof val === 'number') return val !== 0;
    if (typeof val === 'boolean') return val;
    if (Array.isArray(val)) return val.flat(Infinity).some((x) => x !== 0 && x != null);
    return Boolean(val);
  }

  function executeLine(rawLine) {
    const trimmedRaw = rawLine.replace(/%.*$/, '').trim();
    if (!trimmedRaw) return null;

    const hasSemicolon = /;\s*$/.test(trimmedRaw);
    const withoutSemicolon = trimmedRaw.replace(/;\s*$/, '');

    if (/^clear(\s+.+)?$/i.test(withoutSemicolon)) {
      const args = withoutSemicolon.replace(/^clear/i, '').trim().split(/\s+/).filter(Boolean);
      engine.clearVariables(args);
      return null;
    }

    const line = preprocessLine(withoutSemicolon, variables, functionNames);
    if (!line) return null;

    const anonymousAssign = withoutSemicolon.match(/^([A-Za-z_]\w*)\s*=\s*@\(([^)]*)\)\s*(.+)$/);
    if (anonymousAssign) {
      const [, name, paramsRaw, bodyRaw] = anonymousAssign;
      const params = paramsRaw.split(",").map((entry) => entry.trim()).filter(Boolean);
      const body = preprocessLine(bodyRaw, variables, functionNames);
      const anonymousFn = (...args) => {
        const saved = new Map();
        params.forEach((param, index) => {
          try {
            saved.set(param, parser.get(param));
          } catch {
            saved.set(param, undefined);
          }
          parser.set(param, args[index] ?? null);
        });
        const result = toPlain(parser.evaluate(body));
        params.forEach((param) => {
          if (saved.get(param) === undefined) parser.remove(param);
          else parser.set(param, saved.get(param));
        });
        return result;
      };
      parser.set(name, anonymousFn);
      variables.add(name);
      functionNames.add(name);
      return hasSemicolon ? null : anonymousFn;
    }

    const multiAssign = line.match(/^\[([^\]]+)\]\s*=\s*(.+)$/);
    if (multiAssign) {
      const names = multiAssign[1].split(',').map((n) => n.trim()).filter(Boolean);
      const result = toPlain(parser.evaluate(preprocessLine(multiAssign[2], variables, functionNames)));
      const values = result?.__multi || [];
      names.forEach((name, idx) => {
        parser.set(name, values[idx]);
        variables.add(name);
      });
      return hasSemicolon ? null : (values.length === 1 ? values[0] : values);
    }

    // Indexed assignment: name[i] = expr  (result of replaceIndexing on name(i) = expr)
    const indexedAssign = line.match(/^([A-Za-z_]\w*)\[([^\]]+)\]\s*=\s*(.+)$/);
    if (indexedAssign) {
      const [, name, idxExpr, valExpr] = indexedAssign;
      const arr = parser.get(name);
      const idx = Number(toPlain(parser.evaluate(idxExpr)));
      const val = toPlain(parser.evaluate(valExpr));
      const updated = Array.isArray(arr) ? [...arr] : arr;
      if (Array.isArray(updated)) {
        updated[idx - 1] = val; // 1-based
      }
      parser.set(name, updated);
      variables.add(name);
      return hasSemicolon ? null : updated;
    }

    const assign = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (assign) {
      const [, name, expr] = assign;
      const result = toPlain(parser.evaluate(expr));
      parser.set(name, result);
      parser.set('ans', result);
      variables.add(name);
      return hasSemicolon ? null : result;
    }

    const result = toPlain(parser.evaluate(line));
    parser.set('ans', result);
    return (hasSemicolon || result == null || result === '') ? null : result;
  }

  function executeBlock(nodes) {
    let last = null;
    for (const node of nodes) {
      const sig = executeNode(node);
      if (sig === BREAK || sig === CONTINUE || sig === RETURN) return sig;
      if (sig != null && sig !== BREAK && sig !== CONTINUE && sig !== RETURN) last = sig;
    }
    return last;
  }

  function executeNode(node) {
    if (node.type === 'line') {
      return executeLine(node.raw);
    }

    if (node.type === 'if') {
      for (const branch of node.branches) {
        const condExpr = preprocessLine(branch.cond.replace(/;\s*$/, ''), variables, functionNames);
        const condVal = toPlain(parser.evaluate(condExpr));
        if (isTruthy(condVal)) {
          return executeBlock(branch.body);
        }
      }
      if (node.elseBody) return executeBlock(node.elseBody);
      return null;
    }

    if (node.type === 'for') {
      const iterExpr = preprocessLine(node.iterExpr.replace(/;\s*$/, ''), variables, functionNames);
      const iterVal = toPlain(parser.evaluate(iterExpr));
      const items = Array.isArray(iterVal) ? normalizeVector(iterVal) : [realValue(iterVal)];
      let last = null;
      for (const item of items) {
        parser.set(node.varName, item);
        variables.add(node.varName);
        const sig = executeBlock(node.body);
        if (sig === BREAK) break;
        if (sig === RETURN) return sig;
        if (sig !== CONTINUE && sig != null) last = sig;
      }
      return last;
    }

    if (node.type === 'while') {
      let last = null;
      let guard = 0;
      while (guard++ < 100000) {
        const condExpr = preprocessLine(node.condExpr.replace(/;\s*$/, ''), variables, functionNames);
        const condVal = toPlain(parser.evaluate(condExpr));
        if (!isTruthy(condVal)) break;
        const sig = executeBlock(node.body);
        if (sig === BREAK) break;
        if (sig === RETURN) return sig;
        if (sig !== CONTINUE && sig != null) last = sig;
      }
      return last;
    }

    if (node.type === 'function') {
      // Register user function — called later when invoked
      const { name, ins, outs, body } = node;
      userFunctions[name] = { ins, outs, body };
      parser.set(name, (...args) => {
        // Create a scoped parser by saving/restoring variables
        const saved = {};
        ins.forEach((param, i) => { saved[param] = parser.get(param); parser.set(param, args[i] ?? null); });
        outs.forEach((o) => { saved[o] = parser.get(o); });
        executeBlock(body);
        const result = outs.length === 1
          ? parser.get(outs[0])
          : outs.length > 1 ? { __multi: outs.map((o) => parser.get(o)) } : null;
        // Restore outer scope
        Object.entries(saved).forEach(([k, v]) => v == null ? null : parser.set(k, v));
        return result;
      });
      functionNames.add(name);
      return null;
    }

    if (node.type === 'break') return BREAK;
    if (node.type === 'continue') return CONTINUE;
    if (node.type === 'return') return RETURN;
    return null;
  }

  const lines = source.split(/\r?\n/);
  const tree = parseBlocks(lines);
  let lastVisibleResult = null;

  for (const node of tree) {
    const result = executeNode(node);
    if (result != null && result !== BREAK && result !== CONTINUE && result !== RETURN) {
      lastVisibleResult = result;
    }
  }

  // Flush last subplot panel if active
  let figureJson;
  if (subplotState.active) {
    if (subplotState.current > 0) {
      subplotState.slots[subplotState.current - 1] = { ...makePlotState(), ...plotState, series: [...plotState.series] };
    }
    const panels = subplotState.slots.map((slot) =>
      slot && slot.series.length > 0 ? buildFigureFromPlotState(slot) : null
    );
    figureJson = JSON.stringify({
      type: 'opencalc_subplots',
      rows: subplotState.rows,
      cols: subplotState.cols,
      panels,
    });
  } else {
    figureJson = buildFigureFromPlotState(plotState);
  }

  const outputBlocks = [];
  if (logs.length) outputBlocks.push(logs.filter(Boolean).join('\n'));
  if (lastVisibleResult != null && lastVisibleResult !== '') {
    outputBlocks.push(formatValue(lastVisibleResult));
  }

  const result = {
    output: outputBlocks.filter(Boolean).join('\n\n') || (figureJson ? 'Plot rendered.' : 'No output.'),
    figureJson,
    workspace: buildWorkspaceSnapshot(parser, variables),
    plot3DRequest: engine.getPlot3DRequest(),
    controls: engine.getControls(),
  };
  extensions.forEach((extension) => {
    if (typeof extension?.onRun === "function") {
      try {
        extension.onRun(result, { parser, variables, logs, plotState, subplotState });
      } catch {
        // Keep the core run resilient even if an extension hook fails.
      }
    }
  });
  return result;
}

export default function OpenMatStudio() {
  const navigate = useNavigate();
  const C = useColors();
  const { openGrapher } = useGrapher();
  const [documents, setDocuments] = useLocalStorage("openmat-documents", getInitialOpenMatDocuments());
  const [activeDocumentId, setActiveDocumentId] = useLocalStorage(
    "openmat-active-document-id",
    getInitialActiveDocumentId(getInitialOpenMatDocuments()),
  );
  const [rightPaneWidth, setRightPaneWidth] = useLocalStorage("openmat-right-pane-width", 390);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [figureJson, setFigureJson] = useState(null);
  const [baseFigureJson, setBaseFigureJson] = useState(null);
  const [isPlotWindowOpen, setIsPlotWindowOpen] = useState(false);
  const [plotPanelMode, setPlotPanelMode] = useLocalStorage("openmat-plot-panel-mode", "pane");
  const [surfaceConfig, setSurfaceConfig] = useState(null);
  const [plotKind, setPlotKind] = useState("2d");
  const [controlSpecs, setControlSpecs] = useState([]);
  const [controlValues, setControlValues] = useLocalStorage("openmat-control-values", {});
  const [controlPlayback, setControlPlayback] = useLocalStorage("openmat-control-playback", {});
  const [recoverySnapshot, setRecoverySnapshot] = useLocalStorage("openmat-recovery-snapshot", null);
  const [normalizedPreview, setNormalizedPreview] = useState("");
  const [workspaceItems, setWorkspaceItems] = useState([]);
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useLocalStorage("openmat-workspace-tab", "plot");
  const [browserTab, setBrowserTab] = useLocalStorage("openmat-browser-tab", "examples");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isResizingRightPane, setIsResizingRightPane] = useState(false);
  const outputRef = useRef(null);
  const importRef = useRef(null);
  const shellRef = useRef(null);
  const stateRef = useRef({});
  const controlValuesRef = useRef(controlValues);
  const monacoRef = useRef(null);

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocumentId) || documents[0] || null,
    [activeDocumentId, documents],
  );
  const code = activeDocument?.code ?? "";

  useEffect(() => {
    controlValuesRef.current = controlValues;
  }, [controlValues]);

  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(C.isDark ? "openmat-dark" : "openmat-light");
  }, [C.isDark]);

  useEffect(() => {
    if (!documents.length) {
      const fallback = createOpenMatDocument("untitled.m", DEFAULT_CODE);
      setDocuments([fallback]);
      setActiveDocumentId(fallback.id);
      return;
    }
    if (!documents.some((doc) => doc.id === activeDocumentId)) {
      setActiveDocumentId(documents[0].id);
    }
  }, [activeDocumentId, documents, setActiveDocumentId, setDocuments]);

  const exampleMap = useMemo(
    () => Object.fromEntries(EXAMPLES.map((example) => [example.id, example])),
    [],
  );

  const captureRecoverySnapshot = useCallback((reason) => {
    setRecoverySnapshot(
      buildRecoverySnapshot({
        documents,
        activeDocumentId,
        browserTab,
        workspaceTab,
        controlValues,
        reason,
      }),
    );
  }, [activeDocumentId, browserTab, controlValues, documents, setRecoverySnapshot, workspaceTab]);

  const setCode = useCallback((value) => {
    if (!activeDocument) return;
    setDocuments((current) =>
      current.map((doc) => {
        if (doc.id !== activeDocument.id) return doc;
        const nextCode = value instanceof Function ? value(doc.code) : value;
        return { ...doc, code: String(nextCode ?? "") };
      }),
    );
  }, [activeDocument, setDocuments]);


  const workspaceTabs = [
    { id: "plot", label: "Figure", icon: LineChart },
    { id: "console", label: "Console", icon: Rows3 },
    { id: "workspace", label: "Workspace", icon: Waves },
    { id: "reference", label: "Reference", icon: Sigma },
    { id: "normalized", label: "Normalized", icon: Cpu },
  ];
  const browserTabs = [
    { id: "examples", label: "Examples" },
    { id: "functions", label: "Functions" },
    { id: "notes", label: "Notes" },
  ];
  const crowdedTabs = documents.length >= 6;
  const referenceItems = [
    "Language: MATLAB-like syntax over a local math engine, not raw JS/Python",
    "Matrices: [1 2; 3 4], A', A \\\\ b, inv, det, trace, eig, qr, svd",
    "Arrays: linspace, logspace, zeros, ones, eye, rand, randn, reshape, repmat",
    "Statistics: mean, median, std, var, min, max, sum, prod, sort, unique, find",
    "Numerics: trapz, gradient, roots, rank, cond, orth, null, interp1",
    "Plots: plot, scatter, bar, hist, stem, area, hold on/off, clf, subplot",
    "3D: surf(X,Y,Z), mesh(X,Y,Z) launch into the 3D grapher",
    "Axes: title, xlabel, ylabel, legend, grid, xlim, ylim, axis tight/equal/auto",
    "Control: if/elseif/else/end, for i=1:n...end, while cond...end, break, continue",
    "Interactivity: slider('name', min, max, step, default)",
    "Animation: animate('t', min, max, step, default, speed, loop)",
    "Functions: function [out]=name(in)...end and f = @(x) expr",
    "Math: sin, cos, exp, log, fft, ifft, polyfit, polyval, diff, cumsum",
    "Output/API: disp, sprintf, fprintf, num2str, who, whos, clear, clc, window.OpenMAT",
  ];

  const clearRunState = useCallback(() => {
    setOutput("");
    setFigureJson(null);
    setBaseFigureJson(null);
    setSurfaceConfig(null);
    setPlotKind("2d");
    setControlSpecs([]);
    setControlValues({});
    setControlPlayback({});
    setIsPlotWindowOpen(false);
    setNormalizedPreview("");
    setWorkspaceItems([]);
    setSelectedVariable(null);
  }, [setControlPlayback, setControlValues]);

  const restoreRecoverySnapshot = useCallback(() => {
    const importedDocuments = normalizeImportedDocuments(recoverySnapshot?.documents);
    if (!importedDocuments) return;
    setDocuments(importedDocuments);
    const importedActiveId =
      typeof recoverySnapshot?.activeDocumentId === "string"
      && importedDocuments.some((doc) => doc.id === recoverySnapshot.activeDocumentId)
        ? recoverySnapshot.activeDocumentId
        : importedDocuments[0].id;
    setActiveDocumentId(importedActiveId);
    if (typeof recoverySnapshot?.browserTab === "string") setBrowserTab(recoverySnapshot.browserTab);
    if (typeof recoverySnapshot?.workspaceTab === "string") setWorkspaceTab(recoverySnapshot.workspaceTab);
    clearRunState();
    setControlValues(
      recoverySnapshot?.controlValues && typeof recoverySnapshot.controlValues === "object"
        ? recoverySnapshot.controlValues
        : {},
    );
  }, [
    clearRunState,
    recoverySnapshot,
    setActiveDocumentId,
    setBrowserTab,
    setControlValues,
    setDocuments,
    setWorkspaceTab,
  ]);

  const runCode = useCallback((nextControlValues = controlValues) => {
    setRunning(true);
    try {
      const normalized = code
        .split(/\r?\n/)
        .map((line) => preprocessLine(line.replace(/;\s*$/, ""), new Set()))
        .filter(Boolean)
        .join("\n");
      setNormalizedPreview(normalized);
      const result = executeScript(code, {
        extensions: listOpenMatExtensions(),
        controlValues: nextControlValues,
      });
      setOutput(result.output);
      setFigureJson(result.figureJson);
      setBaseFigureJson(result.figureJson);
      setSurfaceConfig(result.plot3DRequest || null);
      setControlSpecs(result.controls || []);
      setControlValues((current) => {
        const merged = { ...current };
        (result.controls || []).forEach((control) => {
          merged[control.name] = Object.prototype.hasOwnProperty.call(nextControlValues, control.name)
            ? nextControlValues[control.name]
            : control.value;
        });
        return merged;
      });
      setControlPlayback((current) => {
        const next = {};
        (result.controls || []).forEach((control) => {
          if (control.type === "animate") {
            next[control.name] = {
              playing: current[control.name]?.playing ?? false,
            };
          }
        });
        return next;
      });
      if (result.plot3DRequest) {
        setPlotKind("3d");
      } else if (result.figureJson) {
        setPlotKind("2d");
      } else {
        setPlotKind("2d");
      }
      setWorkspaceItems(result.workspace || []);
      setSelectedVariable((current) =>
        result.workspace?.find((item) => item.name === current?.name) ||
        result.workspace?.[0] ||
        null,
      );
      setWorkspaceTab(
        result.figureJson ? "plot" : result.workspace?.length ? "workspace" : "console",
      );
      window.dispatchEvent(new CustomEvent("openmat:run", { detail: result }));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setFigureJson(null);
      setBaseFigureJson(null);
      setIsPlotWindowOpen(false);
      setSurfaceConfig(null);
      setPlotKind("2d");
      setControlSpecs([]);
      setControlPlayback({});
      setWorkspaceItems([]);
      setSelectedVariable(null);
      setWorkspaceTab("console");
    } finally {
      setRunning(false);
      requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [code, controlValues, setControlPlayback, setControlValues, setWorkspaceTab]);

  const resetWorkspace = useCallback(() => {
    captureRecoverySnapshot("Reset workspace");
    const resetDocument = createOpenMatDocument("untitled.m", DEFAULT_CODE);
    setDocuments([resetDocument]);
    setActiveDocumentId(resetDocument.id);
    clearRunState();
  }, [captureRecoverySnapshot, clearRunState, setActiveDocumentId, setDocuments]);

  const loadExample = useCallback(
    (exampleId) => {
      const example = exampleMap[exampleId];
      if (!example) return;
      captureRecoverySnapshot(`Load example: ${example.label}`);
      const document = createOpenMatDocument(`${example.label}.m`, example.code);
      setDocuments((current) => [...current, document]);
      setActiveDocumentId(document.id);
      clearRunState();
    },
    [captureRecoverySnapshot, clearRunState, exampleMap, setActiveDocumentId, setDocuments],
  );

  const exportWorkspace = useCallback(() => {
    const payload = {
      documents,
      activeDocumentId,
      browserTab,
      workspaceTab,
      controlValues,
      exportedAt: new Date().toISOString(),
      app: "OpenMAT",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "openmat-session.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [activeDocumentId, browserTab, controlValues, documents, workspaceTab]);

  const importWorkspace = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        captureRecoverySnapshot(`Import session: ${file.name}`);
        const parsed = JSON.parse(String(loadEvent.target?.result || "{}"));
        const importedDocuments = normalizeImportedDocuments(parsed.documents)
          || (typeof parsed.code === "string"
            ? [createOpenMatDocument("untitled.m", parsed.code)]
            : null);
        if (!importedDocuments) {
          throw new Error("No valid OpenMAT documents were found in this file.");
        }
        setDocuments(importedDocuments);
        const importedActiveId =
          typeof parsed.activeDocumentId === "string"
          && importedDocuments.some((doc) => doc.id === parsed.activeDocumentId)
            ? parsed.activeDocumentId
            : importedDocuments[0].id;
        setActiveDocumentId(importedActiveId);
        if (typeof parsed.browserTab === "string") setBrowserTab(parsed.browserTab);
        if (typeof parsed.workspaceTab === "string") setWorkspaceTab(parsed.workspaceTab);
        clearRunState();
        setControlValues(
          parsed.controlValues && typeof parsed.controlValues === "object" ? parsed.controlValues : {},
        );
      } catch (error) {
        setOutput(`Error: Could not import workspace. ${error.message}`);
        setWorkspaceTab("console");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }, [captureRecoverySnapshot, clearRunState, setActiveDocumentId, setBrowserTab, setControlPlayback, setControlValues, setDocuments, setWorkspaceTab]);

  const createNewDocument = useCallback(() => {
    const document = createOpenMatDocument(getNextUntitledName(documents), "");
    setDocuments((current) => [...current, document]);
    setActiveDocumentId(document.id);
    clearRunState();
  }, [clearRunState, documents, setActiveDocumentId, setDocuments]);

  const renameActiveDocument = useCallback(() => {
    if (!activeDocument) return;
    const nextName = window.prompt("Rename script", activeDocument.name);
    if (!nextName) return;
    const trimmed = nextName.trim();
    if (!trimmed) return;
    setDocuments((current) =>
      current.map((doc) => (doc.id === activeDocument.id ? { ...doc, name: trimmed } : doc)),
    );
  }, [activeDocument, setDocuments]);

  const switchDocument = useCallback((documentId) => {
    if (!documentId || documentId === activeDocumentId) return;
    setActiveDocumentId(documentId);
    clearRunState();
  }, [activeDocumentId, clearRunState, setActiveDocumentId]);

  const closeDocument = useCallback((documentId) => {
    if (!documentId) return;
    captureRecoverySnapshot("Close script tab");
    if (documents.length <= 1) {
      resetWorkspace();
      return;
    }
    const currentIndex = documents.findIndex((doc) => doc.id === documentId);
    const nextDocuments = documents.filter((doc) => doc.id !== documentId);
    const nextActive =
      activeDocumentId === documentId
        ? nextDocuments[Math.max(0, currentIndex - 1)]?.id || nextDocuments[0]?.id
        : activeDocumentId;
    setDocuments(nextDocuments);
    setActiveDocumentId(nextActive);
    if (activeDocumentId === documentId) {
      clearRunState();
    }
  }, [activeDocumentId, captureRecoverySnapshot, clearRunState, documents, resetWorkspace, setActiveDocumentId, setDocuments]);

  const figureMeta = useMemo(() => extractFigureMeta(figureJson), [figureJson]);

  useEffect(() => {
    stateRef.current = {
      documents,
      activeDocumentId,
      activeDocument,
      code,
      output,
      workspaceItems,
      figureJson,
      recoverySnapshot,
    };
  }, [activeDocument, activeDocumentId, code, documents, figureJson, output, recoverySnapshot, workspaceItems]);

  useEffect(() => {
    const api = {
      registerExtension: registerOpenMatExtension,
      unregisterExtension: unregisterOpenMatExtension,
      listExtensions: () => listOpenMatExtensions().map(({ name }) => name),
      run: (source) => executeScript(String(source ?? stateRef.current.code ?? ""), { extensions: listOpenMatExtensions() }),
      setCode: (nextCode) => setCode(String(nextCode ?? "")),
      appendCode: (snippet) => setCode((prev) => `${prev}${prev.endsWith("\n") ? "" : "\n"}${String(snippet ?? "")}`),
      createDocument: (name = null, nextCode = "") => {
        const document = createOpenMatDocument(name || getNextUntitledName(stateRef.current.documents || []), String(nextCode ?? ""));
        setDocuments((current) => [...current, document]);
        setActiveDocumentId(document.id);
        return document.id;
      },
      renameDocument: (id, name) => {
        if (!id || !name) return;
        setDocuments((current) =>
          current.map((doc) => (doc.id === id ? { ...doc, name: String(name).trim() || doc.name } : doc)),
        );
      },
      setActiveDocument: (id) => {
        if (typeof id === "string") setActiveDocumentId(id);
      },
      restoreLastSnapshot: () => restoreRecoverySnapshot(),
      getState: () => ({ ...stateRef.current }),
      open3D: (config) => openGrapher({ mode: "3d", ...config }),
    };
    window.OpenMAT = api;
    window.dispatchEvent(new CustomEvent("openmat:ready", { detail: { extensions: api.listExtensions() } }));
    return () => {
      if (window.OpenMAT === api) delete window.OpenMAT;
    };
  }, [openGrapher, restoreRecoverySnapshot, setActiveDocumentId, setCode, setDocuments]);

  useEffect(() => {
    if (!isResizingRightPane) return undefined;

    const handleMove = (event) => {
      const shellRect = shellRef.current?.getBoundingClientRect();
      if (!shellRect) return;
      const nextWidth = shellRect.right - event.clientX;
      const clamped = Math.max(300, Math.min(820, nextWidth));
      setRightPaneWidth(Math.round(clamped));
    };

    const handleUp = () => {
      setIsResizingRightPane(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingRightPane, setRightPaneWidth]);

  const isPlotFocused = plotPanelMode === "focus";
  const rightPaneCssWidth = isPlotFocused
    ? "min(100%, max(56vw, 760px))"
    : `min(100%, ${rightPaneWidth}px)`;
  const updateControlValue = useCallback((name, nextValue) => {
    const spec = controlSpecs.find((control) => control.name === name);
    if (!spec) return;
    const clamped = clampValue(Number(nextValue), spec.min, spec.max);
    const snapped = spec.step > 0
      ? Number((Math.round((clamped - spec.min) / spec.step) * spec.step + spec.min).toFixed(6))
      : clamped;
    const nextControls = { ...controlValues, [name]: snapped };
    setControlValues(nextControls);
    runCode(nextControls);
  }, [controlSpecs, controlValues, runCode, setControlValues]);

  const toggleAnimatedControl = useCallback((name) => {
    setControlPlayback((current) => ({
      ...current,
      [name]: {
        playing: !(current[name]?.playing ?? false),
      },
    }));
  }, [setControlPlayback]);

  const resetAnimatedControl = useCallback((name) => {
    const spec = controlSpecs.find((control) => control.name === name);
    if (!spec) return;
    const resetValue = spec.defaultValue ?? spec.min;
    const nextControls = { ...controlValuesRef.current, [name]: resetValue };
    setControlPlayback((current) => ({
      ...current,
      [name]: {
        playing: false,
      },
    }));
    setControlValues(nextControls);
    runCode(nextControls);
  }, [controlSpecs, runCode, setControlPlayback, setControlValues]);

  const stepAnimatedControls = useCallback(() => {
    const animatedControls = controlSpecs.filter(
      (control) => control.type === "animate" && controlPlayback[control.name]?.playing,
    );
    if (!animatedControls.length) return;

    const nextControls = { ...controlValuesRef.current };
    const stoppedNames = [];

    animatedControls.forEach((control) => {
      const currentValue = Object.prototype.hasOwnProperty.call(nextControls, control.name)
        ? Number(nextControls[control.name])
        : control.value;
      let nextValue = currentValue + control.step * (control.speed || 1);
      if (nextValue > control.max + 1e-9) {
        if (control.loop) {
          nextValue = control.min;
        } else {
          nextValue = control.max;
          stoppedNames.push(control.name);
        }
      }
      nextControls[control.name] = Number(nextValue.toFixed(6));
    });

    if (stoppedNames.length) {
      setControlPlayback((current) => {
        const next = { ...current };
        stoppedNames.forEach((name) => {
          next[name] = { playing: false };
        });
        return next;
      });
    }

    setControlValues(nextControls);
    runCode(nextControls);
  }, [controlPlayback, controlSpecs, runCode, setControlPlayback, setControlValues]);

  useEffect(() => {
    const hasActiveAnimation = controlSpecs.some(
      (control) => control.type === "animate" && controlPlayback[control.name]?.playing,
    );
    if (!hasActiveAnimation) return undefined;

    const timer = window.setInterval(() => {
      stepAnimatedControls();
    }, 80);

    return () => window.clearInterval(timer);
  }, [controlPlayback, controlSpecs, stepAnimatedControls]);

  return (
    <div
      ref={shellRef}
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
              <div className="flex min-w-0 items-center gap-2">
                <div className="truncate text-sm font-semibold">{activeDocument?.name || "untitled.m"}</div>
                <button
                  type="button"
                  onClick={renameActiveDocument}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                  style={{ borderColor: C.border, background: C.surface, color: C.text }}
                  title="Rename current script"
                >
                  <Pencil className="h-3 w-3" />
                  Rename
                </button>
              </div>
              <div className="text-[11px]" style={{ color: C.muted }}>
                Matrix computing workspace • local engine • mobile-aware layout
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
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
            onClick={exportWorkspace}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
          {normalizeImportedDocuments(recoverySnapshot?.documents) && (
            <button
              type="button"
              onClick={restoreRecoverySnapshot}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: C.border, background: C.surface, color: C.text }}
              title={recoverySnapshot?.reason ? `Restore: ${recoverySnapshot.reason}` : "Restore last snapshot"}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Restore
            </button>
          )}
          <button
            type="button"
            onClick={resetWorkspace}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{
              background: C.surface,
              borderColor: C.border,
              color: C.text,
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
          {surfaceConfig && (
            <button
              type="button"
              onClick={() => openGrapher(surfaceConfig)}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: C.border, background: C.surface, color: C.text }}
            >
              Separate 3D
            </button>
          )}
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
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
            title="Close OpenMAT"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
      </div>
      <input
        ref={importRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={importWorkspace}
      />

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
                  <div
                    className="rounded-2xl border px-3 py-2 text-xs leading-5"
                    style={{ borderColor: C.border, background: C.surface, color: C.muted }}
                  >
                    Examples open in a new script tab so your current work stays intact. `Restore`
                    brings back the last session snapshot after resets, imports, or accidental closes.
                  </div>
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
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex min-w-0 items-end gap-1 overflow-x-auto pb-1">
                {documents.map((document) => {
                  const active = document.id === activeDocument?.id;
                  return (
                    <div
                      key={document.id}
                      className="flex items-center"
                    >
                      <button
                        type="button"
                        onClick={() => switchDocument(document.id)}
                        onMouseDown={(event) => {
                          if (event.button === 1) {
                            event.preventDefault();
                            closeDocument(document.id);
                          }
                        }}
                        onDoubleClick={() => {
                          if (document.id === activeDocument?.id) renameActiveDocument();
                        }}
                        className="inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-3 py-1.5 pr-2 text-xs font-semibold"
                        style={{
                          background: active ? C.surface : C.surface2,
                          borderColor: C.border,
                          color: active ? C.text : C.muted,
                          transition: "background-color 140ms ease, color 140ms ease, border-color 140ms ease",
                        }}
                        title={document.name}
                        onMouseEnter={(event) => {
                          if (document.id !== activeDocument?.id) {
                            event.currentTarget.style.background = C.surface;
                            event.currentTarget.style.color = C.text;
                          }
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background =
                            document.id === activeDocument?.id ? C.surface : C.surface2;
                          event.currentTarget.style.color =
                            document.id === activeDocument?.id ? C.text : C.muted;
                        }}
                      >
                        <span className={crowdedTabs ? "max-w-[74px] truncate" : "max-w-[116px] truncate"}>
                          {compactDocumentLabel(document.name, crowdedTabs)}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            closeDocument(document.id);
                          }}
                          onMouseDown={(event) => {
                            event.stopPropagation();
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              closeDocument(document.id);
                            }
                          }}
                          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-[11px]"
                          style={{
                            color: C.muted,
                            transition: "background-color 140ms ease, color 140ms ease",
                          }}
                          title={`Close ${document.name}`}
                          aria-label={`Close ${document.name}`}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = "rgba(220, 38, 38, 0.14)";
                            event.currentTarget.style.color = "#f87171";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = "transparent";
                            event.currentTarget.style.color = C.muted;
                          }}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={createNewDocument}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold"
                style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                title="New script tab"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="text-[11px]" style={{ color: C.muted }}>
              Cmd/Ctrl + Enter to run
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 p-2 md:p-3">
            <Editor
              height="100%"
              beforeMount={setupOpenCalcMonaco}
              defaultLanguage="openmat"
              language="openmat"
              theme={C.isDark ? "openmat-dark" : "openmat-light"}
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
              onMount={(editor, monaco) => {
                monacoRef.current = monaco;
                monaco.editor.setTheme(C.isDark ? "openmat-dark" : "openmat-light");
                editor.addCommand(1024 | 3, () => {
                  runCode();
                });
              }}
            />
          </div>
        </div>

        <div
          className="hidden w-2 shrink-0 cursor-ew-resize border-l border-r lg:flex lg:items-center lg:justify-center"
          style={{ borderColor: C.border, background: C.surface3 }}
          onMouseDown={(event) => {
            event.preventDefault();
            setIsResizingRightPane(true);
          }}
          title="Drag to resize workspace pane"
        >
          <div
            className="h-12 w-1 rounded-full"
            style={{ background: C.border }}
          />
        </div>

        <div
          className="flex w-full min-w-0 shrink-0 flex-col border-t lg:border-t-0"
          style={{
            borderColor: C.border,
            background: C.surface2,
            width: rightPaneCssWidth,
          }}
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
                  {figureJson || surfaceConfig ? (
                    <>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPlotPanelMode((current) => {
                              const next = current === "focus" ? "pane" : "focus";
                              if (next === "focus") setSidebarOpen(false);
                              return next;
                            });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: isPlotFocused ? C.blue : C.border, background: C.surface2, color: isPlotFocused ? C.blue : C.text }}
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                          {isPlotFocused ? "Exit Focus" : "Focus Plot"}
                        </button>
                        {surfaceConfig && (
                          <button
                            type="button"
                            onClick={() => setPlotKind((current) => current === "3d" ? "2d" : "3d")}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                            style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                          >
                            {plotKind === "3d" ? "Show 2D" : "Show 3D"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setFigureJson((current) => scaleFigureBounds(current, 0.8))}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                          Zoom In
                        </button>
                        <button
                          type="button"
                          onClick={() => setFigureJson((current) => scaleFigureBounds(current, 1.25))}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          <ZoomOut className="h-3.5 w-3.5" />
                          Zoom Out
                        </button>
                        <button
                          type="button"
                          onClick={() => setFigureJson(baseFigureJson)}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          <Scan className="h-3.5 w-3.5" />
                          Reset View
                        </button>
                        <button
                          type="button"
                          onClick={() => setFigureJson((current) => toggleFigureGrid(current))}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{
                            borderColor: figureMeta.hasGrid ? C.blue : C.border,
                            background: figureMeta.hasGrid ? C.surface : C.surface2,
                            color: figureMeta.hasGrid ? C.blue : C.text,
                          }}
                        >
                          <Grid3X3 className="h-3.5 w-3.5" />
                          Grid
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPlotWindowOpen(true)}
                          disabled={!figureJson}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text, opacity: figureJson ? 1 : 0.5 }}
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                          Full Screen
                        </button>
                      </div>
                      <div className="mb-2 flex items-center justify-between gap-3 text-[11px]" style={{ color: C.muted }}>
                        <span>{plotKind === "3d" ? "Surface viewport" : `Axis mode: ${figureMeta.axisMode}`}</span>
                        <span>{plotKind === "3d" ? "Use `surf` or `mesh` to populate the local 3D view." : "Use `axis equal`, `axis tight`, `xlim`, and `ylim` in scripts."}</span>
                      </div>
                      {plotKind === "3d" && surfaceConfig ? (
                        <div className="h-[540px] overflow-hidden rounded-2xl border" style={{ borderColor: C.border }}>
                          <GlobalGrapher3D
                            embedded
                            isOpen
                            launchConfig={surfaceConfig}
                            onClose={() => {
                              setSurfaceConfig(null);
                              setPlotKind("2d");
                            }}
                            onSwitchTo2D={() => setPlotKind("2d")}
                            onSwitchToJSX={() => openGrapher({ mode: "pro" })}
                          />
                        </div>
                      ) : renderOpenMatFigure(figureJson, C)}
                      {controlSpecs.length > 0 && (
                        <div
                          className="mt-4 rounded-2xl border p-3"
                          style={{ borderColor: C.border, background: C.surface2 }}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                              Controls
                            </div>
                            <div className="text-[11px]" style={{ color: C.muted }}>
                              Slider changes rerun the script.
                            </div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            {controlSpecs.map((control) => {
                              const currentValue = Object.prototype.hasOwnProperty.call(controlValues, control.name)
                                ? Number(controlValues[control.name])
                                : control.value;
                              return (
                                <div
                                  key={control.name}
                                  className="rounded-xl border px-3 py-3"
                                  style={{ borderColor: C.border, background: C.surface }}
                                >
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <div>
                                      <span className="font-mono text-sm font-semibold">{control.name}</span>
                                      <div className="text-[11px]" style={{ color: C.muted }}>
                                        {control.type === "animate" ? "Animated parameter" : "Interactive parameter"}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {control.type === "animate" && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => toggleAnimatedControl(control.name)}
                                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                                            style={{
                                              borderColor: controlPlayback[control.name]?.playing ? C.blue : C.border,
                                              background: C.surface2,
                                              color: controlPlayback[control.name]?.playing ? C.blue : C.text,
                                            }}
                                          >
                                            {controlPlayback[control.name]?.playing ? (
                                              <Pause className="h-3 w-3" />
                                            ) : (
                                              <Play className="h-3 w-3" />
                                            )}
                                            {controlPlayback[control.name]?.playing ? "Pause" : "Play"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => resetAnimatedControl(control.name)}
                                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                                            style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                                          >
                                            <RefreshCw className="h-3 w-3" />
                                            Reset
                                          </button>
                                        </>
                                      )}
                                      <input
                                        type="number"
                                        value={currentValue}
                                        min={control.min}
                                        max={control.max}
                                        step={control.step}
                                        onChange={(event) => updateControlValue(control.name, event.target.value)}
                                        className="w-24 rounded-md border px-2 py-1 text-xs"
                                        style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                                      />
                                    </div>
                                  </div>
                                  <input
                                    type="range"
                                    min={control.min}
                                    max={control.max}
                                    step={control.step}
                                    value={currentValue}
                                    onChange={(event) => updateControlValue(control.name, event.target.value)}
                                    className="w-full accent-cyan-500"
                                  />
                                  <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: C.muted }}>
                                    <span>{control.min}</span>
                                    <span>
                                      step {control.step}
                                      {control.type === "animate" ? ` • speed ${control.speed || 1}x` : ""}
                                    </span>
                                    <span>{control.max}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      className="rounded-xl border px-3 py-10 text-center text-sm"
                      style={{ borderColor: C.border, color: C.muted }}
                    >
                      Run a script with `plot`, `stem`, `area`, `scatter`, or `bar` to render a figure here.
                    </div>
                  )}
                </div>
                {surfaceConfig && (
                  <button
                    type="button"
                    onClick={() => openGrapher(surfaceConfig)}
                    className="w-full rounded-xl border px-3 py-2 text-sm font-semibold"
                    style={{ borderColor: C.border, background: C.surface, color: C.text }}
                  >
                    Open Separate 3D Window
                  </button>
                )}
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

            {workspaceTab === "workspace" && (
              <div className="grid gap-3">
                <div
                  className="rounded-2xl border p-3"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                    Workspace
                  </div>
                  {workspaceItems.length ? (
                    <div className="space-y-2">
                      {workspaceItems.map((item) => {
                        const active = selectedVariable?.name === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setSelectedVariable(item)}
                            className="block w-full rounded-xl border px-3 py-2 text-left"
                            style={{
                              borderColor: active ? C.blue : C.border,
                              background: active ? C.surface2 : C.surface,
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-mono text-sm font-semibold">{item.name}</span>
                              <span className="text-[11px]" style={{ color: C.muted }}>
                                {item.size.join("x")}
                              </span>
                            </div>
                            <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                              {item.className} • {item.bytes} bytes
                            </div>
                            <div className="mt-1 text-xs" style={{ color: C.text }}>
                              {item.preview}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border px-3 py-6 text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>
                      Run a script to populate the workspace browser.
                    </div>
                  )}
                </div>

                {selectedVariable && (
                  <div
                    className="rounded-2xl border p-3"
                    style={{ borderColor: C.border, background: C.surface }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="font-mono text-sm font-semibold">{selectedVariable.name}</div>
                      <div className="text-[11px]" style={{ color: C.muted }}>
                        {selectedVariable.className}
                      </div>
                    </div>
                    <div className="mb-2 text-[11px]" style={{ color: C.muted }}>
                      Size {selectedVariable.size.join(" x ")} • {selectedVariable.bytes} bytes
                    </div>
                    <pre
                      className="max-h-[240px] overflow-auto rounded-xl border p-3 text-xs leading-6"
                      style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                    >
                      {formatValue(selectedVariable.value)}
                    </pre>
                  </div>
                )}
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
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 font-semibold">What OpenMAT Is</div>
                  <div style={{ color: C.muted }}>
                    OpenMAT is a MATLAB-like scripting layer implemented inside the browser on top of
                    a local math engine and Open Calc&apos;s figure system. It is not raw JavaScript,
                    not Python, and not full MATLAB compatibility. The user language is intentionally
                    hybrid so we can keep matrix-first syntax while staying browser-native.
                  </div>
                </div>

                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 font-semibold">Docs To Keep Updated</div>
                  <div style={{ color: C.muted }}>
                    Keep these in sync as features land: `docs/OpenMAT.md`, the in-app Reference tab,
                    built-in `help`, and the example scripts. If a feature only exists in code, OpenMAT
                    becomes harder to learn and harder to extend.
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
