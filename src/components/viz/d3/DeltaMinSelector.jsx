import * as d3 from 'd3';
import { useRef, useEffect, useState } from 'react';

const W = 600, H = 400;
const M = { top: 40, right: 40, bottom: 50, left: 60 };

export default function DeltaMinSelector() {
  const svgRef = useRef(null);
  
  // Parabola example: f(x) = x^2, c = 2, L = 4, e = 1.0
  // Intersections: xRight = sqrt(5) ~ 2.236, xLeft = sqrt(3) ~ 1.732
  // deltaRight = 0.236, deltaLeft = 0.268
  const c = 2;
  const L = 4;
  const epsilon = 1.0;
  const dRight = Math.sqrt(5) - 2; // ~0.236
  const dLeft = 2 - Math.sqrt(3);  // ~0.268
  
  const [selectedDelta, setSelectedDelta] = useState(null); // 'left', 'right', 'none'

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const xSc = d3.scaleLinear().domain([1.5, 2.5]).range([M.left, W - M.right]);
    const ySc = d3.scaleLinear().domain([2.5, 5.5]).range([H - M.bottom, M.top]);

    const bandTop = ySc(L + epsilon);
    const bandBot = ySc(L - epsilon);
    
    // Epsilon Band
    svg.append('rect').attr('x', M.left).attr('width', W - M.left - M.right)
      .attr('y', bandTop).attr('height', bandBot - bandTop)
      .attr('fill', '#f59e0b').attr('opacity', 0.15);

    // Dynamic Delta Band
    if (selectedDelta) {
      const delta = selectedDelta === 'right' ? dRight : dLeft;
      const dBandLeft = xSc(c - delta);
      const dBandRight = xSc(c + delta);
      
      svg.append('rect')
        .attr('x', dBandLeft).attr('width', dBandRight - dBandLeft)
        .attr('y', M.top).attr('height', H - M.top - M.bottom)
        .attr('fill', selectedDelta === 'right' ? '#22c55e' : '#ef4444') // green if correct, red if wrong
        .attr('opacity', 0.2);
        
      // Escape warning circle
      if (selectedDelta === 'left') { // the wrong (larger) choice
         const escapeX = c - dLeft; // Wait, right side escapes!
         const evaluateAtRight = c + dLeft; // 2 + 0.268 = 2.268
         const evaluateAtLeft = c - dLeft;  // 1.732
         
         const escapeY = Math.pow(evaluateAtRight, 2); // 2.268^2 = 5.14
         svg.append('circle')
            .attr('cx', xSc(evaluateAtRight))
            .attr('cy', ySc(escapeY))
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 3)
            .attr('class', 'animate-ping');
            
         svg.append('circle')
            .attr('cx', xSc(evaluateAtRight))
            .attr('cy', ySc(escapeY))
            .attr('r', 4)
            .attr('fill', '#ef4444');
            
         svg.append('text')
            .attr('x', xSc(evaluateAtRight) - 10)
            .attr('y', ySc(escapeY) - 10)
            .attr('text-anchor', 'end')
            .attr('font-weight', 'bold')
            .attr('fill', '#ef4444')
            .text('ESCAPED!');
      }
    }

    // Grid & Axes
    xSc.ticks(5).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'));
    ySc.ticks(5).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'));
    svg.append('g').attr('transform', `translate(0,${ySc(0) < M.top ? M.top : ySc(0) > H - M.bottom ? H - M.bottom : ySc(0)})`).call(d3.axisBottom(xSc)).attr('color', '#94a3b8');
    svg.append('g').attr('transform', `translate(${xSc(0) < M.left ? M.left : xSc(0)},0)`).call(d3.axisLeft(ySc)).attr('color', '#94a3b8');

    // EPSILON boundaries
    svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(L+epsilon)).attr('y2', ySc(L+epsilon)).attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '6,3');
    svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(L-epsilon)).attr('y2', ySc(L-epsilon)).attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '6,3');

    // Curve f(x) = x^2
    const pts = d3.range(1.5, 2.51, 0.02).map(x => [x, x*x]);
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y));
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 3).attr('d', line);
    svg.append('circle').attr('cx', xSc(c)).attr('cy', ySc(L)).attr('r', 5).attr('fill', 'white').attr('stroke', '#6470f1').attr('stroke-width', 2);

    // The two delta distance markers (always visible to show options)
    const yArr = ySc(L) + 20;
    
    // Left arrow
    svg.append('line').attr('x1', xSc(c)).attr('x2', xSc(c - dLeft)).attr('y1', yArr).attr('y2', yArr).attr('stroke', '#94a3b8').attr('stroke-width', 2).attr('marker-end', 'url(#arrow)');
    svg.append('text').attr('x', xSc(c - dLeft/2)).attr('y', yArr + 15).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#64748b').text(`δ_left ≈ 0.268`);
    
    // Right arrow
    svg.append('line').attr('x1', xSc(c)).attr('x2', xSc(c + dRight)).attr('y1', yArr).attr('y2', yArr).attr('stroke', '#94a3b8').attr('stroke-width', 2).attr('marker-end', 'url(#arrow)');
    svg.append('text').attr('x', xSc(c + dRight/2)).attr('y', yArr + 15).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#64748b').text(`δ_right ≈ 0.236`);
    
    // Arrow definition
    svg.append("defs").append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto-start-reverse")
      .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", "#94a3b8");

  }, [selectedDelta]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible mb-4" />
      
      <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
         <p className="text-center font-bold text-slate-700 dark:text-slate-300 mb-3">Which Delta should you choose to satisfy ε = 1.0?</p>
         
         <div className="flex justify-center gap-4">
             <button 
                onClick={() => setSelectedDelta('left')}
                className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
                   selectedDelta === 'left' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-slate-300 text-slate-600 hover:border-brand-400'
                }`}
             >
                Choose δ = 0.268 (The Larger One)
             </button>
             
             <button 
                onClick={() => setSelectedDelta('right')}
                className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
                   selectedDelta === 'right' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-slate-300 text-slate-600 hover:border-brand-400'
                }`}
             >
                Choose δ = 0.236 (The Smaller One)
             </button>
         </div>

         {selectedDelta === 'left' && (
             <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm border border-red-200 rounded text-center font-medium animate-in slide-in-from-top-2">
                 ❌ <strong>Failure!</strong> If you choose the larger delta, the box extends to x = 2 + 0.268 = 2.268. But (2.268)² = 5.14, which completely escapes our top tolerance of 5.0!
             </div>
         )}
         
         {selectedDelta === 'right' && (
             <div className="mt-4 p-3 bg-green-50 text-green-800 text-sm border border-green-200 rounded text-center font-medium animate-in slide-in-from-top-2">
                 ✅ <strong>Success!</strong> By picking the minimum, the entire box fits safely inside the yellow epsilon strip.
             </div>
         )}
      </div>
    </div>
  );
}
