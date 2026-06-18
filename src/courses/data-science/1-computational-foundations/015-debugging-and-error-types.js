export default {
  id:'a-15',slug:'debugging-and-error-types',track:'A',order:15,
  title:'Algorithmic Thinking and Debugging',subtitle:'Reading Errors, Finding Bugs',
  tags:['debugging','errors','traceback','systematic','decomposition'],
  prereqs:['a-11','a-14'],unlocks:['b-01'],
  hook:{question:'How do you find a bug you cannot see by reading the code?',realWorldContext:'Professional developers spend as much time debugging as writing code. The difference between a junior and a senior developer is not that seniors make fewer mistakes — it is that seniors find them faster, because they have a systematic approach.'},
  intuition:{
    prose:[`Python's errors are categorized. **SyntaxError**: malformed code — Python could not even parse it. **NameError**: used a name that was not bound. **TypeError**: wrong type for an operation. **IndexError**: index out of bounds. **KeyError**: key not in dict. **ValueError**: right type, wrong value. Knowing the category tells you where to look.`,
      `A **traceback** shows the call chain that led to the error, innermost call last. Read it from the bottom up: the error type and message are at the bottom, the exact line is just above.`,
      `**Decomposition** is the algorithmic design strategy: break any problem into smaller sub-problems, solve each separately, combine. If a sub-problem is still too large, decompose again. A function that does one thing is both easier to write and easier to debug.`],
    callouts:[{type:'important',title:'Error Taxonomy',body:`SyntaxError: malformed code — look at highlighted line
NameError: variable not bound — check spelling and order
TypeError: wrong type — check what type you have vs need
IndexError: list index out of bounds — check length
KeyError: dict key missing — use .get() or check key exists
ValueError: right type, wrong value — check the value itself
ZeroDivisionError: dividing by zero — guard with if divisor!=0`}],
    visualizations:[{id:'PythonNotebook',title:'Debugging Lab',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Reading a Traceback',prose:'Run the cell. Read the traceback from the bottom up. What type of error? What line?',instructions:'Identify: error type, line number, cause. Then fix the bug.',code:`def calculate(data):
    total = sum(data)
    average = total / len(data)
    return average

nums = [1, 2, 3, "4", 5]  # bug: string in list
result = calculate(nums)
print(result)`},
      {id:2,cellTitle:'Stage 2 — Five Common Errors',prose:'Each of these cells has a classic bug. Read the error, identify the type, fix it.',instructions:'Fix each bug. The comment explains what was intended.',code:`# Bug 1: NameError
# total = sums([1,2,3])  # typo — uncomment and fix

# Bug 2: IndexError
lst = [1,2,3]
# print(lst[5])  # out of bounds — uncomment and fix

# Bug 3: TypeError
# print("Count: " + 42)  # uncomment and fix

# Bug 4: KeyError
d = {"a":1}
# print(d["b"])  # uncomment and fix with .get()

print("All fixed!")`},
      {id:3,cellTitle:'Stage 3 — The Rubber Duck Method',prose:'Describe each line out loud (or in a comment). You will often spot the bug while explaining.',instructions:'Read the description and find the bug without running first.',code:`# DESCRIPTION: This function should return the average of non-zero elements
def avg_nonzero(numbers):
    total = 0
    count = 0
    for n in numbers:       # iterate over numbers
        if n != 0:          # only non-zero
            total += n      # accumulate
    average = total / count # BUG: count is always 0!
    return average

# Fix it, then run:
print(avg_nonzero([1,0,2,0,3]))`},
      {id:4,cellTitle:'Stage 4 — Decomposition Strategy',prose:'A complex problem becomes simple when broken into functions.',instructions:'Run the cell. Each sub-function does one thing. The main function combines them.',code:`def load_scores(text):
    """Parse "Alice:90,Bob:85" into a dict"""
    result = {}
    for item in text.split(","):
        name, score = item.split(":")
        result[name.strip()] = int(score.strip())
    return result

def compute_stats(scores):
    """Return mean and max from a scores dict"""
    values = list(scores.values())
    return sum(values)/len(values), max(values)

raw = "Alice:90, Bob:85, Carol:92"
scores = load_scores(raw)
mean, best = compute_stats(scores)
print(f"Average: {mean:.1f}, Best: {best}")`},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Bug Hunt',difficulty:'medium',
        prompt:'The function below has 3 bugs. Find and fix all of them. Do not change the logic — only fix the bugs.',
        instructions:`1. Read the error messages one at a time. 2. Fix each bug and run again. 3. The function should return the percentage of passing scores (>=60) as a float 0-100.`,
        code:`def pass_rate(scores):
    passing = 0
    for score in scores:
        if score => 60:      # Bug 1
            passing =+ 1    # Bug 2
    return passing / len(scores) * 100  # Bug 3: crashes on empty list

print(pass_rate([70, 45, 85, 55, 90]))`,
        testCode:`
cases=[([70,45,85,55,90],60.0),([100,100],100.0),([0,0,0],0.0)]
for inp,expected in cases:
    got=pass_rate(inp)
    if abs(got-expected)>0.01: raise ValueError(f"pass_rate({inp}) should be {expected}, got {got}")
res="SUCCESS: 3 bugs found: >= not =>, += not =+, and the empty list guard."
res
`,hint:`Bug1: >= not =>
Bug2: += not =+
Bug3: if not scores: return 0.0`},
      {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — FizzBuzz Refactored',difficulty:'medium',
        prompt:`Write a clean, well-decomposed FizzBuzz: for numbers 1-30, print "Fizz" if divisible by 3, "Buzz" if by 5, "FizzBuzz" if by both, else the number. Write a classify(n) helper function first, then call it in the loop.`,
        instructions:`1. Write classify(n) → returns the correct string for n. 2. Use a for loop calling classify(). 3. Clean code: no repeated conditions.`,
        code:`def classify(n):
    # Your code here
    pass

for i in range(1,31):
    print(classify(i))`,
        testCode:`
cases=[(3,"Fizz"),(5,"Buzz"),(15,"FizzBuzz"),(7,"7"),(1,"1"),(30,"FizzBuzz")]
for n,expected in cases:
    got=str(classify(n))
    if got!=expected: raise ValueError(f"classify({n}) should be {expected!r}, got {got!r}")
res="SUCCESS: FizzBuzz with helper function. The decomposition makes the logic testable."
res
`,hint:`def classify(n):
    if n%15==0: return "FizzBuzz"
    elif n%3==0: return "Fizz"
    elif n%5==0: return "Buzz"
    else: return str(n)`},
    ]}}],
  },
  mentalModel:[`Error taxonomy: Syntax→parse, Name→binding, Type→types, Index/Key→container, Value→bad value.`,`Read tracebacks bottom-up: error type and message are at the bottom.`,`Rubber duck: explain each line out loud — bugs surface during explanation.`,`Decompose: one function, one task. Testable sub-functions make debugging local.`,`Guard against edge cases: empty list, zero divisor, missing key.`],
}