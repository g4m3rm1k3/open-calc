export default {
  id: 'git-intro',
  slug: 'git-saving-states',
  chapter: 'git-1',
  order: 0,
  title: 'Saving States Before You Lose Them',
  subtitle: 'The Experiential Guide to Snapshots',
  tags: ['experiential', 'snapshots', 'states', 'recovery'],

  identity: {
    name: 'The Safety Net',
    symbol: '🛡️',
    description: 'Git is primarily a system for ensuring you never lose a productive state of your project. It treats your work as a sequence of immutable snapshots.',
  },

  semantics: {
    core: [
      { symbol: 'Workspace', meaning: 'The "Present". Where you edit files. High risk, zero safety.' },
      { symbol: 'Snapshot', meaning: 'The "Past". A frozen state of your project that can be restored at any time.' },
      { symbol: 'Timeline', meaning: 'The chain of snapshots that acts as your time machine.' },
    ],
  },

  hook: {
    question: 'How do you get back what you just accidentally deleted?',
    realWorldContext:
      'In a normal folder, a "Save" is an overwrite. Once you save a mistake, the working version is gone forever. ' +
      'Git changes the rules. It allows you to "Snapshot" your success so that no failure is permanent.',
    previewVisualizationId: 'GitLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'GitLab',
        props: {
          scenario: 'corruptable',
          initialFiles: { 
            'story.txt': 'Once upon a time, in a codebase far away...' 
          },
          mission: 'PHASE 1: TYPE YOUR STORY. Click "story.txt" in the sidebar and add a few lines. But be careful—without a snapshot, a single mistake could be fatal.',
        },
        title: 'The Unsafe Workspace',
        caption: 'Type freely. When you feel ready, click "Simulate Accident" above to see what happens when you have no safety net.'
      }
    ],
    prose: [
      '### The Feeling of Loss',
      'Did you lose your work? In the lab above, clicking "Simulate Accident" represents the reality of software development: Crashes, accidental deletes, or bad ideas that break everything.',
      
      'Without Git, your folder simply becomes the "Broken State". There is no button to go back to the version that worked 5 minutes ago.',

      '### The Git Solution: Snapshots',
      'Git solves this by allowing you to take **Atomic Snapshots**. A snapshot is a complete, immutable photo of your entire project at a specific moment in time.',

      '**Rules of the Snapshot**:',
      '1. **Immutable**: Once a snapshot is taken, it can never be changed. It is a permanent record.',
      '2. **Complete**: It isn\'t a list of "changes"; it is the entire state of your project.',
      '3. **Restorable**: You can "teleport" your workspace back to any snapshot instantly.',
    ],
  },

  math: {
    title: 'The Snapshot Limit',
    prose: [
      'While Git can handle millions of snapshots, in this lab you are limited to **4 active snapshots**. ' +
      'This forces you to make a critical engineering decision: **When is a state "Success" enough to be frozen in history?**',
    ],
  },

  rigor: {
    prose: [
      '**History as a DAG**: In technical terms, Git stores your history as a Directed Acyclic Graph (DAG). ' +
      'Each snapshot points back to the one that came before it, creating a logical "Line of Success". ' +
      'When you restore a snapshot, you aren\'t "undoing"—you are moving the system\'s HEAD back to a known-good coordinate.',
    ],
  },

  examples: [
    {
      id: 'ex-git-recovery',
      title: 'The Great Recovery',
      problem: 'You have two snapshots: [A] (Working) and [B] (Broke everything). How do you recover?',
      code: '// 1. View Timeline\n// 2. Click Snapshot [A]\n// 3. Workspace is instantly replaced by [A]\'s contents.',
      steps: [
        { expression: 'Workspace = Snapshot [B]', annotation: 'The current broken state.' },
        { expression: 'Checkout [A]', annotation: 'Teleporting back.' },
        { expression: 'Workspace = Snapshot [A]', annotation: 'Restored to success.' },
      ],
      conclusion: 'Git is your project\'s insurance policy.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'git-intro-q1',
        type: 'choice',
        text: 'What is the primary risk of working in a "Workspace" without Git?',
        options: [
          'The computer will run slower',
          'A mistake can permanently overwrite your only copy of the work',
          'The files will become too large to open',
          'You won\'t be able to name your files'
        ],
        answer: 'A mistake can permanently overwrite your only copy of the work',
      },
      {
        id: 'git-intro-q2',
        type: 'choice',
        text: 'When you restore a snapshot in Git, what happens to your current workspace?',
        options: [
          'It is deleted forever',
          'It is physically replaced by the files from that snapshot',
          'It is merged with the snapshot automatically',
          'Nothing happens until you restart the computer'
        ],
        answer: 'It is physically replaced by the files from that snapshot',
      },
    ]
  },

  mentalModel: [
    'Workspace = Unsafe / Temporary',
    'Snapshot = Safe / Permanent',
    'Timeline = Your recovery route',
    'Success = Knowing when to freeze a state',
  ],
}
