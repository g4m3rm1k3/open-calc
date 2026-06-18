import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PolarCoordinateMorph = ({ width = 800, height = 500 }) => {
  const svgRef = useRef(null);
  
  // 0 = Rectangular (x,y), 1 = Polar (r, theta)
  const [morphState, setMorphState] = useState(0);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 40;

    const gOuter = svg.append('g').attr('transform', `translate(${cx}, ${cy})`);

    // We draw a grid.
    // In rectangular (t=0), the grid lines are horizontal and vertical.
    // In polar (t=1), the "horizontal" lines become circles (constant r),
    // and the "vertical" lines become radial spokes (constant theta).

    const gridLines = [];
    
    // Constant Radii (y in rectangular morphing to r in polar)
    for (let r = 1; r <= 5; r++) {
       const val = r * (maxRadius / 5);
       gridLines.push({ type: 'r', val });
    }
    
    // Constant Angles (x in rectangular morphing to theta in polar)
    for (let a = 0; a < 12; a++) { // 12 spokes, 30 degrees each
       const theta = a * (Math.PI / 6);
       gridLines.push({ type: 'theta', val: theta });
    }

    // Function to calculate position given (r, theta) base coords and morph time t
    // t=0 -> Rectangular mapping:
    //    We map r values to y. theta values to x.
    //    Actually, let's map: 
    //    x_rect = theta_mapped (spread out linearly)
    //    y_rect = r_val
    // t=1 -> Polar mapping: 
    //    x_polar = r * cos(theta)
    //    y_polar = r * sin(theta)

    const getPathForR = (r_val, t) => {
      // Line of constant R. It spans theta from 0 to 2pi.
      const pts = [];
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * 2 * Math.PI;
        
        // Rect coord
        const x0 = (theta - Math.PI) * (maxRadius / Math.PI); // center at 0
        const y0 = -r_val; // up is negative in svg

        // Polar coord
        const x1 = r_val * Math.cos(theta - Math.PI/2); // start top
        const y1 = r_val * Math.sin(theta - Math.PI/2);

        pts.push([
           x0 * (1-t) + x1 * t,
           y0 * (1-t) + y1 * t
        ]);
      }
      return d3.line()(pts);
    };

    const getPathForTheta = (theta_val, t) => {
      // Line of constant Theta. Spans r from 0 to maxRadius.
      const pts = [];
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const r = (i / steps) * maxRadius;
        
        // Rect coord
        const x0 = (theta_val - Math.PI) * (maxRadius / Math.PI);
        const y0 = -r;

        // Polar coord
        const x1 = r * Math.cos(theta_val - Math.PI/2);
        const y1 = r * Math.sin(theta_val - Math.PI/2);

        pts.push([
           x0 * (1-t) + x1 * t,
           y0 * (1-t) + y1 * t
        ]);
      }
      return d3.line()(pts);
    };

    // Draw the grid
    gridLines.forEach(line => {
       if (line.type === 'r') {
          gOuter.append('path')
            .attr('d', getPathForR(line.val, morphState))
            .attr('fill', 'none')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.5);
       } else {
          gOuter.append('path')
            .attr('d', getPathForTheta(line.val, morphState))
            .attr('fill', 'none')
            .attr('stroke', '#a855f7')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.5);
       }
    });

    // Draw a prominent "Shape" (a square in rect that becomes a wedge in polar)
    // R from 3 to 4. Theta from pi/6 to pi/3.
    const rStart = 3 * (maxRadius / 5);
    const rEnd = 4 * (maxRadius / 5);
    const thStart = 2 * Math.PI / 6;
    const thEnd = 4 * Math.PI / 6;
    
    const shapePts = [];
    const res = 20;
    // Bottom edge (rStart, thStart to thEnd)
    for (let i=0; i<=res; i++) {
      const th = thStart + (i/res)*(thEnd - thStart);
      shapePts.push({r: rStart, th});
    }
    // Right edge (thEnd, rStart to rEnd)
    for (let i=0; i<=res; i++) {
      const r = rStart + (i/res)*(rEnd - rStart);
      shapePts.push({r, th: thEnd});
    }
    // Top edge (rEnd, thEnd to thStart)
    for (let i=0; i<=res; i++) {
      const th = thEnd - (i/res)*(thEnd - thStart);
      shapePts.push({r: rEnd, th});
    }
    // Left edge (thStart, rEnd to rStart)
    for (let i=0; i<=res; i++) {
      const r = rEnd - (i/res)*(rEnd - rStart);
      shapePts.push({r, th: thStart});
    }
    
    const mappedPts = shapePts.map(p => {
       const x0 = (p.th - Math.PI) * (maxRadius / Math.PI);
       const y0 = -p.r;
       const x1 = p.r * Math.cos(p.th - Math.PI/2);
       const y1 = p.r * Math.sin(p.th - Math.PI/2);
       return [
          x0 * (1-morphState) + x1 * morphState,
          y0 * (1-morphState) + y1 * morphState
       ];
    });
    
    gOuter.append('path')
      .attr('d', d3.line()(mappedPts) + 'Z')
      .attr('fill', '#eab308')
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#ca8a04')
      .attr('stroke-width', 3);

  }, [morphState, width, height]);

  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-4 my-6 flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2 text-center text-text">The Coordinate Morph: Rectangular to Polar</h3>
      <p className="text-sm text-text-muted mb-4 max-w-2xl text-center">
        This is why $dx \cdot dy$ corresponds to a wedge $r \cdot dr \cdot d\theta$. A perfect rectangle in $(r, \theta)$ space physically warps into a curved slice of pizza when mapped into physical $(x, y)$ space. The further away from the center, the wider the pizza slice gets.
      </p>
      
      <div className="w-full relative" style={{ height: height + 'px' }}>
        <svg ref={svgRef} width="100%" height="100%" />

        {/* Floating Labels */}
        <div className="absolute top-4 left-4 font-bold text-blue-500">
          Blue: Constant Radius ($r / y$)
        </div>
        <div className="absolute top-10 left-4 font-bold text-purple-500">
          Purple: Constant Angle ($\theta / x$)
        </div>
      </div>

      <div className="w-full max-w-2xl mt-4 bg-surface-alt p-4 rounded-lg flex flex-col items-center">
        <label className="text-sm font-semibold mb-2 flex justify-between w-full text-slate-700 dark:text-slate-300">
          <span>Abstract $(r, \theta)$ Graph</span>
          <span className="text-brand-500">Warping...</span>
          <span>Physical $(x, y)$ Space</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={morphState}
          onChange={(e) => setMorphState(parseFloat(e.target.value))}
          className="w-full accent-brand-500"
        />
      </div>
    </div>
  );
};

export default PolarCoordinateMorph;
