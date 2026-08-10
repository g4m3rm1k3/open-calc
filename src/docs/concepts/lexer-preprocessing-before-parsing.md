# Concept: Stripping Non-Semantic Content Before Real Parsing

**What you'll understand by the end:** why comments, whitespace, and similar "content that looks like structure but isn't" have to be recognized and removed *before* the rules that extract real meaning ever run — not after, and not at the same time.

**Prerequisites:** `regular-language-finite-state-machine.md`.

## Setup

Python 3, no packages needed.

## The Problem

Real text formats often contain content that shares the same surface shape as meaningful data but isn't meant to be interpreted as such — a comment containing what looks like a keyword, a quoted string containing a delimiter character. If the "real" parsing rules run over the raw text without this content being set aside first, they can't tell the difference — by the time a word-matching rule runs, it has no way to know whether it's looking at real content or content that happened to be sitting inside something that should have been ignored entirely.

## The Isolated Example

```python
import re

WORD_RE = re.compile(r"[A-Za-z]+")

def extract_words_naive(text):
    return WORD_RE.findall(text)

def extract_words_correct(text):
    without_comments = re.sub(r"#.*", "", text)
    return WORD_RE.findall(without_comments)

line = "apple banana  # not a real fruit: cherry"
print("naive:  ", extract_words_naive(line))
print("correct:", extract_words_correct(line))
```

**Real output:**
```
naive:   ['apple', 'banana', 'not', 'a', 'real', 'fruit', 'cherry']
correct: ['apple', 'banana']
```

**What this proves:** the naive version has no way to distinguish "banana," a real word, from "cherry," a word that only exists inside a comment — both look identical to a plain word-matching pattern once they're just characters in a string. Only removing the comment *first*, before word-extraction runs, correctly excludes content that was never meant to be real data.

## Mechanical Walkthrough

- `extract_words_naive` runs one pattern directly against the raw, unmodified text — it cannot distinguish real content from comment content, because by the time it looks at the text, that distinction has already been lost.
- `extract_words_correct` runs a *preprocessing* pass (`re.sub` removing everything from `#` to the end of the line) before the word pattern ever sees the text — the comment's characters are gone entirely by the time real extraction happens, not merely marked as "ignore this."
- Order matters absolutely here: running word-extraction first and trying to filter out "words that came from a comment" afterward is not equivalent — once extraction has run, there's no remaining information about *where* each word came from.

## CS Lens

This is the general **lexer preprocessing** principle: a lexer's job includes recognizing and discarding non-semantic content (comments, insignificant whitespace) before the token stream it produces ever reaches anything that assigns meaning to tokens. Once tokens exist, downstream code can safely assume every token is meaningful — it never has to re-litigate "wait, was this actually inside a comment?"

Also recognized in: every real programming language's lexer stripping `//` and `/* */` comments before tokenizing actual code, HTML parsers discarding `<!-- -->` comments before building the DOM, and CSV parsers handling quoted fields that may contain the delimiter character itself — a different flavor of the identical "content that looks like structure but isn't" problem, solved the same way: recognize the special content as a distinct concern, handle it first, then let the real rules run on what's left.

## SE Lens

Trying to make one combined pass handle both "is this a comment" and "is this a real word" simultaneously is a real, tempting shortcut that fails exactly the way `extract_words_naive` failed above — it's not merely less elegant, it produces genuinely wrong results the moment a comment happens to contain word-shaped text. Separating the concerns into two ordered passes — even though it's "more code" by a literal line count — is the version that's actually correct, and each pass stays simple enough to reason about independently.

## Connection

Builds on `regular-language-finite-state-machine.md` (comments and real tokens are each their own regular pattern) and directly motivates `python-regex-sub.md`/`regex-negated-character-class.md`'s combination as the concrete tool for the preprocessing step.

## Try It Yourself

1. Reverse the order deliberately — try to strip comments *after* running word-extraction on the raw text, by filtering the resulting word list somehow. Convince yourself (or discover directly) that there's no way to correctly exclude "cherry" from the results once it's already been extracted as a plain word with no memory of where it came from.
2. Add a second kind of non-semantic content — a quoted string, `'...'` — that should also be stripped before word-extraction, and confirm words inside quotes are correctly excluded the same way comment words are.
3. Construct an input where a comment marker (`#`) appears *inside* a quoted string (e.g. `"a real # not a comment" # this actually is one`) using the two-pass approach from exercise 2. Does your preprocessing handle this correctly, or does it also incorrectly treat the `#` inside the quotes as a comment start? This is a real, genuine escalation in difficulty — real lexers handle exactly this kind of "context changes what a character means" case explicitly, which single, independent regex passes struggle with once contexts can nest or overlap.
