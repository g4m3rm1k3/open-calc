# Assembling an Optional-Heavy Object: AlertDialog.Builder

**What problem this solves.** Some objects have many configurable parts,
most of them optional, and not every caller wants to set all of them —
a dialog might have a title, a message, one button, two buttons, a
custom layout, or some other combination entirely. A single constructor
covering every combination either needs one overload per combination
(multiplying fast) or one giant constructor with most arguments passed
as `null` or a default most of the time, both of which make a call site
unreadable — a string of positional arguments with no label saying what
each one means. The abstract fix: separate *configuring* the object from
*constructing* it, and let each optional part be set only when it's
actually wanted, by name, one call at a time.

**Classic pattern family.** This is the Gang-of-Four **Builder**
pattern: a separate object collects configuration through its own
methods, one piece at a time, and only produces the real, finished
object on request — rather than the real object's own constructor
trying to accept every possible combination of optional parts directly.

**Where you'll meet it in Android.** `android.app.AlertDialog.Builder`
(or its AndroidX equivalent), used to construct an `AlertDialog`.

**Terms used in this pattern.**

- **Method chaining (fluent interface)** — calling one method directly
  on the return value of the previous call
  (`builder.setTitle(...).setMessage(...)`), rather than assigning each
  intermediate result to its own variable first. It exists so a
  sequence of configuration calls reads as one continuous statement
  describing the whole object being built, instead of a series of
  separate statements each repeating the builder's variable name.
- **`this` returned from a method** — a method that ends with
  `return this;`, handing back the very same object it was called on.
  It exists specifically to make method chaining possible: without it,
  each `setXxx` call would return `void`, and the next call in the
  chain would have nothing to call itself on.
- **Interface, anonymous implementation** — `DialogInterface.OnClickListener`
  is an interface (a contract naming a method with no body of its own);
  supplying `(dialog, which) -> { ... }` or a `new DialogInterface.OnClickListener() { ... }`
  at the call site provides a real implementation of that contract
  inline, without declaring a separate named class just to hold a few
  lines of button-tap logic.

**Objects and methods used.**

- **`AlertDialog.Builder`**
  *What it is:* a separate class, not itself an `AlertDialog`, whose
  entire job is to collect configuration and hand back a real dialog
  when asked.
  *Implementation:* constructed via `new AlertDialog.Builder(Context context)`;
  each `setXxx` method below returns `AlertDialog.Builder` (specifically,
  `this`), and `create()`/`show()` are what finally produce the real
  object.
  *Its use:* lets a call site set only the parts of a dialog it actually
  wants, in whatever combination, by chained method calls instead of one
  constructor call passing everything at once.
- **`setTitle(CharSequence title)`**
  *What it is:* an instance method on `Builder`, returning `AlertDialog.Builder`.
  *Implementation:* `public AlertDialog.Builder setTitle(CharSequence title)`.
  *Its use:* stores the dialog's title text on the builder, to be
  applied to the real dialog once it's created.
- **`setMessage(CharSequence message)`**
  *What it is:* an instance method on `Builder`, returning `AlertDialog.Builder`.
  *Implementation:* `public AlertDialog.Builder setMessage(CharSequence message)`.
  *Its use:* stores the dialog's body text, the same way `setTitle`
  stores the title.
- **`setPositiveButton(CharSequence text, DialogInterface.OnClickListener listener)`**
  *What it is:* an instance method on `Builder`, returning `AlertDialog.Builder`.
  *Implementation:* `public AlertDialog.Builder setPositiveButton(CharSequence text, DialogInterface.OnClickListener listener)`.
  *Its use:* configures one button's label and what runs when it's
  tapped — stored now, but the listener itself doesn't run until the
  user actually taps the button later.
- **`DialogInterface.OnClickListener`**
  *What it is:* a functional interface — one abstract method.
  *Implementation:* `public interface OnClickListener { void onClick(DialogInterface dialog, int which); }`.
  *Its use:* the contract a button's tap handler must satisfy;
  `dialog` is the dialog the tap happened in, `which` identifies which
  button was tapped.
- **`create()`**
  *What it is:* an instance method on `Builder`, returning `AlertDialog`.
  *Implementation:* `public AlertDialog create()`.
  *Its use:* assembles everything configured so far into one real,
  fully-built `AlertDialog` object — but does not display it.
- **`show()`**
  *What it is:* an instance method, present both on `Builder` (as a
  shortcut) and on the real `AlertDialog` object, returning `AlertDialog`.
  *Implementation:* `public AlertDialog show()`.
  *Its use:* when called on the `Builder`, does exactly what `create()`
  does and then immediately displays the result — the common shortcut
  when nothing further needs doing to the dialog object before it
  appears.

---

## The Shape

Two participants, used in strict sequence, never both at once:

- **`AlertDialog.Builder`** — the builder. Holds configuration only; is
  never itself shown on screen, and after `create()`/`show()` is called,
  its job is finished — nothing later reaches back into the same
  builder object to change an already-built dialog.
- **`AlertDialog`** — the real, finished product. Only comes into
  existence at the moment `create()` or `show()` runs; everything
  configured before that point is inert data sitting on the builder,
  not yet a dialog at all.

The relationship: every `setXxx` call is made *on the builder* and
returns *the same builder*, which is what allows the whole
configuration to read as one chained statement. Nothing about a dialog
actually exists as a dialog until the single moment `create()` or
`show()` is called — up until then, calling `setTitle` twice, in either
order, relative to `setMessage`, produces the identical final object,
because nothing has been built yet; only configuration has been
recorded.

