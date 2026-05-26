import { useCallback, useEffect, useRef, useState } from 'react';

function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return {
    surface:  dark ? '#1e293b' : '#ffffff',
    surface2: dark ? '#0f172a' : '#f1f5f9',
    border:   dark ? '#334155' : '#e2e8f0',
    border2:  dark ? '#334155' : '#e2e8f0',
    border3:  dark ? '#1e293b' : '#f1f5f9',
    text:     dark ? '#e2e8f0' : '#1e293b',
    text2:    dark ? '#94a3b8' : '#64748b',
    text3:    dark ? '#475569' : '#94a3b8',
    green:    dark ? '#4ade80' : '#16a34a',
    purple:   dark ? '#a78bfa' : '#7c3aed',
    red:      dark ? '#f87171' : '#dc2626',
    amber:    dark ? '#fbbf24' : '#d97706',
  };
}

function fr(n, d = 2) { return parseFloat(n.toFixed(d)); }

// ── CNC Canvas ──────────────────────────────────────────────────────────────
function CNCCanvas({ sa, sb, C }) {
  const canvasRef = useRef(null);
  const roRef = useRef(null);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = cv.offsetWidth || 500;
    cv.height = 300;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const cvH = cv.height;
    const cx = W / 2;
    const cy = cvH / 2;
    const sc = 22;

    ctx.clearRect(0, 0, W, cvH);
    ctx.strokeStyle = 'rgba(128,128,128,0.2)';
    ctx.lineWidth = 0.5;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * sc, 0); ctx.lineTo(cx + i * sc, cvH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy + i * sc); ctx.lineTo(W, cy + i * sc); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(128,128,128,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, cvH); ctx.stroke();

    function toScreen(px, py) { return [cx + px * sc, cy - py * sc]; }

    // Line A: 2x + y = sa  → y = sa - 2x
    ctx.lineWidth = 2;
    ctx.strokeStyle = C.green;
    ctx.beginPath();
    ctx.moveTo(...toScreen(-8, sa + 16));
    ctx.lineTo(...toScreen(8, sa - 16));
    ctx.stroke();

    // Line B: x - y = sb  → y = x - sb
    ctx.strokeStyle = C.purple;
    ctx.beginPath();
    ctx.moveTo(...toScreen(-8, sb - 8));
    ctx.lineTo(...toScreen(8, sb + 8));
    ctx.stroke();

    // Intersection: x = (sa - sb)/3, y = (2sb - sa)/3
    const xFin = fr((sa - sb) / 3);
    const yFin = fr((2 * sb - sa) / 3);
    const [spx, spy] = toScreen(xFin, yFin);

    ctx.fillStyle = 'rgba(216,90,48,0.15)';
    ctx.beginPath(); ctx.arc(spx, spy, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.red;
    ctx.beginPath(); ctx.arc(spx, spy, 5, 0, Math.PI * 2); ctx.fill();

    ctx.font = '11px sans-serif';
    ctx.fillStyle = C.red;
    ctx.fillText(`(${xFin.toFixed(1)}, ${yFin.toFixed(1)})`, spx + 8, spy - 8);
    ctx.fillStyle = C.green;
    ctx.fillText(`2x+y=${sa}`, 8, 20);
    ctx.fillStyle = C.purple;
    ctx.fillText(`x−y=${sb}`, 8, 36);
  }, [sa, sb, C]);

  useEffect(() => {
    draw();
    roRef.current = new ResizeObserver(draw);
    if (canvasRef.current) roRef.current.observe(canvasRef.current.parentElement);
    return () => roRef.current?.disconnect();
  }, [draw]);

  return <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 500, height: 300, display: 'block', border: `0.5px solid ${C.border}`, borderRadius: 6, background: '#0a0a0a' }} />;
}

