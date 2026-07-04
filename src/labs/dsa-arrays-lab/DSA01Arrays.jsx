import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useThemeColors, withAlpha } from "../../hooks/useThemeColors.js";
import { useGlobalTheme } from "../../context/ThemeContext.jsx";
import Editor from "@monaco-editor/react";
import { setupOpenCalcMonaco } from "../../utils/monacoThemes.js";

// ─────────────────────────────────────────────────────────────────────────────
//  DSA SERIES — LAB 01: ARRAYS & MEMORY
//  Theme: serious hacker workstation. Fixed-hex canvas colors.
//  Canvas cannot resolve CSS variables — always use hex here.
// ─────────────────────────────────────────────────────────────────────────────

// Canvas-safe fixed palette (NOT CSS vars)
const HEX = {
  dark: {
    bg:      "#080c0f",
    surface: "#0d1117",
    panel:   "#111820",
    border:  "#1e2730",
    border2: "#263040",
    green:   "#00ff88",
    blue:    "#4fc3f7",
    amber:   "#ffb347",
    red:     "#ff4d6d",
    purple:  "#c084fc",
    muted:   "#3d5060",
    text:    "#c9d8e8",
    textDim: "#5a7080",
    bright:  "#e8f4ff",
    dim:     "#1e2a34",
  },
  light: {
    bg:      "#f8fafc",
    surface: "#ffffff",
    panel:   "#f1f5f9",
    border:  "#e2e8f0",
    border2: "#cbd5e1",
    green:   "#16a34a",
    blue:    "#2563eb",
    amber:   "#d97706",
    red:     "#dc2626",
    purple:  "#7c3aed",
    muted:   "#64748b",
    text:    "#1e293b",
    textDim: "#475569",
    bright:  "#0f172a",
    dim:     "#f1f5f9",
  },
};

// ── REFERENCE IMPLEMENTATIONS ──────────────────────────────────────────────
const ref_arrayGet    = (arr, i)     => (i >= 0 && i < arr.length ? arr[i] : null);
const ref_arrayInsert = (arr, i, v)  => { const a = [...arr]; a.splice(i, 0, v); return a; };
const ref_arrayDelete = (arr, i)     => { const a = [...arr]; a.splice(i, 1); return a; };
const ref_linearSearch = (arr, v)    => arr.findIndex(x => x === v);
const ref_binarySearch = (arr, v)    => {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (arr[mid] === v) return mid;
    arr[mid] < v ? (lo = mid + 1) : (hi = mid - 1);
  }
  return -1;
};

// ── STEP TRACERS ─────────────────────────────────────────────────────────
// codePattern: string Monaco will search for in the user's code to highlight
// the line being executed at this step.

const traceInsert = (arr, idx, val) => {
  const steps = [], a = [...arr];
  steps.push({ state: [...a], highlight: null, note: `Insert ${val} at index ${idx} — need to shift elements right`, phase: "start", codePattern: "function " });
  for (let i = a.length - 1; i >= idx; i--) {
    a[i + 1] = a[i];
    steps.push({ state: [...a, 0].slice(0, a.length + 1), highlight: i, note: `Shift a[${i}] → a[${i+1}]`, phase: "shift", codePattern: "i - 1" });
  }
  a[idx] = val;
  steps.push({ state: [...a], highlight: idx, note: `Write ${val} at index ${idx} ✓`, phase: "write", codePattern: "= val" });
  return steps;
};

const traceDelete = (arr, idx) => {
  const steps = [], a = [...arr];
  steps.push({ state: [...a], highlight: idx, note: `Delete a[${idx}] = ${a[idx]} — shift elements left to fill gap`, phase: "start", codePattern: "function " });
  for (let i = idx; i < a.length - 1; i++) {
    a[i] = a[i + 1];
    steps.push({ state: [...a], highlight: i, note: `Shift a[${i+1}] → a[${i}]`, phase: "shift", codePattern: "i + 1" });
  }
  a.pop();
  steps.push({ state: [...a], highlight: null, note: `Done — length is now ${a.length}`, phase: "done", codePattern: "return" });
  return steps;
};

const traceBinarySearch = (arr, val) => {
  const steps = [];
  let lo = 0, hi = arr.length - 1;
  steps.push({ kind:"array", state: [...arr], lo, hi, mid: null, note: `lo=${lo}, hi=${hi} — begin search for ${val}`, found: -1, codePattern: "while" });
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    steps.push({ kind:"array", state: [...arr], lo, hi, mid, note: `mid = ${mid}  →  arr[${mid}] = ${arr[mid]}`, found: -1, codePattern: "mid" });
    if (arr[mid] === val) {
      steps.push({ kind:"array", state: [...arr], lo, hi, mid, note: `arr[${mid}] === ${val} ✓ Found!`, found: mid, codePattern: "=== target" });
      break;
    }
    if (arr[mid] < val) {
      lo = mid + 1;
      steps.push({ kind:"array", state: [...arr], lo, hi, mid: null, note: `${arr[mid]} < ${val} → discard left half. lo = ${lo}`, found: -1, codePattern: "lo = mid" });
    } else {
      hi = mid - 1;
      steps.push({ kind:"array", state: [...arr], lo, hi, mid: null, note: `${arr[mid]} > ${val} → discard right half. hi = ${hi}`, found: -1, codePattern: "hi = mid" });
    }
  }
  if (steps[steps.length - 1].found === -1)
    steps.push({ kind:"array", state: [...arr], lo, hi, mid: null, note: `lo(${lo}) > hi(${hi}) — search space empty. Not found.`, found: -2, codePattern: "return -1" });
  return steps;
};

// ── LINKED LIST HELPERS ───────────────────────────────────────────────────
const listFrom = (arr) => {
  if (!arr.length) return null;
  let head = { val: arr[arr.length - 1], next: null };
  for (let i = arr.length - 2; i >= 0; i--) head = { val: arr[i], next: head };
  return head;
};
const listToArr = (head) => {
  const r = []; let c = head;
  while (c) { r.push(c.val); c = c.next; }
  return r;
};

// ── BST HELPERS ───────────────────────────────────────────────────────────
const _bstIns = (n, v) => {
  if (!n) return { val: v, left: null, right: null };
  if (v < n.val) return { ...n, left: _bstIns(n.left, v) };
  if (v > n.val) return { ...n, right: _bstIns(n.right, v) };
  return n;
};
const bstFromArr = (arr) => arr.reduce((root, v) => _bstIns(root, v), null);
const _inOrd = (n, r = []) => { if (!n) return r; _inOrd(n.left, r); r.push(n.val); _inOrd(n.right, r); return r; };

// ── LINKED LIST TRACERS ───────────────────────────────────────────────────
const traceListTraverse = (head, target) => {
  const steps = [];
  const nodes = listToArr(head);
  steps.push({ kind:"list", nodes, highlight: -1, note: `current = head  →  list is [${nodes.join(" → ")}]`, phase:"start", codePattern: "current =" });
  for (let i = 0; i < nodes.length; i++) {
    const found = nodes[i] === target;
    if (!found) {
      steps.push({ kind:"list", nodes, highlight: i, note: `current.val = ${nodes[i]} ≠ ${target}  →  advance current = current.next`, phase:"scan", codePattern: "current = current.next" });
    } else {
      steps.push({ kind:"list", nodes, highlight: i, note: `current.val = ${nodes[i]} === ${target} ✓  Found!`, phase:"found", codePattern: "current.val" });
      break;
    }
  }
  return steps;
};

const traceListInsertHead = (head, val) => {
  const steps = [];
  const nodes = listToArr(head);
  steps.push({ kind:"list", nodes, highlight: -1, newNode: val, note: `const newNode = { val: ${val}, next: null }  — allocate new node`, phase:"create", codePattern: "newNode =" });
  steps.push({ kind:"list", nodes, highlight: 0, newNode: val, note: `newNode.next = head  — point new node at current first node`, phase:"link", codePattern: "newNode.next" });
  const newNodes = [val, ...nodes];
  steps.push({ kind:"list", nodes: newNodes, highlight: 0, newNode: null, note: `return newNode  — new node IS the head ✓  O(1) — no loop needed!`, phase:"done", codePattern: "return newNode" });
  return steps;
};

const traceListDelete = (head, val) => {
  const steps = [];
  const nodes = listToArr(head);
  steps.push({ kind:"list", nodes, highlight: -1, note: `deleteFirst(list, ${val})  — scanning for target`, phase:"start", codePattern: "function " });
  if (nodes[0] === val) {
    steps.push({ kind:"list", nodes, highlight: 0, note: `head.val === ${val}  — target is HEAD, return head.next`, phase:"scan", codePattern: "head.val === val" });
    steps.push({ kind:"list", nodes: nodes.slice(1), highlight: -1, note: `Done. New HEAD is ${nodes[1] ?? "null"} ✓`, phase:"done", codePattern: "return head.next" });
    return steps;
  }
  for (let i = 0; i < nodes.length - 1; i++) {
    steps.push({ kind:"list", nodes, highlight: i, note: `current.next.val = ${nodes[i+1]}  — is it ${val}?`, phase:"scan", codePattern: "current.next.val === val" });
    if (nodes[i+1] === val) {
      steps.push({ kind:"list", nodes, highlight: i, deletedIdx: i+1, note: `Yes! current.next = current.next.next  — bypass node(${val})`, phase:"bypass", codePattern: "current.next = current.next.next" });
      const newNodes = [...nodes.slice(0, i+1), ...nodes.slice(i+2)];
      steps.push({ kind:"list", nodes: newNodes, highlight: -1, note: `Node ${val} removed ✓  return head`, phase:"done", codePattern: "return head" });
      return steps;
    }
    steps.push({ kind:"list", nodes, highlight: i, note: `No. current = current.next  →  advance`, phase:"scan", codePattern: "current = current.next" });
  }
  steps.push({ kind:"list", nodes, highlight: -1, note: `${val} not found — return head unchanged`, phase:"done", codePattern: "return head" });
  return steps;
};

const traceBSTSearch = (root, target) => {
  const steps = [];
  let node = root;
  steps.push({ kind:"bst", tree: root, highlight: -1, found: false, note: `bstSearch(root, ${target})  — start at root`, codePattern: "function " });
  while (node) {
    steps.push({ kind:"bst", tree: root, highlight: node.val, found: false, note: `node.val = ${node.val}  — is it ${target}?`, codePattern: "node.val === target" });
    if (node.val === target) {
      steps.push({ kind:"bst", tree: root, highlight: node.val, found: true, note: `node.val === ${target} ✓  return true`, codePattern: "return true" });
      return steps;
    }
    if (target < node.val) {
      steps.push({ kind:"bst", tree: root, highlight: node.val, found: false, note: `${target} < ${node.val}  → go LEFT (discard entire right subtree)`, codePattern: "node.left" });
      node = node.left;
    } else {
      steps.push({ kind:"bst", tree: root, highlight: node.val, found: false, note: `${target} > ${node.val}  → go RIGHT (discard entire left subtree)`, codePattern: "node.right" });
      node = node.right;
    }
  }
  steps.push({ kind:"bst", tree: root, highlight: -1, found: false, note: `Reached null — ${target} not in tree. return false`, codePattern: "return false" });
  return steps;
};


// ── JS RUNNER ────────────────────────────────────────────────────────────
const runJS = (lesson, code) => {
  try {
    const fnMatch = code.match(/function\s+(\w+)/);
    if (!fnMatch) return { error: "No function definition found." };
    // eslint-disable-next-line no-new-func
    const fn = new Function(code + `; return ${fnMatch[1]};`)();
    return { testResult: lesson.testFn(fn), error: null };
  } catch (e) {
    return { error: e.message || String(e) };
  }
};

