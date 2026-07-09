import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Sixth HTML lesson — a fresh feedback form. html-lists-forms already
// covered <form>/<label>/<input> and the for/id link; this goes past plain
// text fields into the rest of what a real form needs: textarea, select/
// option, checkbox, radio (contrasted directly with checkbox), fieldset/
// legend, and the required attribute (contrasted with js-forms-validation's
// manual JS validation). One control type per step.
const LABEL_HIDDEN = { position: "absolute", width: "1px", height: "1px", overflow: "hidden" } as const;
const FIELD = { padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" };
const CHOICE_ROW = { display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px" };
const CHOICE_LABEL = { fontSize: "14px", color: "#334155" };

export const htmlFormsDeepDive: Lesson = {
  id: "html-forms-deep-dive",
  title: "Forms Deep Dive",
  description: "textarea, select/option, checkbox, radio, fieldset/legend, and required — one idea at a time.",
  topic: "html",
  unit: "Forms Deep Dive",
  steps: [
    {
      id: "textarea-for-longer-text",
      title: "<input> is one line; <textarea> is many",
      instructions:
        "`<input type=\"text\">` only ever holds a single line — try to type a second line into one and nothing happens. Any time an answer might run longer than a few words (feedback, a comment, an address), `<textarea>` is the right tag: it wraps text across multiple lines and can be resized. Below is the start of a feedback form: an `<h1>`, a `<form>` wrapping everything, and a `<textarea>` for the actual message.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Send Us Feedback", {}, { fontSize: "26px", margin: "0 0 16px", color: "#0f172a" }),
          el("feedback-form", "form", null, 1, "", {}, { display: "flex", flexDirection: "column", gap: "4px", maxWidth: "360px" }),
          el("msg-label", "label", "feedback-form", 0, "Your feedback", { for: "feedback-msg" }, LABEL_HIDDEN),
          el("feedback-msg", "textarea", "feedback-form", 1, "", { id: "feedback-msg", placeholder: "What's on your mind?", rows: "4" }, { ...FIELD, marginBottom: "12px", fontFamily: "inherit", resize: "vertical" }),
        ],
      },
    },
    {
      id: "select-dropdown",
      title: "<select> + <option>: choosing from a fixed list",
      instructions:
        "When there's a short, fixed set of valid answers — not open-ended text — `<select>` gives a dropdown of choices instead. Each choice inside it is its own `<option>`; the text between an `<option>`'s tags is what the visitor sees in the list. A dropdown for the feedback's topic makes sense here: there's a small, known set of topics, not infinite free text.",
      patch: {
        elements: [
          el("topic-label", "label", "feedback-form", 2, "Topic", { for: "topic" }, LABEL_HIDDEN),
          el("topic", "select", "feedback-form", 3, "", { id: "topic" }, { ...FIELD, marginBottom: "12px" }),
          el("topic-billing", "option", "topic", 0, "Billing", { value: "billing" }, {}),
          el("topic-support", "option", "topic", 1, "Support", { value: "support" }, {}),
          el("topic-other", "option", "topic", 2, "Other", { value: "other" }, {}),
        ],
      },
    },
    {
      id: "challenge-add-an-option",
      title: "Your turn: add a fourth option",
      instructions:
        "Add one more `<option>` to the Topic dropdown: \"Feature Request\", right after \"Other\".",
      isChallenge: true,
      patch: {},
      hint: "Same shape as the other three: a new <option> as a child of the <select>, with the visitor-facing text \"Feature Request\".",
      expected: [
        { tag: "h1" },
        {
          tag: "form",
          children: [
            { tag: "label" }, { tag: "textarea" }, { tag: "label" },
            { tag: "select", children: [{ tag: "option" }, { tag: "option" }, { tag: "option" }, { tag: "option" }] },
          ],
        },
      ],
      solutionPatch: {
        elements: [
          el("topic-feature", "option", "topic", 3, "Feature Request", { value: "feature" }, {}),
        ],
      },
    },
    {
      id: "checkbox-independent-choice",
      title: "<input type=\"checkbox\">: an independent yes/no",
      instructions:
        "A checkbox has no `placeholder` to lean on the way a text field does, so its label needs to actually be visible — not hidden the way the labels above are. Its `checked` attribute (true or not present at all) is completely independent of every other field on the page: checking it doesn't affect anything else.",
      patch: {
        elements: [
          el("subscribe-row", "div", "feedback-form", 4, "", {}, CHOICE_ROW),
          el("subscribe", "input", "subscribe-row", 0, "", { id: "subscribe", type: "checkbox" }, {}),
          el("subscribe-label", "label", "subscribe-row", 1, "Subscribe to updates", { for: "subscribe" }, CHOICE_LABEL),
        ],
      },
    },
    {
      id: "radio-mutually-exclusive",
      title: "<input type=\"radio\">: only one at a time, IF they share a name",
      instructions:
        "A radio button looks similar to a checkbox but means something different: several radios that all share the exact same `name` attribute become a single mutually-exclusive group — selecting one automatically deselects every other radio with that same name. Three radios below, all `name=\"satisfaction\"`, are three answers to one question; a visitor can pick exactly one.",
      patch: {
        elements: [
          el("sat-good-row", "div", "feedback-form", 5, "", {}, CHOICE_ROW),
          el("sat-good", "input", "sat-good-row", 0, "", { id: "sat-good", type: "radio", name: "satisfaction", value: "good" }, {}),
          el("sat-good-label", "label", "sat-good-row", 1, "Good", { for: "sat-good" }, CHOICE_LABEL),
          el("sat-neutral-row", "div", "feedback-form", 6, "", {}, CHOICE_ROW),
          el("sat-neutral", "input", "sat-neutral-row", 0, "", { id: "sat-neutral", type: "radio", name: "satisfaction", value: "neutral" }, {}),
          el("sat-neutral-label", "label", "sat-neutral-row", 1, "Neutral", { for: "sat-neutral" }, CHOICE_LABEL),
          el("sat-poor-row", "div", "feedback-form", 7, "", {}, CHOICE_ROW),
          el("sat-poor", "input", "sat-poor-row", 0, "", { id: "sat-poor", type: "radio", name: "satisfaction", value: "poor" }, {}),
          el("sat-poor-label", "label", "sat-poor-row", 1, "Poor", { for: "sat-poor" }, CHOICE_LABEL),
        ],
      },
    },
    {
      id: "fieldset-legend-grouping",
      title: "<fieldset> + <legend>: labeling the WHOLE group",
      instructions:
        "Each radio already has its own `<label>` (\"Good\", \"Neutral\", \"Poor\") — but nothing so far names the QUESTION they're all answering. `<fieldset>` wraps a group of related controls, and `<legend>` — its very first child — labels the group as a whole; a screen reader announces the legend before it announces any control inside the fieldset. The three satisfaction rows move inside a `<fieldset>` now, with a `<legend>` naming the question.",
      patch: {
        elements: [
          el("satisfaction-group", "fieldset", "feedback-form", 5, "", {}, { border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px 12px", marginBottom: "12px" }),
          el("satisfaction-legend", "legend", "satisfaction-group", 0, "How satisfied are you?", {}, { fontSize: "13px", fontWeight: "600", color: "#0f172a", padding: "0 4px" }),
          el("sat-good-row", "div", "satisfaction-group", 1, "", {}, CHOICE_ROW),
          el("sat-neutral-row", "div", "satisfaction-group", 2, "", {}, CHOICE_ROW),
          el("sat-poor-row", "div", "satisfaction-group", 3, "", {}, CHOICE_ROW),
        ],
      },
    },
    {
      id: "required-native-validation",
      title: "required: the browser validates this one, no JS needed",
      instructions:
        "Adding the `required` attribute to a field tells the BROWSER itself to block form submission until that field has a value — showing its own built-in error bubble, with zero JavaScript written for it. That's different from `js-forms-validation`'s empty/length checks, which were written by hand in JS; `required` is the same idea, but built into HTML for the simplest case. The feedback message becomes required.",
      patch: {
        elements: [
          el("feedback-msg", "textarea", "feedback-form", 1, "", { id: "feedback-msg", placeholder: "What's on your mind?", rows: "4", required: "true" }, { ...FIELD, marginBottom: "12px", fontFamily: "inherit", resize: "vertical" }),
        ],
      },
    },
    {
      id: "challenge-required-checkbox",
      title: "Your turn: a required checkbox",
      instructions:
        "Add one more field: a checkbox labeled \"I agree to be contacted about this feedback\", marked `required` — same shape as the Subscribe checkbox (a visible label, no fieldset needed for just one control), but the browser should now block submission until it's checked.",
      isChallenge: true,
      patch: {},
      hint: "A <div> containing an <input type=\"checkbox\" required> and a visible <label> — same pair shape as \"Subscribe to updates\", just with the required attribute added to the input.",
      expected: [
        { tag: "h1" },
        {
          tag: "form",
          children: [
            { tag: "label" }, { tag: "textarea" }, { tag: "label" }, { tag: "select" },
            { tag: "div" }, { tag: "fieldset" }, { tag: "div" },
          ],
        },
      ],
      solutionPatch: {
        elements: [
          el("agree-row", "div", "feedback-form", 6, "", {}, CHOICE_ROW),
          el("agree", "input", "agree-row", 0, "", { id: "agree", type: "checkbox", required: "true" }, {}),
          el("agree-label", "label", "agree-row", 1, "I agree to be contacted about this feedback", { for: "agree" }, CHOICE_LABEL),
        ],
      },
    },
    {
      id: "submit-button",
      title: "Put it together: a Submit button",
      instructions:
        "One last piece, nothing new: a `<button type=\"submit\">` at the end of the form. Clicking it (or pressing Enter in any field) tries to submit — and now the browser will block that submission on its own if the message or the agreement checkbox is still empty.",
      patch: {
        elements: [
          el("submit-btn", "button", "feedback-form", 7, "Submit", { type: "submit" }, { padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px", marginTop: "4px", alignSelf: "flex-start" }),
        ],
      },
    },
  ],
};
