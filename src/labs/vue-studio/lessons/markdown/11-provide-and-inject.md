# Provide & Inject

## What you will build

A theme system where the root component provides the current theme and a toggle function. Any nested component — no matter how many levels down — can inject and use them without any intermediate component passing props.

```
App.vue  provides theme + toggle
  └── ThemedButton.vue  injects theme + toggle
        (no props involved)
```

Click the button: the whole page switches between light and dark.

---

## Connects backward

Lesson 05 showed props for parent → child data passing. Props require every intermediate component to declare and forward the prop. This lesson solves "prop drilling" — when data needs to skip multiple levels.

---

## The lesson

### Step 1 — Create `src/composables/useTheme.ts`

**The problem:** We need to share `theme` and `toggle` with any component in the tree. Putting `provide()` and `inject()` directly in each component works but couples them. A composable that wraps both provides a single import for any component that wants to participate in the theme system.

**File:** Create `src/composables/useTheme.ts` (use the `+` button) — paste the entire file contents:

```typescript
import { ref, provide, inject, type InjectionKey, type Ref } from 'vue'

export type Theme = 'light' | 'dark'

export const ThemeKey: InjectionKey<{
  theme: Ref<Theme>
  toggle: () => void
}> = Symbol('theme')

export function provideTheme() {
  const theme = ref<Theme>('light')

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  provide(ThemeKey, { theme, toggle })

  return { theme, toggle }
}

export function useTheme() {
  const ctx = inject(ThemeKey)
  if (!ctx) throw new Error('useTheme() must be used inside a component that called provideTheme()')
  return ctx
}
```

**Walkthrough — `provide`:**

```typescript
provide(ThemeKey, { theme, toggle })
```

`provide(key, value)` makes `value` available to every descendant of the component that calls it, at any depth. The key identifies what is being provided. Using a `Symbol` as the key prevents name collisions — two different providers with `'theme'` as a string key would conflict.

**Walkthrough — `InjectionKey`:**

```typescript
export const ThemeKey: InjectionKey<{
  theme: Ref<Theme>
  toggle: () => void
}> = Symbol('theme')
```

`InjectionKey<T>` from Vue is a generic `Symbol` type. The `<T>` ties the key to a type: when any component calls `inject(ThemeKey)`, TypeScript knows the return type is `{ theme: Ref<Theme>; toggle: () => void } | undefined`. Without `InjectionKey`, `inject` returns `unknown` — you lose all type checking.

**Walkthrough — `inject` with a guard:**

```typescript
export function useTheme() {
  const ctx = inject(ThemeKey)
  if (!ctx) throw new Error('useTheme() must be used inside a component that called provideTheme()')
  return ctx
}
```

`inject(ThemeKey)` returns the provided value, or `undefined` if no ancestor called `provide(ThemeKey, ...)`. The `if (!ctx) throw` guard turns a confusing "cannot read property 'theme' of undefined" into a clear error message that tells the developer exactly what went wrong. Always guard `inject` results when the provider is not guaranteed.

**CS concept — dependency injection (DI):** `provide`/`inject` is Vue's DI system. DI means components declare their dependencies (via `inject`) without knowing where those dependencies come from. The provider is wired at a higher level. This decouples components from each other — `ThemedButton` does not `import` from `App.vue`. It only imports from `useTheme.ts`. The wiring happens at runtime.

**SE principle — inversion of control:** `ThemedButton` does not control where it gets the theme. The component tree controls it. This inversion makes `ThemedButton` testable in isolation — in a test, wrap it in a component that provides a test theme. The button does not care.

**What breaks if you call `inject` outside a component:** Call `inject(ThemeKey)` at the module level (outside a component function). Vue warns: "inject() can only be used inside setup() or functional components." `inject` must run during component setup so Vue knows which component to look up the tree from.

---

### Step 2 — Create `src/components/ThemedButton.vue`

**The problem:** The toggle button needs to read the current theme (to label itself correctly) and call `toggle` when clicked — without receiving either as props.

**File:** Create `src/components/ThemedButton.vue` (use the `+` button) — paste the entire file contents:

```html
<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <button class="btn" :class="theme" @click="toggle">
    {{ theme === 'light' ? '🌙 Go Dark' : '☀️ Go Light' }}
  </button>
</template>

<style scoped>
.btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}
.btn.light { background: #1e293b; color: white; }
.btn.dark { background: #f1f5f9; color: #1e293b; }
</style>
```

**Walkthrough:**
- `import { useTheme } from '../composables/useTheme'` — the only import needed; no props required
- `const { theme, toggle } = useTheme()` — calls `inject(ThemeKey)` internally; the component receives reactive references to the provider's data
- `:class="theme"` — applies either `'light'` or `'dark'` class, controlling the button's color scheme

---

### Step 3 — Update `App.vue` to call `provideTheme()`

**The problem:** `App.vue` must call `provideTheme()` to establish the theme in the component tree. Any component inside `App.vue` can then inject it.

**File:** `src/App.vue` — replace the entire `<script setup>` section with:

```typescript
import { provideTheme } from './composables/useTheme'
import ThemedButton from './components/ThemedButton.vue'

const { theme } = provideTheme()
```

**File:** `src/App.vue` — replace the `<template>` section with:

```html
<template>
  <div class="app" :class="theme">
    <h2>Theme: {{ theme }}</h2>
    <p>
      App.vue provided the theme. ThemedButton is nested inside
      and reads it via inject — no prop passing needed.
    </p>
    <ThemedButton />
  </div>
</template>
```

**File:** `src/App.vue` — replace the `<style>` section with:

```html
<style scoped>
.app {
  font-family: system-ui, sans-serif;
  max-width: 400px;
  margin: 40px auto;
  padding: 32px;
  border-radius: 16px;
  transition: all 0.3s;
}
.app.light { background: #f8fafc; color: #1e293b; border: 1px solid #e2e8f0; }
.app.dark { background: #1e293b; color: #f1f5f9; border: 1px solid #334155; }
h2 { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
p { font-size: 14px; line-height: 1.6; margin-bottom: 20px; opacity: 0.7; }
</style>
```

**Walkthrough:**
- `const { theme } = provideTheme()` — calls `provide(ThemeKey, ...)` internally and returns `{ theme, toggle }` for use in App's own template
- `:class="theme"` — applies `'light'` or `'dark'` class to the wrapper; controls the background and text color via scoped CSS

---

## When to use provide/inject vs props

| Props | Provide/Inject |
|-------|---------------|
| One level down | Any number of levels down |
| Explicit — visible in the template | Implicit — requires knowing the key |
| Best for component-specific data | Best for cross-cutting concerns |
| TypeScript validates the call site | TypeScript validates the inject site |

**Don't replace all props with provide/inject.** Provide/inject is best for data that is *conceptually ambient* to a region of the tree: theme, locale, auth state, feature flags. For specific component APIs — a button's `disabled` state, a list item's `text` — use props. The distinction: props are about the component's specific use; provide/inject is about the environment the component lives in.

---

## Connects forward

Lesson 12 wraps `provide`/`inject`, `watch`, and `onMounted` into composables — reusable functions that encapsulate Vue's reactive APIs. `provideTheme()` and `useTheme()` you built here are already composables.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Clicking the button toggles between light and dark
- [ ] App.vue's background and text color change with the theme
- [ ] `ThemedButton` reads the theme — it has no `:theme` prop
- [ ] You can explain when to use provide/inject vs passing props
- [ ] Add a second deeply-nested component (e.g., `src/components/ThemeLabel.vue`) that also calls `useTheme()` and displays the current theme name