// ── MEMORY VISUALIZER ────────────────────────────────────────────────────
function MemoryViz({ arr, highlight, lo, hi, mid, found, phase, label, C }) {
  const BASE = 0x7fff1000;
  return (
    <div style={{ overflowX: "auto" }}>
      {/* Address row */}
      <div style={{ display: "flex", gap: 0, marginBottom: 2 }}>
        <div style={{ width: 56, flexShrink: 0 }} />
        {arr.map((_, i) => (
          <div key={i} style={{ width: 52, flexShrink: 0, textAlign: "center", fontSize: 7, color: C.muted, fontFamily: "monospace", letterSpacing: -0.5 }}>
            {`0x${(BASE + i * 4).toString(16)}`}
          </div>
        ))}
      </div>
      {/* Index row */}
      <div style={{ display: "flex", gap: 0, marginBottom: 3 }}>
        <div style={{ width: 56, flexShrink: 0, fontSize: 8, color: C.muted, fontFamily: "monospace", paddingTop: 4 }}>index</div>
        {arr.map((_, i) => (
          <div key={i} style={{ width: 52, flexShrink: 0, textAlign: "center", fontSize: 9, color: C.textDim, fontFamily: "monospace" }}>
            [{i}]
          </div>
        ))}
      </div>
      {/* Cells */}
      <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
        <div style={{ width: 56, flexShrink: 0, fontSize: 8, color: C.muted, fontFamily: "monospace", paddingTop: 14 }}>mem</div>
        {arr.map((v, i) => {
          const isFound = found === i, isMid = mid === i, isHL = highlight === i;
          const inRange = lo !== undefined && hi !== undefined && i >= lo && i <= hi;
          let bg = C.dim, border = `1px solid ${C.border2}`, textCol = C.text;
          if (isFound) { bg = "#1a4020"; border = `1px solid ${C.green}`; textCol = C.green; }
          else if (isMid) { bg = "#1a1a40"; border = `1px solid ${C.blue}`; textCol = C.blue; }
          else if (isHL && phase === "shift") { bg = "#2a1a00"; border = `1px solid ${C.amber}`; textCol = C.amber; }
          else if (isHL && phase === "write") { bg = "#0f2010"; border = `1px solid ${C.green}`; textCol = C.green; }
          else if (isHL) { bg = "#2a0810"; border = `1px solid ${C.red}`; textCol = C.red; }
          else if (inRange) { bg = "#0d1420"; border = `1px solid #1e2d45`; }
          return (
            <div key={i} style={{ width: 52, flexShrink: 0 }}>
              <div style={{ height: 44, background: bg, border, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: textCol, transition: "all .18s" }}>
                {v}
              </div>
              <div style={{ height: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                {lo === i && <span style={{ fontSize: 8, color: C.purple, fontFamily: "monospace" }}>lo</span>}
                {mid === i && <span style={{ fontSize: 8, color: C.blue, fontFamily: "monospace" }}>mid</span>}
                {hi === i && <span style={{ fontSize: 8, color: C.purple, fontFamily: "monospace" }}>hi</span>}
              </div>
            </div>
          );
        })}
      </div>
      {label && (
        <div style={{ marginTop: 10, fontFamily: "monospace", fontSize: 11, color: C.textDim, lineHeight: 1.5, padding: "6px 10px", background: C.dim, borderRadius: 4, borderLeft: `2px solid ${C.border2}` }}>
          {label}
        </div>
      )}
    </div>
  );
}

// ── COMPLEXITY CHART — uses canvas-safe hex colors ───────────────────────
function ComplexityChart({ active, C }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.panel;
    ctx.fillRect(0, 0, W, H);

    const PAD = 36, plotW = W - PAD * 2, plotH = H - PAD * 2;
    const maxN = 100, maxOps = 200;

    // Grid lines
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const x = PAD + i * (plotW / 4);
      const y = PAD + i * (plotH / 4);
      ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, PAD + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(PAD + plotW, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PAD, PAD); ctx.lineTo(PAD, PAD + plotH); ctx.lineTo(PAD + plotW, PAD + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = C.muted; ctx.font = `9px monospace`;
    ctx.fillText("n (input size)", PAD + plotW / 2 - 24, H - 6);
    ctx.save(); ctx.translate(12, PAD + plotH / 2 + 20); ctx.rotate(-Math.PI / 2);
    ctx.fillText("operations", 0, 0); ctx.restore();

    const curves = [
      { key: "1",     label: "O(1)",     fn: () => 1,                           col: C.green  },
      { key: "log n", label: "O(log n)", fn: n => Math.log2(n + 1) * 10,        col: C.blue   },
      { key: "n",     label: "O(n)",     fn: n => n * 2,                        col: C.amber  },
    ];

    curves.forEach(({ key, label, fn, col }) => {
      const isActive = active && active.includes(key);
      ctx.strokeStyle = isActive ? col : col + "44";
      ctx.lineWidth   = isActive ? 2.5 : 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      let first = true;
      for (let n = 1; n <= maxN; n++) {
        const ops = fn(n);
        const x = PAD + (n / maxN) * plotW;
        const y = PAD + plotH - (Math.min(ops, maxOps) / maxOps) * plotH;
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        first = false;
      }
      ctx.stroke();

      // Label at 80% of the way across
      const lN = maxN * 0.8;
      const lOps = fn(lN);
      const lx = PAD + (lN / maxN) * plotW + 4;
      const ly = PAD + plotH - (Math.min(lOps, maxOps) / maxOps) * plotH;
      if (ly > PAD + 6 && ly < PAD + plotH - 4) {
        ctx.fillStyle = isActive ? col : col + "66";
        ctx.font = `${isActive ? "bold " : ""}${isActive ? 10 : 9}px monospace`;
        ctx.fillText(label, lx, ly);
      }
    });
  }, [active, C]);

  return (
    <canvas
      ref={canvasRef}
      width={300} height={160}
      style={{ width: "100%", borderRadius: 6, border: `1px solid ${C.border}`, display: "block" }}
    />
  );
}

// ── LIST VISUALIZER ──────────────────────────────────────────────────────
function ListViz({ nodes, highlight, newNode, deletedIdx, note, C }) {
  const mono = "'JetBrains Mono','Fira Code',monospace";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, marginBottom: 10 }}>
        {/* HEAD label */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 4 }}>
          <span style={{ fontSize: 8, color: C.green, fontFamily: mono, marginBottom: 2, fontWeight: 700 }}>HEAD</span>
          <span style={{ fontSize: 14, color: C.green }}>→</span>
        </div>

        {/* New node being inserted (shown before list) */}
        {newNode != null && (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 8, color: C.purple, fontFamily: mono, marginBottom: 2 }}>new</span>
              <div style={{ width: 40, height: 40, borderRadius: 6, background: `${C.purple}22`, border: `2px solid ${C.purple}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.purple }}>
                {newNode}
              </div>
            </div>
            <span style={{ fontSize: 14, color: C.purple, margin: "0 4px", alignSelf: "center", paddingTop: 14 }}>→</span>
          </>
        )}

        {/* List nodes */}
        {nodes.map((v, i) => {
          const isHL = highlight === i;
          const isDel = deletedIdx === i;
          let borderCol = C.border2, bgCol = C.dim, textCol = C.text;
          if (isDel)  { borderCol = C.red;    bgCol = `${C.red}20`;    textCol = C.red; }
          else if (isHL) { borderCol = C.blue; bgCol = `${C.blue}20`; textCol = C.blue; }
          return (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 8, color: C.muted, fontFamily: mono, marginBottom: 2 }}>[{i}]</span>
                <div style={{
                  width: 40, height: 40, borderRadius: 6,
                  background: bgCol, border: `2px solid ${borderCol}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: mono, fontSize: 14, fontWeight: 700, color: textCol,
                  transition: "all .18s",
                  opacity: isDel ? 0.4 : 1,
                  textDecoration: isDel ? "line-through" : "none",
                }}>
                  {v}
                </div>
              </div>
              {i < nodes.length - 1 ? (
                <span style={{ fontSize: 12, color: isDel && deletedIdx === i ? C.red : C.muted, margin: "0 3px", paddingTop: 14 }}>→</span>
              ) : (
                <span style={{ fontSize: 11, color: C.muted, margin: "0 6px", paddingTop: 14, fontFamily: mono }}>→ null</span>
              )}
            </div>
          );
        })}
        {nodes.length === 0 && (
          <span style={{ fontSize: 11, color: C.muted, fontFamily: mono, paddingTop: 14 }}>null (empty list)</span>
        )}
      </div>
      {note && (
        <div style={{ fontFamily: mono, fontSize: 11, color: C.textDim, lineHeight: 1.5, padding: "6px 10px", background: C.dim, borderRadius: 4, borderLeft: `2px solid ${C.border2}` }}>
          {note}
        </div>
      )}
    </div>
  );
}

