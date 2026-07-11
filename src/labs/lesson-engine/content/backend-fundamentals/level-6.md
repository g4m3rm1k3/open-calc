---
series: backend-fundamentals
level: 6
title: Testing APIs
lang: javascript
---

# Testing APIs

A tested API is one you can change safely. Unit tests verify individual functions. Integration tests send real HTTP requests to a real server. Both are necessary.

## Unit testing with Jest

```javascript
// npm install --save-dev jest

// courseService.js — business logic (no framework dependencies)
function formatCourseTitle(title) {
  return title.trim().replace(/\s+/g, ' ');
}

function calculateProgress(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

module.exports = { formatCourseTitle, calculateProgress };
```

```javascript
// courseService.test.js
const { formatCourseTitle, calculateProgress } = require('./courseService');

describe('formatCourseTitle', () => {
  test('trims whitespace', () => {
    expect(formatCourseTitle('  Python  ')).toBe('Python');
  });
  test('collapses multiple spaces', () => {
    expect(formatCourseTitle('Python   Fundamentals')).toBe('Python Fundamentals');
  });
});

describe('calculateProgress', () => {
  test('returns percentage', () => {
    expect(calculateProgress(18, 36)).toBe(50);
  });
  test('returns 0 when total is 0', () => {
    expect(calculateProgress(0, 0)).toBe(0);
  });
  test('returns 100 when all complete', () => {
    expect(calculateProgress(36, 36)).toBe(100);
  });
});
```

```text
npx jest
→ PASS courseService.test.js
  formatCourseTitle
    ✓ trims whitespace (2ms)
    ✓ collapses multiple spaces
  calculateProgress
    ✓ returns percentage
    ✓ returns 0 when total is 0
    ✓ returns 100 when all complete

Test Suites: 1 passed
Tests:       5 passed
```

**CS lens:** Unit tests verify **pure functions** — functions with no side effects that return the same output for the same input. Business logic should be extracted into pure functions specifically so it can be unit-tested without starting a server or connecting to a database. The closer a function is to pure, the easier it is to test.

## Integration testing with Supertest

Supertest sends real HTTP requests to your Express app without starting a server on an actual port.

```javascript
// npm install --save-dev supertest

// app.js — export the app without calling listen()
const express = require('express');
const app = express();
app.use(express.json());

app.get('/courses', (req, res) => {
  res.json([{ id: 1, title: 'Python Fundamentals' }]);
});

app.post('/courses', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  res.status(201).json({ id: 2, title });
});

module.exports = app;
```

```javascript
// app.test.js
const request = require('supertest');
const app = require('./app');

describe('GET /courses', () => {
  test('returns course list', async () => {
    const res = await request(app).get('/courses');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Python Fundamentals');
  });
});

describe('POST /courses', () => {
  test('creates a course', async () => {
    const res = await request(app)
      .post('/courses')
      .send({ title: 'SQL Fundamentals' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('SQL Fundamentals');
  });

  test('400 when title missing', async () => {
    const res = await request(app).post('/courses').send({});
    expect(res.status).toBe(400);
  });
});
```

```text
npx jest app.test.js
→ PASS app.test.js
  GET /courses
    ✓ returns course list
  POST /courses
    ✓ creates a course
    ✓ 400 when title missing
```

**SE lens:** The export-then-listen pattern (`module.exports = app; // then server.js calls app.listen()`) is essential for testability. Supertest can import the app and make requests without a port. This is why Express tutorials show `app.listen(3000)` at the bottom of `index.js` — production apps split this into `app.js` (the app) and `server.js` (the listener).

**Common mistakes:**
- Testing implementation details rather than behaviour — test `GET /courses returns 200 with an array`, not `the database query uses SELECT *`. Tests that verify internals break every time you refactor.
- No tests for error cases — the happy path is easy. Test 400 (invalid input), 401 (no auth), 404 (not found). These are where bugs live.

**Debug tip:** `jest --verbose` shows each test name and result. `jest --watch` re-runs tests on file save. `jest --coverage` generates a coverage report showing which lines aren't tested.

**Next:** Deployment — environment setup, process managers (PM2), and deploying to Railway/Heroku.

## Challenge: pure_function_test

Write a testable pure function.

```javascript
// Write isPalindrome(str) — returns true if str reads the same forwards and backwards
// Ignore case. "racecar" → true, "hello" → false, "Racecar" → true
function isPalindrome(str) {
  // implement
}
```

```test
assert isPalindrome('racecar') === true
assert isPalindrome('hello') === false
assert isPalindrome('Racecar') === true
assert isPalindrome('A man a plan a canal Panama'.replace(/ /g, '').toLowerCase()) === true
assert isPalindrome('abc') === false
assert isPalindrome('a') === true
```
