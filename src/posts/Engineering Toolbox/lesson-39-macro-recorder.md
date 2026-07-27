# Lesson 39: Recording Isn't Just What Happened — It's When

## What you will build

A macro recorder and player: something that records a sequence of
keyboard and mouse actions along with the real time gaps between them,
saves that sequence to a file, and can replay it later — reproducing not
just *what* was done, but the same pacing it was originally done at. The
transferable problem this lesson is actually about: a macro that replays
every action back-to-back as fast as possible is not the same recording
as one that respects the original timing, and for many real macros
(anything interacting with a slower system that needs a moment to
respond between steps) that difference is the entire point.

## What you need to know first

- **Lesson 38** — the dependency-injection pattern this lesson reuses
  directly: yesterday's `watch_clipboard` took clipboard access as a
  parameter rather than calling a fixed OS function internally; today's
  `MacroPlayer.play` takes a `perform_action` function the same way, for
  the same reason.
- **Lesson 32/33** — `time.monotonic()` for measuring real elapsed time,
  reused unchanged.
- **Lesson 29** — reading and writing JSON, reused for saving and
  loading a recorded macro to disk.

---

## The Problem, in prose, no code yet

A "macro" — a recorded sequence of keyboard and mouse actions, replayed
later to repeat some manual task automatically — sounds like it only
needs to remember *what* happened: press this key, click here, type
that. But real manual tasks aren't instant, and neither is whatever the
macro is interacting with — a program that takes a moment to open a
menu, a webpage that takes a moment to load. A macro that replays every
recorded action as fast as the computer can execute them, with none of
the original pauses, will frequently arrive at the third step before
whatever it's interacting with was even ready for the second one. The
fix is recording *timing* as a first-class part of the macro, not an
afterthought — which is what makes this lesson genuinely different from
just "storing a list of actions."

---

## Concept Unit: Measuring the Gap Between Events

### The Problem

Recording "what happened" is one problem; recording "how long between
each thing" is a separate one, and it's worth isolating before combining
it with any actual recording machinery.

### Introduce the concept in isolation

```python
import time

last_event_time = time.monotonic()
recorded_delays = []

for step_number in range(3):
    time.sleep(0.1 * (step_number + 1))  # stands in for "however long until the next real event"
    now = time.monotonic()
    delay = now - last_event_time
    recorded_delays.append(delay)
    last_event_time = now

for step_number, delay in enumerate(recorded_delays, start=1):
    print(f"event {step_number}: {delay:.3f}s after the previous one")
```

Run it:

```
event 1: 0.100s after the previous one
event 2: 0.200s after the previous one
event 3: 0.300s after the previous one
```

What this proves: each `delay` measures the gap since the *previous*
event specifically, not since recording started — event 3's `0.300s`
reflects only the third `sleep`, not the accumulated total of all three
(which would be `0.600s`). This is the exact quantity a later replay
needs: "wait this long, then do the next thing," one step at a time.

This lab is deleted now; it never appears in the project. The technique —
track the previous event's timestamp, subtract, then update it — survives
directly into the recorder next.

### CS Lens

This is **inter-arrival time** — the gap between consecutive events in a
sequence, as opposed to each event's absolute timestamp. Storing
inter-arrival times rather than absolute times is what makes a recording
replayable starting at *any* later moment: absolute timestamps would be
meaningless the next time the macro runs, hours or days later, while
gaps between steps remain exactly as meaningful as they were originally.

Also recognized in: video and audio codecs, which store frame/sample
timing as deltas rather than absolute time for the same replayability
reason, network packet capture tools (Wireshark shows inter-packet
timing, not just packet content), MIDI files (musical notes stored with
delays between them, not wall-clock times).

### SE Lens

Storing absolute timestamps instead would work for a macro replayed
immediately after recording, but silently break the instant it's saved,
closed, and replayed later — exactly the kind of bug that passes a quick
manual test and fails the first time the tool is actually used the way
it's meant to be used (recorded once, replayed repeatedly, later).
Choosing relative gaps from the start avoids that failure mode entirely
rather than discovering it after the fact.

