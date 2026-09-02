# Lesson F2.2: Props and Composition

*File paths under src/... refer to the real manufacturing-platform repository's frontend. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A throwaway pair of components proving, with a real, executed compiler error, that one component's own real data shape is never automatically another's - composing two components means a real, written transformation bridges them, or nothing compiles. Then a direct trace of this app's own real composition, Model3DViewer wrapping OBJViewer - two real, differently-shaped props interfaces, and the one real function, buildUrl, standing between them, run against four real, escalating inputs to prove its own real branching behavior rather than assert it. The transferable problem: composing components is not passing data through unchanged - it's each layer choosing what of its own real shape to keep, drop, or transform before the next layer ever sees it.

**What you need to know first:** What a props interface checks at a component's own real call-site boundary, and what JSX itself compiles down to before any of that checking or rendering happens.

## Terms used in this lesson

- **Composition** — React's real, primary way of building a larger UI out of smaller ones - one component rendering another inside its own JSX, passing it real, specific props - rather than a class extending another class the way object-oriented inheritance would. It exists because a UI's real, natural structure is already a tree of nested pieces, and composing components mirrors that structure directly instead of building a rigid, single-parent inheritance chain that has to be decided in advance.

## Objects and methods used

- **`Model3DViewerProps`**
  - *What it is:* This app's own real props interface for the outer, composing half of this lesson's real example - already characterized earlier this curriculum, given full treatment again here per this schema's own repetition rule.
  - *Implementation:* `interface Model3DViewerProps { models: Model3D[]; operationId?: string; onModelSelect?: (model: Model3D) => void; showDownload?: boolean; onPointClick?: (event: any) => void; }`, defined at src/components/Model3DViewer.tsx:5-11.
  - *Its use:* Its one real, consumed field with a nontrivial shape, `models: Model3D[]`, is what this unit's own transformation, buildUrl, ultimately exists to unpack into OBJViewerProps' own, differently-shaped real fields below.
  - *Type:* A TypeScript interface - a real, named compound type, not a class or a runtime value.
  - *Responsibility:* Declare the real shape this app's own callers must supply to Model3DViewer - a real array of domain objects, not yet the individual real URL strings the component it wraps actually needs.
  - *Depends on:* Model3D (a real, imported type) for its own models field's element type.
  - *Connects to:* Its real models field is read, filtered by category, and passed through buildUrl before ever reaching OBJViewerProps, below - the two interfaces never share a field name in common.
  - *Shape:* Not a value itself - a compile-time-only shape five real fields must satisfy, only two of which (models, onPointClick) this component's own body ever reads.

- **`OBJViewerProps`**
  - *What it is:* OBJViewer's own real props interface - the receiving half of this lesson's real composition example, genuinely different in shape from Model3DViewerProps, above.
  - *Implementation:* `interface OBJViewerProps { modelUrl?: string; stockModelUrl?: string; initialStockModelUrl?: string; partModelUrl?: string; fixtureModelUrl?: string; backgroundColor?: string; onPointClick?: (event: any) => void; }`, defined at src/components/operator/OBJViewer.tsx:24-39.
  - *Its use:* Five of its seven real fields are individual, optional real URL strings - genuinely incompatible with Model3DViewerProps' single `models` array field, confirmed directly by this unit's own throwaway lab proving the analogous shape mismatch is a real compile error.
  - *Type:* A TypeScript interface, structurally identical in kind to Model3DViewerProps, above.
  - *Responsibility:* Declare exactly what OBJViewer itself needs to render - five real, individual model URLs, each independently optional, plus a real background color and a real click callback - with zero real knowledge that any of them ever came from a `Model3D[]` array at all.
  - *Depends on:* Nothing external - all seven of its real fields are primitives or a real function type.
  - *Connects to:* Every one of its five real URL fields is supplied by a separate, real call to buildUrl inside Model3DViewer's own JSX.
  - *Shape:* Not a value itself - a compile-time-only shape seven real, mostly-optional fields must satisfy, none of them named `models`.

