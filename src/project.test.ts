import { readdir, readFile } from "node:fs/promises";
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
      build: "tsc -p tsconfig.build.json",
      start: "node dist/index.js",
      test: "vitest run",
      "test:watch": "vitest",
      validate: "tsc --noEmit && npm run build && npm test",
    });
  });
});

describe("TypeScript config", () => {
  it("type-checks the test files", async () => {
    const tsconfig = await readJson("../tsconfig.json");

    expect(tsconfig.include).toEqual(["src"]);
    expect(tsconfig.exclude).toBeUndefined();
  });

  it("leaves test files out of the build", async () => {
    const build = await readJson("../tsconfig.build.json");

    expect(build.extends).toBe("./tsconfig.json");
    expect(build.compilerOptions).toMatchObject({ rootDir: "src", outDir: "dist" });
    expect(build.exclude).toEqual(
      expect.arrayContaining(["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"]),
    );
  });

  it("needs no JSX pragma in test files", async () => {
    const src = new URL("./", import.meta.url);
    const testFiles = (await readdir(src, { recursive: true })).filter((file) =>
      /\.test\.tsx?$/.test(file),
    );

    expect(testFiles.length).toBeGreaterThan(0);
    for (const file of testFiles) {
      const source = await readFile(new URL(file.replaceAll("\\", "/"), src), "utf8");
      expect(source, file).not.toMatch(/^\/\*\*\s*@jsxImportSource/m);
    }
  });
});
