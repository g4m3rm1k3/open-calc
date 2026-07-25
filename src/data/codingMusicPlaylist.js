// Background music shown in the floating video player (FloatingVideoPlayer.jsx)
// whenever you're not inside a specific lesson — add more tracks here as
// plain entries. `isMusic: true` is how FloatingVideoPlayer tells "a
// background track" apart from a real lesson tutorial when deciding whether
// to auto-switch on navigation (see its isLessonRoute effect).
export const CODING_MUSIC_PLAYLIST = [
  {
    id: "music-1",
    title: "Journey Through Glowing Crystals – Psychedelic Trance Ritual",
    url: "https://www.youtube.com/embed/VEFswwI_oPU",
    source: "CERBERUS PSYTRANCE",
    isMusic: true,
  },
  {
    id: "music-2",
    title: "BABA YAGA – FOREST RITUAL | Full-On Psytrance Goa Mix",
    url: "https://www.youtube.com/embed/Uglxzrew6E8",
    source: "CERBERUS PSYTRANCE",
    isMusic: true,
  },
  {
    id: "music-3",
    title:
      "MEDUSA – PSYTRANCE MIX | Serpent Queen Ritual (Full-On / Progressive Goa 146–148 BPM)",
    url: "https://www.youtube.com/embed/mmm6xsh-syE",
    source: "CERBERUS PSYTRANCE",
    isMusic: true,
  },
];
