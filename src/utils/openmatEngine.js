import { create, all, format as mathFormat } from "mathjs";

export const math = create(all);
math.config({ matrix: "Array", number: "number" });

// ── Pure type/value helpers ───────────────────────────────────────────────────

export function toPlain(value) {
  if (value && typeof value.valueOf === "function") {
    const p = value.valueOf();
    if (p !== value) return toPlain(p);
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    if ("re" in value && "im" in value && Object.keys(value).length <= 3) return value;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
}

export function isComplexLike(v) {
  return v && typeof v === "object" && "re" in v && "im" in v;
}

export function realValue(v) {
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (isComplexLike(v)) return Number(v.re ?? 0);
  return Number(v);
}

export function isMatrix(value) {
  return Array.isArray(value) && Array.isArray(value[0]);
}

export function isCollection(value) {
  return Array.isArray(toPlain(value));
}

export function mapDeep(value, fn) {
  const p = toPlain(value);
  if (Array.isArray(p)) return p.map(item => mapDeep(item, fn));
  return fn(p);
}

// ── Array/vector helpers ──────────────────────────────────────────────────────

export function normalizeVector(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain)) return [realValue(plain)];
  if (Array.isArray(plain[0]) && plain[0].length === 1) {
    return plain.map((row) => realValue(row[0]));
  }
  return plain.flat().map(realValue);
}

export function flattenNumbers(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain)) return [realValue(plain)];
  return plain.flat(Infinity).map(realValue);
}

export function toNumericMatrix(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain) || !plain.length) return null;
  if (!Array.isArray(plain[0])) {
    return plain.map((entry) => [realValue(entry)]);
  }
  return plain.map((row) => row.map((entry) => realValue(entry)));
}

export function inferSize(value) {
  const plain = toPlain(value);
  if (plain == null) return [0, 0];
  if (!Array.isArray(plain)) return [1, 1];
  if (!plain.length) return [0, 0];
  if (Array.isArray(plain[0])) {
    return [plain.length, Math.max(...plain.map((row) => row.length), 0)];
  }
  return [1, plain.length];
}

export function makeDiagonal(values) {
  const vector = normalizeVector(values);
  return vector.map((value, index) =>
    vector.map((_, column) => (column === index ? value : 0)),
  );
}

export function makeRandomArray(shape) {
  if (shape.length === 0) return Math.random();
  const [head, ...tail] = shape;
  return Array.from({ length: Number(head) }, () => makeRandomArray(tail));
}

export function toColumnSeries(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain)) return [[realValue(plain)]];
  if (!isMatrix(plain)) return [normalizeVector(plain)];
  const columnCount = Math.max(...plain.map((row) => row.length), 0);
  return Array.from({ length: columnCount }, (_, column) =>
    plain.map((row) => realValue(row[column] ?? 0)),
  );
}

export function buildLinspace(start, stop, count = 100) {
  const n = Math.max(1, Math.round(Number(count)));
  const a = Number(start);
  const b = Number(stop);
  if (n === 1) return [a];
  const step = (b - a) / (n - 1);
  return Array.from({ length: n }, (_, index) => a + step * index);
}

export function buildLogspace(a, b, count = 50) {
  return buildLinspace(Number(a), Number(b), count).map((value) => 10 ** value);
}

export function meshgrid(xValues, yValues = xValues) {
  const x = normalizeVector(xValues);
  const y = normalizeVector(yValues);
  return {
    __multi: [
      y.map(() => [...x]),
      y.map((value) => Array.from({ length: x.length }, () => value)),
    ],
  };
}

export function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// ── Vector/matrix operations ──────────────────────────────────────────────────

export function diffArray(value) {
  const vector = normalizeVector(value);
  return vector.slice(1).map((entry, index) => entry - vector[index]);
}

export function cumulative(values, reducer, initial) {
  const vector = normalizeVector(values);
  const output = [];
  let acc = initial;
  vector.forEach((value, index) => {
    acc = index === 0 && initial == null ? value : reducer(acc, value);
    output.push(acc);
  });
  return output;
}

export function dotProduct(a, b) {
  const left = normalizeVector(a);
  const right = normalizeVector(b);
  const length = Math.min(left.length, right.length);
  return Array.from({ length }, (_, index) => left[index] * right[index]).reduce(
    (sum, value) => sum + value,
    0,
  );
}

export function crossProduct(a, b) {
  const [ax, ay, az] = normalizeVector(a);
  const [bx, by, bz] = normalizeVector(b);
  return [
    ay * bz - az * by,
    az * bx - ax * bz,
    ax * by - ay * bx,
  ];
}

export function dotMultiply(a, b) {
  const pa = toPlain(a), pb = toPlain(b);
  if (Array.isArray(pa) && Array.isArray(pb)) {
    if (Array.isArray(pa[0]))
      return pa.map((row, i) => row.map((v, j) => v * (pb[i]?.[j] ?? pb[i] ?? pb)));
    return pa.map((v, i) => v * (Array.isArray(pb) ? pb[i] : pb));
  }
  if (Array.isArray(pa)) return pa.map(v => v * Number(pb));
  if (Array.isArray(pb)) return pb.map(v => Number(pa) * v);
  return Number(pa) * Number(pb);
}

export function dotDivide(a, b) {
  const pa = toPlain(a), pb = toPlain(b);
  if (Array.isArray(pa) && Array.isArray(pb)) {
    if (Array.isArray(pa[0]))
      return pa.map((row, i) => row.map((v, j) => v / (pb[i]?.[j] ?? pb[i] ?? pb)));
    return pa.map((v, i) => v / (Array.isArray(pb) ? pb[i] : pb));
  }
  if (Array.isArray(pa)) return pa.map(v => v / Number(pb));
  if (Array.isArray(pb)) return pb.map(v => Number(pa) / v);
  return Number(pa) / Number(pb);
}

export function dotPow(a, b) {
  const pa = toPlain(a), pb = toPlain(b);
  if (Array.isArray(pa) && Array.isArray(pb))
    return pa.map((v, i) =>
      Array.isArray(v)
        ? v.map((u, j) => u ** realValue(pb[i]?.[j] ?? pb[i] ?? pb))
        : v ** realValue(pb[i] ?? pb));
  if (Array.isArray(pa))
    return pa.map(v => Array.isArray(v) ? v.map(u => u ** Number(pb)) : v ** Number(pb));
  if (Array.isArray(pb)) return pb.map(v => Number(pa) ** v);
  return Number(pa) ** Number(pb);
}

// ── Polynomial & interpolation ────────────────────────────────────────────────

export function polyfit(xValues, yValues, degree) {
  const x = normalizeVector(xValues);
  const y = normalizeVector(yValues);
  const n = Math.max(0, Math.round(Number(degree)));
  const vandermonde = x.map((value) =>
    Array.from({ length: n + 1 }, (_, index) => value ** (n - index)),
  );
  const coeffs = toPlain(math.multiply(math.pinv(vandermonde), y));
  return normalizeVector(coeffs);
}

export function polyval(coefficients, xValues) {
  const coeffs = normalizeVector(coefficients);
  return normalizeVector(xValues).map((value) =>
    coeffs.reduce((acc, coefficient) => acc * value + coefficient, 0),
  );
}

