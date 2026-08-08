# Lesson 67: Sound Is a List of Numbers Taken Fast Enough

## What you will build

A real WAV audio file, constructed entirely from scratch — no audio
library at all, just `math.sin` and `struct` — starting from the actual
continuous-to-discrete sampling math and ending in a real, playable
440Hz tone and a real, correctly-timed metronome. Every claim verified
independently: the file's own header fields checked against Python's
stdlib `wave` module, the actual encoded frequency confirmed by counting
zero-crossings in the raw samples, and the metronome's click timing
confirmed by measuring real energy windows across the generated audio —
not assumed correct because the code looks reasonable.

## What you need to know first

- **Lesson 64** — `struct.pack`, byte order, and building a real binary
  file format (BMP) entirely by hand, verified against an independent
  tool. Today applies the identical discipline to WAV, a different real
  format with its own real structure.
- **Lesson 63** — `struct.pack`'s format-string mechanics, reused
  directly for WAV's own fixed-layout header.

---

## The Problem, in prose, no code yet

A sound — a musical note, a voice, anything audible — is, physically, a
continuous wave: air pressure varying smoothly over time. A computer
cannot store anything continuous; it can only store a finite sequence of
discrete numbers. Digital audio's entire foundation is a specific,
disciplined answer to that mismatch: measure the wave's amplitude at a
fixed rate, many thousands of times per second, and store that long
sequence of individual measurements — a **sample rate** — trusting that
sampling fast enough captures the wave closely enough for later
playback to sound like the real thing. This lesson builds that process
by hand, from the raw math outward, rather than starting from a
library's `generate_tone()` call.

---

## Concept Unit: Turning a Continuous Wave Into Discrete Numbers

### The Problem

A sine wave — the simplest possible pure tone — is a continuous
mathematical function. Before it can be stored in a file at all, it has
to be reduced to a finite list of numbers, measured at specific, evenly
spaced moments in time.

### Introduce the concept in isolation

```python
import math

SAMPLE_RATE = 44100  # samples per second, a real, standard CD-quality rate
frequency = 440      # A4, concert pitch
duration_seconds = 0.001

sample_count = int(SAMPLE_RATE * duration_seconds)
samples = []
for i in range(sample_count):
    time_in_seconds = i / SAMPLE_RATE
    amplitude = math.sin(2 * math.pi * frequency * time_in_seconds)
    pcm_value = int(amplitude * 32767)
    samples.append(pcm_value)

for i, s in enumerate(samples):
    print(f"  t={i/SAMPLE_RATE*1000:.3f}ms  amplitude={s}")
```

Run it (excerpt):

```
  t=0.000ms  amplitude=0
  t=0.023ms  amplitude=2052
  t=0.045ms  amplitude=4097
  ...
  t=0.567ms  amplitude=32766
  t=0.590ms  amplitude=32709
  ...
```

