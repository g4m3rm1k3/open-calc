# Lesson 11: A Name Chosen, Not Assigned

**What you will build:** a real, editable text field and a real button
that, together, let the user rename this phone's own Bluetooth
identity from inside the app itself — and, to make room for them, this
lesson's own first real screen with more than one thing on it. Every
lesson so far returned exactly one widget from `build()`; asking the
user to type something and press something both require real controls
this project has never needed before, arranged together on screen at
once.

**What you need to know first:** Lesson 07's `.getName()` on a
`BluetoothDevice` — this lesson uses the closely related, but
distinct, `.getName()`/`.setName()` pair that live on `BluetoothAdapter`
itself instead, covered directly below.

**Terms introduced in this lesson:**
- **Layout** — a Kivy widget whose entire job is arranging other
  widgets, not displaying content of its own — this lesson's
  `BoxLayout` stacks its children in the order they were added,
  top to bottom.
- **Widget tree** — the real, nested structure a Kivy app's UI forms
  once more than one widget exists: a root widget (here, the layout)
  holding child widgets, each of which could hold further children of
  its own, though this lesson's own tree is only two levels deep.

**Objects and methods this lesson uses:**
- **`kivy.uix.boxlayout.BoxLayout`**
  - *What it is:* a layout that arranges its children in a single row
    or column.
  - *Implementation:* `orientation='vertical'` stacks children
    top-to-bottom, in the order `add_widget` was called; each child
    gets an equal share of the available space by default.
  - *Its use:* the new root widget `build()` returns, replacing
    Lesson 03's bare `Label`.
- **`Widget.add_widget(child)`**
  - *What it is:* attaches a child widget to a layout (or any widget
    capable of holding children).
  - *Implementation:* takes the widget to add; call order is display
    order for a `BoxLayout`.
  - *Its use:* how this lesson actually builds its widget tree.
- **`kivy.uix.textinput.TextInput`**
  - *What it is:* a real, editable text field.
  - *Implementation:* `.text` holds its current, live content, both
    readable and writable; `multiline=False` restricts it to one line,
    appropriate for a short name rather than a paragraph.
  - *Its use:* where the user types the new Bluetooth name.
- **`kivy.uix.button.Button`**
  - *What it is:* a real, tappable button.
  - *Implementation:* `text` sets its label; `.bind(on_press=callback)`,
    covered next, is what actually makes tapping it do something.
  - *Its use:* what triggers the real rename.
- **`Widget.bind(on_press=callback)`**
  - *What it is:* Kivy's own general mechanism for reacting to an
    event on a widget.
  - *Implementation:* `callback` is called when the named event fires
    — `on_press`, here — receiving exactly one argument: the widget
    instance the event happened on, conventionally named `instance`.
    Never called directly by this project's own code, the same
    "handed to the framework, run later" shape `Clock.schedule_interval`
    and `request_permissions` already established.
  - *Its use:* connects a real tap to this lesson's own rename method.
- **`BluetoothAdapter.setName(name)` / `.getName()`**
  - *What they are:* set and read this phone's own Bluetooth name —
    distinct from Lesson 07's `BluetoothDevice.getName()`, which reads
    some *other* device's name, not this one's own.
  - *Implementation:* `setName` takes a plain string, returns nothing;
    `getName` takes nothing, returns the current name as a string.
    Both require the `BLUETOOTH_CONNECT` permission Lesson 05 already
    secured.
  - *Their use:* this lesson's actual real change.

---

## Concept Unit: A Screen With More Than One Thing On It

### The Problem

Every `build()` so far has returned exactly one widget — a `Label`, in
every version since Lesson 02. Letting the user type a new name and
press a button to confirm it needs two more real widgets, both visible
at once, alongside the label that's already there — and Kivy requires
a real container widget to hold more than one child at all; simply
creating three separate widgets with no shared parent would only ever
show whichever one `build()` happened to return.

### Introduce the Concept in Isolation — Step 1: Proving a Layout, a Text Field, and a Button Really Work Together

**Runs on the desktop**, exactly like every plain-Kivy isolation before
it — no Android-only import involved:

```python
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button


class FormApp(App):
    def build(self):
        self.input = TextInput(text="type here", multiline=False)
        button = Button(text="Show Value")
        button.bind(on_press=self.show_value)

        layout = BoxLayout(orientation="vertical")
        layout.add_widget(self.input)
        layout.add_widget(button)
        return layout

    def show_value(self, instance):
        print("Current text:", self.input.text)


FormApp().run()
```

Run it with `python main.py`. Type something into the text field,
replacing "type here", then press the button. Expected real terminal
output, reflecting whatever was actually typed:

```
Current text: hello
```

