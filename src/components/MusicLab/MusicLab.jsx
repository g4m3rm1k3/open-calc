import { useReducer, useEffect, useCallback, useRef } from "react";
import { musicReducer, initialState } from "./musicReducer";
import { engine } from "./toneEngine";
import Transport from "./Transport";
import TrackList from "./TrackList";
import InstrumentPanel from "./InstrumentPanel";
import PatternPanel from "./PatternPanel";
import { FXChain, Mixer, Oscilloscope, PianoRoll } from "./panels";
import styles from "./MusicLab.module.css";

export default function MusicLab({ onBack }) {
  const [state, dispatch] = useReducer(musicReducer, initialState);
  const engineReady = useRef(false);

  // ── Init engine on first user interaction ──────────────────────────────────
  const ensureEngine = useCallback(async () => {
    if (engineReady.current) return;
    await engine.init();
    state.tracks.forEach(t => engine.addTrack(t));
    engine.updateBpm(state.bpm);
    engine.updateMasterVolume(state.masterVolume);
    engine.updateSwing(state.swing ?? 0);
    engineReady.current = true;
  }, []);

  // ── Step callback ──────────────────────────────────────────────────────────
  useEffect(() => {
    engine.onStepCallback = (step) => dispatch({ type: "SET_STEP", payload: step });
    return () => { engine.onStepCallback = null; };
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => { engine.dispose(); engineReady.current = false; };
  }, []);

  // ── Spacebar play/stop ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        state.isPlaying ? handleStop() : handlePlay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.isPlaying]);

  // ── Engine sync effects ────────────────────────────────────────────────────
  useEffect(() => { if (engineReady.current) engine.updateBpm(state.bpm); }, [state.bpm]);
  useEffect(() => { if (engineReady.current) engine.updateMasterVolume(state.masterVolume); }, [state.masterVolume]);
  useEffect(() => { if (engineReady.current) engine.updateSwing(state.swing ?? 0); }, [state.swing]);

  // ── Transport ──────────────────────────────────────────────────────────────
  const handlePlay = useCallback(async () => {
    await ensureEngine();
    engine.play(state.tracks, state.stepCount);
    dispatch({ type: "SET_PLAYING", payload: true });
  }, [state.tracks, state.stepCount, ensureEngine]);

  const handleStop = useCallback(() => {
    engine.stop();
    dispatch({ type: "SET_PLAYING", payload: false });
    dispatch({ type: "SET_STEP", payload: -1 });
  }, []);

  // ── Track actions ──────────────────────────────────────────────────────────
  const handleAddTrack = useCallback(async (type) => {
    await ensureEngine();
    dispatch({ type: "ADD_TRACK", payload: type });
  }, [ensureEngine]);

  const handleRemoveTrack = useCallback((id) => {
    engine.removeTrack(id);
    dispatch({ type: "REMOVE_TRACK", payload: id });
  }, []);

  // Keep engine in sync when tracks array changes
  const prevTrackIds = useRef(new Set());
  useEffect(() => {
    if (!engineReady.current) return;
    state.tracks.forEach(t => {
      if (!prevTrackIds.current.has(t.id)) engine.addTrack(t);
    });
    prevTrackIds.current = new Set(state.tracks.map(t => t.id));
  }, [state.tracks.length]);

  // ── Step toggle ────────────────────────────────────────────────────────────
  const handleToggleStep = useCallback((trackId, stepIndex) => {
    dispatch({ type: "TOGGLE_STEP", payload: { trackId, stepIndex } });
    const track = state.tracks.find(t => t.id === trackId);
    if (track) {
      const steps = [...track.steps];
      steps[stepIndex] = steps[stepIndex] > 0 ? 0 : 100;
      engine.updateSteps(trackId, steps);
    }
  }, [state.tracks]);

  // ── Per-step velocity ──────────────────────────────────────────────────────
  const handleSetVelocity = useCallback((trackId, stepIndex, velocity) => {
    dispatch({ type: "SET_STEP_VELOCITY", payload: { trackId, stepIndex, velocity } });
    const track = state.tracks.find(t => t.id === trackId);
    if (track) {
      const steps = [...track.steps];
      steps[stepIndex] = Math.max(1, Math.min(127, Math.round(velocity)));
      engine.updateSteps(trackId, steps);
    }
  }, [state.tracks]);

  // ── Instrument update ──────────────────────────────────────────────────────
  const handleInstrumentChange = useCallback((id, params) => {
    dispatch({ type: "UPDATE_INSTRUMENT", payload: { id, params } });
    const track = state.tracks.find(t => t.id === id);
    if (track) engine.updateInstrument(id, { ...track.instrument, ...params });
  }, [state.tracks]);

  // ── FX update ─────────────────────────────────────────────────────────────
  const handleFxChange = useCallback((id, params) => {
    dispatch({ type: "UPDATE_FX", payload: { id, params } });
    engine.updateFx(id, params);
  }, []);

  // ── Track channel updates ─────────────────────────────────────────────────
  const handleVolumeChange = useCallback((id, value) => {
    dispatch({ type: "SET_TRACK_VOLUME", payload: { id, value } });
    engine.updateTrackVolume(id, value);
  }, []);

  const handlePanChange = useCallback((id, value) => {
    dispatch({ type: "SET_TRACK_PAN", payload: { id, value } });
    engine.updateTrackPan(id, value);
  }, []);

  const handleMuteToggle = useCallback((id) => {
    const track = state.tracks.find(t => t.id === id);
    if (track) engine.updateTrackMute(id, !track.muted);
    dispatch({ type: "TOGGLE_MUTE", payload: id });
  }, [state.tracks]);

  const handleSoloToggle = useCallback((id) => {
    dispatch({ type: "TOGGLE_SOLO", payload: id });
  }, []);

  // ── Piano roll notes ───────────────────────────────────────────────────────
  const handleNotesChange = useCallback((id, notes) => {
    dispatch({ type: "SET_NOTES", payload: { id, notes } });
    engine.updateNotes(id, notes);
  }, []);

  // ── Sample load ────────────────────────────────────────────────────────────
  const handleSampleLoad = useCallback(async (id, file) => {
    const url = URL.createObjectURL(file);
    await engine.loadSample(id, url);
    dispatch({ type: "UPDATE_INSTRUMENT", payload: { id, params: { sampleUrl: url } } });
  }, []);

  // ── Pattern management ─────────────────────────────────────────────────────
  const handleSwitchPattern = useCallback((patternId) => {
    if (state.isPlaying) handleStop();
    dispatch({ type: "SWITCH_PATTERN", payload: patternId });
  }, [state.isPlaying]);

  const activePattern = state.patterns.find(p => p.id === state.activePatternId);
  const selectedTrack = state.tracks.find(t => t.id === state.selectedTrackId) || null;

  return (
    <div className={styles.app}>
      <Transport
        bpm={state.bpm}
        isPlaying={state.isPlaying}
        stepCount={state.stepCount}
        masterVolume={state.masterVolume}
        swing={state.swing ?? 0}
        activePatternName={activePattern?.name}
        onPlay={handlePlay}
        onStop={handleStop}
        onBpmChange={(v) => dispatch({ type: "SET_BPM", payload: v })}
        onStepCountChange={(v) => dispatch({ type: "SET_STEP_COUNT", payload: v })}
        onMasterVolumeChange={(v) => dispatch({ type: "SET_MASTER_VOLUME", payload: v })}
        onSwingChange={(v) => dispatch({ type: "SET_SWING", payload: v })}
        onUndo={() => dispatch({ type: "UNDO" })}
        canUndo={state.history.length > 0}
        onBack={onBack}
      />

      <div className={styles.main}>
        <div className={styles.leftCol}>
          <PatternPanel
            patterns={state.patterns}
            activePatternId={state.activePatternId}
            onSwitch={handleSwitchPattern}
            onAdd={() => dispatch({ type: "ADD_PATTERN" })}
            onDuplicate={() => dispatch({ type: "DUPLICATE_PATTERN" })}
            onDelete={(id) => dispatch({ type: "DELETE_PATTERN", payload: id })}
            onRename={(id, name) => dispatch({ type: "RENAME_PATTERN", payload: { id, name } })}
          />
          <TrackList
            tracks={state.tracks}
            currentStep={state.currentStep}
            selectedTrackId={state.selectedTrackId}
            stepCount={state.stepCount}
            isPlaying={state.isPlaying}
            onSelect={(id) => dispatch({ type: "SELECT_TRACK", payload: id })}
            onToggleStep={handleToggleStep}
            onSetVelocity={handleSetVelocity}
            onMute={handleMuteToggle}
            onSolo={handleSoloToggle}
            onRemove={handleRemoveTrack}
            onRename={(id, name) => dispatch({ type: "RENAME_TRACK", payload: { id, name } })}
            onClearSteps={(id) => dispatch({ type: "CLEAR_STEPS", payload: id })}
            onRandomize={(id) => dispatch({ type: "RANDOMIZE_STEPS", payload: { id } })}
            onAddTrack={handleAddTrack}
            onOpenPianoRoll={() => dispatch({ type: "TOGGLE_PIANO_ROLL" })}
          />
        </div>

        <div className={styles.rightCol}>
          <Oscilloscope engine={engine} isPlaying={state.isPlaying} />

          {selectedTrack && (
            <div className={styles.bottomPanel}>
              <div className={styles.panelTabs}>
                {["instrument", "fx", "mixer"].map(p => (
                  <button
                    key={p}
                    className={`${styles.panelTab} ${state.activePanel === p ? styles.panelTabActive : ""}`}
                    onClick={() => dispatch({ type: "SET_ACTIVE_PANEL", payload: p })}
                  >
                    {p === "instrument" ? "Instrument" : p === "fx" ? "FX Chain" : "Mixer"}
                  </button>
                ))}
              </div>

              <div className={styles.panelBody}>
                {state.activePanel === "instrument" && (
                  <InstrumentPanel
                    track={selectedTrack}
                    onChange={(params) => handleInstrumentChange(selectedTrack.id, params)}
                    onSampleLoad={(file) => handleSampleLoad(selectedTrack.id, file)}
                    onOpenPianoRoll={() => dispatch({ type: "TOGGLE_PIANO_ROLL" })}
                  />
                )}
                {state.activePanel === "fx" && (
                  <FXChain
                    track={selectedTrack}
                    onChange={(params) => handleFxChange(selectedTrack.id, params)}
                  />
                )}
                {state.activePanel === "mixer" && (
                  <Mixer
                    tracks={state.tracks}
                    masterVolume={state.masterVolume}
                    onVolumeChange={handleVolumeChange}
                    onPanChange={handlePanChange}
                    onMasterVolumeChange={(v) => dispatch({ type: "SET_MASTER_VOLUME", payload: v })}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {state.showPianoRoll && selectedTrack && (
        <PianoRoll
          track={selectedTrack}
          stepCount={state.stepCount}
          onClose={() => dispatch({ type: "TOGGLE_PIANO_ROLL" })}
          onChange={(notes) => handleNotesChange(selectedTrack.id, notes)}
        />
      )}
    </div>
  );
}
