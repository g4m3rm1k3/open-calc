# Concept: Lifting State Up

**What you'll understand by the end:** where a piece of shared data should actually live in a component tree, and why the answer is "in the nearest component that needs to share it," not "in whichever component happens to use it first."

**Prerequisites:** `react-usestate-hook.md`, `react-component-props.md`.

## Setup

A React project with JSX configured (see `vite-plugin-system.md`).

## The Problem

Two sibling components sometimes need access to the *same* piece of data — a search input and a results list both needing the current search term, for instance. Neither component can hold that state itself and simply "share" it with the other — components in this model don't have a way to directly read each other's internal state; data only flows one direction, from parent to child, as props.

## The Isolated Example

The wrong shape — each sibling tries to hold its own copy:
```tsx
function SearchBox() {
  const [term, setTerm] = useState("");
  return <input value={term} onChange={(e) => setTerm(e.target.value)} />;
}

function ResultsList() {
  // No way to see SearchBox's `term` from here at all.
  return <p>Results for: ???</p>;
}
```
`ResultsList` has no path to `SearchBox`'s internal state — they're siblings, and state never flows sideways.

The fix — state lifted to their shared parent:
```tsx
function SearchBox({ term, onTermChange }: { term: string; onTermChange: (t: string) => void }) {
  return <input value={term} onChange={(e) => onTermChange(e.target.value)} />;
}

function ResultsList({ term }: { term: string }) {
  return <p>Results for: {term}</p>;
}

function App() {
  const [term, setTerm] = useState("");
  return (
    <>
      <SearchBox term={term} onTermChange={setTerm} />
      <ResultsList term={term} />
    </>
  );
}
```

**Real behavior:** typing in `SearchBox`'s input immediately updates `ResultsList`'s displayed text — verified by typing "gear" and observing "Results for: gear" appear.

**What this proves:** moving `useState` out of `SearchBox` and into their shared parent, `App`, is what made the data reachable by both children — `SearchBox` no longer owns `term` at all, it only receives it as a prop and reports changes back up via a callback prop (`onTermChange`), while `App` is now the single, real owner of the data both siblings need.

## Mechanical Walkthrough

- **Lifting state up** means moving a `useState` call from a component that needs the data to the nearest shared ancestor of every component that needs it — here, `App`, the common parent of both `SearchBox` and `ResultsList`.
- The state's original owner (`SearchBox`) becomes a purely **controlled component**: it no longer decides its own value — it receives `term` as a prop, and reports the *intent* to change it upward via a callback prop (`onTermChange`), leaving the actual decision of updating state to whoever owns it.
- Data continues to flow only one direction — down, as props (see `react-component-props.md`) — even after lifting; what changed is *where* the single source of truth for `term` lives, not the fundamental one-way flow of the model itself.
- This pattern generalizes: state should live in the lowest (most specific, most deeply nested) component that is still a common ancestor of everything that needs it — lifting further up than necessary (all the way to a root component, for instance, when only two nearby siblings actually need to share something) works, but unnecessarily forces every component in between to pass the data through as props purely to relay it (a real, separate problem sometimes called "prop drilling").

## CS Lens

This is the practical consequence of a **single source of truth** applied to a tree-shaped data-flow model: exactly one component owns a given piece of state, and every other component that needs it receives a read-only copy (or a way to request a change) rather than maintaining its own, independent, potentially-diverging copy. Two components each holding their own `useState` for what's conceptually the *same* data would have no way to stay synchronized — lifting state up is what guarantees, structurally, that there's only ever one real answer to "what is the current search term."

Also recognized in: this same project's own backend keeping `MachineState` as the one real, authoritative source of the machine's current position, with every other piece of code (routes, `compute_path`) reading from it rather than maintaining independent copies — a different mechanism (a Python object instead of React state), the identical underlying "one clear owner" instinct.

## SE Lens

The real, concrete test for whether state needs lifting: "does more than one component need to read or react to this value?" If only one component ever uses a piece of state, it should stay local to that component — lifting it further up "just in case" adds real, unnecessary indirection (extra props threaded through, extra callback functions) for no present benefit. Lifting is a response to an actual, current sharing need, not a default architectural posture applied preemptively everywhere.

## Connection

Builds on `react-usestate-hook.md` and `react-component-props.md`. Directly explains where fetched data (from `typescript-async-await.md`-style asynchronous calls) should live when more than one part of a UI — a raw data view and a visual rendering of the same data, for instance — both need access to the identical, current result.

## Try It Yourself

1. Add a third sibling component that also needs `term` (e.g. a `<CharCount term={term} />` showing the search term's length), and confirm it can access the already-lifted state with no further restructuring — direct proof that lifting once accommodates any number of additional consumers, not just the original two.
2. Deliberately *un-lift* the state back into `SearchBox` alone, remove `ResultsList`'s `term` prop, and reason concretely about what specifically breaks (`ResultsList` has no way to know the current term at all) — reconstructing, in your own words, why the lift was necessary in the first place.
3. Look up the React documentation's own term for state passed down alongside a way to request changes to it upward (a "controlled component") and identify one real HTML element (`<input>`, `<select>`) that follows this exact controlled pattern natively, even outside of React.
