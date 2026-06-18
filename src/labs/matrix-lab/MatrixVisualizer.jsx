import { useRef, useEffect, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  MATRIX VISUALIZER  —  three self-contained panels
//
//  DROP-IN:  import { MatrixVisualizer } from "./MatrixVisualizer";
//  USAGE:    <MatrixVisualizer matrix={M} color={lesson.color} />
//
//  Panels:
//    1. GEOMETRIC  — 2D grid deformation showing what the matrix does to space
//    2. HEATMAP    — color-coded magnitude of every cell, highlights structure
//    3. 3D BARS    — isometric bar chart of |M[i][j]|, rotatable with drag
// ─────────────────────────────────────────────────────────────────────────────

const fmtN = (v) => {
  if (Math.abs(v) < 1e-10) return "0";
  const r = Math.round(v * 10000) / 10000;
  return r % 1 === 0 ? String(r) : r.toFixed(2);
};

// ─── Colour helpers ───────────────────────────────────────────────────────────
const lerpColor = (a, b, t) => {
  const h = (s) => parseInt(s, 16);
  const r = Math.round(h(a.slice(1,3)) + (h(b.slice(1,3)) - h(a.slice(1,3))) * t);
  const g = Math.round(h(a.slice(3,5)) + (h(b.slice(3,5)) - h(a.slice(3,5))) * t);
  const bl = Math.round(h(a.slice(5,7)) + (h(b.slice(5,7)) - h(a.slice(5,7))) * t);
  return `rgb(${r},${g},${bl})`;
};

const valToColor = (v, max) => {
  const t = Math.min(Math.abs(v) / (max || 1), 1);
  const neg = v < 0;
  if (neg) return lerpColor("#1a1a2e", "#e05050", t);
  return lerpColor("#1a1a2e", "#4dcd6e", t);
};

// ─── 1. GEOMETRIC PANEL ───────────────────────────────────────────────────────
// Shows the unit grid BEFORE and AFTER applying the matrix as a linear map.
// Uses the matrix's top-left 2×2 block for the 2D transformation.
const GeometricPanel = ({ matrix, color, animated }) => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tRef      = useRef(animated ? 0 : 1);

  const draw = useCallback((t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const sc = Math.min(W, H) / 10;          // world units → pixels
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, W, H);

    // Extract 2×2 transform from top-left of matrix
    const a = matrix[0]?.[0] ?? 1, b = matrix[0]?.[1] ?? 0;
    const c = matrix[1]?.[0] ?? 0, d = matrix[1]?.[1] ?? 1;

    // Lerp transform  I → M  by parameter t
    const ta = 1 + (a - 1) * t, tb = b * t;
    const tc = c * t,            td = 1 + (d - 1) * t;

    const wx = (x, y) => cx + (ta*x + tb*y) * sc;
    const wy = (x, y) => cy - (tc*x + td*y) * sc;

    // Grid lines (original lattice, transformed)
    const GRID = 5;
    ctx.lineWidth = 0.5;
    for (let i = -GRID; i <= GRID; i++) {
      // horizontal-ish lines  (y = i, x varies)
      const alpha = Math.max(0.06, 0.18 - Math.abs(i) * 0.02);
      ctx.strokeStyle = `rgba(100,120,160,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(wx(-GRID, i), wy(-GRID, i));
      ctx.lineTo(wx( GRID, i), wy( GRID, i));
      ctx.stroke();
      // vertical-ish lines  (x = i, y varies)
      ctx.beginPath();
      ctx.moveTo(wx(i, -GRID), wy(i, -GRID));
      ctx.lineTo(wx(i,  GRID), wy(i,  GRID));
      ctx.stroke();
    }

    // Transformed basis vectors
    const drawArrow = (ex, ey, col, label) => {
      const sx = cx, sy = cy;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      // arrowhead
      const ang = Math.atan2(ey - sy, ex - sx);
      const hs = 8;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - hs * Math.cos(ang - 0.4), ey - hs * Math.sin(ang - 0.4));
      ctx.lineTo(ex - hs * Math.cos(ang + 0.4), ey - hs * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fill();
      ctx.font = "bold 11px 'SF Mono',monospace";
      ctx.fillText(label, ex + 6, ey - 4);
    };

    drawArrow(wx(1, 0), wy(1, 0), "#4dcd6e",   "e\u2081");
    drawArrow(wx(0, 1), wy(0, 1), "#60a5fa",   "e\u2082");

    // Unit square → parallelogram
    ctx.strokeStyle = color + "aa"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(wx(0,0), wy(0,0));
    ctx.lineTo(wx(1,0), wy(1,0));
    ctx.lineTo(wx(1,1), wy(1,1));
    ctx.lineTo(wx(0,1), wy(0,1));
    ctx.closePath(); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color + "18";
    ctx.fill();

    // Origin dot
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2);
    ctx.fillStyle = "#888"; ctx.fill();

    // Legend
    ctx.font = "10px 'SF Mono',monospace";
    ctx.fillStyle = "#666";
    ctx.fillText(`M = [[${fmtN(a)}, ${fmtN(b)}], [${fmtN(c)}, ${fmtN(d)}]]`, 8, H - 10);
  }, [matrix, color]);

  useEffect(() => {
    if (!animated) { draw(1); return; }
    tRef.current = 0;
    const step = () => {
      tRef.current = Math.min(1, tRef.current + 0.018);
      draw(tRef.current);
      if (tRef.current < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [matrix, animated, draw]);

  const replay = () => {
    cancelAnimationFrame(animRef.current);
    tRef.current = 0;
    const step = () => {
      tRef.current = Math.min(1, tRef.current + 0.018);
      draw(tRef.current);
      if (tRef.current < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} width={320} height={240}
        style={{ width: "100%", borderRadius: 8, border: "1px solid #2d2d2d", display: "block" }} />
      <button onClick={replay} style={{
        position: "absolute", top: 8, right: 8,
        background: "#252525", border: "1px solid #333", borderRadius: 4,
        color: "#888", fontSize: 10, padding: "3px 8px", cursor: "pointer",
        fontFamily: "inherit",
      }}>Replay</button>
      <div style={{ marginTop: 8, fontSize: 10, color: "#555", lineHeight: 1.6 }}>
        <span style={{ color: "#4dcd6e" }}>e₁</span> = column 1 &nbsp;
        <span style={{ color: "#60a5fa" }}>e₂</span> = column 2 &nbsp;&nbsp;
        Grid shows where every point in space moves.
      </div>
    </div>
  );
};

// ─── 2. HEATMAP PANEL ────────────────────────────────────────────────────────
const HeatmapPanel = ({ matrix, color }) => {
  const allVals = matrix.flat();
  const maxAbs  = Math.max(...allVals.map(Math.abs), 1e-10);

  return (
    <div>
      <div style={{ display: "inline-grid", gridTemplateColumns: `repeat(${matrix[0].length}, 1fr)`, gap: 2, borderRadius: 6, overflow: "hidden", border: "1px solid #2d2d2d" }}>
        {matrix.map((row, r) =>
          row.map((v, c) => {
            const bg = valToColor(v, maxAbs);
            const intensity = Math.abs(v) / maxAbs;
            return (
              <div key={`${r}-${c}`} style={{
                width: 56, height: 52,
                background: bg,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                transition: "background .4s",
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'SF Mono',Menlo,monospace",
                  color: intensity > 0.45 ? "#fff" : "#666",
                }}>
                  {fmtN(v)}
                </span>
                <span style={{ fontSize: 8, color: intensity > 0.45 ? "rgba(255,255,255,0.5)" : "#444", marginTop: 1 }}>
                  [{r},{c}]
                </span>
              </div>
            );
          })
        )}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 12, fontSize: 10, color: "#555" }}>
        <span><span style={{ color: "#e05050" }}>■</span> negative</span>
        <span><span style={{ color: "#1a1a2e" }}>■</span> zero</span>
        <span><span style={{ color: "#4dcd6e" }}>■</span> positive</span>
        <span style={{ marginLeft: "auto" }}>max |v| = {fmtN(maxAbs)}</span>
      </div>
    </div>
  );
};

// ─── 3. ISOMETRIC 3D BAR CHART ────────────────────────────────────────────────
// Proper isometric projection — no WebGL needed.
// Drag to rotate (changes azimuth only, elevation fixed at 30°).
const IsometricPanel = ({ matrix, color }) => {
  const canvasRef = useRef(null);
  const dragRef   = useRef({ active: false, lastX: 0, az: -30 });
  const azRef     = useRef(-30);

  const draw = useCallback((az) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);

    const rows = matrix.length, cols = matrix[0].length;
    const allVals = matrix.flat();
    const maxAbs  = Math.max(...allVals.map(Math.abs), 1e-10);

    // Isometric constants
    const EL = 26 * Math.PI / 180;           // elevation angle
    const RAD = az * Math.PI / 180;
    const cosA = Math.cos(RAD), sinA = Math.sin(RAD);
    const cosE = Math.cos(EL),  sinE = Math.sin(EL);
    const sc = Math.min(W / (cols + 2), H / (rows + 2)) * 1.1;
    const HMAX = sc * 3;                      // max bar height in pixels
    const cx = W / 2, cy = H * 0.62;

    // iso project: (worldX, worldZ, worldY) → canvas (x, y)
    // worldX = col axis, worldZ = row axis, worldY = value (up)
    const iso = (wx, wy, wz) => {
      // rotate around Y axis by az
      const rx = wx * cosA - wz * sinA;
      const rz = wx * sinA + wz * cosA;
      // project
      const px = rx * sc;
      const py = -wy * cosE * sc - rz * sinE * sc;
      return { x: cx + px, y: cy + py };
    };

    // Sort bars back-to-front for correct painter's algorithm
    const bars = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bars.push({ r, c, v: matrix[r][c] });
      }
    }
    // Depth = distance from viewer
    bars.sort((a, b) => {
      const da = a.c * cosA + a.r * sinA;
      const db = b.c * cosA + b.r * sinA;
      return db - da;
    });

    const drawBar = (r, c, v) => {
      const bw = 0.82;                        // bar footprint width
      const h  = (Math.abs(v) / maxAbs) * HMAX / sc;
      const x0 = c - (cols - 1) / 2;
      const z0 = r - (rows - 1) / 2;
      // 4 corners of base, 4 corners of top
      const bl = iso(x0,       0, z0);
      const br = iso(x0 + bw,  0, z0);
      const fr = iso(x0 + bw,  0, z0 + bw);
      const fl = iso(x0,       0, z0 + bw);
      const tl = iso(x0,       h, z0);
      const tr = iso(x0 + bw,  h, z0);
      const tfr= iso(x0 + bw,  h, z0 + bw);
      const tfl= iso(x0,       h, z0 + bw);

      const intensity = Math.abs(v) / maxAbs;
      const baseCol = v >= 0 ? "#4dcd6e" : "#e05050";
      const dark  = lerpColor("#0d1117", baseCol, intensity * 0.7);
      const mid   = lerpColor("#0d1117", baseCol, intensity * 0.9);
      const light = lerpColor("#0d1117", baseCol, intensity);

      if (intensity < 0.01) {
        // near-zero: just draw a thin floor square
        ctx.strokeStyle = "#333"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(bl.x,bl.y); ctx.lineTo(br.x,br.y);
        ctx.lineTo(fr.x,fr.y); ctx.lineTo(fl.x,fl.y); ctx.closePath(); ctx.stroke();
        return;
      }

      const face = (pts, col) => {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = col; ctx.fill();
        ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 0.6; ctx.stroke();
      };

      // Left face
      face([fl, tfl, tl, bl], dark);
      // Right face
      face([fr, tfr, tr, br], mid);
      // Top face
      face([tfl, tfr, tr, tl], light);

      // Value label on top
      const topC = iso(x0 + bw/2, h + 0.15, z0 + bw/2);
      ctx.fillStyle = "#e8e8e8"; ctx.font = `bold ${Math.max(8, sc*0.22)}px 'SF Mono',monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText(fmtN(v), topC.x, topC.y);

      // Row/col label on base
      if (h > 0.3) {
        const baseC = iso(x0 + bw/2, -0.2, z0 + bw/2);
        ctx.fillStyle = "#444"; ctx.font = `${Math.max(7, sc*0.18)}px 'SF Mono',monospace`;
        ctx.fillText(`[${r},${c}]`, baseC.x, baseC.y);
      }
    };

    bars.forEach(({ r, c, v }) => drawBar(r, c, v));
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";

    // Axis labels
    const axO = iso(-(cols)/2 - 0.2, 0, -(rows)/2 - 0.2);
    const axC = iso( (cols)/2 + 0.6, 0, -(rows)/2 - 0.2);
    const axR = iso(-(cols)/2 - 0.2, 0,  (rows)/2 + 0.6);
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(axO.x, axO.y); ctx.lineTo(axC.x, axC.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(axO.x, axO.y); ctx.lineTo(axR.x, axR.y); ctx.stroke();
    ctx.fillStyle = "#555"; ctx.font = "10px 'SF Mono',monospace";
    ctx.fillText("col →", axC.x + 3, axC.y + 3);
    ctx.fillText("row →", axR.x + 3, axR.y + 3);
  }, [matrix, color]);

  useEffect(() => { draw(azRef.current); }, [draw]);

  // Drag to rotate
  const onMouseDown = (e) => {
    dragRef.current.active = true;
    dragRef.current.lastX  = e.clientX;
  };
  const onMouseMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    dragRef.current.lastX = e.clientX;
    azRef.current = (azRef.current + dx * 0.6) % 360;
    draw(azRef.current);
  };
  const onMouseUp = () => { dragRef.current.active = false; };

  // Touch support
  const onTouchStart = (e) => { dragRef.current.active = true; dragRef.current.lastX = e.touches[0].clientX; };
  const onTouchMove  = (e) => { if (!dragRef.current.active) return; const dx = e.touches[0].clientX - dragRef.current.lastX; dragRef.current.lastX = e.touches[0].clientX; azRef.current = (azRef.current + dx * 0.6) % 360; draw(azRef.current); };
  const onTouchEnd   = () => { dragRef.current.active = false; };

  return (
    <div>
      <canvas ref={canvasRef} width={320} height={260}
        style={{ width: "100%", borderRadius: 8, border: "1px solid #2d2d2d", display: "block", cursor: "ew-resize" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      />
      <div style={{ marginTop: 6, fontSize: 10, color: "#555" }}>
        Drag to rotate &nbsp;·&nbsp;
        <span style={{ color: "#4dcd6e" }}>■</span> positive &nbsp;
        <span style={{ color: "#e05050" }}>■</span> negative &nbsp;
        Height = |value|
      </div>
    </div>
  );
};

// ─── 4. DETERMINANT GEOMETRY ─────────────────────────────────────────────────
// Shows the parallelogram formed by the two column vectors.
// Area = |det|. Sign shown by orientation (CW vs CCW).
const DetGeomPanel = ({ matrix, color }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);

    const a = matrix[0]?.[0] ?? 1, b = matrix[0]?.[1] ?? 0;
    const c = matrix[1]?.[0] ?? 0, d = matrix[1]?.[1] ?? 1;
    const det = a * d - b * c;

    const maxV = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d), 1);
    const sc = Math.min(W, H) / (maxV * 2.8);

    // Grid
    ctx.strokeStyle = "#1a1e2a"; ctx.lineWidth = 0.5;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i*sc, 0); ctx.lineTo(cx + i*sc, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy + i*sc); ctx.lineTo(W, cy + i*sc); ctx.stroke();
    }
    // Axes
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    // Parallelogram  (0,0) → col1 → col1+col2 → col2
    const p0 = { x: cx,               y: cy };
    const p1 = { x: cx + a*sc,        y: cy - c*sc };     // col 1
    const p2 = { x: cx + (a+b)*sc,    y: cy - (c+d)*sc }; // col1 + col2
    const p3 = { x: cx + b*sc,        y: cy - d*sc };      // col 2

    const fillCol = det >= 0 ? "#4dcd6e" : "#e05050";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = fillCol + "28"; ctx.fill();
    ctx.strokeStyle = fillCol + "aa"; ctx.lineWidth = 1.5; ctx.stroke();

    // Column vectors
    const arrow = (ex, ey, col, lbl) => {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
      const ang = Math.atan2(ey - cy, ex - cx), hs = 7;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - hs*Math.cos(ang-0.4), ey - hs*Math.sin(ang-0.4));
      ctx.lineTo(ex - hs*Math.cos(ang+0.4), ey - hs*Math.sin(ang+0.4));
      ctx.closePath(); ctx.fill();
      ctx.font = "bold 11px 'SF Mono',monospace";
      ctx.fillText(lbl, ex + 5, ey - 4);
    };
    arrow(p1.x, p1.y, "#60a5fa", `c\u2081=[${fmtN(a)},${fmtN(c)}]`);
    arrow(p3.x, p3.y, "#f59e0b", `c\u2082=[${fmtN(b)},${fmtN(d)}]`);

    // Det label in center of parallelogram
    const mx = (p0.x + p1.x + p2.x + p3.x) / 4;
    const my = (p0.y + p1.y + p2.y + p3.y) / 4;
    ctx.fillStyle = fillCol;
    ctx.font = "bold 12px 'SF Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`det = ${fmtN(det)}`, mx, my);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";

    // Orientation indicator
    ctx.fillStyle = "#555"; ctx.font = "10px 'SF Mono',monospace";
    ctx.fillText(det > 0 ? "CCW — positive det" : det < 0 ? "CW — negative det" : "Degenerate — det = 0", 8, H - 8);

  }, [matrix, color]);

  return (
    <div>
      <canvas ref={canvasRef} width={320} height={230}
        style={{ width: "100%", borderRadius: 8, border: "1px solid #2d2d2d", display: "block" }} />
      <div style={{ marginTop: 6, fontSize: 10, color: "#555", lineHeight: 1.6 }}>
        Area of the parallelogram = |det(A)|.&nbsp;
        <span style={{ color: "#4dcd6e" }}>CCW = positive</span>,&nbsp;
        <span style={{ color: "#e05050" }}>CW = negative</span>.
      </div>
    </div>
  );
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
// Usage: <MatrixVisualizer matrix={M} color="#4A90D9" lessonId={lessonIdx} />
export const MatrixVisualizer = ({ matrix, color = "#4A90D9", lessonId = -1 }) => {
  const [view, setView] = useState("geo");
  const [animated, setAnimated] = useState(true);

  if (!matrix || !matrix[0]) return null;

  const isSquare = matrix.length === matrix[0].length;
  const is2D     = matrix.length >= 2 && matrix[0].length >= 2;

  const views = [
    { id: "geo",     label: "Transform",  available: is2D },
    { id: "heat",    label: "Heatmap",    available: true },
    { id: "iso",     label: "3D Bars",    available: true },
    { id: "det",     label: "det Geom",   available: isSquare && is2D },
  ].filter(v => v.available);

  return (
    <div style={{
      background: "#161b22",
      border: "1px solid #2d2d2d",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "10px 14px",
        borderBottom: "1px solid #2d2d2d",
        background: "#1a1a1a",
        gap: 6,
      }}>
        <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 4 }}>
          Visualize
        </span>
        {views.map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            height: 22, padding: "0 10px", borderRadius: 4,
            background: view === v.id ? color + "22" : "transparent",
            border: `1px solid ${view === v.id ? color + "66" : "#333"}`,
            color: view === v.id ? color : "#555",
            fontSize: 10, cursor: "pointer", fontFamily: "inherit",
            transition: "all .12s",
          }}>{v.label}</button>
        ))}
        {view === "geo" && (
          <button onClick={() => setAnimated(a => !a)} style={{
            marginLeft: "auto", height: 22, padding: "0 8px", borderRadius: 4,
            background: "transparent", border: "1px solid #333",
            color: "#555", fontSize: 10, cursor: "pointer", fontFamily: "inherit",
          }}>{animated ? "Static" : "Animate"}</button>
        )}
      </div>

      {/* Panel */}
      <div style={{ padding: "14px" }}>
        {view === "geo"  && <GeometricPanel  matrix={matrix} color={color} animated={animated} />}
        {view === "heat" && <HeatmapPanel    matrix={matrix} color={color} />}
        {view === "iso"  && <IsometricPanel  matrix={matrix} color={color} />}
        {view === "det"  && <DetGeomPanel    matrix={matrix} color={color} />}
      </div>

      {/* Context caption */}
      <div style={{
        padding: "8px 14px",
        borderTop: "1px solid #1e1e1e",
        fontSize: 10, color: "#444",
        background: "#111",
      }}>
        {view === "geo"  && "Columns of M = where the basis vectors e₁, e₂ land. Every point in space is mapped linearly."}
        {view === "heat" && "Color intensity = magnitude. Green = positive, red = negative. Zeros are dark."}
        {view === "iso"  && "Bar height = |value|. Drag to rotate. Structure (upper triangular, diagonal, etc.) is immediately visible."}
        {view === "det"  && "The determinant equals the signed area of the parallelogram formed by the column vectors."}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  EIGENVALUE EXPLORER  (bonus component)