What this proves: `time_in_seconds = i / SAMPLE_RATE` converts a plain
sample index into the real moment in time it represents — sample `0` is
`t=0`, sample `44100` (one full second later, at this rate) would be
`t=1.0`. `math.sin(2 * math.pi * frequency * time_in_seconds)` (**first
appearance of generating a waveform mathematically** in this
curriculum) evaluates the sine function at that exact moment, producing
a value between `-1.0` and `1.0` — the wave's amplitude at that instant.
`int(amplitude * 32767)` (**first appearance of PCM quantization**,
Pulse Code Modulation — audio's standard uncompressed representation)
scales that continuous `-1.0`–`1.0` range into the actual integer range
a 16-bit signed sample can hold (`-32768` to `32767`). The printed
values rise smoothly toward the wave's peak near `32767` and would, if
printed further, fall back down and go negative — a real sine shape,
built one discrete measurement at a time.

This lab is deleted now; it never appears in the project. What survives
is the exact sampling formula, reused directly in the real tone
generator.

### CS Lens

This is **sampling** in the formal digital signal processing sense —
representing a continuous signal by measuring it at a fixed rate,
governed by the **Nyquist theorem** (named directly, not built from
scratch here): a sample rate can only faithfully represent frequencies
up to half the sample rate itself, which is exactly why 44,100Hz — a bit
more than double the roughly 20,000Hz upper limit of human hearing — is
CD audio's own real, historically chosen standard rate.

Also recognized in: Lesson 39's own macro recorder sampling real-time
keyboard/mouse events at irregular intervals rather than a fixed rate (a
related but distinct concept — event-driven versus time-driven
sampling), any analog-to-digital converter in real hardware, video's own
frame rate being exactly this same sampling idea applied to a visual
signal instead of an audio one.

### SE Lens

`32767`, not `32768`, is the correct scaling factor — a 16-bit signed
integer's range is asymmetric, `-32768` to `32767`, and scaling by the
larger magnitude would allow computed values to exceed the representable
positive range on values very close to `1.0`. A small, easy-to-miss
detail, exactly the kind Lesson 65's own clamping discussion already
argued is worth getting right explicitly rather than trusting downstream
code to compensate.

---

## Concept Unit: A Real WAV File, Byte by Byte

### Project Change

- **Reference Source:** The WAV/RIFF file format specification (a
  Microsoft/IBM standard, built on the general-purpose RIFF container
  format), followed field by field below.
- **Files affected:** new file, `audio_tools.py`.
- **Change type:** add.
- **Dependencies:** `math`, `struct` — standard library only.

### The New Code

```python
def build_wav_bytes(samples):
    sample_bytes = struct.pack(f"<{len(samples)}h", *samples)

    byte_rate = SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE // 8
    block_align = CHANNELS * BITS_PER_SAMPLE // 8
    data_size = len(sample_bytes)

    fmt_chunk = struct.pack(
        "<4sIHHIIHH",
        b"fmt ", 16,
        1,                 # audio format: 1 = PCM (uncompressed)
        CHANNELS,
        SAMPLE_RATE,
        byte_rate,
        block_align,
        BITS_PER_SAMPLE,
    )
    data_chunk_header = struct.pack("<4sI", b"data", data_size)

    riff_body = b"WAVE" + fmt_chunk + data_chunk_header + sample_bytes
    riff_header = struct.pack("<4sI", b"RIFF", len(riff_body))

    return riff_header + riff_body
```

### Mechanical Walkthrough

- `struct.pack(f"<{len(samples)}h", *samples)` — **first appearance of
  a dynamically-sized `struct` format string.** `h` means signed 16-bit
  integer (a **hard concept reappearing** from Lesson 64's `H`, here
  lowercase for *signed* rather than unsigned); prefixing it with a
  count (`f"{len(samples)}h"`) tells `struct.pack` to expect and pack
  *that many* individual `h`-sized values in one call — necessary here
  because the number of samples varies with the requested duration,
  unlike every fixed-shape header this curriculum has packed before.
  `*samples` (reused argument-unpacking) spreads the whole list out as
  individual positional arguments, since `struct.pack` expects each
  value as a separate argument, not one list.
- WAV's own real structure — a `RIFF` container holding a `WAVE` type
  marker, then a `fmt ` chunk (note the trailing space — a real,
  required part of the 4-byte chunk name) describing *how* the audio is
  encoded, then a `data` chunk holding the actual samples — is itself a
  **hard concept reappearing** from Lesson 64's PNG chunk structure:
  self-describing blocks, each stating its own type and size, this time
  applied to audio instead of images.
- `byte_rate` and `block_align` — both fully *derivable* from the other
  fields (sample rate, channel count, bit depth) rather than independent
  data, but WAV's specification stores them explicitly anyway, so a
  reader never has to recompute them — the identical "state what you
  already know rather than making the reader infer it" principle Lesson
  45's nonce-prepending and Lesson 51's explicit type choices already
  established.
- The two length fields — `16` for the `fmt ` chunk (always exactly 16
  bytes for uncompressed PCM) and `len(riff_body)` for the outer RIFF
  chunk (computed, not guessed, from the actual assembled content) —
  both real, checkable sizes a correct reader depends on to know where
  each chunk actually ends.

### Run it — Verified Against Python's Own `wave` Module

```python
tone_samples = generate_sine_samples(440, 0.5)
save_wav("tone_440hz.wav", tone_samples)
```

```
tone: 22050 samples, 0.500s
```

Read back with no relation to this lesson's own writing code — Python's
standard library `wave` module, parsing the file purely from its own
bytes:

```python
import wave
w = wave.open("tone_440hz.wav", "rb")
print("channels:", w.getnchannels())
print("sample width (bytes):", w.getsampwidth())
print("frame rate:", w.getframerate())
print("num frames:", w.getnframes())
```

```
channels: 1
sample width (bytes): 2
frame rate: 44100
num frames: 22050
```

Every field matches exactly what this lesson's own writer intended —
confirmed by an independent reader, the same verification discipline
Lesson 64 applied to BMP and PNG.

### Verifying the Actual Sound, Not Just the Header

A correct header proves the *file* is well-formed — it says nothing
about whether the *encoded audio* actually sounds like a 440Hz tone.
That needs checking the samples themselves:

```python
zero_crossings = 0
for i in range(1, len(samples)):
    if (samples[i-1] < 0 and samples[i] >= 0) or (samples[i-1] >= 0 and samples[i] < 0):
        zero_crossings += 1

duration = len(samples) / 44100
estimated_frequency = zero_crossings / 2 / duration
print("estimated frequency:", estimated_frequency, "Hz (expected 440 Hz)")
```

```
zero crossings: 439
estimated frequency: 439.0 Hz (expected 440 Hz)
```

A sine wave crosses zero exactly twice per full cycle — counting real
zero crossings in the actual decoded samples and dividing by `2 ×
duration` gives a direct, independent measurement of the encoded
frequency, landing within 1Hz of the intended `440`, the tiny remaining
gap fully explained by the sample count not containing an exact whole
number of cycles at this specific duration.

### CS Lens

This is **signal analysis** applied to verification rather than
processing — using a real property of the waveform itself (its
zero-crossing rate) to independently measure a claim about the data,
rather than trusting the generation code's own stated intent. The same
"don't just trust the writer, check the actual artifact" principle
Lesson 64 applied by reopening a hand-built BMP with Pillow.

### SE Lens

Checking WAV header correctness and checking actual signal content are
two genuinely different verifications, and this lesson deliberately does
both: a file could have a perfectly correct header while containing
silence, noise, or the wrong frequency entirely — the header describes
the *shape* of the data, never its *content*, and only inspecting the
real samples can confirm the content is actually right.

---

## Concept Unit: The Metronome — Composing Tones and Silence

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `audio_tools.py`.
- **Change type:** add.
- **Location:** below `build_wav_bytes`.

### The New Code

```python
def generate_silence(duration_seconds):
    return [0] * int(SAMPLE_RATE * duration_seconds)


def generate_metronome(bpm, click_count, click_frequency=1000, click_duration=0.03):
    seconds_per_beat = 60 / bpm
    silence_duration = seconds_per_beat - click_duration
    samples = []
    for _ in range(click_count):
        samples.extend(generate_sine_samples(click_frequency, click_duration, amplitude=0.8))
        samples.extend(generate_silence(silence_duration))
    return samples
```

### Mechanical Walkthrough

- `generate_silence` — reused list repetition (`[0] * count`); a silent
  sample is simply a sample whose amplitude is exactly `0`, no different
  in kind from any other PCM value, just the specific value representing
  "no displacement from resting pressure."
- `seconds_per_beat = 60 / bpm` — reused arithmetic, converting a
  musical tempo (beats per *minute*) into a per-beat duration in seconds
  — `120` BPM means exactly `0.5` seconds between beats.
- `generate_metronome`'s loop — for each click, extends the growing
  `samples` list with a short tone burst, then a matching stretch of
  silence sized so the *combined* click-plus-silence duration equals
  exactly one full beat — `samples.extend(...)` (reused list method)
  concatenating each piece directly onto the end, building one long,
  continuous waveform out of alternating tone and silence segments.

### Run it

```python
metronome_samples = generate_metronome(bpm=120, click_count=8)
save_wav("metronome_120bpm.wav", metronome_samples)
```

```
metronome: 176400 samples, 4.000s
```

Verifying the actual click timing, not just the total duration —
computing real RMS (root-mean-square) energy across small windows of
the decoded audio to distinguish loud (click) regions from quiet
(silence) ones:

```python
window_size = 441  # 10ms
loud_windows = [
    (sum(s*s for s in samples[i*window_size:(i+1)*window_size]) / window_size) ** 0.5 > 1000
    for i in range(len(samples) // window_size)
]
click_starts = [
    i * window_size / 44100 for i in range(len(loud_windows))
    if loud_windows[i] and (i == 0 or not loud_windows[i-1])
]
print("detected click count:", len(click_starts))
print("intervals:", [round(click_starts[i+1] - click_starts[i], 3) for i in range(len(click_starts)-1)])
```

```
detected click count: 8
intervals: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]
```

Exactly 8 real, detected clicks — matching the requested `click_count`
exactly — spaced exactly `0.5` seconds apart, matching `120` BPM's own
real, computed beat interval exactly. (An earlier, simpler attempt at
this same check — counting raw threshold crossings sample by sample,
rather than RMS energy over small windows — incorrectly reported 480
"clicks," one for every individual wave cycle within each click burst
rather than one per burst; RMS-over-windows was needed specifically to
detect the *envelope* of loudness rather than the raw oscillation
itself.)

### CS Lens

Building a longer, structured waveform by concatenating shorter
segments — tone, then silence, then tone again — is exactly the same
compositional idea as Lesson 55's JSON values nesting inside other
values, or Lesson 57's paragraphs and headings sequenced one after
another: complex structure built from simple pieces placed in sequence,
here at the level of raw audio samples rather than text or nested data.

### SE Lens

The RMS-based click detector's own correction — counting energy over
small time windows rather than raw sample-by-sample threshold crossings
— is a direct, concrete instance of choosing the right granularity for
a measurement, the identical lesson Lesson 66's own pixel-versus-module
corruption experiment already taught in a different domain: measuring at
too fine a granularity can produce a technically-accurate but practically
misleading result.

---

## Connect the pieces

One tone, `440`Hz, followed through the whole lesson: `generate_sine_samples`
evaluates `math.sin` at 44,100 evenly-spaced moments per second,
quantizing each continuous amplitude into a 16-bit PCM integer.
`build_wav_bytes` wraps that raw sample data in WAV's real RIFF
container structure, byte-exact per the real specification. Reopened by
Python's own independent `wave` module, every header field matches;
counting real zero-crossings in the decoded samples confirms the
encoded frequency is genuinely `439`–`440`Hz, not merely claimed to be.
`generate_metronome` reuses the identical sampling function to build
short click bursts, interleaved with matching silence, into one long
composed waveform — verified, at the correct energy-window granularity,
to produce exactly the requested number of clicks at exactly the
requested tempo.

## What breaks without this

Already demonstrated directly: measuring the metronome's clicks at the
wrong granularity (raw sample-level threshold crossings instead of
energy over small windows) produced a wildly wrong count — 480 instead
of the real 8 — not because the underlying audio was wrong, but because
the *measurement* was checking the wrong thing, the same category of
mistake Lesson 66 made and caught with its own first, pixel-level
corruption test.

## Definition of done

- [ ] `build_wav_bytes`'s output, reopened with Python's `wave` module,
      reports the exact channel count, sample width, frame rate, and
      frame count this lesson's own writer intended.
- [ ] Zero-crossing analysis of a generated 440Hz tone's real samples
      estimates a frequency within 1Hz of 440.
- [ ] RMS-window analysis of a generated metronome correctly counts the
      exact requested number of clicks, spaced at the exact requested
      BPM interval.
- [ ] You can explain, without looking back at this lesson, why `32767`
      rather than `32768` is the correct PCM scaling factor.
- [ ] You can explain why the metronome's click count needed RMS-window
      analysis rather than raw threshold-crossing counting to measure
      correctly.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add audio_tools.py
  git commit -m "Add from-scratch WAV tone generator and metronome, verified via stdlib wave module, zero-crossing frequency analysis, and RMS-window click detection"
  ```

## What's next

This closes Track 9. Every from-scratch binary and media format this
track and Track 8 built — RLE, Huffman, BMP, PNG headers, QR modules,
and now raw PCM audio — shares one underlying discipline this
curriculum has now applied six separate times: build or inspect the
real bytes directly, then verify independently, at the correct
granularity, against a trusted second implementation rather than
trusting the writing code's own stated intent.