Two widgets, both visible and both interactive at once, inside one
`BoxLayout` — `self.input` reachable from `show_value` because it was
stored on `self` at creation time, the same reason Lesson 02's own
`self.label` had to be stored rather than left as a local variable.
`instance`, the argument `show_value` receives, is the `Button`
itself — unused here, but always present, the same required-shape
pattern already seen for `dt` in scheduled callbacks.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — Kivy's `BoxLayout`,
`TextInput`, and `Button` widgets, along with `.bind()`'s own event
mechanism, are confirmed against Kivy's current official
documentation, fetched this session; `BluetoothAdapter.setName`'s real
permission requirement is confirmed against Android's own official
documentation.

**Files affected:** `main.py`.

**Change type:** modify `build()`'s return value (now a `BoxLayout`
instead of a bare `Label`); add one new method.

**Location:** inside `MyApp`.

**Dependencies:** Lesson 06's `self.bluetooth_adapter` (may not exist
yet when the button is first pressed — handled explicitly below);
Lesson 05's already-granted `BLUETOOTH_CONNECT` permission.

```python
from kivy.uix.boxlayout import BoxLayout                                  # <- new
from kivy.uix.textinput import TextInput                                  # <- new
from kivy.uix.button import Button                                        # <- new


class MyApp(App):
    def build(self):
        self.label = Label(text="Starting accelerometer...")
        self.name_input = TextInput(                                      # <- new
            text="", multiline=False, hint_text="New Bluetooth name"      # <- new
        )                                                                 # <- new
        name_button = Button(text="Set Bluetooth Name", size_hint_y=None, height=80) # <- new
        name_button.bind(on_press=self.set_bluetooth_name)                # <- new

        layout = BoxLayout(orientation="vertical")                        # <- new
        layout.add_widget(self.label)                                     # <- new
        layout.add_widget(self.name_input)                                # <- new
        layout.add_widget(name_button)                                    # <- new

        accelerometer.enable()
        Clock.schedule_interval(self.update_label, 0.1)
        self.request_bluetooth_permissions()
        return layout                                                     # <- changed from self.label

    def set_bluetooth_name(self, instance):                                # <- new
        if not getattr(self, "bluetooth_adapter", None):                  # <- new
            Logger.info("MyApp: Bluetooth not ready yet — try again in a moment") # <- new
            return                                                        # <- new
        self.bluetooth_adapter.setName(self.name_input.text)              # <- new
        Logger.info(f"MyApp: Bluetooth name set to {self.bluetooth_adapter.getName()}") # <- new
```

### Mechanical Walkthrough

- `from kivy.uix.boxlayout import BoxLayout` / `TextInput` / `Button` —
  **first appearances**, full treatment above (Objects and methods).
- `self.name_input = TextInput(text="", multiline=False, hint_text="New Bluetooth name")`
  — **first real appearance.** `hint_text` shows faint placeholder
  text only while `text` is empty — a real `TextInput` feature not
  used in Step 1's simpler version, chosen here so the field's purpose
  is clear without a separate label widget.
- `name_button = Button(text="Set Bluetooth Name", size_hint_y=None, height=80)`
  — **first real `Button`**, full treatment above.
  `size_hint_y=None`/`height=80` are ordinary Kivy sizing properties —
  without them, a `BoxLayout`'s default behavior gives this button the
  same share of vertical space as the label above it, stretching it
  far taller than a button needs to be; fixing its height explicitly
  avoids that.
- `name_button.bind(on_press=self.set_bluetooth_name)` — **first
  appearance**, full treatment above (Objects and methods).
- `layout = BoxLayout(orientation="vertical")` / three `layout.add_widget(...)`
  calls — **reappearing exact mechanism from Step 1**, now with three
  children instead of two, in the order they'll actually appear on
  screen: label on top, text field in the middle, button on the
  bottom.
