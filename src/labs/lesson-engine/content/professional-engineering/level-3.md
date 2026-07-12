---
series: professional-engineering
level: 3
title: Team Patterns and Conway's Law
lang: javascript
---

# Team Patterns and Conway's Law

The best code is written by teams that work well together. The worst technical debt is created by teams that don't. Conway's Law (1967) is the most important insight in team organisation: the system you build will mirror your team's communication structure. Matthew Skelton and Manuel Pais formalised this in "Team Topologies" (2019), providing a framework for designing team structures that produce the architecture you want. By the end of this lesson you will understand Conway's Law, the four team topologies, and the specific practices that distinguish high-performing engineering teams from average ones.

## Conway's Law — Architecture Follows Organisation

```javascript
function demonstrateConwaysLaw() {
  // Conway's Law: system structure = communication structure
  // Show how different org structures produce different architectures

  function buildSystem(teamStructure) {
    // Each team produces a component; interfaces exist where teams must coordinate
    const components = teamStructure.teams.map(team => ({
      name: team.name,
      owns: team.components,
      interfaces: []
    }))

    // Interfaces form wherever two teams need to communicate
    for (const interaction of teamStructure.interactions) {
      const from = components.find(c => c.name === interaction.from)
      const to   = components.find(c => c.name === interaction.to)
      from.interfaces.push(`${interaction.to}:${interaction.topic}`)
    }

    return components
  }

  // Org structure 1: Functional silos (Frontend / Backend / DB)
  const siloed = {
    teams: [
      { name: 'Frontend', components: ['UI', 'Forms', 'Pages'] },
      { name: 'Backend',  components: ['API', 'Auth', 'Business Logic'] },
      { name: 'Database', components: ['Schemas', 'Migrations', 'Queries'] },
    ],
    interactions: [
      { from: 'Frontend', to: 'Backend',  topic: 'REST API' },
      { from: 'Backend',  to: 'Database', topic: 'SQL Schema' },
    ]
  }

  // Org structure 2: Cross-functional squads (User Journey / Checkout / Admin)
  const crossFunctional = {
    teams: [
      { name: 'UserJourneySquad', components: ['Profile UI', 'Profile API', 'User DB'] },
      { name: 'CheckoutSquad',   components: ['Cart UI', 'Order API', 'Order DB'] },
      { name: 'AdminSquad',      components: ['Admin UI', 'Admin API', 'Config DB'] },
    ],
    interactions: [
      { from: 'CheckoutSquad', to: 'UserJourneySquad', topic: 'User existence check' },
    ]
  }

  function printSystem(label, org) {
    console.log(`\n[${label}]`)
    const system = buildSystem(org)
    for (const comp of system) {
      console.log(`  Team: ${comp.name}`)
      console.log(`    Components: ${comp.owns.join(', ')}`)
      if (comp.interfaces.length > 0) {
        console.log(`    Interfaces (Conway boundaries): ${comp.interfaces.join(', ')}`)
      }
    }
  }

  printSystem('Functional Silos → Layered Architecture', siloed)
  printSystem('Cross-functional Squads → Microservices', crossFunctional)

  console.log('\nConway\'s insight: to change the architecture, restructure the teams')
  console.log('The Inverse Conway Manoeuvre: design teams to produce the architecture you want')
}

demonstrateConwaysLaw()
```

```text
[Functional Silos → Layered Architecture]
  Team: Frontend
    Components: UI, Forms, Pages
    Interfaces (Conway boundaries): Backend:REST API
  Team: Backend
    Components: API, Auth, Business Logic
    Interfaces (Conway boundaries): Database:SQL Schema
  Team: Database
    Components: Schemas, Migrations, Queries

[Cross-functional Squads → Microservices]
  Team: UserJourneySquad
    Components: Profile UI, Profile API, User DB
  Team: CheckoutSquad
    Components: Cart UI, Order API, Order DB
    Interfaces (Conway boundaries): UserJourneySquad:User existence check
  Team: AdminSquad
    Components: Admin UI, Admin API, Config DB

Conway's insight: to change the architecture, restructure the teams
The Inverse Conway Manoeuvre: design teams to produce the architecture you want
```

