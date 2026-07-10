# 012 — Component Composition

*Building a complete layout by combining components, the children prop, and component slots*

---

## What You Will Build

You will build the full application shell: a header, a main content area, and a sidebar — assembled from components. Each region is a separate component. The shell component combines them into a layout. A `<Card>` wrapper component accepts `children`, making it reusable without knowing what it wraps.

By the end of this lesson, the app has a layout that matches the structure of the real open-calc shell — the same outer structure the labs render inside.

---

## What You Need to Know First

Lesson 011 — Props: The Component Contract. Props, function props, and the data-flow model.

Lesson 009 — React Components. Component functions and JSX.

---

## The Lesson

### What composition means

You built `LabCard` in lesson 011. It is one kind of card: a lab card. The platform also needs cards for other things — settings panels, lesson previews, status displays.

Two approaches:

**Approach 1 — specialise:** Build `LabCard`, `LessonCard`, `StatusCard`, `SettingsCard`. Each renders its own wrapper (border, padding, shadow) and its own content.

**Approach 2 — compose:** Build one `<Card>` component that provides the wrapper. Build `<LabContent>`, `<LessonContent>`, `<StatusContent>` for the interior. Compose them: `<Card><LabContent .../></Card>`.

Approach 2 is **composition**: assembling functionality from parts. The wrapper logic lives in one place (`Card`). The content logic lives in its own component. Neither depends on the other's internals.

---

**CS lens — composition vs inheritance:**

In object-oriented programming, reuse is often achieved through **inheritance**: a `LabCard` class extends a `Card` class and inherits its rendering methods.

React's model is composition, not inheritance. Components do not extend each other. Instead, a parent component renders a child component inside itself, passing what the child needs via props.

Composition is more flexible than inheritance because:
- A component can compose multiple other components (multiple "parents" through composition; only one through single inheritance)
- Components can be swapped at runtime by changing which component is passed as a prop or child
- There is no coupling to a class hierarchy — adding a new type of card does not require finding the right parent class

The React team explicitly states that composition is the recommended pattern for all cases where inheritance might seem natural. The `children` prop is the primary mechanism.

---

### The `children` prop

React has one special prop that every element implicitly accepts: `children`. When you write:

```jsx
<Card>
  <LabCard title="Robot Arm" ... />
</Card>
```

React passes whatever is between `<Card>` and `</Card>` as `props.children` inside the `Card` component. `Card` renders `children` wherever it wants:

```jsx
function Card({ children }) {
  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
      {children}
    </div>
  )
}
```

`children` can be:
- A single React element: `<Card><p>text</p></Card>`
- Multiple elements: `<Card><h1>title</h1><p>body</p></Card>`
- A string: `<Card>Hello</Card>`
- An array of elements (from `.map()`)
- `undefined` (if `<Card />` is self-closed with no children)

`Card` does not need to know what its children are. It applies the border, padding, and shadow, then renders whatever was passed. This is **inversion of control**: the parent (`App`) controls the content; the component (`Card`) controls the wrapper.

---

**SE lens — the open/closed principle:**

The **open/closed principle** (from SOLID): a software component should be open for extension but closed for modification.

`Card` is closed for modification — you do not change it to support new content types. It is open for extension — you extend its capabilities by passing different children.

Compare to the closed approach: a `Card` that accepts a `type` prop:

```jsx
function Card({ type, ...data }) {
  if (type === 'lab')     return <div className="card"><LabContent {...data} /></div>
  if (type === 'lesson')  return <div className="card"><LessonContent {...data} /></div>
  if (type === 'status')  return <div className="card"><StatusContent {...data} /></div>
}
```

Every new card type requires modifying `Card`. The component grows with every new type. The open/closed principle says this is the wrong shape.

With `children`:

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>
}
```

Adding a new type: `<Card><NewContent ... /></Card>`. `Card` is never modified.

---

### Build the layout components

Create `src/AppShell.jsx` — the top-level layout:

```jsx
// src/AppShell.jsx

