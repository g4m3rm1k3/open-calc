# React Calculator — Lesson 29 — Settings: Theme, Precision, Angle Mode

## What You Will Build

A real Settings tab: a theme toggle, a precision slider, and the angle
mode toggle that already existed — now reachable from Settings too,
without a single new prop threaded anywhere. Along the way: decimal
points finally work, and `0.1 + 0.2` reveals a famous, real bug in how
every computer represents numbers, not just this project.

---

## What You Need to Know First

Lesson 28 — a Settings tab that exists but shows only a placeholder.

---

## Step 1 — One Context Was Enough for One Setting. Is It Still?

`AngleModeContext` was the right size when angle mode was the only shared
setting this project had. Settings now needs three: theme, precision, and
angle mode. Consolidate them into one broader context — a real, honest
refactor, not new functionality:

```tsx
type AngleMode = "degrees" | "radians";
type Theme = "light" | "dark";

interface SettingsContextValue {
  theme: Theme;
  toggleTheme: () => void;
  precision: number;
  setPrecision: (precision: number) => void;
  angleMode: AngleMode;
  toggleAngleMode: () => void;
}

const SettingsContext = React.createContext<SettingsContextValue>({
  theme: "light",
  toggleTheme: () => {},
  precision: 4,
  setPrecision: () => {},
  angleMode: "degrees",
  toggleAngleMode: () => {},
});
```

Update `Calculator` to own all three pieces of state and provide them
together, replacing the old `AngleModeContext.Provider`:

```tsx
const [theme, setTheme] = React.useState<Theme>("light");
const [precision, setPrecision] = React.useState(4);
const [angleMode, setAngleMode] = React.useState<AngleMode>("degrees");

function toggleTheme(): void {
  setTheme(theme === "light" ? "dark" : "light");
}
function toggleAngleMode(): void {
  setAngleMode(angleMode === "degrees" ? "radians" : "degrees");
}
```

```tsx
<SettingsContext.Provider value={{ theme, toggleTheme, precision, setPrecision, angleMode, toggleAngleMode }}>
  <div className={`calculator ${theme}`}>
    {/* ...everything that was inside AngleModeContext.Provider before... */}
  </div>
</SettingsContext.Provider>
```

Update `ScientificPad.tsx` to read from `SettingsContext` instead of
`AngleModeContext`:

```tsx
const { angleMode, toggleAngleMode } = React.useContext(SettingsContext);
```

**SE lens — when to split a context, and when to combine one.** There's
no fixed rule for how many settings belong in one Context — the real
question is whether the values are usually needed *together*, by the same
kinds of components. Theme, precision, and angle mode are all
calculator-wide preferences, read by different, unrelated parts of the
tree, changed rarely, compared to `expression`, which changes on every
keystroke and is needed by exactly the handful of components already
holding it directly. Combining the three settings into one Context is the
right call *because* they share that same shape and audience — not
because "fewer contexts" is automatically better.

---

## Step 2 — Build the Settings Panel

Create `SettingsPanel.tsx`:

```tsx
function SettingsPanel() {
  const { theme, toggleTheme, precision, setPrecision, angleMode, toggleAngleMode } = React.useContext(SettingsContext);

  return (
    <div className="settings-panel">
      <div>
        <label>Theme</label>
        <button onClick={toggleTheme}>{theme === "light" ? "Light" : "Dark"}</button>
      </div>
      <div>
        <label>Precision: {precision} decimal places</label>
        <input
          type="range"
          min="0"
          max="10"
          value={precision}
          onChange={(event) => setPrecision(Number(event.target.value))}
        />
      </div>
      <div>
        <label>Angle Mode</label>
        <button onClick={toggleAngleMode}>{angleMode === "degrees" ? "Degrees" : "Radians"}</button>
      </div>
    </div>
  );
}
```

Replace the Settings placeholder in `Calculator.tsx`:

```tsx
{route === "settings" && <SettingsPanel />}
```

Click **▶ Preview**. Open Settings. Click the Angle Mode button — switch
to Scientific; the `DEG`/`RAD` label there reflects the change too, and
clicking it there updates Settings back. Neither component was given the
other's information through props — both simply read and write the same
`SettingsContext`.

---

## Step 3 — Decimal Points, Finally

The precision setting is meaningless without decimal numbers to round.
`engine.ts`'s tokenizer has never supported them — extend it:

```typescript
if ((character >= "0" && character <= "9") || character === ".") {
  let digits = "";
  while (position < source.length && ((source[position] >= "0" && source[position] <= "9") || source[position] === ".")) {
    digits += source[position];
    position += 1;
  }
  tokens.push({ kind: "number", value: Number(digits) });
  continue;
}
```

