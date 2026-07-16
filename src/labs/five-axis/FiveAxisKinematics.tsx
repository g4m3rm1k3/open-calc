import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import FiveAxisHelpModal from "./FiveAxisHelpModal.tsx";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];
export type Mat4 = [Vec4, Vec4, Vec4, Vec4];

interface Axes { X: number; Y: number; Z: number; B: number; C: number }

interface ToolpathStep {
  B_deg: number; C_deg: number;
  X: number; Y: number; Z: number;
  pPart: Vec3; nPart: Vec3;
}

interface Geometry { pts: Vec3[]; norms: Vec3[]; tris: [number, number, number][] }

type ShapeId = "egg" | "cam" | "bell";

// ─── Math ─────────────────────────────────────────────────────────────────────

const mat4mul = (A: Mat4, B: Mat4): Mat4 => {
  const R: number[][] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++)
    for (let k = 0; k < 4; k++) R[i][j] += A[i][k] * B[k][j];
  return R as Mat4;
};
export const mat4vec = (M: Mat4, v: Vec4): Vec4 => [
  M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2] + M[0][3] * v[3],
  M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2] + M[1][3] * v[3],
  M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2] + M[2][3] * v[3],
  M[3][0] * v[0] + M[3][1] * v[1] + M[3][2] * v[2] + M[3][3] * v[3],
];
const Rx = (a: number): Mat4 => { const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0, 0], [0, c, -s, 0], [0, s, c, 0], [0, 0, 0, 1]]; };
export const Ry = (a: number): Mat4 => { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, s, 0], [0, 1, 0, 0], [-s, 0, c, 0], [0, 0, 0, 1]]; };
export const Rz = (a: number): Mat4 => { const c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0, 0], [s, c, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]; };
export const norm3 = (v: Vec3): Vec3 => { const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return l < 1e-12 ? [0, 0, 1] : [v[0] / l, v[1] / l, v[2] / l]; };
const cross3 = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Table/Trunnion kinematic chain (table-table, B tilts + C rotates, both
 * under the part):  p_machine = Ry(B) · Rz(C) · p_part
 *
 *   C spins the part around Z (applied first)
 *   B tilts the whole assembly around machine Y axis (applied second, machine-frame fixed)
 *   SPINDLE only translates in X/Y/Z — tool axis is always [0,0,−1]
 *
 * Derivation (target: n_machine = [0,0,1]):
 *   Step 1 — Rz(C) leaves Z unchanged and mixes X/Y. Pick C so the Y-component
 *     vanishes (the next rotation, about Y, can't fix a stray Y component):
 *     nx·sinC + ny·cosC = 0  ⟹  C = atan2(-ny, nx). After this the vector is
 *     [r, 0, nz] where r = √(nx²+ny²).
 *   Step 2 — Ry(B) applied to [r,0,nz]: solve r·cosB + nz·sinB = 0 for B
 *     ⟹  B = atan2(-r, nz)  (equivalently -acos(nz), since r ≥ 0 always).
 *
 * Verified by substitution (cosC=nx/r, sinC=-ny/r; cosB=nz, sinB=-r using
 * r²+nz²=1 for a unit normal — both re-substitute back to exactly [0,0,1])
 * and by concrete cases: n=[0,0,1] → B=C=0; n=[1,0,0] → C=0, B=-90°;
 * n=[0,1,0] → C=-90°, B=-90° — each confirmed against the actual matrices.
 *
 * `leadDeg` offsets B *toward* zero (less aggressive tilt) — note the sign
 * is `+leadDeg` here, not `-leadDeg` like the original A-axis version, because
 * B_perfect is the negation of what A_perfect would be (Ry's off-diagonal
 * signs differ from Rx's), so "reduce the tilt magnitude" means adding a
 * positive lead, not subtracting one.
 */
export function wrapDeg180(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export function ikFromNormal(nx: number, ny: number, nz: number, leadDeg = 0): { B_deg: number; C_deg: number } {
  const r = Math.sqrt(nx * nx + ny * ny);
  return {
    B_deg: (Math.atan2(-r, nz) * 180) / Math.PI + leadDeg,
    C_deg: (Math.atan2(-ny, nx) * 180) / Math.PI,
  };
}

const Mtable = (b_deg: number, c_deg: number): Mat4 => mat4mul(Ry((b_deg * Math.PI) / 180), Rz((c_deg * Math.PI) / 180));

// ─── Shapes ───────────────────────────────────────────────────────────────────

function mesh(Nu: number, Nv: number, posFn: (u: number, v: number) => Vec3, normFn: (u: number, v: number) => Vec3): Geometry {
  const pts: Vec3[] = [], norms: Vec3[] = [];
  for (let j = 0; j <= Nv; j++) for (let i = 0; i <= Nu; i++) {
    pts.push(posFn(i / Nu, j / Nv));
    norms.push(normFn(i / Nu, j / Nv));
  }
  const tris: [number, number, number][] = [];
  for (let j = 0; j < Nv; j++) for (let i = 0; i < Nu; i++) {
    const a = j * (Nu + 1) + i, b = a + 1, c = a + (Nu + 1), d = c + 1;
    tris.push([a, b, d], [a, d, c]);
  }
  return { pts, norms, tris };
}

const generateEgg = (): Geometry => mesh(56, 36,
  (u, v) => { const U = u * 2 * Math.PI, V = v * Math.PI, sv = Math.sin(V), cv = Math.cos(V), rz = V < Math.PI / 2 ? 52 : 44;
    return [36 * sv * Math.cos(U), 36 * sv * Math.sin(U), rz * cv]; },
  (u, v) => { const U = u * 2 * Math.PI, V = v * Math.PI, sv = Math.sin(V), cv = Math.cos(V), rz = V < Math.PI / 2 ? 52 : 44;
    return norm3([sv * Math.cos(U) / 1296, sv * Math.sin(U) / 1296, cv / (rz * rz)]); }
);

const generateCam = (): Geometry => {
  const camR = (u: number) => 28 + 16 * Math.pow(Math.max(0, Math.cos(u * 2 * Math.PI)), 2.5);
  const camDR = (u: number) => -16 * 2.5 * Math.pow(Math.max(0, Math.cos(u * 2 * Math.PI)), 1.5) * Math.sin(u * 2 * Math.PI) * 2 * Math.PI;
  return mesh(72, 22,
    (u, v) => { const U = u * 2 * Math.PI, r = camR(u); return [r * Math.cos(U), r * Math.sin(U), -25 + v * 50]; },
    (u, v) => { const U = u * 2 * Math.PI, r = camR(u), dr = camDR(u);
      const tu: Vec3 = [dr * Math.cos(U) - r * Math.sin(U), dr * Math.sin(U) + r * Math.cos(U), 0];
      const n = norm3(cross3(tu, [0, 0, 1]));
      return dot3(n, [Math.cos(U), Math.sin(U), 0]) < 0 ? [-n[0], -n[1], -n[2]] : n; }
  );
};

const generateBell = (): Geometry => {
  const posAt = (u: number, v: number): Vec3 => {
    const t = Math.max(1e-4, Math.min(1 - 1e-4, v)), a = t * Math.PI * 0.82, sa = Math.sin(a), ca = Math.cos(a);
    const r = 22 * sa + 18 * Math.pow(t, 2.5) * sa;
    return [r * Math.cos(u * 2 * Math.PI), r * Math.sin(u * 2 * Math.PI), 56 * ca - 10 * Math.pow(t, 3) * sa];
  };
  return mesh(56, 36, posAt, (u, v) => {
    const eps = 5e-4, pa = posAt(u, v), pb = posAt(u + eps, v), pc = posAt(u, v + eps);
    const tu: Vec3 = [(pb[0] - pa[0]) / eps, (pb[1] - pa[1]) / eps, (pb[2] - pa[2]) / eps];
    const tv: Vec3 = [(pc[0] - pa[0]) / eps, (pc[1] - pa[1]) / eps, (pc[2] - pa[2]) / eps];
    const n = norm3(cross3(tu, tv));
    const r2 = Math.sqrt(pa[0] * pa[0] + pa[1] * pa[1]) || 1;
    return dot3(n, [pa[0] / r2, pa[1] / r2, 0]) < 0 ? [-n[0], -n[1], -n[2]] : n;
  });
};

// A hard-edged box (4 unique vertices per face, not 8 shared — each face
// needs its own normal for correct flat shading; sharing corners would
// average adjacent faces' normals together and blur the edges). Used as the
// Calculator's "workpiece" primitive — its own +Z face is the one whose
// normal the tool is trying to point at the spindle.
function generateBox(sx: number, sy: number, sz: number): Geometry {
  const hx = sx / 2, hy = sy / 2, hz = sz / 2;
  const faces: [Vec3, Vec3[]][] = [
    [[0, 0, 1], [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]]], // +Z top — the face whose normal we care about
    [[0, 0, -1], [[-hx, hy, -hz], [hx, hy, -hz], [hx, -hy, -hz], [-hx, -hy, -hz]]], // -Z bottom
    [[1, 0, 0], [[hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz], [hx, -hy, hz]]], // +X
    [[-1, 0, 0], [[-hx, hy, -hz], [-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz]]], // -X
    [[0, 1, 0], [[hx, hy, -hz], [-hx, hy, -hz], [-hx, hy, hz], [hx, hy, hz]]], // +Y
    [[0, -1, 0], [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz]]], // -Y
  ];
  const pts: Vec3[] = [], norms: Vec3[] = [], tris: [number, number, number][] = [];
  for (const [n, verts] of faces) {
    const base = pts.length;
    for (const v of verts) { pts.push(v); norms.push(n); }
    tris.push([base, base + 1, base + 2], [base, base + 2, base + 3]);
  }
  return { pts, norms, tris };
}

type PrimitiveKind = "plate" | "block";
function generatePrimitive(kind: PrimitiveKind): Geometry {
  return kind === "plate" ? generateBox(60, 60, 10) : generateBox(46, 46, 46);
}

// ─── Toolpath ─────────────────────────────────────────────────────────────────

function makeToolpath(shape: ShapeId, leadDeg: number): ToolpathStep[] {
  const path: ToolpathStep[] = [];
  const push = (px: number, py: number, pz: number, nx: number, ny: number, nz: number) => {
    if (nz < 0.04) return;
    const { B_deg, C_deg } = ikFromNormal(nx, ny, nz, leadDeg);
    const M = Mtable(B_deg, C_deg);
    const pm = mat4vec(M, [px, py, pz, 1]);
    path.push({ B_deg, C_deg, X: pm[0], Y: pm[1], Z: pm[2], pPart: [px, py, pz], nPart: [nx, ny, nz] });
  };

  if (shape === "egg") {
    const nRev = 7, nPPR = 80, total = nRev * nPPR;
    for (let i = 0; i <= total; i++) {
      const t = i / total, u = t * nRev * 2 * Math.PI, V = (0.07 + t * 0.86) * Math.PI;
      const sv = Math.sin(V), cv = Math.cos(V), rz = V < Math.PI / 2 ? 52 : 44;
      const px = 36 * sv * Math.cos(u), py = 36 * sv * Math.sin(u), pz = rz * cv;
      const n = norm3([sv * Math.cos(u) / 1296, sv * Math.sin(u) / 1296, cv / (rz * rz)]);
      push(px, py, pz, n[0], n[1], n[2]);
    }
  } else if (shape === "cam") {
    const nPass = 12, nPPP = 80;
    for (let p = 0; p < nPass; p++) {
      const z = -22 + (p / (nPass - 1)) * 44, dir = p % 2 === 0 ? 1 : -1;
      for (let i = 0; i <= nPPP; i++) {
        const u = (dir > 0 ? i : nPPP - i) / nPPP, U = u * 2 * Math.PI;
        const r = 28 + 16 * Math.pow(Math.max(0, Math.cos(U)), 2.5);
        const px = r * Math.cos(U), py = r * Math.sin(U);
        const dr = -16 * 2.5 * Math.pow(Math.max(0, Math.cos(U)), 1.5) * Math.sin(U) * 2 * Math.PI;
        const tu: Vec3 = [dr * Math.cos(U) - r * Math.sin(U), dr * Math.sin(U) + r * Math.cos(U), 0];
        const nOut = norm3(cross3(tu, [0, 0, 1]));
        const nR: Vec3 = dot3(nOut, [Math.cos(U), Math.sin(U), 0]) < 0 ? [-nOut[0], -nOut[1], -nOut[2]] : nOut;
        // Blend in a small upward component so IK doesn't hit 90° singularity
        push(px, py, z, nR[0] * 0.87, nR[1] * 0.87, 0.49);
      }
    }
  } else {
    const posAt = (u: number, v: number): Vec3 => {
      const t = Math.max(1e-4, Math.min(1 - 1e-4, v)), a = t * Math.PI * 0.82, sa = Math.sin(a), ca = Math.cos(a);
      const r = 22 * sa + 18 * Math.pow(t, 2.5) * sa;
      return [r * Math.cos(u * 2 * Math.PI), r * Math.sin(u * 2 * Math.PI), 56 * ca - 10 * Math.pow(t, 3) * sa];
    };
    const nRev = 7, nPPR = 80, total = nRev * nPPR;
    for (let i = 0; i <= total; i++) {
      const t = i / total, tv = 0.05 + t * 0.85, u = t * nRev * 2 * Math.PI;
      const [px, py, pz] = posAt(u, tv);
      const eps = 5e-4, pb = posAt(u + eps, tv), pc = posAt(u, tv + eps);
      const tu: Vec3 = [(pb[0] - px) / eps, (pb[1] - py) / eps, (pb[2] - pz) / eps];
      const tv2: Vec3 = [(pc[0] - px) / eps, (pc[1] - py) / eps, (pc[2] - pz) / eps];
      const nOut = norm3(cross3(tu, tv2));
      const r2 = Math.sqrt(px * px + py * py) || 1;
      const n = dot3(nOut, [px / r2, py / r2, 0]) < 0 ? [-nOut[0], -nOut[1], -nOut[2]] : nOut;
      push(px, py, pz, n[0], n[1], Math.max(0.04, n[2]));
    }
  }
  return path;
}

// ─── Projection ───────────────────────────────────────────────────────────────

interface Projected { sx: number; sy: number; depth: number }

function project(pt: Vec3, rx: number, ry: number, scale: number, cx: number, cy: number): Projected {
  const [x, y, z] = pt;
  const cY = Math.cos(ry), sY = Math.sin(ry);
  const x2 = x * cY + z * sY, z2 = -x * sY + z * cY;
  const cX = Math.cos(rx), sX = Math.sin(rx);
  return { sx: cx + x2 * scale, sy: cy - (y * cX - z2 * sX) * scale, depth: y * sX + z2 * cX };
}

type ProjFn = (pt: Vec3) => Projected;

// ─── Canvas drawing helpers ───────────────────────────────────────────────────

// Draw a table disk that rotates with the part (visual anchor)
function drawTable(ctx: CanvasRenderingContext2D, proj: ProjFn, M_table: Mat4) {
  const R = 96, ZT = -58, ZB = -66, N = 48;
  const tPt = (p: Vec3): Projected => { const w = mat4vec(M_table, [p[0], p[1], p[2], 1]); return proj([w[0], w[1], w[2]]); };

  const top: Projected[] = [], bot: Projected[] = [];
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * 2 * Math.PI;
    top.push(tPt([R * Math.cos(u), R * Math.sin(u), ZT]));
    bot.push(tPt([R * Math.cos(u), R * Math.sin(u), ZB]));
  }

  ctx.save();
  for (let i = 0; i < N; i++) {
    if (top[i].depth < 0 && top[i + 1].depth < 0) continue; // skip back faces
    ctx.beginPath();
    ctx.moveTo(top[i].sx, top[i].sy); ctx.lineTo(top[i + 1].sx, top[i + 1].sy);
    ctx.lineTo(bot[i + 1].sx, bot[i + 1].sy); ctx.lineTo(bot[i].sx, bot[i].sy);
    ctx.closePath();
    ctx.fillStyle = "#2a2d35"; ctx.fill();
    ctx.strokeStyle = "#3a3d48"; ctx.lineWidth = 0.4; ctx.stroke();
  }

  ctx.beginPath();
  top.forEach((p, i) => (i === 0 ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy)));
  ctx.closePath();
  ctx.fillStyle = "#32353f"; ctx.fill();
  ctx.strokeStyle = "#52556a"; ctx.lineWidth = 1; ctx.stroke();

  ctx.strokeStyle = "rgba(210,215,225,0.55)"; ctx.lineWidth = 1.25;
  [90, 180, 270].forEach((deg) => {
    const rad = (deg * Math.PI) / 180;
    const a = tPt([8 * Math.cos(rad), 8 * Math.sin(rad), ZT]);
    const b = tPt([(R - 5) * Math.cos(rad), (R - 5) * Math.sin(rad), ZT]);
    ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
  });

  // A single bright, unmistakable "0° index" T-slot — everything else about
  // the table (its outline, the other 3 slots) reads as roughly the same
  // dark disc from most camera angles, which made the table's own C-axis
  // rotation nearly invisible even though it was happening correctly. This
  // one mark, drawn in a color nothing else on the table uses, is what a
  // viewer can actually lock their eye onto and watch sweep around.
  const idxRad = 0;
  const ia = tPt([8 * Math.cos(idxRad), 8 * Math.sin(idxRad), ZT]);
  const ib = tPt([(R - 5) * Math.cos(idxRad), (R - 5) * Math.sin(idxRad), ZT]);
  ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(ia.sx, ia.sy); ctx.lineTo(ib.sx, ib.sy); ctx.stroke();
  ctx.beginPath(); ctx.arc(ib.sx, ib.sy, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#fbbf24"; ctx.fill();

  ctx.restore();
}

