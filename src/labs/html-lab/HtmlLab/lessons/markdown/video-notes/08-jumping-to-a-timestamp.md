# Video Notes — Lesson 08 — Jumping to a Timestamp

## What You Will Build

Every note now shows its timestamp as readable `m:ss` text, and clicking it
seeks the actual video to that exact moment and starts playing. This is the
direct payoff for building the real YouTube Player API integration in
lesson 07 instead of stopping at a plain embed.

---

## What You Need to Know First

Lesson 07 left `video.notes` as an array of `{ id, text, timestamp }`
objects, rendered as plain text in a list, with `player` holding a real
`YT.Player` instance whenever a video is selected.

---

## Step 1 — Format Seconds as Readable Time

**The problem:** `note.timestamp` is a raw number of seconds — `407` — not
the `6:47` a person actually wants to read.

Add to `script.js`:

```javascript
function formatTimestamp(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
```

**Walkthrough:** `Math.floor(totalSeconds / 60)` divides the total seconds
by 60 and rounds down, giving the whole number of minutes — `407 / 60` is
`6.78`, and `Math.floor` drops everything after the decimal point,
producing `6`. `totalSeconds % 60` is the **remainder operator**: it gives
what is left over after dividing by 60 as many whole times as possible —
`407 % 60` is `47`, the seconds left over once the full minutes are
accounted for.

`String(seconds).padStart(2, '0')` converts the number to a string, then
**pads** it with `'0'` characters at the start until it is at least 2
characters long — `String(47).padStart(2, '0')` stays `"47"` (already 2
characters), but `String(7).padStart(2, '0')` becomes `"07"`. Without this,
a timestamp of 6 minutes and 7 seconds would display as `6:7`, easy to
misread as six minutes and seventy seconds' worth of something, rather than
the standard `6:07` clock format everyone already recognises.

---

## Step 2 — Make Timestamps Clickable

**The problem:** Notes currently display as plain, inert text.

Update the note-rendering loop inside `renderNotesPanel` in `script.js`:

```javascript
for (const note of video.notes) {
  const noteItem = document.createElement('div');
  noteItem.className = 'note-item';

  const timeLabel = document.createElement('span');
  timeLabel.className = 'note-timestamp';
  timeLabel.textContent = formatTimestamp(note.timestamp);
  timeLabel.addEventListener('click', () => handleSeek(note.timestamp));

  const textLabel = document.createElement('span');
  textLabel.className = 'note-text';
  textLabel.textContent = note.text;

  noteItem.appendChild(timeLabel);
  noteItem.appendChild(textLabel);
  list.appendChild(noteItem);
}
```

Add to `script.js`:

```javascript
function handleSeek(timestamp) {
  if (!player || typeof player.seekTo !== 'function') {
    return;
  }

  player.seekTo(timestamp, true);
  player.playVideo();
}
```

Add to the CSS tab:

```css
.note-item {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
}

.note-timestamp {
  flex-shrink: 0;
  font-family: monospace;
  color: var(--colour-accent);
  cursor: pointer;
  font-weight: bold;
}

.note-timestamp:hover {
  text-decoration: underline;
}

.note-text {
  color: var(--colour-text);
}
```

Click **▶ Preview**, add a couple of notes at different points in a video,
then click one of the timestamps: the video seeks there and starts
playing.

**Walkthrough:** `player.seekTo(timestamp, true)` is a real method the
YouTube API player object provides. Its second argument, `allowSeekAhead`,
tells the player whether it may seek into a part of the video that has not
finished buffering yet — `true` is the correct choice for a "jump to any
point the user asks for" feature; `false` would silently refuse to seek
past whatever has already downloaded, which is rarely what a user actually
wants.

`player.playVideo()` runs immediately after — `seekTo` alone only moves the
playback position; it does not resume playback if the video happens to be
paused. Calling both together is what makes clicking a note feel like "take
me there and show me," rather than "move the position, but you have to
press play yourself."

`if (!player || typeof player.seekTo !== 'function') { return; }` is the
same defensive guard from lesson 07's `handleAddNote`, reused here for the
same reason: clicking a timestamp with no player ready (or one still
mid-initialization) should do nothing safely, rather than throw.

**SE lens — this feature cost almost nothing, because the real work
already happened.** Everything this lesson needed — a real player object,
capable of being commanded from this project's own code — was built in
lesson 07, for a different feature (capturing the current time). Jumping to
a timestamp and capturing one are, from the player's point of view, two
directions of the exact same capability: read the position, or set it. This
is a common shape in real software: the expensive, foundational work is
often "get access to the right capability at all," after which several
features become small additions on top of it.

---

## Connect the Pieces

```
script.js    formatTimestamp() — a small, pure display helper
             handleSeek() — the reverse operation of lesson 07's
             handleAddNote(): reading vs. setting the player's position
```

---

## What Breaks Without This

**Without `String(seconds).padStart(2, '0')`:** A note taken at 3 minutes
and 4 seconds displays as `3:4` — genuinely ambiguous at a glance, and
inconsistent with every other timestamp on the page that happens to have
two-digit seconds already.

**Without calling `player.playVideo()` after `seekTo`:** If the video
happens to be paused when a note is clicked, the playback position visibly
jumps in the player's own scrubber, but nothing actually plays — a user
would reasonably assume the click did nothing at all, since a paused frame
looks the same whether it seeked or not until they notice the scrubber has
moved.

---

## Definition of Done

- [ ] Every note shows a real `m:ss` timestamp, correctly zero-padded
- [ ] Clicking a timestamp seeks the actual video and resumes playback
- [ ] Clicking a timestamp while the player is not ready does nothing, without an error
- [ ] You can explain what `%` (the remainder operator) computes, using seconds-within-a-minute as the example
- [ ] You can explain why `seekTo` and `playVideo` are both needed, not just one
- [ ] You can explain why this feature required so little new code compared to lesson 07

---

*Next: Lesson 09 — Tags. Notes can be labelled with tags, rendered as small
pills — the first step toward organizing a library that has grown past "a
short list you can just scan."*
