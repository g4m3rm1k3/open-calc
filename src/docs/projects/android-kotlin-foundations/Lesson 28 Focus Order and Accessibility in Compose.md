# Lesson 28: Focus Order and Accessibility in Compose

**What you will build:** The keyboard's "Next"/"Done" flow through
`AddItemForm`'s two fields, and a real `contentDescription` on the
inventory grid's icon-only delete button — the Compose equivalents of
Java's Lesson 35 `imeOptions` and `contentDescription`. The transferable
problem: Java's Lesson 35 confirmed something worth confirming again
here rather than assuming: default focus order already matches this
project's logical flow, for the identical reason in both UI systems —
elements declared in the order a user actually completes them naturally
produce a correct default traversal, with no override needed. What
differs is entirely mechanism: Compose has no XML attributes at all,
and its accessibility and IME-action tools are `Modifier`-based.

**What you need to know first:** Java's Lesson 35 in full
(`android:imeOptions`, accessibility traversal order,
`android:contentDescription`, and its own honest finding that this
project's screens don't currently need a traversal override). This
series' own Lesson 17 (`AddItemForm`, the two `TextField`s this lesson
adds keyboard actions to), Lesson 18 (the delete button this lesson adds
a description to).

**Terms introduced in this lesson:**
- **`KeyboardOptions`** — a `TextField` parameter controlling which
  keyboard type and IME action to display, the Compose analog of
  `android:inputType`/`android:imeOptions` combined.
- **`KeyboardActions`** — a `TextField` parameter supplying the actual
  behavior to run when the keyboard's action key (Next, Done, and
  similar) is pressed.
- **`Modifier.semantics { }`** — a modifier attaching accessibility and
  testing metadata (including `contentDescription`) to a composable,
  the Compose analog of `android:contentDescription`.

---

## Concept Unit: Default Focus Order — Confirmed Again, Unchanged Reasoning

### The Problem

Confirm directly, as Java's Lesson 35 already did for the login screen:
does this project's own Compose-based `AddItemForm` and inventory list
already traverse in a sensible, logical order by default, or does
something need to be forced?

### The Check

Compose's own default focus and accessibility traversal order follows
composition order — the sequence composables are actually placed in a
`Column`/`Row`, the identical "declared order becomes traversal order"
rule Java's Lesson 35 already confirmed for `LinearLayout`. `AddItemForm`
declares its name field, then its quantity field, then its "Add"
button, in exactly the order a user would naturally complete them — the
identical situation Java's Lesson 35 found for the login screen, for
the identical underlying reason: a layout built with fields declared in
natural task order gets correct traversal for free, in both UI systems,
with no override needed.

---

## Concept Unit: `KeyboardOptions`/`KeyboardActions` — Compose's `imeOptions`

### The Problem

Confirming default *order* is correct doesn't address Java's Lesson 35
real, separate finding: the keyboard's own action key needs to be told
what it should actually do — move to the next field, or finish the
form — the same gap `android:imeOptions` closed for the login screen.

### The New Code

```kotlin
val quantityFocusRequester = remember { FocusRequester() }

TextField(
    value = name,
    onValueChange = { name = it },
    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
    keyboardActions = KeyboardActions(onNext = { quantityFocusRequester.requestFocus() })
)
TextField(
    value = quantityText,
    onValueChange = { quantityText = it },
    modifier = Modifier.focusRequester(quantityFocusRequester),
    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done, keyboardType = KeyboardType.Number),
    keyboardActions = KeyboardActions(onDone = { /* submit */ })
)
```

### Mechanical Walkthrough

- `KeyboardOptions(imeAction = ImeAction.Next)` — **first appearance.**
  Sets the soft keyboard's own action key to read "Next," the direct
  Compose analog of `android:imeOptions="actionNext"` — but, unlike the
  XML attribute, setting it alone doesn't automatically know *which*
  field is next; Compose requires that to be stated explicitly, in the
  next new construct.
