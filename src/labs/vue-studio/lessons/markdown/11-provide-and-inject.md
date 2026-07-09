# Provide & Inject

## What you will build

A theme system where the root component provides the current theme and a toggle function. Any nested component — no matter how many levels deep — can inject and use them without any intermediate component passing props.

```
App.vue  provides theme + toggle
  └── Layout.vue  (does not use theme itself)
        └── Sidebar.vue  (does not use theme itself)
              └── ThemedButton.vue  injects theme + toggle
```

Click the button anywhere in the tree: the entire page switches between light and dark mode. No props pass through `Layout` or `Sidebar`.

---

## What you need to know first

Lesson 05 showed props passing data from parent to child. Each intermediate component must declare the prop and pass it along, even when it does not use the value itself. This lesson starts by building exactly that prop-drilling chain at three levels, feeling where it becomes untenable, then introducing `provide`/`inject` as the structural solution.

---

## Step 1 — Prop drilling, and the cost that grows with depth

Build a three-level component tree: `App.vue` → `Layout.vue` → `ThemedButton.vue`. `Layout.vue` does not use `theme` — it only forwards it.

Create `src/components/Layout.vue`:

```html
<script setup lang="ts">
defineProps<{
  theme: 'light' | 'dark'
  onToggle: () => void
}>()
</script>

<template>
  <div :class="['layout', theme]">
    <slot />
    <ThemedButton :theme="theme" :on-toggle="onToggle" />
  </div>
</template>
```

Create `src/components/ThemedButton.vue`:

```html
<script setup lang="ts">
defineProps<{
  theme: 'light' | 'dark'
  onToggle: () => void
}>()
</script>

<template>
  <button @click="onToggle">
    Switch to {{ theme === 'light' ? 'dark' : 'light' }} mode
  </button>
</template>
```

`App.vue`:

```html
<script setup lang="ts">
import { ref } from 'vue'
import Layout from './components/Layout.vue'
import ThemedButton from './components/ThemedButton.vue'

const theme = ref<'light' | 'dark'>('light')
function toggle() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <Layout :theme="theme" :on-toggle="toggle">
    <h2>Content goes here</h2>
  </Layout>
</template>
```

This works. Now add a fourth level: `Sidebar.vue` nested inside `Layout`, which contains `ThemedButton`. `Layout` must now also pass `theme` and `onToggle` to `Sidebar`. `Sidebar` must pass them to `ThemedButton`. Neither uses them.

Then: the theme system changes. `toggle` now needs an argument: `toggle(newTheme: 'light' | 'dark')`. You must update: `App.vue`, `Layout.vue`, `Sidebar.vue` — every component in the chain — even though only `App.vue` and `ThemedButton` care.

**The mathematics of prop drilling:** For a theme prop that must travel N levels through a tree, any change to the theme API requires editing N+1 files: the source and every intermediate forwarder. For a real app with authentication status, locale settings, feature flags, and notification context — each travelling through a different depth — this becomes a significant maintenance burden.

**CS lens — explicit wiring vs scoped availability.** Props are *explicit*: every data transfer is declared at every component boundary. This makes data flow traceable — you can follow any value through the tree by reading component signatures. But in deep trees, the cost of explicitness — every intermediate component must participate — exceeds the benefit. A different model: the provider declares a value in scope for all descendants; any descendant that needs it opts in directly. Intermediate components are uninvolved. This is **lexical scoping** applied to the component tree — the same mechanism that lets an inner function access an outer function's variables without every intermediate scope forwarding them.

**SE lens — accidental coupling.** `Layout` and `Sidebar` have no interest in the theme system. They do not use it. Yet they are coupled to it: when the theme API changes, they must be updated. Components that exist only to forward data are doing *coordination work*, not *application work*. The coupling between Layout and the theme API is **accidental** — it exists only because of the structural constraint of prop drilling, not because Layout has any logical relationship to theming.

---

## Step 2 — `provide` and `inject`: bypassing the tree

Create `src/composables/useTheme.ts`:

```typescript
import { ref, provide, inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export type Theme = 'light' | 'dark'

// The typed key: a Symbol with an attached type
export const ThemeKey: InjectionKey<{
  theme: Ref<Theme>
  toggle: () => void
}> = Symbol('theme')

// Called in the root — provides the theme to all descendants
export function provideTheme() {
  const theme = ref<Theme>('light')

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  provide(ThemeKey, { theme, toggle })
  return { theme, toggle }
}

// Called in any descendant — injects the theme from any ancestor
export function useTheme() {
  const ctx = inject(ThemeKey)
  if (!ctx) {
    throw new Error(
      'useTheme() was called outside a component where provideTheme() was called. ' +
      'Ensure provideTheme() is called in a parent component.'
    )
  }
  return ctx
}
```

Replace `src/App.vue`:

```html
<script setup lang="ts">
import { provideTheme } from './composables/useTheme.ts'
import ThemedButton from './components/ThemedButton.vue'

const { theme } = provideTheme()  // provides to all descendants
</script>

<template>
  <div :class="['app', theme]">
    <h2>Theme: {{ theme }}</h2>
    <p>Some content here. The button below can be nested anywhere.</p>
    <ThemedButton />
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 40px; min-height: 100vh; transition: background 0.3s; }
.light { background: #f8fafc; color: #1e293b; }
.dark  { background: #0f172a; color: #e2e8f0; }
</style>
```

Replace `src/components/ThemedButton.vue`:

```html
<script setup lang="ts">
import { useTheme } from '../composables/useTheme.ts'

const { theme, toggle } = useTheme()  // injects from nearest ancestor provider
</script>

<template>
  <button @click="toggle" :class="['btn', theme]">
    Switch to {{ theme === 'light' ? '🌙 dark' : '☀️ light' }} mode
  </button>
</template>

<style scoped>
.btn { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }
.btn.light { background: #1e293b; color: #f8fafc; }
.btn.dark  { background: #e2e8f0; color: #0f172a; }
</style>
```

`ThemedButton` now has zero props. It imports from `useTheme.ts` — a neutral contract — and gets the theme and toggle function directly. No intermediate component needs to know the theme exists.

**Walkthrough — `provide(key, value)`:**

```typescript
provide(ThemeKey, { theme, toggle })
```

`provide(key, value)` makes `value` available to every descendant of the component that calls it, at any depth. The call must happen during component setup (inside `<script setup>` or a `setup()` function). After setup, Vue knows what this component provides.

The `value` can be anything: a primitive, an object, a ref, a function. Providing a reactive ref (as done here with `theme`) means descendants receive a live reference — when `theme.value` changes, any descendant that reads it re-renders automatically.

**Why provide the `Ref` rather than the value:** If you provided `theme.value` (the string `'light'`), descendants would receive a static copy of the string — it would never update. By providing the `Ref<Theme>` object itself, descendants receive the reactive container. Reads of `theme.value` inside the descendant's template are tracked and trigger re-renders when `theme.value` changes.

**Walkthrough — `InjectionKey<T>`:**

```typescript
export const ThemeKey: InjectionKey<{
  theme: Ref<Theme>
  toggle: () => void
}> = Symbol('theme')
```

`InjectionKey<T>` is a TypeScript type from Vue. It is a Symbol (a unique value with no string equivalent) carrying a type annotation `T`. When you call `inject(ThemeKey)`, TypeScript knows the return type is `{ theme: Ref<Theme>; toggle: () => void } | undefined`.

Without `InjectionKey`, `inject` returns `unknown` — you lose all type safety. Without a Symbol, two different providers using the string key `'theme'` would collide. `Symbol('theme')` is unique: every call to `Symbol(...)` produces a new value, even with the same label. Two separate `Symbol('theme')` calls produce two distinct keys that cannot collide.

**Walkthrough — `inject(key)` with a guard:**

```typescript
export function useTheme() {
  const ctx = inject(ThemeKey)
  if (!ctx) {
    throw new Error('useTheme() was called outside a component where provideTheme() was called.')
  }
  return ctx
}
```

`inject(key)` walks up the component tree looking for a matching `provide(key, ...)` call. It returns the provided value, or `undefined` if no ancestor provided it.

The guard (`if (!ctx) throw`) turns "Cannot read properties of undefined (reading 'theme')" — a confusing error at some usage site — into a precise, actionable message that names the exact mistake. Always guard `inject` results when the injection is required.

