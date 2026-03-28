import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  M,
  WhyPanel, 
  mkPanel as panel, 
  mkHdr as hdr, 
  mkBody as body, 
  mkInsight as insight, 
  mkBadge as badge, 
  mkHook as hook, 
  mkSeed as seed, 
  mkMbox as mbox,
  StepBlock
} from "../CalculusHelpers.jsx";

export default function Ch3_2_GettingCloser({ params = {} }) {
  const [f, setF] = useState(3);
  const [g, setG] = useState(4);
  const ready = useMath();
  const lawSteps = [
    { label: "Sum Law", tex: "\\lim[f + g] = \\lim f + \\lim g = " + f + " + " + g + " = " + (f + g), note: "Proved from ε-δ: bound |f(x)+g(x)−L−M| ≤ |f(x)−L| + |g(x)−M| < ε." },
    { label: "Product Law", tex: "\\lim[f \\cdot g] = \\lim f \\cdot \\lim g = " + f + " \\times " + g + " = " + (f * g), note: "Proved by writing f(x)g(x)−LM = f(x)(g(x)−M) + M(f(x)−L) and bounding each piece." },
    { label: "Quotient Law (g≠0)", tex: "\\lim[f / g] = \\lim f \\;/\\; \\lim g = " + f + " / " + g + " = " + (f / g).toFixed(4), note: "Requires lim g ≠ 0. If lim g = 0, the quotient law fails and the limit may not exist in the usual sense." },
    { label: "Power Law", tex: "\\lim[f^n] = (\\lim f)^n = " + f + "^2 = " + (f * f), note: "Follows from repeated application of the Product Law. lim[f²] = lim[f·f] = lim f · lim f = L²." },
  ];
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 2)}
      {hook("Albert wants to compute limits quickly, without the full ε-δ argument every time. He discovers that limits obey simple arithmetic laws — but only when both limits exist and are finite. Each law requires a proof.")}
      <div style={panel}>
        {hdr("Story", { background: "#eef2ff", color: "#3730a3" }, "Getting closer")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"If lim f = 3 and lim g = 4,"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> said, <em style={{ color: "var(--color-text-secondary)" }}>"can I just say lim(f+g) = 7?"</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> looked at him. <em style={{ color: "var(--color-text-secondary)" }}>"Can you? Or are you assuming you can?"</em></p>
          <p style={{ marginBottom: 0 }}>There was a pause. <em style={{ color: "var(--color-text-secondary)" }}>"Those are different questions,"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> said slowly. <em style={{ color: "var(--color-text-secondary)" }}>"I need to prove each law separately. Then I can use them freely."</em></p>
        </div>
      </div>
      <div style={panel}>
        {hdr("Discovery", { background: "#eef2ff", color: "#3730a3" }, "The four limit laws — each requires a proof")}
        <div style={body}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {[["lim f =", f, 1, 8, setF], ["lim g =", g, 1, 8, setG]].map(([label, val, min, max, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 52 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 16 }}>{val}</span>
              </div>
            ))}
          </div>
          {lawSteps.map((s, i) => <StepBlock key={i} num={i + 1} label={s.label} tex={s.tex} note={s.note} ready={ready} />)}
          <div style={insight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Why prove them?</strong> These laws are so convenient that students use them without thinking. But each has conditions: the Product Law requires both limits to be finite; the Quotient Law requires the denominator limit to be nonzero. The Chain Rule (Book 4) relies on the Product Law in its proof. Using a law you haven't proved is assuming the conclusion.</div>
          <WhyPanel tag="What happens when lim g = 0 in the Quotient Law?" depth={0}>
            <p style={{ marginBottom: 8 }}>The Quotient Law fails. lim[f/g] cannot be computed as (lim f)/(lim g) = L/0 — that's undefined. The limit might still exist (via L'Hôpital or algebraic manipulation), might be infinite, or might not exist. The 0/0 case is what Chapter 3.5 is about.</p>
          </WhyPanel>
        </div>
      </div>
      {seed(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> John asks what happens at a "jump" in a function — where it teleports from one value to another. Albert explains continuity and shows that some jumps make limits fail entirely. Chapter 3: <em>The Infinite Staircase.</em></>)}
    </div>
  );
}
