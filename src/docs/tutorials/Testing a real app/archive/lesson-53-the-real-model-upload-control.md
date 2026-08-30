# Lesson 53: The Real Model Upload Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own two real tests both pass, and this
> project's own real 3D-model upload slice is complete, front and back.

## What you will build

The actual smallest real change making the previous lesson's own two
real tests pass: a real, per-part file input and Upload control,
nested inside this project's own real, already-open Models section,
gated on a real, signed-in `token`; and the real handler that actually
builds a real `FormData`, uploads it, and adds the real result to the
real, already-visible list.

## What you need to know first

The previous lesson's own real, failing `PartsList.test.tsx`. This
project's own real **Controlled input** term isn't what this real file
input needs — a real `<input type="file">` needs its own real,
opposite counterpart instead, since no real script may ever set what
file it currently holds.

## Terms introduced

- **Uncontrolled input** — a real `<input>` whose own real, current
  value is never mirrored into React state at all; the real DOM node
  itself stays the one, real source of truth, read only at the real
  moment it's actually needed — inside a real `onChange` handler, or at
  a real submit — rather than kept in lockstep with a parallel real
  React state on every real keystroke, the way this project's own real
  **Controlled input** already works. A real `<input type="file">` has
  no real, honest choice in the matter: real browsers refuse to let any
  real script, React included, programmatically set what file it
  currently holds — this project's own real lab, below, actually
  proved the real, resulting `InvalidStateError`. Real, stored
  component state can still track *which* real file was picked — this
  unit's own real `selectedFile` does exactly that — but that's real,
  separate bookkeeping; it never flows back into the real input's own
  `value`, the one real thing that makes an input *controlled* in the
  first place.

## Objects and methods used

- **`FormData`**
  - *What it is:* a real, built-in Web Platform class for assembling a
    real, multipart request body — a real set of named fields, each
    either a real, plain string or a real `File`/`Blob`, that a real
    server receives as separate real parts, not as one, single real
    JSON string.
  - *Implementation:* checked against the real MDN Web Docs entry for
    `FormData` this session:

    ```ts
    class FormData {
      constructor()
      append(name: string, value: string | Blob, fileName?: string): void
    }
    ```

    `new FormData()` builds a real, empty instance; `append(name,
    value)` adds one real, named field — real and callable more than
    once, once per real field this unit's own real code actually
    sends.
  - *Its use:* this project's own real backend (Lessons 50–51) reads a
    real, uploaded file from `request.files['file']` — a real
    multipart field — never from a real JSON body; `FormData` is the
    real, standard way a real browser builds that exact real shape.
  - *Type:* a global, built-in Web Platform class — real and available
    the identical real way `File` already is, with no real import
    anywhere in this project.
  - *Responsibility:* to assemble a real set of named fields — text and
    real files together — into the one real shape a real HTTP request
    can carry as `multipart/form-data`, real and impossible to
    represent as a single real JSON string.
  - *Depends on:* nothing at real construction time; each real
    `append` call depends on a real name and a real value to attach.
  - *Connects to:* built and filled directly inside this unit's own
    real `handleUpload`; handed directly to `fetch`'s own real `body`
    option, below.
  - *Shape:* a real, standard Web Platform boundary — not
    project-specific, not a Testing-Library export.
- **`formData.append(name, value)`**
  - *What it is:* `FormData`'s own real, primary method — adds one
    real, named field to a real, in-progress `FormData` instance.
  - *Implementation:* the real signature already shown above, checked
    against the real MDN documentation this session; when `value` is a
    real `File` or `Blob`, the real, resulting field carries that real
    file's own real bytes, not a real, empty text placeholder.
  - *Its use:* this unit's own real code calls it exactly once, real
    and attaching this real unit's own real, selected file under the
    real field name `'file'` — the identical real name this project's
    own real backend already reads from `request.files['file']`.
  - *Type:* a real instance method on `FormData`.
  - *Responsibility:* to add exactly one real, named field to whatever
    real `FormData` instance it's called on.
  - *Depends on:* an already-constructed real `FormData` instance; a
    real name and a real value to attach.
  - *Connects to:* called on the real instance `handleUpload` just
    built; its real effect is only visible once that real instance is
    later read by a real server.
  - *Shape:* the identical real Web Platform boundary `FormData` itself
    already established.

