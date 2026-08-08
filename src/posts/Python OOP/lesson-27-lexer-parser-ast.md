# Lesson 27: From Characters to Structure
### (Project 9 — Mini Database Engine, C++)

> **Pipeline:** `Text → Lexer → Parser → AST → Semantic Analysis → Execution`
> **This lesson builds:** `Lexer → Parser → AST` — the first three stages
> built for real, anywhere in this curriculum. One literal query travels
> through every stage this lesson builds:
> `SELECT name, price FROM products WHERE price > 10`

**What you will build.** A `Lexer` turning that exact query string into
a stream of typed tokens, and a `Parser` turning that token stream into
a real, structured `SelectQuery` — the Abstract Syntax Tree this
curriculum's own schema has referenced by name since Lesson 1, built
for the first time. The transferable problem this lesson is actually
about: a flat sequence of characters has no structure at all, and
neither does a flat sequence of tokens — structure has to be built,
deliberately, in stages, each one solving a narrower problem than the
one before it tried to solve all at once.

**What you need to know first.** Lesson 26 — this project's own
`BTree`, which the query this lesson parses will eventually search
against, once execution is built. Project 5, Lesson 12 (JavaScript) —
regex-based pattern matching, the tool this lesson's lexer deliberately
does *not* use, for reasons its own SE lens explains.

---

## Concept Unit: The Lexer

### The Problem

`"SELECT name, price FROM products WHERE price > 10"` is, to a
computer, nothing but a sequence of individual characters — `S`, `E`,
`L`, `E`, `C`, `T`, a space, `n`, `a`, `m`, `e`... Nothing about
recognizing `SELECT` as a meaningful keyword, or `price` as a distinct
identifier, or `>` as an operator, exists yet. Before any structure can
be understood, the raw text needs to be grouped into meaningful,
labeled chunks.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `lexer_arith_lab.cpp` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond `g++`; `<cctype>` for character
  classification.

### The New Code

```cpp
#include <cctype>

struct Token {
    std::string type;
    std::string value;
};

std::vector<Token> tokenize(const std::string& text) {
    std::vector<Token> tokens;
    size_t i = 0;
    while (i < text.size()) {
        char c = text[i];
        if (std::isspace(c)) {
            i++;
        } else if (std::isdigit(c)) {
            std::string num;
            while (i < text.size() && std::isdigit(text[i])) {
                num += text[i];
                i++;
            }
            tokens.push_back({"NUMBER", num});
        } else if (c == '+' || c == '-') {
            tokens.push_back({"OP", std::string(1, c)});
            i++;
        } else {
            i++;
        }
    }
    return tokens;
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
std::vector<Token> tokens = tokenize("12 + 7 - 3");
for (const auto& t : tokens) {
    std::cout << t.type << "(" << t.value << ") ";
}
```

Real output:

```
NUMBER(12) OP(+) NUMBER(7) OP(-) NUMBER(3)
```

`"12 + 7 - 3"` — one flat string — became five distinct, labeled
**tokens**: each one knows both *what kind* of thing it is (`NUMBER`,
`OP`) and *what its actual text* was. Whitespace vanished entirely — it
carried no meaning and was simply skipped. This whole process is called
**lexical analysis**, or **lexing** — the `Text → Lexer` stage of this
curriculum's own long-referenced pipeline, built for real for the first
time.

### Discard the throwaway example

`lexer_arith_lab.cpp`'s specific `tokenize` function is deleted — the
core scanning technique it proved (walk character by character,
recognize a category, consume the whole run of matching characters at
once) carries forward directly into this project's real lexer.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `lexer.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<set>`.

### The New Code

```cpp
class Lexer {
public:
    std::vector<Token> tokenize(const std::string& text) {
        std::vector<Token> tokens;
        size_t i = 0;
        std::set<std::string> keywords = {"SELECT", "FROM", "WHERE"};

        while (i < text.size()) {
            char c = text[i];

            if (std::isspace(c)) {
                i++;
            } else if (std::isalpha(c)) {
                std::string word;
                while (i < text.size() && (std::isalnum(text[i]) || text[i] == '_')) {
                    word += text[i];
                    i++;
                }
                if (keywords.count(word)) {
                    tokens.push_back({"KEYWORD", word});
                } else {
                    tokens.push_back({"IDENTIFIER", word});
                }
            } else if (std::isdigit(c)) {
                std::string num;
                while (i < text.size() && std::isdigit(text[i])) {
                    num += text[i];
                    i++;
                }
                tokens.push_back({"NUMBER", num});
            } else if (c == ',') {
                tokens.push_back({"COMMA", ","});
                i++;
            } else if (c == '>' || c == '<' || c == '=') {
                tokens.push_back({"OPERATOR", std::string(1, c)});
                i++;
            } else {
                i++;
            }
        }
        return tokens;
    }
};
```

