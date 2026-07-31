# Lesson 34a: Build Variant / Environment Profile

**What you will build:** No new code to compile — this reads a real,
general configuration shape directly.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Build Variant / Environment Profile** — maintaining separate
  configurations (e.g. debug vs. release, development vs. production)
  compiled or run from one shared codebase, each suited to a different
  purpose.

---

## Concept Unit: Build Variant / Environment Profile

### The Problem

Software behaves differently depending on who's running it and why —
a developer testing on their own machine needs different behavior
(verbose logging, no real payment processing) than a real user running
the finished product. Writing two entirely separate copies of the source
code for these two situations would mean every change has to be made
twice, and the two copies would drift apart almost immediately.

### Introduce the Concept in Isolation

This concept doesn't need Android specifically to demonstrate — it's a
general idea, verified against how build tooling works broadly. A small,
real example, a `.env`-style configuration file for a hypothetical
development environment:

```
API_URL=http://localhost:8080
DEBUG_LOGGING=true
```

...and the equivalent for production:

```
API_URL=https://api.realcompany.com
DEBUG_LOGGING=false
```

This is a `Build Variant` — **first appearance** (also called an
**environment profile**): maintaining separate configurations (e.g.
debug vs. release, development vs. production) compiled or run from one
shared codebase, each suited to a different purpose. The application's
own source code never changes between these two — only which
configuration file gets loaded at build or run time changes, and the
code reads `API_URL` symbolically rather than having either address
hardcoded into it.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, general
configuration shape.

### Mechanical Walkthrough

1. `API_URL=http://localhost:8080` and `API_URL=https://api.realcompany.com`
   — **(a) first appearance** of this general shape: the same symbolic
   name, `API_URL`, resolving to two entirely different real values
   depending on which configuration is active.
2. `DEBUG_LOGGING=true` / `DEBUG_LOGGING=false` — a second setting,
   varying the same way — proof this isn't a one-off special case but a
   general pattern: any number of settings can differ per variant, with
   the application code itself never needing to know which variant is
   currently active beyond reading these symbolic values.

### CS Lens

A build variant is **configuration as data**, kept entirely separate from
the logic that reads it — the same separation-of-concerns idea behind
Android resources (Lesson 2j): content that varies is kept out of the
code that uses it, referenced symbolically instead of hardcoded.

Also recognized in: environment variables in virtually every deployed
application, `.env` files in web development generally, feature flags
that change behavior per deployment without a code change.

### SE Lens

The alternative — hardcoding `http://localhost:8080` directly in source
code, then manually editing it before every real release — was not
chosen because manual edits are exactly the kind of repeated, easy-to-
forget step that eventually gets missed, shipping a real user's build
pointed at a developer's local machine. Separate, named configurations
make "which environment is this" an explicit, deliberate choice at build
time, not a manual edit trusted to be remembered correctly every time.

---

## Connect the Pieces

A build variant is one shared codebase, configured differently per
purpose — the general idea. The next lesson shows Android's own concrete
application of it.

## What Breaks Without This

Hardcoding a development address directly in source code, then manually
editing it before every real release, is exactly the kind of repeated,
easy-to-forget step that eventually gets missed, shipping a real user's
build pointed at a developer's local machine.

## Exercises

1. Add a third setting, `ANALYTICS_ENABLED`, differing between the
   development and production configurations shown above.
2. Explain, in your own words, why the application's own source code
   never changes between the two configurations.
3. Name one real app feature (besides logging or an API URL) that would
   reasonably differ between a development and production build.

## Definition of Done

- [ ] You read the environment-profile example and can explain how the
      same application code behaves differently per configuration.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why separate
      configurations are preferred over manually editing hardcoded
      values.
