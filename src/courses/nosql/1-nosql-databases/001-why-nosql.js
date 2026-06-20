export default {
  id: "nosql1-001",
  slug: "why-nosql",
  chapter: "nosql-1",
  order: 1,
  title: "Why NoSQL Exists",
  subtitle:
    "The pressures that broke the relational model — and the family of solutions that emerged",
  tags: [
    "NoSQL",
    "CAP theorem",
    "horizontal scaling",
    "document store",
    "key-value",
    "column-family",
    "graph database",
    "eventual consistency",
  ],
  aliases:
    "nosql why nosql cap theorem horizontal scaling eventual consistency document key value column family graph database",

  hook: {
    question:
      "Twitter in 2009 had 10,000 servers and still couldn't handle load. What problem does SQL struggle with that NoSQL was designed to solve?",
    realWorldContext:
      "The early 2000s internet hit a wall. Companies like Amazon, Google, and Facebook had write loads " +
      "that no single relational database server could handle. Adding more CPUs and RAM to one machine " +
      "(vertical scaling) had physical limits and cost millions. The solution was radical: give up some " +
      "of the guarantees that SQL provides — strict schemas, full ACID, complex joins — in exchange " +
      "for the ability to spread data across thousands of commodity servers. " +
      'NoSQL is not "better than SQL" — it\'s a set of tradeoffs. ' +
      "Understanding them is how you choose the right tool.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      "**The scaling wall.** SQL databases scale vertically — you make the one server bigger and faster. This is expensive and has a ceiling. The internet companies needed to scale horizontally — add more servers. But distributing a relational database across many servers is enormously complex. Joins across machines require network round-trips. Transactions across machines require distributed coordination protocols (2PC). These problems are solvable, but expensive.",
      "**The key insight: most data has a natural \"owner.\"** A user's profile, a tweet, a product listing — each of these belongs naturally to one entity. If you stop trying to join across entities and store each entity's data together, you can shard (split) data across servers by entity ID. Each server handles queries for its own shards. No cross-server joins needed.",
      "**The NoSQL family.** NoSQL is not one database — it's a category. The main families: (1) Document stores (MongoDB, Firestore) — store JSON documents; (2) Key-Value stores (Redis, DynamoDB) — fastest possible reads/writes by key; (3) Column-family stores (Cassandra, HBase) — optimized for huge time-series data; (4) Graph databases (Neo4j, Amazon Neptune) — optimized for highly connected data (social graphs, recommendation engines).",
      "**Schema flexibility.** SQL requires you to define your schema before inserting data. NoSQL document stores let you insert documents with any shape. This is useful during rapid development — you can change what you store without running ALTER TABLE migrations. The tradeoff: no enforcement means garbage data can accumulate silently.",
      "**Eventual consistency.** Strong ACID consistency across distributed nodes requires coordination (locks, two-phase commit) that introduces latency. Many NoSQL systems choose availability and partition tolerance over strict consistency: all servers are always writable, changes propagate eventually. You might read stale data for a few seconds. For a social media \"like\" count, that's fine. For a bank balance, it's not.",
    ],
    callouts: [
      {
        type: "definition",
        title: "The NoSQL Family Tree",
        body: "**Document stores:** MongoDB, Firestore, CouchDB\n  → JSON documents. Flexible schema. Good for user profiles, catalogs.\n\n**Key-Value stores:** Redis, DynamoDB, Memcached\n  → Hash map at planetary scale. Sub-millisecond lookup. Sessions, caches, counters.\n\n**Column-family stores:** Cassandra, HBase, BigTable\n  → Rows with dynamic column sets. Designed for time-series, IoT, logs.\n\n**Graph databases:** Neo4j, Neptune, JanusGraph\n  → Nodes and edges. Traversals, recommendations, fraud detection.",
      },
      {
        type: "definition",
        title: "CAP Theorem (preview)",
        body: "In a distributed system, you can guarantee at most 2 of 3:\n**C — Consistency:** Every read returns the most recent write\n**A — Availability:** Every request gets a response (not necessarily current)\n**P — Partition Tolerance:** System works even if nodes can't communicate\n\nSince network partitions happen in real systems, you must choose CP or AP.\nSQL databases are CP. Cassandra is AP. Redis is CP (when used as primary store).",
      },
      {
        type: "warning",
        title: 'NoSQL does not mean "no schema"',
        body: 'NoSQL databases skip schema enforcement — but your data still has a shape. Without enforced schema, the shape lives in your application code. You get "schema on read" instead of "schema on write." This is more flexible but means bugs in your application can silently write malformed data that breaks readers.',
      },
      {
        type: "insight",
        title: "When SQL is still the right choice",
        body: "SQL is still the default answer for most business applications. Use SQL when you need:\n- Complex multi-table relationships\n- Strong consistency (financial data, inventory)\n- Ad-hoc queries (business intelligence, reporting)\n- The full relational model (normalization, referential integrity)\n\nNoSQL shines when: massive scale, simple access patterns, flexible schema evolution, or specialized data structures (graphs, time-series).",
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "Why NoSQL — Simulating Different Data Models",
        mathBridge:
          "The CAP theorem (Brewer, 2000) proved that distributed systems face a fundamental tradeoff. Gilbert and Lynch (2002) formalized it: no distributed system can simultaneously provide Consistency, Availability, and Partition Tolerance.",
        caption:
          "Simulate the key-value, document, and graph models in Python to understand what each one optimizes for.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Key-Value store — the simplest NoSQL model",
              prose: [
                "## Redis-style key-value store",
                "The most primitive — and fastest — NoSQL model. A global hash map. O(1) get and set. No schema.",
              ],
              code: `# Simulate a key-value store (like Redis)
class KVStore:
    def __init__(self):
        self._data = {}

    def set(self, key, value):
        self._data[key] = value

    def get(self, key, default=None):
        return self._data.get(key, default)

    def delete(self, key):
        self._data.pop(key, None)

    def keys(self, prefix=''):
        return [k for k in self._data if k.startswith(prefix)]

kv = KVStore()

# Session data — classic key-value use case
kv.set("session:abc123", {"user_id": 42, "role": "admin", "expires": "2024-12-31"})
kv.set("session:xyz789", {"user_id": 7, "role": "user", "expires": "2024-12-28"})

# Counters — atomic increment in real Redis
kv.set("counter:page_views", 0)
for _ in range(100):
    kv.set("counter:page_views", kv.get("counter:page_views") + 1)

# Cache entry with computed value
kv.set("cache:user:42:feed", ["post_1", "post_2", "post_3"])

print("Session:", kv.get("session:abc123"))
print("Views:", kv.get("counter:page_views"))
print("Feed:", kv.get("cache:user:42:feed"))
print("All session keys:", kv.keys("session:"))
print()
print("Key-value: no query language, no joins, no schema. Just get/set by key.")
print("This is why Redis serves millions of requests/sec per node.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "Document store — nested JSON, flexible schema",
              prose: [
                "## MongoDB-style document store",
                "Documents are JSON objects. Related data is *embedded* inside the document instead of in separate tables. No joins needed for common queries.",
              ],
              code: `import json

# Simulate a document store (like MongoDB)
class DocumentStore:
    def __init__(self):
        self._collections = {}

    def insert(self, collection, doc):
        if collection not in self._collections:
            self._collections[collection] = {}
        doc_id = doc.get('_id', id(doc))
        doc['_id'] = doc_id
        self._collections[collection][doc_id] = doc
        return doc_id

    def find_one(self, collection, query):
        for doc in self._collections.get(collection, {}).values():
            if all(doc.get(k) == v for k, v in query.items()):
                return doc
        return None

    def find(self, collection, query=None):
        docs = list(self._collections.get(collection, {}).values())
        if query:
            docs = [d for d in docs if all(d.get(k) == v for k, v in query.items())]
        return docs

db = DocumentStore()

# In SQL: users table + addresses table + join
# In MongoDB: everything embedded in one document
db.insert("users", {
    "_id": "user_42",
    "name": "Alice Chen",
    "email": "alice@example.com",
    "addresses": [                          # embedded array — no join needed
        {"type": "home", "city": "SF", "state": "CA", "zip": "94105"},
        {"type": "work", "city": "Oakland", "state": "CA", "zip": "94612"},
    ],
    "preferences": {"theme": "dark", "notifications": True},  # flexible sub-doc
    "tags": ["premium", "early-adopter"],
})

# Document schema can vary — no ALTER TABLE needed
db.insert("users", {
    "_id": "user_7",
    "name": "Bob Torres",
    "email": "bob@example.com",
    "company": "Acme Corp",     # field Alice doesn't have — totally fine
    "api_key": "sk-xxxx1234",   # another field unique to this user type
})

alice = db.find_one("users", {"_id": "user_42"})
print("Alice's document:")
print(json.dumps(alice, indent=2))
print()
print("Bob has fields Alice doesn't — document stores allow this freely.")
print("SQL would need ALTER TABLE to add the company/api_key columns for everyone.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle:
                "Graph database — relationships as first-class citizens",
              prose: [
                "## Neo4j-style graph model",
                "In a graph database, nodes (entities) and edges (relationships) are both first-class. Deep relationship traversals — impossible to do efficiently with SQL JOINs — become trivial.",
              ],
              code: `# Simulate a graph database (like Neo4j)
class GraphDB:
    def __init__(self):
        self.nodes = {}
        self.edges = []

    def add_node(self, node_id, labels=None, **props):
        self.nodes[node_id] = {"id": node_id, "labels": labels or [], **props}

    def add_edge(self, from_id, to_id, rel_type, **props):
        self.edges.append({"from": from_id, "to": to_id, "type": rel_type, **props})

    def neighbors(self, node_id, rel_type=None, direction="out"):
        result = []
        for e in self.edges:
            if direction in ("out", "both") and e["from"] == node_id:
                if rel_type is None or e["type"] == rel_type:
                    result.append((self.nodes[e["to"]], e))
            if direction in ("in", "both") and e["to"] == node_id:
                if rel_type is None or e["type"] == rel_type:
                    result.append((self.nodes[e["from"]], e))
        return result

    def friends_of_friends(self, node_id):
        friends = {n["id"] for n, _ in self.neighbors(node_id, "FOLLOWS")}
        fof = set()
        for fid in friends:
            for n, _ in self.neighbors(fid, "FOLLOWS"):
                if n["id"] != node_id and n["id"] not in friends:
                    fof.add(n["id"])
        return fof

g = GraphDB()
for uid, name in [("u1","Alice"),("u2","Bob"),("u3","Carol"),("u4","David"),("u5","Eve")]:
    g.add_node(uid, labels=["User"], name=name)

for fr, to in [("u1","u2"),("u1","u3"),("u2","u4"),("u3","u5"),("u4","u1")]:
    g.add_edge(fr, to, "FOLLOWS")

alice_friends = [n["name"] for n, _ in g.neighbors("u1", "FOLLOWS")]
fof = g.friends_of_friends("u1")
print(f"Alice follows: {alice_friends}")
print(f"Friends-of-friends: {[g.nodes[uid]['name'] for uid in fof]}")
print()
print("In SQL this requires a self-join with two levels of JOIN.")
print("Deeper traversals (6 degrees of separation) would be many nested JOINs.")
print("In a graph DB, any depth traversal is the same operation: MATCH (a)-[:FOLLOWS*1..6]->(b)")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: "The scaling comparison",
              prose: [
                "## Why horizontal scaling favors NoSQL",
                "Simulate what happens as you add data — relational joins stay expensive, document lookups stay fast.",
              ],
              code: `import time, random

# Simulate scaling behavior (simplified model)
def relational_lookup(n_users, n_orders, user_id):
    """JOIN: scan all orders looking for this user — O(n_orders)"""
    orders = [(random.randint(1, n_users), random.uniform(10, 500))
              for _ in range(n_orders)]
    # Full scan join (no index)
    return [o for o in orders if o[0] == user_id]

def document_lookup(n_users, user_id):
    """Document lookup: hash map O(1) — scale doesn't matter"""
    user_docs = {i: {"id": i, "orders": [random.uniform(10,500) for _ in range(5)]}
                 for i in range(1, n_users + 1)}
    return user_docs.get(user_id)

print(f"{'Scale':>15} {'SQL JOIN':>12} {'Doc lookup':>12}")
print("-" * 42)
for n in [1_000, 10_000, 100_000, 500_000]:
    t0 = time.perf_counter()
    for _ in range(5):
        relational_lookup(n, n*10, random.randint(1, n))
    t_rel = (time.perf_counter() - t0) / 5 * 1000

    t0 = time.perf_counter()
    for _ in range(5):
        document_lookup(n, random.randint(1, n))
    t_doc = (time.perf_counter() - t0) / 5 * 1000

    print(f"{n:>15,} {t_rel:>11.2f}ms {t_doc:>11.2f}ms")

print()
print("Relational join without an index grows with table size.")
print("Document lookup (hash map) stays constant — O(1) regardless of n.")
print("This is the key insight behind sharding: put each user's data together,")
print("route requests by user ID, and each shard only needs to do O(1) lookups.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**CAP theorem formalized.** Brewer's CAP conjecture (2000) was proved by Gilbert and Lynch (2002). It states that in the presence of a network partition, a distributed system must choose between consistency (all nodes return the same data) and availability (every node responds). Since network partitions are unavoidable (cables fail, switches crash), every distributed database is either CP or AP. Single-node databases sidestep CAP entirely.",
      "**PACELC extension.** CAP only addresses behavior during partitions. The PACELC model extends it: even when no partition (E), there is a tradeoff between Latency (L) and Consistency (C). DynamoDB is PA/EL (available during partition, low latency at cost of consistency). Spanner is PC/EC (consistent always, but higher latency).",
    ],
  },

  examples: [
    {
      id: "nosql1-001-ex1",
      title: "Choosing the Right Database",
      problem:
        "You're building a system. Which database type fits each component?",
      steps: [
        {
          expression: "User profiles + preferences",
          annotation:
            "Document store (MongoDB) — schema varies per user, embed preferences directly",
        },
        {
          expression: "Session tokens / auth cache",
          annotation:
            "Key-value store (Redis) — O(1) lookup, TTL support, high throughput",
        },
        {
          expression: "Financial transactions",
          annotation:
            "SQL (PostgreSQL) — ACID required, complex queries across accounts",
        },
        {
          expression: "Social follow graph",
          annotation:
            "Graph database (Neo4j) — traverse relationships, friend-of-friend queries",
        },
        {
          expression: "IoT sensor readings (billions/day)",
          annotation:
            "Column-family store (Cassandra) — time-series, append-only, high write throughput",
        },
        {
          expression: "Product search",
          annotation:
            "Elasticsearch (search-optimized NoSQL) — full-text indexing, facets, ranking",
        },
      ],
      conclusion:
        "Real production systems use multiple databases (polyglot persistence). Each is chosen for what it does best.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "nosql1-001-q1",
        type: "choice",
        text: "The primary motivation for NoSQL databases was:",
        options: [
          "SQL databases had bugs that were too hard to fix",
          "The need to scale horizontally across many commodity servers when vertical scaling hit its limits",
          "NoSQL is faster than SQL for all types of queries",
          "Regulatory requirements for flexible data storage",
        ],
        answer:
          "The need to scale horizontally across many commodity servers when vertical scaling hit its limits",
      },
      {
        id: "nosql1-001-q2",
        type: "choice",
        text: "A document store stores user profiles with embedded addresses. In SQL, this would require:",
        options: [
          "Nothing — SQL also supports embedded arrays",
          "A separate addresses table with a foreign key, and a JOIN to retrieve them together",
          "A BLOB column to store JSON strings",
          "Multiple SELECT queries executed in application code",
        ],
        answer:
          "A separate addresses table with a foreign key, and a JOIN to retrieve them together",
      },
      {
        id: "nosql1-001-q3",
        type: "choice",
        text: "Which use case is BEST suited for a key-value store?",
        options: [
          "Storing a company's financial ledger with balance reconciliation",
          'Querying "all users who bought product X and are in California"',
          "Storing user sessions with millisecond lookup by session token",
          "Tracking relationships between users in a social network",
        ],
        answer:
          "Storing user sessions with millisecond lookup by session token",
      },
    ],
  },

  mentalModel: [
    "NoSQL trades SQL guarantees (joins, ACID, schema) for horizontal scale and flexibility",
    "Document stores embed related data — no joins needed for common queries",
    "Key-value stores are hash maps at planetary scale — O(1), no schema",
    "Graph databases treat relationships as first-class — depth traversals are cheap",
    "Column-family stores optimize for time-series, append-only, high write volume",
    "CAP theorem: distributed systems pick 2 of: Consistency, Availability, Partition Tolerance",
  ],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Vertical scaling (adding RAM/CPU to one server) has a practical ceiling. What does horizontal scaling (adding more servers) require that vertical does not?',
      options: [
        'More expensive hardware for each new machine',
        'Your application must partition and distribute data across machines — queries that touch data on multiple servers require coordination or distribution strategies. SQL\'s strong guarantees (joins, ACID) are hard to implement across machines, which is why NoSQL databases often relax those guarantees to enable horizontal scale',
        'A cloud provider — horizontal scaling cannot be done on-premises',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A document store retrieves a user profile including their address, preferences, and recent orders in one query. An equivalent SQL schema would need 3 joins. When does the embedded document model win?',
      options: [
        'Always — embedding avoids joins which are always slow',
        'When the data is always read together, is bounded in size, and belongs to one parent. If orders could number in the millions or need to be queried independently, a reference (foreign key equivalent) is better. The document model wins when the read pattern matches the embedded structure',
        'When the database is under 1GB — embedding becomes slow beyond that',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A key-value store does O(1) lookups by key. What query is impossible with a pure key-value store that SQL handles easily?',
      options: [
        'Retrieving a value given its key',
        'Finding all users whose age is between 25 and 35. Without a secondary index, a key-value store can only look up by exact key. Range scans, filters, and aggregations require scanning all keys — O(n) — or adding indexes that the key-value model does not natively provide',
        'Storing binary blob data larger than 1MB',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'CAP theorem states distributed systems can guarantee at most 2 of: Consistency (C), Availability (A), Partition Tolerance (P). Why is choosing to sacrifice P not a realistic option?',
      options: [
        'P is required by cloud providers',
        'Network partitions (machines losing contact with each other) happen in any real distributed system — cables fail, switches drop packets, datacenters go offline. You cannot prevent partitions; you can only decide how to behave when they occur. So the real choice is always between C and A during a partition, not whether to tolerate partitions at all',
        'Partition tolerance is required by the TCP/IP protocol',
      ],
      correct: 1,
    },
  ],
};
