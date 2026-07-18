import type { PracticeChallenge } from './loader'

export const title = 'Facade Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeHomeTheaterFacade(projector, sound, disc)` returning `{ watchMovie(movie) }`, which turns on `projector`, turns on `sound`, then plays `movie` on `disc`, in that order, returning an array of each step\'s result string.',
        starter: '',
        tests: `
const projector = { turnOn: () => 'Projector on' }
const sound = { turnOn: () => 'Sound on' }
const disc = { play: movie => \`Playing \${movie}\` }
const theater = makeHomeTheaterFacade(projector, sound, disc)
assert JSON.stringify(theater.watchMovie('Inception')) === JSON.stringify(['Projector on','Sound on','Playing Inception'])
`,
        solution: `function makeHomeTheaterFacade(projector, sound, disc) {
  return {
    watchMovie(movie) {
      const steps = []
      steps.push(projector.turnOn())
      steps.push(sound.turnOn())
      steps.push(disc.play(movie))
      return steps
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
        prompt: 'Finish `endMovie()` on the facade so it reverses the startup sequence: stop the disc, then turn off the sound, then turn off the projector, in that order, returning each step\'s result string.',
        starter: 'function makeHomeTheaterFacade(projector, sound, disc) {\n  return {\n    watchMovie(movie) {\n      const steps = []\n      steps.push(projector.turnOn())\n      steps.push(sound.turnOn())\n      steps.push(disc.play(movie))\n      return steps\n    },\n    // TODO: endMovie() must reverse the startup sequence: stop the disc,\n    // then turn off the sound, then turn off the projector, in that order\n    endMovie() {\n      return []\n    },\n  }\n}',
        tests: `
const projector = { turnOn: () => 'Projector on', turnOff: () => 'Projector off' }
const sound = { turnOn: () => 'Sound on', turnOff: () => 'Sound off' }
const disc = { play: movie => \`Playing \${movie}\`, stop: () => 'Disc stopped' }
const theater = makeHomeTheaterFacade(projector, sound, disc)
assert JSON.stringify(theater.endMovie()) === JSON.stringify(['Disc stopped','Sound off','Projector off'])
`,
        solution: `function makeHomeTheaterFacade(projector, sound, disc) {
  return {
    watchMovie(movie) {
      const steps = []
      steps.push(projector.turnOn())
      steps.push(sound.turnOn())
      steps.push(disc.play(movie))
      return steps
    },
    endMovie() {
      const steps = []
      steps.push(disc.stop())
      steps.push(sound.turnOff())
      steps.push(projector.turnOff())
      return steps
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
        prompt: 'Write `makeCheckoutFacade(inventory, payment, shipping)` returning `{ placeOrder(item, amount, address) }`. It must reserve the item in `inventory` first; if that fails, return `{ success: false, reason: \'out of stock\' }` WITHOUT charging or shipping. Otherwise, charge `payment` and ship via `shipping`, then return `{ success: true }`.',
        starter: '',
        tests: `
const inventory = { reserve: item => item === 'widget' }
const payment = { charge: () => {} }
const shipping = { ship: () => {} }
const facade = makeCheckoutFacade(inventory, payment, shipping)
const result1 = facade.placeOrder('widget', 10, '123 Main St')
assert result1.success === true
const result2 = facade.placeOrder('gadget', 10, '123 Main St')
assert result2.success === false
`,
        solution: `function makeCheckoutFacade(inventory, payment, shipping) {
  return {
    placeOrder(item, amount, address) {
      if (!inventory.reserve(item)) return { success: false, reason: 'out of stock' }
      payment.charge(amount)
      shipping.ship(item, address)
      return { success: true }
    },
  }
}`,
      },
    ],
  },
]

export default challenges
