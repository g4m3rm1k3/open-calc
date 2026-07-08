# React Calculator — Lesson 15 — Conditional Rendering: Scientific Mode Toggle

## What You Will Build

A "Scientific" toggle button. Click it, and a second row of buttons
appears below the existing keypad. Click it again, and the row disappears.
Nothing about the buttons underneath changes — only whether this one extra
row exists on the page at all.

---

## What You Need to Know First

Lesson 14 — a fully working four-function calculator with parentheses,
percent, and sign-change.

---

## Step 1 — A Boolean Piece of State

**Booleans, from first principles, since this project hasn't needed one
until now.** Every value used as state so far has been a `string` or a
`number`. `scientificMode` introduces a **boolean** — a value that is
always exactly one of two things, `true` or `false`, nothing in between
and nothing else. Booleans come from **Boolean algebra**, a branch of
mathematics dealing entirely in true/false values and the operations that
combine them: **AND** (both sides must be true), **OR** (at least one side
must be true), and **NOT** (flips true to false and false to true).
JavaScript spells these `&&`, `||`, and `!`. `!scientificMode` is `NOT
scientificMode` — read literally, "the opposite of whatever
`scientificMode` currently is": if `scientificMode` is `true`,
`!scientificMode` is `false`, and vice versa. This one piece of math
underlies every `if`, every conditional render, and every toggle this
entire project builds from here on.

In `Calculator.tsx`, add one more state variable alongside `expression` and
`result`:

```tsx
const [scientificMode, setScientificMode] = React.useState(false);
```

**Walkthrough.** `React.useState(false)` — no explicit type argument
needed here, unlike `result`'s `React.useState<string | null>(null)`.
TypeScript can correctly **infer** the type from the initial value alone:
handing `useState` a literal `false` is enough information to know this
state is a `boolean`, forever, for this call. An explicit `<boolean>` would
say the same thing more verbosely; it's only truly necessary when the
initial value alone doesn't tell the whole story, like `null` needing to
be widened to `string | null`.

---

**PL lens — naming a boolean, and why `scientificMode` doesn't follow the
usual convention.** A very common, widely-followed naming convention for
booleans prefixes them with `is`, `has`, `can`, or `should` —
`isLoading`, `hasError`, `canSubmit` — specifically so that reading the
name alone, with no type annotation visible, tells you it's a yes/no flag
rather than a string or number. `scientificMode` deliberately doesn't
follow it, for a specific, honest reason: this project already uses
`AngleMode`/`Theme` (lesson 29) as the name for a *non-boolean* mode
setting with more than two states — naming this flag `isScientificMode`
would read fine on its own, but `scientificMode` was chosen instead to
keep it visually paired with those other "mode" settings while it's still
just a boolean here. This is a real, judgment-call-level naming decision,
worth noticing precisely because reasonable engineers could make it either
way — the `is`/`has`/`can` convention is a strong default, not an
absolute rule, and knowing why a particular case might deviate from it is
part of using the convention well rather than mechanically.

## Step 2 — Render (or Don't) Based on the Flag

Update `Calculator.tsx`'s `return` statement, adding a toggle button and a
conditionally-rendered second keypad:

```tsx
return (
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
    {scientificMode && <ScientificPad />}
  </div>
);
```

Create `ScientificPad.tsx`:

```tsx
function ScientificPad() {
  return (
    <div className="scientific-pad">
      <Button label="sin" onClick={() => {}} />
      <Button label="cos" onClick={() => {}} />
      <Button label="tan" onClick={() => {}} />
    </div>
  );
}
```

Click **▶ Preview**. Click "Scientific" — three new buttons appear below
the keypad. Click "Basic" (the same button, now relabeled) — they vanish.

