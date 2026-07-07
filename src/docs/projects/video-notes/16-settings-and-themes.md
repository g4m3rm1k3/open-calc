# Video Notes — Lesson 16 — Settings and Themes

## What You Will Build

A "⚙️ Settings" button opens a small panel with two real preferences: a
light/dark theme, and how video dates display — "3 days ago" or "Jan 5,
2025." Both choices apply instantly and survive a reload. This lesson does
not invent a new way to theme a page — it finally uses the one lesson 01
built sixteen lessons ago and set aside, on purpose, for exactly this
moment.

---

## What You Need to Know First

Lesson 01 defined every colour this project uses as a CSS custom property
inside a single `:root` block, specifically so a future theme could exist
by defining a second set of values, nothing more. Lesson 12 gave every
video a `created` timestamp, used until now only for sorting.

---

## Step 1 — Store Preferences, Separately From Video Data

**The problem:** A theme choice and a date-format choice need to persist
across reloads, the same way `videos` already does — but they describe
*how the app behaves*, not video content, and mixing the two into one
saved object would blur a distinction worth keeping clear.

Add near the top of `script.js`, above where `videos` is loaded:

```javascript
const PREFERENCES_STORAGE_KEY = 'video-notes-preferences';

function loadPreferences() {
  const defaults = { theme: 'dark', dateFormat: 'relative' };
  const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);

  if (!saved) {
    return defaults;
  }

  try {
    return { ...defaults, ...JSON.parse(saved) };
  } catch {
    return defaults;
  }
}

function savePreferences() {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

const preferences = loadPreferences();
```

**Walkthrough:** This is the exact same shape as `saveVideos`/`loadVideos`
from lesson 06 — a dedicated `localStorage` key, a save function, a load
function guarded by `try`/`catch` against corrupted data — applied to a
second, independent piece of persisted state. **SE lens — why a second key
instead of one bigger object.** `videos` is this project's actual content;
`preferences` is configuration describing how that content is displayed.
Keeping them under separate `localStorage` keys means either one can be
read, saved, reset, or migrated without touching the other — clearing a
corrupted preferences object, for instance, would never risk the video
library sitting beside it in storage.

**Walkthrough — merging saved data with defaults using the spread
operator.** `{ ...defaults, ...JSON.parse(saved) }` is the same `...`
spread syntax lesson 12 used to copy an array (`[...videos]`), used here on
a plain object instead: it copies every key from `defaults` first, then
copies every key from the parsed saved object *on top of it*, so any key
present in both keeps the *later* value. If a future version of this
project added a third preference — say, `autoplay` — an *old* saved object
missing that key would still produce a complete `preferences` object,
because `defaults` supplies whatever the saved object does not have. This
is a simpler migration than lesson 07's video migration needed, specifically
because `preferences` is one flat object with a handful of keys, not an
array where every individual element needs its own check.

---

## Step 2 — Build the Settings Panel

**The problem:** Nothing on the page lets a person actually see or change
these preferences yet.

Update the top of the HTML tab, wrapping the existing `<h1>` in a header row
and adding a settings panel beneath it:

```html
<div class="app-header">
  <h1>Video Notes</h1>
  <button id="settings-toggle-button" class="settings-toggle-button">⚙️ Settings</button>
</div>

<div id="settings-panel" class="settings-panel settings-panel-hidden">
  <div class="settings-row">
    <span>Theme</span>
    <div class="theme-buttons">
      <button id="theme-dark-button" class="theme-button">🌙 Dark</button>
      <button id="theme-light-button" class="theme-button">☀️ Light</button>
    </div>
  </div>
  <div class="settings-row">
    <span>Video Dates</span>
    <select id="date-format-select">
      <option value="relative">Relative (3 days ago)</option>
      <option value="absolute">Absolute (Jan 5, 2025)</option>
    </select>
  </div>
</div>

<div class="app">
  ...
```

Add to the CSS tab:

```css
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-toggle-button {
  margin-right: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  border: 1px solid var(--colour-border);
  background-color: var(--colour-panel-bg);
  color: var(--colour-text);
  cursor: pointer;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background-color: var(--colour-panel-bg);
  border-bottom: 1px solid var(--colour-border);
}

.settings-panel-hidden {
  display: none;
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-buttons {
  display: flex;
  gap: var(--space-sm);
}

.theme-button {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  border: 1px solid var(--colour-border);
  background-color: var(--colour-page-bg);
  color: var(--colour-muted);
  cursor: pointer;
}

.theme-button-active {
  border-color: var(--colour-accent);
  color: var(--colour-text);
}
```

Add to `script.js`:

```javascript
document.getElementById('settings-toggle-button').addEventListener('click', () => {
  document.getElementById('settings-panel').classList.toggle('settings-panel-hidden');
});
```

Click **▶ Preview**. Clicking "⚙️ Settings" opens and closes the panel; the
buttons and dropdown inside it do nothing meaningful yet.

**Walkthrough — `classList`, a new way to change an element's classes.**
Every element has a `.classList` property — an object representing its CSS
classes as a set of independent strings, rather than one long space-separated
string you would otherwise have to parse and rebuild by hand.
`.toggle(className)`, called with one argument, checks whether the class is
currently present: if it is, `.toggle` removes it; if it is not, `.toggle`
adds it — flipping between the two states on each call. This is the
simplest possible way to build a show/hide button: the panel starts with
`settings-panel-hidden` already in its HTML, and each click flips that one
class, with `display: none` in the CSS doing the actual hiding.

`.settings-panel-hidden` existing as a real, separate class — rather than
setting `element.style.display = 'none'` directly from JavaScript — keeps
the *rule* for what "hidden" looks like in CSS, where every other visual
rule already lives, and lets JavaScript's only job be deciding *when* that
rule applies.

---

## Step 3 — Wire Up the Theme Buttons

**The problem:** Clicking "🌙 Dark" or "☀️ Light" currently does nothing —
and nothing yet actually applies a light theme anywhere in the CSS.

Add a second, alternate set of design-token values to the CSS tab, below
the `:root` block lesson 01 defined:

```css
.theme-light {
  --colour-page-bg:   #f8fafc;
  --colour-panel-bg:  #ffffff;
  --colour-border:    #e2e8f0;
  --colour-text:      #0f172a;
  --colour-muted:     #475569;
}
```

Add to `script.js`:

```javascript
function applyTheme() {
  document.body.classList.toggle('theme-light', preferences.theme === 'light');
  document.getElementById('theme-dark-button').classList.toggle('theme-button-active', preferences.theme === 'dark');
  document.getElementById('theme-light-button').classList.toggle('theme-button-active', preferences.theme === 'light');
}

document.getElementById('theme-dark-button').addEventListener('click', () => {
  preferences.theme = 'dark';
  applyTheme();
  savePreferences();
});

document.getElementById('theme-light-button').addEventListener('click', () => {
  preferences.theme = 'light';
  applyTheme();
  savePreferences();
});

applyTheme();
```

Click **▶ Preview**, open Settings, and click "☀️ Light": every panel,
border, and text colour on the page changes instantly, because every one of
them was already written as `var(--colour-...)`, never a hardcoded value.
Reload the page: the light theme is still active.

**Walkthrough — `.toggle(className, force)`, the second argument.** Step 2
used `.toggle(className)` with one argument, flipping based on whatever the
current state happens to be. Here, a *second* argument, `force`, changes
the behaviour entirely: `.toggle('theme-light', true)` always *adds* the
class; `.toggle('theme-light', false)` always *removes* it — `.toggle`
never flips when `force` is supplied, it simply matches whatever boolean
you give it. `preferences.theme === 'light'` is exactly the boolean needed:
`true` exactly when the theme should be light, `false` otherwise. This
version is the correct choice here specifically because clicking "🌙 Dark"
must always *result in* dark, regardless of whatever state things happened
to be in before the click — a plain flip would be wrong the moment someone
clicked the same button twice in a row.

