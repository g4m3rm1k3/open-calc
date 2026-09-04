# Lesson 12: Web Scraping — Permission, Fragility, and Structured Extraction

**What you will build:** a `recordkeeper/scrape.py` module with
`fetch_package_info`, using `BeautifulSoup` to extract a real
`PackageInfo` dataclass from a real, live PyPI project page — checked
against `robots.txt` first via the standard library's own
`urllib.robotparser`, and fetched through Lesson 11's
`fetch_with_retry`. The transferable problem: scraping means parsing a
document that was never designed as a data format at all, using
structure (tags, classes) a page's own authors are free to change
without warning; this lesson proves that fragility directly with a
real naive-regex failure against real page source, and separately
uncovers — by testing it, not assuming it — a genuine limitation in
the standard library's own `robots.txt` parser.

**What you need to know first:** Lesson 4 — `@dataclass`. Lesson 11 —
`fetch_with_retry`, reused here for every real page fetch.

**Terms used in this lesson**

- **`robots.txt`** — a plain-text file, conventionally at a site's own
  `/robots.txt` path, where a site's operators state which parts of the
  site automated tools should and shouldn't access. It exists as a
  voluntary, machine-readable convention — not enforced by any
  technical restriction — for a site to communicate its own crawling
  preferences to bots, predating any single company or protocol owning
  the standard.
- **Fragility (in scraping)** — the specific risk that a scraper stops
  working correctly not because anything about the *target data*
  changed, but because the *page's own presentation* did — a class
  name renamed during a redesign, an extra wrapper element added,
  whitespace reformatted. It exists as a real, structural property of
  scraping HTML specifically, distinct from every prior lesson's data
  sources: a CSV's column names, a JSON key, or an API's documented
  field are all part of an explicit, versioned contract; an HTML page's
  markup, by contrast, is free to change at any time with no such
  contract at all.

**Objects and methods used**

- **`urllib.robotparser.RobotFileParser`**
  - *What it is:* A standard-library class for fetching and checking
    permissions against a site's real `robots.txt`.
  - *Implementation:* `rp = RobotFileParser()`; `rp.set_url(url)` then
    `rp.read()` fetches and parses a real `robots.txt`;
    `rp.can_fetch(user_agent, url) -> bool` checks whether a given URL
    is permitted for a given user agent.
  - *Its use:* Checked before every real fetch in `scrape.py`, so a
    disallowed path is never requested at all.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library class; responsible for parsing a real
    `robots.txt`'s `User-agent`/`Disallow` rules and answering whether
    a specific URL is permitted for a specific crawler identity;
    depends on network access to fetch the `robots.txt` itself (via
    `.read()`); called once to build a reusable parser, then repeatedly
    via `.can_fetch()`; shape is a URL string in (for `.can_fetch()`),
    a `bool` out.