// ── Graphics Canvas ──────────────────────────────────────────────────────────
function GraphicsCanvas({ deg, scl, sh, C }) {
  const canvasRef = useRef(null);
  const roRef = useRef(null);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = cv.offsetWidth || 500;
    cv.height = 300;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const cvH = cv.height;
    const cx = W / 2;
    const cy = cvH / 2;
    const gridSc = 40;

    ctx.clearRect(0, 0, W, cvH);
    ctx.strokeStyle = 'rgba(128,128,128,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * gridSc, 0); ctx.lineTo(cx + i * gridSc, cvH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy + i * gridSc); ctx.lineTo(W, cy + i * gridSc); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(128,128,128,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, cvH); ctx.stroke();

    const rad = deg * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const a = scl * cos;
    const b = -scl * sin + sh * scl * cos;
    const c2 = scl * sin;
    const d = scl * cos + sh * scl * sin;

    const shape = [[1, 0], [2, 0], [2, 2], [1.5, 3], [1, 2], [0, 2], [0, 0]];
    function tf(p) { return [cx + (a * p[0] + b * p[1]) * gridSc, cy - (c2 * p[0] + d * p[1]) * gridSc]; }
    function orig(p) { return [cx + p[0] * gridSc, cy - p[1] * gridSc]; }

    ctx.strokeStyle = 'rgba(29,158,117,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(...orig(shape[0]));
    shape.forEach(p => ctx.lineTo(...orig(p)));
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = C.green;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(...tf(shape[0]));
    shape.forEach(p => ctx.lineTo(...tf(p)));
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(29,158,117,0.12)';
    ctx.beginPath();
    ctx.moveTo(...tf(shape[0]));
    shape.forEach(p => ctx.lineTo(...tf(p)));
    ctx.closePath();
    ctx.fill();

    ctx.font = '11px sans-serif';
    ctx.fillStyle = C.text3;
    ctx.fillText('original (dashed)', 8, 16);
    ctx.fillStyle = C.green;
    ctx.fillText('transformed', 8, 30);
  }, [deg, scl, sh, C]);

  useEffect(() => {
    draw();
    roRef.current = new ResizeObserver(draw);
    if (canvasRef.current) roRef.current.observe(canvasRef.current.parentElement);
    return () => roRef.current?.disconnect();
  }, [draw]);

  return <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 500, height: 300, display: 'block', border: `0.5px solid ${C.border}`, borderRadius: 6 }} />;
}

// ── Forces Canvas ──────────────────────────────────────────────────────────
function ForcesCanvas({ a1, a2, load, C }) {
  const canvasRef = useRef(null);
  const roRef = useRef(null);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = cv.offsetWidth || 500;
    cv.height = 300;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const cvH = cv.height;

    ctx.clearRect(0, 0, W, cvH);
    const CX = W / 2;
    const CY = 200;

    ctx.strokeStyle = 'rgba(128,128,128,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(CX, cvH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(W, CY); ctx.stroke();

    ctx.fillStyle = 'rgba(128,128,128,0.15)';
    ctx.beginPath(); ctx.arc(CX, CY, 10, 0, Math.PI * 2); ctx.fill();

    const r1 = (90 + a1) * Math.PI / 180;
    const r2 = (90 + a2) * Math.PI / 180;
    const c1x = Math.cos(r1); const c1y = Math.sin(r1);
    const c2x = Math.cos(r2); const c2y = Math.sin(r2);
    const det = c1x * c2y - c2x * c1y;
    let T1, T2;
    if (Math.abs(det) < 0.001) { T1 = Infinity; T2 = Infinity; }
    else {
      T1 = fr((0 * c2y - c2x * (-load)) / det);
      T2 = fr((c1x * (-load) - 0 * c1y) / det);
    }

    const tsc = isFinite(T1) && Math.max(T1, T2) > 0 ? 150 / Math.max(T1, T2) : 0.05;

    function arrow(ctx, x1, y1, x2, y2, color) {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 10 * Math.cos(angle - 0.4), y2 - 10 * Math.sin(angle - 0.4));
      ctx.lineTo(x2 - 10 * Math.cos(angle + 0.4), y2 - 10 * Math.sin(angle + 0.4));
      ctx.closePath(); ctx.fill();
    }

    ctx.font = '12px sans-serif';
    if (isFinite(T1) && T1 > 0) {
      arrow(ctx, CX, CY, CX + c1x * T1 * tsc, CY - c1y * T1 * tsc, C.green);
      ctx.fillStyle = C.green;
      ctx.fillText(`T₁=${T1.toFixed(0)}N`, CX + c1x * T1 * tsc + 5, CY - c1y * T1 * tsc - 5);
    }
    if (isFinite(T2) && T2 > 0) {
      arrow(ctx, CX, CY, CX + c2x * T2 * tsc, CY - c2y * T2 * tsc, C.purple);
      ctx.fillStyle = C.purple;
      ctx.fillText(`T₂=${T2.toFixed(0)}N`, CX + c2x * T2 * tsc + 5, CY - c2y * T2 * tsc - 5);
    }
    arrow(ctx, CX, CY, CX, CY + load * tsc, C.red);
    ctx.fillStyle = C.red;
    ctx.fillText(`W=${load}N`, CX + 5, CY + load * tsc + 15);
  }, [a1, a2, load, C]);

  useEffect(() => {
    draw();
    roRef.current = new ResizeObserver(draw);
    if (canvasRef.current) roRef.current.observe(canvasRef.current.parentElement);
    return () => roRef.current?.disconnect();
  }, [draw]);

  return <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 460, height: 300, display: 'block', border: `0.5px solid ${C.border}`, borderRadius: 6 }} />;
}

