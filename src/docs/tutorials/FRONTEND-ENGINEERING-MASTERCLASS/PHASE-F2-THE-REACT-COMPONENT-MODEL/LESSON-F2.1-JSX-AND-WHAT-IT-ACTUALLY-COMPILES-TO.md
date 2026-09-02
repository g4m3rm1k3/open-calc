# Lesson F2.1: JSX and What It Actually Compiles To

*File paths under src/... refer to the real manufacturing-platform repository's frontend. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Two throwaway components, compiled for real with this project's own actual configured JSX transform, proving with real, generated JavaScript exactly what a JSX element becomes before any browser ever runs it - a real function call, not special syntax a browser understands natively. Then a direct read of one of this app's own real components, predicting, then confirming, which of two real functions its own real JSX compiles down to. The transferable problem: JSX reads like markup embedded in real code, and the actual mechanism underneath it is neither markup nor magic - it's an ordinary function call this project's own real, installed React package defines and exports like any other.

**What you need to know first:** Nothing beyond ordinary JavaScript function calls and object literals - the interfaces and generics already covered this curriculum are TypeScript's own type-checking layer, entirely separate from what JSX itself compiles down to.

## Terms used in this lesson

- **JSX** — A real, non-standard syntax extension to JavaScript, letting HTML-like markup appear directly inside real code - `<div className="x">...</div>`, written where an ordinary expression would go. It exists so a component's real UI structure can be written close to how it visually nests, and is compiled away entirely into ordinary function calls before any real browser ever sees it - no browser executes JSX itself, ever.
- **Automatic JSX runtime** — The specific real JSX-to-JavaScript transform this project is configured to use (`"jsx": "react-jsx"` in tsconfig.json, confirmed this session), compiling each JSX element into a real call to `jsx` or `jsxs`, imported automatically from `react/jsx-runtime`. It exists as the real, modern replacement for the older "classic" transform, which compiled every element to `React.createElement` instead and required `React` itself to be imported into every real file that used any JSX at all.

## Objects and methods used

- **`jsx`**
  - *What it is:* The real function this project's own configured JSX transform compiles a single-child JSX element down to.
  - *Implementation:* Exported from react/jsx-runtime; this session's own real, executed compile confirms the real generated import, `import { jsx as _jsx } from "react/jsx-runtime";`.
  - *Its use:* Called once per real JSX element that has exactly one real child (or none) - confirmed this session by compiling a real, minimal `<span>Ready</span>` element.
  - *Type:* A function, exported by the real, installed react package's own react/jsx-runtime module.
  - *Responsibility:* Take a real element type (a string tag name or a real component function) and a real props object, and return the real, plain JavaScript object React itself uses internally to describe what should render.
  - *Depends on:* Nothing from this app - it's a real function this project's own installed React package provides, not something this app defines.
  - *Connects to:* Called directly wherever this project's own compiled output needs to describe a single-child real element; React's own internal rendering, not covered in this lesson, is what actually reads its real return value.
  - *Shape:* Takes a real element type and a real props object (children included, under the real `children` key); returns one real, plain object describing that one real element - never JSX syntax itself, which no longer exists once this function is called.

- **`jsxs`**
  - *What it is:* The real function this project's own configured JSX transform compiles a JSX element down to instead, specifically when that element has more than one real child.
  - *Implementation:* Exported from react/jsx-runtime; this session's own real, executed compile confirms the real generated import, `import { jsxs as _jsxs } from "react/jsx-runtime";`.
  - *Its use:* Called once per real JSX element whose real children are a real, static array of more than one item - confirmed this session by compiling a real element mixing literal text and a real expression.
  - *Type:* A function, exported by the real, installed react package's own react/jsx-runtime module - structurally identical in kind to jsx, above.
  - *Responsibility:* The identical real responsibility as jsx, above, specialized for the real case where a real element's children are already known, at compile time, to be a real, fixed-length array rather than a single value.
  - *Depends on:* Nothing from this app, the same as jsx, above.
  - *Connects to:* Called directly wherever this project's own compiled output needs to describe a multi-child real element - the only real difference from jsx is this one structural fact about its own children.
  - *Shape:* Takes the identical real shape as jsx, above, except its real `children` value is always a real array, never a single value.

## Concept Unit: JSX Compiles to a Real Function Call - Nothing Magic About It

### The Problem

`<span>Ready</span>` is real, valid syntax inside a `.tsx` file, and genuinely invalid syntax in any real, standard JavaScript a browser actually runs. Something real has to turn one into the other before this app's own code ever reaches a real browser - this unit finds out exactly what, by compiling one real, minimal case and reading the real result.

Before reading on:

- Before compiling anything: does `<span>Ready</span>` look more like it could become a real function call, a real string, or something else entirely - and what real arguments would that call need to carry all the same information the JSX did?

### Project Change

- **Reference Source:** tsconfig.json:44 (`"jsx": "react-jsx"`), read verbatim this session, confirming this project's own real, configured JSX transform.
- **Files affected:** `verification/frontend-phase-02/lab_jsx_single_child.tsx` (new)
- **Change type:** add
- **Location:** New file, a new verification/frontend-phase-02/ folder for this phase's own real, executed checks.
- **Dependencies:** TypeScript's own compiler, already installed in this project, run with this project's own real, configured --jsx setting.

