import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useThemeColors, withAlpha } from "../../hooks/useThemeColors";

// ─────────────────────────────────────────────────────────────────────────────
// ACCENT COLORS — one fixed hue per topic tab, intentionally NOT sourced from
// useThemeColors(). Mirrors that hook's own "deliberately fixed... should stay
// recognizable regardless of which studio theme is active" philosophy for its
// teal/amber/green/red/purple/orange fields — extended here to all 7 tabs
// (including cyan/blue, which the hook doesn't offer as fixed values) so the
// tab set stays a stable, mutually-distinguishable palette no matter which
// Studio Theme is active. Neutrals (backgrounds/text/borders) come from
// useThemeColors() instead — see the `C = useThemeColors()` call in each
// component below.
// ─────────────────────────────────────────────────────────────────────────────
const ACCENT = {
  cyan: "#00d4ff",
  green: "#00e096",
  amber: "#ffb300",
  red: "#ff4466",
  purple: "#c084fc",
  blue: "#60a5fa",
} as const;

const ACCENT_DIM = {
  green: ACCENT.green + "18",
  amber: ACCENT.amber + "18",
  red: ACCENT.red + "18",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// MATH HELPERS
// ─────────────────────────────────────────────────────────────────────────────
type Vec3 = [number, number, number];
type Row3 = [number, number, number];
type Row4 = [number, number, number, number];
type Mat3 = [Row3, Row3, Row3];
type Mat4Rows = [Row4, Row4, Row4, Row4];

const rad = (d: number): number => (d * Math.PI) / 180;
const f2 = (n: number): string => {
  const v = Math.abs(n) < 5e-4 ? 0 : n;
  return (v >= 0 ? " " : "") + v.toFixed(3);
};
const f3 = (n: number): string => {
  const v = Math.abs(n) < 5e-4 ? 0 : n;
  return v.toFixed(4);
};
const f1 = (n: number): string => (Math.abs(n) < 5e-4 ? 0 : n).toFixed(2);

function getRows(m: THREE.Matrix4): Mat4Rows {
  const e = m.elements; // column-major
  return [
    [e[0], e[4], e[8], e[12]],
    [e[1], e[5], e[9], e[13]],
    [e[2], e[6], e[10], e[14]],
    [e[3], e[7], e[11], e[15]],
  ];
}
function det3(r: Mat3): number {
  return (
    r[0][0] * (r[1][1] * r[2][2] - r[1][2] * r[2][1]) -
    r[0][1] * (r[1][0] * r[2][2] - r[1][2] * r[2][0]) +
    r[0][2] * (r[1][0] * r[2][1] - r[1][1] * r[2][0])
  );
}
function dot3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function magV(v: Vec3): number {
  return Math.sqrt(dot3(v, v));
}

// Row-reduce a 3×3 (for RREF display)
function rref3(M: Mat3): { result: Mat3; steps: Mat3[] } {
  const A = M.map((r) => [...r]) as Mat3;
  const steps: Mat3[] = [];
  let pivotRow = 0;
  for (let col = 0; col < 3 && pivotRow < 3; col++) {
    let best = pivotRow;
    for (let r = pivotRow + 1; r < 3; r++) if (Math.abs(A[r][col]) > Math.abs(A[best][col])) best = r;
    if (Math.abs(A[best][col]) < 1e-9) continue;
    [A[pivotRow], A[best]] = [A[best], A[pivotRow]];
    const pv = A[pivotRow][col];
    for (let c = 0; c < 3; c++) A[pivotRow][c] /= pv;
    steps.push(A.map((r) => [...r]) as Mat3);
    for (let r = 0; r < 3; r++) {
      if (r === pivotRow) continue;
      const f = A[r][col];
      for (let c = 0; c < 3; c++) A[r][c] -= f * A[pivotRow][c];
    }
    steps.push(A.map((r) => [...r]) as Mat3);
    pivotRow++;
  }
  return { result: A, steps };
}

const IDENTITY_ROWS: Mat4Rows = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

function to3x3(rows: Mat4Rows): Mat3 {
  return [rows[0].slice(0, 3) as Row3, rows[1].slice(0, 3) as Row3, rows[2].slice(0, 3) as Row3];
}

// ─────────────────────────────────────────────────────────────────────────────
// UI ATOMS — each calls useThemeColors() itself (cheap, self-contained; see
// the hook's own top comment about being designed for exactly this reuse).
// ─────────────────────────────────────────────────────────────────────────────
function Tag({ children, color = ACCENT.cyan }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block", padding: "1px 7px",
        background: color + "22", border: `1px solid ${color}55`,
        borderRadius: 3, fontSize: 9, letterSpacing: 2, color,
        fontFamily: "'Space Mono',monospace", fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function Def({ term, color = ACCENT.cyan, children }: { term: string; color?: string; children: React.ReactNode }) {
  const C = useThemeColors();
  return (
    <div style={{ padding: "10px 14px", background: C.surface2, border: `1px solid ${color}33`, borderRadius: 6, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <Tag color={color}>DEFINITION</Tag>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'Space Mono',monospace" }}>{term}</span>
      </div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function Insight({ label, color = ACCENT.green, children }: { label: string; color?: string; children: React.ReactNode }) {
  const C = useThemeColors();
  return (
    <div style={{ padding: "10px 14px", background: color + "0d", border: `1px solid ${color}33`, borderRadius: 6, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color, letterSpacing: 2, fontWeight: 700, marginBottom: 4, fontFamily: "'Space Mono',monospace" }}>
        ↳ {label}
      </div>
      <div style={{ fontSize: 11, color: C.text, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function Eq({ children }: { children: React.ReactNode }) {
  const C = useThemeColors();
  return (
    <div
      style={{
        fontFamily: "'Space Mono',monospace", fontSize: 12,
        background: C.surface2, border: `1px solid ${withAlpha(C.border, "33")}`,
        borderRadius: 4, padding: "7px 12px", lineHeight: 2,
        color: C.text, overflowX: "auto", marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function Matrix4({ rows, hlCells }: { rows: Mat4Rows; hlCells: [number, number, string][] | null }) {
  const C = useThemeColors();
  const hlMap: Record<string, string> = {};
  (hlCells || []).forEach(([r, c, col]) => { hlMap[`${r},${c}`] = col; });
  return (
    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, lineHeight: 2.1, display: "inline-block" }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: C.hint, fontSize: 14, marginRight: 2 }}>{ri === 0 ? "⎡" : ri === 3 ? "⎣" : "⎢"}</span>
          {row.map((v, ci) => {
            const hlCol = hlMap[`${ri},${ci}`];
            return (
              <span
                key={ci}
                style={{
                  minWidth: 58, textAlign: "right", paddingRight: 6,
                  color: hlCol || C.muted,
                  background: hlCol ? hlCol + "22" : "transparent",
                  borderRadius: 2, fontWeight: hlCol ? "700" : "400",
                  transition: "color .2s, background .2s",
                }}
              >
                {f2(v)}
              </span>
            );
          })}
          <span style={{ color: C.hint, fontSize: 14, marginLeft: 2 }}>{ri === 0 ? "⎤" : ri === 3 ? "⎦" : "⎥"}</span>
          <span style={{ fontSize: 9, color: C.hint, marginLeft: 10, fontFamily: "'Space Mono',monospace" }}>
            {["← R-axis", "← U-axis", "← F-axis", "← [0 0 0 1]"][ri]}
          </span>
        </div>
      ))}
    </div>
  );
}

function Matrix3({ data, hlDiag, color }: { data: Mat3; hlDiag?: boolean; color?: string }) {
  const C = useThemeColors();
  const baseColor = color ?? C.muted;
  return (
    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, lineHeight: 2.1, display: "inline-block" }}>
      {data.map((row, ri) => (
        <div key={ri} style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: C.hint, fontSize: 14, marginRight: 2 }}>{ri === 0 ? "⎡" : ri === 2 ? "⎣" : "⎢"}</span>
          {row.map((v, ci) => {
            const diag = hlDiag && ri === ci;
            return (
              <span
                key={ci}
                style={{
                  minWidth: 52, textAlign: "right", paddingRight: 6,
                  color: diag ? ACCENT.amber : baseColor,
                  background: diag ? ACCENT_DIM.amber : "transparent",
                  borderRadius: 2, fontWeight: diag ? "700" : "400",
                }}
              >
                {f2(v)}
              </span>
            );
          })}
          <span style={{ color: C.hint, fontSize: 14, marginLeft: 2 }}>{ri === 0 ? "⎤" : ri === 2 ? "⎦" : "⎥"}</span>
        </div>
      ))}
    </div>
  );
}

function Slider({
  label, sub, value, min, max, step, onChange, color = ACCENT.cyan,
}: {
  label: string; sub?: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; color?: string;
}) {
  const C = useThemeColors();
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <div>
          <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Space Mono',monospace" }}>{label}</span>
          {sub && <span style={{ fontSize: 9, color: C.hint, marginLeft: 6 }}>{sub}</span>}
        </div>
        <span style={{ fontSize: 12, color, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer", height: 2, WebkitAppearance: "none" } as React.CSSProperties}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS  — each maps to a real linear-algebra topic from a course
// ─────────────────────────────────────────────────────────────────────────────
type TopicId = "vectors" | "dotprod" | "det" | "rref" | "eigen" | "cramer" | "subspace";

interface Topic {
  id: TopicId;
  label: string;
  color: string;
}

const TOPICS: Topic[] = [
  { id: "vectors", label: "Vectors", color: ACCENT.cyan },
  { id: "dotprod", label: "Dot Product", color: ACCENT.blue },
  { id: "det", label: "Determinant", color: ACCENT.amber },
  { id: "rref", label: "RREF", color: ACCENT.purple },
  { id: "eigen", label: "Eigenvalues", color: ACCENT.green },
  { id: "cramer", label: "Cramer's Rule", color: ACCENT.red },
  { id: "subspace", label: "Subspace", color: "muted" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC PANELS  — the meat: course → 3D world connection
// ─────────────────────────────────────────────────────────────────────────────
function TopicVectors({ rows }: { rows: Mat4Rows }) {
  const C = useThemeColors();
  const R = rows[0][0] != null ? rows : IDENTITY_ROWS;
  const right: Vec3 = [R[0][0], R[1][0], R[2][0]];
  const up: Vec3 = [R[0][1], R[1][1], R[2][1]];
  const forward: Vec3 = [R[0][2], R[1][2], R[2][2]];
  const tx = R[0][3], ty = R[1][3], tz = R[2][3];
  return (
    <div>
      <Def term="Vector" color={ACCENT.cyan}>
        A vector is an ordered list of numbers — a column of a matrix.
        In 3D, every vector has 3 components: <span style={{ color: ACCENT.cyan }}>v = [x, y, z]ᵀ</span>.
        The ᵀ means "transpose" — it's a column, not a row.
      </Def>
      <Insight label="WHERE THIS LIVES IN YOUR 3D OBJECT RIGHT NOW" color={ACCENT.cyan}>
        Your object's 4×4 matrix has 4 column vectors. The first 3 are its local axes
        expressed in world-space. The 4th is its position (translation vector).
      </Insight>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {[
          { name: "Right axis (col 0)", v: right, color: ACCENT.red },
          { name: "Up axis    (col 1)", v: up, color: ACCENT.green },
          { name: "Fwd axis   (col 2)", v: forward, color: ACCENT.blue },
          { name: "Position   (col 3)", v: [tx, ty, tz] as Vec3, color: ACCENT.amber },
        ].map(({ name, v, color }) => (
          <div key={name} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 10px", background: C.surface2, borderRadius: 4, border: `1px solid ${color}33` }}>
            <span style={{ fontSize: 9, color, fontFamily: "'Space Mono',monospace", minWidth: 160, letterSpacing: 1 }}>{name}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color }}>
              [{f1(v[0])}, {f1(v[1])}, {f1(v[2])}]ᵀ
            </span>
            <span style={{ fontSize: 9, color: C.hint, marginLeft: 6 }}>|v| = {f1(magV(v))}</span>
          </div>
        ))}
      </div>
      <Def term="Linear Combination" color={ACCENT.cyan}>
        Any point <span style={{ color: C.text }}>p</span> in 3D can be written as a linear
        combination of the three column vectors:
        <span style={{ color: ACCENT.cyan }}> p = a·col₀ + b·col₁ + c·col₂ + t</span>.
        This is what "span" means — these vectors span the space.
      </Def>
    </div>
  );
}

function TopicDot({ rows }: { rows: Mat4Rows }) {
  const C = useThemeColors();
  const R = rows[0][0] != null ? rows : IDENTITY_ROWS;
  const c0: Vec3 = [R[0][0], R[1][0], R[2][0]];
  const c1: Vec3 = [R[0][1], R[1][1], R[2][1]];
  const c2: Vec3 = [R[0][2], R[1][2], R[2][2]];
  const d01 = dot3(c0, c1), d02 = dot3(c0, c2), d12 = dot3(c1, c2);
  const m0 = magV(c0), m1 = magV(c1), m2 = magV(c2);
  const orthogonal = Math.abs(d01) < 0.01 && Math.abs(d02) < 0.01 && Math.abs(d12) < 0.01;
  const normal01 = Math.abs(m0 - 1) < 0.01 && Math.abs(m1 - 1) < 0.01 && Math.abs(m2 - 1) < 0.01;
  return (
    <div>
      <Def term="Dot Product" color={ACCENT.blue}>
        <span style={{ color: C.text }}>u · v = u₁v₁ + u₂v₂ + u₃v₃ = |u||v|cos(θ)</span><br />
        Key result: if <span style={{ color: ACCENT.blue }}>u · v = 0</span>, the vectors are
        <strong> orthogonal</strong> (perpendicular). This is the algebraic definition of "right angle".
      </Def>
      <Insight label="ORTHOGONALITY CHECK ON YOUR ROTATION MATRIX" color={ACCENT.blue}>
        A valid rotation matrix must have <em>mutually orthogonal</em> columns AND each column must be a
        unit vector (length = 1). Together: <span style={{ color: ACCENT.blue }}>orthonormal</span>.
        Rotate the object — the dot products below should stay near zero.
      </Insight>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
        {[
          { a: "col₀·col₁", val: d01, note: "right · up" },
          { a: "col₀·col₂", val: d02, note: "right · fwd" },
          { a: "col₁·col₂", val: d12, note: "up · fwd" },
        ].map(({ a, val, note }) => {
          const ok = Math.abs(val) < 0.01;
          return (
            <div key={a} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 10px", background: C.surface2, borderRadius: 4, border: `1px solid ${ok ? ACCENT.green + "33" : ACCENT.red + "55"}` }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: C.muted, minWidth: 90 }}>{a}</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: ok ? ACCENT.green : ACCENT.red, fontWeight: 700 }}>{f3(val)}</span>
              <span style={{ fontSize: 9, color: C.hint }}>{note}</span>
              <span style={{ fontSize: 9, color: ok ? ACCENT.green : ACCENT.red, marginLeft: "auto" }}>{ok ? "✓ orthogonal" : "✗ not orthogonal"}</span>
            </div>
          );
        })}
        {[{ a: "|col₀|", val: m0 }, { a: "|col₁|", val: m1 }, { a: "|col₂|", val: m2 }].map(({ a, val }) => {
          const ok = Math.abs(val - 1) < 0.01;
          return (
            <div key={a} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 10px", background: C.surface2, borderRadius: 4, border: `1px solid ${ok ? ACCENT.green + "33" : ACCENT.amber + "55"}` }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: C.muted, minWidth: 90 }}>{a}</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: ok ? ACCENT.green : ACCENT.amber, fontWeight: 700 }}>{f3(val)}</span>
              <span style={{ fontSize: 9, color: ok ? ACCENT.green : ACCENT.amber, marginLeft: "auto" }}>{ok ? "✓ unit vector" : "≠ 1 (scaled)"}</span>
            </div>
          );
        })}
      </div>
      {orthogonal && normal01 && (
        <Insight label="RESULT: ORTHONORMAL BASIS" color={ACCENT.green}>
          All dot products ≈ 0 AND all magnitudes ≈ 1. This is an <strong>orthonormal basis</strong> — the columns
          form a coordinate system where every axis is perpendicular and unit-length. The matrix is called
          <em> orthogonal</em> and Q⁻¹ = Qᵀ (transpose = inverse). Extremely efficient to invert.
        </Insight>
      )}
    </div>
  );
}

function TopicDet({ rows, sx, sy, sz, setHighlight }: {
  rows: Mat4Rows; sx: number; sy: number; sz: number; setHighlight: (h: [number, number, string][] | null) => void;
}) {
  const C = useThemeColors();
  const R = rows[0][0] != null ? rows : IDENTITY_ROWS;
  const r3 = to3x3(R);
  const d = det3(r3);
  const singular = Math.abs(d) < 0.001;
  useEffect(() => {
    setHighlight([[0, 0, ACCENT.amber], [0, 1, ACCENT.amber], [0, 2, ACCENT.amber], [1, 0, ACCENT.amber], [1, 1, ACCENT.amber], [1, 2, ACCENT.amber], [2, 0, ACCENT.amber], [2, 1, ACCENT.amber], [2, 2, ACCENT.amber]]);
    return () => setHighlight(null);
  }, [setHighlight]);
  return (
    <div>
      <Def term="Determinant" color={ACCENT.amber}>
        The determinant of a square matrix is a scalar that encodes <strong>how much the matrix
        scales volume</strong>. For a 3×3 matrix A:<br />
        <span style={{ color: ACCENT.amber, fontFamily: "'Space Mono',monospace" }}>
          det(A) = a(ei−fh) − b(di−fg) + c(dh−eg)
        </span>
      </Def>
      <Insight label="IN YOUR TRANSFORM MATRIX RIGHT NOW" color={ACCENT.amber}>
        The upper-left 3×3 block is the rotation+scale part. Its determinant tells you
        how much the object's local volume has changed relative to its original shape.
      </Insight>
      <div style={{ padding: "12px 14px", background: C.surface2, borderRadius: 6, border: `1px solid ${singular ? ACCENT.red + "55" : ACCENT.amber + "33"}`, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8, fontFamily: "'Space Mono',monospace" }}>3×3 ROTATION BLOCK</div>
        <Matrix3 data={r3} />
        <div style={{ marginTop: 10, fontFamily: "'Space Mono',monospace", fontSize: 12 }}>
          <span style={{ color: C.muted }}>det = </span>
          <span style={{ color: singular ? ACCENT.red : Math.abs(d - 1) < 0.01 ? ACCENT.green : ACCENT.amber, fontSize: 15, fontWeight: 700 }}>{f3(d)}</span>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
          {singular ? "⚠ SINGULAR — zero volume, no inverse exists" :
            Math.abs(d - 1) < 0.01 ? "✓ Pure rotation — volume unchanged" :
            d < 0 ? "Reflection included (orientation flipped)" :
            `Volume scaled by ${f3(Math.abs(d))}×`}
        </div>
      </div>
      {singular && (
        <div style={{ padding: "12px 14px", background: ACCENT_DIM.red, border: `1px solid ${ACCENT.red}55`, borderRadius: 6, marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: ACCENT.red, fontWeight: 700, marginBottom: 4, fontFamily: "'Space Mono',monospace" }}>det = 0 → SINGULAR MATRIX</div>
          <div style={{ fontSize: 11, color: C.text, lineHeight: 1.8 }}>
            The matrix has collapsed a dimension — a whole axis was squashed flat.
            <strong> No inverse exists</strong>. In Ax=b, the system either has no solution
            or infinitely many. In 3D engines: normals become NaN, lighting breaks,
            the camera can lock up. This is what your professor means by "singular".
          </div>
        </div>
      )}
      <Def term="Invertible Matrix Theorem" color={ACCENT.amber}>
        A matrix A is invertible ⟺ det(A) ≠ 0 ⟺ its columns are linearly independent
        ⟺ Ax=b has a unique solution for every b ⟺ RREF of A = Identity.
        All these are the same fact.
      </Def>
      <div style={{ padding: "10px 14px", background: C.surface2, borderRadius: 6, border: `1px solid ${withAlpha(C.border, "33")}` }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 4, fontFamily: "'Space Mono',monospace" }}>SCALE → DETERMINANT RELATIONSHIP</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: C.muted, lineHeight: 2 }}>
          <div>det(S) = sx · sy · sz</div>
          <div style={{ color: ACCENT.amber }}>= {f1(sx)} · {f1(sy)} · {f1(sz)} = {f3(sx * sy * sz)}</div>
          <div style={{ color: C.hint, fontSize: 10 }}>scale by 2 in all axes → det = 8 = volume ×8</div>
        </div>
      </div>
    </div>
  );
}

function TopicRREF({ rows }: { rows: Mat4Rows }) {
  const C = useThemeColors();
  const R = rows[0][0] != null ? rows : IDENTITY_ROWS;
  const r3 = to3x3(R);
  const { result } = rref3(r3);
  const isIdentity = result.every((row, ri) => row.every((v, ci) => Math.abs(v - (ri === ci ? 1 : 0)) < 0.01));
  return (
    <div>
      <Def term="Row Echelon Form / RREF" color={ACCENT.purple}>
        RREF (Reduced Row Echelon Form) is what you get after performing Gaussian elimination
        on a matrix until each pivot = 1 and every other entry in that column = 0.
        It's the "simplified form" of a system of equations.
      </Def>
      <Insight label="WHAT RREF TELLS YOU ABOUT YOUR TRANSFORM" color={ACCENT.purple}>
        Apply RREF to the 3×3 rotation block. If it reduces to the identity matrix I₃,
        the columns are linearly independent — the matrix is invertible.
        If a row goes to all zeros, you have linear dependence (one axis is redundant).
      </Insight>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: ACCENT.purple, letterSpacing: 2, marginBottom: 6, fontFamily: "'Space Mono',monospace" }}>ORIGINAL 3×3</div>
          <Matrix3 data={r3} color={C.muted} />
        </div>
        <div style={{ fontSize: 18, color: C.hint, alignSelf: "center", marginTop: 16 }}>→</div>
        <div>
          <div style={{ fontSize: 9, color: ACCENT.purple, letterSpacing: 2, marginBottom: 6, fontFamily: "'Space Mono',monospace" }}>AFTER RREF</div>
          <Matrix3 data={result} color={isIdentity ? ACCENT.green : ACCENT.red} />
        </div>
      </div>
      <div style={{ padding: "10px 14px", background: isIdentity ? ACCENT_DIM.green : ACCENT_DIM.red, border: `1px solid ${isIdentity ? ACCENT.green : ACCENT.red}44`, borderRadius: 6, marginBottom: 10 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: isIdentity ? ACCENT.green : ACCENT.red, fontWeight: 700 }}>
          {isIdentity
            ? "✓ RREF = I₃ → Full rank (rank 3) → Invertible → Unique solution to Ax=b"
            : "✗ RREF ≠ I₃ → Rank deficient → Singular → det=0 → Infinite/no solutions"}
        </div>
      </div>
      <Def term="Augmented Matrix" color={ACCENT.purple}>
        In your class you write [A|b] — the matrix A augmented with the right-hand-side
        vector b — to solve Ax=b. You then row-reduce the whole thing. The 4th column of
        your 4×4 transform IS b (the translation vector). The system being solved is:
        "where does point x end up in world space?"
      </Def>
      <Eq>
        [R | t] × [x,y,z,1]ᵀ = p_world<br />
        <span style={{ color: ACCENT.purple }}>augmented matrix [A|b] = [3×3 rotation | translation column]</span>
      </Eq>
    </div>
  );
}

function TopicEigen({ rows }: { rows: Mat4Rows }) {
  const C = useThemeColors();
  const R = rows[0][0] != null ? rows : IDENTITY_ROWS;
  const r3 = to3x3(R);
  const d = det3(r3);
  const tr = r3[0][0] + r3[1][1] + r3[2][2];
  const diag: Vec3 = [r3[0][0], r3[1][1], r3[2][2]];
  return (
    <div>
      <Def term="Eigenvalue / Eigenvector" color={ACCENT.green}>
        For a matrix A, an eigenvector <span style={{ color: ACCENT.green }}>v</span> and
        eigenvalue <span style={{ color: ACCENT.amber }}>λ</span> satisfy:
        <span style={{ color: C.text, fontFamily: "'Space Mono',monospace" }}> Av = λv</span><br />
        The matrix only <em>stretches</em> v — it does NOT rotate it.
        λ is the stretch factor.
      </Def>
      <Insight label="WHAT EIGENVECTORS MEAN IN 3D TRANSFORMS" color={ACCENT.green}>
        When you rotate an object, almost every direction gets rotated too. But the axis
        of rotation is special — it's an eigenvector with λ=1 (unchanged direction and length).
        For a scale transform, the x/y/z axes are eigenvectors with λ=sx/sy/sz.
      </Insight>
      <div style={{ padding: "12px 14px", background: C.surface2, borderRadius: 6, border: `1px solid ${ACCENT.green}33`, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8, fontFamily: "'Space Mono',monospace" }}>CHARACTERISTIC POLYNOMIAL SETUP</div>
        <Eq>det(A − λI) = 0  ← solve this for λ</Eq>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: C.muted, lineHeight: 2 }}>
          <div>trace(A) = {f2(tr)}</div>
          <div>det(A)   = {f3(d)}</div>
          <div style={{ color: C.hint, fontSize: 10, marginTop: 4 }}>
            For a 2×2: λ² − tr·λ + det = 0<br />
            For a 3×3: cubic in λ — solved numerically in engines
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 14px", background: C.surface2, borderRadius: 6, border: `1px solid ${ACCENT.green}33`, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8, fontFamily: "'Space Mono',monospace" }}>IF NO ROTATION (PURE SCALE)</div>
        <div style={{ fontSize: 11, color: C.text, lineHeight: 1.9 }}>
          Eigenvectors = x, y, z axes<br />
          <span style={{ fontFamily: "'Space Mono',monospace", color: ACCENT.green }}>
            λ₁={f2(diag[0])}, λ₂={f2(diag[1])}, λ₃={f2(diag[2])}
          </span><br />
          <span style={{ color: C.hint, fontSize: 10 }}>
            The diagonal of a diagonal matrix = its eigenvalues.
            Rotate the object and the diagonal entries mix — eigenvectors are now in a different basis.
          </span>
        </div>
      </div>
      <Insight label="WHY EIGENVALUES MATTER BEYOND THIS CLASS" color={ACCENT.green}>
        PCA (machine learning), Google's PageRank, quantum mechanics, structural vibration modes,
        facial recognition — all reduce to "find the eigenvectors of this matrix."
        In 3D graphics: finding principal axes, inertia tensors, moment of rotation.
        The intuition is always the same: eigenvectors are the directions a transformation leaves unchanged.
      </Insight>
      <Def term="Diagonalization" color={ACCENT.green}>
        If A has n linearly independent eigenvectors, then A = PDP⁻¹
        where D is diagonal (eigenvalues on diagonal) and P's columns are the eigenvectors.
        This decomposes any transform into: change basis → scale → change back.
        Every rotation/scale in 3D is secretly this.
      </Def>
    </div>
  );
}