**CS lens:** Conway's Law is causal, not coincidental. When two teams must communicate to change an interface, they do it as rarely as possible — so the interface becomes stable and load-bearing. The boundary between teams becomes the boundary between services. This is why you cannot build a microservices architecture with a monolithic team, and why a single team building microservices tends to build a distributed monolith.

## Four Team Topologies

```javascript
function demonstrateTeamTopologies() {
  const topologies = [
    {
      type: 'Stream-aligned team',
      purpose: 'Owns a product stream end-to-end, from idea to production',
      example: 'Checkout squad: owns cart UI, order API, payments, fulfilment',
      measures: 'Time to ship features; customer outcomes',
      primacy: 'PRIMARY — all other team types exist to support these',
    },
    {
      type: 'Platform team',
      purpose: 'Provides internal services that reduce cognitive load for stream-aligned teams',
      example: 'DevOps platform: CI/CD, observability stack, cloud infra, deploy tooling',
      measures: 'Developer experience; how easy it is to use the platform',
      primacy: 'SUPPORTING',
    },
    {
      type: 'Enabling team',
      purpose: 'Helps stream-aligned teams adopt new capabilities; temporary by design',
      example: 'Security champions: embed in squads for one quarter to teach secure coding',
      measures: 'Whether the capability is embedded after the team leaves',
      primacy: 'TEMPORARY — succeeds by making itself unnecessary',
    },
    {
      type: 'Complicated subsystem team',
      purpose: 'Owns a specialist component requiring deep expertise',
      example: 'Search team: ranking algorithms, relevance ML models, index management',
      measures: 'Correctness and performance of the subsystem',
      primacy: 'SPECIALIST — keeps expert complexity out of stream-aligned teams',
    },
  ]

  for (const { type, purpose, example, measures, primacy } of topologies) {
    console.log(`\n[${type}] — ${primacy}`)
    console.log(`  Purpose: ${purpose}`)
    console.log(`  Example: ${example}`)
    console.log(`  Measures: ${measures}`)
  }
}

demonstrateTeamTopologies()
```

```text
[Stream-aligned team] — PRIMARY — all other team types exist to support these
  Purpose: Owns a product stream end-to-end, from idea to production
  Example: Checkout squad: owns cart UI, order API, payments, fulfilment
  Measures: Time to ship features; customer outcomes

[Platform team] — SUPPORTING
  Purpose: Provides internal services that reduce cognitive load for stream-aligned teams
  Example: DevOps platform: CI/CD, observability stack, cloud infra, deploy tooling
  Measures: Developer experience; how easy it is to use the platform

[Enabling team] — TEMPORARY — succeeds by making itself unnecessary
  Purpose: Helps stream-aligned teams adopt new capabilities; temporary by design
  Example: Security champions: embed in squads for one quarter to teach secure coding
  Measures: Whether the capability is embedded after the team leaves

[Complicated subsystem team] — SPECIALIST — keeps expert complexity out of stream-aligned teams
  Purpose: Owns a specialist component requiring deep expertise
  Example: Search team: ranking algorithms, relevance ML models, index management
  Measures: Correctness and performance of the subsystem
```

**SE lens:** The key insight of Team Topologies is that the primary team type is the **stream-aligned team** — all other team types are in service to reducing the cognitive load on stream-aligned teams. A platform team that builds tools no one uses is not a success. An enabling team that stays forever has failed. The health of the entire organisation is measured by whether stream-aligned teams can ship features fast and safely.

## High-Performing Team Metrics (DORA)

The DevOps Research and Assessment (DORA) study (Google, 2014–present) identified four metrics that distinguish elite engineering teams:

```javascript
function demonstrateDORAMetrics() {
  const metrics = {
    deploymentFrequency: {
      name: 'Deployment Frequency',
      question: 'How often does the team deploy to production?',
      elite: 'Multiple times per day',
      high: 'Once per week to once per month',
      medium: 'Once per month to once per six months',
      low: 'Less than once per six months',
      why: 'Higher frequency = smaller deploys = lower risk per deploy',
    },
    leadTime: {
      name: 'Lead Time for Changes',
      question: 'How long from code commit to running in production?',
      elite: 'Less than one hour',
      high: 'One day to one week',
      medium: 'One week to one month',
      low: 'More than six months',
      why: 'Shorter lead time = faster feedback = faster learning',
    },
    changeFailureRate: {
      name: 'Change Failure Rate',
      question: 'What percentage of changes cause a production failure?',
      elite: '0-15%',
      high: '16-30%',
      medium: '31-45%',
      low: '>45%',
      why: 'Lower failure rate = better testing and deployment practices',
    },
    recoveryTime: {
      name: 'Mean Time to Recovery (MTTR)',
      question: 'How long to restore service after a failure?',
      elite: 'Less than one hour',
      high: 'Less than one day',
      medium: 'Less than one week',
      low: 'More than six months',
      why: 'Faster recovery = less customer impact = better observability',
    },
  }

  console.log('DORA Four Key Metrics:\n')
  for (const { name, question, elite, why } of Object.values(metrics)) {
    console.log(`${name}`)
    console.log(`  Q: ${question}`)
    console.log(`  Elite: ${elite}`)
    console.log(`  Why it matters: ${why}`)
    console.log()
  }
}

demonstrateDORAMetrics()
```

```text
DORA Four Key Metrics:

Deployment Frequency
  Q: How often does the team deploy to production?
  Elite: Multiple times per day
  Why it matters: Higher frequency = smaller deploys = lower risk per deploy

Lead Time for Changes
  Q: How long from code commit to running in production?
  Elite: Less than one hour
  Why it matters: Shorter lead time = faster feedback = faster learning

Change Failure Rate
  Q: What percentage of changes cause a production failure?
  Elite: 0-15%
  Why it matters: Lower failure rate = better testing and deployment practices

Mean Time to Recovery (MTTR)
  Q: How long to restore service after a failure?
  Elite: Less than one hour
  Why it matters: Faster recovery = less customer impact = better observability
```

**CS lens:** The DORA metrics are a **measurement system for feedback loops**. Elite teams deploy frequently because each deploy is small and safe. Each deploy being small is possible because the CI/CD pipeline is fast and reliable. The pipeline being reliable is possible because tests are fast and comprehensive. All four metrics improve together — or worsen together. They are correlated by the underlying practices that drive them.

## Challenge: team_health_monitor

Implement a team health scoring system based on DORA-like metrics.

`createTeamHealthMonitor()` — returns an object with:
- `.recordMetric(metric, value)` — records or overwrites a metric value; `metric` is one of `'reviewResponseHours'`, `'prLinesChanged'`, `'alertsPerWeek'`, `'deployFrequencyDays'`
- `.score()` — returns `{ overall: 'healthy'|'warning'|'critical', metrics: object, issues: string[] }`

Scoring rules per metric:
- `reviewResponseHours`: ≤24 healthy, ≤48 warning, >48 critical
- `prLinesChanged`: ≤400 healthy, ≤800 warning, >800 critical
- `alertsPerWeek`: ≤5 healthy, ≤15 warning, >15 critical
- `deployFrequencyDays`: ≤1 healthy, ≤7 warning, >7 critical

Overall: `'critical'` if any metric critical; `'warning'` if any warning (and none critical); `'healthy'` if all healthy.

```challenge
function createTeamHealthMonitor() {
  return {
    recordMetric(metric, value) {},
    score() {
      return { overall: 'healthy', metrics: {}, issues: [] }
    },
  }
}
```

```test
const monitor = createTeamHealthMonitor()
monitor.recordMetric('reviewResponseHours', 20)
monitor.recordMetric('prLinesChanged', 350)
monitor.recordMetric('alertsPerWeek', 3)
monitor.recordMetric('deployFrequencyDays', 1)
const s1 = monitor.score()
assert s1.overall === 'healthy'
assert s1.issues.length === 0
monitor.recordMetric('alertsPerWeek', 20)
monitor.recordMetric('deployFrequencyDays', 14)
const s2 = monitor.score()
assert s2.overall === 'critical'
assert s2.issues.length >= 2
monitor.recordMetric('alertsPerWeek', 10)
monitor.recordMetric('deployFrequencyDays', 5)
const s3 = monitor.score()
assert s3.overall === 'warning'
assert s3.issues.length >= 2
```
