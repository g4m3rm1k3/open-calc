# PyX — LAB 15 — Source Maps

**Prerequisites:** Lab 14 complete. The counter component runs in Vite with the stub runtime.

**What this lab adds:**
- Understanding of what source maps are and the Base64 VLQ encoding
- A simple source map generator in `compiler/sourcemap.py`
- The `//# sourceMappingURL=` comment appended to generated JSX
- Verification that browser devtools point to `.pyx` line numbers

**Time:** 60–80 minutes. The Base64 VLQ encoding section is the most mathematically interesting part of this lab.

---

## What You Will Build

A source map is a JSON file that accompanies `counter.jsx` and tells the browser how to map positions in the generated file back to positions in the original `counter.pyx` file. When an error occurs at `counter.jsx:12:5`, the browser looks up that position in the source map and reports `counter.pyx:8:9` instead.

The generated JSX will end with:

```
//# sourceMappingURL=counter.jsx.map
```

And `counter.jsx.map` will be a JSON file like:

```json
{
  "version": 3,
  "file": "counter.jsx",
  "sources": ["counter.pyx"],
  "sourcesContent": ["from pyx import useState\ndef Counter()..."],
  "mappings": "AAAA,SAAS,..."
}
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. A source map maps positions in the generated file to positions in the source file. What is a "position" — how is it represented?
> 2. The `mappings` field in a source map uses Base64 VLQ encoding. What problem does this encoding solve?
> 3. The IR nodes have a `line` field that was filled in by the transformer. The code generator already has the information to build a source map. Why was tracking `line` in the IR worth the effort?
>
> *(Answers at the end of this lab)*

---

## Concept: What Is a Source Map?

**What it is:** A source map is a JSON file that provides a mapping between positions in generated code and positions in source code. The browser uses it to show original source locations in error messages and debugger views.

**The format (Source Map v3):**

```json
{
  "version": 3,
  "file": "output.jsx",
  "sources": ["input.pyx"],
  "sourcesContent": ["...the original source..."],
  "mappings": "AAAA,SAAS,..."
}
```

The `mappings` field is the core. It encodes a list of mappings, one per generated line, separated by `;`. Within each line, individual segment mappings are separated by `,`. Each segment encodes up to five numbers:

1. Generated column
2. Source file index
3. Source line
4. Source column
5. Names index (optional)

**Why not just JSON arrays:**

A real-world source map for a minified JavaScript file might have tens of thousands of mappings. Encoding each as `[12, 0, 34, 5]` would produce a very large file. Base64 VLQ encoding makes each segment compact — a mapping that would be `[0, 0, 0, 0]` in plain JSON becomes just `AAAA` in VLQ (4 bytes, vs 13 bytes for the array form). For large files, this compression is significant.

**Watch for:** Source maps are consumed by browser devtools automatically when they see the `//# sourceMappingURL=` comment. You do not need to configure anything in the browser — it reads the comment and loads the map file.

---

## Concept: Base64 VLQ Encoding

**What it is:** **Variable-Length Quantity (VLQ)** is a way to encode integers of arbitrary size using a variable number of bytes. **Base64 VLQ** combines VLQ with Base64 character encoding to produce a compact, URL-safe string.

**Why variable length?**

Most source map numbers are small (nearby column numbers differ by 1–5). A fixed-size encoding wastes space on small numbers. Variable-length encoding uses fewer bytes for small numbers.

**The encoding process for one number:**

1. Convert the number to a **signed VLQ**: if the number is negative, shift left by 1 and set bit 0. If positive or zero, shift left by 1 and clear bit 0. This encodes the sign in the least significant bit.

2. Split into groups of 5 bits (from least significant to most significant). Mark each group except the last with a continuation bit (bit 5 = 1).

3. Encode each 6-bit value (5 data bits + 1 continuation bit) as a Base64 character:
   ```
   A=0  B=1  C=2  D=3  E=4  F=5  G=6  H=7  I=8  J=9
   K=10 L=11 M=12 N=13 O=14 P=15 Q=16 R=17 S=18 T=19
   U=20 V=21 W=22 X=23 Y=24 Z=25 a=26 b=27 c=28 d=29
   e=30 f=31 g=32 h=33 i=34 j=35 k=36 l=37 m=38 n=39
   o=40 p=41 q=42 r=43 s=44 t=45 u=46 v=47 w=48 x=49
   y=50 z=51 0=52 1=53 2=54 3=55 4=56 5=57 6=58 7=59
   8=60 9=61 +=62 /=63
   ```

**Example: encoding the number 3**

1. Signed VLQ: `3 → 3 << 1 = 6` (positive, so bit 0 = 0, value × 2 = 6)
2. Groups of 5 bits: `6` in binary is `00110` → one group: `00110`
3. No continuation needed (only one group). 6-bit value: `000110` = 6
4. Base64 character for 6: `G`

