import { create, all, format as mathFormat } from "mathjs";

export const math = create(all);
math.config({ matrix: "Array", number: "number" });

// Fix: A / B where B is a 1×1 matrix (e.g. result of inner product a'*a) must
// be treated as scalar division, not matrix right-division A*inv(B), which
// would try multiply(m×n, 1×1) and throw a dimension mismatch.
{
  const _div = math.divide.bind(math);
  math.import({
    divide: function(a, b) {
      const pb = (b && typeof b.valueOf === "function") ? b.valueOf() : b;
      if (Array.isArray(pb)) {
        if (pb.length === 1 && Array.isArray(pb[0]) && pb[0].length === 1) {
          return math.multiply(a, 1 / pb[0][0]);
        }
        if (pb.length === 1 && typeof pb[0] === "number") {
          return math.multiply(a, 1 / pb[0]);
        }
      }
      return _div(a, b);
    },
  }, { override: true, wrap: false });
}

// Predicates used by symbolic-aware overrides
function isSymObj(v)   { return v != null && typeof v === 'object' && !Array.isArray(v) && '__sym' in v; }
function isSymArr(v)   { return Array.isArray(v) && v.length > 0 && isSymObj(v[0]); }
function symShape(v)   { return isSymArr(v) ? [1, v.length] : (v.__shape ?? [1, 1]); }

// Override size / length so that symbolic objects/arrays don't crash the engine.
{
  const _size = math.size.bind(math);
  math.import({
    size: function(x, dim) {
      if (isSymObj(x) || isSymArr(x)) {
        const s = symShape(x);
        return dim !== undefined ? (s[Number(dim) - 1] ?? 1) : s;
      }
      return dim !== undefined ? _size(x, dim) : _size(x);
    },
    length: function(x) {
      if (isSymObj(x) || isSymArr(x)) return Math.max(...symShape(x));
      const p = x && typeof x.valueOf === 'function' ? x.valueOf() : x;
      if (Array.isArray(p)) return Math.max(p.length, Array.isArray(p[0]) ? p[0].length : 0);
      return 1;
    },
    numel: function(x) {
      if (isSymObj(x) || isSymArr(x)) { const s = symShape(x); return s[0] * s[1]; }
      const p = x && typeof x.valueOf === 'function' ? x.valueOf() : x;
      if (!Array.isArray(p)) return 1;
      return p.flat(Infinity).length;
    },
    isempty: function(x) {
      if (isSymObj(x)) return 0;
      if (isSymArr(x)) return x.length === 0 ? 1 : 0;
      const p = x && typeof x.valueOf === 'function' ? x.valueOf() : x;
      return (!p || (Array.isArray(p) && p.flat(Infinity).length === 0)) ? 1 : 0;
    },
  }, { override: true, wrap: false });
}

// ── Pure type/value helpers ───────────────────────────────────────────────────

export function toPlain(value) {
  if (value && typeof value.valueOf === "function") {
    const p = value.valueOf();
    if (p !== value) return toPlain(p);
  }
  if (Array.isArray(value)) {
    const mapped = value.map(toPlain);
    // Normalize Nx1 column vectors → 1D flat arrays so r(i) indexing works correctly
    if (mapped.length > 0 && mapped.every(v => Array.isArray(v) && v.length === 1)) {
      return mapped.map(v => v[0]);
    }
    return mapped;
  }
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
    return pa.map((v, i) => dotMultiply(v, pb[i] ?? pb));
  }
  if (Array.isArray(pa)) return pa.map((v) => dotMultiply(v, pb));
  if (Array.isArray(pb)) return pb.map((v) => dotMultiply(pa, v));
  return Number(pa) * Number(pb);
}

export function dotDivide(a, b) {
  const pa = toPlain(a), pb = toPlain(b);
  if (Array.isArray(pa) && Array.isArray(pb)) {
    return pa.map((v, i) => dotDivide(v, pb[i] ?? pb));
  }
  if (Array.isArray(pa)) return pa.map((v) => dotDivide(v, pb));
  if (Array.isArray(pb)) return pb.map((v) => dotDivide(pa, v));
  return Number(pa) / Number(pb);
}

export function dotPow(a, b) {
  const pa = toPlain(a), pb = toPlain(b);
  if (Array.isArray(pa) && Array.isArray(pb)) {
    return pa.map((v, i) => dotPow(v, pb[i] ?? pb));
  }
  if (Array.isArray(pa)) return pa.map((v) => dotPow(v, pb));
  if (Array.isArray(pb)) return pb.map((v) => dotPow(pa, v));
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
  const maxEig = eigenPairs.length ? eigenPairs[0].value : 0;
  const eigenTol = maxEig * Math.max(m, n) * 2.22e-16;
  const singular = eigenPairs.map((pair) => (pair.value <= eigenTol ? 0 : pair.sigma));
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
  const rowCount = Array.isArray(source) ? source.length : 0;
  const colCount = rowCount ? Math.max(...source.map((row) => (Array.isArray(row) ? row.length : 0)), 0) : 0;
  const columns = Array.from({ length: colCount }, (_, col) =>
    Array.from({ length: rowCount }, (_, row) => realValue(source[row]?.[col] ?? 0)),
  );
  const keep = columns.filter((column, index) => {
    if (!column.some((value) => Number.isFinite(value))) return false;
    const sv = index < singular.length ? singular[index] : 0;
    return mode === "null" ? sv <= tol : sv > tol;
  });
  return keep.length
    ? Array.from({ length: keep[0].length }, (_, row) => keep.map((col) => col[row] ?? 0))
    : [];
}

export function svdDecomp(A) {
  const { U, S, V } = computeSvd(A);
  return { __multi: [U, S, V], U, S, V };
}

// ── Formatting & workspace ────────────────────────────────────────────────────

export function sprintfFormat(fmt, ...args) {
  // Flatten matrix/vector args column-major like real MATLAB
  const flatArgs = args.flatMap(a => {
    const p = toPlain(a);
    if (!Array.isArray(p)) return [p];
    if (Array.isArray(p[0])) {
      const rows = p.length, cols = p[0].length;
      const out = [];
      for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) out.push(p[r][c]);
      return out;
    }
    return p;
  });
  let i = 0;
  return String(fmt).replace(/%[\d.]*[diouxXeEfgGs]/g, (m) => {
    const val = flatArgs[i++];
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
  if (Array.isArray(value) && value.length > 0 && isSymObj(value[0]))
    return '[' + value.map(v => v.__sym).join(', ') + ']';
  if (value && typeof value === "object" && "__sym" in value) return String(value.__sym);
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
  return {
    series: [],
    hold: false,
    title: "",
    xlabel: "",
    ylabel: "",
    zlabel: "",
    legend: [],
    grid: true,
    xlim: null,
    ylim: null,
    zlim: null,
    axisMode: "auto",
    view: "3",
    colormap: "parula",
    colorbar: false,
  };
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

  // Compute tight data extents for auto axis limits
  const flatX = surfaceData.X.flat().filter(Number.isFinite);
  const flatY = surfaceData.Y.flat().filter(Number.isFinite);
  const flatZ = surfaceData.Z.flat().map(Number).filter(Number.isFinite);
  const autoXlim = flatX.length ? [Math.min(...flatX), Math.max(...flatX)] : [-6, 6];
  const autoYlim = flatY.length ? [Math.min(...flatY), Math.max(...flatY)] : [-6, 6];
  const autoZlim = flatZ.length ? [Math.min(...flatZ), Math.max(...flatZ)] : [0, 1];
  const zRange = flatZ.length ? autoZlim : [0, 1];

  // Use explicit plotState limits if set, otherwise fall back to data extents
  const xlim = (Array.isArray(plotState.xlim) && plotState.xlim.length >= 2) ? plotState.xlim : autoXlim;
  const ylim = (Array.isArray(plotState.ylim) && plotState.ylim.length >= 2) ? plotState.ylim : autoYlim;
  const zlim = (Array.isArray(plotState.zlim) && plotState.zlim.length >= 2) ? plotState.zlim : autoZlim;

  return {
    mode: "3d",
    title: plotState.title || `OpenMAT ${kind === "mesh" ? "Mesh" : "Surface"} Lab`,
    replace: true,
    functions: [{
      id: Date.now(),
      latex: kind === "mesh" ? "mesh data" : "surface data",
      color: "#6366f1",
      visible: true,
      plotType: kind === "mesh" ? "mesh" : "surf",
      wireframe: kind === "mesh",
      opacity: kind === "mesh" ? 1 : 0.9,
      surfaceData,
      colorMap: plotState.colormap || "parula",
      colorRange: zRange,
    }],
    settings: {
      range: Math.max(xlim[1] - xlim[0], ylim[1] - ylim[0], zlim[1] - zlim[0], 4),
      resolution: Math.min(128, Math.max(surfaceData.Z.length, surfaceData.Z[0]?.length || 32, 32)),
      xlim,
      ylim,
      zlim,
      view: plotState.view,
      colorbar: plotState.colorbar !== false,  // show colorbar by default for surf
      colormap: plotState.colormap || "parula",
      xlabel: plotState.xlabel || "X",
      ylabel: plotState.ylabel || "Y",
      zlabel: plotState.zlabel || "Z",
      title: plotState.title || "",
    },
  };
}

export function convertPointSeries3DConfig(kind, args, plotState) {
  const xs = normalizeVector(args[0]).map(Number);
  const ys = normalizeVector(args[1]).map(Number);
  const zs = normalizeVector(args[2]).map(Number);
  const count = Math.min(xs.length, ys.length, zs.length);
  const extraArgs = args.slice(3);
  const numericExtras = extraArgs.filter((arg) => typeof arg !== "string");
  const stringExtras = extraArgs.filter((arg) => typeof arg === "string").map((arg) => String(arg).toLowerCase());
  const filled = stringExtras.includes("filled");

  // Parse MATLAB short color names from string args
  const matlabColors = { r: "#e84040", g: "#22c55e", b: "#4d7cff", k: "#111111", w: "#ffffff",
    m: "#d946ef", c: "#06b6d4", y: "#facc15" };
  const colorStringArg = stringExtras.find((s) => matlabColors[s]);
  const colorFromString = colorStringArg ? matlabColors[colorStringArg] : null;

  let sizeArg = null;
  let colorArg = null;
  if (numericExtras.length >= 1) sizeArg = numericExtras[0];
  if (numericExtras.length >= 2) colorArg = numericExtras[1];
  const sizeValues = sizeArg == null ? [] : normalizeVector(sizeArg).map(Number);
  const colorValues = colorArg == null ? [] : normalizeVector(colorArg).map(Number);

  // Tight axis limits from the point cloud
  const xSlice = xs.slice(0, count).filter(Number.isFinite);
  const ySlice = ys.slice(0, count).filter(Number.isFinite);
  const zSlice = zs.slice(0, count).filter(Number.isFinite);
  const pad = (v) => v * 0.05 + 0.5;
  const autoXlim = xSlice.length ? [Math.min(...xSlice) - pad(Math.abs(Math.min(...xSlice))), Math.max(...xSlice) + pad(Math.abs(Math.max(...xSlice)))] : [-10, 10];
  const autoYlim = ySlice.length ? [Math.min(...ySlice) - pad(Math.abs(Math.min(...ySlice))), Math.max(...ySlice) + pad(Math.abs(Math.max(...ySlice)))] : [-10, 10];
  const autoZlim = zSlice.length ? [Math.min(...zSlice) - pad(Math.abs(Math.min(...zSlice))), Math.max(...zSlice) + pad(Math.abs(Math.max(...zSlice)))] : [-10, 10];
  const xlim = (Array.isArray(plotState.xlim) && plotState.xlim.length >= 2) ? plotState.xlim : autoXlim;
  const ylim = (Array.isArray(plotState.ylim) && plotState.ylim.length >= 2) ? plotState.ylim : autoYlim;
  const zlim = (Array.isArray(plotState.zlim) && plotState.zlim.length >= 2) ? plotState.zlim : autoZlim;

  const colorFinite = colorValues.filter((value) => Number.isFinite(value));
  return {
    mode: "3d",
    title: plotState.title || `OpenMAT ${kind === "scatter3" ? "3D Scatter" : "3D Curve"}`,
    replace: true,
    functions: [{
      id: Date.now(),
      latex: kind === "scatter3" ? "scatter3 data" : "plot3 data",
      color: colorFromString || (kind === "scatter3" ? "#f97316" : "#22c55e"),
      visible: true,
      opacity: kind === "scatter3" ? 0.95 : 1,
      plotType: kind === "scatter3" ? "scatter3" : "line3",
      xs: xs.slice(0, count),
      ys: ys.slice(0, count),
      zs: zs.slice(0, count),
      pointSize: kind === "scatter3" ? 0.14 : 0.1,
      pointSizes: kind === "scatter3" ? sizeValues.slice(0, count) : [],
      colorValues: kind === "scatter3" ? colorValues.slice(0, count) : [],
      colorMap: plotState.colormap || "parula",
      colorRange: colorFinite.length ? [Math.min(...colorFinite), Math.max(...colorFinite)] : null,
      filled,
    }],
    settings: {
      range: Math.max(xlim[1] - xlim[0], ylim[1] - ylim[0], zlim[1] - zlim[0], 4),
      resolution: 64,
      xlim,
      ylim,
      zlim,
      view: plotState.view,
      colorbar: plotState.colorbar && kind === "scatter3" && colorFinite.length > 0,
      colormap: plotState.colormap || "parula",
      xlabel: plotState.xlabel || "X",
      ylabel: plotState.ylabel || "Y",
      zlabel: plotState.zlabel || "Z",
      title: plotState.title || "",
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

// ── String-aware MATLAB comment stripper ──────────────────────────────────────
// Must be defined before parseBlocks so the block parser can use it.
// A % inside 'a string' must NOT be treated as a comment.
function stripMatlabComment(line) {
  let inStr = false;
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (inStr) {
      if (c === "'") {
        // '' is an escaped single-quote inside the string — skip both chars
        if (line[i + 1] === "'") { i += 2; continue; }
        inStr = false;
      }
      i++;
      continue;
    }
    // Outside a string: % starts a comment
    if (c === "%") return line.slice(0, i);
    if (c === "'") {
      // Transpose when immediately preceded by ), ], or a word char; otherwise string.
      const prev = line.slice(0, i).trimEnd();
      const lastCh = prev.slice(-1);
      if (/[)\]\w]/.test(lastCh)) { i++; continue; } // transpose — not a string opener
      inStr = true;
    }
    i++;
  }
  return line;
}

// ── Block parser helpers ──────────────────────────────────────────────────────

// Find the index of the first top-level comma in str (outside parens, brackets,
// braces, and strings). Returns -1 if not found.
// Used to detect MATLAB one-liner syntax:  if cond, stmt; end
function findTopLevelComma(str) {
  let depth = 0, inStr = false, strCh = null;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inStr) {
      if (c === strCh) {
        if (c === "'" && str[i + 1] === "'") { i++; continue; } // '' escape
        inStr = false;
      }
      continue;
    }
    if (c === "'") {
      const prev = str.slice(0, i).trimEnd().slice(-1);
      if (/[)\]\w]/.test(prev)) continue; // transpose — not a string
      inStr = true; strCh = c; continue;
    }
    if (c === '"') { inStr = true; strCh = c; continue; }
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth = Math.max(0, depth - 1);
    else if (c === "," && depth === 0) return i;
  }
  return -1;
}

