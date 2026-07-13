---
series: clean-code
level: 1
title: Naming Things Well
lang: javascript
---

# Naming Things Well

There are only two hard things in computer science: cache invalidation and naming things. The joke persists because naming is genuinely hard — not technically hard, but cognitively hard. A name must compress the full meaning of a variable, function, or concept into a few words, and then decompress correctly in the reader's mind without the original context.

Good names are the primary tool of clean code. When names are good, the code reads like prose — the reader follows the logic without having to pause and decode. When names are bad, the reader must maintain a mental dictionary, mapping short names to their meanings, while simultaneously following the logic. The dictionary takes up cognitive space that should be used for understanding. By the end of this lesson you will have a practical framework for naming variables, functions, classes, and constants.

## Naming variables

A variable name should reveal its purpose: what it holds, in the context where it is used.

```javascript
// BAD: abbreviation without context
const d = new Date()
const ms = d.getTime()

// GOOD: reveals purpose
const now = new Date()
const nowTimestamp = now.getTime()

// BAD: generic
const data = await fetchUser(id)
const info = data.profile

// GOOD: specific
const user = await fetchUser(id)
const profile = user.profile

// BAD: type in the name (Hungarian notation — redundant in typed and dynamic languages)
const userArray = []
const nameString = 'Alice'

// GOOD: what the thing IS, not what type it has
const users = []
const name = 'Alice'
```

```text
VARIABLE NAMING RULES:

  Singular vs plural:
    const user = ...          ← one thing
    const users = [...]       ← collection of things
    const activeUsers = ...   ← filtered collection

  Boolean variables — sound like a yes/no question:
    isActive, hasPermission, canEdit, shouldRetry, wasDeleted
    NOT: active, permission, edit, retry, deleted (ambiguous — is it a verb or adjective?)

  Numbers — include what they count or measure:
    itemCount, totalAmount, retryDelay (in what unit?), retryDelayMs

  Clarity over brevity:
    'e' is fine in: .catch(e => ...)  (universal convention for error in a catch)
    'i' is fine in: for (let i = 0; i < n; i++)  (universal loop index)
    Otherwise: expand. 'el' → 'element'. 'btn' → 'button'. 'cfg' → 'config'.
```

## Naming functions

A function name should describe what the function does — specifically, what transformation or action it performs.

```javascript
// BAD: vague verbs
function process(data) { ... }
function handle(event) { ... }
function do(thing) { ... }

// GOOD: specific verbs
function calculateTax(order) { ... }
function validateEmail(input) { ... }
function parseConfig(rawConfig) { ... }

// BAD: misleading — says 'get' but also modifies state
function getUser(id) {
  const user = db.find(id)
  user.lastAccessed = Date.now()   // SURPRISE: side effect
  db.save(user)
  return user
}

// GOOD: names reflect all the things the function does
function fetchAndTrackUser(id) {
  const user = db.find(id)
  trackAccess(user)
  return user
}
// OR better: separate the concerns
function getUser(id) { return db.find(id) }
function trackAccess(user) { user.lastAccessed = Date.now(); db.save(user) }
```

```text
FUNCTION NAMING CONVENTIONS:

  Pure computations (return a value, no side effects):
    calculate*, compute*, derive*, format*, parse*, build*, create*
    Examples: calculateDiscount, formatCurrency, parseDate

  Predicates (return boolean):
    is*, has*, can*, should*, was*
    Examples: isValidEmail, hasPermission, canAccessResource

  Actions (side effects — modify state, I/O):
    update*, save*, send*, delete*, process*, handle*, emit*, dispatch*
    Examples: saveUser, sendNotification, deleteExpiredSessions

  Transformations (take input, return transformed output):
    to*, from*, as*, map*
    Examples: toDTO, fromJSON, asCurrencyString
```

**CS lens:** A function name is a contract between the author and every caller. The name encodes the function's **semantics**: what it computes or does, what it requires (preconditions), and what it guarantees (postconditions). When the name says `getUser` but the function also updates `lastAccessed`, the contract is broken — the caller was not told about the side effect. This is a form of **information hiding gone wrong**: hiding side effects from callers rather than hiding implementation details. Good function names make the contract explicit.

## Naming constants

Magic numbers and strings are a major source of confusion. A constant name replaces the value with its meaning.

```javascript
// BAD: magic numbers
if (user.age < 18) { redirect('/underage') }
const fee = amount * 0.029 + 0.30

// GOOD: named constants
const MINIMUM_AGE = 18
if (user.age < MINIMUM_AGE) { redirect('/underage') }

const STRIPE_PERCENTAGE_FEE = 0.029
const STRIPE_FIXED_FEE_USD = 0.30
const fee = amount * STRIPE_PERCENTAGE_FEE + STRIPE_FIXED_FEE_USD

// BAD: magic strings
if (order.status === 'c') { ... }

// GOOD: named constants (or an enum-like object)
const ORDER_STATUS = {
  CREATED: 'created',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}
if (order.status === ORDER_STATUS.COMPLETED) { ... }
```

