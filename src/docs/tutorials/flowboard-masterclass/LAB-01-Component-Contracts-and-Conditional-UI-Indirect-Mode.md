# FlowBoard Masterclass — LAB 01 — Component Contracts and Conditional UI (Indirect Mode)

**Prerequisites:** LAB 00 complete (data records, map transformation, idempotent rendering, invariant).

**What this lab adds:**
- A component contract abstraction for predictable UI composition
- Optional field handling without broken or noisy output
- Decision quality: when to render nothing vs render placeholder content

**Time:** 90-120 minutes

---

## What You Will Build

You will build an isolated React example called EventBoard.

Before:
- One list rendered from data with plain markup

After:
- A reusable EventCard component with a typed contract
- Optional note text shown only when present
- A stable list render with clean output and no empty placeholders

Visual shape at the end:

```text
+----------------------------------------------+
| EventBoard (isolated example)                |
| [Workshop]  Debugging Clinic                 |
|            Tonight 7:00 PM                   |
|            Bring failing test case           |
|                                              |
| [Meetup]    Frontend Systems                 |
|            Sat 2:00 PM                       |
|            (no note row displayed)           |
+----------------------------------------------+
```

---

> **Quick Check — answer before reading further:**
>
> 1. Why is a typed component contract safer than passing random fields?
> 2. What should happen if optional data is missing: empty placeholder or no element?
> 3. Prediction: if a component always renders a note paragraph but note is undefined, what appears on screen?
> 4. If two components use different field names for the same idea, what class of bugs appears?
>
> *(Answers at the end of this lab)*

### Forward-Reference Table (Indirect Mode)

| Term | Enough to read the examples | Full block |
|---|---|---|
| React component | A function that returns UI markup based on input data. | LAB 01 |
| Props | Input object passed into a component. | LAB 01 |
| Type contract | A formal definition of required and optional fields. | LAB 01 |

---

### Concept: React Component

**What it is:** A React component is a function that returns UI for given input.

**The problem before:** Repeating card markup inline in every parent view duplicates structure and increases inconsistency risk.

**The solution:** Move repeated UI into a reusable component function.

**What it hides:**
- Hidden complexity: repeated structural markup for each repeated record
- Protected invariant: each card instance follows one shared visual structure

**Canonical example (General Explanation):**
- Analogy: one invoice template reused for every customer record
- Minimal code form: `function Card() { return <article>...</article>; }`
- Why this works: structure is centralized while data varies by input

**Project Application (The "Why" here):** EventBoard needs multiple cards with consistent structure and varying data.

**Smallest possible example:**

```tsx
function Badge() {
  return <span>New</span>;
}
```

**Why it matters here:** Components reduce duplication and keep view logic organized.

**Constraints:** Component must return valid JSX and receive the data shape it expects.

**Failure modes:** Overly large components become hard to test and reason about.

**Operational reality:** Production apps split components by responsibility and render cost boundaries.

**You will see this again in:**
- Every React codebase
- Design system libraries
- Storybook component catalogs
- Interview frontend tasks
- Cross-framework componentization patterns

**Watch for:** Putting unrelated responsibilities (fetching, formatting, rendering, state updates) into one component.

---

### Concept: Component Contract (Typed Props)

**What it is:** A component contract is the explicit field interface that callers must satisfy.

**The problem before:** Without a contract, callers pass mismatched or missing fields and errors appear late at runtime.

**The solution:** Define required and optional props in a type and validate usage at compile time.

**What it hides:**
- Hidden complexity: ad hoc caller assumptions about field names and shapes
- Protected invariant: every rendered card always has required fields (`id`, `tag`, `title`, `time`)

**Canonical example (General Explanation):**
- Analogy: power plug standard; if shape matches, device connects safely
- Minimal code form: `interface Props { title: string }`
- Why this works: contract catches mismatch before execution

**Project Application (The "Why" here):** EventCard must always have identity and key display fields, while note remains optional.

**Smallest possible example:**

```tsx
interface LabelProps {
  text: string;
}

function Label(props: LabelProps) {
  return <span>{props.text}</span>;
}
```

**Why it matters here:** Contract-first components make list rendering predictable and maintainable.

**Constraints:** Field names and types must stay aligned between data records and props.

**Failure modes:** Contract drift across modules causes compile failures or unsafe casts.

**Operational reality:** Large teams rely on contracts to coordinate independent workstreams safely.

**You will see this again in:**
- API response typing
- Domain model interfaces
- Form schema validation
- Shared package boundaries
- Hiring interviews on TypeScript design

**Watch for:** "Quick fix" casts that bypass the contract instead of correcting source data.

---

## Step 1 — Build Raw Inline Version First (Failure Setup)

Create an isolated React file example (for instance in a scratch Vite app) with this raw approach:

```tsx
const events = [
  { id: 'e1', tag: 'Workshop', title: 'Debugging Clinic', time: 'Tonight 7:00 PM', note: 'Bring failing test case' },
  { id: 'e2', tag: 'Meetup', title: 'Frontend Systems', time: 'Sat 2:00 PM' },
];

export default function EventBoard() {
  return (
    <main>
      <h1>EventBoard</h1>
      <section>
        {events.map((event) => (
          <article key={event.id} className="event-card">
            <span>{event.tag}</span>
            <h2>{event.title}</h2>
            <p>{event.time}</p>
            <p>{event.note}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
```

### SAVE AND TRY

Save and run.

You should see:
- Two cards
- Second card has an awkward empty note line area or undefined-like output depending on styling and runtime behavior

In DevTools Console, verify event count logic:

```js
document.querySelectorAll('.event-card').length
```

Expected:
- `2`

Change something:
- Remove `note` from first event too
- Save and observe both cards now render empty note rows
- Add note back to first event

This is the required problem-before-solution setup.

