import { useState } from 'react';

const TYPES = ['SR', 'D', 'JK', 'T'];

function nextStateSR(Q, S, R) {
  if (S && R) return null; // forbidden
  if (S) return 1;
  if (R) return 0;
  return Q;
}
function nextStateD(Q, D) { return D; }
function nextStateJK(Q, J, K) {
  if (J && K) return Q ^ 1;
  if (J) return 1;
  if (K) return 0;
  return Q;
}
function nextStateT(Q, T) { return T ? Q ^ 1 : Q; }

export default function FlipFlopSim() {
  const [type, setType] = useState('SR');
  const [Q, setQ] = useState(0);
  const [inputs, setInputs] = useState({ S: 0, R: 0, D: 0, J: 0, K: 0, T: 0 });
  const [history, setHistory] = useState([{ tick: 0, Q: 0, inputs: {} }]);
  const [error, setError] = useState(null);

  const toggleInput = (key) => {
    setInputs(prev => ({ ...prev, [key]: prev[key] ^ 1 }));
    setError(null);
  };

  const clockEdge = () => {
    let nextQ;
    setError(null);

    if (type === 'SR') {
      const result = nextStateSR(Q, inputs.S, inputs.R);
      if (result === null) { setError('Forbidden state: S=1 R=1'); return; }
      nextQ = result;
    } else if (type === 'D') {
      nextQ = nextStateD(Q, inputs.D);
    } else if (type === 'JK') {
      nextQ = nextStateJK(Q, inputs.J, inputs.K);
    } else {
      nextQ = nextStateT(Q, inputs.T);
    }

    setQ(nextQ);
    setHistory(prev => {
      const tick = (prev[prev.length - 1]?.tick ?? 0) + 1;
      const entry = { tick, Q: nextQ, inputs: { ...inputs } };
      const next = [...prev, entry];
      return next.slice(-10); // keep last 10
    });
  };

  const reset = () => {
    setQ(0);
    setHistory([{ tick: 0, Q: 0, inputs: {} }]);
    setError(null);
  };

  // Input buttons for the current type
  const inputKeys = {
    SR: ['S', 'R'],
    D: ['D'],
    JK: ['J', 'K'],
    T: ['T'],
  }[type];

  const inputColors = { S: '#6366f1', R: '#ef4444', D: '#6366f1', J: '#6366f1', K: '#ef4444', T: '#6366f1' };

  const qColor = Q === 1 ? '#10b981' : '#94a3b8';
  const qbarColor = Q === 0 ? '#10b981' : '#94a3b8';

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
      {/* Type selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>Flip-Flop</span>
        {TYPES.map(t => (
          <button key={t} onClick={() => { setType(t); reset(); }}
            style={{
              padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              border: '2px solid', cursor: 'pointer',
              borderColor: type === t ? '#6366f1' : '#e2e8f0',
              background: type === t ? '#6366f1' : 'transparent',
              color: type === t ? 'white' : '#64748b',
            }}>{t}</button>
        ))}
      </div>

      {/* Main sim area */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inputKeys.map(key => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => toggleInput(key)}
                style={{
                  width: 44, height: 44, borderRadius: 10,
                  border: `3px solid ${inputColors[key]}`,
                  background: inputs[key] ? inputColors[key] : 'white',
                  color: inputs[key] ? 'white' : inputColors[key],
                  fontSize: 16, fontWeight: 800, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>{inputs[key]}</button>
              <span style={{ fontSize: 14, fontWeight: 700, color: inputColors[key], width: 16 }}>{key}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              border: '2px solid #94a3b8',
              background: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: '#64748b', fontWeight: 700, textAlign: 'center',
              lineHeight: 1.2
            }}>CLK</div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>↓</span>
          </div>
        </div>

        {/* Flip-flop box */}
        <div style={{
          border: '3px solid #6366f1', borderRadius: 14,
          padding: '20px 28px', background: '#f8f7ff',
          minWidth: 120, textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', letterSpacing: '0.15em', marginBottom: 12 }}>
            {type} FLIP-FLOP
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: Q === 1 ? '#d1fae5' : '#f1f5f9',
                border: `3px solid ${qColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 900, color: qColor,
                transition: 'all 0.2s',
              }}>{Q}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: qColor, marginTop: 4 }}>Q</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: Q === 0 ? '#d1fae5' : '#f1f5f9',
                border: `3px solid ${qbarColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 900, color: qbarColor,
                transition: 'all 0.2s',
              }}>{Q ^ 1}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: qbarColor, marginTop: 4 }}>Q̄</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={clockEdge}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: '#6366f1', color: 'white',
              border: 'none', fontSize: 13, fontWeight: 800,
              cursor: 'pointer', letterSpacing: '0.05em',
            }}>
            ↑ Clock Edge
          </button>
          <button onClick={reset}
            style={{
              padding: '6px 20px', borderRadius: 10,
              background: 'transparent', color: '#94a3b8',
              border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}>
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 14px', marginBottom: 14, color: '#991b1b', fontSize: 12, fontWeight: 600 }}>
          ⚠ {error}
        </div>
      )}

      {/* Truth table / characteristic equation */}
      <div style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
        {type === 'SR' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>SR Characteristic</div>
            <table style={{ fontSize: 12, borderCollapse: 'collapse', width: '100%', maxWidth: 280 }}>
              <thead><tr>{['S','R','Q','Q⁺'].map(h => <th key={h} style={{ padding: '3px 10px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, textAlign: 'center' }}>{h}</th>)}</tr></thead>
              <tbody>
                {[[0,0,'Q','Hold'],[0,1,'Q','0'],[1,0,'Q','1'],[1,1,'–','⚠']].map(([s,r,q,qn], i) => (
                  <tr key={i} style={{ background: inputs.S===s && inputs.R===r ? '#e0e7ff' : 'transparent' }}>
                    {[s,r,q,qn].map((v,j) => <td key={j} style={{ padding: '3px 10px', textAlign: 'center', color: v==='⚠'?'#ef4444':'#374151', fontWeight: v==='⚠'?700:400 }}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {type === 'D' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>D Characteristic: Q⁺ = D</div>
            <div style={{ fontSize: 12, color: '#374151' }}>Q captures whatever D is on the clock edge. No forbidden state.</div>
          </>
        )}
        {type === 'JK' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>JK Characteristic: Q⁺ = J·Q̄ + K̄·Q</div>
            <table style={{ fontSize: 12, borderCollapse: 'collapse', width: '100%', maxWidth: 280 }}>
              <thead><tr>{['J','K','Q⁺'].map(h => <th key={h} style={{ padding: '3px 10px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, textAlign: 'center' }}>{h}</th>)}</tr></thead>
              <tbody>
                {[[0,0,'Q (hold)'],[0,1,'0 (reset)'],[1,0,'1 (set)'],[1,1,'Q̄ (toggle)']].map(([j,k,qn], i) => (
                  <tr key={i} style={{ background: inputs.J===j && inputs.K===k ? '#e0e7ff' : 'transparent' }}>
                    {[j,k,qn].map((v,vi) => <td key={vi} style={{ padding: '3px 10px', textAlign: 'center', color: '#374151' }}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {type === 'T' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>T Characteristic: Q⁺ = T ⊕ Q</div>
            <div style={{ fontSize: 12, color: '#374151' }}>T=1: toggles Q on every clock edge. T=0: holds Q. Chain T flip-flops to make binary counters.</div>
          </>
        )}
      </div>

      {/* History / timing diagram */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clock History (Q output)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 44 }}>
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 36, borderRadius: 4,
                height: h.Q === 1 ? 32 : 16,
                background: h.Q === 1 ? '#10b981' : '#94a3b8',
                transition: 'all 0.2s',
              }} />
              <span style={{ fontSize: 9, color: '#94a3b8' }}>t{h.tick}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
