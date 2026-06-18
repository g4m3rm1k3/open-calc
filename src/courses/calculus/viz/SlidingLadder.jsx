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

export default function SlidingLadder({ params = {} }) {
  const dark = useIsDark();
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Controls
  const [x, setX] = useState(5);           // distance from wall (ft)
  const [dxdt, setDxdt] = useState(2);     // speed bottom slides away (ft/s)
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  const L = 13; // fixed ladder length
  const y = Math.sqrt(L * L - x * x);      // height on wall
  const dydt = x > 0 && y > 0 ? - (x / y) * dxdt : 0;

  // Animation loop
  const rafRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    let raf;
    const animate = () => {
      if (isPlaying && x < L - 0.5) {
        const now = Date.now();
        const dt = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        const newX = Math.min(L - 0.1, x + dxdt * dt * 1.2); // slightly accelerated for visibility
        setX(newX);
        setTime(t => t + dt);
      }
      raf = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      lastTimeRef.current = Date.now();
      raf = requestAnimationFrame(animate);
    }
    rafRef.current = raf;

    return () => cancelAnimationFrame(raf);
  }, [isPlaying, x, dxdt]);

  // Draw the visualization
  useEffect(() => {
    const draw = () => {
      const C = {
        bg: dark ? '#0f172a' : '#ffffff',
        panel: dark ? '#1e293b' : '#f1f5f9',
        axis: dark ? '#475569' : '#94a3b8',
        wall: dark ? '#64748b' : '#475569',
        floor: dark ? '#334155' : '#64748b',
        ladder: dark ? '#38bdf8' : '#0284c7',
        point: dark ? '#f472b6' : '#db2777',
        text: dark ? '#94a3b8' : '#64748b',
        accent: dark ? '#34d399' : '#059669',
        warn: dark ? '#fbbf24' : '#d97706'
      };

      const container = containerRef.current;
      if (!container) return;
      const W = container.clientWidth || 480;
      const H = 320;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg.attr('width', W).attr('height', H);

      // Margins
      const margin = { left: 60, right: 20, top: 40, bottom: 60 };
      const width = W - margin.left - margin.right;
      const height = H - margin.top - margin.bottom;

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales: x from 0 to L, y from 0 to L
      const xScale = d3.scaleLinear().domain([0, L]).range([0, width]);
      const yScale = d3.scaleLinear().domain([0, L]).range([height, 0]);

      // Floor
      g.append('line')
        .attr('x1', 0).attr('y1', height)
        .attr('x2', width).attr('y2', height)
        .attr('stroke', C.floor).attr('stroke-width', 6);

      // Wall
      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 0).attr('y2', height)
        .attr('stroke', C.wall).attr('stroke-width', 8);

      // Ladder
      const xPos = xScale(x);
      const yPos = yScale(y);
      g.append('line')
        .attr('x1', 0).attr('y1', height)
        .attr('x2', xPos).attr('y2', yPos)
        .attr('stroke', C.ladder)
        .attr('stroke-width', 9)
        .attr('stroke-linecap', 'round');

      // Right angle marker at base
      g.append('path')
        .attr('d', `M 8,${height} L 8,${height-8} L 0,${height-8}`)
        .attr('fill', 'none')
        .attr('stroke', C.text)
        .attr('stroke-width', 1.5);

      // Moving point at bottom
      g.append('circle')
        .attr('cx', xPos)
        .attr('cy', height)
        .attr('r', 7)
        .attr('fill', C.point);

      // Moving point at top
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', yPos)
        .attr('r', 7)
        .attr('fill', C.point);

      // Labels
      g.append('text')
        .attr('x', xPos / 2)
        .attr('y', height + 22)
        .attr('text-anchor', 'middle')
        .attr('fill', C.text)
        .attr('font-size', '13px')
        .text(`x = ${x.toFixed(1)} ft`);

      g.append('text')
        .attr('x', -22)
        .attr('y', yPos / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', C.text)
        .attr('font-size', '13px')
        .attr('transform', `rotate(-90, -22, ${yPos / 2})`)
        .text(`y = ${y.toFixed(1)} ft`);

      g.append('text')
        .attr('x', width / 2)
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('fill', C.accent)
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text('Sliding Ladder – Related Rates');

      // Rates display panel (inside SVG for alignment)
      const panelX = width - 170;
      const panelY = 20;

      const panel = g.append('g').attr('transform', `translate(${panelX},${panelY})`);

      panel.append('rect')
        .attr('x', 0).attr('y', 0)
        .attr('width', 160).attr('height', 92)
        .attr('rx', 6)
        .attr('fill', C.panel)
        .attr('stroke', dark ? '#475569' : '#e2e8f0')
        .attr('stroke-width', 1);

      const rateText = (val, label, color) => {
        panel.append('text')
          .attr('x', 12).attr('y', label === 'dx/dt' ? 22 : 48)
          .attr('fill', C.text)
          .attr('font-size', '12px')
          .text(label + ':');
        panel.append('text')
          .attr('x', 148).attr('y', label === 'dx/dt' ? 22 : 48)
          .attr('text-anchor', 'end')
          .attr('fill', color)
          .attr('font-size', '15px')
          .attr('font-weight', '700')
          .text(val.toFixed(2) + ' ft/s');
      };

      rateText(dxdt, 'dx/dt', C.accent);
      rateText(dydt, 'dy/dt', dydt < 0 ? C.warn : C.accent);

      // Legend / explanation
      g.append('text')
        .attr('x', 10)
        .attr('y', height + 48)
        .attr('fill', C.text)
        .attr('font-size', '11px')
        .text('Drag the bottom point • Adjust slider • Press Play to animate');
    };

    const ro = new ResizeObserver(() => {
      // Small delay to let layout settle
      setTimeout(draw, 10);
    });

    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    draw();

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dark, x, dxdt, isPlaying, y, dydt]);

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
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            background: isPlaying ? '#ef4444' : '#10b981',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px'
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play Animation'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
            Bottom speed (dx/dt):
          </span>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.1}
            value={dxdt}
            onChange={(e) => {
              setDxdt(+e.target.value);
              if (isPlaying) setIsPlaying(false); // pause on manual change
            }}
            style={{ 
              flex: 1, 
              accentColor: '#38bdf8' 
            }}
          />
          <span style={{ color: '#38bdf8', fontWeight: '600', minWidth: '38px', textAlign: 'right', fontSize: '13px' }}>
            {dxdt.toFixed(1)} ft/s
          </span>
        </div>

        <button
          onClick={() => {
            setX(5);
            setTime(0);
            setIsPlaying(false);
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            background: dark ? '#334155' : '#e2e8f0',
            color: 'var(--color-text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Reset
        </button>
      </div>

      <svg 
        ref={svgRef} 
        style={{ 
          width: '100%', 
          display: 'block', 
          borderRadius: '8px',
          background: dark ? '#0f172a' : '#f8fafc'
        }} 
      />

      <div style={{ 
        marginTop: '14px', 
        fontSize: '13px', 
        color: 'var(--color-text-muted)', 
        lineHeight: '1.4',
        padding: '10px 12px',
        background: dark ? '#1e293b' : '#f1f5f9',
        borderRadius: '6px'
      }}>
        <strong>Key insight:</strong> As the bottom slides away at constant speed, the top slides down faster and faster (dy/dt becomes more negative). 
        This happens because the relationship is nonlinear — captured perfectly by implicit differentiation of x² + y² = 13².
      </div>
    </div>
  );
}
