// FreeFallIntuition.jsx — Ch2 L12-18 Pillar 1
import { useState, useEffect, useRef } from "react";

const G = 9.8;
const W = 460, H = 300, PL = 52, PB = 36, PT = 16, PR = 60;
const GW = W - PL - PR, GH = H - PT - PB;

export default function FreeFallIntuition({ params = {} }) {
  const [v0, setV0] = useState(20);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const tTotal = 2 * v0 / G;
  const hMax = v0 * v0 / (2 * G);
  const xMax = Math.max(hMax * 1.1, 5);

  // Animate
  useEffect(() => {
    if (!playing) { cancelAnimationFrame(rafRef.current); return; }
    function tick(ts) {
      if (!lastRef.current) lastRef.current = ts;
      const elapsed = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setTime(t => {
        const next = t + elapsed;
        if (next >= tTotal) { setPlaying(false); return tTotal; }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, tTotal]);

  function reset() { setTime(0); setPlaying(false); lastRef.current = null; }

  function toSVG(t, x) {
    return [PL + (t / tTotal) * GW, PT + GH - (x / xMax) * GH];
  }

  const x_t = t => v0 * t - 0.5 * G * t * t;
  const v_t = t => v0 - G * t;

  const curvePts = Array.from({ length: 81 }, (_, i) => {
    const t = (i / 80) * tTotal;
    return toSVG(t, x_t(t));
  });
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  const curX = x_t(time), curV = v_t(time);
  const [dotX, dotY] = toSVG(time, Math.max(0, curX));

  // Ball vertical position for side display
  const ballY = PT + GH - (Math.max(0, curX) / xMax) * GH;
  const ballX = W - 32;

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · FREE FALL</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { reset(); setTimeout(() => setPlaying(true), 10); }}
            style={{ background: "#818cf8", color: "#0f172a", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            ▶ Launch
          </button>
          <button onClick={reset}
            style={{ background: "#1e293b", color: "#64748b", border: "1px solid #334155", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            Reset
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "8px 20px 4px" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
            <span>v₀ (initial velocity upward)</span><span style={{ color: "#818cf8", fontWeight: 700 }}>{v0} m/s</span>
          </div>
          <input type="range" min={5} max={35} step={1} value={v0} onChange={e => { setV0(parseInt(e.target.value)); reset(); }} style={{ width: "100%" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8 }}>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "6px 12px", flex: 1 }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>t = {time.toFixed(2)} s</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: curV > 0 ? "#10b981" : curV < -0.1 ? "#f43f5e" : "#818cf8" }}>
              v = {curV.toFixed(1)} m/s
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const [, ty] = toSVG(0, f * xMax);
            return <line key={f} x1={PL} y1={ty} x2={PL + GW} y2={ty} stroke="#141e30" strokeWidth={0.5} />;
          })}
          <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
          <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />

          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const [, ty] = toSVG(0, f * xMax);
            return <text key={f} x={PL - 4} y={ty + 3} fill="#475569" fontSize={8} textAnchor="end">{(f * xMax).toFixed(0)}m</text>;
          })}
          {[0, tTotal / 4, tTotal / 2, 3 * tTotal / 4, tTotal].map(t => {
            const [tx] = toSVG(t, 0);
            return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={8} textAnchor="middle">{t.toFixed(1)}s</text>;
          })}

          <text x={12} y={PT + GH / 2} fill="#475569" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>height (m)</text>
          <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">time (s)</text>

          {/* Max height marker */}
          {(() => {
            const [mhx, mhy] = toSVG(v0 / G, hMax);
            return <>
              <line x1={mhx} y1={mhy} x2={mhx} y2={PT + GH} stroke="#818cf8" strokeWidth={0.5} strokeDasharray="4 3" />
              <text x={mhx + 4} y={mhy - 4} fill="#818cf8" fontSize={9}>h_max = {hMax.toFixed(1)}m</text>
            </>;
          })()}

          {/* a annotation */}
          <text x={PL + GW + 4} y={PT + 20} fill="#f43f5e" fontSize={9}>a = −g</text>
          <text x={PL + GW + 4} y={PT + 32} fill="#f43f5e" fontSize={9}>= −9.8</text>
          <text x={PL + GW + 4} y={PT + 44} fill="#f43f5e" fontSize={9}>m/s²</text>

          <path d={curveD} fill="none" stroke="#818cf8" strokeWidth={2} opacity={0.5} />

          {/* Trace up to current time */}
          {time > 0 && (() => {
            const n = Math.round(time / tTotal * 80);
            const trace = Array.from({ length: n + 1 }, (_, i) => {
              const t = (i / 80) * tTotal;
              return toSVG(t, x_t(t));
            });
            const traceD = trace.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
            return <path d={traceD} fill="none" stroke="#818cf8" strokeWidth={2.5} />;
          })()}

          <circle cx={dotX} cy={dotY} r={7} fill={curV > 0 ? "#10b981" : "#f43f5e"} stroke="#e2e8f0" strokeWidth={1.5} />

          {/* Ball on right axis */}
          <circle cx={ballX} cy={ballY} r={8} fill={curV > 0 ? "#10b981" : "#f43f5e"} opacity={0.9} />
          <line x1={ballX} y1={PT} x2={ballX} y2={PT + GH} stroke="#1e293b" strokeWidth={1} />
        </svg>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: "h_max", val: hMax.toFixed(2) + " m", color: "#818cf8" },
          { label: "t to peak", val: (v0 / G).toFixed(2) + " s", color: "#6366f1" },
          { label: "total time", val: tTotal.toFixed(2) + " s", color: "#94a3b8" },
          { label: "v at return", val: "−" + v0.toFixed(0) + " m/s", color: "#f43f5e" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
