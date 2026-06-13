// ─── Default track presets (velocity 100 instead of 1) ────────────────────────
export const TRACK_PRESETS = {
  kick: {
    name: "Kick", type: "kick", color: "#e24b4a",
    instrument: { pitch: "C1", decay: 0.3, pitchDecay: 0.05, octaves: 6 },
    steps: [100,0,0,0, 100,0,0,0, 100,0,0,0, 100,0,0,0],
  },
  snare: {
    name: "Snare", type: "snare", color: "#f59e0b",
    instrument: { decay: 0.15, noiseType: "white" },
    steps: [0,0,0,0, 100,0,0,0, 0,0,0,0, 100,0,0,0],
  },
  hihat: {
    name: "Hi-hat", type: "hihat", color: "#10b981",
    instrument: { decay: 0.08, frequency: 400, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 },
    steps: [100,0,100,0, 100,0,100,0, 100,0,100,0, 100,0,100,0],
  },
  openhat: {
    name: "Open Hat", type: "openhat", color: "#34d399",
    instrument: { decay: 0.3, frequency: 400, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 },
    steps: new Array(16).fill(0),
  },
  clap: {
    name: "Clap", type: "clap", color: "#fb923c",
    instrument: { decay: 0.12, noiseType: "pink" },
    steps: [0,0,0,0, 100,0,0,0, 0,0,0,0, 100,0,0,0],
  },
  synth: {
    name: "Synth", type: "synth", color: "#6366f1",
    instrument: { waveform: "sawtooth", attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.5, pitch: "C4" },
    steps: [100,0,0,0, 0,0,0,0, 100,0,0,0, 0,0,0,0],
  },
  bass: {
    name: "Bass", type: "bass", color: "#185fa5",
    instrument: { waveform: "sawtooth", attack: 0.001, decay: 0.2, sustain: 0.4, release: 0.2, pitch: "C2", filterFreq: 300 },
    steps: [100,0,0,0, 0,0,100,0, 0,0,0,0, 100,0,0,0],
  },
  sampler: {
    name: "Sampler", type: "sampler", color: "#8b5cf6",
    instrument: { sampleUrl: null, playbackRate: 1 },
    steps: new Array(16).fill(0),
  },
};

let _id = 1;
export function genTrackId() { return "t" + (_id++); }
let _pid = 1;
export function genPatternId() { return "p" + (_pid++); }

function makeTrack(preset, id) {
  return {
    id: id || genTrackId(),
    name: preset.name,
    type: preset.type,
    color: preset.color,
    muted: false,
    soloed: false,
    volume: 0,
    pan: 0,
    steps: [...preset.steps],
    notes: [],
    instrument: { ...preset.instrument },
    fx: { reverb: 0, delay: 0, distortion: 0, eqLow: 0, eqMid: 0, eqHigh: 0, compThreshold: -24, compRatio: 4, chorus: 0 },
  };
}

function snapshotPattern(state) {
  return state.tracks.reduce((acc, t) => {
    acc[t.id] = { steps: [...t.steps], notes: [...(t.notes || [])] };
    return acc;
  }, {});
}