// ── BST VISUALIZER ────────────────────────────────────────────────────────
function TreeNode({ node, highlight, found, C, depth = 0 }) {
  if (!node) return <div style={{ width: 40, opacity: 0 }} />;
  const mono = "'JetBrains Mono','Fira Code',monospace";
  const isHL = highlight === node.val;
  const isFound = found && isHL;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: isFound ? `${C.green}30` : isHL ? `${C.blue}30` : C.dim,
        border: `2px solid ${isFound ? C.green : isHL ? C.blue : C.border2}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: mono, fontSize: 13, fontWeight: 700,
        color: isFound ? C.green : isHL ? C.blue : C.text,
        transition: "all .2s",
        boxShadow: isFound ? `0 0 10px ${C.green}44` : isHL ? `0 0 10px ${C.blue}44` : "none",
      }}>
        {node.val}
      </div>
      {(node.left || node.right) && (
        <div style={{ display: "flex", gap: Math.max(4, 32 - depth * 10), marginTop: 4 }}>
          <TreeNode node={node.left}  highlight={highlight} found={found} C={C} depth={depth+1} />
          <TreeNode node={node.right} highlight={highlight} found={found} C={C} depth={depth+1} />
        </div>
      )}
    </div>
  );
}
function TreeViz({ tree, highlight, found, note, C }) {
  const mono = "'JetBrains Mono','Fira Code',monospace";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 12px" }}>
        <TreeNode node={tree} highlight={highlight} found={found} C={C} />
      </div>
      {note && (
        <div style={{ fontFamily: mono, fontSize: 11, color: C.textDim, lineHeight: 1.5, padding: "6px 10px", background: C.dim, borderRadius: 4, borderLeft: `2px solid ${C.border2}` }}>
          {note}
        </div>
      )}
    </div>
  );
}

// ── ANNOTATED PSEUDOCODE ──────────────────────────────────────────────────
// Each line can have an optional annotation explaining what it means
function PseudoBlock({ lines, C }) {
  const [hoveredLine, setHoveredLine] = useState(null);
  return (
    <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.9, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      {/* Header bar */}
      <div style={{ padding: "6px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8, background: C.dim }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>pseudocode</span>
        <span style={{ fontSize: 9, color: C.muted }}>— hover a line to explain it</span>
      </div>
      {/* Lines */}
      <div style={{ padding: "8px 0" }}>
        {lines.map((line, i) => {
          const isHovered = hoveredLine === i;
          const isComment = line.code.trimStart().startsWith("//") || line.code.trimStart().startsWith("--");
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredLine(i)}
              onMouseLeave={() => setHoveredLine(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "0 14px",
                background: isHovered && line.note ? `${C.blue}12` : "transparent",
                borderLeft: isHovered && line.note ? `3px solid ${C.blue}` : "3px solid transparent",
                cursor: line.note ? "help" : "default",
                transition: "background 0.1s",
              }}
            >
              {/* The code line */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 26 }}>
                <span style={{
                  color: isComment ? C.muted
                       : line.code.trimStart().startsWith("FUNCTION") || line.code.trimStart().startsWith("IF") || line.code.trimStart().startsWith("FOR") || line.code.trimStart().startsWith("WHILE") || line.code.trimStart().startsWith("RETURN") || line.code.trimStart().startsWith("ELSE")
                         ? C.blue : C.text,
                  whiteSpace: "pre",
                  flex: 1,
                }}>
                  {line.code}
                </span>
                {line.note && !isHovered && (
                  <span style={{ fontSize: 9, color: C.muted, opacity: 0.5 }}>(?)</span>
                )}
                {line.note && isHovered && (
                  <span style={{ fontSize: 9, color: C.blue, fontWeight: 600 }}>↑</span>
                )}
              </div>
              {/* Annotation bubble */}
              {isHovered && line.note && (
                <div style={{
                  margin: "2px 0 6px 0",
                  padding: "7px 12px",
                  background: `${C.blue}18`,
                  border: `1px solid ${C.blue}44`,
                  borderRadius: 6,
                  fontSize: 11,
                  color: C.text,
                  lineHeight: 1.6,
                }}>
                  {line.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LESSONS DATA ──────────────────────────────────────────────────────────
// Each lesson has annotated pseudocode (array of {code, note} objects)
const LESSONS_DATA = [
  {
    id: 0, title: "Memory Layout", shortTitle: "Memory",
    colorKey: "green", osHook: "Virtual Address Space",
    concept: [
      { head: "What an array actually is", body: `An array is a contiguous block of memory.
Every element sits at a fixed, calculated address:

  address(i) = base_address + i × element_size

This is why array access is O(1) — the CPU
computes the address directly, no searching.

For a 32-bit integer array at base 0x7fff1000:
  a[0] → 0x7fff1000
  a[1] → 0x7fff1004  (+4 bytes)
  a[2] → 0x7fff1008  (+8 bytes)` },
      { head: "Virtual memory", body: `When you declare an array, the OS allocates
virtual memory pages (4096 bytes each) and maps
them to physical RAM.

Your process sees addresses like 0x7fff1000.
The CPU's MMU translates these to physical RAM.

malloc() asks the OS for pages via brk() or mmap().` },
      { head: "Cache lines", body: `The CPU fetches 64-byte cache lines. Arrays are
cache-friendly: sequential access loads one cache
line covering 16 int elements at once.

Linked lists are cache-hostile: each node is at a
random address → cache miss every step.
This is why arrays beat linked lists for iteration
even when Big-O looks the same.` },
    ],
    pseudoLines: [
      { code: "FUNCTION get(arr, i):", note: "Define a function that takes an array and an index" },
      { code: "  IF i < 0 OR i >= arr.length:", note: "Bounds check: negative index or past the end are invalid" },
      { code: "    RETURN null", note: "Return null (not a crash) — safe bounds guard" },
      { code: "  address ← base + i × sizeof(element)", note: "Math: jump to position i in memory. No loop needed!" },
      { code: "  RETURN memory[address]", note: "Fetch the value at that address — one CPU instruction" },
      { code: "", note: null },
      { code: "// Complexity: O(1) — always, regardless of array size", note: "O(1) means constant time: the same one formula whether n=10 or n=1,000,000,000" },
    ],
    starterCode: `function arrayGet(arr, i) {
  // Fill in the blanks — replace ___ with your code
  // Hint: check if i is out of bounds, return null if so
  // Otherwise return arr[i]
  ___
}`,
    blanks: ["___"],
    solutions: [`  if (i < 0 || i >= arr.length) return null;\n  return arr[i];`],
    testFn: fn => {
      const a = [10, 20, 30, 40, 50];
      const r0 = fn(a, 0), r2 = fn(a, 2), rn = fn(a, -1), ro = fn(a, 10);
      return {
        ok: r0 === 10 && r2 === 30 && rn === null && ro === null,
        result: r2,
        checks: [
          { label: "arrayGet([10,20,30,40,50], 0) === 10", pass: r0 === 10 },
          { label: "arrayGet([10,20,30,40,50], 2) === 30", pass: r2 === 30 },
          { label: "arrayGet(arr, -1) === null  (bounds check)", pass: rn === null },
          { label: "arrayGet(arr, 10) === null  (out of range)", pass: ro === null },
        ],
      };
    },
    complexity: { active: ["1"], label: "O(1) — one formula, no loop" },
    osNote: "RAM itself is a giant array. Your CPU accesses any byte in ~70ns regardless of address — the DRAM controller computes row/column from address directly. Same O(1) logic as array indexing.",
  },
  {
    id: 1, title: "Insert & Shift", shortTitle: "Insert",
    colorKey: "blue", osHook: "Buffer Management",
    concept: [
      { head: "Why insert is O(n)", body: `Arrays store elements contiguously. Inserting
at index i requires shifting every element from
i to end one position right to make room.

Worst case: insert at index 0 → shift ALL n elements.
Best case:  insert at end    → no shifting needed.
Average:    shift n/2 elements → O(n).` },
      { head: "OS: keyboard buffer", body: `Your keyboard input is managed by the kernel
using a circular buffer (a fixed-size array).

When you type faster than the CPU processes,
keystrokes queue in this buffer. When full,
characters are dropped — that's why fast typists
sometimes lose keystrokes in a slow terminal.` },
      { head: "Amortized O(1) appending", body: `JavaScript arrays double in capacity when full.

- n/2 appends: no resize, O(1) each
- 1 resize: O(n) copy

Total cost for n appends: O(n)
Amortized per append: O(1)

This is why arr.push() is "effectively O(1)"
even though occasionally it copies everything.` },
    ],
    pseudoLines: [
      { code: "FUNCTION insert(arr, i, val):", note: "Insert val at position i, shifting everything else right" },
      { code: "  // Make space: shift elements right from the end", note: null },
      { code: "  FOR j FROM arr.length - 1 DOWN TO i:", note: "Start from the LAST element and work backwards — if we went forward we'd overwrite values before copying them" },
      { code: "    arr[j + 1] ← arr[j]", note: "Copy each element one slot to the right, making a gap" },
      { code: "", note: null },
      { code: "  arr[i] ← val", note: "Now that the gap exists at index i, write the new value" },
      { code: "  arr.length ← arr.length + 1", note: "The array is now one element longer" },
      { code: "", note: null },
      { code: "// Complexity: O(n) — must shift up to n elements", note: "Worst case: inserting at index 0 shifts ALL n elements. Average: n/2." },
    ],
    starterCode: `function arrayInsert(arr, i, val) {
  const a = [...arr]; // clone — never mutate input

  // YOUR CODE A ↓
  // Shift elements from index i rightward (start from end!)
  ___A___

  // YOUR CODE B ↓
  // Write val into position i
  ___B___

  return a;
}`,
    blanks: ["___A___", "___B___"],
    solutions: [
      `  for (let j = a.length - 1; j >= i; j--) a[j + 1] = a[j];`,
      `  a[i] = val;`,
    ],
    testFn: fn => {
      const a = [1, 2, 3, 4, 5];
      const r0 = fn(a, 0, 99), rm = fn(a, 2, 99), re = fn(a, 5, 99);
      const ok = JSON.stringify(r0) === "[99,1,2,3,4,5]" && JSON.stringify(rm) === "[1,2,99,3,4,5]";
      return {
        ok, result: rm,
        checks: [
          { label: "insert([1..5], 0, 99) → [99,1,2,3,4,5]", pass: JSON.stringify(r0) === "[99,1,2,3,4,5]" },
          { label: "insert([1..5], 2, 99) → [1,2,99,3,4,5]", pass: JSON.stringify(rm) === "[1,2,99,3,4,5]" },
          { label: "insert([1..5], 5, 99) → [1,2,3,4,5,99]", pass: JSON.stringify(re) === "[1,2,3,4,5,99]" },
          { label: "Original array not mutated", pass: a.length === 5 },
        ],
      };
    },
    multi: true, hasTrace: true, traceType: "insert",
    complexity: { active: ["n"], label: "O(n) — may shift all n elements" },
    osNote: "Keyboard driver → ring buffer insert. Network packet → sk_buff queue insert. Process creation → task list insert. All in the Linux kernel — all O(n) worst case without ring buffer tricks.",
  },
  {
    id: 2, title: "Delete & Compact", shortTitle: "Delete",
    colorKey: "amber", osHook: "Memory Compaction",
    concept: [
      { head: "Deletion is also O(n)", body: `Deleting from index i requires shifting every
element from i+1 onward one position left.

Without this shift you'd have a "hole" — an
invalid element in the middle. The array
would no longer be contiguous.` },
      { head: "OS: memory fragmentation", body: `When the OS frees memory, it leaves holes in the
heap — allocated blocks surrounded by free space
too small to reuse.

Some GC languages (Java, Go) run a compaction
phase: copy live objects to one end, slide them
together — exactly the array delete shift,
applied to the entire heap.` },
      { head: "Lazy deletion", body: `Instead of shifting on every delete, some
systems mark the slot as "deleted" with a
tombstone value and only compact periodically.

Hash tables use this (App 8 of this series).
It turns O(n) delete into O(1) amortized,
at the cost of wasted space and slower search.` },
    ],
    pseudoLines: [
      { code: "FUNCTION delete(arr, i):", note: "Remove the element at index i, compacting the gap" },
      { code: "  // Compact: shift elements left to fill the gap", note: null },
      { code: "  FOR j FROM i TO arr.length - 2:", note: "Go FORWARD from i — opposite direction from insert, because we're filling left not making space right" },
      { code: "    arr[j] ← arr[j + 1]", note: "Copy the next element over the current, closing the gap" },
      { code: "", note: null },
      { code: "  arr.length ← arr.length - 1", note: "Shrink the logical size — the physical memory doesn't change" },
      { code: "  RETURN arr", note: null },
      { code: "", note: null },
      { code: "// Complexity: O(n) — must shift up to n elements", note: "Worst case: deleting index 0 shifts ALL n-1 elements left." },
    ],
    starterCode: `function arrayDelete(arr, i) {
  const a = [...arr];

  // YOUR CODE ↓
  // Shift elements from i+1 leftward (go forward this time!)
  // Loop: j from i to a.length-2, set a[j] = a[j+1]
  // Then shrink: a.length -= 1  OR  a.pop()
  ___

  return a;
}`,
    blanks: ["___"],
    solutions: [`  for (let j = i; j < a.length - 1; j++) a[j] = a[j + 1];\n  a.pop();`],
    testFn: fn => {
      const a = [10, 20, 30, 40, 50];
      const r0 = fn(a, 0), rm = fn(a, 2), re = fn(a, 4);
      return {
        ok: JSON.stringify(r0) === "[20,30,40,50]" && JSON.stringify(rm) === "[10,20,40,50]",
        result: rm,
        checks: [
          { label: "delete([10..50], 0) → [20,30,40,50]", pass: JSON.stringify(r0) === "[20,30,40,50]" },
          { label: "delete([10..50], 2) → [10,20,40,50]", pass: JSON.stringify(rm) === "[10,20,40,50]" },
          { label: "delete([10..50], 4) → [10,20,30,40]", pass: JSON.stringify(re) === "[10,20,30,40]" },
          { label: "Length decreases by 1", pass: r0.length === 4 },
        ],
      };
    },
    hasTrace: true, traceType: "delete",
    complexity: { active: ["n"], label: "O(n) — may shift all n elements" },
    osNote: "When a process exits, the kernel removes its task_struct from the process list. Linux uses a doubly-linked list here — O(1) delete with no shifting. That's why: right tool for the job.",
  },
  {
    id: 3, title: "Linear Search", shortTitle: "Linear",
    colorKey: "purple", osHook: "File System Lookup",
    concept: [
      { head: "O(n) — scan every element", body: `Linear search checks each element in order
until it finds the target or exhausts the array.

Best case:  target is at index 0      → O(1)
Worst case: target at end or absent   → O(n)
Average:    target at random position → O(n)

No assumptions about ordering. Works on any array.
The only search option for unsorted data.` },
      { head: "OS: directory lookup", body: `Early filesystems (FAT12, FAT16) stored directory
entries as a flat array. Finding a file required
scanning every entry — O(n) linear search.

With 1000 files, finding one file meant reading
1000 directory entries from disk.

Modern filesystems (ext4, NTFS, APFS) use B-trees
for directories — O(log n) lookup.` },
      { head: "When linear search wins", body: `Despite O(n), linear search beats binary search
for small arrays (n < ~20) because:

1. No sort requirement
2. CPU branch prediction favors sequential access
3. Entire small array fits in L1 cache (32KB)
4. No overhead of computing midpoints

Real implementations often use linear for small
arrays and binary/hash for larger.` },
    ],
    pseudoLines: [
      { code: "FUNCTION linearSearch(arr, target):", note: "Find the first index where arr[i] equals target" },
      { code: "  FOR i FROM 0 TO arr.length - 1:", note: "Visit every element, left to right, in order" },
      { code: "    IF arr[i] = target:", note: "Check if this is the one we're looking for" },
      { code: "      RETURN i", note: "Found it! Return the index immediately — no need to keep looking" },
      { code: "", note: null },
      { code: "  RETURN -1", note: "We checked every element and never found it. Return -1 as the 'not found' sentinel." },
      { code: "", note: null },
      { code: "// Complexity: O(n) worst/average, O(1) best", note: "Best case: target is the first element. Worst: it's last or absent." },
    ],
    starterCode: `function linearSearch(arr, target) {
  // YOUR CODE ↓
  // Iterate through arr with a for loop
  // If arr[i] === target, return i immediately
  // If you finish the loop without finding it, return -1
  ___
}`,
    blanks: ["___"],
    solutions: [`  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;`],
    testFn: fn => {
      const a = [5, 3, 8, 1, 9, 2, 7];
      return {
        ok: fn(a, 8) === 2 && fn(a, 99) === -1 && fn(a, 5) === 0,
        result: fn(a, 8),
        checks: [
          { label: "linearSearch([5,3,8,1,9,2,7], 8) === 2", pass: fn(a, 8) === 2 },
          { label: "linearSearch(arr, 5) === 0  (first element)", pass: fn(a, 5) === 0 },
          { label: "linearSearch(arr, 99) === -1  (not found)", pass: fn(a, 99) === -1 },
          { label: "linearSearch(arr, 7) === 6  (last element)", pass: fn(a, 7) === 6 },
        ],
      };
    },
    complexity: { active: ["n"], label: "O(n) — checks up to every element" },
    osNote: "Early FAT filesystem: finding a file scanned every directory entry — O(n). Modern ext4: uses a B-tree hash-tree — O(1) amortized. Same problem, radically better data structure.",
  },
  {
    id: 4, title: "Binary Search", shortTitle: "Binary",
    colorKey: "green", osHook: "OS Kernel Symbol Tables",
    concept: [
      { head: "O(log n) — halve the search space", body: `Binary search requires a SORTED array.
Each step eliminates half the remaining elements:

  n=1000: 10 steps maximum (log₂ 1000 ≈ 10)
  n=1M:   20 steps maximum
  n=1B:   30 steps maximum

Compare linear search on 1 billion elements:
  worst case 1,000,000,000 comparisons vs 30.

Requirement: array must be sorted.
Payoff: absurdly fast for large datasets.` },
      { head: "OS: kernel symbol tables", body: `The Linux kernel maintains a sorted symbol table
(/proc/kallsyms) mapping function names to
memory addresses. ~100,000 symbols.

When a kernel panic prints a stack trace, it
must resolve each return address to a function
name — binary searching the symbol table.

Without binary search, a single panic would take
seconds just for symbol resolution.` },
      { head: "The off-by-one trap", body: `Binary search has a famous bug: integer overflow
in the midpoint calculation.

WRONG:   mid = (lo + hi) / 2
  → lo + hi can overflow 32-bit int

CORRECT: mid = lo + (hi - lo) / 2
  → always stays within range

This bug existed in Java's Arrays.binarySearch()
for nearly a decade before Joshua Bloch caught it.` },
    ],
    pseudoLines: [
      { code: "FUNCTION binarySearch(arr, target):", note: "Search a SORTED array for target in O(log n) time" },
      { code: "  lo ← 0", note: "lo tracks the left boundary of our search range" },
      { code: "  hi ← arr.length - 1", note: "hi tracks the right boundary of our search range" },
      { code: "", note: null },
      { code: "  WHILE lo ≤ hi:", note: "Keep searching while the range is non-empty (lo past hi means exhausted)" },
      { code: "    mid ← lo + (hi - lo) / 2", note: "Safe midpoint formula — avoids integer overflow. (lo + hi)/2 can overflow in 32-bit!" },
      { code: "", note: null },
      { code: "    IF arr[mid] = target:", note: "Check the middle element first" },
      { code: "      RETURN mid", note: "Found it exactly at the midpoint" },
      { code: "", note: null },
      { code: "    IF arr[mid] < target:", note: "Middle is too small — target must be in the RIGHT half" },
      { code: "      lo ← mid + 1", note: "Shrink search range: throw away left half including mid" },
      { code: "", note: null },
      { code: "    ELSE:", note: "Middle is too large — target must be in the LEFT half" },
      { code: "      hi ← mid - 1", note: "Shrink search range: throw away right half including mid" },
      { code: "", note: null },
      { code: "  RETURN -1", note: "Loop ended without finding target — it's not in the array" },
      { code: "", note: null },
      { code: "// Complexity: O(log n)", note: "Each iteration halves the search space. After log₂(n) steps the range is empty." },
    ],
    starterCode: `function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    // YOUR CODE A ↓  compute mid safely (no integer overflow)
    const mid = ___A___;

    if (arr[mid] === target) return mid;

    // YOUR CODE B/C ↓  narrow the search range
    if (arr[mid] < target) {
      ___B___   // target is in right half
    } else {
      ___C___   // target is in left half
    }
  }
  return -1;
}`,
    blanks: ["___A___", "___B___", "___C___"],
    solutions: [
      `lo + Math.floor((hi - lo) / 2)`,
      `lo = mid + 1;`,
      `hi = mid - 1;`,
    ],
    testFn: fn => {
      const a = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
      return {
        ok: fn(a, 7) === 3 && fn(a, 1) === 0 && fn(a, 4) === -1,
        result: fn(a, 7),
        checks: [
          { label: "binarySearch([1,3..19], 7) === 3", pass: fn(a, 7) === 3 },
          { label: "binarySearch(arr, 1) === 0  (first)", pass: fn(a, 1) === 0 },
          { label: "binarySearch(arr, 19) === 9  (last)", pass: fn(a, 19) === 9 },
          { label: "binarySearch(arr, 4) === -1  (not found)", pass: fn(a, 4) === -1 },
        ],
      };
    },
    multi: true, hasTrace: true, traceType: "binarySearch",
    complexity: { active: ["1", "log n"], label: "O(log n) — halves search space each step" },
    osNote: "The Linux kernel's /proc/kallsyms: ~100k sorted symbol entries. Stack trace resolution = binary search. Without it a single kernel panic stack trace would take seconds to symbolize.",
  },

  // ────────────────────────────────────────────────────────────────────────
  //  CHAPTER 2: LINKED LISTS
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 5, title: "Linked List: Traversal", shortTitle: "LL: Scan",
    colorKey: "purple", osHook: "Kernel Task List",
    concept: [
      { head: "What is a linked list?", body: `A linked list is a chain of nodes. Each node stores:
  1. A value   (data)
  2. A pointer (next) → the next node in the chain

  { val: 10, next: → }
              ↓
  { val: 20, next: → }
              ↓
  { val: 30, next: null }   ← end of list

