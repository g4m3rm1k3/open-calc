import dfaEvenOnesUrl from '../diagrams/dm-dfa-even-ones.svg?url'

export default {
  id: 'discrete-1-11',
  slug: 'automata-theory',
  chapter: 'discrete-6',
  order: 1,
  title: 'Automata Theory',
  subtitle: 'Finite-state models of computation and regular language recognition',
  tags: ['automata', 'dfa', 'nfa', 'regular languages', 'state machine'],
  aliases: 'finite automata dfa nfa regex state transition minimization',

  hook: {
    question:
      'What is the smallest mathematical model that can still recognize meaningful patterns in strings?',
    realWorldContext:
      'Lexers, protocol validators, UI flow logic, and embedded controllers are naturally modeled as finite automata. This is the first formal model of computation many engineers can implement directly.',
  },

  intuition: {
    prose: [
'A deterministic finite automaton (DFA) has a finite set of states, a start state, one transition per symbol from every state, and a set of accepting states.',
      'Reading an input string means walking edges symbol by symbol, starting from the start state. If you end on an accepting state once the string is exhausted, the string belongs to the automaton\'s language; otherwise it doesn\'t.',

      `![DFA accepting binary strings with an even number of 1s — two states, one toggling on input 1](${dfaEvenOnesUrl})`,

      'The diagram shows the simplest nontrivial DFA: two states, E (even count of 1s seen so far) and O (odd count), with E as both the start state and the only accepting state. Reading a 0 never changes the parity, so both states loop on 0; reading a 1 always flips the parity, so 1 toggles E↔O. Trace "1011": start at E, read 1 → O, read 0 → O, read 1 → E, read 1 → O — ends on O, rejected, correctly, since "1011" has three 1s (odd).',

      'Concrete lens: treat each state as a memory snapshot. The automaton stores only a tiny, fixed summary of everything seen so far — in this example, literally one bit of memory (the current parity) is enough, no matter how long the input string gets.',
      'Nondeterministic automata (NFA) allow multiple possible next states; they are easier to design, and equivalent in expressive power to DFAs.',
      'Regular expressions and finite automata are two views of the same concept: regular languages.',
      'Automata are graph-theoretic objects with logic on transitions and set-theoretic operations on languages.',
    ],
    checks: [
      {
        afterParagraph: 3,
        question: 'For the even-number-of-1s DFA, tracing "110" starting at state E gives which final state?',
        options: ['E (accept)', 'O (reject)', 'Neither — the DFA gets stuck', 'It depends on the order of transitions'],
        answer: 'E (accept)',
        explanation: 'E→(1)→O→(1)→E→(0)→E. Two 1s is an even count, so the string ends back at E, the accepting state.',
      },
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'DFA-NFA Equivalence',
        body: 'Every NFA has an equivalent DFA recognizing the same language.',
      },
      {
        type: 'theorem',
        title: 'Regular Expression Equivalence',
        body: 'A language is regular iff it is recognized by a finite automaton iff it is denoted by a regular expression.',
      },
    ],
    visualizations: [
      {
        id: 'DFAChallengeGame',
        title: 'DFA String Challenge',
        caption: 'Enter strings, watch transitions, and predict accept/reject before revealing the trace.',
      },
    ],
  },

  math: {
    prose: [
      'Automata closure properties: regular languages are closed under union, intersection, complement, and concatenation.',
      'Subset construction converts NFA to DFA by treating sets of NFA states as single DFA states.',
      'State minimization finds equivalent-state merges to produce a smallest DFA (up to isomorphism).',
      'Product construction is the workhorse for intersection proofs: states become ordered pairs encoding simultaneous progress in two machines.',
    ],
    checks: [
      {
        afterParagraph: 1,
        question: 'Subset construction converts an NFA to a DFA by:',
        options: [
          'Deleting all nondeterministic transitions',
          'Treating each SET of possible NFA states as a single DFA state',
          'Running the NFA twice',
          'Adding more accepting states',
        ],
        answer: 'Treating each SET of possible NFA states as a single DFA state',
        explanation: 'Since an NFA can be in multiple states at once, the equivalent DFA tracks the entire SET of currently-possible NFA states as one combined state — collapsing nondeterminism into determinism.',
      },
    ],
  },

  rigor: {
    prose: [
      'When proving language recognition, use invariant reasoning: after reading prefix w, automaton state encodes a precise property of w.',
      'For conversion proofs, define the semantic meaning of each constructed state and prove transition preservation symbol-by-symbol.',
    ],
    checks: [
      {
        question: 'To prove a DFA correctly recognizes a language, what does "invariant reasoning" require you to state?',
        options: [
          'That the DFA has an even number of states',
          'A precise property that the current state encodes about the prefix read so far',
          'The total number of accepting states',
          'That the DFA runs in constant time',
        ],
        answer: 'A precise property that the current state encodes about the prefix read so far',
        explanation: 'For the even-1s DFA, the invariant is: "state E means the prefix read so far has an even number of 1s." Proving this invariant is preserved by every transition is what makes the correctness argument rigorous.',
      },
    ],
  },

  examples: [
    {
      id: 'discrete-1-11-ex1',
      title: 'Even Number of 1s Language',
      problem: 'Construct DFA over {0,1} that accepts strings with an even number of 1s.',
      steps: [
        { expression: 'Use states E and O', annotation: 'E for even count so far, O for odd.' },
        { expression: 'On input 1, toggle E<->O; on input 0, stay', annotation: 'Only symbol 1 changes parity.' },
        { expression: 'Start at E and accept E', annotation: 'Empty string has zero 1s (even).' },
      ],
      conclusion: 'Two states are sufficient and minimal for parity tracking.',
    },
    {
      id: 'discrete-1-11-ex2',
      title: 'NFA Convenience',
      problem: 'Why might an NFA be easier than a DFA for language containing substring 101?',
      steps: [
        { expression: 'NFA can guess where matching starts', annotation: 'Branching behavior is natural.' },
        { expression: 'DFA must encode all progress deterministically', annotation: 'Equivalent but often less intuitive to design directly.' },
      ],
      conclusion: 'NFA design is often simpler; DFA is often used for implementation efficiency.',
    },
    {
      id: 'discrete-1-11-ex3',
      title: 'State Invariant for Even 1s',
      problem: 'Give a formal invariant for a two-state DFA that accepts binary strings with even number of 1s.',
      steps: [
        { expression: 'Invariant for state E: processed prefix has even count of 1s', annotation: 'Semantic meaning of E.' },
        { expression: 'Invariant for state O: processed prefix has odd count of 1s', annotation: 'Semantic meaning of O.' },
        { expression: 'Symbol 0 preserves parity; symbol 1 toggles parity', annotation: 'Transition-level preservation proof.' },
      ],
      conclusion: 'With invariant preserved and E accepting, correctness is immediate.',
    },
    {
      id: 'discrete-1-11-ex4',
      title: 'Regex to Automaton Intuition',
      problem: 'Interpret the language of regex (ab)* as an automaton behavior.',
      steps: [
        { expression: '(ab)* means zero or more repetitions of exact block ab', annotation: 'Language interpretation first.' },
        { expression: 'Machine alternates expectation: start->expect a->expect b->start', annotation: 'State encodes what symbol must come next.' },
        { expression: 'Any mismatch transitions to dead state', annotation: 'Reject invalid partial patterns.' },
      ],
      conclusion: 'State-machine design becomes natural when states encode "what must happen next."',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-11-ch1',
      difficulty: 'easy',
      problem: 'Build a DFA for strings over {a,b} ending in ab.',
      walkthrough: [
        { expression: 'Track suffix progress: none, seen a, seen ab', annotation: 'State meaning should encode progress toward target ending.' },
        { expression: 'Accept only seen ab state', annotation: 'Acceptance condition matches ending constraint.' },
      ],
      answer: 'Use three progress states tracking suffix match; accept only final matched state.',
    },
    {
      id: 'discrete-1-11-ch2',
      difficulty: 'medium',
      problem: 'Give an NFA for language of strings containing 00 as a substring.',
      walkthrough: [
        { expression: 'q0 loops on 0/1 and may jump to q1 on 0', annotation: 'Nondeterministically guess start of substring.' },
        { expression: 'q1 on 0 goes to accepting q2', annotation: 'Second zero confirms target substring.' },
        { expression: 'q2 loops on 0/1', annotation: 'Once found, remain accepting.' },
      ],
      answer: 'States q0(start), q1(seen one 0), q2(accept seen 00); nondeterministically track candidate 00 start.',
    },
    {
      id: 'discrete-1-11-ch3',
      difficulty: 'hard',
      problem: 'Design a DFA over {0,1} that accepts strings ending with 101, and justify why your state set is sufficient.',
      walkthrough: [
        { expression: 'Track longest suffix of input that is also prefix of 101', annotation: 'KMP-style automaton idea.' },
        { expression: 'States represent suffix progress: none, 1, 10, 101', annotation: 'Four progress states capture all needed memory.' },
        { expression: 'Accept state is 101 progress state', annotation: 'Exactly the desired ending condition.' },
      ],
      answer: 'Use four suffix-progress states with deterministic transitions by next symbol.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'graph-theory', label: 'Graph Theory', context: 'Automata are directed labeled graphs with acceptance semantics.' },
    { lessonSlug: 'boolean-algebra-and-circuits', label: 'Boolean Algebra and Circuits', context: 'Transition conditions are often Boolean predicates.' },
    { lessonSlug: 'formal-languages-and-grammars', label: 'Formal Languages and Grammars', context: 'Automata are one core language-recognition model.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
  semantics: {
    core: [
      { symbol: 'Σ', meaning: 'Alphabet — a finite set of input symbols' },
      { symbol: 'Q', meaning: 'States — the set of all possible configurations' },
      { symbol: 'δ', meaning: 'Transition Function — the rule for moving between states' },
      { symbol: 'q₀', meaning: 'Start State' },
      { symbol: 'F', meaning: 'Final (Accepting) States' },
      { symbol: 'L(M)', meaning: 'Language of machine M — the set of all strings it accepts' },
    ],
    rulesOfThumb: [
      'DFA: Exactly one transition for every symbol from every state.',
      'NFA: Can have zero, one, or many transitions (and ε-moves).',
      'Pumping Lemma: A tool used to prove that a language is NOT regular.',
      'Regular Languages are those recognized by a DFA.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-10',
        label: 'Boolean Algebra',
        note: 'State transitions are the high-level logic that hardware circuits implement.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-12',
        label: 'Formal Languages and Grammars',
        note: 'Automata are the "Recognizers" for the languages generated by Formal Grammars.',
      },
    ],
  },

  mentalModel: [
    'An automaton is a "Machine that Remembers".',
    'States are "Memory Snapshots"; transitions are "Event Reactions".',
    'DFAs are like simple "If-Then" control loops with no external storage.',
    'Regular expressions are the "Code" for Finite Automata.',
  ],

  assessment: {
    questions: [
      {
        id: 'aut-assess-1',
        type: 'choice',
        text: 'What is the primary difference between DFA and NFA?',
        options: ['DFAs are faster', 'NFAs can be in multiple states simultaneously (nondeterminism)', 'DFAs recognize more languages', 'NFAs do not have final states'],
        answer: 'NFAs can be in multiple states simultaneously (nondeterminism)',
        hint: 'Nondeterminism allows multiple possible paths for the same input or epsilon moves.',
      },
      {
        id: 'aut-assess-2',
        type: 'input',
        text: 'How many transitions must every state in a DFA have if the alphabet Σ = {0, 1}?',
        answer: '2',
        hint: 'A DFA must have exactly one transition for each symbol in the alphabet.',
      },
    ],
  },

  quiz: [
    {
      id: 'aut-q1',
      type: 'choice',
      text: 'Which of the following is NOT true about NFAs and DFAs?',
      options: ['Every DFA is an NFA', 'DFAs and NFAs recognize the same class of languages', 'NFAs are easier to design for complex patterns', 'NFAs can recognize languages that DFAs cannot'],
      answer: 'NFAs can recognize languages that DFAs cannot',
      hints: ['They are equivalent in power for Regular Languages.'],
    },
    {
      id: 'aut-q2',
      type: 'choice',
      text: 'What do we use to prove that a language like {0ⁿ1ⁿ} is NOT regular?',
      options: ['Mathematical Induction', 'The Pumping Lemma', 'De Morgan\'s Law', 'The Handshaking Lemma'],
      answer: 'The Pumping Lemma',
      hints: ['The Pumping Lemma for Regular Languages detects the lack of finite memory.'],
    },
    {
      id: 'aut-q3',
      type: 'choice',
      text: 'A DFA has exactly one accepting state, E, which is also the start state. Reading the empty string ends at E. Is the empty string accepted?',
      options: ['Yes — you\'re still at the start/accepting state', 'No — you must read at least one symbol', 'It depends on the alphabet', 'DFAs cannot process the empty string'],
      answer: 'Yes — you\'re still at the start/accepting state',
      hints: ['Acceptance only depends on which state you\'re in after reading the string — reading zero symbols still counts as "ending" at the start state.'],
    },
    {
      id: 'aut-q4',
      type: 'choice',
      text: 'What does subset construction produce when converting an NFA with n states to a DFA?',
      options: [
        'A DFA with exactly n states',
        'A DFA with up to 2ⁿ states, one per possible SET of NFA states',
        'A DFA with n² states',
        'A DFA with n/2 states',
      ],
      answer: 'A DFA with up to 2ⁿ states, one per possible SET of NFA states',
      hints: ['Each DFA state corresponds to one subset of the NFA\'s state set — hence up to 2ⁿ possible DFA states, though in practice many are unreachable.'],
    },
    {
      id: 'aut-q5',
      type: 'choice',
      text: 'Which construction technique builds a DFA that recognizes the INTERSECTION of two regular languages?',
      options: ['Subset construction', 'Product construction', 'State minimization', 'The Pumping Lemma'],
      answer: 'Product construction',
      hints: ['Product construction pairs up states from both machines, tracking simultaneous progress — a state is accepting only if both component states are accepting.'],
    },
    {
      id: 'aut-q6',
      type: 'input',
      text: 'For the even-number-of-1s DFA (states E, O; E accepting and start), what state does the string "111" end on?',
      answer: 'O',
      hints: ['Three 1s toggles parity three times: E→O→E→O. Odd count of 1s ends at O (rejected).'],
    },
  ],
}
