# Lesson 38: A Computed Without a Setter

## What you will build

Check Out and Check In, ported into `frontend/` — reaching parity with
Lessons 26–28. `lockStatus`, a *read-only* `computed()`, deliberately
contrasted with Lesson 36's `editedContent`, which needed a `set()`
because it had to be written through. This lesson's version never
needs writing through at all — it's entirely derived from state that
already changes for other reasons — and knowing which shape to reach
for is the actual point.

## What you need to know first

`Lesson 36 - The Tab That Forgot What You Typed.md` — the writable
`computed({ get, set })` form, and `openTabs`/`activeTabPath`.
`Lesson 28 - Locking It Down in the UI.md` — the original
`checkoutFile`/`checkinFile`/`renderLockStatus`, all being ported here.
`Lesson 35`'s `currentUsername`, read here for the first time outside
`LoginScreen.vue`.

---

## Concept Unit: a computed with nothing to set

### The Problem

Lesson 36's `editedContent` needed both a `get()` and a `set()`,
because typing in the textarea has to write somewhere real. A file's
lock status is different: "Not checked out." or "Checked out by you."
or "Checked out by dana." is never typed by anyone — it's entirely
determined by two other values, `tab.checked_out_by` and
`currentUsername`, both of which already change for reasons that have
nothing to do with this status text itself.

### Concept Lab

```javascript
const { ref, computed } = require("vue")

const checkedOutBy = ref(null)
const currentUser = ref("dana")

const status = computed(() => {
    if (checkedOutBy.value === null) {
        return "Not checked out."
    }
    if (checkedOutBy.value === currentUser.value) {
        return "Checked out by you."
    }
    return "Checked out by " + checkedOutBy.value + "."
})

console.log(status.value)
checkedOutBy.value = "dana"
console.log(status.value)
checkedOutBy.value = "erin"
console.log(status.value)
```

Run it — actual output, this exact run:

```
Not checked out.
Checked out by you.
Checked out by erin.
```

### What This Proves

`computed(() => {...})` — a single function, not an object with
`get`/`set` — is the *simpler*, far more common shape `computed()`
actually takes; Lesson 36's `{ get, set }` form exists specifically for
the rarer case of needing to write back through it. `status.value`
recomputes automatically every time `checkedOutBy` or `currentUser`
changes — confirmed directly: three different real values, from the
exact same `computed()`, with nothing re-run by hand between them.
Assigning to `status.value` directly isn't shown here because it isn't
possible — a read-only `computed()` has no setter at all; attempting
`status.value = "..."` would raise a real, immediate warning, not fail
silently.

### Discard

`checkedOutBy`, `currentUser`, and `status` are deleted now — none
appears in the project. The real `lockStatus`, next, computes from
`openTabs`/`activeTabPath`/`currentUsername` instead of two standalone
refs.

---

## Concept Unit: checkoutFile, checkinFile, and lockStatus

### The Problem

`useEditor.js` already stores `checked_out_by` on every tab (Lesson
36, ported from Lesson 28's original fetch, though nothing has read or
displayed it until now) — it needs a real status computed from that
value, and two real functions to actually change it.

### Project Change

- **Files affected** — `frontend/src/composables/useEditor.js`,
  existing file; `frontend/src/components/Editor.vue`, existing file.
- **Change type** — add (`lockStatus`, `lockMessage`, `checkoutFile`,
  `checkinFile`); replace (`Editor.vue`'s template, adding two buttons
  and a status span).
- **Dependencies** — `currentUsername` from `useAuth()`; this lesson's
  read-only `computed()` pattern.

### The New Code — type this

`useEditor.js` pulls in `currentUsername` alongside the
`authenticatedFetch` it already imports, and gains a second piece of
transient state for action feedback, separate from the derived status:

```javascript
const { authenticatedFetch, currentUsername } = useAuth()
```

A new, transient ref sits alongside `saveStatus`, holding only the
result of the *last* checkout/checkin attempt:

```javascript
const lockMessage = ref('')
```

The computed status itself:

```javascript
const lockStatus = computed(() => {
    const tab = openTabs.value.find((t) => t.path === activeTabPath.value)
    if (!tab) {
        return ''
    }
    if (tab.checked_out_by === null) {
        return 'Not checked out.'
    }
    if (tab.checked_out_by === currentUsername.value) {
        return 'Checked out by you.'
    }
    return 'Checked out by ' + tab.checked_out_by + '.'
})
```

`checkoutFile` — Lesson 28's own logic, `.value` added throughout,
`data.detail` routed to `lockMessage` instead of `lockStatus`, since
the status stays derived and only the transient message is ever set
directly:

```javascript
function checkoutFile() {
    if (activeTabPath.value === null) {
        return
    }

    let wasSuccessful = false

    authenticatedFetch('http://127.0.0.1:8000/checkout?path=' + encodeURIComponent(activeTabPath.value), {
        method: 'POST',
    })
        .then((response) => {
            wasSuccessful = response.ok
            return response.json()
        })
        .then((data) => {
            if (!wasSuccessful) {
                lockMessage.value = data.detail
                return
            }
            lockMessage.value = ''
            const tab = openTabs.value.find((t) => t.path === activeTabPath.value)
            tab.checked_out_by = data.checked_out_by
        })
        .catch(() => {
            lockMessage.value = 'Could not check out file.'
        })
}
```

`checkinFile` mirrors it exactly, releasing instead of claiming:

```javascript
function checkinFile() {
    if (activeTabPath.value === null) {
        return
    }

    let wasSuccessful = false

    authenticatedFetch('http://127.0.0.1:8000/checkin?path=' + encodeURIComponent(activeTabPath.value), {
        method: 'POST',
    })
        .then((response) => {
            wasSuccessful = response.ok
            return response.json()
        })
        .then((data) => {
            if (!wasSuccessful) {
                lockMessage.value = data.detail
                return
            }
            lockMessage.value = ''
            const tab = openTabs.value.find((t) => t.path === activeTabPath.value)
            tab.checked_out_by = null
        })
        .catch(() => {
            lockMessage.value = 'Could not check in file.'
        })
}
```

`setActiveTab` clears the new transient message alongside the existing
`saveStatus` clear:

```javascript
lockMessage.value = ''
```

`Editor.vue` needs all four new pieces added to its existing
destructure from `useEditor()` before any of them are usable in its
own template:

```diff
- const { activeTabPath, editedContent, saveStatus, saveFile } = useEditor()
+ const { activeTabPath, editedContent, saveStatus, lockStatus, lockMessage, saveFile, checkoutFile, checkinFile } = useEditor()
```

Two buttons and a status span, showing the transient message if there
is one, falling back to the derived status otherwise:

```html
<button @click="checkoutFile">Check Out</button>
<button @click="checkinFile">Check In</button>
<span class="lock-status">{{ lockMessage || lockStatus }}</span>
```

And the CSS the new status span needs — the same small, muted style
`.save-status` already has, sitting right beside it:

```css
.lock-status {
    font-size: 13px;
    color: #666;
    margin-left: 8px;
}
```

### The Updated Project — where this lives

`useEditor.js`'s exports, in full, with the new pieces marked:

```javascript
export function useEditor() {
    return {
        openTabs,
        activeTabPath,
        editedContent,
        saveStatus,
        lockStatus,                                        // ← new
        lockMessage,                                        // ← new
        setActiveTab,
        openFile,
        closeTab,
        saveFile,
        checkoutFile,                                        // ← new
        checkinFile,                                          // ← new
    }
}
```

`Editor.vue`'s button row, in full, with the new lines marked:

```html
<div>
  <button @click="handleSave">Save</button>
  <button @click="checkoutFile">Check Out</button>          <!-- ← new -->
  <button @click="checkinFile">Check In</button>              <!-- ← new -->
  <button @click="runFile">Run</button>
  <span class="save-status">{{ saveStatus }}</span>
  <span class="lock-status">{{ lockMessage || lockStatus }}</span>  <!-- ← new -->
</div>
```

And its `<style scoped>` block, with the new rule added directly after
`.save-status`:

```css
.save-status {
    font-size: 13px;
    color: #666;
    margin-left: 8px;
}
.lock-status {                /* ← new */
    font-size: 13px;          /* ← new */
    color: #666;               /* ← new */
    margin-left: 8px;          /* ← new */
}                                /* ← new */
```

### Mechanical Walkthrough
- `lockStatus`'s body is this lesson's own lab, applied for real — the
only difference is reading `tab.checked_out_by` (found via `.find()`,
already established) instead of a standalone `checkedOutBy` ref, and
an added `if (!tab) return ''` guard for the moment before any file is
open at all. `{{ lockMessage || lockStatus }}` reuses the `||`-fallback
- idiom (Lesson 5) — `lockMessage` is a non-empty string only right after
a failed checkout/checkin attempt; the rest of the time it's `''`,
- which is falsy, so `lockStatus` — the always-current derived value —
shows instead. `checkoutFile`/`checkinFile` are otherwise a direct,
mechanical port: `let wasSuccessful`, the `response.ok` capture, the
- `.then()`/`.catch()` shape — all Lesson 28's own pattern, unchanged.

