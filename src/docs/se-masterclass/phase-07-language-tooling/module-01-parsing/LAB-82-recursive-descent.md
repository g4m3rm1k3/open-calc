# SE Masterclass — LAB-82 — Recursive Descent Parser

**Prerequisites:** LAB-81 (Abstract Syntax Trees)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why does "one function per grammar rule" naturally produce a tree instead of a flat structure?
2. In `1 + 2 * 3`, which function should call which — should `parseAddition` call `parseMultiplication`, or the reverse — to make `*` bind tighter than `+`?
3. What does "consuming a token" mean, mechanically, in a parser built around a cursor?

## What You Will Build

A full recursive descent parser turning LAB-80's token stream into LAB-81's AST shapes — tested against real Nano source, not hand-built trees.

```
Input:  let total = 12 + count * 2;

Output (AST):
LetStatement "total"
  BinaryExpression (+)
    NumberLiteral 12
    BinaryExpression (*)
      Identifier "count"
      NumberLiteral 2
```

## Concept: Recursive Descent

**What it is:** Recursive descent parsing writes one function per grammar rule, and those functions call each other in a pattern that mirrors the grammar's own structure — a statement contains expressions, so `parseStatement` calls `parseExpression`; an expression can contain another expression (the two sides of a binary operator), so `parseExpression`-family functions call each other, recursively.

**The problem before:** LAB-11 (Phase 1) built exactly this technique for a four-operator arithmetic language. Nano's grammar is bigger — statements, keywords, function calls, assignment — but the *technique* doesn't change; it just means more functions, each still handling exactly one grammar rule. The risk at this larger scale is precedence: `1 + 2 * 3` must parse so `*` binds tighter than `+`, and getting the call order between parsing functions backward silently produces the wrong tree with no error at all.

**The solution:** Layer the expression-parsing functions from loosest-binding to tightest-binding, where each layer calls the next-tighter layer for its operands. `parseAddition` (loosest: `+`/`-`) calls `parseMultiplication` (tighter: `*`/`/`) for both its operands, which in turn calls `parsePrimary` (tightest: literals, identifiers, parenthesized groups) for its operands. This ordering is what makes `1 + 2 * 3` come out with `2 * 3` nested *inside* the `+` — `parseAddition` asks `parseMultiplication` for its left operand, and `parseMultiplication` happily consumes `2 * 3` as one unit before `parseAddition` even sees the `+`.

**Canonical example:**

```typescript
private parseAddition(): Expression {
  let left = this.parseMultiplication()
  while (this.match("PLUS", "MINUS")) {
    const operator = this.previous().value
    const right = this.parseMultiplication()
    left = { type: "BinaryExpression", operator, left, right }
  }
  return left
}
```

**Project Application:** LAB-83's tree-walking interpreter, LAB-84's bytecode compiler, and every mini-project in this module (LAB-85–91) all consume the AST this parser produces — get precedence wrong here and every downstream tool silently inherits the bug.

**Watch for:** Forgetting the `while` loop around left-associative operators. Without it, `1 + 2 + 3` parses only `1 + 2` and silently drops the ` + 3` — or worse, depending on how the leftover tokens are handled, produces a confusing downstream error far from the actual bug.

## Step 1: The Parser scaffold — cursor over tokens

```typescript
import { Token, TokenType } from "./LAB-80-tokenization"

class Parser {
  private pos = 0

  constructor(private tokens: Token[]) {}

  private peek(): Token { return this.tokens[this.pos] }
  private previous(): Token { return this.tokens[this.pos - 1] }
  private isAtEnd(): boolean { return this.peek().type === "EOF" }

  private check(type: TokenType): boolean {
    return !this.isAtEnd() && this.peek().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.pos++
    return this.previous()
  }

  private match(...types: TokenType[]): boolean {
    if (types.some(t => this.check(t))) { this.advance(); return true }
    return false
  }

  private expect(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance()
    throw new Error(`${message} (got ${this.peek().type} at line ${this.peek().line})`)
  }
}
```

This is the same cursor-over-array shape LAB-80's lexer used over characters, one level up: `pos` is an index into `tokens` instead of into the source string, `advance()` is the only place it moves. `match()` is the parser's version of the lexer's `peek()`-then-decide pattern — check without committing, then consume only if it matches. `expect()` is `match()`'s stricter cousin: the grammar rule requires this token to be here, and if it isn't, that's a syntax error, not a "try something else" branch.

