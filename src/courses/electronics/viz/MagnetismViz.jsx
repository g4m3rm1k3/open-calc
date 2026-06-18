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
    panel:   dark ? '#111827' : '#ffffff',
    card:    dark ? '#1e293b' : '#f1f5f9',
    border:  dark ? '#1e293b' : '#e2e8f0',
    fence:   dark ? '#334155' : '#d1d5db',
    text:    dark ? '#e2e8f0' : '#1e293b',
    sub:     dark ? '#94a3b8' : '#64748b',
    dim:     dark ? '#475569' : '#94a3b8',
    svgBg:   dark ? '#0f172a' : '#ffffff',
    wireFill: dark ? '#1e3a5f' : '#bfdbfe',
    wireStroke: '#3b82f6',
  };
}

const MODES = ['Wire', 'Solenoid', 'Motor'];

export default function MagnetismViz({ params = {} }) {
  const dark = useDark();
  const t = makeT(dark);

  const [mode, setMode] = useState(params.mode ?? 'Wire');
  const [current, setCurrent] = useState(5);      // Amperes
  const [turns, setTurns] = useState(10);          // for solenoid
  const [coreType, setCoreType] = useState('air'); // 'air' | 'iron'
  const [bField, setBField] = useState(0.5);       // Tesla, for motor
  const [wireLen, setWireLen] = useState(0.1);     // meters, for motor

  // Derived
  const mu0 = 4 * Math.PI * 1e-7;
  const mur = coreType === 'iron' ? 1000 : 1;
  const L_solenoid = 0.1; // 10cm fixed solenoid length (m)
  const A_solenoid = Math.PI * (0.02) ** 2; // 2cm radius

  const B_wire_at_1cm = (mu0 * current) / (2 * Math.PI * 0.01); // at 1cm
  const B_solenoid = mu0 * mur * (turns / L_solenoid) * current;
  const H_solenoid = (turns / L_solenoid) * current; // A/m
  const Flux = B_solenoid * A_solenoid;
  const Force_motor = current * wireLen * bField; // F = BIL

  // SVG helpers
  const svgW = 360, svgH = 200;
  const cx = svgW / 2, cy = svgH / 2;

  const renderWire = () => {
    const radii = [18, 30, 44, 60, 78, 98];
    const alpha = Math.min(current / 20, 1);
    const dir = current >= 0 ? 1 : -1;
    return (
      <g>
        {/* Field circles */}
        {radii.map((r, i) => {
          const opacity = (1 - i / radii.length) * alpha * 0.7 + 0.1;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke="#3b82f6" strokeWidth={1.5 - i * 0.15} opacity={opacity} />
          );
        })}
        {/* Direction arrows on field circles */}
        {radii.slice(0, 4).map((r, i) => {
          const opacity = (1 - i / 4) * alpha * 0.8 + 0.1;
          const ax = cx + r; const ay = cy;
          return (
            <polygon key={i}
              points={`${ax},${ay - 5} ${ax + 7 * dir},${ay} ${ax},${ay + 5}`}
              fill="#3b82f6" opacity={opacity} />
          );
        })}
        {/* Wire cross-section */}
        <circle cx={cx} cy={cy} r={14} fill={t.wireFill} stroke={t.wireStroke} strokeWidth={2.5} />
        {current >= 0 ? (
          /* Dot = current toward viewer */
          <circle cx={cx} cy={cy} r={4} fill="#f59e0b" />
        ) : (
          /* X = current away from viewer */
          <>
            <line x1={cx - 6} y1={cy - 6} x2={cx + 6} y2={cy + 6} stroke="#ef4444" strokeWidth={2} />
            <line x1={cx + 6} y1={cy - 6} x2={cx - 6} y2={cy + 6} stroke="#ef4444" strokeWidth={2} />
          </>
        )}
        {/* Labels */}
        <text x={cx} y={cy + 30} textAnchor="middle" fontSize={9} fill={t.wireStroke} fontWeight={700}>
          I = {current}A {current >= 0 ? '(→ viewer)' : '(← away)'}
        </text>
        <text x={cx + 104} y={cy} textAnchor="start" fontSize={9} fill={t.sub}>
          B₁ₒₘₘ = {(B_wire_at_1cm * 1e6).toFixed(0)}μT
        </text>
        {/* Right-hand rule label */}
        <text x={14} y={svgH - 10} fontSize={9} fill={t.sub}>
          Right-hand rule: thumb → I, fingers curl → B direction
        </text>
      </g>
    );
  };

  const renderSolenoid = () => {
    const sX = 60, sW = 240, sY1 = 65, sY2 = 135;
    const nLoops = Math.min(turns, 16);
    const loopSpacing = sW / (nLoops + 1);
    const alpha = Math.min(current / 20, 1);

    return (
      <g>
        {/* Internal field lines (parallel, uniform) */}
        {[0.3, 0.5, 0.7].map((frac, i) => {
          const y = sY1 + frac * (sY2 - sY1);
          const opacity = alpha * 0.8 + 0.1;
          return (
            <g key={i}>
              <line x1={sX + 10} y1={y} x2={sX + sW - 10} y2={y}
                stroke="#3b82f6" strokeWidth={2} opacity={opacity} />
              <polygon
                points={`${sX + sW / 2 + 10},${y - 4} ${sX + sW / 2 + 18},${y} ${sX + sW / 2 + 10},${y + 4}`}
                fill="#3b82f6" opacity={opacity} />
            </g>
          );
        })}
        {/* External fringe field arcs */}
        {[1.4, 1.7, 2.0].map((scale, i) => {
          const opacity = alpha * 0.3 / (i + 1);
          const ry = (sY2 - sY1) / 2 * scale;
          return (
            <g key={i}>
              <path d={`M ${sX + sW} ${(sY1 + sY2) / 2} Q ${sX + sW + 30 * scale} ${sY1 - 15 * scale} ${(sX + sX + sW) / 2} ${sY1 - 15 * scale} Q ${sX - 30 * scale} ${sY1 - 15 * scale} ${sX} ${(sY1 + sY2) / 2}`}
                fill="none" stroke="#3b82f6" strokeWidth={1.2} opacity={opacity} strokeDasharray="4,3" />
            </g>
          );
        })}
        {/* Solenoid coil loops */}
        {Array.from({ length: nLoops }, (_, i) => {
          const x = sX + (i + 1) * loopSpacing;
          return (
            <ellipse key={i} cx={x} cy={(sY1 + sY2) / 2} rx={5} ry={(sY2 - sY1) / 2}
              fill="none" stroke={t.wireStroke} strokeWidth={2} />
          );
        })}
        {/* Solenoid body (top/bottom wires) */}
        <line x1={sX} y1={sY1} x2={sX + sW} y2={sY1} stroke={t.wireStroke} strokeWidth={2} />
        <line x1={sX} y1={sY2} x2={sX + sW} y2={sY2} stroke={t.wireStroke} strokeWidth={2} />
        {/* Core fill */}
        {coreType === 'iron' && (
          <rect x={sX + 8} y={sY1 + 8} width={sW - 16} height={sY2 - sY1 - 16} rx={4}
            fill="#6b7280" opacity={0.4} />
        )}
        {/* Pole labels */}
        <text x={sX - 8} y={(sY1 + sY2) / 2 + 5} textAnchor="end" fontSize={11} fill="#ef4444" fontWeight={700}>S</text>
        <text x={sX + sW + 8} y={(sY1 + sY2) / 2 + 5} textAnchor="start" fontSize={11} fill="#3b82f6" fontWeight={700}>N</text>
        <text x={svgW / 2} y={svgH - 8} textAnchor="middle" fontSize={9} fill={t.sub}>
          B = μ₀μᵣnI = {(B_solenoid * 1000).toFixed(2)}mT &nbsp; | &nbsp; Flux = {(Flux * 1e6).toFixed(3)}μWb
        </text>
      </g>
    );
  };

  const renderMotor = () => {
    const magTop = 30, magBot = 170, magH = 40;
    const wireY = (magTop + magH + magBot - magH) / 2;
    const arrowLen = 40;
    const forceDir = (current > 0) ? 1 : -1;
    const forceColor = '#10b981';

    return (
      <g>
        {/* Top magnet (N pole facing down) */}
        <rect x={80} y={magTop} width={200} height={magH} rx={6} fill="#3b82f622" stroke="#3b82f6" strokeWidth={2} />
        <text x={svgW / 2} y={magTop + magH / 2 + 5} textAnchor="middle" fontSize={11} fill="#3b82f6" fontWeight={700}>N</text>
        {/* Bottom magnet (S pole facing up) */}
        <rect x={80} y={magBot - magH} width={200} height={magH} rx={6} fill="#ef444422" stroke="#ef4444" strokeWidth={2} />
        <text x={svgW / 2} y={magBot - magH / 2 + 5} textAnchor="middle" fontSize={11} fill="#ef4444" fontWeight={700}>S</text>
        {/* B field arrows (downward, N→S) */}
        {[120, 170, 220, 260].map(x => (
          <g key={x}>
            <line x1={x} y1={magTop + magH + 4} x2={x} y2={magBot - magH - 4} stroke="#6366f1" strokeWidth={1.5} opacity={0.6} />
            <polygon points={`${x},${magBot - magH - 4} ${x - 4},${magBot - magH - 12} ${x + 4},${magBot - magH - 12}`}
              fill="#6366f1" opacity={0.6} />
          </g>
        ))}
        <text x={270} y={wireY + 4} fontSize={9} fill="#6366f1" opacity={0.8}>B={bField}T</text>
        {/* Wire (horizontal, carrying current) */}
        <rect x={100} y={wireY - 6} width={160} height={12} rx={4} fill={t.wireFill} stroke={t.wireStroke} strokeWidth={2} />
        {/* Current arrows on wire */}
        <polygon points={`${svgW / 2 + 10},${wireY - 3} ${svgW / 2 + 20},${wireY} ${svgW / 2 + 10},${wireY + 3}`}
          fill="#f59e0b" />
        <text x={svgW / 2} y={wireY + 20} textAnchor="middle" fontSize={9} fill="#f59e0b">I={current}A →</text>
        {/* Force arrow (upward or downward depending on F=BIL) */}
        <line x1={svgW / 2} y1={wireY - 10} x2={svgW / 2} y2={wireY - 10 - forceDir * arrowLen}
          stroke={forceColor} strokeWidth={3} />
        <polygon points={`${svgW / 2},${wireY - 10 - forceDir * (arrowLen + 10)} ${svgW / 2 - 6},${wireY - 10 - forceDir * arrowLen} ${svgW / 2 + 6},${wireY - 10 - forceDir * arrowLen}`}
          fill={forceColor} />
        <text x={svgW / 2 + 12} y={wireY - 10 - forceDir * arrowLen / 2} fontSize={10} fill={forceColor} fontWeight={700}>
          F = {Force_motor.toFixed(3)}N
        </text>
        {/* Formula */}
        <text x={svgW / 2} y={svgH - 6} textAnchor="middle" fontSize={9} fill={t.sub}>
          F = BIL = {bField} × {current} × {wireLen} = {Force_motor.toFixed(3)}N &nbsp; (F = q v × B)
        </text>
      </g>
    );
  };

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', background: t.bg, color: t.text, borderRadius: 12, userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#3b82f6' }}>Magnetism Explorer</span>
        {MODES.map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: mode === m ? '#3b82f6' : t.fence,
              background: mode === m ? '#3b82f6' : 'transparent',
              color: mode === m ? 'white' : t.sub }}>
            {m === 'Wire' ? 'Wire Field' : m === 'Solenoid' ? 'Solenoid' : 'Motor Force'}
          </button>
        ))}
      </div>

      {/* SVG */}
      <div style={{ background: t.svgBg, borderRadius: 10, border: `1px solid ${t.border}`, marginBottom: 14, overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ display: 'block', maxHeight: svgH }}>
          {mode === 'Wire' && renderWire()}
          {mode === 'Solenoid' && renderSolenoid()}
          {mode === 'Motor' && renderMotor()}
        </svg>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: t.text }}>
          <span style={{ fontWeight: 700, color: '#f59e0b' }}>Current I: {current}A</span>
          <input type="range" min={-20} max={20} step={0.5} value={current}
            onChange={e => setCurrent(+e.target.value)} style={{ width: '100%', accentColor: '#f59e0b' }} />
        </label>
        {mode === 'Solenoid' && (
          <>
            <label style={{ fontSize: 12, color: t.text }}>
              <span style={{ fontWeight: 700, color: '#3b82f6' }}>Turns N: {turns}</span>
              <input type="range" min={1} max={100} value={turns}
                onChange={e => setTurns(+e.target.value)} style={{ width: '100%', accentColor: '#3b82f6' }} />
            </label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {['air', 'iron'].map(c => (
                <button key={c} onClick={() => setCoreType(c)}
                  style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    border: `1px solid ${coreType === c ? '#10b981' : t.fence}`,
                    background: coreType === c ? '#10b98122' : 'transparent',
                    color: coreType === c ? '#10b981' : t.sub }}>
                  {c === 'air' ? 'Air core' : 'Iron core'}
                </button>
              ))}
            </div>
          </>
        )}
        {mode === 'Motor' && (
          <>
            <label style={{ fontSize: 12, color: t.text }}>
              <span style={{ fontWeight: 700, color: '#6366f1' }}>B field: {bField}T</span>
              <input type="range" min={0.1} max={2} step={0.1} value={bField}
                onChange={e => setBField(+e.target.value)} style={{ width: '100%', accentColor: '#6366f1' }} />
            </label>
            <label style={{ fontSize: 12, color: t.text }}>
              <span style={{ fontWeight: 700, color: '#10b981' }}>Wire length: {wireLen.toFixed(2)}m</span>
              <input type="range" min={0.01} max={1} step={0.01} value={wireLen}
                onChange={e => setWireLen(+e.target.value)} style={{ width: '100%', accentColor: '#10b981' }} />
            </label>
          </>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
        {(mode === 'Wire' ? [
          { label: 'B at 1mm', value: (B_wire_at_1cm * 10 * 1e6).toFixed(0) + 'μT', color: '#3b82f6' },
          { label: 'B at 1cm', value: (B_wire_at_1cm * 1e6).toFixed(0) + 'μT', color: '#6366f1' },
          { label: 'B at 10cm', value: (B_wire_at_1cm / 10 * 1e6).toFixed(1) + 'μT', color: '#a855f7' },
          { label: 'B ∝ I/r', value: 'Ampere\'s Law', color: t.sub },
        ] : mode === 'Solenoid' ? [
          { label: 'n (turns/m)', value: (turns / L_solenoid).toFixed(0) + ' /m', color: '#3b82f6' },
          { label: 'H field', value: H_solenoid.toFixed(0) + ' A/m', color: '#6366f1' },
          { label: 'B field', value: (B_solenoid * 1000).toFixed(2) + ' mT', color: '#a855f7' },
          { label: 'μ_r (core)', value: mur.toString(), color: '#10b981' },
          { label: 'Flux Φ', value: (Flux * 1e6).toFixed(3) + ' μWb', color: '#f59e0b' },
        ] : [
          { label: 'Force F=BIL', value: Force_motor.toFixed(4) + ' N', color: '#10b981' },
          { label: 'B field', value: bField + ' T', color: '#6366f1' },
          { label: 'Current I', value: current + ' A', color: '#f59e0b' },
          { label: 'Wire length', value: wireLen.toFixed(2) + ' m', color: '#3b82f6' },
        ]).map((item, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8,
            padding: '8px 12px', borderLeft: `4px solid ${item.color}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.dim, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: t.sub, background: t.card, borderRadius: 8, padding: '8px 12px', border: `1px solid ${t.border}` }}>
        {mode === 'Wire' && 'Ampere\'s Law: B = μ₀I / (2πr). Field strength falls off with distance. Doubling I doubles B. Doubling distance halves B.'}
        {mode === 'Solenoid' && 'B = μ₀μᵣnI where n = N/L (turns per meter). Iron core multiplies B by μᵣ ≈ 1000 — this is how electromagnets and transformers work.'}
        {mode === 'Motor' && 'Lorentz force F = BIL. Direction: right-hand rule (or F = IL × B). This is the operating principle of every DC motor and linear actuator.'}
      </div>
    </div>
  );
}
