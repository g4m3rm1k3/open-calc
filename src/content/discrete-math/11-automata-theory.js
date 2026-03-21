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
    previewVisualizationId: 'GraphNetwork3D',
  },

  intuition: {
    prose: [
      'A deterministic finite automaton (DFA) has a finite set of states, a start state, transitions for each symbol, and accepting states.',
      'Reading an input string means walking edges symbol by symbol. If you end in an accepting state, the string is in the language.',
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
  },

  math: {
    prose: [
      'Automata closure properties: regular languages are closed under union, intersection, complement, and concatenation.',
      'Subset construction converts NFA to DFA by treating sets of NFA states as single DFA states.',
      'State minimization finds equivalent-state merges to produce a smallest DFA (up to isomorphism).',
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
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],
}
