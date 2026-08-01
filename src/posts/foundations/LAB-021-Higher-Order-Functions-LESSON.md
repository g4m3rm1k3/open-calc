# FOUNDATIONS — LAB-021 — Higher-Order Functions: map, filter, reduce

**Series:** FOUNDATIONS — Part IV: Functional Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 60–75 minutes.

---

## What You Will Build

A complete data reporting pipeline — starting with raw sales records and producing a formatted summary — written entirely with `map`, `filter`, and `reduce`. You will replace every explicit `for` loop in the pipeline with a declarative higher-order function call, verify the output matches, and demonstrate that the declarative version is shorter, more readable, and easier to test piece by piece. After this lab, you will reach for `map`/`filter`/`reduce` as the first tool for any collection transformation.

---

## What You Need to Know First

**From LAB-019 (Pure Functions):** `map`, `filter`, and `reduce` accept pure function callbacks. The power of these higher-order functions comes from the guarantee that the callback does not mutate the source array.

**From LAB-020 (Immutability):** `map` and `filter` return new arrays without modifying the original. `reduce` returns a new value. None of them mutate in place — this is what makes them safe to chain.

**From LAB-006 (First-Class Functions):** You pass a function as an argument. `map(fn)` passes `fn` as a callback. Arrow functions are the most common syntax for these callbacks.

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the return type of `array.map(fn)`? What is the return type of `array.filter(fn)` and `array.reduce(fn, initial)`?
> 2. You want to sum all numbers in an array. Which of the three — map, filter, reduce — is the right tool?
> 3. Can `map` and `filter` be expressed in terms of `reduce`? (Hint: think about what `reduce` does to an empty initial accumulator.)
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — `map`: Transform Every Element

**The problem this step solves:** Replace any loop that builds a new array by transforming each element with `map`.

**The code:**

```js
const prices = [9.99, 24.99, 1.99, 14.99, 49.99];

// Imperative (loop):
const imperativeDoubled = [];
for (const price of prices) {
  imperativeDoubled.push(price * 2);
}

// Declarative (map):
const declarativeDoubled = prices.map(price => price * 2);

console.log(imperativeDoubled);   // → [19.98, 49.98, 3.98, 29.98, 99.98]
console.log(declarativeDoubled);  // → same
console.log(prices);              // → unchanged — map does not mutate
```

**The walkthrough — what `prices.map(price => price * 2)` does:**

1. `map` creates a new empty array.
2. For each element of `prices` (in order), it calls the callback `price => price * 2` with the element as the argument.
3. The return value of each callback call is added to the new array.
4. Returns the new array. `prices` is unchanged.

The callback receives up to three arguments: `(element, index, array)`. Most callbacks only use the first. `prices.map((price, index) => `${index}: $${price}`)` would produce `["0: $9.99", "1: $24.99", ...]`.

**`map` signature:** `Array.prototype.map(callback: (element, index, array) => newElement): Array`

**CS lens — `map` as a functor operation:**

`map` applies a function to every element of a container and returns a container of the same shape. This concept — applying a function to a wrapped value — is called a **functor** in functional programming. Arrays are functors. So are Promises (`promise.then(fn)` is `map` for Promises). So are Optional values in other languages. `map` is the universal "transform the content, preserve the shape" operation.

**SE lens — declarative over imperative:**

The `for` loop describes **how** to transform: create empty array, iterate, push each transformed element. `map` describes **what** the transformation is: produce an array of doubled prices. The reader does not have to mentally simulate the loop. They read: "doubledPrices = prices mapped to price × 2" — the intent is directly visible. This is the declarative advantage: code that reads like its intent.

**What breaks if the callback mutates:**

```js
const items = [{name: "A", qty: 1}, {name: "B", qty: 2}];
const mutatingMap = items.map(item => {
  item.qty *= 2;  // MUTATES the original item
  return item;
});
console.log(items[0].qty);  // → 2  (original was mutated!)
```

The mutation-inside-`map` antipattern violates the contract that `map` does not modify the source. Use `{ ...item, qty: item.qty * 2 }` to produce a new object.

---

### SAVE AND TRY

```js
const orders = [
  { id: 1, amount: 100, customerId: "c1" },
  { id: 2, amount: 250, customerId: "c2" },
  { id: 3, amount: 75,  customerId: "c1" },
];

// Add a 10% tax field to each order:
const withTax = orders.map(order => ({
  ...order,
  tax: order.amount * 0.1,
  total: order.amount * 1.1,
}));

console.log(withTax[0].total);   // → 110
console.log(withTax[1].total);   // → 275
console.log(orders[0].tax);      // → undefined  (original unchanged)
```

