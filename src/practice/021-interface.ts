import type { PracticeChallenge } from './loader'

export const title = 'Interface'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `implementsSpeakable(obj)` that returns `true` if `obj` has a callable `.speak` method.',
        starter: '',
        tests: `
assert implementsSpeakable({speak(){return 'hi'}}) === true
assert implementsSpeakable({}) === false
`,
        solution: "function implementsSpeakable(obj) { return typeof obj.speak === 'function'; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `callIfImplements(obj, methodName, ...args)` so it calls `obj[methodName](...args)` if that method exists, or returns `null` otherwise.',
        starter: 'function callIfImplements(obj, methodName, ...args) {\n  // TODO\n}',
        tests: `
assert callIfImplements({greet: () => 'hi'}, 'greet') === 'hi'
assert callIfImplements({}, 'greet') === null
`,
        solution: "function callIfImplements(obj, methodName, ...args) { if (typeof obj[methodName] === 'function') { return obj[methodName](...args); } return null; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `sortBySize(items)` that sorts an array of objects implementing a `.size()` method in ascending order by size, without knowing their concrete type.',
        starter: '',
        tests: `
const items = [{size:()=>3},{size:()=>1},{size:()=>2}]
const sorted = sortBySize(items)
assert JSON.stringify(sorted.map(i=>i.size())) === JSON.stringify([1,2,3])
`,
        solution: 'function sortBySize(items) { return [...items].sort((a, b) => a.size() - b.size()); }',
      },
    ],
  },
]

export default challenges
