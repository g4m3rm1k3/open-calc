/**
 * ProductRuleChainTrap.jsx
 * src/components/viz/react/ProductRuleChainTrap.jsx
 *
 * Dedicated lesson for the most common combined-rules mistake:
 * applying chain rule AFTER product rule instead of INSIDE IT.
 *
 * Structure (four sections, all expandable):
 *   1. The Trap — shows the wrong working explicitly with annotations
 *   2. The Shopping List — the mental model that prevents the trap
 *   3. The Tree — visual parse tree showing inline vs re-derived
 *   4. The Right Way — correct worked example with live comparison
 *
 * Problems covered: x·(6x+6)⁻³, x²·sin(x³), eˣ·√(x²+1)
 *
 * Adopts ImplicitDiffProof standard: WhyPanel nesting, numeric checks,
 * semantic colour coding, dependency chain.
 */

import { useMemo, useState } from "react";
import katex from "katex";

function M({ t, display = false }) {
  const html = useMemo(() => {
    if (!t) return "";
    try {
      return katex.renderToString(t, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch {
      return `<span>${String(t)}</span>`;
    }
  }, [t, display]);

  if (!t) return null;
  return <span style={{ display: display ? "block" : "inline" }} dangerouslySetInnerHTML={{ __html: html }} />;
}

const DS = [
  { border: "#6366f1", bg: "#eef2ff", text: "#4338ca", panelBg: "var(--color-background-secondary)" },
  { border: "#0891b2", bg: "#ecfeff", text: "#0e7490", panelBg: "var(--color-background-primary)" },
  { border: "#059669", bg: "#ecfdf5", text: "#047857", panelBg: "var(--color-background-secondary)" },
];
const DL = ["Why?", "But why?", "Prove it"];

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DS[Math.min(depth, DS.length - 1)];
  const lbl = why.tag || DL[Math.min(depth, DL.length - 1)];
  return (
    <div style={{ marginLeft: depth * 12, marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? d.bg : "transparent", border: `1px solid ${d.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 500, color: d.border, cursor: "pointer" }}>
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: d.border, color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{open ? "−" : "?"}</span>
        {open ? "Close" : lbl}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: "12px 14px", background: d.panelBg, border: `0.5px solid ${d.border}22`, borderLeft: `3px solid ${d.border}`, borderRadius: "0 8px 8px 0", animation: "sd .16s ease-out" }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, marginBottom: 8, display: "inline-block", background: d.bg, color: d.text }}>{lbl}</span>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-primary)", marginBottom: why.math || why.steps ? 10 : 0 }}>{why.explanation}</p>
          {why.math && <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "10px 14px", textAlign: "center", overflowX: "auto", marginBottom: 6 }}><M t={why.math} display ready={ready} /></div>}
          {why.steps && <div style={{ marginTop: 8 }}>{why.steps.map((st, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: "50%", background: d.border, color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--color-text-primary)", marginBottom: st.math ? 4 : 0 }}>{st.text}</p>
                {st.math && <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "6px 10px", textAlign: "center", overflowX: "auto", marginTop: 3 }}><M t={st.math} display ready={ready} /></div>}
              </div>
            </div>
          ))}</div>}
          {why.why && <WhyPanel why={why.why} depth={depth + 1} ready={ready} />}
        </div>
      )}
    </div>
  );
}

// ── Problem data ─────────────────────────────────────────────────────────────
const PROBLEMS = [
  {
    label: "x·(6x+6)⁻³",
    expression: "x \\cdot (6x+6)^{-3}",
    u: "x", v: "(6x+6)^{-3}",
    uPrime: "1",
    vPrimeWrong: "-3(6x+6)^{-4}",   // missing the inner ×6
    vPrimeRight: "-18(6x+6)^{-4}",  // correct: ×6 from chain rule
    vPrimeChain: { outer: "-3(6x+6)^{-4}", inner: "\\times 6" },
    wrongAnswer: "(6x+6)^{-3} + x \\cdot (-3)(6x+6)^{-4}",
    rightAnswer: "(6x+6)^{-3} + x \\cdot (-18)(6x+6)^{-4}",
    rightFactored: "(6x+6)^{-4}\\bigl[(6x+6) - 18x\\bigr] = \\frac{6-12x}{(6x+6)^4}",
    numCheck: {
      x: 0,
      wrong: "At x=0: (6)⁻³ + 0·(−3)(6)⁻⁴ = 1/216 ≈ 0.00463",
      right: "At x=0: (6)⁻³ + 0·(−18)(6)⁻⁴ = 1/216 ≈ 0.00463",
      note: "Both give same value at x=0 because the x term vanishes. Try x=1:",
      wrongX1: "At x=1: (12)⁻³ + 1·(−3)(12)⁻⁴ = 1/1728 − 3/20736 ≈ 0.000434",
      rightX1: "At x=1: (12)⁻³ + 1·(−18)(12)⁻⁴ = 1/1728 − 18/20736 ≈ 0.000289",
      numerical: "Numerical limit ≈ 0.000289 ✓ (confirms right answer)",
    },
  },
  {
    label: "x²·sin(x³)",
    expression: "x^2 \\cdot \\sin(x^3)",
    u: "x^2", v: "\\sin(x^3)",
    uPrime: "2x",
    vPrimeWrong: "\\cos(x^3)",        // missing ×3x²
    vPrimeRight: "\\cos(x^3) \\cdot 3x^2",
    vPrimeChain: { outer: "\\cos(x^3)", inner: "\\times 3x^2" },
    wrongAnswer: "2x\\sin(x^3) + x^2\\cos(x^3)",
    rightAnswer: "2x\\sin(x^3) + x^2 \\cdot \\cos(x^3) \\cdot 3x^2",
    rightFactored: "2x\\sin(x^3) + 3x^4\\cos(x^3)",
    numCheck: {
      x: 1,
      wrongX1: "At x=1: 2sin(1)+1·cos(1) = 2(0.841)+0.540 = 2.222",
      rightX1: "At x=1: 2sin(1)+3·1·cos(1) = 2(0.841)+3(0.540) = 3.302",
      numerical: "Numerical limit at x=1 ≈ 3.302 ✓ (confirms right answer)",
    },
  },
  {
    label: "eˣ·√(x²+1)",
    expression: "e^x \\cdot \\sqrt{x^2+1}",
    u: "e^x", v: "(x^2+1)^{1/2}",
    uPrime: "e^x",
    vPrimeWrong: "\\tfrac{1}{2}(x^2+1)^{-1/2}",   // missing ×2x
    vPrimeRight: "\\tfrac{x}{\\sqrt{x^2+1}}",
    vPrimeChain: { outer: "\\tfrac{1}{2}(x^2+1)^{-1/2}", inner: "\\times 2x" },
    wrongAnswer: "e^x\\sqrt{x^2+1} + e^x \\cdot \\tfrac{1}{2}(x^2+1)^{-1/2}",
    rightAnswer: "e^x\\sqrt{x^2+1} + e^x \\cdot \\tfrac{x}{\\sqrt{x^2+1}}",
    rightFactored: "\\frac{e^x}{\\sqrt{x^2+1}}\\bigl(x^2+1+x\\bigr) = \\frac{e^x(x^2+x+1)}{\\sqrt{x^2+1}}",
    numCheck: {
      x: 0,
      wrongX1: "At x=0: e⁰·1 + e⁰·½(1)⁻¹/² = 1 + 0.5 = 1.5",
      rightX1: "At x=0: e⁰·1 + e⁰·0/1 = 1 + 0 = 1.0",
      numerical: "Numerical limit at x=0 ≈ 1.0 ✓ (confirms right answer — wrong gives 1.5)",
    },
  },
];

// ── Parse tree data ───────────────────────────────────────────────────────────
function ParseTree({ problem, ready }) {
  const c = {
    root:  "#7F77DD",
    prod:  "#7F77DD",
    left:  "#38bdf8",
    right: "#f472b6",
    chain: "#34d399",
    wrong: "#ef4444",
    bg:    "var(--color-background-secondary)",
    border:"var(--color-border-tertiary)",
  };

  const box = (label, color, width = 140) => ({
    label, color, width,
    style: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${color}`, background: color + "22", fontSize: 13, fontWeight: 500, color, minWidth: width, textAlign: "center", whiteSpace: "nowrap" }
  });

  return (
    <div style={{ padding: "12px 0" }}>
      {/* Level 0: Root */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
        <div style={{ ...box("PRODUCT RULE", c.root, 180).style, fontSize: 14 }}>
          d/dx[u·v]
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
        <div style={{ width: 1, height: 20, background: c.border }} />
      </div>

      {/* Level 1: Blueprint */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
        <div style={{ ...box("u′·v", c.left).style }}>
          <span style={{ color: c.left }}><M t={"u' \\cdot v"} ready={ready} /></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "var(--color-text-secondary)", padding: "0 4px" }}>+</div>
        <div style={{ ...box("u·v′", c.right).style }}>
          <span style={{ color: c.right }}><M t={"u \\cdot v'"} ready={ready} /></span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 80, marginBottom: 4 }}>
        <div style={{ width: 1, height: 20, background: c.border }} />
        <div style={{ width: 1, height: 20, background: c.border }} />
      </div>

      {/* Level 2: Get the ingredients */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", maxWidth: 160 }}>
          <div style={{ ...box(null, c.left, 150).style, flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>u = </div>
            <M t={problem.u} ready={ready} />
            <div style={{ borderTop: `1px solid ${c.left}44`, width: "100%", margin: "4px 0" }} />
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>u′ = direct rule</div>
            <M t={problem.uPrime} ready={ready} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: "0 4px", color: "var(--color-text-tertiary)", fontSize: 18 }}>vs</div>

        <div style={{ textAlign: "center", maxWidth: 200 }}>
          <div style={{ ...box(null, c.right, 190).style, flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>v = </div>
            <M t={problem.v} ready={ready} />
            <div style={{ borderTop: `1px solid ${c.right}44`, width: "100%", margin: "4px 0" }} />
            <div style={{ fontSize: 11, color: c.chain, fontWeight: 600 }}>v′ = chain rule INLINE</div>
            <div style={{ fontSize: 11, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ color: c.right }}><M t={problem.vPrimeChain.outer} ready={ready} /></span>
              <span style={{ color: c.chain, fontWeight: 700 }}><M t={problem.vPrimeChain.inner} ready={ready} /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Level 3: Wrong vs right */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        <div style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 8, background: "#FCEBEB", border: "1.5px solid #ef4444" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#791F1F", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>
            The trap — missing chain ×
          </div>
          <div style={{ fontSize: 12, color: "#501313", marginBottom: 6 }}>
            v′ written as outer only — forgot to multiply by inner derivative:
          </div>
          <M t={"v' = " + problem.vPrimeWrong + " \\quad \\color{red}{\\times}"} display ready={ready} />
        </div>
        <div style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 8, background: "#E1F5EE", border: "1.5px solid #1D9E75" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#085041", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Correct — chain rule inline
          </div>
          <div style={{ fontSize: 12, color: "#0F6E56", marginBottom: 6 }}>
            v′ computed with full chain rule before plugging in:
          </div>
          <M t={"v' = " + problem.vPrimeRight + " \\quad \\color{green}{\\checkmark}"} display ready={ready} />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductRuleChainTrap({ params = {} }) {
  const ready = true;
  const [section, setSection] = useState("trap");
  const [probIdx, setProbIdx] = useState(0);
  const [showWrong, setShowWrong] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const p = PROBLEMS[probIdx];

  const resetProblem = (i) => {
    setProbIdx(i);
    setShowWrong(false);
    setShowRight(false);
    setShowCheck(false);
  };

  const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };
  const sectionBtn = (key, label, color) => ({
    padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: section === key ? 500 : 400,
    border: `0.5px solid ${section === key ? color : "var(--color-border-secondary)"}`,
    background: section === key ? color + "22" : "transparent",
    color: section === key ? color : "var(--color-text-secondary)",
  });

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Section tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        <button onClick={() => setSection("trap")} style={sectionBtn("trap", "The trap", "#ef4444")}>The trap</button>
        <button onClick={() => setSection("list")} style={sectionBtn("list", "Shopping list", "#7F77DD")}>Shopping list analogy</button>
        <button onClick={() => setSection("tree")} style={sectionBtn("tree", "Parse tree", "#1D9E75")}>Parse tree</button>
        <button onClick={() => setSection("compare")} style={sectionBtn("compare", "Right vs wrong", "#BA7517")}>Right vs wrong — side by side</button>
      </div>

      {/* Problem selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {PROBLEMS.map((pr, i) => (
          <button key={i} onClick={() => resetProblem(i)} style={{ padding: "4px 12px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === probIdx ? 600 : 400, border: `0.5px solid ${i === probIdx ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === probIdx ? "var(--color-background-info)" : "transparent", color: i === probIdx ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>
            {pr.label}
          </button>
        ))}
      </div>

      {/* Expression */}
      <div style={{ ...card, textAlign: "center", fontSize: 20, marginBottom: 14, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)" }}>
        <M t={"h(x) = " + p.expression} display ready={ready} />
      </div>

      {/* ── SECTION: THE TRAP ── */}
      {section === "trap" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #ef4444", borderRadius: 0, background: "#FCEBEB", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#501313", lineHeight: 1.6 }}>
              The trap: thinking in "Phase 1, Phase 2" — applying product rule first, then coming back and applying chain rule to v′ as if it were a new differentiation problem.
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>
            What the trap looks like in practice
          </div>

          {/* Wrong step 1 */}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 16, background: "#FCEBEB", color: "#791F1F" }}>Apply product rule</span>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: 14, color: "var(--color-text-primary)", marginBottom: 10 }}>
                Set u = {p.u} and v = {p.v}. Write the product rule blueprint:
              </p>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px", textAlign: "center", overflowX: "auto", marginBottom: 10 }}>
                <M t={"h'(x) = u'v + uv' = \\underbrace{(" + p.uPrime + ")(" + p.v + ")}_{\\text{first term}} + \\underbrace{(" + p.u + ")v'}_{\\text{second term}}"} display ready={ready} />
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic", lineHeight: 1.6 }}>
                So far so good — the blueprint is correct. The problem comes in the next step.
              </p>
              <WhyPanel why={{ tag: "Why is the blueprint correct here?", explanation: "Product rule: d/dx[u·v] = u′v + uv′. We correctly identified u = " + p.u + " and v = " + p.v + ", and u′ = " + p.uPrime + " (direct power rule). The blueprint is written correctly. The trap comes in finding v′.", why: null }} depth={0} ready={ready} />
            </div>
          </div>

          {/* Wrong step 2 — THE TRAP */}
          <div style={{ background: "var(--color-background-primary)", border: "1.5px solid #ef4444", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#FCEBEB", borderBottom: "1.5px solid #ef4444" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 16, background: "#ef444422", color: "#791F1F" }}>THE TRAP — incomplete v′</span>
              <span style={{ marginLeft: "auto", fontSize: 20 }}>⚠</span>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: 14, color: "#791F1F", fontWeight: 500, marginBottom: 10 }}>
                The mistake: writing v′ using only the outer part of the chain rule, then stopping.
              </p>
              <div style={{ background: "#FCEBEB", borderRadius: 8, padding: "12px", textAlign: "center", overflowX: "auto", marginBottom: 10 }}>
                <M t={"v = " + p.v + " \\quad\\Rightarrow\\quad v' = " + p.vPrimeWrong + " \\quad \\color{red}{\\longleftarrow \\text{ INCOMPLETE}}"} display ready={ready} />
              </div>
              <div style={{ padding: "10px 14px", borderLeft: "3px solid #ef4444", background: "#FCEBEB", borderRadius: "0 6px 6px 0", marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: "#501313", lineHeight: 1.7 }}>
                  This is the outer derivative only. The inner function is NOT just x — it's a function of x — so the chain rule multiplier is missing.
                  By writing only the outer derivative and calling it done, you have completed half of the chain rule and abandoned the other half.
                </div>
              </div>
              <WhyPanel why={{
                tag: "Why does this feel right but isn't?",
                explanation: "The outer derivative of v = " + p.v + " looks 'done' once you apply the power rule. It feels like a complete answer. The problem is that the chain rule is not just 'power rule on the outer' — it's 'power rule on the outer, TIMES derivative of the inner'. The inner function is not x (which would make the multiplier 1 and invisible). It's " + p.v + ", which has its own derivative that must be found and multiplied in.",
                steps: [
                  { text: "Think of it this way: the chain rule formula is f′(g(x)) · g′(x). Writing only f′(g(x)) and stopping is like writing the first factor of a product and ignoring the second factor." },
                  { text: "The inner derivative g′(x) is not optional — it is literally half the chain rule formula." },
                  { text: "When the inner function is just x, g′(x) = 1, which is invisible. That is the ONLY case where you can write just f′(g(x)) and be done." },
                ],
                why: {
                  tag: "How do I know when the inner is 'just x'?",
                  explanation: "Ask: is the argument of the outer function literally the variable x, with no other operations? sin(x) → yes, inner = x, no chain multiplier. sin(x²) → no, inner = x², chain multiplier = 2x. (6x+6)⁻³ → no, inner = 6x+6, chain multiplier = 6.",
                  why: null,
                },
              }} depth={0} ready={ready} />
            </div>
          </div>

          {/* Resulting wrong answer */}
          <div style={{ ...card, borderLeft: "3px solid #ef4444", borderRadius: 0, background: "#FCEBEB" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#791F1F", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Result of the trap</div>
            <M t={"h'(x) = " + p.wrongAnswer + " \\quad \\color{red}{\\text{WRONG}}"} display ready={ready} />
          </div>
        </div>
      )}

      {/* ── SECTION: SHOPPING LIST ── */}
      {section === "list" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#26215C", lineHeight: 1.7 }}>
              The mental model that prevents the trap: think of the product rule as a shopping list.
              You need four ingredients. If one of them is complicated, you compute it fully before writing it down.
              You do not write a half-finished ingredient and come back to it.
            </div>
          </div>

          {/* Shopping list visual */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { item: "u", value: p.u, label: "Ingredient 1", note: "Copy straight from the expression", color: "#38bdf8", easy: true },
              { item: "v", value: p.v, label: "Ingredient 2", note: "Copy straight from the expression", color: "#f472b6", easy: true },
              { item: "u′", value: p.uPrime, label: "Ingredient 3", note: "Differentiate u — direct rule", color: "#38bdf8", easy: true },
              { item: "v′", value: p.vPrimeRight, label: "Ingredient 4 ⚠", note: "Differentiate v — chain rule required inside!", color: "#f472b6", easy: false },
            ].map((ing, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${ing.color}`, background: ing.color + "11" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: ing.color, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {ing.easy ? "✓" : "⚙"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 600 }}>{ing.label}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: ing.color, marginBottom: 4 }}>
                  <M t={ing.item + " = " + ing.value} ready={ready} />
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontStyle: "italic" }}>{ing.note}</div>
              </div>
            ))}
          </div>

          {/* The key insight */}
          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#26215C", marginBottom: 8 }}>The Russian Doll rule:</div>
            <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>
              When you reach Ingredient 4 (v′) and v is a "Russian Doll" — a function of a function — you must fully unpack it with chain rule <em>right there</em>, before writing it on your list.
              Once it is on the list, you stop differentiating. You plug it into the blueprint and do algebra.
            </div>
          </div>

          {/* Assembly */}
          <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#085041", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>
              Assembly — all four ingredients plugged into blueprint
            </div>
            <M t={"h'(x) = \\underbrace{u'}_{" + p.uPrime + "} \\cdot \\underbrace{v}_{" + p.v + "} + \\underbrace{u}_{" + p.u + "} \\cdot \\underbrace{v'}_{" + p.vPrimeRight + "}"} display ready={ready} />
            <div style={{ marginTop: 8, fontSize: 13, color: "#0F6E56" }}>
              Once assembled, you are doing algebra. No more calculus. Do not differentiate again.
            </div>
          </div>

          <WhyPanel why={{
            tag: "Why does this analogy work?",
            explanation: "The product rule creates a template with exactly four slots: u, v, u′, v′. Your only job is to fill each slot. If a slot requires chain rule to fill (because the function there is a composition), you do chain rule to get the value for that slot — and then the slot is full. You move on. You never re-open a filled slot and differentiate it again.",
            steps: [
              { text: "u and v: just read them off. No computation." },
              { text: "u′: differentiate u. For most simple u, this is direct rule." },
              { text: "v′: differentiate v. If v is a composition, use chain rule entirely to get v′. This is done once." },
              { text: "Assemble: u′v + uv′. You have four numbers/expressions. Multiply and add. Done." },
            ],
            why: null,
          }} depth={0} ready={ready} />
        </div>
      )}

      {/* ── SECTION: PARSE TREE ── */}
      {section === "tree" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#085041", lineHeight: 1.6 }}>
              A parser reads the expression as a tree. It zooms into one branch at a time, finishes it completely, then zooms back out.
              The chain rule happens inside the right branch — not after the tree is assembled.
            </div>
          </div>
          <ParseTree problem={p} ready={ready} />
          <div style={{ ...card, marginTop: 10 }}>
            <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>
              Notice: the chain rule multiplier (green) is computed <em>inside</em> the right branch, as part of finding v′.
              It is never applied after the branches are merged. Once v′ is fully computed, the tree "zooms out" and the
              product rule assembly happens at the root — which is pure arithmetic/algebra, not calculus.
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: RIGHT VS WRONG ── */}
      {section === "compare" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <button onClick={() => setShowWrong(w => !w)} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #ef4444", background: showWrong ? "#FCEBEB" : "transparent", color: "#791F1F", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              {showWrong ? "▼" : "▶"} Show wrong working
            </button>
            <button onClick={() => setShowRight(w => !w)} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #1D9E75", background: showRight ? "#E1F5EE" : "transparent", color: "#085041", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              {showRight ? "▼" : "▶"} Show correct working
            </button>
          </div>

          {showWrong && (
            <div style={{ padding: "14px 16px", border: "1.5px solid #ef4444", borderRadius: 10, background: "#FCEBEB", marginBottom: 10, animation: "sd .18s ease-out" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#791F1F", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Wrong working — missing chain multiplier</div>
              {[
                { step: "Set up", expr: "u = " + p.u + ", \\; v = " + p.v },
                { step: "u′", expr: "u' = " + p.uPrime + " \\quad \\text{(correct)}" },
                { step: "v′ (WRONG)", expr: "v' = " + p.vPrimeWrong + " \\quad \\color{red}{\\leftarrow \\text{chain multiplier missing}}" },
                { step: "Assemble", expr: "h'(x) = " + p.wrongAnswer },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, padding: "8px 10px", background: "rgba(255,255,255,0.5)", borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#791F1F", fontWeight: 600, minWidth: 80 }}>{row.step}</div>
                  <div style={{ overflowX: "auto" }}><M t={row.expr} display ready={ready} /></div>
                </div>
              ))}
            </div>
          )}

          {showRight && (
            <div style={{ padding: "14px 16px", border: "1.5px solid #1D9E75", borderRadius: 10, background: "#E1F5EE", marginBottom: 10, animation: "sd .18s ease-out" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#085041", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Correct working — chain rule inline</div>
              {[
                { step: "Set up", expr: "u = " + p.u + ", \\; v = " + p.v },
                { step: "u′", expr: "u' = " + p.uPrime },
                { step: "v′ — chain rule INLINE", expr: "\\text{outer: } " + p.vPrimeChain.outer + " \\quad \\text{inner: } " + p.vPrimeChain.inner },
                { step: "v′ full", expr: "v' = " + p.vPrimeRight + " \\quad \\color{green}{\\checkmark}" },
                { step: "Assemble", expr: "h'(x) = (" + p.uPrime + ")(" + p.v + ") + (" + p.u + ")(" + p.vPrimeRight + ")" },
                { step: "Simplified", expr: p.rightFactored },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, padding: "8px 10px", background: "rgba(255,255,255,0.5)", borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#085041", fontWeight: 600, minWidth: 140, flexShrink: 0 }}>{row.step}</div>
                  <div style={{ overflowX: "auto" }}><M t={row.expr} display ready={ready} /></div>
                </div>
              ))}
            </div>
          )}

          {/* Numeric check */}
          <button onClick={() => setShowCheck(c => !c)} style={{ padding: "5px 14px", borderRadius: 8, border: "0.5px solid #059669", background: showCheck ? "#ecfdf5" : "transparent", color: "#059669", cursor: "pointer", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
            {showCheck ? "▼" : "▶"} Numeric verification — why the wrong answer is provably wrong
          </button>
          {showCheck && (
            <div style={{ padding: "12px 14px", borderLeft: "3px solid #059669", borderRadius: "0 8px 8px 0", background: "var(--color-background-success)", animation: "sd .16s ease-out" }}>
              {p.numCheck.note && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>{p.numCheck.note}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div style={{ padding: "8px 10px", background: "#FCEBEB", borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#791F1F", fontWeight: 600, marginBottom: 4 }}>Wrong answer gives:</div>
                  <div style={{ fontSize: 12, color: "#501313" }}>{p.numCheck.wrongX1}</div>
                </div>
                <div style={{ padding: "8px 10px", background: "#E1F5EE", borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#085041", fontWeight: 600, marginBottom: 4 }}>Correct answer gives:</div>
                  <div style={{ fontSize: 12, color: "#0F6E56" }}>{p.numCheck.rightX1}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#059669", fontWeight: 500 }}>{p.numCheck.numerical}</div>
            </div>
          )}

          {/* The final rule */}
          <div style={{ marginTop: 12, padding: "14px 16px", borderLeft: "3px solid #BA7517", borderRadius: "0 8px 8px 0", background: "var(--color-background-warning)" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.7 }}>
              The rule to internalise: once you write down the product rule blueprint
              (<M t={"u'v + uv'"} ready={ready} />), the calculus is over.
              Every term in that blueprint must be a fully evaluated expression — not a work-in-progress.
              If getting v′ requires chain rule, you do chain rule completely before writing v′ in the blueprint.
              What follows the blueprint is algebra: multiply, combine, factor. Never differentiate again.
            </div>
            <WhyPanel why={{
              tag: "What if I forget mid-problem?",
              explanation: "The sanity check: after you fill in u′ and v′, count the number of times you differentiated anything. For a product of two functions where one factor has an inner function, you should have differentiated exactly twice — once for u′ and once for v′ (which required chain rule). If you only differentiated once for v′ (outer only) and plan to 'do chain rule in the next step', that is the trap.",
              steps: [
                { text: "Before writing the assembled product rule, check each of u′ and v′ separately: is this a complete derivative, including any chain rule multipliers?" },
                { text: "Chain rule multiplier check: is the argument of the outer function anything other than just x? If yes, there must be a multiplication by the inner derivative somewhere in your v′ expression." },
                { text: "Once both u′ and v′ pass the check, assemble and do algebra only." },
              ],
              why: null,
            }} depth={0} ready={ready} />
          </div>
        </div>
      )}
    </div>
  );
}
