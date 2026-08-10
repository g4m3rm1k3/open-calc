# Concept: Icons as Importable Components

**What you'll understand by the end:** how a modern icon library ships
each icon as its own real component, rather than a font file or a
sprite sheet, and why that changes how icons are chosen, sized, and
colored.

**Prerequisites:** `js-array-map-transform.md` (or any prior exposure to
rendering a list of components — used here only to look up a component
by a string key, not to iterate).

## Setup

```
npm install lucide-react
```

(Any comparable icon-components library — `react-icons`, `@heroicons/
react` — works the same way; this concept isn't specific to one
package.)

## The Problem

Older approaches to icons on the web load an icon font (a typeface
where each "letter" renders as a picture) or a sprite sheet (one big
image, with CSS cropping out one icon at a time). Both work, but
neither is a real, individual piece of UI: you can't pass an icon font
character a `color` prop the way you'd pass a prop to any other
component, and a sprite sheet requires manually tracking pixel
coordinates. A component-based icon library solves this by making each
icon a real, standalone function component — sized, colored, and
composed exactly like any other piece of UI, because it *is* one.

## The Isolated Example

```tsx
import { Droplet, Settings } from "lucide-react";

function IconDemo() {
  return (
    <div>
      <Droplet size={24} color="blue" />
      <Settings size={16} strokeWidth={1} />
    </div>
  );
}
```

**Real output:** a real, rendered blue water-drop SVG icon at 24px,
and a thinner-stroked gear icon at 16px — both are ordinary DOM `<svg>`
elements, inspectable and stylable exactly like any other element,
because that's genuinely what they are.

**What this proves:** `Droplet` and `Settings` are real functions that
each return an `<svg>` element — passing `size`/`color`/`strokeWidth`
as props works exactly the same way passing props to any other
component does, because there's no separate "icon system" here at all,
just components.

## Mechanical Walkthrough

- `import { Droplet, Settings } from "lucide-react"` — a named import
  of two specific icon components out of the library's full catalog
  (hundreds of icons) — only the icons actually used are pulled into
  the final bundle, not the whole library.
- `<Droplet size={24} color="blue" />` — an ordinary component
  invocation with props; `size` and `color` are this library's own
  documented prop names, mapped internally onto the underlying `<svg>`
  element's `width`/`height`/`stroke` attributes.
- A lookup pattern this concept commonly pairs with: storing several
  icon components in a plain object, keyed by some other value in your
  data, then rendering whichever one matches — `{ danger: AlertIcon,
  info: InfoIcon }[kind]` — falling back to a default icon when the key
  doesn't match anything in the table.

## CS Lens

This is the same idea as any other component library, applied to a
specific kind of content (a small vector graphic) — the same "everything
is a component" idea a UI framework already commits to everywhere else,
rather than carving out icons as a special case with their own rules.

## SE Lens

The alternative — an icon font — was the dominant approach for years,
and still has one real advantage this concept doesn't: a single font
file can contain hundreds of icons in one network request, where
importing many individual components (even tree-shaken) still means
many small module references. The real cost traded away: icon fonts
render as text, so a screen reader or a failed font load can show a
raw, meaningless character glyph instead of a picture — a real
accessibility and reliability regression component-based icons don't
have, since a failed icon component simply doesn't render, and a real
`<svg>` can carry its own `aria-label` directly.

## Connection

Builds on ordinary component composition (props, conditional rendering)
— nothing about icons specifically is a new mechanism once components
themselves are understood. Commonly built on top of: a lookup table
mapping a domain value (a status, a category) to the icon that
represents it, exactly the pairing shown in the Mechanical Walkthrough.

## Try It Yourself

1. Render the same icon twice with different `color` values and confirm
   both render independently — proof each invocation is a fully separate
   component instance, not a shared, mutable resource.
2. Build a small lookup object mapping three string keys to three
   different icon components, and render whichever one matches a
   variable's current value — including a fallback icon for a key that
   doesn't match any entry.
3. Inspect one rendered icon in the browser's dev tools and confirm it's
   a real `<svg>` element with real child `<path>` elements, not an
   `<img>` tag or a font-rendered character.