- `return layout` — **changed from every previous lesson's `return
  self.label`.** `build()`'s own contract — return a real `Widget` —
  is unchanged; what's new is that the returned widget is now a
  container holding three children, not a single leaf widget.
- `def set_bluetooth_name(self, instance):` — **reappearing exact
  callback shape from Step 1's own `show_value`.**
- `if not getattr(self, "bluetooth_adapter", None):` — **first
  appearance of `getattr` with a default, in place of the `hasattr`
  guard Lessons 08/10 already used for the same real reason** — the
  user could tap this button before `on_bluetooth_ready` has ever run
  at all, a real, already-demonstrated-possible race in this project's
  own timeline. `getattr(self, name, default)` reads an attribute that
  might not exist yet, returning `default` instead of raising, in one
  expression — equivalent in effect to `hasattr` here, shown as an
  alternate, equally real way to guard the same case.
- `self.bluetooth_adapter.setName(self.name_input.text)` — **first
  appearance of `setName`**, full treatment above (Objects and
  methods). `self.name_input.text` — reading the real, live value
  currently in the text field, the same `.text` property Step 1
  already proved reflects whatever the user actually typed.
- `self.bluetooth_adapter.getName()` — **new object, same method name
  as Lesson 07's `BluetoothDevice.getName()`, deliberately contrasted
  in the Objects and methods section above** — read again immediately
  after `setName`, to confirm the real change took effect rather than
  merely trusting it did.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against Kivy's own current documentation and Android's real
permission requirements, not a captured run.

1. `build()` runs. Predict a real screen appears with the accelerometer
   label on top, an empty, hint-labeled text field in the middle, and
   a "Set Bluetooth Name" button at the bottom — all three visible and
   interactive at once.
2. The user types a new name and taps the button before Bluetooth
   permissions have finished being granted. Predict the `getattr`
   guard catches this, logs the "not ready yet" message, and nothing
   else happens — no crash, no silent failure either.
3. The user taps the button again, later, once `on_bluetooth_ready`
   has run. Predict `setName` succeeds, and a real `Logger.info` line
   confirms the new name by reading it straight back with `getName()`.
4. Predict the accelerometer label, immediately above the text field,
   keeps updating on its own `Clock.schedule_interval` the entire
   time, completely unaffected by anything happening in the new
   controls below it — the same "everything scheduled keeps running
   independently" property already established since Lesson 02.

### CS Lens

**A tree of widgets, where a container holds children that may
themselves hold further children, is the same structural shape behind
essentially every real UI system** — HTML's own DOM, a native Android
layout's own `ViewGroup`/`View` hierarchy, any desktop toolkit's own
window/panel/control nesting. This lesson's own tree is shallow — one
`BoxLayout`, three flat children — but the same `add_widget` mechanism
scales to arbitrarily deep nesting without changing shape at all,
exactly the way Lesson 12's own device list will use it again.

### SE Lens

**Why store `self.name_input` but not `name_button`, as a field on
`self`?** `set_bluetooth_name` needs to read `self.name_input.text`
later, after the button was pressed — the same real reason
`self.label` was stored back in Lesson 02. `name_button` is never
referenced again after `build()` finishes constructing and binding it
— Kivy itself keeps it alive as part of the widget tree once added
via `add_widget`, so nothing this project's own code does needs a
second reference to it. Storing it anyway would cost nothing but would
add a field with no real reader — this lesson's own small, honest
instance of not keeping a reference "just in case."

---

## Connect the Pieces

`BoxLayout`/`add_widget`, proven in Step 1 with a text field and a
button that merely echo each other, become the real container holding
the accelerometer label above them — Lesson 03's own display,
unchanged in behavior, now sharing screen space with real, new
controls for the first time. `.bind(on_press=...)`, the exact same
"hand a function to the framework, it runs later" shape
`Clock.schedule_interval` and `request_permissions` already
established, is what finally lets a real, physical tap trigger real
Python code — and `getattr(self, ..., None)`, a second real way to
express the identical defensive shape Lessons 08 and 10 already used,
guards `setName` against the same kind of not-ready-yet race this
project has now named three separate times.

## What Breaks Without This

Give the button no fixed height, leaving `BoxLayout`'s default sizing
in place:

```python
name_button = Button(text="Set Bluetooth Name")   # <- no size_hint_y/height
```

Predicted result: nothing crashes — `BoxLayout` splits the available
vertical space evenly across all three children by default, so the
button ends up occupying roughly a third of the entire screen, far
larger and more visually dominant than a button needs to be, with
`self.name_input` and `self.label` each compressed to make room.
Restore the explicit sizing, and confirm for yourself, by comparing
both versions side by side, that fixed-height widgets and
proportionally-sized ones genuinely behave differently inside the same
layout.

## Exercises

1. Tap "Set Bluetooth Name" with the text field left empty, and
   confirm what `setName("")` actually does to this phone's real
   Bluetooth name — predict first, then check Android's own Bluetooth
   settings screen to see the real result.
2. Add a second `TextInput`/`Button` pair beneath the first, for
   something harmless and reversible to try (there isn't a real second
   name-like Bluetooth property worth wiring up — a scratch label text
   changer is enough) purely to practice a second, independent
   `add_widget`/`bind` pair inside the same layout.
3. Remove the `getattr` guard entirely, and deliberately tap the
   button in the real gap between `build()` returning and
   `on_bluetooth_ready` finishing. Read the real `AttributeError` this
   produces, and confirm it names `bluetooth_adapter` specifically as
   the attribute that doesn't exist yet.

## Definition of Done

- [ ] You ran Step 1 on the desktop and confirmed a real typed value
      showed up correctly in the terminal after pressing the button.
- [ ] You ran the real Step 2 code on a real Android build and saw all
      three widgets — label, text field, button — visible and usable
      together.
- [ ] You successfully renamed this phone's real Bluetooth identity
      and confirmed the new name in Android's own Bluetooth settings
      screen, not just in this app's own log.
- [ ] You can explain, without looking, why `self.name_input` needed
      to be stored on `self` but `name_button` didn't.
- [ ] You reproduced the real `AttributeError` from Exercise 3 and can
      explain, in your own words, exactly what real-world timing
      causes it.
- [ ] Commit: the updated `main.py`.
