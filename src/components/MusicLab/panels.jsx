import { useEffect, useRef, useState } from "react";
import styles from "./MusicLab.module.css";

// ─── FXChain ──────────────────────────────────────────────────────────────────
export function FXChain({ track, onChange }) {
  const fx = track.fx;
  const set = (key, val) => onChange({ ...fx, [key]: val });

  const FX_ROWS = [
    { key: "reverb",        label: "Reverb",       min: 0,   max: 1,   step: 0.01,  fmt: v => v.toFixed(2) },
    { key: "delay",         label: "Delay",        min: 0,   max: 1,   step: 0.01,  fmt: v => v.toFixed(2) },
    { key: "chorus",        label: "Chorus",       min: 0,   max: 1,   step: 0.01,  fmt: v => v.toFixed(2) },
    { key: "distortion",    label: "Distortion",   min: 0,   max: 1,   step: 0.01,  fmt: v => v.toFixed(2) },
    { key: "eqLow",         label: "EQ Low",       min: -24, max: 24,  step: 0.5,   fmt: v => v.toFixed(1) + "dB" },
    { key: "eqMid",         label: "EQ Mid",       min: -24, max: 24,  step: 0.5,   fmt: v => v.toFixed(1) + "dB" },
    { key: "eqHigh",        label: "EQ High",      min: -24, max: 24,  step: 0.5,   fmt: v => v.toFixed(1) + "dB" },
    { key: "compThreshold", label: "Comp Thresh",  min: -60, max: 0,   step: 1,     fmt: v => v + "dB" },
    { key: "compRatio",     label: "Comp Ratio",   min: 1,   max: 20,  step: 0.5,   fmt: v => v.toFixed(1) + ":1" },
  ];

  return (
    <div className={styles.fxChain}>
      {FX_ROWS.map(({ key, label, min, max, step, fmt }) => (
        <div key={key} className={styles.fxRow}>
          <label className={styles.fxLabel}>{label}</label>
          <input
            type="range"
            className={styles.fxSlider}
            value={fx[key] ?? (key === "compThreshold" ? -24 : key === "compRatio" ? 4 : 0)}
            min={min} max={max} step={step}
            onChange={(e) => set(key, parseFloat(e.target.value))}
          />
          <span className={styles.fxVal}>{fmt(fx[key] ?? (key === "compThreshold" ? -24 : key === "compRatio" ? 4 : 0))}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Mixer ────────────────────────────────────────────────────────────────────
export function Mixer({ tracks, masterVolume, onVolumeChange, onPanChange, onMasterVolumeChange }) {
  return (
    <div className={styles.mixer}>
      {tracks.map(track => (
        <div key={track.id} className={styles.mixerChannel}>
          <div className={styles.mixerName} style={{ color: track.color }}>{track.name}</div>
          <div className={styles.mixerLabel}>Pan</div>
          <input
            type="range"
            className={styles.mixerSlider}
            value={track.pan ?? 0}
            min={-1} max={1} step={0.01}
            onChange={(e) => onPanChange(track.id, parseFloat(e.target.value))}
          />
          <div className={styles.mixerLabel}>Vol</div>
          <input
            type="range"
            className={`${styles.mixerSlider} ${styles.mixerVolSlider}`}
            value={track.volume ?? 0}
            min={-40} max={6} step={0.5}
            orient="vertical"
            onChange={(e) => onVolumeChange(track.id, parseFloat(e.target.value))}
          />
          <span className={styles.mixerVal}>{track.volume ?? 0}dB</span>
        </div>
      ))}
      <div className={styles.mixerChannel}>
        <div className={styles.mixerName} style={{ fontWeight: 600 }}>Master</div>
        <div className={styles.mixerLabel}>Vol</div>
        <input
          type="range"
          className={`${styles.mixerSlider} ${styles.mixerVolSlider}`}
          value={masterVolume}
          min={-40} max={0} step={0.5}
          orient="vertical"
          onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
        />
        <span className={styles.mixerVal}>{masterVolume}dB</span>
      </div>
    </div>
  );
}

// ─── Oscilloscope ─────────────────────────────────────────────────────────────
export function Oscilloscope({ engine, isPlaying }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = (H / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let i = 0; i <= 8; i++) {
        const x = (W / 8) * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();

      // Waveform
      const data = engine.getWaveform();
      if (data && data.length > 0) {
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        const sliceW = W / data.length;
        data.forEach((v, i) => {
          const x = i * sliceW;
          const y = ((v + 1) / 2) * H;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [engine]);

  return (
    <div className={styles.oscilloscope}>
      <div className={styles.oscilloscopeHeader}>
        <span>Oscilloscope</span>
        <span className={styles.oscilloscopeHint}>
          {isPlaying ? "● LIVE" : "○ stopped"}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.oscilloscopeCanvas}
        width={600}
        height={100}
      />
    </div>
  );
}

// ─── Piano Roll ───────────────────────────────────────────────────────────────
const PIANO_NOTES = [];
const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
for (let oct = 6; oct >= 1; oct--) {
  for (let n = 11; n >= 0; n--) {
    PIANO_NOTES.push(`${NOTE_NAMES[n]}${oct}`);
  }
}

const DURATION_OPTIONS = ["32n","16n","8n","4n","2n","1n"];

export function PianoRoll({ track, stepCount, onClose, onChange }) {
  const notes = track.notes || [];
  const [selectedDuration, setSelectedDuration] = useState("8n");
  const [selectedNote, setSelectedNote] = useState(null);

  const getNote = (step, note) => notes.find(n => n.step === step && n.note === note);
  const hasNote = (step, note) => !!getNote(step, note);

  const toggleNote = (step, note) => {
    if (hasNote(step, note)) {
      onChange(notes.filter(n => !(n.step === step && n.note === note)));
      if (selectedNote?.step === step && selectedNote?.note === note) setSelectedNote(null);
    } else {
      const newNote = { step, note, duration: selectedDuration, velocity: 100 };
      onChange([...notes, newNote]);
      setSelectedNote(newNote);
    }
  };

  const updateNoteVelocity = (step, note, velocity) => {
    onChange(notes.map(n => n.step === step && n.note === note ? { ...n, velocity } : n));
  };

  const updateNoteDuration = (step, note, duration) => {
    onChange(notes.map(n => n.step === step && n.note === note ? { ...n, duration } : n));
  };

  const displayNotes = PIANO_NOTES.slice(0, 48); // 4 octaves

  // Compute per-step max velocity for the velocity lane
  const stepVelocities = Array.from({ length: stepCount }, (_, step) => {
    const stepNotes = notes.filter(n => n.step === step);
    return stepNotes.length > 0 ? Math.max(...stepNotes.map(n => n.velocity ?? 100)) : 0;
  });

  return (
    <div className={styles.pianoRollOverlay}>
      <div className={styles.pianoRoll}>
        <div className={styles.pianoRollHeader}>
          <span>🎹 Piano Roll — {track.name}</span>
          <div className={styles.prHeaderControls}>
            <label className={styles.prDurLabel}>Duration:</label>
            {DURATION_OPTIONS.map(d => (
              <button
                key={d}
                className={`${styles.prDurBtn} ${selectedDuration === d ? styles.prDurBtnActive : ""}`}
                onClick={() => {
                  setSelectedDuration(d);
                  if (selectedNote) updateNoteDuration(selectedNote.step, selectedNote.note, d);
                }}
              >{d}</button>
            ))}
          </div>
          <button className={styles.pianoRollClose} onClick={onClose}>✕ Close</button>
        </div>

        <div className={styles.pianoRollBody}>
          {/* Steps header */}
          <div className={styles.prRowHeader}>
            <div className={styles.prKeyLabel} />
            {Array.from({ length: stepCount }, (_, i) => (
              <div key={i} className={`${styles.prStepHeader} ${i % 4 === 0 ? styles.prGroupStart : ""}`}>
                {i % 4 === 0 ? i + 1 : ""}
              </div>
            ))}
          </div>

          {/* Note rows */}
          <div className={styles.prRows}>
            {displayNotes.map(note => {
              const isBlack = note.includes("#");
              return (
                <div key={note} className={styles.prRow}>
                  <div className={`${styles.prKey} ${isBlack ? styles.prKeyBlack : styles.prKeyWhite}`}>
                    {!isBlack && note}
                  </div>
                  {Array.from({ length: stepCount }, (_, step) => {
                    const on = hasNote(step, note);
                    const isSelected = selectedNote?.step === step && selectedNote?.note === note;
                    return (
                      <button
                        key={step}
                        className={`${styles.prCell} ${on ? styles.prCellOn : ""} ${step % 4 === 0 ? styles.prGroupStart : ""} ${isSelected ? styles.prCellSelected : ""}`}
                        style={on ? { "--track-color": track.color } : undefined}
                        onClick={() => { toggleNote(step, note); }}
                        title={on ? `${note} step ${step+1} · ${getNote(step,note)?.duration ?? "8n"} · vel ${getNote(step,note)?.velocity ?? 100}` : `${note} step ${step+1}`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Velocity lane */}
          <div className={styles.prVelocityLane}>
            <div className={styles.prKey} style={{ background: "#161b22", color: "#7d8590", fontSize: 9 }}>VEL</div>
            {stepVelocities.map((vel, step) => (
              <div key={step} className={`${styles.prVelCell} ${step % 4 === 0 ? styles.prGroupStart : ""}`}>
                {vel > 0 && (
                  <div
                    className={styles.prVelBar}
                    style={{
                      height: `${(vel / 127) * 100}%`,
                      background: track.color,
                    }}
                    title={`Velocity ${vel}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected note inspector */}
        {selectedNote && hasNote(selectedNote.step, selectedNote.note) && (
          <div className={styles.prInspector}>
            <span className={styles.prInspectorLabel}>{selectedNote.note} · step {selectedNote.step + 1}</span>
            <label className={styles.prInspectorLabel}>Velocity:</label>
            <input
              type="range"
              min={1} max={127} step={1}
              value={getNote(selectedNote.step, selectedNote.note)?.velocity ?? 100}
              onChange={(e) => {
                const v = Number(e.target.value);
                updateNoteVelocity(selectedNote.step, selectedNote.note, v);
                setSelectedNote(prev => ({ ...prev, velocity: v }));
              }}
              className={styles.prInspectorSlider}
            />
            <span className={styles.prInspectorVal}>{getNote(selectedNote.step, selectedNote.note)?.velocity ?? 100}</span>
          </div>
        )}
      </div>
    </div>
  );
}
