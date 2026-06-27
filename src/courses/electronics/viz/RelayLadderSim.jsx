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
    bg:      dark ? '#0a0f1e' : '#f8fafc',
    rung:    dark ? '#111827' : '#ffffff',
    border:  dark ? '#1e293b' : '#e2e8f0',
    text: dark ? "rgb(var(--tw-custom-slate-200))" : "rgb(var(--tw-custom-slate-800))",
    sub:     dark ? '#94a3b8' : '#64748b',
    dim:     dark ? '#475569' : '#94a3b8',
    wire:    dark ? '#334155' : '#e2e8f0',
    elBg:    dark ? '#0f172a' : '#ffffff',
    tagOff:  dark ? '#1e293b' : '#f1f5f9',
    tagBord: dark ? '#334155' : '#e2e8f0',
    tagText: dark ? '#475569' : '#94a3b8',
    btnBg:   dark ? '#1e2d4a' : '#f0f7ff',
  };
}

const SCENARIOS = {
  'Motor Seal-in': {
    desc: 'Press START to seal-in the motor run circuit. Press STOP to break it.',
    rungs: [
      {
        id: 1,
        label: 'Rung 1 — Start / Seal-in',
        elements: [
          { type: 'xic', tag: 'START_PB', label: 'Start PB', altTag: null },
          { type: 'parallel_xic', tag: 'MOTOR_RUN', label: 'Motor Run' },
          { type: 'xio', tag: 'STOP_PB', label: 'Stop PB' },
          { type: 'ote', tag: 'MOTOR_RUN', label: 'Motor Run' },
        ],
      },
      {
        id: 2,
        label: 'Rung 2 — Motor Output',
        elements: [
          { type: 'xic', tag: 'MOTOR_RUN', label: 'Motor Run' },
          { type: 'ote', tag: 'MOTOR_OUTPUT', label: 'Motor Contactor' },
        ],
      },
    ],
    inputs: ['START_PB', 'STOP_PB'],
    inputLabels: { START_PB: 'START (NO)', STOP_PB: 'STOP (NC)' },
    inputDefault: { START_PB: false, STOP_PB: false },
  },
  'Alarm Latch': {
    desc: 'FAULT latches the alarm. ACK button acknowledges (clears) it.',
    rungs: [
      {
        id: 1,
        label: 'Rung 1 — Fault Latch (OTL)',
        elements: [
          { type: 'xic', tag: 'FAULT', label: 'Fault' },
          { type: 'otl', tag: 'ALARM', label: 'ALARM (Latch)' },
        ],
      },
      {
        id: 2,
        label: 'Rung 2 — Acknowledge Unlatch (OTU)',
        elements: [
          { type: 'xic', tag: 'ACK', label: 'Acknowledge' },
          { type: 'otu', tag: 'ALARM', label: 'ALARM (Unlatch)' },
        ],
      },
      {
        id: 3,
        label: 'Rung 3 — Alarm Output',
        elements: [
          { type: 'xic', tag: 'ALARM', label: 'Alarm' },
          { type: 'ote', tag: 'ALARM_LIGHT', label: 'Alarm Light' },
        ],
      },
    ],
    inputs: ['FAULT', 'ACK'],
    inputLabels: { FAULT: 'FAULT (NO)', ACK: 'ACK (NO)' },
    inputDefault: { FAULT: false, ACK: false },
  },
  'Safety Interlock': {
    desc: 'All three conditions must be met: door closed, E-stop clear, no fault.',
    rungs: [
      {
        id: 1,
        label: 'Rung 1 — Enable when all safe',
        elements: [
          { type: 'xic', tag: 'DOOR_CLOSED', label: 'Door Closed' },
          { type: 'xio', tag: 'ESTOP', label: 'E-Stop' },
          { type: 'xio', tag: 'FAULT', label: 'Fault' },
          { type: 'ote', tag: 'ENABLE', label: 'Run Enable' },
        ],
      },
    ],
    inputs: ['DOOR_CLOSED', 'ESTOP', 'FAULT'],
    inputLabels: { DOOR_CLOSED: 'Door Closed (NO)', ESTOP: 'E-Stop (NC)', FAULT: 'Fault (NC)' },
    inputDefault: { DOOR_CLOSED: false, ESTOP: false, FAULT: false },
  },
};

function evaluateLadder(rungs, tags) {
  const newTags = { ...tags };
  for (const rung of rungs) {
    let power = true;
    for (const el of rung.elements) {
      if (el.type === 'xic') {
        power = power && !!newTags[el.tag];
      } else if (el.type === 'xio') {
        power = power && !newTags[el.tag];
      } else if (el.type === 'parallel_xic') {
        power = power || !!newTags[el.tag];
      } else if (el.type === 'ote') {
        newTags[el.tag] = power;
      } else if (el.type === 'otl') {
        if (power) newTags[el.tag] = true;
      } else if (el.type === 'otu') {
        if (power) newTags[el.tag] = false;
      }
    }
  }
  return newTags;
}

const CONTACT_COLORS = { xic: '#6366f1', xio: '#ef4444', parallel_xic: '#6366f1', ote: '#10b981', otl: '#10b981', otu: '#ef4444' };
const CONTACT_SYMBOLS = { xic: '⊣⊢', xio: '⊣/⊢', parallel_xic: '⊣⊢', ote: '(  )', otl: '(L)', otu: '(U)' };

