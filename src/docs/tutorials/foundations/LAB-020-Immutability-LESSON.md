# FOUNDATIONS — LAB-020 — Immutability

**Series:** FOUNDATIONS — Part IV: Functional Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 50–65 minutes.

---

## What You Will Build

Two implementations of a shopping cart — one with mutable operations and one with immutable operations — and a direct comparison showing how mutation creates hidden bugs while immutability makes the bug impossible. You will also implement `Object.freeze` enforcement and demonstrate React's state management requirement that state objects must not be mutated directly. After this lab, you will be able to spot mutation bugs, use spread syntax and array methods to produce new values instead of modifying existing ones, and explain why immutability is the complement of pure functions.

---

## What You Need to Know First

**From LAB-019 (Pure Functions):** Pure functions do not modify their inputs. Immutability is the data-side commitment that mirrors the function-side commitment: neither functions nor data structures change after creation.

**From LAB-012 (Classes) and LAB-013 (Encapsulation):** You have seen how classes protect data through access control. Immutability takes this further: the data structure itself is frozen, not just gated behind methods.

---

> **Quick Check — try to answer before reading:**
>
> 1. `const numbers = [1, 2, 3]; numbers.push(4);` — does `const` prevent this? Why or why not?
> 2. You pass an array to a function. The function modifies the array. When the function returns, what is the state of the original array?
> 3. What is "structural sharing" and why does it make immutable updates efficient even for large data structures?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Mutation vs Value Semantics

**The problem this step solves:** Show the difference between modifying an existing object (mutation) and producing a new object (value semantics), and demonstrate the class of bugs mutation enables.

**The code:**

```js
// Mutation: modifying the original
function addItemMutating(cart, item) {
  cart.items.push(item);   // MODIFIES the passed-in cart
  cart.total += item.price;
  return cart;   // same object — not a new one
}

// Value semantics: producing a new value
function addItemImmutable(cart, item) {
  return {
    items: [...cart.items, item],   // new array with item appended
    total: cart.total + item.price, // new total
  };
}

// The mutation bug:
const originalCart = { items: [], total: 0 };
const savedSnapshot = originalCart;   // "saved a snapshot" — but it is the same object!

const updatedCart = addItemMutating(originalCart, { name: "Widget", price: 9.99 });

console.log("Updated:", updatedCart.items.length);   // → 1
console.log("Snapshot:", savedSnapshot.items.length); // → 1  (UNEXPECTED — snapshot was mutated!)
```

**The walkthrough — why the snapshot was mutated:**

1. `originalCart = { items: [], total: 0 }` — an object is created in heap memory.
2. `savedSnapshot = originalCart` — this does NOT copy the object. It copies the **reference** — both variables now point to the same object in memory.
3. `addItemMutating(originalCart, ...)` pushes to `cart.items`. `cart` is `originalCart`, which is the same object `savedSnapshot` points to.
4. Both `updatedCart` and `savedSnapshot` now reflect the mutation — because all three variables point to the same object.

This is **reference semantics** — JavaScript objects and arrays are passed by reference. Mutating an object through any reference affects all references.

**CS lens — value semantics vs reference semantics:**

A language or operation uses **value semantics** when assignments and function calls copy the value — modifying the copy does not affect the original. Numbers, strings, and booleans in JavaScript use value semantics: `let a = 5; let b = a; b = 10; console.log(a)` — `a` is still `5`.

Objects and arrays use **reference semantics**: `let a = {x: 1}; let b = a; b.x = 2; console.log(a.x)` — `a.x` is `2`. `b = a` copies the reference, not the object. Immutability is the practice of treating objects with value semantics — by never mutating them and always producing new objects for updates.

**SE lens — the aliasing problem:**

When two variables point to the same mutable object, changing it through one variable has an invisible effect on the other. This is **aliasing** — one object with many names. Aliasing causes bugs that are notoriously hard to find: the change happens in function A, the bug appears in function B, and there is no obvious connection between them. Immutability eliminates aliasing bugs by guaranteeing that passing an object to a function can never modify the original.

