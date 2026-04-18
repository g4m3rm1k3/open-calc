import { useState, useMemo, useEffect } from 'react';
import * as d3 from 'd3';
import katex from 'katex';

// Math renderer (inline or block)
function M({ t, display = false }) {
  const html = useMemo(() => {
    if (!t) return '';
    try {
      return katex.renderToString(t, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch {
      return `<span>${String(t)}</span>`;
    }
  }, [t, display]);
  if (!t) return null;
  return <span style={{ display: display ? 'block' : 'inline' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

const lightColors = {
  bg: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  textMain: '#1e293b',
  textMuted: '#64748b',
  indigoMain: '#6366f1',
  indigoText: '#4338ca',
  indigoBg: '#eef2ff',
  cyanMain: '#0891b2',
  cyanText: '#0e7490',
  cyanBg: '#ecfeff',
  greenMain: '#10b981',
  greenDark: '#047857',
  greenText: '#0f6e56',
  greenBg: '#ecfdf5',
  blueMain: '#38bdf8',
  blueDark: '#0ea5e9',
  blueBg: '#e0f2fe',
  yellowMain: '#f59e0b',
  yellowBorder: '#facc15',
  yellowBg: '#fef9c3',
  redMain: '#ef4444',
  redDark: '#501313',
  redText: '#791f1f',
  redBg: '#FCEBEB',
};

const darkColors = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  textMain: '#e2e8f0',
  textMuted: '#94a3b8',
  indigoMain: '#818cf8',
  indigoText: '#a5b4fc',
  indigoBg: 'rgba(99,102,241,0.15)',
  cyanMain: '#22d3ee',
  cyanText: '#67e8f9',
  cyanBg: 'rgba(6,182,212,0.15)',
  greenMain: '#34d399',
  greenDark: '#10b981',
  greenText: '#6ee7b7',
  greenBg: 'rgba(16,185,129,0.15)',
  blueMain: '#38bdf8',
  blueDark: '#0ea5e9',
  blueBg: 'rgba(14,165,233,0.15)',
  yellowMain: '#fbbf24',
  yellowBorder: '#fcd34d',
  yellowBg: 'rgba(245,158,11,0.15)',
  redMain: '#f87171',
  redDark: '#fca5a5',
  redText: '#fecaca',
  redBg: 'rgba(239,68,68,0.15)',
};

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const ob = new MutationObserver(update);
    ob.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => ob.disconnect();
  }, []);
  return isDark;
}

const DL = ['Why?', 'But why?', 'Prove it'];
function WhyPanel({ why, depth = 0, C }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const DS = [
    { border: C.indigoMain, bg: C.indigoBg, text: C.indigoText, panelBg: C.indigoBg },
    { border: C.cyanMain, bg: C.cyanBg, text: C.cyanText, panelBg: C.cyanBg },
    { border: C.greenMain, bg: C.greenBg, text: C.greenText, panelBg: C.greenBg },
  ];
  const d = DS[Math.min(depth, DS.length - 1)];
  const lbl = why.tag || DL[Math.min(depth, DL.length - 1)];
  return (
    <div style={{ marginLeft: depth * 12, marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: open ? d.bg : 'transparent', border: `1px solid ${d.border}`, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 500, color: d.border, cursor: 'pointer' }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: d.border, color: C.bg, fontSize: 9, fontWeight: 700, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{open ? '−' : '?'}</span>
        {open ? 'Close' : lbl}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: '12px 14px', background: d.panelBg, border: `0.5px solid ${d.border}22`, borderLeft: `3px solid ${d.border}`, borderRadius: '0 8px 8px 0', animation: 'sd .16s ease-out' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, marginBottom: 8, display: 'inline-block', background: d.bg, color: d.text }}>{lbl}</span>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: C.textMain, marginBottom: why.math || why.steps ? 10 : 0 }}>{why.explanation}</p>
          {why.math && <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: '10px 14px', textAlign: 'center', overflowX: 'auto', marginBottom: 6 }}><M t={why.math} display /></div>}
          {why.steps && <div style={{ marginTop: 8 }}>{why.steps.map((st, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: '50%', background: d.border, color: C.bg, fontSize: 10, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: C.textMain, marginBottom: st.math ? 4 : 0 }}>{st.text}</p>
                {st.math && <div style={{ background: C.surface, borderRadius: 6, padding: '6px 10px', textAlign: 'center', overflowX: 'auto', marginTop: 3 }}><M t={st.math} display /></div>}
              </div>
            </div>
          ))}</div>}
          {why.why && <WhyPanel why={why.why} depth={depth + 1} C={C} />}
        </div>
      )}
    </div>
  );
}

