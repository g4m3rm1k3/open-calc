---
series: clean-code
level: 5
title: Clean Code — Putting It Together
lang: javascript
---

# Clean Code — Putting It Together

The four skills you have practised — naming, function design, comments, and structure — are not independent techniques. They reinforce each other. Good names make functions obvious, which makes comments unnecessary. Good structure makes nesting shallow, which makes logic readable. Good functions do one thing, which makes them testable. Together, they form a practice of writing code as communication.

This capstone lesson integrates all four into a realistic refactoring exercise: a working but messy function that you will improve without changing its behaviour.

## The before: a realistic messy function

```javascript
// This function is messy. It works, but it is hard to read and hard to change.
// It processes a list of product records for reporting.

function proc(prods, d, fl) {
  let res = []
  for (let i = 0; i < prods.length; i++) {
    let p = prods[i]
    if (p.cat !== null && p.cat !== undefined) {
      if (p.pr > 0) {
        if (p.st === 'active' || p.st === 'featured') {
          if (fl === true) {
            if (p.pr >= 100) {
              let discPr = p.pr * 0.85
              res.push({ id: p.id, nm: p.nm, pr: discPr, cat: p.cat, disc: true })
            } else {
              res.push({ id: p.id, nm: p.nm, pr: p.pr, cat: p.cat, disc: false })
            }
          } else {
            res.push({ id: p.id, nm: p.nm, pr: p.pr, cat: p.cat, disc: false })
          }
        }
      }
    }
  }
  // sort by price
  res.sort((a, b) => a.pr - b.pr)
  // remove dupes based on id
  let seen = {}
  let uniq = []
  for (let j = 0; j < res.length; j++) {
    if (!seen[res[j].id]) {
      seen[res[j].id] = true
      uniq.push(res[j])
    }
  }
  return uniq
}
```

## The analysis: identifying the problems

```text
NAMING PROBLEMS:
  proc         → name tells us nothing; should be: buildProductReport or getReportableProducts
  prods        → abbreviated; should be: products
  d            → never used! dead parameter
  fl           → boolean flag with no name; should be: applyLoyaltyDiscount
  res, uniq    → generic accumulator names; should be: eligibleProducts, uniqueProducts
  p            → single-letter loop variable; should be: product
  i, j         → loop counters; fine for indexes, but outer contexts should clarify
  discPr       → abbreviated; should be: discountedPrice
  nm, pr, st, cat → abbreviated field names; should be real names in the object literal

FUNCTION PROBLEMS:
  → Doing too many things: filter, transform, sort, deduplicate
  → Deep nesting (4 levels): hard to follow the logic
  → Boolean flag parameter (fl): should be two functions or a strategy
  → Magic number (0.85, 100): should be named constants

STRUCTURE PROBLEMS:
  → No guard clauses — all logic is nested inside conditions
  → Inline comments ("// sort by price") signal that sections should be functions
  → Dead parameter (d) not used — misleads the reader
```

## The after: the refactored version

```javascript
const LOYALTY_DISCOUNT_RATE = 0.15       // 15% off
const LOYALTY_DISCOUNT_THRESHOLD = 100  // minimum price to qualify

const ACTIVE_STATUSES = new Set(['active', 'featured'])

function isEligibleForReport(product) {
  return product.category != null
    && product.price > 0
    && ACTIVE_STATUSES.has(product.status)
}

function applyLoyaltyDiscount(product) {
  if (product.price < LOYALTY_DISCOUNT_THRESHOLD) {
    return { ...product, discounted: false }
  }
  return {
    ...product,
    price: product.price * (1 - LOYALTY_DISCOUNT_RATE),
    discounted: true,
  }
}

function toReportRecord(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    discounted: product.discounted ?? false,
  }
}

function deduplicateById(products) {
  const seen = new Set()
  return products.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

function buildProductReport(products, { applyLoyaltyDiscount: withDiscount = false } = {}) {
  const eligible = products.filter(isEligibleForReport)
  const withPricing = withDiscount
    ? eligible.map(applyLoyaltyDiscount)
    : eligible
  const records = withPricing.map(toReportRecord)
  const sorted = [...records].sort((a, b) => a.price - b.price)
  return deduplicateById(sorted)
}
```

