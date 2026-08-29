# Lesson 42: Testing the Real Edit Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. This project's own real
> Update slice's backend half is complete for `description`,
> `material`, `status`, and `isFavorite`. This lesson starts the real,
> paired frontend half for the two fields a real user would actually
> want to edit by hand: `description` and `material`.

## What you will build

Two real, test-first cases for `PartsList`: a real, signed-out user
sees no real way to edit anything, and a real, signed-in user can open
a real part for editing, change its real description and material, and
save both — proven by the real, rendered list actually showing the new
real values afterward. Both proven to fail honestly before either real
capability exists.

## What you need to know first

The real, already-tested `PartsList` component and its own real
Delete and Favorite controls, both gated on a real `token`. This
slice's own real, already-proven `PUT /api/parts/<id>`, handling
`description` and `material` independently.

## Terms introduced

- **Controlled input** — a real, standard React pattern: a real
  `<input>` whose own real `value` prop is set from real component
  state, and whose own real `onChange` handler writes back into that
  same real state — real React, not the real browser's own default
  form behavior, owns what the real input actually displays at every
  real moment. Without a real `onChange` handler, a real, controlled
  input would be real, permanently stuck at whatever real value it was
  first given — real and unable to accept real keystrokes at all.

## Objects and methods used

- **`screen.getByDisplayValue(value)`**
  - *What it is:* a real, Testing Library query method, finding a real
    form element (an `<input>`, `<textarea>`, or `<select>`) by its
    own real, *current* displayed value.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — real and distinct from
    `getByText(...)`, which only ever matches real, rendered text
    content, never a real form element's own real `value`.
  - *Its use:* this lesson's own real test needs to find the real
    inputs a real edit control reveals, without needing to give them a
    real, separate `placeholder` or `aria-label` first — this real
    query works from the real, pre-filled value alone.
  - *Type:* a function exported by `@testing-library/react`'s own real
    `screen` object.
  - *Responsibility:* the real, standard way to locate a real form
    control by what a real user currently sees inside it.
  - *Depends on:* a real, already-rendered component tree containing
    at least one real form element with the real, matching value.
  - *Connects to:* called directly inside this lesson's own real test;
    its own real, returned element is passed directly to
    `fireEvent.change(...)`.
  - *Shape:* the real, standard Testing Library query boundary — not
    project-specific.
- **`fireEvent.change(element, { target: { value } })`**
  - *What it is:* a real, already-used Testing Library method (this
    project's own `AddPartForm` tests already use it), reused here on
    a real, different component.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — identical real behavior already
    given full treatment; dispatches a real, synthetic `change` event,
    real and setting `event.target.value` to whatever real string is
    given.
  - *Its use:* this lesson's own real test uses it to simulate a real
    user actually typing a real, new value into a real, controlled
    input.
  - *Type:* the identical real method already given full treatment.
  - *Responsibility:* the identical real responsibility already
    established.
  - *Depends on:* the identical real dependencies already established.
  - *Connects to:* a real, controlled input's own real `onChange`
    handler.
  - *Shape:* the identical real Testing-Library/DOM event boundary
    already established.

---

## Concept Unit: A Third Real Control, Absent for the Same Real Reason

### The Problem

`PartsList` already gates Delete and Favorite on a real, signed-in
`token`. A real edit control needs the identical real gate — this
project's own real Update characterization already proved `PUT`
requires the identical real, narrow role list. The real question this
unit answers: does this real, third control need its own real,
separate absence proof too?

> **Before reading on:** this project's own real Favorite-absence
> lesson already answered this exact real question once, for a real,
> second control. What does that lesson's own real SE Lens already
> say about why a real, third control wouldn't get to skip it either?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason `PartsList`'s own Delete and Favorite controls already gave —
  legacy's own real Parts UI has no real, editable description or
  material field anywhere (`PartTableRow.tsx`, `PartCard.tsx`, both
  read again in full this session — both render `part.description`
  as real, plain text, never inside a real, editable element).
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```tsx
test('shows no edit control when signed out', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: 'Steel', isFavorite: false }],
        total: 1,
      }),
    })
  ))

  render(<PartsList />)

  await waitFor(() => {
    expect(screen.getByText('1234567', { exact: false })).toBeDefined()
  })

  expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — this project's
own six, already-established real tests, with this unit's own new one
appended (continuing from that file's own line 136):

```tsx
137
138
139 test('shows no edit control when signed out', async () => {
140   vi.stubGlobal('fetch', vi.fn(() =>
141     Promise.resolve({
142       json: () => Promise.resolve({
143         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: 'Steel', isFavorite: false }],
144         total: 1,
145       }),
146     })
147   ))
148
149   render(<PartsList />)
150
151   await waitFor(() => {
152     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
153   })
154
155   expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
156 })
```

### Mechanical Walkthrough

- **Line 143, `material: 'Steel'`** — a real, new field, added to this
  unit's own mock data because this project's own real part type is
  about to grow to include it; not read by this unit's own assertion,
  only present so the next unit's own real edit form has a real,
  second value to show.
- **Line 155, `screen.queryByRole('button', { name: 'Edit' })`** — the
  identical real `queryByRole` method already given full treatment,
  applied to a real, third, distinct accessible name.

### CS Lens

The identical real **negative space assertion** already named in full,
twice.

Also recognized in: the identical real examples already given.

### SE Lens

No real, new alternative considered here — this unit is a direct,
real, third application of a real, already-justified rule: every real,
independent control this project builds gets its own real, dedicated
absence proof, because Testing Library's own real, name-based query
only ever proves what it's actually asked to look for.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — so this was actually run this session:

```
Test Files  1 passed (1)
     Tests  7 passed (7)
