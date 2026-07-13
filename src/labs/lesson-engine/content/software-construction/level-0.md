---
series: software-construction
level: 0
title: From Script to Program
lang: javascript
---

# From Script to Program

Every working developer has a script they're embarrassed by. It started small — twenty lines, one task, did the job. Then it grew. Features were added at the bottom, then the top, then the middle. Now it's four hundred lines, nothing is named well, changing one thing breaks another, and nobody wants to touch it.

That script is not a program. A script is code that does a task. A program is code that can be understood, changed, and extended without fear. The difference is not size. The difference is structure — a deliberate organisation of responsibilities that keeps each part of the code honest about what it does.

By the end of this lesson you will understand what a program is that a script is not, be able to identify where responsibilities have collapsed into each other, and know how to begin separating them.

## What a script is

A script runs top to bottom. It is designed to be written once and run. It does not need to be changed, because it has one task and no variations.

```javascript
// A script: fetch today's weather, print it
const city = 'London'
const response = await fetch(`https://api.weather.com?city=${city}`)
const data = await response.json()
console.log(`${city}: ${data.temperature}°C, ${data.condition}`)
```

```text
This is a valid script. It does exactly one thing, it is clear, and it will
never need to grow. Scripts are not bad. They are correct for tasks that
genuinely do not change.

A script becomes a problem the moment someone asks:
  "Can it also do Paris?"
  "Can it email the result?"
  "Can it run on a schedule?"
  "Can it handle the API being down?"

Each new requirement reveals that the script was never structured to accept change.
```

## What structure is, and why it exists

Structure is the answer to one question: **what is this piece of code responsible for?**

Every piece of code has at least one responsibility — a thing it is the authority on. Structure is the discipline of keeping responsibilities from bleeding into each other.

```javascript
// Unstructured: three responsibilities in one place
async function run() {
  // 1. Configuration (where to get data)
  const city = process.env.CITY || 'London'
  const apiKey = process.env.WEATHER_API_KEY
  const url = `https://api.weather.com?city=${city}&key=${apiKey}`

  // 2. Data fetching (network I/O)
  const response = await fetch(url)
  if (!response.ok) {
    console.error('API call failed:', response.status)
    process.exit(1)
  }
  const data = await response.json()

  // 3. Formatting and output (presentation)
  const degrees = Math.round(data.temperature)
  const label = degrees > 20 ? 'warm' : 'cool'
  console.log(`${city}: ${degrees}°C — ${label} today`)
}
```

```text
Three responsibilities have collapsed into one function:
  1. Configuration  — knows where credentials live and what city to use
  2. Fetching       — knows how to talk to the network and handle failures
  3. Presentation   — knows how to format and display the result

Symptoms:
  • You cannot test the formatting logic without hitting the real network.
  • You cannot change the API URL without reading the entire function.
  • You cannot reuse the fetching logic in another part of the program.
  • Adding a "retry on failure" feature touches the same function as formatting.

None of these are true because the code is long. They are true because the
responsibilities are not separated.
```

## Separating responsibilities

Separated code is not longer code. It is the same work distributed across pieces that each know exactly one thing.

```javascript
// Configuration: knows where settings come from
function getConfig() {
  return {
    city: process.env.CITY || 'London',
    apiKey: process.env.WEATHER_API_KEY,
  }
}

