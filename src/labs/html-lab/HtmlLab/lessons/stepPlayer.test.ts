import { describe, it, expect } from "vitest";
import { buildPlaybackFrames } from "./stepPlayer";
import { applyPatch, type Fold } from "./lessonEngine";
import { initialState } from "../labReducer";
import type { LabElement } from "./lessonTypes";

function el(id: string, tag: string, parentId: string | null, order: number, content = "", styles: Record<string, string> = {}): LabElement {
  return { id, tag, parentId, order, content, attrs: { id: "", class: "" }, styles, mediaQueries: [] };
}

function fold(overrides: Partial<typeof initialState> = {}): Fold {
  return { state: { ...initialState, ...overrides }, blocks: new Map(), cssBlocks: new Map() };
}

describe("buildPlaybackFrames — elements", () => {
  it("emits one frame per inserted element, in patch order, each self-describing", () => {
    const frames = buildPlaybackFrames(fold(), {
      elements: [el("a", "div", null, 0), el("b", "p", "a", 0), el("c", "span", null, 1)],
    });
    expect(frames.map((f) => f.state.elements.map((e) => e.id))).toEqual([
      ["a"],
      ["a", "b"],
      ["a", "b", "c"],
    ]);
    expect(frames.map((f) => f.revealedIds)).toEqual([["a"], ["b"], ["c"]]);
    expect(frames[0].caption).toBe("Adding <div>");
    expect(frames[1].caption).toBe("Adding <p> inside <div>");
  });

  it("last frame always equals applyPatch(prev, patch) exactly", () => {
    const prev = fold({ elements: [el("a", "div", null, 0)] });
    const patch = {
      elements: [el("b", "p", null, 1)],
      bodyStyles: { color: "red", margin: "0" },
      jsBlocks: [{ id: "log", code: "console.log('hi')" }],
    };
    const frames = buildPlaybackFrames(prev, patch);
    const expected = applyPatch(prev.state, { ...patch, javascript: undefined });
    const last = frames[frames.length - 1].state;
    expect(last.elements).toEqual(expected.elements);
    expect(last.bodyStyles).toEqual(expected.bodyStyles);
    expect(last.javascript).toBe("console.log('hi')");
  });

  it("restyling an existing element is captioned as an update, not an add, and reveals just that id", () => {
    const prev = fold({ elements: [el("nav", "nav", null, 0, "", { color: "blue" })] });
    const frames = buildPlaybackFrames(prev, { elements: [el("nav", "nav", null, 0, "", { color: "red" })] });
    expect(frames).toHaveLength(1);
    expect(frames[0].caption).toBe("Updating <nav>'s styles");
    expect(frames[0].revealedIds).toEqual(["nav"]);
  });

  it("a patch with no actual change still lands on a valid final frame", () => {
    const prev = fold({ elements: [el("a", "div", null, 0)] });
    const frames = buildPlaybackFrames(prev, {});
    expect(frames.length).toBeGreaterThanOrEqual(1);
    expect(frames[frames.length - 1].state.elements).toEqual(prev.state.elements);
  });
});

describe("buildPlaybackFrames — jsBlocks/cssBlocks", () => {
  it("real incident this replaces: adding ONE block never re-reveals other, unrelated blocks", () => {
    // This is the actual bug that shipped: a step edited the middle of one
    // giant hand-typed script string, and a text-diff treated everything
    // after the edit as new, dumping ~80 unrelated, unchanged lines back at
    // the student. With named blocks there is nothing to diff — the patch
    // only ever lists the ONE block that changed, so only one frame appears
    // regardless of how much other code already exists.
    const priorFold: Fold = {
      state: { ...initialState, javascript: "function first() {\n  doOneThing();\n}\n\nfunction second() {\n  doAnotherThing();\n}" },
      blocks: new Map([
        ["first", "function first() {\n  doOneThing();\n}"],
        ["second", "function second() {\n  doAnotherThing();\n}"],
      ]),
      cssBlocks: new Map(),
    };
    const frames = buildPlaybackFrames(priorFold, {
      jsBlocks: [{ id: "first", code: "function first() {\n  doOneThing();\n  doNewThing();\n}" }],
    });
    expect(frames).toHaveLength(1);
    expect(frames[0].state.javascript).toContain("function second()"); // untouched block still present
    expect(frames[0].state.javascript).toContain("doNewThing");
    expect(frames[0].caption).toBe("Typing: function first() {");
  });

  it("adding a new block joins it after existing blocks and reveals in one frame", () => {
    const priorFold: Fold = {
      state: { ...initialState, javascript: "const a = 1;" },
      blocks: new Map([["decl", "const a = 1;"]]),
      cssBlocks: new Map(),
    };
    const frames = buildPlaybackFrames(priorFold, {
      jsBlocks: [{ id: "handler", code: "doThing();" }],
    });
    expect(frames).toHaveLength(1);
    expect(frames[0].state.javascript).toBe("const a = 1;\n\ndoThing();");
  });

  it("cssBlocks behave the same way as jsBlocks, independently", () => {
    const priorFold: Fold = {
      state: { ...initialState, customCss: ".a { color: red; }" },
      blocks: new Map(),
      cssBlocks: new Map([["a", ".a { color: red; }"]]),
    };
    const frames = buildPlaybackFrames(priorFold, {
      cssBlocks: [{ id: "b", code: ".b { color: blue; }" }],
    });
    expect(frames).toHaveLength(1);
    expect(frames[0].state.customCss).toBe(".a { color: red; }\n\n.b { color: blue; }");
    expect(frames[0].caption).toBe("Writing: .b { color: blue; }");
  });

  it("legacy whole-script `javascript` patch (no jsBlocks) still lands in one frame", () => {
    const frames = buildPlaybackFrames(fold(), { javascript: "console.log('one-off');" });
    expect(frames).toHaveLength(1);
    expect(frames[0].state.javascript).toBe("console.log('one-off');");
  });
});

describe("buildPlaybackFrames — bodyStyles", () => {
  it("emits one frame per changed bodyStyles key, skipping unchanged ones", () => {
    const prev = fold({ bodyStyles: { color: "black", margin: "0" } });
    const frames = buildPlaybackFrames(prev, { bodyStyles: { color: "white", margin: "0", padding: "8px" } });
    expect(frames).toHaveLength(2); // margin unchanged, color + padding changed
    expect(frames[frames.length - 1].state.bodyStyles).toEqual({ color: "white", margin: "0", padding: "8px" });
  });
});