// Draw trunnion arms (machine frame — don't rotate)
function drawTrunnionArms(ctx: CanvasRenderingContext2D, proj: ProjFn) {
  ctx.save();
  [100, -100].forEach((armY) => {
    const corners = [
      proj([-20, armY, -130]), proj([20, armY, -130]),
      proj([20, armY, -52]), proj([-20, armY, -52]),
    ];
    ctx.beginPath();
    corners.forEach((c, i) => (i === 0 ? ctx.moveTo(c.sx, c.sy) : ctx.lineTo(c.sx, c.sy)));
    ctx.closePath();
    ctx.fillStyle = "#1c1e24"; ctx.fill();
    ctx.strokeStyle = "#2e3040"; ctx.lineWidth = 0.5; ctx.stroke();

    // B-axis pivot hole
    const pivot = proj([0, armY, -52]);
    ctx.beginPath(); ctx.arc(pivot.sx, pivot.sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#111"; ctx.fill();
    ctx.strokeStyle = "#444"; ctx.lineWidth = 1; ctx.stroke();
  });
  ctx.restore();
}

// Draw spindle + holder + bull endmill (all in machine frame, no table rotation)
function drawSpindle(ctx: CanvasRenderingContext2D, proj: ProjFn, tip: Vec3, leadDeg: number) {
  const [TX, TY, TZ] = tip;

  const p0 = proj([TX, TY, TZ]);
  const pZ = proj([TX, TY, TZ + 10]);
  const pX = proj([TX + 10, TY, TZ]);

  const axDx = (pZ.sx - p0.sx) / 10, axDy = (pZ.sy - p0.sy) / 10;
  const axL = Math.sqrt(axDx * axDx + axDy * axDy) || 1;
  const ax: [number, number] = [axDx / axL, axDy / axL];
  const pr: [number, number] = [-ax[1], ax[0]]; // perp in screen space

  const SZ = axL;
  const wDx = (pX.sx - p0.sx) / 10, wDy = (pX.sy - p0.sy) / 10;
  const SW = Math.sqrt(wDx * wDx + wDy * wDy);

  const P = (zOff: number, xOff = 0): [number, number] => [
    p0.sx + ax[0] * zOff * SZ + pr[0] * xOff * SW,
    p0.sy + ax[1] * zOff * SZ + pr[1] * xOff * SW,
  ];

  const poly = (pts: [number, number][], fill: string | CanvasGradient, stroke = "rgba(0,0,0,0.35)", lw = 0.5) => {
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    pts.slice(1).forEach((p) => ctx.lineTo(...p));
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
  };

  ctx.save();

  {
    const g = ctx.createLinearGradient(...P(70, -25), ...P(70, 25));
    g.addColorStop(0, "#222530"); g.addColorStop(0.25, "#454a58");
    g.addColorStop(0.75, "#454a58"); g.addColorStop(1, "#222530");
    poly([P(90, -23), P(90, 23), P(50, 23), P(50, -23)], g);
    poly([P(52, -26), P(52, 26), P(49, 26), P(49, -26)], "#1a1c25", "#30334a", 0.5);
    poly([P(50, -20), P(50, 20), P(48, 20), P(48, -20)], "#2a2d38", "#404558", 0.5);
  }

  {
    const g = ctx.createLinearGradient(...P(30, -19), ...P(30, 19));
    g.addColorStop(0, "#1a1c22"); g.addColorStop(0.35, "#343840");
    g.addColorStop(0.65, "#343840"); g.addColorStop(1, "#1a1c22");
    poly([P(8, -7), P(8, 7), P(48, 19), P(48, -19)], g);
    poly([P(48, -4), P(48, 4), P(52, 4), P(52, -4)], "#111318", "#2a2d38", 0.5);
  }

  poly([P(4, -8), P(4, 8), P(9, 8), P(9, -8)], "#1e2028", "#33364a", 0.5);

  {
    const g = ctx.createLinearGradient(...P(2, -6), ...P(2, 6));
    g.addColorStop(0, "#0e1015"); g.addColorStop(0.18, "#50545f");
    g.addColorStop(0.5, "#646870"); g.addColorStop(0.82, "#50545f");
    g.addColorStop(1, "#0e1015");
    poly([P(0, -6), P(0, 6), P(4, 6), P(4, -6)], g);
    ctx.strokeStyle = "rgba(0,0,0,0.55)"; ctx.lineWidth = 0.6;
    [-3.5, -1.5, 1.5, 3.5].forEach((x) => {
      ctx.beginPath(); ctx.moveTo(...P(0.2, x)); ctx.lineTo(...P(3.8, x)); ctx.stroke();
    });
  }

  {
    const TOOL_R = 6, CORN = 2;
    const btm: [number, number][] = [P(0, -TOOL_R), P(CORN, -TOOL_R), P(0, -(TOOL_R - CORN)), P(0, TOOL_R - CORN), P(CORN, TOOL_R), P(0, TOOL_R)];
    poly([btm[0], btm[1], btm[2], btm[3], btm[4], btm[5]], "#5a5d68", "#909090", 1.0);
    const g = ctx.createLinearGradient(...P(0, -4), ...P(0, 4));
    g.addColorStop(0, "#888"); g.addColorStop(0.5, "#ccc"); g.addColorStop(1, "#888");
    poly([P(0, -(TOOL_R - CORN)), P(CORN, -TOOL_R), P(CORN, TOOL_R), P(0, TOOL_R - CORN)], g, "#aaa", 0.5);
  }

  {
    const TOOL_R = 6;
    const lead = (leadDeg * Math.PI) / 180;
    const cpZ = TOOL_R * (1 - Math.cos(lead)) * SZ;
    const cpX = TOOL_R * Math.sin(lead) * SW * (lead < 0.01 ? 0 : 1);
    ctx.beginPath();
    ctx.arc(p0.sx + ax[0] * cpZ + pr[0] * cpX, p0.sy + ax[1] * cpZ + pr[1] * cpX, Math.max(2, 2.5 * SW / 8), 0, Math.PI * 2);
    ctx.fillStyle = "#ff2244"; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 0.5; ctx.stroke();
  }

  ctx.restore();
}

// Screen-space axis compass (always visible bottom-left)
function drawCompass(ctx: CanvasRenderingContext2D, proj: ProjFn, W: number, H: number) {
  const CX = 60, CY = H - 60, R = 40;
  ctx.save();
  ctx.beginPath(); ctx.arc(CX, CY, R + 10, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke();

  const p0 = proj([0, 0, 0]);
  (
    [["X", [1, 0, 0], "#ff4455"], ["Y", [0, 1, 0], "#33dd66"], ["Z", [0, 0, 1], "#3388ff"]] as [string, Vec3, string][]
  ).forEach(([lbl, dir, c]) => {
    const p1 = proj([dir[0] * 200, dir[1] * 200, dir[2] * 200]);
    const dx = p1.sx - p0.sx, dy = p1.sy - p0.sy;
    const l = Math.sqrt(dx * dx + dy * dy) || 1;
    const ex = CX + (dx / l) * R, ey = CY + (dy / l) * R;
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(ex, ey);
    ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.stroke();
    const ux = dx / l, uy = dy / l;
    ctx.beginPath(); ctx.moveTo(ex, ey);
    ctx.lineTo(ex - ux * 8 + uy * 4, ey - uy * 8 - ux * 4);
    ctx.lineTo(ex - ux * 8 - uy * 4, ey - uy * 8 + ux * 4);
    ctx.closePath(); ctx.fillStyle = c; ctx.fill();
    ctx.fillStyle = c; ctx.font = "bold 12px sans-serif";
    ctx.fillText(lbl, ex + 4 * ux + 4, ey + 4 * uy + 4);
  });
  ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.font = "9px sans-serif";
  ctx.fillText("machine", CX - 14, CY + R + 16);
  ctx.restore();
}

// ─── Viewport ─────────────────────────────────────────────────────────────────

const SHAPE_COLORS: Record<ShapeId, Vec3> = {
  egg: [105, 175, 245],
  cam: [245, 165, 70],
  bell: [90, 220, 155],
};

interface ViewportProps {
  geom: Geometry;
  path: ToolpathStep[];
  axes: Axes;
  shows: Record<string, boolean>;
  activeIdx: number;
  leadDeg: number;
  shape: ShapeId;
  alignNormal: Vec3 | null;
  originPoint: Vec3;
  calcGeom: Geometry | null;
  calcFaceCenter: Vec3 | null;
  calcFixtureGeom: Geometry | null;
}

function Viewport3D({ geom, path, axes, shows, activeIdx, leadDeg, shape, alignNormal, originPoint, calcGeom, calcFaceCenter, calcFixtureGeom }: ViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drag, setDrag] = useState<{ x: number; y: number; r: { rx: number; ry: number } } | null>(null);
  const [view, setView] = useState({ rx: -0.62, ry: 0.45 });
  const [zoom, setZoom] = useState(1.0);
  const [size, setSize] = useState({ w: 600, h: 520 });

  // Crisp resize — already correct in this lab (unlike Matrix 3D Lab's Three.js
  // setup): a ResizeObserver drives `size`, and the paint effect below depends
  // on it, so the canvas always repaints at the container's actual dimensions.
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ro = new ResizeObserver((e) => {
      const r = e[0].contentRect;
      setSize({ w: Math.round(r.width) || 600, h: Math.round(r.height) || 520 });
    });
    ro.observe(canvas); return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const { w: W, h: H } = size;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.scale(dpr, dpr);
    paint(ctx, W, H);
    ctx.restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, geom, path, axes, shows, view, zoom, activeIdx, leadDeg, shape, alignNormal, originPoint, calcGeom, calcFaceCenter, calcFixtureGeom]);

  function paint(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const cx = W / 2, cy = H * 0.52;
    const sc = zoom * (W / 500);
    const { rx, ry } = view;
    const proj: ProjFn = (pt) => project(pt, rx, ry, sc, cx, cy);

    const B = (axes.B * Math.PI) / 180, C = (axes.C * Math.PI) / 180;
    const M_t = mat4mul(Ry(B), Rz(C));
    const tPt = (p: Vec3): Vec3 => { const w = mat4vec(M_t, [p[0], p[1], p[2], 1]); return [w[0], w[1], w[2]]; };
    const tVec = (v: Vec3): Vec3 => { const w = mat4vec(M_t, [v[0], v[1], v[2], 0]); return [w[0], w[1], w[2]]; };

    // This whole viewport is a self-contained "machine shop" rendering, kept
    // fixed-dark regardless of the app's theme — same reasoning as every other
    // fixed-dark lab viewport in this codebase (robot-arm-sim, drone-lab, …):
    // the equipment's own appearance, not app chrome.
    ctx.fillStyle = "#080810"; ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 0.7;
    for (let g = -130; g <= 130; g += 25) {
      const ga = proj([g, -130, -135]), gb = proj([g, 130, -135]);
      ctx.beginPath(); ctx.moveTo(ga.sx, ga.sy); ctx.lineTo(gb.sx, gb.sy); ctx.stroke();
      const gc = proj([-130, g, -135]), gd = proj([130, g, -135]);
      ctx.beginPath(); ctx.moveTo(gc.sx, gc.sy); ctx.lineTo(gd.sx, gd.sy); ctx.stroke();
    }
    ctx.restore();

    drawTrunnionArms(ctx, proj);
    drawTable(ctx, proj, M_t);

    const L1 = norm3([0.25, 0.72, 0.55]);
    const L2 = norm3([0.85, 0.08, 0.42]);
    const AMB = 0.42;
    const vd: Vec3 = [-Math.sin(ry) * Math.cos(rx), Math.sin(rx), Math.cos(ry) * Math.cos(rx)];

    // Both the fixture and the workpiece mesh below are transformed through
    // this SAME tPt/tVec pair (driven by axes.B/C via M_t above), so they are
    // mathematically guaranteed to move together, rigidly, as the table
    // rotates — there's no way for "the part" to move independently of "the
    // table" here. Rendered as two separate depth-sorted passes (rather than
    // one merged mesh) purely so each can carry its own flat color.
    function paintFlatMesh(pts: Vec3[], norms: Vec3[], tris: [number, number, number][], col: Vec3) {
      const tPts = pts.map((p) => tPt(p));
      const tNorms = norms.map((n) => tVec(n));
      const faceList = tris.map(([ai, bi, ci]) => {
        const pa = tPts[ai], pb = tPts[bi], pc = tPts[ci];
        const depth = (proj(pa).depth + proj(pb).depth + proj(pc).depth) / 3;
        const fn = norm3([tNorms[ai][0] + tNorms[bi][0] + tNorms[ci][0],
          tNorms[ai][1] + tNorms[bi][1] + tNorms[ci][1],
          tNorms[ai][2] + tNorms[bi][2] + tNorms[ci][2]]);
        return { ai, bi, ci, depth, fn };
      }).filter((f) => dot3(f.fn, vd) > -0.05);
      faceList.sort((a, b) => b.depth - a.depth);

      for (const { ai, bi, ci, fn } of faceList) {
        const pa = proj(tPts[ai]), pb = proj(tPts[bi]), pc = proj(tPts[ci]);
        const lv = AMB + 0.50 * Math.max(0, dot3(fn, L1)) + 0.22 * Math.max(0, dot3(fn, L2));
        const sp = Math.pow(Math.max(0, dot3(fn, norm3([L1[0], L1[1] + 0.3, L1[2]]))), 18) * 60;
        const r = Math.min(255, Math.round(col[0] * lv + sp));
        const g = Math.min(255, Math.round(col[1] * lv + sp));
        const b = Math.min(255, Math.round(col[2] * lv + sp));
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy); ctx.lineTo(pc.sx, pc.sy);
        ctx.closePath(); ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fill();
      }
    }

    // Fixture plate — bolted flat to the table (not tilted by the compound
    // angle, unlike the workpiece sitting on it). Its only job is to give the
    // eye something clearly "table-mounted" to track alongside the part, so
    // the rigid part+table motion during Play C/Play B reads as one assembly
    // turning together rather than the part spinning in isolation.
    if (calcGeom && calcFixtureGeom) {
      paintFlatMesh(calcFixtureGeom.pts, calcFixtureGeom.norms, calcFixtureGeom.tris, [72, 78, 90]);
    }

    // In Calculator mode, the selected primitive replaces the toolpath shape
    // entirely — showing the egg/cam/bell alongside a workpiece the user is
    // actively tilting/positioning was more distracting than helpful.
    const activeGeom = calcGeom ?? geom;
    const col: Vec3 = calcGeom ? [150, 158, 168] : (SHAPE_COLORS[shape] || [120, 170, 220]);
    paintFlatMesh(activeGeom.pts, activeGeom.norms, activeGeom.tris, col);
    const { pts, norms } = activeGeom;

    if (shows.normals && !calcGeom) {
      const stride = Math.max(1, Math.floor(pts.length / 70));
      ctx.save();
      for (let i = 0; i < pts.length; i += stride) {
        if (norms[i][2] < 0.08) continue;
        const tp = tPt(pts[i]), tn = tVec(norms[i]);
        const bp = proj(tp), ep = proj([tp[0] + tn[0] * 18, tp[1] + tn[1] * 18, tp[2] + tn[2] * 18]);
        ctx.beginPath(); ctx.moveTo(bp.sx, bp.sy); ctx.lineTo(ep.sx, ep.sy);
        ctx.strokeStyle = "rgba(255,80,200,0.55)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(ep.sx, ep.sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ff44cc"; ctx.fill();
      }
      ctx.restore();
    }

    if (shows.toolpath && path.length > 1 && !calcGeom) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,210,0,0.80)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); let first = true;
      path.forEach((s) => {
        const p = proj([s.X, s.Y, s.Z]);
        if (first) { ctx.moveTo(p.sx, p.sy); first = false; } else ctx.lineTo(p.sx, p.sy);
      });
      ctx.stroke();
      ctx.restore();
    }

    if (shows.vectors) {
      const origin = tPt([0, 0, 0]);
      const op = proj(origin);
      ctx.save(); ctx.setLineDash([4, 4]);
      (
        [[[1, 0, 0], "#ff4455"], [[0, 1, 0], "#33dd66"], [[0, 0, 1], "#3388ff"]] as [Vec3, string][]
      ).forEach(([d, c]) => {
        const end = tPt([d[0] * 38, d[1] * 38, d[2] * 38]);
        const ep = proj(end);
        ctx.beginPath(); ctx.moveTo(op.sx, op.sy); ctx.lineTo(ep.sx, ep.sy);
        ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      const mO = proj([0, -82, 0]);
      (
        [[[40, 0, 0], "X", "#ff4455"], [[0, 0, 40], "Z", "#3388ff"], [[0, 40, 0], "Y", "#33dd66"]] as [Vec3, string, string][]
      ).forEach(([tip, lbl, c]) => {
        const ep = proj([tip[0], -82, tip[2]]);
        ctx.beginPath(); ctx.moveTo(mO.sx, mO.sy); ctx.lineTo(ep.sx, ep.sy);
        ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.stroke();
        const dx = ep.sx - mO.sx, dy = ep.sy - mO.sy, l = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / l, uy = dy / l;
        ctx.beginPath(); ctx.moveTo(ep.sx, ep.sy);
        ctx.lineTo(ep.sx - ux * 8 + uy * 4, ep.sy - uy * 8 - ux * 4);
        ctx.lineTo(ep.sx - ux * 8 - uy * 4, ep.sy - uy * 8 + ux * 4);
        ctx.closePath(); ctx.fillStyle = c; ctx.fill();
        ctx.fillStyle = c; ctx.font = "bold 12px sans-serif"; ctx.fillText(lbl, ep.sx + 5, ep.sy - 3);
      });
      ctx.restore();
    }

    {
      // Spindle position always follows the X/Y/Z sliders directly (the
      // linear axes) — B/C drive the table via M_t above. Playback/scrubbing
      // already syncs axes.X/Y/Z from the toolpath each step, so this stays
      // correct during playback while also responding to manual slider drags,
      // which it didn't before (X/Y/Z had no visible effect at all).
      const tipMach: Vec3 = [axes.X, axes.Y, axes.Z];
      const step = activeIdx >= 0 && activeIdx < path.length ? path[activeIdx] : null;

      if (shows.normals && step?.nPart && !calcGeom) {
        const nM = tVec(step.nPart);
        const bp = proj(tipMach);
        const ep = proj([step.X + nM[0] * 30, step.Y + nM[1] * 30, step.Z + nM[2] * 30]);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(bp.sx, bp.sy); ctx.lineTo(ep.sx, ep.sy);
        ctx.strokeStyle = "#ff22cc"; ctx.lineWidth = 2.5; ctx.stroke();
        const dx = ep.sx - bp.sx, dy = ep.sy - bp.sy, l = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / l, uy = dy / l;
        ctx.beginPath(); ctx.moveTo(ep.sx, ep.sy);
        ctx.lineTo(ep.sx - ux * 9 + uy * 4, ep.sy - uy * 9 - ux * 4);
        ctx.lineTo(ep.sx - ux * 9 - uy * 4, ep.sy - uy * 9 + ux * 4);
        ctx.closePath(); ctx.fillStyle = "#ff22cc"; ctx.fill();
        ctx.fillStyle = "#ff44dd"; ctx.font = "bold 10px sans-serif";
        ctx.fillText("n_surface", ep.sx + 5, ep.sy - 3);
        ctx.restore();
      }

      if (shows.vectors) {
        const tp = proj(tipMach);
        const ta = proj([tipMach[0], tipMach[1], tipMach[2] - 36]);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(tp.sx, tp.sy); ctx.lineTo(ta.sx, ta.sy);
        ctx.strokeStyle = "#44bbff"; ctx.lineWidth = 2; ctx.stroke();
        const dx = ta.sx - tp.sx, dy = ta.sy - tp.sy, l = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / l, uy = dy / l;
        ctx.beginPath(); ctx.moveTo(ta.sx, ta.sy);
        ctx.lineTo(ta.sx - ux * 9 + uy * 4, ta.sy - uy * 9 - ux * 4);
        ctx.lineTo(ta.sx - ux * 9 - uy * 4, ta.sy - uy * 9 + ux * 4);
        ctx.closePath(); ctx.fillStyle = "#44bbff"; ctx.fill();
        ctx.fillStyle = "#66ccff"; ctx.font = "bold 10px sans-serif";
        ctx.fillText("[0,0,−1]", ta.sx + 5, ta.sy + 3);
        ctx.restore();
      }

      drawSpindle(ctx, proj, tipMach, leadDeg);
    }

    // Calculator "align" overlay — the chosen target normal, anchored at the
    // primitive's own face center (not the table origin) so the arrow visibly
    // comes off the actual part, and transformed by the table's CURRENT
    // (possibly mid-animation) orientation. As axes.B/C tween toward the
    // solved values, this vector sweeps from wherever it started into
    // alignment with machine Z — no separate interpolation needed, it rides
    // the same M_t the rest of the scene uses.
    if (alignNormal) {
      const origin = tPt(calcFaceCenter ?? [0, 0, 0]);
      const op = proj(origin);
      const nWorld = tVec(alignNormal);
      const ep = proj([origin[0] + nWorld[0] * 60, origin[1] + nWorld[1] * 60, origin[2] + nWorld[2] * 60]);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(op.sx, op.sy); ctx.lineTo(ep.sx, ep.sy);
      ctx.strokeStyle = "#facc15"; ctx.lineWidth = 3; ctx.stroke();
      const dx = ep.sx - op.sx, dy = ep.sy - op.sy, l = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / l, uy = dy / l;
      ctx.beginPath(); ctx.moveTo(ep.sx, ep.sy);
      ctx.lineTo(ep.sx - ux * 10 + uy * 5, ep.sy - uy * 10 - ux * 5);
      ctx.lineTo(ep.sx - ux * 10 - uy * 5, ep.sy - uy * 10 + ux * 5);
      ctx.closePath(); ctx.fillStyle = "#facc15"; ctx.fill();
      ctx.fillStyle = "#fde047"; ctx.font = "bold 11px sans-serif";
      ctx.fillText("target normal", ep.sx + 6, ep.sy - 4);
      ctx.restore();
    }

    // Origin point marker — a part-local reference point (rotates with the
    // table via tPt, since it represents a location ON the workpiece).
    // Position only; doesn't feed into the B/C math at all.
    {
      const op = tPt(originPoint);
      const sp = proj(op);
      ctx.save();
      ctx.beginPath(); ctx.arc(sp.sx, sp.sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = "#7dd3fc"; ctx.font = "bold 10px sans-serif";
      ctx.fillText("origin", sp.sx + 8, sp.sy - 4);
      ctx.restore();
    }

    if (shows.vectors) drawCompass(ctx, proj, W, H);
  }

  const PRESETS = [
    { label: "Iso", v: { rx: -0.62, ry: 0.45 } },
    { label: "Front", v: { rx: -Math.PI / 2, ry: 0 } },
    { label: "Right", v: { rx: -Math.PI / 2, ry: -Math.PI / 2 } },
    { label: "Left", v: { rx: -Math.PI / 2, ry: Math.PI / 2 } },
    { label: "Top", v: { rx: 0, ry: 0 } },
  ];

  const onMouseDown = useCallback((e: React.MouseEvent) => setDrag({ x: e.clientX, y: e.clientY, r: { ...view } }), [view]);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag) return;
    setView({ rx: drag.r.rx + (e.clientY - drag.y) * 0.006, ry: drag.r.ry + (e.clientX - drag.x) * 0.006 });
  }, [drag]);
  const onMouseUp = useCallback(() => setDrag(null), []);
  const onWheel = useCallback((e: React.WheelEvent) => { e.preventDefault(); setZoom((z) => Math.max(0.3, Math.min(5, z * (e.deltaY < 0 ? 1.1 : 0.9)))); }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", cursor: drag ? "grabbing" : "grab", touchAction: "none" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}
      />
      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", flexDirection: "column", gap: 3, pointerEvents: "auto" }}>
        {PRESETS.map((p) => (
          <button
            key={p.label} onClick={() => { setView(p.v); setZoom(1.0); }}
            style={{ padding: "3px 9px", borderRadius: 4, border: "1px solid #2a2a3a", background: "rgba(10,10,20,0.82)", color: "#888", fontSize: 9.5, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3 }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────

function MatDisplay({ M, label, color = "#38bdf8" }: { M: number[][]; label: string; color?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] font-black tracking-wide uppercase mb-1" style={{ color }}>{label}</div>
      <div className="font-mono text-[10px] text-slate-300 leading-relaxed bg-black/40 rounded-lg p-2 border shadow-inner" style={{ borderColor: color + "44" }}>
        {M.map((row, i) => (
          <div key={i}>{i === 0 ? "⎡" : i === M.length - 1 ? "⎣" : "⎢"}{" "}
            {row.map((v) => (v >= 0 ? " " : "") + v.toFixed(3)).join("  ")}{" "}
            {i === 0 ? "⎤" : i === M.length - 1 ? "⎦" : "⎥"}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixPanel({ axes }: { axes: Axes }) {
  const M_C = Rz((axes.C * Math.PI) / 180);
  const M_B = Ry((axes.B * Math.PI) / 180);
  const M_table = mat4mul(M_B, M_C);
  return (
    <div className="p-4 overflow-y-auto h-full box-border">
      <div className="font-mono text-[9px] text-slate-400 leading-relaxed mb-4 bg-white/5 dark:bg-black/20 rounded-lg p-2.5 border border-slate-200/20 dark:border-white/10 shadow-sm">
        <span className="text-sky-400 font-bold">p_machine</span> = Ry(B) · Rz(C) · p_part<br />
        Tool = [0,0,−1] always &nbsp;·&nbsp; TABLE rotates, not spindle<br />
        IK: C = atan2(−ny,nx) &nbsp;·&nbsp; B = atan2(−r,nz) + lead
      </div>
      <MatDisplay M={M_C} label={`Rz(C) — table spin  C=${axes.C.toFixed(1)}°`} color="#fbbf24" />
      <div className="text-[9px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
        Rotates part around Z axis. The 2×2 block in rows 0–1 is [cosC, −sinC; sinC, cosC].
        Spinning C brings any profile direction under the vertical spindle.
      </div>
      <MatDisplay M={M_B} label={`Ry(B) — tilt  B=${axes.B.toFixed(1)}°`} color="#f43f5e" />
      <div className="text-[9px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
        Tilts entire C+table assembly around machine Y. The 2×2 in rows 0 &amp; 2 is [cosB, sinB; −sinB, cosB].
        B=0 = flat. B=±90° = table tipped 90° on its side.
      </div>
      <MatDisplay M={M_table} label="M = Ry(B)·Rz(C)  (part→machine)" color="#a855f7" />
      <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Combined rotation. det=1, rows are orthonormal — it's a pure rotation, no scaling/shearing.
        The 3×3 upper-left block fully determines the orientation.
      </div>
    </div>
  );
}

interface MathItem { h: string; c: string; b: string }
const MATH: Record<ShapeId, { title: string; items: MathItem[] }> = {
  egg: { title: "Ball-end / Bull-nose Surface Contouring", items: [
    { h: "Ellipsoid parameterization", c: "#38bdf8", b: "p(u,v)=[36·sinv·cosu, 36·sinv·sinu, rz·cosv]. Two angular parameters u∈[0,2π], v∈[0,π] cover every point — like longitude/latitude. The spiral toolpath increments both u and v simultaneously." },
    { h: "Surface normal from gradient", c: "#f43f5e", b: "For ellipsoid F=x²/rx²+y²/ry²+z²/rz²=1, outward normal n=∇F/|∇F|=[x/rx², y/ry², z/rz²] normalized. This is the exact analytic normal — no numerical differentiation needed." },
    { h: "IK: C = atan2(−ny, nx)", c: "#34d399", b: "C spins the part so the Y component of n goes to zero, landing n in the XZ plane. After Rz(C), n becomes [√(nx²+ny²), 0, nz]. Think of it as choosing your longitude." },
    { h: "IK: B = atan2(−r, nz) + lead", c: "#fbbf24", b: "B tilts until the normal faces up. Since nz=cos(B) at perfect tracking (up to sign), B=atan2(−r,nz) is the exact solution. Adding lead tilts the table slightly less → ball contacts the side of the tool rather than the very tip → better chip flow." },
  ] },
  cam: { title: "Side-wall & Swarf Milling", items: [
    { h: "Cam profile  r(u) = 28 + 16·cos²·⁵(u)", c: "#fbbf24", b: "The lobe rises quickly (cosine power 2.5) then falls gradually. This asymmetry means the chip cross-section varies around the profile — a real CAM system would modulate feed rate to keep chip load constant." },
    { h: "Near-vertical walls → B ≈ ±90°", c: "#38bdf8", b: "Side wall normals are horizontal: n≈[nx,ny,0]. The IK gives |B|=acos(0)=90°. Adding a 5° upward blend to the normal keeps B away from the mechanical limit while giving a useful side-contact geometry." },
    { h: "C tracks the profile direction", c: "#34d399", b: "C=atan2(−ny,nx) continuously changes as the tool traverses the cam profile. C effectively aims the \"tilt direction\" at the current wall face. The boustrophedon (zigzag) pattern is the standard contour strategy for side walls." },
    { h: "Lead on a side wall = swarf", c: "#f43f5e", b: "Adding lead on a near-vertical wall brings the tool flank into contact — that's swarf milling. The side of the flute removes material. Extremely fast but requires a ruled surface (straight generator line) or the tool gouges." },
  ] },
  bell: { title: "Dome & Flare — B-axis sweep", items: [
    { h: "Compound profile", c: "#34d399", b: "r(t)=22·sinα+18·t^2.5·sinα, z=56·cosα−10·t³·sinα. The t^2.5 flare widens the skirt rapidly with a curvature that changes throughout — typical for bell-housing and turbine cover shapes." },
    { h: "B sweeps 0→~∓72°", c: "#38bdf8", b: "At the top nz≈1 → |B|≈0°. At the flare nz≈0.3 → |B|≈72°. The trunnion swings 72° to follow the surface. Watch the B slider during playback — the most active axis on this part." },
    { h: "Curvature → required stepover", c: "#fbbf24", b: "Tight curvature means toolpath rows diverge less per unit height — smaller stepover needed to hit the surface finish spec. CAM computes this from the part's principal curvature κ₁ and κ₂ at each point." },
    { h: "Polar singularity", c: "#f43f5e", b: "At the dome top n=[0,0,1] → C is undefined (any C value works). Post-processors handle this with \"polar interpolation\" — clamping C motion or using a smooth C=const pass through the pole." },
  ] },
};

function MathPanel({ shape }: { shape: ShapeId }) {
  const [open, setOpen] = useState(0);
  const c = MATH[shape] || MATH.egg;
  return (
    <div className="p-4 overflow-y-auto h-full box-border">
      <div className="font-bold text-slate-700 dark:text-slate-200 text-[12px] mb-3">{c.title}</div>
      <div className="flex flex-col gap-2">
        {c.items.map((item, i) => (
          <div key={i} className={`rounded-lg overflow-hidden transition-all duration-300 border ${open === i ? "shadow-sm" : "border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"}`} style={open === i ? { borderColor: item.c + "55", background: item.c + "0a" } : {}}>
            <button onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full px-3 py-2.5 border-none cursor-pointer text-left font-bold text-[10.5px] flex justify-between items-center bg-transparent transition-colors"
              style={{ color: open === i ? item.c : "currentColor" }}>
              <span className={open !== i ? "text-slate-600 dark:text-slate-400" : ""}>{item.h}</span>
              <span className={`transition-transform duration-300 text-[9px] ${open === i ? "rotate-180 opacity-80" : "opacity-40 text-slate-500"}`}>▼</span>
            </button>
            <div className={`transition-all duration-300 ease-in-out origin-top ${open === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-3 pb-3 text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {item.b}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calculator panel (new) ───────────────────────────────────────────────────
// Bidirectional B/C tool: Inverse ("Calculate") solves B/C for a target plane;
// Forward ("Verify") applies known B/C to a reference normal to confirm where
// it ends up. Both reuse the exact same ikFromNormal/Mtable math the rest of
// the lab already uses — no separate formulas invented for this panel.

type CalcMode = "inverse" | "forward";
type AngleOrder = "xy" | "yx";
type RotAxis = "x" | "y";
interface RotationStep { axis: RotAxis; angleDeg: number }

// Runs an eased tween, calling onFrame(progress 0→1) every animation frame.
function animateEase(durMs: number, onFrame: (e: number) => void, onDone?: () => void) {
  const start = performance.now();
  function tick(now: number) {
    const t = Math.min(1, (now - start) / durMs);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
    onFrame(e);
    if (t < 1) requestAnimationFrame(tick); else onDone?.();
  }
  requestAnimationFrame(tick);
}


function NumField({ label, value, onChange, step = 0.1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400">
      <span className="w-6 font-mono font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <input
        type="number" value={value} step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 min-w-0 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-[11px]"
      />
    </label>
  );
}

interface CalculatorPanelProps {
  originPoint: Vec3;
  onOriginChange: (p: Vec3) => void;
  primitiveKind: PrimitiveKind;
  onPrimitiveChange: (k: PrimitiveKind) => void;
  angleX: number;
  onAngleXChange: (v: number) => void;
  angleY: number;
  onAngleYChange: (v: number) => void;
  order: AngleOrder;
  onOrderChange: (o: AngleOrder) => void;
  onPlayConstructionStep: (idx: 0 | 1) => Promise<void>;
  onAlignVector: (v: Vec3 | null) => void;
  animateAxis: (which: "B" | "C", target: number, dur?: number) => Promise<void>;
}

const AXIS_LABEL: Record<RotAxis, string> = { x: "X", y: "Y" };

function StepCard({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{n}</span>
        <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      {children}
    </div>
  );
}

function CalculatorPanel({
  originPoint, onOriginChange, primitiveKind, onPrimitiveChange,
  angleX, onAngleXChange, angleY, onAngleYChange, order, onOrderChange,
  onPlayConstructionStep, onAlignVector, animateAxis,
}: CalculatorPanelProps) {
  const [mode, setMode] = useState<CalcMode>("inverse");

  // Forward mode
  const [fB, setFB] = useState(0);
  const [fC, setFC] = useState(0);
  const [refNx, setRefNx] = useState(0);
  const [refNy, setRefNy] = useState(0);
  const [refNz, setRefNz] = useState(1);

  const steps: RotationStep[] = order === "xy"
    ? [{ axis: "x", angleDeg: angleX }, { axis: "y", angleDeg: angleY }]
    : [{ axis: "y", angleDeg: angleY }, { axis: "x", angleDeg: angleX }];

  const n0: Vec3 = [0, 0, 1];
  const nAfterStep1: Vec3 = useMemo(() => {
    const s = steps[0];
    const M = s.axis === "x" ? Rx((s.angleDeg * Math.PI) / 180) : Ry((s.angleDeg * Math.PI) / 180);
    const w = mat4vec(M, [n0[0], n0[1], n0[2], 0]);
    return norm3([w[0], w[1], w[2]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angleX, angleY, order]);
  const targetNormal: Vec3 = useMemo(() => {
    const s = steps[1];
    const M = s.axis === "x" ? Rx((s.angleDeg * Math.PI) / 180) : Ry((s.angleDeg * Math.PI) / 180);
    const w = mat4vec(M, [nAfterStep1[0], nAfterStep1[1], nAfterStep1[2], 0]);
    return norm3([w[0], w[1], w[2]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nAfterStep1, angleX, angleY, order]);

  // `ikFromNormal` only ever returns ONE of the two rotary solutions that
  // reach a given target normal — by construction (r = √(nx²+ny²) is never
  // negative) its B always comes out ≤ 0. The other valid posture — same
  // normal, opposite side of the table's travel — is (-B, C+180°): C spun
  // the long way around lands the in-plane component on the opposite side,
  // so B has to tilt the opposite way to compensate. Both are equally
  // correct positions for the same plane; which one is reachable/preferable
  // depends on the machine's current position and travel limits, which is
  // why this is offered as an explicit choice rather than silently picked.
  const [posture, setPosture] = useState<"primary" | "alt">("primary");
  const primaryIk = ikFromNormal(targetNormal[0], targetNormal[1], targetNormal[2], 0);
  const altIk = { B_deg: -primaryIk.B_deg, C_deg: wrapDeg180(primaryIk.C_deg + 180) };
  const ik = posture === "primary" ? primaryIk : altIk;

  const nAfterC: Vec3 = useMemo(() => {
    const M = Rz((ik.C_deg * Math.PI) / 180);
    const w = mat4vec(M, [targetNormal[0], targetNormal[1], targetNormal[2], 0]);
    return norm3([w[0], w[1], w[2]]);
  }, [targetNormal, ik.C_deg]);
  const M_inv = Mtable(ik.B_deg, ik.C_deg);

  const M_fwd = Mtable(fB, fC);
  const fwdResult = mat4vec(M_fwd, [refNx, refNy, refNz, 0]);
  const fwdResultNorm = norm3([fwdResult[0], fwdResult[1], fwdResult[2]]);

  async function playC() {
    onAlignVector(targetNormal);
    await animateAxis("C", ik.C_deg);
  }
  async function playB() {
    onAlignVector(targetNormal);
    await animateAxis("B", ik.B_deg);
  }
  async function playEverything() {
    await onPlayConstructionStep(0);
    await onPlayConstructionStep(1);
    await playC();
    await playB();
  }

  const tabBtn = (m: CalcMode, label: string) => (
    <button
      onClick={() => setMode(m)}
      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${
        mode === m ? "bg-indigo-500/15 border-indigo-400 text-indigo-600 dark:text-indigo-300" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
      }`}
    >
      {label}
    </button>
  );

  const playBtn = (label: string, onClick: () => void) => (
    <button onClick={onClick} className="self-start px-2.5 py-1 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white text-[9.5px] font-bold uppercase tracking-wide transition-colors">
      {label}
    </button>
  );
  const vecStr = (v: Vec3) => `[${v.map((x) => (x >= 0 ? " " : "") + x.toFixed(3)).join(", ")}]`;
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="p-4 overflow-y-auto h-full box-border text-slate-800 dark:text-slate-200">
      {showHelp && <FiveAxisHelpModal onClose={() => setShowHelp(false)} targetNormal={targetNormal} />}
      <div className="flex gap-2 mb-4">
        {tabBtn("inverse", "Calculate (→ B/C)")}
        {tabBtn("forward", "Verify (B/C →)")}
        <button onClick={() => setShowHelp(true)}
          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-indigo-300 dark:border-indigo-500/40 text-indigo-500 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors shrink-0"
          title="Walk through how B and C are derived, step by step">
          ? How
        </button>
      </div>

      {mode === "inverse" ? (
        <div className="flex flex-col gap-3">
          {/* Pinned result — this is the actual answer to go verify on a real
              machine, so it stays visible no matter how far you scroll into
              the derivation below. Order is always C then B for THIS
              machine's kinematic chain — a fixed property of the machine,
              independent of whichever X/Y input order was picked below. */}
          <div className="sticky -top-4 z-10 -mx-4 -mt-4 px-4 pt-4 pb-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-2">Outcome — set the machine to this, in this order</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-100 dark:bg-black/30 rounded-lg p-2 border border-slate-200/50 dark:border-white/5">
                <div className="text-[8px] text-slate-400 uppercase font-black">1st — C</div>
                <div className="font-mono text-[18px] font-bold text-purple-500 leading-tight">{ik.C_deg.toFixed(2)}°</div>
              </div>
              <div className="bg-slate-100 dark:bg-black/30 rounded-lg p-2 border border-slate-200/50 dark:border-white/5">
                <div className="text-[8px] text-slate-400 uppercase font-black">2nd — B</div>
                <div className="font-mono text-[18px] font-bold text-rose-500 leading-tight">{ik.B_deg.toFixed(2)}°</div>
              </div>
            </div>
            <div className="flex gap-2 text-[9.5px] mt-2">
              <button onClick={() => setPosture("primary")} className={`flex-1 px-2 py-1 rounded-md border ${posture === "primary" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "border-slate-300 dark:border-slate-600 text-slate-500"}`}>
                This side (B {primaryIk.B_deg <= 0 ? "≤" : "≥"} 0)
              </button>
              <button onClick={() => setPosture("alt")} className={`flex-1 px-2 py-1 rounded-md border ${posture === "alt" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "border-slate-300 dark:border-slate-600 text-slate-500"}`}>
                Opposite side (flip)
              </button>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Same plane, two valid postures — C the long way around (±180°) flips which side B tilts to. Pick whichever side the machine can actually reach from its current position.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-black/20 border border-slate-200/50 dark:border-white/5">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-2">Workpiece</div>
            <div className="flex gap-2 text-[9.5px] mb-3">
              <button onClick={() => onPrimitiveChange("plate")} className={`flex-1 px-2 py-1 rounded-md border ${primitiveKind === "plate" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "border-slate-300 dark:border-slate-600 text-slate-500"}`}>Plate</button>
              <button onClick={() => onPrimitiveChange("block")} className={`flex-1 px-2 py-1 rounded-md border ${primitiveKind === "block" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "border-slate-300 dark:border-slate-600 text-slate-500"}`}>Block</button>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-2">Origin point (position only)</div>
            <div className="flex flex-col gap-2">
              <NumField label="X" value={originPoint[0]} onChange={(v) => onOriginChange([v, originPoint[1], originPoint[2]])} step={5} />
              <NumField label="Y" value={originPoint[1]} onChange={(v) => onOriginChange([originPoint[0], v, originPoint[2]])} step={5} />
              <NumField label="Z" value={originPoint[2]} onChange={(v) => onOriginChange([originPoint[0], originPoint[1], v])} step={5} />
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Where the workpiece sits on the table. It doesn't affect the rotation math at all; only the two tilt angles do.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-black/20 border border-slate-200/50 dark:border-white/5">
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-2">Compound tilt needed</div>
            <div className="flex flex-col gap-2">
              <NumField label="X°" value={angleX} onChange={onAngleXChange} step={1} />
              <NumField label="Y°" value={angleY} onChange={onAngleYChange} step={1} />
            </div>
            <div className="flex gap-2 text-[9.5px] mt-2">
              <button onClick={() => onOrderChange("xy")} className={`flex-1 px-2 py-1 rounded-md border ${order === "xy" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "border-slate-300 dark:border-slate-600 text-slate-500"}`}>Apply X then Y</button>
              <button onClick={() => onOrderChange("yx")} className={`flex-1 px-2 py-1 rounded-md border ${order === "yx" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "border-slate-300 dark:border-slate-600 text-slate-500"}`}>Apply Y then X</button>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Order matters — rotating X-then-Y lands on a different plane than Y-then-X in general (rotations don't commute). Pick whichever matches how your compound angle was actually specified. The workpiece on the table already reflects this tilt.
            </div>
          </div>

          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">How the solution is derived</div>

          <StepCard n={1} title={`Start: the workpiece's face points straight up`}>
            <div className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300">n₀ = {vecStr(n0)}</div>
          </StepCard>

          <StepCard n={2} title={`Rotate about ${AXIS_LABEL[steps[0].axis]} by ${steps[0].angleDeg}°`}>
            <div className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300">→ {vecStr(nAfterStep1)}</div>
            {playBtn("▶ Play this rotation", () => { void onPlayConstructionStep(0); })}
          </StepCard>

          <StepCard n={3} title={`Rotate about ${AXIS_LABEL[steps[1].axis]} by ${steps[1].angleDeg}° — this is the target`}>
            <div className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300">→ {vecStr(targetNormal)}</div>
            {playBtn("▶ Play this rotation", () => { void onPlayConstructionStep(1); })}
          </StepCard>

          <StepCard n={4} title={`Solve C = ${ik.C_deg.toFixed(2)}° — spin the table about Z until the sideways (Y) component vanishes`}>
            <div className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300">→ {vecStr(nAfterC)}</div>
            {playBtn("▶ Play C on the table", () => { void playC(); })}
          </StepCard>

          <StepCard n={5} title={`Solve B = ${ik.B_deg.toFixed(2)}° — tilt the table about Y until it points at the spindle`}>
            <div className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300">→ [ 0.000,  0.000,  1.000] (the spindle direction)</div>
            {playBtn("▶ Play B on the table", () => { void playB(); })}
          </StepCard>

          <button
            onClick={() => { void playEverything(); }}
            className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            ▶▶ Play the whole derivation in order
          </button>

          <MatDisplay M={M_inv} label="M = Ry(B)·Rz(C) for this solution" color="#a855f7" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <NumField label="B°" value={fB} onChange={setFB} step={0.5} />
          <NumField label="C°" value={fC} onChange={setFC} step={0.5} />
          <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 mb-1">Part-local reference direction to check (default: the part's nominal "up" face):</div>
          <NumField label="nx" value={refNx} onChange={setRefNx} />
          <NumField label="ny" value={refNy} onChange={setRefNy} />
          <NumField label="nz" value={refNz} onChange={setRefNz} />

          <div className="mt-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <div className="text-[9px] text-emerald-600 dark:text-emerald-300 font-black uppercase tracking-widest mb-2">Resulting machine-frame normal</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-200">
              [{fwdResultNorm.map((v) => (v >= 0 ? " " : "") + v.toFixed(4)).join(", ")}]
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-2">
              {Math.abs(fwdResultNorm[2] - 1) < 0.01 ? "✓ Points straight at the spindle [0,0,1]." : "Does not point at the spindle — this B/C would leave the surface tilted relative to the tool."}
            </div>
          </div>

          <MatDisplay M={M_fwd} label={`M = Ry(B)·Rz(C)  B=${fB.toFixed(1)}° C=${fC.toFixed(1)}°`} color="#38bdf8" />
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface ShapeMeta { id: ShapeId; label: string; desc: string; color: string }
const SHAPES: ShapeMeta[] = [
  { id: "egg", label: "Egg", desc: "Normal tracking", color: "#0ea5e9" },
  { id: "cam", label: "Cam", desc: "Side-wall · swarf", color: "#f59e0b" },
  { id: "bell", label: "Bell", desc: "Dome + flare", color: "#10b981" },
];

type RightTab = "matrices" | "math" | "calc";

interface FiveAxisKinematicsProps {
  onBack?: () => void;
}

export default function FiveAxisKinematics({ onBack }: FiveAxisKinematicsProps) {
  const [shape, setShape] = useState<ShapeId>("egg");
  const [axes, setAxes] = useState<Axes>({ X: 0, Y: 0, Z: 0, B: 0, C: 0 });
  const [leadDeg, setLeadDeg] = useState(5);
  const [shows, setShows] = useState({ toolpath: true, normals: false, vectors: true, matrices: true, math: false, calc: false });
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>("matrices");
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // alignNormal: the target-normal overlay, anchored at the primitive's own
  // face and drawn ATTACHED to the table (so it visibly sweeps into alignment
  // as B/C animate) — used by the solve steps.
  const [alignNormal, setAlignNormal] = useState<Vec3 | null>(null);
  const [originPoint, setOriginPoint] = useState<Vec3>([0, 0, 40]);

  // Calculator workpiece state — lifted up from the panel (rather than kept
  // local to it) because the Viewport needs these same values to actually
  // draw the tilted, positioned primitive; a sibling can't reach into another
  // sibling's local state, so the nearest common parent has to own it.
  const [primitiveKind, setPrimitiveKind] = useState<PrimitiveKind>("plate");
  const [calcAngleX, setCalcAngleX] = useState(30);
  const [calcAngleY, setCalcAngleY] = useState(35);
  const [calcOrder, setCalcOrder] = useState<AngleOrder>("xy");
  // Construction-step "reveal" progress (0 = not yet applied, 1 = fully
  // applied), one per compound-tilt step, in the ORDER the steps are actually
  // applied (not necessarily [X, Y] — depends on calcOrder). Defaults to
  // fully revealed so the primitive shows its real final tilt immediately;
  // the per-step Play buttons animate a value back down to 0 and sweep it
  // back to 1, to replay that specific rotation for teaching purposes.
  const [constructionT, setConstructionT] = useState<[number, number]>([1, 1]);
  useEffect(() => { setConstructionT([1, 1]); }, [calcAngleX, calcAngleY, calcOrder]);

  const calcSteps: RotationStep[] = calcOrder === "xy"
    ? [{ axis: "x", angleDeg: calcAngleX }, { axis: "y", angleDeg: calcAngleY }]
    : [{ axis: "y", angleDeg: calcAngleY }, { axis: "x", angleDeg: calcAngleX }];

  function playConstructionStep(idx: 0 | 1): Promise<void> {
    return new Promise((resolve) => {
      setConstructionT((t) => { const next = [...t] as [number, number]; next[idx] = 0; return next; });
      animateEase(700, (e) => {
        setConstructionT((t) => { const next = [...t] as [number, number]; next[idx] = e; return next; });
      }, resolve);
    });
  }

  // The primitive's vertices/normals, pre-rotated by the (possibly
  // mid-animation) compound tilt and translated to originPoint — this is all
  // in TABLE-LOCAL space, exactly like the egg/cam/bell's own pts/norms, so
  // it flows through the exact same tPt/tVec/paint pipeline unchanged.
  const calcGeom: Geometry | null = useMemo(() => {
    if (!shows.calc) return null;
    const base = generatePrimitive(primitiveKind);
    const M = calcSteps.reduce<Mat4>((acc, s, i) => {
      const angle = s.angleDeg * constructionT[i];
      const R = s.axis === "x" ? Rx((angle * Math.PI) / 180) : Ry((angle * Math.PI) / 180);
      return mat4mul(R, acc);
    }, [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    const pts = base.pts.map((p): Vec3 => {
      const w = mat4vec(M, [p[0], p[1], p[2], 0]);
      return [w[0] + originPoint[0], w[1] + originPoint[1], w[2] + originPoint[2]];
    });
    const norms = base.norms.map((n): Vec3 => {
      const w = mat4vec(M, [n[0], n[1], n[2], 0]);
      return norm3([w[0], w[1], w[2]]);
    });
    return { pts, norms, tris: base.tris };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shows.calc, primitiveKind, calcAngleX, calcAngleY, calcOrder, constructionT, originPoint]);

  // Table-local center of the primitive's +Z face — where the target-normal
  // arrow should visually emerge from once a solve step is played.
  const calcFaceCenter: Vec3 | null = useMemo(() => {
    if (!calcGeom) return null;
    const halfH = (primitiveKind === "plate" ? 10 : 46) / 2;
    const M = calcSteps.reduce<Mat4>((acc, s, i) => {
      const angle = s.angleDeg * constructionT[i];
      const R = s.axis === "x" ? Rx((angle * Math.PI) / 180) : Ry((angle * Math.PI) / 180);
      return mat4mul(R, acc);
    }, [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    const w = mat4vec(M, [0, 0, halfH, 0]);
    return [w[0] + originPoint[0], w[1] + originPoint[1], w[2] + originPoint[2]];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcGeom, primitiveKind, calcAngleX, calcAngleY, calcOrder, constructionT, originPoint]);

  // Fixture plate — bolted flat to the table under the workpiece, at a FIXED
  // orientation (it doesn't share the compound-tilt rotation the workpiece
  // itself gets). Exists purely so the viewport has a visibly table-mounted
  // object sitting right next to the part, making it obvious during Play
  // C/Play B that the part is being carried by the table, not moving on its
  // own — see the paintFlatMesh usage in Viewport3D's paint().
  const calcFixtureGeom: Geometry | null = useMemo(() => {
    if (!shows.calc) return null;
    const halfH = (primitiveKind === "plate" ? 10 : 46) / 2;
    const plate = generateBox(90, 90, 10);
    const zCenter = originPoint[2] - halfH - 5;
    const pts = plate.pts.map((p): Vec3 => [p[0] + originPoint[0], p[1] + originPoint[1], p[2] + zCenter]);
    return { pts, norms: plate.norms, tris: plate.tris };
  }, [shows.calc, primitiveKind, originPoint]);

  // Read via a ref (not the `axes` closure) so this stays correct no matter
  // how much time/how many renders pass between sequenced calls — the same
  // "read live state through a ref" technique ProgressContext.jsx uses for
  // markCheckpoint, for the same reason: a stale closure here would silently
  // start the second leg of an animation from the wrong value.
  const axesRef = useRef(axes);
  useEffect(() => { axesRef.current = axes; }, [axes]);

  const animateAxis = useCallback((which: "B" | "C", target: number, dur = 700): Promise<void> => {
    setPlaying(false);
    return new Promise((resolve) => {
      const start = axesRef.current[which];
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
        setAxes((a) => ({ ...a, [which]: start + (target - start) * e }));
        if (t < 1) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
  }, []);

  const [leftW, setLeftW] = useState(256);
  const [rightW, setRightW] = useState(320);

  // Drag-to-resize technique already proven in ts-lab/TsLab.jsx and reused by
  // backend-lab/BackendLab.tsx and Matrix 3D Lab — an invisible full-screen
  // overlay captures mouse movement for the duration of the drag, removed on
  // mouseup.
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

  const geom = useMemo(() => (shape === "egg" ? generateEgg() : shape === "cam" ? generateCam() : generateBell()), [shape]);
  const path = useMemo(() => makeToolpath(shape, leadDeg), [shape, leadDeg]);

  useEffect(() => {
    if (!playing) return;
    playRef.current = setInterval(() => {
      setActiveIdx((i) => {
        const next = i + 1 >= path.length ? 0 : i + 1;
        if (next === 0) { setPlaying(false); }
        const s = path[next] || path[0];
        if (s) setAxes({ B: s.B_deg, C: s.C_deg, X: s.X, Y: s.Y, Z: s.Z });
        return next;
      });
    }, 28);
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [playing, path]);

  const toggle = (k: keyof typeof shows) => setShows((s) => ({ ...s, [k]: !s[k] }));

  const TOGG: { k: keyof typeof shows; label: string; c: string }[] = [
    { k: "toolpath", label: "Toolpath", c: "#eab308" },
    { k: "normals", label: "Normals", c: "#f43f5e" },
    { k: "vectors", label: "Vectors", c: "#38bdf8" },
    { k: "matrices", label: "Matrices", c: "#a855f7" },
    { k: "math", label: "Math", c: "#34d399" },
    { k: "calc", label: "Calculator", c: "#6366f1" },
  ];
  const step = path[activeIdx] || null;
  const curShapeObj = SHAPES.find((s) => s.id === shape) || SHAPES[0];
  const activeRightTabs = (["matrices", "math", "calc"] as RightTab[]).filter((t) => shows[t]);
  const effectiveRightTab: RightTab = activeRightTabs.includes(rightTab) ? rightTab : activeRightTabs[0];

  return (
    <div className="w-full h-full bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl text-slate-800 dark:text-slate-200 font-sans flex flex-col overflow-hidden relative shadow-2xl rounded-2xl border border-slate-200/50 dark:border-white/5">

      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/5 px-6 py-3 flex items-center gap-4 shrink-0 shadow-sm z-10 backdrop-blur-md transition-colors duration-500 flex-wrap">
        {onBack && (
          <button onClick={onBack} className="bg-transparent border-none text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer text-[11px] tracking-widest font-sans font-bold px-0 transition-colors uppercase">
            ← Labs
          </button>
        )}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 hidden md:block" />

        <div className="flex flex-col">
          <div className="text-[16px] font-black tracking-wide text-slate-800 dark:text-slate-100 font-sans">5-Axis Kinematics</div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase font-bold mt-0.5">
            Table/Trunnion · Spindle vertical · B &amp; C on table
          </div>
        </div>

        <div className="flex-1 min-w-[20px]" />

        <div className="flex gap-2 flex-wrap items-center bg-slate-100/50 dark:bg-black/20 p-1.5 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-inner">
          {SHAPES.map((s) => (
            <button key={s.id} onClick={() => { setShape(s.id); setActiveIdx(0); setPlaying(false); setShows((v) => ({ ...v, calc: false })); }}
              className={`px-3 py-1.5 rounded-lg cursor-pointer text-[10px] font-bold transition-all border flex items-center gap-2 ${shape === s.id ? "shadow-sm" : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
              style={shape === s.id ? { background: s.color, color: "#fff", borderColor: s.color } : { background: "transparent", borderColor: "transparent", color: "currentColor" }}>
              <span>{s.label}</span>
              <span className={`text-[9px] ${shape === s.id ? "opacity-90" : "opacity-50"}`}>{s.desc}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 hidden lg:block" />

        <div className="flex gap-1.5 flex-wrap items-center">
          {TOGG.map(({ k, label, c }) => (
            <button key={k} onClick={() => toggle(k)}
              className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all border shadow-sm"
              style={shows[k] ? { background: c + "1e", borderColor: c, color: c } : { background: "transparent", borderColor: "rgba(100,116,139,0.3)", color: "currentColor", opacity: 0.6 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-100/30 dark:bg-transparent">

        {/* Left Control Panel */}
        <div style={{ width: leftW }} className="shrink-0 border-r border-slate-200 dark:border-slate-800/60 flex flex-col overflow-hidden bg-white/60 dark:bg-slate-950/40 z-10 backdrop-blur-md">

          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400/50"></span> Machine Axes
              </span>
              <button onClick={() => { setAxes({ X: 0, Y: 0, Z: 0, B: 0, C: 0 }); setPlaying(false); }}
                className="normal-case font-bold text-[9px] px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer tracking-wide"
                title="Set X, Y, Z, B, C all to 0">
                Zero all
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {([
                { k: "X" as const, min: -100, max: 100, c: "#ef4444", u: "mm" },
                { k: "Y" as const, min: -100, max: 100, c: "#22c55e", u: "mm" },
                { k: "Z" as const, min: -80, max: 80, c: "#3b82f6", u: "mm" },
                { k: "B" as const, min: -110, max: 110, c: "#f59e0b", u: "°" },
                { k: "C" as const, min: -180, max: 180, c: "#a855f7", u: "°" },
              ]).map(({ k, min, max, c, u }) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold text-[11px] font-mono" style={{ color: c }}>{k}</span>
                  <input type="range" min={min} max={max} step={0.5} value={axes[k]}
                    onChange={(e) => { setAxes((a) => ({ ...a, [k]: parseFloat(e.target.value) })); setPlaying(false); }}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: c }} />
                  <input type="number" step={0.1} value={axes[k]}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);
                      const v = Number.isFinite(raw) ? Math.min(max, Math.max(min, raw)) : 0;
                      setAxes((a) => ({ ...a, [k]: v })); setPlaying(false);
                    }}
                    className="w-14 text-right font-mono text-[9.5px] text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-900 px-1.5 py-1 rounded shadow-inner border border-transparent focus:border-slate-400 dark:focus:border-slate-600 outline-none" />
                  <span className="w-4 text-[9px] text-slate-400 font-medium">{u}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400/50"></span> Lead Angle
            </div>
            <div className="flex items-center gap-2 mb-3">
              <input type="range" min={0} max={15} step={0.5} value={leadDeg}
                onChange={(e) => setLeadDeg(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" style={{ accentColor: "#f43f5e" }} />
              <input type="number" step={0.1} min={0} max={15} value={leadDeg}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  const v = Number.isFinite(raw) ? Math.min(15, Math.max(0, raw)) : 0;
                  setLeadDeg(v);
                }}
                className="w-14 text-right font-mono text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-1.5 py-1 rounded shadow-inner border border-transparent focus:border-rose-400 dark:focus:border-rose-500/50 outline-none" />
              <span className="w-4 text-[9px] text-rose-400 font-medium">°</span>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Offsets B past perfect IK. <span className="text-rose-500 font-bold">Red dot</span> = contact on bull nose.
            </div>
          </div>

          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400/50"></span> Toolpath
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setPlaying((v) => !v)}
                className={`flex-1 py-1.5 rounded-lg cursor-pointer font-bold text-[10px] uppercase tracking-wider transition-all border shadow-sm flex justify-center items-center gap-1.5 ${
                  playing ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                }`}>
                {playing ? "⏸ Pause" : "▶ Play"}
              </button>
              <button onClick={() => { setActiveIdx(0); setPlaying(false); setAxes({ X: 0, Y: 0, Z: 0, B: 0, C: 0 }); }}
                className="px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors" title="Reset">
                ↺
              </button>
            </div>
            <div className="relative pt-1">
              <input type="range" min={0} max={Math.max(0, path.length - 1)} value={activeIdx}
                onChange={(e) => {
                  const idx = parseInt(e.target.value); setActiveIdx(idx); setPlaying(false);
                  if (path[idx]) { const s = path[idx]; setAxes({ B: s.B_deg, C: s.C_deg, X: s.X, Y: s.Y, Z: s.Z }); }
                }}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" style={{ accentColor: curShapeObj.color }} />
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 text-center mt-3 font-mono font-medium tracking-wide">
              <span style={{ color: curShapeObj.color }}>{activeIdx + 1}</span> / {path.length} PTS
            </div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400/50"></span> IK Solution
            </div>
            {step && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {([
                  ["B", step.B_deg, "°", "#f59e0b"], ["C", step.C_deg, "°", "#a855f7"],
                  ["X", step.X, "mm", "#ef4444"], ["Y", step.Y, "mm", "#22c55e"], ["Z", step.Z, "mm", "#3b82f6"],
                ] as [string, number, string, string][]).map(([k, v, u, c]) => (
                  <div key={k} className="bg-slate-100/80 dark:bg-black/20 rounded-lg p-2 border border-slate-200/50 dark:border-white/5 shadow-inner">
                    <div className="text-[8px] text-slate-400 uppercase font-black">{k}</div>
                    <div className="font-mono text-[11px] font-bold" style={{ color: c }}>{v.toFixed(1)}<span className="opacity-50 ml-0.5">{u}</span></div>
                  </div>
                ))}
              </div>
            )}
            {step?.nPart && (
              <div className="text-[9.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-mono bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-3 mb-4 shadow-inner">
                <span className="text-indigo-500 dark:text-indigo-400 font-bold block mb-1">n_part</span>
                [{step.nPart.map((v) => (v >= 0 ? " " + v.toFixed(3) : v.toFixed(3))).join(", ")}]
              </div>
            )}
            <div className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Tool axis [0,0,−1] always.<br />
              Table rotates — spindle translates only.
            </div>
          </div>
        </div>

        {/* Divider: control panel / viewport */}
        <div
          onMouseDown={startResize(setLeftW, () => leftW, 200, 520, 1)}
          className="w-1 shrink-0 cursor-col-resize bg-slate-200 dark:bg-slate-800/60 opacity-50 hover:opacity-100 transition-opacity"
        />

        {/* Viewport 3D */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#03060a] min-w-0 relative shadow-inner">
          <div className="flex-1 overflow-hidden relative">
            <Viewport3D geom={geom} path={path} axes={axes} shows={shows}
              activeIdx={activeIdx} leadDeg={leadDeg} shape={shape} alignNormal={alignNormal}
              originPoint={originPoint} calcGeom={calcGeom} calcFaceCenter={calcFaceCenter} calcFixtureGeom={calcFixtureGeom} />
          </div>
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/60 text-[9px] text-slate-500 dark:text-slate-400 shrink-0 flex gap-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md uppercase tracking-wider font-bold shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <span className="flex items-center gap-1.5"><span className="text-[12px]">🖱️</span> Drag to rotate · Scroll to zoom</span>
            <span className="flex items-center gap-1.5 ml-auto"><span className="inline-block w-4 h-0 border-t border-dashed border-slate-400"></span> Part Frame</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0 border-t border-solid border-slate-400"></span> Machine Frame</span>
          </div>
        </div>

        {/* Right Info Panel */}
        {activeRightTabs.length > 0 && (
          <>
            {/* Divider: viewport / info panel */}
            <div
              onMouseDown={startResize(setRightW, () => rightW, 240, 560, -1)}
              className="w-1 shrink-0 cursor-col-resize bg-slate-200 dark:bg-slate-800/60 opacity-50 hover:opacity-100 transition-opacity"
            />
          <div style={{ width: rightW }} className="shrink-0 border-l border-slate-200 dark:border-slate-800/60 flex flex-col overflow-hidden bg-white/60 dark:bg-slate-950/40 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] backdrop-blur-md">
            {activeRightTabs.length > 1 && (
              <div className="flex border-b border-slate-200 dark:border-slate-800/60 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                {activeRightTabs.map((t) => (
                  <button key={t} onClick={() => setRightTab(t)}
                    className={`flex-1 py-3 bg-transparent border-none cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${
                      effectiveRightTab === t
                        ? "text-slate-800 dark:text-white border-b-2 shadow-[inset_0_-2px_0_0_currentColor]"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-b-2 border-transparent"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
                {effectiveRightTab === "matrices" && <MatrixPanel axes={axes} />}
                {effectiveRightTab === "math" && <MathPanel shape={shape} />}
                {effectiveRightTab === "calc" && (
                  <CalculatorPanel
                    originPoint={originPoint}
                    onOriginChange={setOriginPoint}
                    primitiveKind={primitiveKind}
                    onPrimitiveChange={setPrimitiveKind}
                    angleX={calcAngleX}
                    onAngleXChange={setCalcAngleX}
                    angleY={calcAngleY}
                    onAngleYChange={setCalcAngleY}
                    order={calcOrder}
                    onOrderChange={setCalcOrder}
                    onPlayConstructionStep={playConstructionStep}
                    onAlignVector={setAlignNormal}
                    animateAxis={animateAxis}
                  />
                )}
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
