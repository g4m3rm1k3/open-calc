---
series: clean-code
level: 3
title: Comments — When and What to Write
lang: javascript
---

# Comments — When and What to Write

Beginners are often taught to comment their code to explain what it does. Professionals eventually learn that this advice, applied universally, produces cluttered, misleading, maintenance-heavy code. The insight: if you need a comment to explain WHAT code does, the code itself should be clearer. Comments explain WHY — the reason that is not visible from reading the code.

This is not "write no comments." It is "write comments that carry information that the code cannot." By the end of this lesson you will have a clear mental model for when comments add value and when they are noise, and you will be able to write comments that inform rather than clutter.

## The problem with most comments

```javascript
// BAD: repeats what the code says (noise)
// Increment i by 1
i++

// BAD: explains WHAT, not WHY — the name should do this
// Calculate total price
function calculateTotalPrice(items) { ... }

// BAD: outdated — the code was updated, the comment was not
// Returns user's first name
function getUserName(user) {
  return `${user.firstName} ${user.lastName}`   // now returns full name, comment is wrong
}

// BAD: commented-out code
// function oldApproach(data) {
//   return data.map(x => x.value)
// }
// ^ This is what git history is for. Delete it.
```

```text
COMMENTS THAT ADD NO VALUE:
  → Restate what the code says (the "translation" comment)
  → Describe what a well-named function does
  → Mark sections with headers that should be separate functions
  → Explain code that should be renamed instead
  → Document code that does not exist yet
  → Leave author names and dates (git blame does this)
```

## Comments that add real value

```javascript
// GOOD: explains WHY a non-obvious choice was made
// Use setTimeout(fn, 0) to ensure the DOM has updated before measuring.
// Reading offsetHeight before yielding the microtask queue returns stale values.
setTimeout(() => { height = el.offsetHeight }, 0)

// GOOD: explains a workaround for an external bug
// Safari < 14 does not support the 'resize' observer on inline elements.
// Fall back to polling for affected browsers.
if (!ResizeObserver || isSafariBefore14()) {
  startPolling()
}

// GOOD: explains a non-obvious invariant
// Callers must hold the write lock before calling this function.
// Calling without the lock causes a race condition on the shared queue.
function enqueue(item) { ... }

// GOOD: explains a performance choice
// Sorted insert maintains O(n) insert but enables O(log n) binary search.
// Profiling showed binary search is called 100x more often than insert.
function insertSorted(list, item) { ... }

// GOOD: explains a domain concept that is not obvious from the code
// Stripe charges a fee of 2.9% + $0.30 per transaction (as of 2024).
// This must be paid by the merchant, so we gross up the charge amount.
const grossedUpAmount = amount / (1 - STRIPE_FEE_RATE) + STRIPE_FIXED_FEE
```

```text
COMMENTS THAT GENUINELY HELP:
  → Explain WHY the code does something non-obvious
  → Describe a workaround for an external system's bug or limitation
  → State an invariant or precondition the reader must know to use the code safely
  → Explain a performance tradeoff (why this algorithm vs. the obvious one)
  → Define domain-specific terminology that is not common knowledge
  → Warn about a known footgun or surprising behaviour
```

**CS lens:** The role of a comment is to communicate **intent and context** — the information that was in the programmer's head when they wrote the code but that does not appear in the code itself. The code is the WHAT and the HOW (the mechanism). The comment is the WHY (the reason the mechanism was chosen). In a codebase with good naming and decomposition, the code handles the WHAT and HOW clearly; the only information missing is the WHY. That is what comments are for.

## TODO comments

TODO comments mark known issues or future work directly in the code. Used sparingly and maintained, they are useful. Used prolifically and ignored, they are clutter.

```javascript
// TODO: add rate limiting once we see the traffic pattern — see issue #234
// TODO(alice): remove this fallback after the API v2 migration is complete
// FIXME: this will break if the timezone changes mid-day (see issue #891)
// HACK: we're caching the session token in memory because the SDK has a bug.
//       Once https://github.com/vendor/sdk/issues/123 is fixed, remove this.

// BAD TODO: no context, no issue reference, no owner
// TODO: fix this later
```

```text
TODO COMMENT RULES:
  → Include what is needed for the TODO to be resolved
  → Include a reference (issue number, PR, external bug) if possible
  → Include an owner (initials or username) if one person is responsible
  → Delete TODO comments when the task is done — stale TODOs are worse than none
  → Do not use TODOs as a substitute for doing the work now if "now" is feasible
```