Expected: `110`, `275`, `undefined`.

**Change something:** Map to extract just the `total` values: `withTax.map(order => order.total)`. Expected: `[110, 275, 82.5]`. Then map to format: `.map(t => `$${t.toFixed(2)}`)`. Expected: `["$110.00", "$275.00", "$82.50"]`. Chaining maps produces a data transformation pipeline.

---

### Step 2 — `filter`: Select Elements Matching a Predicate

**The problem this step solves:** Replace any loop that builds a new array by conditionally including elements with `filter`.

**The code:**

```js
const products = [
  { name: "Widget",  price: 9.99,  inStock: true,  category: "tools" },
  { name: "Gadget",  price: 24.99, inStock: false, category: "electronics" },
  { name: "Donut",   price: 1.99,  inStock: true,  category: "food" },
  { name: "Gizmo",   price: 14.99, inStock: true,  category: "electronics" },
  { name: "Doodad",  price: 49.99, inStock: false, category: "tools" },
];

// Imperative:
const imperativeInStock = [];
for (const product of products) {
  if (product.inStock) {
    imperativeInStock.push(product);
  }
}

// Declarative:
const declarativeInStock = products.filter(product => product.inStock);

console.log(declarativeInStock.map(p => p.name));
// → ["Widget", "Donut", "Gizmo"]
```

**The walkthrough — `products.filter(product => product.inStock)`:**

1. `filter` creates a new empty array.
2. For each element, it calls the callback (called a **predicate** — a function that returns a boolean).
3. If the callback returns `true`, the element is included in the new array. If `false`, it is excluded.
4. Returns the new array. `products` is unchanged.

**Predicate:** A function that returns `true` or `false`. The name comes from logic: a predicate is a statement that is true or false of a subject. `product => product.inStock` is the predicate "product is in stock."

**`filter` signature:** `Array.prototype.filter(predicate: (element, index, array) => boolean): Array`

**CS lens — filter as set comprehension:**

`filter` is the computational equivalent of set comprehension in mathematics: "the set of all `x` in `S` where `P(x)` is true." `{ x ∈ products | x.inStock }` maps directly to `products.filter(x => x.inStock)`. The mathematical notation and the code have the same structure.

**SE lens — composable predicates:**

Predicates can be composed with `&&` and `||`:

```js
const affordableInStock = products.filter(
  product => product.inStock && product.price < 20
);
```

Or with helper functions that build predicates:

```js
const inStock  = product => product.inStock;
const cheap    = product => product.price < 20;
const toolType = product => product.category === "tools";

const affordableInStockTools = products.filter(
  product => inStock(product) && cheap(product) && toolType(product)
);
```

Each predicate function is independently testable. Complex filter conditions are assembled from simple parts.

**What breaks if the predicate has side effects:**

`filter` calls the predicate once per element in order. A predicate that increments a counter or writes to a log will do so for every element in the array, not just matching ones. The number of side effects depends on array length — unpredictable. Keep filter predicates pure.

---

### SAVE AND TRY

```js
const sales = [
  { region: "north", amount: 1200, month: "jan" },
  { region: "south", amount: 800,  month: "jan" },
  { region: "north", amount: 1500, month: "feb" },
  { region: "east",  amount: 2200, month: "jan" },
  { region: "south", amount: 950,  month: "feb" },
];

const northSales  = sales.filter(sale => sale.region === "north");
const highSales   = sales.filter(sale => sale.amount > 1000);
const janHighSales = sales.filter(sale => sale.month === "jan" && sale.amount > 1000);

console.log("North sales:", northSales.length);      // → 2
console.log("High sales:", highSales.length);         // → 3
console.log("Jan high sales:", janHighSales.length);  // → 2
```

Expected: `2`, `3`, `2`.

**Change something:** Add a `sales.filter(sale => sale.amount > 5000)`. Expected: `[]` — empty array (no sales over 5000). `filter` on an empty array returns `[]`; `filter` that matches nothing returns `[]`. Verify: `.length === 0` and `JSON.stringify([]) === "[]"`.

---

### Step 3 — `reduce`: Fold a Collection to a Single Value

**The problem this step solves:** Replace any loop that accumulates a single value from a collection with `reduce`.