**Walkthrough — the `useTheme` / `provideTheme` split:**

Splitting into two functions — `provideTheme()` called at the root, `useTheme()` called anywhere — is the canonical Vue pattern for shared context. It is idiomatic because:

1. The composable name `useTheme` signals to callers: "this composable injects shared context; call it in setup." 
2. `provideTheme` signals: "this is the provider; call it once in the root."
3. The shared key (`ThemeKey`) and type (`Theme`) are centralized in one file — `useTheme.ts` — rather than scattered across components.

**CS concept — dependency injection (DI).** `provide`/`inject` is Vue's built-in dependency injection system. DI separates three concerns: the **consumer** declares what it needs (`inject(ThemeKey)`); the **provider** supplies the implementation (`provide(ThemeKey, { theme, toggle })`); the **composition root** wires them at the right level (the root component calls `provideTheme()`). `ThemedButton` does not import from `App.vue` — it imports from `useTheme.ts`, a neutral interface. The actual provider (which component calls `provideTheme()`) can change at any time without touching `ThemedButton`.

**CS concept — inversion of control.** In the prop-drilling version, `App.vue` controls `ThemedButton`'s access to the theme: it must actively push the data down through every level. In the provide/inject version, `ThemedButton` controls its own access: it calls `useTheme()` and gets what it needs, regardless of what the tree looks like above it. The control is inverted — from the provider pushing down to the consumer pulling up. This is what "inversion of control" means: the dependency is resolved at the consumer's request, not at the provider's initiative.

**CS concept — lexical scope in component trees.** `inject` searches ancestors in the component tree, from nearest to farthest, stopping at the first match. This is exactly how lexical scope works in JavaScript: an inner function finds `count` in the nearest enclosing scope. If no ancestor provides a key, `inject` returns `undefined` — equivalent to a `ReferenceError` in lexical scope (the variable was not declared in any enclosing scope). The component tree *is* a scope, and `provide`/`inject` is the mechanism for introducing values into that scope.

**What breaks if you call `inject` outside a component:** Call `useTheme()` at module level (outside `<script setup>`). Vue throws: `inject() can only be used inside setup() or functional components.` Vue needs to know which component is "active" — the one that `inject` should search ancestors for — and Vue only knows this during component setup.

**SE principle — the Dependency Inversion Principle (DIP).** `ThemedButton` depends on `ThemeKey` (the abstract type) not on `App.vue` (a concrete implementation). If the theme implementation moves from a ref to a Pinia store, `ThemedButton` is unchanged — it still calls `inject(ThemeKey)` and receives the same interface. High-level components (leaves like `ThemedButton`) depend on abstractions (the typed key). Low-level components (roots like `App.vue`) implement those abstractions. Neither depends on the other directly.

---

## When to use `provide`/`inject` vs props

| Props | Provide / Inject |
|-------|-----------------|
| Data for one component level | Data needed at any depth |
| Explicit — easy to trace by reading signatures | Implicit — must find the provider |
| Every level must declare and forward it | Intermediate levels uninvolved |
| Right for: parent → child data | Right for: app-wide context (theme, auth, locale, toast, router) |
| Fewer lines per level | More setup (composable + key), but zero per intermediate level |

Use props for data that flows one or two levels and belongs to specific component relationships. Use `provide`/`inject` when more than one level separates provider from consumer, or when intermediate components genuinely should not be involved.

---

## Connects forward

Lesson 12 wraps `provide`/`inject` inside composables — the `useTheme` pattern here is already the canonical form. Pinia (Vue's official state management library) uses a similar mechanism internally: each store is essentially a `provide`/`inject` pair with additional devtools integration.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Clicking the button toggles between light and dark themes across the entire page
- [ ] `App.vue` and `ThemedButton.vue` are connected only through `useTheme.ts` — no props pass between them
- [ ] You can explain what `Symbol('theme')` produces and why a Symbol prevents key collisions
- [ ] You can explain why `inject` returns `undefined` when no ancestor provided the key
- [ ] You can explain what "inversion of control" means in this context
- [ ] Add a `FontSizeKey` — provide a `fontSize ref<number>(14)` and a `setFontSize(n: number)` function from `App.vue`. Inject it in a new `FontControl.vue` component that renders a range slider and sets the font size on change.
