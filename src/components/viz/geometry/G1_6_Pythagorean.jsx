import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  M,
  WhyPanel, 
  mkPanel, 
  mkHdr, 
  mkBody, 
  mkInsight, 
  mkBadge, 
  mkHook, 
  mkSeed, 
  mkMbox 
} from "./GeometryHelpers.jsx";

function PythagorasCanvas({ proof, a, b }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const col = isDark ? "#e2e8f0" : "#1e293b";
    const scale = Math.min(W, H) / (a + b + 10) * 0.55;
    const A = a * scale, B = b * scale, C = Math.hypot(a, b) * scale;
    const ox = W / 2 - (A + B) / 2, oy = H / 2 + A / 2;

    if (proof === "rearrange") {
      // Bhaskara rearrangement: large square (a+b)², 4 triangles + c² in middle
      const sz = (A + B);
      const sx = (W - sz) / 2, sy = (H - sz) / 2;
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.strokeRect(sx, sy, sz, sz);
      // 4 triangles
      const tris = [[sx, sy + B, sx, sy + B + A, sx + A, sy + B], [sx, sy, sx + B, sy, sx, sy + B], [sx + A, sy + B + A, sx + sz, sy + B + A, sx + sz, sy + B], [sx + B, sy, sx + sz, sy, sx + sz, sy + A]];
      tris.forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath();
        ctx.fillStyle = isDark ? "rgba(79,70,229,0.3)" : "rgba(79,70,229,0.2)"; ctx.fill(); ctx.stroke();
      });
      ctx.fillStyle = isDark ? "rgba(5,150,105,0.3)" : "rgba(5,150,105,0.2)";
      ctx.beginPath(); ctx.moveTo(sx, sy + B); ctx.lineTo(sx + B, sy); ctx.lineTo(sx + sz, sy + A); ctx.lineTo(sx + A, sy + B + A); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = col; ctx.font = "12px var(--font-sans,sans-serif)"; ctx.textAlign = "center";
      ctx.fillText("c²", W / 2, H / 2 + 5);
      ctx.fillText("(a+b)² = 4·(½ab) + c²  →  a²+b² = c²", W / 2, H - 10);
    } else if (proof === "similar") {
      const ox = 80, oy = H - 50;
      const bx = ox + B * 2, by = oy, cx2 = ox + (A * A / (A + B)) * 2, cy = oy - (A * B / (A + B)) * 2;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy); ctx.closePath();
      ctx.fillStyle = isDark ? "rgba(79,70,229,0.15)" : "rgba(79,70,229,0.1)"; ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx2, cy); ctx.lineTo(cx2, oy);
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = col; ctx.font = "11px var(--font-sans,sans-serif)"; ctx.textAlign = "center";
      ctx.fillText("Similar triangles: a/c = p/a  →  a²=cp, b²=cq, a²+b²=c(p+q)=c²", W / 2, H - 10);
    }
  }, [proof, a, b]);
  return <canvas ref={ref} width={520} height={240} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

