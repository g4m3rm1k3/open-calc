# Lesson 02 — Buttons and Types

## What You Will Build

A clickable button grid. Every button logs its type and value to the browser
console when clicked. This is the first TypeScript file in the project, and the
first demonstration of why TypeScript exists.

By the end of this lesson you will have a calculator face with a working button
grid. Open the console in your browser, click a button, and see its type appear.

## What You Need to Know First

Lesson 01 — the HTML and CSS shell. This lesson adds buttons to the `.calculator`
div and writes the first TypeScript to handle clicks.

---

## The Lesson

### The problem

The calculator has many different kinds of buttons: digits, operators, equals,
clear, decimal point, parentheses. They look different and behave differently.
Before any button does anything useful, we need to answer a design question:
how do we represent what kind of button something is?

The naive answer is strings: `'digit'`, `'operator'`, `'equals'`. This works until
someone types `'opertor'` — a typo that JavaScript accepts without complaint and
that causes a silent bug at runtime. We will not accept silent bugs.

---

### Step 1 — Project setup

Before writing TypeScript, set up the toolchain. This is the moment TypeScript
enters the project — not speculatively, but because we are about to write our
first logic file.

Create `package.json`:

```json
{
  "name": "calculator",
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**CS lens — compiled vs interpreted:**
JavaScript is interpreted: the browser runs it directly. TypeScript is compiled:
a separate step converts it to JavaScript before the browser sees it. That step
is where type errors are caught. A typo in a type annotation fails the compile
step with a clear message — before the code ever runs. This is the fundamental
difference between a compiled and an interpreted language.

**SE lens — `strict: true`:**
`strict` is not one option. It enables a group of checks that together catch
the most common class of TypeScript errors: implicit `any` types, missing null
checks, unchecked function parameters. Without `strict: true`, TypeScript's
type system has large holes. With it, the holes are closed. This is the first
line of every TypeScript project in this curriculum.

---

### Step 2 — The ButtonType enum

Create `src/types.ts`:

```typescript
export const ButtonType = {
  DIGIT:    'DIGIT',
  OPERATOR: 'OPERATOR',
  EQUALS:   'EQUALS',
  CLEAR:    'CLEAR',
  DECIMAL:  'DECIMAL',
  PAREN:    'PAREN',
} as const

export type ButtonType = typeof ButtonType[keyof typeof ButtonType]
```

**CS lens — enums as a type contract:**
`ButtonType.DIGIT` is a name that resolves to the string `'DIGIT'`. But unlike
a plain string, the type system knows the complete set of valid values. If you
write `ButtonType.DIIGT`, TypeScript reports: "Property 'DIIGT' does not exist."
The error appears before the code runs. Compare this to a plain string: `'DIIGT'`
is valid JavaScript and produces a silent failure at runtime.

The `as const` makes the object's values literal types rather than general
strings. Without it, `ButtonType.DIGIT` has type `string`. With it, it has type
`'DIGIT'`. The difference matters when TypeScript checks exhaustiveness — whether
every possible `ButtonType` value is handled in a switch statement.

**SE lens — one place to add a type:**
When a new button type is needed in a future lesson, there is exactly one place
to add it: this object. Every function that uses `ButtonType` automatically gains
the ability to use the new value. If any switch statement that handles `ButtonType`
values is missing a case, TypeScript can warn about it. This is the open/closed
principle in practice: the set of button types is open for extension, and the
extension point is a single, obvious location.

---

### Step 3 — Button configuration

Create `src/buttons.ts`:

```typescript
import { ButtonType } from './types.js'

export interface ButtonConfig {
  label:      string
  type:       ButtonType
  value:      string
  cssClass?:  string
}

export const BUTTON_GRID: ButtonConfig[] = [
  { label: 'C',  type: ButtonType.CLEAR,    value: 'clear'  },
  { label: '(',  type: ButtonType.PAREN,    value: '('      },
  { label: ')',  type: ButtonType.PAREN,    value: ')'      },
  { label: '/',  type: ButtonType.OPERATOR, value: '/',     cssClass: 'operator' },
  { label: '7',  type: ButtonType.DIGIT,    value: '7'      },
  { label: '8',  type: ButtonType.DIGIT,    value: '8'      },
  { label: '9',  type: ButtonType.DIGIT,    value: '9'      },
  { label: '*',  type: ButtonType.OPERATOR, value: '*',     cssClass: 'operator' },
  { label: '4',  type: ButtonType.DIGIT,    value: '4'      },
  { label: '5',  type: ButtonType.DIGIT,    value: '5'      },
  { label: '6',  type: ButtonType.DIGIT,    value: '6'      },
  { label: '-',  type: ButtonType.OPERATOR, value: '-',     cssClass: 'operator' },
  { label: '1',  type: ButtonType.DIGIT,    value: '1'      },
  { label: '2',  type: ButtonType.DIGIT,    value: '2'      },
  { label: '3',  type: ButtonType.DIGIT,    value: '3'      },
  { label: '+',  type: ButtonType.OPERATOR, value: '+',     cssClass: 'operator' },
  { label: '0',  type: ButtonType.DIGIT,    value: '0',     cssClass: 'span-two' },
  { label: '.',  type: ButtonType.DECIMAL,  value: '.'      },
  { label: '=',  type: ButtonType.EQUALS,   value: '=',     cssClass: 'equals'  },
]
```

**CS lens — data-driven UI:**
The button grid is defined as data, not as HTML. The HTML will be generated from
this array. This means: to add a button, add an entry to the array. To change a
button's label, change the `label` field. The rendering code never changes.
This pattern — separating data from the code that renders it — is one of the most
important ideas in software. The UI is a function of the data.

**SE lens — the interface as a contract:**
`ButtonConfig` is a TypeScript interface. Every object in `BUTTON_GRID` must have
a `label`, `type`, and `value`. If you add an entry without a `label`, TypeScript
reports an error before the code runs. The interface is a contract between the
data definition and the rendering code. Both sides can evolve independently as long
as both honour the contract.

---

### Step 4 — Render the buttons

Create `src/main.ts`:

```typescript
import { BUTTON_GRID } from './buttons.js'
import { ButtonType }  from './types.js'

