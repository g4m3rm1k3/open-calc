import { useState, useEffect, useRef } from 'react'

function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg: dark ? '#0f172a' : '#f8fafc',
    surface: dark ? '#1e293b' : '#ffffff',
    surface2: dark ? '#0f172a' : '#f1f5f9',
    border: dark ? '#334155' : '#e2e8f0',
    text: dark ? '#e2e8f0' : '#1e293b',
    muted: dark ? '#94a3b8' : '#64748b',
    hint: dark ? '#475569' : '#94a3b8',
    blue: dark ? '#38bdf8' : '#0284c7',
    blueBg: dark ? 'rgba(56,189,248,0.12)' : 'rgba(2,132,199,0.08)',
    blueBd: dark ? '#38bdf8' : '#0284c7',
    amber: dark ? '#fbbf24' : '#d97706',
    amberBg: dark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.08)',
    amberBd: dark ? '#fbbf24' : '#d97706',
    green: dark ? '#4ade80' : '#16a34a',
    greenBg: dark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)',
    greenBd: dark ? '#4ade80' : '#16a34a',
    red: dark ? '#f87171' : '#dc2626',
    redBg: dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)',
    redBd: dark ? '#f87171' : '#dc2626',
    purple: dark ? '#a78bfa' : '#7c3aed',
    purpleBg: dark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)',
    purpleBd: dark ? '#a78bfa' : '#7c3aed',
  }
}

