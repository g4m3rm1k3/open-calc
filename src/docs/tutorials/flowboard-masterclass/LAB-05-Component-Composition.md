# FlowBoard Masterclass — LAB 05 — Component Composition and Single Responsibility

**Prerequisites:** LAB-04 complete. You have a list of cards rendering with consistent spacing and layout.

**What this lab adds:**
- A mental model for when to split one component into two (abstraction first)
- The `List` component that wraps `Card` components (FlowBoard application)
- Proof that this pattern works in email clients, chat apps, and data dashboards (transfer)

**Time:** 60–75 minutes

---

## What You Will Build

The same visual list of cards, but structured as a reusable `List` component that could wrap any repeating UI element — not just cards.

**Before this lab:**
```
App.tsx renders hardcoded Card components directly
```

**After this lab:**
```
App.tsx renders <List /> component
List.tsx renders Card components from props
```

Visually, nothing changes. Architecturally, everything changes.

---

## Quick Check — answer before reading further

1. What is the difference between repeating HTML and composing components?
2. When should you split one big component into two smaller ones?
3. How does a component "not know" what it is rendering?

*(Answers at the end of this lab)*

---

## Abstraction Block 1: What is Component Composition?

### The Problem (Raw Version First)

Open `flowbard/src/App.tsx` and look at your current list rendering:

```tsx
const cards = [
  { id: '1', title: 'Fix the login bug', label: 'Bug' },
  { id: '2', title: 'Add dark mode', label: 'Feature' },
  { id: '3', title: 'Optimize queries', label: 'Performance' },
];

export default function App() {
  return (
    <div className="app-container">
      <div className="list-column">
        {cards.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            title={card.title}
            label={card.label}
          />
        ))}
      </div>
    </div>
  );
}
```

**The pain point:** If you later want to render a different list (e.g., a list of users, a list of projects), you'd copy this entire `.map()` structure. The list *structure* (render many things with a key) is separated from the list *content* (what each thing is).

### The Abstraction

**Component composition** is a pattern where:
- The outer component (`List`) defines how to **render a collection**
- The outer component does NOT know what each item is
- The inner component (`Card`) defines what each item **looks like**

**What it hides:**
- The `.map()` loop logic
- The `key` management
- The collection render pattern
- Any future changes to "how lists render"

**Protected invariant:**
- A list always renders items in order, with stable keys
- Changing how items render never requires changing how the list renders them

**Raw version pain (without abstraction):**

If you want a list of users, you'd write:

```tsx
const users = [
  { id: 'u1', name: 'Alice', role: 'Admin' },
  { id: 'u2', name: 'Bob', role: 'Member' },
];

export default function UserPage() {
  return (
    <div className="user-list">
      {users.map((user) => (
        <UserCard
          key={user.id}
          id={user.id}
          name={user.name}
          role={user.role}
        />
      ))}
    </div>
  );
}
```

Notice: **you repeated the `.map()` pattern**. If you later decide lists should have virtualization, pagination, or filtering, you'd fix it in two places, four places, N places.

**With the abstraction:**

```tsx
<List 
  items={users} 
  renderItem={(user) => <UserCard key={user.id} {...user} />} 
/>
```

The list behavior lives in one place. The item appearance lives in another.

---

## Step 1 — Extract the List Component (Raw Structure)

Create `flowbard/src/List.tsx`:

```tsx
interface ListProps {
  children: React.ReactNode;
}

export default function List({ children }: ListProps) {
  return <div className="list">{children}</div>;
}
```

This is intentionally simple — it just wraps children in a div with a class.

### CSS AND SEE

Create `flowbard/src/List.css`:

```css
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

This is identical to what you already have in `App.css` for `.list-column`. We're just moving it.

### Step 2 — Move the Card List into `List`

Update `flowbard/src/List.tsx` to render the cards:

```tsx
import Card from './Card';
import type { CardData } from './Card';
import './List.css';

interface ListProps {
  items: CardData[];
}

export default function List({ items }: ListProps) {
  return (
    <div className="list">
      {items.map((card) => (
        <Card
          key={card.id}
          id={card.id}
          title={card.title}
          label={card.label}
        />
      ))}
    </div>
  );
}
```

### SAVE AND TRY

Update `flowbard/src/App.tsx`:

```tsx
import List from './List';
import type { CardData } from './Card';
import './App.css';

const cards: CardData[] = [
  { id: '1', title: 'Fix the login bug', label: 'Bug' },
  { id: '2', title: 'Add dark mode', label: 'Feature' },
  { id: '3', title: 'Optimize queries', label: 'Performance' },
];

