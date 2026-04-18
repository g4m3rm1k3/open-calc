import React, { useState } from 'react';

const C = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  text: '#e2e8f0',
  muted: '#94a3b8',
  cyan: '#22d3ee',
  emerald: '#4ade80',
  rose: '#fb7185',
  gold: '#fbbf24',
};

export default function RosettaStoneViz() {
  const [activeEg, setActiveEg] = useState(0);
  const [step, setStep] = useState(0);

  const examples = [
    {
      id: 'diffsq',
      label: 'Difference of Squares',
      numTitle: 'With Numbers (a=5, b=3)',
      varTitle: 'With Letters (a, b)',
      steps: [
        {
          desc: "Start with a difference of two squares.",
          num: "5² - 3²",
          var: "a² - b²"
        },
        {
          desc: "Calculate the pure numbers to see the target.",
          num: "25 - 9 = 16",
          var: "a² - b²"
        },
        {
          desc: "Setup the factored form (a-b)(a+b).",
          num: "(5 - 3)(5 + 3)",
          var: "(a - b)(a + b)"
        },
        {
          desc: "Evaluate the factored form. The numbers match exactly.",
          num: "(2)(8) = 16",
          var: "a² - ab + ab - b² = a² - b²"
        }
      ]
    },
    {
      id: 'frac',
      label: 'Fractions (Common Denom)',
      numTitle: 'With Numbers (x=2, y=3)',
      varTitle: 'With Letters (x, y)',
      steps: [
        {
          desc: "Start with addition of two distinct fractions.",
          num: "1/2 + 1/3",
          var: "1/x + 1/y"
        },
        {
          desc: "Multiply each by a clever form of 1 to get a common denominator.",
          num: "(1/2)·(3/3) + (1/3)·(2/2)",
          var: "(1/x)·(y/y) + (1/y)·(x/x)"
        },
        {
          desc: "Write as a single fraction over the common denominator.",
          num: "3/6 + 2/6 = 5/6",
          var: "y/xy + x/xy"
        },
        {
          desc: "The generalized form exactly mimics the arithmetic.",
          num: "5/6",
          var: "(y + x) / xy"
        }
      ]
    },
    {
      id: 'binomial',
      label: 'Perfect Square (a+b)²',
      numTitle: 'With Numbers (a=10, b=3)',
      varTitle: 'With Letters (a, b)',
      steps: [
        {
          desc: "Square a sum.",
          num: "(10 + 3)²",
          var: "(a + b)²"
        },
        {
          desc: "Calculate directly if possible.",
          num: "13² = 169",
          var: "(a + b)²"
        },
        {
          desc: "Expand using FOIL: (a+b)(a+b)",
          num: "(10+3)(10+3) = 100 + 30 + 30 + 9",
          var: "(a+b)(a+b) = a² + ab + ab + b²"
        },
        {
          desc: "Combine the middle terms. This is why it's +2ab, not just a²+b².",
          num: "100 + 60 + 9 = 169",
          var: "a² + 2ab + b²"
        }
      ]
    }
  ];

  const currentEg = examples[activeEg];
  const totalSteps = currentEg.steps.length;

  return (
    <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ margin: 0, color: C.cyan, fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>SIDE-BY-SIDE PROOF EXPLORER</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          {examples.map((eg, idx) => (
            <button 
              key={eg.id}
              onClick={() => { setActiveEg(idx); setStep(0); }}
              style={{
                background: activeEg === idx ? `${C.cyan}20` : 'transparent',
                border: `1px solid ${activeEg === idx ? C.cyan : C.border}`,
                color: activeEg === idx ? C.cyan : C.muted,
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: activeEg === idx ? 'bold' : 'normal',
              }}
            >
              {eg.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, marginBottom: 24 }}>
          
          {/* Numbers Side */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: `${C.emerald}20`, padding: '8px 12px', borderBottom: `1px solid ${C.border}`, fontWeight: 'bold', color: C.emerald, fontSize: 13, textAlign: 'center' }}>
              {currentEg.numTitle}
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {currentEg.steps.map((s, i) => (
                <div key={i} style={{ 
                  opacity: i <= step ? 1 : 0.2, 
                  transition: 'opacity 0.3s',
                  fontSize: 22, 
                  color: i === step ? C.emerald : C.text,
                  fontWeight: i === step ? 'bold' : 'normal',
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}>
                  {s.num}
                </div>
              ))}
            </div>
          </div>

          {/* Letters Side */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: `${C.gold}20`, padding: '8px 12px', borderBottom: `1px solid ${C.border}`, fontWeight: 'bold', color: C.gold, fontSize: 13, textAlign: 'center' }}>
              {currentEg.varTitle}
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {currentEg.steps.map((s, i) => (
                <div key={i} style={{ 
                  opacity: i <= step ? 1 : 0.2, 
                  transition: 'opacity 0.3s',
                  fontSize: 22, 
                  color: i === step ? C.gold : C.text,
                  fontWeight: i === step ? 'bold' : 'normal',
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}>
                  {s.var}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Narrative / Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface, padding: '16px 24px', borderRadius: 8, border: `1px solid ${C.border}` }}>
          
          <div style={{ flex: 1, paddingRight: 24 }}>
            <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Step {step + 1} of {totalSteps}</div>
            <div style={{ fontSize: 15, color: C.text }}>{currentEg.steps[step].desc}</div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: step === 0 ? C.muted : C.text, cursor: step === 0 ? 'default' : 'pointer' }}
            >
              ← Prev
            </button>
            <button 
              onClick={() => setStep(s => Math.min(totalSteps - 1, s + 1))}
              disabled={step === totalSteps - 1}
              style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${C.cyan}`, background: `${C.cyan}20`, color: C.cyan, cursor: step === totalSteps - 1 ? 'default' : 'pointer', fontWeight: 'bold' }}
            >
              Next Step →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
