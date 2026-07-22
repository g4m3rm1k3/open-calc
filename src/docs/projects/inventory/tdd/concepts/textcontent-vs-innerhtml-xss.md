# Concept: `.textContent` vs `.innerHTML` (a Client-Side Security Choice)

**What you'll understand by the end:** why assigning to `.textContent` is safe against script injection and `.innerHTML` is not, demonstrated with a real injected payload.

**Prerequisites:** `dom-get-element-by-id.md`. A related but distinct defense from `xss-auto-escaping-jinja2.md` — that one is server-side/template-based; this one is client-side/DOM-based.

## Setup

Any modern browser. No install needed.

## The Problem

JavaScript can put content into an element in two different ways that look similar but behave very differently when the content isn't fully trusted — one treats it as plain text, the other treats it as real markup to be parsed and executed.

## The Isolated Example

```html
<div id="a"></div>
<div id="b"></div>
<script>
  const dangerous = "<img src=x onerror=\"console.log('XSS ran')\">";

  document.getElementById("a").textContent = dangerous;
  document.getElementById("b").innerHTML = dangerous;
</script>
```

**Real output (browser console):**
```
XSS ran
```

**What this proves:** only the `.innerHTML` assignment triggered the injected `onerror` handler — `console.log('XSS ran')` only appears because element `b`'s broken `<img>` tag was parsed as real HTML, and its error handler fired the moment the browser tried (and failed) to load `src=x`. Element `a`, given the exact same string via `.textContent`, displays the literal text `<img src=x onerror="console.log('XSS ran')">` on the page and runs nothing.

## Mechanical Walkthrough

- `.innerHTML`'s setter runs the assigned string through the browser's real HTML parser — the same parser that processes the page itself — so anything valid as HTML becomes real, live elements, including inline event handlers like `onerror`.
- `.textContent`'s setter never parses at all; it creates a single text node containing the string verbatim, with no interpretation of `<`, `>`, or anything else as markup.
- The `<img src=x onerror="...">` trick doesn't need a `<script>` tag to run code — a broken image reliably fails to load, firing `onerror`, which is why it's a common minimal XSS proof-of-concept even in contexts that strip literal `<script>` tags.

## CS Lens

This is the same **trust-boundary output encoding** idea as `xss-auto-escaping-jinja2.md`, applied at a different point: there, a server-side template engine escapes before sending HTML to the browser; here, client-side JavaScript decides how to interpret a string *after* receiving it. Both are real, independent points where the same threat (XSS) needs a defense — one doesn't make the other unnecessary.

Also recognized in: React's default JSX rendering (escapes by default, the same protection as `.textContent`) versus its explicit `dangerouslySetInnerHTML` opt-out, whose name is a deliberate, self-documenting warning.

## SE Lens

Reaching for `.innerHTML` should be a deliberate, rare choice, made only when real HTML genuinely needs to be inserted — and even then, only after the string has been sanitized by a real, purpose-built library, never assumed safe because "it's probably fine." `.textContent` costs nothing when the content is meant to be plain text (which is most of the time), so it should be the default reflex, not a special case reached for only when handling "untrusted" input — because knowing in advance that input will never become untrusted is a bet that's wrong often enough, in real, historical, publicly documented breaches, to not be worth making by default.

## Connection

Builds on `dom-get-element-by-id.md` (finding the element first). Directly parallel to `xss-auto-escaping-jinja2.md` — read together, they cover both the server-side and client-side halves of the same threat.

## Try It Yourself

1. Change `dangerous` to a string containing a real `<script>alert(1)</script>` tag instead of the `<img onerror>` trick. Assign it via `.innerHTML` and observe whether it actually executes — research why script tags inserted via `.innerHTML` specifically often do *not* run (a real, non-obvious browser behavior), and why the `<img onerror>` form is used as the more reliable proof-of-concept instead.
2. Write a minimal, deliberately naive sanitizer (e.g. strip all `<` characters) and apply it to `dangerous` before assigning via `.innerHTML`. Try to find an input that still triggers the handler despite your sanitizer — a real illustration of why hand-rolled sanitization is considered unsafe in practice.
3. Assign the same `dangerous` string to a real page element's `.textContent`, then read `.innerHTML` back off that same element afterward. Confirm the browser itself re-escaped it (`&lt;img...`) — proof the safety comes from what was written, not from some property of the string itself.
