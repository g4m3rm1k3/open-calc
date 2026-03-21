import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GradientDescentLoss = ({ width = 800, height = 500 }) => {
  const svgRef = useRef(null);
  const [learningRate, setLearningRate] = useState(0.05);
  const [params, setParams] = useState({ w1: -2, w2: 2 });
  const [path, setPath] = useState([{ w1: -2, w2: 2 }]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // The loss surface function: L(w1, w2) = w1^2 / 2 + w2^2
  const lossFunction = (w1, w2) => (w1 * w1) / 2 + (w2 * w2);
  // Gradients
  const gradLoss = (w1, w2) => ({
    dw1: w1,
    dw2: 2 * w2,
  });

  // Step the optimizer
  useEffect(() => {
    let timer;
    if (isOptimizing) {
      timer = setTimeout(() => {
        setParams(prev => {
          const grads = gradLoss(prev.w1, prev.w2);
          const nextW1 = prev.w1 - learningRate * grads.dw1;
          const nextW2 = prev.w2 - learningRate * grads.dw2;

          // Check if converged
          if (Math.abs(grads.dw1) < 0.01 && Math.abs(grads.dw2) < 0.01 && !path[path.length-1].converged) {
             setIsOptimizing(false);
             setPath(p => [...p, { w1: nextW1, w2: nextW2, converged: true }]);
             return prev;
          }

          const nextParams = { w1: nextW1, w2: nextW2 };
          setPath(p => [...p, nextParams]);
          return nextParams;
        });
      }, 50);
    }
    return () => clearTimeout(timer);
  }, [isOptimizing, params, learningRate, path]);

  const reset = () => {
    setIsOptimizing(false);
    const start = { w1: -2 + Math.random(), w2: 2 * (Math.random() > 0.5 ? 1 : -1) };
    setParams(start);
    setPath([start]);
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // We draw a top-down contour map
    const xScale = d3.scaleLinear().domain([-3, 3]).range([0, w]);
    const yScale = d3.scaleLinear().domain([-3, 3]).range([h, 0]);

    // Draw axes
    g.append('g')
      .attr('transform', `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', 'var(--border)');
      
    g.append('g')
      .attr('transform', `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', 'var(--border)');

    // Generate contour data
    const n = Math.ceil(w / 10);
    const m = Math.ceil(h / 10);
    const grid = new Array(n * m);
    for (let j = 0; j < m; ++j) {
      for (let i = 0; i < n; ++i) {
        const valX = xScale.invert(i * 10);
        const valY = yScale.invert(j * 10);
        grid[j * n + i] = lossFunction(valX, valY);
      }
    }
    
    // Convert to D3 contours
    const contours = d3.contours()
        .size([n, m])
        .thresholds(d3.range(0, 10, 0.5))
        (grid);

    const transformPath = (pathObj) => {
        // scale contour coordinates up to pixel space
        const p = d3.geoPath()({
            type: "Feature",
            geometry: pathObj
        });
        // We have to manually scale because d3.contours outputs in grid [0,n]x[0,m] coordinates
        // Actually, easiest is a scale transform mapping [0, n] -> [0, w]
        return p;
    };

    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([10, 0]);

    const contourG = g.append('g')
      .attr('transform', `scale(${w / n}, ${h / m})`);

    contourG.selectAll("path")
      .data(contours)
      .join("path")
        .attr("d", d3.geoPath())
        .attr("fill", d => colorScale(d.value))
        .attr("stroke", "rgba(0,0,0,0.1)")
        .attr("stroke-width", 0.5);

    // Draw the path taken by the optimizer
    const line = d3.line()
      .x(d => xScale(d.w1))
      .y(d => yScale(d.w2));

    g.append('path')
      .datum(path)
      .attr('fill', 'none')
      .attr('stroke', 'var(--text-accent)')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Draw current parameter dot
    g.append('circle')
      .attr('cx', xScale(params.w1))
      .attr('cy', yScale(params.w2))
      .attr('r', 6)
      .attr('fill', 'red')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Add tangent vector showing the negative gradient direction
    const currentGrad = gradLoss(params.w1, params.w2);
    const norm = Math.sqrt(currentGrad.dw1**2 + currentGrad.dw2**2) + 0.001;
    // Scale for visual display
    const vecX = -(currentGrad.dw1 / norm) * 40;
    const vecY = -(currentGrad.dw2 / norm) * 40;

    if (!path[path.length-1].converged) {
        g.append('line')
        .attr('x1', xScale(params.w1))
        .attr('y1', yScale(params.w2))
        .attr('x2', xScale(params.w1) + vecX)
        .attr('y2', yScale(params.w2) - vecY) // -vecY because SVG y goes down
        .attr('stroke', 'rgba(255,0,0,0.8)')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)');
    }

    // Arrowhead def
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(255,0,0,0.8)');

  }, [width, height, path, params]);

  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-4 my-6 flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Vector Field: Gradient Descent on a Loss Surface</h3>
      <p className="text-sm text-text-muted mb-4 text-center">
        The contour plot shows a 2D parameter space (like AI weights). Darker blue means lower loss. 
        The red vector is the negative gradient — the direction of steepest descent. 
        When you optimize, the network updates its path mathematically taking a step along this vector.
      </p>
      
      <div className="w-full relative" style={{ height: height + 'px' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      <div className="flex items-center gap-6 mt-4 w-full max-w-lg bg-surface-alt p-4 rounded-lg">
        <button
          onClick={() => setIsOptimizing(!isOptimizing)}
          disabled={path[path.length-1]?.converged}
          className="px-4 py-2 bg-text-accent text-surface font-bold rounded hover:opacity-90 transition-opacity min-w-[100px] disabled:opacity-50"
        >
          {isOptimizing ? 'Pause' : (path[path.length-1]?.converged ? 'Converged' : 'Optimize')}
        </button>

        <button
          onClick={reset}
          className="px-4 py-2 border border-border text-text-muted font-bold rounded hover:bg-surface transition-colors"
        >
          Reset Pos
        </button>

        <div className="flex-1 flex flex-col">
          <label className="text-sm font-semibold mb-1 flex justify-between">
            <span>Learning Rate (Step size)</span>
            <span>{learningRate.toFixed(3)}</span>
          </label>
          <input
            type="range"
            min="0.01"
            max="0.4"
            step="0.01"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            className="w-full accent-text-accent"
          />
        </div>
      </div>
    </div>
  );
};

export default GradientDescentLoss;
