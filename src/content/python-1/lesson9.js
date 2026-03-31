// Chapter 0.3 — Lesson 9: Writing Functions
//
// DEPENDENCIES: 
//   - Lesson 4: Variables (Function names are bindings)
//   - Lesson 5: State (Tracking the local scope "sandbox")
//   - Lesson 7 & 8: Built-ins & Composition (Using tools inside tools)
//
// 1. THE BLUEPRINT: Defining logic with 'def'.
// 2. PARAMETERS: The placeholders for future data.
// 3. THE RETURN: Passing data back to the execution spiral.
// 4. LOCAL SCOPE: Understanding the Isolation Sandbox.

export default {
  id: 'py-0-3-writing-functions',
  slug: 'writing-functions',
  chapter: 0.3,
  order: 9,
  title: 'Writing Functions',
  subtitle: 'From Consumer to Maker',
  tags: ['def', 'returns', 'parameters', 'scope', 'abstraction'],

  hook: {
    question: 'How do you create your own digital tools from scratch?',
    realWorldContext:
      'Imagine you are designing a specialized calculator. Instead of typing the same math 100 times, ' +
      'you build a single button that performs that math for you. In Python, `def` is how you build that button. ' +
      'You are moving from using the toolbox to building the tools.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**Defining a Function** is like creating a blueprint for a future calculation. When you use the `def` keyword, you aren\'t "running" the code yet—you are **storing the logic** in your state map under a name.',
      'A function has three main parts:',
      '1. **The Name**: How you call the tool later.\n2. **The Parameters**: The empty slots where data will be dropped.\n3. **The Work**: The indented block of code that processes that data.',
      'One of the most important concepts is **Local Scope**. Inside a function, you are in a "Sandbox." Variables you create there are deleted the moment the function finishes. This prevents your main program from getting cluttered with "scratch work."',
      'To send information BACK out of the sandbox, you must use the `return` keyword. Without it, the function returns `None` by default.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The "def" Binding',
        body: 'When you write `def my_tool():`, you are binding the logic of that function to the name `my_tool`. Just like `x = 5` binds a number, `def` binds a behavior.',
      },
      {
        type: 'insight',
        title: 'Arguments vs Parameters',
        body: 'Parameters are the **Labels** in the blueprint (e.g., `x` in `def f(x)`). Arguments are the **Real Data** you pass in later (e.g., `5` in `f(5)`).',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Maker Space',
        mathBridge: 'We are now creating the Mathematical Functions $f(x)$ that we used earlier.',
        caption: '16 Stages of Function Mastery.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1: The Blueprint',
              prose: 'Creating a name for a behavior. Notice: nothing prints until we CALL the function.',
              instructions: 'Run this. Note that "Hello" only appears AFTER the print at the bottom calls it.',
              code: 'def say_hi():\n    print("Hello from inside!")\n\nprint("Calling now...")\nsay_hi()',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Stage 2: The Input Slot (Parameters)',
              prose: 'Parameters are placeholders for data we don\'t have yet.',
              instructions: 'Notice how "name" becomes "Alice" during the first call and "Bob" during the second.',
              code: 'def greet(name):\n    print("Hello,", name)\n\ngreet("Alice")\ngreet("Bob")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Stage 3: The Return Pipeline',
              prose: 'Returning data lets us use the result in a calculation later.',
              instructions: 'Check the out area. `add_five(10)` reduces to `15`, which is then used by the print.',
              code: 'def add_five(num):\n    return num + 5\n\nresult = add_five(10)\nresult',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Stage 4: Local Scope (The Sandbox)',
              prose: 'Variables created inside a function are "Internal." They do not exist outside.',
              instructions: 'Observe: "internal_data" results in a NameError if we try to access it outside the function.',
              code: 'def sandbox():\n    internal_data = 100\n    return internal_data\n\nsandbox()\n# print(internal_data) # This would crash!',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Stage 5: Multi-Input Tools',
              prose: 'Machines can have multiple slots separated by commas.',
              instructions: 'Try changing the arguments. 10 and 20 are mapped to a and b.',
              code: 'def multiply(a, b):\n    return a * b\n\nmultiply(10, 20)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Stage 6: The "None" Default',
              prose: 'If you don\'t write "return", Python assumes you returned nothing.',
              instructions: 'Notice: result is "None" because the function has no return statement.',
              code: 'def no_return():\n    x = 10 + 20\n\nresult = no_return()\nprint("Result is:", result)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Stage 7: Early Returns',
              prose: 'The "return" keyword immediately kills the function and exits.',
              instructions: 'Note that "This line never runs" is never reached.',
              code: 'def escape():\n    return "I am out!"\n    print("This line never runs")\n\nescape()',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'Stage 8: Default Parameters',
              prose: 'You can make arguments optional.',
              instructions: 'Identify: When we don\'t provide a message, it defaults to "Guest".',
              code: 'def welcome(user="Guest"):\n    return "Welcome, " + user\n\nprint(welcome("Alice"))\nprint(welcome())',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Stage 9: Scope Shadowing',
              prose: 'Using the same name inside and outside. Local wins inside.',
              instructions: 'Observe: the inner "x" is 100, but the outer "x" is still 10.',
              code: 'x = 10\ndef check_scope():\n    x = 100\n    return x\n\nprint("Inner:", check_scope())\nprint("Outer:", x)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Stage 10: Boolean Predictors',
              prose: 'Functions that answer questions.',
              instructions: 'Is length greater than 5? The function returns a boolean.',
              code: 'def is_long(word):\n    return len(word) > 5\n\nis_long("Pythonic")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Stage 11: Transformation Chains',
              prose: 'Performing math on a property of an input.',
              instructions: 'Mapping a string length to its square.',
              code: 'def area_of_text(t):\n    length = len(t)\n    return length ** 2\n\narea_of_text("Square")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'Stage 12: Argument Propagation',
              prose: 'Passing many values through a logic gate.',
              instructions: 'Finding the average of three values.',
              code: 'def average(a, b, c):\n    return (a + b + c) / 3\n\naverage(10, 20, 30)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Stage 13: Composing Custom Tools',
              prose: 'Using one of your functions inside another.',
              instructions: 'Observe: triple() uses double() inside its own logic.',
              code: 'def double(n): return n * 2\ndef triple(n): return double(n) + n\n\ntriple(10)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Stage 14: Built-in Integration',
              prose: 'Using built-in tools inside your custom machines.',
              instructions: 'Using abs() to ensure a difference tool is always positive.',
              code: 'def safe_diff(a, b):\n    return abs(a - b)\n\nsafe_diff(10, 50)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 15,
              cellTitle: 'Stage 15: Metadata Mapping',
              prose: 'Creating tools that identify data categories.',
              instructions: 'Checking if an input is a number.',
              code: 'def is_number(val):\n    return type(val) == int or type(val) == float\n\nis_number(3.14)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 16,
              cellTitle: 'Stage 16: The Final Synthesis',
              prose: 'Complete machine: Arguments -> Processing -> Built-in -> Return.',
              instructions: 'This tool measures, rounds, and returns.',
              code: 'def analyze(text):\n    raw = len(text) / 3\n    return round(raw, 1)\n\nanalyze("Advanced")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Greeter Machine',
              difficulty: 'easy',
              prompt: 'Define a function `say_hello` that takes a `name` and returns "Hi " + name.',
              instructions: '1. def say_hello(name):\n2. return "Hi " + name',
              code: '# Define here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'say_hello' not in locals(): 
    res = "ERROR: I can't find a function named 'say_hello'. Did you use 'def say_hello(name):'?"
elif say_hello("User") == "Hi User":
    res = "SUCCESS: Greeter active! Communication tools are now under your control."
else:
    res = "ERROR: Check your return logic. It should return 'Hi ' + name."
res
`,
            },
            {
              id: 22,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'The Square Tool',
              difficulty: 'easy',
              prompt: 'Create `square(n)` that returns n times itself.',
              instructions: 'Must use `return`.',
              code: '# Your square tool\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'square' not in locals(): 
    res = "ERROR: Missing function 'square'. Did you define it using 'def square(n):'?"
elif square(4) == 16:
    res = "SUCCESS: Power tool verified. Math logic is now abstracted."
else:
    res = "ERROR: Logic verification failed. 4 squared should be 16."
res
`,
            },
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'The Subtractor',
              difficulty: 'easy',
              prompt: 'Create `subtract(a, b)` that returns a - b.',
              instructions: 'Isolated multi-parameter test.',
              code: '# Your code\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'subtract' not in locals(): 
    res = "ERROR: Missing function 'subtract'. Did you define it with two parameters (a, b)?"
elif subtract(10, 4) == 6:
    res = "SUCCESS: Subtraction active. Multi-input machines confirmed."
else:
    res = "ERROR: Check subtraction logic. a - b is different from b - a!"
res
`,
            },
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Word Scrutiny',
              difficulty: 'medium',
              prompt: 'Define `is_epic(word)`: returns True if length > 7, else False.',
              instructions: 'Synthesize len() and Boolean Logic.',
              code: '# Your code\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'is_epic' not in locals(): 
    res = "ERROR: Missing function 'is_epic'. Use 'def is_epic(word):' to begin."
elif is_epic("Hi") == False and is_epic("Monumental") == True:
    res = "SUCCESS: Logic verified. Function accurately measures and categorizes strings."
else:
    res = "ERROR: Logical check failed. 7 or fewer should be False, more than 7 should be True."
res
`,
              hint: 'return len(word) > 7',
            },
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Temp Converter',
              difficulty: 'medium',
              prompt: 'Create `to_kelvin(celsius)`: returns celsius + 273.15.',
              instructions: 'Standard math mapping.',
              code: '# Your code\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'to_kelvin' not in locals(): 
    res = "ERROR: Missing function 'to_kelvin'. celsius + 273.15 is the goal."
