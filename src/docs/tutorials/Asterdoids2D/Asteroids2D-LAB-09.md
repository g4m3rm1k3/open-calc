# 2D Asteroids — LAB 09 — Sound Effects

**Read Asteroids2D-LAB-08.md first.** That lab added particles. This lab adds
synthesized sound — laser shots, explosions, and thrust rumble — all generated
by the browser without audio files.

**What this lab adds:**
- `AudioContext` — the browser's audio processing engine
- Laser sound on firing
- Explosion sounds (pitch varies by asteroid size)
- Thrust rumble while pressing Up

**What you will learn:**
- How the Web Audio API works (signal graph: source → gain → output)
- `OscillatorNode` — generates sound waves
- `GainNode` — controls volume (used to shape the "envelope" of a sound)
- Why `AudioContext` must be created after user interaction
- Frequency sweeps for realistic synthesized sounds

**Time:** 45–60 minutes.

---

## What You Will Build

The game now sounds like a classic Asteroids machine. Every shot produces a
brief descending laser tone. Every explosion has a low rumbling burst — larger
for big asteroids, higher-pitched for small ones. Holding Up produces an engine
hum that stops when you release.

---

## Concept: How Web Audio Works — The Signal Graph

**What it is:** The Web Audio API is a graph of "nodes." Sound flows from a
source node through processing nodes to a destination (your speakers).

```
OscillatorNode → GainNode → AudioContext.destination (speakers)

[generates a]   [controls]   [plays the
 sound wave]      volume]      sound]
```

Every sound you create follows this pattern:
1. Create an `OscillatorNode` (the sound source)
2. Create a `GainNode` (the volume control)
3. Connect them: `oscillator.connect(gain)`, `gain.connect(ctx.destination)`
4. Configure the oscillator (frequency, wave shape)
5. Configure the gain (volume over time — the "envelope")
6. Start the oscillator: `oscillator.start()`
7. Stop the oscillator: `oscillator.stop(time)` (it cleans itself up)

**`OscillatorNode` wave types:**
```
'sine'     — smooth, pure tone (flute-like)
'square'   — buzzy, retro (old video game sounds)
'sawtooth' — harsh, bright (synthesizer leads, laser-like)
'triangle' — softer than square, in between
```

**`GainNode.gain.exponentialRampToValueAtTime`:**

This schedules a smooth volume change. Instead of cutting volume instantly
(which produces a click), it ramps smoothly over time:

```js
const gain = audioCtx.createGain();
gain.gain.setValueAtTime(0.3, audioCtx.currentTime);            // start at 0.3
gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
// Over 0.2 seconds: volume decreases from 0.3 → 0.001 (exponentially)
// Exponential: sounds natural, like a real instrument fading out.
// (cannot ramp to exactly 0 — exponential math doesn't reach 0,
//  hence 0.001 instead of 0)
```

The shape of a sound over time (attack, sustain, release) is called the
**envelope**. Gain nodes let you shape any envelope you want.

---

## Concept: `AudioContext` Must Start After User Interaction

**The browser rule:** Browsers block audio playback until the user has
interacted with the page (clicked, pressed a key, etc.). This prevents
auto-playing ads.

**The error if you ignore this:**
```
The AudioContext was not allowed to start. It must be resumed (or created)
after a user gesture on the page.
```

**The solution — initialize on first interaction:**

```js
// Declare the context variable but don't create it yet:
let audioCtx = null;

// Create it on the first keydown event:
document.addEventListener('keydown', (event) => {
  if (!audioCtx) {
    audioCtx = new AudioContext();   // created on first key press — valid!
  }
  // ... rest of keydown handling
});
```

After the user presses any key, `audioCtx` is created and all subsequent
audio calls work.

**Watch for:** Always check `if (!audioCtx) return;` at the top of sound
functions — they should do nothing until the context exists.

---

## Concept: `OscillatorNode.frequency` — Pitch Changes Over Time

**What it is:** The frequency property can change over time (like the gain),
creating pitch sweeps:

```js
osc.frequency.setValueAtTime(800, audioCtx.currentTime);
osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
// Frequency drops from 800 Hz to 200 Hz over 0.1 seconds.
// 800 Hz = high, 200 Hz = lower — sounds like a descending laser.
```

Frequency in Hz:
- 80–200 Hz: bass / rumble
- 200–800 Hz: mid-range
- 800–2000 Hz: high-pitched sounds

---

## Step 1 — The Audio Module

Create `audio.js` — a separate file for all sound functions:

