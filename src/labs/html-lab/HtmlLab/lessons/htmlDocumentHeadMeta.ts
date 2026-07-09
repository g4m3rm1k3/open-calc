import { computeSolvedFoldAtStep } from "./lessonEngine";
import { htmlFoundationsTags } from "./htmlFoundationsTags";
import { foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Eighth HTML lesson — a callback to "What Is HTML?" (lesson 1), which
// introduced the head/body split via "look at the code panel" steps with no
// canvas changes at all, since <head> content isn't part of the canvas the
// way <body> elements are. This lesson goes deeper into that same head:
// <title> and favicon are now real, editable page settings (⚙ Page Settings
// in the toolbar) with graded challenges; charset and viewport stay
// conceptual, since this tool always emits sensible defaults for both and
// there's nothing to toggle.
const priorFold = computeSolvedFoldAtStep(htmlFoundationsTags, htmlFoundationsTags.steps.length - 1);

export const htmlDocumentHeadMeta: Lesson = {
  id: "html-document-head-meta",
  title: "Document Head & Meta",
  description: "title, meta charset, meta viewport, and favicon — the <head> content that was always there but never editable, until now.",
  topic: "html",
  unit: "Document Head & Meta",
  steps: [
    {
      id: "recap-page",
      title: "Back to the very first page you built",
      instructions: "\"What Is HTML?\" introduced the split between <head> (information ABOUT the page) and <body> (what a visitor sees). Time to actually use that head.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "title-purpose",
      title: "<title> is the single most-used piece of head content",
      instructions:
        "The text in a browser tab, the name a bookmark saves, the big blue link text in a search result — all three normally come straight from `<title>`. It's set for every page in this tool right now as a plain \"My Page\" — look at the Code panel's `<head>` and it's right there. A new ⚙ Page Settings control just appeared in the toolbar above; that's what actually changes it.",
      patch: {},
    },
    {
      id: "challenge-set-title",
      title: "Your turn: set a real title",
      instructions:
        "Open ⚙ Page Settings in the toolbar and set the Page title field to exactly: Alex Rivera — Portfolio",
      isChallenge: true,
      patch: {},
      hint: "Click \"⚙ Page Settings\" in the toolbar, then type exactly \"Alex Rivera — Portfolio\" (including the — dash) into the Page title field.",
      expectedPageTitle: "Alex Rivera — Portfolio",
      solutionPatch: { pageTitle: "Alex Rivera — Portfolio" },
    },
    {
      id: "meta-charset-deeper",
      title: "meta charset says how to decode every character on the page",
      instructions:
        "Text is stored as raw bytes underneath everything — `<meta charset=\"UTF-8\" />` tells the browser exactly which rulebook to use when turning those bytes back into actual letters. Get it wrong (or leave it out and let the browser guess) and the symptom is unmistakable: curly quotes, em dashes, and emoji turn into garbled mojibake, while plain English mostly still looks fine — which is exactly why it's easy to miss until a page has real content. UTF-8 covers essentially every character in every language in use today, which is why it's the universal default and why this tool always includes it, unconditionally, for every page.",
      patch: {},
    },
    {
      id: "meta-viewport-and-media-queries",
      title: "Without meta viewport, a phone lies to itself about its own width",
      instructions:
        "Responsive Design taught `@media (max-width: 600px)` — a rule that only applies below 600px wide. Here's the part that lesson skipped: without `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />`, a mobile browser doesn't measure its ACTUAL screen width at all — it renders the page at a fake, much wider virtual viewport (historically around 980px) and then shrinks the whole result to fit, the same way a desktop site looks tiny but intact on a phone with zooming disabled. A `max-width: 600px` media query would then basically never fire, because the browser never believes it's narrower than 980px in the first place. This tag is what makes \"the device's real width\" the number media queries actually see — and, like charset, this tool always includes it already.",
      patch: {},
    },
    {
      id: "favicon-concept",
      title: "A favicon is the one head element with no default at all",
      instructions:
        "The small icon next to a tab's title, or next to a bookmark, is the favicon — set with `<link rel=\"icon\" href=\"...\" />` in `<head>`. Unlike title (\"My Page\"), charset, and viewport, this tool has never generated any default for it — no icon at all, until one is set. The same ⚙ Page Settings control from the title challenge has a Favicon URL field for exactly this.",
      patch: {},
    },
    {
      id: "challenge-set-favicon",
      title: "Your turn: set a favicon",
      instructions:
        "A favicon's `href` doesn't have to point at a separate file on a server — a `data:` URL is a value that IS the image itself, encoded directly into the URL, needing nothing hosted anywhere. Paste this exact value into the Favicon URL field in ⚙ Page Settings:\n\ndata:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%230f172a' rx='3'/%3E%3C/svg%3E",
      isChallenge: true,
      patch: {},
      hint: "Copy the data: URL from the instructions exactly, including the %3C/%3E/%23 escape sequences, and paste it into the Favicon URL field.",
      expectedFaviconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%230f172a' rx='3'/%3E%3C/svg%3E",
      solutionPatch: { faviconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%230f172a' rx='3'/%3E%3C/svg%3E" },
    },
  ],
};