// ── Dot Product Canvas ──────────────────────────────────────────────────────
function DotCanvas({ nAngle, lAngle, C }) {
  const canvasRef = useRef(null);
  const roRef = useRef(null);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = cv.offsetWidth || 500;
    cv.height = 280;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const cvH = cv.height;

    ctx.clearRect(0, 0, W, cvH);
    const na = nAngle * Math.PI / 180;
    const la = lAngle * Math.PI / 180;
    const nx = Math.cos(na); const ny = Math.sin(na);
    const lx = Math.cos(la); const ly = Math.sin(la);
    const dp = fr(nx * lx + ny * ly);
    const brightness = Math.max(0, dp);

    const surfColor = `rgba(83,74,183,${0.1 + brightness * 0.6})`;
    ctx.fillStyle = surfColor;
    ctx.fillRect(0, cvH * 0.6, W, cvH * 0.4);
    ctx.fillStyle = `rgba(83,74,183,${0.3 + brightness * 0.5})`;
    ctx.font = '12px sans-serif';
    ctx.fillText(`surface (brightness: ${(brightness * 100).toFixed(0)}%)`, 8, cvH * 0.6 + 20);

    const ox = W / 2;
    const oy = cvH * 0.6;
    const sc = 90;

    function drawArrow(x1, y1, dx, dy, color, label) {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + dx * sc, y1 + dy * sc); ctx.stroke();
      const ang = Math.atan2(dy * sc, dx * sc);
      ctx.beginPath();
      ctx.moveTo(x1 + dx * sc, y1 + dy * sc);
      ctx.lineTo(x1 + dx * sc - 10 * Math.cos(ang - 0.4), y1 + dy * sc - 10 * Math.sin(ang - 0.4));
      ctx.lineTo(x1 + dx * sc - 10 * Math.cos(ang + 0.4), y1 + dy * sc - 10 * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fill();
      ctx.font = '12px sans-serif';
      ctx.fillText(label, x1 + dx * sc + 6, y1 + dy * sc);
    }

    drawArrow(ox, oy, nx, -ny, C.green, 'n (normal)');
    drawArrow(ox, oy, lx, -ly, C.red, 'L (light/tool)');

    ctx.strokeStyle = 'rgba(128,128,128,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, cvH * 0.6); ctx.stroke();
    ctx.setLineDash([]);
  }, [nAngle, lAngle, C]);

  useEffect(() => {
    draw();
    roRef.current = new ResizeObserver(draw);
    if (canvasRef.current) roRef.current.observe(canvasRef.current.parentElement);
    return () => roRef.current?.disconnect();
  }, [draw]);

  return <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 400, height: 280, display: 'block', border: `0.5px solid ${C.border}`, borderRadius: 6 }} />;
}

// ── Determinant Canvas ──────────────────────────────────────────────────────
function DetCanvas({ ua, ub, vc, vd, C }) {
  const canvasRef = useRef(null);
  const roRef = useRef(null);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = cv.offsetWidth || 500;
    cv.height = 300;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const cvH = cv.height;
    const cx = W / 2;
    const cy = cvH / 2;
    const sc = 28;

    ctx.clearRect(0, 0, W, cvH);
    ctx.strokeStyle = 'rgba(128,128,128,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * sc, 0); ctx.lineTo(cx + i * sc, cvH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy + i * sc); ctx.lineTo(W, cy + i * sc); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(128,128,128,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, cvH); ctx.stroke();

    const det = fr(ua * vd - vc * ub);
    const area = Math.abs(det);
    const ux = ua * sc; const uy = -ub * sc;
    const vx = vc * sc; const vy = -vd * sc;

    ctx.fillStyle = area < 0.1 ? 'rgba(216,90,48,0.15)' : 'rgba(29,158,117,0.15)';
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx + ux, cy + uy);
    ctx.lineTo(cx + ux + vx, cy + uy + vy); ctx.lineTo(cx + vx, cy + vy);
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle = area < 0.1 ? C.red : C.green;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx + ux, cy + uy);
    ctx.lineTo(cx + ux + vx, cy + uy + vy); ctx.lineTo(cx + vx, cy + vy);
    ctx.closePath(); ctx.stroke();

    function arrow2(x1, y1, x2, y2, color, label) {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const ang = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath(); ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 8 * Math.cos(ang - 0.4), y2 - 8 * Math.sin(ang - 0.4));
      ctx.lineTo(x2 - 8 * Math.cos(ang + 0.4), y2 - 8 * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fill();
      ctx.font = '12px sans-serif';
      ctx.fillText(label, x2 + 5, y2 - 5);
    }
    arrow2(cx, cy, cx + ux, cy + uy, C.green, `u=[${ua},${ub}]`);
    arrow2(cx, cy, cx + vx, cy + vy, C.purple, `v=[${vc},${vd}]`);
    if (area > 0.5) {
      ctx.fillStyle = 'rgba(29,158,117,0.6)';
      ctx.font = '500 12px sans-serif';
      ctx.fillText(`area=${area.toFixed(1)}`, cx + ux / 2 + vx / 2 - 15, cy + uy / 2 + vy / 2 + 5);
    }
  }, [ua, ub, vc, vd, C]);

  useEffect(() => {
    draw();
    roRef.current = new ResizeObserver(draw);
    if (canvasRef.current) roRef.current.observe(canvasRef.current.parentElement);
    return () => roRef.current?.disconnect();
  }, [draw]);

  return <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 400, height: 300, display: 'block', border: `0.5px solid ${C.border}`, borderRadius: 6 }} />;
}