So the number 3 encodes as `G`.

**Example: encoding 0**

1. `0 << 1 = 0`
2. One group: `000000` = 0
3. Base64 for 0: `A`

The number 0 encodes as `A`. Each mapping `[0, 0, 0, 0]` encodes as `AAAA`.

**Watch for:** Source map segments use *relative* values, not absolute values. If the first mapping is on line 5, the second mapping on line 5 uses the *delta* from the previous column, not the absolute column number. This further reduces the magnitudes of the numbers being encoded.

---

## Step 1 — Write the Source Map Generator

Create `compiler/sourcemap.py`:

```python
"""
Source map generation for PyX compiler output.

Generates Source Map v3 format (https://sourcemaps.info/spec.html).
"""
import json
import base64
from dataclasses import dataclass, field


_B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"


def _encode_vlq(value: int) -> str:
    """Encode a single signed integer as Base64 VLQ."""
    # Step 1: Convert to unsigned VLQ (sign in LSB)
    if value < 0:
        vlq = ((-value) << 1) | 1
    else:
        vlq = value << 1

    # Step 2: Split into 5-bit groups and encode
    result = []
    while True:
        digit = vlq & 0b11111  # take 5 bits
        vlq >>= 5
        if vlq > 0:
            digit |= 0b100000  # set continuation bit
        result.append(_B64_CHARS[digit])
        if vlq == 0:
            break

    return "".join(result)


def _encode_segment(generated_col: int, source_file: int, source_line: int, source_col: int) -> str:
    """Encode one mapping segment as Base64 VLQ."""
    return (
        _encode_vlq(generated_col)
        + _encode_vlq(source_file)
        + _encode_vlq(source_line)
        + _encode_vlq(source_col)
    )


@dataclass
class Mapping:
    """One position mapping: generated position → source position."""
    generated_line: int    # 0-indexed
    generated_col: int     # 0-indexed
    source_file: int       # index into sources array
    source_line: int       # 0-indexed
    source_col: int        # 0-indexed


@dataclass
class SourceMapBuilder:
    """Builds a source map by accumulating position mappings."""
    output_file: str
    source_files: list[str] = field(default_factory=list)
    source_contents: list[str] = field(default_factory=list)
    _mappings: list[Mapping] = field(default_factory=list)

    def add_source(self, filename: str, content: str) -> int:
        """Add a source file and return its index."""
        index = len(self.source_files)
        self.source_files.append(filename)
        self.source_contents.append(content)
        return index

    def add_mapping(
        self,
        generated_line: int,
        generated_col: int,
        source_file: int,
        source_line: int,
        source_col: int = 0,
    ) -> None:
        """Record that generated_line:generated_col corresponds to source_line:source_col."""
        self._mappings.append(Mapping(
            generated_line=generated_line,
            generated_col=generated_col,
            source_file=source_file,
            source_line=source_line,
            source_col=source_col,
        ))

    def build(self) -> str:
        """Produce the source map JSON string."""
        # Group mappings by generated line
        by_line: dict[int, list[Mapping]] = {}
        for m in self._mappings:
            by_line.setdefault(m.generated_line, []).append(m)

        max_line = max(by_line.keys()) if by_line else 0

        # Encode mappings line by line
        line_parts: list[str] = []
        prev_source = 0
        prev_source_line = 0
        prev_source_col = 0

        for line_num in range(max_line + 1):
            segments = sorted(by_line.get(line_num, []), key=lambda m: m.generated_col)
            prev_gen_col = 0
            segment_parts: list[str] = []

            for m in segments:
                # All values are relative to the previous segment in this line
                rel_gen_col = m.generated_col - prev_gen_col
                rel_source = m.source_file - prev_source
                rel_source_line = m.source_line - prev_source_line
                rel_source_col = m.source_col - prev_source_col

                segment_parts.append(_encode_segment(
                    rel_gen_col, rel_source, rel_source_line, rel_source_col
                ))

                prev_gen_col = m.generated_col
                prev_source = m.source_file
                prev_source_line = m.source_line
                prev_source_col = m.source_col

            line_parts.append(",".join(segment_parts))

        mappings_str = ";".join(line_parts)

        source_map = {
            "version": 3,
            "file": self.output_file,
            "sources": self.source_files,
            "sourcesContent": self.source_contents,
            "mappings": mappings_str,
        }

        return json.dumps(source_map, indent=2)
```

---

## Step 2 — Add Source Map Tests

Create `compiler/tests/test_sourcemap.py`:

```python
from compiler.sourcemap import _encode_vlq, _encode_segment, SourceMapBuilder
import json


def test_encode_zero():
    assert _encode_vlq(0) == "A"


def test_encode_one():
    assert _encode_vlq(1) == "C"  # 1 → vlq=2 → 000010 → 'C'


def test_encode_negative_one():
    assert _encode_vlq(-1) == "B"  # -1 → vlq=3 → 000011 → 'B'


def test_encode_three():
    assert _encode_vlq(3) == "G"  # 3 → vlq=6 → 000110 → 'G'


def test_encode_segment_zeros():
    assert _encode_segment(0, 0, 0, 0) == "AAAA"


def test_sourcemap_build():
    builder = SourceMapBuilder(output_file="test.jsx")
    src_idx = builder.add_source("test.pyx", "def Hello(): ...")
    builder.add_mapping(0, 0, src_idx, 0)
    builder.add_mapping(1, 0, src_idx, 1)
    result = json.loads(builder.build())
    assert result["version"] == 3
    assert result["file"] == "test.jsx"
    assert result["sources"] == ["test.pyx"]
    assert result["mappings"] != ""


if __name__ == "__main__":
    tests = [
        test_encode_zero, test_encode_one, test_encode_negative_one,
        test_encode_three, test_encode_segment_zeros, test_sourcemap_build,
    ]
    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            print(f"  PASS  {test.__name__}")
            passed += 1
        except AssertionError as e:
            print(f"  FAIL  {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"  ERROR {test.__name__}: {type(e).__name__}: {e}")
            failed += 1
    print(f"\n{passed} passed, {failed} failed")
```

---

### SAVE AND TRY

```
> python compiler/tests/test_sourcemap.py
```

**Expected:** 6 passed, 0 failed.

---

## Step 3 — Integrate Source Maps Into the CLI

Update `_run_build` in `compiler/cli.py` to generate a source map alongside the output:

```python
    from compiler.sourcemap import SourceMapBuilder
    import os

    # Build source map
    sm = SourceMapBuilder(output_file=os.path.basename(output_path))
    src_idx = sm.add_source(input_path, source)

    # Add a mapping for each function in the IR (simplified — one mapping per function)
    output_lines = result.split("\n")
    for i, line in enumerate(output_lines):
        line_stripped = line.strip()
        if line_stripped.startswith("function "):
            # Find the IR function and its line number
            for func in ir_module.functions:
                if f"function {func.name}" in line_stripped:
                    sm.add_mapping(
                        generated_line=i,
                        generated_col=0,
                        source_file=src_idx,
                        source_line=max(0, func.line - 1),  # IR line is 1-indexed
                    )

    # Write the source map
    map_path = output_path + ".map"
    with open(map_path, "w", encoding="utf-8") as f:
        f.write(sm.build())

    # Append the sourceMappingURL comment to the JSX output
    result = result.rstrip("\n") + f"\n//# sourceMappingURL={os.path.basename(map_path)}\n"
```

---

### SAVE AND TRY

```
> pyxc build examples/counter.pyx
```

Check that two files are created:
- `examples/counter.jsx` — ends with `//# sourceMappingURL=counter.jsx.map`
- `examples/counter.jsx.map` — a JSON file with the source map

Open the map file and verify it has `"version": 3`, `"sources": ["examples/counter.pyx"]`, and `"mappings"` is non-empty.

---

## Challenge: Generate a Mapping for Every IR Node

**You know:** The current source map only adds one mapping per function. A complete source map adds a mapping for every statement — every assignment, return, if block, and loop.

**Task:** Update `CodeGenerator` to track the current output line number and expose a way to add mappings. Then update `_run_build` to create a richer source map by requesting mappings from the code generator as it generates each statement.

This requires the code generator and the CLI to communicate about mappings. Think about the cleanest interface: should the code generator return a list of mappings alongside the output string, or should it accept a callback, or something else?

---

<details>
<summary>▶ Show Solution</summary>

Add mapping collection to `CodeGenerator`:

```python
class CodeGenerator:
    def __init__(self):
        self._indent = 0
        self._lines: list[str] = []
        self.mappings: list[tuple[int, int, int]] = []  # (gen_line, src_line, gen_col)

    def _emit(self, line: str, ir_line: int = 0) -> None:
        gen_line = len(self._lines)
        self._lines.append("  " * self._indent + line)
        if ir_line > 0:
            self.mappings.append((gen_line, ir_line - 1, self._indent * 2))
```

Then each `_gen_*` method passes `ir_line=node.line` to `_emit`. After generation, `cg.mappings` contains all the position pairs for the source map.

In `_run_build`, replace the simplified mapping loop with:
```python
for gen_line, src_line, gen_col in cg.mappings:
    sm.add_mapping(gen_line, gen_col, src_idx, src_line)
```