- **`bs4.BeautifulSoup`**
  - *What it is:* A third-party library's main class for parsing HTML
    (or XML) into a navigable, searchable tree — the same tree-of-
    elements idea Lesson 6 already built for XML with
    `xml.etree.ElementTree`, applied here to HTML specifically, which
    is commonly imperfect or invalid in ways a strict XML parser would
    reject outright.
  - *Implementation:* `BeautifulSoup(html_text, "html.parser") -> a
    BeautifulSoup object`, itself usable the same way a single
    top-level `Element` is; `.find(tag, class_=...)` returns the first
    matching descendant element anywhere in the tree (not just direct
    children, unlike Lesson 6's `Element.find`); `.get_text(strip=True)`
    returns an element's own text content, with surrounding whitespace
    removed and any HTML entities already decoded.
  - *Its use:* What `extract_package_info` uses to find specific
    elements on a real page and pull out their text.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    third-party class; responsible for turning raw, possibly-imperfect
    HTML text into a searchable tree, and locating elements within it
    by tag name and/or attributes, matched semantically (a class
    among possibly several, not an exact attribute-string match);
    depends on raw HTML text and a parser backend (`"html.parser"`,
    itself part of the standard library, used here); connects to
    `.find()`'s returned elements, each of which offers the same
    `.get_text()`/`.find()` interface again; shape is HTML text in,
    real Python objects representing that structure out.

---

## Concept Unit: `robots.txt` — real permission, real limitations

### The Problem

Every data source before this lesson — a file, a database, even
Lesson 11's own API calls — either belonged to `recordkeeper`'s own
project or was an API explicitly designed to be called programmatically.
A web page is neither: it's built for a human reading it in a browser,
and the site serving it may have real, stated preferences about
automated access that have nothing to do with technical capability —
`requests.get` can fetch nearly any public URL regardless of what a
site's operators would prefer.

> **Stop and think:** If a site publishes a plain-text file stating
> which of its own paths automated tools shouldn't access, and nothing
> technical stops a program from ignoring that file entirely, what
> would actually motivate a scraper to check it anyway? And if a
> library exists specifically to parse this file and answer "is this
> path allowed," would you trust it to correctly handle *every* real
> pattern real sites might write in one — or would you want to verify
> that against real examples first?

### Introduce the concept in isolation

Against PyPI's real, live `robots.txt`:

```python
import urllib.robotparser

rp = urllib.robotparser.RobotFileParser()
rp.set_url("https://pypi.org/robots.txt")
rp.read()

print("project page allowed? ->", rp.can_fetch("*", "https://pypi.org/project/requests/"))
print("/admin/ allowed?       ->", rp.can_fetch("*", "https://pypi.org/admin/"))
print("/account/ allowed?     ->", rp.can_fetch("*", "https://pypi.org/account/"))
print("/simple/... allowed?   ->", rp.can_fetch("*", "https://pypi.org/simple/requests/"))
```

Real output, from an actual run against PyPI's real, current
`robots.txt` (fetched the same session, its content included below for
reference):

```
Sitemap: https://pypi.org/sitemap.xml

User-agent: *
Disallow: /simple/
Disallow: /packages/
Disallow: /_includes/authed/
Disallow: /project/*/submit-malware-report/
Disallow: /pypi/*/json
Disallow: /pypi/*/*/json
Disallow: /pypi*?
Disallow: /search*
Disallow: /_/
Disallow: /integrity/
Disallow: /account/
Disallow: /admin/
```

```
project page allowed? -> True
/admin/ allowed?       -> False
/account/ allowed?     -> False
/simple/... allowed?   -> False
```

This is real, verified proof `RobotFileParser` correctly enforces
plain, literal `Disallow` prefixes — `/admin/`, `/account/`, `/simple/`
all correctly come back disallowed.

Now, a real limitation, uncovered by testing rather than assumed:

```python
print(rp.can_fetch("*", "https://pypi.org/search*"))
print(rp.can_fetch("*", "https://pypi.org/searchXYZ"))
```

Real output:

```
False
True
```

`robots.txt`'s own `Disallow: /search*` line looks, to a human reader,
like it means "block anything starting with `/search`" — the `*`
read as a wildcard. `rp.can_fetch`'s real behavior proves otherwise for
*this* standard-library implementation: `/search*` (the literal string,
asterisk included) is blocked, because it matches the rule as a literal
prefix — but `/searchXYZ`, almost certainly what the site's own authors
actually meant to block, comes back **allowed**. This standard-library
parser doesn't implement the wildcard extension some other robots.txt
parsers (and some real crawlers) do support — a real, concrete example
of exactly the standard this curriculum's own Verification Rule has
insisted on since Lesson 1: a library's documented-sounding behavior
isn't something to assume, even from a name like `RobotFileParser` that
sounds like it should just work.

### Discard the throwaway example

This lab's `rp` and its individual `can_fetch` checks are discarded;
the real, tested limitation they revealed directly shapes how
`scrape.py`'s own permission check is designed and described below.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior lesson.
- **Files affected** — new file `recordkeeper/scrape.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `urllib.robotparser` (standard library);
  `beautifulsoup4` (third-party, install with `pip install
  beautifulsoup4`); `recordkeeper.net.fetch_with_retry` (Lesson 11).

### The New Code

```python
import urllib.robotparser
from dataclasses import dataclass

from bs4 import BeautifulSoup

from recordkeeper.net import fetch_with_retry

ROBOTS_URL = "https://pypi.org/robots.txt"
_robot_parser = None


def _get_robot_parser():
    global _robot_parser
    if _robot_parser is None:
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(ROBOTS_URL)
        rp.read()
        _robot_parser = rp
    return _robot_parser
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`from dataclasses import dataclass`, `from bs4 import
  BeautifulSoup`, `from recordkeeper.net import fetch_with_retry`** —
  three imports, each already given full treatment: `dataclass` in
  Lesson 4, `fetch_with_retry` in Lesson 11; `BeautifulSoup` gets its
  own full treatment above, in Objects and methods used.
- **`ROBOTS_URL = "https://pypi.org/robots.txt"`** — a module-level
  constant naming the one real `robots.txt` this module ever checks
  against, since every real fetch `scrape.py` performs targets the same
  site.
- **`_robot_parser = None`** — a module-level variable, initially
  `None`, used by `_get_robot_parser` (below) to fetch `robots.txt`
  only once per process rather than on every single call.
- **`global _robot_parser`** — inside `_get_robot_parser`, declares
  that assignments to `_robot_parser` in this function should modify
  the module-level variable of that name, rather than creating a new,
  function-local variable that shadows it — necessary because the
  function both reads and reassigns this name.
- **`if _robot_parser is None: ...`** — the first call actually fetches
  and parses `robots.txt`, storing the result; every later call finds
  `_robot_parser` already set and skips straight to returning it —
  avoiding a real, unnecessary network request on every single
  permission check.

### CS lens

Fetching and building something expensive exactly once, then reusing
that same result on every later call, is **memoization** — the same
general idea behind caching a computed value keyed by its inputs,
specialized here to a computation with no real "input" at all (there's
only ever one `robots.txt` this module cares about), making the cache
a single reusable value rather than a lookup table.

```
Also recognized in: a database connection pool reusing already-open
connections instead of opening a fresh one per query, a compiled
regular expression object reused across many `.match()` calls instead
of recompiling the pattern each time, a web framework caching a
parsed configuration file instead of re-reading and re-parsing it on
every request
```

### SE lens

The alternative not chosen is calling `rp.read()` fresh, every single
time a permission check is needed. That would correctly pick up a
`robots.txt` change the moment it happens — genuinely more correct in
the rare case a site updates its rules mid-run — at the real cost of
one extra network request per check, for a file that, in practice,
changes rarely. Caching it once per process, as `_get_robot_parser`
does, is the right tradeoff for a scraper making many requests in one
run; a long-lived service checking permissions over hours or days would
reasonably re-fetch periodically instead, a refinement this lesson's
own `_get_robot_parser` doesn't need yet.

### Commands needed

- `pip install beautifulsoup4` — installs the `beautifulsoup4` package
  (imported as `bs4`). Success output ends with a line like
  `Successfully installed beautifulsoup4-4.14.3`.

### Run it

Shown above under "Introduce the concept in isolation" — real output,
including the real, tested wildcard limitation.

### Connect

This unit establishes real, verified permission-checking, including a
real limitation worth knowing rather than assuming away; the next unit
turns to the actual extraction problem — pulling real data out of a
real page's HTML, and proving directly why doing that with a naive,
hand-written pattern is fragile in exactly the way this lesson's own
Terms section named.

---

## Concept Unit: Naive parsing vs. `BeautifulSoup`, proven on a real page

### The Problem

Lesson 3 already proved naive `.split(",")` breaks on real CSV data
containing its own delimiter. HTML has an analogous, if different, trap:
a naive pattern — a regular expression hardcoded to an exact tag and
attribute string — assumes the page's real markup matches that pattern
*exactly*, character for character, which real, human-authored HTML
frequently doesn't.

> **Stop and think:** If a real webpage's HTML was written (or
> generated) by a real team, possibly with automated formatting tools,
> is there any reason to expect every attribute to be written in
> exactly the minimal, tidy form a hand-written regex might assume — no
> extra whitespace, no extra classes, always in the same order? What
> would a regex hardcoded to one exact attribute string do if the real
> page had even one small, harmless-looking difference from that exact
> string?