// ── Page components ──────────────────────────────────────────────────────────
function PageCNC({ C }) {
  const [sa, setSa] = useState(10);
  const [sb, setSb] = useState(2);
  const xFin = fr((sa - sb) / 3);
  const yFin = fr((2 * sb - sa) / 3);

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: '0.75rem' }}>Linear systems: how CNC machines find their position</h3>
      <div style={{ background: C.surface2, borderLeft: `3px solid ${C.green}`, borderRadius: '0 6px 6px 0', padding: '12px 16px', marginBottom: '1.5rem', fontSize: 14, lineHeight: 1.6, color: C.text2 }}>
        <strong style={{ color: C.text, fontWeight: 500 }}>Why does this exist?</strong> A CNC mill has multiple axes. When you command it to move to a position, the controller is solving a system of equations every millisecond to translate tool coordinates into motor steps. The math you're doing by hand is what the firmware does in microseconds.
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: '0.75rem', color: C.text2 }}>A CNC machine needs to find the intersection of tool constraints. Two position sensors give:</p>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border3}`, borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>
        <div>Sensor A: <span style={{ color: C.green, fontWeight: 500 }}>2x + y = {sa}</span> &nbsp;(X + Y encoder reading)</div>
        <div>Sensor B: <span style={{ color: C.purple, fontWeight: 500 }}>x − y = {sb}</span> &nbsp;(differential reading)</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140, flex: 1 }}>
          <label style={{ fontSize: 12, color: C.text2 }}>Sensor A constant</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="range" min={4} max={16} value={sa} step={1} onChange={e => setSa(Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 32 }}>{sa}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140, flex: 1 }}>
          <label style={{ fontSize: 12, color: C.text2 }}>Sensor B constant</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="range" min={-4} max={8} value={sb} step={1} onChange={e => setSb(Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 32 }}>{sb}</span>
          </div>
        </div>
      </div>
      <CNCCanvas sa={sa} sb={sb} C={C} />
      <div style={{ background: C.surface, border: `0.5px solid ${C.border3}`, borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>
        <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text3, marginBottom: 8 }}>Augmented matrix → RREF → solution</div>
        <div>Augmented: <span style={{ color: C.green }}>[ 2  1 | {sa} ]</span>   (Sensor A: 2x + y = {sa})</div>
        <div>           <span style={{ color: C.purple }}>[ 1 -1 | {sb} ]</span>   (Sensor B: x − y = {sb})</div>
        <div style={{ marginTop: 8 }}>R₂ → R₂ − ½R₁:  [ 0  -3/2 | {fr(sb - sa / 2)} ]</div>
        <div>Scale R₁ by ½:   [ 1   ½   | {fr(sa / 2)} ]</div>
        <div style={{ marginTop: 8 }}>RREF → x = <span style={{ color: C.green }}>{xFin.toFixed(2)}</span>,  y = <span style={{ color: C.purple }}>{yFin.toFixed(2)}</span></div>
      </div>
      <hr style={{ border: 'none', borderTop: `0.5px solid ${C.border3}`, margin: '1.5rem 0' }} />
      <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: '0.5rem', color: C.text2 }}>What the RREF is telling the machine</h4>
      <ol style={{ listStyle: 'none', counterReset: 'steps', paddingLeft: 0 }}>
        {['Write sensor readings as an augmented matrix [A|b] — each row is one sensor constraint',
          'Row reduce until you get [I|x] — the identity on the left means "each axis isolated"',
          'The right column is the actual tool position: x-coordinate and y-coordinate',
          'If the matrix is inconsistent (0 = nonzero row), the sensors contradict each other — the controller throws a fault'
        ].map((txt, i) => (
          <li key={i} style={{ counterIncrement: 'steps', display: 'flex', gap: 12, marginBottom: 10, fontSize: 14, lineHeight: 1.6 }}>
            <span style={{ minWidth: 22, height: 22, borderRadius: '50%', background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: C.text2, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
            <span style={{ color: C.text2 }}>{txt}</span>
          </li>
        ))}
      </ol>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1rem' }}>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>X position</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{xFin.toFixed(2)}</div>
        </div>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>Y position</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{yFin.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

function PageGraphics({ C }) {
  const [deg, setDeg] = useState(0);
  const [sclPct, setSclPct] = useState(100);
  const [shPct, setShPct] = useState(0);
  const scl = sclPct / 100;
  const sh = shPct / 100;
  const rad = deg * Math.PI / 180;
  const cos = Math.cos(rad); const sin = Math.sin(rad);
  const a = fr(scl * cos); const b = fr(-scl * sin + sh * scl * cos);
  const c2 = fr(scl * sin); const d = fr(scl * cos + sh * scl * sin);
  const det = fr(a * d - b * c2);
  const invertible = Math.abs(det) > 0.01;

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: '0.75rem' }}>Matrix multiplication: how computer graphics move every vertex</h3>
      <div style={{ background: C.surface2, borderLeft: `3px solid ${C.green}`, borderRadius: '0 6px 6px 0', padding: '12px 16px', marginBottom: '1.5rem', fontSize: 14, lineHeight: 1.6, color: C.text2 }}>
        <strong style={{ color: C.text, fontWeight: 500 }}>Why does this exist?</strong> Every object in a 3D game or CAD model is a list of vertices. When you rotate, scale, or translate it, the software multiplies every vertex by a transformation matrix. The reason they're matrices is so that multiple transformations can be combined into one multiplication instead of many separate operations.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: '1.5rem', alignItems: 'center' }}>
        {[
          { label: 'Rotation (degrees)', val: deg, min: 0, max: 360, step: 1, disp: `${deg}°`, set: setDeg },
          { label: 'Scale factor', val: sclPct, min: 50, max: 200, step: 5, disp: `${scl.toFixed(1)}×`, set: setSclPct },
          { label: 'Shear X', val: shPct, min: -100, max: 100, step: 5, disp: sh.toFixed(1), set: setShPct },
        ].map(ctrl => (
          <div key={ctrl.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140, flex: 1 }}>
            <label style={{ fontSize: 12, color: C.text2 }}>{ctrl.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={ctrl.min} max={ctrl.max} value={ctrl.val} step={ctrl.step} onChange={e => ctrl.set(Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>{ctrl.disp}</span>
            </div>
          </div>
        ))}
      </div>
      <GraphicsCanvas deg={deg} scl={scl} sh={sh} C={C} />
      <div style={{ background: C.surface, border: `0.5px solid ${C.border3}`, borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>
        <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text3, marginBottom: 8 }}>Current transformation matrix T</div>
        <div>T = <span style={{ color: C.green }}>[ {a.toFixed(2)}  {b.toFixed(2)} ]</span>   (rotation + scale + shear)</div>
        <div>    <span style={{ color: C.green }}>[ {c2.toFixed(2)}  {d.toFixed(2)} ]</span></div>
        <div style={{ marginTop: 8 }}>For vertex p = [x, y]ᵀ:  T·p = [{a.toFixed(2)}x + {b.toFixed(2)}y,  {c2.toFixed(2)}x + {d.toFixed(2)}y]ᵀ</div>
        <div>det(T) = {a.toFixed(2)} × {d.toFixed(2)} − ({b.toFixed(2)}) × {c2.toFixed(2)} = <span style={{ color: C.purple }}>{det.toFixed(2)}</span>  (area scaling factor)</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1rem' }}>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>det(T) — area scaling</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{det.toFixed(2)}</div>
        </div>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>Invertible?</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: invertible ? C.green : C.red }}>{invertible ? 'Yes' : 'No — singular!'}</div>
        </div>
      </div>
    </div>
  );
}

function PageForces({ C }) {
  const [a1, setA1] = useState(-30);
  const [a2, setA2] = useState(30);
  const [load, setLoad] = useState(500);
  const r1 = (90 + a1) * Math.PI / 180;
  const r2 = (90 + a2) * Math.PI / 180;
  const c1x = fr(Math.cos(r1)); const c1y = fr(Math.sin(r1));
  const c2x = fr(Math.cos(r2)); const c2y = fr(Math.sin(r2));
  const det = c1x * c2y - c2x * c1y;
  let T1, T2;
  if (Math.abs(det) < 0.001) { T1 = Infinity; T2 = Infinity; }
  else {
    T1 = fr((0 * c2y - c2x * (-load)) / det);
    T2 = fr((c1x * (-load) - 0 * c1y) / det);
  }

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: '0.75rem' }}>Vectors: resolving forces in a mechanical structure</h3>
      <div style={{ background: C.surface2, borderLeft: `3px solid ${C.green}`, borderRadius: '0 6px 6px 0', padding: '12px 16px', marginBottom: '1.5rem', fontSize: 14, lineHeight: 1.6, color: C.text2 }}>
        <strong style={{ color: C.text, fontWeight: 500 }}>Why does this exist?</strong> When you design a bracket, truss, or robotic arm joint, every force is a vector. FEA software solves systems of millions of linear equations built from exactly these vector sums.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: '1.5rem', alignItems: 'center' }}>
        {[
          { label: 'Cable 1 angle (° from vertical)', val: a1, min: -70, max: 0, step: 1, disp: `${a1}°`, set: setA1 },
          { label: 'Cable 2 angle (° from vertical)', val: a2, min: 0, max: 70, step: 1, disp: `${a2}°`, set: setA2 },
          { label: 'Load (N)', val: load, min: 100, max: 1000, step: 10, disp: `${load}N`, set: setLoad },
        ].map(ctrl => (
          <div key={ctrl.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140, flex: 1 }}>
            <label style={{ fontSize: 12, color: C.text2 }}>{ctrl.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={ctrl.min} max={ctrl.max} value={ctrl.val} step={ctrl.step} onChange={e => ctrl.set(Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>{ctrl.disp}</span>
            </div>
          </div>
        ))}
      </div>
      <ForcesCanvas a1={a1} a2={a2} load={load} C={C} />
      <div style={{ background: C.surface, border: `0.5px solid ${C.border3}`, borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>
        <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text3, marginBottom: 8 }}>Vector decomposition</div>
        <div>x: <span style={{ color: C.green }}>{c1x.toFixed(3)}</span>·T₁ + <span style={{ color: C.purple }}>{c2x.toFixed(3)}</span>·T₂ = 0</div>
        <div>y: <span style={{ color: C.green }}>{c1y.toFixed(3)}</span>·T₁ + <span style={{ color: C.purple }}>{c2y.toFixed(3)}</span>·T₂ = {load}</div>
        <div style={{ marginTop: 8 }}>Coefficient matrix:  det = {fr(det).toFixed(3)}  {Math.abs(det) < 0.1 ? '← near-singular! cables nearly parallel' : '← well-conditioned'}</div>
        <div style={{ marginTop: 8 }}>T₁ = <span style={{ color: C.green }}>{isFinite(T1) ? T1.toFixed(1) + 'N' : '∞ (parallel!)'}</span>,  T₂ = <span style={{ color: C.purple }}>{isFinite(T2) ? T2.toFixed(1) + 'N' : '∞ (parallel!)'}</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1rem' }}>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>Tension in cable 1</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{isFinite(T1) ? T1.toFixed(1) + ' N' : '∞'}</div>
        </div>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>Tension in cable 2</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{isFinite(T2) ? T2.toFixed(1) + ' N' : '∞'}</div>
        </div>
      </div>
    </div>
  );
}

function PageDot({ C }) {
  const [nAngle, setNAngle] = useState(90);
  const [lAngle, setLAngle] = useState(90);
  const na = nAngle * Math.PI / 180;
  const la = lAngle * Math.PI / 180;
  const nx = fr(Math.cos(na)); const ny = fr(Math.sin(na));
  const lx = fr(Math.cos(la)); const ly = fr(Math.sin(la));
  const dp = fr(nx * lx + ny * ly);
  const angle = fr(Math.acos(Math.max(-1, Math.min(1, dp))) * 180 / Math.PI);
  const brightness = Math.max(0, dp);

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: '0.75rem' }}>Dot product: surface normals, toolpath angles, and shading</h3>
      <div style={{ background: C.surface2, borderLeft: `3px solid ${C.green}`, borderRadius: '0 6px 6px 0', padding: '12px 16px', marginBottom: '1.5rem', fontSize: 14, lineHeight: 1.6, color: C.text2 }}>
        <strong style={{ color: C.text, fontWeight: 500 }}>Why does this exist?</strong> In CAM software, the dot product is used constantly. To avoid gouging a surface, the software checks whether the tool axis is too far from the surface normal. In rendering, surface brightness is the dot product of normal and light direction.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: '1.5rem', alignItems: 'center' }}>
        {[
          { label: 'Surface normal angle (°)', val: nAngle, set: setNAngle },
          { label: 'Light / tool angle (°)', val: lAngle, set: setLAngle },
        ].map(ctrl => (
          <div key={ctrl.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140, flex: 1 }}>
            <label style={{ fontSize: 12, color: C.text2 }}>{ctrl.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={0} max={180} value={ctrl.val} step={1} onChange={e => ctrl.set(Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>{ctrl.val}°</span>
            </div>
          </div>
        ))}
      </div>
      <DotCanvas nAngle={nAngle} lAngle={lAngle} C={C} />
      <div style={{ background: C.surface, border: `0.5px solid ${C.border3}`, borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>
        <div>n = [{nx.toFixed(3)}, {ny.toFixed(3)}]   (surface normal, ‖n‖=1)</div>
        <div>L = [{lx.toFixed(3)}, {ly.toFixed(3)}]   (light/tool direction, ‖L‖=1)</div>
        <div style={{ marginTop: 8 }}>n · L = ({nx.toFixed(3)})({lx.toFixed(3)}) + ({ny.toFixed(3)})({ly.toFixed(3)})</div>
        <div>      = {fr(nx * lx).toFixed(3)} + {fr(ny * ly).toFixed(3)} = <span style={{ color: C.green }}>{dp.toFixed(3)}</span></div>
        <div style={{ marginTop: 8 }}>Angle = arccos({dp.toFixed(3)}) = <span style={{ color: C.purple }}>{angle.toFixed(1)}°</span></div>
        <div>Brightness = max(0, n·L) = <span style={{ color: brightness > 0.5 ? C.green : C.red }}>{brightness.toFixed(3)}</span>  {brightness < 0.01 ? '(shadow)' : brightness < 0.5 ? '(partial light)' : '(well lit)'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1rem' }}>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>Dot product n·L</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{dp.toFixed(3)}</div>
        </div>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>Angle between</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{angle.toFixed(1)}°</div>
        </div>
      </div>
    </div>
  );
}

function PageDet({ C }) {
  const [ua, setUa] = useState(3);
  const [ub, setUb] = useState(1);
  const [vc, setVc] = useState(1);
  const [vd, setVd] = useState(3);
  const det = fr(ua * vd - vc * ub);
  const area = Math.abs(det);

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: '0.75rem' }}>Determinants: area, volume, and when geometry collapses</h3>
      <div style={{ background: C.surface2, borderLeft: `3px solid ${C.green}`, borderRadius: '0 6px 6px 0', padding: '12px 16px', marginBottom: '1.5rem', fontSize: 14, lineHeight: 1.6, color: C.text2 }}>
        <strong style={{ color: C.text, fontWeight: 500 }}>Why does this exist?</strong> The determinant measures how much a matrix scales area (2D) or volume (3D). In CAD/CAM, when you apply a transformation to a part, det tells you the volume scaling factor — critical for tolerances and collision detection. det = 0 means your geometry collapsed.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: '1.5rem', alignItems: 'center' }}>
        {[
          { label: 'Vector u — a', val: ua, set: setUa },
          { label: 'Vector u — b', val: ub, set: setUb },
          { label: 'Vector v — c', val: vc, set: setVc },
          { label: 'Vector v — d', val: vd, set: setVd },
        ].map(ctrl => (
          <div key={ctrl.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140, flex: 1 }}>
            <label style={{ fontSize: 12, color: C.text2 }}>{ctrl.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={-5} max={5} value={ctrl.val} step={0.5} onChange={e => ctrl.set(Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: 13, fontWeight: 500, minWidth: 32 }}>{ctrl.val}</span>
            </div>
          </div>
        ))}
      </div>
      <DetCanvas ua={ua} ub={ub} vc={vc} vd={vd} C={C} />
      <div style={{ background: C.surface, border: `0.5px solid ${C.border3}`, borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>
        <div>Matrix A = [u | v] = <span style={{ color: C.green }}>[ {ua}  {vc} ]</span></div>
        <div>                     <span style={{ color: C.green }}>[ {ub}  {vd} ]</span></div>
        <div style={{ marginTop: 8 }}>det(A) = ad − bc = ({ua})({vd}) − ({vc})({ub})</div>
        <div>       = {fr(ua * vd)} − {fr(vc * ub)} = <span style={{ color: C.purple }}>{det.toFixed(2)}</span></div>
        <div style={{ marginTop: 8 }}>Area = |det| = <span style={{ color: area < 0.1 ? C.red : C.green }}>{area.toFixed(2)}</span>{area < 0.1 ? ' ← collapsed to a line! singular matrix' : ''}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1rem' }}>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>det([u v])</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{det.toFixed(2)}</div>
        </div>
        <div style={{ background: C.surface2, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>Parallelogram area</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{area.toFixed(2)} sq units</div>
        </div>
      </div>
      <p style={{ marginTop: '0.75rem', fontSize: 14, lineHeight: 1.7, color: C.text2 }}>Try making u a scalar multiple of v. When the vectors are parallel, the parallelogram collapses to a line — area = 0, det = 0, matrix is singular. That's not a coincidence: that's what the determinant measures.</p>
    </div>
  );
}

const PRACTICE = [
  {
    tag: 'CNC / systems',
    q: '1. Two encoders on a mill give readings: 3x + 2y = 14 and x − y = 1. Find the tool position by row reduction (show augmented matrix and all row operations).',
    a: `Augmented matrix:
[ 3   2  | 14 ]
[ 1  -1  |  1 ]

R₁ ↔ R₂ (simpler row on top):
[ 1  -1  |  1 ]
[ 3   2  | 14 ]

R₂ → R₂ − 3R₁:
[ 1  -1  |  1 ]
[ 0   5  | 11 ]

R₂ → (1/5)R₂:
[ 1  -1  |  1   ]
[ 0   1  | 11/5 ]

R₁ → R₁ + R₂:
[ 1   0  | 16/5 ]
[ 0   1  | 11/5 ]

x = 16/5 = 3.2,  y = 11/5 = 2.2
Tool position: (3.2, 2.2)`,
  },
  {
    tag: 'Computer graphics / matrix multiplication',
    q: '2. A vertex is at p = [2, 1]ᵀ. Apply a 90° rotation matrix, then a scale-by-2 matrix. Show both multiplications. What is the final vertex position?',
    a: `90° rotation matrix R:
[ cos90°  -sin90° ]   [ 0  -1 ]
[ sin90°   cos90° ] = [ 1   0 ]

Scale-by-2 matrix S:
[ 2   0 ]
[ 0   2 ]

Step 1 — apply R to p = [2,1]ᵀ:
R·p = [0·2 + (-1)·1]  = [-1]
      [1·2 +   0·1 ]    [ 2]

