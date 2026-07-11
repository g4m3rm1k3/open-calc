---
title: HTML DOM Level 0: Change the Page with JavaScript
series: html-dom
level: 0
topic: dom
lang: html
---

# HTML DOM Level 0: Change the Page with JavaScript

## HTML Gives JavaScript Something to Touch

The DOM is the browser's live tree of elements. JavaScript can find a node in that tree and change it.

**CS lens:** A web page is not just text. It is a live object graph that the browser keeps in memory.

```html
<main>
  <h1 id="title">Before JavaScript</h1>
  <button id="change">Change title</button>
</main>
```

```css
main {
  display: grid;
  gap: 12px;
}

button {
  width: fit-content;
  border: 0;
  border-radius: 6px;
  padding: 8px 12px;
  background: #2563eb;
  color: white;
  font-weight: 700;
}
```

```javascript
const title = document.querySelector("#title");
const button = document.querySelector("#change");

button.addEventListener("click", () => {
  title.textContent = "JavaScript changed the DOM";
});
```

## JavaScript Can Create Elements

Creating an element, setting its text, and appending it are the three moves behind dynamic interfaces.

```html
<main id="app">
  <h1>DOM list</h1>
</main>
```

```css
body {
  background: #f8fafc;
}

li {
  margin: 6px 0;
}
```

```javascript
const app = document.querySelector("#app");
const list = document.createElement("ul");

["find", "change", "create"].forEach(action => {
  const item = document.createElement("li");
  item.textContent = `DOM action: ${action}`;
  list.appendChild(item);
});

app.appendChild(list);
```