**Walkthrough — `{scientificMode && <ScientificPad />}`.** This is
**conditional rendering** using JavaScript's `&&` operator, not a React-
specific feature at all — just a natural consequence of how `&&`
evaluates. `&&` returns its *first* operand if that operand is falsy
(`false`, `0`, `""`, `null`, `undefined`), without ever evaluating the
second one; otherwise it evaluates and returns the *second* operand.
When `scientificMode` is `false`, the whole expression evaluates to
`false` — and JSX, told to render a plain `false` value, renders nothing
at all. When `scientificMode` is `true`, the expression evaluates to
`<ScientificPad />` itself, which JSX renders normally. No special
"if/else for JSX" syntax exists in React; ordinary JavaScript expressions,
embedded through the same `{ }` curly braces from lesson 03, do the whole
job.

**Walkthrough — `{scientificMode ? "Basic" : "Scientific"}`.** A
**ternary expression** — `condition ? valueIfTrue : valueIfFalse` — chosen
here instead of `&&` because both outcomes matter: the button's label
must be *something* regardless of which mode is active, not "something, or
nothing." `&&` is the right tool when the false case should render
nothing; a ternary is the right tool when both cases need a real, different
result.

**Expressions versus statements, named explicitly, because this whole
technique depends on the difference.** An **expression** is any piece of
code that evaluates to a value — `2 + 2`, `scientificMode`, `scientificMode
&& <ScientificPad />` are all expressions; each one *is* a value once
evaluated. A **statement** is an instruction that performs an action but
doesn't itself produce a value to be used elsewhere — `if
(scientificMode) { ... }` is a statement; it cannot be dropped inside `{ }`
in JSX, because JSX's curly braces only accept something that evaluates to
a value. This is the precise, technical reason `if` cannot be used
directly inside JSX, and `&&`/ternary can: `&&` and `?:` are **operators**
— symbols that combine expressions into a new, larger expression — while
`if` is statement syntax. `&&`'s own **evaluation rule** — check the left
side first; if it's falsy, stop and return it; otherwise evaluate and
return the right side — is called **short-circuit evaluation**, and it's
also why `&&`'s right side is never even evaluated when the left side is
falsy: not "evaluated but ignored," genuinely never run at all.

**Truthy, falsy, and coercion — the rule `&&` actually follows.**
JavaScript will convert, or **coerce**, any value to a boolean when a
boolean is needed for a decision, using a fixed rule: exactly six values —
`false`, `0`, `""` (empty string), `null`, `undefined`, and `NaN` — coerce
to `false`, called **falsy**. Every other value in the entire language,
including `"0"` (a non-empty string), every non-empty array, and every
object, coerces to `true`, called **truthy**. `&&`'s "is the left side
falsy" check is exactly this coercion rule, applied silently, which is why
memorizing that specific list of six falsy values matters — anything not
on it behaves as `true` in a condition, even values that might look
"empty" or "zero-ish" at a glance.

**CS lens — this is why "conditional rendering" doesn't need new syntax.**
A React component's job is to return a description of what the UI should
look like *right now*. "What it should look like" can obviously depend on
data — that's not a special case requiring special syntax, it's the same
thing an `if` statement or a ternary always does, just evaluated as part of
building a return value instead of choosing between two separate code
paths. `ScientificPad` mounting and unmounting as `scientificMode` flips is
React doing exactly what it always does: comparing what a component
*used to* return to what it returns *now*, and updating only the real DOM
that actually needs to change.

**SE lens — `ScientificPad` doesn't know it can disappear.** Just like
`Display` and `Keypad`, `ScientificPad` is a plain component with no idea
whether or when it's shown. The decision to show or hide it lives entirely
in `Calculator`, the same component that already owns every other piece of
this calculator's state — consistent with the single-source-of-truth
principle from lesson 07.

**CS lens, deeper — "hidden" and "unmounted" are not the same thing, and
this project just did the second one.** A different, real alternative
would have been rendering `ScientificPad` *always*, and using CSS
(`display: none`) to visually hide it when `scientificMode` is `false` —
the component would still exist, still hold any state it had, just not be
visible. That is **not** what `{scientificMode && <ScientificPad />}`
does. When `scientificMode` becomes `false`, React fully **unmounts**
`ScientificPad` — removing it from the tree entirely, destroying any state
it held, and running any cleanup a future `useEffect` inside it might
register (lesson 23 relies on exactly this cleanup behavior). Toggling
back to `true` doesn't restore the old instance; it **mounts** a brand new
one, `useState` calls and all, starting fresh. This is invisible right now
because `ScientificPad` holds no state of its own — but it becomes a real,
concrete design decision the moment it does, and it's worth knowing the
rule before that day arrives rather than being surprised by it.

**Connect to the real world.** This exact pattern — a boolean piece of
state, an `&&` or ternary deciding what renders, mount/unmount instead of
show/hide — is how a production app displays a loading spinner while data
is being fetched, shows a validation error message only when one exists
(lesson 21 does exactly this for the formula editor), or opens and closes
a modal dialog. There is no special "conditional UI" feature to learn in
React beyond this — every one of those real, common cases is the same
`&&`/ternary technique applied to a differently-named boolean.

---

## Connect the Pieces

```
Calculator.tsx    scientificMode: boolean — a new, independent piece of
                  state; a toggle button flips it; `&&` decides whether
                  ScientificPad renders at all
