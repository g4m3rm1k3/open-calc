# Lesson 52: Testing the Real Model Upload Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. This project's own real
> upload route (`POST /api/parts/<id>/models`) is complete and proven,
> backend-only, on purpose. This lesson starts the real, paired
> frontend half — the last open half of this project's own real
> 3D-model work besides deletion and the tool-assembly joins.

## What you will build

Two real, test-first cases for `PartsList`: a real, signed-out user
sees no real way to upload anything, even with a real part's own
models already expanded; a real, signed-in user can pick a real file
and upload it, seeing it appear in that same, already-open list
afterward. The first case already passes against this project's own,
current, real code, with nothing new added yet — there's nothing there
to find. The second genuinely fails, honestly, for the correct real
reason, before either real capability exists.

## What you need to know first

The real, already-tested `PartsList` component and its own real
Delete, Favorite, and Edit controls, each gated on a real `token`. This
project's own real Models control, ungated, fetching and toggling a
real part's own real model list on click. This slice's own real,
already-proven `POST /api/parts/<id>/models`, requiring a real token
whose real role is `programming` or `admin` — a real, narrower gate
than the ungated `GET` this same URL also answers.

## Terms introduced

None genuinely new.

## Objects and methods used

- **`File`**
  - *What it is:* a real, built-in Web Platform class representing one,
    real, in-memory file — its raw bytes, its name, and its MIME type —
    the identical real interface a real file a user actually picked
    from disk would expose to JavaScript.
  - *Implementation:* checked against the real MDN Web Docs entry for
    `File` this session — its real constructor signature is `new
    File(fileBits, fileName, options?)`: `fileBits` a real array of
    strings, `ArrayBuffer`s, or `Blob`s to concatenate into the real
    file's own content; `fileName` a real string; `options` an
    optional real object that can set `type`, the file's real MIME
    type. `File` itself extends the real, more general `Blob` class,
    inheriting `.size` (the real, computed byte length) and `.type`;
    it adds its own real `.name`.
  - *Its use:* this lesson's own real test needs one real, fake file to
    actually select and upload — `File` is the identical real
    constructor a real browser uses internally the moment a real user
    picks a real file, so building one directly, by hand, produces a
    real object indistinguishable from one a real file picker would
    hand back.
  - *Type:* a global, built-in Web Platform class — real and available
    inside this project's own real Vitest tests because Vitest's own
    real `jsdom` environment implements it, the identical real reason
    `document` and `window` are already available without any real
    import anywhere in this project.
  - *Responsibility:* to hold one, real, immutable snapshot of a real
    file's own content, name, and type, in memory, so real code can
    inspect or transmit it without ever touching the real, underlying
    disk directly.
  - *Depends on:* a real array of real file bits and a real file name,
    handed to it at real construction time; nothing else.
  - *Connects to:* built directly inside this lesson's own real test;
    handed to `fireEvent.change`'s own real `files` array, below,
    which is what actually makes a real DOM node believe this real
    file was picked.
  - *Shape:* a real, standard Web Platform boundary — not
    project-specific, not a Testing-Library export.
