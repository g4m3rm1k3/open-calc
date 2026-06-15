import { useState, useEffect, useRef } from 'react';

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
    faint:  dark ? '#334155' : '#e2e8f0',
  };
}

const PHASES = [
  {
    id: 'input', name: 'Input Scan', color: '#6366f1', icon: '⬇', duration: 800,
    desc: 'CPU reads all physical input terminals and copies their states into the Input Image Table (IIT) in RAM.',
    detail: 'Sensors → Input Module → Input Image Table',
    steps: [
      'Read LIMIT_SW_1 terminal → I:0/0 = 1',
      'Read LIMIT_SW_2 terminal → I:0/1 = 0',
      'Read PHOTO_EYE terminal → I:0/2 = 1',
      'Read E_STOP terminal → I:0/3 = 1',
      'Input Image Table is now frozen for this scan.',
    ],
  },
  {
    id: 'program', name: 'Program Scan', color: '#10b981', icon: '⚙', duration: 1200,
    desc: 'CPU executes every rung sequentially, top to bottom. Reads from IIT, writes to Output Image Table (OIT).',
    detail: 'Input Image Table → Program Logic → Output Image Table',
    steps: [
      'Rung 1: XIC(I:0/0) AND XIC(I:0/2) → OTE(O:1/0) → OIT[O:1/0] = 1',
      'Rung 2: XIC(O:1/0) → OTE(O:1/1) → OIT[O:1/1] = 1',
      'Rung 3: XIO(I:0/1) → OTE(O:1/2) → OIT[O:1/2] = 1',
      '... evaluate all rungs ...',
      'Physical outputs NOT changed yet — only OIT updated.',
    ],
  },
  {
    id: 'output', name: 'Output Scan', color: '#f59e0b', icon: '⬆', duration: 800,
    desc: 'CPU copies the entire Output Image Table to the physical output modules simultaneously.',
    detail: 'Output Image Table → Output Module → Actuators',
    steps: [
      'OIT[O:1/0] = 1 → MOTOR_FWD terminal = 24VDC',
      'OIT[O:1/1] = 1 → CONVEYOR terminal = 24VDC',
      'OIT[O:1/2] = 1 → ALARM_LIGHT terminal = 24VDC',
      'All outputs update atomically.',
      'No partial output states visible to the machine.',
    ],
  },
  {
    id: 'housekeeping', name: 'Housekeeping', color: '#8b5cf6', icon: '↺', duration: 400,
    desc: 'CPU handles communication requests (HMI, SCADA), resets watchdog timer, runs diagnostics.',
    detail: 'Communication • Watchdog reset • Diagnostics',
    steps: [
      'Service HMI tag read requests (10 tags).',
      'Reset watchdog timer (prevents CPU fault on overrun).',
      'Update system clock and status registers.',
      'Scan complete. Restart immediately.',
    ],
  },
];

const INPUT_SENSORS = [
  { name: 'LIMIT_SW_1', addr: 'I:0/0', label: 'Limit Sw 1' },
  { name: 'LIMIT_SW_2', addr: 'I:0/1', label: 'Limit Sw 2' },
  { name: 'PHOTO_EYE',  addr: 'I:0/2', label: 'Photo Eye' },
  { name: 'E_STOP',     addr: 'I:0/3', label: 'E-Stop (NC)' },
];

const OUTPUT_ACTUATORS = [
  { name: 'MOTOR_FWD',   addr: 'O:1/0', label: 'Motor Fwd' },
  { name: 'CONVEYOR',    addr: 'O:1/1', label: 'Conveyor' },
  { name: 'ALARM_LIGHT', addr: 'O:1/2', label: 'Alarm Light' },
];

