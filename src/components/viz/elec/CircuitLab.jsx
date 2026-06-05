import { useState, useEffect, useRef, useCallback } from "react";

const T = {
  bg: "#070d14",
  panel: "#0d1520",
  card: "#111c2a",
  border: "#1e2d3d",
  border2: "#253545",
  accent: "#f59e0b",
  accent2: "#0ea5e9",
  green: "#10b981",
  red: "#ef4444",
  muted: "#64748b",
  text: "#e2e8f0",
  text2: "#94a3b8",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// Circuit element colors
const WIRE_COLOR = "#1e3a5f";
const WIRE_ACTIVE = "#0ea5e9";
const CURRENT_DOT = "#38bdf8";

// ─── Circuit path waypoints (pixel coords in 400×280 SVG) ─────────────────
const W = 400, H = 280;
const BATT_X = 80, BATT_Y1 = 80, BATT_Y2 = 200; // battery terminals
const CIRCUIT_PATH = [
  [BATT_X, BATT_Y1],        // 0 battery + terminal
  [160, BATT_Y1],            // 1 to resistor
  [220, BATT_Y1],            // 2 through resistor
  [300, BATT_Y1],            // 3 to LED
  [340, BATT_Y1],            // 4 through LED
  [340, BATT_Y2],            // 5 corner
  [BATT_X, BATT_Y2],        // 6 back to battery
];

function pathLength(pts) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

function pointAtFrac(pts, frac) {
  const total = pathLength(pts);
  let target = frac * total;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    const seg = Math.sqrt(dx * dx + dy * dy);
    if (target <= seg) {
      return [pts[i - 1][0] + (dx / seg) * target, pts[i - 1][1] + (dy / seg) * target];
    }
    target -= seg;
  }
  return pts[pts.length - 1];
}

// ─── SVG Components ────────────────────────────────────────────────────────

function Battery({ x, y1, y2, voltage }) {
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={mid - 18} stroke={WIRE_ACTIVE} strokeWidth={2} />
      <line x1={x} y1={mid + 18} x2={x} y2={y2} stroke={WIRE_ACTIVE} strokeWidth={2} />
      {/* Battery cells */}
      <line x1={x - 14} y1={mid - 18} x2={x + 14} y2={mid - 18} stroke={WIRE_ACTIVE} strokeWidth={3} />
      <line x1={x - 8} y1={mid - 10} x2={x + 8} y2={mid - 10} stroke={WIRE_ACTIVE} strokeWidth={1.5} />
      <line x1={x - 14} y1={mid - 2} x2={x + 14} y2={mid - 2} stroke={WIRE_ACTIVE} strokeWidth={3} />
      <line x1={x - 8} y1={mid + 6} x2={x + 8} y2={mid + 6} stroke={WIRE_ACTIVE} strokeWidth={1.5} />
      <line x1={x - 14} y1={mid + 14} x2={x + 14} y2={mid + 14} stroke={WIRE_ACTIVE} strokeWidth={3} />
      {/* Labels */}
      <text x={x + 20} y={mid - 12} fill={T.accent} fontSize={11} fontWeight={700} fontFamily={T.mono}>+</text>
      <text x={x + 20} y={mid + 20} fill={T.muted} fontSize={11} fontWeight={700} fontFamily={T.mono}>−</text>
      <text x={x} y={y2 + 18} fill={T.text2} fontSize={10} textAnchor="middle" fontFamily={T.mono}>{voltage}V</text>
    </g>
  );
}

