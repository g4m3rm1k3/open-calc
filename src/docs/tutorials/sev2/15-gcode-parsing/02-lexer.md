# Tutorial 2: G-code Lexer

## Introduction

A lexer (tokenizer) breaks G-code text into tokens. This is the first step of parsing.

---

## Part 1: Token Types

### 1.1 Token Definitions

```python
# src/partflow/gcode/tokens.py
"""G-code token definitions."""

from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional


class TokenType(Enum):
    """Types of G-code tokens."""
    PROGRAM_NUMBER = auto()  # O1001
    LINE_NUMBER = auto()     # N10
    G_CODE = auto()          # G00, G01
    M_CODE = auto()          # M03, M30
    TOOL = auto()            # T1
    SPINDLE = auto()         # S3000
    FEED = auto()            # F100
    X_COORD = auto()         # X25.0
    Y_COORD = auto()         # Y50.0
    Z_COORD = auto()         # Z-5.0
    A_COORD = auto()         # A90.0
    B_COORD = auto()         # B45.0
    COMMENT = auto()         # (text) or ;text
    PERCENT = auto()         # %
    NEWLINE = auto()
    EOF = auto()


@dataclass
class Token:
    """A G-code token."""
    type: TokenType
    value: str
    line: int
    column: int
    numeric_value: Optional[float] = None
    
    def __repr__(self):
        return f"Token({self.type.name}, {self.value!r})"
```

---

## Part 2: Lexer Implementation

```python
# src/partflow/gcode/lexer.py
"""G-code lexer."""

import re
from typing import Iterator, List

from partflow.gcode.tokens import Token, TokenType


class GCodeLexer:
    """Tokenizes G-code text."""
    
    # Token patterns (order matters)
    PATTERNS = [
        (r'\(([^)]*)\)', TokenType.COMMENT),      # (comment)
        (r';.*', TokenType.COMMENT),               # ; comment
        (r'%', TokenType.PERCENT),
        (r'O(\d+)', TokenType.PROGRAM_NUMBER),
        (r'N(\d+)', TokenType.LINE_NUMBER),
        (r'G(\d+\.?\d*)', TokenType.G_CODE),
        (r'M(\d+)', TokenType.M_CODE),
        (r'T(\d+)', TokenType.TOOL),
        (r'S(\d+\.?\d*)', TokenType.SPINDLE),
        (r'F(\d+\.?\d*)', TokenType.FEED),
        (r'X(-?\d+\.?\d*)', TokenType.X_COORD),
        (r'Y(-?\d+\.?\d*)', TokenType.Y_COORD),
        (r'Z(-?\d+\.?\d*)', TokenType.Z_COORD),
        (r'A(-?\d+\.?\d*)', TokenType.A_COORD),
        (r'B(-?\d+\.?\d*)', TokenType.B_COORD),
    ]
    
    def __init__(self, text: str):
        self._text = text
        self._pos = 0
        self._line = 1
        self._column = 1
    
    def tokenize(self) -> List[Token]:
        """Tokenize entire text."""
        return list(self._generate_tokens())
    
    def _generate_tokens(self) -> Iterator[Token]:
        """Generate tokens from text."""
        while self._pos < len(self._text):
            # Skip whitespace (except newlines)
            if self._text[self._pos] in ' \t':
                self._advance()
                continue
            
            # Handle newlines
            if self._text[self._pos] == '\n':
                yield Token(TokenType.NEWLINE, '\n', self._line, self._column)
                self._advance()
                self._line += 1
                self._column = 1
                continue
            
            # Handle carriage return
            if self._text[self._pos] == '\r':
                self._advance()
                continue
            
            # Try each pattern
            token = self._try_patterns()
            if token:
                yield token
            else:
                # Skip unknown character
                self._advance()
        
        yield Token(TokenType.EOF, '', self._line, self._column)
    
    def _try_patterns(self) -> Optional[Token]:
        """Try to match a pattern at current position."""
        for pattern, token_type in self.PATTERNS:
            match = re.match(pattern, self._text[self._pos:], re.IGNORECASE)
            if match:
                value = match.group(0)
                
                # Extract numeric value if present
                numeric = None
                if match.lastindex:
                    try:
                        numeric = float(match.group(1))
                    except ValueError:
                        pass
                
                token = Token(
                    type=token_type,
                    value=value,
                    line=self._line,
                    column=self._column,
                    numeric_value=numeric,
                )
                
                # Advance position
                for _ in value:
                    self._advance()
                
                return token
        
        return None
    
    def _advance(self):
        """Advance position."""
        self._pos += 1
        self._column += 1
```

---

## Part 3: Tests

```python
# tests/unit/gcode/test_lexer.py
"""Tests for G-code lexer."""

import pytest
from partflow.gcode.lexer import GCodeLexer
from partflow.gcode.tokens import TokenType


class TestGCodeLexer:
    
    def test_simple_line(self):
        lexer = GCodeLexer("G00 X10.0 Y20.0")
        tokens = lexer.tokenize()
        
        types = [t.type for t in tokens if t.type != TokenType.EOF]
        assert types == [
            TokenType.G_CODE,
            TokenType.X_COORD,
            TokenType.Y_COORD,
        ]
    
    def test_g_code_value(self):
        lexer = GCodeLexer("G01")
        tokens = lexer.tokenize()
        
        assert tokens[0].numeric_value == 1.0
    
    def test_comment(self):
        lexer = GCodeLexer("G00 (this is a comment) X10")
        tokens = lexer.tokenize()
        
        types = [t.type for t in tokens if t.type != TokenType.EOF]
        assert TokenType.COMMENT in types
    
    def test_negative_coordinates(self):
        lexer = GCodeLexer("G01 Z-5.0")
        tokens = lexer.tokenize()
        
        z_token = [t for t in tokens if t.type == TokenType.Z_COORD][0]
        assert z_token.numeric_value == -5.0
    
    def test_program_number(self):
        lexer = GCodeLexer("O1001")
        tokens = lexer.tokenize()
        
        assert tokens[0].type == TokenType.PROGRAM_NUMBER
        assert tokens[0].numeric_value == 1001
```

---

## Summary

### Lexer Components

| Component | Purpose |
|-----------|---------|
| Token | Represents one word |
| TokenType | Classification |
| Lexer | Generates tokens |
| Patterns | Regex matching |

---

## Next Tutorial

[Tutorial 3: G-code Parser →](./03-parser.md)