```js
// audio.js — synthesized sound effects using the Web Audio API.
// No audio files — all sounds generated from math.

// The AudioContext: the root of the audio processing graph.
// null until the user first interacts with the page.
let audioCtx = null;

// initAudio: call this once on first user interaction.
// Creates the AudioContext (required before any audio can play).
export function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
}

// ── Helper ─────────────────────────────────────────────────────────────────────

// makeOneShot: creates, connects, and returns {osc, gain} for a one-time sound.
// The caller configures frequency and gain, then calls osc.start() and osc.stop().
function makeOneShot(waveType = 'sawtooth') {
  if (!audioCtx) return null;

  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = waveType;

  // Connect: oscillator → gain → speakers.
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  return { osc, gain };
}

// ── Sound effects ──────────────────────────────────────────────────────────────

// playLaserShot: a brief descending sawtooth sweep (classic laser sound).
export function playLaserShot() {
  if (!audioCtx) return;

  const { osc, gain } = makeOneShot('sawtooth');
  const now = audioCtx.currentTime;

  // Frequency: starts high, sweeps down quickly.
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

  // Volume: starts at 0.25, fades to near-zero over 0.12 seconds.
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.start(now);
  osc.stop(now + 0.13);   // stop slightly after the gain reaches near-zero
}

// playExplosion: a low rumbling burst. Lower pitch and longer for larger sizes.
// size: 'large' | 'medium' | 'small'
export function playExplosion(size) {
  if (!audioCtx) return;

  // Different properties per size:
  const config = {
    large:  { freq: 80,  endFreq: 30,  duration: 0.7, volume: 0.4 },
    medium: { freq: 140, endFreq: 60,  duration: 0.5, volume: 0.3 },
    small:  { freq: 220, endFreq: 100, duration: 0.3, volume: 0.2 },
  };
  const { freq, endFreq, duration, volume } = config[size];

  // Layer TWO oscillators for a richer explosion texture:
  for (const waveType of ['sawtooth', 'square']) {
    const { osc, gain } = makeOneShot(waveType);
    const now = audioCtx.currentTime;

    // Pitch drops from start freq to end freq:
    osc.frequency.setValueAtTime(freq + Math.random() * 20, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.8);

    // Volume: fades out over the full duration.
    gain.gain.setValueAtTime(volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }
}

// ── Continuous thruster sound ───────────────────────────────────────────────────

// Thruster is a continuous sound (while key is held) — not a one-shot.
// We keep a reference to the oscillator and gain so we can fade it in/out.
let thrusterOsc  = null;
let thrusterGain = null;

// startThrust: begin the thruster rumble.
export function startThrust() {
  if (!audioCtx)     return;
  if (thrusterOsc)   return;   // already playing — don't start twice

  thrusterOsc  = audioCtx.createOscillator();
  thrusterGain = audioCtx.createGain();

  thrusterOsc.type = 'sawtooth';
  thrusterOsc.frequency.setValueAtTime(80, audioCtx.currentTime);

  // Add slight pitch wobble (engine vibration):
  const wobble = audioCtx.createOscillator();
  const wobbleGain = audioCtx.createGain();
  wobble.frequency.value = 5;   // 5 Hz wobble
  wobbleGain.gain.value  = 15;  // ±15 Hz pitch variation
  wobble.connect(wobbleGain);
  wobbleGain.connect(thrusterOsc.frequency);   // modulates the thruster pitch
  wobble.start();

  thrusterOsc.connect(thrusterGain);
  thrusterGain.connect(audioCtx.destination);

  // Fade in:
  thrusterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  thrusterGain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.1);

  thrusterOsc.start();
}

// stopThrust: fade out and stop the thruster sound.
export function stopThrust() {
  if (!thrusterOsc) return;   // nothing playing

  const now = audioCtx.currentTime;

  // Fade out over 0.1 seconds:
  thrusterGain.gain.setValueAtTime(thrusterGain.gain.value, now);
  thrusterGain.gain.linearRampToValueAtTime(0, now + 0.1);

  thrusterOsc.stop(now + 0.12);

  // Clear references so startThrust can be called again:
  thrusterOsc  = null;
  thrusterGain = null;
}
```

---

## Step 2 — Import and Wire Audio Into `main.js`

Since `audio.js` uses `export`, we need to use ES Modules.

Update `index.html` — add `type="module"` to the script tag:

```html
<script src="main.js" type="module"></script>
```

At the top of `main.js`, import the audio functions:

```js
import { initAudio, playLaserShot, playExplosion, startThrust, stopThrust } from './audio.js';
```

**Note: `type="module"` changes one thing in `main.js`:** Variables are no longer
on `window` automatically. If you were using DevTools console to inspect `ship.x`,
you would need to explicitly expose it: `window.ship = ship`. This is actually
better practice — modules don't pollute the global scope.