```text
WHEN TO EXTRACT A CONSTANT:
  A number or string appears more than once → extract it (if it changes, change one place)
  A number has a specific meaning beyond its face value → name it
  A string represents a domain concept → name it with a constant or enum

WHEN TO LEAVE IT INLINE:
  Mathematical formulas where the number IS the formula (e.g., 0.5 in midpoint formula)
  Single-use values where the name would not add meaning (e.g., setTimeout(fn, 0))
  Standard loop bounds (for (let i = 0; i < 10; i++) — the 10 is obvious from context)
```

## Naming in different scopes

The scope of a name determines how much context the reader has. Short names are acceptable in narrow scopes where the context is obvious; longer names are needed in wider scopes.

```javascript
// NARROW SCOPE: short name acceptable — context is obvious
const users = ['alice', 'bob', 'carol']
users.filter(u => u.startsWith('a'))   // 'u' is clearly a user — the array's name says so

// NARROW SCOPE: very short is fine in a callback when the outer name is clear
[1, 2, 3].map(n => n * 2)   // 'n' is obviously a number

// WIDE SCOPE: function parameters need more description — no outer context
function processPayment(a, p, c) { ... }  // BAD: no context
function processPayment(amount, paymentMethod, currency) { ... }  // GOOD

// MODULE SCOPE: names need to be self-contained
const x = 5   // BAD: what is x?
const MAX_RETRY_ATTEMPTS = 5   // GOOD: name is clear without any context
```

**SE lens:** Naming in wide scopes (module-level constants, exported functions, public API methods) is more important than naming in narrow scopes (local variables in a 5-line function). The reason: wide-scope names are used by people who do not have the local context — they see the name in an import statement, a function call, or a type definition. The name must carry its full meaning without surrounding code. This is why libraries and APIs tend to have longer, more descriptive names than internal functions: they are designed to be read without the implementation.

**Common mistakes:**
- Naming variables after their type rather than their role — `userList`, `nameString`, `countNumber`. The type annotation (or dynamic type) already describes the type. The name should describe the role.
- Using the same name for different things in different scopes — a variable named `data` in five different functions, each holding a different type of data. Readers scanning the code cannot tell which `data` is which.
- Abbreviating inconsistently — `btn` in one place, `button` in another, `b` in a third. Choose one form and use it everywhere. Consistency matters more than the specific choice.

**Debug tip:** When trying to debug code with bad names: the first step is to rename things as you understand them. Once you understand that `d` is `discountedPrice` and `t` is `taxRate`, rename them. The renamed code will often reveal the bug because the logic is now legible. Renaming is not wasted time — it is the work of comprehension made permanent.

## Challenge: rename_for_clarity

Improve the names in a poorly-named function.

```challenge
function renameForClarity(input) {
  // input: one of 'function-a', 'function-b', 'function-c'
  // Returns: an object with renamed versions of identifiers

  if (input === 'function-a') {
    // Original:
    // function f(l) {
    //   let r = 0
    //   for (let x of l) { r += x }
    //   return r / l.length
    // }
    return {
      functionName: '',    // what should f be named?
      param1: '',          // what should l be named?
      localVar: '',        // what should r be named?
      loopVar: '',         // what should x be named?
    }
  }

  if (input === 'function-b') {
    // Original:
    // function chk(u) {
    //   return u !== null && u.a === true && u.v !== null
    // }
    // (checks if a user is active and verified)
    return {
      functionName: '',    // what should chk be named?
      param1: '',          // what should u be named?
      field1: '',          // what should .a be named?
      field2: '',          // what should .v be named?
    }
  }

  if (input === 'function-c') {
    // Original:
    // const x = 86400000
    // (milliseconds in one day, used as a cache TTL)
    return {
      constantName: '',    // what should x be named?
    }
  }
}
```

```test
const a = renameForClarity('function-a')
assert a.param1.length > 1 && a.localVar.length > 1 && a.loopVar.length > 1   // not just 'l', 'r', 'x'
assert a.functionName.toLowerCase().includes('average') || a.functionName.toLowerCase().includes('mean')

const b = renameForClarity('function-b')
assert b.functionName.startsWith('is') || b.functionName.startsWith('has') || b.functionName.startsWith('can')
assert b.field1.toLowerCase().includes('active') || b.field1.toLowerCase().includes('enabled')
assert b.field2.toLowerCase().includes('verif')

const c = renameForClarity('function-c')
assert c.constantName.toUpperCase() === c.constantName   // SCREAMING_SNAKE_CASE
```
