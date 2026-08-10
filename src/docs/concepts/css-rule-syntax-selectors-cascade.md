# Concept: CSS Rule Syntax, Selectors, and the Cascade

**What you'll understand by the end:** the basic grammar of a CSS rule, how a browser decides *which* elements a rule applies to, and what happens when more than one rule tries to set the same property on the same element.

**Prerequisites:** `html-id-attribute.md`.

## Setup

Any plain HTML file and a text editor — no install, no build tool needed:
```html
<!doctype html>
<html>
  <head><style></style></head>
  <body><p id="greeting" class="loud">Hello</p></body>
</html>
```

## The Problem

HTML alone describes a page's *content and structure* (a paragraph, a heading, a list) but says nothing about how any of it should visually look. Something needs a way to say "elements matching this description should look like that" — separately from the HTML itself, so the same content can be restyled without touching its structure (see `template-rendering-separation-of-concerns.md` for the analogous separation on the server side).

## The Isolated Example

```css
p {
  color: blue;
}

.loud {
  font-size: 2em;
}

#greeting {
  color: red;
}
```
Applied to `<p id="greeting" class="loud">Hello</p>`:

**Real, rendered result:** the text reads large (2× the surrounding font size) and **red** — not blue, despite the `p` rule also matching this exact element.

## Mechanical Walkthrough

- A CSS **rule** has two parts: a **selector** (`p`, `.loud`, `#greeting` — describing *which* elements it targets) and a **declaration block** in `{ }` (one or more `property: value;` pairs — describing *what* to change about them).
- A **type selector** (`p`) matches every element of that HTML tag. A **class selector** (`.loud`, matching `class="loud"`) matches every element carrying that class, regardless of tag. An **ID selector** (`#greeting`, matching `id="greeting"`) matches at most one element, since an id is meant to be unique on a page (see `html-id-attribute.md`).
- When multiple rules target the *same* element and set the *same* property, the browser resolves the conflict using **specificity**: roughly, ID selectors outrank class selectors, which outrank type selectors — this is why `#greeting`'s `color: red` won over `p`'s `color: blue`, even though the `p` rule appears later in the file. (When specificity ties, the rule that appears *later* in the stylesheet wins — this later-wins tiebreaker is where the "cascade" in CSS's name comes from.)
- Properties that don't conflict simply combine: `.loud`'s `font-size` and `#greeting`'s `color` both applied to the same element with no conflict at all, since they set different properties.
- Some properties **inherit** by default from a parent element to its children (`color` and `font-family` are common examples) — a `color` set on `body` applies to text in every element nested inside it, unless something more specific overrides it, exactly the mechanism a project-wide `body { color: ...; }` rule relies on.

## CS Lens

CSS's selector-plus-cascade model is a **rule-based, declarative matching system** — rather than imperatively saying "find this specific element and set its color" (the way `dom-query-selector.md`'s JavaScript APIs work), CSS rules declare general *conditions* ("anything with this class," "anything of this type") and a separate resolution algorithm (specificity, then source order) decides the outcome whenever more than one rule could apply to the same thing. This same declarative-matching shape recurs in rule engines, firewall rule lists (most specific/first-matching-rule-wins semantics), and CSS's own close cousin, XML's XPath/XSLT matching rules.

Also recognized in: XPath/XSLT template matching (rules select nodes by pattern, with defined precedence when multiple templates could match the same node), and any priority-ordered rule list in general (access-control rule lists, spam-filter rules) where a defined resolution order — not just "first rule found" — determines the final outcome.

## SE Lens

Real, maintainable CSS deliberately favors low-specificity selectors (classes) over high-specificity ones (IDs, or worse, inline `style` attributes) precisely *because* of the cascade's resolution rules: a rule written with an ID selector is hard to override later without an equally-specific (or `!important`-flagged) rule fighting back — a real, common source of "why won't my CSS change take effect" confusion in real projects. Preferring classes keeps specificity low and predictable, so later rules can cleanly override earlier ones by appearing later in the file, without a specificity fight.

## Connection

Builds on `html-id-attribute.md`. Directly relevant to `:root { ... }` (a CSS pseudo-class selector matching the document's root element) and any project's `body { ... }` rule relying on inheritance to set a page-wide default text color and font.

## Try It Yourself

1. Add a fourth rule, `p.loud { color: green; }` (a **compound selector**, matching a `<p>` that also has class `loud`), above `#greeting` in the file — reason about, then verify, whether it wins over `#greeting`'s `color: red` (compare its specificity: one type selector plus one class selector, versus one ID selector).
2. Remove `#greeting`'s rule entirely and confirm the text turns blue — direct proof `p`'s rule was always matching too, simply losing the specificity conflict while `#greeting` existed.
3. Add a `div` wrapping the `<p>` with `div { color: purple; }`, and remove every rule that directly sets the paragraph's own color — confirm the paragraph's text inherits purple from its parent `div`, demonstrating inheritance operating with no rule directly targeting the `<p>` at all.
