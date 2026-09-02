# Lesson F1.1: Interfaces and Type Aliases

*File paths under src/... refer to the real manufacturing-platform repository's frontend. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A tiny, throwaway TypeScript file proving what an `interface` actually is - a real, compile-time-only shape check, enforced before this app ever runs, with zero trace left in the real, running program - then a direct read of three of this app's own real interfaces, from a flat shape to a genuinely nested one. Then the same isolate-then-apply sequence for `type` aliases, including a real, executed proof of the one thing an `interface` genuinely cannot do that a `type` alias can. The transferable problem: TypeScript's two ways of naming a shape look interchangeable in the simple case and are not, and the real boundary between them is something a compiler can prove, not something worth taking on faith.

**What you need to know first:** Nothing beyond ordinary JavaScript object literals and function calls - this is this curriculum's first TypeScript-specific concept.

## Terms used in this lesson

- **Interface** — TypeScript's way of naming a real object's shape - which fields exist and what type each one is - checked entirely before the code runs, with zero real representation left in the compiled JavaScript. It exists so a function or component can state, in one place, exactly what shape of value it requires, instead of that requirement living only in a reader's head or a comment.
- **Type alias** — A real, reusable name for any type expression - an object shape, a union of literal values, a primitive, a tuple - not only an object shape the way an interface is limited to. It exists so a type expression that would otherwise be repeated, or that isn't an object shape at all, gets one real name instead of being written out in full everywhere it's needed.
- **Union type** — A type built from two or more real types joined by `|`, meaning "a value that is genuinely one of these, never more than one at once." It exists so a field or parameter can be restricted to a real, closed set of possibilities instead of left as broad as `string` when only a handful of exact values are ever actually valid.
- **Record<K, V>** — A built-in TypeScript utility type describing a real object whose every key is of type `K` and whose every value is of type `V`. It exists so an object used as a lookup table gets its own real, checked shape instead of the looser `{ [key: string]: V }` index signature, which cannot guarantee every real key of `K` actually has an entry.
- **Type-only import** — An `import type { ... }` statement, importing only a name's real type information, never a real runtime value. It exists so a build tool can safely erase the whole import at compile time, confirming, by construction, that nothing imported this way is ever actually used as a real value at runtime.

## Objects and methods used

- **`Pairing`**
  - *What it is:* This app's own real interface for one CAM-file/machine pairing - the real, selectable item the Operations Manager works with.
  - *Implementation:* `export interface Pairing { id: string; camFileId: string; camFileName: string; machineId: string; machineName: string; programType: 'linear' | 'subprogram' | 'unknown'; partId: string; }`, defined at src/hooks/operations/useOperationsAPI.ts:45-53.
  - *Its use:* Used as the real element type of the pairings array read throughout src/hooks/useProgrammerOperations.ts - e.g. `pairings.find((p: Pairing) => p.id === selectedPairing)` (:210).
  - *Type:* A TypeScript interface - a real, named compound type, not a class or a runtime value.
  - *Responsibility:* Guarantee every real pairing object flowing through this app's Operations Manager carries the same seven real fields, so code reading any one of them never has to check whether a given pairing happens to have a `machineName` or a `programType`.
  - *Depends on:* Nothing - every one of its seven fields is a primitive or a real, closed union, not another named type.
  - *Connects to:* Read by every real function in useProgrammerOperations.ts that looks up a pairing by id; its own `programType` field is this app's real union type, defined inline rather than as its own named alias.
  - *Shape:* Not a value itself - a compile-time-only shape seven real fields must satisfy: six real strings and one real union of three exact string literals.

- **`SavedOrderResponse`**
  - *What it is:* This app's own real interface for what GET /api/operation-orders/{id} actually returns - a genuinely nested shape, one level deeper than Pairing.
  - *Implementation:* `export interface SavedOrderResponse { data: { pairingId: string; sequenceOrder: Array<{ sequenceId: string; order: number }>; masterObject: MasterObject | null; isDefault: boolean; }; }`, defined at src/hooks/operations/useOperationsAPI.ts:59-66.
  - *Its use:* Named as the real resolved type of `fetchSavedOrder`'s own return value, `Promise<SavedOrderResponse | null>` (useOperationsAPI.ts:191).
  - *Type:* A TypeScript interface, one field deep - its own `data` field is itself an inline object shape, not a separately named interface.
  - *Responsibility:* Pin down the real, complete shape of one specific backend response, so nothing reading it has to guess whether `sequenceOrder` is an array of objects or an array of plain numbers.
  - *Depends on:* MasterObject, below, for its own `data.masterObject` field's real type.
  - *Connects to:* Returned, wrapped in a real Promise, by `fetchSavedOrder` (useOperationsAPI.ts:191); re-exported as a real type-only export from src/hooks/operations/index.ts:39.
  - *Shape:* Not a value itself - a compile-time-only shape requiring one real `data` object, itself requiring a real string, a real array of `{sequenceId, order}` pairs, a real `MasterObject` or `null`, and a real boolean.

