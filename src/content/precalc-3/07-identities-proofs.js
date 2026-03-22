export default {
  id: 'precalc3-identities-proofs',
  slug: 'identities-proofs',
  chapter: 'precalc-3',
  order: 7,
  title: "Trigonometric Identities & Proofs",
  subtitle: "Manipulating identities to simplify expressions and prove trigonometric properties.",
  tags: ["identities","proofs","pythagorean identity","double angle","angle addition"],
  hook: {
    question: "How can we rewrite complex trigonometric expressions into simpler ones?",
    realWorldContext: 'Master each identity type step by step — the same identities appear constantly in calculus derivatives and integrals.',
  },
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['The Pythagorean identities all come from sin²θ + cos²θ = 1. Dividing through by cos²θ gives 1 + tan²θ = sec²θ. Dividing by sin²θ gives cot²θ + 1 = csc²θ. All three are the same identity dressed differently.'] },
      // TR-32 + Kim: intro to identities — same topic, two instructors
      { type: 'viz', id: 'VideoCarousel', title: 'Intro to Trig Identities & Proofs',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/8F3zdi_a-PM', title: 'TR-32 — Dennis F. Davis' },
          { url: 'https://www.youtube.com/embed/W6GbAtk08Vo', title: 'Fundamental Identities — Kim' },
        ]},
      },
      { type: 'prose', paragraphs: ['Pythagorean identities: the foundation. Every trig proof starts here.'] },
      // TR-33 + TR-33Z together (same topic: Pythagorean identities)
      { type: 'viz', id: 'VideoCarousel', title: 'Pythagorean Trig Identities',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/N-LP9O81yn4', title: 'TR-33 — Pythagorean Identities' },
          { url: 'https://www.youtube.com/embed/LNBZ0bP4SHk', title: 'TR-33Z — All 6 Functions on the Unit Circle' },
        ]},
      },
      { type: 'prose', paragraphs: ['Applying Pythagorean identities to simplify expressions and complete proofs.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-34: Using Pythagorean Identities', props: { url: 'https://www.youtube.com/embed/B3JOQxj_MGs' } },
      { type: 'prose', paragraphs: ['Even and odd symmetry: cos(−θ) = cos θ (even), sin(−θ) = −sin θ (odd). Conjugate substitutions are a key proof technique.'] },
      // TR-35 + TR-36 + TR-37 in a carousel — all about symmetry and reflection identities
      { type: 'viz', id: 'VideoCarousel', title: 'Symmetry, Conjugates & Reflections',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/db0GxUtyqjA', title: 'TR-35 — Conjugate Identities' },
          { url: 'https://www.youtube.com/embed/q5tuzPASVaY', title: 'TR-36 — Even & Odd Trig Functions' },
          { url: 'https://www.youtube.com/embed/RgusdNG5Luo', title: 'TR-37 — More Trig Reflections' },
        ]},
      },
      { type: 'prose', paragraphs: ['The angle addition formulas are the engine of all product-to-sum and double-angle identities. Memorize sin(A±B) and cos(A±B) — everything else follows.'] },
      // TR-38 + TR-39 + Kim sum/diff in a carousel
      { type: 'viz', id: 'VideoCarousel', title: 'Sum & Difference Identities',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/lw7UJRNJIzc', title: 'TR-38 — Angle Sum & Difference' },
          { url: 'https://www.youtube.com/embed/Xoen_m4KUgs', title: 'TR-39 — Using Sum/Diff Identities' },
          { url: 'https://www.youtube.com/embed/YHgjEac9nl4', title: 'Sum & Difference — Kim (5 examples)' },
        ]},
      },
      { type: 'prose', paragraphs: ['Double angle: set A = B in the addition formulas. Half angle: solve the double-angle cos formula for cos²θ or sin²θ — this gives the power-reducing forms used in integration.'] },
      // TR-40 + TR-41 + Kim double/half in a carousel
      { type: 'viz', id: 'VideoCarousel', title: 'Double & Half Angle Identities',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/DCr6yqJfYiY', title: 'TR-40 — Double Angle Identities' },
          { url: 'https://www.youtube.com/embed/Hxox4DpW4wc', title: 'TR-41 — Half Angle Identities' },
          { url: 'https://www.youtube.com/embed/4FELR35CovM', title: 'Double & Half Angle — Kim (9 examples)' },
        ]},
      },
      { type: 'prose', paragraphs: ['Verifying identities: always work on one side only. Transform it step by step into the other side using known identities.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'Verifying Trigonometric Identities (4 Examples)', props: { url: 'https://www.youtube.com/embed/dGe7_FnI3e0' } },
    ],
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.'],
  },
}
