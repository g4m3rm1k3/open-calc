# Lesson 16: The Same Hand-Off, a Different Kind of File

**What you will build:** a real video, recorded by handing off to
Android's own Camera app exactly the way Lesson 14 already did for a
still photo, played back on screen through Kivy's own `Video` widget.
The transferable problem: this lesson is deliberately *not* a large
new mechanism — `take_video` mirrors `take_picture` almost exactly —
so what actually needs care here is recognizing which parts genuinely
repeat unchanged and which one part, playback itself, is real and new.

**What you need to know first:** Lesson 14's `take_picture`/callback
shape in full — this lesson's own `take_video` reuses it directly.
Lesson 15's `Image`/property change-detection — `Video`'s own `state`
property is the same kind of Kivy property, covered directly below.

**Terms introduced in this lesson:** none — this lesson's real content
is new *objects*, not new underlying concepts; see the Connect the
Pieces section for exactly which prior lessons it reuses unchanged.

**Objects and methods this lesson uses:**
- **`camera.take_video(filename, on_complete)`**
  - *What it is:* the video-recording counterpart to
    `take_picture`.
  - *Implementation:* identical shape to `take_picture` in every
    respect — same asynchronous hand-off to the Camera app, same
    `on_complete(filename)` callback, same `True`-to-delete return
    convention.
  - *Its use:* this lesson's actual recording call — nothing about
    calling it differs from Lesson 14's own photo call.
- **`kivy.uix.video.Video`**
  - *What it is:* a widget that plays a video file on screen.
  - *Implementation:* `source` is the file path to play, the same
    property shape `Image.source` already established; `state` is a
    separate property controlling playback — setting it to `"play"`
    starts playback, `"stop"` halts it, `"pause"` freezes it in place.
  - *Its use:* where Lesson 14's video-equivalent output actually
    plays back.

---

## Concept Unit: Recognizing What Doesn't Need Re-Proving

### The Problem

A lesson that re-proves every mechanism from scratch, even ones
already fully established, wastes real effort on ideas that don't need
it. `take_video`'s entire asynchronous shape — return immediately,
deliver a real result later through a callback, `True` deletes the
file — is *identical* to `take_picture`'s, already proven completely
in Lesson 14's own Step 1. The one genuinely new idea this lesson adds
is narrower: a `Video` widget's `state` property, a real, different
kind of property than `Image.source` — one that controls an ongoing
action (play/pause/stop) rather than simply pointing at content to
display once.

### Introduce the Concept in Isolation — Step 1: Proving `state` Is an Ordinary Kivy Property, Not a Special One

**Runs on the desktop**, using the identical technique Lesson 15
already proved — no real video file needed to establish this specific
point, since what's being proven is the *property mechanism* itself,
not real playback:

```python
from kivy.event import EventDispatcher
from kivy.properties import OptionProperty


class FakeVideo(EventDispatcher):
    state = OptionProperty("stop", options=["play", "pause", "stop"])


def on_state_change(instance, value):
    print("state changed to:", value)


video = FakeVideo()
video.bind(state=on_state_change)

video.state = "play"
video.state = "play"  # same value again
video.state = "stop"
```

Run it. Expected output — **two lines, not three**, for the exact same
reason Lesson 15's own `StringProperty` proof already established:

```
state changed to: play
state changed to: stop
```

`OptionProperty` — used here instead of `StringProperty` only because
`Video.state` is real Kivy, itself restricted to exactly `"play"`,
`"pause"`, or `"stop"`, not an arbitrary string — is still the same
family of Kivy property, with the identical change-detection behavior
already proven. This confirms `state` needs no separate mental model
from `source` — both are ordinary Kivy properties, reacting only to
genuine changes.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — `camera.take_video`
is confirmed identical in shape to `take_picture` by reading Plyer's
own real source, already read in full for Lesson 14; `kivy.uix.video.Video`
is confirmed against Kivy's own current official documentation, both
this session.

