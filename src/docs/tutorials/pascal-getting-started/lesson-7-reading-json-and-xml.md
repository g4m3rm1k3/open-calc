# Lesson 7: Reading JSON and XML

> **Written under a much tighter usage budget than Lessons 0-6 — this
> one skips execution traces, CS/SE lens sections, and extended
> exercises to fit. See `HANDOFF.md` for what a full pass needs to add,
> including a real sequencing problem this lesson creates (below).

**What you will build:** Two small programs — one parsing a JSON
string, one parsing an XML file from disk — using Free Pascal's real
standard-library units for each. *Software Tools in Pascal* predates
both formats, so this is a from-scratch addition, not something the
book itself covers.

**What you need to know first:** Lesson 6 — file-reading concepts and
the idea of a `var` parameter that a call fills in for you (Lesson 5).

**A sequencing note, stated plainly:** Free Pascal's JSON and XML
libraries are **class-based** — `TJSONObject`, `TXMLDocument`, and
method calls written with a dot (`obj.Get(...)`). Every lesson before
this one has been purely procedural — no classes anywhere. This lesson
folds in just enough class vocabulary to not leave that unexplained,
but a proper "Pascal classes and objects" lesson belongs *before* this
one in the finished series — see `HANDOFF.md`.

**Terms used in this lesson:**
- **`uses` clause** — a declaration, right after the `program` line,
  naming every **unit** (Pascal's term for a separately compiled
  library module) a program needs beyond the basics. Every earlier
  lesson skipped this because `writeln`, `readln`, `Length`, `Copy`,
  and everything else used so far lives in the `System` unit, which
  Free Pascal includes automatically, with no `uses` needed. JSON and
  XML support do not — they live in separate units that must be named
  explicitly.
- **Class** — a Pascal type that bundles data and the routines
  ("methods") that operate on it together, where each instance is
  created dynamically and referred to through a reference rather than
  held directly the way an `integer` or `string` is. This lesson only
  *uses* classes the JSON/XML units already define — it never defines
  one of its own.
- **Method** — a procedure or function declared as part of a class,
  called with dot notation on a specific instance (`obj.Get(...)`)
  rather than by name alone — the instance it's called on is
  implicitly available to the method as the data it acts on.
- **Type cast** — an explicit instruction telling the compiler to treat
  a value as a more specific type than the one it's currently held as,
  written `SpecificType(value)`.
- **`nil`** — Pascal's value meaning "this reference points to
  nothing." Used here to detect the end of a chain of sibling XML
  nodes.
- **`<>`** — the "not equal to" comparison operator.

**Objects and methods used:**
- **`GetJSON`** —
  - *What it is:* a function, from the `jsonparser` unit, that parses
    JSON text into an in-memory tree.
  - *Implementation:* `function GetJSON(const JSON: TJSONStringType):
    TJSONData;` — takes a string, returns the general base type for
    any parsed JSON value.
  - *Its use:* this lesson's entry point into the JSON tree.
- **`TJSONObject.Get`** —
  - *What it is:* a method for reading one named field out of a parsed
    JSON object, with a fallback value.
  - *Implementation:* overloaded per return type, e.g. `function
    Get(const AName: String; ADefault: string): string;` and the same
    shape for `Integer`, `Boolean`, etc. — the type of the default
    value you pass picks which overload runs.
  - *Its use:* reads `"name"` and `"age"` back out of the parsed
    object, falling back to a safe default if a key is missing.
- **`ReadXMLFile`** —
  - *What it is:* a procedure, from the `XMLRead` unit, that parses an
    XML file directly from disk.
  - *Implementation:* `procedure ReadXMLFile(out ADoc: TXMLDocument;
    const AFilename: String);` — `out` is a stricter relative of
    Lesson 5's `var`: both pass by reference, but `out` also documents
    that the procedure will assign a fresh value rather than rely on
    whatever the caller passed in.
  - *Its use:* fills in `doc` with the parsed file — the same
    "procedure hands back a result through a reference parameter"
    shape Lesson 5's `Split` used, applied to a single result instead
    of two.
- **`TDOMNode`** —
  - *What it is:* a class representing one node in a parsed XML tree.
  - *Implementation:* exposes `.NodeName`, `.TextContent`,
    `.FirstChild`, and `.NextSibling` as properties (values read like
    fields, backed by methods).
  - *Its use:* this lesson walks a chain of sibling nodes, reading each
    one's name and text.

---

## The Problem

Lesson 6 read and wrote plain, unstructured lines of text. Real
structured data — configuration files, API responses, this project's
own `resources.json` — is nested and typed, and needs a real parser
instead of manual `Pos`/`Copy` slicing.

## Reading JSON

