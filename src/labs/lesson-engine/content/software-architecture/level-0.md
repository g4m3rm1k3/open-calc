---
series: software-architecture
level: 0
title: What Architecture Is
lang: javascript
---

# What Architecture Is

Software architecture is the set of decisions that are **hard to reverse**. Every system has an architecture — the question is whether it was chosen deliberately or accumulated by accident. Martin Fowler describes architecture as "the important stuff — whatever that is." The key is: architectural decisions affect quality attributes (performance, reliability, scalability) and changing them later requires large-scale restructuring. Implementation decisions (which library, how to name variables) can be refactored cheaply. By the end of this lesson you will understand what makes a decision architectural, which quality attributes drive architecture, and how to reason about structural trade-offs.

## Architectural Decisions vs Implementation Decisions

```javascript
function classifyDecisions() {
  const decisions = [
    {
      decision: 'Monolith vs microservices',
      type: 'architectural',
      why: 'Affects deployment, scalability, reliability; expensive to reverse',
      costToReverse: 'high',
    },
    {
      decision: 'Synchronous HTTP vs async message queue',
      type: 'architectural',
      why: 'Changes how components couple, affects reliability and latency model',
      costToReverse: 'high',
    },
    {
      decision: 'SQL vs document store',
      type: 'architectural',
      why: 'Affects query model, transactions, schema evolution — hard to migrate',
      costToReverse: 'high',
    },
    {
      decision: 'Which HTTP library to use',
      type: 'implementation',
      why: 'Swappable behind an abstraction; one week to migrate',
      costToReverse: 'low',
    },
    {
      decision: 'Variable naming convention',
      type: 'implementation',
      why: 'Automated refactoring, no structural change',
      costToReverse: 'low',
    },
    {
      decision: 'Which logging library',
      type: 'implementation',
      why: 'Not visible across system boundaries; easy to replace',
      costToReverse: 'low',
    },
  ]

  console.log('=== Architectural vs Implementation Decisions ===\n')
  for (const d of decisions) {
    console.log(`[${d.type.toUpperCase()}] ${d.decision}`)
    console.log(`  Reversal cost: ${d.costToReverse}`)
    console.log(`  Why: ${d.why}`)
  }
}

classifyDecisions()
```

```text
=== Architectural vs Implementation Decisions ===

[ARCHITECTURAL] Monolith vs microservices
  Reversal cost: high
  Why: Affects deployment, scalability, reliability; expensive to reverse
[ARCHITECTURAL] Synchronous HTTP vs async message queue
  Reversal cost: high
  Why: Changes how components couple, affects reliability and latency model
[ARCHITECTURAL] SQL vs document store
  Reversal cost: high
  Why: Affects query model, transactions, schema evolution — hard to migrate
[IMPLEMENTATION] Which HTTP library to use
  Reversal cost: low
  Why: Swappable behind an abstraction; one week to migrate
[IMPLEMENTATION] Variable naming convention
  Reversal cost: low
  Why: Automated refactoring, no structural change
[IMPLEMENTATION] Which logging library
  Reversal cost: low
  Why: Not visible across system boundaries; easy to replace
```

**CS lens:** The distinction is about **coupling**. An architectural decision couples many components to a shared assumption — changing it requires changing all of them simultaneously. An implementation decision is local — it can be changed without affecting the interface. This is why architectural decisions have high reversal cost: the coupling spreads through the entire system.

## Quality Attributes — What Architecture Optimises For

Architecture decisions are driven by quality attributes — the properties of how a system behaves under load, change, and failure.