- **`MasterObject`**
  - *What it is:* This app's own real interface for the full, serialized UI state it saves to the database - the deepest-nested real shape in this file.
  - *Implementation:* `export interface MasterObject { numParts: number; workOffsets: Record<string, string[]>; sequences: Array<{ id: string; subprograms: Array<{ id: string; operationId: string; partIndex: number; pNumber: string; }>; }>; }`, defined at src/hooks/operations/useOperationsAPI.ts:73-85.
  - *Its use:* Used across src/hooks/operations/useOperationsState.ts and src/hooks/useProgrammerOperations.ts wherever this app reads or rebuilds a pairing's saved custom order.
  - *Type:* A TypeScript interface, two real levels deep - `sequences` is a real array of objects, each itself containing a real, nested array of `subprograms`.
  - *Responsibility:* Pin down the real, complete shape of this app's own serialized customization state, so a value read back from the database can be trusted to have exactly the fields the reconciliation logic elsewhere in this app depends on.
  - *Depends on:* Nothing external - `Record<string, string[]>` and the two nested `Array<{...}>` shapes are both built from TypeScript's own real, built-in constructs.
  - *Connects to:* Read as `SavedOrderResponse`'s own `data.masterObject` field, above; written back to the database whenever this app saves a custom order.
  - *Shape:* Not a value itself - a compile-time-only shape requiring a real number, a real `Record` keyed by string with string-array values, and a real, two-level-nested array of sequence/subprogram objects.

- **`PartStatus`**
  - *What it is:* This app's own real type alias for a part's lifecycle state - the direct contrast to the three interfaces above, since it names a union of string literals, not an object shape.
  - *Implementation:* `export type PartStatus = 'draft' | 'pending_approval' | 'approved' | 'released' | 'archived';`, defined at src/types/index.ts:108-113.
  - *Its use:* Used as the real key type of `statusConfig`, a real `Record<PartStatus, {...}>` lookup table in src/components/parts/PartCard.tsx:10.
  - *Type:* A TypeScript type alias naming a union of five real string literals - not an object shape, so `interface` could never declare it.
  - *Responsibility:* Name this app's own real, closed set of five valid part-lifecycle values in one place, so every real usage - a filter, a badge, a lookup table - draws from the identical five values instead of each independently retyping the same five strings.
  - *Depends on:* Nothing - a union of literal values needs no other named type.
  - *Connects to:* Imported via a real type-only import at src/components/parts/PartCard.tsx:4; used as `Record<PartStatus, {...}>`'s own real key type at :10, alongside four other real files this session confirmed also import it.
  - *Shape:* Not a value itself - a compile-time-only shape any real value assigned to it must satisfy: it must equal exactly one of five real strings, character for character, nothing else.

## Concept Unit: Interface - A Real Object Shape, Checked Before This App Ever Runs

### The Problem

JavaScript alone has no real way to say "this value must have exactly these fields, of exactly these types" before the code runs - a missing or misspelled field only fails once that field is actually read, often far from where the bad value was created. TypeScript's `interface` exists to catch that gap earlier - but "earlier" needs a real, precise meaning, not just a vague promise.

Before reading on:

- If a real object is missing one field an interface requires, when would you expect TypeScript to catch that - the moment the object is written, or only once some later code tries to read the missing field?
- Once compiled to real, running JavaScript, would you expect any trace of the interface itself to still exist - a real check, a real object, anything - or nothing at all?

### Project Change

- **Reference Source:** src/hooks/operations/useOperationsAPI.ts:45-85, read verbatim this session.
- **Files affected:** `verification/frontend-phase-01/lab_interface_shape.ts` (new)
- **Change type:** add
- **Location:** New file, a new verification/frontend-phase-01/ folder for this phase's own real, executed checks.
- **Dependencies:** TypeScript's own compiler, already installed in this project (confirmed: `npx tsc --version` reports 5.6.3).

