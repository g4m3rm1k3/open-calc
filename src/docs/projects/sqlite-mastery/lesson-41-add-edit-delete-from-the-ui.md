# Lesson 41: Add/Edit/Delete From the UI

**What you will build:** a real, working "add a part" form and real,
per-row edit/delete buttons — every real write this arc's own backend
has offered since Lesson 33, now reachable directly from the real
`pywebview` window, with the table updating live after each one.

**What you need to know first:** [Lesson 40](lesson-40-datatables-server-side-processing.md)
— the real, server-driven table this lesson adds real controls around.
[Lesson 33](lesson-33-post-put-delete-endpoints.md) — the real
`POST`/`PUT`/`DELETE` endpoints this lesson's own UI finally calls.

**Terms introduced in this lesson:**
- **Event delegation** — a real, deliberate jQuery pattern: attaching a
  real event handler to a stable, real, unchanging parent element,
  rather than directly to child elements that may not exist yet (or may
  be destroyed and recreated later) — this lesson's own real fix for a
  genuine bug DataTables' own redraw behavior causes otherwise.

**Objects and methods used:**

**`DataTable().ajax.reload()`**
- *What it is:* a real method on an already-initialized DataTables
  instance.
- *Implementation:* `$("#parts-table").DataTable().ajax.reload()` —
  re-runs the real `ajax` request this table was configured with
  (Lesson 40's own `/parts/datatable` endpoint), replacing its own real,
  currently-displayed rows with fresh ones, without a full page reload.
- *Its use:* refreshing the real table immediately after a real
  create, update, or delete.

---

## Concept Unit: A Real "Add Part" Form

### The Problem

Every real capability this table has shown so far (Lessons 39–40) has
been read-only. A real hardware-store employee needs to add a real new
part without ever leaving this real window or touching `curl`.

### Introduce the Concept in Isolation

A real, small form, added above `index.html`'s own existing table:

```html
<form id="add-part-form">
    <input type="text" name="name" placeholder="Name" required>
    <input type="number" name="price" step="0.01" placeholder="Price" required>
    <input type="number" name="quantity" placeholder="Quantity" required>
    <button type="submit">Add Part</button>
</form>
```

```js
$("#add-part-form").on("submit", function (event) {
    event.preventDefault();
    $.ajax({
        url: "http://127.0.0.1:8000/parts",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            name: $("input[name=name]").val(),
            price: parseFloat($("input[name=price]").val()),
            quantity: parseInt($("input[name=quantity]").val()),
        }),
        success: function () {
            $("#parts-table").DataTable().ajax.reload();
            $("#add-part-form")[0].reset();
        },
    });
});
```

Filling in the real form and submitting it makes a real `POST /parts`
request (Lesson 33), and the real table — still showing Lesson 40's own
server-side-driven view — immediately reflects the new real row, with
no manual page refresh. `event.preventDefault()` stops the real
browser's own default form-submission behavior (a full page
navigation, which would discard this entire real single-page
application); `$("#parts-table").DataTable().ajax.reload()` re-fetches
Lesson 40's own real endpoint instead, correctly re-including the new
row wherever real sort/filter/pagination state currently places it.

### Discard

Nothing throwaway — this real form is a real, permanent part of
`index.html`.

### Mechanical Walkthrough

- `<form id="add-part-form"> <input ... required> ...` — **(a) first
  appearance** of a real HTML `<form>` with real, native `required`
  attributes — genuine, browser-enforced validation happening before
  this lesson's own JavaScript ever runs, distinct from Lesson 30's own
  server-side Pydantic validation, which still runs afterward
  regardless.
- `$("#add-part-form").on("submit", function (event) {...})` — **(b)
  hard concept reappearing**, Lesson 38's own `.on()`, applied to a
  new, real event name (`"submit"`) instead of `"click"`.
- `event.preventDefault()` — **(a) first appearance**: a real, standard
  DOM method stopping an event's own default browser behavior.