### Introduce the concept in isolation

Against a real, live PyPI page, fetched this session
(`https://pypi.org/project/requests/`):

```python
import re
from bs4 import BeautifulSoup

with open("requests_page.html", encoding="utf-8") as f:
    html = f.read()

m = re.search(r'<header class="[^"]*"', html)
print("the real, raw <header> tag on this page ->", m.group(0))

pattern = r'<header class="site-header"'
naive_match = re.search(pattern, html)
print("naive regex match ->", naive_match)

soup = BeautifulSoup(html, "html.parser")
header = soup.find("header", class_="site-header")
print("BeautifulSoup find ->", header.name, header.get("class"))
```

Real output:

```
the real, raw <header> tag on this page -> <header class="site-header "
naive regex match -> None
BeautifulSoup find -> header ['site-header']
```

This is a real, unmodified fragility, not constructed for the lesson:
the page's actual `<header>` tag has a trailing space inside its
`class` attribute — `class="site-header "`, not `class="site-header"`
— almost certainly harmless, leftover from however this page's
templates concatenate class names. A regex hardcoded to the exact
string `class="site-header"` genuinely fails to match real, live
markup because of one invisible extra character. `BeautifulSoup`'s
`.find("header", class_="site-header")` succeeds regardless: it
doesn't compare the whole `class` attribute as one string at all — it
splits the attribute into its individual class *tokens* and checks
whether the requested one is among them, which is immune to a trailing
space, a different order, or an entirely different additional class
sitting alongside it.

