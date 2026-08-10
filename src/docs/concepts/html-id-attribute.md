# Concept: HTML `id` Attribute

**What you'll understand by the end:** what an HTML attribute is, and why `id` specifically gives an element a stable handle other code can find it by.

**Prerequisites:** none.

## Setup

Any modern browser. No install needed — save the example as an `.html` file and open it directly.

## The Problem

JavaScript running on a page often needs to find and change one specific element. Locating it by counting positions in the page, or by matching its visible text, breaks the moment the page's layout or wording changes. A stable, explicit name is needed instead.

## The Isolated Example

```html
<p id="greeting">nothing yet</p>
<script>
  const el = document.getElementById("greeting");
  el.textContent = "found it";
  console.log(el.tagName, el.id);
</script>
```

**Real output (browser console):**
```
P greeting
```

**What this proves:** `document.getElementById("greeting")` found the exact `<p>` element by matching its `id` attribute's value — a string chosen by whoever wrote the HTML, with no meaning to the browser beyond "the unique name of this element."

## Mechanical Walkthrough

- An **attribute** is a name-value pair inside an HTML tag, written `name="value"`, configuring or describing that element.
- `id="greeting"` sets this specific `<p>` element's `id` attribute to the string `"greeting"`.
- `id` values must be unique within one page — two elements sharing an `id` is invalid HTML; browsers won't error, but only the first match will ever be found by an id-based lookup.

## CS Lens

This is a **unique key** in the same sense a database primary key or a dictionary key is — a value guaranteed (by convention/validity rules, not enforced at parse time) to identify exactly one thing within its scope.

Also recognized in: CSS's `#greeting { ... }` selector (the same `id`, a different consumer), and every framework's underlying need for a stable handle to a real element, however that handle gets managed above the raw DOM.

## SE Lens

The alternative — finding "the status paragraph" by its position in the page (e.g. "the third `<p>` tag") or its current text — is fragile: reordering the page or changing placeholder wording silently breaks the lookup. An explicit `id`, chosen once and referenced by name, is independent of both position and content.

## Connection

Directly enables `dom-get-element-by-id.md` — the JavaScript API built specifically to look elements up by this attribute.

## Try It Yourself

1. Add a second `<p id="greeting">` to the same page (an intentionally invalid duplicate). Confirm `getElementById` still finds *an* element, and check whether it's the first or the second one in the page.
2. Change `id="greeting"` to `class="greeting"` and try `document.getElementsByClassName("greeting")` instead — note it returns a *collection*, not a single element, even with only one match. What does that difference tell you about what `id` guarantees that `class` doesn't?
3. Try setting `id` to a value containing a space (e.g. `id="my greeting"`). Does `getElementById("my greeting")` still find it? Look up whether spaces in `id` values are actually valid HTML.
