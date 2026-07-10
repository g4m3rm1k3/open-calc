import { describe, expect, it } from "vitest";
import { EXPRESSION_LIBRARY } from "./jsExpressionLibrary";

describe("getElementProperty", () => {
  const template = EXPRESSION_LIBRARY.find((t) => t.id === "getElementProperty")!;

  it("exists and is a dom-group template", () => {
    expect(template).toBeTruthy();
    expect(template.group).toBe("dom");
  });

  it("composes object.property from its two params", () => {
    expect(template.build({ object: "document.querySelector('#agree')", property: "checked" }))
      .toBe("document.querySelector('#agree').checked");
  });

  it("supports an already-captured variable as the object, not just a fresh selector lookup", () => {
    expect(template.build({ object: "input", property: "value" })).toBe("input.value");
  });

  it("falls back to sensible defaults when params are blank", () => {
    expect(template.build({})).toBe("element.textContent");
  });

  it("has a domProperty-kind property param, not plain text — the whole point is a picker, not typing", () => {
    const propertyParam = template.params.find((p) => p.name === "property");
    expect(propertyParam?.kind).toBe("domProperty");
  });
});