Extracting real, structured data the robust way:

```python
h1 = soup.find("h1", class_="project-header__name")
name, version = h1.get_text(strip=True).rsplit(" ", 1)
print("name ->", name, "version ->", version)

summary_el = soup.find("p", class_="project-header__summary")
print("summary ->", summary_el.get_text(strip=True))
```

Real output:

```
name -> requests version -> 2.34.2
summary -> Python HTTP for Humans.
```

Both values are the real, current content of this specific, live page
at the time this lesson was written.

### Discard the throwaway example

This lab's regex/`BeautifulSoup` comparison is discarded as standalone
code; the pattern it proves correct — locate by class membership, then
`.get_text(strip=True)` — carries forward into `extract_package_info`
below.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/scrape.py` (modified, adding
  `PackageInfo` and `extract_package_info`).
- **Change type** — add.
- **Location** — after `_get_robot_parser`, already present from the
  previous unit.
- **Dependencies** — none new.

### The New Code

```python
@dataclass
class PackageInfo:
    name: str
    version: str
    summary: str


def extract_package_info(html):
    soup = BeautifulSoup(html, "html.parser")
    h1 = soup.find("h1", class_="project-header__name")
    name, version = h1.get_text(strip=True).rsplit(" ", 1)
    summary_el = soup.find("p", class_="project-header__summary")
    summary = summary_el.get_text(strip=True) if summary_el else None
    return PackageInfo(name=name, version=version, summary=summary)
```

### The Updated Project

```python
 1  import urllib.robotparser
 2  from dataclasses import dataclass
 3
 4  from bs4 import BeautifulSoup
 5
 6  from recordkeeper.net import fetch_with_retry
 7
 8  ROBOTS_URL = "https://pypi.org/robots.txt"
 9  _robot_parser = None