**CS lens — why `.theme-light` overriding a handful of variables is enough
to retheme the entire page.** Every colour in this project's CSS, since
lesson 01, was written as `var(--colour-page-bg)`, never a literal hex
code. `.theme-light` on `<body>` does not touch a single one of those
`var(...)` usages directly — it only redefines what `--colour-page-bg`
*itself* currently means, for as long as that class is present. Every
element anywhere on the page referencing that variable — the header, every
sidebar, every note, every button — updates automatically, because CSS
custom properties are resolved live, at the moment they are used, not
locked in when a stylesheet is first written. This is precisely the payoff
lesson 01 named when it first introduced `:root` variables: "themes will
turn out to be 'define a second `:root`-like block with different
values.'" Nothing about that original block needed to change to make this
possible.

**SE lens — why `applyTheme()` also updates the two buttons' active state,
not just `<body>`'s class.** `document.getElementById('theme-dark-button').
classList.toggle('theme-button-active', preferences.theme === 'dark')`
keeps a second thing in sync with the same one fact — which theme is
active — the same "derive every dependent thing from one source of truth"
discipline `renderVideoList`'s active-item highlight has followed since
lesson 04. There is exactly one variable that can be wrong,
`preferences.theme`; both the actual page colours and the buttons showing
which one is selected are kept correct by the same single function,
`applyTheme()`, called every time that one variable changes.

`applyTheme();`, called once at the bottom with no arguments, is what makes
the *saved* theme actually apply the moment the page loads — without this
call, the light theme choice would be remembered in `localStorage`
correctly, but the page would still open looking dark until a button was
clicked again.

---

## Step 4 — Wire Up the Date Format, and Show It

**The problem:** `video.created`, added in lesson 12, has never been shown
anywhere — only used internally for sorting. Nothing yet turns it into
readable text, and the dropdown does nothing.

Add to `script.js`:

```javascript
function formatDate(timestamp) {
  if (preferences.dateFormat === 'absolute') {
    return new Date(timestamp).toLocaleDateString();
  }

  return formatRelativeDate(timestamp);
}

function formatRelativeDate(timestamp) {
  const elapsedMinutes = Math.floor((Date.now() - timestamp) / 60000);

  if (elapsedMinutes < 1) {
    return 'just now';
  }
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays}d ago`;
}

document.getElementById('date-format-select').addEventListener('change', (event) => {
  preferences.dateFormat = event.target.value;
  savePreferences();
  renderVideoList();
});

document.getElementById('date-format-select').value = preferences.dateFormat;
```

Update `renderVideoList` in `script.js` to display each video's date, which
means building two small elements instead of setting `item.textContent`
directly:

```javascript
function renderVideoList() {
  const container = document.getElementById('video-list-items');
  container.textContent = '';

  for (const video of getSortedVideos()) {
    const item = document.createElement('div');
    item.className = video.id === selectedVideoId
      ? 'video-item video-item-active'
      : 'video-item';

    const titleLabel = document.createElement('div');
    titleLabel.className = 'video-item-title';
    titleLabel.textContent = video.title;

    const dateLabel = document.createElement('div');
    dateLabel.className = 'video-item-date';
    dateLabel.textContent = `Added ${formatDate(video.created)}`;

    item.appendChild(titleLabel);
    item.appendChild(dateLabel);
    item.addEventListener('click', () => selectVideo(video.id));

    if (videoSortOrder === 'custom') {
      item.draggable = true;
      item.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', String(video.id));
      });
      item.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
      item.addEventListener('drop', (event) => {
        event.preventDefault();
        const draggedId = Number(event.dataTransfer.getData('text/plain'));
        reorderVideos(draggedId, video.id);
      });
    }

    container.appendChild(item);
  }
}
```

Add to the CSS tab:

```css
.video-item-date {
  font-size: 0.75rem;
  color: var(--colour-muted);
  margin-top: 2px;
}
```

Click **▶ Preview**. Every video now shows "Added just now" (or similar)
beneath its title. Switch the dropdown to "Absolute": the same videos now
show a real calendar date instead.

