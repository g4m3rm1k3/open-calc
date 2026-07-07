# Video Notes — Lesson 14 — Editor / Preview

## What You Will Build

Every note gets a tiny formatting language: wrap text in `**two asterisks**`
for bold, `*one asterisk*` for italics, and `` `backticks` `` for inline
code. Click "Edit" on any note, and it opens into a **split view** — the
raw text you typed on one side, the formatted result updating live on the
other, exactly as you type. This is the first time this project turns what
a person typed into something *visually different* from what they typed,
rather than just storing and displaying it unchanged — and the moment the
security note lesson 02 planted on purpose finally has something real to
protect against.

---

## What You Need to Know First

Lesson 13 left every note rendered as plain text inside `.note-text`, with
`renderNotesPanel` rebuilding the whole notes list from `video.notes`,
`activeTagFilter`, and `searchQuery` on every change.

---

## Step 1 — Write the Formatting Parser

**The problem:** Nothing currently transforms a note's raw text into
anything other than exactly what was typed.

Add to `script.js`:

```javascript
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderNoteMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}
```

**Walkthrough — regular expressions, a pattern-matching language for
strings.** `/&/g` is a **regular expression literal** — text wrapped in
forward slashes, describing a *pattern* to search for inside a string,
rather than an exact substring. `/&/g` is one of the simplest possible
patterns: it matches a literal `&` character, nowhere else, nothing fancy.
The `g` after the closing slash is the **global flag** — without it,
`.replace()` would only replace the *first* match it finds and stop; with
`g`, it replaces every match in the whole string. `.replace(pattern,
replacement)` is a string method, appearing here for the first time: it
scans the string, and wherever the pattern matches, substitutes the
replacement. It works the same way whether the first argument is a plain
substring or, as here, a full regular expression.

`escapeHtml` runs three of these in sequence: every `&` becomes `&amp;`,
every `<` becomes `&lt;`, every `>` becomes `&gt;`. These three characters
are **HTML's own special characters** — `<` and `>` mark the start and end
of a tag, and `&` starts a named character reference like `&amp;` itself.
Replacing them with their **HTML entity** equivalents — `&amp;`, `&lt;`,
`&gt;` — means the browser displays the literal character `<` on the page,
instead of trying to interpret it as the start of a tag. Step 2 explains
exactly why this matters here, and why it runs *first*, before anything
else in `renderNoteMarkdown`.

**Walkthrough — the three formatting patterns.** `/\*\*(.+?)\*\*/g`
matches two literal asterisks, then **captures** whatever comes between
them, then two more literal asterisks. `\*` (with a backslash before it) is
required because a bare `*` means something else entirely in regular
expression syntax — "repeat the previous thing zero or more times" — so
`\*` explicitly says "match an actual asterisk character, not that special
meaning." The parentheses, `(.+?)`, are a **capture group**: they mark part
of the match to be remembered and reused. `.` matches any character, `+`
means "one or more," and the `?` right after it makes the match **lazy**
(also called **non-greedy**) instead of greedy: it matches as *few*
characters as possible while still letting the rest of the pattern succeed.
This distinction matters the moment a note contains more than one bold
span — without the `?`, `**first**  and **second**` would greedily match
from the very first `**` all the way to the very *last* `**` in the string,
treating everything in between — including the words "and" and the second
pair of asterisks — as one single bold span, instead of two separate ones.

In the replacement string, `'<strong>$1</strong>'`, `$1` is a
**backreference** — it inserts whatever the first capture group actually
matched. If a note contains `**cool**`, the capture group holds the text
`cool`, and the whole match, `**cool**`, is replaced with `<strong>cool
</strong>`. The same shape repeats for `*(.+?)*` (italics, using `<em>`)
and `` `(.+?)` `` (inline code, using `<code>`, no escaping needed on the
backtick since it has no special meaning in HTML).

**Walkthrough — why bold is checked before italics, specifically.** A bold
span, `**cool**`, itself *contains* two single asterisks in a row. If the
italics pattern, `/\*(.+?)\*/`, ran *first*, it would match the first two
asterisks of `**cool**` as an (empty) italic span, and the parser would
produce the wrong result entirely. Running the bold replacement first means
every `**...**` is already converted to `<strong>...</strong>` — real HTML
tags, with no bare asterisks left in them — before the italics pattern ever
gets a chance to see the string, so there is nothing left for it to
incorrectly match inside what was really meant as bold.

---

## Step 2 — Security: Why `escapeHtml` Runs First, and Never Skipped

**The threat.** This project is about to do something it has never done
before: take text a person typed into this browser and place it into the
page using `innerHTML` instead of `textContent` — because rendering
`<strong>` and `<em>` tags at all requires the browser to actually parse
them as HTML, which `textContent` deliberately never does. But `innerHTML`
does not know the difference between an HTML tag *this project generated*
and one *the note's author typed directly*. If a note's raw text were
`<img src=x onerror="alert('hacked')">` and that string were placed into
`innerHTML` with no escaping at all, the browser would create a real
`<img>` element, immediately fail to load the fake source `x`, and execute
the JavaScript in `onerror` — arbitrary code, chosen entirely by whoever
wrote the note, running with full access to this page. This attack has a
name: **Cross-Site Scripting**, or **XSS** — injecting executable code
through a field meant for plain data.