function Tag({ label, color, C }) {
  const map = {
    blue: [C.blueBg, C.blue], amber: [C.amberBg, C.amber],
    green: [C.greenBg, C.green], red: [C.redBg, C.red], purple: [C.purpleBg, C.purple],
  }
  const [bg, tc] = map[color] || map.blue
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, padding: '2px 9px', borderRadius: 6,
      background: bg, color: tc, fontWeight: 500, marginBottom: 10
    }}>
      {label}
    </span>
  )
}
function Heading({ children, C }) {
  return <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{children}</h3>
}
function Para({ children, C }) {
  return <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, marginBottom: 10 }}>{children}</p>
}
function Strong({ children }) { return <span style={{ fontWeight: 500 }}>{children}</span> }
function Callout({ children, color, title, C }) {
  const map = {
    blue: [C.blueBg, C.blueBd, C.blue], amber: [C.amberBg, C.amberBd, C.amber],
    green: [C.greenBg, C.greenBd, C.green], red: [C.redBg, C.redBd, C.red],
    purple: [C.purpleBg, C.purpleBd, C.purple],
  }
  const [bg, bd, tc] = map[color] || map.amber
  return (
    <div style={{
      borderLeft: `2px solid ${bd}`, background: bg,
      borderRadius: '0 6px 6px 0', padding: '8px 12px', marginBottom: 10
    }}>
      {title && <div style={{ fontSize: 12, fontWeight: 500, color: tc, marginBottom: 4 }}>{title}</div>}
      <p style={{ fontSize: 13, color: tc, lineHeight: 1.6, margin: 0 }}>{children}</p>
    </div>
  )
}
function AhaBox({ title, children, C }) {
  return (
    <div style={{
      background: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 12,
      padding: '1rem 1.25rem', marginBottom: 10
    }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: C.green, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.green, lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}
function TwoCol({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>{children}</div>
}
function Stat({ label, value, color, C }) {
  return (
    <div style={{ background: C.surface2, borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontSize: 11, color: C.hint, marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, color: color || C.text }}>{value}</div>
    </div>
  )
}
function CodeBox({ children, C }) {
  return (
    <div style={{
      background: C.surface2, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace',
      fontSize: 13, color: C.text, lineHeight: 2, marginBottom: 10, whiteSpace: 'pre-wrap'
    }}>
      {children}
    </div>
  )
}

// ── Energy curve canvas ───────────────────────────────────────────────────────
function EnergyCurveCanvas({ vLimit, vYours, C }) {
  const canvasRef = useRef(null)
  const roRef = useRef(null)
  const mass = 1500
  const ke = v => 0.5 * mass * (v / 3.6) ** 2

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const cv = canvasRef.current;
      if (!cv || !C) return;
      const ctx = cv.getContext('2d');
      if (!ctx) return;

      const cw = cv.offsetWidth || 500;
      const ch = 260;
      if (cv.width !== cw) cv.width = cw;
      if (cv.height !== ch) cv.height = ch;

      const pl = 64, pr = 20, pt = 24, pb = 44;
      const iw = cw - pl - pr, ih = ch - pt - pb;
      if (iw <= 0 || ih <= 0) return;

      const vMax = 130, eMax = ke(vMax);
      const tx = (v) => pl + (v / vMax) * iw;
      const ty = (e) => pt + ih - (e / eMax) * ih;

      ctx.clearRect(0, 0, cw, ch);

      // Grid
      ctx.strokeStyle = C.border || "#cbd5e1"; ctx.lineWidth = 1;
      for (let v = 0; v <= vMax; v += 20) {
        ctx.beginPath(); ctx.moveTo(tx(v), pt); ctx.lineTo(tx(v), pt + ih); ctx.stroke();
        ctx.fillStyle = C.muted || "#64748b"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(v + " km/h", tx(v), pt + ih + 16);
      }
      for (let pct = 0; pct <= 1; pct += 0.25) {
        const e = eMax * pct;
        ctx.beginPath(); ctx.moveTo(pl, ty(e)); ctx.lineTo(pl + iw, ty(e)); ctx.stroke();
        ctx.fillStyle = C.muted || "#64748b"; ctx.font = "11px sans-serif"; ctx.textAlign = "right";
        ctx.fillText(Math.round(e / 1000) + "kJ", pl - 4, ty(e) + 4);
      }

      // Energy regions
      ctx.beginPath(); ctx.moveTo(tx(0), ty(0));
      for (let v = 0; v <= vLimit; v += 0.5) ctx.lineTo(tx(v), ty(ke(v)));
      ctx.lineTo(tx(vLimit), ty(0)); ctx.closePath();
      ctx.fillStyle = "rgba(56,189,248,0.10)"; ctx.fill();

      if (vYours > vLimit) {
        ctx.beginPath(); ctx.moveTo(tx(vLimit), ty(ke(vLimit)));
        for (let v = vLimit; v <= vYours; v += 0.5) ctx.lineTo(tx(v), ty(ke(v)));
        ctx.lineTo(tx(vYours), ty(0)); ctx.lineTo(tx(vLimit), ty(0)); ctx.closePath();
        ctx.fillStyle = "rgba(248,113,113,0.18)"; ctx.fill();
      }

      // Main curve
      ctx.strokeStyle = C.blue || "#0284c7"; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let v = 0; v <= vMax; v += 0.5) {
        v === 0 ? ctx.moveTo(tx(v), ty(ke(v))) : ctx.lineTo(tx(v), ty(ke(v)));
      }
      ctx.stroke();

      // Tangent
      const dkdv = (ke(vLimit + 0.1) - ke(vLimit - 0.1)) / 0.2;
      const tlen = 15;
      ctx.strokeStyle = C.amber || "#d97706"; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(tx(vLimit - tlen), ty(ke(vLimit) - tlen * dkdv));
      ctx.lineTo(tx(vLimit + tlen), ty(ke(vLimit) + tlen * dkdv));
      ctx.stroke();

      // Interaction points
      [[vLimit, C.blue || "#0284c7"], vYours > vLimit ? [vYours, C.red || "#dc2626"] : null]
        .filter(Boolean).forEach(([v, col]) => {
          ctx.fillStyle = col; ctx.beginPath();
          ctx.arc(tx(v), ty(ke(v)), 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = C.text || "#1e293b"; ctx.font = "500 12px sans-serif"; ctx.textAlign = "center";
          ctx.fillText(v + " km/h", tx(v), ty(ke(v)) - 12);
          ctx.fillStyle = col; ctx.font = "11px sans-serif";
          ctx.fillText(Math.round(ke(v) / 1000) + "kJ", tx(v), ty(ke(v)) + 22);
        });

      if (vYours > vLimit) {
        ctx.fillStyle = C.red || "#dc2626"; ctx.font = "500 11px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("+" + Math.round((ke(vYours) - ke(vLimit)) / 1000) + "kJ extra", tx((vLimit + vYours) / 2), ty((ke(vLimit) + ke(vYours)) / 2));
      }

      // Labels
      ctx.fillStyle = C.muted || "#64748b"; ctx.font = "12px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("speed (km/h)", pl + iw / 2, ch - 5);
      ctx.save(); ctx.translate(14, pt + ih / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("kinetic energy (kJ)", 0, 0); ctx.restore();
      ctx.fillStyle = C.blue || "#0284c7"; ctx.font = "500 12px sans-serif"; ctx.textAlign = "right";
      ctx.fillText("KE = ½mv²", pl + iw - 4, pt + 16);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas.parentElement || canvas);
    return () => ro.disconnect();
  }, [vLimit, vYours, C]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: 260, display: 'block' }} />
}

