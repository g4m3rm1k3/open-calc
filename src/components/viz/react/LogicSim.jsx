import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const CELL = 64;          // grid cell size px (Massively increased)
const PORT_R = 12;        // port circle radius
const NODE_PAD = 16;      // padding inside node rect

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
    wireHi:   dark ? "#38bdf8" : "#0284c7",
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
    },
  };
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const ob = new MutationObserver(update);
    ob.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => ob.disconnect();
  }, []);
  return isDark;
}

// ── Node definitions ──────────────────────────────────────────────────────────
const NODE_DEFS = {
  POWER:  { label:"1", w:2, h:1, ins:0, outs:1, compute: ()=>[true], desc:"Constant ON signal (1)" },
  GROUND: { label:"0", w:2, h:1, ins:0, outs:1, compute: ()=>[false], desc:"Constant OFF signal (0)" },
  SWITCH: { label:"SW",  w:2, h:1, ins:0, outs:1, compute:(_, state)=>[!!state.on], desc:"Click to toggle ON/OFF" },
  LAMP:   { label:"OUT", w:2, h:2, ins:1, outs:0, compute:()=>[], desc:"Output indicator. Lights up when ON" },
  NOT:    { label:"NOT", w:3, h:2, ins:1, outs:1, compute:([a])=>[!a], desc:"Inverts the signal (1 becomes 0)" },
  AND:    { label:"AND", w:3, h:2, ins:2, outs:1, compute:([a,b])=>[a&&b], desc:"ON only if BOTH inputs are ON" },
  OR:     { label:"OR",  w:3, h:2, ins:2, outs:1, compute:([a,b])=>[a||b], desc:"ON if AT LEAST ONE input is ON" },
  XOR:    { label:"XOR", w:3, h:2, ins:2, outs:1, compute:([a,b])=>[a!==b], desc:"ON if inputs are DIFFERENT" },
  NAND:   { label:"NAND",w:3, h:2, ins:2, outs:1, compute:([a,b])=>[!(a&&b)], desc:"ON unless BOTH inputs are ON" },
  NOR:    { label:"NOR", w:3, h:2, ins:2, outs:1, compute:([a,b])=>[!(a||b)], desc:"ON only if BOTH inputs are OFF" },
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
  const values = {};   
  const inValues = {}; 

  nodes.forEach(n => {
    const def = NODE_DEFS[n.type];
    if (def.ins === 0) {
      const outs = def.compute([], n.state || {});
      outs.forEach((v, i) => { values[`${n.id}-out-${i}`] = v; });
    }
  });

  for (let pass = 0; pass < nodes.length + 2; pass++) {
    let changed = false;
    nodes.forEach(n => {
      const def = NODE_DEFS[n.type];
      if (def.ins === 0) return;
      const ins = Array.from({ length: def.ins }, (_, i) => inValues[`${n.id}-in-${i}`] || false);
      const outs = def.compute(ins, n.state || {});
      outs.forEach((v, i) => {
        const key = `${n.id}-out-${i}`;
        if (values[key] !== v) { values[key] = v; changed = true; }
      });
    });
    if (!changed) break;
  }

  wires.forEach(w => {
    const v = values[`${w.fromNode}-out-${w.fromPort}`] || false;
    inValues[`${w.toNode}-in-${w.toPort}`] = v;
  });

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
    desc: "Connect a power source to the output lamp. Drag from the output port of POWER to the input port of the LAMP.",
    hint: "Click the yellow dot on POWER, then click the yellow dot on OUT.",
    starterNodes: [
      { id:"n1", type:"POWER",  gx:2, gy:4, state:{} },
      { id:"n2", type:"LAMP",   gx:9, gy:4, state:{} },
    ],
    starterWires: [],
    locked: [],
    check: (nodes, wires, sig) => sig.inValues["n2-in-0"] === true,
    successMsg: "The lamp is on. You connected two nodes with a wire — that's the foundation of every circuit.",
  },
  {
    id: "c2",
    title: "NOT gate: flip the signal",
    desc: "A NOT gate inverts its input. Connect POWER → NOT → LAMP. The lamp should stay OFF.",
    hint: "NOT flips the signal. 1 becomes 0, so the lamp goes out.",
    starterNodes: [
      { id:"n1", type:"POWER", gx:2, gy:4, state:{} },
      { id:"n2", type:"NOT",   gx:7, gy:3, state:{} },
      { id:"n3", type:"LAMP",  gx:13, gy:4, state:{} },
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
      { id:"sw1", type:"SWITCH", gx:2, gy:2, state:{ on:false } },
      { id:"sw2", type:"SWITCH", gx:2, gy:7, state:{ on:false } },
      { id:"g1",  type:"AND",    gx:8, gy:4, state:{} },
      { id:"lmp", type:"LAMP",   gx:14, gy:4, state:{} },
    ],
    starterWires: [],
    locked: [],
    check: (nodes, wires, sig) => {
      const lamp = sig.inValues["lmp-in-0"];
      const sw1 = nodes.find(n=>n.id==="sw1"), sw2 = nodes.find(n=>n.id==="sw2");
      return wires.length >= 3 && (lamp === !!(sw1?.state?.on && sw2?.state?.on));
    },
    successMsg: "AND is the basis of conditional logic. In code, 'if (a && b)' is exactly this gate.",
  },
  {
    id: "c4",
    title: "OR gate: either is enough",
    desc: "OR outputs 1 when at least one input is 1. Build it and notice how it differs from AND.",
    hint: "The lamp lights if switch 1 OR switch 2 is on — or both.",
    starterNodes: [
      { id:"sw1", type:"SWITCH", gx:2, gy:2, state:{ on:false } },
      { id:"sw2", type:"SWITCH", gx:2, gy:7, state:{ on:false } },
      { id:"g1",  type:"OR",     gx:8, gy:4, state:{} },
      { id:"lmp", type:"LAMP",   gx:14, gy:4, state:{} },
    ],
    starterWires: [],
    locked: [],
    check: (nodes, wires, sig) => wires.length >= 3 && sig.inValues["lmp-in-0"] !== undefined,
    successMsg: "OR models inclusion. Any input being true is enough.",
  },
  {
    id: "c5",
    title: "XOR: build a half-adder bit",
    desc: "XOR outputs 1 when inputs differ. Build: XOR for the sum bit, AND for the carry bit.",
    hint: "You need XOR and AND sharing the same two inputs. Sum = XOR output. Carry = AND output.",
    starterNodes: [
      { id:"sw1", type:"SWITCH", gx:2, gy:3, state:{ on:false } },
      { id:"sw2", type:"SWITCH", gx:2, gy:8, state:{ on:false } },
      { id:"xor", type:"XOR",    gx:8, gy:2, state:{} },
      { id:"and", type:"AND",    gx:8, gy:9, state:{} },
      { id:"sum", type:"LAMP",   gx:15, gy:2, state:{} },
      { id:"carry",type:"LAMP",  gx:15, gy:9, state:{} },
    ],
    starterWires: [],
    locked: [],
    check: (nodes, wires, sig) => {
      const sw1 = nodes.find(n=>n.id==="sw1")?.state?.on || false;
      const sw2 = nodes.find(n=>n.id==="sw2")?.state?.on || false;
      const sumOk = sig.inValues["sum-in-0"] === (sw1 !== sw2);
      const carryOk = sig.inValues["carry-in-0"] === (sw1 && sw2);
      return wires.length >= 4 && sumOk && carryOk;
    },
    successMsg: "You built a half-adder — the fundamental building block of every CPU's arithmetic unit.",
  },
];