- **`buildUrl`**
  - *What it is:* This app's own real, small function bridging Model3DViewerProps' single array field and OBJViewerProps' five separate string fields - the actual, concrete mechanism this lesson's own transformation claim rests on.
  - *Implementation:* `const buildUrl = (path: string | undefined): string | undefined => { if (!path) return undefined; if (path.startsWith('http')) return path; const separator = path.startsWith('/') ? '' : '/'; return \`${API_BASE_URL}${separator}${path}\`; };`, defined inline at src/components/Model3DViewer.tsx:35-40.
  - *Its use:* Called once per real model category inside Model3DViewer's own JSX - five separate real calls, one per OBJViewerProps field it fills in.
  - *Type:* An arrow function, defined locally inside Model3DViewer - not exported, not shared with any other real component.
  - *Responsibility:* Turn one real, possibly-relative, possibly-absent path from a Model3D object into either `undefined`, an unchanged real absolute URL, or a real, correctly-joined absolute URL - three genuinely different real outcomes from one real input shape.
  - *Depends on:* API_BASE_URL (src/utils/env.ts:29), this app's own real, dynamically-computed base URL - not a fixed literal, confirmed by reading its own real definition this session.
  - *Connects to:* Called with each real model's own `filePath` field; its real return value is passed directly into one of OBJViewerProps' five real URL fields.
  - *Shape:* Takes one real string or `undefined`; returns one real string or `undefined` - never throws, never returns any other real shape.

## Concept Unit: Composition - One Component's Props Aren't Automatically Another's

### The Problem

One real component rendering another inside its own JSX doesn't mean the outer component's own real data can just be handed straight to the inner one - the two components' real props interfaces can be, and often are, genuinely different real shapes. Does TypeScript let a real value satisfying one real shape stand in for a different one, or does composing two components require a real, written bridge between them?

Before reading on:

- If an outer component receives a real object with three real fields, and the component it renders declares a real props interface requiring one different, derived field instead, what real, concrete step has to happen between receiving the first shape and rendering the second?

### Project Change

- **Reference Source:** src/components/Model3DViewer.tsx:5-11 and src/components/operator/OBJViewer.tsx:24-39, read verbatim this session.
- **Files affected:** `verification/frontend-phase-02/lab_composition_transform.ts` (new)
- **Change type:** add
- **Location:** New file, alongside this phase's own earlier real labs, in the same verification/frontend-phase-02/ folder.
- **Dependencies:** TypeScript's own compiler, already installed in this project.

A small, throwaway TypeScript file - two real, differently shaped interfaces, and one function called correctly, then incorrectly - discarded once understood.

### The New Code

New code, typed into a new throwaway file:

**File:** `verification/frontend-phase-02/lab_composition_transform.ts` (new)

```typescript
interface UserRecord {
    id: string;
    firstName: string;
    lastName: string;
}

interface NameTagProps {
    displayName: string;
}

function NameTag(props: NameTagProps): string {
    return props.displayName;
}

function UserRow(user: UserRecord): string {
    return NameTag({ displayName: `${user.firstName} ${user.lastName}` });
}

function UserRowWrong(user: UserRecord): string {
    return NameTag(user);
}
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
```

**File:** `src/components/operator/OBJViewer.tsx` (already exists — read-only, nothing to type)

```typescript
interface OBJViewerProps {
    modelUrl?: string;
    stockModelUrl?: string;
    initialStockModelUrl?: string;
    partModelUrl?: string;
    fixtureModelUrl?: string;
    backgroundColor?: string;
    onPointClick?: (event: any) => void;
}
```

### Mechanical Walkthrough

