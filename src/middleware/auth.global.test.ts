import { describe, it, expect, vi, beforeEach } from "vitest";
import { putAccessToken } from "../helpers/apiHelper";

const navigateTo = vi.fn((path: string) => `redirect:${path}`);
vi.stubGlobal("defineNuxtRouteMiddleware", (fn: unknown) => fn);
vi.stubGlobal("navigateTo", navigateTo);

const { default: middleware } = (await import("./auth.global")) as any;

describe("auth.global middleware", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateTo.mockClear();
  });

  it("mengarahkan ke login jika rute butuh auth dan belum login", () => {
    expect(middleware({ meta: { auth: true } })).toBe("redirect:/auth/login");
    expect(navigateTo).toHaveBeenCalledWith("/auth/login");
  });

  it("tidak melakukan apa-apa jika boleh lewat", () => {
    expect(middleware({ meta: {} })).toBeUndefined();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it("mengarahkan user yang sudah login keluar dari halaman guest", () => {
    putAccessToken("t");
    expect(middleware({ meta: { guest: true } })).toBe("redirect:/");
  });
});
