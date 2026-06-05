import { useState, useRef, useEffect } from 'react';

const TWO_PI = Math.PI * 2;

export default function ACWaveformViz() {
  const canvasRef = useRef(null);
  const [freq, setFreq] = useState(50);
  const [amplitude, setAmplitude] = useState(170); // ~120V RMS
  const [phase, setPhase] = useState(0);
  const [showThreePhase, setShowThreePhase] = useState(false);
  const [showRMS, setShowRMS] = useState(true);
  const [showDC, setShowDC] = useState(false);
  const [t, setT] = useState(0);
  const animRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const midY = H / 2;
    const padding = 40;
    const drawW = W - padding * 2;

    ctx.clearRect(0, 0, W, H);

    // Dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let gy = 0; gy <= 4; gy++) {
      const y = padding + (gy / 4) * (H - padding * 2);
      ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(W - padding, y); ctx.stroke();
    }
    for (let gx = 0; gx <= 4; gx++) {
      const x = padding + (gx / 4) * drawW;
      ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, H - padding); ctx.stroke();
    }

    // Zero line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padding, midY); ctx.lineTo(W - padding, midY); ctx.stroke();

    // Amplitude scale
    const scale = (H / 2 - padding) / amplitude;

    // RMS line
    const rms = amplitude / Math.sqrt(2);
    if (showRMS) {
      ctx.strokeStyle = '#f59e0b88';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(padding, midY - rms * scale); ctx.lineTo(W - padding, midY - rms * scale); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padding, midY + rms * scale); ctx.lineTo(W - padding, midY + rms * scale); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px system-ui';
      ctx.fillText(`RMS = ${rms.toFixed(0)}V`, W - padding - 80, midY - rms * scale - 4);
    }

    const cycles = 3;

    // Draw waveforms
    const drawWave = (phaseOffset, color, label) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= drawW; px++) {
        const tval = (px / drawW) * cycles + t;
        const y = midY - amplitude * scale * Math.sin(TWO_PI * tval + phaseOffset);
        if (px === 0) ctx.moveTo(padding + px, y);
        else ctx.lineTo(padding + px, y);
      }
      ctx.stroke();

      // Instantaneous value marker
      const curT = (t % 1) * drawW / cycles;
      const curX = padding + (curT % drawW);
      const curY = midY - amplitude * scale * Math.sin(TWO_PI * t + phaseOffset);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(curX, curY, 5, 0, TWO_PI);
      ctx.fill();
    };

    if (showThreePhase) {
      drawWave(0, '#6366f1', 'L1');
      drawWave((2 * Math.PI) / 3, '#10b981', 'L2');
      drawWave((4 * Math.PI) / 3, '#f59e0b', 'L3');
      // Labels
      ctx.font = 'bold 11px system-ui';
      ctx.fillStyle = '#6366f1'; ctx.fillText('L1', W - padding - 20, padding + 14);
      ctx.fillStyle = '#10b981'; ctx.fillText('L2', W - padding - 20, padding + 26);
      ctx.fillStyle = '#f59e0b'; ctx.fillText('L3', W - padding - 20, padding + 38);
    } else {
      drawWave(0, '#6366f1', 'AC');
      if (showDC) {
        ctx.strokeStyle = '#ef444488';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(padding, midY - rms * scale); ctx.lineTo(W - padding, midY - rms * scale); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px system-ui';
        ctx.fillText(`DC equiv = ${rms.toFixed(0)}V`, W - padding - 100, midY - rms * scale + 14);
      }
    }

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('+' + amplitude + 'V', padding - 20, padding + 10);
    ctx.fillText('0V', padding - 16, midY + 4);
    ctx.fillText('-' + amplitude + 'V', padding - 20, H - padding - 4);
    ctx.textAlign = 'left';
    ctx.fillText(`f = ${freq}Hz  |  T = ${(1000/freq).toFixed(1)}ms  |  Vₚ = ${amplitude}V`, padding, H - 8);
  }, [t, freq, amplitude, phase, showThreePhase, showRMS, showDC]);

  // Animation
  useEffect(() => {
    const speed = freq / 60; // relative to 60fps
    const animate = (ts) => {
      if (lastRef.current !== null) {
        const dt = (ts - lastRef.current) / 1000;
        setT(prev => prev + dt * speed * 0.8);
      }
      lastRef.current = ts;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      lastRef.current = null;
    };
  }, [freq]);

  const rms = (amplitude / Math.sqrt(2)).toFixed(1);

  // Standard voltage presets
  const presets = [
    { label: '12V DC', amp: 17, freq: 50, note: '12V RMS' },
    { label: '24V AC', amp: 34, freq: 50, note: '24V RMS' },
    { label: '120V AC', amp: 170, freq: 60, note: '120V RMS' },
    { label: '240V AC', amp: 339, freq: 50, note: '240V RMS' },
    { label: '480V 3ph', amp: 679, freq: 60, note: '480V line-line' },
  ];

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>AC Waveform Explorer</span>
        <button onClick={() => setShowThreePhase(p => !p)}
          style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '2px solid', borderColor: showThreePhase ? '#6366f1' : '#e2e8f0', background: showThreePhase ? '#6366f1' : 'transparent', color: showThreePhase ? 'white' : '#64748b' }}>
          3-Phase
        </button>
        <button onClick={() => setShowRMS(p => !p)}
          style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '2px solid', borderColor: showRMS ? '#f59e0b' : '#e2e8f0', background: showRMS ? '#fef3c7' : 'transparent', color: showRMS ? '#92400e' : '#64748b' }}>
          RMS line
        </button>
        {!showThreePhase && (
          <button onClick={() => setShowDC(p => !p)}
            style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '2px solid', borderColor: showDC ? '#ef4444' : '#e2e8f0', background: showDC ? '#fef2f2' : 'transparent', color: showDC ? '#991b1b' : '#64748b' }}>
            DC equiv
          </button>
        )}
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width={440} height={200}
        style={{ width: '100%', maxWidth: 440, display: 'block', borderRadius: 10, border: '1px solid #1e293b', marginBottom: 14 }} />

      {/* Presets */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {presets.map((p, i) => (
          <button key={i} onClick={() => { setAmplitude(p.amp); setFreq(p.freq); }}
            style={{ padding: '4px 10px', borderRadius: 14, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#374151' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 14 }}>
        <label style={{ fontSize: 12 }}>
          <span style={{ fontWeight: 700, color: '#6366f1' }}>Frequency: {freq}Hz</span>
          <input type="range" min={1} max={400} value={freq} onChange={e => setFreq(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <label style={{ fontSize: 12 }}>
          <span style={{ fontWeight: 700, color: '#10b981' }}>Peak Voltage: {amplitude}V</span>
          <input type="range" min={5} max={700} value={amplitude} onChange={e => setAmplitude(+e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
        {[
          { label: 'Peak (Vₚ)', value: amplitude + 'V', color: '#6366f1' },
          { label: 'RMS (Vᵣₘₛ)', value: rms + 'V', color: '#f59e0b' },
          { label: 'Peak-to-peak', value: (amplitude * 2) + 'V', color: '#64748b' },
          { label: 'Period', value: (1000/freq).toFixed(1) + 'ms', color: '#10b981' },
          { label: 'Angular freq ω', value: (TWO_PI * freq).toFixed(0) + ' rad/s', color: '#8b5cf6' },
          showThreePhase && { label: 'Phase shift', value: '120° / 240°', color: '#f59e0b' },
        ].filter(Boolean).map((item, i) => (
          <div key={i} style={{ background: '#f8fafc', border: `1px solid #e2e8f0`, borderRadius: 8, padding: '8px 12px', borderLeft: `4px solid ${item.color}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', background: '#f8fafc', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' }}>
        V(t) = Vₚ × sin(2πft)  |  Vᵣₘₛ = Vₚ / √2 = {rms}V  |  A {rms}V AC source delivers same power as {rms}V DC
      </div>
    </div>
  );
}