**The code:**

```js
const amounts = [100, 250, 75, 320, 190];

// Imperative:
let imperativeSum = 0;
for (const amount of amounts) {
  imperativeSum += amount;
}

// Declarative:
const declarativeSum = amounts.reduce(
  (accumulator, currentAmount) => accumulator + currentAmount,
  0   // initial value of accumulator
);

console.log(imperativeSum);    // → 935
console.log(declarativeSum);   // → 935
```

**The walkthrough — what happens step by step:**

`amounts.reduce((acc, val) => acc + val, 0)`:

| Step | `acc` (before) | `val` | `acc` (after) |
|------|----------------|-------|---------------|
| 1    | 0 (initial)    | 100   | 100           |
| 2    | 100            | 250   | 350           |
| 3    | 350            | 75    | 425           |
| 4    | 425            | 320   | 745           |
| 5    | 745            | 190   | 935           |

The callback is called once per element. The return value becomes the new accumulator. The final return value of the last callback call is the result of `reduce`.

**`reduce` signature:** `Array.prototype.reduce(callback: (accumulator, element, index, array) => newAccumulator, initialValue): any`

**Why the initial value matters:**

Without an initial value, `reduce` uses the first element as the initial accumulator and starts iterating from the second. For an empty array, this throws `TypeError: Reduce of empty array with no initial value`. Always provide an initial value — it makes the behavior explicit and handles empty arrays correctly.

**CS lens — reduce as fold:**

`reduce` (also called `fold` in functional languages) is the most general higher-order function on collections. `map` and `filter` can be implemented using `reduce`. Any accumulation — sum, product, building an object, building an array, counting, grouping — can be expressed with `reduce`. It is the universal collection operation.

**SE lens — the initial value defines the result type:**

The initial value tells `reduce` what type the result will be. `reduce(..., 0)` accumulates a number. `reduce(..., [])` accumulates an array. `reduce(..., {})` accumulates an object. The initial value is a "neutral element" — adding it to the accumulation changes nothing.

**What breaks without an initial value:**

```js
[].reduce((a, b) => a + b);     // → TypeError: Reduce of empty array with no initial value
[5].reduce((a, b) => a + b);    // → 5  (no callback, just returns the single element)
```

Relying on no-initial-value behavior makes the code fragile: it works with single-element arrays but fails with empty ones. Always provide the initial value.

---

### SAVE AND TRY

```js
const orders = [
  { id: 1, amount: 100, category: "tools" },
  { id: 2, amount: 250, category: "electronics" },
  { id: 3, amount: 75,  category: "tools" },
  { id: 4, amount: 320, category: "food" },
  { id: 5, amount: 190, category: "electronics" },
];

// Sum all amounts:
const total = orders.reduce((sum, order) => sum + order.amount, 0);

// Find max amount:
const maxAmount = orders.reduce(
  (max, order) => order.amount > max ? order.amount : max,
  0
);

// Group by category (accumulator is an object):
const byCategory = orders.reduce((groups, order) => {
  const category = order.category;
  if (!groups[category]) groups[category] = [];
  groups[category].push(order);
  return groups;
}, {});

console.log("Total:", total);          // → 935
console.log("Max:", maxAmount);        // → 320
console.log("Categories:", Object.keys(byCategory));  // → ["tools", "electronics", "food"]
console.log("Tools:", byCategory.tools.length);       // → 2
```

Expected: `935`, `320`, 3 categories, `2` tools.

**Change something:** Use `reduce` to count orders per category: `reduce(..., {})` where the accumulator maps category name to count. Expected: `{ tools: 2, electronics: 2, food: 1 }`.

---

### Step 4 — Chaining to Build a Pipeline

**The problem this step solves:** Combine `map`, `filter`, and `reduce` into a readable, composable pipeline.

**The code — a complete sales report:**

