# Lesson 15: A Picture That Looks Stale Even Though It Isn't

**What you will build:** a real `Image` widget showing the photo
Lesson 14 just captured — and a real fix for a genuine Kivy gotcha
this project runs straight into the moment a second photo gets taken:
because every photo saves to the exact same file path, simply
reassigning that same path a second time does nothing at all, on its
own. The transferable problem: Kivy's own property system only
reacts when a value actually *changes* — and a file changing on disk,
while the path pointing to it stays exactly the same string, is
invisible to that mechanism entirely.

**What you need to know first:** Lesson 14's `on_photo_taken`
callback and the real photo file it already confirms exists.

**Terms introduced in this lesson:**
- **Change detection (Kivy properties)** — Kivy's own widgets track
  their properties specially, and only notify anything listening —
  including their own internal drawing logic — when a property is set
  to a genuinely *different* value than it already held. Setting a
  property to the exact value it already has is a real, silent no-op.

**Objects and methods this lesson uses:**
- **`kivy.uix.image.Image`**
  - *What it is:* a widget that displays an image file on screen.
  - *Implementation:* `source` is the file path to display; changing
    `source` to a genuinely different path automatically redisplays
    the new image — but per this lesson's own subject, changing it to
    the *same* path it already held does nothing on its own.
  - *Its use:* where Lesson 14's captured photo actually appears.
- **`Image.reload()`**
  - *What it is:* forces the widget to re-read its current `source`
    from disk right now, regardless of whether the path string itself
    changed.
  - *Implementation:* takes no arguments; bypasses the change-detection
    shortcut above entirely, deliberately.
  - *Its use:* this lesson's actual real fix.

---

## Concept Unit: A Value That Didn't Change, Even Though the File Did

### The Problem

Lesson 14 always saves to the same path — `photo.jpg`, inside
`user_data_dir` — every single time. The first photo displays
correctly: `self.photo_image.source` goes from empty to that path, a
real, genuine change. The *second* photo, saved to the identical path,
produces no change in the `source` string at all — even though the
real bytes on disk are now completely different — and Kivy's own
property system, which only reacts to genuine changes, has no way to
know anything happened.

### Introduce the Concept in Isolation — Step 1: Proving Kivy Properties Only React to Real Changes

**Runs on the desktop** — this isolation uses Kivy's own property
system directly, with no `Image` widget or real image file involved at
all, to prove the root cause on its own first:

```python
from kivy.event import EventDispatcher
from kivy.properties import StringProperty


class Thing(EventDispatcher):
    value = StringProperty("")


def on_value_change(instance, value):
    print("value changed to:", value)


thing = Thing()
thing.bind(value=on_value_change)

thing.value = "a"
thing.value = "a"  # same value again
thing.value = "b"
```

Run it. Expected output — **two lines, not three**:

```
value changed to: a
value changed to: b
```

The second `thing.value = "a"` produces no output at all — Kivy's own
`StringProperty` compares the new value against the current one first,
and since `"a"` already equals `"a"`, nothing further happens. This is
the exact real mechanism behind `Image.source`, applied here to a
plain, standalone property with nothing image-related involved, so the
cause is visible on its own before the real fix is introduced.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — Kivy's property
change-detection behavior and `Image.reload()` are confirmed against
Kivy's own current official documentation and source, fetched this
session.

**Files affected:** `main.py`.

**Change type:** modify `build()` (adds the `Image` widget); modify
`on_photo_taken` (displays the photo, with the real fix).

**Location:** inside `MyApp`.

**Dependencies:** Lesson 14's `on_photo_taken` and the real
`photo.jpg` path it already confirms.

```python
from kivy.uix.image import Image                                          # <- new

# (inside build(), alongside the other widgets already added to layout)

self.photo_image = Image(source="", size_hint_y=None, height=300)         # <- new
layout.add_widget(self.photo_image)                                       # <- new

# (replacing Lesson 14's on_photo_taken)

def on_photo_taken(self, filename):
    exists = os.path.exists(filename)
    Logger.info(f"MyApp: photo callback — {filename}, exists={exists}")
    if exists:                                                             # <- new
        self.photo_image.source = filename                                # <- new
        self.photo_image.reload()                                         # <- new
    return False
```

### Mechanical Walkthrough

- `from kivy.uix.image import Image` — **first appearance**, full
  treatment above (Objects and methods).
- `self.photo_image = Image(source="", size_hint_y=None, height=300)` —
  **first real construction.** `source=""` — a real, deliberately
  empty starting value, so the very first real photo's path (however
  it happens to be spelled) is guaranteed to count as a genuine change
  from Kivy's own perspective, per Step 1's own proof. `size_hint_y`/
  `height` — **reappearing exact sizing mechanism from Lesson 11's own
  button**, applied here to give the image a fixed, predictable amount
  of screen space instead of stretching to fill whatever's left.
- `layout.add_widget(self.photo_image)` — **reappearing exact
  mechanism**, this project's now-familiar way of extending the same
  widget tree from Lesson 11 onward.
- `if exists:` — **reappearing exact guard from Lesson 14's own
  logging line**, now actually gating real behavior instead of only
  logging.