```pascal
program ReadJSON;
uses
  fpjson, jsonparser;
var
  data: TJSONData;
  obj: TJSONObject;
begin
  data := GetJSON('{"name": "Ada", "age": 36}');
  obj := TJSONObject(data);
  writeln('Name: ', obj.Get('name', ''));
  writeln('Age: ', obj.Get('age', 0));
  data.Free;
end.
```

`uses fpjson, jsonparser;` is the **`uses` clause** defined above:
`fpjson` defines the JSON value types (`TJSONData`, `TJSONObject`, and
siblings for arrays, strings, numbers); `jsonparser` defines `GetJSON`,
the actual parsing function.

`data: TJSONData;` declares a variable of a **class** type. Unlike
every plain variable in this series so far, `data` doesn't hold a
value directly — it holds a reference to an object that `GetJSON` will
create.

`data := GetJSON('{"name": "Ada", "age": 36}');` calls `GetJSON`,
described above, on a literal JSON string, and stores the resulting
reference in `data`. `GetJSON` returns the general `TJSONData` type
because JSON's root could be an object, an array, a string, or a
number — it doesn't know in advance which one it parsed.

`obj := TJSONObject(data);` is a **type cast**, defined above:
`TJSONObject(data)` tells the compiler "treat this general
`TJSONData` reference specifically as a `TJSONObject`" — necessary
because `Get`, used next, is only defined on `TJSONObject`, not on the
more general `TJSONData`.

`obj.Get('name', '')` is a **method** call, defined above: dot
notation on the `obj` instance, calling `Get` with the field name
`'name'` and a fallback empty string used only if that key is missing.
`obj.Get('age', 0)` does the same for a numeric field, with `0` as its
fallback — the fact that the fallback is `0` instead of `''` is what
selects the integer-returning overload of `Get` instead of the
string-returning one.

`data.Free;` releases the memory the parsed tree occupies. Pascal
classes are allocated dynamically and are **not** cleaned up
automatically when a variable goes out of scope the way an `integer`
or `string` is — skipping `Free` leaks that memory for the rest of the
program's run.

### Expected Output

```
Name: Ada
Age: 36
```

Not run this session.

## Reading XML

```pascal
program ReadXML;
uses
  DOM, XMLRead;
var
  doc: TXMLDocument;
  node: TDOMNode;
begin
  ReadXMLFile(doc, 'data.xml');
  node := doc.DocumentElement.FirstChild;
  while node <> nil do
  begin
    writeln(node.NodeName, ': ', node.TextContent);
    node := node.NextSibling;
  end;
  doc.Free;
end.
```

`uses DOM, XMLRead;` names two units: `DOM` defines the tree types
(`TXMLDocument`, `TDOMNode`); `XMLRead` defines the parsing procedure,
`ReadXMLFile`.

`doc: TXMLDocument; node: TDOMNode;` declare two more class-typed
variables — same reference semantics as `data` in the JSON example
above, not re-derived here.

`ReadXMLFile(doc, 'data.xml');` — described above under Objects and
methods: parses `data.xml` from disk and fills `doc` in through its
`out` parameter, the same "the call hands back a result through a
reference parameter" idea Lesson 5 taught with `var`.

`doc.DocumentElement.FirstChild` chains two property reads: 
`DocumentElement` gets the XML document's single root element; 
`.FirstChild` gets that root's first child node, or `nil` if it has
none.

`while node <> nil do` is a **new loop condition** built from `<>`
(not-equal, defined above) and `nil` (defined above): the loop keeps
running as long as `node` still refers to an actual node rather than
"nothing," which is how the end of a sibling chain is detected — there
is no count to loop up to the way Lesson 3's array had one.

`writeln(node.NodeName, ': ', node.TextContent);` reads two more
properties per node — its tag name and its text — and prints them with
the same multi-argument `writeln` from every earlier lesson.

`node := node.NextSibling;` advances to the next node in the chain;
once there are no more siblings, `NextSibling` itself returns `nil`,
which is what eventually makes the loop's own condition false.

`doc.Free;` releases the parsed document, same reasoning as `data.Free`
above.

### Expected Output

Given a `data.xml` containing `<root><a>1</a><b>2</b></root>`:

```
a: 1
b: 2
```

Not run this session — neither example has been compiled, and the
`fpjson`/`jsonparser`/`DOM`/`XMLRead` units may need Free Pascal's
`fcl-xml`/`fcl-json` packages available, which ship with a standard
install but haven't been confirmed present this session.

## Try It Yourself

- Change the JSON string to include a missing key, e.g. call
  `obj.Get('email', 'none')`, and confirm the fallback prints instead
  of an error.
- Add a third sibling to `data.xml` and confirm the loop picks it up
  with no code changes — proof the `while node <> nil` shape adapts to
  however many siblings actually exist, the same way Lesson 6's
  `while not EOF` adapted to file length.

**Next:** see `HANDOFF.md` — this is the frontier of the series for
now.
