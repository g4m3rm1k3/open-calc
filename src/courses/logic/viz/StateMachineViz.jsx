import { useState } from 'react';

const PRESETS = {
  'Traffic Light': {
    states: [
      { id: 0, name: 'GREEN', outputs: 'Green ON\n20s timer', color: '#10b981', textColor: 'white' },
      { id: 1, name: 'YELLOW', outputs: 'Yellow ON\n3s timer', color: '#f59e0b', textColor: 'white' },
      { id: 2, name: 'RED', outputs: 'Red ON\n30s timer', color: '#ef4444', textColor: 'white' },
    ],
    transitions: [
      { from: 0, to: 1, condition: 'Timer done\n(20s)' },
      { from: 1, to: 2, condition: 'Timer done\n(3s)' },
      { from: 2, to: 0, condition: 'Timer done\n(30s)' },
    ],
    initial: 0,
  },
  'Motor Starter': {
    states: [
      { id: 0, name: 'IDLE', outputs: 'Motor OFF\nReady', color: '#64748b', textColor: 'white' },
      { id: 1, name: 'STARTING', outputs: 'Contactor\nclosing', color: '#f59e0b', textColor: 'white' },
      { id: 2, name: 'RUNNING', outputs: 'Motor ON\nOverload watch', color: '#10b981', textColor: 'white' },
      { id: 3, name: 'FAULT', outputs: 'Trip latched\nAlarm ON', color: '#ef4444', textColor: 'white' },
    ],
    transitions: [
      { from: 0, to: 1, condition: 'START\npressed' },
      { from: 1, to: 2, condition: 'Speed >\n80%' },
      { from: 1, to: 3, condition: 'Timeout\nor trip' },
      { from: 2, to: 0, condition: 'STOP\npressed' },
      { from: 2, to: 3, condition: 'Overload\ntrip' },
      { from: 3, to: 0, condition: 'RESET\n+ fault clear' },
    ],
    initial: 0,
  },
  'Alarm Acknowledge': {
    states: [
      { id: 0, name: 'NORMAL', outputs: 'No alarm\nLight OFF', color: '#10b981', textColor: 'white' },
      { id: 1, name: 'ALARM_ACTIVE', outputs: 'Light ON\nBuzzer ON', color: '#ef4444', textColor: 'white' },
      { id: 2, name: 'ACKNOWLEDGED', outputs: 'Light ON\nBuzzer OFF', color: '#f59e0b', textColor: 'white' },
    ],
    transitions: [
      { from: 0, to: 1, condition: 'FAULT\ndetected' },
      { from: 1, to: 2, condition: 'ACK\nbutton' },
      { from: 2, to: 0, condition: 'Fault\nclears' },
      { from: 1, to: 0, condition: 'Fault clears\nbefore ACK' },
    ],
    initial: 0,
  },
};

// Layout positions for states (for the SVG diagram)
const LAYOUTS = {
  'Traffic Light': [
    { x: 200, y: 60 },
    { x: 360, y: 200 },
    { x: 40, y: 200 },
  ],
  'Motor Starter': [
    { x: 60, y: 110 },
    { x: 220, y: 50 },
    { x: 380, y: 110 },
    { x: 220, y: 200 },
  ],
  'Alarm Acknowledge': [
    { x: 60, y: 120 },
    { x: 240, y: 50 },
    { x: 240, y: 195 },
  ],
};

const R = 38; // state circle radius

function arrow(x1, y1, x2, y2, label, isActive, idx) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  const ux = dx/len, uy = dy/len;
  // Start/end at circle edge
  const sx = x1 + ux * R, sy = y1 + uy * R;
  const ex = x2 - ux * R, ey = y2 - uy * R;
  // Midpoint for label
  const mx = (sx + ex) / 2, my = (sy + ey) / 2;
  // Perpendicular offset for label
  const px = -uy * 18, py = ux * 18;
  // Arrowhead
  const angle = Math.atan2(ey - sy, ex - sx);
  const aw = 8;
  const ax1 = ex - aw * Math.cos(angle - 0.5);
  const ay1 = ey - aw * Math.sin(angle - 0.5);
  const ax2 = ex - aw * Math.cos(angle + 0.5);
  const ay2 = ey - aw * Math.sin(angle + 0.5);

  const color = isActive ? '#6366f1' : '#94a3b8';

  return (
    <g key={idx}>
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} />
      <polygon points={`${ex},${ey} ${ax1},${ay1} ${ax2},${ay2}`} fill={color} />
      {label.split('\n').map((line, li) => (
        <text key={li} x={mx + px} y={my + py + li * 12} textAnchor="middle" fontSize={9} fill={color} fontWeight={isActive ? 700 : 400}>{line}</text>
      ))}
    </g>
  );
}

