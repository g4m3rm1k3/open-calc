# Lesson 2 — The Live Editor Arrives: iframes and the Trust Boundary

Today we study **the browser's cross-origin security model**. Our case study is
replacing Lesson 1's placeholder text with a real, live, editable Flutter code
editor — DartPad — embedded directly inside your lab. The moment you embed someone
else's website inside yours, you've created a boundary where two different pieces of
code, written by two different teams, run side by side on the same page. Browsers
have spent decades hardening the rules for exactly that situation, and this lesson
teaches those rules from the ground up, not as a checklist to copy, but as reasoning
you can apply the next time you embed anything.

---

## What You Will Build

`FlutterPlaygroundLab.tsx` will render a real `<iframe>` pointing at
`dartpad.dev`, showing an actual, editable, runnable Flutter counter app — the same
one DartPad shows by default. You'll type in it, click Run, and watch a real Flutter
UI render inside your lab window, inside your app. You'll also deliberately
misconfigure the iframe's security attributes once, see what breaks, and fix it —
so the security explanation isn't abstract, it's something you caused and repaired
yourself.

---

## What You Need to Know First

Lesson 1 of this set — you should have a working `FlutterPlaygroundLab.tsx`,
`index.jsx`, and registry entry, and be comfortable with `interface`, optional props
(`?`), and JSX's `{ }` escape-into-JavaScript syntax. Nothing else is assumed; every
new concept below is explained from scratch.

---

## The Lesson

### Step 1 — What an `<iframe>` Actually Is

`<iframe>` stands for **inline frame**. It's a real HTML element — as real as
`<div>` or `<h1>` — whose entire job is to embed one complete, independent HTML
document inside another. Everything inside an `<iframe>` — its own DOM tree, its own
JavaScript, its own memory, its own network requests — is completely separate from
the page that contains it. The two documents can only communicate through a small,
deliberate set of browser APIs, not by directly reaching into each other's code or
data. This isolation is not an accident or a limitation to work around — it's the
entire reason `<iframe>` is safe to use at all: you are about to put Google's
DartPad, code you did not write and cannot audit line by line, inside your app, and
the browser guarantees that code cannot silently read your app's data, your app's
cookies, or the rest of your app's page just because it's visually sitting inside it.

#### Concept lab: proving the isolation is real

Disposable, as always — this never enters the project.

Create `src/labs/_scratch/isolation-test.html` (a plain HTML file, not a React
component — this concept doesn't need React to demonstrate):

```html
<!DOCTYPE html>
<html>
<body>
  <h1 id="outer-heading">I am the outer page</h1>
  <iframe src="https://example.com" width="600" height="300"></iframe>
  <script>
    const outerHeading = document.getElementById('outer-heading')
    console.log('Outer page can see its own heading:', outerHeading.textContent)

    const frame = document.querySelector('iframe')
    try {
      console.log(frame.contentDocument.body.innerHTML)
    } catch (error) {
      console.log('Outer page CANNOT read the iframe\'s content:', error.message)
    }
  </script>
</body>
</html>
```

Open this file directly in a browser (double-click it, or drag it into a browser
tab — it doesn't need Vite or `npm run dev`, it's a standalone file). Open the
browser's developer console (F12 → Console — the panel showing JavaScript output and
errors; if this is your first time opening it, this is exactly what "the console" has
meant every time a previous lesson said "check the console").

**Expected output:**
```
Outer page can see its own heading: I am the outer page
Outer page CANNOT read the iframe's content: Blocked a frame with origin
"file://" from accessing a cross-origin frame.
```

**What that proves:** `document.getElementById` freely reads anything in the outer
page's own document — no restriction there. But
`frame.contentDocument.body.innerHTML` — reaching *into* the iframe's document to
read its content — throws an error and is blocked entirely. This is the browser's
**same-origin policy** enforcing itself automatically; you didn't write any security
code, the browser refused on its own. `example.com` and your local file are
different **origins** (defined precisely in Step 2), and the browser will not let
JavaScript from one origin read the DOM of a different origin loaded in an iframe,
full stop.

Delete `src/labs/_scratch/isolation-test.html` now.

