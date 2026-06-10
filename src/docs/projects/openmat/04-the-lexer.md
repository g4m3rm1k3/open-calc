# OpenMAT — Lesson 04 — The Lexer

## What You Will Build

By the end of this lesson, typing `x = 3 + 4 * 2` into the console will
produce:

```
>> x = 3 + 4 * 2
[IDENTIFIER:"x"] [EQUALS] [NUMBER:"3"] [PLUS] [NUMBER:"4"] [MULTIPLY] [NUMBER:"2"]
```

Instead of echoing raw text, the console now shows a structured list of tokens.
The lexer converts a raw string into typed, labelled units that the rest of the
interpreter can reason about without ever seeing individual characters.

This is the first stage of a three-stage pipeline: **lexer → parser →
evaluator**. The parser you will build in lesson 05 will consume this list
directly.

---

## What You Need to Know First

Lessons 01–03 complete. TypeScript is compiling, Vite is running, and the
console echoes input. You understand the `as const` pattern from lesson 03 —
the token type system built in this lesson uses the same idea. You have read
compiler error messages and know how to find them in the terminal and in your
editor.

---

## Concept: What a Lexer Does

**The problem it solves:**

A parser works with meaning: "this is an addition," "this is a function call."
But it cannot reason about individual characters: is `>=` one operator or two?
Is `if` a variable name or a keyword? Does a space matter here? Mixing
character-level decisions with grammatical decisions makes both jobs harder and
makes each harder to test independently.

A *lexer* (also called a tokeniser or scanner) handles the character level
exclusively. It reads a source string one character at a time and groups
characters into *tokens* — the smallest meaningful units of the language.

Input: `"x = 3.14 + y"`

After lexing:
```
[IDENTIFIER:"x"]  [EQUALS]  [NUMBER:"3.14"]  [PLUS]  [IDENTIFIER:"y"]  [EOF]
```

The parser never sees spaces. It never sees individual digits. It works with
typed, structured tokens.

This is the first application of *separation of concerns* in this codebase.
The lexer's single responsibility is converting characters to tokens. It knows
nothing about operator precedence, grammar, or what `if` means in a program.
Because it does one thing, it can be tested in complete isolation — you do not
need a parser or evaluator to verify that `tokenize('3 + 4')` returns the right
tokens. If the parser produces wrong output, you run the lexer tests first. If
they pass, the bug is in the parser. Isolation is what makes debugging
tractable.

**CS concept — finite state machines:**

A lexer is a *finite state machine* (FSM): a system with a fixed set of states
and rules for transitioning between them based on input. The machine can only
be in one state at a time. There are no ambiguous cases.

```
States:
  IDLE             — waiting for the start of a token
  IN_NUMBER        — reading digits (and possibly one decimal point)
  IN_IDENTIFIER    — reading letters, digits, and underscores
  IN_STRING        — reading characters between single quotes
  IN_COMMENT       — reading characters after % until end of line

Transitions:
  IDLE    + digit      → IN_NUMBER
  IDLE    + letter/_   → IN_IDENTIFIER
  IDLE    + single-q   → IN_STRING
  IDLE    + %          → IN_COMMENT
  IDLE    + operator   → emit token, stay in IDLE

  IN_NUMBER + digit    → stay in IN_NUMBER
  IN_NUMBER + '.'      → stay in IN_NUMBER (once only)
  IN_NUMBER + other    → emit NUMBER token, return to IDLE

  IN_IDENTIFIER + letter/digit/_ → stay in IN_IDENTIFIER
  IN_IDENTIFIER + other          → look up keyword table, emit token, return to IDLE
```

The complete set of states and transitions is the complete specification of the
lexer. This structure appears throughout computing: regular expression engines
are compiled into FSMs, protocol parsers use FSMs, network packet classifiers
use FSMs. When you see a loop that reads one character at a time and branches
on what the character is, you are looking at a finite state machine whether or
not the author named it that.

---

## Step 1 — Define the Token Types

**The problem:** Every stage of the interpreter needs to agree on what a token
looks like. We define the types once; every module imports them. This is the
contract the lexer makes with the parser and the evaluator.

Create `src/lexer.ts`. This file has a single responsibility: own all lexer
logic — the token type specification, the `Token` shape, the error type, and
the `tokenize` function. It lives in `src/` alongside `main.ts` and the future
`parser.ts` and `evaluator.ts` because all three interpreter stages are
top-level modules of this project.