**Files affected:** `main.py`.

**Change type:** add a button and its handler; add a `Video` widget.

**Location:** inside `MyApp`, alongside Lesson 14's photo button and
Lesson 15's `Image` widget.

**Dependencies:** Lesson 14's `on_photo_taken` pattern, directly
mirrored; `user_data_dir`, already established in Lesson 13.

```python
from kivy.uix.video import Video                                           # <- new

# (inside build(), alongside the other widgets already added to layout)

video_button = Button(text="Take Video", size_hint_y=None, height=80)      # <- new
video_button.bind(on_press=self.take_video)                                # <- new
layout.add_widget(video_button)                                            # <- new

self.video_player = Video(source="", size_hint_y=None, height=300)         # <- new
layout.add_widget(self.video_player)                                       # <- new

# (rest of MyApp)

def take_video(self, instance):                                            # <- new
    video_path = os.path.join(self.user_data_dir, "clip.mp4")             # <- new
    camera.take_video(filename=video_path, on_complete=self.on_video_taken) # <- new

def on_video_taken(self, filename):                                        # <- new
    exists = os.path.exists(filename)                                     # <- new
    Logger.info(f"MyApp: video callback — {filename}, exists={exists}")   # <- new
    if exists:                                                             # <- new
        self.video_player.source = filename                               # <- new
        self.video_player.state = "play"                                  # <- new
    return False                                                          # <- new
```

### Mechanical Walkthrough

- `from kivy.uix.video import Video` — **first appearance**, full
  treatment above (Objects and methods).
- `video_button = Button(...)` / `.bind(on_press=self.take_video)` /
  `layout.add_widget(...)` — **entirely reappearing mechanism from
  Lessons 11, 12, and 14** — a fifth button, added the identical way.
- `self.video_player = Video(source="", size_hint_y=None, height=300)`
  — **reappearing exact construction shape from Lesson 15's own
  `Image`**, a different widget class, same properties (`source`,
  sizing) playing the same structural role.
- `def take_video(self, instance):` — **reappearing exact callback
  shape**, no new idea.
- `camera.take_video(filename=video_path, on_complete=self.on_video_taken)`
  — **first appearance**, full treatment above (Objects and methods) —
  by design, nothing here differs in *shape* from Lesson 14's
  `take_picture` call.
- `def on_video_taken(self, filename):` — **reappearing exact
  structure from Lesson 14's `on_photo_taken`**, including the same
  `exists` check and `return False`.
- `self.video_player.source = filename` — **reappearing exact
  mechanism from Lesson 15's `Image.source`** — a genuine change on
  first use, per that lesson's own proof.
- `self.video_player.state = "play"` — **first real appearance of
  `state`**, full treatment above (Objects and methods) — this is the
  one line in this entire lesson with no direct precedent: setting a
  property specifically to *trigger an ongoing action*, not merely to
  point at content the way `source` does.

### Execution Trace

**Same honesty note as this whole project, worth restating plainly
here:** this lesson could not verify real video playback in-session at
all — Step 1 proves only the property mechanism, using no real video
file, since none was available to test against. Every prediction below
rests on Kivy's own documented `Video` widget behavior, not a captured
run, more thoroughly untested than most lessons in this series.

1. The user taps "Take Video," records a short real clip, and confirms
   it. Predict `on_video_taken` runs with a real, existing `.mp4` path
   — `exists` logged `True`, the identical shape Lesson 14 already
   established for photos.
2. Predict `self.video_player.source = filename` is a genuine change
   (starting from the empty string set in `build()`), and
   `self.video_player.state = "play"` begins real playback immediately
   after.
3. Record a second video. Predict the same repeat-path gotcha Lesson
   15 already named for photos applies here too, in principle — a
   second video saved to the same `clip.mp4` path would need the same
   kind of forced refresh `Image.reload()` provided; `Video` has no
   identically-named method confirmed this session, left as this
   lesson's own honest, open question rather than a guessed answer —
   see Exercise 3.