### The Updated Project

Brand-new file, shown whole above — the same character-by-character
scanning shape as the isolated lab, now recognizing SQL's own
vocabulary: keywords, identifiers, numbers, commas, comparison
operators.

### Mechanical walkthrough

- `std::set<std::string> keywords = {"SELECT", "FROM", "WHERE"};` —
  **(a) first appearance** of `std::set`: a collection holding unique
  values with fast membership checking — the C++ standard library's own
  counterpart to Project 4, Lesson 11's JavaScript `Set`, used here for
  exactly the same reason: checking "is this word one of a fixed list?"
  efficiently.
- `while (i < text.size() && (std::isalnum(text[i]) || text[i] == '_')) { word += text[i]; i++; }`
  — **(b) hard concept reappearing**: the same "consume a whole run of
  matching characters" shape from the isolated lab's number-scanning,
  applied to letters, digits, and underscores together — what SQL
  considers a valid identifier character.
- `if (keywords.count(word)) { tokens.push_back({"KEYWORD", word}); } else { tokens.push_back({"IDENTIFIER", word}); }`
  — **(a) first appearance** of the **keyword-vs-identifier**
  distinction: the exact same scanning logic captures *any* word — the
  lexer only decides *afterward*, by checking `keywords`, whether this
  particular word (`SELECT`) is part of the language's own fixed
  vocabulary or a user-chosen name (`price`, `products`).
- `{"COMMA", ","}` / `{"OPERATOR", std::string(1, c)}` — **(b) hard
  concept reappearing**: single-character tokens, the same
  one-character-at-a-time consumption as the isolated lab's `+`/`-`
  operators.

### CS lens

This is **tokenization**, the universal first stage of processing any
formal, structured text — not just programming languages. Also
recognized in: every real compiler's own first pass, a CSV parser
distinguishing commas from quoted commas, Project 5, Lesson 12's own
Markdown regex patterns (a different technique reaching for a similar
goal — recognizing meaningful chunks of text — worth contrasting
directly in the SE lens below).

### SE lens

Project 5, Lesson 12 used regular expressions to recognize Markdown
patterns — a genuinely different technique from this unit's
hand-written, character-by-character scanner. The real reason a real
lexer is usually hand-written (or generated by a dedicated tool) rather
than regex-based: a lexer needs to track *position* precisely (exactly
where one token ends and the next begins, in order, left to right) and
often needs to make decisions based on *what's already been consumed* —
neither of which regex, built for matching independent patterns, does
naturally. The cost of the hand-written version: real, explicit control
flow for every character category, more code than an equivalent regex
pattern; the benefit: precise, ordered, stateful scanning that scales
correctly as the language's own vocabulary grows.

### Commands needed

Same `g++`/execute pattern as every lesson in this phase.

### Run it

```cpp
std::string query = "SELECT name, price FROM products WHERE price > 10";
Lexer lexer;
std::vector<Token> tokens = lexer.tokenize(query);
```

Real output:

```
Input:  SELECT name, price FROM products WHERE price > 10
Tokens: KEYWORD(SELECT) IDENTIFIER(name) COMMA(,) IDENTIFIER(price) KEYWORD(FROM) IDENTIFIER(products) KEYWORD(WHERE) IDENTIFIER(price) OPERATOR(>) NUMBER(10)
```

This lesson's own carried-through literal query, correctly split into
ten typed tokens — `SELECT` and `FROM` and `WHERE` recognized as
keywords, `name`/`price`/`products` as identifiers, `>` as an operator,
`10` as a number.

### Connecting sentence

The raw text is now a clean, typed sequence of tokens — still
completely flat, with no sense yet of which tokens belong to which
clause. The next unit builds exactly that structure.

---

## Concept Unit: The Parser and the AST

### The Problem

The token stream from the previous unit has no structure at all — it's
still just a flat list, in order, with no representation of "these two
identifiers are the selected columns," "this one is the table," or
"this comparison is the filter condition." Something needs to consume
that flat sequence and build a real, structured representation — a tree
— capturing what the query actually *means*.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `parser.cpp`.
- **Change type** — add.
- **Location** — new file, alongside `lexer.cpp`.
- **Dependencies** — `Lexer`, this lesson's previous unit; `<optional>`,
  `<stdexcept>`.

### The New Code

