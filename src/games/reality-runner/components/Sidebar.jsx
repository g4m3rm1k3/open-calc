import { ArrowLeft, Lock, RotateCcw, Unlock } from "lucide-react";
import { C, fmt } from "../lib/constants.js";

// Physics sliders shown in the sidebar. BASE_SLIDERS are always visible;
// UNLOCKED_SLIDERS appear once their matching ability has been picked up —
// keyed to match `abilities` state in RealityRunner.jsx (superJump, crush).
const BASE_SLIDERS = [
  { key: "gravity", label: "Gravity", min: 300, max: 1600, step: 25, eq: "F = mg" },
  { key: "jumpSpeed", label: "Jump Speed", min: 250, max: 800, step: 10, eq: "v₀ = √(2gh)" },
];
const UNLOCKED_SLIDERS = {
  superJump: { key: "controlGain", label: "Control Gain", min: 0.3, max: 2.6, step: 0.1, eq: "a = F/m" },
  crush: { key: "elasticity", label: "Elasticity", min: 0.15, max: 1.0, step: 0.05, eq: "e = v₂/v₁" },
};

export default function Sidebar({ onClose, score, energy, msg, params, onParamChange, abilities, onReset, isTouch }) {
  const energyColor = energy > 60 ? C.green : energy > 25 ? C.yellow : C.red;
  const visibleSliders = [
    ...BASE_SLIDERS,
    ...(abilities.superJump ? [UNLOCKED_SLIDERS.superJump] : []),
    ...(abilities.crush ? [UNLOCKED_SLIDERS.crush] : []),
  ];

  return (
    <div style={{ width: 240, background: C.panel, borderRight: `1px solid ${C.border}`, padding: "14px 14px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.sub, fontSize: 13 }}>
        {onClose ? (
          <button onClick={onClose} title="Close" style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.sub, cursor: "pointer", padding: 0, fontSize: 13, fontFamily: "inherit" }}>
            <ArrowLeft size={14} /> Close
          </button>
        ) : (
          <><ArrowLeft size={14} /><span>Reality Runner</span></>
        )}
      </div>
      <div style={{ fontSize: 11, color: C.sub }}>Physics Sandbox · Side-scroll</div>

      <div style={{ background: C.bg, borderRadius: 10, padding: "10px 12px", fontSize: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: C.sub }}>Score</span>
          <span style={{ color: C.teal, fontWeight: 700 }}>{score}</span>
        </div>
        <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>Energy</div>
        <div style={{ background: C.border, borderRadius: 5, height: 9 }}>
          <div style={{ width: `${energy}%`, height: "100%", background: energyColor, borderRadius: 5, transition: "width 0.2s" }} />
        </div>
      </div>

      {msg && (
        <div style={{ background: "#142840", border: `1px solid ${C.teal}55`, borderRadius: 8, padding: "8px 10px", fontSize: 11.5, color: C.teal, lineHeight: 1.5 }}>
          {msg}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleSliders.map(({ key, label, min, max, step, eq }) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
              <span style={{ color: C.sub }}>{label}</span>
              <span style={{ color: C.teal }}>{fmt(params[key], 2)}</span>
            </div>
            <div style={{ fontSize: 10, color: "#5b7290" }}>{eq}</div>
            <input
              type="range" min={min} max={max} step={step} value={params[key]}
              onChange={(e) => onParamChange(key, parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: C.teal }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 11, color: C.sub }}>Abilities</div>
        {[
          { key: "superJump", label: "Power Jump (J)" },
          { key: "crush", label: "Ground Pound (K)" },
        ].map((a) => (
          <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: abilities[a.key] ? C.green : C.sub, padding: "5px 8px", borderRadius: 7, border: `1px solid ${abilities[a.key] ? C.green + "55" : C.border}` }}>
            {abilities[a.key] ? <Unlock size={13} /> : <Lock size={13} />}
            {a.label}
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "auto", padding: "9px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, cursor: "pointer", fontSize: 12.5 }}
      >
        <RotateCcw size={13} /> Reset run
      </button>

      <div style={{ fontSize: 10.5, color: "#5b7290", lineHeight: 1.6 }}>
        {isTouch ? (
          <>On-screen pad — move<br />Jump button — jump<br />Ability buttons appear once unlocked<br />Flipper buttons appear in pinball chambers</>
        ) : (
          <>←/→ or A/D — move<br />Space / Up / W — jump<br />J — power jump (unlocked)<br />K — ground pound (unlocked)<br />Z / X — pinball flippers</>
        )}
      </div>
    </div>
  );
}