function Resistor({ x1, y, x2, resistance }) {
  const mx = (x1 + x2) / 2;
  const hw = 22, hh = 8;
  return (
    <g>
      <line x1={x1} y1={y} x2={mx - hw} y2={y} stroke={WIRE_ACTIVE} strokeWidth={2} />
      <rect x={mx - hw} y={y - hh} width={hw * 2} height={hh * 2} fill={T.card} stroke={T.accent} strokeWidth={1.5} rx={2} />
      {/* Zigzag inside */}
      {[-14, -8, -2, 4, 10].map((dx, i) => (
        <line key={i} x1={mx + dx} y1={i % 2 === 0 ? y - 5 : y + 5} x2={mx + dx + 6} y2={i % 2 === 0 ? y + 5 : y - 5} stroke={T.accent} strokeWidth={1} />
      ))}
      <line x1={mx + hw} y1={y} x2={x2} y2={y} stroke={WIRE_ACTIVE} strokeWidth={2} />
      <text x={mx} y={y - 14} fill={T.accent} fontSize={10} textAnchor="middle" fontFamily={T.mono}>{resistance >= 1000 ? `${(resistance / 1000).toFixed(1)}kΩ` : `${resistance}Ω`}</text>
    </g>
  );
}

function LED({ x1, y, x2, brightness }) {
  const mx = (x1 + x2) / 2;
  const r = 10;
  const glow = Math.min(brightness, 1);
  const ledColor = glow < 0.1 ? "#1a2530" : `rgba(251,191,36,${0.3 + glow * 0.7})`;
  const glowRadius = 8 + glow * 18;

  return (
    <g>
      <line x1={x1} y1={y} x2={mx - r} y2={y} stroke={WIRE_ACTIVE} strokeWidth={2} />
      {glow > 0.05 && (
        <circle cx={mx} cy={y} r={glowRadius} fill={`rgba(251,191,36,${glow * 0.15})`} />
      )}
      {/* Triangle body */}
      <polygon points={`${mx - r},${y - r} ${mx - r},${y + r} ${mx + r * 0.5},${y}`} fill={ledColor} stroke={T.accent} strokeWidth={1.5} />
      {/* Cathode bar */}
      <line x1={mx + r * 0.5} y1={y - r} x2={mx + r * 0.5} y2={y + r} stroke={T.accent} strokeWidth={2} />
      {/* Emission arrows */}
      {glow > 0.2 && [
        { dx: 6, dy: -8, angle: -40 },
        { dx: 10, dy: -4, angle: -20 },
      ].map((a, i) => (
        <line key={i} x1={mx + r + a.dx - 2} y1={y - 4} x2={mx + r + a.dx + 4} y2={y + a.dy} stroke={`rgba(251,191,36,${glow * 0.8})`} strokeWidth={1.2} />
      ))}
      <line x1={mx + r * 0.5} y1={y} x2={x2} y2={y} stroke={WIRE_ACTIVE} strokeWidth={2} />
      <text x={mx} y={y + 22} fill={T.text2} fontSize={10} textAnchor="middle" fontFamily={T.mono}>LED</text>
    </g>
  );
}

