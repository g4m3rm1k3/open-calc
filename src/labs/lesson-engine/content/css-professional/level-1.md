---
series: css-professional
level: 1
title: Native HTML Elements
lang: css
---

# Native HTML Elements

Most front-end codebases contain a `<div>` that has been converted into a button, a custom dropdown built from scratch, or a modal that doesn't trap focus. Each one represents dozens of hours of JavaScript written to replicate behavior the browser ships for free — behavior that is also more accessible than the DIY version, because screen readers and keyboard users already know how to use native elements.

`<dialog>`, `<details>`, `popover`, and `<select>` each come with built-in behavior: keyboard navigation, ARIA roles, focus management, and backdrop handling. The browser has had these for years; most developers just haven't adopted them.

By the end of this lesson you will know which native HTML elements replace common custom JavaScript components, understand how to style them with CSS while keeping their native behavior intact, and be able to use `<dialog>`, `<details>`, and `popover` in real UI.

## The `<dialog>` element

```html
<div class="dialog-demo">
  <button class="open-btn" onclick="document.getElementById('demo-dialog').showModal()">
    Open Dialog
  </button>

  <dialog id="demo-dialog" class="styled-dialog">
    <h2>Native Dialog</h2>
    <p>Press Escape to close. Focus is automatically trapped inside. The backdrop is rendered natively — no JavaScript needed for any of this.</p>
    <form method="dialog" class="dialog-footer">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary" value="confirm">Confirm</button>
    </form>
  </dialog>
</div>
```

```css
.dialog-demo { font-family: system-ui, sans-serif; }

.styled-dialog {
  border: none;
  border-radius: 12px;
  padding: 0;
  width: min(480px, 90vw);
  box-shadow: 0 20px 60px rgb(0 0 0 / 0.3);
}

/* The native backdrop pseudo-element */
.styled-dialog::backdrop {
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
}

.styled-dialog h2 { margin: 0; padding: 1.5rem 1.5rem 0; font-size: 1.1rem; color: #0f172a; }
.styled-dialog p  { margin: 0.75rem 0 0; padding: 0 1.5rem; font-size: 0.875rem; color: #475569; line-height: 1.6; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1.25rem 1.5rem; border-top: 1px solid #e2e8f0; margin-top: 1.25rem; }

.open-btn  { padding: 0.5rem 1.25rem; background: #6366f1; color: white; border: none; border-radius: 7px; font-weight: 600; cursor: pointer; }
.btn-primary   { padding: 0.5rem 1.25rem; background: #6366f1; color: white; border: none; border-radius: 7px; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 0.5rem 1.25rem; background: transparent; color: #475569; border: 1px solid #e2e8f0; border-radius: 7px; cursor: pointer; }
```

**CS lens:** `<dialog>` with `.showModal()` enables the browser's native **top-layer** — a separate rendering layer above everything else, including elements with `z-index: 999999`. This is why modal dialogs no longer need `z-index` management. The `::backdrop` pseudo-element is also rendered in the top layer. `<form method="dialog">` submits the form by closing the dialog, with `dialog.returnValue` set to the submitting button's `value` attribute — enabling confirm/cancel patterns without any event listeners.

## `<details>` and `<summary>`

```html
<div class="details-demo">
  <details class="accordion-item">
    <summary class="accordion-header">What is CSS specificity?</summary>
    <div class="accordion-body">
      <p>Specificity is the algorithm browsers use to determine which CSS rule applies when multiple rules target the same element. It's calculated as a 3-part score: (ID count, class/attribute/pseudo-class count, element/pseudo-element count).</p>
    </div>
  </details>
  <details class="accordion-item">
    <summary class="accordion-header">What is the cascade?</summary>
    <div class="accordion-body">
      <p>The cascade is the full priority algorithm CSS uses to resolve conflicts: origin, !important, cascade layers, specificity, and source order. Understanding the cascade is the difference between fighting CSS and working with it.</p>
    </div>
  </details>
  <details class="accordion-item" open>
    <summary class="accordion-header">What are cascade layers?</summary>
    <div class="accordion-body">
      <p>Cascade layers (@layer) let you declare explicit priority groups for your CSS. Rules in a later-declared layer beat rules in an earlier-declared layer, regardless of specificity.</p>
    </div>
  </details>
</div>
```

