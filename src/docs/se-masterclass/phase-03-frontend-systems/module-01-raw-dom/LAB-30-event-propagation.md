# SE Masterclass — LAB-30 — Event Propagation

**Language: TypeScript (Browser)** — same setup as LAB-29.

**Prerequisites:** LAB-29 (Raw DOM Manipulation) and LAB-06 (trees — the DOM's parent/child structure is exactly what event propagation travels through).

**What this lab adds:**
- Event bubbling: why a click on a CHILD also triggers a listener on its PARENT
- Capturing: the (rarely used, but real) OPPOSITE direction events can travel
- `stopPropagation()` — deliberately cutting the chain short
- Event delegation: ONE listener on a parent, handling clicks from any number of (even future, not-yet-created) children — directly fixing LAB-29's "re-attach a listener every render" problem

**Time:** 60–80 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A `<button>` sits inside a `<div>`, both with `click` listeners. You click the button. Does the `<div>`'s listener ALSO fire?
> 2. LAB-29's to-do list re-attached a `click` listener to every remove button, on EVERY render. What alternative would let you attach the listener exactly ONCE, ever?
> 3. If a NEW `<li>` is added to a list AFTER a delegated listener was attached to the list's PARENT `<ul>`, does the delegated listener work for that new item too?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser page demonstrates, via console output (open DevTools):

```
=== Bubbling ===
(click the button)
child clicked
parent clicked
grandparent clicked
  ← fired in this order: target FIRST, then outward through ancestors

=== stopPropagation ===
(click the button again)
child clicked
  ← parent and grandparent listeners did NOT fire — the chain was cut short

=== Capturing ===
(click the button, capture phase demo)
grandparent (capture) clicked
parent (capture) clicked
child clicked
  ← capture fires OUTSIDE-IN, before the normal bubble phase even starts

=== Event Delegation ===
(click any list item, including ones added AFTER the listener was attached)
delegated handler saw click on: Buy milk
delegated handler saw click on: NEW ITEM (added after listener attached)
  ← ONE listener, attached ONCE, handles every item — including future ones
```

---

### Concept: Bubbling — Events Travel Up the Tree

**What it is:** When you click an element, the `click` event doesn't just fire on THAT element — it also fires on every ANCESTOR, traveling UP the DOM tree from the clicked element toward the document root. This is called **bubbling** (like a bubble rising through water).

**The problem before:** Without understanding bubbling, a listener on a PARENT element mysteriously firing when you click a CHILD looks like a bug — "I didn't click the div, I clicked the button inside it!"

**The solution:** This is DELIBERATE browser behavior, not a bug — and it's exactly LAB-06's tree structure in action: the clicked node is the DEEPEST point, and the event WALKS UP through every ancestor on its way back to the root, exactly like LAB-06's tree has a defined path from any node back to the root.

**Canonical example (General Explanation):** Think of dropping a pebble in a pond at one exact point — ripples spread outward from THAT point. A DOM click "ripples" upward through the ancestor chain: target first, then its parent, then ITS parent, and so on, all the way to `document`.

---

## Step 1 — Observe Bubbling

```ts
// main.ts
const app = document.querySelector<HTMLDivElement>('#app')!

const grandparent = document.createElement('div')
const parent = document.createElement('div')
const child = document.createElement('button')
child.textContent = 'Click me'

grandparent.appendChild(parent)
parent.appendChild(child)
app.appendChild(grandparent)

console.log('=== Bubbling ===')
console.log('(click the button)')

child.addEventListener('click', () => console.log('child clicked'))
parent.addEventListener('click', () => console.log('parent clicked'))
grandparent.addEventListener('click', () => console.log('grandparent clicked'))
```

### SAVE AND TRY

Save. Open DevTools (F12) → Console tab. Click the "Click me" button in the page.

**You should see, in this exact order:**
```
child clicked
parent clicked
grandparent clicked
  ← fired in this order: target FIRST, then outward through ancestors
```

**Confirm the order is TARGET-FIRST, not top-down:** `child` (the element you actually clicked) logs FIRST, then `parent`, then `grandparent` — the event starts exactly where you clicked and travels OUTWARD, exactly matching LAB-06's "path from a node back to the root" (leaf → parent → parent's parent), not the other way around.