```javascript
function demonstrateTradeoffs() {
  // A monolith vs microservices example: no architecture wins on all attributes
  const architectures = {
    monolith: {
      performance:    'high',   // in-process calls, no network hops
      reliability:    'medium', // one process failing takes down everything
      deployability:  'low',    // deploy entire system for any change
      maintainability:'medium', // easier to understand but can become a big ball of mud
      scalability:    'low',    // scale entire app, cannot scale components independently
    },
    microservices: {
      performance:    'medium', // network hops between services add latency
      reliability:    'high',   // one service fails, others can continue
      deployability:  'high',   // deploy each service independently
      maintainability:'low',    // distributed debugging, service contracts, versioning
      scalability:    'high',   // scale individual services independently
    },
  }

  const attributes = ['performance', 'reliability', 'deployability', 'maintainability', 'scalability']

  console.log('Quality Attribute Comparison:\n')
  console.log('Attribute'.padEnd(20), 'Monolith'.padEnd(12), 'Microservices')
  console.log('-'.repeat(50))
  for (const attr of attributes) {
    const mono  = architectures.monolith[attr]
    const micro = architectures.microservices[attr]
    const better = mono === 'high' && micro !== 'high' ? '← wins' :
                   micro === 'high' && mono !== 'high' ? '          → wins' : ''
    console.log(attr.padEnd(20), mono.padEnd(12), micro, better)
  }
  console.log('\nConclusion: choose based on which attributes YOUR system needs most')
}

demonstrateTradeoffs()
```

```text
Quality Attribute Comparison:

Attribute            Monolith     Microservices
--------------------------------------------------
performance          high         medium ← wins
reliability          medium       high          → wins
deployability        low          high          → wins
maintainability      medium       low  ← wins
scalability          low          high          → wins

Conclusion: choose based on which attributes YOUR system needs most
```

**SE lens:** The most common architectural mistake is choosing a pattern because it is fashionable rather than because it fits the system's actual quality attribute requirements. Netflix, Amazon, and Google switched to microservices because they had specific scalability and deployability requirements at massive scale. A startup with 5 engineers and 1000 users almost certainly has different requirements. "What problem are we solving?" must precede "which architecture should we use?"

## The Architecture Description

A useful architecture record answers three questions:

```javascript
function createArchitectureRecord(decision) {
  // Architecture Decision Record (ADR) — lightweight documentation pattern
  return {
    title: decision.title,
    status: decision.status,        // proposed | accepted | deprecated | superseded
    context: decision.context,      // why this decision needs to be made
    decision_text: decision.text,   // what we decided
    consequences: decision.consequences,  // what changes, what gets harder
    alternatives: decision.alternatives,  // what else was considered and why rejected
  }
}

const adr = createArchitectureRecord({
  title: 'ADR-001: Use a shared relational database',
  status: 'accepted',
  context: 'We have 3 services that share user and order data. Need to decide whether each service owns its own database or all services share one.',
  text: 'All three services will share a single PostgreSQL database. Each service gets its own schema.',
  consequences: [
    'Simpler to operate — one database to manage',
    'Joins across service data are possible',
    'Services cannot be deployed or scaled independently of each other — all couple to the same DB',
    'Schema changes require coordinating across all teams',
  ],
  alternatives: [
    { name: 'Database per service', rejectedBecause: 'Too complex to operate for our current team size; cross-service queries would require service calls' },
    { name: 'Event sourcing', rejectedBecause: 'Steep learning curve; overkill for current requirements' },
  ],
})

console.log(`\n${adr.title} [${adr.status}]`)
console.log(`\nContext: ${adr.context}`)
console.log(`\nDecision: ${adr.decision_text}`)
console.log('\nConsequences:')
adr.consequences.forEach(c => console.log(`  · ${c}`))
console.log('\nAlternatives rejected:')
adr.alternatives.forEach(a => console.log(`  · ${a.name}: ${a.rejectedBecause}`))
```

```text
ADR-001: Use a shared relational database [accepted]

Context: We have 3 services that share user and order data. Need to decide whether...

Decision: All three services will share a single PostgreSQL database. Each service gets its own schema.

Consequences:
  · Simpler to operate — one database to manage
  · Joins across service data are possible
  · Services cannot be deployed or scaled independently of each other — all couple to the same DB
  · Schema changes require coordinating across all teams

Alternatives rejected:
  · Database per service: Too complex to operate for our current team size; cross-service queries...
  · Event sourcing: Steep learning curve; overkill for current requirements
```