### CS Lens

**Recognizing that a new task shares almost all of its real structure
with one already solved — and building on that structure directly
instead of re-deriving it — is a real, general engineering habit, not
specific to this lesson's own two Plyer methods**: a new HTTP endpoint
built by copying an existing one's validation and error-handling
shape, changing only the specific business logic; a new test written
by copying an existing test's setup/teardown structure, changing only
the assertions. The risk on the other side, worth naming honestly: if
`take_video` had actually differed from `take_picture` in some
non-obvious way, assuming the shared shape without checking would have
been a real mistake — this lesson's confidence rests specifically on
having read Plyer's actual source for both methods together, not on
guessing they matched.

### SE Lens

**Why does this lesson leave the second-video refresh question
explicitly open, rather than guessing that `Video` has its own
`reload()` the way `Image` does?** This project's own standing rule is
to verify real API behavior against real documentation or source
before teaching it as fact — and this session found no confirmed
evidence either way for `Video` specifically. Guessing an unverified
method exists, only for it to be wrong, would be a worse outcome than
naming the gap honestly and leaving it as a real exercise for the
reader to test directly against a real device.

---

## Connect the Pieces

`take_video`, deliberately taught with almost no new mechanical
walkthrough of its own, reuses Lesson 14's entire asynchronous
callback shape unchanged. `Video`, similarly, reuses Lesson 15's
`source`-as-a-property structure directly — Step 1's own
`OptionProperty` proof confirms `state` belongs to the identical
family of Kivy properties already understood, restricted to three
specific values instead of arbitrary text. What's genuinely new in
this entire lesson is one line — `self.video_player.state = "play"` —
and this lesson's own structure reflects that: most of it is
recognition, not new proof.

## What Breaks Without This

Set `self.video_player.source` but never set `state` at all:

```python
if exists:
    self.video_player.source = filename
    # self.video_player.state = "play" removed  <- wrong
```

Predicted result: per Kivy's own documented `Video` behavior, a
`source` change alone does not necessarily begin playback on its own —
predict the widget loads the video but stays on its default state,
showing at most a first frame or a blank player, with the user unable
to tell whether recording actually succeeded without an explicit
`state = "play"` telling it to start. Restore the line, and confirm
for yourself, on a real device, that playback only begins once `state`
is set explicitly.

## Exercises

1. Add a "Stop Video" button that sets `self.video_player.state = "stop"`,
   and confirm real playback actually halts when pressed.
2. Compare `take_picture`'s and `take_video`'s real source in
   `plyer/platforms/android/camera.py` side by side (already read in
   full for Lesson 14) and confirm, in your own words, exactly which
   lines differ between the two methods — direct, real confirmation
   of this lesson's own CS Lens claim that they share almost all of
   their structure.
3. Record a second real video, saved to the same `clip.mp4` path, and
   test firsthand whether `self.video_player.source = filename` alone
   refreshes playback or not — resolving this lesson's own openly
   named, unverified question with a real, physical answer.

## Definition of Done

- [ ] You reproduced Step 1's property proof and confirmed the same
      "identical value produces no callback" behavior already seen for
      `Image.source` in Lesson 15, now for a restricted `OptionProperty`
      instead of a plain `StringProperty`.
- [ ] You ran the real Step 2 code on a real Android build, recorded a
      real video, and watched it play back inside this app.
- [ ] You resolved Exercise 3 for yourself and know, from a real test
      rather than a guess, whether a second recording needs the same
      kind of forced refresh Lesson 15 needed for photos.
- [ ] You can explain, without looking, exactly which parts of this
      lesson were genuinely new and which were direct reuse — the same
      distinction this lesson's own Concept Unit opened with.
- [ ] Commit: the updated `main.py`.