// Split str by top-level semicolons (outside strings/brackets).
// Used to break apart inline bodies in one-liners.
function splitTopLevelSemicolons(str) {
  const parts = [];
  let cur = "", depth = 0, inStr = false, strCh = null;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inStr) { cur += c; if (c === strCh) inStr = false; continue; }
    if (c === "'" || c === '"') { inStr = true; strCh = c; cur += c; continue; }
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth = Math.max(0, depth - 1);
    if (c === ";" && depth === 0) { parts.push(cur.trim()); cur = ""; }
    else cur += c;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts.filter(Boolean);
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
    const stripped = stripMatlabComment(raw).trim();
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
      // Handle one-liner: for i = expr, stmt; end
      let iterExpr = forMatch[2].replace(/;\s*$/, "").trim();
      const commaIdx = findTopLevelComma(iterExpr);
      let inlineStmts = null;
      if (commaIdx !== -1) {
        inlineStmts = iterExpr.slice(commaIdx + 1).trim();
        iterExpr = iterExpr.slice(0, commaIdx).trim();
      }
      const node = { type: "for", varName: forMatch[1], iterExpr, body: [], lineNo };
      top().body.push(node);
      stack.push(node);
      if (inlineStmts) {
        splitTopLevelSemicolons(inlineStmts).forEach(s => {
          const sl = s.toLowerCase();
          if (sl === "end") { if (stack.length > 1) stack.pop(); }
          else if (s) getTargetBody(top()).push({ type: "line", raw: s, lineNo });
        });
      }
      continue;
    }

    const whileMatch = stripped.match(/^while\s+(.+)$/i);
    if (whileMatch) {
      // Handle one-liner: while cond, stmt; end
      let condExpr = whileMatch[1].replace(/;\s*$/, "").trim();
      const commaIdx = findTopLevelComma(condExpr);
      let inlineStmts = null;
      if (commaIdx !== -1) {
        inlineStmts = condExpr.slice(commaIdx + 1).trim();
        condExpr = condExpr.slice(0, commaIdx).trim();
      }
      const node = { type: "while", condExpr, body: [], lineNo };
      top().body.push(node);
      stack.push(node);
      if (inlineStmts) {
        splitTopLevelSemicolons(inlineStmts).forEach(s => {
          const sl = s.toLowerCase();
          if (sl === "end") { if (stack.length > 1) stack.pop(); }
          else if (s) getTargetBody(top()).push({ type: "line", raw: s, lineNo });
        });
      }
      continue;
    }

    const ifMatch = stripped.match(/^if\s+(.+)$/i);
    if (ifMatch) {
      // Handle one-liner: if cond, stmt1; stmt2; end
      let cond = ifMatch[1].replace(/;\s*$/, "").trim();
      const commaIdx = findTopLevelComma(cond);
      let inlineStmts = null;
      if (commaIdx !== -1) {
        inlineStmts = cond.slice(commaIdx + 1).trim();
        cond = cond.slice(0, commaIdx).trim();
      }
      const node = { type: "if", branches: [{ cond, body: [], lineNo }], elseBody: null, lineNo };
      top().body.push(node);
      stack.push(node);
      if (inlineStmts) {
        splitTopLevelSemicolons(inlineStmts).forEach(s => {
          const sl = s.toLowerCase();
          if (sl === "end") { if (stack.length > 1) stack.pop(); }
          else if (sl === "else") { if (top().type === "if") top().elseBody = []; }
          else if (s) getTargetBody(top()).push({ type: "line", raw: s, lineNo });
        });
      }
      continue;
    }

    const elseifMatch = stripped.match(/^elseif\s+(.+)$/i);
    if (elseifMatch) {
      let cond = elseifMatch[1].replace(/;\s*$/, "").trim();
      const commaIdx = findTopLevelComma(cond);
      let inlineStmts = null;
      if (commaIdx !== -1) {
        inlineStmts = cond.slice(commaIdx + 1).trim();
        cond = cond.slice(0, commaIdx).trim();
      }
      const ifNode = top();
      if (ifNode.type === "if") {
        ifNode.branches.push({ cond, body: [], lineNo });
        if (inlineStmts) {
          splitTopLevelSemicolons(inlineStmts).forEach(s => {
            if (s && s.toLowerCase() !== "end") getTargetBody(top()).push({ type: "line", raw: s, lineNo });
          });
        }
      }
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
        const signTarget = row[index + next.length + 1];
        const nextIsSignedOperand =
          /[+-]/.test(nextChar) && signTarget && /[A-Za-z0-9.(\[{]/.test(signTarget);
        const nextIsOperandStart = /[A-Za-z0-9(\[{]/.test(nextChar) || nextIsSignedOperand;
        const lastCurChar = current.trimEnd().slice(-1);
        const curEndsWithOperand = /[A-Za-z0-9\])'"]/.test(lastCurChar);
        const prevChar = current.trimEnd().slice(-1);
        const prevIsOperator = /[+\-*/^:<>=~&,([]/.test(prevChar);
        if (nextIsOperandStart && curEndsWithOperand && !prevIsOperator) pushCell();
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
  // Mask single-quoted strings so brackets inside strings are never normalized
  const strings = [];
  const masked = line.replace(/'(?:[^']|'')*'/g, (m) => { strings.push(m); return `\x00S${strings.length - 1}\x00`; });

  const normalized = masked.replace(/\[([^\[\]]+)\]/g, (match, inner, offset, str) => {
    // ── Guard: don't transform the LHS of a multi-assignment ─────────────────
    // "[X, Y] = expr"  →  must stay as "[X, Y]" for the destructuring handler.
    const after = str.slice(offset + match.length).trimStart();
    if (after.startsWith("=") && !after.startsWith("==")) return match;

    const rows = splitTopLevel(inner, ";").map(r => splitTopLevelCells(r));

    // Detect whether any cell looks like a variable/matrix reference (not a plain number)
    const hasNonScalar = rows.some(row =>
      row.some(cell => {
        const t = cell.trim();
        return t !== "" && !/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t);
      })
    );

    if (!hasNonScalar) {
      // All-scalar literal: keep as standard mathjs matrix syntax  [1 2; 3 4]
      return `[${rows.map(r => r.join(", ")).join("; ")}]`;
    }

    // Mixed/variable content — use horzcat/vertcat for correct matrix concatenation.
    // Each semicolon-row becomes horzcat of its cells; multiple rows are vertcat-ed.
    const rowExprs = rows.map(row => {
      const cells = row.map(c => c.trim()).filter(Boolean);
      return cells.length === 1 ? cells[0] : `horzcat(${cells.join(", ")})`;
    });
    return rowExprs.length === 1 ? rowExprs[0] : `vertcat(${rowExprs.join(", ")})`;
  });

  // Restore string literals
  return normalized.replace(/\x00S(\d+)\x00/g, (_, i) => strings[parseInt(i)]);
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
      while (start > 0 && /[\w]/.test(text[start - 1])) start -= 1;
      return { start, end };
    }
    while (index >= 0 && /[\w\]]/.test(text[index])) index -= 1;
    return { start: index + 1, end };
  };
  const scanRight = (text, from) => {
    let index = from;
    while (index < text.length && /\s/.test(text[index])) index += 1;
    if (index >= text.length) return null;
    const start = index;
    if (/[A-Za-z_]/.test(text[index])) {
      while (index < text.length && /[\w]/.test(text[index])) index += 1;
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
    while (index < text.length && /[\w]/.test(text[index])) index += 1;
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
  // Mask strings so variable(expr) inside a string is never transformed
  const strings = [];
  const masked = line.replace(/'(?:[^']|'')*'/g, (m) => { strings.push(m); return `\x00S${strings.length - 1}\x00`; });
  // MATLAB () indexing for known variables: var(i) → var[i]
  let result = masked.replace(/\b([A-Za-z_]\w*)\s*\(([^()]+)\)/g, (match, name, inner) => {
    if (!variables.has(name) || functionNames.has(name)) return match;
    const expandedInner = inner.replace(/\bend\b/g, `length(${name})`);
    return `${name}[${expandedInner}]`;
  });
  // MATLAB {} cell-array indexing: fields{i} → fields[i]
  result = result.replace(/\b([A-Za-z_]\w*)\s*\{([^{}]+)\}/g, (match, name, inner) => {
    const expandedInner = inner.replace(/\bend\b/g, `length(${name})`);
    return `${name}[${expandedInner}]`;
  });
  return result.replace(/\x00S(\d+)\x00/g, (_, i) => strings[parseInt(i)]);
}

function replaceBackslash(expr) {
  let hasTopLevelEquals = false;
  let depth = 0;
  for (let i = 0; i < expr.length; i += 1) {
    const char = expr[i];
    if (char === "[" || char === "(" || char === "{") depth += 1;
    if (char === "]" || char === ")" || char === "}") depth -= 1;
    if (char === "=" && depth === 0) hasTopLevelEquals = true;
    if (char === "\\" && depth === 0) {
      if (hasTopLevelEquals) return expr;
      const left = expr.slice(0, i).trim();
      const right = expr.slice(i + 1).trim();
      return `mldivide(${left}, ${right})`;
    }
  }
  return expr;
}

export function preprocessLine(line, variables, functionNames = new Set()) {
  let output = stripMatlabComment(line).trim();
  if (!output) return "";
  if (/^pkg\s+/i.test(output)) return "";
  output = output.replace(/\bnull\s*\(/g, "nullspace(");
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
  return output;
}

function merge3DRequest(current, next, hold) {
  if (!next) return current;
  if (!hold || !current || current.mode !== "3d") return next;
  return {
    ...next,
    replace: false,
    functions: [...(current.functions || []), ...(next.functions || [])],
    settings: {
      ...(current.settings || {}),
      ...(next.settings || {}),
      range: Math.max(current.settings?.range || 0, next.settings?.range || 0),
    },
  };
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

// ── Statistical distribution math helpers ─────────────────────────────────────
// All internal — prefixed with _ to avoid namespace collision.

function _erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

function _gammaln(x) {
  if (x <= 0) return Infinity;
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) { y += 1; ser += c[j] / y; }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function _gammainc(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let term = 1 / a, sum = term;
    for (let n = 1; n < 300; n++) { term *= x / (a + n); sum += term; if (Math.abs(term) < 1e-14 * Math.abs(sum)) break; }
    return Math.min(1, sum * Math.exp(-x + a * Math.log(x) - _gammaln(a)));
  }
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
  for (let i = 1; i <= 300; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; h *= d * c;
    if (Math.abs(d * c - 1) < 1e-14) break;
  }
  return 1 - Math.min(1, h * Math.exp(-x + a * Math.log(x) - _gammaln(a)));
}

function _betacf(x, a, b) {
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-300) d = 1e-300;
  d = 1 / d; let h = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 3e-7) break;
  }
  return h;
}

function _betainc(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = _gammaln(a) + _gammaln(b) - _gammaln(a + b);
  const bt = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta);
  return x < (a + 1) / (a + b + 2) ? bt * _betacf(x, a, b) / a : 1 - bt * _betacf(1 - x, b, a) / b;
}

