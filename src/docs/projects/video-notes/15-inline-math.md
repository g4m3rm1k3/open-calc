# Video Notes — Lesson 15 — Inline Math

## What You Will Build

Wrap part of a note in `$$two dollar signs$$`, and it renders as real,
properly typeset mathematical notation — the same rendering this site's own
blog and lesson pages use for every equation you have read in any of them.
Getting there means loading a real third-party library from a CDN for the
first time, and loading it in the one way that actually works inside HTML
Lab: from JavaScript itself, at runtime, rather than a tag typed into the
HTML tab.

---

## What You Need to Know First

Lesson 14 left `renderNoteMarkdown(text)` turning `**bold**`, `*italic*`,
and `` `code` `` into real HTML, with `escapeHtml` running first to keep
anything a note's author types from being interpreted as executable markup.

---

## Concept: What a CDN Is

A **CDN** — Content Delivery Network — is a network of servers, spread
across many physical locations worldwide, that host copies of popular
files: JavaScript libraries, fonts, icons. Instead of a project hosting a
library's file itself, it points a `<script>` or `<link>` tag at a CDN's
URL, and the visitor's browser downloads it from a server that is likely
physically close to them — usually faster, and with zero setup cost to the
project using it. `cdn.jsdelivr.net`, used in this lesson, is one such
network; it serves the exact files published to `npm` (the same package
registry `katex` — a real dependency of this site itself — is published
to), just reachable by a plain URL instead of an `npm install`.

**Why this lesson cannot simply type a `<script>` tag into the HTML tab.**
Lesson 01 explained that the HTML tab holds only what belongs inside
`<body>` — HTML Lab assembles the rest of a real page (`<head>`, the
`<!DOCTYPE>`, and so on) for you. Tags like `<script>`, `<style>`,
`<link>`, and `<meta>` are exactly the kind of thing that belongs in that
head section HTML Lab already manages through its own tabs — the CSS tab,
the JavaScript tab. Type one directly into the HTML tab, and HTML Lab
recognises it as configuration it already owns elsewhere, and leaves it out
of the page entirely, silently. This is not a workaround for a limitation —
it is the direct, honest consequence of the same design lesson 01
introduced: the HTML tab is body content, nothing else, always. This lesson
instead loads KaTeX the way any real web page can always load a library at
runtime: through JavaScript, which can reach the page's `<head>` directly,
regardless of what any editor's tabs choose to manage for you.

---

## Step 1 — Load KaTeX at Runtime

**The problem:** `katex`, the library that will do the actual math
rendering, does not exist anywhere yet — nothing has asked the browser to
download it.

Add to the very top of `script.js`:

```javascript
let katexReady = false;

function loadStylesheet(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

function loadScript(url, onLoad) {
  const script = document.createElement('script');
  script.src = url;
  script.onload = onLoad;
  document.head.appendChild(script);
}

loadStylesheet('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css');
loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js', () => {
  katexReady = true;
  renderNotesPanel();
});
```

**Walkthrough:** `document.createElement('link')` and `document.createElement
('script')` use the exact same DOM method lesson 02 first used to build
`<div>` elements — any tag name can be created this way, not just visible
ones. `document.head` is the DOM's direct reference to the page's `<head>`
element — the section HTML Lab manages for you and the HTML tab has no way
to edit, but JavaScript can still reach it directly, which is exactly how
this code gets a real `<link>` and `<script>` into the page despite the
HTML tab being unable to do so itself.

`link.href = url` and `script.src = url` tell each element *what* to load
— setting `.href` on a stylesheet `<link>` or `.src` on a `<script>` is
what actually triggers the browser to start downloading that URL, the
moment the element is attached to the page with `document.head.appendChild
(...)`. A `<script>`'s download happens in the background — the browser
does not pause and wait for it before continuing to run the rest of
`script.js` beneath this code.

**Walkthrough — `.onload`, and why `katexReady` exists at all.** `script.
onload = onLoad` registers a function to run at exactly one moment: the
instant the browser finishes downloading *and executing* the file at
`script.src`. Before that moment, the global `katex` object this library
defines does not exist yet — calling `katex.renderToString(...)` any
earlier would throw `katex is not defined`, a real error, not a
hypothetical one. `katexReady` is a plain boolean, starting `false`,
flipped to `true` only inside this `onload` callback — every other part of
this project that wants to use KaTeX checks this flag first, rather than
assuming the library is already available the instant the page loads.

