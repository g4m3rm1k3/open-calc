export default {
  id:'a-11',slug:'for-loops',track:'A',order:11,
  title:'For Loops and Iteration',subtitle:'Repeating Over Sequences',
  tags:['for','loops','range','enumerate','break','continue','comprehension'],
  prereqs:['a-10','a-05'],unlocks:['a-12','a-13'],
  hook:{question:'How does a program repeat an operation for every item in a collection?',realWorldContext:'Loops are how programs scale. Computing the average of 5 numbers by hand is feasible. Computing it for 5 million rows requires a loop. Every data processing pipeline is a loop at its core.'},
  intuition:{
    prose:['A `for` loop binds a variable to each element of a sequence, one at a time, running the loop body for each. The loop variable is a regular variable that gets rebound on every iteration.',
      'The **accumulator pattern** is the most important loop pattern: initialize a variable before the loop, update it inside the loop, read the result after. This is how you compute sums, products, counts, and collections.',
      '**List comprehensions** are compact loops that build a new list: `[expression for item in iterable]`. They are faster than equivalent for loops and considered more Pythonic for transforming sequences.'],
    callouts:[
      {type:'important',title:'Accumulator Pattern',body:`total = 0          # initialize
for x in numbers:  # iterate
    total += x     # update
print(total)       # result

This pattern builds: sums, products, counts, strings, lists.`},
    ],
    visualizations:[{id:'PythonNotebook',title:'For Loops',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Iterating a List',prose:'The loop variable takes each value in turn.',instructions:'Run. Then add another name to the list.',code:`names = ["Alice", "Bob", "Carol"]
for name in names:
    print(f"Hello, {name}!")`,output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — range()',prose:'range(n) produces integers 0 to n-1. range(a,b) produces a to b-1. range(a,b,step) adds a step.',instructions:'Run. Note: range(5) gives 0,1,2,3,4 — not 1,2,3,4,5.',code:`for i in range(5):
    print(i)
print("---")
for i in range(2, 8, 2):
    print(i)`,output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Accumulator Pattern',prose:'Initialize before. Update inside. Read after.',instructions:'Trace the value of total after each iteration.',code:`numbers = [3, 1, 4, 1, 5, 9, 2, 6]
total = 0
for n in numbers:
    total += n
average = total / len(numbers)
print(f"Sum: {total}, Average: {average}")`,output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — enumerate()',prose:'When you need both the index and the value, use enumerate().',instructions:'Run. enumerate() produces (index, value) pairs.',code:`fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")`,output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — break and continue',prose:'break exits the loop immediately. continue skips to the next iteration.',instructions:'Run. break exits when it finds the first even. continue skips odd numbers.',code:`numbers = [1, 3, 4, 7, 8, 11]
for n in numbers:
    if n % 2 == 0:
        print(f"First even: {n}")
        break

for n in numbers:
    if n % 2 != 0:
        continue
    print(f"Even: {n}")`,output:'',status:'idle'},
      {id:6,cellTitle:'Stage 6 — List Comprehension',prose:'Build a new list by transforming each element. Faster and more readable than an equivalent for loop.',instructions:'Both produce the same result — comprehension is preferred.',code:`numbers = [1, 2, 3, 4, 5]

# Loop version
squares_loop = []
for n in numbers:
    squares_loop.append(n ** 2)

# Comprehension version
squares_comp = [n ** 2 for n in numbers]

print(squares_loop)
print(squares_comp)
print(squares_loop == squares_comp)`,output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Even Squares',difficulty:'easy',
        prompt:'Using a list comprehension, produce a list of squares of all even numbers from 0 to 20 inclusive. Store in even_squares.',
        instructions:`1. Filter for even numbers (n % 2 == 0).
2. Square them.
3. One comprehension with a condition.`,
        code:`even_squares = 
print(even_squares)`,output:'',status:'idle',
        testCode:`
expected=[n**2 for n in range(21) if n%2==0]
if even_squares!=expected: raise ValueError(f"Expected {expected}, got {even_squares}")
res="SUCCESS: [0,4,16,36,64,100,144,196,256,324,400] — 11 even squares from 0 to 20."
res
`,hint:'even_squares = [n**2 for n in range(21) if n%2==0]'},
      {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — Running Maximum',difficulty:'medium',
        prompt:'Write max_so_far(numbers) that returns a list where each element is the maximum of all elements seen so far. Do not use the built-in max() on the full list.',
        instructions:`1. Initialize current_max to the first element.
2. For each element, update current_max if element is larger.
3. Append current_max to the result list at each step.`,
        code:`def max_so_far(numbers):
    # Your code here
    pass

print(max_so_far([3, 1, 4, 1, 5, 9, 2, 6]))`,output:'',status:'idle',
        testCode:`
cases=[([3,1,4,1,5,9,2,6],[3,3,4,4,5,9,9,9]),([1],[1]),([5,4,3,2,1],[5,5,5,5,5])]
for inp,expected in cases:
    got=max_so_far(inp)
    if got!=expected: raise ValueError(f"max_so_far({inp}) should be {expected}, got {got}")
res="SUCCESS: Running maximum correct. This pattern appears in financial time series analysis."
res
`,hint:`def max_so_far(numbers):
    result=[]
    current_max=numbers[0]
    for n in numbers:
        if n>current_max: current_max=n
        result.append(current_max)
    return result`},
    ]}}],
  },
  mentalModel:['for x in iterable: binds x to each element in turn.','Accumulator: initialize → update in loop → read result after.','range(n) gives 0..n-1. range(a,b) gives a..b-1.','enumerate() gives (index, value) pairs.','List comprehension [expr for x in iterable if cond] is faster and Pythonic.'],
}