- `self.photo_image.source = filename` — **first real use of
  `Image.source`.** On the very first photo, this is a genuine change
  — Step 1's own proof confirms the on-screen image updates correctly,
  no `reload()` needed yet. On every photo *after* the first, this
  line reassigns the exact same string as before — per Step 1's own
  proof, this line alone changes nothing Kivy will notice.
- `self.photo_image.reload()` — **first appearance**, full treatment
  above (Objects and methods) — the actual fix, run unconditionally,
  every time, regardless of whether this specific call happens to be
  the first photo or a repeat.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against Kivy's own current documentation, not a captured
run.

1. The user takes their first-ever photo. Predict `self.photo_image.source`
   changes from `""` to the real path — a genuine change — and the
   real photo appears on screen correctly, even without needing
   `reload()` yet.
2. The user takes a second photo, overwriting the same `photo.jpg`
   file. Predict `self.photo_image.source = filename` assigns the
   identical string as before — per Step 1's own proof, this alone
   produces no visible change.
3. Predict `self.photo_image.reload()`, run immediately after, forces
   Kivy to re-read the file from disk regardless — the second, new
   photo now genuinely appears, replacing the first.
4. Predict this pattern holds for every subsequent photo taken after
   that — `source` assignment alone doing nothing from the second
   photo onward, `reload()` doing the actual, real work every single
   time.

### CS Lens

**Change detection that compares old and new values before doing any
further work — and can therefore miss a change that happens
"underneath" an unchanged reference — is a real, general category of
bug, not specific to Kivy at all**: a UI framework's own memoized
component not re-rendering because a prop object's identity didn't
change, even though its contents did; a build tool skipping a
recompile because a file's path didn't change, even though its
contents were edited; a cache keyed by URL serving stale content after
the resource behind that URL was updated. The shared shape every time:
something fast and cheap (comparing a reference or a string) is used
as a stand-in for something slower and more expensive (actually
checking the real, underlying content) — correct almost always, wrong
exactly when the underlying thing changes without the stand-in
noticing.

### SE Lens

**Why not simply give every photo a unique filename instead — a
timestamp, say — sidestepping this whole problem?** That's a real,
valid alternative design, and arguably simpler to reason about: a
genuinely new path is always a genuine change, with no `reload()`
needed at all. This lesson deliberately keeps the fixed filename from
Lesson 14 instead, specifically so the real gotcha itself — and its
real, general lesson about change detection — gets surfaced and named,
rather than avoided by construction. A real project might reasonably
choose either approach; this lesson's own priority is teaching the
gotcha, not just working around it invisibly.

---

## Connect the Pieces

Step 1's own plain `StringProperty`, proven with nothing but two print
statements and no image involved at all, is the exact real mechanism
behind why `self.photo_image.source = filename` silently does nothing
on a repeat photo — and `reload()`, Kivy's own real, documented escape
hatch from that exact behavior, is what actually keeps the displayed
photo honest. Lesson 14's `on_photo_taken`, already proven to receive
a real, existing file path, is where this lesson's own two new lines
now live.

## What Breaks Without This

Remove the `reload()` call, keeping only the `source` assignment:

```python
if exists:
    self.photo_image.source = filename
    # self.photo_image.reload() removed  <- wrong
```

Predicted result: the very first photo taken still displays correctly
— a genuine change, exactly as this lesson's own Execution Trace
already predicted. Take a second, visibly different photo, and predict
the on-screen image **does not change at all** — it keeps showing the
first photo, even though `on_photo_taken`'s own log line correctly
confirms a new file was written and does exist. This is the same
invisible-until-tested danger this series has already named more than
once: nothing crashes, nothing logs an error, the screen is simply,
silently wrong. Restore `reload()`, and confirm for yourself, by
taking two visibly different real photos in a row, that the displayed
image now actually updates both times.

## Exercises

1. Reproduce Step 1's own two-line proof yourself, then add a third
   reassignment of a genuinely new value (`thing.value = "c"`) and
   confirm it does fire, matching your own prediction beforehand.
2. Take three real photos in a row without changing anything else, and
   confirm, by watching the screen after each one, that `reload()`
   really does force a fresh redisplay every single time, not just the
   first repeat.
3. Try setting `self.photo_image.source = ""` immediately before
   reassigning it to the real filename, as an alternative fix — confirm
   for yourself whether this also works, and explain, in your own
   words, why it would (in terms of Step 1's own change-detection
   proof) without needing `reload()` at all.

## Definition of Done

- [ ] You ran Step 1's scratch file and saw the real, missing middle
      line — confirmed firsthand that reassigning an unchanged value
      produces no callback at all.
- [ ] You ran the real Step 2 code and saw your first real photo
      appear correctly on screen.
- [ ] You took a second, visibly different real photo and confirmed
      the displayed image actually updated to match it.
- [ ] You reproduced What Breaks Without This and watched the second
      photo silently fail to display, with no error anywhere.
- [ ] You can explain, without looking, why `reload()` is necessary
      here specifically, in terms of Kivy's own property
      change-detection.
- [ ] Commit: the updated `main.py`.