Unlike arrays, nodes are scattered in memory —
not contiguous. No formula like address = base + i×4.
To reach node[2], you MUST walk through node[0] and node[1].` },
      { head: "Trade-offs vs arrays", body: `Arrays:
  ✓ O(1) access by index     (formula)
  ✗ O(n) insert/delete       (shifting)
  ✗ Fixed size or expensive resize

Linked lists:
  ✗ O(n) access by index     (must traverse)
  ✓ O(1) insert at head      (just repoint!)
  ✓ O(1) delete (with ref)   (just bypass!)
  ✓ Dynamic size — grow cheaply

No data structure wins everything. Pick based on
your most frequent operation.` },
      { head: "Traversal pattern", body: `The standard traversal idiom appears in every
language and framework. Memorize this shape:

  current = head
  while current != null:
      process(current.val)
      current = current.next

You'll see this exact pattern in:
  - React's reconciler (linked list of fibers)
  - Linux's process scheduler (task_struct list)
  - Every linked-list-based data structure ever` },
    ],
    pseudoLines: [
      { code: "FUNCTION traverse(head):", note: "head is the first node. null means the list is empty." },
      { code: "  current ← head", note: "Start our 'cursor' at the first node" },
      { code: "  result ← []", note: "We'll collect values here to return them" },
      { code: "", note: null },
      { code: "  WHILE current ≠ null:", note: "Keep going until we fall off the end (null means no more nodes)" },
      { code: "    result.push(current.val)", note: "Process this node — here we collect the value" },
      { code: "    current ← current.next", note: "CRITICAL: advance the cursor to the next node. Forgetting this = infinite loop!" },
      { code: "", note: null },
      { code: "  RETURN result", note: "All values collected in order" },
      { code: "", note: null },
      { code: "// Complexity: O(n) — must visit every node", note: "No shortcut exists: to reach the last node you must walk through all previous ones" },
    ],
    starterCode: `function traverse(head) {
  const result = [];
  let current = ___A___;   // start at the first node

  while (___B___) {        // keep going while there IS a node
    result.push(current.val);
    current = ___C___;     // advance to next node
  }
  return result;
}`,
    blanks: ["___A___", "___B___", "___C___"],
    solutions: ["head", "current !== null", "current.next"],
    testFn: fn => {
      const makeList = (arr) => {
        if (!arr.length) return null;
        let h = { val: arr[arr.length-1], next: null };
        for (let i = arr.length-2; i>=0; i--) h = { val: arr[i], next: h };
        return h;
      };
      const h1 = makeList([1,2,3,4,5]);
      const h2 = makeList([99]);
      const h3 = null;
      const r1 = fn(h1), r2 = fn(h2), r3 = fn(h3);
      return {
        ok: JSON.stringify(r1)==="[1,2,3,4,5]" && JSON.stringify(r2)==="[99]" && JSON.stringify(r3)==="[]",
        result: r1,
        checks: [
          { label: "traverse(1→2→3→4→5) → [1,2,3,4,5]", pass: JSON.stringify(r1)==="[1,2,3,4,5]" },
          { label: "traverse(99→null) → [99]", pass: JSON.stringify(r2)==="[99]" },
          { label: "traverse(null) → []", pass: JSON.stringify(r3)==="[]" },
        ],
      };
    },
    hasTrace: true, traceType: "listTraverse",
    complexity: { active: ["n"], label: "O(n) — no index formula, must walk" },
    osNote: "Linux kernel: task_struct forms a doubly-linked list of all processes. The scheduler traverses it constantly. ps aux? — it walks this list. kill -9 PID? — it finds the node and removes it.",
  },
  {
    id: 6, title: "Linked List: Insert", shortTitle: "LL: Insert",
    colorKey: "blue", osHook: "Network Packet Queue",
    concept: [
      { head: "Insert at head — O(1)!", body: `This is why linked lists exist. Insert at the
front in constant time, regardless of list size.

  new_node = { val: X, next: null }
  new_node.next = head     ← point to old head
  head = new_node          ← new node IS the head

Three operations. No matter if the list has 1
or 1 million nodes — always 3 operations.

Compare: array insert at index 0 shifts ALL n elements.` },
      { head: "Insert at tail — O(n)", body: `Inserting at the end requires finding the last node:

  current = head
  while current.next != null:
      current = current.next
  current.next = new_node

This is O(n). To fix it: keep a tail pointer.
Many implementations store both head AND tail,
giving O(1) insert at both ends.` },
      { head: "OS: network packet queues", body: `The Linux network stack uses linked lists for
packet queues (sk_buff_head). When a packet
arrives, it's inserted at the tail of the queue:

  skb_queue_tail(&sk->sk_receive_queue, skb)

This is O(1) because the socket keeps a tail ptr.

When your program calls recv(), it dequeues from
the head — also O(1). Classic producer/consumer.` },
    ],
    pseudoLines: [
      { code: "FUNCTION insertAtHead(head, val):", note: "Returns the NEW head (the inserted node)" },
      { code: "  newNode ← { val: val, next: null }", note: "Allocate a new node on the heap with the given value" },
      { code: "  newNode.next ← head", note: "Point the new node's next at the current head — this 'chains' it in front" },
      { code: "  RETURN newNode", note: "The new node IS the new head of the list. O(1) total — no loop!" },
      { code: "", note: null },
      { code: "// Complexity: O(1) — no traversal, just pointer rewiring", note: "Always exactly 3 operations regardless of list length. This is the key advantage of linked lists." },
    ],
    starterCode: `function insertAtHead(head, val) {
  // Step 1: create a new node object
  const newNode = ___A___;

  // Step 2: point it at the current head
  newNode.next = ___B___;

  // Step 3: return the new node (it's the new head!)
  return newNode;
}`,
    blanks: ["___A___", "___B___"],
    solutions: ["{ val, next: null }", "head"],
    testFn: fn => {
      const makeList = arr => {
        if (!arr.length) return null;
        let h = { val: arr[arr.length-1], next: null };
        for (let i = arr.length-2; i>=0; i--) h = { val: arr[i], next: h };
        return h;
      };
      const toArr = h => { const r=[]; let c=h; while(c){r.push(c.val);c=c.next;} return r; };
      const h = makeList([2,3,4]);
      const r1 = fn(h, 1), r2 = fn(null, 42);
      return {
        ok: JSON.stringify(toArr(r1))==="[1,2,3,4]" && r1.val===1 && JSON.stringify(toArr(r2))==="[42]",
        result: toArr(r1),
        checks: [
          { label: "insertAtHead(2→3→4, 1) → 1→2→3→4", pass: JSON.stringify(toArr(r1))==="[1,2,3,4]" },
          { label: "result.val === 1 (new node is returned)", pass: r1.val === 1 },
          { label: "insertAtHead(null, 42) → 42→null (empty list)", pass: JSON.stringify(toArr(r2))==="[42]" },
        ],
      };
    },
    hasTrace: true, traceType: "listInsertHead",
    complexity: { active: ["1"], label: "O(1) — three pointer ops, no loop" },
    osNote: "OS network stack: sk_buff_head uses a tail ptr so both enqueue (insert tail) and dequeue (remove head) are O(1). Without it, queuing would require O(n) traversal per packet — unusable at Gbps speeds.",
  },
  {
    id: 7, title: "Linked List: Delete", shortTitle: "LL: Delete",
    colorKey: "amber", osHook: "Process Scheduler",
    concept: [
      { head: "Delete by bypassing the node", body: `To delete a node, we make the PREVIOUS node's