function renderButtons(): void {
  const calculator = document.querySelector('.calculator')
  if (calculator === null) {
    throw new Error('Calculator element not found in DOM')
  }

  const buttonGrid = document.createElement('div')
  buttonGrid.className = 'button-grid'

  for (const buttonConfig of BUTTON_GRID) {
    const button = document.createElement('button')
    button.textContent = buttonConfig.label
    button.dataset['type']  = buttonConfig.type
    button.dataset['value'] = buttonConfig.value

    if (buttonConfig.cssClass !== undefined) {
      button.classList.add(buttonConfig.cssClass)
    }

    button.addEventListener('click', () => {
      console.log(`Button clicked — type: ${buttonConfig.type}, value: ${buttonConfig.value}`)
    })

    buttonGrid.appendChild(button)
  }

  calculator.appendChild(buttonGrid)
}

renderButtons()
```

**CS lens — the event loop:**
`addEventListener('click', ...)` registers a function to be called when a click
event fires. The browser's event loop runs continuously, checking for events. When
the user clicks a button, the loop calls the registered function. Nothing in your
code runs until an event triggers it. This is event-driven programming: the program
is idle by default and responds to events. It is the opposite of a program that runs
from top to bottom and exits.

**SE lens — fail loudly:**
`if (calculator === null) { throw new Error(...) }` — TypeScript with `strict: true`
knows that `querySelector` can return `null`. Without the null check, the code after
it would try to call `.appendChild(buttonGrid)` on `null` and throw a confusing
runtime error. By checking and throwing immediately with a clear message, we fail
loudly at the point of the problem. Confusing errors happen far from their cause.
Clear errors happen exactly where the wrong thing happened.

---

### Step 5 — Style the button grid

Add to `style.css`, using the existing tokens and adding new ones:

```css
:root {
  /* add to existing tokens */
  --color-button-bg:       #1e293b;
  --color-button-text:     #e2e8f0;
  --color-button-hover:    #334155;
  --color-operator-bg:     #1d4ed8;
  --color-operator-hover:  #2563eb;
  --color-equals-bg:       #16a34a;
  --color-equals-hover:    #15803d;
  --color-clear-bg:        #dc2626;
  --color-clear-hover:     #b91c1c;

  --size-button-height:    3.5rem;
  --gap-button-grid:       0.5rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-button-grid);
  margin-top: var(--spacing-md);
}

button {
  background-color: var(--color-button-bg);
  color:            var(--color-button-text);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-display);
  height:           var(--size-button-height);
  font-size:        1.1rem;
  font-family:      var(--font-family-display);
  cursor:           pointer;
  transition:       background-color 0.1s ease;
}

button:hover {
  background-color: var(--color-button-hover);
}

button.operator { background-color: var(--color-operator-bg); }
button.operator:hover { background-color: var(--color-operator-hover); }

button.equals   { background-color: var(--color-equals-bg); }
button.equals:hover { background-color: var(--color-equals-hover); }

button[data-type='CLEAR'] { background-color: var(--color-clear-bg); }
button[data-type='CLEAR']:hover { background-color: var(--color-clear-hover); }

button.span-two { grid-column: span 2; }
```

Update `index.html` to load the TypeScript entry point:

```html
<script type="module" src="/src/main.ts"></script>
```

Run `npm run dev` and open the browser. Click any button. Open the browser
console (`F12`). You will see the type and value logged for every click.

---

## Connect the Pieces

`ButtonConfig` is the data shape that every part of the system will use to talk
about buttons. The rendering code in `main.ts` reads it. The input state machine
in lesson 03 will use `buttonConfig.type` to decide what to do. The evaluator in
lesson 04 will use `buttonConfig.value` to build the expression string.

The separation is already in place: the button data is in `buttons.ts`, the types
are in `types.ts`, and the rendering is in `main.ts`. When the input state machine
needs to respond differently to a `DIGIT` vs an `OPERATOR`, it will import from
`types.ts` — it will not read from the DOM.

---

## What Breaks Without This

Without the `ButtonType` enum, button types are plain strings. A developer writing
`buttonConfig.type === 'OPERTOR'` gets no error. The calculator stops responding
to operator buttons and there is no message explaining why. The bug is silent and
the search is in the wrong place.

With the enum, `ButtonType.OPERTOR` is a compile error: "Property 'OPERTOR' does
not exist on type..." The bug is caught before the code runs, at the exact line
where it was introduced.

This is the entire argument for a type system: move errors from runtime to compile
time, and from silent to loud.

---

## Definition of Done

- [ ] A button grid is visible below the display
- [ ] All buttons from `BUTTON_GRID` are rendered
- [ ] Clicking any button logs its type and value to the browser console
- [ ] `ButtonType` is a TypeScript const object — using an invalid value is a compile error
- [ ] `npm run build` compiles without errors
- [ ] No hardcoded colour values exist in CSS — all use `var(--token)`
