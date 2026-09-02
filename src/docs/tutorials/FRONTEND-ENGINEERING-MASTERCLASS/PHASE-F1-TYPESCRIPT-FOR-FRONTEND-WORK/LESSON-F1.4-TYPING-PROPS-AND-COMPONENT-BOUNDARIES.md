# Lesson F1.4: Typing Props and Component Boundaries

*File paths under src/... refer to the real manufacturing-platform repository's frontend. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A throwaway component-shaped function, proving with a real, executed compiler error that a props interface is checked at the exact real boundary between a component and whatever renders it - then a direct read of this app's own real NCFileDiffModalProps, where every one of seven real declared props is genuinely destructured and used. Then a real, mechanical check of a second real props interface, Model3DViewerProps, finding three of its five real declared props never actually read inside the component at all - including one, in one real caller, actually passed a real, deliberate value that the component silently never looks at. The transferable problem: a props interface is a real, checked contract only on the side that reads it - a caller can satisfy that contract completely and still have no guarantee the value they passed does anything at all.

**What you need to know first:** What a TypeScript interface checks, and that the check happens entirely before code runs, with nothing left in the compiled JavaScript.

## Terms used in this lesson

- **Component props interface** — A real, named interface declaring the exact real shape of data a component requires from whatever renders it, matched against a real, destructured function parameter. It exists so a component's own real requirements are checked at every real call site, the same way any other interface is checked, rather than discovered only once the component runs and reads a value that was never actually passed.

## Objects and methods used

- **`NCFileDiffModalProps`**
  - *What it is:* This app's own real, fully-consumed props interface for its file-diff modal - every one of its seven real declared fields is genuinely read inside the component.
  - *Implementation:* `interface NCFileDiffModalProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; oldContent: string; newContent: string; fileName: string; title?: string; }`, defined at src/components/parts/nc-files/NCFileDiffModal.tsx:6-14.
  - *Its use:* Matched, field for field, against the component's own real destructured parameter list at :16-24, including a real default value, `title = "Review Changes"`, for its one optional field.
  - *Type:* A TypeScript interface - a real, named compound type, not a class or a runtime value.
  - *Responsibility:* Guarantee every real caller of `NCFileDiffModal` supplies exactly the seven real fields the component's own real body depends on - two real callback props, three real strings, one real boolean, and one real optional string.
  - *Depends on:* Nothing - all seven of its real fields are primitives or real function types, not other named interfaces.
  - *Connects to:* Its own real `oldContent`/`newContent` fields flow directly into a real `diffLines` call inside the component; `isOpen` gates a real `useEffect` that only runs the diff when the modal is genuinely open.
  - *Shape:* Not a value itself - a compile-time-only shape seven real fields must satisfy: two real zero-argument functions, three real strings, one real boolean, and one real, optional string.

- **`Model3DViewerProps`**
  - *What it is:* This app's own real, partially-consumed props interface for its 3D model viewer wrapper - a real, direct contrast to NCFileDiffModalProps, above.
  - *Implementation:* `interface Model3DViewerProps { models: Model3D[]; operationId?: string; onModelSelect?: (model: Model3D) => void; showDownload?: boolean; onPointClick?: (event: any) => void; }`, defined at src/components/Model3DViewer.tsx:5-11.
  - *Its use:* Matched against the component's own real destructured parameter list at :26 - `{ models, onPointClick }` - two of its five real declared fields, not five.
  - *Type:* A TypeScript interface, structurally identical in kind to NCFileDiffModalProps, above.
  - *Responsibility:* Declares the real shape a caller must supply - but, confirmed by this session's own real, mechanical check, no longer describes what the component itself actually reads, since three of its five real fields are never destructured at all.
  - *Depends on:* Model3D (imported via a real type-only import), for its own `models` field's real element type.
  - *Connects to:* One of its three real, unread fields, `showDownload`, is genuinely passed a real, deliberate value - `showDownload={false}` - by a real caller, src/components/operator/OperationDetail.tsx:495, that the component never reads.
  - *Shape:* Not a value itself - a compile-time-only shape five real fields must satisfy, only two of which the real component body ever actually consumes.