**SE lens — why `renderNotesPanel()` is called inside `onload`, unprompted
by anything a person did.** A note using `$$...$$` math notation, typed
*before* KaTeX finishes downloading (entirely possible — the note editor
works immediately; the library takes a moment to arrive over the network),
would render with its math left as plain, unformatted text the first time
`renderNotesPanel()` ran. Calling `renderNotesPanel()` again the moment
`katexReady` becomes `true` re-renders every already-visible note using the
exact same rendering function as always — Step 2's `renderNoteMarkdown`
simply produces a different, better result the second time, because the
one thing it depends on that changed, `katexReady`, changed. No note, no
video, and no part of this project needs to know or care that this
"automatic upgrade" is even happening.

---

## Step 2 — Render `$$math$$` Spans

**The problem:** `renderNoteMarkdown` currently has no idea `$$...$$`
means anything special — it would pass straight through `escapeHtml` and
display as literal dollar signs and text.

Update `renderNoteMarkdown` in `script.js`:

```javascript
function renderNoteMarkdown(text) {
  const mathHtmlList = [];

  const textWithMathTokens = katexReady
    ? text.replace(/\$\$(.+?)\$\$/g, (fullMatch, mathSource) => {
        const token = `@@MATH${mathHtmlList.length}@@`;
        mathHtmlList.push(katex.renderToString(mathSource, { throwOnError: false }));
        return token;
      })
    : text;

  let formatted = escapeHtml(textWithMathTokens)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

  mathHtmlList.forEach((mathHtml, index) => {
    formatted = formatted.replace(`@@MATH${index}@@`, mathHtml);
  });

  return formatted;
}
```

Click **▶ Preview**, add a note with text like
`The area is $$\pi r^2$$, always.`, and open its editor: within a moment of
the page loading, the `$$...$$` span renders as a real, properly typeset
equation, both in the compact view and the live split-view preview.

**Walkthrough — extract, protect, reinsert.** Simply running the math
pattern's replacement directly, the way lesson 14's bold and italic
patterns work, would not be safe here: `katex.renderToString(...)` returns
real, trusted HTML — `<span>` tags with specific classes KaTeX's own
stylesheet depends on — and if that HTML were inserted *before*
`escapeHtml` runs, `escapeHtml` would immediately mangle it, turning every
one of KaTeX's own `<` and `>` characters into visible, broken text instead
of a rendered equation. The fix is the same idea a real tokenizer uses,
mentioned only briefly here because a full one is well beyond this
lesson's scope: pull the risky or special part out *first*, replace it with
a harmless, unique placeholder — `@@MATH0@@`, `@@MATH1@@`, and so on, text
that could never accidentally appear in a real note — let every other step
run safely against that placeholder text, and only put the real content
back in at the very end, after everything that could have damaged it has
already finished running.

`text.replace(/\$\$(.+?)\$\$/g, (fullMatch, mathSource) => { ... })` uses a
form of `.replace()` not seen until now: when the second argument is a
*function* instead of a plain string, `.replace()` calls that function once
for every match, and substitutes whatever the function returns in its
place. `fullMatch` is the entire matched text (`$$\pi r^2$$`, including the
dollar signs); `mathSource` is the captured group inside it (`\pi r^2`,
the parentheses' content from the same `(.+?)` capture-group syntax lesson
14 introduced). `mathHtmlList.push(katex.renderToString(mathSource, {
throwOnError: false }))` calls the library itself: `katex.renderToString`
takes a string of math notation (`\pi r^2` — a real subset of **LaTeX**,
the typesetting language mathematicians and scientists have used for
decades to write equations) and returns a string of real HTML that
displays as properly formatted mathematical notation — fractions, exponents,
Greek letters, and more, entirely generated from the pattern's rules, none
of it hand-built by this project.

