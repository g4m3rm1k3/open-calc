# Lesson F1.2: Generics

*File paths under src/... refer to the real manufacturing-platform repository's frontend. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A throwaway generic function, run through the real TypeScript compiler twice - once relying on its own real default type parameter, once overriding it explicitly - proving, with two real, contrasting compiler outputs, exactly what a generic type parameter buys and what it costs when a caller never supplies one. Then a real, mechanical count of every one of this app's own 72 real calls to its own generic apiRequest<T> function, answering a question the interface only makes possible to ask: how many of them actually supply a real type argument at all. The transferable problem: a generic parameter with a default is only as safe as the callers that actually override that default - declaring the capability and using it are two different real facts, and only one of them is true here.

**What you need to know first:** What a TypeScript interface and a type alias each check, and that both checks disappear entirely once code compiles to real, running JavaScript.

## Terms used in this lesson

- **Generic type parameter** — A placeholder type name - conventionally `T` - a function, interface, or type declares in angle brackets, filled in with a real, specific type at each real call site. It exists so one real function's signature can stay accurate for many different real shapes of data, instead of either losing all real type information (returning `any`) or needing a separate, hand-written copy of the same function per shape.
- **Default type parameter** — The `= X` part of `<T = X>`, giving a generic type parameter a real fallback type used whenever a caller doesn't supply one explicitly. It exists so a generic function stays callable without a type argument at all, at the real cost that every such call gets the real default type instead of one tailored to what that call actually returns.

## Objects and methods used

- **`apiRequest<T = any>`**
  - *What it is:* This app's own real, central function for every JSON API call it makes - and this app's own first real generic function.
  - *Implementation:* `export async function apiRequest<T = any>(url: string, options: RequestInit = {}): Promise<T>`, defined at src/utils/api.ts:326-329; its real body ends with a bare `return response.json();` at :380.
  - *Its use:* Called at 72 real, separate sites across this app's own components and hooks, confirmed this session by a real, mechanical count - every one of them without an explicit type argument.
  - *Type:* An async function, exported by its own module, generic over one real type parameter with a real default.
  - *Responsibility:* Attach real authentication headers, make the real HTTP request, translate a real non-2xx response into a real thrown Error, and hand back the real parsed JSON body - typed as whatever `T` the caller asked for, or `any` if the caller asked for nothing.
  - *Depends on:* fetchWithGitLabAuth (src/utils/api.ts:213) for the real authenticated request; a real caller to supply `T` if any real type safety is wanted.
  - *Connects to:* Its real return value flows, untyped in every real, confirmed case, directly into whatever a caller does next - e.g. TopBar.tsx:103's `setMachines(data.data || [])`, with `data` typed `any`.
  - *Shape:* Takes a real URL string and real fetch options; returns a real `Promise<T>` - `T` itself defaulting to `any` unless a caller explicitly overrides it, which this session confirmed never actually happens.

## Concept Unit: A Generic Type Parameter - One Real Function, Many Real Shapes

### The Problem

A function returning arbitrary real JSON data has two real, bad options without a generic parameter: return `any`, losing every real type check on the result, or hand-write a separate real function per real shape the data might take. A generic type parameter is TypeScript's real third option - one real function, whose real return type is filled in by each real caller.

Before reading on:

- If a function returns whatever `JSON.parse()` hands back with no generic parameter at all, what real type would that value have - and what would that mean for how many of its real properties you could access without a real compiler complaint?
- Given a generic parameter can carry a real default, `<T = X>`, what would you predict happens at a real call site that never supplies `T` explicitly?

### Project Change

- **Reference Source:** src/utils/api.ts:326-329,379-380, read verbatim this session.
- **Files affected:** `verification/frontend-phase-01/lab_generic_default.ts` (new)
- **Change type:** add
- **Location:** New file, alongside this phase's own earlier real labs, in the same verification/frontend-phase-01/ folder.
- **Dependencies:** TypeScript's own compiler, already installed in this project.

A small, throwaway TypeScript file, isolating what a generic parameter's real default actually does before reading this app's own real apiRequest<T> below - discarded once understood.

### The New Code

New code, typed into a new throwaway file - one call relying on the real default, one overriding it explicitly:

**File:** `verification/frontend-phase-01/lab_generic_default.ts` (new)

```typescript
function fetchThing<T = any>(): T {
    return JSON.parse('{}');
}

const untyped = fetchThing();
console.log(untyped.whatever.deeply.nested);

const typed = fetchThing<{ id: string }>();
console.log(typed.wrong);
```

### The Updated Project

**File:** `src/utils/api.ts` (already exists — read-only, nothing to type)

