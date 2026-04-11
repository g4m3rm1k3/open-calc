import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────
const STYLES = `
:root {
  --bg:         #0b0e12;
  --surface:    #111520;
  --surface2:   #161c2a;
  --surface3:   #1c2435;
  --border:     #252e42;
  --border2:    #1e2738;
  --phosphor:   #00e5a0;
  --phosphor2:  #00b87a;
  --phosphor-d: rgba(0,229,160,0.08);
  --amber:      #f5a623;
  --amber-d:    rgba(245,166,35,0.1);
  --red:        #e05050;
  --blue:       #4da6ff;
  --blue-d:     rgba(77,166,255,0.1);
  --violet:     #a78bfa;
  --text:       #d4dde8;
  --text2:      #8a9ab5;
  --text3:      #4a5a72;
  --text-bright:#eef2f8;
  --mono:       'JetBrains Mono','Fira Code',monospace;
  --sans:       'Inter',system-ui,sans-serif;
  --serif:      'Georgia',Cambria,serif;
  --header-h:   48px;
  --sidebar-w:  240px;
  --controls-h: 76px;
}
#physlab-root *, #physlab-root *::before, #physlab-root *::after { box-sizing: border-box; margin:0; padding:0; }
#physlab-root { font-family: var(--mono); font-size:13px; line-height:1.5; }
#physlab-root ::-webkit-scrollbar { width:4px; height:4px; }
#physlab-root ::-webkit-scrollbar-track { background:var(--surface); }
#physlab-root ::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

/* Header */
#physlab-root .pl-header {
  display:flex; align-items:center; gap:0;
  background:var(--surface); border-bottom:1px solid var(--border);
  padding:0; z-index:10; height:var(--header-h); flex-shrink:0;
}
#physlab-root .pl-logo {
  display:flex; align-items:center; gap:10px;
  padding:0 20px; height:100%; border-right:1px solid var(--border); flex-shrink:0;
}
#physlab-root .pl-logo-mark {
  width:28px; height:28px; border:2px solid var(--phosphor); border-radius:4px;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:600; color:var(--phosphor);
}
#physlab-root .pl-logo-text {
  font-size:13px; font-weight:600; letter-spacing:.12em;
  text-transform:uppercase; color:var(--text-bright);
}
#physlab-root .pl-lab-tabs { display:flex; height:100%; flex:1; overflow-x:auto; }
#physlab-root .pl-lab-tabs::-webkit-scrollbar { height:0; }
#physlab-root .pl-lab-tab {
  display:flex; align-items:center; gap:6px; padding:0 14px; height:100%;
  cursor:pointer; font-size:10px; font-weight:500; letter-spacing:.08em;
  text-transform:uppercase; color:var(--text3);
  border-right:1px solid var(--border2); border-bottom:2px solid transparent;
  white-space:nowrap; transition:color .15s,border-color .15s,background .15s;
  user-select:none; border:none; background:transparent;
}
#physlab-root .pl-lab-tab:hover { color:var(--text); background:var(--surface2); }
#physlab-root .pl-lab-tab.active {
  color:var(--phosphor); border-bottom:2px solid var(--phosphor);
  background:var(--phosphor-d);
}
#physlab-root .pl-tab-dot { width:6px; height:6px; border-radius:50%; background:currentColor; opacity:.4; }
#physlab-root .pl-lab-tab.active .pl-tab-dot { opacity:1; }
#physlab-root .pl-tab-cat {
  font-size:9px; opacity:.5; margin-left:2px; font-weight:400;
}
#physlab-root .pl-header-actions {
  display:flex; align-items:center; gap:8px; padding:0 16px;
  height:100%; border-left:1px solid var(--border); flex-shrink:0;
}
#physlab-root .pl-hbtn {
  font-size:11px; font-weight:500; letter-spacing:.08em; text-transform:uppercase;
  padding:6px 14px; border-radius:3px; border:1px solid var(--border);
  background:transparent; color:var(--text2); cursor:pointer; transition:all .14s;
  white-space:nowrap;
}
#physlab-root .pl-hbtn:hover { border-color:var(--text2); color:var(--text); }
#physlab-root .pl-hbtn.run { border-color:var(--phosphor); color:var(--phosphor); }
#physlab-root .pl-hbtn.run:hover, #physlab-root .pl-hbtn.run.active {
  background:var(--phosphor); color:var(--bg);
}
#physlab-root .pl-hbtn.stop { border-color:var(--red); color:var(--red); }
#physlab-root .pl-hbtn.stop:hover { background:var(--red); color:#fff; }

/* Body */
#physlab-root .pl-body { display:flex; flex:1; overflow:hidden; min-height:0; }

/* Sidebar */
#physlab-root .pl-sidebar {
  width:var(--sidebar-w); flex-shrink:0;
  display:flex; flex-direction:column;
  background:var(--surface); border-right:1px solid var(--border); overflow:hidden;
}
#physlab-root .pl-sb-section { padding:12px 14px 10px; border-bottom:1px solid var(--border2); }
#physlab-root .pl-sb-label {
  font-size:9px; font-weight:600; letter-spacing:.14em;
  text-transform:uppercase; color:var(--text3); margin-bottom:5px;
}
#physlab-root .pl-lab-name { font-size:12px; font-weight:600; color:var(--text-bright); margin-bottom:3px; }
#physlab-root .pl-lab-obj { font-size:11px; color:var(--text2); line-height:1.45; }
#physlab-root .pl-proc-scroll { flex:1; overflow-y:auto; padding:6px 0; }
#physlab-root .pl-step {
  display:flex; gap:9px; align-items:flex-start; padding:7px 12px;
  cursor:pointer; transition:background .12s; border-left:2px solid transparent;
}
#physlab-root .pl-step:hover { background:var(--surface2); }
#physlab-root .pl-step.active { background:rgba(0,229,160,0.06); border-left-color:var(--phosphor); }
#physlab-root .pl-step.done .pl-step-n {
  background:var(--phosphor2); color:var(--bg); border-color:var(--phosphor2);
}
#physlab-root .pl-step-n {
  width:19px; height:19px; flex-shrink:0; border-radius:50%;
  border:1px solid var(--border); display:flex; align-items:center;
  justify-content:center; font-size:10px; color:var(--text3); margin-top:1px;
}
#physlab-root .pl-step-title { font-size:11px; font-weight:500; color:var(--text); margin-bottom:1px; }
#physlab-root .pl-step-desc { font-size:10px; color:var(--text3); line-height:1.4; }

/* Guided question callout */
#physlab-root .pl-question {
  margin:6px 12px; padding:8px 10px;
  background:rgba(167,139,250,0.07); border:1px solid rgba(167,139,250,0.2);
  border-radius:4px; font-size:10px; color:var(--violet); line-height:1.5;
}
#physlab-root .pl-question::before { content:"? "; font-weight:700; }

#physlab-root .pl-sb-status {
  padding:9px 13px; border-top:1px solid var(--border2);
  font-size:10px; color:var(--text3);
}
#physlab-root .pl-status-row { display:flex; justify-content:space-between; margin-bottom:3px; }
#physlab-root .pl-status-val { color:var(--phosphor); font-weight:500; }

/* Main */
#physlab-root .pl-main { display:flex; flex-direction:column; flex:1; overflow:hidden; background:var(--bg); }

/* Panel tabs */
#physlab-root .pl-panel-tabs {
  display:flex; background:var(--surface);
  border-bottom:1px solid var(--border); padding:0 16px; flex-shrink:0;
}
#physlab-root .pl-ptab {
  font-size:11px; font-weight:500; letter-spacing:.08em; text-transform:uppercase;
  padding:10px 14px; cursor:pointer; color:var(--text3);
  border-bottom:2px solid transparent; transition:all .14s;
  user-select:none; border:none; background:transparent; border-bottom:2px solid transparent;
}
#physlab-root .pl-ptab:hover { color:var(--text); }
#physlab-root .pl-ptab.active { color:var(--amber); border-bottom:2px solid var(--amber); }

/* Panels */
#physlab-root .pl-panels { flex:1; overflow:hidden; position:relative; }
#physlab-root .pl-panel { position:absolute; inset:0; overflow-y:auto; display:none; }
#physlab-root .pl-panel.active { display:block; }

/* Theory */
#physlab-root .pl-theory-wrap { padding:24px 28px 36px; }
#physlab-root .pl-theory-block { max-width:740px; margin:0 auto; }
#physlab-root .pl-theory-h1 {
  font-family:var(--serif); font-size:21px; font-weight:600;
  color:var(--text-bright); margin-bottom:5px; letter-spacing:-.01em;
}
#physlab-root .pl-theory-sub {
  font-size:10px; color:var(--text3); letter-spacing:.08em; text-transform:uppercase;
  margin-bottom:20px; padding-bottom:14px; border-bottom:1px solid var(--border);
}
#physlab-root .pl-theory-section { margin-bottom:28px; }
#physlab-root .pl-theory-h2 {
  font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
  color:var(--amber); margin-bottom:10px;
}
#physlab-root .pl-theory-p {
  font-family:var(--sans); font-size:14px; color:var(--text2);
  line-height:1.8; margin-bottom:10px;
}
#physlab-root .pl-theory-p em { color:var(--text); font-style:italic; }
#physlab-root .pl-theory-p strong { color:var(--text-bright); font-weight:500; }

#physlab-root .pl-eq {
  background:var(--surface2); border:1px solid var(--border);
  border-left:3px solid var(--amber); border-radius:0 4px 4px 0;
  padding:12px 16px; margin:14px 0;
}
#physlab-root .pl-eq-tag {
  font-size:9px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--text3); margin-bottom:7px;
}
#physlab-root .pl-eq-formula {
  font-size:17px; font-weight:500; color:var(--text-bright);
  letter-spacing:.04em; margin-bottom:8px;
}
#physlab-root .pl-eq-vars { display:flex; flex-wrap:wrap; gap:5px; margin-top:7px; }
#physlab-root .pl-eq-var {
  font-size:11px; padding:3px 8px; background:var(--surface3);
  border:1px solid var(--border); border-radius:3px; color:var(--text2);
}
#physlab-root .pl-eq-var b { color:var(--phosphor); }

#physlab-root .pl-live {
  background:var(--surface3); border:1px solid var(--border);
  border-radius:4px; padding:12px 14px; margin:12px 0;
  display:flex; flex-wrap:wrap; gap:14px; align-items:center;
}
#physlab-root .pl-live-label {
  font-size:9px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--text3); width:100%; margin-bottom:-6px;
}
#physlab-root .pl-live-ctl { display:flex; align-items:center; gap:7px; }
#physlab-root .pl-live-ctl span { font-size:11px; color:var(--text2); white-space:nowrap; }
#physlab-root .pl-live-ctl input[type=range] { width:80px; accent-color:var(--phosphor); cursor:pointer; }
#physlab-root .pl-live-ctl .pv { color:var(--phosphor); font-weight:500; min-width:50px; }
#physlab-root .pl-live-result {
  font-size:14px; font-weight:500; color:var(--amber);
  padding:5px 12px; background:var(--amber-d);
  border:1px solid rgba(245,166,35,.2); border-radius:3px; white-space:nowrap;
}
#physlab-root .pl-live-worked {
  font-size:11px; color:var(--text2); padding:7px 10px;
  background:var(--surface2); border:1px solid var(--border);
  border-radius:3px; margin-top:6px; width:100%;
}
#physlab-root .pl-hl { color:var(--amber); }

#physlab-root .pl-insight {
  background:rgba(0,229,160,0.05); border:1px solid rgba(0,229,160,0.2);
  border-radius:4px; padding:11px 13px; margin:12px 0;
  font-family:var(--sans); font-size:13px; color:var(--text2); line-height:1.7;
}
#physlab-root .pl-insight-head {
  font-size:9px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
  color:var(--phosphor); margin-bottom:4px; font-family:var(--mono);
}
#physlab-root .pl-hypothesis {
  background:rgba(167,139,250,0.06); border:1px solid rgba(167,139,250,0.2);
  border-radius:4px; padding:11px 13px; margin:12px 0;
  font-family:var(--sans); font-size:13px; color:var(--violet); line-height:1.7;
}
#physlab-root .pl-hypothesis-head {
  font-size:9px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
  color:var(--violet); margin-bottom:4px; font-family:var(--mono);
}

/* Apparatus */
#physlab-root .pl-apparatus { display:flex; flex-direction:column; height:100%; }
#physlab-root .pl-canvas-wrap { flex:1; position:relative; overflow:hidden; min-height:0; }
#physlab-root .pl-canvas-wrap canvas { position:absolute; inset:0; display:block; }
#physlab-root .pl-controls {
  flex-shrink:0; display:flex; align-items:center; gap:0;
  background:var(--surface); border-top:1px solid var(--border);
  height:var(--controls-h); overflow-x:auto; padding:0 14px;
}
#physlab-root .pl-controls::-webkit-scrollbar { height:0; }
#physlab-root .pl-ctrl-group {
  display:flex; align-items:center; gap:7px; padding:0 14px;
  border-right:1px solid var(--border2); height:100%; flex-shrink:0;
}
#physlab-root .pl-ctrl-group:last-child { border-right:none; }
#physlab-root .pl-ctrl-label {
  font-size:10px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--text3); white-space:nowrap;
}
#physlab-root .pl-ctrl-val {
  font-size:12px; font-weight:500; color:var(--phosphor);
  min-width:46px; text-align:right; white-space:nowrap;
}
#physlab-root .pl-ctrl-group input[type=range] {
  appearance:none; width:88px; height:3px;
  background:var(--border); border-radius:2px; outline:none; cursor:pointer;
}
#physlab-root .pl-ctrl-group input[type=range]::-webkit-slider-thumb {
  appearance:none; width:12px; height:12px;
  border-radius:50%; background:var(--phosphor); cursor:pointer;
}
#physlab-root .pl-rec-btn {
  font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
  padding:6px 13px; border-radius:3px; border:1px solid var(--blue);
  background:var(--blue-d); color:var(--blue); cursor:pointer;
  transition:all .13s; white-space:nowrap; flex-shrink:0;
}
#physlab-root .pl-rec-btn:hover { background:var(--blue); color:var(--bg); }

/* Data */
#physlab-root .pl-data-wrap { padding:22px 26px; }
#physlab-root .pl-data-header {
  display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:14px;
}
#physlab-root .pl-panel-title { font-size:14px; font-weight:600; color:var(--text-bright); }
#physlab-root .pl-panel-sub {
  font-size:10px; color:var(--text3); letter-spacing:.08em;
  text-transform:uppercase; margin-top:2px;
}
#physlab-root .pl-data-actions { display:flex; gap:7px; }
#physlab-root .pl-dbtn {
  font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
  padding:5px 11px; border-radius:3px; border:1px solid var(--border);
  background:transparent; color:var(--text2); cursor:pointer; transition:all .13s;
}
#physlab-root .pl-dbtn:hover { border-color:var(--text2); color:var(--text); }
#physlab-root .pl-dbtn.danger:hover { border-color:var(--red); color:var(--red); }
#physlab-root .pl-tbl-wrap { overflow-x:auto; margin-bottom:14px; }
#physlab-root .pl-tbl { width:100%; border-collapse:collapse; font-size:12px; }
#physlab-root .pl-tbl thead tr { background:var(--surface2); border-bottom:1px solid var(--border); }
#physlab-root .pl-tbl th {
  padding:7px 12px; text-align:left; font-size:10px; font-weight:600;
  letter-spacing:.1em; text-transform:uppercase; color:var(--text3); white-space:nowrap;
}
#physlab-root .pl-tbl td {
  padding:7px 12px; border-bottom:1px solid var(--border2); color:var(--text2);
}
#physlab-root .pl-tbl tr:hover td { background:var(--surface2); }
#physlab-root .pl-tbl td.cm { color:var(--blue); }
#physlab-root .pl-tbl td.cd { color:var(--amber); }
#physlab-root .pl-tbl td.ci { color:var(--text3); }
#physlab-root .pl-data-note {
  font-size:11px; color:var(--text3); padding:9px 12px;
  background:var(--surface2); border:1px solid var(--border2); border-radius:4px;
}

/* Analysis */
#physlab-root .pl-analysis-wrap { padding:22px 26px; }
#physlab-root .pl-analysis-layout {
  display:grid; grid-template-columns:1fr 300px; gap:18px; max-width:1060px;
}
#physlab-root .pl-plot-outer {
  background:var(--surface2); border:1px solid var(--border);
  border-radius:4px; overflow:hidden; aspect-ratio:4/3; position:relative;
}
#physlab-root .pl-plot-outer canvas { width:100%; height:100%; display:block; }
#physlab-root .pl-analysis-right { display:flex; flex-direction:column; gap:12px; }
#physlab-root .pl-result-card {
  background:var(--surface2); border:1px solid var(--border);
  border-radius:4px; padding:13px 15px;
}
#physlab-root .pl-result-title {
  font-size:9px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--text3); margin-bottom:9px;
}
#physlab-root .pl-result-row {
  display:flex; justify-content:space-between; align-items:baseline;
  padding:4px 0; border-bottom:1px solid var(--border2); font-size:12px;
}
#physlab-root .pl-result-row:last-child { border-bottom:none; }
#physlab-root .pl-rk { color:var(--text2); }
#physlab-root .pl-rv { color:var(--phosphor); font-weight:500; }
#physlab-root .pl-rv.theory { color:var(--amber); }
#physlab-root .pl-rv.good { color:var(--phosphor); }
#physlab-root .pl-rv.warn { color:var(--red); }
#physlab-root .pl-analysis-insight {
  background:rgba(0,229,160,0.04); border:1px solid rgba(0,229,160,0.15);
  border-radius:4px; padding:11px 13px;
  font-family:var(--sans); font-size:12px; color:var(--text2); line-height:1.7;
}
#physlab-root .pl-analysis-insight strong { color:var(--phosphor); }
#physlab-root .pl-plot-btn {
  font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
  padding:8px 16px; border-radius:3px; border:1px solid var(--phosphor);
  background:var(--phosphor-d); color:var(--phosphor); cursor:pointer;
  transition:all .13s; width:auto;
}
#physlab-root .pl-plot-btn:hover { background:var(--phosphor); color:var(--bg); }

/* Guide panel */
#physlab-root .pl-guide { max-width:700px; margin:0 auto; }
#physlab-root .pl-guide-title {
  font-family:var(--serif); font-size:20px; font-weight:600;
  color:var(--text-bright); margin-bottom:10px; letter-spacing:-.01em;
}
#physlab-root .pl-guide-intro {
  font-size:14px; color:var(--text2); line-height:1.7; margin-bottom:22px;
  padding-bottom:16px; border-bottom:1px solid var(--border);
}
#physlab-root .pl-guide-steps { margin-bottom:20px; }
#physlab-root .pl-gs {
  display:flex; gap:14px; align-items:flex-start;
  padding:10px 0; border-bottom:1px solid var(--border2);
}
#physlab-root .pl-gs:last-child { border-bottom:none; }
#physlab-root .pl-gsn {
  flex-shrink:0; width:24px; height:24px; border-radius:50%;
  background:var(--phosphor-d); border:1px solid var(--phosphor2);
  display:flex; align-items:center; justify-content:center;
  font-size:11px; font-weight:700; color:var(--phosphor); margin-top:1px;
}
#physlab-root .pl-gs div { font-size:13px; color:var(--text2); line-height:1.6; }
#physlab-root .pl-gs div strong { color:var(--text-bright); }
#physlab-root .pl-gs div em { color:var(--amber); font-style:normal; }
#physlab-root .pl-guide-callout {
  border-radius:4px; padding:11px 14px; margin:10px 0;
  font-size:12px; line-height:1.65; color:var(--text2);
}
#physlab-root .pl-guide-callout.tip {
  background:rgba(0,229,160,0.05); border:1px solid rgba(0,229,160,0.2);
}
#physlab-root .pl-guide-callout.warn {
  background:rgba(245,166,35,0.06); border:1px solid rgba(245,166,35,0.25);
  color:var(--amber);
}
#physlab-root .pl-gc-head {
  font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
  margin-bottom:4px; font-family:var(--mono);
}
#physlab-root .pl-guide-callout.tip .pl-gc-head { color:var(--phosphor); }
#physlab-root .pl-guide-callout.warn .pl-gc-head { color:var(--amber); }
`;

