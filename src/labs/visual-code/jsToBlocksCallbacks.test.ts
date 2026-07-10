// Tests for the forEach/map/filter and then/catch-chain import matchers
// added to jsToBlocks.ts, alongside transpilerCallbacks.test.ts's forward
// (blocks -> JS) coverage of the same block types. Explicit .ts import for
// the same reason as transpilerCallbacks.test.ts — a bare specifier in this
// directory can resolve to the parallel legacy JS engine instead.

import { describe, expect, it } from "vitest";
import { parseJsToBlocks } from "./jsToBlocks.ts";

describe("forEach / map / filter import", () => {
  it("recognises a forEach with an inline arrow-with-block-body callback", () => {
    const [b] = parseJsToBlocks("players.forEach((player) => {\n  console.log(player);\n});");
    expect(b.type).toBe("forEachItem");
    expect(b.fields.list).toBe("players");
    expect(b.fields.itemParam).toBe("player");
    expect(b.children).toHaveLength(1);
    expect(b.children[0].type).toBe("log");
  });

  it("recognises a map assigned to a new variable", () => {
    const [b] = parseJsToBlocks("const withTax = prices.map((price) => {\n  return price * 1.08;\n});");
    expect(b.type).toBe("transformList");
    expect(b.fields.list).toBe("prices");
    expect(b.fields.outputName).toBe("withTax");
    expect(b.fields.itemParam).toBe("price");
    expect(b.children[0].type).toBe("return");
  });

  it("recognises a filter assigned to a new variable", () => {
    const [b] = parseJsToBlocks("const active = players.filter((player) => {\n  return player.score > 0;\n});");
    expect(b.type).toBe("filterList");
    expect(b.fields.outputName).toBe("active");
  });

  it("falls back to a generic call for a callback that isn't an inline arrow with a block body", () => {
    const [b] = parseJsToBlocks("players.forEach(logPlayer);");
    expect(b.type).toBe("call");
  });
});

describe("then/catch chain import", () => {
  it("recognises a single .then() step", () => {
    const [b] = parseJsToBlocks('fetch(url).then((data) => {\n  console.log(data);\n});');
    expect(b.type).toBe("whenReady");
    expect(b.fields.value).toBe("fetch(url)");
    expect(b.children).toHaveLength(1);
    expect(b.children[0].type).toBe("chainStep");
    expect(b.children[0].fields.kind).toBe("then");
    expect(b.children[0].fields.paramName).toBe("data");
  });

  it("recognises a Then followed by a Catch, in order", () => {
    const code = 'fetch(url).then((data) => {\n  console.log(data);\n}).catch((error) => {\n  console.log(error);\n});';
    const [b] = parseJsToBlocks(code);
    expect(b.type).toBe("whenReady");
    expect(b.children.map((c) => c.fields.kind)).toEqual(["then", "catch"]);
  });

  it("falls back to a generic call when .then() isn't given an inline arrow with a block body", () => {
    const [b] = parseJsToBlocks("fetch(url).then(handleData);");
    expect(b.type).toBe("call");
  });
});
