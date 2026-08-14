# Concept: The `data:` URL Scheme and `encodeURIComponent`

**What you'll understand by the end:** how to embed real content directly inside a URL, with no server or file behind it at all, and why that content has to be encoded first.

**Prerequisites:** `http-request-response.md`.

## Setup

Any modern browser or Node.js/Electron environment — `encodeURIComponent` is a global function everywhere JavaScript runs; no install needed.

## The Problem

Every URL used so far in this project points *somewhere* — a path a server answers, a file on disk. Sometimes there's a real need to show content with no server or file behind it at all — a fallback message when a real destination genuinely can't be reached, for instance. Building that content as an ordinary string and handing it directly to something expecting a URL doesn't work: a URL has its own syntax rules, and characters like `<`, `&`, or a space are either meaningless or actively break that syntax if placed into one unescaped.

## The Isolated Example

```javascript
const html = "<body><h2>Hi & welcome</h2><p>100% real</p></body>";
const url = "data:text/html," + encodeURIComponent(html);
console.log("encoded length:", url.length);
console.log(url);
```

**Real output, run this session:**
```
encoded length: 105
data:text/html,%3Cbody%3E%3Ch2%3EHi%20%26%20welcome%3C%2Fh2%3E%3Cp%3E100%25%20real%3C%2Fp%3E%3C%2Fbody%3E
```

**What this proves:** every character with special meaning in a URL — `<`, `>`, `&`, the space, even the literal `%` in "100%" — was converted to a real, safe `%XX` escape sequence (its byte value in hexadecimal), and nothing else changed. The result is one, single, valid URL string a browser (or Electron's `loadURL`) can navigate to directly, with the entire page's content living inside the URL itself rather than at a separate address.

## Mechanical Walkthrough

- `"data:text/html," + ...` — **(a) first appearance** of the `data:` URL scheme — unlike `http://`/`https://` (a real network request to a real server), a `data:` URL carries its content *directly inside the URL string itself*; nothing is fetched from anywhere. The syntax is `data:<mime-type>,<content>` — `text/html` here tells whatever loads this URL to interpret the content as an HTML page, the same `Content-Type` concept `http-status-codes.md`'s neighboring concepts already cover, specified inline instead of as a response header because there is no response, only this one string.
- `encodeURIComponent(html)` — **(a) first appearance** — a built-in global function (no import needed, available in every JavaScript environment) that converts a string into a form safe to embed inside a URL, replacing every character that isn't a safe, literal URL character with its `%`-prefixed hexadecimal byte value (`<` → `%3C`, `&` → `%26`, a space → `%20`).
- `url.length` — **(c) already established** string `.length`, applied to confirm the encoded result is a real, longer string than the original (105 characters here, versus the original HTML's shorter length) — direct, checkable proof that encoding actually happened, not just claimed.

## CS Lens

This is **percent-encoding** (also called URL encoding) — a real, standardized escaping scheme for representing arbitrary bytes inside a text format (a URL) that reserves certain characters for its own syntax. The same general problem `textcontent-vs-innerhtml-xss.md` and `xss-auto-escaping-jinja2.md` already named from a different angle (untrusted content needing safe handling before it's placed inside a different format that would otherwise interpret it specially) — here applied to the URL format specifically, rather than HTML.

Also recognized in: every query string on the web (`?q=hello%20world`), HTML entity encoding (`&amp;`, `&lt;` — a different escaping scheme solving the identical kind of problem for HTML specifically instead of URLs), and any serialization format with its own reserved characters that user-supplied content might accidentally collide with.

## SE Lens

The alternative — building the URL string by direct concatenation with no encoding — works by pure luck for content containing no reserved characters, and produces a real, broken (or, worse, subtly misinterpreted) URL the moment the content contains a `#`, `&`, `%`, or any non-ASCII character. `encodeURIComponent` costs one function call and removes an entire class of "worked in my test, broke on real content" bugs — directly relevant here since a real error message can contain almost anything (a filename, an error description from the OS), none of it something this code controls or can assume is URL-safe.

## Connection

Builds on `http-request-response.md`'s notion of a URL generally. A direct sibling of `textcontent-vs-innerhtml-xss.md`'s and `xss-auto-escaping-jinja2.md`'s escaping concerns, applied to a different target format (a URL, not HTML/the DOM). Used in this project to build a real, safe fallback page shown directly inside an Electron `BrowserWindow` (`electron-main-process-and-browserwindow.md`) when the app it's trying to load genuinely can't be reached.

## Try It Yourself

1. Remove `encodeURIComponent(...)` and concatenate the raw `html` string directly into the `data:` URL instead — load the result and observe what actually goes wrong (which characters cause the real, visible breakage).
2. Look up `decodeURIComponent` (the inverse function) and confirm `decodeURIComponent(encodeURIComponent(html)) === html` — real, round-trip proof the encoding is reversible and lossless.
3. Try `data:text/plain,` instead of `data:text/html,` with the same encoded content, and observe that the `<h2>`/`<p>` tags now show up as literal, visible text instead of being rendered — direct proof the MIME type genuinely controls how the content gets interpreted, not just cosmetic labeling.
