// FreeFallExplorer.jsx — interactive free-fall explorer with time scrubber
import { useCallback, useEffect, useRef, useState } from "react";

const G = 9.8;
const MAX_T = 3;     // seconds
const BALL_R = 10;
const SHAFT_H = 260; // px height of the visual shaft

function easeInQuad(t) { return t * t; }

export default function FreeFallExplorer() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const startTRef = useRef(0);

  const x = 0.5 * G * t * t;             // m  dropped from rest
  const v = G * t;                         // m/s
  const maxX = 0.5 * G * MAX_T * MAX_T;   // ≈ 44.1 m

  // y-pixel position on the shaft (0 = top, SHAFT_H = bottom)
  const ballY = Math.min((x / maxX) * SHAFT_H, SHAFT_H - BALL_R);

  const stop = useCallback(() => {
    setPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const tick = useCallback((now) => {
    const elapsed = (now - startRef.current) / 1000;
    const newT = Math.min(startTRef.current + elapsed, MAX_T);
    setT(newT);
    if (newT < MAX_T) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setPlaying(false);
    }
  }, []);

  const play = useCallback(() => {
    if (t >= MAX_T) setT(0);
    startTRef.current = t >= MAX_T ? 0 : t;
    startRef.current = performance.now();
    setPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [t, tick]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // Mini x-t curve path (SVG)
  const pathPoints = Array.from({ length: 60 }, (_, i) => {
    const ti = (i / 59) * MAX_T;
    const xi = 0.5 * G * ti * ti;
    return [ti, xi];
  });
  const graphW = 150, graphH = 80;
  const px = (ti) => (ti / MAX_T) * graphW;
  const py = (xi) => graphH - (xi / maxX) * graphH;
  const pathD = pathPoints.map(([ti, xi], i) => `${i === 0 ? "M" : "L"}${px(ti).toFixed(1)},${py(xi).toFixed(1)}`).join(" ");
  const dotX = px(t), dotY = py(x);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden", userSelect: "none" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>FREE FALL EXPLORER · DROP FROM REST</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#475569" }}>g = 9.8 m/s²</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* Left — shaft animation */}
        <div style={{ width: 100, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 16px" }}>
          <div style={{ fontSize: 10, color: "#475569", marginBottom: 6, letterSpacing: "0.06em" }}>DROP SHAFT</div>
          <div style={{ position: "relative", width: 36, height: SHAFT_H + BALL_R * 2, background: "#1e293b", borderRadius: 8, border: "1px solid #334155", overflow: "hidden" }}>
            {/* Height tick marks */}
            {[0, 5, 10, 20, 44].map((m) => {
              const yPct = (m / maxX) * 100;
              return (
                <div key={m} style={{ position: "absolute", top: `${yPct}%`, left: 0, right: 0, height: 1, background: "#1e3a5f", opacity: 0.7 }} />
              );
            })}
            {/* Ball */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: ballY + BALL_R,
              transform: "translate(-50%, -50%)",
              width: BALL_R * 2,
              height: BALL_R * 2,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #e0e7ff, #818cf8)",
              boxShadow: "0 0 8px #818cf880",
              transition: playing ? "none" : "top 0.05s linear",
            }} />
            {/* Ground line */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#f43f5e" }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: "#f43f5e", fontWeight: 700 }}>GROUND</div>
        </div>

        {/* Center — readings */}
        <div style={{ flex: 1, padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Live equation display */}
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8, letterSpacing: "0.1em", fontWeight: 700 }}>POSITION  x = ½gt²</div>
            <div style={{ display: "flex", gap: 6, alignItems: "baseline", fontFamily: "'Fira Code',monospace", flexWrap: "wrap" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#34d399" }}>{x.toFixed(2)}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>m</span>
              <span style={{ fontSize: 11, color: "#334155", marginLeft: 4 }}>= ½ × 9.8 × {t.toFixed(2)}²</span>
            </div>
          </div>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8, letterSpacing: "0.1em", fontWeight: 700 }}>VELOCITY  v = gt</div>
            <div style={{ display: "flex", gap: 6, alignItems: "baseline", fontFamily: "'Fira Code',monospace", flexWrap: "wrap" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#f97316" }}>{v.toFixed(2)}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>m/s</span>
              <span style={{ fontSize: 11, color: "#334155", marginLeft: 4 }}>= 9.8 × {t.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8, letterSpacing: "0.1em", fontWeight: 700 }}>TIME</div>
            <div style={{ display: "flex", gap: 6, alignItems: "baseline", fontFamily: "'Fira Code',monospace" }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#818cf8" }}>{t.toFixed(2)}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>s</span>
            </div>
          </div>

          {/* x-t mini graph */}
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6, letterSpacing: "0.1em", fontWeight: 700 }}>x–t CURVE (x ∝ t²)</div>
            <svg width={graphW} height={graphH} style={{ display: "block" }}>
              <path d={pathD} fill="none" stroke="#818cf8" strokeWidth={1.5} opacity={0.5} />
              <path d={`M0,${graphH} ${pathPoints.filter(([ti]) => ti <= t).map(([ti, xi]) => `L${px(ti).toFixed(1)},${py(xi).toFixed(1)}`).join(" ")}`} fill="none" stroke="#34d399" strokeWidth={2} />
              {t > 0 && <circle cx={dotX} cy={dotY} r={4} fill="#34d399" />}
              <text x={0} y={graphH - 2} fontSize={8} fill="#475569">0</text>
              <text x={graphW - 14} y={graphH - 2} fontSize={8} fill="#475569">3 s</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Time slider + controls */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 4 }}>
          <span>t = 0 s</span>
          <span style={{ color: "#818cf8", fontWeight: 700 }}>t = {t.toFixed(2)} s</span>
          <span>t = 3 s</span>
        </div>
        <input
          type="range" min={0} max={MAX_T} step={0.01} value={t}
          onChange={(e) => { stop(); setT(parseFloat(e.target.value)); }}
          style={{ width: "100%", marginBottom: 10, accentColor: "#818cf8" }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={playing ? stop : play}
            style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: playing ? "#334155" : "#818cf8", color: playing ? "#94a3b8" : "#0f172a" }}
          >
            {playing ? "⏸ Pause" : t >= MAX_T ? "↺ Replay" : "▶ Play"}
          </button>
          <button
            onClick={() => { stop(); setT(0); }}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #334155", cursor: "pointer", fontWeight: 700, fontSize: 13, background: "transparent", color: "#64748b" }}
          >
            ↺
          </button>
        </div>
      </div>

      <div style={{ padding: "0 20px 14px", fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
        Drag the slider or press Play. Every extra second multiplies the distance by t² — that's why free fall bends, not streaks.
      </div>
    </div>
  );
}