export function interp1Array(x, y, xi) {
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

export function trapzArray(x, y = null) {
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

export function gradientArray(value, spacing = 1) {
  const v = normalizeVector(value);
  if (v.length <= 1) return v.map(() => 0);
  const h = Number(spacing) || 1;
  return v.map((entry, index) => {
    if (index === 0) return (v[1] - v[0]) / h;
    if (index === v.length - 1) return (v[index] - v[index - 1]) / h;
    return (v[index + 1] - v[index - 1]) / (2 * h);
  });
}

// ── Statistics ────────────────────────────────────────────────────────────────

export function statMean(value) {
  const v = normalizeVector(value);
  return v.reduce((a, b) => a + b, 0) / v.length;
}
export function statMedian(value) {
  const v = [...normalizeVector(value)].sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 === 0 ? (v[m - 1] + v[m]) / 2 : v[m];
}
export function statStd(value, flag = 0) {
  const v = normalizeVector(value);
  const mu = statMean(v);
  const denom = flag === 1 ? v.length : v.length - 1;
  return Math.sqrt(v.reduce((s, x) => s + (x - mu) ** 2, 0) / denom);
}
export function statVar(value, flag = 0) { return statStd(value, flag) ** 2; }
export function statMin(value) {
  const v = normalizeVector(value);
  return Array.isArray(toPlain(value)) ? Math.min(...v) : v[0];
}
export function statMax(value) {
  const v = normalizeVector(value);
  return Array.isArray(toPlain(value)) ? Math.max(...v) : v[0];
}
export function statSum(value) { return normalizeVector(value).reduce((a, b) => a + b, 0); }
export function statProd(value) { return normalizeVector(value).reduce((a, b) => a * b, 1); }
export function statSort(value, dir = "ascend") {
  const v = [...normalizeVector(value)];
  v.sort((a, b) => a - b);
  return dir === "descend" ? v.reverse() : v;
}
export function statUnique(value) { return [...new Set(normalizeVector(value))].sort((a, b) => a - b); }
export function statMod(a, b) { return ((Number(a) % Number(b)) + Number(b)) % Number(b); }
export function statRem(a, b) { return Number(a) % Number(b); }
export function statFix(value) {
  const fn = (x) => x >= 0 ? Math.floor(x) : Math.ceil(x);
  return isCollection(value) ? mapDeep(value, fn) : fn(Number(value));
}
export function statAny(value) { return normalizeVector(value).some(Boolean) ? 1 : 0; }
export function statAll(value) { return normalizeVector(value).every(Boolean) ? 1 : 0; }
export function statFind(value) {
  const v = normalizeVector(value);
  return v.map((x, i) => (x ? i + 1 : null)).filter((x) => x !== null);
}

export function reshapeArray(value, rows, cols) {
  const flat = normalizeVector(value);
  const r = Number(rows), c = Number(cols);
  const out = [];
  for (let i = 0; i < r; i++) {
    out.push(flat.slice(i * c, i * c + c));
  }
  return out;
}

export function repmatArray(value, m, n) {
  const plain = toPlain(value);
  const isVec = !isMatrix(plain);
  const mat = isVec ? [normalizeVector(plain)] : plain;
  const rowRep = Array.from({ length: m }, () => mat).flat();
  return rowRep.map((row) => Array.from({ length: n }, () => row).flat());
}

export function histArray(value, bins = 10) {
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

export function companionRoots(coefficients) {
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

// ── Linear algebra ────────────────────────────────────────────────────────────

export function rrefMatrix(value, tolerance = 1e-10) {
  const matrix = toNumericMatrix(value);
  if (!matrix?.length) return { matrix: [], pivots: [], steps: [] };
  const out = matrix.map((row) => [...row]);
  const rowCount = out.length;
  const colCount = Math.max(...out.map((row) => row.length), 0);
  out.forEach((row) => { while (row.length < colCount) row.push(0); });
  const steps = [];
  const pivots = [];
  let lead = 0;
  for (let row = 0; row < rowCount && lead < colCount; row += 1) {
    let pivotRow = row;
    while (pivotRow < rowCount && Math.abs(out[pivotRow][lead]) <= tolerance) pivotRow += 1;
    while (pivotRow === rowCount) {
      lead += 1;
      if (lead >= colCount) return { matrix: out, pivots, steps };
      pivotRow = row;
      while (pivotRow < rowCount && Math.abs(out[pivotRow][lead]) <= tolerance) pivotRow += 1;
    }
    if (pivotRow !== row) {
      [out[row], out[pivotRow]] = [out[pivotRow], out[row]];
      steps.push({ type: "swap", label: `Swap R${row + 1} and R${pivotRow + 1}`, matrix: out.map((e) => [...e]) });
    }
    const pivot = out[row][lead];
    if (Math.abs(pivot - 1) > tolerance) {
      for (let col = 0; col < colCount; col += 1) out[row][col] /= pivot;
      steps.push({ type: "scale", label: `Scale R${row + 1} by 1/${Number(pivot.toFixed(6))}`, matrix: out.map((e) => [...e]) });
    }
    for (let other = 0; other < rowCount; other += 1) {
      if (other === row) continue;
      const factor = out[other][lead];
      if (Math.abs(factor) <= tolerance) continue;
      for (let col = 0; col < colCount; col += 1) {
        out[other][col] -= factor * out[row][col];
        if (Math.abs(out[other][col]) <= tolerance) out[other][col] = 0;
      }
      steps.push({ type: "eliminate", label: `R${other + 1} = R${other + 1} - (${Number(factor.toFixed(6))}) R${row + 1}`, matrix: out.map((e) => [...e]) });
    }
    pivots.push({ row, col: lead });
    lead += 1;
  }
  return { matrix: out, pivots, steps };
}

function computeSvdFallback(A) {
  const matrix = toNumericMatrix(A);
  if (!matrix?.length) return { U: [], S: [], V: [] };
  const m = matrix.length;
  const n = Math.max(...matrix.map((row) => row.length), 0);
  const padded = matrix.map((row) => [...row, ...Array(Math.max(0, n - row.length)).fill(0)]);
  const AT = toPlain(math.transpose(padded));
  const ATA = toPlain(math.multiply(AT, padded));
  const eig = math.eigs(ATA);
  const eigenPairs = (eig.eigenvectors || [])
    .map((entry, index) => {
      const value = Math.max(0, realValue(eig.values?.[index] ?? entry.value ?? 0));
      const vector = normalizeVector(entry.vector ?? []);
      return { value, sigma: Math.sqrt(value), vector };
    })
    .sort((a, b) => b.sigma - a.sigma);
  const Vcols = eigenPairs.map((pair) => {
    const norm = Math.hypot(...pair.vector) || 1;
    return pair.vector.map((entry) => entry / norm);
  });
  const singular = eigenPairs.map((pair) => pair.sigma);
  const Ucols = Vcols.map((vCol, index) => {
    const sigma = singular[index];
    const Av = normalizeVector(toPlain(math.multiply(padded, vCol)));
    if (sigma <= 1e-12) return Array.from({ length: m }, (_, row) => (row === index ? 1 : 0));
    return Av.map((entry) => entry / sigma);
  });
  const U = Ucols.length ? toPlain(math.transpose(Ucols)) : Array.from({ length: m }, () => []);
  const V = Vcols.length ? toPlain(math.transpose(Vcols)) : Array.from({ length: n }, () => []);
  return { U, S: makeDiagonal(singular), V };
}

function computeSvd(A) {
  if (typeof math.svd === "function") {
    const result = math.svd(A);
    return {
      U: toPlain(result.U),
      S: Array.isArray(result.S?.[0]) ? toPlain(result.S) : makeDiagonal(toPlain(result.S)),
      V: toPlain(result.V),
    };
  }
  return computeSvdFallback(A);
}

export function singularValues(A) {
  const result = computeSvd(A);
  return normalizeVector(math.diag(result.S)).map((entry) => Math.abs(Number(entry)));
}

export function matrixRank(A, tolerance = null) {
  const s = singularValues(A);
  const max = Math.max(...s, 0);
  const tol = tolerance == null ? max * Math.max(inferSize(A)[0], inferSize(A)[1]) * 1e-10 : Number(tolerance);
  return s.filter((entry) => entry > tol).length;
}

export function conditionNumber(A) {
  const s = singularValues(A).filter((entry) => entry > 1e-12);
  if (!s.length) return Infinity;
  return Math.max(...s) / Math.min(...s);
}

export function determinantValue(value) {
  const matrix = toNumericMatrix(value);
  if (!matrix?.length || !matrix.every((row) => row.length === matrix.length)) return null;
  try {
    return realValue(toPlain(math.det(matrix)));
  } catch {
    return null;
  }
}

export function luFactorization(value, tolerance = 1e-12) {
  const matrix = toNumericMatrix(value);
  if (!matrix?.length || !matrix.every((row) => row.length === matrix.length)) {
    throw new Error("lu(A) requires a square numeric matrix.");
  }
  const n = matrix.length;
  const U = matrix.map((row) => [...row]);
  const L = Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => (row === col ? 1 : 0)),
  );
  const P = Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => (row === col ? 1 : 0)),
  );
  for (let pivot = 0; pivot < n; pivot += 1) {
    let pivotRow = pivot;
    let maxEntry = Math.abs(U[pivot][pivot]);
    for (let row = pivot + 1; row < n; row += 1) {
      const entry = Math.abs(U[row][pivot]);
      if (entry > maxEntry) { maxEntry = entry; pivotRow = row; }
    }
    if (maxEntry <= tolerance) throw new Error("lu(A) failed because the matrix is singular or nearly singular.");
    if (pivotRow !== pivot) {
      [U[pivot], U[pivotRow]] = [U[pivotRow], U[pivot]];
      [P[pivot], P[pivotRow]] = [P[pivotRow], P[pivot]];
      for (let col = 0; col < pivot; col += 1) {
        [L[pivot][col], L[pivotRow][col]] = [L[pivotRow][col], L[pivot][col]];
      }
    }
    for (let row = pivot + 1; row < n; row += 1) {
      const factor = U[row][pivot] / U[pivot][pivot];
      L[row][pivot] = factor;
      for (let col = pivot; col < n; col += 1) {
        U[row][col] -= factor * U[pivot][col];
      }
    }
  }
  return { __multi: [L, U, P], L, U, P };
}

export function orthonormalBasis(A, mode = "orth") {
  const { U, V, S } = computeSvd(A);
  const singular = normalizeVector(math.diag(S)).map((entry) => Math.abs(Number(entry)));
  const tol = Math.max(...singular, 0) * Math.max(inferSize(A)[0], inferSize(A)[1]) * 1e-10;
  const source = mode === "null" ? toPlain(V) : toPlain(U);
  const columns = math.transpose(source);
  const keep = columns.filter((_, index) =>
    mode === "null" ? singular[index] <= tol : singular[index] > tol,
  );
  return keep.length ? math.transpose(keep) : [];
}

export function svdDecomp(A) {
  const { U, S, V } = computeSvd(A);
  return { __multi: [U, S, V], U, S, V };
}

// ── Formatting & workspace ────────────────────────────────────────────────────

export function sprintfFormat(fmt, ...args) {
  let i = 0;
  return String(fmt).replace(/%[\d.]*[diouxXeEfgGs]/g, (m) => {
    const val = args[i++];
    if (val == null) return m;
    if (m.endsWith("d") || m.endsWith("i")) return Math.round(Number(val)).toString();
    if (m.endsWith("f") || m.endsWith("e") || m.endsWith("g")) {
      const prec = (m.match(/\.(\d+)/) || [, "6"])[1];
      return Number(val).toFixed(Number(prec));
    }
    return String(val);
  });
}

