// Release notes shown to returning users via WhatsNewModal. Newest entry
// first. Add a new entry here whenever a change is worth telling students
// about — not every commit, just things they'd actually notice or care about.
export const WHATS_NEW = [
  {
    id: '2026-06-30-community-and-content',
    date: '2026-06-30',
    title: "Blog, Discord, contributor mode, and a lot of new content",
    discord: 'https://discord.gg/epd2kYBDVt',
    items: [
      'We now have a community Discord — ask questions, share what you\'re building, and hang out with other learners.',
      'The Blog is live. Find it in the sidebar — write-ups on math, code, and what\'s being built here.',
      'Desktop app contributor mode: download the full repository with one click and submit lesson fixes as pull requests without touching a terminal.',
      'Geometry courses expanded — similarity, Pythagorean theorem, special right triangles, area formulas, circles, and 3D volume all have new lessons.',
      'RPG Fitness tracker upgraded with streak tracking, progressive overload hints, and a live set-by-set active session mode.',
      'A new Compass tool bridges your fitness goals across the app, so your workout data actually connects to your learning.',
      'The in-app SVG editor now has a visual drag-and-drop mode alongside the source editor, with click-to-jump-in-source.',
      'Lesson Builder improvements: the ∫≈ toolbar now inserts LaTeX snippets directly, and the contributor docs (? button) explain the full workflow.',
    ],
  },
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
