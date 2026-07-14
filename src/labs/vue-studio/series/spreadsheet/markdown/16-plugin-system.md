# Vue Spreadsheet — Lesson 16 — A Plugin System: Strategy, Open/Closed, and a Real Security Lesson

## What you will build

Two new ways a cell can *look*, added to the project without changing a single line of `CellDisplay.vue`: a cell containing `TRUE` or `FALSE` renders with a ✓ or ✗ instead of the raw word, and a `number` cell holding a negative value renders in red — the exact convention real spreadsheets have used for decades. Both are registered from outside `CellDisplay.vue` entirely, through a small, general plugin registry. A third thing you will *not* build, deliberately, and understand precisely why not: a plugin that renders raw HTML.

```
    A       B       C
1 | ✓     | -42  | hello |   ← TRUE→✓, negative→red, plain text→unchanged
```

---

## What you need to know first

Lesson 12's `CellDisplay.vue` currently renders `{{ displayValues[cellId(...)] ?? '' }}` — one hardcoded way to show a cell's text, for every cell, unconditionally. Lesson 04 built `Cell` as a closed, exhaustively-checked discriminated union (`number | text | formula`) — closed deliberately, so `assertNever` can guarantee every switch handles every case. This lesson does not touch `Cell` at all. It solves a different problem: not "what data can a cell hold," but "what are the *unlimited* number of ways that data might reasonably be displayed" — and unlike `Cell`'s kinds, display rules are exactly the kind of thing that should be extensible without limit.

---

## Concept: the wrong way to add "just one more special case," and why it doesn't stay at one

Imagine adding the boolean-checkbox behavior the obvious way — directly inside `CellDisplay.vue`:

```typescript
const text = displayValues[cellId({ col: props.col, row: props.row })] ?? ''
const isBoolean = text === 'TRUE' || text === 'FALSE'
```