// Self-loop arrow
function selfLoop(cx, cy, label, isActive) {
  const lx = cx, ly = cy - R - 24;
  return (
    <g>
      <path d={`M ${cx - 16} ${cy - R} Q ${lx - 30} ${ly - 10} ${cx + 16} ${cy - R}`}
        fill="none" stroke={isActive ? '#6366f1' : '#94a3b8'} strokeWidth={1.5} />
      <text x={lx - 32} y={ly - 12} textAnchor="middle" fontSize={9} fill={isActive ? '#6366f1' : '#94a3b8'}>{label}</text>
    </g>
  );
}

export default function StateMachineViz() {
  const [preset, setPreset] = useState('Traffic Light');
  const [active, setActive] = useState(PRESETS['Traffic Light'].initial);
  const [lastTransition, setLastTransition] = useState(null);

  const fsm = PRESETS[preset];
  const layout = LAYOUTS[preset];

  const selectPreset = (p) => {
    setPreset(p);
    setActive(PRESETS[p].initial);
    setLastTransition(null);
  };

  // Transitions from current state
  const available = fsm.transitions.filter(t => t.from === active);

  const fireTransition = (t) => {
    setLastTransition(t);
    setActive(t.to);
  };

  const reset = () => {
    setActive(fsm.initial);
    setLastTransition(null);
  };

  const svgW = 460, svgH = 270;

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
      {/* Preset selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>State Machine</span>
        {Object.keys(PRESETS).map(p => (
          <button key={p} onClick={() => selectPreset(p)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: preset === p ? '#6366f1' : '#e2e8f0',
              background: preset === p ? '#6366f1' : 'transparent',
              color: preset === p ? 'white' : '#64748b',
            }}>{p}</button>
        ))}
      </div>

      {/* State diagram SVG */}
      <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden' }}>
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', maxHeight: 280 }}>
          {/* Transitions */}
          {fsm.transitions.map((t, i) => {
            const from = layout[t.from];
            const to = layout[t.to];
            const isActive = lastTransition && lastTransition.from === t.from && lastTransition.to === t.to;
            if (t.from === t.to) return selfLoop(from.x, from.y, t.condition, isActive);
            return arrow(from.x, from.y, to.x, to.y, t.condition, isActive, i);
          })}
          {/* States */}
          {fsm.states.map((s, i) => {
            const pos = layout[i];
            const isCurrent = active === s.id;
            return (
              <g key={s.id} onClick={() => setActive(s.id)} style={{ cursor: 'pointer' }}>
                <circle cx={pos.x} cy={pos.y} r={R}
                  fill={s.color}
                  stroke={isCurrent ? '#1e293b' : 'transparent'}
                  strokeWidth={isCurrent ? 4 : 0}
                  opacity={isCurrent ? 1 : 0.55}
                />
                {isCurrent && (
                  <circle cx={pos.x} cy={pos.y} r={R + 6}
                    fill="none" stroke={s.color} strokeWidth={2} opacity={0.4} />
                )}
                <text x={pos.x} y={pos.y - 6} textAnchor="middle" fontSize={10} fontWeight={800} fill={s.textColor}>{s.name}</text>
                {s.outputs.split('\n').map((line, li) => (
                  <text key={li} x={pos.x} y={pos.y + 8 + li * 11} textAnchor="middle" fontSize={8} fill={s.textColor} opacity={0.9}>{line}</text>
                ))}
              </g>
            );
          })}
          {/* Initial arrow */}
          <g>
            <line x1={layout[fsm.initial].x - R - 20} y1={layout[fsm.initial].y} x2={layout[fsm.initial].x - R} y2={layout[fsm.initial].y} stroke="#94a3b8" strokeWidth={1.5} />
            <polygon points={`${layout[fsm.initial].x - R},${layout[fsm.initial].y} ${layout[fsm.initial].x - R - 7},${layout[fsm.initial].y - 5} ${layout[fsm.initial].x - R - 7},${layout[fsm.initial].y + 5}`} fill="#94a3b8" />
          </g>
        </svg>
      </div>

      {/* Current state info */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 160,
          background: fsm.states[active].color + '22',
          border: `2px solid ${fsm.states[active].color}`,
          borderRadius: 10, padding: '12px 16px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Current State</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: fsm.states[active].color }}>{fsm.states[active].name}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, whiteSpace: 'pre-line' }}>{fsm.states[active].outputs}</div>
        </div>

        {/* Available transitions */}
        <div style={{ flex: 2, minWidth: 200 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Fire Transition</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {available.map((t, i) => (
              <button key={i} onClick={() => fireTransition(t)}
                style={{
                  padding: '8px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  background: '#f0f0ff', border: '1px solid #c7d2fe',
                  fontSize: 12, color: '#4338ca', fontWeight: 600,
                }}>
                → {fsm.states[t.to].name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({t.condition.replace('\n', ' ')})</span>
              </button>
            ))}
            {available.length === 0 && (
              <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No transitions from this state</span>
            )}
          </div>
        </div>
      </div>

      <button onClick={reset} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'transparent', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
        Reset to Initial
      </button>
    </div>
  );
}
