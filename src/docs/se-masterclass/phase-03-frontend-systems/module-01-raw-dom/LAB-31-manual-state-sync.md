# SE Masterclass — LAB-31 — Manual State Sync

**Language: TypeScript (Browser)** — same setup as LAB-29–30, closing out Module 1.

**Prerequisites:** LAB-29 (raw DOM) and LAB-30 (delegation). This lab deliberately pushes the "manually keep the DOM in sync" pattern from LAB-29 to a real breaking point — on purpose, so LAB-32's fix lands as obviously necessary rather than as unmotivated new syntax.

**What this lab adds:**
- A shopping cart with MULTIPLE pieces of state that all derive from the same underlying data
- Watching sync logic get duplicated across every place the data can change
- Deliberately introducing a real, common bug: a new feature that forgets ONE sync call
- The exact shape of the problem LAB-32's reactivity model exists to solve structurally

**Time:** 60–80 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A cart has `items`, a computed `total`, and a `checkoutButton.disabled` state (derived from whether `total > 0`). How many DIFFERENT DOM elements need to be manually updated whenever `items` changes?
> 2. If there are 3 ways to change `items` (add, remove, change quantity) and 2 derived UI pieces (total text, checkout button), how many total "remember to sync this" spots exist in the code?
> 3. What happens the day someone adds a 4th way to change `items` (say, a "clear cart" button) and forgets ONE of the 2 sync calls?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows a shopping cart:

```
Shopping Cart
Apple  x2  [-] [+] [remove]     $2.00
Bread  x1  [-] [+] [remove]     $3.50

Total: $5.50
[Checkout]  (enabled — total > 0)

[Clear Cart]
```

Changing quantities, removing items, and clearing the cart all need to keep `Total:` and the `Checkout` button's enabled state correct — by hand, in this lab.

---

### Concept: Derived State — Data That's Computed FROM Other Data

**What it is:** Some values aren't independently set — they're COMPUTED from other data. `total` is derived from `items` (sum of `price * quantity` for each). Whether `Checkout` should be enabled is derived from `total` (enabled only if `total > 0`). Nothing directly "sets" these — they should always just be a FUNCTION of the underlying data.

**The problem before:** The DOM has no built-in concept of "this text should always equal this computation." Every single place `items` can change must REMEMBER to also recompute `total` and REMEMBER to also update the `Checkout` button — manually, every time, forever.

---

## Step 1 — Build the Cart, Syncing by Hand