Start with the token type specification:

```typescript
// The complete set of token types the OpenMAT lexer can produce.
// Using 'as const' instead of an enum: each value is a literal string type,
// which produces better TypeScript error messages than numeric enum values.
export const TokenType = {
  // Literals
  NUMBER:      'NUMBER',       // 42, 3.14
  STRING:      'STRING',       // 'hello'
  IDENTIFIER:  'IDENTIFIER',   // myVar, disp, x
  KEYWORD:     'KEYWORD',      // if, for, while, end, function, return, true, false

  // Arithmetic operators
  PLUS:        'PLUS',         // +
  MINUS:       'MINUS',        // -
  MULTIPLY:    'MULTIPLY',     // *
  DIVIDE:      'DIVIDE',       // /
  POWER:       'POWER',        // ^

  // Assignment
  EQUALS:      'EQUALS',       // =

  // Comparison operators
  GT:          'GT',           // >
  LT:          'LT',           // <
  GTE:         'GTE',          // >=
  LTE:         'LTE',          // <=
  EQEQ:        'EQEQ',         // ==
  NEQ:         'NEQ',          // ~=

  // Logical operators
  AND:         'AND',          // &&
  OR:          'OR',           // ||
  NOT:         'NOT',          // ~

  // Delimiters
  LPAREN:      'LPAREN',       // (
  RPAREN:      'RPAREN',       // )
  LBRACKET:    'LBRACKET',     // [
  RBRACKET:    'RBRACKET',     // ]
  COMMA:       'COMMA',        // ,
  SEMICOLON:   'SEMICOLON',    // ;
  COLON:       'COLON',        // :

  // Control
  NEWLINE:     'NEWLINE',      // end of a line (separates statements)
  EOF:         'EOF',          // end of the input stream
} as const;

// The type of any single TokenType value: 'NUMBER' | 'STRING' | 'IDENTIFIER' | ...
export type TokenTypeName = typeof TokenType[keyof typeof TokenType];
```

**Understanding `typeof TokenType[keyof typeof TokenType]`:**

This is the first time in the curriculum that a type is *derived* from a value
rather than written out by hand. Break it down from the inside out:

- `typeof TokenType` is the TypeScript type of the `TokenType` object itself —
  a type that describes an object with properties `NUMBER`, `STRING`,
  `IDENTIFIER`, and so on, each holding a specific string literal.
- `keyof typeof TokenType` is the union of all key names in that type:
  `'NUMBER' | 'STRING' | 'IDENTIFIER' | 'KEYWORD' | ...` — every key you can
  look up on the object.
- `typeof TokenType[keyof typeof TokenType]` indexes into the type using that
  union of keys, producing the union of all the object's values:
  `'NUMBER' | 'STRING' | 'IDENTIFIER' | 'KEYWORD' | ...` — the literal string
  types of every token type name.

The practical benefit: `TokenTypeName` is automatically kept in sync with
`TokenType`. If you add `ARROW: 'ARROW'` to `TokenType` later, `TokenTypeName`
immediately includes `'ARROW'` — you do not need to update a second definition.
The type is derived from the data, not written separately. Derived types cannot
drift out of sync.

**Why `as const` instead of an enum?**

With an enum, TypeScript assigns numeric values to members. `TokenType.NUMBER`
would be `0`. An error message would read: "Expected 0, got 7" — meaningless
without counting through the enum. With `as const`, `TokenType.NUMBER` is the
string `'NUMBER'`. Error messages read: "Expected 'NUMBER', got 'KEYWORD'" —
immediately clear. The strings also survive serialisation, which makes them
visible in the console output you are about to build.

Now define what a Token is. Add this directly below the `TokenTypeName` type:

```typescript
export interface Token {
  type:  TokenTypeName;
  value: string | null;   // null for tokens with no meaningful value (EOF)
  line:  number;          // source line where this token appeared
}
```

**The `interface` keyword — first appearance:**

An `interface` in TypeScript describes the *shape* of an object: what
properties it must have and what type each property must be. `interface Token`
says: any object that claims to be a `Token` must have a `type` property of
type `TokenTypeName`, a `value` property that is either a string or null, and a
`line` property that is a number.

An interface is a compile-time-only construct. TypeScript removes all
interfaces when it compiles your code to JavaScript — they produce no output in
the built file. They exist entirely to let the compiler check that you are using
objects correctly before the code runs.