// ─────────────────────────────────────────────────────────────────
//  CANVAS DRAW HELPERS
// ─────────────────────────────────────────────────────────────────
function drawGrid(ctx, W, H) {
  ctx.strokeStyle = "rgba(0,229,160,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
}

function drawDRO(ctx, W, rows) {
  const rowH = 20, pad = 14, boxW = 186, boxH = 14 + rows.length * rowH;
  ctx.fillStyle = "rgba(11,14,18,0.88)";
  ctx.fillRect(W - boxW - 4, 10, boxW, boxH);
  rows.forEach(([k, v], i) => {
    ctx.font = "11px 'JetBrains Mono',monospace";
    ctx.fillStyle = "#4a5a72"; ctx.textAlign = "left";
    ctx.fillText(k, W - boxW + pad - 4, 26 + i * rowH);
    ctx.fillStyle = "#00e5a0"; ctx.textAlign = "right";
    ctx.fillText(v, W - 12, 26 + i * rowH);
  });
  ctx.textAlign = "left";
}

function arrowHead(ctx, x1, y1, x2, y2, color, size = 11) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(a - 0.4), y2 - size * Math.sin(a - 0.4));
  ctx.lineTo(x2 - size * Math.cos(a + 0.4), y2 - size * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
}

// ─────────────────────────────────────────────────────────────────
//  LAB DEFINITIONS
//  Each lab is a self-contained object — add new labs here only.
// ─────────────────────────────────────────────────────────────────
const LABS = [

  // ══ 1. FREE FALL ══════════════════════════════════════════════
  {
    id: "freefall", name: "Free Fall", category: "Mechanics",
    subtitle: "Measuring g from Distance–Time Data",
    objective: "Drop an object from various heights. Plot d vs t². Slope = g/2. Extract g.",
    steps: [
      { title: "Read theory", desc: "Understand d = ½gt². See why plotting d vs t² gives a straight line.",
        question: "If you double the drop height, how much longer does it take to fall? (Hint: solve for t)" },
      { title: "Set height", desc: "Use the h slider to set drop height (0.2–3.0 m).",
        question: "Before recording: predict the fall time using t = √(2h/g) with g ≈ 9.81 m/s²." },
      { title: "Drop and record", desc: "Click Record to capture (h, t) with realistic timing noise.",
        question: "Why does a real stopwatch give slightly different times each trial?" },
      { title: "Vary height", desc: "Record 8–10 heights spread across the full range.",
        question: "What pattern do you notice in the t² column as h increases?" },
      { title: "Plot d vs t²", desc: "Analysis tab → Plot & Fit. The slope should equal g/2.",
        question: "Why do we plot d vs t² and not d vs t?" },
      { title: "Extract g", desc: "g = 2 × slope. Compare to 9.810 m/s². Calculate % error.",
        question: "What sources of error are present? Would air resistance matter for a steel ball?" },
    ],
    theory: () => `<div class="pl-theory-block">
  <div class="pl-theory-h1">Free Fall & Kinematics</div>
  <div class="pl-theory-sub">Mechanics · Kinematics · Gravitational Acceleration</div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Background</div>
    <p class="pl-theory-p">Galileo (1589) showed that all objects fall with the same acceleration regardless of mass — a revolutionary result that contradicted 2,000 years of Aristotelian physics. He reportedly dropped cannonballs from the Leaning Tower of Pisa to demonstrate this.</p>
    <p class="pl-theory-p">In free fall (no air resistance), an object released from rest accelerates uniformly downward at g ≈ 9.81 m/s². This is a <em>kinematic</em> problem: we know the acceleration and want to relate distance and time.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Derivation</div>
    <p class="pl-theory-p">Starting from Newton's second law with constant acceleration a = g (downward):</p>
    <div class="pl-eq">
      <div class="pl-eq-tag">Kinematic equation (v₀ = 0, starts from rest)</div>
      <div class="pl-eq-formula">d = ½ g t²</div>
      <div class="pl-eq-vars">
        <span class="pl-eq-var"><b>d</b> distance fallen (m)</span>
        <span class="pl-eq-var"><b>g</b> gravitational acceleration (m/s²)</span>
        <span class="pl-eq-var"><b>t</b> fall time (s)</span>
      </div>
    </div>
    <p class="pl-theory-p">This is <em>not</em> linear in t. But if we substitute u = t²:</p>
    <div class="pl-eq">
      <div class="pl-eq-tag">Linearized — the key to our experiment</div>
      <div class="pl-eq-formula">d = (g/2) · t² &nbsp;→&nbsp; slope of d vs t² = g/2</div>
    </div>
    <p class="pl-theory-p">A plot of d (y-axis) against t² (x-axis) is a straight line through the origin. The slope equals g/2, so g = 2 × slope. This is how we extract g from the experiment.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Live Calculator</div>
    <div class="pl-live">
      <div class="pl-live-label">Predict the fall time for any height</div>
      <div class="pl-live-ctl">
        <span>h =</span>
        <input type="range" min="0.1" max="5" step="0.05" value="1" oninput="PLLIVE.freefall()" id="ffL-h">
        <span class="pv" id="ffL-hv">1.00 m</span>
      </div>
      <div class="pl-live-result">t = <span id="ffL-t">0.452 s</span></div>
      <div class="pl-live-worked" id="ffL-w">t = √(2×1.00/9.81) = 0.452 s · v_impact = g·t = 4.43 m/s</div>
    </div>
    <p class="pl-theory-p" style="font-size:12px;color:var(--text3)">Notice: quadrupling the height only doubles the time (square root relationship). A 4 m drop takes only twice as long as a 1 m drop.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Key Insights</div>
    <div class="pl-insight"><div class="pl-insight-head">Universality of free fall</div>
    In vacuum, a feather and a hammer fall identically. On the Moon (no atmosphere), Apollo 15 astronaut David Scott famously demonstrated this in 1971. On Earth, air resistance is negligible for dense, compact objects over short falls.</div>
    <div class="pl-insight"><div class="pl-insight-head">g varies with location</div>
    g = 9.832 m/s² at the poles, 9.780 m/s² at the equator. At the top of Everest: 9.764 m/s². The variation is due to Earth's shape (oblate spheroid) and rotation.</div>
    <div class="pl-hypothesis"><div class="pl-hypothesis-head">Your hypothesis</div>
    Before running the experiment: write down your prediction for g and your main source of expected error. After, compare to your measurement. This is the scientific method.</div>
  </div>
</div>`,
    initState: () => ({ h: 1.0, falling: false, tDrop: 0, pauseTimer: 0 }),
    drawApparatus: (ctx, W, H, state, running, dt) => {
      ctx.fillStyle = "#0b0e12"; ctx.fillRect(0, 0, W, H);
      drawGrid(ctx, W, H);

      const scale = Math.min(H * 0.75, W * 0.35);
      const groundY = H - 60, floorX = W * 0.45;
      const maxH = 3.0;
      const hPx = (h) => groundY - (h / maxH) * scale;
      const startY = hPx(state.h);

      // Ground platform
      ctx.fillStyle = "#252e42"; ctx.fillRect(floorX - 40, groundY, 80, 8);
      ctx.strokeStyle = "#4a5a72"; ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(floorX - 40 + i * 10, groundY);
        ctx.lineTo(floorX - 50 + i * 10, groundY + 8); ctx.stroke();
      }

      // Height ruler
      const rulerX = floorX + 30;
      ctx.strokeStyle = "#4a5a72"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(rulerX, groundY); ctx.lineTo(rulerX, hPx(maxH)); ctx.stroke();
      for (let hh = 0; hh <= maxH; hh += 0.5) {
        const y = hPx(hh); const tickW = hh % 1 === 0 ? 12 : 6;
        ctx.beginPath(); ctx.moveTo(rulerX, y); ctx.lineTo(rulerX + tickW, y); ctx.stroke();
        if (hh % 1 === 0) {
          ctx.fillStyle = "#4a5a72"; ctx.font = "10px JetBrains Mono,monospace";
          ctx.fillText(hh.toFixed(0) + "m", rulerX + 15, y + 3);
        }
      }

      // Drop height bracket
      ctx.strokeStyle = "rgba(245,166,35,0.5)"; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(floorX - 20, startY); ctx.lineTo(floorX - 20, groundY); ctx.stroke();
      ctx.setLineDash([]);
      arrowHead(ctx, floorX - 20, startY + 10, floorX - 20, startY, "#f5a623");
      arrowHead(ctx, floorX - 20, groundY - 10, floorX - 20, groundY, "#f5a623");
      ctx.fillStyle = "#f5a623"; ctx.font = "11px JetBrains Mono,monospace"; ctx.textAlign = "right";
      ctx.fillText("h = " + state.h.toFixed(2) + "m", floorX - 25, (startY + groundY) / 2 + 4);
      ctx.textAlign = "left";

      // Animate ball — fall, pause 0.8 s at ground, repeat
      let ballY;
      if (running && state.falling) {
        state.tDrop = (state.tDrop || 0) + dt;
        const d = 0.5 * 9.81 * state.tDrop * state.tDrop;
        if (d >= state.h) {
          state.falling = false;
          state.tDrop = Math.sqrt(2 * state.h / 9.81);
          state.pauseTimer = 0.8;
          ballY = groundY;
        } else {
          ballY = startY + (d / state.h) * (groundY - startY);
        }
      } else if (running && !state.falling) {
        state.pauseTimer = (state.pauseTimer || 0) - dt;
        if (state.pauseTimer <= 0) {
          state.falling = true;
          state.tDrop = 0;
        }
        ballY = groundY;
      } else {
        state.falling = false;
        state.tDrop = 0;
        state.pauseTimer = 0;
        ballY = startY;
      }

      // Ball
      ctx.beginPath(); ctx.arc(floorX, ballY, 12, 0, Math.PI * 2);
      const g2 = ctx.createRadialGradient(floorX - 4, ballY - 4, 1, floorX, ballY, 12);
      g2.addColorStop(0, "#c0d8f0"); g2.addColorStop(1, "#1a3050");
      ctx.fillStyle = g2; ctx.fill();
      ctx.strokeStyle = "#4da6ff"; ctx.lineWidth = 1.5; ctx.stroke();

      // Velocity vector when falling
      if (state.falling && state.tDrop > 0) {
        const v = 9.81 * state.tDrop;
        const arrLen = Math.min(v * 6, 80);
        ctx.strokeStyle = "#e05050"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(floorX + 18, ballY); ctx.lineTo(floorX + 18, ballY + arrLen); ctx.stroke();
        arrowHead(ctx, floorX + 18, ballY, floorX + 18, ballY + arrLen, "#e05050");
        ctx.fillStyle = "#e05050"; ctx.font = "10px JetBrains Mono,monospace";
        ctx.fillText("v=" + v.toFixed(2) + "m/s", floorX + 22, ballY + arrLen / 2 + 4);
      }

      // Gravity arrow
      ctx.strokeStyle = "rgba(0,229,160,0.4)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(W * 0.12, H * 0.15); ctx.lineTo(W * 0.12, H * 0.15 + 50); ctx.stroke();
      arrowHead(ctx, W * 0.12, H * 0.15, W * 0.12, H * 0.15 + 50, "#00e5a0");
      ctx.fillStyle = "#00e5a0"; ctx.font = "10px JetBrains Mono,monospace";
      ctx.fillText("g = 9.81 m/s²", W * 0.12 + 8, H * 0.15 + 26);

      const t_theory = Math.sqrt(2 * state.h / 9.81);
      drawDRO(ctx, W, [
        ["h (m)",     state.h.toFixed(3)],
        ["t (s)",     t_theory.toFixed(4)],
        ["t² (s²)",   (t_theory * t_theory).toFixed(4)],
        ["v_impact",  (9.81 * t_theory).toFixed(3) + " m/s"],
        ["KE at hit", (0.5 * 9.81 * t_theory * t_theory * 9.81 / 2).toFixed(3) + " J/kg"],
      ]);
    },
    controls: () => [
      { id: "ff-h", label: "Drop Height h (m)", min: 0.2, max: 3.0, step: 0.05, init: 1.0, stateKey: "h", fmt: (v) => v.toFixed(2) },
    ],
    recordPoint: (state) => {
      const t_true = Math.sqrt(2 * state.h / 9.81);
      const noise = 1 + (Math.random() - 0.5) * 0.018;
      const t_meas = t_true * noise;
      const t2 = t_meas * t_meas;
      const g_point = 2 * state.h / t2;
      return [state.h.toFixed(3), t_meas.toFixed(4), t2.toFixed(4), g_point.toFixed(4)];
    },
    dataSchema: {
      cols: ["#", "h (m)", "t (s)", "t² (s²)", "g_point (m/s²)"],
      types: ["index", "measured", "measured", "derived", "derived"],
    },
    analyzeSetup: { xi: 3, yi: 1, xLabel: "t² (s²)", yLabel: "h (m)", title: "h vs t² — Free Fall" },
    analysisInsight: (slope, intercept, r2) => {
      const g_exp = 2 * slope;
      const err = Math.abs((g_exp - 9.81) / 9.81 * 100);
      return `<strong>g = 2 × slope = ${g_exp.toFixed(4)} m/s²</strong> — theory: 9.8100 m/s², error: ${err.toFixed(2)}%. h = (g/2)·t² so slope = g/2. R² = ${r2.toFixed(5)} confirms the parabolic free-fall law.`;
    },
    theoryResult: (slope) => ({
      label: "g (measured)", value: (2 * slope).toFixed(4),
      unit: "m/s²", theory: "9.8100",
      pctError: Math.abs((2 * slope - 9.81) / 9.81 * 100).toFixed(2),
    }),
  },

  // ══ 2. AIR TRACK — INCLINED PLANE ════════════════════════════
  {
    id: "airtrack", name: "Air Track", category: "Mechanics",
    subtitle: "Frictionless Inclined Plane & g",
    objective: "Vary track angle θ. Measure cart acceleration a. Plot a vs sin θ. Slope = g.",
    steps: [
      { title: "Read theory", desc: "Study a = g sin θ. Understand why friction is eliminated by the air cushion.",
        question: "What happens to the required force when θ → 90°? What familiar experiment is this?" },
      { title: "Level the track", desc: "Start at θ = 2°. Observe the slow acceleration.",
        question: "At θ = 0°, what is the predicted acceleration? Test this." },
      { title: "Record at one angle", desc: "Click Record to capture (θ, a) from the simulation.",
        question: "If you double the cart mass, what happens to acceleration? Why?" },
      { title: "Vary angle 2°–60°", desc: "Record 8–10 angles across the range.",
        question: "What is the maximum useful angle before the cart would slide off the end quickly?" },
      { title: "Plot a vs sin θ", desc: "Analysis → Plot & Fit. Slope = g.",
        question: "Why sin θ and not just θ? When is θ ≈ sin θ a reasonable approximation?" },
      { title: "Extract g", desc: "g = slope. Find % error. Note systematic vs random errors.",
        question: "In a real lab, what would cause a vs sin θ to curve rather than be linear?" },
    ],
    theory: () => `<div class="pl-theory-block">
  <div class="pl-theory-h1">Frictionless Inclined Plane</div>
  <div class="pl-theory-sub">Mechanics · Newton's Laws · Component Resolution</div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">The Air Track</div>
    <p class="pl-theory-p">An air track blows a cushion of air through thousands of tiny holes in a flat rail. The cart rides on this air film — friction is essentially zero. This isolates gravity as the only net force along the track direction, making it the ideal apparatus for measuring g.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Force Analysis</div>
    <p class="pl-theory-p">On a frictionless incline at angle θ, Newton's second law along the track gives:</p>
    <div class="pl-eq">
      <div class="pl-eq-tag">Acceleration on frictionless incline</div>
      <div class="pl-eq-formula">a = g · sin θ</div>
      <div class="pl-eq-vars">
        <span class="pl-eq-var"><b>a</b> cart acceleration (m/s²)</span>
        <span class="pl-eq-var"><b>g</b> 9.81 m/s²</span>
        <span class="pl-eq-var"><b>θ</b> angle of incline (°)</span>
      </div>
    </div>
    <p class="pl-theory-p">Note: mass m cancels (m·a = m·g·sinθ). The acceleration is <em>independent of mass</em> — the same principle as free fall, generalised to an incline.</p>
    <p class="pl-theory-p">A plot of a (y-axis) vs sin θ (x-axis) is a straight line through the origin with slope = g.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Live Calculator</div>
    <div class="pl-live">
      <div class="pl-live-label">Compute cart acceleration at any angle</div>
      <div class="pl-live-ctl">
        <span>θ =</span>
        <input type="range" min="1" max="89" step="1" value="30" oninput="PLLIVE.airtrack()" id="atL-t">
        <span class="pv" id="atL-tv">30°</span>
      </div>
      <div class="pl-live-result">a = <span id="atL-a">4.905 m/s²</span></div>
      <div class="pl-live-worked" id="atL-w">a = 9.81 × sin(30°) = 9.81 × 0.500 = 4.905 m/s²</div>
    </div>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Key Insights</div>
    <div class="pl-insight"><div class="pl-insight-head">The incline as an "attenuator"</div>
    The incline reduces the effective gravitational force by a factor of sinθ. At θ = 5°, the cart only experiences sinθ ≈ 0.087 of g — an acceleration of 0.85 m/s². This slows motion enough to measure precisely with simple timing equipment.</div>
    <div class="pl-insight"><div class="pl-insight-head">Connection to free fall</div>
    At θ = 90°, sinθ = 1 and a = g — vertical free fall. The inclined plane experiment is essentially a "diluted free fall." Galileo used inclined planes for this exact reason: to slow the motion enough to time it with a water clock.</div>
    <div class="pl-hypothesis"><div class="pl-hypothesis-head">Before you start</div>
    Predict the angle at which the cart will accelerate at exactly 5.00 m/s². Then verify in the simulation.</div>
  </div>
</div>`,
    initState: () => ({ angle: 20, cartPos: 0.72, cartV: 0, pauseTimer: 0 }),
    drawApparatus: (ctx, W, H, state, running, dt) => {
      ctx.fillStyle = "#0b0e12"; ctx.fillRect(0, 0, W, H);
      drawGrid(ctx, W, H);

      const angleRad = state.angle * Math.PI / 180;
      const a = 9.81 * Math.sin(angleRad) * (1 + (Math.random() - 0.5) * 0.001);

      // Track geometry
      const pivX = W * 0.12, pivY = H * 0.78;
      const trackLen = W * 0.7;
      const endX = pivX + trackLen * Math.cos(angleRad);
      const endY = pivY - trackLen * Math.sin(angleRad);

      // Track surface
      ctx.strokeStyle = "#4da6ff"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(pivX, pivY); ctx.lineTo(endX, endY); ctx.stroke();
      ctx.strokeStyle = "#252e42"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pivX, pivY); ctx.lineTo(endX, endY + 6); ctx.stroke();

      // Angle arc
      ctx.beginPath();
      ctx.arc(pivX, pivY, 50, -angleRad, 0);
      ctx.strokeStyle = "rgba(245,166,35,0.5)"; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.fillStyle = "#f5a623"; ctx.font = "11px JetBrains Mono,monospace";
      ctx.fillText("θ = " + state.angle + "°", pivX + 54, pivY - 14);

      // Ground
      ctx.strokeStyle = "#252e42"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pivX - 20, pivY); ctx.lineTo(pivX + 80, pivY); ctx.stroke();
      ctx.fillStyle = "#252e42";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(pivX - 20 + i * 14, pivY);
        ctx.lineTo(pivX - 30 + i * 14, pivY + 10);
        ctx.stroke();
      }

      // Animate cart — slides downhill from top (cp≈0.72) to bottom (cp≈0)
      if (running) {
        if ((state.pauseTimer || 0) > 0) {
          state.pauseTimer -= dt;
        } else {
          state.cartV = (state.cartV || 0) - a * dt;   // accelerate downhill (decreasing cp)
          state.cartPos = (state.cartPos ?? 0.72) + state.cartV * dt;
          if (state.cartPos < 0.02) {                  // reached bottom — reset to top
            state.cartPos = 0.72; state.cartV = 0; state.pauseTimer = 0.6;
          }
        }
      }

      const cp = Math.min(Math.max(state.cartPos ?? 0.72, 0), 0.75);
      const cartX = pivX + cp * trackLen * Math.cos(angleRad) + 12;
      const cartY = pivY - cp * trackLen * Math.sin(angleRad);

      // Cart body
      ctx.save();
      ctx.translate(cartX, cartY);
      ctx.rotate(-angleRad);
      ctx.fillStyle = "#1c2435";
      ctx.fillRect(-20, -10, 40, 14);
      ctx.strokeStyle = "#4da6ff"; ctx.lineWidth = 1.5;
      ctx.strokeRect(-20, -10, 40, 14);
      // Wheels
      [-14, 10].forEach(wx => {
        ctx.beginPath(); ctx.arc(wx, 4, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#252e42"; ctx.fill();
        ctx.strokeStyle = "#4a5a72"; ctx.lineWidth = 1; ctx.stroke();
      });
      // Air holes indicator
      for (let hx = -14; hx <= 14; hx += 7) {
        ctx.beginPath(); ctx.arc(hx, -4, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "#00e5a0"; ctx.fill();
      }
      ctx.restore();

      // Acceleration arrow on cart
      const accLen = Math.min(a * 12, 70);
      const arrX1 = cartX, arrY1 = cartY - 20;
      const arrX2 = arrX1 - accLen * Math.cos(angleRad), arrY2 = arrY1 + accLen * Math.sin(angleRad);
      ctx.strokeStyle = "#e05050"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(arrX1, arrY1); ctx.lineTo(arrX2, arrY2); ctx.stroke();
      arrowHead(ctx, arrX1, arrY1, arrX2, arrY2, "#e05050");
      ctx.fillStyle = "#e05050"; ctx.font = "10px JetBrains Mono,monospace";
      ctx.fillText("a", arrX2 + 4, arrY2 + 4);

      // Component labels
      const gCompX = endX + 20, gCompY = endY - 30;
      ctx.fillStyle = "#4a5a72"; ctx.font = "10px JetBrains Mono,monospace";
      ctx.fillText("mg·sinθ (along track)", gCompX - 60, gCompY - 20);
      ctx.fillText("mg·cosθ (⊥ track)", gCompX - 60, gCompY - 6);

      drawDRO(ctx, W, [
        ["angle (°)",  state.angle.toFixed(1)],
        ["sin θ",      Math.sin(angleRad).toFixed(5)],
        ["a (m/s²)",   (9.81 * Math.sin(angleRad)).toFixed(4)],
        ["v (m/s)",    ((state.cartV || 0)).toFixed(3)],
        ["pos (m)",    ((state.cartPos || 0) * 2).toFixed(3)],
      ]);
    },
    controls: () => [
      { id: "at-a", label: "Angle θ (°)", min: 1, max: 60, step: 1, init: 20, stateKey: "angle", fmt: (v) => v.toFixed(0) },
    ],
    recordPoint: (state) => {
      const angleRad = state.angle * Math.PI / 180;
      const a_true = 9.81 * Math.sin(angleRad);
      const noise = 1 + (Math.random() - 0.5) * 0.015;
      const a_meas = a_true * noise;
      const sinTheta = Math.sin(angleRad);
      return [state.angle.toFixed(1), sinTheta.toFixed(5), a_meas.toFixed(4)];
    },
    dataSchema: {
      cols: ["#", "θ (°)", "sin θ", "a (m/s²)"],
      types: ["index", "measured", "derived", "measured"],
    },
    analyzeSetup: { xi: 2, yi: 3, xLabel: "sin θ", yLabel: "a (m/s²)", title: "a vs sin θ — Air Track" },
    analysisInsight: (slope, intercept, r2) => {
      const err = Math.abs((slope - 9.81) / 9.81 * 100);
      return `<strong>g = slope = ${slope.toFixed(4)} m/s²</strong> — theory: 9.8100 m/s², error: ${err.toFixed(2)}%. Since a = g·sinθ, the slope of a vs sinθ is g directly. R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope) => ({
      label: "g (measured)", value: slope.toFixed(4),
      unit: "m/s²", theory: "9.8100",
      pctError: Math.abs((slope - 9.81) / 9.81 * 100).toFixed(2),
    }),
  },

  // ══ 3. HOOKE'S LAW ════════════════════════════════════════════
  {
    id: "hooke", name: "Hooke's Law", category: "Mechanics",
    subtitle: "Spring Constant from F–x Data",
    objective: "Hang masses on a spring. Measure extension x. Plot F vs x. Slope = k.",
    steps: [
      { title: "Read theory", desc: "Understand F = kx and the concept of spring constant.",
        question: "If you need a spring that deflects 1 cm under a 10 N load, what k do you need?" },
      { title: "Zero the spring", desc: "Observe the spring at rest with no load.",
        question: "What does the equilibrium position represent physically?" },
      { title: "Add masses", desc: "Use the mass slider. Record (F, x) for each mass.",
        question: "At what point might a real spring stop obeying F = kx? What is this called?" },
      { title: "Record 8+ points", desc: "Cover the full mass range for a reliable fit.",
        question: "Why should you approach the maximum extension gradually?" },
      { title: "Plot F vs x", desc: "Slope = spring constant k in N/m.",
        question: "What is the elastic potential energy stored at your maximum extension?" },
      { title: "Find k", desc: "Compare measured k to the set value.",
        question: "How does k relate to the spring material and geometry?" },
    ],
    theory: () => `<div class="pl-theory-block">
  <div class="pl-theory-h1">Hooke's Law & Elasticity</div>
  <div class="pl-theory-sub">Mechanics · Elasticity · Simple Harmonic Motion</div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Hooke's Law</div>
    <p class="pl-theory-p">Robert Hooke (1676) discovered that the extension of a spring is proportional to the applied force — provided the elastic limit is not exceeded. This is one of the oldest quantitative laws in mechanics.</p>
    <div class="pl-eq">
      <div class="pl-eq-tag">Hooke's Law</div>
      <div class="pl-eq-formula">F = k · x</div>
      <div class="pl-eq-vars">
        <span class="pl-eq-var"><b>F</b> restoring force (N)</span>
        <span class="pl-eq-var"><b>k</b> spring constant (N/m)</span>
        <span class="pl-eq-var"><b>x</b> extension from equilibrium (m)</span>
      </div>
    </div>
    <p class="pl-theory-p">The spring constant k measures stiffness: a larger k means a stiffer spring. Units of N/m. A car suspension spring has k ≈ 20,000 N/m; a mattress spring ≈ 1,000 N/m; a watch hairspring ≈ 0.001 N/m.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Elastic Potential Energy</div>
    <div class="pl-eq">
      <div class="pl-eq-tag">Elastic PE stored in the spring</div>
      <div class="pl-eq-formula">U = ½ k x²</div>
    </div>
    <p class="pl-theory-p">This energy is released when the spring returns to equilibrium — the basis of all spring-powered mechanisms, from clocks to catapults.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Live Calculator</div>
    <div class="pl-live">
      <div class="pl-live-label">Force and energy for a given spring and extension</div>
      <div class="pl-live-ctl">
        <span>k =</span>
        <input type="range" min="10" max="500" step="10" value="100" oninput="PLLIVE.hooke()" id="hkL-k">
        <span class="pv" id="hkL-kv">100 N/m</span>
      </div>
      <div class="pl-live-ctl">
        <span>x =</span>
        <input type="range" min="0" max="0.5" step="0.01" value="0.1" oninput="PLLIVE.hooke()" id="hkL-x">
        <span class="pv" id="hkL-xv">0.10 m</span>
      </div>
      <div class="pl-live-result">F = <span id="hkL-F">10.0 N</span></div>
      <div class="pl-live-worked" id="hkL-w">F = 100 × 0.10 = 10.0 N · U = ½×100×0.10² = 0.50 J</div>
    </div>
  </div>
  <div class="pl-insight"><div class="pl-insight-head">Connection to SHM</div>
  A mass on a spring oscillates in Simple Harmonic Motion with period T = 2π√(m/k). This is why Hooke's Law and the pendulum are closely related — both are SHM systems, just with different restoring mechanisms.</div>
</div>`,
    initState: () => ({ mass: 0.1, k: 80, naturalLen: 0.15 }),
    drawApparatus: (ctx, W, H, state, running, dt) => {
      ctx.fillStyle = "#0b0e12"; ctx.fillRect(0, 0, W, H);
      drawGrid(ctx, W, H);

      const cx = W / 2;
      const ceilY = 60;
      const F = state.mass * 9.81;
      const x = F / state.k;
      const naturalLen_px = 120;
      const scale = 500; // px per meter
      const x_px = x * scale;

      const springTopY = ceilY + 10;
      const springBotY = springTopY + naturalLen_px + x_px;

      // Ceiling
      ctx.fillStyle = "#252e42"; ctx.fillRect(cx - 50, ceilY - 10, 100, 10);
      ctx.strokeStyle = "#4a5a72"; ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(cx - 50 + i * 13, ceilY - 10);
        ctx.lineTo(cx - 56 + i * 13, ceilY - 18); ctx.stroke();
      }

      // Spring coil
      const coils = 10, totalH = springBotY - springTopY, coilH = totalH / coils;
      const coilW = 18;
      ctx.strokeStyle = "#4da6ff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, springTopY);
      for (let i = 0; i <= coils * 4; i++) {
        const t = i / (coils * 4);
        const fy = springTopY + t * totalH;
        const fx = cx + coilW * Math.sin(i * Math.PI * 0.5);
        ctx.lineTo(fx, fy);
      }
      ctx.stroke();

      // Mass block
      const mw = 50, mh = 30;
      ctx.fillStyle = "#1c2435";
      ctx.fillRect(cx - mw / 2, springBotY, mw, mh);
      ctx.strokeStyle = "#4da6ff"; ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - mw / 2, springBotY, mw, mh);
      ctx.fillStyle = "#8a9ab5"; ctx.font = "10px JetBrains Mono,monospace"; ctx.textAlign = "center";
      ctx.fillText(state.mass.toFixed(2) + "kg", cx, springBotY + mh / 2 + 4);
      ctx.textAlign = "left";

      // Weight arrow
      ctx.strokeStyle = "#e05050"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, springBotY + mh);
      ctx.lineTo(cx, springBotY + mh + 45); ctx.stroke();
      arrowHead(ctx, cx, springBotY + mh, cx, springBotY + mh + 45, "#e05050");
      ctx.fillStyle = "#e05050"; ctx.textAlign = "center";
      ctx.fillText("W=" + F.toFixed(2) + "N", cx + 32, springBotY + mh + 28);

      // Spring force arrow
      ctx.strokeStyle = "#00e5a0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 6, springBotY);
      ctx.lineTo(cx - 6, springBotY - 40); ctx.stroke();
      arrowHead(ctx, cx - 6, springBotY, cx - 6, springBotY - 40, "#00e5a0");
      ctx.fillStyle = "#00e5a0"; ctx.textAlign = "right";
      ctx.fillText("F_spring=kx", cx - 10, springBotY - 18);

      // Extension label
      ctx.strokeStyle = "rgba(245,166,35,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(cx + 45, springTopY + naturalLen_px);
      ctx.lineTo(cx + 45, springBotY); ctx.stroke();
      ctx.setLineDash([]);
      arrowHead(ctx, cx + 45, springTopY + naturalLen_px + 10, cx + 45, springTopY + naturalLen_px, "#f5a623");
      arrowHead(ctx, cx + 45, springBotY - 10, cx + 45, springBotY, "#f5a623");
      ctx.fillStyle = "#f5a623"; ctx.textAlign = "left";
      ctx.fillText("x=" + x.toFixed(3) + "m", cx + 50, (springTopY + naturalLen_px + springBotY) / 2 + 4);

      ctx.textAlign = "left";
      drawDRO(ctx, W, [
        ["mass (kg)",  state.mass.toFixed(3)],
        ["F = mg (N)", F.toFixed(4)],
        ["x (m)",      x.toFixed(4)],
        ["k (N/m)",    state.k.toFixed(1)],
        ["U (J)",      (0.5 * state.k * x * x).toFixed(4)],
      ]);
    },
    controls: () => [
      { id: "hk-m", label: "Mass (kg)", min: 0.02, max: 1.0, step: 0.02, init: 0.1, stateKey: "mass", fmt: (v) => v.toFixed(2) },
      { id: "hk-k", label: "Spring k (N/m)", min: 20, max: 300, step: 10, init: 80, stateKey: "k", fmt: (v) => v.toFixed(0) },
    ],
    recordPoint: (state) => {
      const F = state.mass * 9.81;
      const x_true = F / state.k;
      const x_meas = x_true * (1 + (Math.random() - 0.5) * 0.012);
      return [F.toFixed(4), x_meas.toFixed(4), (F / x_meas).toFixed(2)];
    },
    dataSchema: {
      cols: ["#", "F (N)", "x (m)", "k_point (N/m)"],
      types: ["index", "measured", "measured", "derived"],
    },
    analyzeSetup: { xi: 1, yi: 2, xLabel: "x (m)", yLabel: "F (N)", title: "F vs x — Hooke's Law" },
    analysisInsight: (slope, intercept, r2, state) => {
      const err = Math.abs((slope - state.k) / state.k * 100);
      return `<strong>k = slope = ${slope.toFixed(2)} N/m</strong> — set: ${state.k} N/m, error: ${err.toFixed(2)}%. The y-intercept ${intercept.toFixed(4)} N should be ~0 (spring passes through origin). R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope, state) => ({
      label: "k (measured)", value: slope.toFixed(2),
      unit: "N/m", theory: state.k.toFixed(2),
      pctError: Math.abs((slope - state.k) / state.k * 100).toFixed(2),
    }),
  },

  // ══ 4. SIMPLE PENDULUM ═══════════════════════════════════════
  {
    id: "pendulum", name: "Pendulum", category: "Mechanics",
    subtitle: "Measuring g via Period Analysis",
    objective: "Measure T for varying L. Plot T² vs L. Slope = 4π²/g.",
    steps: [
      { title: "Read theory", desc: "Understand SHM and T = 2π√(L/g).",
        question: "Predict: if you double L, by what factor does T change?" },
      { title: "Set length", desc: "Use the L slider. Keep θ₀ < 15° for small-angle validity.",
        question: "Why is the small-angle approximation sin θ ≈ θ important here?" },
      { title: "Record period", desc: "Record a (L, T) pair. Repeat for 6+ lengths.",
        question: "How many decimal places of precision do you need in T to get g within 1%?" },
      { title: "Vary length", desc: "Cover 0.1 m to 2.0 m for best dynamic range.",
        question: "What is the period of a 1 m pendulum on the Moon (g=1.62 m/s²)?" },
      { title: "Plot T² vs L", desc: "Analysis → Plot & Fit. Slope = 4π²/g.",
        question: "Why T² vs L and not T vs L?" },
      { title: "Extract g", desc: "g = 4π²/slope. Find % error.",
        question: "How would a systematic timing error (e.g., always 0.1s too long) affect the graph?" },
    ],
    theory: () => `<div class="pl-theory-block">
  <div class="pl-theory-h1">The Simple Pendulum</div>
  <div class="pl-theory-sub">Mechanics · Simple Harmonic Motion · Period Analysis</div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Derivation</div>
    <div class="pl-eq">
      <div class="pl-eq-tag">Period equation</div>
      <div class="pl-eq-formula">T = 2π √(L/g)</div>
      <div class="pl-eq-vars">
        <span class="pl-eq-var"><b>T</b> period (s)</span>
        <span class="pl-eq-var"><b>L</b> length (m)</span>
        <span class="pl-eq-var"><b>g</b> 9.81 m/s²</span>
      </div>
    </div>
    <p class="pl-theory-p">Squaring: T² = (4π²/g)·L. A plot of T² vs L is linear with slope 4π²/g, giving g = 4π²/slope.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Live Calculator</div>
    <div class="pl-live">
      <div class="pl-live-label">Adjust L and g to see T</div>
      <div class="pl-live-ctl">
        <span>L =</span>
        <input type="range" min="0.1" max="2" step="0.01" value="1" oninput="PLLIVE.pendulum()" id="pLive-L">
        <span class="pv" id="pLive-Lv">1.00 m</span>
      </div>
      <div class="pl-live-ctl">
        <span>g =</span>
        <input type="range" min="1.62" max="24.8" step="0.01" value="9.81" oninput="PLLIVE.pendulum()" id="pLive-g">
        <span class="pv" id="pLive-gv">9.81 m/s²</span>
      </div>
      <div class="pl-live-result">T = <span id="pLive-T">2.006 s</span></div>
      <div class="pl-live-worked" id="pLive-w">T = 2π √(1.00/9.81) = 2.006 s</div>
    </div>
  </div>
  <div class="pl-insight"><div class="pl-insight-head">Independence of mass</div>
  m cancels in F=ma since restoring force ∝ m too. A 1g and 1kg pendulum of equal length have identical periods — Galileo reportedly verified this by observation.</div>
  <div class="pl-insight"><div class="pl-insight-head">g varies with location</div>
  Poles: g ≈ 9.832 m/s². Equator: g ≈ 9.780 m/s². Top of Everest: 9.764 m/s². Pendulum clocks drift when moved latitudinally.</div>
</div>`,
    initState: () => ({ L: 1.0, theta0: 10, phase: 0 }),
    drawApparatus: (ctx, W, H, state, running, dt) => {
      const g = 9.81, omega = Math.sqrt(g / state.L);
      if (running) state.phase = (state.phase || 0) + dt * omega;
      const theta = (state.theta0 * Math.PI / 180) * Math.cos(state.phase || 0);
      const pivX = W / 2, pivY = H * 0.1;
      const Lpx = state.L * Math.min(W, H) * 0.52;
      const bx = pivX + Lpx * Math.sin(theta), by = pivY + Lpx * Math.cos(theta);

      ctx.fillStyle = "#0b0e12"; ctx.fillRect(0, 0, W, H);
      drawGrid(ctx, W, H);

      ctx.fillStyle = "#252e42"; ctx.fillRect(pivX - 50, pivY - 18, 100, 18);
      ctx.fillStyle = "#4a5a72"; ctx.fillRect(pivX - 3, pivY - 18, 6, 18);

      if (!running) {
        ctx.beginPath();
        ctx.arc(pivX, pivY, 46, -Math.PI / 2, -Math.PI / 2 + state.theta0 * Math.PI / 180);
        ctx.strokeStyle = "rgba(245,166,35,0.5)"; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.fillStyle = "#f5a623"; ctx.font = "11px JetBrains Mono,monospace";
        ctx.fillText("θ₀=" + state.theta0 + "°", pivX + 50, pivY + 14);
      }

      ctx.beginPath(); ctx.moveTo(pivX, pivY); ctx.lineTo(pivX, pivY + Lpx + 28);
      ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);

      ctx.beginPath(); ctx.moveTo(pivX, pivY); ctx.lineTo(bx, by);
      ctx.strokeStyle = "#4a5a72"; ctx.lineWidth = 1.5; ctx.stroke();

      ctx.fillStyle = "#4a5a72"; ctx.font = "11px JetBrains Mono,monospace";
      ctx.fillText("L=" + state.L.toFixed(2) + "m", (pivX + bx) / 2 + 8, (pivY + by) / 2);

      ctx.beginPath(); ctx.arc(pivX, pivY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#8a9ab5"; ctx.fill();

      ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2);
      const gr = ctx.createRadialGradient(bx - 5, by - 5, 1, bx, by, 14);
      gr.addColorStop(0, "#a0c0e0"); gr.addColorStop(1, "#253550");
      ctx.fillStyle = gr; ctx.fill();
      ctx.strokeStyle = "#4da6ff"; ctx.lineWidth = 1.5; ctx.stroke();

      const T = 2 * Math.PI / omega;
      drawDRO(ctx, W, [
        ["L (m)",    state.L.toFixed(4)],
        ["θ₀ (°)",   state.theta0.toFixed(1)],
        ["T (s)",    T.toFixed(4)],
        ["T² (s²)",  (T * T).toFixed(4)],
        ["ω (rad/s)", omega.toFixed(4)],
      ]);
    },
    controls: () => [
      { id: "pd-L", label: "Length L (m)", min: 0.1, max: 2.0, step: 0.01, init: 1.0, stateKey: "L", fmt: (v) => v.toFixed(2) },
      { id: "pd-A", label: "Angle θ₀ (°)", min: 2, max: 14, step: 1, init: 10, stateKey: "theta0", fmt: (v) => v.toFixed(0) },
    ],
    recordPoint: (state) => {
      const T = 2 * Math.PI * Math.sqrt(state.L / 9.81) * (1 + (Math.random() - 0.5) * 0.002);
      return [state.L.toFixed(3), T.toFixed(4), (T * T).toFixed(4), (4 * Math.PI ** 2 * state.L / (T * T)).toFixed(4)];
    },
    dataSchema: {
      cols: ["#", "L (m)", "T (s)", "T² (s²)", "g_point"],
      types: ["index", "measured", "measured", "derived", "derived"],
    },
    analyzeSetup: { xi: 1, yi: 3, xLabel: "L (m)", yLabel: "T² (s²)", title: "T² vs L — Pendulum" },
    analysisInsight: (slope, intercept, r2) => {
      const g_exp = 4 * Math.PI ** 2 / slope;
      const err = Math.abs((g_exp - 9.81) / 9.81 * 100);
      return `<strong>g = 4π²/slope = ${g_exp.toFixed(4)} m/s²</strong> — theory: 9.8100, error: ${err.toFixed(2)}%. R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope) => ({
      label: "g (measured)", value: (4 * Math.PI ** 2 / slope).toFixed(4),
      unit: "m/s²", theory: "9.8100",
      pctError: Math.abs((4 * Math.PI ** 2 / slope - 9.81) / 9.81 * 100).toFixed(2),
    }),
  },

  // ══ 5. SNELL'S LAW ════════════════════════════════════════════
  {
    id: "snell", name: "Snell's Law", category: "Optics",
    subtitle: "Refraction and Refractive Index",
    objective: "Measure θ₂ for multiple θ₁. Plot sin θ₂ vs sin θ₁. Slope = 1/n₂.",
    steps: [
      { title: "Read theory", desc: "Understand n₁sinθ₁ = n₂sinθ₂.",
        question: "Why do all angles in Snell's Law get measured from the normal, not the surface?" },
      { title: "Set medium", desc: "Choose n₂ (glass ≈ 1.5, water ≈ 1.33, diamond ≈ 2.42).",
        question: "Which medium bends light more: glass (1.5) or diamond (2.42)? Why?" },
      { title: "Vary angle", desc: "Change θ₁ from 10° to 70° in steps.",
        question: "Notice how θ₂ increases more slowly than θ₁. What mathematical relationship describes this?" },
      { title: "Record 6+ points", desc: "Stop before total internal reflection.",
        question: "At what θ₁ does TIR occur for your chosen medium?" },
      { title: "Plot sin θ₂ vs sin θ₁", desc: "Linear — slope = 1/n₂.",
        question: "Why does the graph pass through the origin?" },
      { title: "Extract n₂", desc: "n₂ = 1/slope. Compare to set value.",
        question: "How would you use this experiment to identify an unknown transparent material?" },
    ],
    theory: () => `<div class="pl-theory-block">
  <div class="pl-theory-h1">Snell's Law & Refraction</div>
  <div class="pl-theory-sub">Optics · Wave Propagation · Refractive Index</div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Snell's Law</div>
    <div class="pl-eq">
      <div class="pl-eq-tag">Snell's Law</div>
      <div class="pl-eq-formula">n₁ · sin θ₁ = n₂ · sin θ₂</div>
      <div class="pl-eq-vars">
        <span class="pl-eq-var"><b>n₁</b> incident medium index</span>
        <span class="pl-eq-var"><b>n₂</b> refractive medium index</span>
        <span class="pl-eq-var"><b>θ₁</b> angle of incidence</span>
        <span class="pl-eq-var"><b>θ₂</b> angle of refraction</span>
      </div>
    </div>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Live Calculator</div>
    <div class="pl-live">
      <div class="pl-live-label">Adjust angle and medium</div>
      <div class="pl-live-ctl">
        <span>θ₁ =</span>
        <input type="range" min="1" max="85" step="1" value="30" oninput="PLLIVE.snell()" id="sLive-t1">
        <span class="pv" id="sLive-t1v">30°</span>
      </div>
      <div class="pl-live-ctl">
        <span>n₂ =</span>
        <input type="range" min="1.0" max="2.5" step="0.05" value="1.5" oninput="PLLIVE.snell()" id="sLive-n2">
        <span class="pv" id="sLive-n2v">1.50</span>
      </div>
      <div class="pl-live-result">θ₂ = <span id="sLive-t2">19.5°</span></div>
      <div class="pl-live-worked" id="sLive-w">sin(30°)/sin(θ₂) = 1.50</div>
    </div>
  </div>
  <div class="pl-eq">
    <div class="pl-eq-tag">Critical angle (TIR)</div>
    <div class="pl-eq-formula">sin θ_c = n₂ / n₁</div>
  </div>
  <div class="pl-insight"><div class="pl-insight-head">Optical fibres</div>
  TIR traps light inside glass fibres (n≈1.46) surrounded by cladding (n≈1.44). θ_c ≈ 80° — rays within 10° of the axis are totally reflected. Used for internet, medical endoscopes, decorative lighting.</div>
</div>`,
    initState: () => ({ theta1: 30, n2: 1.5 }),
    drawApparatus: (ctx, W, H, state) => {
      const cx = W / 2, cy = H / 2;
      const t1r = state.theta1 * Math.PI / 180;
      const sinT2 = Math.sin(t1r) / state.n2;
      const TIR = sinT2 >= 1;
      const t2r = TIR ? 0 : Math.asin(sinT2);
      const rayLen = Math.min(W, H) * 0.38;

      ctx.fillStyle = "#0b0e12"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(77,166,255,0.03)"; ctx.fillRect(0, 0, W, cy);
      ctx.fillStyle = TIR ? "rgba(224,80,80,0.06)" : "rgba(0,229,160,0.05)"; ctx.fillRect(0, cy, W, H - cy);

      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy);
      ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 1.5; ctx.stroke();

      ctx.font = "11px JetBrains Mono,monospace";
      ctx.fillStyle = "rgba(77,166,255,0.6)"; ctx.fillText("n₁ = 1.00 (air)", 14, cy - 10);
      ctx.fillStyle = TIR ? "rgba(224,80,80,0.7)" : "rgba(0,229,160,0.5)";
      ctx.fillText("n₂ = " + state.n2.toFixed(2), 14, cy + 22);

      ctx.beginPath(); ctx.moveTo(cx, cy - H * 0.42); ctx.lineTo(cx, cy + H * 0.42);
      ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1; ctx.setLineDash([6,5]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.textAlign = "center";
      ctx.fillText("normal", cx, cy - H * 0.44); ctx.textAlign = "left";

      const ix = -Math.sin(t1r) * rayLen, iy = -Math.cos(t1r) * rayLen;
      ctx.beginPath(); ctx.moveTo(cx + ix, cy + iy); ctx.lineTo(cx, cy);
      ctx.strokeStyle = "#f5a623"; ctx.lineWidth = 2.5; ctx.stroke();
      arrowHead(ctx, cx + ix, cy + iy, cx, cy, "#f5a623");

      ctx.beginPath(); ctx.arc(cx, cy, 46, -Math.PI / 2, -Math.PI / 2 + t1r);
      ctx.strokeStyle = "rgba(245,166,35,0.5)"; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.fillStyle = "#f5a623"; ctx.font = "11px JetBrains Mono,monospace";
      ctx.fillText("θ₁=" + state.theta1 + "°", cx + 50 * Math.sin(t1r / 2) + 4, cy - 48 * Math.cos(t1r / 2) + 4);

      if (!TIR) {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(t2r) * rayLen, cy + Math.cos(t2r) * rayLen);
        ctx.strokeStyle = "#00e5a0"; ctx.lineWidth = 2.5; ctx.stroke();
        arrowHead(ctx, cx, cy, cx + Math.sin(t2r) * rayLen, cy + Math.cos(t2r) * rayLen, "#00e5a0");
        ctx.beginPath(); ctx.arc(cx, cy, 46, Math.PI / 2, Math.PI / 2 + t2r);
        ctx.strokeStyle = "rgba(0,229,160,0.5)"; ctx.lineWidth = 1.3; ctx.stroke();
        ctx.fillStyle = "#00e5a0";
        ctx.fillText("θ₂=" + (t2r * 180 / Math.PI).toFixed(1) + "°", cx + 50 * Math.sin(t2r / 2) + 4, cy + 48 * Math.cos(t2r / 2) + 4);
      } else {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - Math.sin(t1r) * rayLen, cy - Math.cos(t1r) * rayLen);
        ctx.strokeStyle = "#e05050"; ctx.lineWidth = 2.5; ctx.stroke();
        arrowHead(ctx, cx, cy, cx - Math.sin(t1r) * rayLen, cy - Math.cos(t1r) * rayLen, "#e05050");
        ctx.fillStyle = "#e05050"; ctx.textAlign = "center";
        ctx.fillText("Total Internal Reflection", cx, cy + 36);
        ctx.fillText("θ_c = " + (Math.asin(1 / state.n2) * 180 / Math.PI).toFixed(1) + "°", cx, cy + 52);
        ctx.textAlign = "left";
      }

      drawDRO(ctx, W, [
        ["θ₁ (°)",    state.theta1.toFixed(1)],
        ["n₂",        state.n2.toFixed(2)],
        ["θ₂ (°)",    TIR ? "TIR" : (t2r * 180 / Math.PI).toFixed(3)],
        ["sin θ₁",   Math.sin(t1r).toFixed(5)],
        ["sin θ₂",   TIR ? "—" : Math.sin(t2r).toFixed(5)],
      ]);
    },
    controls: () => [
      { id: "sn-t1", label: "Angle θ₁ (°)", min: 5, max: 85, step: 1, init: 30, stateKey: "theta1", fmt: (v) => v.toFixed(0) },
      { id: "sn-n2", label: "Index n₂", min: 1.05, max: 2.5, step: 0.05, init: 1.5, stateKey: "n2", fmt: (v) => v.toFixed(2) },
    ],
    recordPoint: (state) => {
      const t1r = state.theta1 * Math.PI / 180;
      const sinT2 = Math.sin(t1r) / state.n2;
      if (sinT2 >= 1) return null;
      const t2r = Math.asin(sinT2);
      const t2 = t2r * 180 / Math.PI + (Math.random() - 0.5) * 0.2;
      return [state.theta1.toFixed(1), t2.toFixed(2), Math.sin(t1r).toFixed(5), Math.sin(t2 * Math.PI / 180).toFixed(5)];
    },
    dataSchema: {
      cols: ["#", "θ₁ (°)", "θ₂ (°)", "sin θ₁", "sin θ₂"],
      types: ["index", "measured", "measured", "derived", "derived"],
    },
    analyzeSetup: { xi: 3, yi: 4, xLabel: "sin θ₁", yLabel: "sin θ₂", title: "sin θ₂ vs sin θ₁" },
    analysisInsight: (slope, intercept, r2, state) => {
      const n2_exp = 1 / slope;
      const err = Math.abs((n2_exp - state.n2) / state.n2 * 100);
      return `<strong>n₂ = 1/slope = ${n2_exp.toFixed(3)}</strong> (set: ${state.n2.toFixed(2)}, error: ${err.toFixed(2)}%). R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope, state) => ({
      label: "n₂ (measured)", value: (1 / slope).toFixed(4),
      unit: "", theory: state.n2.toFixed(4),
      pctError: Math.abs((1 / slope - state.n2) / state.n2 * 100).toFixed(2),
    }),
  },

  // ══ 6. OHM'S LAW ═════════════════════════════════════════════
  {
    id: "ohm", name: "Ohm's Law", category: "EM",
    subtitle: "I–V Characteristics & Resistance",
    objective: "Plot I vs V for a resistor. Slope = G = 1/R.",
    steps: [
      { title: "Read theory", desc: "Understand V = IR, conductance G, and ohmic behaviour.",
        question: "At V = 0, what current flows? What does this tell you about the y-intercept?" },
      { title: "Set resistance", desc: "Choose R. Component tolerance is ±5%.",
        question: "A 100Ω resistor at 12V: predict I and power P = VI." },
      { title: "Vary voltage", desc: "Step V from 0 to 12V. Record I.",
        question: "If R doubled, how would the slope of your I–V graph change?" },
      { title: "Record 8+ points", desc: "Cover the full voltage range.",
        question: "Why does the graph start at the origin (0, 0) for an ohmic conductor?" },
      { title: "Plot I vs V", desc: "Slope = G = 1/R. Y-intercept ≈ 0.",
        question: "A non-ohmic bulb would show what type of curve? Why?" },
      { title: "Extract R", desc: "R = 1/slope. Find % error vs set value.",
        question: "What is the significance of the measured % error vs the 5% component tolerance?" },
    ],
    theory: () => `<div class="pl-theory-block">
  <div class="pl-theory-h1">Ohm's Law</div>
  <div class="pl-theory-sub">Electromagnetism · DC Circuits · Resistance</div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Statement</div>
    <div class="pl-eq">
      <div class="pl-eq-tag">Ohm's Law</div>
      <div class="pl-eq-formula">V = I · R</div>
      <div class="pl-eq-vars">
        <span class="pl-eq-var"><b>V</b> voltage (V)</span>
        <span class="pl-eq-var"><b>I</b> current (A)</span>
        <span class="pl-eq-var"><b>R</b> resistance (Ω)</span>
      </div>
    </div>
    <p class="pl-theory-p">G = 1/R is conductance (siemens). I = V·G. Slope of I vs V plot = G.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Live Calculator</div>
    <div class="pl-live">
      <div class="pl-live-label">Ohm's law in real time</div>
      <div class="pl-live-ctl">
        <span>V =</span>
        <input type="range" min="0" max="12" step="0.1" value="6" oninput="PLLIVE.ohm()" id="oLive-V">
        <span class="pv" id="oLive-Vv">6.0 V</span>
      </div>
      <div class="pl-live-ctl">
        <span>R =</span>
        <input type="range" min="10" max="1000" step="10" value="100" oninput="PLLIVE.ohm()" id="oLive-R">
        <span class="pv" id="oLive-Rv">100 Ω</span>
      </div>
      <div class="pl-live-result">I = <span id="oLive-I">60.0 mA</span></div>
      <div class="pl-live-worked" id="oLive-w">I = 6.0/100 = 0.0600 A · P = 0.360 W</div>
    </div>
  </div>
  <div class="pl-insight"><div class="pl-insight-head">Ohmic vs non-ohmic</div>
  A resistor: straight I–V line. A bulb filament: curves upward (R rises with T). A diode: near-zero current below ~0.6V, then exponential rise. The I–V curve is the fingerprint of a component.</div>
</div>`,
    initState: () => ({ V: 6, R: 100, sweepT: 0, ivTrace: [] }),
    drawApparatus: (ctx, W, H, state, running, dt) => {
      // Voltage sweep: V oscillates 0→12→0 over 4 s when running
      if (running) {
        state.sweepT = (state.sweepT || 0) + dt;
        const phase = (state.sweepT % 4) / 4; // 0–1 over 4 s
        state.sweepV = phase < 0.5 ? phase * 2 * 12 : (1 - phase) * 2 * 12;
        const traceI = state.sweepV / state.R;
        if (!state.ivTrace) state.ivTrace = [];
        state.ivTrace.push([state.sweepV, traceI * 1000]);
        if (state.ivTrace.length > 300) state.ivTrace.shift();
      } else {
        state.sweepV = state.V;
        state.sweepT = 0;
        state.ivTrace = [];
      }
      const displayV = state.sweepV ?? state.V;
      const I = displayV / state.R * (1 + (Math.random() - 0.5) * 0.008);
      ctx.fillStyle = "#0b0e12"; ctx.fillRect(0, 0, W, H);
      drawGrid(ctx, W, H);

      const cx = W / 2, cy = H / 2 - 10;
      const bw = Math.min(W * 0.58, 340), bh = Math.min(H * 0.52, 210);
      const lx = cx - bw/2, rx = cx + bw/2, ty = cy - bh/2, bot = cy + bh/2;

      const wire = (x1,y1,x2,y2) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle="#4da6ff"; ctx.lineWidth=2; ctx.stroke();
      };
      wire(lx,ty,rx,ty); wire(lx,bot,rx,bot);
      wire(lx,ty,lx,cy-28); wire(lx,cy+28,lx,bot);
      wire(rx,ty,rx,cy-34); wire(rx,cy+34,rx,bot);

      // Battery
      ctx.fillStyle="#1c2435"; ctx.fillRect(lx-12,cy-28,24,56);
      ctx.strokeStyle="#252e42"; ctx.lineWidth=1; ctx.strokeRect(lx-12,cy-28,24,56);
      ctx.strokeStyle="#f5a623"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(lx-7,cy-8); ctx.lineTo(lx+7,cy-8); ctx.stroke();
      ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(lx-4,cy+5); ctx.lineTo(lx+4,cy+5); ctx.stroke();
      ctx.fillStyle="#f5a623"; ctx.font="10px JetBrains Mono,monospace"; ctx.textAlign="center";
      ctx.fillText(displayV.toFixed(1)+"V", lx, cy-36);

      // Resistor
      const rh=54, rw=22;
      ctx.fillStyle="#1c2435"; ctx.fillRect(rx-rw/2,cy-rh/2,rw,rh);
      ctx.strokeStyle="#f5a623"; ctx.lineWidth=1.2; ctx.strokeRect(rx-rw/2,cy-rh/2,rw,rh);
      ctx.beginPath(); ctx.strokeStyle="#f5a623"; ctx.lineWidth=1.2;
      ctx.moveTo(rx, cy-rh/2+4);
      for (let i=0;i<7;i++) {
        const yy = cy-rh/2+8+i*(rh-14)/7;
        ctx.lineTo(rx+(i%2===0?rw/2-4:-rw/2+4), yy);
      }
      ctx.lineTo(rx, cy+rh/2-4); ctx.stroke();
      ctx.fillStyle="#f5a623"; ctx.textAlign="center";
      ctx.fillText(state.R+"Ω", rx, cy+rh/2+15);

      // Ammeter
      ctx.beginPath(); ctx.arc(cx,ty,15,0,Math.PI*2);
      ctx.fillStyle="#161c2a"; ctx.fill(); ctx.strokeStyle="#4da6ff"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle="#4da6ff"; ctx.font="10px JetBrains Mono,monospace";
      ctx.fillText("A", cx, ty+4);

      // I-V mini trace (shown when running)
      if (running && state.ivTrace && state.ivTrace.length > 1) {
        const trPad = { l: W*0.52, r: W*0.96, t: H*0.06, b: H*0.42 };
        const trW = trPad.r - trPad.l, trH = trPad.b - trPad.t;
        ctx.fillStyle = "rgba(17,21,32,0.88)"; ctx.fillRect(trPad.l-4, trPad.t-4, trW+8, trH+8);
        ctx.strokeStyle="#252e42"; ctx.lineWidth=1;
        ctx.strokeRect(trPad.l-4, trPad.t-4, trW+8, trH+8);
        const maxV=12, maxI=12000/state.R;
        const sx=v=>(trPad.l+v/maxV*trW), sy=im=>(trPad.b-im/maxI*trH);
        // Theory line
        ctx.beginPath(); ctx.moveTo(sx(0),sy(0)); ctx.lineTo(sx(maxV),sy(maxI));
        ctx.strokeStyle="rgba(245,166,35,0.25)"; ctx.lineWidth=1; ctx.stroke();
        // Traced data
        ctx.beginPath();
        state.ivTrace.forEach(([v,im],i) => i===0?ctx.moveTo(sx(v),sy(im)):ctx.lineTo(sx(v),sy(im)));
        ctx.strokeStyle="#00e5a0"; ctx.lineWidth=1.5; ctx.stroke();
        // Current point
        const cpI = displayV/state.R*1000;
        ctx.beginPath(); ctx.arc(sx(displayV),sy(cpI),4,0,Math.PI*2);
        ctx.fillStyle="#00e5a0"; ctx.fill();
        ctx.fillStyle="#4a5a72"; ctx.font="9px JetBrains Mono,monospace"; ctx.textAlign="center";
        ctx.fillText("I–V trace (sweeping)", trPad.l+trW/2, trPad.t-8);
        ctx.fillText("V →", trPad.l+trW/2, trPad.b+12);
      }

      ctx.textAlign="left";
      drawDRO(ctx, W, [
        ["V (V)",  displayV.toFixed(2)],
        ["R (Ω)",  state.R.toFixed(0)],
        ["I (mA)", (I*1000).toFixed(2)],
        ["P (mW)", (displayV*I*1000).toFixed(2)],
        ["G (mS)", displayV > 0 ? (I/displayV*1000).toFixed(4) : "—"],
      ]);
    },
    controls: () => [
      { id: "oh-V", label: "Voltage V (V)", min: 0, max: 12, step: 0.5, init: 6, stateKey: "V", fmt: (v) => v.toFixed(1) },
      { id: "oh-R", label: "Resistance R (Ω)", min: 10, max: 1000, step: 10, init: 100, stateKey: "R", fmt: (v) => v.toFixed(0) },
    ],
    recordPoint: (state) => {
      const I = state.V / state.R * (1 + (Math.random() - 0.5) * 0.018);
      return [state.V.toFixed(3), (I * 1000).toFixed(4), (state.V / I).toFixed(2), (state.V * I * 1000).toFixed(3)];
    },
    dataSchema: {
      cols: ["#", "V (V)", "I (mA)", "R_meas (Ω)", "P (mW)"],
      types: ["index", "measured", "measured", "derived", "derived"],
    },
    analyzeSetup: { xi: 1, yi: 2, xLabel: "V (V)", yLabel: "I (mA)", title: "I vs V — Ohm's Law" },
    analysisInsight: (slope, intercept, r2, state) => {
      const R_exp = 1000 / slope;
      const err = Math.abs((R_exp - state.R) / state.R * 100);
      return `<strong>R = 1/slope = ${R_exp.toFixed(1)} Ω</strong> (set: ${state.R} Ω, error: ${err.toFixed(2)}%). G = slope = ${slope.toFixed(4)} mA/V. R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope, state) => ({
      label: "R (measured)", value: (1000 / slope).toFixed(2),
      unit: "Ω", theory: state.R.toFixed(2),
      pctError: Math.abs((1000 / slope - state.R) / state.R * 100).toFixed(2),
    }),
  },

  // ══ 7. NEWTON'S COOLING ═══════════════════════════════════════
  {
    id: "cooling", name: "Newton's Cooling", category: "Thermo",
    subtitle: "Exponential Decay & Time Constant",
    objective: "Record T(t). Plot ln(T−Tₐ) vs t. Slope = −k. Find τ = 1/k.",
    steps: [
      { title: "Read theory", desc: "Understand dT/dt = −k(T−Tₐ) and its exponential solution.",
        question: "What does the negative sign in dT/dt = −k(T−Tₐ) physically represent?" },
      { title: "Set conditions", desc: "Set T₀ and ambient Tₐ. Note the starting ΔT.",
        question: "If you double ΔT₀, how does the cooling curve shape change? Does k change?" },
      { title: "Record cooling", desc: "Click Record Point every 15 s of simulated time.",
        question: "After one time constant τ, what fraction of the original ΔT remains?" },
      { title: "Record 8+ points", desc: "Span at least 3 time constants for reliable fit.",
        question: "What would the temperature do if k were negative? Is this physical?" },
      { title: "Plot ln(T−Tₐ) vs t", desc: "Slope = −k. This linearizes the exponential.",
        question: "Why does taking the natural log of (T−Tₐ) linearize the equation?" },
      { title: "Find k and τ", desc: "τ = 1/k. Compare to set value.",
        question: "A mug of coffee with τ = 15 min: how long until it's within 5% of room temperature?" },
    ],
    theory: () => `<div class="pl-theory-block">
  <div class="pl-theory-h1">Newton's Law of Cooling</div>
  <div class="pl-theory-sub">Thermodynamics · ODEs · Linearization</div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">The Law</div>
    <div class="pl-eq">
      <div class="pl-eq-tag">Newton's Law of Cooling</div>
      <div class="pl-eq-formula">dT/dt = −k · (T − Tₐ)</div>
      <div class="pl-eq-vars">
        <span class="pl-eq-var"><b>T</b> temperature (°C)</span>
        <span class="pl-eq-var"><b>Tₐ</b> ambient temperature</span>
        <span class="pl-eq-var"><b>k</b> cooling constant (s⁻¹)</span>
      </div>
    </div>
    <p class="pl-theory-p">Solution: T(t) = Tₐ + (T₀ − Tₐ)·e⁻ᵏᵗ. Linearization: ln(T−Tₐ) = ln(ΔT₀) − k·t. Slope = −k.</p>
  </div>
  <div class="pl-theory-section">
    <div class="pl-theory-h2">Live Calculator</div>
    <div class="pl-live">
      <div class="pl-live-label">See how k affects cooling</div>
      <div class="pl-live-ctl">
        <span>k =</span>
        <input type="range" min="0.001" max="0.05" step="0.001" value="0.015" oninput="PLLIVE.cooling()" id="cLive-k">
        <span class="pv" id="cLive-kv">0.015 s⁻¹</span>
      </div>
      <div class="pl-live-result">τ = <span id="cLive-tau">66.7 s</span></div>
      <div class="pl-live-worked" id="cLive-w">τ = 1/0.015 = 66.7 s · 5τ = 333 s to within 1%</div>
    </div>
  </div>
  <div class="pl-insight"><div class="pl-insight-head">Time constant τ = 1/k</div>
  At t = τ, excess temperature falls to ΔT₀/e ≈ 36.8%. After 5τ, it's within 0.7% of ambient. A coffee mug: τ ≈ 10–20 min. A red-hot iron bar: τ ≈ 2–3 min.</div>
</div>`,
    initState: () => ({ T0: 85, Ta: 20, k: 0.015, t: 0 }),
    drawApparatus: (ctx, W, H, state, running, dt) => {
      if (running) state.t = (state.t || 0) + dt * 6;
      const T = state.Ta + (state.T0 - state.Ta) * Math.exp(-state.k * (state.t || 0));
      const tMax = 6 / state.k, TMin = state.Ta - 3, TMax = state.T0 + 5;

      ctx.fillStyle = "#0b0e12"; ctx.fillRect(0, 0, W, H);
      const pad = { l:58, r:20, t:20, b:42 };
      const aw = W-pad.l-pad.r, ah = H-pad.t-pad.b;
      const sx = (t) => pad.l + (t/tMax)*aw;
      const sy = (T2) => pad.t + ah*(1-(T2-TMin)/(TMax-TMin));

      ctx.strokeStyle="rgba(0,229,160,0.05)"; ctx.lineWidth=0.8;
      for (let i=0;i<=6;i++) {
        const x=sx(i*tMax/6);
        ctx.beginPath(); ctx.moveTo(x,pad.t); ctx.lineTo(x,pad.t+ah); ctx.stroke();
        ctx.fillStyle="#4a5a72"; ctx.font="10px JetBrains Mono,monospace"; ctx.textAlign="center";
        ctx.fillText(Math.round(i*tMax/6)+"s", x, pad.t+ah+18);
      }
      for (let i=0;i<=5;i++) {
        const TT=TMin+i*(TMax-TMin)/5;
        ctx.beginPath(); ctx.moveTo(pad.l,sy(TT)); ctx.lineTo(pad.l+aw,sy(TT)); ctx.stroke();
        ctx.textAlign="right"; ctx.fillStyle="#4a5a72";
        ctx.fillText(TT.toFixed(0)+"°", pad.l-4, sy(TT)+4);
      }

      ctx.beginPath(); ctx.moveTo(pad.l,sy(state.Ta)); ctx.lineTo(pad.l+aw,sy(state.Ta));
      ctx.strokeStyle="rgba(77,166,255,0.4)"; ctx.lineWidth=1; ctx.setLineDash([6,5]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle="#4da6ff"; ctx.textAlign="left"; ctx.font="10px JetBrains Mono,monospace";
      ctx.fillText("Tₐ="+state.Ta+"°C", pad.l+4, sy(state.Ta)-6);

      const tCur = Math.min(state.t||0, tMax);
      ctx.beginPath();
      for (let ti=0;ti<=tCur;ti+=tMax/300) {
        const Tt=state.Ta+(state.T0-state.Ta)*Math.exp(-state.k*ti);
        ti===0?ctx.moveTo(sx(ti),sy(Tt)):ctx.lineTo(sx(ti),sy(Tt));
      }
      ctx.strokeStyle="#f5a623"; ctx.lineWidth=2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(sx(tCur),sy(T),5,0,Math.PI*2);
      ctx.fillStyle="#f5a623"; ctx.fill();

      ctx.strokeStyle="#252e42"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+ah); ctx.lineTo(pad.l+aw,pad.t+ah); ctx.stroke();
      ctx.textAlign="left";

      drawDRO(ctx, W, [
        ["T(t) (°C)", T.toFixed(2)],
        ["t (s)",     tCur.toFixed(1)],
        ["ΔT (°C)",   (T-state.Ta).toFixed(2)],
        ["τ (s)",     (1/state.k).toFixed(1)],
        ["T₀ (°C)",   state.T0.toFixed(0)],
      ]);
    },
    controls: () => [
      { id: "cl-T0", label: "Initial T₀ (°C)", min: 40, max: 150, step: 5, init: 85, stateKey: "T0", fmt: (v) => v.toFixed(0) },
      { id: "cl-Ta", label: "Ambient Tₐ (°C)", min: 5, max: 30, step: 1, init: 20, stateKey: "Ta", fmt: (v) => v.toFixed(0) },
      { id: "cl-k",  label: "Cooling k (s⁻¹)", min: 0.002, max: 0.04, step: 0.001, init: 0.015, stateKey: "k", fmt: (v) => v.toFixed(3) },
    ],
    recordPoint: (state) => {
      const T = state.Ta + (state.T0-state.Ta)*Math.exp(-state.k*(state.t||0)) + (Math.random()-0.5)*0.4;
      const dT = Math.max(0.01, T-state.Ta);
      state.t = (state.t||0) + 15;
      return [(state.t||0).toFixed(0), T.toFixed(2), dT.toFixed(2), Math.log(dT).toFixed(4)];
    },
    dataSchema: {
      cols: ["#", "t (s)", "T (°C)", "T−Tₐ", "ln(T−Tₐ)"],
      types: ["index", "measured", "measured", "derived", "derived"],
    },
    analyzeSetup: { xi: 1, yi: 4, xLabel: "t (s)", yLabel: "ln(T−Tₐ)", title: "Linearized Cooling" },
    analysisInsight: (slope, intercept, r2, state) => {
      const k_exp = -slope, tau = 1/k_exp;
      return `<strong>k = ${k_exp.toFixed(4)} s⁻¹, τ = ${tau.toFixed(1)} s</strong> (set: k=${state.k.toFixed(3)}, τ=${(1/state.k).toFixed(1)}s). R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope, state) => ({
      label: "k (measured)", value: (-slope).toFixed(5),
      unit: "s⁻¹", theory: state.k.toFixed(5),
      pctError: Math.abs((-slope-state.k)/state.k*100).toFixed(2),
    }),
  },
];

