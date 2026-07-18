import type { PracticeChallenge } from './loader'

export const title = 'Normalization'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `joinOrderWithCustomer(order, customers)`, where `order` is `{ orderId, customerId, item }` and `customers` maps id to `{ name, address }`. Return `{ orderId, item, customerName, customerAddress }` — reassembling the normalized data back together, the way a real query would JOIN two tables.',
        starter: '',
        tests: `
const customers = { 1: { name: 'Alice', address: '1 Main St' } }
const order = { orderId: 1, customerId: 1, item: 'Book' }
assert JSON.stringify(joinOrderWithCustomer(order, customers)) === JSON.stringify({orderId:1, item:'Book', customerName:'Alice', customerAddress:'1 Main St'})
`,
        solution: `function joinOrderWithCustomer(order, customers) {
  const customer = customers[order.customerId]
  return {
    orderId: order.orderId,
    item: order.item,
    customerName: customer.name,
    customerAddress: customer.address,
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `normalizeOrders(flatOrders)`: it must REUSE an existing customer\'s id if that customer name has already been seen, instead of creating a brand-new customer record for every order row — the whole point of normalization is storing each customer\'s data exactly once.',
        starter: 'function normalizeOrders(flatOrders) {\n  const customers = {}\n  let nextId = 1\n  const orders = []\n  for (const flat of flatOrders) {\n    // TODO: reuse an existing customer\'s id if this customer name has already\n    // been seen, instead of creating a brand-new customer record every time\n    const customerId = nextId\n    customers[customerId] = { name: flat.customerName, address: flat.customerAddress }\n    nextId++\n    orders.push({ orderId: flat.orderId, customerId, item: flat.item })\n  }\n  return { customers, orders }\n}',
        tests: `
const flat = [
  {orderId:1, customerName:'Alice', customerAddress:'1 Main St', item:'Book'},
  {orderId:2, customerName:'Alice', customerAddress:'1 Main St', item:'Pen'},
  {orderId:3, customerName:'Bob', customerAddress:'2 Oak Ave', item:'Cup'},
]
const result = normalizeOrders(flat)
assert Object.keys(result.customers).length === 2
assert result.orders.length === 3
assert result.orders[0].customerId === result.orders[1].customerId
`,
        solution: `function normalizeOrders(flatOrders) {
  const customers = {}
  const nameToId = {}
  let nextId = 1
  const orders = []
  for (const flat of flatOrders) {
    if (!(flat.customerName in nameToId)) {
      nameToId[flat.customerName] = nextId
      customers[nextId] = { name: flat.customerName, address: flat.customerAddress }
      nextId++
    }
    const customerId = nameToId[flat.customerName]
    orders.push({ orderId: flat.orderId, customerId, item: flat.item })
  }
  return { customers, orders }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `updateAddressUnnormalized(orders, customerName, newAddress)` (updates EVERY matching order row, returning how many rows changed) and `updateAddressNormalized(customers, customerId, newAddress)` (updates exactly one customer record). Confirm the row-count difference directly quantifies normalization\'s write-simplicity benefit.',
        starter: '',
        tests: `
const unnormalizedOrders = [
  {orderId:1, customerName:'Alice', customerAddress:'1 Main St'},
  {orderId:2, customerName:'Alice', customerAddress:'1 Main St'},
]
assert updateAddressUnnormalized(unnormalizedOrders, 'Alice', '2 Oak Ave') === 2
assert unnormalizedOrders.every(o => o.customerAddress === '2 Oak Ave')
const customers = { 1: { name: 'Alice', address: '1 Main St' } }
assert updateAddressNormalized(customers, 1, '2 Oak Ave') === 1
assert customers[1].address === '2 Oak Ave'
`,
        solution: `function updateAddressUnnormalized(orders, customerName, newAddress) {
  let updatedCount = 0
  for (const order of orders) {
    if (order.customerName === customerName) {
      order.customerAddress = newAddress
      updatedCount++
    }
  }
  return updatedCount
}
function updateAddressNormalized(customers, customerId, newAddress) {
  customers[customerId].address = newAddress
  return 1
}`,
      },
    ],
  },
]

export default challenges
