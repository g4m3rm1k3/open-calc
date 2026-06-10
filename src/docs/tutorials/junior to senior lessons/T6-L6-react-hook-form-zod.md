# Junior to Senior — T6·L6 — react-hook-form and Zod

**Prerequisites:** T6·L5 (Custom Hooks). You can extract reusable hook logic.
This lesson adds form management — the right way to handle validation, submission,
and error display without performance anti-patterns.

**What this lab adds:**
- `useForm` with a Zod resolver — typed form with schema validation
- `register('field')` — connecting inputs to the form
- `handleSubmit(onValid, onInvalid)` — validating before calling your handler
- `formState.errors` — per-field error messages
- Controlled vs uncontrolled — why react-hook-form defaults to uncontrolled

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a 10-field form where every `<input>` is a controlled component
>    (value + onChange). The user types one character. How many re-renders occur?
> 2. `formState.errors.email?.message` — what is this and when does it have a value?
> 3. `handleSubmit(onValid)` — the form has validation errors. Is `onValid` called?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A task creation form with full validation:

```tsx
// Validation rules enforced before submission:
// - title: 2–200 chars, not whitespace only
// - priority: must be 'low', 'medium', or 'high'
// - due_date: optional, but must be today or future if provided
//
// Errors shown inline under each field:
// "Title must be at least 2 characters"
// "Invalid date — must be today or in the future"
```

---

### Concept: Controlled vs Uncontrolled

**Controlled input:** React owns the value. Every keystroke triggers a `setState`,
which triggers a render.

```tsx
// Controlled — re-renders on every keystroke in every field:
const [title, setTitle] = useState('');
<input value={title} onChange={e => setTitle(e.target.value)} />
```

**Uncontrolled input:** The DOM owns the value. React only reads it when needed
(on blur, on submit). No re-renders during typing.

```tsx
// Uncontrolled — zero re-renders during typing:
const ref = useRef<HTMLInputElement>(null);
<input ref={ref} defaultValue="" />
// Read on submit: ref.current?.value
```

**react-hook-form defaults to uncontrolled.** This is why it is fast — a 50-field
form with react-hook-form has the same performance as one with 1 field. All
validation, dirty tracking, and error state are managed without re-renders.

---

### Concept: Zod Schema + `useForm`

```tsx
import { z }           from 'zod';
import { useForm }     from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const taskSchema = z.object({
  title:    z.string().min(2, 'Title must be at least 2 characters')
                      .max(200, 'Title must be at most 200 characters')
                      .trim(),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' }),
  }),
  due_date: z.string().optional().refine(
    val => !val || new Date(val) >= new Date(new Date().toDateString()),
    { message: 'Due date must be today or in the future' }
  ),
});

type TaskFormData = z.infer<typeof taskSchema>;

function TaskForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskFormData>({
    resolver:      zodResolver(taskSchema),
    defaultValues: { title: '', priority: 'medium' },
  });

  const onValid = async (data: TaskFormData) => {
    await createTask(data);   // only called when form is valid
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <div>
        <input
          {...register('title')}
          placeholder="Task title"
        />
        {errors.title && <p style={{ color: 'red' }}>{errors.title.message}</p>}
      </div>
      <select {...register('priority')}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      {errors.priority && <p style={{ color: 'red' }}>{errors.priority.message}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Add Task'}
      </button>
    </form>
  );
}
```

---

## Step 1 — Build the Form

```bash
npm install react-hook-form @hookform/resolvers zod
```

Create `src/components/TaskForm.tsx`:

```tsx
import { z }           from 'zod';
import { useForm }     from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTask } from '../hooks/useTaskMutations';

const taskSchema = z.object({
  title:    z.string()
              .min(1, 'Title is required')
              .min(2, 'Title must be at least 2 characters')
              .max(200, 'Title must be at most 200 characters'),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TaskFormData>({
    resolver:      zodResolver(taskSchema),
    defaultValues: { title: '', priority: 'medium', due_date: '' },
  });

  const onValid = async (data: TaskFormData) => {
    await createTask.mutateAsync({
      title:    data.title,
      priority: data.priority,
    });
    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onValid)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <input
          {...register('title')}
          placeholder="Task title"
          style={{ width: '100%', padding: '6px 10px' }}
        />
        {errors.title && (
          <p style={{ color: 'red', margin: '2px 0', fontSize: 12 }}>
            {errors.title.message}
          </p>
        )}
      </div>

      <select {...register('priority')}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <div>
        <input type="date" {...register('due_date')} />
        {errors.due_date && (
          <p style={{ color: 'red', margin: '2px 0', fontSize: 12 }}>
            {errors.due_date.message}
          </p>
        )}
      </div>

      {createTask.isError && (
        <p style={{ color: 'red' }}>Failed to add task. Please try again.</p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={isSubmitting || createTask.isPending}>
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

---

## Step 2 — Write Tests

Create `src/components/TaskForm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent          from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server }         from '../mocks/server';
import { TaskForm }       from './TaskForm';