---

## Concept Unit: A Real File Input, Rendered and Read

### The Problem

The previous lesson proved no real upload control exists yet, even
once a real part's own Models section is open. The real question this
unit answers: what's the smallest real change actually rendering a
real file input and a real Upload trigger, gated the identical real
way Delete, Favorite, and Edit already are?

> **Before reading on:** this project's own real Edit control already
> proved a real, gated, per-part control can sit right next to Delete
> and Favorite, inside the identical real `{token && ...}` guard. What
> real, different guard would this unit's own real control actually
> need, given it belongs *inside* the real, separately-gated Models
> section, not directly beside Edit and Favorite?

### Project Change

- **Reference Source** — legacy's own real `ModelUploadModal.tsx`, read
  in full this session: its own real file input, lines 155–161,
  `<input type="file" ref={fileInputRef} className="hidden"
  onChange={(e) => setFile(e.target.files?.[0] || null)}
  accept=".step,.stp,.stl,.iges,.igs,.obj" />`. Not ported wholesale —
  legacy's own real input is hidden behind a real, styled drop-zone
  `<div>` and a real `ref`-driven click, real and clicked open by a
  real, separate, clickable area, not shown directly; this unit
  Preserves only the real, load-bearing part — a real file input,
  real and reading `e.target.files?.[0]` into real state on real
  change — deliberately leaving the real, styled drop-zone visual
  behind, matching this project's own real, plain-HTML-control
  discipline everywhere else in `PartsList`.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — modify.
- **Location** — its own top-level state declarations, and the real,
  existing conditional block already rendering this part's own,
  expanded model list.
- **Dependencies** — none new.

### The New Code

```tsx
const [selectedFile, setSelectedFile] = useState<File | null>(null)
```

This real, new state needs a real, second real fragment to actually
matter — a real, returned control that both reads it and sets it:

```tsx
{expandedPartId === part.id && token && (
  <form>
    <label>
      Model file
      <input
        type="file"
        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
      />
    </label>
    <button type="submit">Upload</button>
  </form>
)}
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — the previous lesson's
own version, with this unit's own new state and its own new, real,
returned control added:

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList({ token }: { token?: string | null }) {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string; material: string; isFavorite: boolean }[]>([])
5    const [editingId, setEditingId] = useState<string | null>(null)
6    const [editDescription, setEditDescription] = useState('')
7    const [editMaterial, setEditMaterial] = useState('')
8    const [expandedPartId, setExpandedPartId] = useState<string | null>(null)
9    const [models, setModels] = useState<{ id: string; name: string; category: string }[]>([])
10   const [selectedFile, setSelectedFile] = useState<File | null>(null)
11
12   useEffect(() => {
13     fetch('/api/parts')
14       .then((response) => response.json())
15       .then((data) => setParts(data.data))
16   }, [])
17
18   const handleDelete = (partId: string) => {
19     fetch(`/api/parts/${partId}`, {
20       method: 'DELETE',
21       headers: { 'Authorization': `Bearer ${token}` },
22     }).then(() => {
23       setParts((current) => current.filter((part) => part.id !== partId))
24     })
25   }
26
27   const handleToggleFavorite = (part: { id: string; isFavorite: boolean }) => {
28     fetch(`/api/parts/${part.id}`, {
29       method: 'PUT',
30       headers: {
31         'Content-Type': 'application/json',
32         'Authorization': `Bearer ${token}`,
33       },
34       body: JSON.stringify({ isFavorite: !part.isFavorite }),
35     })
36       .then((response) => response.json())
37       .then((data) => {
38         setParts((current) => current.map((p) => (p.id === part.id ? data.data : p)))
39       })
40   }
41
42   const startEdit = (part: { id: string; description: string; material: string }) => {
43     setEditingId(part.id)
44     setEditDescription(part.description)
45     setEditMaterial(part.material)
46   }
47
48   const saveEdit = (partId: string) => {
49     fetch(`/api/parts/${partId}`, {
50       method: 'PUT',
51       headers: {
52         'Content-Type': 'application/json',
53         'Authorization': `Bearer ${token}`,
54       },
55       body: JSON.stringify({ description: editDescription, material: editMaterial }),
56     })
57       .then((response) => response.json())
58       .then((data) => {
59         setParts((current) => current.map((p) => (p.id === partId ? data.data : p)))
60         setEditingId(null)
61       })
62   }
63
64   const toggleModels = (partId: string) => {
65     if (expandedPartId === partId) {
66       setExpandedPartId(null)
67       return
68     }
69
70     fetch(`/api/parts/${partId}/models`)
71       .then((response) => response.json())
72       .then((data) => {
73         setModels(data.data)
74         setExpandedPartId(partId)
75       })
76   }
77
78   if (parts.length === 0) {
79     return <p>No parts yet.</p>
80   }
81
82   return (
83     <ul>
84       {parts.map((part) => (
85         <li key={part.id}>
86           {editingId === part.id ? (
87             <>
88               <input
89                 value={editDescription}
90                 onChange={(event) => setEditDescription(event.target.value)}
91               />
92               <input
93                 value={editMaterial}
94                 onChange={(event) => setEditMaterial(event.target.value)}
95               />
96               <button onClick={() => saveEdit(part.id)}>Save</button>
97               <button onClick={() => setEditingId(null)}>Cancel</button>
98             </>
99           ) : (
100            <>
101              {part.partNumber} — {part.description}
102              {token && <button onClick={() => startEdit(part)}>Edit</button>}
103              {token && <button onClick={() => handleToggleFavorite(part)}>{part.isFavorite ? 'Unfavorite' : 'Favorite'}</button>}
104              {token && <button onClick={() => handleDelete(part.id)}>Delete</button>}
105              <button onClick={() => toggleModels(part.id)}>{expandedPartId === part.id ? 'Hide Models' : 'Models'}</button>
106              {expandedPartId === part.id && (
107                <ul>
108                  {models.map((model) => (
109                    <li key={model.id}>{model.name}</li>
110                  ))}
111                </ul>
112              )}
113              {expandedPartId === part.id && token && (
114                <form>
115                  <label>
116                    Model file
117                    <input
118                      type="file"
119                      onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
120                    />
121                  </label>
122                  <button type="submit">Upload</button>
123                </form>
124              )}
125            </>
126          )}
127        </li>
128      ))}
129    </ul>
130  )
131 }
132
133 export default PartsList
```

