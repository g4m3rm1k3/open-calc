# Concept: Template Rendering as Separation of Concerns

**What you'll understand by the end:** why "what data to show" and "how it looks" are usually kept in separate files, connected by a rendering step.

**Prerequisites:** none.

## Setup

Python 3, no packages needed — this example builds a minimal template renderer from scratch to show the underlying idea before naming any real templating library.

## The Problem

Building a page as a big string built up inside application code (`"<html>" + "<p>" + name + "</p>" + ...`) mixes two different jobs together: deciding *what* to show and deciding *how it's structured*. As a page grows, that mixture gets harder to read and harder to change without breaking something unrelated.

## The Isolated Example

`greeting.txt` (the "template" — a separate file):
```
Hello, {name}!
```

`render.py`:
```python
def render(template_path, **values):
    with open(template_path) as f:
        text = f.read()
    return text.format(**values)

print(render("greeting.txt", name="World"))
```

**Real output:**
```
Hello, World!
```

**What this proves:** `render` knows nothing about *what* greeting to produce — it just reads a file and fills in blanks with whatever it's given. The "what" (the actual name) lives entirely in the caller. Real templating engines (Jinja2, ERB, Handlebars) do the same job with a much richer templating language — conditionals, loops, escaping — but the split is identical: a template file describing structure, and a render step filling it with real data.

## Mechanical Walkthrough

- `open(template_path)` reads the template file's raw text from disk.
- `text.format(**values)` is Python's built-in string formatting — `{name}` in the source text gets replaced by the `name` keyword argument's value.
- `**values` collects any keyword arguments the caller passes (`name="World"`) into a dict, which `.format(**values)` then unpacks back out as substitutions.

## CS Lens

This is a **Model-View split** — the "model" (the actual data, `name="World"`) is decided by the caller; the "view" (`greeting.txt`, the structure/wording) never changes based on what data flows through it. Neither side needs to know the other's internals to do its job.

Also recognized in: every server-side web framework (Django templates, Rails' ERB, PHP's Blade), and the broader Model-View(-Controller) pattern across UI frameworks generally.

## SE Lens

The alternative — building output as a string directly in application code — works for one tiny case and becomes unmanageable fast as more content and more conditional logic get mixed into it. Separating template from code also unlocks a real safety property real templating engines add on top of this basic split: automatic escaping of inserted values (see `xss-auto-escaping-jinja2.md`) — a protection only possible because rendering goes through a defined engine, not raw string concatenation.

## Connection

`xss-auto-escaping-jinja2.md` is the direct payoff of routing rendering through a real template engine instead of the bare `.format()` shown here — that entry picks up exactly where this one stops.

## Try It Yourself

1. Add a second placeholder to `greeting.txt` (e.g. `Hello, {name}! You are {age} years old.`) and pass both values to `render`. Confirm both get substituted.
2. Call `render` without providing a required value (omit `name`). Read the real error Python's `.format()` raises, and note what it tells you about missing data versus a typo in the template.
3. Rewrite `render` to loop over a list and repeat a template line once per item (a minimal version of what real templating engines' `{% for %}` loops do) — e.g. render `"- {item}\n"` once for each string in a list, concatenating the results.
