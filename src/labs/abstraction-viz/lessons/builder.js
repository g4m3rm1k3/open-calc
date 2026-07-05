export default {
  id: 'builder',
  title: 'Builder Pattern',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'The problem — a constructor with too many arguments',
      semanticEvent: 'DefineClass',
      code:
`class QueryBuilder {
  constructor(table, fields, conditions, orderBy, limit, offset) {
    this.table      = table
    this.fields     = fields     || ['*']
    this.conditions = conditions || []
    this.orderBy    = orderBy    || null
    this.limit      = limit      || null
    this.offset     = offset     || 0
  }
}

const q1 = new QueryBuilder('users', ['id', 'name'], [{ field: 'active', value: true }], 'name', 10, 0)
console.log(q1.table)
console.log(q1.fields)
console.log(q1.limit)`,
      explanation: [
        '`new QueryBuilder(\'users\', [\'id\', \'name\'], [{ field: \'active\', value: true }], \'name\', 10, 0)` — six positional arguments with no labels at the call site. The problem this reveals: **positional constructors force callers to memorise argument order**. Position 4 is `orderBy`, position 5 is `limit`, position 6 is `offset` — but `10, 0` at the call site communicates none of that. The Builder pattern names every step.',
        'CS — The Builder pattern replaces a multi-argument constructor with a sequence of named method calls. Each method sets one property and returns `this` for chaining. The build step assembles the final object. This separates construction (accumulating properties step by step) from representation (the final immutable query object). The Builder holds mutable state; the built object is the final result.',
        'SE — SQL query builders like Knex.js (`knex(\'users\').select(\'id\', \'name\').where(\'active\', true).orderBy(\'name\').limit(10)`), Prisma\'s `findMany` with filter object, and TypeORM\'s `QueryBuilder` all use this pattern. The builder\'s fluent API reads like the intent: select these fields, where this condition, order by this, limit to this many.',
        'Without this: positional arguments have no names at the call site. `new QueryBuilder(\'users\', null, null, null, 10, 0)` — what does the first `null` mean? You must look at the constructor signature to find out. Builder method names document themselves: `.limit(10)` is self-explanatory, `10` in position 5 is not.',
      ],
      active: [
        { startLine: 1,  endLine: 10, color: 'indigo',  label: 'constructor with 6 args — hard to read at call site' },
        { startLine: 12, endLine: 15, color: 'emerald', label: 'call site: 6 args, unclear intent without counting' },
      ],
      connections: [],
    },
    {
      title: 'from() and select() — start building',
      semanticEvent: 'DefineFunction',
      code:
`class QueryBuilder {
  constructor() {
    this._table      = ''
    this._fields     = ['*']
    this._conditions = []
    this._orderBy    = null
    this._limit      = null
    this._offset     = 0
  }

  from(table) {
    this._table = table
    return this
  }

  select(...fields) {
    this._fields = fields
    return this
  }
}

const q = new QueryBuilder()
q.from('users').select('id', 'name', 'email')
console.log(q._table)
console.log(q._fields)`,
      explanation: [
        '`from()` and `select()` establish the **fluent builder contract**: each method sets exactly one field on the builder and returns `this`. Returning `this` is what makes chaining possible — the next method call receives the same builder instance back. The call site reads as declarative intent: "from users, select id, name, email" — no argument counting required.',
        'CS — The builder accumulates state through method calls. Each method mutates one private field (prefixed with `_` to signal "builder internal, not final object field") and returns `this`. This is the Fluent Interface pattern — the chaining that makes builder methods composable. Each method is a discrete, named configuration step.',
        'SE — Knex.js\'s `knex(\'users\').select(\'id\', \'name\')` maps exactly to `from(\'users\').select(\'id\', \'name\')`. Elasticsearch\'s query DSL builder, AWS SDK v3\'s command builders, and TypeORM\'s `createQueryBuilder().from(Entity, alias).select(fields)` all follow this pattern. The builder separates "what to query" from "how to execute it."',
        'Without this: a builder with no methods has nowhere to accumulate partial configuration. The constructor starts empty — the builder\'s value comes from accumulating state through method calls, not from the initial construction. Starting with defaults means every property is optional — you set only what you need.',
      ],
      active: [
        { startLine: 11, endLine: 19, color: 'violet',  label: 'from() + select() — each sets one field, returns this' },
        { startLine: 22, endLine: 25, color: 'emerald', label: '"users", ["id","name","email"]' },
      ],
      connections: [{ fromLine: 13, toLine: 13, color: 'violet', label: 'return this — enables chaining', type: 'produces' }],
    },
    {
      title: 'where() and orderBy() — add conditions',
      semanticEvent: 'WriteVariable',
      code:
`class QueryBuilder {
  constructor() {
    this._table = ''; this._fields = ['*']; this._conditions = []
    this._orderBy = null; this._limit = null; this._offset = 0
  }

  from(table)   { this._table = table; return this }
  select(...fields) { this._fields = fields; return this }

  where(field, value) {
    this._conditions.push({ field: field, value: value })
    return this
  }

  orderBy(field, direction) {
    this._orderBy = { field: field, direction: direction || 'ASC' }
    return this
  }
}

const q = new QueryBuilder()
q.from('users').select('id', 'name').where('active', true).where('age', 25).orderBy('name')
console.log(q._table)
console.log(q._conditions.length)
console.log(q._conditions[0].field)
console.log(q._orderBy.field)`,
      explanation: [
        '`where()` accumulates conditions by pushing to `_conditions` — multiple calls stack without overwriting. `orderBy()` sets a single sort rule. After the chain, `_conditions.length` is 2 and `_orderBy.field` is `\'name\'`. This establishes the **accumulation relationship**: `where` is additive, `orderBy` is replacement. The builder encodes both policies in one method each.',
        'CS — The builder accumulates an array of conditions — each `where()` call appends without replacing. This enables method call order independence: `where(\'active\', true).where(\'age\', 25)` and `where(\'age\', 25).where(\'active\', true)` produce equivalent results (for AND conditions). The builder collects; the `build()` or `toSQL()` method assembles the final representation.',
        'SE — Elasticsearch\'s query builder chains `must`, `filter`, and `should` clauses the same way. AWS SDK v3 chains command builders: `new GetObjectCommand({ Bucket: \'...\'}).where(...)`. Prisma\'s `findMany({ where: { AND: [...] }, orderBy: [...] })` is a declarative builder API using objects instead of method chains — same pattern, different surface.',
        'Without this: without the builder\'s accumulating `where()`, adding multiple conditions requires constructing the conditions array before calling the constructor — which puts array-building logic at every call site. The builder keeps the accumulation logic inside the builder class, where it belongs.',
      ],
      active: [
        { startLine: 10, endLine: 13, color: 'violet',  label: 'where — push condition, return this (accumulates)' },
        { startLine: 15, endLine: 18, color: 'indigo',  label: 'orderBy — set sort field + direction with default' },
        { startLine: 21, endLine: 26, color: 'emerald', label: '"users", 2 conditions, "active", orderBy "name"' },
      ],
      connections: [{ fromLine: 11, toLine: 11, color: 'violet', label: 'push — conditions accumulate across calls', type: 'writes' }],
    },
    {
      title: 'limit(), offset() and build() — assemble the final object',
      semanticEvent: 'DefineFunction',
      code:
`class QueryBuilder {
  constructor() {
    this._table=''; this._fields=['*']; this._conditions=[]
    this._orderBy=null; this._limit=null; this._offset=0
  }

  from(table)          { this._table=table; return this }
  select(...fields)    { this._fields=fields; return this }
  where(field, value)  { this._conditions.push({field,value}); return this }
  orderBy(field, dir)  { this._orderBy={field,direction:dir||'ASC'}; return this }

  limit(n)   { this._limit=n;  return this }
  offset(n)  { this._offset=n; return this }

  build() {
    if (!this._table) throw new Error('QueryBuilder: table is required (call .from())')
    return {
      table:      this._table,
      fields:     this._fields,
      conditions: this._conditions,
      orderBy:    this._orderBy,
      limit:      this._limit,
      offset:     this._offset,
    }
  }
}

const query = new QueryBuilder()
  .from('orders')
  .select('id', 'total', 'status')
  .where('status', 'pending')
  .where('total', 100)
  .orderBy('created_at', 'DESC')
  .limit(20)
  .offset(40)
  .build()

console.log(query.table)
console.log(query.fields)
console.log(query.conditions.length)
console.log(query.orderBy.direction)
console.log(query.limit)
console.log(query.offset)`,
      explanation: [
        '`build()` establishes the **extraction step**: it validates the accumulated state (throws if `_table` is missing) and produces a clean plain object with public-facing property names. The chain reads as a full English sentence — "from orders, select id/total/status, where pending AND total > 100, order DESC, limit 20, offset 40, then build." The builder\'s internal `_` fields become clean output properties.',
        'CS — `.build()` is the "director" step: it assembles the accumulated state into the final product. The builder is now consumed — calling `.build()` twice would produce the same result, but the builder could also reset itself. The separation: builder holds mutable state during construction; built object is immutable data. This is the core Builder Pattern distinction.',
        'SE — Knex.js\'s `.toSQL()` is the build step — it converts the builder\'s internal state to a SQL string and parameter array. Elasticsearch\'s `buildQuery()` produces the query JSON. The build step is also where validation happens: Knex throws "Table not specified" for a missing `from()`, exactly like line 16. Zod\'s `z.object({...}).parse(data)` is also a build step — validate and produce the typed output.',
        'Without this: without `.build()`, the builder IS the query — callers access `_table`, `_fields`, etc. directly. The `_` prefix is just a hint; it doesn\'t enforce access. `.build()` is the clean extraction: the caller gets a plain immutable data object, the builder stays encapsulated, and internal implementation details (`_orderBy` structure, etc.) can change without affecting callers.',
      ],
      active: [
        { startLine: 15, endLine: 25, color: 'violet',  label: 'build() — validate then assemble plain object' },
        { startLine: 28, endLine: 43, color: 'emerald', label: 'readable chain; built query printed field by field' },
      ],
      connections: [{ fromLine: 16, toLine: 1, color: 'violet', label: 'build validates required fields before output', type: 'reads' }],
    },
    {
      title: 'toSQL() — builder produces a SQL string',
      semanticEvent: 'DefineFunction',
      code:
`class QueryBuilder {
  constructor() {
    this._table=''; this._fields=['*']; this._conditions=[]
    this._orderBy=null; this._limit=null; this._offset=0
  }

  from(t)     { this._table=t; return this }
  select(...f){ this._fields=f; return this }
  where(f,v)  { this._conditions.push({field:f,value:v}); return this }
  orderBy(f,d){ this._orderBy={field:f,direction:d||'ASC'}; return this }
  limit(n)    { this._limit=n;  return this }
  offset(n)   { this._offset=n; return this }

  toSQL() {
    if (!this._table) throw new Error('table required')
    var sql = 'SELECT ' + this._fields.join(', ') + ' FROM ' + this._table
    if (this._conditions.length > 0) {
      sql += ' WHERE ' + this._conditions.map(function(c) {
        return c.field + " = '" + c.value + "'"
      }).join(' AND ')
    }
    if (this._orderBy)  sql += ' ORDER BY ' + this._orderBy.field + ' ' + this._orderBy.direction
    if (this._limit)    sql += ' LIMIT ' + this._limit
    if (this._offset)   sql += ' OFFSET ' + this._offset
    return sql
  }
}

const sql1 = new QueryBuilder()
  .from('users').select('id', 'name').where('active', 'true').limit(10).toSQL()

const sql2 = new QueryBuilder()
  .from('orders').select('id', 'total').where('status', 'pending').orderBy('created_at', 'DESC').limit(20).offset(40).toSQL()

console.log(sql1)
console.log(sql2)`,
      explanation: [
        '`toSQL()` demonstrates that **the same builder interface can produce different output formats**: instead of returning a plain object, it assembles a SQL string clause by clause. The method-call sequence maps directly to SQL clause order — `select`, `from`, `where`, `order by`, `limit`, `offset`. Two different queries, built with the same fluent API, produce two valid SQL strings.',
        'CS — The builder pattern separates "what to query" (method calls) from "how to represent it" (SQL string). The same builder could produce different outputs: `toSQL()` produces a string, `build()` produces a plain object, `toElastic()` could produce Elasticsearch DSL. The construction sequence is the same; only the final representation differs.',
        'SE — This is exactly how Knex.js, Sequelize\'s `QueryInterface`, and TypeORM\'s `SelectQueryBuilder` work: chain methods, call `toSQL()` (or execute). The builder tracks the dialect (MySQL vs PostgreSQL vs SQLite) and produces dialect-specific SQL. Knex\'s `.debug()` method prints the generated SQL for debugging — the builder\'s intermediate state made visible.',
        'Without this: without the builder, constructing a SQL string requires string concatenation with conditionals at every call site: `let sql = "SELECT * FROM " + table + (conditions.length ? " WHERE " + ... : "") + (limit ? " LIMIT " + limit : "")`. This gets complex fast. The builder moves the concatenation logic inside the class, tested once, reused everywhere.',
      ],
      active: [
        { startLine: 14, endLine: 25, color: 'violet',  label: 'toSQL — assembles SQL string from accumulated state' },
        { startLine: 30, endLine: 36, color: 'emerald', label: 'two different queries built from same interface' },
      ],
      connections: [],
    },
  ],
}