### Isolated Lab: Setting a Real File Input's Own Real `value`

Line 119 above deliberately never sets this real input's own `value` —
only `onChange`, real and only *reading* what was picked. Here's the
real, concrete reason why, run in isolation, against a tiny, real,
throwaway node with nothing else around it:

```tsx
import { test, expect } from 'vitest'

test('lab: setting a file input value directly, in this real jsdom environment', () => {
  const input = document.createElement('input')
  input.type = 'file'

  let threw: Error | null = null
  try {
    input.value = 'C:\\fakepath\\bracket.stl'
  } catch (error) {
    threw = error as Error
  }

  console.log('threw:', threw?.name, threw?.message)

  expect(threw).not.toBeNull()
  expect(threw?.name).toBe('InvalidStateError')
})
```

Run for real this session:

```
threw: InvalidStateError This input element accepts a filename, which may only be programmatically set to the empty string.
```

This proves the real claim behind this lesson's own new **Uncontrolled
input** term isn't a polite convention this project chose — it's a
real, enforced restriction: a real script assigning any real,
non-empty string to a real file input's own `.value` throws a real
`InvalidStateError`, in this project's own real `jsdom` test
environment exactly as it would in a real, live browser. That's the
real, concrete reason line 119 above only ever reads
`event.target.files`, never writes a real `value` back. This throwaway
example is discarded from this project's own real, taught code — it
never appears inside `rebuild/frontend` itself — but per this
curriculum's own real Verification Rule, its real source and this
real, pasted output are both kept, permanently, in
`verification/frontend/src/lesson53_lab_file_input_value.test.tsx`.

### Mechanical Walkthrough

- **Line 10, `const [selectedFile, setSelectedFile] = useState<File |
  null>(null)`** — this lesson's Header's own new **Uncontrolled
  input** term, made concrete: real, separate bookkeeping for *which*
  real file was picked, real and never flowing back into the real
  input's own `value`.