```js
const salesRecords = [
  { rep: "Alice",   product: "Widget",  qty: 5,  unitPrice: 9.99,  region: "north" },
  { rep: "Bob",     product: "Gadget",  qty: 2,  unitPrice: 24.99, region: "south" },
  { rep: "Alice",   product: "Donut",   qty: 20, unitPrice: 1.99,  region: "north" },
  { rep: "Carol",   product: "Gizmo",   qty: 3,  unitPrice: 14.99, region: "east"  },
  { rep: "Bob",     product: "Widget",  qty: 8,  unitPrice: 9.99,  region: "south" },
  { rep: "Alice",   product: "Gizmo",   qty: 1,  unitPrice: 14.99, region: "north" },
  { rep: "Carol",   product: "Gadget",  qty: 4,  unitPrice: 24.99, region: "east"  },
];

// Pipeline: calculate line total, filter to north region, sum, format
const northTotal = salesRecords
  .map(record => ({ ...record, lineTotal: record.qty * record.unitPrice }))
  .filter(record => record.region === "north")
  .reduce((sum, record) => sum + record.lineTotal, 0);

console.log(`North region total: $${northTotal.toFixed(2)}`);

// Pipeline: find top rep by total sales
const repTotals = salesRecords
  .map(record => ({ ...record, lineTotal: record.qty * record.unitPrice }))
  .reduce((totals, record) => {
    totals[record.rep] = (totals[record.rep] ?? 0) + record.lineTotal;
    return totals;
  }, {});

const topRep = Object.entries(repTotals)
  .reduce((best, [rep, total]) => total > best.total ? { rep, total } : best,
    { rep: null, total: 0 });

console.log(`Top rep: ${topRep.rep} with $${topRep.total.toFixed(2)}`);
```

`Object.entries(obj)` — returns an array of `[key, value]` pairs for all enumerable own properties of `obj`. `Object.entries({ a: 1, b: 2 })` returns `[["a", 1], ["b", 2]]`. Used here to iterate over the `repTotals` object to find the maximum.

`(totals[record.rep] ?? 0)` — **nullish coalescing**: if `totals[record.rep]` is `undefined` (first time we see this rep), use `0`. Otherwise use the current total.

**The walkthrough — the north total pipeline:**

1. `.map(...)` — adds `lineTotal` to each record (new objects, no mutation).
2. `.filter(...)` — keeps only north region records.
3. `.reduce(...)` — sums `lineTotal` across the remaining records.

The pipeline reads as: "take all sales, compute each line total, keep only north, sum those totals." The code reads like the description. No intermediate variables needed for debugging — each step is a named transformation.

**CS lens — pipelines as compositions:**

`.map(f).filter(g).reduce(h)` is `reduce(h, filter(g, map(f, array)))` — function composition applied to arrays. In functional programming languages, this is written as `array |> map(f) |> filter(g) |> reduce(h)`. JavaScript's method chaining on arrays is the practical form of this composition. Each step is an independent, testable function; the chain composes them.

**SE lens — readability through declarative chains:**

The imperative equivalent requires nested `for` loops, intermediate `if` statements, and mutable accumulators. Every time a new requirement appears ("also exclude records below minimum sale value"), the declarative version adds one `.filter(...)` step. The imperative version adds another `if` condition inside the loop — intertwined with the accumulation logic. Chains keep concerns separated: each method call has exactly one job.

**What breaks with side effects in a chain:**

If any step's callback has a side effect (logging, incrementing a counter, writing to external state), the side effect runs once per element at that step — the number of times it runs depends on how many elements have passed through previous steps. A log inside `.map()` runs for every element; a log inside `.filter()` runs only for elements that passed the map. This unpredictability is why pipeline callbacks must be pure.

---

### SAVE AND TRY

```js
// Build a report: average sale amount per rep, sorted descending
const repAverages = salesRecords
  .map(r => ({ ...r, lineTotal: r.qty * r.unitPrice }))
  .reduce((acc, r) => {
    if (!acc[r.rep]) acc[r.rep] = { total: 0, count: 0 };
    acc[r.rep].total += r.lineTotal;
    acc[r.rep].count += 1;
    return acc;
  }, {});

const report = Object.entries(repAverages)
  .map(([rep, data]) => ({ rep, average: data.total / data.count }))
  .sort((a, b) => b.average - a.average);

report.forEach(row => console.log(`${row.rep}: $${row.average.toFixed(2)}`));
```

Expected: three lines, one per rep, sorted by average sale amount descending.

**Change something:** Filter to only reps with more than 2 total sales: `.filter(([rep, data]) => data.count > 2)` before the final `.map`. Expected: removes Bob (only 2 records) from the report.

---

## Connect the Pieces

**What you built:** A complete sales report pipeline using `map`, `filter`, and `reduce` exclusively — no explicit loops.

**How it connects to LAB-019 (Pure Functions):** Every pipeline step uses a pure callback. The immutability guarantee from LAB-020 ensures none of the steps modify their input arrays. Purity + immutability = safe chaining.

