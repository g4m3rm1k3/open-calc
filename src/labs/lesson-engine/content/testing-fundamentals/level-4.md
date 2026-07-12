---
series: testing-fundamentals
level: 4
title: Testing Fundamentals — Putting It Together
lang: javascript
---

# Testing Fundamentals — Putting It Together

The four skills you have learned — understanding what tests provide, writing unit tests with the AAA pattern, using test doubles effectively, and testing async and integration code — form a complete testing practice. This capstone lesson integrates them into a realistic scenario: building a test suite for a service that has real dependencies, async behaviour, and needs to be testable without those dependencies.

The scenario: a `PaymentService` that processes payments, applies discount codes, records transactions, and sends confirmation emails. You will write unit tests for the core logic, use test doubles for the database and email service, and verify the async behaviour.

## The system under test

```javascript
// payment-service.js — the code we need to test

const DISCOUNT_CODES = {
  SAVE10: { type: 'percentage', value: 0.10 },
  FLAT20: { type: 'flat',       value: 20   },
}

class PaymentService {
  constructor(transactionRepository, emailService, { now = Date.now } = {}) {
    this.transactionRepository = transactionRepository
    this.emailService = emailService
    this.now = now   // injected clock for testability
  }

  async processPayment(order, discountCode = null) {
    // 1. Validate
    if (!order || order.amount <= 0) {
      throw new Error('Invalid order: amount must be positive')
    }

    // 2. Apply discount
    const discount = this.#applyDiscount(order.amount, discountCode)
    const chargedAmount = order.amount - discount

    // 3. Record transaction
    const transaction = await this.transactionRepository.insert({
      orderId:      order.id,
      originalAmount: order.amount,
      discount,
      chargedAmount,
      status:       'completed',
      processedAt:  new Date(this.now()).toISOString(),
    })

    // 4. Send confirmation
    await this.emailService.sendConfirmation({
      to:      order.customerEmail,
      orderId: order.id,
      amount:  chargedAmount,
    })

    return transaction
  }

  #applyDiscount(amount, discountCode) {
    if (!discountCode) return 0
    const config = DISCOUNT_CODES[discountCode]
    if (!config) throw new Error(`Unknown discount code: ${discountCode}`)
    if (config.type === 'percentage') return Math.round(amount * config.value * 100) / 100
    if (config.type === 'flat') return Math.min(config.value, amount)
    return 0
  }
}
```

## Unit tests: core logic

```javascript
// Test the private discount logic through the public interface
// (No database, no email — pure logic tests)

const FIXED_TIME = 1700000000000
const fixedClock = () => FIXED_TIME

function makeOrder(overrides = {}) {
  return {
    id: 'order-1',
    amount: 100,
    customerEmail: 'alice@example.com',
    ...overrides,
  }
}

function makeTestService(transactionRepoOverrides = {}, emailServiceOverrides = {}) {
  const fakeTransactionRepo = {
    insert: async (data) => ({ id: 'txn-1', ...data }),
    ...transactionRepoOverrides,
  }
  const fakeEmailService = {
    sendConfirmation: async () => {},
    ...emailServiceOverrides,
  }
  return new PaymentService(fakeTransactionRepo, fakeEmailService, { now: fixedClock })
}

// Test: no discount
async function test_processPayment_noDiscount_chargesFullAmount() {
  const service = makeTestService()
  const txn = await service.processPayment(makeOrder({ amount: 150 }))
  assert(txn.chargedAmount === 150)
  assert(txn.discount === 0)
}

// Test: percentage discount
async function test_processPayment_percentageDiscount_appliesCorrectly() {
  const service = makeTestService()
  const txn = await service.processPayment(makeOrder({ amount: 200 }), 'SAVE10')
  assert(txn.chargedAmount === 180)   // 200 - (200 * 0.10)
  assert(txn.discount === 20)
}

// Test: flat discount larger than amount
async function test_processPayment_flatDiscountLargerThanAmount_doesNotGoNegative() {
  const service = makeTestService()
  const txn = await service.processPayment(makeOrder({ amount: 10 }), 'FLAT20')
  assert(txn.chargedAmount === 0)   // 10 - min(20, 10) = 0
  assert(txn.discount === 10)
}

// Test: invalid order throws
async function test_processPayment_invalidAmount_throwsError() {
  const service = makeTestService()
  let threw = false
  try {
    await service.processPayment(makeOrder({ amount: 0 }))
  } catch (e) {
    threw = true
    assert(e.message === 'Invalid order: amount must be positive')
  }
  assert(threw)
}

// Test: unknown discount code throws
async function test_processPayment_unknownDiscountCode_throwsError() {
  const service = makeTestService()
  let threw = false
  try {
    await service.processPayment(makeOrder(), 'INVALID_CODE')
  } catch (e) {
    threw = true
    assert(e.message.includes('Unknown discount code'))
  }
  assert(threw)
}
```

## Integration tests: verifying side effects