A small, throwaway JSX file - discarded once understood - compiled for real using this project's own actual configured transform, not a generic or assumed one.

### The New Code

New code, typed into a new throwaway file:

**File:** `verification/frontend-phase-02/lab_jsx_single_child.tsx` (new)

```typescript
function Label() {
    return <span>Ready</span>;
}
```

### Mechanical Walkthrough

- `function Label() { return <span>Ready</span>; }` — A real, minimal component - one real JSX element, one real child, a plain string. Nothing here is executable as real, standard JavaScript syntax until this unit's own real compiler run, below, transforms it.
- `import { jsx as _jsx } from "react/jsx-runtime";` — The real, generated import line this unit's own compile actually produced - added automatically, since this project's own `react-jsx` transform assumes every real `.tsx` file needs it, without a developer writing this import by hand anywhere.
- `return _jsx("span", { children: "Ready" });` — The real, complete compiled result - a real function call, `_jsx`, given a real string naming the real HTML tag and a real, plain object carrying everything the JSX expressed as attributes and children. Nothing about `<span>Ready</span>` survives as syntax; it's now one real function call like any other.

### CS Lens

A real instance of syntactic sugar compiling down to an ordinary, real mechanism - the identical general shape already proven elsewhere this curriculum: a TypeScript interface leaving no real trace in compiled JavaScript, an arrow function compiling to the same real function object a `function` keyword would produce. The same general idea recurs constantly outside JSX: a Python list comprehension compiling down to an ordinary real loop; SQL's own declarative `SELECT` statement compiled by a query planner into a real, ordered sequence of scans and joins; a `for...of` loop in JavaScript itself compiling down to real iterator-protocol method calls under the hood.

### SE Lens

The real alternative not chosen: write real `_jsx(...)` calls by hand throughout this app's own real source, with no JSX syntax at all - technically possible, since JSX compiles to exactly that. Real, honest cost of that alternative: a real, deeply-nested UI tree becomes a real, deeply-nested pyramid of real function calls, each one burying its own real children one parenthesis further in - JSX's own real value is purely readability for a human author; it adds no real capability `_jsx` itself doesn't already have, confirmed directly by this unit's own real compile showing the two are genuinely interchangeable.

### Commands needed

- `npx tsc --jsx react-jsx --target es2020 --module esnext --moduleResolution bundler --skipLibCheck --outDir verification/frontend-phase-02/compiled verification/frontend-phase-02/lab_jsx_single_child.tsx` — Run from the manufacturing-platform repository root. --jsx react-jsx matches this project's own real tsconfig.json setting exactly; --outDir writes the real compiled .js file into this phase's own verification folder instead of overwriting anything in src/.

### Verification

```text
import { jsx as _jsx } from "react/jsx-runtime";
function Label() {
    return _jsx("span", { children: "Ready" });
}
```

Full saved run: `verification/frontend-phase-02/compiled/lab_jsx_single_child.js`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: One Child vs. Several - jsx() vs. jsxs()

### The Problem

The unit above's element had exactly one real child - a plain string. This app's own real components routinely mix literal text with real expressions, producing more than one real child at once. Does the identical real transform still produce the identical real function call, or does the real shape of the children change which real function gets called at all?

Before reading on:

- Given `<div>Hello, {name}</div>` has two real children - the literal text `"Hello, "` and the real expression `{name}` - would you expect this to compile to the same real function as `<span>Ready</span>`'s one child, or a different one?

### Project Change

- **Reference Source:** src/components/Model3DViewer.tsx:42-53, read verbatim earlier this curriculum, cited again here in full per this schema's own repetition rule.
- **Files affected:** `verification/frontend-phase-02/lab_jsx_compile.tsx` (new)
- **Change type:** add
- **Location:** New file, alongside this unit's own earlier real lab, in the same verification/frontend-phase-02/ folder.
- **Dependencies:** TypeScript's own compiler, run with this project's own real, configured --jsx setting.

A second small, throwaway JSX file - discarded once understood - this time with two real children instead of one.

### The New Code

New code, typed into a new throwaway file:

**File:** `verification/frontend-phase-02/lab_jsx_compile.tsx` (new)

```typescript
function Greeting({ name }: { name: string }) {
    return <div className="greeting">Hello, {name}</div>;
}
```

### The Updated Project

**File:** `src/components/Model3DViewer.tsx` (already exists — read-only, nothing to type)

```typescript
return (
    <div className="h-full bg-surface-950 rounded-lg overflow-hidden border border-surface-700">
        <OBJViewer
            modelUrl={buildUrl(processedModel?.filePath)}
            stockModelUrl={buildUrl(stockModel?.filePath)}
            initialStockModelUrl={buildUrl(initialStockModel?.filePath)}
            partModelUrl={buildUrl(partModel?.filePath)}
            fixtureModelUrl={buildUrl(fixtureModel?.filePath)}
            onPointClick={onPointClick}
        />
    </div>
);
```

