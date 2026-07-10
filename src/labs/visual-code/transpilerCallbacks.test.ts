// Tests for the callback/chaining/element-property additions to the
// TypeScript engine (blocks.ts / transpiler.ts / types.ts). Deliberately a
// separate file, explicit .ts extensions on every import: this directory
// also has a parallel legacy JS engine (transpiler.js etc.) with the same
// bare module names — transpiler.test.js's `from "./transpiler"` actually
// resolves to that legacy file, not this one, so a bare-specifier import
// here would silently test the wrong engine.

import { describe, expect, it } from "vitest";
import { createBlock, blockDefinition, canContainChildren, childOptionsFor } from "./blocks.ts";
import { transpileProject, normalizeProject } from "./transpiler.ts";
import type { Block, Project } from "./types.ts";

function withBlocks(blocks: Block[]): Project {
  return normalizeProject({
    schemaVersion: 2,
    id: "test",
    name: "Test",
    target: "javascript",
    files: [{ id: "f1", name: "main.js", blocks }],
    activeFileId: "f1",
    html: "",
  });
}

function block(type: Block["type"], fields: Record<string, string>, children: Block[] = []): Block {
  const base = createBlock(type);
  return { ...base, fields: { ...base.fields, ...fields }, children };
}

describe("forEachItem", () => {
  it("renders a .forEach with the item param and body", () => {
    const b = block("forEachItem", { list: "players", itemParam: "player" }, [
      block("log", { expression: "player.name" }),
    ]);
    const { code, diagnostics } = transpileProject(withBlocks([b]));
    expect(diagnostics).toEqual([]);
    expect(code).toBe('players.forEach((player) => {\n  console.log(player.name);\n});');
  });
});

describe("transformList", () => {
  it("renders a const-assigned .map with a return in the body", () => {
    const b = block("transformList", { list: "prices", outputName: "withTax", itemParam: "price" }, [
      block("return", { expression: "price * 1.08" }),
    ]);
    const { code } = transpileProject(withBlocks([b]));
    expect(code).toBe('const withTax = prices.map((price) => {\n  return price * 1.08;\n});');
  });

  it("falls back to returning the item unchanged when no children are added yet", () => {
    const b = block("transformList", { list: "prices", outputName: "withTax", itemParam: "price" });
    const { code } = transpileProject(withBlocks([b]));
    expect(code).toContain("return price;");
  });
});

describe("filterList", () => {
  it("renders a const-assigned .filter with a return in the body", () => {
    const b = block("filterList", { list: "players", outputName: "active", itemParam: "player" }, [
      block("return", { expression: "player.score > 0" }),
    ]);
    const { code } = transpileProject(withBlocks([b]));
    expect(code).toBe('const active = players.filter((player) => {\n  return player.score > 0;\n});');
  });
});

describe("whenReady + chainStep", () => {
  it("renders a single .then() chain", () => {
    const chainStep = block("chainStep", { kind: "then", paramName: "data" }, [
      block("log", { expression: "data" }),
    ]);
    const b = block("whenReady", { value: "fetch(url)" }, [chainStep]);
    const { code } = transpileProject(withBlocks([b]));
    expect(code).toBe('fetch(url)\n  .then((data) => {\n    console.log(data);\n  });');
  });

  it("chains a Then and a Catch step in order, explicitly", () => {
    const thenStep = block("chainStep", { kind: "then", paramName: "data" }, [
      block("log", { expression: "data" }),
    ]);
    const catchStep = block("chainStep", { kind: "catch", paramName: "error" }, [
      block("log", { expression: "error" }),
    ]);
    const b = block("whenReady", { value: "fetch(url)" }, [thenStep, catchStep]);
    const { code } = transpileProject(withBlocks([b]));
    expect(code).toBe(
      'fetch(url)\n  .then((data) => {\n    console.log(data);\n  })\n  .catch((error) => {\n    console.log(error);\n  });',
    );
  });

  it("warns instead of producing a broken chain when no steps have been added yet", () => {
    const b = block("whenReady", { value: "fetch(url)" });
    const { code, diagnostics } = transpileProject(withBlocks([b]));
    expect(code).toBe("fetch(url);");
    expect(diagnostics[0]?.level).toBe("warning");
  });
});

describe("callWithCallback", () => {
  it("renders the outer call with the callback param and body", () => {
    const b = block("callWithCallback", { fn: "setTimeout", paramName: "done" }, [
      block("log", { expression: "done" }),
    ]);
    const { code } = transpileProject(withBlocks([b]));
    expect(code).toBe('setTimeout((done) => {\n  console.log(done);\n});');
  });

  it("falls back to a placeholder param name when left blank, rather than producing invalid syntax", () => {
    const b = block("callWithCallback", { fn: "setTimeout", paramName: "" });
    const { code, diagnostics } = transpileProject(withBlocks([b]));
    expect(code).toContain("setTimeout((value) => {");
    expect(diagnostics[0]?.level).toBe("warning");
  });
});

describe("child containment — chainStep only lives inside whenReady", () => {
  it("whenReady's only addable child type is chainStep", () => {
    const options = childOptionsFor("whenReady");
    expect(options.map((o) => o.type)).toEqual(["chainStep"]);
  });

  it("no other block type offers chainStep as an addable child", () => {
    for (const type of ["function", "if", "loop", "event", "forEachItem", "transformList", "filterList", "callWithCallback"] as const) {
      const options = childOptionsFor(type);
      expect(options.map((o) => o.type)).not.toContain("chainStep");
    }
  });

  it("if/loop still can't nest themselves, but can now contain the 5 new callback blocks", () => {
    expect(canContainChildren("if")).toBe(true);
    const ifOptions = childOptionsFor("if").map((o) => o.type);
    expect(ifOptions).not.toContain("if");
    expect(ifOptions).toContain("forEachItem");
    expect(ifOptions).toContain("whenReady");

    const loopOptions = childOptionsFor("loop").map((o) => o.type);
    expect(loopOptions).not.toContain("loop");
    expect(loopOptions).toContain("transformList");
  });

  it("chainStep is flagged childOnly — real incident: it was freely addable from the top-level palette, producing a meaningless top-level block that silently generated nothing", () => {
    expect(blockDefinition("chainStep")?.childOnly).toBe(true);
    for (const type of ["forEachItem", "transformList", "filterList", "whenReady", "callWithCallback"] as const) {
      expect(blockDefinition(type)?.childOnly).toBeFalsy();
    }
  });

  it("every new block type is registered and has a real concept entry, not just a fallback", () => {
    for (const type of ["forEachItem", "transformList", "filterList", "whenReady", "chainStep", "callWithCallback"] as const) {
      const def = blockDefinition(type);
      expect(def).not.toBeNull();
      expect(def!.concept.why).not.toBe("");
    }
  });
});