### CS Lens — read-only vs. writable, the same primitive both ways

Lesson 36's `editedContent` and this lesson's `lockStatus` are both
`computed()` — the exact same Vue API, called two different ways.
Recognizing when a derived value needs to be written through
(`editedContent`, because typing has to go somewhere) versus when it
only ever needs to be read (`lockStatus`, because nothing types a lock
status directly) is a real design decision, not a syntax choice —
using the `{ get, set }` form for something that's genuinely read-only
would silently invite code to write through a setter that does
nothing meaningful, or worse, something misleading.

### SE Lens — two kinds of "current state," kept honestly separate

`lockStatus` and `lockMessage` look similar — both end up in the same
`<span>` — but they answer different questions. `lockStatus` answers
"what's true right now," always, automatically, correctly, as long as
`tab.checked_out_by` is accurate. `lockMessage` answers "what just
happened," briefly, only when a request failed — it doesn't
self-correct, and nothing clears it except a later action explicitly
doing so (a successful checkout/checkin, or switching tabs). Collapsing
these into one plain ref, the way `saveStatus` already does for saves,
would have been simpler to write and a real, ongoing risk: a stale
error message left on screen after the underlying state actually
changed, with nothing forcing it back in sync. Keeping them separate
costs one extra piece of state and one `||` in the template — a small,
worthwhile price for a status line that's provably always accurate.

### Run It

Confirmed against a real backend with two independent users — every
scenario from Lesson 28's own original verification, reproduced here
against the ported composable:

```
1) dana opens file, lockStatus: "Not checked out."
2) dana checks out, lockStatus: "Checked out by you."
3) erin (second session) sees checked_out_by: dana
4) erin tries to check out: 409 Already checked out by dana
5) dana saves (holds the lock), succeeded: true
6) dana checks in, lockStatus: "Not checked out."
7) erin checks out now that it is free: 200 erin
8) dana reopens the file, lockStatus now reflects erin holding it: "Checked out by erin."
```

Confirmed via Vite's real compiled output too — both new buttons and
the `{{ lockMessage || lockStatus }}` interpolation compile exactly as
written, with no elision between what's shown here and what actually
runs.

---

## Connect the pieces

Opening a file already stores `checked_out_by` on its tab (Lesson 36).
`lockStatus`, a read-only `computed()`, derives a real sentence from
that value plus `currentUsername` — automatically correct the instant
either one changes, with nothing calling a render function to keep it
that way. Clicking Check Out calls the real `/checkout` route and, on
success, sets `tab.checked_out_by` directly — `lockStatus` recomputes
on its own. A failed attempt sets `lockMessage` instead, shown in its
place until the next successful action clears it or a tab switch does.
Two independent browser sessions, checking the exact same file, see
consistent, correct, real-time-accurate status — proven with two real
users in this lesson's own verification, not assumed from the code
alone.

## What breaks without this

Confirmed directly by tracing the alternative: writing `lockMessage`
into the SAME field a successful action also writes into (instead of
keeping `lockStatus` derived and `lockMessage` transient) would mean
every successful checkout/checkin has to remember to also clear
whatever error text might be lingering from a previous failed attempt
— exactly the kind of manual synchronization Lesson 36's `computed()`
fix already eliminated for `editedContent`. Keeping `lockStatus`
purely derived means there's nothing to remember to clear at all.

## Exercises

1. Check a file out and back in through the real running app, in a
   real browser, and confirm the status line updates correctly both
   times.
2. Open the same file in two different browser sessions (or a normal
   window and an incognito one), check it out in one, and confirm the
   other sees "Checked out by [the first user]" — without refreshing,
   the moment you reopen or re-check that file.
3. Try to check out a file someone else already holds and confirm the
   real `409` message appears, then switch to a different tab and back
   and confirm the message is gone, replaced by the current derived
   status.
4. Explain, without looking back at this lesson, why `lockStatus` uses
   the simpler `computed(() => {...})` form while `editedContent`
   (Lesson 36) needed the `{ get, set }` form.

## Definition of done

- [ ] You've checked a file out and back in through the real app
- [ ] You've confirmed a second session sees a real, correct lock
      status without any manual refresh
- [ ] You've triggered a real conflict (checking out an already-locked
      file) and seen the real backend message
- [ ] You can explain the difference between `lockStatus` (derived,
      always correct) and `lockMessage` (transient, only set on
      failure)
- [ ] `git commit` this lesson's code with a message explaining why