An interface is a contract: any object assigned to type `Token` must satisfy
exactly the declared shape. TypeScript will reject `{ type: 'NUMBER', value:
42 }` because `value` must be `string | null`, not `number`. Interfaces cannot
be instantiated directly — you do not write `new Token(...)`. You create a
plain object `{ type: TokenType.NUMBER, value: '42', line: 1 }` and TypeScript
checks that it satisfies the `Token` contract.

**Why `value: string | null`?**

Most tokens carry their source text: a NUMBER token carries `'3.14'`, an
IDENTIFIER carries `'myVariable'`. Structural tokens like `EOF` have no
meaningful text — `null` communicates "this token has no value" explicitly.
Using an empty string `''` would work, but `null` is unambiguous: anyone
reading the code knows there is no value to read, rather than wondering if the
empty string is intentional.

---

## Step 2 — Write Tests First (Red)

**The problem:** We need to specify exactly what the lexer must produce before
writing any lexing logic. Writing the specification in code — as tests — means
TypeScript and Vitest will enforce it automatically and permanently.

**SE practice — Test-Driven Development:**

*Test-Driven Development* (TDD) is writing a failing test before writing the
code it tests. The discipline has three steps:

```
RED      Write a test that fails.
         The test is a specification: it states exactly what correct
         behaviour looks like. A test file full of failures is a complete
         spec.

GREEN    Write the minimum code to make every test pass.
         Not the cleanest code — just the code that satisfies the spec.
         When all tests pass, the spec is met.

REFACTOR Clean up without breaking tests.
         Rename variables, extract functions, improve structure.
         The tests confirm nothing broke.
```

The reason to write tests first: when you write tests after code, you
unconsciously write tests that pass. You already know what the code does, so
you write tests that match it — including its bugs. Writing tests before code
forces you to state the requirement without influence from the implementation.

Create `src/lexer.test.ts`. This file has one responsibility: verify every
behaviour the lexer is expected to produce. It lives in `src/` alongside
`lexer.ts` because Vitest discovers test files by pattern and keeping them
adjacent to the code they test makes the relationship explicit.

```typescript
import { tokenize, TokenType } from './lexer';

// ── Numbers ──────────────────────────────────────────────────────────────────

test('tokenizes a whole number', () => {
  const tokens = tokenize('42');
  expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '42', line: 1 });
  expect(tokens[1]).toMatchObject({ type: TokenType.EOF });
});

test('tokenizes a decimal number', () => {
  const tokens = tokenize('3.14');
  expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '3.14' });
});

// ── Identifiers and keywords ─────────────────────────────────────────────────

test('tokenizes an identifier', () => {
  const tokens = tokenize('myVariable');
  expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'myVariable' });
});

test('tokenizes keywords as KEYWORD not IDENTIFIER', () => {
  expect(tokenize('for')[0]).toMatchObject({ type: TokenType.KEYWORD, value: 'for' });
  expect(tokenize('if')[0]).toMatchObject({  type: TokenType.KEYWORD, value: 'if'  });
  expect(tokenize('end')[0]).toMatchObject({ type: TokenType.KEYWORD, value: 'end' });
});

// ── Operators ────────────────────────────────────────────────────────────────

test('tokenizes arithmetic operators', () => {
  const tokens = tokenize('+ - * / ^');
  expect(tokens[0].type).toBe(TokenType.PLUS);
  expect(tokens[1].type).toBe(TokenType.MINUS);
  expect(tokens[2].type).toBe(TokenType.MULTIPLY);
  expect(tokens[3].type).toBe(TokenType.DIVIDE);
  expect(tokens[4].type).toBe(TokenType.POWER);
});

test('tokenizes two-character comparison operators', () => {
  const tokens = tokenize('>= <= == ~=');
  expect(tokens[0].type).toBe(TokenType.GTE);
  expect(tokens[1].type).toBe(TokenType.LTE);
  expect(tokens[2].type).toBe(TokenType.EQEQ);
  expect(tokens[3].type).toBe(TokenType.NEQ);
});

test('tokenizes single-character comparison operators', () => {
  const tokens = tokenize('> <');
  expect(tokens[0].type).toBe(TokenType.GT);
  expect(tokens[1].type).toBe(TokenType.LT);
});

test('tokenizes logical operators', () => {
  const tokens = tokenize('&& ||');
  expect(tokens[0].type).toBe(TokenType.AND);
  expect(tokens[1].type).toBe(TokenType.OR);
});

// ── Strings ──────────────────────────────────────────────────────────────────

test("tokenizes a string literal", () => {
  const tokens = tokenize("'hello'");
  expect(tokens[0]).toMatchObject({ type: TokenType.STRING, value: 'hello' });
});

test('throws LexerError on unterminated string', () => {
  expect(() => tokenize("'unterminated")).toThrow('line 1');
});

// ── Structure ─────────────────────────────────────────────────────────────────

test('skips whitespace', () => {
  const tokens = tokenize('3   +   4');
  expect(tokens).toHaveLength(4); // NUMBER, PLUS, NUMBER, EOF
});

test('skips comment to end of line', () => {
  const tokens = tokenize('x = 1 % this is a comment\ny = 2');
  const types = tokens.map(t => t.type);
  expect(types).not.toContain('COMMENT');
  expect(types).toContain(TokenType.NEWLINE);
});

test('tracks line numbers correctly', () => {
  const tokens = tokenize('x\ny');
  expect(tokens[0].line).toBe(1);
  expect(tokens[2].line).toBe(2); // after NEWLINE
});

test('empty input returns only EOF', () => {
  const tokens = tokenize('');
  expect(tokens).toHaveLength(1);
  expect(tokens[0].type).toBe(TokenType.EOF);
});

test('throws on unknown character', () => {
  expect(() => tokenize('3 @ 4')).toThrow('line 1');
});
```

