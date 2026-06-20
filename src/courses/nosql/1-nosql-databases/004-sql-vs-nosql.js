export default {
  id: "nosql1-004",
  slug: "sql-vs-nosql",
  chapter: "nosql-1",
  order: 4,
  title: "SQL vs NoSQL — Choosing the Right Tool",
  subtitle:
    "A decision framework based on data access patterns, scale, and consistency requirements",
  tags: [
    "SQL vs NoSQL",
    "polyglot persistence",
    "data access patterns",
    "database selection",
    "when to use SQL",
    "when to use NoSQL",
    "architecture decisions",
    "migration patterns",
  ],
  aliases:
    "sql vs nosql polyglot persistence database selection when to use mongodb postgres redis cassandra architecture decision data access patterns",

  hook: {
    question:
      "A startup decides to use MongoDB for everything because \"SQL doesn't scale.\" Two years later they're rewriting to PostgreSQL. What went wrong with the original reasoning?",
    realWorldContext:
      "One of the most common and expensive engineering mistakes is choosing a database for ideological " +
      'reasons ("NoSQL is modern") rather than technical ones. Both SQL and NoSQL are mature, ' +
      "production-proven technologies. The decision should come entirely from your data access patterns, " +
      "consistency requirements, and scale characteristics — not from hype or familiarity. " +
      "This lesson gives you a practical decision framework that senior engineers use.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      "**Start with your access patterns.** The single most important question is: how will you query this data? A key-value access pattern (give me user 42) is trivially served by both SQL and a document store — but a document store will be marginally faster with zero extra work. A multi-table reporting query (join orders, products, and customers; group by month) is natural in SQL and requires complex aggregation pipelines in MongoDB. The data access pattern determines the schema, which determines the database type.",
      "**When SQL wins.** PostgreSQL is the right default when you have: (1) complex relationships between entities that you need to query in ad-hoc ways; (2) strong consistency requirements (financial data, inventory); (3) reporting and analytics needs; (4) a team that knows SQL; (5) a data model that is well understood and unlikely to change radically. SQL has decades of tooling, query planners that automatically optimize your queries, and mature operational practices.",
      "**When NoSQL wins.** NoSQL makes sense when you have: (1) massive scale requiring horizontal sharding from day one; (2) schema that is genuinely in flux (MVP, exploration phase); (3) access patterns perfectly matched to a specific NoSQL type (key-value sessions, graph social network); (4) a specialized data structure (time-series, geospatial) better served by a purpose-built store.",
      '**Polyglot persistence.** Real production systems use multiple database types. A mature e-commerce platform might use: PostgreSQL for orders and inventory; Redis for sessions, rate limiting, and caching; Elasticsearch for product search; Cassandra for clickstream analytics; DynamoDB for user preferences. Each database handles the workload it is best suited for. This is "polyglot persistence" — the right tool for each job.',
      '**"NoSQL doesn\'t scale" and "SQL doesn\'t scale" are both myths.** PostgreSQL can handle tens of thousands of writes per second on modern hardware. Google\'s Spanner is a SQL database that spans the entire globe. Cassandra can handle millions of writes per second. Both families scale — they scale differently and for different workloads. The question is always: what are your specific requirements?',
    ],
    callouts: [
      {
        type: "definition",
        title: "Decision Framework",
        body: "**Use SQL (PostgreSQL, MySQL) when:**\n- Complex joins across multiple entities\n- Ad-hoc query patterns (don't know queries in advance)\n- Strong ACID consistency required\n- Team knows SQL\n- Reporting / BI / analytics\n- Default choice for new projects\n\n**Use Document store (MongoDB) when:**\n- Document-centric access (get user 42 with all their data)\n- Schema evolving rapidly\n- Deeply nested, variable-shape data\n- No complex cross-entity queries needed\n\n**Use Key-Value (Redis) when:**\n- Sessions, caches, rate limiting\n- Sub-millisecond access by single key\n- Pub/sub messaging\n- Counters and leaderboards\n\n**Use Column-family (Cassandra) when:**\n- Time-series or IoT: millions of writes/sec\n- Known, simple access patterns\n- Cross-datacenter replication needed\n\n**Use Graph (Neo4j) when:**\n- Social graphs, recommendations, fraud detection\n- Deep relationship traversals are the primary access pattern",
      },
      {
        type: "warning",
        title: "The MongoDB trap",
        body: 'A common mistake: use MongoDB for everything because it\'s "more flexible." But as a product matures, you inevitably need:\n- Cross-collection joins (which `$lookup` handles poorly at scale)\n- Complex reporting queries (which SQL handles naturally)\n- Strong consistency (which requires careful MongoDB configuration)\n\nThe flexibility of document stores has a cost: you lose the query optimizer, referential integrity, and the full relational model. Choose MongoDB when you genuinely have document-centric access patterns — not as a default.',
      },
      {
        type: "insight",
        title: "PostgreSQL can do more than you think",
        body: "Modern PostgreSQL blurs the SQL/NoSQL line:\n- `JSONB` column type: store and index JSON documents inside SQL rows\n- Full-text search built in\n- `pg_trgm` for fuzzy string matching\n- PostGIS for geospatial queries\n- TimescaleDB extension for time-series\n- Logical replication for read scaling\n\nBefore adding a new database type, check if PostgreSQL can handle it first.",
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "SQL vs NoSQL Decision Analysis",
        mathBridge:
          "The fundamental computer science principle: data structure choice should match the access pattern. A hash map gives O(1) lookups by key; a B-tree gives O(log n) range scans; a graph adjacency list gives O(k) neighborhood traversal where k is edge count. Each NoSQL type is an optimization of one of these structures at planetary scale.",
        caption:
          "Work through access pattern analysis and polyglot architecture decisions.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Access pattern analysis",
              prose: [
                "## The access pattern is the oracle",
                "For each piece of data, define how it will be read and written. The access pattern tells you the database type.",
              ],
              code: `# Decision framework as code — classify each requirement
from dataclasses import dataclass, field
from typing import List

@dataclass
class Requirement:
    name: str
    access_patterns: List[str]
    consistency: str          # "strong" or "eventual"
    scale: str                # "normal" or "massive"
    schema: str               # "stable" or "evolving"

@dataclass
class Recommendation:
    db_type: str
    product: str
    reason: str

def recommend(req: Requirement) -> Recommendation:
    aps = req.access_patterns

    if "deep-relationship-traversal" in aps:
        return Recommendation("Graph", "Neo4j", "Relationship traversals are first-class operations")

    if "time-series" in aps or "append-only-by-time" in aps:
        return Recommendation("Column-family", "Cassandra / InfluxDB", "Write-heavy time-series, partition by time")

    if "get-by-key" in aps and len(aps) == 1:
        return Recommendation("Key-Value", "Redis", "Single-key access is the only pattern — hash map is perfect")

    if "complex-joins" in aps or "ad-hoc-queries" in aps or req.consistency == "strong":
        return Recommendation("SQL", "PostgreSQL", "Complex queries or strong consistency require relational model")

    if "get-by-id" in aps and "nested-data" in aps and req.schema == "evolving":
        return Recommendation("Document", "MongoDB", "Document-centric reads, flexible schema")

    # Default: SQL is almost always a safe choice
    return Recommendation("SQL", "PostgreSQL", "Default: SQL handles most use cases well")

requirements = [
    Requirement("User auth sessions",      ["get-by-key"],                          "strong",   "normal",  "stable"),
    Requirement("E-commerce orders",       ["complex-joins", "ad-hoc-queries"],     "strong",   "normal",  "stable"),
    Requirement("User profiles (SaaS)",    ["get-by-id", "nested-data"],            "eventual", "normal",  "evolving"),
    Requirement("IoT sensor data",         ["time-series", "append-only-by-time"],  "eventual", "massive", "stable"),
    Requirement("Social follow graph",     ["deep-relationship-traversal"],         "eventual", "massive", "stable"),
    Requirement("Product search",          ["full-text-search"],                    "eventual", "normal",  "evolving"),
    Requirement("Financial ledger",        ["complex-joins", "ad-hoc-queries"],     "strong",   "normal",  "stable"),
    Requirement("Rate limiting counter",   ["get-by-key"],                          "strong",   "massive", "stable"),
]

print(f"{'Requirement':<30} {'DB Type':<15} {'Product':<20} Reason")
print("-" * 95)
for req in requirements:
    rec = recommend(req)
    print(f"{req.name:<30} {rec.db_type:<15} {rec.product:<20} {rec.reason}")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "Polyglot persistence architecture",
              prose: [
                "## Designing a polyglot system",
                "A real e-commerce platform uses multiple database types, each handling what it's best at.",
              ],
              code: `# Simulate a polyglot persistence architecture
# Each "client" represents a different database

class PostgresClient:
    """Orders, products, inventory — complex joins, strong consistency"""
    def __init__(self): self.store = {}
    def query(self, sql): return f"[Postgres] {sql}"
    def insert(self, table, row):
        self.store.setdefault(table, []).append(row)
        return f"[Postgres] INSERT INTO {table}"

class RedisClient:
    """Sessions, rate limits, real-time counters — O(1) key lookup"""
    def __init__(self): self.store = {}
    def set(self, k, v, ttl=None): self.store[k] = v; return "OK"
    def get(self, k): return self.store.get(k)
    def incr(self, k): self.store[k] = self.store.get(k, 0) + 1; return self.store[k]

class MongoClient:
    """User profiles, recommendations — flexible schema, document reads"""
    def __init__(self): self.collections = {}
    def insert_one(self, col, doc):
        self.collections.setdefault(col, {})[doc["_id"]] = doc
    def find_one(self, col, _id):
        return self.collections.get(col, {}).get(_id)

class ElasticClient:
    """Product search — full-text, facets, ranking"""
    def __init__(self): self.index = []
    def index_doc(self, doc): self.index.append(doc)
    def search(self, query): return [d for d in self.index if query.lower() in d.get("title","").lower()]

# Initialize
postgres = PostgresClient()
redis    = RedisClient()
mongo    = MongoClient()
elastic  = ElasticClient()

# --- User signs up ---
user = {"_id": "user_42", "name": "Alice Chen", "preferences": {"theme": "dark", "currency": "USD"}}
mongo.insert_one("users", user)                       # profile → MongoDB
redis.set("session:abc123", {"user_id": "user_42"})   # session → Redis

# --- Place an order ---
postgres.insert("orders", {"id": "o_1", "user_id": "user_42", "product_id": "p_1", "total": 99.99})
postgres.insert("inventory", {"product_id": "p_1", "qty": 49})   # decrement

# --- Product search ---
for p in [{"id":"p_1","title":"Python Book"},{"id":"p_2","title":"Python Crash Course"},
          {"id":"p_3","title":"JavaScript Guide"}]:
    elastic.index_doc(p)

# --- Rate limiting ---
for _ in range(3):  # 3 requests from this IP
    count = redis.incr("rate:192.168.1.1")

print("=== Polyglot Architecture in Action ===")
print()
print(f"User profile (MongoDB): {mongo.find_one('users', 'user_42')['name']}")
print(f"Session (Redis):        {redis.get('session:abc123')}")
print(f"Order (Postgres):       {postgres.store['orders']}")
print(f"Search 'python' (Elastic): {[d['title'] for d in elastic.search('python')]}")
print(f"Rate limit count (Redis): {redis.get('rate:192.168.1.1')} requests")
print()
print("Each database handles one concern it is best at.")
print("No single database is the right tool for all of these at once.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "PostgreSQL JSONB — blurring the line",
              prose: [
                "## SQL + JSON: the hybrid approach",
                "PostgreSQL's JSONB type lets you store flexible JSON documents inside relational tables, then index into them. Often the best of both worlds.",
              ],
              code: `import sqlite3, json

# SQLite supports JSON functions since 3.38 (2022).
# Demonstrate the hybrid SQL+JSON pattern.
conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row

conn.execute("""
    CREATE TABLE users (
        id      INTEGER PRIMARY KEY,
        email   TEXT UNIQUE NOT NULL,
        profile TEXT         -- JSON blob for flexible/variable fields
    )
""")

# Insert users with different profile shapes — like MongoDB flexibility
users = [
    (1, "alice@ex.com", json.dumps({
        "name": "Alice Chen", "plan": "pro",
        "preferences": {"theme": "dark", "lang": "en"},
        "company": "Acme"  # not all users have this
    })),
    (2, "bob@ex.com", json.dumps({
        "name": "Bob Torres", "plan": "free",
        "preferences": {"theme": "light", "lang": "es"}
        # no "company" field — that's fine in JSON
    })),
    (3, "carol@ex.com", json.dumps({
        "name": "Carol Lee", "plan": "pro",
        "preferences": {"theme": "dark", "lang": "zh"},
        "github": "carollee"  # unique field
    })),
]
conn.executemany("INSERT INTO users VALUES (?, ?, ?)", users)

# Query with SQL + JSON extraction
rows = conn.execute("""
    SELECT
        id,
        email,
        json_extract(profile, '$.name') AS name,
        json_extract(profile, '$.plan') AS plan,
        json_extract(profile, '$.preferences.theme') AS theme
    FROM users
    WHERE json_extract(profile, '$.plan') = 'pro'
    ORDER BY name
""").fetchall()

print("Pro users with flexible JSON profile (SQL + JSON):")
print(f"{'ID':<5} {'Email':<20} {'Name':<15} {'Plan':<8} {'Theme'}")
print("-" * 65)
for r in rows:
    print(f"{r['id']:<5} {r['email']:<20} {r['name']:<15} {r['plan']:<8} {r['theme']}")

print()
print("This pattern: use SQL for structured fields (id, email),")
print("use JSON column for flexible/variable fields (preferences, company).")
print("In PostgreSQL: use JSONB type with GIN index for production — same idea, indexed.")
print()
print("Before reaching for MongoDB, check if PostgreSQL JSONB meets your needs.")`,
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
      '**Martin Fowler\'s "polyglot persistence" principle.** In 2011, Fowler and Sadalage coined the term "polyglot persistence" in their book NoSQL Distilled. The core idea: modern applications have diverse data storage needs that cannot be optimally served by a single database. Different parts of a system should use different data storage technologies based on how data is used — not based on organizational convenience or familiarity.',
      "**NewSQL: a third path.** Between traditional SQL and NoSQL, NewSQL databases (CockroachDB, TiDB, Google Spanner, Amazon Aurora) provide horizontal scaling with ACID transactions. They distribute SQL across many nodes using distributed consensus (Raft or Paxos). This eliminates some of the original NoSQL motivations while keeping full SQL semantics. For new greenfield systems needing both scale and strong consistency, NewSQL is worth evaluating.",
      '**The access pattern determines the data model, which determines the database.** This is the fundamental principle. If you know your primary read is "get all activity for user X in the last 7 days, sorted by time," you design your data model to make that query fast — which might mean Cassandra with (user_id, event_time) as the partition+clustering key. If you reverse the process (pick the database first), you may find your access patterns fighting the database.',
    ],
  },

  examples: [
    {
      id: "nosql1-004-ex1",
      title: "The Startup That Chose Poorly",
      problem:
        "A startup chose MongoDB for their entire platform — user auth, financial records, analytics, and product search. Two years in, they are rewriting. What were the warning signs?",
      steps: [
        {
          expression: "Financial records in MongoDB",
          annotation:
            "Warning: financial data needs ACID transactions. Multi-document transactions in MongoDB exist but are an afterthought. PostgreSQL is the right tool.",
        },
        {
          expression: "Complex reporting queries",
          annotation:
            'Warning: "show me all orders by state, last 30 days, grouped by product category" requires SQL GROUP BY with joins. MongoDB aggregation pipelines for this become complex and slow.',
        },
        {
          expression: "Product search with facets",
          annotation:
            "Warning: full-text search with facets (filter by price range, category, brand) is what Elasticsearch is purpose-built for. MongoDB text indexes are limited.",
        },
        {
          expression: "User sessions in MongoDB",
          annotation:
            "Warning: sessions are a pure key-value access pattern. Redis is 10-100x faster for this, with native TTL support.",
        },
        {
          expression: "The lesson",
          annotation:
            'MongoDB is excellent for document-centric access patterns with flexible schema. Using it for everything is not "simplicity" — it is using the wrong tool, everywhere.',
        },
      ],
      conclusion:
        "Database selection is an access-pattern decision, not a familiarity or trendiness decision.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "nosql1-004-q1",
        type: "choice",
        text: "The most important factor when choosing between SQL and NoSQL is:",
        options: [
          "Which database has more GitHub stars",
          "Your data access patterns — how data will be read and written",
          "Whether your team has used it before",
          "The size of your current data set",
        ],
        answer: "Your data access patterns — how data will be read and written",
      },
      {
        id: "nosql1-004-q2",
        type: "choice",
        text: '"Polyglot persistence" means:',
        options: [
          "Using a database that supports multiple query languages",
          "Using multiple different database types in one system, each for the workload it handles best",
          "Migrating from NoSQL to SQL over time",
          "Writing database queries in multiple programming languages",
        ],
        answer:
          "Using multiple different database types in one system, each for the workload it handles best",
      },
      {
        id: "nosql1-004-q3",
        type: "choice",
        text: "A company needs to store financial transactions that require strict consistency, support complex reporting queries joining multiple tables, and never lose data. The best fit is:",
        options: [
          "MongoDB — it's flexible and modern",
          "Redis — it's the fastest database available",
          "PostgreSQL — ACID transactions, full SQL for reporting, battle-tested durability",
          "Cassandra — it handles high write volumes",
        ],
        answer:
          "PostgreSQL — ACID transactions, full SQL for reporting, battle-tested durability",
      },
    ],
  },

  mentalModel: [
    "Data access patterns determine your data model, which determines your database type",
    "SQL is the right default — it handles most use cases; add NoSQL when you have a specific reason",
    "Polyglot persistence: each service uses the database that fits its access patterns",
    'MongoDB\'s strength is document-centric reads with flexible schema — not "everything"',
    "PostgreSQL JSONB blurs the SQL/NoSQL line — check it before adding a new database type",
    "NewSQL (CockroachDB, Spanner) provides horizontal SQL scale if you need both scale and ACID",
  ],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Data access patterns determine your data model." A news site stores articles. Readers always view articles by date range and category. Writers always look up articles by ID. Which access pattern should drive the schema?',
      options: [
        'The writer pattern — write operations are more expensive to optimize',
        'The reader pattern — reads vastly outnumber writes for a news site. Optimize for the dominant access pattern (date + category queries) even if that makes writes slightly more work. If both patterns are equally frequent, you may need secondary indexes or two separate read models',
        'Both patterns should be equally weighted regardless of frequency',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'PostgreSQL\'s JSONB column type can store and query JSON documents with indexes. How does this blur the SQL/NoSQL line?',
      options: [
        'JSONB makes PostgreSQL a document database and it should be used instead of MongoDB always',
        'You get SQL\'s ACID transactions, joins, and schema enforcement alongside flexible JSON storage for columns that need it. Many "NoSQL" use cases (flexible schemas, nested documents) can be solved within Postgres without adding another database technology and its operational burden',
        'JSONB only stores strings; it cannot be queried like a real document store',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Polyglot persistence uses multiple databases (SQL for orders, Redis for sessions, Elasticsearch for search). What is the primary operational cost?',
      options: [
        'Each database requires a separate programming language',
        'Each database system requires separate expertise, monitoring, backup procedures, upgrade paths, and failure modes to understand. A bug in the session service might require Redis expertise; a search ranking problem requires Elasticsearch knowledge. The more database types you run, the larger the operational surface area your team must maintain',
        'Polyglot persistence violates ACID across the system',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'NewSQL databases (CockroachDB, Google Spanner) offer horizontal scaling with full SQL and ACID. When would you choose NewSQL over traditional SQL or NoSQL?',
      options: [
        'For any application with more than 1000 users',
        'When you need both: full ACID transactions (ruling out most NoSQL) AND scale beyond what one machine can handle (ruling out traditional SQL without significant sharding complexity). NewSQL is more operationally complex than a single Postgres instance, so only reach for it when single-node performance is genuinely insufficient',
        'NewSQL is always the best choice — it combines the advantages of both',
      ],
      correct: 1,
    },
  ],
};
