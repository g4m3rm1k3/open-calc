---
series: debugging-fundamentals
level: 0
title: What Debugging Actually Is
lang: javascript
---

# What Debugging Actually Is

Debugging is not the activity of staring at code until you find the mistake. It is a scientific process: form a hypothesis about what is wrong, design an observation that would confirm or refute it, observe, update your hypothesis. The programmer who finds bugs fastest is not the one with the most experience — it is the one who applies this process most rigorously.

The name "bug" was popularised by Grace Hopper in 1947 when a moth was found lodged in a relay of the Harvard Mark II computer. But the practice of systematic fault-finding is as old as engineering itself: identify the symptom, isolate the system, narrow the cause, verify the fix.

By the end of this lesson you will understand what a bug is precisely, why the scientific method is the correct debugging framework, the difference between symptoms and causes, and the five-step debugging process that applies to every bug you will ever encounter.

## What a bug is

A bug is a discrepancy between what the program does and what the program should do. This is a precise definition with three implications:

```text
IMPLICATION 1: A bug requires a specification.
  "Wrong" means "does not match the expected behaviour."
  Expected behaviour must be defined — in tests, in documentation, in a requirement.
  Code without a specification cannot have bugs — only unexpected behaviour.

IMPLICATION 2: A bug is not "the error message."
  The error message is a SYMPTOM: an observable consequence of the bug.
  The bug is the CAUSE: the incorrect code or logic that produced the symptom.
  Fixing the symptom without the cause is not debugging — it is papering over.

IMPLICATION 3: Bugs have exactly one root cause.
  A symptom may appear to have multiple causes.
  Tracing backwards from the symptom always leads to one root: the incorrect assumption,
  the wrong algorithm, the misread requirement, the missing edge case.
  Finding the root cause is the goal of debugging.
```

## The symptom/cause distinction

This is the most important concept in debugging. The inability to distinguish between symptoms and causes is why bugs take hours to fix when they should take minutes.

```text
Example: a user reports "the login button doesn't work."

SYMPTOM:            The login button does nothing when clicked.
DEEPER SYMPTOM:     The click handler throws an error.
DEEPER SYMPTOM:     The error is "Cannot read property 'email' of undefined."
DEEPER SYMPTOM:     The `user` variable is undefined when the form submits.
ROOT CAUSE:         The API response for login returns { data: { user: {...} } }
                    but the code reads response.user instead of response.data.user.

The original symptom ("button doesn't work") is five levels removed from the cause.
Debugging is the process of moving from symptoms to the cause.

Every "fix" that addresses a symptom rather than the cause will:
  a) Not actually fix the bug (the root cause remains).
  b) Create a new symptom (a workaround that breaks something else).
  c) Mask the root cause, making it harder to find later.
```

**CS lens:** The symptom/cause relationship is a causal chain. Each effect has a cause, and that cause is itself an effect of a deeper cause. **Root cause analysis (RCA)** is the discipline of tracing this chain to its terminus — the point where a false assumption, a design error, or an incorrect implementation introduced the original discrepancy. The "Five Whys" technique (ask "why?" five times) is a structured way to trace from symptom to root cause.

## The five-step debugging process

This is the scientific method applied to software. It works for every bug, in every language, in every system.

```text
STEP 1: REPRODUCE
  Make the bug happen reliably, in a controlled environment, with specific inputs.
  A bug you cannot reproduce cannot be debugged — you have no way to verify a fix.
  
  Goal: produce a MINIMAL REPRODUCIBLE EXAMPLE (MRE) — the smallest piece of code
  that exhibits the bug with no irrelevant complexity.

STEP 2: LOCATE
  Narrow down WHERE in the code the bug manifests.
  Binary search the code: add a checkpoint in the middle of the execution path.
  If the bug manifests before the checkpoint → it is in the first half.
  If not → it is in the second half.
  Repeat until the bug is in a single function.

STEP 3: HYPOTHESISE
  Form a precise hypothesis about the cause.
  NOT: "maybe something is wrong with the data."
  YES: "I believe `user.email` is undefined at line 47 because the API response
        wraps the user object in a `data` key that the code does not unwrap."
  
  A hypothesis is specific enough to be refuted.

STEP 4: VERIFY
  Design the smallest observation that would confirm or refute the hypothesis.
  Add a log, set a breakpoint, write a unit test for the suspected function.
  Run it. What actually happened?

  If confirmed: you have found the cause. Fix it.
  If refuted: update your hypothesis. The observation gave you new information.
  Return to Step 3 with the new information.

STEP 5: FIX AND CONFIRM
  Fix the root cause (not the symptom).
  Verify the fix: the original reproduction case no longer exhibits the bug.
  Write a test that would catch this bug if it regressed.
```