**Walkthrough — `new Date(timestamp)`, a constructor, the general shape
behind lesson 03's `new URL(...)`.** `Date.now()`, used since lesson 12,
returns a plain number — milliseconds since the Unix epoch. `new
Date(timestamp)` is different: `new` is JavaScript's keyword for
**constructing** a real object **instance** from a specific number —
turning a plain millisecond count back into a full `Date` object with
methods for working with it. This is the same pattern lesson 03's `new
URL(url)` already used, without naming it directly at the time: `new`
followed by a capitalised name calls that name's **constructor** — a
special function whose job is building a new object of that type — and
returns a genuinely new instance, every time, never a shared one.

`.toLocaleDateString()` is a method on every `Date` instance: it formats
the date as a human-readable string, using the *visitor's own browser
locale settings* — a browser configured for the United States shows
`1/5/2025`; one configured for the United Kingdom shows `05/01/2025` — the
same information, in whichever convention that specific visitor already
expects, decided by their own browser, not hardcoded by this project.

**Walkthrough — `formatRelativeDate`, a cascade of early returns.** Each
`if` checks a progressively larger unit and returns immediately the moment
one fits: under a minute, `'just now'`; under an hour, minutes; under a
day, hours; otherwise, days. `Math.floor((Date.now() - timestamp) / 60000)`
computes elapsed minutes: `Date.now() - timestamp` is the age of the video
in milliseconds, and dividing by `60000` — the number of milliseconds in
one minute — converts it to minutes, rounded down.

**Aha moment — the same field, used for a second, unrelated purpose.**
`video.created` was added in lesson 12 for exactly one job: deciding sort
order. Nothing about it needed to change for `formatDate` to use it for a
second, completely different job: display. This is a real, if modest,
example of good data modelling paying off later — because `created` was
stored as a plain, honest timestamp rather than something sorting-specific,
it turned out to already be exactly the data a features six lessons later
needed too.

---

## Connect the Pieces

```
index.html    .app-header, #settings-panel — a new header row and panel
script.js     preferences, loadPreferences(), savePreferences() — a second,
              independent persistence layer alongside videos'
              applyTheme() — the one function keeping the page's actual
              colours and the settings panel's button states in sync
              formatDate(), formatRelativeDate() — turn video.created,
              already used for sorting since lesson 12, into readable text
```

---

## What Breaks Without This

**Skipping the `applyTheme();` call at startup:** Choose the light theme,
then reload the page. `preferences.theme` correctly loads as `'light'` from
`localStorage`, but the page still renders dark, because nothing ever told
`document.body` to actually add the `theme-light` class — the *data* is
right; the *page* never catches up to it.

**Using `.toggle('theme-light')` with no second argument on the theme
buttons:** Click "☀️ Light" once — the page turns light, correctly. Click
it again. Because `.toggle()` with one argument always flips, the page
turns back dark — clicking "Light" a second time undoes it, instead of
correctly doing nothing, since the theme was already light.

**Hardcoding a colour directly in a new rule instead of using a `var(--...)`:**
Add a hypothetical new element styled with `background-color: #1e293b;`
written directly, bypassing `--colour-panel-bg`. Switching to the light
theme changes every other panel correctly, except this one — a real,
visible inconsistency, and the exact failure lesson 01's "no hardcoded
colour anywhere" rule was written to prevent, now with a theme switch to
actually reveal it.

---

## Definition of Done

- [ ] "⚙️ Settings" opens and closes a panel with a theme choice and a date-format choice
- [ ] Switching themes changes every colour on the page instantly, with zero hardcoded colours left unaffected
- [ ] The chosen theme and date format both survive a full page reload
- [ ] Clicking the already-active theme button again changes nothing
- [ ] Every video shows a readable "Added ..." date, correctly reflecting the current date-format preference
- [ ] You can explain the difference between `.toggle(className)` and `.toggle(className, force)`, and why each is used where it is in this lesson
- [ ] You can explain why light and dark themes only required one new CSS class, given how lesson 01's colours were originally written
- [ ] You can explain what `new` does when placed before `Date(...)`, connecting it back to lesson 03's `new URL(...)`
- [ ] You can explain why `preferences` is stored under its own `localStorage` key instead of being added to the saved `videos` array

---

*Next: Lesson 17 — Keyboard Shortcuts. Pressing `/` focuses the search box
and `n` starts a new note for whichever video is selected, from anywhere on
the page — global keyboard listeners, and the one real trap they all
share: never hijacking a key while someone is actually typing.*