- **Line 113, `{expandedPartId === part.id && token && (...)}`** — a
  real, two-part guard, real and different from every earlier control:
  Delete, Favorite, and Edit each check only `token`; this real control
  also requires the real Models section to already be open, since
  that's real and where this slice deliberately places it — the
  identical real, two-part condition the previous lesson's own
  absence test already proved necessary.
- **Line 114, `<form>`** — the identical real element `AddPartForm`
  already established for a real, submitted action, reused here
  instead of a real, bare `onClick` button, matching that lesson's own
  real reasoning: a real form is the real, standard way a real browser
  associates a real submit button with the real fields around it.
- **Lines 115–121, the real, labeled file input** — `<label>Model
  file<input type="file" .../></label>`: wrapping the real input in a
  real `<label>` gives it the real, accessible name this lesson's own
  previous lesson's own real `getByLabelText('Model file')` already
  depends on; `type="file"` is what makes this real input a real file
  picker at all, rather than a real, ordinary text box.
- **Line 119, `onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}`**
  — real and reading this real input's own real, special `.files`
  property — a real `FileList`, this lesson's Header's own previous
  lesson already proved behaves like a real, indexable array —
  `?.[0]` takes the real, first (and, here, only) selected file;
  `|| null` real and covering the real case where a user clears the
  real selection, leaving `event.target.files` real and empty.
- **Line 122, `<button type="submit">Upload</button>`** — a real,
  ordinary submit button; real and inert, for now, since line 114's
  own real `<form>` has no real `onSubmit` handler yet.

### CS Lens

This is a real instance of **state co-location, deliberately
incomplete** — `selectedFile` real and lives exactly where it's
needed, next to every other real state this component already holds,
rather than in some real, separate, dedicated "upload state" object.
The identical real idea already underlies every other real state this
component holds — `editDescription`, `editMaterial`, `models` — real
and each living beside the real logic that actually uses it.

Also recognized in: any real component holding several, real,
independent pieces of in-progress state side by side, rather than
bundling them into one, real, monolithic "form state" object before
there's a real, demonstrated need to.

### SE Lens

The real, deliberately *not*-taken alternative here: wiring
`handleUpload` and this real control's own `onSubmit` in the identical
real commit as the input itself. Rejected on purpose, matching this
project's own real, repeated two-step discipline (`AddPartForm`'s own
absence-then-behavior split; Edit's own entry-then-save split): proving
the real control actually *renders*, gated correctly, before adding
the real logic that actually sends anything, keeps each real, small
commit checkable on its own — a real reader can see exactly which real
commit introduced the real control's own visible shape, and which
separate one gave it real, working behavior.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — so this was actually run this session:

```
Test Files  1 failed (1)
     Tests  1 failed | 10 passed (11)
```

The previous lesson's own real absence test still passes — real and
correctly, since nothing here changes what a real, signed-out user
sees. The previous lesson's own real upload test now gets further —
real and finding the real Upload button and real, labeled file
input — but still fails at its own final real assertion: nothing yet
answers a real click.

### Connecting this unit to what came before

The previous lesson proved what this real control must look like and
where it must live. This unit is what actually renders it — leaving
exactly one real piece still missing: what happens when a real user
actually clicks Upload.

---

## Concept Unit: A Real Upload, Sent and Reflected

### The Problem

A real file can now be picked, but clicking Upload still does
nothing real at all. The real question this unit answers: what's the
smallest real handler that actually sends a real, selected file to
this project's own real, already-proven upload route, and shows the
real result without a real, separate page reload or a real refetch?

> **Before reading on:** this project's own real Edit control already
> sends a real, changed value with a real, JSON `fetch` body. A real
> file cannot travel that way at all — a real file isn't a real string.
> Given this lesson's Header's own new `FormData`, what real, different
> shape would this unit's own real request body actually need instead?

### Project Change

- **Reference Source** — legacy's own real `handleSubmit`, the same
  file already named above, lines 67–107: builds a real `FormData`,
  `formData.append('file', file)`, then `fetch(...,{ method: 'POST',
  body: formData })` — no real `Content-Type` header set by hand
  anywhere in that real function. This unit Preserves that identical
  real technique exactly; legacy's own real function also appends six
  more real fields (`name`, `description`, `category`, `modelType`,
  `priority`, `isGeneric`, a real, hardcoded `'user123'` `userId`) this
  unit deliberately omits — see the previous lesson's own SE Lens for
  why.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — modify.
