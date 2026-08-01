# SE Masterclass — LAB-66 — Analytics Engine

**Language: Python (SQLite)** — the capstone of Phase 5.

**Prerequisites:** LAB-58 (denormalization for read performance — this lab's whole domain), LAB-56 (`GROUP BY` aggregation builds on JOIN/query fundamentals), LAB-65 (pre-aggregation is caching applied to computed SUMMARIES instead of raw records).

**What this lab adds:**
- `GROUP BY` aggregation: turning many rows into summarized answers
- Time-windowed aggregation: "orders per hour," not just "orders total"
- OLAP vs. OLTP: why analytics queries need a DIFFERENT data shape than transactional queries
- Percentiles (p50/p95/p99): a single average often HIDES the story; percentiles reveal it

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `SELECT AVG(response_time) FROM requests` — if 99% of requests take 50ms but 1% take 5000ms, does the AVERAGE reflect what most users experience?
> 2. OLTP (transactional) systems optimize for many small, fast reads/writes of individual records. OLAP (analytical) systems optimize for scanning and aggregating MILLIONS of records at once. Why might the SAME schema be bad for both?
> 3. "Orders per hour, for the last 24 hours" — what makes this a WINDOWED aggregation, rather than just a single `GROUP BY`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python analytics.py` prints:

```
=== Basic Aggregation: GROUP BY ===
total revenue by category:
  Electronics: $4520.00
  Books: $890.00
  Clothing: $1230.00

=== Time-Windowed Aggregation ===
orders per hour (last 4 hours):
  09:00: 12 orders
  10:00: 8 orders
  11:00: 15 orders
  12:00: 21 orders

=== OLAP: Pre-Aggregated Summary Table ===
raw query (scan all 50,000 orders): 89ms
pre-aggregated query (daily_revenue summary table): 1ms
  ← the OLAP pattern: pay the aggregation cost ONCE, query the summary MANY times

=== Percentiles: The Average Lies ===
response times: mostly ~50ms, but a few 5000ms outliers
average response time: 99.5ms   ← looks almost fine!
p50 (median): 51ms              ← what MOST users actually experience
p95: 55ms                       ← still fine for 95% of users
p99: 4998ms                     ← the actual problem, invisible in the average
```

---

### Concept: GROUP BY — Turning Many Rows Into a Summary

**What it is:** `GROUP BY` collapses MULTIPLE rows sharing a common value into ONE summary row, combined with an aggregate function (`SUM`, `COUNT`, `AVG`, `MAX`, `MIN`).

---

## Step 1 — Basic GROUP BY Aggregation

```python
# analytics.py
import sqlite3
import random
import time

conn = sqlite3.connect(':memory:')
cursor = conn.cursor()

cursor.execute('CREATE TABLE orders (id INTEGER PRIMARY KEY, category TEXT, amount REAL, created_at TEXT)')

categories = ['Electronics', 'Books', 'Clothing']
random.seed(1)
for i in range(200):
    cat = random.choice(categories)
    amount = round(random.uniform(10, 200), 2)
    cursor.execute('INSERT INTO orders (category, amount, created_at) VALUES (?, ?, ?)', (cat, amount, '2026-01-01'))
conn.commit()

print("=== Basic Aggregation: GROUP BY ===")
print("total revenue by category:")
for category, total in cursor.execute('''
    SELECT category, SUM(amount) FROM orders GROUP BY category ORDER BY category
'''):
    print(f"  {category}: ${total:.2f}")
```

### SAVE AND TRY

```bash
python analytics.py
```

**Expected (exact numbers vary with the random seed, but the SHAPE holds):**
```
=== Basic Aggregation: GROUP BY ===
total revenue by category:
  Books: $6234.12
  Clothing: $6891.45
  Electronics: $7102.33
```

**Confirm `GROUP BY` collapsed MANY rows into FEW:** The `orders` table has 200 individual rows, but the result has exactly 3 (one per DISTINCT category) — each summary row REPRESENTS every order in that category, combined via `SUM`. This is LAB-53's term-frequency aggregation pattern (`Map<key, count>`, built by hand there) — `GROUP BY` is the SAME idea, as a declarative SQL operation instead of a manual loop.

---

## Step 2 — Time-Windowed Aggregation

```python
cursor.execute('DELETE FROM orders')
hours = ['09', '10', '11', '12']
counts = {'09': 12, '10': 8, '11': 15, '12': 21}
for hour, count in counts.items():
    for _ in range(count):
        cursor.execute(
            "INSERT INTO orders (category, amount, created_at) VALUES ('Electronics', 50, ?)",
            (f'2026-01-01 {hour}:{random.randint(0,59):02d}:00',)
        )
conn.commit()

print("\n=== Time-Windowed Aggregation ===")
print("orders per hour (last 4 hours):")
for row in cursor.execute('''
    SELECT strftime('%H', created_at) as hour, COUNT(*) as order_count
    FROM orders
    GROUP BY hour
    ORDER BY hour
'''):
    print(f"  {row[0]}:00: {row[1]} orders")
```

### SAVE AND TRY

```bash
python analytics.py
```

**Expected:**
```
=== Time-Windowed Aggregation ===
orders per hour (last 4 hours):
  09:00: 12 orders
  10:00: 8 orders
  11:00: 15 orders
  12:00: 21 orders
```

**Confirm the WINDOW is the grouping KEY, not just an extra filter:** `strftime('%H', created_at)` extracts just the HOUR from each timestamp, and `GROUP BY hour` collapses all orders sharing the SAME hour into one summary — this is WHY it's called "windowed": each output row represents a TIME SLICE (a window), not the whole dataset at once. Change the `strftime` format to `%Y-%m-%d` and the SAME query becomes "orders per DAY" instead — the windowing GRANULARITY is entirely controlled by how finely you bucket the timestamp.

---

### Concept: OLAP vs. OLTP

**What it is:** **OLTP** (Online Transaction Processing) systems — LAB-56–59's territory — optimize for many SMALL, FAST operations on INDIVIDUAL records (one order, one customer). **OLAP** (Online Analytical Processing) systems optimize for SCANNING and AGGREGATING MASSIVE numbers of records at once (millions of orders, summarized). The SAME schema optimized for one is often BADLY suited to the other.

---

## Step 3 — Pre-Aggregation: The OLAP Pattern

```python
cursor.execute('DELETE FROM orders')
for i in range(50_000):
    cat = random.choice(categories)
    day = f'2026-01-{(i % 28) + 1:02d}'
    cursor.execute('INSERT INTO orders (category, amount, created_at) VALUES (?, ?, ?)', (cat, round(random.uniform(10, 200), 2), day))
conn.commit()

print("\n=== OLAP: Pre-Aggregated Summary Table ===")
start = time.perf_counter()
cursor.execute('SELECT created_at, SUM(amount) FROM orders GROUP BY created_at').fetchall()
raw_time = (time.perf_counter() - start) * 1000
print(f"raw query (scan all 50,000 orders): {raw_time:.0f}ms")

cursor.execute('CREATE TABLE daily_revenue AS SELECT created_at as day, SUM(amount) as total FROM orders GROUP BY created_at')

start = time.perf_counter()
cursor.execute('SELECT * FROM daily_revenue').fetchall()
pre_agg_time = (time.perf_counter() - start) * 1000
print(f"pre-aggregated query (daily_revenue summary table): {pre_agg_time:.0f}ms")
print("  ← the OLAP pattern: pay the aggregation cost ONCE, query the summary MANY times")
```

### SAVE AND TRY

```bash
python analytics.py
```

**Expected (shape — the pre-aggregated query should be dramatically faster):**
```
=== OLAP: Pre-Aggregated Summary Table ===
raw query (scan all 50,000 orders): 89ms
pre-aggregated query (daily_revenue summary table): 1ms
  ← the OLAP pattern: pay the aggregation cost ONCE, query the summary MANY times
```

**Confirm this is LAB-58's denormalization Step 4, at a larger scale:** `daily_revenue` is a DELIBERATELY redundant, precomputed table — exactly LAB-58's `department_summary` — trading some staleness risk (it must be REFRESHED periodically as new orders arrive) for dramatically cheaper reads. Real analytics/data-warehouse systems (a "star schema," materialized views, dedicated OLAP databases like ClickHouse) are BUILT around this exact "aggregate once, query the summary many times" philosophy, because a live production dashboard querying MILLIONS of raw transactional rows on every page load would be prohibitively slow AND would compete for resources with the actual transactional (OLTP) workload.

---

### Concept: Percentiles — What the Average Hides

**What it is:** An AVERAGE can be badly misleading when a dataset has OUTLIERS — a few extreme values pull the average toward them, while telling you NOTHING about what MOST individual data points actually look like. **Percentiles** (p50 = median, p95, p99) answer "what value does X% of the data fall AT OR BELOW" — revealing the SHAPE of the distribution, not just one summary number.

---

## Step 4 — Percentiles Reveal What Averages Hide

```python
random.seed(2)
response_times = [random.uniform(45, 55) for _ in range(990)] + [random.uniform(4500, 5500) for _ in range(10)]
random.shuffle(response_times)

def percentile(data, p):
    sorted_data = sorted(data)
    index = int(len(sorted_data) * p / 100)
    return sorted_data[min(index, len(sorted_data) - 1)]

print("\n=== Percentiles: The Average Lies ===")
print("response times: mostly ~50ms, but a few 5000ms outliers")
avg = sum(response_times) / len(response_times)
print(f"average response time: {avg:.1f}ms   ← looks almost fine!")
print(f"p50 (median): {percentile(response_times, 50):.0f}ms              ← what MOST users actually experience")
print(f"p95: {percentile(response_times, 95):.0f}ms                       ← still fine for 95% of users")
print(f"p99: {percentile(response_times, 99):.0f}ms                       ← the actual problem, invisible in the average")
```

### SAVE AND TRY

```bash
python analytics.py
```

**Expected (shape — exact numbers vary with the random seed):**
```
=== Percentiles: The Average Lies ===
response times: mostly ~50ms, but a few 5000ms outliers
average response time: 99.5ms   ← looks almost fine!
p50 (median): 51ms              ← what MOST users actually experience
p95: 55ms                       ← still fine for 95% of users
p99: 4998ms                     ← the actual problem, invisible in the average
```

**Confirm the average GENUINELY hid the problem:** `99.5ms` LOOKS like a healthy, unremarkable response time — but `p99: 4998ms` reveals that the SLOWEST 1% of requests take nearly 100x longer, a REAL, user-visible performance problem that the AVERAGE completely masked. This is exactly why real monitoring systems (LAB-8.4 in engineering-drills, on Load Testing) report p50/p95/p99 instead of (or alongside) averages — the AVERAGE answers "what's typical overall," while percentiles answer "what does the WORST-affected fraction of users actually experience," which is usually the more actionable question.

---

## 🎯 Challenge: A Rolling Analytics Dashboard

**You know:** All four techniques from this lab — `GROUP BY`, time windows, pre-aggregation, and percentiles — combine naturally into ONE dashboard query set.

**Task:** Sketch (in comments or code) a small "dashboard" function that reports: total revenue today, orders per hour for the last 4 hours, and p95 order amount — using the PRE-AGGREGATED table where possible.

<details>
<summary>▶ Show Solution</summary>

```python
def dashboard_summary(cursor):
    today_revenue = cursor.execute(
        "SELECT SUM(total) FROM daily_revenue WHERE day = '2026-01-01'"
    ).fetchone()[0]

    hourly = cursor.execute('''
        SELECT strftime('%H', created_at) as hour, COUNT(*) FROM orders
        WHERE created_at >= '2026-01-01 09:00:00'
        GROUP BY hour ORDER BY hour
    ''').fetchall()

    amounts = [row[0] for row in cursor.execute('SELECT amount FROM orders').fetchall()]
    p95_amount = percentile(amounts, 95)

    return {
        'today_revenue': today_revenue,
        'hourly_orders': hourly,
        'p95_order_amount': p95_amount,
    }
```

**Key insight:** A real production dashboard is EXACTLY this — a handful of QUERIES, each using whichever technique fits the QUESTION being answered: `GROUP BY` for categorical breakdowns, time-windowing for trends over time, pre-aggregated tables for anything queried FREQUENTLY (avoiding re-scanning raw data on every page load), and percentiles anywhere an AVERAGE would hide the real story (latency, response times, load times). None of these techniques is "the" analytics technique — a good analytics engine COMBINES them, choosing the right tool per question, exactly like LAB-60's decision framework chose the right DATABASE TYPE per problem shape.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `GROUP BY` aggregation | Every BI dashboard, every analytics query ever written |
| Time-windowed aggregation | Grafana/Datadog time-series graphs, "requests per minute" charts |
| Pre-aggregated OLAP tables | Data warehouses (Snowflake, BigQuery), materialized views |
| Percentiles | Every serious performance monitoring system — p50/p95/p99 latency dashboards |

**Phase 5 (Databases) complete.** You've now covered the full arc: modeling (LAB-56), indexing (LAB-57), normalization (LAB-58), transactions (LAB-59), NoSQL trade-offs (LAB-60), consistency models (LAB-61), and four real systems built on that foundation — an ORM, a query engine, a migration system, a caching layer, and this analytics engine.

---

## Final Check

| Feature | How to verify |
|---|---|
| `GROUP BY` correctly aggregates revenue by category | Step 1 |
| Time-windowed aggregation correctly buckets orders by hour | Step 2 |
| A pre-aggregated summary table answers a query dramatically faster than a raw scan | Step 3 |
| Percentiles reveal an outlier problem the average conceals | Step 4 |
| A combined dashboard query uses the right technique for each question | Challenge |
| You can explain, without notes, why OLTP and OLAP often need different schemas | Concept box |

---

## Quick Check Answers

**1. Does the average reflect what most users experience, with 99% at 50ms and 1% at 5000ms?**

No — demonstrated directly in Step 4: the average (`99.5ms`) looks like a mildly-elevated but unremarkable number, completely failing to reveal that 1% of requests take ALMOST 100X LONGER than typical. `p50` (`51ms`) much more accurately reflects "what a typical user experiences," while `p99` (`4998ms`) reveals the actual outlier problem — the average BLENDS both groups together into one misleading number.

**2. Why might the same schema be bad for both OLTP and OLAP?**

OLTP wants to update/read ONE record FAST (LAB-57's indexed point-lookups, LAB-59's transactional guarantees on individual rows) — a highly NORMALIZED schema (LAB-58) with many small tables is ideal for this. OLAP wants to SCAN AND AGGREGATE MILLIONS of records at once — a normalized schema requires expensive JOINs across many tables to reconstruct a full picture, while a DENORMALIZED, pre-aggregated schema (Step 3's `daily_revenue`) avoids that entirely. Optimizing for one access pattern often actively HURTS the other, which is why large systems frequently maintain SEPARATE OLTP and OLAP data stores, synchronized periodically, rather than forcing one schema to serve both purposes well.

**3. What makes "orders per hour, last 24 hours" a windowed aggregation, not just GROUP BY?**

The GROUPING KEY itself is derived from TIME, sliced into discrete buckets (hours, in Step 2's example) — each output row represents a specific TIME WINDOW, not just a categorical value like "Electronics" or "Books." The technique underneath (`GROUP BY`, Step 1) is identical; what makes it "windowed" is specifically bucketing by TIME, which is what makes trend-over-time questions ("is traffic increasing?", "what hour had the most orders?") answerable in a way flat categorical grouping alone cannot provide.

---

*Phase 5 (Databases) complete. Next: [Phase 6 — Graphics & Simulation](../../phase-06-graphics-simulation/README.md), starting with [LAB-67 — Vectors](../../phase-06-graphics-simulation/module-01-math/LAB-67-vectors.md)*
