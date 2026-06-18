import { useState, useEffect } from 'react';

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
    bg:     dark ? '#0a0f1e' : '#f8fafc',
    panel:  dark ? '#111827' : '#ffffff',
    card:   dark ? '#1e293b' : '#f1f5f9',
    inset:  dark ? '#0f172a' : '#f8fafc',
    border: dark ? '#1e293b' : '#e2e8f0',
    fence:  dark ? '#334155' : '#d1d5db',
    text:   dark ? '#e2e8f0' : '#1e293b',
    sub:    dark ? '#94a3b8' : '#64748b',
    dim:    dark ? '#475569' : '#94a3b8',
    modBg:  dark ? '#111827' : '#1e293b',
  };
}

const MODULES = [
  {
    slot: 0, type: 'CPU', label: 'CPU', model: '1769-L33ERM', color: '#6366f1', width: 2,
    desc: 'CompactLogix Controller',
    details: { 'Memory': '2MB user program + 1MB I/O data', 'Scan time': '0.3ms / 1K Boolean instrs', 'Comm ports': 'EtherNet/IP, USB, Serial', 'Max I/O': '16 local modules', 'Watchdog': '10–500ms configurable' },
    signals: [],
  },
  {
    slot: 1, type: 'DI', label: '16-pt DI', model: '1769-IQ16', color: '#6366f1', width: 1,
    desc: '16-Point 24VDC Digital Input',
    details: { 'Points': '16', 'Voltage': '24VDC sourcing', 'Input filter': '1ms (default)', 'Current draw': '0.25A @ 5V backplane', 'Compatible': 'PNP (sourcing) sensors' },
    signals: [
      { bit: 0, name: 'LIMIT_SW_1', val: true }, { bit: 1, name: 'LIMIT_SW_2', val: false },
      { bit: 2, name: 'PHOTO_EYE', val: true }, { bit: 3, name: 'E_STOP_NC', val: true },
      { bit: 4, name: 'START_PB', val: false }, { bit: 5, name: 'STOP_PB', val: true },
    ],
  },
  {
    slot: 2, type: 'DO', label: '16-pt DO', model: '1769-OB16', color: '#10b981', width: 1,
    desc: '16-Point 24VDC Transistor Output',
    details: { 'Points': '16', 'Output type': 'Transistor (FET), sourcing', 'Rated current': '0.5A per point, 4A per group', 'Current draw': '0.30A @ 5V backplane', 'Max frequency': '1 kHz switching' },
    signals: [
      { bit: 0, name: 'MOTOR_RUN', val: true }, { bit: 1, name: 'CONVEYOR', val: true },
      { bit: 2, name: 'ALARM_HORN', val: false }, { bit: 3, name: 'GREEN_LIGHT', val: true }, { bit: 4, name: 'RED_LIGHT', val: false },
    ],
  },
  {
    slot: 3, type: 'AI', label: '4-ch AI', model: '1769-IF4', color: '#f59e0b', width: 1,
    desc: '4-Channel Analog Input (4–20mA)',
    details: { 'Channels': '4', 'Input range': '4–20mA (or 0–10V)', 'Resolution': '12-bit (0–4095 counts)', 'Update rate': '2.5ms per channel', 'Current draw': '0.45A @ 5V backplane' },
    signals: [
      { bit: 0, name: 'TEMP_SENSOR', val: '12543', unit: 'cts → 91°C' },
      { bit: 1, name: 'PRESSURE', val: '8192', unit: 'cts → 100 PSI' },
      { bit: 2, name: 'FLOW_RATE', val: '20480', unit: 'cts → 250 L/m' },
    ],
  },
  {
    slot: 4, type: 'AO', label: '2-ch AO', model: '1769-OF2', color: '#f59e0b', width: 1,
    desc: '2-Channel Analog Output (0–10V)',
    details: { 'Channels': '2', 'Output range': '0–10V or 4–20mA', 'Resolution': '12-bit (0–4095 counts)', 'Current draw': '0.35A @ 5V backplane', 'Load drive': '10mA max per channel' },
    signals: [
      { bit: 0, name: 'VFD_SPEED_REF', val: '2458', unit: 'cts → 36 Hz' },
      { bit: 1, name: 'VALVE_POSITION', val: '1638', unit: 'cts → 40%' },
    ],
  },
  {
    slot: 5, type: 'PWR', label: 'End Cap', model: '1769-ECR', color: '#475569', width: 0.7,
    desc: 'Right End Cap — terminates backplane bus',
    details: { 'Function': 'Bus termination', 'Required': 'Yes — must always be installed' },
    signals: [],
  },
];

const POWER_BUDGET = [
  { label: 'CPU (1769-L33ERM)',  a5v: 0.85, a24v: 0 },
  { label: '16-pt DI (1769-IQ16)', a5v: 0.25, a24v: 0 },
  { label: '16-pt DO (1769-OB16)', a5v: 0.30, a24v: 0 },
  { label: '4-ch AI (1769-IF4)',  a5v: 0.45, a24v: 0 },
  { label: '2-ch AO (1769-OF2)',  a5v: 0.35, a24v: 0.05 },
];

