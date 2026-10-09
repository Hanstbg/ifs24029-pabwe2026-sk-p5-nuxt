import { describe, it, expect, beforeEach } from "vitest";
import { createMemoryHistory } from "vue-router";
import { authGuard, createAppRouter } from "./router";
import { putAccessToken } from "./helpers/apiHelper";

describe("router guard", () => {
  beforeEach(() => localStorage.clear());

  it("authGuard", () => {
    expect(authGuard({ meta: { auth: true } })).toBe("/auth/login");
    expect(authGuard({ meta: {} })).toBeUndefined();
    putAccessToken("t");
    expect(authGuard({ meta: { guest: true } })).toBe("/");
  });

  it("router mengarahkan sesuai status login", async () => {
    const r = createAppRouter(createMemoryHistory());
    await r.push("/");
    expect(r.currentRoute.value.path).toBe("/auth/login");
    putAccessToken("t");
    const r2 = createAppRouter(createMemoryHistory());
    await r2.push("/auth/login");
    expect(r2.currentRoute.value.path).toBe("/");
  });
});