```ts
// main.ts
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

const app = document.querySelector<HTMLDivElement>('#app')!
let items: CartItem[] = [
  { id: 1, name: 'Apple', price: 1.0, quantity: 2 },
  { id: 2, name: 'Bread', price: 3.5, quantity: 1 },
]

const heading = document.createElement('h2')
heading.textContent = 'Shopping Cart'
const itemList = document.createElement('div')
const totalLine = document.createElement('p')
const checkoutButton = document.createElement('button')
checkoutButton.textContent = 'Checkout'

app.append(heading, itemList, totalLine, checkoutButton)

function computeTotal(): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function syncTotal(): void {                              // ← add: manual sync point #1
  totalLine.textContent = `Total: $${computeTotal().toFixed(2)}`
}

function syncCheckoutButton(): void {                     // ← add: manual sync point #2 — a SEPARATE function, easy to forget
  checkoutButton.disabled = computeTotal() === 0
}

function renderItems(): void {
  itemList.innerHTML = ''
  for (const item of items) {
    const row = document.createElement('div')
    row.textContent = `${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`
    itemList.appendChild(row)
  }
}

function syncAll(): void {                                // ← add: the "remember to call all three" function
  renderItems()
  syncTotal()
  syncCheckoutButton()
}

syncAll()      // initial render
```

### SAVE AND TRY

Save. The browser should show:
```
Shopping Cart
Apple x2 — $2.00
Bread x1 — $3.50
Total: $5.50
[Checkout]  ← enabled, since total > 0
```

**Confirm THREE separate function calls were needed for ONE conceptual "state changed" event:** `renderItems()`, `syncTotal()`, and `syncCheckoutButton()` each independently read from `items`/`computeTotal()` and independently push their own piece of the DOM — nothing AUTOMATICALLY connects "items changed" to "these three things need updating." That connection exists only because `syncAll()` remembers to call all three, every time.

---

## Step 2 — Add Quantity Controls, Multiply the Sync Points

```ts
function renderItems(): void {
  itemList.innerHTML = ''
  for (const item of items) {
    const row = document.createElement('div')
    row.textContent = `${item.name} x${item.quantity} `

    const decrementBtn = document.createElement('button')
    decrementBtn.textContent = '-'
    decrementBtn.addEventListener('click', () => {
      item.quantity = Math.max(0, item.quantity - 1)
      syncAll()                                              // ← add: mutation site #1 — must remember syncAll()
    })

    const incrementBtn = document.createElement('button')
    incrementBtn.textContent = '+'
    incrementBtn.addEventListener('click', () => {
      item.quantity++
      syncAll()                                              // ← add: mutation site #2 — must remember syncAll()
    })

    const removeBtn = document.createElement('button')
    removeBtn.textContent = 'remove'
    removeBtn.addEventListener('click', () => {
      items = items.filter(i => i.id !== item.id)
      syncAll()                                              // ← add: mutation site #3 — must remember syncAll()
    })

    row.append(decrementBtn, incrementBtn, removeBtn)
    const price = document.createElement('span')
    price.textContent = `  $${(item.price * item.quantity).toFixed(2)}`
    row.appendChild(price)

    itemList.appendChild(row)
  }
}
syncAll()
```

### SAVE AND TRY

Save. Click `+`/`-`/`remove` on items in the browser. Confirm `Total:` and the `Checkout` button both stay correct after every interaction.

**Count the sync points out loud:** THREE places `items` can be mutated (decrement, increment, remove), each one needing to remember `syncAll()`. This is already fragile — miss `syncAll()` in just ONE of these three handlers, and that ONE interaction would silently leave the total stale.

---

## Step 3 — Add a Feature, Forget a Sync Call (On Purpose)

```ts
const clearButton = document.createElement('button')
clearButton.textContent = 'Clear Cart'
clearButton.addEventListener('click', () => {
  items = []
  renderItems()          // ← BUG: forgot to also call syncTotal() and syncCheckoutButton()!
})
app.appendChild(clearButton)
```

### SAVE AND TRY

Save. Add some items back if needed, then click "Clear Cart."

**Observe the bug directly:** `itemList` correctly becomes empty (since `renderItems()` was called) — but `Total: $5.50` (or whatever it was) STAYS ON SCREEN, stale, and `Checkout` STAYS ENABLED, even though the cart is now empty and there is nothing to check out. This is a REAL, common class of bug: a NEW feature (the clear button) was added by a developer who correctly remembered ONE of the three necessary sync calls but forgot the other two — nothing in the code STRUCTURALLY prevented this omission.

**This was not a contrived mistake.** As an application grows — more derived values, more places that mutate the underlying data — the number of "remember to call X after every mutation of Y" pairings grows MULTIPLICATIVELY (3 mutation sites × 2 sync functions = 6 spots to remember correctly, and it only gets worse from here), and EVERY one of those spots is a place a bug like this can silently slip in.

---

## 🎯 Challenge: The Best Fix Available Without a Framework

**You know:** `syncAll()` centralizing the three updates was already an improvement over calling each one separately — the bug happened specifically because Step 3's `clearButton` bypassed `syncAll()` and called `renderItems()` directly instead.

**Task:** Fix the `clearButton` bug the ONLY way available at this raw-DOM level: make sure EVERY mutation site calls `syncAll()`, and NEVER calls the individual sync functions directly. Then answer honestly: does this actually SOLVE the underlying problem, or does it just relocate the discipline required?

<details>
<summary>▶ Show Solution</summary>

```ts
clearButton.addEventListener('click', () => {
  items = []
  syncAll()          // fixed — but only because a human remembered to fix it
})
```

**Honest answer: this does NOT solve the underlying problem — it just fixes this ONE instance of it.** The RULE "every mutation site must call `syncAll()`, never the individual sync functions" is a DISCIPLINE a developer has to remember and follow correctly, forever, across every future feature added to this cart. Nothing in the TYPE SYSTEM, the FUNCTION SIGNATURES, or the STRUCTURE of the code makes it IMPOSSIBLE to forget — it's a comment-shaped rule ("remember to call syncAll()"), not an enforced one. This is precisely the gap LAB-32's reactivity model closes structurally: instead of a human needing to remember which DERIVED values depend on which SOURCE data, the SYSTEM tracks that dependency automatically and re-syncs whatever's needed, for you, no matter how the source data changed or how many new mutation sites get added later.

</details>

---

## Mental Model: The Shape of the Problem, Named Precisely

| What LAB-29–31 required, by hand | What LAB-32 automates |
|---|---|
| Manually calling `syncTotal()` after every mutation | `total` auto-recomputes whenever `items` changes — no manual call, anywhere |
| Remembering WHICH derived values depend on `items` | The reactive system tracks dependencies automatically, by observing what each computation actually READS |
| A forgotten sync call producing silently stale UI (Step 3's bug) | Structurally impossible — there's no "sync call" to forget in the first place |
| `syncAll()` as a fragile, hand-maintained checklist | A dependency GRAPH (LAB-14, revisited) the framework walks automatically |

**This is not a new problem.** It's LAB-14's dependency graph and LAB-22's event bus, both narrowly avoided here because nothing in raw DOM code AUTOMATICALLY tracks "which computed values depend on which source data" or "who should be notified when source data changes." LAB-32 builds exactly that missing piece.

---

## Final Check

| Feature | How to verify |
|---|---|
| The cart correctly shows items, total, and an enabled/disabled checkout button | Step 1 |
| Quantity `+`/`-` and `remove` all correctly keep total and checkout state in sync | Step 2 |
| You directly observed the stale-total bug from a forgotten sync call | Step 3 |
| You can articulate WHY the "just remember to call syncAll() everywhere" fix is fragile, not robust | Challenge |
| You can name, precisely, what LAB-32 needs to automate to prevent this bug class entirely | Mental Model table |

---

## Quick Check Answers

**1. How many DOM elements need manual updates when `items` changes?**

At least three DIFFERENT pieces: the rendered item list itself (`itemList`), the total text (`totalLine`), and the checkout button's `disabled` property (`checkoutButton`) — each requiring its OWN function call (`renderItems()`, `syncTotal()`, `syncCheckoutButton()`), demonstrated directly in Step 1, where a single conceptual "state changed" required three separate, independent DOM-touching calls.

**2. 3 mutation sites × 2 derived UI pieces — how many "remember to sync" spots exist?**

Six, in the worst case (if you don't centralize into a single `syncAll()` helper) — every one of the 3 places `items` can change needs to separately remember to trigger both of the 2 derived updates. Even centralizing into `syncAll()` (Step 1's actual approach) only reduces this to "3 places must remember to call ONE function" — it doesn't eliminate the underlying requirement that EVERY mutation site remember to trigger a sync at all, which is exactly what Step 3's bug exploited.

**3. A 4th mutation site forgets a sync call — what happens?**

Exactly what Step 3 demonstrated: the DOM silently goes STALE — `itemList` might update correctly (if `renderItems()` was remembered) while `total` and `checkoutButton` display OLD, now-incorrect values, with NO error, warning, or visual indication that anything is wrong. This is what makes the bug class dangerous in real applications: it fails SILENTLY, often not caught until a user notices something looks wrong, rather than crashing loudly where it would be immediately obvious and easy to trace.

---

*Module 1 (Raw DOM) complete. Next: [LAB-32 — Reactivity Model](../module-02-frameworks/LAB-32-reactivity-model.md) — TypeScript (Browser), Module 2 begins*
