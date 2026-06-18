export default {
  id: 'discrete-1-11',
  slug: 'automata-theory',
  chapter: 'discrete-1',
  order: 13,
  title: 'Automata Theory',
  subtitle: 'Finite-state models of computation and regular language recognition',
  tags: ['automata', 'dfa', 'nfa', 'regular languages', 'state machine'],
  aliases: 'finite automata dfa nfa regex state transition minimization',

  hook: {
    question:
      'What is the smallest mathematical model that can still recognize meaningful patterns in strings?',
    realWorldContext:
      'Lexers, protocol validators, UI flow logic, and embedded controllers are naturally modeled as finite automata. This is the first formal model of computation many engineers can implement directly.',
    previewVisualizationId: 'DFAChallengeGame',
  },

  intuition: {
    prose: [
      'A deterministic finite automaton (DFA) has a finite set of states, a start state, transitions for each symbol, and accepting states.',
      'Reading an input string means walking edges symbol by symbol. If you end in an accepting state, the string is in the language.',
      'Concrete lens: treat each state as a memory snapshot. The automaton stores only a tiny summary of everything seen so far.',
      'Nondeterministic automata (NFA) allow multiple possible next states; they are easier to design, and equivalent in expressive power to DFAs.',
      'Regular expressions and finite automata are two views of the same concept: regular languages.',
      'Automata are graph-theoretic objects with logic on transitions and set-theoretic operations on languages.',
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
  },

  rigor: {
    prose: [
      'When proving language recognition, use invariant reasoning: after reading prefix w, automaton state encodes a precise property of w.',
      'For conversion proofs, define the semantic meaning of each constructed state and prove transition preservation symbol-by-symbol.',
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
        lessonId: 'discrete-1-10-boolean-algebra-and-circuits',
        label: 'Boolean Algebra',
        note: 'State transitions are the high-level logic that hardware circuits implement.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-12-formal-languages-and-grammars',
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
  ],
}
