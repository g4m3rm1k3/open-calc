# Lesson 35: Do It to One File in Your Head Before You Do It to All of Them

## What you will build

Two batch tools that share the same underlying shape: a script that
previews a change across every file in a folder before touching anything,
then applies it — first for renaming a folder of inconsistently-named
files, then for converting a folder of images from one format to
another. The transferable problem this lesson is actually about: any
operation applied automatically to many files at once is one bug away
from silently damaging all of them, and the fix isn't "be more careful
when writing the code" — it's building the preview *into* the tool, so
a mistake is visible before it's irreversible.

## What you need to know first

- **Lesson 9–11** — reading a directory's contents and renaming/moving
  files. Today's `os.rename` calls are the same operation Lesson 11's
  own `mv` implementation already used.
- **Lesson 33** — passing a function as a value to another function
  (`task_function` in `run_every_n_seconds`). Today's `rename_function`
  parameter is the same pattern, applied to a different problem.

---

## The Problem, in prose, no code yet

Renaming one file by hand is safe: if the result looks wrong, undo it
immediately, no harm done. Renaming five hundred files with one script is
a different situation entirely — if the renaming logic has a bug, that
bug doesn't produce one wrong result to notice and fix, it produces five
hundred wrong results, applied before there was any chance to notice
anything. The same is true of converting a folder of images: get the
conversion logic wrong, and every image in the folder is affected before
the mistake is visible. Both problems have the same shape and the same
fix: preview the *entire* planned operation, look at it, and only then
actually run it.

---

## Concept Unit: Installing a Package You Didn't Write

### The Problem

Everything built in this curriculum so far has used only Python's
standard library — modules that ship with Python itself, no installation
required. Reading and writing image files in a real, general-purpose
format (JPEG, PNG) needs actual image-format logic — decoding JPEG's
compression, PNG's chunk structure — that the standard library doesn't
include. That logic exists already, written and maintained by other
people, as a **package**: code published for others to install and use
rather than write themselves from scratch.

### Commands needed

Installing directly first, to see what actually happens in this specific
environment:

```
$ pip install requests
error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try apt install
    python3-xyz, where xyz is the package you are trying to
    install.

    If you wish to install a non-Debian-packaged Python package,
    create a virtual environment using python3 -m venv path/to/venv.
    Then use path/to/venv/bin/python and path/to/venv/bin/pip. Make
    ...
```

`pip` (**first appearance**) is Python's own package installer — short
for "Pip Installs Packages." Run directly against the system Python
here, it refuses, and the error explains why: Ubuntu (this environment's
operating system, since Lesson 3) also uses Python internally for its own
system tools, and installing or upgrading a package system-wide could
silently break something Ubuntu itself depends on. The fix the error
message recommends — and the one this lesson uses — is a **virtual
environment**.

```
$ python3 -m venv .venv
$ .venv/bin/pip install --quiet Pillow
$ .venv/bin/python3 -c "import PIL; print('Pillow installed in venv, version:', PIL.__version__)"
Pillow installed in venv, version: 12.3.0
```

- `python3 -m venv .venv` (**first appearance**) — `-m venv` runs
  Python's built-in `venv` module as a program; given a folder name
  (`.venv`, a hidden folder by the leading-dot convention Lesson 8's
  symbolic-link lesson touched on), it creates a self-contained copy of
  the Python interpreter and an empty package directory, entirely
  separate from the system Python `pip` refused to touch a moment ago.
- `.venv/bin/pip install --quiet Pillow` — running `pip` from *inside*
  that new folder, rather than the system-wide `pip`, installs the
  package only into this isolated environment. `--quiet` suppresses
  pip's normal download-progress output, kept here only to keep this
  lesson's output focused. `Pillow` (**first appearance**) is the actual
  package name — the modern, actively maintained continuation of an
  older library called PIL ("Python Imaging Library"), which is why the
  package installs as `Pillow` but is still imported as `PIL` in code, a
  historical quirk rather than a mistake.
