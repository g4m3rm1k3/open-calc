# Python Tool Database — LAB 31 — XML Validation: Parse What You Can, Report What You Cannot

**Prerequisites:** Lab 30. You have `ImportReport`, `batch_import_tools`, and `ValidationResult`. You understand collect-all validation. Now you extend it to a new data source: XML files, where the parsing itself can fail in two distinct ways.

**What this lab adds:**
- Python's `xml.etree.ElementTree` for XML parsing
- Two failure modes: structural (malformed XML) vs semantic (wrong data in valid XML)
- Safe extraction helpers: `safe_text`, `safe_float`, `safe_int`
- Parsing without stopping: collecting per-element errors and continuing
- Feeding parsed records into the batch validator from Lesson 30

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. An XML file has 50 tool elements. Element 23 is missing its `<diameter>` tag. Should the other 49 elements fail to parse? Why?
> 2. `<diameter>half inch</diameter>` — the XML is structurally valid (the tag closes). What kind of failure is this?
> 3. `ElementTree.parse("tools.xml")` raises an exception. What kind of failure is this? Can you continue parsing after it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A set of safe extraction helpers and an XML parser that feeds into the batch importer:

```python
# tooldb/xml_parser.py (NEW)
def safe_text(element, tag: str, required: bool = True) -> tuple[str | None, str | None]: ...
def safe_float(element, tag: str, required: bool = True) -> tuple[float | None, str | None]: ...
def safe_int(element, tag: str, required: bool = True) -> tuple[int | None, str | None]: ...
def parse_tools_xml(xml_string: str) -> tuple[list[dict], list[str]]: ...
```

New files:
```
tooldb/
    xml_parser.py    ← NEW
tests/
    test_xml_parser.py    ← NEW
```

---

## Step 1 — XML Parsing: A Quick Overview

`xml.etree.ElementTree` is Python's built-in XML parser. It is not the fastest or most feature-rich, but it requires no installation and is sufficient for tool database files.

The data format we will parse:

```xml
<tools>
    <tool>
        <name>1/2 Carbide EM</name>
        <diameter unit="in">0.5</diameter>
        <material>carbide</material>
        <type>endmill</type>
        <flutes>4</flutes>
    </tool>
    <tool>
        <name>HSS Drill</name>
        <diameter unit="in">0.25</diameter>
        <material>HSS</material>
        <type>drill</type>
    </tool>
</tools>
```

Basic ElementTree usage:

```python
import xml.etree.ElementTree as ET

root = ET.fromstring(xml_string)   # parse a string — raises ParseError if malformed
# or
tree = ET.parse("tools.xml")       # parse a file — raises ParseError if malformed
root = tree.getroot()

for tool_element in root.findall("tool"):
    name_el = tool_element.find("name")
    if name_el is not None:
        name = name_el.text   # the text between <name> and </name>
```

`.find(tag)` returns the first matching child element, or `None` if not found. `.text` is the content between tags, or `None` if the element is empty.

---

## Step 2 — Two Failure Modes

### Structural failure: malformed XML

```xml
<tools>
    <tool>
        <name>Mill-01</name>
        <diameter>0.5
    </tool>
</tools>
```

The `<diameter>` tag is not closed. `ET.fromstring()` raises `ET.ParseError` immediately. There is no way to extract *anything* from this file — the parser cannot proceed.

The right response: catch `ET.ParseError`, add a fatal error to the report, return 0 records.

### Semantic failure: valid XML, bad data

```xml
<tools>
    <tool>
        <name>Mill-01</name>
        <diameter>half inch</diameter>   ← "half inch" is not a float
        <material>carbide</material>
        <type>endmill</type>
    </tool>
</tools>
```

The XML structure is fine. But converting `"half inch"` to `float` will raise `ValueError`. This is a per-element failure. The other elements in the file are unaffected.

The right response: wrap each element's data extraction in `try/except`, record the error with context ("tool named 'Mill-01', field 'diameter'"), continue to the next element.

---

## Step 3 — RED: Tests for Safe Extraction Helpers

Create `tests/test_xml_parser.py`:

```python
import xml.etree.ElementTree as ET
from tooldb.xml_parser import safe_text, safe_float, safe_int


def _tool_el(xml: str):
    return ET.fromstring(f"<tool>{xml}</tool>")


class TestSafeText:
    def test_returns_text_when_tag_present(self):
        el = _tool_el("<name>Mill-01</name>")
        value, error = safe_text(el, "name")
        assert value == "Mill-01"
        assert error is None

    def test_returns_error_when_required_tag_missing(self):
        el = _tool_el("")
        value, error = safe_text(el, "name", required=True)
        assert value is None
        assert "name" in error

    def test_returns_none_without_error_when_optional_tag_missing(self):
        el = _tool_el("")
        value, error = safe_text(el, "notes", required=False)
        assert value is None
        assert error is None

    def test_strips_whitespace_from_value(self):
        el = _tool_el("<name>  Mill-01  </name>")
        value, error = safe_text(el, "name")
        assert value == "Mill-01"


class TestSafeFloat:
    def test_returns_float_when_valid(self):
        el = _tool_el("<diameter>0.5</diameter>")
        value, error = safe_float(el, "diameter")
        assert value == 0.5
        assert error is None

    def test_returns_error_when_not_numeric(self):
        el = _tool_el("<diameter>half inch</diameter>")
        value, error = safe_float(el, "diameter")
        assert value is None
        assert "diameter" in error
        assert "half inch" in error

    def test_returns_error_when_required_tag_missing(self):
        el = _tool_el("")
        value, error = safe_float(el, "diameter", required=True)
        assert value is None
        assert error is not None


class TestSafeInt:
    def test_returns_int_when_valid(self):
        el = _tool_el("<flutes>4</flutes>")
        value, error = safe_int(el, "flutes")
        assert value == 4
        assert error is None

    def test_returns_error_when_not_an_integer(self):
        el = _tool_el("<flutes>four</flutes>")
        value, error = safe_int(el, "flutes")
        assert value is None
        assert "flutes" in error

    def test_returns_none_without_error_when_optional(self):
        el = _tool_el("")
        value, error = safe_int(el, "flutes", required=False)
        assert value is None
        assert error is None
```

Run — fails with `ModuleNotFoundError`. Red step.

---

## Step 4 — GREEN: Build the Safe Helpers

Create `tooldb/xml_parser.py`:

```python
import xml.etree.ElementTree as ET


def safe_text(element: ET.Element, tag: str, required: bool = True) -> tuple[str | None, str | None]:
    child = element.find(tag)
    if child is None or child.text is None:
        if required:
            return None, f"missing required tag <{tag}>"
        return None, None
    return child.text.strip(), None


def safe_float(element: ET.Element, tag: str, required: bool = True) -> tuple[float | None, str | None]:
    child = element.find(tag)
    if child is None or child.text is None:
        if required:
            return None, f"missing required tag <{tag}>"
        return None, None
    raw = child.text.strip()
    try:
        return float(raw), None
    except ValueError:
        return None, f"<{tag}> expected a number, got '{raw}'"


def safe_int(element: ET.Element, tag: str, required: bool = True) -> tuple[int | None, str | None]:
    child = element.find(tag)
    if child is None or child.text is None:
        if required:
            return None, f"missing required tag <{tag}>"
        return None, None
    raw = child.text.strip()
    try:
        return int(raw), None
    except ValueError:
        return None, f"<{tag}> expected an integer, got '{raw}'"
```

Run the helper tests — all pass.

---

## Step 5 — RED: Tests for `parse_tools_xml`

Add to `tests/test_xml_parser.py`:

```python
from tooldb.xml_parser import parse_tools_xml

VALID_XML = """
<tools>
    <tool>
        <name>1/2 Carbide EM</name>
        <diameter>0.5</diameter>
        <material>carbide</material>
        <type>endmill</type>
        <flutes>4</flutes>
    </tool>
    <tool>
        <name>HSS Drill</name>
        <diameter>0.25</diameter>
        <material>HSS</material>
        <type>drill</type>
    </tool>
</tools>
"""

BAD_DIAMETER_XML = """
<tools>
    <tool>
        <name>Good Mill</name>
        <diameter>0.5</diameter>
        <material>carbide</material>
        <type>endmill</type>
    </tool>
    <tool>
        <name>Bad Tool</name>
        <diameter>half inch</diameter>
        <material>carbide</material>
        <type>endmill</type>
    </tool>
</tools>
"""

MALFORMED_XML = "<tools><tool><name>Mill</name>"


class TestParseToolsXml:
    def test_parses_all_valid_tools(self):
        records, errors = parse_tools_xml(VALID_XML)
        assert len(records) == 2
        assert errors == []

    def test_parsed_record_has_expected_keys(self):
        records, _ = parse_tools_xml(VALID_XML)
        tool = records[0]
        assert tool["name"] == "1/2 Carbide EM"
        assert tool["diameter_inches"] == 0.5
        assert tool["material"] == "carbide"
        assert tool["tool_type"] == "endmill"
        assert tool["flutes"] == 4

    def test_optional_flutes_defaults_to_none(self):
        records, _ = parse_tools_xml(VALID_XML)
        drill = records[1]
        assert drill["flutes"] is None

    def test_bad_diameter_records_error_not_all_records(self):
        records, errors = parse_tools_xml(BAD_DIAMETER_XML)
        assert len(records) == 1   # only the good tool
        assert len(errors) == 1    # the bad tool's error
        assert "half inch" in errors[0]

    def test_malformed_xml_returns_fatal_error(self):
        records, errors = parse_tools_xml(MALFORMED_XML)
        assert records == []
        assert len(errors) == 1
        assert "malformed" in errors[0].lower() or "parse" in errors[0].lower()

    def test_error_includes_tool_identifier(self):
        records, errors = parse_tools_xml(BAD_DIAMETER_XML)
        assert "Bad Tool" in errors[0] or "tool 2" in errors[0].lower()
```

Run — fails with `AttributeError: module 'tooldb.xml_parser' has no attribute 'parse_tools_xml'`. Red step.

---

## Step 6 — GREEN: Build `parse_tools_xml`

Add to `tooldb/xml_parser.py`:

```python
def parse_tools_xml(xml_string: str) -> tuple[list[dict], list[str]]:
    try:
        root = ET.fromstring(xml_string)
    except ET.ParseError as exc:
        return [], [f"Malformed XML: {exc}"]

    records = []
    errors = []

    for index, tool_el in enumerate(root.findall("tool")):
        # Get an identifier for error messages
        name_child = tool_el.find("name")
        identifier = name_child.text.strip() if (name_child is not None and name_child.text) else f"tool {index + 1}"

        record_errors = []

        name, err = safe_text(tool_el, "name", required=True)
        if err:
            record_errors.append(f"'{identifier}' — name: {err}")

        diameter, err = safe_float(tool_el, "diameter", required=True)
        if err:
            record_errors.append(f"'{identifier}' — diameter: {err}")

        material, err = safe_text(tool_el, "material", required=True)
        if err:
            record_errors.append(f"'{identifier}' — material: {err}")

        tool_type, err = safe_text(tool_el, "type", required=True)
        if err:
            record_errors.append(f"'{identifier}' — type: {err}")

        flutes, err = safe_int(tool_el, "flutes", required=False)
        if err:
            record_errors.append(f"'{identifier}' — flutes: {err}")

        if record_errors:
            errors.extend(record_errors)
        else:
            records.append({
                "name": name,
                "diameter_inches": diameter,
                "material": material,
                "tool_type": tool_type,
                "flutes": flutes,
            })

    return records, errors
```

Run the tests:

```
pytest tests/test_xml_parser.py -v
```

---

## Step 7 — REFACTOR: Connect XML Parser to Batch Importer

The `parse_tools_xml` function returns `(records, parse_errors)`. The records can then go into `batch_import_tools`:

```python
# Example usage — not a new test, just showing the pipeline:
from tooldb.xml_parser import parse_tools_xml
from tooldb.validation import batch_import_tools

def import_from_xml(xml_string: str, service) -> dict:
    records, parse_errors = parse_tools_xml(xml_string)

    if not records and parse_errors:
        # Total failure — XML was malformed
        return {
            "total": 0,
            "imported": 0,
            "parse_errors": parse_errors,
            "import_errors": [],
        }

    report = batch_import_tools(records, service)

    return {
        "total": report.total + len(parse_errors),
        "imported": report.imported,
        "parse_errors": parse_errors,
        "import_errors": report.error_lines(),
    }
```

Two levels of errors:
1. **Parse errors** — problems extracting data from XML (missing tags, wrong types, malformed XML)
2. **Import errors** — problems storing valid records (duplicate names, constraint violations)

