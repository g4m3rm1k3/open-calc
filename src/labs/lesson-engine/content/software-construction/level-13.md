---
series: software-construction
level: 13
title: Extending Existing Systems
lang: javascript
---

# Extending Existing Systems

Most software work is not building new systems from scratch — it is adding features to existing systems. The act of extending existing code is one of the most common and most frequently mishandled tasks in software development. Done wrong, every extension introduces fragile dependencies, breaks existing functionality, or forces changes in code that should not have needed to change.

The core principle for extending systems safely is the **open/closed principle**: software should be open for extension (new behaviour can be added) and closed for modification (existing, working code does not need to change to accommodate the extension). This is not always achievable, but it is the target. The closer a system comes to this principle, the easier it is to extend.

By the end of this lesson you will understand how to add new features without breaking existing ones, how to use abstraction to make a system naturally extensible, and how to avoid the common patterns that force modification when extension would be safer.

## The modification trap

The modification trap is when adding a new feature requires changing existing, tested, working code.

```javascript
// BEFORE: a function that calculates shipping for two carriers
function calculateShipping(order, carrier) {
  if (carrier === 'fedex') {
    return order.weightKg * 5.00 + 2.50
  } else if (carrier === 'ups') {
    return order.weightKg * 4.50 + 3.00
  }
  throw new Error(`Unknown carrier: ${carrier}`)
}

// Adding DHL means: MODIFY this function.
// Every new carrier means: MODIFY this function.
// This function grows indefinitely. Tests for FedEx must re-run to verify DHL didn't break them.
```

```javascript
// AFTER: open for extension — new carriers don't require modifying this function
const CARRIERS = {
  fedex: (order) => order.weightKg * 5.00 + 2.50,
  ups:   (order) => order.weightKg * 4.50 + 3.00,
}

function calculateShipping(order, carrier) {
  const pricingFn = CARRIERS[carrier]
  if (!pricingFn) throw new Error(`Unknown carrier: ${carrier}`)
  return pricingFn(order)
}

// Adding DHL: add one entry to CARRIERS. The function itself never changes.
// CARRIERS['dhl'] = (order) => order.weightKg * 4.00 + 4.00
```

```text
CARRIERS is a registry: a map of names to implementations.
Extending the system is adding an entry to the registry.
The orchestrating function (calculateShipping) never changes.

This is the extension pattern: abstract the "what varies" into a data structure or
registry, keep the "what stays the same" in a function that uses the registry.
```

**CS lens:** The open/closed principle was first stated by Bertrand Meyer in 1988 and later restated by Robert Martin as a core SOLID principle. The mechanism varies by language — inheritance in Java, higher-order functions in Haskell, registries in JavaScript — but the goal is always the same: the places where the system is most likely to need new variations are designed so that those variations can be added without touching the stable core. The cost of not doing this is that every new feature breaks existing tests, because every new feature touches code that already works.

## Extending with composition

When the variations are not just different values but different behaviours, composition is the tool.

```javascript
// Notification system that needs to support: email, SMS, push notifications, and any future type
// BAD: switch that grows with every new type
function sendNotification(user, message, type) {
  if (type === 'email') {
    sendEmail(user.email, message)
  } else if (type === 'sms') {
    sendSMS(user.phone, message)
  } else if (type === 'push') {
    sendPushNotification(user.deviceToken, message)
  }
  // Every new notification type: modify this function
}
```

```javascript
// GOOD: composition — pass the behaviour, don't switch on a type string
function sendNotification(user, message, notifier) {
  notifier(user, message)   // the caller decides HOW to notify
}

// Each "how" is a separate, independent function:
const emailNotifier = (user, message) => sendEmail(user.email, message)
const smsNotifier   = (user, message) => sendSMS(user.phone, message)
const pushNotifier  = (user, message) => sendPushNotification(user.deviceToken, message)

// Adding Slack notifications:
const slackNotifier = (user, message) => sendSlackDM(user.slackId, message)
// sendNotification never changes.
```

