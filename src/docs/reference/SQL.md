# Complete Software Engineering Tutorial: SQL, Databases, and Database Design

## Part 0: Engineering Foundation (BEFORE CODE)

### 1. Architectural Decision Records (ADRs)

Before we write a single line of SQL, let's make explicit decisions about our technology stack and approach.

#### Technology Choices

| Decision Point | Choice | Alternatives Considered | Rationale | When to Reconsider |
|---------------|--------|------------------------|-----------|-------------------|
| **Database Engine** | PostgreSQL 14+ | MySQL, SQLite, SQL Server, Oracle | PostgreSQL offers best balance of: ACID compliance, standards compliance (SQL:2016), rich type system, open source, excellent documentation, strong community. SQLite too limited for production. MySQL has weaker type system. | If: (1) Using .NET ecosystem (→ SQL Server), (2) Embedded/mobile only (→ SQLite), (3) Legacy Oracle investment |
| **Schema Migration Tool** | Plain SQL files with version numbers | Alembic, Flyway, Liquibase | Learning foundation: raw SQL teaches fundamentals. Migration tools add abstraction before understanding base concepts. | After mastering SQL fundamentals (this tutorial), adopt Flyway for team environments |
| **Development Environment** | Docker container | Local install, Cloud database | Isolation, reproducibility, easy cleanup. Matches production deployment patterns. Local install pollutes system. Cloud requires network/costs. | If: No Docker available (→ local install), Team already uses cloud dev environments |
| **SQL Style** | Explicit, verbose syntax | Abbreviated syntax, ORM-generated SQL | Educational clarity over brevity. Every keyword spelled out. Helps build mental models of what database does. | Never for learning. For production, team style guide dictates. |
| **Design Philosophy** | Normalized (3NF minimum) | Denormalized, Star schema, Document-based | Teaching normalization first establishes principles. Denormalization is intentional optimization, not default. Must understand rules before breaking them. | After this tutorial, learn when to denormalize for performance (OLAP, data warehousing) |
| **Transaction Approach** | Explicit transactions | Auto-commit, implicit transactions | Makes transaction boundaries visible. Teaches ACID properties through practice. Auto-commit hides critical behavior. | Never hide transactions during learning. Production code: depends on framework. |
| **Testing Strategy** | SQL-based integration tests | Unit tests, GUI tools | Test at the database level: ensures constraints work, triggers fire, indexes help. GUI tools teach clicking, not engineering. | Add application-level tests after this foundation. |

#### Why PostgreSQL Specifically?

PostgreSQL was chosen because it:
- **Enforces correctness**: Strong typing, constraint checking, standard SQL compliance
- **Teaches transferable skills**: Most standards-compliant SQL dialect
- **Provides excellent error messages**: Critical for learning
- **Supports advanced features progressively**: Can start simple, grow sophisticated
- **Has exceptional documentation**: Every feature well-explained at postgresql.org

### 2. Domain Model

We'll build a **manufacturing order management system** since you work in manufacturing. This provides concrete, relatable examples.

#### Core Domain Concepts

```
[Customer] --places--> [Order] --contains--> [OrderLine]
                         |                       |
                         |                       v
                         |                  [Product]
                         |                       |
                         v                       v
                   [Shipment]            [BillOfMaterials]
                         |                       |
                         v                       v
                   [ShipmentLine]          [Component]
                         |                       |
                         +----------<uses>-------+
                                     |
                                     v
                                [Inventory]
```

#### Concept Definitions

| Concept | Definition | Identity Rule | Lifecycle |
|---------|-----------|---------------|-----------|
| **Customer** | Legal entity that purchases products | Unique customer_id (surrogate key) + email (natural key) | Created on first order, soft-deleted if inactive >5 years |
| **Product** | Manufactured item available for sale | SKU (stock-keeping unit) - business natural key | Created by product management, versioned if specification changes |
| **Component** | Raw material or subassembly used to build products | Part number (supplier's identifier) | Created when first purchased, never deleted (historical integrity) |
| **Order** | Customer's request to purchase products | Order number (sequential business key) | Created → Confirmed → In Production → Shipped → Closed |
| **OrderLine** | Single product within an order with quantity | Combination of (order_id, line_number) | Created with order, immutable after confirmation |
| **BillOfMaterials (BOM)** | Recipe defining components needed for a product | (product_id, component_id, revision) | Versioned - new revision when recipe changes |
| **Inventory** | Current stock level of component at location | (component_id, location_id, lot_number) | Real-time updated, never deleted (audit trail) |
| **Shipment** | Physical delivery of order to customer | Tracking number from carrier | Created when order ships, updated with carrier events |
| **ShipmentLine** | Which order lines are in which shipment | (shipment_id, order_line_id) | Created when order ships, immutable |

#### Relationships and Cardinality

| Relationship | Cardinality | Enforced By | Business Rule |
|-------------|-------------|-------------|---------------|
| Customer → Order | One to Many | Foreign key `orders.customer_id` | One customer can have unlimited orders |
| Order → OrderLine | One to Many (1+) | Foreign key + CHECK constraint | Order must have at least one line |
| Product → OrderLine | One to Many | Foreign key `order_lines.product_id` | Product can appear in many orders |
| Order → Shipment | One to Many | Foreign key `shipments.order_id` | Order can ship in multiple parcels |
| Product → BillOfMaterials | One to Many | Foreign key `bom.product_id` | Product made from multiple components |
| Component → BillOfMaterials | One to Many | Foreign key `bom.component_id` | Component used in multiple products |
| Component → Inventory | One to Many | Foreign key `inventory.component_id` | Component stocked at multiple locations |

### 3. Invariants (Rules That Must NEVER Be Violated)

These are business rules so critical they must be enforced at the database level, not just application level.

| Invariant | Why It Exists | Enforced Where | What Breaks If Violated | How Enforced |
|-----------|---------------|----------------|------------------------|--------------|
| **INV-1: Order total must equal sum of line totals** | Financial integrity - invoicing correctness | Database trigger | Revenue reporting wrong, customer disputes, audit failures | Calculated column + trigger validation |
| **INV-2: Cannot ship more quantity than ordered** | Prevents over-shipment, inventory errors | CHECK constraint on shipment_lines | Inventory goes negative, financial loss, customer confusion | `shipped_quantity <= order_line.quantity` |
| **INV-3: Email addresses must be unique per customer** | Prevents duplicate accounts, ensures communication | UNIQUE constraint | Multiple accounts for one customer, marketing spam, data integrity | `UNIQUE INDEX` on `LOWER(email)` |
| **INV-4: Inventory cannot be negative** | Physical impossibility - can't have -5 widgets | CHECK constraint | Production planning broken, orders accepted that can't be fulfilled | `quantity_on_hand >= 0` |
| **INV-5: Dates must be chronologically valid** | Causality - can't ship before ordering | CHECK constraints | Business intelligence broken, order status wrong | `shipped_date >= order_date` |
| **INV-6: Money values must be non-negative** | Business rule - we don't pay customers to take products | CHECK constraints | Revenue calculations wrong | `price >= 0`, `total >= 0` |
| **INV-7: Every order line must reference valid product** | Referential integrity | Foreign key with RESTRICT | Orders for non-existent products, fulfillment impossible | `FOREIGN KEY RESTRICT` |
| **INV-8: Deleted entities must preserve history** | Audit compliance, financial reporting | Soft delete pattern | Historical reports break, audit trail lost | `deleted_at TIMESTAMP NULL` instead of DELETE |

#### Invariant Enforcement Strategy

```
Application Layer (Rails, Django, etc.)
         ↓ (provides UI/UX, but can be bypassed)
    -----------
    | CAN BE |  ← Scripts, bugs, direct SQL, imports
    | BYPASSED|
    -----------
         ↓
Database Layer (PostgreSQL)
    -----------
    | ENFORCES |  ← Constraints, triggers, types
    | ALWAYS  |    Cannot be bypassed
    -----------
```

**Critical Principle**: The database is the **last line of defense**. Applications can have bugs. Scripts can be run directly. Imports can bypass validation. The database constraints are the ONLY guarantee.

### 4. Architecture Rules

#### Dependency Direction Rules

```
Presentation Layer (Future: Web UI, API)
         ↓ (depends on)
    Application Layer (Future: Business logic)
         ↓ (depends on)
    ============================================
    DATABASE LAYER (What we're building now)
    ============================================
         ↑ (nothing depends on this)
    Nothing below database
```

**Critical Rule**: The database depends on **nothing**. It is the foundation. Everything else depends on it.

#### Module Dependency Table

| Module | May Import/Reference | May NOT Import/Reference | Why |
|--------|---------------------|-------------------------|-----|
| **Schema (DDL)** | PostgreSQL standard types, extensions | Application code, external services | Schema must be portable, not tied to one app |
| **Data (DML)** | Schema objects (tables, views) | Application logic | Data operations don't contain business logic |
| **Constraints** | Same table columns only | Other tables (use triggers for cross-table) | Keep constraints simple and fast |
| **Triggers** | Multiple tables, functions | External systems, HTTP calls | Triggers synchronous, must be fast |
| **Functions** | Any database object | External systems (unless via extension) | Functions should be pure, deterministic when possible |
| **Views** | Tables, other views (non-circular) | Nothing - views don't have dependencies | Views are derived data |
| **Tests** | Everything above | Production data | Tests must be isolated |

#### Visual Module Structure

```
┌─────────────────────────────────────┐
│         TESTS (verify all)          │
└─────────────────────────────────────┘
              ↑ tests
┌─────────────────────────────────────┐
│      VIEWS (derived data)            │
└─────────────────────────────────────┘
              ↑ query
┌─────────────────────────────────────┐
│   FUNCTIONS (business logic)         │
└─────────────────────────────────────┘
              ↑ call
┌─────────────────────────────────────┐
│   TRIGGERS (enforce invariants)      │
└─────────────────────────────────────┘
              ↑ watch
┌─────────────────────────────────────┐
│   CONSTRAINTS (data integrity)       │
└─────────────────────────────────────┘
              ↑ validate
┌─────────────────────────────────────┐
│   TABLES (schema definition)         │
└─────────────────────────────────────┘
```

**Read from bottom to top**: Tables are foundation. Constraints validate table data. Triggers enforce cross-table rules. Functions encapsulate logic. Views provide convenient queries. Tests verify everything.

### 5. Change Scenarios

Understanding what breaks when things change is critical to good design.

| Change Scenario | What Breaks | Why It Breaks | How Architecture Minimizes Impact |
|----------------|-------------|---------------|----------------------------------|
| **Add new product type** | Nothing (ideally) | If product types hard-coded in CHECK constraint, schema change needed | Use separate `product_types` table, not ENUM or CHECK |
| **Change tax calculation** | Views that compute tax, application code | Tax logic scattered in multiple places | Create `calculate_tax()` function, views call it. One place to change. |
| **Add new order status** | CHECK constraint, application state machines | Status values hard-coded | Use `order_statuses` reference table + foreign key |
| **Split customer into BillTo/ShipTo** | Major: all foreign keys to customer | Assumption of single customer per order | Anticipate: use `billing_customer_id` and `shipping_customer_id` from start |
| **Require audit trail on price changes** | Nothing if designed correctly | If overwriting prices, history lost | Use `price_history` table, never UPDATE prices |
| **Add multi-currency support** | Every money column, calculations | Assumed single currency | Add `currency_code` column early, even if all USD now |
| **Scale to 10M+ orders** | Query performance, but not logic | No indexes on foreign keys | Add indexes proactively on all FK columns |
| **Comply with GDPR (delete customer)** | Referential integrity if hard delete | Foreign keys prevent deletion | Soft delete pattern + anonymization function |

#### Blast Radius Analysis

| Change Type | Blast Radius | Example | Mitigation Strategy |
|-------------|--------------|---------|---------------------|
| **Add column** | Single table | Add `customer.phone` | Small impact, backwards compatible |
| **Add table** | None | Add `product_reviews` | Zero impact on existing system |
| **Change column type** | All queries using column | `quantity INT → DECIMAL` | Needs migration, test all queries |
| **Remove column** | All queries using column | Remove `customer.fax` | Check pg_stat_user_tables for usage first |
| **Add constraint** | Existing data may violate | Add `CHECK quantity > 0` | Clean data first, then add constraint |
| **Change FK relationship** | Major: data model change | Order → multiple customers | Avoid: design correctly upfront |

### 6. Error Taxonomy

Different errors require different handling strategies.

| Error Category | Examples | Should Be Prevented By | Handling Strategy | User Sees |
|---------------|----------|----------------------|-------------------|-----------|
| **User Input Errors** | Negative price, invalid email format, future birth date | Application validation first, DB constraints second | Return specific error message, allow correction | "Email must be valid format" |
| **Data Integrity Errors** | FK violation (order for deleted product), duplicate email, CHECK constraint | Database constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK) | Transaction rolls back, application catches exception | "This product no longer exists" |
| **Concurrency Errors** | Two users updating same inventory simultaneously, lost update | Transaction isolation, optimistic locking | Retry logic, version numbers | "Record changed by another user, please refresh" |
| **System Errors** | Disk full, connection lost, out of memory | Infrastructure monitoring, resource limits | Log, alert ops team, retry if transient | "Service temporarily unavailable" |
| **Programmer Errors** | SQL syntax error, undefined table, type mismatch | Tests, code review, type checking | Fix the code, deploy correction | Never - should not reach production |
| **Business Logic Errors** | Insufficient inventory, credit limit exceeded | Business rules in triggers/functions | Return business exception, suggest resolution | "Insufficient inventory. 47 available, you requested 50" |

#### Error Handling Hierarchy

```
┌─────────────────────────────────────────┐
│  Application (Web/API)                   │
│  - Validates format/range early          │
│  - Provides friendly error messages      │
│  - Handles retries                       │
└─────────────────────────────────────────┘
                ↓ (if validation passes)
┌─────────────────────────────────────────┐
│  Database                                │
│  - Enforces invariants (last defense)    │
│  - Atomic transactions                   │
│  - Rollback on constraint violation      │
└─────────────────────────────────────────┘
```

**Critical Principle**: Applications provide **early, friendly** validation. Databases provide **absolute, final** enforcement. Both are necessary.

### 7. Ownership Boundaries

Clear ownership prevents architectural rot where "everything depends on everything."

| Module/Concept | Owns (Responsible For) | Does NOT Own | Contract/Guarantee | Clients Can Rely On |
|---------------|----------------------|--------------|-------------------|-------------------|
| **customers table** | Customer identity, contact info, status | Order history, payment info (separate tables) | Once created, customer_id never changes. Email unique. | Customer exists if foreign key valid |
| **products table** | Product definition, SKU, current price | Historical prices (price_history table), inventory levels | SKU never changes after creation | Product exists if foreign key valid |
| **orders table** | Order header: customer, dates, status | Individual line items (order_lines table) | Order numbers sequential, never reused | Order total equals sum of lines |
| **inventory table** | Current stock levels, locations | Historical movements (inventory_transactions) | Quantity never negative, updates atomic | Stock available if quantity > 0 |
| **calculate_tax() function** | Tax calculation logic | Tax rates (separate table or config) | Returns deterministic result for same inputs | Same inputs = same output always |
| **order_total_check trigger** | Validates total = sum of lines | Calculating the total (application does) | Fires before INSERT/UPDATE on orders | Invalid totals never persisted |

#### Responsibility Assignment Rules

**Tables** own:
- Their own data integrity (constraints)
- Their primary key generation
- Their default values
- Their check constraints

**Triggers** own:
- Cross-table validation
- Calculated field updates
- Audit logging
- Cascading updates (when appropriate)

**Functions** own:
- Complex calculations
- Business rules that return values
- Reusable logic called from multiple places

**Views** own:
- Derived/calculated data presentation
- Simplified query interfaces
- Security (filtered views)

**Applications** own:
- User interface
- Workflow orchestration
- Calling database in correct order
- Presentation formatting

**What prevents rot**: Each component has ONE clear purpose. If you're asking "should this go in trigger X or function Y?" - you have unclear boundaries. Fix boundaries, don't work around them.

---

## Part 1: Project Structure

Before writing code, let's establish our complete project structure. Every file has a purpose.

```
manufacturing-db/
├── README.md                          # Project overview, setup instructions
├── docker-compose.yml                 # PostgreSQL container definition
├── .env.example                       # Environment variables template
├── .gitignore                         # Don't commit sensitive data
│
├── migrations/                        # Database schema versions
│   ├── 001_create_schema.sql         # Foundational tables
│   ├── 002_add_constraints.sql       # Constraints and indexes
│   ├── 003_create_functions.sql      # Business logic functions
│   ├── 004_create_triggers.sql       # Automated invariant enforcement
│   ├── 005_create_views.sql          # Convenient query interfaces
│   └── 006_seed_data.sql             # Initial test/reference data
│
├── tests/                             # Database tests (TDD approach)
│   ├── test_001_schema.sql           # Verify tables created correctly
│   ├── test_002_constraints.sql      # Verify constraints enforce rules
│   ├── test_003_functions.sql        # Verify functions work correctly
│   ├── test_004_triggers.sql         # Verify triggers fire correctly
│   └── test_005_integration.sql      # End-to-end scenarios
│
├── scripts/                           # Utility scripts
│   ├── setup.sh                      # Initialize database
│   ├── migrate.sh                    # Run migrations
│   ├── test.sh                       # Run all tests
│   ├── reset.sh                      # Drop and recreate (dev only)
│   └── backup.sh                     # Backup database
│
└── docs/                              # Documentation
    ├── schema_diagram.md              # Visual ERD
    ├── business_rules.md              # Documented invariants
    └── query_examples.md              # Common queries with explanations
```