10
11
12  def _get_robot_parser():
13      global _robot_parser
14      if _robot_parser is None:
15          rp = urllib.robotparser.RobotFileParser()
16          rp.set_url(ROBOTS_URL)
17          rp.read()
18          _robot_parser = rp
19      return _robot_parser
20
21
22  @dataclass                                                  # ← new
23  class PackageInfo:                                           # ← new
24      name: str                                                 # ← new
25      version: str                                              # ← new
26      summary: str                                              # ← new
27
28
29  def extract_package_info(html):                              # ← new
30      soup = BeautifulSoup(html, "html.parser")                 # ← new
31      h1 = soup.find("h1", class_="project-header__name")       # ← new
32      name, version = h1.get_text(strip=True).rsplit(" ", 1)    # ← new
33      summary_el = soup.find("p", class_="project-header__summary")  # ← new
34      summary = summary_el.get_text(strip=True) if summary_el else None  # ← new
35      return PackageInfo(name=name, version=version, summary=summary)   # ← new
```

`PackageInfo` follows the exact `@dataclass` pattern `Contact` did in
Lesson 4; `extract_package_info` is the module's own real conversion
function, parsing raw HTML into that structured type, the same
"convert at one clean seam" discipline used at every source boundary
since Lesson 4.

### Mechanical walkthrough

- **`BeautifulSoup(html, "html.parser")`** — full treatment above, in
  Objects and methods used; `"html.parser"` names the specific,
  built-in-to-Python backend `BeautifulSoup` should use to actually
  parse the raw HTML text into its tree — `BeautifulSoup` supports
  multiple interchangeable backends, and this is the one requiring no
  extra installation beyond `BeautifulSoup` itself.
- **`soup.find("h1", class_="project-header__name")`** — full
  treatment of `.find` above; `class_` (with a trailing underscore,
  since `class` alone is a Python keyword and can't be used as a
  keyword argument name) searches by class membership, per this unit's
  own proven robustness.
- **`h1.get_text(strip=True).rsplit(" ", 1)`** — `.get_text(strip=True)`
  (full treatment above) returns `"requests 2.34.2"` as one plain
  string; `.rsplit(" ", 1)` — `str.rsplit`, splitting from the *right*
  end, with a `maxsplit` of `1` — splits that string into at most two
  pieces, splitting on the *last* space only, correctly separating a
  package name from its version even if the name itself ever contained
  a space (unlikely for a real PyPI name, but `rsplit` from the right
  is the more defensive choice regardless, since a version number never
  contains a space).
- **`summary_el.get_text(strip=True) if summary_el else None`** — a
  conditional expression: if `summary_el` is a real element (not
  `None`, meaning `.find` located a matching element), extract its
  text; otherwise, fall back to `None` rather than raising an
  `AttributeError` by calling `.get_text()` on `None` — the first real
  concession, in this lesson, to the fragility this lesson's own Terms
  section named: a real page might not always have every expected
  element.

### CS lens

Matching an element by whether it *has* a given class, among possibly
several, rather than by its attribute's exact literal string, is the
same distinction between **exact matching** and **set membership** —
checking whether a value belongs to a collection, rather than whether
two values are identical outright.

```
Also recognized in: a permissions system checking whether a user's
role is *among* several roles allowed to perform an action, a CSS
selector itself (`.site-header` matches any element with that class
among others, the same rule BeautifulSoup's `class_` argument mirrors),
a spam filter checking whether any of several trigger words appears in
a message, rather than matching the message's exact full text
```

### SE lens

The alternative not chosen — the naive regex this unit's own lab just
proved fails on real, live data — isn't a strawman: it's a genuinely
common first instinct, because for *some* real pages, at *some* point
in time, it would actually work, right up until a redesign,
templating-engine change, or even just inconsistent whitespace breaks
it silently or loudly. `BeautifulSoup`'s real, tree-based matching
doesn't eliminate scraping's fundamental fragility — Terms, above,
already named that as inherent to HTML having no real schema
contract — but it does eliminate an entire *class* of false fragility:
breaking over incidental formatting differences that carry no real
meaning at all, which is exactly what this unit's own real header
example demonstrated.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output,
against real, live page source.

### Connect

This unit proved extraction from one real element correctly, and
already added one small defensive check (`if summary_el else None`)
for a missing element; the final unit ties permission-checking,
retryable fetching, and extraction together into one real function,
verified against two different real, live pages.

---

## Concept Unit: Putting it together — a real, permission-checked, retried fetch

### The Problem

`_get_robot_parser` (first unit), `extract_package_info` (second unit),
and Lesson 11's `fetch_with_retry` each solve one piece of a real
scrape — checking permission, parsing structure, and fetching
reliably — but nothing yet combines them into the one function
`recordkeeper` actually needs: given a package name, safely and
correctly get back real, structured data.

> **Stop and think:** Given the three pieces already built — a
> permission check, a retryable fetch, and a structure-to-object
> converter — in what order would they need to run for a single
> function to be genuinely safe: does checking permission need to
> happen before or after the network request? Does extraction need the
> raw HTML text, or the whole `Response` object `fetch_with_retry`
> returns?

### Introduce the concept in isolation

This unit's own "lab" is the real, live combination itself — run
directly against `recordkeeper`'s finished project code, against two
different real packages:

```python
from recordkeeper.scrape import fetch_package_info, _get_robot_parser

print(fetch_package_info("requests"))
print(fetch_package_info("flask"))

rp = _get_robot_parser()
print("project page allowed ->", rp.can_fetch("*", "https://pypi.org/project/requests/"))
print("/account/ allowed ->", rp.can_fetch("*", "https://pypi.org/account/"))
```

Real output, from an actual run against the live site:

```
PackageInfo(name='requests', version='2.34.2', summary='Python HTTP for Humans.')
PackageInfo(name='Flask', version='3.1.3', summary='A simple framework for building complex web applications.')
project page allowed -> True
/account/ allowed -> False
```

Two genuinely different real packages — different names, different
version numbers, different summaries — both correctly extracted into
real `PackageInfo` objects through the exact same function; the
underlying robots-permission check, confirmed directly, correctly
allows the kind of URL `fetch_package_info` actually builds
(`/project/{name}/`) while still correctly disallowing a real,
unrelated path this module never needs to touch.

### Discard the throwaway example

Nothing here is discarded — this unit's own verification *is* the real,
finished project code, run for real.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior unit.
- **Files affected** — `recordkeeper/scrape.py` (modified, adding
  `fetch_package_info`).
- **Change type** — add.
- **Location** — after `extract_package_info`, already present from the
  previous unit.
- **Dependencies** — none new.

### The New Code

```python
def fetch_package_info(package_name):
    url = f"https://pypi.org/project/{package_name}/"
    rp = _get_robot_parser()
    if not rp.can_fetch("*", url):
        raise PermissionError(f"robots.txt disallows fetching {url}")
    response = fetch_with_retry(url)
    response.raise_for_status()
    return extract_package_info(response.text)
```

### The Updated Project

`recordkeeper/scrape.py`, complete:

```python
 1  import urllib.robotparser
 2  from dataclasses import dataclass
 3
 4  from bs4 import BeautifulSoup
 5
 6  from recordkeeper.net import fetch_with_retry
 7
 8  ROBOTS_URL = "https://pypi.org/robots.txt"
 9  _robot_parser = None
10
11
12  def _get_robot_parser():
13      global _robot_parser
14      if _robot_parser is None:
15          rp = urllib.robotparser.RobotFileParser()
16          rp.set_url(ROBOTS_URL)
17          rp.read()
18          _robot_parser = rp
19      return _robot_parser
20
21
22  @dataclass
23  class PackageInfo:
24      name: str
25      version: str
26      summary: str
27
28
29  def extract_package_info(html):
30      soup = BeautifulSoup(html, "html.parser")
31      h1 = soup.find("h1", class_="project-header__name")
32      name, version = h1.get_text(strip=True).rsplit(" ", 1)
33      summary_el = soup.find("p", class_="project-header__summary")
34      summary = summary_el.get_text(strip=True) if summary_el else None
35      return PackageInfo(name=name, version=version, summary=summary)
36
37
38  def fetch_package_info(package_name):                        # ← new
39      url = f"https://pypi.org/project/{package_name}/"        # ← new
40      rp = _get_robot_parser()                                 # ← new
41      if not rp.can_fetch("*", url):                            # ← new
42          raise PermissionError(f"robots.txt disallows fetching {url}")  # ← new
43      response = fetch_with_retry(url)                          # ← new
44      response.raise_for_status()                               # ← new
45      return extract_package_info(response.text)                # ← new
```

### Mechanical walkthrough

- **`url = f"https://pypi.org/project/{package_name}/"`** — builds the
  real URL this whole module targets, matching the exact pattern
  `_get_robot_parser`'s own `robots.txt` was checked against in this
  lesson's first unit.
- **`if not rp.can_fetch("*", url): raise PermissionError(...)`** —
  permission is checked *before* any network request happens at all —
  answering this unit's own Socratic prompt: checking first means a
  disallowed URL is never actually requested, respecting `robots.txt`
  in the way it's intended to be respected, not merely logged after
  the fact.
- **`response = fetch_with_retry(url)`** — full treatment already given
  in Lesson 11; every real fetch this module performs automatically
  inherits retry-with-backoff, exactly as `paginate` did in that
  lesson.
- **`response.raise_for_status()`** — full treatment already given in
  Lesson 11; converts a real failed response (after `fetch_with_retry`
  already exhausted its own retries) into a real, loud exception rather
  than letting `extract_package_info` run against an error page's HTML.
- **`extract_package_info(response.text)`** — full treatment already
  given in the previous unit; `response.text` (not `.json()` — this is
  HTML, not a JSON API response) is the raw page source passed to the
  extraction function this lesson built.

### CS lens

Checking a precondition (permission) before attempting an operation,
rather than attempting the operation and handling a failure
afterward, is the classic **"look before you leap"** discipline —
distinct from, and complementary to, the "ask forgiveness"
error-handling this curriculum has otherwise favored (a `try`/`except`
around a risky operation, as in Lesson 8's `IntegrityError` handling).

```
Also recognized in: a filesystem checking write permission before
attempting a write rather than attempting it and catching a
`PermissionError`, a compiler's type checker rejecting invalid code
before any of it runs, a database checking a foreign-key constraint
before allowing an insert to proceed
```

### SE lens

The alternative not chosen is skipping the `robots.txt` check
entirely and simply attempting every fetch, letting a disallowed
request fail (or, worse, silently succeed, since nothing technical
enforces `robots.txt` at all) with no explicit acknowledgment of the
site's own stated preference. `fetch_package_info` checks first and
raises a real, named `PermissionError` instead — costing one extra,
already-cached `can_fetch` call per request, in exchange for
`recordkeeper` never being the reason a site's own stated crawling
preferences go unrespected, and a clear, immediate signal to any
caller who does try to scrape a disallowed path, rather than a
confusing downstream failure inside `extract_package_info`.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output,
from an actual run against two different real, live pages.

### Connect

Every piece built across this lesson's three units — real permission-
checking (including a real, tested library limitation), robust
class-based extraction (proven against a real fragility a naive regex
couldn't survive), and Lesson 11's own retryable fetching — comes
together in `fetch_package_info`, checked, in this unit's own run,
against two genuinely different real packages.

---

## Connect the pieces

`recordkeeper.scrape.fetch_package_info("requests")` first calls
`_get_robot_parser()`, which — the first time it's ever called in a
process — fetches PyPI's real, live `robots.txt` and builds a real
`RobotFileParser`, proven earlier in this lesson to correctly enforce
literal `Disallow` rules while genuinely not supporting the `*`
wildcard extension some sites' rules assume. `rp.can_fetch` confirms
`https://pypi.org/project/requests/` is allowed. `fetch_with_retry`
(Lesson 11) then performs the real request, automatically inheriting
retry-with-backoff for any transient failure. `response.raise_for_status()`
guards against a page that ultimately failed to load at all. Finally,
`extract_package_info` — built and proven, in this lesson's second
unit, to correctly locate real elements by class *membership* rather
than a naive exact-string match that this session's own live page
proved would fail — parses the real HTML into a real `PackageInfo`
object. Run for real, against two different, real, live packages, the
whole chain produced two correct, distinct, real results — proof every
piece of this lesson's own real, unstaged evidence (a genuine rate
limit in Lesson 11, a genuine trailing-space class attribute here, a
genuine wildcard limitation in the standard library) fits together into
one real, working scraper, not a lesson assembled from mocked
convenience.