// Fetching: knows how to get weather data, nothing else
async function fetchWeather(city, apiKey) {
  const url = `https://api.weather.com?city=${city}&key=${apiKey}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`API failed: ${response.status}`)
  return response.json()
}

// Formatting: knows how to turn data into a readable string
function formatWeather(city, data) {
  const degrees = Math.round(data.temperature)
  const label = degrees > 20 ? 'warm' : 'cool'
  return `${city}: ${degrees}°C — ${label} today`
}

// Entry point: orchestrates, owns nothing itself
async function run() {
  const config = getConfig()
  const data = await fetchWeather(config.city, config.apiKey)
  console.log(formatWeather(config.city, data))
}
```

```text
What changed:

  getConfig()     — test it by setting environment variables. No network needed.
  fetchWeather()  — test it by mocking fetch(). No formatting logic to worry about.
  formatWeather() — test it with plain objects. No network, no environment.
  run()           — thin. It connects the pieces. It does no real work itself.

The responsibilities are now separable:
  • "Can it also do Paris?" — change getConfig().
  • "Can it retry on failure?" — change fetchWeather() only.
  • "Can it output JSON instead?" — add formatWeatherJson() alongside formatWeather().
  • "Can it email the result?" — the formatted string is already separate. Pass it anywhere.

Same behaviour. Dramatically different ability to change.
```

**CS lens:** Separation of responsibilities is an application of the **single responsibility principle** — each module, function, or class should have exactly one reason to change. This is a special case of the more general principle of **high cohesion**: the elements of a module should all relate to a single, well-defined purpose. A function that fetches and formats has two reasons to change: if the API changes, and if the display format changes. These are independent axes of change. Keeping them separate means a change on one axis does not risk breaking the other.

**SE lens:** The cost of poor structure compounds over time, not over lines. A one-hundred-line script with three collapsed responsibilities is manageable. A ten-thousand-line codebase with those same collapses everywhere is why senior engineers get paid to rewrite things that technically work. The discipline of asking "what is this responsible for?" before writing a function costs thirty seconds per function and saves hours per feature.

**Common mistakes:**
- Thinking "I'll separate it later" — the cost of separation increases as more code depends on the original structure. Separation is cheapest at the moment of writing.
- Separating by technology instead of responsibility — "all the database code here, all the UI code there" creates files that still contain mixed responsibilities within them. Separate by what changes together, not by what looks similar.
- Over-separating — a two-line helper does not need its own module. The question is not "can this be separate?" but "does separating this make the system clearer and more changeable?"

**Debug tip:** When you cannot write a test for a piece of logic without setting up unrelated infrastructure (a database, a network, a file system), that logic has collapsed with something it should not know about. The inability to test in isolation is the diagnostic symptom of mixed responsibilities.

## Challenge: identify_responsibilities

Read the following program and identify its distinct responsibilities.

```challenge
// An e-commerce order processor
const responsibilities = {
  // Name the 4 distinct responsibilities collapsed in this function.
  // Each should be a short phrase (e.g. "reading user input")
  responsibility1: '',
  responsibility2: '',
  responsibility3: '',
  responsibility4: '',
}

/*
async function processOrder(orderId) {
  // Read order from database
  const db = await connectToDatabase(process.env.DB_URL)
  const order = await db.query(`SELECT * FROM orders WHERE id = ${orderId}`)

  // Apply discount rules
  let total = order.subtotal
  if (order.customer.loyaltyYears > 2) total *= 0.9
  if (total > 100) total -= 10

  // Charge the customer
  const stripe = new Stripe(process.env.STRIPE_KEY)
  const charge = await stripe.charges.create({ amount: total, currency: 'usd' })

  // Send confirmation email
  await sendEmail(order.customer.email, `Your order ${orderId} total: $${total}`)

  return { orderId, total, chargeId: charge.id }
}
*/
```

```test
assert responsibilities.responsibility1 !== '' && responsibilities.responsibility2 !== ''
assert responsibilities.responsibility3 !== '' && responsibilities.responsibility4 !== ''
const all = Object.values(responsibilities).map(r => r.toLowerCase()).join(' ')
assert all.includes('data') || all.includes('database') || all.includes('storage') || all.includes('persist')
assert all.includes('discount') || all.includes('pricing') || all.includes('business') || all.includes('rule') || all.includes('calculat')
assert all.includes('payment') || all.includes('charge') || all.includes('stripe') || all.includes('billing')
assert all.includes('email') || all.includes('notif') || all.includes('message') || all.includes('communicat')
```