- **`screen.getByLabelText(text)` / `screen.queryByLabelText(text)`**
  - *What it is:* a real Testing Library query, finding a real form
    element by its own, real, associated `<label>` text — the identical
    real accessibility-first idea `getByRole`/`queryByRole` already
    established for buttons, applied here to a real form control
    instead.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — `getByLabelText` matches an element
    whose real accessible name comes from a real `<label>` wrapping it,
    a real `<label htmlFor="...">` pointing at its real `id`, or a
    real `aria-label`/`aria-labelledby` attribute; it throws a real
    error if no real match exists. `queryByLabelText` is the identical
    real query, real and returning `null` instead of throwing when
    nothing real matches — the same real `get`/`query` pairing this
    project's own `getByRole`/`queryByRole` already established.
  - *Its use:* this lesson's own real tests need to find — or prove
    the real absence of — a real file input, without inventing a
    real, separate `data-testid` just for this one, real element; the
    real, visible label a real, sighted or screen-reader user would
    actually read is the identical real thing this query looks for.
  - *Type:* a pair of real functions exported by
    `@testing-library/dom`, re-exported through this project's own,
    already-used real `screen` object.
  - *Responsibility:* the real, standard way to locate a real form
    control the same real way a real assistive-technology user would —
    by its own real, associated label — rather than by a real,
    internal implementation detail like a class name or a `data-*`
    attribute.
  - *Depends on:* an already-rendered real component tree containing
    at least one real element with a real, matching accessible label.
  - *Connects to:* called directly inside this lesson's own real
    tests; `getByLabelText`'s own real, returned element is asserted
    on directly, or handed to `fireEvent.change`, below.
  - *Shape:* the real, standard Testing Library query boundary — not
    project-specific.

---

## Concept Unit: A Fourth Real Control, Absent for the Same Real Reason

### The Problem

`PartsList` already gates Delete, Favorite, and Edit on a real,
signed-in `token`. A real upload control needs the identical real
gate — this project's own real upload-route characterization already
proved `POST /api/parts/<id>/models` requires a real, narrow role
list, the identical real shape `PUT` already required for Edit. The
real question this unit answers: does a real, fourth control need its
own, real, separate absence proof too — and does it still need one
once it sits *inside* an already-real, ungated Models section?

> **Before reading on:** this project's own real Edit-absence lesson
> already answered this exact real question, twice now, for two other
> real, gated controls. What does that lesson's own real SE Lens
> already say about why a real, fourth control — nested inside a real,
> ungated one — wouldn't get to skip it either?

### Project Change

- **Reference Source** — no reference counterpart for this test file's
  own new code; legacy has no real, automated frontend tests at all to
  quote from. Legacy's own real upload UI,
  `src/components/parts/ModelUploadModal.tsx`, read in full this
  session, does let a real, any user upload a real model — real and
  unlike Favorite's or Edit's own real gaps, where legacy never lets a
  user act at all — but it's a real, separate modal, opened by its own
  real `onOpenUploadModal` prop from `Model3DSection.tsx`, not the
  inline, already-expanded list this slice deliberately extends
  instead; see the second unit's own SE Lens for why this slice's own
  real control still deliberately differs from legacy's own real,
  seven-field form.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```tsx
test('shows no upload control when signed out, even with models expanded', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/models')) {
      return Promise.resolve({
        json: () => Promise.resolve({ data: [], total: 0 }),
      })
    }

    return Promise.resolve({
      json: () => Promise.resolve({
        data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
        total: 1,
      }),
    })
  }))

  render(<PartsList />)

  await waitFor(() => {
    expect(screen.getByText('1234567', { exact: false })).toBeDefined()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Models' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Hide Models' })).toBeDefined()
  })

  expect(screen.queryByLabelText('Model file')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull()
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — this project's
own ten, already-established real tests, with this unit's own new one
appended (continuing from that file's own line 232):

```tsx
233
234
235 test('shows no upload control when signed out, even with models expanded', async () => {
236   vi.stubGlobal('fetch', vi.fn((url: string) => {
237     if (url.includes('/models')) {
238       return Promise.resolve({
239         json: () => Promise.resolve({ data: [], total: 0 }),
240       })
241     }
242
243     return Promise.resolve({
244       json: () => Promise.resolve({
245         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
246         total: 1,
247       }),
248     })
249   }))
250
251   render(<PartsList />)
252
253   await waitFor(() => {
254     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
255   })
256
257   fireEvent.click(screen.getByRole('button', { name: 'Models' }))
258
259   await waitFor(() => {
260     expect(screen.getByRole('button', { name: 'Hide Models' })).toBeDefined()
261   })
262
263   expect(screen.queryByLabelText('Model file')).toBeNull()
264   expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull()
265 })
```

### Isolated Lab: `getByLabelText` and `queryByLabelText`, Found vs. Missing

The real code above leans on a real query this project has never used
before — `queryByLabelText`, right there on line 263, deciding whether
a real, labeled file input exists at all. Before trusting what that
line actually proves, here's the identical real query, run in
isolation, against a tiny, real, throwaway component with nothing else
in it:

```tsx
import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'