export default function MVTIntegralProof() {
  const isDark = useIsDark();
  const C = isDark ? darkColors : lightColors;
  const [step, setStep] = useState(0);
  const steps = [
    {
      label: 'Extreme Value Theorem',
      text: 'f attains its maximum (M) and minimum (m) on [a, b] by the Extreme Value Theorem.',
      math: 'm \leq f(x) \leq M\text{ for all }x \in [a, b]'
    },
    {
      label: 'Integrate Inequality',
      text: 'Integrate both sides over [a, b]:',
      math: 'm(b-a) \leq \\int_a^b f(x)dx \leq M(b-a)'
    },
    {
      label: 'Divide by (b-a)',
      text: 'Divide by (b-a) (assuming b > a):',
      math: 'm \leq \\frac{1}{b-a}\\int_a^b f(x)dx \leq M'
    },
    {
      label: 'Intermediate Value Theorem',
      text: 'By the Intermediate Value Theorem, since f is continuous, there is some c in [a, b] where f(c) equals the average value.',
      math: '\\exists c \in [a, b] \text{ such that } f(c) = \\frac{1}{b-a}\\int_a^b f(x)dx'
    },
    {
      label: 'Conclusion',
      text: 'So, the area under f(x) equals the area of a rectangle at f(c):',
      math: '\\int_a^b f(x)dx = f(c)(b-a)'
    }
  ];

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0', maxWidth: 800, margin: '0 auto', color: C.textMain, background: C.bg }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: C.textMain }}>Proof: Mean Value Theorem for Integrals</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: step === i ? 600 : 400, border: `0.5px solid ${step === i ? C.indigoMain : C.border}`, background: step === i ? C.indigoBg : 'transparent', color: step === i ? C.indigoText : C.textMuted }}>{s.label}</button>
        ))}
      </div>
      <div style={{ background: C.indigoBg, borderLeft: `3px solid ${C.indigoMain}`, borderRadius: 8, padding: 22, marginBottom: 18, animation: 'sd .2s ease-out' }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: C.indigoText, marginBottom: 8 }}>{steps[step].label}</div>
        <div style={{ fontSize: 15, color: C.textMain, marginBottom: 10 }}>{steps[step].text}</div>
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: '12px 16px', textAlign: 'center', overflowX: 'auto', marginBottom: 6 }}>
          <M t={steps[step].math} display />
        </div>
        {step === 3 && (
          <WhyPanel C={C} why={{
            tag: 'Why does the IVT apply?',
            explanation: 'The Intermediate Value Theorem applies to any continuous function on a closed interval. Since f is continuous, and the average value is between m and M, there must be some c with f(c) = average value.'
          }} />
        )}
      </div>
      <div style={{ background: C.yellowBg, borderLeft: `3px solid ${C.yellowBorder}`, borderRadius: 8, padding: 18, marginTop: 12, color: C.textMain }}>
        <b style={{ color: C.yellowBorder }}>Summary:</b> The proof uses the Extreme Value Theorem and the Intermediate Value Theorem to show that the area under f(x) on [a, b] is exactly the same as the area of a rectangle at the average value of f.
      </div>
    </div>
  );
}
