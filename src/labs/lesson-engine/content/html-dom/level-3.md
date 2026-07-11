---
series: html-dom
level: 3
title: classList — CSS Classes as State
lang: javascript
---

# classList — CSS Classes as State

Inline styles (Level 2) change one property at a time and win every specificity battle, making them hard to override. CSS classes are a better tool: you define the full visual change in the stylesheet, then use JavaScript to add or remove the class. The separation is clean — CSS describes what things look like; JavaScript decides which description applies.

`element.classList` is the API for this: it manages the element's class list as a live set you can add to, remove from, and toggle.

## classList.add and classList.remove

`element.classList.add(className)` — adds a class to the element. Does nothing if the class is already present.
`element.classList.remove(className)` — removes a class. Does nothing if the class is absent.

```html
<div id="alert" class="alert">Something happened</div>
<button id="show">Show alert</button>
<button id="hide">Hide alert</button>
```

```css
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  background: #fef3c7;
  border: 1px solid #d97706;
  color: #92400e;
  margin-bottom: 12px;
}
.alert.hidden { display: none; }
button { padding: 8px 12px; margin-right: 8px; cursor: pointer; }
```

```javascript
const alert = document.querySelector("#alert")
const showBtn = document.querySelector("#show")
const hideBtn = document.querySelector("#hide")

alert.classList.add("hidden")

showBtn.addEventListener("click", () => alert.classList.remove("hidden"))
hideBtn.addEventListener("click", () => alert.classList.add("hidden"))
```

`alert.classList.add("hidden")` — adds the class `"hidden"`. The element now has both `"alert"` and `"hidden"`, so the CSS rule `.alert.hidden { display: none }` matches and hides it.

**Open the Tree tab and click the buttons.** Watch the class list on `#alert` change between `alert` and `alert hidden` with each click. The element never disappears from the tree — only its classes change.

**CS lens:** The DOM maintains each element's class list as a `DOMTokenList` — a live ordered list of unique strings. `add` is idempotent (safe to call multiple times), `remove` is safe when the class is absent. Both run in O(1) because they operate on the element's internal class set, not by scanning a string.

## classList.toggle

`element.classList.toggle(className)` — adds the class if absent, removes it if present. Returns `true` if the class was added, `false` if removed:

```html
<div id="card">
  <h3>Click to expand</h3>
  <div class="content">
    This content is shown when the card is expanded.
  </div>
</div>
```

```css
#card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}
#card h3 { margin: 0; padding: 14px 16px; background: #f8fafc; }
.content { padding: 0 16px; max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
#card.expanded .content { max-height: 200px; }
```

```javascript
const card = document.querySelector("#card")

card.addEventListener("click", () => {
  const isNowExpanded = card.classList.toggle("expanded")
  card.querySelector("h3").textContent = isNowExpanded
    ? "Click to collapse"
    : "Click to expand"
})
```

`classList.toggle("expanded")` — flips the state. The CSS `#card.expanded .content` rule controls the visual change.

**SE lens:** The `toggle` pattern replaces a common but verbose conditional:
```text
Instead of:
  if (card.classList.contains("expanded")) {
    card.classList.remove("expanded")
  } else {
    card.classList.add("expanded")
  }
Write:
  card.classList.toggle("expanded")
```
The toggle pattern keeps the Boolean logic inside the DOM API rather than in application code.

## classList.contains

`element.classList.contains(className)` — returns `true` if the element has that class, `false` otherwise. Use it when you need to read current state before making a decision:

```html
<ul id="tabs">
  <li class="tab active" data-tab="home">Home</li>
  <li class="tab" data-tab="about">About</li>
  <li class="tab" data-tab="contact">Contact</li>
</ul>
<div id="panel">Home content</div>
```

```css
.tab { display: inline-block; padding: 8px 16px; cursor: pointer; border-bottom: 2px solid transparent; }
.tab.active { border-bottom-color: #2563eb; color: #2563eb; font-weight: 600; }
```

```javascript
const tabs = document.querySelectorAll(".tab")
const panel = document.querySelector("#panel")

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"))
    tab.classList.add("active")
    panel.textContent = `${tab.dataset.tab} content`
  })
}
```

`tabs.forEach(t => t.classList.remove("active"))` — removes `active` from every tab before adding it to the clicked one. `NodeList.forEach` works like `Array.forEach`.

`tab.dataset.tab` — reads the `data-tab` attribute as a property. Data attributes are covered fully in Level 10.

## Multiple Classes at Once

`classList.add` and `classList.remove` accept multiple class names in one call:

```javascript
element.classList.add("visible", "highlighted", "large")
element.classList.remove("hidden", "dimmed")
```

## Challenge: toggle_theme

Write a function `toggleTheme(buttonId, targetId)` that:
1. Finds the button element by `buttonId` and the target element by `targetId`
2. Adds a click listener to the button
3. On each click, toggles the class `"dark"` on the target element and updates the button's `textContent` to `"Switch to light"` if dark mode is now active, or `"Switch to dark"` if it is not

`classList.toggle(className)` returns `true` if the class was added.

```challenge
function toggleTheme(buttonId, targetId) {
  // TODO
}
```

```test
document.body.innerHTML = '<div id="app">Content</div><button id="btn">Switch to dark</button>'
toggleTheme("btn", "app")
const btn = document.querySelector("#btn")
const app = document.querySelector("#app")
btn.click()
assert app.classList.contains("dark") === true
assert btn.textContent === "Switch to light"
btn.click()
assert app.classList.contains("dark") === false
assert btn.textContent === "Switch to dark"
```