- `data: JSON.stringify({...})` — **(b) hard concept reappearing**,
  Lesson 38's own `JSON.stringify`, used here to serialize the real
  form's own values into a real request body.
- `$("#parts-table").DataTable().ajax.reload();` — **(a) first
  appearance**, full treatment above.
- `$("#add-part-form")[0].reset();` — **(a) first appearance** of a
  real, plain-DOM `.reset()` method, accessed via `[0]` (a real,
  standard way to reach the underlying plain DOM element out of a
  jQuery-wrapped one) — clears the real form's own fields after a
  successful submission.

### CS Lens

`ajax.reload()`, called immediately after a successful real write, is a
real, direct instance of keeping a UI's own displayed state
synchronized with its real, underlying source of truth — re-deriving
the view from the real backend rather than attempting to hand-patch the
already-rendered table with the one new row, a real, simpler, more
honest approach at this project's own current real scale.

### SE Lens

The real, deliberate choice to re-fetch the *entire current page* after
one real write, rather than optimistically inserting just the new row
into the real, already-rendered table client-side: the real cost is one
small, extra network request per write; the real benefit is
correctness by construction — the redrawn table always genuinely
reflects Lesson 40's own real, current sort/filter/page state, with no
real risk of client-side and server-side state silently drifting apart.

## Concept Unit: Edit and Delete — Real Buttons, Rendered Per Row

### The Problem

Adding a part is real progress; the real, existing rows still have no
way to be changed or removed from this UI at all.

### Introduce the Concept in Isolation

A real, fourth, computed column, rendering real buttons per row:

```js
columns: [
    { data: "name" },
    { data: "price" },
    { data: "quantity" },
    {
        data: null,
        render: function (data, type, row) {
            return `<button class="edit-btn" data-id="${row.id}">Edit</button> ` +
                   `<button class="delete-btn" data-id="${row.id}">Delete</button>`;
        },
    },
],
```

A real, first, broken attempt to wire the delete button:

```js
$(".delete-btn").on("click", function () {
    const id = $(this).data("id");
    $.ajax({ url: `http://127.0.0.1:8000/parts/${id}`, method: "DELETE" });
});
```

This real code works — for exactly the rows visible on the page at the
moment it runs. After even one real `ajax.reload()` (this lesson's own
first unit already calls it after every add), DataTables redraws
`<tbody>` with entirely new, real `<button>` elements — and this
handler, bound once, to the specific real buttons that existed at page
load, is attached to none of them anymore. The real, correct fix —
**event delegation**:

```js
$("#parts-table").on("click", ".delete-btn", function () {
    const id = $(this).data("id");
    if (!confirm(`Delete part ${id}?`)) return;
    $.ajax({
        url: `http://127.0.0.1:8000/parts/${id}`,
        method: "DELETE",
        success: function () {
            $("#parts-table").DataTable().ajax.reload();
        },
    });
});
```

The handler is now attached to `#parts-table` itself — a real, stable
element DataTables never destroys or recreates — with `".delete-btn"`
as a real, second argument telling jQuery to only actually run the
handler when the real click's own target matches that selector,
checked fresh, at the moment of every real click, regardless of
whether that specific button existed when `.on()` was first called.

### Discard

The first, broken `$(".delete-btn").on(...)` version is real,
disposable proof of the real bug; the delegated version is this
lesson's own real, permanent fix, and the identical real pattern
applies to a real `.edit-btn` handler (left as this lesson's own
exercise).

### Mechanical Walkthrough

- `{ data: null, render: function (data, type, row) { return "..."; }
  }` — **(a) first appearance** of a real DataTables **computed
  column**: `data: null` means this column has no real, direct field to
  read; `render` — a real, required function instead, receiving the
  full real `row` object and returning real HTML to display.
- `` `<button class="edit-btn" data-id="${row.id}">Edit</button>` `` —
  **(b) hard concept reappearing** for JavaScript template-literal
  interpolation (ordinary, already-known syntax); `data-id="${row.id}"`
  — **(a) first appearance** of a real, standard HTML `data-*`
  attribute, used here to embed each real row's own `id` directly into
  its own button.
