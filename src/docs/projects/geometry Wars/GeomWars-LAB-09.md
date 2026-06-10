# Geometry Wars — LAB 09 — Sound and High Score

**Read GeomWars-LAB-08.md first.** That lab added the multiplier, power-ups, and
screen shake. This lab adds sound effects (synthesized with numpy arrays, like the
Web Audio API in Pac-Man) and a high score saved to a text file.

**What this lab adds over LAB-08:**
- Shoot sound, explosion sound, death sound, power-up collect sound
- Sounds synthesized from math (no audio files) using numpy + pygame.sndarray
- High score saved to `highscore.txt` — persists between sessions
- High score displayed in the game over overlay

---

## How This Connects to Pac-Man

**Pac-Man LAB-10 used the Web Audio API:**
```js
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 440;
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);
oscillator.start(); oscillator.stop(startTime + 0.1);
```

**Geometry Wars uses numpy to generate the same sine waves as raw arrays:**
```python
import numpy as np
sample_rate = 44100
duration    = 0.1   # seconds
t           = np.linspace(0, duration, int(sample_rate * duration))
wave        = np.sin(2 * np.pi * 440 * t)  # 440 Hz sine wave
```

Both approaches generate a mathematical sine wave at a specific frequency.
JavaScript does it in the browser's audio graph. Python does it as a numpy array
then hands it to pygame. The math is identical — `sin(2π * frequency * time)`.

**High score in Pac-Man:** `localStorage.setItem('key', value)` — browser storage.
**High score in Python:** Write to a text file with `open('highscore.txt', 'w')`.
Same concept: persist a value beyond the program's lifetime.

---

## Prerequisites for Sound

Synthesized sound requires `numpy`. Install it:
```
pip install numpy
```

Pygame's sound system must be initialized with the right settings. Add after
`pygame.init()`:

```python
# Initialize pygame's audio mixer.
# frequency = samples per second (CD quality = 44100)
# size      = -16 means 16-bit signed integers
# channels  = 1 for mono (2 for stereo)
# buffer    = smaller = lower latency (at risk of crackling on slow machines)
pygame.mixer.pre_init(frequency=44100, size=-16, channels=1, buffer=512)
pygame.mixer.init()
```

---

## Concept: Synthesizing Sound with NumPy

**What numpy is:** A Python library for fast array math. A sound wave is just
an array of numbers — one number per sample per second.

**A sine wave at frequency `f`:**
```python
import numpy as np

SAMPLE_RATE = 44100   # samples per second

def make_sine(frequency, duration_secs, volume=0.3):
    """Returns a numpy array of a sine wave."""
    num_samples = int(SAMPLE_RATE * duration_secs)
    t           = np.linspace(0, duration_secs, num_samples)
    # sin(2π * f * t) generates one full cycle every 1/f seconds.
    wave        = np.sin(2 * np.pi * frequency * t)
    # Scale to 16-bit integer range: -32768 to 32767.
    wave        = (wave * 32767 * volume).astype(np.int16)
    return wave
```

**Converting array to playable Sound:**
```python
sound_array = make_sine(440, 0.1)
sound       = pygame.sndarray.make_sound(sound_array)
sound.play()
```

`pygame.sndarray.make_sound(array)` — converts a numpy array to a
`pygame.Sound` object that can be `.play()`'d immediately. The array must
be int16 (16-bit integers) and match the mixer's sample rate.

**Envelope — attack and release:**
A pure sine wave that starts and stops abruptly makes a click. Adding a short
fade-in (attack) and fade-out (release) makes it sound clean:

```python
def apply_envelope(wave, attack_samples, release_samples):
    """Apply fade in/out to remove clicks at wave start and end."""
    attack  = np.linspace(0, 1, attack_samples)
    release = np.linspace(1, 0, release_samples)
    # Multiply first N samples by 0→1, last N samples by 1→0.
    wave[:attack_samples]  = (wave[:attack_samples]  * attack).astype(np.int16)
    wave[-release_samples:] = (wave[-release_samples:] * release).astype(np.int16)
    return wave
```

---

## Step 1 — Add Sound Generation

Add to `main.py` (near the top, after `import math`):

