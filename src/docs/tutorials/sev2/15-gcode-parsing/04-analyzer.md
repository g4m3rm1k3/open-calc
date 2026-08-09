# Tutorial 4: G-code Analyzer

## Introduction

The analyzer extracts useful information from parsed G-code—validation, statistics, and insights.

---

## Part 1: Analysis Results

```python
# src/partflow/gcode/analyzer.py
"""G-code analyzer."""

from dataclasses import dataclass, field
from typing import List, Dict

from partflow.gcode.ast import GCodeProgram, GCodeBlock


@dataclass
class AnalysisWarning:
    """A warning from analysis."""
    line: int
    message: str
    severity: str = "warning"  # warning, error


@dataclass
class AnalysisResult:
    """Results of G-code analysis."""
    program_number: int = None
    total_lines: int = 0
    tools: List[int] = field(default_factory=list)
    max_spindle: int = 0
    max_feed: float = 0.0
    has_coolant: bool = False
    warnings: List[AnalysisWarning] = field(default_factory=list)
    
    @property
    def is_valid(self) -> bool:
        return not any(w.severity == "error" for w in self.warnings)
```

---

## Part 2: Analyzer Implementation

```python
class GCodeAnalyzer:
    """Analyzes G-code programs."""
    
    def analyze(self, program: GCodeProgram) -> AnalysisResult:
        """Analyze a G-code program."""
        result = AnalysisResult(
            program_number=program.program_number,
            total_lines=program.total_lines,
            tools=program.tools_used,
        )
        
        current_spindle = 0
        spindle_on = False
        
        for i, block in enumerate(program.blocks):
            line_num = block.line_number or i + 1
            
            # Track spindle
            if block.spindle:
                current_spindle = block.spindle
                result.max_spindle = max(result.max_spindle, block.spindle)
            
            # Track feed
            if block.feed:
                result.max_feed = max(result.max_feed, block.feed)
            
            # Check for spindle on
            if 3 in block.m_codes or 4 in block.m_codes:
                spindle_on = True
            if 5 in block.m_codes:
                spindle_on = False
            
            # Check for coolant
            if 8 in block.m_codes:
                result.has_coolant = True
            
            # Validate: feed move without spindle
            if 1 in block.g_codes and not spindle_on:
                result.warnings.append(AnalysisWarning(
                    line=line_num,
                    message="Feed move (G01) without spindle running"
                ))
            
            # Validate: very high spindle speed
            if block.spindle and block.spindle > 15000:
                result.warnings.append(AnalysisWarning(
                    line=line_num,
                    message=f"Very high spindle speed: {block.spindle} RPM"
                ))
            
            # Validate: zero feed rate
            if 1 in block.g_codes and block.feed == 0:
                result.warnings.append(AnalysisWarning(
                    line=line_num,
                    message="Feed move with zero feed rate",
                    severity="error"
                ))
        
        return result
```

---

## Part 3: Integration

```python
# src/partflow/gcode/__init__.py
"""G-code parsing and analysis."""

from .lexer import GCodeLexer
from .parser import GCodeParser
from .analyzer import GCodeAnalyzer, AnalysisResult


def analyze_gcode(text: str) -> AnalysisResult:
    """Convenience function to analyze G-code."""
    parser = GCodeParser(text)
    program = parser.parse()
    
    analyzer = GCodeAnalyzer()
    return analyzer.analyze(program)
```

---

## Part 4: Tests

```python
"""Tests for G-code analyzer."""

import pytest
from partflow.gcode import analyze_gcode


class TestGCodeAnalyzer:
    
    def test_detect_high_spindle(self):
        gcode = "S20000 M03"
        result = analyze_gcode(gcode)
        
        assert any("high spindle" in w.message.lower() for w in result.warnings)
    
    def test_detect_feed_without_spindle(self):
        gcode = "G01 X10.0 F100"  # No M03
        result = analyze_gcode(gcode)
        
        assert any("without spindle" in w.message for w in result.warnings)
    
    def test_valid_program(self):
        gcode = """
        T1 M06
        S3000 M03
        G00 X0 Y0
        G01 Z-5.0 F100
        M05
        M30
        """
        result = analyze_gcode(gcode)
        
        assert result.is_valid
        assert result.max_spindle == 3000
```

---

## Summary

### Phase 15 Complete!

G-code parsing implemented:
- ✅ G-code fundamentals
- ✅ Lexer/tokenizer
- ✅ Parser with AST
- ✅ Analyzer with validation

**Next:** [Phase 16: Simulation Engine →](../16-simulation-engine/README.md)