const SUPPLY_RATED = { a5v: 3.0, a24v: 0.8 };

export default function PLCHardwareViz() {
  const dark = useDark();
  const t = makeT(dark);

  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('rack');

  const selMod = selected !== null ? MODULES.find(m => m.slot === selected) : null;
  const totalA5v  = POWER_BUDGET.reduce((s, m) => s + m.a5v,  0);
  const totalA24v = POWER_BUDGET.reduce((s, m) => s + m.a24v, 0);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>CompactLogix 1769 Hardware</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {['rack', 'power', 'wiring'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', borderColor: view === v ? '#6366f1' : t.fence, background: view === v ? (dark ? '#1e1b4b' : '#ede9fe') : 'transparent', color: view === v ? '#a5b4fc' : t.sub }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {view === 'rack' && (
        <div style={{ padding: 16 }}>
          <div style={{ position: 'relative', background: t.card, borderRadius: 8, padding: '8px 8px 12px', border: `2px solid ${t.fence}`, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: t.dim, marginBottom: 6, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>1769-L33ERM CompactLogix Rack</div>
            <div style={{ height: 4, background: t.fence, borderRadius: 2, marginBottom: 6 }} />
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
              {MODULES.map(mod => (
                <div key={mod.slot} onClick={() => setSelected(selected === mod.slot ? null : mod.slot)}
                  style={{
                    flex: mod.width, minWidth: mod.type === 'PWR' ? 28 : 44,
                    height: mod.type === 'CPU' ? 100 : 90,
                    background: selected === mod.slot ? `${mod.color}30` : t.modBg,
                    border: `2px solid ${selected === mod.slot ? mod.color : mod.color + '60'}`,
                    borderRadius: 6, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 4px 5px', transition: 'all 0.15s',
                  }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: mod.type === 'PWR' ? t.fence : mod.color, boxShadow: mod.type !== 'PWR' ? `0 0 6px ${mod.color}` : 'none' }} />
                  {mod.signals.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                      {mod.signals.slice(0, 5).map((s, i) => (
                        <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: (typeof s.val === 'boolean' ? s.val : true) ? mod.color : t.fence, opacity: 0.8 }} />
                      ))}
                    </div>
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: mod.color, lineHeight: 1 }}>{mod.label}</div>
                    <div style={{ fontSize: 7, color: t.dim, marginTop: 1 }}>S{mod.slot}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 6, height: 3, background: 'linear-gradient(90deg, #6366f1, #10b981, #f59e0b, #f59e0b, #f59e0b, #475569)', borderRadius: 2, opacity: 0.5 }} />
            <div style={{ fontSize: 8, color: t.fence, marginTop: 2 }}>◄ 5V/24V Backplane Bus</div>
          </div>

          {selMod ? (
            <div style={{ background: t.panel, borderRadius: 8, padding: 14, border: `1px solid ${selMod.color}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: selMod.color, boxShadow: `0 0 8px ${selMod.color}` }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: selMod.color }}>{selMod.model}</div>
                  <div style={{ fontSize: 10, color: t.sub }}>Slot {selMod.slot} — {selMod.desc}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Specifications</div>
                  {Object.entries(selMod.details).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: t.sub, minWidth: 90 }}>{k}</span>
                      <span style={{ fontSize: 10, color: t.text }}>{v}</span>
                    </div>
                  ))}
                </div>
                {selMod.signals.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Live Signal Values</div>
                    {selMod.signals.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: (typeof s.val === 'boolean' ? s.val : true) ? selMod.color : t.fence, flexShrink: 0 }} />
                        <span style={{ fontSize: 9, fontFamily: 'monospace', color: t.sub, minWidth: 24 }}>/{s.bit}</span>
                        <span style={{ fontSize: 10, color: t.text }}>{s.name}</span>
                        <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 10, color: selMod.color }}>
                          {typeof s.val === 'boolean' ? (s.val ? '1' : '0') : s.val}
                          {s.unit && <span style={{ fontSize: 8, color: t.sub }}> {s.unit}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: t.panel, borderRadius: 8, padding: 14, textAlign: 'center', border: `1px dashed ${t.border}` }}>
              <div style={{ fontSize: 12, color: t.dim }}>Click a module to see its specifications and live I/O values</div>
              <div style={{ fontSize: 10, color: t.fence, marginTop: 4 }}>5 modules + end cap installed</div>
            </div>
          )}
        </div>
      )}

      {view === 'power' && (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: t.sub, marginBottom: 14 }}>
            The chassis power supply must provide enough 5V backplane current for all modules. Plan before ordering hardware.
          </div>
          <div style={{ background: t.panel, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 0 }}>
              <div style={{ padding: '6px 12px', fontSize: 10, fontWeight: 700, color: t.dim, borderBottom: `1px solid ${t.border}` }}>Module</div>
              <div style={{ padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#6366f1', borderBottom: `1px solid ${t.border}`, textAlign: 'right' }}>5V (A)</div>
              <div style={{ padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#f59e0b', borderBottom: `1px solid ${t.border}`, textAlign: 'right' }}>24V (A)</div>
              {POWER_BUDGET.map((m, i) => (
                <>
                  <div key={`l${i}`} style={{ padding: '5px 12px', fontSize: 10, color: t.sub, borderBottom: `1px solid ${t.inset}` }}>{m.label}</div>
                  <div key={`5v${i}`} style={{ padding: '5px 12px', fontSize: 10, fontFamily: 'monospace', color: '#a5b4fc', textAlign: 'right', borderBottom: `1px solid ${t.inset}` }}>{m.a5v.toFixed(2)}</div>
                  <div key={`24v${i}`} style={{ padding: '5px 12px', fontSize: 10, fontFamily: 'monospace', color: '#fde68a', textAlign: 'right', borderBottom: `1px solid ${t.inset}` }}>{m.a24v.toFixed(2)}</div>
                </>
              ))}
              <div style={{ padding: '6px 12px', fontSize: 10, fontWeight: 700, color: t.text, background: t.inset }}>TOTAL</div>
              <div style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: totalA5v / SUPPLY_RATED.a5v > 0.8 ? '#ef4444' : '#10b981', textAlign: 'right', background: t.inset }}>{totalA5v.toFixed(2)}</div>
              <div style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#fde68a', textAlign: 'right', background: t.inset }}>{totalA24v.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{ label: '5V Backplane', total: totalA5v, rated: SUPPLY_RATED.a5v, color: '#6366f1' },
              { label: '24V Field',    total: totalA24v, rated: SUPPLY_RATED.a24v, color: '#f59e0b' }].map(ps => {
              const pct = (ps.total / ps.rated) * 100;
              const ok = pct < 80;
              return (
                <div key={ps.label} style={{ background: t.panel, borderRadius: 8, padding: 12, border: `1px solid ${ok ? t.border : '#ef444440'}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, marginBottom: 6 }}>{ps.label} Supply</div>
                  <div style={{ height: 8, background: t.card, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: ok ? ps.color : '#ef4444', borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span style={{ color: ok ? '#10b981' : '#ef4444', fontWeight: 700 }}>{ps.total.toFixed(2)}A used</span>
                    <span style={{ color: t.sub }}>{ps.rated.toFixed(1)}A rated</span>
                  </div>
                  <div style={{ fontSize: 9, marginTop: 2, color: ok ? '#22c55e' : '#ef4444' }}>{pct.toFixed(0)}% — {ok ? '✓ Within 80% guideline' : '⚠ Exceeds 80% — add second chassis'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'wiring' && (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: t.sub, marginBottom: 12 }}>Field wiring connects sensors/actuators to module terminals. I/O wiring goes to terminal blocks first, never directly to module connectors.</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              {
                color: '#6366f1', title: 'Digital Input Wiring (24VDC PNP/Sourcing)',
                rows: [
                  ['PNP Sensor (+)', '→ DI Terminal /0', 'I:0/0 = 1 when 24V present'],
                  ['24VDC Common',   '→ Module COM',     'Shared return for all DI points'],
                  ['Sensor +V',      '← 24VDC Rail',     'Sensor power (separate from signal)'],
                ],
              },
              {
                color: '#10b981', title: 'Digital Output Wiring (Transistor Sourcing)',
                rows: [
                  ['DO Terminal /0', '→ Solenoid +',  'Load receives 24VDC when ON'],
                  ['Module +V',      '← 24VDC Rail',  'Output power supply'],
                  ['Solenoid −',     '→ 24VDC Common','Return path through common'],
                ],
              },
              {
                color: '#f59e0b', title: 'Analog Input Wiring (4–20mA Two-Wire)',
                rows: [
                  ['AI+ Terminal',   '← Transmitter+', 'Signal wire (carries 4–20mA)'],
                  ['AI− Terminal',   '→ COM',           'Return wire'],
                  ['Transmitter+V',  '← 24VDC Rail',    '2-wire transmitter loop power'],
                ],
              },
            ].map(section => (
              <div key={section.title} style={{ background: t.panel, borderRadius: 8, overflow: 'hidden', border: `1px solid ${section.color}30` }}>
                <div style={{ padding: '6px 12px', background: `${section.color}15`, fontSize: 10, fontWeight: 700, color: section.color }}>{section.title}</div>
                {section.rows.map((r, i) => (
                  <div key={i} style={{ padding: '5px 12px', display: 'grid', gridTemplateColumns: '130px 150px 1fr', gap: 8, borderBottom: i < section.rows.length - 1 ? `1px solid ${t.inset}` : 'none' }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: t.sub }}>{r[0]}</span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: section.color }}>{r[1]}</span>
                    <span style={{ fontSize: 9, color: t.dim }}>{r[2]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
