// Tiny synthesized sound effects — no audio assets needed. Shared across
// games so each one doesn't reinvent the same WebAudio boilerplate.
export function playTone(ctx, { freq = 440, dur = 0.15, type = "sine", gain = 0.2, slideTo = null } = {}) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

export function createAudioContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  return AC ? new AC() : null;
}
