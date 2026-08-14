# Concept: Rebuilding Derived UI While Preserving Still-Valid Selections

**What you'll understand by the end:** the real technique for
regenerating a dynamic set of UI rows from scratch whenever their real
shape needs to change, while explicitly carrying forward whatever
prior selections are still genuinely valid — captured before clearing,
restored only if still valid, after rebuilding.

**Prerequisites:** `python-dict-setdefault.md`.

## Setup

None — plain Python, no packages.

## The Problem

A real, dynamic set of UI rows — one per machine channel, say — needs
to be rebuilt whenever something affecting its real shape changes (a
different machine is picked, changing the real channel count; a
document elsewhere gets closed, changing which real options exist).
Simply destroying and recreating every row from nothing would silently
discard a user's real, already-made choices, even the ones that are
still perfectly valid after the change.

## The Isolated Example

```python
class ChannelRow:
    def __init__(self, channel, assigned_path=None):
        self.channel = channel
        self.assigned_path = assigned_path

    def __repr__(self):
        return f"ChannelRow({self.channel}, {self.assigned_path!r})"


class Panel:
    def __init__(self):
        self.rows = []

    def rebuild_channels(self, channel_count, open_documents):
        prior_picks = {row.channel: row.assigned_path for row in self.rows}

        self.rows = []
        for channel in range(1, channel_count + 1):
            prior = prior_picks.get(channel)
            restored = prior if prior in open_documents else None
            self.rows.append(ChannelRow(channel, restored))


panel = Panel()
panel.rebuild_channels(2, open_documents=["a.txt", "b.txt"])
panel.rows[0].assigned_path = "a.txt"
panel.rows[1].assigned_path = "b.txt"
print("before rebuild:", panel.rows)

panel.rebuild_channels(2, open_documents=["a.txt"])
print("after rebuild, b.txt closed:", panel.rows)

panel.rebuild_channels(3, open_documents=["a.txt", "c.txt"])
print("after rebuild, 3rd channel added, c.txt now open:", panel.rows)
```

**Real output, run this session:**
```
before rebuild: [ChannelRow(1, 'a.txt'), ChannelRow(2, 'b.txt')]
after rebuild, b.txt closed: [ChannelRow(1, 'a.txt'), ChannelRow(2, None)]
after rebuild, 3rd channel added, c.txt now open: [ChannelRow(1, 'a.txt'), ChannelRow(2, None), ChannelRow(3, None)]
```

**What this proves:** channel `1`'s real pick (`"a.txt"`) survived
**two** separate real rebuilds unchanged, because it stayed valid the
whole time. Channel `2`'s pick (`"b.txt"`) was correctly **dropped**
the moment `"b.txt"` was no longer among the real open documents —
restored to `None` rather than silently kept pointing at something no
longer real and valid. The real, new third channel appeared with no
prior pick to restore at all, exactly as expected for a row that never
existed before.

## Mechanical Walkthrough

- **Capture** happens *before* anything is cleared — `prior_picks` is
  built from the real, current rows while they still exist, mapping
  each channel to whatever it currently holds.
- **Clear and rebuild** happens next — every real row is thrown away
  and rebuilt fresh, based purely on the new, real shape (`channel_
  count`), with no assumption that the old rows still apply.
- **Restore, conditionally** happens last, per new row — a prior pick
  is only carried forward if it's still genuinely present in the
  current, real `open_documents` list; anything no longer valid is
  correctly left as `None` rather than silently kept.
- The real, deliberate ordering — capture, then clear, then
  conditionally restore — is what makes this correct: capturing *after*
  clearing would have nothing left to capture; restoring *unconditionally*
  would carry forward stale, no-longer-valid picks right alongside the
  genuinely valid ones.

## CS Lens

This is a real, concrete instance of **reconciliation** — computing a
new, correct real state from scratch while still incorporating
whatever parts of the old state remain valid, rather than either
naively discarding everything or naively keeping everything. The same
underlying idea drives React's own reconciliation algorithm
(`react-key-prop-reconciliation.md`'s own real subject) — comparing a
freshly-computed real UI tree against the previous one and preserving
what's still valid, though React automates that comparison; this
file's own technique performs the identical real idea by hand, in
plain code.

Also recognized in: a real form auto-save feature that rebuilds its
own field list from a changed schema while preserving already-typed
values for fields that still exist; a spreadsheet recalculating
derived cells while preserving manually-overridden ones that remain
valid.

## SE Lens

The real, practical payoff: a user picking values across several
channels never loses their already-made, still-valid choices just
because something unrelated changed elsewhere in the app (a different
document being saved or closed) — the rebuild is triggered far more
often than the user's own picks actually become invalid, so
unconditionally discarding everything on every rebuild would be a
real, constant, frustrating source of lost work. The real cost is a
small amount of extra bookkeeping (capturing prior state, checking
validity) — cheap compared to the real user-experience cost of getting
it wrong.

## Connection

Builds on `python-dict-setdefault.md`'s own dict-building style (a
plain dict comprehension here serves the identical "map old state for
lookup" role). Directly relevant to any real, dynamic UI regenerated
in response to external changes it doesn't fully control — this
project's own real `JobPanel` rebuilds its channel rows exactly this
way, since `set_open_documents()` fires on every save/open/close
anywhere in the app, not just ones relevant to any one specific job.
A real, simpler sibling instance from later in this project's own
history, worth distinguishing rather than conflating: a live playback
position and its on-screen marker, invalidated **unconditionally** the
moment its source program is edited (the timer stops, the position
resets, the marker is removed), with no attempt to preserve any part
of it — this file's own technique selectively restores whatever's
*still valid*; that later case has nothing worth selectively
preserving at all, since an edit can change the very segment sequence
playback was stepping through, making the old position meaningless
rather than merely one option among several still-valid ones.

## Try It Yourself

1. Add a real, second kind of per-row state (say, a `role` field) and
   confirm the identical capture/clear/restore pattern generalizes to
   preserving it too, alongside `assigned_path`.
2. Construct a case where the *set of channels itself* shrinks (moving
   from a 3-channel to a 2-channel machine) and confirm the rebuild
   correctly drops the now-nonexistent third row entirely, with no
   error from trying to "restore" something that no longer has a slot.
3. Rewrite `rebuild_channels` to skip the capture step entirely
   (always rebuild from nothing) and manually verify how many real,
   valid user picks get silently lost across the same three calls in
   this file's own isolated example — a concrete, felt sense of the
   real cost this technique avoids.
