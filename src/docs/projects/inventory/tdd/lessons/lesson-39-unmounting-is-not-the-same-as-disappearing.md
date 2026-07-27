# Lesson 39: Unmounting Is Not the Same as Disappearing

**What you will build:** `App.tsx` has always rendered both
`<SidePanel>`s unconditionally (Lesson 23) — even with zero tabs open, a
panel still rendered, showing `"No panels open."` inside an otherwise
empty strip. This lesson makes an empty panel disappear entirely, and
makes both panels slide in/out with a real spring animation when they
gain or lose their last tab, instead of snapping in and out of existence
instantly. New feature, not a port — the reference has no shell/panel
system to port from at all (`theme.css`'s own note on this: the whole
docked-panel shell is new, no `cnc-sim` counterpart). The transferable
point: React's conditional rendering (`condition && <Component />`) and
CSS-only hiding (`display: none`) look similar but aren't — the first
really unmounts a component, which is exactly the moment a library like
`framer-motion` needs control over, to play an exit animation *before*
the unmount actually happens rather than after.

**What you need to know first:** Lesson 23's own `SidePanel.tsx` (one
concern, one panel, no reference counterpart); `theme.css`'s own citation
that the panel shell is new, undocumented-by-the-reference UI.

---

## Project Change (no new concept): Conditional Rendering, Not Conditional Hiding

### The Problem

Confirmed directly, reading the pre-existing code: `App.tsx` rendered
`<SidePanel side="left" ... />` and `<SidePanel side="right" ... />`
unconditionally, regardless of `leftPanel.tabs.length`/
`rightPanel.tabs.length`. A panel with its last tab closed still
occupied its full width, showing only `"No panels open."` — real,
working, but visually inert screen space with nothing in it.

### Reference Source

No reference counterpart — `theme.css`'s own existing comment already
names the whole docked-panel shell as new UI with no `cnc-sim`
equivalent. This is original interaction design, not a port.

### Files Affected

`cnc-web/package.json` (new dependency), `cnc-web/src/SidePanel.tsx`
(modified — real enter/exit animation), `cnc-web/src/App.tsx` (modified
— conditional rendering, `AnimatePresence`). Change type: add (new
feature).

### The New Code

```typescript
<AnimatePresence>
  {leftPanel.tabs.length > 0 && <SidePanel key="sidepanel-left" ... />}
</AnimatePresence>
```

### The Updated Project

`cnc-web/package.json`'s new dependency:
```json
"framer-motion": "^12.42.2",
```

`SidePanel.tsx`'s real change — a `motion.div` with real slide-in/out
variants:

```typescript
import { motion } from "framer-motion";

...

  const slideVariants = {
    hidden: { x: side === "left" ? "-100%" : "100%", opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: side === "left" ? "-100%" : "100%", opacity: 0 }
  };

  return (
    <motion.div
      className={`side-panel docked ${side}${isSelected ? " selected" : ""}`}
      style={{ width }}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={slideVariants}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      onMouseDown={onSelect}
    >
```

`App.tsx`'s real change — both panels now conditionally rendered inside
one shared `AnimatePresence`:

```typescript
import { AnimatePresence } from "framer-motion";

...

        <AnimatePresence>
          {leftPanel.tabs.length > 0 && (
            <SidePanel
              key="sidepanel-left"
              side="left"
              width={leftWidth}
              onResize={setLeftWidth}
              tabs={leftPanel.tabs.map((id) => ({ id, label: VIEW_LABELS[id], content: renderViewContent(id) }))}
              activeTabId={leftPanel.activeTab}
              onSelectTab={(id) => setLeftPanel((panel) => ({ ...panel, activeTab: id as ViewId }))}
              onCloseTab={(id) => setLeftPanel((panel) => removeFromPanel(panel, id as ViewId))}
              isSelected={selectedPanel === "left"}
              onSelect={() => setSelectedPanel("left")}
            />
          )}
          {rightPanel.tabs.length > 0 && (
            <SidePanel
              key="sidepanel-right"
              side="right"
              width={rightWidth}
              onResize={setRightWidth}
              tabs={rightPanel.tabs.map((id) => ({ id, label: VIEW_LABELS[id], content: renderViewContent(id) }))}
              activeTabId={rightPanel.activeTab}
              onSelectTab={(id) => setRightPanel((panel) => ({ ...panel, activeTab: id as ViewId }))}
              onCloseTab={(id) => setRightPanel((panel) => removeFromPanel(panel, id as ViewId))}
              isSelected={selectedPanel === "right"}
              onSelect={() => setSelectedPanel("right")}
            />
          )}
        </AnimatePresence>
```

### Mechanical Walkthrough

