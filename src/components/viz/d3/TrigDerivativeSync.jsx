import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TrigDerivativeSync = ({ width = 900, height = 500 }) => {
  const svgRef = useRef(null);
  const [theta, setTheta] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let animationFrame;
    if (isPlaying) {
      const animate = () => {
        setTheta((prev) => {
          let next = prev + 0.02;
          if (next > 2 * Math.PI) next -= 2 * Math.PI;
          return next;
        });
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

    // Define dimensions for the 3 panels
    const circleCenter = { x: width * 0.25, y: height / 2 };
    const circleRadius = Math.min(width * 0.2, height * 0.4);

    const graphMargin = { top: 30, right: 30, bottom: 30, left: 60 };
    const graphW = width * 0.45;
    const graphH = height / 2 - 40;

    const sineX = width * 0.5;
    const sineY = graphMargin.top;
    
    const cosX = width * 0.5;
    const cosY = height / 2 + graphMargin.top;

    // ----- SCALES -----
    // Circle scale
    const scaleC = d3.scaleLinear().domain([-1.5, 1.5]).range([-circleRadius * 1.5, circleRadius * 1.5]);
    
    // Graph scales
    const scaleTheta = d3.scaleLinear().domain([0, 2 * Math.PI]).range([0, graphW]);
    const scaleSineY = d3.scaleLinear().domain([-1.5, 1.5]).range([graphH, 0]);
    const scaleCosY = d3.scaleLinear().domain([-1.5, 1.5]).range([graphH, 0]);

    // ARROWS DEF
    svg.append('defs').append('marker')
      .attr('id', 'vel-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#eab308'); // yellow

    svg.append('defs').append('marker')
      .attr('id', 'ghost-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(150, 150, 150, 0.4)');

    // ==========================================
    // PANEL A: UNIT CIRCLE
    // ==========================================
    const gCircle = svg.append('g').attr('transform', `translate(${circleCenter.x}, ${circleCenter.y})`);

    // The circle (track) behind axes
    gCircle.append('circle')
      .attr('cx', 0).attr('cy', 0)
      .attr('r', scaleC(1) - scaleC(0))
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 2)
      .attr('opacity', 0.2);

    // Axes
    gCircle.append('line').attr('x1', scaleC(-1.5)).attr('y1', 0).attr('x2', scaleC(1.5)).attr('y2', 0).attr('stroke', 'currentColor').attr('opacity', 0.2);
    gCircle.append('line').attr('x1', 0).attr('y1', scaleC(-1.5)).attr('x2', 0).attr('y2', scaleC(1.5)).attr('stroke', 'currentColor').attr('opacity', 0.2);

    // Current point
    const pX = Math.cos(theta);
    const pY = Math.sin(theta);
    
    // Ghost Vector at theta=0
    gCircle.append('line')
      .attr('x1', scaleC(1))
      .attr('y1', scaleC(0))
      .attr('x2', scaleC(1)) // x is constant
      .attr('y2', scaleC(-1)) // -1 because svg y goes down
      .attr('stroke', 'rgba(150, 150, 150, 0.4)')
      .attr('stroke-width', 4)
      .attr('marker-end', 'url(#ghost-arrow)');
    
    // Angle arc
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(30)
      .startAngle(Math.PI / 2) // D3 arc 0 is up
      .endAngle(Math.PI / 2 - theta); // Clockwise adjustment
      
    gCircle.append('path')
      .attr('d', arc)
      .attr('fill', 'rgba(59, 130, 246, 0.2)');

    // Point
    gCircle.append('circle')
      .attr('cx', scaleC(pX)).attr('cy', scaleC(-pY))
      .attr('r', 6)
      .attr('fill', 'var(--text-accent)');

    // Velocity Vector
    const velX = -Math.sin(theta);
    const velY = Math.cos(theta); // derivative
    
    gCircle.append('line')
      .attr('x1', scaleC(pX))
      .attr('y1', scaleC(-pY))
      .attr('x2', scaleC(pX + velX))
      .attr('y2', scaleC(-(pY + velY))) // svg y inverted
      .attr('stroke', '#eab308')
      .attr('stroke-width', 4)
      .attr('marker-end', 'url(#vel-arrow)');
      
    // Vertical component of velocity (the red part showing dy/dt)
    gCircle.append('line')
      .attr('x1', scaleC(pX))
      .attr('y1', scaleC(-pY))
      .attr('x2', scaleC(pX)) // only vertical component
      .attr('y2', scaleC(-(pY + velY)))
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '2,2');

    gCircle.append('text')
      .attr('x', 0)
      .attr('y', scaleC(1.4))
      .attr('text-anchor', 'middle')
      .text('Unit Circle (Path)')
      .attr('fill', 'var(--text-muted)')
      .attr('font-weight', 'bold');

    // ==========================================
    // PANEL B: SINE GRAPH (HEIGHT / POSITION)
    // ==========================================
    const gSine = svg.append('g').attr('transform', `translate(${sineX}, ${sineY})`);
    
    // Axes
    gSine.append('line').attr('x1', 0).attr('y1', scaleSineY(0)).attr('x2', graphW).attr('y2', scaleSineY(0)).attr('stroke', 'var(--border)');
    gSine.append('line').attr('x1', 0).attr('y1', scaleSineY(-1.5)).attr('x2', 0).attr('y2', scaleSineY(1.5)).attr('stroke', 'var(--border)');

    // Curve
    const lineRes = 100;
    const sineData = d3.range(0, 2 * Math.PI + 0.1, (2 * Math.PI) / lineRes).map(t => ({ t, y: Math.sin(t) }));
    const sinePath = d3.line().x(d => scaleTheta(d.t)).y(d => scaleSineY(d.y));

    gSine.append('path')
      .datum(sineData)
      .attr('fill', 'none')
      .attr('stroke', 'var(--text-accent)')
      .attr('stroke-width', 2)
      .attr('d', sinePath);

    // Tangent Line
    const slope = Math.cos(theta); // the derivative
    const intercept = pY - slope * theta;
    const tLineLeft = Math.max(0, theta - 1);
    const tLineRight = Math.min(2 * Math.PI, theta + 1);
    
    gSine.append('line')
      .attr('x1', scaleTheta(tLineLeft))
      .attr('y1', scaleSineY(slope * tLineLeft + intercept))
      .attr('x2', scaleTheta(tLineRight))
      .attr('y2', scaleSineY(slope * tLineRight + intercept))
      .attr('stroke', '#eab308')
      .attr('stroke-width', 3);

    // Current point
    gSine.append('circle')
      .attr('cx', scaleTheta(theta)).attr('cy', scaleSineY(pY))
      .attr('r', 6)
      .attr('fill', 'var(--text-accent)');

    gSine.append('text')
      .attr('x', 10)
      .attr('y', 10)
      .text('y = sin(θ) [Height]')
      .attr('fill', 'var(--text-muted)')
      .attr('font-weight', 'bold');

    gSine.append('text')
      .attr('x', graphW - 10)
      .attr('y', scaleSineY(pY) - 15)
      .attr('text-anchor', 'end')
      .text(`Slope = cos(θ) = ${slope.toFixed(2)}`)
      .attr('fill', '#eab308')
      .attr('font-weight', 'bold');

    // ==========================================
    // PANEL C: COSINE GRAPH (VELOCITY / DERIVATIVE VALUE)
    // ==========================================
    const gCos = svg.append('g').attr('transform', `translate(${cosX}, ${cosY})`);
    
    // Axes
    gCos.append('line').attr('x1', 0).attr('y1', scaleCosY(0)).attr('x2', graphW).attr('y2', scaleCosY(0)).attr('stroke', 'var(--border)');
    gCos.append('line').attr('x1', 0).attr('y1', scaleCosY(-1.5)).attr('x2', 0).attr('y2', scaleCosY(1.5)).attr('stroke', 'var(--border)');

    // Curve
    const cosData = d3.range(0, 2 * Math.PI + 0.1, (2 * Math.PI) / lineRes).map(t => ({ t, y: Math.cos(t) }));
    const cosPath = d3.line().x(d => scaleTheta(d.t)).y(d => scaleCosY(d.y));

    gCos.append('path')
      .datum(cosData)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('d', cosPath);

    // Current point
    const cosVal = Math.cos(theta);
    gCos.append('circle')
      .attr('cx', scaleTheta(theta)).attr('cy', scaleCosY(cosVal))
      .attr('r', 6)
      .attr('fill', '#ef4444');

    gCos.append('text')
      .attr('x', 10)
      .attr('y', 10)
      .text('y = cos(θ) [Slope Value]')
      .attr('fill', 'var(--text-muted)')
      .attr('font-weight', 'bold');

    gCos.append('text')
      .attr('x', graphW - 10)
      .attr('y', scaleCosY(cosVal) - 15)
      .attr('text-anchor', 'end')
      .text(`Value = ${cosVal.toFixed(2)}`)
      .attr('fill', '#ef4444')
      .attr('font-weight', 'bold');

    // ==========================================
    // SYNTHESIS HIGHLIGHTS (When Theta is near 0)
    // ==========================================
    if (theta < 0.2 || theta > 2 * Math.PI - 0.2) {
      // Highlight correlation
      gCircle.append('circle')
        .attr('cx', scaleC(1)).attr('cy', scaleC(0))
        .attr('r', 15).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 3).attr('stroke-dasharray', '3,3');
        
      gCircle.append('text')
         .attr('x', scaleC(1.2)).attr('y', scaleC(-1.1))
         .text('100% Upward Flow')
         .attr('fill', '#10b981')
         .attr('font-size', '12px');

      gSine.append('circle')
        .attr('cx', scaleTheta(0)).attr('cy', scaleSineY(0))
        .attr('r', 15).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 3).attr('stroke-dasharray', '3,3');

      gCos.append('circle')
        .attr('cx', scaleTheta(0)).attr('cy', scaleCosY(1))
        .attr('r', 15).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 3).attr('stroke-dasharray', '3,3');
    }

  }, [theta, width, height]);

  return (
    <div className="viz-container bg-surface rounded-lg border border-border p-4 my-6 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2 text-center text-text">The "Moving Point" Deep Sync: Sine & Cosine</h3>
      <p className="text-sm text-text-muted mb-4 max-w-3xl text-center">
        Set θ = 0. Notice the yellow velocity vector is pointing strictly upwards (vertical length = 1). Because the ball's momentum is 100% vertical, its height (Sine curve) is increasing at its maximum possible speed. Hence, the slope of Sine is 1, and the value of Cosine is 1. They are telling the exact same story from three perspectives.
      </p>
      
      <div className="w-full relative" style={{ height: height + 'px' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      <div className="flex items-center gap-6 mt-4 w-full max-w-2xl bg-surface-alt p-4 rounded-lg">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-text-accent text-surface font-bold rounded hover:opacity-90 transition-opacity min-w-[100px]"
        >
          {isPlaying ? 'Pause' : 'Animate Orbit'}
        </button>

        <button
          onClick={() => { setIsPlaying(false); setTheta(0); }}
          className="px-4 py-2 bg-emerald-600 text-white font-bold rounded hover:opacity-90 transition-opacity min-w-[120px]"
        >
          Snap to θ = 0
        </button>

        <div className="flex-1 flex flex-col">
          <label className="text-sm font-semibold mb-1 flex justify-between">
            <span>Angle θ (radians)</span>
            <span>{theta.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max={2 * Math.PI}
            step="0.01"
            value={theta}
            onChange={(e) => { setIsPlaying(false); setTheta(parseFloat(e.target.value)); }}
            className="w-full accent-text-accent"
          />
        </div>
      </div>
    </div>
  );
};

export default TrigDerivativeSync;