**Change something:** Add a FOURTH nested level (a `great-grandparent` wrapping `grandparent`) with its own listener. Confirm it logs LAST — bubbling continues through however many ancestor levels exist.

---

## Step 2 — Cut the Chain: stopPropagation

```ts
console.log('\n=== stopPropagation ===')
console.log('(click the button again)')

const child2 = document.createElement('button')
child2.textContent = 'Click me (stops here)'
const parent2 = document.createElement('div')
const grandparent2 = document.createElement('div')
grandparent2.appendChild(parent2)
parent2.appendChild(child2)
app.appendChild(grandparent2)

child2.addEventListener('click', (e) => {
  console.log('child clicked')
  e.stopPropagation()                    // ← add: the event stops HERE — it never reaches parent2 or grandparent2
})
parent2.addEventListener('click', () => console.log('parent clicked (should NOT appear)'))
grandparent2.addEventListener('click', () => console.log('grandparent clicked (should NOT appear)'))
```

### SAVE AND TRY

Click the "Click me (stops here)" button.

**Expected console output:**
```
child clicked
  ← parent and grandparent listeners did NOT fire — the chain was cut short
```

**Confirm the chain genuinely stopped, not just that logging was skipped:** `parent2`'s and `grandparent2`'s listeners never RAN at all — `e.stopPropagation()` prevented the browser from even DISPATCHING the event to them, not just prevented some log line. This is important for real code: if a parent listener does something with SIDE EFFECTS (like LAB-13's state transition), `stopPropagation()` genuinely prevents that side effect from happening, not just its console output.

**Watch for:** `stopPropagation()` is powerful and easy to overuse — reaching for it to "fix" an unexpected parent listener firing is often a sign the LISTENERS themselves should check `event.target` instead of blocking propagation entirely, since stopping propagation can silently break OTHER unrelated code that also expected to hear about this click (a real source of hard-to-debug frontend bugs).

---

### Concept: Capturing — The Other Direction

**What it is:** Before the bubble phase even starts, the browser runs a **capture phase**: the event travels from the DOCUMENT ROOT DOWN to the target — the exact OPPOSITE direction of bubbling. Listeners registered for the capture phase (via a third argument, `{ capture: true }`) fire during this OUTSIDE-IN pass, BEFORE any bubble-phase listener fires.

**The problem before:** By default, `addEventListener` only listens during the bubble phase — there's no way to intercept an event BEFORE it reaches its target, which occasionally matters (a parent wanting first refusal on an event, before a child's own handling).

**The solution:** `element.addEventListener('click', handler, { capture: true })` — the SAME event, listened for during the OTHER phase.

**The full order, for a click on `child` inside `parent` inside `grandparent`:**
```
1. grandparent (capture)
2. parent (capture)
3. child (target — capture and bubble listeners on the TARGET itself run in registration order)
4. parent (bubble)
5. grandparent (bubble)
```

---

## Step 3 — Observe the Capture Phase

```ts
console.log('\n=== Capturing ===')
console.log('(click the button, capture phase demo)')

const child3 = document.createElement('button')
child3.textContent = 'Click me (capture demo)'
const parent3 = document.createElement('div')
const grandparent3 = document.createElement('div')
grandparent3.appendChild(parent3)
parent3.appendChild(child3)
app.appendChild(grandparent3)

child3.addEventListener('click', () => console.log('child clicked'))
parent3.addEventListener('click', () => console.log('parent (capture) clicked'), { capture: true })   // ← add: capture phase
grandparent3.addEventListener('click', () => console.log('grandparent (capture) clicked'), { capture: true })
```

### SAVE AND TRY

Click "Click me (capture demo)".

**Expected console output:**
```
grandparent (capture) clicked
parent (capture) clicked
child clicked
  ← capture fires OUTSIDE-IN, before the normal bubble phase even starts
```

