import * as Tone from "tone";

class ToneEngine {
  constructor() {
    this.instruments = {};
    this.fx = {};           // trackId → { reverb, delay, distortion, eq, compressor, chorus }
    this.channels = {};
    this.master = null;
    this.analyser = null;
    this.sequence = null;
    this.onStepCallback = null;
    this.currentSteps = {};   // trackId → number[] (velocity 0-127)
    this.currentNotes = {};
    this.trackTypes = {};
    this.trackParams = {};
    this.stepCount = 16;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    await Tone.start();
    this.master = new Tone.Volume(-6).toDestination();
    this.analyser = new Tone.Analyser("waveform", 256);
    this.master.connect(this.analyser);
    this.initialized = true;
  }

  addTrack(track) {
    this.trackTypes[track.id] = track.type;
    this.trackParams[track.id] = track.instrument;
    this.currentSteps[track.id] = track.steps;
    this.currentNotes[track.id] = track.notes || [];

    // FX chain nodes
    const reverb      = new Tone.Reverb({ decay: 2, wet: 0 });
    const delay       = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.3, wet: 0 });
    const distortion  = new Tone.Distortion({ distortion: 0.4, wet: 0 });
    const eq          = new Tone.EQ3({ low: 0, mid: 0, high: 0 });
    const compressor  = new Tone.Compressor({ threshold: -24, ratio: 4, attack: 0.005, release: 0.1 });
    const chorus      = new Tone.Chorus({ frequency: 4, delayTime: 3.5, depth: 0.7, wet: 0 }).start();

    this.fx[track.id] = { reverb, delay, distortion, eq, compressor, chorus };

    // Channel
    const channel = new Tone.Channel({
      volume: track.volume || 0,
      pan: track.pan || 0,
      mute: track.muted || false,
    }).connect(this.master);
    this.channels[track.id] = channel;

    // Wire: instrument → distortion → eq → reverb → delay → chorus → compressor → channel
    distortion.connect(eq);
    eq.connect(reverb);
    reverb.connect(delay);
    delay.connect(chorus);
    chorus.connect(compressor);
    compressor.connect(channel);

    this._buildInstrument(track);
  }

  _buildInstrument(track) {
    if (this.instruments[track.id]) {
      try { this.instruments[track.id].dispose(); } catch (e) {}
    }

    const p = track.instrument;
    let inst;

    switch (track.type) {
      case "kick":
        inst = new Tone.MembraneSynth({
          pitchDecay: p.pitchDecay ?? 0.05,
          octaves: p.octaves ?? 6,
          envelope: { attack: 0.001, decay: p.decay ?? 0.3, sustain: 0, release: 0.1 },
        });
        break;

      case "snare":
      case "clap":
        inst = new Tone.NoiseSynth({
          noise: { type: p.noiseType ?? (track.type === "clap" ? "pink" : "white") },
          envelope: { attack: 0.001, decay: p.decay ?? 0.12, sustain: 0, release: 0.05 },
        });
        break;

      case "hihat":
      case "openhat":
        inst = new Tone.MetalSynth({
          frequency: p.frequency ?? 400,
          envelope: { attack: 0.001, decay: p.decay ?? (track.type === "openhat" ? 0.3 : 0.08), release: 0.01 },
          harmonicity: p.harmonicity ?? 5.1,
          modulationIndex: p.modulationIndex ?? 32,
          resonance: p.resonance ?? 4000,
          octaves: p.octaves ?? 1.5,
        });
        break;

      case "synth":
        inst = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: p.waveform ?? "sawtooth" },
          envelope: { attack: p.attack ?? 0.02, decay: p.decay ?? 0.1, sustain: p.sustain ?? 0.5, release: p.release ?? 0.5 },
        });
        break;

      case "bass":
        inst = new Tone.MonoSynth({
          oscillator: { type: p.waveform ?? "sawtooth" },
          envelope: { attack: p.attack ?? 0.001, decay: p.decay ?? 0.2, sustain: p.sustain ?? 0.4, release: p.release ?? 0.2 },
          filterEnvelope: {
            attack: 0.001, decay: 0.1, sustain: 0.5, release: 0.5,
            baseFrequency: p.filterFreq ?? 300, octaves: 3,
          },
        });
        break;

      case "sampler":
        inst = p.sampleUrl ? new Tone.Player(p.sampleUrl).sync() : new Tone.Synth();
        break;

      default:
        inst = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 } });
    }

    const fxChain = this.fx[track.id];
    inst.connect(fxChain ? fxChain.distortion : this.master);
    this.instruments[track.id] = inst;
  }

  removeTrack(trackId) {
    try { this.instruments[trackId]?.dispose(); } catch (e) {}
    try {
      const f = this.fx[trackId];
      if (f) {
        f.reverb.dispose(); f.delay.dispose(); f.distortion.dispose();
        f.eq.dispose(); f.compressor.dispose(); f.chorus.dispose();
      }
    } catch (e) {}
    try { this.channels[trackId]?.dispose(); } catch (e) {}
    delete this.instruments[trackId];
    delete this.fx[trackId];
    delete this.channels[trackId];
    delete this.currentSteps[trackId];
    delete this.currentNotes[trackId];
    delete this.trackTypes[trackId];
    delete this.trackParams[trackId];
  }

  buildSequence(trackIds, stepCount) {
    this.stepCount = stepCount;
    if (this.sequence) { this.sequence.dispose(); this.sequence = null; }

    const steps = [...Array(stepCount).keys()];
    this.sequence = new Tone.Sequence((time, stepIndex) => {
      trackIds.forEach((id) => {
        const inst = this.instruments[id];
        if (!inst) return;
        if (this.channels[id]?.mute) return;

        const vel = this.currentSteps[id]?.[stepIndex] ?? 0;
        if (vel === 0) return;

        const type = this.trackTypes[id];
        const params = this.trackParams[id] || {};
        const normVel = vel / 127;

        try {
          if (type === "snare" || type === "clap") {
            inst.triggerAttackRelease(params.decay ?? 0.12, time);
          } else if (type === "kick") {
            inst.triggerAttackRelease(params.pitch ?? "C1", params.decay ?? 0.3, time);
          } else if (type === "hihat" || type === "openhat") {
            inst.triggerAttackRelease(params.decay ?? 0.08, time);
          } else if (type === "sampler" && inst instanceof Tone.Player) {
            inst.start(time);
          } else {
            const noteEvents = (this.currentNotes[id] || []).filter(n => n.step === stepIndex);
            if (noteEvents.length > 0) {
              noteEvents.forEach(n => {
                inst.triggerAttackRelease(n.note, n.duration || "8n", time, normVel);
              });
            } else {
              inst.triggerAttackRelease(params.pitch ?? "C4", params.decay ?? "8n", time, normVel);
            }
          }
        } catch (err) {
          console.warn("Trigger error:", err);
        }
      });

      Tone.getDraw().schedule(() => {
        this.onStepCallback?.(stepIndex);
      }, time);
    }, steps, "16n");
  }

  play(tracks, stepCount) {
    const ids = tracks.map(t => t.id);
    tracks.forEach(t => {
      this.currentSteps[t.id] = t.steps;
      this.currentNotes[t.id] = t.notes || [];
      this.trackTypes[t.id] = t.type;
      this.trackParams[t.id] = t.instrument;
    });
    this.buildSequence(ids, stepCount);
    Tone.Transport.start();
    this.sequence.start(0);
  }

  stop() {
    Tone.Transport.stop();
    if (this.sequence) { this.sequence.stop(); }
    Tone.Transport.cancel();
  }

  updateSteps(trackId, steps) { this.currentSteps[trackId] = steps; }
  updateNotes(trackId, notes) { this.currentNotes[trackId] = notes; }

  updateBpm(bpm) { Tone.Transport.bpm.value = bpm; }

  updateSwing(amount) {
    Tone.Transport.swing = amount;
    Tone.Transport.swingSubdivision = "16n";
  }

  updateMasterVolume(db) { if (this.master) this.master.volume.value = db; }
  updateTrackVolume(trackId, db) { if (this.channels[trackId]) this.channels[trackId].volume.value = db; }
  updateTrackPan(trackId, pan) { if (this.channels[trackId]) this.channels[trackId].pan.value = pan; }
  updateTrackMute(trackId, muted) { if (this.channels[trackId]) this.channels[trackId].mute = muted; }

  updateInstrument(trackId, params) {
    this.trackParams[trackId] = params;
    const inst = this.instruments[trackId];
    const type = this.trackTypes[trackId];
    if (!inst) return;
    try {
      if (type === "synth" || type === "bass") {
        if (params.waveform && inst.set) inst.set({ oscillator: { type: params.waveform } });
        if (inst.set) inst.set({ envelope: { attack: params.attack, decay: params.decay, sustain: params.sustain, release: params.release } });
      } else if (type === "kick") {
        if (inst.set) inst.set({ pitchDecay: params.pitchDecay, octaves: params.octaves });
      } else if (["snare", "clap", "hihat", "openhat"].includes(type)) {
        const track = { id: trackId, type, instrument: params };
        this._buildInstrument(track);
      }
    } catch (err) {
      console.warn("Instrument update error:", err);
    }
  }

  updateFx(trackId, fxParams) {
    const f = this.fx[trackId];
    if (!f) return;
    try {
      if (fxParams.reverb !== undefined)       f.reverb.wet.value = fxParams.reverb;
      if (fxParams.delay !== undefined)        f.delay.wet.value = fxParams.delay;
      if (fxParams.distortion !== undefined)   f.distortion.wet.value = fxParams.distortion;
      if (fxParams.eqLow !== undefined)        f.eq.low.value = fxParams.eqLow;
      if (fxParams.eqMid !== undefined)        f.eq.mid.value = fxParams.eqMid;
      if (fxParams.eqHigh !== undefined)       f.eq.high.value = fxParams.eqHigh;
      if (fxParams.compThreshold !== undefined) f.compressor.threshold.value = fxParams.compThreshold;
      if (fxParams.compRatio !== undefined)    f.compressor.ratio.value = fxParams.compRatio;
      if (fxParams.chorus !== undefined)       f.chorus.wet.value = fxParams.chorus;
    } catch (err) {
      console.warn("FX update error:", err);
    }
  }

  async loadSample(trackId, url) {
    const player = new Tone.Player(url);
    await Tone.loaded();
    if (this.instruments[trackId]) {
      try { this.instruments[trackId].dispose(); } catch (e) {}
    }
    const fxChain = this.fx[trackId];
    player.connect(fxChain ? fxChain.distortion : this.master);
    this.instruments[trackId] = player;
    this.trackTypes[trackId] = "sampler";
  }

  getWaveform() { return this.analyser ? this.analyser.getValue() : new Float32Array(256); }

  dispose() {
    this.stop();
    Object.keys(this.instruments).forEach(id => this.removeTrack(id));
    this.master?.dispose();
    this.analyser?.dispose();
    this.initialized = false;
  }
}

export const engine = new ToneEngine();