export default function App() {
  return (
    <div className="app-container">
      <List items={cards} />
    </div>
  );
}
```

You should see:
- Same cards on screen as before
- Same spacing and layout

Change something:
- Temporarily change one card's title in the `cards` array
- Verify it updates on screen
- Change it back

---

## Concept Block 2: Single Responsibility Principle (SRP) for Components

### What It Is

**Single Responsibility Principle** means: each component has one job and one reason to change.

- `List`'s job: render a collection with consistent spacing and structure
- `Card`'s job: render one item with its title, label, and styling

### The Raw Version (Before SRP)

Here's `App.tsx` **without** SRP:

```tsx
export default function App() {
  const cards = [
    { id: '1', title: 'Fix the login bug', label: 'Bug' },
    { id: '2', title: 'Add dark mode', label: 'Feature' },
    { id: '3', title: 'Optimize queries', label: 'Performance' },
  ];

  return (
    <div className="app-container">
      <div className="list">
        {cards.map((card) => (
          <div
            key={card.id}
            className="card"
            style={{
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              {card.title}
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**The problem:**
- `App` knows how to render the list
- `App` knows how to render each card
- `App` knows the styling details
- If you want a different card style, you change `App`
- If you want a different list structure, you change `App`
- `App` has THREE reasons to change

### With SRP

- `App` owns the data
- `List` owns how to arrange items
- `Card` owns how to display one item

Each has one reason to change.

### The Pain Point (Why It Matters)

Imagine later you want to:
1. Add a header to the list — change `List`, not `App`
2. Add an icon to each card — change `Card`, not `App`
3. Add filtering to the list — change `List`, not `App`

Without SRP, you'd change `App` three times. With SRP, each component changes in isolation.

---

## Step 3 — Verify SRP: Change Card Styling in Isolation

In `flowbard/src/Card.css`, add a background color:

```css
.card {
  padding: 16px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  background-color: #f9f9f9;
}
```

### CSS AND SEE

Save and observe:
- Cards now have a light background
- `App.tsx` did not change
- `List.tsx` did not change

This is SRP in action: one component's job, one place to change.

---

## Step 4 — Verify SRP: Add a List Header (No Card Changes)

Update `flowbard/src/List.tsx`:

```tsx
import Card from './Card';
import type { CardData } from './Card';
import './List.css';

interface ListProps {
  items: CardData[];
  title?: string;
}

export default function List({ items, title }: ListProps) {
  return (
    <div className="list-container">
      {title && <h2 className="list-title">{title}</h2>}
      <div className="list">
        {items.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            title={card.title}
            label={card.label}
          />
        ))}
      </div>
    </div>
  );
}
```

Update `flowbard/src/List.css`:

```css
.list-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

Update `flowbard/src/App.tsx`:

```tsx
<List items={cards} title="Active Tasks" />
```

### CSS AND SEE

You should see:
- "Active Tasks" heading above the cards
- Cards still render as before

Notice:
- `Card.tsx` did not change
- The card styling did not change
- Only `List` was responsible for its own header

---

## Concept Block 3: Where Else This Applies (Transfer)

This is not a FlowBoard pattern. This is a **universal architecture principle**.

### Transfer Example 1: Email Client

An email client has:
- `Inbox` component (renders list of emails)
- `EmailPreview` component (renders one email)

```tsx
// Same pattern
<Inbox 
  emails={emailList}
  renderItem={(email) => <EmailPreview {...email} />}
/>
```

If you want to change email styling, you change `EmailPreview`. If you want to change how the inbox organizes emails, you change `Inbox`. Neither touches the other.

### Transfer Example 2: Chat Application

A chat app has:
- `MessageThread` component (renders list of messages)
- `MessageBubble` component (renders one message)

```tsx
// Same pattern
<MessageThread
  messages={messagesFromAPI}
  renderItem={(msg) => <MessageBubble {...msg} />}
/>
```

Change message style → change `MessageBubble`.  
Change thread layout → change `MessageThread`.  
SRP enforced.

### Transfer Example 3: Data Dashboard

A dashboard has:
- `DataTable` component (renders list of rows)
- `DataRow` component (renders one row)

```tsx
// Same pattern
<DataTable
  rows={tableData}
  renderRow={(row) => <DataRow {...row} />}
/>
```

Same principle. Same pattern. Different domain.

---

## Step 5 — Verify the Abstraction Works

Change the `cards` data in `App.tsx` **without touching `List.tsx` or `Card.tsx`**:

```tsx
const cards: CardData[] = [
  { id: '1', title: 'Fix the login bug', label: 'Bug' },
  { id: '2', title: 'Add dark mode', label: 'Feature' },
  { id: '3', title: 'Optimize queries', label: 'Performance' },
  { id: '4', title: 'Improve error messages', label: 'UX' },
];
```

### SAVE AND TRY

You should see:
- Four cards rendered
- All styling consistent
- `List` automatically rendered the new item without being told

This proves the abstraction: `List` doesn't know or care how many items there are or what they contain. It just renders them.

---

## Concept Block 4: Why This Matters for "Build Any App"

Component composition is the foundation of UI architecture in React, Vue, Svelte, Flutter, and SwiftUI.

**The transferable principle:**
- Break UI into components
- Each component has one job
- Components compose (nest inside each other)
- Data flows from parent to child
- Changing one component doesn't break others

This principle works:
- In a Trello clone
- In a Gmail clone
- In a Slack clone
- In a financial dashboard
- In a real-time collaboration app

The app changes. The architecture principle does not.

---

## Final Check

Verify these are all true:

- [ ] `List.tsx` exists with `ListProps` interface accepting `items: CardData[]`
- [ ] `List.tsx` renders the `.map()` loop
- [ ] `List.tsx` has a title prop (optional) that renders as a heading
- [ ] `Card.tsx` is unchanged
- [ ] `App.tsx` only imports `List` and data, no card rendering code
- [ ] Changing card data in `App.tsx` updates the list without changing `List.tsx` or `Card.tsx`
- [ ] Adding a card to the array renders it automatically with no component changes
- [ ] You can explain why this is SRP (one component, one job, one reason to change)

---

## Mistaken Use Case (And Why It Fails)

**Wrong way:**

```tsx
// Don't do this
export default function App() {
  return (
    <List
      // passing JSX directly, not the abstraction
    >
      <Card id="1" title="Task 1" label="Bug" />
      <Card id="2" title="Task 2" label="Feature" />
      <Card id="3" title="Task 3" label="Performance" />
    </List>
  );
}
```

**Why it fails:**
- You lost the abstraction benefit
- `List` is not managing the loop
- If you want to add dynamic items, you must change `App`, not just the data
- SRP is broken: `App` still knows how to render cards

**Correct way:** Pass data to `List`, let `List` handle the loop.

---

## Abstraction Transfer Check — LAB 05

**Abstraction name:**  
Component Composition with Single Responsibility

**What it hides:**
- Loop management (`.map()`)
- Key management
- Collection rendering structure
- Coupling between list structure and item appearance

**Protected invariant:**
- A list always renders items in order with stable keys
- Changing one component's rendering never requires changing the other
- New items render automatically without component modifications

**Raw version pain recap:**
- Without composition: list rendering and item rendering live in one big component
- Changing card style requires touching list component
- Changing list structure requires touching card rendering
- Copy-paste `.map()` loops for every different item type

**Where this applies outside FlowBoard:**
- Email clients (list of emails, render one email)
- Chat apps (thread of messages, render one message)
- Data dashboards (table of rows, render one row)
- E-commerce sites (product grids, render one product)
- Social media feeds (list of posts, render one post)

**Misuse case:**

```tsx
// Wrong: item rendering inside App
export default function App() {
  return (
    <List>
      {cards.map((card) => <Card key={card.id} {...card} />)}
    </List>
  );
}
```

**Why it fails:**
- You're doing the loop in `App`, not in `List`
- List doesn't own the collection pattern anymore
- If you want to change how the list renders, you must change `App`
- SRP is broken

**Correct:**

```tsx
// Right: data and rendering separated
<List items={cards} />
```

---

## End State Summary — LAB 05

**Files that exist:**
- `App.tsx` — manages data, renders `List` with title
- `List.tsx` — renders collection with optional header, maps items to `Card` components
- `List.css` — container and list layout, title styling
- `Card.tsx` — unchanged from LAB-04
- `Card.css` — unchanged from LAB-04

**What the app does right now:**
The app renders a titled list of cards. The list component is reusable — you can pass any `CardData[]` array and it will render them all, with automatic spacing and styling. Card styling is managed by `Card.tsx`, list structure is managed by `List.tsx`. They are independent.

**Concepts now in the registry from this lab:**
- Component Composition
- Single Responsibility Principle (SRP)
- Props interface design for reusable components
- Data flow from parent to child (one way)

**Next lab will add:**
The `Board` component that renders multiple `List` components side by side with horizontal scrolling.
