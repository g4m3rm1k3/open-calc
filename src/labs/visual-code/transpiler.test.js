import { describe, expect, it } from "vitest";
import { DEFAULT_PROJECT, cloneProject, parseProject, serializeProject, transpileProject } from "./transpiler";

describe("visual code transpiler", () => {
  it("generates JavaScript classes and program blocks", () => {
    const result = transpileProject(cloneProject(DEFAULT_PROJECT));

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("class Player");
    expect(result.code).toContain("constructor(name)");
    expect(result.code).toContain("get label()");
    expect(result.code).toContain('const player = new Player("Ada");');
    expect(result.code).toContain("document.querySelector(\"#scoreButton\")?.addEventListener(\"click\"");
    expect(result.code).toContain("player.addScore(1)");
  });

  it("reports invalid identifiers without throwing", () => {
    const project = cloneProject(DEFAULT_PROJECT);
    project.blocks[0].fields.name = "not valid";

    const result = transpileProject(project);

    expect(result.code).toContain("class UnnamedClass");
    expect(result.diagnostics[0].message).toContain("not a valid JavaScript identifier");
  });

  it("round trips portable project JSON", () => {
    const project = cloneProject(DEFAULT_PROJECT);
    project.name = "Portable Demo";

    const parsed = parseProject(serializeProject(project));

    expect(parsed.name).toBe("Portable Demo");
    expect(parsed.blocks[0].children.length).toBeGreaterThan(2);
    expect(transpileProject(parsed).diagnostics).toEqual([]);
  });
});
