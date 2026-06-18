import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const FourierSeries = ({ width = 800, height = 400 }) => {
  const svgRef = useRef(null);
  const [numTerms, setNumTerms] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  // Animation loop
  useEffect(() => {
    let animationFrame;
    if (isPlaying) {
      const animate = () => {
        setTime((t) => (t + 0.05) % (2 * Math.PI));
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const centerX = w * 0.25;
    const centerY = h / 2;
    const pathXStart = w * 0.5;

    // Radius of fundamental
    const R0 = Math.min(centerX, h / 2) * 0.8;

    // Build epicycles
    let currentX = centerX;
    let currentY = centerY;
    const circles = [];
    
    // Target is a square wave: sum of odd harmonics (4/pi)*(sin(nx)/n)
    for (let i = 0; i < numTerms; i++) {
      const n = 2 * i + 1;
      const radius = R0 * (4 / (n * Math.PI));
      const nextX = currentX + radius * Math.cos(n * time);
      const nextY = currentY - radius * Math.sin(n * time); // minus because y goes down

      circles.push({
        x: currentX,
        y: currentY,
        r: radius,
        nextX,
        nextY,
        n
      });

      currentX = nextX;
      currentY = nextY;
    }

    // Draw circles and radii
    const epicycles = g.selectAll('.epicycle').data(circles).join('g').attr('class', 'epicycle');
    
    epicycles.append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.2);

    epicycles.append('line')
      .attr('x1', d => d.x)
      .attr('y1', d => d.y)
      .attr('x2', d => d.nextX)
      .attr('y2', d => d.nextY)
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 2);

    // Tip coordinates
    const tipX = currentX;
    const tipY = currentY;

    // Draw line from tip to graph
    g.append('line')
      .attr('x1', tipX)
      .attr('y1', tipY)
      .attr('x2', pathXStart)
      .attr('y2', tipY)
      .attr('stroke', 'var(--text-accent)')
      .attr('stroke-dasharray', '4,4');

    // Draw the traced path (the wave)
    // We compute the y value for t from 0 to 4pi
    const lineRes = 200;
    const pathData = [];
    for (let i = 0; i < lineRes; i++) {
      const tFunc = time - (i * 4 * Math.PI) / lineRes;
      let yCalc = 0;
      for (let k = 0; k < numTerms; k++) {
        const n = 2 * k + 1;
        yCalc -= R0 * (4 / (n * Math.PI)) * Math.sin(n * tFunc);
      }
      pathData.push({
        x: pathXStart + (i * (w - pathXStart)) / lineRes,
        y: centerY + yCalc
      });
    }

    const lineGenerator = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(pathData)
      .attr('fill', 'none')
      .attr('stroke', 'var(--text-accent)')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Draw invisible target square wave (faint)
    const targetData = [];
    for (let i = 0; i < lineRes; i++) {
        const tFunc = time - (i * 4 * Math.PI) / lineRes;
        // Square wave parity: sin(t) > 0 ? 1 : -1
        // Shifted correctly
        const sign = Math.sin(tFunc) > 0 ? -1 : 1; 
        targetData.push({
            x: pathXStart + (i * (w - pathXStart)) / lineRes,
            y: centerY + sign * R0 * (4 / Math.PI) * (Math.PI / 4) // Simplifies to R0
        });
    }
    
    // Discontinuous line generator for square wave
    const targetLine = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveStepAfter);

    g.append('path')
      .datum(targetData)
      .attr('fill', 'none')
      .attr('stroke', 'var(--text-muted)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .attr('d', targetLine);


  }, [numTerms, time, width, height]);

  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-4 my-6 flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Fourier Series: Square Wave Compression</h3>
      <p className="text-sm text-text-muted mb-4 text-center">
        Every rotating circle represents a new sine wave added to the series (an odd harmonic). 
        The more circles (terms) you add, the closer the sum approximates a perfect square wave. 
        This is how JPEG and MP3 compression encode sharp edges mathematically.
      </p>
      
      <div className="w-full relative" style={{ height: height + 'px' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      <div className="flex items-center gap-6 mt-4 w-full max-w-lg bg-surface-alt p-4 rounded-lg">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-text-accent text-surface font-bold rounded hover:opacity-90 transition-opacity min-w-[100px]"
        >
          {isPlaying ? 'Pause' : 'Animate'}
        </button>

        <div className="flex-1 flex flex-col">
          <label className="text-sm font-semibold mb-1 flex justify-between">
            <span>Harmonics (N): {numTerms}</span>
            <span className="text-text-muted">Higher N = higher fidelity</span>
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={numTerms}
            onChange={(e) => setNumTerms(parseInt(e.target.value))}
            className="w-full accent-text-accent"
          />
        </div>
      </div>
    </div>
  );
};

export default FourierSeries;
