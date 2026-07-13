---
series: professional-engineering
level: 2
title: Incident Response
lang: javascript
---

# Incident Response

Production systems fail. Disks fill. Memory leaks. Third-party APIs go down. Configuration changes cascade into outages. The difference between amateur and professional response is not whether failures happen — they always do — it is whether the team can detect failures quickly, restore service reliably, and prevent recurrence systematically. Google's Site Reliability Engineering (SRE) book formalised many of these practices in 2016, codifying what high-performing operations teams had been doing informally for years. By the end of this lesson you will understand the incident lifecycle, how to do a Five Whys analysis, and what operational excellence looks like in practice.

## The Incident Lifecycle

```javascript
// Simulating the full incident lifecycle with state machine:
function createIncidentLifecycle() {
  const stages = ['detection', 'triage', 'mitigation', 'resolution', 'postmortem']
  const transitions = {
    detection:  { next: 'triage',      actions: ['alert fires or user reports', 'confirm the problem is real'] },
    triage:     { next: 'mitigation',  actions: ['classify severity P0-P3', 'assign incident commander', 'open war-room channel'] },
    mitigation: { next: 'resolution',  actions: ['rollback, disable flag, or scale resource', 'restore service — investigate later'] },
    resolution: { next: 'postmortem',  actions: ['document timeline while memory is fresh', 'notify stakeholders'] },
    postmortem: { next: null,          actions: ['identify root causes (5 Whys)', 'create action items with owners + deadlines'] },
  }

  let currentStage = 'detection'
  return {
    currentStage() { return currentStage },
    advance() {
      const stage = transitions[currentStage]
      console.log(`\n[${currentStage.toUpperCase()}]`)
      stage.actions.forEach(a => console.log(`  · ${a}`))
      if (stage.next) {
        currentStage = stage.next
        console.log(`  → Moving to: ${currentStage}`)
      } else {
        console.log('  → Incident closed')
      }
    },
    runAll() {
      while (transitions[currentStage]) this.advance()
      this.advance()  // run the last stage (postmortem)
    }
  }
}

const incident = createIncidentLifecycle()
console.log('Running incident lifecycle for: "Login service returning 500 errors"')
incident.runAll()
```

```text
Running incident lifecycle for: "Login service returning 500 errors"

[DETECTION]
  · alert fires or user reports
  · confirm the problem is real
  → Moving to: triage

[TRIAGE]
  · classify severity P0-P3
  · assign incident commander
  · open war-room channel
  → Moving to: mitigation

[MITIGATION]
  · rollback, disable flag, or scale resource
  · restore service — investigate later
  → Moving to: resolution

[RESOLUTION]
  · document timeline while memory is fresh
  · notify stakeholders
  → Moving to: postmortem

[POSTMORTEM]
  · identify root causes (5 Whys)
  · create action items with owners + deadlines
  → Incident closed
```

**CS lens:** The lifecycle applies **queueing theory** to incident work. An incident is a task with unknown service time. The first goal is to reduce service time to the minimum (mitigation), even if that means deferring root cause investigation. Mitigation and investigation are different tasks — mixing them prolongs the outage. An on-call rotation is a queueing system: the right staffing ensures incidents don't queue while others are being handled.

## Severity Classification

```javascript
function classifyIncident({ coreFeatureBroken, affectedUsers }) {
  const severity =
    (coreFeatureBroken && affectedUsers >= 1000) ? 'P0' :
    (coreFeatureBroken || affectedUsers >= 1000)  ? 'P1' :
    (affectedUsers >= 100)                         ? 'P2' : 'P3'

  const sla = { P0: '15 minutes', P1: '1 hour', P2: '4 hours', P3: 'next business day' }
  const action = (severity === 'P0' || severity === 'P1') ? 'page-oncall' : 'create-ticket'

  return { severity, responseTime: sla[severity], action }
}

const incidents = [
  { description: 'Login completely broken',   coreFeatureBroken: true,  affectedUsers: 50000 },
  { description: 'Checkout errors for users', coreFeatureBroken: true,  affectedUsers: 200   },
  { description: 'Slow search results',       coreFeatureBroken: false, affectedUsers: 5000  },
  { description: 'Missing avatar images',     coreFeatureBroken: false, affectedUsers: 30    },
]

console.log('Incident Severity Classification:\n')
for (const inc of incidents) {
  const result = classifyIncident(inc)
  console.log(`[${result.severity}] ${inc.description}`)
  console.log(`     Users affected: ${inc.affectedUsers}`)
  console.log(`     Response time: ${result.responseTime}`)
  console.log(`     Action: ${result.action}`)
}
```

```text
Incident Severity Classification:

[P0] Login completely broken
     Users affected: 50000
     Response time: 15 minutes
     Action: page-oncall

[P1] Checkout errors for users
     Users affected: 200
     Response time: 1 hour
     Action: page-oncall

[P1] Slow search results
     Users affected: 5000
     Response time: 1 hour
     Action: page-oncall

[P3] Missing avatar images
     Users affected: 30
     Response time: next business day
     Action: create-ticket
```

**SE lens:** Severity classification is a **contract with stakeholders**. When a P0 fires, everyone knows: wake up the on-call engineer, escalate to management, halt all other work. When a P3 fires, everyone knows: add to backlog, fix this week. Without explicit severity levels, every incident becomes subjective — some engineers treat everything as an emergency; others ignore real crises. Explicit levels calibrate the response.

