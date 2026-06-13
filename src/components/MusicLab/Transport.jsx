import styles from "./MusicLab.module.css";

export default function Transport({
  bpm, isPlaying, stepCount, masterVolume, swing,
  activePatternName,
  onPlay, onStop, onBpmChange, onStepCountChange,
  onMasterVolumeChange, onSwingChange, onUndo, canUndo, onBack,
}) {
  return (
    <div className={styles.transport}>
      {onBack && (
        <button className={styles.tbBtn} onClick={onBack} title="Back to Labs">
          ← Labs
        </button>
      )}
      <span className={styles.logo}>🎵 Music Lab</span>

      <div className={styles.transportSep} />

      <button
        className={`${styles.tbBtn} ${isPlaying ? styles.tbBtnActive : ""}`}
        onClick={isPlaying ? onStop : onPlay}
        title={isPlaying ? "Stop (Space)" : "Play (Space)"}
      >
        {isPlaying ? "■ Stop" : "▶ Play"}
      </button>

      <div className={styles.transportSep} />

      <label className={styles.transportLabel}>BPM</label>
      <input
        type="number"
        className={styles.bpmInput}
        value={bpm}
        min={40} max={220}
        onChange={(e) => onBpmChange(Number(e.target.value))}
      />
      <input
        type="range"
        className={styles.bpmSlider}
        value={bpm}
        min={40} max={220}
        onChange={(e) => onBpmChange(Number(e.target.value))}
      />

      <div className={styles.transportSep} />

      <label className={styles.transportLabel}>Swing</label>
      <input
        type="range"
        className={styles.swingSlider}
        value={swing ?? 0}
        min={0} max={0.5} step={0.01}
        onChange={(e) => onSwingChange?.(parseFloat(e.target.value))}
      />
      <span className={styles.transportVal}>{Math.round((swing ?? 0) * 100)}%</span>

      <div className={styles.transportSep} />

      <label className={styles.transportLabel}>Steps</label>
      <select
        className={styles.stepsSelect}
        value={stepCount}
        onChange={(e) => onStepCountChange(Number(e.target.value))}
      >
        {[8, 16, 32].map(n => <option key={n} value={n}>{n}</option>)}
      </select>

      <div className={styles.transportSep} />

      <label className={styles.transportLabel}>Vol</label>
      <input
        type="range"
        className={styles.volSlider}
        value={masterVolume}
        min={-40} max={0} step={1}
        onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
      />
      <span className={styles.transportVal}>{masterVolume}dB</span>

      <div className={styles.transportSep} />

      {activePatternName && (
        <span className={styles.patternBadge}>{activePatternName}</span>
      )}

      <button className={styles.tbBtn} onClick={onUndo} disabled={!canUndo} title="Undo">
        ↩ Undo
      </button>
    </div>
  );
}