## Concept Unit: A Component's Real Prop Interface, Fully Consumed

### The Problem

A React component reads whatever real values its caller passes it - but nothing about a plain JavaScript function stops a caller from leaving one out, or passing the wrong real shape entirely. TypeScript's interface, already proven checking a plain object's shape, checks the identical real boundary here - between a component and whatever renders it.

Before reading on:

- If a real component's props interface declares one required, non-optional field, and a real caller's JSX omits it entirely, when would you expect that to be caught - the moment the component is called, or only once the component's own body tries to read the missing value?

### Project Change

- **Reference Source:** src/components/parts/nc-files/NCFileDiffModal.tsx:6-24, read verbatim this session.
- **Files affected:** `verification/frontend-phase-01/lab_props_shape.ts` (new)
- **Change type:** add
- **Location:** New file, alongside this phase's own earlier real labs, in the same verification/frontend-phase-01/ folder.
- **Dependencies:** TypeScript's own compiler, already installed in this project.

A small, throwaway TypeScript file - a plain function shaped like a component, called once correctly and once missing a real required field - discarded once understood.

### The New Code

New code, typed into a new throwaway file:

**File:** `verification/frontend-phase-01/lab_props_shape.ts` (new)

```typescript
interface GreetingProps {
    name: string;
    excited?: boolean;
}

function formatGreeting({ name, excited }: GreetingProps): string {
    return excited ? `Hello, ${name}!!!` : `Hello, ${name}.`;
}

console.log(formatGreeting({ name: 'Ada' }));
console.log(formatGreeting({ excited: true }));
```

### The Updated Project

**File:** `src/components/parts/nc-files/NCFileDiffModal.tsx` (already exists — read-only, nothing to type)

```typescript
interface NCFileDiffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    oldContent: string;
    newContent: string;
    fileName: string;
    title?: string;
}

export function NCFileDiffModal({
    isOpen,
    onClose,
    onConfirm,
    oldContent,
    newContent,
    fileName,
    title = "Review Changes"
}: NCFileDiffModalProps) {
```

### Mechanical Walkthrough

- `interface GreetingProps { name: string; excited?: boolean; }` — The identical real interface mechanism already proven earlier this phase, now naming what a component-shaped function requires - one real required field, one real optional one.
- `function formatGreeting({ name, excited }: GreetingProps): string { ... }` — A real destructured parameter, typed by the interface directly - the same real shape React's own function components use for props, without needing React itself to prove the underlying mechanism.
- `console.log(formatGreeting({ name: 'Ada' }));` — A real call satisfying every required real field - this line alone produces no real error.
- `console.log(formatGreeting({ excited: true }));` — A real call omitting the one required real field, `name` - this exact line is what this unit's own real compiler run, below, catches.
- `interface NCFileDiffModalProps { isOpen: boolean; ... title?: string; }` — This app's own real, seven-field version of the identical pattern above - two real callback function types alongside the primitives, a real shape no plain JavaScript function signature alone could check.
- `export function NCFileDiffModal({ isOpen, onClose, onConfirm, oldContent, newContent, fileName, title = "Review Changes" }: NCFileDiffModalProps) {` — Every one of the interface's seven real fields appears, by name, in this real destructured parameter list - `title` alone carries a real default value, `"Review Changes"`, used only when a real caller's own `title` is genuinely absent, matching its own real `?` optional marker above.

### CS Lens

A real instance of an interface boundary applied specifically at a component's own real call site - the same general idea already proven on a plain object literal now checked on the arguments a real function is actually called with. The same general shape recurs constantly outside React: a REST API's own request schema, validated before a handler ever runs; a compiled language's own function signature, checked at every real call site against its real declaration; a message queue's own schema registry, rejecting a real message that doesn't match a topic's declared real shape before a consumer ever reads it.

### SE Lens

The real alternative not chosen: a plain, untyped destructured parameter, `function NCFileDiffModal({ isOpen, onClose, ... })` with no interface at all - real and legal JavaScript, and exactly what this app avoids here. Real, honest cost of the alternative: every one of this component's own real callers would lose real, compile-time proof they're passing everything the component actually needs, discovering a missing real field only once the component's own body tried to read `undefined` where a real value was expected - the identical real tradeoff already proven for a plain interface, now specifically at a component's own real boundary.

