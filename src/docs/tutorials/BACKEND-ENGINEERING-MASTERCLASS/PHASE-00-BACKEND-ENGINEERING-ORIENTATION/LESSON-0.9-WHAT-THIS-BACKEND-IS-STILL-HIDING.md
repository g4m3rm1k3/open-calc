# Lesson 0.9: What This Backend Is Still Hiding

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Not a new tool - a real, cited inventory of four specific places in this exact application where the habits built in this phase (verify, trace real callers, read real control flow, reproduce before touching) already surface a real, located question neither this lesson nor this phase answers. The transferable problem: locating a real problem precisely, with real evidence, is a genuinely different and prerequisite skill from explaining why it matters or fixing it - conflating the two is how a phase meant to build a habit turns into an attempt to teach everything at once.

**What you need to know first:** Finding real callers of a name across a whole codebase mechanically; reading a decorator's real control flow instead of trusting its name or docstring; reproducing real behavior instead of predicting it.

## Terms used in this lesson

- **Scope** — A deliberate boundary on what one piece of work will and won't attempt to settle. It exists because naming a real problem precisely and explaining or fixing it are genuinely different amounts of work - a habit-building phase can locate four real, serious things without owing a full treatment of any of them yet, as long as that boundary is stated honestly rather than implied away.

## Objects and methods used

None — this lesson introduces no new external class, interface, or method, only Terms.
## Concept Unit: Four Real, Located Questions This Phase Doesn't Answer

### The Problem

The habits built in this phase - verify instead of recall, trace real callers, read real control flow, reproduce instead of predict - work on more than the four examples already used to teach them. Turned on the rest of this application, they immediately locate real, specific, cited places worth a full lesson each, later - not yet.

Before reading on:

- For each of the four items below, what real, mechanical check - in the same style as this phase's own four tools - would you run first, before trying to explain why it matters or how to fix it?

### Project Change

- **Reference Source:** Four real, separately verified citations, each read directly this session: `backend/app/routes/favorites.py:18,37,64,79`; an 18-file, 6-file split confirmed by a real script run this session against every file in `backend/app/routes`; `backend/app/models/machine_pairing.py:28-43`; and `backend/app/routes/operation_manager.py:552-553,647`.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A
- **Dependencies:** None beyond the real repository already checked out on disk.

Each citation below names a real, structural fact - where something lives, what shape it has, which real files are involved - without yet explaining the full mechanism behind it or proposing a fix. That fuller treatment is real, future work, not something this closing lesson can honestly compress into a few sentences each.

### CS Lens

This is scoping a search before attempting to solve what it finds - the same real discipline behind triage in an emergency room (identify and rank every real problem before treating any one of them in depth), a code review that lists every real concern found before deciding which ones block the change, and a scientific survey that catalogs real specimens before any one of them gets a full study. In every case, naming something real and located is genuine, useful progress on its own - it doesn't have to be the same step as resolving it.

### SE Lens

The real alternative not chosen here: using this closing lesson to explain all four items in full - what each one actually does at runtime, why it's a problem, and how to fix it. The real, honest cost of that choice: it would take four topics this phase's own habits aren't yet equipped to fully evaluate (identity and trust boundaries, denormalized schema design, and how untrusted data reaching a template engine actually becomes a real security failure all need their own real grounding first) and compress each into a few confident-sounding sentences - exactly the "prose standing in for proof" failure this whole phase exists to teach a reader to distrust. Stating the real scope boundary honestly costs this lesson a satisfying ending; it's the more honest choice anyway.

### Verification

Not applicable under the Verification Rule's own exemption: no execution is required for this unit's actual claims. Three of the four citations were verified by real, executed scripts earlier in this phase's own lessons (0.6's real-importer search, 0.7's real operator-route search) or a directly analogous one run this session for the 18-versus-6 route-file split; the fourth (`machine_pairing.py`'s real column declarations) is read directly from real, already-existing source. All four establish real, structural facts - what exists, where, and in what shape - not runtime behavior, which is exactly why a fuller treatment of any one of them, later, still needs its own real execution evidence, not just this citation.

### Connection to the previous unit

There is no previous unit - this is the first and only unit in this lesson.

## Connect the pieces

Four real, cited locations, found by turning this phase's own habits outward instead of introducing new ones: (1) identity is decided three incompatible real ways across this application - a real, authenticated `current_user`; `favorites.py`'s own real `request.headers.get('X-User-Id', 'programmer')`, defaulting to a literal fallback name when no header is sent at all; and other real routes that take a submitted name straight from the request body, unverified. (2) Of this application's 18 real route files, exactly 6 use `@token_required` anywhere at all - confirmed by a real script run this session - leaving 12 with no authentication mechanism of any kind, not even the bypassable kind read in the previous lesson. (3) `MachineCAMPairing` (`machine_pairing.py:28-43`) declares the identical real four-field shape - `_approved`, `_approved_by`, `_approved_email`, `_approved_at` - three separate times, once each for `quality`, `engineering`, and `programming`. (4) `operation_manager.py` has a real route (`create_nc_template`, line 647) that writes freely to `NCTemplate.content`, and a different real route (`generate_nc_file`, lines 552-553) that reads that same column and passes it directly into a real template-construction call. Each is real, each is cited, and none of them is explained here - naming them precisely, with real evidence, is as far as this phase's own scope goes.

**Next lesson:** Applying everything this phase built - reading a codebase as evidence, not assumption - to the Python language itself, starting with functions as the real unit backend code is organized around.