---

## Concept Unit: The Recorder

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `macro.py`.
- **Change type:** add.
- **Dependencies:** `time`, `json` — both standard library.

### The New Code

```python
class MacroEvent:
    def __init__(self, event_type, detail, delay_before_seconds):
        self.event_type = event_type
        self.detail = detail
        self.delay_before_seconds = delay_before_seconds

    def __repr__(self):
        return f"MacroEvent({self.event_type!r}, {self.detail!r}, delay={self.delay_before_seconds:.3f}s)"


class MacroRecorder:
    def __init__(self):
        self.events = []
        self.last_event_time = None

    def on_event(self, event_type, detail):
        now = time.monotonic()
        delay_before_seconds = 0.0 if self.last_event_time is None else now - self.last_event_time
        self.events.append(MacroEvent(event_type, detail, delay_before_seconds))
        self.last_event_time = now
```

### The Updated Project

Two new, freestanding classes with nothing surrounding them yet.

### Mechanical Walkthrough

- `MacroEvent.__init__` and `__repr__` — a **hard concept reappearing**,
  the same small data-class shape Lesson 37's `CheckResult` already
  established.
- `self.last_event_time = None` — reused `None` as "nothing recorded
  yet," the same sentinel pattern Lesson 38's `watch_clipboard` used for
  `last_seen_value`.
- `on_event(self, event_type, detail)` — this method's name and shape are
  deliberate: it's written to be usable as a **callback** — a function
  handed to some other piece of code (a real OS keyboard/mouse listener,
  in the concept unit near the end of this lesson) to be *called by that
  code* whenever a real event occurs, rather than being called directly
  by this program's own control flow. Nothing about `MacroRecorder`
  itself knows or cares what will eventually call `on_event` — a design
  choice the next unit's honest limitation depends on directly.
