export default {
  id:'a-14',slug:'dictionaries-and-sets',track:'A',order:14,
  title:'Dictionaries and Sets',subtitle:'Key-Value Mapping and Uniqueness',
  tags:['dict','set','hashmap','lookup','comprehension','O1'],
  prereqs:['a-13'],unlocks:['a-15','b-01'],
  hook:{question:'How do you store data by name rather than by position?',realWorldContext:'Dictionaries are the data structure of data science. JSON is a dict. A DataFrame row is a dict. A word frequency counter is a dict. Any time you need O(1) lookup by key, you need a dict.'},
  intuition:{
    prose:['A **dictionary** maps keys to values. Lookup is O(1) — instant regardless of size — because Python uses a hash table. Keys must be immutable (strings, numbers, tuples). Values can be anything.',
      'A **set** is like a dictionary with only keys, no values. It stores unique elements. Set operations — union, intersection, difference — correspond directly to mathematical set theory and are O(1) per element.',
      '**Dict comprehension** builds a dict from an expression: `{k: v for k, v in iterable}`. It is to dicts what list comprehension is to lists.'],
    callouts:[{type:'important',title:'.get() vs Direct Access',body:`d = {"a": 1}
d["b"]       # KeyError — key does not exist
d.get("b")   # None — no error
d.get("b",0) # 0 — default value

Always use .get() when the key might not exist.`}],
    visualizations:[{id:'PythonNotebook',title:'Dictionaries and Sets',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Dict Basics',prose:'Create, read, update, and delete dict entries.',instructions:'Run. Notice dict["missing_key"] crashes but .get() does not.',code:`d = {"name":"Alice","age":30,"city":"NYC"}
print(d["name"])
print(d.get("salary",0))  # default 0
d["age"] = 31             # update
d["email"] = "a@b.com"    # add new key
print(d)`,output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Iterating Dicts',prose:'Three ways to iterate: keys, values, or key-value pairs.',instructions:'Run. items() is most commonly used — gives both key and value.',code:`scores = {"Alice":92,"Bob":78,"Carol":85}
for k in scores:            # keys
    print(k)
for v in scores.values():   # values
    print(v)
for k,v in scores.items():  # pairs
    print(f"{k}: {v}")`,output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Word Frequency Counter',prose:'The classic dict pattern: count occurrences of each unique item.',instructions:'Run. Notice .get(word,0) is the key pattern — default 0 for unseen words.',code:`text = "the cat sat on the mat the cat"
freq = {}
for word in text.split():
    freq[word] = freq.get(word,0) + 1
print(freq)`,output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — Sets',prose:'Sets store unique elements. Membership testing is O(1) like dicts.',instructions:'Run. Notice {1,2,2,3} becomes {1,2,3} — duplicates removed automatically.',code:`a = {1,2,3,4}
b = {3,4,5,6}
print(a | b)   # union
print(a & b)   # intersection
print(a - b)   # difference (in a but not b)
print(2 in a)  # O(1) membership test`,output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — Dict Comprehension',prose:'Build a dict in one expression.',instructions:'Run. The same pattern that produces list comprehensions produces dict comprehensions.',code:`names = ["Alice","Bob","Carol"]
lengths = {name: len(name) for name in names}
print(lengths)

# Filter with condition
long_names = {k:v for k,v in lengths.items() if v > 3}
print(long_names)`,output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Group By',difficulty:'medium',
        prompt:'Write group_by_first_letter(words) that returns a dict where each key is a letter and each value is a list of words starting with that letter.',
        instructions:`1. Initialize empty dict.
2. For each word, add to the list for that letter.
3. Use .get() or setdefault() to handle missing keys.`,
        code:`def group_by_first_letter(words):
    # Your code here
    pass

words = ["apple","avocado","banana","cherry","apricot","blueberry"]
print(group_by_first_letter(words))`,output:'',status:'idle',
        testCode:`
result=group_by_first_letter(["apple","avocado","banana","cherry","apricot","blueberry"])
assert sorted(result["a"])==["apple","apricot","avocado"],f"a: {result.get('a')}"
assert sorted(result["b"])==["banana","blueberry"],f"b: {result.get('b')}"
assert result["c"]==["cherry"],f"c: {result.get('c')}"
res="SUCCESS: Grouping by first letter — this is the split step of split-apply-combine."
res
`,hint:`def group_by_first_letter(words):
    result={}
    for w in words:
        letter=w[0]
        result.setdefault(letter,[]).append(w)
    return result`},
      {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — Invert a Dict',difficulty:'medium',
        prompt:'Write invert(d) that swaps keys and values. Input: {"a":1,"b":2,"c":3}. Output: {1:"a",2:"b",3:"c"}. Use a dict comprehension.',
        instructions:`1. Iterate over d.items().
2. Swap k and v in the comprehension.
3. One line.`,
        code:`def invert(d):
    # Your code here
    pass

print(invert({"a":1,"b":2,"c":3}))`,output:'',status:'idle',
        testCode:`
result=invert({"a":1,"b":2,"c":3})
if result!={1:"a",2:"b",3:"c"}: raise ValueError(f"Expected {{1:a,2:b,3:c}}, got {result}")
res="SUCCESS: Dict inversion with comprehension — {v:k for k,v in d.items()}"
res
`,hint:`def invert(d):
    return {v:k for k,v in d.items()}`},
    ]}}],
  },
  mentalModel:['Dict maps keys→values. Lookup is O(1). Keys must be immutable.','Always use .get(key, default) when the key might not exist.','Set stores unique elements. Union |, intersection &, difference -.','Word frequency counter: freq[word] = freq.get(word,0) + 1','Dict comprehension: {k:v for k,v in iterable}'],
}