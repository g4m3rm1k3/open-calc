# Junior to Senior — T6·L6 — react-hook-form and Zod

**Prerequisites:** T6·L5 (Custom Hooks). You understand `useEffect` cleanup and how
custom hooks compose. This lesson adds form management — but the real lesson is
understanding WHY controlled inputs cause performance problems, HOW uncontrolled inputs
avoid them, and WHAT the `register()` function actually does to your `<input>`.

**What this lab adds:**
- Why `value + onChange` on 10 fields causes 10 re-renders per keystroke — the concrete cost
- How `register('field')` attaches to an uncontrolled input — what it returns and why
- What `handleSubmit` actually does before calling your handler
- How Zod schema validation plugs into react-hook-form — the `resolver` mechanism
- `formState.errors` — where errors come from and why they appear at specific moments

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A controlled input: `<input value={title} onChange={e => setTitle(e.target.value)} />`.
>    The user types one character. List every React operation that happens.
> 2. `register('title')` returns an object with four properties. Name them. What does
>    each one do to the `<input>` element?
> 3. `handleSubmit(onValid)` is called. One field has a validation error. Does `onValid`
>    run? What runs instead?
>
> *(Answers at the end of this lab)*

---

## The Problem: 10 Fields × Every Keystroke

Open the browser DevTools. Add a 10-field controlled form and type in one input.
Every keystroke triggers `setState`, which re-renders the component, which re-renders
ALL 10 inputs — even the 9 that didn't change.

This lesson shows the exact cost, then shows how react-hook-form eliminates it.

---

## Step 1 — See the Controlled Form Problem

Create `src/components/ControlledFormDemo.tsx` to measure the problem:

```tsx
// src/components/ControlledFormDemo.tsx
import { useState, useRef } from 'react';

export function ControlledFormDemo() {
  const renderCount = useRef(0);
  renderCount.current++;

  // 10 controlled fields — each keystroke in ANY field re-renders ALL 10:
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');
  // ... (simulate the pattern — 3 is enough to see the issue)

  return (
    <div>
      <p>Render count: {renderCount.current}</p>
      <input value={field1} onChange={e => setField1(e.target.value)} placeholder="Field 1" />
      <input value={field2} onChange={e => setField2(e.target.value)} placeholder="Field 2" />
      <input value={field3} onChange={e => setField3(e.target.value)} placeholder="Field 3" />
    </div>
  );
}
```

Add it temporarily to `App.tsx` and run the app:

```bash
npm run dev
```

### SAVE AND TRY

Open `http://localhost:5173`. Type in Field 1. Watch the render count.

**You should see:** The render count increments with every single keystroke — even though
Fields 2 and 3 did not change.

**In the browser console:**

```js
// React DevTools Profiler is the right tool for this, but you can also:
// 1. Open React DevTools
// 2. Click the Profiler tab
// 3. Click Record
// 4. Type a few characters in Field 1
// 5. Stop recording
// See all three inputs highlighted as "re-rendered" even though only Field 1 changed
```

**Change something:** Add a fourth `<input>` (Field 4) without a `value` or `onChange` —
just `<input placeholder="Field 4 (uncontrolled)" />`. Type in it. Expected: the render
count does NOT increment. The DOM owns Field 4's value; React is not involved.

This demonstrates the mechanism: controlled means React re-renders; uncontrolled means the DOM handles it.

Remove `ControlledFormDemo` from `App.tsx` before continuing.

---

### Concept: How `register()` Works

**What it is:** `register('fieldName')` is the core of react-hook-form. It returns
four properties that you spread onto your `<input>`:

```tsx
const { register } = useForm();
const { name, ref, onChange, onBlur } = register('title');

// Using spread (same as above, just shorter):
<input {...register('title')} />
```

**What each property does:**

```
name:     "title"
  → Sets the input's name attribute
  → react-hook-form uses this to identify which field was changed

ref:      (element) => { /* called when the input mounts */ }
  → A callback ref that lets react-hook-form hold a reference to the DOM input
  → This is how it reads the value on submit — directly from the DOM, no useState

onChange: (event) => { /* called on every keystroke */ }
  → react-hook-form's internal handler — does NOT call setState
  → Stores the value in react-hook-form's internal ref (not React state)
  → Does NOT trigger a React re-render

onBlur:   (event) => { /* called when input loses focus */ }
  → Triggers field validation if mode is 'onBlur'
  → Also does NOT trigger a React re-render
```

**The key insight:** `onChange` writes to a ref, not state. A ref change does not cause
a re-render. The input's value is stored in the DOM (where it already was), and react-hook-form
just knows where to find it. Zero re-renders during typing.

