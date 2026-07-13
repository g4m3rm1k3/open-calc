---
series: clean-code
level: 2
title: Functions — One Thing, Done Well
lang: javascript
---

# Functions — One Thing, Done Well

A function is the fundamental unit of decomposition in most programming languages. It names a piece of computation, hides its details, and allows the computation to be used from multiple places. But functions are easy to misuse: they grow, they acquire responsibilities, they become impossible to test, and they become impossible to understand without tracing their entire execution.

The discipline of writing good functions comes down to one principle: a function should do one thing. Not one thing with a few extras. Not one thing at multiple levels of abstraction. One thing, at one level, done well. By the end of this lesson you will be able to write functions that are small, well-named, testable, and honest about what they do.

## The single responsibility principle for functions

```javascript
// BAD: this function does three things — validates, saves, and sends email
async function createUser(userData) {
  // 1. Validate
  if (!userData.email || !userData.email.includes('@')) {
    throw new Error('Invalid email')
  }
  if (!userData.password || userData.password.length < 8) {
    throw new Error('Password too short')
  }

  // 2. Save to database
  const hashedPassword = await bcrypt.hash(userData.password, 10)
  const user = await db.users.insert({ ...userData, password: hashedPassword })

  // 3. Send welcome email
  await emailService.send({
    to: user.email,
    subject: 'Welcome!',
    template: 'welcome',
    data: { name: user.name },
  })

  return user
}
```

```javascript
// GOOD: each function does one thing at one level of abstraction
function validateUserData(userData) {
  if (!userData.email || !userData.email.includes('@')) {
    throw new Error('Invalid email')
  }
  if (!userData.password || userData.password.length < 8) {
    throw new Error('Password too short')
  }
}

async function saveUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10)
  return db.users.insert({ ...userData, password: hashedPassword })
}

async function sendWelcomeEmail(user) {
  return emailService.send({
    to: user.email,
    subject: 'Welcome!',
    template: 'welcome',
    data: { name: user.name },
  })
}

async function registerUser(userData) {
  validateUserData(userData)             // level: validate
  const user = await saveUser(userData)  // level: persist
  await sendWelcomeEmail(user)           // level: notify
  return user
}
```

```text
THE BENEFITS OF ONE RESPONSIBILITY:
  → registerUser() is a clear sequence of three named steps — readable as documentation
  → Each step is testable independently:
      validateUserData() — call directly with bad inputs, no database needed
      saveUser() — mock the database, test the hashing
      sendWelcomeEmail() — mock the email service, test the template data
  → When validation changes, only validateUserData() changes
  → When the email template changes, only sendWelcomeEmail() changes
```

**CS lens:** The single-responsibility principle applied to functions is a consequence of the **substitution principle**: if a function does one thing, it can be substituted with any other function that does the same one thing. The composition point (`registerUser`) is flexible — you can replace `sendWelcomeEmail` with `sendVerificationEmail` without touching the others. This substitutability is the basis of every plugin system, strategy pattern, and mock in testing.

## One level of abstraction per function

A function mixes levels of abstraction when it contains both high-level decisions and low-level implementation details.

```javascript
// BAD: mixes high-level (order processing) with low-level (string concatenation, loop index)
async function processOrder(order) {
  // High level
  if (order.status !== 'pending') return

  // Low level (SQL-level concern mixed in)
  let itemList = ''
  for (let i = 0; i < order.items.length; i++) {
    itemList += order.items[i].name + (i < order.items.length - 1 ? ', ' : '')
  }

  // High level again
  const charged = await chargeCard(order.total)
  if (!charged) return

  // Low level again
  order.status = 'completed'
  order.completedAt = new Date().toISOString()
  await db.query('UPDATE orders SET status=?, completedAt=? WHERE id=?',
    ['completed', order.completedAt, order.id])

  await notifyCustomer(order.customer, `Your order is complete: ${itemList}`)
}
```

```javascript
// GOOD: each function is at one level
function formatItemList(items) {
  return items.map(item => item.name).join(', ')
}

async function markOrderCompleted(order) {
  order.status = 'completed'
  order.completedAt = new Date().toISOString()
  await db.orders.update(order.id, { status: order.status, completedAt: order.completedAt })
}

async function processOrder(order) {
  if (order.status !== 'pending') return
  const charged = await chargeCard(order.total)
  if (!charged) return
  await markOrderCompleted(order)
  await notifyCustomer(order.customer, `Your order is complete: ${formatItemList(order.items)}`)
}
```

## Function length

There is no magic number for function length, but in practice, functions that fit on one screen (25–30 lines) are easier to understand than functions that require scrolling. Long functions are a symptom, not a cause — they are long because they do too many things. The fix is decomposition, not line limits.