```text
The composed version does not know what a "notification" is.
It knows: "a notifier is a function that takes a user and a message."
Any function with that signature can be a notifier.

The extension path: write the new function, pass it to sendNotification.
No modification of existing code required.
```

## What to extend vs what to replace

Not all "adding features" is extension. Sometimes the right move is to replace.

```text
EXTEND when:
  The existing code is correct and tested.
  The new behaviour is a variation on what exists, not a contradiction.
  Existing callers should continue to work unchanged.
  The existing structure can accommodate the new case without distortion.

REPLACE when:
  The existing code has a fundamental design flaw that the extension would perpetuate.
  The new requirement contradicts an assumption baked into the existing code.
  The extension would make the code harder to understand than a rewrite.

The danger of always extending: adding variations to a broken foundation makes a more complex broken foundation. Sometimes the responsible decision is to stop extending and redesign.
The danger of always replacing: rewriting working code introduces bugs and discards the implicit knowledge encoded in the existing implementation.

The signal: if you find yourself working around the existing code rather than with it,
consider redesign. If you find yourself adding naturally, extend.
```

**SE lens:** The most underappreciated cost of systems that are closed to extension (requiring modification for every new feature) is test fragility. Every modification to working code means existing tests must re-pass. In large systems, a modification to a shared function can cascade: 200 tests re-run, 12 fail, each failure requires investigation to determine if it is a regression or a test that needed updating. This is "fear of change" — developers avoid touching things because the blast radius of any change is unknown. Designing for extension reduces blast radius by keeping each new variation isolated from existing code.

**Common mistakes:**
- Extending a function that is already doing too much — adding a fourth elif to a function that already has three is compounding the problem. Extract first, then extend.
- Creating extension points for hypothetical variations — the extension pattern (registries, composition) has a cost: indirection. Only introduce it when the variation has already happened once and is likely to happen again. One case = switch is fine. Three cases = consider the pattern.
- Modifying tests to pass a failing extension — the test failure is telling you something. Do not change the test; understand what the existing behaviour guarantee is and whether the extension preserves it.

**Debug tip:** When extending a system breaks an existing test, the break reveals a hidden assumption in the existing code. Read the failing test as a specification: it says what the old code guaranteed. Your extension either violates that guarantee (the test is catching a real regression) or the test was over-specified (the test was testing implementation rather than contract). Determine which before deciding whether to fix the extension or update the test.

## Challenge: extend_validator

Extend this validation system to support a new `minLength` rule, without modifying `validate()` itself.

```challenge
const VALIDATORS = {
  required: (value, _param) => value !== null && value !== undefined && value !== '',
  maxLength: (value, maxLen) => typeof value === 'string' && value.length <= maxLen,
  // Add minLength here
}

function validate(value, rules) {
  // rules: [{ type: 'required'|'maxLength'|'minLength', param: any }]
  for (const rule of rules) {
    const validatorFn = VALIDATORS[rule.type]
    if (!validatorFn) throw new Error(`Unknown rule: ${rule.type}`)
    if (!validatorFn(value, rule.param)) return { valid: false, rule: rule.type }
  }
  return { valid: true }
}
```

```test
const r1 = validate('hello', [{ type: 'required' }, { type: 'minLength', param: 3 }])
assert r1.valid === true
const r2 = validate('hi', [{ type: 'minLength', param: 5 }])
assert r2.valid === false && r2.rule === 'minLength'
const r3 = validate('hello world', [{ type: 'maxLength', param: 5 }])
assert r3.valid === false && r3.rule === 'maxLength'
const r4 = validate('', [{ type: 'required' }])
assert r4.valid === false && r4.rule === 'required'
const r5 = validate('exact', [{ type: 'minLength', param: 5 }, { type: 'maxLength', param: 5 }])
assert r5.valid === true
```