### Mechanical Walkthrough

- `function Greeting({ name }: { name: string }) { return <div className="greeting">Hello, {name}</div>; }` — A real element with two real children - the literal text `\"Hello, \"` and the real expression `{name}` - both real, static members of one real, fixed-length children array, known at compile time.
- `import { jsxs as _jsxs } from "react/jsx-runtime";` — A different real generated import than the unit above's - `jsxs`, not `jsx` - the real, compiled proof that the number of children, not their content, decides which real function gets called.
- `return _jsxs("div", { className: "greeting", children: ["Hello, ", name] });` — The real, complete compiled result - `children` is now a real, two-item array, `[\"Hello, \", name]`, matching `jsxs`'s own real, plural name; `className` rides along in the identical real props object position `jsx` used above.
- `return ( <div className="h-full ..."> <OBJViewer ... /> </div> );` — This app's own real Model3DViewer, already read in full earlier this curriculum - its outer `<div>` has exactly one real child, the single `<OBJViewer />` element, the identical real shape as this unit's own `<span>Ready</span>` lab. Compiling this real file directly, this session, confirms it: a real `jsx` call, not `jsxs`, for this specific real element, even though the `<OBJViewer />` element it wraps carries five real props of its own.

### CS Lens

A real instance of a compiler specializing its own real output based on a real, statically-known structural property - here, exact child count - rather than emitting one generic real form every time. The same general idea recurs constantly outside JSX: a database query planner choosing a real index scan over a real full table scan once a query's own real selectivity is known ahead of time; a compiler inlining a real function call outright when its real argument count and types are fully known at compile time, rather than emitting a generic real call instruction.

### SE Lens

The real alternative not chosen: one single real function, always called the identical way regardless of real child count, wrapping every real child in an array even when there's only one. Real, honest cost avoided by the two-function split this project actually uses: a real, single-child element - confirmed the more common real shape in this app's own components, including Model3DViewer's own outer `<div>` - never has to allocate a real array just to hold the one real value it actually has, a small but real, structural performance choice baked directly into which of two real functions gets called for a specific real element, decided once, at compile time, never at runtime.

### Commands needed

- `npx tsc --jsx react-jsx --target es2020 --module esnext --moduleResolution bundler --skipLibCheck --outDir verification/frontend-phase-02/compiled verification/frontend-phase-02/lab_jsx_compile.tsx` — Run from the manufacturing-platform repository root, same real settings as this unit's earlier compile, confirming the real function-choice difference this element's own extra child produces.
- `npx tsc --jsx react-jsx --target es2020 --module esnext --moduleResolution bundler --skipLibCheck --outDir verification/frontend-phase-02/compiled src/components/Model3DViewer.tsx` — Run third, independently, directly against this app's own real file rather than a throwaway copy - real path-alias imports (@/utils/env, @/types) can't resolve outside this project's own real tsconfig path mapping, producing real, expected TS2307 errors unrelated to JSX; tsc still emits the real, correct compiled JavaScript regardless, which is the only thing this unit's own claim depends on.

### Verification

```text
import { jsxs as _jsxs } from "react/jsx-runtime";
function Greeting({ name }) {
    return _jsxs("div", { className: "greeting", children: ["Hello, ", name] });
}

// Real, actual compiled output for src/components/Model3DViewer.tsx's own return statement:
return (_jsx("div", { className: "h-full bg-surface-950 rounded-lg overflow-hidden border border-surface-700", children: _jsx(OBJViewer, { modelUrl: buildUrl(processedModel?.filePath), stockModelUrl: buildUrl(stockModel?.filePath), initialStockModelUrl: buildUrl(initialStockModel?.filePath), partModelUrl: buildUrl(partModel?.filePath), fixtureModelUrl: buildUrl(fixtureModel?.filePath), onPointClick: onPointClick }) }));
```

Full saved run: `verification/frontend-phase-02/compiled/lab_jsx_compile.js and verification/frontend-phase-02/lab_model3dviewer_compile_output.js`.

### Connection to the previous unit

The unit above proved JSX compiles to a real function call at all; this unit proved which of two real functions depends entirely on a real, structural fact - child count - confirmed three times: once in each of two throwaway labs, and once by directly compiling one of this app's own real, shipped files.

## Connect the pieces

One real throwaway `<span>Ready</span>`, compiled with this project's own actual, configured JSX transform, into a real `_jsx` call carrying one real child. One real throwaway `<div className="greeting">Hello, {name}</div>`, compiled into a real `_jsxs` call instead, its real children now a real, two-item array - the exact real fact, child count, that decided which function was called both times. That same real fact, checked against `Model3DViewer.tsx`'s own real outer `<div>` - one real child, `<OBJViewer />` - confirmed a real `jsx` call for this app's own real, shipped component by actually compiling the real file this session, not by analogy alone.

**Next lesson:** This app's own real props and composition - `Model3DViewer` wrapping `OBJViewer`, and what it actually means, mechanically, for one real component to render another.