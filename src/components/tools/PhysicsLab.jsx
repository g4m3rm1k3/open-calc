import { useState, useRef, useEffect } from "react";

// ── CSS Styles ─────────────────────────────────────
const styles = `
<style>
/* ══════════════════════════════════════════
   PHYSICS LAB STYLES
   ══════════════════════════════════════════ */
:root {
  /* Palette — precision instrument / oscilloscope */
  --bg:         #0b0e12;
  --surface:    #111520;
  --surface2:   #161c2a;
  --surface3:   #1c2435;
  --border:     #252e42;
  --border2:    #1e2738;

  --phosphor:   #00e5a0;   /* main green */
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

  /* Type */
  --mono:  'IBM Plex Mono', 'Courier New', monospace;
  --sans:  'IBM Plex Sans', system-ui, sans-serif;
  --serif: 'IBM Plex Serif', Georgia, serif;

  /* Layout */
  --header-h: 48px;
  --sidebar-w: 220px;
  --controls-h: 72px;
}

/* Header */
header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0;
  z-index: 10;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  height: 100%;
  border-right: 1px solid var(--border);
  flex-shrink: 0;
}
.logo-mark {
  width: 28px; height: 28px;
  border: 2px solid var(--phosphor);
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: var(--phosphor);
  flex-shrink: 0;
}
.logo-text {
  font-family: var(--mono);
  font-size: 13px; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
  color: var(--text-bright);
}

/* Lab tabs in header */
.lab-tabs {
  display: flex;
  height: 100%;
  flex: 1;
  overflow-x: auto;
}
.lab-tabs::-webkit-scrollbar { height: 0; }

.lab-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  height: 100%;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--text3);
  border-right: 1px solid var(--border2);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: color .15s, border-color .15s, background .15s;
  user-select: none;
}
.lab-tab:hover { color: var(--text); background: var(--surface2); }
.lab-tab.active {
  color: var(--phosphor);
  border-bottom-color: var(--phosphor);
  background: var(--phosphor-d);
}
.lab-tab .tab-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: .5;
}
.lab-tab.active .tab-dot { opacity: 1; }

/* Header right actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 100%;
  border-left: 1px solid var(--border);
  flex-shrink: 0;
}
.hbtn {
  font-family: var(--mono);
  font-size: 11px; font-weight: 500;
  letter-spacing: .08em; text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 3px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text2);
  cursor: pointer;
  transition: all .14s;
  white-space: nowrap;
}
.hbtn:hover { border-color: var(--text2); color: var(--text); }
.hbtn.run { border-color: var(--phosphor); color: var(--phosphor); }
.hbtn.run:hover, .hbtn.run.active { background: var(--phosphor); color: var(--bg); }
.hbtn.stop { border-color: var(--red); color: var(--red); }

/* Sidebar */
#sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  overflow: hidden;
}

.sidebar-section {
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border2);
}
.sidebar-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--text3);
  margin-bottom: 6px;
}
.lab-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 2px;
}
.lab-objective {
  font-size: 11px;
  color: var(--text2);
  line-height: 1.5;
}

/* Procedure steps */
.proc-scroll { flex: 1; overflow-y: auto; padding: 8px 0; }
.proc-step {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 14px;
  cursor: pointer;
  transition: background .12s;
  border-left: 2px solid transparent;
}
.proc-step:hover { background: var(--surface2); }
.proc-step.active {
  background: rgba(0,229,160,0.06);
  border-left-color: var(--phosphor);
}
.proc-step.done .step-n { background: var(--phosphor2); color: var(--bg); border-color: var(--phosphor2); }
.step-n {
  width: 20px; height: 20px; flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: var(--text3);
  margin-top: 1px;
}
.step-body { flex: 1; }
.step-title { font-size: 11px; font-weight: 500; color: var(--text); margin-bottom: 1px; }
.step-desc  { font-size: 10px; color: var(--text3); line-height: 1.4; }

/* Sidebar bottom status */
.sidebar-status {
  padding: 10px 14px;
  border-top: 1px solid var(--border2);
  font-size: 10px;
  color: var(--text3);
}
.status-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
.status-val { color: var(--phosphor); font-weight: 500; }

/* Main area */
#main {
  grid-area: main;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}

/* Panel tabs */
.panel-tabs {
  display: flex;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 16px;
  flex-shrink: 0;
}
.ptab {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: uppercase;
  padding: 10px 14px;
  cursor: pointer;
  color: var(--text3);
  border-bottom: 2px solid transparent;
  transition: all .14s;
  user-select: none;
}
.ptab:hover { color: var(--text); }
.ptab.active { color: var(--amber); border-bottom-color: var(--amber); }

/* Panel container */
.panels { flex: 1; overflow: hidden; position: relative; }

/* Each panel */
.panel {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  display: none;
}
.panel.active { display: block; }

/* Theory panel */
#panel-theory { padding: 28px 32px 40px; }

.theory-block { max-width: 760px; margin: 0 auto; }

.theory-h1 {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 6px;
  letter-spacing: -.01em;
}
.theory-sub {
  font-size: 11px;
  color: var(--text3);
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.theory-section { margin-bottom: 32px; }
.theory-h2 {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--amber);
  margin-bottom: 12px;
}
.theory-p {
  font-family: var(--sans);
  font-size: 14px;
  color: var(--text2);
  line-height: 1.8;
  margin-bottom: 12px;
}
.theory-p em { color: var(--text); font-style: italic; }
.theory-p strong { color: var(--text-bright); font-weight: 500; }

/* Equation block */
.eq-block {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-left: 3px solid var(--amber);
  border-radius: 0 4px 4px 0;
  padding: 14px 18px;
  margin: 16px 0;
}
.eq-tag {
  font-size: 9px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--text3);
  margin-bottom: 8px;
}
.eq-formula {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-bright);
  letter-spacing: .04em;
  margin-bottom: 10px;
  font-family: var(--mono);
}
.eq-vars {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.eq-var {
  font-size: 11px;
  padding: 3px 9px;
  background: var(--surface3);
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text2);
}
.eq-var b { color: var(--phosphor); }

/* Live equation row */
.eq-live {
  background: var(--surface3);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 14px 16px;
  margin: 14px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}
.eq-live-label {
  font-size: 10px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--text3);
  width: 100%;
  margin-bottom: -8px;
}
.eq-ctl {
  display: flex;
  align-items: center;
  gap: 8px;
}
.eq-ctl span { font-size: 11px; color: var(--text2); white-space: nowrap; }
.eq-ctl input[type=range] {
  width: 80px;
  accent-color: var(--phosphor);
  cursor: pointer;
}
.eq-ctl .val { color: var(--phosphor); font-weight: 500; min-width: 48px; }
.eq-result {
  font-size: 15px;
  font-weight: 500;
  color: var(--amber);
  padding: 6px 14px;
  background: rgba(245,166,35,0.1);
  border: 1px solid rgba(245,166,35,0.2);
  border-radius: 3px;
  white-space: nowrap;
}
.eq-worked {
  font-size: 12px;
  color: var(--text2);
  padding: 8px 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 3px;
  margin-top: 8px;
  width: 100%;
  font-family: var(--mono);
}
.eq-worked .hl { color: var(--amber); }

/* Insight */
.insight {
  background: rgba(0,229,160,0.05);
  border: 1px solid rgba(0,229,160,0.2);
  border-radius: 4px;
  padding: 12px 14px;
  margin: 14px 0;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--text2);
  line-height: 1.7;
}
.insight-head {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--phosphor);
  margin-bottom: 5px;
  font-family: var(--mono);
}

/* Apparatus panel */
#panel-apparatus {
  display: none;
  flex-direction: column;
  padding: 0;
}
#panel-apparatus.active { display: flex; }

.apparatus-canvas-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}
.apparatus-canvas-wrap canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.apparatus-controls {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--surface);
  border-top: 1px solid var(--border);
  height: var(--controls-h);
  overflow-x: auto;
  padding: 0 16px;
}
.apparatus-controls::-webkit-scrollbar { height: 0; }

.ctrl-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-right: 1px solid var(--border2);
  height: 100%;
  flex-shrink: 0;
}
.ctrl-group:last-child { border-right: none; }
.ctrl-label {
  font-size: 10px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--text3);
  white-space: nowrap;
}
.ctrl-val {
  font-size: 12px;
  font-weight: 500;
  color: var(--phosphor);
  min-width: 44px;
  text-align: right;
  white-space: nowrap;
}
input[type=range] {
  appearance: none;
  width: 90px;
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
input[type=range]::-webkit-slider-thumb {
  appearance: none;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--phosphor);
  cursor: pointer;
}
.ctrl-record-btn {
  font-family: var(--mono);
  font-size: 10px; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 3px;
  border: 1px solid var(--blue);
  background: var(--blue-d);
  color: var(--blue);
  cursor: pointer;
  transition: all .13s;
  white-space: nowrap;
  flex-shrink: 0;
}
.ctrl-record-btn:hover { background: var(--blue); color: var(--bg); }

/* Data panel */
#panel-data { padding: 24px 28px; }

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
  letter-spacing: -.01em;
}
.panel-sub {
  font-size: 10px;
  color: var(--text3);
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-top: 2px;
}
.data-actions { display: flex; gap: 8px; }
.dbtn {
  font-family: var(--mono);
  font-size: 10px; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase;
  padding: 5px 12px;
  border-radius: 3px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text2);
  cursor: pointer;
  transition: all .13s;
}
.dbtn:hover { border-color: var(--text2); color: var(--text); }
.dbtn.danger:hover { border-color: var(--red); color: var(--red); }

.data-table-wrap { overflow-x: auto; margin-bottom: 16px; }
.dtable {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.dtable thead tr {
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
}
.dtable th {
  padding: 8px 14px;
  text-align: left;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--text3);
  white-space: nowrap;
}
.dtable td {
  padding: 7px 14px;
  border-bottom: 1px solid var(--border2);
  color: var(--text2);
  font-family: var(--mono);
}
.dtable tr:hover td { background: var(--surface2); }
.dtable td.c-measured { color: var(--blue); }
.dtable td.c-derived  { color: var(--amber); }
.dtable td.c-index    { color: var(--text3); }

.data-note {
  font-size: 11px;
  color: var(--text3);
  padding: 10px 14px;
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 4px;
  line-height: 1.6;
}
.data-note .c-measured { color: var(--blue); }
.data-note .c-derived  { color: var(--amber); }

/* Analysis panel */
#panel-analysis { padding: 24px 28px; }

.analysis-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  max-width: 1100px;
}
@media (max-width: 900px) { .analysis-layout { grid-template-columns: 1fr; } }

.plot-wrap {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 4/3;
  position: relative;
}
.plot-wrap canvas { width: 100%; height: 100%; display: block; }

.analysis-right { display: flex; flex-direction: column; gap: 14px; }

.result-card {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 14px 16px;
}
.result-card-title {
  font-size: 9px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--text3);
  margin-bottom: 10px;
}
.result-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 5px 0;
  border-bottom: 1px solid var(--border2);
  font-size: 12px;
}
.result-row:last-child { border-bottom: none; }
.result-key { color: var(--text2); }
.result-val { color: var(--phosphor); font-weight: 500; }
.result-val.theory { color: var(--amber); }
.result-val.good { color: var(--phosphor); }
.result-val.warn { color: var(--red); }

.analysis-insight {
  background: rgba(0,229,160,0.04);
  border: 1px solid rgba(0,229,160,0.15);
  border-radius: 4px;
  padding: 12px 14px;
  font-family: var(--sans);
  font-size: 12px;
  color: var(--text2);
  line-height: 1.7;
}
.analysis-insight strong { color: var(--phosphor); }

.plot-btn {
  font-family: var(--mono);
  font-size: 11px; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase;
  padding: 8px 18px;
  border-radius: 3px;
  border: 1px solid var(--phosphor);
  background: rgba(0,229,160,0.1);
  color: var(--phosphor);
  cursor: pointer;
  transition: all .13s;
  width: 100%;
}
.plot-btn:hover { background: var(--phosphor); color: var(--bg); }

/* Utility */
.gap { flex: 1; }
.tag {
  display: inline-block;
  font-size: 9px; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase;
  padding: 2px 7px; border-radius: 2px;
  background: var(--surface3); color: var(--text3);
  margin-right: 4px; margin-bottom: 4px;
  border: 1px solid var(--border);
}
</style>
`;

