# Junior to Senior — T12·L18 — Forms

**Prerequisites:** T12·L17 (Component Design). You can build components with BEM and
variants. This lesson teaches form styling — the most complex CSS challenge because forms
have the most native browser UI, the most states, and the tightest accessibility requirements.

**What this lab adds:**
- Resetting native form element styles (why they are inconsistent cross-browser)
- The label-input relationship and why `for`/`id` matters for CSS
- Styling text inputs, textareas, selects, checkboxes, and radio buttons
- Validation states: `:valid`, `:invalid`, `:required` pseudo-classes
- Form layout: fieldsets, legends, and spacing patterns
- The `appearance: none` property and why it exists

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You want to style a checkbox. You set `background: blue` on `input[type="checkbox"]`.
>    In most browsers, nothing changes. Why?
> 2. A text input has `:invalid` applied by the browser before the user types anything.
>    This causes a red border to flash on page load. What causes this and how do you fix it?
> 3. You use `display: flex; gap: 8px` on a `<form>`. Labels and inputs appear side by side.
>    What HTML structure makes labels stay with their correct input?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

Form elements are the most browser-inconsistent part of HTML. A text input looks different
on Windows Chrome, macOS Safari, and Android Chrome. Select dropdowns are nearly impossible
to style on some platforms. Checkboxes and radios have complex default rendering that
CSS cannot access directly.

The solution is to either reset native styles and rebuild them (text inputs, selects) or
use the adjacent sibling technique (checkboxes, radios) to replace the native element
visually while keeping it functional.

---

## Step 1 — See the Problem

Create `forms.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forms</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 16px; }
  </style>
</head>
<body>
  <h2>Unstyled native form elements:</h2>
  <form>
    <input type="text" placeholder="Text input">
    <input type="email" placeholder="Email input">
    <select>
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
    <textarea placeholder="Textarea"></textarea>
    <input type="checkbox">
    <input type="radio">
    <input type="submit" value="Submit">
  </form>
</body>
</html>
```

### CSS AND SEE

You should see browser-default styling. Each element uses the OS's native control —
the exact appearance varies on every platform. There is no consistency with your design system.

---

## Concept: Resetting Form Element Styles

**What it is:** Removing the browser's opinionated styling so you can apply your own.
Form elements inherit almost nothing by default — they need explicit resets.

**The standard form reset:**

```css
input,
textarea,
select,
button {
  font: inherit;          /* form elements don't inherit font from body by default */
  color: inherit;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
}
```

**`font: inherit` — the most commonly missing reset:**

Form elements like `<input>`, `<textarea>`, and `<select>` use the browser's default
font — usually a different family and size than `body`. `font: inherit` makes them
use whatever the parent declares.

**`appearance: none` — removing native control rendering:**

```css
input[type="checkbox"],
input[type="radio"],
select {
  appearance: none;
  -webkit-appearance: none;   /* Safari/older Chrome */
}
```

`appearance: none` tells the browser: do not render this as a native OS control.
For checkboxes and radios, this removes the tick/dot entirely — you must draw replacements.
For selects, this removes the dropdown arrow — you must add your own.

**What it hides:** The OS's rendering pipeline for form controls. Native controls are
drawn by the OS, not the browser — which is why they look OS-native and why CSS cannot
access their internals. `appearance: none` hands rendering back to CSS entirely.

**You will see this again in:**
- React UI libraries (Radix, shadcn): they use `appearance: none` and rebuild every form
  control from scratch for consistent cross-platform rendering
- Mobile: `appearance: none` on inputs prevents iOS Safari from applying rounded "3D" styles

---

## Step 2 — Build the Text Input Component

Add to `forms.html`:

```html
<h2 style="margin-top: 40px;">Styled inputs:</h2>

<form class="form">

  <div class="field">
    <label class="field__label" for="name">Full name</label>
    <input class="field__input" type="text" id="name" placeholder="Jane Doe">
  </div>

  <div class="field">
    <label class="field__label" for="email">Email address</label>
    <input class="field__input" type="email" id="email" placeholder="jane@example.com" required>
    <span class="field__hint">We'll never share your email.</span>
  </div>

  <div class="field">
    <label class="field__label" for="bio">Bio</label>
    <textarea class="field__input field__input--textarea" id="bio" placeholder="Tell us about yourself" rows="3"></textarea>
  </div>

  <div class="field">
    <label class="field__label" for="role">Role</label>
    <div class="field__select-wrapper">
      <select class="field__input field__input--select" id="role">
        <option value="">Choose a role...</option>
        <option value="engineer">Engineer</option>
        <option value="designer">Designer</option>
        <option value="manager">Manager</option>
      </select>
    </div>
  </div>

</form>
```

Add CSS:

```css
/* ── FORM RESET ────────────────────────── */
input, textarea, select, button { font: inherit; color: inherit; margin: 0; }

/* ── FORM LAYOUT ───────────────────────── */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── FIELD COMPONENT ───────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.field__hint {
  font-size: 0.8125rem;
  color: #888;
}

/* ── INPUT COMPONENT ───────────────────── */
.field__input {
  padding: 8px 12px;
  border: 1.5px solid #d0d0d0;
  border-radius: 5px;
  font-size: 0.9375rem;
  background: white;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field__input:focus {
  outline: none;
  border-color: hsl(219, 79%, 60%);
  box-shadow: 0 0 0 3px hsl(219 79% 60% / 0.18);
}

.field__input:disabled {
  background: #f5f5f5;
  color: #888;
  cursor: not-allowed;
}

.field__input::placeholder { color: #bbb; }

/* Textarea specifics: */
.field__input--textarea {
  resize: vertical;     /* allow vertical resize, prevent horizontal */
  min-height: 80px;
}

/* Select: remove native arrow, add custom: */
.field__select-wrapper {
  position: relative;
}

.field__input--select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 36px;    /* space for custom arrow */
  cursor: pointer;
  width: 100%;
}

.field__select-wrapper::after {
  content: '▾';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;   /* click goes through to the select */
  color: #666;
  font-size: 0.875rem;
}
```

### CSS AND SEE

**You should see:** A clean form with consistent styling across all input types.

**Test the select dropdown:** The native arrow is gone; the custom `▾` character appears.
The dropdown still opens natively — `appearance: none` removes the visual arrow, not
the functionality.

**Change something:** Remove `appearance: none` from `.field__input--select`.

**Expected:** The native dropdown arrow appears alongside your custom one. Double arrow.
`appearance: none` was removing the native one.

---

## Step 3 — Validation States

Add validation feedback with CSS `:valid`/`:invalid` and the `data-state` pattern:

```html
<h2 style="margin-top: 40px;">Validation states:</h2>

<form class="form">
  <!-- "Was touched" pattern — show error only after interaction: -->
  <div class="field" id="field-email">
    <label class="field__label" for="v-email">Email (required)</label>
    <input
      class="field__input"
      type="email"
      id="v-email"
      required
      placeholder="you@example.com"
      oninput="
        this.closest('.field').dataset.touched = 'true';
        this.closest('.field').dataset.state = this.validity.valid ? 'success' : 'error';
      "
    >
    <span class="field__error">Please enter a valid email address.</span>
    <span class="field__success">Email looks good!</span>
  </div>
</form>
```

Add to CSS:

```css
/* Error message: hidden by default, shown when field has data-state="error": */
.field__error   { display: none; font-size: 0.8125rem; color: hsl(0, 70%, 48%); }
.field__success { display: none; font-size: 0.8125rem; color: hsl(140, 55%, 35%); }

/* Triggered when data-state is set AND the field was touched: */
.field[data-state="error"][data-touched] .field__input {
  border-color: hsl(0, 70%, 48%);
}
.field[data-state="error"][data-touched] .field__input:focus {
  box-shadow: 0 0 0 3px hsl(0 70% 48% / 0.18);
}
.field[data-state="error"][data-touched] .field__error { display: block; }

.field[data-state="success"] .field__input {
  border-color: hsl(140, 55%, 35%);
}
.field[data-state="success"] .field__success { display: block; }
```

### CSS AND SEE

**Type an invalid email** (like "hello" with no @). After you start typing, the field
turns red and the error message appears. Type a valid email — it turns green.

**Why `data-touched`:** `:invalid` fires on `required` fields BEFORE the user types
anything — on page load. This causes a red border to flash immediately, which is poor UX.
The `data-touched` attribute only appears after the user starts typing (`oninput`),
so validation errors only show after interaction.

**In React:** This same logic is handled by `useForm` state from `react-hook-form`.
The concept is identical: track whether the field was touched, show errors only after touch.

---

## Step 4 — Custom Checkboxes and Radios

The native checkbox and radio cannot be styled with CSS background/border. The solution:
hide them, show a custom visual element.

```html
<h2 style="margin-top: 40px;">Custom checkbox and radio:</h2>

<div style="display: flex; flex-direction: column; gap: 12px;">

  <label class="check">
    <input class="check__input" type="checkbox" checked>
    <span class="check__box"></span>
    <span class="check__label">Enable notifications</span>
  </label>

  <label class="check">
    <input class="check__input" type="checkbox">
    <span class="check__box"></span>
    <span class="check__label">Enable dark mode</span>
  </label>

  <label class="check">
    <input class="check__input" type="checkbox" disabled>
    <span class="check__box"></span>
    <span class="check__label">Disabled option</span>
  </label>

</div>
```

Add CSS:

```css
.check {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.check__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.check__box {
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 4px;
  background: white;
  flex-shrink: 0;
  position: relative;
  transition: background 0.1s, border-color 0.1s;
}

/* Checkmark: hidden by default */
.check__box::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 4px;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg) scale(0);
  transition: transform 0.1s;
}

/* Checked state */
.check__input:checked + .check__box {
  background: hsl(219, 79%, 60%);
  border-color: hsl(219, 79%, 60%);
}
.check__input:checked + .check__box::after {
  transform: rotate(45deg) scale(1);
}

/* Focus ring */
.check__input:focus-visible + .check__box {
  outline: 3px solid hsl(219 79% 60%);
  outline-offset: 2px;
}

/* Disabled */
.check__input:disabled + .check__box {
  background: #f0f0f0;
  border-color: #ddd;
  cursor: not-allowed;
}
.check__input:disabled ~ .check__label { color: #aaa; cursor: not-allowed; }
```

### CSS AND SEE

**You should see:** Three custom checkboxes. The checked one has a blue background with
a white checkmark. The disabled one is grayed out.

**Test keyboard:** Tab to a checkbox and press Space. It toggles visually, the CSS
`:checked` pseudo-class updates, and the checkmark animates.

---

## 🎯 Challenge: Build a Complete Registration Form

**Task:** A registration form with:
1. Name, email, password inputs — all with labels and error states
2. A role select dropdown
3. An "Agree to terms" checkbox (required)
4. A submit button (disabled until all fields are valid — use `:invalid` on form)
5. Fieldset with legend to group related fields

---

<details>
<summary>▶ Show Solution</summary>

Key CSS for the submit button disabling:

```css
/* Disable the submit button while the form is invalid: */
form:has(:invalid) .btn[type="submit"] {
  opacity: 0.45;
  pointer-events: none;
  cursor: not-allowed;
}
```

`form:has(:invalid)` is true when ANY descendant matches `:invalid`. The `:has()` selector
is the CSS4 "parent selector" — it checks a condition on the children and applies styles
to the parent. Supported in all modern browsers since 2023.

Full form structure:
```html
<form class="form">
  <fieldset style="border: 1px solid #ddd; border-radius: 6px; padding: 16px;">
    <legend style="font-weight: 600; padding: 0 8px; font-size: 0.875rem;">Account Info</legend>

    <div class="field">
      <label class="field__label" for="reg-name">Full name</label>
      <input class="field__input" type="text" id="reg-name" required placeholder="Your name">
    </div>

    <div class="field" style="margin-top: 16px;">
      <label class="field__label" for="reg-email">Email</label>
      <input class="field__input" type="email" id="reg-email" required placeholder="you@example.com">
    </div>
  </fieldset>

  <label class="check" style="margin-top: 8px;">
    <input class="check__input" type="checkbox" required>
    <span class="check__box"></span>
    <span class="check__label">I agree to the terms</span>
  </label>

  <button class="btn" type="submit">Create Account</button>
</form>
```

**Key insight:** `form:has(:invalid)` uses the `:has()` relational pseudo-class to target
the form when any child is invalid. This enables CSS-only form-level validation UI —
no JavaScript needed to disable the button. The button becomes clickable as soon as
all required fields are valid and the checkbox is checked.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `font: inherit` | Input font matches body font |
| `appearance: none` on select | Native arrow removed; custom `▾` visible |
| Validation only after touch | Page load: no red border; type invalid value: red border appears |
| Custom checkbox — keyboard | Tab + Space toggles the visual checkbox |
| Checkmark animation | Check → uncheck → watch the scale transform |
| `:focus-visible` ring on checkbox | Tab to checkbox — ring visible; mouse click — no ring |

---

## Quick Check Answers

**1. `background: blue` on `input[type="checkbox"]`. Why does nothing change?**

Checkbox and radio inputs use native OS rendering. The browser passes control of their
appearance to the operating system's widget system — which is why they look native to each
OS. CSS properties like `background` and `border` do not apply to native controls because
the browser does not draw them — the OS does. `appearance: none` returns rendering control
to the browser/CSS, making `background` and `border` work. Without it, checkboxes ignore
most CSS styling.

**2. `:invalid` fires before user types. Red border on page load. Fix?**

Add a "touched" guard. The CSS `:invalid` pseudo-class fires on `required` fields immediately
on page load before any interaction. The fix: track user interaction with a `data-touched`
attribute or class, and scope the error styles to `[data-touched]:invalid`:

```css
input:not([data-touched]):invalid { /* no error style — not touched yet */ }
input[data-touched]:invalid { border-color: red; }
```

Set `data-touched` on `blur` or `input` events. This is the same "touched" concept used
by form libraries like react-hook-form.

**3. `display: flex; gap: 8px` on `<form>`. Labels and inputs side by side. Fix?**

Wrap each label+input pair in a container (`.field` div). The flex layout puts direct
children side by side — if label and input are both direct children of the form, they appear
in one row. Wrapping them in a `.field` container makes each field a single flex item.
The `.field` is then laid out by the form's flex (one field per row), and inside each
`.field`, `flex-direction: column` stacks the label above its input.
