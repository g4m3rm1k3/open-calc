---
series: design-patterns
level: 4
title: Design Patterns — Putting It Together
lang: javascript
---

# Design Patterns — Putting It Together

You have covered creational patterns (Factory, Builder, Singleton), structural patterns (Adapter, Decorator, Proxy, Facade), and behavioural patterns (Observer, Strategy, Command, State). This capstone lesson integrates them into a realistic scenario: a plugin-based notification system.

## The design problem

Build a notification system that:
- Supports multiple delivery channels (email, SMS, push)
- Channels can be stacked with decorators (retry, logging, rate-limiting)
- Subscribers can react to notification events (Observer)
- New channel types can be added without modifying existing code (Strategy + Factory)
- Every sent notification is recorded and can be replayed (Command)

## The channel interface and strategies

```javascript
// INTERFACE (structural contract — what every channel must implement):
// { send(notification): Promise<void> }

// STRATEGY: each delivery channel is a concrete strategy
class EmailChannel {
  constructor(emailClient) {
    this._client = emailClient
  }

  async send({ to, subject, body }) {
    await this._client.sendEmail({ to, subject, text: body })
  }
}

class SmsChannel {
  constructor(smsClient) {
    this._client = smsClient
  }

  async send({ to, body }) {
    await this._client.sendSms({ phone: to, message: body.slice(0, 160) })
  }
}

class PushChannel {
  constructor(pushClient) {
    this._client = pushClient
  }

  async send({ deviceToken, title, body }) {
    await this._client.sendPush({ token: deviceToken, title, body })
  }
}
```

## Decorators that stack onto any channel

```javascript
// DECORATOR: retry with exponential backoff
class RetryingChannel {
  constructor(channel, maxRetries = 3) {
    this._channel = channel
    this._maxRetries = maxRetries
  }

  async send(notification) {
    let lastError
    for (let attempt = 0; attempt <= this._maxRetries; attempt++) {
      try {
        return await this._channel.send(notification)
      } catch (err) {
        lastError = err
        if (attempt < this._maxRetries) {
          await delay(1000 * 2 ** attempt)   // 1s, 2s, 4s
        }
      }
    }
    throw lastError
  }
}

// DECORATOR: log every send attempt
class LoggingChannel {
  constructor(channel, logger) {
    this._channel = channel
    this._logger = logger
  }

  async send(notification) {
    const start = Date.now()
    try {
      await this._channel.send(notification)
      this._logger.log({ event: 'notification_sent', ms: Date.now() - start, to: notification.to })
    } catch (err) {
      this._logger.log({ event: 'notification_failed', error: err.message, to: notification.to })
      throw err
    }
  }
}

// DECORATOR: rate-limit sends to a channel
class RateLimitedChannel {
  constructor(channel, maxPerMinute) {
    this._channel = channel
    this._maxPerMinute = maxPerMinute
    this._sends = []
  }

  async send(notification) {
    const now = Date.now()
    this._sends = this._sends.filter(t => now - t < 60_000)

    if (this._sends.length >= this._maxPerMinute) {
      throw new Error(`Rate limit exceeded: ${this._maxPerMinute}/min`)
    }

    this._sends.push(now)
    return this._channel.send(notification)
  }
}
```

## Factory for building configured channels

```javascript
// FACTORY: builds and decorates a channel from a config object
// Removes the complexity of stacking decorators from the call site
const CHANNEL_FACTORIES = {
  email: (config) => new EmailChannel(config.emailClient),
  sms:   (config) => new SmsChannel(config.smsClient),
  push:  (config) => new PushChannel(config.pushClient),
}

function createChannel(type, config) {
  const factory = CHANNEL_FACTORIES[type]
  if (!factory) throw new Error(`Unknown channel type: ${type}`)

  let channel = factory(config)

  if (config.rateLimitPerMin) {
    channel = new RateLimitedChannel(channel, config.rateLimitPerMin)
  }
  if (config.maxRetries) {
    channel = new RetryingChannel(channel, config.maxRetries)
  }
  if (config.logger) {
    channel = new LoggingChannel(channel, config.logger)
  }

  return channel
}
```

## Command for auditable sends

```javascript
// COMMAND: each notification is a Command object — can be queued, replayed, logged
class SendNotificationCommand {
  constructor(channel, notification) {
    this._channel = channel
    this._notification = notification
    this.status = 'pending'   // 'pending' | 'sent' | 'failed'
    this.sentAt = null
    this.error = null
  }

  async execute() {
    try {
      await this._channel.send(this._notification)
      this.status = 'sent'
      this.sentAt = new Date()
    } catch (err) {
      this.status = 'failed'
      this.error = err.message
      throw err
    }
  }

  toRecord() {
    return {
      notification: this._notification,
      status: this.status,
      sentAt: this.sentAt,
      error: this.error,
    }
  }
}
```

## Observer for notification lifecycle events

```javascript
// NOTIFICATION SERVICE: ties everything together
// Uses Observer so external code can react to sent/failed events
class NotificationService extends EventEmitter {
  constructor() {
    super()
    this._channels = new Map()   // name → channel
    this._history = []
  }

  registerChannel(name, channel) {
    this._channels.set(name, channel)
  }

  async send(channelName, notification) {
    const channel = this._channels.get(channelName)
    if (!channel) throw new Error(`Channel not registered: ${channelName}`)

    const command = new SendNotificationCommand(channel, notification)

    try {
      await command.execute()
      this._history.push(command.toRecord())
      this.emit('sent', command.toRecord())   // observers notified
    } catch (err) {
      this._history.push(command.toRecord())
      this.emit('failed', command.toRecord(), err)   // observers notified
      throw err
    }
  }

  getHistory() {
    return [...this._history]
  }
}
```