```
 new AlertDialog.Builder(context)
        |
        v
 .setTitle(...) --returns this--> .setMessage(...) --returns this--> .setPositiveButton(...)
        |                                                                     |
        |                                                                     v
        |                                                            (still just a Builder,
        |                                                             nothing shown yet)
        v
    .create()  ---------->  AlertDialog (built, not shown)
        or
    .show()    ---------->  AlertDialog (built AND shown)
```

---

## Mechanical Walkthrough

```java
new AlertDialog.Builder(this)
        .setTitle("Delete contact?")
        .setMessage("This cannot be undone.")
        .setPositiveButton("Delete", (dialog, which) -> deleteContact())
        .setNegativeButton("Cancel", null)
        .show();
```

- **`new AlertDialog.Builder(this)`** — constructs the builder itself,
  not a dialog. `this` is the `Context` the dialog will be styled and
  shown within — passed here because the builder needs it up front to
  know, among other things, which visual theme to apply.
- **`.setTitle("Delete contact?")`** — the first link in the chain.
  Stores the literal string as the dialog's title-to-be and returns the
  same builder object (`this`, inside `setTitle`'s own implementation),
  which is exactly what makes the next `.` call on the next line valid
  — without that returned reference, this line would be its own
  complete statement with nothing to attach `.setMessage` to.
- **`.setMessage("This cannot be undone.")`** — same mechanism as
  `setTitle`: stores the body text, returns the same builder again.
- **`.setPositiveButton("Delete", (dialog, which) -> deleteContact())`**
  — configures the dialog's primary action button. `"Delete"` is the
  button's label; `(dialog, which) -> deleteContact()` is a lambda
  implementing `DialogInterface.OnClickListener`'s single method,
  supplied inline rather than as a separately declared class. Nothing
  about this lambda runs at this point in the code — it's stored,
  exactly like the title and message strings were, and only actually
  invoked later, whenever (and if) the user taps this specific button.
- **`.setNegativeButton("Cancel", null)`** — configures a second button
  with the label `"Cancel"` and no listener at all. Passing `null` here
  is valid specifically because tapping "Cancel" needs no custom
  action beyond the dialog's own default behavior of just closing
  itself — there's nothing to run, so nothing is supplied.
- **`.show()`** — the final link, and the only one in this whole chain
  that isn't itself a `setXxx` configuration call. This is the instant
  everything configured above stops being inert builder state and
  becomes one real `AlertDialog` object, immediately displayed. Every
  call before this one could have run in a different order relative to
  each other with no difference in the final result; this call could
  not have run any earlier, because nothing to show existed yet.

---

## Collaboration — how it actually runs

1. `new AlertDialog.Builder(this)` runs first and only once, producing
   the builder object every following call in the chain will operate on.
2. Each `.setXxx(...)` call runs in the plain top-to-bottom order
   written, each one mutating the same builder object and handing that
   same object back — at this stage, nothing has been shown, and no
   listener passed in has run.
3. `.show()` runs last, synchronously building the real `AlertDialog`
   from everything gathered in step 2, then telling Android's window
   system to display it. This line finishes running well before the
   user has necessarily tapped anything.
4. Sometime later — possibly seconds, possibly never, entirely
   controlled by when and whether the user taps a button — Android's
   window system calls back into whichever listener was configured for
   the button that was actually tapped, running `deleteContact()` at
   that moment, not at the moment `setPositiveButton` was originally
   called.

Step 4 happening long after step 2 is the specific reason the listener
has to be handed to `setPositiveButton` as an object (a lambda
implementing an interface) rather than simply being code written
directly at the point the button is tapped — at the time `setPositiveButton`
runs, there is no "point the button is tapped" yet; that moment doesn't
exist until the user causes it, arbitrarily far in the future.

---

## Why It's Shaped This Way

The design principle is **separating configuration from construction**
so a caller only states the parts of the object it actually wants, by
name, rather than every constructor call having to account for every
possible optional combination.

The alternative not chosen: one large `AlertDialog` constructor
accepting every possible option as a parameter (title, message, each
button's label and listener, and so on), most of them `null` or a
default on any given call. The real cost of that alternative: a call
site becomes a long list of positional values with no label attached to
any of them, so a reader can't tell what `null` in the fourth position
means without checking the constructor's own declaration; adding one
more optional feature later means changing that one already-overloaded
constructor's signature (and every existing call site, or another
overload) instead of just adding one more chainable method.

The cost this pattern itself carries: for the simplest possible case —
a dialog with just a title and one button — writing `new
AlertDialog.Builder(this).setTitle(...).setPositiveButton(...).show()`
is more to type than a single constructor call with two arguments would
have been. The pattern pays for itself once the number of optional
combinations grows past what a small, fixed set of constructor
overloads could reasonably cover.

---

## Recognizing It Elsewhere

Also recognized in: `StringBuilder`'s chained `.append(...)` calls
assembling a string piece by piece before `.toString()` produces the
real result; SQL query builders assembling `.select(...).where(...).orderBy(...)`
before a final `.execute()`; HTTP client libraries configuring a
request with chained `.header(...).body(...)` calls before a final
`.send()`; a form-letter template being filled in field by field before
being "finalized" and printed.

---

## Where This Actually Breaks

The most common real mistake: treating an unfinished builder chain as
if it were already the finished dialog — for example, splitting the
chain across an `if`/`else` (configuring different buttons on different
branches) but forgetting that `create()` or `show()` still has to be
called afterward on whichever branch ran, since neither branch alone
produces a real, displayed dialog on its own. The visible symptom is
code that runs with no exception and no dialog ever appearing on
screen — nothing crashes, because every individual `setXxx` call is
perfectly valid on its own; the object simply never reaches the one
call that actually turns configuration into something shown.