export default function AppShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {children}
    </div>
  )
}
```

`minHeight: '100vh'` — the shell fills at least the full viewport height (`100vh` = 100% of the viewport height). If the content is shorter than the viewport, the shell still extends to the bottom.

---

Create `src/AppHeader.jsx`:

```jsx
// src/AppHeader.jsx

export default function AppHeader({ platformName = 'my-platform', activeLabName = null }) {
  return (
    <header style={{
      background: '#1a1a2e',
      color: '#fff',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px' }}>
          {platformName}
        </span>
        {activeLabName !== null && (
          <>
            <span style={{ color: '#555', fontSize: '16px' }}>›</span>
            <span style={{ fontSize: '15px', color: '#ccc' }}>{activeLabName}</span>
          </>
        )}
      </div>
      <nav style={{ display: 'flex', gap: '20px' }}>
        <a href="/"       style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Home</a>
        <a href="/labs"   style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Labs</a>
        <a href="/about"  style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>About</a>
      </nav>
    </header>
  )
}
```

**Walkthrough:**

`activeLabName = null` — default value: `null`. This means the prop is optional. When no lab is active (the home screen), `activeLabName` is `null` and the breadcrumb does not render. When a lab is open, the parent passes `activeLabName="Robot Arm Simulator"` and the breadcrumb appears.

`{activeLabName !== null && ( <> ... </> )}` — conditional rendering with a fragment. If `activeLabName` is not null, renders the breadcrumb separator and label. The fragment wraps two elements (the separator `›` and the lab name span) without adding a DOM node.

`flexShrink: 0` — in a flex column (the `AppShell`), all children can shrink to fit. `flexShrink: 0` tells the header never to shrink — it always stays at exactly 56px height. Without this, a content-heavy page might compress the header.

`<a href="...">` — standard HTML anchor elements for navigation. These cause a full page reload on click. In lesson 018 (Single-Page Applications) and lesson 019 (React Router), these will be replaced with `<Link>` components that navigate without reloading. For now, the links are placeholders.

---

Create `src/Card.jsx`:

```jsx
// src/Card.jsx

export default function Card({ children, padding = '20px', elevation = 'default' }) {
  const shadows = {
    none:    'none',
    default: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.12)',
    raised:  '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.08)',
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding,
      boxShadow: shadows[elevation] ?? shadows.default,
    }}>
      {children}
    </div>
  )
}
```

`padding` — the padding prop accepts any valid CSS value as a string: `'16px'`, `'24px 16px'`, `'0'`. Passing a CSS value directly as a prop is flexible — the caller controls the spacing for their context. The default `'20px'` is appropriate for most card content.

`elevation` — controls the shadow depth: `'none'` (flat), `'default'` (subtle depth), `'raised'` (more prominent). This is the kind of design token system where props accept a semantic name (`'raised'`) rather than a raw CSS value — the component maps names to values internally.

`boxShadow: shadows[elevation] ?? shadows.default` — lookup with fallback. `?? shadows.default` handles `undefined` (unknown elevation) by falling back to the default.

---

Create `src/ContentArea.jsx`:

```jsx
// src/ContentArea.jsx

export default function ContentArea({ children }) {
  return (
    <main style={{
      flex: 1,
      padding: '32px 24px',
      maxWidth: '960px',
      margin: '0 auto',
      width: '100%',
    }}>
      {children}
    </main>
  )
}
```

`flex: 1` — in the `AppShell` flex column, `flex: 1` tells the `<main>` to grow and fill all remaining vertical space after the header. Header is `56px`; everything else fills the rest. Without `flex: 1`, the `<main>` would be only as tall as its content.

`maxWidth: '960px', margin: '0 auto'` — the classic centred layout. `margin: '0 auto'` with a `max-width` produces a centred container with space on both sides on wide viewports, and full-width on narrow viewports. `width: '100%'` ensures it fills the available space up to the max-width.

---

### Assemble the layout in App.jsx

```jsx
// src/App.jsx

import AppShell     from './AppShell.jsx'
import AppHeader    from './AppHeader.jsx'
import ContentArea  from './ContentArea.jsx'
import Card         from './Card.jsx'
import LabCard      from './LabCard.jsx'

