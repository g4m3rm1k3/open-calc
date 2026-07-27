# Lesson F4: Props and Composition

**What you will build**
`MemberList` split into a reusable `MemberItem` component plus a generic `Card` wrapper — replacing one component that fetches, owns, and renders everything itself with several smaller components, each with one job. The problem we're solving: `MemberList` currently does three things at once (fetch data, own state, render markup) with no way for any piece of that to be reused elsewhere — the same "one function doing too much" problem backend Lesson 16 fixed with the Repository pattern, now showing up in component form.

**What you need to know first**
F3 (`useState`, `useEffect`, JSX). Backend Lesson 16 (the repeated-logic recognition instinct — directly reused here).

---

## Concept Unit: Props — Passing Data Down

### The Problem

`MemberList` currently renders `<li>{member.username}</li>` inline, for every member, with no way to reuse "how a single member is displayed" anywhere else — a future profile page or search results list would have to duplicate that same `<li>{...}</li>` markup by hand.

### Introduce the concept in isolation

Create `frontend/src/lab/Greeting.tsx`:

```tsx
interface GreetingProps {
    name: string;
}

function Greeting({ name }: GreetingProps) {
    return <p>Hello, {name}!</p>;
}

function App() {
    return (
        <div>
            <Greeting name="Ada" />
            <Greeting name="Grace" />
        </div>
    );
}
```

Render `<App />` and view it — two lines appear: "Hello, Ada!" and "Hello, Grace!", from one `Greeting` definition, called twice with different data.

*What this proves:* `<Greeting name="Ada" />` looks like an HTML attribute, but per Lesson F3's syntactic-sugar explanation, this compiles to `jsx(Greeting, {name: "Ada"})` — `name="Ada"` becomes a plain JavaScript object, `{name: "Ada"}`, passed as `Greeting`'s single argument. `{ name }: GreetingProps` destructures that object directly in the function signature — `Greeting` is genuinely just a function taking one argument, the same as any other TypeScript function, described by the `GreetingProps` interface exactly the way F1's `types/api.ts` describes the backend's data shapes.

### Explain the mechanism

**Props** (short for "properties") are how a parent component passes data to a child — read-only from the child's perspective, owned and controlled entirely by whichever component renders it. This is a real, deliberate contrast with `useState` from F3: state is a component's *own*, mutable (via its setter) data; props are received, and a child component has no way to change what its parent handed it directly. Data in React flows in one direction only — parent to child — which is worth naming explicitly, since some other frameworks make different choices here.

### Discard the throwaway example

Delete `frontend/src/lab/`. Extract a real `MemberItem` from `MemberList`.

### Project Change

* **Files affected:** Create `src/MemberItem.tsx`. Modify `src/MemberList.tsx`.
* **Change type:** Add + Modify.

### The New Code

```tsx
// src/MemberItem.tsx
import type { Member } from "../types/api";

interface MemberItemProps {
    member: Member;
}

function MemberItem({ member }: MemberItemProps) {
    return <li>{member.username}</li>;
}

export default MemberItem;
```

```tsx
// src/MemberList.tsx — the render portion, simplified
import MemberItem from "./MemberItem";

// ...useState/useEffect unchanged from F3...

return (
    <ul>
        {members.map((member) => (
            <MemberItem key={member.id} member={member} />
        ))}
    </ul>
);
```

### Mechanical walkthrough

