import type { PracticeChallenge } from './loader'

export const title = 'Literals'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'A literal is a value written directly in code. Write three functions: `numberLiteral()` returning `42`, `stringLiteral()` returning `\'literal\'`, and `boolLiteral()` returning `true`.',
        starter: '',
        tests: `
assert numberLiteral() === 42
assert stringLiteral() === 'literal'
assert boolLiteral() === true
`,
        solution: `function numberLiteral() { return 42; }
function stringLiteral() { return 'literal'; }
function boolLiteral() { return true; }`,
      },
      {
        lang: 'typescript',
        prompt: 'A literal is a value written directly in code. Write three functions: `numberLiteral()` returning `42`, `stringLiteral()` returning `\'literal\'`, and `boolLiteral()` returning `true`.',
        starter: '',
        tests: `
assert numberLiteral() === 42
assert stringLiteral() === 'literal'
assert boolLiteral() === true
`,
        solution: `function numberLiteral(): number { return 42; }
function stringLiteral(): string { return 'literal'; }
function boolLiteral(): boolean { return true; }`,
      },
      {
        lang: 'python',
        prompt: 'A literal is a value written directly in code. Write three functions: `number_literal()` returning `42`, `string_literal()` returning `\'literal\'`, and `bool_literal()` returning `True`.',
        starter: '',
        tests: `
assert number_literal() == 42
assert string_literal() == 'literal'
assert bool_literal() == True
`,
        solution: `def number_literal():
    return 42

def string_literal():
    return 'literal'

def bool_literal():
    return True`,
      },
      {
        lang: 'java',
        prompt: 'A literal is a value written directly in code. Write three methods: `numberLiteral()` returning `42`, `stringLiteral()` returning `"literal"`, and `boolLiteral()` returning `true`.',
        starter: '',
        tests: `
assert numberLiteral() == 42
assert stringLiteral().equals("literal")
assert boolLiteral() == true
`,
        solution: `static int numberLiteral() { return 42; }
static String stringLiteral() { return "literal"; }
static boolean boolLiteral() { return true; }`,
      },
      {
        lang: 'csharp',
        prompt: 'A literal is a value written directly in code. Write three methods: `NumberLiteral()` returning `42`, `StringLiteral()` returning `"literal"`, and `BoolLiteral()` returning `true`.',
        starter: '',
        tests: `
assert NumberLiteral() == 42
assert StringLiteral() == "literal"
assert BoolLiteral() == true
`,
        solution: `static int NumberLiteral() { return 42; }
static string StringLiteral() { return "literal"; }
static bool BoolLiteral() { return true; }`,
      },
      {
        lang: 'cpp',
        prompt: 'A literal is a value written directly in code. Write three functions: `numberLiteral()` returning `42`, `stringLiteral()` returning `"literal"`, and `boolLiteral()` returning `true`.',
        starter: '',
        tests: `
assert numberLiteral() == 42
assert stringLiteral() == "literal"
assert boolLiteral() == true
`,
        solution: `int numberLiteral() { return 42; }
std::string stringLiteral() { return "literal"; }
bool boolLiteral() { return true; }`,
      },
    ],
  },
]

export default challenges