**What breaks with mutation in React:**

React uses shallow comparison to decide whether to re-render. `prevState === nextState` — if the same object reference, no re-render. If you mutate `state.items.push(item)` and return the same array, React sees the same reference and skips the re-render. The UI stays stale. The immutable version (`[...state.items, item]`) creates a new array, React sees a different reference, and re-renders. This is the exact reason React requires immutable state updates.

---

### SAVE AND TRY

```js
// Immutable version:
function addItemImmutable(cart, item) {
  return {
    items: [...cart.items, item],
    total: cart.total + item.price,
  };
}

const cart0 = { items: [], total: 0 };
const cart1 = addItemImmutable(cart0, { name: "Widget", price: 9.99 });
const cart2 = addItemImmutable(cart1, { name: "Gadget", price: 24.99 });

console.log("cart0:", cart0.items.length, "items");   // → 0 (unchanged)
console.log("cart1:", cart1.items.length, "items");   // → 1 (new object)
console.log("cart2:", cart2.items.length, "items");   // → 2 (new object)
console.log("cart0 === cart1:", cart0 === cart1);     // → false (different objects)
```

Expected: `0`, `1`, `2`, `false`. The original cart is never modified.

**Change something:** Save the intermediate states and navigate back:

```js
const history = [cart0];
history.push(addItemImmutable(history[history.length - 1], { name: "Widget", price: 9.99 }));
history.push(addItemImmutable(history[history.length - 1], { name: "Gadget", price: 24.99 }));

console.log("Current:", history[history.length - 1].total.toFixed(2));  // → 34.98
console.log("After one item:", history[1].total.toFixed(2));             // → 9.99
console.log("Before any item:", history[0].total.toFixed(2));            // → 0.00
```

Immutability enables this: every version of the cart is preserved. With mutation, there is only the current state — the past is gone. This is why undo/redo, time-travel debugging, and audit trails all rely on immutability.

---

### Step 2 — Immutable Array Operations

**The problem this step solves:** Show the immutable alternatives to each mutating array method.

**The code:**

```js
const originalItems = [
  { id: 1, name: "Widget",  price: 9.99,  inStock: true },
  { id: 2, name: "Gadget",  price: 24.99, inStock: false },
  { id: 3, name: "Donut",   price: 1.99,  inStock: true },
  { id: 4, name: "Gizmo",   price: 14.99, inStock: true },
];

// MUTATING vs IMMUTABLE equivalents:

// Add to end:
// MUTATING:  originalItems.push(newItem)
// IMMUTABLE: [...originalItems, newItem]
const withAdded = [...originalItems, { id: 5, name: "Thingamajig", price: 4.99, inStock: true }];

// Remove by index:
// MUTATING:  originalItems.splice(index, 1)
// IMMUTABLE: [...items.slice(0, index), ...items.slice(index + 1)]
const withRemoved = [
  ...originalItems.slice(0, 1),   // items before index 1
  ...originalItems.slice(2),      // items after index 1
];  // removes index 1 (Gadget)

// Update one item:
// MUTATING:  items[index].price = newPrice
// IMMUTABLE: items.map(item => item.id === targetId ? { ...item, price: newPrice } : item)
const withUpdated = originalItems.map(item =>
  item.id === 2 ? { ...item, price: 29.99 } : item
);   // updates Gadget's price

// Sort (Array.sort mutates in place):
// MUTATING:  originalItems.sort(compareFn)
// IMMUTABLE: [...originalItems].sort(compareFn)
const sortedByPrice = [...originalItems].sort((a, b) => a.price - b.price);
```

**`Array.prototype.slice(start, end)`** — returns a new array containing the elements from index `start` (inclusive) to `end` (exclusive). Does not modify the original. `slice(0, 1)` returns the first element; `slice(2)` returns everything from index 2 onward.

**`{ ...item, price: newPrice }`** — **object spread with override**. Creates a new object with all of `item`'s properties, then overrides `price` with `newPrice`. If `item = { id: 2, name: "Gadget", price: 24.99 }` and `newPrice = 29.99`, the result is `{ id: 2, name: "Gadget", price: 29.99 }`. The original `item` object is unchanged.

