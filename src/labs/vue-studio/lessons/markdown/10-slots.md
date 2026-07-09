# Slots

## What you will build

A `Card.vue` layout component that accepts arbitrary content via a default slot, a named `header` slot for the title, and a named `footer` slot for actions. The card conditionally renders the header and footer sections only when content is provided.

```
┌── Deployment complete ─────────────────────────────┐
│  Your application was deployed to production.      │
│  Build time: 42 seconds.                           │
│                              [View logs] [Open app]│
└────────────────────────────────────────────────────┘
```

The card does not know what it contains. The parent decides the content. `Card.vue` provides only the frame.

---

## What you need to know first

Lesson 05 showed that props pass *data* into a child component — strings, numbers, booleans, objects, arrays. This lesson starts by trying to pass *markup* as a prop, which is the instinctive approach, and shows exactly where it fails before introducing slots as the structural solution.

---

## Step 1 — Markup as a prop, and why it fails

Props carry values. The natural extension for a card component: pass the title and body text as string props.

Create `src/components/Card.vue`:

```html
<script setup lang="ts">
defineProps<{
  title: string
  content: string
  footerText?: string
}>()
</script>

<template>
  <div class="card">
    <div class="card-header">{{ title }}</div>
    <div class="card-body">{{ content }}</div>
    <div v-if="footerText" class="card-footer">{{ footerText }}</div>
  </div>
</template>
```

Use it:

```html
<Card
  title="Deployment complete"
  content="Your application was deployed to production."
  footerText="View logs"
/>
```

This works for plain text. Now the design spec changes:

**Requirement 1:** The body should contain a link — "Your application was deployed to [production](https://...)."

You can try: `content="Your application was deployed to <a href='...'>production</a>."` — but `{{ content }}` HTML-encodes the string. `<a href...>` renders as literal text. You would need `v-html="content"`, which executes the string as HTML. If `content` ever comes from user input, this is an **XSS vulnerability**: a user can inject `<script>alert('hacked')</script>` as their content string and it runs.

**Requirement 2:** The footer needs two buttons with different click handlers.

`footerText?: string` can only hold one piece of text. Two buttons require two texts and two handlers. You might add `footerButton1Text`, `footerButton1Action`, `footerButton2Text`, `footerButton2Action`. You have now created a four-prop API for two buttons. Add a third button: six more props. Add an icon next to one button: one more prop. The API degrades into a proliferation of props that describe HTML structure — which is exactly what HTML is already for.

**Requirement 3:** The footer should sometimes contain a progress bar instead of buttons.

Props cannot represent conditional structure. A card with a button footer and a card with a progress bar footer are different HTML shapes. No prop schema can capture "the footer is either two buttons or a progress bar" — that is a structural choice, not a data value.

**CS lens — data vs structure.** Props carry values: strings, numbers, booleans, arrays. Slots carry *structure*: markup, event bindings, other components, conditional blocks. Conflating them forces you to describe structure through data — strings that represent HTML, arrays of button configs, flags that control layout. This produces complex, fragile APIs that try to re-invent HTML inside prop types. The correct observation: markup is not data. It has a different type: a template fragment.

**SE lens — inversion of control for content.** A card component that controls its own content is not a layout component — it is a fixed-content display. A truly reusable layout component should be *open* to any content without being modified. Slots achieve this by inverting control: the card declares *where* content goes (`<slot>`); the parent decides *what* content fills each slot. The card provides the frame; the parent provides the content.

---

## Step 2 — `<slot>`: a placeholder for parent-supplied markup

Replace the entire `src/components/Card.vue`:

```html
<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'error'
}>()
</script>

<template>
  <div class="card" :class="variant ?? 'default'">

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
.card { border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.card.success { border-color: #bbf7d0; }
.card.warning { border-color: #fde68a; }
.card.error   { border-color: #fecaca; }
.card-header { padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 15px; }
.card.success .card-header { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.card.warning .card-header { background: #fffbeb; border-color: #fde68a; color: #a16207; }
.card.error   .card-header { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
.card-body { padding: 18px; font-size: 14px; line-height: 1.6; color: #374151; }
.card-footer { padding: 12px 18px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px; background: #f8fafc; }
</style>
```

Use it in `App.vue`:

```html
<Card variant="success">
  <template #header>Deployment complete</template>

  Your application was deployed to production.
  Build time: <strong>42 seconds</strong>.
  <a href="#">View changelog</a>

  <template #footer>
    <button class="btn-secondary">View logs</button>
    <button class="btn-primary">Open app</button>
  </template>
</Card>
```

**Walkthrough — `<slot />`:**

```html
<div class="card-body">
  <slot />
</div>
```

`<slot />` is a placeholder. At render time, Vue replaces it with whatever markup the parent placed between `<Card>` and `</Card>` without a `#name`. If the parent provides nothing, the slot renders empty.

Slots render as if the parent's markup were literally inserted at the slot's position. The markup is *evaluated in the parent's scope* — variables from the parent's `<script setup>` are accessible. The card does not need to know about them.

**Walkthrough — named slots:**