- **Location** — a real, new `handleUpload` function, and the existing
  real `<form>`'s own `onSubmit`.
- **Dependencies** — none new.

### The New Code

```tsx
const handleUpload = (partId: string, event: React.FormEvent) => {
  event.preventDefault()
  if (!selectedFile) {
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile)

  fetch(`/api/parts/${partId}/models`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      setModels((current) => [...current, data.data])
      setSelectedFile(null)
    })
}
```

This real, new handler needs one, real, small change to the previous
unit's own, inert `<form>` before anything real actually calls it:

```tsx
<form onSubmit={(event) => handleUpload(part.id, event)}>
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — the previous unit's
own version, with this unit's own new `handleUpload` and its own real,
wired `onSubmit` added:

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList({ token }: { token?: string | null }) {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string; material: string; isFavorite: boolean }[]>([])
5    const [editingId, setEditingId] = useState<string | null>(null)
6    const [editDescription, setEditDescription] = useState('')
7    const [editMaterial, setEditMaterial] = useState('')
8    const [expandedPartId, setExpandedPartId] = useState<string | null>(null)
9    const [models, setModels] = useState<{ id: string; name: string; category: string }[]>([])
10   const [selectedFile, setSelectedFile] = useState<File | null>(null)
11
12   useEffect(() => {
13     fetch('/api/parts')
14       .then((response) => response.json())
15       .then((data) => setParts(data.data))
16   }, [])
17
18   const handleDelete = (partId: string) => {
19     fetch(`/api/parts/${partId}`, {
20       method: 'DELETE',
21       headers: { 'Authorization': `Bearer ${token}` },
22     }).then(() => {
23       setParts((current) => current.filter((part) => part.id !== partId))
24     })
25   }
26
27   const handleToggleFavorite = (part: { id: string; isFavorite: boolean }) => {
28     fetch(`/api/parts/${part.id}`, {
29       method: 'PUT',
30       headers: {
31         'Content-Type': 'application/json',
32         'Authorization': `Bearer ${token}`,
33       },
34       body: JSON.stringify({ isFavorite: !part.isFavorite }),
35     })
36       .then((response) => response.json())
37       .then((data) => {
38         setParts((current) => current.map((p) => (p.id === part.id ? data.data : p)))
39       })
40   }
41
42   const startEdit = (part: { id: string; description: string; material: string }) => {
43     setEditingId(part.id)
44     setEditDescription(part.description)
45     setEditMaterial(part.material)
46   }
47
48   const saveEdit = (partId: string) => {
49     fetch(`/api/parts/${partId}`, {
50       method: 'PUT',
51       headers: {
52         'Content-Type': 'application/json',
53         'Authorization': `Bearer ${token}`,
54       },
55       body: JSON.stringify({ description: editDescription, material: editMaterial }),
56     })
57       .then((response) => response.json())
58       .then((data) => {
59         setParts((current) => current.map((p) => (p.id === partId ? data.data : p)))
60         setEditingId(null)
61       })
62   }
63
64   const handleUpload = (partId: string, event: React.FormEvent) => {
65     event.preventDefault()
66     if (!selectedFile) {
67       return
68     }
69
70     const formData = new FormData()
71     formData.append('file', selectedFile)
72
73     fetch(`/api/parts/${partId}/models`, {
74       method: 'POST',
75       headers: { 'Authorization': `Bearer ${token}` },
76       body: formData,
77     })
78       .then((response) => response.json())
79       .then((data) => {
80         setModels((current) => [...current, data.data])
81         setSelectedFile(null)
82       })
83   }
84
85   const toggleModels = (partId: string) => {
86     if (expandedPartId === partId) {
87       setExpandedPartId(null)
88       return
89     }
90
91     fetch(`/api/parts/${partId}/models`)
92       .then((response) => response.json())
93       .then((data) => {
94         setModels(data.data)
95         setExpandedPartId(partId)
96       })
97   }
98
99   if (parts.length === 0) {
100    return <p>No parts yet.</p>
101  }
102
103  return (
104    <ul>
105      {parts.map((part) => (
106        <li key={part.id}>
107          {editingId === part.id ? (
108            <>
109              <input
110                value={editDescription}
111                onChange={(event) => setEditDescription(event.target.value)}
112              />
113              <input
114                value={editMaterial}
115                onChange={(event) => setEditMaterial(event.target.value)}
116              />
117              <button onClick={() => saveEdit(part.id)}>Save</button>
118              <button onClick={() => setEditingId(null)}>Cancel</button>
119            </>
120          ) : (
121            <>
122              {part.partNumber} — {part.description}
123              {token && <button onClick={() => startEdit(part)}>Edit</button>}
124              {token && <button onClick={() => handleToggleFavorite(part)}>{part.isFavorite ? 'Unfavorite' : 'Favorite'}</button>}
125              {token && <button onClick={() => handleDelete(part.id)}>Delete</button>}
126              <button onClick={() => toggleModels(part.id)}>{expandedPartId === part.id ? 'Hide Models' : 'Models'}</button>
127              {expandedPartId === part.id && (
128                <ul>
129                  {models.map((model) => (
130                    <li key={model.id}>{model.name}</li>
131                  ))}
132                </ul>
133              )}
134              {expandedPartId === part.id && token && (
135                <form onSubmit={(event) => handleUpload(part.id, event)}>
136                  <label>
137                    Model file
138                    <input
139                      type="file"
140                      onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
141                    />
142                  </label>
143                  <button type="submit">Upload</button>
144                </form>
145              )}
146            </>
147          )}
148        </li>
149      ))}
150    </ul>
151  )
152 }
153
154 export default PartsList
```

