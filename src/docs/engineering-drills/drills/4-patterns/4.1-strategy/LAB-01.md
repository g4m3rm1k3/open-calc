# DRILL 4.1 — Strategy Pattern: Swappable Algorithms

**Series:** Design Patterns | **Difficulty:** Intermediate | **Time:** 60–90 min  
**Project:** Text Formatter — a small app that formats text as plain, Markdown, HTML, or JSON

---

## Quick Check

Answer these before reading. Check your answers at the bottom.

1. You have a function with `if style == "plain": ... elif style == "markdown": ...`. You add a new format. How many places in the codebase might need to change?
2. What does the Open/Closed Principle say? Open for what, closed for what?
3. A `PlainFormatter` and a `MarkdownFormatter` both have a `format(text)` method. What is that called?
4. You pass a `HtmlFormatter` to a function that expects a `TextFormatter`. The function calls `formatter.format(text)`. Which `format` runs?

---

## What It Is

The Strategy pattern packages each variant of an algorithm into its own class behind a shared interface. The code that uses the algorithm — the "context" — holds a reference to the interface, not to any specific implementation. You swap behavior by swapping the object.

The pattern has three parts:

1. **The interface** (or abstract base class) — declares the method every strategy must implement
2. **Concrete strategies** — each implements the interface with a different algorithm
3. **The context** — holds a strategy reference and calls the interface method; never knows which strategy it has

---

## Pattern Category

**GoF Behavioral.** Behavioral patterns are about how objects communicate and distribute responsibility. Strategy is specifically about making algorithms interchangeable at runtime.

---

## The Problem Before

You write one function with an `if/elif/else` chain. At first it's clean. Then someone adds a new format. The chain grows. Then a second function needs to branch on the same condition. Now the condition is duplicated. Now a third function. Now changing one format requires hunting through the entire codebase for every branch that mentions it.

