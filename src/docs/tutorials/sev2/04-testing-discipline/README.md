# Phase 04: Testing Discipline

## Overview

This phase teaches **Test-Driven Development (TDD)**—the practice of writing tests before code. TDD is learned here, before any feature implementation.

> **Tests are not an afterthought. They drive design.**

---

## Why Testing Before Features?

### The Industry Reality

Most tutorials teach testing as an afterthought:
1. Write code
2. Realize you should test
3. Write tests that pass (because code exists)
4. Tests never fail, never catch bugs

### The Engineering Reality

Professionals write tests first:
1. Write test describing expected behavior
2. Test fails (code doesn't exist)
3. Write minimal code to pass
4. Refactor with confidence
5. Tests catch regressions forever

---

## What You Will Learn

| Topic | Why It Matters |
|-------|----------------|
| TDD philosophy | Why test-first changes design |
| pytest basics | Python's best testing framework |
| Test organization | Where tests live and how to structure |
| Fixtures | Reusable test setup |
| Mocking | Testing in isolation |

---

## Prerequisites

- Complete [Phase 03: Project Structure](../03-project-structure/README.md)
- Virtual environment activated
- pytest installed (`pip install pytest`)

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [TDD Philosophy](./01-tdd-philosophy.md) | 30 min |
| 2 | [Pytest Fundamentals](./02-pytest-fundamentals.md) | 45 min |
| 3 | [Test Organization](./03-test-organization.md) | 30 min |
| 4 | [Fixtures and Mocking](./04-fixtures-mocking.md) | 45 min |

---

## The TDD Lock

**From this phase forward:**
- No feature code without failing test first
- Tests prove the feature works
- Refactoring happens under test coverage

This is not optional. This is engineering discipline.

---

## Verification Checklist

After this phase:

- [ ] Can explain the TDD cycle
- [ ] Can write pytest tests
- [ ] Tests are organized by layer
- [ ] Can use fixtures
- [ ] Can mock dependencies

---

## Next Phase

[Phase 05: Parts Domain →](../05-parts-domain/README.md)