A small, throwaway TypeScript file, isolating the one concept this unit teaches before reading this app's own real interfaces below - discarded once understood; nothing in it becomes part of this app's real source.

### The New Code

New code, typed into a new throwaway file - a made-up `Point` interface, one value that satisfies it, and one that doesn't:

**File:** `verification/frontend-phase-01/lab_interface_shape.ts` (new)

```typescript
interface Point {
    x: number;
    y: number;
}

const good: Point = { x: 1, y: 2 };
console.log(good);

const bad: Point = { x: 1 };
```

### The Updated Project

**File:** `src/hooks/operations/useOperationsAPI.ts` (already exists — read-only, nothing to type)

```typescript
export interface Pairing {
    id: string;
    camFileId: string;
    camFileName: string;
    machineId: string;
    machineName: string;
    programType: 'linear' | 'subprogram' | 'unknown';
    partId: string;
}

export interface SavedOrderResponse {
    data: {
        pairingId: string;
        sequenceOrder: Array<{ sequenceId: string; order: number }>;
        masterObject: MasterObject | null;
        isDefault: boolean;
    };
}

export interface MasterObject {
    numParts: number;
    workOffsets: Record<string, string[]>;
    sequences: Array<{
        id: string;
        subprograms: Array<{
            id: string;
            operationId: string;
            partIndex: number;
            pNumber: string;
        }>;
    }>;
}
```

### Mechanical Walkthrough

- `interface Point { x: number; y: number; }` — Declares a real, named object shape - any real value later typed as `Point` must carry exactly these two real fields, each a real `number` - checked entirely by the compiler, never by any code that actually runs.
- `const good: Point = { x: 1, y: 2 };` — A real object literal satisfying every real field `Point` requires - this line alone produces no real error.
- `const bad: Point = { x: 1 };` — A real object literal missing its required real `y` field - this exact line is what this unit's own real compiler run, below, catches.
- `export interface Pairing { id: string; ... partId: string; }` — The identical real mechanism as the throwaway `Point` above, now with seven real fields instead of two - one real union type, `'linear' | 'subprogram' | 'unknown'`, sits inline as `programType`'s own real type, restricting it to exactly three real values rather than any `string`.
- `export interface SavedOrderResponse { data: { ... }; }` — A real interface one level deeper than `Pairing` - its own single field, `data`, is itself an inline object shape, not a plain primitive; `sequenceOrder`'s own real type, `Array<{ sequenceId: string; order: number }>`, requires every real array element to independently satisfy that same two-field shape.
- `export interface MasterObject { numParts: number; workOffsets: Record<string, string[]>; sequences: Array<{ id: string; subprograms: Array<{ ... }>; }>; }` — The real, deepest shape in this file - `workOffsets` uses the real, built-in `Record<string, string[]>` utility type (a real object keyed by `string`, every value a real array of strings); `sequences` nests a second real array, `subprograms`, two real levels inside the outer one.

### CS Lens

A real instance of static typing - checking a value's real shape against a declared contract before the program ever runs, rather than discovering a mismatch only once running code actually touches the missing piece. The same general idea recurs constantly outside TypeScript: a database schema rejecting an insert with a missing required column before the row is ever stored; a function's own parameter list in a statically-typed language like Java or C# rejecting a call with the wrong argument count at compile time; a JSON Schema validator rejecting a malformed payload before an API handler ever reads a field from it.

### SE Lens

The real alternative not chosen: skip the interface entirely and let a missing field surface later, as a real runtime error the moment some other code reads `undefined` where it expected a real value - exactly what plain JavaScript already does, and exactly what this app's own real, growing `useOperationsAPI.ts` avoids for every one of its real API responses. Real, honest cost: an interface only checks the *shape* declared - `Pairing`'s own real `programType` field accepts any of its three real listed strings, but nothing about the interface itself checks that a real `camFileId` actually refers to a CAM file that still exists: shape correctness and referential correctness are two different real guarantees, and only the first is what an interface gives.

### Commands needed

- `npx tsc --noEmit --strict --skipLibCheck verification/frontend-phase-01/lab_interface_shape.ts` — Run from the manufacturing-platform repository root. --noEmit checks types without writing a real .js file; --strict enables TypeScript's full real strictness; --skipLibCheck skips checking this project's own installed library type declarations, so only this lab file's own real errors are reported.