function _norminvScalar(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00];
  const b = [-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01];
  const c = [-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00];
  const d = [7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
  const plo = 0.02425, phi = 1 - plo;
  let q, r;
  if (p < plo) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  if (p <= phi) { q = p - 0.5; r = q*q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
}

function _tcdfScalar(t, df) {
  const x = df / (df + t * t);
  const ib = _betainc(x, df / 2, 0.5);
  return t >= 0 ? 1 - ib / 2 : ib / 2;
}

function _tpdfScalar(t, df) {
  return Math.exp(_gammaln((df+1)/2) - _gammaln(df/2) - 0.5*Math.log(df*Math.PI) - (df+1)/2*Math.log(1+t*t/df));
}

function _tinvScalar(p, df) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let t = _norminvScalar(p);
  for (let i = 0; i < 80; i++) {
    const ft = _tcdfScalar(t, df) - p;
    if (Math.abs(ft) < 1e-12) break;
    const fpdf = _tpdfScalar(t, df);
    if (fpdf < 1e-300) break;
    t -= ft / fpdf;
  }
  return t;
}

function _chi2cdfScalar(x, df) { return x <= 0 ? 0 : _gammainc(df / 2, x / 2); }

function _chi2pdfScalar(x, df) {
  if (x <= 0) return 0;
  return Math.exp((df/2-1)*Math.log(x) - x/2 - _gammaln(df/2) - df/2*Math.log(2));
}

function _chi2invScalar(p, df) {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  const h = 2/(9*df), z = _norminvScalar(p);
  let x = Math.max(1e-6, df * Math.pow(Math.max(0, 1 - h + z * Math.sqrt(h)), 3));
  for (let i = 0; i < 80; i++) {
    const fx = _chi2cdfScalar(x, df) - p;
    if (Math.abs(fx) < 1e-12) break;
    const fpdf = _chi2pdfScalar(x, df);
    if (fpdf < 1e-300) break;
    x = Math.max(1e-10, x - fx / fpdf);
  }
  return x;
}