```python
import numpy as np

SAMPLE_RATE = 44100   # audio samples per second

def make_sine_wave(frequency, duration_secs, volume=0.3):
    """Generates a sine wave as a 16-bit numpy array."""
    n_samples = int(SAMPLE_RATE * duration_secs)
    t         = np.linspace(0, duration_secs, n_samples, endpoint=False)
    wave      = np.sin(2 * np.pi * frequency * t)
    # Apply short fade-in and fade-out to prevent audio clicks.
    fade_len  = min(200, n_samples // 4)
    wave[:fade_len]  *= np.linspace(0, 1, fade_len)
    wave[-fade_len:] *= np.linspace(1, 0, fade_len)
    return (wave * 32767 * volume).astype(np.int16)

def make_noise_wave(duration_secs, volume=0.2):
    """Generates white noise — random values. Used for explosion sounds."""
    n_samples = int(SAMPLE_RATE * duration_secs)
    noise     = np.random.uniform(-1, 1, n_samples)
    fade_len  = min(300, n_samples // 3)
    noise[:fade_len]  *= np.linspace(0, 1, fade_len)
    noise[-fade_len:] *= np.linspace(1, 0, fade_len)
    return (noise * 32767 * volume).astype(np.int16)

def make_sweep_wave(start_freq, end_freq, duration_secs, volume=0.25):
    """
    Generates a frequency sweep (chirp) from start_freq to end_freq.
    Used for the shoot sound (descending) and death sound (falling).
    """
    n_samples   = int(SAMPLE_RATE * duration_secs)
    t           = np.linspace(0, duration_secs, n_samples, endpoint=False)
    # Linearly interpolate frequency: freq(t) = start + (end-start) * t/duration
    frequencies = np.linspace(start_freq, end_freq, n_samples)
    # Integrate frequency to get phase (so the wave is continuous).
    phase       = 2 * np.pi * np.cumsum(frequencies) / SAMPLE_RATE
    wave        = np.sin(phase)
    fade_len    = min(200, n_samples // 4)
    wave[:fade_len]  *= np.linspace(0, 1, fade_len)
    wave[-fade_len:] *= np.linspace(1, 0, fade_len)
    return (wave * 32767 * volume).astype(np.int16)
```

---

## Step 2 — Create Sound Objects

Add after the mixer initialization:

```python
# ── Sound effects ──────────────────────────────────────────────────────────────
# Generate all sounds at startup — not during gameplay (avoids frame drops).
# Each sound is a pygame.Sound object ready to .play() instantly.

def build_sounds():
    """Pre-generates all game sounds as pygame.Sound objects."""
    sounds = {}

    # Shoot sound: short high-to-low sweep (like a zap).
    shoot_array      = make_sweep_wave(800, 200, 0.06, volume=0.15)
    sounds['shoot']  = pygame.sndarray.make_sound(shoot_array)

    # Explosion: noise burst (harsh, percussive).
    explosion_array       = make_noise_wave(0.2, volume=0.35)
    sounds['explosion']   = pygame.sndarray.make_sound(explosion_array)

    # Death: long falling sweep (dramatic).
    death_array      = make_sweep_wave(600, 60, 1.0, volume=0.4)
    sounds['death']  = pygame.sndarray.make_sound(death_array)

    # Power-up: rising arpeggio (three tones overlaid).
    # Overlay by adding arrays.
    pu_a = make_sine_wave(400, 0.08, 0.2)
    pu_b = make_sine_wave(600, 0.08, 0.2)
    pu_c = make_sine_wave(800, 0.08, 0.2)
    # Pad shorter arrays to same length.
    max_len = max(len(pu_a), len(pu_b), len(pu_c))
    pu_a    = np.pad(pu_a, (0, max_len - len(pu_a)))
    pu_b    = np.pad(pu_b, (0, max_len - len(pu_b)))
    pu_c    = np.pad(pu_c, (0, max_len - len(pu_c)))
    powerup_array        = np.clip(pu_a.astype(np.int32) + pu_b + pu_c, -32767, 32767).astype(np.int16)
    sounds['powerup']    = pygame.sndarray.make_sound(powerup_array)

    # Multiplier up: rising short beep.
    mult_array       = make_sweep_wave(300, 700, 0.1, volume=0.2)
    sounds['mult_up'] = pygame.sndarray.make_sound(mult_array)

    return sounds

# Build sounds at startup.
try:
    SOUNDS = build_sounds()
    SOUND_ENABLED = True
except Exception as e:
    print(f"Sound disabled: {e}")
    SOUND_ENABLED = False   # numpy not installed, or mixer issue — game still works

def play_sound(name):
    """Plays a named sound if sound is enabled. Fails silently if not."""
    if SOUND_ENABLED and name in SOUNDS:
        SOUNDS[name].play()
```