const labs = [
  {
    id: 'robot-arm',
    title: 'Robot Arm Simulator',
    description: 'Program a 3-axis robot arm using real MATLAB and Python commands.',
    category: 'code',
    difficulty: 'intermediate',
  },
  {
    id: 'rubiks-cube',
    title: "Rubik's Cube Solver",
    description: "Explore group theory through the Rubik's Cube.",
    category: 'math',
    difficulty: 'advanced',
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    description: 'Build a fully functional Space Invaders game from scratch.',
    category: 'code',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra',
    title: 'Linear Algebra Visualiser',
    description: 'See matrix multiplication and eigenvectors in real time.',
    category: 'math',
    difficulty: 'beginner',
  },
]

export default function App() {
  function handleLaunch(labId) {
    console.log('Launching:', labId)
  }

  return (
    <AppShell>
      <AppHeader platformName="my-platform" />

      <ContentArea>
        <Card padding="24px 32px" elevation="raised">
          <h1 style={{ margin: '0 0 8px', fontSize: '22px' }}>Labs</h1>
          <p style={{ margin: '0 0 24px', color: '#666' }}>
            {labs.length} interactive labs available
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {labs.map((lab) => (
              <LabCard
                key={lab.id}
                title={lab.title}
                description={lab.description}
                category={lab.category}
                difficulty={lab.difficulty}
                onLaunch={() => handleLaunch(lab.id)}
              />
            ))}
          </div>
        </Card>
      </ContentArea>
    </AppShell>
  )
}
```

**Walkthrough:**

```jsx
<AppShell>
  <AppHeader ... />
  <ContentArea>
    <Card ...>
      ...
    </Card>
  </ContentArea>
</AppShell>
```

This is the **component tree** written as nested JSX. Reading from outside to inside:
1. `AppShell` — the full-page flex column with background
2. `AppHeader` — the 56px dark header
3. `ContentArea` — the `<main>` that fills remaining space, centred at 960px
4. `Card` — white card with border-radius and shadow
5. The heading and lab grid — specific content for this page

Each layer has one responsibility. Changing the header's design touches only `AppHeader`. Changing the card's shadow touches only `Card`. The content (labs) is separate from the layout.

`<Card padding="24px 32px" elevation="raised">` — both props are strings. The `<Card>` does not know what it wraps; `App` does not know how `Card` applies its styling. The separation is clean.

---

**CS lens — the component tree as a tree data structure:**

The component tree is a **rooted tree** (a graph with a single root where every node has exactly one parent). `App` is the root. `AppShell`, `AppHeader`, `ContentArea`, `Card`, `LabCard` are nodes. The tree structure determines render order (parent before children) and data flow direction (parent to child, never child to parent via props).

React's rendering algorithm traverses this tree depth-first: it renders `AppShell` first, then recurses into its children, rendering `AppHeader` (leaf — no children), then `ContentArea`, then `Card`, then each `LabCard` in turn.

The reconciliation algorithm (diff between old and new trees) also traverses this structure. When state changes at the `App` level, React re-renders `App`, then diffs the new tree against the old tree to find which sub-trees changed.

Leaf components (components with no children) are re-rendered only if their props change. This is where React's performance model comes from: the component tree can be large, but only affected sub-trees re-render.

---

**SE lens — layout as infrastructure:**

`AppShell`, `AppHeader`, and `ContentArea` are **layout infrastructure** — components that provide structure without being page-specific. They do not know about labs, lessons, or any specific content. They are page-agnostic.

When lesson 019 adds React Router, the router will replace `ContentArea`'s children based on the current URL — the labs grid on `/labs`, a lesson page on `/lessons`, a settings page on `/settings`. The layout components do not change. The shell remains; only the content changes.

This is the **app shell architecture**: a persistent outer shell that hosts transient content. The shell is loaded once and stays in memory. The content changes as the user navigates. This is how the open-calc platform achieves its sub-100ms navigation performance for already-visited pages — the shell (including navigation, header, styles) never reloads.

---

### The `children` prop at multiple levels

Notice the nesting:

```jsx
<ContentArea>     ← children: the Card element
  <Card>          ← children: the heading, paragraph, and grid
    <LabCard />   ← no children (self-closing)
  </Card>
