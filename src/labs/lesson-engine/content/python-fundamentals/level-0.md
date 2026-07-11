---
series: python-fundamentals
level: 0
title: What Programming Is
lang: python
---

# What Programming Is

A program is a sequence of instructions stored as plain text. When you run it, something reads those instructions and carries them out one by one. In Python, that something is the **interpreter** — a program that reads your code, understands it, and executes it.

This lesson is not about Python syntax. It is about what is actually happening when you write code and click Run. Every lesson after this one builds on that mental model.

By the end you will be able to write and run your first Python program, and you will know — precisely — what happens between the moment you click Run and the moment output appears.

## A Program Is a List of Instructions

When a chef follows a recipe, they read each step in order, carry it out, then move to the next. A program works the same way.

```text
Step 1: Read the first instruction.
Step 2: Execute it.
Step 3: Read the next instruction.
Step 4: Execute it.
Step 5: Repeat until there are no more instructions.
```

That is it. That is all a program is. The instructions are written in source code — a plain text file that a human wrote and a machine reads.

Here is a Python program with two instructions:

```python
print("Hello, world!")
print("Python is running your code.")
```

Click Run. Python executes line 1 (`print("Hello, world!")`), then line 2. Nothing more.

**CS lens:** This execution model is called **sequential execution** — the default mode of every program. Instructions run in the order they appear unless something explicitly changes that order (a loop, a branch, a function call). You will see those later. For now, everything runs top to bottom.

**SE lens:** The most readable code is code that reads like a recipe — steps in the order they happen, with names that say what they do. A professional engineer can read code they have never seen before because it was written to be read, not just executed.

## Source Code Is Just Text

Open any `.py` file in a text editor. What you see is exactly what Python sees: characters, spaces, and newlines. There is nothing hidden, no compiled binary, no special format. The file `hello.py` containing `print("Hello")` is seventeen characters of plain text.

This matters because it means you can read any Python program — including programs that power NASA satellites, Instagram, and machine learning models at Google — using nothing but your eyes and an understanding of the language. Source code is public, portable, and permanent.

**What Python does with that text:**

```text
Your text:   print("Hello, world!")

Step 1: Tokenise — break the text into recognisable units
        ["print", "(", '"Hello, world!"', ")"]

Step 2: Parse — understand the structure
        "This is a function call: call print with the argument Hello, world!"

Step 3: Execute — carry out the instruction
        Write Hello, world! to the output.
```

You do not need to know the details of tokenising or parsing yet. What matters is that Python is not magic — it is a program that reads text and does things with it.

## print() — Your First Instruction

`print()` is a **built-in function** — a named action that Python knows how to perform without any setup. It takes one or more values, converts them to text, and writes that text to the output followed by a newline.

- `print` — the function name
- `(` `)` — parentheses that contain the input (called the **argument**)
- `"Hello, world!"` — the argument: a piece of text

A piece of text in Python is called a **string**. You create a string by surrounding characters with quotes. `"Hello"` and `'Hello'` are the same string — Python accepts both single and double quotes.

The output goes to **stdout** (standard output) — the standard channel for a program's text output. In the lesson engine, stdout appears in the Output tab on the right. On a real machine, it appears in the terminal window.

```python
print("The output appears here.")
print('Single quotes work too.')
print("You can print numbers:", 42)
```

Run this. The output tab shows three lines. Each `print()` call produces one line because Python adds a newline after each one automatically.

## Writing Code That Can Be Tested

The lesson engine tests your code by calling functions you write. A **function** is a named block of code you define once and can call many times. The full treatment of functions is in Level 19 — but you need the container now so the challenges can work.

Here is the shape every challenge in this series uses:

```text
def function_name(parameter):
    return result
```

- `def` — keyword that begins a function definition
- `function_name` — the name you give the function
- `(parameter)` — the input the function receives
- `return` — keyword that sends a value back to whoever called the function
- `result` — the value returned

You will use this shape in every challenge. You are not expected to understand all of it yet — that understanding comes in Level 19. For now: `def` defines, `return` sends the answer back.

```python
def greet(name):
    return "Hello, " + name + "!"

print(greet("Ada"))
print(greet("Python"))
```

Click Run. The code calls `greet` twice — once with `"Ada"`, once with `"Python"`. Each call hands the value to `name` inside the function, the function builds a string and hands it back with `return`, and `print()` displays the result.

**Enable Debug and step through this.** Watch `name` appear in the variables panel the moment `greet` is called, then disappear when it returns. That disappearance is real — the variable only exists while the function is running.

## Challenge: introduce_yourself

Write a function `introduce(name, language)` that returns a string in the format:
`"My name is Ada and I write Python."`

`+` — concatenates (joins) two strings. `"Hello" + " " + "World"` produces `"Hello World"`.

The function takes two strings and returns one string. The returned string must use the exact format shown above.

```challenge
def introduce(name, language):
    pass
```

```test
assert introduce("Ada", "Python") == "My name is Ada and I write Python."
assert introduce("Grace", "Fortran") == "My name is Grace and I write Fortran."
assert introduce("Linus", "C") == "My name is Linus and I write C."
assert introduce("Guido", "Python") == "My name is Guido and I write Python."
```