- `interface UserRecord { id: string; firstName: string; lastName: string; }` — A real, throwaway "outer" shape - three real fields, none of them named `displayName`, the one real field the component it will render actually requires.
- `function NameTag(props: NameTagProps): string { return props.displayName; }` — A real, throwaway "inner" component-shaped function - its own real props interface is genuinely incompatible with `UserRecord`, sharing zero real field names.
- `function UserRow(user: UserRecord): string { return NameTag({ displayName: `${user.firstName} ${user.lastName}` }); }` — The real, correct composition - a real, written transformation, a template literal combining two of `UserRecord`'s own real fields into the one real field `NameTagProps` actually requires. This line alone produces no real error.
- `function UserRowWrong(user: UserRecord): string { return NameTag(user); }` — Skips the real transformation entirely, passing `user` straight through - this exact line is what this unit's own real compiler run, below, catches.
- `interface Model3DViewerProps { models: Model3D[]; ... }` — This app's own real "outer" shape - the identical real relationship as the throwaway `UserRecord` above, now with a real `models` array field instead of two real name fields.
- `interface OBJViewerProps { modelUrl?: string; ... }` — This app's own real "inner" shape - five real, individual URL fields, none of them named `models`, the identical real incompatibility this unit's own throwaway lab already proved a compiler catches when skipped.

### CS Lens

A real instance of composition over inheritance - building a larger real structure by nesting smaller, independent real pieces together, each with its own real, self-contained contract, rather than by extending a shared real base class. The same general idea recurs constantly outside React: Unix's own real pipe operator, composing small, independent real programs instead of building one monolithic one; a real database view, composed from several real underlying tables without any of them needing to share a common real schema; functional programming's own real function composition, `g(f(x))`, chaining two real, independently-typed functions through exactly the same kind of real, written bridge.

### SE Lens

The real alternative not chosen: giving OBJViewer the identical real props shape as Model3DViewer, so no real transformation is ever needed between them. Real, honest cost of that alternative: OBJViewer would be permanently coupled to Model3DViewerProps' own real shape, unusable by any other real caller with a differently shaped real model list - confirmed directly by this app's own real structure, where OBJViewer is the shared, reusable real component and Model3DViewer exists specifically as the real, one-off translation layer adapting one real domain shape to it.

### Commands needed

- `npx tsc --noEmit --strict --skipLibCheck verification/frontend-phase-02/lab_composition_transform.ts` — Run from the manufacturing-platform repository root; confirms no real error on the correctly-transformed call, and a real TS2345 error on the call skipping the transformation.

### Verification

```text
verification/frontend-phase-02/lab_composition_transform.ts(20,20): error TS2345: Argument of type 'UserRecord' is not assignable to parameter of type 'NameTagProps'.
  Property 'displayName' is missing in type 'UserRecord' but required in type 'NameTagProps'.
```

Full saved run: `verification/frontend-phase-02/lab_composition_transform_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: buildUrl - The Real, Concrete Transformation Bridging Them

### The Problem

The unit above proved a transformation has to exist between two genuinely different real props shapes - but proving one exists isn't the same as knowing what it actually does with every real real-world input it might receive. This app's own real buildUrl function branches three separate real ways; this unit runs it against four real, escalating inputs to find out which branch each one actually takes.

Before reading on:

- buildUrl takes one real, possibly-absent, possibly-relative, possibly-already-absolute path. Before running anything: how many genuinely different real outcomes would you expect a function handling all three of those cases to need?

### Project Change

- **Reference Source:** src/components/Model3DViewer.tsx:35-40 and src/utils/env.ts:29, read verbatim this session.
- **Files affected:** `verification/frontend-phase-02/lab_build_url.ts` (new)
- **Change type:** add
- **Location:** New file, alongside this unit's own earlier real lab, in the same verification/frontend-phase-02/ folder.
- **Dependencies:** TypeScript's own compiler and Node.js, both already installed in this project.

A small, throwaway copy of the real function, run against four real, escalating inputs - discarded once understood. This app's own real API_BASE_URL is dynamically computed (a real localStorage override, or a real hostname-based default, confirmed by reading its own real definition this session) - this lab hardcodes one representative real value instead, since buildUrl's own real branching logic doesn't depend on how that constant itself was computed.

### The New Code

New code, typed into a new throwaway file - the real function, copied verbatim, run against four real inputs:

**File:** `verification/frontend-phase-02/lab_build_url.ts` (new)

```typescript
const API_BASE_URL = 'http://localhost:5000';

const buildUrl = (path: string | undefined): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const separator = path.startsWith('/') ? '' : '/';
    return `${API_BASE_URL}${separator}${path}`;
};

