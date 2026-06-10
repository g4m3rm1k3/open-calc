# Python Tool Database — LAB 57 — Mastercam XML: Structure and Exploration

**Prerequisites:** Lab 31 (XML parsing basics — `ElementTree`, `find()`, `findall()`, `element.text`). Lab 53 (exploring an unknown schema). You can parse flat tool XML and query unfamiliar SQLite databases. This lesson applies both skills to a new format: Mastercam's XML operation sheets.

**What this lab adds:**
- XML attributes (`<tool id="3">`) vs XML child text (`<name>EM-0500</name>`) — two ways data lives in XML
- `element.get('id')` vs `element.attrib['id']` — safe access vs KeyError
- `root.findall('.//tool')` — the `.//' XPath prefix that searches all descendants, not just direct children
- How to explore an unfamiliar XML file the same way you explored an unfamiliar `.tooldb` in Lab 53

**Time:** 50–65 minutes

---

## What You Will Build

A script that opens a Mastercam XML operation sheet and prints a summary like this:

```
=== Mastercam Operation Sheet ===
Found 3 tool(s), 5 operation(s)

TOOLS:
  Tool #1 — 1/2 FLAT ENDMILL (diameter=0.5)
  Tool #2 — 1/4 DRILL (diameter=0.25)
  Tool #3 — 1 FACE MILL (diameter=1.0)

OPERATIONS:
  POCKET-1    → Tool #1
  POCKET-2    → Tool #1
  DRILL-1     → Tool #2
  DRILL-2     → Tool #2
  FACE-1      → Tool #3
```

By the end you will also understand why Mastercam sometimes stores the same information as an XML attribute in one version and as a child element in another — and how to handle both.

---

> **Quick Check — try to answer before reading:**
>
> 1. In Lab 31 you used `element.find('diameter').text` to read a value. What happens if `find('diameter')` returns `None`? (Prediction: what error does Python raise?)
> 2. `element.get('id')` vs `element.attrib['id']` — both read the same XML attribute. What is the difference in behavior when the attribute does not exist?
> 3. `root.findall('tool')` vs `root.findall('.//tool')` — you have used `findall` before in Lab 31. Predict: which one finds `<tool>` elements that are nested inside `<toollist>` inside `<operations>`?
>
> *(Answers at the end of this lab)*

---

## Concept: XML Attributes vs Child Text

**What it is:** Two different ways XML can store the same piece of data — as an attribute on an element tag, or as a child element with text content.

**The problem before:** In Lab 31, all your tool XML used child text:

```xml
<tool>
    <name>EM-0500</name>
    <diameter>0.5</diameter>
</tool>
```

Mastercam's XML sometimes uses attributes instead:

```xml
<tool id="1" name="EM-0500" diameter="0.5" />
```

And sometimes mixes both:

```xml
<tool id="1">
    <name>EM-0500</name>
    <params diameter="0.5" flutes="4" />
</tool>
```

Your Lab 31 code used `element.find('name').text` — which works for child text but silently fails for attributes. If the data you want is in an attribute, `find()` returns `None` and `.text` raises `AttributeError`.

**The solution:** Use `element.get('attribute_name')` for attributes and `element.find('tag').text` for child text. Both return `None` if the value is missing, so your `safe_text` helpers from Lab 31 work with attributes too — you just call them differently.

**Smallest possible example:**

```python
import xml.etree.ElementTree as ET

xml = '<tool id="1" name="EM-0500"><notes>sharp</notes></tool>'
element = ET.fromstring(xml)

# Reading an attribute:
tool_id = element.get('id')          # → "1"
name    = element.get('name')        # → "EM-0500"
missing = element.get('diameter')    # → None (no AttributeError)