ScientificPad.tsx a new component, currently just three inert buttons —
                  lesson 16 gives them a real function
```

---

## What Breaks Without This

**Writing `{scientificMode ? <ScientificPad /> : null}` instead of
`{scientificMode && <ScientificPad />}`:** functionally identical in this
case — both work correctly. The `&&` form is preferred by convention
specifically *because* there's nothing meaningful to show in the false
case; reaching for a ternary with an explicit `null` on one side is a
signal, to anyone reading the code later, that there might have been a
second real option that was never filled in.

**Using `{scientificMode && "3"}` where `"3"` happened to be a real,
truthy string, to render conditionally on a string flag instead of a
boolean:** works by coincidence — every non-empty string is truthy. The
moment that flag could ever legitimately be `""` (a genuinely empty but
valid value), `&&` would treat it as false and hide `ScientificPad`
incorrectly. This is why `scientificMode` is a real `boolean`, not a
stand-in string or number — its truthiness is never ambiguous.

**The single most common real `&&` bug in production React code, worth
knowing now even though it can't happen in this exact lesson:** writing
`{someCount && <Component />}` where `someCount` is a `number`, not a
`boolean`. If `someCount` is ever exactly `0`, `&&` correctly evaluates it
as falsy and returns `0` itself — and unlike `false`, `null`, or
`undefined`, JSX **does** render the number `0` as visible text. The
screen shows a stray, confusing `0` sitting where nothing was intended to
appear. The fix is to force a real boolean first — `{someCount > 0 &&
<Component />}` — a habit worth having ready before the day this project
(or any other) has a count that can legitimately be zero.

---

## Definition of Done

- [ ] Clicking the mode toggle shows and hides the scientific row correctly
- [ ] The toggle button's own label correctly reflects the current mode
- [ ] You can explain why `&&` hides `ScientificPad` when `scientificMode` is `false`
- [ ] You can explain when a ternary is the better choice over `&&`
- [ ] You can explain the difference between unmounting a component and hiding it with CSS
- [ ] You can explain the classic `{count && <X />}` bug and how to avoid it
- [ ] You can name AND, OR, and NOT, and give their JavaScript symbols
- [ ] You can explain why `if` cannot be used directly inside JSX curly braces, but `&&` and `?:` can
- [ ] You can list the six falsy values from memory
- [ ] You can explain the `is`/`has`/`can` boolean naming convention and why `scientificMode` deviates from it

---

*Next: Lesson 16 — Trig Functions and the Angle Mode Bug. The three
scientific buttons compute something for the first time — and immediately
expose a second real bug, the same shape as lesson 10's.*