This violates the **Open/Closed Principle**: software should be open for extension (adding new behavior) but closed for modification (existing code doesn't change). A growing `if/elif` chain is the opposite — adding behavior forces modification everywhere.

---

## The Solution

Each algorithm gets its own class. The class implements a shared interface. The caller holds the interface, not the class. Adding a new algorithm means adding one new class — nothing else changes.

---

## What It Hides (Abstractions)

- **Dynamic dispatch:** When you call `formatter.format(text)`, Python looks up `format` on the actual object at runtime, not at the call site. The caller never sees this lookup.
- **Polymorphism:** The mechanism that makes `formatter.format(text)` call the right method depending on which concrete class `formatter` actually is.
- **The ABC machinery:** `@abstractmethod` and `ABC` base class enforce the interface contract at instantiation time, not at call time. If a subclass forgets `format()`, the error happens when you try to create it — not when you call `format()` on a `None` later.

---

## Canonical Example

```python
# Sorting uses Strategy everywhere.
# The key= parameter IS a strategy — a swappable algorithm for comparison.

items = ["banana", "apple", "cherry"]
items.sort(key=len)          # strategy: sort by string length
items.sort(key=str.lower)    # strategy: sort case-insensitively
items.sort(key=lambda x: x[-1])  # strategy: sort by last character

# The sort algorithm itself doesn't change.
# Only the comparison strategy changes.
```

---

## Project Application

You will build a text formatter. First with `if/elif`. Then you'll see exactly what breaks when you add a new format. Then you'll refactor to Strategy and add two more formats by touching nothing but new files.

---

## Constraints

- Python 3.8+
- No third-party packages
- `abc` module from the standard library only

---

## Failure Modes

| Symptom | Root Cause |
|---|---|
| `TypeError: Can't instantiate abstract class X with abstract method format` | Your concrete strategy forgot to implement `format()` |
| Adding a format breaks existing tests | You modified the context instead of adding a new class |
| `if isinstance(formatter, HtmlFormatter)` appears in context code | The context is peeking at the strategy type — defeats the purpose |
| Every strategy has slightly different method signatures | Interface wasn't defined first; strategies drifted apart |

---

## Tradeoff

More classes for more formats. A project with 20 formatting strategies has 20 classes. For a simple two-format switch that never changes, `if/elif` is fine and Strategy is overkill. The pattern pays off when: (a) the number of variants grows, (b) variants are added by different people or at different times, or (c) variants need to be swapped at runtime based on user input or configuration.

---

## Operational Reality

In production codebases:

- Payment processors use Strategy: `StripeStrategy`, `PaypalStrategy`, `BraintreeStrategy` all implement `charge(amount)`. The checkout flow never changes when you add a new processor.
- Compression libraries use Strategy: `GzipStrategy`, `ZlibStrategy`, `BrotliStrategy` all implement `compress(data)`. HTTP servers swap them based on the `Accept-Encoding` header.
- React rendering uses Strategy: the reconciler calls a `render()` method without caring whether the component is a class component, function component, or memo component.
- Django template engines use Strategy: you can swap Jinja2 for the default engine by changing one config value — the view code never changes.

---

## You Will See This Again In

- Sorting comparators (`key=` functions, `Comparator` in Java)
- Payment processors (Stripe, PayPal, etc. behind one interface)
- Compression algorithms (gzip, zstd, brotli — same `compress(data)` call)
- React render strategies (class vs. function components)
- Authentication backends (Django's `AUTHENTICATION_BACKENDS` setting)
- Logging handlers (file, console, remote — all implement `emit(record)`)
- Game AI (easy/medium/hard are strategies implementing `choose_move(board)`)

---

## Watch For

- **Strategy creep:** using Strategy when a simple function reference would do. Python functions are first-class objects — sometimes `formatter = plain_format` is enough and a full class hierarchy is overkill.
- **Fat interfaces:** an interface with 10 methods forces every strategy to implement 10 methods even if it only needs 2. Keep strategy interfaces narrow.
- **Context knowing too much:** if the context imports concrete strategy classes to check `isinstance()`, the decoupling is broken. The context should only ever import the interface.
- **Missing the default:** always decide what happens when no strategy is set. Raise an error immediately, or use a sensible default — never let it silently produce wrong output.

---

## Step 1 — The `if/elif` Version

Start here. This works. We are going to show exactly how it fails.

Create this directory structure:

```
text-formatter/
    formatter.py
```

Create `formatter.py`:

```python
# formatter.py
# The naive approach: one function, one big conditional.
# This works fine for two formats.
# We will add a third and fourth and watch the pain grow.

def format_text(text: str, style: str) -> str:
    # Every time we add a new format, this function changes.
    # Every caller that passes a style string is coupled to this list.
    # If we rename "markdown" to "md", every call site breaks.
    
    if style == "plain":
        # Plain: strip any special characters, return as-is
        # "Plain" means no markup — just the raw string
        return text
    
    elif style == "markdown":
        # Markdown: wrap in double asterisks for bold
        # In real Markdown, **text** renders as bold
        return f"**{text}**"
    
    elif style == "html":
        # HTML: wrap in <strong> tags
        # <strong> is the semantic HTML element for importance/bold
        return f"<strong>{text}</strong>"
    
    else:
        # Unknown style: we have to decide — crash or silently return?
        # Crashing is better. Silent wrong output causes hard-to-find bugs.
        raise ValueError(f"Unknown style: '{style}'. Expected: plain, markdown, html")


# A second function that also needs to branch on style.
# Notice: we're duplicating the same conditional logic.
# This is the warning sign — the condition is spreading.
def wrap_in_block(text: str, style: str) -> str:
    if style == "plain":
        return f"[{text}]"
    elif style == "markdown":
        return f"```\n{text}\n```"
    elif style == "html":
        return f"<div>{text}</div>"
    else:
        raise ValueError(f"Unknown style: '{style}'")


if __name__ == "__main__":
    sample = "Hello, World"
    
    for style in ["plain", "markdown", "html"]:
        formatted = format_text(sample, style)
        wrapped = wrap_in_block(sample, style)
        print(f"[{style:10}] format: {formatted}")
        print(f"[{style:10}] block:  {wrapped}")
        print()
```

### SAVE AND TRY

```
cd text-formatter
python formatter.py
```

**Expected output:**
```
[plain     ] format: Hello, World
[plain     ] block:  [Hello, World]

[markdown  ] format: **Hello, World**
[markdown  ] block:  ```
Hello, World
```

[html      ] format: <strong>Hello, World</strong>
[html      ] block:  <div>Hello, World</div>

```

**Change something:** Call `format_text("test", "csv")`. You get a `ValueError`. Now imagine this crash happens in production because someone passed an unsupported format from a config file. That's the second failure mode of the `if/elif` approach — you can't validate at configuration time, only at call time.

---

## Step 2 — Adding a Fourth Format (Show the Pain)

Add JSON output. Watch how many places need to change.

Update `formatter.py`:

```python
# formatter.py — adding JSON format
# COUNT THE EDITS. This is the argument for Strategy.

def format_text(text: str, style: str) -> str:
    if style == "plain":
        return text
    elif style == "markdown":
        return f"**{text}**"
    elif style == "html":
        return f"<strong>{text}</strong>"
    elif style == "json":
        # NEW: JSON output — wrap the text as a JSON object
        # We have to import json here, or at the top of the file.
        # This is a side effect of adding a format: new imports leak into the module.
        import json
        return json.dumps({"content": text, "format": "json"})
    else:
        raise ValueError(f"Unknown style: '{style}'. Expected: plain, markdown, html, json")
    #                                                  ^^^^ also updated the error message


def wrap_in_block(text: str, style: str) -> str:
    if style == "plain":
        return f"[{text}]"
    elif style == "markdown":
        return f"```\n{text}\n```"
    elif style == "html":
        return f"<div>{text}</div>"
    elif style == "json":
        # NEW: also need to add JSON here
        import json
        return json.dumps({"block": text})
    else:
        raise ValueError(f"Unknown style: '{style}'")


if __name__ == "__main__":
    sample = "Hello, World"
    
    for style in ["plain", "markdown", "html", "json"]:
        formatted = format_text(sample, style)
        wrapped = wrap_in_block(sample, style)
        print(f"[{style:10}] format: {formatted}")
        print(f"[{style:10}] block:  {wrapped}")
        print()
```

### SAVE AND TRY

```
python formatter.py
```

**Expected output:**
```
[plain     ] format: Hello, World
[plain     ] block:  [Hello, World]

[markdown  ] format: **Hello, World**
[markdown  ] block:  ```
Hello, World
```

[html      ] format: <strong>Hello, World</strong>
[html      ] block:  <div>Hello, World</div>

[json      ] format: {"content": "Hello, World", "format": "json"}
[json      ] block:  {"block": "Hello, World"}

```

**Count the edits to add JSON:**
- Line added to `format_text`: 3 (elif, import, return)
- Line added to `wrap_in_block`: 3 (elif, import, return)
- Error message updated: 2 places
- Total: **8 lines changed in existing code** to add one format

With Strategy, adding a format touches **0 existing lines**. You add one new file. That is the entire argument.

---

## Step 3 — Define the Strategy Interface

Now refactor. Start from scratch with a new file structure.

```
text-formatter/
    formatter.py          (keep for reference)
    strategy/
        __init__.py
        base.py
        plain.py
        markdown.py
        html.py
```

Create `strategy/__init__.py` (empty — makes `strategy/` a package).

Create `strategy/base.py`:

```python
# strategy/base.py
# The interface every formatter must implement.
# This file should almost never change.
# Adding a new format = adding a new file, not touching this one.

from abc import ABC, abstractmethod
# ABC = Abstract Base Class. It's the machinery that enforces the interface.
# abstractmethod = decorator that marks a method as "must be implemented by subclasses"


class TextFormatter(ABC):
    # ABC as a base class activates Python's abstract class system.
    # You cannot instantiate TextFormatter() directly —
    # Python raises TypeError if you try.
    
    @abstractmethod
    def format(self, text: str) -> str:
        # This method signature IS the interface contract.
        # Every concrete strategy must accept a str and return a str.
        # The body here is never called — it's documentation.
        ...
    
    @abstractmethod
    def wrap_in_block(self, text: str) -> str:
        # Second method in the interface.
        # Every formatter must implement both.
        ...
    
    def describe(self) -> str:
        # Non-abstract method: concrete strategies INHERIT this for free.
        # They can override it, but they don't have to.
        # This is how you share behavior across strategies without duplicating it.
        return f"{self.__class__.__name__} formatter"
```

### SAVE AND TRY

```python
# Run this in a Python shell from the text-formatter/ directory
python -c "
import sys
sys.path.insert(0, '.')
from strategy.base import TextFormatter

# Try to instantiate the abstract class directly
try:
    f = TextFormatter()
except TypeError as e:
    print(f'Correct: {e}')
"
```

**Expected output:**
```
Correct: Can't instantiate abstract class TextFormatter with abstract methods format, wrap_in_block
```

**Change something:** Remove `@abstractmethod` from `format` in `base.py`. Try instantiating `TextFormatter()` again — it succeeds, which is wrong. A formatter with no implementation can now be passed anywhere. Put `@abstractmethod` back. This is what the decorator buys you: early failure with a clear error, not late failure with a confusing `AttributeError` or silent wrong output.

---

## Step 4 — Three Concrete Strategies

Create `strategy/plain.py`:

```python
# strategy/plain.py
# The Plain strategy. One job: format text as plain text.
# This class has no knowledge of Markdown or HTML.
# It cannot affect them. It cannot be affected by changes to them.

from strategy.base import TextFormatter
# We import the interface, not a specific implementation.
# This is the direction all dependencies should point:
# toward the interface, never toward a sibling strategy.


class PlainFormatter(TextFormatter):
    # Inheriting from TextFormatter does two things:
    # 1. Forces us to implement format() and wrap_in_block() (or get TypeError)
    # 2. Makes this class substitutable anywhere TextFormatter is expected
    
    def format(self, text: str) -> str:
        # Plain format: return text unchanged.
        # No markup, no escaping, no transformation.
        return text
    
    def wrap_in_block(self, text: str) -> str:
        # Plain block: simple bracket notation
        # [text] is readable in a terminal without any renderer
        return f"[{text}]"
```

Create `strategy/markdown.py`:

```python
# strategy/markdown.py
# The Markdown strategy. Knows Markdown syntax. Knows nothing else.

from strategy.base import TextFormatter


class MarkdownFormatter(TextFormatter):
    
    def format(self, text: str) -> str:
        # **text** is Markdown bold syntax.
        # The double asterisks tell a Markdown renderer to make this bold.
        return f"**{text}**"
    
    def wrap_in_block(self, text: str) -> str:
        # Fenced code block: ``` before and after
        # The \n ensures the content is on its own line
        return f"```\n{text}\n```"
```

Create `strategy/html.py`:

```python
# strategy/html.py
# The HTML strategy. Knows HTML. Knows nothing about Markdown.
# If Markdown changes its bold syntax, this file is untouched.

from strategy.base import TextFormatter


class HtmlFormatter(TextFormatter):
    
    def format(self, text: str) -> str:
        # <strong> is the semantic HTML element for strong importance.
        # We also HTML-escape the text to prevent injection.
        # If text contains "<", we must escape it to "&lt;" — otherwise
        # the browser treats it as a tag, which is a security hole.
        escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        return f"<strong>{escaped}</strong>"
    
    def wrap_in_block(self, text: str) -> str:
        # <div> is a generic block container in HTML.
        escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        return f"<div>{escaped}</div>"
```

### SAVE AND TRY

```python
# test each strategy in isolation — this is now possible
python -c "
import sys; sys.path.insert(0, '.')
from strategy.plain import PlainFormatter
from strategy.markdown import MarkdownFormatter
from strategy.html import HtmlFormatter

strategies = [PlainFormatter(), MarkdownFormatter(), HtmlFormatter()]
text = 'Hello, World'

for s in strategies:
    print(f'{s.describe()}: {s.format(text)}')
"
```

**Expected output:**
```
PlainFormatter formatter: Hello, World
MarkdownFormatter formatter: **Hello, World**
HtmlFormatter formatter: <strong>Hello, World</strong>
```

**Change something:** Pass `text = "2 < 3"` to all three formatters. The HTML formatter outputs `2 &lt; 3` inside the tags — safe HTML. The others output `2 < 3` unchanged. Try adding `& < >` to the plain and Markdown formatters without escaping — nothing breaks because those formats don't interpret `<` as a tag. Each strategy handles its own edge cases. That's the point.

---

## Step 5 — The Context: `TextProcessor`

The context is the code that uses a strategy. It holds a reference to the interface. It never changes when formats are added.

Create `processor.py` in `text-formatter/`:

```python
# processor.py
# The context class. This is what callers use.
# It is completely isolated from every concrete strategy.
# Adding a new format does not touch this file.

from strategy.base import TextFormatter
# Notice: we only import the BASE CLASS.
# PlainFormatter, MarkdownFormatter, HtmlFormatter are not imported here.
# This file doesn't know they exist.


class TextProcessor:
    
    def __init__(self, formatter: TextFormatter):
        # The formatter is injected at construction time.
        # "Dependency injection" — the dependency (formatter) comes in from outside.
        # TextProcessor doesn't decide which formatter to use; the caller does.
        
        if not isinstance(formatter, TextFormatter):
            # Guard: catch a wrong argument early with a clear message.
            # Without this, the error appears later as AttributeError: 
            # 'str' object has no attribute 'format' — confusing.
            raise TypeError(f"Expected a TextFormatter, got {type(formatter).__name__}")
        
        self._formatter = formatter
        # Prefix with _ to signal "internal detail — don't access from outside"
    
    def set_formatter(self, formatter: TextFormatter) -> None:
        # Strategy can be swapped at runtime — no reconstruction needed.
        # This is the runtime-swappable behavior the pattern is named for.
        if not isinstance(formatter, TextFormatter):
            raise TypeError(f"Expected a TextFormatter, got {type(formatter).__name__}")
        self._formatter = formatter
    
    def process(self, text: str) -> str:
        # Call the strategy. We do not know which one.
        # Python resolves the actual method at runtime via dynamic dispatch.
        formatted = self._formatter.format(text)
        return formatted
    
    def process_block(self, text: str) -> str:
        return self._formatter.wrap_in_block(text)
    
    def describe(self) -> str:
        # Delegates describe() to whatever strategy is currently set.
        return f"TextProcessor using: {self._formatter.describe()}"


if __name__ == "__main__":
    from strategy.plain import PlainFormatter
    from strategy.markdown import MarkdownFormatter
    from strategy.html import HtmlFormatter
    # We import concrete classes HERE, in the entry point.
    # The processor itself never imports them.
    
    sample = "Hello, World"
    
    # Create one processor, swap strategies
    processor = TextProcessor(PlainFormatter())
    print(processor.describe())
    print(processor.process(sample))
    print(processor.process_block(sample))
    print()
    
    # Swap to Markdown — the processor code didn't change
    processor.set_formatter(MarkdownFormatter())
    print(processor.describe())
    print(processor.process(sample))
    print(processor.process_block(sample))
    print()
    
    # Swap to HTML
    processor.set_formatter(HtmlFormatter())
    print(processor.describe())
    print(processor.process(sample))
    print(processor.process_block(sample))
```

### SAVE AND TRY

```
python processor.py
```

**Expected output:**
```
TextProcessor using: PlainFormatter formatter
Hello, World
[Hello, World]

TextProcessor using: MarkdownFormatter formatter
**Hello, World**
```
Hello, World
```

TextProcessor using: HtmlFormatter formatter
<strong>Hello, World</strong>
<div>Hello, World</div>
```

**Change something:** Try passing a string directly: `TextProcessor("plain")`. You get `TypeError: Expected a TextFormatter, got str`. This is the guard working — the error is immediate and descriptive. Without the guard, you'd get `AttributeError: 'str' object has no attribute 'format'` buried inside `process()`, after the wrong object has already traveled through your system.

---

## Step 6 — Adding a Fifth Format (Nothing Else Changes)

Add JSON output. This is the payoff step. Create one file. Touch nothing else.

Create `strategy/json_fmt.py`:

```python
# strategy/json_fmt.py
# A new format added to the system.
# Files changed to add this format: 1 (this one).
# Files that needed editing: 0.
# Tests that broke: 0.
# That is Open/Closed in action.

import json
# The json import lives here, in the strategy that needs it.
# It does not leak into the base class, the processor, or other strategies.

from strategy.base import TextFormatter


class JsonFormatter(TextFormatter):
    
    def format(self, text: str) -> str:
        # Produce a JSON object with the text as a value.
        # json.dumps handles escaping automatically —
        # if text contains quotes or backslashes, they are escaped correctly.
        return json.dumps({"content": text, "format": "json"})
    
    def wrap_in_block(self, text: str) -> str:
        # A JSON block wraps text in a "block" key
        return json.dumps({"block": text, "type": "container"}, indent=2)
```

Now add a fifth: RSS/XML format. Still one file.

Create `strategy/xml_fmt.py`:

```python
# strategy/xml_fmt.py
# A fifth format. Still one new file. Still nothing else changes.

from strategy.base import TextFormatter


class XmlFormatter(TextFormatter):
    
    def format(self, text: str) -> str:
        # XML entity escaping — & must become &amp; first (order matters!)
        # If you escape < before &, you'd double-escape the & in &amp; to &amp;amp;
        escaped = (text
                   .replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace('"', "&quot;"))
        return f"<text>{escaped}</text>"
    
    def wrap_in_block(self, text: str) -> str:
        escaped = (text
                   .replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;"))
        return f"<block><![CDATA[{text}]]></block>"
        # CDATA sections don't need escaping — the parser treats everything
        # inside as literal text. This is the XML way to embed raw strings.
```

### SAVE AND TRY

```
python -c "
import sys; sys.path.insert(0, '.')
from processor import TextProcessor
from strategy.plain import PlainFormatter
from strategy.markdown import MarkdownFormatter
from strategy.html import HtmlFormatter
from strategy.json_fmt import JsonFormatter
from strategy.xml_fmt import XmlFormatter

processor = TextProcessor(PlainFormatter())
sample = 'Hello & World <test>'

all_formatters = [
    PlainFormatter(),
    MarkdownFormatter(),
    HtmlFormatter(),
    JsonFormatter(),
    XmlFormatter(),
]

for fmt in all_formatters:
    processor.set_formatter(fmt)
    print(f'{fmt.describe()}:')
    print(f'  format: {processor.process(sample)}')
"
```

**Expected output:**
```
PlainFormatter formatter:
  format: Hello & World <test>
MarkdownFormatter formatter:
  format: **Hello & World <test>**
HtmlFormatter formatter:
  format: <strong>Hello &amp; World &lt;test&gt;</strong>
JsonFormatter formatter:
  format: {"content": "Hello & World <test>", "format": "json"}
XmlFormatter formatter:
  format: <text>Hello &amp; World &lt;test&gt;</text>
```

**Change something:** Look at `processor.py`. It does not import `JsonFormatter` or `XmlFormatter`. Open `strategy/base.py`. It does not mention JSON or XML. The processor and the interface are both closed for modification and open for extension — exactly as the principle states. Comment out `XmlFormatter` from the test and confirm the other four still work without a single change.

---

## Final State

```
text-formatter/
    formatter.py          (original if/else version — keep for comparison)
    processor.py          (the context)
    strategy/
        __init__.py
        base.py           (the interface)
        plain.py          (concrete strategy 1)
        markdown.py       (concrete strategy 2)
        html.py           (concrete strategy 3)
        json_fmt.py       (concrete strategy 4 — added with zero edits elsewhere)
        xml_fmt.py        (concrete strategy 5 — added with zero edits elsewhere)
```

### SAVE AND TRY (Full Verification)

```
python processor.py
```
Expected: three blocks of output — Plain, Markdown, HTML — each with a `describe`, `process`, and `process_block` line.

```
python -c "
import sys; sys.path.insert(0, '.')
from strategy.html import HtmlFormatter
f = HtmlFormatter()
# Confirm HTML escaping works on injection attempt
result = f.format('<script>alert(1)</script>')
print(result)
assert '<script>' not in result, 'XSS vulnerability!'
print('Escaping works correctly')
"
```
Expected:
```
<strong>&lt;script&gt;alert(1)&lt;/script&gt;</strong>
Escaping works correctly
```

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a sorting system where the sort algorithm is a Strategy. The client code sorts a list without knowing which algorithm runs. Add a `TimedSortStrategy` that wraps any strategy and measures how long it takes.

**Starter:**

```python
# sorting/base.py
from abc import ABC, abstractmethod

class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data: list) -> list:
        # Must return a NEW list — do not sort in place.
        # The caller's original list must be unchanged.
        ...

# sorting/sorter.py
from sorting.base import SortStrategy

class Sorter:
    def __init__(self, strategy: SortStrategy):
        self._strategy = strategy
    
    def sort(self, data: list) -> list:
        return self._strategy.sort(data)
    
    def set_strategy(self, strategy: SortStrategy) -> None:
        self._strategy = strategy
```

**Requirements checklist:**

- [ ] `BubbleSortStrategy` implements `SortStrategy` using a bubble sort loop (no `sorted()`)
- [ ] `MergeSortStrategy` implements `SortStrategy` using recursive merge sort (no `sorted()`)
- [ ] `QuickSortStrategy` implements `SortStrategy` using quicksort with a pivot (no `sorted()`)
- [ ] `TimedSortStrategy` wraps any `SortStrategy` — it calls the inner strategy's `sort()` and prints how long it took (use `time.perf_counter()`)
- [ ] `TimedSortStrategy` itself implements `SortStrategy` so it can be passed to `Sorter`
- [ ] Running `Sorter(TimedSortStrategy(BubbleSortStrategy())).sort(data)` prints the elapsed time and returns the correct sorted list
- [ ] A main script generates a list of 1000 random integers and prints the time for all three algorithms
- [ ] `Sorter` never imports `BubbleSortStrategy`, `MergeSortStrategy`, or `QuickSortStrategy`

**When done:** Run your main script. Bubble sort should be noticeably slower than merge and quick sort on 1000 items. If all three times are similar, your bubble sort implementation may be using Python's built-in sort somewhere — check that you wrote the loop manually.

**Stuck? Ask AI:** "I'm implementing the Strategy pattern in Python for sorting algorithms. My TimedSortStrategy needs to wrap any SortStrategy and measure its execution time while still implementing the SortStrategy interface itself. How do I structure the wrapping so it works with dependency injection?"

---

## Quick Check Answers

1. **At least two places** — both `format_text` and `wrap_in_block` have branches on style. In a larger codebase, the conditional may be duplicated in dozens of places. Every duplication is a place the edit can be missed.

2. **Open for extension, closed for modification.** You should be able to add new behavior (open for extension) without editing existing, working code (closed for modification). A growing `if/elif` chain violates this because adding a variant always modifies the existing function.

3. **Implementing a shared interface** (or protocol). Both classes have the same method signature. Code that depends on the interface can call `format(text)` on either one without knowing which it has.

4. **The `HtmlFormatter`'s `format` runs.** Python resolves method calls at runtime on the actual object, not on the declared type. This is dynamic dispatch / polymorphism. The function receives a `TextFormatter` reference, but the call `formatter.format(text)` looks up `format` on whatever object is actually there.
