import React, { useState } from 'react';

const lightColors = {
  bg: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  muted: '#64748b',
  cyan: '#06b6d4',
  emerald: '#10b981',
  rose: '#f43f5e',
  gold: '#f59e0b',
  violet: '#8b5cf6',
};

const darkColors = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  text: '#e2e8f0',
  muted: '#94a3b8',
  cyan: '#22d3ee',
  emerald: '#4ade80',
  rose: '#fb7185',
  gold: '#fbbf24',
  violet: '#a78bfa',
};

function useIsDark() {
  const [isDark, setIsDark] = React.useState(true);
  React.useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const ob = new MutationObserver(update);
    ob.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => ob.disconnect();
  }, []);
  return isDark;
}

export default function DistributivePropertyViz() {
  const isDark = useIsDark();
  const C = isDark ? darkColors : lightColors;

  const [step, setStep] = useState(0);

  // Geometric values
  const a = 4, b = 2; // widths
  const c = 3, d = 2; // heights
  const scale = 40;

  const steps = [
    {
      title: "The Whole Rectangle",
      text: "The total area is the full width (a+b) times the full height (c+d).",
      formula: "(a + b)(c + d)",
      highlight: []
    },
    {
      title: "First (ac)",
      text: "The top-left rectangle has width 'a' and height 'c'. This is the 'First' in FOIL.",
      formula: "a·c",
      highlight: ['ac']
    },
    {
      title: "Outer (ad)",
      text: "The bottom-left rectangle has width 'a' and height 'd'. This is the 'Outer' in FOIL.",
      formula: "a·c + a·d",
      highlight: ['ac', 'ad']
    },
    {
      title: "Inner (bc)",
      text: "The top-right rectangle has width 'b' and height 'c'. This is the 'Inner' in FOIL.",
      formula: "a·c + a·d + b·c",
      highlight: ['ac', 'ad', 'bc']
    },
    {
      title: "Last (bd)",
      text: "The bottom-right rectangle has width 'b' and height 'd'. This is the 'Last' in FOIL.",
      formula: "a·c + a·d + b·c + b·d",
      highlight: ['ac', 'ad', 'bc', 'bd']
    }
  ];

  const current = steps[step];

  const getRectFill = (id, baseColor) => {
    if (step === 0) return `${baseColor}20`; // very faint
    if (current.highlight.includes(id)) return `${baseColor}80`; // highlighted
    return `${baseColor}10`; // dim
  };

  const getRectStroke = (id, baseColor) => {
    if (step === 0) return baseColor;
    if (current.highlight.includes(id)) return baseColor;
    return C.border;
  };

  return (
    <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ margin: 0, color: C.cyan, fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>THE DISTRIBUTIVE PROPERTY (AREA MODEL)</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
        <svg width="400" height="300" viewBox="0 0 400 300">
          <g transform="translate(60, 40)">
            {/* Dimensions annotations */}
            <text x={(a*scale)/2} y="-10" fill={C.text} textAnchor="middle" fontWeight="bold">a</text>
            <text x={a*scale + (b*scale)/2} y="-10" fill={C.text} textAnchor="middle" fontWeight="bold">b</text>
            
            <text x="-15" y={(c*scale)/2} fill={C.text} textAnchor="middle" alignmentBaseline="middle" fontWeight="bold">c</text>
            <text x="-15" y={c*scale + (d*scale)/2} fill={C.text} textAnchor="middle" alignmentBaseline="middle" fontWeight="bold">d</text>

            <line x1={0} y1={-5} x2={a*scale} y2={-5} stroke={C.muted} strokeWidth={2} />
            <line x1={a*scale} y1={-5} x2={(a+b)*scale} y2={-5} stroke={C.muted} strokeWidth={2} />
            <line x1={-5} y1={0} x2={-5} y2={c*scale} stroke={C.muted} strokeWidth={2} />
            <line x1={-5} y1={c*scale} x2={-5} y2={(c+d)*scale} stroke={C.muted} strokeWidth={2} />

            {/* ac */}
            <rect x="0" y="0" width={a*scale} height={c*scale} 
                  fill={getRectFill('ac', C.cyan)} stroke={getRectStroke('ac', C.cyan)} strokeWidth="2" />
            <text x={(a*scale)/2} y={(c*scale)/2} fill={C.text} textAnchor="middle" alignmentBaseline="middle" fontWeight="bold" opacity={current.highlight.includes('ac') || step === 0 ? 1 : 0.3}>a·c</text>

            {/* bc */}
            <rect x={a*scale} y="0" width={b*scale} height={c*scale} 
                  fill={getRectFill('bc', C.emerald)} stroke={getRectStroke('bc', C.emerald)} strokeWidth="2" />
            <text x={a*scale + (b*scale)/2} y={(c*scale)/2} fill={C.text} textAnchor="middle" alignmentBaseline="middle" fontWeight="bold" opacity={current.highlight.includes('bc') || step === 0 ? 1 : 0.3}>b·c</text>

            {/* ad */}
            <rect x="0" y={c*scale} width={a*scale} height={d*scale} 
                  fill={getRectFill('ad', C.gold)} stroke={getRectStroke('ad', C.gold)} strokeWidth="2" />
            <text x={(a*scale)/2} y={c*scale + (d*scale)/2} fill={C.text} textAnchor="middle" alignmentBaseline="middle" fontWeight="bold" opacity={current.highlight.includes('ad') || step === 0 ? 1 : 0.3}>a·d</text>

            {/* bd */}
            <rect x={a*scale} y={c*scale} width={b*scale} height={d*scale} 
                  fill={getRectFill('bd', C.rose)} stroke={getRectStroke('bd', C.rose)} strokeWidth="2" />
            <text x={a*scale + (b*scale)/2} y={c*scale + (d*scale)/2} fill={C.text} textAnchor="middle" alignmentBaseline="middle" fontWeight="bold" opacity={current.highlight.includes('bd') || step === 0 ? 1 : 0.3}>b·d</text>
          </g>
        </svg>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '16px', width: '100%', maxWidth: 400, marginTop: '-20px' }}>
          <div style={{ fontSize: 13, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Step {step + 1} of 5: {current.title}</div>
          <div style={{ fontSize: 15, color: C.text, marginBottom: 12 }}>{current.text}</div>
          <div style={{ fontSize: 18, color: C.gold, fontFamily: 'monospace', fontWeight: 'bold', background: C.bg, padding: '8px 12px', borderRadius: 4, textAlign: 'center' }}>
            {current.formula}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <button 
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, color: step === 0 ? C.muted : C.text, cursor: step === 0 ? 'default' : 'pointer' }}
          >
            ← Previous
          </button>
          <button 
            onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
            style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${C.cyan}`, background: `${C.cyan}20`, color: C.cyan, cursor: step === steps.length - 1 ? 'default' : 'pointer', fontWeight: 'bold' }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
