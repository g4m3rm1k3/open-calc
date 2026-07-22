# Concept: Pure Functions and Testability

**What you'll understand by the end:** why keeping a function free of side effects and external dependencies makes it dramatically easier to test, and how to recognize when logic has been needlessly tangled up with something that isn't its actual job.

**Prerequisites:** `function-composition.md`.

## Setup

Any language will do; the isolated example uses JavaScript, runnable in any runtime, plus a real test runner (`npm install --save-dev vitest`) to demonstrate the testing payoff concretely.

## The Problem

A function that reads global/mutable state, produces output on a screen, writes to a file, or depends on a particular environment (a browser, a database connection, a rendering context) can only be tested by first reconstructing — or convincingly faking — that entire surrounding environment. A function whose behavior depends *only* on its own inputs, and whose only effect is its return value, needs none of that: it can be called directly, with plain data, and checked against a plain expected result.

## The Isolated Example

An impure version — logic tangled with rendering:
```javascript
function drawGroupedBars(canvasContext, values) {
    let groups = [];
    let current = [values[0]];
    for (let i = 1; i < values.length; i++) {
        if (Math.sign(values[i]) === Math.sign(current[current.length - 1])) {
            current.push(values[i]);
        } else {
            groups.push(current);
            current = [values[i]];
        }
    }
    groups.push(current);
    groups.forEach((group) => {
        canvasContext.fillRect(0, 0, group.length * 10, 20); // real drawing
    });
}
```
Testing this requires a real (or convincingly faked) `canvasContext` just to check whether the *grouping* logic is correct — an unrelated concern.

A pure version — grouping logic extracted:
```javascript
function groupBySign(values) {
    if (values.length === 0) return [];
    const groups = [];
    let current = [values[0]];
    for (let i = 1; i < values.length; i++) {
        if (Math.sign(values[i]) === Math.sign(current[current.length - 1])) {
            current.push(values[i]);
        } else {
            groups.push(current);
            current = [values[i]];
        }
    }
    groups.push(current);
    return groups;
}

function drawGroupedBars(canvasContext, values) {
    groupBySign(values).forEach((group) => {
        canvasContext.fillRect(0, 0, group.length * 10, 20);
    });
}
```

**Testing the pure version, real code:**
```javascript
import { describe, it, expect } from "vitest";

describe("groupBySign", () => {
    it("groups consecutive same-sign values together", () => {
        expect(groupBySign([1, 2, -3, -4, 5])).toEqual([[1, 2], [-3, -4], [5]]);
    });
});
```

**Real output:**
```
 ✓ groupBySign > groups consecutive same-sign values together
 Tests  1 passed (1)
```

**What this proves:** the grouping logic was fully verified with zero canvas, zero rendering context, zero DOM — a plain array in, a plain array out. The impure version's identical logic could never be tested this directly; any test of it would necessarily also be testing (or faking) the drawing code alongside it.

## Mechanical Walkthrough

- A **pure function** produces its output using *only* its own arguments, with no reads of external/mutable state, and causes no observable **side effects** (no drawing, no network call, no mutation of something outside itself) — calling it twice with the same arguments always produces the same result.
- Extracting `groupBySign` out of `drawGroupedBars` didn't change what either function does — it only changed *where* the grouping logic lives, separating "compute the groups" (pure) from "draw them" (impure, dependent on a real canvas).
- The impure `drawGroupedBars` still exists and is still needed — extraction doesn't eliminate side effects from a program (a program that never draws anything is useless for a drawing tool); it isolates *which specific piece* carries them, shrinking the impure surface to exactly what genuinely needs it.

## CS Lens

This is a direct, practical consequence of **referential transparency** — a pure function's call can conceptually be replaced by its return value with no change in program behavior, which is precisely what makes it trivial to reason about and test in total isolation: there's no hidden state to set up, and no observable effect to verify beyond the return value itself. Side-effecting code, by contrast, requires reasoning about *when* it runs and *what environment* it runs in, not just what value it produces.

Also recognized in: functional programming's broader emphasis on minimizing side effects generally, the "sandwich" pattern of concentrating I/O at a program's edges with a pure core in between, and unit-testing folklore's own common advice, "if it's hard to test, it's probably doing too much."

## SE Lens

The real, measurable payoff shows up directly in test setup cost: a pure function's tests need no mocks, no fake browser APIs, no database — plain values in, plain values compared out — which also means the tests run fast (no real I/O) and can't fail for reasons unrelated to the logic being checked (a flaky network call, a misconfigured fake environment). This isn't a purity requirement for its own sake — a program with *zero* side effects does nothing observable at all — it's a deliberate architectural choice about *where* the unavoidable side effects live, keeping everything else as plain, testable data transformation.

## Connection

Builds on `function-composition.md`. `automated-testing-unit-test-basics.md` is the concrete mechanism used to actually exercise a pure function's guarantees; `deep-equality-vs-reference-equality.md` is commonly needed once a pure function's output is a compound value (an object or array) rather than a single primitive.

## Try It Yourself

1. Write a test for the impure `drawGroupedBars` directly, using a hand-built fake `canvasContext` object (`{ fillRect: (...) => calls.push(...) }`) that records its calls instead of actually drawing — confirm this is possible but requires meaningfully more setup code than testing `groupBySign` alone required.
2. Identify one more piece of "logic" tangled inside the impure version above beyond grouping (there isn't one here — a deliberately minimal example) and, in a real codebase you have access to, find one real function that mixes computation with I/O, and sketch how you'd split it the same way this file's example was split.
3. Write a second pure function that consumes `groupBySign`'s output (e.g., one that computes each group's average) and test it independently, using a hand-constructed grouped array as input rather than calling `groupBySign` itself — confirming the two functions can be developed and verified in complete isolation from one another.
