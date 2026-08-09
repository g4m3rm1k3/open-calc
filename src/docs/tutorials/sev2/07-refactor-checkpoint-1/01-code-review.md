# Tutorial 1: Code Review Principles

## Introduction

Before refactoring, we need to **review what we've built**. This tutorial teaches you how to systematically evaluate code quality.

---

## Part 1: Why Code Review?

### 1.1 The Goal

Code review isn't about finding bugs (tests do that). It's about:

| Purpose | Question |
|---------|----------|
| **Readability** | Can someone else understand this in 6 months? |
| **Maintainability** | Can we change this without breaking things? |
| **Consistency** | Does it follow established patterns? |
| **Correctness** | Does it actually solve the problem? |

### 1.2 Review Checklist

For each file, ask:

```
[ ] Clear naming (variables, functions, classes)
[ ] Docstrings explain WHY, not just WHAT
[ ] Error handling is explicit
[ ] Tests cover edge cases
[ ] Dependencies point the right direction
[ ] No code duplication (DRY)
[ ] Single responsibility (SRP)
```

---

## Part 2: What to Look For

### 2.1 Code Smells

| Smell | Symptom | Fix |
|-------|---------|-----|
| **Long method** | > 20 lines | Extract helper methods |
| **Large class** | > 200 lines | Split responsibilities |
| **Duplicate code** | Copy-paste | Extract to utility |
| **Feature envy** | Access other object's data | Move method |
| **Primitive obsession** | Strings for typed data | Create value objects |

### 2.2 Our Current Codebase Review

Looking at what we've built:

**Part Entity:**
```python
# GOOD: Clear validation
def _validate(self):
    if not self.name or not self.name.strip():
        raise ValidationError("name", "Name cannot be empty")
```

**Repository Pattern:**
```python
# GOOD: Consistent interface
def save(self, part: Part) -> None:
def find_by_id(self, part_id: UUID) -> Optional[Part]:
def find_all(self) -> List[Part]:
```

**Repetitive Pattern (POTENTIAL SMELL):**
```python
# Part repository
def _row_to_part(self, row):
    return Part(...)

# Machine repository  
def _row_to_machine(self, row):
    return Machine(...)
```

This is similar but not identical—it's acceptable.

---

## Part 3: Review Process

### 3.1 Self-Review

Before submitting code:

1. **Read the diff** - Would you understand this as a reviewer?
2. **Run all tests** - Ensure nothing broke
3. **Check coverage** - New code should have tests
4. **Verify architecture** - Dependencies correct?

### 3.2 Review Questions

For each change:

| Question | Why It Matters |
|----------|----------------|
| What problem does this solve? | Justifies existence |
| What could go wrong? | Identifies risks |
| How would this break? | Reveals fragility |
| Is there a simpler way? | Prevents over-engineering |

---

## Part 4: Our Codebase Status

### 4.1 What's Working Well

| Component | Quality | Notes |
|-----------|---------|-------|
| Entities | ✅ Good | Validation in __post_init__ |
| Value Objects | ✅ Good | Immutable, validated |
| Repositories | ✅ Good | Clean interface |
| Services | ⚠️ OK | Some repetition |
| Web Layer | ⚠️ OK | Factory functions repeated |

### 4.2 Areas for Improvement

| Issue | Location | Proposed Fix |
|-------|----------|--------------|
| Repeated factory functions | Web routes | Centralize service creation |
| No base repository | Repositories | Extract common methods |
| Similar entity patterns | Entities | Consider base class |

---

## Part 5: Preparing for Refactor

### 5.1 Rules Before Refactoring

1. **All tests must pass** before starting
2. **Make one change at a time**
3. **Run tests after each change**
4. **Commit frequently**

### 5.2 What NOT to Refactor

| Leave Alone | Reason |
|-------------|--------|
| Working tests | They verify behavior |
| External interfaces | Breaking changes |
| Things you don't understand | Learn first |

---

## Summary

### Code Review Checklist

- [ ] Read through all code since last checkpoint
- [ ] Identify repetitive patterns
- [ ] Note potential improvements
- [ ] Prioritize by impact
- [ ] Plan small, testable changes

---

## Next Tutorial

[Tutorial 2: Entity Base Class →](./02-entity-base.md)