function TopicCramer({ rows }: { rows: Mat4Rows }) {
  const C = useThemeColors();
  const R = rows[0][0] != null ? rows : IDENTITY_ROWS;
  const r3 = to3x3(R);
  const d = det3(r3);
  const tx = R[0][3], ty = R[1][3], tz = R[2][3];
  const bVec: Vec3 = [tx, ty, tz];
  function detWithCol(colIdx: number, b: Vec3): number {
    const M = r3.map((row) => [...row]) as Mat3;
    M[0][colIdx] = b[0]; M[1][colIdx] = b[1]; M[2][colIdx] = b[2];
    return det3(M);
  }
  const canSolve = Math.abs(d) > 0.001;
  const x0 = canSolve ? detWithCol(0, bVec) / d : null;
  const x1 = canSolve ? detWithCol(1, bVec) / d : null;
  const x2 = canSolve ? detWithCol(2, bVec) / d : null;
  return (
    <div>
      <Def term="Cramer's Rule" color={ACCENT.red}>
        For a system Ax = b where det(A) ≠ 0, Cramer's Rule gives each component of x as:
        <span style={{ fontFamily: "'Space Mono',monospace", color: ACCENT.red }}> xᵢ = det(Aᵢ) / det(A)</span>
        where Aᵢ is A with column i replaced by b.
      </Def>
      <Insight label="SOLVING FOR WORLD POSITION — THE 3D CONNECTION" color={ACCENT.red}>
        Your transform matrix defines the equation: <span style={{ color: C.text, fontFamily: "'Space Mono',monospace" }}>R·x = t</span>.
        This asks: "what local coordinates x map to the translation vector t in world space?"
        Cramer's rule is one way to solve this — directly from the determinants.
      </Insight>
      <div style={{ padding: "12px 14px", background: C.surface2, borderRadius: 6, border: `1px solid ${ACCENT.red}33`, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8, fontFamily: "'Space Mono',monospace" }}>LIVE SYSTEM: R·x = t</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <Matrix3 data={r3} color={C.muted} />
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: C.hint }}>x</div>
          <div style={{ fontSize: 18, color: C.hint }}>=</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, lineHeight: 2.1 }}>
            {bVec.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <span style={{ color: C.hint, fontSize: 14 }}>{i === 0 ? "⎡" : i === 2 ? "⎣" : "⎢"}</span>
                <span style={{ minWidth: 52, textAlign: "right", color: ACCENT.red, fontWeight: 700 }}>{f2(v)}</span>
                <span style={{ color: C.hint, fontSize: 14 }}>{i === 0 ? "⎤" : i === 2 ? "⎦" : "⎥"}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: C.muted, lineHeight: 2 }}>
          <div>det(A) = {f3(d)}</div>
          {canSolve ? (
            <>
              <div>x₀ = det(A₀)/det(A) = <span style={{ color: ACCENT.red }}>{f3(x0 as number)}</span></div>
              <div>x₁ = det(A₁)/det(A) = <span style={{ color: ACCENT.red }}>{f3(x1 as number)}</span></div>
              <div>x₂ = det(A₂)/det(A) = <span style={{ color: ACCENT.red }}>{f3(x2 as number)}</span></div>
            </>
          ) : (
            <div style={{ color: ACCENT.red }}>det=0 → Cramer's Rule undefined (singular matrix)</div>
          )}
        </div>
      </div>
      <Def term="Why Cramer's Rule Matters Practically" color={ACCENT.red}>
        In 3D graphics: ray-triangle intersection (Möller–Trumbore algorithm) solves a 3×3
        system using exactly Cramer's rule — three determinants divided by the main determinant.
        It's running on your GPU for every ray-traced pixel.
      </Def>
    </div>
  );
}