```typescript
export async function apiRequest<T = any>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    // The 'as T' tells TypeScript to trust our generic type
    return response.json();
}
```

### Mechanical Walkthrough

- `function fetchThing<T = any>(): T { return JSON.parse('{}'); }` — Declares a real generic function - `<T = any>` names a real type parameter with a real default of `any`; the real return type, `T`, is filled in per call rather than fixed once for the whole function. `JSON.parse` is a real, built-in method returning `any` regardless of what real data it parses (basic Web API) - real, load-bearing here, since it's exactly what lets this function compile at all without knowing the real shape in advance.
- `const untyped = fetchThing(); console.log(untyped.whatever.deeply.nested);` — Calls the real function with no explicit type argument, so `T` takes its real default, `any` - `untyped` is real `any`, and `any` permits reading any real property, real chain, with zero real compiler complaint, proven by this unit's own real compiler run producing no error on this line at all.
- `const typed = fetchThing<{ id: string }>(); console.log(typed.wrong);` — Calls the identical real function, this time explicitly supplying `T` as a real, one-field object shape - `typed` is now genuinely checked, and reading a real property that shape doesn't declare, `wrong`, is exactly what this unit's own real compiler run, below, catches.
- `export async function apiRequest<T = any>(url: string, options: RequestInit = {}): Promise<T> { ... return response.json(); }` — The identical real mechanism as the throwaway `fetchThing` above, now this app's own real, central API function - `Response.json()` is a real, built-in browser method (basic Web API) whose own declared return type is already `Promise<any>`, which is why `return response.json();` satisfies the declared `Promise<T>` with no real cast needed anywhere, contradicting the real comment directly above it, which claims a real `'as T'` cast exists - this session's own real search of this file found that exact phrase nowhere outside that one comment.

### CS Lens

A real instance of parametric polymorphism - one real function whose real type signature is expressed in terms of a placeholder, instantiated differently at each real call site, rather than one concrete implementation per real shape. The same general idea recurs constantly outside TypeScript: Java and C#'s own generic classes and methods (`List<T>`, `Optional<T>`); a SQL database's own generic `IN (?)` prepared-statement placeholder, filled with a real, specific value per real query; a Python function typed with `TypeVar` in a `.pyi` stub, expressing the identical real "same shape, filled in per call" relationship in a completely different real language.

### SE Lens

The real alternative not chosen: give `apiRequest` a fixed real return type, or none at all (`any`, unconditionally). Real, honest cost of the generic-with-a-default this app actually chose: it's only as real and safe as the callers that actually override the default - this unit's own throwaway lab already proved a call with no explicit `T` gets zero real property checking, the identical real situation this app's own comment, directly above `return response.json();`, claims doesn't happen ("trust our generic type") while the real code beneath it never actually enforces that trust with any real cast or runtime check at all.

### Commands needed

- `npx tsc --noEmit --strict --skipLibCheck verification/frontend-phase-01/lab_generic_default.ts` — Run from the manufacturing-platform repository root; confirms no real error on the untyped call's own property access, and a real TS2339 error on the explicitly-typed call's invalid property.

### Verification

```text
verification/frontend-phase-01/lab_generic_default.ts(9,19): error TS2339: Property 'wrong' does not exist on type '{ id: string; }'.
```