## JSDoc for public APIs

JSDoc comments (with `/** ... */`) generate documentation and power IDE autocomplete. They are appropriate for functions that form a public API — exported functions, library interfaces, shared utilities.

```javascript
/**
 * Applies a percentage discount to an order total, subject to minimum charge.
 *
 * @param {number} total - The original order total in cents.
 * @param {number} discountRate - Discount as a decimal (0.1 = 10%).
 * @param {number} [minCharge=0] - Minimum charge in cents after discount.
 * @returns {number} The discounted total, never below minCharge.
 *
 * @example
 * applyDiscount(1000, 0.1)      // 900
 * applyDiscount(100, 0.5, 75)   // 75 (not 50, due to minimum)
 */
function applyDiscount(total, discountRate, minCharge = 0) {
  const discounted = total * (1 - discountRate)
  return Math.max(discounted, minCharge)
}
```

```text
WHEN TO WRITE JSDOC:
  ✓ Exported functions in libraries or shared modules
  ✓ Functions with non-obvious parameters (what does 'options' contain?)
  ✓ Functions with subtle semantics (what are the edge cases?)
  ✓ Public class methods that will be used by other developers

WHEN NOT TO WRITE JSDOC:
  ✗ Internal functions (called only within the same file)
  ✗ Functions whose name and parameters already explain everything
  ✗ Functions that are 3 lines long and obviously clear
```

**SE lens:** JsDoc serves a different audience from inline comments. Inline comments (`//`) are for people reading the source. JSDoc is for people using the interface — they may never read the implementation. This is the same distinction as API documentation vs. internal implementation notes. When a function is part of a public interface, treat its documentation as a contract: state what it requires, what it returns, and what happens at the edges. When TypeScript is used, type annotations cover some of this, but examples and edge case notes remain valuable.

**Common mistakes:**
- Writing comments for every function regardless of whether they add information — a function called `validateEmail(email)` that checks for an `@` sign does not need a comment saying "validates an email address." The name already says this.
- Letting comments become inconsistent with the code — a comment that was accurate when written becomes misleading when the code changes. Wrong comments are worse than no comments (they actively deceive the reader). If you change the code, update the comment or delete it.
- Using comments to save complex code that should be simplified — `// this is needed because of the edge case where...` followed by a 20-line conditional. The edge case logic should be extracted into a well-named function that makes the condition obvious; the comment is a symptom that the code is too complex.

**Debug tip:** A useful exercise when reading unfamiliar code: add comments as you decode it. What is this function actually doing? Why is this constant 86400? What does this flag mean? Then look at the comments you wrote — any of them that explain a NON-OBVIOUS thing belong in the code permanently. The ones that just explain what you could have read from the code can be deleted. This process also teaches you what to comment when you write new code.

## Challenge: comment_audit

Classify comments and rewrite the bad ones.

```challenge
function commentAudit(scenario) {
  // scenario: 'translation' | 'why-needed' | 'outdated' | 'workaround'
  //
  // Returns: { keep: boolean, reason: string, rewrite?: string }
  //   keep: should this comment be kept (true) or removed/rewritten (false)?
  //   reason: one sentence explaining your decision
  //   rewrite: if the comment can be improved, provide the improved version (optional)

  if (scenario === 'translation') {
    // Original comment: "// Loop through the array and add each value to the sum"
    // function sumArray(arr) { let sum = 0; for (const n of arr) sum += n; return sum }
  }

  if (scenario === 'why-needed') {
    // Original comment: "// Must flush before closing — data is buffered in the kernel"
    // await stream.flush(); stream.close();
  }

  if (scenario === 'outdated') {
    // Original comment: "// Returns the user's email"
    // function getUser(id) { return db.findById(id) }   // now returns the full user object
  }

  if (scenario === 'workaround') {
    // Original comment: "// iOS Safari ignores 'position: fixed' during scroll animations.
    //                    Use 'position: sticky' as a workaround."
    // el.style.position = 'sticky';
  }
}
```

```test
const t = commentAudit('translation')
assert t.keep === false && t.reason.length > 10

const w = commentAudit('why-needed')
assert w.keep === true && w.reason.length > 10

const o = commentAudit('outdated')
assert o.keep === false && o.reason.length > 10

const wr = commentAudit('workaround')
assert wr.keep === true && wr.reason.length > 10
```
