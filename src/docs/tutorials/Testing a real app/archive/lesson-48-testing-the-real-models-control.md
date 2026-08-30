# Lesson 48: Testing the Real Models Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. The 3D-models list's own
> backend half — empty case and synthetic entries both — is complete.
> This lesson starts its real, paired frontend half.

## What you will build

One real, test-first case for `PartsList`: a real, signed-out user can
still click a real Models control and see that real part's own real
model names — the first real control in this project that is
*deliberately not* gated on a real `token`, and the first real test
proving a real control's own real presence for a real, signed-out
user, rather than its real absence.

## What you need to know first

The real, already-tested `PartsList` component and its own real
Delete, Favorite, and Edit controls, all three real and gated on
`token`. This project's own real, already-proven
`GET /api/parts/<id>/models` and its own real **Operator bypass**
term, already given full treatment — this real route requires no real
token at all.

## Terms introduced

None genuinely new — this lesson distinguishes a real, third `fetch`
call by its own real URL, rather than by a real, already-established
`options?.method` check, since this real call and this component's own
existing real `GET /api/parts` call share the identical real HTTP
method.

## Objects and methods used

None genuinely new beyond this project's own, already fully-treated
`fireEvent.click` and `screen.getByRole`/`getByText`.

---

## Concept Unit: A Real Control That Doesn't Ask Who You Are

### The Problem

Every real control this project has built so far — Edit, Favorite,
Delete — is gated on a real `token`, because each one calls a real
route requiring a real, valid identity. Viewing a real part's own 3D
models is real, different: this project's own real characterization
already proved this real route's own real **Operator bypass** applies,
meaning a real, signed-out request already succeeds. The real question
this unit answers: should this real component's own real UI reflect
that, and how would a real test prove it does?

> **Before reading on:** this project's own real Delete-absence,
> Favorite-absence, and Edit-absence tests all prove a real control is
> real, missing for a real, signed-out user. Given that this real
> route needs no real token at all, what would gating a real "Models"
> control behind `token` actually cost a real, signed-out user who's
> otherwise allowed to see this real data — and would that real
> restriction match this project's own real backend at all?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason `PartsList`'s own Delete, Favorite, and Edit controls already
  gave — legacy's own real Parts UI has no real 3D-model list or
  viewer control anywhere in `PartTableRow.tsx`, `PartCard.tsx`, or
  `FolderTree.tsx` (all three read again in full this session).
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```tsx
test('shows a real part\'s own models when Models is clicked, even when signed out', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/models')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          data: [{ id: 'P-001-final', name: 'Final Part Model', category: 'part' }],
          total: 1,
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

  render(<PartsList />)

  await waitFor(() => {
    expect(screen.getByText('1234567', { exact: false })).toBeDefined()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Models' }))

  await waitFor(() => {
    expect(screen.getByText('Final Part Model')).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — this project's
own eight, already-established real tests, with this unit's own new
one appended (continuing from that file's own line 199):

```tsx
200
201
202 test('shows a real part\'s own models when Models is clicked, even when signed out', async () => {
203   vi.stubGlobal('fetch', vi.fn((url: string) => {
204     if (url.includes('/models')) {
205       return Promise.resolve({
206         json: () => Promise.resolve({
207           data: [{ id: 'P-001-final', name: 'Final Part Model', category: 'part' }],
208           total: 1,
209         }),
210       })
211     }
212
213     return Promise.resolve({
214       json: () => Promise.resolve({
215         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: 'Steel', isFavorite: false }],
216         total: 1,
217       }),
218     })
219   }))
220
221   render(<PartsList />)
222
223   await waitFor(() => {
224     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
225   })
226
227   fireEvent.click(screen.getByRole('button', { name: 'Models' }))
228
229   await waitFor(() => {
230     expect(screen.getByText('Final Part Model')).toBeDefined()
231   })
232 })
```

### Mechanical Walkthrough

- **Line 203, `vi.fn((url: string) => { ... })`** — real and reading
  only this real mock's own first argument, the real, requested URL —
  unlike this project's own earlier route-aware mocks, which
  distinguished a real `POST`/`PUT`/`DELETE` from a real `GET` by
  `options?.method`, this real mock needs to tell apart *two different
  real `GET` requests* — this component's own existing real
  `fetch('/api/parts')` and this unit's own new, real, per-part models
  request — so it checks the real URL string instead.
- **Line 204, `if (url.includes('/models'))`** — a real, plain
  JavaScript string method, checking whether the real, requested URL
  contains this real, literal substring — real and specific enough to
  match only this real, new kind of request, since this component's
  own other real `fetch` calls never touch a real `/models` path at
  all.
- **Line 221, `render(<PartsList />)`** — real and deliberately no
  `token` prop at all — this unit's own real, central claim.
- **Line 227, `fireEvent.click(screen.getByRole('button', { name:
  'Models' }))`** — real, direct proof this real control is already
  real, present and real, clickable with no real token — a real,
  successful `getByRole` here (not `queryByRole`) is itself part of
  this unit's own real claim: this real button must actually exist.
- **Line 230, `expect(screen.getByText('Final Part Model')).toBeDefined()`**
  — real, direct proof the real click actually reached this real
  route and rendered its own real, returned data.

### CS Lens

This is a real instance of **read/write asymmetry in access control**
— a real, common, deliberate pattern: real, read-only operations often
carry real, more permissive access than real, mutating ones, because
real, unauthorized reading and real, unauthorized writing carry real,
genuinely different risks. This project's own real backend already
encodes this asymmetry (this real route's own real **Operator
bypass**, versus Delete/Favorite/Edit's own real, strict role checks);
this unit is where the real, frontend UI first reflects it instead of
silently over-restricting.

Also recognized in: a real, public API endpoint allowing anonymous
`GET` requests while requiring real authentication for any real `POST`
or `DELETE`; a real content-management system letting anyone real,
view a real, published page while requiring a real, logged-in editor
to change it.

### SE Lens

The real, deliberately *not*-taken alternative here: gating this real
control behind `token` anyway, matching every other real control this
component already has, for a real, simpler, uniform rule ("every
button needs a real token"). Rejected on purpose: that real,
uniform rule would be real, actively wrong here — it would hide a
real capability from a real, signed-out user who this project's own
real backend already, correctly, allows to use it, contradicting this
project's own real, already-established discipline of matching a real
control's own real visibility to what the real backend actually
permits, not to a real, convenient blanket rule.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real test would fail cleanly
before any real Models control exists — so this was actually run this
session:

```
Test Files  1 failed (1)
     Tests  1 failed | 8 passed (9)
```

Honest RED: `Unable to find an accessible element with the role
"button" and name "Models"` — for the real, correct reason; every
earlier real test still passes, unaffected.

### Connecting this unit to what came before

Every earlier control this project built proved a real *absence* for
a real, signed-out user first. This unit is the first real one to
prove the real, opposite: a deliberate, real presence.

---

## Connect the pieces

One real, new claim about one real capability: a real, signed-out
user can already click a real Models control and see that real part's
own real model names — matching this project's own real backend's own
already-proven, real, permissive access, proven honestly before this
real capability exists at all.

---

**Next lesson:** the real, smallest change to `PartsList` making this
lesson's own real test pass.