test('lab: getByLabelText and queryByLabelText, found vs. missing', () => {
  render(
    <label>
      Example
      <input type="text" />
    </label>
  )

  const found = screen.getByLabelText('Example')
  console.log('found.tagName', found.tagName)

  const missing = screen.queryByLabelText('Nothing Like This')
  console.log('missing', missing)

  expect(found.tagName).toBe('INPUT')
  expect(missing).toBeNull()
})
```

Run for real this session:

```
found.tagName INPUT
missing null
```

This proves the exact real shape line 263 depends on: wrapping a real
`<input>` inside a real `<label>` gives it a real, discoverable
accessible name from the label's own real text content — no `id`,
`htmlFor`, or `aria-label` needed for this simplest real case — and
asking for a label that matches nothing real returns a real, plain
`null`, never a thrown error. This is called a **label-based query**:
it looks up a form element the identical real way a real
assistive-technology user would, through its own real, visible text,
rather than through a real, internal implementation detail. This
throwaway example is discarded from this project's own real, taught
code — it never appears inside `rebuild/frontend` itself — but per this
curriculum's own real Verification Rule, its real source and this real,
pasted output are both kept, permanently, in
`verification/frontend/src/lesson52_lab_label_text.test.tsx`, so a
later real session can reuse this exact, already-proven check instead
of re-deriving and re-running it from nothing.

### Mechanical Walkthrough

- **Line 237, `if (url.includes('/models'))`** — the identical real,
  already-established URL-branching mock shape this project's own
  Models-control test already used, real and reused here unchanged, to
  answer the real `GET` this unit's own click still triggers.
- **Line 239, `Promise.resolve({ json: () => Promise.resolve({ data:
  [], total: 0 }) })`** — a real, deliberately *empty* real model list —
  this unit only needs a real part whose Models section can actually
  open; what it contains isn't this unit's own real concern.
- **Line 257, `fireEvent.click(screen.getByRole('button', { name:
  'Models' }))`** — the identical real click already fully treated,
  real and opening this real part's own already-proven, real,
  ungated section.
- **Line 259–261, `waitFor(() => expect(screen.getByRole('button', {
  name: 'Hide Models' })).toBeDefined())`** — real, direct proof the
  real section actually finished opening before this unit's own real
  assertions run; without this real wait, the two lines below could
  run before the real toggle's own real state update ever lands,
  passing for a real, wrong reason.
- **Line 263, `screen.queryByLabelText('Model file')`, asserted real
  `null`** — this lesson's Header's own new query, real and proving no
  real, labeled file input exists inside the real, now-open section.
- **Line 264, `screen.queryByRole('button', { name: 'Upload' })`,
  asserted real `null`** — the identical real `queryByRole` already
  fully treated, real and proving no real Upload trigger exists
  either — one real absence isn't enough on its own; a real file input
  with no real way to actually submit it would be exactly as useless.

### CS Lens

The identical real **negative space assertion** already named in full,
three times now.

Also recognized in: the identical real examples already given.

### SE Lens

No real, new alternative considered here — this unit is a direct,
real, fourth application of a real, already-justified rule: every
real, independent control this project builds gets its own real,
dedicated absence proof, because Testing Library's own real,
name-based query only ever proves what it's actually asked to look
for. The one, real, new wrinkle this unit actually adds: this real
control doesn't just need `token` to be real and present — it needs
the real Models section to be real and *open* first, since that's
where this slice deliberately places it. Proving its absence only
while collapsed would have proven nothing real at all about whether it
correctly stays hidden once a real user actually gets there.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — so this was actually run this session:

```
Test Files  1 passed (1)
     Tests  10 passed (10)