- `0.0 if self.last_event_time is None else now - self.last_event_time`
  — reused conditional expression; the very first recorded event gets a
  `0.0` delay (there's nothing before it to measure a gap against), and
  every subsequent event reuses the previous unit's proven technique.

### Run it

```python
recorder = MacroRecorder()
recorder.on_event("key_press", "h")
time.sleep(0.05)
recorder.on_event("key_press", "i")
time.sleep(0.15)
recorder.on_event("mouse_click", (100, 200))

for event in recorder.events:
    print(event)
```

```
MacroEvent('key_press', 'h', delay=0.000s)
MacroEvent('key_press', 'i', delay=0.050s)
MacroEvent('mouse_click', (100, 200), delay=0.150s)
```

Each recorded delay matches the real `time.sleep` call that preceded it
— `0.050s` after a real `0.05` second wait, `0.150s` after a real `0.15`
second wait — proving `on_event` correctly measured real elapsed time
between calls, not just recorded a fixed placeholder.

### CS Lens

`on_event` as a callback, with no assumption about *who* calls it or
*why*, is the **observer pattern** — the recorder observes events by
being told about them, rather than by actively going out and looking for
them, the same structural shape Lesson 14's directory watcher used for
filesystem events.

### SE Lens

Because `MacroRecorder` has no dependency on any specific event source,
it can be tested completely — as it just was — without any real keyboard
or mouse involved at all, exactly the same testability win Lesson 38's
injected `read_clipboard` provided. The real OS integration, wired up
later in this lesson, will call `on_event` from inside a real listener's
own callback — but `MacroRecorder`'s own correctness never depended on
that integration existing or working.

---

## Concept Unit: Saving and Loading, and What JSON Quietly Changes

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `macro.py`.
- **Change type:** add.
- **Location:** `to_dict`/`from_dict` added to `MacroEvent`; `save`
  added to `MacroRecorder`.

### The New Code

```python
    def to_dict(self):
        return {
            "event_type": self.event_type,
            "detail": self.detail,
            "delay_before_seconds": self.delay_before_seconds,
        }

    @staticmethod
    def from_dict(data):
        return MacroEvent(data["event_type"], data["detail"], data["delay_before_seconds"])
```

```python
    def save(self, file_path):
        with open(file_path, "w") as macro_file:
            json.dump([event.to_dict() for event in self.events], macro_file, indent=2)
```

### Mechanical Walkthrough

- `to_dict` / `from_dict` — a **hard concept reappearing** from Lesson
  29's JSON-in/JSON-out REST API work: converting between a Python
  object and a plain `dict` of only JSON-representable values
  (strings, numbers, lists, nested dicts) before/after serialization.
- `@staticmethod` — **first appearance in this curriculum.** A method
  marked `@staticmethod` doesn't receive `self` at all — `from_dict` is
  called as `MacroEvent.from_dict(data)`, on the *class* itself, not on
  an existing instance, because its whole purpose is *creating* a new
  instance from raw data, and there is no existing instance yet to call
  it on.
- `json.dump([...], macro_file, indent=2)` — a **hard concept
  reappearing**; `indent=2` (also reused) formats the output with
  readable line breaks and indentation rather than one dense line,
  purely for human readability of the saved file.

### Run it

```python
recorder.save("greeting.macro.json")
print(open("greeting.macro.json").read())
```

```json
[
  {
    "event_type": "key_press",
    "detail": "h",
    "delay_before_seconds": 0.0
  },
  {
    "event_type": "key_press",
    "detail": "i",
    "delay_before_seconds": 0.050137729999995884
  },
  {
    "event_type": "mouse_click",
    "detail": [
      100,
      200
    ],
    "delay_before_seconds": 0.1501348350000029
  }
]
```

Look closely at the `mouse_click` event's `detail`: it was recorded as
the Python tuple `(100, 200)`, but the saved file shows a JSON *array*,
`[100, 200]` — because JSON has no separate concept of "tuple" versus
"list" at all, only one ordered-sequence type. Loading this file back
(the `MacroPlayer.load` unit below) will hand `perform_action` a Python
`list`, `[100, 200]`, not the original tuple — confirmed directly in that
unit's own run.

### CS Lens

This is **lossy serialization** — not lossy in the sense of losing
*data* (both `100` and `200` come back exactly), but lossy in the sense
of losing *type information* that JSON's format simply has no way to
represent. Every serialization format has some version of this: JSON has
no tuple/list distinction and no way to distinguish an integer from a
float that happens to have no fractional part in some implementations;
Python's own `pickle` format, by contrast, *would* preserve the tuple —
at the cost of no longer being readable by any non-Python program at all.

Also recognized in: CSV files losing all type information entirely
(everything becomes a string), XML historically struggling to represent
lists cleanly, any cross-language API boundary where each side's native
type system doesn't map perfectly onto the wire format in between.

### SE Lens

A caller of `perform_action` that assumes `detail` will always be
exactly the type it was recorded as would have a latent bug here,
triggered only by the save/load round trip and invisible if the macro
happens to be replayed in the same process it was recorded in without
ever touching disk. This is worth naming as real, existing behavior of
this lesson's own code — not fixed here, since fixing it (e.g., storing
an explicit type tag for each `detail` and reconstructing the exact
original type on load) is a reasonable improvement past this lesson's
scope, not a hidden defect being glossed over.

---

## Concept Unit: The Player

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `macro.py`.
- **Change type:** add.
- **Dependencies:** `MacroEvent.from_dict`, from the previous unit.

### The New Code

```python
class MacroPlayer:
    def __init__(self, events):
        self.events = events

    @staticmethod
    def load(file_path):
        with open(file_path) as macro_file:
            raw_events = json.load(macro_file)
        return MacroPlayer([MacroEvent.from_dict(data) for data in raw_events])

    def play(self, perform_action):
        for event in self.events:
            time.sleep(event.delay_before_seconds)
            perform_action(event.event_type, event.detail)
```

### Mechanical Walkthrough