## Five Whys — Finding Root Causes

The Five Whys technique (Toyota Production System, 1950s) recursively asks "why" until you reach the systemic root cause, not just the proximate cause:

```javascript
function demonstrateFiveWhys() {
  // Walking from symptom to systemic root cause:
  const analysis = [
    {
      level: 1,
      question: 'Why did the service go down?',
      answer: 'The database stopped accepting connections.',
    },
    {
      level: 2,
      question: 'Why did the database stop accepting connections?',
      answer: 'The connection pool was exhausted — 100% utilisation.',
    },
    {
      level: 3,
      question: 'Why was the connection pool exhausted?',
      answer: 'A new feature added a slow query that held connections for 30 seconds.',
    },
    {
      level: 4,
      question: 'Why did the slow query reach production?',
      answer: 'Performance testing is not part of the CI pipeline.',
    },
    {
      level: 5,
      question: 'Why is performance testing absent from CI?',
      answer: 'No one owns performance standards — there is no performance SLO.',
    },
  ]

  console.log('Five Whys Analysis — "Database outage during peak traffic"\n')
  for (const { level, question, answer } of analysis) {
    console.log(`Why #${level}: ${question}`)
    console.log(`  Answer: ${answer}`)
  }

  console.log('\nProximate cause: slow query exhausted connection pool')
  console.log('Root cause: no performance ownership or SLO — structural problem')
  console.log('\nAction items (from root cause, not symptom):')
  console.log('  1. Add query performance check to CI (owner: Platform team, due: this sprint)')
  console.log('  2. Define database connection pool SLO + alert (owner: Backend lead, due: next sprint)')
  console.log('  3. Assign performance owner for each service (owner: Engineering Manager, due: this quarter)')
}

demonstrateFiveWhys()
```

```text
Five Whys Analysis — "Database outage during peak traffic"

Why #1: Why did the service go down?
  Answer: The database stopped accepting connections.
Why #2: Why did the database stop accepting connections?
  Answer: The connection pool was exhausted — 100% utilisation.
Why #3: Why was the connection pool exhausted?
  Answer: A new feature added a slow query that held connections for 30 seconds.
Why #4: Why did the slow query reach production?
  Answer: Performance testing is not part of the CI pipeline.
Why #5: Why is performance testing absent from CI?
  Answer: No one owns performance standards — there is no performance SLO.

Proximate cause: slow query exhausted connection pool
Root cause: no performance ownership or SLO — structural problem

Action items (from root cause, not symptom):
  1. Add query performance check to CI (owner: Platform team, due: this sprint)
  2. Define database connection pool SLO + alert (owner: Backend lead, due: next sprint)
  3. Assign performance owner for each service (owner: Engineering Manager, due: this quarter)
```

**CS lens:** The Five Whys is a traversal of the **causality graph** — each "why" descends one level deeper in the causal chain. You stop when you reach a cause that is systemic (a missing process, a lack of ownership, a tool that doesn't exist) rather than proximate (a specific bug or misconfiguration). Fixing only the proximate cause is equivalent to treating symptoms: the next different bug will cause the same systemic failure.

## Non-Usage — When Not to Do a Full Postmortem

Not every incident warrants a full postmortem. P3 and P4 incidents (minor impact, isolated) should be resolved with a ticket and a fix. Reserve the full Five Whys analysis and formal postmortem document for P0/P1 incidents and for recurring P2 patterns. Postmortem inflation — doing a full postmortem for every small issue — burns the team out and diminishes the weight of real postmortems.

## Challenge: incident_classifier

Implement an incident management system.

`createIncidentManager()` — returns an object with:
- `.report(incident)` — `incident` is `{ description: string, affectedUsers: number, coreFeatureBroken: boolean }`; returns `{ id: string, severity: 'P0'|'P1'|'P2'|'P3', action: string }`; P0: both core+1000; P1: either; P2: 100+; P3: else; action is `'page-oncall'` for P0/P1, `'create-ticket'` for P2/P3
- `.openIncidents()` — returns all unresolved incidents
- `.resolve(id)` — removes incident from open list

```challenge
function createIncidentManager() {
  return {
    report(incident) {
      return { id: 'inc-0', severity: 'P3', action: 'create-ticket' }
    },
    openIncidents() { return [] },
    resolve(id) {},
  }
}
```

```test
const im = createIncidentManager()
const i1 = im.report({ description: 'login broken', affectedUsers: 5000, coreFeatureBroken: true })
assert i1.severity === 'P0' && i1.action === 'page-oncall' && typeof i1.id === 'string'
const i2 = im.report({ description: 'slow search', affectedUsers: 2000, coreFeatureBroken: false })
assert i2.severity === 'P1' && i2.action === 'page-oncall'
const i3 = im.report({ description: 'checkout errors', affectedUsers: 300, coreFeatureBroken: false })
assert i3.severity === 'P2' && i3.action === 'create-ticket'
const i4 = im.report({ description: 'missing avatar', affectedUsers: 50, coreFeatureBroken: false })
assert i4.severity === 'P3'
assert im.openIncidents().length === 4
im.resolve(i1.id)
assert im.openIncidents().length === 3
```