.next skip over it:

  Before:  prev → target → next
  After:   prev → next          (target is bypassed)

  prev.next = target.next

The target node is now unreachable — garbage
collected in JS/Python, or freed manually in C.

Special case: deleting the head.
  head = head.next   (no prev node to update)` },
      { head: "Why we need the previous node", body: `With a singly-linked list (nodes only point forward),
to delete a node you MUST have a reference to
the node BEFORE it — so you can rewire the .next.

This is why DOUBLY-linked lists (each node has
both .next and .prev) allow O(1) delete given
ANY node reference — no traversal needed.

Linux's list_head is doubly-linked for this reason:
the scheduler can remove a process in O(1).` },
      { head: "O(n) vs O(1) delete", body: `  Singly linked + delete by VALUE:   O(n)
    (must traverse to find prev)

  Doubly linked + delete by REFERENCE: O(1)
    (node has its own .prev pointer)

  Hash map + doubly linked list:  O(1) both!
    (This is LRU Cache — Lesson 12 of this series)` },
    ],
    pseudoLines: [
      { code: "FUNCTION deleteFirst(head, val):", note: "Remove the first node whose val matches. Returns the (possibly new) head." },
      { code: "  IF head = null: RETURN null", note: "Empty list — nothing to delete" },
      { code: "  IF head.val = val:", note: "Special case: the node to delete IS the head" },
      { code: "    RETURN head.next", note: "New head is the second node. The old head is now unreachable → GC'd." },
      { code: "", note: null },
      { code: "  current ← head", note: "We'll use current as 'the previous node'" },
      { code: "  WHILE current.next ≠ null:", note: "Walk the list. We check current.NEXT (not current) so we always have the previous." },
      { code: "    IF current.next.val = val:", note: "Found the target — current is the node just before it" },
      { code: "      current.next ← current.next.next", note: "THE KEY OPERATION: bypass the target. current now points past it." },
      { code: "      RETURN head", note: "Head didn't change, so return original head" },
      { code: "    current ← current.next", note: "Keep walking" },
      { code: "  RETURN head", note: "val not found — list unchanged" },
      { code: "", note: null },
      { code: "// Complexity: O(n) — must find the node by scanning", note: "To get O(1) delete, we'd need a doubly-linked list AND a direct reference to the node." },
    ],
    starterCode: `function deleteFirst(head, val) {
  if (!head) return null;

  // Special case: head is the target
  if (head.val === val) return ___A___;

  let current = head;
  while (current.next !== null) {
    if (current.next.val === val) {
      // Bypass the target node
      current.next = ___B___;
      return head;
    }
    current = current.next;
  }
  return head; // not found
}`,
    blanks: ["___A___", "___B___"],
    solutions: ["head.next", "current.next.next"],
    testFn: fn => {
      const makeList = arr => {
        if (!arr.length) return null;
        let h = { val: arr[arr.length-1], next: null };
        for (let i = arr.length-2; i>=0; i--) h = { val: arr[i], next: h };
        return h;
      };
      const toArr = h => { const r=[]; let c=h; while(c){r.push(c.val);c=c.next;} return r; };
      const h = makeList([1,2,3,4,5]);
      const rm = fn(makeList([1,2,3,4,5]), 3);
      const rh = fn(makeList([1,2,3,4,5]), 1);
      const rn = fn(makeList([1,2,3,4,5]), 99);
      return {
        ok: JSON.stringify(toArr(rm))==="[1,2,4,5]" && JSON.stringify(toArr(rh))==="[2,3,4,5]",
        result: toArr(rm),
        checks: [
          { label: "deleteFirst(1→2→3→4→5, 3) → [1,2,4,5]", pass: JSON.stringify(toArr(rm))==="[1,2,4,5]" },
          { label: "deleteFirst(1→2→3→4→5, 1) → [2,3,4,5]  (head delete)", pass: JSON.stringify(toArr(rh))==="[2,3,4,5]" },
          { label: "deleteFirst(1→2→3→4→5, 99) → [1,2,3,4,5]  (not found)", pass: JSON.stringify(toArr(rn))==="[1,2,3,4,5]" },
        ],
      };
    },
    hasTrace: true, traceType: "listDelete",
    complexity: { active: ["n"], label: "O(n) — scan to find target's predecessor" },
    osNote: "Linux scheduler: when a process exits, do_exit() calls list_del() on the doubly-linked task list. Because .prev is available, this is O(1) — no scan. This is why the kernel uses doubly-linked lists everywhere.",
  },

  // ────────────────────────────────────────────────────────────────────────
  //  CHAPTER 3: BINARY SEARCH TREES
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 8, title: "BST: Search", shortTitle: "BST: Search",
    colorKey: "green", osHook: "Filesystem Directories",
    concept: [
      { head: "The BST invariant", body: `A Binary Search Tree enforces one rule at every node:

  left subtree values < node.val < right subtree values

        10
       /  \\
      5    15
     / \\   / \\
    2   7 12  20

  Is 7 in this tree? Check 10: 7 < 10, go left.
  Check 5: 7 > 5, go right. Check 7: found!

This eliminates half the remaining tree at each step.` },
      { head: "O(log n) — same as binary search", body: `BST search is binary search applied to a tree.
Each comparison eliminates one half.

  Balanced BST with n nodes: height ≈ log₂n
  → At most log₂n comparisons to find any value

  n = 1,000,000 nodes → ≤ 20 comparisons

DANGER: unbalanced BST degenerates to O(n):
  insert [1,2,3,4,5] in order →
  1 → 2 → 3 → 4 → 5  (a linked list!)

Self-balancing trees (AVL, Red-Black) fix this.` },
      { head: "BSTs in real systems", body: `C++ std::map / std::set → Red-Black Tree (BST)
Java TreeMap / TreeSet   → Red-Black Tree
Linux's completely fair scheduler → Red-Black Tree
  (tasks sorted by vruntime — O(log n) pick-next)

ext4 filesystem directory htree → B-Tree variant
Database indexes → B+ Tree (BST generalized to N children)

The BST concept underlies nearly all sorted,
searchable data structures in systems software.` },
    ],
    pseudoLines: [
      { code: "FUNCTION bstSearch(node, target):", note: "Recursive search. node starts as the root." },
      { code: "  IF node = null:", note: "We've walked off the tree — target is not here" },
      { code: "    RETURN false", note: "Not found" },
      { code: "", note: null },
      { code: "  IF node.val = target:", note: "Check current node before deciding direction" },
      { code: "    RETURN true", note: "Found it! Return immediately — no need to search further." },
      { code: "", note: null },
      { code: "  IF target < node.val:", note: "Target is smaller → it can ONLY be in the left subtree (BST invariant)" },
      { code: "    RETURN bstSearch(node.left, target)", note: "Recurse into left child — eliminates entire right subtree" },
      { code: "  ELSE:", note: "Target is larger → must be in the right subtree" },
      { code: "    RETURN bstSearch(node.right, target)", note: "Recurse into right child — eliminates entire left subtree" },
      { code: "", note: null },
      { code: "// Complexity: O(log n) balanced, O(n) worst case (degenerate tree)", note: "With a balanced tree: height is log₂n, so we make at most log₂n decisions." },
    ],
    starterCode: `function bstSearch(node, target) {
  // Base case: fallen off the tree
  if (___A___) return false;

  // Found it
  if (node.val === target) return true;

  // BST property: go left or right
  if (target < node.val) {
    return ___B___;   // search left subtree
  } else {
    return ___C___;   // search right subtree
  }
}`,
    blanks: ["___A___", "___B___", "___C___"],
    solutions: ["node === null", "bstSearch(node.left, target)", "bstSearch(node.right, target)"],
    testFn: fn => {
      const bld = arr => arr.reduce((root, v) => {
        const ins = (n, x) => !n ? {val:x,left:null,right:null} : x<n.val ? {...n,left:ins(n.left,x)} : {...n,right:ins(n.right,x)};
        return ins(root, v);
      }, null);
      const tree = bld([10,5,15,2,7,12,20]);
      return {
        ok: fn(tree,7)===true && fn(tree,99)===false && fn(tree,10)===true,
        result: fn(tree,7),
        checks: [
          { label: "bstSearch(tree, 7) === true  (in tree)", pass: fn(tree,7)===true },
          { label: "bstSearch(tree, 10) === true  (root)", pass: fn(tree,10)===true },
          { label: "bstSearch(tree, 99) === false  (not in tree)", pass: fn(tree,99)===false },
          { label: "bstSearch(null, 5) === false  (empty tree)", pass: fn(null,5)===false },
        ],
      };
    },
    hasTrace: true, traceType: "bstSearch",
    complexity: { active: ["log n"], label: "O(log n) balanced — O(n) worst case" },
    osNote: "Linux CFS scheduler: every runnable task is a node in a Red-Black Tree sorted by vruntime. Picking the next task to run = find minimum = O(log n). With 1000 runnable tasks: ~10 comparisons per context switch.",
  },
  {
    id: 9, title: "BST: Insert", shortTitle: "BST: Insert",
    colorKey: "blue", osHook: "Database Indexing",
    concept: [
      { head: "Insert maintains the BST invariant", body: `To insert, find where the new value WOULD be
found during a search — then place it there.

  Insert 6 into:     10
                    /  \\
                   5    15
                    \\
                     7
  Search path: 6 < 10 → left. 6 > 5 → right.
  6 < 7 → left. 7.left is null → insert here!

        10
       /  \\
      5    15
       \\
        7
       /
      6   ← inserted` },
      { head: "Recursive structure", body: `BST insert is elegantly recursive:

  insert(null, val)   → return new node
  insert(node, val)   → if val < node.val:
                            node.left = insert(node.left, val)
                         else:
                            node.right = insert(node.right, val)
                         return node

Each recursive call handles one level of the tree.
The base case creates the new node at the right spot.` },
      { head: "When BST becomes unbalanced", body: `Inserting sorted data kills BST performance:

  insert 1, 2, 3, 4, 5 →
  1
   \\
    2
     \\
      3  ← a right-leaning linked list!
       \\
        4

Height = n instead of log n.
Search degenerates from O(log n) to O(n).

