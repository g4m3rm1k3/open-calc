export default {
  id:'b-01',slug:'arrays-and-vectorization',track:'B',order:1,
  title:'Arrays and Vectorization',subtitle:'Why NumPy Exists',
  tags:['numpy','array','vectorization','broadcasting','performance'],
  prereqs:['a-13','a-11'],unlocks:['b-02','b-03'],
  hook:{question:'Why is a NumPy array 100x faster than a Python list for math?',realWorldContext:'A Python list of 1 million numbers takes ~50ms to sum. NumPy takes ~1ms. At data scale, this difference is the difference between a pipeline that runs in seconds and one that runs in hours.'},
  intuition:{
    prose:['A Python list stores pointers to objects scattered in memory. To do math, Python must follow each pointer, check the type, and dispatch the operation — for every element. A NumPy array stores values contiguously in memory, one type, no pointers. Math runs in C at memory bandwidth speed.',
      '**Vectorization** means applying an operation to every element without a Python loop. `arr * 2` multiplies every element by 2 in one C call. The loop happens in C, not Python. This is not just faster — it is how you should think about array operations.',
      '**Broadcasting** allows operations between arrays of different shapes by automatically expanding the smaller array. A scalar broadcast over an array. A row broadcast over a matrix. Understanding broadcasting prevents most NumPy shape errors.'],
    callouts:[{type:'important',title:'The Vectorization Mindset',body:`DO NOT write:
  result = []
  for x in arr:
      result.append(x * 2)

WRITE:
  result = arr * 2

Not just faster — more readable and closer to mathematical notation.`}],
    visualizations:[{id:'PythonNotebook',title:'NumPy Arrays',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Speed Comparison',prose:'The same computation in Python vs NumPy.',instructions:'Run the cell. Notice the timing difference.',code:`import numpy as np
import time

# Python list
data = list(range(1_000_000))
start = time.time()
total = sum(x**2 for x in data)
python_time = time.time() - start

# NumPy array
arr = np.arange(1_000_000)
start = time.time()
total_np = np.sum(arr**2)
numpy_time = time.time() - start

print(f"Python: {python_time*1000:.1f}ms")
print(f"NumPy:  {numpy_time*1000:.1f}ms")
print(f"Speedup: {python_time/numpy_time:.0f}x")`,output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Creating Arrays',prose:'NumPy provides many ways to create arrays.',instructions:'Run the cell. Learn these creation functions — you will use them constantly.',code:`import numpy as np
print(np.array([1,2,3,4,5]))
print(np.zeros(5))
print(np.ones((2,3)))
print(np.arange(0,10,2))     # like range()
print(np.linspace(0,1,5))    # 5 evenly spaced points 0→1
print(np.eye(3))             # identity matrix`,output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Vectorized Operations',prose:'Math operations apply element-wise without loops.',instructions:'Run. Every operation applies to all elements simultaneously.',code:`import numpy as np
arr = np.array([1,2,3,4,5])
print(arr * 2)
print(arr ** 2)
print(arr + arr)
print(np.sqrt(arr))
print(np.sin(arr))`,output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — Boolean Indexing',prose:'Apply a boolean condition to get a mask, use mask to filter.',instructions:'Run. This pattern — create mask, apply mask — is used constantly in pandas.',code:`import numpy as np
arr = np.array([3,1,4,1,5,9,2,6])
mask = arr > 4
print(mask)           # [F,F,F,F,T,T,F,T]
print(arr[mask])      # [5,9,6]
print(arr[arr > 4])   # same thing, inline`,output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — Aggregate Functions',prose:'NumPy provides fast aggregate operations.',instructions:'Run. These are the building blocks of descriptive statistics.',code:`import numpy as np
arr = np.array([4,7,2,9,1,5,8,3,6])
print("sum:", np.sum(arr))
print("mean:", np.mean(arr))
print("std:", np.std(arr))
print("min:", np.min(arr))
print("max:", np.max(arr))
print("median:", np.median(arr))`,output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Vectorized Math',difficulty:'easy',
        prompt:'Using only NumPy (no Python loops), create the array [1,2,3,...,1000], compute the sum of squares, and verify it equals n(n+1)(2n+1)/6 for n=1000. Store sum in sum_of_squares.',
        instructions:`1. Create array with np.arange().
2. Square all elements.
3. Sum with np.sum().`,
        code:`import numpy as np
sum_of_squares = 
print(sum_of_squares)
print(1000*1001*2001//6)`,output:'',status:'idle',
        testCode:`
expected=1000*1001*2001//6
if int(sum_of_squares)!=expected: raise ValueError(f"Expected {expected}, got {sum_of_squares}")
res=f"SUCCESS: Sum of squares 1..1000 = {expected}. Formula n(n+1)(2n+1)/6 verified."
res
`,hint:`arr=np.arange(1,1001)
sum_of_squares=np.sum(arr**2)`},
      {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — Normalization',difficulty:'medium',
        prompt:'Write normalize(arr) that returns a new array where each element is scaled to [0,1]. Formula: (x - min) / (max - min). Do not use any loop.',
        instructions:`1. Compute min and max with np.min(), np.max().
2. Apply the formula vectorized.
3. Return the result.`,
        code:`import numpy as np
def normalize(arr):
    # Your code here
    pass

data = np.array([10.0, 20.0, 30.0, 40.0, 50.0])
print(normalize(data))`,output:'',status:'idle',
        testCode:`
import numpy as np
data=np.array([10.0,20.0,30.0,40.0,50.0])
result=normalize(data)
expected=np.array([0,0.25,0.5,0.75,1.0])
if not np.allclose(result,expected): raise ValueError(f"Expected {expected}, got {result}")
res="SUCCESS: Min-max normalization. This appears before nearly every ML algorithm."
res
`,hint:`def normalize(arr):
    return (arr - np.min(arr)) / (np.max(arr) - np.min(arr))`},
    ]}}],
  },
  mentalModel:['NumPy arrays store one type contiguously — math runs in C, not Python.','Vectorization: operate on the whole array at once. No loops.','Boolean indexing: create a boolean mask, use it to filter elements.','np.arange() like range(). np.linspace() for evenly spaced floats.','Aggregates: np.sum, np.mean, np.std, np.min, np.max, np.median.'],
}