**Why this project is exposed to it at all.** Right now, the only person
who can type a note is the same person viewing it — attacking yourself
provides nothing. But this is the exact same reasoning lesson 02 flagged
and deliberately chose *not* to rely on: "safe today" is not the same as
"safe by design." The moment a future version of this project supported
shared or imported note libraries — genuinely plausible, and exactly the
kind of feature lesson 19 touches with import/export — any note's text
could originate from someone else entirely.

**How `escapeHtml` prevents it, concretely.** `escapeHtml` runs as the
*first* step inside `renderNoteMarkdown`, before any of the three
formatting patterns ever see the string. `escapeHtml` only replaces `&`,
`<`, and `>` — the three characters with special meaning in HTML text
content — so the literal text `<img src=x onerror="alert(1)">` becomes
`&lt;img src=x onerror="alert(1)"&gt;`. The quote characters around
`alert(1)` are left alone; they are only dangerous *inside* an HTML
attribute, which this text is never placed into — here, the whole string
becomes the visible content of a `<span>` or `<div>`, not an attribute
value. When the browser renders that string as HTML, `&lt;` and `&gt;`
display as the literal characters `<` and `>` — plain text a reader can
see, exactly as typed — and no `<img>` element is ever created, because
there is no longer a real `<` character for the browser's HTML parser to
recognise as the start of a tag at all.

**Why this must run *before* the formatting patterns, not after.** If
`escapeHtml` ran *after* `renderNoteMarkdown`'s own replacements, it would
escape the `<strong>` and `<em>` tags this project *itself* just generated,
turning them into visible text like `&lt;strong&gt;` instead of actually
bold text — breaking the feature entirely. Escaping first, then applying
formatting to the already-safe result, means the only real `<` and `>`
characters left in the string by the time formatting runs are the ones
`renderNoteMarkdown` deliberately inserts itself.

---

## Step 3 — Split View: Raw Text and Live Rendered Result, Side by Side

**The problem:** Nothing yet lets a person actually see or edit a note's
raw text — only its final, rendered form — and nothing calls
`renderNoteMarkdown` at all yet.

Update the note-rendering loop inside `renderNotesPanel` in `script.js`:

```javascript
let editingNoteId = null;

for (const note of visibleNotes) {
  const noteItem = document.createElement('div');
  noteItem.className = 'note-item';

  const header = document.createElement('div');
  header.className = 'note-header';

  const timeLabel = document.createElement('span');
  timeLabel.className = 'note-timestamp';
  timeLabel.textContent = formatTimestamp(note.timestamp);
  timeLabel.addEventListener('click', () => handleSeek(note.timestamp));

  const editButton = document.createElement('button');
  editButton.className = 'note-edit-button';
  editButton.textContent = editingNoteId === note.id ? '✓ Done' : '✏️ Edit';
  editButton.addEventListener('click', () => {
    editingNoteId = editingNoteId === note.id ? null : note.id;
    renderNotesPanel();
  });

  header.appendChild(timeLabel);
  header.appendChild(editButton);
  noteItem.appendChild(header);

  if (editingNoteId === note.id) {
    const editor = document.createElement('div');
    editor.className = 'note-editor';

    const sourceInput = document.createElement('textarea');
    sourceInput.className = 'note-source';
    sourceInput.value = note.text;

    const renderedOutput = document.createElement('div');
    renderedOutput.className = 'note-rendered';
    renderedOutput.innerHTML = renderNoteMarkdown(note.text);

    sourceInput.addEventListener('input', () => {
      note.text = sourceInput.value;
      renderedOutput.innerHTML = renderNoteMarkdown(note.text);
      saveVideos();
    });

    editor.appendChild(sourceInput);
    editor.appendChild(renderedOutput);
    noteItem.appendChild(editor);
  } else {
    const textLabel = document.createElement('span');
    textLabel.className = 'note-text';
    textLabel.innerHTML = renderNoteMarkdown(note.text);
    noteItem.appendChild(textLabel);
  }

  noteItem.appendChild(createTagPills(note.tags));
  list.appendChild(noteItem);
}
```

Add to the CSS tab:

```css
.note-edit-button {
  background: none;
  border: none;
  color: var(--colour-accent);
  cursor: pointer;
  font-size: 0.75rem;
}

.note-editor {
  display: flex;
  gap: var(--space-sm);
}

.note-source {
  flex: 1;
  min-height: 60px;
  padding: var(--space-sm);
  border-radius: var(--radius);
  border: 1px solid var(--colour-border);
  background-color: var(--colour-page-bg);
  color: var(--colour-text);
  font-family: monospace;
}

.note-rendered {
  flex: 1;
  padding: var(--space-sm);
}
```

