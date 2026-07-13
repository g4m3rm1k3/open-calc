---
series: html-dom
level: 8
title: Forms & Input Elements
lang: javascript
---

# Forms & Input Elements

Forms are the primary way users send structured data to JavaScript. Every input type — text, number, checkbox, radio, select — has a DOM property that reflects its current value. The `submit` event is the right place to collect them all. Getting this right matters: reading values at the wrong time, or from the wrong property, is a common source of bugs.

## Reading Text Input Values

`input.value` — the current text content of a text-type input. It is a live property: it updates with every keystroke without any event listener.

```html
<form id="profile-form" style="display:flex;flex-direction:column;gap:12px;max-width:300px;">
  <input id="name-input" type="text" placeholder="Full name">
  <input id="age-input" type="number" placeholder="Age" min="0">
  <textarea id="bio-input" rows="3" placeholder="Short bio"></textarea>
  <button type="submit">Save profile</button>
</form>
<pre id="output" style="background:#f1f5f9;padding:12px;border-radius:6px;margin-top:12px;"></pre>
```

```css
input, textarea { padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; }
button { padding: 10px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; }
```

```javascript
const form = document.querySelector("#profile-form")
const output = document.querySelector("#output")

form.addEventListener("submit", event => {
  event.preventDefault()

  const name = document.querySelector("#name-input").value.trim()
  const age = Number(document.querySelector("#age-input").value)
  const bio = document.querySelector("#bio-input").value.trim()

  output.textContent = JSON.stringify({ name, age, bio }, null, 2)
})
```

`input.value` — always a string, even for `type="number"`. `Number(...)` converts it. An empty number input returns `""`, which `Number("")` converts to `0`.
`textarea.value` — same property name as a text input; works identically.
`event.preventDefault()` — prevents page reload on submit (Level 7).
`JSON.stringify(obj, null, 2)` — converts the object to a formatted JSON string. `null` skips a replacer function; `2` sets 2-space indentation.

## Checkboxes and Radio Buttons

Checkboxes use `.checked` (a boolean), not `.value`:

```html
<form id="prefs-form" style="display:flex;flex-direction:column;gap:10px;">
  <label><input type="checkbox" id="dark-mode"> Dark mode</label>
  <label><input type="checkbox" id="notifications"> Email notifications</label>
  <label><input type="checkbox" id="newsletter" checked> Newsletter</label>
  <fieldset style="border:1px solid #e2e8f0;border-radius:6px;padding:8px;">
    <legend>Language</legend>
    <label><input type="radio" name="lang" value="python" checked> Python</label>
    <label><input type="radio" name="lang" value="javascript"> JavaScript</label>
    <label><input type="radio" name="lang" value="rust"> Rust</label>
  </fieldset>
  <button type="submit">Save</button>
</form>
<p id="pref-output"></p>
```

```css
label { cursor: pointer; }
button { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 4px; }
```

```javascript
const form = document.querySelector("#prefs-form")
const output = document.querySelector("#pref-output")

form.addEventListener("submit", event => {
  event.preventDefault()

  const darkMode = document.querySelector("#dark-mode").checked
  const notifications = document.querySelector("#notifications").checked
  const newsletter = document.querySelector("#newsletter").checked

  const selectedLang = document.querySelector('input[name="lang"]:checked')
  const language = selectedLang ? selectedLang.value : null

  output.textContent = `dark=${darkMode} notifications=${notifications} newsletter=${newsletter} lang=${language}`
})
```

`checkbox.checked` — `true` if ticked, `false` otherwise.
`'input[name="lang"]:checked'` — a CSS attribute-plus-pseudo-class selector: "the radio input named `lang` that is currently checked." Returns `null` if none is checked (though browsers enforce one is always checked for same-name radios if any was checked initially).
`radio.value` — the `value` attribute from the HTML, not `.checked`.

## Select Elements

`select.value` — the value of the currently selected `<option>`:

```html
<form id="sort-form" style="display:flex;gap:12px;align-items:center;">
  <label>Sort by:
    <select id="sort-field">
      <option value="name">Name</option>
      <option value="date">Date</option>
      <option value="score">Score</option>
    </select>
  </label>
  <label>
    <select id="sort-order">
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>
  </label>
  <button type="submit">Apply</button>
</form>
<p id="sort-output"></p>
```

```javascript
const form = document.querySelector("#sort-form")
const output = document.querySelector("#sort-output")

form.addEventListener("submit", event => {
  event.preventDefault()
  const field = document.querySelector("#sort-field").value
  const order = document.querySelector("#sort-order").value
  output.textContent = `Sorting by ${field} ${order}`
})
```

`select.value` — the `value` attribute of the selected `<option>`. If no `value` is set on the option, it falls back to the option's text content.

## Live Validation with "input" Event

The `"input"` event fires on every keystroke. Use it for live feedback:

```html
<input id="password" type="password" placeholder="Enter password" style="padding:8px;border:1px solid #e2e8f0;border-radius:6px;width:240px;">
<div id="strength" style="margin-top:6px;font-size:14px;"></div>
```

```javascript
const password = document.querySelector("#password")
const strength = document.querySelector("#strength")

password.addEventListener("input", () => {
  const val = password.value
  let label = ""
  let color = ""

  if (val.length === 0) {
    label = ""; color = ""
  } else if (val.length < 6) {
    label = "Weak"; color = "#dc2626"
  } else if (val.length < 10) {
    label = "Medium"; color = "#d97706"
  } else {
    label = "Strong"; color = "#16a34a"
  }

  strength.textContent = label
  strength.style.color = color
})
```

## Challenge: validate_form

Write a function `validateForm(formId)` that finds the form, intercepts `submit`, and:

1. Reads the `value` of the `<input type="text">` with id `"username"` inside the form and trims whitespace
2. Reads the `value` of the `<input type="email">` with id `"email"` inside the form and trims whitespace
3. If `username` is empty, sets the `textContent` of `#error` to `"Username required"` and returns (does not proceed)
4. If `email` does not include `"@"`, sets `#error` to `"Invalid email"` and returns
5. Otherwise sets `#result` to `"Submitted: username / email"` (actual values) and clears `#error`

```challenge
function validateForm(formId) {
  // TODO
}
```

```test
document.body.innerHTML = '<form id="f"><input id="username" type="text"><input id="email" type="email"><button type="submit">Go</button></form><p id="error"></p><p id="result"></p>'
validateForm("f")
const form = document.querySelector("#f")
document.querySelector("#username").value = ""
document.querySelector("#email").value = "a@b.com"
form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
assert document.querySelector("#error").textContent === "Username required"
document.querySelector("#username").value = "ada"
document.querySelector("#email").value = "notanemail"
form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
assert document.querySelector("#error").textContent === "Invalid email"
document.querySelector("#email").value = "ada@example.com"
form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
assert document.querySelector("#result").textContent === "Submitted: ada / ada@example.com"
assert document.querySelector("#error").textContent === ""   // error cleared on successful submit
```