**Walkthrough — `{ throwOnError: false }`.** By default, `katex.
renderToString` *throws* an error the instant it encounters math notation
it cannot parse — a typo in a LaTeX command, unbalanced braces. Passing
`{ throwOnError: false }` — an **options object**, the second argument
`renderToString` accepts — changes that behaviour: instead of throwing,
KaTeX renders the broken notation as plain, visibly red error text in its
place. An uncaught exception here would happen *inside* `renderNoteMarkdown`,
which runs during every single render of the notes panel — without this
option, one mistyped equation would crash the entire notes panel for that
video, every time it tried to render, until the note was somehow fixed
blind. `{ throwOnError: false }` turns "the whole feature breaks" into "one
equation shows a visible mistake" — a far better failure for something a
person is actively typing and might get wrong mid-thought.

**Security lens — why KaTeX's own output skips `escapeHtml`, and this is
still safe.** Lesson 14 established that user-typed text must always pass
through `escapeHtml` before reaching `innerHTML`, specifically because raw
user text could contain a real `<img onerror="...">` tag. `katex.
renderToString`'s output is different: it is not the note's author's text
forwarded as-is — it is HTML that KaTeX itself *generates*, entirely from
interpreting math notation as data, never as markup to be passed through
literally. LaTeX math syntax has no equivalent of an HTML tag or an
`onerror` attribute for a person to inject in the first place — the worst
a mistyped equation can do, thanks to `throwOnError: false`, is display as
red error text. Trusting a well-established library's own generated output
is a different, narrower kind of trust than trusting raw user input
directly, and it is why this is the one place in this project's rendering
pipeline that safely bypasses `escapeHtml`.

---

## Connect the Pieces

```
script.js    katexReady, loadStylesheet(), loadScript() — loading a
             third-party library at runtime, once, when the page starts
             renderNoteMarkdown() — now extracts $$...$$ spans before
             escaping, renders each through KaTeX, and reinserts the
             result afterward
```

`renderNoteMarkdown` still runs from the exact same two places lesson 14
left it: the compact note view, and the split-view editor's live preview —
math notation typed into either one now renders identically, with zero
changes needed at either call site.

---

## What Breaks Without This

**Typing `<script src="...katex.min.js"></script>` directly into the HTML
tab instead of loading it from JavaScript:** Click ▶ Preview and check the
JavaScript tab's console. `katex is not defined` — the tag was silently
dropped from the page entirely, exactly as the Concept section above
explained, because HTML Lab treats `<script>` tags typed into the HTML tab
as configuration it already owns elsewhere, not real page content.

**Without the `katexReady` check (calling `katex.renderToString` on every
render, unconditionally):** Reload the page and immediately open a note
with math notation in it, before the library has finished downloading over
the network. `katex is not defined` throws inside `renderNoteMarkdown`,
which runs inside `renderNotesPanel` — the entire notes panel fails to
render anything at all, for a video that has done nothing wrong, for as
long as the race between "page loads" and "library finishes downloading"
happens to go the wrong way.

**Without `{ throwOnError: false }`:** Type a deliberately broken equation
like `$$\frac{1}{$$` (an unclosed brace) into a note. KaTeX throws
immediately, uncaught, and — because this happens inside
`renderNotesPanel`, called after nearly every action in this project —
the entire notes panel stops rendering anything at all, for every video,
until the offending text is somehow removed.

---

## Definition of Done

- [ ] `$$...$$` in any note renders as real, properly typeset mathematical notation
- [ ] Math notation typed before KaTeX finishes loading still renders correctly once loading completes, with no action needed from you
- [ ] A deliberately malformed equation shows visible red error text instead of breaking the notes panel
- [ ] You can explain what a CDN is and why `cdn.jsdelivr.net` can serve the same files `npm install katex` would
- [ ] You can explain why typing a `<script>` tag directly into the HTML tab does not load anything
- [ ] You can explain what `.onload` is for and what would go wrong without checking `katexReady` before calling `katex.renderToString`
- [ ] You can explain the extract-protect-reinsert pattern used for math spans, and why it is necessary specifically for KaTeX's HTML output but was not needed for lesson 14's bold and italic replacements
- [ ] You can explain why KaTeX's generated HTML is trusted without passing through `escapeHtml`, while a note's own raw text never is

---

*Next: Lesson 16 — Settings and Themes. A settings panel lets a person
switch between light and dark themes and choose their preferred date
format — the CSS custom properties lesson 01 built for exactly this
moment, finally given a second, alternate set of values to switch between.*
