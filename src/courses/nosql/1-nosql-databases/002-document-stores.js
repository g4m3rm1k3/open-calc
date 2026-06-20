export default {
  id: "nosql1-002",
  slug: "document-stores",
  chapter: "nosql-1",
  order: 2,
  title: "Document Stores — JSON as the Data Model",
  subtitle:
    "Embedding vs referencing, schema design for reads, and aggregation pipelines",
  tags: [
    "MongoDB",
    "document store",
    "embedding",
    "referencing",
    "aggregation pipeline",
    "schema design",
    "denormalization",
    "BSON",
    "Firestore",
  ],
  aliases:
    "mongodb document store embedding referencing aggregation pipeline json bson firestore schema design denormalization",

  hook: {
    question:
      "If relational databases are so powerful, why does MongoDB power some of the world's largest applications — and what do you actually give up?",
    realWorldContext:
      "MongoDB, Firestore, CouchDB, and DynamoDB (in document mode) power everything from " +
      "Foursquare's check-ins to Adobe's Creative Cloud. The document model is not about being " +
      '"lazy" with schema — it\'s a deliberate design choice that trades query flexibility ' +
      "for read performance and development speed. " +
      "Understanding when to embed data and when to reference it is " +
      "the central skill of document store design.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      "**The document model.** A document is a self-contained JSON object. All data relevant to one entity lives in one document. A user document might contain their profile, preferences, and recent activity — all in one place. Reading one user = one document fetch. No join required.",
      '**Embedding vs Referencing.** The central design question: should related data live inside the parent document (embedding) or in a separate document referenced by ID (referencing)? Embedding is fast for reads — everything arrives in one fetch. Referencing keeps documents small and avoids duplication — but requires an extra lookup (the "application-level join"). The rule of thumb: embed if you always read the data together and it won\'t grow unboundedly. Reference if the data is large, shared by many documents, or updated independently.',
      "**Unbounded arrays are a trap.** Embedding is dangerous if the array can grow forever. A blog post with a `comments` array sounds natural, but a viral post could have millions of comments. A MongoDB document has a 16MB size limit. Embedding comments would blow it. Reference them: `comment.post_id = post._id`.",
      "**Denormalization is intentional.** In SQL, you normalize to avoid duplication. In document stores, you often deliberately duplicate data (denormalize) to make reads fast. A product name might be stored in both the product document and every order document that references it. This means faster reads and no joins — but you must update all copies when the product name changes.",
      "**Aggregation pipelines.** The document store equivalent of SQL's GROUP BY + JOIN is an aggregation pipeline: a sequence of stages that transform documents. `$match` (like WHERE), `$group` (like GROUP BY), `$sort`, `$project` (like SELECT), `$lookup` (like LEFT JOIN, but expensive). Each stage takes a stream of documents and passes transformed documents to the next stage.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Embedding vs Referencing Rule of Thumb",
        body: "**Embed when:**\n- Data is always read together with parent\n- Array is bounded and small (< a few hundred items)\n- Data is not shared by multiple parents\n- No need to query the sub-data independently\n\n**Reference when:**\n- Array could grow unboundedly\n- Data is shared by many parent documents\n- Data is updated frequently and independently\n- You need to query sub-data independently",
      },
      {
        type: "warning",
        title: "The 16MB document limit (MongoDB)",
        body: "MongoDB documents have a 16MB size limit. An embedded array that grows without bounds (comments, events, log entries) will eventually hit this limit and fail hard. Always bound embedded arrays. For unbounded collections, use a separate collection with a reference.",
      },
      {
        type: "insight",
        title: "Schema-on-read vs Schema-on-write",
        body: "SQL is schema-on-write: the database enforces shape at INSERT time. MongoDB is schema-on-read: any document shape is accepted; your application interprets the shape at query time.\n\nModern MongoDB and Firestore support optional schema validation. Use it — silent schema drift is one of the most common sources of production bugs in document stores.",
      },
      {
        type: "definition",
        title: "MongoDB Aggregation Pipeline Stages",
        body: "`$match` — filter documents (like WHERE)\n`$group` — group and aggregate (like GROUP BY)\n`$project` — reshape documents (like SELECT)\n`$sort` — sort (like ORDER BY)\n`$limit` / `$skip` — pagination\n`$lookup` — left join with another collection (expensive!)\n`$unwind` — flatten an embedded array into separate documents\n`$addFields` — add computed fields",
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "Document Store Design Patterns",
        mathBridge:
          "The data locality principle: if two pieces of data are always accessed together, store them together. Document embedding is the physical realization of this principle — one I/O operation retrieves everything needed for a read.",
        caption:
          "Simulate embedding vs referencing patterns and build a mini aggregation pipeline in Python.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Embedding pattern — blog posts with comments",
              prose: [
                "## Embedding: everything in one document",
                "Small, bounded comments are embedded directly in the post. One fetch = entire post + comments.",
              ],
              code: `import json, copy

# Document store as a dict of dicts (like MongoDB)
posts = {}
users = {}

def insert(collection, doc):
    collection[doc['_id']] = copy.deepcopy(doc)

def find_one(collection, _id):
    return copy.deepcopy(collection.get(_id))

# Insert a post WITH embedded comments (good when comments are few)
insert(posts, {
    "_id": "post_001",
    "title": "Understanding Indexes in SQL",
    "author_id": "user_42",
    "body": "B-trees make O(log n) lookups possible...",
    "tags": ["sql", "performance", "indexes"],
    "stats": {"views": 4823, "likes": 312},
    "comments": [         # EMBEDDED — part of the same document
        {"user": "alice", "text": "Great explanation!", "likes": 12},
        {"user": "bob",   "text": "What about Hash indexes?", "likes": 5},
        {"user": "carol", "text": "This helped me fix a 5-second query!", "likes": 28},
    ]
})

# Reading the post = one fetch, zero joins
post = find_one(posts, "post_001")
print("Fetching post_001:")
print(json.dumps(post, indent=2))
print()
print("One document fetch = title + body + stats + ALL comments. No join.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "Referencing pattern — orders referencing products",
              prose: [
                "## Referencing: avoid duplication of shared data",
                "A product's details live in one place. Orders reference the product by ID. Updating a product name means one update, not millions.",
              ],
              code: `products = {}
orders = {}

# Products: the source of truth
for pid, name, price in [
    ("prod_1", "Laptop Pro", 999.99),
    ("prod_2", "Mechanical Keyboard", 79.99),
    ("prod_3", "Ultra-wide Monitor", 399.99),
]:
    insert(products, {"_id": pid, "name": name, "price": price, "stock": 100})

# Orders reference products by ID — no duplication
insert(orders, {
    "_id": "order_001",
    "customer_id": "user_42",
    "line_items": [
        {"product_id": "prod_1", "qty": 1},  # reference, not embed
        {"product_id": "prod_2", "qty": 2},
    ],
    "status": "confirmed",
    "created_at": "2024-11-15",
})

# Reading an order WITH product details requires an "application-level join"
order = find_one(orders, "order_001")
print("Order:", json.dumps(order, indent=2))

print()
print("To display the order with product names, we join in application code:")
total = 0
for item in order["line_items"]:
    prod = find_one(products, item["product_id"])
    line_total = prod["price"] * item["qty"]
    total += line_total
    print(f"  {prod['name']:30} x{item['qty']} = \${line_total:.2f}")
print(f"  {'Order total':30}   = \${total:.2f}")
print()
print("Tradeoff: product name is NOT duplicated into orders.")
print("Changing a product price = update ONE document. All orders still work correctly.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "Denormalization — duplicate for read speed",
              prose: [
                "## Strategic denormalization",
                "Duplicate high-read, low-change data into documents to avoid the join. This is common when the duplicated data rarely changes.",
              ],
              code: `# Insert some users
for uid, name, avatar in [
    ("user_42", "Alice Chen", "alice.jpg"),
    ("user_7",  "Bob Torres", "bob.jpg"),
]:
    insert(users, {"_id": uid, "name": name, "avatar": avatar, "email": f"{name.split()[0].lower()}@ex.com"})

# DENORMALIZED order: embed author name snapshot to avoid lookup on every order view
insert(orders, {
    "_id": "order_002",
    "customer_id": "user_42",
    # Embed a snapshot of the customer fields we display
    "customer_snapshot": {          # DENORMALIZED — duplicated from users
        "name": "Alice Chen",       # at time of order creation
        "email": "alice@ex.com",
    },
    "line_items": [
        {"product_id": "prod_3", "qty": 1,
         "product_name": "Ultra-wide Monitor",  # also denormalized
         "price_at_purchase": 399.99},           # frozen at purchase time
    ],
    "status": "shipped",
    "created_at": "2024-11-20",
})

order = find_one(orders, "order_002")
print("Denormalized order (no lookup needed to display):")
print(f"  Customer:  {order['customer_snapshot']['name']}")
for item in order["line_items"]:
    print(f"  Product:   {item['product_name']} @ \${item['price_at_purchase']:.2f}")
print()
print("Alice's name is stored IN the order — reading the order page requires zero extra fetches.")
print("If Alice changes her name, old orders correctly still show 'Alice Chen' (historical accuracy).")
print("Tradeoff: if you want to show Alice's CURRENT name, you need the users lookup.")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: "Aggregation pipeline simulation",
              prose: [
                "## The aggregation pipeline",
                "MongoDB's aggregation pipeline is equivalent to a SQL GROUP BY + HAVING + ORDER BY chain. Each stage transforms the stream of documents.",
              ],
              code: `# Simulate MongoDB aggregation pipeline in Python
import json

# More orders data
all_orders = [
    {"_id": f"o{i}", "customer_id": cid, "amount": amt, "status": st, "month": mo}
    for i, (cid, amt, st, mo) in enumerate([
        ("user_42", 999.99, "completed", "Nov"),
        ("user_7",  159.98, "completed", "Nov"),
        ("user_42", 399.99, "completed", "Dec"),
        ("user_7",  999.99, "completed", "Dec"),
        ("user_42",  79.99, "pending",   "Dec"),
        ("user_7",  399.99, "cancelled", "Nov"),
        ("user_42", 499.99, "completed", "Jan"),
    ], 1)
]

def pipeline(docs, *stages):
    stream = list(docs)
    for stage in stages:
        stream = list(stage(stream))
    return stream

# $match — like SQL WHERE
def match(**conditions):
    def stage(docs):
        for doc in docs:
            if all(doc.get(k) == v for k, v in conditions.items()):
                yield doc
    return stage

# $group — like SQL GROUP BY + aggregates
def group(key_fn, **aggs):
    def stage(docs):
        groups = {}
        for doc in docs:
            k = key_fn(doc)
            if k not in groups: groups[k] = {"_id": k, "_docs": []}
            groups[k]["_docs"].append(doc)
        for k, g in groups.items():
            result = {"_id": k}
            for field, (fn, src) in aggs.items():
                vals = [d.get(src) for d in g["_docs"]]
                if fn == "sum":   result[field] = sum(v for v in vals if v)
                if fn == "count": result[field] = len(vals)
                if fn == "avg":   result[field] = sum(v for v in vals if v) / len(vals)
            yield result
    return stage

# $sort
def sort_by(field, reverse=False):
    def stage(docs):
        yield from sorted(docs, key=lambda d: d.get(field, 0), reverse=reverse)
    return stage

# Pipeline: completed orders, revenue per customer
result = pipeline(
    all_orders,
    match(status="completed"),                      # $match
    group(lambda d: d["customer_id"],               # $group
          total_revenue=("sum", "amount"),
          order_count=("count", "_id")),
    sort_by("total_revenue", reverse=True),         # $sort
)

print("Revenue by customer (completed orders only):")
print(f"{'Customer':<15} {'Revenue':>10} {'Orders':>8}")
print("-" * 35)
for doc in result:
    print(f"{doc['_id']:<15} \${doc['total_revenue']:>9.2f} {doc['order_count']:>8}")`,
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
      '**Document model and the storage engine.** MongoDB stores documents as BSON (Binary JSON). BSON is a superset of JSON with additional types (ObjectId, Date, Decimal128, Binary). The WiredTiger storage engine uses B-trees (like SQL) for its indexes, and a journal for durability. Embedded document fields can be individually indexed: `db.users.createIndex({"addresses.city": 1})`.',
      "**$lookup is expensive.** MongoDB's `$lookup` aggregation stage performs a left outer join between two collections. Unlike SQL joins which the query planner can optimize with hash joins or merge joins, `$lookup` in MongoDB requires one lookup per document in the pipeline. Use it sparingly. If you find yourself using `$lookup` on every read for a core data type, reconsider your schema — embed the data instead.",
      "**Multi-document ACID transactions.** MongoDB added multi-document transactions in v4.0 (2018). They work similarly to SQL transactions (session.startTransaction(), session.commitTransaction()). However, they are slower than single-document operations and should be used only when necessary. Single-document atomicity is still the fastest path.",
    ],
  },

  examples: [
    {
      id: "nosql1-002-ex1",
      title: "Schema Design Decision: Comments",
      problem:
        "Design a comment system for a blog. When do you embed and when do you reference?",
      steps: [
        {
          expression: "Post has < 20 comments typically",
          annotation: "EMBED — keep comments array in the post document",
        },
        {
          expression: "Post could have 100,000 comments",
          annotation:
            "REFERENCE — separate comments collection with post_id field",
        },
        {
          expression: "Comments are displayed with the post always",
          annotation: "Embed favored — avoids extra fetch",
        },
        {
          expression: "Comments can be liked, edited, replied to",
          annotation:
            "Reference favored — complex operations on sub-documents are harder",
        },
        {
          expression: "Decision: reference for comments",
          annotation: "Rule: unbounded arrays must be referenced, not embedded",
        },
      ],
      conclusion:
        "The right schema depends on your read patterns and expected data volume. Neither embedding nor referencing is universally better.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "nosql1-002-q1",
        type: "choice",
        text: "A user has followers. Should you embed the followers array in the user document?",
        options: [
          "Yes — it's always faster to embed related data",
          "No — follower lists are unbounded (a celebrity could have 100M followers), violating the embedding rule for bounded arrays",
          "Yes — because you always need the followers when viewing a profile",
          "It doesn't matter — document stores handle any size equally well",
        ],
        answer:
          "No — follower lists are unbounded (a celebrity could have 100M followers), violating the embedding rule for bounded arrays",
      },
      {
        id: "nosql1-002-q2",
        type: "choice",
        text: "Denormalization in document stores means:",
        options: [
          "Removing all schema constraints",
          "Deliberately duplicating data across documents to avoid joins on reads",
          "Splitting documents into smaller pieces",
          "Converting JSON to BSON format",
        ],
        answer:
          "Deliberately duplicating data across documents to avoid joins on reads",
      },
      {
        id: "nosql1-002-q3",
        type: "choice",
        text: "The aggregation pipeline stage equivalent to SQL's GROUP BY is:",
        options: ["$match", "$project", "$group", "$lookup"],
        answer: "$group",
      },
    ],
  },

  mentalModel: [
    "Documents are self-contained JSON — one fetch retrieves everything embedded",
    "Embed: always-together data that is bounded in size",
    "Reference: unbounded arrays, shared data, independently-updated data",
    "Denormalization = deliberate duplication for read speed — update all copies on change",
    "Aggregation pipeline = SQL's GROUP BY / JOIN chain expressed as document transforms",
    "$lookup is expensive — if you use it on every read, rethink your schema",
  ],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A blog post has comments. When should comments be embedded in the post document rather than stored in a separate collection?',
      options: [
        'Always embed — fetching related data in one trip is always faster',
        'Embed when comments are always read with the post, are bounded in count (a few dozen), and never queried independently. Reference them if posts can have thousands of comments (unbounded growth) or if you need queries like "all comments by user X across all posts" — that query requires a separate collection',
        'Embed only when using MongoDB; reference for all other document stores',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Denormalization deliberately duplicates data (e.g., storing user name inside every order document) for read performance. What operational burden does this create?',
      options: [
        'Read queries become twice as slow because two copies must be checked',
        'When data changes (user renames themselves), every document that contains the duplicate must be updated. If a user\'s name appears in 10,000 orders, all 10,000 must be updated atomically — or you accept stale denormalized data. The tradeoff is fast reads at the cost of expensive, multi-document writes',
        'Denormalization violates MongoDB\'s consistency guarantees',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'MongoDB\'s aggregation pipeline stages (match → group → project) replace which SQL constructs?',
      options: [
        'It replaces CREATE TABLE, INSERT, and UPDATE',
        'match = WHERE, group = GROUP BY (with aggregate functions like sum/count/avg), project = SELECT (choosing/transforming fields), sort = ORDER BY, limit = LIMIT. The pipeline expresses the same analytical query as SQL but as a series of document transforms rather than declarative clauses',
        'It replaces foreign keys and JOIN operations only',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '$lookup (MongoDB\'s join) is described as expensive. Why is a join expensive in a distributed document database when it is cheap in a single-node relational database?',
      options: [
        'MongoDB does not have query optimization, so joins always scan the full collection',
        'A SQL database co-locates related tables on one server with optimized B-tree indexes and query planner statistics. MongoDB\'s $lookup must scan (or index-scan) a second collection and may involve a network round-trip if collections are on different shards. The document model is designed around the assumption that you embed what belongs together — $lookup signals a schema that fights the model',
        'JavaScript is slower than SQL for join operations',
      ],
      correct: 1,
    },
  ],
};