Step 2 — apply S to [-1, 2]ᵀ:
S·[-1,2]ᵀ = [-2]
             [ 4]

Final position: (-2, 4)

Combined S·R:
S·R = [0 -2]
      [2  0]
Check: [0 -2][2] = [-2]  ✓
       [2  0][1]   [ 4]`,
  },
  {
    tag: 'Structural mechanics / vectors',
    q: '3. A bolt is pulled by two forces: F₁ = [3, 4]ᵀ kN and F₂ = [−1, 2]ᵀ kN. Find the resultant force vector, its magnitude, and the angle it makes with the x-axis.',
    a: `Resultant = F₁ + F₂ = [3+(-1), 4+2]ᵀ = [2, 6]ᵀ kN

Magnitude = √(2² + 6²) = √40 = 2√10 ≈ 6.32 kN

Angle from x-axis:
θ = arctan(6/2) = arctan(3) ≈ 71.6°

Resultant: ≈ 6.32 kN at 71.6° above x-axis.`,
  },
  {
    tag: 'Surface normals / dot product',
    q: '4. A machined surface has normal n = [0, 1, 1]ᵀ (not normalized). A cutting tool axis is t = [0, 1, 0]ᵀ. Find the angle between them. Is this a safe cutting angle (must be < 30° from normal for a ballnose end mill)?',
    a: `n = [0, 1, 1]ᵀ,  ‖n‖ = √2
