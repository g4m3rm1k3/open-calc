# FlowBoard Masterclass — LAB 28 — Keyboard Accessibility: ARIA, Tab Order, and Focus Management

**Prerequisites:** LAB-27 — Card sorting.

**What this lab adds:**
- `aria-label`, `aria-expanded`, `aria-pressed` — ARIA attributes
- `tabIndex` — controlling keyboard focus order
- Focus management — programmatically setting focus when UI changes
- `role` — semantic roles for non-semantic HTML
- Keyboard-only usage audit — testing your app without a mouse
- Screen reader basics — how assistive technology reads your app

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. An icon button has no text: `<button onClick={deleteCard}><TrashIcon /></button>`. What ARIA attribute gives it an accessible name, and why does it matter for screen readers?
> 2. What does `tabIndex={-1}` do? When would you use it?
> 3. When a modal opens, where should keyboard focus go? What happens to focus when the modal closes?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

FlowBoard becomes fully usable with keyboard only:
- All interactive elements are reachable by Tab
- Buttons have accessible names
- The modal manages focus (opens with focus inside, returns focus on close)
- Cards announce their priority to screen readers
- Skip navigation link lets keyboard users bypass the sidebar

---

## Concept: Why Accessibility Matters

**The business case:**

Accessibility (a11y) is required by law for many organizations (WCAG 2.1 AA under ADA, Section 508 in the US, EN 301 549 in the EU). More practically: ~1 in 5 people has a disability affecting how they use technology. Keyboard-only users include people with motor disabilities, users on devices without mice, and power users who prefer keyboards.

**The technical reality:**

Accessibility is significantly harder to add retroactively than to build in. A button added without an `aria-label` might be described by a screen reader as "button" — or described by the SVG's path data, which is meaningless. Fixing this after hundreds of components are built requires auditing every component.

**The stack:**

```
HTML semantics                → gets you 80% of the way
  <button> vs <div onClick>
  <nav>, <main>, <aside>
  <label> with <input>

ARIA attributes               → fill in the gaps
  aria-label, aria-expanded
  aria-describedby, aria-live

Focus management              → for dynamic UIs
  programmatic .focus()
  focus traps in modals
```

---

## Concept: ARIA Attributes

ARIA (Accessible Rich Internet Applications) is a set of HTML attributes that tell assistive technologies what elements do and what their current state is.

**`aria-label`** — gives an element an accessible name:
```html
<button aria-label="Delete card 'Fix navigation bug'">
  <TrashIcon />
</button>
<!-- Screen reader: "Delete card Fix navigation bug, button" -->
```

**`aria-expanded`** — tells whether a disclosure widget is open:
```html
<button aria-expanded={isOpen} onClick={toggle}>
  Advanced options
</button>
<!-- Screen reader: "Advanced options, collapsed, button" (or "expanded") -->
```

**`aria-pressed`** — toggle button state:
```html
<button aria-pressed={isActive} onClick={toggle}>
  Bold
</button>
<!-- Screen reader: "Bold, pressed, toggle button" (or "not pressed") -->
```

**`aria-live`** — announces dynamic content changes:
```html
<div aria-live="polite">
  {successMessage}  {/* announced when it changes */}
</div>
```
`polite` — waits for user to finish what they're doing. `assertive` — interrupts immediately (use sparingly).

**`aria-describedby`** — points to an element providing description:
```html
<input id="title" aria-describedby="title-hint" />
<p id="title-hint">The card title will appear on the board.</p>
```

---

## Concept: Tab Order and `tabIndex`

By default, interactive elements (buttons, links, inputs, selects) are in the tab order. Non-interactive elements (divs, spans) are not.

**`tabIndex={0}`** — adds an element to the tab order (in source order):
```html
<div tabIndex={0} role="button" onClick={handleClick}>
  Click me
</div>
```
But: if you need to add `tabIndex={0}` and `role="button"`, use a real `<button>` instead. `<button>` gives you tab focus, click, keyboard activation (Enter/Space), disabled state, and accessible role — for free.

