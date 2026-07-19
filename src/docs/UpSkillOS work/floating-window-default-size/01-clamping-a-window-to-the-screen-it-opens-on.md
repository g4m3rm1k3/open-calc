# Letting a Lab Request a Bigger Window — and Two Bugs That Were Already Waiting

## What You Will Build

Every lab opens in a floating window sized 960×640 by default
(`FloatingWindow.jsx`'s `PANEL_W`/`PANEL_H`), with no way for an
individual lab to ask for something bigger — a drawing/notebook lab
like `canvas-notes` genuinely benefits from more space than a small
calculator widget does. This lesson adds `width`/`height` fields a
lab's own `meta.js` can set, forwarded through `EntryShell` into
`openWindow`. Wiring that up surfaced two bugs already sitting in
`FloatingWindow.jsx`, invisible until something actually tried to open
larger than the one size every window had ever used before.

## What You Need to Know First

`lab-registry-autofind/01-...md` — assumed fresh: `meta.js` as the one
file that controls everything about how a lab presents itself (label,
emoji, route). This lesson adds one more thing it controls.

---

## The Lesson

### Where you're working

Three files: `src/labs/canvas-notes/meta.js` (two new fields),
`src/pages/EntryShell.jsx` (forwards them), and
`src/components/desktop/FloatingWindow.jsx` (where both bugs live).

### Concept Unit: A Constant Used Instead of the Value It Was Standing In For

#### The Problem

`FloatingWindow.jsx` computes a new window's starting horizontal
position by centering it: `(window.innerWidth - PANEL_W) / 2`. That
formula is only correct if the window is actually `PANEL_W` wide. Every
window that had ever opened before this lesson *was* exactly
`PANEL_W` wide, since no lab had a way to ask for anything else — so
the bug had no way to ever manifest until this exact lesson.

#### Introduce the Concept in Isolation

```js
const PANEL_W = 960
function centerX(actualWidth) {
  return (window.innerWidth - PANEL_W) / 2   // BUG: always uses PANEL_W
}

// pretend window.innerWidth = 1600
// a normal window, actually 960 wide:
console.log('960-wide window centered at:', (1600 - 960) / 2)
// a bigger window, actually 1280 wide, but the formula doesn't know that:
console.log('1280-wide window ALSO centered at:', (1600 - 960) / 2)
```

Run, real output:
```
960-wide window centered at: 320
1280-wide window ALSO centered at: 320
```

**What this proves:** both windows get positioned at `x: 320`, even
though a 1280-wide window starting at `x: 320` on a 1600-wide screen
ends at `x: 1600` — flush against the right edge, not centered at all.
The formula never learned the *actual* width being positioned; it was
written back when `PANEL_W` and "the window's real width" were always
the same number, and stayed correct by coincidence, not by design.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/components/desktop/FloatingWindow.jsx`
- **Change type:** fix
- **Dependencies:** none

#### The New Code

```js
const initialW = Math.min(win.width ?? PANEL_W, window.innerWidth - 40)
const initialH = Math.min(win.height ?? PANEL_H, window.innerHeight - 80)
const [pos, setPos] = useState(() => ({
  x: Math.max(0, (window.innerWidth - initialW) / 2 + offset),
  y: Math.max(44, 80 + offset),
}))
const [size, setSize] = useState(() => ({ w: initialW, h: initialH }))
```

#### Mechanical Walkthrough

`initialW`/`initialH` are computed once, before either `pos` or `size`
reads them — both now derive from the *same* actual value, instead of
`pos` reaching for the constant `PANEL_W` while `size` correctly used
`win.width ?? PANEL_W`. This is the general fix for the bug's actual
shape: whenever a value has an "actual, possibly-overridden" version
and a "default constant" version, every formula that needs it must
consistently use the *same* one of the two — mixing them, as the
original centering formula did, produces answers that are each
individually reasonable but mutually inconsistent.

#### CS Lens

Two computations that are each locally correct but silently assume a
shared value that has since diverged is a class of bug that shows up
constantly in caching and configuration: a cached "total price"
computed once assuming a tax rate, used later after the rate changed
without recomputing; two microservices reading the same config value
from different points in a deploy, one before an update and one after.
**Recognized in:** any time "this used to always be true, so nobody
wrote the code to handle it not being true" — correct until the
underlying assumption's very first violation.

#### SE Lens

This bug was undetectable by testing the *existing* behavior — every
window that had ever opened before this lesson used the default size,
so `PANEL_W` and "actual width" genuinely were always equal, and the
bug produced correct results 100% of the time it had ever been
exercised. It only became visible by introducing the exact case
(a non-default width) the formula silently assumed could never happen.
This is why "it's always worked" is a weaker guarantee than it sounds
— it can mean "correct," or it can mean "never yet tested against the
case that would prove it wrong."

#### Connect to What Came Before

This is the same shape of bug this lesson series has already caught
twice — Lesson 2's `loadFromJSON`-as-callback mistake and Lesson 8's
rename-input concatenation both looked correct until a specific real
scenario exercised them for the first time. This is the third: code
that was correct for every case that had ever actually happened, wrong
for a case nothing had tried yet.

---

### Concept Unit: Clamping a Requested Size to the Screen It Has To Fit On

#### The Problem

`startResize` (the manual drag-to-resize handler) already clamps
against `window.innerWidth - 40`/`window.innerHeight - 80` so a user
can't drag a window bigger than their screen. The *initial* size a
window opens at — `win.width ?? PANEL_W` — had no equivalent clamp at
all: a lab requesting, say, a 1280×860 window would get exactly that,
even on a laptop screen only 900px wide.

#### Introduce the Concept in Isolation

```js
function initialSize(requestedW, requestedH, screenW, screenH) {
  return { w: requestedW, h: requestedH } // no clamp at all
}
console.log(initialSize(1280, 860, 900, 700))   // a small screen
```

Run, real output:
```
{ w: 1280, h: 860 }
```

**What this proves:** a window requesting 1280×860 gets exactly that,
even handed a 900×700 screen to open on — 380px of it would render
off the right edge of the browser viewport entirely, unreachable and
invisible, with no way for a user to know it's even there without
already knowing to resize or move it.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/components/desktop/FloatingWindow.jsx`
- **Change type:** fix (same lines as the previous unit)
- **Dependencies:** none

#### The New Code

(Shown in the previous unit — `Math.min(win.width ?? PANEL_W, window.innerWidth - 40)` is both fixes at once: consistent use of the actual value, *and* the clamp.)

Real output, verified this session, two screen sizes:
```
Floating window size on a 1600x1000 screen (requested 1280×860): { width: 1280, height: 860 }
On a small 900x700 screen — window rect: { width: 860, height: 620, left: 20, right: 880, ... }
Window fits within the screen width: true
```

#### Mechanical Walkthrough

`Math.min(requested, screenSize - margin)` — established arithmetic,
nothing new syntactically — but note it produces a *different actual
window size* depending on the screen, not just a repositioned one: on
the 900×700 screen, the window opened at 860×620 (clamped down from
the requested 1280×860), not 1280×860 shoved partially off-screen.
This is why the fix belongs at the same spot as `initialW`/`initialH`
from the previous unit — both `pos` and `size` need to agree on
whatever the *actually usable* size turned out to be, after clamping,
not the originally requested one.

#### CS Lens

Requesting an ideal size and having the system negotiate it down to
what's actually available is the same shape as a network protocol's
MTU negotiation (a sender proposes a packet size; the path clamps it
to whatever the smallest link along the route can actually carry) or
a video player picking the highest resolution stream that still fits
the viewer's actual bandwidth. **Recognized in:** any "ask for the
best case, get the best *available* case" negotiation between a
request and a real constraint.

#### SE Lens

The alternative — letting labs request any size and trusting them not
to request something unreasonable — pushes the responsibility onto
every future lab author to know and remember the current screen's
limits, which they can't (a lab's `meta.js` is written once, long
before anyone knows what screen it'll actually open on). Clamping
centrally, in the one shared component every lab's window passes
through, means no lab author ever has to think about this again — the
same reasoning `lab-registry-autofind/01-...md` used for centralizing
metadata discovery instead of repeating it per lab.

#### Connect to What Came Before

Both bugs in this lesson lived in `FloatingWindow.jsx` — code shared
by every lab in this app, never specific to `canvas-notes`. Fixing
them here, rather than working around them inside `canvas-notes`
itself, means every future lab that ever requests a custom window size
gets both fixes for free, the same "fix it once, centrally" instinct
behind this whole app's move toward auto-discovery.

---

## Connect the Pieces

`canvas-notes/meta.js` sets `width: 1280, height: 860`.
`EntryShell.jsx` forwards `entry.width`/`entry.height` into
`openWindow(...)`. `FloatingWindow.jsx` now uses that requested size
consistently for both centering (first unit) and clamps it against the
real screen (second unit) before ever rendering — so the window opens
at the size requested when there's room, or the largest size that
still fits when there isn't, correctly centered either way.

## What Breaks Without This

Verified live, this session: without the fix, a bigger custom-sized
window would be positioned as if it were the default 960px wide (first
bug — visibly off-center, not just wrong by a rounding error), and
would render at its full requested size even on a screen too small to
show all of it (second bug — verified by deliberately reverting the
clamp and requesting a size larger than a 900×700 test viewport).

## Exercises

- Give a different lab a custom `width`/`height` in its own `meta.js`
  and confirm it opens correctly sized and centered, without touching
  `FloatingWindow.jsx` again — proof the fix is genuinely centralized.
- `MIN_W`/`MIN_H` already exist for the resize-drag case. Should a
  lab's *requested* initial size also be clamped to at least `MIN_W`/
  `MIN_H`, in case a future `meta.js` requests something too small to
  be usable? Decide, and explain why either choice is defensible.

## Definition of Done

- [ ] `canvas-notes/meta.js` sets `width`/`height`; `EntryShell.jsx`
      forwards both into `openWindow`
- [ ] `FloatingWindow.jsx`'s initial position and size both derive from
      the same actual (possibly custom) width/height, not a mix of the
      real value and the `PANEL_W`/`PANEL_H` constants
- [ ] The initial size is clamped against `window.innerWidth`/`innerHeight`,
      mirroring the existing resize-drag clamp
- [ ] Verified live, this session: a lab requesting a custom size opens
      at that size, correctly centered, on a normal screen; the same
      lab opens clamped-but-still-centered and fully on-screen on a
      screen smaller than the requested size
- [ ] You can explain, without notes, why the original centering
      formula was correct for every window that had ever opened before
      this lesson, despite being wrong in general
- [ ] `git commit` with a message explaining why — for example: "Let a
      lab request a bigger default window via meta.js — fixed two
      latent FloatingWindow bugs along the way: centering always used
      the PANEL_W constant instead of the window's actual width, and
      initial size was never clamped against the real screen the way
      manual resizing already was"
