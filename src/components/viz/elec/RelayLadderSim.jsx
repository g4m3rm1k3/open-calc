import { useState } from 'react';

// A simple ladder logic simulator with relay coil + NO/NC contacts
// Demonstrates: energize coil → contacts change state → outputs follow

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
    inputDefault: { START_PB: false, STOP_PB: false }, // STOP_PB false = NC closed
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
  // Simple left-to-right evaluation, one scan
  for (const rung of rungs) {
    let power = true;
    let parallelGroup = null;

    for (const el of rung.elements) {
      if (el.type === 'xic') {
        power = power && !!newTags[el.tag];
      } else if (el.type === 'xio') {
        power = power && !newTags[el.tag];
      } else if (el.type === 'parallel_xic') {
        // OR branch: power = power || tag
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
    // Run one scan cycle
    const allTags = { ...tagMemory, ...newInputs };
    const after = evaluateLadder(sc.rungs, allTags);
    setTagMemory(after);
  };

  const allTags = { ...tagMemory, ...inputState };

  // Re-evaluate on every render to reflect current inputs
  const evaluated = evaluateLadder(sc.rungs, allTags);

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#10b981' }}>Ladder Logic Simulator</span>
        {Object.keys(SCENARIOS).map(s => (
          <button key={s} onClick={() => changeScenario(s)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: scenario === s ? '#10b981' : '#e2e8f0',
              background: scenario === s ? '#10b981' : 'transparent',
              color: scenario === s ? 'white' : '#64748b',
            }}>{s}</button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14, fontStyle: 'italic' }}>{sc.desc}</p>

      {/* Input toggles */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Inputs (click to toggle)</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {sc.inputs.map(tag => {
            const isActive = !!inputState[tag];
            return (
              <button key={tag} onClick={() => toggleInput(tag)}
                style={{
                  padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 12,
                  border: `2px solid ${isActive ? '#6366f1' : '#e2e8f0'}`,
                  background: isActive ? '#e0e7ff' : '#f8fafc',
                  color: isActive ? '#4338ca' : '#64748b',
                  transition: 'all 0.15s',
                }}>
                {sc.inputLabels[tag] || tag}: <span style={{ fontFamily: 'monospace' }}>{isActive ? '1' : '0'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ladder diagram */}
      <div style={{ marginBottom: 16 }}>
        {sc.rungs.map(rung => {
          // Simulate power flow for this rung with current tags
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
            <div key={rung.id} style={{ marginBottom: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{rung.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
                {/* Left rail */}
                <div style={{ width: 4, height: 40, background: '#6366f1', borderRadius: 2, marginRight: 6, flexShrink: 0 }} />

                {rung.elements.map((el, ei) => {
                  const state = elementStates[ei];
                  const isOutput = el.type === 'ote' || el.type === 'otl' || el.type === 'otu';
                  const isActive = isOutput ? !!evaluated[el.tag] : state?.passes;
                  const color = isActive ? CONTACT_COLORS[el.type] : '#94a3b8';

                  if (el.type === 'parallel_xic') {
                    return (
                      <div key={ei} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 6, flexShrink: 0 }}>
                        <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 1 }}>OR</div>
                        <div style={{ padding: '4px 8px', border: `2px dashed ${color}`, borderRadius: 6, fontSize: 10, fontWeight: 700, color, background: isActive ? color + '15' : 'white' }}>
                          {CONTACT_SYMBOLS[el.type]} {el.label}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={ei} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {/* Wire */}
                      <div style={{ width: 16, height: 2, background: isActive ? '#10b981' : '#e2e8f0' }} />
                      {/* Element */}
                      <div style={{
                        padding: '6px 10px', border: `2px solid ${color}`,
                        borderRadius: isOutput ? 20 : 6,
                        fontSize: 10, fontWeight: 700, color, background: isActive ? color + '15' : 'white',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 60,
                      }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{CONTACT_SYMBOLS[el.type]}</span>
                        <span style={{ fontSize: 9 }}>{el.label}</span>
                        <span style={{ fontSize: 9, color: isActive ? color : '#94a3b8' }}>{evaluated[el.tag] ? '1' : '0'}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Wire to right rail */}
                <div style={{ width: 16, height: 2, background: evaluated[rung.elements[rung.elements.length - 1]?.tag] ? '#10b981' : '#e2e8f0' }} />
                {/* Right rail */}
                <div style={{ width: 4, height: 40, background: '#e2e8f0', borderRadius: 2, flexShrink: 0 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tag state display */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Tag Memory</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(evaluated).map(([tag, val]) => (
            <div key={tag} style={{
              padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: val ? '#d1fae5' : '#f1f5f9',
              border: `1px solid ${val ? '#6ee7b7' : '#e2e8f0'}`,
              color: val ? '#065f46' : '#94a3b8',
            }}>{tag}: {val ? '1' : '0'}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