**`tabIndex={-1}`** — removes element from tab order but allows programmatic focus:
```typescript
const ref = useRef<HTMLButtonElement>(null);
// Tab won't reach this button
// But you can still programmatically focus it:
ref.current?.focus();
```

Use case: modal management — the first interactive element in a modal should receive focus when the modal opens. The modal's close button might be `tabIndex={-1}` if it shouldn't be the first Tab stop, but still reachable programmatically.

**Skip navigation:**
```html
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
<main id="main-content">...</main>
```

The skip link is visually hidden but appears when focused. It allows keyboard users to skip past navigation to the main content. WCAG 2.1 Level A requires this for pages with repeated navigation.

---

## Step 1 — Add accessible names to icon buttons

In `Card.tsx`, update action buttons:

```tsx
<button
  className="card-btn card-btn--delete"
  onClick={() => props.onDelete(card.id)}
  aria-label={`Delete card "${card.title}"`}
  title={`Delete "${card.title}"`}
>
  ✕
</button>

<button
  className="card-btn card-btn--move-left"
  onClick={props.onMoveLeft}
  aria-label={`Move card "${card.title}" to previous list`}
  disabled={!props.onMoveLeft}
>
  ←
</button>

<button
  className="card-btn card-btn--move-right"
  onClick={props.onMoveRight}
  aria-label={`Move card "${card.title}" to next list`}
  disabled={!props.onMoveRight}
>
  →
</button>
```

---

## Step 2 — Add ARIA to modal

Update `Modal.tsx`:

```tsx
<div
  className="modal-backdrop"
  onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"    // points to the title element
>
  <div className="modal-content">
    <div className="modal-header">
      <h2 id="modal-title" className="modal-title">{title}</h2>
      <button
        className="modal-close-btn"
        onClick={onClose}
        aria-label="Close dialog"
      >
        ×
      </button>
    </div>
    {children}
  </div>
</div>
```

---

## Step 3 — Focus management in the modal

Update `Modal.tsx` to focus the first interactive element when opening, and return focus when closing:

```tsx
import { useEffect, useRef, ReactNode } from 'react';

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first interactive element inside modal
      const focusable = modalRef.current?.querySelector<HTMLElement>(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    } else {
      // Return focus to where it was before modal opened
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={modalRef}
      className="modal-backdrop"
      // ...
    >
      ...
    </div>,
    document.body
  );
}
```

---

## Step 4 — Add skip navigation link

Update `src/App.tsx` (or the main layout):

```tsx
// Add at the very top of the page layout:
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// On the main content area:
<main id="main-content">
  {/* boards, lists, cards */}
</main>
```

Add to `App.css` or `index.css`:

```css
.skip-link {
  position: absolute;
  top: -100%;           /* offscreen by default */
  left: 16px;
  background: #4299e1;
  color: white;
  padding: 8px 16px;
  border-radius: 0 0 4px 4px;
  text-decoration: none;
  z-index: 10000;
  font-size: 14px;
}

.skip-link:focus {
  top: 0;               /* appears when focused */
}
```

---

## Step 5 — Announce undo toast with `aria-live`

Update the undo toast in `BoardPage.tsx`:

```tsx
<div
  className="undo-toast"
  role="alert"                    /* assertive aria-live region */
  aria-live="assertive"
>
  <span>"{undoMessage.title}" deleted.</span>
  <button onClick={handleUndoDelete}>Undo</button>
</div>
```

`role="alert"` is equivalent to `aria-live="assertive"` + `aria-atomic="true"` — the screen reader announces the full message immediately when it appears.

---

## Step 6 — Priority badge accessibility

Update `PriorityBadge.tsx`:

```tsx
<span
  className={`priority-badge ${PRIORITY_CLASS[priority]}`}
  aria-label={`Priority: ${PRIORITY_LABELS[priority]}`}
>
  {PRIORITY_LABELS[priority]}
</span>
```

The `aria-label` is explicit about what the badge means — "Priority: Urgent" is clearer to screen readers than just "🔥 Urgent".

### SAVE AND TRY (keyboard only)