### Why This Structure?

| File/Directory | Why It Exists | What Principle It Represents | Why Not One Big File |
|---------------|---------------|----------------------------|---------------------|
| **migrations/** | Schema evolution over time. Each file is one atomic change. | **Single Responsibility Principle** - each migration does one thing | Mixing all DDL makes impossible to track what changed when |
| **001_create_schema.sql** | Tables first, constraints later. Foundation before enforcement. | **Dependency Order** - build base before adding rules | Can't add FK constraint before target table exists |
| **002_add_constraints.sql** | Separate file because constraints can fail if data dirty | **Fail Fast** - validate clean slate before enforcement | If constraints fail, easier to fix when isolated |
| **003_create_functions.sql** | Functions may reference tables, must come after schema | **Layered Architecture** - logic layer above data layer | Functions need tables to exist first |
| **004_create_triggers.sql** | Triggers reference functions, must come after functions | **Dependency Order** - triggers call functions | Can't call non-existent function |
| **005_create_views.sql** | Views query tables, triggers, functions - come last | **Derived Data** - views depend on everything | Views are convenience layer, built last |
| **006_seed_data.sql** | Test data AFTER all structure exists | **Test Data Separation** - structure vs data | Can't insert data into non-existent tables |
| **tests/** separate | Tests should be runnable independently, repeatedly | **Test Isolation** - tests don't pollute production | Mixing tests with migrations causes accidental execution |
| **scripts/** separate | Automation separate from database definition | **Separation of Concerns** - how to run vs what to run | Shell logic separate from SQL logic |

### Migration Numbering Strategy

```
001_create_schema.sql
002_add_constraints.sql
003_create_functions.sql
 ↑
 └─ Three-digit prefix for sorting
    - Ensures alphabetical = chronological
    - 001-099: Core schema
    - 100-199: Enhancements
    - 200-299: Performance optimizations
    - 900-999: Migrations (in production)
```

**Why sequential numbers?** Timestamps (20250113_create_schema.sql) create merge conflicts when multiple developers work simultaneously. Sequential numbers + version control = clear ordering.

### Environment Isolation

```
Development:   Local Docker (this tutorial)
   ↓
Testing:       CI/CD pipeline runs test suite
   ↓  
Staging:       Replica of production structure
   ↓
Production:    Real customer data
```

**Critical Rule**: Same migration files run in EVERY environment. Never "fix" production manually - create migration, test in dev, promote through pipeline.

---

Now let's build this system using **Test-Driven Development (TDD)**: Write failing test → Write code to pass test → Refactor.

---

## Part 2: Foundation - Docker Environment Setup

### Step 1: Write Failing Test FIRST

Before we create any database, let's define what "success" looks like.

**File: `tests/test_000_environment.sql`**

```sql
-- TEST: Verify PostgreSQL is running and accessible
-- EXPECTED: Query should execute without error
-- WHY: Confirms environment setup before building schema

SELECT 
    version() AS postgres_version,
    current_database() AS database_name,
    current_user AS connected_user;

-- EXPECTED OUTPUT:
-- postgres_version: PostgreSQL 14.x or higher
-- database_name: manufacturing
-- connected_user: postgres or app_user

-- TEST: Verify we can create and drop tables (permissions)
CREATE TABLE environment_test (
    id SERIAL PRIMARY KEY,
    test_value TEXT
);

INSERT INTO environment_test (test_value) VALUES ('permissions_ok');

SELECT test_value FROM environment_test;
-- EXPECTED: 'permissions_ok'

DROP TABLE environment_test;
-- EXPECTED: No error

-- CONCLUSION: If this file runs without errors, environment is ready
```

**File: `scripts/test.sh`**

```bash
#!/bin/bash
# TEST RUNNER: Execute SQL test files and report results

set -e  # Exit on any error

echo "Running environment tests..."

# Try to connect and run test
docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_000_environment.sql

if [ $? -eq 0 ]; then
    echo "✓ Environment tests passed"
else
    echo "✗ Environment tests failed"
    exit 1
fi
```

**Run the test:**

```bash
chmod +x scripts/test.sh
./scripts/test.sh
```

**Expected Result**: **FAILURE** - Docker container doesn't exist yet.

```
Error: No such container: manufacturing-db
✗ Environment tests failed
```

**This is correct!** We wrote the test first. Now let's write the code to make it pass.

---

### Step 2: Implement the Module

**File: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    container_name: manufacturing-db
    environment:
      POSTGRES_DB: manufacturing
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev_password_change_in_production
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d manufacturing"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

**File: `.env.example`**

```
# Copy this file to .env and update values
# Never commit .env to version control

POSTGRES_DB=manufacturing
POSTGRES_USER=postgres
POSTGRES_PASSWORD=dev_password_change_in_production
POSTGRES_PORT=5432
```

**File: `.gitignore`**

```
.env
*.log
.DS_Store
```

**File: `scripts/setup.sh`**

```bash
#!/bin/bash
# SETUP: Initialize development environment

set -e

echo "Starting PostgreSQL container..."
docker-compose up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Wait for health check
until docker exec manufacturing-db pg_isready -U postgres -d manufacturing; do
  echo "Waiting for database..."
  sleep 2
done

echo "✓ Database is ready"
echo ""
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: manufacturing"
echo "  User: postgres"
echo "  Password: dev_password_change_in_production"
echo ""
echo "To connect: psql -h localhost -U postgres -d manufacturing"
```

**Make scripts executable:**

```bash
chmod +x scripts/*.sh
```

**Run setup:**

```bash
./scripts/setup.sh
```

**Now run the test again:**

```bash
./scripts/test.sh
```

**Expected Result**: **SUCCESS** ✓

```
                                                 version                                                  | database_name | connected_user 
-----------------------------------------------------------------------------------------------------------+---------------+----------------
 PostgreSQL 14.10 on x86_64-pc-linux-musl, compiled by gcc (Alpine 12.2.1_git20220924-r4) 12.2.1 20220924 | manufacturing | postgres

 test_value    
---------------
 permissions_ok

✓ Environment tests passed
```

---

### Step 3: Line-by-Line Deep Dive

Let's break down every decision in our Docker Compose configuration.

#### Docker Compose File Analysis

| Line | Code | What It Does (Mechanically) | Why It's Necessary (Architecturally) | What Breaks Without It |
|------|------|---------------------------|-------------------------------------|----------------------|
| 1 | `version: '3.8'` | Specifies Docker Compose file format version | Ensures compatibility with Docker Compose features we use (healthcheck, depends_on) | Older versions may not support healthchecks; newer versions may change syntax |
| 3 | `services:` | Begins service definitions section | Docker Compose can manage multiple containers (db, app, cache); we're defining them here | Without services section, no containers defined |
| 4 | `db:` | Names this service "db" | Service name becomes network hostname. Other containers can connect via `db:5432` | Can't reference service by name from other containers |
| 5 | `image: postgres:14-alpine` | Which Docker image to use | `postgres:14` = PostgreSQL version 14. `alpine` = smaller Linux distribution (5MB vs 80MB base) | Without image, Docker doesn't know what software to run |
| 6 | `container_name: manufacturing-db` | Explicit container name | Default would be `directory-db-1`. Explicit name makes scripts predictable. | Scripts using `docker exec manufacturing-db` would need to dynamically find container name |
| 7-10 | `environment:` | Environment variables passed to container | PostgreSQL container reads these to initialize database | Database wouldn't be created; default user would be `postgres` with no password |
| 8 | `POSTGRES_DB: manufacturing` | Database name to create on first run | PostgreSQL creates this database automatically | Would need manual `CREATE DATABASE` after container starts |
| 9 | `POSTGRES_USER: postgres` | Superuser username | Default is `postgres`, but explicit is better for clarity | Ambiguity about which user to connect as |
| 10 | `POSTGRES_PASSWORD: dev_password...` | Superuser password | Required for authentication. `dev_password...` is intentionally long and obvious it's for development | No password = security risk. Short password = developers might use in production |
| 11-12 | `ports: - "5432:5432"` | Maps host port 5432 to container port 5432 | Allows `psql -h localhost -p 5432` from your machine to reach database inside container | Without port mapping, can't connect from host machine (only from other containers) |
| 13-15 | `volumes:` | Persistent storage and file mounting | Without volumes, data lost when container stops | All data, including tables and migrations, would be ephemeral |
| 14 | `postgres_data:/var/lib/postgresql/data` | Named volume for database files | `/var/lib/postgresql/data` is where PostgreSQL stores tables, indexes, WAL logs | Data survives `docker-compose down`. Without this, every restart = fresh database |
| 15 | `./migrations:/docker-entrypoint-initdb.d` | Mounts local migrations folder into container | PostgreSQL image runs all `.sql` and `.sh` files in `/docker-entrypoint-initdb.d` on first startup | Migrations wouldn't automatically run; manual execution needed |
| 16-20 | `healthcheck:` | Automated container health monitoring | Docker knows when PostgreSQL is actually ready (not just "started") | Scripts would need manual sleep/retry logic. `depends_on` in multi-container setups would start too early |
| 17 | `test: ["CMD-SHELL", "pg_isready..."]` | Command to check if PostgreSQL is ready | `pg_isready` is PostgreSQL utility that returns 0 when database accepts connections | Without healthcheck, `docker-compose up` returns before database is ready |
| 18 | `interval: 10s` | How often to run health check | Balance between catching problems quickly and not overloading container | Too frequent = CPU waste. Too infrequent = slow startup detection |
| 19 | `timeout: 5s` | How long to wait for health check command | If `pg_isready` hangs, declare it failed after 5 seconds | Without timeout, hung database could block forever |
| 20 | `retries: 5` | How many failures before declaring unhealthy | PostgreSQL needs ~5-10 seconds to initialize. 5 retries * 10s interval = 50s max | Too few retries = false negatives on slower machines |
| 22-24 | `volumes:` (top-level) | Named volume definition | Declares `postgres_data` as a Docker-managed volume | Docker wouldn't know where to store the volume data |
| 23 | `postgres_data:` | Volume name (matches line 14) | This is the data that survives container deletion | Without named volume, data stored in anonymous volume (hard to backup/inspect) |
| 24 | `driver: local` | Storage driver for volume | `local` = standard filesystem. Alternatives: NFS, cloud storage | For dev, local is simplest. Production might use networked storage |

#### Concept Deep Dive: Docker Volumes

**What is a Docker volume?**

A volume is persistent storage that survives container deletion. Without volumes, containers are **ephemeral** - all changes lost when container stops.

**Three types of Docker storage:**

| Type | Syntax | When Data Persists | Use Case |
|------|--------|-------------------|----------|
| **Anonymous Volume** | None specified | Until manual `docker volume prune` | Temporary data, caches |
| **Named Volume** | `postgres_data:/var/lib/...` | Forever (until explicitly deleted) | **Database files** (our choice) |
| **Bind Mount** | `./migrations:/docker-entrypoint...` | Forever (it's your filesystem) | **Source code**, config files |

**Why named volume fordata, bind mount for migrations?**

```
Named Volume (postgres_data):
- Data managed by Docker
- Fast performance (Docker optimizes)
- Can't accidentally edit with text editor
- Survives git clean/directory deletion
- Perfect for binary database files

Bind Mount (./migrations):
- You edit files directly
- Changes immediately visible in container
- Version controlled with git
- Can modify without restarting container
- Perfect for SQL scripts
```

#### Concept Deep Dive: PostgreSQL Initialization

When the PostgreSQL Docker container starts for the **first time**, it:

1. Checks if `/var/lib/postgresql/data` is empty
2. If empty, initializes new database cluster
3. Creates database specified in `POSTGRES_DB`
4. Creates user specified in `POSTGRES_USER`
5. **Runs all files** in `/docker-entrypoint-initdb.d` in alphabetical order
6. Marks initialization complete

**Critical Understanding**: This initialization happens **ONLY ONCE**. If you change a migration file, you must:

```bash
# Option 1: Reset everything (dev only)
docker-compose down -v  # -v deletes volumes
docker-compose up -d

# Option 2: Run migration manually
docker exec -i manufacturing-db psql -U postgres -d manufacturing < migrations/002_new_migration.sql
```

**Common Mistakes:**

| Mistake | What Happens | Why |
|---------|-------------|-----|
| Editing migration after first run | Changes ignored | Initialization only runs once |
| Forgetting `-v` flag | Old data remains | Volume persists by design |
| Non-.sql filename in migrations/ | File ignored | Entrypoint script only processes .sql and .sh |
| SQL syntax error in migration | **Container starts, database broken** | Initialization continues even if one file fails |

---

### Step 4: Verify Test Passes

```bash
./scripts/test.sh
```

**Expected Output:**

```
Running environment tests...
                                                 version                                                  | database_name | connected_user 
-----------------------------------------------------------------------------------------------------------+---------------+----------------
 PostgreSQL 14.10 on x86_64-pc-linux-musl, compiled by gcc (Alpine 12.2.1_git20220924-r4) 12.2.1 20220924 | manufacturing | postgres

 test_value    
---------------
 permissions_ok

✓ Environment tests passed
```

**Test Analysis:**

| Test Step | What It Verifies | Why It Matters |
|-----------|-----------------|----------------|
| `SELECT version()` | PostgreSQL is running and correct version | Wrong version might not support features we use (e.g., GENERATED ALWAYS) |
| `SELECT current_database()` | Connected to correct database | Prevents running migrations against wrong database |
| `SELECT current_user` | Correct permissions | Insufficient permissions would cause migrations to fail mid-execution |
| `CREATE TABLE ... DROP TABLE` | Write permissions work | Read-only connection would fail silently until we try to create tables |
| Clean execution (no errors) | Environment is fully operational | Ready to build actual schema |

---

## Part 3: Schema Design - Customer Table (TDD Approach)

Now we build the actual database schema using **Test-Driven Development**.

### Step 1: Write Failing Tests FIRST

**File: `tests/test_001_schema.sql`**

```sql
-- ==============================================================================
-- SCHEMA TESTS: Customer Table
-- ==============================================================================
-- PURPOSE: Verify customer table structure, constraints, and data types
-- APPROACH: Test-Driven Development - tests written before implementation
-- ==============================================================================

-- Suppress NOTICE messages for cleaner output
SET client_min_messages TO WARNING;

-- Start fresh
BEGIN;

-- ==============================================================================
-- TEST GROUP 1: Table Existence and Structure
-- ==============================================================================

-- TEST 1.1: Customer table should exist
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_name = 'customers') = 1,
        'Customer table does not exist';
    RAISE NOTICE 'PASS: Customer table exists';
END $$;

-- TEST 1.2: Customer table should have exactly these columns
DO $$
DECLARE
    expected_columns TEXT[] := ARRAY[
        'customer_id',
        'email',
        'company_name',
        'contact_name',
        'phone',
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    actual_columns TEXT[];
    column_name TEXT;
BEGIN
    -- Get actual columns
    SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
    INTO actual_columns
    FROM information_schema.columns
    WHERE table_name = 'customers';
    
    -- Check each expected column exists
    FOREACH column_name IN ARRAY expected_columns
    LOOP
        ASSERT column_name = ANY(actual_columns),
            FORMAT('Expected column %s not found', column_name);
    END LOOP;
    
    RAISE NOTICE 'PASS: Customer table has correct columns';
END $$;

-- TEST 1.3: Primary key should be customer_id
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'customers' 
            AND constraint_type = 'PRIMARY KEY') = 1,
        'Customer table should have primary key';
        
    ASSERT (SELECT column_name FROM information_schema.key_column_usage
            WHERE table_name = 'customers' 
            AND constraint_name LIKE '%pkey') = 'customer_id',
        'Primary key should be customer_id';
        
    RAISE NOTICE 'PASS: Primary key is customer_id';
END $$;

-- ==============================================================================
-- TEST GROUP 2: Data Type Validation
-- ==============================================================================

-- TEST 2.1: customer_id should be SERIAL (auto-incrementing integer)
DO $$
BEGIN
    ASSERT (SELECT data_type FROM information_schema.columns
            WHERE table_name = 'customers' AND column_name = 'customer_id') = 'integer',
        'customer_id should be integer type';
        
    ASSERT (SELECT column_default FROM information_schema.columns
            WHERE table_name = 'customers' AND column_name = 'customer_id') 
            LIKE 'nextval%',
        'customer_id should have sequence default (SERIAL)';
        
    RAISE NOTICE 'PASS: customer_id is SERIAL type';
END $$;

-- TEST 2.2: Email should be VARCHAR with reasonable length
DO $$
BEGIN
    ASSERT (SELECT data_type FROM information_schema.columns
            WHERE table_name = 'customers' AND column_name = 'email') = 'character varying',
        'Email should be VARCHAR type';
        
    ASSERT (SELECT character_maximum_length FROM information_schema.columns
            WHERE table_name = 'customers' AND column_name = 'email') = 255,
        'Email should have max length 255';
        
    RAISE NOTICE 'PASS: Email is VARCHAR(255)';
END $$;

-- TEST 2.3: Timestamps should be TIMESTAMP type
DO $$
DECLARE
    col TEXT;
BEGIN
    FOREACH col IN ARRAY ARRAY['created_at', 'updated_at', 'deleted_at']
    LOOP
        ASSERT (SELECT data_type FROM information_schema.columns
                WHERE table_name = 'customers' AND column_name = col) 
                IN ('timestamp without time zone', 'timestamp with time zone'),
            FORMAT('%s should be TIMESTAMP type', col);
    END LOOP;
    
    RAISE NOTICE 'PASS: Timestamp columns are correct types';
END $$;

-- ==============================================================================
-- TEST GROUP 3: Constraint Validation
-- ==============================================================================

-- TEST 3.1: Email should be NOT NULL
DO $$
BEGIN
    ASSERT (SELECT is_nullable FROM information_schema.columns
            WHERE table_name = 'customers' AND column_name = 'email') = 'NO',
        'Email should be NOT NULL';
        
    RAISE NOTICE 'PASS: Email is NOT NULL';
END $$;

-- TEST 3.2: Email should be UNIQUE
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'customers' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%email%') >= 1,
        'Email should have UNIQUE constraint';
        
    RAISE NOTICE 'PASS: Email has UNIQUE constraint';
END $$;

-- TEST 3.3: created_at should have default value
DO $$
BEGIN
    ASSERT (SELECT column_default FROM information_schema.columns
            WHERE table_name = 'customers' AND column_name = 'created_at') 
            IS NOT NULL,
        'created_at should have default value';
        
    RAISE NOTICE 'PASS: created_at has default value';
END $$;

-- ==============================================================================
-- TEST GROUP 4: Data Insertion and Retrieval
-- ==============================================================================

-- TEST 4.1: Can insert valid customer
DO $$
DECLARE
    new_customer_id INTEGER;
BEGIN
    INSERT INTO customers (email, company_name, contact_name, phone)
    VALUES ('test@example.com', 'Test Corp', 'John Doe', '555-0100')
    RETURNING customer_id INTO new_customer_id;
    
    ASSERT new_customer_id IS NOT NULL, 'Customer ID should be generated';
    RAISE NOTICE 'PASS: Can insert valid customer (ID: %)', new_customer_id;
END $$;

-- TEST 4.2: Cannot insert duplicate email
DO $$
BEGIN
    -- This should fail
    BEGIN
        INSERT INTO customers (email, company_name)
        VALUES ('test@example.com', 'Duplicate Corp');
        
        -- If we get here, test failed
        RAISE EXCEPTION 'Should not allow duplicate email';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'PASS: Duplicate email correctly rejected';
    END;
END $$;

-- TEST 4.3: Cannot insert NULL email
DO $$
BEGIN
    BEGIN
        INSERT INTO customers (company_name) VALUES ('No Email Corp');
        RAISE EXCEPTION 'Should not allow NULL email';
    EXCEPTION
        WHEN not_null_violation THEN
            RAISE NOTICE 'PASS: NULL email correctly rejected';
    END;
END $$;

-- TEST 4.4: created_at should auto-populate
DO $$
DECLARE
    customer_created_at TIMESTAMP;
BEGIN
    INSERT INTO customers (email, company_name)
    VALUES ('timestamp_test@example.com', 'Timestamp Test')
    RETURNING created_at INTO customer_created_at;
    
    ASSERT customer_created_at IS NOT NULL, 'created_at should be populated';
    ASSERT customer_created_at <= NOW(), 'created_at should not be in future';
    ASSERT customer_created_at > NOW() - INTERVAL '1 minute', 
        'created_at should be recent';
        
    RAISE NOTICE 'PASS: created_at auto-populated correctly';
END $$;

-- ==============================================================================
-- CLEANUP
-- ==============================================================================

ROLLBACK;  -- Don't save test data

\echo ''
\echo '=================================================='
\echo 'CUSTOMER TABLE TESTS COMPLETE'
\echo '=================================================='
\echo 'If you see this message, all tests passed!'
\echo ''
```

**Run the test:**

```bash
docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_001_schema.sql
```

**Expected Result**: **FAILURE** - Customer table doesn't exist yet.

```
ERROR:  relation "customers" does not exist
```

**Perfect!** We've defined what success looks like. Now let's implement it.

---

### Step 2: Implement the Module

**File: `migrations/001_create_schema.sql`**

```sql
-- ==============================================================================
-- MIGRATION 001: Create Core Schema - Customers Table
-- ==============================================================================
-- PURPOSE: Establish foundational customer table with identity and contact info
-- AUTHOR: Manufacturing DB Tutorial
-- DATE: 2025-01-13
-- DEPENDENCIES: None (first migration)
-- ==============================================================================

-- Enable UUID extension (for future use if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE: customers
-- ==============================================================================
-- PURPOSE: Store customer identity and contact information
-- RATIONALE: Customers are central to orders, shipments, and business operations
-- OWNERSHIP: Owns customer identity; does NOT own order history or payment details
-- ==============================================================================

CREATE TABLE customers (
    -- ============================================================
    -- IDENTITY: Surrogate key for internal references
    -- ============================================================
    customer_id     SERIAL          PRIMARY KEY,
    
    -- ============================================================
    -- NATURAL KEYS: Business identifiers
    -- ============================================================
    email           VARCHAR(255)    NOT NULL,
    
    -- ============================================================
    -- ATTRIBUTES: Customer information
    -- ============================================================
    company_name    VARCHAR(255)    NULL,
    contact_name    VARCHAR(255)    NULL,
    phone           VARCHAR(50)     NULL,
    
    -- ============================================================
    -- AUDIT TRAIL: Track record lifecycle
    -- ============================================================
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP       NULL,
    
    -- ============================================================
    -- CONSTRAINTS: Data integrity rules
    -- ============================================================
    CONSTRAINT customers_email_unique 
        UNIQUE (email),
    
    CONSTRAINT customers_email_format_check 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ==============================================================================
-- INDEXES: Performance optimization
-- ==============================================================================

-- Index for email lookups (used in login, duplicate checking)
-- NOTE: UNIQUE constraint already creates an index, but we make it explicit here
-- for documentation purposes. PostgreSQL will not create duplicate.
CREATE UNIQUE INDEX idx_customers_email_lower 
    ON customers (LOWER(email));

-- Index for soft-delete filtering (most queries filter deleted_at IS NULL)
CREATE INDEX idx_customers_not_deleted 
    ON customers (customer_id) 
    WHERE deleted_at IS NULL;

-- ==============================================================================
-- COMMENTS: Documentation embedded in database
-- ==============================================================================

COMMENT ON TABLE customers IS 
    'Customer master table: stores customer identity and contact information. '
    'Does not contain order history or payment details (see orders, payments tables).';

COMMENT ON COLUMN customers.customer_id IS 
    'Surrogate primary key. Auto-incrementing integer. Never changes after creation.';

COMMENT ON COLUMN customers.email IS 
    'Customer email address. Natural key. Must be unique (case-insensitive). '
    'Used for authentication and communication. Cannot be NULL.';

COMMENT ON COLUMN customers.company_name IS 
    'Company name if B2B customer, NULL for individual consumers. Optional field.';

COMMENT ON COLUMN customers.contact_name IS 
    'Primary contact person name. Optional. For B2B: who to contact. For B2C: customer name.';

COMMENT ON COLUMN customers.phone IS 
    'Contact phone number. Optional. Format not enforced to accommodate international numbers.';

COMMENT ON COLUMN customers.created_at IS 
    'Timestamp when customer record was created. Auto-populated. Never updated.';

COMMENT ON COLUMN customers.updated_at IS 
    'Timestamp when customer record was last modified. Auto-populated by trigger.';

COMMENT ON COLUMN customers.deleted_at IS 
    'Soft delete timestamp. NULL = active customer. Non-NULL = deleted (for historical integrity).';

-- ==============================================================================
-- VALIDATION
-- ==============================================================================

-- Verify table was created
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        RAISE EXCEPTION 'Migration failed: customers table was not created';
    END IF;
    RAISE NOTICE 'Migration 001 completed successfully: customers table created';
END $$;
```

**Reset database and re-run:**

```bash
# Stop and remove container + volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for initialization
sleep 10

# Run tests
docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_001_schema.sql
```

**Expected Result**: **SUCCESS** ✓

```
NOTICE:  PASS: Customer table exists
NOTICE:  PASS: Customer table has correct columns
NOTICE:  PASS: Primary key is customer_id
NOTICE:  PASS: customer_id is SERIAL type
NOTICE:  PASS: Email is VARCHAR(255)
NOTICE:  PASS: Timestamp columns are correct types
NOTICE:  PASS: Email is NOT NULL
NOTICE:  PASS: Email has UNIQUE constraint
NOTICE:  PASS: created_at has default value
NOTICE:  PASS: Can insert valid customer (ID: 1)
NOTICE:  PASS: Duplicate email correctly rejected
NOTICE:  PASS: NULL email correctly rejected
NOTICE:  PASS: created_at auto-populated correctly

==================================================
CUSTOMER TABLE TESTS COMPLETE
==================================================
If you see this message, all tests passed!
```

---

### Step 3: Line-by-Line Deep Dive

Let's analyze every single line of our first table definition.

#### CREATE TABLE Statement Analysis

| Line | Code | What It Does (Mechanically) | Why It's Necessary (Architecturally) | What Breaks Without It | Alternatives Rejected |
|------|------|---------------------------|-------------------------------------|----------------------|---------------------|
| 1 | `CREATE TABLE customers (` | Begins table definition | Declares new storage structure in database | No table = nowhere to store customer data | **Alternative**: Use JSON in single `data` table. **Rejected**: No type safety, no constraints, no joins |
| 5 | `customer_id SERIAL PRIMARY KEY,` | Creates auto-incrementing integer column as primary key | Every row needs unique identifier for relationships. SERIAL auto-generates sequential numbers. | No ID = can't reference customer from orders. Manual IDs = race conditions, gaps | **Alt 1**: UUID. **Rejected**: Harder to read, larger indexes. **Alt 2**: Email as PK. **Rejected**: Can't change email |
| 9 | `email VARCHAR(255) NOT NULL,` | Variable-length string up to 255 chars, required | Email is natural key and communication channel. 255 is RFC 5321 max local+domain length | No email = can't contact customer, can't prevent duplicates | **Alt 1**: TEXT. **Rejected**: No length limit encourages abuse. **Alt 2**: CHAR(255). **Rejected**: Wastes space padding |
| 13 | `company_name VARCHAR(255) NULL,` | Optional company name | B2B customers have companies, B2C don't. NULL represents "not applicable" | Making required = can't store individual consumers | **Alt 1**: Empty string ''. **Rejected**: NULL vs '' semantic confusion. **Alt 2**: Separate B2B table. **Rejected**: Over-engineering for one field |
| 14 | `contact_name VARCHAR(255) NULL,` | Optional contact person | Some customers anonymous (walk-ins), some have names | Required = must invent fake names | **Alt 1**: Default 'Unknown'. **Rejected**: Fake data pollutes reports |
| 15 | `phone VARCHAR(50) NULL,` | Optional phone number as string | International formats vary (country codes, extensions). Not all customers provide phone | Making INTEGER = can't store +1-555-0100 or extensions | **Alt 1**: Multiple columns (country, area, number). **Rejected**: Complex, many NULLs. **Alt 2**: Enforce format. **Rejected**: Breaks international |
| 19 | `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,` | Auto-populated timestamp when row inserted | Audit trail: when was customer added? Required for reporting, compliance | No timestamp = can't analyze signup trends, can't debug issues | **Alt 1**: Application provides timestamp. **Rejected**: Trusts app (can be wrong), not enforced. **Alt 2**: `timestamptz`. **Considered**: Adds complexity, conversion needed |
| 20 | `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,` | Auto-populated timestamp, updated by trigger | Audit trail: when was customer last modified? | No timestamp = can't see if record stale | **Alt 1**: Application updates. **Rejected**: Easily forgotten, not enforced |
| 21 | `deleted_at TIMESTAMP NULL,` | Soft delete timestamp (NULL = active) | **Soft delete pattern**: Never truly delete customers (orders reference them, compliance/audit) | Hard DELETE = orphaned foreign keys, lost history, audit violations | **Alt 1**: `is_deleted BOOLEAN`. **Rejected**: Doesn't record when deleted. **Alt 2**: `deleted_by` separate table. **Future**: When we add users |
| 26-27 | `CONSTRAINT customers_email_unique UNIQUE (email),` | Prevents duplicate emails | Business rule INV-3: One account per email. Prevents confusion, unauthorized access | No constraint = multiple accounts for one person, support nightmare | **Alt 1**: Application checks. **Rejected**: Race condition, can be bypassed. **Alt 2**: Unique index only. **Rejected**: Named constraint gives better errors |
| 29-30 | `CHECK (email ~* '^[A-Za-z0-9._%+-]+@...')` | Validates email format with regex | Catches typos at insert time, not later. `~*` is case-insensitive regex match | No check = garbage emails ('notanemail'), undeliverable | **Alt 1**: Application validation only. **Rejected**: Can be bypassed. **Alt 2**: More complex regex. **Rejected**: Diminishing returns, some valid emails fail |

#### Concept Deep Dive: SERIAL vs INTEGER vs UUID

**What is SERIAL?**

`SERIAL` is PostgreSQL shorthand for:
```sql
customer_id INTEGER NOT NULL DEFAULT nextval('customers_customer_id_seq')
```

It creates:
1. An INTEGER column
2. A sequence (auto-incrementing counter)
3. A default value that calls the sequence

**Comparison Table:**

| Type | Storage | Example Value | Pros | Cons | When to Use |
|------|---------|---------------|------|------|-------------|
| **SERIAL** | 4 bytes | 1, 2, 3... | Human-readable, compact, fast indexes, natural ordering | Sequential = predictable, gaps on rollback, single-server only | **Most tables** (our choice) |
| **BIGSERIAL** | 8 bytes | 1, 2, 3... up to 9 quintillion | Like SERIAL but won't overflow | 2x storage vs SERIAL | High-volume tables (logs, events) |
| **UUID** | 16 bytes | `550e8400-e29b-41d4-a716-446655440000` | Globally unique, distributed systems | 4x storage, hard to read, no natural order | Distributed databases, public APIs |
| **Natural Key** | Varies | `CUST-2025-001` | Business meaning, human-readable | Can change (requires updates), often composite | Reference data (country codes, product categories) |

**Why SERIAL for customer_id?**

```
Scenario: Application inserts 3 customers simultaneously

With SERIAL:
  Transaction 1: Gets ID 1 from sequence
  Transaction 2: Gets ID 2 from sequence (no collision)
  Transaction 3: Gets ID 3 from sequence
  Result: All succeed, no conflicts

Without SERIAL (manual IDs):
  Transaction 1: Calculates MAX(customer_id) = NULL, uses ID 1
  Transaction 2: Calculates MAX(customer_id) = NULL, uses ID 1 (COLLISION!)
  Transaction 3: Calculates MAX(customer_id) = NULL, uses ID 1
  Result: Two transactions fail with duplicate key error
```

**Critical Understanding**: Sequences are **outside transactions**. Once `nextval()` is called, that number is "consumed" even if transaction rolls back. This prevents race conditions but creates gaps.

```sql
BEGIN;
  INSERT INTO customers (email) VALUES ('test@example.com');  -- Gets ID 1
ROLLBACK;

-- ID 1 is now gone forever

BEGIN;
  INSERT INTO customers (email) VALUES ('real@example.com');  -- Gets ID 2 (not 1)
COMMIT;
```

**This is correct behavior!** Gaps in IDs don't matter. What matters is uniqueness and no collisions.

#### Concept Deep Dive: NULL vs Empty String

One of the most confusing aspects of SQL for beginners.

**NULL means**: "This information does not exist" or "Not applicable"
**Empty string '' means**: "This information exists and is explicitly empty"

| Scenario | Correct Value | Wrong Value | Why |
|----------|---------------|-------------|-----|
| Customer didn't provide company name | `company_name = NULL` | `company_name = ''` | NULL = not applicable (they're an individual). '' = they work for a company with no name (impossible) |
| Customer works for company "Acme Corp" | `company_name = 'Acme Corp'` | Either | Clear data |
| Customer works for company but name unknown | `company_name = ''` | `company_name = NULL` | We know it exists but don't know it ('' = known unknown, NULL = doesn't exist) |

**SQL Behavior Differences:**

```sql
-- NULL is NOT equal to NULL!
SELECT * FROM customers WHERE company_name = NULL;  -- Returns 0 rows (wrong!)
SELECT * FROM customers WHERE company_name IS NULL;  -- Returns rows with NULL (correct!)

-- Empty string IS equal to empty string
SELECT * FROM customers WHERE company_name = '';  -- Returns rows with ''

-- Concatenation
SELECT contact_name || ' at ' || company_name FROM customers;
-- If company_name is NULL: Result is NULL (entire string becomes NULL!)
-- If company_name is '': Result is "John at " (empty but exists)

-- Aggregation
SELECT COUNT(company_name) FROM customers;
-- Counts only non-NULL values

SELECT COUNT(*) FROM customers;
-- Counts all rows including NULLs
```

**Our Rule**: Use NULL for "not applicable", empty string for "unknown but applicable". When in doubt, use NULL.

#### Concept Deep Dive: Constraints vs Indexes

Students often confuse constraints and indexes.

| Feature | Constraint | Index |
|---------|-----------|-------|
| **Purpose** | Enforce data integrity rules | Speed up queries |
| **Examples** | PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK | CREATE INDEX |
| **Failure Effect** | INSERT/UPDATE rejected | Query is slow but works |
| **Performance** | Slightly slows writes | Speeds reads, slows writes |
| **Required?** | For correctness | For performance |

**Example:**

```sql
-- This creates TWO things:
CONSTRAINT customers_email_unique UNIQUE (email)

-- 1. A CONSTRAINT: Rejects duplicate emails
-- 2. An INDEX: Speeds up lookups by email

-- So this is redundant (but harmless):
CREATE UNIQUE INDEX idx_customers_email ON customers (email);

-- But this is NOT redundant:
CREATE UNIQUE INDEX idx_customers_email_lower ON customers (LOWER(email));
```

**Why LOWER(email) index?**

```sql
-- Without LOWER() index:
INSERT INTO customers (email) VALUES ('test@example.com');  -- Succeeds
INSERT INTO customers (email) VALUES ('TEST@example.com');  -- Succeeds (different case!)

-- This violates INV-3: emails should be unique regardless of case

-- With LOWER() index:
INSERT INTO customers (email) VALUES ('test@example.com');  -- Succeeds
INSERT INTO customers (email) VALUES ('TEST@example.com');  -- FAILS: duplicate key

-- The index on LOWER(email) makes 'test@example.com' and 'TEST@example.com' 
-- collapse to the same value: 'test@example.com'
```

**Critical Understanding**: `UNIQUE (email)` is case-sensitive. `UNIQUE INDEX ON LOWER(email)` is case-insensitive. We want case-insensitive uniqueness (RFC 5321: email local parts are case-insensitive in practice).

#### Concept Deep Dive: Soft Delete Pattern

**Hard Delete** (what we DON'T do):
```sql
DELETE FROM customers WHERE customer_id = 1;
```

**Problems with hard delete:**
1. **Referential integrity**: What if orders reference this customer?
```sql
-- This FAILS if orders exist:
DELETE FROM customers WHERE customer_id = 1;
-- ERROR: update or delete on table "customers" violates foreign key constraint
```

2. **Audit trail lost**: Can't see who placed historical orders
3. **Compliance violations**: GDPR requires ability to restore data if user requests

**Soft Delete** (our approach):
```sql
UPDATE customers SET deleted_at = CURRENT_TIMESTAMP WHERE customer_id = 1;
```

**Benefits:**
1. Orders still reference valid customer
2. Historical reports work
3. Can "undelete": `UPDATE customers SET deleted_at = NULL WHERE customer_id = 1;`

**Query Pattern:**
```sql
-- Get active customers only (most common):
SELECT * FROM customers WHERE deleted_at IS NULL;

-- Get all customers including deleted (admin/audit):
SELECT * FROM customers;

-- Get only deleted customers (rare):
SELECT * FROM customers WHERE deleted_at IS NOT NULL;
```

**Index for Performance:**
```sql
CREATE INDEX idx_customers_not_deleted 
    ON customers (customer_id) 
    WHERE deleted_at IS NULL;
```

This is a **partial index** - only indexes rows where `deleted_at IS NULL`. Since 99% of queries filter by this, the index is much smaller and faster.

---

## Part 4: Products and Bill of Materials (Complex Relationships)

### Step 1: Write Failing Tests FIRST

**File: `tests/test_002_products_bom.sql`**

```sql
-- ==============================================================================
-- SCHEMA TESTS: Products and Bill of Materials
-- ==============================================================================
-- PURPOSE: Verify product table, components, and many-to-many BOM relationship
-- COMPLEXITY: Tests foreign keys, composite keys, and recursive relationships
-- ==============================================================================

SET client_min_messages TO WARNING;

BEGIN;

-- ==============================================================================
-- TEST GROUP 1: Products Table Structure
-- ==============================================================================

-- TEST 1.1: Products table should exist with correct columns
DO $$
DECLARE
    expected_columns TEXT[] := ARRAY[
        'product_id',
        'sku',
        'product_name',
        'description',
        'unit_price',
        'category',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    actual_columns TEXT[];
    col TEXT;
BEGIN
    SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
    INTO actual_columns
    FROM information_schema.columns
    WHERE table_name = 'products';
    
    ASSERT actual_columns IS NOT NULL, 'Products table does not exist';
    
    FOREACH col IN ARRAY expected_columns
    LOOP
        ASSERT col = ANY(actual_columns),
            FORMAT('Expected column %s not found in products', col);
    END LOOP;
    
    RAISE NOTICE 'PASS: Products table has correct structure';
END $$;

-- TEST 1.2: SKU should be unique and NOT NULL
DO $$
BEGIN
    ASSERT (SELECT is_nullable FROM information_schema.columns
            WHERE table_name = 'products' AND column_name = 'sku') = 'NO',
        'SKU should be NOT NULL';
        
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'products' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%sku%') >= 1,
        'SKU should have UNIQUE constraint';
        
    RAISE NOTICE 'PASS: SKU is unique and NOT NULL';
END $$;

-- TEST 1.3: unit_price should be NUMERIC and non-negative
DO $$
BEGIN
    ASSERT (SELECT data_type FROM information_schema.columns
            WHERE table_name = 'products' AND column_name = 'unit_price') = 'numeric',
        'unit_price should be NUMERIC type';
        
    -- Check for CHECK constraint on unit_price
    ASSERT (SELECT COUNT(*) FROM information_schema.check_constraints cc
            JOIN information_schema.constraint_column_usage ccu 
                ON cc.constraint_name = ccu.constraint_name
            WHERE ccu.table_name = 'products' 
            AND ccu.column_name = 'unit_price'
            AND cc.check_clause LIKE '%>=%') >= 1,
        'unit_price should have non-negative CHECK constraint';
        
    RAISE NOTICE 'PASS: unit_price is NUMERIC with CHECK constraint';
END $$;

-- ==============================================================================
-- TEST GROUP 2: Components Table Structure
-- ==============================================================================

-- TEST 2.1: Components table should exist
DO $$
DECLARE
    expected_columns TEXT[] := ARRAY[
        'component_id',
        'part_number',
        'component_name',
        'unit_of_measure',
        'unit_cost',
        'created_at'
    ];
    actual_columns TEXT[];
    col TEXT;
BEGIN
    SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
    INTO actual_columns
    FROM information_schema.columns
    WHERE table_name = 'components';
    
    ASSERT actual_columns IS NOT NULL, 'Components table does not exist';
    
    FOREACH col IN ARRAY expected_columns
    LOOP
        ASSERT col = ANY(actual_columns),
            FORMAT('Expected column %s not found in components', col);
    END LOOP;
    
    RAISE NOTICE 'PASS: Components table has correct structure';
END $$;

-- TEST 2.2: part_number should be unique
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'components' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%part_number%') >= 1,
        'part_number should have UNIQUE constraint';
        
    RAISE NOTICE 'PASS: part_number is unique';
END $$;

-- ==============================================================================
-- TEST GROUP 3: Bill of Materials (BOM) Table Structure
-- ==============================================================================

-- TEST 3.1: BOM table should exist with composite key
DO $$
DECLARE
    expected_columns TEXT[] := ARRAY[
        'bom_id',
        'product_id',
        'component_id',
        'quantity_required',
        'revision',
        'notes',
        'created_at'
    ];
    actual_columns TEXT[];
    col TEXT;
BEGIN
    SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
    INTO actual_columns
    FROM information_schema.columns
    WHERE table_name = 'bill_of_materials';
    
    ASSERT actual_columns IS NOT NULL, 'bill_of_materials table does not exist';
    
    FOREACH col IN ARRAY expected_columns
    LOOP
        ASSERT col = ANY(actual_columns),
            FORMAT('Expected column %s not found in bill_of_materials', col);
    END LOOP;
    
    RAISE NOTICE 'PASS: BOM table has correct structure';
END $$;

-- TEST 3.2: BOM should have foreign keys to products and components
DO $$
BEGIN
    -- Check product_id foreign key
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'bill_of_materials'
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%product%') >= 1,
        'BOM should have foreign key to products';
        
    -- Check component_id foreign key
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'bill_of_materials'
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%component%') >= 1,
        'BOM should have foreign key to components';
        
    RAISE NOTICE 'PASS: BOM has foreign keys to products and components';
END $$;

-- TEST 3.3: quantity_required should be positive
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.check_constraints cc
            JOIN information_schema.constraint_column_usage ccu 
                ON cc.constraint_name = ccu.constraint_name
            WHERE ccu.table_name = 'bill_of_materials' 
            AND ccu.column_name = 'quantity_required'
            AND cc.check_clause LIKE '%>%') >= 1,
        'quantity_required should have positive CHECK constraint';
        
    RAISE NOTICE 'PASS: quantity_required must be positive';
END $$;

-- TEST 3.4: Should have UNIQUE constraint on (product_id, component_id, revision)
DO $$
DECLARE
    constraint_columns TEXT[];
BEGIN
    -- Get columns in the unique constraint for BOM
    SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
    INTO constraint_columns
    FROM information_schema.key_column_usage
    WHERE table_name = 'bill_of_materials'
    AND constraint_name IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints
        WHERE table_name = 'bill_of_materials'
        AND constraint_type = 'UNIQUE'
    );
    
    ASSERT 'product_id' = ANY(constraint_columns), 
        'UNIQUE constraint should include product_id';
    ASSERT 'component_id' = ANY(constraint_columns), 
        'UNIQUE constraint should include component_id';
    ASSERT 'revision' = ANY(constraint_columns), 
        'UNIQUE constraint should include revision';
        
    RAISE NOTICE 'PASS: BOM has composite UNIQUE constraint';
END $$;

-- ==============================================================================
-- TEST GROUP 4: Data Insertion and Integrity
-- ==============================================================================

-- TEST 4.1: Can insert valid product
DO $$
DECLARE
    new_product_id INTEGER;
BEGIN
    INSERT INTO products (sku, product_name, unit_price, category, is_active)
    VALUES ('WIDGET-001', 'Standard Widget', 29.99, 'Widgets', TRUE)
    RETURNING product_id INTO new_product_id;
    
    ASSERT new_product_id IS NOT NULL, 'Product should be created';
    RAISE NOTICE 'PASS: Can insert valid product (ID: %)', new_product_id;
END $$;

-- TEST 4.2: Cannot insert product with duplicate SKU
DO $$
BEGIN
    BEGIN
        INSERT INTO products (sku, product_name, unit_price)
        VALUES ('WIDGET-001', 'Duplicate Widget', 39.99);
        RAISE EXCEPTION 'Should not allow duplicate SKU';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'PASS: Duplicate SKU correctly rejected';
    END;
END $$;

-- TEST 4.3: Cannot insert product with negative price
DO $$
BEGIN
    BEGIN
        INSERT INTO products (sku, product_name, unit_price)
        VALUES ('WIDGET-002', 'Negative Price Widget', -10.00);
        RAISE EXCEPTION 'Should not allow negative price';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASS: Negative price correctly rejected';
    END;
END $$;

-- TEST 4.4: Can insert valid component
DO $$
DECLARE
    new_component_id INTEGER;
BEGIN
    INSERT INTO components (part_number, component_name, unit_of_measure, unit_cost)
    VALUES ('STEEL-PLATE-001', 'Steel Plate 10x10cm', 'EA', 5.50)
    RETURNING component_id INTO new_component_id;
    
    ASSERT new_component_id IS NOT NULL, 'Component should be created';
    RAISE NOTICE 'PASS: Can insert valid component (ID: %)', new_component_id;
END $$;

-- TEST 4.5: Can create BOM relationship
DO $$
DECLARE
    test_product_id INTEGER;
    test_component_id INTEGER;
    new_bom_id INTEGER;
BEGIN
    -- Create product
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('BOM-TEST-001', 'BOM Test Product', 100.00)
    RETURNING product_id INTO test_product_id;
    
    -- Create component
    INSERT INTO components (part_number, component_name, unit_cost)
    VALUES ('BOM-COMP-001', 'BOM Test Component', 10.00)
    RETURNING component_id INTO test_component_id;
    
    -- Create BOM entry
    INSERT INTO bill_of_materials (product_id, component_id, quantity_required, revision)
    VALUES (test_product_id, test_component_id, 3, 1)
    RETURNING bom_id INTO new_bom_id;
    
    ASSERT new_bom_id IS NOT NULL, 'BOM entry should be created';
    RAISE NOTICE 'PASS: Can create BOM relationship (ID: %)', new_bom_id;
END $$;

-- TEST 4.6: Cannot create BOM with non-existent product (FK constraint)
DO $$
DECLARE
    test_component_id INTEGER;
BEGIN
    -- Create component
    INSERT INTO components (part_number, component_name, unit_cost)
    VALUES ('FK-TEST-001', 'FK Test Component', 5.00)
    RETURNING component_id INTO test_component_id;
    
    BEGIN
        -- Try to create BOM with invalid product_id
        INSERT INTO bill_of_materials (product_id, component_id, quantity_required)
        VALUES (999999, test_component_id, 1);
        RAISE EXCEPTION 'Should not allow BOM with non-existent product';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'PASS: Foreign key constraint prevents invalid product reference';
    END;
END $$;

-- TEST 4.7: Cannot create BOM with zero or negative quantity
DO $$
DECLARE
    test_product_id INTEGER;
    test_component_id INTEGER;
BEGIN
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('QTY-TEST-001', 'Quantity Test Product', 50.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO components (part_number, component_name, unit_cost)
    VALUES ('QTY-TEST-001', 'Quantity Test Component', 5.00)
    RETURNING component_id INTO test_component_id;
    
    BEGIN
        INSERT INTO bill_of_materials (product_id, component_id, quantity_required)
        VALUES (test_product_id, test_component_id, 0);
        RAISE EXCEPTION 'Should not allow zero quantity';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASS: Zero quantity correctly rejected';
    END;
END $$;

-- TEST 4.8: Cannot create duplicate BOM entry (same product+component+revision)
DO $$
DECLARE
    test_product_id INTEGER;
    test_component_id INTEGER;
BEGIN
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('DUP-BOM-001', 'Duplicate BOM Test', 75.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO components (part_number, component_name, unit_cost)
    VALUES ('DUP-BOM-COMP-001', 'Duplicate BOM Component', 8.00)
    RETURNING component_id INTO test_component_id;
    
    -- First BOM entry succeeds
    INSERT INTO bill_of_materials (product_id, component_id, quantity_required, revision)
    VALUES (test_product_id, test_component_id, 2, 1);
    
    BEGIN
        -- Second identical entry should fail
        INSERT INTO bill_of_materials (product_id, component_id, quantity_required, revision)
        VALUES (test_product_id, test_component_id, 5, 1);
        RAISE EXCEPTION 'Should not allow duplicate BOM entry';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'PASS: Duplicate BOM entry correctly rejected';
    END;
END $$;

-- TEST 4.9: CAN create BOM with different revision (versioning)
DO $$
DECLARE
    test_product_id INTEGER;
    test_component_id INTEGER;
BEGIN
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('REV-TEST-001', 'Revision Test Product', 60.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO components (part_number, component_name, unit_cost)
    VALUES ('REV-TEST-COMP-001', 'Revision Test Component', 7.00)
    RETURNING component_id INTO test_component_id;
    
    -- Revision 1
    INSERT INTO bill_of_materials (product_id, component_id, quantity_required, revision)
    VALUES (test_product_id, test_component_id, 2, 1);
    
    -- Revision 2 should succeed (different revision)
    INSERT INTO bill_of_materials (product_id, component_id, quantity_required, revision)
    VALUES (test_product_id, test_component_id, 3, 2);
    
    RAISE NOTICE 'PASS: Can create multiple BOM revisions';
END $$;

-- ==============================================================================
-- TEST GROUP 5: Referential Integrity on Delete
-- ==============================================================================

-- TEST 5.1: Cannot delete product that has BOM entries (RESTRICT)
DO $$
DECLARE
    test_product_id INTEGER;
    test_component_id INTEGER;
BEGIN
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('DELETE-TEST-001', 'Delete Test Product', 80.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO components (part_number, component_name, unit_cost)
    VALUES ('DELETE-TEST-COMP-001', 'Delete Test Component', 9.00)
    RETURNING component_id INTO test_component_id;
    
    INSERT INTO bill_of_materials (product_id, component_id, quantity_required)
    VALUES (test_product_id, test_component_id, 1);
    
    BEGIN
        DELETE FROM products WHERE product_id = test_product_id;
        RAISE EXCEPTION 'Should not allow deleting product with BOM entries';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'PASS: Cannot delete product with BOM entries (RESTRICT works)';
    END;
END $$;

-- TEST 5.2: Cannot delete component that is used in BOM
DO $$
DECLARE
    test_product_id INTEGER;
    test_component_id INTEGER;
BEGIN
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('DELETE-TEST-002', 'Delete Test Product 2', 90.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO components (part_number, component_name, unit_cost)
    VALUES ('DELETE-TEST-COMP-002', 'Delete Test Component 2', 11.00)
    RETURNING component_id INTO test_component_id;
    
    INSERT INTO bill_of_materials (product_id, component_id, quantity_required)
    VALUES (test_product_id, test_component_id, 4);
    
    BEGIN
        DELETE FROM components WHERE component_id = test_component_id;
        RAISE EXCEPTION 'Should not allow deleting component used in BOM';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'PASS: Cannot delete component used in BOM (RESTRICT works)';
    END;
END $$;

ROLLBACK;

\echo ''
\echo '=================================================='
\echo 'PRODUCTS AND BOM TESTS COMPLETE'
\echo '=================================================='
\echo 'If you see this message, all tests passed!'
\echo ''
```

**Run the test:**

```bash
docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_002_products_bom.sql
```

**Expected Result**: **FAILURE** - Tables don't exist yet.

```
ERROR:  relation "products" does not exist
```

---

### Step 2: Implement the Module

**File: `migrations/002_create_products_components.sql`**

```sql
-- ==============================================================================
-- MIGRATION 002: Create Products, Components, and Bill of Materials
-- ==============================================================================
-- PURPOSE: Establish product catalog and manufacturing recipes
-- DEPENDENCIES: Migration 001 (customers table)
-- ARCHITECTURAL PATTERN: Many-to-many relationship through junction table
-- ==============================================================================

-- ==============================================================================
-- TABLE: products
-- ==============================================================================
-- PURPOSE: Product catalog - items we manufacture and sell
-- OWNERSHIP: Owns product definition; does NOT own inventory levels or pricing history
-- ==============================================================================

CREATE TABLE products (
    -- ============================================================
    -- IDENTITY: Surrogate key
    -- ============================================================
    product_id      SERIAL          PRIMARY KEY,
    
    -- ============================================================
    -- NATURAL KEY: Business identifier (Stock Keeping Unit)
    -- ============================================================
    sku             VARCHAR(50)     NOT NULL,
    
    -- ============================================================
    -- ATTRIBUTES: Product information
    -- ============================================================
    product_name    VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    unit_price      NUMERIC(10,2)   NOT NULL,
    category        VARCHAR(100)    NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    
    -- ============================================================
    -- AUDIT TRAIL
    -- ============================================================
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP       NULL,
    
    -- ============================================================
    -- CONSTRAINTS
    -- ============================================================
    CONSTRAINT products_sku_unique 
        UNIQUE (sku),
    
    CONSTRAINT products_sku_format_check
        CHECK (sku ~ '^[A-Z0-9\-]+$'),
        
    CONSTRAINT products_price_non_negative_check
        CHECK (unit_price >= 0),
        
    CONSTRAINT products_name_not_empty_check
        CHECK (LENGTH(TRIM(product_name)) > 0)
);

-- ==============================================================================
-- TABLE: components
-- ==============================================================================
-- PURPOSE: Raw materials and subassemblies used to manufacture products
-- OWNERSHIP: Owns component definition; does NOT own inventory levels
-- NEVER DELETE: Components are historical record (used in old BOMs)
-- ==============================================================================

CREATE TABLE components (
    -- ============================================================
    -- IDENTITY: Surrogate key
    -- ============================================================
    component_id    SERIAL          PRIMARY KEY,
    
    -- ============================================================
    -- NATURAL KEY: Supplier's part number
    -- ============================================================
    part_number     VARCHAR(100)    NOT NULL,
    
    -- ============================================================
    -- ATTRIBUTES: Component information
    -- ============================================================
    component_name  VARCHAR(255)    NOT NULL,
    unit_of_measure VARCHAR(20)     NOT NULL DEFAULT 'EA',
    unit_cost       NUMERIC(10,2)   NOT NULL DEFAULT 0,
    
    -- ============================================================
    -- AUDIT TRAIL: Created only, never updated/deleted
    -- ============================================================
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- ============================================================
    -- CONSTRAINTS
    -- ============================================================
    CONSTRAINT components_part_number_unique
        UNIQUE (part_number),
        
    CONSTRAINT components_cost_non_negative_check
        CHECK (unit_cost >= 0),
        
    CONSTRAINT components_uom_valid_check
        CHECK (unit_of_measure IN ('EA', 'LB', 'KG', 'M', 'FT', 'L', 'GAL', 'BOX'))
);

-- ==============================================================================
-- TABLE: bill_of_materials (BOM)
-- ==============================================================================
-- PURPOSE: Many-to-many junction table defining product recipes
-- PATTERN: Junction table with additional attributes (quantity_required, revision)
-- VERSIONING: Same product+component can have multiple revisions
-- ==============================================================================

CREATE TABLE bill_of_materials (
    -- ============================================================
    -- IDENTITY: Surrogate key for easy reference
    -- ============================================================
    bom_id              SERIAL          PRIMARY KEY,
    
    -- ============================================================
    -- FOREIGN KEYS: The many-to-many relationship
    -- ============================================================
    product_id          INTEGER         NOT NULL,
    component_id        INTEGER         NOT NULL,
    
    -- ============================================================
    -- ATTRIBUTES: Junction table data
    -- ============================================================
    quantity_required   NUMERIC(10,4)   NOT NULL,
    revision            INTEGER         NOT NULL DEFAULT 1,
    notes               TEXT            NULL,
    
    -- ============================================================
    -- AUDIT TRAIL
    -- ============================================================
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- ============================================================
    -- FOREIGN KEY CONSTRAINTS
    -- ============================================================
    CONSTRAINT bom_product_fk
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
        
    CONSTRAINT bom_component_fk
        FOREIGN KEY (component_id)
        REFERENCES components(component_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- ============================================================
    -- BUSINESS CONSTRAINTS
    -- ============================================================
    CONSTRAINT bom_quantity_positive_check
        CHECK (quantity_required > 0),
        
    CONSTRAINT bom_revision_positive_check
        CHECK (revision > 0),
        
    -- ============================================================
    -- UNIQUENESS: Prevent duplicate entries for same revision
    -- ============================================================
    CONSTRAINT bom_product_component_revision_unique
        UNIQUE (product_id, component_id, revision)
);

-- ==============================================================================
-- INDEXES: Performance optimization
-- ==============================================================================

-- Product lookups by SKU (business key)
CREATE UNIQUE INDEX idx_products_sku_upper 
    ON products (UPPER(sku));

-- Product filtering by active status
CREATE INDEX idx_products_active 
    ON products (is_active) 
    WHERE deleted_at IS NULL;

-- Product filtering by category
CREATE INDEX idx_products_category 
    ON products (category) 
    WHERE deleted_at IS NULL AND is_active = TRUE;

-- Component lookups by part number
CREATE UNIQUE INDEX idx_components_part_number_upper 
    ON components (UPPER(part_number));

-- BOM lookups: "What components does this product need?"
CREATE INDEX idx_bom_product_id 
    ON bill_of_materials (product_id);

-- BOM reverse lookups: "What products use this component?"
CREATE INDEX idx_bom_component_id 
    ON bill_of_materials (component_id);

-- BOM current revision lookup
CREATE INDEX idx_bom_current_revision 
    ON bill_of_materials (product_id, revision DESC);

-- ==============================================================================
-- COMMENTS: Database documentation
-- ==============================================================================

COMMENT ON TABLE products IS 
    'Product catalog: finished goods we manufacture and sell. '
    'Does not include inventory levels (see inventory table). '
    'Use soft delete (deleted_at) to preserve historical order references.';

COMMENT ON COLUMN products.sku IS 
    'Stock Keeping Unit: unique business identifier. '
    'Format: UPPERCASE letters, numbers, hyphens. Example: WIDGET-2000-BLU. '
    'Immutable after creation - SKUs are permanent identifiers.';

COMMENT ON COLUMN products.unit_price IS 
    'Current selling price per unit. '
    'Historical prices tracked separately (see price_history table in future migration). '
    'NUMERIC(10,2) = up to 99,999,999.99 (10 digits total, 2 after decimal).';

COMMENT ON COLUMN products.is_active IS 
    'Whether product is currently offered for sale. '
    'FALSE = discontinued but not deleted (preserves history). '
    'Different from deleted_at: inactive products still visible, deleted are hidden.';

COMMENT ON TABLE components IS 
    'Raw materials and subassemblies used in manufacturing. '
    'Never delete components - they appear in historical BOMs. '
    'If component discontinued, stop ordering but keep record.';

COMMENT ON COLUMN components.part_number IS 
    'Supplier part number. Unique identifier from vendor. '
    'Examples: STEEL-PLATE-4X8, BOLT-M8-100MM, PAINT-RED-5L';

COMMENT ON COLUMN components.unit_of_measure IS 
    'How component is measured/counted. '
    'EA=Each (discrete items), LB=Pounds, KG=Kilograms, M=Meters, etc. '
    'Must match how supplier sells it for accurate costing.';

COMMENT ON TABLE bill_of_materials IS 
    'Product recipes: which components are needed to build each product. '
    'Many-to-many: one product uses many components, one component used in many products. '
    'Versioned: revision field allows recipe changes over time without losing history.';

COMMENT ON COLUMN bill_of_materials.quantity_required IS 
    'How many of this component needed to build ONE unit of the product. '
    'NUMERIC(10,4) allows fractional quantities: 0.5 LB, 2.25 M, etc. '
    'Unit depends on component.unit_of_measure.';

COMMENT ON COLUMN bill_of_materials.revision IS 
    'Recipe version number. Increment when changing quantities or substituting components. '
    'Example: Revision 1 uses 2 steel plates, Revision 2 uses 3 (lighter grade). '
    'Allows tracking which revision was used for historical orders.';

-- ==============================================================================
-- VALIDATION
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RAISE EXCEPTION 'Migration failed: products table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'components') THEN
        RAISE EXCEPTION 'Migration failed: components table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bill_of_materials') THEN
        RAISE EXCEPTION 'Migration failed: bill_of_materials table not created';
    END IF;
    
    RAISE NOTICE 'Migration 002 completed successfully: products, components, BOM created';
END $$;
```

**Reset and run:**

```bash
docker-compose down -v
docker-compose up -d
sleep 10

# Run both test files
docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_001_schema.sql
docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_002_products_bom.sql
```

**Expected Result**: **SUCCESS** ✓

```
NOTICE:  PASS: Products table has correct structure
NOTICE:  PASS: SKU is unique and NOT NULL
NOTICE:  PASS: unit_price is NUMERIC with CHECK constraint
NOTICE:  PASS: Components table has correct structure
NOTICE:  PASS: part_number is unique
NOTICE:  PASS: BOM table has correct structure
NOTICE:  PASS: BOM has foreign keys to products and components
NOTICE:  PASS: quantity_required must be positive
NOTICE:  PASS: BOM has composite UNIQUE constraint
NOTICE:  PASS: Can insert valid product (ID: 1)
NOTICE:  PASS: Duplicate SKU correctly rejected
NOTICE:  PASS: Negative price correctly rejected
NOTICE:  PASS: Can insert valid component (ID: 1)
NOTICE:  PASS: Can create BOM relationship (ID: 1)
NOTICE:  PASS: Foreign key constraint prevents invalid product reference
NOTICE:  PASS: Zero quantity correctly rejected
NOTICE:  PASS: Duplicate BOM entry correctly rejected
NOTICE:  PASS: Can create multiple BOM revisions
NOTICE:  PASS: Cannot delete product with BOM entries (RESTRICT works)
NOTICE:  PASS: Cannot delete component used in BOM (RESTRICT works)

==================================================
PRODUCTS AND BOM TESTS COMPLETE
==================================================
```

---

### Step 3: Line-by-Line Deep Dive

#### Foreign Key Constraints Analysis

| Line | Code | What It Does | Why It's Necessary | What Breaks Without It | Trade-offs |
|------|------|--------------|-------------------|----------------------|-----------|
| 134-137 | `CONSTRAINT bom_product_fk FOREIGN KEY (product_id) REFERENCES products(product_id)` | Enforces referential integrity: product_id in BOM must exist in products table | Prevents orphaned BOM entries pointing to non-existent products | Could insert BOM for product_id=999 even though no such product exists. Data corruption. | **Pro**: Guaranteed data integrity. **Con**: Slightly slower inserts (FK check required) |
| 138 | `ON DELETE RESTRICT` | Prevents deleting product if BOM entries reference it | Preserves historical data. Can't accidentally delete product still used in manufacturing | Could delete product, leaving BOM entries orphaned. Manufacturing broken. | **Alt**: `ON DELETE CASCADE` (delete BOM when product deleted). **Rejected**: Loses manufacturing history |
| 139 | `ON UPDATE CASCADE` | If product_id changes (rare), automatically update BOM entries | Maintains referential integrity during ID changes | If we somehow changed product_id from 5 to 6, BOM would still point to 5 (broken link) | **Alt**: `ON UPDATE RESTRICT` (prevent ID changes). **Considered**: IDs shouldn't change, but CASCADE is defensive |
| 141-145 | `CONSTRAINT bom_component_fFK (component_id) REFERENCES components` | Same pattern for component side of relationship | Prevents BOM from referencing non-existent components | Could reference part_number that doesn't exist in components table | Same trade-offs as product FK |

#### Concept Deep Dive: Foreign Key Actions

**What is ON DELETE RESTRICT?**

```sql
-- Setup: Product with BOM entry
INSERT INTO products (sku, product_name, unit_price) 
VALUES ('WIDGET-001', 'Widget', 50.00);  -- Gets product_id = 1

INSERT INTO components (part_number, component_name, unit_cost)
VALUES ('STEEL-001', 'Steel Plate', 10.00);  -- Gets component_id = 1

INSERT INTO bill_of_materials (product_id, component_id, quantity_required)
VALUES (1, 1, 2);  -- Widget needs 2 steel plates

-- Try to delete product:
DELETE FROM products WHERE product_id = 1;
-- ERROR: update or delete on table "products" violates foreign key constraint "bom_product_fk"
-- DETAIL: Key (product_id)=(1) is still referenced from table "bill_of_materials"
```

**The database is saying**: "I can't delete this product because BOM entries depend on it. Fix those first."

**All Foreign Key DELETE Actions:**

| Action | Behavior | When to Use | Example |
|--------|----------|-------------|---------|
| **RESTRICT** | Prevent delete if referenced | **Most cases** - preserves data | Products/Components (our choice) |
| **NO ACTION** | Same as RESTRICT (checked at end of transaction) | Default, but RESTRICT is clearer | - |
| **CASCADE** | Delete referenced rows too | Parent-child relationships only | Delete order → delete order lines |
| **SET NULL** | Set foreign key to NULL | Optional relationships | Delete manager → employee.manager_id = NULL |
| **SET DEFAULT** | Set foreign key to default value | Rare | Delete category → product.category = 'Uncategorized' |

**Why RESTRICT for BOM?**

```
Scenario: We delete a product that has BOM entries

With RESTRICT (our choice):
  1. Database checks if BOM entries exist
  2. BOM entries exist → REJECT delete
  3. User must explicitly: DELETE FROM bill_of_materials WHERE product_id = X
  4. Then: DELETE FROM products WHERE product_id = X
  Result: Intentional two-step process. Can't accidentally lose BOM data.

With CASCADE (alternative):
  1. DELETE FROM products WHERE product_id = X
  2. Database automatically: DELETE FROM bill_of_materials WHERE product_id = X
  3. BOM data silently gone
  Result: Convenient but dangerous. Lose manufacturing recipes unintentionally.
```

**Our Engineering Decision**: RESTRICT forces developers to think. Manufacturing recipes are valuable intellectual property. Don't make it easy to delete.

#### Concept Deep Dive: Composite UNIQUE Constraints

**What is a composite constraint?**

A constraint that spans multiple columns. All columns together must be unique.

**File: Look at line 157-158:**
```sql
CONSTRAINT bom_product_component_revision_unique
    UNIQUE (product_id, component_id, revision)
```

**What this means:**

| product_id | component_id | revision | Allowed? | Why |
|------------|--------------|----------|----------|-----|
| 1 | 5 | 1 | ✓ First entry | New combination |
| 1 | 5 | 1 | ✗ Duplicate | Exact duplicate of row 1 |
| 1 | 5 | 2 | ✓ Different revision | revision differs |
| 1 | 6 | 1 | ✓ Different component | component_id differs |
| 2 | 5 | 1 | ✓ Different product | product_id differs |

**Why composite instead of three separate UNIQUE constraints?**

```sql
-- WRONG APPROACH: Separate constraints
CONSTRAINT unique_product UNIQUE (product_id)     -- Product can only appear once total
CONSTRAINT unique_component UNIQUE (component_id)  -- Component can only appear once total
CONSTRAINT unique_revision UNIQUE (revision)       -- Each revision number appears once total

-- This would mean:
-- - Product 1 can only have ONE BOM entry ever (wrong!)
-- - Component 5 can only be used in ONE product ever (wrong!)
-- - Revision 1 can only exist once in entire table (wrong!)

-- RIGHT APPROACH: Composite constraint
CONSTRAINT unique_together UNIQUE (product_id, component_id, revision)

-- This means:
-- - Product 1 can have MANY BOM entries (different components)
-- - Component 5 can be used in MANY products
-- - Revision 1 can appear many times (for different product+component pairs)
-- - But product 1 + component 5 + revision 1 is unique
```

**Real-world example:**

```sql
-- Product: Premium Widget (product_id=1)
-- Revision 1 (original recipe):
INSERT INTO bill_of_materials VALUES (1, 1, 10, 2, 1);  -- Steel plate, qty 2
INSERT INTO bill_of_materials VALUES (1, 2, 15, 4, 1);  -- Bolts, qty 4
INSERT INTO bill_of_materials VALUES (1, 3, 20, 1, 1);  -- Paint, qty 1

-- Revision 2 (cost reduction: thinner steel, more bolts):
INSERT INTO bill_of_materials VALUES (1, 1, 11, 3, 2);  -- Steel plate, qty 3 (thinner grade)
INSERT INTO bill_of_materials VALUES (1, 2, 16, 6, 2);  -- Bolts, qty 6 (more for strength)
INSERT INTO bill_of_materials VALUES (1, 3, 21, 1, 2);  -- Paint, qty 1 (same)

-- Both revisions coexist!
-- Production can use revision 1 for old orders, revision 2 for new orders
```

#### Concept Deep Dive: NUMERIC vs DECIMAL vs FLOAT

**What's the difference?**

| Type | Precision | Storage | Use Case |
|------|-----------|---------|----------|
| **NUMERIC(10,2)** | Exact, specified | Variable | **Money, measurements** (our choice) |
| **DECIMAL(10,2)** | Same as NUMERIC | Variable | Alias for NUMERIC |
| **FLOAT / REAL** | Approximate | Fixed (4 or 8 bytes) | Scientific calculations |
| **INTEGER** | Exact, whole numbers | Fixed (4 bytes) | Counts, IDs |

**Why NUMERIC for prices and quantities?**

```sql
-- NUMERIC: Exact decimal arithmetic
SELECT 0.1 + 0.2 AS result;
-- result: 0.3 (exact!)

-- FLOAT: Approximate arithmetic
SELECT 0.1::FLOAT + 0.2::FLOAT AS result;
-- result: 0.30000000000000004 (binary representation error!)
```

**Real-world disaster with FLOAT:**

```sql
-- Product costs $0.10
-- Customer orders 100 units
-- Expected total: $10.00

-- With FLOAT:
SELECT 100 * 0.10::FLOAT;
-- Result: 9.999999999999998

-- Multiply by millions of transactions:
-- Company loses thousands of dollars to rounding errors!

-- With NUMERIC(10,2):
SELECT 100 * 0.10::NUMERIC(10,2);
-- Result: 10.00 (exact!)
```

**What does NUMERIC(10,2) mean?**

```
NUMERIC(precision, scale)
        ↑          ↑
        |          └─ Digits AFTER decimal point
        └─ Total digits (before + after decimal)

NUMERIC(10,2):
- Total: 10 digits
- After decimal: 2 digits
- Before decimal: 10-2 = 8 digits
- Range: -99999999.99 to 99999999.99
- Storage: Variable (1-4 bytes overhead + 2 bytes per 4 digits)
```

**Examples:**

| Value | Fits in NUMERIC(10,2)? | Why |
|-------|----------------------|-----|
| 29.99 | ✓ | 2 before, 2 after = 4 digits total |
| 12345678.90 | ✓ | 8 before, 2 after = 10 digits (max) |
| 123456789.00 | ✗ | 9 before, 2 after = 11 digits (too many) |
| 100.999 | ✗ | 3 digits after decimal (rounds to 101.00) |
| 0.1 | ✓ | Stored as 0.10 |

**Critical Understanding**: NUMERIC stores values **exactly as decimal numbers**, not binary approximations. This is why it's required for financial calculations.

#### Concept Deep Dive: Junction Tables (Many-to-Many)

**Problem**: How do we represent "Products use Components, Components are used in Products"?

**Wrong Approach 1**: Put components in products table

```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(50),
    component1_id INTEGER,  -- What if product needs 5 components?
    component2_id INTEGER,  -- What if different products need different counts?
    component3_id INTEGER   -- Fixed columns = inflexible
);
```

**Problems**:
- Fixed number of components (what if product needs 10?)
- Can't store quantity needed
- Can't track revisions

**Wrong Approach 2**: Put products in components table

```sql
CREATE TABLE components (
    component_id SERIAL PRIMARY KEY,
    part_number VARCHAR(100),
    used_in_product1 INTEGER,  -- Same problems as above
    used_in_product2 INTEGER
);
```

**RIGHT APPROACH**: Junction table (bill_of_materials)

```sql
-- Products table: Just product data
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(50),
    product_name VARCHAR(255)
);

-- Components table: Just component data
CREATE TABLE components (
    component_id SERIAL PRIMARY KEY,
    part_number VARCHAR(100),
    component_name VARCHAR(255)
);

-- Junction table: The relationship + extra attributes
CREATE TABLE bill_of_materials (
    bom_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id),
    component_id INTEGER REFERENCES components(component_id),
    quantity_required NUMERIC(10,4),  -- Extra attribute!
    revision INTEGER,                  -- Extra attribute!
    UNIQUE (product_id, component_id, revision)
);
```

**Visual representation:**

```
Products Table:          Junction Table (BOM):         Components Table:
┌────────────┐          ┌──────────────────┐          ┌──────────────┐
│ product_id │          │ product_id   ────┼─────────→│ component_id │
│ sku        │←─────────┼───   1           │          │ part_number  │
│ name       │          │ component_id ────┼─────→ 5  │ name         │
└────────────┘          │ quantity: 2      │          └──────────────┘
     1                   │ revision: 1      │               5
                        └──────────────────┘

Product 1 uses Component 5, quantity 2, revision 1
```

**Query patterns enabled:**

```sql
-- What components does Product 1 need?
SELECT c.component_name, b.quantity_required
FROM bill_of_materials b
JOIN components c ON b.component_id = c.component_id
WHERE b.product_id = 1;

-- What products use Component 5?
SELECT p.product_name, b.quantity_required
FROM bill_of_materials b
JOIN products p ON b.product_id = p.product_id
WHERE b.component_id = 5;

-- Total cost to build Product 1 (material cost only):
SELECT SUM(c.unit_cost * b.quantity_required) AS total_material_cost
FROM bill_of_materials b
JOIN components c ON b.component_id = c.component_id
WHERE b.product_id = 1 AND b.revision = (
    SELECT MAX(revision) 
    FROM bill_of_materials 
    WHERE product_id = 1
);
```

**Junction Table Pattern Rules**:

1. **Always** has foreign keys to both sides
2. **Usually** has additional attributes (quantity, date, revision)
3. **Always** has composite uniqueness constraint
4. **Sometimes** has its own surrogate key (bom_id) for convenience

---

### Step 4: Indexes - Performance Deep Dive

#### Index Purpose Table

| Index | Purpose | Query Pattern It Optimizes | Without Index | With Index |
|-------|---------|---------------------------|---------------|------------|
| `idx_products_sku_upper` | Case-insensitive SKU lookup | `WHERE UPPER(sku) = 'WIDGET-001'` | Full table scan: O(n) | Index seek: O(log n) |
| `idx_products_active` | Filter active non-deleted products | `WHERE is_active = TRUE AND deleted_at IS NULL` | Scan all rows, check condition | Partial index: only scans matching rows |
| `idx_bom_product_id` | Find components for product | `WHERE product_id = 5` | Scan entire BOM table | Jump directly to product 5's rows |
| `idx_bom_component_id` | Find products using component | `WHERE component_id = 12` | Scan entire BOM table | Jump directly to component 12's rows |

#### Concept Deep Dive: When Indexes Help vs Hurt

**Indexes are NOT free. They have costs:**

| Cost | Impact | Example |
|------|--------|---------|
| **Storage** | Indexes take disk space | 1M products, index on SKU = ~50MB extra |
| **Write Performance** | Every INSERT/UPDATE/DELETE updates indexes | Insert product: write to table + 4 indexes |
| **Maintenance** | Indexes need periodic vacuuming/rebuilding | Database slows over time if not maintained |

**When to add an index:**

```
✓ Add index if:
  - Column used in WHERE clause frequently
  - Column used in JOIN conditions
  - Column used in ORDER BY
  - Table has >1000 rows (small tables don't benefit)
  - Query is slow without index

✗ Don't add index if:
  - Column rarely queried
  - Table has <1000 rows
  - Column has low cardinality (few distinct values)
  - More indexes than needed (each index slows writes)
```

**Cardinality Example:**

```sql
-- HIGH cardinality: Good for indexing
-- email: Every customer has different email (1M customers = 1M distinct values)
CREATE INDEX idx_customers_email ON customers(email);  -- ✓ GOOD

-- LOW cardinality: Poor for indexing
-- is_active: Only TRUE/FALSE (1M products = 2 distinct values)
CREATE INDEX idx_products_is_active ON products(is_active);  -- ✗ BAD

-- Why bad? Half the table is TRUE, half is FALSE.
-- Index doesn't narrow search much.
-- Better: Partial index on just TRUE values
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;  -- ✓ GOOD
```

#### Concept Deep Dive: Partial Indexes

**Line 177-179:**
```sql
CREATE INDEX idx_products_active 
    ON products (is_active) 
    WHERE deleted_at IS NULL;
```

**What is `WHERE deleted_at IS NULL`?**

This creates a **partial index** - index includes ONLY rows matching the WHERE clause.

**Comparison:**

```sql
-- FULL INDEX: Indexes all rows
CREATE INDEX idx_products_active_full ON products(is_active);

-- Sizes:
-- Table: 1,000,000 products
-- Deleted: 50,000 (5%)
-- Active: 900,000
-- Full index size: ~20MB (indexes all 1M rows)

-- PARTIAL INDEX: Indexes only non-deleted rows
CREATE INDEX idx_products_active_partial 
    ON products(is_active) 
    WHERE deleted_at IS NULL;

-- Partial index size: ~19MB (indexes only 950K rows)
```

**Why use partial indexes?**

1. **Smaller index** = faster queries
2. **Matches query pattern**: Most queries filter `WHERE deleted_at IS NULL`
3. **Maintenance benefit**: Deleted rows don't need reindexing

**Query matching:**

```sql
-- Query 1: Uses partial index
SELECT * FROM products 
WHERE is_active = TRUE AND deleted_at IS NULL;
-- ✓ Matches index WHERE clause exactly

-- Query 2: Cannot use partial index
SELECT * FROM products WHERE is_active = TRUE;
-- ✗ Doesn't filter deleted_at, so partial index not applicable

-- Query 3: Cannot use partial index
SELECT * FROM products WHERE deleted_at IS NOT NULL;
-- ✗ Looks for deleted rows, index only has non-deleted
```

**Engineering Decision**: Our partial index assumes 95%+ of queries filter deleted rows. If you frequently query deleted rows, need separate index.

## Part 5: Orders System - Triggers, Calculated Fields, and Transactions

### Step 1: Write Failing Tests FIRST

**File: `tests/test_003_orders.sql`**

```sql
-- ==============================================================================
-- SCHEMA TESTS: Orders and Order Lines
-- ==============================================================================
-- PURPOSE: Verify orders table with calculated totals and invariant enforcement
-- COMPLEXITY: Tests triggers, calculated columns, multi-table transactions
-- ==============================================================================

SET client_min_messages TO WARNING;

BEGIN;

-- ==============================================================================
-- TEST GROUP 1: Orders Table Structure
-- ==============================================================================

-- TEST 1.1: Orders table should exist with correct columns
DO $$
DECLARE
    expected_columns TEXT[] := ARRAY[
        'order_id',
        'order_number',
        'customer_id',
        'order_date',
        'required_date',
        'shipped_date',
        'status',
        'subtotal',
        'tax_amount',
        'total_amount',
        'notes',
        'created_at',
        'updated_at'
    ];
    actual_columns TEXT[];
    col TEXT;
BEGIN
    SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
    INTO actual_columns
    FROM information_schema.columns
    WHERE table_name = 'orders';
    
    ASSERT actual_columns IS NOT NULL, 'Orders table does not exist';
    
    FOREACH col IN ARRAY expected_columns
    LOOP
        ASSERT col = ANY(actual_columns),
            FORMAT('Expected column %s not found in orders', col);
    END LOOP;
    
    RAISE NOTICE 'PASS: Orders table has correct structure';
END $$;

-- TEST 1.2: order_number should be unique
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'orders' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%order_number%') >= 1,
        'order_number should have UNIQUE constraint';
        
    RAISE NOTICE 'PASS: order_number is unique';
END $$;

-- TEST 1.3: customer_id should be foreign key to customers
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'orders'
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%customer%') >= 1,
        'Orders should have foreign key to customers';
        
    RAISE NOTICE 'PASS: customer_id has foreign key constraint';
END $$;

-- TEST 1.4: Money columns should be NUMERIC
DO $$
DECLARE
    money_col TEXT;
BEGIN
    FOREACH money_col IN ARRAY ARRAY['subtotal', 'tax_amount', 'total_amount']
    LOOP
        ASSERT (SELECT data_type FROM information_schema.columns
                WHERE table_name = 'orders' AND column_name = money_col) = 'numeric',
            FORMAT('%s should be NUMERIC type', money_col);
    END LOOP;
    
    RAISE NOTICE 'PASS: Money columns are NUMERIC type';
END $$;

-- TEST 1.5: Status should have CHECK constraint
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.check_constraints cc
            JOIN information_schema.constraint_column_usage ccu 
                ON cc.constraint_name = ccu.constraint_name
            WHERE ccu.table_name = 'orders' 
            AND ccu.column_name = 'status') >= 1,
        'status should have CHECK constraint';
        
    RAISE NOTICE 'PASS: status has CHECK constraint';
END $$;

-- ==============================================================================
-- TEST GROUP 2: Order Lines Table Structure
-- ==============================================================================

-- TEST 2.1: Order_lines table should exist
DO $$
DECLARE
    expected_columns TEXT[] := ARRAY[
        'order_line_id',
        'order_id',
        'line_number',
        'product_id',
        'quantity',
        'unit_price',
        'line_total',
        'created_at'
    ];
    actual_columns TEXT[];
    col TEXT;
BEGIN
    SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
    INTO actual_columns
    FROM information_schema.columns
    WHERE table_name = 'order_lines';
    
    ASSERT actual_columns IS NOT NULL, 'order_lines table does not exist';
    
    FOREACH col IN ARRAY expected_columns
    LOOP
        ASSERT col = ANY(actual_columns),
            FORMAT('Expected column %s not found in order_lines', col);
    END LOOP;
    
    RAISE NOTICE 'PASS: Order_lines table has correct structure';
END $$;

-- TEST 2.2: Should have composite UNIQUE on (order_id, line_number)
DO $$
DECLARE
    constraint_columns TEXT[];
BEGIN
    SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
    INTO constraint_columns
    FROM information_schema.key_column_usage
    WHERE table_name = 'order_lines'
    AND constraint_name IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints
        WHERE table_name = 'order_lines'
        AND constraint_type = 'UNIQUE'
    );
    
    ASSERT 'order_id' = ANY(constraint_columns), 
        'UNIQUE constraint should include order_id';
    ASSERT 'line_number' = ANY(constraint_columns), 
        'UNIQUE constraint should include line_number';
        
    RAISE NOTICE 'PASS: Order_lines has composite UNIQUE constraint';
END $$;

-- TEST 2.3: Should have foreign keys to orders and products
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'order_lines'
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%order%') >= 1,
        'order_lines should have FK to orders';
        
    ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
            WHERE table_name = 'order_lines'
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%product%') >= 1,
        'order_lines should have FK to products';
        
    RAISE NOTICE 'PASS: Order_lines has foreign keys';
END $$;

-- ==============================================================================
-- TEST GROUP 3: Data Insertion and Basic Constraints
-- ==============================================================================

-- TEST 3.1: Can create order with valid customer
DO $$
DECLARE
    test_customer_id INTEGER;
    test_order_id INTEGER;
BEGIN
    -- Create customer
    INSERT INTO customers (email, company_name)
    VALUES ('order_test@example.com', 'Order Test Corp')
    RETURNING customer_id INTO test_customer_id;
    
    -- Create order
    INSERT INTO orders (order_number, customer_id, order_date, status)
    VALUES ('ORD-2025-001', test_customer_id, CURRENT_DATE, 'pending')
    RETURNING order_id INTO test_order_id;
    
    ASSERT test_order_id IS NOT NULL, 'Order should be created';
    RAISE NOTICE 'PASS: Can create order with valid customer';
END $$;

-- TEST 3.2: Cannot create order with non-existent customer
DO $$
BEGIN
    BEGIN
        INSERT INTO orders (order_number, customer_id, order_date, status)
        VALUES ('ORD-2025-BAD', 999999, CURRENT_DATE, 'pending');
        RAISE EXCEPTION 'Should not allow order with invalid customer';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'PASS: FK prevents order with non-existent customer';
    END;
END $$;

-- TEST 3.3: Cannot create order with invalid status
DO $$
DECLARE
    test_customer_id INTEGER;
BEGIN
    INSERT INTO customers (email, company_name)
    VALUES ('status_test@example.com', 'Status Test')
    RETURNING customer_id INTO test_customer_id;
    
    BEGIN
        INSERT INTO orders (order_number, customer_id, order_date, status)
        VALUES ('ORD-2025-002', test_customer_id, CURRENT_DATE, 'invalid_status');
        RAISE EXCEPTION 'Should not allow invalid status';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASS: Invalid status correctly rejected';
    END;
END $$;

-- TEST 3.4: Cannot create order with duplicate order_number
DO $$
DECLARE
    test_customer_id INTEGER;
BEGIN
    INSERT INTO customers (email, company_name)
    VALUES ('dup_order@example.com', 'Dup Order Test')
    RETURNING customer_id INTO test_customer_id;
    
    INSERT INTO orders (order_number, customer_id, order_date, status)
    VALUES ('ORD-DUP-001', test_customer_id, CURRENT_DATE, 'pending');
    
    BEGIN
        INSERT INTO orders (order_number, customer_id, order_date, status)
        VALUES ('ORD-DUP-001', test_customer_id, CURRENT_DATE, 'pending');
        RAISE EXCEPTION 'Should not allow duplicate order_number';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'PASS: Duplicate order_number correctly rejected';
    END;
END $$;

-- ==============================================================================
-- TEST GROUP 4: Order Lines and Calculated Fields
-- ==============================================================================

-- TEST 4.1: Can add order line to order
DO $$
DECLARE
    test_customer_id INTEGER;
    test_order_id INTEGER;
    test_product_id INTEGER;
    test_line_id INTEGER;
BEGIN
    -- Setup
    INSERT INTO customers (email, company_name)
    VALUES ('line_test@example.com', 'Line Test')
    RETURNING customer_id INTO test_customer_id;
    
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('LINE-TEST-001', 'Line Test Product', 50.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO orders (order_number, customer_id, order_date, status)
    VALUES ('ORD-LINE-001', test_customer_id, CURRENT_DATE, 'pending')
    RETURNING order_id INTO test_order_id;
    
    -- Create order line
    INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
    VALUES (test_order_id, 1, test_product_id, 5, 50.00)
    RETURNING order_line_id INTO test_line_id;
    
    ASSERT test_line_id IS NOT NULL, 'Order line should be created';
    RAISE NOTICE 'PASS: Can create order line';
END $$;

-- TEST 4.2: line_total should be calculated automatically (quantity * unit_price)
DO $$
DECLARE
    test_customer_id INTEGER;
    test_order_id INTEGER;
    test_product_id INTEGER;
    calculated_total NUMERIC;
BEGIN
    -- Setup
    INSERT INTO customers (email, company_name)
    VALUES ('calc_test@example.com', 'Calc Test')
    RETURNING customer_id INTO test_customer_id;
    
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('CALC-TEST-001', 'Calc Test Product', 25.50)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO orders (order_number, customer_id, order_date, status)
    VALUES ('ORD-CALC-001', test_customer_id, CURRENT_DATE, 'pending')
    RETURNING order_id INTO test_order_id;
    
    -- Insert line: 3 units @ $25.50 = $76.50
    INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
    VALUES (test_order_id, 1, test_product_id, 3, 25.50);
    
    -- Check calculated total
    SELECT line_total INTO calculated_total
    FROM order_lines
    WHERE order_id = test_order_id AND line_number = 1;
    
    ASSERT calculated_total = 76.50,
        FORMAT('line_total should be 76.50, got %s', calculated_total);
        
    RAISE NOTICE 'PASS: line_total calculated correctly (76.50)';
END $$;

-- TEST 4.3: Cannot insert order line with zero quantity
DO $$
DECLARE
    test_customer_id INTEGER;
    test_order_id INTEGER;
    test_product_id INTEGER;
BEGIN
    INSERT INTO customers (email, company_name)
    VALUES ('qty_test@example.com', 'Qty Test')
    RETURNING customer_id INTO test_customer_id;
    
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('QTY-TEST-001', 'Qty Test Product', 10.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO orders (order_number, customer_id, order_date, status)
    VALUES ('ORD-QTY-001', test_customer_id, CURRENT_DATE, 'pending')
    RETURNING order_id INTO test_order_id;
    
    BEGIN
        INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
        VALUES (test_order_id, 1, test_product_id, 0, 10.00);
        RAISE EXCEPTION 'Should not allow zero quantity';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASS: Zero quantity correctly rejected';
    END;
END $$;

-- TEST 4.4: Cannot insert order line with duplicate line_number
DO $$
DECLARE
    test_customer_id INTEGER;
    test_order_id INTEGER;
    test_product_id INTEGER;
BEGIN
    INSERT INTO customers (email, company_name)
    VALUES ('dup_line@example.com', 'Dup Line Test')
    RETURNING customer_id INTO test_customer_id;
    
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('DUP-LINE-001', 'Dup Line Product', 15.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO orders (order_number, customer_id, order_date, status)
    VALUES ('ORD-DUP-LINE-001', test_customer_id, CURRENT_DATE, 'pending')
    RETURNING order_id INTO test_order_id;
    
    -- First line succeeds
    INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
    VALUES (test_order_id, 1, test_product_id, 2, 15.00);
    
    BEGIN
        -- Duplicate line_number should fail
        INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
        VALUES (test_order_id, 1, test_product_id, 3, 15.00);
        RAISE EXCEPTION 'Should not allow duplicate line_number';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'PASS: Duplicate line_number correctly rejected';
    END;
END $$;

-- ==============================================================================
-- TEST GROUP 5: Trigger Tests - Order Total Calculation
-- ==============================================================================

-- TEST 5.1: Order subtotal should auto-calculate from line totals
DO $$
DECLARE
    test_customer_id INTEGER;
    test_order_id INTEGER;
    test_product_id INTEGER;
    order_subtotal NUMERIC;
BEGIN
    -- Setup
    INSERT INTO customers (email, company_name)
    VALUES ('subtotal_test@example.com', 'Subtotal Test')
    RETURNING customer_id INTO test_customer_id;
    
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('SUBTOTAL-001', 'Subtotal Product', 100.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO orders (order_number, customer_id, order_date, status)
    VALUES ('ORD-SUBTOTAL-001', test_customer_id, CURRENT_DATE, 'pending')
    RETURNING order_id INTO test_order_id;
    
    -- Add order lines
    INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
    VALUES (test_order_id, 1, test_product_id, 2, 100.00);  -- $200
    
    INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
    VALUES (test_order_id, 2, test_product_id, 3, 100.00);  -- $300
    
    -- Check subtotal (should be $500)
    SELECT subtotal INTO order_subtotal
    FROM orders WHERE order_id = test_order_id;
    
    ASSERT order_subtotal = 500.00,
        FORMAT('Subtotal should be 500.00, got %s', order_subtotal);
        
    RAISE NOTICE 'PASS: Order subtotal auto-calculated (500.00)';
END $$;

-- TEST 5.2: Order total_amount should equal subtotal + tax
DO $$
DECLARE
    test_customer_id INTEGER;
    test_order_id INTEGER;
    test_product_id INTEGER;
    order_total NUMERIC;
BEGIN
    -- Setup
    INSERT INTO customers (email, company_name)
    VALUES ('total_test@example.com', 'Total Test')
    RETURNING customer_id INTO test_customer_id;
    
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('TOTAL-001', 'Total Product', 100.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO orders (order_number, customer_id, order_date, status, tax_amount)
    VALUES ('ORD-TOTAL-001', test_customer_id, CURRENT_DATE, 'pending', 10.00)
    RETURNING order_id INTO test_order_id;
    
    -- Add order line: 1 @ $100 = $100 subtotal
    INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
    VALUES (test_order_id, 1, test_product_id, 1, 100.00);
    
    -- Check total (should be $100 + $10 tax = $110)
    SELECT total_amount INTO order_total
    FROM orders WHERE order_id = test_order_id;
    
    ASSERT order_total = 110.00,
        FORMAT('Total should be 110.00 (100 + 10 tax), got %s', order_total);
        
    RAISE NOTICE 'PASS: Order total_amount calculated correctly (110.00)';
END $$;

-- TEST 5.3: Updating order line quantity should recalculate order totals
DO $$
DECLARE
    test_customer_id INTEGER;
    test_order_id INTEGER;
    test_product_id INTEGER;
    order_subtotal NUMERIC;
BEGIN
    -- Setup
    INSERT INTO customers (email, company_name)
    VALUES ('update_test@example.com', 'Update Test')
    RETURNING customer_id INTO test_customer_id;
    
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('UPDATE-001', 'Update Product', 50.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO orders (order_number, customer_id, order_date, status)
    VALUES ('ORD-UPDATE-001', test_customer_id, CURRENT_DATE, 'pending')
    RETURNING order_id INTO test_order_id;
    
    -- Initial line: 2 @ $50 = $100
    INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
    VALUES (test_order_id, 1, test_product_id, 2, 50.00);
    
    -- Verify initial subtotal
    SELECT subtotal INTO order_subtotal FROM orders WHERE order_id = test_order_id;
    ASSERT order_subtotal = 100.00, FORMAT('Initial subtotal should be 100.00, got %s', order_subtotal);
    
    -- Update quantity: 5 @ $50 = $250
    UPDATE order_lines SET quantity = 5
    WHERE order_id = test_order_id AND line_number = 1;
    
    -- Verify updated subtotal
    SELECT subtotal INTO order_subtotal FROM orders WHERE order_id = test_order_id;
    ASSERT order_subtotal = 250.00,
        FORMAT('Updated subtotal should be 250.00, got %s', order_subtotal);
        
    RAISE NOTICE 'PASS: Order totals recalculated on line update';
END $$;

-- TEST 5.4: Deleting order line should recalculate order totals
DO $$
DECLARE
    test_customer_id INTEGER;
    test_order_id INTEGER;
    test_product_id INTEGER;
    order_subtotal NUMERIC;
BEGIN
    -- Setup
    INSERT INTO customers (email, company_name)
    VALUES ('delete_line_test@example.com', 'Delete Line Test')
    RETURNING customer_id INTO test_customer_id;
    
    INSERT INTO products (sku, product_name, unit_price)
    VALUES ('DELETE-LINE-001', 'Delete Line Product', 75.00)
    RETURNING product_id INTO test_product_id;
    
    INSERT INTO orders (order_number, customer_id, order_date, status)
    VALUES ('ORD-DELETE-LINE-001', test_customer_id, CURRENT_DATE, 'pending')
    RETURNING order_id INTO test_order_id;
    
    -- Add two lines: $75 + $150 = $225
    INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
    VALUES (test_order_id, 1, test_product_id, 1, 75.00);
    
    INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
    VALUES (test_order_id, 2, test_product_id, 2, 75.00);
    
    -- Verify initial subtotal
    SELECT subtotal INTO order_subtotal FROM orders WHERE order_id = test_order_id;
    ASSERT order_subtotal = 225.00, FORMAT('Initial subtotal should be 225.00, got %s', order_subtotal);
    
    -- Delete second line
    DELETE FROM order_lines WHERE order_id = test_order_id AND line_number = 2;
    
    -- Verify updated subtotal (should be $75)
    SELECT subtotal INTO order_subtotal FROM orders WHERE order_id = test_order_id;
    ASSERT order_subtotal = 75.00,
        FORMAT('Updated subtotal should be 75.00 after deletion, got %s', order_subtotal);
        
    RAISE NOTICE 'PASS: Order totals recalculated on line deletion';
END $$;

-- ==============================================================================
-- TEST GROUP 6: Date Logic Constraints
-- ==============================================================================

-- TEST 6.1: required_date cannot be before order_date
DO $$
DECLARE
    test_customer_id INTEGER;
BEGIN
    INSERT INTO customers (email, company_name)
    VALUES ('date_test@example.com', 'Date Test')
    RETURNING customer_id INTO test_customer_id;
    
    BEGIN
        INSERT INTO orders (order_number, customer_id, order_date, required_date, status)
        VALUES ('ORD-DATE-001', test_customer_id, '2025-01-15', '2025-01-10', 'pending');
        RAISE EXCEPTION 'Should not allow required_date before order_date';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASS: required_date before order_date correctly rejected';
    END;
END $$;

-- TEST 6.2: shipped_date cannot be before order_date
DO $$
DECLARE
    test_customer_id INTEGER;
BEGIN
    INSERT INTO customers (email, company_name)
    VALUES ('ship_date_test@example.com', 'Ship Date Test')
    RETURNING customer_id INTO test_customer_id;
    
    BEGIN
        INSERT INTO orders (order_number, customer_id, order_date, shipped_date, status)
        VALUES ('ORD-SHIP-001', test_customer_id, '2025-01-15', '2025-01-10', 'shipped');
        RAISE EXCEPTION 'Should not allow shipped_date before order_date';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASS: shipped_date before order_date correctly rejected';
    END;
END $$;

ROLLBACK;

\echo ''
\echo '=================================================='
\echo 'ORDERS TESTS COMPLETE'
\echo '=================================================='
\echo 'If you see this message, all tests passed!'
\echo ''
```

**Run the test:**

```bash
docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_003_orders.sql
```

**Expected Result**: **FAILURE** - Orders tables don't exist yet.

```
ERROR:  relation "orders" does not exist
```

---

### Step 2: Implement the Module

**File: `migrations/003_create_orders.sql`**

```sql
-- ==============================================================================
-- MIGRATION 003: Create Orders and Order Lines
-- ==============================================================================
-- PURPOSE: Order management with calculated totals and invariant enforcement
-- DEPENDENCIES: Migration 001 (customers), Migration 002 (products)
-- PATTERN: Header-detail with calculated fields maintained by triggers
-- ==============================================================================

-- ==============================================================================
-- TABLE: orders
-- ==============================================================================
-- PURPOSE: Order header - customer, dates, totals
-- CALCULATED FIELDS: subtotal, total_amount (maintained by triggers)
-- INVARIANT: total_amount = subtotal + tax_amount
-- ==============================================================================

CREATE TABLE orders (
    -- ============================================================
    -- IDENTITY
    -- ============================================================
    order_id        SERIAL          PRIMARY KEY,
    
    -- ============================================================
    -- NATURAL KEY: Business identifier
    -- ============================================================
    order_number    VARCHAR(50)     NOT NULL,
    
    -- ============================================================
    -- FOREIGN KEYS: Relationships
    -- ============================================================
    customer_id     INTEGER         NOT NULL,
    
    -- ============================================================
    -- DATES: Order lifecycle
    -- ============================================================
    order_date      DATE            NOT NULL DEFAULT CURRENT_DATE,
    required_date   DATE            NULL,
    shipped_date    DATE            NULL,
    
    -- ============================================================
    -- STATUS: Order workflow state
    -- ============================================================
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending',
    
    -- ============================================================
    -- MONEY: Calculated and manual fields
    -- ============================================================
    subtotal        NUMERIC(12,2)   NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(12,2)   NOT NULL DEFAULT 0,
    total_amount    NUMERIC(12,2)   NOT NULL DEFAULT 0,
    
    -- ============================================================
    -- ATTRIBUTES
    -- ============================================================
    notes           TEXT            NULL,
    
    -- ============================================================
    -- AUDIT TRAIL
    -- ============================================================
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- ============================================================
    -- FOREIGN KEY CONSTRAINTS
    -- ============================================================
    CONSTRAINT orders_customer_fk
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- ============================================================
    -- BUSINESS CONSTRAINTS
    -- ============================================================
    CONSTRAINT orders_order_number_unique
        UNIQUE (order_number),
        
    CONSTRAINT orders_order_number_format_check
        CHECK (order_number ~ '^ORD-[0-9]{4}-[0-9]{3,}$'),
        
    CONSTRAINT orders_status_valid_check
        CHECK (status IN ('pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled')),
        
    CONSTRAINT orders_money_non_negative_check
        CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount >= 0),
        
    CONSTRAINT orders_total_equals_subtotal_plus_tax_check
        CHECK (total_amount = subtotal + tax_amount),
        
    CONSTRAINT orders_required_date_after_order_date_check
        CHECK (required_date IS NULL OR required_date >= order_date),
        
    CONSTRAINT orders_shipped_date_after_order_date_check
        CHECK (shipped_date IS NULL OR shipped_date >= order_date)
);

-- ==============================================================================
-- TABLE: order_lines
-- ==============================================================================
-- PURPOSE: Order detail - individual products and quantities
-- CALCULATED FIELD: line_total = quantity * unit_price
-- RELATIONSHIP: Many lines per order, each line for one product
-- ==============================================================================

CREATE TABLE order_lines (
    -- ============================================================
    -- IDENTITY
    -- ============================================================
    order_line_id   SERIAL          PRIMARY KEY,
    
    -- ============================================================
    -- FOREIGN KEYS: Composite natural key
    -- ============================================================
    order_id        INTEGER         NOT NULL,
    line_number     INTEGER         NOT NULL,
    product_id      INTEGER         NOT NULL,
    
    -- ============================================================
    -- LINE DETAILS
    -- ============================================================
    quantity        INTEGER         NOT NULL,
    unit_price      NUMERIC(10,2)   NOT NULL,
    line_total      NUMERIC(12,2)   NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- ============================================================
    -- AUDIT TRAIL
    -- ============================================================
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- ============================================================
    -- FOREIGN KEY CONSTRAINTS
    -- ============================================================
    CONSTRAINT order_lines_order_fk
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    CONSTRAINT order_lines_product_fk
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- ============================================================
    -- BUSINESS CONSTRAINTS
    -- ============================================================
    CONSTRAINT order_lines_order_line_unique
        UNIQUE (order_id, line_number),
        
    CONSTRAINT order_lines_quantity_positive_check
        CHECK (quantity > 0),
        
    CONSTRAINT order_lines_unit_price_non_negative_check
        CHECK (unit_price >= 0),
        
    CONSTRAINT order_lines_line_number_positive_check
        CHECK (line_number > 0)
);

-- ==============================================================================
-- INDEXES: Performance optimization
-- ==============================================================================

-- Order lookups by order_number (business key)
CREATE UNIQUE INDEX idx_orders_order_number_upper 
    ON orders (UPPER(order_number));

-- Orders by customer (customer portal, history)
CREATE INDEX idx_orders_customer_id 
    ON orders (customer_id);

-- Orders by date (reporting, dashboards)
CREATE INDEX idx_orders_order_date 
    ON orders (order_date DESC);

-- Orders by status (workflow queues)
CREATE INDEX idx_orders_status 
    ON orders (status, order_date DESC);

-- Order lines by order (detail page)
CREATE INDEX idx_order_lines_order_id 
    ON order_lines (order_id, line_number);

-- Order lines by product (product popularity analysis)
CREATE INDEX idx_order_lines_product_id 
    ON order_lines (product_id);

-- ==============================================================================
-- FUNCTIONS: Shared business logic
-- ==============================================================================

-- Function to recalculate order totals from order lines
CREATE OR REPLACE FUNCTION recalculate_order_totals(p_order_id INTEGER)RETURNS VOID AS $$
DECLARE
    v_subtotal NUMERIC(12,2);
    v_tax_amount NUMERIC(12,2);
    v_total NUMERIC(12,2);
BEGIN
    -- Calculate subtotal from all order lines
    SELECT COALESCE(SUM(line_total), 0)
    INTO v_subtotal
    FROM order_lines
    WHERE order_id = p_order_id;
    
    -- Get existing tax amount (set manually, not calculated here)
    SELECT tax_amount
    INTO v_tax_amount
    FROM orders
    WHERE order_id = p_order_id;
    
    -- Calculate total
    v_total := v_subtotal + v_tax_amount;
    
    -- Update order
    UPDATE orders
    SET subtotal = v_subtotal,
        total_amount = v_total,
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TRIGGERS: Automatic invariant enforcement
-- ==============================================================================

-- Trigger function: Recalculate order totals when lines change
CREATE OR REPLACE FUNCTION trigger_recalculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        PERFORM recalculate_order_totals(NEW.order_id);
        RETURN NEW;
    -- Handle DELETE
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM recalculate_order_totals(OLD.order_id);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After INSERT on order_lines
CREATE TRIGGER trg_order_lines_after_insert
    AFTER INSERT ON order_lines
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_order_totals();

-- Trigger: After UPDATE on order_lines
CREATE TRIGGER trg_order_lines_after_update
    AFTER UPDATE ON order_lines
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_order_totals();

-- Trigger: After DELETE on order_lines
CREATE TRIGGER trg_order_lines_after_delete
    AFTER DELETE ON order_lines
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_order_totals();

-- Trigger function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Before UPDATE on orders
CREATE TRIGGER trg_orders_before_update
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

-- ==============================================================================
-- COMMENTS: Database documentation
-- ==============================================================================

COMMENT ON TABLE orders IS 
    'Order header: customer, dates, totals. '
    'Subtotal and total_amount are calculated fields maintained by triggers. '
    'Order lifecycle: pending → confirmed → in_production → shipped → delivered.';

COMMENT ON COLUMN orders.order_number IS 
    'Business identifier: Format ORD-YYYY-NNN (ORD-2025-001). '
    'Unique, immutable, human-readable. Generated by application.';

COMMENT ON COLUMN orders.status IS 
    'Order workflow state: '
    'pending=just created, confirmed=payment received, in_production=manufacturing, '
    'shipped=with carrier, delivered=customer received, cancelled=voided.';

COMMENT ON COLUMN orders.subtotal IS 
    'Sum of all order_lines.line_total. CALCULATED FIELD - do not set manually. '
    'Maintained by trigger_recalculate_order_totals().';

COMMENT ON COLUMN orders.tax_amount IS 
    'Sales tax amount. Set manually by application (tax rates vary by location). '
    'Not calculated by database.';

COMMENT ON COLUMN orders.total_amount IS 
    'subtotal + tax_amount. CALCULATED FIELD - do not set manually. '
    'Maintained by trigger and enforced by CHECK constraint.';

COMMENT ON TABLE order_lines IS 
    'Order detail lines: which products, how many, at what price. '
    'line_total is GENERATED column = quantity * unit_price. '
    'Changes to order_lines automatically recalculate parent order totals via triggers.';

COMMENT ON COLUMN order_lines.line_number IS 
    'Sequential line number within order (1, 2, 3...). '
    'Part of composite natural key with order_id. '
    'Determines display order on invoice.';

COMMENT ON COLUMN order_lines.unit_price IS 
    'Price per unit AT TIME OF ORDER. '
    'Captured from products.unit_price but stored here (price history). '
    'Future product price changes do not affect past orders.';

COMMENT ON COLUMN order_lines.line_total IS 
    'GENERATED COLUMN: quantity * unit_price. '
    'PostgreSQL calculates automatically, cannot be set manually. '
    'Always consistent, never stale.';

COMMENT ON FUNCTION recalculate_order_totals(INTEGER) IS 
    'Recalculates order subtotal and total_amount from order_lines. '
    'Called automatically by triggers when order_lines change. '
    'Can also be called manually if totals drift (should never happen).';

COMMENT ON FUNCTION trigger_recalculate_order_totals() IS 
    'Trigger function: Maintains INV-1 (order total = sum of line totals). '
    'Fires AFTER INSERT/UPDATE/DELETE on order_lines. '
    'Updates parent order.subtotal and total_amount.';

-- ==============================================================================
-- VALIDATION
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE EXCEPTION 'Migration failed: orders table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_lines') THEN
        RAISE EXCEPTION 'Migration failed: order_lines table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'recalculate_order_totals') THEN
        RAISE EXCEPTION 'Migration failed: recalculate_order_totals function not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_order_lines_after_insert') THEN
        RAISE EXCEPTION 'Migration failed: trigger not created';
    END IF;
    
    RAISE NOTICE 'Migration 003 completed successfully: orders and order_lines created';
END $$;
```

**Reset and run all tests:**

```bash
docker-compose down -v
docker-compose up -d
sleep 10

docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_001_schema.sql
docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_002_products_bom.sql
docker exec -i manufacturing-db psql -U postgres -d manufacturing < tests/test_003_orders.sql
```

**Expected Result**: **SUCCESS** ✓

```
NOTICE:  PASS: Orders table has correct structure
NOTICE:  PASS: order_number is unique
NOTICE:  PASS: customer_id has foreign key constraint
NOTICE:  PASS: Money columns are NUMERIC type
NOTICE:  PASS: status has CHECK constraint
NOTICE:  PASS: Order_lines table has correct structure
NOTICE:  PASS: Order_lines has composite UNIQUE constraint
NOTICE:  PASS: Order_lines has foreign keys
NOTICE:  PASS: Can create order with valid customer
NOTICE:  PASS: FK prevents order with non-existent customer
NOTICE:  PASS: Invalid status correctly rejected
NOTICE:  PASS: Duplicate order_number correctly rejected
NOTICE:  PASS: Can create order line
NOTICE:  PASS: line_total calculated correctly (76.50)
NOTICE:  PASS: Zero quantity correctly rejected
NOTICE:  PASS: Duplicate line_number correctly rejected
NOTICE:  PASS: Order subtotal auto-calculated (500.00)
NOTICE:  PASS: Order total_amount calculated correctly (110.00)
NOTICE:  PASS: Order totals recalculated on line update
NOTICE:  PASS: Order totals recalculated on line deletion
NOTICE:  PASS: required_date before order_date correctly rejected
NOTICE:  PASS: shipped_date before order_date correctly rejected

==================================================
ORDERS TESTS COMPLETE
==================================================
```

---

### Step 3: Line-by-Line Deep Dive

#### Generated Columns Analysis

**Line 105-106:**
```sql
line_total NUMERIC(12,2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
```

| Component | What It Does | Why It's Necessary | What Breaks Without It | Alternatives |
|-----------|--------------|-------------------|----------------------|--------------|
| `GENERATED ALWAYS AS` | PostgreSQL calculates this column, you cannot set it manually | Ensures line_total is ALWAYS correct, never stale | Could store wrong value if application has bug | **Alt 1**: Application calculates. **Rejected**: Can drift, bugs possible |
| `(quantity * unit_price)` | The formula PostgreSQL uses | Business rule: line total = qty × price | Manual calculation could be wrong | **Alt 2**: Trigger calculates. **Rejected**: Generated columns faster |
| `STORED` | Value computed at INSERT/UPDATE and stored on disk | Fast reads (no calculation needed), can be indexed | Alternative: `VIRTUAL` (compute on read) | **STORED** for frequently-read data, **VIRTUAL** for rarely-read |

**Concept Deep Dive: GENERATED vs TRIGGER**

Both can calculate values automatically. When to use each?

| Feature | GENERATED COLUMN | TRIGGER |
|---------|------------------|---------|
| **Calculation Scope** | Single row, single table | Can reference other tables, complex logic |
| **Performance** | Faster (native PostgreSQL) | Slower (procedural code) |
| **Formula Visibility** | In schema definition (self-documenting) | Hidden in function code |
| **Can Be Indexed?** | Yes (if STORED) | No (computed value) |
| **When to Use** | Simple math on same row | Cross-table calculations, auditing, complex logic |

**Example comparison:**

```sql
-- GENERATED COLUMN: Simple calculation
CREATE TABLE order_lines (
    quantity INTEGER,
    unit_price NUMERIC,
    line_total NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- TRIGGER: Complex cross-table calculation
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    subtotal NUMERIC  -- Calculated by trigger
);

CREATE OR REPLACE FUNCTION calc_order_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := (
        SELECT SUM(quantity * unit_price)
        FROM order_lines
        WHERE order_id = NEW.order_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Our Decision**:
- `order_lines.line_total` → **GENERATED COLUMN** (simple: qty × price)
- `orders.subtotal` → **TRIGGER** (complex: SUM across order_lines table)

#### Trigger Deep Dive

**What is a trigger?**

A trigger is **automatic code that runs when data changes**. Think of it as a database "event listener."

**Trigger anatomy:**

```sql
CREATE TRIGGER trg_order_lines_after_insert  ← Trigger name
    AFTER INSERT                              ← When it fires
    ON order_lines                            ← Which table
    FOR EACH ROW                              ← How many times
    EXECUTE FUNCTION trigger_recalculate_order_totals();  ← What code runs
```

**WHEN component options:**

| Timing | Description | Use Case |
|--------|-------------|----------|
| **BEFORE INSERT** | Before row inserted, can modify NEW | Validation, auto-fill fields |
| **AFTER INSERT** | After row inserted, cannot modify NEW | Cascade updates, audit logging |
| **BEFORE UPDATE** | Before row updated, can modify NEW | Validation, update timestamp |
| **AFTER UPDATE** | After row updated | Cascade updates, notification |
| **BEFORE DELETE** | Before row deleted | Prevent delete (raise exception) |
| **AFTER DELETE** | After row deleted | Cascade cleanup, audit trail |

**FOR EACH component options:**

| Level | Fires | Example |
|-------|-------|---------|
| **FOR EACH ROW** | Once per affected row | INSERT 100 rows → trigger fires 100 times |
| **FOR EACH STATEMENT** | Once per SQL statement | INSERT 100 rows → trigger fires 1 time |

**Our trigger:**

```sql
CREATE TRIGGER trg_order_lines_after_insert
    AFTER INSERT
    ON order_lines
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_order_totals();
```

**Step-by-step execution:**

```
1. User runs:
   INSERT INTO order_lines (order_id, line_number, product_id, quantity, unit_price)
   VALUES (5, 1, 10, 3, 25.00);

2. PostgreSQL:
   - Validates all constraints
   - Inserts row into order_lines table
   - Calculates line_total (GENERATED COLUMN): 3 × 25.00 = 75.00
   - Commits the insert

3. AFTER INSERT trigger fires:
   - NEW.order_id = 5
   - Calls trigger_recalculate_order_totals()
   
4. Function executes:
   - Queries: SELECT SUM(line_total) FROM order_lines WHERE order_id = 5
   - Gets subtotal (maybe 75.00 if first line, or more if other lines exist)
   - Updates: UPDATE orders SET subtotal = ..., total_amount = ... WHERE order_id = 5
   
5. Result:
   - order_lines has new row
   - orders.subtotal automatically updated
   - orders.total_amount automatically updated
```

**Critical Understanding**: Triggers run **inside the same transaction**. If trigger fails, entire operation rolls back.

```sql
BEGIN;
    INSERT INTO order_lines (...) VALUES (...);  -- This succeeds
    -- Trigger fires
    -- If trigger raises exception:
ROLLBACK;  -- Both INSERT and trigger changes undone
```

#### Concept Deep Dive: OLD vs NEW in Triggers

Triggers have access to special variables:

| Variable | Available When | Contains |
|----------|----------------|----------|
| **NEW** | INSERT, UPDATE | New row values (after change) |
| **OLD** | UPDATE, DELETE | Old row values (before change) |

**Examples:**

```sql
-- INSERT trigger: Only NEW exists
CREATE TRIGGER example_insert
AFTER INSERT ON order_lines
FOR EACH ROW
EXECUTE FUNCTION my_function();

-- In function:
-- NEW.order_id = 5 (the new row)
-- OLD.order_id = ERROR (doesn't exist for INSERT)

-- UPDATE trigger: Both NEW and OLD exist
CREATE TRIGGER example_update
AFTER UPDATE ON order_lines
FOR EACH ROW
EXECUTE FUNCTION my_function();

-- In function:
-- OLD.quantity = 2 (before update)
-- NEW.quantity = 5 (after update)

-- DELETE trigger: Only OLD exists
CREATE TRIGGER example_delete
AFTER DELETE ON order_lines
FOR EACH ROW
EXECUTE FUNCTION my_function();

-- In function:
-- OLD.order_id = 5 (the deleted row)
-- NEW.order_id = ERROR (doesn't exist for DELETE)
```

**Our trigger function handles all three:**

```sql
CREATE OR REPLACE FUNCTION trigger_recalculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        PERFORM recalculate_order_totals(NEW.order_id);  ← Use NEW
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM recalculate_order_totals(OLD.order_id);  ← Use OLD
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**Why `TG_OP`?**

`TG_OP` is a special variable automatically set by PostgreSQL:

| TG_OP Value | Meaning |
|-------------|---------|
| `'INSERT'` | Trigger fired by INSERT |
| `'UPDATE'` | Trigger fired by UPDATE |
| `'DELETE'` | Trigger fired by DELETE |

This lets **one trigger function** handle multiple operations.

#### Concept Deep Dive: PERFORM vs SELECT in PL/pgSQL

**Line 223:**
```sql
PERFORM recalculate_order_totals(NEW.order_id);
```

**What's PERFORM?**

In PL/pgSQL (PostgreSQL's procedural language), there are three ways to execute SQL:

| Command | Purpose | Returns | Example |
|---------|---------|---------|---------|
| **SELECT INTO** | Execute query, store result in variable | Row data | `SELECT name INTO v_name FROM products WHERE id = 1;` |
| **PERFORM** | Execute query, discard result | Nothing | `PERFORM my_function(5);` |
| **EXECUTE** | Execute dynamic SQL string | Depends | `EXECUTE 'SELECT * FROM ' || table_name;` |

**Why PERFORM for functions?**

```sql
-- WRONG: This tries to store result, but we don't care about it
SELECT recalculate_order_totals(NEW.order_id);
-- PostgreSQL error: "query has no destination for result data"

-- RIGHT: Execute function, discard result
PERFORM recalculate_order_totals(NEW.order_id);
-- No error, function runs, we ignore return value

-- ALSO RIGHT: If function returns a value we need
v_result := recalculate_order_totals(NEW.order_id);
```

**Our `recalculate_order_totals` function returns VOID** (nothing), so we use PERFORM.

#### Concept Deep Dive: CASCADE vs RESTRICT on DELETE

**Line 113-115:**
```sql
CONSTRAINT order_lines_order_fk
    FOREIGN KEY (order_id)
    REFERENCES orders(order_id)
    ON DELETE CASCADE
```

**Why CASCADE for order_lines but RESTRICT for products?**

| Table | ON DELETE | Reasoning |
|-------|-----------|-----------|
| `order_lines` → `orders` | **CASCADE** | Order lines are **owned by** order. If order deleted, lines should go too. Parent-child relationship. |
| `order_lines` → `products` | **RESTRICT** | Order lines **reference** product. Deleting product shouldn't delete historical orders. Products are master data. |

**Visual representation:**

```
Order (parent)
  └─ Order Line 1 (child) → Product A (reference)
  └─ Order Line 2 (child) → Product B (reference)
  └─ Order Line 3 (child) → Product A (reference)

DELETE order:
  ✓ Cascade deletes all 3 order lines (they're owned by order)
  
DELETE Product A:
  ✗ RESTRICT prevents delete (order lines still reference it)
  Must delete order lines first, or set to NULL (if allowed)
```

**Ownership vs Reference:**

| Relationship Type | Example | ON DELETE |
|-------------------|---------|-----------|
| **Ownership** (parent-child) | Order → Order Lines | CASCADE |
| **Ownership** (parent-child) | Invoice → Invoice Lines | CASCADE |
| **Reference** (lookup) | Order Line → Product | RESTRICT |
| **Reference** (lookup) | Order → Customer | RESTRICT |
| **Optional Reference** | Employee → Manager | SET NULL |

**Critical Principle**: CASCADE is **dangerous**. Only use when child data has no meaning without parent.

---

**Continue to Part 6?** We'll add:
- Views for complex queries
- Functions for business logic (calculate material costs)
- Advanced queries with JOINs
- Query performance analysis with EXPLAIN
- Real-world scenarios

Would you like me to continue?