**Confirm the order flip:** `grandparent3` and `parent3` were registered with `{ capture: true }` — they fire OUTSIDE-IN (grandparent, then parent), BEFORE `child3`'s ordinary bubble-phase listener ever runs. This is the literal opposite order from Step 1's bubbling demonstration — same tree, same click, different registered PHASE, different order.

**Watch for:** Capturing is rarely needed in everyday application code — it exists mainly for special cases (certain analytics/monitoring code that wants to observe EVERY click before any application code can call `stopPropagation()`). Bubbling (the default) is what you'll use 95% of the time, which is exactly why Step 4's delegation pattern relies on bubbling, not capturing.

---

### Concept: Event Delegation — Directly Fixing LAB-29's Problem

**What it is:** Instead of attaching a listener to EVERY individual child element (LAB-29's to-do list re-attaching a listener to every remove button, every render), attach ONE listener to a stable PARENT, and use bubbling to catch clicks from ANY child — including children that don't exist YET when the listener was attached.

**The problem before, revisited from LAB-29:**

```ts
// LAB-29's approach — re-attaches a listener to EVERY item, EVERY render
for (const todo of todos) {
  const removeButton = document.createElement('button')
  removeButton.addEventListener('click', () => { /* ... */ })   // new listener, every single render
}
```

**The solution:** Attach ONE listener to the LIST itself. Use `event.target` to figure out WHICH child was actually clicked.

```ts
list.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.matches('button.remove')) {          // did the click land on a "remove" button specifically?
    const id = target.closest('li')!.dataset.id     // find the enclosing <li>, read its data
    // handle removal using 'id'
  }
})
// this ONE listener works for every item that exists NOW, and every item added LATER
```

**Project Application (The "Why" here):** This directly resolves LAB-29's Step 4 inefficiency — attach the listener ONCE, on the STABLE parent `<ul>`, instead of re-attaching it to every disposable `<li>` on every re-render.

---

## Step 4 — Build a Delegated List Handler

```ts
console.log('\n=== Event Delegation ===')
console.log('(click any list item, including ones added AFTER the listener was attached)')

const delegatedList = document.createElement('ul')
app.appendChild(delegatedList)

function addItem(text: string): void {
  const item = document.createElement('li')
  item.textContent = text
  delegatedList.appendChild(item)
}

addItem('Buy milk')
addItem('Walk the dog')

delegatedList.addEventListener('click', (e) => {                // ← add: ONE listener, on the PARENT, attached ONCE
  const target = e.target as HTMLElement
  if (target.tagName === 'LI') {
    console.log(`delegated handler saw click on: ${target.textContent}`)
  }
})

// Add a NEW item AFTER the listener was already attached:
addItem('NEW ITEM (added after listener attached)')
```

### SAVE AND TRY

Click "Buy milk," then click "NEW ITEM (added after listener attached)."

**Expected console output (after clicking both):**
```
delegated handler saw click on: Buy milk
delegated handler saw click on: NEW ITEM (added after listener attached)
  ← ONE listener, attached ONCE, handles every item — including future ones
```

**This is the direct fix for LAB-29's Step 4 problem:** `delegatedList`'s listener was attached EXACTLY ONCE, before "NEW ITEM" even existed — yet clicking it still worked, because the click event BUBBLES from the clicked `<li>` up to `delegatedList`, where the ONE listener is waiting, regardless of whether that specific `<li>` existed at the time the listener was attached.

---

## 🎯 Challenge: Delegated Remove Buttons

**You know:** `event.target` tells you exactly what was clicked; `.closest()` finds the nearest matching ancestor.

**Task:** Rebuild LAB-29's to-do list remove functionality using ONE delegated listener on the `<ul>`, instead of LAB-29's per-item listeners. Each `<li>` should store its todo `id` in a `data-id` attribute; the remove button inside should have a distinguishing class or tag.

<details>
<summary>▶ Show Solution</summary>

```ts
interface Todo { id: number; text: string }
let todos: Todo[] = [{ id: 1, text: 'Buy milk' }, { id: 2, text: 'Walk the dog' }]

const todoList = document.createElement('ul')
app.appendChild(todoList)

function renderTodos(): void {
  todoList.innerHTML = ''
  for (const todo of todos) {
    const li = document.createElement('li')
    li.dataset.id = String(todo.id)               // stash the id ON the element itself
    li.textContent = todo.text + ' '
    const removeBtn = document.createElement('button')
    removeBtn.textContent = 'x'
    removeBtn.className = 'remove'                  // a marker Class to identify remove buttons specifically
    li.appendChild(removeBtn)
    todoList.appendChild(li)
  }
}

todoList.addEventListener('click', (e) => {          // ← ONE listener. Attached ONCE. Ever.
  const target = e.target as HTMLElement
  if (target.classList.contains('remove')) {
    const li = target.closest('li')!
    const id = Number(li.dataset.id)
    todos = todos.filter(t => t.id !== id)
    renderTodos()
  }
})

renderTodos()
```

**Key insight:** `renderTodos()` STILL rebuilds every `<li>` on every change (LAB-29's approach, unchanged) — but it NO LONGER attaches a new `click` listener inside that loop. The ONE listener on `todoList` was attached exactly once, outside `renderTodos()` entirely, and continues working correctly no matter how many times the list's CONTENTS are rebuilt. This is a genuine, measurable improvement: fewer listener objects created over the app's lifetime, and one less thing to get wrong on every re-render.

</details>

---

## Mental Model: Where This Shows Up

| Situation | Bubbling / delegation at work |
|---|---|
| A single `document`-level listener for keyboard shortcuts | Catches key presses from anywhere on the page via bubbling |
| React's event system | Internally attaches ONE listener at the root and uses delegation for every component's `onClick`, `onChange`, etc. |
| Modal/dropdown "click outside to close" | Listens on `document`, checks `event.target` to see if the click was OUTSIDE the modal |
| Dynamically added table rows | A single delegated listener on `<tbody>` handles clicks on rows that don't exist yet |

**Where you will see this again:** LAB-32 (Reactivity Model) removes the NEED to manually manage listeners like this at all — but understanding delegation explains WHY React can get away with attaching listeners so sparingly under the hood.

---

## Final Check

| Feature | How to verify |
|---|---|
| Clicking a nested child fires listeners on child, then parent, then grandparent, in that order | Step 1 |
| `stopPropagation()` correctly prevents ancestor listeners from firing | Step 2 |
| Capture-phase listeners fire outside-in, before bubble-phase listeners | Step 3 |
| A delegated listener, attached once, correctly handles a NEWLY added child | Step 4 |
| A rebuilt to-do list's remove buttons work via ONE delegated listener, not per-item listeners | Challenge |
| You can explain, without notes, why delegation is more efficient than per-item listeners | Concept box |

---

## Quick Check Answers

**1. Button inside a div, both with click listeners — does the div's listener fire too?**

Yes — this is bubbling, confirmed directly in Step 1. Clicking the button fires the button's OWN listener first, then the event continues traveling UP through every ancestor, including the div, firing the div's listener too. This is standard, deliberate browser behavior, not a bug to work around (though `stopPropagation()`, Step 2, exists for the cases where you genuinely need to prevent it).

**2. Attaching a listener once instead of re-attaching every render — what's the mechanism?**

Event delegation (Step 4): attach ONE listener to a STABLE parent element (one that isn't destroyed/recreated on every render, unlike the individual `<li>`s), and rely on bubbling to deliver clicks from ANY child — present or future — up to that one listener. `event.target` (and `.closest()`, for finding the right ancestor) let that single handler figure out exactly what was clicked, without needing a dedicated listener per child.

**3. A new `<li>` added AFTER a delegated listener was attached — does it work?**

Yes — demonstrated directly in Step 4, where "NEW ITEM" was added to the list AFTER `delegatedList`'s listener was already attached, and clicking it still correctly triggered the handler. This works because the listener is on the PARENT, and bubbling happens at CLICK TIME, not at LISTENER-REGISTRATION time — the parent doesn't need to know in advance what children it will ever contain; it just reacts to whatever bubbles up to it, whenever a click actually happens.

---

*Next: [LAB-31 — Manual State Sync](LAB-31-manual-state-sync.md) — TypeScript (Browser), same module*