```cpp
struct WhereClause {
    std::string column;
    std::string op;
    std::string value;
};

struct SelectQuery {
    std::vector<std::string> columns;
    std::string table;
    std::optional<WhereClause> where;
};

class Parser {
public:
    Parser(std::vector<Token> tokens) : tokens(tokens), pos(0) {}

    SelectQuery parse() {
        expect("KEYWORD", "SELECT");

        SelectQuery query;
        query.columns.push_back(consumeIdentifier());
        while (peekType() == "COMMA") {
            advance();
            query.columns.push_back(consumeIdentifier());
        }

        expect("KEYWORD", "FROM");
        query.table = consumeIdentifier();

        if (pos < tokens.size() && peekType() == "KEYWORD" && peekValue() == "WHERE") {
            advance();
            WhereClause where;
            where.column = consumeIdentifier();
            where.op = expect("OPERATOR").value;
            where.value = expect("NUMBER").value;
            query.where = where;
        }

        return query;
    }

private:
    std::vector<Token> tokens;
    size_t pos;

    std::string peekType() { return pos < tokens.size() ? tokens[pos].type : "EOF"; }
    std::string peekValue() { return pos < tokens.size() ? tokens[pos].value : ""; }
    void advance() { pos++; }

    Token expect(const std::string& type) {
        if (pos >= tokens.size() || tokens[pos].type != type) {
            throw std::runtime_error("Expected " + type + " but got " +
                (pos < tokens.size() ? tokens[pos].type + "(" + tokens[pos].value + ")" : "end of input"));
        }
        Token t = tokens[pos];
        advance();
        return t;
    }

    void expect(const std::string& type, const std::string& value) {
        Token t = expect(type);
        if (t.value != value) {
            throw std::runtime_error("Expected '" + value + "' but got '" + t.value + "'");
        }
    }

    std::string consumeIdentifier() {
        return expect("IDENTIFIER").value;
    }
};
```

### The Updated Project

Brand-new file, shown whole above — `SelectQuery` and `WhereClause`
together *are* this lesson's AST: a real, structured representation of
"what this query means," built once, ready for anything downstream
(execution, in a future lesson) to work with directly, never needing
to re-scan text or tokens again.

### Mechanical walkthrough

- `struct WhereClause { std::string column; std::string op; std::string value; };`
  / `struct SelectQuery { std::vector<std::string> columns; std::string table; std::optional<WhereClause> where; };`
  — **(a) first appearance** of the **AST** itself: plain structs,
  directly representing the query's actual *meaning* — a list of
  selected columns, a table name, an optional filter — with no trace of
  the original text's specific formatting, spacing, or token order left
  in it at all.
- `std::optional<WhereClause> where;` — **(a) first appearance** of
  `std::optional`: represents a value that might or might not be
  present — here, a query with no `WHERE` clause simply has an empty
  `where`, checked safely (`if (ast.where)`) rather than needing a
  separate "has where clause" boolean tracked alongside a
  possibly-meaningless `WhereClause`.
- `Parser(std::vector<Token> tokens) : tokens(tokens), pos(0) {}` —
  **(b) hard concept reappearing**: a constructor, storing the full
  token stream and starting a position cursor at the beginning — the
  parser's own version of the lexer's `i`, tracking progress through
  its input.
- `expect("KEYWORD", "SELECT");` — **(a) first appearance** of the core
  parsing primitive: check that the *current* token matches what's
  expected at this exact point in the grammar, consume it if so, raise
  a real error if not — every single parsing decision in this class
  reduces to variations of this one operation.
- `query.columns.push_back(consumeIdentifier()); while (peekType() == "COMMA") { advance(); query.columns.push_back(consumeIdentifier()); }`
  — **(a) first appearance** of parsing a **repeated** structure:
  consume one column, then keep consuming "comma, then another column"
  for as long as commas keep appearing — directly encoding the grammar
  rule "one or more comma-separated identifiers" as a loop.
- `if (pos < tokens.size() && peekType() == "KEYWORD" && peekValue() == "WHERE") { ... }`
  — **(a) first appearance** of parsing an **optional** structure: the
  `WHERE` clause is only parsed if it's actually present — `peek`ing
  ahead without consuming, so a query with no `WHERE` at all is left
  completely untouched by this block.
- This entire technique — a set of functions, each one responsible for
  recognizing one specific grammatical structure, calling each other
  and consuming tokens as they go — is called **recursive descent
  parsing**, though this particular grammar is simple enough that no
  function actually calls back into an earlier one; a more complex
  query language (nested subqueries, for instance) would need genuine
  recursion, which is where the name comes from.

### CS lens