function makePattern(name, trackSnapshot = {}) {
  return { id: genPatternId(), name, tracks: trackSnapshot };
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function buildInitialState() {
  const kick  = makeTrack(TRACK_PRESETS.kick);
  const snare = makeTrack(TRACK_PRESETS.snare);
  const hihat = makeTrack(TRACK_PRESETS.hihat);
  const bass  = makeTrack(TRACK_PRESETS.bass);
  const tracks = [kick, snare, hihat, bass];

  const p1 = makePattern("Pattern 1", tracks.reduce((a, t) => ({ ...a, [t.id]: { steps: [...t.steps], notes: [] } }), {}));
  const p2 = makePattern("Pattern 2", tracks.reduce((a, t) => ({ ...a, [t.id]: { steps: new Array(16).fill(0), notes: [] } }), {}));

  return {
    bpm: 120,
    stepCount: 16,
    isPlaying: false,
    currentStep: -1,
    masterVolume: -6,
    swing: 0,
    selectedTrackId: kick.id,
    activePanel: "instrument",
    showPianoRoll: false,
    activePatternId: p1.id,
    patterns: [p1, p2],
    tracks,
    history: [],
  };
}

export const initialState = buildInitialState();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function withHistory(state) {
  const snap = JSON.stringify({ tracks: state.tracks, patterns: state.patterns });
  return { ...state, history: [...state.history, snap].slice(-40) };
}

function mapTrack(state, id, fn) {
  return { ...state, tracks: state.tracks.map(t => t.id === id ? fn(t) : t) };
}

function syncPattern(state) {
  const snapshot = snapshotPattern(state);
  return {
    ...state,
    patterns: state.patterns.map(p =>
      p.id === state.activePatternId ? { ...p, tracks: snapshot } : p
    ),
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function musicReducer(state, action) {
  switch (action.type) {

    // Transport
    case "SET_PLAYING":  return { ...state, isPlaying: action.payload };
    case "SET_STEP":     return { ...state, currentStep: action.payload };
    case "SET_BPM":      return { ...state, bpm: action.payload };
    case "SET_SWING":    return { ...state, swing: action.payload };
    case "SET_MASTER_VOLUME": return { ...state, masterVolume: action.payload };

    case "SET_STEP_COUNT":
      return {
        ...state,
        stepCount: action.payload,
        tracks: state.tracks.map(t => {
          const cur = t.steps.length;
          const next = action.payload;
          const steps = cur < next
            ? [...t.steps, ...new Array(next - cur).fill(0)]
            : t.steps.slice(0, next);
          return { ...t, steps };
        }),
        patterns: state.patterns.map(p => ({
          ...p,
          tracks: Object.fromEntries(
            Object.entries(p.tracks).map(([tid, td]) => {
              const cur = td.steps.length;
              const next = action.payload;
              const steps = cur < next ? [...td.steps, ...new Array(next - cur).fill(0)] : td.steps.slice(0, next);
              return [tid, { ...td, steps }];
            })
          ),
        })),
      };

    // Tracks
    case "ADD_TRACK": {
      const s = withHistory(state);
      const preset = TRACK_PRESETS[action.payload] || TRACK_PRESETS.synth;
      const track = makeTrack(preset);
      track.steps = new Array(s.stepCount).fill(0);
      const newPatterns = s.patterns.map(p =>
        p.id === s.activePatternId
          ? { ...p, tracks: { ...p.tracks, [track.id]: { steps: [...track.steps], notes: [] } } }
          : { ...p, tracks: { ...p.tracks, [track.id]: { steps: new Array(s.stepCount).fill(0), notes: [] } } }
      );
      return { ...s, tracks: [...s.tracks, track], selectedTrackId: track.id, patterns: newPatterns };
    }

    case "REMOVE_TRACK": {
      const s = withHistory(state);
      const tracks = s.tracks.filter(t => t.id !== action.payload);
      const sel = s.selectedTrackId === action.payload ? (tracks[0]?.id || null) : s.selectedTrackId;
      const patterns = s.patterns.map(p => {
        const { [action.payload]: _removed, ...rest } = p.tracks;
        return { ...p, tracks: rest };
      });
      return { ...s, tracks, selectedTrackId: sel, patterns };
    }

    case "SELECT_TRACK":  return { ...state, selectedTrackId: action.payload };
    case "RENAME_TRACK":  return mapTrack(state, action.payload.id, t => ({ ...t, name: action.payload.name }));
    case "TOGGLE_MUTE":   return mapTrack(state, action.payload, t => ({ ...t, muted: !t.muted }));
    case "TOGGLE_SOLO":   return mapTrack(state, action.payload, t => ({ ...t, soloed: !t.soloed }));
    case "SET_TRACK_VOLUME": return mapTrack(state, action.payload.id, t => ({ ...t, volume: action.payload.value }));
    case "SET_TRACK_PAN":    return mapTrack(state, action.payload.id, t => ({ ...t, pan: action.payload.value }));

    // Steps
    case "TOGGLE_STEP": {
      const { trackId, stepIndex } = action.payload;
      const s = mapTrack(state, trackId, t => {
        const steps = [...t.steps];
        steps[stepIndex] = steps[stepIndex] > 0 ? 0 : 100;
        return { ...t, steps };
      });
      return syncPattern(s);
    }

    case "SET_STEP_VELOCITY": {
      const { trackId, stepIndex, velocity } = action.payload;
      const s = mapTrack(state, trackId, t => {
        const steps = [...t.steps];
        steps[stepIndex] = Math.max(0, Math.min(127, Math.round(velocity)));
        return { ...t, steps };
      });
      return syncPattern(s);
    }

    case "CLEAR_STEPS": {
      const s = mapTrack(state, action.payload, t => ({ ...t, steps: new Array(state.stepCount).fill(0) }));
      return syncPattern(s);
    }

    case "RANDOMIZE_STEPS": {
      const density = action.payload.density ?? 0.3;
      const s = mapTrack(state, action.payload.id, t => ({
        ...t,
        steps: t.steps.map(() => Math.random() < density ? Math.round(60 + Math.random() * 67) : 0),
      }));
      return syncPattern(s);
    }

    // Instrument
    case "UPDATE_INSTRUMENT":
      return mapTrack(state, action.payload.id, t => ({
        ...t, instrument: { ...t.instrument, ...action.payload.params },
      }));

    // FX
    case "UPDATE_FX":
      return mapTrack(state, action.payload.id, t => ({
        ...t, fx: { ...t.fx, ...action.payload.params },
      }));

    // Piano roll
    case "SET_NOTES": {
      const s = mapTrack(state, action.payload.id, t => ({ ...t, notes: action.payload.notes }));
      return syncPattern(s);
    }

    case "TOGGLE_PIANO_ROLL": return { ...state, showPianoRoll: !state.showPianoRoll };

    // Panel
    case "SET_ACTIVE_PANEL": return { ...state, activePanel: action.payload };

    // ── Patterns ─────────────────────────────────────────────────────────────
    case "ADD_PATTERN": {
      const s = withHistory(syncPattern(state));
      const newPattern = makePattern(action.payload?.name || `Pattern ${s.patterns.length + 1}`,
        s.tracks.reduce((a, t) => ({ ...a, [t.id]: { steps: new Array(s.stepCount).fill(0), notes: [] } }), {})
      );
      return { ...s, patterns: [...s.patterns, newPattern] };
    }

    case "DUPLICATE_PATTERN": {
      const s = withHistory(syncPattern(state));
      const src = s.patterns.find(p => p.id === (action.payload || s.activePatternId));
      if (!src) return s;
      const dup = makePattern(src.name + " copy", JSON.parse(JSON.stringify(src.tracks)));
      return { ...s, patterns: [...s.patterns, dup] };
    }

    case "SWITCH_PATTERN": {
      const saved = syncPattern(state);
      const pattern = saved.patterns.find(p => p.id === action.payload);
      if (!pattern) return saved;
      return {
        ...saved,
        activePatternId: pattern.id,
        tracks: saved.tracks.map(t => {
          const snap = pattern.tracks[t.id];
          return snap
            ? { ...t, steps: [...snap.steps], notes: [...(snap.notes || [])] }
            : { ...t, steps: new Array(saved.stepCount).fill(0), notes: [] };
        }),
      };
    }

    case "DELETE_PATTERN": {
      if (state.patterns.length <= 1) return state;
      const s = withHistory(state);
      const remaining = s.patterns.filter(p => p.id !== action.payload);
      const nextActive = action.payload === s.activePatternId
        ? remaining[0].id
        : s.activePatternId;
      const switchAction = { type: "SWITCH_PATTERN", payload: nextActive };
      return musicReducer({ ...s, patterns: remaining }, switchAction);
    }

    case "RENAME_PATTERN":
      return {
        ...state,
        patterns: state.patterns.map(p =>
          p.id === action.payload.id ? { ...p, name: action.payload.name } : p
        ),
      };

    // Undo
    case "UNDO": {
      if (!state.history.length) return state;
      const history = [...state.history];
      const { tracks, patterns } = JSON.parse(history.pop());
      return { ...state, tracks, patterns, history };
    }

    default:
      return state;
  }
}