---

## Step 2 — Add Minimal Styles Incrementally

Add first visual rule:

```css
.event-card {
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  padding: 12px;
  margin-top: 10px;
}
```

### CSS AND SEE

You should see boxed card surfaces.

Add tag rule:

```css
.event-card > span {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  background: #ecfeff;
  color: #155e75;
  padding: 2px 8px;
  border-radius: 999px;
}
```

### CSS AND SEE

You should see tag pills.

Change something:
- Change tag background to `#fef3c7`
- Save and observe color change
- Change it back

---

### Concept: Conditional Rendering with Logical AND

**What it is:** Conditional rendering with logical AND (`condition && element`) renders an element only when condition is truthy.

**The problem before:** Always rendering an optional field creates empty rows and noisy UI.

**The solution:** Render optional rows only when optional data exists.

**Canonical example (General Explanation):**
- Analogy: print apartment number on a shipping label only when provided
- Minimal code form: `{note && <p>{note}</p>}`
- Why this works: JSX includes the node only when note is present

**Project Application (The "Why" here):** Event cards should not show blank note space when note is absent.

**Smallest possible example:**

```tsx
function Bio({ bio }: { bio?: string }) {
  return <>{bio && <p>{bio}</p>}</>;
}
```

**Why it matters here:** Optional data should not degrade layout clarity.

**Constraints:** Condition must represent the exact presence rule you want.

**Failure modes:** Using loose checks can hide valid values like `0` in numeric contexts.

**Operational reality:** Production UIs define explicit rendering policies for empty, missing, and loading states.

**You will see this again in:**
- Optional profile fields
- Feature flag UI blocks
- Error banners
- Loading placeholders
- Dashboard widgets

**Watch for:** Confusing fallback operators with conditional node rendering.

---

## Step 3 — Introduce EventCard with a Typed Contract

Add contract + component first:

```tsx
interface EventCardProps {
  id: string;
  tag: string;
  title: string;
  time: string;
  note?: string;
}

function EventCard(props: EventCardProps) {
  return (
    <article className="event-card" data-id={props.id}>
      <span>{props.tag}</span>
      <h2>{props.title}</h2>
      <p>{props.time}</p>
      {props.note && <p>{props.note}</p>}
    </article>
  );
}
```

Now replace inline article in `EventBoard` with component usage:

```tsx
<section>
  {events.map((event) => (
    <EventCard
      key={event.id}
      id={event.id}
      tag={event.tag}
      title={event.title}
      time={event.time}
      note={event.note}
    />
  ))}
</section>
```

### SAVE AND TRY

Save and run.

You should see:
- Same two cards
- First card shows note
- Second card has no blank note row

In DevTools Console:

```js
Array.from(document.querySelectorAll('.event-card')).map((el) => el.getAttribute('data-id'))
```

Expected:
- `['e1', 'e2']`

Change something:
- Add note to second event
- Save and confirm second card now shows note row
- Remove it again

---

## Step 4 — Name the Alternative and Tradeoff

Alternative approach:

```tsx
{props.note ? <p>{props.note}</p> : <p>No note provided</p>}
```

Decision format:
- We chose conditional absence (`&&`) because missing note is not an error state here.
- Alternative placeholder text can be better for required process fields (for example, "Status missing").
- In this context, placeholder noise harms scanability.

### SAVE AND TRY

Temporarily switch to placeholder alternative.

You should see:
- Second card now always shows `No note provided`

Change something:
- Revert to `&&` version
- Save and confirm cleaner output

---

## 🎯 Challenge: Contract Evolution Without Breaking Callers

**You know:** Typed contracts and optional props.

**Task:** Add optional `location?: string` to the component contract and render it only when present.

**Starting code:** Step 3 version.

**Hints:**
1. Add field to `EventCardProps` first.
2. Use another AND-rendered paragraph.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
interface EventCardProps {
  id: string;
  tag: string;
  title: string;
  time: string;
  note?: string;
  location?: string;
}

function EventCard(props: EventCardProps) {
  return (
    <article className="event-card" data-id={props.id}>
      <span>{props.tag}</span>
      <h2>{props.title}</h2>
      <p>{props.time}</p>
      {props.note && <p>{props.note}</p>}
      {props.location && <p>Location: {props.location}</p>}
    </article>
  );
}
```

**Key insight:** Contracts can evolve safely when additions are optional and render rules stay explicit.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| EventCard abstraction exists | Parent view no longer contains full card markup inline |
| Contract enforces required fields | Removing required field from one usage causes type error |
| Optional note renders only when present | Cards without note show no blank note row |
| Alternative decision was validated | Placeholder variant tested and reverted intentionally |
| Stable list mapping retained | Event count on screen matches array length |

---

## Quick Check Answers

**1. Why is a typed component contract safer than passing random fields?**
It moves mismatch detection to compile time and documents required vs optional inputs. In this lab, `EventCardProps` guarantees core fields exist before render.

**2. What should happen if optional data is missing: empty placeholder or no element?**
It depends on UX intent. Here, absence means optional metadata, so no element is the cleaner choice.

**3. Prediction: if a component always renders a note paragraph but note is undefined, what appears on screen?**
You get empty or noisy output and inconsistent spacing. The raw version demonstrated this failure mode.

**4. If two components use different field names for the same idea, what class of bugs appears?**
Contract drift bugs: data may exist but not render because interfaces disagree (for example `eventTitle` vs `title`).

---

## What You Can Build Now

You can now design UI components as explicit contracts instead of ad hoc markup blocks, and you can handle optional data without degrading layout clarity. You know how to decide between rendering nothing and rendering placeholders, and how to justify that decision with a concrete tradeoff. If it works: repeated cards render consistently, required fields are enforced by type contracts, and optional fields appear only when truly present.