export function formatValue(value) {
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

export function inferClass(value) {
  const plain = toPlain(value);
  if (plain == null) return "null";
  if (typeof plain === "number") return "double";
  if (typeof plain === "string") return "char";
  if (typeof plain === "boolean") return "logical";
  if (isComplexLike(plain)) return "complex double";
  if (Array.isArray(plain)) return "double array";
  if (plain?.__multi) return "tuple";
  return typeof plain;
}

export function estimateBytes(value) {
  const plain = toPlain(value);
  try {
    return new Blob([JSON.stringify(plain)]).size;
  } catch {
    return 0;
  }
}

export function summarizeValue(value) {
  const text = formatValue(value).replace(/\s+/g, " ").trim();
  return text.length > 90 ? `${text.slice(0, 87)}...` : text || "(empty)";
}

export function buildWorkspaceSnapshot(parser, variables) {
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

// ── Figure building ───────────────────────────────────────────────────────────

export const SERIES_COLORS = ["teal", "blue", "amber", "purple", "red", "green"];

export function makePlotState() {
  return { series: [], hold: false, title: "", xlabel: "", ylabel: "", legend: [], grid: true, xlim: null, ylim: null, axisMode: "auto" };
}

export function buildFigureFromPlotState(plotState) {
  if (plotState.series.length === 0) return null;
  const xs = plotState.series.flatMap((series) =>
    series.kind === "bar" ? series.values.map((_, index) => index) : series.x,
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
  if (xmin === xmax) { xmin -= 1; xmax += 1; }
  if (ymin === ymax) { ymin -= 1; ymax += 1; }
  const isTight = plotState.axisMode === "tight";
  const padX = (xmax - xmin) * (isTight ? 0.02 : 0.08);
  const padY = (ymax - ymin) * (isTight ? 0.02 : 0.15);
  const xBounds = plotState.xlim?.length === 2 ? plotState.xlim : [xmin - padX, xmax + padX];
  const yBounds = plotState.ylim?.length === 2 ? plotState.ylim : [ymin - padY, ymax + padY];
  const elements = [];
  if (plotState.grid) {
    elements.push({ type: "grid", step: Math.max((xBounds[1] - xBounds[0]) / 8, 1e-6), color: "border" });
  }
  elements.push({ type: "axes", labels: true, ticks: true });
  plotState.series.forEach((series, index) => {
    const color = SERIES_COLORS[index % SERIES_COLORS.length];
    if (series.kind === "plot") {
      elements.push({ type: "curve", xs: series.x, ys: series.y, color, width: 2.5, label: series.label || null });
    } else if (series.kind === "area") {
      elements.push({ type: "curve", xs: series.x, ys: series.y, color, width: 2.5, fill: true, fill_alpha: 0.18, label: series.label || null });
    } else if (series.kind === "scatter") {
      elements.push({ type: "scatter", xs: series.x, ys: series.y, color, radius: 4, labels: null });
    } else if (series.kind === "stem") {
      series.x.forEach((x, stemIndex) => {
        elements.push({ type: "line", start: [x, 0], end: [x, series.y[stemIndex]], color, width: 1.5 });
      });
      elements.push({ type: "scatter", xs: series.x, ys: series.y, color, radius: 4, labels: null });
    } else if (series.kind === "bar") {
      elements.push({ type: "bars", labels: series.labels, values: series.values, color, alpha: 0.8 });
    }
  });
  if (plotState.xlabel) {
    elements.push({ type: "text", pos: [(xmin + xmax) / 2, ymin - padY * 0.55], content: plotState.xlabel, color: "muted", size: 12 });
  }
  if (plotState.ylabel) {
    elements.push({ type: "text", pos: [xmin - padX * 0.35, (ymin + ymax) / 2], content: plotState.ylabel, color: "muted", size: 12 });
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

// ── 3D surface/curve config ───────────────────────────────────────────────────

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
    if (plain.length === cols) return Array.from({ length: rows }, () => [...plain]);
    if (plain.length === rows) return plain.map((entry) => Array.from({ length: cols }, () => entry));
    return fallback;
  };
  return {
    X: x == null ? defaultX : expandGrid(x, defaultX),
    Y: y == null ? defaultY : expandGrid(y, defaultY),
    Z,
  };
}

export function convertSurfaceTo3DConfig(kind, args, plotState) {
  let X, Y, Z;
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
    functions: [{
      id: Date.now(),
      latex: kind === "mesh" ? "mesh data" : "surface data",
      color: "#6366f1",
      visible: true,
      wireframe: kind === "mesh",
      opacity: kind === "mesh" ? 1 : 0.82,
      surfaceData,
    }],
    settings: {
      range: Math.max(surfaceData.Z.length, surfaceData.Z[0]?.length || 10),
      resolution: Math.min(128, Math.max(surfaceData.Z.length, surfaceData.Z[0]?.length || 32)),
    },
  };
}

export function convertPointSeries3DConfig(kind, args, plotState) {
  const xs = normalizeVector(args[0]).map(Number);
  const ys = normalizeVector(args[1]).map(Number);
  const zs = normalizeVector(args[2]).map(Number);
  const count = Math.min(xs.length, ys.length, zs.length);
  const extent = [...xs.slice(0, count), ...ys.slice(0, count), ...zs.slice(0, count)].filter((value) => Number.isFinite(value));
  const maxAbs = extent.length ? Math.max(...extent.map((value) => Math.abs(value))) : 10;
  return {
    mode: "3d",
    title: plotState.title || `OpenMAT ${kind === "scatter3" ? "3D Scatter" : "3D Curve"}`,
    replace: true,
    functions: [{
      id: Date.now(),
      latex: kind === "scatter3" ? "scatter3 data" : "plot3 data",
      color: kind === "scatter3" ? "#f97316" : "#22c55e",
      visible: true,
      opacity: kind === "scatter3" ? 0.95 : 1,
      plotType: kind === "scatter3" ? "scatter3" : "line3",
      xs: xs.slice(0, count),
      ys: ys.slice(0, count),
      zs: zs.slice(0, count),
      pointSize: kind === "scatter3" ? 0.14 : 0.1,
    }],
    settings: {
      range: Math.max(10, Math.ceil(maxAbs * 2.4)),
      resolution: 64,
    },
  };
}

// ── Compatibility warnings ────────────────────────────────────────────────────

export function detectMatlabCompatibilityWarnings(source) {
  const text = String(source || "");
  const checks = [
    { pattern: /\b(syms?|vpa|dsolve|simplify|factor|expand|collect|subs)\b/i, message: "This script looks symbolic. OpenMAT is numeric-first, so Symbolic Math Toolbox style commands may need CAS mode or a rewrite." },
    { pattern: /\b(classdef|properties|methods|events)\b/i, message: "MATLAB class-based code is not supported yet in OpenMAT. Flatten the lesson code into plain scripts and functions first." },
    { pattern: /\b(readtable|writetable|table|timetable|readmatrix|writematrix|xlsread|xlswrite)\b/i, message: "This script uses MATLAB table/file I/O helpers. OpenMAT currently works best with imported CSV data and plain matrices." },
    { pattern: /\b(ode45|ode23|pdepe|fmincon|lsqnonlin|tf|ss|bode|lsim|fft2|imread|imshow)\b/i, message: "This script calls a MATLAB toolbox/helper that OpenMAT does not fully match yet. Keep the numeric core and replace toolbox-specific calls." },
    { pattern: /\bspdiags|sparse|symamd|cholinc\b/i, message: "Sparse and advanced matrix-structure helpers are only partially supported right now." },
  ];
  return checks.filter((check) => check.pattern.test(text)).map((check) => check.message);
}

// ── Block parser ──────────────────────────────────────────────────────────────

export function parseBlocks(lines) {
  const stack = [{ type: "root", body: [] }];
  const top = () => stack[stack.length - 1];

  const getTargetBody = (node) => {
    if (node.type === "if") return node.elseBody !== null ? node.elseBody : node.branches[node.branches.length - 1].body;
    if (node.type === "try") return node._state === "catch" ? node.catchBody : node.tryBody;
    if (node.type === "switch") {
      if (node.otherwise !== null) return node.otherwise;
      if (node._lastCase) return node._lastCase.body;
      return [];
    }
    return node.body;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    const stripped = raw.replace(/%.*$/, "").trim();
    if (!stripped) continue;
    const lower = stripped.toLowerCase();

    const fnMatch = stripped.match(/^function\s+(?:\[([^\]]*)\]\s*=\s*|([A-Za-z_]\w*)\s*=\s*)?([A-Za-z_]\w*)\s*\(([^)]*)\)/i);
    if (fnMatch) {
      const outMulti = fnMatch[1] ? fnMatch[1].split(",").map(s => s.trim()).filter(Boolean) : null;
      const outSingle = fnMatch[2] ? [fnMatch[2].trim()] : null;
      const outs = outMulti || outSingle || [];
      const node = { type: "function", name: fnMatch[3], ins: fnMatch[4].split(",").map(s => s.trim()).filter(Boolean), outs, body: [], lineNo };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    const forMatch = stripped.match(/^for\s+([A-Za-z_]\w*)\s*=\s*(.+)$/i);
    if (forMatch) {
      const node = { type: "for", varName: forMatch[1], iterExpr: forMatch[2], body: [], lineNo };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    const whileMatch = stripped.match(/^while\s+(.+)$/i);
    if (whileMatch) {
      const node = { type: "while", condExpr: whileMatch[1], body: [], lineNo };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    const ifMatch = stripped.match(/^if\s+(.+)$/i);
    if (ifMatch) {
      const node = { type: "if", branches: [{ cond: ifMatch[1], body: [], lineNo }], elseBody: null, lineNo };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    const elseifMatch = stripped.match(/^elseif\s+(.+)$/i);
    if (elseifMatch) {
      const ifNode = top();
      if (ifNode.type === "if") ifNode.branches.push({ cond: elseifMatch[1], body: [], lineNo });
      continue;
    }

    if (lower === "else") { const ifNode = top(); if (ifNode.type === "if") ifNode.elseBody = []; continue; }

    // try block
    if (lower === "try") {
      const node = { type: "try", tryBody: [], catchVar: null, catchBody: null, _state: "try", lineNo };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // catch [errvar]
    const catchMatch = stripped.match(/^catch(?:\s+([A-Za-z_]\w*))?$/i);
    if (catchMatch) {
      const tryNode = top();
      if (tryNode.type === "try") {
        tryNode.catchVar = catchMatch[1] || null;
        tryNode.catchBody = [];
        tryNode._state = "catch";
      }
      continue;
    }

    // switch expr
    const switchMatch = stripped.match(/^switch\s+(.+)$/i);
    if (switchMatch) {
      const node = { type: "switch", expr: switchMatch[1], cases: [], otherwise: null, _lastCase: null, lineNo };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // case val (inside switch)
    const caseMatch = stripped.match(/^case\s+(.+)$/i);
    if (caseMatch) {
      const swNode = top();
      if (swNode.type === "switch") {
        const newCase = { val: caseMatch[1], body: [] };
        swNode.cases.push(newCase);
        swNode._lastCase = newCase;
      }
      continue;
    }

    // otherwise (inside switch)
    if (lower === "otherwise") {
      const swNode = top();
      if (swNode.type === "switch") { swNode.otherwise = []; swNode._lastCase = null; }
      continue;
    }

    if (lower === "end") { if (stack.length > 1) stack.pop(); continue; }

    if (lower === "break") { getTargetBody(top()).push({ type: "break", lineNo }); continue; }
    if (lower === "continue") { getTargetBody(top()).push({ type: "continue", lineNo }); continue; }
    if (lower === "return") { getTargetBody(top()).push({ type: "return", lineNo }); continue; }
    getTargetBody(top()).push({ type: "line", raw: stripped, lineNo });
  }
  return stack[0].body;
}

// ── Line preprocessor ─────────────────────────────────────────────────────────

function splitTopLevel(text, separators) {
  const rows = [];
  let current = "";
  let depthParen = 0, depthBracket = 0, depthBrace = 0, quote = null;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quote) { current += char; if (char === quote) quote = null; continue; }
    if (char === "'" || char === '"') { quote = char; current += char; continue; }
    if (char === "(") depthParen += 1;
    else if (char === ")") depthParen = Math.max(0, depthParen - 1);
    else if (char === "[") depthBracket += 1;
    else if (char === "]") depthBracket = Math.max(0, depthBracket - 1);
    else if (char === "{") depthBrace += 1;
    else if (char === "}") depthBrace = Math.max(0, depthBrace - 1);
    const topLevel = depthParen === 0 && depthBracket === 0 && depthBrace === 0;
    if (topLevel && separators.includes(char)) { rows.push(current.trim()); current = ""; continue; }
    current += char;
  }
  rows.push(current.trim());
  return rows.filter(Boolean);
}

function splitTopLevelCells(row) {
  const cells = [];
  let current = "";
  let depthParen = 0, depthBracket = 0, depthBrace = 0, quote = null;
  const pushCell = () => { const trimmed = current.trim(); if (trimmed) cells.push(trimmed); current = ""; };
  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    if (quote) { current += char; if (char === quote) quote = null; continue; }
    if (char === "'" || char === '"') { quote = char; current += char; continue; }
    if (char === "(") depthParen += 1;
    else if (char === ")") depthParen = Math.max(0, depthParen - 1);
    else if (char === "[") depthBracket += 1;
    else if (char === "]") depthBracket = Math.max(0, depthBracket - 1);
    else if (char === "{") depthBrace += 1;
    else if (char === "}") depthBrace = Math.max(0, depthBrace - 1);
    const topLevel = depthParen === 0 && depthBracket === 0 && depthBrace === 0;
    if (topLevel && char === ",") { pushCell(); continue; }
    if (topLevel && /\s/.test(char)) {
      const next = row.slice(index).match(/^\s+/)?.[0] || "";
      const nextChar = row[index + next.length];
      if (current.trim() && nextChar && nextChar !== "," && nextChar !== ";") {
        // Only split if the next token looks like a new operand (letter, digit, open bracket)
        // AND the current token ends with an operand (letter, digit, close bracket, quote).
        // If the next char is an operator (+, -, *, /, ^, ., &, |, ~, <, >, =)
        // then this is a binary operator — stay in the same cell so [a + b] isn't split
        // into the three nonsensical cells [a, +, b].
        const nextIsOperandStart = /[A-Za-z0-9(\[{]/.test(nextChar);
        const lastCurChar = current.trimEnd().slice(-1);
        const curEndsWithOperand = /[A-Za-z0-9\])'"]/.test(lastCurChar);
        if (nextIsOperandStart && curEndsWithOperand) pushCell();
      }
      index += next.length - 1;
      continue;
    }
    current += char;
  }
  pushCell();
  return cells;
}

function normalizeMatrixSyntax(line) {
  return line.replace(/\[([^[\]]+)\]/g, (_, inner) => {
    const rows = splitTopLevel(inner, ";").map((row) => splitTopLevelCells(row).join(", "));
    return `[${rows.join("; ")}]`;
  });
}

function normalizeElementwiseOperators(line) {
  return line
    .replace(/([A-Za-z0-9_\]\)])\s*\.\s*\^\s*/g, "$1.^")
    .replace(/([A-Za-z0-9_\]\)])\s*\.\s*\*\s*/g, "$1.*")
    .replace(/([A-Za-z0-9_\]\)])\s*\.\s*\/\s*/g, "$1./");
}

