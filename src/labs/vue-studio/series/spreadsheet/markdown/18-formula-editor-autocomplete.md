# Vue Spreadsheet — Lesson 18 — A Real Formula Editor: Function Calls and Autocomplete

## What you will build

`=SUM(A1,B1,C1)` becomes a real, evaluatable formula — not a special case bolted on, but a genuine extension of Lesson 07's grammar, parsed by the same recursive-descent parser, evaluated by the same tree-walking `evaluate`. Then, typing `=SU` into a cell opens a small dropdown suggesting `SUM`; pressing Enter or clicking it inserts `SUM(` and leaves the cursor ready for arguments — the same autocomplete experience every spreadsheet and every modern code editor trains you to expect, built here on a real, general-purpose data structure: a **trie**.

```
    A    B    C    D
1 | 10 | 20 | 30 | =SUM(A1,B1,C1) → 60 |
```

---

## What you need to know first

This lesson returns directly to Lesson 07's grammar and parser and Lesson 08's evaluator — not new territory, but genuine extension of code that has been stable since those lessons. `Token`, `ExpressionNode`, `parsePrimary`, and `evaluate`'s `switch` all grow one more case each, following the exact discipline `assertNever` (Lesson 05) has enforced the whole time: TypeScript will not let this lesson forget to update any of them.

---

## Concept: where a function call fits in the grammar, and why

Lesson 07 left this grammar:

```
Expression → Addition
Addition → Multiplication (("+" | "-") Multiplication)*
Multiplication → Unary (("*" | "/") Unary)*
Unary → "-" Unary | Primary
Primary → Number | "(" Expression ")"
```

Lesson 09 already extended `Primary` once, to add `CellReference`. A function call belongs in exactly the same place, for exactly the same reason: `SUM(A1,B1)`, like a number or a parenthesized expression, is a single, complete unit as far as precedence is concerned — `2*SUM(A1,B1)` should multiply the *entire* sum by `2`, not just multiply `2` by whatever comes right after `SUM`. The updated grammar:

```
Primary → Number | CellReference | FunctionCall | "(" Expression ")"
FunctionCall → Identifier "(" (Expression ("," Expression)*)? ")"
```

`Identifier` — a new token kind, added in Step 1 — is a bare word like `SUM`, distinct from a `CellReference` like `A1`. The `(Expression ("," Expression)*)?` part is the grammar's way of writing "zero or more comma-separated expressions" — the `?` marks the whole comma-separated group as optional, so `SUM()` with no arguments is legal grammar (even though it will not be a *useful* formula), and `SUM(A1,B1,C1)` repeats the `, Expression` pattern twice.

---

## Step 1 — The tokenizer must distinguish a function name from a cell reference

**The problem:** Lesson 06's tokenizer scans a single uppercase letter, then digits, to build a `cell` token — `S`, then no following digit, would currently stop after one character. Tokenizing `"SUM"` today produces three separate one-letter `cell` tokens (`S`, `U`, `M`), not one function name. The scanner needs to keep reading letters for as long as they're letters, then decide what it built based on whether digits followed.

Update the letter-scanning branch inside `tokenize`:

```typescript
if (isUppercaseLetter(character)) {
  let letters = character
  position++
  while (position < expr.length && isUppercaseLetter(expr[position])) {
    letters += expr[position]
    position++
  }

  let digits = ''
  while (position < expr.length && isDigit(expr[position])) {
    digits += expr[position]
    position++
  }

  if (digits !== '') {
    tokens.push({ type: 'cell', name: letters + digits })
  } else {
    tokens.push({ type: 'identifier', name: letters })
  }
  continue
}
```

Add `identifier` and `comma` to the `Token` union:

```typescript
type Token =
  | { type: 'number';     value: number }
  | { type: 'cell';       name: string  }
  | { type: 'identifier'; name: string  }
  | { type: 'operator';   value: '+' | '-' | '*' | '/' }
  | { type: 'paren';      value: '(' | ')' }
  | { type: 'comma' }
```