**`np.clip(array, min, max)` explained:**

When adding two int16 arrays (each up to ±32767), the sum can exceed ±32767
(overflow). `np.clip` clamps values to the allowed range. Without it, integer
overflow produces loud distortion.

**The `try/except` block — graceful degradation:**

If numpy is not installed, `build_sounds()` will raise `ModuleNotFoundError`.
The `except Exception` catches it, sets `SOUND_ENABLED = False`, and the game
continues without sound. This is the correct approach — sound failure should
never crash the game.

---

## Step 3 — Wire Sound Calls

Add `play_sound(...)` calls at the appropriate moments:

```python
# In fire_bullet():
play_sound('shoot')

# In spawn_explosion() — only for enemy deaths, not grid touches:
play_sound('explosion')

# In handle_player_death() — after confirming no shield:
play_sound('death')

# In check_powerup_collection() — when collected:
play_sound('powerup')

# In check_bullet_enemy_collisions() — when multiplier increases:
old_mult = current_multiplier
kill_streak += 1
current_multiplier = kills_to_multiplier(kill_streak)
if current_multiplier > old_mult:
    play_sound('mult_up')
```

---

## Step 4 — High Score with File Persistence

Add before the game loop:

```python
# ── High score ─────────────────────────────────────────────────────────────────

HIGH_SCORE_FILE = 'highscore.txt'
                  # Saved in the same folder as main.py.
                  # In JavaScript, we used localStorage (browser key-value store).
                  # In Python, we write to a file (filesystem key-value store).
                  # Both persist between sessions — different storage, same idea.

def load_high_score():
    """
    Reads the high score from the file.
    Returns 0 if the file doesn't exist (first play).
    """
    try:
        with open(HIGH_SCORE_FILE, 'r') as f:
            return int(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0   # file doesn't exist or contains invalid data


def save_high_score(score):
    """
    Saves the high score to the file.
    'w' mode creates the file if it doesn't exist, overwrites if it does.
    """
    try:
        with open(HIGH_SCORE_FILE, 'w') as f:
            f.write(str(score))
    except IOError as e:
        print(f"Could not save high score: {e}")  # non-fatal


high_score = load_high_score()
```

**`with open(filename, mode) as f:` explained:**

`with` is a context manager — it ensures the file is properly closed after
the block, even if an exception occurs. `'r'` = read mode, `'w'` = write mode
(creates or overwrites). Always use `with` for file operations.

Update `trigger_game_over()` to save the high score:

```python
def trigger_game_over():
    global current_game_state, high_score
    if current_score > high_score:
        high_score = current_score
        save_high_score(high_score)
    current_game_state = GAME_STATE_GAME_OVER
```

Update `draw_overlay` to show both score and high score:

```python
# In game over overlay call:
draw_overlay(
    screen,
    'GAME OVER',
    f'Score: {current_score}    Best: {high_score}',
    'Press R to restart'
)
```

---

### SAVE AND TRY — Final

Save. Install numpy if needed: `pip install numpy`. Run `python main.py`.

**Test sounds:**
- Click mouse → brief zap sound on each shot
- Kill enemy → percussive noise burst
- Walk into enemy → falling tone (or absorbed if shielded)
- Collect power-up → rising three-note chime
- Build 5+ kill streak → brief rising beep when multiplier ticks up

**Test high score:**
Play a game. Note score at game over. Close the window. Reopen. Play again.
The "Best" display should show your previous high score.

**Check the file:**
Open `highscore.txt` in a text editor — should contain your best score as a number.

**Test sound disable:**
Temporarily uninstall numpy (`pip uninstall numpy`), run the game — should
start normally with "Sound disabled" in the terminal. Reinstall after testing.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Shoot sound on each bullet | Click → zap on each shot |
| Explosion sound on kills | Kill enemy → noise burst |
| Death sound on catch | Die → falling tone |
| Power-up sound on collect | Collect item → rising chime |
| Multiplier sound on increase | Kill streak 5 → rising beep |
| High score saves to file | Play → close → reopen → see Best score |
| High score loads on start | Best shown correctly from previous session |
| Game works without numpy | Handles missing numpy gracefully |
| `highscore.txt` created | File exists in `geometry_wars/` folder |

---

## What Is Next — LAB 10

LAB 10 is the final lab: a proper start screen, a score multiplier color trail
on bullets, enemy wave progression, and a summary of everything you've built
across JavaScript and Python.

---

*Continue to Geometry Wars — LAB 10 — Polish and Completion.*
