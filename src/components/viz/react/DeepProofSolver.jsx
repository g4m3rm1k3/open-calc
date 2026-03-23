/**
 * DeepProofSolver — Dependency Hierarchy Proof Visualizer
 * Drop into open-calc as a viz component: src/components/viz/react/DeepProofSolver.jsx
 * Register in VizFrame.jsx: DeepProofSolver: lazy(() => import('./react/DeepProofSolver.jsx'))
 *
 * Problem: h(x) = sin(x³), prove h′(a) = cos(a³)·3a² from first principles
 * via the limit definition, showing every dependency down to algebra.
 */

import { useState, useEffect, useRef } from "react";

// ─── KaTeX loader (CDN) ────────────────────────────────────────────────────
function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);
  return ready;
}

function M({ t, display = false }) {
  const ref = useRef(null);
  const ready = useMath();
  useEffect(() => {
    if (ready && ref.current && window.katex) {
      try { window.katex.render(t, ref.current, { throwOnError: false, displayMode: display }); }
      catch (_) { if (ref.current) ref.current.textContent = t; }
    }
  }, [t, display, ready]);
  return <span ref={ref} />;
}

// ─── Dependency tree data ──────────────────────────────────────────────────
// Each node: id, tier (0=theorem … 4=axiom), title, tag, color, proof steps
const NODES = {
  theorem: {
    id: "theorem", tier: 0, tag: "Theorem",
    color: "#7c3aed",
    title: "h′(a) = cos(a³)·3a²",
    subtitle: "The result we are proving",
    depends: ["chain", "power", "sindiff"],
    steps: [
      {
        label: "Write the limit definition",
        expr: "h'(a) = \\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x - a}",
        proof: "The derivative is defined as a limit of a difference quotient. We are not assuming any rules yet — this is the axiomatic definition of the derivative.",
        why: "Every derivative proof must begin here. The limit definition is the ground truth. Rules like the Chain Rule are theorems proved from this definition, not additional axioms.",
      },
      {
        label: "Multiply and divide by (x³ − a³)",
        expr: "= \\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x^3 - a^3} \\cdot \\frac{x^3 - a^3}{x - a}",
        proof: "We multiply by 1 in the form (x³−a³)/(x³−a³). This is valid because x³−a³ ≠ 0 when x ≠ a (and limits don't care about the value at x = a, only nearby).",
        why: "This algebraic trick is called 'splitting a limit by introducing a useful 1.' The goal is to separate the expression into two recognizable limits — one involving the definition of d/dx[sin u], one involving d/dx[x³]. Neither is obvious until you split it.",
      },
      {
        label: "Split into a product of two limits",
        expr: "= \\left(\\lim_{x \\to a} \\frac{\\sin(x^3) - \\sin(a^3)}{x^3 - a^3}\\right) \\cdot \\left(\\lim_{x \\to a} \\frac{x^3 - a^3}{x - a}\\right)",
        proof: "The Limit Product Law: lim[f·g] = lim[f]·lim[g], provided both limits exist. Both will exist here — we will prove each separately.",
        why: "By separating the problem, each factor becomes a derivative in disguise. You can only see this after splitting.",
      },
      {
        label: "Substitute u = x³, recognize both factors",
        expr: "= \\underbrace{\\left.\\frac{d}{du}\\sin u\\right|_{u=a^3}}_{\\cos(a^3)} \\cdot \\underbrace{\\left.\\frac{d}{dx} x^3\\right|_{x=a}}_{3a^2}",
        proof: "As x→a, u=x³→a³. So the first factor is exactly the definition of d/du[sin u] evaluated at u=a³, which equals cos(a³). The second factor is the definition of d/dx[x³] at x=a, which equals 3a².",
        why: "This is the Chain Rule emerging from first principles — not as a formula we apply, but as the natural consequence of splitting the limit and recognizing each piece.",
      },
      {
        label: "Conclude",
        expr: "h'(a) = \\cos(a^3) \\cdot 3a^2",
        proof: "Multiply the two limits. The proof is complete.",
        why: "Every line above was justified by something beneath it. Expand any dependency node to see its own proof chain.",
      },
    ],
  },

  chain: {
    id: "chain", tier: 1, tag: "Theorem",
    color: "#0369a1",
    title: "Chain Rule",
    subtitle: "d/dx[f(g(x))] = f′(g(x))·g′(x)",
    depends: ["limitprod", "squeeze"],
    steps: [
      {
        label: "Define the difference quotient",
        expr: "\\frac{f(g(x)) - f(g(a))}{x - a}",
        proof: "Start from the limit definition of the derivative applied to the composite function f∘g.",
        why: "We cannot assume the Chain Rule — we are proving it. Every step must come from definitions and previously proved theorems.",
      },
      {
        label: "Introduce the auxiliary variable",
        expr: "= \\frac{f(g(x)) - f(g(a))}{g(x) - g(a)} \\cdot \\frac{g(x) - g(a)}{x - a}",
        proof: "Multiply by [g(x)−g(a)]/[g(x)−g(a)] — valid when g(x) ≠ g(a). The case g(x) = g(a) for x near a requires a separate argument using the squeeze theorem.",
        why: "This split mirrors exactly what we did in the main proof. The first fraction becomes f′(g(a)); the second becomes g′(a).",
      },
      {
        label: "Take the limit, apply the Limit Product Law",
        expr: "\\lim_{x\\to a}\\frac{f(g(x))-f(g(a))}{g(x)-g(a)} \\cdot \\lim_{x\\to a}\\frac{g(x)-g(a)}{x-a}",
        proof: "As x→a, g(x)→g(a) (because g is differentiable, hence continuous). So the first factor converges to f′(g(a)).",
        why: "Differentiability implies continuity — a fact that must be proved separately. This is one of the hidden dependencies of the Chain Rule.",
      },
      {
        label: "Result",
        expr: "(f \\circ g)'(a) = f'(g(a)) \\cdot g'(a)",
        proof: "The Chain Rule follows. Note: a complete proof also handles the degenerate case g(x)−g(a) = 0 in a neighborhood, which requires the squeeze theorem.",
        why: "The Chain Rule is NOT an axiom. It is a theorem that took mathematicians significant work to state correctly. The degenerate case was an error in early calculus textbooks.",
      },
    ],
  },

  sindiff: {
    id: "sindiff", tier: 1, tag: "Theorem",
    color: "#0369a1",
    title: "d/du[sin u] = cos u",
    subtitle: "The sine derivative — proved from scratch",
    depends: ["angleadd", "squeeze"],
    steps: [
      {
        label: "Apply the limit definition",
        expr: "\\frac{d}{du}\\sin u = \\lim_{h \\to 0} \\frac{\\sin(u+h) - \\sin u}{h}",
        proof: "We apply the fundamental definition of the derivative. We cannot just 'know' this is cosine — we must derive it.",
        why: "This is the honest starting point. Every trig derivative must be proved from the limit definition, which itself depends on the angle addition formula.",
      },
      {
        label: "Expand sin(u+h) using the angle addition formula",
        expr: "= \\lim_{h \\to 0} \\frac{\\sin u \\cos h + \\cos u \\sin h - \\sin u}{h}",
        proof: "sin(u+h) = sin u cos h + cos u sin h. This is the angle addition identity — proved in the next dependency level.",
        why: "Without the angle addition formula, you literally cannot take the derivative of sine. This is a hard algebraic dependency. The formula must be proved, not assumed.",
      },
      {
        label: "Group and split",
        expr: "= \\lim_{h \\to 0} \\left[ \\sin u \\cdot \\frac{\\cos h - 1}{h} + \\cos u \\cdot \\frac{\\sin h}{h} \\right]",
        proof: "Factor out sin u and cos u, then split into two limit expressions. Both limits must be evaluated.",
        why: "This reveals two famous limits that require their own proofs: lim(sin h/h) = 1 and lim((cos h−1)/h) = 0. These are the two 'atoms' under the sine derivative.",
      },
      {
        label: "Apply the two fundamental trig limits",
        expr: "= \\sin u \\cdot 0 + \\cos u \\cdot 1 = \\cos u",
        proof: "lim_{h→0} (sin h)/h = 1 (proved via squeeze theorem and unit circle geometry). lim_{h→0} (cos h−1)/h = 0 (proved from the previous limit by algebra).",
        why: "Both of these limits require the Squeeze Theorem to prove. If you don't know why (sin h)/h → 1, you don't actually know why d/du[sin u] = cos u.",
      },
    ],
  },

  power: {
    id: "power", tier: 1, tag: "Theorem",
    color: "#0369a1",
    title: "Power Rule: d/dx[x³] = 3x²",
    subtitle: "Proved via the binomial theorem",
    depends: ["binomial"],
    steps: [
      {
        label: "Apply the limit definition",
        expr: "\\frac{d}{dx}x^3 = \\lim_{h \\to 0} \\frac{(x+h)^3 - x^3}{h}",
        proof: "Standard limit definition of the derivative applied to f(x) = x³.",
        why: "We are not using the Power Rule — we are proving it for n=3 as a specimen case. The general case follows by induction on n.",
      },
      {
        label: "Expand (x+h)³ by the Binomial Theorem",
        expr: "(x+h)^3 = x^3 + 3x^2h + 3xh^2 + h^3",
        proof: "The Binomial Theorem gives (a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏ bᵏ. For n=3: x³ + 3x²h + 3xh² + h³.",
        why: "The Binomial Theorem is the algebraic engine under the Power Rule. Without it, you cannot expand (x+h)ⁿ and cannot take the derivative.",
      },
      {
        label: "Cancel and simplify",
        expr: "\\lim_{h \\to 0} \\frac{3x^2h + 3xh^2 + h^3}{h} = \\lim_{h \\to 0} (3x^2 + 3xh + h^2)",
        proof: "The x³ terms cancel. Every remaining term in the numerator has a factor of h, so we can divide through by h (h ≠ 0 in the limit).",
        why: "This cancellation is why the limit is computable. Without it, we would have 0/0. The structure of the binomial expansion guarantees exactly one term without h (which cancels) and all others divisible by h.",
      },
      {
        label: "Evaluate at h = 0",
        expr: "\\lim_{h \\to 0}(3x^2 + 3xh + h^2) = 3x^2",
        proof: "As h→0, every term containing h vanishes. Only 3x² survives.",
        why: "This is the general pattern of the Power Rule: after expanding and cancelling, you are left with n·xⁿ⁻¹. For n=3, that is 3x².",
      },
    ],
  },

  angleadd: {
    id: "angleadd", tier: 2, tag: "Identity",
    color: "#0f766e",
    title: "sin(u+h) = sin u cos h + cos u sin h",
    subtitle: "Angle addition identity — unit circle proof",
    depends: ["unitcirc"],
    steps: [
      {
        label: "Place two angles on the unit circle",
        expr: "P_1 = (\\cos u,\\, \\sin u),\\quad P_2 = (\\cos(u+h),\\, \\sin(u+h))",
        proof: "Any angle on the unit circle corresponds to a point (cos θ, sin θ). Place angle u and angle u+h as two such points.",
        why: "The unit circle is the definition of sine and cosine for real angles. Every trig identity is ultimately a geometric fact about this circle.",
      },
      {
        label: "Compute the chord length two ways",
        expr: "|P_1 P_2|^2 = (\\cos(u+h)-\\cos u)^2 + (\\sin(u+h)-\\sin u)^2",
        proof: "The squared distance between two points equals the sum of squared coordinate differences (Pythagorean theorem in the plane).",
        why: "We will compute the same chord length using a rotation argument. Equating the two expressions forces the angle addition formula.",
      },
      {
        label: "Use the rotation equivalence",
        expr: "|P_1 P_2|^2 = 2 - 2\\cos h \\quad\\text{(chord length depends only on the arc } h\\text{)}",
        proof: "On the unit circle, the chord between two points depends only on the angular difference h between them. Comparing with the rotated position (1, 0) and (cos h, sin h) gives 2 − 2 cos h.",
        why: "Rotation invariance of the unit circle is what makes this work. The circle looks the same from any angle.",
      },
      {
        label: "Expand and equate to derive the identity",
        expr: "\\sin(u+h) = \\sin u \\cos h + \\cos u \\sin h",
        proof: "Expanding both expressions for |P₁P₂|² and matching coefficients forces this identity. The cos addition formula follows by the same argument.",
        why: "This identity is not obvious — it required Ptolemy and later Euler to formalize. It is the bedrock beneath every trig derivative.",
      },
    ],
  },

  squeeze: {
    id: "squeeze", tier: 2, tag: "Theorem",
    color: "#0f766e",
    title: "Squeeze Theorem + lim(sin h/h) = 1",
    subtitle: "The limit that makes trig calculus possible",
    depends: ["unitcirc"],
    steps: [
      {
        label: "State the Squeeze Theorem",
        expr: "g(x) \\le f(x) \\le k(x),\\ \\lim g = \\lim k = L \\implies \\lim f = L",
        proof: "If a function is sandwiched between two functions that both converge to L, it must also converge to L. Proved directly from the ε-δ definition of limits.",
        why: "The Squeeze Theorem is required precisely when you cannot compute a limit directly. It lets you bound an unknown limit by two known ones.",
      },
      {
        label: "Establish the area inequality",
        expr: "\\tfrac{1}{2}\\sin h < \\tfrac{1}{2}h < \\tfrac{1}{2}\\tan h \\quad (0 < h < \\tfrac{\\pi}{2})",
        proof: "Compare three areas on the unit circle: triangle OAB (area ½ sin h) < sector OAB (area ½h) < triangle OAT (area ½ tan h). All areas positive for 0 < h < π/2.",
        why: "This geometric inequality is the key step. The sector area is exactly ½h by definition of radian measure — which is why radians are required here. Degrees would break this argument.",
      },
      {
        label: "Divide through by ½ sin h",
        expr: "1 < \\frac{h}{\\sin h} < \\frac{1}{\\cos h}",
        proof: "Dividing the area inequality by ½ sin h (positive) and taking reciprocals (reversing inequality) gives: cos h < (sin h)/h < 1.",
        why: "Now (sin h)/h is squeezed between cos h and 1. As h→0, cos h → 1 and 1 → 1. The Squeeze Theorem forces (sin h)/h → 1.",
      },
      {
        label: "Apply the squeeze",
        expr: "\\cos h < \\frac{\\sin h}{h} < 1 \\implies \\lim_{h \\to 0}\\frac{\\sin h}{h} = 1",
        proof: "Since lim cos h = 1 and lim 1 = 1, the Squeeze Theorem gives the result.",
        why: "This single limit is load-bearing for all of trig calculus. If you don't know this proof, you don't know why any trig derivative is what it is.",
      },
    ],
  },

  binomial: {
    id: "binomial", tier: 2, tag: "Identity",
    color: "#0f766e",
    title: "Binomial Theorem",
    subtitle: "(a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏ bᵏ",
    depends: ["algebra"],
    steps: [
      {
        label: "Observe the pattern for small n",
        expr: "(a+b)^2 = a^2+2ab+b^2,\\quad (a+b)^3 = a^3+3a^2b+3ab^2+b^3",
        proof: "Direct expansion. Notice the coefficients 1,2,1 and 1,3,3,1 — these are rows of Pascal's Triangle.",
        why: "The pattern is not obvious from algebra alone. The combinatorial meaning — C(n,k) ways to choose k copies of b — is the key insight.",
      },
      {
        label: "Combinatorial interpretation",
        expr: "C(n,k) = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}",
        proof: "When you expand (a+b)ⁿ = (a+b)(a+b)···(a+b), each term is formed by choosing a or b from each factor. The number of ways to choose exactly k copies of b from n factors is C(n,k).",
        why: "This is why the coefficients are binomial coefficients. The theorem is a counting argument dressed as algebra.",
      },
      {
        label: "Prove by induction",
        expr: "(a+b)^{n+1} = (a+b)\\sum_{k=0}^n \\binom{n}{k}a^{n-k}b^k",
        proof: "Assume the theorem holds for n. Multiply both sides by (a+b), collect like powers, and use Pascal's identity: C(n,k−1)+C(n,k) = C(n+1,k).",
        why: "Pascal's identity is the inductive step — it is what makes the triangle expand row by row. The Power Rule proof for general n relies on exactly this induction.",
      },
    ],
  },

  limitprod: {
    id: "limitprod", tier: 2, tag: "Law",
    color: "#0f766e",
    title: "Limit Product Law",
    subtitle: "lim[f·g] = lim[f]·lim[g]",
    depends: ["algebra"],
    steps: [
      {
        label: "State the goal",
        expr: "\\lim_{x\\to a}[f(x)g(x)] = L \\cdot M \\text{ where } \\lim f = L,\\ \\lim g = M",
        proof: "We want to show that the limit of a product equals the product of the limits.",
        why: "This is not obvious — it must be proved from the ε-δ definition. It is the law that lets us split the Chain Rule proof into two factors.",
      },
      {
        label: "ε-δ setup: the key algebraic trick",
        expr: "f(x)g(x) - LM = f(x)(g(x)-M) + M(f(x)-L)",
        proof: "Add and subtract f(x)M. This splits the error into two manageable pieces, each involving one limit approaching its target.",
        why: "This algebraic manipulation is a standard ε-δ technique. The idea is to bound |f(x)g(x) − LM| using the triangle inequality and the individual bounds on |f(x)−L| and |g(x)−M|.",
      },
      {
        label: "Bound each piece",
        expr: "|f(x)g(x)-LM| \\le |f(x)||g(x)-M| + |M||f(x)-L|",
        proof: "Apply the triangle inequality. Since f is bounded near a (differentiable ⟹ bounded near a), and |g(x)−M| → 0 and |f(x)−L| → 0, both pieces go to 0.",
        why: "The boundedness of f near a is the subtle point — it requires the ε-δ definition of limits to establish separately.",
      },
      {
        label: "Conclude",
        expr: "\\lim_{x\\to a}f(x)g(x) = LM",
        proof: "Given ε > 0, choose δ small enough that both pieces are < ε/2. The product law follows.",
        why: "This law is used in almost every limit computation in calculus, often silently. The Chain Rule proof uses it explicitly to split the two limit factors.",
      },
    ],
  },

  unitcirc: {
    id: "unitcirc", tier: 3, tag: "Definition",
    color: "#b45309",
    title: "Unit Circle & Radian Measure",
    subtitle: "sin θ, cos θ defined geometrically",
    depends: ["algebra"],
    steps: [
      {
        label: "Define sin and cos via the unit circle",
        expr: "x^2 + y^2 = 1: \\quad (\\cos\\theta, \\sin\\theta) \\text{ is the point at arc length } \\theta",
        proof: "The unit circle has radius 1. For any angle θ (in radians), the point on the circle at arc length θ from (1,0) has coordinates (cos θ, sin θ). This is the definition.",
        why: "Radians are essential — one radian is the angle subtended by an arc of length 1 on the unit circle. This is what makes the area of a sector exactly ½r²θ = ½θ, which feeds into the Squeeze Theorem proof.",
      },
      {
        label: "Key geometric properties",
        expr: "\\sin^2\\theta + \\cos^2\\theta = 1,\\quad \\sin(-\\theta) = -\\sin\\theta,\\quad \\cos(-\\theta)=\\cos\\theta",
        proof: "These follow immediately from the definition: the point (cos θ, sin θ) lies on the unit circle, so its coordinates satisfy x²+y²=1. Symmetry of the circle gives the odd/even properties.",
        why: "The Pythagorean identity x²+y²=1 is not a theorem to prove from algebra — it is a direct consequence of the definition of sin and cos on the unit circle.",
      },
      {
        label: "Continuity of sin and cos",
        expr: "\\lim_{h\\to 0}\\cos h = 1,\\quad \\lim_{h\\to 0}\\sin h = 0",
        proof: "As h→0, the point (cos h, sin h) on the unit circle approaches (1, 0). This is continuity at 0, which follows from the geometry of arc length.",
        why: "These two limits are used directly in the derivation of d/du[sin u] = cos u. Without knowing that cos h → 1 and sin h → 0, the simplification in the final step does not work.",
      },
    ],
  },

  algebra: {
    id: "algebra", tier: 4, tag: "Axioms",
    color: "#6b7280",
    title: "Real Number Axioms",
    subtitle: "Field axioms, order, completeness",
    depends: [],
    steps: [
      {
        label: "Field axioms",
        expr: "a+(b+c)=(a+b)+c,\\quad a\\cdot(b+c)=a\\cdot b+a\\cdot c",
        proof: "The real numbers form a field: they satisfy axioms of addition and multiplication including commutativity, associativity, distributivity, and the existence of identities and inverses.",
        why: "Every algebraic manipulation in every proof above — collecting terms, factoring, cancelling — is justified by these axioms. They are the bottom of the stack.",
      },
      {
        label: "Order axioms",
        expr: "a < b,\\quad b < c \\implies a < c \\quad \\text{(transitivity)}",
        proof: "The reals are totally ordered: for any a, b, exactly one of a < b, a = b, a > b holds. Order interacts with addition and multiplication in the expected ways.",
        why: "The Squeeze Theorem requires order: g ≤ f ≤ k. Without the order axioms, inequalities have no meaning and the Squeeze Theorem cannot be stated.",
      },
      {
        label: "Completeness axiom",
        expr: "\\text{Every bounded-above set has a least upper bound (supremum)}",
        proof: "This is what makes the reals the reals, rather than the rationals. It guarantees that limits of convergent sequences exist in ℝ.",
        why: "Without completeness, you could construct a Cauchy sequence that doesn't converge in your number system. Limits in calculus would fail to exist. The entire edifice of calculus rests on this single axiom.",
      },
    ],
  },
};

