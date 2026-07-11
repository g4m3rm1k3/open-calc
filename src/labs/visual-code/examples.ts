import { normalizeProject } from './transpiler.ts'
import type { Project } from './types.ts'

export interface ExampleMeta {
  id: string
  name: string
  description: string
  tags: string[]
  emoji: string
  project: Project
}

// ─── Empty project ────────────────────────────────────────────────────────────

export const EMPTY_PROJECT: Project = normalizeProject({
  schemaVersion: 2,
  id: 'empty',
  name: 'Untitled Project',
  target: 'typescript',
  files: [{ id: 'file_main', name: 'main.ts', blocks: [] }],
  activeFileId: 'file_main',
  html: '<main id="app"></main>',
})

// ─── Example projects ─────────────────────────────────────────────────────────

export const EXAMPLES: ExampleMeta[] = [
  {
    id: 'counter',
    name: 'Click Counter',
    description: 'A button that counts clicks. Shows variables, functions, and DOM events.',
    tags: ['Beginner', 'JavaScript', 'DOM'],
    emoji: '🔢',
    project: normalizeProject({
      schemaVersion: 2,
      id: 'ex-counter',
      name: 'Click Counter',
      target: 'javascript',
      files: [{
        id: 'file_main',
        name: 'main.js',
        blocks: [
          { id: 'c_var', type: 'variable', category: 'state', fields: { kind: 'let', name: 'count', value: '0' }, children: [] },
          {
            id: 'c_fn',
            type: 'function',
            category: 'oop',
            fields: { name: 'increment', params: '', async: 'false' },
            children: [
              { id: 'c_assign', type: 'assign', category: 'state', fields: { target: 'count', value: 'count + 1' }, children: [] },
              { id: 'c_text', type: 'htmlText', category: 'html', fields: { selector: '#display', text: '`Clicks: ${count}`' }, children: [] },
            ],
          },
          {
            id: 'c_evt',
            type: 'event',
            category: 'html',
            fields: { selector: '#btn', event: 'click' },
            children: [
              { id: 'c_call', type: 'call', category: 'oop', fields: { expression: 'increment()' }, children: [] },
            ],
          },
        ],
      }],
      activeFileId: 'file_main',
      html: '<div id="app" style="text-align:center;padding:40px"><button id="btn" style="font-size:2rem;padding:20px 40px;border-radius:12px;border:none;background:#6366f1;color:white;cursor:pointer">Click me</button><h1 id="display" style="font-size:3rem;margin-top:24px;color:#1e293b">Clicks: 0</h1></div>',
    }),
  },

  {
    id: 'score-tracker',
    name: 'Score Tracker',
    description: 'A TypeScript class with fields, a constructor, methods, and a getter. The anatomy of OOP.',
    tags: ['OOP', 'TypeScript', 'Classes'],
    emoji: '🏆',
    project: normalizeProject({
      schemaVersion: 2,
      id: 'ex-score',
      name: 'Score Tracker',
      target: 'typescript',
      files: [{
        id: 'file_main',
        name: 'main.ts',
        blocks: [
          {
            id: 'sc_iface',
            type: 'interface',
            category: 'types',
            fields: { name: 'Scorable', extendsName: '', accessModifier: 'export' },
            children: [
              { id: 'si_name', type: 'interfaceField', category: 'types', fields: { name: 'name', type: 'string', optional: 'false', readonly: 'true' }, children: [] },
              { id: 'si_score', type: 'interfaceField', category: 'types', fields: { name: 'score', type: 'number', optional: 'false', readonly: 'false' }, children: [] },
              { id: 'si_add', type: 'interfaceField', category: 'types', fields: { name: 'addScore', type: '(pts: number) => string', optional: 'false', readonly: 'false' }, children: [] },
            ],
          },
          {
            id: 'sc_class',
            type: 'class',
            category: 'oop',
            fields: { name: 'Player', extendsName: '', implements: 'Scorable', accessModifier: 'export' },
            children: [
              { id: 'sc_fname', type: 'field', category: 'state', fields: { name: 'name', type: 'string', value: '"Unknown"', access: 'public', static: 'false' }, children: [] },
              { id: 'sc_fscore', type: 'field', category: 'state', fields: { name: 'score', type: 'number', value: '0', access: 'public', static: 'false' }, children: [] },
              { id: 'sc_ctor', type: 'constructor', category: 'oop', fields: { params: 'name: string', body: 'this.name = name\nthis.score = 0' }, children: [] },
              { id: 'sc_method', type: 'method', category: 'oop', fields: { name: 'addScore', params: 'pts: number', returnType: 'string', access: 'public', async: 'false', body: 'this.score += pts\nreturn `${this.name}: ${this.score}`' }, children: [] },
              { id: 'sc_getter', type: 'getter', category: 'oop', fields: { name: 'label', returnType: 'string', body: 'return `${this.name} (${this.score} pts)`' }, children: [] },
            ],
          },
          { id: 'sc_inst', type: 'variable', category: 'state', fields: { kind: 'const', name: 'player', type: 'Player', value: 'new Player("Ada")' }, children: [] },
          { id: 'sc_log', type: 'log', category: 'output', fields: { expression: 'player.label' }, children: [] },
          {
            id: 'sc_evt',
            type: 'event',
            category: 'html',
            fields: { selector: '#addBtn', event: 'click' },
            children: [
              { id: 'sc_upd', type: 'htmlText', category: 'html', fields: { selector: '#scoreboard', text: 'player.addScore(1)' }, children: [] },
            ],
          },
        ],
      }],
      activeFileId: 'file_main',
      html: '<div id="app" style="text-align:center;padding:40px"><h1 style="color:#6366f1">Score Tracker</h1><button id="addBtn" style="font-size:1.5rem;padding:14px 32px;border-radius:10px;border:none;background:#6366f1;color:white;cursor:pointer">+1 Point</button><h2 id="scoreboard" style="font-size:2rem;margin-top:20px"></h2></div>',
    }),
  },

  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    description: 'Inheritance in action — a base Animal class extended by Dog and Cat. See how subclasses reuse and override.',
    tags: ['OOP', 'Inheritance', 'TypeScript'],
    emoji: '🐾',
    project: normalizeProject({
      schemaVersion: 2,
      id: 'ex-animals',
      name: 'Animal Kingdom',
      target: 'typescript',
      files: [{
        id: 'file_main',
        name: 'main.ts',
        blocks: [
          {
            id: 'an_base',
            type: 'class',
            category: 'oop',
            fields: { name: 'Animal', extendsName: '', accessModifier: 'export' },
            children: [
              { id: 'an_name', type: 'field', category: 'state', fields: { name: 'name', type: 'string', value: '""', access: 'public', static: 'false' }, children: [] },
              { id: 'an_ctor', type: 'constructor', category: 'oop', fields: { params: 'name: string', body: 'this.name = name' }, children: [] },
              { id: 'an_speak', type: 'method', category: 'oop', fields: { name: 'speak', params: '', returnType: 'string', access: 'public', async: 'false', body: 'return `${this.name} makes a sound.`' }, children: [] },
            ],
          },
          {
            id: 'an_dog',
            type: 'class',
            category: 'oop',
            fields: { name: 'Dog', extendsName: 'Animal', accessModifier: 'export' },
            children: [
              { id: 'dog_ctor', type: 'constructor', category: 'oop', fields: { params: 'name: string', body: 'super(name)' }, children: [] },
              { id: 'dog_speak', type: 'method', category: 'oop', fields: { name: 'speak', params: '', returnType: 'string', access: 'public', async: 'false', body: 'return `${this.name} says: Woof!`' }, children: [] },
            ],
          },
          {
            id: 'an_cat',
            type: 'class',
            category: 'oop',
            fields: { name: 'Cat', extendsName: 'Animal', accessModifier: 'export' },
            children: [
              { id: 'cat_ctor', type: 'constructor', category: 'oop', fields: { params: 'name: string', body: 'super(name)' }, children: [] },
              { id: 'cat_speak', type: 'method', category: 'oop', fields: { name: 'speak', params: '', returnType: 'string', access: 'public', async: 'false', body: 'return `${this.name} says: Meow!`' }, children: [] },
            ],
          },
          { id: 'an_arr', type: 'variable', category: 'state', fields: { kind: 'const', name: 'animals', type: 'Animal[]', value: '[new Dog("Rex"), new Cat("Luna"), new Dog("Buddy")]' }, children: [] },
          { id: 'an_loop', type: 'loop', category: 'flow', fields: { count: 'animals.length', iterator: 'i', body: 'console.log(animals[i].speak())' }, children: [] },
        ],
      }],
      activeFileId: 'file_main',
      html: '<div id="app" style="padding:40px"><h1 style="color:#f59e0b">Animal Kingdom</h1><p>Open the Run tab and click Run to hear the animals speak.</p></div>',
    }),
  },

  {
    id: 'fizzbuzz',
    name: 'FizzBuzz',
    description: 'The classic interview problem. Loops, conditionals, and console output.',
    tags: ['Beginner', 'Loops', 'Logic'],
    emoji: '🔁',
    project: normalizeProject({
      schemaVersion: 2,
      id: 'ex-fizzbuzz',
      name: 'FizzBuzz',
      target: 'javascript',
      files: [{
        id: 'file_main',
        name: 'main.js',
        blocks: [
          {
            id: 'fb_fn',
            type: 'function',
            category: 'oop',
            fields: { name: 'fizzBuzz', params: 'n', async: 'false' },
            children: [
              {
                id: 'fb_if1',
                type: 'if',
                category: 'flow',
                fields: { condition: 'n % 15 === 0', body: 'return "FizzBuzz"' },
                children: [],
              },
              {
                id: 'fb_if2',
                type: 'if',
                category: 'flow',
                fields: { condition: 'n % 3 === 0', body: 'return "Fizz"' },
                children: [],
              },
              {
                id: 'fb_if3',
                type: 'if',
                category: 'flow',
                fields: { condition: 'n % 5 === 0', body: 'return "Buzz"' },
                children: [],
              },
              { id: 'fb_ret', type: 'return', category: 'flow', fields: { expression: 'String(n)' }, children: [] },
            ],
          },
          { id: 'fb_loop', type: 'loop', category: 'flow', fields: { kind: 'for', iterator: 'i', count: '20', body: 'console.log(fizzBuzz(i + 1))' }, children: [] },
        ],
      }],
      activeFileId: 'file_main',
      html: '<div id="app" style="padding:40px"><h1>FizzBuzz</h1><p>Open Run tab and click Run to see the output.</p></div>',
    }),
  },

  {
    id: 'py-animals',
    name: 'Animal Kingdom (Python)',
    description: 'Python classes with __init__, methods, and inheritance. The same OOP concepts as JS but with Python syntax.',
    tags: ['Python', 'OOP', 'Beginner'],
    emoji: '🐍',
    project: normalizeProject({
      schemaVersion: 2,
      id: 'ex-py-animals',
      name: 'Animal Kingdom',
      target: 'python',
      files: [{
        id: 'file_main',
        name: 'main.py',
        blocks: [
          {
            id: 'py_animal',
            type: 'class',
            category: 'oop',
            fields: { name: 'Animal', extendsName: '', accessModifier: 'none' },
            children: [
              { id: 'py_a_name', type: 'field', category: 'state', fields: { name: 'name', value: 'None', static: 'false' }, children: [] },
              { id: 'py_a_ctor', type: 'constructor', category: 'oop', fields: { params: 'name', body: 'self.name = name' }, children: [] },
              { id: 'py_a_speak', type: 'method', category: 'oop', fields: { name: 'speak', params: '', body: 'return self.name + " makes a sound."' }, children: [] },
            ],
          },
          {
            id: 'py_dog',
            type: 'class',
            category: 'oop',
            fields: { name: 'Dog', extendsName: 'Animal', accessModifier: 'none' },
            children: [
              { id: 'py_d_ctor', type: 'constructor', category: 'oop', fields: { params: 'name', body: 'self.name = name' }, children: [] },
              { id: 'py_d_speak', type: 'method', category: 'oop', fields: { name: 'speak', params: '', body: 'return self.name + " says: Woof!"' }, children: [] },
            ],
          },
          {
            id: 'py_cat',
            type: 'class',
            category: 'oop',
            fields: { name: 'Cat', extendsName: 'Animal', accessModifier: 'none' },
            children: [
              { id: 'py_c_ctor', type: 'constructor', category: 'oop', fields: { params: 'name', body: 'self.name = name' }, children: [] },
              { id: 'py_c_speak', type: 'method', category: 'oop', fields: { name: 'speak', params: '', body: 'return self.name + " says: Meow!"' }, children: [] },
            ],
          },
          { id: 'py_dog_inst', type: 'variable', category: 'state', fields: { name: 'dog', value: 'Dog("Rex")' }, children: [] },
          { id: 'py_cat_inst', type: 'variable', category: 'state', fields: { name: 'cat', value: 'Cat("Luna")' }, children: [] },
          { id: 'py_log1', type: 'log', category: 'output', fields: { expression: 'dog.speak()' }, children: [] },
          { id: 'py_log2', type: 'log', category: 'output', fields: { expression: 'cat.speak()' }, children: [] },
        ],
      }],
      activeFileId: 'file_main',
      html: '<main id="app"></main>',
    }),
  },

  {
    id: 'ts-types',
    name: 'TypeScript Types',
    description: 'Interfaces, type aliases, and enums — the TypeScript type system in one project.',
    tags: ['TypeScript', 'Types', 'Advanced'],
    emoji: '🔷',
    project: normalizeProject({
      schemaVersion: 2,
      id: 'ex-types',
      name: 'TypeScript Types',
      target: 'typescript',
      files: [{
        id: 'file_main',
        name: 'main.ts',
        blocks: [
          {
            id: 'ts_enum',
            type: 'enum',
            category: 'types',
            fields: { name: 'Direction', accessModifier: 'export' },
            children: [
              { id: 'ts_e1', type: 'enumMember', category: 'types', fields: { name: 'North', value: '"north"' }, children: [] },
              { id: 'ts_e2', type: 'enumMember', category: 'types', fields: { name: 'South', value: '"south"' }, children: [] },
              { id: 'ts_e3', type: 'enumMember', category: 'types', fields: { name: 'East', value: '"east"' }, children: [] },
              { id: 'ts_e4', type: 'enumMember', category: 'types', fields: { name: 'West', value: '"west"' }, children: [] },
            ],
          },
          {
            id: 'ts_alias',
            type: 'typeAlias',
            category: 'types',
            fields: { name: 'Coordinates', value: '{ x: number; y: number }', accessModifier: 'export' },
            children: [],
          },
          {
            id: 'ts_iface',
            type: 'interface',
            category: 'types',
            fields: { name: 'Explorer', extendsName: '', accessModifier: 'export' },
            children: [
              { id: 'ts_if1', type: 'interfaceField', category: 'types', fields: { name: 'name', type: 'string', optional: 'false', readonly: 'true' }, children: [] },
              { id: 'ts_if2', type: 'interfaceField', category: 'types', fields: { name: 'position', type: 'Coordinates', optional: 'false', readonly: 'false' }, children: [] },
              { id: 'ts_if3', type: 'interfaceField', category: 'types', fields: { name: 'facing', type: 'Direction', optional: 'false', readonly: 'false' }, children: [] },
            ],
          },
          {
            id: 'ts_class',
            type: 'class',
            category: 'oop',
            fields: { name: 'Rover', extendsName: '', accessModifier: 'export' },
            children: [
              { id: 'ts_ctor', type: 'constructor', category: 'oop', fields: { params: 'public readonly name: string, public position: Coordinates, public facing: Direction', body: '' }, children: [] },
              { id: 'ts_method', type: 'method', category: 'oop', fields: { name: 'status', params: '', returnType: 'string', access: 'public', async: 'false', body: 'return `${this.name} at (${this.position.x},${this.position.y}) facing ${this.facing}`' }, children: [] },
            ],
          },
          { id: 'ts_inst', type: 'variable', category: 'state', fields: { kind: 'const', name: 'rover', type: 'Rover', value: 'new Rover("Curiosity", { x: 0, y: 0 }, Direction.North)' }, children: [] },
          { id: 'ts_log', type: 'log', category: 'output', fields: { expression: 'rover.status()' }, children: [] },
        ],
      }],
      activeFileId: 'file_main',
      html: '<div id="app" style="padding:40px"><h1 style="color:#8b5cf6">TypeScript Types</h1><p>Open Run to see the rover\'s status. Select each block in the program to learn about interfaces, enums, and type aliases.</p></div>',
    }),
  },
]
