import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readJson(path: string) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

describe("package.json", () => {
  it("is an ES module package", async () => {
    const pkg = await readJson("../package.json");

    expect(pkg.type).toBe("module");
  });

  it("defines the project scripts", async () => {
    const pkg = await readJson("../package.json");

    expect(pkg.scripts).toMatchObject({
      dev: "tsx watch src/index.ts",
      build: "tsc",
      start: "node dist/index.js",
      test: "vitest run",
      "test:watch": "vitest",
      validate: "npm run build && npm test",
    });
  });
});

describe("tsconfig.json", () => {
  it("leaves test files out of the build", async () => {
    const tsconfig = await readJson("../tsconfig.json");

    expect(tsconfig.exclude).toEqual(
      expect.arrayContaining(["src/**/*.test.ts", "src/**/*.test.tsx"]),
    );
  });
});