// ── Lab Data ─────────────────────────────────────
const LABS = [
  {
    id: "pendulum",
    name: "Simple Pendulum",
    subtitle: "Measuring g via Period Analysis",
    objective:
      "Measure T for varying L. Plot T² vs L to extract g from the slope.",
    category: "Mechanics",
    steps: [
      {
        title: "Read theory",
        desc: "Understand SHM and the period equation T = 2π√(L/g).",
      },
      {
        title: "Set length",
        desc: "Use the L slider in Apparatus to set the string length.",
      },
      {
        title: "Measure period",
        desc: "Run the simulation. Record T. The DRO shows the live value.",
      },
      {
        title: "Vary length",
        desc: "Change L across the full range. Record ≥6 data points.",
      },
      {
        title: "Plot T² vs L",
        desc: "Go to Analysis → Plot & Fit. Slope = 4π²/g.",
      },
      {
        title: "Extract g",
        desc: "Calculate g = 4π²/slope. Find % error vs 9.81 m/s².",
      },
    ],
    theory: () => `
<div class="theory-block">
  <div class="theory-h1">The Simple Pendulum</div>
  <div class="theory-sub">Mechanics · Simple Harmonic Motion · Dimensional Analysis</div>

  <div class="theory-section">
    <div class="theory-h2">Background</div>
    <p class="theory-p">A simple pendulum is a mass <em>m</em> on a string of length <em>L</em>, free to swing about a pivot. For small angles (θ &lt; 15°), the restoring force is approximately proportional to displacement — the defining condition of <em>Simple Harmonic Motion</em> (SHM).</p>
    <p class="theory-p">Applying Newton's second law along the arc gives the equation of motion. The key result is that the <strong>period depends only on L and g</strong> — not on mass or amplitude.</p>
  </div>

  <div class="theory-section">
    <div class="theory-h2">Derivation</div>
    <p class="theory-p">The tangential restoring acceleration is a = −g sinθ ≈ −gθ (small angle). In terms of arc length s = Lθ:</p>
    <div class="eq-block">
      <div class="eq-tag">Equation of motion</div>
      <div class="eq-formula">d²θ/dt² = −(g/L) · θ</div>
      <div class="eq-vars">
        <span class="eq-var"><b>θ</b> angular displacement</span>
        <span class="eq-var"><b>g</b> 9.81 m/s²</span>
        <span class="eq-var"><b>L</b> string length (m)</span>
      </div>
    </div>
    <p class="theory-p">This ODE has solution θ(t) = θ₀·cos(ωt + φ), with angular frequency ω = √(g/L). The period T = 2π/ω:</p>
    <div class="eq-block">
      <div class="eq-tag">Period — the key result</div>
      <div class="eq-formula">T = 2π √(L/g)</div>
    </div>
    <p class="theory-p">Squaring: T² = (4π²/g)·L. This is linear in L. The slope m = 4π²/g, so g = 4π²/m.</p>
  </div>

  <div class="theory-section">
    <div class="theory-h2">Live Calculator</div>
    <div class="eq-live" id="pend-live">
      <div class="eq-live-label">Adjust parameters to see the period update</div>
      <div class="eq-ctl">
        <span>L =</span>
        <input type="range" min="0.1" max="2" step="0.01" value="1" oninput="LIVE.pendulum()" id="pLive-L">
        <span class="val" id="pLive-Lv">1.00 m</span>
      </div>
      <div class="eq-ctl">
        <span>g =</span>
        <input type="range" min="1.62" max="24.8" step="0.01" value="9.81" oninput="LIVE.pendulum()" id="pLive-g">
        <span class="val" id="pLive-gv">9.81 m/s²</span>
      </div>
      <div class="eq-result">T = <span id="pLive-T">2.006 s</span></div>
      <div class="eq-worked" id="pLive-w">T = 2π √(1.00 / 9.81) = 2.006 s</div>
    </div>
    <p class="theory-p" style="font-size:12px;color:var(--text3)">Notice: doubling L increases T by √2 ≈ 1.41, not 2. The ½ power of L is why T is insensitive to large changes in length.</p>
  </div>

  <div class="theory-section">
    <div class="theory-h2">Key Insights</div>
    <div class="insight">
      <div class="insight-head">Independence of mass</div>
      Mass m appears in both the restoring force (F = mg sinθ) and Newton's second law (F = ma). They cancel exactly. A 1 g pendulum and a 1 kg pendulum of the same length have identical periods — confirmed to extraordinary precision.
    </div>
    <div class="insight">
      <div class="insight-head">Why g varies with location</div>
      Earth is oblate (flattened at the poles). At the poles, you are closer to Earth's center, so g ≈ 9.832 m/s². At the equator, g ≈ 9.780 m/s² — both centrifugal effects and the greater distance reduce g. Pendulum clocks must be recalibrated when moved to different latitudes.
    </div>
    <div class="insight">
      <div class="insight-head">Small-angle limitation</div>
      For θ₀ = 30°, the true period is about 2% longer than the small-angle formula predicts. For θ₀ = 60°, the error is ~7%. In this lab, keep θ₀ &lt; 15° for accurate results.
    </div>
  </div>
</div>`,
    initState: () => ({ L: 1.0, theta0: 10, phase: 0, t: 0, omega: 0 }),
    drawApparatus: (ctx, W, H, state, running, dt) => {
      const g = 9.81;
      state.omega = Math.sqrt(g / state.L);
      if (running) state.phase += dt * state.omega;

      const theta = ((state.theta0 * Math.PI) / 180) * Math.cos(state.phase);
      const pivX = W / 2,
        pivY = H * 0.1;
      const scale = Math.min(W, H) * 0.55;
      const Lpx = state.L * scale;
      const bx = pivX + Lpx * Math.sin(theta);
      const by = pivY + Lpx * Math.cos(theta);

      // Background
      ctx.fillStyle = "#0b0e12";
      ctx.fillRect(0, 0, W, H);
      // Grid
      ctx.strokeStyle = "rgba(0,229,160,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Support beam
      ctx.fillStyle = "#252e42";
      ctx.fillRect(pivX - 50, pivY - 18, 100, 18);
      ctx.fillStyle = "#4a5a72";
      ctx.fillRect(pivX - 3, pivY - 18, 6, 18);

      // Angle arc
      if (!running) {
        ctx.beginPath();
        const a0 = -Math.PI / 2,
          a1 = a0 + (state.theta0 * Math.PI) / 180;
        ctx.arc(pivX, pivY, 48, a0, a1);
        ctx.strokeStyle = "rgba(245,166,35,0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#f5a623";
        ctx.font = "11px IBM Plex Mono, monospace";
        ctx.fillText("θ₀=" + state.theta0 + "°", pivX + 52, pivY + 12);
      }

      // Vertical reference
      ctx.beginPath();
      ctx.moveTo(pivX, pivY);
      ctx.lineTo(pivX, pivY + Lpx + 30);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // String
      ctx.beginPath();
      ctx.moveTo(pivX, pivY);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = "#4a5a72";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Length label
      const mx = (pivX + bx) / 2 + 10,
        my = (pivY + by) / 2;
      ctx.fillStyle = "#4a5a72";
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText("L=" + state.L.toFixed(2) + "m", mx, my);

      // Pivot
      ctx.beginPath();
      ctx.arc(pivX, pivY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#8a9ab5";
      ctx.fill();

      // Ball
      const br = 14;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(
        bx - br * 0.35,
        by - br * 0.35,
        1,
        bx,
        by,
        br,
      );
      grad.addColorStop(0, "#a0c0e0");
      grad.addColorStop(1, "#253550");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "#4da6ff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // DRO readout
      const T = (2 * Math.PI) / state.omega;
      const T2 = T * T;
      const dro = [
        ["L (m)", state.L.toFixed(4)],
        ["θ₀ (°)", state.theta0.toFixed(1)],
        ["T (s)", T.toFixed(4)],
        ["T² (s²)", T2.toFixed(4)],
        ["ω (rad/s)", state.omega.toFixed(4)],
      ];
      ctx.fillStyle = "rgba(17,21,32,0.85)";
      ctx.fillRect(W - 190, 14, 176, 16 + dro.length * 20);
      dro.forEach(([k, v], i) => {
        ctx.font = "11px IBM Plex Mono, monospace";
        ctx.fillStyle = "#4a5a72";
        ctx.fillText(k, W - 184, 30 + i * 20);
        ctx.fillStyle = "#00e5a0";
        ctx.textAlign = "right";
        ctx.fillText(v, W - 18, 30 + i * 20);
        ctx.textAlign = "left";
      });
    },
    controls: () => [
      {
        id: "c-L",
        label: "Length L (m)",
        min: 0.1,
        max: 2.0,
        step: 0.01,
        init: 1.0,
        stateKey: "L",
        fmt: (v) => v.toFixed(2),
      },
      {
        id: "c-A",
        label: "Angle θ₀ (°)",
        min: 2,
        max: 14,
        step: 1,
        init: 10,
        stateKey: "theta0",
        fmt: (v) => v.toFixed(0),
      },
    ],
    recordPoint: (state) => {
      const g = 9.81;
      const omega = Math.sqrt(g / state.L);
      const T = ((2 * Math.PI) / omega) * (1 + (Math.random() - 0.5) * 0.002);
      const T2 = T * T;
      const g_exp = (4 * Math.PI ** 2 * state.L) / T2;
      return [
        state.L.toFixed(3),
        T.toFixed(4),
        T2.toFixed(4),
        g_exp.toFixed(4),
      ];
    },
    dataSchema: {
      cols: ["#", "L (m)", "T (s)", "T² (s²)", "g_exp (m/s²)"],
      types: ["index", "measured", "measured", "derived", "derived"],
    },
    analyzeSetup: {
      xi: 1,
      yi: 3,
      xLabel: "L (m)",
      yLabel: "T² (s²)",
      title: "T² vs L",
    },
    analysisInsight: (slope, intercept, r2) => {
      const g_exp = (4 * Math.PI ** 2) / slope;
      const err = Math.abs(((g_exp - 9.81) / 9.81) * 100);
      return `<strong>Extracted g = ${g_exp.toFixed(3)} m/s²</strong> — theoretical 9.810 m/s², error ${err.toFixed(2)}%. The slope of T² vs L equals 4π²/g, giving us g from a purely mechanical measurement. R² = ${r2.toFixed(5)} confirms the linear relationship predicted by theory.`;
    },
    theoryResult: (slope) => ({
      label: "g (measured)",
      value: ((4 * Math.PI ** 2) / slope).toFixed(4),
      unit: "m/s²",
      theory: "9.8100",
      pctError: Math.abs(
        (((4 * Math.PI ** 2) / slope - 9.81) / 9.81) * 100,
      ).toFixed(2),
    }),
  },
  {
    id: "snell",
    name: "Snell's Law",
    subtitle: "Refraction and Refractive Index",
    objective:
      "Measure θ₂ for multiple θ₁. Plot sin θ₂ vs sin θ₁. Slope = 1/n₂.",
    category: "Optics",
    steps: [
      {
        title: "Read theory",
        desc: "Understand Snell's Law: n₁sinθ₁ = n₂sinθ₂.",
      },
      {
        title: "Set medium",
        desc: "Choose the refractive index n₂ (glass, water, diamond…).",
      },
      {
        title: "Vary incident angle",
        desc: "Change θ₁ from 10° to 70° in 10° steps.",
      },
      {
        title: "Record θ₂",
        desc: "Read the refracted angle from the diagram. Record both.",
      },
      {
        title: "Plot sin θ₂ vs sin θ₁",
        desc: "Slope = n₁/n₂ = 1/n₂ (if n₁=1).",
      },
      {
        title: "Find critical angle",
        desc: "Increase θ₁ until Total Internal Reflection occurs.",
      },
    ],
    theory: () => `
<div class="theory-block">
  <div class="theory-h1">Snell's Law & Refraction</div>
  <div class="theory-sub">Optics · Wave Propagation · Refractive Index</div>
  <div class="theory-section">
    <div class="theory-h2">Background</div>
    <p class="theory-p">When light crosses the boundary between two media, it changes speed. Since the wavefronts must remain continuous, the change in speed requires a change in direction — <em>refraction</em>. The relationship between angles is governed by Snell's Law (Willebrord Snell, 1621).</p>
  </div>
  <div class="theory-section">
    <div class="theory-h2">Snell's Law</div>
    <div class="eq-block">
      <div class="eq-tag">Snell's Law</div>
      <div class="eq-formula">n₁ · sin θ₁ = n₂ · sin θ₂</div>
      <div class="eq-vars">
        <span class="eq-var"><b>n₁</b> index of incident medium</span>
        <span class="eq-var"><b>n₂</b> index of refractive medium</span>
        <span class="eq-var"><b>θ₁</b> angle of incidence (from normal)</span>
        <span class="eq-var"><b>θ₂</b> angle of refraction (from normal)</span>
      </div>
    </div>
    <p class="theory-p">The refractive index n = c/v, where c is the speed of light in vacuum and v in the medium. Glass has n ≈ 1.5, meaning light travels at c/1.5 ≈ 2×10⁸ m/s.</p>
  </div>
  <div class="theory-section">
    <div class="theory-h2">Live Calculator</div>
    <div class="eq-live">
      <div class="eq-live-label">Adjust to see refraction in real time</div>
      <div class="eq-ctl">
        <span>θ₁ =</span>
        <input type="range" min="1" max="85" step="1" value="30" oninput="LIVE.snell()" id="sLive-t1">
        <span class="val" id="sLive-t1v">30°</span>
      </div>
      <div class="eq-ctl">
        <span>n₂ =</span>
        <input type="range" min="1.0" max="2.5" step="0.05" value="1.5" oninput="LIVE.snell()" id="sLive-n2">
        <span class="val" id="sLive-n2v">1.50</span>
      </div>
      <div class="eq-result">θ₂ = <span id="sLive-t2">19.5°</span></div>
      <div class="eq-worked" id="sLive-w">1.00·sin(30°) = 1.50·sin(θ₂)  →  θ₂ = 19.5°</div>
    </div>
  </div>
  <div class="theory-section">
    <div class="theory-h2">Total Internal Reflection</div>
    <div class="eq-block">
      <div class="eq-tag">Critical angle (n₁ > n₂)</div>
      <div class="eq-formula">sin θ_c = n₂ / n₁</div>
    </div>
    <div class="insight">
      <div class="insight-head">Optical fibres</div>
      Total internal reflection keeps light trapped inside a glass fibre. With n_glass ≈ 1.46 and n_cladding ≈ 1.44, θ_c ≈ 80°. Any ray shallower than 10° from the axis is totally reflected — light travels around bends with virtually no loss.
    </div>
  </div>
</div>`,
    initState: () => ({ theta1: 30, n2: 1.5 }),
    drawApparatus: (ctx, W, H, state) => {
      const cx = W / 2,
        cy = H / 2;
      const t1r = (state.theta1 * Math.PI) / 180;
      const sinT2 = Math.sin(t1r) / state.n2;
      const TIR = sinT2 >= 1;
      const t2r = TIR ? 0 : Math.asin(sinT2);
      const rayLen = Math.min(W, H) * 0.38;

      ctx.fillStyle = "#0b0e12";
      ctx.fillRect(0, 0, W, H);
      // Medium 1 (air)
      ctx.fillStyle = "rgba(77,166,255,0.03)";
      ctx.fillRect(0, 0, W, cy);
      // Medium 2
      ctx.fillStyle = TIR ? "rgba(224,80,80,0.06)" : "rgba(0,229,160,0.05)";
      ctx.fillRect(0, cy, W, H - cy);

      // Boundary
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(W, cy);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Labels
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillStyle = "rgba(77,166,255,0.6)";
      ctx.fillText("n₁ = 1.00  (air)", 14, cy - 10);
      ctx.fillStyle = TIR ? "rgba(224,80,80,0.7)" : "rgba(0,229,160,0.5)";
      ctx.fillText("n₂ = " + state.n2.toFixed(2), 14, cy + 22);

      // Normal
      ctx.beginPath();
      ctx.moveTo(cx, cy - H * 0.42);
      ctx.lineTo(cx, cy + H * 0.42);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "10px IBM Plex Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("normal", cx, cy - H * 0.44);
      ctx.textAlign = "left";

      // Incident ray
      const ix = -Math.sin(t1r) * rayLen,
        iy = -Math.cos(t1r) * rayLen;
      ctx.beginPath();
      ctx.moveTo(cx + ix, cy + iy);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = "#f5a623";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Angle arc + label
      ctx.beginPath();
      ctx.arc(cx, cy, 46, -Math.PI / 2, -Math.PI / 2 + t1r);
      ctx.strokeStyle = "rgba(245,166,35,0.5)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = "#f5a623";
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText(
        "θ₁=" + state.theta1 + "°",
        cx + 50 * Math.sin(t1r / 2) + 4,
        cy - 48 * Math.cos(t1r / 2) + 4,
      );

      if (!TIR) {
        // Refracted ray
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(t2r) * rayLen, cy + Math.cos(t2r) * rayLen);
        ctx.strokeStyle = "#00e5a0";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 46, Math.PI / 2, Math.PI / 2 + t2r);
        ctx.strokeStyle = "rgba(0,229,160,0.5)";
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.fillStyle = "#00e5a0";
        ctx.fillText(
          "θ₂=" + ((t2r * 180) / Math.PI).toFixed(1) + "°",
          cx + 50 * Math.sin(t2r / 2) + 4,
          cy + 48 * Math.cos(t2r / 2) + 4,
        );
      } else {
        // TIR
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - Math.sin(t1r) * rayLen, cy - Math.cos(t1r) * rayLen);
        ctx.strokeStyle = "#e05050";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = "#e05050";
        ctx.font = "bold 13px IBM Plex Sans, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Total Internal Reflection", cx, cy + 38);
        const tc = (Math.asin(1 / state.n2) * 180) / Math.PI;
        ctx.font = "11px IBM Plex Mono, monospace";
        ctx.fillText("θ_c = " + tc.toFixed(1) + "°   (θ₁ > θ_c)", cx, cy + 56);
        ctx.textAlign = "left";
      }

      // Verification
      const lhs = Math.sin(t1r).toFixed(4);
      const rhs = TIR ? "—" : (state.n2 * Math.sin(t2r)).toFixed(4);
      ctx.fillStyle = "rgba(17,21,32,0.85)";
      ctx.fillRect(14, H - 52, 260, 38);
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillStyle = "#4a5a72";
      ctx.fillText("n₁ sin θ₁ =", 20, H - 36);
      ctx.fillStyle = "#f5a623";
      ctx.fillText(lhs, 118, H - 36);
      ctx.fillStyle = "#4a5a72";
      ctx.fillText("n₂ sin θ₂ =", 20, H - 18);
      ctx.fillStyle = "#00e5a0";
      ctx.fillText(rhs, 118, H - 18);
    },
    controls: () => [
      {
        id: "c-t1",
        label: "Incident θ₁ (°)",
        min: 5,
        max: 85,
        step: 1,
        init: 30,
        stateKey: "theta1",
        fmt: (v) => v.toFixed(0),
      },
      {
        id: "c-n2",
        label: "Index n₂",
        min: 1.05,
        max: 2.5,
        step: 0.05,
        init: 1.5,
        stateKey: "n2",
        fmt: (v) => v.toFixed(2),
      },
    ],
    recordPoint: (state) => {
      const t1r = (state.theta1 * Math.PI) / 180;
      const sinT2 = Math.sin(t1r) / state.n2;
      if (sinT2 >= 1) return null;
      const t2r = Math.asin(sinT2);
      const t2 = (t2r * 180) / Math.PI + (Math.random() - 0.5) * 0.2;
      return [
        state.theta1.toFixed(1),
        t2.toFixed(2),
        Math.sin(t1r).toFixed(5),
        Math.sin((t2 * Math.PI) / 180).toFixed(5),
      ];
    },
    dataSchema: {
      cols: ["#", "θ₁ (°)", "θ₂ (°)", "sin θ₁", "sin θ₂"],
      types: ["index", "measured", "measured", "derived", "derived"],
    },
    analyzeSetup: {
      xi: 3,
      yi: 4,
      xLabel: "sin θ₁",
      yLabel: "sin θ₂",
      title: "sin θ₂ vs sin θ₁",
    },
    analysisInsight: (slope, intercept, r2, state) => {
      const n2_exp = 1 / slope;
      const err = Math.abs(((n2_exp - state.n2) / state.n2) * 100);
      return `<strong>Measured n₂ = ${n2_exp.toFixed(3)}</strong> (set: ${state.n2.toFixed(2)}, error ${err.toFixed(2)}%). Slope = sin θ₂ / sin θ₁ = n₁/n₂ = 1/n₂ since n₁=1. R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope, state) => ({
      label: "n₂ (measured)",
      value: (1 / slope).toFixed(4),
      unit: "(dimensionless)",
      theory: state.n2.toFixed(4),
      pctError: Math.abs(((1 / slope - state.n2) / state.n2) * 100).toFixed(2),
    }),
  },
  {
    id: "ohm",
    name: "Ohm's Law",
    subtitle: "I–V Characteristics & Resistance",
    objective: "Plot I vs V for a resistor. Slope = 1/R = G. Verify Ohm's Law.",
    category: "Electromagnetism",
    steps: [
      {
        title: "Read theory",
        desc: "Understand V = IR and the I–V characteristic of an ohmic conductor.",
      },
      {
        title: "Set resistance",
        desc: "Choose a component resistance R. Note component tolerance (±5%).",
      },
      {
        title: "Vary voltage",
        desc: "Step V from 0 to 12 V. Record I from the ammeter at each step.",
      },
      {
        title: "Record 8 points",
        desc: "Use ≥8 voltage steps for a reliable linear fit.",
      },
      {
        title: "Plot I vs V",
        desc: "Slope = G = 1/R. Y-intercept should be ~0 (Ohmic).",
      },
      {
        title: "Calculate R",
        desc: "R = 1/slope. Compare to set value. Find % error.",
      },
    ],
    theory: () => `
<div class="theory-block">
  <div class="theory-h1">Ohm's Law</div>
  <div class="theory-sub">Electromagnetism · DC Circuits · Conductance</div>
  <div class="theory-section">
    <div class="theory-h2">Statement</div>
    <p class="theory-p">Ohm's law states that the current through a conductor between two points is directly proportional to the voltage across the two points. This relationship is linear for many materials, particularly metals, and is expressed mathematically as:</p>
    <div class="eq-block">
      <div class="eq-tag">Ohm's Law</div>
      <div class="eq-formula">V = I × R</div>
      <div class="eq-vars">
        <span class="eq-var"><b>V</b> voltage (volts)</span>
        <span class="eq-var"><b>I</b> current (amperes)</span>
        <span class="eq-var"><b>R</b> resistance (ohms)</span>
      </div>
    </div>
    <p class="theory-p">The constant of proportionality R is called the <em>resistance</em> of the conductor. Materials that obey Ohm's law are called <em>ohmic</em> conductors.</p>
  </div>
  <div class="theory-section">
    <div class="theory-h2">Conductance</div>
    <p class="theory-p">The reciprocal of resistance is called <em>conductance</em> (G):</p>
    <div class="eq-block">
      <div class="eq-tag">Conductance</div>
      <div class="eq-formula">G = 1/R</div>
    </div>
    <p class="theory-p">From Ohm's law: I = V/R = G × V. So the slope of an I–V plot equals the conductance G.</p>
  </div>
  <div class="theory-section">
    <div class="theory-h2">Live Calculator</div>
    <div class="eq-live">
      <div class="eq-live-label">Adjust voltage and resistance to see current</div>
      <div class="eq-ctl">
        <span>V =</span>
        <input type="range" min="0" max="12" step="0.1" value="6" oninput="LIVE.ohm()" id="oLive-V">
        <span class="val" id="oLive-Vv">6.0 V</span>
      </div>
      <div class="eq-ctl">
        <span>R =</span>
        <input type="range" min="10" max="1000" step="10" value="100" oninput="LIVE.ohm()" id="oLive-R">
        <span class="val" id="oLive-Rv">100 Ω</span>
      </div>
      <div class="eq-result">I = <span id="oLive-I">0.060 A</span></div>
      <div class="eq-worked" id="oLive-w">I = V/R = 6.0 / 100 = 0.060 A</div>
    </div>
  </div>
  <div class="theory-section">
    <div class="theory-h2">Key Insights</div>
    <div class="insight">
      <div class="insight-head">Ohmic vs Non-Ohmic</div>
      Not all materials obey Ohm's law. For example, the resistance of a filament bulb increases with temperature, so its I–V characteristic is curved. The resistance of a diode depends on the direction of current flow.
    </div>
    <div class="insight">
      <div class="insight-head">Superconductivity</div>
      At very low temperatures, some materials exhibit zero resistance. This phenomenon, called superconductivity, was discovered by Heike Kamerlingh Onnes in 1911. Modern applications include MRI machines and particle accelerators.
    </div>
  </div>
</div>`,
    initState: () => ({ V: 6, R: 100 }),
    drawApparatus: (ctx, W, H, state) => {
      const cx = W / 2,
        cy = H / 2;
      const I = state.V / state.R;

      ctx.fillStyle = "#0b0e12";
      ctx.fillRect(0, 0, W, H);

      // Circuit diagram
      const scale = Math.min(W, H) * 0.3;

      // Battery
      ctx.strokeStyle = "#4a5a72";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        cx - scale * 0.8,
        cy - scale * 0.3,
        scale * 1.6,
        scale * 0.6,
      );
      ctx.fillStyle = "#4a5a72";
      ctx.font = "bold 14px IBM Plex Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("V = " + state.V.toFixed(1) + "V", cx, cy + scale * 0.8);

      // Wires
      ctx.beginPath();
      ctx.moveTo(cx - scale * 2, cy);
      ctx.lineTo(cx - scale * 0.8, cy);
      ctx.moveTo(cx + scale * 0.8, cy);
      ctx.lineTo(cx + scale * 2, cy);
      ctx.stroke();

      // Resistor
      ctx.strokeStyle = "#e05050";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.6, cy);
      for (let i = 0; i < 5; i++) {
        const x = cx - scale * 0.6 + (i * scale * 1.2) / 5;
        const y = cy + (i % 2 === 0 ? -scale * 0.1 : scale * 0.1);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(cx + scale * 0.6, cy);
      ctx.stroke();
      ctx.fillStyle = "#e05050";
      ctx.font = "12px IBM Plex Mono, monospace";
      ctx.fillText("R = " + state.R + "Ω", cx, cy - scale * 0.5);

      // Ammeter
      ctx.strokeStyle = "#00e5a0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx + scale * 1.5, cy, scale * 0.3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "#00e5a0";
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText("A", cx + scale * 1.5, cy + 3);
      ctx.fillText(
        "I = " + I.toFixed(3) + "A",
        cx + scale * 1.5,
        cy + scale * 0.6,
      );

      // Voltmeter
      ctx.strokeStyle = "#4da6ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - scale * 1.5, cy, scale * 0.3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "#4da6ff";
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText("V", cx - scale * 1.5, cy + 3);
      ctx.fillText(
        "V = " + state.V.toFixed(1) + "V",
        cx - scale * 1.5,
        cy + scale * 0.6,
      );

      // I-V plot
      const plotX = W * 0.75,
        plotY = H * 0.2,
        plotW = W * 0.2,
        plotH = H * 0.4;
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.strokeRect(plotX, plotY, plotW, plotH);
      ctx.fillStyle = "#4a5a72";
      ctx.font = "10px IBM Plex Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("I vs V", plotX + plotW / 2, plotY - 5);
      ctx.textAlign = "left";
    },
    controls: () => [
      {
        id: "c-V",
        label: "Voltage V (V)",
        min: 0,
        max: 12,
        step: 0.1,
        init: 6,
        stateKey: "V",
        fmt: (v) => v.toFixed(1),
      },
      {
        id: "c-R",
        label: "Resistance R (Ω)",
        min: 10,
        max: 1000,
        step: 10,
        init: 100,
        stateKey: "R",
        fmt: (v) => v.toFixed(0),
      },
    ],
    recordPoint: (state) => {
      const I = state.V / state.R + (Math.random() - 0.5) * 0.001;
      return [state.V.toFixed(2), I.toFixed(4)];
    },
    dataSchema: {
      cols: ["#", "V (V)", "I (A)"],
      types: ["index", "measured", "measured"],
    },
    analyzeSetup: {
      xi: 1,
      yi: 2,
      xLabel: "V (V)",
      yLabel: "I (A)",
      title: "I vs V",
    },
    analysisInsight: (slope, intercept, r2, state) => {
      const R_exp = 1 / slope;
      const err = Math.abs(((R_exp - state.R) / state.R) * 100);
      return `<strong>Measured R = ${R_exp.toFixed(1)} Ω</strong> (set: ${state.R} Ω, error ${err.toFixed(2)}%). Slope = I/V = 1/R = G. Y-intercept = ${intercept.toFixed(4)} A (should be ~0 for ohmic conductor). R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope, state) => ({
      label: "R (measured)",
      value: (1 / slope).toFixed(1),
      unit: "Ω",
      theory: state.R.toFixed(1),
      pctError: Math.abs(((1 / slope - state.R) / state.R) * 100).toFixed(2),
    }),
  },
  {
    id: "cooling",
    name: "Newton's Cooling",
    subtitle: "Exponential Decay & Time Constant",
    objective: "Record T(t). Plot ln(T−Tₐ) vs t. Slope = −k. Find τ = 1/k.",
    category: "Thermodynamics",
    steps: [
      { title: "Read theory", desc: "Understand dT/dt = −k(T−Tₐ) and exponential solution." },
      { title: "Set conditions", desc: "Set initial T₀ and ambient Tₐ." },
      { title: "Start cooling", desc: "Run. Temperature falls — record T every 10s." },
      { title: "Fill table", desc: "Record ≥8 points spanning 2–3 time constants." },
      { title: "Linearize", desc: "Plot ln(T−Tₐ) vs t. Slope = −k." },
      { title: "Find τ", desc: "τ = 1/k. Verify T reaches Tₐ + ΔT/e at t = τ." },
    ],
    theory: () => `
<div class="theory-block">
  <div class="theory-h1">Newton's Law of Cooling</div>
  <div class="theory-sub">Thermodynamics · Differential Equations · Linearization</div>
  <div class="theory-section">
    <div class="theory-h2">The Law</div>
    <div class="eq-block">
      <div class="eq-tag">Newton's Law of Cooling</div>
      <div class="eq-formula">dT/dt = −k · (T − Tₐ)</div>
      <div class="eq-vars">
        <span class="eq-var"><b>T</b> object temperature (°C)</span>
        <span class="eq-var"><b>Tₐ</b> ambient temperature</span>
        <span class="eq-var"><b>k</b> cooling constant (s⁻¹)</span>
      </div>
    </div>
    <p class="theory-p">This first-order linear ODE has solution T(t) = Tₐ + (T₀ − Tₐ)·e<sup>−kt</sup>.</p>
  </div>
  <div class="theory-section">
    <div class="theory-h2">Linearization</div>
    <p class="theory-p">Define excess temperature ΔT = T − Tₐ. Then taking ln(T−Tₐ):</p>
    <div class="eq-block">
      <div class="eq-tag">Linearized form — key for analysis</div>
      <div class="eq-formula">ln(T − Tₐ) = ln(ΔT₀) − k·t</div>
    </div>
    <p class="theory-p">Plotting ln(T−Tₐ) vs t gives a straight line with <em>slope = −k</em>. This is the standard method used in real labs.</p>
  </div>
  <div class="theory-section">
    <div class="theory-h2">Key Insights</div>
    <div class="insight">
      <div class="insight-head">Time constant τ</div>
      At t = τ = 1/k, the excess temperature falls to ΔT₀/e ≈ 36.8%. After 5τ, it is within ~0.7% of ambient.
    </div>
  </div>
</div>`,
    initState: () => ({ T0: 85, Ta: 20, k: 0.015, t: 0 }),
    drawApparatus: (ctx, W, H, state, running, dt) => {
      if (running) state.t = (state.t || 0) + dt * 6;
      const T = state.Ta + (state.T0 - state.Ta) * Math.exp(-state.k * state.t);
      const tMax = 6 / state.k;
      const TMin = state.Ta - 3, TMax = state.T0 + 5;
      ctx.fillStyle = "#0b0e12";
      ctx.fillRect(0, 0, W, H);
      const pad = { l: 60, r: 20, t: 20, b: 44 };
      const aw = W - pad.l - pad.r, ah = H - pad.t - pad.b;
      const sx = (t) => pad.l + (t / tMax) * aw;
      const sy = (T2) => pad.t + ah * (1 - (T2 - TMin) / (TMax - TMin));
      ctx.strokeStyle = "rgba(0,229,160,0.05)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i <= 6; i++) {
        const x = sx((i * tMax) / 6);
        ctx.beginPath();
        ctx.moveTo(x, pad.t);
        ctx.lineTo(x, pad.t + ah);
        ctx.stroke();
        ctx.fillStyle = "#4a5a72";
        ctx.font = "10px IBM Plex Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText(Math.round((i * tMax) / 6) + "s", x, pad.t + ah + 18);
      }
      for (let i = 0; i <= 5; i++) {
        const TT = TMin + (i * (TMax - TMin)) / 5;
        const y = sy(TT);
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(pad.l + aw, y);
        ctx.stroke();
        ctx.textAlign = "right";
        ctx.fillStyle = "#4a5a72";
        ctx.fillText(TT.toFixed(0) + "°", pad.l - 5, y + 4);
      }
      ctx.beginPath();
      ctx.moveTo(pad.l, sy(state.Ta));
      ctx.lineTo(pad.l + aw, sy(state.Ta));
      ctx.strokeStyle = "rgba(77,166,255,0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#4da6ff";
      ctx.font = "10px IBM Plex Mono, monospace";
      ctx.textAlign = "left";
      ctx.fillText("Tₐ = " + state.Ta + "°C", pad.l + 4, sy(state.Ta) - 6);
      ctx.beginPath();
      const tCur = Math.min(state.t, tMax);
      for (let ti = 0; ti <= tCur; ti += tMax / 300) {
        const Tt = state.Ta + (state.T0 - state.Ta) * Math.exp(-state.k * ti);
        ti === 0 ? ctx.moveTo(sx(ti), sy(Tt)) : ctx.lineTo(sx(ti), sy(Tt));
      }
      ctx.strokeStyle = "#f5a623";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx(tCur), sy(T), 5, 0, Math.PI * 2);
      ctx.fillStyle = "#f5a623";
      ctx.fill();
      ctx.strokeStyle = "#252e42";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t);
      ctx.lineTo(pad.l, pad.t + ah);
      ctx.lineTo(pad.l + aw, pad.t + ah);
      ctx.stroke();
      const tau = 1 / state.k;
      const dro = [
        ["T(t) (°C)", T.toFixed(2)],
        ["t (s)", tCur.toFixed(1)],
        ["ΔT (°C)", (T - state.Ta).toFixed(2)],
        ["τ (s)", tau.toFixed(1)],
        ["T₀ (°C)", state.T0.toFixed(0)],
      ];
      ctx.fillStyle = "rgba(11,14,18,0.9)";
      ctx.fillRect(W - 190, 14, 176, 16 + dro.length * 20);
      dro.forEach(([k, v], i) => {
        ctx.font = "11px IBM Plex Mono, monospace";
        ctx.fillStyle = "#4a5a72";
        ctx.fillText(k, W - 184, 30 + i * 20);
        ctx.fillStyle = "#00e5a0";
        ctx.textAlign = "right";
        ctx.fillText(v, W - 18, 30 + i * 20);
        ctx.textAlign = "left";
      });
    },
    controls: () => [
      { id: "c-T0", label: "Initial T₀ (°C)", min: 40, max: 150, step: 5, init: 85, stateKey: "T0", fmt: (v) => v.toFixed(0) },
      { id: "c-Ta", label: "Ambient Tₐ (°C)", min: 5, max: 30, step: 1, init: 20, stateKey: "Ta", fmt: (v) => v.toFixed(0) },
      { id: "c-k", label: "Cooling k (s⁻¹)", min: 0.002, max: 0.04, step: 0.001, init: 0.015, stateKey: "k", fmt: (v) => v.toFixed(3) },
    ],
    recordPoint: (state) => {
      const T = state.Ta + (state.T0 - state.Ta) * Math.exp(-state.k * state.t) + (Math.random() - 0.5) * 0.4;
      const dT = Math.max(0.01, T - state.Ta);
      state.t = (state.t || 0) + 15;
      return [state.t.toFixed(0), T.toFixed(2), dT.toFixed(2), Math.log(dT).toFixed(4)];
    },
    dataSchema: {
      cols: ["#", "t (s)", "T (°C)", "T−Tₐ (°C)", "ln(T−Tₐ)"],
      types: ["index", "measured", "measured", "derived", "derived"],
    },
    analyzeSetup: { xi: 1, yi: 4, xLabel: "t (s)", yLabel: "ln(T − Tₐ)", title: "Linearized Cooling: ln(T−Tₐ) vs t" },
    analysisInsight: (slope, intercept, r2, state) => {
      const k_exp = -slope;
      const tau = 1 / k_exp;
      return `<strong>k = ${k_exp.toFixed(4)} s⁻¹, τ = ${tau.toFixed(1)} s</strong> (set k=${state.k.toFixed(3)}, τ=${(1 / state.k).toFixed(1)}s). R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope, state) => ({
      label: "k (measured)",
      value: (-slope).toFixed(5),
      unit: "s⁻¹",
      theory: state.k.toFixed(5),
      pctError: Math.abs((-slope - state.k) / state.k * 100).toFixed(2),
    }),
  },
  {
    id: "waves",
    name: "Standing Waves",
    subtitle: "Harmonics and Wave Speed",
    objective: "Find resonant frequencies for n = 1–5. Verify fₙ = n·f₁. Measure v.",
    category: "Waves",
    steps: [
      { title: "Read theory", desc: "Understand standing waves, harmonics, and v = fλ." },
      { title: "Set string", desc: "Choose length L and tension T. Observe wave." },
      { title: "Find harmonics", desc: "Use n slider to select each harmonic. Record f." },
      { title: "Record 5 points", desc: "Record f for n = 1, 2, 3, 4, 5." },
      { title: "Plot f vs n", desc: "Slope = f₁. Intercept should be ~0." },
      { title: "Find v", desc: "v = f₁ · 2L. Compare to √(T/μ)." },
    ],
    theory: () => `
<div class="theory-block">
  <div class="theory-h1">Standing Waves on a String</div>
  <div class="theory-sub">Waves · Resonance · Superposition</div>
  <div class="theory-section">
    <div class="theory-h2">Formation</div>
    <p class="theory-p">When a wave on a string fixed at both ends reflects, incident and reflected waves superpose. At certain frequencies, a <em>standing wave</em> pattern forms.</p>
    <div class="eq-block">
      <div class="eq-tag">Resonance condition</div>
      <div class="eq-formula">L = n · λ/2 &nbsp;&nbsp; (n = 1, 2, 3, …)</div>
    </div>
    <div class="eq-block">
      <div class="eq-tag">Harmonic frequencies</div>
      <div class="eq-formula">fₙ = n · v / (2L) = n · f₁</div>
      <div class="eq-vars">
        <span class="eq-var"><b>v</b> wave speed = √(T/μ)</span>
        <span class="eq-var"><b>T</b> string tension (N)</span>
        <span class="eq-var"><b>μ</b> linear mass density (kg/m)</span>
      </div>
    </div>
  </div>
  <div class="insight">
    <div class="insight-head">Harmonics and music</div>
    The overtone series fₙ = n·f₁ is the physical basis of musical intervals. The octave (2:1), perfect fifth (3:2), and perfect fourth (4:3) all arise from integer ratios of standing wave frequencies.
  </div>
</div>`,
    initState: () => ({ L: 1.0, tension: 40, mu: 0.01, n: 1, phase: 0 }),
    drawApparatus: (ctx, W, H, state, running, dt) => {
      const v = Math.sqrt(state.tension / state.mu);
      const f1 = v / (2 * state.L);
      const fn = state.n * f1;
      if (running) state.phase = (state.phase || 0) + dt * fn * 2 * Math.PI * 0.3;
      ctx.fillStyle = "#0b0e12";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(0,229,160,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      const pad = 60, cy = H / 2;
      const sw = W - pad * 2;
      ctx.fillStyle = "#252e42";
      ctx.fillRect(pad - 14, cy - 50, 14, 100);
      ctx.fillRect(W - pad, cy - 50, 14, 100);
      ctx.beginPath();
      ctx.moveTo(pad, cy);
      ctx.lineTo(W - pad, cy);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      const amp = Math.min(H * 0.2, 70);
      ctx.beginPath();
      for (let i = 0; i <= 500; i++) {
        const x = i / 500;
        const xp = pad + x * sw;
        const y = cy + amp * Math.sin(state.n * Math.PI * x) * Math.cos(state.phase);
        i === 0 ? ctx.moveTo(xp, y) : ctx.lineTo(xp, y);
      }
      ctx.strokeStyle = "#00e5a0";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      for (let i = 0; i <= state.n; i++) {
        const xp = pad + (i / state.n) * sw;
        ctx.beginPath();
        ctx.arc(xp, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#8a9ab5";
        ctx.fill();
        ctx.fillStyle = "#4a5a72";
        ctx.font = "10px IBM Plex Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText("N", xp, cy + 18);
        ctx.textAlign = "left";
      }
      const dro = [
        ["n", state.n.toFixed(0)],
        ["f₁ (Hz)", f1.toFixed(2)],
        ["fₙ (Hz)", fn.toFixed(2)],
        ["λ (m)", (v / fn).toFixed(4)],
        ["v (m/s)", v.toFixed(2)],
      ];
      ctx.fillStyle = "rgba(11,14,18,0.9)";
      ctx.fillRect(W - 190, 14, 176, 16 + dro.length * 20);
      dro.forEach(([k, val], i) => {
        ctx.font = "11px IBM Plex Mono, monospace";
        ctx.fillStyle = "#4a5a72";
        ctx.fillText(k, W - 184, 30 + i * 20);
        ctx.fillStyle = "#00e5a0";
        ctx.textAlign = "right";
        ctx.fillText(val, W - 18, 30 + i * 20);
        ctx.textAlign = "left";
      });
    },
    controls: () => [
      { id: "c-wL", label: "Length L (m)", min: 0.3, max: 3.0, step: 0.1, init: 1.0, stateKey: "L", fmt: (v) => v.toFixed(1) },
      { id: "c-wT", label: "Tension T (N)", min: 5, max: 100, step: 5, init: 40, stateKey: "tension", fmt: (v) => v.toFixed(0) },
      { id: "c-wn", label: "Harmonic n", min: 1, max: 5, step: 1, init: 1, stateKey: "n", fmt: (v) => v.toFixed(0) },
    ],
    recordPoint: (state) => {
      const v = Math.sqrt(state.tension / state.mu);
      const f1 = v / (2 * state.L);
      const fn = state.n * f1 * (1 + (Math.random() - 0.5) * 0.005);
      return [state.n.toFixed(0), fn.toFixed(3), (v / fn).toFixed(4), (fn * (v / fn)).toFixed(3)];
    },
    dataSchema: {
      cols: ["#", "n", "fₙ (Hz)", "λ (m)", "v = fλ (m/s)"],
      types: ["index", "measured", "measured", "derived", "derived"],
    },
    analyzeSetup: { xi: 1, yi: 2, xLabel: "Harmonic n", yLabel: "fₙ (Hz)", title: "Frequency vs Harmonic Number" },
    analysisInsight: (slope, intercept, r2, state) => {
      const v = Math.sqrt(state.tension / state.mu);
      const v_exp = slope * 2 * state.L;
      return `<strong>f₁ = ${slope.toFixed(2)} Hz, v = 2L·f₁ = ${v_exp.toFixed(2)} m/s</strong> (theory: ${v.toFixed(2)} m/s). R² = ${r2.toFixed(5)}.`;
    },
    theoryResult: (slope, state) => {
      const v = Math.sqrt(state.tension / state.mu);
      return {
        label: "v (measured)",
        value: (slope * 2 * state.L).toFixed(3),
        unit: "m/s",
        theory: v.toFixed(3),
        pctError: Math.abs((slope * 2 * state.L - v) / v * 100).toFixed(2),
      };
    },
  },
];

// ── Physics Lab Component ─────────────────────────────────────
export default function PhysicsLab({ onClose }) {
  const [currentLabId, setCurrentLabId] = useState("pendulum");
  const [currentPanel, setCurrentPanel] = useState("theory");
  const [labState, setLabState] = useState(LABS[0].initState());
  const [running, setRunning] = useState(false);
  const [dataRows, setDataRows] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [regressionResults, setRegressionResults] = useState(null);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const plotCanvasRef = useRef(null);

  const currentLab = LABS.find((l) => l.id === currentLabId);

  // Inject styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  // Draw apparatus
  const drawApparatus = () => {
    if (!canvasRef.current || !currentLab) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    currentLab.drawApparatus(
      ctx,
      canvas.width,
      canvas.height,
      labState,
      running,
      0.05,
    );
  };

  // Animation loop
  useEffect(() => {
    if (running) {
      const animate = () => {
        setLabState((prev) => ({ ...prev, t: prev.t + 0.016 }));
        drawApparatus();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      drawApparatus();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, labState, currentLabId]);

  // Initial draw
  useEffect(() => {
    drawApparatus();
  }, [currentLabId, labState]);

  const toggleRun = () => {
    setRunning(!running);
  };

  const resetLab = () => {
    setLabState(currentLab.initState());
    setRunning(false);
    setDataRows([]);
    setCurrentStep(0);
  };

  const recordPoint = () => {
    const row = currentLab.recordPoint(labState);
    if (row) {
      setDataRows((prev) => [...prev, row]);
    }
  };

  const doPlot = () => {
    if (!currentLab || !plotCanvasRef.current || dataRows.length < 2) return;

    const setup = currentLab.analyzeSetup;
    const xi = setup.xi - 1;
    const yi = setup.yi - 1;
    const xs = dataRows.map((r) => parseFloat(r[xi])).filter((v) => !isNaN(v));
    const ys = dataRows.map((r) => parseFloat(r[yi])).filter((v) => !isNaN(v));
    const n = Math.min(xs.length, ys.length);

    if (n < 2) return;

    // Linear regression: y = slope*x + intercept
    const xm = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const ym = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;
    let num = 0,
      den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - xm) * (ys[i] - ym);
      den += (xs[i] - xm) ** 2;
    }
    const slope = den > 0 ? num / den : 0;
    const intercept = ym - slope * xm;
    const ss_res = ys.slice(0, n).reduce((s, y, i) => s + (y - (slope * xs[i] + intercept)) ** 2, 0);
    const ss_tot = ys.slice(0, n).reduce((s, y) => s + (y - ym) ** 2, 0);
    const r2 = ss_tot > 0 ? 1 - ss_res / ss_tot : 1;

    // Store theory result
    const res = currentLab.theoryResult(slope, labState);
    const pct = parseFloat(res.pctError);

    setRegressionResults({
      slope,
      intercept,
      r2,
      res,
      pct,
    });

    // Draw on canvas
    const canvas = plotCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    const pad = { l: 64, r: 20, t: 24, b: 50 };
    const aw = W - pad.l - pad.r,
      ah = H - pad.t - pad.b;

    const xMin = Math.min(...xs),
      xMax = Math.max(...xs);
    const yMin = Math.min(...ys),
      yMax = Math.max(...ys);
    const xRange = xMax - xMin || 1,
      yRange = yMax - yMin || 1;
    const xPad = xRange * 0.1,
      yPad = yRange * 0.15;
    const sx = (x) => pad.l + ((x - (xMin - xPad)) / (xRange + xPad * 2)) * aw;
    const sy = (y) => pad.t + ((yMax + yPad - y) / (yRange + yPad * 2)) * ah;

    ctx.fillStyle = "#111520";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(0,229,160,0.06)";
    ctx.lineWidth = 0.8;
    for (let i = 0; i <= 5; i++) {
      const x = xMin - xPad + ((i * (xRange + xPad * 2)) / 5);
      ctx.beginPath();
      ctx.moveTo(sx(x), pad.t);
      ctx.lineTo(sx(x), pad.t + ah);
      ctx.stroke();
      ctx.font = "10px IBM Plex Mono, monospace";
      ctx.fillStyle = "#4a5a72";
      ctx.textAlign = "center";
      ctx.fillText(x.toFixed(x < 1 ? 3 : x < 10 ? 2 : 1), sx(x), pad.t + ah + 18);

      const y = yMin - yPad + ((i * (yRange + yPad * 2)) / 5);
      ctx.beginPath();
      ctx.moveTo(pad.l, sy(y));
      ctx.lineTo(pad.l + aw, sy(y));
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(y.toFixed(y < 1 ? 3 : y < 10 ? 2 : 1), pad.l - 5, sy(y) + 4);
    }

    // Axes
    ctx.strokeStyle = "#252e42";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, pad.t + ah);
    ctx.lineTo(pad.l + aw, pad.t + ah);
    ctx.stroke();

    // Fit line
    const x1 = xMin - xPad,
      x2 = xMax + xPad;
    ctx.beginPath();
    ctx.moveTo(sx(x1), sy(slope * x1 + intercept));
    ctx.lineTo(sx(x2), sy(slope * x2 + intercept));
    ctx.strokeStyle = "rgba(245,166,35,0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Data points
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(sx(xs[i]), sy(ys[i]), 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00e5a0";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,229,160,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = "#8a9ab5";
    ctx.font = "11px IBM Plex Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(setup.xLabel, W / 2, H - 5);
    ctx.save();
    ctx.translate(14, (H + pad.t) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(setup.yLabel, 0, 0);
    ctx.restore();
    ctx.textAlign = "left";
  };

  const switchLab = (labId) => {
    setCurrentLabId(labId);
    const newLab = LABS.find((l) => l.id === labId);
    setLabState(newLab.initState());
    setRunning(false);
    setDataRows([]);
    setCurrentStep(0);
    setCurrentPanel("theory");
  };

  return (
    <div
      id="app"
      style={{
        display: "grid",
        gridTemplateRows: "48px 1fr",
        gridTemplateColumns: "280px 1fr",
        gridTemplateAreas: '"header header" "sidebar main"',
        width: "100vw",
        height: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--sans)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header id="header" style={{ gridArea: "header" }}>
        <div className="logo">
          <div className="logo-mark">φ</div>
          <div className="logo-text">Physics Lab</div>
        </div>
        <div className="lab-tabs">
          {LABS.map((lab) => (
            <button
              key={lab.id}
              className={`lab-tab ${currentLabId === lab.id ? "active" : ""}`}
              onClick={() => switchLab(lab.id)}
            >
              <div className="tab-dot"></div>
              {lab.name}
            </button>
          ))}
        </div>
        <div className="header-actions">
          <div
            style={{
              fontSize: "10px",
              color: "var(--text3)",
              marginRight: "4px",
            }}
          >
            {running ? "Running" : "Idle"}
          </div>
          <button
            className={`hbtn ${running ? "stop" : "run"}`}
            onClick={toggleRun}
          >
            {running ? "Stop" : "Run"}
          </button>
          <button className="hbtn" onClick={resetLab}>
            ↺ Reset
          </button>
          <button
            onClick={onClose}
            style={{
              fontSize: "13px",
              padding: "4px 10px",
              borderRadius: "8px",
              border: "1px solid #334155",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              marginLeft: "8px",
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside id="sidebar" style={{ gridArea: "sidebar" }}>
        <div className="sidebar-section">
          <div className="sidebar-label">Current Lab</div>
          <div className="lab-name">{currentLab.name}</div>
          <div className="lab-objective">{currentLab.objective}</div>
        </div>
        <div
          className="sidebar-section"
          style={{ paddingTop: "10px", paddingBottom: "8px" }}
        >
          <div className="sidebar-label">Procedure</div>
        </div>
        <div className="proc-scroll">
          {currentLab.steps.map((step, i) => (
            <div
              key={i}
              className={`proc-step ${currentStep === i ? "active" : ""} ${i < currentStep ? "done" : ""}`}
              onClick={() => setCurrentStep(i)}
            >
              <div className="step-n">{i + 1}</div>
              <div className="step-body">
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-status">
          <div className="status-row">
            <span>Data points</span>
            <span className="status-val">{dataRows.length}</span>
          </div>
          <div className="status-row">
            <span>Run state</span>
            <span className="status-val">{running ? "Running" : "Idle"}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main id="main" style={{ gridArea: "main" }}>
        <div className="panel-tabs">
          {["theory", "apparatus", "data", "analysis"].map((panel) => (
            <button
              key={panel}
              className={`ptab ${currentPanel === panel ? "active" : ""}`}
              onClick={() => setCurrentPanel(panel)}
            >
              {panel}
            </button>
          ))}
        </div>

        <div className="panels">
          <div
            className={`panel ${currentPanel === "theory" ? "active" : ""}`}
            id="panel-theory"
          >
            <div dangerouslySetInnerHTML={{ __html: currentLab.theory() }} />
          </div>

          <div
            className={`panel ${currentPanel === "apparatus" ? "active" : ""}`}
            id="panel-apparatus"
          >
            <div className="apparatus-canvas-wrap">
              <canvas ref={canvasRef} width={800} height={600} />
            </div>
            <div className="apparatus-controls">
              {currentLab.controls().map((ctrl) => (
                <div key={ctrl.id} className="ctrl-group">
                  <span className="ctrl-label">{ctrl.label}</span>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={labState[ctrl.stateKey]}
                    onChange={(e) =>
                      setLabState((prev) => ({
                        ...prev,
                        [ctrl.stateKey]: parseFloat(e.target.value),
                      }))
                    }
                  />
                  <span className="ctrl-val">
                    {ctrl.fmt(labState[ctrl.stateKey])}
                  </span>
                </div>
              ))}
              <div className="gap"></div>
              <button className="ctrl-record-btn" onClick={recordPoint}>
                Record Point
              </button>
            </div>
          </div>

          <div
            className={`panel ${currentPanel === "data" ? "active" : ""}`}
            id="panel-data"
          >
            <div className="data-header">
              <div>
                <div className="panel-title">
                  {currentLab.name} — Data Table
                </div>
                <div className="panel-sub">
                  {dataRows.length} point{dataRows.length !== 1 ? "s" : ""}{" "}
                  recorded · {Math.max(0, 6 - dataRows.length)} more recommended
                </div>
              </div>
              <div className="data-actions">
                <button className="dbtn" onClick={recordPoint}>
                  ⊕ Record
                </button>
                <button className="dbtn danger" onClick={() => setDataRows([])}>
                  ⊗ Clear
                </button>
              </div>
            </div>
            <div className="data-table-wrap">
              <table className="dtable">
                <thead>
                  <tr>
                    {currentLab.dataSchema.cols.map((col, i) => (
                      <th key={i}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={currentLab.dataSchema.cols.length}
                        style={{
                          color: "var(--text3)",
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        No data recorded yet — go to Apparatus and click Record
                        Point
                      </td>
                    </tr>
                  ) : (
                    dataRows.map((row, i) => (
                      <tr key={i}>
                        <td className="c-index">{i + 1}</td>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={
                              currentLab.dataSchema.types[j + 1] === "measured"
                                ? "c-measured"
                                : currentLab.dataSchema.types[j + 1] ===
                                    "derived"
                                  ? "c-derived"
                                  : ""
                            }
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="data-note">
              <span className="c-measured">
                ■ Blue = measured directly from apparatus
              </span>{" "}
              &nbsp;·&nbsp;
              <span className="c-derived">
                ■ Amber = derived/calculated from measurements
              </span>
            </div>
          </div>

          <div
            className={`panel ${currentPanel === "analysis" ? "active" : ""}`}
            id="panel-analysis"
          >
            <div className="data-header" style={{ marginBottom: "16px" }}>
              <div>
                <div className="panel-title">{currentLab.analyzeSetup.title}</div>
                <div className="panel-sub">
                  {dataRows.length} data point{dataRows.length !== 1 ? "s" : ""}{" "}
                  available
                </div>
              </div>
              <button
                className="plot-btn"
                style={{ width: "auto", padding: "8px 20px" }}
                onClick={doPlot}
              >
                Plot & Fit Linear Regression
              </button>
            </div>
            <div className="analysis-layout">
              <div className="plot-wrap">
                <canvas
                  ref={plotCanvasRef}
                  width={600}
                  height={450}
                  style={{ display: "block" }}
                />
              </div>
              <div className="analysis-right">
                {regressionResults ? (
                  <>
                    <div className="result-card">
                      <div className="result-card-title">Regression Results</div>
                      <div className="result-row">
                        <span className="result-key">Slope</span>
                        <span className="result-val">
                          {regressionResults.slope.toFixed(6)}
                        </span>
                      </div>
                      <div className="result-row">
                        <span className="result-key">Intercept</span>
                        <span className="result-val">
                          {regressionResults.intercept.toFixed(6)}
                        </span>
                      </div>
                      <div className="result-row">
                        <span
                          className={`result-val ${
                            regressionResults.r2 > 0.99 ? "good" : "warn"
                          }`}
                        >
                          R² = {regressionResults.r2.toFixed(6)}
                        </span>
                      </div>
                      <div className="result-row">
                        <span className="result-key">
                          {regressionResults.res.label}
                        </span>
                        <span className="result-val">
                          {regressionResults.res.value}{" "}
                          {regressionResults.res.unit}
                        </span>
                      </div>
                      <div className="result-row">
                        <span className="result-key">Theory</span>
                        <span className="result-val theory">
                          {regressionResults.res.theory}{" "}
                          {regressionResults.res.unit}
                        </span>
                      </div>
                      <div className="result-row">
                        <span className="result-key">% Error</span>
                        <span
                          className={`result-val ${
                            regressionResults.pct < 2
                              ? "good"
                              : regressionResults.pct < 5
                                ? ""
                                : "warn"
                          }`}
                        >
                          {regressionResults.pct.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div
                      className="analysis-insight"
                      dangerouslySetInnerHTML={{
                        __html: currentLab.analysisInsight(
                          regressionResults.slope,
                          regressionResults.intercept,
                          regressionResults.r2,
                          labState,
                        ),
                      }}
                    />
                  </>
                ) : (
                  <div className="result-card">
                    <div className="result-card-title">Ready to Plot</div>
                    <div style={{ color: "var(--text3)", fontSize: "12px" }}>
                      {dataRows.length < 2
                        ? "Record ≥2 data points to enable plotting"
                        : "Click 'Plot & Fit' to start analysis"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