```text
WHAT CHANGED:

  proc → buildProductReport            Clear name describing what the module produces
  fl   → options object {applyLoyaltyDiscount: true}
         Boolean flag became a named option — callers know what they are turning on
  d    → REMOVED                       Dead code deleted
  
  Deep nesting → guard clause in isEligibleForReport + pipeline in buildProductReport
  
  Magic numbers → LOYALTY_DISCOUNT_RATE, LOYALTY_DISCOUNT_THRESHOLD
  
  Inline sections → each became a well-named helper:
    filter → isEligibleForReport()      "does this product belong in the report?"
    transform → applyLoyaltyDiscount()  "apply the discount pricing rule"
    shape → toReportRecord()            "produce the output shape"
    sort → .sort() inline (simple enough)
    dedup → deduplicateById()           "eliminate duplicates"
```

**CS lens:** The refactored version is a **data pipeline**: products flow through a series of pure transformations (filter → map → map → sort → filter). Each transformation takes an array and returns an array. This pipeline structure is verifiable at each step — you can test `isEligibleForReport`, `applyLoyaltyDiscount`, `toReportRecord`, and `deduplicateById` independently. The original code's nested conditionals made it impossible to test any of these steps without executing all of them. Decomposition into pure functions enables composition AND testability simultaneously.

## The principle behind all four skills

```text
ALL FOUR CLEAN CODE SKILLS SERVE ONE GOAL:
  Minimise the distance between the code and the reader's understanding.

  Names:     compress domain meaning into identifiers
  Functions: encapsulate one responsibility, hidden behind a name
  Comments:  surface WHY (the only information the code cannot carry)
  Structure: organise code so the reader's eye follows the logic flow

  When all four are applied well:
    A new reader can understand the system in hours, not days.
    A bug fix takes minutes, not hours — the cause is localised.
    A feature addition is additive — it slots into the existing structure.
    A code review takes 15 minutes, not an hour — the code explains itself.

  Clean code is not about perfection.
  It is about respecting the time of every future reader, including yourself.
```

## Challenge: refactor_report

Implement the refactored product report function correctly.

```challenge
function buildProductReport(products, options = {}) {
  // products: array of { id, name, price, category, status }
  //   status: 'active' | 'featured' | 'inactive' | 'draft'
  //   category: string or null
  //
  // options.applyLoyaltyDiscount: boolean (default false)
  //   If true: products with price >= 100 get 15% discount; discounted: true
  //   If false: all products have discounted: false
  //
  // Returns: array of { id, name, price, category, discounted }
  //   Only products with category != null, price > 0, and status in ['active', 'featured']
  //   Sorted by price ascending
  //   Deduplicated by id (first occurrence wins)
  //   Price rounded to 2 decimal places
}
```

```test
const products = [
  { id: 1, name: 'Widget',  price: 50,  category: 'Tools',   status: 'active'   },
  { id: 2, name: 'Gadget',  price: 150, category: 'Tech',    status: 'featured' },
  { id: 3, name: 'Doohick', price: 0,   category: 'Tools',   status: 'active'   },   // price 0 excluded
  { id: 4, name: 'Thingam', price: 80,  category: null,      status: 'active'   },   // null cat excluded
  { id: 5, name: 'Whatsit', price: 200, category: 'Tech',    status: 'inactive' },   // wrong status
  { id: 1, name: 'Widget',  price: 50,  category: 'Tools',   status: 'active'   },   // duplicate
]

const report = buildProductReport(products)
assert report.length === 2
assert report[0].id === 1   // sorted by price: 50 first
assert report[1].id === 2
assert report.every(p => p.discounted === false)

const discounted = buildProductReport(products, { applyLoyaltyDiscount: true })
assert discounted.length === 2
assert discounted[0].discounted === false   // price 50 < threshold 100
assert discounted[1].discounted === true    // price 150 >= threshold 100
assert Math.abs(discounted[1].price - 127.50) < 0.01   // 150 * 0.85
```