Add comma recognition alongside the existing operator/paren checks:

```typescript
if (character === ',') {
  tokens.push({ type: 'comma' })
  position++
  continue
}
```

**Execution trace — `tokenize("SUM(A1,B1)")`:**

```
position 0: 'S' → isUppercaseLetter → scan letters
     inner loop 1: expr[1]='U' is a letter → letters="SU", position→2
     inner loop 2: expr[2]='M' is a letter → letters="SUM", position→3
     expr[3]='(' is not a letter → stop letter loop
     digit loop: expr[3]='(' is not a digit → digits="" (empty)
     digits is empty → push { type: 'identifier', name: 'SUM' }
     ↓
position 3: '(' → push { type: 'paren', value: '(' }, position→4
     ↓
position 4: 'A' → scan letters: letters="A", expr[5]='1' not a letter → stop
     digit loop: expr[5]='1' is a digit → digits="1", position→6
     digits is "1" (non-empty) → push { type: 'cell', name: 'A1' }
     ↓
position 6: ',' → push { type: 'comma' }, position→7
     ↓
position 7: 'B' → same as A1's scan → push { type: 'cell', name: 'B1' }
     ↓
position 9: ')' → push { type: 'paren', value: ')' }, position→10
     ↓
tokenize returns [
  { type: 'identifier', name: 'SUM' },
  { type: 'paren', value: '(' },
  { type: 'cell', name: 'A1' },
  { type: 'comma' },
  { type: 'cell', name: 'B1' },
  { type: 'paren', value: ')' },
]
```

The decision point — "does a digit follow these letters" — is the entire mechanism separating a function name from a cell reference. It runs once per identifier-shaped token, costs one extra small loop, and requires no lookahead past the letters themselves.

