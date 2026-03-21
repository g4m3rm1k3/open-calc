import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PoiseuilleBloodFlow = ({ width = 800, height = 300 }) => {
  const svgRef = useRef(null);
  const [radius, setRadius] = useState(1);
  const [pressure, setPressure] = useState(1);
  const [viscosity, setViscosity] = useState(1); // normalized
  const [layerDensity, setLayerDensity] = useState(5); // number of integrated rings

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // We draw an artery cross section
    const centerX = w * 0.25;
    const centerY = h / 2;
    // max radius mapping
    const R_max = Math.min(centerX, h / 2) * 0.9;
    const currentR = R_max * radius;

    // Draw main artery wall
    g.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', currentR)
      .attr('fill', 'rgba(255, 100, 100, 0.1)')
      .attr('stroke', 'rgba(255, 100, 100, 0.8)')
      .attr('stroke-width', 4);

    // Draw concentric fluid rings representing integration slices (dr)
    const dr = currentR / layerDensity;
    const rings = [];
    for (let i = 0; i < layerDensity; i++) {
        // v(r) = (P / 4nL) * (R^2 - r^2)
        // normalized relative velocity 
        const r_val = i * dr;
        const velocity = (pressure / viscosity) * (currentR**2 - r_val**2) / (currentR**2); 
        rings.push({ r_inner: r_val, r_outer: (i+1)*dr, v: Math.max(0, velocity) });
    }

    const arcGenerator = d3.arc()
        .innerRadius(d => d.r_inner)
        .outerRadius(d => d.r_outer)
        .startAngle(0)
        .endAngle(Math.PI * 2);

    const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, (pressure/viscosity) * 1.5]);

    g.selectAll('.ring')
      .data(rings)
      .join('path')
      .attr('class', 'ring')
      .attr('transform', `translate(${centerX},${centerY})`)
      .attr('d', arcGenerator)
      .attr('fill', d => colorScale(d.v))
      .attr('stroke', 'rgba(255,255,255,0.3)')
      .attr('stroke-width', 1);

    // Flow Profile Graph (Parabola)
    const graphX = centerX + R_max + 40;
    const graphW = w - graphX - 20;
    
    // Axes for graph
    const xScale = d3.scaleLinear().domain([0, 2]).range([0, graphW]); // velocity axis
    const yScale = d3.scaleLinear().domain([-1.2, 1.2]).range([h, 0]); // radial axis (r/R_max)

    g.append('g')
      .attr('transform', `translate(${graphX},${h/2})`)
      .call(d3.axisBottom(xScale).ticks(3).tickFormat(() => ''))
      .attr('color', 'var(--border)');

    g.append('g')
      .attr('transform', `translate(${graphX},0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(() => ''))
      .attr('color', 'var(--border)');

    g.append('text')
      .attr('x', graphX + graphW/2)
      .attr('y', h/2 + 20)
      .attr('fill', 'var(--text-muted)')
      .text('Fluid Velocity v(r)');

    g.append('text')
      .attr('x', graphX - 45)
      .attr('y', 10)
      .attr('fill', 'var(--text-muted)')
      .text('Artery Wall');

    // Draw Parabola
    const flowData = [];
    for (let r = -radius; r <= radius; r += radius/20) {
        // v = (P) * (R^2 - r^2)
        const v = (pressure / viscosity) * (radius**2 - r**2);
        flowData.push({ r, v });
    }

    const line = d3.line()
      .x(d => graphX + xScale(Math.max(0, d.v)))
      .y(d => yScale(d.r))
      .curve(d3.curveMonotoneY);

    g.append('path')
      .datum(flowData)
      .attr('fill', 'rgba(220, 50, 50, 0.2)')
      .attr('stroke', 'rgba(220, 50, 50, 1)')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Compute total flow Q dynamically
    // Q = integral of v(r)*2*pi*r dr
    const computedQ = (Math.PI * pressure * radius**4) / (8 * viscosity);

    g.append('text')
      .attr('x', graphX + 20)
      .attr('y', h - 10)
      .attr('fill', 'var(--text-accent)')
      .attr('font-weight', 'bold')
      .text(`Total Flow Output ∫: ${computedQ.toFixed(2)}`);

  }, [radius, pressure, viscosity, layerDensity, width, height]);

  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-4 my-6 flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Poiseuille's Law: Integrating Blood Flow</h3>
      <p className="text-sm text-text-muted mb-4 text-center">
        Blood moves fast in the center and sticks to the artery walls (v=0). 
        Calculus finds total flow by integrating consecutive concentric rings of fluid. 
        Notice how increasing the radius $R$ expands the total Flow (Q) by $R^4$ - a 2x wider artery moves 16x more blood!
      </p>
      
      <div className="w-full relative" style={{ height: height + 'px' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 mt-4 w-full bg-surface-alt p-4 rounded-lg">
        
        <div className="flex flex-col flex-1 min-w-[150px]">
          <label className="text-sm font-semibold mb-1 flex justify-between">
            <span>Artery Radius (R)</span>
            <span>{radius.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.3"
            max="1.2"
            step="0.05"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full accent-text-accent"
          />
        </div>

        <div className="flex flex-col flex-1 min-w-[150px]">
          <label className="text-sm font-semibold mb-1 flex justify-between">
            <span>Pressure Gradient</span>
            <span>{pressure.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={pressure}
            onChange={(e) => setPressure(parseFloat(e.target.value))}
            className="w-full accent-text-accent"
          />
        </div>

        <div className="flex flex-col flex-1 min-w-[150px]">
          <label className="text-sm font-semibold mb-1 flex justify-between">
            <span>Calculus Integration Rings</span>
            <span>{layerDensity}</span>
          </label>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={layerDensity}
            onChange={(e) => setLayerDensity(parseInt(e.target.value))}
            className="w-full accent-text-accent"
          />
        </div>

      </div>
    </div>
  );
};

export default PoiseuilleBloodFlow;
