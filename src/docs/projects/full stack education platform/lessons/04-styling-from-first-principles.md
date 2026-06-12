# Lesson 04 — Styling From First Principles

## What You Will Build

Style the app. A proper layout with a navigation bar at the top, a content area in the
middle, and consistent spacing throughout. Mobile-responsive. The app goes from looking
like a developer prototype to looking designed. Every style decision in this lesson is
explained as what it is: a layout algorithm, not a magic incantation.

---

## What You Need to Know First

- Lesson 03: Component structure, `StyleSheet.create`, the component tree

---

## The Lesson

### Step 1 — The Box Model

Every element in a UI is a **rectangle**. Every rectangle has four zones, from innermost
to outermost:

```
┌─────────────────────────────────┐
│           margin                │
│  ┌───────────────────────────┐  │
│  │         border            │  │
│  │  ┌─────────────────────┐  │  │
│  │  │      padding        │  │  │
│  │  │  ┌───────────────┐  │  │  │
│  │  │  │    content    │  │  │  │
│  │  │  └───────────────┘  │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

- **Content** — the actual text, image, or child elements
- **Padding** — space between the content and the border; part of the element's
  background
- **Border** — a visible line around the element (optional)
- **Margin** — space between this element and its neighbours; transparent

This is the **box model** — a layout algorithm, not a visual preference. Understanding
it is required to predict where things appear on screen.

```typescript
const styles = StyleSheet.create({
  card: {
    padding: 16,         // 16dp inside the card on all four sides
    margin: 12,          // 12dp space between this card and the next
    borderWidth: 1,      // 1dp visible border
    borderColor: '#e5e7eb',
    borderRadius: 8,     // rounds the corners
  }
})
```

**`dp` (density-independent pixels):** React Native uses density-independent pixels
rather than physical pixels. On a high-density screen (like a Retina display), `1dp`
maps to 2 or 3 physical pixels. The number `16` means "16dp" — the same physical size on
every screen regardless of its pixel density.

### Step 2 — Flexbox as an Algorithm

Flexbox is the layout algorithm React Native uses for almost everything. Before learning
the syntax, understand what Flexbox computes.

**The main axis and the cross axis:**
A flex container has a **direction** (row or column). The **main axis** runs in that
direction; the **cross axis** runs perpendicular.

```
direction: 'row'
main axis ─────►
cross axis
    │
    ▼
```

```
direction: 'column' (default in React Native)
cross axis ──────►
main axis
    │
    ▼
```

**`justifyContent`** controls how children are distributed along the **main axis**:
- `'flex-start'` — pack at the beginning
- `'flex-end'` — pack at the end
- `'center'` — centre in the middle
- `'space-between'` — first and last touch the edges; others evenly spaced between
- `'space-around'` — equal space around each child (edges have half as much space)

**`alignItems`** controls how children are aligned on the **cross axis**:
- `'flex-start'` — align to the start of the cross axis
- `'flex-end'` — align to the end
- `'center'` — centre on the cross axis
- `'stretch'` — stretch to fill the cross axis (default)

**`flex: 1` explained mathematically:**
`flex` is a ratio that controls how remaining space is distributed. If the container
has 400dp and child A has `flex: 1`, child B has `flex: 2`, and child C has `flex: 1`:
the total flex units are `1 + 2 + 1 = 4`. Child A gets `400 × 1/4 = 100dp`, child B
gets `400 × 2/4 = 200dp`, child C gets `400 × 1/4 = 100dp`. `flex: 1` on its own
means "take all remaining space after fixed-size items."

**CS lens:** Flexbox is an algorithm, not a set of style rules. Given a set of constraints
(container size, flex values, minimum/maximum sizes), it computes the position and size
of every child. The algorithm runs on every render. This is why `flex: 1` produces
different pixel values on different screen sizes — it is computed, not hardcoded.

### Step 3 — Design Tokens

A **design token** is a named constant for a visual value — a colour, a size, a
typeface. Instead of writing `color: '#3b82f6'` in fifty places, you write
`color: colors.primary`. When the brand colour changes, you change one constant.

Create `src/theme.ts`:

```typescript
export const colors = {
  primary: '#3b82f6',
  primaryDark: '#1d4ed8',
  background: '#f9fafb',
  surface: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#22c55e',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const typography = {
  sizeXs: 12,
  sizeSm: 14,
  sizeMd: 16,
  sizeLg: 20,
  sizeXl: 24,
  sizeXxl: 32,
  weightRegular: '400',
  weightMedium: '500',
  weightSemiBold: '600',
  weightBold: '700',
} as const
```

**`as const` explained:**
`as const` is a TypeScript **type assertion** that tells the compiler to infer the
narrowest possible type for this object. Without it, TypeScript infers `primary`
as type `string` (any string). With `as const`, TypeScript infers it as the literal
type `'#3b82f6'` — this exact string and no other. This means TypeScript can verify that
everywhere you use `colors.primary`, you are using a valid colour constant.

**SE lens — the open/closed principle:**
The design token system implements the **open/closed principle**: the system is closed
for modification (you do not change individual component styles) but open for extension
(adding a new colour is a matter of adding one entry to `theme.ts`). Changing the entire
app's colour scheme is a one-line change in `theme.ts`, not a hundred-file search-and-replace.

This is the same principle that will shape the executor registry in Lesson 21: adding
a new language requires adding one executor, not modifying the dispatch logic.

### Step 4 — Applying Tokens to Components

Update `Header.tsx` to use the design tokens:

```typescript
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '../theme'