- `leftPanel.tabs.length > 0 && (<SidePanel ... />)` — **(a) first
  appearance** — real conditional rendering: when the condition is
  `false`, React never mounts `<SidePanel>` at all, which is a genuinely
  different real outcome than rendering it and hiding it with CSS (the
  latter keeps the component mounted, its state alive, its DOM present
  but invisible).
- `<AnimatePresence>` wrapping both — **(a) first appearance** — the
  real reason conditional rendering alone isn't enough for an exit
  animation: the moment React's own condition goes `false`, a plain
  conditional render unmounts the component *immediately*, before any
  animation could run. `AnimatePresence` intercepts that unmount,
  keeps the outgoing element mounted just long enough to run its `exit`
  variant, then lets React actually remove it.
- `key="sidepanel-left"` / `key="sidepanel-right"` — **(a) first
  appearance of a key mattering for this reason** — `AnimatePresence`
  identifies which children are entering/leaving/staying by key; without
  a stable key here, it couldn't tell "the left panel is gone" from "a
  new, different panel replaced it."
- `slideVariants` (`hidden`/`visible`/`exit`) — **(a) first appearance**
  — real, named animation states, each an `{x, opacity}` pair; `x` uses
  `"-100%"`/`"100%"` (not a fixed pixel value) so the slide distance is
  always exactly the panel's own current width, regardless of which
  side or how wide it's been resized to.
- `transition={{ type: "spring", stiffness: 350, damping: 30 }}` —
  **(a) first appearance** — a real physics-based transition (not a
  fixed-duration easing curve), so the animation's actual speed depends
  on how far it has to travel, not a flat, arbitrary time.
- `className="side-panel docked ${side}..."` — **(b) partial
  reappearing** — `side-panel`/`${side}` unchanged; `docked` is new
  (paired with `theme.css`'s own new `.side-panel.undocked` styling,
  covered in a later lesson) but nothing in this diff ever applies
  `undocked` — a real, named, currently-unreachable CSS branch, not
  silently glossed over.

### CS Lens