This is **syntactic analysis**, or **parsing** — the `Parser → AST`
stage of the pipeline named at this lesson's own start. Also recognized
in: every real programming language's own compiler or interpreter (the
`Text → Lexer → Parser → AST` sequence named generically since this
curriculum's very first schema document is a completely standard,
industry-wide pipeline shape, not something invented for this
project), a JSON parser turning `{"a": 1}` into a real, structured
object, a configuration file parser turning YAML or TOML text into
structured settings.

### SE lens

Proven directly — a real parse error, from a query missing its
required `FROM` keyword:

```cpp
std::string query = "SELECT name, price products WHERE price > 10";  // missing FROM
```

```
Parse error: Expected KEYWORD but got IDENTIFIER(products)
```

The error names *exactly* what went wrong and *where* — the parser
expected a `KEYWORD` token at this point in the grammar (it had just
finished consuming the column list and was looking for `FROM`) and
found an `IDENTIFIER` instead. This precision is the real payoff of
building a dedicated parser rather than trying to validate a query with
one large, ad-hoc string-matching function: every expectation is
explicit, in one place, and every failure names the specific rule that
was violated.

### Commands needed

Same pattern.

### Run it

```cpp
Lexer lexer;
std::vector<Token> tokens = lexer.tokenize(query);

Parser parser(tokens);
SelectQuery ast = parser.parse();
```

Real output, the same literal query carried all the way through both
stages this lesson built:

```
Input: SELECT name, price FROM products WHERE price > 10
Parsed AST:
  columns: name price
  table: products
  where: price > 10
```

The flat string is now a real, structured `SelectQuery` object:
`columns` holding exactly `["name", "price"]`, `table` holding
`"products"`, `where` holding a real `WhereClause` with `column`,
`op`, and `value` all correctly separated out — nothing left as raw
text anywhere in the result.

### Connecting sentence

Text became tokens; tokens became a real, structured AST — nothing
downstream will ever need to re-read the original query string again,
which is the entire point of building this pipeline as separate,
deliberate stages instead of one function trying to do everything at
once.

---

## Closing

**Connect the pieces.** The one literal query promised at this
lesson's start, traced through every stage built: `"SELECT name, price
FROM products WHERE price > 10"` enters `Lexer::tokenize` as a plain
string and leaves as ten typed tokens —
`KEYWORD(SELECT) IDENTIFIER(name) COMMA(,) ...`; that token stream
enters `Parser::parse` and leaves as a `SelectQuery` — `columns:
["name", "price"]`, `table: "products"`, `where: {column: "price", op:
">", value: "10"}` — a real, structured object with no trace of the
original text's exact spelling or spacing, ready for the next stage of
the pipeline this lesson's own header named but didn't yet build:
actually executing the query against `Lesson 26`'s `BTree`.

**What breaks without this.** Already shown directly — the precise
parse error from a query missing `FROM` — deliberately not restaged
here, since it landed exactly where it mattered, inside the real
parser that needed it.

**Exercises.**
1. Extend the lexer to recognize `!=` and `>=` as single, two-character
   operator tokens (currently, `>=` would incorrectly tokenize as two
   separate one-character tokens) — you'll need to look ahead one
   character before deciding.
2. Add support for a second comparison operator type — string literals
   in `WHERE` clauses (`WHERE name = 'Widget'`), requiring the lexer to
   recognize single-quoted text as its own token type.
3. Extend `SelectQuery`'s AST to support `SELECT *` (all columns) as a
   real, distinct case — decide whether this is best represented as a
   special value inside `columns`, or as a separate boolean field on
   `SelectQuery`, and justify your choice in one sentence.

**Definition of done.**
- [ ] `Lexer::tokenize` correctly converts this lesson's literal query
      into exactly the ten tokens shown above.
- [ ] `Parser::parse` correctly converts that token stream into a
      `SelectQuery` with the exact columns, table, and where clause
      shown above.
- [ ] You've triggered a real parse error from a malformed query, and
      can explain exactly what `expect()` call caused it to fire.
- [ ] You can state, in one sentence, what problem the lexer solves
      that the parser doesn't, and vice versa — why this curriculum
      builds them as two separate stages rather than one function.
- [ ] Commit with a message explaining why — e.g. `"Build a real
      Lexer/Parser pipeline turning SQL-like query text into a
      structured SelectQuery AST, replacing what would otherwise be one
      large, hard-to-diagnose parsing function"` — not `"add SQL
      parser"`.

**Next lesson** stays in Project 9: executing the `SelectQuery` AST
this lesson built — for real, against `Lesson 26`'s own `BTree` — the
`AST → Execution` stage that finally makes this whole pipeline answer a
real query with real data.