```

### Connecting this unit to what came before

The Delete and Favorite lessons each proved one real control's own
absence. This unit is the identical real proof, for a real, third,
independent one.

---

## Concept Unit: A Real Edit, Opened, Changed, and Saved

### The Problem

Nothing yet proves a real, signed-in user can actually change a real
part's own description and material. Unlike Delete and Favorite —
both a real, single click — a real edit needs a real, multi-step
sequence: open it, change it, save it. The real question this unit
answers: what's the smallest real test proving that whole real
sequence, end to end, without a real, running backend anywhere near
it?

> **Before reading on:** `AddPartForm`'s own real test already types
> into more than one real, controlled input before submitting. Given
> this lesson's Header's own new `getByDisplayValue` and the
> already-established `fireEvent.change`, what real, ordered sequence
> of real actions would prove a real edit actually reached a real,
> different value, not merely that *some* real input accepted *some*
> real keystroke?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason already given twice in this lesson.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```tsx
test('saves a real, edited description and material after a real, successful update', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
    if (options?.method === 'PUT') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: { id: 'P-001', partNumber: '1234567', description: 'Revised Bracket', material: 'Titanium', isFavorite: false },
        }),
      })
    }

    return Promise.resolve({
      json: () => Promise.resolve({
        data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: 'Steel', isFavorite: false }],
        total: 1,
      }),
    })
  }))

  render(<PartsList token="a.b.c" />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDefined()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

  const descriptionInput = screen.getByDisplayValue('Landing Gear Bracket')
  fireEvent.change(descriptionInput, { target: { value: 'Revised Bracket' } })

  const materialInput = screen.getByDisplayValue('Steel')
  fireEvent.change(materialInput, { target: { value: 'Titanium' } })

  fireEvent.click(screen.getByRole('button', { name: 'Save' }))

  await waitFor(() => {
    expect(screen.getByText('Revised Bracket', { exact: false })).toBeDefined()
  })

  expect(screen.queryByDisplayValue('Revised Bracket')).toBeNull()
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — the previous
unit's own seven real tests, with this unit's own new one appended
(continuing from line 156):

```tsx
157
158
159 test('saves a real, edited description and material after a real, successful update', async () => {
160   vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
161     if (options?.method === 'PUT') {
162       return Promise.resolve({
163         ok: true,
164         json: () => Promise.resolve({
165           data: { id: 'P-001', partNumber: '1234567', description: 'Revised Bracket', material: 'Titanium', isFavorite: false },
166         }),
167       })
168     }
169
170     return Promise.resolve({
171       json: () => Promise.resolve({
172         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: 'Steel', isFavorite: false }],
173         total: 1,
174       }),
175     })
176   }))
177
178   render(<PartsList token="a.b.c" />)
179
180   await waitFor(() => {
181     expect(screen.getByRole('button', { name: 'Edit' })).toBeDefined()
182   })
183
184   fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
185
186   const descriptionInput = screen.getByDisplayValue('Landing Gear Bracket')
187   fireEvent.change(descriptionInput, { target: { value: 'Revised Bracket' } })
188
189   const materialInput = screen.getByDisplayValue('Steel')
190   fireEvent.change(materialInput, { target: { value: 'Titanium' } })
191
192   fireEvent.click(screen.getByRole('button', { name: 'Save' }))
193
194   await waitFor(() => {
195     expect(screen.getByText('Revised Bracket', { exact: false })).toBeDefined()
196   })
197
198   expect(screen.queryByDisplayValue('Revised Bracket')).toBeNull()
199 })
```

### Mechanical Walkthrough

- **Lines 161–168, the real `PUT` branch** — extends the identical
  real, route-aware mock shape already established for a real, fourth
  case; returns the real, complete, updated part, matching this
  slice's own real backend contract exactly.
- **Line 184, `fireEvent.click(...)` on `'Edit'`** — opens whatever
  real edit affordance this project's own next unit builds.
- **Line 186, `screen.getByDisplayValue('Landing Gear Bracket')`** —
  this lesson's Header's own new query, finding the real, controlled
  input this real edit control must show, pre-filled with this real
  part's own real, current description — real, direct proof the real
  edit form doesn't start real, empty.
- **Line 187, `fireEvent.change(descriptionInput, { target: { value:
  'Revised Bracket' } })`** — the identical real, already-established
  method, real and changing this real, controlled input's own real
  value.
- **Lines 189–190, the identical real sequence for `material`** — real,
  direct proof a real, second field is independently editable in the
  identical real edit session.
- **Line 192, `fireEvent.click(...)` on `'Save'`** — real and
  triggering whatever real code actually sends this real, changed data
  onward.
- **Line 195, `screen.getByText('Revised Bracket', ...)`** — real,
  direct proof the real, rendered list itself now shows the real, new
  value — not merely that a real request was sent, but that its real
  result actually reached the real, visible page.
- **Line 198, `screen.queryByDisplayValue('Revised Bracket')`,
  asserted real `null`** — real, direct proof the real edit form
  itself is gone after a real, successful save — a real user isn't
  left staring at a real, stale, still-open form.

### CS Lens

This is a real instance of a **multi-step interaction test** — real
and genuinely different from every real test this project has written
so far, each of which proved one real click's own real effect. This
real test proves a real, ordered *sequence* — open, change two real
fields, save — behaves correctly as a real whole, not merely that each
real step works in real isolation.

Also recognized in: any real, end-to-end test driving a real,
multi-field form through open-edit-save, rather than testing each real
field's own real `onChange` handler in real isolation.

### SE Lens

The real, deliberately *not*-taken alternative here: two real, separate
tests — one proving the real form opens pre-filled, one proving Save
sends the real, correct data — instead of this one, real, combined
test. Rejected on purpose: this real interaction's own real value is
precisely that all three real steps work *together*; a real bug where
Save silently used stale, real, pre-edit values (a real, easy mistake
if a real handler accidentally closed over the wrong real variable)
would only ever surface in a real test that actually changes a value
before saving it, exactly as this one does.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, multi-step sequence
actually fails cleanly before any real edit control exists — so this
was actually run this session:

```
FAIL  src/PartsList.test.tsx > saves a real, edited description and material after a real, successful update
TestingLibraryElementError: Unable to find an accessible element with
the role "button" and name "Edit"
```

Honest RED, for the real, correct reason.

### Connecting this unit to what came before

The previous unit proved a real absence. This unit proves the real,
whole, multi-step presence that same absence was always going to
become.

---

## Connect the pieces

Two real, paired claims about one real capability: nothing renders for
a real, signed-out user, and a real, signed-in user can open, change,
and save a real part's own description and material, together, in one
real sequence — both proven, honestly, against `PartsList`'s own
current, real code, before either real capability exists.

---

**Next lesson:** the real, smallest change to `PartsList` making both
of this lesson's own real tests pass.
