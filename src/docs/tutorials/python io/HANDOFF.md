# RecordKeeper Curriculum — Handoff

## What this is

A lesson-by-lesson curriculum teaching **how to think about data in Python**,
not just how to call functions: file I/O and streams, CSV, JSON, XML,
SQL (via `sqlite3`), an ORM layer, NoSQL-style document storage, HTTP
APIs, web scraping, and — at each stage — building a small piece of the
relevant library ourselves so the abstraction stops being a black box.

Every lesson follows the attached Lesson Schema exactly: Header with a
Terms glossary and an Objects-and-methods section (each entry with its
three-part explanation plus the five-field CRC breakdown), Concept Units
built one new idea at a time (Problem → Socratic prompt → isolated,
verified lab → discard → Project Change → New Code → Updated Project →
Mechanical Walkthrough → CS Lens → SE Lens → Commands → Run → Connect),
and a closing self-check.

## The taught project: `recordkeeper`

A small, real Python package that ingests event/contact records from an
increasing number of sources and formats, normalizes them, and — in
later lessons — stores and queries them. Each lesson's "Updated Project"
steps are the complete, authoritative record of the project's real
state; nothing about the project lives anywhere else.

Location: `project/recordkeeper/`

## Verification folder

`verification/<lesson-id>/` holds every throwaway lab script actually
executed to write each lesson, plus its real captured output
(`out_*.txt`). Before running anything for a new lesson, check here
first — if the exact code already has a saved run, reuse the output
instead of re-executing it. This folder is *not* a mirror of the
project; it only ever holds the minimal snippet that was genuinely
uncertain, plus its real output.

## Lesson roadmap (planned — not all written yet)

1. **Trusting the Filesystem** — `open()`, the `with` statement /
   context managers, streaming line-by-line iteration vs. loading a
   whole file, text encoding. *(written — see `lessons/lesson-01-...md`)*
2. **Bytes, Text, and What Buffering Actually Buys You** — binary mode,
   and building a tiny buffered reader ourselves, proven against real
   `io.BufferedReader` behavior, to show what's happening under the hood
   of every `open()` call. *(written — see `lessons/lesson-02-...md`;
   written at lighter depth than Lesson 1, per the reader's preference —
   same structure, more concise prose and CRC bullets.)*
3. CSV: the `csv` module, why naive `line.split(",")` is wrong (quoting,
   embedded commas/newlines), `DictReader`/`DictWriter`, dialects.
4. Parsing text into objects: dataclasses vs. plain dicts, why a
   dedicated type beats "just use the dict everywhere."
5. JSON: `json.dumps`/`loads`, custom encoders/decoders, and writing a
   minimal JSON tokenizer/parser by hand for a subset of the grammar.
6. XML: `xml.etree.ElementTree`, the DOM-vs-stream (SAX/iterparse)
   distinction, and why XML parsing has different failure modes than
   JSON's.
7. Efficient large-file processing: generators, `itertools`, chunked
   reads, memory vs. speed tradeoffs, profiling a naive vs. streaming
   approach against the same large input.
8. SQL fundamentals via `sqlite3`: connections, cursors, parameterized
   queries, transactions, why string-formatting SQL is a real
   vulnerability (SQL injection) proven against our own code.
9. Object-relational mapping: mapping rows to objects by hand first,
   then introducing SQLAlchemy Core/ORM and comparing to the hand-rolled
   version.
10. NoSQL / document storage: a key-value and a document-store mental
    model, using `sqlite3`'s JSON1 extension or a local document store
    to contrast with the relational model from lesson 8-9.
11. HTTP fundamentals and APIs: `requests`/`httpx`, status codes,
    headers, pagination, retries/backoff, rate limits, auth.
12. Web scraping: HTML parsing (`BeautifulSoup`/`lxml`), the legal/robots.txt
    and fragility considerations, structured extraction into the same
    object model used since lesson 4.
13. Streams and pipelines end-to-end: composing everything above into
    one ingestion pipeline for `recordkeeper`, with backpressure and
    error-handling as first-class concerns.

This list will grow/shift as lessons are actually written; per the
schema, any lesson-number citation inside a lesson's own prose is
forbidden regardless — this roadmap is planning material, not lesson
content.