// ── Stop bars ─────────────────────────────────────────────────────────────────
function StopBars({ vLimit, vYours, C }) {
  const a = 7
  const stop = v => (v / 3.6) ** 2 / (2 * a)
  const sL = stop(vLimit), sY = stop(vYours)
  const maxS = Math.max(sL, sY) * 1.15
  return (
    <div style={{ marginBottom: 10 }}>
      {[[vLimit, sL, C.green, 'Limit'], [vYours, sY, C.red, 'Yours']].map(([v, s, col, lbl], i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: C.muted }}>{lbl}: {v} km/h</span>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: col, fontWeight: 500 }}>{s.toFixed(1)}m</span>
          </div>
          <div style={{ background: C.surface2, borderRadius: 4, height: 18, overflow: 'hidden' }}>
            <div style={{ width: `${(s / maxS) * 100}%`, background: col, height: '100%', borderRadius: 4, transition: 'width .3s' }} />
          </div>
        </div>
      ))}
      <div style={{ padding: '8px 12px', background: C.amberBg, borderRadius: 8, border: `0.5px solid ${C.amberBd}` }}>
        <span style={{ fontSize: 12, color: C.amber }}>
          Ratio: ({vYours}/{vLimit})² = {((vYours / vLimit) ** 2).toFixed(2)}× — because d ∝ v²
        </span>
      </div>
    </div>
  )
}

// ── Car crash canvas ──────────────────────────────────────────────────────────
function CarCrashCanvas({ impactSpeed, crush, C }) {
  const canvasRef = useRef(null)
  const roRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const cv = canvasRef.current;
      if (!cv || !C) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;

      const cw = cv.offsetWidth || 500, ch = 170;
      if (cv.width !== cw) cv.width = cw;
      if (cv.height !== ch) cv.height = ch;

      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = C.hint || "#94a3b8"; ctx.fillRect(cw - 55, 15, 55, ch - 30);
      ctx.fillStyle = C.muted || "#64748b"; ctx.font = "12px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("WALL", cw - 27, ch / 2);

      const carRight = cw - 58;
      const bodyW = 170;
      const crumplePx = crush * 110;
      const bodyLeft = carRight - bodyW;

      if (crumplePx > 2) {
        for (let i = 0; i < Math.floor(crumplePx / 5); i++) {
          const px = carRight - crumplePx + i * 5;
          const jitter = Math.sin(i * 2.7) * 7 * Math.min(crush, 1);
          ctx.fillStyle = i % 2 === 0 ? C.redBg : C.amberBg;
          ctx.fillRect(px, 48 + jitter, 5, 74);
        }
        ctx.strokeStyle = C.red || "#dc2626"; ctx.lineWidth = 1.5;
        ctx.strokeRect(carRight - crumplePx, 48, crumplePx, 74);
      }

      ctx.fillStyle = C.surface2 || "#f1f5f9"; ctx.fillRect(bodyLeft, 48, bodyW - crumplePx, 74);
      ctx.strokeStyle = C.border || "#cbd5e1"; ctx.lineWidth = 1; ctx.strokeRect(bodyLeft, 48, bodyW - crumplePx, 74);
      ctx.fillStyle = C.blueBg || "rgba(56,189,248,0.12)"; ctx.fillRect(bodyLeft + 20, 54, 50, 28);

      [bodyLeft + 28, bodyLeft + bodyW - crumplePx - 32].forEach((wx) => {
        if (wx > bodyLeft + 10) {
          ctx.fillStyle = C.hint || "#94a3b8"; ctx.beginPath(); ctx.arc(wx, 132, 13, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = C.surface2 || "#f1f5f9"; ctx.beginPath(); ctx.arc(wx, 132, 5, 0, Math.PI * 2); ctx.fill();
        }
      });

      ctx.fillStyle = C.text || "#1e293b"; ctx.font = "500 13px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(impactSpeed + " km/h", bodyLeft + 8, 44);
      if (crush > 0.05) {
        ctx.fillStyle = C.red || "#dc2626"; ctx.font = "500 12px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("crush: " + (crush * 100).toFixed(0) + "cm", carRight - crumplePx / 2, 38);
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas.parentElement || canvas);
    return () => ro.disconnect();
  }, [impactSpeed, crush, C]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: 170, display: 'block', borderRadius: 8 }} />
}