```text
SIGNALS THAT A FUNCTION IS TOO LONG:
  → You need comments to mark "sections" within the function
  → The function contains both validation logic and business logic
  → You need to scroll to read the entire function
  → The function has more than 3–4 parameters
  → You cannot describe what the function does in one sentence

EXTRACT WHEN:
  → A "section" of code has a clear single purpose
  → The extracted function has a clear, obvious name
  → The extraction would make the parent function read as a summary

DO NOT EXTRACT WHEN:
  → The extracted function would only be called once and the name doesn't add clarity
  → The extraction would create more parameters than it removes
  → The name of the extracted function is no clearer than the code itself
```

## Honest functions: side effects and return values

A function should be honest about what it does. A function that returns a value should not also have side effects — that is two things. A function that has side effects should not return a meaningful value — that conflates the two.

```javascript
// DISHONEST: side effect hidden in a query-style function
function getNextId(list) {
  const id = list.length + 1
  list.push({ id, placeholder: true })   // HIDDEN SIDE EFFECT
  return id
}

// HONEST: query-only (no side effect)
function getNextId(list) {
  return list.length + 1
}

// HONEST: command-only (side effect, no return value)
function appendPlaceholder(list) {
  list.push({ id: list.length + 1, placeholder: true })
}

// COMMAND-QUERY SEPARATION:
// Functions should either COMMAND (change state, no return) or QUERY (return data, no side effects).
// Not both.
// Exceptions: factory functions (return the created thing), builders (return this for chaining).
```

**SE lens:** Command-query separation (CQS) is a design principle that makes functions predictable. A caller of `getNextId()` does not expect it to modify the list. If it does, the caller's mental model is wrong — which leads to bugs that are hard to diagnose because the symptom (list has an unexpected element) is distant from the cause (calling what looked like a query). CQS makes the behaviour auditable from the name alone: names starting with `get`, `find`, `calculate`, `is`, `has` should be side-effect-free. Names starting with `update`, `save`, `delete`, `send`, `append` should return void (or a status, not the computed value).

**Common mistakes:**
- Extracting for the sake of extracting — creating a function called `processItem` that does nothing other than wrapping three lines of code, called once, with a name that explains less than the three lines it contains. Extract only when the extraction has a clear purpose.
- Functions with boolean flags that change behaviour — `function render(data, isPreview)` — is doing two different things based on the flag. The caller has to know which mode they are in. The fix: two functions, `render(data)` and `renderPreview(data)`.
- Not returning from functions early — a function that has a long chain of `else` blocks for the non-happy-path cases, rather than returning early for each error condition. Early returns remove nesting and make the happy path visible.

**Debug tip:** When a function is hard to test, it is usually because it is doing too many things or has hidden dependencies. The test for "one thing": can you call the function with just its parameters and get a deterministic result? If you need to set up a database, mock an email service, and seed a user, the function is doing too many things. The decomposition that makes functions testable is the same decomposition that makes them readable.

## Challenge: decompose_function

Break a large function into smaller single-responsibility functions.

```challenge
function calculateOrderSummary(order) {
  // This function does too many things. Implement it by decomposing into helpers:
  //
  // subtotal: sum of (item.price * item.quantity) for all items
  // discount: if order.coupon === 'SAVE10', discount = subtotal * 0.1, else 0
  // tax: (subtotal - discount) * 0.08 (8% tax)
  // total: subtotal - discount + tax
  //
  // Return: { subtotal, discount, tax, total }
  //   All values rounded to 2 decimal places.
  //
  // Implement as: calculateSubtotal(items), calculateDiscount(subtotal, coupon),
  //               calculateTax(taxableAmount), then compose in calculateOrderSummary.
}

function calculateSubtotal(items) {
  // sum of item.price * item.quantity
}

function calculateDiscount(subtotal, coupon) {
  // returns discount amount: 10% if coupon === 'SAVE10', else 0
}

function calculateTax(taxableAmount) {
  // returns 8% of taxableAmount
}
```

```test
const order = {
  items: [
    { name: 'Widget', price: 10.00, quantity: 3 },
    { name: 'Gadget', price: 25.50, quantity: 2 },
  ],
  coupon: 'SAVE10',
}

const subtotal = calculateSubtotal(order.items)
assert subtotal === 81.00   // (10*3) + (25.5*2)

const discount = calculateDiscount(subtotal, 'SAVE10')
assert discount === 8.10 && calculateDiscount(subtotal, null) === 0

const tax = calculateTax(subtotal - discount)
assert Math.abs(tax - 5.83) < 0.01   // (81 - 8.1) * 0.08 = 5.832

const summary = calculateOrderSummary(order)
assert summary.subtotal === 81.00 && summary.discount === 8.10
assert Math.abs(summary.tax - 5.83) < 0.01 && Math.abs(summary.total - (81.00 - 8.10 + 5.832)) < 0.01
```
