import { useState } from "react";

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

const GATES = {
  AND:  { fn: (a, b) => a && b,  symbol: "&",   desc: "Output is 1 only when ALL inputs are 1" },
  OR:   { fn: (a, b) => a || b,  symbol: "≥1",  desc: "Output is 1 when ANY input is 1" },
  NOT:  { fn: (a)    => !a,      symbol: "1",   desc: "Output is the inverse of the input", unary: true },
  NAND: { fn: (a, b) => !(a && b), symbol: "&", desc: "NOT AND — output is 0 only when ALL inputs are 1", bubble: true },
  NOR:  { fn: (a, b) => !(a || b), symbol: "≥1", desc: "NOT OR — output is 1 only when ALL inputs are 0", bubble: true },
  XOR:  { fn: (a, b) => a !== b, symbol: "=1",  desc: "Output is 1 when inputs are DIFFERENT" },
  XNOR: { fn: (a, b) => a === b, symbol: "=1",  desc: "Output is 1 when inputs are SAME", bubble: true },
};

// ─── Gate SVG ──────────────────────────────────────────────────────────────

function GateSVG({ type, a, b, out }) {
  const gate = GATES[type];
  const unary = gate.unary;
  const W = 200, H = 120;
  const GX = 90, GY = 60, GW = 50, GH = 40;
  const wireColor = (v) => v ? T.green : T.muted;

  const inputY1 = unary ? GY : GY - 12;
  const inputY2 = GY + 12;
  const outputY = GY;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxHeight: 110 }}>
      {/* Input wires */}
      <line x1={30} y1={inputY1} x2={GX} y2={inputY1} stroke={wireColor(a)} strokeWidth={2.5} />
      {!unary && <line x1={30} y1={inputY2} x2={GX} y2={inputY2} stroke={wireColor(b)} strokeWidth={2.5} />}

      {/* Input labels */}
      <circle cx={30} cy={inputY1} r={10} fill={a ? "#052e16" : T.card} stroke={a ? T.green : T.muted} strokeWidth={1.5} />
      <text x={30} y={inputY1 + 4} textAnchor="middle" fill={a ? T.green : T.text2} fontSize={11} fontWeight={700} fontFamily={T.mono}>{a ? "1" : "0"}</text>
      <text x={12} y={inputY1 + 4} textAnchor="middle" fill={T.muted} fontSize={10} fontFamily={T.mono}>A</text>

      {!unary && (
        <>
          <circle cx={30} cy={inputY2} r={10} fill={b ? "#052e16" : T.card} stroke={b ? T.green : T.muted} strokeWidth={1.5} />
          <text x={30} y={inputY2 + 4} textAnchor="middle" fill={b ? T.green : T.text2} fontSize={11} fontWeight={700} fontFamily={T.mono}>{b ? "1" : "0"}</text>
          <text x={12} y={inputY2 + 4} textAnchor="middle" fill={T.muted} fontSize={10} fontFamily={T.mono}>B</text>
        </>
      )}

      {/* Gate body */}
      <rect x={GX} y={GY - GH / 2} width={GW} height={GH} rx={type === "AND" || type === "NAND" ? 0 : 6}
        fill={T.card} stroke={out ? T.green : T.border2} strokeWidth={2} />
      {/* Curved right side for AND/NAND */}
      {(type === "AND" || type === "NAND") && (
        <path d={`M ${GX + GW} ${GY - GH / 2} Q ${GX + GW + 16} ${GY} ${GX + GW} ${GY + GH / 2}`}
          fill={T.card} stroke={out ? T.green : T.border2} strokeWidth={2} />
      )}
      <text x={GX + GW / 2} y={GY + 4} textAnchor="middle" fill={out ? T.green : T.text2} fontSize={11} fontWeight={700} fontFamily={T.mono}>{gate.symbol}</text>
      <text x={GX + GW / 2} y={GY - GH / 2 - 5} textAnchor="middle" fill={T.muted} fontSize={9} fontFamily={T.mono}>{type}</text>

      {/* Bubble for NOT/NAND/NOR/XNOR */}
      {(gate.bubble || unary) && (
        <circle cx={GX + GW + (type === "AND" || type === "NAND" ? 14 : 0) + 8} cy={GY} r={4}
          fill={T.card} stroke={out ? T.green : T.border2} strokeWidth={1.5} />
      )}

      {/* Output wire */}
      <line
        x1={GX + GW + (gate.bubble || unary ? (type === "AND" || type === "NAND" ? 26 : 12) : 0)}
        y1={outputY}
        x2={W - 30}
        y2={outputY}
        stroke={wireColor(out)} strokeWidth={2.5}
      />

      {/* Output indicator */}
      <circle cx={W - 20} cy={outputY} r={12} fill={out ? "#052e16" : T.card} stroke={out ? T.green : T.muted} strokeWidth={2} />
      <text x={W - 20} y={outputY + 4} textAnchor="middle" fill={out ? T.green : T.text2} fontSize={12} fontWeight={700} fontFamily={T.mono}>{out ? "1" : "0"}</text>
      <text x={W - 8} y={outputY + 4} textAnchor="start" fill={T.muted} fontSize={10} fontFamily={T.mono}>Q</text>
    </svg>
  );
}

// ─── Truth Table ───────────────────────────────────────────────────────────