The user's summary shows both: "Parsed 48 of 50 tools (2 parse errors). Imported 47 of 48 (1 duplicate name)."

---

## Step 8 — SAVE AND TRY

```
pytest -v
```

Then test the XML parser manually:

```python
python -c "
from tooldb.xml_parser import parse_tools_xml

xml = '''
<tools>
    <tool><name>Mill-01</name><diameter>0.5</diameter><material>carbide</material><type>endmill</type></tool>
    <tool><name>Bad</name><diameter>half inch</diameter><material>carbide</material><type>endmill</type></tool>
</tools>
'''

records, errors = parse_tools_xml(xml)
print(f'Records: {len(records)}')
print(f'Errors: {len(errors)}')
for e in errors:
    print(f'  {e}')
"
```

Expected:
```
Records: 1
Errors: 1
  'Bad' — diameter: <diameter> expected a number, got 'half inch'
```

---

## Challenge

Mastercam's XML format sometimes stores diameter as an attribute instead of a child tag:

```xml
<tool diameter="0.5">
    <name>Mill-01</name>
    <material>carbide</material>
    <type>endmill</type>
</tool>
```

Add a `safe_float_attr` helper that reads from an XML attribute instead of a child tag, and update `parse_tools_xml` to try the child tag first, then the attribute:

```python
def safe_float_attr(element: ET.Element, attr: str, required: bool = True) -> tuple[float | None, str | None]:
    ...
```

Write the tests first.

<details>
<summary>Answer</summary>

**Test:**
```python
def test_safe_float_attr_reads_from_attribute():
    el = ET.fromstring('<tool diameter="0.5"><name>Mill</name></tool>')
    value, error = safe_float_attr(el, "diameter")
    assert value == 0.5
    assert error is None


def test_safe_float_attr_returns_error_for_bad_value():
    el = ET.fromstring('<tool diameter="half"><name>Mill</name></tool>')
    value, error = safe_float_attr(el, "diameter")
    assert value is None
    assert "diameter" in error
    assert "half" in error
```

**Implementation:**
```python
def safe_float_attr(element: ET.Element, attr: str, required: bool = True) -> tuple[float | None, str | None]:
    raw = element.get(attr)  # .get() reads an XML attribute
    if raw is None:
        if required:
            return None, f"missing required attribute '{attr}'"
        return None, None
    try:
        return float(raw), None
    except ValueError:
        return None, f"attribute '{attr}' expected a number, got '{raw}'"
```

**Updated `parse_tools_xml` diameter extraction:**
```python
# Try child tag first, fall back to attribute
diameter, err = safe_float(tool_el, "diameter", required=False)
if diameter is None and err is None:
    diameter, err = safe_float_attr(tool_el, "diameter", required=True)
```

This pattern — try one format, fall back to another — handles both Mastercam XML variants without breaking either.

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Explain the two failure modes of XML parsing | |
| Use `ET.fromstring` and `ET.ParseError` | |
| Use `.find(tag)` and `.text` to extract data from an element | |
| Build `safe_text`, `safe_float`, `safe_int` helpers with consistent return types | |
| Write `parse_tools_xml` that continues past per-element errors | |
| Connect the XML parser to `batch_import_tools` | |
| Produce error messages that include which tool caused the problem | |

---

## Quick Check Answers

1. **No — the other 49 elements should parse successfully.** Element 23 has a missing tag, which is a per-element semantic failure. The other elements are unaffected. The parser should record an error for element 23 and continue. Stopping the entire parse because of one bad element is the "fail fast" anti-pattern applied to parsing.

2. **This is a semantic failure** — the XML is structurally valid (the `<diameter>` tag is properly opened and closed), but the content cannot be converted to a float. The parser can read the tag and its text; the problem is the *type* of the data, not the *structure* of the XML. You handle this with a `try/except ValueError` around the conversion, not a `try/except ParseError`.

3. **No — `ET.parse()` raises `ParseError` immediately and no element data can be extracted.** When the XML is structurally broken, there is nothing to recover from the parse. The right response is to catch the `ParseError`, add a fatal error to the result, and return 0 records. You cannot "continue parsing" past a structural error — the parser cannot determine where valid elements begin or end.