# Reading child text:
notes   = element.find('notes').text # → "sharp"
```

**Why it matters here:** Mastercam XML mixes both patterns. A `<tool>` element may carry its `id` as an attribute and its `name` as a child element. You need to recognize each pattern and use the right accessor.

**You will see this again in:** Every web API response you ever parse — HTML attributes (`<input type="text" value="hello">`), SVG attributes (`<circle cx="100" cy="100" r="20">`), RSS feeds, Android layout XML, Spring configuration XML. The attribute-vs-child distinction is fundamental to XML everywhere.

**Career signal:** When working with any XML-based format (SOAP APIs, Office Open XML, Xcode project files, SVG), the first question is always "is this value in an attribute or a child?" Reading an attribute with `find()` instead of `get()` is one of the most common XML bugs.

**Watch for:** `element.attrib['id']` raises `KeyError` if the attribute is missing. `element.get('id')` returns `None`. In XML from external systems, attributes that "should always be there" sometimes aren't. Always use `.get()`.

---

## Step 1 — Create a Sample Operation Sheet

If you have a real Mastercam XML file, use it. If not, create a sample that mirrors the structure:

```python
# Create sample_operations.xml — run this once, then delete the script
SAMPLE_XML = """\
<?xml version="1.0" encoding="utf-8"?>
<MastercamDocument version="2023">
    <ToolList>
        <Tool id="1" diameter="0.5" type="endmill">
            <Name>1/2 FLAT ENDMILL</Name>
            <Params flutes="4" corner_radius="0.0" />
        </Tool>
        <Tool id="2" diameter="0.25" type="drill">
            <Name>1/4 DRILL</Name>
            <Params point_angle="118.0" />
        </Tool>
        <Tool id="3" diameter="1.0" type="facemill">
            <Name>1 FACE MILL</Name>
            <Params num_inserts="5" />
        </Tool>
    </ToolList>
    <Operations>
        <Operation name="POCKET-1" tool_id="1">
            <CuttingParams sfm="600" feed_per_tooth="0.003" depth="0.5" />
        </Operation>
        <Operation name="POCKET-2" tool_id="1">
            <CuttingParams sfm="600" feed_per_tooth="0.003" depth="0.75" />
        </Operation>
        <Operation name="DRILL-1" tool_id="2">
            <CuttingParams sfm="80" feed_per_rev="0.005" depth="1.0" />
        </Operation>
        <Operation name="DRILL-2" tool_id="2">
            <CuttingParams sfm="80" feed_per_rev="0.005" depth="0.5" />
        </Operation>
        <Operation name="FACE-1" tool_id="3">
            <CuttingParams sfm="900" feed_per_tooth="0.006" depth="0.1" />
        </Operation>
    </Operations>
</MastercamDocument>
"""

with open("sample_operations.xml", "w") as f:
    f.write(SAMPLE_XML)
print("Created sample_operations.xml")
```

Run this. Then open `sample_operations.xml` in a text editor and study the structure before writing any parsing code. Notice:

- `<Tool id="1" diameter="0.5" type="endmill">` — `id`, `diameter`, and `type` are **attributes**
- `<Name>1/2 FLAT ENDMILL</Name>` — name is **child text**
- `<Params flutes="4" corner_radius="0.0" />` — params are **attributes** on a self-closing child
- `<Operation name="POCKET-1" tool_id="1">` — both name and tool reference are **attributes**

This is the mixed-pattern XML that Lab 31's code could not handle as-is.

---

## Concept: The `.//` Descendant Selector

**What it is:** An XPath prefix that tells `findall()` to search the entire subtree for matching elements, not just direct children.

**The problem before:** In Lab 31, your XML had a flat structure:

```xml
<tools>
    <tool>...</tool>
    <tool>...</tool>
</tools>
```

`root.findall('tool')` worked because `<tool>` was a direct child of `<tools>`. In Mastercam's XML, `<Tool>` is a direct child of `<ToolList>`, which is a child of `<MastercamDocument>`:

```xml
<MastercamDocument>
    <ToolList>
        <Tool id="1">...</Tool>   ← not a direct child of the root
    </ToolList>
</MastercamDocument>
```

If you call `root.findall('Tool')`, you get `[]` — zero results. `root` is `<MastercamDocument>`, and `<Tool>` is not a direct child of it.

**The solution:** `root.findall('.//Tool')` searches all descendants regardless of depth. The `.//' prefix means "from here, search anywhere in the subtree."

**Smallest possible example:**

```python
import xml.etree.ElementTree as ET

xml = """
<root>
    <outer>
        <inner id="1" />
        <inner id="2" />
    </outer>
</root>"""

root = ET.fromstring(xml)

direct   = root.findall('inner')    # → [] (inner is not a direct child of root)
anywhere = root.findall('.//inner') # → [Element 'inner', Element 'inner']

print(len(direct))    # 0
print(len(anywhere))  # 2
```

Run this before moving on. The zero vs two result is the concrete proof of why `.//' matters.

