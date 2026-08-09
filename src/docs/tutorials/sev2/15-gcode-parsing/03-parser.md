# Tutorial 3: G-code Parser

## Introduction

The parser builds meaningful structures from tokens—blocks, tool changes, operations.

---

## Part 1: AST Nodes

```python
# src/partflow/gcode/ast.py
"""G-code Abstract Syntax Tree nodes."""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class GCodeBlock:
    """One line of G-code."""
    line_number: Optional[int]
    g_codes: List[float]
    m_codes: List[int]
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    feed: Optional[float] = None
    spindle: Optional[int] = None
    tool: Optional[int] = None
    comment: Optional[str] = None
    raw_line: str = ""


@dataclass
class ToolChange:
    """A tool change event."""
    tool_number: int
    line: int
    spindle_speed: Optional[int] = None


@dataclass
class GCodeProgram:
    """Complete G-code program."""
    program_number: Optional[int]
    blocks: List[GCodeBlock] = field(default_factory=list)
    tool_changes: List[ToolChange] = field(default_factory=list)
    
    @property
    def tools_used(self) -> List[int]:
        """Get list of tools used."""
        return sorted(set(tc.tool_number for tc in self.tool_changes))
    
    @property
    def total_lines(self) -> int:
        return len(self.blocks)
```

---

## Part 2: Parser Implementation

```python
# src/partflow/gcode/parser.py
"""G-code parser."""

from typing import List, Optional

from partflow.gcode.lexer import GCodeLexer
from partflow.gcode.tokens import Token, TokenType
from partflow.gcode.ast import GCodeBlock, GCodeProgram, ToolChange


class GCodeParser:
    """Parses G-code tokens into program structure."""
    
    def __init__(self, text: str):
        self._lexer = GCodeLexer(text)
        self._tokens: List[Token] = []
        self._pos = 0
    
    def parse(self) -> GCodeProgram:
        """Parse G-code text into program."""
        self._tokens = self._lexer.tokenize()
        
        program = GCodeProgram(program_number=None)
        
        # Parse tokens
        while not self._at_end():
            # Handle program number
            if self._check(TokenType.PROGRAM_NUMBER):
                token = self._advance()
                program.program_number = int(token.numeric_value)
                continue
            
            # Handle percent
            if self._check(TokenType.PERCENT):
                self._advance()
                continue
            
            # Handle newline
            if self._check(TokenType.NEWLINE):
                self._advance()
                continue
            
            # Parse block
            block = self._parse_block()
            if block:
                program.blocks.append(block)
                
                # Track tool changes
                if block.tool is not None:
                    program.tool_changes.append(ToolChange(
                        tool_number=block.tool,
                        line=len(program.blocks),
                        spindle_speed=block.spindle,
                    ))
        
        return program
    
    def _parse_block(self) -> Optional[GCodeBlock]:
        """Parse one block of G-code."""
        block = GCodeBlock(
            line_number=None,
            g_codes=[],
            m_codes=[],
        )
        
        tokens_in_block = []
        
        while not self._at_end() and not self._check(TokenType.NEWLINE):
            token = self._advance()
            tokens_in_block.append(token)
            
            if token.type == TokenType.LINE_NUMBER:
                block.line_number = int(token.numeric_value)
            elif token.type == TokenType.G_CODE:
                block.g_codes.append(token.numeric_value)
            elif token.type == TokenType.M_CODE:
                block.m_codes.append(int(token.numeric_value))
            elif token.type == TokenType.X_COORD:
                block.x = token.numeric_value
            elif token.type == TokenType.Y_COORD:
                block.y = token.numeric_value
            elif token.type == TokenType.Z_COORD:
                block.z = token.numeric_value
            elif token.type == TokenType.FEED:
                block.feed = token.numeric_value
            elif token.type == TokenType.SPINDLE:
                block.spindle = int(token.numeric_value)
            elif token.type == TokenType.TOOL:
                block.tool = int(token.numeric_value)
            elif token.type == TokenType.COMMENT:
                block.comment = token.value
        
        # Skip to next line
        if self._check(TokenType.NEWLINE):
            self._advance()
        
        # Only return if block has content
        if tokens_in_block:
            block.raw_line = ' '.join(t.value for t in tokens_in_block)
            return block
        return None
    
    def _at_end(self) -> bool:
        return self._pos >= len(self._tokens) or self._tokens[self._pos].type == TokenType.EOF
    
    def _check(self, token_type: TokenType) -> bool:
        if self._at_end():
            return False
        return self._tokens[self._pos].type == token_type
    
    def _advance(self) -> Token:
        token = self._tokens[self._pos]
        self._pos += 1
        return token
```

---

## Part 3: Tests

```python
"""Tests for G-code parser."""

import pytest
from partflow.gcode.parser import GCodeParser


SAMPLE_PROGRAM = """
%
O1001
N10 G21
N20 G90
N30 T1 M06
N40 S3000 M03
N50 G00 X0 Y0
N60 G01 Z-5.0 F100
N70 M30
%
"""


class TestGCodeParser:
    
    def test_parse_program_number(self):
        parser = GCodeParser(SAMPLE_PROGRAM)
        program = parser.parse()
        
        assert program.program_number == 1001
    
    def test_parse_tool_changes(self):
        parser = GCodeParser(SAMPLE_PROGRAM)
        program = parser.parse()
        
        assert len(program.tool_changes) == 1
        assert program.tool_changes[0].tool_number == 1
    
    def test_parse_coordinates(self):
        parser = GCodeParser("G01 X10.0 Y20.0 Z-5.0")
        program = parser.parse()
        
        block = program.blocks[0]
        assert block.x == 10.0
        assert block.y == 20.0
        assert block.z == -5.0
    
    def test_tools_used(self):
        parser = GCodeParser("T1 M06\nG00\nT3 M06")
        program = parser.parse()
        
        assert program.tools_used == [1, 3]
```

---

## Summary

### Parser Output

| Output | Contains |
|--------|----------|
| GCodeProgram | Full program |
| GCodeBlock | One line |
| ToolChange | Tool change events |

---

## Next Tutorial

[Tutorial 4: G-code Analyzer →](./04-analyzer.md)