- `.venv/bin/python3` — running the *venv's own* Python interpreter,
  not the system one, is what makes the just-installed package visible
  to `import PIL` at all; running plain `python3` here would still see
  none of it.

### CS Lens

A virtual environment is **process-level dependency isolation** — every
project gets its own private set of installed packages, so two different
projects on the same machine can depend on two different, even
conflicting, versions of the same package without interfering with each
other at all.

Also recognized in: Docker containers (a heavier-weight, whole-filesystem
version of the same isolation idea), Node.js's per-project
`node_modules/` folder, Java/Maven's per-project dependency scoping.

### SE Lens

The alternative — installing every package globally, system-wide, for
every project at once — is what the `externally-managed-environment`
error exists specifically to prevent: two projects needing different,
incompatible versions of the same package would have no way to coexist
on one machine at all. A virtual environment costs a small amount of
setup ceremony (`python3 -m venv`, remembering to use its `pip` and
`python3`) in exchange for each project being fully independent of every
other project's dependencies — a cost real Python tooling considers
worth paying by default, which is exactly why this environment refuses
to install packages any other way.

---

## Concept Unit: Previewing a Change Before Making It

### The Problem

`os.rename` (used already, in Lesson 11) executes immediately and
unconditionally — call it, and the rename has already happened, correct
or not. Applied once, by hand, to a file whose new name is fully visible
in the command that renames it, that's fine. Applied automatically, in a
loop, to every file in a folder, based on some renaming *rule* rather
than a name typed out by hand, there's no guarantee the rule does what
its author intended until it's already been run.

### Introduce the concept in isolation

```python
def rename_shapes(shape_names, dry_run):
    planned_renames = []
    for index, old_name in enumerate(shape_names, start=1):
        new_name = f"shape_{index:03d}"
        planned_renames.append((old_name, new_name))

    for old_name, new_name in planned_renames:
        if dry_run:
            print(f"[dry run] would rename {old_name!r} -> {new_name!r}")
        else:
            print(f"renamed {old_name!r} -> {new_name!r}")

    return planned_renames

print("--- first call, dry_run=True ---")
rename_shapes(["circle", "square", "triangle"], dry_run=True)

print("--- second call, dry_run=False ---")
rename_shapes(["circle", "square", "triangle"], dry_run=False)
```

Run it:

```
--- first call, dry_run=True ---
[dry run] would rename 'circle' -> 'shape_001'
[dry run] would rename 'square' -> 'shape_002'
[dry run] would rename 'triangle' -> 'shape_003'
--- second call, dry_run=False ---
renamed 'circle' -> 'shape_001'
renamed 'square' -> 'shape_002'
renamed 'triangle' -> 'shape_003'
```

What this proves: the exact same planning logic — computing every
`(old_name, new_name)` pair — runs identically regardless of `dry_run`;
only the very last step, actually announcing (and, in the real version
about to be built, actually performing) the change, branches on it. That
separation is the whole point: the planning code, which is where a
naming-rule bug would actually live, gets exercised and can be inspected
identically whether or not anything real is about to happen.

This lab is deleted now; it never appears in the project. The pattern —
compute the full plan first, branch only at the point of actually acting
on it — survives into both tools this lesson builds.

### CS Lens

This is the **dry run** pattern — separating the *decision* of what to
do from the *execution* of doing it, so the decision can be inspected on
its own.

Also recognized in: `git commit --dry-run`, `rsync --dry-run`,
Terraform's `terraform plan` (computing and displaying every intended
change to real infrastructure before `terraform apply` touches anything),
database migration tools that print the SQL they're about to run before
running it.

### SE Lens

The alternative — write the renaming loop, test it carefully, then trust
it — relies entirely on the programmer's care being perfect, every time,
forever. Building the preview into the tool itself removes that reliance:
even a careless or rushed invocation still shows its plan first by
default, which is a much stronger guarantee than "the person using this
tool remembered to be careful."

---

