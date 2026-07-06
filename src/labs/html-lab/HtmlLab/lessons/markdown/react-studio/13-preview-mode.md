# React Studio — Lesson 13 — Preview Mode

## What You Will Build

A "▶ Preview" button opens a full-screen overlay showing the canvas exactly as an
end user would experience it: no selection outlines, no drag handles, no Properties
Panel — and, for the first time, a button widget's configured action actually fires
from a real click, not just the panel's "Run" test button from lesson 10. This
requires rendering somewhere the normal component tree does not naturally reach:
a **Portal**.

---

## What You Need to Know First

Lesson 12 left `WidgetView` memoised, rendering widgets via `renderWidgetContent`,
with `AppRuntimeProvider` (lesson 10) supplying `useAppRuntime()` to any descendant.

---

## Concept: Why This Cannot Just Be Another `<div>` in the Normal Layout

A preview needs to cover the *entire* viewport, above everything else, regardless
of what container it happens to be logically rendered inside. Rendering it as an
ordinary nested element deep inside the editor's layout — inside a flex container
that already manages the canvas, the Properties Panel, and the Layers Panel side by
side — means its own sizing and stacking are now entangled with all of that
surrounding layout, for a feature whose entire purpose is to *not* look like the
editor at all.

A React **Portal** solves exactly this: it lets a component's output be inserted
directly into a completely different point in the actual DOM tree — often
`document.body` itself — while remaining, in every other sense that matters to
React, exactly where it was written in your JSX.

---

## Step 1 — Build the Preview Rendering Path

**The problem:** Preview mode needs to render widgets, including a button's *real*
click behaviour, without any of the selection or dragging machinery `WidgetView`
carries.

```tsx
function PreviewWidget({ widget }: { widget: Widget }) {
  const { increment } = useAppRuntime();

  function renderContent() {
    switch (widget.type) {
      case 'rectangle':
        return <div style={{ width: '100%', height: '100%', backgroundColor: widget.color }} />;
      case 'circle':
        return <div style={{ width: '100%', height: '100%', backgroundColor: widget.color, borderRadius: '50%' }} />;
      case 'text':
        return <div style={{ width: '100%', height: '100%', fontSize: widget.fontSize }}>{widget.text}</div>;
      case 'button':
        return (
          <button
            style={{ width: '100%', height: '100%' }}
            onClick={widget.action === 'increment' ? increment : undefined}
          >
            {widget.label}
          </button>
        );
      case 'group':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {widget.children.map((child) => (
              <div
                key={child.id}
                style={{ position: 'absolute', left: child.x, top: child.y, width: child.width, height: child.height }}
              >
                <PreviewWidget widget={child} />
              </div>
            ))}
          </div>
        );
      default: {
        const exhaustiveCheck: never = widget;
        return exhaustiveCheck;
      }
    }
  }

  return (
    <div style={{ position: 'absolute', left: widget.x, top: widget.y, width: widget.width, height: widget.height }}>
      {renderContent()}
    </div>
  );
}
```

**Walkthrough:** `onClick={widget.action === 'increment' ? increment : undefined}`
is where preview mode diverges from the editor for the first time: this button's
`onClick` is real, wired directly to `increment` from `useAppRuntime()`, firing on
an actual click, exactly as a finished application's button would. `undefined` as
an `onClick` value is valid and means "no handler" — a button with `action: 'none'`
stays a real, inert button, correctly.

**SE lens — an honest, named duplication.** `PreviewWidget`'s `case 'rectangle'`,
`'circle'`, and `'text'` branches are visually identical to `renderWidgetContent`'s
— the same shapes, drawn the same way, duplicated into a second function because
this one also needs a completely different `'button'` case and no selection/drag
props at all. This is real, felt duplication, not a hypothetical one — and lesson
14 exists specifically to resolve it properly, once there is a natural place (a
widget type registry) for "how does this widget type render" to be defined exactly
once and reused by both the editor and the preview.

---

## Step 2 — Render the Overlay Through a Portal

**The problem:** The preview needs to occupy the entire screen, unaffected by
whatever layout the editor around it uses.

```tsx
import { createPortal } from 'react-dom';

function PreviewOverlay({ widgets, onClose }: { widgets: Widget[]; onClose: () => void }) {
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#ffffff', zIndex: 9999 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
        Close Preview
      </button>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {widgets.map((widget) => (
          <PreviewWidget key={widget.id} widget={widget} />
        ))}
      </div>
    </div>,
    document.body,
  );
}
```