beforeAll(()  => server.listen());
afterEach(()  => server.resetHandlers());
afterAll(()   => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('TaskForm', () => {

  it('renders the form fields', () => {
    render(<TaskForm />, { wrapper });
    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
  });

  it('shows a validation error when title is empty', async () => {
    const user = userEvent.setup();
    render(<TaskForm />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(await screen.findByText(/required/i)).toBeInTheDocument();
  });

  it('shows a validation error when title is too short', async () => {
    const user = userEvent.setup();
    render(<TaskForm />, { wrapper });

    await user.type(screen.getByPlaceholderText('Task title'), 'X');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it('submits valid form data and resets', async () => {
    const user      = userEvent.setup();
    const onSuccess = vi.fn();
    render(<TaskForm onSuccess={onSuccess} />, { wrapper });

    await user.type(screen.getByPlaceholderText('Task title'), 'Write tests');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    // Form is reset — input is empty:
    expect(screen.getByPlaceholderText('Task title')).toHaveValue('');
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Add a `useFieldArray` Dynamic List

**You know:** `useForm`, `register`, Zod schemas.

**Task:** Add a tags field to the form where users can add/remove tags:

```
Tags: [backend] [frontend] [urgent] [+ Add Tag]
```

Use `useFieldArray` from react-hook-form. The tags are an array of strings.
Validate that each tag is 2–30 characters.

Write 2 tests before implementing.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { useFieldArray } from 'react-hook-form';

// Updated schema:
const taskSchema = z.object({
  title:    z.string().min(2).max(200),
  priority: z.enum(['low', 'medium', 'high']),
  tags:     z.array(z.string().min(2, 'Tag must be at least 2 chars').max(30)),
});

// Inside the form component:
const { fields, append, remove } = useFieldArray({ control, name: 'tags' });

// Render:
{fields.map((field, i) => (
  <div key={field.id} style={{ display: 'flex', gap: 4 }}>
    <input {...register(`tags.${i}`)} />
    <button type="button" onClick={() => remove(i)}>✕</button>
    {errors.tags?.[i] && <span style={{color:'red'}}>{errors.tags[i]?.message}</span>}
  </div>
))}
<button type="button" onClick={() => append('')}>+ Add Tag</button>
```

**Tests:**
```tsx
it('can add and remove tags', async () => {
  const user = userEvent.setup();
  render(<TaskForm />, { wrapper });

  await user.click(screen.getByText('+ Add Tag'));
  expect(screen.getAllByRole('textbox').length).toBeGreaterThan(1);

  await user.click(screen.getByText('✕'));
  // Only the title input remains:
  expect(screen.getAllByRole('textbox')).toHaveLength(1);
});

it('validates tag length', async () => {
  const user = userEvent.setup();
  render(<TaskForm />, { wrapper });

  await user.click(screen.getByText('+ Add Tag'));
  const tagInput = screen.getAllByRole('textbox')[1];
  await user.type(tagInput, 'x');  // too short

  await user.type(screen.getByPlaceholderText('Task title'), 'Write tests');
  await user.click(screen.getByRole('button', { name: 'Add Task' }));

  expect(await screen.findByText(/at least 2 chars/i)).toBeInTheDocument();
});
```

</details>

---

## Final Check

| Concept | Verify |
|---|---|
| Uncontrolled by default | Add `console.log` in component — typing does not cause re-render |
| Zod validation | Submit empty form — error messages from Zod schema appear |
| `handleSubmit` blocks invalid | `onValid` not called when there are errors |
| `isSubmitting` disables button | Button disabled during async submit |
| `reset()` clears form | After success, all fields return to default values |

---

## Quick Check Answers

**1. 10-field controlled form, user types one char. How many re-renders?**

At minimum, 1 re-render for the component that holds the state (or for each
controlled input if state is distributed). Typically, the entire form component
re-renders — including all 10 fields — even though only one value changed. With
react-hook-form (uncontrolled), typing causes zero component re-renders. Validation
can still run on each keystroke via `mode: 'onChange'`, but the DOM is updated
directly without React involvement.

**2. `formState.errors.email?.message` — what is it and when does it have a value?**

It is the validation error message for the `email` field, as a string. It has a
value when the `email` field has failed validation — either from Zod schema
validation, a built-in HTML5 validation rule, or a custom `validate` function.
It is `undefined` when the field has passed validation or has not been validated yet.

**3. `handleSubmit(onValid)` — form has errors. Is `onValid` called?**

No. `handleSubmit` runs validation first. If any field fails validation, `onValid`
is not called. The errors are written to `formState.errors`. An optional second
argument `handleSubmit(onValid, onInvalid)` allows you to handle the invalid case
explicitly (e.g., scroll to the first error, focus it, show a toast).
