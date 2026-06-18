// IndependentMotionIntuition.jsx — Ch3 L1 Pillar 1
// Shows two balls: one dropped, one launched horizontally — they hit the ground at the same time
import { useState, useEffect, useRef } from "react";

const G = 9.8;
const W = 460, H = 300;
const GROUND_Y = H - 30;
const START_X = 80, START_Y = 40;
const H_TOTAL = GROUND_Y - START_Y; // pixels = height

export default function IndependentMotionIntuition({ params = {} }) {
  const [vx, setVx] = useState(60); // px/s horizontal speed
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  // Scale: 1 m = 20 px, so H_TOTAL px = H_TOTAL/20 m
  const hMetres = H_TOTAL / 20; // ≈ 11.5 m
  const tFall = Math.sqrt(2 * hMetres / G); // time to fall

  useEffect(() => {
    if (!playing) { cancelAnimationFrame(rafRef.current); return; }
    function tick(ts) {
      if (!lastRef.current) lastRef.current = ts;
      const elapsed = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setT(prev => {
        const next = prev + elapsed;
        if (next >= tFall + 0.3) { setPlaying(false); return tFall + 0.3; }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, tFall]);

  function reset() { setT(0); setPlaying(false); lastRef.current = null; }

  const tClamped = Math.min(t, tFall);

  // Dropped ball (vertical only)
  const yDrop = START_Y + 0.5 * G * tClamped * tClamped * 20;
  const dropHit = t >= tFall;

  // Horizontal launch ball
  const xLaunch = START_X + vx * tClamped;
  const yLaunch = START_Y + 0.5 * G * tClamped * tClamped * 20;
  const launchHit = t >= tFall;

  // Trail for launched ball
  const trailPts = Array.from({ length: 30 }, (_, i) => {
    const ti = (i / 29) * tClamped;
    return { x: START_X + vx * ti, y: START_Y + 0.5 * G * ti * ti * 20 };
  });

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · X AND Y ARE INDEPENDENT</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { reset(); setTimeout(() => setPlaying(true), 10); }}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>▶ Drop</button>
          <button onClick={reset}
            style={{ background: "#1e293b", color: "#64748b", border: "1px solid #334155", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Reset</button>
        </div>
      </div>

      <div style={{ padding: "8px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
          <span>Horizontal speed of launched ball</span>
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>{(vx / 20).toFixed(1)} m/s</span>
        </div>
        <input type="range" min={20} max={120} step={5} value={vx} onChange={e => { setVx(parseInt(e.target.value)); reset(); }} style={{ width: "100%" }} />
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Ground */}
        <line x1={0} y1={GROUND_Y} x2={W} y2={GROUND_Y} stroke="#334155" strokeWidth={2} />
        <text x={W / 2} y={GROUND_Y + 16} fill="#475569" fontSize={10} textAnchor="middle">GROUND</text>

        {/* Vertical guide for drop ball */}
        <line x1={START_X} y1={START_Y} x2={START_X} y2={GROUND_Y} stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />

        {/* Trail for launched ball */}
        {trailPts.length > 1 && (
          <polyline points={trailPts.map(p => `${p.x},${p.y}`).join(" ")}
            fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.4} />
        )}

        {/* Dropped ball */}
        {!dropHit && (
          <circle cx={START_X} cy={Math.min(yDrop, GROUND_Y - 8)} r={9} fill="#6366f1" stroke="#e0e7ff" strokeWidth={1.5} />
        )}
        {dropHit && (
          <circle cx={START_X} cy={GROUND_Y - 8} r={9} fill="#10b981" stroke="#0f172a" strokeWidth={2} />
        )}

        {/* Launched ball */}
        {!launchHit && (
          <circle cx={Math.min(xLaunch, W - 20)} cy={Math.min(yLaunch, GROUND_Y - 8)} r={9} fill="#f59e0b" stroke="#fef3c7" strokeWidth={1.5} />
        )}
        {launchHit && (
          <circle cx={Math.min(xLaunch, W - 20)} cy={GROUND_Y - 8} r={9} fill="#10b981" stroke="#0f172a" strokeWidth={2} />
        )}

        {/* Labels */}
        <text x={START_X} y={START_Y - 8} fill="#6366f1" fontSize={11} textAnchor="middle" fontWeight="700">Dropped</text>
        <text x={START_X + 35} y={START_Y - 8} fill="#f59e0b" fontSize={11} fontWeight="700">Launched →</text>

        {/* Time display */}
        <text x={W - 16} y={30} fill="#818cf8" fontSize={12} textAnchor="end" fontWeight="700">t = {tClamped.toFixed(2)} s</text>

        {/* Hit annotation */}
        {dropHit && <text x={W / 2} y={GROUND_Y - 18} fill="#34d399" fontSize={12} textAnchor="middle" fontWeight="700">Both land at t = {tFall.toFixed(2)} s ✓</text>}

        {/* Vertical component arrows on launched ball */}
        {!launchHit && xLaunch < W - 30 && (
          <>
            <line x1={xLaunch} y1={Math.min(yLaunch, GROUND_Y - 8)}
              x2={xLaunch + (vx > 0 ? 18 : -18)} y2={Math.min(yLaunch, GROUND_Y - 8)}
              stroke="#f59e0b" strokeWidth={2} />
            <polygon points={`${xLaunch + 18},${yLaunch} ${xLaunch + 10},${yLaunch - 4} ${xLaunch + 10},${yLaunch + 4}`} fill="#f59e0b" />
          </>
        )}
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: "Time in air", val: tFall.toFixed(3) + " s", color: "#818cf8", note: "same for both" },
          { label: "Drop lands at x", val: `${(START_X).toFixed(0)} px`, color: "#6366f1" },
          { label: "Launch lands at x", val: `${(START_X + vx * tFall).toFixed(0)} px`, color: "#f59e0b" },
        ].map(({ label, val, color, note }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{note || label}</div>
            {note && <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>}
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569" }}>
        Both balls hit the ground at exactly the same time regardless of horizontal speed. Vertical fall is independent of horizontal motion.
      </div>
    </div>
  );
}