**How it connects to LAB-006 (First-Class Functions):** `map(callback)`, `filter(predicate)`, `reduce(accumulator)` are higher-order functions that accept functions as arguments. You built a simpler version of `transform` (reimplementing `map`) in LAB-006. Now you use the built-in version for real work.

**How it connects forward:**

- **LAB-022 (Function Composition):** `compose` and `pipe` generalize method chaining to arbitrary function sequences. The pipeline you built with chained array methods is a specialized form of function composition.
- **LAB-023 (Currying):** Curried functions compose perfectly with `map` and `filter`: `products.map(getProperty("price"))` where `getProperty = key => obj => obj[key]` — a curried function partially applied to produce a callback.
- **LAB-042 (Python List Comprehensions):** Python's `[expr for x in arr if cond]` is the Python equivalent of `arr.filter(cond).map(expr)`. The concept transfers; the syntax differs.

**The real-world connection:**

Every data grid, every API response transformation, every analytics query is a chain of map/filter/reduce operations. SQL's `SELECT` is `map`; `WHERE` is `filter`; `GROUP BY` + aggregate functions are `reduce`. React's rendering of a list (`items.filter(active).map(item => <Item key={item.id} {...item} />)`) is `filter` then `map`. Lodash's `_.chain()` and RxJS Observables are just extended versions of this pipeline model. Wherever you transform a collection, these three operations appear.

---

## What Breaks Without This

**Concrete failure — imperative loop resists incremental change:**

```js
// Imperative: adding a new requirement touches the existing loop
function generateReport(sales) {
  let total = 0;
  const result = [];
  for (const sale of sales) {
    if (sale.amount > 100) {       // filter
      const withTax = { ...sale, total: sale.amount * 1.1 };  // map
      total += withTax.total;      // reduce
      result.push(withTax);
    }
  }
  // New requirement: also skip sales from 'test' region
  // Must edit the for loop — risk of breaking the existing filter
  return { items: result, total };
}
```

Compare to:

```js
function generateReport(sales) {
  const filtered = sales
    .filter(sale => sale.amount > 100)
    .filter(sale => sale.region !== "test");  // new requirement: add one line

  const withTax = filtered.map(sale => ({ ...sale, total: sale.amount * 1.1 }));
  const total   = withTax.reduce((sum, sale) => sum + sale.total, 0);
  return { items: withTax, total };
}
```

New requirement = one new line. No risk of breaking the existing filter. The declarative version isolates concerns; the imperative version tangles them.

---

## Definition of Done

Verify each item before moving to LAB-022.

- [ ] `prices.map(price => price * 2)` returns a new array; `prices` is unchanged
- [ ] `products.filter(p => p.inStock)` returns only in-stock products
- [ ] `amounts.reduce((sum, n) => sum + n, 0)` returns the correct sum
- [ ] `reduce` with `{}` as initial value groups records by category
- [ ] The north-region sales pipeline returns the correct total
- [ ] The top-rep pipeline correctly identifies the rep with the highest total sales
- [ ] You can implement `map` using `reduce`: `arr.reduce((acc, x) => [...acc, fn(x)], [])`

**Git commit:**

```
git add .
git commit -m "LAB-021: sales report pipeline using map/filter/reduce — declarative transformations replace explicit loops"
```

---

## Quick Check Answers

**1. Return types of `map`, `filter`, and `reduce`:**

`map` returns an `Array` of the same length as the input, with each element transformed by the callback. `filter` returns an `Array` of 0 to `n` elements (the elements that pass the predicate) — a subset of the original. `reduce` returns a single value of any type — determined by what the callback returns and what the initial value's type is.

**2. Which is the right tool for summing all numbers?**

`reduce`. `map` transforms each element but still returns an array — summing requires collapsing an array to a single number. `filter` removes elements but still returns an array. `reduce` is the tool for folding a collection into a single value of any type.

**3. Can `map` and `filter` be expressed with `reduce`?**

Yes. `map`: `arr.reduce((acc, x) => [...acc, fn(x)], [])` — accumulate a new array, pushing each transformed element. `filter`: `arr.reduce((acc, x) => predicate(x) ? [...acc, x] : acc, [])` — accumulate a new array, including only elements where the predicate is true. This demonstrates that `reduce` is the most general operation — it subsumes both. In practice, use `map` and `filter` when appropriate; they communicate intent more clearly than `reduce` for their respective use cases.

---

*Next: LAB-022 — Function Composition*