console.log(buildUrl(undefined));
console.log(buildUrl('models/part.obj'));
console.log(buildUrl('/models/part.obj'));
console.log(buildUrl('http://cdn.example.com/part.obj'));
```

### The Updated Project

**File:** `src/components/Model3DViewer.tsx` (already exists — read-only, nothing to type)

```typescript
const buildUrl = (path: string | undefined): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const separator = path.startsWith('/') ? '' : '/';
    return `${API_BASE_URL}${separator}${path}`;
};
```

### Mechanical Walkthrough

- `if (!path) return undefined;` — The first real branch - a real, absent path (`undefined`, confirmed by this unit's own first real logged line) stays `undefined`, never reaching the string logic below at all.
- `if (path.startsWith('http')) return path;` — The second real branch - a real path that's already a full real URL is returned completely unchanged, confirmed by this unit's own fourth real logged line matching its own real input exactly.
- `const separator = path.startsWith('/') ? '' : '/'; return `${API_BASE_URL}${separator}${path}`;` — The real, remaining case - a real relative path gets a real base URL prepended, with a real, conditional `/` inserted only when the path doesn't already start with one, avoiding a real double-slash - confirmed by this unit's own second and third real logged lines producing the identical real joined URL despite their real inputs differing by exactly one leading `/`.
- `console.log(buildUrl(undefined)); console.log(buildUrl('models/part.obj')); console.log(buildUrl('/models/part.obj')); console.log(buildUrl('http://cdn.example.com/part.obj'));` — Four real, escalating calls - absent, relative without a leading slash, relative with one, and already-absolute - covering all three of buildUrl's own real branches with real, concrete evidence instead of trusting the branches exist from reading the code alone.

### CS Lens

Names a real, deliberate normalization function - collapsing several real, differently-shaped inputs down to one consistent real output shape before anything downstream has to handle the variation itself. The same general idea recurs constantly outside this app: a URL library's own real `resolve()` function, joining a real relative and base URL the identical way; a path-normalization function in any real operating system's own filesystem API, collapsing real `./`/`../` segments before a real file is opened; a real database migration script normalizing several real, historically-inconsistent date formats into one real, consistent one before storing anything.

### SE Lens

The real alternative not chosen: let OBJViewer itself accept a real, possibly-relative path and resolve it internally, rather than requiring every real caller to pre-resolve it via buildUrl first. Real, honest cost of the alternative this app actually uses: `buildUrl` is defined locally inside Model3DViewer, confirmed by this session's own read, not exported or shared - any other real component that needs the identical real relative-to-absolute logic would have to genuinely duplicate this exact real function rather than import it, a real, structural cost of keeping the transformation local to one real composing layer instead of centralizing it.

### Commands needed

- `npx tsc --target es2020 --module commonjs --skipLibCheck --outDir verification/frontend-phase-02/compiled verification/frontend-phase-02/lab_build_url.ts` — Run first, from the manufacturing-platform repository root; compiles the real throwaway file to plain JavaScript.
- `node verification/frontend-phase-02/compiled/lab_build_url.js` — Run second, immediately after; executes the real compiled file and prints buildUrl's own real return value for each of the four real inputs.

### Verification

```text
undefined
http://localhost:5000/models/part.obj
http://localhost:5000/models/part.obj
http://cdn.example.com/part.obj
```

Full saved run: `verification/frontend-phase-02/lab_build_url_output.txt`.

### Connection to the previous unit

The unit above proved a transformation has to exist between two real, differently-shaped props interfaces; this unit ran this app's own real transformation against four real inputs to prove, not assume, exactly what it does with each one.

## Connect the pieces

One real throwaway `UserRecord`, passed straight into a component expecting a genuinely different real shape, `NameTagProps` - caught by a real compile error, the identical real relationship this app's own `Model3DViewerProps` and `OBJViewerProps` sit in, confirmed by reading both real interfaces side by side. One real, working transformation, `UserRow`'s own template literal, standing in for this app's own real `buildUrl` - run, for real, against four real escalating inputs, confirming all three of its real branches produce exactly the real output its own code predicts, not just what its code appears to say.

**Next lesson:** This app's own real conditional rendering and list patterns - real examples chosen once this app's own components are read for exactly that.