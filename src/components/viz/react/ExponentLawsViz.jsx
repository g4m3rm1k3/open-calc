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

export default function ExponentLawsViz() {
  const isDark = useIsDark();
  const C = isDark ? darkColors : lightColors;

  const [activeTab, setActiveTab] = useState('multiply');

  const tabs = [
    { id: 'multiply', label: 'x² · x³' },
    { id: 'divide', label: 'x⁵ / x²' },
    { id: 'power', label: '(x³)²' }
  ];

  return (
    <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: C.cyan, fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>EXPONENT LAWS: COUNTING MULTIPLICATIONS</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? `${C.cyan}20` : 'transparent',
                border: `1px solid ${activeTab === tab.id ? C.cyan : C.border}`,
                color: activeTab === tab.id ? C.cyan : C.muted,
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {activeTab === 'multiply' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 24, color: C.text, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, background: `${C.emerald}15`, padding: '12px', borderRadius: 8, border: `1px solid ${C.emerald}40` }}>
                <span style={{ color: C.emerald }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.emerald }}>x</span>
              </div>
              <span style={{ color: C.muted, fontSize: 32 }}>×</span>
              <div style={{ display: 'flex', gap: 8, background: `${C.gold}15`, padding: '12px', borderRadius: 8, border: `1px solid ${C.gold}40` }}>
                <span style={{ color: C.gold }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.gold }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.gold }}>x</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 2, height: 20, background: C.border }}></div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: '12px 24px', borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 8, fontSize: 24 }}>
                  <span style={{ color: C.emerald }}>x</span>
                  <span style={{ color: C.muted }}>·</span>
                  <span style={{ color: C.emerald }}>x</span>
                  <span style={{ color: C.muted }}>·</span>
                  <span style={{ color: C.gold }}>x</span>
                  <span style={{ color: C.muted }}>·</span>
                  <span style={{ color: C.gold }}>x</span>
                  <span style={{ color: C.muted }}>·</span>
                  <span style={{ color: C.gold }}>x</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 28, color: C.cyan, fontWeight: 'bold' }}>= x⁵</div>
            <div style={{ fontSize: 14, color: C.muted, maxWidth: 350, textAlign: 'center' }}>
              Multiplication is just joining two lists of copies. 2 copies + 3 copies = 5 total copies. <strong>Exponents add.</strong>
            </div>
          </div>
        )}

        {activeTab === 'divide' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ background: `${C.cyan}10`, border: `1px solid ${C.cyan}40`, padding: '16px 24px', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, fontSize: 24, paddingBottom: 12, borderBottom: `2px solid ${C.muted}` }}>
                <span style={{ color: C.emerald }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.emerald }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.rose, textDecoration: 'line-through' }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.rose, textDecoration: 'line-through' }}>x</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 24, paddingTop: 12 }}>
                <span style={{ color: C.rose, textDecoration: 'line-through' }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.rose, textDecoration: 'line-through' }}>x</span>
              </div>
            </div>
            
            <div style={{ fontSize: 28, color: C.cyan, fontWeight: 'bold' }}>= x²</div>
            <div style={{ fontSize: 14, color: C.muted, maxWidth: 350, textAlign: 'center' }}>
              Division is canceling identical copies top and bottom. 4 copies minus 2 cancelled copies = 2 remaining. <strong>Exponents subtract.</strong>
            </div>
          </div>
        )}

        {activeTab === 'power' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 24, color: C.text, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, background: `${C.gold}15`, padding: '12px', borderRadius: 8, border: `1px solid ${C.gold}40` }}>
                <span style={{ color: C.gold }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.gold }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.gold }}>x</span>
              </div>
              <div style={{ display: 'flex', gap: 8, background: `${C.gold}15`, padding: '12px', borderRadius: 8, border: `1px solid ${C.gold}40` }}>
                <span style={{ color: C.gold }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.gold }}>x</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ color: C.gold }}>x</span>
              </div>
            </div>

            <div style={{ fontSize: 28, color: C.cyan, fontWeight: 'bold' }}>= x⁶</div>
            <div style={{ fontSize: 14, color: C.muted, maxWidth: 350, textAlign: 'center' }}>
              Raising to a power means repeating the entire list. A list of 3, repeated 2 times = 6 total copies. <strong>Exponents multiply.</strong>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