**Understanding the import statement:**

```typescript
import { tokenize, TokenType } from './lexer';
```

`lexer.ts` is the module that owns all lexer logic — the `TokenType`
specification and the `tokenize` function. We import both because the tests
need to call `tokenize` to get tokens and need `TokenType` to compare token
types in assertions. Importing only what you need makes the dependency
explicit: this test file depends on exactly these two things from the lexer,
nothing else. If the lexer's internal implementation changes but `tokenize` and
`TokenType` keep their contracts, the test file does not change and does not
need to.

**Understanding `toMatchObject`:**

`expect(token).toMatchObject({ type: TokenType.NUMBER, value: '42', line: 1 })`
asserts that the token has at least the listed properties with the listed
values. It does not fail if the object has additional properties. We use this
rather than `toEqual` because the `Token` interface has exactly three
properties and `toMatchObject` communicates "check these specific properties"
without being brittle about the full object shape.

**Understanding `toBe`:**

`expect(tokens[0].type).toBe(TokenType.PLUS)` asserts strict equality — the
same as `===`. For token types, which are string literals, this is exactly the
right check: the type must be the exact string `'PLUS'`, not just something
equal-ish.

Run `npx vitest run`. Every test fails — `tokenize` does not exist yet. That is
the correct result. A failing test is a specification waiting for an
implementation.

`npx` runs a package without installing it globally. `vitest` is the test
runner installed in lesson 01. `run` tells Vitest to execute all tests once and
exit, rather than watching for file changes. Every test failure prints: the
test name, the expected value, the received value, and the line number in the
test file. Read all three — they tell you exactly what the implementation needs
to produce.

---

## Step 3 — Implement `tokenize` (Green)

**CS concept — character classification:**

Before writing the main loop, we need to identify the *character classes* —
groups of characters that all behave the same way in the lexer:

```
digit class       →  '0'–'9'
letter class      →  'a'–'z', 'A'–'Z'
identifier-start  →  letter or '_'
identifier-body   →  letter, digit, or '_'
whitespace        →  space, tab (but not newline — newline is a NEWLINE token)
```

These classes are the vocabulary of the finite state machine. The machine does
not ask "is this a '3'?" — it asks "is this a digit?" Every character that
answers yes goes through the same state transitions. The classification
functions make this explicit and testable in isolation.

**CS concept — keyword lookup after identifier:**

Keywords (`if`, `for`, `while`, `end`, `function`, `return`, `true`, `false`)
look identical to identifiers at the character level — both are sequences of
letters. The distinction cannot be made character by character. The approach:

1. Read characters until the identifier is complete
2. Look up the complete text in a keyword table
3. If it is there → emit KEYWORD. If not → emit IDENTIFIER.

```typescript
const tokenType = KEYWORDS.has(identifierText) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
```

The keyword table is the enforcement mechanism for reserved words. You cannot
use `if` as a variable name in OpenMAT for the same reason you cannot in
JavaScript: the lexer reads `'if'`, finds it in the table, emits KEYWORD — the
identifier path is never taken.