Click **▶ Preview**, add a note like `This is **important** and *timely*`,
then click "✏️ Edit" on it: a raw text box appears beside a live rendered
preview. Type into the box, and the preview updates on every keystroke.
Click "✓ Done" to close the editor back to the compact, rendered-only view.

**Walkthrough — conditional rendering, the same idea as lesson 04's
placeholder check, applied to a per-note choice.** `if (editingNoteId ===
note.id) { ... } else { ... }` decides, individually, for *every single
note* on every render, which of two entirely different DOM structures to
build for it — a plain rendered `<span>`, or a full editor with a textarea
and a live preview side by side. This is **conditional rendering**: what
gets built is a direct function of the current state (`editingNoteId`),
not a fixed structure that is merely shown or hidden. Only ever one note
can match `editingNoteId` at a time — every other note in the list, and
every other video's notes entirely, keeps rendering as the compact view.

`editingNoteId === note.id ? null : note.id` — clicking "Edit" on an
already-open note closes it, the exact same toggle pattern lesson 10's
`handleTagClick` used for `activeTagFilter`: an already-active thing turns
itself off when clicked again, rather than requiring a separate button.

**Walkthrough — why the `input` listener updates `renderedOutput.innerHTML`
directly, instead of calling `renderNotesPanel()`.** This is the exact
same problem lesson 11 solved for the search box, recognised again here:
`renderNotesPanel()` clears and rebuilds the *entire* notes list, including
every textarea inside it. If typing a single character called
`renderNotesPanel()`, the textarea you are actively typing into would be
destroyed and replaced by a brand-new one on every keystroke, losing focus
and cursor position immediately — the note editor would become unusable
after the very first character. Instead, the `input` listener updates only
the two specific elements it already has direct references to —
`sourceInput` and `renderedOutput` — because of the same **closure**
behaviour lesson 04 first named: this listener function was created *inside
this one pass* through the `for...of` loop, so it permanently remembers
*this specific* `note`, `sourceInput`, and `renderedOutput` — never any
other note's — for as long as the listener exists.

`saveVideos()` runs on every keystroke here, the same "save on every
change, no separate save button" pattern lesson 06 established for the
very first version of this project's notes field — now applied to
per-note, formatted text instead of one long blob per video.

---

## Connect the Pieces

```
script.js    escapeHtml(), renderNoteMarkdown() — a small, pure
             text-transform parser: raw text in, safe formatted HTML out
             editingNoteId — which single note, if any, is currently open
             in the split-view editor
             renderNotesPanel() — now builds one of two structures per
             note, decided by editingNoteId (conditional rendering)
```

`renderNoteMarkdown` is called from two places: the compact view's
`textLabel.innerHTML`, and the split view's `renderedOutput.innerHTML` —
one function, reused everywhere a note's formatted text needs to appear,
so a future third place that needs it (an exported note, for instance)
would reuse it too rather than reimplementing the same parsing twice.

---

## What Breaks Without This

**Skipping `escapeHtml` entirely, applying the formatting patterns directly
to raw `note.text`:** Add a note with the text `<img src=x
onerror="alert('xss')">`. Because the string is placed into `.innerHTML`
with no escaping, the browser creates a real `<img>` element, its `src`
immediately fails to load, and its `onerror` handler runs — a real,
arbitrary script execution, demonstrated safely on your own data. This is
exactly what the safe version prevents: the same text displays as harmless,
literal, visible text instead.

**Calling `renderNotesPanel()` inside the `input` listener instead of
updating `renderedOutput` directly:** Open a note's editor and try to type
more than one character. Focus jumps out of the textarea after the very
first keystroke, because the entire notes panel — including the textarea
itself — gets destroyed and rebuilt from scratch on every character typed.

---

## Definition of Done

- [ ] `**bold**`, `*italic*`, and `` `code` `` each render correctly in every note
- [ ] A note containing more than one bold span formats both correctly, not as one span stretching between the first and last `**`
- [ ] Clicking "✏️ Edit" opens a split view: raw text on one side, live rendered result on the other
- [ ] Typing in the raw text box updates the rendered side immediately, without losing focus
- [ ] Clicking "✓ Done" closes the editor back to the compact, rendered-only view
- [ ] Typing `<img src=x onerror="alert(1)">` into a note displays as literal, visible text — no popup, no broken layout
- [ ] You can explain what XSS is and show, concretely, what would happen if `escapeHtml` were removed
- [ ] You can explain why `escapeHtml` must run before the formatting patterns, not after
- [ ] You can explain why the bold pattern is applied before the italics pattern
- [ ] You can explain why the `input` listener updates two specific elements directly instead of calling `renderNotesPanel()`

---

*Next: Lesson 15 — Inline Math. `$x^2$`-style math notation renders as real,
properly typeset equations using KaTeX — the same rendering library this
site's own blog and lesson pages already use — extending the same
find-a-pattern-and-replace-it parser this lesson just built.*