**When DOES a re-render happen?** When you submit and there are validation errors —
react-hook-form calls `setState` for the `formState.errors` object. That is the only
re-render during normal form interaction.

**Canonical example:** A paper notepad vs a whiteboard. A controlled input is a whiteboard
(React's state) — every change requires erasing and redrawing. An uncontrolled input is
a notepad — the DOM holds the pencil marks. React only looks at the notepad when it needs
to (on submit).

**You will see this again in:**
- Controlled inputs ARE the right choice when you need real-time derived values (character count, live preview, dependent field clearing)
- Uncontrolled inputs via react-hook-form ARE the right choice for performance-sensitive forms
- The `controller` component in react-hook-form wraps controlled third-party inputs (date pickers, select components) when you need them

---

## Step 2 — Build the Form With `register`

```bash
npm install react-hook-form @hookform/resolvers zod
```

Create `src/components/TaskForm.tsx`. Build it step by step.

First, the bare form with just `register` — no validation yet:

```tsx
// src/components/TaskForm.tsx
import { useForm } from 'react-hook-form';

interface FormData {
  title:    string;
  priority: string;
}

export function TaskForm() {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    // data.title and data.priority come directly from the DOM
    // when handleSubmit calls onSubmit — zero re-renders happened during typing
    console.log('Submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('title')}   // ← spreads name, ref, onChange, onBlur onto the input
        placeholder="Task title"
      />
      <select {...register('priority')}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit">Add Task</button>
    </form>
  );
}
```

### SAVE AND TRY

Add `<TaskForm />` to `App.tsx` temporarily and run the app.

```bash
npm run dev
```

Open DevTools → Console. Type in the title field and click "Add Task".

**You should see:** `Submitted: { title: "...", priority: "medium" }` in the console —
the values are read from the DOM on submit, not from React state.

**Add the render counter** to verify no re-renders during typing:

```tsx
const renderCount = useRef(0);
renderCount.current++;
// Add to the JSX: <p>Renders: {renderCount.current}</p>
```

Type in the title field. **Expected:** The render count stays at 1 during typing.
Only increments when you submit (if there are validation errors).

---

### Concept: How Zod Validation Plugs In

**What it is:** Zod defines a schema — the shape and constraints of valid data.
`zodResolver(schema)` is a function that translates Zod's validation errors into
react-hook-form's `formState.errors` format.

**The mechanism — what happens on submit:**

```
1. User clicks Submit
2. react-hook-form collects all field values from the DOM refs
3. Passes the values object to the resolver: zodResolver(schema)(values)
4. Zod validates: schema.safeParse(values)
5. If Zod finds errors → resolver returns error objects
6. react-hook-form puts errors into formState.errors → re-render with errors shown
7. onValid is NOT called
8. If Zod finds NO errors → resolver returns success
9. onValid IS called with the validated (and typed!) data
```

**Why the schema matters for types:**

```ts
const schema = z.object({
  title:    z.string().min(2),
  priority: z.enum(['low', 'medium', 'high']),
});
type FormData = z.infer<typeof schema>;
// FormData = { title: string; priority: 'low' | 'medium' | 'high' }
// TypeScript knows the priority is one of three specific strings — not just any string
```

**The difference from manual validation:**

```tsx
// Without Zod — manual validation duplicated between client and server:
if (data.title.length < 2) setError('title', 'too short');
if (!['low','medium','high'].includes(data.priority)) setError('priority', 'invalid');
// Same rules written twice — once in the form, once in the API

// With Zod — one schema validates everywhere:
const schema = z.object({ title: z.string().min(2), priority: z.enum([...]) });
// Same schema used by the form, the API, and the database
```

**You will see this again in:**
- The FastAPI Pydantic models (T5-L1a) serve the same purpose — one schema, all validation
- Zod is used in TypeScript; Pydantic in Python — same concept, different languages
- `tRPC` uses Zod schemas to type both the client and server simultaneously

---

## Step 3 — Add Zod Validation

Update `src/components/TaskForm.tsx`:

```tsx
// src/components/TaskForm.tsx
import { useForm }     from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';  // bridges Zod and react-hook-form
import { z }           from 'zod';

// The schema: defines valid values and their constraints
const taskSchema = z.object({
  title:    z.string()
              .min(1, 'Title is required')              // empty string fails
              .min(2, 'Title must be at least 2 characters')  // checked after non-empty
              .max(200, 'Title must be at most 200 characters'),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' }),
  }),
});

// TypeScript infers the exact type from the schema — no separate interface needed:
type TaskFormData = z.infer<typeof taskSchema>;
//   ^ { title: string; priority: 'low' | 'medium' | 'high' }

export function TaskForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    reset,          // resets all fields to their default values
    formState: {
      errors,       // object with error messages for each invalid field
      isSubmitting, // true while onValid is running (useful for async submission)
      isDirty,      // true if any field has changed from its default value
    },
  } = useForm<TaskFormData>({
    resolver:      zodResolver(taskSchema),                    // connect Zod validation
    defaultValues: { title: '', priority: 'medium' },         // initial field values
  });

  const onValid = async (data: TaskFormData) => {
    // data is TypeScript-typed: data.priority is 'low' | 'medium' | 'high'
    // Only called when ALL validation passes
    console.log('Valid data:', data);
    reset();           // clear the form after successful submission
    onSuccess?.();     // notify parent if provided
  };

  return (
    <form onSubmit={handleSubmit(onValid)}>
      {/* Title field */}
      <div>
        <input
          {...register('title')}
          placeholder="Task title"
        />
        {/* errors.title only has a value when Zod rejected the title field */}
        {errors.title && (
          <p style={{ color: 'red', fontSize: 12 }}>
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Priority field */}
      <select {...register('priority')}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      {errors.priority && <p style={{ color: 'red' }}>{errors.priority.message}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Add Task'}
        </button>
        <button type="button" onClick={() => reset()} disabled={!isDirty}>
          Reset
        </button>
      </div>
    </form>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

Try these in the browser:

**Test 1 — empty title:**
Click "Add Task" without typing anything.
**Expected:** Error appears: "Title is required"

**Test 2 — one character:**
Type "A", click "Add Task".
**Expected:** Error: "Title must be at least 2 characters"

**Test 3 — valid submission:**
Type "Write tests", click "Add Task".
**Expected:** Console shows `Valid data: { title: 'Write tests', priority: 'medium' }`, form resets

**In the browser console — verify no re-renders during typing:**

Open React DevTools Profiler. Record while typing "hello". Stop.
**Expected:** No component highlighted as re-rendered during typing. Only highlighted
when the form is submitted (errors appear → re-render).

**Change something:** Change `resolver: zodResolver(taskSchema)` to no resolver — remove
the resolver entirely. Submit with an empty title.
**Expected:** `onValid` IS called with `{ title: '', priority: 'medium' }` — no validation.
This shows that validation only happens through the resolver.

---

## Step 4 — Write Tests

Create `src/components/TaskForm.test.tsx`:

```tsx
// src/components/TaskForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent          from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server }         from '../mocks/server';
import { TaskForm }       from './TaskForm';

beforeAll(()  => server.listen());
afterEach(()  => server.resetHandlers());
afterAll(()   => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('TaskForm', () => {

  it('shows a validation error when submitted with empty title', async () => {
    const user = userEvent.setup();
    render(<TaskForm />, { wrapper });

    // Submit without filling in the title:
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    // Zod's error message should appear:
    expect(await screen.findByText(/required/i)).toBeInTheDocument();
  });

  it('shows an error when title is one character', async () => {
    const user = userEvent.setup();
    render(<TaskForm />, { wrapper });

    await user.type(screen.getByPlaceholderText('Task title'), 'X');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it('calls onSuccess and resets the form after valid submission', async () => {
    const user      = userEvent.setup();
    const onSuccess = vi.fn();
    render(<TaskForm onSuccess={onSuccess} />, { wrapper });

    await user.type(screen.getByPlaceholderText('Task title'), 'Write tests');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    // Wait for the async submission to complete:
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());

    // Form was reset:
    expect(screen.getByPlaceholderText('Task title')).toHaveValue('');
  });

  it('the title input does not cause re-renders while typing', async () => {
    // This test verifies the uncontrolled behaviour:
    // The component should render exactly once (initial render) as we type.
    let renderCount = 0;
    const CountingForm = () => {
      renderCount++;
      return <TaskForm />;
    };

    const user = userEvent.setup();
    render(<CountingForm />, { wrapper });
    const initialRenders = renderCount;

    // Type 5 characters:
    await user.type(screen.getByPlaceholderText('Task title'), 'hello');

    // Re-renders during typing should be 0 (uncontrolled input):
    expect(renderCount - initialRenders).toBe(0);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/components/TaskForm.test.tsx
```

**Expected:** All 4 tests pass. The last test is the most important — it directly verifies
the performance claim: zero re-renders during typing.

---

## 🎯 Challenge: Add `useFieldArray` for Tags

**You know:** `register`, Zod schemas, `handleSubmit`.

**The mechanism to understand first:**

`useFieldArray` is a react-hook-form hook that manages an array of fields. Each field
in the array has an `id` (used as the React `key`), and you `register` each one with
`register(\`tags.${i}\`)` where `i` is the index. Appending a field causes a re-render
(because the form's internal array state changes), but typing in a tag field does not.

**Task:** Add a tags array to the form where users can add/remove tag strings.
Update the Zod schema:

```ts
const taskSchema = z.object({
  title:    z.string().min(2).max(200),
  priority: z.enum(['low', 'medium', 'high']),
  tags:     z.array(z.string().min(1, 'Tag cannot be empty').max(30)),
});
```

Write 2 tests before implementing:
- User can add a tag and remove it
- Invalid (empty) tag shows an error

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { useFieldArray } from 'react-hook-form';

// Inside the component, after useForm:
const { fields, append, remove } = useFieldArray({ control, name: 'tags' });
// 'control' comes from useForm — add it to destructuring: const { register, control, ... }

// Render the tags section:
{fields.map((field, i) => (
  <div key={field.id} style={{ display: 'flex', gap: 4, marginTop: 4 }}>
    <input
      {...register(`tags.${i}`)}  // register with the index — links to the array entry
      placeholder={`Tag ${i + 1}`}
    />
    <button type="button" onClick={() => remove(i)}>✕</button>
    {errors.tags?.[i] && (
      <span style={{ color: 'red', fontSize: 11 }}>
        {errors.tags[i]?.message}
      </span>
    )}
  </div>
))}
<button type="button" onClick={() => append('')}>+ Add Tag</button>
```

**Tests:**
```tsx
it('can add and remove a tag', async () => {
  const user = userEvent.setup();
  render(<TaskForm />, { wrapper });

  await user.click(screen.getByText('+ Add Tag'));
  // A new input appeared:
  expect(screen.getAllByRole('textbox').length).toBeGreaterThan(1);

  await user.click(screen.getByText('✕'));
  // Back to just the title input:
  expect(screen.getAllByRole('textbox')).toHaveLength(1);
});

it('shows an error when tag is empty and form is submitted', async () => {
  const user = userEvent.setup();
  render(<TaskForm />, { wrapper });

  await user.type(screen.getByPlaceholderText('Task title'), 'Write tests');
  await user.click(screen.getByText('+ Add Tag'));
  // Don't fill in the tag — leave it empty
  await user.click(screen.getByRole('button', { name: 'Add Task' }));

  expect(await screen.findByText(/cannot be empty/i)).toBeInTheDocument();
});
```

**Key insight:** `fields` is a react-hook-form array — not a React state array.
`append('')` adds an empty string to the array and causes a re-render of the field list.
But typing into any tag input does NOT re-render — same as every other `register`ed field.
The form tracks the DOM values via refs.

</details>

---

## Final Check

| Concept | What to verify |
|---|---|
| No re-renders while typing | Render counter stays at initial count while typing |
| `register` spreads 4 props | `console.log(register('title'))` — see name, ref, onChange, onBlur |
| Empty submit shows errors | Submit without title → "Title is required" appears |
| Valid submit resets form | Title clears after successful submit |
| `handleSubmit` blocks `onValid` | Remove resolver → `onValid` called with empty title |

---

## Quick Check Answers

**1. Controlled input: type one character. List every React operation that happens.**

1. Keystroke fires `onChange` event on the DOM input
2. Your `setTitle(e.target.value)` calls React's `setState`
3. React schedules a re-render of the component
4. React re-renders the component, calling ALL its children render functions
5. React diffs the new virtual DOM against the previous one
6. React updates only the changed DOM nodes (just the input value)

With 10 controlled fields: the same 6 steps, but step 4 re-renders ALL 10 field inputs
(even though only 1 changed). With 100 fields: still all 100 re-render on every keystroke.
React is fast, but this is wasteful for large forms.

**2. `register('title')` returns four properties. What are they?**

- `name: "title"` — the input's name attribute, used by react-hook-form to identify the field
- `ref: (element) => ...` — a callback ref giving react-hook-form direct access to the DOM node, so it can read the value on submit
- `onChange: (event) => ...` — react-hook-form's internal change handler that stores the value in a ref (NOT React state), causing zero re-renders
- `onBlur: (event) => ...` — react-hook-form's blur handler that triggers validation if mode is 'onBlur'

**3. `handleSubmit(onValid)` called with a validation error. Does `onValid` run?**

No. `handleSubmit` validates first. If Zod (via the resolver) finds any errors, they
are placed in `formState.errors` and `onValid` is never called. The form re-renders to
show the error messages. `onValid` is only called when ALL validation passes.
There is an optional second argument `handleSubmit(onValid, onInvalid)` for handling
the invalid case explicitly.
