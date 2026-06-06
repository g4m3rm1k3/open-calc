import { useState, useEffect, useRef } from "react";

// Default graph: 5 nodes, directed edges
const NODE_COUNT = 5;
const NODE_LABELS_WEB = ["A", "B", "C", "D", "E"];
const NODE_LABELS_CNC = ["Setup", "Rough", "Semi", "Finish", "Inspect"];

// Edges: [from, to] (0-indexed)
const EDGES = [
  [0, 1], [0, 2], // A→B, A→C
  [1, 3],         // B→D
  [2, 3], [2, 4], // C→D, C→E
  [3, 0], [3, 4], // D→A, D→E
  [4, 0],         // E→A
];

// Build column-stochastic matrix
function buildMatrix(edges, n) {
  // Count outgoing edges per node
  const outDeg = Array(n).fill(0);
  edges.forEach(([f]) => outDeg[f]++);
  const M = Array.from({ length: n }, () => Array(n).fill(0));
  edges.forEach(([f, t]) => {
    M[t][f] += 1 / (outDeg[f] || 1);
  });
  return M;
}

function matVecMul(M, v) {
  return M.map(row => row.reduce((s, val, j) => s + val * v[j], 0));
}

function vecNorm(v) {
  const s = v.reduce((a, b) => a + b, 0);
  return s > 0 ? v.map(x => x / s) : v.map(() => 1 / v.length);
}

const STEPS = [
  {
    title: "A network of pages",
    subtitle: "Links as votes",
    narration:
      "Google's original PageRank insight: a page is important if other important pages link to it. Each link is a 'vote', but votes from important pages count more. This circular definition resolves beautifully as an eigenvector problem — the importance vector is the dominant eigenvector of the link matrix.",
  },
  {
    title: "The link matrix",
    subtitle: "Column-stochastic — each column sums to 1",
    narration:
      "Column j of matrix M describes where page j's 'votes' flow. If page A links to B and C, column A has ½ in rows B and C. Each column sums to 1 (probability distribution). Click a node to highlight its column in the matrix.",
  },
  {
    title: "Power iteration",
    subtitle: "r_{n+1} = M·r_n  →  r* (eigenvector, λ=1)",
    narration:
      "Start with equal probability [0.2, 0.2, 0.2, 0.2, 0.2]. Repeatedly multiply by M. The vector converges to the dominant eigenvector — the PageRank scores. This is power iteration: the simplest eigenvector algorithm. Watch the bar chart converge!",
  },
  {
    title: "Real-world insight",
    subtitle: "Mr* = r* — the steady-state surfer",
    narration:
      "PageRank is the steady-state probability distribution of a random surfer clicking links forever. The eigenvector equation Mr* = r* means the distribution doesn't change under one more step — it's balanced. Toggle to 'Machining Workflow' mode: the same math describes process flow importance in manufacturing!",
  },
];

const COLORS = ["#818cf8", "#34d399", "#fb923c", "#f43f5e", "#fbbf24"];
const NODE_COLORS_DIM = ["#312e81", "#064e3b", "#7c2d12", "#881337", "#78350f"];

