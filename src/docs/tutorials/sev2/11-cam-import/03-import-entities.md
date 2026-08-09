# Tutorial 3: Import Parser

## Introduction

This tutorial implements the CAM XML parser that converts XML to domain objects.

---

## Part 1: Parser Design

### 1.1 Parser Responsibilities

| Task | Output |
|------|--------|
| Parse XML | Element tree |
| Extract file info | CAMFileInfo |
| Extract operations | List[CAMOperation] |
| Build document | CAMDocument |
| Report errors | List[ParseError] |

### 1.2 Error Handling Strategy

```python
@dataclass
class ParseError:
    """Error encountered during parsing."""
    location: str       # Where in XML (e.g., "Operation[1]")
    field: str          # What field
    message: str        # What went wrong
    severity: str       # 'error' or 'warning'
```

Errors are **collected, not thrown**. The parser returns a result with both data and errors.

---

## Part 2: Parser Implementation

Create `src/partflow/import_/cam_parser.py`:

```python
"""CAM XML parser for Mastercam files."""

import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

from partflow.domain.cam import (
    CAMDocument, CAMFileInfo, CAMTool, 
    CAMOperation, CAMOperationParameters,
)
from partflow.utils.xml_utils import (
    parse_xml_file, parse_xml_string,
    find_text, find_int, find_float, find_all, get_attr,
    XMLParseError,
)


@dataclass
class ParseError:
    """Error during CAM file parsing."""
    location: str
    field: str
    message: str
    severity: str = "error"  # 'error' or 'warning'
    
    def __str__(self):
        return f"[{self.severity.upper()}] {self.location}.{self.field}: {self.message}"


@dataclass
class ParseResult:
    """Result of parsing a CAM file."""
    document: Optional[CAMDocument] = None
    errors: List[ParseError] = field(default_factory=list)
    warnings: List[ParseError] = field(default_factory=list)
    
    @property
    def success(self) -> bool:
        """True if parsing succeeded (document exists, no errors)."""
        return self.document is not None and len(self.errors) == 0
    
    @property
    def has_warnings(self) -> bool:
        return len(self.warnings) > 0


class CAMParser:
    """Parser for Mastercam XML files."""
    
    def parse_file(self, file_path: Path) -> ParseResult:
        """Parse CAM file from path."""
        errors = []
        
        try:
            root = parse_xml_file(file_path)
            return self._parse_document(root)
        except XMLParseError as e:
            errors.append(ParseError("File", "xml", str(e)))
            return ParseResult(errors=errors)
    
    def parse_string(self, xml_string: str) -> ParseResult:
        """Parse CAM file from string."""
        errors = []
        
        try:
            root = parse_xml_string(xml_string)
            return self._parse_document(root)
        except XMLParseError as e:
            errors.append(ParseError("File", "xml", str(e)))
            return ParseResult(errors=errors)
    
    def _parse_document(self, root: ET.Element) -> ParseResult:
        """Parse document from root element."""
        errors = []
        warnings = []
        
        # Parse file info
        file_info, file_info_errors = self._parse_file_info(root)
        errors.extend(file_info_errors)
        
        if file_info is None:
            return ParseResult(errors=errors)
        
        # Parse operations
        operations, op_errors, op_warnings = self._parse_operations(root)
        errors.extend(op_errors)
        warnings.extend(op_warnings)
        
        document = CAMDocument(
            file_info=file_info,
            operations=operations,
        )
        
        return ParseResult(
            document=document,
            errors=errors,
            warnings=warnings,
        )
    
    def _parse_file_info(
        self, 
        root: ET.Element
    ) -> Tuple[Optional[CAMFileInfo], List[ParseError]]:
        """Parse FileInfo section."""
        errors = []
        
        file_info_elem = root.find('FileInfo')
        if file_info_elem is None:
            errors.append(ParseError("Document", "FileInfo", "Missing FileInfo section"))
            return None, errors
        
        file_name = find_text(file_info_elem, 'FileName')
        if not file_name:
            errors.append(ParseError("FileInfo", "FileName", "Missing file name"))
            return None, errors
        
        post_processor = find_text(file_info_elem, 'PostProcessor', 'Unknown')
        
        file_info = CAMFileInfo(
            file_name=file_name,
            post_processor=post_processor,
            machine_name=find_text(file_info_elem, 'MachineName'),
            program_number=find_int(file_info_elem, 'ProgramNumber') or None,
            file_path=find_text(file_info_elem, 'FilePath'),
        )
        
        return file_info, errors
    
    def _parse_operations(
        self, 
        root: ET.Element
    ) -> Tuple[List[CAMOperation], List[ParseError], List[ParseError]]:
        """Parse Operations section."""
        operations = []
        errors = []
        warnings = []
        
        operations_elem = root.find('Operations')
        if operations_elem is None:
            warnings.append(ParseError(
                "Document", "Operations", 
                "No operations found", severity="warning"
            ))
            return operations, errors, warnings
        
        for op_elem in find_all(operations_elem, 'Operation'):
            op, op_errors, op_warnings = self._parse_operation(op_elem)
            if op:
                operations.append(op)
            errors.extend(op_errors)
            warnings.extend(op_warnings)
        
        return operations, errors, warnings
    
    def _parse_operation(
        self, 
        op_elem: ET.Element
    ) -> Tuple[Optional[CAMOperation], List[ParseError], List[ParseError]]:
        """Parse single Operation element."""
        errors = []
        warnings = []
        
        seq = int(get_attr(op_elem, 'seq', '0'))
        location = f"Operation[{seq}]"
        
        name = find_text(op_elem, 'Name')
        if not name:
            errors.append(ParseError(location, "Name", "Missing operation name"))
            return None, errors, warnings
        
        op_type = find_text(op_elem, 'Type', 'Unknown')
        
        # Parse tool
        tool, tool_errors = self._parse_tool(op_elem, location)
        errors.extend(tool_errors)
        if tool is None:
            return None, errors, warnings
        
        # Parse parameters
        params = self._parse_parameters(op_elem)
        
        is_active = get_attr(op_elem, 'active', 'true').lower() == 'true'
        
        operation = CAMOperation(
            sequence=seq,
            name=name,
            operation_type=op_type,
            tool=tool,
            parameters=params,
            comment=find_text(op_elem, 'Comment'),
            is_active=is_active,
            cycle_time=find_float(op_elem, 'Geometry/CycleTime') or None,
        )
        
        return operation, errors, warnings
    
    def _parse_tool(
        self, 
        op_elem: ET.Element, 
        location: str
    ) -> Tuple[Optional[CAMTool], List[ParseError]]:
        """Parse Tool element."""
        errors = []
        
        tool_elem = op_elem.find('Tool')
        if tool_elem is None:
            errors.append(ParseError(location, "Tool", "Missing tool"))
            return None, errors
        
        number = find_int(tool_elem, 'Number')
        if number == 0:
            errors.append(ParseError(location, "Tool/Number", "Missing tool number"))
            return None, errors
        
        tool = CAMTool(
            number=number,
            description=find_text(tool_elem, 'Description', f'Tool {number}'),
            diameter=find_float(tool_elem, 'Diameter', 0.0),
            length=find_float(tool_elem, 'Length') or None,
            flutes=find_int(tool_elem, 'Flutes') or None,
        )
        
        return tool, errors
    
    def _parse_parameters(self, op_elem: ET.Element) -> CAMOperationParameters:
        """Parse Parameters element."""
        params_elem = op_elem.find('Parameters')
        if params_elem is None:
            return CAMOperationParameters()
        
        return CAMOperationParameters(
            spindle_speed=find_int(params_elem, 'SpindleSpeed'),
            feed_rate=find_float(params_elem, 'FeedRate'),
            plunge_rate=find_float(params_elem, 'PlungeRate') or None,
            depth_of_cut=find_float(params_elem, 'DepthOfCut') or None,
            step_over=find_float(params_elem, 'StepOver') or None,
            coolant=find_text(params_elem, 'Coolant'),
        )
```