t = [0, 1, 0]ᵀ,  ‖t‖ = 1

n · t = (0)(0) + (1)(1) + (1)(0) = 1

cos(θ) = (n·t) / (‖n‖·‖t‖) = 1/√2

θ = arccos(1/√2) = 45°

45° > 30° → NOT a safe cutting angle.
CAM software would flag this and tilt the tool axis.`,
  },
  {
    tag: 'Area calculation / determinant',
    q: '5. A parallelogram-shaped sheet metal blank is defined by vectors u = [5, 2]ᵀ and v = [1, 4]ᵀ (in cm). Find the area using the determinant. If material costs $3.50/cm², what is the blank cost?',
    a: `Matrix A = [u | v] = [ 5  1 ]
                     [ 2  4 ]

det(A) = (5)(4) − (1)(2) = 20 − 2 = 18

Area = |det(A)| = 18 cm²

Cost = 18 cm² × $3.50/cm² = $63.00`,
  },
];

function PagePractice({ C }) {
  const [shown, setShown] = useState({});
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: '0.5rem' }}>Practice: applied problems with real context</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: '1rem', color: C.text2 }}>Work each problem manually, then reveal the answer to check.</p>
      {PRACTICE.map((p, i) => (
        <div key={i} style={{ background: C.surface, border: `0.5px solid ${C.border3}`, borderRadius: 8, padding: '1rem 1.25rem', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text3, marginBottom: 8 }}>{p.tag}</div>
          <strong style={{ fontSize: 14 }}>{p.q}</strong>
          {shown[i] && (
            <pre style={{ marginTop: 8, background: C.surface2, borderRadius: 6, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8, color: C.text2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{p.a}</pre>
          )}
          <button
            onClick={() => setShown(s => ({ ...s, [i]: !s[i] }))}
            style={{ marginTop: 8, padding: '4px 12px', fontSize: 13, borderRadius: 6, border: `0.5px solid ${C.border2}`, background: C.surface2, color: C.text2, cursor: 'pointer' }}
          >
            {shown[i] ? 'Hide answer' : 'Show answer'}
          </button>
        </div>
      ))}
    </div>
  );
}

const PAGES = [
  { id: 'cnc', label: 'Systems → CNC', Comp: PageCNC },
  { id: 'graphics', label: 'Matrices → Graphics', Comp: PageGraphics },
  { id: 'forces', label: 'Vectors → Forces', Comp: PageForces },
  { id: 'dot', label: 'Dot → Normals', Comp: PageDot },
  { id: 'det', label: 'Det → Area/Vol', Comp: PageDet },
  { id: 'practice', label: 'Practice', Comp: PagePractice },
];

export default function LALinearAlgebraRealWorld({ params = {} }) {
  const C = useColors();
  const [page, setPage] = useState(params.page ?? 'cnc');
  const current = PAGES.find(p => p.id === page) ?? PAGES[0];
  const { Comp } = current;

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.5rem' }}>
        {PAGES.map(p => (
          <button
            key={p.id}
            onClick={() => setPage(p.id)}
            style={{
              padding: '6px 14px', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              border: `0.5px solid ${page === p.id ? C.border : C.border2}`,
              borderRadius: 6,
              background: page === p.id ? C.surface2 : C.surface,
              color: page === p.id ? C.text : C.text2,
              fontWeight: page === p.id ? 500 : 400,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Comp C={C} />
    </div>
  );
}
