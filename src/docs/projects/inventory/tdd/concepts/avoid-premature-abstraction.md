# Concept: Avoiding Premature Abstraction

**What you'll understand by the end:** how to judge whether a piece of code has earned its own reusable unit (a function, a component, a file) yet, rather than defaulting to extracting everything on sight.

**Prerequisites:** none.

## Setup

No install needed — any language or framework works. The isolated example uses a small UI component, but the underlying judgment applies equally to functions, classes, and modules in any codebase.

## The Problem

Two opposite mistakes are both real and common: leaving genuinely duplicated, reused logic scattered and copy-pasted across a codebase (a real maintenance cost — a bug fix or change has to be found and repeated everywhere), and extracting *everything*, including one-off, single-use pieces with no real logic, into their own separately-named function/file purely out of habit — adding real indirection (another file to open, another name to remember) for something that had no actual reuse need to justify it.

## The Isolated Example

Two pieces of UI, side by side, in the same file:
```tsx
function App() {
  return (
    <>
      <h1>Toolpath</h1>
      <pre>{JSON.stringify(points, null, 2)}</pre>
    </>
  );
}
```

Extracting the heading (no real justification):
```tsx
function Heading() {
  return <h1>Toolpath</h1>;
}
// Used exactly once, has no props, no logic, no other caller anywhere.
```

Extracting the data dump (a real, statable justification):
```tsx
interface DataDumpProps {
  data: unknown;
}
function DataDump({ data }: DataDumpProps) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
// Used here for `points`; a tool-table view and a machine-state view,
// elsewhere in the same real project, both need the identical
// "show me this data as readable JSON" behavior.
```

**What this proves:** both extractions are mechanically identical in shape (a small function returning JSX) — the difference that matters is entirely external to the code itself: `DataDump` has more than one real, current consumer needing identical behavior; `Heading` has exactly one, with no stated plan for a second.

## Mechanical Walkthrough

- The **rule of three** (a widely-cited, informal heuristic, not a strict law) suggests waiting until a piece of logic is needed a *third* time before extracting it — the first occurrence is just code; the second might be coincidence; the third is real, confirmed duplication worth naming and centralizing.
- A stronger, more reliable signal than a pure repetition count: does the piece being considered for extraction have a **real, statable job** — "format arbitrary data as readable JSON," for instance — that's meaningful independent of its current one caller? A one-line static heading has no such independent job; it's just markup that happens to be sitting in a specific place.
- The cost being weighed isn't zero on either side: under-extraction risks real, compounding duplication (the same fix applied inconsistently across several copies); over-extraction risks real, compounding indirection (a codebase where finding out what a page actually renders requires opening five separate one-line files).

## CS Lens

This is a judgment call about the right level of **abstraction under uncertainty** — an abstraction (a named function, a reusable component) is a bet that a piece of logic will be needed again, in a form general enough to serve those future needs; a bet made too early, before real, concrete future needs are known, risks guessing wrong about what the *right* general shape even is, requiring rework anyway once the real second and third use cases arrive with requirements the first guess didn't anticipate.

Also recognized in: the YAGNI ("You Aren't Gonna Need It") principle from Extreme Programming, and the more general engineering tension between designing for known, current requirements versus speculative future ones — a recurring theme across nearly every real engineering discipline, not unique to software.

## SE Lens

The real, practical test worth asking before extracting something: "if I needed to change this specific piece of behavior, would I want to find and change it in exactly one place, or does it genuinely only exist in one place today with no other real consumer even in view?" A one-off heading fails this test; a "format this data as JSON" utility that a project's own stated near-term plans will clearly need again passes it. Naming this judgment call explicitly, in code review or in a project's own documentation, avoids re-litigating "should this be its own file" from scratch, inconsistently, every single time the question comes up.

## Connection

Directly informs `react-component-props.md`'s decision of when a piece of UI deserves to become its own component with real props, versus staying inline. Related to `adapter-pattern.md` — an adapter is justified by a real, current need to isolate a translation boundary, not by "this looks like it should probably be its own function."

## Try It Yourself

1. Look through a real, current codebase you have access to for a function or component with exactly one caller, no meaningful independent logic, and no stated plan for reuse — consider (without necessarily doing it) whether inlining it back into its one call site would make the code easier or harder to follow.
2. Find the opposite: a piece of logic genuinely duplicated, near-identically, in three or more places in a real codebase — sketch what a single, extracted version would look like, and identify what (if anything) differs slightly between the current copies that the extracted version would need to account for.
3. Write down, in your own words, a rule for your own future work distinguishing "this needs its own function/file now" from "this can stay inline for now" — then apply it to the next real piece of code you write, and see whether it holds up in practice.