export default function G1_6_Pythagorean({ params = {} }) {
  const [proof, setProof] = useState("rearrange");
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const ready = useMath();
  const c = Math.hypot(a, b);

  const proofs = {
    rearrange: { name: "Bhaskara's rearrangement", desc: "Arrange four copies of the right triangle inside a big square (a+b)². The remaining shape is a square of side c. Area equation: (a+b)² = 4·(½ab) + c². Expand: a²+2ab+b² = 2ab+c². Subtract 2ab: a²+b² = c²." },
    similar: { name: "Similar triangles (Euclid's proof)", desc: "Drop an altitude from the right angle to the hypotenuse. This creates two smaller triangles, both similar to the original. From the similarity ratios: a²=cp and b²=cq where p+q=c. Adding: a²+b² = c(p+q) = c²." },
    area: { name: "Area proof (president Garfield's version)", desc: "Arrange two right triangles and one isoceles right triangle into a trapezoid. Compute the trapezoid area two ways (formula vs. three triangles). Equating gives a²+b² = c²." },
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {mkBadge(6)}
      {mkHook("Albert wants to prove the Pythagorean theorem — not just once, but three different ways. Each proof uses a different insight: rearrangement, similar triangles, area. They all give the same formula, but show completely different reasons why it's true.")}
      <div style={mkPanel}>
        {mkHdr("Story", { background: "#ede9fe", color: "#4f46e5" }, "The Pythagorean theorem — three proofs")}
        <div style={{ ...mkBody, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"There are over 370 known proofs of this theorem,"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> said. <em style={{ color: "var(--color-text-secondary)" }}>"A US president proved it in 1876. An Indian mathematician proved it in the 12th century. Euclid proved it in 300 BC. Three different methods, three different insights, one theorem."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> looked up. <em style={{ color: "var(--color-text-secondary)" }}>"Why would you prove the same thing multiple ways?"</em> <em style={{ color: "var(--color-text-secondary)" }}>"Because each proof reveals a different aspect of why it's true. The theorem is the same. The understanding is different."</em></p>
        </div>
      </div>
      <div style={mkPanel}>
        {mkHdr("Discovery", { background: "#ede9fe", color: "#4f46e5" }, "a² + b² = c² — proved three ways")}
        <div style={mkBody}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {Object.entries(proofs).map(([key, val]) => (
              <button key={key} onClick={() => setProof(key)} style={{ flex: 1, minWidth: 120, padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", border: `1px solid ${key === proof ? "#4f46e5" : "var(--color-border-tertiary)"}`, background: key === proof ? "#ede9fe" : "transparent", color: key === proof ? "#3730a3" : "var(--color-text-secondary)" }}>{val.name}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {[["a", a, 1, 8, setA], ["b", b, 1, 8, setB]].map(([label, val, min, max, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 14 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 16 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 12 }}><PythagorasCanvas proof={proof} a={a} b={b} /></div>
          {ready && <div style={mkMbox}><M t={`a^2 + b^2 = c^2 \\implies ${a}^2 + ${b}^2 = ${a*a} + ${b*b} = ${a*a+b*b} = c^2 \\implies c = ${c.toFixed(3)}`} display ready={ready} /></div>}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#4f46e5", marginBottom: 5 }}>{proofs[proof].name}</div>
            <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.65 }}>{proofs[proof].desc}</p>
          </div>
          <div style={mkInsight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Why three proofs matter:</strong> Rearrangement shows Pythagoras is about area. Similar triangles show it's about ratios. The area proof shows it's about trapezoids. Each is a completely independent logical path. Having multiple proofs is the gold standard of mathematical confidence — if one approach has a flaw, the others stand.</div>
          <WhyPanel tag="Where does Pythagoras appear in the rest of this curriculum?" depth={0}>
            <p style={{ marginBottom: 8 }}>Distance formula (G3.1): √((x₂−x₁)²+(y₂−y₁)²) is Pythagoras in coordinates. Circle equation (G3.3): x²+y²=r² is Pythagoras at every point on the circle. Law of Cosines (Book 2, Ch 2.2): a²+b²−2ab·cosC=c² is Pythagoras with a correction for non-right angles. Sphere volume/surface (G4.3): cross-sections use Pythagoras to find radius at height h.</p>
            <p>Pythagoras is the most-used theorem in all of mathematics. It appears in every branch: analysis, number theory, topology, physics, engineering, computer graphics.</p>
          </WhyPanel>
        </div>
      </div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #059669", borderRadius: "0 0 10px 10px", padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#059669" }}>Book G1 complete.</strong> Points, lines, angles, triangles — the foundations of Euclidean geometry, all proved from five postulates. In Book G2, Albert builds a sundial and discovers that circles have their own set of remarkable theorems — each one hiding in plain sight.
      </div>
    </div>
  );
}