**Honest naming note:** real spreadsheets support columns past `Z` — `AA`, `AB`, and onward — using exactly this multi-letter-then-digits shape (Excel's columns run to `XFD`, over sixteen thousand). This project's 6-column grid never produces a reference past `F`, so this change has no visible effect on the grid itself — but the tokenizer is now honestly correct for column references far larger than this project happens to use, which is the right scope for a tokenizer to have: correct for the *language*, not merely for today's grid size.

---

## Step 2 — `FunctionCallNode`, and a new branch in `parsePrimary`

**The problem:** The parser has no rule yet for turning an `identifier` token followed by `(...)` into a real AST node.

Add to `ExpressionNode`:

```typescript
interface FunctionCallNode {
  kind: 'FunctionCall'
  name: string
  args: ExpressionNode[]
}

type ExpressionNode =
  | NumberNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | CellReferenceNode
  | FunctionCallNode
```

Add a new branch to `parsePrimary`, before the final `throw`:

```typescript
if (token.type === 'identifier') {
  advance()

  const openParen = peek()
  if (!openParen || openParen.type !== 'paren' || openParen.value !== '(') {
    throw new Error(`Expected "(" after function name "${token.name}"`)
  }
  advance()

  const args: ExpressionNode[] = []
  const maybeCloseParen = peek()
  if (!maybeCloseParen || maybeCloseParen.type !== 'paren' || maybeCloseParen.value !== ')') {
    args.push(parseExpression())
    while (true) {
      const next = peek()
      if (!next || next.type !== 'comma') break
      advance()
      args.push(parseExpression())
    }
  }

  const closeParen = peek()
  if (!closeParen || closeParen.type !== 'paren' || closeParen.value !== ')') {
    throw new Error(`Expected ")" to close function call "${token.name}"`)
  }
  advance()

  return { kind: 'FunctionCall', name: token.name, args }
}
```

**Walkthrough — why `args.push(parseExpression())` recurses back to the very top of the grammar:**

Each argument inside `SUM(...)` is not restricted to a bare number or cell reference — `SUM(A1+B1, 2*C1)` is legal, with each argument itself a full expression involving operators. Calling `parseExpression()` — the same entry point `parse` itself calls — for each argument is what makes that work: **mutual recursion** (Lesson 09's term, its second appearance here with a new facet) between `parsePrimary` and `parseExpression`. `parsePrimary` calls all the way back up to `parseExpression` to parse one argument, which may itself eventually call back down into `parsePrimary` again for a *nested* function call (`SUM(MAX(A1,B1), 5)` parses correctly for exactly this reason, with no special-casing anywhere for "a function call inside a function call").

**Walkthrough — the `if (!maybeCloseParen ...)` guard before the first argument:**

`SUM()` — zero arguments — is legal grammar, per the `?` in this lesson's updated BNF. Without checking whether the very next token is already `)` before attempting `parseExpression()`, `SUM()` would immediately try to parse an expression starting at `)`, and fail with a confusing "unexpected token" error instead of correctly recognizing zero arguments. This guard is the code's direct translation of the grammar's `(Expression (...)*)?` — the entire group, including the very first `Expression`, is optional.

---

## Step 3 — `BUILT_IN_FUNCTIONS`, a real dispatch table, and `evaluate`'s new case

**The problem:** The AST can now represent a function call. Nothing yet computes what one actually returns.

Add to `<script setup>`:

```typescript
type BuiltInFunction = (args: number[]) => number

const BUILT_IN_FUNCTIONS: Readonly<Record<string, BuiltInFunction>> = {
  SUM: (args) => args.reduce((total, value) => total + value, 0),
  AVERAGE: (args) => args.length === 0 ? 0 : BUILT_IN_FUNCTIONS.SUM(args) / args.length,
  MAX: (args) => Math.max(...args),
  MIN: (args) => Math.min(...args),
}
```

Add a `'FunctionCall'` case to `evaluate`'s `switch`:

```typescript
case 'FunctionCall': {
  const fn = BUILT_IN_FUNCTIONS[node.name]
  if (!fn) return { kind: 'error', message: `Unknown function: ${node.name}` }

  const evaluatedArgs: number[] = []
  for (const argNode of node.args) {
    const argResult = evaluate(argNode, lookupCell)
    if (argResult.kind !== 'ok') return argResult
    evaluatedArgs.push(argResult.value)
  }

  return { kind: 'ok', value: fn(evaluatedArgs) }
}
```

Click ▶ Run. Type `10` in A1, `20` in B1, `30` in C1, `=SUM(A1,B1,C1)` in D1 — D1 shows `60`. Try `=AVERAGE(A1,B1,C1)` — `20`. Try `=MAX(A1,B1,C1)` — `30`.

**Walkthrough — `Record<string, BuiltInFunction>`, a dispatch table:**

`BUILT_IN_FUNCTIONS` maps a function *name* — a string, exactly what `FunctionCallNode.name` holds — directly to the real function that implements it. This is a **dispatch table**: instead of a long `if (node.name === 'SUM') { ... } else if (node.name === 'AVERAGE') { ... }` chain inside `evaluate` itself, one line — `BUILT_IN_FUNCTIONS[node.name]` — looks up the right implementation. Adding a new function later means adding one entry to this object; `evaluate`'s own code never changes, the identical "open for extension, closed for modification" property Lesson 16's plugin registry has, applied here to functions instead of cell renderers. `Readonly<...>` (Lesson 01) prevents anything from ever reassigning an entry at runtime — this table is built once and never mutated.

**Walkthrough — `.reduce()`, this project's fourth array method:**

`.reduce(combineFn, startingValue)` walks an array left to right, calling `combineFn(accumulatedResult, currentItem)` at each step, carrying the returned value forward as the accumulator for the next call — and returns whatever the final call produced. `args.reduce((total, value) => total + value, 0)` starts `total` at `0`, then for `[10, 20, 30]`: `0+10=10`, then `10+20=30`, then `30+30=60`. This is the general-purpose tool behind `.map` (Lesson 01, transform each item) and `.filter` (Lesson 14, select some items) — `.reduce` is more powerful than either, capable of expressing both of them, because it can combine every item into one final value rather than producing a same-length array.

**Walkthrough — `Math.max(...args)`, spreading an array into individual arguments:**

`Math.max` (Lesson 13) accepts any number of individual number arguments — `Math.max(3, 7, 1)` — not an array. `args` is an array. `...args` here is the spread operator (Lesson 03's object-spread `{ ...cells.value }`, this project's first use of it on an *array*, spread into function call arguments rather than into an object literal) — it unpacks every element of `args` as if each had been typed as its own separate argument. `Math.max(...[3, 7, 1])` is exactly `Math.max(3, 7, 1)`.

**Honest scope note:** real spreadsheets let `SUM` take a *range* — `SUM(A1:A10)`, one contiguous block of cells, expressed with a colon — rather than only a comma-separated list of individually-typed cells. Range syntax is a genuine, separate grammar extension (a new token for `:`, a new `RangeNode`, and evaluator logic to expand a range into every cell it spans) deliberately left out of this lesson to keep its scope to what autocomplete actually needs: recognizing and completing function *names*. `=SUM(A1,B1,C1,D1,E1)` works today; `=SUM(A1:E1)` does not yet.

*Recognized elsewhere:* a string-keyed table of names mapped to real, callable functions is precisely what LESSON_CONTRACT.md's own worked example (`BUILT_IN_FUNCTIONS['sin']`) describes — the same pattern, independently arrived at here because it is genuinely the standard solution, not because it was copied. Every real interpreter for a language with built-in functions — including JavaScript's own engine resolving `Math.max` internally — uses some form of this exact name-to-implementation table.

---

## Concept Lab — a trie, built on a disposable word list first

**The problem this lab isolates:** autocomplete needs to answer one specific question fast, repeatedly, on every keystroke: "which known words start with what's been typed so far?" This deserves a real, purpose-built data structure, understood on ordinary words before it's asked to hold four function names.

Run this throwaway:

```vue
<script setup lang="ts">
interface TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean
}

function createTrieNode(): TrieNode {
  return { children: new Map(), isEndOfWord: false }
}

function insertWord(root: TrieNode, word: string): void {
  let node = root
  for (const character of word) {
    if (!node.children.has(character)) {
      node.children.set(character, createTrieNode())
    }
    node = node.children.get(character)!
  }
  node.isEndOfWord = true
}

function collectWords(node: TrieNode, prefixSoFar: string, results: string[]): void {
  if (node.isEndOfWord) results.push(prefixSoFar)
  for (const [character, child] of node.children) {
    collectWords(child, prefixSoFar + character, results)
  }
}

function findWordsWithPrefix(root: TrieNode, prefix: string): string[] {
  let node = root
  for (const character of prefix) {
    const child = node.children.get(character)
    if (!child) return []
    node = child
  }
  const results: string[] = []
  collectWords(node, prefix, results)
  return results
}

const dictionary = createTrieNode()
;['CAT', 'CAR', 'CARD', 'DOG', 'DOOR'].forEach((word) => insertWord(dictionary, word))

const matchesForCA = findWordsWithPrefix(dictionary, 'CA')
const matchesForDO = findWordsWithPrefix(dictionary, 'DO')
</script>
<template>
  <p>Prefix "CA": {{ matchesForCA.join(', ') }}</p>
  <p>Prefix "DO": {{ matchesForDO.join(', ') }}</p>
</template>
```

Click ▶ Run. `"CA"` → `CAT, CAR, CARD`. `"DO"` → `DOG, DOOR`.

**Walkthrough — what a trie (prefix tree) actually is:**

A **trie** is a tree where every edge is labeled with one character, and a path from the root spells out a prefix — the node you land on after following `C` then `A` represents "every word inserted so far that starts with `CA`." `insertWord` walks the trie one character at a time, creating a new node for any character not already present, and marks the final node `isEndOfWord = true` — `CAR` and `CARD` share the same `C`→`A`→`R` path; `CARD` continues one node further, to `D`. `findWordsWithPrefix` walks the same way, following the prefix's characters; if that exact path exists, `collectWords` then explores *every* path onward from that point (a **depth-first tree traversal** — the identical recursive shape as Lesson 08's `evaluate` walking an AST, and Lesson 09's `lookupCell` walking a chain of formula references — recursion doing tree traversal for the fourth distinct purpose in this series), collecting every complete word found along the way.

**Walkthrough — `Map<string, TrieNode>` instead of a plain object:**

Each node's `children` uses a real `Map` (Lesson 10's `Set` — `Map` is its close relative: a `Set` only tracks membership, `Map` pairs each key with a value). A plain object (`Record<string, TrieNode>`) would technically work here too — the deliberate choice of `Map` matters for a specific reason: `Map` guarantees insertion-order iteration and treats every key as genuinely just data, with none of a plain object's inherited-property quirks (a plain object's keys can accidentally collide with inherited names like `"toString"`, a real, if rare, source of bugs a `Map` cannot have). For a structure built entirely from dynamic, user-controlled characters — exactly what `children` is — `Map` is the more correct tool, not just a stylistic alternative.

