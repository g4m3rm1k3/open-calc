# React Calculator — Lesson 16 — Trig Functions and the Angle Mode Bug

## What You Will Build

Working `sin`, `cos`, and `tan` buttons — and, immediately after, a wrong
answer for the most ordinary possible input: `sin(30)`, which should be
`0.5`, comes out as something else entirely. This lesson builds the
feature and then, on purpose, does not fix the bug it exposes — lesson 17
does that, once the reason for the bug is fully understood.

---

## What You Need to Know First

Lesson 15 — a `ScientificPad` component, currently three inert buttons,
shown and hidden by `scientificMode`.

---

## Step 1 — Add Trig Functions to the Engine

In `engine.ts`:

```typescript
function sin(value: number): number {
  return Math.sin(value);
}
function cos(value: number): number {
  return Math.cos(value);
}
function tan(value: number): number {
  return Math.tan(value);
}

const TRIG_FUNCTIONS: Readonly<Record<string, (value: number) => number>> = {
  sin,
  cos,
  tan,
};
```

**Walkthrough — `Math.sin`, a built-in function used for the first time
in this project.** `Math.sin(radians)` is part of JavaScript's built-in
`Math` object. It accepts one number — an angle, in **radians** — and
returns a number between `-1` and `1`: the sine of that angle. It never
throws; passing something nonsensical like `Infinity` returns `NaN`
rather than crashing. `Math.cos` and `Math.tan` work the same way, same
input unit, same guarantee. Nothing here is specific to this project —
this is exactly the function every JavaScript program that needs a sine
has always called.

**Another dispatch table, the same pattern as `OPERATORS`.**
`TRIG_FUNCTIONS` maps a button's name directly to the function it should
call — the same open/closed reasoning from lesson 09 applies unchanged:
adding a fourth scientific function later means adding one entry here,
never touching whatever code calls into this table.

---

## Step 2 — Wire the Scientific Buttons

Update `ScientificPad.tsx`:

```tsx
interface ScientificPadProps {
  onFunction: (name: string) => void;
}

function ScientificPad({ onFunction }: ScientificPadProps) {
  return (
    <div className="scientific-pad">
      <Button label="sin" onClick={() => onFunction("sin")} />
      <Button label="cos" onClick={() => onFunction("cos")} />
      <Button label="tan" onClick={() => onFunction("tan")} />
    </div>
  );
}
```

In `Calculator.tsx`, add a handler and pass it down:

```tsx
function handleFunction(name: string): void {
  const outcome = evaluate(expression === "" ? "0" : expression);
  if (outcome.kind === "success") {
    const applyFunction = TRIG_FUNCTIONS[name];
    setExpression(String(applyFunction(outcome.value)));
    setResult(null);
  } else {
    setResult(outcome.message);
  }
}
```

```tsx
{scientificMode && <ScientificPad onFunction={handleFunction} />}
```

**Walkthrough.** `handleFunction` follows the exact "evaluate, then
transform" shape lesson 14 used for percent and sign-change: whatever has
been typed so far is evaluated into a real number first, then the chosen
trig function is applied to *that* number, and the result becomes the
start of a new expression. No new parsing logic was needed — the pattern
established in lesson 14 keeps paying off.

---

## Step 3 — See the Bug

Click **▶ Preview**. Toggle Scientific mode. Type `3`, `0`. Click `sin`.

The display shows approximately `-0.98803...` — not `0.5`, the answer
every calculator's `sin(30)` button is expected to give.

**CS lens — this isn't a bug in `Math.sin`, or in this project's code
being wrong, exactly.** `Math.sin(30)` is computing the sine of 30
*radians*, correctly — radians just aren't the unit a person typing `30`
on a calculator almost always means. A **radian** is the angle unit where
a full circle is `2π` (about `6.283`) radians instead of `360` degrees —
the unit mathematics and physics use internally, because many formulas
come out simpler in radians than in degrees. `30` degrees is only about
`0.524` radians; `Math.sin(0.524)` does correctly return `0.5`. The
calculator has no way, right now, to know which unit `30` was supposed to
mean.

**SE lens — this is the exact same shape of problem as lesson 10, one
level up.** Lesson 10's bug came from a function (`handleOperator`)
quietly making an assumption (`compute eagerly, left to right`) that
turned out not to always hold. This bug comes from a function (`sin`)
quietly assuming its input is already in the unit it expects, with no way
for a caller to say otherwise. Both are solved the same general way: stop
assuming, and make the missing information explicit and available to
whatever needs it. Lesson 10's fix was structural (a real parser). This
one's fix is lesson 17's subject: a place to store *which* unit the whole
calculator is currently using, reachable from wherever it's needed.

**Connect to the real world — this exact category of bug has a famous,
extremely expensive real example.** In 1999, NASA lost the **Mars Climate
Orbiter**, a $327 million spacecraft, because one piece of ground software
sent thruster-force data in **pound-force seconds** (an imperial unit)
while the navigation software receiving it expected **newton-seconds**
(the metric equivalent) — the same category of mistake as passing a
degree value into a function expecting radians. No single line of code in
either system was "wrong" in isolation; each did exactly what it claimed
to do, correctly, in its own assumed unit. The spacecraft burned up
entering Mars's atmosphere at the wrong altitude because two correct
functions disagreed, silently, about what a plain number meant. A unit
mismatch is not a hypothetical, made-up class of bug invented for this
lesson — it is a documented, real, seven-figure failure mode in
professional software, and the fix used throughout the software industry
since is exactly the one lesson 17 builds: make the unit an explicit,
checkable part of the data, never an unstated assumption.

---

## Connect the Pieces

```
engine.ts           sin(), cos(), tan() — thin wrappers around Math's own
                    trig functions, always operating in radians
                    TRIG_FUNCTIONS — a dispatch table, same pattern as
                    OPERATORS
ScientificPad.tsx   onFunction prop, reporting which function was pressed
Calculator.tsx      handleFunction() — evaluate, apply, replace
```

---

## What Breaks Without This

Already demonstrated, live: `sin(30)` (meant as 30 degrees) returns the
sine of 30 radians instead — a wrong answer for the single most common
way anyone would actually try to use this feature.

---

## Definition of Done

- [ ] `sin`, `cos`, and `tan` buttons all compute something
- [ ] You've confirmed, live, that `30`, `sin` does not show `0.5`
- [ ] You can explain what a radian is and why it differs from a degree
- [ ] You can explain why this bug has the same underlying shape as lesson 10's
- [ ] You can explain, in your own words, what went wrong with the Mars Climate Orbiter and why it's the same category of bug

---

*Next: Lesson 17 — Context: AngleModeContext. A place for the calculator to
remember which unit it's using — reachable from any component that needs
it, without passing it down through every layer by hand.*
