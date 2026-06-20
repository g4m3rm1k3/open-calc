export default {
  id: "nosql1-003",
  slug: "cap-theorem",
  chapter: "nosql-1",
  order: 3,
  title: "The CAP Theorem",
  subtitle:
    "The fundamental tradeoff in distributed systems — and what it means in practice",
  tags: [
    "CAP theorem",
    "consistency",
    "availability",
    "partition tolerance",
    "eventual consistency",
    "CP systems",
    "AP systems",
    "PACELC",
    "distributed systems",
  ],
  aliases:
    "cap theorem consistency availability partition tolerance eventual consistency distributed systems cp ap pacelc brewer",

  hook: {
    question:
      "Two users in different data centers both try to update the same bank balance at the same instant. How does the database decide who wins — and what guarantees can it make?",
    realWorldContext:
      "The CAP theorem is one of the most important results in distributed systems. " +
      "It was conjectured by Eric Brewer at SOSP 2000 and formally proved by Gilbert and Lynch in 2002. " +
      "Every engineer building systems on multiple servers — cloud services, microservices, globally " +
      "distributed databases — is making implicit CAP choices, whether they know it or not. " +
      "Understanding CAP lets you read database documentation critically, " +
      "ask the right questions when choosing infrastructure, " +
      "and design systems that fail gracefully.",
    previewVisualizationId: "PythonNotebook",
  },

  intuition: {
    prose: [
      '**Network partitions are unavoidable.** In any real distributed system running on multiple machines, network failures happen. A switch fails. A cable is cut. AWS declares an AZ degraded. When this happens, two groups of nodes can no longer communicate — they are "partitioned." The CAP theorem\'s key insight: since you cannot prevent partitions, you must decide what to do when one occurs.',
      "**Consistency (C).** Every read returns the most recent write, or an error. No stale data. If you update a value on node 1, any read from node 2 immediately reflects that update. This requires coordination — before responding to any read, the system checks that its data is up to date with all other nodes.",
      "**Availability (A).** Every request receives a response — not an error, not a timeout. The system is always up. Even if the response contains stale data. The node responds immediately with what it has, without checking other nodes.",
      "**Partition Tolerance (P).** The system continues operating even when some nodes cannot communicate. Given that network partitions happen in real systems, P is effectively not optional — you must tolerate partitions. This means the real choice is: during a partition, do you want consistency or availability?",
      "**CP systems: prefer consistency.** When a partition occurs, CP systems refuse to serve reads/writes on isolated nodes — better to return an error than to return wrong data. Examples: Zookeeper, etcd, HBase, Redis (in primary mode). Use for: distributed locks, configuration, anything where wrong data is worse than no data.",
      "**AP systems: prefer availability.** When a partition occurs, AP systems keep serving requests with whatever data they have. Nodes might diverge temporarily; they reconcile when the partition heals. Examples: Cassandra, CouchDB, DynamoDB (in its default mode). Use for: social data, product catalogs, anything where eventual consistency is acceptable.",
    ],
    callouts: [
      {
        type: "definition",
        title: "CAP Theorem",
        body: "**During a network partition, you must choose one:**\n\n**CP (Consistency + Partition Tolerance):**\nSystem refuses requests on isolated nodes to avoid returning stale data.\nResult: some requests return errors or timeouts.\nExamples: Zookeeper, etcd, HBase, MongoDB (with majority write concern)\n\n**AP (Availability + Partition Tolerance):**\nSystem keeps serving all requests, even with potentially stale data.\nResult: different nodes may return different values temporarily.\nExamples: Cassandra, CouchDB, DynamoDB (default), DNS",
      },
      {
        type: "definition",
        title: "Eventual Consistency",
        body: 'In an AP system: if no new updates are made, eventually all reads will return the same value.\n\n"Eventually" could mean milliseconds (same data center) or seconds (cross-region).\n\nEventual consistency does NOT mean: data is randomly wrong. It means: during a partition or right after a write, different replicas may temporarily disagree — but they will converge.',
      },
      {
        type: "insight",
        title: "CA is a myth for distributed systems",
        body: "The CA (no Partition Tolerance) category would mean a system that can guarantee consistency AND availability — but only if the network never fails. Since real networks do fail, CA systems are single-node databases (which don't face the CAP tradeoff at all). For any distributed deployment, you are always choosing between CP and AP.",
      },
      {
        type: "warning",
        title: "CAP is often misapplied",
        body: 'CAP is only about behavior during a network partition. Most of the time, there IS no partition — and then both consistency and availability are achievable. The PACELC extension addresses this: "Else (no partition), choose between Latency (fast response) and Consistency (wait for all replicas to agree)." Real systems live in the PACELC space.',
      },
    ],
    visualizations: [
      {
        id: "PythonNotebook",
        title: "CAP Theorem — Simulating CP vs AP",
        mathBridge:
          "Formal statement: In a distributed system with at least two nodes, it is impossible to simultaneously guarantee all three properties: (1) Consistency — linearizability of all reads/writes; (2) Availability — every request to a non-failing node receives a response; (3) Partition Tolerance — the system continues operating despite message loss between nodes.",
        caption:
          "Simulate a network partition and see how CP and AP systems respond differently to the same situation.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Simulating a distributed key-value store",
              prose: [
                "## Two nodes, one network",
                "We simulate two database nodes that replicate each other. Then we introduce a network partition and see what happens.",
              ],
              code: `import time, copy

class Node:
    def __init__(self, name, partner=None):
        self.name = name
        self.data = {}
        self.partner = partner
        self.partitioned = False  # network partition active?

    def write(self, key, value, cp_mode=True):
        """Write a value. In CP mode, refuse if partitioned."""
        if self.partitioned and cp_mode:
            raise ConnectionError(f"[{self.name}] REFUSED: cannot confirm replication (partition active). CP: no partial writes.")
        self.data[key] = value
        # Try to replicate to partner
        if self.partner and not self.partitioned:
            self.partner.data[key] = value  # synchronous replication

    def read(self, key, cp_mode=True):
        """Read a value. In CP mode, refuse if partitioned."""
        if self.partitioned and cp_mode:
            raise ConnectionError(f"[{self.name}] REFUSED: cannot verify freshness (partition active).")
        return self.data.get(key)

    def ap_write(self, key, value):
        """AP mode: always accept writes, replicate when possible."""
        self.data[key] = value  # write locally, always succeeds
        if self.partner and not self.partitioned:
            self.partner.data[key] = value

    def ap_read(self, key):
        """AP mode: always respond with local data, even if stale."""
        return self.data.get(key)  # return local value, no guarantees

node_a = Node("Node-A")
node_b = Node("Node-B")
node_a.partner = node_b
node_b.partner = node_a

# Normal operation: both nodes agree
node_a.write("balance:alice", 1000)
print(f"Normal operation:")
print(f"  Node-A balance:alice = {node_a.read('balance:alice')}")
print(f"  Node-B balance:alice = {node_b.read('balance:alice')}")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "CP behavior during partition",
              prose: [
                "## CP: refuse rather than risk inconsistency",
                "During a network partition, a CP system returns errors. Correct data is more important than availability.",
              ],
              code: `print("=== NETWORK PARTITION BEGINS ===")
node_a.partitioned = True
node_b.partitioned = True

print()
print("--- CP Mode: Consistency over Availability ---")
# Try to write to Node-A during partition
try:
    node_a.write("balance:alice", 800, cp_mode=True)
    print("Write succeeded (unexpected)")
except ConnectionError as e:
    print(f"Write to Node-A: {e}")

# Try to read from Node-B during partition
try:
    val = node_b.read("balance:alice", cp_mode=True)
    print(f"Read from Node-B: {val}")
except ConnectionError as e:
    print(f"Read from Node-B: {e}")

print()
print("CP guarantees: If you DO get a response, it is CORRECT.")
print("You may get errors during a partition — that is acceptable.")
print("Use CP for: bank balances, distributed locks, inventory counts.")
print()
print("Real CP systems: Zookeeper, etcd, HBase, MongoDB (w/ majority write concern)")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "AP behavior during partition",
              prose: [
                "## AP: serve requests even if data might be stale",
                "During a network partition, an AP system keeps serving. The two nodes can diverge — they will reconcile when the partition heals.",
              ],
              code: `# Same partition — AP mode responses
print("=== DURING PARTITION (AP Mode) ===")
print()

# Write to Node-A during partition — it accepts locally
node_a.ap_write("balance:alice", 800)  # Alice spends $200

# Meanwhile, Node-B also accepts a write (different client, same key!)
node_b.ap_write("balance:alice", 950)  # Another update reaches Node-B

print(f"Node-A sees:  balance:alice = {node_a.ap_read('balance:alice')}")
print(f"Node-B sees:  balance:alice = {node_b.ap_read('balance:alice')}")
print()
print("CONFLICT: two different clients updated the same key on different nodes.")
print("This is a 'write-write conflict' — both writes were accepted.")
print()

# Partition heals — need conflict resolution
print("=== PARTITION HEALS — conflict resolution ===")
node_a.partitioned = False
node_b.partitioned = False

# AP systems have conflict resolution strategies:
# 1. Last-Write-Wins (LWW): whichever write has a later timestamp wins
# 2. Vector clocks: track causality, detect true conflicts
# 3. Application-level merge: the application decides (e.g., CRDTs)

# Simulate Last-Write-Wins
winner = 800  # pretend Node-A's write was more recent
node_a.data["balance:alice"] = winner
node_b.data["balance:alice"] = winner
print(f"After LWW resolution: both nodes = {winner}")
print()
print("AP guarantees: always available, but may serve stale or conflicted data.")
print("Use AP for: shopping carts, social likes/counts, DNS, CDN caches.")
print("Real AP systems: Cassandra, CouchDB, DynamoDB (default), DNS")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: "Real-world CAP classification",
              prose: [
                "## Where popular databases land in CAP",
                "Understanding where your database lands tells you what to expect during failures.",
              ],
              code: `databases = [
    # (Name, CP or AP, consistency model, notes)
    ("PostgreSQL",       "CA*", "ACID serializable",     "Single node — no partition handling (not distributed by default)"),
    ("MySQL",            "CA*", "ACID",                  "Single node — same as PostgreSQL"),
    ("MongoDB (default)","CP",  "Eventually consistent", "Primary-secondary; primary must be reachable"),
    ("MongoDB (majority)","CP", "Strongly consistent",   "Majority write concern: waits for most replicas"),
    ("Cassandra",        "AP",  "Tunable consistency",   "AP by default; can increase consistency at cost of availability"),
    ("DynamoDB (default)","AP", "Eventually consistent", "AP by default; strongly consistent reads available at 2x cost"),
    ("Zookeeper",        "CP",  "Linearizable",          "Used for distributed coordination, locks, leader election"),
    ("etcd",             "CP",  "Linearizable",          "Kubernetes uses this for cluster state — must be consistent"),
    ("Redis (primary)",  "CP",  "Strongly consistent",   "Single primary; replicas can lag (tunable)"),
    ("CouchDB",          "AP",  "Eventual consistency",  "Built for offline-first, multi-master replication"),
    ("HBase",            "CP",  "Strongly consistent",   "Built on HDFS, strong consistency via ZooKeeper"),
    ("DNS",              "AP",  "Eventual consistency",  "Updates propagate in minutes/hours — AP by design"),
]

print(f"{'Database':<25} {'CAP':<5} {'Consistency':<25} Notes")
print("-" * 90)
for db, cap, cons, notes in databases:
    print(f"{db:<25} {cap:<5} {cons:<25} {notes}")

print()
print("* CA means 'consistent and available when no partition' — applies to single-node systems")
print("  which don't face the CAP tradeoff. All distributed systems must choose CP or AP.")`,
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
      '**PACELC model.** The CAP theorem describes behavior during partitions, but ignores the latency-consistency tradeoff that exists all the time. Daniel Abadi\'s PACELC model (2012) extends CAP: "If Partition (P), choose Availability (A) or Consistency (C). Else (E), choose Latency (L) or Consistency (C)." Examples: Cassandra is PA/EL (available during partition, low latency favoring over consistency). Spanner is PC/EC (consistent during partition, consistent even at expense of latency).',
      '**Linearizability vs. Sequential Consistency.** "Consistency" in CAP means linearizability: each operation appears to take effect atomically at some point between its start and end. Sequential consistency is weaker: operations appear in some serial order consistent with each process\'s program order, but not necessarily real-time order. Many AP systems offer sequential consistency but not linearizability.',
      "**Vector clocks and CRDTs.** AP systems must handle write-write conflicts. Vector clocks track causality: if A→B causally, the vector clock for B will dominate A's. If two writes are concurrent (no causal relationship), there is a genuine conflict. CRDTs (Conflict-free Replicated Data Types) are data structures designed so that any order of merging concurrent updates produces the same result. Example: a grow-only counter CRDT always converges because the merge function is MAX(v1, v2).",
    ],
  },

  examples: [
    {
      id: "nosql1-003-ex1",
      title: "Choosing CP vs AP for Real Systems",
      problem: "Classify each use case as requiring CP or AP and explain why.",
      steps: [
        {
          expression: "Bank account balance",
          annotation:
            "CP — showing stale balance is worse than a brief error. Use PostgreSQL or MongoDB with majority read/write concern.",
        },
        {
          expression: "Shopping cart contents",
          annotation:
            "AP — it's acceptable to see a slightly stale cart. Availability matters more than perfect freshness. Amazon famously uses AP here.",
        },
        {
          expression: "Kubernetes cluster state",
          annotation:
            "CP — etcd must be consistent. Wrong cluster state = wrong deployments. An error is better than wrong data.",
        },
        {
          expression: 'Social media "like" count',
          annotation:
            "AP — showing 10,042 instead of 10,043 for a few seconds is fine. Always showing a number matters more.",
        },
        {
          expression: "Distributed leader election (only one leader!)",
          annotation:
            'CP — two nodes both thinking they are the leader is a "split brain" — catastrophic for most systems. Zookeeper is CP for this reason.',
        },
      ],
      conclusion:
        "The right choice depends on the cost of inconsistency vs the cost of unavailability for your specific data.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "nosql1-003-q1",
        type: "choice",
        text: "During a network partition, a CP system will:",
        options: [
          "Serve requests using stale data to remain available",
          "Refuse requests on partitioned nodes to avoid returning inconsistent data",
          "Automatically resolve conflicts using last-write-wins",
          "Broadcast the partition to all clients",
        ],
        answer:
          "Refuse requests on partitioned nodes to avoid returning inconsistent data",
      },
      {
        id: "nosql1-003-q2",
        type: "choice",
        text: '"Eventual consistency" means:',
        options: [
          "Data is eventually deleted after a timeout",
          "If no new updates are made, all reads will eventually return the last written value",
          "The database will eventually become consistent after you fix bugs",
          "Consistency guarantees are only applied once per day",
        ],
        answer:
          "If no new updates are made, all reads will eventually return the last written value",
      },
      {
        id: "nosql1-003-q3",
        type: "choice",
        text: "Kubernetes uses etcd for cluster state. etcd is a CP system. Why does this make sense?",
        options: [
          "Kubernetes only runs on one machine",
          'It is better to refuse a request than to have two nodes both believe they are the cluster leader ("split brain")',
          "etcd is faster than AP systems",
          "Kubernetes does not need high availability",
        ],
        answer:
          'It is better to refuse a request than to have two nodes both believe they are the cluster leader ("split brain")',
      },
    ],
  },

  mentalModel: [
    "Network partitions happen — you cannot avoid P, so the real choice is C vs A",
    "CP: consistent data or an error — never wrong data. Good for finance, coordination, inventory",
    "AP: always responds, may be stale. Good for social data, caches, DNS",
    'Eventual consistency: all replicas converge when updates stop — not "randomly wrong"',
    "Single-node databases (Postgres, MySQL) avoid CAP entirely — no distribution needed",
    "Know where your database sits on the CP/AP spectrum before you rely on it for critical data",
  ],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A CP database during a network partition returns an error rather than a potentially stale value. Why is an error sometimes preferable to a stale answer?',
      options: [
        'Errors are easier to log and debug than wrong data',
        'In domains like bank balances, inventory counts, or distributed locks, a stale answer can cause harm: double-spending, overselling, or two nodes acquiring the same lock. An error tells the caller "I cannot guarantee this answer" — the application can retry or display a safe fallback rather than acting on incorrect data',
        'CP databases have lower latency than AP databases',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'An AP database (like DynamoDB in eventual-consistency mode) always responds during a partition, but the response might be stale. For which use case is this acceptable?',
      options: [
        'Transferring money between bank accounts',
        'Displaying a like count on a social post. If the count is briefly 200 instead of 201, users will not notice or be harmed. The system stays responsive during outages, and the count will converge to the correct value once the partition heals. Availability matters more than exact accuracy here',
        'Checking whether a username is already taken during registration',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Eventual consistency" is often misunderstood. What does it actually guarantee?',
      options: [
        'Reads will eventually return the correct value within 5 seconds',
        'If no new updates are made to a data item, all replicas will converge to the same value — but there is no specified time bound. It does not mean "randomly wrong forever"; it means divergence is temporary and bounded by propagation time. Without further writes, all nodes will agree',
        'The database will eventually upgrade to strong consistency after the partition heals',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A single PostgreSQL instance avoids CAP theorem considerations. Why?',
      options: [
        'PostgreSQL implements all three CAP properties simultaneously',
        'CAP applies to distributed systems — multiple nodes that can be separated by a network partition. A single machine has no network between its components; there is no partition scenario. All data lives in one place, so consistency and availability are always both achievable. The moment you add replicas, you face CAP tradeoffs',
        'PostgreSQL uses ACID which supersedes CAP theorem',
      ],
      correct: 1,
    },
  ],
};
