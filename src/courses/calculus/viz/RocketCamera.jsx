import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

function useIsDark() {
  const isDark = () => document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export default function RocketCamera({ params = {} }) {
  const dark = useIsDark();
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const lastTimeRef = useRef(null);
  const rafRef = useRef(null);

  // Fixed constants + live controls
  const D = 4000;
  const [h, setH] = useState(2000);
  const [hPrime, setHPrime] = useState(600);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const maxH = 12000;
  const s = Math.sqrt(D * D + h * h);
  const theta = Math.atan(h / D);
  const thetaPrimeMaster = (D * hPrime) / (s * s);

  // Verification (full trig way) — always matches master
  const thetaPrimeFull = h > 0 ? hPrime / (D * (1 / Math.cos(theta) ** 2)) : 0;

  const steps = [
    {
      num: 1,
      title: '1. Variable Setup (Letters Only)',
      body: 'D = fixed ground distance (4000 ft).  h = rocket height (changing).  h\' = rocket speed (600 ft/s).  θ = camera angle.  s = direct line-of-sight distance.'
    },
    {
      num: 2,
      title: '2. The Relationship',
      body: 'Right triangle → tan(θ) = opposite / adjacent = h / D'
    },
    {
      num: 3,
      title: '3. The Derivative (Implicit)',
      body: 'Differentiate both sides wrt time: h\' = D · sec²(θ) · θ\''
    },
    {
      num: 4,
      title: '4. Master Factor Discovery',
      body: 'sec(θ) = hypotenuse / adjacent = s / D. Substitute → θ\' = D · h\' / s² (trig disappears!)'
    },
    {
      num: 5,
      title: '5. Plug & Solve Instantly',
      body: 'Activity #3: h = 2000 ft → s² = 4000² + 2000² = 20,000,000. θ\' = (4000 · 600) / 20,000,000 = 3/25 rad/s'
    }
  ];

  // Animation: rocket rises at constant h'
  useEffect(() => {
    let raf;
    const animate = () => {
      if (isPlaying && h < maxH) {
        const now = Date.now();
        const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.1);
        lastTimeRef.current = now;
        const newH = Math.min(maxH, h + hPrime * dt * 2); // ×2 for visible progress
        setH(newH);
      }
      raf = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      lastTimeRef.current = Date.now();
      raf = requestAnimationFrame(animate);
    }
    rafRef.current = raf;

    return () => cancelAnimationFrame(raf);
  }, [isPlaying, h, hPrime]);

  // Main drawing engine
  useEffect(() => {
    const draw = () => {
      const C = {
        bg: dark ? '#0f172a' : '#ffffff',
        panel: dark ? '#1e293b' : '#f1f5f9',
        axis: dark ? '#475569' : '#94a3b8',
        ground: dark ? '#64748b' : '#475569',
        rocket: dark ? '#f472b6' : '#db2777',
        los: dark ? '#38bdf8' : '#0284c7',
        point: dark ? '#34d399' : '#059669',
        text: dark ? '#94a3b8' : '#64748b',
        accent: dark ? '#fbbf24' : '#d97706',
        highlight: dark ? '#a5f3fc' : '#67e8f9',
        warn: dark ? '#fbbf24' : '#d97706'
      };

      const container = containerRef.current;
      if (!container) return;
      const W = container.clientWidth || 520;
      const H = 340;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg.attr('width', W).attr('height', H);

      const margin = { left: 50, right: 30, top: 30, bottom: 70 };
      const width = W - margin.left - margin.right;
      const height = H - margin.top - margin.bottom;

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales
      const xScale = d3.scaleLinear().domain([0, D]).range([0, width]);
      const maxVisibleH = Math.max(h * 1.15, D * 1.3);
      const yScale = d3.scaleLinear().domain([0, maxVisibleH]).range([height, 0]);

      const baseX = xScale(D);
      const baseY = height;
      const tipY = yScale(h);

      // Ground (adjacent = D)
      g.append('line')
        .attr('x1', 0).attr('y1', baseY)
        .attr('x2', baseX).attr('y2', baseY)
        .attr('stroke', C.ground).attr('stroke-width', 7);

      // Rocket path (opposite = h)
      g.append('line')
        .attr('x1', baseX).attr('y1', baseY)
        .attr('x2', baseX).attr('y2', tipY)
        .attr('stroke', C.rocket).attr('stroke-width', 7).attr('stroke-dasharray', '3,2');

      // Line-of-sight (hypotenuse = s)
      g.append('line')
        .attr('x1', 0).attr('y1', baseY)
        .attr('x2', baseX).attr('y2', tipY)
        .attr('stroke', C.los).attr('stroke-width', 8).attr('stroke-linecap', 'round');

      // Camera point
      g.append('circle')
        .attr('cx', 0).attr('cy', baseY)
        .attr('r', 9).attr('fill', C.point).attr('stroke', '#fff').attr('stroke-width', 3);

      // Rocket tip
      g.append('circle')
        .attr('cx', baseX).attr('cy', tipY)
        .attr('r', 9).attr('fill', C.point).attr('stroke', '#fff').attr('stroke-width', 3);

      // Angle θ arc (small, at camera)
      const arcR = 38;
      const arcPath = g.append('path')
        .attr('d', `M ${arcR},${baseY} A ${arcR},${arcR} 0 0 0 ${arcR * Math.cos(theta)}, ${baseY - arcR * Math.sin(theta)}`)
        .attr('fill', 'none')
        .attr('stroke', C.accent)
        .attr('stroke-width', 3);

      // θ label near arc
      g.append('text')
        .attr('x', arcR * 0.7)
        .attr('y', baseY - arcR * 0.6)
        .attr('fill', C.accent)
        .attr('font-size', '15px')
        .attr('font-weight', '700')
        .text('θ');

      // STEP-DEPENDENT HIGHLIGHTS
      // Step 1+: variable boxes
      if (step >= 0) {
        // D box
        g.append('rect')
          .attr('x', baseX / 2 - 22).attr('y', baseY + 6)
          .attr('width', 44).attr('height', 22).attr('rx', 3)
          .attr('fill', 'none').attr('stroke', C.highlight).attr('stroke-width', 2);
        g.append('text')
          .attr('x', baseX / 2).attr('y', baseY + 22)
          .attr('text-anchor', 'middle').attr('fill', C.text).attr('font-size', '13px')
          .text('D');
      }

      // Step 2+: tan sides highlight
      if (step >= 1) {
        g.append('line')
          .attr('x1', 0).attr('y1', baseY)
          .attr('x2', baseX).attr('y2', baseY)
          .attr('stroke', C.accent).attr('stroke-width', 3).attr('opacity', 0.4);
        g.append('line')
          .attr('x1', baseX).attr('y1', baseY)
          .attr('x2', baseX).attr('y2', tipY)
          .attr('stroke', C.accent).attr('stroke-width', 3).attr('opacity', 0.4);
        g.append('text')
          .attr('x', baseX + 12).attr('y', tipY + (baseY - tipY) / 2 + 4)
          .attr('fill', C.accent).attr('font-size', '13px').attr('font-weight', '600')
          .text('tan θ');
      }

      // Step 3+: primes on changing quantities
      if (step >= 2) {
        g.append('text')
          .attr('x', baseX + 8).attr('y', tipY - 12)
          .attr('fill', C.warn).attr('font-size', '13px').attr('font-weight', '700')
          .text('h′');
        g.append('text')
          .attr('x', arcR + 8).attr('y', baseY - arcR - 8)
          .attr('fill', C.warn).attr('font-size', '13px').attr('font-weight', '700')
          .text('θ′');
      }

      // Step 4+: s label + sec substitution
      if (step >= 3) {
        const midX = baseX * 0.65;
        const midY = baseY - (baseY - tipY) * 0.35;
        g.append('text')
          .attr('x', midX).attr('y', midY)
          .attr('fill', C.warn).attr('font-size', '15px').attr('font-weight', '700')
          .text('s');
        g.append('text')
          .attr('x', width - 110).attr('y', 38)
          .attr('fill', C.warn).attr('font-size', '12px')
          .text('sec θ = s/D');
      }

      // Step 5: master formula box (big & proud)
      if (step >= 4) {
        const formulaBox = g.append('g').attr('transform', `translate(${width - 178}, ${height - 52})`);
        formulaBox.append('rect')
          .attr('width', 168).attr('height', 42).attr('rx', 6)
          .attr('fill', C.panel).attr('stroke', C.accent).attr('stroke-width', 2);
        formulaBox.append('text')
          .attr('x', 12).attr('y', 18)
          .attr('fill', C.text).attr('font-size', '11px')
          .text('θ′ =');
        formulaBox.append('text')
          .attr('x', 52).attr('y', 18)
          .attr('fill', C.accent).attr('font-size', '15px').attr('font-weight', '700')
          .text('D · h′ / s²');
      }

      // Live values (always visible)
      g.append('text')
        .attr('x', 12).attr('y', 22)
        .attr('fill', C.text).attr('font-size', '13px')
        .text(`h = ${h.toFixed(0)} ft`);
      g.append('text')
        .attr('x', baseX + 12).attr('y', baseY + 22)
        .attr('fill', C.text).attr('font-size', '13px')
        .text(`D = ${D} ft`);
      g.append('text')
        .attr('x', baseX + 12).attr('y', tipY - 22)
        .attr('fill', C.text).attr('font-size', '13px')
        .text(`s = ${s.toFixed(0)} ft`);

      // Current rate (master formula) at top-right of diagram
      g.append('text')
        .attr('x', width - 10).attr('y', 22)
        .attr('text-anchor', 'end')
        .attr('fill', C.accent).attr('font-size', '14px').attr('font-weight', '700')
        .text(`θ′ = ${thetaPrimeMaster.toFixed(4)} rad/s`);

      // Title
      g.append('text')
        .attr('x', width / 2).attr('y', -8)
        .attr('text-anchor', 'middle')
        .attr('fill', C.accent).attr('font-size', '15px').attr('font-weight', '600')
        .text('Rocket Camera Tracking – Abstraction in Related Rates');
    };

    const ro = new ResizeObserver(() => setTimeout(draw, 16));
    if (containerRef.current) ro.observe(containerRef.current);
    draw();

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dark, h, step, thetaPrimeMaster]);

  return (
    <div 
      ref={containerRef}
      style={{
        padding: '16px',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '6px 18px',
            borderRadius: '6px',
            background: isPlaying ? '#ef4444' : '#10b981',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px'
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Rocket Rising'}
        </button>

        <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
            Rocket height h
          </span>
          <input
            type="range"
            min="100"
            max={maxH}
            step="10"
            value={h}
            onChange={e => { setH(+e.target.value); if (isPlaying) setIsPlaying(false); }}
            style={{ flex: 1, accentColor: '#38bdf8' }}
          />
          <span style={{ color: '#38bdf8', fontWeight: '600', minWidth: '48px', textAlign: 'right' }}>
            {h.toFixed(0)} ft
          </span>
        </div>

        <button
          onClick={() => {
            setH(2000);
            setIsPlaying(false);
            setStep(4); // jump to activity
          }}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            background: dark ? '#334155' : '#e2e8f0',
            color: 'var(--color-text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Jump to Activity #3
        </button>
      </div>

      {/* SVG Diagram */}
      <svg 
        ref={svgRef} 
        style={{ 
          width: '100%', 
          display: 'block', 
          borderRadius: '8px',
          background: dark ? '#0f172a' : '#f8fafc'
        }} 
      />

      {/* Step-by-step abstraction panel */}
      <div style={{ 
        marginTop: '16px', 
        background: dark ? '#1e293b' : '#f1f5f9', 
        borderRadius: '8px', 
        padding: '14px',
        border: `1px solid ${dark ? '#475569' : '#e2e8f0'}`
      }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: i === step ? '#0284c7' : (dark ? '#334155' : '#e2e8f0'),
                color: i === step ? '#fff' : (dark ? '#94a3b8' : '#64748b'),
                border: 'none',
                fontSize: '12px',
                fontWeight: i === step ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              {s.num}
            </button>
          ))}
        </div>

        <div style={{ fontWeight: '600', color: dark ? '#a5f3fc' : '#0369a1', fontSize: '15px', marginBottom: '4px' }}>
          {steps[step].title}
        </div>
        <p style={{ 
          color: dark ? '#e2e8f0' : '#1e293b', 
          fontSize: '14px', 
          lineHeight: '1.45',
          margin: 0 
        }}>
          {steps[step].body}
        </p>

        {/* Live verification (always shown) */}
        <div style={{ 
          marginTop: '12px', 
          padding: '8px 12px', 
          background: dark ? '#334155' : '#f8fafc', 
          borderRadius: '6px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: dark ? '#67e8f9' : '#0e7490' }}>Master formula gives:</span>
          <span style={{ fontWeight: '700', color: '#38bdf8' }}>
            θ′ = {thetaPrimeMaster.toFixed(4)} rad/s
          </span>
          <span style={{ color: dark ? '#64748b' : '#94a3b8' }}>• Full trig way also gives:</span>
          <span style={{ fontWeight: '700', color: '#38bdf8' }}>
            {thetaPrimeFull.toFixed(4)} rad/s
          </span>
          <span style={{ color: '#10b981', fontSize: '11px' }}>✅ identical</span>
        </div>
      </div>

      <div style={{ 
        marginTop: '12px', 
        fontSize: '12.5px', 
        color: 'var(--color-text-muted)', 
        textAlign: 'center',
        lineHeight: '1.3'
      }}>
        Drag height • Watch θ′ slow as s grows • Step through to see how the master formula hides all trig
      </div>
    </div>
  );
}