function replaceElementwiseBinaryOperators(line) {
  const operatorMap = { ".^": "dotPow", ".*": "dotMultiply", "./": "dotDivide" };
  const scanLeft = (text, from) => {
    let index = from;
    while (index >= 0 && /\s/.test(text[index])) index -= 1;
    if (index < 0) return null;
    const end = index + 1;
    if (text[index] === ")" || text[index] === "]") {
      const close = text[index];
      const open = close === ")" ? "(" : "[";
      let depth = 1;
      index -= 1;
      while (index >= 0 && depth > 0) {
        if (text[index] === close) depth += 1;
        else if (text[index] === open) depth -= 1;
        index -= 1;
      }
      let start = index + 1;
      while (start > 0 && /[\w.]/.test(text[start - 1])) start -= 1;
      return { start, end };
    }
    while (index >= 0 && /[\w.\]]/.test(text[index])) index -= 1;
    return { start: index + 1, end };
  };
  const scanRight = (text, from) => {
    let index = from;
    while (index < text.length && /\s/.test(text[index])) index += 1;
    if (index >= text.length) return null;
    const start = index;
    if (/[A-Za-z_]/.test(text[index])) {
      while (index < text.length && /[\w.]/.test(text[index])) index += 1;
      if (text[index] === "(") {
        let depth = 1; index += 1;
        while (index < text.length && depth > 0) {
          if (text[index] === "(") depth += 1;
          else if (text[index] === ")") depth -= 1;
          index += 1;
        }
      } else {
        while (index < text.length && text[index] === "[") {
          let depth = 1; index += 1;
          while (index < text.length && depth > 0) {
            if (text[index] === "[") depth += 1;
            else if (text[index] === "]") depth -= 1;
            index += 1;
          }
        }
      }
      return { start, end: index };
    }
    if (text[index] === "(" || text[index] === "[") {
      const open = text[index];
      const close = open === "(" ? ")" : "]";
      let depth = 1; index += 1;
      while (index < text.length && depth > 0) {
        if (text[index] === open) depth += 1;
        else if (text[index] === close) depth -= 1;
        index += 1;
      }
      return { start, end: index };
    }
    while (index < text.length && /[\w.]/.test(text[index])) index += 1;
    return { start, end: index };
  };
  let output = line;
  let changed = true;
  while (changed) {
    changed = false;
    let hitIndex = -1, hitToken = null;
    for (const token of Object.keys(operatorMap)) {
      const idx = output.indexOf(token);
      if (idx !== -1 && (hitIndex === -1 || idx < hitIndex)) { hitIndex = idx; hitToken = token; }
    }
    if (hitIndex === -1 || !hitToken) break;
    const left = scanLeft(output, hitIndex - 1);
    const right = scanRight(output, hitIndex + hitToken.length);
    if (!left || !right || left.end <= left.start || right.end <= right.start) break;
    const leftExpr = output.slice(left.start, left.end).trim();
    const rightExpr = output.slice(right.start, right.end).trim();
    output = output.slice(0, left.start) + `${operatorMap[hitToken]}(${leftExpr}, ${rightExpr})` + output.slice(right.end);
    changed = true;
  }
  return output;
}

function joinContinuationLines(source) {
  return String(source || "").replace(/\.\.\.\s*\r?\n\s*/g, " ");
}

