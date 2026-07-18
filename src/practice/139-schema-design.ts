import type { PracticeChallenge } from './loader'

export const title = 'Schema Design'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `findByExactTag(orderTags, tag)`, where `orderTags` is a proper related table (`{ orderId, tag }` rows). Return the order ids whose `tag` field EQUALS `tag` exactly — no substring matching.',
        starter: '',
        tests: `
const orderTags = [{orderId:1,tag:'urgent'},{orderId:1,tag:'fragile'},{orderId:2,tag:'gift'},{orderId:3,tag:'urgentcare'}]
assert JSON.stringify(findByExactTag(orderTags, 'urgent')) === JSON.stringify([1])
`,
        solution: `function findByExactTag(orderTags, tag) {
  return orderTags.filter(t => t.tag === tag).map(t => t.orderId)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `csvToTagRows(orders)`, redesigning a bad `{ id, tags: \'urgent,fragile\' }` schema into a proper related table: split each order\'s comma-separated `tags` string into individual tags, producing one `{ orderId, tag }` row per tag.',
        starter: 'function csvToTagRows(orders) {\n  // TODO: split each order\'s comma-separated "tags" string into individual\n  // tags, producing one { orderId, tag } row per tag\n  const rows = []\n  for (const order of orders) {\n    rows.push({ orderId: order.id, tag: order.tags })\n  }\n  return rows\n}',
        tests: `
const badOrders = [{id:1,tags:'urgent,fragile'},{id:2,tags:'gift'}]
const rows = csvToTagRows(badOrders)
assert rows.length === 3
assert JSON.stringify(rows) === JSON.stringify([{orderId:1,tag:'urgent'},{orderId:1,tag:'fragile'},{orderId:2,tag:'gift'}])
`,
        solution: `function csvToTagRows(orders) {
  const rows = []
  for (const order of orders) {
    for (const tag of order.tags.split(',')) {
      rows.push({ orderId: order.id, tag })
    }
  }
  return rows
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `validateForeignKey(orders, customers)` returning the ids of every order whose `customerId` does NOT match any real customer\'s `id` — exactly the kind of orphaned reference a foreign key constraint would catch immediately at write time.',
        starter: '',
        tests: `
const customers = [{id:1,name:'Alice'},{id:2,name:'Bob'}]
const orders = [{id:101,customerId:1},{id:102,customerId:99},{id:103,customerId:2}]
assert JSON.stringify(validateForeignKey(orders, customers)) === JSON.stringify([102])
`,
        solution: `function validateForeignKey(orders, customers) {
  const customerIds = new Set(customers.map(c => c.id))
  return orders.filter(o => !customerIds.has(o.customerId)).map(o => o.id)
}`,
      },
    ],
  },
]

export default challenges