1. Press Tab — verify focus moves through all interactive elements
2. Reach a delete button — hear "Delete card [title], button" (if using screen reader)
3. Tab into the board title area — press Enter to edit
4. Open a card modal with Enter — verify focus moves inside modal
5. Press Escape — modal closes, focus returns to the card that opened it
6. Tab with modal open — verify focus stays inside modal

---

## 🎯 Challenge: Implement a simple focus trap in the modal

**You know:** `useRef`, `querySelectorAll`, `addEventListener`, keyboard events.

**Task:** The modal currently focuses the first element on open but doesn't trap focus. Add a focus trap: when Tab is pressed on the last focusable element in the modal, it wraps to the first; when Shift+Tab is pressed on the first, it wraps to the last.

**Hints:**
- `querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')` gets all focusable elements
- Listen for `keydown` on the modal element
- Check `e.key === 'Tab'` and `e.shiftKey`
- `e.preventDefault()` to stop the browser's default Tab behavior

---

<details>
<summary>▶ Show Solution</summary>

```typescript
// In Modal.tsx, add to the useEffect for the keydown listener:
useEffect(() => {
  if (!isOpen) return;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onClose]);
```

**Key insight:** A focus trap is not just a nice-to-have. Without it, pressing Tab from inside the modal moves focus to the browser's address bar or the browser controls — the modal is still visible and no keyboard path leads back into it. This completely breaks keyboard navigation. WCAG 2.1 criterion 2.1.2 (No Keyboard Trap) requires that focus can always be moved away from a component using keyboard, but for modals, ARIA Authoring Practices 1.2 defines the correct behavior as a focus trap with Escape as the exit.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| All buttons have accessible names | Hover any icon button → tooltip appears |
| Delete button says card name | aria-label includes card title |
| Modal announces title on open | Screen reader hears the dialog title |
| Focus moves into modal when opened | Tab through page → open modal → focus inside |
| Focus returns to card when modal closes | Close modal → verify focus on card |
| Skip link appears on first Tab | Tab from top of page → skip link visible |
| Undo toast announced immediately | Delete board → screen reader announces |
| Keyboard-only board navigation | Use only keyboard for 2 minutes |
| Tab doesn't leave modal | Tab from last modal element → wraps to first |
| Priority badge has aria-label | Check PriorityBadge markup |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. `aria-label` on icon buttons:**

Without an accessible name, a screen reader announces the element by its text content, `aria-labelledby` target, or `aria-label`. An icon button like `<button><TrashIcon /></button>` has no text content and the SVG is typically meaningless to screen readers (it might announce the SVG's path data or nothing). `aria-label="Delete card 'Fix bug'"` provides the accessible name the screen reader announces: "Delete card Fix bug, button." This is how blind users know what a button does. Without it, they hear "button" — not helpful when there are six identical "button" elements on screen (one per card).

**2. `tabIndex={-1}`:**

`tabIndex={-1}` removes an element from the natural tab order — Tab won't focus it. But it can still receive focus programmatically: `element.focus()`. Use cases: (1) Focus management in modals — you need to focus the first modal element on open, but that element might not be naturally the first Tab stop; (2) Virtual list items — items off-screen should not be reachable by Tab; (3) Custom composite widgets — a menu might have one Tab stop for the entire menu, with arrow keys navigating within (the "roving tabindex" pattern).

**3. Focus on modal open/close:**

When a modal opens, focus should move to the first interactive element inside the modal (typically the first input or the close button). This is essential — without it, the keyboard user's focus is still outside the modal and Tab might navigate behind the backdrop, which is visually hidden but still accessible. When the modal closes, focus should return to the element that triggered the modal — typically the card or button the user activated. This preserves the user's context in the page. Failing to return focus means the keyboard user loses their place and must Tab from the beginning of the page.

---

## Next Lab

In **LAB-29**, you will learn **React performance fundamentals**: using React DevTools Profiler to identify unnecessary re-renders, and using `React.memo`, `useMemo`, and `useCallback` to prevent them. You will profile FlowBoard before and after to see concrete rendering improvements.
