---
series: oop-design
level: 4
title: OOP Design — Putting It Together
lang: javascript
---

# OOP Design — Putting It Together

The four concepts you have learned — encapsulation and polymorphism, inheritance vs. composition, SOLID principles, and design patterns — form the vocabulary and toolkit of object-oriented design. This capstone lesson integrates them by designing a realistic system from scratch: a notification delivery service.

The design challenge: a system must send notifications through multiple channels (email, SMS, push) to multiple users. Channels are added over time. Notification delivery may fail and needs retry logic. The system must be testable without sending real emails or texts.

## The design problem

```text
NOTIFICATION SERVICE REQUIREMENTS:
  1. Send notifications through: email, SMS, in-app push (more channels will be added)
  2. A notification can be sent to multiple channels simultaneously
  3. If a channel fails, retry up to 3 times before giving up
  4. Log every delivery attempt (success and failure)
  5. In tests: no real emails, no real SMS, no real push
  6. Adding a new channel must not require changing existing code

DESIGN QUESTIONS:
  → Which things should be classes? (SOLID: identify single responsibilities)
  → Which behaviours should be composed vs inherited?
  → Which pattern handles "multiple channels, same interface"?
  → Which pattern handles retry without modifying the channel?
  → Which pattern handles dependency injection for testability?
```

## The design

```text
CLASSES AND THEIR RESPONSIBILITIES:

  EmailChannel, SmsChannel, PushChannel
    → Each owns one channel's delivery logic
    → All implement the same interface: { send(notification) }
    → Pattern: Strategy / Polymorphism (one interface, multiple implementations)
    → OCP: adding SlackChannel doesn't touch Email, Sms, or Push

  RetryingChannel (Decorator)
    → Wraps any channel, adds retry logic
    → Does not care which channel it wraps
    → Pattern: Decorator
    → SRP: retry logic is one responsibility, separate from delivery

  LoggingChannel (Decorator)
    → Wraps any channel, logs attempts
    → Pattern: Decorator
    → SRP: logging is one responsibility

  NotificationService
    → Owns: list of channel instances
    → Knows how to: fan out a notification to all channels
    → Pattern: Observer / Facade
    → DIP: depends on channel interface, not concrete classes

  Notification (data object)
    → { to, subject, body, metadata }
    → Plain data — no behaviour needed
```

## The implementation

```javascript
// The channel interface (implicit — JavaScript duck-typing)
// All channels must implement: async send(notification) → { ok: boolean, error?: string }

class EmailChannel {
  constructor(config) {
    this.apiKey = config.apiKey
    this.from = config.from
  }

  async send(notification) {
    // Real implementation would call an email API
    console.log(`[EMAIL] Sending to ${notification.to}: ${notification.subject}`)
    return { ok: true }
  }
}

class SmsChannel {
  constructor(config) {
    this.accountSid = config.accountSid
    this.authToken = config.authToken
  }

  async send(notification) {
    console.log(`[SMS] Sending to ${notification.to}: ${notification.body}`)
    return { ok: true }
  }
}

// Decorator: adds retry logic around any channel
class RetryingChannel {
  constructor(inner, maxRetries = 3, delayMs = 1000) {
    this.inner = inner
    this.maxRetries = maxRetries
    this.delayMs = delayMs
  }

  async send(notification) {
    let lastError
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.inner.send(notification)
        if (result.ok) return result
        lastError = new Error(result.error ?? 'Channel returned ok: false')
      } catch (err) {
        lastError = err
      }
      if (attempt < this.maxRetries) {
        await new Promise(r => setTimeout(r, this.delayMs * attempt))
      }
    }
    return { ok: false, error: `Failed after ${this.maxRetries} attempts: ${lastError.message}` }
  }
}

// Decorator: adds logging around any channel
class LoggingChannel {
  constructor(inner, logger = console) {
    this.inner = inner
    this.logger = logger
  }

  async send(notification) {
    const channelName = this.inner.constructor.name
    this.logger.log(`[${channelName}] Attempting delivery to ${notification.to}`)
    const result = await this.inner.send(notification)
    if (result.ok) {
      this.logger.log(`[${channelName}] Delivered successfully to ${notification.to}`)
    } else {
      this.logger.error(`[${channelName}] Delivery failed to ${notification.to}: ${result.error}`)
    }
    return result
  }
}

// Fan-out service: sends to all channels
class NotificationService {
  constructor(channels) {
    this.channels = channels   // injected — DIP
  }

  async send(notification) {
    const results = await Promise.allSettled(
      this.channels.map(channel => channel.send(notification))
    )

    return results.map((result, i) => ({
      channel: this.channels[i].constructor.name,
      ok: result.status === 'fulfilled' && result.value.ok,
      error: result.status === 'rejected' ? result.reason.message : result.value?.error,
    }))
  }
}
```