Fix: AVL Trees (height-balanced) or Red-Black Trees
rotate nodes after insert to maintain O(log n) height.` },
    ],
    pseudoLines: [
      { code: "FUNCTION bstInsert(node, val):", note: "Returns the root of the (updated) subtree" },
      { code: "  IF node = null:", note: "We've found the right empty spot — create the new node here" },
      { code: "    RETURN {val: val, left: null, right: null}", note: "This new node IS the leaf that fits in the gap" },
      { code: "", note: null },
      { code: "  IF val < node.val:", note: "New value is smaller → it belongs in the left subtree" },
      { code: "    node.left ← bstInsert(node.left, val)", note: "Recursively insert into left child; update the reference" },
      { code: "  ELSE IF val > node.val:", note: "New value is larger → it belongs in the right subtree" },
      { code: "    node.right ← bstInsert(node.right, val)", note: "Recursively insert into right child; update the reference" },
      { code: "  // (if val = node.val, ignore — no duplicates)", note: "BSTs typically don't store duplicate keys" },
      { code: "  RETURN node", note: "Return the (possibly updated) current node back up the call stack" },
      { code: "", note: null },
      { code: "// Complexity: O(log n) balanced, O(n) worst case", note: "Same reasoning as bstSearch: we follow one path from root to the insertion leaf." },
    ],
    starterCode: `function bstInsert(node, val) {
  // Base case: empty spot found — create node here
  if (node === null) {
    return ___A___;
  }

  if (val < node.val) {
    // Insert into left subtree, update reference
    node.left = ___B___;
  } else if (val > node.val) {
    // Insert into right subtree, update reference
    node.right = ___C___;
  }
  // Return this node (possibly with updated children)
  return node;
}`,
    blanks: ["___A___", "___B___", "___C___"],
    solutions: ["{ val, left: null, right: null }", "bstInsert(node.left, val)", "bstInsert(node.right, val)"],
    testFn: fn => {
      const inOrd = (n, r=[]) => { if (!n) return r; inOrd(n.left,r); r.push(n.val); inOrd(n.right,r); return r; };
      const bld = arr => arr.reduce((root, v) => {
        const ins = (n, x) => !n ? {val:x,left:null,right:null} : x<n.val ? {...n,left:ins(n.left,x)} : x>n.val ? {...n,right:ins(n.right,x)} : n;
        return ins(root, v);
      }, null);
      const tree = bld([10,5,15]);
      const r1 = fn(tree, 7);
      const r2 = fn(null, 42);
      return {
        ok: inOrd(r1).join(",") === "5,7,10,15" && r2?.val === 42,
        result: inOrd(r1),
        checks: [
          { label: "insert(10←5→15, 7) in-order → [5,7,10,15]", pass: inOrd(r1).join(",") === "5,7,10,15" },
          { label: "BST property: tree.left.right.val === 7", pass: r1?.left?.right?.val === 7 },
          { label: "insert(null, 42) returns root node {val:42}", pass: r2?.val === 42 && !r2?.left && !r2?.right },
        ],
      };
    },
    complexity: { active: ["log n"], label: "O(log n) balanced — O(n) worst case" },
    osNote: "Database B-Tree index: every INSERT triggers a tree insert to update the index. PostgreSQL and MySQL maintain sorted B+ tree indexes so that SELECT with ORDER BY or WHERE on indexed columns is O(log n) instead of O(n) full scan.",
  },
  {
    id: 10, title: "Tree: In-order Traversal", shortTitle: "In-order",
    colorKey: "purple", osHook: "Sorted Output",
    concept: [
      { head: "Three traversal orders", body: `Trees can be traversed in 3 DFS orderings:

  In-order:    left → ROOT → right
  Pre-order:   ROOT → left → right
  Post-order:  left → right → ROOT

For a BST, IN-ORDER always gives sorted output.
This is not a coincidence — it's the BST invariant
applied recursively at every level.

        10
       /  \\
      5    15
     / \\
    2   7

  In-order: 2, 5, 7, 10, 15  ← sorted!` },
      { head: "Recursive structure", body: `In-order is beautifully recursive:

  inOrder(node):
      inOrder(node.left)   // get all smaller values
      visit(node.val)      // then this node
      inOrder(node.right)  // then all larger values

The call stack does the work — it's implicit
"remembering" of where to return after recursion.

Stack depth = tree height = O(log n) for balanced.` },
      { head: "Real-world uses", body: `In-order traversal on a BST:
  → Sorted output without extra sorting
  → BST-to-sorted-array conversion: O(n)

Pre-order: serialize a tree (root first → rebuild from it)
Post-order: delete a tree (children before parents),
           expression tree evaluation (operands before ops)

grep's regex engine, compiler AST evaluation,
and filesystem directory listing all use tree traversal.` },
    ],
    pseudoLines: [
      { code: "FUNCTION inOrder(node, result):", note: "Collect all values in sorted order into result array" },
      { code: "  IF node = null: RETURN", note: "Base case: empty subtree — nothing to do" },
      { code: "", note: null },
      { code: "  inOrder(node.left, result)", note: "FIRST: recurse into left subtree — gets all values SMALLER than node.val" },
      { code: "  result.push(node.val)", note: "SECOND: add this node's value — it's larger than everything in left subtree" },
      { code: "  inOrder(node.right, result)", note: "THIRD: recurse into right subtree — gets all values LARGER than node.val" },
      { code: "", note: null },
      { code: "// Result is always sorted for a BST", note: "At every node: left < node < right. Applying this recursively means left subtree values all come before, right subtree values all come after." },
      { code: "// Complexity: O(n) — visits every node exactly once", note: "Each node is visited exactly once. No node is skipped or revisited." },
    ],
    starterCode: `function inOrder(node, result = []) {
  // Base case: empty node
  if (___A___) return result;

  // 1. Traverse left subtree (smaller values)
  ___B___;

  // 2. Visit this node
  result.push(node.val);

  // 3. Traverse right subtree (larger values)
  ___C___;

  return result;
}`,
    blanks: ["___A___", "___B___", "___C___"],
    solutions: ["node === null", "inOrder(node.left, result)", "inOrder(node.right, result)"],
    testFn: fn => {
      const bld = arr => arr.reduce((root, v) => {
        const ins = (n, x) => !n ? {val:x,left:null,right:null} : x<n.val ? {...n,left:ins(n.left,x)} : x>n.val ? {...n,right:ins(n.right,x)} : n;
        return ins(root, v);
      }, null);
      const tree = bld([10,5,15,2,7,12,20]);
      const r = fn(tree);
      const r2 = fn(null);
      const r3 = fn(bld([5,3,7,1,4,6,8]));
      return {
        ok: r.join(",") === "2,5,7,10,12,15,20" && JSON.stringify(r2)==="[]",
        result: r,
        checks: [
          { label: "inOrder(BST[10,5,15,2,7,12,20]) → [2,5,7,10,12,15,20]", pass: r.join(",") === "2,5,7,10,12,15,20" },
          { label: "Output is sorted ascending", pass: r.every((v,i) => i===0 || v > r[i-1]) },
          { label: "inOrder(null) → []  (empty tree)", pass: JSON.stringify(r2)==="[]" },
          { label: "inOrder([5,3,7,1,4,6,8]) → [1,3,4,5,6,7,8]", pass: r3.join(",") === "1,3,4,5,6,7,8" },
        ],
      };
    },
    complexity: { active: ["n"], label: "O(n) — every node visited exactly once" },
    osNote: "SQL SELECT with ORDER BY on an indexed column: the database engine performs an in-order traversal of the B+ tree index — output is already sorted, no extra sort step needed. That's why indexed ORDER BY is O(n), not O(n log n).",
  },
];

// Python starters
const PY_STARTERS = [
  `def array_get(arr, i):
    # YOUR CODE ↓  bounds check, then return arr[i]
    ___`,
  `def array_insert(arr, i, val):
    a = arr[:]
    # YOUR CODE A ↓  shift right from end down to i
    ___A___
    # YOUR CODE B ↓  write val at index i
    ___B___
    return a`,
  `def array_delete(arr, i):
    a = arr[:]
    # YOUR CODE ↓  shift left from i, then shrink
    ___
    return a`,
  `def linear_search(arr, target):
    # YOUR CODE ↓
    ___`,
  `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        # YOUR CODE A ↓  safe midpoint
        mid = ___A___
        if arr[mid] == target: return mid
        # YOUR CODE B/C ↓  narrow range
        if arr[mid] < target:
            ___B___
        else:
            ___C___
    return -1`,
];

const PY_BLANKS = [
  ["___"],
  ["___A___", "___B___"],
  ["___"],
  ["___"],
  ["___A___", "___B___", "___C___"],
];

const PY_SOLUTIONS = [
  ["    if i < 0 or i >= len(arr): return None\n    return arr[i]"],
  [
    "    for j in range(len(a)-1, i-1, -1):\n        if j+1 < len(a): a[j+1]=a[j]\n        else: a.append(a[j])\n    if i >= len(a): a.append(val)",
    "    a[i] = val",
  ],
  ["    for j in range(i, len(a)-1):\n        a[j] = a[j+1]\n    a.pop()"],
  ["    for i in range(len(arr)):\n        if arr[i] == target: return i\n    return -1"],
  ["    lo + (hi - lo) // 2", "        lo = mid + 1", "        hi = mid - 1"],
];

const PY_HARNESSES = [
  `import json as _j
