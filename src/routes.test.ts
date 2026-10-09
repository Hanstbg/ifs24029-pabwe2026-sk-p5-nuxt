import { describe, it, expect } from "vitest";
import { routes } from "./routes";

const collect = (list: any[]): any[] => list.flatMap((r) => [r, ...collect(r.children ?? [])]);

describe("routes", () => {
  it("semua komponen lazy-load berhasil di-import", async () => {
    const lazy = collect(routes).filter((r) => typeof r.component === "function");
    expect(lazy.length).toBeGreaterThan(5);
    for (const r of lazy) {
      const mod = await r.component();
      expect(mod.default).toBeDefined();
    }
  });

  it("rute /auth redirect ke /auth/login", () => {
    const auth = routes.find((r) => r.path === "/auth")!;
    expect(auth.children!.find((c) => c.path === "")!.redirect).toBe("/auth/login");
  });
});