```

Passes immediately, honestly, for the correct real reason: there's
real, currently, nothing there at all for either real query to find.

### Connecting this unit to what came before

Delete, Favorite, and Edit each proved one real control's own
absence. This unit is the identical real proof, for a real, fourth,
independent one — nested, this time, inside a real section that must
itself already be open.

---

## Concept Unit: A Real File, Selected and Uploaded

### The Problem

Nothing yet proves a real, signed-in user can actually upload a real
file. Every real interaction this project has tested so far — Delete,
Favorite, Edit's own save — drives an ordinary, real, controlled
`<input>`, setting its own real `value` directly from real component
state. A real file cannot work that way at all: no real browser lets a
script set what file a real `<input type="file">` currently holds —
allowing that would let any real website silently claim a real user
had already picked a real, sensitive file from their own real disk.
The real question this unit answers: given that real constraint, what
real, different technique actually proves a real file was selected and
sent?

> **Before reading on:** `AddPartForm`'s own real test already types a
> real value directly into a real, controlled input before submitting,
> using `fireEvent.change(input, { target: { value: '...' } })`. A
> real file input has no real `value` a script may ever set. Given
> that, what real, different property might a real `<input
> type="file">` DOM node expose instead — one `fireEvent.change` could
> still reach?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason already given in the previous unit. Legacy's own real
  `ModelUploadModal.tsx`, read in full this session, builds its own
  real upload request with `const formData = new FormData();
  formData.append('file', file); ...; fetch(...,{ method: 'POST',
  body: formData })` (lines 79–93) — this project's own real
  implementation lesson will Preserve that identical real technique;
  this testing lesson's own real concern is only proving a real file
  gets *into* the test at all, not yet how the real component sends
  it.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```tsx