1. `interface MemberItemProps { member: Member }`: (already-established `interface` from F1, applied to describe a component's props specifically rather than an API response shape). Directly reuses the `Member` type from `types/api.ts` — no new shape invented, the exact same interface doing double duty as both "what the API returns" and "what this component expects."
2. `key={member.id}` now lives on `<MemberItem>` itself, not on the `<li>` inside it: (worth noting precisely). React's `key` requirement (F3) applies to whichever element is actually the direct child being mapped over — here that's `MemberItem`, not the `<li>` nested inside its own implementation.

### CS Lens

**Unidirectional data flow.** Data moves strictly one way: `MemberList` owns the fetched array (via `useState`), and hands individual members *down* to `MemberItem` as props. `MemberItem` has no mechanism to reach back up and modify `MemberList`'s state directly — any such change has to happen by `MemberList` passing a *function* down as a prop for the child to call, a pattern Lesson F5's forms will need. This one-directional constraint is deliberate: it makes tracing "where did this data come from, and what can change it" straightforward, even in a much larger component tree than this one.

### SE Lens

**Props as an explicit, typed contract between components — the same instinct as F1's API types, applied one level up.** `MemberItemProps` states precisely what `MemberItem` needs and nothing else; `tsc` will catch a caller forgetting to pass `member`, or passing the wrong shape, before the app ever runs — directly parallel to how `types/api.ts` catches a mismatch against the backend's shapes.

---

## Concept Unit: Composition via `children`

### The Problem

Both `MemberItem` and a future `PostCard` (needed once feed rendering starts) will likely want the same visual wrapper — a bordered box with consistent padding — but wrapping genuinely different content inside. Duplicating that wrapper's markup in every component that needs it is exactly the kind of repetition backend Lesson 9's and 11's SE Lenses taught you to notice.

### Introduce the concept in isolation

Create `frontend/src/lab/Box.tsx`:

```tsx
interface BoxProps {
    children: React.ReactNode;
}

function Box({ children }: BoxProps) {
    return <div style={{ border: "1px solid gray", padding: "8px" }}>{children}</div>;
}

function App() {
    return (
        <Box>
            <p>Anything can go here.</p>
            <button>Even this.</button>
        </Box>
    );
}
```

Render it — a bordered box appears, containing a paragraph and a button, neither of which `Box` itself knows anything about in advance.

*What this proves:* `children` is a special prop — whatever's written *between* a component's opening and closing tags (`<Box>...</Box>`) is automatically passed to it as `props.children`, without the caller needing to name it explicitly the way `name="Ada"` did earlier. `Box` renders `{children}` without caring what it actually is — a paragraph, a button, or an entire other component tree.

### Explain the mechanism

**Composition** — building complex UI by nesting components inside each other, each contributing one piece — is React's answer to the same "composition over inheritance" design principle named all the way back at the very start of this whole curriculum's planning, when C#/Java's class-based inheritance was originally on the table and then deprioritized. `Box` doesn't need to know what content it wraps any more than a repository method needs to know which specific route calls it — it only needs to fulfill its one job (the visual wrapper) and stay out of the way of everything else.

### Discard the throwaway example

Delete `frontend/src/lab/`. Build a real, reusable `Card`.

### Project Change

* **Files affected:** Create `src/Card.tsx`. Modify `src/MemberItem.tsx`.
* **Change type:** Add + Modify.

### The New Code

```tsx
// src/Card.tsx
interface CardProps {
    children: React.ReactNode;
}

function Card({ children }: CardProps) {
    return <div className="card">{children}</div>;
}

export default Card;
```

```tsx
// src/MemberItem.tsx — updated to compose Card
import type { Member } from "../types/api";
import Card from "./Card";

interface MemberItemProps {
    member: Member;
}

function MemberItem({ member }: MemberItemProps) {
    return (
        <Card>
            <span>{member.username}</span>
        </Card>
    );
}

export default MemberItem;
```

### Mechanical walkthrough

1. `React.ReactNode`: (first appearance). The type covering "anything React can render" — a string, a number, a JSX element, an array of elements, or `null` — deliberately broad, since `children` genuinely can be almost anything.
2. `className="card"`: (first appearance, deferred styling). A real CSS class name, unstyled for now — Phase F4's `shadcn/ui` lessons will replace this ad-hoc approach with a real design system rather than hand-written CSS classes.

### CS Lens

**Composition as the general solution to "many things need a similar structure, but different content."** This is the identical shape as backend Lesson 19's CTE-as-named-reusable-computation and Lesson 21's view-as-named-reusable-query — a piece of structure, extracted once, reused everywhere it's needed, without needing to know the specifics of every place that reuses it.

### SE Lens

**Extracting `Card` now, after exactly one real use, is worth questioning — not blindly following.** Backend Lessons 9 and 11 both deliberately waited until a pattern repeated two or three times before generalizing it, specifically to avoid premature abstraction. `Card` is extracted here mostly to demonstrate the mechanism clearly with a real, if early, use — in practice, waiting for a second genuine use case (a `PostCard`, coming once feed rendering starts) before committing to a shared component's exact API would be the more disciplined version of this same instinct.

### Commands needed

```bash
npm run dev
```

### Run it. Show the real output.

The member list renders identically to F3, visually — now built from `MemberList` → `MemberItem` → `Card`, three small, independently reusable pieces instead of one component doing everything.

---

## Closing

**Connect the pieces**
`MemberList` still owns the fetched state (F3), but no longer renders markup directly — it hands each `Member` down to `MemberItem` as a prop, a one-way, typed data flow matching `types/api.ts`'s existing `Member` shape exactly. `MemberItem` composes `Card`, a generic wrapper with no knowledge of what it's wrapping, via the special `children` prop.

**What breaks without this**
Without extracting `MemberItem`, every future place needing "display one member" (search results, a follower list, a post's author byline) would either duplicate the same JSX or awkwardly reach back into `MemberList`'s internals — exactly the drift-prone duplication backend Lesson 16 fixed for authorization logic, now shown up in UI form instead.

**Exercises**
1. Extract a `FeedPostItem` component (props: a single `FeedPost`), composing `Card`, in preparation for rendering `/feed` in a later lesson.
2. Add a second prop to `MemberItemProps`, `onClick: () => void`, called when the item is clicked — direct practice passing a function down as a prop, the mechanism unidirectional data flow requires for a child to ever affect its parent.

**Definition of Done**
* [x] `MemberItem` extracted, receiving a typed `member` prop.
* [x] `Card` built as a generic, reusable wrapper via `children`.
* [x] Can explain, without notes, why props flow only one direction and what a child would need to affect its parent instead.
* [x] Commit: `feat: extract MemberItem and Card, composing reusable pieces from MemberList`

---

## Context Snapshot (End of Lesson F4)

**Frontend File Tree:** adds `src/MemberItem.tsx`, `src/Card.tsx`

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Props | F4 | Read-only data passed from parent to child, a typed function-argument-like contract |
| Unidirectional data flow | F4 | Data moves parent → child only; a child affects a parent only via a function passed down |
| Composition (React) | F4 | Building UI by nesting components, each with one job — the same principle as composition over inheritance |
| `children` prop | F4 | Whatever's nested between a component's tags, passed automatically as `props.children` |
| `React.ReactNode` | F4 | The type covering anything React can render |

**Lesson Completion State:**
- Completed: F1, Interlude E, F2, F3, F4
- Next: F5 — Controlled Inputs (extends `useState`, builds the login form)

**Maps to backend:** `MemberItem`'s `member` prop is typed directly from `types/api.ts`'s `Member`, itself mirroring `schemas.py`'s `Member` — the same manual-sync discipline flagged back in F1.
