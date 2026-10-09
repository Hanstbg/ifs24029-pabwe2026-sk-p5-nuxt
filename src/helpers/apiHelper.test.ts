import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, getAccessToken, putAccessToken, removeAccessToken } from "./apiHelper";

const respond = (json) => vi.fn().mockResolvedValue({ json: () => Promise.resolve(json) });

describe("apiHelper", () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it("menyimpan dan menghapus token", () => {
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("mengirim Authorization, query params, dan JSON body", async () => {
    putAccessToken("tok");
    globalThis.fetch = respond({ status: "success", data: 1 });
    await apiFetch("/x", { method: "POST", body: { a: 1 }, params: { is_me: 1, kosong: "", n: null } });
    const [url, opt] = fetch.mock.calls[0];
    expect(String(url)).toBe("https://open-api.delcom.org/api/v1/x?is_me=1");
    expect(opt.headers.Authorization).toBe("Bearer tok");
    expect(opt.headers["Content-Type"]).toBe("application/json");
    expect(opt.body).toBe('{"a":1}');
  });

  it("FormData tanpa Content-Type, auth=false tanpa token, GET tanpa body", async () => {
    putAccessToken("tok");
    globalThis.fetch = respond({ status: "success" });
    const form = new FormData();
    await apiFetch("/f", { method: "POST", body: form, auth: false });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
    expect(fetch.mock.calls[0][1].headers["Content-Type"]).toBeUndefined();
    expect(fetch.mock.calls[0][1].body).toBe(form);
    await apiFetch("/g");
    expect(fetch.mock.calls[1][1].body).toBeUndefined();
  });

  it("melempar error dengan message & data saat gagal", async () => {
    globalThis.fetch = respond({ status: "fail", message: "Salah", data: { field: ["x"] } });
    await expect(apiFetch("/x")).rejects.toMatchObject({ message: "Salah", data: { field: ["x"] } });
    globalThis.fetch = respond({ status: "fail" });
    await expect(apiFetch("/x")).rejects.toThrow("Terjadi kesalahan");
    globalThis.fetch = vi.fn().mockResolvedValue({ json: () => Promise.reject(new Error("x")) });
    await expect(apiFetch("/x")).rejects.toThrow("Respons server tidak valid");
  });
});