## How this design satisfies the requirements

```text
REQ 1: Send through multiple channels
  → NotificationService.send() fans out to all channels via Promise.allSettled()
  → Each channel is independent; one failure doesn't prevent others from running

REQ 2: Multiple channels simultaneously
  → Promise.allSettled() runs all channels in parallel

REQ 3: Retry logic
  → RetryingChannel wraps any channel and adds retry
  → Applying to email: new LoggingChannel(new RetryingChannel(new EmailChannel(config)))
  → RetryingChannel doesn't know or care that it is wrapping an EmailChannel

REQ 4: Logging
  → LoggingChannel wraps any channel (or any decorator chain)

REQ 5: Testable without real APIs
  → NotificationService accepts channels as constructor arguments (DIP)
  → In tests: inject a FakeChannel that records deliveries
    class FakeChannel {
      deliveries = []
      async send(n) { this.deliveries.push(n); return { ok: true } }
    }

REQ 6: Adding a new channel without changing existing code
  → Implement SlackChannel with send(notification)
  → Instantiate it and add it to the channels array
  → NotificationService, RetryingChannel, LoggingChannel unchanged (OCP)
```

**CS lens:** The decorator stack `new LoggingChannel(new RetryingChannel(new EmailChannel(config)))` is a **function composition** at the object level. Each decorator wraps the interface; the outermost one is what the service calls; the call propagates inward. This is exactly the same structure as `compose(logging, retrying, email)(notification)` in functional style — the pattern is the same, the syntax is different. Both are applications of function composition to build behaviour pipelines.

**SE lens:** The design satisfies all five SOLID principles: SRP (each class has one responsibility), OCP (adding a channel is additive), LSP (all channels are substitutable), ISP (the channel interface is minimal), DIP (service depends on channel interface, not concrete classes). It is not SOLID for SOLID's sake — each principle is satisfied because the design pressure (testability, extensibility) naturally pushed toward it. Design principles are not goals; they are descriptions of designs that are easy to change.

## Challenge: notification_service

Implement the notification service with channel composition.

```challenge
function createNotificationService(channels) {
  // channels: array of objects with { send(notification) } method
  // Returns an object with:
  //   send(notification): sends to all channels in parallel
  //     Returns: Promise<Array<{ channel: string, ok: boolean, error?: string }>>
  //              channel: index (0, 1, 2...) converted to string OR channels[i].name if it exists
  //   addChannel(channel): adds a channel to the service (returns the service for chaining)
  //   channelCount(): returns the number of channels
}
```

```test
const log = []
const makeChannel = (name, shouldFail = false) => ({
  name,
  async send(notification) {
    log.push(`${name}:${notification.to}`)
    if (shouldFail) return { ok: false, error: `${name} failed` }
    return { ok: true }
  }
})

const service = createNotificationService([
  makeChannel('email'),
  makeChannel('sms'),
])

const notification = { to: 'user@example.com', subject: 'Hello', body: 'World' }
const results = await service.send(notification)

assert results.length === 2
assert results.every(r => r.ok)
assert log.includes('email:user@example.com')
assert log.includes('sms:user@example.com')

// Add a failing channel
service.addChannel(makeChannel('push', true))
assert service.channelCount() === 3

const results2 = await service.send({ to: 'other@example.com', subject: 'Test', body: 'Test' })
assert results2.length === 3
assert results2.find(r => r.channel === 'push').ok === false
assert results2.find(r => r.channel === 'push').error.includes('failed')
assert results2.find(r => r.channel === 'email').ok === true
```