- `load` — another `@staticmethod`, the same reasoning as `from_dict`:
  it constructs a brand-new `MacroPlayer` from a file, so there's no
  existing instance to call it on yet.
- `[MacroEvent.from_dict(data) for data in raw_events]` — reused list
  comprehension, rebuilding real `MacroEvent` objects from the plain
  dictionaries `json.load` produced.
- `play(self, perform_action)` — the dependency-injection pattern named
  directly in the Recorder unit's SE lens, now on the replay side:
  `perform_action` is a function supplied by the caller, taking
  `(event_type, detail)` and actually *doing* something with it —
  `MacroPlayer` itself has no idea whether that means pressing a real
  key, clicking a real mouse button, or (as in this lesson's own test)
  just logging what would have happened.
- `time.sleep(event.delay_before_seconds)` — a **hard concept
  reappearing** from Lesson 33 onward; called *before* each action, not
  after, which is the detail that makes replay timing match recording
  timing: the delay recorded alongside an event was the gap *before*
  that event happened, so replaying it correctly means waiting first,
  then acting.

### Run it

```python
player = MacroPlayer.load("greeting.macro.json")

def fake_perform_action(event_type, detail):
    print(f"performing: {event_type} {detail!r} (type: {type(detail).__name__})")

start = time.monotonic()
player.play(fake_perform_action)
elapsed = time.monotonic() - start
print(f"total replay time: {elapsed:.3f}s")
```

```
performing: key_press 'h' (type: str)
performing: key_press 'i' (type: str)
performing: mouse_click [100, 200] (type: list)
total replay time: 0.201s
```

Two things confirmed at once: the total replay time, `0.201s`, matches
the sum of the three recorded delays (`0.0 + 0.050 + 0.150 = 0.200`,
close enough to account for the small, real overhead of actually running
Python code between sleeps) — proving the original pacing was genuinely
reproduced, not collapsed into an instant replay. And the third event's
`detail` prints as `[100, 200]`, `type: list` — exactly the tuple-to-list
change predicted in the previous unit, now observed directly rather than
just reasoned about.

### CS Lens and SE Lens

Both already covered under the Recorder unit above — `play`'s
`perform_action` parameter is the identical dependency-injection pattern,
applied to the opposite direction (consuming events instead of producing
them), so no new lens content is owed here beyond naming that
symmetry, per the Repetition Rule.

---

## Concept Unit: The Real OS Hooks, Honestly

### The Problem

`on_event` and `perform_action` are both designed to be wired to real
keyboard and mouse access — but, as with Lesson 38's clipboard access,
that access is fundamentally OS- and display-server-specific, and this
lesson's environment has real, honest limits worth confronting directly
rather than glossing over.

### Commands needed

```
$ .venv/bin/pip install --quiet pynput
$ .venv/bin/python3 -c "from pynput import keyboard"
```

`pynput` (**first appearance**) is a real, widely-used package for
exactly this: listening to and generating keyboard and mouse events
across Windows, macOS, and Linux.

### Run it — the real, honest result in this environment

```
Traceback (most recent call last):
  ...
  File ".venv/lib/python3.12/site-packages/pynput/_util/__init__.py", line 80, in backend
    raise ImportError(
ImportError: this platform is not supported: ('failed to acquire X connection: Bad display name ""', DisplayNameError(''))

Try one of the following resolutions:

 * Please make sure that you have an X server running, and that the DISPLAY environment variable is set correctly
```

This fails even earlier than Lesson 38's `pyperclip` did — `pyperclip`
failed only when `copy()` was actually called; `pynput` fails at the
`import` statement itself, because it needs to select which OS-specific
backend to use the moment it loads, and — for the identical underlying
reason Lesson 38 traced in detail — this headless container has no X11
display server for it to connect to at all.

On a real machine with an actual desktop session, the intended usage
looks like this (documented from `pynput`'s own reference, not executed
here):

```python
from pynput import keyboard, mouse

recorder = MacroRecorder()

keyboard_listener = keyboard.Listener(
    on_press=lambda key: recorder.on_event("key_press", str(key))
)
mouse_listener = mouse.Listener(
    on_click=lambda x, y, button, pressed: recorder.on_event("mouse_click", (x, y)) if pressed else None
)
keyboard_listener.start()
mouse_listener.start()
```

Read against `MacroRecorder`'s own code above: `on_press`/`on_click` are
`pynput`'s own callback parameters, called by `pynput`'s internal
listener machinery every time a real key or click occurs — each one
wired here, via a small `lambda` (an anonymous inline function), directly
to the same `recorder.on_event` this lesson already built and fully
tested. Nothing about `MacroRecorder` itself needs to change to support
this — exactly the payoff named in that unit's own SE lens.

### CS Lens and SE Lens

Both already fully covered — this unit is a direct instance of the
layered-dependency-failure pattern (CS lens) and the environment-specific
honest-limitation practice (SE lens) Lesson 38 already established in
detail; repeating that explanation in full here would violate the
Repetition Rule rather than honor it.

---

## Connect the pieces

One recorded key press, followed through everything built today:
`recorder.on_event("key_press", "h")` measures the real gap since the
previous event and stores a `MacroEvent`. `recorder.save(...)` serializes
every stored event to JSON, `to_dict()` reducing each one to plain,
JSON-safe values. `MacroPlayer.load(...)` reads that file back,
`from_dict()` reconstructing `MacroEvent` objects — though, as directly
demonstrated, not necessarily with every original Python type intact.
`player.play(perform_action)` walks the reconstructed events in order,
sleeping the recorded gap before each one and handing it to whatever
`perform_action` the caller supplied — on a real desktop, ultimately
`pynput`'s own key-press-simulation functions; in this lesson's own
verification, a simple `print`.

## What breaks without this

Remove the `time.sleep(event.delay_before_seconds)` line from `play` and
rerun the same three-event macro:

```python
def fake_perform_action(event_type, detail):
    print(f"performing: {event_type} {detail!r}")

start = time.monotonic()
player.play(fake_perform_action)
print(f"total replay time: {time.monotonic() - start:.3f}s")
```

```
performing: key_press 'h'
performing: key_press 'i'
performing: mouse_click [100, 200]
total replay time: 0.000s
```

Every action still fires, in the correct order, with the correct data —
but the entire recorded rhythm is gone: what took a real 0.2 seconds to
perform originally now replays in effectively zero time. For a macro
interacting with anything that needs a moment to respond between steps,
this is the exact difference between a macro that works and one that
fires its second action before the system it's driving was ready for the
first.

## Definition of done

- [ ] `MacroRecorder.on_event`, called with real `time.sleep` gaps
      between calls, records delays that match those real gaps.
- [ ] `MacroRecorder.save` followed by `MacroPlayer.load` round-trips
      every event's `event_type` and `delay_before_seconds` exactly, and
      you can explain why a tuple `detail` comes back as a list instead.
- [ ] `MacroPlayer.play`'s total real elapsed time approximately matches
      the sum of all recorded delays — not zero, and not the sum plus one
      long extra pause.
- [ ] You can explain, without looking back at this lesson, why
      `time.sleep` is called *before* `perform_action` inside the loop,
      not after.
- [ ] You can explain why `pynput` fails at `import` time in this
      environment specifically, and what would need to be true of a
      different machine for the same code to work unmodified.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add macro.py
  git commit -m "Add macro recorder/player with real inter-event timing, JSON save/load, and OS input wired via dependency injection so the core logic needs no display server to test"
  ```

## What's next

Lesson 40's "launch a program at OS startup" lesson and this lesson's
`pynput` integration share a theme worth naming now: both depend on
capabilities (a display session, an OS-level startup hook) that this
sandboxed environment cannot provide, and both lessons handle that the
same honest way — real, tested logic wherever the environment allows it,
clearly documented and unexecuted code wherever it genuinely can't.