**The `LexerError` class — first appearance of `class`:**

Before the main `tokenize` function, we define a custom error type. This is the
first time a `class` appears in this curriculum.

`class` creates a new type and a constructor function in one declaration. It
lets you define objects that have both data (properties) and behaviour
(methods), and that can be recognised by their type at runtime.

```typescript
class LexerError extends Error {
  constructor(message: string, line: number) {
    super(`LexerError on line ${line}: ${message}`);
  }
}
```

`extends Error` means `LexerError` *inherits* everything `Error` has: a
`message` property, a `stack` trace (the list of function calls that led to the
error), and the ability to be caught with `catch (error) { ... }`. Inheritance
means `LexerError` is a specialisation of `Error` — anything that works with
`Error` also works with `LexerError`.

`constructor(message, line)` is the function called when you write `new
LexerError('unexpected character', 1)`. The constructor receives the arguments
and sets up the object.

`super(...)` calls the parent class's constructor — in this case, `Error`'s
constructor — which sets up the `message` property and the `stack` trace.
Every class that extends another must call `super()` before accessing `this`.
If you remove the `super(...)` call, TypeScript reports a compile error:
"Constructors for derived classes must contain a 'super' call."

The benefit over a plain `new Error(...)`: any `catch` block can check
`error instanceof LexerError` to distinguish lexer errors from other kinds of
errors. The parser, evaluator, and UI code can all make this distinction.

**The `KEYWORDS` set — first appearance of `Set`:**

```typescript
const KEYWORDS = new Set([
  'if', 'elseif', 'else', 'end',
  'for', 'while', 'break', 'continue',
  'function', 'return',
  'true', 'false',
]);
```

A `Set` is a data structure that stores unique values and supports O(1)
membership testing with `.has()`. We call `KEYWORDS.has(text)` on every
identifier the lexer reads — once per identifier, on every call to `tokenize`.

The alternative is an array: `['if', 'elseif', 'else', ...]`. An array also
stores values, but `.includes()` on an array is O(n): it checks every element
in order until it finds a match or exhausts the array. With 12 keywords and an
array, each check scans up to 12 items. With a Set, each check is a hash table
lookup — constant time regardless of how many keywords there are. For 12
keywords the difference is invisible, but the habit matters: the keyword table
will not shrink, and the pattern scales correctly.

A Set cannot contain duplicates. Adding `'if'` twice still results in one
entry. This makes it the correct choice for a keyword table, where every entry
is by definition unique.

Now add everything to `src/lexer.ts`:

```typescript
class LexerError extends Error {
  constructor(message: string, line: number) {
    super(`LexerError on line ${line}: ${message}`);
  }
}

const KEYWORDS = new Set([
  'if', 'elseif', 'else', 'end',
  'for', 'while', 'break', 'continue',
  'function', 'return',
  'true', 'false',
]);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let position: number = 0;
  let line:     number = 1;

  function current(): string { return source[position]; }
  function next():    string { return source[position + 1]; }
  function advance(): string { return source[position++]; }

  function isDigit(char: string):           boolean { return char >= '0' && char <= '9'; }
  function isLetter(char: string):          boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }
  function isIdentifierStart(char: string): boolean { return isLetter(char) || char === '_'; }
  function isIdentifierBody(char: string):  boolean {
    return isIdentifierStart(char) || isDigit(char);
  }

  while (position < source.length) {
    const char = current();

    // ── Whitespace (not newlines) ─────────────────────────────────────────────
    if (char === ' ' || char === '\t') {
      advance();
      continue;
    }

    // ── Newlines ──────────────────────────────────────────────────────────────
    // Newlines are significant — they separate statements.
    // We emit one NEWLINE token per line break, collapsing consecutive blank lines.
    if (char === '\n') {
      advance();
      line++;
      // Only emit NEWLINE if the previous token was not already a NEWLINE.
      if (tokens.length > 0 && tokens[tokens.length - 1].type !== TokenType.NEWLINE) {
        tokens.push({ type: TokenType.NEWLINE, value: null, line });
      }
      continue;
    }

    // ── Comments ───────────────────────────────────────────────────────────────
    // % starts a comment that runs to the end of the line.
    // Comments carry no information the parser needs — skip everything.
    if (char === '%') {
      while (position < source.length && current() !== '\n') {
        advance();
      }
      continue;
    }

    // ── Numbers ───────────────────────────────────────────────────────────────
    if (isDigit(char)) {
      let text = '';
      let hasDecimalPoint = false;

      while (position < source.length) {
        const digitChar = current();
        if (isDigit(digitChar)) {
          text += advance();
        } else if (digitChar === '.' && !hasDecimalPoint && isDigit(next())) {
          hasDecimalPoint = true;
          text += advance();
        } else {
          break;
        }
      }

      tokens.push({ type: TokenType.NUMBER, value: text, line });
      continue;
    }

    // ── String literals ───────────────────────────────────────────────────────
    // Single-quoted strings: 'hello world'
    if (char === "'") {
      advance();   // consume opening quote
      let text = '';

      while (position < source.length && current() !== "'") {
        if (current() === '\n') {
          throw new LexerError('unterminated string literal', line);
        }
        text += advance();
      }

      if (position >= source.length) {
        throw new LexerError('unterminated string literal', line);
      }

      advance();   // consume closing quote
      tokens.push({ type: TokenType.STRING, value: text, line });
      continue;
    }

    // ── Identifiers and keywords ──────────────────────────────────────────────
    if (isIdentifierStart(char)) {
      let text = '';

      while (position < source.length && isIdentifierBody(current())) {
        text += advance();
      }

      const tokenType = KEYWORDS.has(text) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
      tokens.push({ type: tokenType, value: text, line });
      continue;
    }

    // ── Two-character operators ───────────────────────────────────────────────
    // Must be checked BEFORE single-character operators.
    // If we checked '>' first, '>=' would tokenise as GT then EQUALS.
    const twoChars = source.slice(position, position + 2);
    const twoCharMap: Record<string, TokenTypeName> = {
      '>=': TokenType.GTE,
      '<=': TokenType.LTE,
      '==': TokenType.EQEQ,
      '~=': TokenType.NEQ,
      '&&': TokenType.AND,
      '||': TokenType.OR,
    };

    if (twoChars in twoCharMap) {
      tokens.push({ type: twoCharMap[twoChars], value: twoChars, line });
      position += 2;
      continue;
    }

    // ── Single-character operators ─────────────────────────────────────────────
    const oneCharMap: Record<string, TokenTypeName> = {
      '+': TokenType.PLUS,
      '-': TokenType.MINUS,
      '*': TokenType.MULTIPLY,
      '/': TokenType.DIVIDE,
      '^': TokenType.POWER,
      '=': TokenType.EQUALS,
      '>': TokenType.GT,
      '<': TokenType.LT,
      '~': TokenType.NOT,
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      '[': TokenType.LBRACKET,
      ']': TokenType.RBRACKET,
      ',': TokenType.COMMA,
      ';': TokenType.SEMICOLON,
      ':': TokenType.COLON,
    };

    if (char in oneCharMap) {
      tokens.push({ type: oneCharMap[char], value: char, line });
      advance();
      continue;
    }

    // ── Unknown character ──────────────────────────────────────────────────────
    // Throw immediately — never silently skip unknown characters.
    // Silent skipping produces a wrong token list that causes mysterious errors
    // deep in the parser, far from the actual problem.
    throw new LexerError(`unexpected character '${char}'`, line);
  }

  tokens.push({ type: TokenType.EOF, value: null, line });
  return tokens;
}
```

**Understanding `Record<string, TokenTypeName>` — first appearance of `Record`:**

```typescript
const twoCharMap: Record<string, TokenTypeName> = { ... }
```

`Record<K, V>` is a TypeScript built-in type alias. It describes a plain
JavaScript object where every key is type K and every value is type V.
`Record<string, TokenTypeName>` means: keys are strings, values are token type
names.

The alternative is an *index signature*:
`{ [key: string]: TokenTypeName }`. These two are equivalent — `Record<string,
TokenTypeName>` is shorthand for the index signature. `Record` is preferred
because it communicates intent in one read: "a mapping from strings to token
type names."

TypeScript enforces the value type: if you write `'>=': 'INVALID_TYPE'`, the
compiler reports an error because `'INVALID_TYPE'` is not a valid
`TokenTypeName`. The dispatch table cannot contain invalid token types.

**Walkthrough — what happens when `tokenize('42 + x')` is called:**

Tracing the execution step by step makes the state machine concrete:

- Start: `position = 0`, `line = 1`, `tokens = []`.
- `current()` returns `'4'`. `isDigit('4')` is true. Enter the number branch.
  `text = ''`, `hasDecimalPoint = false`. Inner loop: `'4'` is a digit —
  `text = '4'`, advance to position 1. `'2'` is a digit — `text = '42'`,
  advance to position 2. `' '` is not a digit or decimal point — break. Push
  `{ type: 'NUMBER', value: '42', line: 1 }`.
- `current()` returns `' '`. It is whitespace. Advance, continue.
- `current()` returns `'+'`. Not whitespace, newline, comment, digit, quote, or
  identifier start. Check two-character operators: `source.slice(3, 5)` is
  `'+ '` — not in `twoCharMap`. Check single-character operators: `'+'` maps
  to `TokenType.PLUS`. Push `{ type: 'PLUS', value: '+', line: 1 }`. Advance.
- `current()` returns `' '`. Whitespace. Advance, continue.
- `current()` returns `'x'`. `isIdentifierStart('x')` is true. `text = ''`.
  Inner loop: `'x'` is an identifier body character — `text = 'x'`, advance.
  End of string — loop exits. `KEYWORDS.has('x')` is false. Push
  `{ type: 'IDENTIFIER', value: 'x', line: 1 }`.
- `position >= source.length`. Exit the outer while loop. Push
  `{ type: 'EOF', value: null, line: 1 }`. Return the array.

Final result: `[NUMBER:'42', PLUS:'+', IDENTIFIER:'x', EOF]` — four tokens
from six characters, whitespace gone, every token typed and labelled.

**Why two-character operators must be checked before single-character:**

`>=` must be read as one token (GTE), not as `>` (GT) followed by `=` (EQUALS).
If we checked single characters first, every `>=` in the source would become
two tokens and the parser would see syntax errors on every comparison. The
general rule: when two tokens share a prefix, the longer one must be checked
first. *Greedy matching*: always take the longest valid token at each position.
This same rule appears in regular expression engines — `.*` is greedy by
default for the same reason.

**Why throw on unknown characters instead of skipping:**

If `@` were silently skipped, `tokenize('3 @ 4')` would return
`[NUMBER:3, NUMBER:4, EOF]`. The parser would see two consecutive numbers with
no operator and report a parse error — pointing at the `4`, not at the `@`
that caused the problem. The error is reported at the wrong location. Throwing
immediately at the unknown character means the error points to the right place.
This is a general principle: fail at the exact point of the problem, not at the
point where the problem becomes visible downstream.

Run `npx vitest run`. All tests should now pass. The terminal shows each test
name in green with a check mark. If any test fails, it shows the expected value
on one line and the received value on the next. Read the test name to understand
which behaviour is wrong, then read the expected/received diff to understand
what the implementation returned instead.

---

## Step 4 — Connect to the Console

The lexer works and is tested, but only Vitest has seen it run. Now we wire it
to the console so the output is visible in the browser. This is the agile step:
every lesson ends with something the student can see.

Open `src/main.ts`. Import the lexer and update the console callback:

```typescript
import { initConsole, printOutput } from './console';
import { tokenize, TokenType } from './lexer';

// ... existing canvas and triangle code ...

initConsole(function(userInput: string): void {
  try {
    const tokens = tokenize(userInput);

    // Display the token list. Filter out EOF and NEWLINE — implementation details.
    const tokenDisplay = tokens
      .filter(t => t.type !== TokenType.EOF && t.type !== TokenType.NEWLINE)
      .map(t => t.value !== null ? `[${t.type}:"${t.value}"]` : `[${t.type}]`)
      .join(' ');

    printOutput(tokenDisplay);
  } catch (error) {
    printOutput((error as Error).message);
  }
});
```

The `try/catch` block here is important. `tokenize` throws a `LexerError` when
it encounters an unknown character or an unterminated string. Without `catch`,
a `LexerError` would propagate up and crash the event listener, leaving the
console unresponsive until the page is refreshed. With `catch`, the error
message is printed as output and the console remains usable. The `as Error`
assertion — which you have seen before in the type assertion lessons — narrows
the caught value to `Error` so `.message` is accessible.

### SAVE AND TRY

Type `x = 3.14 + y` and press Enter:
```
>> x = 3.14 + y
[IDENTIFIER:"x"] [EQUALS:"="] [NUMBER:"3.14"] [PLUS:"+"] [IDENTIFIER:"y"]
```

