# Slots

## What you will build

A `Card.vue` layout component that accepts arbitrary content via a default slot, a named `header` slot for the title, and a named `footer` slot for actions.

```
┌── Deployment complete ──────────────────────────────── ┐
│  Your application was deployed to production.          │
│  Build time: 42 seconds                                │
│                                              [View logs] [Open app] │
└───────────────────────────────────────────────────────┘
```

The card does not know what it contains. The parent decides the content. `Card.vue` provides the frame.

---

## Connects backward

Props pass data (strings, booleans, numbers) into a component. Slots pass **markup** (HTML, other components) into a component. Slots are the mechanism behind every layout component — cards, modals, drawers, dialog boxes — in every Vue UI library.

---

## The lesson

### Step 1 — Create `Card.vue` with slot placeholders

**The problem:** A card's visual frame (border, padding, header/footer areas) should be defined once. The content inside changes per use. If you put content in the component itself, it can only ever show one thing. Slots make the content a parameter.

**File:** Create `src/components/Card.vue` (use the `+` button) — paste the entire file contents:

```html
<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'success' | 'warning'
}>()
</script>

<template>
  <div class="card" :class="variant">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  background: white;
}
.card.success { border-color: #bbf7d0; }
.card.warning { border-color: #fde68a; }
.card-header {
  padding: 14px 18px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 15px;
}
.card.success .card-header { background: #f0fdf4; border-color: #bbf7d0; }
.card.warning .card-header { background: #fffbeb; border-color: #fde68a; }
.card-body { padding: 18px; }
.card-footer {
  padding: 12px 18px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
```

**Walkthrough — `<slot />`:**

```html
<div class="card-body">
  <slot />
</div>
```

`<slot />` is a placeholder. Vue replaces it at render time with whatever content the parent put between `<Card>` and `</Card>`. If the parent puts nothing there, the slot is empty and the `card-body` div is rendered but empty.

**Walkthrough — named slots:**

```html
<slot name="header" />
<slot />           <!-- default slot: no name -->
<slot name="footer" />
```

Named slots let the parent direct different content to different locations inside the component. Content without a `<template #name>` wrapper goes to the default slot.

**Walkthrough — `$slots.header`:**

```html
<div v-if="$slots.header" class="card-header">
  <slot name="header" />
</div>
```

`$slots` is a Vue-provided object listing the slots that actually have content. `$slots.header` is truthy when the parent provides content for the `header` slot. `v-if="$slots.header"` prevents the `.card-header` div — and its border — from rendering when no header is provided. This makes the component adaptive.

**CS concept — parametric polymorphism:** A component with slots is like a generic function: it defines structure and behaviour, but defers specific content to the caller. `Card.vue` is to its content as `Array.map()` is to its callback — the outer thing provides the structure; the inner thing is supplied per use.

**SE principle — open/closed principle:** `Card.vue` is open for extension (any content can go inside) and closed for modification (adding a new use case does not require changing `Card.vue`). Compare this to a component that hardcodes its content — every new content variant requires a new component or a proliferating set of props.

**What breaks without `v-if="$slots.header"`:** Remove the `v-if`. Every `<Card>` now renders the `.card-header` div even when no header slot is provided. You see an empty strip with a bottom border at the top of every card — padding and border with no content. The `$slots` check makes the sections truly optional.

---

### Step 2 — Use `Card.vue` in `App.vue`

**The problem:** `App.vue` needs to demonstrate the default slot, named slots, and all three card variants.

**File:** `src/App.vue` — replace the entire `<script setup>` section with:

```typescript
import Card from './components/Card.vue'
```

**File:** `src/App.vue` — replace the `<template>` section with:

```html
<template>
  <div class="app">

    <Card>
      <p>A basic card with only body content.</p>
    </Card>

    <Card variant="success">
      <template #header>
        Deployment complete
      </template>

      <p>Your application was deployed to production.</p>
      <p>Build time: 42 seconds</p>

      <template #footer>
        <button class="btn secondary">View logs</button>
        <button class="btn primary">Open app</button>
      </template>
    </Card>

    <Card variant="warning">
      <template #header>
        Approaching rate limit
      </template>
      <p>You have used 850/1000 API calls this month.</p>
    </Card>

  </div>
</template>
```

**File:** `src/App.vue` — replace the `<style>` section with:

```html
<style scoped>
.app {
  font-family: system-ui, sans-serif;
  max-width: 480px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.btn { padding: 7px 16px; border-radius: 7px; border: none; font-size: 13px; cursor: pointer; font-weight: 500; }
.btn.primary { background: #41b883; color: white; }
.btn.secondary { background: #f1f5f9; color: #334155; }
</style>
```

**Walkthrough — `<template #header>`:**

```html
<Card variant="success">
  <template #header>
    Deployment complete
  </template>

  <p>Body content</p>  <!-- goes to default slot -->

  <template #footer>
    <button>Action</button>
  </template>
</Card>
```

`<template #header>` is shorthand for `<template v-slot:header>`. It targets the slot with `name="header"` in `Card.vue`. The `#` shorthand is the idiomatic form in all modern Vue code. Content not inside a named `<template>` goes to the default slot.

**CS concept — composition over inheritance:** In object-oriented design, you would extend `Card` to make `SuccessCard` and `WarningCard`. In component-based design, you compose: one `Card` component plus the `variant` prop and slots produces any card variant. No inheritance hierarchy. No method overriding. The behavior is explicit at the call site.

---

## Scoped slots — reference only

A slot can expose data from the component to the slot content:

```html
<!-- Table.vue — exposes each row to the slot -->
<tr v-for="row in rows" :key="row.id">
  <slot :row="row" />
</tr>

<!-- App.vue — receives and renders each row -->
<Table :rows="data">
  <template #default="{ row }">
    <td>{{ row.name }}</td>
    <td>{{ row.email }}</td>
  </template>
</Table>
```

This pattern — "headless component" — appears throughout libraries like Headless UI and Radix Vue. The component handles logic (data, accessibility); you handle markup. No knowledge of scoped slots is needed to build the current lesson.

---

## Connects forward

Lesson 11 uses `provide` and `inject` — a mechanism for sharing data with any descendant without prop drilling. Slots and provide/inject are complementary: slots pass markup down; provide/inject passes data down without explicit props.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] The basic card renders with just body content, no header strip visible
- [ ] The success card shows a green-tinted header and footer with buttons
- [ ] The warning card shows an amber-tinted header and no footer strip
- [ ] You can explain the difference between a slot and a prop
- [ ] Build a `Badge.vue` component: accepts a `color` prop (`'green' | 'red' | 'blue'`) and a default slot for the label text
