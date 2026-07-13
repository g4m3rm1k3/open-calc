---
series: frontend-engineering
level: 2
title: Accessibility and Inclusive Design
lang: javascript
---

# Accessibility and Inclusive Design

Accessibility (a11y) is not a feature you add at the end. It is a property of your code from the beginning. An inaccessible interface excludes users who navigate by keyboard, use screen readers, have low vision, or have motor impairments. In many countries, digital accessibility is also a legal requirement.

More practically: accessible code is better code. Semantic HTML is more readable to humans and machines. Keyboard navigation is required by power users (not just screen readers). Good focus management makes apps usable with any input device. By the end of this lesson you will be able to write accessible HTML and JavaScript patterns that work for all users.

## Semantic HTML: the foundation

The first step in accessibility is using the right HTML element for the job. Semantic elements communicate meaning to assistive technology without JavaScript.

```html
<!-- BAD: div soup — no semantic meaning -->
<div class="nav">
  <div class="nav-item" onclick="navigate('/')">Home</div>
  <div class="nav-item" onclick="navigate('/about')">About</div>
</div>

<!-- GOOD: semantic HTML -->
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>
```

```html
<!-- BAD: div as button — not keyboard accessible, no screen reader role -->
<div class="btn" onclick="handleClick()">Submit</div>

<!-- GOOD: real button — keyboard accessible (Enter/Space), correct role -->
<button type="button" onclick="handleClick()">Submit</button>
```

```text
SEMANTIC ELEMENT GUIDE:
  Navigation:     <nav>
  Page sections:  <main>, <header>, <footer>, <aside>, <article>, <section>
  Headings:       <h1>–<h6> (use in order, don't skip levels)
  Lists:          <ul>/<ol> + <li>
  Tables:         <table>, <thead>, <th scope="col/row">, <tbody>, <td>
  Forms:          <form>, <label for="id">, <input id="id">, <fieldset>, <legend>
  Buttons:        <button type="button"> for actions, <a href="..."> for navigation
  Interactive:    <details>/<summary> for toggleable content
                  <dialog> for modals

WHY IT MATTERS:
  A screen reader reads out element roles. "nav" becomes "navigation landmark".
  "button" gets announced as "button" — the user knows they can press it.
  A <div onclick> gets announced as nothing — the user cannot discover it.
```

## ARIA: filling gaps when HTML is insufficient

When you must build interactive components that have no native HTML equivalent (tabs, date pickers, comboboxes), ARIA (Accessible Rich Internet Applications) attributes communicate the role and state to assistive technology.

```html
<!-- ARIA roles for custom components: -->

<!-- Tab panel pattern -->
<div role="tablist" aria-label="Account Settings">
  <button role="tab" aria-selected="true"  aria-controls="panel-profile" id="tab-profile">Profile</button>
  <button role="tab" aria-selected="false" aria-controls="panel-security" id="tab-security">Security</button>
</div>
<div role="tabpanel" id="panel-profile"  aria-labelledby="tab-profile">
  Profile settings content...
</div>
<div role="tabpanel" id="panel-security" aria-labelledby="tab-security" hidden>
  Security settings content...
</div>
```

```javascript
// Managing ARIA states in JavaScript
function selectTab(selectedId) {
  const tabs = document.querySelectorAll('[role="tab"]')
  const panels = document.querySelectorAll('[role="tabpanel"]')

  tabs.forEach(tab => {
    const isSelected = tab.id === selectedId
    tab.setAttribute('aria-selected', isSelected)
    tab.tabIndex = isSelected ? 0 : -1   // roving tabindex pattern
  })

  panels.forEach(panel => {
    const isActive = panel.getAttribute('aria-labelledby') === selectedId
    panel.hidden = !isActive
  })
}
```

```text
KEY ARIA ATTRIBUTES:
  role:             what kind of element this is ('button', 'dialog', 'tab', 'tabpanel', etc.)
  aria-label:       accessible name when there's no visible label
  aria-labelledby:  references another element's text as this element's name
  aria-describedby: additional descriptive text (beyond the label)
  aria-expanded:    is a disclosure (accordion, dropdown) open or closed?
  aria-selected:    is a tab/listitem selected?
  aria-disabled:    is the element disabled (but still in tab order, unlike HTML disabled)?
  aria-live:        announce dynamic content updates to screen readers
                    ('polite': wait for quiet; 'assertive': interrupt now)
  aria-hidden:      hide from assistive technology (decorative icons, duplicate content)

FIRST RULE OF ARIA:
  Don't use ARIA. Use native HTML elements with built-in semantics.
  ARIA is for when native HTML cannot express the pattern.
  A <button> is always better than a <div role="button">.
```

**CS lens:** ARIA is a **metadata layer** on top of HTML — it communicates the semantic model of the UI to the accessibility tree (the structured representation that screen readers consume). The browser builds two trees from HTML: the DOM (for visual rendering) and the accessibility tree (for screen readers). ARIA attributes modify the accessibility tree without changing the DOM. Understanding that these are two separate trees explains why `aria-hidden="true"` can hide something from screen readers while keeping it visible on screen.

