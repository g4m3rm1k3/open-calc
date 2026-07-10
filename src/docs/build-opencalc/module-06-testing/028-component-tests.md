# 028 — Component Tests

*Testing user-visible behaviour, rendering, interaction, and what the Testing Library philosophy means*

---

## What You Will Build

You will write component tests for `CalculatorDisplay` and `HistoryPanel`. The tests will verify: correct rendering for different prop values, conditional rendering (error state), and behaviour when a button is clicked. You will use `@testing-library/react` and learn the Testing Library philosophy: test what users see, not what the code does.

---

## What You Need to Know First

Lesson 026 — What Tests Are For. Vitest, jsdom, and @testing-library are installed and configured.

Lesson 027 — Unit Tests. You are comfortable with describe/it/expect.

Lesson 009 — React Components. `CalculatorDisplay` and `HistoryPanel` are the components under test.

---

## The Lesson

### The Testing Library philosophy

`@testing-library/react` is built around a philosophy: **test what users see, not implementation details.**

Traditional React testing tools allowed you to:
- Find a component by its class name
- Check which React props were passed
- Call component methods directly
- Access component internal state

All of these are implementation details. When you refactor (rename a CSS class, move state, extract a subcomponent), the tests break even though the user experience is identical.

Testing Library's approach:
- Find elements by their accessible role (`role="button"`, `role="heading"`)
- Find elements by their visible text
- Simulate user interactions (click, type, press)
- Assert what is visible on screen

When you refactor but preserve the UI, the tests pass. When the UI changes, the tests fail — correctly, because the user experience changed.

---

**CS lens — the semantic query hierarchy:**

Testing Library provides queries in a priority order, from most accessible to least:

1. **By role** — `getByRole('button', { name: /Launch Lab/i })` — the element's semantic role and accessible name. Most accessible; what screen readers use.
2. **By label** — `getByLabelText('Email address')` — matches form inputs to their `<label>` elements. Requires correct `htmlFor`/`id` wiring.
3. **By placeholder** — `getByPlaceholderText('Enter email')` — lower priority; placeholder text is not always visible.
4. **By text** — `getByText('Launch Lab')` — matches visible text. Most common.
5. **By display value** — `getByDisplayValue('Calculator')` — for form input current values.
6. **By alt text** — `getByAltText('Logo')` — for images with alt attributes.
7. **By title** — `getByTitle('Close')` — for elements with title attributes.
8. **By test ID** — `getByTestId('calculator-display')` — requires `data-testid` attribute in the component. Last resort; implementation detail.

The hierarchy matters: if you test by role first, your tests verify that the DOM is semantically correct (accessible to screen readers). Testing by test ID bypasses all accessibility checks.

---

**SE lens — component tests vs unit tests vs E2E tests:**

Component tests (also called "integration tests" in the context of React) sit between unit tests and E2E tests:

| | Unit | Component | E2E |
|---|---|---|---|
| Scope | One function | One component (+ children) | Full application |
| DOM | No | Simulated (jsdom) | Real browser |
| Speed | 1ms | 10-50ms | 500ms+ |
| Fragility | Low | Medium | High |
| Confidence | Logic correct | Component renders correctly | System works |

A unit test verifies `evaluateExpression('1+2').value === '3'`. A component test verifies that after clicking the "1", "+", "2" buttons and "=" in `<Calculator>`, the display shows "3". An E2E test verifies that navigating to the calculator lab and doing the same shows "3" in the real browser.

Each level is valuable. Component tests give the highest confidence relative to their cost for UI components. For the open-calc platform, most tests are component tests for individual labs.

---

### Test CalculatorDisplay

Create `src/CalculatorDisplay.test.tsx`:

```tsx
// src/CalculatorDisplay.test.tsx

import { render, screen } from '@testing-library/react'
import CalculatorDisplay from './CalculatorDisplay.js'

describe('CalculatorDisplay', () => {

  describe('when there is no expression', () => {

    it('shows "0" in the display', () => {
      render(<CalculatorDisplay expression="" isError={false} />)
      // The display area shows '0' when expression is empty
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('shows no expression preview', () => {
      render(<CalculatorDisplay expression="" isError={false} />)
      // The preview line (expression + " =") should not be visible
      expect(screen.queryByText(/=/)).not.toBeInTheDocument()
    })

  })

  describe('when there is an expression', () => {

    it('shows the expression in the display', () => {
      render(<CalculatorDisplay expression="123+45" isError={false} />)
      expect(screen.getByText('123+45')).toBeInTheDocument()
    })

    it('shows the expression preview with equals sign', () => {
      render(<CalculatorDisplay expression="123+45" isError={false} />)
      expect(screen.getByText('123+45 =')).toBeInTheDocument()
    })

  })

  describe('when isError is true', () => {

    it('shows "Error" in the display', () => {
      render(<CalculatorDisplay expression="" isError={true} />)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('does not show "0" when in error state', () => {
      render(<CalculatorDisplay expression="" isError={true} />)
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

  })

})
```

**Walkthrough:**

`import { render, screen } from '@testing-library/react'` — the two most-used Testing Library exports:
- `render` — mounts a component into a jsdom document. Returns utilities for querying the rendered output.
- `screen` — the global query interface. `screen.getByText`, `screen.getByRole`, etc. search the currently rendered DOM.

`render(<CalculatorDisplay expression="" isError={false} />)` — mounts the component. The JSX is valid in a `.tsx` test file. Vite's TypeScript support handles JSX in test files.

`screen.getByText('0')` — finds an element whose text content exactly matches `'0'`. Returns the DOM element. Throws if no element matches (test fails with a clear message: "Unable to find element with text: 0").

`.toBeInTheDocument()` — a `@testing-library/jest-dom` matcher. Asserts that the element is in the document (was found and is present). This is the basic assertion: "this thing is visible."

`screen.queryByText(/=/)` — `queryByText` returns `null` if no element matches (instead of throwing). Use `queryBy*` when you expect no match — the assertion `.not.toBeInTheDocument()` checks that the result is null.

`/=/` — a regular expression. Matches any text containing `=`. More flexible than an exact string match.

---

**CS lens — the render-query-assert pattern:**

Every component test follows the **arrange-act-assert** pattern (also called AAA or render-query-assert for Testing Library):

1. **Arrange** — set up the test state: `render(<Component props... />)`
2. **Act** — perform an action (for display-only tests, rendering is the action)
3. **Assert** — verify the result: `expect(screen.getByText('...')).toBeInTheDocument()`

For interactive tests, the Act step is explicit:

```typescript
// Arrange
render(<HistoryPanel history={[...]} onClear={vi.fn()} />)

// Act
await userEvent.click(screen.getByText('Clear'))

// Assert
expect(onClear).toHaveBeenCalledOnce()
```

Keeping tests in this three-part structure makes them readable: setup, action, verification.

---

### Test HistoryPanel with interactions

Create `src/HistoryPanel.test.tsx`:

```tsx
// src/HistoryPanel.test.tsx

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HistoryPanel from './HistoryPanel.js'
import type { HistoryEntry } from './types.js'

const sampleHistory: HistoryEntry[] = [
  { id: 1, expression: '1+2',  result: '3'  },
  { id: 2, expression: '10*5', result: '50' },
  { id: 3, expression: '9/3',  result: '3'  },
]

describe('HistoryPanel', () => {

  describe('when history is empty', () => {

    it('shows the empty state message', () => {
      render(<HistoryPanel history={[]} onClear={vi.fn()} />)
      expect(screen.getByText('No calculations yet')).toBeInTheDocument()
    })

    it('does not show the Clear button when empty', () => {
      render(<HistoryPanel history={[]} onClear={vi.fn()} />)
      expect(screen.queryByText('Clear')).not.toBeInTheDocument()
    })

  })

  describe('when history has entries', () => {

    it('shows each expression and result', () => {
      render(<HistoryPanel history={sampleHistory} onClear={vi.fn()} />)

      // Each entry should show: expression = result
      expect(screen.getByText('1+2 =')).toBeInTheDocument()
      expect(screen.getByText('10*5 =')).toBeInTheDocument()
      expect(screen.getByText('9/3 =')).toBeInTheDocument()

      // Results — there are two '3' results, so use getAllByText
      const results = screen.getAllByText('3')
      expect(results).toHaveLength(2)

      expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('shows the entry count in the header', () => {
      render(<HistoryPanel history={sampleHistory} onClear={vi.fn()} />)
      expect(screen.getByText(/History \(3\)/)).toBeInTheDocument()
    })

    it('shows the Clear button', () => {
      render(<HistoryPanel history={sampleHistory} onClear={vi.fn()} />)
      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('shows entries in reverse order (most recent first)', () => {
      render(<HistoryPanel history={sampleHistory} onClear={vi.fn()} />)

      // Get all expression text elements in DOM order
      const expressionTexts = screen.getAllByText(/=/)
        .map((el) => el.textContent ?? '')

      // Most recent (id: 3, expression: '9/3') should appear first
      expect(expressionTexts[0]).toContain('9/3')
      expect(expressionTexts[2]).toContain('1+2')
    })

  })

  describe('when the Clear button is clicked', () => {

    it('calls onClear', async () => {
      const onClear = vi.fn()
      render(<HistoryPanel history={sampleHistory} onClear={onClear} />)

      await userEvent.click(screen.getByText('Clear'))

      expect(onClear).toHaveBeenCalledOnce()
    })

    it('calls onClear exactly once even if clicked rapidly', async () => {
      const onClear = vi.fn()
      render(<HistoryPanel history={sampleHistory} onClear={onClear} />)

      const clearButton = screen.getByText('Clear')
      await userEvent.click(clearButton)
      await userEvent.click(clearButton)

      expect(onClear).toHaveBeenCalledTimes(2)
    })

  })

})
```

**Walkthrough:**

`const sampleHistory: HistoryEntry[] = [...]` — test data defined at module scope. Shared across all tests in the file. TypeScript types the array; each entry matches `HistoryEntry`.

`vi.fn()` — Vitest's mock function factory. Creates a function that records calls (how many times called, with what arguments). Used for `onClear` — we do not want real cleanup logic in tests, just verification that `onClear` was called.

`await userEvent.click(screen.getByText('Clear'))` — `userEvent.click` simulates a real user click: it fires `pointerdown`, `pointerup`, `click` events in sequence. `async/await` is required because `userEvent` operations are asynchronous (they flush event queues and allow React to process state updates).

`fireEvent.click` (the older alternative) fires only `click` — no pointer events. `userEvent` is more accurate to real user behaviour. Use `userEvent` for most interactions.

`expect(onClear).toHaveBeenCalledOnce()` — asserts the mock function was called exactly once. `toHaveBeenCalledTimes(n)` for other counts.

`screen.getAllByText('3')` — returns an array of all elements whose text is `'3'`. When the same text appears multiple times (both entries have result `'3'`), use `getAll*` instead of `get*` to avoid an error ("Found multiple elements with text: 3").

`screen.getAllByText(/=/).map(el => el.textContent)` — finds all elements whose text matches `/=/` (contains `=`), then maps to their text content. Used to verify ordering: which expression appears first in the DOM.

`.toContain('9/3')` — asserts that a string contains the substring. More flexible than exact equality.

---

**CS lens — the jsdom render tree:**

When `render(<HistoryPanel history={sampleHistory} onClear={vi.fn()} />)` runs:

1. `@testing-library/react` creates a `div` in the jsdom document
2. React's renderer mounts `HistoryPanel` into that `div`
3. React runs the component function, which returns JSX
4. React converts the JSX to DOM nodes in jsdom
5. `screen` queries search those DOM nodes

