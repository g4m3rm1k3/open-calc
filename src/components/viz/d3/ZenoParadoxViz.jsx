import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ZenoParadoxViz = ({ width = 800, height = 300 }) => {
  const svgRef = useRef(null);
  const [stepCount, setStepCount] = useState(0);

  // Zeno's paradox: walk half the remaining distance to the wall.
  // wall is at x=1.
  
  const calculatePosition = (n) => {
     let pos = 0;
     for(let i=1; i<=n; i++) {
        pos += Math.pow(0.5, i);
     }
     return pos;
  }

  const currentPos = calculatePosition(stepCount);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 60, bottom: 60, left: 40 };
    const maxW = width - margin.left - margin.right;
    const maxH = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 1.05]).range([0, maxW]);

    // Number line
    g.append('line')
      .attr('x1', xScale(0)).attr('y1', maxH/2)
      .attr('x2', xScale(1.05)).attr('y2', maxH/2)
      .attr('stroke', '#475569')
      .attr('stroke-width', 4);

    // Wall at x=1
    g.append('line')
      .attr('x1', xScale(1)).attr('y1', maxH/2 - 60)
      .attr('x2', xScale(1)).attr('y2', maxH/2 + 60)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 8);

    g.append('text')
      .attr('x', xScale(1)).attr('y', maxH/2 - 70)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ef4444')
      .attr('font-weight', 'bold')
      .text('The Wall (Limit L = 1)');

    // Origin
    g.append('circle').attr('cx', xScale(0)).attr('cy', maxH/2).attr('r', 6).attr('fill', '#475569');
    g.append('text').attr('x', xScale(0)).attr('y', maxH/2 + 25).attr('text-anchor', 'middle').text('0').attr('fill', 'var(--text)');
    
    // Draw all previous steps
    let p = 0;
    for (let i = 1; i <= stepCount; i++) {
        const nextP = p + Math.pow(0.5, i);
        // Step Arc
        const r = (xScale(nextP) - xScale(p)) / 2;
        const cx = xScale(p) + r;
        
        g.append('path')
         .attr('d', `M ${xScale(p)} ${maxH/2} A ${r} ${r} 0 0 1 ${xScale(nextP)} ${maxH/2}`)
         .attr('fill', 'none')
         .attr('stroke', '#3b82f6')
         .attr('stroke-width', 2)
         .attr('stroke-dasharray', '4,4');

        p = nextP;
    }

    // Current position
    g.append('circle').attr('cx', xScale(currentPos)).attr('cy', maxH/2).attr('r', 10).attr('fill', '#3b82f6');
    g.append('text')
      .attr('x', xScale(currentPos)).attr('y', maxH/2 + 30)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('fill', '#3b82f6')
      .text(currentPos.toFixed(4));
      
    // Distance remaining
    const remaining = 1 - currentPos;
    g.append('line')
      .attr('x1', xScale(currentPos)).attr('y1', maxH/2 + 45)
      .attr('x2', xScale(1)).attr('y2', maxH/2 + 45)
      .attr('stroke', '#eab308')
      .attr('stroke-width', 2);
      
    g.append('text')
      .attr('x', xScale(currentPos + remaining/2)).attr('y', maxH/2 + 65)
      .attr('text-anchor', 'middle')
      .attr('fill', '#eab308')
      .attr('font-size', '12px')
      .text(`gap = ${remaining.toFixed(5)}`);

  }, [stepCount, width, height, currentPos]);

  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-4 my-6 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2 text-center text-text">Zeno's Paradox: The Vibe of Infinity</h3>
      <p className="text-sm text-text-muted mb-4 max-w-2xl text-center">
        To touch the wall, you must walk half the remaining distance. But there is ALWAYS a half-distance left. You never mathematically arrive, but the <strong>Limit</strong> is the wall itself. The limit describes the <em>destination</em>, not the journey.
      </p>
      
      <div className="w-full relative" style={{ height: height + 'px' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      <div className="w-full max-w-lg mt-4 bg-surface-alt p-4 rounded-lg flex flex-col items-center">
        <label className="text-sm font-semibold mb-2 flex justify-between w-full text-blue-500">
          <span>Walk half the distance...</span>
          <span>Step {stepCount}</span>
        </label>
        <input
          type="range"
          min="0"
          max="12"
          step="1"
          value={stepCount}
          onChange={(e) => setStepCount(parseInt(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setStepCount(p => Math.min(12, p + 1))}
              className="px-6 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition"
              disabled={stepCount >= 12}
            >
               Take Next Step
            </button>
            <button 
              onClick={() => setStepCount(0)}
              className="px-6 py-2 border border-slate-300 text-slate-500 font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
               Reset
            </button>
        </div>
      </div>
    </div>
  );
};

export default ZenoParadoxViz;
