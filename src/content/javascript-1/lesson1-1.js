export default {
  id: "j1-variables",
  title: "Variables: Bindings, Not Boxes",
  slug: "variables-bindings-not-boxes",
  number: "1.1",
  description: "Understanding variables as names for values, and the mental model of 'binding' vs 'containers'.",
  chapter: "JavaScript 1",
  
  intuition: `
### Bindings vs Boxes
In many languages, variables are taught as **"boxes"** that hold values. While this is a common analogy, it's technically inaccurate in JavaScript and can lead to confusion when working with objects and references.

In JavaScript, it is better to think of variables as **"bindings"** or **"labels"**. 
A variable is a name that *points* to a value. 

1. **Primitive Values:** The name points directly to the bit-pattern of the value (the number 5, the string "hello").
2. **Objects:** The name points to a memory address (a reference) where the object lives.

When you say \`let x = 5\`, you aren't putting 5 in a box named x. You are telling JavaScript: "Whenever I say 'x', I mean this specific 5."
`,

  concepts: ["Variables", "Let", "Const", "Assignment", "Memory References"],
  
  cells: [
    {
      id: "v1-1",
      type: "markdown",
      instruction: `## The Naming Game
In programming, we need to remember things. We do this by giving names to values. 
Think of it like a **sticker** you put on a value so you can find it later.`
    },
    {
      id: "v1-2",
      type: "challenge",
      instruction: `Use the \`let\` keyword to create a name called \`score\` and point it to the value \`100\`. Then log it out.`,
      startCode: `// Create the variable here\n\nconsole.log(score);`,
      solutionCode: `let score = 100;\nconsole.log(score);`,
      check: (js, logs) => logs.some(l => l.msg === "100")
    },
    {
      id: "v1-3",
      type: "markdown",
      instruction: `## Re-binding (Assignment)
Because we used \`let\`, we can change what our name points to. This is called **re-assignment**.`
    },
    {
      id: "v1-4",
      type: "challenge",
      instruction: `Create a variable \`power\` set to \`10\`. On the next line, change \`power\` to point to \`20\`.`,
      startCode: `let power = 10;\n// Change it here\n\nconsole.log(power);`,
      solutionCode: `let power = 10;\npower = 20;\nconsole.log(power);`,
      check: (js, logs) => logs.some(l => l.msg === "20")
    },
    {
      id: "v1-5",
      type: "markdown",
      instruction: `## Const: The Permanent Sticker
Sometimes you want a name that **never** changes what it points to. For this, we use \`const\` (short for constant).`
    },
    {
      id: "v1-6",
      type: "challenge",
      instruction: `Try to change a \`const\`. Create \`const gravity = 9.8\`. Then try to set \`gravity = 10\` and see what happens in the console.`,
      startCode: `const gravity = 9.8;\n\n// Try to change it\n\nconsole.log(gravity);`,
      solutionCode: `const gravity = 9.8;\ngravity = 10;\nconsole.log(gravity);`,
      check: (js, logs) => logs.some(l => l.level === "error")
    },
    {
        id: "v1-7",
        type: "markdown",
        instruction: `## Multiple Labels
You can have multiple names pointing to the **same** value. Remember: they are just stickers!`
    },
    {
        id: "v1-8",
        type: "challenge",
        instruction: `Create \`let original = "Hello"\`. Then create \`let copy = original\`. Log both. They both point to the same "Hello" in memory.`,
        startCode: `let original = "Hello";\nlet copy = original;\n\nconsole.log(original);\nconsole.log(copy);`,
        solutionCode: `let original = "Hello";\nlet copy = original;\nconsole.log(original);\nconsole.log(copy);`,
        check: (js, logs) => logs.filter(l => l.msg === "Hello").length >= 2
    }
  ]
};