**Honest scope note, stated directly:** for a dictionary of four function names, a trie provides no real performance advantage over simply filtering an array of strings by `.startsWith()` (Lesson 05) — at this scale, both are effectively instant. The trie is built anyway because it is the *standard, real* structure for this exact problem once a dictionary grows large (a real code editor's autocomplete, matching against thousands of possible symbols, genuinely needs this), and understanding it on four words costs nothing extra while making the concept transfer directly the day this project's function list is large enough for the difference to matter.

**This lab is now finished.** `dictionary`, `CAT`/`CAR`/`CARD`/`DOG`/`DOOR`, and this exact code are deleted and will not appear in the project again — the real version, next, holds function names instead.

---

## Step 4 — Wiring autocomplete into the cell editor

**The problem:** The trie exists as a concept — the Concept Lab's version is already deleted, per its own closing line. Nothing real exists yet, and two different files need to reach it: `App.vue` builds the trie from `BUILT_IN_FUNCTIONS`, but the dropdown itself lives in `CellDisplay.vue`, a separate component with no access to anything declared inside `App.vue`'s own `<script setup>`.

**Where the real trie lives — the same file-per-concern shape as Lesson 16's `rendererPlugins.ts`.** `TrieNode`, `createTrieNode`, `insertWord`, `collectWords`, and `findWordsWithPrefix` are general-purpose — nothing about them mentions cells, formulas, or this spreadsheet at all, exactly like Lesson 16's renderer registry. They belong in their own file, not copy-pasted into two components.

Create `src/trie.ts` — the Concept Lab's four functions, unchanged, plus the `TrieNode` interface, all `export`ed:

```typescript
export interface TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean
}

export function createTrieNode(): TrieNode {
  return { children: new Map(), isEndOfWord: false }
}

export function insertWord(root: TrieNode, word: string): void {
  let node = root
  for (const character of word) {
    if (!node.children.has(character)) {
      node.children.set(character, createTrieNode())
    }
    node = node.children.get(character)!
  }
  node.isEndOfWord = true
}

function collectWords(node: TrieNode, prefixSoFar: string, results: string[]): void {
  if (node.isEndOfWord) results.push(prefixSoFar)
  for (const [character, child] of node.children) {
    collectWords(child, prefixSoFar + character, results)
  }
}

export function findWordsWithPrefix(root: TrieNode, prefix: string): string[] {
  let node = root
  for (const character of prefix) {
    const child = node.children.get(character)
    if (!child) return []
    node = child
  }
  const results: string[] = []
  collectWords(node, prefix, results)
  return results
}
```

**Walkthrough — why `collectWords` alone has no `export`:** `collectWords` is a helper `findWordsWithPrefix` uses internally to do its recursive walk — nothing outside this file has a reason to call it directly, the same "only export what callers actually need" discipline Lesson 16's `rendererPlugins` array (never exported, only reachable through `registerRendererPlugin`/`renderCell`) already established.

In `App.vue`'s `<script setup>`, import the trie builder and build one, once, outside any per-cell logic:

```typescript
import { createTrieNode, insertWord } from './trie.ts'
import type { TrieNode } from './trie.ts'

const functionNameTrie = createTrieNode()
Object.keys(BUILT_IN_FUNCTIONS).forEach((name) => insertWord(functionNameTrie, name))
```

Add `functionNameTrie: TrieNode` to `SpreadsheetContext` in `spreadsheet-context.ts` (importing `TrieNode` from `./trie.ts` there too), and add `functionNameTrie` to the `provide(SPREADSHEET_KEY, { ... })` call — `App.vue` builds the one trie this project ever needs; every component that wants to search it injects the same object, exactly like `cellStyles` or `cells`.

Add to `CellDisplay.vue`'s `<script setup>`. `findWordsWithPrefix` is a pure function with no reactive state of its own, so it's imported directly from `trie.ts` rather than routed through context — the same choice Lesson 16 made for `renderCell`; `functionNameTrie` itself, the one shared piece of *data*, comes from `useSpreadsheet()` like everything else this component already injects:

Add `functionNameTrie` to the existing `useSpreadsheet()` destructure at the top of `CellDisplay.vue`, alongside `moveSelection` and everything else already there:

```typescript
import { findWordsWithPrefix } from '../trie.ts'

const suggestions = ref<string[]>([])
const activeSuggestionIndex = ref(0)

function updateSuggestions(inputValue: string): void {
  const trailingLetters = inputValue.match(/[A-Z]+$/)?.[0] ?? ''
  suggestions.value = trailingLetters.length > 0
    ? findWordsWithPrefix(functionNameTrie, trailingLetters).filter(w => w !== trailingLetters)
    : []
  activeSuggestionIndex.value = 0
}

function acceptSuggestion(inputEl: HTMLInputElement, suggestion: string): void {
  const trailingLetters = inputEl.value.match(/[A-Z]+$/)?.[0] ?? ''
  const stem = inputEl.value.slice(0, inputEl.value.length - trailingLetters.length)
  inputEl.value = stem + suggestion + '('
  suggestions.value = []
}

function onEditorKeydown(event: KeyboardEvent): void {
  if (suggestions.value.length === 0) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % suggestions.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + suggestions.value.length) % suggestions.value.length
  } else if (event.key === 'Tab') {
    event.preventDefault()
    acceptSuggestion(event.target as HTMLInputElement, suggestions.value[activeSuggestionIndex.value])
  } else if (event.key === 'Escape') {
    suggestions.value = []
  }
}
```

Update the `<input>` in `CellDisplay.vue`'s template:

```html
<input
  class="cell-input"
  :value="editableText(cells[cellId({ col: props.col, row: props.row })])"
  @input="updateSuggestions(($event.target as HTMLInputElement).value)"
  @keydown="onEditorKeydown"
  @keydown.enter.stop="() => {
    commitEdit({ col: props.col, row: props.row }, ($event.target as HTMLInputElement).value)
    moveSelection(0, 1)
  }"
  @blur="commitEdit({ col: props.col, row: props.row }, ($event.target as HTMLInputElement).value)"
  :ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
/>
<ul v-if="suggestions.length > 0" class="autocomplete-list" role="listbox">
  <li
    v-for="(suggestion, index) in suggestions"
    :key="suggestion"
    role="option"
    :aria-selected="index === activeSuggestionIndex"
    :class="{ active: index === activeSuggestionIndex }"
  >{{ suggestion }}</li>
</ul>
```

Add to `<style>`:

```css
.autocomplete-list {
  position: absolute;
  top: 100%; left: 0;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  min-width: 100px;
  z-index: 10;
  list-style: none;
}
.autocomplete-list li { padding: 4px 8px; font-family: monospace; font-size: 0.8rem; }
.autocomplete-list li.active { background: #dbeafe; }
```

Click ▶ Run. Double-click a cell, type `=SU` — a dropdown shows `SUM`. Press `Tab` — the input becomes `=SUM(`, ready for arguments, and the dropdown closes.

**Walkthrough — `inputValue.match(/[A-Z]+$/)?.[0]`, a regular expression, this series' first:**

A **regular expression** (**regex**) is a compact pattern language for matching text. `/[A-Z]+$/` reads as: `[A-Z]` — any single uppercase letter; `+` — one or more of the preceding thing; `$` — anchored to the *end* of the string. Together: "one or more uppercase letters, at the very end of the string." `.match(...)` returns an array of matches (or `null` if there's no match at all) — `?.[0]` (optional chaining, applied to array indexing this time rather than a method call) reads the first match if one exists, or falls through to `?? ''` if `.match` returned `null`. `'=SU'.match(/[A-Z]+$/)?.[0] ?? ''` is `'SU'`; `'=SUM(A1,'.match(...)` is `''` — a comma is not an uppercase letter, so there is no trailing run at all once past the opening parenthesis.

**Honest scope note:** this heuristic assumes the user is typing left to right with the cursor always at the end — a real editor would use `inputEl.selectionStart` to find the trailing letters immediately *before the cursor*, regardless of where in the string the cursor currently sits, so that editing the middle of an existing formula still autocompletes correctly. That refinement is a deliberate scope cut here, not an oversight — the added complexity of cursor-aware text slicing would roughly double this step's length for a case (editing mid-formula) this lesson's own examples never exercise.

**Walkthrough — `Tab` accepts a suggestion, `Enter` still commits the cell:**

`onEditorKeydown` and the existing `@keydown.enter.stop` handler are two separate listeners on the same `<input>`, both firing on every keydown — `Tab` was chosen deliberately for *accepting* a suggestion specifically so it never collides with `Enter`'s existing, established job (commit the cell and move down, Lesson 15). A real, common alternative design lets Enter do both jobs contextually ("if a suggestion is highlighted, accept it; otherwise, commit") — reasonable, but it would mean this lesson's new code needs to reach into and modify the Enter handler's existing behavior. Keeping them on separate keys means Lesson 15's Enter behavior needed zero changes to add this feature — a small, deliberate design choice in service of not touching working code unnecessarily.

---

## The Design lens — auto-inserting `(` is not a cosmetic flourish

`acceptSuggestion` inserts `SUM(`, not just `SUM` — the opening parenthesis is added automatically, not left for the user to type. This is a real, deliberate reduction in required keystrokes, and it does something beyond convenience: it actively teaches correct syntax, silently, by making the "next thing you type" position exactly where an argument belongs. A user who has never seen this project's grammar and never will still ends up typing syntactically valid formulas, because the tool shapes the input toward validity rather than only validating it after the fact.

*Recognized elsewhere:* this is precisely what every modern code editor's autocomplete does — accepting a suggested function name in VS Code, for instance, inserts the opening parenthesis (often the closing one too, with the cursor placed between them) for the identical reason. Google Sheets' and Excel's own formula autocomplete does the same thing for built-in functions. You have implemented a small, real version of a pattern present in nearly every text-editing tool built in the last two decades.

---

## What breaks without this

**Reverting the tokenizer's letter-scanning to consume only one letter:**

`tokenize("SUM(A1)")` produces `identifier: 'S'`, then treats `'U'` and `'M'` as further tokens with no relationship to `'S'` — `parsePrimary`'s new `identifier` branch would see a one-letter "function name" `S`, immediately fail to find `(` right after it (since `U` comes next instead), and throw a confusing parse error nowhere near the actual mistake.

**Omitting the zero-arguments guard in `parsePrimary`'s new branch:**

`=SUM()` immediately calls `parseExpression()` expecting a real expression, finds `)` instead, and throws — even though `SUM()` is legitimately parseable grammar (however useless as a formula). The guard is what makes the parser's behavior match what the grammar actually specifies.

**Forgetting `Readonly<...>` on `BUILT_IN_FUNCTIONS` (a smaller, but real, issue):**

Nothing stops a later piece of code — a bug, or a careless future plugin (Lesson 16) — from writing `BUILT_IN_FUNCTIONS.SUM = () => 0`, silently breaking every `SUM` formula in the entire spreadsheet from that point on, with no error anywhere pointing at the cause.

**Using `Enter` instead of `Tab` to accept a suggestion:**

The moment a suggestion is showing, pressing Enter to *commit the cell as typed* (a completely reasonable, common thing to want, especially if the user decided not to use the suggestion after all) would instead silently accept whatever function name happens to be highlighted — the cell commits a formula the user never actually chose.

---

## Connect the pieces

```
trie.ts
  TrieNode, createTrieNode(), insertWord(), findWordsWithPrefix() — general-purpose,
    no spreadsheet knowledge, same file-per-concern shape as Lesson 16's rendererPlugins.ts

App.vue
  type Token             — + identifier, comma variants
  type ExpressionNode     — + FunctionCallNode { kind, name, args }
  parsePrimary()          — + identifier branch: parses name, "(", comma-separated args, ")"
  BUILT_IN_FUNCTIONS      — Readonly dispatch table: name → (number[]) => number
  evaluate()              — + 'FunctionCall' case: look up fn, evaluate each arg, call fn
  functionNameTrie        — built once from Object.keys(BUILT_IN_FUNCTIONS), via trie.ts
  provides functionNameTrie via SpreadsheetContext

CellDisplay.vue
  imports findWordsWithPrefix directly from trie.ts (pure function, not routed through context)
  injects functionNameTrie from useSpreadsheet() (shared data, provided by App.vue)
  suggestions, activeSuggestionIndex — ref state for the dropdown
  updateSuggestions()     — regex-extracts trailing letters; queries the trie
  acceptSuggestion()      — replaces trailing letters with the chosen name + "("
  onEditorKeydown()       — ArrowUp/Down move activeSuggestionIndex; Tab accepts; Escape dismisses
  <ul role="listbox">     — the dropdown; ARIA listbox/option roles, Lesson 15's vocabulary reused
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] `=SUM(A1,B1,C1)`, `=AVERAGE(...)`, `=MAX(...)`, and `=MIN(...)` all evaluate correctly
- [ ] `=SUM(A1+B1, 2*C1)` — expressions as arguments, not just bare cell references — evaluates correctly
- [ ] Typing `=SU` into a cell shows a dropdown containing `SUM`
- [ ] ArrowDown/ArrowUp move the highlighted suggestion; Tab accepts it and inserts `SUM(`
- [ ] Escape dismisses the dropdown without changing the input
- [ ] You can explain why a function call belongs in the `Primary` grammar rule, using precedence as the reason
- [ ] You can explain what a trie is and why `CAR`/`CARD` share most of their path through it
- [ ] You can trace, by hand, what `tokenize("MAX(")` produces before running it

---

*Next: Lesson 19 — Multiple Sheets. `cells` becomes a nested lookup table keyed by sheet, `=SHEET2!A1` extends this lesson's own lookahead-based parsing technique a second time, and a real cross-sheet undo corruption bug gets demonstrated before it gets fixed.*
