// VectorWalkLab.jsx — Home experiment: walk a vector path, predict direct-route distance
// Students enter two walking legs, the lab computes the resultant, they verify at home
import { useState, useMemo } from 'react';

const DIRS = ['N','NE','E','SE','S','SW','W','NW'];
const DIR_DEG = { N:90, NE:45, E:0, SE:-45, S:-90, SW:-135, W:180, NW:135 };
const DIR_LABEL = {
  N:'North', NE:'Northeast', E:'East', SE:'Southeast',
  S:'South', SW:'Southwest', W:'West', NW:'Northwest',
};
const DIR_ARROW = { N:'↑', NE:'↗', E:'→', SE:'↘', S:'↓', SW:'↙', W:'←', NW:'↖' };

function dirToVec(steps, dir) {
  const a = DIR_DEG[dir] * Math.PI / 180;
  return { x: parseFloat((steps * Math.cos(a)).toFixed(4)), y: parseFloat((steps * Math.sin(a)).toFixed(4)) };
}

function arrowPath(x1, y1, x2, y2, headSize = 8) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  if (len < 2) return '';
  const ux = dx/len, uy = dy/len;
  const ex = x2 - ux*headSize, ey = y2 - uy*headSize;
  const nx = -uy, ny = ux;
  return `M${x1},${y1} L${ex},${ey} M${ex+nx*headSize*0.4},${ey+ny*headSize*0.4} L${x2},${y2} L${ex-nx*headSize*0.4},${ey-ny*headSize*0.4}`;
}

function accuracy(predicted, actual) {
  if (!actual || actual <= 0) return null;
  const pct = Math.abs(predicted - actual) / predicted * 100;
  if (pct < 5) return { label: 'Excellent! < 5% error 🏆', color: '#34d399' };
  if (pct < 10) return { label: `Good — ${pct.toFixed(1)}% error ✓`, color: '#fbbf24' };
  if (pct < 20) return { label: `OK — ${pct.toFixed(1)}% error (check your steps)`, color: '#f97316' };
  return { label: `${pct.toFixed(1)}% error — did you walk in a straight line?`, color: '#f87171' };
}