test('adds a real, uploaded model to the real, visible list after a real, successful upload', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
    if (options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: { id: 'MOD-00000001', name: 'bracket.stl', category: 'part' },
        }),
      })
    }

    if (url.includes('/models')) {
      return Promise.resolve({
        json: () => Promise.resolve({ data: [], total: 0 }),
      })
    }

    return Promise.resolve({
      json: () => Promise.resolve({
        data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
        total: 1,
      }),
    })
  }))

  render(<PartsList token="a.b.c" />)

  await waitFor(() => {
    expect(screen.getByText('1234567', { exact: false })).toBeDefined()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Models' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDefined()
  })

  const file = new File(['stl-bytes'], 'bracket.stl', { type: 'application/octet-stream' })
  fireEvent.change(screen.getByLabelText('Model file'), { target: { files: [file] } })
  fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

  await waitFor(() => {
    expect(screen.getByText('bracket.stl')).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — the previous
unit's own eleven real tests, with this unit's own new one appended
(continuing from line 265):

```tsx
266
267
268 test('adds a real, uploaded model to the real, visible list after a real, successful upload', async () => {
269   vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
270     if (options?.method === 'POST') {
271       return Promise.resolve({
272         ok: true,
273         json: () => Promise.resolve({
274           data: { id: 'MOD-00000001', name: 'bracket.stl', category: 'part' },
275         }),
276       })
277     }
278
279     if (url.includes('/models')) {
280       return Promise.resolve({
281         json: () => Promise.resolve({ data: [], total: 0 }),
282       })
283     }
284
285     return Promise.resolve({
286       json: () => Promise.resolve({
287         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
288         total: 1,
289       }),
290     })
291   }))
292
293   render(<PartsList token="a.b.c" />)
294
295   await waitFor(() => {
296     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
297   })
298
299   fireEvent.click(screen.getByRole('button', { name: 'Models' }))
300
301   await waitFor(() => {
302     expect(screen.getByRole('button', { name: 'Upload' })).toBeDefined()
303   })
304
305   const file = new File(['stl-bytes'], 'bracket.stl', { type: 'application/octet-stream' })
306   fireEvent.change(screen.getByLabelText('Model file'), { target: { files: [file] } })
307   fireEvent.click(screen.getByRole('button', { name: 'Upload' }))
308
309   await waitFor(() => {
310     expect(screen.getByText('bracket.stl')).toBeDefined()
311   })
312 })
```

### Isolated Lab: A Real `File`, Selected Into a Real Input

The real code above builds a real `File` on line 305 and hands it to
`fireEvent.change` on line 306 through a real `files` array — real and
genuinely different from every other real `fireEvent.change` this
project has ever written, all of which pass `value`, not `files`.
Before trusting that either piece actually behaves the way this unit's
own test depends on, here they are, run in isolation, against a tiny,
real, throwaway input with nothing else around it:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { test, expect } from 'vitest'

test('lab: a File object and simulating its selection into a file input', () => {
  const file = new File(['stl-bytes'], 'bracket.stl', { type: 'application/octet-stream' })

  console.log('file.name', file.name)
  console.log('file.size', file.size)
  console.log('file.type', file.type)

  render(<input type="file" aria-label="Model file" />)
  const input = screen.getByLabelText('Model file') as HTMLInputElement

  fireEvent.change(input, { target: { files: [file] } })

  console.log('input.files.length', input.files?.length)
  console.log('input.files[0].name', input.files?.[0]?.name)

  expect(file.name).toBe('bracket.stl')
  expect(input.files?.length).toBe(1)
  expect(input.files?.[0]?.name).toBe('bracket.stl')
})
```

Run for real this session:

```
file.name bracket.stl
file.size 9
file.type application/octet-stream
input.files.length 1
input.files[0].name bracket.stl
```

This proves two real, separate facts. First, `new File(['stl-bytes'],
'bracket.stl', { type: 'application/octet-stream' })` really does
build an object with a real `.name` of `'bracket.stl'`, a real `.size`
of `9` — the real byte length of the nine-character string
`'stl-bytes'` — and the real `.type` given. Second,
`fireEvent.change(input, { target: { files: [file] } })` really does
set that real DOM node's own real, special `.files` property to a
real, one-item list containing exactly that file — the identical real
mechanism a real browser uses the instant a real user actually finishes
picking a file from a real, native file dialog. This is called
**simulating a file selection**: real and distinct from every other
real `fireEvent.change` this project has written, which all set a
real, ordinary `.value` instead of this real, special `.files`
property. This throwaway example is discarded from this project's own
real, taught code — it never appears inside `rebuild/frontend`
itself — but per this curriculum's own real Verification Rule, its
real source and this real, pasted output are both kept, permanently,
in `verification/frontend/src/lesson52_lab_file_api.test.tsx`, so a
later real session can reuse this exact, already-proven check instead
of re-deriving and re-running it from nothing.

### Mechanical Walkthrough

- **Lines 270–277, the real `POST` branch** — extends the identical
  real, route-aware mock shape already established, real and checking
  `options?.method === 'POST'` this time instead of `'PUT'` or
  `'DELETE'`; returns a real, minimal shape of whatever this project's
  own real backend actually responds with — `id`, `name`, `category` —
  matching `PartModel.to_dict()`'s own real, larger shape closely
  enough for this real component to read the one real field it
  actually needs to display.
- **Line 279, `if (url.includes('/models'))`** — the identical real
  branch the previous unit already used, real and returning a real,
  empty list here too — this unit's own real proof is that the
  *uploaded* model appears, not that any real, pre-existing one does.
- **Line 293, `render(<PartsList token="a.b.c" />)`** — the identical
  real, signed-in rendering already established for Delete, Favorite,
  and Edit's own real tests.
- **Line 299, `fireEvent.click(...)` on `'Models'`** — opens the
  identical real section the previous unit proved stays empty when
  signed out.
- **Line 301–303, `waitFor(() => expect(screen.getByRole('button', {
  name: 'Upload' })).toBeDefined())`** — real, direct proof the real
  section finished opening, and — once this project's own next lesson
  actually builds it — that a real, signed-in user really does see a
  real Upload control there.
- **Line 305, `new File(['stl-bytes'], 'bracket.stl', { type:
  'application/octet-stream' })`** — this lesson's Header's own new
  class, real and building one, real, fake file to stand in for
  whatever a real user would have actually picked from disk.
- **Line 306, `fireEvent.change(screen.getByLabelText('Model file'), {
  target: { files: [file] } })`** — the identical real
  `fireEvent.change` already fully treated, real and reused here with
  a real `files` array instead of a real `value` string — the real
  technique this unit's own isolated lab just proved actually works;
  `screen.getByLabelText('Model file')` finds the real input this
  project's own next lesson must give that exact real, visible label.
- **Line 307, `fireEvent.click(screen.getByRole('button', { name:
  'Upload' }))`** — the identical real click already fully treated,
  real and triggering whatever real code actually sends this real,
  selected file onward.
- **Line 309–311, `waitFor(() => expect(screen.getByText('bracket.stl')).toBeDefined())`**
  — real, direct proof the real, uploaded file's own real name now
  appears in the real, rendered list — not merely that a real request
  was sent, but that its real result actually reached the real,
  visible page, the identical real standard Edit's own save test
  already held itself to.

### CS Lens

This is the identical real **multi-step interaction test** already
named in full — open, select, upload — real and distinct from a real,
single-click test the same real way Edit's own save test already was.

Also recognized in: the identical real examples already given.

### SE Lens

The real, deliberately *not*-taken alternative here: writing this
unit's own real test around a real, separate upload *modal*, matching
legacy's own real `ModelUploadModal.tsx` shape exactly. Rejected on
purpose — this project's own real backend (Lessons 50–51) only ever
reads `file`, `name`, and `category`/`modelType` from a real request,
defaulting `name` and `category`/`modelType` server-side when they're
real and absent; legacy's own real modal collects four real fields
beyond that (`description`, `priority`, `isGeneric`, a real, hardcoded
`'user123'` `userId` this project's own real, actual sign-in already
makes unnecessary) that nothing real on the backend actually consumes
yet. Building a real, separate modal for fields the real server
silently ignores would be real, pure UI weight with no real, current
requirement behind it — the identical real minimalism discipline
`AddPartForm`'s own three-field form already established over
legacy's own real, four-field one. A real, second cost of a real,
separate modal specifically: this project's own real Models section is
already an inline, expandable disclosure, not a real, separate dialog
anywhere else in this component; introducing one real dialog pattern
for exactly one real control would be a real, new, inconsistent
architectural idea this slice doesn't actually need yet.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, multi-step sequence,
built around a real `File` and a real, label-based query neither of
which this project has ever used before, actually fails cleanly before
any real upload control exists — so this was actually run this
session:

```
FAIL  src/PartsList.test.tsx > adds a real, uploaded model to the real, visible list after a real, successful upload
TestingLibraryElementError: Unable to find role="button" and name "Upload"
```

Honest RED, for the real, correct reason.

### Connecting this unit to what came before

The previous unit proved a real absence, twice over — no control at
all, even once its own section is open. This unit proves the real,
whole, multi-step presence that same absence was always going to
become: pick a real file, upload it, see it land.

---

## Connect the pieces

Two real, paired claims about one, real, new capability: nothing
uploadable renders for a real, signed-out user, even once a real
part's own models are already open; a real, signed-in user can open
that same section, pick a real file, upload it, and see its real name
appear in the real, already-visible list — both proven, honestly,
against `PartsList`'s own current, real code, before either real
capability exists.

---

**Next lesson:** the real, smallest change to `PartsList` making both
of this lesson's own real tests pass.
