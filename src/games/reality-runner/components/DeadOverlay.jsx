import { Zap } from "lucide-react";
import { C } from "../lib/constants.js";

// Shown when GameScene calls `onDead({ score })` (all lives gone). `dead` is
// null until then — RealityRunner.jsx only renders this when it's set.
export default function DeadOverlay({ dead, onReset }) {
  if (!dead) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(8,14,24,0.82)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 36px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: C.sub, letterSpacing: 1, marginBottom: 6 }}>RUN OVER</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.teal, marginBottom: 18 }}>{dead.score} pts</div>
        <button
          onClick={onReset}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: C.teal, color: "#06121f", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
        >
          <Zap size={15} /> Run again
        </button>
      </div>
    </div>
  );
}