// ─────────────────────────────────────────────────────────────────
//  LIVE THEORY CALCULATOR FUNCTIONS
// ─────────────────────────────────────────────────────────────────
function registerLiveCalcs() {
  window.PLLIVE = {
    freefall() {
      const h = +document.getElementById("ffL-h")?.value || 1;
      const t = Math.sqrt(2*h/9.81);
      const v = 9.81*t;
      document.getElementById("ffL-hv").textContent = h.toFixed(2)+" m";
      document.getElementById("ffL-t").textContent = t.toFixed(3)+" s";
      document.getElementById("ffL-w").innerHTML =
        `t = √(2×<span class="pl-hl">${h.toFixed(2)}</span>/9.81) = <span class="pl-hl">${t.toFixed(4)}</span> s · v_impact = g·t = <span class="pl-hl">${v.toFixed(3)}</span> m/s`;
    },
    airtrack() {
      const t = +document.getElementById("atL-t")?.value || 30;
      const a = 9.81*Math.sin(t*Math.PI/180);
      document.getElementById("atL-tv").textContent = t+"°";
      document.getElementById("atL-a").textContent = a.toFixed(3)+" m/s²";
      document.getElementById("atL-w").innerHTML =
        `a = 9.81 × sin(<span class="pl-hl">${t}°</span>) = 9.81 × <span class="pl-hl">${Math.sin(t*Math.PI/180).toFixed(4)}</span> = <span class="pl-hl">${a.toFixed(4)}</span> m/s²`;
    },
    hooke() {
      const k = +document.getElementById("hkL-k")?.value || 100;
      const x = +document.getElementById("hkL-x")?.value || 0.1;
      const F = k*x, U = 0.5*k*x*x;
      document.getElementById("hkL-kv").textContent = k+" N/m";
      document.getElementById("hkL-xv").textContent = x.toFixed(2)+" m";
      document.getElementById("hkL-F").textContent = F.toFixed(2)+" N";
      document.getElementById("hkL-w").innerHTML =
        `F = <span class="pl-hl">${k}</span> × <span class="pl-hl">${x.toFixed(2)}</span> = <span class="pl-hl">${F.toFixed(3)}</span> N · U = ½kx² = <span class="pl-hl">${U.toFixed(4)}</span> J`;
    },
    pendulum() {
      const L = +document.getElementById("pLive-L")?.value || 1;
      const g = +document.getElementById("pLive-g")?.value || 9.81;
      const T = 2*Math.PI*Math.sqrt(L/g);
      document.getElementById("pLive-Lv").textContent = L.toFixed(2)+" m";
      document.getElementById("pLive-gv").textContent = g.toFixed(2)+" m/s²";
      document.getElementById("pLive-T").textContent  = T.toFixed(3)+" s";
      document.getElementById("pLive-w").innerHTML =
        `T = 2π √(<span class="pl-hl">${L.toFixed(2)}</span>/<span class="pl-hl">${g.toFixed(2)}</span>) = <span class="pl-hl">${T.toFixed(4)}</span> s · T² = <span class="pl-hl">${(T*T).toFixed(4)}</span>`;
    },
    snell() {
      const t1 = +document.getElementById("sLive-t1")?.value || 30;
      const n2 = +document.getElementById("sLive-n2")?.value || 1.5;
      const s2 = Math.sin(t1*Math.PI/180)/n2;
      const t2 = s2>=1 ? "TIR" : (Math.asin(s2)*180/Math.PI).toFixed(2)+"°";
      document.getElementById("sLive-t1v").textContent = t1+"°";
      document.getElementById("sLive-n2v").textContent = n2.toFixed(2);
      document.getElementById("sLive-t2").textContent  = t2;
      document.getElementById("sLive-w").innerHTML =
        `1.00·sin(<span class="pl-hl">${t1}°</span>) = <span class="pl-hl">${n2}</span>·sin(θ₂) → θ₂ = <span class="pl-hl">${t2}</span>`;
    },
    ohm() {
      const V = +document.getElementById("oLive-V")?.value || 6;
      const R = +document.getElementById("oLive-R")?.value || 100;
      const I = V/R;
      document.getElementById("oLive-Vv").textContent = V.toFixed(1)+" V";
      document.getElementById("oLive-Rv").textContent = R+" Ω";
      document.getElementById("oLive-I").textContent  = (I*1000).toFixed(2)+" mA";
      document.getElementById("oLive-w").innerHTML =
        `I = <span class="pl-hl">${V.toFixed(1)}</span>/<span class="pl-hl">${R}</span> = <span class="pl-hl">${I.toFixed(4)}</span> A · P = <span class="pl-hl">${(V*I).toFixed(4)}</span> W`;
    },
    cooling() {
      const k = +document.getElementById("cLive-k")?.value || 0.015;
      const tau = 1/k;
      document.getElementById("cLive-kv").textContent  = k.toFixed(3)+" s⁻¹";
      document.getElementById("cLive-tau").textContent = tau.toFixed(1)+" s";
      document.getElementById("cLive-w").innerHTML =
        `τ = 1/<span class="pl-hl">${k.toFixed(3)}</span> = <span class="pl-hl">${tau.toFixed(1)}</span> s · 5τ = <span class="pl-hl">${(5*tau).toFixed(0)}</span> s to &lt;1% of ambient`;
    },
  };
}

