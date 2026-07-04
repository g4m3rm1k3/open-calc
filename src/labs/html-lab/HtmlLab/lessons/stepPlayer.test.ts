import { describe, it, expect } from "vitest";
import { buildPlaybackFrames, frameRevealedIds, describeFrameTransition } from "./stepPlayer";
import { applyPatch } from "./lessonEngine";
import { initialState } from "../labReducer";
import type { LabElement } from "./lessonTypes";

function el(id: string, tag: string, parentId: string | null, order: number, content = "", styles: Record<string, string> = {}): LabElement {
  return { id, tag, parentId, order, content, attrs: { id: "", class: "" }, styles, mediaQueries: [] };
}

describe("buildPlaybackFrames", () => {
  it("emits one frame per inserted element, in patch order", () => {
    const frames = buildPlaybackFrames(initialState, {
      elements: [el("a", "div", null, 0), el("b", "p", "a", 0), el("c", "span", null, 1)],
    });
    expect(frames.map((f) => f.elements.map((e) => e.id))).toEqual([
      ["a"],
      ["a", "b"],
      ["a", "b", "c"],
    ]);
  });

  it("last frame always equals applyPatch(prev, patch) exactly", () => {
    const prev = { ...initialState, elements: [el("a", "div", null, 0)] };
    const patch = {
      elements: [el("b", "p", null, 1)],
      bodyStyles: { color: "red", margin: "0" },
      javascript: "console.log('hi')",
    };
    const frames = buildPlaybackFrames(prev, patch);
    const expected = applyPatch(prev, patch);
    const last = frames[frames.length - 1];
    expect(last.elements).toEqual(expected.elements);
    expect(last.bodyStyles).toEqual(expected.bodyStyles);
    expect(last.javascript).toBe(expected.javascript);
  });

  it("chunks a javascript string into multiple growing-prefix frames, ending at the full text", () => {
    const prev = { ...initialState, javascript: "" };
    const target = "function greet() {\n  alert('hello there, friend');\n}\ngreet();";
    const frames = buildPlaybackFrames(prev, { javascript: target });
    expect(frames.length).toBeGreaterThan(1);
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i].javascript.length).toBeGreaterThan(frames[i - 1].javascript.length);
    }
    expect(frames[frames.length - 1].javascript).toBe(target);
  });

  it("only animates the appended suffix when prior code is a prefix of the target", () => {
    const prev = { ...initialState, javascript: "const x = 1;" };
    const target = "const x = 1;\nconst y = 2;\nconst z = 3;";
    const frames = buildPlaybackFrames(prev, { javascript: target });
    for (const f of frames) {
      expect(f.javascript.startsWith("const x = 1;")).toBe(true);
    }
    expect(frames[frames.length - 1].javascript).toBe(target);
  });

  it("emits one frame per changed bodyStyles key, skipping unchanged ones", () => {
    const prev = { ...initialState, bodyStyles: { color: "black", margin: "0" } };
    const frames = buildPlaybackFrames(prev, { bodyStyles: { color: "white", margin: "0", padding: "8px" } });
    expect(frames).toHaveLength(2); // margin unchanged, color + padding changed
    expect(frames[frames.length - 1].bodyStyles).toEqual({ color: "white", margin: "0", padding: "8px" });
  });

  it("a patch with no actual change still lands on a valid final frame", () => {
    const prev = { ...initialState, elements: [el("a", "div", null, 0)] };
    const frames = buildPlaybackFrames(prev, {});
    expect(frames.length).toBeGreaterThanOrEqual(1);
    expect(frames[frames.length - 1].elements).toEqual(prev.elements);
  });

  it("reveals JavaScript exactly one line at a time, not arbitrary character chunks", () => {
    const prev = { ...initialState, javascript: "" };
    const target = "function greet() {\n  alert('hi');\n}\ngreet();"; // 4 lines
    const frames = buildPlaybackFrames(prev, { javascript: target });
    expect(frames.map((f) => f.javascript.split("\n").length)).toEqual([1, 2, 3, 4]);
    expect(frames[frames.length - 1].javascript).toBe(target);
  });

  it("a single changed line lands in one frame instead of being split into arbitrary character chunks", () => {
    const prev = { ...initialState, javascript: "const a = 1;\nconst b = 2;" };
    const target = "const a = 1;\nconst b = 3;"; // line 2 changed, line 1 identical
    const frames = buildPlaybackFrames(prev, { javascript: target });
    expect(frames).toEqual([{ ...prev, javascript: target }]);
  });
});

describe("describeFrameTransition", () => {
  it("describes a new top-level element", () => {
    const prev = { ...initialState, elements: [] };
    const frames = buildPlaybackFrames(prev, { elements: [el("nav", "nav", null, 0)] });
    expect(describeFrameTransition(prev, frames[0])).toBe("Adding <nav>");
  });

  it("describes a new nested element, naming its parent", () => {
    const prev = { ...initialState, elements: [el("nav", "nav", null, 0)] };
    const frames = buildPlaybackFrames(prev, { elements: [el("link", "a", "nav", 0)] });
    expect(describeFrameTransition(prev, frames[0])).toBe("Adding <a> inside <nav>");
  });

  it("describes a restyle of an existing element as an update, not an add", () => {
    const prev = { ...initialState, elements: [el("nav", "nav", null, 0, "", { color: "blue" })] };
    const frames = buildPlaybackFrames(prev, { elements: [el("nav", "nav", null, 0, "", { color: "red" })] });
    expect(describeFrameTransition(prev, frames[0])).toBe("Updating <nav>'s styles");
  });

  it("describes a javascript text frame and a customCss text frame distinctly", () => {
    const prevJs = { ...initialState, javascript: "" };
    const jsFrames = buildPlaybackFrames(prevJs, { javascript: "doThing();" });
    expect(describeFrameTransition(prevJs, jsFrames[0])).toBe("Typing the JavaScript");

    const prevCss = { ...initialState, customCss: "" };
    const cssFrames = buildPlaybackFrames(prevCss, { customCss: ".a { color: red; }" });
    expect(describeFrameTransition(prevCss, cssFrames[0])).toBe("Writing the CSS");
  });
});

describe("frameRevealedIds", () => {
  it("identifies the single element id added between two frames", () => {
    const frames = buildPlaybackFrames(initialState, {
      elements: [el("a", "div", null, 0), el("b", "p", null, 1)],
    });
    expect(frameRevealedIds(initialState, frames[0])).toEqual(["a"]);
    expect(frameRevealedIds(frames[0], frames[1])).toEqual(["b"]);
  });

  it("returns an empty list for text-only frame transitions", () => {
    const prev = { ...initialState, javascript: "" };
    const frames = buildPlaybackFrames(prev, { javascript: "const a = 1;\nconst b = 2;" });
    expect(frameRevealedIds(prev, frames[0])).toEqual([]);
  });

  it("identifies a restyled element (same id, new object) as revealed", () => {
    const prev = { ...initialState, elements: [el("a", "div", null, 0, "", { color: "blue" })] };
    const frames = buildPlaybackFrames(prev, { elements: [el("a", "div", null, 0, "", { color: "red" })] });
    expect(frameRevealedIds(prev, frames[0])).toEqual(["a"]);
  });
});
