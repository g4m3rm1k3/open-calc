# React Studio — Lesson 15 — Shortcuts and Shipping

## What You Will Build

Delete removes the selected widget. Ctrl+C copies it; Ctrl+V pastes a copy, offset
slightly so it is visibly distinct from the original. None of this interferes with
typing in the Properties Panel's own text fields. And the project is built for
production and published at a real, public URL — the last lesson, and the first
time this project is something you can send a link to.

---

## What You Need to Know First

Lesson 14 left every widget type's behaviour in `widgetRegistry`, and lesson 09's
`useEffect`-based `keydown` listener already handling Ctrl+Z / Ctrl+Shift+Z.

---

## Step 1 — Delete Selected Widgets

**The problem:** Nothing removes a widget once it exists.

Add to `WidgetAction` and `applyWidgetAction`:

```tsx
type WidgetAction =
  | { type: 'ADD_WIDGET'; widget: Widget }
  | { type: 'UPDATE_WIDGET'; id: string; updates: Partial<Widget> }
  | { type: 'UPDATE_WIDGET_LIVE'; id: string; updates: Partial<Widget> }
  | { type: 'GROUP_WIDGETS'; group: GroupWidget; groupedIds: string[] }
  | { type: 'DELETE_WIDGETS'; ids: string[] }
  | { type: 'BEGIN_INTERACTION' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

function applyWidgetAction(widgets: Widget[], action: WidgetAction): Widget[] {
  switch (action.type) {
    // ...existing cases...
    case 'DELETE_WIDGETS':
      return widgets.filter((widget) => !action.ids.includes(widget.id));
    default:
      return widgets;
  }
}
```

---

## Step 2 — One Consolidated Keyboard Listener

**The problem:** This project already has one `keydown` listener (lesson 09, for
undo/redo). Adding delete and copy/paste as a *second*, separate listener would
work, but two listeners independently reading overlapping keyboard state is a
maintenance cost with no benefit — consolidate them into one.

```tsx
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isTypingInField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    const isUndo = (event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey;
    const isRedo = (event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey;
    const isCopy = (event.ctrlKey || event.metaKey) && event.key === 'c' && !isTypingInField;
    const isPaste = (event.ctrlKey || event.metaKey) && event.key === 'v' && !isTypingInField;
    const isDelete = (event.key === 'Delete' || event.key === 'Backspace') && !isTypingInField;

    if (isUndo) {
      event.preventDefault();
      dispatch({ type: 'UNDO' });
    } else if (isRedo) {
      event.preventDefault();
      dispatch({ type: 'REDO' });
    } else if (isDelete && selectedIds.length > 0) {
      dispatch({ type: 'DELETE_WIDGETS', ids: selectedIds });
      setSelectedIds([]);
    } else if (isCopy && selectedIds.length > 0) {
      setClipboard(widgets.filter((widget) => selectedIds.includes(widget.id)));
    } else if (isPaste && clipboard.length > 0) {
      const pastedWidgets = clipboard.map((widget) => ({
        ...widget,
        id: crypto.randomUUID(),
        x: widget.x + 20,
        y: widget.y + 20,
      }));
      pastedWidgets.forEach((widget) => dispatch({ type: 'ADD_WIDGET', widget }));
      setSelectedIds(pastedWidgets.map((widget) => widget.id));
    }
  }

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedIds, widgets, clipboard]);
```

Add `const [clipboard, setClipboard] = useState<Widget[]>([]);` alongside `App`'s
other state.

Save and reload. Select a widget, press Delete: it disappears. Press Ctrl+C, then
Ctrl+V: a copy appears, offset by 20 pixels so it does not sit exactly on top of the
original, and is immediately selected.

**Walkthrough:** `target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'`
checks what the keystroke's real target was, not just what is currently selected on
the canvas. `event.target`, for a `keydown` event, is whatever DOM element actually
has focus at the moment of the key press — while editing the Properties Panel's
label field, that is the `<input>` itself, not the canvas. Without this check,
pressing Backspace while correcting a typo in a text field would delete the entire
selected widget instead of one character — a real, serious, easy-to-hit bug the
moment delete and text editing exist in the same application and share the same key.

**The Aha moment — this is the bug lesson 02 predicted, now finally real.** Delete
a widget from the *middle* of a multi-widget selection. Every widget rendered after
it in the array shifts down by one array index. Because every list in this project
— the canvas, the Layers Panel — has used `key={widget.id}` since the very first
list this project ever rendered, this works correctly, with no visible glitch at
all. Temporarily change any one `key` prop to use the widget's array index instead,
repeat the same delete, and watch: a widget's selection highlight, or (if you had
one mid-edit) a text field's focus, sticks to the wrong shape — the exact,
previously-only-described failure mode from lesson 02's "What Breaks Without This"
section, reproducible for the first time now that deletion actually exists. Revert
the key back to `widget.id` afterward.