// ─────────────────────────────────────────────────────────────────
//  PER-LAB GUIDE CONTENT
// ─────────────────────────────────────────────────────────────────
const GUIDES = {
  freefall: `
<div class="pl-guide">
  <div class="pl-guide-title">How to Run This Lab</div>
  <div class="pl-guide-intro">You are measuring <strong>g</strong> by timing a ball dropped from different heights. The key insight: h = ½g·t², so a plot of h vs t² is a straight line with slope = g/2.</div>

  <div class="pl-guide-steps">
    <div class="pl-gs"><span class="pl-gsn">1</span><div><strong>Go to Apparatus.</strong> Set the drop height h with the slider. The DRO shows the theoretical fall time t and t².</div></div>
    <div class="pl-gs"><span class="pl-gsn">2</span><div><strong>Click Run</strong> to see the ball fall in real time. It will pause briefly at the ground then repeat. This helps visualise the parabolic acceleration.</div></div>
    <div class="pl-gs"><span class="pl-gsn">3</span><div><strong>Click Record Point.</strong> This captures (h, t, t²) for your current height with small realistic timing noise added. You do <em>not</em> need Run active to record.</div></div>
    <div class="pl-gs"><span class="pl-gsn">4</span><div><strong>Change h</strong> using the slider and record again. Aim for 8–10 points spread from 0.2 m to 3 m.</div></div>
    <div class="pl-gs"><span class="pl-gsn">5</span><div><strong>Go to Analysis.</strong> Click "Plot & Fit". The x-axis is t² and the y-axis is h. The slope equals g/2 ≈ 4.90.</div></div>
    <div class="pl-gs"><span class="pl-gsn">6</span><div><strong>Read the result.</strong> g = 2 × slope. A good experiment gives g within 1–2% of 9.81 m/s². Check your R² — it should be &gt;0.999.</div></div>
  </div>

  <div class="pl-guide-callout tip"><div class="pl-gc-head">Why not plot h vs t?</div>h vs t is a parabola — hard to fit. Squaring t linearises it. This trick (substituting u = t²) converts a nonlinear relationship into one you can fit with a ruler.</div>
  <div class="pl-guide-callout warn"><div class="pl-gc-head">Air resistance</div>This simulation ignores air drag. In a real lab, use dense compact objects (steel balls) dropped over short distances (&lt;3 m) to keep drag negligible.</div>
</div>`,

  airtrack: `
<div class="pl-guide">
  <div class="pl-guide-title">How to Run This Lab</div>
  <div class="pl-guide-intro">You are measuring <strong>g</strong> via a frictionless inclined plane. The cart acceleration a = g·sin θ, so a plot of a vs sin θ gives a straight line with slope = g.</div>

  <div class="pl-guide-steps">
    <div class="pl-gs"><span class="pl-gsn">1</span><div><strong>Go to Apparatus.</strong> Set the angle θ with the slider.</div></div>
    <div class="pl-gs"><span class="pl-gsn">2</span><div><strong>Click Run</strong> to watch the cart accelerate down the track and reset. This helps you visualise how acceleration changes with angle.</div></div>
    <div class="pl-gs"><span class="pl-gsn">3</span><div><strong>Click Record Point.</strong> This captures (θ, sin θ, a) for your current angle.</div></div>
    <div class="pl-gs"><span class="pl-gsn">4</span><div><strong>Vary θ</strong> from 2° up to 60°. Record 8–10 points spread across the range.</div></div>
    <div class="pl-gs"><span class="pl-gsn">5</span><div><strong>Go to Analysis → Plot & Fit.</strong> x = sin θ, y = a. Slope = g ≈ 9.81 m/s².</div></div>
  </div>

  <div class="pl-guide-callout tip"><div class="pl-gc-head">Yes — the cart is supposed to speed up at larger angles</div>This is correct physics. a = g·sin θ means at 30° the cart accelerates at 4.9 m/s², at 60° it accelerates at 8.5 m/s². The experiment exploits this relationship to recover g from the slope of the a vs sin θ graph.</div>
  <div class="pl-guide-callout tip"><div class="pl-gc-head">Why sin θ, not θ?</div>Newton's law gives a = g·sin θ exactly. Plotting vs θ directly would give a curve (since sin θ ≠ θ for large angles). Plotting vs sin θ gives a perfect straight line through the origin.</div>
</div>`,

  hooke: `
<div class="pl-guide">
  <div class="pl-guide-title">How to Run This Lab</div>
  <div class="pl-guide-intro">You are measuring the spring constant <strong>k</strong> from the slope of an F vs x graph. Hooke's Law: F = k·x. No animation is needed — this is a static equilibrium lab.</div>

  <div class="pl-guide-steps">
    <div class="pl-gs"><span class="pl-gsn">1</span><div><strong>Go to Apparatus.</strong> The sliders control mass m and spring constant k. The spring stretches in real time to show the equilibrium position.</div></div>
    <div class="pl-gs"><span class="pl-gsn">2</span><div><strong>Do not click Run</strong> — this lab is static. The extension x = mg/k is computed from equilibrium, not from motion.</div></div>
    <div class="pl-gs"><span class="pl-gsn">3</span><div><strong>Record Point</strong> at your current mass. This captures (F = mg, x) with small realistic measurement noise.</div></div>
    <div class="pl-gs"><span class="pl-gsn">4</span><div><strong>Change the mass slider</strong> and record again. Aim for 8–10 points covering the full mass range 0.02–1.0 kg.</div></div>
    <div class="pl-gs"><span class="pl-gsn">5</span><div><strong>Analysis → Plot & Fit.</strong> x on x-axis, F on y-axis. Slope = k.</div></div>
    <div class="pl-gs"><span class="pl-gsn">6</span><div>Compare measured k to the slider value. Expect &lt;2% error. The y-intercept should be ~0 (spring passes through origin).</div></div>
  </div>

  <div class="pl-guide-callout tip"><div class="pl-gc-head">Elastic limit</div>Real springs stop obeying F = kx at high extensions (the elastic limit). In this simulation the spring is ideal, but in a real lab approach the maximum load gradually and watch for the curve departing from a straight line.</div>
</div>`,

  pendulum: `
<div class="pl-guide">
  <div class="pl-guide-title">How to Run This Lab</div>
  <div class="pl-guide-intro">You are measuring <strong>g</strong> from the slope of a T² vs L graph. T = 2π√(L/g), so T² = (4π²/g)·L and slope = 4π²/g.</div>

  <div class="pl-guide-steps">
    <div class="pl-gs"><span class="pl-gsn">1</span><div><strong>Go to Apparatus.</strong> Set length L and initial angle θ₀ (keep θ₀ &lt; 15° for small-angle validity).</div></div>
    <div class="pl-gs"><span class="pl-gsn">2</span><div><strong>Click Run</strong> to watch the pendulum swing. The DRO shows the live period T and T².</div></div>
    <div class="pl-gs"><span class="pl-gsn">3</span><div><strong>Click Record Point</strong> to capture (L, T, T²). You can record while running or stopped.</div></div>
    <div class="pl-gs"><span class="pl-gsn">4</span><div><strong>Change L</strong> from 0.1 m to 2.0 m and record 6–8 points. The wider the L range, the better the fit.</div></div>
    <div class="pl-gs"><span class="pl-gsn">5</span><div><strong>Analysis → Plot & Fit.</strong> x = L, y = T². Slope = 4π²/g. The panel calculates g = 4π²/slope automatically.</div></div>
  </div>

  <div class="pl-guide-callout tip"><div class="pl-gc-head">Why T² vs L and not T vs L?</div>T vs L is a square-root curve — hard to fit. T² vs L is perfectly linear. This is a standard linearisation technique: square both sides of T = 2π√(L/g) to get T² = (4π²/g)·L.</div>
  <div class="pl-guide-callout warn"><div class="pl-gc-head">Keep θ₀ small</div>The formula T = 2π√(L/g) assumes sin θ ≈ θ (small angle). At θ₀ = 30° the true period is ~2% longer. Keep θ₀ ≤ 14° (the slider maximum) for accurate results.</div>
</div>`,

  snell: `
<div class="pl-guide">
  <div class="pl-guide-title">How to Run This Lab</div>
  <div class="pl-guide-intro">You are measuring the refractive index <strong>n₂</strong> of a medium by plotting sin θ₂ vs sin θ₁. Snell's Law: sin θ₁ = n₂·sin θ₂, so slope = 1/n₂.</div>

  <div class="pl-guide-steps">
    <div class="pl-gs"><span class="pl-gsn">1</span><div><strong>Go to Apparatus.</strong> Set the angle of incidence θ₁ and choose the refractive index n₂ of your medium (glass ≈ 1.50, water ≈ 1.33, diamond ≈ 2.42).</div></div>
    <div class="pl-gs"><span class="pl-gsn">2</span><div><strong>Run is not needed</strong> — this lab is instantaneous. The refracted ray updates immediately.</div></div>
    <div class="pl-gs"><span class="pl-gsn">3</span><div><strong>Click Record Point.</strong> This captures (θ₁, θ₂, sin θ₁, sin θ₂). Stay below total internal reflection (the boundary turns red).</div></div>
    <div class="pl-gs"><span class="pl-gsn">4</span><div><strong>Vary θ₁</strong> from 10° to 70° in 10° steps. 6–8 points is enough for a reliable fit.</div></div>
    <div class="pl-gs"><span class="pl-gsn">5</span><div><strong>Analysis → Plot & Fit.</strong> x = sin θ₁, y = sin θ₂. Slope = 1/n₂. The panel calculates n₂ = 1/slope.</div></div>
  </div>

  <div class="pl-guide-callout warn"><div class="pl-gc-head">Total Internal Reflection</div>When θ₁ exceeds the critical angle θ_c = arcsin(1/n₂), no refracted ray exists. The Record button returns no point in TIR. Keep θ₁ below θ_c to stay in the valid data range.</div>
  <div class="pl-guide-callout tip"><div class="pl-gc-head">Why sin θ₁ vs sin θ₂?</div>Snell's Law is a ratio of sines. Plotting the sines (not the angles) gives a perfectly straight line through the origin, regardless of the medium. The slope directly gives n₁/n₂ = 1/n₂ (since n₁ = 1.00 for air).</div>
</div>`,

  ohm: `
<div class="pl-guide">
  <div class="pl-guide-title">How to Run This Lab</div>
  <div class="pl-guide-intro">You are plotting an <strong>I–V characteristic</strong> to measure resistance R. Ohm's Law: I = V/R, so a plot of I vs V is linear with slope = G = 1/R (conductance).</div>

  <div class="pl-guide-steps">
    <div class="pl-gs"><span class="pl-gsn">1</span><div><strong>Set the resistance R</strong> using the slider. This is the "component under test".</div></div>
    <div class="pl-gs"><span class="pl-gsn">2</span><div><strong>Click Run</strong> to see an animated voltage sweep. The voltage automatically ramps 0 → 12 V → 0 V while the I–V curve is traced on screen in real time.</div></div>
    <div class="pl-gs"><span class="pl-gsn">3</span><div><strong>To record data manually,</strong> stop the simulation, set V with the slider, and click Record Point. This captures (V, I, R_measured).</div></div>
    <div class="pl-gs"><span class="pl-gsn">4</span><div><strong>Step V from 0 to 12 V</strong> in 1–2 V increments. 8+ points gives a reliable fit.</div></div>
    <div class="pl-gs"><span class="pl-gsn">5</span><div><strong>Analysis → Plot & Fit.</strong> x = V, y = I (mA). Slope = G = 1/R (in mA/V). The panel calculates R = 1000/slope.</div></div>
  </div>

  <div class="pl-guide-callout tip"><div class="pl-gc-head">What you see when Run is active</div>The mini I–V trace in the top-right corner shows the characteristic being swept. The green dot is the current operating point. The amber dashed line is the theoretical prediction. A perfectly ohmic resistor traces a straight line through the origin.</div>
  <div class="pl-guide-callout tip"><div class="pl-gc-head">Slope = conductance G, not resistance</div>The slope of I vs V equals G = 1/R (in siemens or A/V). To get R: flip it. A steeper line means lower R (easier for current to flow). A flatter line means higher R.</div>
</div>`,

  cooling: `
<div class="pl-guide">
  <div class="pl-guide-title">How to Run This Lab</div>
  <div class="pl-guide-intro">You are measuring the cooling constant <strong>k</strong> by linearising an exponential decay. Newton's Cooling: T(t) = Tₐ + ΔT₀·e⁻ᵏᵗ. Taking ln(T−Tₐ) vs t gives a straight line with slope = −k.</div>

  <div class="pl-guide-steps">
    <div class="pl-gs"><span class="pl-gsn">1</span><div><strong>Set initial temperature T₀</strong> (e.g. 85°C) and ambient temperature Tₐ (e.g. 20°C). The bigger the difference, the more data range you have.</div></div>
    <div class="pl-gs"><span class="pl-gsn">2</span><div><strong>Click Run</strong> — the simulation advances time at 6× real speed. You will see the temperature curve traced on the graph in real time.</div></div>
    <div class="pl-gs"><span class="pl-gsn">3</span><div><strong>Click Record Point</strong> periodically as the temperature falls. Each click advances the simulated time by 15 s and records (t, T, T−Tₐ, ln(T−Tₐ)).</div></div>
    <div class="pl-gs"><span class="pl-gsn">4</span><div><strong>Aim for 8–10 points spanning at least 3 time constants</strong> (3/k seconds). If τ = 1/k = 67 s, record data up to ~200 s.</div></div>
    <div class="pl-gs"><span class="pl-gsn">5</span><div><strong>Analysis → Plot & Fit.</strong> x = t, y = ln(T−Tₐ). Slope = −k. The panel calculates k and τ = 1/k.</div></div>
  </div>

  <div class="pl-guide-callout tip"><div class="pl-gc-head">Why take the natural log?</div>ln(T−Tₐ) = ln(ΔT₀) − k·t. The −k·t term is linear in t. Taking the log of the temperature excess converts the exponential curve into a straight line you can fit with linear regression.</div>
  <div class="pl-guide-callout warn"><div class="pl-gc-head">Don't let T reach Tₐ</div>When T → Tₐ, ln(T−Tₐ) → −∞. Stop recording before the temperature excess (T−Tₐ) drops below ~1°C. The last few points will have large errors and will pull the fit off.</div>
</div>`,
};