//  Shows eigenvectors as arrows: Mv = λv  means M just scales the arrow.
//  Works for real 2×2 matrices only (complex eigenvalues skipped).
// ─────────────────────────────────────────────────────────────────────────────
export const EigenExplorer = ({ matrix, color = "#B57BEB" }) => {
  const canvasRef = useRef(null);
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!matrix || matrix.length !== 2 || matrix[0].length !== 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = "#0d1117"; ctx.fillRect(0,0,W,H);

    const a = matrix[0][0], b = matrix[0][1], c = matrix[1][0], d = matrix[1][1];
    // Eigenvalues of 2x2: λ = (tr ± sqrt(tr² - 4det)) / 2
    const tr  = a + d;
    const det = a*d - b*c;
    const disc = tr*tr - 4*det;

    // Grid
    const sc = 52;
    ctx.strokeStyle = "#1a1e2a"; ctx.lineWidth = 0.5;
    for (let i=-4;i<=4;i++){
      ctx.beginPath();ctx.moveTo(cx+i*sc,0);ctx.lineTo(cx+i*sc,H);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,cy+i*sc);ctx.lineTo(W,cy+i*sc);ctx.stroke();
    }
    ctx.strokeStyle="#333";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke();

    const arrow = (ox,oy,ex,ey,col,lbl) => {
      ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ex,ey);ctx.stroke();
      const ang=Math.atan2(ey-oy,ex-ox),hs=8;
      ctx.beginPath();
      ctx.moveTo(ex,ey);
      ctx.lineTo(ex-hs*Math.cos(ang-0.4),ey-hs*Math.sin(ang-0.4));
      ctx.lineTo(ex-hs*Math.cos(ang+0.4),ey-hs*Math.sin(ang+0.4));
      ctx.closePath();ctx.fill();
      ctx.font="bold 11px 'SF Mono',monospace";
      ctx.fillText(lbl,ex+5,ey-4);
    };

    if (disc < 0) {
      ctx.fillStyle = "#666"; ctx.font = "12px 'SF Mono',monospace";
      ctx.textAlign = "center";
      ctx.fillText("Complex eigenvalues", cx, cy);
      ctx.fillText("(rotation matrix)", cx, cy + 18);
      ctx.textAlign = "left";
      setInfo(`tr=${fmtN(tr)}, det=${fmtN(det)}, disc<0 → complex eigenvalues (rotation/spiral)`);
      return;
    }

    const sqD  = Math.sqrt(disc);
    const lam1 = (tr + sqD) / 2;
    const lam2 = (tr - sqD) / 2;

    // Eigenvectors: (M - λI)v = 0
    const eigVec = (lam) => {
      // row 1: (a-λ)x + b*y = 0  → y/x = -(a-λ)/b  if b≠0
      if (Math.abs(b) > 1e-10) {
        const len = Math.sqrt(1 + ((a-lam)/b)**2);
        return [1/len, -(a-lam)/b/len];
      } else if (Math.abs(c) > 1e-10) {
        const len = Math.sqrt(((d-lam)/c)**2 + 1);
        return [-(d-lam)/c/len, 1/len];
      }
      return [1, 0];
    };

    const v1 = eigVec(lam1);
    const v2 = eigVec(lam2);
    const EL = sc * 2.2;

    // Draw eigenvectors and their images under M
    arrow(cx,cy, cx+v1[0]*EL, cy-v1[1]*EL, "#60a5fa", `v\u2081`);
    // M*v1 = λ1*v1
    const Mv1 = [a*v1[0]+b*v1[1], c*v1[0]+d*v1[1]];
    arrow(cx,cy, cx+Mv1[0]*sc, cy-Mv1[1]*sc, "#60a5fa88", `\u03bb\u2081v\u2081`);

    if (Math.abs(lam1 - lam2) > 1e-8) {
      arrow(cx,cy, cx+v2[0]*EL, cy-v2[1]*EL, "#f59e0b", `v\u2082`);
      const Mv2 = [a*v2[0]+b*v2[1], c*v2[0]+d*v2[1]];
      arrow(cx,cy, cx+Mv2[0]*sc, cy-Mv2[1]*sc, "#f59e0b88", `\u03bb\u2082v\u2082`);
    }

    ctx.textAlign="left";
    setInfo(`λ₁ = ${fmtN(lam1)},  λ₂ = ${fmtN(lam2)}   |   tr = ${fmtN(tr)},  det = ${fmtN(det)}`);
  }, [matrix]);

  if (!matrix || matrix.length !== 2 || matrix[0].length !== 2) {
    return (
      <div style={{ padding: 14, fontSize: 11, color: "#555", textAlign: "center" }}>
        Eigenvalue explorer requires a 2×2 matrix.
      </div>
    );
  }

  return (
    <div style={{ background: "#161b22", border: "1px solid #2d2d2d", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #2d2d2d", background: "#1a1a1a" }}>
        <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Eigenvalue Explorer &nbsp;·&nbsp;
        </span>
        <span style={{ fontSize: 10, color: "#888" }}>Mv = λv — eigenvectors only change scale, not direction</span>
      </div>
      <div style={{ padding: 14 }}>
        <canvas ref={canvasRef} width={320} height={230}
          style={{ width: "100%", borderRadius: 8, border: "1px solid #2d2d2d", display: "block" }} />
        <div style={{ marginTop: 8, fontSize: 10, color: "#888", fontFamily: "'SF Mono',Menlo,monospace" }}>
          {info}
        </div>
        <div style={{ marginTop: 6, fontSize: 10, color: "#555", lineHeight: 1.6 }}>
          Solid arrow = eigenvector v. Faded arrow = Mv = λv (same direction, scaled by λ).
          If λ &gt; 1 the arrow grows. If 0 &lt; λ &lt; 1 it shrinks. If λ &lt; 0 it flips.
        </div>
      </div>
    </div>
  );
};

export default MatrixVisualizer;
