import type { PracticeChallenge } from './loader'

export const title = 'Command Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeTurnOnCommand(light)` returning `{ execute(), undo() }`, where `execute` calls `light.turnOn()` and `undo` calls `light.turnOff()`.',
        starter: '',
        tests: `
const light = { isOn: false, turnOn() { this.isOn = true }, turnOff() { this.isOn = false } }
const command = makeTurnOnCommand(light)
assert (command.execute(), true)
assert light.isOn === true
assert (command.undo(), true)
assert light.isOn === false
`,
        solution: `function makeTurnOnCommand(light) {
  return {
    execute() { light.turnOn() },
    undo() { light.turnOff() },
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
        prompt: 'Finish `makeHistory()` returning `{ run(command), undoLast() }`. `run` must EXECUTE the given command and record it; `undoLast` must call `undo()` on the MOST RECENTLY run command.',
        starter: 'function makeTurnOnCommand(light) {\n  return {\n    execute() { light.turnOn() },\n    undo() { light.turnOff() },\n  }\n}\nfunction makeHistory() {\n  // TODO: return { run(command), undoLast() } — run() executes a command and\n  // records it; undoLast() undoes the MOST RECENTLY run command\n  return {\n    run(command) { command.execute() },\n    undoLast() {},\n  }\n}',
        tests: `
const light = { isOn: false, turnOn() { this.isOn = true }, turnOff() { this.isOn = false } }
const command = makeTurnOnCommand(light)
const history = makeHistory()
assert (history.run(command), true)
assert light.isOn === true
assert (history.undoLast(), true)
assert light.isOn === false
`,
        solution: `function makeTurnOnCommand(light) {
  return {
    execute() { light.turnOn() },
    undo() { light.turnOff() },
  }
}
function makeHistory() {
  const executed = []
  return {
    run(command) {
      command.execute()
      executed.push(command)
    },
    undoLast() {
      const command = executed.pop()
      if (command) command.undo()
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
        prompt: 'Write `makeMacroCommand(commands)` returning `{ execute(), undo() }`. `execute` runs every command in `commands` IN ORDER; `undo` reverses each command IN REVERSE ORDER — the correct way to undo a sequence of actions.',
        starter: '',
        tests: `
const log = []
function makeLogCommand(name) { return { execute() { log.push('do:'+name) }, undo() { log.push('undo:'+name) } } }
const macro = makeMacroCommand([makeLogCommand('a'), makeLogCommand('b'), makeLogCommand('c')])
assert (macro.execute(), true)
assert JSON.stringify(log) === JSON.stringify(['do:a','do:b','do:c'])
assert (macro.undo(), true)
assert JSON.stringify(log) === JSON.stringify(['do:a','do:b','do:c','undo:c','undo:b','undo:a'])
`,
        solution: `function makeMacroCommand(commands) {
  return {
    execute() { for (const c of commands) c.execute() },
    undo() { for (let i = commands.length - 1; i >= 0; i--) commands[i].undo() },
  }
}`,
      },
    ],
  },
]

export default challenges