- `keyboardActions = KeyboardActions(onNext = { quantityFocusRequester.requestFocus() })`
  — **first appearance.** `KeyboardActions` supplies the real behavior
  for the action key — here, moving focus manually via a
  `FocusRequester`. This is a real, honest difference from Java's own
  version: `android:imeOptions="actionNext"` moved focus to the next
  field *automatically*, using the same declaration-order sequence
  Java's Lesson 35 already confirmed; Compose requires the target field
  to be requested explicitly, because a `TextField`'s "next" isn't
  inferred from composition order the same automatic way `EditText`'s
  was from XML order.
- `FocusRequester()`, wrapped in `remember` (this series' own Lesson
  15) — **first appearance.** A real, addressable handle to a specific
  composable's focus, created once and reused; `Modifier.focusRequester(quantityFocusRequester)`
  attaches that handle to the quantity field specifically, and
  `.requestFocus()` — called from the username field's own
  `onNext` — is what actually moves focus there.
- `keyboardType = KeyboardType.Number` — reappearing conceptually, the
  direct Compose analog of `android:inputType="number"` (Java's Lesson
  10), now expressed as a named parameter instead of an XML attribute
  string.
- `ImeAction.Done`, `onDone = { /* submit */ }` — the identical
  "Done" pattern Java's Lesson 35 used for the last field in a
  sequence, dismissing the keyboard rather than moving focus further.

### SE Lens

**Why does Compose require an explicit `FocusRequester` instead of
inferring the next field automatically the way Android's XML-based
focus order already does?** Compose's `TextField`s don't have a fixed,
declared position in a static resource file the way `EditText`s in an
XML layout do — a `LazyColumn`'s rows, for instance, are composed and
recomposed dynamically, and "the next composable in declaration order"
is a much less stable, less automatically-inferable relationship in a
tree that can restructure itself at runtime. Requiring an explicit,
named target trades a small amount of extra code for a guarantee that
holds regardless of how dynamic the surrounding composition actually is
— a real, honest cost for a real, structural difference between the two
systems, not an arbitrary API design choice.

---

## Concept Unit: `Modifier.semantics { contentDescription = ... }`

### The Problem

