# Tutorial 1: XML Parsing Basics

## Introduction

Mastercam exports manufacturing data as XML. This tutorial teaches XML parsing in Python using the built-in `xml.etree.ElementTree` library.

---

## Part 1: Why XML?

### 1.1 XML in Manufacturing

| Format | Use Case |
|--------|----------|
| **XML** | Mastercam exports, CAM data |
| JSON | Web APIs, config files |
| CSV | Simple tabular data |
| Binary | Compiled machine code |

Mastercam uses XML because:
- Self-describing structure
- Industry standard in CAM
- Human-readable (somewhat)
- Supports complex nested data

### 1.2 Sample Mastercam XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<MastercamDocument>
  <FileInfo>
    <FileName>WIDGET-001</FileName>
    <PostProcessor>HAAS_VF</PostProcessor>
    <MachineName>Haas VF-2</MachineName>
  </FileInfo>
  <Operations>
    <Operation seq="1">
      <Name>FACE MILL</Name>
      <Type>Mill</Type>
      <Tool>
        <Number>1</Number>
        <Description>2" Face Mill</Description>
        <Diameter>2.0</Diameter>
      </Tool>
      <Parameters>
        <SpindleSpeed>3000</SpindleSpeed>
        <FeedRate>20.0</FeedRate>
        <DepthOfCut>0.050</DepthOfCut>
      </Parameters>
    </Operation>
    <Operation seq="2">
      <Name>DRILL 0.250</Name>
      <Type>Drill</Type>
      <Tool>
        <Number>5</Number>
        <Description>1/4" Drill</Description>
        <Diameter>0.25</Diameter>
      </Tool>
    </Operation>
  </Operations>
</MastercamDocument>
```

---

## Part 2: ElementTree Basics

### 2.1 Parsing XML

```python
import xml.etree.ElementTree as ET

# Parse from string
xml_string = """<root><item>Hello</item></root>"""
root = ET.fromstring(xml_string)

# Parse from file
tree = ET.parse('file.xml')
root = tree.getroot()
```

### 2.2 Navigating Elements

```python
# Get element tag name
print(root.tag)  # 'MastercamDocument'

# Get element text
filename = root.find('FileInfo/FileName')
print(filename.text)  # 'WIDGET-001'

# Get all child elements
for child in root:
    print(child.tag)

# Find all matching elements
operations = root.findall('.//Operation')
for op in operations:
    print(op.find('Name').text)
```

### 2.3 Attributes

```python
# Access attribute
op = root.find('.//Operation')
seq = op.get('seq')  # '1'

# With default
seq = op.get('seq', '0')  # Returns '0' if not found
```

---

## Part 3: Safe Parsing

### 3.1 Handling Missing Elements

```python
def safe_find_text(element: ET.Element, path: str, default: str = '') -> str:
    """Safely get text from element, returning default if not found."""
    found = element.find(path)
    if found is not None and found.text:
        return found.text.strip()
    return default


# Usage
name = safe_find_text(operation, 'Name', 'Unknown')
```

### 3.2 Type Conversion

```python
def safe_find_int(element: ET.Element, path: str, default: int = 0) -> int:
    """Safely get integer from element."""
    text = safe_find_text(element, path)
    if text:
        try:
            return int(text)
        except ValueError:
            pass
    return default


def safe_find_float(element: ET.Element, path: str, default: float = 0.0) -> float:
    """Safely get float from element."""
    text = safe_find_text(element, path)
    if text:
        try:
            return float(text)
        except ValueError:
            pass
    return default
```

---

## Part 4: XML Parsing Utilities

Create `src/partflow/utils/xml_utils.py`:

```python
"""XML parsing utilities for CAM files."""

import xml.etree.ElementTree as ET
from typing import List, Optional, TypeVar
from pathlib import Path


class XMLParseError(Exception):
    """Error parsing XML file."""
    pass