function TopicSubspace({ rows }: { rows: Mat4Rows }) {
  const C = useThemeColors();
  const R = rows[0][0] != null ? rows : IDENTITY_ROWS;
  const r3 = to3x3(R);
  const d = det3(r3);
  const rank = Math.abs(d) > 0.01 ? 3 : 1; // simplified
  const nullity = 3 - rank;
  return (
    <div>
      <Def term="Vector Space" color={C.muted}>
        A vector space is a set of vectors that is <strong>closed under addition and scalar multiplication</strong>.
        The set of all 3D points forms ℝ³ — a 3-dimensional vector space. Subsets that
        are themselves vector spaces are called <strong>subspaces</strong>.
      </Def>
      <Def term="Column Space (Range)" color={C.muted}>
        The <span style={{ color: ACCENT.cyan }}>column space</span> Col(A) = all vectors reachable
        by Ax for some x. It's the "output space" of the transformation.
        Dimension of Col(A) = rank(A).
      </Def>
      <Def term="Null Space (Kernel)" color={C.muted}>
        The <span style={{ color: ACCENT.purple }}>null space</span> Null(A) = all vectors x where Ax = 0.
        It's the "directions that get erased" by the transform.
        Rank-Nullity Theorem: rank + nullity = number of columns.
      </Def>
      <div style={{ padding: "12px 14px", background: C.surface2, borderRadius: 6, border: `1px solid ${withAlpha(C.border, "33")}`, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8, fontFamily: "'Space Mono',monospace" }}>YOUR CURRENT MATRIX</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: C.muted, lineHeight: 2 }}>
          <div>rank(A)    = <span style={{ color: ACCENT.cyan, fontWeight: 700 }}>{rank}</span>
            <span style={{ color: C.hint, fontSize: 10, marginLeft: 8 }}>(dimension of column space — # linearly independent columns)</span>
          </div>
          <div>nullity(A) = <span style={{ color: ACCENT.purple, fontWeight: 700 }}>{nullity}</span>
            <span style={{ color: C.hint, fontSize: 10, marginLeft: 8 }}>{nullity === 0 ? "no vectors erased (invertible)" : "vectors mapped to zero"}</span>
          </div>
          <div>rank + nullity = <span style={{ color: C.text }}>3</span>
            <span style={{ color: C.hint, fontSize: 10, marginLeft: 8 }}>← rank-nullity theorem</span>
          </div>
        </div>
      </div>
      <Insight label="THE BIG PICTURE CONNECTION" color={C.muted}>
        Your 3D object's transform matrix defines a linear map ℝ³ → ℝ³.
        The column space = all world positions your object can reach.
        The null space = all local directions that collapse to the origin (only non-trivial when det=0).
        Squash scale Y to 0 → the Y-axis joins the null space → nullity becomes 1 → you lost a dimension.
        This is the geometric meaning of what RREF, rank, and null space compute.
      </Insight>
      <Def term="Basis and Dimension" color={C.muted}>
        A basis is a minimal set of linearly independent vectors that span a space.
        ℝ³ has dimension 3 — you need exactly 3 basis vectors. The three columns of your
        rotation matrix ARE a basis for 3D space (when the matrix is invertible).
        When you rotate, you're changing which basis you're using.
      </Def>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  group: THREE.Group;
}