### Isolated Lab: `fetch`'s Own Real, Automatic `Content-Type`

Line 75 above sends `formData` as a real request body with only a real
`Authorization` header — real and deliberately no real `Content-Type`
anywhere. Here's the real, concrete reason why, run against a real,
local HTTP server this session actually started, with nothing else
involved:

```tsx
// @vitest-environment node
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { test, expect } from 'vitest'

test('lab: fetch sets its own real multipart Content-Type for a FormData body', async () => {
  const receivedContentType = await new Promise<string | undefined>((resolve) => {
    const server = http.createServer((req, res) => {
      resolve(req.headers['content-type'])
      res.end('ok')
      server.close()
    })

    server.listen(0, async () => {
      const port = (server.address() as AddressInfo).port
      const formData = new FormData()
      formData.append('file', new Blob(['stl-bytes']), 'bracket.stl')

      await fetch(`http://localhost:${port}/`, {
        method: 'POST',
        body: formData,
      })
    })
  })

  console.log('real Content-Type header received:', receivedContentType)

  expect(receivedContentType).toMatch(/^multipart\/form-data; boundary=/)
})
```

Run for real this session:

```
real Content-Type header received: multipart/form-data; boundary=----formdata-undici-051643456559
```

This proves `fetch` really does compute its own, real
`multipart/form-data; boundary=...` `Content-Type` header, automatically,
the moment its real `body` is a real `FormData` — the real, concrete
reason line 75 above never sets one by hand: a real, hand-written
`Content-Type` would have to include the identical real, random
boundary string `fetch` generates internally to separate each real
field, which no real, outside code can predict in advance. Setting one
manually risks a real, mismatched boundary a real server can never
correctly parse. A real, first-hand surprise found running this exact
lab this session, worth stating honestly: this only holds true under a
real `@vitest-environment node` override. Under this project's own
default, real `jsdom` test environment, the identical real code
produced `text/plain;charset=UTF-8` instead — real and because `jsdom`
provides its own, separate, real `FormData` class, one Node's own real
`fetch` doesn't recognize as multipart-capable. `PartsList.test.tsx`
itself never actually hits this real gap, since every real test there
mocks `fetch` entirely and never lets a real `FormData` reach a real
network stack at all. This throwaway example is discarded from this
project's own real, taught code — it never appears inside
`rebuild/frontend` itself — but per this curriculum's own real
Verification Rule, its real source and this real, pasted output are
both kept, permanently, in
`verification/frontend/src/lesson53_lab_formdata_headers.test.tsx`.

### Mechanical Walkthrough

- **Line 65, `event.preventDefault()`** — the identical real method
  already fully treated on every other real `<form onSubmit>` this
  project has built, real and stopping a real, full page reload a real
  browser would otherwise perform.
- **Lines 66–68, `if (!selectedFile) { return }`** — a real, early
  guard: clicking Upload with no real file ever picked does nothing
  real at all, rather than sending a real, empty request this
  project's own real backend would reject anyway.
- **Line 70, `const formData = new FormData()`** — this lesson's
  Header's own new class, real and building one, real, empty container
  to fill.
- **Line 71, `formData.append('file', selectedFile)`** — this lesson's
  Header's own new method, real and attaching this real unit's own
  real, selected file under the real field name `'file'` — the
  identical real name this project's own real backend
  (`request.files['file']`) already expects.
- **Line 73–77, the real `fetch` call** — real and deliberately
  carrying only a real `Authorization` header, no real `Content-Type` —
  this lesson's own isolated lab, above, real and proving why: `fetch`
  computes that real header itself the moment `body` is a real
  `FormData`.
- **Line 78, `.then((response) => response.json())`** — the identical
  real pattern already established on every other real `fetch` in this
  file.
- **Line 80, `setModels((current) => [...current, data.data])`** — a
  real, functional state update, real and appending this real,
  server-returned model directly onto the real, existing list, rather
  than triggering a real, separate refetch — the identical real
  "trust the real, authoritative server response" discipline Delete,
  Favorite, and Edit's own saves already established.
- **Line 81, `setSelectedFile(null)`** — real and clearing this real
  unit's own real, tracked selection after a real, successful
  upload — real and worth naming honestly what it does *not* do: the
  real, native file input itself, real and uncontrolled, still visibly
  shows the real, previously-picked filename in a real browser after
  this real reset, since nothing here ever wrote to that real input's
  own `value` in the first place. Fixing that would need a real,
  changing `key` prop forcing React to discard and rebuild a fresh
  real DOM node — the identical real remount technique this project
  already uses once, coarser-grained, between `App` and `PartsList`
  itself — deliberately deferred here, since no real, current test
  depends on it.
- **Line 134, `<form onSubmit={(event) => handleUpload(part.id,
  event)}>`** — real and finally wiring the previous unit's own,
  inert `<form>` to this unit's own new, real handler.

### CS Lens

This is a real instance of an **optimistic local update** — this
project's own real term, already given full treatment for Delete,
Favorite, and Edit alike — applied here for the first time to a real
*addition* rather than a real removal or a real field change: trust
the real, authoritative server response and splice it directly into
real, local state, rather than re-fetching the real, whole list from
scratch after every real change.

Also recognized in: any real client appending a real, freshly created
resource straight from a real `201 Created` response body, rather than
re-querying a real list endpoint to confirm what it already knows.

### SE Lens

The real, deliberately *not*-taken alternative here: sending
`name`, `category`, and `modelType` as real, additional `FormData`
fields, matching legacy's own real, richer form. Rejected on purpose —
this project's own real backend already defaults every one of those
three real fields server-side (`request.form.get('name', file.filename)`,
`request.form.get('category', 'part')`, `request.form.get('modelType',
'solid')`) the moment they're real and absent; sending them from the
real client anyway would be real, dead code with no real, current
requirement behind it — the identical real minimalism discipline this
project's own real Update slice already applied, sending only the
real fields a real user actually changed rather than every real field
a real part happens to have.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
npx tsc --noEmit
```

### Run it, per the Verification Rule

Real doubt existed here — so this was actually run this session:

```
Test Files  8 passed (8)
     Tests  21 passed (21)
```

The previous lesson's own real test now passes, together with every
real test this project has ever written. A real `npx tsc --noEmit`
was also actually run this session — a genuine, clean compile, no real
output at all.

### Connecting this unit to what came before

The previous unit proved a real control could render, gated correctly,
still inert. This unit is what finally makes it real — completing this
project's own real 3D-model upload slice, front and back, the last
real gap this project's own real 3D-model work had left open besides
deletion and the tool-assembly joins.

---

## Connect the pieces

A real, signed-in, correctly-roled user can now open a real part's own
Models section, pick a real file from their own real disk, click
Upload, and see that real file's own real name appear in the real,
already-visible list — immediately, with no real page reload and no
real, separate refetch — while a real, signed-out user, even with that
identical real section already open, sees no real way to do any of it
at all.

---

**Next lesson:** not yet decided here — this project's own real
3D-model work still has real deletion ahead of it; the tool-assembly
joins remain a real, separate, deeper slice too.