### SAVE AND TRY

```typescript
const tokens = new Lexer("let x = 5;").tokenize() // from LAB-80
const parser = new Parser(tokens) as any
console.log(parser.check("LET"))   // true  -- peeking doesn't consume
console.log(parser.check("LET"))   // true  -- still true, second peek unaffected
parser.advance()
console.log(parser.check("LET"))   // false -- now consumed, cursor moved past it
```

## Step 2: Precedence-layered expression parsing

```typescript
class Parser {
  // ...continued from Step 1...

  private parseExpression(): Expression {
    return this.parseAssignment()
  }

  private parseAssignment(): Expression {
    const expr = this.parseEquality()
    if (this.match("EQUALS")) {
      const value = this.parseAssignment() // right-associative: a = b = c
      if (expr.type === "Identifier") return { type: "AssignmentExpression", name: expr.name, value }
      throw new Error("Invalid assignment target")
    }
    return expr
  }

  private parseEquality(): Expression {
    let left = this.parseComparison()
    while (this.match("EQUALS_EQUALS", "BANG_EQUALS")) {
      const operator = this.previous().value
      left = { type: "BinaryExpression", operator, left, right: this.parseComparison() }
    }
    return left
  }

  private parseComparison(): Expression {
    let left = this.parseAddition()
    while (this.match("LESS", "LESS_EQUALS", "GREATER", "GREATER_EQUALS")) {
      const operator = this.previous().value
      left = { type: "BinaryExpression", operator, left, right: this.parseAddition() }
    }
    return left
  }

  private parseAddition(): Expression {
    let left = this.parseMultiplication()
    while (this.match("PLUS", "MINUS")) {
      const operator = this.previous().value
      left = { type: "BinaryExpression", operator, left, right: this.parseMultiplication() }
    }
    return left
  }

  private parseMultiplication(): Expression {
    let left = this.parseUnary()
    while (this.match("STAR", "SLASH")) {
      const operator = this.previous().value
      left = { type: "BinaryExpression", operator, left, right: this.parseUnary() }
    }
    return left
  }

  private parseUnary(): Expression {
    if (this.match("MINUS")) {
      const operator = this.previous().value
      return { type: "UnaryExpression", operator, operand: this.parseUnary() }
    }
    return this.parsePrimary()
  }
}
```

Six layers, loosest to tightest: assignment → equality → comparison → addition → multiplication → unary → primary (Step 3). Each layer's `while` loop handles left-associativity (`1 - 2 - 3` groups as `(1 - 2) - 3`), while `parseAssignment` calling itself recursively for the right-hand side (instead of looping) makes assignment right-associative (`a = b = c` groups as `a = (b = c)`) — a deliberate difference worth noting since it's the one layer that isn't a simple left-to-right loop.

### SAVE AND TRY

```typescript
const tokens = new Lexer("1 + 2 * 3").tokenize()
const parser = new Parser(tokens) as any
const ast = parser.parseExpression()
console.log(JSON.stringify(ast, null, 2))
// BinaryExpression(+) with left=NumberLiteral(1), right=BinaryExpression(*) with 2 and 3
```

The `*` sub-expression ends up nested *inside* the `+` on the right side — confirming `parseMultiplication` fully consumed `2 * 3` as `parseAddition`'s right operand before `parseAddition`'s loop ever got a chance to see another `+` at that level.

## Step 3: Primary expressions — literals, identifiers, calls, grouping

