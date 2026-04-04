/**
 * LogicSim.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Redstone-style digital logic simulator for the open-calc CS curriculum.
 *
 * Self-contained. One default export. No external dependencies beyond React.
 * Uses an HTML5 canvas for the grid and nodes; React for the UI chrome.
 *
 * What students learn:
 *   - NOT, AND, OR, XOR gates via direct interaction
 *   - Boolean logic through building, not memorising
 *   - Signal propagation (how outputs depend on inputs)
 *   - Truth tables built live from their own circuits
 *   - Five guided challenges of increasing difficulty
 *
 * Register: LogicSim: lazy(() => import('./react/LogicSim.jsx'))
 *
 * Modes:
 *   "sandbox"   — free build, full toolbar
 *   "challenge" — guided challenge with goal state and success detection
 *
 * Architecture:
 *   - Grid: 32px cells, infinite conceptually but bounded to canvas
 *   - Nodes: placed on grid intersections, have input/output ports
 *   - Wires: drawn by clicking output port → input port
 *   - Signal: propagated synchronously on every state change (topo sort)
 *   - State: plain JS object, drawn to canvas each frame
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const CELL = 36;          // grid cell size px
const PORT_R = 7;         // port circle radius
const NODE_PAD = 10;      // padding inside node rect

// ── Colour palette (works light + dark) ──────────────────────────────────────
function getColors(dark) {
  return {
    bg:       dark ? "#0f1923" : "#f8fafc",
    grid:     dark ? "#1e293b" : "#e2e8f0",
    nodeBg:   dark ? "#1e293b" : "#ffffff",
    nodeBdr:  dark ? "#334155" : "#cbd5e1",
    nodeText: dark ? "#e2e8f0" : "#1e293b",
    portOff:  dark ? "#475569" : "#94a3b8",
    portOn:   dark ? "#34d399" : "#059669",
    wireOff:  dark ? "#334155" : "#cbd5e1",
    wireOn:   dark ? "#34d399" : "#059669",
    wireHi:   dark ? "#38bdf8" : "#0284c7",   // highlight (dragging)
    power:    dark ? "#fbbf24" : "#d97706",
    lamp:     dark ? "#fbbf24" : "#d97706",
    lampOff:  dark ? "#292524" : "#e7e5e4",
    sel:      dark ? "#38bdf8" : "#0891b2",
    gateFill: {
      NOT:  dark ? "#312e81" : "#eef2ff",
      AND:  dark ? "#064e3b" : "#ecfdf5",
      OR:   dark ? "#422006" : "#fff7ed",
      XOR:  dark ? "#1e1b4b" : "#f5f3ff",
      NAND: dark ? "#3b0764" : "#faf5ff",
      NOR:  dark ? "#450a0a" : "#fef2f2",
      XNOR: dark ? "#042f2e" : "#f0fdfa",
    },
  };
}

// ── Node definitions ──────────────────────────────────────────────────────────
const NODE_DEFS = {
  POWER:  { label:"1", w:2, h:1, ins:0, outs:1, compute: ()=>[true] },
  GROUND: { label:"0", w:2, h:1, ins:0, outs:1, compute: ()=>[false] },
  NOT:    { label:"NOT", w:3, h:2, ins:1, outs:1, compute:([a])=>[!a] },
  AND:    { label:"AND", w:3, h:2, ins:2, outs:1, compute:([a,b])=>[a&&b] },
  OR:     { label:"OR",  w:3, h:2, ins:2, outs:1, compute:([a,b])=>[a||b] },
  XOR:    { label:"XOR", w:3, h:2, ins:2, outs:1, compute:([a,b])=>[a!==b] },
  NAND:   { label:"NAND",w:3, h:2, ins:2, outs:1, compute:([a,b])=>[!(a&&b)] },
  NOR:    { label:"NOR", w:3, h:2, ins:2, outs:1, compute:([a,b])=>[!(a||b)] },
  LAMP:   { label:"OUT", w:2, h:2, ins:1, outs:0, compute:()=>[] },
  SWITCH: { label:"SW",  w:2, h:1, ins:0, outs:1, compute:(_, state)=>[!!state.on] },
};

// ── Port position helpers ─────────────────────────────────────────────────────
function getPortPos(node, side, idx, count) {
  const def = NODE_DEFS[node.type];
  const nw = def.w * CELL, nh = def.h * CELL;
  const nx = node.gx * CELL, ny = node.gy * CELL;
  if (side === "in") {
    const step = nh / (count + 1);
    return { x: nx, y: ny + step * (idx + 1) };
  } else {
    const step = nh / (count + 1);
    return { x: nx + nw, y: ny + step * (idx + 1) };
  }
}

// ── Signal propagation (topological) ─────────────────────────────────────────
function propagate(nodes, wires) {
  const values = {};   // `${nodeId}-out-${idx}` → boolean
  const inValues = {}; // `${nodeId}-in-${idx}` → boolean

  // Init POWER / GROUND / SWITCH outputs
  nodes.forEach(n => {
    const def = NODE_DEFS[n.type];
    if (def.ins === 0) {
      const outs = def.compute([], n.state || {});
      outs.forEach((v, i) => { values[`${n.id}-out-${i}`] = v; });
    }
  });

  // Propagate — up to N passes (handles chains)
  for (let pass = 0; pass < nodes.length + 2; pass++) {
    let changed = false;
    nodes.forEach(n => {
      const def = NODE_DEFS[n.type];
      if (def.ins === 0) return;
      const ins = Array.from({ length: def.ins }, (_, i) => {
        return inValues[`${n.id}-in-${i}`] || false;
      });
      const outs = def.compute(ins, n.state || {});
      outs.forEach((v, i) => {
        const key = `${n.id}-out-${i}`;
        if (values[key] !== v) { values[key] = v; changed = true; }
      });
    });
    if (!changed) break;
  }

  // Push wire values to input ports
  wires.forEach(w => {
    const v = values[`${w.fromNode}-out-${w.fromPort}`] || false;
    inValues[`${w.toNode}-in-${w.toPort}`] = v;
  });

  // Second pass for downstream
  for (let pass = 0; pass < 3; pass++) {
    nodes.forEach(n => {
      const def = NODE_DEFS[n.type];
      if (def.ins === 0) return;
      const ins = Array.from({ length: def.ins }, (_, i) => inValues[`${n.id}-in-${i}`] || false);
      const outs = def.compute(ins, n.state || {});
      outs.forEach((v, i) => {
        const key = `${n.id}-out-${i}`;
        if (values[key] !== v) { values[key] = v; }
      });
    });
    wires.forEach(w => {
      const v = values[`${w.fromNode}-out-${w.fromPort}`] || false;
      inValues[`${w.toNode}-in-${w.toPort}`] = v;
    });
  }

  return { values, inValues };
}

// ── Challenge definitions ─────────────────────────────────────────────────────
const CHALLENGES = [
  {
    id: "c1",
    title: "Light the lamp",
    desc: "Connect a power source to the output lamp. Click a port to start a wire, click another to connect it.",
    hint: "Click the yellow dot on POWER, then click the yellow dot on OUT.",
    starterNodes: [
      { id:"n1", type:"POWER",  gx:2, gy:3, state:{} },
      { id:"n2", type:"LAMP",   gx:7, gy:3, state:{} },
    ],
    starterWires: [],
    locked: [],
    check: (nodes, wires, sig) => sig.inValues["n2-in-0"] === true,
    successMsg: "The lamp is on. You connected two nodes with a wire — that's the foundation of every circuit.",
  },
  {
    id: "c2",
    title: "NOT gate: flip the signal",
    desc: "A NOT gate inverts its input. Connect POWER → NOT → LAMP. The lamp should stay OFF (NOT turns 1 into 0).",
    hint: "NOT flips the signal. 1 becomes 0, so the lamp goes out.",
    starterNodes: [
      { id:"n1", type:"POWER", gx:1, gy:3, state:{} },
      { id:"n2", type:"NOT",   gx:5, gy:2, state:{} },
      { id:"n3", type:"LAMP",  gx:10, gy:3, state:{} },
    ],
    starterWires: [],
    locked: ["n1","n2","n3"],
    check: (nodes, wires, sig) => sig.inValues["n3-in-0"] === false && wires.length >= 2,
    successMsg: "NOT is your first logic gate. It does one thing: flip. This is how computers build decisions from binary signals.",
  },
  {
    id: "c3",
    title: "AND gate: both must be true",
    desc: "AND outputs 1 only when BOTH inputs are 1. Build a circuit where flipping either switch changes the lamp.",
    hint: "Wire both switches to the AND inputs. The lamp only lights when both switches are ON.",
    starterNodes: [
      { id:"sw1", type:"SWITCH", gx:1, gy:2, state:{ on:false } },
      { id:"sw2", type:"SWITCH", gx:1, gy:5, state:{ on:false } },
      { id:"g1",  type:"AND",    gx:6, gy:3, state:{} },
      { id:"lmp", type:"LAMP",   gx:11, gy:3, state:{} },
    ],
    starterWires: [],
    locked: [],
    check: (nodes, wires, sig) => {
      const lamp = sig.inValues["lmp-in-0"];
      const sw1 = nodes.find(n=>n.id==="sw1"), sw2 = nodes.find(n=>n.id==="sw2");
      return wires.length >= 3 && (lamp === (sw1?.state?.on && sw2?.state?.on));
    },
    successMsg: "AND is the basis of conditional logic. In code, 'if (a && b)' is exactly this gate. Every if-statement in every program is AND logic.",
  },
  {
    id: "c4",
    title: "OR gate: either is enough",
    desc: "OR outputs 1 when at least one input is 1. Build it and notice how it differs from AND.",
    hint: "The lamp lights if switch 1 OR switch 2 is on — or both.",
    starterNodes: [
      { id:"sw1", type:"SWITCH", gx:1, gy:2, state:{ on:false } },
      { id:"sw2", type:"SWITCH", gx:1, gy:5, state:{ on:false } },
      { id:"g1",  type:"OR",     gx:6, gy:3, state:{} },
      { id:"lmp", type:"LAMP",   gx:11, gy:3, state:{} },
    ],
    starterWires: [],
    locked: [],
    check: (nodes, wires, sig) => wires.length >= 3 && sig.inValues["lmp-in-0"] !== undefined,
    successMsg: "OR models inclusion. In code, 'if (a || b)'. Any input being true is enough. Combined with AND and NOT, these three gates can compute anything.",
  },
  {
    id: "c5",
    title: "XOR: build a half-adder bit",
    desc: "XOR outputs 1 when inputs differ. Build: XOR for the sum bit, AND for the carry bit. This is binary addition.",
    hint: "You need XOR and AND sharing the same two inputs. Sum = XOR output. Carry = AND output.",
    starterNodes: [
      { id:"sw1", type:"SWITCH", gx:1, gy:2, state:{ on:false } },
      { id:"sw2", type:"SWITCH", gx:1, gy:6, state:{ on:false } },
      { id:"xor", type:"XOR",    gx:6, gy:2, state:{} },
      { id:"and", type:"AND",    gx:6, gy:6, state:{} },
      { id:"sum", type:"LAMP",   gx:11, gy:2, state:{} },
      { id:"carry",type:"LAMP",  gx:11, gy:6, state:{} },
    ],
    starterWires: [],
    locked: [],
    check: (nodes, wires, sig) => {
      const sw1 = nodes.find(n=>n.id==="sw1")?.state?.on;
      const sw2 = nodes.find(n=>n.id==="sw2")?.state?.on;
      const sumOk = sig.inValues["sum-in-0"] === (sw1 !== sw2);
      const carryOk = sig.inValues["carry-in-0"] === (sw1 && sw2);
      return wires.length >= 4 && sumOk && carryOk;
    },
    successMsg: "You built a half-adder — the fundamental building block of every CPU's arithmetic unit. Billions of transistors doing exactly this at billions of times per second.",
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function LogicSim({ params = {} }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const stateRef  = useRef({
    nodes: [], wires: [],
    draggingWire: null,   // { fromNode, fromPort, fromSide, mouseX, mouseY }
    selected: null,       // nodeId
    tool: "wire",         // "place" | "wire" | "delete"
    placeType: "AND",
    mouseX: 0, mouseY: 0,
    signals: { values:{}, inValues:{} },
    panX: 0, panY: 0,
  });

  const [mode, setMode]         = useState("sandbox");
  const [chalIdx, setChalIdx]   = useState(0);
  const [tool, setTool]         = useState("wire");
  const [placeType, setPlaceType] = useState("AND");
  const [success, setSuccess]   = useState(false);
  const [hint, setHint]         = useState(false);
  const [, forceRender]         = useState(0);

  const dark = window.matchMedia("(prefers-color-scheme:dark)").matches;
  const C = getColors(dark);

  // ── Load challenge or clear sandbox ────────────────────────────────────────
  const loadChallenge = useCallback((idx) => {
    const ch = CHALLENGES[idx];
    const st = stateRef.current;
    st.nodes = ch.starterNodes.map(n => ({ ...n, state: { ...(n.state||{}) } }));
    st.wires = ch.starterWires.map(w => ({ ...w }));
    st.signals = propagate(st.nodes, st.wires);
    st.selected = null;
    st.draggingWire = null;
    st.panX = 0; st.panY = 0;
    setSuccess(false);
    setHint(false);
    forceRender(r => r+1);
  }, []);

  const clearSandbox = useCallback(() => {
    const st = stateRef.current;
    st.nodes = [
      { id:"p1", type:"POWER",  gx:2, gy:3, state:{} },
      { id:"p2", type:"GROUND", gx:2, gy:7, state:{} },
      { id:"l1", type:"LAMP",   gx:12, gy:5, state:{} },
    ];
    st.wires = [];
    st.signals = propagate(st.nodes, st.wires);
    st.selected = null; st.draggingWire = null;
    setSuccess(false);
    forceRender(r => r+1);
  }, []);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const { nodes, wires, draggingWire, selected, signals, panX, panY } = stateRef.current;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
    for (let x = (panX % CELL); x < W; x += CELL) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = (panY % CELL); y < H; y += CELL) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const tx = x => x * CELL + panX;
    const ty = y => y * CELL + panY;

    // Wires
    wires.forEach(w => {
      const fn = nodes.find(n => n.id === w.fromNode);
      const tn = nodes.find(n => n.id === w.toNode);
      if (!fn || !tn) return;
      const fromDef = NODE_DEFS[fn.type], toDef = NODE_DEFS[tn.type];
      const fp = getPortPos({...fn, gx:fn.gx, gy:fn.gy}, "out", w.fromPort, fromDef.outs);
      const tp = getPortPos({...tn, gx:tn.gx, gy:tn.gy}, "in",  w.toPort,  toDef.ins);
      const on = signals.values[`${w.fromNode}-out-${w.fromPort}`] || false;
      ctx.strokeStyle = on ? C.wireOn : C.wireOff;
      ctx.lineWidth = on ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(tx(fp.x/CELL), ty(fp.y/CELL));
      const mx = (tx(fp.x/CELL) + tx(tp.x/CELL)) / 2;
      ctx.bezierCurveTo(mx, ty(fp.y/CELL), mx, ty(tp.y/CELL), tx(tp.x/CELL), ty(tp.y/CELL));
      ctx.stroke();
    });

    // Dragging wire
    if (draggingWire) {
      ctx.strokeStyle = C.wireHi; ctx.lineWidth = 2; ctx.setLineDash([4,4]);
      const fn = nodes.find(n => n.id === draggingWire.fromNode);
      if (fn) {
        const def = NODE_DEFS[fn.type];
        const fp = getPortPos(fn, draggingWire.fromSide, draggingWire.fromPort, draggingWire.fromSide==="out"?def.outs:def.ins);
        ctx.beginPath(); ctx.moveTo(tx(fp.x/CELL), ty(fp.y/CELL)); ctx.lineTo(draggingWire.mouseX, draggingWire.mouseY); ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Nodes
    nodes.forEach(n => {
      const def = NODE_DEFS[n.type];
      const nw = def.w * CELL, nh = def.h * CELL;
      const nx = tx(n.gx), ny = ty(n.gy);
      const isSelected = selected === n.id;

      // Node body
      const isLamp = n.type === "LAMP";
      const lampOn = isLamp && (signals.inValues[`${n.id}-in-0`] || false);
      const isPower = n.type === "POWER";
      const isGround = n.type === "GROUND";
      const isSwitch = n.type === "SWITCH";

      ctx.beginPath();
      if (isLamp) {
        ctx.arc(nx + nw/2, ny + nh/2, Math.min(nw,nh)/2 - 4, 0, 2*Math.PI);
      } else {
        ctx.roundRect(nx, ny, nw, nh, 6);
      }
      ctx.fillStyle = isLamp ? (lampOn ? C.lamp : C.lampOff)
                    : isPower ? C.power+"33"
                    : isGround ? C.grid
                    : isSwitch ? (n.state?.on ? C.portOn+"33" : C.nodeBg)
                    : (C.gateFill[n.type] || C.nodeBg);
      ctx.fill();
      ctx.strokeStyle = isSelected ? C.sel : (isLamp && lampOn ? C.lamp : isSwitch && n.state?.on ? C.portOn : C.nodeBdr);
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = isLamp ? (lampOn ? "#fff" : C.nodeText)
                    : isPower ? C.power
                    : isSwitch ? (n.state?.on ? C.portOn : C.nodeText)
                    : C.nodeText;
      ctx.font = `${isLamp?12:11}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(isSwitch ? (n.state?.on?"ON":"OFF") : def.label, nx + nw/2, ny + nh/2);

      // Input ports
      for (let i = 0; i < def.ins; i++) {
        const p = getPortPos(n, "in", i, def.ins);
        const on = signals.inValues[`${n.id}-in-${i}`] || false;
        ctx.beginPath(); ctx.arc(tx(p.x/CELL), ty(p.y/CELL), PORT_R, 0, 2*Math.PI);
        ctx.fillStyle = on ? C.portOn : C.portOff; ctx.fill();
        ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke();
      }
      // Output ports
      for (let i = 0; i < def.outs; i++) {
        const p = getPortPos(n, "out", i, def.outs);
        const on = signals.values[`${n.id}-out-${i}`] || false;
        ctx.beginPath(); ctx.arc(tx(p.x/CELL), ty(p.y/CELL), PORT_R, 0, 2*Math.PI);
        ctx.fillStyle = on ? C.portOn : C.portOff; ctx.fill();
        ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke();
      }
    });
  }, [C]);

  // ── Animation loop ─────────────────────────────────────────────────────────
  const animRef = useRef(null);
  useEffect(() => {
    const loop = () => { draw(); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // ── Resize canvas ──────────────────────────────────────────────────────────
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (canvasRef.current && wrapRef.current) {
        canvasRef.current.width  = wrapRef.current.clientWidth;
        canvasRef.current.height = Math.max(360, wrapRef.current.clientHeight);
      }
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Hit testing ────────────────────────────────────────────────────────────
  const hitPort = useCallback((mx, my) => {
    const { nodes, signals, panX, panY } = stateRef.current;
    const tx = gx => gx * CELL + panX;
    const ty = gy => gy * CELL + panY;
    for (const n of nodes) {
      const def = NODE_DEFS[n.type];
      for (let i = 0; i < def.ins; i++) {
        const p = getPortPos(n, "in", i, def.ins);
        const dx = mx - tx(p.x/CELL), dy = my - ty(p.y/CELL);
        if (Math.hypot(dx,dy) < PORT_R + 4) return { nodeId:n.id, port:i, side:"in" };
      }
      for (let i = 0; i < def.outs; i++) {
        const p = getPortPos(n, "out", i, def.outs);
        const dx = mx - tx(p.x/CELL), dy = my - ty(p.y/CELL);
        if (Math.hypot(dx,dy) < PORT_R + 4) return { nodeId:n.id, port:i, side:"out" };
      }
    }
    return null;
  }, []);

  const hitNode = useCallback((mx, my) => {
    const { nodes, panX, panY } = stateRef.current;
    for (const n of [...nodes].reverse()) {
      const def = NODE_DEFS[n.type];
      const nw = def.w * CELL, nh = def.h * CELL;
      const nx = n.gx * CELL + panX, ny = n.gy * CELL + panY;
      if (mx>=nx && mx<=nx+nw && my>=ny && my<=ny+nh) return n;
    }
    return null;
  }, []);

  // ── Mouse handlers ─────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;
    const { tool: t, placeType: pt } = st;

    if (t === "place") {
      // Place new node snapped to grid
      const gx = Math.round((mx - st.panX) / CELL);
      const gy = Math.round((my - st.panY) / CELL);
      const id = "n" + Date.now();
      st.nodes.push({ id, type: pt, gx, gy, state: pt==="SWITCH"?{on:false}:{} });
      st.signals = propagate(st.nodes, st.wires);
      forceRender(r => r+1);
      return;
    }

    // Check port first (for wire tool)
    const port = hitPort(mx, my);
    if (port && t === "wire") {
      st.draggingWire = { fromNode: port.nodeId, fromPort: port.port, fromSide: port.side, mouseX: mx, mouseY: my };
      return;
    }

    const node = hitNode(mx, my);
    if (node) {
      if (t === "delete") {
        st.nodes = st.nodes.filter(n => n.id !== node.id);
        st.wires = st.wires.filter(w => w.fromNode !== node.id && w.toNode !== node.id);
        st.signals = propagate(st.nodes, st.wires);
        st.selected = null;
        forceRender(r => r+1);
        return;
      }
      if (node.type === "SWITCH") {
        node.state = { ...node.state, on: !node.state?.on };
        st.signals = propagate(st.nodes, st.wires);
        // Check challenge
        if (mode === "challenge") {
          const ch = CHALLENGES[chalIdx];
          if (ch.check(st.nodes, st.wires, st.signals)) setSuccess(true);
        }
        forceRender(r => r+1);
        return;
      }
      st.selected = node.id;
      st._dragNode = node;
      st._dragOffX = mx - node.gx * CELL - st.panX;
      st._dragOffY = my - node.gy * CELL - st.panY;
      return;
    }
    st.selected = null;
    // Pan start
    st._panning = true; st._panStartX = mx - st.panX; st._panStartY = my - st.panY;
  }, [hitPort, hitNode, mode, chalIdx]);

  const onMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;
    st.mouseX = mx; st.mouseY = my;
    if (st.draggingWire) { st.draggingWire.mouseX = mx; st.draggingWire.mouseY = my; return; }
    if (st._dragNode) {
      const gx = Math.round((mx - st._dragOffX - st.panX) / CELL);
      const gy = Math.round((my - st._dragOffY - st.panY) / CELL);
      st._dragNode.gx = Math.max(0, gx); st._dragNode.gy = Math.max(0, gy);
      st.signals = propagate(st.nodes, st.wires);
      return;
    }
    if (st._panning) { st.panX = mx - st._panStartX; st.panY = my - st._panStartY; }
  }, []);

  const onMouseUp = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;

    if (st.draggingWire) {
      const port = hitPort(mx, my);
      if (port && port.nodeId !== st.draggingWire.fromNode) {
        const dw = st.draggingWire;
        // Determine from/to based on sides
        let fromNode, fromPort, toNode, toPort;
        if (dw.fromSide === "out" && port.side === "in") {
          fromNode=dw.fromNode; fromPort=dw.fromPort; toNode=port.nodeId; toPort=port.port;
        } else if (dw.fromSide === "in" && port.side === "out") {
          fromNode=port.nodeId; fromPort=port.port; toNode=dw.fromNode; toPort=dw.fromPort;
        }
        if (fromNode) {
          // Remove existing wire to same input
          st.wires = st.wires.filter(w => !(w.toNode===toNode && w.toPort===toPort));
          st.wires.push({ id:"w"+Date.now(), fromNode, fromPort, toNode, toPort });
          st.signals = propagate(st.nodes, st.wires);
          // Check challenge success
          if (mode === "challenge") {
            const ch = CHALLENGES[chalIdx];
            if (ch.check(st.nodes, st.wires, st.signals)) setSuccess(true);
          }
          forceRender(r => r+1);
        }
      }
      st.draggingWire = null;
    }
    st._dragNode = null;
    st._panning = false;
  }, [hitPort, mode, chalIdx]);

  // Sync tool to stateRef
  useEffect(() => { stateRef.current.tool = tool; }, [tool]);
  useEffect(() => { stateRef.current.placeType = placeType; }, [placeType]);

  // Init
  useEffect(() => {
    if (mode === "sandbox") clearSandbox();
    else loadChallenge(0);
  }, []);

  const handleModeSwitch = (m) => {
    setMode(m);
    setSuccess(false);
    setHint(false);
    if (m === "sandbox") clearSandbox();
    else { setChalIdx(0); loadChallenge(0); }
  };

  const handleChalSwitch = (i) => {
    setChalIdx(i);
    loadChallenge(i);
  };

  const deleteSelected = () => {
    const st = stateRef.current;
    if (!st.selected) return;
    st.wires = st.wires.filter(w => w.fromNode!==st.selected && w.toNode!==st.selected);
    st.nodes = st.nodes.filter(n => n.id!==st.selected);
    st.signals = propagate(st.nodes, st.wires);
    st.selected = null;
    forceRender(r => r+1);
  };

  const ch = CHALLENGES[chalIdx];

  // ── UI ─────────────────────────────────────────────────────────────────────
  const btn = (active, color="#0891b2") => ({
    padding:"4px 11px", borderRadius:14, fontSize:12, cursor:"pointer", fontWeight:active?600:400,
    border:`0.5px solid ${active?color:"var(--color-border-secondary)"}`,
    background:active?color+"18":"transparent", color:active?color:"var(--color-text-secondary)"
  });

  return (
    <div style={{ fontFamily:"var(--font-sans,system-ui)", display:"flex", flexDirection:"column", gap:0 }}>
      {/* Mode bar */}
      <div style={{ display:"flex", gap:8, alignItems:"center", padding:"10px 14px", borderBottom:"0.5px solid var(--color-border-tertiary)", flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:5 }}>
          <button onClick={() => handleModeSwitch("sandbox")} style={btn(mode==="sandbox","#7c3aed")}>Free sandbox</button>
          <button onClick={() => handleModeSwitch("challenge")} style={btn(mode==="challenge","#059669")}>Challenges</button>
        </div>
        {mode==="challenge" && (
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {CHALLENGES.map((c,i) => (
              <button key={c.id} onClick={() => handleChalSwitch(i)} style={btn(chalIdx===i,"#059669")}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Challenge info */}
      {mode==="challenge" && (
        <div style={{ padding:"10px 14px", background:"var(--color-background-secondary)", borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", marginBottom:3 }}>
                Challenge {chalIdx+1}: {ch.title}
              </div>
              <div style={{ fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.6 }}>{ch.desc}</div>
              {hint && <div style={{ marginTop:6, fontSize:12, color:"#d97706", lineHeight:1.5 }}>Hint: {ch.hint}</div>}
            </div>
            <button onClick={() => setHint(h=>!h)} style={{ ...btn(hint,"#d97706"), flexShrink:0, whiteSpace:"nowrap" }}>
              {hint?"Hide hint":"Hint"}
            </button>
          </div>
          {success && (
            <div style={{ marginTop:10, padding:"10px 14px", borderRadius:8, background:"var(--color-background-success)", border:"0.5px solid var(--color-border-success)", fontSize:13, color:"var(--color-text-success)", lineHeight:1.6 }}>
              <span style={{ fontWeight:500, marginRight:6 }}>Complete!</span>{ch.successMsg}
              {chalIdx < CHALLENGES.length-1 && (
                <button onClick={() => handleChalSwitch(chalIdx+1)} style={{ marginLeft:12, ...btn(false,"#059669"), fontSize:12 }}>
                  Next challenge →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:"flex", gap:6, alignItems:"center", padding:"8px 14px", borderBottom:"0.5px solid var(--color-border-tertiary)", flexWrap:"wrap", background:"var(--color-background-primary)" }}>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={() => setTool("wire")}   style={btn(tool==="wire","#0891b2")}>Wire</button>
          <button onClick={() => setTool("place")}  style={btn(tool==="place","#7c3aed")}>Place</button>
          <button onClick={() => setTool("delete")} style={btn(tool==="delete","#A32D2D")}>Delete</button>
        </div>
        {tool==="place" && (
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {["POWER","GROUND","SWITCH","NOT","AND","OR","XOR","NAND","NOR","LAMP"].map(t => (
              <button key={t} onClick={() => setPlaceType(t)} style={btn(placeType===t,"#7c3aed")}>{t}</button>
            ))}
          </div>
        )}
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          <button onClick={deleteSelected} style={btn(false,"#A32D2D")}>Del selected</button>
          <button onClick={() => { stateRef.current.wires=[]; stateRef.current.signals=propagate(stateRef.current.nodes,[]); forceRender(r=>r+1); }} style={btn(false)}>Clear wires</button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={wrapRef} style={{ position:"relative", height:380, cursor: tool==="place"?"crosshair":tool==="delete"?"not-allowed":"default" }}>
        <canvas ref={canvasRef}
          style={{ width:"100%", height:"100%", display:"block" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
        <div style={{ position:"absolute", bottom:8, right:10, fontSize:11, color:"var(--color-text-tertiary)", pointerEvents:"none" }}>
          {tool==="wire" ? "Click a port (circle), drag to another port" : tool==="place" ? `Click to place ${placeType}` : "Click a node to delete it"} · Drag nodes to move · Drag empty space to pan
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:12, padding:"8px 14px", borderTop:"0.5px solid var(--color-border-tertiary)", flexWrap:"wrap" }}>
        {[["Green dot/wire","signal ON (1)"],["Gray dot/wire","signal OFF (0)"],["Yellow circle","POWER (always 1)"],["Click SW node","toggle switch"],["Round node","output lamp"]].map(([k,v]) => (
          <div key={k} style={{ fontSize:11, color:"var(--color-text-tertiary)" }}>
            <span style={{ fontWeight:500, color:"var(--color-text-secondary)" }}>{k}</span> — {v}
          </div>
        ))}
      </div>
    </div>
  );
}