### Verification

```text
verification/frontend-phase-01/lab_interface_shape.ts(9,7): error TS2741: Property 'y' is missing in type '{ x: number; }' but required in type 'Point'.
```

Full saved run: `verification/frontend-phase-01/lab_interface_shape_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: Type Alias - Naming What an Interface Cannot

### The Problem

`Pairing`'s own real `programType` field, above, restricts a value to one of three exact strings - but that restriction is written inline, unnamed, and would have to be retyped, identically, at every other real place this app needed the same real restriction. This app's own real `PartStatus` names that exact pattern once, using `type` instead of `interface` - and one of those two real keywords genuinely cannot do this at all.

Before reading on:

- Given that a union of string literals - `'draft' | 'approved'` - isn't a real object shape at all, what would you predict happens if you try to declare it using `interface` instead of `type`?
- This app's own PartStatus names five real, valid part states. What real, concrete benefit does giving that union a name buy, beyond saving a few characters of typing?

### Project Change

- **Reference Source:** src/types/index.ts:108-113 and src/components/parts/PartCard.tsx:4,10, read verbatim this session.
- **Files affected:** `verification/frontend-phase-01/lab_type_alias.ts` (new), `verification/frontend-phase-01/lab_interface_cannot_alias_union.ts` (new), `verification/frontend-phase-01/lab_declaration_merging_check.ts` (new), `verification/frontend-phase-01/lab_type_cannot_merge.ts` (new)
- **Change type:** add
- **Location:** New files, alongside this unit's own earlier real lab, in the same verification/frontend-phase-01/ folder.
- **Dependencies:** TypeScript's own compiler, already installed in this project.

Two small, throwaway TypeScript files - one showing a real type alias behaving the same way the interface lab did above, one proving the real syntax boundary between the two keywords - both discarded once understood.

### The New Code

Two new throwaway files. First, a type alias with a valid and an invalid value, the same shape as this unit's own interface lab above:

**File:** `verification/frontend-phase-01/lab_type_alias.ts` (new)

```typescript
type Status = 'draft' | 'approved';

const good: Status = 'draft';
console.log(good);

const bad: Status = 'pending';
```

**File:** `verification/frontend-phase-01/lab_interface_cannot_alias_union.ts` (new)

```typescript
interface Status = 'draft' | 'approved';
```

### The Updated Project

**File:** `src/types/index.ts` (already exists — read-only, nothing to type)

```typescript
export type PartStatus =
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'released'
    | 'archived';
```

**File:** `src/components/parts/PartCard.tsx` (already exists — read-only, nothing to type)

```typescript
import type { Part, PartStatus } from '@/types';