Type `for i = 1:5`:
```
>> for i = 1:5
[KEYWORD:"for"] [IDENTIFIER:"i"] [EQUALS:"="] [NUMBER:"1"] [COLON:":"] [NUMBER:"5"]
```

Type `x >= 10 && y < 5`:
```
>> x >= 10 && y < 5
[IDENTIFIER:"x"] [GTE:">="] [NUMBER:"10"] [AND:"&&"] [IDENTIFIER:"y"] [LT:"<"] [NUMBER:"5"]
```

Type `3 @ 4`:
```
>> 3 @ 4
LexerError on line 1: unexpected character '@'
```

The console does not crash on the error. It prints the message and waits for
the next input. That is the correct behaviour.

---

## Connect the Pieces

The pipeline has its first stage:

```
Console input → tokenize() → token list → Console output
               (lexer.ts)
```

In lesson 05, `parse()` consumes the token list and produces an abstract syntax
tree (AST) — a tree structure where each node represents one operation. In
lesson 06, `evaluate()` traverses the tree and produces a number. The console
callback grows from `printOutput(tokenDisplay)` to
`printOutput(evaluate(parse(tokenize(userInput))))`.

The token types defined in this file are the shared vocabulary of every
subsequent stage. When the parser looks for `TokenType.KEYWORD` with value
`'if'`, or the evaluator looks for `TokenType.NUMBER`, they are using
definitions from `lexer.ts`. Every stage imports from `lexer.ts` but none of
them modify it. The lexer is a dependency of the rest of the pipeline, never a
dependent. This is the *dependency direction* principle: modules that define
core types and vocabulary are imported by others; they import nothing from
others.

**Real-world connection:**

The TypeScript compiler itself has a lexer — `scanner.ts` in the TypeScript
source code on GitHub. Babel (the JavaScript transpiler used by Create React
App and many other tools) has a lexer. V8 (the JavaScript engine inside Chrome
and Node.js) has a lexer. All of them read source text one character at a time,
classify characters into token classes, and emit a flat list of tokens. The
finite state machine structure, the character classification functions, and the
keyword-lookup-after-identifier pattern appear in all of them. The code you
wrote in this lesson is not a toy — it is the same architecture.

---

## What Breaks Without This

**Without the two-character operator check before single characters:**

Type `x >= 5`. The tokens show `[GT:">"] [EQUALS:"="]` — two tokens instead of
one GTE token. In lesson 05, the parser looks for GTE to build a comparison
node. It finds GT followed by EQUALS and throws a parse error. The bug is in
the lexer but appears as a parser failure, pointing at the wrong file and the
wrong line. Always test two-character operators (`>=`, `<=`, `==`, `~=`, `&&`,
`||`) explicitly.

**Without the `LexerError` class:**

Remove the `LexerError` class and use a plain `Error`. The error message
becomes "unexpected character '@'" with no line number. When the source is 30
lines long, you are searching 30 lines for an `@`. With the line number, you go
directly to line 7. The error is the same; the time to find it is not.

---

## Definition of Done

- [ ] All tests in `src/lexer.test.ts` pass (`npx vitest run` shows all green)
- [ ] `x = 3.14 + y` produces the correct token list in the console
- [ ] `for i = 1:5` shows `for` as KEYWORD, not IDENTIFIER
- [ ] `x >= 5` produces one GTE token, not GT followed by EQUALS
- [ ] `'hello'` produces a STRING token with value `hello` (no quotes)
- [ ] `% comment` is skipped completely
- [ ] Unknown characters produce a `LexerError` with the line number
- [ ] You can explain what a finite state machine is and name its states for the number-reading loop
- [ ] You can explain why two-character operators must be checked before single-character operators
- [ ] You can explain why keywords need a lookup table rather than being read directly as distinct characters
- [ ] You can explain what `interface Token` means and how it differs from a class
- [ ] You can explain why `Set` is used for `KEYWORDS` instead of an array
- [ ] You can explain what `typeof TokenType[keyof typeof TokenType]` produces and why it is better than writing the union by hand
- [ ] `git add src/lexer.ts src/lexer.test.ts` then `git commit -m "Add lexer: first stage of the interpreter pipeline, tokens now visible in the console"`

---

*Next: Lesson 05 — The Parser. The token list becomes an abstract syntax tree.
Operator precedence — why `3 + 4 * 2 = 11` and not `14` — emerges from the
grammar structure, not from any special-case code.*