## Pattern integration trace

```text
A SINGLE NOTIFICATION FLOWS THROUGH:

  1. FACTORY creates the channel stack:
     LoggingChannel(RetryingChannel(EmailChannel(emailClient)))

  2. SERVICE receives .send('email', notification):
     → looks up the channel in the Map
     → creates a SendNotificationCommand (COMMAND pattern)

  3. COMMAND.execute() calls LoggingChannel.send() (outermost DECORATOR):
     → logs the attempt
     → delegates to RetryingChannel.send() (middle DECORATOR):
       → tries EmailChannel.send() (STRATEGY — the concrete algorithm)
       → if it fails: waits and retries up to 3 times
     → logs success or failure

  4. SERVICE updates history and EMITS an event (OBSERVER):
     → 'sent' or 'failed' event fires
     → any subscribed observers (audit logger, metrics, retry dashboard) are called
     → the service doesn't know what the observers do

PATTERN ROLES:
  Strategy  → EmailChannel, SmsChannel, PushChannel — interchangeable algorithms
  Decorator → RetryingChannel, LoggingChannel, RateLimitedChannel — stacked behaviour
  Factory   → createChannel() — hides construction complexity
  Command   → SendNotificationCommand — encapsulates the request; enables history
  Observer  → EventEmitter — loose coupling between service and its consumers
```

**CS lens:** This design demonstrates **orthogonality** — the ability to add new dimensions of behaviour (new channel type, new decorator, new observer) without touching existing code. Adding a PushChannel doesn't change EmailChannel or the Factory (except to register it). Adding a `RateLimitedChannel` decorator doesn't change `RetryingChannel`. Adding an observer for metrics doesn't change the service. Each pattern acts as an isolation boundary, keeping concerns separated. Orthogonality is what makes large codebases maintainable: you can change one thing without causing ripples everywhere else.

**SE lens:** In a production system, each of these layers would be tested independently. Unit tests for each channel (EmailChannel, SmsChannel): does `send` call the client correctly? Unit tests for each decorator (RetryingChannel): does it retry exactly N times on failure? Unit tests for the factory: does `createChannel('email', config)` produce a correctly wrapped channel? Integration test for NotificationService: does it emit events, record history, and call channels? This is the testability benefit of the design patterns: each object has one responsibility, and each responsibility can be tested in isolation with fakes/stubs for its dependencies.

**Common mistakes in pattern-heavy designs:**
- Over-engineering — not every notification system needs all five patterns. Start with `emailChannel.send(notification)`; add patterns when a real problem (retry failures, missing audit trail, new channel types) justifies the complexity.
- Forgetting Observer cleanup in the Service — if the service is destroyed (e.g., during tests or module hot-reload), event listeners from external code that subscribed to it will keep the service alive in memory. Provide a `destroy()` method that removes all listeners.
- Factory that can't be extended — registering channel factories in a module-level `const CHANNEL_FACTORIES = {}` is fine. But if the factory is frozen or uses a switch statement rather than a registry object, external code can't register new types. Use a mutable registry.

## Challenge: createNotificationService

Implement the core notification service.

```challenge
function createNotificationService() {
  // Returns a notification service object with:
  //
  // .registerChannel(name, channel)
  //   — registers a channel under the given name
  //   — channel: object with async send(notification) method
  //
  // .send(channelName, notification)
  //   — async: sends the notification via the named channel
  //   — records the send in history: { channelName, notification, status, sentAt, error }
  //   — emits 'sent' event with the record on success
  //   — emits 'failed' event with (record, error) on failure
  //   — throws the error after recording it (don't swallow errors)
  //
  // .on(event, callback) / .off(event, callback)
  //   — subscribe/unsubscribe to 'sent' and 'failed' events
  //
  // .getHistory()
  //   — returns array of all send records (both successful and failed)
}
```

```test
const service = createNotificationService()
const sentEvents = []
const failedEvents = []

service.on('sent',   (r)    => sentEvents.push(r))
service.on('failed', (r, e) => failedEvents.push({ r, e }))

// Register a mock email channel
let emailCallCount = 0
const emailChannel = {
  async send(notification) {
    emailCallCount++
    if (notification.subject === 'fail') throw new Error('Send failed')
  }
}
service.registerChannel('email', emailChannel)

// Successful send
await service.send('email', { to: 'alice@example.com', subject: 'Hello', body: 'Hi' })
assert emailCallCount === 1
assert sentEvents.length === 1
assert sentEvents[0].status === 'sent'
assert sentEvents[0].channelName === 'email'
assert sentEvents[0].notification.to === 'alice@example.com'

// Failed send
let threw = false
try {
  await service.send('email', { to: 'bob@example.com', subject: 'fail', body: '' })
} catch (e) {
  threw = true
}
assert threw
assert failedEvents.length === 1
assert failedEvents[0].r.status === 'failed'
assert failedEvents[0].e.message === 'Send failed'

// History contains both
const history = service.getHistory()
assert history.length === 2
assert history[0].status === 'sent'
assert history[1].status === 'failed'

// Unknown channel throws
let unknownThrew = false
try { await service.send('sms', {}) } catch (e) { unknownThrew = true }
assert unknownThrew
```