**The walkthrough — updating one item in an array:**

`originalItems.map(item => item.id === 2 ? { ...item, price: 29.99 } : item)`:

1. `map` iterates over every item.
2. For `item.id === 1` (Widget): condition is false. Returns `item` — the original object (no copy needed for unchanged items).
3. For `item.id === 2` (Gadget): condition is true. Returns `{ ...item, price: 29.99 }` — a new object with updated price.
4. For `item.id === 3` and `4`: return original objects.
5. `map` returns a new array with 4 elements: 3 original references and 1 new object.

Only the changed item gets a new object. The others are the same references — this is **structural sharing**: the new data structure shares the unchanged parts with the old one, making the operation efficient even for large arrays.

**CS lens — structural sharing:**

In a naive immutable implementation, every update would copy the entire data structure. For a million-element array, updating one element copies a million objects. Structural sharing avoids this: the new array holds references to unchanged elements (same memory) and only creates new objects for changed elements. The old and new arrays share most of their memory. Libraries like Immer and Immutable.js implement efficient structural sharing for deeply nested structures.

**SE lens — `Array.sort` is the trap:**

`Array.prototype.sort` is one of the most commonly misused mutating methods. It sorts the array **in place** and returns the same array. Passing an array to a sort function and trusting the original is unchanged is a common bug. Always copy first: `[...array].sort(...)`. The `...` spread creates a new array before sorting, leaving the original intact.

**What breaks with `Array.sort` without copying:**

```js
const prices = [3, 1, 4, 1, 5, 9, 2, 6];
const cheapest3 = prices.sort((a, b) => a - b).slice(0, 3);

console.log(cheapest3);  // → [1, 1, 2]  (correct)
console.log(prices);     // → [1, 1, 2, 3, 4, 5, 6, 9]  (MUTATED — original gone!)
```

`prices` is now sorted. Any code that expected `prices` to be in its original order is now broken. Fix: `const cheapest3 = [...prices].sort((a, b) => a - b).slice(0, 3)`.

---

### SAVE AND TRY

```js
const items = [
  { id: 1, name: "Widget", quantity: 3 },
  { id: 2, name: "Gadget", quantity: 1 },
];

// Add an item
const withNewItem = [...items, { id: 3, name: "Donut", quantity: 5 }];

// Update quantity of id=1
const withUpdatedQty = items.map(item =>
  item.id === 1 ? { ...item, quantity: item.quantity + 1 } : item
);

// Remove id=2
const withoutGadget = items.filter(item => item.id !== 2);

console.log("Original:", items.length, "items");           // → 2 (unchanged)
console.log("After add:", withNewItem.length, "items");    // → 3
console.log("Widget qty after update:", withUpdatedQty[0].quantity);  // → 4
console.log("After remove:", withoutGadget.length, "items"); // → 1
```

Expected: `2`, `3`, `4`, `1`.

**Change something:** Verify `items[0] === withUpdatedQty[0]` — expected `false` (Widget was updated, new object). Verify `items[1] === withUpdatedQty[1]` — expected `true` (Gadget was not updated, same reference — structural sharing). This demonstrates that only the changed element gets a new object.

---

### Step 3 — `Object.freeze` for Enforcement

**The problem this step solves:** Make JavaScript enforce immutability rather than relying on discipline.

**The code:**

```js
const config = Object.freeze({
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
  nested: { debug: false },  // NOTE: Object.freeze is SHALLOW
});

// Attempting to modify:
config.timeout = 10000;         // silently fails in non-strict mode; throws in strict mode
config.newField = "value";      // silently fails or throws
console.log(config.timeout);    // → 5000  (unchanged)

// BUT: nested objects are NOT frozen:
config.nested.debug = true;     // SUCCEEDS — nested object was not frozen
console.log(config.nested.debug);  // → true  (mutated!)
```

