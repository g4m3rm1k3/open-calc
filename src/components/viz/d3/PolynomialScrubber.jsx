import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PolynomialScrubber = ({ width = 900, height = 400 }) => {
  const svgRef = useRef(null);
  
  // We'll use a specific polynomial: p(x) = x^3 - 4x^2 + x + 6
  // (roots at x = -1, 2, 3)
  const coeffs = [1, -4, 1, 6]; 
  const p = (x) => x*x*x - 4*x*x + x + 6;
  
  const [c, setC] = useState(1); // the divisor x - c

  // Synthetic division logic
  // Dividing p(x) by (x - c)
  const syntheticDivision = (coeffs, c) => {
    let row1 = [...coeffs];
    let row2 = [0]; // multiplies
    let row3 = [row1[0]]; // sums
    
    for (let i = 1; i < row1.length; i++) {
        let mult = row3[i-1] * c;
        row2.push(mult);
        row3.push(row1[i] + mult);
    }
    
    return { row1, row2, row3 };
  };

  const { row1, row2, row3 } = syntheticDivision(coeffs, c);
  const remainder = row3[row3.length - 1];

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // D3 GRAPH SETUP
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const graphW = width * 0.5 - margin.left - margin.right;
    const graphH = height - margin.top - margin.bottom;

    const gGraph = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    const xDomain = [-3, 5];
    const yDomain = [-10, 15];

    const xScale = d3.scaleLinear().domain(xDomain).range([0, graphW]);
    const yScale = d3.scaleLinear().domain(yDomain).range([graphH, 0]);

    // Axes
    gGraph.append('line').attr('x1', 0).attr('y1', yScale(0)).attr('x2', graphW).attr('y2', yScale(0)).attr('stroke', 'var(--border)');
    gGraph.append('line').attr('x1', xScale(0)).attr('y1', 0).attr('x2', xScale(0)).attr('y2', graphH).attr('stroke', 'var(--border)');

    // Polynomial Curve
    const lineRes = 100;
    const step = (xDomain[1] - xDomain[0]) / lineRes;
    const data = d3.range(xDomain[0], xDomain[1] + step, step).map(x => ({ x, y: p(x) }));
    
    const lineGen = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveMonotoneX);

    gGraph.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', lineGen);

    // Draggable 'c' line
    gGraph.append('line')
      .attr('x1', xScale(c)).attr('y1', 0)
      .attr('x2', xScale(c)).attr('y2', graphH)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    // Intersect Point
    gGraph.append('circle')
      .attr('cx', xScale(c)).attr('cy', yScale(remainder))
      .attr('r', 8)
      .attr('fill', '#ef4444');
      
    // Point label
    gGraph.append('text')
      .attr('x', xScale(c) + 12)
      .attr('y', yScale(remainder) - 12)
      .text(`( ${c.toFixed(1)}, ${remainder.toFixed(1)} )`)
      .attr('fill', '#ef4444')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px');

  }, [c, width, height, remainder]);

  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-4 my-6 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2 text-center text-text">The Remainder Theorem Live Sync</h3>
      <p className="text-sm text-text-muted mb-4 max-w-3xl text-center">
        Drag the vertical divisor line $x - c$. Notice how the algebraic remainder at the end of the Synthetic Division table is always identical to the physical $y$-coordinate on the graph. Division is just evaluation!
      </p>
      
      <div className="flex w-full" style={{ height: height + 'px' }}>
        {/* Left Side: Real-time Graph */}
        <div className="w-1/2 relative">
          <svg ref={svgRef} width="100%" height="100%" />
        </div>

        {/* Right Side: Synthetic Division Table */}
        <div className="w-1/2 flex items-center justify-center p-6 bg-surface-alt rounded-r-lg border-l border-border relative">
          
          <div className="absolute top-4 left-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
            Synthetic Division Table
          </div>

          <div className="font-mono text-2xl flex flex-col items-start bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
             
             {/* Denominator (c) */}
             <div className="flex mb-2 items-center">
                <span className="text-red-500 font-bold mr-6">{c.toFixed(1)}</span>
                <div className="border-l-2 border-slate-400 pl-4 flex gap-8">
                   {row1.map((v, i) => <span key={`r1-${i}`} className="w-12 text-center">{v}</span>)}
                </div>
             </div>

             {/* Multiplies */}
             <div className="flex ml-14 pl-4 gap-8">
                 {row2.map((v, i) => <span key={`r2-${i}`} className={`w-12 text-center ${i===0 ? 'opacity-0' : 'text-slate-500'}`}>{v.toFixed(1)}</span>)}
             </div>

             {/* Sums (Result) */}
             <div className="flex ml-14 pl-4 gap-8 border-t-2 border-slate-800 dark:border-slate-300 pt-2 relative">
                 {row3.map((v, i) => (
                    <span key={`r3-${i}`} className={`w-12 text-center font-bold ${i === row3.length-1 ? 'text-red-500 bg-red-100 dark:bg-red-900/30 rounded' : 'text-blue-600 dark:text-blue-400'}`}>
                      {v.toFixed(1)}
                    </span>
                 ))}
                 
                 {/* Remainder separator */}
                 <div className="absolute top-0 bottom-0 border-l border-dashed border-slate-400" style={{ right: '80px' }} />
             </div>
             
             <div className="mt-8 text-sm text-center w-full text-slate-500 font-sans italic">
               Quotient: 1x² + {(row3[1]).toFixed(1)}x + {(row3[2]).toFixed(1)} <br/>
               <span className="font-bold text-red-500 not-italic border-t border-red-200 block pt-2 mt-2">Remainder = {remainder.toFixed(1)}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mt-4 bg-surface-alt p-4 rounded-lg flex flex-col items-center">
        <label className="text-sm font-semibold mb-2 flex justify-between w-full text-red-500">
          <span>Root candidate (c)</span>
          <span>c = {c.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min="-2.5"
          max="4"
          step="0.1"
          value={c}
          onChange={(e) => setC(parseFloat(e.target.value))}
          className="w-full accent-red-500"
        />
        <div className="w-full text-center mt-2 text-xs text-text-muted">
           Try dragging c to -1, 2, or 3 (the physical x-intercepts). Watch the remainder go perfectly to 0!
        </div>
      </div>
    </div>
  );
};

export default PolynomialScrubber;
