export default {
  title: 'Spaced Repetition',
  icon: '🧩',
  source: 'Make It Stick — Peter C. Brown, Henry L. Roediger III & Mark A. McDaniel',
  sections: [
    {
      heading: 'The Forgetting Curve & Why Spacing Wins',
      prose: [
        'In 1885, Hermann Ebbinghaus discovered that memory decays **exponentially** — you lose ~50% of new information within a day if you don\'t review it. But each time you actively retrieve something *right before* you\'d forget it, the memory gets significantly stronger and the decay curve flattens.',
        'This is why cramming fails long-term. You can pass tomorrow\'s exam, but two weeks later it\'s gone. **Spaced repetition** schedules reviews at increasing intervals — 1 day, 3 days, 7 days, 14 days, 30 days — so you spend the minimum time for maximum retention. Tools like Anki automate this scheduling for you.',
      ]
    },
    {
      heading: 'Active Recall vs Passive Review',
      prose: [
        'Re-reading notes and highlighting text *feels* productive but barely moves the needle. What actually builds durable memory is **active recall**: forcing your brain to retrieve the answer *before* seeing it. Flashcards, practice problems, and teaching someone else all leverage this principle.',
        'The harder the retrieval feels, the stronger the learning — this is called **desirable difficulty**. If a flashcard feels too easy, your brain isn\'t working hard enough to strengthen the connection. If you get it wrong, that\'s actually *good* — the error followed by the correction produces a stronger memory trace than getting it right effortlessly.',
      ]
    },
    {
      heading: 'Practical Tips for Getting Started',
      prose: [
        'Start with a free tool like **Anki** or **RemNote**. Write cards with one clear question and one clear answer — avoid "tell me everything about X" cards. Front: "What does the O in Big-O measure?" Back: "The upper bound of an algorithm\'s growth rate as input size increases."',
        'Review daily, even if it\'s just 10 minutes. The system only works if you **trust it and show up**. Don\'t cram 200 new cards in one day — add 10–20 new cards and let the algorithm build your review queue naturally over time.',
      ]
    },
  ]
}