// Node positions on a circle
function nodePos(i, n, cx, cy, r) {
  const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

export default function PageRankEigenvectorViz() {
  const [step, setStep] = useState(0);
  const [ranks, setRanks] = useState(Array(NODE_COUNT).fill(1 / NODE_COUNT));
  const [iteration, setIteration] = useState(0);
  const [running, setRunning] = useState(false);
  const [converged, setConverged] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [cncMode, setCncMode] = useState(false);
  const animRef = useRef(null);

  const M = buildMatrix(EDGES, NODE_COUNT);
  const labels = cncMode ? NODE_LABELS_CNC : NODE_LABELS_WEB;

  const W = 360, H = 260;
  const cx = W / 2, cy = H / 2 - 10;
  const R = 95;

  const positions = Array.from({ length: NODE_COUNT }, (_, i) => nodePos(i, NODE_COUNT, cx, cy, R));

  function stepIteration(r) {
    const newR = vecNorm(matVecMul(M, r));
    const diff = r.reduce((s, v, i) => s + Math.abs(v - newR[i]), 0);
    return { newR, converged: diff < 0.0001 };
  }

  function runStep() {
    setRanks(prev => {
      const { newR, converged: c } = stepIteration(prev);
      if (c) setConverged(true);
      return newR;
    });
    setIteration(i => i + 1);
  }

  function runAll() {
    setRunning(true);
    setConverged(false);
  }

  function reset() {
    setRanks(Array(NODE_COUNT).fill(1 / NODE_COUNT));
    setIteration(0);
    setRunning(false);
    setConverged(false);
  }

  useEffect(() => {
    if (!running) return;
    if (converged) { setRunning(false); return; }
    const id = setTimeout(() => {
      setRanks(prev => {
        const { newR, converged: c } = stepIteration(prev);
        if (c) setConverged(true);
        return newR;
      });
      setIteration(i => i + 1);
    }, 160);
    return () => clearTimeout(id);
  }, [running, converged, ranks]);

  const maxRank = Math.max(...ranks);

  // Draw edge arrow (curved if bidirectional)
  function EdgeArrow({ from, to }) {
    const [x1, y1] = positions[from];
    const [x2, y2] = positions[to];
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len, ny = dy / len;
    const nodeR = 18;
    const sx = x1 + nx * nodeR, sy = y1 + ny * nodeR;
    const ex = x2 - nx * (nodeR + 4), ey = y2 - ny * (nodeR + 4);
    // Slight curve
    const mx = (sx + ex) / 2 - ny * 12, my = (sy + ey) / 2 + nx * 12;
    const isSelected = selectedNode === from || selectedNode === to;
    return (
      <path d={`M${sx},${sy} Q${mx},${my} ${ex},${ey}`}
        fill="none"
        stroke={isSelected ? "#a78bfa" : "#475569"}
        strokeWidth={isSelected ? 2.5 : 1.5}
        markerEnd="url(#pageArr)"
        opacity={isSelected ? 1 : 0.6}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg max-w-[400px] font-sans">
      {/* Dots */}
      <div className="flex items-center gap-2 justify-center">
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === step ? "bg-violet-500 scale-125" : "bg-slate-300 dark:bg-slate-600"}`} />
        ))}
        <span className="ml-2 text-[10px] text-slate-400">{step + 1}/{STEPS.length}</span>
      </div>

      {/* Narration */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
        <div className="text-[13px] font-bold text-violet-600 dark:text-violet-400 mb-0.5">{STEPS[step].title}</div>
        <div className="text-[10px] text-violet-400 dark:text-violet-500 mb-1.5 font-medium">{STEPS[step].subtitle}</div>
        <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{STEPS[step].narration}</div>
      </div>

      {/* SVG Canvas */}
      <svg width={W} height={H} className="rounded-xl bg-slate-950 border border-slate-800" style={{ maxWidth: "100%" }}>
        <defs>
          <marker id="pageArr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#475569" />
          </marker>
        </defs>
        {/* Edges */}
        {EDGES.map(([f, t], i) => <EdgeArrow key={i} from={f} to={t} />)}

        {/* Nodes */}
        {positions.map(([x, y], i) => {
          const r = 16 + ranks[i] / maxRank * 10;
          const isTop = ranks[i] === maxRank && converged;
          return (
            <g key={i} style={{ cursor: "pointer" }} onClick={() => setSelectedNode(i === selectedNode ? null : i)}>
              <circle cx={x} cy={y} r={r + 4} fill={COLORS[i]} opacity={0.15 + ranks[i] * 0.7} />
              <circle cx={x} cy={y} r={r}
                fill={isTop ? COLORS[i] : NODE_COLORS_DIM[i]}
                stroke={selectedNode === i ? "#e2e8f0" : COLORS[i]}
                strokeWidth={selectedNode === i ? 2.5 : 1.5}
              />
              <text x={x} y={y + 1} fontSize={cncMode ? "7" : "11"} fill="white" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                {labels[i]}
              </text>
              <text x={x} y={y + r + 10} fontSize="8" fill={COLORS[i]} textAnchor="middle">
                {(ranks[i] * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Convergence label */}
        {converged && (
          <text x={W / 2} y={H - 6} fontSize="10" fill="#34d399" textAnchor="middle" fontWeight="bold">
            ✓ Converged after {iteration} iterations
          </text>
        )}
      </svg>

      {/* Bar chart — step 2 */}
      {step >= 2 && (
        <div className="bg-slate-900 rounded-lg p-2">
          <div className="text-[9px] text-slate-400 mb-1.5">PageRank scores (iteration {iteration})</div>
          <div className="flex items-end gap-1 h-10">
            {ranks.map((r, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="w-full rounded-t transition-all duration-150"
                  style={{ height: `${Math.max(4, r / maxRank * 40)}px`, backgroundColor: COLORS[i] }} />
                <span className="text-[8px] text-slate-400 mt-0.5">{labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matrix display — step 1 */}
      {step === 1 && (
        <div className="bg-slate-900 rounded-lg p-2 overflow-x-auto">
          <div className="text-[9px] text-slate-400 mb-1">Link matrix M (columns = vote distribution)</div>
          <div className="inline-flex gap-1 items-start">
            <div className="flex flex-col gap-0.5 mt-3">
              {labels.map((l, i) => <span key={i} className="text-[8px] font-bold h-4 flex items-center" style={{ color: COLORS[i] }}>{l}</span>)}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5 pl-0.5">
                {labels.map((l, j) => (
                  <span key={j} className="text-[8px] font-bold w-9 text-center"
                    style={{ color: selectedNode === j ? COLORS[j] : "#64748b" }}>{l}</span>
                ))}
              </div>
              {M.map((row, i) => (
                <div key={i} className="flex gap-0.5">
                  {row.map((val, j) => (
                    <span key={j} className="font-mono text-[9px] w-9 text-center py-0.5 rounded"
                      style={{
                        color: val > 0 ? COLORS[i] : "#334155",
                        backgroundColor: selectedNode === j && val > 0 ? "#1e1b4b" : "transparent",
                      }}>{val.toFixed(2)}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="text-[8px] text-slate-500 mt-1">← Click a node in the graph to highlight its column</div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        {step >= 2 && (
          <>
            <button onClick={runStep} disabled={running || converged}
              className="text-[10px] px-3 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 transition-colors">
              Step +1
            </button>
            <button onClick={runAll} disabled={running || converged}
              className="text-[10px] px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors">
              {running ? "Running…" : "Run PageRank"}
            </button>
            <button onClick={reset}
              className="text-[10px] px-3 py-1 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors">
              Reset
            </button>
          </>
        )}
        {step === 3 && (
          <button onClick={() => setCncMode(m => !m)}
            className={`text-[10px] px-3 py-1 rounded-lg border transition-colors ${cncMode ? "bg-amber-600 text-white border-amber-700" : "bg-slate-700 text-white border-slate-600"}`}>
            {cncMode ? "Machining Mode ✓" : "Switch: Machining Workflow"}
          </button>
        )}
      </div>

      {/* Eigenvalue equation */}
      {step === 3 && converged && (
        <div className="bg-slate-900 rounded-lg p-2 text-center font-mono text-[10px] text-violet-300">
          M·r* = r* (λ=1 eigenvector verified ✓)
          <div className="text-[9px] text-slate-500 mt-0.5">
            r* = [{ranks.map(r => (r * 100).toFixed(1) + "%").join(", ")}]
          </div>
        </div>
      )}

      {/* Try it */}
      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-2 border border-violet-100 dark:border-violet-800">
        <div className="text-[9px] font-semibold text-violet-500 mb-1">💡 Try it</div>
        {step === 0 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Observe which nodes have the most incoming arrows — they should score highest after convergence. D and A are popular targets.</p>}
        {step === 1 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Click node D — its column shows it splits votes evenly to A and E. Notice each column sums to 1.0.</p>}
        {step === 2 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Click "Run PageRank" and watch the bars converge. Which node scores highest? Try "Step +1" to see each iteration.</p>}
        {step === 3 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Switch to Machining Workflow — same matrix, same eigenvector, but now it tells you which manufacturing step is the most critical bottleneck!</p>}
      </div>

      {/* Nav */}
      <div className="flex justify-between items-center pt-1">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="text-[11px] px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          ← Prev
        </button>
        <span className="text-[10px] text-slate-400">PageRank Eigenvector</span>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="text-[11px] px-3 py-1 rounded-lg bg-violet-500 text-white border border-violet-600 disabled:opacity-30 hover:bg-violet-600 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}
