# React Calculator — Lesson 17 — Context: AngleModeContext

## What You Will Build

A working Degrees/Radians toggle, and — finally — `sin(30)` correctly
showing `0.5`. More importantly: a value any component in this project can
read or change, without it ever being passed down as a prop.

---

## What You Need to Know First

Lesson 16 — trig functions that work, but assume radians, producing a
wrong answer for the ordinary case of degrees.

---

## Step 1 — Why Not Just a Plain Global Variable?

The obvious-looking fix is a module-level variable: `let angleMode =
"degrees";` at the top of `engine.ts`, read directly by `handleFunction`.
This fails for the exact same reason lesson 05 rejected `let value = "0"`
inside a component: changing a plain variable doesn't tell React anything
changed. A toggle button that did `angleMode = "radians"` would update the
variable correctly and never cause a single re-render — the display
would show yesterday's answer, computed with today's setting, only after
some *unrelated* state change happened to trigger a re-render by
coincidence.

The state needs to live somewhere React tracks it — but it also needs to
be reachable from **any** component that cares about it, not just a direct
child of whatever owns it. `ScientificPad` needs to read it. Lesson 29's
Settings panel — in a completely different part of the tree by then — will
also need to read and change it. Passing it down as an ordinary prop
through every layer between wherever it lives and wherever it's needed,
forever, as this project grows, is exactly the problem **Context** solves.

**The name for the problem being avoided: prop drilling.** If `angleMode`
stayed an ordinary prop, and `ScientificPad` were ever nested three or
four components deep instead of being a direct child of `Calculator`,
every single intermediate component — components that don't use
`angleMode` themselves at all — would still need to accept it as a prop
purely to forward it one level further down. This is called **prop
drilling**: threading a value through every layer of a tree it merely
passes through, bloating every intermediate component's props with data
it never actually uses itself. It's not that prop drilling is *broken* —
this project's own `onDigit`/`onOperator` props are threaded through
exactly one layer (`Calculator` → `Keypad` → `Button`) and that's
perfectly reasonable. Prop drilling becomes a real problem specifically
when the number of layers grows and most of them have nothing to do with
the value passing through — precisely the situation Context exists to
avoid.

---

## Step 2 — Create the Context

Add to `Calculator.tsx` (near the top, outside the `Calculator` function
itself):

```tsx
type AngleMode = "degrees" | "radians";

interface AngleModeContextValue {
  angleMode: AngleMode;
  toggleAngleMode: () => void;
}

const AngleModeContext = React.createContext<AngleModeContextValue>({
  angleMode: "degrees",
  toggleAngleMode: () => {},
});
```

**Walkthrough — `React.createContext(defaultValue)`.** Creates a
**Context object** — a container React knows how to make available
anywhere below a matching `Provider` in the tree, without it being passed
through props at all. The `defaultValue` passed here (`{ angleMode:
"degrees", toggleAngleMode: () => {} }`) is only ever used if a component
tries to read this context with no `Provider` above it anywhere — a safety
fallback, not the value this project will actually use in practice, since
`Calculator` is about to provide a real one.

**Walkthrough — `AngleModeContextValue`, bundling a value with a way to
change it.** This context doesn't just share `angleMode` — it shares
`toggleAngleMode` too, the *function* that changes it. Any component
reading this context gets both the current value and the ability to
update it, without ever needing to know *how* the update actually happens
underneath — the same "here's the data, here's the function, don't worry
about the mechanism" shape props have used since lesson 06.

---

## Step 3 — Provide It From `Calculator`

Update `Calculator.tsx`:

```tsx
function Calculator() {
  const [expression, setExpression] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);
  const [scientificMode, setScientificMode] = React.useState(false);
  const [angleMode, setAngleMode] = React.useState<AngleMode>("degrees");

  function toggleAngleMode(): void {
    setAngleMode(angleMode === "degrees" ? "radians" : "degrees");
  }

  function handleFunction(name: string): void {
    const outcome = evaluate(expression === "" ? "0" : expression);
    if (outcome.kind === "success") {
      const applyFunction = TRIG_FUNCTIONS[name];
      const input = angleMode === "degrees" ? outcome.value * (Math.PI / 180) : outcome.value;
      setExpression(String(roundForDisplay(applyFunction(input))));
      setResult(null);
    } else {
      setResult(outcome.message);
    }
  }

  // ...handleDigit, handleOperator, handleParen, handleEquals,
  // handlePercent, handleSignChange, handleClear unchanged from lesson 14...

  const displayValue = result !== null ? result : (expression === "" ? "0" : expression);

  return (
    <AngleModeContext.Provider value={{ angleMode, toggleAngleMode }}>
      <div className="calculator">
        <Display value={displayValue} />
        <Keypad
          onDigit={handleDigit}
          onOperator={handleOperator}
          onParen={handleParen}
          onEquals={handleEquals}
          onPercent={handlePercent}
          onSignChange={handleSignChange}
          onClear={handleClear}
        />
        <button className="mode-toggle" onClick={() => setScientificMode(!scientificMode)}>
          {scientificMode ? "Basic" : "Scientific"}
        </button>
        {scientificMode && <ScientificPad onFunction={handleFunction} />}
      </div>
    </AngleModeContext.Provider>
  );
}
```

Add one small helper to `engine.ts`:

```typescript
function roundForDisplay(value: number): number {
  return Math.round(value * 1e10) / 1e10;
}
```

**Walkthrough — the degree-to-radian conversion, finally.** `outcome.value
* (Math.PI / 180)` is the standard conversion: one degree equals `π/180`
radians, so multiplying a degree value by that ratio produces the
equivalent in radians — the unit `Math.sin` actually expects, as named in
lesson 16. This is the entire fix: `sin`, `cos`, and `tan` themselves
never changed; only the value handed to them, based on which mode is
currently active, did.

**A brief, honest note about `roundForDisplay`.** Converting `30` degrees
to radians and back through `Math.sin` doesn't always land on a perfectly
clean `0.5` — floating-point arithmetic can leave a tiny amount of
imprecision behind, like `0.49999999999999994` instead of `0.5`.
`roundForDisplay` trims that off for now, rounding to ten decimal places.
*Why* this imprecision happens at all — and a more complete way to think
about it — is lesson 29's subject in full; for now, the goal is just a
clean, correct-looking answer on screen.

**Walkthrough — `<AngleModeContext.Provider value={{ angleMode,
toggleAngleMode }}>`.** Every Context object comes with a `Provider`
component. Wrapping JSX in it makes the given `value` available to every
component nested anywhere inside — not just direct children, any depth —
through `useContext`, without a single prop being passed at any
intermediate layer. The value passed here is a fresh object literal
containing the current `angleMode` and the `toggleAngleMode` function;
whenever `angleMode` changes, `Calculator` re-renders, a new value object
is created, and every component consuming this context re-renders too.

**Honest limitation, worth naming now even though this project doesn't fix
it until lesson 25/26's tools exist.** `value={{ angleMode,
toggleAngleMode }}` creates a **brand-new object literal on every single
render of `Calculator`** — not just the renders where `angleMode` actually
changes, every one, including a plain digit press that has nothing to do
with angle mode at all. Context's own rule for deciding whether consumers
need to re-render is a reference comparison on the *whole* `value` — since
this object is new every time, by reference, **every component reading
`AngleModeContext` re-renders on every keystroke**, whether or not
anything it actually cares about changed. This is a real, well-known
Context gotcha in production React code, not a mistake unique to this
lesson — and it's exactly the kind of unnecessary re-render lesson 25's
`useMemo` and lesson 26's `React.memo` exist to catch and fix. The honest
fix here would be wrapping the value in `React.useMemo(() => ({
angleMode, toggleAngleMode }), [angleMode, toggleAngleMode])` — worth
trying once you've completed lesson 25, as a real, concrete way to apply
memoization to something other than the manufactured example that lesson
uses.

---

## Step 4 — Consume It From `ScientificPad`

Update `ScientificPad.tsx`:

```tsx
interface ScientificPadProps {
  onFunction: (name: string) => void;
}

