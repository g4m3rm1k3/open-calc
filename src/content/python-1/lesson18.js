// Chapter 0.7 — Lesson 18: Decomposition
//
// DEPENDENCIES:
//   - Lesson 11: Conditional Execution
//   - Lesson 12/13: Iteration
//   - Lesson 15: Lists (split, join, list comprehensions)
//   - Lesson 16: Dicts (Counter-style counting)
//
// TEACHES:
//   1.  What decomposition is — and what it isn't
//   2.  The monolithic anti-pattern — everything in one function
//   3.  Identifying responsibilities — what kind of thinking is this?
//   4.  Tokenization — get_words() with punctuation stripping
//   5.  Sentence splitting — get_sentences()
//   6.  Aggregation — count_words(), count_unique()
//   7.  Frequency analysis — most_frequent()
//   8.  Numeric computation — average_word_length()
//   9.  The orchestrator pattern — analyze() as coordinator
//   10. Single Responsibility Principle — one job per function
//   11. Debuggability payoff — "if I break one part, where do I look?"
//   12. Case normalisation — upgrading get_words()
//   13. Handling edge cases — empty input, single-sentence text
//   14. Single-pass vs multi-pass — performance awareness

export default {
  id: 'py-0-7-decomposition',
  slug: 'decomposition',
  chapter: 0.7,
  order: 18,
  title: 'Decomposition',
  subtitle: 'Breaking a complex problem into functions that each do one thing well',
  tags: ['decomposition', 'functions', 'single-responsibility', 'orchestrator', 'tokenization', 'refactoring'],

  hook: {
    question: 'What happens when your function does too much?',
    realWorldContext:
      'Every real program starts simple. Then requirements grow — handle punctuation, ' +
      'normalise case, count sentences, find the top word. A single function grows ' +
      'until nobody can read it, debug it, or change one part without breaking another. ' +
      'Decomposition is the discipline of splitting code into functions that each have ' +
      'one clear job — so that when something breaks, you know exactly where to look.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Decomposition is not about splitting code into smaller pieces for its own sake. It is about **separating different kinds of thinking**. Parsing text is a different kind of thinking from counting words, which is different from computing averages. When you mix them in one function, you must hold all of those concerns in your head at once.',
      'The payoff is debuggability. In monolithic code, a bug could be anywhere. In decomposed code, a wrong word count points you immediately to `count_words()`. A bad sentence split points you to `get_sentences()`. The rest of the program is not even worth opening.',
      'The final shape of a well-decomposed program is an **orchestrator** — a top-level function whose entire body is just calls to other functions. It reads like a table of contents. Each chapter is a function you can read and test in isolation.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'One function, one kind of thinking',
        body: 'A function should do one thing and do it completely. If you find yourself writing "and" when describing what a function does ("it splits the text AND counts AND formats"), split it.',
      },
      {
        type: 'insight',
        title: 'The orchestrator reads like a to-do list',
        body: 'When your top-level function is nothing but calls to well-named helpers, the code documents itself. A new reader understands the algorithm in seconds without reading any implementation.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Text Report Generator — Built Step by Step',
        mathBridge: 'Each helper function is a pure mathematical function: a mapping from input to output with no side effects. The orchestrator is function composition: analyze = count_words ∘ get_words, most_frequent ∘ get_words, …',
        caption: 'We build a complete text analyser — first the wrong way, then the right way.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'The problem — a text report generator',
              prose: 'We want a function that takes a paragraph of text and returns five statistics: total words, unique words, most frequent word, average word length, and sentence count. Simple enough — let\'s just write it.',
              code: 'text = "This is a test. This test is only a test."\n\n# What we want to produce:\n# total_words:    10\n# unique_words:   5\n# most_frequent:  "test"\n# avg_length:     3.8\n# sentence_count: 2\nprint("Goal: build analyze(text) that returns all five stats.")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The monolithic approach — everything in one function',
              prose: 'Most first attempts look like this: one function that does parsing, counting, math, and formatting all at once. Run it — it works. But notice how hard it is to read, and imagine what happens when requirements change.',
              code: 'def analyze_monolithic(text):\n    # parsing + counting + math + frequency — all mixed together\n    words = []\n    for word in text.split():\n        clean = ""\n        for ch in word:\n            if ch.isalpha():\n                clean += ch\n        if clean:\n            words.append(clean.lower())\n\n    freq = {}\n    for w in words:\n        freq[w] = freq.get(w, 0) + 1\n\n    top = max(freq, key=lambda k: freq[k]) if freq else ""\n    avg = sum(len(w) for w in words) / len(words) if words else 0\n    sents = text.count(".") + text.count("!") + text.count("?")\n\n    return {"total_words": len(words), "unique_words": len(set(words)),\n            "most_frequent": top, "avg_length": round(avg, 2),\n            "sentence_count": sents}\n\ntext = "This is a test. This test is only a test."\nanalyze_monolithic(text)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'What is wrong with the monolith?',
              prose: 'The monolith works — for now. But it has three fatal problems: (1) Every concern is tangled with every other — change the punctuation rule and you might break the frequency count. (2) You cannot test the average-word-length logic without running the full parser. (3) When there is a bug, you have to read the whole thing to find it. Decomposition fixes all three.',
              code: '# Ask yourself: if avg_length is wrong, where do you look?\n# In the monolith: you have to read ALL of this:\n#   - the character loop (parsing)\n#   - the freq dict (counting)\n#   - the max() call (frequency)\n#   - the sum/len line (math)   ← the bug is here\n#   - the sentence counter\n#\n# In a decomposed version: you look ONLY at average_word_length()\n\nprint("Debugging a monolith means reading everything.")\nprint("Debugging decomposed code means reading one function.")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Identifying responsibilities — what kind of thinking is each line?',
              prose: 'Before writing any code, read the monolith and label each section by its *kind of thinking*. Parsing (turning raw text into structured data), aggregation (counting), data relationships (which word is most common?), and math (computing averages) are four completely different concerns. Each should be its own function.',
              code: '# PARSING ← turning raw text into structured data\n#   split text into words, strip punctuation, normalise case\n\n# AGGREGATION ← simple counts over a collection\n#   total word count, unique word count, sentence count\n\n# DATA RELATIONSHIPS ← which item has the highest frequency?\n#   build a frequency dict, find the maximum\n\n# MATH ← numeric computation over a collection\n#   average word length\n\n# ORCHESTRATION ← call the above in the right order\n#   analyze() itself\n\nprint("Five kinds of thinking → five groups of functions.")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Step 1 — get_words() — tokenization',
              prose: '`get_words(text)` has exactly one job: turn a raw string into a clean list of lowercase alphabetic tokens. It strips punctuation and normalises case. Nothing else. It does not count, it does not compute — it parses.',
              code: 'def get_words(text):\n    """Return a list of lowercase alphabetic tokens from text."""\n    words = []\n    for token in text.split():\n        clean = "".join(ch for ch in token if ch.isalpha())\n        if clean:\n            words.append(clean.lower())\n    return words\n\ntext = "This is a test. This test is only a test."\nprint(get_words(text))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Step 2 — get_sentences() — sentence splitting',
              prose: '`get_sentences(text)` splits text into sentences by splitting on `.`, `!`, and `?`, stripping whitespace, and discarding empty strings. This is a separate concern from word tokenisation — it works on the raw text, not the word list.',
              code: 'import re\n\ndef get_sentences(text):\n    """Return a list of non-empty sentence strings."""\n    parts = re.split(r\'[.!?]+\', text)\n    return [s.strip() for s in parts if s.strip()]\n\ntext = "This is a test. This test is only a test."\nsentences = get_sentences(text)\nprint(sentences)\nprint(len(sentences), "sentences")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Step 3 — count_words() and count_unique()',
              prose: 'These two are almost trivially simple once tokenisation is handled. That simplicity is the point: when parsing is isolated, the counting functions become one-liners that are impossible to get wrong.',
              code: 'def count_words(words):\n    """Total number of word tokens."""\n    return len(words)\n\ndef count_unique(words):\n    """Number of distinct word types."""\n    return len(set(words))\n\nwords = ["this", "is", "a", "test", "this", "test", "is", "only", "a", "test"]\nprint("total: ", count_words(words))    # 10\nprint("unique:", count_unique(words))   # 5',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'Step 4 — most_frequent() — frequency analysis',
              prose: '`most_frequent(words)` builds a frequency dict and returns the word with the highest count. This is the *data relationships* concern — completely separate from parsing and from math. It handles the edge case of an empty list gracefully.',
              code: 'def most_frequent(words):\n    """Return the word that appears most often. Empty list → None."""\n    if not words:\n        return None\n    freq = {}\n    for w in words:\n        freq[w] = freq.get(w, 0) + 1\n    return max(freq, key=lambda k: freq[k])\n\nwords = ["this", "is", "a", "test", "this", "test", "is", "only", "a", "test"]\nprint(most_frequent(words))   # "test" — appears 3 times\nprint(most_frequent([]))      # None',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Step 5 — average_word_length() — numeric computation',
              prose: '`average_word_length(words)` does pure math. It receives an already-clean list of strings and returns a float. It never touches the original text, never strips punctuation — that work is already done. Each function trusts its input because another function already validated it.',
              code: 'def average_word_length(words):\n    """Mean number of characters per word. Empty list → 0.0."""\n    if not words:\n        return 0.0\n    return round(sum(len(w) for w in words) / len(words), 2)\n\nwords = ["this", "is", "a", "test", "this", "test", "is", "only", "a", "test"]\nprint(average_word_length(words))   # 3.8\nprint(average_word_length([]))      # 0.0',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Step 6 — the orchestrator — analyze()',
              prose: 'Now the top-level function becomes trivial. Its body is nothing but calls to helpers. It reads like a table of contents. A new reader understands the algorithm in five seconds. Every implementation detail is hidden behind a well-named function.',
              code: 'def analyze(text):\n    """Orchestrate all helpers to produce a full text report."""\n    words     = get_words(text)\n    sentences = get_sentences(text)\n    return {\n        "total_words":    count_words(words),\n        "unique_words":   count_unique(words),\n        "most_frequent":  most_frequent(words),\n        "avg_length":     average_word_length(words),\n        "sentence_count": len(sentences),\n    }\n\ntext = "This is a test. This test is only a test."\nresult = analyze(text)\nfor key, val in result.items():\n    print(f"{key:>16}: {val}")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'The debuggability payoff',
              prose: 'Here is the real reason to decompose. If `avg_length` is wrong, you open `average_word_length()` — a five-line function. You do not need to read the parser, the counter, or the frequency logic. Each function is a blast radius boundary: a bug cannot escape it.',
              code: '# Simulate finding a bug:\n# avg_length is returning 0 — why?\n\ndef buggy_avg(words):\n    # BUG: forgot to divide by len(words)\n    return round(sum(len(w) for w in words), 2)\n\n# In a monolith, you search 30 lines for this mistake.\n# Here, you test the function directly:\nwords = ["hello", "world"]\nprint(buggy_avg(words))          # 10 — wrong\nprint(average_word_length(words)) # 5.0 — right\n\n# Fix is isolated: change one function, run one test.\nprint("\\nBlast radius: one function, one fix.")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'Upgrading one piece without touching the rest',
              prose: 'A key benefit of decomposition: you can improve one function without risking any other. Here we upgrade `get_words()` to use a list comprehension. The orchestrator `analyze()` is completely unchanged — it does not care how tokenisation works, only what it produces.',
              code: '# Original:\ndef get_words_v1(text):\n    words = []\n    for token in text.split():\n        clean = "".join(ch for ch in token if ch.isalpha())\n        if clean:\n            words.append(clean.lower())\n    return words\n\n# Upgraded — same contract, cleaner implementation:\ndef get_words(text):\n    return [clean for token in text.split()\n            if (clean := "".join(ch for ch in token if ch.isalpha()).lower())]\n\ntext = "Hello, world! Isn\'t this great?"\nprint(get_words_v1(text))\nprint(get_words(text))   # identical output\n# analyze() works unchanged — it only calls get_words()',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Handling edge cases in isolation',
              prose: 'When you need to handle empty input, unusual punctuation, or single-sentence text, each concern is handled in the function responsible for it. `get_words()` handles empty tokens. `average_word_length()` handles empty lists. `most_frequent()` handles no words. Each edge case lives next to the code it protects.',
              code: '# Edge cases are isolated:\nprint(get_words(""))                  # []\nprint(get_words("!!!"))               # []\nprint(count_words([]))                # 0\nprint(count_unique([]))               # 0\nprint(most_frequent([]))              # None\nprint(average_word_length([]))        # 0.0\nprint(get_sentences("No punctuation"))# ["No punctuation"]\n\n# The orchestrator handles all of these automatically:\nprint(analyze(""))                    # all zeros / None\nprint(analyze("One word"))            # works fine',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Single-pass vs multi-pass — performance awareness',
              prose: 'Our decomposed version calls `get_words()` once and passes the result to every other function. This is O(n) total. A naive version might re-scan the text for each statistic, paying O(n) per stat. Decomposition actually enables this efficiency: compute once, share the result.',
              code: '# Efficient: get_words() called ONCE, result reused\ndef analyze_efficient(text):\n    words     = get_words(text)        # one pass over text\n    sentences = get_sentences(text)    # one pass over text\n    # all helpers below operate on the already-computed list\n    return {\n        "total_words":    count_words(words),       # O(1)\n        "unique_words":   count_unique(words),      # O(n)\n        "most_frequent":  most_frequent(words),     # O(n)\n        "avg_length":     average_word_length(words), # O(n)\n        "sentence_count": len(sentences),           # O(1)\n    }\n\n# Compare: a naive approach would call text.split() 5 separate times\nprint("Two passes over raw text, then O(n) operations on the word list.")',
              output: '', status: 'idle', figureJson: null,
            },
            // CHALLENGES
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Write most_frequent using Counter',
              difficulty: 'easy',
              prompt: 'Rewrite `most_frequent(words)` using `collections.Counter` instead of a manual frequency dict. Same contract: return the most common word, or `None` for an empty list.',
              code: 'from collections import Counter\n\ndef most_frequent(words):\n    pass\n\nprint(most_frequent(["a", "b", "a", "c", "a"]))  # "a"\nprint(most_frequent([]))                          # None\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
from collections import Counter
if 'most_frequent' not in dir():
    res = "ERROR: Function 'most_frequent' not defined."
else:
    r1 = most_frequent(["a", "b", "a", "c", "a"])
    r2 = most_frequent([])
    r3 = most_frequent(["x"])
    if r1 != "a":
        res = f"ERROR: Expected 'a', got {r1!r}."
    elif r2 is not None:
        res = f"ERROR: Empty list should return None, got {r2!r}."
    elif r3 != "x":
        res = f"ERROR: Single-element list should return 'x', got {r3!r}."
    else:
        res = "SUCCESS: most_frequent using Counter works correctly."
res
`,
              hint: 'Counter(words).most_common(1) returns a list of (word, count) tuples. Use [0][0] to get just the word.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Write get_sentences() without regex',
              difficulty: 'easy',
              prompt: 'Write `get_sentences(text)` without importing `re`. Split on `.`, `!`, and `?` manually — iterate through the string splitting on each delimiter. Return a list of non-empty stripped sentence strings.',
              code: 'def get_sentences(text):\n    pass\n\nprint(get_sentences("Hello world. How are you? Great!"))  # 3 sentences\nprint(get_sentences("No punctuation"))                    # 1 sentence\nprint(get_sentences(""))                                  # []\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'get_sentences' not in dir():
    res = "ERROR: Function 'get_sentences' not defined."
else:
    r1 = get_sentences("Hello world. How are you? Great!")
    r2 = get_sentences("No punctuation")
    r3 = get_sentences("")
    if len(r1) != 3:
        res = f"ERROR: Expected 3 sentences, got {len(r1)}: {r1}."
    elif len(r2) != 1:
        res = f"ERROR: Text with no punctuation should return 1 sentence, got {r2}."
    elif r3 != []:
        res = f"ERROR: Empty string should return [], got {r3}."
    else:
        res = "SUCCESS: get_sentences splits correctly on . ! ?"
res
`,
              hint: 'Start with text. Replace "!" and "?" with "." then split on ".". Strip and filter empty strings.',
            },
            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Build the full analyze() orchestrator',
              difficulty: 'medium',
              prompt: 'Given the helpers below, write `analyze(text)` as a pure orchestrator — its body should only call helpers, not implement any logic itself. Return the five-key dict.',
              code: `import re
from collections import Counter

def get_words(text):
    return [clean for token in text.split()
            if (clean := "".join(ch for ch in token if ch.isalpha()).lower())]

def get_sentences(text):
    parts = re.split(r'[.!?]+', text)
    return [s.strip() for s in parts if s.strip()]

def count_words(words):      return len(words)
def count_unique(words):     return len(set(words))
def most_frequent(words):
    if not words: return None
    return Counter(words).most_common(1)[0][0]
def average_word_length(words):
    if not words: return 0.0
    return round(sum(len(w) for w in words) / len(words), 2)

def analyze(text):
    pass  # orchestrate the helpers above

text = "This is a test. This test is only a test."
print(analyze(text))
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import re
from collections import Counter
def get_words(text):
    return [clean for token in text.split()
            if (clean := "".join(ch for ch in token if ch.isalpha()).lower())]
def get_sentences(text):
    parts = re.split(r'[.!?]+', text)
    return [s.strip() for s in parts if s.strip()]
def count_words(words):  return len(words)
def count_unique(words): return len(set(words))
def most_frequent(words):
    if not words: return None
    return Counter(words).most_common(1)[0][0]
def average_word_length(words):
    if not words: return 0.0
    return round(sum(len(w) for w in words) / len(words), 2)

if 'analyze' not in dir():
    res = "ERROR: Function 'analyze' not defined."
else:
    r = analyze("This is a test. This test is only a test.")
    if not isinstance(r, dict):
        res = f"ERROR: analyze must return a dict, got {type(r)}."
    elif r.get("total_words") != 10:
        res = f"ERROR: total_words should be 10, got {r.get('total_words')}."
    elif r.get("unique_words") != 5:
        res = f"ERROR: unique_words should be 5, got {r.get('unique_words')}."
    elif r.get("most_frequent") != "test":
        res = f"ERROR: most_frequent should be 'test', got {r.get('most_frequent')!r}."
    elif r.get("sentence_count") != 2:
        res = f"ERROR: sentence_count should be 2, got {r.get('sentence_count')}."
    else:
        res = f"SUCCESS: analyze() orchestrates correctly. Result: {r}"
res
`,
              hint: 'Call get_words(text) once and store the result. Then pass that list to every counting/math helper.',
            },
            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Add word_frequency() helper and wire it in',
              difficulty: 'medium',
              prompt: 'Write `word_frequency(words)` that returns a dict mapping each word to its count, sorted by count descending. Then update `analyze()` to include a `"top_5"` key with the 5 most frequent words (just the words, not counts). This is the decomposition workflow: add a helper, wire it into the orchestrator.',
              code: `import re
from collections import Counter

def get_words(text):
    return [clean for token in text.split()
            if (clean := "".join(ch for ch in token if ch.isalpha()).lower())]

def get_sentences(text):
    parts = re.split(r'[.!?]+', text)
    return [s.strip() for s in parts if s.strip()]

def count_words(words):  return len(words)
def count_unique(words): return len(set(words))
def most_frequent(words):
    if not words: return None
    return Counter(words).most_common(1)[0][0]
def average_word_length(words):
    if not words: return 0.0
    return round(sum(len(w) for w in words) / len(words), 2)

def word_frequency(words):
    pass  # return dict sorted by count descending

def analyze(text):
    pass  # include "top_5" key

text = "to be or not to be that is the question to be"
result = analyze(text)
print(result["top_5"])   # ["to", "be", ...]
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import re
from collections import Counter
def get_words(text):
    return [clean for token in text.split()
            if (clean := "".join(ch for ch in token if ch.isalpha()).lower())]
def get_sentences(text):
    parts = re.split(r'[.!?]+', text)
    return [s.strip() for s in parts if s.strip()]
def count_words(words):  return len(words)
def count_unique(words): return len(set(words))
def most_frequent(words):
    if not words: return None
    return Counter(words).most_common(1)[0][0]
def average_word_length(words):
    if not words: return 0.0
    return round(sum(len(w) for w in words) / len(words), 2)

if 'word_frequency' not in dir():
    res = "ERROR: Function 'word_frequency' not defined."
elif 'analyze' not in dir():
    res = "ERROR: Function 'analyze' not defined."
else:
    text = "to be or not to be that is the question to be"
    r = analyze(text)
    freq = word_frequency(get_words(text))
    if not isinstance(freq, dict):
        res = f"ERROR: word_frequency must return a dict, got {type(freq)}."
    elif freq.get("to") != 3:
        res = f"ERROR: 'to' should appear 3 times, got {freq.get('to')}."
    elif "top_5" not in r:
        res = "ERROR: analyze result must include 'top_5' key."
    elif len(r["top_5"]) != 5:
        res = f"ERROR: top_5 should have 5 words, got {len(r['top_5'])}: {r['top_5']}."
    elif r["top_5"][0] not in ("to", "be"):
        res = f"ERROR: First item of top_5 should be 'to' or 'be', got {r['top_5'][0]!r}."
    else:
        res = f"SUCCESS: word_frequency and updated analyze() work correctly. Top 5: {r['top_5']}"
res
`,
              hint: 'word_frequency: use Counter(words) then dict(sorted(Counter(words).items(), key=lambda x: -x[1])). In analyze(), top_5 = list(word_frequency(words).keys())[:5].',
            },
          ],
        },
      },
    ],
  },
}