// ── PAGE COMPONENTS — named, top-level ───────────────────────────────────────

function PageEnergy({ C }) {
  const [vLimit, setVLimit] = useState(30)
  const [vYours, setVYours] = useState(40)
  const ke = v => 0.5 * 1500 * (v / 3.6) ** 2
  const extraKJ = Math.round((ke(vYours) - ke(vLimit)) / 1000)
  const ratio = ((vYours / vLimit) ** 2).toFixed(2)
  return (
    <>
      <Tag label="Why 4× stopping distance?" color="red" C={C} />
      <Heading C={C}>The real story is energy — and energy grows as v²</Heading>
      <Para C={C}>
        When you brake, your brakes must absorb all your kinetic energy. <Strong>KE = ½mv².</Strong>{' '}
        That v² is everything. Double your speed, quadruple your energy, quadruple the stopping distance.
        It's not a made-up rule — it falls directly from the v² in the formula.
      </Para>
      <Para C={C}>
        The derivative dKE/dv = mv tells you the rate: each extra km/h costs mv more joules.
        At higher speeds v is larger, so each extra km/h is more expensive.
        The parabola gets steeper as you go right — that steepening IS the derivative growing.
      </Para>
      <EnergyCurveCanvas vLimit={vLimit} vYours={vYours} C={C} />
      <TwoCol>
        <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint, marginBottom: 4 }}>Speed limit</div>
          <input type="range" min={20} max={80} step={10} value={vLimit}
            onChange={e => setVLimit(+e.target.value)} style={{ width: '100%', marginBottom: 4 }} />
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: C.green, fontWeight: 500 }}>{vLimit} km/h</div>
        </div>
        <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint, marginBottom: 4 }}>Your speed</div>
          <input type="range" min={vLimit + 5} max={vLimit + 50} step={5} value={vYours}
            onChange={e => setVYours(+e.target.value)} style={{ width: '100%', marginBottom: 4 }} />
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: C.red, fontWeight: 500 }}>{vYours} km/h</div>
        </div>
      </TwoCol>
      <AhaBox title={`Why ${vLimit}→${vYours} means ${ratio}× the stopping distance`} C={C}>
        Stopping distance = v²/(2a). The ratio is ({vYours}/{vLimit})² = {ratio}×.
        Going {vYours - vLimit} km/h over a {vLimit} km/h limit multiplies your stopping distance by {ratio}.
        The red shaded area is the extra kinetic energy your brakes must absorb: +{extraKJ} kJ.
        The amber tangent line is dKE/dv = mv — steeper at higher speed, steeper danger.
      </AhaBox>
      <Callout color="amber" title="The tangent slope is the derivative — and it grows" C={C}>
        At the limit speed the tangent is gentle. At your speed, the curve has steepened.
        The same extra 1 km/h costs more energy than it did at a lower speed.
        That's the derivative dKE/dv = mv growing linearly with v.
      </Callout>
    </>
  )
}