interface HeaderProps {
  readonly title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.sizeXl,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
})
```

**`import { colors, spacing, typography } from '../theme'` explained:**
`'../theme'` is a relative path — `..` goes up one directory (from `src/components/`
to `src/`), then looks for `theme` (resolved to `theme.ts`). We import three named
exports: the three constant objects. The component now has zero hardcoded values —
every visual decision is traced back to a token.

### Step 5 — The `Card` Component

Create `src/components/Card.tsx` — a reusable container for list items:

```typescript
import { StyleSheet, View } from 'react-native'
import { colors, spacing } from '../theme'

interface CardProps {
  readonly children: React.ReactNode
}

export function Card({ children }: CardProps) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
})
```

**`React.ReactNode` explained:**
`React.ReactNode` is a TypeScript type that accepts anything React can render: a component,
a string, a number, `null`, an array of any of these. `children` is the content placed
between a component's opening and closing tags:

```tsx
<Card>
  <Text>This text is children</Text>
</Card>
```

The `children` prop is React's mechanism for **composition through slotting**: a container
component does not know what goes inside it; the caller decides.

**`elevation` vs `shadow*`:** React Native uses platform-specific shadow APIs.
`elevation` is Android's shadow implementation. `shadowColor`, `shadowOffset`,
`shadowOpacity`, and `shadowRadius` are iOS's. To support both platforms, you specify
both sets of properties.

### Step 6 — NativeWind (Tailwind for React Native)

**What Tailwind CSS is:** Tailwind is a **utility-first CSS framework** — instead of
writing named classes (`.card`, `.header`), you compose small utility classes
(`flex items-center p-4 bg-white`). Each utility class does one thing. The combination
describes the full appearance.

**What NativeWind is:** NativeWind brings Tailwind to React Native, translating the
same utility class names to React Native `StyleSheet` equivalents.

**Install NativeWind:**
```bash
$ npm install nativewind
$ npm install --save-dev tailwindcss
$ npx tailwindcss init
```

`npm install nativewind` — adds NativeWind as a runtime dependency (needed in production
because it processes class names at runtime).

`npm install --save-dev tailwindcss` — adds Tailwind as a dev dependency (used at build
time to generate the set of valid utility classes).

`npx tailwindcss init` — creates `tailwind.config.js` with default configuration.

**`tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Every field:
- `content` — paths to files containing Tailwind class names. Tailwind scans these files
  to determine which utility classes are used, then generates CSS for only those classes.
  This is called **tree shaking for CSS**: unused classes are removed from the output.
- `theme.extend` — custom additions to Tailwind's default scale (colours, spacing, etc.).
  Empty here — we use Tailwind's defaults.
- `plugins` — third-party Tailwind plugins. None here.

**Update `babel.config.js`** (Expo uses Babel to transform code before running):
```javascript
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  }
}
```

`plugins: ['nativewind/babel']` adds NativeWind's Babel transform, which converts
`className` props into React Native style objects at compile time.

**SE lens — separation of concerns:**
Styles live separately from logic. With design tokens, styles are defined once and
referenced by name. With utility classes, styles are composed from primitives without
naming individual components. Both approaches share the same goal: avoid coupling visual
decisions to individual components.

---

## Connect the Pieces

The design token system introduced here — named constants for colours and spacing —
is the same pattern as named constants in any code. A `colors.primary` that changes
once affects the whole app, exactly as a `TIMEOUT_MS = 15000` constant changed once
affects every timeout in the executor (Lesson 06 of the markdown editor curriculum).

The box model and Flexbox algorithm run on every render. This is a **hot path** (code
that runs frequently). React Native batches style calculations for performance, but
the principle of not doing unnecessary work in rendering applies throughout: Lesson 26
will show how to measure and reduce wasted renders with `useMemo` and `React.memo`.

In production applications like Airbnb, Shopify's mobile app, and GitHub's mobile app,
design tokens are managed in dedicated design system packages. The token names (`primary`,
`surface`, `textSecondary`) are the same vocabulary that designers use in Figma — the
code and the design use the same language, which reduces translation errors.

---

## What Breaks Without This

Without design tokens, changing the primary colour from blue to green requires editing
every component file. With 40 screens and 200 style objects, that is a two-hour task
that will miss three occurrences and introduce inconsistency. With tokens, it is one
change in one file.

Without `as const`, TypeScript infers `colors.primary` as type `string`. Code that
accidentally assigns `colors.primary = '#ff0000'` would be valid TypeScript. With
`as const`, the object is immutable at the type level: `colors.primary` is always
`'#3b82f6'`.

---

## Definition of Done

- [ ] The app has consistent spacing using the `spacing` tokens
- [ ] Colours are defined in `theme.ts` and imported by components (no hardcoded hex values)
- [ ] The layout uses Flexbox with `justifyContent` and `alignItems` explained
- [ ] You can answer: what are the four zones of the box model and what does each do?
- [ ] You can answer: what does `flex: 1` mean mathematically?
- [ ] You can answer: what is a design token and why does it implement the open/closed principle?
- [ ] You can answer: what does `as const` do to the inferred type?
- [ ] `git commit` with a message explaining why — "Add design token system and apply consistent Flexbox layout"
