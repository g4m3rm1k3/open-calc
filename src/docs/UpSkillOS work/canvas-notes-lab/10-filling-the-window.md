# Lesson 10 — Filling the Window Instead of Floating Inside It

## What You Will Build

Lesson 9 made the canvas itself bigger than its viewport. What was
still wrong: the viewport was a smaller box floating inside a bigger
one, with real padding and a fixed guessed height (`65vh`) between it
and the edges of the window it opened in — visible wasted space that
had nothing to do with the page being pannable. This lesson removes
that padding, makes the viewport fill whatever space its window
actually gives it, and asks for a bigger window in the first place.

## What You Need to Know First

`canvas-notes-lab/01-...md` through `09-...md` — assumed fresh.
Nothing new at the JavaScript level here — this lesson is entirely
about CSS flexbox sizing and one small piece of shared
infrastructure (covered in its own lesson, cited below, since it
affects every lab, not just this one).

---

## The Lesson

### Where you're working

Two modified files: `CanvasNotesPage.jsx` (the content-area wrapper
around the page title and `PageCanvas`) and `PageCanvas.jsx` (its own
root element and scroll viewport). `meta.js` gains two fields.

### Concept Unit: Flexbox's `flex-1` Doesn't Fill Unless Its Whole Ancestor Chain Agrees To

#### The Problem

`PageCanvas`'s scroll viewport was `style={{ height: '65vh' }}` — a
guess, unrelated to how much space its parent actually had to give it.
Its parent, in turn, had `className="flex-1 p-8 overflow-auto"` — `p-8`
adds 32px of empty space on every side regardless of how much room is
available. Neither number describes "however much space this
component actually has" — they're both independent guesses that
happen to look reasonable at one particular window size.

#### Introduce the Concept in Isolation

```html
<!-- A flex column: header (fixed height) + a child meant to fill the rest -->
<div style="display:flex; flex-direction:column; height:300px; border:1px solid;">
  <div style="flex-shrink:0; height:40px; background:#eee;">header</div>
  <div style="flex:1; overflow:auto; background:#cde;">
    <div style="height:800px;">tall content</div>
  </div>
</div>
```

Run this in a browser and the middle `flex:1` div does NOT scroll —
it grows to fit its 800px-tall child instead of staying capped at the
260px (300 − 40) actually available. Add exactly one more property:

```html
<div style="flex:1; min-height:0; overflow:auto; background:#cde;">
```

Now it does scroll, capped correctly at 260px.

**What this proves:** `flex: 1` alone means "grow to take available
space, but never shrink smaller than your content needs" — a flex
item's default `min-height` is `auto`, which in practice means "at
least as tall as whatever's inside it," not "zero." An 800px-tall
child inside a `flex:1` box therefore drags the *box itself* up to
800px tall, blowing straight through the 260px the parent actually
had. `min-height: 0` overrides that default, letting the box actually
shrink to the space it was assigned and let `overflow: auto` do its
job. This is one of the most common flexbox surprises there is —
if a scrollable flex child ever refuses to actually scroll, this is
almost always why.

#### Discard the Throwaway Example

#### Project Change

- **Files:** `CanvasNotesPage.jsx`, `PageCanvas.jsx`
- **Change type:** modify (remove fixed padding/height, add proper flex fill)

#### The New Code

```jsx
// CanvasNotesPage.jsx — the content-area wrapper
<div className="flex-1 min-h-0 flex flex-col overflow-hidden">
  <h2 className="shrink-0 px-3 py-1.5 text-sm font-semibold ...">
    {activePage?.title ?? 'No page selected'}
  </h2>
  {activePageId && <PageCanvas ... />}
</div>
```

```jsx
// PageCanvas.jsx — its own root, and the scroll viewport
<div className="flex flex-col flex-1 min-h-0">
  {selectedText && <TextFormatToolbar ... />}
  <div ref={scrollRef} className="flex-1 min-h-0 w-full overflow-auto">
    <div>
      <canvas ref={canvasElRef} />
    </div>
  </div>
  {/* note overlays */}
</div>
```

#### The Updated Project