</ContentArea>
```

`ContentArea` receives `Card` as its `children` prop. `Card` receives the heading, paragraph, and lab grid as its `children` prop. `LabCard` has no `children` prop — it renders its own content.

Each component's `children` is the content inside it in JSX. This is standard HTML nesting, applied to components.

---

**CS lens — composition as an algebraic operation:**

In mathematics, a function that takes a function as an argument and returns a function is called a **higher-order function**. `Card` is a higher-order component in the same sense: it takes components (its children) as a prop and wraps them in a new component.

The `children` prop makes composition **algebraically consistent**: you can compose components at any level without special syntax. `<Card><LabCard /></Card>` is valid. `<Card><Card><LabCard /></Card></Card>` is also valid (though pointless). The composition operation is closed — composing components always produces a component.

This is different from, say, mixins or multiple inheritance, where composed entities can produce unexpected combinations. With the `children` prop, the composed result is always predictable: the wrapper applies its wrapper logic; the children provide their content.

---

## Connect the Pieces

**Connection to lesson 021:** The app shell pattern from this lesson — a persistent shell, transient content — is the explicit topic of lesson 021. `AppShell`, `AppHeader`, and `ContentArea` are preview implementations of the pattern.

**Connection to lesson 019:** When React Router is added, `ContentArea`'s children will come from a `<Routes>` component, not from hardcoded JSX. The `AppShell` and `AppHeader` will not change.

**Connection to lesson 022:** The lab registry feeds into `ContentArea`. The registry provides the list; the composition structure from this lesson determines where that list renders.

**Connection to lesson 027:** Layout components like `Card` and `AppHeader` are straightforward to test — pass props, assert rendered structure. The `children` prop makes `Card` testable by rendering it with controlled content.

---

## What Breaks Without This

**Without `flex: 1` on `ContentArea`:**

The main area is only as tall as its content. If there are four cards, the page height is roughly 4 × card height + header height. The background colour (`#f8f9fa`) only extends to the content bottom, leaving the rest of the viewport as browser default white. Visual inconsistency — the design does not fill the viewport.

**Without `flexShrink: 0` on `AppHeader`:**

In a tall-content scenario, the flex algorithm distributes shrink across all flex children. The header would compress when there is more content than viewport height, causing the header height to collapse and its content to overflow or clip. `flexShrink: 0` prevents this: the header is always 56px.

**Children that are not React-renderable:**

```jsx
<Card>{undefined}</Card>
// renders: an empty Card, no error

<Card>{[1, 2, 3]}</Card>
// renders: "123" as text — arrays of primitives are each rendered as text

<Card>{{ key: 'value' }}</Card>
// Error: Objects are not valid as a React child.
// React can render primitives, React elements, and arrays of those.
// Plain objects are not valid children.
```

The object error is a common mistake when accidentally passing an object where a string or React element is expected. The error message is clear: "Objects are not valid as a React child. If you meant to render a collection of children, use an array instead."

---

## Definition of Done

- [ ] `src/AppShell.jsx`, `src/AppHeader.jsx`, `src/ContentArea.jsx`, `src/Card.jsx` all exist
- [ ] `src/App.jsx` composes all four layout components around the lab grid
- [ ] Opening `localhost:5173` shows the full layout: dark header, centred card, lab grid
- [ ] The header displays "my-platform" with nav links on the right
- [ ] You can explain what `props.children` is and how it is set by JSX
- [ ] You can explain why `Card` is more reusable than a `LabCard` that includes its own wrapper
- [ ] You can explain what `flex: 1` does on `ContentArea` and what breaks without it
- [ ] You can explain the open/closed principle as it applies to `Card` and its `children` prop
- [ ] Git commit:
  ```
  git add src/AppShell.jsx src/AppHeader.jsx src/ContentArea.jsx src/Card.jsx src/App.jsx
  git commit -m "Add layout composition: AppShell, AppHeader, ContentArea, Card

  AppShell provides the full-page flex column with background.
  AppHeader is the 56px dark navigation bar.
  ContentArea is the centred, flex-growing main area.
  Card wraps any children in a white bordered container.
  App assembles the complete layout from these four components."
  ```