const statusConfig: Record<PartStatus, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'badge bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400' },
    pending_approval: { label: 'Pending', className: 'badge bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' },
    approved: { label: 'Approved', className: 'badge bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
    released: { label: 'Released', className: 'badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
    archived: { label: 'Archived', className: 'badge bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-500' },
};
```

### Mechanical Walkthrough

- `type Status = 'draft' | 'approved';` — Names a real union of two string literals - the real `type` keyword, followed by `=`, aliasing a type expression rather than declaring an object shape the way `interface` does.
- `const bad: Status = 'pending';` — A real string that isn't one of the union's two real members - this line is what this unit's own first real compiler run, below, catches.
- `interface Status = 'draft' | 'approved';` — The real, structural boundary this unit exists to prove: `interface` requires a real `{ ... }` object-shape body after its name, never a bare type expression after `=` - this line is a real syntax error, not a type error, caught by this unit's own second real compiler run, below.
- `export type PartStatus = | 'draft' | 'pending_approval' | 'approved' | 'released' | 'archived';` — This app's own real, five-member version of the identical throwaway pattern above - a real, closed set of exactly five valid part-lifecycle strings, named once.
- `import type { Part, PartStatus } from '@/types';` — A real type-only import - `PartStatus` is imported purely for its real type information; nothing about this import survives into the real, compiled JavaScript this app actually ships.
- `const statusConfig: Record<PartStatus, { label: string; className: string }> = { draft: {...}, pending_approval: {...}, approved: {...}, released: {...}, archived: {...} };` — A real, concrete payoff of naming the union: `Record` requires a real entry for every one of `PartStatus`'s five real members, so this real object literal is checked by the compiler for real completeness - a sixth, misspelled key, or a missing one, would be a real compile error here, the exact same class of error this unit's own first lab already proved, now enforced across five real cases at once instead of one.

### CS Lens

Names a real completeness/exhaustiveness check - the same general idea recurs constantly outside TypeScript: a `switch` statement over an enum in Java or C#, where the compiler can warn on a missing case; a pattern match in a functional language like Haskell or Rust, refusing to compile if not every real variant of a type is handled; a database `CHECK` constraint restricting a column to a real, closed set of values, the identical guarantee `PartStatus` gives this app's own frontend, enforced on a different real side of the same application.

### SE Lens

The real alternative not chosen: leaving `programType`'s inline union in `Pairing`, above, unnamed, and retyping `'draft' | 'pending_approval' | 'approved' | 'released' | 'archived'` by hand at every one of the five real files this session confirmed import `PartStatus`. Real, honest cost of that alternative: five independent, unlinked copies of the same real set of values, with nothing forcing them to stay in sync if a sixth real status were ever added - a single named type alias instead makes every real usage site derive from the same one real declaration. Real, honest limitation of `type` itself, confirmed by two more real, executed checks this session: two separate `interface Merged` declarations compile cleanly and genuinely merge into one real shape requiring both fields, while the identical pattern written with `type` instead is a real compile error, `TS2300: Duplicate identifier`. TypeScript's own declaration-merging feature only works on `interface`, never `type` - a real, structural tradeoff neither keyword avoids entirely.

### Commands needed

- `npx tsc --noEmit --strict --skipLibCheck verification/frontend-phase-01/lab_type_alias.ts` — Run first, from the manufacturing-platform repository root; confirms the real type-mismatch error on `bad`, the same class of error this unit's own interface lab already proved.
- `npx tsc --noEmit --strict --skipLibCheck verification/frontend-phase-01/lab_interface_cannot_alias_union.ts` — Run second, independently, since it checks a different real file; confirms the real syntax boundary between interface and type.
- `npx tsc --noEmit --strict --skipLibCheck verification/frontend-phase-01/lab_declaration_merging_check.ts` — Run third; confirms two separate real `interface Merged` declarations compile cleanly and genuinely merge, supporting the SE Lens's own real tradeoff claim, below.
- `npx tsc --noEmit --strict --skipLibCheck verification/frontend-phase-01/lab_type_cannot_merge.ts` — Run fourth, independently; confirms the identical pattern written with `type` instead is a real compile error, not a real merge.

### Verification

```text
verification/frontend-phase-01/lab_type_alias.ts(6,7): error TS2322: Type '"pending"' is not assignable to type 'Status'.
verification/frontend-phase-01/lab_interface_cannot_alias_union.ts(1,18): error TS1005: '{' expected.
verification/frontend-phase-01/lab_declaration_merging_check.ts: (no output - compiled clean, exit code 0)
verification/frontend-phase-01/lab_type_cannot_merge.ts(1,6): error TS2300: Duplicate identifier 'Merged'.
verification/frontend-phase-01/lab_type_cannot_merge.ts(4,6): error TS2300: Duplicate identifier 'Merged'.
```

Full saved run: `verification/frontend-phase-01/lab_type_alias_output.txt, lab_interface_cannot_alias_union_output.txt, lab_declaration_merging_check_output.txt, and lab_type_cannot_merge_output.txt`.

### Connection to the previous unit

The unit above proved `interface` checks a real object shape; this unit proved `type` checks any real type expression, including one `interface` cannot even syntactically express, then found the identical real completeness guarantee already at work in this app's own real `PartCard.tsx`.

## Connect the pieces

One real throwaway `Point`, missing one real field, caught by TypeScript before any real code ran - the identical real mechanism this app's own `Pairing`, `SavedOrderResponse`, and `MasterObject` lean on at increasing real depth, from seven flat fields to a real, two-level-nested array. One real throwaway `Status` union, and one real proof that `interface` cannot express it at all - the identical real boundary this app's own `PartStatus` sits on, now put to real work in `PartCard.tsx`'s own `Record<PartStatus, {...}>`, where naming the union once lets the compiler check all five real cases are handled, together, in one place.

**Next lesson:** Applying the same real "checked before it runs" idea to a function whose own real parameter and return types change depending on what it's called with - this app's own real, generic `apiRequest<T>`.