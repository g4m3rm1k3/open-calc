// Release notes shown to returning users via WhatsNewModal. Newest entry
// first. Add a new entry here whenever a change is worth telling students
// about — not every commit, just things they'd actually notice or care about.
export const WHATS_NEW = [
  {
    id: '2026-06-19-mobile-and-tutor',
    date: '2026-06-19',
    title: "Mobile actually works now, and the AI tutor is faster to start",
    items: [
      'A real mobile home screen — course list and "continue learning" instead of the desktop background graphic.',
      'The AI tutor\'s free in-browser model now downloads quietly in the background, instead of making you wait when you first open it.',
      'Crashes anywhere in the app now show a clean error screen instead of a blank page, with a one-click way to report it.',
      'Lessons can now be submitted as real GitHub pull requests straight from the in-app Lesson Builder — no local setup required.',
    ],
  },
]

export function getLatestWhatsNewId() {
  return WHATS_NEW[0]?.id ?? null
}