```text
The most common debugging failure modes:

  SHOTGUN DEBUGGING:  Making random changes and hoping one fixes the bug.
    Problem: you have no hypothesis. You do not know why it works when it does.
    The bug will return. A different bug is introduced by the random changes.

  SYMPTOM FIXING:     Changing the code to avoid the error rather than understand it.
    Problem: the root cause remains. The bug resurfaces elsewhere or differently.
    
  HYPOTHESIS JUMPING: Fixing based on the first plausible hypothesis without verifying.
    Problem: you may fix a non-bug, then be confused when the bug remains.
    All hypotheses require verification before fixing.

  RUBBER DUCK SKIPPING: Not explaining the problem before diving into the code.
    The act of explaining forces you to articulate your mental model.
    Articulating the model surfaces the wrong assumption — often before any code is touched.
```

**SE lens:** The discipline of writing a test before fixing a bug is called "test-first debugging." The test documents the exact bug (this input produces this wrong output), proves the bug exists (the test fails), verifies the fix (the test passes), and prevents regression (the test stays in the suite). This is not optional polish — it is what converts a one-time fix into a permanent guarantee. Every unfixed bug is a missing test.

**Common mistakes:**
- Debugging the code you wish existed rather than the code that does — read the actual code, not your mental model of it. The bug is in the actual code.
- Fixing things that "should" work rather than observing what actually happens — should is irrelevant. Only what the program does matters.
- Stopping when the error disappears rather than when the root cause is understood — if you do not understand why the fix works, the bug is not fixed. You got lucky, and luck does not prevent regression.

**Debug tip:** Before writing a single line of debugging code, write down in plain English: "I believe the bug is X, because Y." If you cannot complete this sentence, you do not have a hypothesis yet. Return to Step 1 and 2 until you can.

## Challenge: identify_root_cause

Read this bug report and trace from the symptom to the root cause using the five steps.

```challenge
// Bug report: "the totalPrice always shows $0.00 on checkout"

// The checkout function:
function checkout(cart) {
  const total = cart.items.reduce((sum, item) => {
    return sum + item.unitPrice * item.qty
  }, 0)
  return { totalPrice: total.toFixed(2) }
}

// The items come from the API in this shape:
const apiItem = { unit_price: 19.99, quantity: 2, name: 'Hat' }

// The cart passed to checkout:
const cart = {
  items: [
    { unit_price: 19.99, quantity: 2, name: 'Hat' },
    { unit_price: 9.99,  quantity: 1, name: 'Socks' },
  ]
}

const bugAnalysis = {
  // What is the symptom the user sees?
  symptom: '',

  // What does item.unitPrice evaluate to for the items above?
  unitPriceValue: null,     // the actual JavaScript value, not a string

  // What is the root cause? (one sentence: what name mismatch causes the bug)
  rootCause: '',

  // What is the correct fix? (one sentence describing what to change)
  fix: '',

  // What does checkout(cart).totalPrice return with the current broken code?
  brokenResult: '',
}
```

```test
const b = bugAnalysis
assert b.symptom.length > 10
assert b.unitPriceValue === undefined
assert b.rootCause.toLowerCase().includes('unit_price') || b.rootCause.toLowerCase().includes('unitprice')
assert b.fix.length > 15
assert b.brokenResult === '0.00'
```
