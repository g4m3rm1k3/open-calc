// Regex Concept Explorer — reference data.
// Same shape as src/data/concept-graph.json (id, title, category, summary,
// intuition, prereqs, steps, walkthrough/example, mistakes) plus one field
// that file doesn't have: `demo` — a live, editable regex scratchpad seeded
// with a relevant pattern/test string, rendered via RegexDemo.jsx.
//
// This is a first slice covering Purpose, History, core syntax, and the
// CS core (backtracking vs. Thompson NFA, greedy/lazy, catastrophic
// backtracking). Capture groups, lookaround, flags, unicode, and the
// build-a-tiny-engine/practice topics are a deliberate next slice, not
// built yet.

export const REGEX_TOPICS = [
  {
    id: 'regex-what-is-it',
    title: 'What Is a Regular Expression',
    category: 'history',
    summary: 'A tiny language for describing a set of strings, so you can search for a pattern instead of an exact substring.',
    intuition: 'Instead of asking "does this exact sequence of characters appear?", a regular expression lets you ask "does something shaped like this appear?" — a phone number, an email address, a line that starts with a timestamp. Every regex describes a shape; matching asks whether a given string has that shape.',
    prereqs: [],
    steps: [
      { text: 'A plain string search — `indexOf`, `includes` — can only ask "does this exact text appear?" It has no vocabulary for "shape": no way to say "one or more digits" or "an @ sign followed by letters."' },
      { text: 'A regular expression is a small, separate language layered inside your code specifically for describing shapes of text: repetition, choice, character sets, position.' },
      { text: 'Every regular expression describes a set of strings — often an infinite one — and matching asks whether a given string is a member of that set. `\\d+` describes the (infinite) set of strings made of one or more digits; "4821" is a member, "48a1" is not.' },
    ],
    mistakes: [
      'Treating a regex as "the thing that finds text" rather than "a description compiled down to a matching machine" — that distinction is what the History and engine-internals concepts in this reference actually explain.',
    ],
    demo: {
      pattern: '\\d+',
      flags: 'g',
      testString: 'Order #4821 shipped on 2024-03-15, invoice 9931.',
      note: 'This pattern describes the shape "one or more digits" — a plain string search could never express that. Try editing the pattern to \\d{4} and watch which numbers stop qualifying.',
    },
  },

  {
    id: 'regex-history',
    title: 'Where Regular Expressions Came From',
    category: 'history',
    summary: "From 1950s mathematical logic, through Ken Thompson's Unix tools, to Perl's explosion of the syntax into every modern language.",
    intuition: "Regex syntax feels a little ad hoc — because it accreted over roughly 70 years, across mathematics, Bell Labs Unix tools, and Perl, rather than being designed by one person in one sitting.",
    prereqs: ['regex-what-is-it'],
    steps: [
      { text: "1951 — mathematician Stephen Kleene, working on McCulloch–Pitts neural-net models for the RAND Corporation, formalized \"regular events\": the class of patterns a finite automaton (a simple abstract machine with a fixed number of states) can recognize. This is where the word \"regular\" comes from — it names a specific, limited class of automaton, not \"ordinary.\"" },
      { text: "1968 — Ken Thompson, at Bell Labs, published \"Regular Expression Search Algorithm\" and implemented it in the QED text editor, then in the Unix editor `ed`. His algorithm compiled a regex directly into a nondeterministic finite automaton and simulated every possible path at once, with no backtracking — this construction is covered as its own concept later in this reference." },
      { text: "1973, as the story is usually told at Bell Labs — Ken Thompson pulled the search feature out of `ed`'s `g/re/p` command (global / regular expression / print) into its own standalone overnight program, at the request of colleague Lee McMahon. That program's name was `grep`, and it's why \"grep\" is still slang for \"search text\" decades later." },
      { text: '1987 — Larry Wall released Perl, which made regular expressions first-class language syntax (`=~`, `s///`) instead of an argument to a separate command-line tool. This is what turned regex from a Unix specialist skill into an everyday programming fixture.' },
      { text: "1997 — Philip Hazel extracted Perl's regex engine into a standalone library, PCRE (Perl Compatible Regular Expressions). Most features that feel \"modern\" later in this reference — named groups, lookahead, lookbehind — trace back to Perl's own extensions, popularized through PCRE, and were later ported (not always identically) into JavaScript, Python, Java, and .NET." },
    ],
    mistakes: [
      "Assuming there's one \"regex\" standard — there isn't. POSIX, PCRE, and JavaScript's own engine (specified in ECMA-262) disagree on details, which is why a pattern copied from a Python tutorial can silently mean something different once pasted into JavaScript.",
    ],
    demo: {
      pattern: 'grep|g/re/p',
      flags: 'gi',
      testString: "Thompson's g/re/p command in ed became the standalone tool grep — and GREP later became slang for any command-line text search.",
      note: 'The name "grep" is literally a regex command spelled out — g/re/p.',
    },
  },

  {
    id: 'regex-literals-anchors',
    title: 'Literal Characters and Anchors',
    category: 'syntax',
    summary: 'The simplest regex is just the text itself; ^ and $ pin a match to the start or end instead of matching a character.',
    intuition: "Most characters in a pattern mean exactly themselves — `cat` matches the three characters c-a-t, in order, anywhere in the string. `^` and `$` don't match a character at all; they match a position — the very start or end of the string — which is why they're called anchors.",
    prereqs: ['regex-what-is-it'],
    steps: [
      { text: 'Any character not given special meaning elsewhere in this reference (letters, digits, spaces) matches itself literally, in sequence — this is called concatenation.' },
      { text: '`^` matches the position at the start of the string. It is zero-width: it consumes no characters itself.' },
      { text: '`$` matches the position at the end of the string — same zero-width behavior.' },
      { text: "Together, `^cat$` matches only a string that is exactly \"cat\" — nothing before, nothing after. That's different from a bare `cat`, which matches inside a longer string like \"concatenate\" too." },
    ],
    mistakes: [
      'Assuming a bare pattern implies whole-string matching — `cat` alone matches inside "concatenate" and "category"; it means "find this anywhere," not "the whole string is this."',
      'Using `^` or `$` and expecting per-line behavior without the `m` flag — by default they anchor to the start/end of the entire string, not each line (see Flags).',
    ],
    demo: {
      pattern: '^cat$',
      flags: '',
      testString: 'cat',
      note: "Widen the test string to 'concatenate' — the anchors stop matching even though 'cat' is still in there.",
    },
  },

  {
    id: 'regex-character-classes',
    title: 'Character Classes',
    category: 'syntax',
    summary: '[...] matches one character from a set you define; \\d \\w \\s are built-in shortcuts for the sets used most often.',
    intuition: 'A character class is a single-character "or": `[abc]` means "one character, and it must be a, b, or c" — not a sequence of three characters.',
    prereqs: ['regex-literals-anchors'],
    steps: [
      { text: '`[abc]` matches exactly one character, provided that character is a, b, or c — it is a one-character choice, not a sequence.' },
      { text: 'A range like `[a-z]` expands to every character between a and z in Unicode code-point order — same mechanism, written compactly.' },
      { text: "`[^abc]` — a `^` as the first character inside the brackets negates the class: match one character that is NOT a, b, or c. This is a different, unrelated use of `^` from the start-of-string anchor — same symbol, meaning determined entirely by position." },
      { text: '`\\d`, `\\w`, `\\s` are built-in shorthand classes: `\\d` = `[0-9]`, `\\w` = `[A-Za-z0-9_]` ("word character"), `\\s` = any whitespace character. Their uppercase forms `\\D \\W \\S` are the negation of each.' },
      { text: '`.` (the dot) is its own special case: outside a character class, it matches almost any single character except a line terminator — unless the `s` flag is set (see Flags), which makes it match literally anything.' },
    ],
    mistakes: [
      'Writing `[0-9-a-z]` intending "digits, dash, or letters" — inside a class, a `-` between two characters means a range; a literal dash has to go first or last in the class (`[-0-9a-z]`) or be escaped.',
      'Forgetting `\\w` includes `_` and digits, not just letters — a class meant to match "letters only" should be `[A-Za-z]`, not `\\w`.',
    ],
    demo: {
      pattern: '[A-Za-z]+',
      flags: 'g',
      testString: 'Order_4821 ships to Unit-7B.',
      note: 'Swap the pattern for \\w+ and watch the underscore and digits join the match.',
    },
  },

  {
    id: 'regex-quantifiers',
    title: 'Quantifiers',
    category: 'syntax',
    summary: 'Quantifiers say how many times the thing right before them may repeat — and by default, they grab as much as possible.',
    intuition: "A quantifier never stands alone — it always applies to whatever atom (a single character, a character class, or a group) sits immediately to its left.",
    prereqs: ['regex-character-classes'],
    steps: [
      { text: '`*` — zero or more of the preceding atom. `ab*` matches "a", "ab", "abbb" — even zero b\'s is fine.' },
      { text: '`+` — one or more. `ab+` requires at least one b; "a" alone does not match.' },
      { text: '`?` — zero or one (optional). `colou?r` matches both "color" and "colour".' },
      { text: '`{n,m}` — an explicit range: `a{2,4}` matches 2 to 4 a\'s. `{n}` alone means exactly n; `{n,}` means n or more, with no upper bound.' },
      { text: 'All four are greedy by default: given a choice, the engine first tries to consume as many characters as possible, then gives characters back one at a time only if the rest of the pattern requires it. `a.*b` against "a1b2b" matches the whole "a1b2b", not the shorter "a1b" — greediness, not any special meaning of `.*`, is why.', prereq: 'regex-engine-backtracking' },
    ],
    mistakes: [
      'Assuming `.*` is "safe" because it looks generic — greedy `.*` can over-match past the intended stopping point on any input with more than one candidate end; the fix (making it lazy) is its own concept later in this reference.',
    ],
    demo: {
      pattern: 'a.*b',
      flags: '',
      testString: 'a1b2b',
      note: "The match swallows the whole string, not just 'a1b' — that's greediness, covered next.",
    },
  },

  {
    id: 'regex-grouping-alternation',
    title: 'Grouping and Alternation',
    category: 'syntax',
    summary: '(...) bundles a sequence into one unit a quantifier can apply to; | picks between whole alternatives.',
    intuition: "Parentheses do two jobs at once: they group a sub-pattern so a quantifier can apply to the whole thing instead of just the last character, and they capture whatever that sub-pattern matched for later use.",
    prereqs: ['regex-quantifiers'],
    steps: [
      { text: '`(ab)+` means "one or more repetitions of the sequence ab", matching "ab", "abab", "ababab" — without the parentheses, `ab+` would mean "one a, then one or more b\'s", a completely different pattern.' },
      { text: '`|` matches whichever of two full alternatives succeeds — `cat|dog` matches either the text "cat" or the text "dog", tried left to right.' },
      { text: '`|` has very low precedence — it splits the entire enclosing pattern (or group) into alternatives, not just the adjacent character. `^cat|dog$` means "(starts with cat) OR (ends with dog)", not "starts with cat-or-dog and ends there"; parentheses are what actually scope it: `^(cat|dog)$`.' },
    ],
    mistakes: [
      'Writing `gray|grey` inside a longer pattern and expecting `|` to bind tightly like a character class does — `|` always splits the whole alternation it belongs to, so `gr(a|e)y` or `gr[ae]y` is usually what was actually meant.',
    ],
    demo: {
      pattern: '^(cat|dog)$',
      flags: '',
      testString: 'dog',
      note: 'Try changing the test string to "catfish" — without the parentheses grouping (cat|dog), the anchors would only apply to one side of the |.',
    },
  },

  {
    id: 'regex-engine-backtracking',
    title: 'How a Backtracking Engine Finds a Match',
    category: 'engine',
    summary: 'Most engines (JavaScript, Python, Perl, PCRE) try one path through the pattern, and when it fails, undo choices and try another — this is backtracking.',
    intuition: 'A backtracking engine behaves like someone solving a maze by walking forward until they hit a dead end, then retracing their last few steps to try a different turn — never abandoning the whole search after one dead end.',
    prereqs: ['regex-grouping-alternation'],
    steps: [
      { text: 'The engine walks the pattern left to right, and at every point where more than one thing could happen next (a greedy quantifier deciding how much to consume, an alternation deciding which branch to try), it commits to one choice and keeps going.' },
      { text: 'If a later part of the pattern then fails to match, the engine backtracks: it undoes the most recent choice, tries the next option for it, and continues from there — repeating this until either a match is found or every combination of choices has failed.' },
    ],
    walkthrough: {
      problem: "Trace `a.*b` matching against the string 'axbxc' step by step.",
      steps: [
        { text: "The engine starts at position 0. `a` matches the literal 'a' at index 0. Position advances to 1." },
        { text: "`.*` is greedy, so it immediately consumes every remaining character: 'xbxc'. Position jumps to index 5, the end of the string." },
        { text: 'The engine now tries to match the final `b` — but there are no characters left. This path fails.' },
        { text: "Backtrack: `.*` gives back exactly one character it had consumed ('c'), retreating to index 4, and the engine tries `b` there — the character is 'c', not 'b'. Fails again." },
        { text: "Backtrack again: `.*` gives back 'x', retreating to index 3. The engine tries `b` at index 3 — that character is 'x'. Fails." },
        { text: "Backtrack again: `.*` gives back 'b' itself, retreating to index 2. The engine tries `b` at index 2 — match! The overall match is 'axb', positions 0 to 3." },
      ],
      answer: "Match: 'axb' — found only after three backtracks, each one undoing one character `.*` had greedily grabbed.",
    },
    mistakes: [
      "Assuming the engine \"looks ahead\" intelligently to find the right amount for `.*` to consume — it doesn't. It always grabs the maximum first and gives characters back one at a time only when a later part of the pattern fails, which is exactly what makes backtracking capable of going exponential (see Catastrophic Backtracking).",
    ],
    demo: {
      pattern: 'a.*b',
      flags: '',
      testString: 'axbxc',
      note: "This is the exact trace above — try 'axbxbxb' and see which b it stops at (the last one, because .* is still greedy).",
    },
  },

  {
    id: 'regex-thompson-nfa',
    title: "Thompson's Construction — Matching Without Backtracking",
    category: 'engine',
    summary: 'An alternative engine design: compile the pattern into a nondeterministic finite automaton and track every possible state at once, in linear time, with no backtracking at all.',
    intuition: "Instead of committing to one path and undoing it on failure, a Thompson-style engine advances every currently-possible path through the pattern by one input character at a time, in lockstep — a dead-end path is simply dropped from the active set, never explored further.",
    prereqs: ['regex-engine-backtracking'],
    steps: [
      { text: "Every regex is first compiled into a graph of states connected by transitions — literal characters, character classes, and epsilon transitions that can be taken for free, without consuming input. This graph is a nondeterministic finite automaton (NFA); the compilation procedure is Thompson's construction, from his 1968 paper.", prereq: 'regex-history' },
      { text: 'To match, the engine keeps a set of currently-active states instead of a single position. For each input character, every active state that can consume it advances; the resulting states become the new active set for the next character.' },
      { text: 'Because the algorithm tracks a set of states rather than exploring one path and retrying, its running time is bounded by pattern size × input length — it can never blow up exponentially, no matter how the pattern is written.' },
      { text: "The tradeoff: this style of engine can efficiently answer \"does it match\" and \"where does it match\", but true backreferences (`\\1`, matching whatever an earlier group actually captured) cannot be expressed as a finite automaton at all — which is why RE2 and Rust's `regex` crate, both built this way for guaranteed performance, simply don't support backreferences, while backtracking engines like PCRE and JavaScript's do." },
    ],
    mistakes: [
      '"The regex engine" is not a single universal design — which algorithm a language actually uses determines both its performance guarantees and which features (backreferences, arbitrary lookbehind) it can even support.',
    ],
    demo: {
      pattern: '(ab)+',
      flags: '',
      testString: 'ababab',
      note: 'This pattern has no backreference, so it could run on either engine design — try adding \\1 after it (e.g. (a)\\1) to see a feature a pure-NFA engine like RE2 cannot support.',
    },
  },

  {
    id: 'regex-greedy-lazy',
    title: 'Greedy vs. Lazy Quantifiers',
    category: 'engine',
    summary: 'Adding ? after a quantifier flips it from "take as much as possible" to "take as little as possible, only growing when the rest of the pattern forces it to."',
    intuition: "Lazy doesn't mean \"matches less stuff\" in general — it means the engine's first guess is the smallest possible amount, grown only when required.",
    prereqs: ['regex-engine-backtracking'],
    steps: [
      { text: '`*?`, `+?`, `??`, `{n,m}?` are the lazy counterparts of `*`, `+`, `?`, `{n,m}` — same repetition range, opposite starting guess.' },
      { text: 'Given `<.+>` against `<b>bold</b>`, greedy `.+` grabs the whole string first, then backtracks from the end until the final `>` matches — the result is the entire `<b>bold</b>`, not just `<b>`.' },
      { text: 'Given `<.+?>` against the same string, lazy `.+?` starts by trying the smallest possible match (one character) and only grows it one character at a time when what follows fails — the result is just `<b>`, stopping at the first `>` it can.' },
      { text: 'Laziness changes where the engine gives up first, not what the pattern is theoretically capable of matching — both greedy and lazy versions of the same quantifier can still match the full range they were given.' },
    ],
    mistakes: [
      'Reaching for a lazy quantifier as a blanket fix for "my regex matched too much," without checking whether a more specific character class (`[^>]+` instead of `.+?`) expresses the actual intent more directly, and often faster.',
    ],
    demo: {
      pattern: '<.+?>',
      flags: 'g',
      testString: '<b>bold</b> and <i>italic</i>',
      note: 'Remove the ? to make it greedy again — watch the whole string collapse into one match spanning from the first < to the last >.',
    },
  },

  {
    id: 'regex-catastrophic-backtracking',
    title: 'Catastrophic Backtracking',
    category: 'engine',
    summary: 'Certain patterns force a backtracking engine to try an exponential number of paths on ordinary-looking input — a real, still-recurring cause of production outages.',
    intuition: 'It happens specifically when a pattern contains nested or adjacent quantifiers that can match the same stretch of input in more than one way — on failure, the engine has no way to know which of those equally-valid ways was "the right one," so it retries all of them.',
    prereqs: ['regex-greedy-lazy', 'regex-thompson-nfa'],
    steps: [
      { text: "The danger shape is ambiguous repetition: a quantified group whose own contents can also repeat, like `(a+)+`, or two adjacent unbounded quantifiers over overlapping character classes." },
      { text: 'This danger is specific to backtracking engines (JavaScript, Python `re`, PCRE) — a Thompson-NFA engine like RE2 or the Rust `regex` crate cannot exhibit it at all, because it never retries; it is one of the concrete reasons those engines exist.', prereq: 'regex-thompson-nfa' },
    ],
    walkthrough: {
      problem: "Why does `(a+)+$` take an unreasonable amount of time against 'aaaaaaaaaaaaaaaaaaaa!' (20 a's, then a character that can never match)?",
      steps: [
        { text: "The outer `(...)+ ` can split 20 a's into groups many different ways — one group of 20, two groups of 10, twenty groups of 1, and everything between — and the inner `a+` matches all of them equally well." },
        { text: "Because the final `$` never matches (the string ends in '!', not end-of-a's), every one of those splits eventually fails." },
        { text: 'The engine, having no way to know in advance which split was "correct," retries every combinatorially possible split before giving up — and the number of ways to split n identical characters into groups grows exponentially with n.' },
        { text: 'At n = 20 that is already over a million attempts; real-world incidents (ReDoS) hit this with n in the thirties or forties, taking a request-handling thread down for seconds to minutes.' },
      ],
      answer: 'Exponential blowup — caused by ambiguous splitting, not by the string being unusually long.',
    },
    mistakes: [
      'Spotting `(a+)+` as "obviously" the dangerous shape and missing that the same ambiguity hides in less obvious forms, like `(\\w+\\s?)+` or `[a-zA-Z]+[a-z]+$`.',
      'Fixing this by adding a timeout instead of removing the ambiguity — a timeout hides the symptom at one input length while leaving the same code vulnerable to a slightly longer one.',
    ],
    demo: {
      pattern: '(a+)+$',
      flags: '',
      testString: 'aaaaaaaaaaaaaaa!',
      note: 'This demo runs inside a timed worker, so a truly catastrophic combination shows a "timed out" message instead of freezing your browser — try adding more a\'s and watch the response get visibly slower before it does.',
    },
  },
];