Mounting/unmounting a component and hiding/showing it are two different
real lifecycle events — React's reconciler only fires cleanup effects
and actually destroys DOM nodes on the former. `AnimatePresence` exists
specifically to insert a real delay between "React decided to unmount
this" and "this is actually gone," which a `display: none` toggle would
never need (the element was never destroyed in the first place) and
could never provide (there's no unmount to intercept).

**REAPPEARING**, two concepts already taught, both worth naming
explicitly where this exact code exercises them: `onSelectTab={(id) =>
setLeftPanel((panel) => ({ ...panel, activeTab: id }))}` is a **closure**
(Lessons 1/19/23's own concept) — the arrow function closes over
`setLeftPanel` itself, carrying it along wherever `<SidePanel>` hands the
callback off to, with no need to pass `setLeftPanel` as a prop
explicitly. And `(panel) => ({ ...panel, activeTab: id })` is a
**functional, immutable update** — it never mutates `panel` in place, it
builds and returns a brand-new object every time. That's worth naming
directly *because* this exact lesson also touches `viewport.ts`
(Lessons 8/37/38), which does the opposite on purpose: `drawPath`
mutates the same `THREE.Scene` object in place, call after call, rather
than ever rebuilding one from scratch. Same codebase, same session even,
two genuinely different state-update disciplines — React's own
render model requires the immutable kind (a mutated object wouldn't
trigger a re-render, since React compares references, not contents),
while Three.js's retained-mode scene graph is built specifically to be
mutated efficiently in place. Neither is "the correct" way in general;
each fits the model it lives inside.

### SE Lens

**Design rationale, named directly — this unit has none of the reference
to lean on** (confirmed above: no counterpart exists), so every visual
choice below is this project's own, and deserves the same "alternative
considered, real cost" treatment a code decision gets:

- **Slide, not fade or a hard cut.** A fade communicates "this content is
  changing"; a slide additionally communicates *direction* — which side
  the panel lives on and where it's going, reinforcing the docked
  mental model (`side-panel left`/`side-panel right`) the user already
  has from the ribbon toggle that opened it. A hard cut (React's own
  default, with no `AnimatePresence` at all) was already this project's
  actual starting point before this lesson — genuinely functional, but
  gives the user no visual continuity between "panel there" and "panel
  gone," which is the concrete gap this lesson closes.
- **Spring physics (`stiffness: 350, damping: 30`), not a fixed-duration
  ease.** A fixed duration finishes in the same time whether the panel
  traveled 200px or 600px (resized wide beforehand), which reads as
  either sluggish or rushed depending on width. A spring's duration
  scales naturally with distance — the real reason `x` uses `"-100%"`/
  `"100%"` instead of a pixel value in the first place (Mechanical
  Walkthrough, above): both choices exist specifically to keep the
  animation feeling consistent across `SidePanel`'s own real, user-
  resizable width (Lesson 23).
- **The real, significant tradeoff, never previously named:** the panel
  fully unmounts and disappears rather than collapsing to a thin,
  always-visible icon rail — a real, common alternative in docked-panel
  UIs (VS Code's own activity bar is exactly this shape) that keeps one
  affordance permanently visible: *there is a hidden panel here, click
  to reopen it*. This project's own choice trades that discoverability
  away for simplicity (one less UI element, one less piece of layout
  state to track) and for maximizing canvas space the moment a panel
  closes — reasonable for a 3D viewport, where screen real estate is
  the scarcer resource most of the time. But it's a real cost: a
  first-time user who closes every tab on a side has no visual cue
  left that panels exist at all, short of remembering the ribbon
  toggle that opened them. Not fixed here — named, since discovering it
  wasn't what triggered this lesson, but it's the kind of tradeoff that
  should be a deliberate choice, not a default nobody weighed.

The real, honest, currently-unreachable branch: `SidePanel`'s own render
still has `activeTab ? activeTab.content : <div className="side-panel-empty">
No panels open.</div>` — now genuinely unreachable in the *zero-tabs*
case (the component never mounts at all then), but still real, live code
for a narrower, real edge case: `tabs.length > 0` while `activeTabId`
doesn't match any tab in `tabs` (e.g., a stale id after some other
removal path). The message itself ("No panels open") would be
misleading if that specific case were ever hit, since tabs *are* open —
just none currently selected. Not fixed here; named, since fixing it
wasn't what this lesson was about.

### Commands

```
npm install framer-motion
```

### Run It — Real Output

Verified live, this session, against the real running dev server:
closing every tab on the right panel (via each tab's own real close
button, not simulated) made the entire right `SidePanel` disappear —
confirmed directly:
```
right panel present: true
right panel present after closing all its tabs: false
```
No console/page errors. Screenshot confirmation: the canvas visibly
expands to fill the space the closed panel occupied, with the remaining
panel's own tabs unaffected.

`npx tsc --noEmit`: clean, no errors.

## Connect the Pieces

Follow closing a panel's last tab, start to finish:

1. The user clicks a tab's own `✕` (`SidePanel.tsx`'s existing
   `onCloseTab`, unchanged) — `App.tsx`'s `removeFromPanel` (unchanged)
   drops that id from `rightPanel.tabs`.
2. `App.tsx` re-renders; `rightPanel.tabs.length > 0` is now `false`.
3. React would normally unmount `<SidePanel key="sidepanel-right" />`
   immediately — but it's inside `<AnimatePresence>`, which intercepts
   that: instead of unmounting right away, it keeps the element mounted
   and switches its animation state to `"exit"`.
4. `motion.div` animates from `visible` (`x: 0`) to `exit` (`x: "100%"`,
   `opacity: 0`) over the real spring transition — a real slide-out,
   not an instant disappearance.
5. Once the animation completes, `AnimatePresence` finally lets React
   actually remove the element from the DOM — the real unmount, deferred
   until exactly this point.

## What Breaks Without This

Reverting to unconditional rendering (Lesson 23's original code, no
`AnimatePresence`, no `motion.div`): both panels always render,
regardless of tab count — a panel with zero tabs shows an empty strip
with `"No panels open."`, permanently occupying its width even when
completely unused. No animation, no conditional unmount, no error — just
the older, real, always-present-panel behavior this lesson replaces.

## Exercises

1. Resize a panel to its minimum width, then close its last tab, and
   confirm live that the exit animation's slide distance still matches
   the panel's actual current width (`x: "100%"` of *that* width), not a
   fixed distance computed at some other size.
2. Add a `key` mismatch on purpose (hardcode both panels to
   `key="sidepanel"`) and observe what `AnimatePresence` does when one
   panel closes while the other stays open — explain the real, resulting
   bug from what you see, in terms of how `AnimatePresence` actually
   uses `key` to track identity.
3. Trigger the still-real `"No panels open."` edge case named in this
   lesson's own SE Lens (get `tabs.length > 0` while `activeTabId`
   matches nothing in `tabs` — you'll need to read `removeFromPanel`'s
   real logic to construct it) and propose a better real message for
   that specific, narrower case.

## Definition of Done

- [ ] A panel with zero tabs doesn't render at all — verified live, not
      just visually hidden.
- [ ] Closing a panel's last tab plays a real slide-out exit animation
      before the panel is actually removed — verified live.
- [ ] Opening a panel from zero tabs plays a real slide-in enter
      animation — verified live.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `git commit` — message explaining that this is new feature work
      (no reference counterpart), naming the newly-unreachable-in-one-case
      `"No panels open."` branch and the unused `.side-panel.undocked`
      CSS class honestly rather than silently.
