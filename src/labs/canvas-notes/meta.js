export default {
  label: "Canvas Notes",
  emoji: "🗒️",
  color: "amber",
  kind: "builder",
  subject: "Creative",
  desc: "A free-form, OneNote-style notebook — drag text boxes and pasted images anywhere on the page, draw with pen and highlighter tools, and organize pages into sections with two levels of tabs.",
  path: "/lab/canvas-notes",
  tags: ["Notes", "Canvas", "Drawing", "Creative", "Productivity"],
  cover: {
    grad: "from-amber-600 via-orange-700 to-rose-950",
    mark: "🗒️",
    sub: "Sections · Pages · Draw"
  },
  order: 41,
  // A drawing/notebook page benefits from real screen space far more than
  // this app's default 960×640 floating window gives it — requested here,
  // forwarded by EntryShell, and clamped against the actual screen by
  // FloatingWindow so it never opens partly off-screen on a small monitor.
  width: 1280,
  height: 860,
}
