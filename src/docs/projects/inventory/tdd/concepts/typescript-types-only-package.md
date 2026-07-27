# Concept: Separate Type-Definition Packages (`@types/...`)

**What you'll understand by the end:** why some JavaScript libraries need a second, separate package installed just for TypeScript to understand them, and why that second package contributes nothing at runtime.

**Prerequisites:** `npm-package-json.md`, `typescript-interfaces.md`.

## Setup

Node.js with `npm` and TypeScript installed:
```
npm install --save-dev typescript
```

## The Problem

Many JavaScript libraries were written before TypeScript existed, or are maintained by authors who don't want to write TypeScript themselves — they ship as plain JavaScript, with no type information at all. TypeScript can still be used *with* such a library (calling its functions, using its objects), but without type information, every call into it is effectively `any` — no autocomplete, no compile-time checking of arguments, none of the benefits `typescript-type-annotations.md` demonstrated.

## The Isolated Example

A library published as plain JavaScript, no types:
```javascript
// node_modules/leftpad-demo/index.js
function leftpad(str, len, char) {
    while (str.length < len) str = char + str;
    return str;
}
module.exports = { leftpad };
```

Using it from TypeScript with no type package installed:
```typescript
import { leftpad } from "leftpad-demo";
const result = leftpad("5", 3, "0");
```

**Real `tsc` output:**
```
error TS7016: Could not find a declaration file for module 'leftpad-demo'.
```

Installing a separate types package (a real, common convention — here illustrated with the actual, real `@types/node` package, which supplies types for Node.js's own built-in modules, themselves plain JavaScript at their core):
```
npm install --save-dev @types/node
```

```typescript
import * as fs from "fs";
const contents: string = fs.readFileSync("data.txt", "utf-8");
```

**Real behavior:** this compiles cleanly, with full argument checking on `readFileSync`, purely because `@types/node` exists as a `devDependency` — `fs` itself (Node's real, built-in file-system module) is unchanged either way; only whether `tsc` can check it changes.

**What this proves:** the exact same JavaScript library runs identically whether or not its types package is installed — the types package changes nothing about runtime behavior, only what `tsc` is able to verify before that runtime behavior ever happens.

## Mechanical Walkthrough

- A library with no bundled types produces `error TS7016` the moment TypeScript code imports it — `tsc` refuses to assume anything about an untyped module's shape.
- `@types/<package-name>` is a real, community-maintained convention (the **DefinitelyTyped** project) publishing type declarations *only* — no executable code — for JavaScript libraries that don't ship their own.
- Once installed as a `devDependency` (never a regular dependency — see `npm-package-json.md`, since a browser or Node process never executes a `.d.ts` file, only `tsc` reads it), `tsc` matches it to the real library by package name automatically, with no import changes needed in the code that uses the library.
- Some libraries instead ship their *own* built-in types (a `.d.ts` file included directly in their own package) — for those, no separate `@types/` package exists or is needed; whether a library needs one has to be checked per-library, not assumed.

## Execution Trace

`leftpad`'s own real `while` loop, run at actual runtime (unaffected by
whether `tsc` can see its types) for `leftpad("5", 3, "0")`:

```
Start: str = "5" (length 1)
Check: str.length (1) < len (3)? → True
  str = "0" + "5" = "05" (length 2)
Check: str.length (2) < len (3)? → True
  str = "0" + "05" = "005" (length 3)
Check: str.length (3) < len (3)? → False → loop ends
Return: "005"
```

This loop runs identically whether `@types/leftpad-demo` is installed
or not — the `TS7016` error (before installing) and the clean compile
(after) both happen entirely at `tsc`-check time, before any of this
code has actually run even once. The runtime trace above is completely
unaffected by which of those two states `tsc` was in.

## CS Lens

This is **type information decoupled from implementation** — a real demonstration that a type system's checking and a program's actual runtime behavior are two entirely separate concerns that merely happen to usually travel together. Nothing stops them from being packaged, versioned, and shipped independently, which is exactly what `@types/` packages do.

Also recognized in: header files in C/C++ (declaring a function's signature separately from its compiled implementation), and any interface-definition language (IDL) used to describe an API's shape independently of whichever language actually implements it.

## SE Lens

A real, practical risk worth naming: an `@types/` package is maintained separately from the library it describes, by different people, on a different release schedule — it can drift out of sync (describing a method that no longer exists, or missing one that's new), producing a compile-time claim that isn't actually true of the real library at runtime. This is the same category of risk `typescript-non-null-assertion.md` names for `!` — unlike a same-package declaration (checked and shipped by the library's own maintainers, presumably kept in sync by construction), an `@types/` package is a second, independent, unverified claim about a library's shape.

## Connection

Builds on `npm-package-json.md`'s `devDependencies` distinction and `typescript-interfaces.md`'s idea of a named shape a value can be checked against — a `.d.ts` file is, at its core, a file full of interfaces and function-type declarations with no implementations behind them at all.

## Try It Yourself

1. Look up a real, popular JavaScript library on npm (e.g., search "lodash"), and check whether it ships its own types or requires a separate `@types/lodash` package — most package registries note this directly on the library's own page.
2. Deliberately install an outdated version of `@types/node` far behind your installed Node.js version, and try using a newer Node API not yet in that older types package — reproduce the `error TS7016`/"Could not find" or "Property does not exist" class of error this drift produces.
3. Write a tiny plain-JavaScript file with one function, then write a matching `.d.ts` file by hand describing its shape (`declare function myFunc(x: number): string;`), and import the JavaScript file from a TypeScript file in the same folder — confirm `tsc` picks up the hand-written declaration automatically once it's named to match.