The jsdom DOM is not a real browser DOM — it does not compute CSS layout (no `getBoundingClientRect()`), does not render pixels, and does not run web APIs like `WebSocket` or `canvas`. But it does implement all the DOM tree APIs (`getElementById`, `getElementsByTagName`, event dispatching) accurately.

Testing Library queries search the jsdom DOM using the same algorithms that screen readers use. This is why role-based queries are preferred: `getByRole('button', { name: /Clear/ })` queries the accessibility tree — the semantic representation that screen readers use — not the implementation.

---

### Run the component tests

```bash
npm run test:run
```

Expected output:

```
 ✓ src/calc-engine.test.ts (25)
 ✓ src/CalculatorDisplay.test.tsx (6)
 ✓ src/HistoryPanel.test.tsx (8)

Test Files  3 passed (3)
Tests       39 passed (39)
```

The component tests are slower than unit tests (unit: ~1ms each; component: ~10-30ms each) because of the jsdom setup per component. Total time should still be under 5 seconds.

---

**SE lens — test organisation in a growing project:**

As the test suite grows, organisation matters. Two common structures:

**Co-located tests** (this series):
```
src/
├── CalculatorDisplay.tsx
├── CalculatorDisplay.test.tsx
├── HistoryPanel.tsx
├── HistoryPanel.test.tsx
├── calc-engine.ts
└── calc-engine.test.ts
```

Tests live next to the files they test. Advantages: easy to find the test for a file, deleted files and deleted tests are co-located. Disadvantages: `src/` directory has more files.

**`__tests__` directory:**
```
src/
├── components/
│   ├── CalculatorDisplay.tsx
│   └── HistoryPanel.tsx
├── __tests__/
│   ├── CalculatorDisplay.test.tsx
│   └── HistoryPanel.test.tsx
└── calc-engine.ts
```

Tests in a separate directory. Advantages: production code and test code are separated. Disadvantages: harder to find the test for a file when directories differ.

Both are valid. Co-location is the most common pattern in React projects.

---

**CS lens — mocking in component tests:**

Some components depend on modules that cannot run in a test environment (localStorage, fetch, external services). Testing Library does not mock these automatically.

For localStorage: jsdom implements `localStorage`, so no mock is needed for the calculator's localStorage persistence. However, tests must reset localStorage between tests to prevent state leakage:

```typescript
beforeEach(() => {
  localStorage.clear()
})
```

For network requests: use `vi.mock('./api')` to replace the module with a mock, or use Mock Service Worker (MSW) to intercept fetch requests.

For the registry: tests that render `LabPage` need the registry to have entries. Either import the registration files (side effect import) or mock `getComponent`:

```typescript
vi.mock('./registry', () => ({
  getComponent: vi.fn().mockReturnValue(null),
  getAllLabs: vi.fn().mockReturnValue([]),
}))
```

`vi.mock('./registry', factory)` — replaces the module at `./registry` with the object returned by the factory. Every test that imports `./registry` gets the mock instead. Mocking is an escape hatch for external dependencies; use real code where possible.

---

## Connect the Pieces

**Connection to lesson 026:** The unit tests from lesson 026 and 027 and the component tests from this lesson all run together with `npm run test:run`. One command, three test files, 39 tests.

**Connection to lesson 024:** TypeScript props interfaces make component tests type-safe. `render(<CalculatorDisplay expression={42} />)` is a TypeScript error (expression must be `string`). The test suite is also type-checked.

**Connection to lesson 009:** Component tests test the same component API (props and rendered output) that composition tests in lesson 009 used. The difference: lesson 009 verified by looking in a browser; lesson 028 verifies automatically, every time.

**Connection to the full series:** After 28 lessons, the platform has:
- A typed component library (`CalculatorDisplay`, `HistoryPanel`, `LabCard`)
- A tested calculation engine (`calc-engine.ts`)
- A lab registry with one registered lab
- SPA routing with React Router
- Lazy-loaded lab components
- A persistent shell with sidebar and notifications

