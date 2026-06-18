import React from 'react';
import { motion } from 'framer-motion';

// Helper to calculate polygon points based on data and maximum scale
function calculateRadarPoints(data, maxScore, radius, centerX, centerY) {
  const keys = Object.keys(data);
  const numPoints = keys.length;
  const angleStep = (Math.PI * 2) / numPoints;
  
  return keys.map((key, i) => {
    const value = Math.min(Math.max(data[key] || 0, 0), maxScore);
    const r = (value / maxScore) * radius;
    // Start at top (-Math.PI/2) and go clockwise
    const theta = i * angleStep - Math.PI / 2;
    return {
      x: centerX + r * Math.cos(theta),
      y: centerY + r * Math.sin(theta),
      label: key,
      value: value
    };
  });
}

export function RadarChart({ stats = {}, maxScore = 100, size = 300, color = 'emerald' }) {
  const dataKeys = Object.keys(stats);
  if (dataKeys.length < 3) {
    return <div className="text-slate-500 text-sm italic text-center">Need at least 3 stats for a radar chart.</div>;
  }

  const radius = size / 2.5; // Leave room for labels
  const center = size / 2;

  // Generate the background grid rings
  const ringCount = 4;
  const rings = Array.from({ length: ringCount }).map((_, i) => {
    const ringRadius = (radius / ringCount) * (i + 1);
    const pts = calculateRadarPoints(
      dataKeys.reduce((acc, k) => ({ ...acc, [k]: (maxScore / ringCount) * (i + 1) }), {}),
      maxScore,
      radius,
      center,
      center
    );
    return pts.map(p => `${p.x},${p.y}`).join(' ');
  });

  // Calculate the actual data points
  const dataPoints = calculateRadarPoints(stats, maxScore, radius, center, center);
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Outer ring points for axis lines and labels
  const outerPoints = calculateRadarPoints(
    dataKeys.reduce((acc, k) => ({ ...acc, [k]: maxScore }), {}),
    maxScore,
    radius,
    center,
    center
  );

  const themeColors = {
    emerald: { fill: 'fill-emerald-500/20', stroke: 'stroke-emerald-400', drop: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' },
    fuchsia: { fill: 'fill-fuchsia-500/20', stroke: 'stroke-fuchsia-400', drop: 'drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]' },
    cyan: { fill: 'fill-cyan-500/20', stroke: 'stroke-cyan-400', drop: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' },
    orange: { fill: 'fill-orange-500/20', stroke: 'stroke-orange-400', drop: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' },
  };

  const theme = themeColors[color] || themeColors.emerald;

  return (
    <div className="relative flex justify-center items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Draw background rings */}
        {rings.map((points, i) => (
          <polygon
            key={`ring-${i}`}
            points={points}
            fill="none"
            stroke="currentColor"
            className="stroke-slate-700/50"
            strokeWidth="1"
          />
        ))}

        {/* Draw axis lines from center to outer points */}
        {outerPoints.map((p, i) => (
          <line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="currentColor"
            className="stroke-slate-700/50"
            strokeWidth="1"
          />
        ))}

        {/* Draw actual data polygon with framer-motion for animation */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
          style={{ transformOrigin: `${center}px ${center}px` }}
          points={dataPolygon}
          className={`${theme.fill} ${theme.stroke} ${theme.drop}`}
          strokeWidth="2"
        />

        {/* Draw dots at data points */}
        {dataPoints.map((p, i) => (
          <motion.circle
            key={`dot-${i}`}
            initial={{ r: 0 }}
            animate={{ r: 4 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            cx={p.x}
            cy={p.y}
            className={`${theme.fill.replace('/20', '')} ${theme.stroke}`}
            strokeWidth="1.5"
          />
        ))}

        {/* Draw Labels */}
        {outerPoints.map((p, i) => {
          // Push labels slightly further out based on angle
          const labelDist = 20;
          const dx = p.x - center;
          const dy = p.y - center;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / dist;
          const ny = dy / dist;
          const lx = p.x + nx * labelDist;
          const ly = p.y + ny * labelDist;

          return (
            <text
              key={`label-${i}`}
              x={lx}
              y={ly}
              dominantBaseline="middle"
              textAnchor={nx > 0.1 ? 'start' : nx < -0.1 ? 'end' : 'middle'}
              className="fill-slate-300 text-xs font-bold tracking-wider"
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