interface Matrix3DLabProps {
  onBack?: () => void;
}

export default function Matrix3DLab({ onBack }: Matrix3DLabProps) {
  const C = useThemeColors();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneRefs | null>(null);
  const [tab, setTab] = useState<TopicId>("vectors");
  const [matRows, setMatRows] = useState<Mat4Rows>(IDENTITY_ROWS);
  const [det, setDet] = useState(1);
  const [hl, setHl] = useState<[number, number, string][] | null>(null);
  const [singular, setSingular] = useState(false);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [tz, setTz] = useState(0);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [rz, setRz] = useState(0);
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [sz, setSz] = useState(1);
  const [leftW, setLeftW] = useState(340);
  const [rightW, setRightW] = useState(380);

  // ── Three.js init ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth || 440, H = el.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.canvasSurface);
    scene.fog = new THREE.Fog(new THREE.Color(C.canvasSurface).getHex(), 18, 30);

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(5, 4, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // Grid + floor
    const grid = new THREE.GridHelper(16, 16, new THREE.Color(C.canvasHint).getHex(), new THREE.Color(C.canvasBorder).getHex());
    scene.add(grid);

    // Thin axis lines
    const mkLine = (from: Vec3, to: Vec3, col: number) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]);
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color: col }));
    };
    scene.add(mkLine([0, 0, 0], [4, 0, 0], 0xff3333));
    scene.add(mkLine([0, 0, 0], [0, 4, 0], 0x33ff66));
    scene.add(mkLine([0, 0, 0], [0, 0, 4], 0x3399ff));

    // Object — clean geometric shape
    const group = new THREE.Group();
    const matStd = (c: number, met = 0.3, rou = 0.5) => new THREE.MeshStandardMaterial({ color: c, metalness: met, roughness: rou });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1.8), matStd(0x00d4ff, 0.4, 0.4));
    body.castShadow = true;
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 1.8), matStd(0x00e096, 0.5, 0.3));
    top.position.y = 0.55;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.7, 8), matStd(0xffb300, 0.4, 0.4));
    cone.rotation.x = Math.PI / 2; cone.position.z = 1.25;
    const elines = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1.8)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
    );
    group.add(body, top, cone, elines);

    // Shadow plane
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.25 }));
    plane.rotation.x = -Math.PI / 2; plane.position.y = -0.01; plane.receiveShadow = true;
    scene.add(plane);

    // Ghost at origin
    const ghost = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1.8)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 })
    );
    scene.add(ghost);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(6, 10, 6); sun.castShadow = true;
    sun.shadow.camera.near = 0.1; sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    scene.add(sun);
    const fill = new THREE.PointLight(0x4488ff, 0.35, 20);
    fill.position.set(-4, 2, -4); scene.add(fill);

    sceneRef.current = { scene, camera, renderer, group };
    scene.add(group);

    // Orbit
    let drag = false, lx = 0, ly = 0, theta = 0.6, phi = 0.5, orbitRad = 9.5;
    const getXY = (e: MouseEvent | TouchEvent): [number, number] => {
      if ("touches" in e && e.touches?.[0]) return [e.touches[0].clientX, e.touches[0].clientY];
      const me = e as MouseEvent;
      return [me.clientX ?? 0, me.clientY ?? 0];
    };
    const onD = (e: MouseEvent | TouchEvent) => { drag = true; [lx, ly] = getXY(e); };
    const onU = () => { drag = false; };
    const onM = (e: MouseEvent | TouchEvent) => {
      if (!drag) return;
      const [cx, cy] = getXY(e);
      theta -= (cx - lx) * 0.009; phi = Math.max(0.07, Math.min(1.5, phi - (cy - ly) * 0.007));
      lx = cx; ly = cy;
    };
    const onW = (e: WheelEvent) => { orbitRad = Math.max(3, Math.min(20, orbitRad + e.deltaY * 0.012)); };
    renderer.domElement.addEventListener("mousedown", onD);
    renderer.domElement.addEventListener("touchstart", onD);
    window.addEventListener("mouseup", onU);
    window.addEventListener("touchend", onU);
    window.addEventListener("mousemove", onM);
    window.addEventListener("touchmove", onM);
    renderer.domElement.addEventListener("wheel", onW);

    // Resize — keeps the camera aspect ratio and renderer size in sync with
    // the actual container size (e.g. when the floating window is maximized).
    // Without this the renderer/camera stay locked to whatever size existed
    // at mount and the rendered frame stretches to fill the new box.
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(el);

    let id: number;
    const animate = () => {
      id = requestAnimationFrame(animate);
      camera.position.set(orbitRad * Math.sin(phi) * Math.sin(theta), orbitRad * Math.cos(phi), orbitRad * Math.sin(phi) * Math.cos(theta));
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(id);
      resizeObserver.disconnect();
      window.removeEventListener("mouseup", onU);
      window.removeEventListener("touchend", onU);
      window.removeEventListener("mousemove", onM);
      window.removeEventListener("touchmove", onM);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keep the scene's environment colors in sync if the Studio Theme
  // changes while the lab is already open (not just at initial mount).
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    s.scene.background = new THREE.Color(C.canvasSurface);
    if (s.scene.fog) s.scene.fog.color = new THREE.Color(C.canvasSurface);
  }, [C.canvasSurface]);

  // ── Apply transforms & read matrix ──────────────────────────────────────
  useEffect(() => {
    if (!sceneRef.current) return;
    const { group } = sceneRef.current;
    group.position.set(tx, ty, tz);
    group.rotation.set(rad(rx), rad(ry), rad(rz));
    group.scale.set(sx, sy, sz);
    group.updateMatrixWorld(true);
    const rows = getRows(group.matrixWorld);
    setMatRows(rows);
    const d = det3(to3x3(rows));
    setDet(d);
    setSingular(Math.abs(d) < 0.001);
  }, [tx, ty, tz, rx, ry, rz, sx, sy, sz]);

  // ── Highlight column by tab ──────────────────────────────────────────────
  const hlCells = useMemo((): [number, number, string][] | null => {
    if (tab === "vectors") return [[0, 3, ACCENT.amber], [1, 3, ACCENT.amber], [2, 3, ACCENT.amber]];
    if (tab === "dotprod") return [[0, 0, ACCENT.blue], [0, 1, ACCENT.blue], [0, 2, ACCENT.blue], [1, 0, ACCENT.blue], [1, 1, ACCENT.blue], [1, 2, ACCENT.blue], [2, 0, ACCENT.blue], [2, 1, ACCENT.blue], [2, 2, ACCENT.blue]];
    if (tab === "det") return [[0, 0, ACCENT.amber], [0, 1, ACCENT.amber], [0, 2, ACCENT.amber], [1, 0, ACCENT.amber], [1, 1, ACCENT.amber], [1, 2, ACCENT.amber], [2, 0, ACCENT.amber], [2, 1, ACCENT.amber], [2, 2, ACCENT.amber]];
    if (tab === "rref") return [[0, 0, ACCENT.purple], [1, 1, ACCENT.purple], [2, 2, ACCENT.purple]];
    if (tab === "eigen") return [[0, 0, ACCENT.green], [1, 1, ACCENT.green], [2, 2, ACCENT.green]];
    if (tab === "cramer") return [[0, 3, ACCENT.red], [1, 3, ACCENT.red], [2, 3, ACCENT.red]];
    return null;
  }, [tab]);

  const topicColor = TOPICS.find((t) => t.id === tab)?.color ?? ACCENT.cyan;
  const resetAll = () => { setTx(0); setTy(0); setTz(0); setRx(0); setRy(0); setRz(0); setSx(1); setSy(1); setSz(1); };

  // Drag-to-resize technique already proven in ts-lab/TsLab.jsx and reused by
  // backend-lab/BackendLab.tsx — an invisible full-screen overlay captures
  // mouse movement for the duration of the drag (so fast mouse movement never
  // "escapes" the thin 4px handle), removed on mouseup.
  const startResize = useCallback(
    (setter: (w: number) => void, getStart: () => number, min: number, max: number, dir: 1 | -1 = 1) =>
      (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startW = getStart();
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;inset:0;cursor:col-resize;z-index:9999";
        document.body.appendChild(overlay);
        const onMove = (ev: MouseEvent) => setter(Math.max(min, Math.min(max, startW + dir * (ev.clientX - startX))));
        const onUp = () => {
          document.body.removeChild(overlay);
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      },
    []
  );

  return (
    <div style={{ background: C.bg, height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Space Mono','Courier New',monospace", color: C.text, fontSize: 13 }}>

      {/* ── NAV ── */}
      <div style={{ height: 44, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: `1px solid ${withAlpha(C.border, "33")}`, background: C.surface, flexShrink: 0, gap: 14 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{ padding: "4px 10px", background: "transparent", border: `1px solid ${withAlpha(C.border, "33")}`, color: C.muted, fontSize: 9, borderRadius: 4, cursor: "pointer", fontFamily: "'Space Mono',monospace", letterSpacing: 2 }}
          >
            ← LABS
          </button>
        )}
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: ACCENT.cyan }}>MATRIX 3D</span>
        <span style={{ fontSize: 8, color: C.hint, letterSpacing: 3 }}>LINEAR ALGEBRA ↔ 3D WORLD</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={resetAll}
          style={{ padding: "4px 12px", background: "transparent", border: `1px solid ${withAlpha(C.border, "33")}`, color: C.muted, fontSize: 9, borderRadius: 4, cursor: "pointer", fontFamily: "'Space Mono',monospace", letterSpacing: 2 }}
        >
          RESET
        </button>
      </div>

      {/* ── BODY: 3 columns ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* LEFT: concept panel */}
        <div style={{ width: leftW, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${withAlpha(C.border, "33")}`, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${withAlpha(C.border, "33")}`, background: C.surface, flexShrink: 0, overflowX: "auto" }}>
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "9px 10px", fontSize: 8, letterSpacing: 1, cursor: "pointer",
                  fontFamily: "'Space Mono',monospace", border: "none", flexShrink: 0,
                  borderBottom: `2px solid ${t.id === tab ? (t.color === "muted" ? C.muted : t.color) : "transparent"}`,
                  background: t.id === tab ? (t.color === "muted" ? C.surface2 : t.color + "0d") : "transparent",
                  color: t.id === tab ? (t.color === "muted" ? C.muted : t.color) : C.hint,
                  fontWeight: t.id === tab ? "700" : "400", transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Tag color={topicColor === "muted" ? C.muted : topicColor}>{TOPICS.find((t) => t.id === tab)?.label.toUpperCase()}</Tag>
            </div>
            {tab === "vectors" && <TopicVectors rows={matRows} />}
            {tab === "dotprod" && <TopicDot rows={matRows} />}
            {tab === "det" && <TopicDet rows={matRows} sx={sx} sy={sy} sz={sz} setHighlight={setHl} />}
            {tab === "rref" && <TopicRREF rows={matRows} />}
            {tab === "eigen" && <TopicEigen rows={matRows} />}
            {tab === "cramer" && <TopicCramer rows={matRows} />}
            {tab === "subspace" && <TopicSubspace rows={matRows} />}
          </div>
        </div>

        {/* Divider: concept panel / viewport */}
        <div
          onMouseDown={startResize(setLeftW, () => leftW, 260, 640, 1)}
          style={{ width: 4, cursor: "col-resize", background: withAlpha(C.border, "33"), flexShrink: 0, opacity: 0.5 }}
        />

        {/* CENTER: 3D viewport — fills all remaining space */}
        <div ref={mountRef} style={{ flex: 1, cursor: "grab", overflow: "hidden" }} />

        {/* Divider: viewport / transform panel */}
        <div
          onMouseDown={startResize(setRightW, () => rightW, 280, 640, -1)}
          style={{ width: 4, cursor: "col-resize", background: withAlpha(C.border, "33"), flexShrink: 0, opacity: 0.5 }}
        />

        {/* RIGHT: transform sliders + live matrix */}
        <div style={{ width: rightW, flexShrink: 0, display: "flex", flexDirection: "column", borderLeft: `1px solid ${withAlpha(C.border, "33")}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${withAlpha(C.border, "1a")}`, background: C.surface, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, color: C.hint, letterSpacing: 2, marginBottom: 4 }}>TRANSLATE</div>
                <Slider label="X" value={tx} min={-4} max={4} step={0.1} onChange={setTx} color={ACCENT.red} />
                <Slider label="Y" value={ty} min={-3} max={3} step={0.1} onChange={setTy} color={ACCENT.green} />
                <Slider label="Z" value={tz} min={-4} max={4} step={0.1} onChange={setTz} color={ACCENT.blue} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, color: C.hint, letterSpacing: 2, marginBottom: 4 }}>ROTATE (°)</div>
                <Slider label="X" value={rx} min={-180} max={180} step={1} onChange={setRx} color={ACCENT.red} />
                <Slider label="Y" value={ry} min={-180} max={180} step={1} onChange={setRy} color={ACCENT.green} />
                <Slider label="Z" value={rz} min={-180} max={180} step={1} onChange={setRz} color={ACCENT.blue} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, color: C.hint, letterSpacing: 2, marginBottom: 4 }}>SCALE</div>
                <Slider label="X" value={sx} min={0} max={3} step={0.05} onChange={setSx} color={ACCENT.red} />
                <Slider label="Y" value={sy} min={0} max={3} step={0.05} onChange={setSy} color={ACCENT.green} />
                <Slider label="Z" value={sz} min={0} max={3} step={0.05} onChange={setSz} color={ACCENT.blue} />
              </div>
            </div>
          </div>
          <div style={{ flex: 1, padding: "12px 14px", background: C.surface2, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 8, color: C.hint, letterSpacing: 2 }}>matrixWorld — 4×4 (row-major)</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {singular && <Tag color={ACCENT.red}>SINGULAR</Tag>}
                <span style={{ fontSize: 10, color: det > 0.99 && det < 1.01 ? ACCENT.green : singular ? ACCENT.red : ACCENT.amber, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>
                  det={f3(det)}
                </span>
              </div>
            </div>
            <Matrix4 rows={matRows} hlCells={hlCells} />
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              {[
                { col: ACCENT.blue, label: "rotation/scale" },
                { col: ACCENT.amber, label: "translation" },
                { col: ACCENT.purple, label: "perspective row" },
              ].map(({ col, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 1, background: col }} />
                  <span style={{ fontSize: 8, color: C.hint, letterSpacing: 1 }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9, color: C.hint, marginTop: 8 }}>drag viewport · scroll zoom</div>
          </div>
        </div>
      </div>
    </div>
  );
}
