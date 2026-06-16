// FreeFallTimerLab.jsx — Home experiment: drop an object, time the fall, measure g
// Students measure height, predict fall time with t=√(2h/g), verify with phone stopwatch
import { useState, useMemo } from 'react';

const G_STANDARD = 9.807;

function predictFallTime(h) {
  return Math.sqrt(2 * h / G_STANDARD);
}

function computeG(h, t) {
  return 2 * h / (t * t);
}

function scoreAccuracy(measured, predicted) {
  if (!measured || measured <= 0) return null;
  const pct = Math.abs(measured - predicted) / predicted * 100;
  if (pct < 5)  return { label: 'Excellent — within 5%! 🏆', color: '#34d399', grade: 'A' };
  if (pct < 10) return { label: `Good — ${pct.toFixed(1)}% off ✓`, color: '#fbbf24', grade: 'B' };
  if (pct < 20) return { label: `OK — ${pct.toFixed(1)}% off (reaction time?)`, color: '#f97316', grade: 'C' };
  return { label: `${pct.toFixed(1)}% off — check your height measurement`, color: '#f87171', grade: 'D' };
}

const OBJECTS = [
  { label: 'Book', emoji: '📗', tip: 'Flat books fall cleanly — minimal air resistance' },
  { label: 'Tennis ball', emoji: '🎾', tip: 'A bit of drag but close enough' },
  { label: 'Coin', emoji: '🪙', tip: 'Dense, fast, almost perfect free fall' },
  { label: 'Paper (flat)', emoji: '📄', tip: 'Terrible! Air drag dominates — use crumpled paper instead' },
  { label: 'Water bottle', emoji: '🍶', tip: 'Heavy, consistent — great for this experiment' },
];

const HEIGHT_PRESETS = [
  { label: 'Desk height', m: 0.75 },
  { label: 'Chair height', m: 0.46 },
  { label: 'Standing reach', m: 1.8 },
  { label: 'Table height', m: 0.75 },
  { label: 'Doorknob height', m: 1.0 },
];