**`Object.freeze(obj)`** — makes `obj` **shallow immutable**: its direct properties cannot be added, removed, or reassigned. The freeze applies only one level deep — nested objects are separate objects and are not frozen. Returns the same object (frozen).

**Why shallow freeze matters:**

`Object.freeze({ nested: { debug: false } })` freezes the outer object's `nested` property (you cannot do `config.nested = null`) but does NOT freeze the object that `nested` points to. To deeply freeze:

```js
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach(name => {
    const value = obj[name];
    if (typeof value === "object" && value !== null) {
      deepFreeze(value);   // recursively freeze nested objects
    }
  });
  return Object.freeze(obj);
}

const frozenConfig = deepFreeze({
  apiUrl: "https://api.example.com",
  nested: { debug: false },
});

frozenConfig.nested.debug = true;  // silently fails — nested is now frozen
console.log(frozenConfig.nested.debug);  // → false  (unchanged)
```

`Object.getOwnPropertyNames(obj)` — returns an array of all own property names (including non-enumerable ones) of `obj`. More thorough than `Object.keys()`, which only returns enumerable properties.

**CS lens — freeze as a shallow invariant:**

`Object.freeze` is a runtime enforcement of immutability. Once frozen, the object cannot be accidentally mutated. This is useful for configuration objects, constants, and error message dictionaries that should never change. The shallow-only behavior is a design choice — deep freezing is expensive for large objects and is done with `deepFreeze` when needed.

**SE lens — prefer TypeScript `readonly` for compile-time checking:**

In TypeScript, `readonly` properties and `Readonly<T>` utility type prevent mutation at compile time — before the code runs. `const config: Readonly<Config> = { ... }` — TypeScript rejects any assignment to `config.timeout` at compile time, catching the bug before it reaches production. `Object.freeze` catches it at runtime. For production code, TypeScript's approach is preferable.

**What breaks with only shallow freeze:**

```js
const user = Object.freeze({ name: "Alice", address: { city: "NYC" } });
user.name = "Bob";               // silently fails — name is frozen
user.address.city = "LA";        // succeeds! — address object is not frozen
console.log(user.address.city);  // → "LA"  — unintended mutation
```

Shallow freeze gives a false sense of security for objects with nested structure. Always use `deepFreeze` when you need to guarantee full immutability.

---

### SAVE AND TRY

```js
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach(name => {
    const value = obj[name];
    if (typeof value === "object" && value !== null) {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}

const settings = deepFreeze({
  theme: "dark",
  layout: { sidebar: true, density: "compact" },
});

settings.theme = "light";         // silently fails
settings.layout.sidebar = false;  // silently fails — nested frozen
console.log(settings.theme);           // → "dark"
console.log(settings.layout.sidebar); // → true
```

Expected: both still frozen values.

**Change something:** Use strict mode to make mutations throw: paste `"use strict";` at the top of the code block. Now `settings.theme = "light"` should throw a `TypeError` instead of silently failing. Strict mode turns silent failures into explicit errors.

---

## Connect the Pieces

**What you built:** An immutable cart with history, immutable array operations for add/remove/update, and deep freeze enforcement.

**How it connects to LAB-019 (Pure Functions):** Pure functions are the commitment: "this function does not modify its inputs." Immutability is the data-side commitment: "this data cannot be modified." Together they form a system where data flows through transformations without hidden state changes. The pure function `addItemImmutable(cart, item)` is pure precisely because it produces a new cart instead of modifying the passed-in one.

**How it connects to LAB-021 (map/filter/reduce):** `map`, `filter`, and `reduce` are the canonical immutable array transformations. None of them modify the original array. This is why functional programming and immutability go hand-in-hand — the standard higher-order functions are all immutable.

**How it connects forward:**

