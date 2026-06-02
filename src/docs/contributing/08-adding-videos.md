# Adding Videos

Videos appear automatically on matching lessons based on tags. There is no mapping file — just add a video with the right tags and it shows up where it should.

---

## How to add a video

Open `reports/video-library-seed.json` and append an entry to the JSON array:

```json
{
  "id": "vid-600",
  "title": "Your Video Title",
  "url": "https://www.youtube.com/embed/VIDEO_ID_HERE",
  "source": "channel-name",
  "tags": ["python", "loops", "for"]
}
```

That is all. The video will appear on any lesson whose tags overlap with the video's tags.

---

## Getting the embed URL

YouTube watch URLs look like:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

Change `watch?v=` to `embed/`:
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```

Strip everything after the video ID (list parameters, timestamps, etc.).

---

## Choosing the right tags

Tags are how the system matches videos to lessons. Use the same vocabulary that lessons use.

**Python lessons:**

| Topic | Tags to use |
|-------|------------|
| Variables and types | `python`, `variables`, `int`, `float`, `str` |
| Control flow | `python`, `if`, `conditionals` |
| Loops | `python`, `for`, `while`, `loops` |
| Functions | `python`, `functions`, `def` |
| Lists / data structures | `python`, `lists`, `dict`, `tuples`, `sets` |
| OOP | `python`, `oop`, `classes`, `objects` |
| File I/O | `python`, `files`, `io` |
| Error handling | `python`, `exceptions`, `try`, `except` |
| Generators / iterators | `python`, `generators`, `iterators` |

**Calculus:**

| Topic | Tags to use |
|-------|------------|
| Limits | `limits`, `calculus` |
| Derivatives | `derivatives`, `differentiation` |
| Chain rule | `chain rule`, `derivatives` |
| Integration | `integrals`, `integration` |
| Series | `series`, `convergence` |

**Linear algebra:**

| Topic | Tags to use |
|-------|------------|
| Vectors | `vectors`, `linear algebra` |
| Matrices | `matrices`, `matrix operations` |
| Eigenvalues | `eigenvalues`, `eigenvectors` |

Always include the subject name (`python`, `calculus`, `linear algebra`, `chemistry`, etc.) as the first tag. The system uses the course name to boost subject-specific videos.

---

## Finding the next available ID

The seed file is at `reports/video-library-seed.json`. The last entry has the highest ID. Look at the last entry and increment by 1.

As of the last update the IDs run to `vid-593`. The next available ID is `vid-594`.

---

## Submitting videos you cannot add yourself

If you do not have access to edit the JSON file, open a [GitHub Issue](https://github.com/g4m3rm1k3/open-calc/issues/new) with:

- **Title:** `[Video] Your playlist or channel name`
- **Body:** Paste the JSON entries you want added (use the format above)

For a whole playlist, paste the YouTube playlist URL and the tags that should apply to all videos in it.