(Shown above — the complete relevant JSX from both files; nothing
else in either component's structure changed.)

#### Mechanical Walkthrough

`min-h-0` (Tailwind's class for `min-height: 0`) appears on *every*
link in the chain that's supposed to shrink to fit available space
rather than grow to fit its content: `CanvasNotesPage`'s content
wrapper, and `PageCanvas`'s own root and its scroll viewport. Miss it
on any single one of these three, and that link reverts to
content-sized instead of parent-sized, and the "fill the window"
behavior breaks at exactly that point in the chain, however correct
the other two are. `shrink-0` on the `<h2>` is the opposite
instruction — this element should *never* be compressed by its
flex-column siblings fighting for space, since it's a single line of
text that should just take whatever height it naturally needs, leaving
`PageCanvas` (the actual `flex-1`) everything else.

#### CS Lens

A layout system where every level of nesting has to correctly declare
"I grow" vs. "I shrink to content" vs. "I stay fixed," and one wrong
declaration anywhere in the chain breaks the whole result, is a
constraint-propagation problem — the same shape as type inference
propagating constraints through an expression tree, or a spreadsheet's
formulas needing every cell in a dependency chain to recalculate
correctly for the final cell to be right. **Recognized in:** any
layout engine (CSS Grid, a native mobile UI's constraint layout, even
LaTeX's box model) where "how big is this thing" is answered by
walking a tree of nested boxes, each contributing its own rule.

#### SE Lens

The alternative to fixing every link in the chain would have been
picking one "big enough" fixed pixel value (the `65vh` this lesson
removes is exactly that kind of shortcut) and calling it done — it
looks fine at whatever window size you happened to test it at, and
silently wastes space or overflows at every other size. Chasing down
`min-h-0` at each level costs more thought up front but means the
layout is actually *correct* — genuinely filling whatever space it's
given — rather than merely *plausible* at one specific size.

#### Connect to What Came Before

Lesson 9 made the canvas itself deliberately bigger than any viewport.
This lesson makes the *viewport* honest about how big it actually is
— no longer a guessed constant, but whatever its real container
provides, which is what makes Lesson 9's Pan tool actually worth
having: more real viewport means less panning needed to see the same
amount of page.

---

## Connect the Pieces

Removing `p-8` and the guessed `65vh` and replacing them with a
`flex-1 min-h-0` chain from `CanvasNotesPage`'s content wrapper down
through `PageCanvas`'s own root and its scroll viewport means the
canvas viewport now genuinely fills whatever space the floating window
gives it — no wasted margin, no arbitrary height cap. Asking for a
bigger window in the first place (`width`/`height` added to
`meta.js`) is covered in its own lesson,
[`floating-window-default-size/01-...md`](../floating-window-default-size/01-clamping-a-window-to-the-screen-it-opens-on.md),
since fixing it properly meant fixing a bug in `FloatingWindow.jsx`
that affects every lab in this app, not just this one.

## What Breaks Without This

Verified live, this session, at two different screen sizes: at
1600×1000, the canvas viewport correctly fills essentially the entire
window (1086×698 out of a 1280×860 window, the difference being the
section/page tab bars and the compact title, not wasted padding).
Before the fix, the same window showed a canvas box roughly 65% of the
available height, with visible empty margin on every side — the exact
complaint that prompted this lesson.

## Exercises

- Resize the floating window smaller, then larger, while watching the
  canvas viewport. Confirm it always fills the available space rather
  than staying at whatever size it was when the window first opened.
- Find one other place in this codebase using a `vh`-based fixed
  height for something that's actually meant to fill a flex parent,
  and decide whether it has the same `min-h-0`-missing problem this
  lesson fixed.

## Definition of Done

- [ ] `CanvasNotesPage`'s content wrapper has no fixed padding; its
      `<h2>` is `shrink-0`, its `PageCanvas` child is the `flex-1`
- [ ] `PageCanvas`'s root and its scroll viewport are both
      `flex-1 min-h-0`, not a fixed `vh` value
- [ ] Verified live, this session: at two different screen sizes, the
      canvas viewport measurably fills nearly all of its window, with
      no large unused margin
- [ ] You can explain, without notes, why `flex: 1` alone wasn't
      enough, and what `min-height: 0` actually overrides
- [ ] `git commit` with a message explaining why — for example: "Make
      the canvas-notes viewport actually fill its window instead of
      floating inside fixed padding and a guessed 65vh height — every
      link in the flex chain needed min-h-0, or that one link reverts
      to content-sized instead of parent-sized"