- `$("#parts-table").on("click", ".delete-btn", function () {...})` —
  **(a) first appearance** of jQuery's own real, three-argument
  delegated form of `.on()`, full treatment above.
- `$(this).data("id")` — **(a) first appearance** of jQuery's own real
  `.data()` method, reading a clicked element's own `data-id` attribute
  back out as a real value.
- `if (!confirm(...)) return;` — **(a) first appearance** of the real,
  built-in browser `confirm()` function, blocking further real
  JavaScript execution until the user answers a real, native dialog.

### CS Lens

Event delegation is a real, direct application of **exploiting event
bubbling** (a real, standard DOM behavior: a click on a child element
also fires, in order, on every real ancestor element containing it) —
listening at a stable real ancestor and checking the real, bubbled
event's own original target, rather than attaching a separate real
listener to every individual, possibly-temporary child.

Also recognized in: a real UI framework's own synthetic event system
(React's own event delegation, attached once at a root element for
performance and correctness reasons directly analogous to this one), a
real building's central alarm system reacting to any door sensor
triggering it, rather than requiring a separate, dedicated monitoring
station wired to each individual door.

### SE Lens

The real, honest cost of *not* using delegation here, made concrete: a
real, silent failure — no error, no console warning, buttons that
simply stop working the instant the table redraws for the first time,
easy to miss during quick, manual testing (which often only clicks a
button once, on the very first render) and genuinely confusing to debug
later, since the handler code itself looks entirely correct in
isolation. This is the real, concrete reason delegation is this
project's own default pattern for every button DataTables itself
renders, not an optional refinement reached for only after the bug is
already found the hard way.

## Connect the pieces

Three real, working mutations, wired into one real table: a real form,
submitting via `$.ajax` to `POST /parts` and calling `ajax.reload()` on
success; a real, computed fourth column, rendering real edit/delete
buttons per row using each row's own real `id`; and real, delegated
click handlers on `#parts-table` itself, proven necessary — not
optional — the moment `ajax.reload()`'s own real redraw behavior is
accounted for honestly.

## What breaks without this

Reproduce the real, broken direct-binding version deliberately, then
add one real row through this lesson's own form:

```js
$(".delete-btn").on("click", function () {
    $.ajax({ url: `http://127.0.0.1:8000/parts/${$(this).data("id")}`, method: "DELETE" });
});
```

Clicking any delete button that existed *before* the new row was added
still genuinely works. Clicking delete on the *newly added* row's own
button does nothing at all — no request in the real browser's own
Network tab, no error anywhere. This is direct, provable proof of this
lesson's own central point: the handler was bound to a real, specific
set of DOM elements that no longer includes the ones DataTables just
rendered fresh — silently, with nothing anywhere signaling the mistake
except the real, missing behavior itself.

## Exercises

1. Add a real edit flow: clicking `.edit-btn` should populate this
   lesson's own add-part form with the clicked row's own real, current
   values, and submitting should send a real `PUT` (Lesson 33) to that
   row's own `id` instead of a `POST` — using the identical delegated-
   event pattern this lesson's own delete handler already proved
   necessary.
2. Reproduce this lesson's own real "buttons silently stop working"
   bug on purpose, using the non-delegated version above, and confirm —
   by checking the real browser's own Network tab directly — that no
   request is even attempted when the broken handler's own selector
   fails to match.

## Definition of Done

- [ ] You added a real part through the UI form and confirmed it
      appears in the real, live-reloaded table.
- [ ] You added real, delegated edit/delete buttons per row.
- [ ] You reproduced the real, silent "non-delegated buttons stop
      working after a reload" bug and understand exactly why event
      delegation fixes it.
- [ ] You completed both exercises.

## Next

[Lesson 42 — Running the Backend and `pywebview` Together](lesson-42-running-the-backend-and-pywebview-together.md)
closes a real, honest gap every lesson in this arc has quietly assumed
away: someone has to actually start Arc 4's own backend before any of
this works at all.