**SE lens:** Architecture Decision Records (ADRs) are the most important documentation a software team can write — not because they explain what the system does, but because they explain **why it is the way it is**. A year after a decision, the team will forget the alternatives considered. ADRs prevent the same debates from happening every six months.

## Common Mistakes

```javascript
function showCommonMistakes() {
  const mistakes = [
    {
      mistake: 'Resume-driven development',
      example: 'Using Kubernetes and microservices because "it looks good on a resume", not because the system needs it',
      fix: 'Ask: what quality attribute problem does this solve for us specifically?',
    },
    {
      mistake: 'No architecture at all',
      example: 'Never discussing structure; letting every engineer make local decisions that create global incoherence',
      fix: 'Identify the 3-5 significant decisions your system faces and make them deliberately',
    },
    {
      mistake: 'Treating architecture as fixed',
      example: 'Starting with microservices at day 1 before understanding the domain',
      fix: 'Start simple (modular monolith); extract services when you have a proven boundary',
    },
  ]

  for (const { mistake, example, fix } of mistakes) {
    console.log(`Mistake: ${mistake}`)
    console.log(`  Example: ${example}`)
    console.log(`  Fix: ${fix}`)
  }
}

showCommonMistakes()
```

```text
Mistake: Resume-driven development
  Example: Using Kubernetes and microservices because "it looks good on a resume"...
  Fix: Ask: what quality attribute problem does this solve for us specifically?
Mistake: No architecture at all
  Example: Never discussing structure; letting every engineer make local decisions...
  Fix: Identify the 3-5 significant decisions your system faces and make them deliberately
Mistake: Treating architecture as fixed
  Example: Starting with microservices at day 1 before understanding the domain
  Fix: Start simple (modular monolith); extract services when you have a proven boundary
```

## Challenge: architecture_analyser

Implement a decision classifier that identifies architecturally significant choices.

`createArchitectureAnalyser()` — returns an object with:
- `.classify(decision)` — `decision` is `{ name: string, affects: string[], reversalCost: 'low'|'medium'|'high' }`; returns `{ significant: boolean, reason: string }` — significant if `reversalCost === 'high'` OR if `affects` contains any recognised quality attribute (`'performance'`, `'reliability'`, `'scalability'`, `'maintainability'`, `'security'`, `'deployability'`, `'testability'`)
- `.qualityAttributes(decisions)` — returns `string[]` of unique quality attributes affected by significant decisions only

```challenge
function createArchitectureAnalyser() {
  const QUALITY_ATTRS = new Set(['performance','reliability','scalability','maintainability','security','deployability','testability'])
  return {
    classify(decision) {
      return { significant: false, reason: '' }
    },
    qualityAttributes(decisions) {
      return []
    },
  }
}
```

```test
const analyser = createArchitectureAnalyser()
const d1 = analyser.classify({ name: 'microservices', affects: ['scalability','deployability'], reversalCost: 'high' })
assert d1.significant === true
const d2 = analyser.classify({ name: 'variable naming', affects: ['readability'], reversalCost: 'low' })
assert d2.significant === false
const d3 = analyser.classify({ name: 'auth approach', affects: ['security'], reversalCost: 'medium' })
assert d3.significant === true
const decisions = [
  { name: 'event-driven', affects: ['reliability','scalability'], reversalCost: 'high' },
  { name: 'logging lib',  affects: [], reversalCost: 'low' },
  { name: 'sql vs nosql', affects: ['performance'], reversalCost: 'high' },
]
const attrs = analyser.qualityAttributes(decisions)
assert attrs.includes('reliability')
assert attrs.includes('scalability')
assert attrs.includes('performance')
assert !attrs.includes('readability')
```
