import type { PracticeChallenge } from './loader'

export const title = 'Transactions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeBank()` returning `{ transfer(from, to, amount) }`. Snapshot the balances before attempting the transfer; if either account doesn\'t exist, ROLL BACK to the snapshot and return `{ committed: false, balances }`. Otherwise debit and credit, returning `{ committed: true, balances }`.',
        starter: '',
        tests: `
const bank = makeBank()
assert JSON.stringify(bank.transfer('A','Z',100)) === JSON.stringify({committed:false, balances:{A:500,B:200}})
assert JSON.stringify(bank.transfer('A','B',100)) === JSON.stringify({committed:true, balances:{A:400,B:300}})
`,
        solution: `function makeBank() {
  let balances = { A: 500, B: 200 }
  return {
    transfer(from, to, amount) {
      const snapshot = { ...balances }
      try {
        if (!(from in balances) || !(to in balances)) throw new Error('account missing')
        balances[from] -= amount
        balances[to] += amount
        return { committed: true, balances: { ...balances } }
      } catch (err) {
        balances = snapshot
        return { committed: false, balances: { ...balances } }
      }
    },
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
        prompt: 'Fix `makeBankWithLimit(maxBalance)`: if crediting `to` would exceed `maxBalance`, the DEBIT that already happened to `from` must also be rolled back — a transaction failing partway through must undo everything already applied, not just refuse to apply the remaining step.',
        starter: 'function makeBankWithLimit(maxBalance) {\n  let balances = { A: 500, B: 950 }\n  return {\n    transfer(from, to, amount) {\n      if (!(from in balances) || !(to in balances)) {\n        return { committed: false, balances: { ...balances } }\n      }\n      balances[from] -= amount\n      // TODO: if crediting would exceed maxBalance, this must roll back the\n      // debit that already happened above, not leave it applied\n      if (balances[to] + amount > maxBalance) {\n        return { committed: false, balances: { ...balances } }\n      }\n      balances[to] += amount\n      return { committed: true, balances: { ...balances } }\n    },\n  }\n}',
        tests: `
const bank = makeBankWithLimit(1000)
const result = bank.transfer('A', 'B', 100)
assert result.committed === false
assert result.balances.A === 500
assert result.balances.B === 950
`,
        solution: `function makeBankWithLimit(maxBalance) {
  let balances = { A: 500, B: 950 }
  return {
    transfer(from, to, amount) {
      const snapshot = { ...balances }
      try {
        if (!(from in balances) || !(to in balances)) throw new Error('account missing')
        balances[from] -= amount
        if (balances[to] + amount > maxBalance) throw new Error('exceeds limit')
        balances[to] += amount
        return { committed: true, balances: { ...balances } }
      } catch (err) {
        balances = snapshot
        return { committed: false, balances: { ...balances } }
      }
    },
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `checkout(item, quantity, inventory, chargeAmount, paymentProcessor)` — a real multi-step transaction (reduce stock, THEN charge payment). If stock is insufficient or `paymentProcessor.charge(chargeAmount)` returns `false`, roll `inventory` back to its pre-checkout state and return `{ committed: false, inventory }`; otherwise return `{ committed: true, inventory }`.',
        starter: '',
        tests: `
const inventory = { widget: 5 }
const failingPayment = { charge: () => false }
const result = checkout('widget', 2, inventory, 20, failingPayment)
assert result.committed === false
assert inventory.widget === 5
const succeedingPayment = { charge: () => true }
const result2 = checkout('widget', 2, inventory, 20, succeedingPayment)
assert result2.committed === true
assert inventory.widget === 3
`,
        solution: `function checkout(item, quantity, inventory, chargeAmount, paymentProcessor) {
  const inventorySnapshot = { ...inventory }
  try {
    if (!(item in inventory) || inventory[item] < quantity) throw new Error('out of stock')
    inventory[item] -= quantity
    const charged = paymentProcessor.charge(chargeAmount)
    if (!charged) throw new Error('payment failed')
    return { committed: true, inventory: { ...inventory } }
  } catch (err) {
    Object.assign(inventory, inventorySnapshot)
    return { committed: false, inventory: { ...inventory } }
  }
}`,
      },
    ],
  },
]

export default challenges