Full saved run: `verification/frontend-phase-01/lab_generic_default_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: A Generic Parameter This App Declares but Never Actually Supplies

### The Problem

The unit above showed `apiRequest<T>`'s real doc comment includes a real, worked example calling it with an explicit type argument. A worked example in a comment is a claim about how this function is meant to be used - not proof of how it's actually called, anywhere real, across this entire app.

Before reading on:

- Before searching: if a generic parameter has a real default, and every real call site happened to never override it, what real type would every one of those calls actually get, in practice - regardless of what the function's own doc comment shows as an example?

### Project Change

- **Reference Source:** src/components/layout/TopBar.tsx:102-103, read verbatim this session, as one concrete, real instance of the pattern this unit's own tool counts across the whole app.
- **Files affected:** `verification/frontend-phase-01/lab_count_generic_usage.py` (new)
- **Change type:** add
- **Location:** New file, alongside this phase's own earlier real labs, in the same verification/frontend-phase-01/ folder.
- **Dependencies:** Python's standard library re and pathlib modules only.

A real, mechanical tool, extending this phase's own earlier real search method from an import path to a real call-site shape - counting every real `apiRequest(` call against every real `apiRequest<` call, across this entire app at once.

### The New Code

New code, typed into a new throwaway file:

**File:** `verification/frontend-phase-01/lab_count_generic_usage.py` (new)

```python
import re
from pathlib import Path

bare_call = re.compile(r"\bapiRequest\(")
typed_call = re.compile(r"\bapiRequest<")

bare_count = 0
typed_count = 0

for path in sorted(Path("src").rglob("*.ts*")):
    if path.name == "api.ts":
        continue
    text = path.read_text(encoding="utf-8")
    bare_count += len(bare_call.findall(text))
    typed_count += len(typed_call.findall(text))

print(f"real apiRequest(...) call sites, no explicit type argument: {bare_count}")
print(f"real apiRequest<...>(...) call sites, WITH an explicit type argument: {typed_count}")
```

### The Updated Project

**File:** `src/components/layout/TopBar.tsx` (already exists — read-only, nothing to type)

```typescript
const data = await apiRequest(ENDPOINTS.MACHINES);
setMachines(data.data || []);
```

### Mechanical Walkthrough

- `bare_call = re.compile(r"\bapiRequest\("); typed_call = re.compile(r"\bapiRequest<")` — Two real regexes, distinguished only by the one real character right after the function's own name - `(` for a real call with no type argument, `<` for one that supplies one - a real word-boundary (`\b`) before `apiRequest` stops either from matching inside a longer real name (basic Python `re`).
- `if path.name == "api.ts": continue` — Skips the one real file that declares `apiRequest` itself and its own doc-comment example - this unit's real question is how this app's *other* real files call it, not how the function is documented (basic Python).
- `for path in sorted(Path("src").rglob("*.ts*")): text = path.read_text(encoding="utf-8"); bare_count += len(bare_call.findall(text)); typed_count += len(typed_call.findall(text))` — The same real, recursive glob this phase's earlier tools already used, now tallying every real match of both real patterns across every real file, instead of stopping at the first one (basic `pathlib`).
- `print(f"real apiRequest(...) call sites, no explicit type argument: {bare_count}") print(f"real apiRequest<...>(...) call sites, WITH an explicit type argument: {typed_count}")` — Reports both real totals side by side, so the real imbalance between them is the tool's own direct, printed output, not something a reader has to compute by hand.
- `const data = await apiRequest(ENDPOINTS.MACHINES); setMachines(data.data || []);` — One real, concrete instance of the exact pattern the tool above counted 72 of - `data` is real `any`, since `T` was never supplied, so `data.data` is read with zero real compiler check that a `data` field exists at all.

### CS Lens

Names a real gap between a capability and its real, actual use - the same general shape recurs constantly outside this codebase: a database index that exists but is never used by any real query plan; a library's own optional, more-precise API that real callers never reach for, defaulting to its loosest overload instead; a linter rule that's real and installed but never actually enabled in a real project's own configuration.

### SE Lens

The real alternative not chosen: making `T` required, with no real default, at `apiRequest`'s own declaration - `apiRequest<T>` instead of `apiRequest<T = any>`. Real, honest cost of that alternative: every one of this app's own 72 real existing call sites would become a real compile error the moment that default was removed, since none of them currently supply `T` - the real default is exactly what makes this app's own current, real, untyped usage pattern compile cleanly today. Real, honest cost of keeping the default instead, confirmed by this unit's own real count: the generic exists, is documented with a real worked example, and is never once exercised that way - a real capability this app pays to declare and never collects on.

### Commands needed

- `python verification/frontend-phase-01/lab_count_generic_usage.py` — Run from the manufacturing-platform repository root, same as this phase's earlier tools, so the relative path to src/ resolves correctly.

### Verification

```text
real apiRequest(...) call sites, no explicit type argument: 72
real apiRequest<...>(...) call sites, WITH an explicit type argument: 0
```

Full saved run: `verification/frontend-phase-01/lab_count_generic_usage_output.txt`.

### Connection to the previous unit

The unit above proved a generic parameter's real default matters at exactly the moment a caller skips it; this unit found, by real, mechanical count rather than a guess, that every one of this app's own 72 real callers does exactly that.

## Connect the pieces

One real throwaway `fetchThing<T = any>`, called twice - once getting real `any` and zero real checking, once getting a real, checked shape and one real caught error - proved exactly what this app's own real `apiRequest<T = any>` offers and what it costs when skipped. A real, mechanical count then answered the question the throwaway lab alone couldn't: not "what would happen" if a real call site skipped `T`, but how many of this app's own real call sites actually do - 72 of 72, confirmed, with `TopBar.tsx:102-103` standing in as one real, concrete instance of every one of them.

**Next lesson:** A real union type already seen inline on `Pairing`'s own `programType` field - this app's own real `'linear' | 'subprogram' | null` view-mode pattern, and what TypeScript actually does with a value once real code narrows which member of a union it is.