### Commands needed

- `npx tsc --noEmit --strict --skipLibCheck verification/frontend-phase-01/lab_props_shape.ts` — Run from the manufacturing-platform repository root; confirms no real error on the fully-satisfied call, and a real TS2345 error on the call missing a required field.

### Verification

```text
verification/frontend-phase-01/lab_props_shape.ts(11,28): error TS2345: Argument of type '{ excited: true; }' is not assignable to parameter of type 'GreetingProps'.
  Property 'name' is missing in type '{ excited: true; }' but required in type 'GreetingProps'.
```

Full saved run: `verification/frontend-phase-01/lab_props_shape_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: A Component's Real Prop Interface, Not Fully Consumed

### The Problem

The unit above checked that every one of a props interface's real fields is genuinely required from a caller - but nothing about that same interface checks the opposite real direction: whether the component itself actually reads every field it declares. Model3DViewerProps declares five real fields; this unit checks, mechanically, how many of them the component's own real body ever destructures at all.

Before reading on:

- If a real props interface declares an optional field the component's own body never destructures, would TypeScript's own interface check catch that - or does an interface only check what a caller must supply, never what the component itself actually does with it?
- A real caller passing a real, deliberate value for an unused prop would compile cleanly either way. What real, concrete effect would you expect that value to have once inside the component?

### Project Change

- **Reference Source:** src/components/Model3DViewer.tsx:5-11,26 and src/components/operator/OperationDetail.tsx:493-495, read verbatim this session.
- **Files affected:** `verification/frontend-phase-01/lab_check_props_consumed.py` (new)
- **Change type:** add
- **Location:** New file, alongside this phase's own earlier real labs, in the same verification/frontend-phase-01/ folder.
- **Dependencies:** Python's standard library re and pathlib modules only.

A real, mechanical tool comparing a real interface's own declared field names against a real component's own real destructured parameter list, extending this phase's earlier real "declared vs. actually used" method from a generic's type argument to a props interface's own individual fields.

### The New Code

New code, typed into a new throwaway file:

**File:** `verification/frontend-phase-01/lab_check_props_consumed.py` (new)

```python
import re
from pathlib import Path

text = Path("src/components/Model3DViewer.tsx").read_text(encoding="utf-8")

interface_match = re.search(r"interface Model3DViewerProps \{([^}]*)\}", text, re.DOTALL)
declared = re.findall(r"^\s*(\w+)\??:", interface_match.group(1), re.MULTILINE)

destructure_match = re.search(r"export function Model3DViewer\(\{([^}]*)\}", text)
destructured = [name.strip() for name in destructure_match.group(1).split(",")]

for prop in declared:
    status = "destructured and readable" if prop in destructured else "declared but never destructured"
    print(f"{prop}: {status}")
```

### The Updated Project

**File:** `src/components/Model3DViewer.tsx` (already exists — read-only, nothing to type)

```typescript
interface Model3DViewerProps {
    models: Model3D[];
    operationId?: string;
    onModelSelect?: (model: Model3D) => void;
    showDownload?: boolean;
    onPointClick?: (event: any) => void;
}

