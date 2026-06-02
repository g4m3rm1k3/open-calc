# Naming Conventions

Consistent naming makes the codebase navigable. Follow these rules exactly.

---

## Lesson ID

```
<course>-<chapter>-<order>-<slug>
```

Examples:
```
calc-1-001-limits-introduction
la1-003-dot-product
py-1-1-numbers-structure
sim1-010-collision-detection
chem-1-002-periodic-table
w1-005-flexbox-layout
```

Rules:
- All lowercase, hyphens only — no spaces, underscores, or camelCase
- `chapter` matches the chapter number used in `index.js`
- `order` is zero-padded to 3 digits for courses with many lessons (001, 002…), plain integers for small courses
- `slug` is 2–5 words describing the topic

---

## File name

Match the lesson ID exactly, with `.js` extension:

```
calc-1-001-limits-introduction.js
la1-003-dot-product.js
py-1-1-numbers-structure.js
```

Place the file in the course folder:

```
src/content/
  chapter-1/          ← calculus
  linear-algebra/
  python-1/
  sim-1/
  chemistry-1/
  web-1/
```

---

## Registering in index.js

Every course folder has an `index.js` that exports a chapter structure. Add your lesson to the right chapter group.

```js
// src/content/python-1/index.js

import myLesson from './py-1-3-my-new-lesson.js'

export default [
  {
    number: 1.1,
    title: 'Chapter Title',
    course: 'python-1',       // ← must match the course folder name
    lessons: [
      existingLesson1,
      existingLesson2,
      myLesson,               // ← add here, in order
    ]
  },
  // ...
]
```

The `course` field on the chapter group is how videos match to lessons — it must match the folder name exactly.

---

## Chapter group numbers

Use decimals to create sub-chapters:

```
1     ← Chapter 1
1.1   ← Chapter 1, Section 1
1.2   ← Chapter 1, Section 2
2     ← Chapter 2
```

In the app the chapter number appears in the sidebar. Keep them sequential.

---

## Tags

Tags connect lessons to videos. Rules:
- Use lowercase strings
- Include the subject name (`python`, `calculus`, `chemistry`, `linear algebra`, etc.)
- Be specific: `for loops` beats `loops`; `chain rule` beats `derivatives`
- 4–10 tags per lesson is the right range
- Avoid duplicates from the course name (the system already adds those)

```js
// Good
tags: ['python', 'list comprehension', 'lists', 'iteration']

// Too vague
tags: ['python', 'code', 'programming']

// Too many — dilutes matching
tags: ['python', 'list', 'lists', 'array', 'for', 'iteration', 'loop', 'comprehension', 'filter', 'map', 'lambda']
```

---

## Viz component IDs

Viz IDs are PascalCase and never have hyphens:

```
PythonNotebook    ✓
python-notebook   ✗
pythonNotebook    ✗
```

See **07 — Visualizations** for the full list.

---

## Quiz question IDs

Within a lesson, quiz question IDs are `q1`, `q2`, `q3`… They only need to be unique within the lesson, not globally.

---

## A complete example

New lesson: "Python list comprehensions", Chapter 1, Section 3, order 5.

```
File:       src/content/python-1/py-1-3-list-comprehensions.js
Lesson id:  py-1-3-list-comprehensions
Slug:       list-comprehensions
Chapter:    1.3
Order:      5
Tags:       ['python', 'list comprehension', 'lists', 'for', 'filter']
```

`index.js` entry:
```js
{
  number: 1.3,
  title: 'Collections and Iteration',
  course: 'python-1',
  lessons: [...existingLessons, listComprehensionsLesson]
}
```