export default function FreeFallTimerLab({ params = {} }) {
  const [heightCm, setHeightCm] = useState(params.heightCm ?? 100);
  const [measuredTime, setMeasuredTime] = useState('');
  const [object, setObject] = useState(0);
  const [trials, setTrials] = useState([]);
  const [trialTime, setTrialTime] = useState('');
  const [phase, setPhase] = useState('setup');

  const h = heightCm / 100; // meters
  const tPredicted = useMemo(() => predictFallTime(h), [h]);

  const avgTime = trials.length > 0 ? trials.reduce((s, t) => s + t, 0) / trials.length : null;
  const gMeasured = avgTime ? computeG(h, avgTime) : null;
  const score = avgTime ? scoreAccuracy(avgTime, tPredicted) : null;

  const addTrial = () => {
    const t = parseFloat(trialTime);
    if (!isNaN(t) && t > 0 && t < 5) {
      setTrials(prev => [...prev.slice(-4), t]);
      setTrialTime('');
    }
  };

  const cs = {
    bg: '#0f172a', card: '#1e293b', border: '#334155',
    text: '#e2e8f0', muted: '#94a3b8', accent: '#38bdf8',
    step: '#10b981', warn: '#f97316',
  };

  const inputStyle = {
    background: cs.card, border: `1px solid ${cs.border}`, color: cs.text,
    borderRadius: 6, padding: '6px 10px', fontSize: 14, width: 80, textAlign: 'center',
  };
  const btnStyle = (active, color) => ({
    background: active ? (color || cs.step) : cs.card,
    border: `1px solid ${active ? (color || cs.step) : cs.border}`,
    color: active ? '#fff' : cs.text,
    borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  });

  // Animated trajectory visualization
  const SVG_W = 220, SVG_H = 200;
  const dropFrac = Math.min(h / 2.5, 1); // fraction of SVG height
  const groundY = SVG_H - 20;
  const ballStartY = groundY - dropFrac * (SVG_H - 40);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: cs.bg, borderRadius: 16, overflow: 'hidden', color: cs.text }}>

      {/* Header */}
      <div style={{ padding: '14px 20px 10px', borderBottom: `1px solid ${cs.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: cs.step, fontWeight: 700, letterSpacing: '0.08em' }}>🏠 HOME LAB · FREE FALL</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>Measure g Yourself</div>
        </div>
        <div style={{ fontSize: 11, color: cs.muted, textAlign: 'right' }}>
          Needs: ruler + phone<br/>+ any object
        </div>
      </div>

      {/* Phase tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 20px', borderBottom: `1px solid ${cs.border}` }}>
        {[['setup','① Set Up'],['predict','② Predict'],['measure','③ Measure'],['results','④ Results']].map(([p, label]) => (
          <button key={p} onClick={() => setPhase(p)}
            style={{ ...btnStyle(phase === p), padding: '6px 12px', fontSize: 12 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>

        {phase === 'setup' && (
          <div>
            <div style={{ fontSize: 14, color: cs.muted, marginBottom: 14, lineHeight: 1.6 }}>
              You'll drop an object from a known height and time the fall.
              Your phone stopwatch + a ruler is all you need. We'll predict the fall time
              with physics — then you check if we're right.
            </div>

            {/* Height input */}
            <div style={{ background: cs.card, borderRadius: 10, padding: '14px 16px', marginBottom: 12, borderLeft: `3px solid ${cs.accent}` }}>
              <div style={{ fontSize: 12, color: cs.accent, fontWeight: 700, marginBottom: 10 }}>STEP 1 — Measure the drop height</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <input type="number" min={20} max={300} value={heightCm}
                  onChange={e => setHeightCm(Math.max(20, Math.min(300, parseInt(e.target.value)||100)))}
                  style={inputStyle} />
                <span style={{ color: cs.muted }}>cm</span>
                <span style={{ color: cs.muted, fontSize: 13 }}>= {h.toFixed(2)} m</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {HEIGHT_PRESETS.map(p => (
                  <button key={p.label} onClick={() => setHeightCm(Math.round(p.m * 100))}
                    style={{ ...btnStyle(heightCm === Math.round(p.m*100)), padding: '4px 10px', fontSize: 11 }}>
                    {p.label} ({Math.round(p.m*100)} cm)
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: cs.muted, marginTop: 10 }}>
                💡 Measure from the bottom of the object to the floor. Consistency matters more than precision.
              </div>
            </div>

            {/* Object picker */}
            <div style={{ background: cs.card, borderRadius: 10, padding: '14px 16px', marginBottom: 16, borderLeft: `3px solid ${cs.step}` }}>
              <div style={{ fontSize: 12, color: cs.step, fontWeight: 700, marginBottom: 10 }}>STEP 2 — Choose your object</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {OBJECTS.map((o, i) => (
                  <button key={i} onClick={() => setObject(i)}
                    style={{ ...btnStyle(object === i), padding: '6px 12px', fontSize: 12 }}>
                    {o.emoji} {o.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: object === 3 ? cs.warn : cs.step }}>
                {OBJECTS[object].emoji} {OBJECTS[object].tip}
              </div>
            </div>

            {/* Diagram */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <svg width={SVG_W} height={SVG_H} style={{ background: '#020817', borderRadius: 10, border: `1px solid ${cs.border}`, flexShrink: 0 }}>
                {/* Wall */}
                <rect x={SVG_W/2-2} y={ballStartY-10} width={4} height={groundY - ballStartY + 10} fill="#334155" />
                {/* Height arrow */}
                <line x1={SVG_W/2+20} y1={ballStartY} x2={SVG_W/2+20} y2={groundY} stroke={cs.accent} strokeWidth={1.5} strokeDasharray="3,2" />
                <text x={SVG_W/2+26} y={(ballStartY+groundY)/2+4} fill={cs.accent} fontSize={11} fontWeight={700}>{heightCm} cm</text>
                {/* Ground */}
                <line x1={0} y1={groundY} x2={SVG_W} y2={groundY} stroke="#475569" strokeWidth={2} />
                <text x={SVG_W/2-20} y={groundY+16} fill="#475569" fontSize={10}>FLOOR</text>
                {/* Ball at top */}
                <circle cx={SVG_W/2} cy={ballStartY} r={12} fill="#6366f1" />
                <text x={SVG_W/2-6} y={ballStartY+5} fill="#fff" fontSize={13}>{OBJECTS[object].emoji}</text>
                {/* Drop arrow */}
                <line x1={SVG_W/2-20} y1={ballStartY+20} x2={SVG_W/2-20} y2={groundY-10}
                  stroke={cs.step} strokeWidth={2} markerEnd="url(#darr)" />
                <defs>
                  <marker id="darr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M2 2L8 5L2 8" stroke={cs.step} strokeWidth={1.5} fill="none" strokeLinecap="round" />
                  </marker>
                </defs>
                <text x={SVG_W/2-44} y={(ballStartY+groundY)/2+4} fill={cs.step} fontSize={10}>g = 9.8</text>
              </svg>

              <div style={{ fontSize: 13, color: cs.muted, lineHeight: 1.8 }}>
                <strong style={{ color: cs.text }}>Physics says:</strong><br />
                At every instant the ball<br />speeds up by 9.8 m/s.<br /><br />
                The fall time depends only<br />on the height — not on the<br />
                mass of the object.<br /><br />
                <span style={{ color: cs.accent, fontWeight: 700 }}>
                  A coin and a watermelon<br />fall at the same rate!
                </span>
              </div>
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button onClick={() => setPhase('predict')} style={{ ...btnStyle(true), padding: '10px 28px', fontSize: 14 }}>
                Calculate Prediction →
              </button>
            </div>
          </div>
        )}

        {phase === 'predict' && (
          <div>
            {/* Math derivation */}
            <div style={{ background: '#0d2a1e', border: `2px solid ${cs.step}`, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: cs.step, fontWeight: 700, marginBottom: 12 }}>📐 THE PREDICTION:</div>

              <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 2, color: cs.muted }}>
                <div>Starting from rest: x(t) = ½ · g · t²</div>
                <div>Set x(t) = h = {h.toFixed(2)} m:</div>
                <div style={{ color: cs.text }}>&nbsp;&nbsp;{h.toFixed(2)} = ½ × 9.807 × t²</div>
                <div style={{ color: cs.text }}>&nbsp;&nbsp;t² = {(2*h/G_STANDARD).toFixed(4)}</div>
              </div>

              <div style={{ marginTop: 12, padding: '12px 16px', background: '#0a1a12', borderRadius: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: cs.step }}>
                  t = {tPredicted.toFixed(3)} seconds
                </div>
                <div style={{ fontSize: 13, color: cs.muted, marginTop: 4 }}>
                  Drop height: {heightCm} cm = {h.toFixed(2)} m
                </div>
              </div>
            </div>

            {/* Comparison for intuition */}
            <div style={{ background: cs.card, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: cs.muted, fontWeight: 700, marginBottom: 10 }}>⚡ FEEL THE SCALE:</div>
              <div style={{ fontSize: 13, color: cs.muted, lineHeight: 1.9 }}>
                Your predicted time: <strong style={{ color: cs.step }}>{tPredicted.toFixed(3)} s</strong><br />
                A blink of an eye: ~0.15 s (yours is {tPredicted < 0.15 ? 'less' : 'more'} than that)<br />
                A typical reaction time: 0.20–0.25 s (your timer WILL add some)<br />
                <strong style={{ color: cs.warn }}>Tip: Have a friend drop it while you time. Reduces reaction error by half.</strong>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ background: cs.card, borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: cs.accent, fontWeight: 700, marginBottom: 8 }}>🏃 WHAT TO DO:</div>
              <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2.2, fontSize: 13, color: cs.muted }}>
                <li>Open your phone stopwatch</li>
                <li>Hold the {OBJECTS[object].emoji} at exactly <strong style={{ color: cs.text }}>{heightCm} cm</strong> above the floor</li>
                <li>Press START and release simultaneously (or have a friend time)</li>
                <li>Press STOP the instant it hits the floor</li>
                <li>Record the time — do <strong style={{ color: cs.text }}>at least 3 trials</strong></li>
              </ol>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setPhase('measure')} style={{ ...btnStyle(true), padding: '10px 28px', fontSize: 14 }}>
                I'm Ready to Record →
              </button>
            </div>
          </div>
        )}

        {phase === 'measure' && (
          <div>
            <div style={{ background: cs.card, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: cs.accent, fontWeight: 700, marginBottom: 4 }}>
                Predicted: <span style={{ color: cs.step }}>{tPredicted.toFixed(3)} s</span>
                &nbsp;· Drop: {heightCm} cm
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <input type="number" min={0.05} max={5} step={0.001} value={trialTime}
                  onChange={e => setTrialTime(e.target.value)}
                  placeholder="0.000"
                  style={{ ...inputStyle, width: 90, fontSize: 16 }}
                  onKeyDown={e => e.key === 'Enter' && addTrial()}
                />
                <span style={{ color: cs.muted }}>seconds</span>
                <button onClick={addTrial} style={{ ...btnStyle(true), padding: '6px 16px', fontSize: 13 }}>
                  + Add Trial
                </button>
              </div>
            </div>

            {/* Trials list */}
            {trials.length > 0 && (
              <div style={{ background: cs.card, borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: cs.muted, fontWeight: 700, marginBottom: 8 }}>
                  YOUR TRIALS ({trials.length}/5 recommended):
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {trials.map((t, i) => {
                    const diff = t - tPredicted;
                    return (
                      <div key={i} style={{ background: '#020817', borderRadius: 6, padding: '6px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{t.toFixed(3)} s</div>
                        <div style={{ fontSize: 10, color: diff > 0 ? cs.warn : cs.step }}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(3)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {avgTime && (
                  <div style={{ fontSize: 13, color: cs.muted }}>
                    Average: <strong style={{ color: cs.text }}>{avgTime.toFixed(3)} s</strong>
                    &nbsp;(predicted: {tPredicted.toFixed(3)} s)
                  </div>
                )}
              </div>
            )}

            {trials.length >= 1 && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button onClick={() => setPhase('results')} style={{ ...btnStyle(true), padding: '10px 28px', fontSize: 14 }}>
                  See My Results →
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'results' && avgTime && (
          <div>
            {/* Score */}
            {score && (
              <div style={{ background: '#0d1f2a', border: `2px solid ${score.color}`, borderRadius: 12, padding: '16px 20px', marginBottom: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: score.color }}>{score.label}</div>
                <div style={{ fontSize: 14, color: cs.muted, marginTop: 6 }}>
                  You measured: {avgTime.toFixed(3)} s · Predicted: {tPredicted.toFixed(3)} s
                </div>
              </div>
            )}

            {/* Compute g */}
            <div style={{ background: '#1a1205', border: `1px solid #d97706`, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700, marginBottom: 8 }}>🔬 YOUR MEASURED g:</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: cs.muted, lineHeight: 2 }}>
                <div>g = 2h / t² = 2 × {h.toFixed(2)} / {avgTime.toFixed(3)}²</div>
                <div>g = {(2*h).toFixed(3)} / {(avgTime*avgTime).toFixed(4)}</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24', marginTop: 8 }}>
                g = {gMeasured?.toFixed(2)} m/s²
              </div>
              <div style={{ fontSize: 13, color: cs.muted, marginTop: 4 }}>
                Standard value: 9.807 m/s² · Your error: {Math.abs((gMeasured - G_STANDARD)/G_STANDARD * 100).toFixed(1)}%
              </div>
            </div>

            {/* Why the error */}
            <div style={{ background: cs.card, borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: cs.accent, fontWeight: 700, marginBottom: 8 }}>WHY ISN'T IT PERFECT?</div>
              <div style={{ fontSize: 13, color: cs.muted, lineHeight: 1.8 }}>
                <div>🕐 <strong style={{ color: cs.text }}>Reaction time</strong>: adds ~0.15–0.25 s to your reading</div>
                <div>🌬️ <strong style={{ color: cs.text }}>Air resistance</strong>: slows light/flat objects</div>
                <div>📏 <strong style={{ color: cs.text }}>Height measurement</strong>: ±1 cm changes t by ±{(Math.abs(predictFallTime(h+0.01) - predictFallTime(h))*1000).toFixed(1)} ms</div>
                <div>🏔️ <strong style={{ color: cs.text }}>Your altitude</strong>: g varies from 9.76 (equator) to 9.83 (poles)</div>
                <div style={{ marginTop: 8, color: cs.step, fontWeight: 700 }}>
                  Reduce reaction time: have a partner hold the object while you hold the phone.
                </div>
              </div>
            </div>

            {/* What to try next */}
            <div style={{ background: cs.card, borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: cs.muted, fontWeight: 700, marginBottom: 6 }}>💡 INVESTIGATE FURTHER:</div>
              <div style={{ fontSize: 13, color: cs.muted, lineHeight: 1.8 }}>
                • Drop from {Math.round(heightCm * 2)} cm — predicted time: <strong style={{ color: cs.text }}>{predictFallTime(h*2).toFixed(3)} s</strong> (4× height → √4 = 2× time?)<br />
                • Drop a coin AND a book at the same time from the same height — do they land together?<br />
                • Drop a crumpled paper ball vs a flat sheet — what does the difference tell you about air drag?
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => { setTrials([]); setPhase('measure'); }} style={{ ...btnStyle(false), padding: '8px 16px', fontSize: 12 }}>
                ← More Trials
              </button>
              <button onClick={() => { setTrials([]); setMeasuredTime(''); setPhase('setup'); }} style={{ ...btnStyle(false), padding: '8px 16px', fontSize: 12 }}>
                Try New Height
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