This works, for one special case. The moment a second one arrives — negative numbers in red — `CellDisplay.vue` grows a second `if`, checking something unrelated to the first. A third (a URL rendered as a link), a fourth (a percentage bar), and `CellDisplay.vue` becomes a file that must be understood, and risked breaking, every time *any* new display rule is added — regardless of whether that rule has anything to do with the ones already there. This is the same problem Lesson 05 named directly for a different reason (a discriminated union's switches growing with every new variant) — but here the fix Lesson 05 used, `assertNever`, is exactly the *wrong* tool: `assertNever` enforces that a fixed, closed set of cases is always fully handled. Display rules are the opposite: an intentionally *open-ended*, growing set, where the whole point is adding new ones without re-touching what's already there.

---

## Concept Lab — the Strategy pattern, built on a disposable shipping calculator first

**The problem this lab isolates:** before applying this to cell rendering, the core idea — swap out *which* logic runs, without the calling code needing to know which one it got — deserves to be seen on something with zero spreadsheet complexity.

Run this throwaway — calculating shipping cost, a classic example with nothing to do with this project:

```vue
<script setup lang="ts">
interface ShippingStrategy {
  readonly name: string
  cost(weightKilograms: number): number
}

const standardShipping: ShippingStrategy = {
  name: 'Standard',
  cost: (weightKilograms) => weightKilograms * 2,
}

const expressShipping: ShippingStrategy = {
  name: 'Express',
  cost: (weightKilograms) => weightKilograms * 5 + 10,
}

function checkout(weightKilograms: number, strategy: ShippingStrategy): string {
  return `${strategy.name}: $${strategy.cost(weightKilograms).toFixed(2)}`
}

const results = [
  checkout(3, standardShipping),
  checkout(3, expressShipping),
]
</script>
<template>
  <ul><li v-for="r in results" :key="r">{{ r }}</li></ul>
</template>
```

Click ▶ Run. `checkout` never mentions "standard" or "express" anywhere in its own body — it takes *a* `ShippingStrategy` and calls `.cost()` on it, whichever one it was handed.

**Walkthrough — the Strategy pattern, named precisely:**

The **Strategy pattern** (another of the Gang of Four's 1994 patterns, alongside Lesson 08's Interpreter and Lesson 11's Memento) defines a family of interchangeable algorithms behind one shared interface, so the code that *uses* an algorithm never needs to know which specific one it's using. `ShippingStrategy` is the shared interface — `name` and `cost(weight)`, nothing more. `standardShipping` and `expressShipping` are two interchangeable implementations of it. `checkout` is the client — it only knows about the interface, never about `standardShipping` or `expressShipping` by name. Adding a third strategy (`overnightShipping`) requires zero changes to `checkout` — this is the same "open for extension, closed for modification" property Lesson 05 named and then noted `Cell`'s own switches *don't* fully have. A Strategy-pattern client genuinely does have it, which is exactly why this lesson reaches for Strategy instead of another discriminated union.

**This lab is now finished — `ShippingStrategy` is deleted and will not appear in the project again.** The shape survives unchanged: an interface describing one operation, several interchangeable implementations, and a caller that depends only on the interface.

*Recognized elsewhere:* this is, precisely, what a "plugin" means in almost every real system that uses the word. VS Code's extension API is a giant collection of Strategy interfaces (a language server, a formatter, a debugger adapter) that VS Code's core calls without knowing which specific extension it's talking to. ESLint's rules, Babel's plugins, and webpack's loaders are all the identical shape: a fixed interface, an open-ended set of implementations, and a host that depends only on the interface. Once you can name "Strategy pattern," "plugin system," and "dependency injection" (Lesson 09) as three closely related ideas rather than three unrelated buzzwords, you can recognize this architecture on sight in almost any large real codebase.

---

## Step 1 — A renderer plugin interface and a registry

**The problem:** `CellDisplay.vue` needs a place to ask "does any registered plugin want to change how this cell looks?" without knowing, or caring, how many plugins exist or what they check for.

Add to `App.vue`'s `<script setup>`, or a new `src/plugins/rendererPlugins.ts` file (either works; a separate file is shown here to keep plugin code physically separate from `App.vue`'s own state, the same file-system-as-documentation reasoning from Lesson 12):

```typescript
export interface RenderedCell {
  readonly text: string
  readonly className?: string
}

export interface CellRendererPlugin {
  readonly name: string
  matches(cell: Cell): boolean
  render(cell: Cell): RenderedCell
}

const rendererPlugins: CellRendererPlugin[] = []

export function registerRendererPlugin(plugin: CellRendererPlugin): void {
  rendererPlugins.push(plugin)
}

export function renderCell(cell: Cell | undefined, fallbackText: string): RenderedCell {
  if (!cell) return { text: fallbackText }
  for (const plugin of rendererPlugins) {
    if (plugin.matches(cell)) return plugin.render(cell)
  }
  return { text: fallbackText }
}
```

**Walkthrough — `RenderedCell`, a deliberately narrow return type:**

`{ text: string; className?: string }` is the *entire* vocabulary a plugin is allowed to use to change a cell's appearance: what text to show, and optionally which CSS class to attach. Nothing else — no arbitrary styles, no HTML, no event handlers. This narrowness is not a limitation that snuck in by accident; it is Step 4's security lesson, decided here, on purpose, before a single plugin exists to test it against.

**Walkthrough — `rendererPlugins: CellRendererPlugin[]`, and why it isn't exported directly:**

The array itself has no `export` — only `registerRendererPlugin` (which pushes into it) and `renderCell` (which reads from it) do. Nothing outside this file can reach in and directly mutate, replace, or clear `rendererPlugins`; every interaction goes through the two named functions. This is encapsulation applied to a module instead of a class — the same idea as `private` fields in an OOP language, expressed here through what a module chooses to `export`.

**Walkthrough — `renderCell`'s `for...of` loop, and "first match wins":**

`renderCell` (Lesson 10's `for...of` loop, reused) checks each registered plugin's `matches(cell)` in the order they were registered, and returns the *first* one that matches — later plugins are never even consulted once one has already matched. This is a real, explicit design decision worth naming: if two plugins could both match the same cell (a boolean-check plugin and a "starts with a capital T" plugin, say), whichever was registered first wins, silently. A production plugin system would likely need a priority or conflict-resolution mechanism; this project accepts registration order as the tiebreaker, deliberately, as the simplest thing that could possibly work (Lesson 11's XP framing, again) for a project with two, clearly non-overlapping plugins.

---

## Step 2 — The boolean plugin

**The problem:** Nothing yet actually uses `registerRendererPlugin`.

Add to `src/plugins/rendererPlugins.ts` (or `App.vue`, wherever `registerRendererPlugin` was defined):

```typescript
registerRendererPlugin({
  name: 'boolean-checkbox',
  matches: (cell) => cell.kind === 'text' && (cell.value === 'TRUE' || cell.value === 'FALSE'),
  render: (cell) => ({
    text: cell.kind === 'text' && cell.value === 'TRUE' ? '✓' : '✗',
    className: 'cell-boolean',
  }),
})
```

Add to `<style>`:

```css
.cell-boolean { text-align: center; font-weight: bold; color: #2563eb; }
```

**Walkthrough — `cell.kind === 'text' && ...` inside `matches`, and why `Cell`'s type narrowing still applies here:**

`matches(cell: Cell)` receives the full `Cell` union — `cell.value` isn't safe to read until `cell.kind` narrows it, the exact type-narrowing discipline from Lesson 02 and every discriminated-union switch since. `cell.kind === 'text'` inside the `&&` narrows `cell` to the `'text'` variant for the rest of that expression, which is why `cell.value === 'TRUE'` compiles at all — without the `cell.kind === 'text'` check first, TypeScript would refuse to let you read `.value` at all, because a `'number'` or `'formula'` cell's `.value`/`.expr` fields don't line up.

---

## Step 3 — The negative-number plugin

**The problem:** One plugin isn't enough to prove the registry actually supports more than one.

Add a second plugin:

```typescript
registerRendererPlugin({
  name: 'negative-number-red',
  matches: (cell) => cell.kind === 'number' && cell.value < 0,
  render: (cell) => ({
    text: cell.kind === 'number' ? cell.value.toString() : '',
    className: 'cell-negative',
  }),
})
```

```css
.cell-negative { color: #dc2626; }
```

---

## Step 4 — Wire `renderCell` into `CellDisplay.vue`, and why it returns text, never HTML

**The problem:** `CellDisplay.vue`'s display branch still calls `displayValues[...]` directly, unaware the plugin registry exists.

**Keeping Lesson 13's bold/italic/color alongside this — `:class` and `:style` are not alternatives:**
`CellDisplay.vue` already binds `:style` to `styleFor(...)` — the user's own Bold/Italic/color-swatch choices from Lesson 13's `FormatToolbar`. Plugins add `:class`, not `:style`, specifically so both keep working together rather than one replacing the other: `:class` and `:style` are independent bindings, and Vue applies both to the same element. The one interaction worth knowing about explicitly: CSS gives inline styles higher priority than classes, so if a user manually sets a cell's text color *and* that same cell matches `negative-number-red`, the manual color wins — `.cell-negative`'s red is an automatic default, not an override of a choice the user actually made. That precedence (explicit user choice beats an automatic heuristic) is deliberate, not an accident of CSS specificity you'd need to fight.

Update `CellDisplay.vue`'s display branch:

```html
<template v-else>
  <span
    :class="rendered.className"
    :style="{
      fontWeight: styleFor(cellId({ col: props.col, row: props.row })).bold ? 'bold' : 'normal',
      fontStyle: styleFor(cellId({ col: props.col, row: props.row })).italic ? 'italic' : 'normal',
      color: styleFor(cellId({ col: props.col, row: props.row })).textColor,
    }"
  >{{ rendered.text }}</span>
</template>
```

Add to `<script setup>`:

```typescript
const rendered = computed<RenderedCell>(() => {
  const cell = cells.value[cellId({ col: props.col, row: props.row })]
  const fallbackText = displayValues.value[cellId({ col: props.col, row: props.row })] ?? ''
  return renderCell(cell, fallbackText)
})
```

Click ▶ Run. Type `TRUE` into a cell — it shows ✓. Type `-42` — it shows in red. Type `hello` — unchanged, because no plugin's `matches` returned `true` for it, and `renderCell` fell through to `fallbackText`. Bold, italic, and manually-set colors from Lesson 13 still work exactly as before, on every cell, plugin-rendered or not. **`CellDisplay.vue`'s *text source* was changed exactly once, to call `renderCell` instead of reading `displayValues` directly — and never needs to change again for a third, fourth, or tenth plugin.**

**The security lens — why `render()` returns `{ text, className }` and this project will never write `v-html` for plugin output:**

`{{ rendered.text }}` is Vue's standard text interpolation (Lesson 01) — it treats whatever `rendered.text` contains strictly as *text*, no matter what characters are in it. If a plugin's `render()` returned raw HTML instead, displaying it would require Vue's `v-html` directive, which does the opposite: it parses the string *as markup* and inserts real elements into the page.

Here is the threat, made concrete, not hypothetical: imagine a plugin whose `render()` returned
`{ text: '<img src=x onerror="alert(document.cookie)">' }`, displayed with `v-html`. The browser would parse that as a real `<img>` tag, fail to load `x` as an image, and execute the `onerror` handler — arbitrary JavaScript, running with this page's full privileges, the instant that cell rendered. This is **Cross-Site Scripting (XSS)**, named directly per this series' own contract requirement the moment rendering touches anything that could originate from outside trusted code — and a *plugin* is exactly "outside trusted code": even a plugin *this project's own future lessons* write is worth defending against as if it weren't fully trusted, because the discipline of "never trust content enough to skip escaping it" is what actually prevents the mistake, not a promise to always remember which plugins are safe.

`{{ text }}` prevents this completely — a plugin returning that exact malicious string would display the literal, inert text `<img src=x onerror="alert(document.cookie)">` on screen, doing nothing, because interpolation escapes it rather than parsing it. `RenderedCell`'s type (`{ text: string; className?: string }`, no `html` field anywhere) makes the safe choice the *only* choice: there is no field a plugin could populate with markup even if it wanted to, and no code path in `CellDisplay.vue` that would render one if there were.

---

## What breaks without this

**Adding a third special case directly inside `CellDisplay.vue` instead of as a plugin:**

The file that was supposed to only render one cell now contains unrelated `if` checks for booleans, negative numbers, and whatever comes next, all tangled together. Every future display rule requires editing and re-testing a file that has nothing to do with the new rule's actual logic — precisely the maintenance cost the Strategy pattern exists to avoid.

**Adding an `html: string` field to `RenderedCell` and rendering it with `v-html`:**

Every plugin — including ones added later by someone less careful about what data reaches them — gains the ability to inject arbitrary HTML and JavaScript into the page. A plugin that innocently formats a cell's raw text without sanitizing it (imagine a "highlight search matches" plugin that wraps user-typed text in `<mark>` tags using string concatenation) becomes a genuine XSS vector the moment a cell's own content contains an unescaped `<`.

**Checking plugins in a different order every render, instead of a stable registration order:**

If `rendererPlugins` were, say, sorted by `name` alphabetically on every call to `renderCell` instead of using registration order consistently, which plugin "wins" for a cell two plugins both match could change unpredictably as new plugins are added — a real, hard-to-diagnose bug class where a cell's appearance shifts for a reason nowhere near the code you're actually looking at.

---

## Connect the pieces

```
rendererPlugins.ts (or App.vue)
  interface RenderedCell        — { text, className? } — text only, never HTML
  interface CellRendererPlugin  — { name, matches(cell), render(cell) } — the Strategy interface
  rendererPlugins: []           — private array; only reachable via the two functions below
  registerRendererPlugin()      — adds a plugin; called once per plugin, at startup
  renderCell(cell, fallback)    — first-match-wins lookup; the one thing CellDisplay.vue calls

CellDisplay.vue
  rendered = computed(() => renderCell(cell, fallbackText))
  <span :class="rendered.className" :style="{ fontWeight, fontStyle, color }">{{ rendered.text }}</span>
                                 — :class from the plugin, :style from Lesson 13's cellStyles; both apply
                                 — text interpolation only; no v-html anywhere in this lesson
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] A cell containing `TRUE` or `FALSE` renders as ✓ or ✗
- [ ] A `number` cell holding a negative value renders in red
- [ ] A cell with no matching plugin still displays its normal value, unchanged
- [ ] Bold, italic, and a manually-picked text color (Lesson 13) still work on a cell that also matches a plugin
- [ ] Adding a third plugin (try one yourself — e.g., cells containing only `"URGENT"` rendered in bold) requires editing zero lines of `CellDisplay.vue`
- [ ] You can explain the Strategy pattern using `CellRendererPlugin` as the example, and name one other GoF pattern this series has already built (Lesson 08 or Lesson 11)
- [ ] You can explain why `Cell`'s exhaustive switches are not a real example of the open/closed principle, but this plugin registry is
- [ ] You can explain what XSS is and show the exact `RenderedCell` design decision that prevents it here

---

*Next: Lesson 17 — Performance at Scale. Grow this project's grid to 10,000 rows and watch it genuinely freeze — then fix it with real viewport virtualization, the same windowing technique production grid libraries like AG Grid and react-window actually use, rendering only what's visible regardless of how much data exists.*