// ── Main component ────────────────────────────────────────────────────────────
function LogicSimContent({ params = {} }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const stateRef  = useRef({
    nodes: [], wires: [],
    draggingWire: null,
    selected: null,
    mouseX: 0, mouseY: 0,
    signals: { values:{}, inValues:{} },
    panX: 0, panY: 0,
    _clickStart: null,
  });

  const [mode, setMode]         = useState("sandbox");
  const [chalIdx, setChalIdx]   = useState(0);
  const [success, setSuccess]   = useState(false);
  const [hint, setHint]         = useState(false);
  const [, forceRender]         = useState(0);

  const dark = useIsDark();
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
    st.panX = 50; st.panY = 50;
    setSuccess(false);
    setHint(false);
    forceRender(r => r+1);
  }, []);

  const clearSandbox = useCallback(() => {
    const st = stateRef.current;
    st.nodes = [
      { id:"p1", type:"POWER",  gx:2, gy:3, state:{} },
      { id:"p2", type:"GROUND", gx:2, gy:8, state:{} },
      { id:"l1", type:"LAMP",   gx:12, gy:5, state:{} },
    ];
    st.wires = [];
    st.signals = propagate(st.nodes, st.wires);
    st.selected = null; st.draggingWire = null;
    st.panX = 50; st.panY = 50;
    setSuccess(false);
    forceRender(r => r+1);
  }, []);

  const deleteSelected = useCallback(() => {
    const st = stateRef.current;
    if (!st.selected) return;
    st.wires = st.wires.filter(w => w.fromNode!==st.selected && w.toNode!==st.selected);
    st.nodes = st.nodes.filter(n => n.id!==st.selected);
    st.signals = propagate(st.nodes, st.wires);
    st.selected = null;
    forceRender(r => r+1);
  }, []);

  // Keyboard events for deleting
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Backspace" || e.key === "Delete") && stateRef.current.selected) {
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelected]);

  // Init
  useEffect(() => {
    if (mode === "sandbox") clearSandbox();
    else loadChallenge(0);
  }, [mode, clearSandbox, loadChallenge]);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const { nodes, wires, draggingWire, selected, signals, panX, panY } = stateRef.current;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
    for (let x = (Math.floor(panX) % CELL); x < W; x += CELL) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = (Math.floor(panY) % CELL); y < H; y += CELL) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const tx = x => x * CELL + panX;
    const ty = y => y * CELL + panY;

    wires.forEach(w => {
      const fn = nodes.find(n => n.id === w.fromNode);
      const tn = nodes.find(n => n.id === w.toNode);
      if (!fn || !tn) return;
      const fromDef = NODE_DEFS[fn.type], toDef = NODE_DEFS[tn.type];
      const fp = getPortPos({...fn, gx:fn.gx, gy:fn.gy}, "out", w.fromPort, fromDef.outs);
      const tp = getPortPos({...tn, gx:tn.gx, gy:tn.gy}, "in",  w.toPort,  toDef.ins);
      const on = signals.values[`${w.fromNode}-out-${w.fromPort}`] || false;
      ctx.strokeStyle = on ? C.wireOn : C.wireOff;
      ctx.lineWidth = on ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(tx(fp.x/CELL), ty(fp.y/CELL));
      const mx = (tx(fp.x/CELL) + tx(tp.x/CELL)) / 2;
      ctx.bezierCurveTo(mx, ty(fp.y/CELL), mx, ty(tp.y/CELL), tx(tp.x/CELL), ty(tp.y/CELL));
      ctx.stroke();
    });

    if (draggingWire) {
      ctx.strokeStyle = C.wireHi; ctx.lineWidth = 2.5; ctx.setLineDash([4,4]);
      const fn = nodes.find(n => n.id === draggingWire.fromNode);
      if (fn) {
        const def = NODE_DEFS[fn.type];
        const fp = getPortPos(fn, draggingWire.fromSide, draggingWire.fromPort, draggingWire.fromSide==="out"?def.outs:def.ins);
        ctx.beginPath(); ctx.moveTo(tx(fp.x/CELL), ty(fp.y/CELL)); ctx.lineTo(draggingWire.mouseX, draggingWire.mouseY); ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    nodes.forEach(n => {
      const def = NODE_DEFS[n.type];
      const nw = def.w * CELL, nh = def.h * CELL;
      const nx = tx(n.gx), ny = ty(n.gy);
      const isSelected = selected === n.id;

      const isLamp = n.type === "LAMP";
      const lampOn = isLamp && (signals.inValues[`${n.id}-in-0`] || false);
      const isPower = n.type === "POWER";
      const isGround = n.type === "GROUND";
      const isSwitch = n.type === "SWITCH";

      ctx.beginPath();
      if (isLamp) {
        ctx.arc(nx + nw/2, ny + nh/2, Math.min(nw,nh)/2 - 6, 0, 2*Math.PI);
      } else {
        ctx.roundRect(nx, ny, nw, nh, 8);
      }
      ctx.fillStyle = isLamp ? (lampOn ? C.lamp : C.lampOff)
                    : isPower ? C.power+"33"
                    : isGround ? C.grid
                    : isSwitch ? (n.state?.on ? C.portOn+"33" : C.nodeBg)
                    : (C.gateFill[n.type] || C.nodeBg);
      ctx.fill();
      ctx.strokeStyle = isSelected ? C.sel : (isLamp && lampOn ? C.lamp : isSwitch && n.state?.on ? C.portOn : C.nodeBdr);
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.stroke();

      ctx.fillStyle = isLamp ? (lampOn ? "#fff" : C.nodeText)
                    : isPower ? C.power
                    : isSwitch ? (n.state?.on ? C.portOn : C.nodeText)
                    : C.nodeText;
      ctx.font = `bold ${isLamp?14:13}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(isSwitch ? (n.state?.on?"ON":"OFF") : def.label, nx + nw/2, ny + nh/2);

      for (let i = 0; i < def.ins; i++) {
        const p = getPortPos(n, "in", i, def.ins);
        const on = signals.inValues[`${n.id}-in-${i}`] || false;
        ctx.beginPath(); ctx.arc(tx(p.x/CELL), ty(p.y/CELL), PORT_R, 0, 2*Math.PI);
        ctx.fillStyle = on ? C.portOn : C.portOff; ctx.fill();
        ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.stroke();
      }
      for (let i = 0; i < def.outs; i++) {
        const p = getPortPos(n, "out", i, def.outs);
        const on = signals.values[`${n.id}-out-${i}`] || false;
        ctx.beginPath(); ctx.arc(tx(p.x/CELL), ty(p.y/CELL), PORT_R, 0, 2*Math.PI);
        ctx.fillStyle = on ? C.portOn : C.portOff; ctx.fill();
        ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.stroke();
      }
    });
  }, [C]);

  const animRef = useRef(null);
  useEffect(() => {
    const loop = () => { draw(); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (canvasRef.current && wrapRef.current) {
        canvasRef.current.width  = wrapRef.current.clientWidth;
        canvasRef.current.height = wrapRef.current.clientHeight;
      }
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const hitPort = useCallback((mx, my) => {
    const { nodes, signals, panX, panY } = stateRef.current;
    const tx = gx => gx * CELL + panX;
    const ty = gy => gy * CELL + panY;
    for (const n of nodes) {
      const def = NODE_DEFS[n.type];
      for (let i = 0; i < def.ins; i++) {
        const p = getPortPos(n, "in", i, def.ins);
        const dx = mx - tx(p.x/CELL), dy = my - ty(p.y/CELL);
        if (Math.hypot(dx,dy) < PORT_R + 5) return { nodeId:n.id, port:i, side:"in" };
      }
      for (let i = 0; i < def.outs; i++) {
        const p = getPortPos(n, "out", i, def.outs);
        const dx = mx - tx(p.x/CELL), dy = my - ty(p.y/CELL);
        if (Math.hypot(dx,dy) < PORT_R + 5) return { nodeId:n.id, port:i, side:"out" };
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

  const onMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;

    st._clickStart = { x: mx, y: my };

    const port = hitPort(mx, my);
    if (port) {
      st.draggingWire = { fromNode: port.nodeId, fromPort: port.port, fromSide: port.side, mouseX: mx, mouseY: my };
      return;
    }

    const node = hitNode(mx, my);
    if (node) {
      st.selected = node.id;
      st._dragNode = node;
      st._dragOffX = mx - node.gx * CELL - st.panX;
      st._dragOffY = my - node.gy * CELL - st.panY;
      forceRender(r=>r+1);
      return;
    }
    
    st.selected = null;
    st._panning = true; st._panStartX = mx - st.panX; st._panStartY = my - st.panY;
    forceRender(r => r+1);
  }, [hitPort, hitNode]);

  const onMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;
    st.mouseX = mx; st.mouseY = my;

    if (st.draggingWire) { st.draggingWire.mouseX = mx; st.draggingWire.mouseY = my; return; }
    if (st._dragNode) {
      const gx = Math.round((mx - st._dragOffX - st.panX) / CELL);
      const gy = Math.round((my - st._dragOffY - st.panY) / CELL);
      st._dragNode.gx = gx; st._dragNode.gy = gy;
      st.signals = propagate(st.nodes, st.wires);
      return;
    }
    if (st._panning) { st.panX = mx - st._panStartX; st.panY = my - st._panStartY; }
  }, []);

  const onMouseUp = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;

    const dx = mx - (st._clickStart?.x || mx);
    const dy = my - (st._clickStart?.y || my);
    const isClick = Math.hypot(dx, dy) < 5;

    if (st.draggingWire) {
      const port = hitPort(mx, my);
      if (port && port.nodeId !== st.draggingWire.fromNode) {
        const dw = st.draggingWire;
        let fromNode, fromPort, toNode, toPort;
        if (dw.fromSide === "out" && port.side === "in") {
          fromNode=dw.fromNode; fromPort=dw.fromPort; toNode=port.nodeId; toPort=port.port;
        } else if (dw.fromSide === "in" && port.side === "out") {
          fromNode=port.nodeId; fromPort=port.port; toNode=dw.fromNode; toPort=dw.fromPort;
        }
        if (fromNode) {
          st.wires = st.wires.filter(w => !(w.toNode===toNode && w.toPort===toPort));
          st.wires.push({ id:"w"+Date.now(), fromNode, fromPort, toNode, toPort });
          st.signals = propagate(st.nodes, st.wires);
          if (mode === "challenge") {
            const ch = CHALLENGES[chalIdx];
            if (ch.check(st.nodes, st.wires, st.signals)) setSuccess(true);
          }
          forceRender(r => r+1);
        }
      }
      st.draggingWire = null;
    } else if (st._dragNode && isClick) {
      if (st._dragNode.type === "SWITCH") {
        st._dragNode.state = { ...st._dragNode.state, on: !st._dragNode.state?.on };
        st.signals = propagate(st.nodes, st.wires);
        if (mode === "challenge") {
          const ch = CHALLENGES[chalIdx];
          if (ch.check(st.nodes, st.wires, st.signals)) setSuccess(true);
        }
      }
    }
    
    st._dragNode = null;
    st._panning = false;
    forceRender(r=>r+1);
  }, [hitPort, mode, chalIdx]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("nodeType");
    if (!NODE_DEFS[type]) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;
    
    // snap to grid
    const def = NODE_DEFS[type];
    const dropGx = Math.round((mx - st.panX) / CELL) - Math.floor(def.w / 2);
    const dropGy = Math.round((my - st.panY) / CELL) - Math.floor(def.h / 2);

    const id = "n" + Date.now();
    st.nodes.push({ id, type, gx: dropGx, gy: dropGy, state: type==="SWITCH"?{on:false}:{} });
    st.selected = id;
    st.signals = propagate(st.nodes, st.wires);
    forceRender(r=>r+1);
  }, []);

  const handleModeSwitch = (m) => {
    setMode(m);
    setSuccess(false);
    setHint(false);
  };

  const handleChalSwitch = (i) => {
    setChalIdx(i);
    loadChallenge(i);
  };

  const ch = CHALLENGES[chalIdx];

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl overflow-hidden font-sans">
      
      {/* ── Sidebar (Components & Modes) ── */}
      <div className="w-72 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 z-10">
        
        {/* Modes Section */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 text-lg">Logic Simulator</h3>
          <div className="flex gap-2 mb-4 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${mode === "sandbox" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
              onClick={() => handleModeSwitch("sandbox")}
            >
              Sandbox
            </button>
            <button 
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${mode === "challenge" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"}`}
              onClick={() => handleModeSwitch("challenge")}
            >
              Tutorials
            </button>
          </div>

          {mode === "challenge" && (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CHALLENGES.map((c,i) => (
                  <button 
                    key={c.id} 
                    onClick={() => handleChalSwitch(i)} 
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${chalIdx===i ? "bg-emerald-600 text-white" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50"}`}
                  >
                    {i+1}
                  </button>
                ))}
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{ch.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{ch.desc}</div>
                
                {hint && <div className="mt-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">💡 {ch.hint}</div>}
                
                <button onClick={() => setHint(h=>!h)} className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                  {hint ? "Hide hint" : "Need a hint?"}
                </button>
                
                {success && (
                  <div className="mt-3 p-2 rounded bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-sm text-emerald-700 dark:text-emerald-400">
                    <span className="font-bold mr-1">Complete!</span>{ch.successMsg}
                    {chalIdx < CHALLENGES.length-1 && (
                      <button onClick={() => handleChalSwitch(chalIdx+1)} className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors">
                        Next Tutorial →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Components Library */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex justify-between items-center mb-3">
             <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Components</h3>
             <button onClick={() => { stateRef.current.wires=[]; stateRef.current.signals=propagate(stateRef.current.nodes,[]); forceRender(r=>r+1); }} className="text-xs text-red-500 hover:text-red-700 hover:underline">Clear Wires</button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-100 dark:bg-slate-800 p-2 rounded">
            Drag items onto the grid. Click a placed node and press <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">Del</kbd> to remove.
          </p>
          
          <div className="flex flex-col gap-2.5">
            {Object.keys(NODE_DEFS).map(type => (
              <div key={type} 
                   draggable
                   onDragStart={e => e.dataTransfer.setData('nodeType', type)}
                   className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-grab hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all active:cursor-grabbing group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                    {NODE_DEFS[type].label === '0' || NODE_DEFS[type].label === '1' ? NODE_DEFS[type].label : NODE_DEFS[type].label.substring(0, 3)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{type}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{NODE_DEFS[type].desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Canvas Area ── */}
      <div className="flex-1 relative outline-none" 
           ref={wrapRef} 
           onDrop={onDrop} 
           onDragOver={e => e.preventDefault()}
           tabIndex={0}
      >
        <canvas ref={canvasRef}
          className="w-full h-full block cursor-default"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={(e) => {
            e.preventDefault();
            stateRef.current.panX -= e.deltaX;
            stateRef.current.panY -= e.deltaY;
          }}
        />
        
        {/* Helper overlay */}
        <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 px-3 py-2 rounded-lg shadow-sm pointer-events-none flex flex-col gap-1">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Signal ON</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></span> Signal OFF</div>
          <hr className="my-1 border-slate-200 dark:border-slate-700" />
          <div>Drag empty space / wheel to pan</div>
          <div>Drag ports to wire</div>
        </div>
      </div>

    </div>
  );
}

// ── Wrapper Component ────────────────────────────────────────────────────────
export default function LogicSim({ params = {} }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center py-12 px-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 shadow-sm my-6">
        <span className="text-5xl mb-4 leading-none">🔌</span>
        <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-100 mb-2">Digital Logic Sandbox</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
          This massive interactive workspace requires a full-screen view. Jump in to start wiring gates, switches, and complex digital circuits.
        </p>
        <button 
          onClick={() => setIsOpen(true)}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-lg transition-transform active:scale-95"
        >
          Launch Simulator
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 md:p-6 lg:p-8">
          <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-300 dark:border-slate-700">
            <div className="absolute top-4 right-4 z-[9999]">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                title="Close Simulator"
              >
                <span className="text-2xl leading-none font-bold -mt-0.5">&times;</span>
              </button>
            </div>
            {/* The main app container */}
            <LogicSimContent params={params} />
          </div>
        </div>
      )}
    </>
  );
}