function PageStopping({ C }) {
  const [vLimit, setVLimit] = useState(30)
  const [over, setOver] = useState(10)
  const vYours = vLimit + over
  const a = 7
  const derivL = (vLimit / 3.6) / a
  const derivY = (vYours / 3.6) / a
  return (
    <>
      <Tag label="Stopping distance" color="red" C={C} />
      <Heading C={C}>Same 10 km/h over — very different stopping distances</Heading>
      <Para C={C}>
        Stopping distance d = v²/(2a). Brakes give roughly constant deceleration a,
        so d is directly proportional to v². The only variable is v².
      </Para>
      <TwoCol>
        <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint, marginBottom: 4 }}>Speed limit</div>
          <input type="range" min={20} max={80} step={10} value={vLimit}
            onChange={e => setVLimit(+e.target.value)} style={{ width: '100%', marginBottom: 4 }} />
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: C.green, fontWeight: 500 }}>{vLimit} km/h</div>
        </div>
        <div style={{ background: C.surface2, borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: C.hint, marginBottom: 4 }}>km/h over limit</div>
          <input type="range" min={5} max={40} step={5} value={over}
            onChange={e => setOver(+e.target.value)} style={{ width: '100%', marginBottom: 4 }} />
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: C.red, fontWeight: 500 }}>+{over} km/h</div>
        </div>
      </TwoCol>
      <StopBars vLimit={vLimit} vYours={vYours} C={C} />
      <CodeBox C={C}>
        {`d(v) = v² / (2a)\nd′(v) = v / a  ← m per km/h of stopping distance\n\nAt limit  ${vLimit} km/h:  d′ = ${derivL.toFixed(2)} m per km/h\nAt yours  ${vYours} km/h:  d′ = ${derivY.toFixed(2)} m per km/h\nEach extra km/h at ${vYours} is ${(derivY / derivL).toFixed(2)}× more costly`}
      </CodeBox>
      <Callout color="purple" title="The derivative d′(v) = v/a explains the disproportionate danger" C={C}>
        At 60 km/h d′ ≈ 2.4 m per km/h. At 30 km/h d′ ≈ 1.2 m per km/h.
        The derivative is twice as large — each extra km/h at 60 costs twice as much stopping distance.
        This is the mathematical reason higher speed is disproportionately dangerous.
      </Callout>
    </>
  )
}