This is not a complete production platform, but it has the correct architecture for one. Every architectural pattern introduced (registry, shell, lazy loading, typed contracts) is used in the real open-calc platform that it mirrors.

---

## What Breaks Without This

**Finding elements by class name (fragile query):**

```typescript
const display = document.querySelector('.calc-display')
expect(display?.textContent).toBe('0')
```

This finds the element by CSS class. When you rename the class (during a CSS refactor), the test breaks. The component rendered correctly; only the test broke. Use semantic queries instead.

**Not awaiting userEvent:**

```typescript
// Wrong — no await
userEvent.click(screen.getByText('Clear'))
expect(onClear).toHaveBeenCalledOnce()

// The assertion runs before the click completes
// Test may pass intermittently (race condition)
```

`userEvent` is asynchronous. Always `await userEvent.click(...)`. Without `await`, the assertion runs before React processes the click event, producing a false negative (test fails) or a flaky test (passes sometimes, fails sometimes).

**Snapshot tests (over-use):**

```typescript
it('renders correctly', () => {
  const { container } = render(<HistoryPanel history={[]} onClear={vi.fn()} />)
  expect(container).toMatchSnapshot()
})
```

Snapshot tests capture the full rendered HTML and compare on every run. They break on any rendering change — even whitespace. They accumulate and require frequent "snapshot updates" that developers approve without reading. Snapshot tests add maintenance cost with little confidence benefit. Use explicit assertions instead: `expect(screen.getByText('No calculations yet')).toBeInTheDocument()` is more meaningful than a 200-line snapshot.

---

## Definition of Done

- [ ] `src/CalculatorDisplay.test.tsx` exists with 6 tests covering empty state, expression display, and error state
- [ ] `src/HistoryPanel.test.tsx` exists with 8 tests covering empty state, entry display, ordering, and Clear interaction
- [ ] `npm run test:run` reports all 39 tests passing (25 unit + 6 + 8 component)
- [ ] You can explain the difference between `getByText` and `queryByText`
- [ ] You can explain why `await` is required before `userEvent.click`
- [ ] You can explain the Testing Library priority for queries (role → label → text → testId)
- [ ] You can explain why snapshot tests are fragile and when to avoid them
- [ ] You can explain the difference between `vi.fn()` and a real implementation in tests
- [ ] Git commit:
    ```
    git add src/CalculatorDisplay.test.tsx src/HistoryPanel.test.tsx
    git commit -m "Add component tests: CalculatorDisplay and HistoryPanel

    CalculatorDisplay: 6 tests covering empty/expression/error states.
    HistoryPanel: 8 tests covering empty state, entries, ordering, Clear click.
    Total: 39 tests (25 unit + 14 component), all passing.
    Tests follow Testing Library philosophy: query by text, assert visibility."
    ```

---

## Series Complete

You have built the platform from specification to tested, typed, architecture-sound code. The 28 lessons covered:

**Module 1 — Foundations (001–007)**
Requirements → terminal → git → browser → modules → packages → build tools

**Module 2 — Components (008–012)**
DOM manipulation problem → React components → JSX → props → composition

**Module 3 — State (013–017)**
What state is → useState → lifting state → useEffect → derived state

**Module 4 — Architecture (018–022)**
SPA navigation → React Router → lazy loading → app shell → registry pattern

**Module 5 — TypeScript (023–025)**
Type systems → interfaces → migration from JavaScript

**Module 6 — Testing (026–028)**
What tests are for → unit tests → component tests

The platform runs at `localhost:5173`. It has one working lab (Calculator). It has the architecture to support dozens of labs without modifying the shell. It has a type system enforcing component contracts. It has a test suite verifying calculation correctness and component rendering.

The next phase: copy this foundation to a new folder and build the real app. Add labs from the real open-calc platform (Robot Arm, Space Invaders, Rubik's Cube). Connect the real data layer. Deploy.
