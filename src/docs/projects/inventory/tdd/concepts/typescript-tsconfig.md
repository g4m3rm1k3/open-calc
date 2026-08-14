# Concept: `tsconfig.json`

**What you'll understand by the end:** what the TypeScript compiler's config file controls, and what its most commonly-touched fields actually do.

**Prerequisites:** none.

## Setup

Node.js with TypeScript installed (`npm install --save-dev typescript` in a scaffolded project, or globally for standalone experimentation).

## The Problem

The TypeScript compiler (`tsc`) has many behaviors that can be tuned — which JavaScript version to target, how strict its checking should be, which files to check at all. Passing all of that as command-line flags every single invocation would be unworkable; a project needs one persistent, checked-in place to declare these choices once.

## The Isolated Example

```json
{
  "compilerOptions": {
    "target": "es2023",
    "noEmit": true,
    "noUnusedLocals": true
  },
  "include": ["src"]
}
```

With a file `src/main.ts` containing an unused local variable:
```typescript
function greet(): string {
  const unused = 42;
  return "hello";
}
console.log(greet());
```

Running:
```
npx tsc --noEmit
```

**Real output:**
```
src/main.ts:2:9 - error TS6133: 'unused' is declared but its value is never read.
```

**What this proves:** `tsc` read `tsconfig.json` automatically (no flags needed to point at it — it's found by convention in the project root) and applied `"noUnusedLocals": true` exactly as configured, flagging the unused variable as a real error, not a warning. Removing that one field from the config and rerunning would make the identical code compile with no complaint — the config file, not the code, decided whether this was an error at all.

## Mechanical Walkthrough

- `"compilerOptions"` holds the actual settings controlling how `tsc` checks and (optionally) compiles code.
- `"target"` selects which JavaScript language version the compiler assumes the output will run on — affects both what syntax is accepted as input assumptions and, when emitting real output, what the generated code looks like.
- `"noEmit": true` tells `tsc` to only perform type-checking, producing no `.js` output files at all — appropriate when another tool (like Vite) handles the actual compile-to-JavaScript step, leaving `tsc` purely as a verification pass.
- `"noUnusedLocals"` is one of several optional, stricter checks beyond TypeScript's baseline type checking — opinionated rules a project can turn on deliberately.
- `"include"` limits which files are checked at all — files outside the listed paths are invisible to this config entirely, not merely unchecked-but-included.

## CS Lens

This is a **compiler configuration file** — declaring, once, the exact rules a static analysis tool should apply to a codebase, so every invocation (whether from a terminal, an editor's live checking, or a CI pipeline) sees identical, consistent behavior rather than depending on whichever flags happened to be typed that time.

Also recognized in: `.eslintrc` (JavaScript linting rules), `pyproject.toml`'s `[tool.mypy]` section (Python's own static type checker), `.editorconfig` — any tool with configurable strictness or behavior tends to grow this same "one checked-in file, consistent everywhere" pattern.

## SE Lens

Turning on stricter checks like `noUnusedLocals` is a real, deliberate tradeoff: it catches real, if minor, mistakes (an unused variable is often a sign of a typo — code that meant to use one name but accidentally used another, leaving the first genuinely unused) before they can hide silently in a codebase, at the cost of occasionally flagging code that's unused on purpose (during work-in-progress, for instance) as an error rather than letting it pass silently. Teams and projects vary in how strict a `tsconfig.json` they choose specifically because this tradeoff has no universally correct answer — only a decision each project makes deliberately.

## Connection

Produced by `npm-project-scaffolding.md`'s generation step. Directly governs how `typescript-type-annotations.md`'s checking behaves — the annotations are the *what* to check; `tsconfig.json` decides *how strictly* and *which files*.

## Try It Yourself

1. Remove `"noUnusedLocals": true` from the config and rerun `npx tsc --noEmit` against the same unused-variable code. Confirm it now compiles with no error at all.
2. Add a file outside `src/` (e.g. a `scripts/build-helper.ts` at the project root) with an obvious type error in it, and confirm `npx tsc --noEmit` does *not* report it — proof `"include"` genuinely excludes it from checking, not just from the error list.
3. Change `"target"` to an old JavaScript version (e.g. `"es5"`) and use a newer language feature in your code (like an arrow function or `const`). Observe whether `tsc` down-levels it in emitted output, warns about it, or accepts it silently — and look up what "downleveling" means for compilers targeting older runtime versions.
