# Concept: Python's `__name__`

**What you'll understand by the end:** what the built-in `__name__` variable is, and how Python decides its value.

**Prerequisites:** none.

## Setup

Python 3, no packages needed. Two files in the same folder.

## The Problem

A module sometimes needs to know whether it's the program that was launched, or a piece of code some other program imported. Python answers this with a variable every file gets automatically, without the programmer setting it.

## The Isolated Example

`greet_module.py`:
```python
print(f"greet_module's __name__ is {__name__!r}")
```

`main.py`, in the same folder:
```python
import greet_module
print(f"main's __name__ is {__name__!r}")
```

**Run it:**
```
python main.py
```

**Real output:**
```
greet_module's __name__ is 'greet_module'
main's __name__ is '__main__'
```

**What this proves:** the file run directly (`main.py`) gets the literal string `"__main__"`. The file merely *imported* by it (`greet_module.py`) gets its own module name instead. Same variable name, different value, depending only on how the file was reached — never a value either file set itself.

## Mechanical Walkthrough

- Every Python file, when loaded — whether run directly or imported — has `__name__` set automatically by the interpreter before any of the file's own code runs.
- Running a file directly (`python main.py`) sets that file's `__name__` to the literal string `"__main__"`.
- Importing a file (`import greet_module`) sets *that* file's `__name__` to its own module name (derived from the filename) instead.

## CS Lens

This is a form of **reflection** — code inspecting facts about its own execution context (here, "was I the entry point?") rather than being told the answer by an argument or configuration file.

Also recognized in: any language with a module/import system needing to answer "am I the entry point or a dependency" — Node.js's `require.main === module`, Java's designated `public static void main` method being the equivalent question asked with different syntax.

## SE Lens

The alternative — requiring every file to explicitly declare "I am/am not the entry point" via some configuration — would need extra bookkeeping kept in sync by hand. Deriving it automatically from *how the file was actually reached* means it's always correct with zero configuration, at the cost of a piece of "magic" a reader has to be taught once (this file exists for exactly that reason) before it stops looking mysterious.

## Connection

Directly enables `python-if-name-main-idiom.md` — the extremely common `if __name__ == "__main__":` pattern is built entirely on the fact demonstrated here. A library (e.g. a real web framework) commonly uses this fact to locate a file on disk relative to itself, since it can tell which physical file is asking.

## Try It Yourself

1. Add a third file that imports `main` (not `greet_module`) and run it. Predict what prints before running.
2. Move `greet_module.py` into a subfolder and adjust the import (`from subfolder import greet_module`, with an `__init__.py` if needed). Does `__name__`'s value for `greet_module.py` change to reflect the subfolder?
3. Add `print(__name__)` as the very first line of `main.py`, before the `import`. Does it print `'main'` or `'__main__'`? What does that tell you about *when* `__name__` gets set relative to a file's own code running?
