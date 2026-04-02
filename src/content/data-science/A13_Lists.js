export default {
  id:'a-13',slug:'lists-and-sequences',track:'A',order:13,
  title:'Lists and Sequences',subtitle:'Ordered, Mutable Collections',
  tags:['list','indexing','slicing','mutation','append','nested'],
  prereqs:['a-11','a-04'],unlocks:['a-14','b-01'],
  hook:{question:'How does a program store and manipulate an ordered collection of values?',realWorldContext:'A list is the most fundamental data structure in data science. A DataFrame column is a list. A feature vector is a list. An array is a list. Understanding indexing, slicing, and mutation is non-negotiable.'},
  intuition:{
    prose:['A list is an **ordered, mutable sequence**. Ordered means elements have positions (indices). Mutable means you can change elements without creating a new list. Indexing starts at 0.',
      '**Slicing** extracts a sub-sequence: `lst[start:stop:step]`. Start is inclusive, stop is exclusive. Negative indices count from the end. Omitted values default to start=0, stop=len, step=1.',
      'Lists are **mutable** — you can change them in place with append(), insert(), remove(), pop(), and direct index assignment. This is different from strings and tuples, which are immutable.'],
    callouts:[{type:'important',title:'Index Rules',body:`lst = [10, 20, 30, 40, 50]
lst[0]   = 10  (first)
lst[-1]  = 50  (last)
lst[1:3] = [20, 30]  (indices 1 and 2)
lst[:2]  = [10, 20]  (first two)
lst[2:]  = [30, 40, 50]  (from index 2 to end)`}],
    visualizations:[{id:'PythonNotebook',title:'Lists in Depth',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Indexing',prose:'Zero-based indexing. Negative indices count from the end.',instructions:'Predict each output before running.',code:`lst = [10, 20, 30, 40, 50]
print(lst[0])    # 10
print(lst[-1])   # 50
print(lst[2])    # 30
print(lst[-2])   # 40`,output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Slicing',prose:'Extract sub-lists with start:stop:step. Stop is exclusive.',instructions:'Run. Try lst[::2] (every other element) and lst[::-1] (reversed).',code:`lst = [0,1,2,3,4,5,6,7,8,9]
print(lst[2:5])    # [2,3,4]
print(lst[:3])     # [0,1,2]
print(lst[7:])     # [7,8,9]
print(lst[::2])    # every other
print(lst[::-1])   # reversed`,output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Mutation',prose:'Lists are mutable — elements can be changed, added, removed.',instructions:'Run. Notice that all operations modify the SAME list object.',code:`lst = [1, 2, 3]
lst.append(4)         # add to end
print(lst)
lst.insert(1, 99)     # insert at index 1
print(lst)
lst.remove(99)        # remove first occurrence
print(lst)
popped = lst.pop()    # remove and return last
print(lst, popped)`,output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — List Operations',prose:'Lists support + (concatenation) and * (repetition). These create NEW lists.',instructions:'Run. The + and * create new lists — the originals are unchanged.',code:`a = [1, 2, 3]
b = [4, 5, 6]
print(a + b)          # [1,2,3,4,5,6]
print([0] * 5)        # [0,0,0,0,0]
print(3 in a)         # True
print(len(a + b))     # 6`,output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — Nested Lists',prose:'A list can contain other lists. This is how matrices are represented before NumPy.',instructions:'Access element [1][2]: second row (index 1), third column (index 2).',code:`matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print(matrix[0])      # first row
print(matrix[1][2])   # 6: row 1, col 2
for row in matrix:
    print(row)`,output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Top 3',difficulty:'medium',
        prompt:'Write top3(numbers) that returns the three largest values in a list, sorted descending, using only slicing and sorted(). Do not use nlargest() or sort().',
        instructions:`1. Sort the list.
2. Take the last 3 (largest).
3. Reverse them.
4. Return a list.`,
        code:`def top3(numbers):
    # Your code here
    pass

print(top3([3,1,4,1,5,9,2,6]))`,output:'',status:'idle',
        testCode:`
cases=[([3,1,4,1,5,9,2,6],[9,6,5]),([1,2,3],[3,2,1]),([10,10,10,1],[10,10,10])]
for inp,expected in cases:
    got=top3(inp)
    if got!=expected: raise ValueError(f"top3({inp}) should be {expected}, got {got}")
res="SUCCESS: sorted()[:-4:-1] or sorted()[-3:][::-1] — both work."
res
`,hint:`def top3(numbers):
    return sorted(numbers)[-3:][::-1]`},
      {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — List Flattener',difficulty:'hard',
        prompt:'Write flatten(nested) that converts a list of lists into a single flat list. Do not use any library function — use only loops.',
        instructions:`1. Iterate over the outer list.
2. Iterate over each inner list.
3. Append each element to result.`,
        code:`def flatten(nested):
    # Your code here
    pass

print(flatten([[1,2],[3,4],[5]]))`,output:'',status:'idle',
        testCode:`
cases=[([[1,2],[3,4],[5]],[1,2,3,4,5]),([[],[ 1]],[1]),([[1,2,3]],[1,2,3])]
for inp,expected in cases:
    got=flatten(inp)
    if got!=expected: raise ValueError(f"flatten({inp}) should be {expected}, got {got}")
res="SUCCESS: Nested list flattening — appears constantly in data preprocessing."
res
`,hint:`def flatten(nested):
    result=[]
    for sublist in nested:
        for item in sublist:
            result.append(item)
    return result`},
    ]}}],
  },
  mentalModel:['Indexing: starts at 0. Negative: counts from end. lst[-1] is last element.','Slicing: lst[start:stop:step]. Stop is exclusive. Omit for defaults.','Mutation: append, insert, remove, pop, direct index assignment modify the list in place.','+ creates a new list. * repeats. in tests membership.','Nested lists: lst[row][col] for matrix access.'],
}