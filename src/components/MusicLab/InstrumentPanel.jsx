import styles from "./MusicLab.module.css";

// ─── InstrumentPanel ──────────────────────────────────────────────────────────

export default function InstrumentPanel({ track, onChange, onSampleLoad, onOpenPianoRoll }) {
  const p = track.instrument;
  const set = (key, val) => onChange({ [key]: val });
  const hasPianoRoll = ["synth", "bass", "sampler"].includes(track.type);

  return (
    <div className={styles.instrumentPanel}>
      <div className={styles.instrHeader}>
        <span className={styles.instrTitle} style={{ color: track.color }}>
          {track.name} · <em>{track.type}</em>
        </span>
        {hasPianoRoll && (
          <button className={styles.pianoRollBtn} onClick={onOpenPianoRoll}>
            🎹 Piano Roll
          </button>
        )}
      </div>

      {/* KICK */}
      {track.type === "kick" && (
        <div className={styles.instrGrid}>
          <Knob label="Pitch" value={p.pitchDecay ?? 0.05} min={0.01} max={0.5} step={0.01}
            onChange={v => set("pitchDecay", v)} />
          <Knob label="Decay" value={p.decay ?? 0.3} min={0.05} max={2} step={0.01}
            onChange={v => set("decay", v)} />
          <Knob label="Octaves" value={p.octaves ?? 6} min={1} max={10} step={0.5}
            onChange={v => set("octaves", v)} />
          <PitchSelect label="Root" value={p.pitch ?? "C1"} onChange={v => set("pitch", v)} />
        </div>
      )}

      {/* SNARE */}
      {track.type === "snare" && (
        <div className={styles.instrGrid}>
          <Knob label="Decay" value={p.decay ?? 0.15} min={0.01} max={1} step={0.01}
            onChange={v => set("decay", v)} />
          <div className={styles.instrField}>
            <label className={styles.instrLabel}>Noise</label>
            <select className={styles.instrSelect} value={p.noiseType ?? "white"}
              onChange={e => set("noiseType", e.target.value)}>
              {["white", "pink", "brown"].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* HI-HAT */}
      {track.type === "hihat" && (
        <div className={styles.instrGrid}>
          <Knob label="Decay" value={p.decay ?? 0.08} min={0.01} max={0.5} step={0.005}
            onChange={v => set("decay", v)} />
          <Knob label="Freq" value={p.frequency ?? 400} min={100} max={2000} step={10}
            onChange={v => set("frequency", v)} />
          <Knob label="Harmonics" value={p.harmonicity ?? 5.1} min={1} max={20} step={0.1}
            onChange={v => set("harmonicity", v)} />
          <Knob label="Resonance" value={p.resonance ?? 4000} min={500} max={8000} step={100}
            onChange={v => set("resonance", v)} />
        </div>
      )}

      {/* SYNTH */}
      {track.type === "synth" && (
        <div className={styles.instrGrid}>
          <WaveformPicker value={p.waveform ?? "sawtooth"} onChange={v => set("waveform", v)} />
          <PitchSelect label="Pitch" value={p.pitch ?? "C4"} onChange={v => set("pitch", v)} />
          <Knob label="Attack" value={p.attack ?? 0.02} min={0.001} max={2} step={0.001}
            onChange={v => set("attack", v)} />
          <Knob label="Decay" value={p.decay ?? 0.1} min={0.001} max={2} step={0.001}
            onChange={v => set("decay", v)} />
          <Knob label="Sustain" value={p.sustain ?? 0.5} min={0} max={1} step={0.01}
            onChange={v => set("sustain", v)} />
          <Knob label="Release" value={p.release ?? 0.5} min={0.001} max={4} step={0.01}
            onChange={v => set("release", v)} />
        </div>
      )}

      {/* BASS */}
      {track.type === "bass" && (
        <div className={styles.instrGrid}>
          <WaveformPicker value={p.waveform ?? "sawtooth"} onChange={v => set("waveform", v)} />
          <PitchSelect label="Pitch" value={p.pitch ?? "C2"} onChange={v => set("pitch", v)} />
          <Knob label="Attack" value={p.attack ?? 0.001} min={0.001} max={1} step={0.001}
            onChange={v => set("attack", v)} />
          <Knob label="Decay" value={p.decay ?? 0.2} min={0.001} max={2} step={0.01}
            onChange={v => set("decay", v)} />
          <Knob label="Sustain" value={p.sustain ?? 0.4} min={0} max={1} step={0.01}
            onChange={v => set("sustain", v)} />
          <Knob label="Release" value={p.release ?? 0.2} min={0.001} max={2} step={0.01}
            onChange={v => set("release", v)} />
          <Knob label="Filter" value={p.filterFreq ?? 300} min={50} max={8000} step={10}
            onChange={v => set("filterFreq", v)} />
        </div>
      )}

      {/* SAMPLER */}
      {track.type === "sampler" && (
        <div className={styles.instrGrid}>
          <div className={styles.samplerLoad}>
            <label className={styles.instrLabel}>Sample file</label>
            <input
              type="file"
              accept="audio/*"
              className={styles.fileInput}
              onChange={(e) => e.target.files[0] && onSampleLoad(e.target.files[0])}
            />
            {p.sampleUrl && <span className={styles.sampleLoaded}>✓ Loaded</span>}
          </div>
          <Knob label="Rate" value={p.playbackRate ?? 1} min={0.1} max={4} step={0.05}
            onChange={v => set("playbackRate", v)} />
        </div>
      )}

      {/* ADSR Visual */}
      {["synth", "bass"].includes(track.type) && (
        <AdsrVisual
          attack={p.attack ?? 0.02}
          decay={p.decay ?? 0.1}
          sustain={p.sustain ?? 0.5}
          release={p.release ?? 0.5}
          color={track.color}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Knob({ label, value, min, max, step, onChange }) {
  return (
    <div className={styles.knob}>
      <label className={styles.knobLabel}>{label}</label>
      <input
        type="range"
        className={styles.knobRange}
        value={value}
        min={min} max={max} step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className={styles.knobVal}>{Number(value).toFixed(step < 0.01 ? 3 : 2)}</span>
    </div>
  );
}

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7];
const ALL_PITCHES = OCTAVES.flatMap(o => NOTES.map(n => `${n}${o}`));

function PitchSelect({ label, value, onChange }) {
  return (
    <div className={styles.instrField}>
      <label className={styles.instrLabel}>{label}</label>
      <select className={styles.instrSelect} value={value} onChange={e => onChange(e.target.value)}>
        {ALL_PITCHES.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  );
}

function WaveformPicker({ value, onChange }) {
  const WAVES = [
    { id: "sine",       label: "∿ Sine" },
    { id: "triangle",   label: "△ Triangle" },
    { id: "square",     label: "□ Square" },
    { id: "sawtooth",   label: "⊿ Saw" },
    { id: "fatsawtooth",label: "⊿⊿ Fat Saw" },
  ];
  return (
    <div className={styles.waveformPicker}>
      <label className={styles.instrLabel}>Waveform</label>
      <div className={styles.waveformBtns}>
        {WAVES.map(w => (
          <button
            key={w.id}
            className={`${styles.waveBtn} ${value === w.id ? styles.waveBtnActive : ""}`}
            onClick={() => onChange(w.id)}
          >
            {w.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AdsrVisual({ attack, decay, sustain, release, color }) {
  const W = 300, H = 80;
  const pad = 10;
  const total = attack + decay + 0.3 + release;
  const scale = (v) => (v / total) * (W - pad * 2);

  const ax = pad;
  const ay = H - pad;
  const bx = ax + scale(attack);
  const by = pad;
  const cx = bx + scale(decay);
  const cy = H - pad - (sustain * (H - pad * 2));
  const dx = cx + scale(0.3);
  const dy = cy;
  const ex = dx + scale(release);
  const ey = H - pad;

  const d = `M ${ax} ${ay} L ${bx} ${by} L ${cx} ${cy} L ${dx} ${dy} L ${ex} ${ey}`;

  return (
    <div className={styles.adsrVisual}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <path d={d} fill="none" stroke={color} strokeWidth={2} />
        <path d={`${d} L ${ex} ${ay} Z`} fill={color} opacity={0.15} />
        {[
          [ax, "A"], [bx, "D"], [cx, "S"], [dx, ""], [ex, "R"]
        ].map(([x, lbl], i) => lbl && (
          <text key={i} x={x} y={H} fontSize={9} fill={color} textAnchor="middle">{lbl}</text>
        ))}
      </svg>
    </div>
  );
}