## Concept Unit: A Real Batch Renamer

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `batch_rename.py`.
- **Change type:** add.
- **Dependencies:** `os`, standard library only — no virtual environment
  needed for this half of the lesson.

### The New Code

```python
import os


def clean_filename(old_name):
    base_name, extension = os.path.splitext(old_name)
    cleaned_base_name = base_name.replace(" ", "_").lower()
    cleaned_extension = extension.lower()
    return cleaned_base_name + cleaned_extension


def batch_rename(folder_path, rename_function, dry_run=True):
    planned_renames = []
    for old_name in sorted(os.listdir(folder_path)):
        new_name = rename_function(old_name)
        if new_name != old_name:
            planned_renames.append((old_name, new_name))

    for old_name, new_name in planned_renames:
        old_path = os.path.join(folder_path, old_name)
        new_path = os.path.join(folder_path, new_name)
        if dry_run:
            print(f"[dry run] would rename {old_name!r} -> {new_name!r}")
        else:
            os.rename(old_path, new_path)
            print(f"renamed {old_name!r} -> {new_name!r}")

    return planned_renames
```

### The Updated Project

Two new, freestanding functions with nothing surrounding them yet —
covered by Project Change above.

### Mechanical Walkthrough

- `os.path.splitext(old_name)` — **first appearance.** Splits a filename
  into `(base_name, extension)` at the last dot — `"IMG_0001.PNG"`
  becomes `("IMG_0001", ".PNG")`, with the dot kept as part of the
  extension. Using this instead of a manual `.split(".")` matters for a
  real reason: a filename like `"my.vacation.photo.png"` has multiple
  dots, and `splitext` correctly treats only the *last* one as the
  extension boundary, where a naive split would not.
- `.replace(" ", "_")` and `.lower()` — reused string methods.
- `rename_function(old_name)` — this is the higher-order-function
  pattern from Lesson 33's `task_function`, reapplied: `batch_rename`
  itself contains no naming rule at all — it only knows how to plan and
  apply *whatever* renaming rule it's handed, which is what
  `clean_filename` supplies separately below it.
- `if new_name != old_name:` — reused comparison; a file whose name
  needs no change at all is simply left off the plan, so `dry_run`
  output only ever shows files that would actually be affected.
- `os.path.join(folder_path, old_name)` — a **hard concept
  reappearing**: builds a full, correct path regardless of the current
  operating system's path-separator convention, exactly as Lesson 9's
  `ls` implementation already relied on.
- `os.rename(old_path, new_path)` — a **hard concept reappearing** from
  Lesson 11's own `mv` implementation; unchanged here.

### Run it

Against a real folder containing two inconsistently-cased image files
and one file with a space in its name:

```
=== dry run ===
[dry run] would rename 'IMG_0001.PNG' -> 'img_0001.png'
[dry run] would rename 'IMG_0002.PNG' -> 'img_0002.png'
[dry run] would rename 'vacation photo.png' -> 'vacation_photo.png'

=== applying for real ===
renamed 'IMG_0001.PNG' -> 'img_0001.png'
renamed 'IMG_0002.PNG' -> 'img_0002.png'
renamed 'vacation_photo.png' -> 'vacation_photo.png'
```

The folder afterward:

```
img_0001.png
img_0002.png
notes.txt
vacation_photo.png
```

`notes.txt` never appears in either the dry-run or applied output at all
— `clean_filename("notes.txt")` returns `"notes.txt"` unchanged (already
lowercase, no spaces), so the `if new_name != old_name:` check correctly
excluded it from the plan entirely, exactly as intended.

### CS Lens

Separating `clean_filename` (a pure function: same input always produces
the same output, no side effects) from `batch_rename` (which performs
the actual, effectful `os.rename` calls) is the same **pure function /
effectful shell** separation this curriculum's earlier lessons have
named in different contexts — planning logic that can be reasoned about
and tested in complete isolation, wrapped by a thin layer that's the only
part actually touching the real filesystem.

### SE Lens