- **LAB-022 (Function Composition):** Composing pure functions requires that each step produces a new value. If step 2 mutated step 1's output, step 1's result would no longer be available for comparison, undo, or debugging.
- **LAB-060 (Unit Testing):** Immutable functions are testable because inputs are guaranteed unchanged across test cases. With mutable functions, a test that modifies its input leaves a dirty state for the next test.
- **React's useState, Redux, Immer:** All three require immutable state updates. React's reconciler compares references (`===`) for shallow equality checks. Redux's `combineReducers` relies on reducers returning new state objects. Immer provides a convenient API for writing immutable updates with mutable-looking syntax.

**The real-world connection:**

Git's entire model is immutable: commits are immutable snapshots. Each commit contains a reference to its parent, creating an immutable history. You never modify a commit; you create new commits. Blockchain uses the same principle — each block contains a hash of the previous block, and any modification to a past block invalidates all subsequent blocks. Persistent data structures (used in Clojure, Haskell, and Elm) apply structural sharing to make immutability efficient at scale. Event sourcing (LAB-094) is immutability applied to databases: events are immutable; state is derived by replaying them.

---

## What Breaks Without This

**Concrete failure — hidden mutation through function argument:**

```js
function applyDiscount(cart, discountRate) {
  cart.items = cart.items.map(item => ({
    ...item,
    price: item.price * (1 - discountRate)
  }));
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
  return cart;   // same object, mutated
}

const regularCart  = { items: [{ name: "Widget", price: 10 }], total: 10 };
const discountedCart = applyDiscount(regularCart, 0.1);

console.log("Regular price:", regularCart.items[0].price);   // → 9  (MUTATED! Expected 10)
console.log("Discounted price:", discountedCart.items[0].price);  // → 9
```

`regularCart` was supposed to preserve the original prices. `applyDiscount` mutated it. The caller now has no way to recover the original price. With an immutable `applyDiscount` that returns a new cart, `regularCart` remains unchanged and can be displayed alongside `discountedCart` for comparison.

---

## Definition of Done

Verify each item before moving to LAB-021.

- [ ] `addItemImmutable(cart, item)` returns a new cart; the original cart is unchanged
- [ ] Saving `history = [cart0, cart1, cart2]` gives access to all three past states
- [ ] `items.map(item => item.id === 2 ? { ...item, price: 29.99 } : item)` updates one item without mutating the array
- [ ] `[...items].sort(...)` sorts without mutating `items`
- [ ] `Object.freeze(obj)` prevents direct property assignment (silently or throwing in strict mode)
- [ ] `deepFreeze` prevents nested property mutation
- [ ] `items[1] === withUpdatedQty[1]` is `true` when `id !== 1` — structural sharing confirmed

**Git commit:**

```
git add .
git commit -m "LAB-020: immutable cart with history — spread syntax for immutable add/update/remove, Object.freeze enforcement, structural sharing"
```

---

## Quick Check Answers

**1. Does `const` prevent `numbers.push(4)` on `const numbers = [1, 2, 3]`?**

No. `const` prevents reassigning the variable — `numbers = [1, 2, 3, 4]` would throw `TypeError: Assignment to constant variable`. But `const` does not prevent mutating the object that `numbers` refers to. `numbers.push(4)` calls a method on the array object. The object is mutated; the variable still points to the same object. `const` is about the binding (variable → object), not the object's content.

**2. If you pass an array to a function and it modifies the array, what is the state of the original?**

The original is modified. JavaScript arrays are passed by reference — the function receives a reference to the same array, not a copy. Any mutation through the reference modifies the original. This is why functions like `Array.prototype.sort` and `Array.prototype.splice` — which mutate in place — are considered dangerous in functional contexts. Always copy before mutating: `[...array].sort(...)`.

**3. What is structural sharing?**

Structural sharing means a new immutable data structure reuses the unchanged parts of the old structure rather than copying everything. When you update one item in a 1000-item array with `array.map(item => item.id === 5 ? {...item, price: newPrice} : item)`, the 999 unchanged items are the same object references in both the old and new array. Only 1 new object is created. The old array and new array share 999 references and differ in one. This makes immutable updates efficient: memory usage is proportional to the number of changes, not the total data size.

---

*Next: LAB-021 — Higher-Order Functions: map, filter, reduce*