**SE lens — this effect's dependency array is not a lesson-12 problem.**
`[selectedIds, widgets, clipboard]` means this effect re-attaches its listener
whenever any of these change — including on every single drag update, since
`widgets` changes constantly during a drag. This is a real cost, but a categorically
different one from lesson 12's: attaching or removing one `window` event listener
is a cheap, constant-time operation, nothing like re-rendering hundreds of
component instances. Optimising this specific effect further, the way lesson 12
optimised `WidgetView`, would be solving a problem that was never actually measured
to exist — exactly the discipline lesson 12 itself established: measure first,
optimise what the measurement actually shows.

---

## Step 3 — Build and Deploy

**The problem:** `npm run dev` is a development-only server. Getting this project
in front of anyone else requires a production build, published somewhere public.

```
npm run build
```

This runs Vite's production build: **bundling** every file into a small number of
JavaScript files, **minification** stripping whitespace and shortening internal
names, and **tree-shaking** removing any code nothing in the project actually
imports — the same three transformations
[Frontend Client](../frontend-client/README.md)'s own final lesson explained in
full. The output lands in `dist/` — add it to `.gitignore`, since, like
`node_modules`, it is fully reproducible from source by running `npm run build`
again.

```
npm run preview
```

Serves the real, built `dist/` output locally, exactly as a static host would —
click through every feature (add widgets of every type, group, undo, save/reload,
preview, delete, copy/paste) before publishing anywhere, since this is your last
chance to catch anything that only breaks in the production build.

**Deploy** `dist/` to any static host — GitHub Pages, Netlify, Vercel, or Cloudflare
Pages all have a genuinely free tier suitable for a project like this; follow
whichever host's own current documentation for the exact steps, since hosting UIs
change over time and the underlying concept — upload or connect a folder of static
files — does not.

**Concept — this project needed no special deployment configuration at all.**
Unlike [Frontend Client](../frontend-client/README.md), which specifically chose
hash-based routing so a static host would never need special "redirect every path
back to index.html" configuration, this project has no routes or pages to begin
with — it is one single page, one single view, the entire time. There is nothing
here for a static host to get wrong: it serves one `index.html`, one JavaScript
bundle, and this project runs correctly the instant that file loads, in exactly the
same way `npm run preview` already confirmed locally.

---

## Connect the Pieces

```
src/App.tsx      DELETE_WIDGETS added to the reducer; one consolidated keydown
                 listener handles undo, redo, delete, copy, and paste together
dist/            The final, built, minified output — what actually gets deployed
```

---

## What Breaks Without This

**Without the `isTypingInField` check:** Click into the Properties Panel's label
field to fix a typo, press Backspace to delete the last character. Instead, the
entire selected widget disappears from the canvas — the keystroke correctly reached
the input's own text-editing behaviour *and* this project's global delete handler,
both firing from the exact same keypress, because nothing told the global handler
to stand down while a text field has focus.

**Without consolidating into one listener (keeping lesson 09's undo/redo listener
and this lesson's delete/copy/paste listener as two separate `useEffect` calls):**
Nothing breaks functionally — both listeners would still correctly receive every
keydown. What is lost is a single place to reason about "what does this project do
in response to a keypress," split instead across two files or two locations for no
reason other than the order the features were built in.

---

## Definition of Done

- [ ] Delete/Backspace removes the selected widget(s), except while typing in a text field
- [ ] Ctrl+C and Ctrl+V copy and paste the current selection, offset from the original
- [ ] Undo correctly reverses a delete or a paste, exactly like every other action since lesson 09
- [ ] `npm run build` completes cleanly; `npm run preview` shows a fully working copy of the project
- [ ] The project is live at a real, public URL
- [ ] You can explain what `event.target` refers to during a `keydown` event, and why it matters here specifically
- [ ] You can reproduce, on purpose, the index-vs-id key bug lesson 02 predicted, by temporarily breaking a `key` prop
- [ ] You can explain why this project's deployment needed no special static-host configuration, unlike its sibling project
- [ ] Run:
      ```
      git add src/App.tsx .gitignore
      git commit -m "Add delete, copy, and paste; consolidate keyboard handling; ship to production"
      ```

---

*This is the last lesson in the written curriculum so far. The project renders,
selects, drags, resizes, types, groups, undoes, persists, performs, previews,
extends, and ships — a real, working low-code application builder, built entirely
from first principles, one felt need at a time. From here, the same process that
built every feature in this project — notice a real gap, build the smallest working
piece that closes it, name the concept it embodies, connect it to what already
exists — is exactly how you would keep extending it: resizing handles on the
selection outline, an alignment/snapping grid, exporting the design as real
importable code. Nothing about the shape of the work changes; only the feature
does.*