elif round(to_kelvin(0), 2) == 273.15:
    res = "SUCCESS: Conversion machine verified. Absolute zero is now accessible."
else:
    res = "ERROR: Return value was not correct. Check your math."
res
`,
              hint: 'return celsius + 273.15',
            },
            {
              id: 26,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'The Shouter',
              difficulty: 'medium',
              prompt: 'Build `shout(text)`: returns text + "!!!"',
              instructions: 'Isolated string manipulation.',
              code: '# Your code',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'shout' not in locals(): 
    res = "ERROR: Missing function 'shout'. Example: shout('hi') -> 'hi!!!'."
elif shout("Hi") == "Hi!!!":
    res = "SUCCESS: Communication level maximized. Shout received."
else:
    res = "ERROR: Check your return concatenation."
res
`,
              hint: 'return text + "!!!"',
            },
            {
              id: 27,
              challengeType: 'write',
              challengeNumber: 7,
              challengeTitle: 'The Clamper',
              difficulty: 'hard',
              prompt: 'Build `clamp(val)`: returns the value, but capped at 100 using built-in `min()`.',
              instructions: 'Combine Lesson 7 (built-ins) with Lesson 9 (def).',
              code: '# Your code',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'clamp' not in locals(): 
    res = "ERROR: Missing function 'clamp'. It should restrict values to 100 max."
elif clamp(150) == 100 and clamp(50) == 50:
    res = "SUCCESS: Safety clamp active. Infinite values restricted."
else:
    res = "ERROR: Logic verification failed. Check return min(val, 100)."
res
`,
              hint: 'return min(val, 100)',
            },
            {
              id: 28,
              challengeType: 'write',
              challengeNumber: 8,
              challengeTitle: 'Metadata Tool',
              difficulty: 'hard',
              prompt: 'Build `identify(x)`: returns the type of x then prints "Identity Known".',
              instructions: 'Challenge: It must return the type and have a side-effect.',
              code: '# Your code',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'identify' not in locals(): 
    res = "ERROR: Missing function 'identify'. It should return type(x)."
elif identify(10) == int:
    res = "SUCCESS: Metadata analyzer verified."
else:
    res = "ERROR: Did you return the result of type(x)?"
res
`,
              hint: 'print("Identity Known") then return type(x)',
            },
            {
              id: 29,
              challengeType: 'write',
              challengeNumber: 9,
              challengeTitle: 'Absolute Difference',
              difficulty: 'hard',
              prompt: 'Build `diff(a, b)`: returns ALWAYS positive difference between a and b using abs().',
              instructions: 'Trace: diff(10, 50) -> 40.',
              code: '# Your code',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'diff' not in locals(): 
    res = "ERROR: Missing function 'diff'. Use 'def diff(a, b):' to start."
elif diff(10, 50) == 40 and diff(50, 10) == 40:
    res = "SUCCESS: Magnitude tool active. Distance is always positive."
else:
    res = "ERROR: Logic check failed. Check your use of abs(a-b)."
res
`,
              hint: 'return abs(a - b)',
            },
            {
              id: 30,
              challengeType: 'write',
              challengeNumber: 10,
              challengeTitle: 'The Master Architect',
              difficulty: 'hard',
              prompt: 'CUMULATIVE: Define `score_word(word, multiplier)`.',
              instructions: "1. Calculate length of word.\n2. Multiply length by multiplier.\n3. Return result.\n\nSynthesis of variables, parameters, math, and measurement.",
              code: '# Build the machine\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'score_word' not in locals(): 
    res = "ERROR: Missing function 'score_word'. The synthesis challenge starts here."
elif score_word("Code", 10) == 40:
    res = "SUCCESS: ARCHITECT STATUS ACHIEVED. You have mastered defining your own tools."
else:
    res = "ERROR: Logic test failed. Trace: length * multiplier."
res
`,
              hint: 'return len(word) * multiplier',
            }
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**The Zero-Cost Blueprint**: Defining a function costs almost zero memory. It is simply a pointer to a set of instructions.',
      '**Parameter Explosion**: Avoid functions with more than 5 parameters. If a machine needs too many pieces, it should probably be two machines.',
      '**Naming as Documentation**: A function named `x(a)` is a mystery. A function named `calculate_tax(income)` is a contract.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The "Invisible" Return',
        body: 'If you omit the `return` line, Python implicitly adds `return None` at the end of your function. Always check your return statements if your variables are ending up as None!',
      },
    ],
  },

  mentalModel: [
    'Define (def) = Blueprint.',
    'Parameters = Empty slots.',
    'Return = Output data.',
    'Scope = Sandbox isolation.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