```css
.details-demo { font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 1px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }

.accordion-item { border-bottom: 1px solid #e2e8f0; }
.accordion-item:last-child { border-bottom: none; }

.accordion-header {
  padding: 1rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #0f172a;
  cursor: pointer;
  list-style: none;            /* hide default triangle */
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  user-select: none;
}
.accordion-header::-webkit-details-marker { display: none; }

/* Custom indicator using ::after */
.accordion-header::after {
  content: '+';
  font-size: 1.2rem;
  color: #94a3b8;
  transition: transform 200ms;
}
details[open] .accordion-header::after {
  content: '−';
}

.accordion-body { padding: 0 1.25rem 1rem; }
.accordion-body p { margin: 0; font-size: 0.875rem; color: #475569; line-height: 1.6; }
```

## The `popover` API

```html
<div class="popover-demo">
  <button popovertarget="my-popover" class="pop-trigger">
    Show tooltip ▾
  </button>
  <div id="my-popover" popover class="styled-popover">
    <strong>popover attribute</strong>
    <p>This is a native popover. Click outside or press Escape to dismiss. No JavaScript required for open/close behaviour.</p>
  </div>
</div>
```

```css
.popover-demo { font-family: system-ui, sans-serif; position: relative; }
.pop-trigger { padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 7px; cursor: pointer; font-weight: 500; color: #334155; }

.styled-popover {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  max-width: 260px;
  font-size: 0.875rem;
  background: white;
}
.styled-popover strong { color: #0f172a; }
.styled-popover p { margin: 0.5rem 0 0; color: #475569; line-height: 1.5; }

/* Style the popover in its open state */
.styled-popover:popover-open {
  /* Animate with @starting-style (new in 2024) */
  opacity: 1;
  transform: translateY(0);
}
```

**SE lens:** The native `<dialog>`, `<details>`, and `popover` API replace enormous amounts of JavaScript that teams write and maintain for common UI patterns. A custom modal requires: focus trap logic, Escape key listener, click-outside handler, aria-modal and aria-labelledby attributes, scroll lock, animation. The native `<dialog>` provides all of this in one HTML element. The business case for native HTML is not just aesthetics — it's lines of code you don't have to write, test, or fix.

**Common mistakes:**
- Styling `<summary>` without removing the default marker — the default triangle appears unless you set `list-style: none` and `display: flex` or hide the `::webkit-details-marker`.
- Using `<dialog>` without `showModal()` — calling `.show()` opens a non-modal dialog that doesn't trap focus or show a backdrop. Use `.showModal()` for modal behavior.

**Debug tip:** In Chrome DevTools Elements panel, selecting a `<dialog>` shows whether it's in the top layer. The top-layer section appears above `<html>` in the Elements tree when a dialog or popover is open.

**Next:** CSS and JavaScript — reading and writing custom properties from JavaScript for dynamic theming.

## Challenge: styled_dialog

Style a dialog with a custom backdrop.

```html
<button onclick="document.getElementById('ch-dialog').showModal()" class="ch-open-btn">Open</button>
<dialog id="ch-dialog" class="ch-dialog">
  <p>Hello from the dialog!</p>
  <form method="dialog"><button>Close</button></form>
</dialog>
```

```css
.ch-open-btn {
  padding: 8px 16px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.ch-dialog {
  border: none;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.2);
  min-width: 280px;
}
.ch-dialog::backdrop {
  background: rgb(0 0 0 / 0.5);
}
```

```test
const dialog = document.querySelector('#ch-dialog')
assert dialog.tagName.toLowerCase() === 'dialog'
const style = getComputedStyle(dialog)
assert parseFloat(style.borderRadius) > 0
assert style.boxShadow !== 'none'
const btn = document.querySelector('.ch-open-btn')
assert getComputedStyle(btn).cursor === 'pointer'
```