The delete button on each inventory row (this series' own Lesson 18)
currently displays the literal text "Delete" — already correctly read
by a screen reader with no extra work, exactly like Java's Lesson 35
already found for every text-labeled button in that project. An
icon-only version of the same button — the realistic, more compact
design a real app would likely prefer — has no text at all for a screen
reader to fall back on.

### The New Code

```kotlin
IconButton(
    onClick = { onDelete(item) },
    modifier = Modifier.semantics { contentDescription = "Delete ${item.name}" }
) {
    Icon(imageVector = Icons.Default.Delete, contentDescription = null)
}
```

### Mechanical Walkthrough

- `Modifier.semantics { contentDescription = "Delete ${item.name}" }` —
  **first appearance.** `Modifier.semantics { }` attaches accessibility
  (and testing) metadata directly to a composable; `contentDescription`
  set inside it is read aloud by TalkBack in place of any visible text —
  the direct Compose analog of `android:contentDescription`, and, as
  this project's own version shows, able to include real, specific data
  (`item.name`, this series' own Lesson 07 string template) rather than
  a single static string every row would otherwise share.
- `Icon(imageVector = ..., contentDescription = null)` — **first
  appearance of `Icon`'s own `contentDescription` parameter, deliberately
  set to `null`.** Many Compose components (`Icon` among them) accept
  their own `contentDescription` parameter directly; setting it `null`
  here is intentional, not an oversight — it tells the accessibility
  system this specific icon carries no independent meaning of its own
  and should be skipped, since the *button* wrapping it, via
  `Modifier.semantics`, already supplies the one real, complete
  description ("Delete Bolts") that should actually be announced.

### CS Lens

This is the identical **visual representation versus semantic
representation** split Java's Lesson 35 already named — a UI's pixels
and its accessibility-tree meaning are related but genuinely separate
models, and both UI systems provide explicit tools for the cases where
an icon's *drawn* appearance carries no text a screen reader could
otherwise fall back on.

### SE Lens

**Why does this project's icon-only delete button need a *per-row*
description (`"Delete Bolts"`) rather than one shared string
(`"Delete"`), the way Java's Lesson 35 own `contentDescription` example
used one static string?** A screen reader user navigating a scrollable
list of several icon-only delete buttons, each announced simply as
"Delete," has no way to tell which row a given button actually belongs
to without first navigating to the adjacent text — a real, concrete
accessibility gap a sighted user wouldn't notice at all, since they can
see the row's name right next to the icon. Interpolating the real
item's name directly into the description — something a single static
XML string resource could never do per-row — closes that gap
completely, and is a genuine capability Compose's code-based
`contentDescription` has that a purely resource-based one does not.

---

## Concept Unit: Accessibility Traversal Order — Not Currently Needed, Named Honestly

### The Problem

Java's Lesson 35 named a real mechanism
(`accessibilityTraversalBefore`/`After`) for the case where visual order
and logical reading order diverge, then honestly confirmed this
project's own screens don't currently need it. Does Compose have an
equivalent, and does this project need it either?

### The Honest Answer

Compose exposes a comparable mechanism, `Modifier.semantics {
traversalIndex = ... }`, letting a composable's accessibility-reading
position be adjusted independently of its visual position in the
layout tree — the direct Compose analog of Java's own
`accessibilityTraversalBefore`/`After`. This project's own two Compose
screens have the identical property Java's Lesson 35 already found for
the login screen: every composable's visual position already matches
its logical order (a row's name reads before its quantity, which reads
before its own delete button; the add form's fields read in the order
they're filled in), which is exactly why no `traversalIndex` override
appears anywhere in this project's own code. Recognizing the mechanism
exists, and correctly recognizing it isn't currently needed, is the
same real skill Java's Lesson 35 already named — not applying an
override reflexively.

---

## Connect the Pieces

One trace: `AddItemForm`'s two fields, declared in natural task order,
already traversed correctly by default — the identical finding, for the
identical structural reason, Java's Lesson 35 already made for the login
screen. `KeyboardOptions`/`KeyboardActions`, paired with an explicit
`FocusRequester`, closed the real "what does Next actually do" gap
Java's `imeOptions` closed automatically — a genuine, honest difference
in how much each system infers versus requires stated explicitly. And
`Modifier.semantics { contentDescription = "Delete ${item.name}" }`
closed the identical icon-only-button gap Java's `contentDescription`
solves, with a real capability (per-row, data-driven descriptions) a
static XML string resource never had.

## What Breaks Without This

Remove `contentDescription` entirely from the icon-only delete button
(both the `Modifier.semantics` block and leaving `Icon`'s own parameter
at its default), then turn on TalkBack on a real device or emulator and
navigate to a row's delete button.

Real result, when you do this yourself: TalkBack announces the button
as nothing more than "Button" — the identical, real accessibility
failure Java's Lesson 35 already named for an undescribed icon-only
`ImageButton`, now reproduced in Compose. Restore the description
before moving on.

## Exercises

1. Reproduce this lesson's own keyboard-flow feature on a real device or
   emulator: type into the name field, tap the keyboard's "Next" key,
   and confirm focus genuinely moves to the quantity field, then tap
   "Done" on the quantity field and confirm the keyboard dismisses.
2. Turn on TalkBack and navigate through the inventory list, confirming
   each row's delete button is announced with that row's own specific
   item name, not a single, ambiguous shared label.
3. Deliberately place `Modifier.semantics { traversalIndex = -1f }` on
   one composable in a `Column` with several siblings, and observe,
   with TalkBack turned on, that it's now announced *before* elements
   that appear visually above it — direct, hands-on confirmation of what
   `traversalIndex` actually overrides, for the case this project itself
   doesn't currently need.

## Definition of Done

- [ ] `AddItemForm`'s keyboard flow correctly moves from name to
      quantity to dismissal, verified on a running emulator or device.
- [ ] The icon-only delete button is announced by TalkBack with the
      correct, specific item name for its own row.
- [ ] You triggered the real "announced as just 'Button'" failure from a
      missing `contentDescription`, and restored it.
- [ ] You can explain why Compose requires an explicit `FocusRequester`
      where Java's XML-based focus order worked automatically.
- [ ] Commit: `git commit -m "Add keyboard flow to AddItemForm and
      per-row contentDescription to the delete button"` — explaining
      the accessibility gap each change closes, not just the addition.

Next: consistent motion between screens — Java's Lesson 36
`overridePendingTransition`, answered by Compose Navigation's own
`enterTransition`/`exitTransition`.
