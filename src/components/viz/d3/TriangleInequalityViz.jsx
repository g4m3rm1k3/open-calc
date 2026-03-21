import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TriangleInequalityViz = ({ width = 800, height = 300 }) => {
  const svgRef = useRef(null);
  
  // States for the two 'vectors' (or numbers) a and b
  const [valA, setValA] = useState(3);
  const [valB, setValB] = useState(-5);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 60, right: 30, bottom: 60, left: 30 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale from -10 to 10
    const xScale = d3.scaleLinear().domain([-10, 10]).range([0, w]);

    // Draw main axis
    g.append('line')
      .attr('x1', xScale(-10))
      .attr('y1', h/2)
      .attr('x2', xScale(10))
      .attr('y2', h/2)
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 2);

    // Axis ticks
    const ticks = d3.range(-10, 11);
    g.selectAll('.tick')
      .data(ticks)
      .join('line')
      .attr('class', 'tick')
      .attr('x1', d => xScale(d))
      .attr('y1', h/2 - 5)
      .attr('x2', d => xScale(d))
      .attr('y2', h/2 + 5)
      .attr('stroke', 'var(--border)');

    g.selectAll('.tick-label')
      .data(ticks.filter(t => t % 2 === 0))
      .join('text')
      .attr('class', 'tick-label')
      .attr('x', d => xScale(d))
      .attr('y', h/2 + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-muted)')
      .attr('font-size', '12px')
      .text(d => d);

    // Arrowhead defs
    svg.append('defs').append('marker')
      .attr('id', 'arrow-a')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(59, 130, 246, 0.8)'); // blue

    svg.append('defs').append('marker')
      .attr('id', 'arrow-b')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(239, 68, 68, 0.8)'); // red

    // Draw vector A starting at 0
    const yA = h/2 - 40;
    g.append('line')
      .attr('x1', xScale(0))
      .attr('y1', yA)
      .attr('x2', xScale(valA))
      .attr('y2', yA)
      .attr('stroke', 'rgba(59, 130, 246, 0.8)')
      .attr('stroke-width', 4)
      .attr('marker-end', 'url(#arrow-a)');
      
    g.append('text')
      .attr('x', xScale(valA / 2))
      .attr('y', yA - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(59, 130, 246, 1)')
      .attr('font-weight', 'bold')
      .text(`a = ${valA}`);

    // Draw vector B starting from tip of A
    const yB = h/2 - 40;
    g.append('line')
      .attr('x1', xScale(valA))
      .attr('y1', yB)
      .attr('x2', xScale(valA + valB))
      .attr('y2', yB)
      .attr('stroke', 'rgba(239, 68, 68, 0.8)')
      .attr('stroke-width', 4)
      .attr('marker-end', 'url(#arrow-b)');

    g.append('text')
      .attr('x', xScale(valA + valB/2))
      .attr('y', yB - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(239, 68, 68, 1)')
      .attr('font-weight', 'bold')
      .text(`b = ${valB}`);
      
    // Draw the resultant vector A+B
    const ySum = h/2 + 40;
    g.append('line')
      .attr('x1', xScale(0))
      .attr('y1', ySum)
      .attr('x2', xScale(valA + valB))
      .attr('y2', ySum)
      .attr('stroke', 'var(--text-accent)')
      .attr('stroke-width', 4)
      .attr('stroke-dasharray', '4,4');

    g.append('text')
      .attr('x', xScale((valA + valB)/2))
      .attr('y', ySum + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-accent)')
      .attr('font-weight', 'bold')
      .text(`a + b = ${valA + valB}`);

    // Connecting dashed lines
    g.append('line')
      .attr('x1', xScale(0))
      .attr('y1', yA)
      .attr('x2', xScale(0))
      .attr('y2', ySum)
      .attr('stroke', 'var(--border)')
      .attr('stroke-dasharray', '2,2');

    g.append('line')
      .attr('x1', xScale(valA + valB))
      .attr('y1', yA)
      .attr('x2', xScale(valA + valB))
      .attr('y2', ySum)
      .attr('stroke', 'var(--border)')
      .attr('stroke-dasharray', '2,2');

  }, [valA, valB, width, height]);

  const lhs = Math.abs(valA + valB);
  const rhs = Math.abs(valA) + Math.abs(valB);
  const isStrict = lhs < rhs;

  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-4 my-6 flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Visual Proof: The Triangle Inequality</h3>
      <p className="text-sm text-text-muted mb-2 text-center">
        The inequality states that <strong>|a + b| ≤ |a| + |b|</strong>. 
      </p>
      <p className="text-sm text-text-muted mb-4 text-center">
        Moving along the number line in opposite directions causes cancellation, making the total distance from zero <em>less than</em> the sum of individual stretches. They only equal each other if they point the same way.
      </p>
      
      <div className="w-full relative" style={{ height: height + 'px' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      <div className="w-full max-w-lg mt-4 text-center">
        <div className={`p-3 rounded-lg border ${isStrict ? 'border-amber-500/50 bg-amber-500/10' : 'border-green-500/50 bg-green-500/10'} mb-4`}>
          <div className="font-mono text-lg">
            |{valA} + {valB}| {isStrict ? '<' : '='} |{valA}| + |{valB}|
          </div>
          <div className="font-mono text-lg font-bold mt-1">
            {lhs} {isStrict ? '<' : '='} {rhs}
          </div>
        </div>

        <div className="flex items-center gap-6 bg-surface-alt p-4 rounded-lg">
          <div className="flex-1 flex flex-col">
            <label className="text-sm font-semibold mb-1 flex justify-between text-blue-500">
              <span>Value a</span>
              <span>{valA}</span>
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={valA}
              onChange={(e) => setValA(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="text-sm font-semibold mb-1 flex justify-between text-red-500">
              <span>Value b</span>
              <span>{valB}</span>
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={valB}
              onChange={(e) => setValB(parseInt(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriangleInequalityViz;