function PageImpact({ C }) {
  const [impactSpeed, setImpactSpeed] = useState(50)
  const [crush, setCrush] = useState(0)
  const [playing, setPlaying] = useState(false)
  const animRef = useRef(null)
  const maxCrush = 1.2
  const crushDepth = v => maxCrush * (v / 120) ** 2

  const handlePlay = () => {
    setCrush(0); setPlaying(true)
    let start = null
    const target = crushDepth(impactSpeed)
    const step = ts => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / 1200, 1)
      setCrush((1 - Math.pow(1 - progress, 3)) * target)
      if (progress < 1) animRef.current = requestAnimationFrame(step)
      else setPlaying(false)
    }
    animRef.current = requestAnimationFrame(step)
  }
  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])

  const cd = crushDepth(impactSpeed)
  const cd2 = crushDepth(impactSpeed * 2)
  const ke1 = Math.round(0.5 * 1500 * (impactSpeed / 3.6) ** 2 / 1000)
  const ke2 = Math.round(0.5 * 1500 * ((impactSpeed * 2) / 3.6) ** 2 / 1000)
  return (
    <>
      <Tag label="Impact" color="red" C={C} />
      <Heading C={C}>A car hitting a wall — crush depth ∝ v²</Heading>
      <Para C={C}>
        When a car hits a wall, the crumple zone absorbs kinetic energy by deforming.
        More energy = more crush. Since KE = ½mv², crush depth ∝ v².{' '}
        <Strong>Double the speed, four times the crush.</Strong>
      </Para>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.muted, minWidth: 80 }}>Impact speed</span>
        <input type="range" min={10} max={120} step={10} value={impactSpeed}
          onChange={e => { setImpactSpeed(+e.target.value); setCrush(0) }} style={{ flex: 1 }} />
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.red, fontWeight: 500, minWidth: 64 }}>
          {impactSpeed} km/h
        </span>
      </div>
      <CarCrashCanvas impactSpeed={impactSpeed} crush={crush} C={C} />
      <div style={{ marginTop: 8, marginBottom: 10 }}>
        <button onClick={handlePlay} disabled={playing}
          style={{
            fontSize: 13, padding: '7px 20px', borderRadius: 8, border: 'none',
            cursor: playing ? 'default' : 'pointer', background: C.red,
            color: '#fff', opacity: playing ? 0.6 : 1
          }}>
          {playing ? 'Impact...' : 'Simulate impact'}
        </button>
      </div>
      <TwoCol>
        <Stat label={`Crush at ${impactSpeed} km/h`} value={(cd * 100).toFixed(1) + 'cm'} color={C.red} C={C} />
        <Stat label={`Crush at ${impactSpeed * 2} km/h (double speed)`} value={(cd2 * 100).toFixed(1) + 'cm (4×)'} color={C.red} C={C} />
        <Stat label={`KE at ${impactSpeed} km/h`} value={ke1 + ' kJ'} color={C.blue} C={C} />
        <Stat label={`KE at ${impactSpeed * 2} km/h`} value={ke2 + ' kJ (4×)'} color={C.blue} C={C} />
      </TwoCol>
      <AhaBox title="Why pedestrian survival drops off a cliff above 40 km/h" C={C}>
        At 30 km/h a struck pedestrian has ~90% survival. At 50 km/h ~50%. At 70 km/h under 10%.
        The KE at 70 is (70/30)² = 5.4× the KE at 30. Not 2.3× more dangerous — 5.4×.
        Every speed limit is implicitly a statement about KE = ½mv².
      </AhaBox>
    </>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
const PAGES = [PageEnergy, PageStopping, PageImpact]
const PAGE_LABELS = ['Energy & v²', 'Stopping distance', 'Car impact']

export default function KineticEnergySpeeding({ params = {} }) {
  const C = useColors()
  const [page, setPage] = useState(params.currentStep ?? 0)
  useEffect(() => {
    if (params.currentStep !== undefined)
      setPage(Math.min(params.currentStep, PAGES.length - 1))
  }, [params.currentStep])
  const PageComponent = PAGES[Math.min(page, PAGES.length - 1)]
  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {PAGE_LABELS.map((_, i) => (
          <div key={i} onClick={() => setPage(i)} style={{
            flex: 1, height: 4, borderRadius: 2,
            cursor: 'pointer', transition: 'background .25s',
            background: i < page ? C.blue : i === page ? C.amber : C.border
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        {PAGE_LABELS.map((label, i) => (
          <button key={i} onClick={() => setPage(i)}
            style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 6, cursor: 'pointer',
              border: `0.5px solid ${i === page ? C.amberBd : C.border}`,
              background: i === page ? C.amberBg : 'transparent',
              color: i === page ? C.amber : C.hint
            }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{
        background: C.surface, border: `0.5px solid ${C.border}`,
        borderRadius: 12, padding: '1.25rem', marginBottom: 12
      }}>
        <PageComponent C={C} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
          style={{
            fontSize: 13, padding: '7px 18px', borderRadius: 8,
            cursor: page === 0 ? 'default' : 'pointer',
            border: `0.5px solid ${C.border}`, background: 'transparent',
            color: C.text, opacity: page === 0 ? 0.3 : 1
          }}>← Back</button>
        <span style={{ fontSize: 12, color: C.hint }}>{page + 1} / {PAGES.length}</span>
        <button disabled={page === PAGES.length - 1} onClick={() => setPage(p => p + 1)}
          style={{
            fontSize: 13, padding: '7px 18px', borderRadius: 8,
            cursor: page === PAGES.length - 1 ? 'default' : 'pointer',
            border: 'none', background: C.text, color: C.bg,
            opacity: page === PAGES.length - 1 ? 0.3 : 1
          }}>Next →</button>
      </div>
    </div>
  )
}