You'll also need a decimal point button — add `<Button label="." onClick={() => onDigit(".")} />`
to `Keypad.tsx`.

**Honest limitation.** This doesn't reject a malformed number like
`"1.2.3"` — `Number("1.2.3")` simply evaluates to `NaN`, and `evaluate`'s
existing `try`/`catch` boundary means that surfaces as a clear failure
rather than a crash, just not a specifically-worded one. A real production
calculator would validate this more precisely; this project accepts the
simpler behavior deliberately, the same kind of scope line lesson 14 drew
around percent.

---

## Step 4 — See the Bug, and Understand It

Click **▶ Preview**. Type `0.1`, `+`, `0.2`, `=`. The display shows
`0.30000000000000004` — not `0.3`.

**CS lens — this is not a bug in this project's code. It is how every
computer represents most decimal numbers.** Computers store numbers in
**binary** (base 2), not decimal (base 10). Just as `1/3` cannot be
written exactly as a finite decimal (`0.333...`, forever), most decimal
fractions — including perfectly ordinary ones like `0.1` — cannot be
written exactly as a finite *binary* fraction. `0.1` is actually stored as
the closest binary approximation representable in the 64 bits JavaScript
(and almost every other language) uses for numbers, a standard called
**IEEE 754**. `0.1` and `0.2`'s stored approximations, added together, do
not land exactly on `0.2`'s approximation of `0.3` — the tiny difference,
usually invisible, becomes visible here as `0.30000000000000004`.

**Connect to the real world.** This is not a rare or theoretical edge
case — it is one of the most well-known gotchas in all of software
development, and it explains real production bugs, not just calculator
demos: financial software that accumulates tiny rounding errors across
millions of transactions, game physics engines whose objects drift
slightly out of sync over time, and the reason serious financial code
almost never stores money as an ordinary floating-point number, using
integer cents or a dedicated decimal type instead.

**The fix: round for display, using the precision setting.** Update
`displayValue`'s computation:

```tsx
const displayValue = state.result !== null
  ? (isNaN(Number(state.result)) ? state.result : Number(state.result).toFixed(precision))
  : (state.expression === "" ? "0" : state.expression);
```

Click **▶ Preview**. Repeat `0.1 + 0.2 =` — the display now shows `0.3000`
(at the default 4-decimal precision). Drag the precision slider to `1` —
recompute — it shows `0.3`.

**Walkthrough — `.toFixed(precision)`, and the `isNaN` guard.**
`Number.prototype.toFixed(digits)` formats a number as a string with
exactly that many digits after the decimal point, rounding as needed —
`(0.30000000000000004).toFixed(4)` correctly produces `"0.3000"`. The
`isNaN` check guards against calling `.toFixed` on `state.result` when
it's actually an **error message** (`"Division by zero"`, say) rather than
a real number — `Number("Division by zero")` is `NaN`, and formatting that
would show `"NaN"` instead of the real, useful error text.

**Honest note about what this fix does and doesn't do.** `.toFixed`
changes what's *displayed*. The actual stored value inside `evaluateNode`'s
arithmetic is still the imprecise one underneath — this project rounds for
the human looking at the screen, the same practical choice most real
calculators make, without pretending to solve floating-point
representation itself, which isn't something a single display tweak
actually can.

---

## Connect the Pieces

```
SettingsContext        theme, precision, and angleMode — three settings
                        sharing one context, because they share one
                        audience: components scattered across the tree
SettingsPanel.tsx       a real settings screen, reading and writing the
                        same context ScientificPad already used
engine.ts               tokenize() now accepts decimal points
Calculator.tsx          displayValue rounds using the precision setting
```

---

## What Breaks Without This

Already demonstrated live: without rounding, `0.1 + 0.2` shows
`0.30000000000000004` — a technically-correct-per-IEEE-754, but
unacceptable, answer for a calculator meant for humans to actually read.

---

## Definition of Done

- [ ] Angle mode changes in Settings and Scientific mode stay in sync
- [ ] The precision slider visibly changes how many decimals are shown
- [ ] `0.1 + 0.2` is confirmed to show the raw floating-point artifact before rounding is applied
- [ ] You can explain, in your own words, why `0.1 + 0.2 !== 0.3` in almost every programming language
- [ ] You can explain why this project rounds only for display, not for the underlying computation

---

*Next: Lesson 30 — Refactoring & Architecture Review. No new feature — a
capstone pass over every file this project has built, checking that the
architecture pitched in lesson 01 actually held up.*