function OpenSwitch({ x, y }) {
  return (
    <g>
      <circle cx={x - 8} cy={y} r={3} fill={T.muted} />
      <circle cx={x + 8} cy={y} r={3} fill={T.muted} />
      <line x1={x - 8} y1={y} x2={x + 5} y2={y - 12} stroke={T.muted} strokeWidth={1.5} />
      <text x={x} y={y + 16} fill={T.muted} fontSize={9} textAnchor="middle" fontFamily={T.mono}>open</text>
    </g>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

const MODES = ["Series", "Parallel", "Open Circuit"];

export default function CircuitLab({ params = {} }) {
  const [voltage, setVoltage] = useState(params.voltage ?? 12);
  const [resistance, setResistance] = useState(params.resistance ?? 100);
  const [mode, setMode] = useState("Series");
  const [dots, setDots] = useState(() => Array.from({ length: 8 }, (_, i) => i / 8));
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const current = mode === "Open Circuit" ? 0 : voltage / resistance;
  const power = voltage * current;
  const brightness = Math.min(current / 0.3, 1);

  const animate = useCallback((ts) => {
    if (lastRef.current == null) lastRef.current = ts;
    const dt = Math.min((ts - lastRef.current) / 1000, 0.05);
    lastRef.current = ts;

    const speed = mode === "Open Circuit" ? 0 : Math.min(current / 0.24, 1) * 0.12 + 0.02;
    setDots(prev => prev.map(d => (d + speed * dt) % 1));
    rafRef.current = requestAnimationFrame(animate);
  }, [current, mode]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  const dotColor = mode === "Open Circuit" ? "#1e3a5f" : CURRENT_DOT;
  const activeSpeed = mode === "Open Circuit" ? 0 : Math.min(current / 0.3, 1);

  return (
    <div style={{ background: T.bg, fontFamily: T.mono, color: T.text, borderRadius: 12, overflow: "hidden", userSelect: "none" }}>

      {/* Header */}
      <div style={{ padding: "12px 20px", background: T.panel, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>Circuit Lab</span>
        <div style={{ display: "flex", gap: 6 }}>
          {MODES.map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ padding: "3px 10px", borderRadius: 5, border: `1px solid ${mode === m ? T.accent2 : T.border2}`, background: mode === m ? "#0c2133" : "transparent", color: mode === m ? T.accent2 : T.muted, fontSize: 10, cursor: "pointer", fontWeight: 600 }}>{m}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 0 }}>

        {/* Circuit SVG */}
        <div style={{ padding: 16 }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxHeight: 240 }}>
            {/* Background grid */}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`v${i}`} x1={40 + i * 40} y1={20} x2={40 + i * 40} y2={H - 20} stroke="#0d1a27" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <line key={`h${i}`} x1={20} y1={30 + i * 40} x2={W - 20} y2={30 + i * 40} stroke="#0d1a27" strokeWidth={0.5} />
            ))}

            {/* Wires */}
            {/* Top wire: battery+ → resistor */}
            <line x1={CIRCUIT_PATH[0][0]} y1={CIRCUIT_PATH[0][1]} x2={CIRCUIT_PATH[1][0]} y2={CIRCUIT_PATH[1][1]} stroke={mode === "Open Circuit" ? WIRE_COLOR : WIRE_ACTIVE} strokeWidth={2} />
            {/* Resistor handled by component */}
            {/* Wire: resistor → LED */}
            <line x1={CIRCUIT_PATH[2][0]} y1={CIRCUIT_PATH[2][1]} x2={CIRCUIT_PATH[3][0]} y2={CIRCUIT_PATH[3][1]} stroke={mode === "Open Circuit" ? WIRE_COLOR : WIRE_ACTIVE} strokeWidth={2} />
            {/* LED handled by component */}
            {/* Right vertical wire */}
            <line x1={CIRCUIT_PATH[4][0]} y1={CIRCUIT_PATH[4][1]} x2={CIRCUIT_PATH[5][0]} y2={CIRCUIT_PATH[5][1]} stroke={mode === "Open Circuit" ? WIRE_COLOR : WIRE_ACTIVE} strokeWidth={2} />
            {/* Bottom wire: right corner → battery− */}
            <line x1={CIRCUIT_PATH[5][0]} y1={CIRCUIT_PATH[5][1]} x2={CIRCUIT_PATH[6][0]} y2={CIRCUIT_PATH[6][1]} stroke={mode === "Open Circuit" ? WIRE_COLOR : WIRE_ACTIVE} strokeWidth={2} />

            {/* Circuit elements */}
            <Battery x={BATT_X} y1={BATT_Y1} y2={BATT_Y2} voltage={voltage} />
            <Resistor x1={CIRCUIT_PATH[1][0]} y={BATT_Y1} x2={CIRCUIT_PATH[2][0]} resistance={resistance} />
            {mode === "Open Circuit"
              ? <OpenSwitch x={310} y={BATT_Y1} />
              : <LED x1={CIRCUIT_PATH[3][0]} y={BATT_Y1} x2={CIRCUIT_PATH[4][0]} brightness={brightness} />
            }

            {/* Animated current dots */}
            {mode !== "Open Circuit" && dots.map((frac, i) => {
              const [cx, cy] = pointAtFrac(CIRCUIT_PATH, frac);
              return (
                <circle key={i} cx={cx} cy={cy} r={3.5} fill={dotColor} opacity={0.85 * activeSpeed + 0.15}>
                  {activeSpeed > 0.1 && <animate attributeName="r" values="3;4;3" dur="1s" repeatCount="indefinite" />}
                </circle>
              );
            })}

            {/* Current direction arrow hint */}
            {mode !== "Open Circuit" && current > 0.01 && (
              <text x={340} y={BATT_Y1 - 10} fill={T.accent2} fontSize={9} textAnchor="middle" fontFamily={T.mono} opacity={0.7}>→</text>
            )}
          </svg>
        </div>

        {/* Controls & Readouts */}
        <div style={{ padding: "16px 14px", borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Voltage slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Voltage</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>{voltage}V</span>
            </div>
            <input type="range" min={1} max={24} value={voltage} onChange={e => setVoltage(+e.target.value)}
              style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.muted, marginTop: 2 }}>
              <span>1V</span><span>24V</span>
            </div>
          </div>

          {/* Resistance slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Resistance</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>{resistance >= 1000 ? `${(resistance / 1000).toFixed(1)}kΩ` : `${resistance}Ω`}</span>
            </div>
            <input type="range" min={10} max={1000} step={10} value={resistance} onChange={e => setResistance(+e.target.value)}
              style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.muted, marginTop: 2 }}>
              <span>10Ω</span><span>1kΩ</span>
            </div>
          </div>

          {/* Readouts */}
          <div style={{ background: T.card, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Ohm's Law</div>
            {[
              { label: "V = IR", value: `${voltage} V`, color: T.accent },
              { label: "I = V/R", value: mode === "Open Circuit" ? "0 A" : current >= 1 ? `${current.toFixed(2)} A` : `${(current * 1000).toFixed(1)} mA`, color: T.accent2 },
              { label: "P = IV", value: mode === "Open Circuit" ? "0 W" : power >= 1 ? `${power.toFixed(2)} W` : `${(power * 1000).toFixed(0)} mW`, color: T.green },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: T.muted, fontFamily: T.mono }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: T.mono }}>{value}</span>
              </div>
            ))}
          </div>

          {/* LED brightness indicator */}
          <div style={{ background: T.card, borderRadius: 8, padding: "8px 12px", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>LED Brightness</div>
            <div style={{ height: 8, background: "#0d1520", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${brightness * 100}%`, background: `linear-gradient(90deg, #78350f, #f59e0b)`, borderRadius: 4, transition: "width 0.2s" }} />
            </div>
            <div style={{ fontSize: 10, color: brightness > 0.7 ? T.accent : T.muted, marginTop: 4, textAlign: "right" }}>
              {mode === "Open Circuit" ? "OFF" : brightness < 0.05 ? "Very Dim" : brightness < 0.3 ? "Dim" : brightness < 0.7 ? "Medium" : "Bright"}
            </div>
          </div>

        </div>
      </div>

      {/* Formula bar */}
      <div style={{ padding: "8px 20px", background: T.panel, borderTop: `1px solid ${T.border}`, display: "flex", gap: 24, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: T.muted }}>Ohm's Law:</span>
        {[
          { f: "V = I × R", active: true },
          { f: `${voltage} = ${mode === "Open Circuit" ? "0" : current.toFixed(3)} × ${resistance}`, active: false },
        ].map(({ f, active }, i) => (
          <span key={i} style={{ fontFamily: T.mono, fontSize: 11, color: active ? T.text : T.accent, fontWeight: active ? 400 : 700 }}>{f}</span>
        ))}
        {mode !== "Open Circuit" && (
          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 11, color: T.green }}>P = {power >= 1 ? `${power.toFixed(2)}W` : `${(power * 1000).toFixed(0)}mW`}</span>
        )}
      </div>
    </div>
  );
}