const TIERS = [
  { label: "Theorem", desc: "What we're proving" },
  { label: "Theorem", desc: "Direct dependencies" },
  { label: "Identity / Law", desc: "Proof building blocks" },
  { label: "Definition", desc: "Foundational definitions" },
  { label: "Axioms", desc: "Ground truth" },
];

const TIER_COLORS = ["#7c3aed", "#0369a1", "#0f766e", "#b45309", "#6b7280"];

// ─── Layout config ─────────────────────────────────────────────────────────
const LAYOUT = {
  theorem:   { col: 0, row: 0 },
  chain:     { col: -1.2, row: 1 },
  sindiff:   { col: 0, row: 1 },
  power:     { col: 1.2, row: 1 },
  angleadd:  { col: -1.5, row: 2 },
  squeeze:   { col: -0.4, row: 2 },
  binomial:  { col: 1.5, row: 2 },
  limitprod: { col: 0.5, row: 2 },
  unitcirc:  { col: -0.6, row: 3 },
  algebra:   { col: 0.6, row: 3 },
};

const ROW_Y = [40, 140, 240, 340];
const COL_W = 120;
const NODE_W = 108;
const NODE_H = 46;
const SVG_W = 560;

function nodePos(id) {
  const l = LAYOUT[id];
  const cx = SVG_W / 2 + l.col * COL_W;
  const cy = ROW_Y[l.row];
  return { cx, cy, x: cx - NODE_W / 2, y: cy - NODE_H / 2 };
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function DeepProofSolver({ params = {} }) {
  const [active, setActive] = useState("theorem");
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState(new Set(["theorem"]));
  const mathReady = useMath();

  const node = NODES[active];
  const steps = node.steps;
  const totalSteps = steps.length;

  function openNode(id) {
    setActive(id);
    setStep(0);
    setExpanded(prev => new Set([...prev, id]));
  }

  function canNext() { return step < totalSteps - 1; }
  function canPrev() { return step > 0; }

  // ── SVG dependency map ───
  function renderMap() {
    const edges = [];
    Object.values(NODES).forEach(n => {
      n.depends.forEach(dep => {
        const from = nodePos(n.id);
        const to = nodePos(dep);
        edges.push({ from, to, color: TIER_COLORS[NODES[dep].tier] });
      });
    });

    return (
      <svg
        viewBox={`0 0 ${SVG_W} 420`}
        style={{ width: "100%", display: "block", marginBottom: 16 }}
      >
        <defs>
          {TIER_COLORS.map((c, i) => (
            <marker key={i} id={`arr${i}`} viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke={c} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          ))}
        </defs>

        {/* Tier labels */}
        {ROW_Y.map((ry, i) => (
          <text key={i} x={8} y={ry + 5} fontSize={9} fill={TIER_COLORS[i]}
            fontFamily="var(--font-sans)" fontWeight={500} opacity={0.7}>
            {TIERS[i].label}
          </text>
        ))}
        {/* algebra tier label */}
        <text x={8} y={ROW_Y[3] + 60 + 5} fontSize={9} fill={TIER_COLORS[4]}
          fontFamily="var(--font-sans)" fontWeight={500} opacity={0.7}>
          Axioms
        </text>

        {/* Edges */}
        {edges.map((e, i) => (
          <line key={i}
            x1={e.from.cx} y1={e.from.cy + NODE_H / 2}
            x2={e.to.cx} y2={e.to.cy - NODE_H / 2}
            stroke={e.color} strokeWidth={1} opacity={0.35}
            markerEnd={`url(#arr${TIER_COLORS.indexOf(e.color)})`}
          />
        ))}

        {/* Nodes */}
        {Object.values(NODES).map(n => {
          const { x, y, cx } = nodePos(n.id);
          const isActive = n.id === active;
          const isVisited = expanded.has(n.id);
          return (
            <g key={n.id} style={{ cursor: "pointer" }} onClick={() => openNode(n.id)}>
              <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={6}
                fill={isActive ? n.color : "var(--color-background-secondary)"}
                stroke={isActive ? n.color : isVisited ? n.color : "var(--color-border-secondary)"}
                strokeWidth={isActive ? 0 : 1}
                opacity={isActive ? 1 : 1}
              />
              {/* tag pill */}
              <rect x={x + 4} y={y + 4} width={NODE_W - 8} height={12} rx={3}
                fill={isActive ? "rgba(255,255,255,0.18)" : "transparent"}
              />
              <text x={cx} y={y + 10} textAnchor="middle" fontSize={8}
                fill={isActive ? "rgba(255,255,255,0.75)" : n.color}
                fontFamily="var(--font-sans)" fontWeight={500}
                style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {n.tag}
              </text>
              <text x={cx} y={y + 26} textAnchor="middle" fontSize={10}
                fill={isActive ? "#fff" : "var(--color-text-primary)"}
                fontFamily="var(--font-sans)" fontWeight={500}>
                {n.title.length > 18 ? n.title.slice(0, 18) + "…" : n.title}
              </text>
              <text x={cx} y={y + 38} textAnchor="middle" fontSize={8.5}
                fill={isActive ? "rgba(255,255,255,0.7)" : "var(--color-text-tertiary)"}
                fontFamily="var(--font-sans)">
                {n.subtitle.length > 22 ? n.subtitle.slice(0, 22) + "…" : n.subtitle}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  const s = steps[step];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "1rem 0", maxWidth: 720 }}>
      {/* Header */}
      <div style={{
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: "0.5px solid var(--color-border-tertiary)"
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
          Dependency Hierarchy Proof
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>
          h(x) = sin(x³) — proved from first principles
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
          Click any node to drill into its proof. Every node proves itself from only what's beneath it.
        </div>
      </div>

      {/* Dependency map */}
      {renderMap()}

      {/* Active node proof panel */}
      <div style={{
        border: `1.5px solid ${node.color}`,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 12,
      }}>
        {/* Panel header */}
        <div style={{
          background: node.color,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 500, background: "rgba(255,255,255,0.2)",
            color: "#fff", padding: "2px 8px", borderRadius: 4,
            textTransform: "uppercase", letterSpacing: "0.07em"
          }}>{node.tag}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{node.title}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginLeft: 2 }}>
            — {node.subtitle}
          </span>
        </div>

        {/* Step progress pips */}
        <div style={{
          display: "flex", gap: 4, padding: "10px 14px 0",
          background: "var(--color-background-secondary)"
        }}>
          {steps.map((_, i) => (
            <div key={i}
              onClick={() => setStep(i)}
              style={{
                flex: 1, height: 4, borderRadius: 2, cursor: "pointer",
                background: i <= step ? node.color : "var(--color-border-tertiary)",
                opacity: i < step ? 0.4 : 1,
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div style={{
          padding: "14px 14px 12px",
          background: "var(--color-background-secondary)"
        }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: node.color,
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6
          }}>
            Step {step + 1} / {totalSteps} — {s.label}
          </div>

          {/* Math display */}
          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 8,
            padding: "12px 10px",
            textAlign: "center",
            fontSize: 15,
            overflowX: "auto",
            marginBottom: 10,
          }}>
            {mathReady ? <M t={s.expr} display={true} /> : <span style={{ opacity: 0.4 }}>…</span>}
          </div>

          {/* Proof block */}
          <div style={{
            marginBottom: 8,
            padding: "10px 12px",
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 8,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 500, textTransform: "uppercase",
              letterSpacing: "0.07em", color: "var(--color-text-tertiary)", marginBottom: 5
            }}>Proof</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
              {s.proof}
            </div>
          </div>

          {/* Why block */}
          <div style={{
            padding: "10px 12px",
            background: "var(--color-background-primary)",
            borderRadius: "0 8px 8px 0",
            border: "0.5px solid var(--color-border-tertiary)",
            borderLeft: `2px solid ${node.color}`,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 500, textTransform: "uppercase",
              letterSpacing: "0.07em", color: node.color, marginBottom: 5
            }}>Why this matters</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
              {s.why}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px",
          borderTop: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-primary)",
        }}>
          <button onClick={() => setStep(s => s - 1)} disabled={!canPrev()}
            style={{ flex: 1 }}>
            ← Prev step
          </button>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 70, textAlign: "center" }}>
            {step + 1} / {totalSteps}
          </span>
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
            style={{ flex: 1 }}>
            Next step →
          </button>
        </div>
      </div>

      {/* Depends-on links */}
      {node.depends.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)",
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6
          }}>
            This proof depends on
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {node.depends.map(dep => {
              const d = NODES[dep];
              return (
                <button key={dep} onClick={() => openNode(dep)} style={{
                  background: "var(--color-background-secondary)",
                  border: `0.5px solid ${d.color}`,
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 12,
                  color: d.color,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}>
                  {d.tag}: {d.title.length > 28 ? d.title.slice(0, 28) + "…" : d.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Breadcrumb trail of visited nodes */}
      {expanded.size > 1 && (
        <div style={{ marginTop: 4 }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)",
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6
          }}>
            Explored so far
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[...expanded].map(id => {
              const n = NODES[id];
              return (
                <span key={id} onClick={() => openNode(id)} style={{
                  fontSize: 11, padding: "3px 8px",
                  background: id === active ? n.color : "transparent",
                  color: id === active ? "#fff" : n.color,
                  border: `0.5px solid ${n.color}`,
                  borderRadius: 4, cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}>
                  {n.title.length > 20 ? n.title.slice(0, 20) + "…" : n.title}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}