export default function PLCScanCycleViz() {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState('auto');
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [inputs, setInputs] = useState({ LIMIT_SW_1: true, LIMIT_SW_2: false, PHOTO_EYE: true, E_STOP: true });
  const [iit, setIit] = useState({});
  const [oit, setOit] = useState({});
  const [running, setRunning] = useState(true);
  const timerRef = useRef(null);

  const phase = PHASES[phaseIdx];

  const advancePhase = () => {
    setPhaseIdx(p => {
      const next = (p + 1) % PHASES.length;
      if (next === 0) setScanCount(c => c + 1);
      if (next === 0) setIit({ ...inputs });
      if (next === 2) setOit(computeOIT({ ...inputs }));
      return next;
    });
    setStepIdx(0);
  };

  function computeOIT(iitState) {
    const motorFwd = (iitState['LIMIT_SW_1'] && iitState['PHOTO_EYE']) ? 1 : 0;
    return { MOTOR_FWD: motorFwd, CONVEYOR: motorFwd, ALARM_LIGHT: !iitState['LIMIT_SW_2'] ? 1 : 0 };
  }

  useEffect(() => {
    if (mode !== 'auto' || !running) return;
    timerRef.current = setTimeout(advancePhase, phase.duration);
    return () => clearTimeout(timerRef.current);
  }, [mode, running, phaseIdx]);

  useEffect(() => {
    if (phaseIdx === 0) setIit({ ...inputs });
  }, [phaseIdx, inputs]);

  const stepForward = () => {
    if (stepIdx < phase.steps.length - 1) setStepIdx(s => s + 1);
    else advancePhase();
  };

  const scanTimeMs = PHASES.reduce((s, p) => s + p.duration, 0);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', background: t.panel, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: running ? '#10b981' : '#ef4444', boxShadow: running ? '0 0 8px #10b981' : 'none' }} />
          <span style={{ fontWeight: 700, fontSize: 13 }}>PLC Scan Cycle</span>
          <span style={{ fontSize: 10, color: t.dim }}>scan #{scanCount} · {scanTimeMs}ms/scan</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { setMode(m => m === 'auto' ? 'step' : 'auto'); setStepIdx(0); }}
            style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${t.fence}`, background: mode === 'step' ? t.card : 'transparent', color: t.sub }}>
            {mode === 'auto' ? '⏩ Auto' : '👆 Step'}
          </button>
          {mode === 'auto' && (
            <button onClick={() => setRunning(r => !r)}
              style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', borderColor: running ? '#10b981' : '#ef4444', background: 'transparent', color: running ? '#10b981' : '#ef4444' }}>
              {running ? '⏸ Pause' : '▶ Run'}
            </button>
          )}
          {mode === 'step' && (
            <button onClick={stepForward}
              style={{ padding: '4px 16px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid #6366f1', background: dark ? '#1e1b4b' : '#ede9fe', color: '#a5b4fc' }}>
              Next Step →
            </button>
          )}
        </div>
      </div>

      {/* Phase timeline */}
      <div style={{ display: 'flex', padding: '8px 16px', gap: 4, background: t.panel, borderBottom: `1px solid ${t.border}` }}>
        {PHASES.map((p, i) => (
          <div key={p.id} style={{ flex: p.duration, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ height: 6, borderRadius: 3, width: '100%', background: i <= phaseIdx ? p.color : t.border, opacity: i < phaseIdx ? 0.4 : 1, transition: 'background 0.3s' }} />
            <span style={{ fontSize: 9, color: i === phaseIdx ? p.color : t.dim, fontWeight: i === phaseIdx ? 700 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{p.name}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left: Active phase detail */}
        <div style={{ padding: 16, borderRight: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{phase.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: phase.color }}>{phase.name}</div>
              <div style={{ fontSize: 10, color: t.dim }}>{phase.detail}</div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: t.sub, lineHeight: 1.5, marginBottom: 12 }}>{phase.desc}</p>
          <div style={{ background: t.inset, borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Execution Log</div>
            {phase.steps.map((s, i) => (
              <div key={i} style={{
                fontSize: 10, fontFamily: 'monospace', padding: '3px 6px', borderRadius: 4, marginBottom: 3,
                color: mode === 'step' ? (i <= stepIdx ? phase.color : t.fence) : phase.color,
                background: mode === 'step' && i === stepIdx ? `${phase.color}15` : 'transparent',
                transition: 'color 0.2s',
              }}>
                {mode === 'step' && i === stepIdx ? '▶ ' : '  '}{s}
              </div>
            ))}
          </div>
        </div>

        {/* Right: I/O state */}
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Physical Inputs (click to toggle)</div>
            {INPUT_SENSORS.map(s => (
              <button key={s.name} onClick={() => setInputs(prev => ({ ...prev, [s.name]: !prev[s.name] }))}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${inputs[s.name] ? '#6366f1' : t.fence}`, background: inputs[s.name] ? '#6366f1' : 'transparent', flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: t.sub, minWidth: 60 }}>{s.addr}</span>
                <span style={{ fontSize: 11, color: inputs[s.name] ? '#a5b4fc' : t.dim }}>{s.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'monospace', color: inputs[s.name] ? '#10b981' : '#ef4444' }}>{inputs[s.name] ? '1' : '0'}</span>
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Input Image Table (IIT)</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {INPUT_SENSORS.map(s => {
                const frozen = phaseIdx >= 1;
                const val = frozen ? !!iit[s.name] : !!inputs[s.name];
                return (
                  <div key={s.name} style={{ background: t.panel, borderRadius: 6, padding: '4px 8px', border: `1px solid ${val ? '#6366f133' : t.border}` }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: t.dim }}>{s.addr}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: val ? '#6366f1' : t.fence }}>{val ? '1' : '0'}</div>
                  </div>
                );
              })}
            </div>
            {phaseIdx >= 1 && <div style={{ fontSize: 9, color: t.dim, marginTop: 4, fontStyle: 'italic' }}>Frozen at scan start — won't change until next input scan</div>}
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Output Image Table → Physical Outputs</div>
            {OUTPUT_ACTUATORS.map(a => {
              const oitVal = !!oit[a.name];
              const physVal = phaseIdx >= 2 && oitVal;
              return (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: oitVal ? '#f59e0b40' : t.card, border: `1px solid ${oitVal ? '#f59e0b' : t.fence}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: t.sub, minWidth: 60 }}>{a.addr}</span>
                  <span style={{ fontSize: 11, color: oitVal ? '#fde68a' : t.dim }}>{a.label}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 9, color: t.dim }}>OIT</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: oitVal ? '#f59e0b' : t.fence }}>{oitVal ? '1' : '0'}</span>
                    <span style={{ fontSize: 9, color: t.dim }}>→ HW</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: physVal ? '#10b981' : t.fence }}>{physVal ? '1' : '0'}</span>
                  </div>
                </div>
              );
            })}
            {phaseIdx < 2 && <div style={{ fontSize: 9, color: t.dim, marginTop: 4, fontStyle: 'italic' }}>Physical outputs not updated until Output Scan completes</div>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 16px', background: t.panel, borderTop: `1px solid ${t.border}`, fontSize: 10, color: t.dim, display: 'flex', gap: 16 }}>
        <span>Try: toggle inputs mid-cycle — IIT won't update until next Input Scan</span>
        <span style={{ marginLeft: 'auto' }}>Switch to Step mode to walk through one step at a time</span>
      </div>
    </div>
  );
}