In the `keydown` listener, add `initAudio()`:

```js
document.addEventListener('keydown', (event) => {
  if (!audioCtx) initAudio();   // initialize on first key press
  // ... rest of handler
});
```

Wait — `audioCtx` is in `audio.js`, not accessible here. Adjust:

```js
// The first keydown initializes audio. We track this with a simple flag:
let audioInitialized = false;

document.addEventListener('keydown', (event) => {
  if (!audioInitialized) {
    initAudio();
    audioInitialized = true;
  }
  keysHeld[event.code] = true;
  event.preventDefault();
  if (event.code === 'Enter' && gameState === 'game_over') restartGame();
});
```

In `fireBullet()`, after creating and pushing the bullet:
```js
  playLaserShot();
```

In `checkCollisions()`, after `spawnExplosion(...)` for asteroid hits:
```js
  playExplosion(asteroid.size);
```

In `updateShip()`, at the end, manage thruster sound:
```js
  // Thruster sound: start when Up is pressed, stop when released.
  // We call start/stop each frame but they check internally if already running.
  if (keysHeld['ArrowUp'] && gameState === 'playing') {
    startThrust();
  } else {
    stopThrust();
  }
```

---

### SAVE AND TRY

Save. Reload. Press any key to initialize audio.

**Test laser:** Press Space — you should hear a brief descending tone.

**Test explosion:**
- Shoot a large asteroid — hear a deep, rumbling explosion
- Shoot a medium — slightly higher pitched, shorter
- Shoot a small — higher pitched, brief

**Test thruster:** Hold Up — hear the engine hum. Release — it fades out.

**If you hear nothing:**
1. Check the console for errors. Common issue: `type="module"` not added to `<script>`.
2. Make sure you pressed a key BEFORE trying to fire — audio needs user interaction first.

**Change something:** In `audio.js`, change the laser shot start frequency from
`900` to `200`. Save. Reload. The laser sounds much lower — more like a blaster
than a sci-fi gun. Change it back to `900`.

---

## 🎯 Challenge: Play a Sound When the Ship Explodes

**Current state:** When the ship is hit, there's a visual particle burst but no sound.

**Your task:** Add a ship explosion sound. It should be different from an asteroid
explosion — think of it as a brief, high-pitched dying sound (not a low rumble).

**Hints:**
1. Add a `playShipExplosion()` function to `audio.js`.
2. Export it and import it in `main.js`.
3. Choose different parameters: higher start frequency, shorter duration,
   perhaps a `'sine'` or `'triangle'` wave for a cleaner tone.
4. Call it in `checkCollisions()` in the ship-asteroid hit block.

---

<details>
<summary>▶ Solution — Ship Explosion Sound</summary>

In `audio.js`, add:
```js
// playShipExplosion: a distinct sound for the player ship being destroyed.
// Higher and briefer than asteroid explosions — a "death cry" not a rock rumble.
export function playShipExplosion() {
  if (!audioCtx) return;

  // High-pitched: starts at 600 Hz, drops to 80 Hz over 0.8 seconds.
  const { osc, gain } = makeOneShot('sine');
  const now = audioCtx.currentTime;

  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  osc.start(now);
  osc.stop(now + 0.85);
}
```

Update the import in `main.js`:
```js
import { initAudio, playLaserShot, playExplosion, playShipExplosion, startThrust, stopThrust } from './audio.js';
```

In `checkCollisions()`, in the ship-asteroid hit block:
```js
  playShipExplosion();
```

**Key insight:** The difference between the asteroid explosion and the ship
explosion is purely in the frequency sweep parameters. The underlying mechanism
is identical — one oscillator, one gain, one envelope. Game audio design is
mostly about choosing the right parameters for the right feel.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| No audio errors on load | Console: no AudioContext warnings |
| Laser sound on Space | Every shot has a brief descending tone |
| Large asteroid = big boom | Deep, long rumble on large hit |
| Small asteroid = small pop | Higher, shorter sound on small hit |
| Thruster hum while Up held | Engine sound starts/stops with key |
| Thruster fades out on release | Not an instant cut — smooth fade |
| Ship explosion sound | Distinct from asteroid sounds — higher pitch |
| Audio starts after first keypress | First press activates — no autoplay block |
| Type=module in index.html | Check index.html script tag |

---

## What Is Next — LAB 10

LAB 10 is the final lab: a high score system using `localStorage`, a start
screen before the game begins, and a complete review of every pattern and
concept used in this series — mapped forward to what you will see in the
3D Asteroids series and your CAD/CAM project.

*Continue to 2D Asteroids — LAB 10 — High Score, Polish, and Complete Review.*
