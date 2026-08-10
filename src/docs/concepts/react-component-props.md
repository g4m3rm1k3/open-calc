# Concept: React Component Props

**What you'll understand by the end:** how a parent component passes data into a child component, and how that differs from a component managing its own internal state.

**Prerequisites:** `jsx-syntax.md`, `javascript-destructuring.md`.

## Setup

A React project with JSX configured (see `vite-plugin-system.md`).

## The Problem

A reusable UI component often needs to display *different* data depending on where it's used — a greeting component showing a different name each time, a list item component showing different content per item. Without a way to pass data in from outside, every variation would need its own separately hand-written component, duplicating everything except the one differing value.

## The Isolated Example

```tsx
interface GreetingProps {
  name: string;
  formal: boolean;
}

function Greeting({ name, formal }: GreetingProps) {
  return <p>{formal ? `Good day, ${name}.` : `Hey ${name}!`}</p>;
}

function App() {
  return (
    <>
      <Greeting name="Alex" formal={false} />
      <Greeting name="Dr. Chen" formal={true} />
    </>
  );
}
```

**Real, rendered DOM output:**
```html
<p>Hey Alex!</p>
<p>Good day, Dr. Chen.</p>
```

**What this proves:** the exact same `Greeting` component, defined once, produced two genuinely different outputs — driven entirely by the different `name`/`formal` values each caller supplied as JSX attributes, with zero duplication of `Greeting`'s own logic.

## Mechanical Walkthrough

- `<Greeting name="Alex" formal={false} />` — JSX attributes on a custom (capitalized) component become a single **props object** passed as that component's one argument — equivalent to calling `Greeting({ name: "Alex", formal: false })` directly as a function.
- `function Greeting({ name, formal }: GreetingProps)` — destructures (see `javascript-destructuring.md`) the incoming props object directly in the parameter list, and `GreetingProps` (an `interface`, see `typescript-interfaces.md`) names the exact shape of props this component expects, checked by TypeScript at every call site.
- Attribute values wrapped in `{}` (`formal={false}`) pass a real JavaScript value (here, a boolean) rather than a string — JSX attribute values are strings by default (`name="Alex"` passes the literal string `"Alex"`), but `{}` switches to evaluating a real expression, exactly as inside JSX children (see `jsx-syntax.md`).
- Props are **read-only** from the receiving component's own perspective — `Greeting` never modifies `name` or `formal` itself; if the displayed name needs to change, that change must happen in whichever component actually owns that data (see `react-lifting-state-up.md`), which then passes a new value down again.

## CS Lens

Props are the mechanism by which data flows **down** through a component tree — a parent component fully controls what a child receives, and a child has no way to reach back up and directly change what its parent passed it. This one-directional flow (data down, changes communicated back up only via explicitly-passed callback functions, not shown here) is a deliberate constraint, not a limitation — it means a component's behavior can always be understood by looking at what it receives, without needing to trace backward through some other path data might have taken to reach it.

Also recognized in: function parameters generally (a function's behavior is fully determined by its arguments, the same "predictable from inputs" property), and nearly every other component-based UI framework's own version of props (Vue's `props` option, Angular's `@Input()` decorator, Svelte's `export let`) — the identical underlying need, addressed with different syntax per framework.

## SE Lens

A component whose entire behavior is determined by its declared props (and nothing else — no hidden global state, no reaching outside itself for data) is straightforward to reuse and to reason about: calling it twice with different props predictably produces two different, independent outputs, with no risk of one call's rendering affecting the other's. This predictability is the direct payoff of props being read-only and one-directional — a component that *could* silently mutate the data it was given, or reach outside itself for additional inputs, would be far harder to trust in isolation.

## Connection

Builds on `jsx-syntax.md` and `javascript-destructuring.md`. `react-lifting-state-up.md` describes where the data passed as props should actually live when more than one component needs access to it.

## Try It Yourself

1. Add a third prop (`age: number`) to `GreetingProps` and use it in `Greeting`'s output, then try calling `<Greeting name="Alex" formal={false} />` without it — read the real TypeScript error demanding the missing required prop.
2. Give `age` a default value directly in the destructuring (`{ name, formal, age = 0 }`) and mark it optional in the interface (`age?: number`), then confirm the same call from step 1 now compiles, using the default.
3. Try assigning directly to a prop inside `Greeting` (`name = "Someone Else";`, inside the function body) — in plain JavaScript this doesn't error, but reason about (and confirm, by trying to display the reassigned value) why this reassignment has zero effect on what the parent `App` believes `name` to be, since props are a fresh copy of the value passed, not a live link back to the parent's own data.
