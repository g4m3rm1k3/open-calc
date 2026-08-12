// Regex Concept Explorer — reference data.
// Same shape as src/data/concept-graph.json (id, title, category, summary,
// intuition, prereqs, steps, walkthrough/example, mistakes) plus one field
// that file doesn't have: `demo` — a live, editable regex scratchpad seeded
// with a relevant pattern/test string, rendered via RegexDemo.jsx.
//
// Covers Purpose, History, core syntax, the CS core (backtracking vs.
// Thompson NFA, greedy/lazy, catastrophic backtracking, DFA tradeoffs),
// capture groups, lookaround, flags, unicode, building a tiny engine from
// scratch, and a practice/capstone slice.

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

  {
    id: 'regex-capture-groups-backreferences',
    title: 'Capture Groups and Backreferences',
    category: 'advanced',
    summary: 'Parentheses remember what they matched — \\1 (or a named group) lets later parts of the same pattern refer back to it.',
    intuition: "A capturing group doesn't just group for a quantifier — it also stores exactly what matched, numbered left-to-right by opening parenthesis, so the rest of the pattern (or your code afterward) can reuse that exact text.",
    prereqs: ['regex-grouping-alternation'],
    steps: [
      { text: 'Every unescaped `(...)` is a capturing group by default: in addition to grouping, the engine records the substring it matched, accessible afterward as match[1], match[2], etc. — numbered by the position of the opening parenthesis.' },
      { text: 'A backreference, `\\1`, matches — literally — whatever text group 1 actually captured on this attempt, not the pattern that defined group 1.' },
      { text: '`(?<name>...)` is a named capture group — same capturing behavior, accessible by name (`match.groups.name`) instead of only by number, which keeps patterns with several groups readable.' },
    ],
    mistakes: [
      "Confusing `\\1` (\"match the same text again\") with repeating the group's pattern — `(\\w+)\\1` means \"a word, then that exact same word again\" (matches \"hihi\", not \"hiho\"), not \"two word characters.\"",
      "Assuming backreferences work the same everywhere — a Thompson-NFA engine like RE2 can't support them at all, because \"match whatever an earlier group captured\" isn't expressible as a finite automaton.",
    ],
    demo: {
      pattern: '(\\w+) \\1',
      flags: '',
      testString: 'hi hi and bye bye and hi ho',
      note: '\\1 requires the exact same text group 1 captured — that\'s why "hi ho" doesn\'t match but "hi hi" does.',
    },
  },

  {
    id: 'regex-non-capturing-groups',
    title: 'Non-Capturing Groups',
    category: 'syntax',
    summary: '(?:...) groups for precedence or quantifying without allocating a capture slot.',
    intuition: 'Every capturing group has a small cost: the engine has to track and store what it matched. `(?:...)` gets the grouping behavior — precedence, letting a quantifier apply to a sequence — with none of that bookkeeping.',
    prereqs: ['regex-capture-groups-backreferences'],
    steps: [
      { text: "`(?:ab)+` behaves exactly like `(ab)+` for matching purposes — it still matches 'ab', 'abab', etc. — but produces no entry in the match's capture groups." },
      { text: 'This matters once a pattern has several real capturing groups: an unwanted extra `(...)` shifts every backreference and every match[n] number after it, silently breaking code that was counting on match[2] being a particular thing.' },
    ],
    mistakes: [
      "Reaching for a capturing group out of habit for a group that's only ever used for grouping or quantifying, then having to renumber every other group's index after inserting or removing it.",
    ],
    demo: {
      pattern: '(?:https?|ftp)://(\\w+)',
      flags: '',
      testString: 'https://example',
      note: 'Group 1 is just \\w+ (the host) — the protocol alternation groups without occupying a capture slot.',
    },
  },

  {
    id: 'regex-lookahead',
    title: 'Lookahead',
    category: 'advanced',
    summary: "(?=...) and (?!...) assert that something does or doesn't follow, without consuming any characters.",
    intuition: "A lookahead is a condition, not a piece of the match: `(?=...)` says \"and this must be true right here,\" then the engine backs up to exactly where it was and keeps going.",
    prereqs: ['regex-non-capturing-groups'],
    steps: [
      { text: 'Positive lookahead `(?=...)` — the enclosed pattern must match starting at the current position, but none of those characters become part of the overall match.' },
      { text: "Negative lookahead `(?!...)` — the enclosed pattern must NOT match at the current position." },
      { text: "`\\d+(?=px)` matches the digits in '10px' (giving just '10'), but not the digits in '10em' — the 'px' is required to be there, but is never part of the returned match." },
    ],
    mistakes: [
      "Expecting a lookahead's own content to appear in the match — it never does; that's the entire reason it's called \"zero-width.\"",
    ],
    demo: {
      pattern: '\\d+(?=px)',
      flags: 'g',
      testString: 'width: 10px; height: 20em; margin: 5px;',
      note: "Only the px-suffixed numbers match, and 'px' itself is never part of the highlighted text.",
    },
  },

  {
    id: 'regex-lookbehind',
    title: 'Lookbehind',
    category: 'advanced',
    summary: 'The mirror image of lookahead: (?<=...) and (?<!...) assert what comes immediately before the current position.',
    intuition: 'Same zero-width idea as lookahead, just checking backward instead of forward.',
    prereqs: ['regex-lookahead'],
    steps: [
      { text: 'Positive lookbehind `(?<=...)` — the enclosed pattern must match immediately before the current position.' },
      { text: 'Negative lookbehind `(?<!...)` — the enclosed pattern must NOT match immediately before the current position.' },
      { text: "`(?<=\\$)\\d+` matches the digits in '$50' (giving just '50'), but not the digits in '50 dollars' — the '$' has to precede them, but is never part of the returned match." },
    ],
    mistakes: [
      "Assuming lookbehind support is universal and equally unrestricted — JavaScript's lookbehind (added in ES2018) allows variable-length patterns inside it, but plenty of regex flavors historically required lookbehind to be a fixed length, since scanning backward by an unknown amount is a harder engine problem than scanning forward.",
    ],
    demo: {
      pattern: '(?<=\\$)\\d+',
      flags: 'g',
      testString: 'Total: $50, tax: 5, shipping: $12',
      note: "Only the dollar-prefixed numbers match — a plain '5' with no $ doesn't qualify.",
    },
  },

  {
    id: 'regex-word-boundaries',
    title: 'Word Boundaries',
    category: 'syntax',
    summary: '\\b matches the zero-width position between a \\w character and a non-\\w character — the edge of a word.',
    intuition: "\\b isn't a character or a character class — like anchors, it's a position test: \"is exactly one side of me a word character and the other side not?\"",
    prereqs: ['regex-character-classes'],
    steps: [
      { text: '`\\b` matches at any position where one adjacent character is a `\\w` character and the other adjacent character is not (or is the start/end of the string).' },
      { text: "`\\bcat\\b` matches the standalone word 'cat' in 'the cat sat', but not the 'cat' inside 'concatenate' — in 'concatenate', both characters flanking that substring are themselves word characters, so no boundary exists there." },
      { text: '`\\B` is the negation: matches wherever `\\b` does NOT.' },
    ],
    mistakes: [
      "Reaching for `\\b` expecting \"whole word\" when what's actually needed is \"this exact word, with normal English punctuation rules\" — `\\b` is purely about the `\\w`/non-`\\w` boundary, which can surprise you around apostrophes, hyphens, or non-ASCII letters.",
    ],
    demo: {
      pattern: '\\bcat\\b',
      flags: 'g',
      testString: 'the cat sat, but concatenate did not',
      note: "Only the standalone 'cat' matches — the one inside 'concatenate' has word characters on both sides.",
    },
  },

  {
    id: 'regex-flags',
    title: 'Flags',
    category: 'syntax',
    summary: 'Flags change how the whole pattern is interpreted — g, i, m, s, u, y — without changing the pattern text itself.',
    intuition: 'A flag is a mode switch for the entire match, orthogonal to the pattern — the same pattern with different flags can behave in genuinely different ways.',
    prereqs: ['regex-literals-anchors'],
    steps: [
      { text: '`g` (global) — find every match instead of stopping at the first; also makes `.exec()` resume from where the last call left off, tracked via `lastIndex`.' },
      { text: '`i` (ignore case) — "A" and "a" are treated as equivalent throughout matching.' },
      { text: '`m` (multiline) — `^` and `$` match at the start/end of each line, not just the start/end of the whole string.' },
      { text: '`s` (dotAll) — makes `.` also match newline characters, which it excludes by default.' },
      { text: '`u` (unicode) — treats the pattern as a sequence of Unicode code points rather than raw 16-bit code units; this is what enables `\\p{...}` property escapes.' },
      { text: '`y` (sticky) — like `g`, but the next match must start at exactly `lastIndex`, with no skipping ahead; used for hand-written tokenizers that need to know immediately when the input stops matching.' },
    ],
    mistakes: [
      '"m" only changes what `^` and `$` mean — every other zero-width assertion (`\\b`, lookaround) is unaffected by it.',
      "Forgetting that without `g`, `.exec()` always returns the same first match and never advances — a `while (re.exec(str))` loop without the `g` flag is an infinite loop.",
    ],
    demo: {
      pattern: '^\\d+',
      flags: 'gm',
      testString: '10 apples\n20 oranges\n5 pears',
      note: 'Remove the m flag and only the very first line\'s number still matches.',
    },
  },

  {
    id: 'regex-unicode-property-escapes',
    title: 'Unicode Property Escapes',
    category: 'advanced',
    summary: "\\p{...} matches by a character's real Unicode category (letter, number, script) instead of the ASCII-only \\w/\\d shorthands.",
    intuition: "\\w and \\d were designed around ASCII and quietly fail on accented letters, non-Latin scripts, and full-width digits — \\p{...} asks Unicode's own classification of a character directly.",
    prereqs: ['regex-character-classes', 'regex-flags'],
    steps: [
      { text: "`\\p{L}` matches any \"Letter\" in the Unicode sense — À, ñ, Я, 漢 all qualify, none of which `[A-Za-z]` or even `\\w` reliably covers." },
      { text: '`\\p{N}` matches any Unicode "Number" category character, including non-ASCII digit forms `\\d` misses.' },
      { text: '`\\p{Script=Greek}`, `\\p{Script=Han}`, etc. restrict to characters from a specific writing system.' },
      { text: 'Requires the `u` flag — without it, `\\p{...}` is not recognized as a property escape in most engines and either errors or is misread as a literal "p" followed by literal braces.', prereq: 'regex-flags' },
    ],
    mistakes: [
      'Using `\\w` and assuming it means "any letter" — it means "ASCII letter, digit, or underscore" specifically, and silently rejects legitimate names and words in most of the world\'s languages.',
    ],
    demo: {
      pattern: '\\p{L}+',
      flags: 'gu',
      testString: 'café Müller Владимир 東京',
      note: '\\w+ would fail to fully match any of these — try swapping the pattern to \\w+ and watch accented and non-Latin letters get cut apart.',
    },
  },

  {
    id: 'regex-build-tiny-engine-ast',
    title: 'Building a Tiny Regex Engine, Part 1 — Parsing to an AST',
    category: 'engine',
    summary: 'Before any matching can happen, the pattern text itself has to be parsed into a tree — literals, concatenation, alternation, and repetition as nested nodes.',
    intuition: 'A regex pattern is source code in a tiny language, exactly like arithmetic — just as `2 + 3 * 4` needs a parse tree to respect precedence, `ab|c*` needs one too.',
    prereqs: ['regex-non-capturing-groups'],
    steps: [
      { text: "The parser's job is to turn the flat string `ab|c*` into a tree that captures precedence: alternation binds loosest, so the root node is Alt, with children Concat(a,b) and Star(c) — not a flat left-to-right reading of the characters." },
      { text: 'A minimal AST needs only a handful of node types to cover the syntax already taught: Literal(char), Concat(left, right), Alt(left, right), Star(inner), Group(inner, capturing?).' },
      { text: 'Parsing this kind of grammar is normally done with recursive descent: one function per precedence level (parseAlt calls parseConcat calls parseRepeat calls parseAtom), each handling its own operators and deferring to the next-tighter level for anything it doesn\'t recognize — the same technique used to parse real programming languages.' },
    ],
    walkthrough: {
      problem: 'Parse `ab|c*` into an AST by hand.',
      steps: [
        { text: 'parseAlt must first parse a Concat (the left side of a possible |), so it calls parseConcat.' },
        { text: "parseConcat reads 'a' as a Literal, then 'b' as a Literal, combining them into Concat(Literal('a'), Literal('b')) — it stops at '|', which isn't part of a concatenation." },
        { text: "parseAlt sees the '|', consumes it, and calls parseConcat again for the right side." },
        { text: "parseConcat reads 'c', then sees '*' immediately after — a repeat operator — and wraps the literal: Star(Literal('c'))." },
        { text: 'parseAlt combines both sides: Alt(Concat(Literal(a), Literal(b)), Star(Literal(c))).' },
      ],
      answer: "Alt(Concat(Literal(a), Literal(b)), Star(Literal(c))) — 'match ab, or match zero-or-more c's', with precedence encoded structurally instead of remembered as a rule at match time.",
    },
    mistakes: [
      "Trying to match directly off the raw pattern string with ad hoc character-by-character logic instead of building a tree first — this is exactly how a hand-rolled implementation quietly gets alternation precedence wrong the first time a pattern mixes `|` with `*` or grouping.",
    ],
    demo: {
      pattern: 'ab|c*',
      flags: '',
      testString: 'ab',
      note: "This is the exact pattern traced above — try testString 'ccc' or 'zzz' to see the Alt branch in action.",
    },
  },

  {
    id: 'regex-build-tiny-engine-nfa-sim',
    title: "Building a Tiny Regex Engine, Part 2 — AST to NFA, and Simulating It",
    category: 'engine',
    summary: "Turn the AST from Part 1 into an NFA using Thompson's construction rules, then simulate it by tracking a set of active states across the input.",
    intuition: 'Each AST node type has one small, fixed NFA shape; the whole automaton is built by wiring those small pieces together, following the same tree structure the parser already produced.',
    prereqs: ['regex-build-tiny-engine-ast', 'regex-thompson-nfa'],
    steps: [
      { text: "Literal(c) compiles to two states connected by one transition that consumes exactly 'c'." },
      { text: "Concat(A, B) compiles A and B separately, then wires an epsilon transition from every one of A's accepting states to B's start state — finish A, then immediately try B, no input consumed by the join itself." },
      { text: "Alt(A, B) adds a new start state with epsilon transitions to both A's start and B's start, and a new accepting state both A's and B's accepting states epsilon-transition into — try both branches at once." },
      { text: "Star(A) adds an epsilon transition from a new start state both into A and past it entirely (the zero-repetitions case), and an epsilon transition from A's end back to A's start (the repeat-again case)." },
      { text: 'Simulation processes the input one character at a time, keeping a set of every NFA state currently reachable — including chasing every epsilon transition immediately, usually called epsilon-closure — and advances every state in that set with a matching transition for the current character, all at once, never picking just one and retrying.' },
    ],
    mistakes: [
      'Building the automaton correctly but simulating it like a single-path backtracker anyway (try one epsilon branch, retry on failure) — that throws away the entire performance guarantee this construction exists for; the whole point is tracking every reachable state as a set, simultaneously.',
    ],
    demo: {
      pattern: '(ab)+',
      flags: '',
      testString: 'ababab',
      note: "Small enough to sketch its own NFA on paper: a Concat(Literal(a),Literal(b)) wrapped in Star's repeat-back epsilon transition.",
    },
  },

  {
    id: 'regex-dfa-vs-backtracking-tradeoff',
    title: 'DFA vs. Backtracking NFA — The Real Tradeoff',
    category: 'engine',
    summary: "Why RE2 and Rust's regex crate guarantee linear time and PCRE/JavaScript don't — and why production systems still choose each, on purpose.",
    intuition: "There is no strictly 'better' engine design — only a different point on the same tradeoff curve between raw feature expressiveness and worst-case performance guarantees.",
    prereqs: ['regex-build-tiny-engine-nfa-sim', 'regex-catastrophic-backtracking'],
    steps: [
      { text: 'A backtracking engine (PCRE, JavaScript, Python `re`, Perl) supports the full feature set this reference has covered — backreferences, lookaround — because it can commit to a path and retry; that flexibility is exactly what also makes catastrophic backtracking possible.', prereq: 'regex-capture-groups-backreferences' },
      { text: "A Thompson-NFA-simulation engine (RE2, Rust's `regex` crate, Go's `regexp`) gives up backreferences and unrestricted lookaround in exchange for a hard, provable guarantee: running time is always linear in input length — exactly why these engines are standard anywhere untrusted input reaches a regex." },
      { text: 'A third option exists for small, fixed patterns: precompiling all the way to an actual DFA (one active state instead of a set) is even faster to run, at the cost of a state-count explosion during compilation for some patterns — why most "linear time" engines simulate the NFA lazily instead of precompiling a full DFA upfront.' },
    ],
    mistakes: [
      "Treating \"PCRE is slower\" as a simple engineering oversight rather than a deliberate tradeoff — PCRE's backtracking design is precisely what lets it support the richer feature set that RE2 explicitly, permanently cannot.",
    ],
    demo: {
      pattern: '(\\w)\\1',
      flags: 'g',
      testString: 'book keeper feed',
      note: 'A backreference like \\1 only exists here because JavaScript uses a backtracking engine — RE2 would reject this pattern outright.',
    },
  },

  {
    id: 'regex-common-mistakes-idioms',
    title: 'Common Mistakes and Idioms',
    category: 'practice',
    summary: 'The recurring failure patterns — the "validate an email with regex" myth, reaching for regex where a real parser belongs, and what readable regex looks like in review.',
    intuition: "Most regex problems in real codebases aren't syntax errors — they're a regex being asked to do a job it structurally can't (or shouldn't) do.",
    prereqs: ['regex-lookahead', 'regex-lookbehind', 'regex-flags'],
    steps: [
      { text: "The email-validation myth: the actual RFC 5322 grammar for a valid email address is famously enormous and includes cases (quoted local parts, comments) no realistic hand-written regex attempts — most \"email regexes\" in production are deliberately loose approximations, and that's the correct engineering call, not a bug to eventually fix." },
      { text: "Regular expressions can only recognize regular languages — patterns with no notion of \"matching depth\" or memory of how many of something came before. HTML/XML, JSON, and any language with nested structure are not regular languages; a regex can approximate simple cases but breaks on nested input by construction, not by insufficient cleverness. That's a job for a real parser.", prereq: 'regex-build-tiny-engine-ast' },
      { text: 'Readability idioms: named groups over numbered ones once a pattern has more than one or two groups; a comment above the pattern stating its intent in prose; preferring a specific character class (`[^,]+`) over a vague `.+?` when the actual boundary is known.' },
    ],
    mistakes: [
      "Reaching immediately for regex on any text problem because it's familiar, without first asking whether the input has nesting or structure a regular language can't represent — the single most common category of regex-shaped bug in real codebases.",
    ],
    demo: {
      pattern: '^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$',
      flags: '',
      testString: 'name.tag+sort@example.co.uk',
      note: 'A deliberately "good enough" email pattern — try "a@b" or an address with a quoted local part to see where the approximation gives up.',
    },
  },

  {
    id: 'regex-capstone-log-parser',
    title: 'Capstone — A Small Log Parser',
    category: 'practice',
    summary: 'Tie the reference together: use named capture groups, quantifiers, and character classes to pull structured fields out of a real log line.',
    intuition: 'A log parser is the smallest realistic version of what a lexer does: turn an unstructured line of text into named, typed fields a program can actually use.',
    prereqs: ['regex-common-mistakes-idioms', 'regex-word-boundaries'],
    steps: [
      { text: 'Design the pattern from the shape of one real log line: a timestamp, a level in brackets, then a free-text message — `2024-03-15T10:22:01 [ERROR] connection refused`.' },
      { text: 'Name each field as its own capture group so the calling code reads by name, not position: `(?<timestamp>...)`, `(?<level>...)`, `(?<message>...)`.', prereq: 'regex-capture-groups-backreferences' },
      { text: 'Anchor the whole pattern to the line\'s actual shape rather than leaving quantifiers unconstrained — `\\[(?<level>\\w+)\\]` instead of a bare `.+`, so a malformed line fails to match instead of silently capturing the wrong thing.' },
    ],
    mistakes: [
      'Building the pattern to match this one sample line perfectly, then discovering it silently fails (or worse, misparses) on the very next log line with a slightly different level name or an extra field — a parser built from one example instead of the actual grammar of the format is the most common way this capstone-shaped code breaks in production.',
    ],
    demo: {
      pattern: '^(?<timestamp>[\\d-]+T[\\d:]+) \\[(?<level>\\w+)\\] (?<message>.+)$',
      flags: '',
      testString: '2024-03-15T10:22:01 [ERROR] connection refused',
      note: 'Check the Capture Groups panel — this pattern names its groups instead of numbering them, the same idiom from Capture Groups & Backreferences.',
    },
  },
];