function TruthTable({ type }) {
  const gate = GATES[type];
  const unary = gate.unary;

  const rows = unary
    ? [[false], [true]]
    : [[false, false], [false, true], [true, false], [true, true]];

  const thStyle = { padding: "5px 12px", fontSize: 11, fontWeight: 700, color: T.accent, fontFamily: T.mono, textAlign: "center", borderBottom: `1px solid ${T.border2}` };
  const tdStyle = (v, highlight) => ({ padding: "5px 12px", fontSize: 12, fontWeight: 700, textAlign: "center", fontFamily: T.mono, color: v ? T.green : T.text2, background: highlight ? "#0c1e10" : "transparent" });

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: 8, overflow: "hidden" }}>
      <thead>
        <tr style={{ background: T.card }}>
          <th style={thStyle}>A</th>
          {!unary && <th style={thStyle}>B</th>}
          <th style={thStyle}>Q</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((inputs, i) => {
          const out = unary ? gate.fn(inputs[0]) : gate.fn(inputs[0], inputs[1]);
          return (
            <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={tdStyle(inputs[0])}>{inputs[0] ? "1" : "0"}</td>
              {!unary && <td style={tdStyle(inputs[1])}>{inputs[1] ? "1" : "0"}</td>}
              <td style={tdStyle(out, true)}>{out ? "1" : "0"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Boolean Expression Bar ────────────────────────────────────────────────

function ExpressionBar({ type, a, b }) {
  const gate = GATES[type];
  const out = gate.unary ? gate.fn(a) : gate.fn(a, b);
  const expr = {
    AND:  `Q = A · B  =  ${a ? 1 : 0} · ${b ? 1 : 0}  =  ${out ? 1 : 0}`,
    OR:   `Q = A + B  =  ${a ? 1 : 0} + ${b ? 1 : 0}  =  ${out ? 1 : 0}`,
    NOT:  `Q = Ā  =  ${a ? 1 : 0}'  =  ${out ? 1 : 0}`,
    NAND: `Q = (A · B)'  =  (${a ? 1 : 0} · ${b ? 1 : 0})'  =  ${out ? 1 : 0}`,
    NOR:  `Q = (A + B)'  =  (${a ? 1 : 0} + ${b ? 1 : 0})'  =  ${out ? 1 : 0}`,
    XOR:  `Q = A ⊕ B  =  ${a ? 1 : 0} ⊕ ${b ? 1 : 0}  =  ${out ? 1 : 0}`,
    XNOR: `Q = (A ⊕ B)'  =  (${a ? 1 : 0} ⊕ ${b ? 1 : 0})'  =  ${out ? 1 : 0}`,
  }[type];

  return (
    <div style={{ background: T.card, padding: "8px 14px", borderRadius: 6, border: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 12, color: out ? T.green : T.text2 }}>
      {expr}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function LogicGateLab({ params = {} }) {
  const [gateType, setGateType] = useState(params.gate ?? "AND");
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  const gate = GATES[gateType];
  const out = gate.unary ? gate.fn(a) : gate.fn(a, b);

  return (
    <div style={{ background: T.bg, fontFamily: T.mono, color: T.text, borderRadius: 12, overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "12px 20px", background: T.panel, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>Logic Gate Lab</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {Object.keys(GATES).map(g => (
            <button key={g} onClick={() => setGateType(g)} style={{ padding: "3px 9px", borderRadius: 5, border: `1px solid ${gateType === g ? T.accent2 : T.border2}`, background: gateType === g ? "#0c2133" : "transparent", color: gateType === g ? T.accent2 : T.muted, fontSize: 10, cursor: "pointer", fontWeight: 600 }}>{g}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 0 }}>

        {/* Gate diagram + controls */}
        <div style={{ padding: "16px 20px" }}>
          <GateSVG type={gateType} a={a} b={b} out={out} />

          {/* Input toggles */}
          <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "center" }}>
            {[
              { label: "Input A", val: a, set: setA },
              ...(!gate.unary ? [{ label: "Input B", val: b, set: setB }] : []),
            ].map(({ label, val, set }) => (
              <button key={label} onClick={() => set(v => !v)} style={{ padding: "8px 20px", borderRadius: 8, border: `2px solid ${val ? T.green : T.border2}`, background: val ? "#052e16" : T.card, color: val ? T.green : T.text2, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                {label}: <span style={{ fontFamily: T.mono }}>{val ? "1" : "0"}</span>
              </button>
            ))}
          </div>

          {/* Expression */}
          <div style={{ marginTop: 12 }}>
            <ExpressionBar type={gateType} a={a} b={b} />
          </div>

          {/* Description */}
          <div style={{ marginTop: 10, padding: "8px 12px", background: "#0c1a2e", borderRadius: 6, borderLeft: `3px solid ${T.accent2}`, fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
            <span style={{ color: T.accent2, fontWeight: 600 }}>Rule: </span>{gate.desc}
          </div>
        </div>

        {/* Truth table */}
        <div style={{ borderLeft: `1px solid ${T.border}`, padding: "16px 0" }}>
          <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 14px 8px" }}>Truth Table</div>
          <TruthTable type={gateType} />
        </div>
      </div>

      {/* PLC context bar */}
      <div style={{ padding: "8px 20px", background: T.panel, borderTop: `1px solid ${T.border}`, fontSize: 10, color: T.muted }}>
        <span style={{ color: T.accent2 }}>PLC connection: </span>
        {{
          AND: "Ladder XIC contacts in series — both must be closed for output to energize",
          OR:  "Ladder XIC contacts in parallel — either contact energizes the output",
          NOT: "Ladder XIO contact (Examine if Open) — energizes when input is OFF",
          NAND:"Series contacts with XIO output — output stays on unless all inputs are closed",
          NOR: "Parallel contacts with XIO output — output stays on only when all inputs are off",
          XOR: "One-or-the-other logic — common in selector switches and fault detection",
          XNOR:"Match detection — used to check if two states are identical",
        }[gateType]}
      </div>
    </div>
  );
}
