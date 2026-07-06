# Computed Values

## What you will build

A shopping cart summary where total price and discount status update automatically whenever quantity changes — no manual synchronisation.

```
Unit price: $29.99
Quantity:   [−] 3 [+]
            ✅ 10% bulk discount applied
Total:      $80.97
```

Change quantity → total updates. You never write the update code yourself. That is what `computed()` does.

---

## Connects backward

Lesson 02 showed functions that imperatively update one ref at a time. This lesson shows the declarative alternative: describe what a value *is* in terms of other values, and Vue keeps it in sync automatically.

---

## The lesson

### Step 1 — Source state and computed derivations

**The problem:** Price and quantity are independent facts the user controls. Subtotal, discount eligibility, and total are not independent — they follow from price and quantity. Storing them in plain refs means you must update them manually everywhere price or quantity changes. Miss one spot and you have a bug.

**File:** `src/App.vue` — replace the entire `<script setup>` section with:

```typescript
import { ref, computed } from 'vue'

const price = ref(29.99)
const quantity = ref(1)

const subtotal = computed(() => price.value * quantity.value)
const hasDiscount = computed(() => quantity.value >= 3)
const total = computed(() =>
  hasDiscount.value ? subtotal.value * 0.9 : subtotal.value
)

function increase() { quantity.value++ }
function decrease() { if (quantity.value > 1) quantity.value-- }
```

**Walkthrough:**
- `import { ref, computed } from 'vue'` — `computed` is a new import alongside `ref`
- `const price = ref(29.99)` and `const quantity = ref(1)` — source state; these are the values the user controls
- `const subtotal = computed(() => price.value * quantity.value)` — a reactive derived value; the function runs once now and again whenever `price` or `quantity` changes
- `const hasDiscount = computed(() => quantity.value >= 3)` — `boolean` derived from `quantity`; evaluates to `true` when 3 or more items
- `const total = computed(() => hasDiscount.value ? subtotal.value * 0.9 : subtotal.value)` — depends on two other computed values; Vue tracks the whole chain
- `increase()` / `decrease()` — mutate the source state only; all derived values update automatically

**What is `computed()`?** It takes a getter function and returns a reactive object whose `.value` is the getter's result. Vue tracks every reactive value read *inside* the getter. When any of them change, Vue re-runs the getter and updates `computed.value`. The return value is read-only — you never assign to it.

**CS concept — memoization:** `computed()` caches its result. If `price` and `quantity` have not changed since the last read, Vue returns the cached result without re-running the function. This matters when computation is expensive. A plain function called in the template runs on *every render*. `computed()` runs only when its dependencies change.

**SE principle — single source of truth:** `price` and `quantity` are the sources of truth. `subtotal`, `hasDiscount`, and `total` are derived truths. If you stored `total` in a `ref` and updated it manually, you would have two sources of truth that can drift apart. `computed()` eliminates that class of bug.

**What breaks if you replace `computed` with `ref`:** Change `const subtotal = computed(...)` to `const subtotal = ref(price.value * quantity.value)`. Now `subtotal` is a snapshot of the initial values — it never updates again. Click `+` to change quantity: the quantity display updates but the subtotal stays frozen at the initial price. Every function that changes `price` or `quantity` would need to manually recalculate `subtotal`, `hasDiscount`, and `total`. This is the maintenance nightmare `computed()` prevents.

---

### Step 2 — Template

**The problem:** We need to display all five values and wire the `+` / `−` buttons.

**File:** `src/App.vue` — replace the entire `<template>` and `<style>` sections with:

```html
<template>
  <div class="cart">
    <h2>Shopping Cart</h2>

    <div class="row">
      <span>Unit price</span>
      <span>${{ price.toFixed(2) }}</span>
    </div>

    <div class="row">
      <span>Quantity</span>
      <div class="stepper">
        <button @click="decrease">−</button>
        <span>{{ quantity }}</span>
        <button @click="increase">+</button>
      </div>
    </div>

    <div v-if="hasDiscount" class="badge">
      10% bulk discount applied (3+)
    </div>

    <div class="total">
      Total: ${{ total.toFixed(2) }}
    </div>
  </div>
</template>

<style scoped>
.cart {
  font-family: system-ui, sans-serif;
  max-width: 340px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}
.row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.stepper { display: flex; align-items: center; gap: 12px; }
.stepper button { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #cbd5e1; background: none; cursor: pointer; font-size: 16px; }
.badge { margin-top: 12px; padding: 6px 12px; background: #dcfce7; color: #166534; border-radius: 6px; font-size: 13px; }
.total { margin-top: 16px; font-size: 18px; font-weight: 700; color: #41b883; text-align: right; }
</style>
```

**Walkthrough:**
- `{{ price.toFixed(2) }}` — `price` is a `Ref<number>`; Vue auto-unwraps it in the template, so `.toFixed(2)` is called on the number directly
- `v-if="hasDiscount"` — the badge only renders when the computed boolean is `true`; this is preview for Lesson 04
- `{{ total.toFixed(2) }}` — reads the computed value; Vue auto-unwraps it just like a ref

**What is `v-if`?** A Vue directive that conditionally renders an element. When the expression is `false`, the element is removed from the DOM entirely — not hidden with CSS. Full coverage in Lesson 04.

**CS concept — declarative vs imperative:** The template *declares* what to show based on current state. Nowhere do you write "update the total div's text content." You describe the desired output; Vue figures out the minimal DOM updates needed.

**SE principle — open for extension, closed for modification:** Adding a new derived value (say, `tax = computed(() => total.value * 0.08)`) requires no changes to existing code — not to `increase()`, not to `decrease()`, not to the template's existing bindings. Each derived fact is independently declared.

---

## When to use `computed` vs `ref`

| Situation | Tool |
|-----------|------|
| User controls the value directly | `ref` |
| Value derives from other reactive state | `computed` |
| You set it with `.value =` | `ref` |
| You only read it | `computed` |

If you catch yourself writing `totalRef.value = priceRef.value * qty.value` in every handler — you want `computed`.

---

## Connects forward

Lesson 04 uses `computed()` to build a filtered list. `v-if="hasDiscount"` previewed here is explained fully there. The concept of reactive derivation chains (computed depending on computed) appears in the spreadsheet series.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Total updates automatically when you click `+` or `−`
- [ ] The discount badge appears at 3 items and disappears below 3
- [ ] You can explain why `computed()` is cached and why that matters over a plain function
- [ ] Add `const formattedTotal = computed(() => '$' + total.value.toFixed(2))` and display it instead
