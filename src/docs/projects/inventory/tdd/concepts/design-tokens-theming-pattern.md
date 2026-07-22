# Concept: Design Tokens — a Swappable Catalog of Named Values

**What you'll understand by the end:** why a real multi-theme system is
built as a *catalog of interchangeable value-sets* applied through one
existing seam, not as a pile of `if (theme === "dark")` checks scattered
through a codebase — and why that difference is invisible if you only
ever look at one CSS rule or one function at a time.

**Prerequisites:** `css-custom-properties.md`,
`javascript-css-custom-property-write.md`.

## Setup

Plain JavaScript — no libraries needed for the pattern itself.

## The Problem

`css-custom-properties.md` already solved "don't repeat a literal color
in ten different CSS rules" by naming it once (`--color-bg`) and reusing
that name everywhere. But that alone only supports *one* value per name,
ever. Supporting several interchangeable *looks* — a dark UI, a light UI,
a dozen more — by adding a conditional at every single place a color is
used (`background: isDark ? "#07111e" : "#ffffff"`) would mean every
themeable rule, in every file, needs to know about every theme that
exists. Adding one new theme would mean revisiting every single one of
those conditionals again.

## The Isolated Example

```javascript
const THEMES = {
  slate: { bg: "#07111e", text: "#e6eefb" },
  light: { bg: "#ffffff", text: "#0f172a" },
};

function applyTheme(name) {
  const t = THEMES[name];
  console.log("applying", name, "-> bg:", t.bg, "text:", t.text);
}

applyTheme("slate");
applyTheme("light");
```

**Real output, run this session:**
```
applying slate -> bg: #07111e text: #e6eefb
applying light -> bg: #ffffff text: #0f172a
```

**What this proves:** `applyTheme` never once asked "which theme is
this?" beyond a single lookup — the same one line of logic produced two
completely different, correct results just by being handed a different
catalog entry. Nothing about `applyTheme` itself changes when a third
theme is added to `THEMES`.

## Mechanical Walkthrough

- `const THEMES = { slate: {...}, light: {...} }` — **(a) first
  appearance, at the whole-unit level** — a **catalog**: a single object
  whose *keys* are theme identifiers and whose *values* are complete,
  self-contained sets of every value that theme controls. The individual
  pieces here (an object literal, string and property values) are all
  already-basic syntax; the concept being taught is the *shape* — grouping
  everything one theme owns into one addressable unit — not any one
  line inside it.
- `THEMES[name]` — **(b) reappearing** — property access by a
  dynamically-computed key (`dict-as-lookup-table.md`'s own JS
  equivalent), used here to select an entire value-set at once rather than
  one value.
- `console.log(...)` standing in for the real project's `setProperty`
  calls — **(b) reappearing**, a placeholder for
  `javascript-css-custom-property-write.md`'s real mechanism, kept out of
  this isolated example so the catalog *shape* stays the only thing being
  demonstrated.

## CS Lens

This is the same underlying idea as a **Strategy pattern**: a family of
interchangeable algorithms (or, here, value-sets) selected by a single
name, behind one call site that never needs to know how many strategies
exist. The "catalog" framing and the "Strategy" framing describe the
exact same structure from two angles — data-oriented (a lookup table of
value-sets) versus behavior-oriented (a family of swappable
implementations behind one interface).

Also recognized in: a game engine's material/skin system, a CLI tool's
`--format=json|yaml|csv` output selection, feature-flagged UI variants, a
compiler's target-architecture backends (x86 vs. ARM code generation
selected by one flag, the rest of the compiler unaware of the choice).

## SE Lens

The real alternative — scattering a conditional at every themeable site —
was already named as the motivating problem above, but it's worth stating
its actual cost precisely: it violates the same principle
`open-closed-principle.md` names for code paths, applied to *data*
instead — adding a new theme should mean *adding*, never *editing*
existing, already-working call sites. The catalog approach pays for that
by requiring every themeable value to be identified and centralized
*ahead of time* — a real design cost. Something themeable that was missed
when the catalog was built either silently doesn't change with the theme,
or has to be bolted on awkwardly later. This project's own real version
of that cost: a 3D scene's grid-line color was initially left out of the
catalog entirely (treated as a fixed constant), and only surfaced as a
real, visible bug — the grid nearly disappearing against certain themes'
backgrounds — once every *other* value was already swapping correctly and
this one, silently, was not.

## Connection

Builds on `css-custom-properties.md` and
`javascript-css-custom-property-write.md`, and depends on
`javascript-hex-color-blending.md` and `browser-local-storage.md` for two
of its real supporting pieces (deriving a "bright" variant of each token,
and remembering the last choice across visits). Commonly built on top of:
a settings UI letting a user actually choose between catalog entries (this
project's own `ConfigModal`/theme picker), and design systems in general,
where "tokens" is the standard industry term for exactly this catalog —
named, semantic values (not raw hex codes) that get swapped as one unit
to reskin an entire product.

## Try It Yourself

1. Add a third entry to `THEMES` above with only `bg` and no `text`, call
   `applyTheme` on it, and observe what happens to `t.text` — reason
   about why a real catalog needs every entry to supply *every* key the
   catalog promises, and what class of bug a missing key causes (compare
   to `typescript-tuple-types.md`'s "guaranteed length" guarantee — could
   a type system catch a missing catalog key the same way?).
2. Rewrite `applyTheme` to accept the *whole* theme object directly
   instead of a name plus a lookup (`applyTheme(THEMES.slate)` instead of
   `applyTheme("slate")`) — notice this still works, and consider what
   real capability is lost (hint: what did the original version let you
   log or compare that this version can't, given only the values
   themselves and no name attached to them?).
