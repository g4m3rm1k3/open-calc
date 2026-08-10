# Concept: XSS and Auto-Escaping

**What you'll understand by the end:** the Cross-Site Scripting threat, and how a real templating engine's automatic escaping defends against it by default.

**Prerequisites:** `template-rendering-separation-of-concerns.md`.

## Setup

Python 3 with Jinja2 installed:
```
pip install jinja2
```

## The Problem

**Cross-Site Scripting (XSS)**: an attacker gets their own HTML or JavaScript inserted into a page as if it were trusted content, so a victim's browser executes it. Any place user-provided text gets inserted into a page's HTML is a potential opening for this, unless something actively prevents it.

## The Isolated Example

```python
from jinja2 import Template

malicious_input = "<script>alert('stolen!')</script>"
template = Template("<p>You said: {{ user_text }}</p>")
print(template.render(user_text=malicious_input))
```

**Real output:**
```
<p>You said: &lt;script&gt;alert(&#39;stolen!&#39;)&lt;/script&gt;</p>
```

**What this proves:** the literal string `<script>...` was never inserted as real HTML — Jinja2 converted `<` to `&lt;` and `>` to `&gt;` automatically, with no code written to ask for it. A browser rendering this output shows the literal text `<script>alert('stolen!')</script>` on the page; it does not run it.

## Mechanical Walkthrough

- `Template("<p>You said: {{ user_text }}</p>")` compiles a template string containing one substitution, `{{ user_text }}`.
- `.render(user_text=malicious_input)` fills that substitution with the given value — and, before inserting it, passes it through Jinja2's escaping function, converting `<`, `>`, `"`, and `'` into their HTML-entity equivalents (`&lt;`, `&gt;`, `&#34;`, `&#39;`).
- This happens for every `{{ }}` substitution, unconditionally, unless a template explicitly opts out (Jinja2's `| safe` filter — a deliberate, rare escape hatch, not the default).

## CS Lens

This is **output encoding at a trust boundary** — the point where data crosses from "something the program computed or received" into "something interpreted by another system with its own execution semantics" (here, a browser's HTML parser) is exactly where encoding/escaping needs to happen, so the receiving system can't misinterpret data as code.

Also recognized in: SQL parameterized queries (escaping/separating data from a database query's own syntax), shell command argument quoting, and any templating or serialization boundary where untrusted data meets a system that would otherwise parse it as instructions.

## SE Lens

The alternative — building the response as a raw string (`f"<p>You said: {user_text}</p>"`) — has no such protection; any `<script>` in `user_text` becomes real, executable markup the instant a browser parses it. Auto-escaping trades essentially nothing (the visible output is identical for ordinary text) for closing off the single most common web application vulnerability class by default, rather than requiring every developer to remember to escape manually, every time, at every insertion point.

## Connection

Builds on `template-rendering-separation-of-concerns.md` — this protection only exists because rendering goes through a real engine with its own escaping logic, not string concatenation.

## Try It Yourself

1. Change `user_text` to a string containing a double quote inside an HTML attribute context (e.g. render it inside `<div title="{{ user_text }}">` with `user_text = 'x" onmouseover="alert(1)'`). Confirm the quote gets escaped too, not just `<`/`>`.
2. Deliberately bypass escaping using Jinja2's `| safe` filter (`{{ user_text | safe }}`) with the same malicious input from the main example. Confirm the raw, unescaped `<script>` tag now appears in the output — and explain, in your own words, why a template author would ever reach for this, and why it should be rare.
3. Write the same `malicious_input` through Python's own f-string interpolation with no escaping at all, and diff the two outputs side by side to see exactly what auto-escaping changed.
