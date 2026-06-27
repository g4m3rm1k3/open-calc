import { useState, useEffect } from 'react';

import { makeCircuitTokens } from '../../../utils/themeTokens';
function useDark() {
  const check = () => document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(check);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(check()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function makeT(dark) {
  return {
    ...makeCircuitTokens(dark),

  };
}

export default function RelayContactorViz() {
  const dark = useDark();
  const t = makeT(dark);

  const [coilEnergized, setCoilEnergized] = useState(false);
  const [view, setView] = useState('relay'); // 'relay' | 'ladder' | 'evolution'

  const wireOn = '#22c55e';
  const wireOff = t.fence;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>Relays & Contactors</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {['relay', 'ladder', 'evolution'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', borderColor: view === v ? '#f59e0b' : t.fence, background: view === v ? (dark ? '#451a03' : '#fff7ed') : 'transparent', color: view === v ? '#fb923c' : t.sub }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {view === 'relay' && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Circuit diagram */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Circuit Diagram</div>
              <svg viewBox="0 0 280 260" width="100%" style={{ display: 'block', maxHeight: 260 }}>
                {/* === CONTROL CIRCUIT (bottom) === */}
                <text x="10" y="200" fontSize="9" fill={t.dim} fontWeight="600">CONTROL CIRCUIT (24VDC)</text>

                {/* Control voltage source */}
                <line x1="20" y1="215" x2="20" y2="250" stroke={coilEnergized ? wireOn : wireOff} strokeWidth="2" />
                <line x1="20" y1="250" x2="260" y2="250" stroke={coilEnergized ? wireOn : wireOff} strokeWidth="2" />
                <line x1="260" y1="215" x2="260" y2="250" stroke={coilEnergized ? wireOn : wireOff} strokeWidth="2" />

                {/* +24V label */}
                <rect x="10" y="205" width="20" height="12" fill={coilEnergized ? '#22c55e20' : t.card} stroke={coilEnergized ? wireOn : wireOff} strokeWidth="1.5" rx="2" />
                <text x="20" y="214" textAnchor="middle" fontSize="7" fill={coilEnergized ? wireOn : t.sub} fontWeight="700">+24</text>

                {/* Pushbutton (control switch) */}
                <line x1="20" y1="215" x2="80" y2="215" stroke={coilEnergized ? wireOn : wireOff} strokeWidth="2" />
                <circle cx="100" cy="215" r="10" fill={coilEnergized ? '#22c55e30' : t.card} stroke={coilEnergized ? wireOn : wireOff} strokeWidth="2" />
                <text x="100" y="219" textAnchor="middle" fontSize="9" fill={coilEnergized ? wireOn : t.sub} fontWeight="800">S</text>
                <text x="100" y="230" textAnchor="middle" fontSize="8" fill={t.dim}>Push</text>
                <line x1="110" y1="215" x2="170" y2="215" stroke={coilEnergized ? wireOn : wireOff} strokeWidth="2" />

                {/* Relay coil */}
                <rect x="170" y="205" width="50" height="20" fill={coilEnergized ? '#f59e0b30' : t.card} stroke={coilEnergized ? '#f59e0b' : t.fence} strokeWidth="2" rx="4" />
                <text x="195" y="217" textAnchor="middle" fontSize="9" fill={coilEnergized ? '#f59e0b' : t.sub} fontWeight="800">COIL</text>
                {coilEnergized && (
                  <ellipse cx="195" cy="215" rx="18" ry="8" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" opacity="0.5">
                    <animate attributeName="rx" values="18;22;18" dur="0.8s" repeatCount="indefinite" />
                    <animate attributeName="ry" values="8;10;8" dur="0.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="0.8s" repeatCount="indefinite" />
                  </ellipse>
                )}
                <line x1="220" y1="215" x2="260" y2="215" stroke={coilEnergized ? wireOn : wireOff} strokeWidth="2" />

                {/* === POWER CIRCUIT (top) === */}
                <text x="10" y="25" fontSize="9" fill={t.dim} fontWeight="600">POWER CIRCUIT (120VAC)</text>

                {/* L1 rail */}
                <line x1="20" y1="35" x2="260" y2="35" stroke={t.fence} strokeWidth="2" strokeDasharray="4,2" />
                <text x="10" y="40" fontSize="8" fill={t.dim} fontWeight="700">L1</text>
                {/* N rail */}
                <line x1="20" y1="175" x2="260" y2="175" stroke={t.fence} strokeWidth="2" strokeDasharray="4,2" />
                <text x="10" y="180" fontSize="8" fill={t.dim} fontWeight="700">N</text>

                {/* L1 to contact */}
                <line x1="140" y1="35" x2="140" y2="70" stroke={(coilEnergized) ? wireOn : wireOff} strokeWidth="2" />

                {/* Relay contact (NO) */}
                <line x1="130" y1="70" x2="150" y2="70" stroke={(coilEnergized) ? wireOn : wireOff} strokeWidth="2" />
                {coilEnergized ? (
                  // Closed contact
                  <line x1="130" y1="90" x2="150" y2="90" stroke={wireOn} strokeWidth="3" />
                ) : (
                  // Open contact
                  <line x1="130" y1="90" x2="155" y2="72" stroke={wireOff} strokeWidth="2" />
                )}
                <line x1="130" y1="90" x2="130" y2="100" stroke={(coilEnergized) ? wireOn : wireOff} strokeWidth="2" />
                <line x1="150" y1="70" x2="150" y2="62" stroke={(coilEnergized) ? wireOn : wireOff} strokeWidth="2" />
                <line x1="150" y1="90" x2="150" y2="100" stroke={(coilEnergized) ? wireOn : wireOff} strokeWidth="2" />
                <text x="160" y="82" fontSize="8" fill={t.dim}>NO</text>
                <text x="160" y="92" fontSize="7" fill={coilEnergized ? wireOn : t.dim}>{coilEnergized ? 'CLOSED' : 'OPEN'}</text>

                {/* Contact to motor */}
                <line x1="140" y1="100" x2="140" y2="130" stroke={coilEnergized ? wireOn : wireOff} strokeWidth="2" />

                {/* Motor load */}
                <circle cx="140" cy="145" r="16" fill={coilEnergized ? '#10b98120' : t.card} stroke={coilEnergized ? '#10b981' : t.fence} strokeWidth="2" />
                <text x="140" y="142" textAnchor="middle" fontSize="8" fill={coilEnergized ? '#10b981' : t.sub} fontWeight="700">M</text>
                <text x="140" y="153" textAnchor="middle" fontSize="7" fill={coilEnergized ? '#10b981' : t.dim}>{coilEnergized ? 'RUNNING' : 'STOPPED'}</text>

                {/* Motor to N */}
                <line x1="140" y1="161" x2="140" y2="175" stroke={coilEnergized ? wireOn : wireOff} strokeWidth="2" />

                {/* Magnetic flux arrow when energized */}
                {coilEnergized && (
                  <g>
                    <text x="195" y="185" textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="700">↑ Magnetic Field</text>
                    <text x="195" y="196" textAnchor="middle" fontSize="8" fill="#f59e0b">Pulls armature closed</text>
                  </g>
                )}
              </svg>
            </div>

            {/* Controls */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Controls</div>

              <button
                onMouseDown={() => setCoilEnergized(true)}
                onMouseUp={() => setCoilEnergized(false)}
                onMouseLeave={() => setCoilEnergized(false)}
                onTouchStart={() => setCoilEnergized(true)}
                onTouchEnd={() => setCoilEnergized(false)}
                style={{
                  width: '100%', padding: '20px', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${coilEnergized ? '#22c55e' : t.fence}`,
                  background: coilEnergized ? (dark ? '#14532d' : '#dcfce7') : t.card,
                  color: coilEnergized ? '#22c55e' : t.text,
                  fontSize: 16, fontWeight: 800, transition: 'all 0.1s', marginBottom: 14,
                }}>
                {coilEnergized ? '⚡ COIL ENERGIZED' : '○ Hold to Energize Coil'}
              </button>

              <div style={{ background: t.card, borderRadius: 10, padding: 14, marginBottom: 12, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>State</div>
                {[
                  { label: 'Control Button', val: coilEnergized ? 'PRESSED' : 'Released', color: coilEnergized ? '#22c55e' : t.dim },
                  { label: 'Relay Coil', val: coilEnergized ? 'ENERGIZED' : 'De-energized', color: coilEnergized ? '#f59e0b' : t.dim },
                  { label: 'NO Contact', val: coilEnergized ? 'CLOSED' : 'Open', color: coilEnergized ? '#22c55e' : t.dim },
                  { label: 'Motor', val: coilEnergized ? 'RUNNING ✓' : 'Stopped', color: coilEnergized ? '#10b981' : t.dim },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: t.sub }}>{row.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: row.color }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: t.card, borderRadius: 10, padding: 14, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Key Concept</div>
                <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.5 }}>
                  A relay uses a <strong style={{ color: '#f59e0b' }}>low-power control signal</strong> (24VDC coil) to switch a <strong style={{ color: '#10b981' }}>high-power load</strong> (120VAC motor). The two circuits are electrically isolated — the coil never touches the power circuit.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'ladder' && (
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 11, color: t.sub, marginBottom: 16 }}>
            Ladder logic is a direct translation of relay wiring diagrams. Each rung maps to a relay circuit: horizontal lines are wires, vertical lines are power rails.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.dim, marginBottom: 10 }}>Relay Wiring</div>
              <div style={{ background: t.card, borderRadius: 10, padding: 14, border: `1px solid ${t.border}` }}>
                {[
                  { from: 'L1', component: '──[START_PB]──', to: '[MOTOR_K1 coil]──N' },
                  { from: 'L1', component: '──[K1 NO]──', to: '[MOTOR load]──N' },
                  { from: 'L1', component: '──[K1 NC]──', to: '[PILOT LIGHT]──N' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, fontFamily: 'monospace', fontSize: 11 }}>
                    <span style={{ color: t.dim, minWidth: 20 }}>{i + 1}</span>
                    <span style={{ color: '#6366f1' }}>{row.from}</span>
                    <span style={{ color: t.text }}>{row.component}</span>
                    <span style={{ color: '#10b981' }}>{row.to}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.dim, marginBottom: 10 }}>Ladder Diagram (same logic)</div>
              <div style={{ background: t.card, borderRadius: 10, padding: 14, border: `1px solid ${t.border}` }}>
                {[
                  { contacts: '—[START_PB]—', coil: '—(MOTOR_K1)—', label: 'Start coil' },
                  { contacts: '—[MOTOR_K1]—', coil: '—(MOTOR_OUT)—', label: 'Run motor' },
                  { contacts: '—[/MOTOR_K1]—', coil: '—(PILOT_LT)—', label: 'Pilot light' },
                ].map((row, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: t.dim, marginBottom: 2 }}>Rung {i + 1} — {row.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontFamily: 'monospace', fontSize: 12 }}>
                      <span style={{ color: '#6366f1', fontWeight: 700 }}>|</span>
                      <span style={{ color: t.text }}>{row.contacts}</span>
                      <span style={{ flex: 1, height: 2, background: t.fence, minWidth: 20 }} />
                      <span style={{ color: '#10b981' }}>{row.coil}</span>
                      <span style={{ color: t.fence, fontWeight: 700 }}>|</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'evolution' && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { year: '1940s–1970s', tech: 'Relay Panels', color: '#ef4444', icon: '⚡', pros: ['Simple, robust, fail-safe'], cons: ['Rewiring = hours of downtime', 'Hundreds of physical relays', 'No diagnostics', 'Space and heat'] },
              { year: '1969', tech: 'First PLC (Modicon 084)', color: '#f59e0b', icon: '💡', pros: ['Reprogrammable — no rewire', 'Ladder logic: familiar to relay techs'], cons: ['Expensive, early units', 'Limited instruction set'] },
              { year: '1980s+', tech: 'Modern PLC', color: '#10b981', icon: '🏭', pros: ['Same ladder logic on 10,000 I/O points', 'Millisecond timing, diagnostics, HMI', 'Networks (Ethernet, PROFIBUS)'], cons: ['Requires programming knowledge', 'Software dependency'] },
            ].map(era => (
              <div key={era.year} style={{ background: t.card, borderRadius: 10, padding: 16, border: `1px solid ${era.color}40` }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{era.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: era.color }}>{era.tech}</div>
                    <div style={{ fontSize: 10, color: t.dim }}>{era.year}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>ADVANTAGES</div>
                    {era.pros.map(p => <div key={p} style={{ fontSize: 11, color: t.sub, marginBottom: 2 }}>✓ {p}</div>)}
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>LIMITATIONS</div>
                    {era.cons.map(c => <div key={c} style={{ fontSize: 11, color: t.sub, marginBottom: 2 }}>✗ {c}</div>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