def parse_xml_file(file_path: Path) -> ET.Element:
    """Parse XML file and return root element.
    
    Args:
        file_path: Path to XML file
    
    Returns:
        Root Element
    
    Raises:
        XMLParseError: If file cannot be parsed
    """
    try:
        tree = ET.parse(file_path)
        return tree.getroot()
    except ET.ParseError as e:
        raise XMLParseError(f"Invalid XML: {e}")
    except FileNotFoundError:
        raise XMLParseError(f"File not found: {file_path}")


def parse_xml_string(xml_string: str) -> ET.Element:
    """Parse XML string and return root element."""
    try:
        return ET.fromstring(xml_string)
    except ET.ParseError as e:
        raise XMLParseError(f"Invalid XML: {e}")


def find_text(
    element: ET.Element, 
    path: str, 
    default: Optional[str] = None,
) -> Optional[str]:
    """Find element and return text content.
    
    Args:
        element: Parent element to search in
        path: XPath-like path to element
        default: Default if not found
    
    Returns:
        Text content or default
    """
    found = element.find(path)
    if found is not None and found.text:
        return found.text.strip()
    return default


def find_int(element: ET.Element, path: str, default: int = 0) -> int:
    """Find element and return integer value."""
    text = find_text(element, path)
    if text:
        try:
            return int(float(text))  # Handle "5.0" as 5
        except (ValueError, TypeError):
            pass
    return default


def find_float(element: ET.Element, path: str, default: float = 0.0) -> float:
    """Find element and return float value."""
    text = find_text(element, path)
    if text:
        try:
            return float(text)
        except (ValueError, TypeError):
            pass
    return default


def find_all(element: ET.Element, path: str) -> List[ET.Element]:
    """Find all matching elements."""
    return element.findall(path)


def get_attr(element: ET.Element, name: str, default: str = '') -> str:
    """Get attribute value with default."""
    return element.get(name, default)
```

---

## Part 5: Tests

```python
"""Tests for XML utilities."""

import pytest
import xml.etree.ElementTree as ET
from partflow.utils.xml_utils import (
    parse_xml_string, find_text, find_int, find_float,
    XMLParseError,
)


class TestXMLParsing:
    
    def test_parse_valid_xml(self):
        xml = "<root><item>Hello</item></root>"
        root = parse_xml_string(xml)
        assert root.tag == 'root'
    
    def test_parse_invalid_xml_raises(self):
        xml = "<root><item>Unclosed"
        with pytest.raises(XMLParseError):
            parse_xml_string(xml)


class TestFindText:
    
    def test_find_existing_element(self):
        xml = "<root><item>Value</item></root>"
        root = parse_xml_string(xml)
        assert find_text(root, 'item') == 'Value'
    
    def test_find_missing_returns_default(self):
        xml = "<root></root>"
        root = parse_xml_string(xml)
        assert find_text(root, 'missing', 'default') == 'default'
    
    def test_find_empty_returns_default(self):
        xml = "<root><item></item></root>"
        root = parse_xml_string(xml)
        assert find_text(root, 'item', 'default') == 'default'


class TestFindNumbers:
    
    def test_find_int(self):
        xml = "<root><count>42</count></root>"
        root = parse_xml_string(xml)
        assert find_int(root, 'count') == 42
    
    def test_find_float(self):
        xml = "<root><value>3.14</value></root>"
        root = parse_xml_string(xml)
        assert find_float(root, 'value') == pytest.approx(3.14)
    
    def test_invalid_int_returns_default(self):
        xml = "<root><count>abc</count></root>"
        root = parse_xml_string(xml)
        assert find_int(root, 'count', 99) == 99
```

---

## Summary

### Key Functions

| Function | Purpose |
|----------|---------|
| `parse_xml_file` | Parse from file |
| `parse_xml_string` | Parse from string |
| `find_text` | Get text safely |
| `find_int` | Get integer safely |
| `find_float` | Get float safely |

---

## Next Tutorial

[Tutorial 2: CAM File Structure →](./02-cam-structure.md)