export default function VectorWalkLab({ params = {} }) {
  const [leg1Steps, setLeg1Steps] = useState(params.leg1Steps ?? 4);
  const [leg1Dir,   setLeg1Dir]   = useState(params.leg1Dir   ?? 'E');
  const [leg2Steps, setLeg2Steps] = useState(params.leg2Steps ?? 3);
  const [leg2Dir,   setLeg2Dir]   = useState(params.leg2Dir   ?? 'N');
  const [actual,    setActual]    = useState('');
  const [phase,     setPhase]     = useState('setup'); // setup | predict | verify

  const v1 = useMemo(() => dirToVec(leg1Steps, leg1Dir), [leg1Steps, leg1Dir]);
  const v2 = useMemo(() => dirToVec(leg2Steps, leg2Dir), [leg2Steps, leg2Dir]);
  const Rx = v1.x + v2.x;
  const Ry = v1.y + v2.y;
  const dist = Math.sqrt(Rx*Rx + Ry*Ry);

  // Compass bearing of resultant (degrees from north, clockwise)
  const headingRad = Math.atan2(Ry, Rx);
  const compassBearing = ((90 - headingRad * 180/Math.PI) + 360) % 360;
  const returnBearing  = (compassBearing + 180) % 360;

  // SVG map
  const W = 320, H = 260;
  const maxReach = Math.max(Math.abs(v1.x)+Math.abs(v2.x), Math.abs(v1.y)+Math.abs(v2.y), 2) + 1.5;
  const scale = Math.min(W, H) / (2 * maxReach);

  // Start point: offset so path stays centred
  const midX = (0 + (Rx)) / 2, midY = (0 + Ry) / 2;
  const cx = W/2 - midX * scale;
  const cy = H/2 + midY * scale;

  const p0 = { x: cx,                     y: cy                     };
  const p1 = { x: cx + v1.x*scale,        y: cy - v1.y*scale        };
  const p2 = { x: cx + (v1.x+v2.x)*scale, y: cy - (v1.y+v2.y)*scale };

  const accu = accuracy(dist, parseFloat(actual));

  const cs = {
    bg:    '#0f172a', card:  '#1e293b', border: '#334155',
    text:  '#e2e8f0', muted: '#94a3b8', accent: '#38bdf8',
    leg1:  '#6366f1', leg2:  '#f59e0b', result: '#34d399',
    step:  '#10b981',
  };

  const inputStyle = {
    background: cs.card, border: `1px solid ${cs.border}`, color: cs.text,
    borderRadius: 6, padding: '4px 8px', fontSize: 13, width: 60, textAlign: 'center',
  };
  const selectStyle = { ...inputStyle, width: 70, cursor: 'pointer' };
  const btnStyle = (active) => ({
    background: active ? cs.step : cs.card,
    border: `1px solid ${active ? cs.step : cs.border}`,
    color: active ? '#fff' : cs.text, borderRadius: 8,
    padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: cs.bg, borderRadius: 16, overflow: 'hidden', color: cs.text }}>

      {/* Header */}
      <div style={{ padding: '14px 20px 10px', borderBottom: `1px solid ${cs.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: cs.step, fontWeight: 700, letterSpacing: '0.08em' }}>🏠 HOME LAB · VECTORS</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>The Vector Walk Experiment</div>
        </div>
        <div style={{ fontSize: 11, color: cs.muted, textAlign: 'right' }}>
          Needs: any open floor<br/>+ your feet
        </div>
      </div>

      {/* Phase tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 20px', borderBottom: `1px solid ${cs.border}` }}>
        {[['setup','① Set Up'],['predict','② Predict'],['verify','③ Verify']].map(([p, label]) => (
          <button key={p} onClick={() => setPhase(p)} style={btnStyle(phase === p)}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>

        {phase === 'setup' && (
          <div>
            <div style={{ fontSize: 14, color: cs.muted, marginBottom: 14 }}>
              Design your walk. You'll walk Leg 1, then Leg 2. The app will predict exactly where you end up.
            </div>

            {/* Leg 1 */}
            <div style={{ background: cs.card, borderRadius: 10, padding: '12px 16px', marginBottom: 10, borderLeft: `3px solid ${cs.leg1}` }}>
              <div style={{ fontSize: 12, color: cs.leg1, fontWeight: 700, marginBottom: 8 }}>LEG 1 — First walk</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="number" min={1} max={20} value={leg1Steps}
                  onChange={e => setLeg1Steps(Math.max(1, parseInt(e.target.value)||1))}
                  style={inputStyle} />
                <span style={{ color: cs.muted, fontSize: 13 }}>steps</span>
                <select value={leg1Dir} onChange={e => setLeg1Dir(e.target.value)} style={selectStyle}>
                  {DIRS.map(d => <option key={d} value={d}>{DIR_ARROW[d]} {d}</option>)}
                </select>
                <span style={{ color: cs.muted, fontSize: 13 }}>{DIR_LABEL[leg1Dir]}</span>
              </div>
            </div>

            {/* Leg 2 */}
            <div style={{ background: cs.card, borderRadius: 10, padding: '12px 16px', marginBottom: 16, borderLeft: `3px solid ${cs.leg2}` }}>
              <div style={{ fontSize: 12, color: cs.leg2, fontWeight: 700, marginBottom: 8 }}>LEG 2 — Second walk</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="number" min={1} max={20} value={leg2Steps}
                  onChange={e => setLeg2Steps(Math.max(1, parseInt(e.target.value)||1))}
                  style={inputStyle} />
                <span style={{ color: cs.muted, fontSize: 13 }}>steps</span>
                <select value={leg2Dir} onChange={e => setLeg2Dir(e.target.value)} style={selectStyle}>
                  {DIRS.map(d => <option key={d} value={d}>{DIR_ARROW[d]} {d}</option>)}
                </select>
                <span style={{ color: cs.muted, fontSize: 13 }}>{DIR_LABEL[leg2Dir]}</span>
              </div>
            </div>

            {/* Map */}
            <svg width={W} height={H} style={{ display: 'block', margin: '0 auto', background: '#020817', borderRadius: 10, border: `1px solid ${cs.border}` }}>
              {/* Grid */}
              {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(i => (
                <g key={i}>
                  <line x1={cx+i*scale} y1={0} x2={cx+i*scale} y2={H} stroke="#1e293b" strokeWidth={1} />
                  <line x1={0} y1={cy-i*scale} x2={W} y2={cy-i*scale} stroke="#1e293b" strokeWidth={1} />
                </g>
              ))}
              {/* Axes */}
              <line x1={cx} y1={0} x2={cx} y2={H} stroke="#334155" strokeWidth={1.5} />
              <line x1={0} y1={cy} x2={W} y2={cy} stroke="#334155" strokeWidth={1.5} />
              {/* Compass labels */}
              <text x={cx+6} y={14} fill="#475569" fontSize={9}>N↑</text>
              <text x={W-18} y={cy-4} fill="#475569" fontSize={9}>E→</text>

              {/* Start dot */}
              <circle cx={p0.x} cy={p0.y} r={6} fill={cs.accent} />
              <text x={p0.x+8} y={p0.y-8} fill={cs.accent} fontSize={11} fontWeight={700}>START</text>

              {/* Leg 1 */}
              {leg1Steps > 0 && (
                <>
                  <path d={arrowPath(p0.x, p0.y, p1.x, p1.y, 10)}
                    stroke={cs.leg1} strokeWidth={3} strokeLinecap="round" fill="none" />
                  <text x={(p0.x+p1.x)/2+6} y={(p0.y+p1.y)/2-6}
                    fill={cs.leg1} fontSize={11} fontWeight={700}>{leg1Steps} steps {DIR_ARROW[leg1Dir]}</text>
                </>
              )}

              {/* Leg 2 */}
              {leg2Steps > 0 && (
                <>
                  <path d={arrowPath(p1.x, p1.y, p2.x, p2.y, 10)}
                    stroke={cs.leg2} strokeWidth={3} strokeLinecap="round" fill="none" />
                  <text x={(p1.x+p2.x)/2+6} y={(p1.y+p2.y)/2-6}
                    fill={cs.leg2} fontSize={11} fontWeight={700}>{leg2Steps} steps {DIR_ARROW[leg2Dir]}</text>
                </>
              )}

              {/* Resultant (dashed) */}
              <path d={arrowPath(p0.x, p0.y, p2.x, p2.y, 12)}
                stroke={cs.result} strokeWidth={2.5} strokeDasharray="6,3" strokeLinecap="round" fill="none" />
              <text x={(p0.x+p2.x)/2-20} y={(p0.y+p2.y)/2-10}
                fill={cs.result} fontSize={11} fontWeight={700}>{dist.toFixed(1)} steps</text>

              {/* End dot */}
              <circle cx={p2.x} cy={p2.y} r={5} fill={cs.leg2} />
              <text x={p2.x+8} y={p2.y+14} fill={cs.leg2} fontSize={11} fontWeight={700}>END</text>
            </svg>

            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button onClick={() => setPhase('predict')} style={{ ...btnStyle(true), padding: '10px 28px', fontSize: 14 }}>
                See Prediction →
              </button>
            </div>
          </div>
        )}

        {phase === 'predict' && (
          <div>
            {/* Prediction box */}
            <div style={{ background: '#0d2a1e', border: `2px solid ${cs.result}`, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: cs.result, fontWeight: 700, marginBottom: 10 }}>📐 VECTOR MATH SAYS:</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: cs.muted }}>Leg 1 vector</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>({v1.x.toFixed(2)}, {v1.y.toFixed(2)}) steps</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: cs.muted }}>Leg 2 vector</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>({v2.x.toFixed(2)}, {v2.y.toFixed(2)}) steps</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: cs.muted }}>Sum (East, North)</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: cs.result }}>
                    ({Rx.toFixed(2)}, {Ry.toFixed(2)}) steps
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 14, padding: '12px 16px', background: '#0a1a12', borderRadius: 8 }}>
                <div style={{ fontSize: 13, color: cs.muted, marginBottom: 4 }}>
                  Magnitude = √({Rx.toFixed(2)}² + {Ry.toFixed(2)}²) = √{(Rx*Rx+Ry*Ry).toFixed(2)}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: cs.result }}>
                  = {dist.toFixed(2)} steps straight-line
                </div>
                <div style={{ fontSize: 13, color: cs.muted, marginTop: 6 }}>
                  Direction: {compassBearing.toFixed(1)}° from North
                  &nbsp;· Return heading: {returnBearing.toFixed(1)}°
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ background: cs.card, borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: cs.accent, marginBottom: 10 }}>🏃 DO THE EXPERIMENT:</div>
              <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, fontSize: 13, color: cs.muted }}>
                <li>Find a clear area (hallway, yard, room)</li>
                <li>Mark your start with tape or a shoe</li>
                <li>Walk <strong style={{ color: cs.leg1 }}>{leg1Steps} steps {DIR_LABEL[leg1Dir]}</strong></li>
                <li>Without moving, turn and walk <strong style={{ color: cs.leg2 }}>{leg2Steps} steps {DIR_LABEL[leg2Dir]}</strong></li>
                <li>Now walk the <strong style={{ color: cs.result }}>most direct path back</strong> to your start</li>
                <li>Count those return steps carefully</li>
              </ol>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setPhase('verify')} style={{ ...btnStyle(true), padding: '10px 28px', fontSize: 14 }}>
                Enter My Result →
              </button>
            </div>
          </div>
        )}

        {phase === 'verify' && (
          <div>
            <div style={{ background: cs.card, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: cs.muted, marginBottom: 10 }}>
                Our prediction: <strong style={{ color: cs.result }}>{dist.toFixed(2)} steps</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13 }}>I counted:</span>
                <input
                  type="number" min={0} step={0.5} value={actual}
                  onChange={e => setActual(e.target.value)}
                  placeholder="steps"
                  style={{ ...inputStyle, width: 80, fontSize: 15 }}
                />
                <span style={{ fontSize: 13, color: cs.muted }}>steps</span>
              </div>
            </div>

            {accu && (
              <div style={{ padding: '12px 16px', background: '#0d1f2a', border: `1px solid ${accu.color}`, borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: accu.color }}>{accu.label}</div>
                <div style={{ fontSize: 13, color: cs.muted, marginTop: 6 }}>
                  Predicted: {dist.toFixed(2)} · Measured: {parseFloat(actual).toFixed(1)} ·
                  Error: {Math.abs(dist - parseFloat(actual)).toFixed(2)} steps
                </div>
              </div>
            )}

            <div style={{ background: '#0f1f3a', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: cs.accent, fontWeight: 700, marginBottom: 8 }}>🔬 WHY IT WORKS</div>
              <div style={{ fontSize: 13, color: cs.muted, lineHeight: 1.7 }}>
                You just used the <strong style={{ color: cs.text }}>Pythagorean theorem on a real vector</strong>.
                Your legs were displacement vectors. Adding them component-by-component gives the
                resultant vector. Its magnitude — √(East²+North²) — is exactly the straight-line
                distance. No matter how far you walked or what directions you chose, the formula always works.
                This is the entire foundation of navigation, GPS, and force analysis.
              </div>
            </div>

            <div style={{ background: cs.card, borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: cs.muted, fontWeight: 700, marginBottom: 6 }}>💡 TRY NEXT:</div>
              <div style={{ fontSize: 13, color: cs.muted, lineHeight: 1.6 }}>
                • Change Leg 2 to the <em>opposite</em> direction of Leg 1 — prediction: {(Math.abs(leg1Steps - leg2Steps)).toFixed(1)} steps<br />
                • Make both legs equal and at 90° — prediction: {(leg1Steps * Math.sqrt(2)).toFixed(1)} steps (it's always √2 × each leg)<br />
                • Try 3 legs: add a Leg 3 by doing this experiment twice, using your first result as the new Leg 1
              </div>
            </div>

            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button onClick={() => { setPhase('setup'); setActual(''); }} style={{ ...btnStyle(false), padding: '8px 20px' }}>
                ← Try Different Values
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