```typescript
class Parser {
  // ...continued from Step 2...

  private parsePrimary(): Expression {
    if (this.match("NUMBER")) return { type: "NumberLiteral", value: parseFloat(this.previous().value) }
    if (this.match("STRING")) return { type: "StringLiteral", value: this.previous().value }
    if (this.match("TRUE")) return { type: "BooleanLiteral", value: true }
    if (this.match("FALSE")) return { type: "BooleanLiteral", value: false }

    if (this.match("IDENTIFIER")) {
      const name = this.previous().value
      if (this.check("LPAREN")) return this.parseCallExpression(name)
      return { type: "Identifier", name }
    }

    if (this.match("LPAREN")) {
      const expr = this.parseExpression()
      this.expect("RPAREN", "Expected ')' after expression")
      return expr // parens themselves are discarded -- LAB-81's "abstract" in action
    }

    throw new Error(`Unexpected token ${this.peek().type} at line ${this.peek().line}`)
  }

  private parseCallExpression(name: string): CallExpression {
    this.expect("LPAREN", "Expected '('")
    const args: Expression[] = []
    if (!this.check("RPAREN")) {
      do { args.push(this.parseExpression()) } while (this.match("COMMA"))
    }
    this.expect("RPAREN", "Expected ')' after arguments")
    return { type: "CallExpression", callee: { type: "Identifier", name }, args }
  }
}
```

`(expr)` parses the inner expression and returns it directly — the parentheses influenced *which* function got called first (forcing a full `parseExpression` regardless of precedence context) but leave no trace in the tree, exactly LAB-81's "abstract" concept made concrete: grouping affected the parse, not the resulting data structure.

### SAVE AND TRY

```typescript
const tokens1 = new Lexer("(1 + 2) * 3").tokenize()
console.log(JSON.stringify(new Parser(tokens1).parseExpression()))
// BinaryExpression(*) with left = BinaryExpression(+), right = NumberLiteral(3)
// -- the parens correctly forced + to bind BEFORE * this time

const tokens2 = new Lexer("add(1, 2)").tokenize()
console.log(JSON.stringify(new Parser(tokens2).parseExpression()))
// CallExpression, callee=Identifier("add"), args=[NumberLiteral(1), NumberLiteral(2)]
```

## Step 4: Statements — the top-level grammar

```typescript
class Parser {
  // ...continued from Step 3...

  parseProgram(): Program {
    const statements: Statement[] = []
    while (!this.isAtEnd()) statements.push(this.parseStatement())
    return { type: "Program", statements }
  }

  private parseStatement(): Statement {
    if (this.match("LET")) return this.parseLetStatement()
    if (this.match("IF")) return this.parseIfStatement()
    if (this.match("WHILE")) return this.parseWhileStatement()
    if (this.match("FUNCTION")) return this.parseFunctionDeclaration()
    if (this.match("RETURN")) return this.parseReturnStatement()
    if (this.match("LBRACE")) return this.parseBlockStatement()
    return this.parseExpressionStatement()
  }

  private parseLetStatement(): LetStatement {
    const name = this.expect("IDENTIFIER", "Expected variable name").value
    this.expect("EQUALS", "Expected '=' after variable name")
    const initializer = this.parseExpression()
    this.expect("SEMICOLON", "Expected ';' after variable declaration")
    return { type: "LetStatement", name, initializer }
  }

  private parseIfStatement(): IfStatement {
    this.expect("LPAREN", "Expected '(' after 'if'")
    const condition = this.parseExpression()
    this.expect("RPAREN", "Expected ')' after condition")
    const thenBranch = this.parseStatement()
    const elseBranch = this.match("ELSE") ? this.parseStatement() : null
    return { type: "IfStatement", condition, thenBranch, elseBranch }
  }

  private parseWhileStatement(): WhileStatement {
    this.expect("LPAREN", "Expected '(' after 'while'")
    const condition = this.parseExpression()
    this.expect("RPAREN", "Expected ')' after condition")
    const body = this.parseStatement()
    return { type: "WhileStatement", condition, body }
  }

  private parseFunctionDeclaration(): FunctionDeclaration {
    const name = this.expect("IDENTIFIER", "Expected function name").value
    this.expect("LPAREN", "Expected '(' after function name")
    const params: string[] = []
    if (!this.check("RPAREN")) {
      do { params.push(this.expect("IDENTIFIER", "Expected parameter name").value) } while (this.match("COMMA"))
    }
    this.expect("RPAREN", "Expected ')' after parameters")
    this.expect("LBRACE", "Expected '{' before function body")
    const body = this.parseBlockStatement()
    return { type: "FunctionDeclaration", name, params, body }
  }

  private parseReturnStatement(): ReturnStatement {
    const value = this.check("SEMICOLON") ? null : this.parseExpression()
    this.expect("SEMICOLON", "Expected ';' after return value")
    return { type: "ReturnStatement", value }
  }

  private parseBlockStatement(): BlockStatement {
    const statements: Statement[] = []
    while (!this.check("RBRACE") && !this.isAtEnd()) statements.push(this.parseStatement())
    this.expect("RBRACE", "Expected '}' after block")
    return { type: "BlockStatement", statements }
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expression = this.parseExpression()
    this.expect("SEMICOLON", "Expected ';' after expression")
    return { type: "ExpressionStatement", expression }
  }
}
```