function replaceIndexing(line, variables, functionNames = new Set()) {
  if (variables.size === 0) return line;
  return line.replace(/\b([A-Za-z_]\w*)\s*\(([^()]+)\)/g, (match, name, inner) => {
    if (!variables.has(name) || functionNames.has(name)) return match;
    // Replace MATLAB 'end' keyword with length(name) for last-element access
    const expandedInner = inner.replace(/\bend\b/g, `length(${name})`);
    return `${name}[${expandedInner}]`;
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

export function preprocessLine(line, variables, functionNames = new Set()) {
  let output = line.replace(/%.*$/, "").trim();
  if (!output) return "";
  output = output.replace(/^hold\s+on$/i, "hold('on')");
  output = output.replace(/^hold\s+off$/i, "hold('off')");
  output = output.replace(/^grid\s+on$/i, "grid('on')");
  output = output.replace(/^grid\s+off$/i, "grid('off')");
  output = output.replace(/^axis\s+tight$/i, "axis('tight')");
  output = output.replace(/^axis\s+equal$/i, "axis('equal')");
  output = output.replace(/^axis\s+auto$/i, "axis('auto')");
  output = normalizeElementwiseOperators(output);
  output = replaceElementwiseBinaryOperators(output);
  output = normalizeMatrixSyntax(output);
  output = replaceIndexing(output, variables, functionNames);
  output = replaceBackslash(output);
  return output;
}

export { preprocessLine as normalizeLine };

// ── Engine helpers ────────────────────────────────────────────────────────────

export function registerElementwiseUnary(parser, names) {
  names.forEach((name) => {
    const fn = math[name];
    if (typeof fn !== "function") return;
    parser.set(name, (value) => (isCollection(value) ? mapDeep(value, fn) : fn(value)));
  });
}

export const HELP_TEXT = [
  "Supported MATLAB-like syntax:",
  "",
  "── Language Model ──",
  "OpenMAT is a MATLAB-like dialect built on top of a local math engine.",
  "It is not raw JavaScript, Python, or full MATLAB compatibility.",
  "Docs source of truth: docs/OpenMAT.md",
  "",
  "── Interaction Model ──",
  "Editor tabs hold saved scripts and labs.",
  "Run executes the current script tab and refreshes Figure, Workspace, and Console.",
  "Console runs quick commands against the current workspace without editing the file.",
  "Promote to Script appends the last console command into the active tab.",
  "Workspace shows variables from the latest script run or console command.",
  "Simulation Mode adds a guided panel layer on top of the same session.",
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
  "surf(X,Y,Z)   mesh(X,Y,Z)   surfc(X,Y,Z)",
  "plot3(X,Y,Z)   scatter3(X,Y,Z) -> native OpenMAT 3D viewport",
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

// ── Execution engine ──────────────────────────────────────────────────────────

const BREAK = Symbol("break");
const CONTINUE = Symbol("continue");
const RETURN = Symbol("return");

export function createExecutionEngine(options = {}) {
  const extensions = options.extensions || [];
  const controlValues = options.controlValues || {};
  const parser = math.parser();
  const variables = new Set();
  const functionNames = new Set();
  const logs = [];
  let plot3DRequest = null;
  const controls = [];
  const controlSet = new Set();
  const subplotState = { active: false, rows: 1, cols: 1, slots: [], current: 0 };
  const plotState = makePlotState();
  const initialWorkspace = Array.isArray(options.initialWorkspace) ? options.initialWorkspace : [];

  initialWorkspace.forEach((item) => {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    if (!name) return;
    parser.set(name, toPlain(item.value));
    variables.add(name);
  });

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
        name: key, type,
        min: Math.min(safeMin, safeMax),
        max: Math.max(safeMin, safeMax),
        step: safeStep, value, defaultValue: fallback, ...meta,
      });
      controlSet.add(key);
    }
    return value;
  };

  const clearPlots = () => { Object.assign(plotState, makePlotState()); };

  const registerPlot = (kind, first, second) => {
    if (!plotState.hold) clearPlots();
    if (kind === "bar") {
      const values = normalizeVector(first);
      const labels = second && Array.isArray(second)
        ? second.map(String)
        : values.map((_, index) => String(index + 1));
      plotState.series.push({ kind, values, labels });
      return values;
    }
    const ySeries = second == null ? toColumnSeries(first) : toColumnSeries(second);
    const xBase = second == null ? ySeries[0].map((_, index) => index) : normalizeVector(first);
    const startIndex = plotState.series.length;
    ySeries.forEach((y, seriesIndex) => {
      const x = xBase.slice(0, y.length);
      plotState.series.push({ kind, x, y, label: plotState.legend[startIndex + seriesIndex] || null });
    });
    return ySeries.length === 1 ? ySeries[0] : ySeries;
  };

  registerElementwiseUnary(parser, [
    "sin", "cos", "tan", "asin", "acos", "atan",
    "sinh", "cosh", "tanh", "exp", "log", "log10",
    "sqrt", "abs", "sign", "floor", "ceil", "round", "conj", "re", "im",
  ]);
  parser.set("real", (value) => isCollection(value) ? mapDeep(value, math.re) : math.re(value));
  parser.set("imag", (value) => isCollection(value) ? mapDeep(value, math.im) : math.im(value));

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
  parser.set("cumsum", (value) => cumulative(value, (acc, entry) => acc + entry, null));
  parser.set("cumprod", (value) => cumulative(value, (acc, entry) => acc * entry, null));
  parser.set("dot", (a, b) => dotProduct(a, b));
  parser.set("cross", (a, b) => crossProduct(a, b));
  parser.set("polyfit", (x, y, degree) => polyfit(x, y, degree));
  parser.set("polyval", (coefficients, x) => polyval(coefficients, x));
  parser.set("dotPow", (a, b) => toPlain(math.dotPow(a, b)));
  parser.set("dotMultiply", (a, b) => toPlain(math.dotMultiply(a, b)));
  parser.set("dotDivide", (a, b) => toPlain(math.dotDivide(a, b)));
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
  parser.set("disp", (value) => { logs.push(formatValue(value)); return value; });
  parser.set("help", () => { logs.push(HELP_TEXT); return HELP_TEXT; });
  parser.set("clc", () => { logs.length = 0; return null; });
  parser.set("clf", () => { clearPlots(); return null; });
  parser.set("hold", (mode = "on") => { plotState.hold = String(mode).toLowerCase() === "on"; return plotState.hold; });
  parser.set("grid", (mode = "on") => { plotState.grid = String(mode).toLowerCase() === "on"; return plotState.grid; });
  parser.set("title", (text) => { plotState.title = String(text); return text; });
  parser.set("xlabel", (text) => { plotState.xlabel = String(text); return text; });
  parser.set("ylabel", (text) => { plotState.ylabel = String(text); return text; });
  parser.set("xlim", (min, max) => {
    if (max !== undefined) { plotState.xlim = [Number(min), Number(max)]; }
    else { plotState.xlim = normalizeVector(min).slice(0, 2); }
    return plotState.xlim;
  });
  parser.set("ylim", (min, max) => {
    if (max !== undefined) { plotState.ylim = [Number(min), Number(max)]; }
    else { plotState.ylim = normalizeVector(min).slice(0, 2); }
    return plotState.ylim;
  });
  parser.set("axis", (mode) => {
    if (typeof mode === "string") {
      const normalized = mode.toLowerCase();
      if (["equal", "tight", "auto"].includes(normalized)) {
        plotState.axisMode = normalized;
        if (normalized === "auto") { plotState.xlim = null; plotState.ylim = null; }
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
    plotState.series.forEach((series, index) => { series.label = plotState.legend[index] || series.label; });
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
    const rawValues = toPlain(result.values);
    const values = (Array.isArray(rawValues) ? rawValues : [rawValues]).map(realValue);
    // Build V where each COLUMN is an eigenvector (MATLAB convention)
    const eigvecs = result.eigenvectors.map((entry) => normalizeVector(entry.vector));
    const n = eigvecs[0]?.length || 0;
    const V = Array.from({ length: n }, (_, row) => eigvecs.map((col) => col[row] ?? 0));
    const D = makeDiagonal(values);
    return { __multi: [V, D], values, eigenvectors: eigvecs };
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
  parser.set("rref", (A, tolerance = 1e-10) => rrefMatrix(A, tolerance).matrix);
  parser.set("det", (A) => {
    const determinant = determinantValue(A);
    if (determinant == null) throw new Error("det(A) requires a square numeric matrix.");
    return determinant;
  });
  parser.set("cond", (A) => conditionNumber(A));
  parser.set("orth", (A) => orthonormalBasis(A, "orth"));
  parser.set("null", (A) => orthonormalBasis(A, "null"));
  parser.set("lu", (A) => luFactorization(A));
  parser.set("surf", (...args) => {
    plot3DRequest = convertSurfaceTo3DConfig("surf", args, plotState);
    logs.push("3D surface ready in the OpenMAT viewport.");
    return args[args.length - 1] ?? null;
  });
  parser.set("mesh", (...args) => {
    plot3DRequest = convertSurfaceTo3DConfig("mesh", args, plotState);
    logs.push("3D mesh ready in the OpenMAT viewport.");
    return args[args.length - 1] ?? null;
  });
  parser.set("surfc", (...args) => {
    plot3DRequest = convertSurfaceTo3DConfig("surf", args, plotState);
    logs.push("3D shaded surface ready in the OpenMAT viewport.");
    return args[args.length - 1] ?? null;
  });
  parser.set("plot3", (...args) => {
    plot3DRequest = convertPointSeries3DConfig("plot3", args, plotState);
    logs.push("3D curve ready in the OpenMAT viewport.");
    return args[args.length - 1] ?? null;
  });
  parser.set("scatter3", (...args) => {
    plot3DRequest = convertPointSeries3DConfig("scatter3", args, plotState);
    logs.push("3D scatter ready in the OpenMAT viewport.");
    return args[args.length - 1] ?? null;
  });
  parser.set("slider", (name, min, max, step = 1, defaultValue = null) =>
    registerControl("slider", name, min, max, step, defaultValue),
  );
  parser.set("animate", (name, min, max, step = 1, defaultValue = null, speed = 1, loop = 1) =>
    registerControl("animate", name, min, max, step, defaultValue, {
      speed: Math.abs(Number(speed)) || 1,
      loop: Boolean(Number(loop)),
    }),
  );
  parser.set("whos", () => buildWorkspaceSnapshot(parser, variables));
  parser.set("subplot", (rows, cols, idx) => {
    const r = Number(rows), c = Number(cols), i = Number(idx);
    if (!subplotState.active || subplotState.rows !== r || subplotState.cols !== c) {
      if (subplotState.active && subplotState.current > 0) {
        subplotState.slots[subplotState.current - 1] = { ...makePlotState(), ...plotState, series: [...plotState.series] };
      }
      subplotState.active = true;
      subplotState.rows = r; subplotState.cols = c;
      subplotState.slots = Array.from({ length: r * c }, () => null);
    } else if (subplotState.current > 0) {
      subplotState.slots[subplotState.current - 1] = { ...makePlotState(), ...plotState, series: [...plotState.series] };
    }
    subplotState.current = i;
    Object.assign(plotState, makePlotState());
    return null;
  });
  parser.set("mean", (v) => statMean(v));
  parser.set("median", (v) => statMedian(v));
  parser.set("std", (v, flag = 0) => statStd(v, Number(flag)));
  parser.set("var", (v, flag = 0) => statVar(v, Number(flag)));
  parser.set("min", (v) => statMin(v));
  parser.set("max", (v) => statMax(v));
  parser.set("sum", (v) => statSum(v));
  parser.set("prod", (v) => statProd(v));
  parser.set("sort", (v, dir = "ascend") => statSort(v, String(dir)));
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
    registerPlot("bar", h.__histData.counts, h.__histData.centers.map(x => x.toFixed(2)));
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
    // Treat pure row or column vectors as flat 1D arrays so indexed assignment works
    if (r === 1 || (n != null && c === 1)) return Array(r * c).fill(0);
    return Array.from({ length: r }, () => Array(c).fill(0));
  });
  parser.set("ones", (m, n = null) => {
    const r = Number(m), c = n == null ? r : Number(n);
    if (r === 1 || (n != null && c === 1)) return Array(r * c).fill(1);
    return Array.from({ length: r }, () => Array(c).fill(1));
  });
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

  // ── Constants ────────────────────────────────────────────────────────────────
  parser.set("eps", Number.EPSILON);
  parser.set("Inf", Infinity); parser.set("inf", Infinity);
  parser.set("NaN", NaN); parser.set("nan", NaN);
  parser.set("true", 1); parser.set("false", 0);
  parser.set("pi", Math.PI); parser.set("e", Math.E);

  // ── Extended elementwise math (properly handle matrices) ─────────────────────
  const _ew = (fn) => (v) => isCollection(v) ? mapDeep(v, (x) => fn(Number(x))) : fn(Number(v));
  parser.set("floor", _ew(Math.floor));
  parser.set("ceil",  _ew(Math.ceil));
  parser.set("round", (v, n) => { const p = n != null ? 10 ** Number(n) : 1; return isCollection(v) ? mapDeep(v, (x) => Math.round(Number(x) * p) / p) : Math.round(Number(v) * p) / p; });
  parser.set("sign",  _ew(Math.sign));
  parser.set("sqrt",  _ew(Math.sqrt));
  parser.set("exp",   _ew(Math.exp));
  parser.set("log",   _ew(Math.log));
  parser.set("log2",  _ew(Math.log2));
  parser.set("log10", _ew(Math.log10));
  parser.set("abs", (v) => { const fn = (x) => isComplexLike(x) ? Math.hypot(Number(x.re ?? 0), Number(x.im ?? 0)) : Math.abs(Number(x)); return isCollection(v) ? mapDeep(v, fn) : fn(v); });
  parser.set("real", (v) => { const fn = (x) => isComplexLike(x) ? Number(x.re ?? 0) : Number(x); return isCollection(v) ? mapDeep(v, fn) : fn(v); });
  parser.set("imag", (v) => { const fn = (x) => isComplexLike(x) ? Number(x.im ?? 0) : 0; return isCollection(v) ? mapDeep(v, fn) : fn(v); });
  parser.set("conj", (v) => { const fn = (x) => isComplexLike(x) ? { re: Number(x.re ?? 0), im: -Number(x.im ?? 0) } : x; return isCollection(v) ? mapDeep(v, fn) : fn(v); });
  parser.set("angle", (v) => { const fn = (x) => isComplexLike(x) ? Math.atan2(Number(x.im ?? 0), Number(x.re ?? 0)) : 0; return isCollection(v) ? mapDeep(v, fn) : fn(v); });
  parser.set("atan2", (y, x) => Math.atan2(Number(y), Number(x)));
  parser.set("hypot", (...a) => Math.hypot(...a.map(Number)));
  parser.set("log1p", _ew(Math.log1p));
  parser.set("expm1", _ew(Math.expm1));

  // ── Linear algebra extras ───────────────────────────────────────────────────
  parser.set("norm", (v, p) => {
    const vec = normalizeVector(v);
    const pn = p == null ? 2 : (String(p).toLowerCase() === "inf" ? Infinity : Number(p));
    if (!isFinite(pn)) return pn > 0 ? Math.max(...vec.map(Math.abs)) : Math.min(...vec.map(Math.abs));
    return Math.pow(vec.reduce((s, x) => s + Math.abs(x) ** pn, 0), 1 / pn);
  });
  parser.set("trace", (A) => { const m = toNumericMatrix(A); return m ? m.reduce((s, r, i) => s + (r[i] ?? 0), 0) : 0; });
  parser.set("diag", (v, k = 0) => {
    const plain = toPlain(v); const kn = Number(k) || 0;
    if (isMatrix(plain)) return plain.flatMap((row, i) => { const j = i + kn; return j >= 0 && j < row.length ? [row[j]] : []; });
    return makeDiagonal(v);
  });
  parser.set("triu", (A, k = 0) => { const m = toNumericMatrix(A); if (!m) return []; const kn = Number(k) || 0; return m.map((r, i) => r.map((v, j) => j - i >= kn ? v : 0)); });
  parser.set("tril", (A, k = 0) => { const m = toNumericMatrix(A); if (!m) return []; const kn = Number(k) || 0; return m.map((r, i) => r.map((v, j) => j - i <= kn ? v : 0)); });
  parser.set("fliplr", (v) => { const p = toPlain(v); return isMatrix(p) ? p.map((r) => [...r].reverse()) : [...normalizeVector(v)].reverse(); });
  parser.set("flipud", (v) => { const p = toPlain(v); return isMatrix(p) ? [...p].reverse() : [...normalizeVector(v)].reverse(); });
  parser.set("kron", (A, B) => { const a = toNumericMatrix(A), b = toNumericMatrix(B); if (!a || !b) return []; const res = []; for (const ar of a) { res.push(...b.map((br) => ar.flatMap((av) => br.map((bv) => av * bv)))); } return res; });
  parser.set("linsolve", (A, b) => toPlain(math.lusolve(A, b)));
  parser.set("horzcat", (...args) => {
    const ps = args.map(toPlain);
    if (ps.every((p) => !isMatrix(p))) return ps.flatMap((p) => normalizeVector(p));
    const mats = ps.map((p) => isMatrix(p) ? p : [normalizeVector(p)]);
    return mats[0].map((_, i) => mats.flatMap((m) => m[i] || []));
  });
  parser.set("vertcat", (...args) => args.flatMap((a) => { const p = toPlain(a); return isMatrix(p) ? p : [normalizeVector(p)]; }));
  parser.set("cat", (dim, ...args) => {
    if (Number(dim) === 1) return args.flatMap((a) => { const p = toPlain(a); return isMatrix(p) ? p : [normalizeVector(p)]; });
    const ps = args.map(toPlain);
    if (ps.every((p) => !isMatrix(p))) return ps.flatMap((p) => normalizeVector(p));
    const mats = ps.map((p) => isMatrix(p) ? p : [normalizeVector(p)]);
    return mats[0].map((_, i) => mats.flatMap((m) => m[i] || []));
  });

  // ── Array utilities ─────────────────────────────────────────────────────────
  parser.set("isnan",    (v) => isCollection(v) ? mapDeep(v, (x) => isNaN(Number(x)) ? 1 : 0) : (isNaN(Number(v)) ? 1 : 0));
  parser.set("isinf",    (v) => isCollection(v) ? mapDeep(v, (x) => (!isFinite(Number(x)) && !isNaN(Number(x))) ? 1 : 0) : ((!isFinite(Number(v)) && !isNaN(Number(v))) ? 1 : 0));
  parser.set("isfinite", (v) => isCollection(v) ? mapDeep(v, (x) => isFinite(Number(x)) ? 1 : 0) : (isFinite(Number(v)) ? 1 : 0));
  parser.set("cummax", (v) => { let mx = -Infinity; return normalizeVector(v).map((x) => { mx = Math.max(mx, x); return mx; }); });
  parser.set("cummin", (v) => { let mn = Infinity;  return normalizeVector(v).map((x) => { mn = Math.min(mn, x); return mn; }); });
  parser.set("arrayfun", (f, v, ...rest) => normalizeVector(v).map((x, i) => { const extra = rest.map((r) => normalizeVector(r)[i]); return realValue(toPlain(f(x, ...extra))); }));
  parser.set("cellfun",  (f, v, ...rest) => normalizeVector(v).map((x, i) => { const extra = rest.map((r) => normalizeVector(r)[i]); return realValue(toPlain(f(x, ...extra))); }));
  parser.set("cell",     (m, n) => { const r = Number(m || 1), c = n != null ? Number(n) : r; return Array.from({ length: r }, () => Array(c).fill(null)); });

  // ── Bitwise / logical ───────────────────────────────────────────────────────
  parser.set("bitand",  (a, b)    => (Number(a) | 0) & (Number(b) | 0));
  parser.set("bitor",   (a, b)    => (Number(a) | 0) | (Number(b) | 0));
  parser.set("bitxor",  (a, b)    => (Number(a) | 0) ^ (Number(b) | 0));
  parser.set("bitshift",(a, n)    => { const nn = Number(n); return nn >= 0 ? (Number(a)|0) << nn : (Number(a)|0) >> (-nn); });
  parser.set("xor",     (a, b)    => (Boolean(a) !== Boolean(b)) ? 1 : 0);
  parser.set("not",     (v)       => isCollection(v) ? mapDeep(v, (x) => x ? 0 : 1) : (v ? 0 : 1));

  // ── String utilities ────────────────────────────────────────────────────────
  parser.set("strcmp",    (a, b)       => String(a) === String(b) ? 1 : 0);
  parser.set("strcmpi",   (a, b)       => String(a).toLowerCase() === String(b).toLowerCase() ? 1 : 0);
  parser.set("strcat",    (...a)       => a.map(String).join(""));
  parser.set("strtrim",   (s)          => String(s).trim());
  parser.set("upper",     (s)          => String(s).toUpperCase());
  parser.set("lower",     (s)          => String(s).toLowerCase());
  parser.set("strsplit",  (s, d = " ") => String(s).split(String(d)));
  parser.set("strrep",    (s, o, r)    => String(s).split(String(o)).join(String(r)));
  parser.set("strfind",   (s, p)       => { const str = String(s), pat = String(p); const idxs = []; let i = 0; while ((i = str.indexOf(pat, i)) !== -1) { idxs.push(i + 1); i++; } return idxs; });
  parser.set("contains",  (s, p)       => String(s).includes(String(p)) ? 1 : 0);
  parser.set("num2str",   (v, fmt) => {
    if (fmt != null) { if (typeof fmt === "number") return Number(v).toFixed(Math.round(fmt)); return sprintfFormat(`%${fmt}`, v); }
    const n = Number(v); return Number.isInteger(n) ? String(n) : parseFloat(n.toPrecision(5)).toString();
  });
  parser.set("str2double", (s) => Number(s));
  parser.set("char", (v) => { if (typeof v === "number") return String.fromCharCode(v); return normalizeVector(v).map((x) => String.fromCharCode(Number(x))).join(""); });
  parser.set("int2str", (v) => String(Math.round(Number(v))));

  // ── Timing ──────────────────────────────────────────────────────────────────
  const _ticStart = { t: 0 };
  parser.set("tic",   () => { _ticStart.t = Date.now(); return null; });
  parser.set("toc",   () => (Date.now() - _ticStart.t) / 1000);
  parser.set("clock", () => { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()]; });

  // ── I/O stubs ───────────────────────────────────────────────────────────────
  parser.set("input",  (prompt) => { logs.push(`input('${prompt}'): interactive input not supported — returning 0.`); return 0; });
  parser.set("pause",  () => null);
  parser.set("figure", (n)      => { logs.push(`figure(${n != null ? n : ""}): multiple figure windows not yet supported.`); return null; });
  parser.set("format", () => null);

  // ── Plot extras ─────────────────────────────────────────────────────────────
  parser.set("semilogy",  (...args) => registerPlot("plot", args[0], args[1]));
  parser.set("semilogx",  (...args) => registerPlot("plot", args[0], args[1]));
  parser.set("loglog",    (...args) => registerPlot("plot", args[0], args[1]));
  parser.set("errorbar",  (...args) => registerPlot("plot", args[0], args[1]));
  parser.set("fill",      (...args) => registerPlot("area", args[0], args[1]));
  parser.set("contour",   (...args) => { logs.push("contour: rendered as 3D surface."); plot3DRequest = convertSurfaceTo3DConfig("surf", args.slice(0, 3), plotState); return null; });
  parser.set("contourf",  (...args) => { logs.push("contourf: rendered as 3D surface."); plot3DRequest = convertSurfaceTo3DConfig("surf", args.slice(0, 3), plotState); return null; });
  parser.set("imagesc",   (Z)       => { logs.push("imagesc: rendered as heatmap surface."); plot3DRequest = convertSurfaceTo3DConfig("surf", [Z], plotState); return null; });
  parser.set("quiver",    () => { logs.push("quiver: vector field not yet rendered."); return null; });
  parser.set("polarplot", (...args) => registerPlot("plot", args[0], args[1]));
  parser.set("pie",       (v)       => registerPlot("bar", v, null));
  parser.set("colorbar",  () => null);
  parser.set("colormap",  () => null);
  parser.set("shading",   () => null);
  parser.set("sgtitle",   (t)       => { plotState.title = String(t); return t; });
  parser.set("text",      () => null);
  parser.set("gca",       () => null);
  parser.set("gcf",       () => null);
  parser.set("set",       () => null);
  parser.set("get",       () => null);
  parser.set("drawnow",   () => null);
  parser.set("print",     () => null);
  parser.set("saveas",    () => null);

  // ── Numerical methods ───────────────────────────────────────────────────────
  // ode45: RK4 fixed-step solver
  parser.set("ode45", (f, tspan, y0) => {
    const tv = normalizeVector(tspan), t0 = tv[0], tf = tv[tv.length - 1];
    const yInit = normalizeVector(y0);
    const steps = Math.min(5000, Math.max(50, Math.ceil(Math.abs(tf - t0) / 0.01)));
    const h = (tf - t0) / steps;
    const T = [t0], Y = [yInit.slice()];
    let t = t0, y = yInit.slice();
    for (let s = 0; s < steps; s++) {
      const k1 = normalizeVector(toPlain(f(t, y)));
      const y2 = y.map((yi, i) => yi + 0.5 * h * k1[i]);
      const k2 = normalizeVector(toPlain(f(t + 0.5 * h, y2)));
      const y3 = y.map((yi, i) => yi + 0.5 * h * k2[i]);
      const k3 = normalizeVector(toPlain(f(t + 0.5 * h, y3)));
      const y4 = y.map((yi, i) => yi + h * k3[i]);
      const k4 = normalizeVector(toPlain(f(t + h, y4)));
      y = y.map((yi, i) => yi + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      t += h; T.push(t); Y.push(y.slice());
    }
    return { __multi: [T, Y] };
  });

  // ode23: same as ode45 (simpler alias)
  parser.set("ode23", (f, tspan, y0) => parser.get("ode45")(f, tspan, y0));

  // fzero: bisection or secant root finder
  parser.set("fzero", (f, x0) => {
    const xv = normalizeVector(x0);
    if (xv.length >= 2) {
      let [a, b] = xv, fa = realValue(toPlain(f(a))), fb = realValue(toPlain(f(b)));
      for (let i = 0; i < 100; i++) {
        const c = (a + b) / 2, fc = realValue(toPlain(f(c)));
        if (Math.abs(fc) < 1e-12 || (b - a) / 2 < 1e-12) return c;
        if (fa * fc < 0) { b = c; fb = fc; } else { a = c; fa = fc; }
      }
      return (a + b) / 2;
    }
    let x = xv[0], dx = Math.abs(x) * 0.01 + 0.01;
    for (let i = 0; i < 80; i++) {
      const fx = realValue(toPlain(f(x))), fx2 = realValue(toPlain(f(x + dx)));
      if (fx2 === fx) break;
      const xn = x - fx * dx / (fx2 - fx); dx = xn - x; x = xn;
      if (Math.abs(realValue(toPlain(f(x)))) < 1e-12) break;
    }
    return x;
  });

  // integral: adaptive Simpson's rule
  parser.set("integral", (f, a, b) => {
    const simp = (f, lo, hi, tol, depth) => {
      const c = (lo + hi) / 2;
      const fa = realValue(toPlain(f(lo))), fb = realValue(toPlain(f(hi))), fc = realValue(toPlain(f(c)));
      const s1 = (hi - lo) * (fa + 4 * fc + fb) / 6;
      const d = (lo + c) / 2, e = (c + hi) / 2;
      const fd = realValue(toPlain(f(d))), fe = realValue(toPlain(f(e)));
      const s2 = (c - lo) * (fa + 4 * fd + fc) / 6 + (hi - c) * (fc + 4 * fe + fb) / 6;
      if (depth >= 12 || Math.abs(s2 - s1) < 15 * tol) return s2 + (s2 - s1) / 15;
      return simp(f, lo, c, tol / 2, depth + 1) + simp(f, c, hi, tol / 2, depth + 1);
    };
    return simp(f, Number(a), Number(b), 1e-6, 0);
  });

  // fminbnd: golden section minimum search
  parser.set("fminbnd", (f, a, b) => {
    const phi = (Math.sqrt(5) - 1) / 2;
    let lo = Number(a), hi = Number(b);
    let c = hi - phi * (hi - lo), d = lo + phi * (hi - lo);
    for (let i = 0; i < 100; i++) {
      if (realValue(toPlain(f(c))) < realValue(toPlain(f(d)))) hi = d; else lo = c;
      if (hi - lo < 1e-10) break;
      c = hi - phi * (hi - lo); d = lo + phi * (hi - lo);
    }
    return (lo + hi) / 2;
  });

  // fminsearch: Nelder-Mead simplex (1D fallback to fminbnd)
  parser.set("fminsearch", (f, x0) => {
    const xv = normalizeVector(x0);
    if (xv.length === 1) {
      // 1D: golden section around x0
      const a = xv[0] - 10, b = xv[0] + 10;
      return [parser.get("fminbnd")(f, a, b)];
    }
    return xv; // multi-D: stub
  });


  extensions.forEach((extension) => {
    Object.entries(extension?.functions || {}).forEach(([name, fn]) => {
      if (typeof fn !== "function") return;
      parser.set(name, (...args) =>
        toPlain(fn(...args, { math, parser, variables, logs, plotState, setPlot3DRequest: (config) => { plot3DRequest = config; } })),
      );
      functionNames.add(name);
    });
  });

  return {
    parser, logs, plotState, subplotState, variables, functionNames,
    getPlot3DRequest() { return plot3DRequest; },
    getControls() { return controls; },
    clearVariables(names) {
      if (names.length === 0) {
        Array.from(variables).forEach((name) => parser.remove(name));
        variables.clear();
        return;
      }
      names.forEach((name) => { parser.remove(name); variables.delete(name); });
    },
  };
}

export function executeScript(source, options = {}) {
  const extensions = options.extensions || [];
  const compatibilityWarnings = detectMatlabCompatibilityWarnings(source);
  const engine = createExecutionEngine({
    extensions,
    controlValues: options.controlValues || {},
    initialWorkspace: options.initialWorkspace || [],
  });
  const { parser, logs, plotState, subplotState, variables, functionNames } = engine;
  const userFunctions = {};

  function isTruthy(val) {
    if (val == null) return false;
    if (typeof val === "number") return val !== 0;
    if (typeof val === "boolean") return val;
    if (Array.isArray(val)) return val.flat(Infinity).some((x) => x !== 0 && x != null);
    return Boolean(val);
  }

  function formatExecutionError(error, meta = {}) {
    const pieces = [];
    if (meta.lineNo != null) pieces.push(`Line ${meta.lineNo}`);
    if (meta.rawLine) pieces.push(`Source: ${meta.rawLine}`);
    if (meta.normalizedLine && meta.normalizedLine !== meta.rawLine) {
      pieces.push(`Normalized: ${meta.normalizedLine}`);
    }
    pieces.push(error?.message || String(error));
    return new Error(pieces.join("\n"));
  }

  function executeLine(rawLine, lineNo = null) {
    const trimmedRaw = rawLine.replace(/%.*$/, "").trim();
    if (!trimmedRaw) return null;
    const hasSemicolon = /;\s*$/.test(trimmedRaw);
    const withoutSemicolon = trimmedRaw.replace(/;\s*$/, "");
    if (/^clear(\s+.+)?$/i.test(withoutSemicolon)) {
      const args = withoutSemicolon.replace(/^clear/i, "").trim().split(/\s+/).filter(Boolean);
      engine.clearVariables(args);
      return null;
    }
    const line = preprocessLine(withoutSemicolon, variables, functionNames);
    if (!line) return null;
    try {
      const anonymousAssign = withoutSemicolon.match(/^([A-Za-z_]\w*)\s*=\s*@\(([^)]*)\)\s*(.+)$/);
      if (anonymousAssign) {
        const [, name, paramsRaw, bodyRaw] = anonymousAssign;
        const params = paramsRaw.split(",").map((entry) => entry.trim()).filter(Boolean);
        const body = preprocessLine(bodyRaw, variables, functionNames);
        const anonymousFn = (...args) => {
          const saved = new Map();
          params.forEach((param, index) => {
            try { saved.set(param, parser.get(param)); } catch { saved.set(param, undefined); }
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
        functionNames.add(name);  // Add to functionNames FIRST so replaceIndexing won't treat it as a variable
        variables.add(name);
        return hasSemicolon ? null : anonymousFn;
      }
      const multiAssign = line.match(/^\[([^\]]+)\]\s*=\s*(.+)$/);
      if (multiAssign) {
        const names = multiAssign[1].split(",").map((n) => n.trim()).filter(Boolean);
        const rhs = preprocessLine(multiAssign[2], variables, functionNames);
        const result = toPlain(parser.evaluate(rhs));
        const values = result?.__multi || [];
        names.forEach((name, idx) => { parser.set(name, values[idx]); variables.add(name); });
        return hasSemicolon ? null : (values.length === 1 ? values[0] : values);
      }
      const indexedAssign = line.match(/^([A-Za-z_]\w*)\[([^\]]+)\]\s*=\s*(.+)$/);
      if (indexedAssign) {
        const [, name, idxExpr, valExpr] = indexedAssign;
        const arr = parser.get(name);
        const idx = Number(toPlain(parser.evaluate(idxExpr)));
        const val = toPlain(parser.evaluate(valExpr));
        const updated = Array.isArray(arr) ? [...arr] : arr;
        if (Array.isArray(updated)) updated[idx - 1] = val;
        parser.set(name, updated);
        variables.add(name);
        return hasSemicolon ? null : updated;
      }
      const assign = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
      if (assign) {
        const [, name, expr] = assign;
        const result = toPlain(parser.evaluate(expr));
        parser.set(name, result);
        parser.set("ans", result);
        variables.add(name);
        return hasSemicolon ? null : result;
      }
      const result = toPlain(parser.evaluate(line));
      parser.set("ans", result);
      return (hasSemicolon || result == null || result === "") ? null : result;
    } catch (error) {
      throw formatExecutionError(error, { lineNo, rawLine: trimmedRaw, normalizedLine: line });
    }
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
    if (node.type === "line") return executeLine(node.raw, node.lineNo ?? null);
    if (node.type === "if") {
      for (const branch of node.branches) {
        const condExpr = preprocessLine(branch.cond.replace(/;\s*$/, ""), variables, functionNames);
        const condVal = toPlain(parser.evaluate(condExpr));
        if (isTruthy(condVal)) return executeBlock(branch.body);
      }
      if (node.elseBody) return executeBlock(node.elseBody);
      return null;
    }
    if (node.type === "for") {
      const iterExpr = preprocessLine(node.iterExpr.replace(/;\s*$/, ""), variables, functionNames);
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
    if (node.type === "while") {
      let last = null;
      const WHILE_LIMIT = 100000;
      let guard = 0;
      while (guard++ < WHILE_LIMIT) {
        const condExpr = preprocessLine(node.condExpr.replace(/;\s*$/, ""), variables, functionNames);
        const condVal = toPlain(parser.evaluate(condExpr));
        if (!isTruthy(condVal)) break;
        const sig = executeBlock(node.body);
        if (sig === BREAK) break;
        if (sig === RETURN) return sig;
        if (sig !== CONTINUE && sig != null) last = sig;
      }
      if (guard >= WHILE_LIMIT) logs.push(`\u26a0 while loop exceeded ${WHILE_LIMIT.toLocaleString()} iterations and was stopped.`);
      return last;
    }
    if (node.type === "function") {
      const { name, ins, outs, body } = node;
      userFunctions[name] = { ins, outs, body };
      parser.set(name, (...args) => {
        const saved = {};
        ins.forEach((param, i) => { saved[param] = parser.get(param); parser.set(param, args[i] ?? null); });
        outs.forEach((o) => { saved[o] = parser.get(o); });
        // nargin / nargout support inside user functions
        parser.set("nargin",  args.length);
        parser.set("nargout", outs.length);
        executeBlock(body);
        const result = outs.length === 1
          ? parser.get(outs[0])
          : outs.length > 1 ? { __multi: outs.map((o) => parser.get(o)) } : null;
        Object.entries(saved).forEach(([k, v]) => v == null ? null : parser.set(k, v));
        return result;
      });
      functionNames.add(name);
      return null;
    }
    // try/catch block
    if (node.type === "try") {
      try {
        const sig = executeBlock(node.tryBody);
        if (sig === BREAK || sig === CONTINUE || sig === RETURN) return sig;
        return sig;
      } catch (err) {
        if (node.catchBody) {
          if (node.catchVar) {
            parser.set(node.catchVar, err?.message || String(err));
            variables.add(node.catchVar);
          }
          return executeBlock(node.catchBody);
        }
        return null;
      }
    }
    // switch/case/otherwise block
    if (node.type === "switch") {
      const exprPrep = preprocessLine(String(node.expr).replace(/;\s*$/, ""), variables, functionNames);
      let switchVal;
      try { switchVal = toPlain(parser.evaluate(exprPrep)); } catch { return null; }
      for (const caseNode of node.cases) {
        const casePrep = preprocessLine(String(caseNode.val).replace(/;\s*$/, ""), variables, functionNames);
        let caseVal;
        try { caseVal = toPlain(parser.evaluate(casePrep)); } catch { continue; }
        const svNum = realValue(switchVal), cvNum = realValue(caseVal);
        const svStr = typeof switchVal === "string" ? switchVal : null;
        const cvStr = typeof caseVal  === "string" ? caseVal  : null;
        const matches = Array.isArray(caseVal)
          ? normalizeVector(caseVal).some((v) => v === svNum)
          : (svStr != null && cvStr != null ? svStr === cvStr : svNum === cvNum);
        if (matches) return executeBlock(caseNode.body);
      }
      if (node.otherwise) return executeBlock(node.otherwise);
      return null;
    }
    if (node.type === "break") return BREAK;
    if (node.type === "continue") return CONTINUE;
    if (node.type === "return") return RETURN;
    return null;
  }

  // Expand mid-line semicolons into separate lines (e.g., a = 1; b = 2; c = 3)
  function expandMidLineSemicolons(src) {
    const result = [];
    for (const rawLine of src.split(/\r?\n/)) {
      const code = rawLine.replace(/%.*$/, "");
      if (!code.includes(";")) { result.push(rawLine); continue; }
      const parts = [];
      let cur = "", depth = 0, inStr = false, strCh = null;
      for (const ch of code) {
        if (inStr) { cur += ch; if (ch === strCh) inStr = false; continue; }
        if (ch === "'" || ch === '"') { inStr = true; strCh = ch; cur += ch; continue; }
        if ("[(".includes(ch)) depth++;
        else if ("])".includes(ch)) depth = Math.max(0, depth - 1);
        if (ch === ";" && depth === 0) { parts.push(cur.trim()); cur = ""; }
        else cur += ch;
      }
      parts.push(cur.trim());
      const nonEmpty = parts.filter(Boolean);
      if (nonEmpty.length <= 1) { result.push(rawLine); continue; }
      // All but last get semicolon (suppress output); last keeps its own trailing state
      nonEmpty.slice(0, -1).forEach((p) => result.push(p + ";"));
      if (nonEmpty[nonEmpty.length - 1]) result.push(nonEmpty[nonEmpty.length - 1]);
    }
    return result.join("\n");
  }

  const normalizedSource = expandMidLineSemicolons(joinContinuationLines(source));
  const lines = normalizedSource.split(/\r?\n/);
  const tree = parseBlocks(lines);
  let lastVisibleResult = null;

  for (const node of tree) {
    const result = executeNode(node);
    if (result != null && result !== BREAK && result !== CONTINUE && result !== RETURN) {
      lastVisibleResult = result;
    }
  }

  let figureJson;
  if (subplotState.active) {
    if (subplotState.current > 0) {
      subplotState.slots[subplotState.current - 1] = { ...makePlotState(), ...plotState, series: [...plotState.series] };
    }
    const panels = subplotState.slots.map((slot) =>
      slot && slot.series.length > 0 ? buildFigureFromPlotState(slot) : null,
    );
    figureJson = JSON.stringify({
      type: "opencalc_subplots",
      rows: subplotState.rows,
      cols: subplotState.cols,
      panels,
    });
  } else {
    figureJson = buildFigureFromPlotState(plotState);
  }

  const outputBlocks = [];
  if (logs.length) outputBlocks.push(logs.filter(Boolean).join("\n"));
  if (lastVisibleResult != null && lastVisibleResult !== "") {
    outputBlocks.push(formatValue(lastVisibleResult));
  }

  const result = {
    output: outputBlocks.filter(Boolean).join("\n\n") || (figureJson ? "Plot rendered." : "No output."),
    figureJson,
    workspace: buildWorkspaceSnapshot(parser, variables),
    plot3DRequest: engine.getPlot3DRequest(),
    controls: engine.getControls(),
    compatibilityWarnings,
  };

  extensions.forEach((extension) => {
    if (typeof extension?.onRun === "function") {
      try {
        extension.onRun(result, { parser, variables, logs, plotState, subplotState });
      } catch {
        // keep execution resilient even if extension hook fails
      }
    }
  });

  return result;
}

// ── Notebook-compatible wrapper ───────────────────────────────────────────────

export function runOpenMatScript(source, options = {}) {
  const result = executeScript(source, {
    controlValues: options.sliderOverrides || {},
    extensions: options.extensions || [],
  });
  return {
    logs: result.output ? result.output.split("\n") : [],
    figureJson: result.figureJson,
    variables: (result.workspace || []).map((w) => w.name),
  };
}
