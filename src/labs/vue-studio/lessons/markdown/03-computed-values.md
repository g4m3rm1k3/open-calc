# Computed Values

## What you will build

A shopping cart summary where total price and discount status update automatically whenever quantity changes — no manual synchronisation.

```
Unit price: $29.99
Quantity:   [−] 3 [+]
            ✅ 10% bulk discount applied
Subtotal:   $89.97
Discount:   −$8.99
Total:      $80.97
```

Change quantity → total, discount, and subtotal update. You never write the update logic yourself.

---

## What you need to know first

Lesson 02 showed that writing to `count.value` triggers a re-render — Vue re-runs the template with the new value. This lesson introduces a different question: what if a value is *derived from* another value? You could store `total` in its own ref and update it manually every time `price` or `quantity` changes. The lesson starts there — and shows exactly why that approach fails structurally before computed values exist to prevent it.

---

## Step 1 — The manual update trap

Try deriving the total by hand. Replace `src/App.vue`:

```html
<script setup lang="ts">
import { ref } from 'vue'

const price    = ref(29.99)
const quantity = ref(1)
const total    = ref(price.value * quantity.value)   // snapshot at line-run time

function increase() {
  quantity.value++
  total.value = price.value * quantity.value   // must remember to update
}

function decrease() {
  if (quantity.value > 1) {
    quantity.value--
    total.value = price.value * quantity.value  // must remember here too
  }
}
</script>

<template>
  <div>
    <p>Price: ${{ price.toFixed(2) }}</p>
    <p>Quantity: {{ quantity }}</p>
    <button @click="decrease">−</button>
    <button @click="increase">+</button>
    <p>Total: ${{ total.toFixed(2) }}</p>
  </div>
</template>
```

Click **▶ Run**. It works.

Now add a coupon code feature that halves the price. You must add a `total.value = ...` update inside the coupon handler. Add a "buy 5 get 1 free" promotion? Another update. Add a "group override price" that an admin can set? Another update. Add a shipping cost? Every function that changes *any* of the inputs must now also update `total` — and any other derived value that depends on those inputs.

**The structural weakness here:** every function that mutates `price` or `quantity` becomes responsible for also maintaining `total`. This is not just extra code — it is a *contract* that every future author must know about and honor. Forget it once and the displayed total silently shows a wrong number. The more derived values you add, the more every mutation function must know about — and the more places a change can be missed.

**SE lens — the synchronisation obligation, exactly.** The code above creates an implicit *maintenance obligation*: "whenever a function changes `price` or `quantity`, it must also recalculate `total`." This obligation is nowhere documented, nowhere enforced by the language, and nowhere enforced by tests. It is a convention that breaks silently when violated. The number of synchronisation sites grows with the product of (number of mutations) × (number of derived values). In a real cart with a dozen derived values and a dozen mutation functions, that is over a hundred places where a missed update causes a bug.

**CS lens — derived values vs independent values.** `price` and `quantity` are *independent facts* — the user sets them; they exist on their own terms. `total` is a *dependent fact* — it follows mathematically from the other two. Storing both kinds in the same container type (`ref`) hides this distinction. Treating a derived truth as if it were a source truth — giving it its own independent ref — means you have to *enforce* the derivation relationship everywhere, manually. The fix is a container that *knows* it is derived and enforces the relationship automatically.

---

## Step 2 — `computed()`: declare what a value *is*, not when to update it

Replace the entire `src/App.vue`:

```html
<script setup lang="ts">
import { ref, computed } from 'vue'

const price    = ref(29.99)
const quantity = ref(1)

const subtotal     = computed(() => price.value * quantity.value)
const hasDiscount  = computed(() => quantity.value >= 3)
const discountAmt  = computed(() => hasDiscount.value ? subtotal.value * 0.1 : 0)
const total        = computed(() => subtotal.value - discountAmt.value)

function increase() { quantity.value++ }
function decrease() { if (quantity.value > 1) quantity.value-- }
</script>

<template>
  <div class="cart">
    <h2>Shopping Cart</h2>

    <div class="row">
      <span>Unit price</span>
      <span>${{ price.toFixed(2) }}</span>
    </div>

    <div class="row">
      <span>Quantity</span>
      <div class="qty">
        <button @click="decrease">−</button>
        <span>{{ quantity }}</span>
        <button @click="increase">+</button>
      </div>
    </div>

    <div v-if="hasDiscount" class="discount">✅ 10% bulk discount applied</div>

    <div class="row">
      <span>Subtotal</span>
      <span>${{ subtotal.toFixed(2) }}</span>
    </div>

    <div v-if="hasDiscount" class="row discount-row">
      <span>Discount</span>
      <span>−${{ discountAmt.toFixed(2) }}</span>
    </div>

    <div class="row total">
      <span>Total</span>
      <span>${{ total.toFixed(2) }}</span>
    </div>
  </div>
</template>

<style scoped>
.cart { font-family: system-ui, sans-serif; max-width: 360px; margin: 40px auto; }
h2 { font-size: 20px; margin-bottom: 20px; }
.row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
.row.total { font-weight: 700; font-size: 18px; border-bottom: none; margin-top: 8px; }
.row.discount-row span:last-child { color: #16a34a; }
.qty { display: flex; align-items: center; gap: 12px; }
.qty button { width: 28px; height: 28px; border: 1px solid #cbd5e1; border-radius: 6px; background: none; cursor: pointer; font-size: 16px; }
.discount { color: #16a34a; font-size: 13px; padding: 8px 0; }
</style>
```

Click **▶ Run**. Increment quantity to 3 — the discount badge appears, the discount row shows, and the total drops by 10%, all instantly and with zero manual update calls.

**Walkthrough — `computed(getter)`:**

```typescript
const subtotal = computed(() => price.value * quantity.value)
```

`computed()` takes a getter function and returns a **ComputedRef<T>** — a reactive, read-only container. Vue tracks every reactive value read inside the getter (any `ref.value`, any other `computed.value`) and records them as dependencies. When any dependency changes, Vue marks this computed as **stale** and re-runs the getter on the next read.

`const subtotal = computed(...)` — the result is assigned to `const`, not `let`. This is intentional: you cannot and should not reassign the computed ref itself. Its value is always the getter's latest result.

**Walkthrough — chained computed values:**

```typescript
const subtotal    = computed(() => price.value * quantity.value)
const hasDiscount = computed(() => quantity.value >= 3)
const discountAmt = computed(() => hasDiscount.value ? subtotal.value * 0.1 : 0)
const total       = computed(() => subtotal.value - discountAmt.value)
```

`total` depends on `discountAmt`; `discountAmt` depends on `hasDiscount` and `subtotal`; both depend on `quantity`. Change `quantity.value` and Vue propagates the change through the chain in the correct topological order: `subtotal` → `hasDiscount` → `discountAmt` → `total`. You do not specify the order — Vue derives it from the dependency graph automatically.

**`increase()` and `decrease()` — one line each.** Neither function mentions `total`, `subtotal`, `hasDiscount`, or `discountAmt`. They only mutate the sources. Derived values update themselves. Adding a new derived value (say, `shippingCost`, `taxAmount`) requires zero changes to the mutation functions.

**CS concept — memoization.** `computed()` caches its result. Between two reads of `subtotal`, if `price` and `quantity` have not changed, Vue returns the cached value without re-running the getter. This matters for performance: a template expression called during every render re-runs on every render triggered by *any* state change, even changes to completely unrelated refs. A computed getter only runs when its specific dependencies change.

Concrete example: suppose your app has `const name = ref('Alice')` and you show both `{{ name }}` and `{{ total }}` in the template. Typing in a name input that updates `name.value` triggers a re-render. Without memoization, `total` would recompute from scratch during that render even though `price` and `quantity` did not change. With `computed`, Vue skips the recomputation — the cached result is still valid.

**CS concept — dependency graph, formalized.** Vue's reactivity system maintains a directed graph at runtime:

```
quantity ──► subtotal ──► total
         ──► hasDiscount ──► discountAmt ──► total
price    ──► subtotal
```

Each node is a reactive value. Each directed edge means "this value depends on that value." When `quantity.value` changes, Vue traverses all outgoing edges from `quantity` and marks dependents as stale. Stale computed values recompute on next read (lazy evaluation). The result of each recomputation may itself propagate to further dependents. This is a **pull-based reactive graph** — values are pulled when needed, not pushed on every change.

**CS concept — purity requirement.** A `computed` getter must be a **pure function** — given the same inputs (reactive dependency values), it must return the same output, with no side effects. Vue may call the getter multiple times during a single render, during SSR, or while checking for changes. If the getter has side effects (writing to `localStorage`, mutating another ref, sending a network request), those side effects may run at unexpected times and frequencies. Computed getters are for reading and transforming reactive data; side effects belong in `watch()` (Lesson 09).

**SE principle — single source of truth.** `price` and `quantity` are the sources of truth: two independent refs that the user controls. `subtotal`, `hasDiscount`, `discountAmt`, and `total` are derived truths — they follow from the sources. The rule: store each fact exactly once. A derived fact stored in its own ref is a second copy that must be kept synchronized with the first, forever. Every new mutation function that touches the source must also update the derived copy. `computed()` makes the derivation relationship structural — it cannot be forgotten.

**What breaks if you replace `computed` with `ref` for `total`:** `const total = ref(price.value * quantity.value)` — this takes a snapshot of the values at the moment the line runs, not a live derivation. Click `+` ten times. Quantity shows correctly. Total stays frozen at $29.99. The line ran once, produced a number, and that number does not update. Every function that changes `price` or `quantity` now needs a manual `total.value = ...` update — the Step 1 trap, reintroduced.

**What breaks if you try to assign to a computed ref:** `subtotal.value = 100`. Vue throws: `[Vue warn]: Write operation failed: computed value is readonly.` Derived facts cannot be overwritten — they can only be recalculated from their sources. If you need to write to it, the value is not derived — it is an independent source, and should be a ref.

---

## `computed` vs plain template expression

```html
<!-- Option A: plain expression — evaluates on every render -->
<p>Total: ${{ (price * quantity).toFixed(2) }}</p>

<!-- Option B: computed ref — cached, evaluates only when deps change -->
<p>Total: ${{ total.toFixed(2) }}</p>
```

For a multiplication this is invisible. For a computation that sorts or filters a 10,000-item list, Option A re-runs on every render triggered by *any* state change — even a button click that has nothing to do with the list. Option B runs only when the list or the sort order changes. Use `computed` for any derivation that is non-trivial or that you use in multiple places.

---

## The computed setter (advanced)

`computed()` accepts an object with `get` and `set` functions instead of a single getter:

```typescript
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (value: string) => {
    const [first, last] = value.split(' ')
    firstName.value = first
    lastName.value = last ?? ''
  }
})
```

Now `fullName.value = 'Alice Smith'` splits and updates both source refs. This is useful when a parent needs to write through a computed that the child exposes via `v-model`. Use it sparingly — most computed values should be read-only derivations.

---

## Connects forward

Lesson 04's `v-if` and `v-for` use computed values extensively — `filtered` is a computed array derived from the todos and the active filter. Lesson 09 (`watch()`) complements computed: `computed` derives a value; `watch` runs side effects when a value changes.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Incrementing to 3 items shows the discount badge; total and discount row reflect the 10% reduction
- [ ] Decrementing back below 3 removes the discount and restores full price
- [ ] You can explain why `total` as a `ref` freezes at the initial value
- [ ] You can explain what `computed()` caches and when it re-runs its getter
- [ ] You can explain why a computed getter must be a pure function
- [ ] You can explain the topological order Vue uses to re-evaluate chained computeds
- [ ] Add `const taxAmount = computed(() => total.value * 0.08)` and display the tax as a separate line
