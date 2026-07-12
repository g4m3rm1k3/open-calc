// Client-side profanity check for the public Suggestion Box. This is a
// deterrent, not a security boundary — anyone can bypass client JS, so
// Firestore rules still cap length/shape, and moderators can delete via
// the console.
const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy',
  'cock', 'whore', 'slut', 'fag', 'faggot', 'retard', 'retarded',
  'nigger', 'nigga', 'spic', 'chink', 'kike', 'gook', 'tranny',
  'motherfucker', 'twat', 'wanker', 'douchebag', 'jackass',
]

// Common leetspeak substitutions so "sh1t" / "a$$hole" still get caught.
const LEET_MAP = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' }

function normalize(text) {
  return String(text)
    .toLowerCase()
    .split('')
    .map(ch => LEET_MAP[ch] ?? ch)
    .join('')
    .replace(/[^a-z\s]/g, ' ')
}

const BLOCKED_PATTERNS = BLOCKED_WORDS.map(w => new RegExp(`\\b${w}\\b`, 'i'))

export function containsProfanity(text) {
  if (!text) return false
  const normalized = normalize(text)
  return BLOCKED_PATTERNS.some(re => re.test(normalized))
}