_a=[10,20,30,40,50]
_checks=[
  {'label':'get(arr,0)=10','pass':array_get(_a,0)==10},
  {'label':'get(arr,2)=30','pass':array_get(_a,2)==30},
  {'label':'get(arr,-1)=None','pass':array_get(_a,-1) is None},
  {'label':'get(arr,10)=None','pass':array_get(_a,10) is None},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':array_get(_a,2)})`,
  `import json as _j
_a=[1,2,3,4,5]
_r0=array_insert(_a,0,99)
_rm=array_insert(_a,2,99)
_re=array_insert(_a,5,99)
_checks=[
  {'label':'insert at 0','pass':_r0==[99,1,2,3,4,5]},
  {'label':'insert at 2','pass':_rm==[1,2,99,3,4,5]},
  {'label':'insert at end','pass':_re==[1,2,3,4,5,99]},
  {'label':'original not mutated','pass':_a==[1,2,3,4,5]},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_rm})`,
  `import json as _j
_a=[10,20,30,40,50]
_r0=array_delete(_a,0)
_rm=array_delete(_a,2)
_checks=[
  {'label':'delete idx 0','pass':_r0==[20,30,40,50]},
  {'label':'delete idx 2','pass':_rm==[10,20,40,50]},
  {'label':'length decreases','pass':len(_r0)==4},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_rm})`,
  `import json as _j
_a=[5,3,8,1,9,2,7]
_checks=[
  {'label':'search 8 → 2','pass':linear_search(_a,8)==2},
  {'label':'search 5 → 0','pass':linear_search(_a,5)==0},
  {'label':'search 99 → -1','pass':linear_search(_a,99)==-1},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':linear_search(_a,8)})`,
  `import json as _j
_a=[1,3,5,7,9,11,13,15,17,19]
_checks=[
  {'label':'search 7 → 3','pass':binary_search(_a,7)==3},
  {'label':'search 1 → 0','pass':binary_search(_a,1)==0},
  {'label':'search 4 → -1','pass':binary_search(_a,4)==-1},
  {'label':'search 19 → 9','pass':binary_search(_a,19)==9},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':binary_search(_a,7)})`,
];

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function DSA01Arrays({ onBack }) {
  const T = useThemeColors();               // real app theme — CSS vars, DOM only
  const { isDarkGlobal } = useGlobalTheme();
  const HX = isDarkGlobal ? HEX.dark : HEX.light; // canvas-safe hex (canvas can't resolve CSS vars)

  // C = theme for DOM elements (uses real app theme tokens)
  const C = {
    bg:      T.bg,
    surface: T.surface,
    panel:   T.surface2,
    border:  T.border,
    border2: withAlpha(T.border, "cc"),
    green:   T.green,
    blue:    T.blue,
    amber:   T.amber,
    red:     T.red,
    purple:  T.purple,
    muted:   T.muted,
    text:    T.text,
    textDim: T.hint,
    bright:  T.text,
    dim:     T.surface2,
  };

  // Lesson accent colors (hex from HX so they work correctly)
  const ACCENT = { green: HX.green, blue: HX.blue, amber: HX.amber, purple: HX.purple, red: HX.red };
  const mono = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";
  const sans = "'IBM Plex Sans','SF Pro Text',system-ui,sans-serif";

  // Build LESSONS with correct accent colors
  const LESSONS = useMemo(() =>
    LESSONS_DATA.map(l => ({ ...l, color: ACCENT[l.colorKey] })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [isDarkGlobal]);

  const [lessonIdx, setLessonIdx] = useState(0);
  const [tab, setTab] = useState("concept");
  const [lang, setLang] = useState("js");
  const [jsCode, setJsCode] = useState(LESSONS_DATA[0].starterCode);
  const [pyCode, setPyCode] = useState(PY_STARTERS[0]);
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [traceSteps, setTraceSteps] = useState([]);
  const [traceIdx, setTraceIdx] = useState(0);

  // Monaco editor refs — used for line highlighting during trace
  const editorRef   = useRef(null);
  const monacoRef   = useRef(null);
  const decorRef    = useRef([]);   // active decoration IDs

  // Inject CSS for the trace highlight once
  useEffect(() => {
    const id = "dsa-trace-line-css";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      .trace-current-line {
        background: rgba(79, 195, 247, 0.13) !important;
        border-left: 3px solid #4fc3f7 !important;
      }
      .trace-current-line-error {
        background: rgba(255, 77, 109, 0.13) !important;
        border-left: 3px solid #ff4d6d !important;
      }
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // Highlight the line in Monaco that matches the current trace step's codePattern
  const cur = traceSteps[traceIdx];
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;

    // Always clear previous decorations first
    decorRef.current = editor.deltaDecorations(decorRef.current, []);

    const pattern = cur?.codePattern;
    if (!pattern) return;

    const matches = model.findMatches(pattern, false, false, false, null, true);
    if (!matches.length) return;

    const ln = matches[0].range.startLineNumber;
    const isError = cur?.phase === "error";
    decorRef.current = editor.deltaDecorations([], [{
      range: new monaco.Range(ln, 1, ln, 999),
      options: {
        isWholeLine: true,
        inlineClassName: isError ? "trace-current-line-error" : "trace-current-line",
      },
    }]);
    editor.revealLineInCenter(ln, 0 /* Immediate */);
  }, [cur]);
  const [completed, setCompleted] = useState(new Set());
  const [demoArr] = useState([12, 34, 56, 78, 90, 23, 45]);
  const [demoSorted] = useState([2, 5, 8, 12, 16, 23, 35, 42, 58, 72]);
  const [demoIdx, setDemoIdx] = useState(2);
  const [demoVal, setDemoVal] = useState(99);
  // Linked list demos
  const [demoList] = useState(listFrom([3, 7, 12, 19, 25]));
  const [demoListVal, setDemoListVal] = useState(7);
  const [demoInsertVal, setDemoInsertVal] = useState(5);
  // BST demo
  const [demoBST] = useState(bstFromArr([10, 5, 15, 2, 7, 12, 20]));
  const [demoBSTTarget, setDemoBSTTarget] = useState(7);

  const lesson = LESSONS[lessonIdx];
  const lc = lesson.color;
  const isComplete = completed.has(lessonIdx);
  const currentCode = lang === "js" ? jsCode : pyCode;
  const setCurrentCode = lang === "js" ? setJsCode : setPyCode;
  const currentBlanks = lang === "js" ? lesson.blanks : PY_BLANKS[lessonIdx] || [];
  const currentSols   = lang === "js" ? lesson.solutions : PY_SOLUTIONS[lessonIdx] || [];
  const currentStarter = lang === "js" ? lesson.starterCode : PY_STARTERS[lessonIdx];

  const switchLesson = (idx) => {
    setLessonIdx(idx);
    setJsCode(LESSONS_DATA[idx].starterCode);
    setPyCode(PY_STARTERS[idx]);
    setRunResult(null);
    setShowHint(false);
    setTraceSteps([]);
    setTraceIdx(0);
    setTab("concept");
  };

  const buildTrace = useCallback(() => {
    const l = LESSONS[lessonIdx];
    if (!l.hasTrace) return;
    let steps = [];
    if (l.traceType === "insert")         steps = traceInsert(demoArr, demoIdx, demoVal);
    if (l.traceType === "delete")         steps = traceDelete(demoArr, demoIdx);
    if (l.traceType === "binarySearch")   steps = traceBinarySearch(demoSorted, demoVal);
    if (l.traceType === "listTraverse")   steps = traceListTraverse(demoList, demoListVal);
    if (l.traceType === "listInsertHead") steps = traceListInsertHead(demoList, demoInsertVal);
    if (l.traceType === "listDelete")     steps = traceListDelete(demoList, demoListVal);
    if (l.traceType === "bstSearch")      steps = traceBSTSearch(demoBST, demoBSTTarget);
    setTraceSteps(steps);
    setTraceIdx(0);
  }, [LESSONS, lessonIdx, demoArr, demoSorted, demoIdx, demoVal, demoList, demoListVal, demoInsertVal, demoBST, demoBSTTarget]);

  // Build a trace using the SAME inputs as the lesson's test suite so the
  // trace matches exactly what just ran. Falls back to demo inputs when no
  // test-specific trace is defined.
  const buildTestTrace = useCallback((lessonId) => {
    const steps = (() => {
      switch (lessonId) {
        case 1: return traceInsert([1, 2, 3, 4, 5], 2, 99);
        case 2: return traceDelete([10, 20, 30, 40, 50], 2);
        case 4: return traceBinarySearch([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 7);
        case 5: return traceListTraverse(listFrom([1, 2, 3, 4, 5]), 3);
        case 6: return traceListInsertHead(listFrom([2, 3, 4]), 1);
        case 7: return traceListDelete(listFrom([1, 2, 3, 4, 5]), 3);
        case 8: return traceBSTSearch(bstFromArr([10, 5, 15, 2, 7, 12, 20]), 7);
        default: return null;
      }
    })();
    if (steps) { setTraceSteps(steps); setTraceIdx(0); }
    else buildTrace(); // fall back to demo trace
  }, [buildTrace]);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    if (lang === "js") {
      const res = runJS(lesson, jsCode);
      setRunResult(res);
      // Always show trace — even on failure. Mark complete only on pass.
      if (res.testResult?.ok) setCompleted(c => new Set([...c, lessonIdx]));
      if (lesson.hasTrace) buildTestTrace(lesson.id);
    } else {
      try {
        const { getPyodide } = await import("../../utils/pyodideRuntime.js").catch(() => ({ getPyodide: null }));
        if (!getPyodide) { setRunResult({ error: "Pyodide runtime not available." }); setRunning(false); return; }
        const pyodide = await getPyodide();
        const fullCode = `${pyCode}\n${PY_HARNESSES[lessonIdx]}`;
        await pyodide.runPythonAsync(fullCode);
        const proxy = pyodide.globals.get("_matrix_result");
        const parsed = JSON.parse(typeof proxy === "string" ? proxy : proxy.toString());
        if (typeof proxy?.destroy === "function") proxy.destroy();
        setRunResult({ testResult: { ok: parsed.ok, checks: parsed.checks, result: parsed.result } });
        if (parsed.ok) setCompleted(c => new Set([...c, lessonIdx]));
        if (lesson.hasTrace) buildTestTrace(lesson.id);
      } catch (e) {
        setRunResult({ error: e.message || String(e) });
      }
    }
    setRunning(false);
  };

  const handleReveal = () => {
    let code = currentStarter;
    currentBlanks.forEach((b, i) => { code = code.replace(b, currentSols[i] || ""); });
    setCurrentCode(code);
  };

  // ── UI helpers ───────────────────────────────────────────────────────────
  const btn = (style = {}) => ({
    cursor: "pointer",
    fontFamily: mono,
    border: `1px solid ${C.border2}`,
    borderRadius: 4,
    background: "transparent",
    color: C.muted,
    fontSize: 11,
    padding: "0 10px",
    height: 26,
    ...style,
  });

  const label9 = { fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted };

  // Scanlines
  const scanlineStyle = {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
    backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)",
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: sans, color: C.text, overflow: "hidden", position: "relative" }}>
      <div style={scanlineStyle} />

      {/* ═══ HEADER ═══ */}
      <div style={{ height: 48, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 14, flexShrink: 0 }}>
        {onBack && (
          <button onClick={onBack} style={btn({ height: 28, display: "flex", alignItems: "center", gap: 5 })}>
            ‹ Back
          </button>
        )}

        {/* Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 4, background: `${C.green}18`, border: `1px solid ${C.green}44` }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          <span style={{ fontSize: 10, fontFamily: mono, color: C.green, letterSpacing: "0.12em", fontWeight: 700 }}>DSA SERIES</span>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: C.bright, letterSpacing: -0.3 }}>01 — Arrays &amp; Memory</div>
        <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono }}>/dev/memory → O(1) access → O(n) mutation</div>

        {/* Lesson pills */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          {LESSONS.map((l, i) => {
            const done = completed.has(i);
            const active = i === lessonIdx;
            return (
              <button
                key={i}
                onClick={() => switchLesson(i)}
                style={{
                  height: 28, padding: "0 12px", borderRadius: 14,
                  background: active ? `${l.color}22` : "transparent",
                  border: `1px solid ${active ? l.color : C.border2}`,
                  color: active ? l.color : done ? C.muted : C.textDim,
                  fontSize: 10, fontWeight: active ? 700 : 400,
                  cursor: "pointer", fontFamily: mono,
                  display: "flex", alignItems: "center", gap: 5,
                  transition: "all 0.15s",
                }}
              >
                {done && <span style={{ fontSize: 8, color: C.green }}>✓</span>}
                {l.shortTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ BODY — 2 columns: LEFT concept | RIGHT (editor on top, output below) ═══ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT: Concept panel ── */}
        <div style={{ width: 380, minWidth: 300, maxWidth: 440, background: C.panel, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

          {/* Lesson title + OS hook */}
          <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: lc, background: `${lc}18`, border: `1px solid ${lc}30`, borderRadius: 3, padding: "2px 7px", fontFamily: mono, textTransform: "uppercase" }}>
                {lesson.osHook}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.bright, letterSpacing: -0.3 }}>{lesson.title}</div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {[["concept", "Concept"], ["pseudo", "Pseudocode"], ["demo", "Demo"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex: 1, padding: "8px 0",
                fontSize: 11, fontWeight: tab === id ? 700 : 400,
                color: tab === id ? lc : C.muted,
                background: "transparent", border: "none",
                borderBottom: `2px solid ${tab === id ? lc : "transparent"}`,
                cursor: "pointer", fontFamily: mono, letterSpacing: "0.04em", transition: "color .12s",
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>

            {/* CONCEPT TAB */}
            {tab === "concept" && (
              <>
                {lesson.concept.map((b, i) => (
                  <div key={i} style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: lc, letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase", fontFamily: mono }}>{b.head}</div>
                    <pre style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, fontFamily: mono }}>{b.body}</pre>
                  </div>
                ))}

                {/* Complexity chart — always visible in concept tab */}
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ ...label9, marginBottom: 8 }}>Complexity</div>
                  <ComplexityChart active={lesson.complexity.active} C={HX} />
                  <div style={{ marginTop: 8, fontSize: 11, color: lc, fontFamily: mono, fontWeight: 600 }}>{lesson.complexity.label}</div>
                </div>
              </>
            )}

            {/* PSEUDOCODE TAB */}
            {tab === "pseudo" && (
              <div>
                <div style={{ marginBottom: 12, padding: "8px 12px", background: `${lc}10`, border: `1px solid ${lc}30`, borderRadius: 6, fontSize: 11, color: C.textDim, lineHeight: 1.6, fontFamily: mono }}>
                  <span style={{ color: lc, fontWeight: 700 }}>How to use: </span>
                  Read the pseudocode top to bottom. <span style={{ color: lc }}>Hover any line</span> to see a plain-English explanation. Then go to the editor and fill in the blanks.
                </div>
                <PseudoBlock lines={lesson.pseudoLines} C={C} />
                <div style={{ marginTop: 12, padding: "8px 12px", background: `${C.amber}12`, border: `1px solid ${C.amber}30`, borderRadius: 6, fontSize: 11, color: C.textDim, lineHeight: 1.6, fontFamily: mono }}>
                  <span style={{ color: C.amber, fontWeight: 700 }}>Your job: </span>
                  The starter code in the editor has <code style={{ color: lc, background: `${lc}15`, padding: "1px 5px", borderRadius: 3 }}>___</code> blanks. Replace each blank with the correct code, guided by this pseudocode.
                </div>
              </div>
            )}

            {/* DEMO TAB */}
            {tab === "demo" && (
              <div>
                <div style={{ ...label9, marginBottom: 10 }}>Interactive Demo</div>

                {/* Array visualizer */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, fontFamily: mono }}>{lessonIdx === 4 ? "sorted array" : "working array"}</div>
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {(lessonIdx === 4 ? demoSorted : demoArr).map((v, i) => (
                      <div key={i} style={{ width: 38, height: 38, background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, fontSize: 11, color: C.text }}>
                        <span>{v}</span>
                        <span style={{ fontSize: 7, color: C.muted }}>[{i}]</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls for insert */}
                {lessonIdx === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: mono }}>Try it — trace the shift operation:</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono, width: 30 }}>idx</span>
                      <input type="number" value={demoIdx} min={0} max={demoArr.length} onChange={e => setDemoIdx(+e.target.value)}
                        style={{ width: 50, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                      <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono, width: 30 }}>val</span>
                      <input type="number" value={demoVal} onChange={e => setDemoVal(+e.target.value)}
                        style={{ width: 50, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                      <button onClick={() => { setTraceSteps(traceInsert(demoArr, demoIdx, demoVal)); setTraceIdx(0); setTab("demo"); }}
                        style={{ padding: "4px 12px", background: `${lc}18`, border: `1px solid ${lc}44`, borderRadius: 3, color: lc, fontSize: 10, cursor: "pointer", fontFamily: mono }}>
                        Trace
                      </button>
                    </div>
                  </div>
                )}

                {/* Controls for delete */}
                {lessonIdx === 2 && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono, width: 30 }}>idx</span>
                    <input type="number" value={demoIdx} min={0} max={demoArr.length - 1} onChange={e => setDemoIdx(+e.target.value)}
                      style={{ width: 50, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                    <button onClick={() => { setTraceSteps(traceDelete(demoArr, demoIdx)); setTraceIdx(0); }}
                      style={{ padding: "4px 12px", background: `${lc}18`, border: `1px solid ${lc}44`, borderRadius: 3, color: lc, fontSize: 10, cursor: "pointer", fontFamily: mono }}>
                      Trace
                    </button>
                  </div>
                )}

                {/* Controls for binary search */}
                {lessonIdx === 4 && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono, width: 50 }}>search</span>
                    <input type="number" value={demoVal} onChange={e => setDemoVal(+e.target.value)}
                      style={{ width: 60, padding: "3px 6px", background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.text, fontFamily: mono, fontSize: 11 }} />
                    <button onClick={() => { setTraceSteps(traceBinarySearch(demoSorted, demoVal)); setTraceIdx(0); }}
                      style={{ padding: "4px 12px", background: `${lc}18`, border: `1px solid ${lc}44`, borderRadius: 3, color: lc, fontSize: 10, cursor: "pointer", fontFamily: mono }}>
                      Trace
                    </button>
                  </div>
                )}

                {/* Trace viewer */}
                {traceSteps.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>
                        <span style={label9}>Step {traceIdx + 1} of {traceSteps.length}</span>
                        {cur?.codePattern && (
                          <span style={{ fontSize: 9, color: C.blue, fontFamily: mono, marginLeft: 8, opacity: 0.7 }}>
                            ↑ highlighted in editor
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 3 }}>
                        {[["«", () => setTraceIdx(0)], ["‹", () => setTraceIdx(i => Math.max(0, i - 1))], ["›", () => setTraceIdx(i => Math.min(traceSteps.length - 1, i + 1))], ["»", () => setTraceIdx(traceSteps.length - 1)]].map(([lbl, fn], i) => (
                          <button key={i} onClick={fn} style={{ width: 26, height: 24, background: C.dim, border: `1px solid ${C.border2}`, borderRadius: 3, color: C.textDim, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>{lbl}</button>
                        ))}
                      </div>
                    </div>
                    <input type="range" min={0} max={traceSteps.length - 1} value={traceIdx} onChange={e => setTraceIdx(+e.target.value)} style={{ width: "100%", accentColor: lc, marginBottom: 10 }} />
                    {cur && <MemoryViz arr={cur.state} highlight={cur.highlight} lo={cur.lo} hi={cur.hi} mid={cur.mid} found={cur.found} phase={cur.phase} label={cur.note} C={C} />}
                  </div>
                )}

                {/* OS connection note */}
                <div style={{ marginTop: 20, padding: "10px 12px", background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, borderLeft: `3px solid ${lc}` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: 4 }}>OS connection</div>
                  <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, fontFamily: mono }}>{lesson.osNote}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Code editor ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg, overflow: "hidden", minWidth: 300 }}>

          {/* Editor toolbar */}
          <div style={{ height: 44, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 8, flexShrink: 0 }}>

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={running}
              style={{
                height: 30, padding: "0 18px", borderRadius: 6,
                background: isComplete
                  ? `linear-gradient(135deg, ${C.green}, ${C.blue})`
                  : `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
                border: "none",
                color: "#fff", fontSize: 12, fontWeight: 700,
                cursor: running ? "default" : "pointer",
                fontFamily: sans, letterSpacing: "0.02em",
                display: "flex", alignItems: "center", gap: 6,
                opacity: running ? 0.6 : 1,
                boxShadow: `0 0 12px ${C.blue}44`,
                transition: "all 0.2s ease-out",
              }}
            >
              <span style={{ fontSize: 9 }}>{running ? "⟳" : "▶"}</span>
              {running ? "Running…" : isComplete ? "Re-run" : "Run"}
            </button>

            <button onClick={() => setShowHint(h => !h)} style={btn({ color: showHint ? lc : C.muted, border: `1px solid ${showHint ? lc + "44" : C.border2}` })}>
              {showHint ? "Hide Hint" : "Hint"}
            </button>

            <button onClick={handleReveal} style={btn()}>Reveal</button>

            {lesson.hasTrace && (
              <button
                onClick={() => buildTestTrace(lesson.id)}
                style={{ height: 28, padding: "0 14px", borderRadius: 6, background: `linear-gradient(135deg, ${C.purple}, ${C.blue})`, border: "none", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: sans, boxShadow: `0 0 10px ${C.purple}44` }}
                title="Replay the algorithm trace — highlights matching lines in your code as each step runs"
              >
                ▶ Trace
              </button>
            )}

            {isComplete && (
              <span style={{ fontSize: 10, color: C.green, background: `${C.green}14`, border: `1px solid ${C.green}40`, borderRadius: 12, padding: "3px 10px", fontFamily: mono, boxShadow: `0 0 8px ${C.green}30` }}>
                ✓ passing
              </span>
            )}

            {/* Language switcher */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              {[["js", "JS", "#f7df1e"], ["python", "Python", "#7dd3fc"]].map(([id, label, accent]) => (
                <button key={id} onClick={() => { setLang(id); setRunResult(null); }} style={{
                  height: 24, padding: "0 10px", borderRadius: 4,
                  background: lang === id ? `${accent}18` : "transparent",
                  border: `1px solid ${lang === id ? accent : C.border2}`,
                  color: lang === id ? accent : C.muted,
                  fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: mono,
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Hint bar */}
          {showHint && (
            <div style={{ padding: "8px 14px", background: C.panel, borderBottom: `1px solid ${C.amber}33`, fontSize: 11, color: C.amber, fontFamily: mono, lineHeight: 1.6, flexShrink: 0 }}>
              <span style={{ fontWeight: 700, marginRight: 8, color: `${C.amber}99` }}>hint</span>
              {currentBlanks.map((b, i) => (
                <div key={i} style={{ color: C.amber, marginTop: 3 }}>
                  <code style={{ color: lc, background: `${lc}15`, padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>{b}</code>
                  {" → "}
                  <code style={{ color: C.text }}>{currentSols[i]}</code>
                </div>
              ))}
            </div>
          )}

          {/* Monaco editor */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Editor
              height="100%"
              language={lang === "python" ? "python" : "javascript"}
              value={currentCode}
              onChange={val => setCurrentCode(val || "")}
              beforeMount={monaco => { monacoRef.current = monaco; setupOpenCalcMonaco(monaco); }}
              onMount={editor => { editorRef.current = editor; }}
              theme={isDarkGlobal ? "open-calc-dark" : "open-calc-light"}
              options={{
                fontSize: 14,
                lineHeight: 24,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                renderLineHighlight: "line",
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                fontLigatures: true,
                fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
                letterSpacing: 0.3,
              }}
            />
          </div>

          {/* ── BOTTOM: Results (always visible) + Trace (when active) ── */}
          <div style={{ flexShrink: 0, background: C.panel, borderTop: `1px solid ${C.border}`, maxHeight: "45%", overflowY: "auto", display: "flex", flexDirection: "column" }}>

            {/* Results header row */}
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: C.surface }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted }}>Output</span>
              {isComplete && (
                <span style={{ fontSize: 10, color: C.green, background: `${HX.green}18`, border: `1px solid ${HX.green}44`, borderRadius: 10, padding: "2px 9px", fontFamily: mono }}>✓ passing</span>
              )}
              {traceSteps.length > 0 && (
                <>
                  <span style={{ color: C.border2, fontSize: 10 }}>|</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted }}>Trace {traceIdx + 1}/{traceSteps.length}</span>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[["«", () => setTraceIdx(0)], ["‹", () => setTraceIdx(i => Math.max(0, i - 1))], ["›", () => setTraceIdx(i => Math.min(traceSteps.length - 1, i + 1))], ["»", () => setTraceIdx(traceSteps.length - 1)]].map(([lbl, fn], i) => (
                      <button key={i} onClick={fn} style={{ width: 22, height: 20, borderRadius: 3, background: C.dim, border: `1px solid ${C.border2}`, color: C.textDim, fontSize: 11, cursor: "pointer", fontFamily: mono }}>{lbl}</button>
                    ))}
                  </div>
                  <input type="range" min={0} max={traceSteps.length - 1} value={traceIdx} onChange={e => setTraceIdx(+e.target.value)} style={{ flex: 1, maxWidth: 200, accentColor: HX.blue }} />
                </>
              )}
            </div>

            {/* Results body */}
            <div style={{ padding: "10px 14px", display: "flex", gap: 16, flexWrap: "wrap", minHeight: 80 }}>

              {/* Left: test checks */}
              <div style={{ flex: 1, minWidth: 240 }}>
                {!runResult && !running && (
                  <div style={{ fontSize: 12, color: C.muted, fontFamily: mono, lineHeight: 1.8 }}>
                    1. Read <span style={{ color: HX.blue }}>Pseudocode</span> tab &nbsp;→&nbsp;
                    fill in <span style={{ color: lc }}>___</span> blanks &nbsp;→&nbsp;
                    press <span style={{ color: HX.green }}>Run</span>
                  </div>
                )}
                {running && <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono }}>⟳ Running…</div>}
                {runResult?.error && (
                  <div style={{ background: `${HX.red}14`, border: `1px solid ${HX.red}44`, borderRadius: 6, padding: "8px 10px" }}>
                    <div style={{ color: HX.red, fontSize: 10, fontWeight: 700, marginBottom: 3, fontFamily: mono }}>error</div>
                    <div style={{ color: HX.red, fontSize: 10, fontFamily: mono, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", opacity: 0.85 }}>{runResult.error}</div>
                  </div>
                )}
                {runResult?.testResult && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                    {runResult.testResult.checks.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: c.pass ? HX.green : HX.red, fontFamily: mono }}>{c.pass ? "✓" : "✗"}</span>
                        <span style={{ fontSize: 11, color: c.pass ? C.text : C.muted, fontFamily: mono }}>{c.label}</span>
                      </div>
                    ))}
                    <div style={{ width: "100%", marginTop: 6, padding: "7px 10px", borderRadius: 6, background: runResult.testResult.ok ? `${HX.green}14` : `${HX.red}14`, border: `1px solid ${runResult.testResult.ok ? HX.green + "44" : HX.red + "33"}` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: runResult.testResult.ok ? HX.green : HX.red, fontFamily: mono }}>
                        {runResult.testResult.ok ? "✓ all tests pass" : "✗ tests failing"}
                      </span>
                      {runResult.testResult.result != null && (
                        <span style={{ fontSize: 12, color: lc, fontFamily: mono, marginLeft: 10 }}>→ {JSON.stringify(runResult.testResult.result)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: trace viz — dispatched by step kind */}
              {cur && (
                <div style={{ flex: 2, minWidth: 300, overflowX: "auto" }}>
                  {cur.kind === "list" && (
                    <ListViz nodes={cur.nodes} highlight={cur.highlight} newNode={cur.newNode ?? null} deletedIdx={cur.deletedIdx ?? -1} note={cur.note} C={HX} />
                  )}
                  {cur.kind === "bst" && (
                    <TreeViz tree={cur.tree} highlight={cur.highlight} found={!!cur.found} note={cur.note} C={HX} />
                  )}
                  {(cur.kind === "array" || !cur.kind) && (
                    <MemoryViz arr={cur.state} highlight={cur.highlight} lo={cur.lo} hi={cur.hi} mid={cur.mid} found={cur.found} phase={cur.phase} label={cur.note} C={HX} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: OS note + Next ── (narrow, no trace) */}
        <div style={{ width: 280, flexShrink: 0, background: C.panel, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* OS connection */}
          <div style={{ flex: 1, padding: "14px", overflowY: "auto" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted, marginBottom: 8 }}>OS Connection</div>
            <div style={{ padding: "10px 12px", background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, borderLeft: `3px solid ${lc}` }}>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.7, fontFamily: mono, whiteSpace: "pre-line" }}>{lesson.osNote}</div>
            </div>

            {/* Coming next */}
            {lessonIdx < LESSONS.length - 1 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, color: C.muted, marginBottom: 8 }}>Next</div>
                <button onClick={() => switchLesson(lessonIdx + 1)} style={{
                  width: "100%", padding: "10px 14px", background: C.dim,
                  border: `1px solid ${C.border2}`, borderRadius: 6,
                  color: C.textDim, fontSize: 12, cursor: "pointer",
                  textAlign: "left", fontFamily: mono, display: "flex",
                  alignItems: "center", justifyContent: "space-between",
                }}>
                  <span>{LESSONS[lessonIdx + 1].title}</span>
                  <span style={{ color: lc }}>›</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