Add to `App`:

```tsx
const [isPreviewOpen, setIsPreviewOpen] = useState(false);

// in the toolbar:
<button onClick={() => setIsPreviewOpen(true)}>▶ Preview</button>

// inside the AppRuntimeProvider, alongside everything else App already renders:
{isPreviewOpen && (
  <PreviewOverlay widgets={widgets} onClose={() => setIsPreviewOpen(false)} />
)}
```

Save and reload. Click "▶ Preview": a full-screen view of the canvas appears,
covering everything. Click a configured button: the counter actually increments,
from a real click, for the first time. Click "Close Preview": back to the editor,
exactly as it was.

**Walkthrough:** `createPortal(children, domNode)` is the function that makes this
work: `children` (the `<div>` and everything inside it) is rendered into `domNode`
(`document.body`, a real DOM node that already exists, outside of and above
wherever `App`'s own root element lives) instead of as a DOM child of whatever
element `PreviewOverlay` is written inside in JSX.

**CS lens — a portal changes DOM placement, not the React tree.** This is the
detail that makes portals actually useful rather than just confusing: even though
`PreviewOverlay`'s real `<div>` ends up as a direct child of `<body>` in the actual
DOM, it is still, as far as React itself is concerned, exactly where it appears in
your JSX — a descendant of `<AppRuntimeProvider>`. This is precisely why
`PreviewWidget`'s call to `useAppRuntime()` works correctly: **Context follows the
React component tree, never the DOM tree**, and a portal only ever changes the
latter. The same is true of event bubbling in React's own synthetic event system: a
click inside a portal still bubbles up through the React tree it is logically part
of, not just the DOM subtree it happens to render into.

**Concept — why a portal, when `position: fixed` alone often already escapes
layout.** In this project specifically, nothing in the editor's CSS currently uses
a `transform`, `filter`, or similarly layout-isolating property, so a
`position: fixed` overlay would likely cover the screen correctly even rendered in
its normal DOM position, with no portal at all. Relying on that is fragile: CSS
`transform` creates a new **containing block** for any `position: fixed`
descendant, meaning a fixed element becomes fixed *relative to that transformed
ancestor* instead of the real viewport — a common, easy-to-introduce change (adding
a hover animation to a container, for instance) that would silently break an
un-ported overlay, clipping or mispositioning it, with no error, only a visibly
wrong result. Rendering to `document.body` via `createPortal` removes this fragility
permanently, regardless of what styling the rest of this project ever gains.

---

## Connect the Pieces

```
src/App.tsx           isPreviewOpen: boolean; a portal-based overlay conditionally rendered
PreviewWidget           A parallel, real-click-enabled rendering path for widgets
PreviewOverlay          Uses createPortal to escape the editor's own DOM structure
                        entirely, while staying inside the React tree for Context
```

---

## What Breaks Without This

**Without the portal (rendering `PreviewOverlay`'s content directly in place
instead):** Add a subtle hover animation to the canvas container later — a single
`transform: scale(1.0)` for a hover-zoom effect, say. The preview overlay,
un-ported, would suddenly be clipped to that container's bounds instead of
covering the real viewport, with the bug appearing to have nothing to do with the
overlay's own code at all — the actual cause would be an unrelated style change to
a completely different component.

**Wiring `PreviewWidget`'s button `onClick` directly to `increment` without
checking `widget.action`:** Every button, regardless of its configured action,
would increment the counter on click — including ones a user deliberately set to
"None," which the UI explicitly told them meant "does nothing."

---

## Definition of Done

- [ ] "▶ Preview" opens a full-screen overlay showing every widget, correctly positioned
- [ ] The overlay shows no selection outlines, drag behaviour, or editor chrome
- [ ] Clicking a button configured with "Increment Counter" actually increments it, from a real click
- [ ] "Close Preview" returns cleanly to the editor
- [ ] You can explain what a portal changes about where something renders, and what it does not change
- [ ] You can explain why Context still works correctly inside a portal
- [ ] You can explain, concretely, a scenario where a `position: fixed` overlay would break without a portal
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Add a Preview mode rendered via a Portal; button actions fire for real for the first time"
      ```

---

*Next: Lesson 14 — The Widget Registry. Every widget type so far required editing
one shared switch statement in at least two places (rendering, and now preview
rendering) every time a new type was added. This lesson replaces that with a
registry — a plugin architecture where adding a widget type means writing one new
file, and changing nothing that already exists.*