export default function RelayLadderSim() {
  const dark = useDark();
  const t = makeT(dark);

  const [scenario, setScenario] = useState('Motor Seal-in');
  const sc = SCENARIOS[scenario];

  const [inputState, setInputState] = useState(() => ({ ...sc.inputDefault }));
  const [tagMemory, setTagMemory] = useState({});

  const changeScenario = (s) => {
    setScenario(s);
    setInputState({ ...SCENARIOS[s].inputDefault });
    setTagMemory({});
  };

  const toggleInput = (tag) => {
    const newInputs = { ...inputState, [tag]: !inputState[tag] };
    setInputState(newInputs);
    const allTags = { ...tagMemory, ...newInputs };
    const after = evaluateLadder(sc.rungs, allTags);
    setTagMemory(after);
  };

  const allTags = { ...tagMemory, ...inputState };
  const evaluated = evaluateLadder(sc.rungs, allTags);

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#10b981' }}>Ladder Logic Simulator</span>
        {Object.keys(SCENARIOS).map(s => (
          <button key={s} onClick={() => changeScenario(s)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: scenario === s ? '#10b981' : t.border,
              background: scenario === s ? '#10b981' : 'transparent',
              color: scenario === s ? 'white' : t.sub,
            }}>{s}</button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: t.sub, marginBottom: 14, fontStyle: 'italic' }}>{sc.desc}</p>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Inputs (click to toggle)</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {sc.inputs.map(tag => {
            const isActive = !!inputState[tag];
            return (
              <button key={tag} onClick={() => toggleInput(tag)}
                style={{
                  padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 12,
                  border: `2px solid ${isActive ? '#6366f1' : t.border}`,
                  background: isActive ? (dark ? '#1e1b4b' : '#e0e7ff') : t.btnBg,
                  color: isActive ? (dark ? '#a5b4fc' : '#4338ca') : t.sub,
                  transition: 'all 0.15s',
                }}>
                {sc.inputLabels[tag] || tag}: <span style={{ fontFamily: 'monospace' }}>{isActive ? '1' : '0'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        {sc.rungs.map(rung => {
          let power = true;
          const elementStates = rung.elements.map(el => {
            let thisPower;
            if (el.type === 'xic') thisPower = !!evaluated[el.tag];
            else if (el.type === 'xio') thisPower = !evaluated[el.tag];
            else if (el.type === 'parallel_xic') return { el, passes: !!evaluated[el.tag], power };
            else thisPower = power;

            const passes = el.type === 'ote' || el.type === 'otl' || el.type === 'otu' ? power : thisPower;
            if (el.type !== 'parallel_xic') {
              if (el.type !== 'ote' && el.type !== 'otl' && el.type !== 'otu') power = power && thisPower;
            }
            return { el, passes, power };
          });

          return (
            <div key={rung.id} style={{ marginBottom: 12, background: t.rung, borderRadius: 10, border: `1px solid ${t.border}`, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{rung.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
                <div style={{ width: 4, height: 40, background: '#6366f1', borderRadius: 2, marginRight: 6, flexShrink: 0 }} />

                {rung.elements.map((el, ei) => {
                  const state = elementStates[ei];
                  const isOutput = el.type === 'ote' || el.type === 'otl' || el.type === 'otu';
                  const isActive = isOutput ? !!evaluated[el.tag] : state?.passes;
                  const color = isActive ? CONTACT_COLORS[el.type] : t.dim;

                  if (el.type === 'parallel_xic') {
                    return (
                      <div key={ei} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 6, flexShrink: 0 }}>
                        <div style={{ fontSize: 8, color: t.dim, marginBottom: 1 }}>OR</div>
                        <div style={{ padding: '4px 8px', border: `2px dashed ${color}`, borderRadius: 6, fontSize: 10, fontWeight: 700, color, background: isActive ? color + '20' : t.elBg }}>
                          {CONTACT_SYMBOLS[el.type]} {el.label}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={ei} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 16, height: 2, background: isActive ? '#10b981' : t.wire }} />
                      <div style={{
                        padding: '6px 10px', border: `2px solid ${color}`,
                        borderRadius: isOutput ? 20 : 6,
                        fontSize: 10, fontWeight: 700, color, background: isActive ? color + '20' : t.elBg,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 60,
                      }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{CONTACT_SYMBOLS[el.type]}</span>
                        <span style={{ fontSize: 9 }}>{el.label}</span>
                        <span style={{ fontSize: 9, color: isActive ? color : t.dim }}>{evaluated[el.tag] ? '1' : '0'}</span>
                      </div>
                    </div>
                  );
                })}

                <div style={{ width: 16, height: 2, background: evaluated[rung.elements[rung.elements.length - 1]?.tag] ? '#10b981' : t.wire }} />
                <div style={{ width: 4, height: 40, background: t.wire, borderRadius: 2, flexShrink: 0 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Tag Memory</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(evaluated).map(([tag, val]) => (
            <div key={tag} style={{
              padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: val ? (dark ? '#064e3b' : '#d1fae5') : t.tagOff,
              border: `1px solid ${val ? '#6ee7b7' : t.tagBord}`,
              color: val ? (dark ? '#6ee7b7' : '#065f46') : t.tagText,
            }}>{tag}: {val ? '1' : '0'}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