---

## Part 3: Tests

```python
"""Tests for CAM parser."""

import pytest
from partflow.import_.cam_parser import CAMParser


VALID_XML = """<?xml version="1.0"?>
<MastercamDocument>
  <FileInfo>
    <FileName>TEST-001</FileName>
    <PostProcessor>HAAS_VF</PostProcessor>
  </FileInfo>
  <Operations>
    <Operation seq="1" active="true">
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
      </Parameters>
    </Operation>
  </Operations>
</MastercamDocument>
"""


class TestCAMParser:
    
    @pytest.fixture
    def parser(self):
        return CAMParser()
    
    def test_parse_valid_document(self, parser):
        result = parser.parse_string(VALID_XML)
        
        assert result.success
        assert result.document is not None
        assert result.document.file_info.file_name == "TEST-001"
        assert len(result.document.operations) == 1
    
    def test_parse_operation_details(self, parser):
        result = parser.parse_string(VALID_XML)
        
        op = result.document.operations[0]
        assert op.name == "FACE MILL"
        assert op.tool.number == 1
        assert op.parameters.spindle_speed == 3000
    
    def test_missing_filename_is_error(self, parser):
        xml = """
        <MastercamDocument>
          <FileInfo>
            <PostProcessor>HAAS</PostProcessor>
          </FileInfo>
        </MastercamDocument>
        """
        result = parser.parse_string(xml)
        
        assert not result.success
        assert any("FileName" in str(e) for e in result.errors)
    
    def test_missing_operations_is_warning(self, parser):
        xml = """
        <MastercamDocument>
          <FileInfo>
            <FileName>TEST</FileName>
            <PostProcessor>HAAS</PostProcessor>
          </FileInfo>
        </MastercamDocument>
        """
        result = parser.parse_string(xml)
        
        assert result.success  # Still succeeds
        assert result.has_warnings  # But with warning
```

---

## Summary

### Parser Features

| Feature | Implementation |
|---------|---------------|
| Safe parsing | try/except with error collection |
| Missing fields | Errors vs warnings |
| Type conversion | Safe int/float parsing |
| Result object | Document + errors + warnings |

---

## Next Tutorial

[Tutorial 4: Import Service →](./04-import-service.md)