**What it hides:** The `.//` prefix hides the tree traversal — the recursive walk through every level of nesting to collect matching elements. Without it, you would have to write `root.find('outer').findall('inner')` — which breaks the moment `<inner>` moves to a different nesting level.

**The protected invariant:** When you use `findall('.//Tool')`, you always get all `<Tool>` elements regardless of where in the tree they appear. Mastercam's XML structure can change between versions — `<ToolList>` might be renamed or moved — and `.//Tool` still finds the tools.

**You will see this again in:** Every XML with multiple nesting levels — HTML parsed with ElementTree, SOAP API responses, Android resource XML, Maven POM files. Any time you are "searching for all X" rather than "getting the direct children named X," you need `.//`.

**Watch for:** `findall('.//Tool')` is case-sensitive. If the XML uses `<tool>` (lowercase) and you search for `.//Tool` (capital T), you get zero results. Always verify the exact element names from the raw XML file.

### SAVE AND TRY

Run this in a Python REPL or short script:

```python
import xml.etree.ElementTree as ET

root = ET.fromstring("""
<root>
    <outer>
        <inner id="1" />
        <inner id="2" />
    </outer>
</root>""")

print("Direct children:", len(root.findall('inner')))     # ← add this
print("All descendants:", len(root.findall('.//inner')))  # ← add this
```

**You should see:**
```
Direct children: 0
All descendants: 2
```

**In the terminal, also try:**

```python
# Check what direct children the root DOES have:
for child in root:
    print(child.tag)
# Expected: outer
```

**Change something:** Change `.//inner` to `.//outer` in `findall`. Expected: `1`. Change it back.

---

## Step 2 — Open and Navigate the Operation Sheet

Create `tooldb/parsers/mastercam_xml_parser.py`:

```python
import xml.etree.ElementTree as ET


def load_operation_sheet(xml_path: str) -> ET.Element:
    """Returns the root element of the XML document."""
    tree = ET.parse(xml_path)   # parse() reads from a file path
    return tree.getroot()       # getroot() returns the root Element
```

`ET.parse()` is different from `ET.fromstring()` in Lab 31 — `parse()` reads from a file path, `fromstring()` reads from a string already in memory. Both return an object you can call `getroot()` on.

Add a simple exploration function to see the top-level structure:

```python
def describe_structure(root: ET.Element) -> None:
    """Print the tag name and attribute count of each direct child."""
    print(f"Root: <{root.tag}>")
    for child in root:                           # iterates direct children only
        attr_count = len(child.attrib)           # .attrib is a dict of all attributes
        child_count = len(list(child))           # len(list(element)) counts child elements
        print(f"  <{child.tag}> — {attr_count} attr(s), {child_count} child element(s)")
```

### SAVE AND TRY

```python
from tooldb.parsers.mastercam_xml_parser import load_operation_sheet, describe_structure

root = load_operation_sheet("sample_operations.xml")
describe_structure(root)
```

**You should see:**
```
Root: <MastercamDocument>
  <ToolList> — 0 attr(s), 3 child element(s)
  <Operations> — 0 attr(s), 5 child element(s)
```

This tells you the document has two top-level sections and gives you the count before reading any data. The count check is the same technique from Lab 53 — orient yourself before diving in.

**Change something:** Call `describe_structure` on `root.find('ToolList')` instead of `root`. You should see three `<Tool>` entries. Change it back.

---

## Step 3 — Extract Tools

```python
def extract_tools(root: ET.Element) -> list[dict]:
    """
    Returns a list of dicts, one per <Tool> element.
    Handles the mixed attribute/child-text pattern.
    """
    tools = []

    for tool_elem in root.findall('.//Tool'):  # search all descendants
        tool_id   = tool_elem.get('id')         # attribute → .get()
        diameter  = tool_elem.get('diameter')   # attribute → .get()
        tool_type = tool_elem.get('type')       # attribute → .get()

        # Name lives as child text — different pattern than the attributes above
        name_elem = tool_elem.find('Name')
        name = name_elem.text if name_elem is not None else None  # guard against missing tag
```

Pause here. The guard `if name_elem is not None` is the same defensive pattern you used in Lab 31 with `safe_text`. Without it, `name_elem.text` raises `AttributeError` when `<Name>` is missing. For external XML, the tag you expect to be there sometimes isn't.

Continue:

```python
        # Params are attributes on a <Params> child — a third pattern
        params_elem = tool_elem.find('Params')
        params = params_elem.attrib if params_elem is not None else {}
        # .attrib is the full attribute dict — safe to read when you want all params at once

        if tool_id and name and diameter:        # skip tools missing required fields
            tools.append({
                "id":        tool_id,
                "name":      name,
                "diameter":  float(diameter),    # XML attributes are always strings — convert
                "tool_type": tool_type,
                "params":    params,
            })

    return tools
```

`float(diameter)` converts the string `"0.5"` to the number `0.5`. All XML attribute values and all `element.text` values are strings — there are no typed XML values in Python's ElementTree. Every numeric value must be explicitly converted.

### SAVE AND TRY

```python
tools = extract_tools(root)
for tool in tools:
    print(f"Tool #{tool['id']}: {tool['name']} (diameter={tool['diameter']})")
    print(f"  params: {tool['params']}")
```

**You should see:**
```
Tool #1: 1/2 FLAT ENDMILL (diameter=0.5)
  params: {'flutes': '4', 'corner_radius': '0.0'}
Tool #2: 1/4 DRILL (diameter=0.25)
  params: {'point_angle': '118.0'}
Tool #3: 1 FACE MILL (diameter=1.0)
  params: {'num_inserts': '5'}
```

**In the terminal, also try:**

```python
# Confirm params are still strings, not numbers:
print(type(tools[0]['params']['flutes']))  # → <class 'str'>
```

This is the reminder that XML gives you strings. Every `params` value you use as a number needs `float()` or `int()` before arithmetic.

**Change something:** Remove the guard `if name_elem is not None` — change `name = name_elem.text if name_elem is not None else None` to `name = tool_elem.find('Name').text`. Then add a `<Tool id="4" diameter="0.375" type="endmill" />` to the XML (no `<Name>` child). Run again. You should see `AttributeError: 'NoneType' object has no attribute 'text'`. Add the guard back.

---

## Step 4 — Extract Operations

```python
def extract_operations(root: ET.Element) -> list[dict]:
    """Returns a list of dicts, one per <Operation> element."""
    operations = []

    for op_elem in root.findall('.//Operation'):
        op_name = op_elem.get('name')       # attribute
        tool_id = op_elem.get('tool_id')    # attribute — links to Tool.id

        # CuttingParams are on a child element's attributes
        cp_elem = op_elem.find('CuttingParams')
        cutting = cp_elem.attrib if cp_elem is not None else {}

        if op_name and tool_id:
            operations.append({
                "name":    op_name,
                "tool_id": tool_id,          # string — matches Tool's id string
                "cutting": cutting,
            })

    return operations
```

### SAVE AND TRY

```python
operations = extract_operations(root)
for op in operations:
    print(f"{op['name']:12} → Tool #{op['tool_id']}  cutting={op['cutting']}")
```

**You should see:**
```
POCKET-1     → Tool #1  cutting={'sfm': '600', 'feed_per_tooth': '0.003', 'depth': '0.5'}
POCKET-2     → Tool #1  cutting={'sfm': '600', 'feed_per_tooth': '0.003', 'depth': '0.75'}
DRILL-1      → Tool #2  cutting={'sfm': '80', 'feed_per_rev': '0.005', 'depth': '1.0'}
DRILL-2      → Tool #2  cutting={'sfm': '80', 'feed_per_rev': '0.005', 'depth': '0.5'}
FACE-1       → Tool #3  cutting={'sfm': '900', 'feed_per_tooth': '0.006', 'depth': '0.1'}
```

**Change something:** Change `.findall('.//Operation')` to `.findall('Operation')`. Expected: `[]` (zero operations) — because `<Operation>` is inside `<Operations>`, not a direct child of `root`. Change it back.

---

## Step 5 — The Summary Script

Now connect both functions into the end-to-end script you saw in "What You Will Build":

```python
def summarize_operation_sheet(xml_path: str) -> None:
    root     = load_operation_sheet(xml_path)  # ← already written in Step 2
    tools    = extract_tools(root)             # ← already written in Step 3
    ops      = extract_operations(root)        # ← already written in Step 4

    print(f"=== Mastercam Operation Sheet ===")
    print(f"Found {len(tools)} tool(s), {len(ops)} operation(s)\n")

    print("TOOLS:")
    for tool in tools:
        print(f"  Tool #{tool['id']} — {tool['name']} (diameter={tool['diameter']})")

    print("\nOPERATIONS:")
    for op in ops:
        print(f"  {op['name']:<12} → Tool #{op['tool_id']}")
```

