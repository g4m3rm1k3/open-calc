---
series: professional-engineering
level: 0
title: How Professional Software Is Built
lang: javascript
---

# How Professional Software Is Built

Writing code is the easy part of software engineering. The hard part is making decisions that remain sound as requirements change, teams grow, and systems scale. A junior engineer asks "does this work?" A senior engineer asks "does this work, can we change it, will we know when it breaks, and can we roll it back?" This series synthesises the technical concepts from previous series into the practices of professional engineering. By the end of this lesson you will understand the four properties of production code, how engineering differs from coding, and what technical debt actually means.

## The Four Properties of Production Code

```javascript
// Demonstrating what each property means in practice:
function evaluateProductionCode(module) {
  return {
    name: module.name,
    correct:       module.hasTests && module.handlesEdgeCases,
    maintainable:  module.readableNames && module.smallFunctions && module.clearInterfaces,
    reliable:      module.handlesFailures && module.hasAlerts && module.gracefulDegrades,
    evolvable:     module.lowCoupling && module.highCohesion && module.noMagicNumbers,
  }
}

const productionModule = {
  name: 'PaymentProcessor',
  hasTests: true, handlesEdgeCases: true,       // correct
  readableNames: true, smallFunctions: true, clearInterfaces: true, // maintainable
  handlesFailures: true, hasAlerts: true, gracefulDegrades: true,   // reliable
  lowCoupling: true, highCohesion: true, noMagicNumbers: true,      // evolvable
}

const prototypeModule = {
  name: 'HackathonDemoPayment',
  hasTests: false, handlesEdgeCases: false,
  readableNames: false, smallFunctions: false, clearInterfaces: false,
  handlesFailures: false, hasAlerts: false, gracefulDegrades: false,
  lowCoupling: false, highCohesion: false, noMagicNumbers: false,
}

function printEvaluation(mod) {
  const result = evaluateProductionCode(mod)
  console.log(`\n[${result.name}]`)
  for (const [prop, value] of Object.entries(result)) {
    if (prop === 'name') continue
    console.log(`  ${prop}: ${value ? '✓' : '✗'}`)
  }
  const score = ['correct','maintainable','reliable','evolvable'].filter(p => result[p]).length
  console.log(`  Production readiness: ${score}/4 ${score >= 3 ? '(production ready)' : '(prototype only)'}`)
}

printEvaluation(productionModule)
printEvaluation(prototypeModule)
```

```text
[PaymentProcessor]
  correct: true
  maintainable: true
  reliable: true
  evolvable: true
  Production readiness: 4/4 (production ready)

[HackathonDemoPayment]
  correct: false
  maintainable: false
  reliable: false
  evolvable: false
  Production readiness: 0/4 (prototype only)
```

**CS lens:** These four properties are not independent — they form a partial order. Correctness enables reliability (a system that does the wrong thing reliably is still wrong). Maintainability enables evolvability (you cannot safely change what you cannot understand). Reliability enables correctness under adversarial conditions (network failure is an input to the system). Every engineering decision either advances or degrades one or more of these properties.

## Engineering vs Coding — The Questions That Matter

```javascript
function demonstrateEngineeringQuestions() {
  // A code question vs an engineering question about the same feature:
  const codingQuestion = {
    feature: 'Add user delete endpoint',
    question: 'How do I write a DELETE /users/:id handler that removes the user from the database?',
    focus: 'implementation',
  }

  const engineeringQuestions = {
    feature: 'Add user delete endpoint',
    questions: [
      'What happens to orders owned by this user? Cascade delete? Soft delete? Error?',
      'Who is allowed to call this? Only the user themselves? Admins? Anyone?',
      'How will we know if deletes start failing in production? What alert fires?',
      'If we accidentally delete a user, how do we recover? Is there a backup?',
      'Do we need an audit log of who deleted whom and when?',
      'What latency is acceptable? This hits the database — do we need rate limiting?',
    ],
    focus: 'structure, failure, observability, recoverability',
  }

  console.log(`Feature: ${codingQuestion.feature}`)
  console.log(`\nCoding question:`)
  console.log(`  ${codingQuestion.question}`)
  console.log(`\nEngineering questions:`)
  engineeringQuestions.questions.forEach(q => console.log(`  · ${q}`))
  console.log(`\nThe code is the easy part.`)
  console.log(`The engineering is deciding all of the above before writing the code.`)
}

demonstrateEngineeringQuestions()
```

```text
Feature: Add user delete endpoint

Coding question:
  How do I write a DELETE /users/:id handler that removes the user from the database?

Engineering questions:
  · What happens to orders owned by this user? Cascade delete? Soft delete? Error?
  · Who is allowed to call this? Only the user themselves? Admins? Anyone?
  · How will we know if deletes start failing in production? What alert fires?
  · If we accidentally delete a user, how do we recover? Is there a backup?
  · Do we need an audit log of who deleted whom and when?
  · What latency is acceptable? This hits the database — do we need rate limiting?

The code is the easy part.
The engineering is deciding all of the above before writing the code.
```