Because `rename_function` is a parameter rather than hard-coded logic
inside `batch_rename`, a completely different renaming rule — sequential
numbering, a date prefix, anything — can be used with the exact same
preview-then-apply machinery, by writing only a new small function and
passing it in, with zero changes to `batch_rename` itself. This is the
open/closed principle again, restated here in its function-parameter
form rather than its dictionary-based form from Lesson 31's
`ROUTING_TABLE`.

---

## Concept Unit: Batch Converting Image Formats

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `batch_convert_images.py`.
- **Change type:** add.
- **Dependencies:** Pillow, installed into `.venv` in the first unit —
  this file must be run with `.venv/bin/python3`, not plain `python3`.

### The New Code

```python
import os
from PIL import Image, UnidentifiedImageError


def convert_images_in_folder(folder_path, target_extension, dry_run=True):
    converted_files = []
    for filename in sorted(os.listdir(folder_path)):
        input_path = os.path.join(folder_path, filename)
        base_name, _ = os.path.splitext(filename)
        output_path = os.path.join(folder_path, base_name + target_extension)

        try:
            with Image.open(input_path) as opened_image:
                if dry_run:
                    print(f"[dry run] would convert {filename!r} -> {base_name + target_extension!r}")
                else:
                    rgb_image = opened_image.convert("RGB")
                    rgb_image.save(output_path)
                    print(f"converted {filename!r} -> {base_name + target_extension!r}")
                converted_files.append(filename)
        except UnidentifiedImageError:
            print(f"skipped {filename!r} — not an image")

    return converted_files
```

### Mechanical Walkthrough

- `from PIL import Image, UnidentifiedImageError` — **import as module
  contract**: `PIL.Image` is Pillow's module responsible for opening,
  creating, and saving images in any format it understands;
  `UnidentifiedImageError` is the specific exception it raises when a
  file can't be recognized as any known image format at all — imported
  by name here specifically so it can be caught deliberately, rather
  than letting it crash the whole batch.
- `with Image.open(input_path) as opened_image:` — **first appearance**
  of `Image.open`, used as a **context manager** (`with`, a hard concept
  reappearing from file-handling patterns in earlier lessons): opens the
  file, decodes just enough of it to know its format and dimensions
  (not necessarily the full pixel data yet — Pillow reads lazily), and
  guarantees the underlying file handle is closed when the `with` block
  ends, even if an error occurs inside it.
- `except UnidentifiedImageError:` — this is what lets `notes.txt` sit
  in the same folder as real images without crashing the whole run:
  Pillow tries to identify it, fails, raises this specific exception, and
  the loop moves on to the next file instead of stopping entirely.
- `opened_image.convert("RGB")` — **first appearance.** Converts the
  image's internal color mode to plain RGB (three color channels, no
  transparency), *before* saving. This matters specifically for JPEG:
  JPEG has no way to represent a fourth, transparency channel at all, so
  a PNG opened in `RGBA` mode (red, green, blue, *alpha* — the
  transparency channel) must be converted down to `RGB` first, or saving
  fails outright — demonstrated directly below.
- `rgb_image.save(output_path)` — Pillow inspects `output_path`'s
  extension (`.jpg` here) and picks the correct encoder automatically;
  no separate "which format" argument is needed because the destination
  filename itself already says.

### Run it

Against the renamed photo folder from the previous unit:

```
=== dry run ===
[dry run] would convert 'img_0001.png' -> 'img_0001.jpg'
[dry run] would convert 'img_0002.png' -> 'img_0002.jpg'
skipped 'notes.txt' — not an image
[dry run] would convert 'vacation_photo.png' -> 'vacation_photo.jpg'

=== converting for real ===
converted 'img_0001.png' -> 'img_0001.jpg'
converted 'img_0002.png' -> 'img_0002.jpg'
skipped 'notes.txt' — not an image
converted 'vacation_photo.png' -> 'vacation_photo.jpg'
```

Confirming the result is a real, valid JPEG and not just a renamed PNG:

```python
from PIL import Image
img = Image.open('photos/img_0001.jpg')
print('format:', img.format, 'size:', img.size, 'mode:', img.mode)
print('top-left pixel:', img.getpixel((0,0)))
```

```
format: JPEG size: (20, 20) mode: RGB
top-left pixel: (254, 0, 0)
```

The original pixel was solid red, `(255, 0, 0)`; the JPEG's is
`(254, 0, 0)` — one value off. This is not a bug in the conversion code —
it's JPEG's compression being genuinely **lossy**: unlike PNG, JPEG
deliberately discards a small, usually visually-imperceptible amount of
color information to achieve much smaller file sizes, so a JPEG is
expected to never be pixel-for-pixel identical to its source, even when
everything worked correctly.

### CS Lens

`convert("RGB")` before `save()` is enforcing a **format contract**: JPEG
encoders require a specific input shape (three channels, no alpha) and
will not silently accommodate anything else.

Also recognized in: type coercion in strongly-typed languages (an
explicit cast required before an operation that can't accept the
original type), audio format conversion (stereo-to-mono downmixing
before an encoder that only accepts mono), any serialization format with
a fixed, non-negotiable schema.

### SE Lens

Pillow could have made `save()` silently auto-convert `RGBA` to `RGB`
whenever needed, guessing a reasonable way to flatten the transparency
(usually onto a white or black background). It doesn't — it raises an
error instead, described directly next — because silently discarding
transparency information is a real, visible content change a caller
might not want or expect, and a library that guesses wrong on a
person's behalf, silently, is worse than one that stops and asks.

---

## What breaks without this

Skipping the `.convert("RGB")` step and saving a transparent PNG straight
to JPEG:

```python
from PIL import Image
rgba_image = Image.new('RGBA', (10, 10), (255, 0, 0, 128))
rgba_image.save('photos/transparent_test.png')
reopened = Image.open('photos/transparent_test.png')
reopened.save('photos/transparent_test_broken.jpg')  # no .convert("RGB") first
```

```
OSError: cannot write mode RGBA as JPEG
```

A real, immediate, correctly-diagnosed failure — not a corrupted file,
not a silently wrong-looking image, but Pillow refusing outright the
moment it's asked to do something JPEG's format cannot represent. This is
exactly the `convert("RGB")` line's entire reason to exist in the real
`convert_images_in_folder`; restoring it fixes the error immediately.

## Connect the pieces

Both tools built today share one shape, traced through a single file:
`img_0001.PNG` first passes through `batch_rename`'s dry run (previewed,
not yet touched), then its real run (`os.rename` actually applied,
becoming `img_0001.png`), and only then does that renamed file become
input to `convert_images_in_folder`'s own dry run and real run, ending as
`img_0001.jpg`. At every stage — rename or convert — the exact same
sequence happened: plan the full set of changes first, print the plan,
and only act on it in a second, separate pass.

## Definition of done

- [ ] `python3 -m venv .venv` and `.venv/bin/pip install Pillow` succeed,
      and `.venv/bin/python3 -c "import PIL"` runs with no error.
- [ ] `batch_rename`'s dry run and real run show identical planned
      changes, and the real run actually renames the files on disk.
- [ ] A file that needs no renaming (already clean) does not appear in
      either the dry-run or real-run output.
- [ ] `convert_images_in_folder` correctly skips a non-image file with a
      clear message instead of crashing the whole batch.
- [ ] You can reproduce the `OSError: cannot write mode RGBA as JPEG`
      failure on purpose, and explain in one sentence why `convert("RGB")`
      prevents it.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add batch_rename.py batch_convert_images.py
  git commit -m "Add batch rename and batch image conversion tools, both dry-run by default — previews the full planned change before any file on disk is touched"
  ```

## What's next

Both tools here process a folder once, on demand. Lesson 15's
auto-organize-Downloads lesson (already built, using Lesson 14's
directory watcher) is the natural next combination: pointing a directory
watcher at these same dry-run-capable functions would turn either one
into something that runs automatically the moment a new file appears,
rather than needing to be invoked by hand each time.
