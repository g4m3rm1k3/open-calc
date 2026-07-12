---
series: software-construction
level: 1
title: Decomposing Problems
lang: javascript
---

# Decomposing Problems

The hardest part of building software is not writing code. It is deciding what code to write before you write it. Decomposition is the discipline of breaking a problem into pieces that are each small enough to solve independently, and that compose back into the whole solution cleanly.

Without decomposition, developers write in one direction — forward — accumulating code until the task is done. With decomposition, developers map the problem first, identify the natural fault lines, and build each piece with a clear contract. The difference shows up immediately when something needs to change.

By the end of this lesson you will understand what decomposition is and why it produces better software than accretion, be able to find the natural fault lines in a problem before writing code, and know when a decomposition is well-formed versus when it has gone wrong.

## What decomposition is

Decomposition is the act of breaking a large problem into smaller sub-problems, each of which can be solved independently and whose solutions compose to solve the original problem.

```text
Problem: Build a user registration system

Surface decomposition (by feature):
  → Registration

Better decomposition (by responsibility):
  → Validate input         (knows what makes an email valid, what makes a password strong)
  → Check uniqueness       (knows how to ask the database if the email exists)
  → Hash the password      (knows how to safely store a secret)
  → Persist the user       (knows how to write to the database)
  → Send welcome email     (knows how to communicate with the email service)
  → Return the result      (knows what a successful registration response looks like)

Each sub-problem has one clear owner, one clear contract, and one clear reason to change.
```

The test of a decomposition: can you explain what each piece does in one sentence without using the word "and"? If a piece requires "and", it contains at least two responsibilities and should be split further.

## Top-down vs bottom-up

There are two approaches to decomposition. Both are valid. They are tools, not rules.

```text
TOP-DOWN: start from the whole and divide.

  registerUser()
    ├── validateInput(email, password)
    │     ├── isValidEmail(email)
    │     └── isStrongPassword(password)
    ├── checkEmailUnused(email)
    ├── hashPassword(password)
    ├── saveUser(email, hashedPassword)
    └── sendWelcomeEmail(email)

  You decide the structure before writing any code.
  Risk: you may discover the structure is wrong once implementation begins.
  Strength: forces clear thinking before commitment.

BOTTOM-UP: start from the pieces and compose.

  Write isValidEmail() first — small, testable, obvious.
  Write isStrongPassword() — same.
  Write hashPassword() — depends on nothing.
  Compose: validateInput() calls the two validators.
  Compose: registerUser() calls everything.

  You discover the structure through the process of building.
  Risk: you may build pieces that do not compose cleanly.
  Strength: each piece is validated before the whole exists.
```

```javascript
// Bottom-up example: building from atomic pieces

function isValidEmail(email) {
  return typeof email === 'string' && email.includes('@') && email.includes('.')
}

function isStrongPassword(password) {
  return typeof password === 'string' && password.length >= 8
}

function validateInput(email, password) {
  // Composes two already-verified pieces
  return {
    emailValid: isValidEmail(email),
    passwordValid: isStrongPassword(password),
  }
}
```

```text
Running validateInput('user@example.com', 'hunter2'):
  isValidEmail('user@example.com') → true   (has '@' and '.')
  isStrongPassword('hunter2')      → false  ('hunter2' is 7 chars, needs 8)
  result: { emailValid: true, passwordValid: false }

Running validateInput('notanemail', 'correcthorsebatterystaple'):
  isValidEmail('notanemail')                → false (no '@')
  isStrongPassword('correcthorsebatterystaple') → true
  result: { emailValid: false, passwordValid: true }
```

**CS lens:** Decomposition is the computational equivalent of **divide and conquer** — the algorithmic strategy where a problem is split into sub-problems of the same form, each solved independently, and the solutions combined. Merge sort is the canonical example: split the array in two, sort each half (recursively), merge the results. Software decomposition applies the same principle to structure rather than algorithms: divide the responsibility, solve each piece, compose the results. The guarantee both strategies rely on is the same — that the sub-problems are independent enough that solving one does not invalidate the solution to another.

**SE lens:** Decomposition decisions are among the most expensive decisions in a codebase because they determine the shape of everything that follows. A decomposition that puts validation inside the persistence layer means you cannot validate without accessing the database. A decomposition that puts formatting inside the business logic means you cannot change the output format without touching domain rules. These decisions are cheap to make well at the start and expensive to undo after thousands of lines depend on them.

**Common mistakes:**
- Decomposing by technology instead of responsibility — "all the database code in one place, all the validation in another." This creates coupling between unrelated features that happen to share infrastructure.
- Stopping too early — a function called `processUserData()` that does six things has been named but not decomposed. Naming is not decomposition.
- Stopping too late — a function `getFirstCharacterOfFirstWordOfEmailLocalPart()` is atomic but useless. Decompose to the level where each piece is independently meaningful, not to the level of individual operations.
- Decomposing in isolation — the sub-problems must compose. A decomposition that produces pieces with no clean way to combine is wrong, however clean each piece looks individually.

**Debug tip:** When a bug touches four files to fix one behaviour, the decomposition is wrong. The files that change together should live together — or at minimum, the responsibility should be owned by one place, not distributed across many. "Shotgun surgery" (many small changes across many files for one logical change) is the diagnostic symptom of responsibility that was not decomposed correctly.

## Challenge: decompose_search

Decompose a search feature into its distinct sub-problems.

A search feature does the following: the user types a query, the system cleans and normalises it, searches a list of items, ranks the results by relevance, and returns the top five.

```challenge
// Name each sub-problem as a function signature.
// Each function should do exactly one thing.
// Use descriptive parameter names.
const searchDecomposition = {
  // The function that cleans/normalises raw user input:
  step1: '',  // e.g. "normaliseQuery(rawInput)"

  // The function that searches items for matches:
  step2: '',

  // The function that ranks results by relevance:
  step3: '',

  // The function that limits results to the top N:
  step4: '',

  // The function that orchestrates all of the above:
  step5: '',
}
```

```test
assert searchDecomposition.step1 !== '' && searchDecomposition.step2 !== '' && searchDecomposition.step3 !== '' && searchDecomposition.step4 !== '' && searchDecomposition.step5 !== ''
const s1 = searchDecomposition.step1.toLowerCase()
assert s1.includes('normalise') || s1.includes('normalize') || s1.includes('clean') || s1.includes('sanitise') || s1.includes('sanitize') || s1.includes('parse')
const s2 = searchDecomposition.step2.toLowerCase()
assert s2.includes('search') || s2.includes('find') || s2.includes('match') || s2.includes('filter')
const s3 = searchDecomposition.step3.toLowerCase()
assert s3.includes('rank') || s3.includes('sort') || s3.includes('score') || s3.includes('order')
const s4 = searchDecomposition.step4.toLowerCase()
assert s4.includes('top') || s4.includes('limit') || s4.includes('slice') || s4.includes('first') || s4.includes('take')
const s5 = searchDecomposition.step5.toLowerCase()
assert s5.includes('search') || s5.includes('run') || s5.includes('execute') || s5.includes('perform')
```