export function Model3DViewer({ models, onPointClick }: Model3DViewerProps) {
```

**File:** `src/components/operator/OperationDetail.tsx` (already exists — read-only, nothing to type)

```typescript
<Model3DViewer
    models={models}
    showDownload={false}
    onPointClick={async (e) => {
```

### Mechanical Walkthrough

- `text = Path("src/components/Model3DViewer.tsx").read_text(encoding="utf-8")` — Reads the real, current text of this one real component file - the same real `pathlib` habit this phase has used throughout (basic Python/stdlib).
- `interface_match = re.search(r"interface Model3DViewerProps \{([^}]*)\}", text, re.DOTALL)` — Captures the real interface's own body text between its braces; `re.DOTALL` lets `.` inside `[^}]*` match real newlines too, since a real multi-field interface body spans several real lines (basic Python `re`).
- `declared = re.findall(r"^\s*(\w+)\??:", interface_match.group(1), re.MULTILINE)` — Finds every real field name at the start of its own real line, immediately before an optional `?` and a real colon - `re.MULTILINE` makes `^` match the start of each real line inside the captured body, not just the start of the whole real string.
- `destructure_match = re.search(r"export function Model3DViewer\(\{([^}]*)\}", text); destructured = [name.strip() for name in destructure_match.group(1).split(",")]` — Captures the real destructured parameter list from the component's own real function signature, then splits it on real commas into a real list of exactly the names the component body can actually reference (basic Python).
- `for prop in declared: status = ... print(f"{prop}: {status}")` — Checks each real declared field against the real destructured list, printing a real, per-field verdict instead of one aggregate yes/no answer.
- `interface Model3DViewerProps { models: Model3D[]; operationId?: string; onModelSelect?: (model: Model3D) => void; showDownload?: boolean; onPointClick?: (event: any) => void; }` — Five real declared fields - only `models` and `onPointClick` are genuinely read anywhere in this component, confirmed by this unit's own real tool run, below.
- `export function Model3DViewer({ models, onPointClick }: Model3DViewerProps) {` — The real, actual destructured parameter list - two real names, not five; `operationId`, `onModelSelect`, and `showDownload` are declared in the interface directly above but never appear here at all.
- `<Model3DViewer models={models} showDownload={false} onPointClick={async (e) => {` — One real, concrete caller passing a real, deliberate value, `showDownload={false}`, for exactly one of the three real fields this session's own tool confirmed the component never destructures - this real prop compiles cleanly, satisfies the interface completely, and has no real effect anywhere inside the component it's passed to.

### CS Lens

Names a real interface satisfying its own contract on one side while silently dropping information on the other - the same general shape recurs constantly outside TypeScript: an HTTP API accepting a real request body with extra real fields it never reads, silently ignoring them rather than rejecting the request; a database `INSERT` supplying a real column value the receiving table has no real corresponding index or constraint using; a function accepting `**kwargs` in Python that only ever reads two of the real keys a caller might pass.

### SE Lens

The real alternative not chosen: removing the three real unused fields from `Model3DViewerProps` entirely, or genuinely wiring them into the component's own real body. Real, honest cost of leaving them as they are, confirmed directly by this unit's own tool and the one real caller cited above: a future reader of `OperationDetail.tsx:495` has every real reason to believe `showDownload={false}` does something - the interface accepts it, the prop name reads as meaningful, and nothing in this app, or TypeScript itself, warns that it's silently discarded. A props interface only ever checks that a caller supplied the right real shape - never that the component receiving it actually does anything with what it was given.

### Commands needed

- `python verification/frontend-phase-01/lab_check_props_consumed.py` — Run from the manufacturing-platform repository root, same as this phase's earlier tools, so the relative path to src/components/Model3DViewer.tsx resolves correctly.

### Verification

```text
models: destructured and readable
operationId: declared but never destructured
onModelSelect: declared but never destructured
showDownload: declared but never destructured
onPointClick: destructured and readable
```

Full saved run: `verification/frontend-phase-01/lab_check_props_consumed_output.txt`.

### Connection to the previous unit

The unit above proved a props interface is checked at a component's real boundary; this unit found that the same check only runs in one real direction - a caller can satisfy it completely while the component itself quietly ignores what it was given.

## Connect the pieces

One real throwaway `GreetingProps`, missing its one required real field, caught by the identical real interface mechanism already proven earlier this phase - the same real check this app's own `NCFileDiffModalProps` leans on for all seven of its real fields, in both directions, declared and destructured alike. One real, mechanical tool then found `Model3DViewerProps` failing that second real direction - three of five real declared fields never destructured - and one real, concrete caller, `OperationDetail.tsx:495`, already passing a real value, `showDownload={false}`, into exactly that real gap.

**Next lesson:** This app's own real component model, starting with what JSX actually compiles down to before any of this session's typed interfaces ever get involved.