**Key insight:** The `line` field in every IR node was put there precisely for this purpose. Source location tracking flows through the entire compiler: lexer adds `line` to tokens, the transformer copies `node.lineno` from the Python AST to IR nodes, and the code generator uses those stored line numbers to build the source map. The design decision in Lab 02 (add line tracking to tokens) pays off here.

</details>

---

## Phase 3 Complete

Phase 3 is done. You now have a working compiler that takes `.pyx` files and produces `.jsx` files with source maps. Let's review:

| Lab | What was built |
|---|---|
| 12 | Code generator: IR → JSX string |
| 13 | End-to-end tests: .pyx → .jsx pipeline verified |
| 14 | Vite project: compiled JSX runs in browser |
| 15 | Source maps: errors point to .pyx line numbers |

**Phase 3 Output:**

A `.pyx` file → a `.jsx` file + a `.jsx.map` file. The JSX file is readable, correctly structured, and runnable in Vite. The source map connects errors back to the original `.pyx` source.

**What is missing:**

The runtime (`pyx-runtime`) is a stub. It renders components statically — no state, no re-rendering. Phase 4 and 5 build the real runtime in TypeScript.

---

## Final Check

| Feature | How to verify |
|---|---|
| `_encode_vlq(0)` returns `"A"` | `python -c "from compiler.sourcemap import _encode_vlq; print(_encode_vlq(0))"` |
| Source map JSON is valid | `counter.jsx.map` parses as JSON without error |
| `sourceMappingURL` comment present | Last line of `counter.jsx` starts with `//# sourceMappingURL=` |
| All 6 source map tests pass | `python compiler/tests/test_sourcemap.py` shows "6 passed, 0 failed" |

---

## Your Complete Files

### New / changed files this lab

**`compiler/sourcemap.py`** — new module with `_encode_vlq()`, `SourceMapBuilder`, and `generate_source_map()`. Full content in Steps 1–2.

**`compiler/codegen.py`** — updated to track `(source_line, generated_line, generated_col)` tuples and call `generate_source_map()` at the end. Updated sections in Step 3.

**`compiler/tests/test_sourcemap.py`** — new test file (Step 4).

### Project structure at end of Lab 15

```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py
│   ├── codegen.py          ← updated (source map tracking)
│   ├── codegen_preprocessor.py
│   ├── errors.py
│   ├── ir.py
│   ├── lexer.py
│   ├── nodes.py
│   ├── parser.py
│   ├── parser_py.py
│   ├── preprocessor.py
│   ├── sourcemap.py        ← new
│   ├── tokens.py
│   ├── transformer.py
│   └── tests/
│       ├── __init__.py
│       ├── test_codegen.py
│       ├── test_codegen_preprocessor.py
│       ├── test_lexer.py
│       ├── test_parser.py
│       ├── test_pipeline.py
│       ├── test_sourcemap.py  ← new
│       ├── test_transformer.py
│       └── test_transformer_errors.py
├── runtime/
│   └── (Vite project from Lab 14)
├── examples/
│   ├── counter.jsx        ← now includes `//# sourceMappingURL=`
│   ├── counter.jsx.map    ← generated source map
│   ├── counter.pyx
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. What is a "position" in a source map — how is it represented?**

A position is a (line, column) pair, both 0-indexed. A segment in the `mappings` field encodes four numbers: the generated column, the source file index, the source line, and the source column. The generated line is implicit — segments are grouped by line with `;` separating lines. Column values within a line are stored as deltas from the previous segment's column, not as absolute values.

**2. What problem does Base64 VLQ encoding solve?**

Size. A source map for a real application might have hundreds of thousands of mappings. Encoding each as a JSON array (`[12, 0, 35, 7]`) would produce a very large file that takes time to download and parse. Base64 VLQ encodes each number in as few bytes as possible (small numbers like 0, 1, -1 encode as a single character). The compression ratio is typically 3–10x compared to plain JSON arrays.

**3. Why was tracking `line` in the IR worth the effort?**

Without `line` in the IR nodes, the code generator has no source location information to put in the source map. Every IR node would map to line 0 — useless. By preserving line numbers from the Python AST through the transformer (where each `transform_X` method calls `self._line(node)` and stores it in the IR node), the code generator has precise location data for every statement. The `line = 0` default means "unknown" — and in a correct pipeline, only nodes without a corresponding Python AST node (like synthesized nodes) should have `line = 0`.

---

*End of LAB 15.*

*Phase 4 starts in Lab 16 with the JavaScript runtime. The language switches from Python to TypeScript. Lab 16 builds `h.ts` — the element factory that creates virtual DOM nodes. `h("div", {className: "app"}, "hello")` returns `{type: "div", props: {className: "app"}, children: ["hello"]}` — a plain JavaScript object, not a real DOM element.*