**SE lens:** The shift from coding to engineering is the shift from "does this work?" to "does this work in production, under load, when dependencies fail, for users we haven't anticipated?" These questions are not bureaucracy — they are the reason experienced engineers catch bugs that juniors miss. The bugs they catch are not implementation bugs; they are design bugs that no amount of unit testing would reveal.

## Technical Debt — Tool, Not Accident

```javascript
function demonstrateTechnicalDebt() {
  // Technical debt is not inherently bad — it is a deliberate trade-off
  const debtTypes = [
    {
      type: 'Deliberate debt (good)',
      example: 'Hardcode the payment provider for the MVP launch. Ship in 2 weeks instead of 6.',
      when: 'When time-to-market matters more than flexibility; when you will fix it after validating the product',
      risk: 'Low — if you actually pay it down',
    },
    {
      type: 'Inadvertent debt (neutral)',
      example: 'Used a simple O(n²) algorithm because O(n log n) wasn\'t needed yet.',
      when: 'When you don\'t yet know what will need to scale',
      risk: 'Low — will surface as a performance issue when it matters',
    },
    {
      type: 'Reckless debt (bad)',
      example: 'Skipped tests because "we\'ll add them later." Never did.',
      when: 'Never intentionally — this happens when teams have no engineering culture',
      risk: 'High — compounds over time, slows all future changes',
    },
  ]

  for (const { type, example, when, risk } of debtTypes) {
    console.log(`\n[${type}]`)
    console.log(`  Example: ${example}`)
    console.log(`  Appropriate when: ${when}`)
    console.log(`  Risk: ${risk}`)
  }

  // Interest metaphor: debt accrues interest
  function simulateDebtInterest(initialDebt, monthlyInterestRate, months) {
    const history = []
    let debt = initialDebt
    for (let m = 1; m <= months; m++) {
      debt = debt * (1 + monthlyInterestRate)
      if (m % 3 === 0) history.push({ month: m, debtHours: debt.toFixed(1) })
    }
    return history
  }

  console.log('\nDebt that is never paid down (5% monthly interest on 10 hours):')
  simulateDebtInterest(10, 0.05, 12).forEach(({ month, debtHours }) => {
    console.log(`  Month ${month}: ${debtHours} hours of rework to fix`)
  })
}

demonstrateTechnicalDebt()
```

```text
[Deliberate debt (good)]
  Example: Hardcode the payment provider for the MVP launch. Ship in 2 weeks instead of 6.
  Appropriate when: When time-to-market matters more than flexibility...
  Risk: Low — if you actually pay it down

[Inadvertent debt (neutral)]
  ...

[Reckless debt (bad)]
  ...

Debt that is never paid down (5% monthly interest on 10 hours):
  Month 3: 11.6 hours of rework to fix
  Month 6: 13.4 hours of rework to fix
  Month 9: 15.5 hours of rework to fix
  Month 12: 17.9 hours of rework to fix
```

**SE lens:** Ward Cunningham coined "technical debt" in 1992 to explain to non-engineers why code that "works" might still need refactoring. The metaphor: borrowing money (skipping engineering quality) lets you ship faster now but requires paying back with interest (slower velocity later). Reckless debt — skipping tests, ignoring coupling, writing code no one can understand — is like credit card debt at 30%: it compounds until the codebase is functionally bankrupt.

## Challenge: quality_analyser

Implement a code quality decision evaluator.

`createQualityAnalyser()` — returns an object with:
- `.evaluate(decision)` — `decision` is `{ name: string, improvesCorrectness: boolean, improvesMaintainability: boolean, improvesReliability: boolean, improvesEvolvability: boolean, cost: 'low'|'medium'|'high' }`; returns `{ score: number, recommendation: 'do'|'consider'|'skip', reason: string }`

Score = (count of improved properties) − costWeight (low=0, medium=1, high=2).
`score >= 3` → `'do'`; `score >= 1` → `'consider'`; else `'skip'`.

```challenge
function createQualityAnalyser() {
  return {
    evaluate(decision) {
      return { score: 0, recommendation: 'skip', reason: '' }
    },
  }
}
```

```test
const qa = createQualityAnalyser()
const r1 = qa.evaluate({ name: 'add unit tests', improvesCorrectness: true, improvesMaintainability: true, improvesReliability: true, improvesEvolvability: true, cost: 'medium' })
assert r1.score === 3
assert r1.recommendation === 'do'
const r2 = qa.evaluate({ name: 'rewrite in Haskell', improvesCorrectness: false, improvesMaintainability: false, improvesReliability: false, improvesEvolvability: false, cost: 'high' })
assert r2.score === -2
assert r2.recommendation === 'skip'
const r3 = qa.evaluate({ name: 'extract interface', improvesCorrectness: false, improvesMaintainability: true, improvesReliability: false, improvesEvolvability: true, cost: 'low' })
assert r3.score === 2
assert r3.recommendation === 'consider'
assert typeof r3.reason === 'string'
```