```javascript
// Test that the email service is called with the correct arguments
async function test_processPayment_sendsConfirmationEmail() {
  const emailCalls = []
  const fakeEmail = {
    sendConfirmation: async (data) => emailCalls.push(data),
  }
  const service = makeTestService({}, fakeEmail)

  await service.processPayment(makeOrder({ amount: 100, customerEmail: 'bob@example.com' }))

  assert(emailCalls.length === 1)
  assert(emailCalls[0].to === 'bob@example.com')
  assert(emailCalls[0].amount === 100)
}

// Test that the transaction is recorded with the correct timestamp
async function test_processPayment_recordsTransactionWithFixedTime() {
  const insertCalls = []
  const fakeRepo = {
    insert: async (data) => { insertCalls.push(data); return { id: 'txn-1', ...data } },
  }
  const service = makeTestService(fakeRepo)

  await service.processPayment(makeOrder())

  assert(insertCalls.length === 1)
  assert(insertCalls[0].processedAt === new Date(FIXED_TIME).toISOString())
  assert(insertCalls[0].status === 'completed')
}

// Test: if email fails, the error propagates
async function test_processPayment_emailFailure_propagatesError() {
  const failingEmail = {
    sendConfirmation: async () => { throw new Error('Email service unavailable') },
  }
  const service = makeTestService({}, failingEmail)

  let threw = false
  try {
    await service.processPayment(makeOrder())
  } catch (e) {
    threw = true
    assert(e.message === 'Email service unavailable')
  }
  assert(threw)
}
```

## What this test suite proves

```text
WHAT THESE TESTS VERIFY:
  ✓ Discount logic: percentage, flat, no discount, flat > amount
  ✓ Validation: amount <= 0 throws, unknown code throws
  ✓ Transaction recording: correct fields, correct timestamp
  ✓ Email: called once with correct arguments
  ✓ Error propagation: email failure reaches the caller

WHAT THESE TESTS DO NOT VERIFY:
  ✗ Real database persistence (need a real database integration test for that)
  ✗ Real email delivery (need an end-to-end test for that)
  ✗ Concurrent payment handling (need a separate concurrency test for that)
  ✗ All possible discount code combinations (need property-based testing for exhaustive checking)

TESTING CONFIDENCE LEVEL:
  This suite gives HIGH confidence in the business logic and LOW confidence
  in the infrastructure (database schema, email provider configuration).
  A complete test suite pairs these unit tests with a smaller number of
  integration tests that use a real test database and a stubbed email API.
```

**CS lens:** The test suite demonstrates the **substitution property** of good design: because `transactionRepository`, `emailService`, and `now` are injected, they can be replaced with any object that satisfies the same interface. The tests exploit this by injecting objects that record calls and return controlled values. The production code and the test code use the same interface but different implementations — this is polymorphism applied to testing.

**SE lens:** The factory function `makeTestService()` demonstrates a practical solution to the "test setup tax": it provides a default valid service with overridable parts. Each test only specifies what is different from the default. This keeps tests focused: `test_processPayment_emailFailure_propagatesError` only sets up the failing email — everything else uses the default. The intent of each test is immediately visible from its setup.

## Challenge: payment_service_tests

Implement the PaymentService and verify it passes a comprehensive test suite.

```challenge
function createPaymentService(transactionRepo, emailService, options = {}) {
  // options.now: function that returns current timestamp (defaults to Date.now)
  // options.discountCodes: object mapping code → { type, value } (defaults to SAVE10/FLAT20)
  //
  // Returns an object with:
  //   processPayment(order, discountCode = null):
  //     Validates order.amount > 0 (throws Error if not)
  //     Applies discount if code is provided (throws if code unknown)
  //     Calls transactionRepo.insert({ orderId, originalAmount, discount, chargedAmount, status, processedAt })
  //     Calls emailService.sendConfirmation({ to, orderId, amount })
  //     Returns the result of transactionRepo.insert()

  const discountCodes = options.discountCodes ?? {
    SAVE10: { type: 'percentage', value: 0.10 },
    FLAT20: { type: 'flat',       value: 20   },
  }
  const now = options.now ?? Date.now
}
```

```test
const FIXED_TIME = 1000000000000
const calls = { insert: [], email: [] }

const repo  = { insert: async d => { calls.insert.push(d); return { id: 't1', ...d } } }
const email = { sendConfirmation: async d => calls.email.push(d) }

const svc = createPaymentService(repo, email, { now: () => FIXED_TIME })

// Basic payment
const order = { id: 'o1', amount: 100, customerEmail: 'c@test.com' }
const txn = await svc.processPayment(order)
assert txn.chargedAmount === 100
assert txn.discount === 0
assert txn.status === 'completed'
assert txn.processedAt === new Date(FIXED_TIME).toISOString()
assert calls.email.length === 1 && calls.email[0].to === 'c@test.com'

// Discount
const txn2 = await svc.processPayment({ id: 'o2', amount: 200, customerEmail: 'c@test.com' }, 'SAVE10')
assert txn2.discount === 20
assert txn2.chargedAmount === 180

// Invalid amount
let threw = false
try { await svc.processPayment({ id: 'o3', amount: -5, customerEmail: 'c@test.com' }) } catch(e) { threw = true }
assert threw

// Unknown code
threw = false
try { await svc.processPayment(order, 'NOPE') } catch(e) { threw = true }
assert threw
```
