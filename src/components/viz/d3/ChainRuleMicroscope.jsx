import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ChainRuleMicroscope = ({ width = 900, height = 500 }) => {
  const svgRef = useRef(null);
  const [xVal, setXVal] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, up to 10 = max zoom

  // The functions
  // Inner: u = g(x) = x^2
  // Outer: y = f(u) = sin(u)
  // Combined: y = sin(x^2)
  const g = (x) => x * x;
  const dg = (x) => 2 * x;
  
  const f = (u) => Math.sin(u);
  const df = (u) => Math.cos(u);

  const combined = (x) => f(g(x));

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const uVal = g(xVal);
    const yVal = combined(xVal);

    const m1 = dg(xVal); // inner slope
    const m2 = df(uVal); // outer slope
    const mTotal = m1 * m2; // combined slope

    // 3 Panels vertically or horizontally? Let's do 3 columns horizontally a bit small
    const colW = width / 3;
    const graphH = height - 80;
    const graphW = colW - 40;
    
    // Zoom configurations
    // The higher the zoom, the smaller the domain window around the current point
    const domainSpread = 3 / zoomLevel; 

    // Base domains based on zoom
    const xDomain = [xVal - domainSpread, xVal + domainSpread];
    const uDomain = [uVal - domainSpread, uVal + domainSpread];
    // For Y, we might want to fix it locally or globally. Let's fix globally if zoom=1, locally if zoom>1
    const yDomainFixed = [-1.5, 1.5];
    const yDomainZoom = [yVal - Math.min(domainSpread, 1.5), yVal + Math.min(domainSpread, 1.5)];
    const yDomain = zoomLevel > 1.1 ? yDomainZoom : yDomainFixed;

    // Scales
    const scaleX1 = d3.scaleLinear().domain(xDomain).range([0, graphW]);
    const scaleU1 = d3.scaleLinear().domain(uDomain).range([graphH, 0]);

    const scaleU2 = d3.scaleLinear().domain(uDomain).range([0, graphW]);
    const scaleY2 = d3.scaleLinear().domain(yDomain).range([graphH, 0]);

    const scaleX3 = d3.scaleLinear().domain(xDomain).range([0, graphW]);
    const scaleY3 = d3.scaleLinear().domain(yDomain).range([graphH, 0]);

    // Draw Function helper
    const drawGraph = (gElement, domainx, scalex, scaley, func, color, ptX, ptY, m, title, eqStr) => {
      // Axes
      gElement.append('line').attr('x1', 0).attr('y1', scaley(0) || graphH/2).attr('x2', graphW).attr('y2', scaley(0) || graphH/2).attr('stroke', 'var(--border)');
      gElement.append('line').attr('x1', scalex(0) || graphW/2).attr('y1', 0).attr('x2', scalex(0) || graphW/2).attr('y2', graphH).attr('stroke', 'var(--border)');

      // The Curve
      const lineRes = 100;
      const step = (domainx[1] - domainx[0]) / lineRes;
      const data = d3.range(domainx[0], domainx[1] + step, step).map(x => ({ x, y: func(x) }));
      
      const lineGen = d3.line().x(d => scalex(d.x)).y(d => scaley(d.y)).curve(d3.curveMonotoneX);

      gElement.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', zoomLevel > 3 ? 4 : 2) // thicker when zoomed
        .attr('d', lineGen);

      // Tangent Line
      // Only show tangent line clearly when zoomed in
      const tLen = domainSpread * 0.8;
      gElement.append('line')
        .attr('x1', scalex(ptX - tLen))
        .attr('y1', scaley(ptY - m * tLen))
        .attr('x2', scalex(ptX + tLen))
        .attr('y2', scaley(ptY + m * tLen))
        .attr('stroke', '#eab308')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', zoomLevel > 2 ? 'none' : '4,4')
        .attr('opacity', zoomLevel > 1.5 ? 1 : 0.3);

      // Current Point
      gElement.append('circle')
        .attr('cx', scalex(ptX)).attr('cy', scaley(ptY))
        .attr('r', 6)
        .attr('fill', color);

      // Labels
      gElement.append('text').attr('x', graphW/2).attr('y', -10).attr('text-anchor', 'middle').attr('font-weight', 'bold').attr('fill', 'var(--text)').text(title);
      
      // Slope readout bubble
      gElement.append('rect')
        .attr('x', 10).attr('y', graphH - 30)
        .attr('width', graphW - 20).attr('height', 24)
        .attr('fill', 'var(--surface)').attr('rx', 4).attr('stroke', 'var(--border)');
        
      gElement.append('text')
        .attr('x', graphW/2).attr('y', graphH - 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#eab308')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .text(`Slope m = ${m.toFixed(2)}`);
    };

    // Construct the 3 groups
    const g1 = svg.append('g').attr('transform', `translate(20, 40)`);
    drawGraph(g1, xDomain, scaleX1, scaleU1, g, '#ef4444', xVal, uVal, m1, 'Inner: u = x²', 'g\'(x)');

    const g2 = svg.append('g').attr('transform', `translate(${colW + 20}, 40)`);
    drawGraph(g2, uDomain, scaleU2, scaleY2, f, '#3b82f6', uVal, yVal, m2, 'Outer: y = sin(u)', 'f\'(u)');

    const g3 = svg.append('g').attr('transform', `translate(${colW*2 + 20}, 40)`);
    drawGraph(g3, xDomain, scaleX3, scaleY3, combined, '#a855f7', xVal, yVal, mTotal, 'Combined: y = sin(x²)', 'f\'(g(x))g\'(x)');

    // Multiply graphic in between
    svg.append('text')
       .attr('x', colW)
       .attr('y', height/2)
       .attr('text-anchor', 'middle')
       .attr('font-size', '24px')
       .attr('fill', 'var(--text-muted)')
       .text('×');
       
    svg.append('text')
       .attr('x', colW*2)
       .attr('y', height/2)
       .attr('text-anchor', 'middle')
       .attr('font-size', '24px')
       .attr('fill', 'var(--text-muted)')
       .text('=');

    // Synthesis block
    if (zoomLevel > 3) {
       svg.append('rect')
         .attr('x', width/2 - 150).attr('y', 0)
         .attr('width', 300).attr('height', 30)
         .attr('fill', '#eab308').attr('rx', 4);
         
       svg.append('text')
         .attr('x', width/2).attr('y', 20)
         .attr('text-anchor', 'middle')
         .attr('font-weight', 'bold')
         .attr('fill', '#000')
         .text(`Line 1 × Line 2 = Line 3  (${mTotal.toFixed(2)})`);
    }

  }, [xVal, zoomLevel, width, height]);

  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-4 my-6 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2 text-center text-text">Chain Rule "Microscope Mode"</h3>
      <p className="text-sm text-text-muted mb-4 max-w-2xl text-center">
        As you increase the zoom, notice how the curves flatten into literal straight lines. 
        Once they are lines, geometry proves that feeding Line 1 (x → u) into Line 2 (u → y) 
        creates a new line whose slope is exactly $m_1 \times m_2$.
      </p>
      
      <div className="w-full relative" style={{ height: height + 'px' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      <div className="flex items-center gap-6 mt-4 w-full max-w-3xl bg-surface-alt p-4 rounded-lg">
        <div className="flex-1 flex flex-col">
          <label className="text-sm font-semibold mb-1 flex justify-between text-red-500">
            <span>Position (x)</span>
            <span>{xVal.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.01"
            value={xVal}
            onChange={(e) => setXVal(parseFloat(e.target.value))}
            className="w-full accent-red-500"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label className="text-sm font-semibold mb-1 flex justify-between text-yellow-500">
            <span>Microscope Zoom</span>
            <span>{zoomLevel.toFixed(1)}x</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-full accent-yellow-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ChainRuleMicroscope;