### SAVE AND TRY

```python
from tooldb.parsers.mastercam_xml_parser import summarize_operation_sheet
summarize_operation_sheet("sample_operations.xml")
```

**You should see** the exact output shown in "What You Will Build" at the top of this lab. If your output matches, the lab is complete.

**What if it breaks?** The most common failure is a `FileNotFoundError` — verify `sample_operations.xml` is in the current working directory. Run `import os; print(os.getcwd())` to check.

---

## 🎯 Challenge: Count Operations Per Tool

**You know:** `extract_tools()` and `extract_operations()` return lists of dicts. The `tool_id` in each operation matches the `id` in each tool.

**Task:** Write a function `ops_per_tool(tools, operations) -> dict` that returns a dict mapping each tool name to the number of operations that use it.

For the sample data, the result should be:
```python
{"1/2 FLAT ENDMILL": 2, "1/4 DRILL": 2, "1 FACE MILL": 1}
```

**Starting code:**

```python
tools      = extract_tools(root)
operations = extract_operations(root)

def ops_per_tool(tools: list[dict], operations: list[dict]) -> dict:
    # Build a lookup: id → name
    # Count operations per id
    # Return name → count
    ...
```

**Hint:** Build a `{id: name}` dict from `tools` first, then loop over `operations` and use it.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def ops_per_tool(tools: list[dict], operations: list[dict]) -> dict:
    # Step 1: build a lookup from tool id to tool name
    id_to_name = {tool['id']: tool['name'] for tool in tools}
    # {"1": "1/2 FLAT ENDMILL", "2": "1/4 DRILL", "3": "1 FACE MILL"}

    # Step 2: count operations per tool id
    counts: dict[str, int] = {}
    for op in operations:
        tool_id = op['tool_id']
        counts[tool_id] = counts.get(tool_id, 0) + 1
    # {"1": 2, "2": 2, "3": 1}

    # Step 3: translate ids back to names
    return {id_to_name[tid]: count for tid, count in counts.items()
            if tid in id_to_name}
```

**Key insight:** This is a join between two lists — the same logical operation as a SQL JOIN, done in Python with a dict as the lookup table. The `id_to_name` dict is your in-memory index. In the next lab you will do this join against the real database instead of an in-memory list — and the structure is identical.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `describe_structure(root)` prints two children: `<ToolList>` and `<Operations>` | Run and check output |
| `extract_tools(root)` returns 3 tools with correct names and diameters | `len(tools) == 3`; `tools[0]['name'] == "1/2 FLAT ENDMILL"` |
| `extract_tools` reads `id`/`diameter`/`type` via `.get()`, not `.find()` | Check code — no `find('id')` calls |
| `extract_operations(root)` returns 5 operations | `len(ops) == 5` |
| `findall('.//Tool')` vs `findall('Tool')` produce different counts | Change and observe in SAVE AND TRY |
| `summarize_operation_sheet` output matches "What You Will Build" | Run and compare |

---

## Quick Check Answers

**1. What happens when `element.find('diameter')` returns `None` and you access `.text`?**
Python raises `AttributeError: 'NoneType' object has no attribute 'text'`. `find()` returns `None` when no matching child exists — it does not raise. The crash happens one line later when you try to access `.text` on `None`. This is the exact failure mode `safe_text` from Lab 31 was designed to prevent. The guard `if name_elem is not None` (Step 3) prevents the same crash here.

**2. `element.get('id')` vs `element.attrib['id']` when the attribute is missing:**
`element.get('id')` returns `None` — the same safe-default behavior as `dict.get()`. `element.attrib['id']` raises `KeyError`. For external XML where attributes may be missing in some versions, always use `.get()`. The `attrib` dict is appropriate when you want the full set of attributes at once (like `params_elem.attrib` in Step 3), not when you are reading a specific expected attribute.

**3. `findall('tool')` vs `findall('.//tool')` when tools are nested:**
`findall('tool')` only searches direct children of the element you call it on. If `<tool>` is two levels deep, `findall('tool')` returns `[]`. `findall('.//tool')` searches the entire subtree — all descendants at any depth. In the SAVE AND TRY, removing `.//' from `findall('.//Operation')` produced zero results because `<Operation>` is a child of `<Operations>`, not of the root.