function ScientificPad({ onFunction }: ScientificPadProps) {
  const { angleMode, toggleAngleMode } = React.useContext(AngleModeContext);

  return (
    <div className="scientific-pad">
      <Button label="sin" onClick={() => onFunction("sin")} />
      <Button label="cos" onClick={() => onFunction("cos")} />
      <Button label="tan" onClick={() => onFunction("tan")} />
      <Button label={angleMode === "degrees" ? "DEG" : "RAD"} onClick={toggleAngleMode} />
    </div>
  );
}
```

Click **▶ Preview**. Toggle Scientific mode. Type `30`, click `sin` — the
display shows `0.5`. Click the `DEG`/`RAD` button to switch to radians,
type `0.5235987756`, click `sin` — also `0.5`, the same answer, correctly,
from the same angle expressed in its other unit.

**Walkthrough — `React.useContext(AngleModeContext)`.** Reads whatever
value the nearest enclosing `Provider` above this component in the tree
currently holds — here, destructured immediately into `angleMode` and
`toggleAngleMode`, the same destructuring pattern used for props since
lesson 03. Notice `ScientificPad`'s own props interface,
`ScientificPadProps`, still only lists `onFunction` — `angleMode` and
`toggleAngleMode` arrive through context, a second, separate channel a
component can pull from, alongside its ordinary props.

**SE lens — context is for values that feel "ambient," not everything.**
It would be technically possible to put `expression` and `result` in
context too, and stop passing props to `Display` and `Keypad` entirely.
This project doesn't, on purpose: `expression` and `result` are specific
to one calculation, owned by one component, needed by exactly the children
`Calculator` already renders directly — plain props remain the simpler,
more explicit tool there. `angleMode` is different: it's closer to a
setting than a piece of one specific calculation's data, genuinely useful
to components that might live anywhere in this project, present or future
— exactly the situation context exists for.

**Connect to the real world — you have been using exactly this pattern
this entire time, in the tool you're building this project in.** Open this
very app's source at `src/context/ThemeContext.jsx`, and you'll find
`createContext`, a `ThemeProvider`, and a `.Provider` wrapping the entire
application — the identical pattern this lesson just built, one level up.
Every time you've clicked the moon/sun icon in HTML Lab's own toolbar to
switch between light and dark mode, you were toggling a value inside a
Context, read by components scattered all over this application's UI —
the code editor's theme, the panel backgrounds, the button colors — none
of them connected to each other by props, all of them reading the same
`ThemeContext`. `AngleModeContext` and this app's real `ThemeContext`
solve the identical problem: a setting that many, unrelated parts of a
tree need to read, provided once, near the top.

---

## Connect the Pieces

```
Calculator.tsx      AngleModeContext — created once; Calculator owns the
                    real angleMode state and provides it, plus
                    toggleAngleMode, to everything nested inside it
                    handleFunction — now converts degrees to radians
                    before calling into TRIG_FUNCTIONS
ScientificPad.tsx   reads angleMode and toggleAngleMode via useContext,
                    with zero new props threaded through Calculator
engine.ts           roundForDisplay() — a small, honest patch over
                    floating-point imprecision, fully explained in lesson 29
```

---

## What Breaks Without This

Already demonstrated in lesson 16 and now fixed here: `sin(30)` without
this conversion computes the sine of 30 *radians*, not 30 degrees — a
wrong answer for the input every real user of a "DEG" calculator would
actually type.

---

## Definition of Done

- [ ] `sin(30)` correctly shows `0.5` in degrees mode
- [ ] Toggling to radians and typing the radian equivalent gives the same correct answer
- [ ] You can explain why a plain global variable couldn't replace Context here
- [ ] You can explain what a Context `Provider` does and who can read from it
- [ ] You've opened `src/context/ThemeContext.jsx` in this app and can point to its `createContext` call and `.Provider`
- [ ] You can explain why every consumer of `AngleModeContext` currently re-renders on every keystroke, and how `useMemo` would fix it

---

*Next: Lesson 18 — Outgrowing useState: Calculator Actions as a Reducer.
Seven separate handler functions, each calling one or two setState calls,
become a single reducer — one function describing every possible action
this calculator can take.*