**CS lens:** This is a **security boundary enforced by the runtime**, not by
convention or by trusting the code to behave. Compare this to calling a function in
the same file — nothing stops that function from reading any variable in scope. An
iframe from a different origin is a hard wall the JavaScript engine itself refuses
to let you cross, the same category of guarantee an operating system gives you when
it stops one process from reading another process's memory.

**SE lens:** This is the **principle of least privilege**, enforced structurally
rather than by promise: DartPad's code, whatever it does internally, is physically
incapable of reading your app's variables, your app's DOM, or your app's
`localStorage`, because the browser itself will not permit it — you don't have to
trust DartPad's authors to be careful, the isolation holds even if their code tried.

**Recognition — this same "hard boundary, not a promise" shape recurs in:**
operating system process isolation (one program crashing doesn't crash another),
containerization (Docker containers sharing a machine but not each other's
filesystem), database row-level security (a query physically cannot return rows a
user isn't permitted to see, rather than the application just choosing not to
display them), and virtual machines (one VM cannot read another VM's memory even
though they share the same physical hardware).

---

### Step 2 — What "Origin" Precisely Means

Step 1 said "different origins" without defining it. An **origin** is the exact
combination of three things: **scheme** (`https` vs `http`), **host** (the domain
name, e.g. `dartpad.dev`), and **port** (e.g. `:443`, usually invisible because it's
the default for that scheme). Two URLs are the **same origin** only if all three
match exactly.

```
https://dartpad.dev/embed-flutter.html    scheme: https   host: dartpad.dev   port: 443 (default)
https://upskillos.example.com/            scheme: https   host: upskillos.example.com   port: 443 (default)
```

These are different origins — different hosts — even though both use `https`. That
single difference is enough for every same-origin-policy rule from Step 1 to apply
in full. It doesn't matter that both are "trustworthy-looking" HTTPS sites; the
browser doesn't evaluate trustworthiness, it compares these three exact values.

**CS lens:** Origin comparison is a simple **equality check on a 3-tuple**
(scheme, host, port) — no fuzzy matching, no partial credit, no "close enough."
`http://dartpad.dev` and `https://dartpad.dev` are different origins purely because
the scheme differs, even though the host is identical.

**SE lens:** Precision here is deliberate — a security boundary with any ambiguity
in its definition is a security boundary with a loophole. "Same website" is a vague,
human concept (subdomains, related domains, "obviously the same company"); "same
origin" is a precise, mechanically checkable one, chosen specifically so there's
never a judgment call about whether two things are allowed to trust each other.

---

### Step 3 — Embedding the Real DartPad

Now the real, permanent code. Replace the placeholder `<p>` in
`FlutterPlaygroundLab.tsx` (from Lesson 1) with an actual iframe:

```typescript
export default function FlutterPlaygroundLab({ onBack, onClose }: FlutterPlaygroundLabProps) {
  const close = onBack ?? onClose
  const dartPadUrl = 'https://dartpad.dev/embed-flutter.html?theme=dark&run=true&split=50'

  return (
    <div className="relative flex h-full w-full flex-col bg-slate-50 dark:bg-slate-950">
      {close && (
        <button
          onClick={close}
          className="absolute left-4 top-4 z-10 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
        >
          Labs
        </button>
      )}
      <iframe
        src={dartPadUrl}
        title="DartPad — live Flutter editor"
        sandbox="allow-scripts"
        allow="clipboard-write"
        className="h-full w-full flex-1 border-0"
      />
    </div>
  )
}
```

**`const dartPadUrl = 'https://dartpad.dev/embed-flutter.html?theme=dark&run=true&split=50'`**
— a **template for configuration passed through the URL itself**. Everything after
the `?` is the **query string**: individual `key=value` pairs separated by `&`.
`theme=dark` tells DartPad which color scheme to render in. `run=true` tells it to
compile and run the starter code immediately, rather than waiting for a manual
click. `split=50` tells it to show the code editor and the running app side by side,
each taking 50% of the width, instead of one full-width view with a toggle. No `id`
parameter is passed — when DartPad receives no gist `id`, it falls back to its own
built-in default sample (a Flutter counter app), which is exactly what you'll see.
A specific `id` (pointing at a real Dart gist you create) is how you'd load your own
starter code instead — a natural next step, not covered in this lesson.

**A necessary honesty check, because this is a real engineering situation you will
run into constantly:** DartPad's own embedding documentation currently states that
an older embedding form is "no longer supported," while `embed-flutter.html` (used
above, and referenced by Flutter's own official docs for Flutter-specific embeds)
still exists and, as of this lesson being written, still works with these
parameters. Third-party APIs and embed formats change over time, and documentation
does not always keep up. **The professional response to this is not to blindly
trust a tutorial (including this one) forever — it's to run the code and verify the
actual behavior yourself**, which Step 5 below has you do immediately. If DartPad's
embed format changes in the future and this iframe stops working, the fix is
checking `https://github.com/dart-lang/dart-pad/wiki/Embedding-Guide` for whatever
the current supported format is, not assuming the code is permanently broken.

**`sandbox="allow-scripts"`** — the **sandbox attribute** is a browser feature built
specifically for iframes: by default, if `sandbox` is present at all (even as an
empty attribute), the browser applies the *maximum possible* set of restrictions to
that iframe's content — no JavaScript execution, no form submission, no popups, no
plugins, treated as if it came from a unique, isolated origin with no privileges at
all. Adding **tokens** (space-separated keywords) inside the attribute's value
*lifts* specific restrictions, one at a time. `allow-scripts` lifts exactly one: "let
JavaScript run inside this iframe." Nothing else is lifted. Without any JavaScript
running, DartPad — a JavaScript/Dart application — could not function at all, so this
one token is the minimum required for it to work.

**Why we deliberately do *not* add `allow-same-origin`** (a token you'll see in many
tutorials, and might expect here): that token would let the iframe's content be
treated as if it were loaded from its real origin (`dartpad.dev`) for permission
purposes — giving it access to `dartpad.dev`'s own cookies, `localStorage`, and
same-origin API calls, as it normally would have outside a sandboxed iframe. Leaving
it off means DartPad runs with even *less* privilege than it would have if you
simply visited `dartpad.dev` directly in a new tab. This matches the exact
`sandbox="allow-scripts"` value used in DartPad's own official embedding example —
we're not inventing a stricter rule than necessary, we're matching what the tool
itself expects to run under.

**`allow="clipboard-write"`** — a completely different attribute from `sandbox`,
easy to confuse because both use the word "allow." `sandbox` lifts restrictions from
a fixed, maximally-locked-down default. `allow` is the **Permissions Policy**
attribute — it grants access to specific, individually-gated browser *features*
(clipboard access, camera, microphone, fullscreen, geolocation) that are governed
separately from the sandbox system entirely, because they're not about
script-execution privileges, they're about access to sensitive device/OS
capabilities. `clipboard-write` specifically permits code inside the iframe to write
to your system clipboard — DartPad's "Copy to clipboard" button (visible on its code
editor) needs exactly this permission to function; without it, that one specific
button silently fails while everything else about DartPad works normally.

**`className="h-full w-full flex-1 border-0"`** — `border-0` removes the default
1-2px inset border browsers draw around `<iframe>` elements by default (an old,
mostly-vestigial default from when iframes commonly looked like separate boxed
panels); `h-full w-full flex-1` makes it fill all the space its parent flex
container gives it, the same sizing pattern used throughout this app's other labs.

**`title="DartPad — live Flutter editor"`** — every `<iframe>` should have a
`title` attribute. It's not visible on screen; it's read by **screen readers** —
assistive technology used by blind and low-vision users to navigate a page by
having its structure spoken aloud. Without a `title`, a screen reader announces an
iframe as an unlabeled, unnamed embedded document, giving a visually-impaired user
no way to know what it contains before entering it. This is your first appearance
of an **accessibility** concept in this lesson set; it will reappear.

---

### Step 4 — Deliberately Break the Sandbox, Then Fix It

Change `sandbox="allow-scripts"` to just `sandbox` — an empty sandbox attribute,
lifting nothing at all. Save, and reload the lab in your running app.

**Expected output:** DartPad's iframe loads a blank or broken page — no editor, no
running app, likely a blank white rectangle, because JavaScript execution itself is
now forbidden inside the iframe, and DartPad cannot function at all without it.

Open your browser's DevTools console (F12) while the broken version is loaded.
**Expected output** (approximate — exact wording varies by browser): a warning or
error mentioning that a script was blocked from executing inside a sandboxed frame.

This is the concrete, visible proof that the sandbox restriction is real and
enforced by the browser itself — not a suggestion, not something DartPad's code
could opt out of even if it wanted to. Restore `sandbox="allow-scripts"` and confirm
DartPad loads and runs correctly again.

**SE lens, made concrete by what you just saw:** this is the **fail loud, not
silent** principle again (Step 1 of Lesson 1) applied to a security misconfiguration
instead of a type error — an overly-restrictive sandbox doesn't corrupt data or
behave unpredictably, it visibly and completely fails, which is exactly the failure
mode you want from a security boundary: wrong configuration should be obvious, not
subtly broken in a way nobody notices until it matters.

---

### Step 5 — Run It for Real

`npm run dev`, open Flutter Playground. **Expected output:** a real, live DartPad
editor renders inside your lab window — a code panel on the left, a running Flutter
counter app on the right (or top/bottom, depending on window width — DartPad's own
`split=50` responsively adjusts this). Click the `+` button in the running Flutter
app; the counter increases, proving Flutter code is actually compiling and running
live, inside your app, inside a window, inside a browser tab. Edit the Dart code in
the left panel (change the button's label text, for example), and — because
`run=true` reruns automatically on changes in DartPad's own default configuration —
watch your edit appear in the running app on the right within a few seconds.

Resize the lab window from its bottom-right corner (the resize handle built into
this app's window system in an earlier session). **Expected output:** the iframe
resizes smoothly with the window — because `h-full w-full` sizes it to its
container, and the container is the window's own content area, no additional code
was needed to make the embed resizable; it inherited that behavior for free from
work already done elsewhere in this codebase.

---

## Connect the Pieces

`FlutterPlaygroundLab.tsx` now contains exactly one meaningful piece of new
surface area: a single `<iframe>`, configured with a `src` built from a hardcoded
URL and three security-relevant attributes (`sandbox`, `allow`, `title`). Everything
that made this possible was already in place from Lesson 1: the component still
receives `onBack`/`onClose` the same way, still renders inside the same
`index.jsx` → `registry.js` → windowing chain, and the window's resizability (built
into `FloatingWindow.jsx`, not this lab specifically) applies automatically because
the iframe fills its parent with plain percentage-based sizing — no lab-specific
resize code was needed.

---

## What Breaks Without This

Step 4 already demonstrated the sandbox-too-strict failure concretely. Two more,
not yet demonstrated but worth naming precisely:

**Omit `sandbox` entirely** (not empty — entirely absent) and DartPad still runs
correctly, because an iframe with no `sandbox` attribute at all runs with the
browser's normal, *unrestricted* permissions — the opposite problem from Step 4.
This would technically "work," but throws away the least-privilege guarantee Step 3
explained: DartPad's code would then run with full, ordinary web-page privileges
inside your app instead of the deliberately minimal set it actually needs.

**Omit `allow="clipboard-write"`** and everything about DartPad functions normally
*except* its own "Copy to clipboard" button, which fails silently — clicking it does
nothing, with no visible error in your app (DartPad may show its own internal error,
but nothing signals it from the outside). This is exactly the kind of quiet,
easy-to-miss permission gap that only surfaces when a real user tries the one
feature that needed it.

---

## Definition of Done

- [ ] `FlutterPlaygroundLab.tsx` renders a real `<iframe>` pointing at DartPad's
      `embed-flutter.html`, with `sandbox="allow-scripts"`, `allow="clipboard-write"`,
      and a descriptive `title`
- [ ] You can explain, without looking back, what "origin" precisely means (the
      3-tuple) and why `http://x.com` and `https://x.com` are different origins
- [ ] You can explain the difference between the `sandbox` and `allow` attributes —
      what category of thing each one controls
- [ ] You reran the Step 4 break-it-then-fix-it exercise yourself and saw the
      blank/broken iframe with your own eyes, not just read about it
- [ ] The live Flutter counter app runs inside your lab, and you clicked its
      button and watched the counter change
- [ ] The `_scratch/isolation-test.html` probe from Step 1 is deleted
- [ ] `git commit` with a message explaining why: for example, "Embed DartPad as a
      sandboxed iframe with minimum required permissions (allow-scripts only, plus
      clipboard-write for copy support) — the live Flutter editor now actually runs"
