# React Calculator — Lesson 27 — Error Boundaries

## What You Will Build

A live preview inside the Formula Editor, showing the computed result as
you type — and, deliberately, a real crash the moment you type something
incomplete. Then a safety net that catches it, and finally, the properly
engineered fix that should have been there from the start.

---

## What You Need to Know First

Lesson 26 — a fully working calculator with memoized rendering.

---

## Step 1 — Build a Live Preview, the Naive Way

Add a live preview to `FormulaEditor.tsx`:

```tsx
function FormulaEditor({ onSave, initialName = "", initialExpression = "" }: FormulaEditorProps) {
  const [name, setName] = React.useState(initialName);
  const [expression, setExpression] = React.useState(initialExpression);

  const previewTree = parseExpression({ tokens: tokenize(expression), position: 0 });
  const previewValue = evaluateNode(previewTree);

  // ...handleSubmit unchanged...

  return (
    <form className="formula-editor" onSubmit={handleSubmit}>
      {/* ...existing inputs... */}
      <p>Preview: {previewValue}</p>
    </form>
  );
}
```

Click **▶ Preview**. Start typing an expression: `3`. The preview correctly
shows `3`. Type `+` next — `3+`. **The entire form disappears**, and
HTML Lab's own preview shows a broken, blank result where the calculator
used to be.

**Walkthrough — why this crashes, and exactly when.** `tokenize("3+")`
succeeds — `"3+"` is perfectly valid *as tokens*: a number, then a plus
sign. `parseExpression` is what fails: `parseAddition` sees the `+`,
correctly starts looking for the multiplication-level expression that must
come *after* it, and finds nothing — the token list ends there. This
throws `"Expected a number or \"(\", but the expression ended"`, the exact
error `parsePrimary` was written to throw in lesson 12, for exactly this
situation. The important detail: this throw happens **during rendering**
— `previewTree`/`previewValue` are computed directly in the component
body, not inside `handleSubmit` or any other event handler. A React
component that throws while rendering doesn't fail gracefully by
default — by design, React unmounts that entire part of the tree,
which is why the whole form vanished, not just the preview line.

**SE lens — this is a real, common mistake, made on purpose here to be
demonstrated honestly.** This project already built a completely safe way
to evaluate an expression: `evaluate()`, from lesson 13, wraps exactly
this kind of failure in a try/catch and returns a checked
`CalculatorResult` instead of throwing. This preview bypasses it entirely,
calling `tokenize`/`parseExpression`/`evaluateNode` directly — a realistic
shortcut anyone might reach for while quickly prototyping a new feature,
forgetting that the safety net they already built for exactly this purpose
lives one function call away.

---

## Step 2 — A Safety Net: `CalculatorErrorBoundary`

Create `CalculatorErrorBoundary.tsx`:

```tsx
interface ErrorBoundaryProps {
  children: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class CalculatorErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return { hasError: true, errorMessage: message };
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <p>Something went wrong: {this.state.errorMessage}</p>
          <button onClick={this.handleReset}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Wrap the formula editor in `Calculator.tsx`:

```tsx
<CalculatorErrorBoundary>
  <FormulaEditor
    key={editingId ?? "new"}
    onSave={handleSaveFormula}
    initialName={editingFormula?.name ?? ""}
    initialExpression={editingFormula?.expression ?? ""}
  />
</CalculatorErrorBoundary>
```

Click **▶ Preview**. Type `3+` again. Instead of the whole app breaking,
a clear message appears: "Something went wrong: Expected a number or
\"(\", but the expression ended" — with a "Try Again" button. Click it,
and the form comes back, reset and usable.

**Walkthrough — why this is the one place in this project that needs a
class.** Every other component in this project has been a function.
`getDerivedStateFromError` and its sibling `componentDidCatch` — the two
lifecycle methods that let a component catch an error thrown by any
component *below* it in the tree — have no function-component or hook
equivalent in React as of this project's version. This is a real, current
gap in React's hook API, not a stylistic choice: error boundaries are
built with classes because that's the only mechanism React currently
provides for this specific job.

**Walkthrough — `static getDerivedStateFromError(error)`.** A `static`
method belongs to the class itself, not to any one instance — called by
React directly, automatically, the moment a descendant throws during
rendering. Its job is narrow and specific: given the error, return the new
`state` this component should have. React then re-renders
`CalculatorErrorBoundary` with that new state, which is what makes
`this.state.hasError` become `true` and the fallback UI appear instead of
the crashed subtree.

**A crucial limit, worth being exact about.** Error boundaries catch
errors thrown during **rendering**, in lifecycle methods, and in
constructors of the tree beneath them. They do **not** catch errors thrown
inside event handlers (a `throw` inside an `onClick`, for instance) —
those need an ordinary `try`/`catch` at the point they happen, which is
exactly the approach `evaluate()` already took in lesson 13. An error
boundary is specifically for the case this lesson demonstrates: something
that goes wrong while React is building or updating the page itself.

---

## Step 3 — The Actually Correct Fix

The error boundary is a real safety net, and it's now in place — but it
exists to catch mistakes, not to excuse them. Fix the underlying bug
properly, using the tool this project already built for exactly this
situation:

```tsx
function FormulaEditor({ onSave, initialName = "", initialExpression = "" }: FormulaEditorProps) {
  const [name, setName] = React.useState(initialName);
  const [expression, setExpression] = React.useState(initialExpression);

  const previewOutcome = evaluate(expression === "" ? "0" : expression);
  const previewText = previewOutcome.kind === "success" ? String(previewOutcome.value) : previewOutcome.message;

  // ...handleSubmit unchanged...

  return (
    <form className="formula-editor" onSubmit={handleSubmit}>
      {/* ...existing inputs... */}
      <p>Preview: {previewText}</p>
    </form>
  );
}
```

Click **▶ Preview**. Type `3+` again. No crash at all — the preview simply
shows the error message inline, exactly the way the main display already
handles a bad expression.

**SE lens — the error boundary from Step 2 still matters, even though
this specific bug no longer reaches it.** `CalculatorErrorBoundary` stays
in place around `FormulaEditor`, unwired from this now-fixed bug but
still guarding against the next mistake nobody's made yet — a genuinely
unexpected error, from a part of the code that doesn't have a
`CalculatorResult` safety net wrapped around it. The lesson here is not
"error boundaries versus proper error handling" as a choice between two
options — it's that proper error handling comes first, for every failure
you can predict, and an error boundary stands behind it, for the ones you
can't.

---

## Connect the Pieces

```
CalculatorErrorBoundary.tsx   a class component — the one place in this
                              project React still requires one
FormulaEditor.tsx             the live preview, first built unsafely to
                              demonstrate a real crash, then fixed to use
                              evaluate() properly
```

---

## What Breaks Without This

Already demonstrated live in Step 1: a render-time throw, with no error
boundary anywhere above it, takes down the entire subtree React was
rendering at the time — not a graceful, contained failure, a visibly
broken piece of the page with no way back short of reloading.

---

## Definition of Done

- [ ] The naive live preview (Step 1) is confirmed to crash on an incomplete expression
- [ ] `CalculatorErrorBoundary` catches that crash and offers a working "Try Again" reset
- [ ] The final version (Step 3) uses `evaluate()` and never crashes at all
- [ ] You can explain why error boundaries currently require a class component
- [ ] You can explain what an error boundary does *not* catch, and why

---

*Next: Lesson 28 — Tabs Without a Router. Basic, Scientific, and Settings
become real, separate views — composed, not routed through a full
routing library.*