function _ewDistrib(fn) {
  return (v, ...params) => isCollection(v) ? mapDeep(v, (x) => fn(Number(x), ...params.map(Number))) : fn(Number(v), ...params.map(Number));
}

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

  parser.set("mldivide", (A, b) => {
    const size = inferSize(A);
    if (size[0] === size[1]) return toPlain(math.lusolve(A, b));
    return toPlain(math.multiply(math.pinv(A), b));
  });
  parser.set("linspace", (a, b, n = 100) => buildLinspace(a, b, n));
  parser.set("logspace", (a, b, n = 50) => buildLogspace(a, b, n));
  parser.set("rand", (...shape) => {
    if (shape.length === 0) return Math.random();
    return makeRandomArray(shape.map(Number));
  });
  parser.set("eye", (n, m) => { const r = Math.round(Number(n)), c = m != null ? Math.round(Number(m)) : r; return toPlain(math.identity(r, c)); });
  parser.set("meshgrid", (x, y) => meshgrid(x, y));
  parser.set("diff", (value) => diffArray(value));
  parser.set("cumsum", (value) => cumulative(value, (acc, entry) => acc + entry, null));
  parser.set("cumprod", (value) => cumulative(value, (acc, entry) => acc * entry, null));
  parser.set("dot", (a, b) => dotProduct(a, b));
  parser.set("cross", (a, b) => crossProduct(a, b));
  parser.set("polyfit", (x, y, degree) => polyfit(x, y, degree));
  parser.set("polyval", (coefficients, x) => polyval(coefficients, x));
  parser.set("dotPow", (a, b) => toPlain(dotPow(a, b)));
  parser.set("dotMultiply", (a, b) => toPlain(dotMultiply(a, b)));
  parser.set("dotDivide", (a, b) => toPlain(dotDivide(a, b)));
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
  parser.set("disp", (value) => { logs.push(formatValue(value)); return null; });
  parser.set("help", () => { logs.push(HELP_TEXT); return HELP_TEXT; });
  parser.set("clc", () => { logs.length = 0; return null; });
  parser.set("clf", () => { clearPlots(); return null; });
  parser.set("hold", (mode = "on") => { plotState.hold = String(mode).toLowerCase() === "on"; return plotState.hold; });
  parser.set("grid", (mode = "on") => { plotState.grid = String(mode).toLowerCase() === "on"; return plotState.grid; });
  parser.set("title", (text) => { plotState.title = String(text); return text; });
  parser.set("xlabel", (text) => { plotState.xlabel = String(text); return text; });
  parser.set("ylabel", (text) => { plotState.ylabel = String(text); return text; });
  parser.set("zlabel", (text) => { plotState.zlabel = String(text); return text; });
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
  parser.set("zlim", (min, max) => {
    if (max !== undefined) { plotState.zlim = [Number(min), Number(max)]; }
    else { plotState.zlim = normalizeVector(min).slice(0, 2); }
    return plotState.zlim;
  });
  parser.set("view", (azimuth = 3, elevation) => {
    if (elevation !== undefined) {
      plotState.view = [Number(azimuth), Number(elevation)];
      return plotState.view;
    }
    const normalized = String(azimuth).trim().toLowerCase();
    if (normalized === "2" || normalized === "3") {
      plotState.view = normalized;
      return normalized;
    }
    const numeric = Number(azimuth);
    plotState.view = Number.isFinite(numeric) ? [numeric, 30] : "3";
    return plotState.view;
  });
  parser.set("axis", (mode) => {
    if (typeof mode === "string") {
      const normalized = mode.toLowerCase();
      if (["equal", "tight", "auto"].includes(normalized)) {
        plotState.axisMode = normalized;
        if (normalized === "auto") { plotState.xlim = null; plotState.ylim = null; plotState.zlim = null; }
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
  parser.set("qr", (A, economy) => {
    const { Q, R } = math.qr(A);
    let Qp = toPlain(Q), Rp = toPlain(R);
    if (economy === 0 || economy === "0") {
      // Economy (thin) QR: trim Q to m×k and R to k×n where k = min(m, n)
      const m = Qp.length, n = Array.isArray(Qp[0]) ? Qp[0].length : 1;
      const k = Math.min(m, n);
      Qp = Qp.map(row => (Array.isArray(row) ? row.slice(0, k) : row));
      Rp = Array.isArray(Rp) ? Rp.slice(0, k) : Rp;
    }
    return { __multi: [Qp, Rp], Q: Qp, R: Rp };
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
  parser.set("nullspace", (A) => orthonormalBasis(A, "null"));
  parser.set("lu", (A) => luFactorization(A));
  parser.set("surf", (...args) => {
    plot3DRequest = merge3DRequest(plot3DRequest, convertSurfaceTo3DConfig("surf", args, plotState), plotState.hold);
    logs.push("3D surface ready in the OpenMAT viewport.");
    return args[args.length - 1] ?? null;
  });
  parser.set("mesh", (...args) => {
    plot3DRequest = merge3DRequest(plot3DRequest, convertSurfaceTo3DConfig("mesh", args, plotState), plotState.hold);
    logs.push("3D mesh ready in the OpenMAT viewport.");
    return args[args.length - 1] ?? null;
  });
  parser.set("surfc", (...args) => {
    plot3DRequest = merge3DRequest(plot3DRequest, convertSurfaceTo3DConfig("surf", args, plotState), plotState.hold);
    logs.push("3D shaded surface ready in the OpenMAT viewport.");
    return args[args.length - 1] ?? null;
  });
  parser.set("plot3", (...args) => {
    plot3DRequest = merge3DRequest(plot3DRequest, convertPointSeries3DConfig("plot3", args, plotState), plotState.hold);
    logs.push("3D curve ready in the OpenMAT viewport.");
    return args[args.length - 1] ?? null;
  });
  parser.set("scatter3", (...args) => {
    plot3DRequest = merge3DRequest(plot3DRequest, convertPointSeries3DConfig("scatter3", args, plotState), plotState.hold);
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
  parser.set("min", (a, b) => {
    if (b === undefined) return statMin(a);
    const ap = toPlain(a), bp = toPlain(b);
    if (!Array.isArray(ap) && !Array.isArray(bp)) return Math.min(Number(ap), Number(bp));
    const av = Array.isArray(ap) ? ap : normalizeVector(ap);
    const bv = Array.isArray(bp) ? bp : normalizeVector(bp);
    return av.map((v, i) => Math.min(Number(v), Number(bv.length > 1 ? bv[i] : bv[0])));
  });
  parser.set("max", (a, b) => {
    if (b === undefined) return statMax(a);
    const ap = toPlain(a), bp = toPlain(b);
    if (!Array.isArray(ap) && !Array.isArray(bp)) return Math.max(Number(ap), Number(bp));
    const av = Array.isArray(ap) ? ap : normalizeVector(ap);
    const bv = Array.isArray(bp) ? bp : normalizeVector(bp);
    return av.map((v, i) => Math.max(Number(v), Number(bv.length > 1 ? bv[i] : bv[0])));
  });
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
  const _epsVal = 2.220446049250313e-16;
  const _epsFn = (type) => _epsVal;
  Object.defineProperty(_epsFn, "valueOf", { value: () => _epsVal });
  parser.set("eps", _epsFn);
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
  parser.set("rad2deg", (v) => isCollection(toPlain(v)) ? mapDeep(toPlain(v), (x) => x * (180 / Math.PI)) : Number(v) * (180 / Math.PI));
  parser.set("deg2rad", (v) => isCollection(toPlain(v)) ? mapDeep(toPlain(v), (x) => x * (Math.PI / 180)) : Number(v) * (Math.PI / 180));
  parser.set("hypot", (...a) => Math.hypot(...a.map(Number)));
  parser.set("log1p", _ew(Math.log1p));
  parser.set("expm1", _ew(Math.expm1));

  // ── Linear algebra extras ───────────────────────────────────────────────────
  parser.set("norm", (v, p) => {
    const pStr = p == null ? null : String(p).toLowerCase();
    if (pStr === 'fro') {
      const flat = normalizeVector(v);
      return Math.sqrt(flat.reduce((s, x) => s + x * x, 0));
    }
    const vec = normalizeVector(v);
    const pn = pStr == null ? 2 : (pStr === "inf" ? Infinity : Number(pStr));
    if (!isFinite(pn)) return pn > 0 ? Math.max(...vec.map(Math.abs)) : Math.min(...vec.map(Math.abs));
    return Math.pow(vec.reduce((s, x) => s + Math.abs(x) ** pn, 0), 1 / pn);
  });
  parser.set("trace", (A) => { const m = toNumericMatrix(A); return m ? m.reduce((s, r, i) => s + (r[i] ?? 0), 0) : 0; });
  // transpose(A): non-conjugate transpose — equivalent to A.' in MATLAB
  parser.set("transpose", (A) => toPlain(math.transpose(toPlain(A))));
  parser.set("diag", (v, k = 0) => {
    const plain = toPlain(v); const kn = Number(k) || 0;
    if (isMatrix(plain)) return plain.flatMap((row, i) => { const j = i + kn; return j >= 0 && j < row.length ? [row[j]] : []; });
    return makeDiagonal(v);
  });
  parser.set("triu", (A, k = 0) => { const m = toNumericMatrix(A); if (!m) return []; const kn = Number(k) || 0; return m.map((r, i) => r.map((v, j) => j - i >= kn ? v : 0)); });
  parser.set("tril", (A, k = 0) => { const m = toNumericMatrix(A); if (!m) return []; const kn = Number(k) || 0; return m.map((r, i) => r.map((v, j) => j - i <= kn ? v : 0)); });
  parser.set("fliplr", (v) => { const p = toPlain(v); return isMatrix(p) ? p.map((r) => [...r].reverse()) : [...normalizeVector(v)].reverse(); });
  parser.set("flipud", (v) => { const p = toPlain(v); return isMatrix(p) ? [...p].reverse() : [...normalizeVector(v)].reverse(); });
  parser.set("flip",   (v, dim) => {
    const p = toPlain(v);
    if (isMatrix(p)) {
      const d = dim != null ? Number(dim) : 1;
      return d === 2 ? p.map((r) => [...r].reverse()) : [...p].reverse();
    }
    return [...normalizeVector(v)].reverse();
  });
  parser.set("kron", (A, B) => { const a = toNumericMatrix(A), b = toNumericMatrix(B); if (!a || !b) return []; const res = []; for (const ar of a) { res.push(...b.map((br) => ar.flatMap((av) => br.map((bv) => av * bv)))); } return res; });
  parser.set("linsolve", (A, b) => toPlain(math.lusolve(A, b)));
  parser.set("pinv", (A) => toPlain(math.pinv(toPlain(A))));
  parser.set("rng", () => null); // no-op — random seed setter not needed in browser
  parser.set("chol", (A, flag) => {
    const m = toNumericMatrix(A);
    if (!m?.length || !m.every(r => r.length === m.length))
      throw new Error("chol requires a square numeric matrix");
    const n = m.length;
    const L = Array.from({ length: n }, () => Array(n).fill(0));
    for (let j = 0; j < n; j++) {
      let d = m[j][j] - L[j].slice(0, j).reduce((s, v) => s + v * v, 0);
      if (d < 0) throw new Error("chol: matrix is not positive definite (pivot became negative)");
      L[j][j] = Math.sqrt(d);
      for (let i = j + 1; i < n; i++) {
        let s = m[i][j];
        for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
        L[i][j] = s / L[j][j];
      }
    }
    const lower = flag != null && String(flag).toLowerCase().includes('lower');
    if (lower) return L;
    // Default MATLAB convention: return upper triangular R where A = R'*R
    return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => L[j]?.[i] ?? 0));
  });
  parser.set("schur", (A) => {
    const m = toNumericMatrix(A);
    if (!m?.length) throw new Error("schur requires a square matrix");
    const n = m.length;
    const eigRes = math.eigs(m);
    const vals = toPlain(eigRes.values);
    const vecs = eigRes.eigenvectors || [];
    // Build Q: columns are normalized eigenvectors
    const cols = vecs.map(ev => {
      const v = normalizeVector(ev.vector ?? []);
      const nrm = Math.hypot(...v.map(x => Math.abs(realValue(x)))) || 1;
      return v.map(x => realValue(x) / nrm);
    });
    const Q = Array.from({ length: n }, (_, i) => cols.map(c => c[i] ?? 0));
    // T: eigenvalues on diagonal (true Schur form for diagonalizable / symmetric matrices)
    const T = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => i === j ? realValue(vals[i] ?? 0) : 0)
    );
    return { __multi: [Q, T], Q, T };
  });
  parser.set("horzcat", (...args) => {
    const ps = args.map(toPlain);
    // If all args are 1D arrays of the same length > 1, treat each as a column vector
    if (ps.every(p => Array.isArray(p) && !isMatrix(p) && p.length > 1)) {
      const len = ps[0].length;
      if (ps.every(p => p.length === len)) {
        return Array.from({ length: len }, (_, i) => ps.map(p => p[i]));
      }
    }
    if (ps.every((p) => !isMatrix(p))) return ps.flatMap((p) => normalizeVector(p));
    // Determine number of rows from the 2D matrix arguments
    const nRows = Math.max(...ps.map(p => isMatrix(p) ? p.length : 0));
    // Normalise each argument to a 2D form (array of rows)
    const mats = ps.map((p) => {
      if (isMatrix(p)) return p;
      const vec = normalizeVector(p);
      // If the vector length matches the row-count, treat as a column vector (Nx1)
      if (vec.length === nRows && nRows > 1) return vec.map(v => [v]);
      // Otherwise treat as a single row
      return [vec];
    });
    return Array.from({ length: nRows }, (_, i) => mats.flatMap((m) => m[i] ?? []));
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

  // ── Comparison / equality helpers ───────────────────────────────────────────
  // Deep structural equality — returns 1 if both args are identical, 0 otherwise.
  // Handles scalars, vectors, and matrices.  NaN !== NaN (use isequaln for NaN-safe).
  const _deepEq = (a, b, nanEqual) => {
    const pa = toPlain(a), pb = toPlain(b);
    if (Array.isArray(pa) && Array.isArray(pb)) {
      if (pa.length !== pb.length) return false;
      return pa.every((row, i) => _deepEq(row, pb[i], nanEqual));
    }
    const na = Number(pa), nb = Number(pb);
    if (nanEqual && isNaN(na) && isNaN(nb)) return true;
    return na === nb;
  };
  parser.set("isequal",    (a, b) => _deepEq(a, b, false) ? 1 : 0);
  parser.set("isequaln",   (a, b) => _deepEq(a, b, true)  ? 1 : 0);
  parser.set("isequaltol", (a, b, tol = 1e-9) => {
    const pa = toPlain(a), pb = toPlain(b);
    const flat = (v) => Array.isArray(v) ? v.flatMap(flat) : [Number(v)];
    const fa = flat(pa), fb = flat(pb);
    if (fa.length !== fb.length) return 0;
    return fa.every((x, i) => Math.abs(x - fb[i]) <= Number(tol)) ? 1 : 0;
  });

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
    parser.set("colorbar",  () => {
      plotState.colorbar = true;
      return true;
    });
    parser.set("colormap",  (name) => {
      plotState.colormap = String(name ?? "parula").toLowerCase();
      return plotState.colormap;
    });
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
  parser.set("yline", (yVal) => {
    const y = Number(yVal);
    plotState.series.push({ kind: "plot", x: [-1e9, 1e9], y: [y, y], label: null });
    return y;
  });
  parser.set("xline", (xVal) => {
    const x = Number(xVal);
    plotState.series.push({ kind: "plot", x: [x, x], y: [-1e9, 1e9], label: null });
    return x;
  });

  // ── Statistical distributions ────────────────────────────────────────────────
  parser.set("normcdf",  (x, mu = 0, sigma = 1) => _ewDistrib((xv, m, s) => 0.5 * (1 + _erf((xv - m) / (s * Math.SQRT2))))(x, mu, sigma));
  parser.set("normpdf",  (x, mu = 0, sigma = 1) => _ewDistrib((xv, m, s) => { const z = (xv - m) / s; return Math.exp(-0.5*z*z) / (s * Math.sqrt(2*Math.PI)); })(x, mu, sigma));
  parser.set("norminv",  (p, mu = 0, sigma = 1) => _ewDistrib((pv, m, s) => _norminvScalar(pv) * s + m)(p, mu, sigma));
  parser.set("tcdf",     (t, df) => _ewDistrib(_tcdfScalar)(t, df));
  parser.set("tpdf",     (t, df) => _ewDistrib(_tpdfScalar)(t, df));
  parser.set("tinv",     (p, df) => _ewDistrib(_tinvScalar)(p, df));
  parser.set("chi2cdf",  (x, df) => _ewDistrib(_chi2cdfScalar)(x, df));
  parser.set("chi2pdf",  (x, df) => _ewDistrib(_chi2pdfScalar)(x, df));
  parser.set("chi2inv",  (p, df) => _ewDistrib(_chi2invScalar)(p, df));
  parser.set("poisspdf", (k, lam) => _ewDistrib((kv, l) => { const ki = Math.round(kv); if (ki < 0 || l < 0) return 0; if (l === 0) return ki === 0 ? 1 : 0; return Math.exp(ki * Math.log(l) - l - _gammaln(ki + 1)); })(k, lam));
  parser.set("poisscdf", (k, lam) => _ewDistrib((kv, l) => { let s = 0; for (let i = 0; i <= Math.floor(kv); i++) s += (l === 0 ? (i === 0 ? 1 : 0) : Math.exp(i * Math.log(l) - l - _gammaln(i + 1))); return s; })(k, lam));
  parser.set("binopdf",  (k, n, p) => _ewDistrib((kv, nn, pp) => { const ki = Math.round(kv); if (ki < 0 || ki > nn) return 0; if (pp === 0) return ki === 0 ? 1 : 0; if (pp === 1) return ki === nn ? 1 : 0; return Math.exp(_gammaln(nn+1) - _gammaln(ki+1) - _gammaln(nn-ki+1) + ki*Math.log(pp) + (nn-ki)*Math.log(1-pp)); })(k, n, p));
  parser.set("binocdf",  (k, n, p) => _ewDistrib((kv, nn, pp) => { const kf = Math.floor(kv); if (kf < 0) return 0; if (kf >= nn) return 1; let s = 0; for (let i = 0; i <= kf; i++) { if (pp === 0) { s += i === 0 ? 1 : 0; } else if (pp === 1) { s += i === nn ? 1 : 0; } else s += Math.exp(_gammaln(nn+1) - _gammaln(i+1) - _gammaln(nn-i+1) + i*Math.log(pp) + (nn-i)*Math.log(1-pp)); } return s; })(k, n, p));
  parser.set("fcdf",     (x, df1, df2) => _ewDistrib((xv, d1, d2) => { if (xv <= 0) return 0; return _betainc(d1*xv/(d1*xv+d2), d1/2, d2/2); })(x, df1, df2));
  parser.set("fpdf",     (x, df1, df2) => _ewDistrib((xv, d1, d2) => { if (xv <= 0) return 0; return Math.exp(_gammaln((d1+d2)/2)-_gammaln(d1/2)-_gammaln(d2/2)+(d1/2-1)*Math.log(xv)+(d1/2)*Math.log(d1/d2)-((d1+d2)/2)*Math.log(1+d1*xv/d2)); })(x, df1, df2));
  parser.set("finv",     (p, df1, df2) => _ewDistrib((pv, d1, d2) => {
    if (pv <= 0) return 0; if (pv >= 1) return Infinity;
    const fcdf = (xv) => xv <= 0 ? 0 : _betainc(d1*xv/(d1*xv+d2), d1/2, d2/2);
    const fpdf = (xv) => xv <= 0 ? 0 : Math.exp(_gammaln((d1+d2)/2)-_gammaln(d1/2)-_gammaln(d2/2)+(d1/2-1)*Math.log(xv)+(d1/2)*Math.log(d1/d2)-((d1+d2)/2)*Math.log(1+d1*xv/d2));
    let x = Math.max(1e-6, d1 / Math.max(1, d2));
    for (let i = 0; i < 80; i++) { const fx = fcdf(x) - pv; if (Math.abs(fx) < 1e-12) break; const fd = fpdf(x); if (fd < 1e-300) break; x = Math.max(1e-10, x - fx/fd); }
    return x;
  })(p, df1, df2));
  parser.set("gammaln",  (x) => _ewDistrib(_gammaln)(x));
  parser.set("betainc",  (x, a, b) => _ewDistrib(_betainc)(x, a, b));
  parser.set("gammainc", (x, a) => _ewDistrib((xv, av) => _gammainc(av, xv))(x, a));

  // ── Sampling ─────────────────────────────────────────────────────────────────
  parser.set("randsample", (population, n, replacement) => {
    const pp = toPlain(population);
    const popArr = typeof pp === "number" ? Array.from({ length: Math.round(pp) }, (_, i) => i + 1) : normalizeVector(population);
    const count = Math.round(Number(n));
    const withRepl = replacement === true || Number(replacement) === 1;
    if (withRepl) return Array.from({ length: count }, () => popArr[Math.floor(Math.random() * popArr.length)]);
    const arr = [...popArr];
    const result = [];
    for (let i = 0; i < count && arr.length > 0; i++) result.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
    return result;
  });
  parser.set("datasample", (data, n, replacement) => parser.get("randsample")(data, n, replacement));

  // ── Regression ───────────────────────────────────────────────────────────────
  parser.set("regress", (y, X) => {
    const yv = normalizeVector(y);
    const n = yv.length;
    const Xm = toNumericMatrix(X);
    const p = Xm[0].length;
    const Xt = toPlain(math.transpose(Xm));
    const XtX = toPlain(math.multiply(Xt, Xm));
    const XtXinv = toPlain(math.inv(XtX));
    const b = normalizeVector(toPlain(math.multiply(math.multiply(XtXinv, Xt), yv)));
    const yhat = Xm.map(row => row.reduce((s, xi, i) => s + xi * b[i], 0));
    const r = yv.map((yi, i) => yi - yhat[i]);
    const df = n - p;
    const sse = r.reduce((s, ri) => s + ri * ri, 0);
    const s2 = sse / df;
    const ymean = statMean(yv);
    const sst = yv.reduce((s, yi) => s + (yi - ymean) ** 2, 0);
    const R2 = 1 - sse / sst;
    const F = ((sst - sse) / (p - 1)) / s2;
    const fp = 1 - _betainc(F*(p-1)/(F*(p-1)+df), (p-1)/2, df/2);
    const XtXinvDiag = normalizeVector(toPlain(math.diag(XtXinv)));
    const se_b = XtXinvDiag.map(v => Math.sqrt(Math.abs(s2 * v)));
    const tcrit = _tinvScalar(0.975, df);
    const bint = b.map((bi, i) => [bi - tcrit * se_b[i], bi + tcrit * se_b[i]]);
    const rint = r.map(ri => [ri - 2 * Math.sqrt(s2), ri + 2 * Math.sqrt(s2)]);
    const stats = [R2, F, fp, s2];
    return { __multi: [b, bint, r, rint, stats], b, bint, r, rint, stats };
  });
  parser.set("fitlm", (x, y) => {
    const yv = normalizeVector(y);
    const n = yv.length;
    const xp = toPlain(x);
    const X = isMatrix(xp) ? toNumericMatrix(x).map(row => [1, ...row]) : normalizeVector(x).map(xi => [1, xi]);
    const p = X[0].length;
    // Pure-JS OLS — avoids MathJS matrix/array dimension edge cases
    // Xt: p×n
    const Xt = Array.from({length: p}, (_, i) => X.map(row => row[i]));
    // XtX: p×p
    const XtX = Array.from({length: p}, (_, i) =>
      Array.from({length: p}, (_, j) => X.reduce((s, row) => s + row[i] * row[j], 0)));
    // XtXinv: p×p
    const XtXinv = toPlain(math.inv(XtX));
    // Xty = Xt × yv (p,)
    const Xty = Array.from({length: p}, (_, i) => X.reduce((s, row, k) => s + row[i] * yv[k], 0));
    // b = XtXinv × Xty (p,)
    const b = XtXinv.map(row => row.reduce((s, v, k) => s + v * Xty[k], 0));
    const yhat = X.map(row => row.reduce((s, xi, i) => s + xi * b[i], 0));
    const residuals = yv.map((yi, i) => yi - yhat[i]);
    const df = n - p;
    const sse = residuals.reduce((s, ri) => s + ri * ri, 0);
    const s2 = sse / df;
    const ymean = statMean(yv);
    const sst = yv.reduce((s, yi) => s + (yi - ymean) ** 2, 0);
    const R2 = 1 - sse / sst;
    const R2adj = 1 - (1 - R2) * (n - 1) / df;
    const F = (sst - sse) / (p - 1) / s2;
    // SE from diagonal of XtXinv
    const se = XtXinv.map((row, i) => Math.sqrt(Math.abs(s2 * row[i])));
    const tStats = b.map((bi, i) => bi / se[i]);
    const pValues = tStats.map(t => 2 * (1 - _tcdfScalar(Math.abs(t), df)));
    const names = ['(Intercept)', ...Array.from({ length: p-1 }, (_, i) => `x${i+1}`)];
    const hdr = `  ${'Name'.padEnd(16)} ${'Estimate'.padStart(12)}  ${'SE'.padStart(12)}  ${'tStat'.padStart(8)}  ${'pValue'.padStart(8)}`;
    const rows = b.map((bi, i) => `  ${names[i].padEnd(16)} ${bi.toFixed(6).padStart(12)}  ${se[i].toFixed(6).padStart(12)}  ${tStats[i].toFixed(4).padStart(8)}  ${pValues[i].toFixed(4).padStart(8)}`);
    const Fpval = 1 - _betainc(F*(p-1)/(F*(p-1)+Math.max(1,df)), (p-1)/2, df/2);
    const summary = [`Linear regression model`, ``, `Coefficients:`, hdr, `  ${'-'.repeat(64)}`, ...rows, ``, `R-squared: ${R2.toFixed(6)},  Adjusted R-squared: ${R2adj.toFixed(6)}`, `F-statistic: ${F.toFixed(4)},  p-value: ${Fpval.toFixed(4)}`].join('\n');
    logs.push(summary);
    return {
      Coefficients: { Estimate: b, SE: se, tStat: tStats, pValue: pValues },
      Fitted: yhat, Residuals: residuals,
      R2, R2adj, MSE: s2, df,
      Rsquared: { Ordinary: R2, Adjusted: R2adj },
      DFE: df, NumCoefficients: p,
      ModelFitVsNullModel: { Fstat: F, Pvalue: Fpval },
    };
  });

  // pkg: no-op (all pkg lines are already stripped in preprocessLine, but register as fallback)
  parser.set("pkg", () => null);

  // corr: Pearson correlation between two vectors
  parser.set("corr", (x, y) => {
    const xv = normalizeVector(x), yv2 = normalizeVector(y);
    const mx = statMean(xv), my = statMean(yv2);
    const num = xv.reduce((s, xi, i) => s + (xi - mx) * (yv2[i] - my), 0);
    const den = Math.sqrt(
      xv.reduce((s, xi) => s + (xi - mx) ** 2, 0) *
      yv2.reduce((s, yi) => s + (yi - my) ** 2, 0));
    return den === 0 ? 0 : num / den;
  });

  // table: create a simple column-store object (Var1, Var2, ...)
  parser.set("table", (...cols) => {
    const out = {};
    cols.forEach((col, i) => { out[`Var${i + 1}`] = normalizeVector(col); });
    return out;
  });

  // plotResiduals: stub — renders residuals vs fitted or normal Q-Q
  parser.set("plotResiduals", (lm, type) => {
    const fitted = normalizeVector(lm.Fitted);
    const res = normalizeVector(lm.Residuals);
    if (String(type) === 'fitted') {
      registerPlot("scatter", fitted, res);
    } else {
      const n_r = res.length;
      const sorted = [...res].sort((a, b) => a - b);
      const zvals = sorted.map((_, i) => _norminvScalar((i + 0.5) / n_r));
      registerPlot("scatter", zvals, sorted);
    }
    return null;
  });

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

  // ── Struct support ──────────────────────────────────────────────────────────
  // struct()                     → {}
  // struct('f1',v1,'f2',v2,...)  → {f1:v1, f2:v2, ...}
  parser.set("struct", (...args) => {
    if (args.length === 0) return {};
    const out = {};
    for (let i = 0; i < args.length - 1; i += 2) {
      out[String(args[i])] = args[i + 1] ?? null;
    }
    return out;
  });
  parser.set("fieldnames", (s) => {
    if (s == null || typeof s !== "object" || Array.isArray(s)) return [];
    return Object.keys(s);
  });
  parser.set("isfield", (s, name) => {
    if (s == null || typeof s !== "object" || Array.isArray(s)) return 0;
    return Object.prototype.hasOwnProperty.call(s, String(name)) ? 1 : 0;
  });
  parser.set("rmfield", (s, name) => {
    if (s == null || typeof s !== "object" || Array.isArray(s)) return s;
    const out = { ...s };
    const names = Array.isArray(name) ? name.map(String) : [String(name)];
    names.forEach((n) => delete out[n]);
    return out;
  });
  parser.set("orderfields", (s) => {
    if (s == null || typeof s !== "object" || Array.isArray(s)) return s;
    return Object.fromEntries(Object.entries(s).sort(([a], [b]) => a.localeCompare(b)));
  });
  // Dynamic struct field access: getfield(s, fieldname) — used by patchOperators for s.(expr)
  parser.set("getfield", (s, name) => {
    if (s == null || typeof s !== "object" || Array.isArray(s)) return null;
    return s[String(name)] ?? null;
  });
  parser.set("setfield", (s, name, val) => {
    if (s == null || typeof s !== "object" || Array.isArray(s)) return s;
    return { ...s, [String(name)]: val };
  });

  // Left-division: mldivide(A, b) solves A*x = b (least-squares for non-square A)
  parser.set("mldivide", (A, b) => {
    const Ap = toPlain(A), bp = toPlain(b);
    const sz = inferSize(Ap);
    if (sz[0] !== sz[1]) {
      // Overdetermined or underdetermined: use pseudoinverse (least squares)
      return toPlain(math.multiply(math.pinv(Ap), bp));
    }
    try {
      const sol = toPlain(math.lusolve(Ap, bp));
      // lusolve returns column vector [[x1],[x2],...] — flatten if b was a 1-D array
      if (Array.isArray(sol) && Array.isArray(sol[0]) && sol[0].length === 1
          && (!Array.isArray(bp) || !Array.isArray(bp[0]))) {
        return sol.map(r => r[0]);
      }
      return sol;
    } catch {
      return toPlain(math.multiply(math.pinv(Ap), bp));
    }
  });

  // Magic square
  parser.set("magic", (n) => {
    n = Math.round(Number(n));
    if (n < 1) return [[1]];
    if (n === 1) return [[1]];
    if (n === 2) return [[1,3],[4,2]]; // no true magic 2×2 exists; return placeholder
    // Odd-order: Siamese method
    if (n % 2 === 1) {
      const m = Array.from({ length: n }, () => new Array(n).fill(0));
      let r = 0, c = Math.floor(n / 2);
      for (let num = 1; num <= n * n; num++) {
        m[r][c] = num;
        const nr = (r - 1 + n) % n, nc = (c + 1) % n;
        if (m[nr][nc] !== 0) { r = (r + 1) % n; } else { r = nr; c = nc; }
      }
      return m;
    }
    // Doubly-even (divisible by 4): complement swap method
    if (n % 4 === 0) {
      const m = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => i * n + j + 1));
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (((Math.floor(i / (n / 4)) + Math.floor(j / (n / 4))) % 2) === 0) m[i][j] = n * n + 1 - m[i][j];
      }
      return m;
    }
    // Singly-even (n = 4k+2): LUX method fallback — use simple row-fill
    const m = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => i * n + j + 1));
    return m; // not a true magic square but avoids crash
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
  const symVars = new Set(); // variable names declared via syms
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
    const trimmedRaw = stripMatlabComment(rawLine).trim();
    if (!trimmedRaw) return null;
    const hasSemicolon = /;\s*$/.test(trimmedRaw);
    const withoutSemicolon = trimmedRaw.replace(/;\s*$/, "");
    if (/^clear(\s+.+)?$/i.test(withoutSemicolon)) {
      const args = withoutSemicolon.replace(/^clear/i, "").trim().split(/\s+/).filter(Boolean);
      engine.clearVariables(args);
      return null;
    }

    // ── syms x y z  — declare symbolic variables ──────────────────────────────
    // OpenMAT is numeric-first but accepts syms so MATLAB/Octave scripts load
    // without crashing. Symbolic variables are stored as string sentinels and
    // basic CAS ops (diff, simplify, subs) are handled via mathjs.parse().
    const symsMatch = withoutSemicolon.match(/^syms\s+([\w\s]+)$/i);
    if (symsMatch) {
      const names = symsMatch[1].trim().split(/\s+/).filter(n => /^[A-Za-z_]\w*$/.test(n));
      names.forEach(name => {
        symVars.add(name);
        variables.add(name);
        parser.set(name, { __sym: name, toString: () => name });
      });
      return hasSemicolon ? null : names.join('  ');
    }

    // Build a __sym result from a mathjs Node.
    // 1-D ArrayNodes become a real JS array of __sym objects so that length(),
    // size(), and indexing all work without crashing mathjs built-ins.
    const symResult = (node) => {
      try { node = math.simplify(node); } catch {}
      if (node.type === 'ArrayNode') {
        const items = node.items ?? [];
        if (items.length > 0 && items[0].type !== 'ArrayNode') {
          // 1-D row — return plain JS array of individual __sym objects
          return items.map(item => {
            try { item = math.simplify(item); } catch {}
            const s = item.toString();
            return { __sym: s, toString: () => s };
          });
        }
      }
      const s = node.toString();
      return { __sym: s, __shape: [1, 1], toString: () => s };
    };

    // Resolve an expression: if it's a bare variable name holding __sym, return
    // that string; otherwise return the string unchanged.
    const resolveSymExpr = (str) => {
      const s = str.trim();
      try { const v = parser.get(s); if (isSymObj(v)) return String(v.__sym); } catch {}
      return s;
    };

    // Recursively resolve nested sym functions (expand, etc.) to an expr string.
    const evalSymFn = (exprStr) => {
      const direct = resolveSymExpr(exprStr);
      if (direct !== exprStr) return direct;
      const expandM = exprStr.match(/^expand\((.+)\)$/i);
      if (expandM) {
        const inner = evalSymFn(expandM[1].trim());
        try { let n = math.parse(inner); try { n = math.simplify(n); } catch {} return n.toString(); }
        catch { return inner; }
      }
      return exprStr;
    };

    // Extract polynomial coefficients (highest degree first) via repeated
    // differentiation at x = 0, matching MATLAB's sym2poly behaviour.
    const extractPolyCoeffs = (exprStr, varName = 'x') => {
      const MAX = 8;
      const byDeg = new Array(MAX + 1).fill(0);
      let node = math.parse(exprStr);
      for (let n = 0; n <= MAX; n++) {
        try {
          const val = Number(node.compile().evaluate({ [varName]: 0 }));
          let fact = 1; for (let i = 1; i <= n; i++) fact *= i;
          byDeg[n] = Math.round((val / fact) * 1e10) / 1e10;
        } catch { break; }
        if (n < MAX) { try { node = math.derivative(node, varName); } catch { break; } }
      }
      let hi = MAX;
      while (hi > 0 && Math.abs(byDeg[hi]) < 1e-9) hi--;
      const result = [];
      for (let i = hi; i >= 0; i--) result.push(byDeg[i]);
      return result.length ? result : [0];
    };

    // Returns true when the expression string contains any bare syms variable.
    const exprHasSymVars = (expr) => {
      for (const name of symVars) if (new RegExp(`\\b${name}\\b`).test(expr)) return true;
      return false;
    };

    // ── diff(expr, var[, order]) ──────────────────────────────────────────────
    const diffMatch = withoutSemicolon.match(/^([A-Za-z_]\w*\s*=\s*)?diff\(\s*([^,]+?)\s*,\s*([A-Za-z_]\w*)\s*(?:,\s*(\d+))?\s*\)$/i);
    if (diffMatch && symVars.size > 0) {
      const [, assignLhs, rawExpr, varName] = diffMatch;
      const order = parseInt(diffMatch[4] ?? '1', 10);
      try {
        let node = math.parse(evalSymFn(rawExpr));
        for (let i = 0; i < order; i++) node = math.derivative(node, varName);
        const result = symResult(node);
        if (assignLhs) { const lhs = assignLhs.replace(/\s*=\s*$/, '').trim(); parser.set(lhs, result); variables.add(lhs); }
        const display = Array.isArray(result) ? result.map(r=>r.__sym).join('  ') : result.__sym;
        if (!hasSemicolon) logs.push(`${assignLhs ? assignLhs.replace(/\s*=\s*$/,'').trim() : 'ans'} =\n${display}`);
        return hasSemicolon ? null : result;
      } catch { /* fall through */ }
    }

    // ── simplify(expr) ────────────────────────────────────────────────────────
    const simplifyMatch = withoutSemicolon.match(/^([A-Za-z_]\w*\s*=\s*)?simplify\(\s*([^)]+?)\s*\)$/i);
    if (simplifyMatch && symVars.size > 0) {
      const [, assignLhs, rawExpr] = simplifyMatch;
      try {
        const result = symResult(math.parse(evalSymFn(rawExpr)));
        if (assignLhs) { const lhs = assignLhs.replace(/\s*=\s*$/, '').trim(); parser.set(lhs, result); variables.add(lhs); }
        const display = Array.isArray(result) ? result.map(r=>r.__sym).join('  ') : result.__sym;
        if (!hasSemicolon) logs.push(`${assignLhs ? assignLhs.replace(/\s*=\s*$/,'').trim() : 'ans'} =\n${display}`);
        return hasSemicolon ? null : result;
      } catch { /* fall through */ }
    }

    // ── expand(expr) — polynomial expansion ──────────────────────────────────
    const expandMatch = withoutSemicolon.match(/^([A-Za-z_]\w*\s*=\s*)?expand\(\s*(.+?)\s*\)$/i);
    if (expandMatch && symVars.size > 0) {
      const [, assignLhs, rawExpr] = expandMatch;
      try {
        const result = symResult(math.parse(evalSymFn(rawExpr)));
        if (assignLhs) { const lhs = assignLhs.replace(/\s*=\s*$/, '').trim(); parser.set(lhs, result); variables.add(lhs); }
        const display = Array.isArray(result) ? result.map(r=>r.__sym).join('  ') : result.__sym;
        if (!hasSemicolon) logs.push(`${assignLhs ? assignLhs.replace(/\s*=\s*$/,'').trim() : 'ans'} =\n${display}`);
        return hasSemicolon ? null : result;
      } catch { /* fall through */ }
    }

    // ── sym2poly(expr) ────────────────────────────────────────────────────────
    const sym2polyMatch = withoutSemicolon.match(/^([A-Za-z_]\w*\s*=\s*)?sym2poly\(\s*(.+?)\s*\)$/i);
    if (sym2polyMatch && symVars.size > 0) {
      const [, assignLhs, rawExpr] = sym2polyMatch;
      try {
        const coeffs = extractPolyCoeffs(evalSymFn(rawExpr));
        if (assignLhs) { const lhs = assignLhs.replace(/\s*=\s*$/, '').trim(); parser.set(lhs, coeffs); variables.add(lhs); }
        if (!hasSemicolon) logs.push(`${assignLhs ? assignLhs.replace(/\s*=\s*$/,'').trim() : 'ans'} =\n${formatValue(coeffs)}`);
        return hasSemicolon ? null : coeffs;
      } catch { /* fall through */ }
    }

    // ── subs(expr, var, val) ──────────────────────────────────────────────────
    const subsMatch = withoutSemicolon.match(/^([A-Za-z_]\w*\s*=\s*)?subs\(\s*([^,]+?)\s*,\s*([A-Za-z_]\w*)\s*,\s*([^)]+?)\s*\)$/i);
    if (subsMatch) {
      const [, assignLhs, rawExpr, varName, valStr] = subsMatch;
      try {
        const val = toPlain(parser.evaluate(preprocessLine(valStr.trim(), variables, functionNames)));
        const evaluated = toPlain(math.parse(evalSymFn(rawExpr)).compile().evaluate({ [varName]: val }));
        if (assignLhs) { const lhs = assignLhs.replace(/\s*=\s*$/, '').trim(); parser.set(lhs, evaluated); variables.add(lhs); }
        if (!hasSemicolon) logs.push(`${assignLhs ? assignLhs.replace(/\s*=\s*$/,'').trim() : 'ans'} =\n${formatValue(evaluated)}`);
        return hasSemicolon ? null : evaluated;
      } catch { /* fall through */ }
    }

    // ── General symbolic intercept ────────────────────────────────────────────
    // Only fires for expressions that contain a bare sym variable (x, y …).
    // Derived variables (B, f, image…) are NOT in symVars so numeric code that
    // references them is not incorrectly intercepted.
    if (symVars.size > 0 && exprHasSymVars(withoutSemicolon)) {
      const simpleAssign = withoutSemicolon.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
      const rhsRaw  = simpleAssign ? simpleAssign[2].trim() : withoutSemicolon;
      const lhsName = simpleAssign ? simpleAssign[1].trim() : null;
      const mjsRhs  = rhsRaw.replace(/\.\^/g, '^').replace(/\.\*/g, '*').replace(/\.\//g, '/');
      try {
        const result = symResult(math.parse(mjsRhs));
        if (lhsName) {
          parser.set(lhsName, result); variables.add(lhsName);
          // Do NOT add lhsName to symVars — only bare syms variables live there.
          const display = Array.isArray(result) ? result.map(r=>r.__sym).join('  ') : result.__sym;
          if (!hasSemicolon) logs.push(`${lhsName} =\n${display}`);
        } else {
          const display = Array.isArray(result) ? result.map(r=>r.__sym).join('  ') : result.__sym;
          if (!hasSemicolon) logs.push(`ans =\n${display}`);
        }
        return hasSemicolon ? null : result;
      } catch { /* fall through */ }
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
          // When any argument is symbolic, substitute into the body symbolically
          // instead of evaluating numerically.
          if (args.some(a => isSymObj(a) || isSymArr(a))) {
            let exprBody = bodyRaw.replace(/\.\^/g, '^').replace(/\.\*/g, '*').replace(/\.\//g, '/');
            params.forEach((param, idx) => {
              const arg = args[idx];
              const argStr = isSymObj(arg) ? `(${arg.__sym})`
                           : isSymArr(arg) ? `[${arg.map(a=>a.__sym).join(', ')}]`
                           : String(args[idx] ?? 0);
              exprBody = exprBody.replace(new RegExp(`\\b${param}\\b`, 'g'), argStr);
            });
            try { return symResult(math.parse(exprBody)); } catch(e) { throw e; }
          }
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
        const rhs = replaceBackslash(preprocessLine(multiAssign[2], variables, functionNames));
        const result = toPlain(parser.evaluate(rhs));
        const values = result?.__multi ?? (Array.isArray(result) ? result : []);
        names.forEach((name, idx) => { parser.set(name, values[idx]); variables.add(name); });
        return hasSemicolon ? null : (values.length === 1 ? values[0] : values);
      }
      const indexedAssign = line.match(/^([A-Za-z_]\w*)\[([^\]]+)\]\s*=\s*(.+)$/);
      if (indexedAssign) {
        const [, name, idxExpr, valExpr] = indexedAssign;
        let arr = parser.get(name);
        const val = toPlain(parser.evaluate(valExpr));

        // Helper: evaluate an index expression with 'end' expanded.
        // A bare ':' means "all indices" — handle it before calling the parser
        // so we never pass ':' to mathjs (which would fail with "Undefined symbol end").
        const evalIdx = (expr, len) => {
          const trimmed = String(expr).trim();
          if (trimmed === ":") return Array.from({ length: len }, (_, k) => k + 1);
          const expanded = trimmed.replace(/\bend\b/g, String(len));
          const result = toPlain(parser.evaluate(expanded));
          return isCollection(result) ? normalizeVector(result).map(Number) : [Number(result)];
        };

        // Split top-level comma to detect 1D vs 2D indexing
        const topCommas = [];
        let depth = 0;
        for (let ci = 0; ci < idxExpr.length; ci++) {
          const ch = idxExpr[ci];
          if (ch === '(' || ch === '[' || ch === '{') depth++;
          else if (ch === ')' || ch === ']' || ch === '}') depth--;
          else if (ch === ',' && depth === 0) topCommas.push(ci);
        }

        if (topCommas.length === 0) {
          // ── 1D indexing: A[i] = val ──────────────────────────────────────
          // Evaluate raw to detect logical (boolean) mask vs integer indices
          const rawIdxResult = toPlain(parser.evaluate(idxExpr.replace(/\bend\b/g, String(Array.isArray(arr) ? arr.length : 1))));
          const flatRaw = Array.isArray(rawIdxResult) ? rawIdxResult.flat(Infinity) : [rawIdxResult];
          const isLogicalMask = flatRaw.length > 0 && flatRaw.every(x => typeof x === 'boolean');
          if (isLogicalMask && Array.isArray(rawIdxResult) && Array.isArray(rawIdxResult[0])) {
            // 2D logical indexing: A(boolMatrix) = scalar — set elements where mask is true
            const numVal = Number(val);
            const result = (toNumericMatrix(arr) || arr).map((row, i) =>
              row.map((elem, j) => (rawIdxResult[i]?.[j] ? numVal : elem))
            );
            parser.set(name, result);
          } else if (isLogicalMask) {
            // 1D logical indexing
            const updated = [...normalizeVector(arr)];
            flatRaw.forEach((b, i) => { if (b) updated[i] = Number(val); });
            parser.set(name, updated);
          } else {
            // Integer indexing (existing path)
            const updated = Array.isArray(arr) ? [...arr] : arr;
            const indices = evalIdx(idxExpr, Array.isArray(updated) ? updated.length : 1);
            if (indices.length === 1) {
              if (Array.isArray(updated)) updated[indices[0] - 1] = val;
            } else {
              // Range assignment: A(2:5) = [...]
              const vals = isCollection(val) ? normalizeVector(val) : indices.map(() => val);
              indices.forEach((idx, k) => { if (Array.isArray(updated)) updated[idx - 1] = vals[k] ?? val; });
            }
            parser.set(name, updated);
          }
        } else if (topCommas.length === 1) {
          // ── 2D indexing: A[i,j] = val ────────────────────────────────────
          const rowExpr = idxExpr.slice(0, topCommas[0]).trim();
          const colExpr = idxExpr.slice(topCommas[0] + 1).trim();

          // Ensure arr is a 2D matrix
          let mat = toNumericMatrix(arr);
          if (!mat) {
            // Not yet a matrix — initialise as a 1×1 or grow as needed
            mat = [[Number(arr) || 0]];
          }
          mat = mat.map(r => [...r]); // deep copy

          const nRows = mat.length;
          const nCols = mat[0]?.length ?? 0;

          // ── Deletion: M(i,:)=[] removes row; M(:,j)=[] removes column ──────
          const isEmpty = Array.isArray(val) && val.flat(Infinity).length === 0;
          const rowIsColon = rowExpr.trim() === ":";
          const colIsColon = colExpr.trim() === ":";
          if (isEmpty) {
            if (colIsColon && !rowIsColon) {
              // M(i,:) = [] → delete row(s)
              const toDelete = new Set(evalIdx(rowExpr, nRows).map(r => r - 1));
              parser.set(name, mat.filter((_, r) => !toDelete.has(r)));
            } else if (rowIsColon && !colIsColon) {
              // M(:,j) = [] → delete column(s)
              const toDelete = new Set(evalIdx(colExpr, nCols).map(c => c - 1));
              parser.set(name, mat.map(row => row.filter((_, c) => !toDelete.has(c))));
            }
            variables.add(name);
            if (!hasSemicolon) { const _v = parser.get(name); if (_v != null) logs.push(`${name} =\n${formatValue(_v)}`); }
            return hasSemicolon ? null : parser.get(name);
          }

          const rowIdxs = evalIdx(rowExpr, nRows);
          const colIdxs = evalIdx(colExpr, nCols);

          // Grow matrix if needed
          const maxRow = Math.max(...rowIdxs);
          const maxCol = Math.max(...colIdxs);
          while (mat.length < maxRow) mat.push(Array(mat[0]?.length ?? maxCol).fill(0));
          mat.forEach(r => { while (r.length < maxCol) r.push(0); });

          // Assign value(s)
          const valFlat = isCollection(val) ? normalizeVector(val) : null;
          let vi = 0;
          rowIdxs.forEach(ri => {
            colIdxs.forEach(ci => {
              const v = valFlat ? (valFlat[vi++] ?? 0) : Number(val);
              mat[ri - 1][ci - 1] = v;
            });
          });
          parser.set(name, mat);
        }

        variables.add(name);
        if (!hasSemicolon) { const _v = parser.get(name); if (_v != null) logs.push(`${name} =\n${formatValue(_v)}`); }
        return hasSemicolon ? null : parser.get(name);
      }

      const assign = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
      if (assign) {
        const [, name, expr] = assign;
        const result = toPlain(parser.evaluate(replaceBackslash(expr)));
        parser.set(name, result);
        parser.set("ans", result);
        variables.add(name);
        if (!hasSemicolon && result != null && result !== "") {
          logs.push(`${name} =\n${formatValue(result)}`);
        }
        return hasSemicolon ? null : result;
      }
      const result = toPlain(parser.evaluate(replaceBackslash(line)));
      parser.set("ans", result);
      if (!hasSemicolon && result != null && result !== "") {
        logs.push(`ans =\n${formatValue(result)}`);
      }
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
        const condExpr = replaceBackslash(preprocessLine(branch.cond.replace(/;\s*$/, ""), variables, functionNames));
        const condVal = toPlain(parser.evaluate(condExpr));
        if (isTruthy(condVal)) return executeBlock(branch.body);
      }
      if (node.elseBody) return executeBlock(node.elseBody);
      return null;
    }
    if (node.type === "for") {
      const iterExpr = replaceBackslash(preprocessLine(node.iterExpr.replace(/;\s*$/, ""), variables, functionNames));
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
        const condExpr = replaceBackslash(preprocessLine(node.condExpr.replace(/;\s*$/, ""), variables, functionNames));
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
      const exprPrep = replaceBackslash(preprocessLine(String(node.expr).replace(/;\s*$/, ""), variables, functionNames));
      let switchVal;
      try { switchVal = toPlain(parser.evaluate(exprPrep)); } catch { return null; }
      for (const caseNode of node.cases) {
        const casePrep = replaceBackslash(preprocessLine(String(caseNode.val).replace(/;\s*$/, ""), variables, functionNames));
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
      const code = stripMatlabComment(rawLine);
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

  // Rejoin lines where a real newline was accidentally embedded inside a string
  // literal (e.g. `\n` in a JS template literal becomes a real newline in the
  // stored code).  Replace the embedded newline with the two-char MATLAB escape
  // sequence \n so fprintf/sprintf still interpret it correctly.
  function joinUnclosedStrings(src) {
    // In MATLAB, ' is EITHER a string delimiter OR the transpose operator.
    // It is transpose when immediately preceded (ignoring nothing — no space) by:
    //   ), ], or a word character (identifier/digit).
    // In all other positions (after =, (, [, ,, ;, operators, start-of-line)
    // it opens a string.  Misidentifying transpose as string-opener causes the
    // rest of the line and following lines to be silently joined.
    function isTransposeQuote(str, pos) {
      // Scan left from pos-1 to find the first non-space char
      let j = pos - 1;
      while (j >= 0 && (str[j] === ' ' || str[j] === '\t')) j--;
      if (j < 0) return false;
      // A ' immediately after ), ], a word char, or another ' (double-transpose) is the transpose operator
      return /[)\]\w']/.test(str[j]);
    }

    const rawLines = src.split(/\r?\n/);
    const out = [];
    let pending = null;
    for (const line of rawLines) {
      const working = pending !== null ? pending + "\\n" + line : line;
      let inStr = false;
      let strCh = null;
      for (let i = 0; i < working.length; i++) {
        const c = working[i];
        if (inStr) {
          if (c === strCh) { inStr = false; strCh = null; }
        } else {
          if (c === "%") break;
          if (c === '"') { inStr = true; strCh = c; }
          else if (c === "'") {
            if (!isTransposeQuote(working, i)) { inStr = true; strCh = c; }
          }
        }
      }
      if (inStr) { pending = working; }
      else { out.push(working); pending = null; }
    }
    if (pending !== null) out.push(pending);
    return out.join("\n");
  }

  // Rejoin lines that are broken inside an open matrix literal [ ... ] across
  // multiple real newlines (e.g. from a JS template literal with embedded \n).
  // Rows are separated by a space so the bracket scanner still sees them as
  // one logical line; MATLAB semicolons already separate rows inside matrices.
  function joinUnclosedBrackets(src) {
    // Strip inline comment from a line for bracket-depth counting only.
    // Must respect strings so a '%' inside 'foo%bar' is not treated as a comment.
    function stripComment(line) {
      let inStr = false, strCh = null;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (inStr) { if (c === strCh) { inStr = false; strCh = null; } }
        else if (c === "'" || c === '"') { inStr = true; strCh = c; }
        else if (c === "%") return line.slice(0, i);
      }
      return line;
    }
    function countBracketDelta(text) {
      let inStr = false, strCh = null, delta = 0;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inStr) { if (c === strCh) { inStr = false; strCh = null; } }
        else if (c === "%") break;
        else if (c === '"') { inStr = true; strCh = c; }
        else if (c === "'") {
          // Only treat as string if not a transpose
          let j = i - 1;
          while (j >= 0 && (text[j] === ' ' || text[j] === '\t')) j--;
          if (j < 0 || !/[)\]\w']/.test(text[j])) { inStr = true; strCh = c; }
        }
        else if (c === "[") delta++;
        else if (c === "]") delta--;
      }
      return delta;
    }

    const rawLines = src.split(/\r?\n/);
    const out = [];
    let depth = 0;
    let pendingRaw = "";   // raw lines (with comments) for output
    for (const line of rawLines) {
      const combined = pendingRaw ? pendingRaw + " " + line.trim() : line;
      // Count delta using comment-stripped version of the NEW line only
      depth += countBracketDelta(stripComment(line));
      if (depth > 0) {
        pendingRaw = combined;
      } else {
        out.push(combined);
        pendingRaw = "";
        depth = 0;
      }
    }
    if (pendingRaw) out.push(pendingRaw);
    return out.join("\n");
  }

  // Replace MATLAB short-circuit operators && and || with mathjs equivalents.
  // Also replace dynamic struct field access s.(expr) → getfield(s,expr).
  // Also replace MATLAB left-division operator \ → mldivide(left, right).
  // Must operate outside strings and comments.
  function patchOperators(src) {
    return src.split(/\r?\n/).map(line => {
      let result = "";
      let inStr = false, strCh = null;
      let i = 0;
      while (i < line.length) {
        const c = line[i];
        if (inStr) {
          result += c;
          if (c === strCh) { inStr = false; strCh = null; }
          i++;
          continue;
        }
        if (c === "%") { result += line.slice(i); break; }
        if (c === '"') { inStr = true; strCh = c; result += c; i++; continue; }
        if (c === "'") {
          // transpose check
          let j = result.trimEnd().length - 1;
          const prev = j >= 0 ? result.trimEnd()[j] : "";
          if (/[)\]\w]/.test(prev)) { result += c; i++; continue; }
          inStr = true; strCh = c; result += c; i++; continue;
        }
        // && → and
        if (line[i] === "&" && line[i + 1] === "&") { result += " and "; i += 2; continue; }
        // || → or
        if (line[i] === "|" && line[i + 1] === "|") { result += " or "; i += 2; continue; }
        // MATLAB ~= (not-equal) → !=
        if (c === "~" && line[i + 1] === "=") { result += "!="; i += 2; continue; }
        // MATLAB .'' (non-conjugate transpose): A.' → transpose(A)
        // Detect the pattern: a word/closing-bracket followed by .'
        if (c === "." && line[i + 1] === "'") {
          // Check if the character before . is an operand end (word char or closing bracket)
          const prevTrimmed = result.trimEnd();
          const lastCh = prevTrimmed.slice(-1);
          if (/[\w)\]]/.test(lastCh)) {
            // Scan back to find the full left operand
            let objEnd = prevTrimmed.length;
            let objStart = objEnd - 1;
            if (lastCh === ")" || lastCh === "]") {
              const close = lastCh, open = close === ")" ? "(" : "[";
              let d = 1; objStart--;
              while (objStart >= 0 && d > 0) {
                if (prevTrimmed[objStart] === close) d++;
                else if (prevTrimmed[objStart] === open) d--;
                if (d > 0) objStart--;
              }
              // include any identifier before the bracket
              while (objStart > 0 && /[\w]/.test(prevTrimmed[objStart - 1])) objStart--;
            } else {
              while (objStart > 0 && /[\w]/.test(prevTrimmed[objStart - 1])) objStart--;
            }
            const prefix = prevTrimmed.slice(0, objStart);
            const obj = prevTrimmed.slice(objStart, objEnd);
            result = prefix + `transpose(${obj})`;
            i += 2; // skip .' 
            continue;
          }
        }
        // MATLAB ~ (logical NOT prefix) → not(...)
        // Only treat as NOT when ~ appears at a position where a value is expected
        // (i.e. after an operator, open bracket, or at start-of-expression).
        if (c === "~" && line[i + 1] !== "=") {
          const prevTrimmedNot = result.trimEnd();
          const lastChNot = prevTrimmedNot.slice(-1);
          const afterOperator = !lastChNot || /[=+\-*/<>!&|,(\[{]/.test(lastChNot);
          if (afterOperator) {
            // Scan forward to grab the next token/expression to negate
            let j = i + 1;
            while (j < line.length && line[j] === " ") j++;
            const startToken = j;
            if (line[j] === "(") {
              // find matching )
              let depth = 1; j++;
              while (j < line.length && depth > 0) {
                if (line[j] === "(") depth++;
                else if (line[j] === ")") depth--;
                j++;
              }
            } else {
              // scan a simple identifier or number
              while (j < line.length && /[\w.]/.test(line[j])) j++;
              // if followed by (, grab that too (function call)
              if (line[j] === "(") {
                let depth = 1; j++;
                while (j < line.length && depth > 0) {
                  if (line[j] === "(") depth++;
                  else if (line[j] === ")") depth--;
                  j++;
                }
              }
            }
            if (j > startToken) {
              const token = line.slice(startToken, j);
              result += `not(${token})`;
              i = j;
              continue;
            }
          }
        }
        // dynamic field: identifier.(expr) — find the opening ( and matching )
        // handled as getfield(identifier, expr) by detecting .(
        if (c === "." && line[i + 1] === "(") {
          // find the object expression to the left
          let objEnd = result.trimEnd().length - 1;
          if (objEnd >= 0) {
            const trimmed = result.trimEnd();
            let objStart = objEnd;
            if (trimmed[objEnd] === ")") {
              let d = 0, j2 = objEnd;
              while (j2 >= 0) {
                if (trimmed[j2] === ")") d++;
                else if (trimmed[j2] === "(") { if (!--d) { objStart = j2; break; } }
                j2--;
              }
            } else {
              while (objStart > 0 && /[\w]/.test(trimmed[objStart - 1])) objStart--;
            }
            const obj = trimmed.slice(objStart);
            const prefix = trimmed.slice(0, objStart);
            // find matching ) for .(
            let depth = 0, j3 = i + 1, fieldExpr = "";
            while (j3 < line.length) {
              const ch = line[j3];
              if (ch === "(") depth++;
              else if (ch === ")") { if (!--depth) { j3++; break; } }
              fieldExpr += ch;
              j3++;
            }
            fieldExpr = fieldExpr.slice(1); // remove leading (
            result = prefix + `getfield(${obj},${fieldExpr})`;
            i = j3;
            continue;
          }
        }
        result += c;
        i++;
      }
      return result;
    }).join("\n");
  }

  // Replace MATLAB left-division A\B with mldivide(A,B).
  function replaceBackslashDiv(src) {
    return src.split(/\r?\n/).map(line => {
      let inStr = false, strCh = null;
      const bsPos = [];
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (inStr) { if (c === strCh) { inStr = false; strCh = null; } }
        else if (c === "%") break;
        else if (c === '"') { inStr = true; strCh = c; }
        else if (c === "'") {
          let j = i - 1;
          while (j >= 0 && (line[j] === " " || line[j] === "\t")) j--;
          if (j < 0 || !/[)\]\w']/.test(line[j])) { inStr = true; strCh = c; }
        }
        else if (c === "\\") bsPos.push(i);
      }
      if (!bsPos.length) return line;
      let out = line;
      for (let pi = bsPos.length - 1; pi >= 0; pi--) {
        const bs = bsPos[pi];
        // find left operand end
        let li = bs - 1;
        while (li >= 0 && out[li] === " ") li--;
        if (li < 0) continue;
        let leftEnd = li, leftStart;
        if (out[li] === ")") {
          let d = 0, j = li;
          for (; j >= 0; j--) { if (out[j] === ")") d++; else if (out[j] === "(") { if (!--d) { leftStart = j; break; } } }
          let k = leftStart - 1; while (k >= 0 && out[k] === " ") k--;
          if (k >= 0 && out[k] === "-") {
            let pk = k - 1; while (pk >= 0 && out[pk] === " ") pk--;
            if (pk < 0 || !/[\w)\]]/.test(out[pk])) leftStart = k;
          }
        } else {
          leftStart = li;
          while (leftStart > 0 && /[\w.]/.test(out[leftStart - 1])) leftStart--;
          let k = leftStart - 1; while (k >= 0 && out[k] === " ") k--;
          if (k >= 0 && out[k] === "-") {
            let pk = k - 1; while (pk >= 0 && out[pk] === " ") pk--;
            if (pk < 0 || !/[\w)\]]/.test(out[pk])) leftStart = k;
          }
        }
        // find right operand
        let ri = bs + 1; while (ri < out.length && out[ri] === " ") ri++;
        if (ri >= out.length) continue;
        let rightStart = ri, rightEnd, rr = ri;
        if (out[rr] === "-") rr++;
        if (rr < out.length && out[rr] === "(") {
          let d = 0, j = rr;
          for (; j < out.length; j++) { if (out[j] === "(") d++; else if (out[j] === ")") { if (!--d) { rightEnd = j; break; } } }
        } else {
          rightEnd = rr;
          while (rightEnd + 1 < out.length && /[\w.]/.test(out[rightEnd + 1])) rightEnd++;
          if (rightEnd + 1 < out.length && out[rightEnd + 1] === "(") {
            let d = 0, j = rightEnd + 1;
            for (; j < out.length; j++) { if (out[j] === "(") d++; else if (out[j] === ")") { if (!--d) { rightEnd = j; break; } } }
          }
        }
        if (rightEnd === undefined) continue;
        const left = out.slice(leftStart, leftEnd + 1).trim();
        const right = out.slice(rightStart, rightEnd + 1).trim();
        out = out.slice(0, leftStart) + `mldivide(${left},${right})` + out.slice(rightEnd + 1);
      }
      return out;
    }).join("\n");
  }

  const normalizedSource = expandMidLineSemicolons(joinContinuationLines(replaceBackslashDiv(patchOperators(joinUnclosedBrackets(joinUnclosedStrings(source))))));
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