// ─────────────────────────────────────────────────────────────────
//  LINEAR REGRESSION
// ─────────────────────────────────────────────────────────────────
function linReg(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  const xm = xs.slice(0,n).reduce((a,b)=>a+b,0)/n;
  const ym = ys.slice(0,n).reduce((a,b)=>a+b,0)/n;
  let num=0, den=0;
  for (let i=0;i<n;i++) { num+=(xs[i]-xm)*(ys[i]-ym); den+=(xs[i]-xm)**2; }
  const slope = den>0 ? num/den : 0;
  const intercept = ym - slope*xm;
  const ss_res = ys.slice(0,n).reduce((s,y,i)=>s+(y-(slope*xs[i]+intercept))**2, 0);
  const ss_tot = ys.slice(0,n).reduce((s,y)=>s+(y-ym)**2, 0);
  const r2 = ss_tot>0 ? 1-ss_res/ss_tot : 1;
  return { slope, intercept, r2 };
}

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function PhysicsLab({ onClose }) {
  const [labIdx,   setLabIdx]   = useState(0);
  const [panel,    setPanel]    = useState("theory");
  const [state,    setState]    = useState(() => LABS[0].initState());
  const [running,  setRunning]  = useState(false);
  const [dataRows, setDataRows] = useState([]);
  const [stepIdx,  setStepIdx]  = useState(0);
  const [regResult,setRegResult]= useState(null);

  const canvasRef  = useRef(null);
  const plotRef    = useRef(null);
  const animRef    = useRef(null);
  const stateRef   = useRef(state);
  const runningRef = useRef(running);
  const lastTimeRef= useRef(null);

  const lab = LABS[labIdx];
  stateRef.current  = state;
  runningRef.current= running;

  // ── Inject CSS once ──────────────────────────────────────────
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "physlab-styles";
    if (!document.getElementById("physlab-styles")) {
      el.textContent = STYLES; document.head.appendChild(el);
    }
    registerLiveCalcs();
    return () => { document.getElementById("physlab-styles")?.remove(); delete window.PLLIVE; };
  }, []);

  // ── Canvas sizing ────────────────────────────────────────────
  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const { width, height } = wrap.getBoundingClientRect();
    if (width > 0 && height > 0) {
      canvas.width  = width;
      canvas.height = height;
    }
  }, []);

  // ── Draw one frame ───────────────────────────────────────────
  const draw = useCallback((dt = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sizeCanvas();
    const ctx = canvas.getContext("2d");
    lab.drawApparatus(ctx, canvas.width, canvas.height, stateRef.current, runningRef.current, dt);
  }, [lab, sizeCanvas]);

  // ── Animation loop ───────────────────────────────────────────
  useEffect(() => {
    if (running) {
      lastTimeRef.current = null;
      const loop = (ts) => {
        if (!runningRef.current) return;
        const dt = lastTimeRef.current ? Math.min((ts - lastTimeRef.current) / 1000, 0.05) : 0.016;
        lastTimeRef.current = ts;
        // Mutate stateRef directly for animation (avoid React batching overhead)
        lab.drawApparatus(canvasRef.current?.getContext("2d"), canvasRef.current?.width || 800, canvasRef.current?.height || 500, stateRef.current, true, dt);
        animRef.current = requestAnimationFrame(loop);
      };
      animRef.current = requestAnimationFrame(loop);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      draw(0);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [running, draw, lab]);

  // Draw on state change (when not animating)
  useEffect(() => { if (!running) draw(0); }, [state, draw, running]);

  // Resize observer
  useEffect(() => {
    const obs = new ResizeObserver(() => { sizeCanvas(); if (!running) draw(0); });
    if (canvasRef.current?.parentElement) obs.observe(canvasRef.current.parentElement);
    return () => obs.disconnect();
  }, [sizeCanvas, draw, running]);

  // ── Switch lab ───────────────────────────────────────────────
  const switchLab = useCallback((idx) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setLabIdx(idx);
    const s = LABS[idx].initState();
    stateRef.current = s;
    setState(s);
    setRunning(false); runningRef.current = false;
    setDataRows([]); setStepIdx(0); setPanel("theory"); setRegResult(null);
  }, []);

  // ── Ctrl slider change ───────────────────────────────────────
  const onSlider = useCallback((stateKey, value) => {
    setState(prev => {
      const next = { ...prev, [stateKey]: value };
      stateRef.current = next;
      return next;
    });
  }, []);

  // ── Record point ─────────────────────────────────────────────
  const recordPoint = useCallback(() => {
    const row = lab.recordPoint(stateRef.current);
    if (!row) return;
    setDataRows(prev => [...prev, row]);
    setStepIdx(s => Math.max(s, 3));
  }, [lab]);

  // ── Toggle run ───────────────────────────────────────────────
  const toggleRun = useCallback(() => {
    setRunning(r => { runningRef.current = !r; return !r; });
  }, []);

  // ── Reset ────────────────────────────────────────────────────
  const resetLab = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const s = lab.initState();
    stateRef.current = s;
    setState(s);
    setRunning(false); runningRef.current = false;
    setDataRows([]); setStepIdx(0); setRegResult(null);
  }, [lab]);

  // ── Plot ─────────────────────────────────────────────────────
  const doPlot = useCallback(() => {
    if (dataRows.length < 2 || !plotRef.current) return;
    const setup = lab.analyzeSetup;
    const xi = setup.xi - 1, yi = setup.yi - 1;
    const xs = dataRows.map(r => parseFloat(r[xi])).filter(v => !isNaN(v));
    const ys = dataRows.map(r => parseFloat(r[yi])).filter(v => !isNaN(v));
    if (xs.length < 2) return;

    const { slope, intercept, r2 } = linReg(xs, ys);
    const res = lab.theoryResult(slope, stateRef.current);
    setRegResult({ slope, intercept, r2, res });
    setStepIdx(s => Math.max(s, 5));

    // Draw plot
    const canvas = plotRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = { l:60, r:18, t:22, b:46 };
    const aw = W-pad.l-pad.r, ah = H-pad.t-pad.b;
    const xMin=Math.min(...xs), xMax=Math.max(...xs);
    const yMin=Math.min(...ys), yMax=Math.max(...ys);
    const xR=xMax-xMin||1, yR=yMax-yMin||1;
    const xP=xR*.1, yP=yR*.15;
    const sx=x=>pad.l+(x-(xMin-xP))/(xR+xP*2)*aw;
    const sy=y=>pad.t+(yMax+yP-y)/(yR+yP*2)*ah;

    ctx.fillStyle="#111520"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(0,229,160,0.06)"; ctx.lineWidth=0.8;
    for (let i=0;i<=5;i++) {
      const x=xMin-xP+i*(xR+xP*2)/5;
      ctx.beginPath(); ctx.moveTo(sx(x),pad.t); ctx.lineTo(sx(x),pad.t+ah); ctx.stroke();
      ctx.font="10px JetBrains Mono,monospace"; ctx.fillStyle="#4a5a72"; ctx.textAlign="center";
      ctx.fillText(x.toFixed(x<1?3:x<10?2:1), sx(x), pad.t+ah+18);
      const y=yMin-yP+i*(yR+yP*2)/5;
      ctx.beginPath(); ctx.moveTo(pad.l,sy(y)); ctx.lineTo(pad.l+aw,sy(y)); ctx.stroke();
      ctx.textAlign="right";
      ctx.fillText(y.toFixed(y<1?3:y<10?2:1), pad.l-4, sy(y)+4);
    }
    ctx.strokeStyle="#252e42"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+ah); ctx.lineTo(pad.l+aw,pad.t+ah); ctx.stroke();

    const x1=xMin-xP, x2=xMax+xP;
    ctx.beginPath(); ctx.moveTo(sx(x1),sy(slope*x1+intercept)); ctx.lineTo(sx(x2),sy(slope*x2+intercept));
    ctx.strokeStyle="rgba(245,166,35,0.6)"; ctx.lineWidth=1.5; ctx.setLineDash([7,4]); ctx.stroke(); ctx.setLineDash([]);

    xs.forEach((x,i) => {
      ctx.beginPath(); ctx.arc(sx(x),sy(ys[i]),5,0,Math.PI*2);
      ctx.fillStyle="#00e5a0"; ctx.fill();
      ctx.strokeStyle="rgba(0,229,160,0.3)"; ctx.lineWidth=1; ctx.stroke();
    });

    ctx.fillStyle="#8a9ab5"; ctx.font="11px JetBrains Mono,monospace"; ctx.textAlign="center";
    ctx.fillText(setup.xLabel, W/2, H-5);
    ctx.save(); ctx.translate(13,(H+pad.t)/2); ctx.rotate(-Math.PI/2);
    ctx.fillText(setup.yLabel,0,0); ctx.restore();
    ctx.textAlign="left";
  }, [dataRows, lab]);

  // ─────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────
  const sch = lab.dataSchema;

  return (
    <div id="physlab-root" style={{
      display:"flex", flexDirection:"column",
      width:"100vw", height:"100vh",
      background:"var(--bg)", color:"var(--text)", overflow:"hidden",
    }}>
      {/* ── HEADER ── */}
      <div className="pl-header">
        <div className="pl-logo">
          <div className="pl-logo-mark">φ</div>
          <div className="pl-logo-text">Physics Lab</div>
        </div>
        <div className="pl-lab-tabs">
          {LABS.map((l, i) => (
            <button key={l.id} className={`pl-lab-tab ${i===labIdx?"active":""}`} onClick={()=>switchLab(i)}>
              <span className="pl-tab-dot" />
              {l.name}
              <span className="pl-tab-cat">{l.category}</span>
            </button>
          ))}
        </div>
        <div className="pl-header-actions">
          <span style={{fontSize:"10px",color:"var(--text3)",marginRight:"2px"}}>{running?"Running":"Idle"}</span>
          <button className={`pl-hbtn ${running?"stop":"run"}`} onClick={toggleRun}>
            {running ? "⏹ Stop" : "▶ Run"}
          </button>
          <button className="pl-hbtn" onClick={resetLab}>↺ Reset</button>
          {onClose && <button className="pl-hbtn" onClick={onClose}>✕</button>}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="pl-body">

        {/* ── SIDEBAR ── */}
        <aside className="pl-sidebar">
          <div className="pl-sb-section">
            <div className="pl-sb-label">Current Lab</div>
            <div className="pl-lab-name">{lab.name} — {lab.subtitle}</div>
            <div className="pl-lab-obj">{lab.objective}</div>
          </div>
          <div className="pl-sb-section" style={{paddingTop:"10px",paddingBottom:"6px"}}>
            <div className="pl-sb-label">Procedure</div>
          </div>
          <div className="pl-proc-scroll">
            {lab.steps.map((s, i) => (
              <div key={i}>
                <div
                  className={`pl-step ${i===stepIdx?"active":""} ${i<stepIdx?"done":""}`}
                  onClick={()=>setStepIdx(i)}
                >
                  <div className="pl-step-n">{i+1}</div>
                  <div>
                    <div className="pl-step-title">{s.title}</div>
                    <div className="pl-step-desc">{s.desc}</div>
                  </div>
                </div>
                {i===stepIdx && s.question && (
                  <div className="pl-question">{s.question}</div>
                )}
              </div>
            ))}
          </div>
          <div className="pl-sb-status">
            <div className="pl-status-row"><span>Data points</span><span className="pl-status-val">{dataRows.length}</span></div>
            <div className="pl-status-row"><span>Run state</span><span className="pl-status-val">{running?"Running":"Idle"}</span></div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="pl-main">
          <div className="pl-panel-tabs">
            {["theory","apparatus","data","analysis","guide"].map(p => (
              <button key={p} className={`pl-ptab ${panel===p?"active":""}`} onClick={()=>setPanel(p)}>{p}</button>
            ))}
          </div>

          <div className="pl-panels">
            {/* THEORY */}
            <div className={`pl-panel ${panel==="theory"?"active":""}`}>
              <div className="pl-theory-wrap">
                <div dangerouslySetInnerHTML={{__html: lab.theory()}} />
              </div>
            </div>

            {/* APPARATUS */}
            <div className={`pl-panel ${panel==="apparatus"?"active":""}`}>
              <div className="pl-apparatus">
                <div className="pl-canvas-wrap">
                  <canvas ref={canvasRef} />
                </div>
                <div className="pl-controls">
                  {lab.controls().map(ctrl => (
                    <div key={ctrl.id} className="pl-ctrl-group">
                      <span className="pl-ctrl-label">{ctrl.label}</span>
                      <input
                        type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step}
                        value={state[ctrl.stateKey] ?? ctrl.init}
                        onChange={e => onSlider(ctrl.stateKey, parseFloat(e.target.value))}
                      />
                      <span className="pl-ctrl-val">{ctrl.fmt(state[ctrl.stateKey] ?? ctrl.init)}</span>
                    </div>
                  ))}
                  <div style={{flex:1}} />
                  <div className="pl-ctrl-group">
                    <button className="pl-rec-btn" onClick={recordPoint}>⊕ Record Point</button>
                  </div>
                </div>
              </div>
            </div>

            {/* DATA */}
            <div className={`pl-panel ${panel==="data"?"active":""}`}>
              <div className="pl-data-wrap">
                <div className="pl-data-header">
                  <div>
                    <div className="pl-panel-title">{lab.name} — Data Table</div>
                    <div className="pl-panel-sub">{dataRows.length} point{dataRows.length!==1?"s":""} · {Math.max(0,6-dataRows.length)} more recommended</div>
                  </div>
                  <div className="pl-data-actions">
                    <button className="pl-dbtn" onClick={recordPoint}>⊕ Record</button>
                    <button className="pl-dbtn danger" onClick={()=>setDataRows([])}>⊗ Clear</button>
                  </div>
                </div>
                <div className="pl-tbl-wrap">
                  <table className="pl-tbl">
                    <thead>
                      <tr>{sch.cols.map((c,i)=><th key={i}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {dataRows.length===0 ? (
                        <tr><td colSpan={sch.cols.length} style={{textAlign:"center",color:"var(--text3)",padding:"20px"}}>
                          No data recorded — go to Apparatus and click Record Point
                        </td></tr>
                      ) : dataRows.map((row,i)=>(
                        <tr key={i}>
                          <td className="ci">{i+1}</td>
                          {row.map((cell,j)=>(
                            <td key={j} className={sch.types[j+1]==="measured"?"cm":sch.types[j+1]==="derived"?"cd":""}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pl-data-note">
                  <span style={{color:"var(--blue)"}}>■ Blue = measured</span> &nbsp;·&nbsp;
                  <span style={{color:"var(--amber)"}}>■ Amber = derived/calculated</span>
                </div>
              </div>
            </div>

            {/* ANALYSIS */}
            <div className={`pl-panel ${panel==="analysis"?"active":""}`}>
              <div className="pl-analysis-wrap">
                <div className="pl-data-header" style={{marginBottom:"16px"}}>
                  <div>
                    <div className="pl-panel-title">{lab.analyzeSetup.title}</div>
                    <div className="pl-panel-sub">{dataRows.length} points available</div>
                  </div>
                  <button className="pl-plot-btn" onClick={doPlot}>Plot & Fit Linear Regression</button>
                </div>
                <div className="pl-analysis-layout">
                  <div className="pl-plot-outer">
                    <canvas ref={plotRef} width={600} height={450} />
                  </div>
                  <div className="pl-analysis-right">
                    {regResult ? (
                      <>
                        <div className="pl-result-card">
                          <div className="pl-result-title">Regression Results</div>
                          <div className="pl-result-row"><span className="pl-rk">Slope</span><span className="pl-rv">{regResult.slope.toFixed(6)}</span></div>
                          <div className="pl-result-row"><span className="pl-rk">Intercept</span><span className="pl-rv">{regResult.intercept.toFixed(6)}</span></div>
                          <div className="pl-result-row"><span className="pl-rk">R²</span><span className={`pl-rv ${regResult.r2>0.99?"good":"warn"}`}>{regResult.r2.toFixed(6)}</span></div>
                          <div className="pl-result-row"><span className="pl-rk">{regResult.res.label}</span><span className="pl-rv">{regResult.res.value} {regResult.res.unit}</span></div>
                          <div className="pl-result-row"><span className="pl-rk">Theory</span><span className="pl-rv theory">{regResult.res.theory} {regResult.res.unit}</span></div>
                          <div className="pl-result-row"><span className="pl-rk">% Error</span><span className={`pl-rv ${parseFloat(regResult.res.pctError)<2?"good":parseFloat(regResult.res.pctError)<5?"":"warn"}`}>{regResult.res.pctError}%</span></div>
                        </div>
                        <div className="pl-analysis-insight" dangerouslySetInnerHTML={{__html:lab.analysisInsight(regResult.slope,regResult.intercept,regResult.r2,state)}} />
                      </>
                    ) : (
                      <div className="pl-result-card">
                        <div className="pl-result-title">Ready to Plot</div>
                        <div style={{color:"var(--text3)",fontSize:"12px"}}>
                          {dataRows.length<2?"Record ≥2 data points first":"Click 'Plot & Fit' to run analysis"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* GUIDE */}
            <div className={`pl-panel ${panel==="guide"?"active":""}`}>
              <div className="pl-theory-wrap">
                <div dangerouslySetInnerHTML={{__html: GUIDES[lab.id] ?? "<div class='pl-guide'><div class='pl-guide-title'>No guide yet for this lab.</div></div>"}} />
              </div>
            </div>

          </div>{/* panels */}
        </div>{/* main */}
      </div>{/* body */}
    </div>
  );
}