## Keyboard navigation

Every interactive element must be reachable and operable by keyboard.

```javascript
// KEYBOARD NAVIGATION REQUIREMENTS:
// → All interactive elements must be reachable via Tab
// → Tab order must be logical (left to right, top to bottom)
// → Custom components must handle arrow keys for navigation within them
// → Escape closes modals, dropdowns, tooltips
// → Enter/Space activates buttons and checkboxes

// FOCUS MANAGEMENT: when a modal opens, focus moves into it
function openModal(modal) {
  modal.removeAttribute('hidden')
  // Move focus to the first focusable element in the modal:
  const firstFocusable = modal.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  firstFocusable?.focus()
}

// FOCUS TRAP: while modal is open, tab stays inside it
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus() }
    }
  })
}

// FOCUS RETURN: when modal closes, return focus to the element that opened it
function closeModal(modal, opener) {
  modal.setAttribute('hidden', '')
  opener?.focus()   // return focus to what opened the modal
}
```

## Accessible form patterns

```html
<!-- EVERY INPUT NEEDS A LABEL: -->
<label for="email">Email address</label>
<input type="email" id="email" required autocomplete="email"
       aria-describedby="email-error">
<span id="email-error" role="alert" aria-live="polite"></span>

<!-- When validation fails: -->
<script>
  function showError(inputId, message) {
    const input = document.getElementById(inputId)
    const error = document.getElementById(inputId + '-error')
    error.textContent = message
    input.setAttribute('aria-invalid', 'true')
    // role="alert" + aria-live="polite": screen reader announces the error
  }

  function clearError(inputId) {
    const input = document.getElementById(inputId)
    const error = document.getElementById(inputId + '-error')
    error.textContent = ''
    input.removeAttribute('aria-invalid')
  }
</script>
```

**SE lens:** Accessible form validation is a good example of the layered approach to accessibility: the label provides the semantic name, the `required` attribute provides the native HTML constraint, `aria-describedby` links the error element to the input, `aria-live="polite"` announces the error to screen readers, and `aria-invalid` communicates the error state. Each layer works even if the others fail. This defence-in-depth approach is why well-built accessible interfaces work across a wide range of assistive technologies and browser combinations.

**Common mistakes:**
- Using `placeholder` as a substitute for `<label>` — placeholders disappear when the user types, making the field's purpose unclear. They have low contrast by default. Always use `<label for="...">`.
- Making custom interactive elements keyboard-inaccessible — a click handler on a `<div>` does not respond to Enter or Space. If you must use a `<div>`, add `role="button"`, `tabindex="0"`, and a keydown handler for Enter/Space.
- Forgetting `aria-live` for dynamic content — if an async action updates a section of the page (search results appear, error message shows), screen reader users won't know unless you announce the change. `aria-live="polite"` on the container announces changes automatically.

**Debug tip:** Test keyboard accessibility by unplugging the mouse. Can you reach every interactive element with Tab? Can you activate every button with Enter or Space? Can you close every modal with Escape? If not, fix those interactions. Also: install the axe DevTools browser extension — it automatically detects ARIA errors, missing labels, colour contrast violations, and other common a11y issues without requiring a screen reader.

## Challenge: accessible_tabs

A real `createAccessibleTabs` renders DOM (tablist, panels, ARIA attributes) that a
keyboard handler drives — but DOM rendering isn't testable in this engine, and the
part that actually determines correctness is the **state machine** underneath the
keyboard handler, not the markup. Implement that state machine directly.

Implement the focus/selection state logic behind a keyboard-accessible tab component.

`tabIds` is an ordered array of tab identifiers. In a real implementation, ArrowLeft/
ArrowRight would call `focusPrev`/`focusNext`, Home/End would call `focusFirst`/
`focusLast`, and Enter/Space would call `select(getFocused())` — moving focus never
changes the selection by itself.

```challenge
function createTabState(tabIds) {
  // Returns: { getSelected(), getFocused(), select(id), focusNext(), focusPrev(), focusFirst(), focusLast() }
  //   getSelected() / getFocused(): current selected/focused tab id (both start as tabIds[0])
  //   select(id): sets both selected AND focused to id
  //   focusNext() / focusPrev(): move focus only (not selection), wrapping at the ends
  //   focusFirst() / focusLast(): move focus only, to tabIds[0] / tabIds[tabIds.length - 1]
}
```

```test
const tabs = createTabState(['tab-a', 'tab-b', 'tab-c'])
assert tabs.getSelected() === 'tab-a' && tabs.getFocused() === 'tab-a'

// Moving focus does not change the selection until select() is called
tabs.focusNext()
assert tabs.getFocused() === 'tab-b' && tabs.getSelected() === 'tab-a'

tabs.select('tab-b')
assert tabs.getSelected() === 'tab-b'

// focusPrev/focusNext wrap around at the ends
tabs.focusFirst()
tabs.focusPrev()
assert tabs.getFocused() === 'tab-c'
tabs.focusNext()
assert tabs.getFocused() === 'tab-a'

tabs.focusLast()
assert tabs.getFocused() === 'tab-c'
```