```html
<slot name="header" />   <!-- named: filled by <template #header> -->
<slot />                 <!-- default: filled by content without a name -->
<slot name="footer" />   <!-- named: filled by <template #footer> -->
```

Named slots allow a single component to accept multiple separate content regions. The parent provides content for each named region with `<template #name>` (shorthand for `<template v-slot:name>`):

```html
<Card>
  <template #header>This goes into slot name="header"</template>
  This goes into the default slot.
  <template #footer>This goes into slot name="footer"</template>
</Card>
```

Content without a `<template #name>` wrapping goes to the default slot.

**Walkthrough — `$slots.header`:**

```html
<div v-if="$slots.header" class="card-header">
  <slot name="header" />
</div>
```

`$slots` is a Vue-provided object in every component's template. Each key is a slot name; the value is truthy if the parent provided content for that slot. `$slots.header` is truthy when the parent used `<template #header>...</template>`; falsy otherwise.

The `v-if="$slots.header"` check means: do not render the `.card-header` div at all when no header content was provided. Without this check, a card used without a header slot would show an empty div with a border at the top of every card — visually wrong and structurally meaningless.

**Slot fallback content:** Slots can have default content that renders when the parent provides nothing:

```html
<slot name="header">
  <span style="color: #94a3b8">Untitled card</span>
</slot>
```

If the parent provides `<template #header>My Title</template>`, "My Title" renders. If the parent provides nothing, "Untitled card" renders. This is useful for optional slots where a sensible default makes the component usable without always specifying every region.

**CS concept — template as a parameter.** A slot is a **template parameter**: a placeholder in a component's output that the caller fills with its own markup at the call site. This is the template method pattern applied to rendered output: `Card` defines the algorithm (frame + padding + border structure); the caller provides the data (the content). Just as functions accept value parameters, components accept template parameters (slots). The component is a higher-order structure — it is parameterized over markup, not just data.

**CS concept — scoped slots.** A regular slot provides markup from the parent; the component renders it. A *scoped slot* goes further: the component exposes data; the parent provides the template that uses that data.

```html
<!-- In a List.vue: -->
<ul>
  <li v-for="item in items" :key="item.id">
    <slot :item="item" :index="index" />
  </li>
</ul>

<!-- In the parent: -->
<List :items="todos">
  <template #default="{ item, index }">
    {{ index + 1 }}. <strong>{{ item.text }}</strong>
    <span v-if="item.done">✓</span>
  </template>
</List>
```

The parent template receives `item` and `index` from the slot scope and decides how to render each item. `List.vue` handles iteration; the parent handles rendering. This is the foundation of every "renderless component" pattern: the component manages state and behavior; the consumer manages visual representation.

**SE principle — open/closed for layout.** `Card.vue` is *closed* to changes about what content it displays — that is entirely the caller's responsibility. But it is *open* to being used with any content in any context. Adding a new card use case (error card, loading card, form card, image card) requires zero changes to `Card.vue`. A component that hard-codes its content must change for every new use case; a component that uses slots never does.

**What breaks if the parent provides content for a nonexistent slot:** Vue silently discards it. `<template #actions>...</template>` on a card that defines only `#header` and `#footer` is ignored with no warning. Content disappears without explanation. Always check that slot names in the parent match slot names declared in the component.

**What breaks if you use `v-html` for body content:** `<div class="card-body" v-html="bodyProp" />` renders HTML from a string. If `bodyProp` comes from user input (a todo item body, a comment, a search result), an attacker can inject `<img src=x onerror="steal(document.cookie)">` and execute arbitrary JavaScript. `v-html` is safe only for content you control entirely. Slots are always safe — the content is written by the developer, not the user.

---

## When to use slots vs props

| Props | Slots |
|-------|-------|
| Data values: strings, numbers, booleans, arrays | Markup: HTML, components, conditional blocks |
| The component decides how to render the value | The parent decides what to render in each region |
| Good for configuration | Good for content injection |
| `<Alert message="Error" type="danger" />` | `<Modal><template #body>...</template></Modal>` |

A component that only ever shows a string in the body: use a prop. A component that accepts arbitrary layout in the body: use a slot. When in doubt: if the content could contain HTML elements, it belongs in a slot.

---

## Connects forward

Lesson 11's `provide`/`inject` is the complement: slots share *markup* downward from parent to child; `provide`/`inject` shares *data and functions* upward through any number of levels. Together they cover the two scenarios where component props are insufficient.

---

## Definition of done

`App.vue` should use `<Card>` with multiple variants and different slot combinations. Verify:

- [ ] A card with all three slots filled (header, body, footer) renders correctly
- [ ] Removing `<template #header>` hides the header div entirely (not just empty)
- [ ] Inline HTML elements (bold, link) render correctly in the body slot
- [ ] Two buttons in `<template #footer>` both render and are clickable
- [ ] You can explain what `<slot />` does and what `<slot name="footer" />` does
- [ ] You can explain what `$slots.footer` checks and why the conditional wrapper is important
- [ ] You can explain why passing markup as a string prop requires `v-html` and why that is an XSS risk
- [ ] Add a `<Card>` with no header slot and verify the header bar does not appear