`parseStatement` is a dispatch table by leading keyword, structurally the same idea as LAB-09's calculator dispatch table — look at what's next, route to the function that knows how to handle it. Every rule that parses a nested statement (`if`'s branches, `while`'s body) calls `parseStatement()` again, not a narrower function — that's the "recursive" in recursive descent: the grammar is self-referential (a statement can contain a statement), so the functions implementing it are too.

### SAVE AND TRY

```typescript
const source = `
  function add(a, b) {
    return a + b;
  }
  let result = add(2, 3);
`
const tokens = new Lexer(source).tokenize()
const ast = new Parser(tokens).parseProgram()
console.log(ast.statements.map(s => s.type))
// ["FunctionDeclaration", "LetStatement"]
```

Both top-level constructs parsed correctly from one call to `parseProgram()`, and — critically — `parseFunctionDeclaration`'s body correctly nested a `ReturnStatement` containing a `BinaryExpression`, all via the same `parseStatement`/`parseExpression` machinery reused at every level.

## 🎯 Challenge

Add support for `&&` and `||` as a new precedence layer, sitting between `parseAssignment` and `parseEquality` (logical operators bind looser than comparisons, so `a > 0 && b > 0` parses as `(a > 0) && (b > 0)`, not `a > (0 && b) > 0`).

<details>
<summary>Solution</summary>

```typescript
private parseAssignment(): Expression {
  const expr = this.parseLogicalOr()
  if (this.match("EQUALS")) {
    const value = this.parseAssignment()
    if (expr.type === "Identifier") return { type: "AssignmentExpression", name: expr.name, value }
    throw new Error("Invalid assignment target")
  }
  return expr
}

private parseLogicalOr(): Expression {
  let left = this.parseLogicalAnd()
  while (this.match("OR")) {
    const operator = this.previous().value
    left = { type: "BinaryExpression", operator, left, right: this.parseLogicalAnd() }
  }
  return left
}

private parseLogicalAnd(): Expression {
  let left = this.parseEquality()
  while (this.match("AND")) {
    const operator = this.previous().value
    left = { type: "BinaryExpression", operator, left, right: this.parseEquality() }
  }
  return left
}
```

`parseAssignment` now calls `parseLogicalOr` (was `parseEquality`) as its next-tighter layer, and `parseLogicalOr` calls `parseLogicalAnd` calls `parseEquality` — inserting two new layers into the existing chain without touching anything below `parseEquality`, exactly the "layers call the next-tighter layer" discipline the concept section described.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Precedence | One `parseExpression` function with precedence logic inline | One function per precedence level, each calling the next-tighter one |
| `1 + 2 + 3` | Parse right-to-left | `while` loop makes it naturally left-associative |
| Parentheses | Keep as a node in the tree | Parse and discard — only the inner expression remains |
| A syntax error | Return `null` and hope the caller checks | `throw` immediately with the offending token and line |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `parseAddition` call `parseMultiplication`, not the other way around? | |
| 2 | Why does the parser discard parentheses instead of keeping a `GroupExpression` node? | |
| 3 | Why is `parseAssignment` written with recursion instead of a `while` loop, unlike the operator layers below it? | |

## Quick Check Answers

1. Because each grammar rule becomes its own function, and a rule that contains another rule (an expression containing sub-expressions, a statement containing statements) naturally calls the function for that sub-rule — the call structure mirrors the grammar's own nesting.
2. `parseAddition` must call `parseMultiplication` for its operands so that a `*` immediately after a `+`'s left operand gets fully consumed by the tighter layer first, ending up nested *inside* the `+` node — producing correct precedence.
3. It means advancing the cursor past the current token and moving `pos` forward by one, via `advance()`.

*Next: [LAB-83 — Tree-Walking Interpreter](../module-02-interpretation/LAB-83-tree-walking-interpreter.md)*
