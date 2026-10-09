import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPinia } from "../../../test-utils";
import { useAuthStore } from "./authStore";
import * as api from "../api/authApi";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

describe("authStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    createMockPinia();
  });

  it("mengambil token awal dari localStorage", () => {
    localStorage.setItem("delcom_token", "awal");
    createMockPinia();
    expect(useAuthStore().token).toBe("awal");
  });

  it("asyncLogin berhasil menyimpan token", async () => {
    vi.mocked(api.postLogin).mockResolvedValue({ data: { token: "abc" } } as any);
    const store = useAuthStore();
    expect(await store.asyncLogin({ email: "a", password: "b" })).toBe(true);
    expect(store.token).toBe("abc");
    expect(localStorage.getItem("delcom_token")).toBe("abc");
    expect(store.isAuthLogin).toBe(true);
    expect(store.isLoading).toBe(false);
  });

  it("asyncLogin gagal", async () => {
    vi.mocked(api.postLogin).mockRejectedValue(new Error("salah"));
    const store = useAuthStore();
    expect(await store.asyncLogin({ email: "a", password: "b" })).toBe(false);
    expect(store.token).toBeNull();
    expect(store.isAuthLogin).toBe(false);
  });

  it("asyncRegister berhasil & gagal", async () => {
    const store = useAuthStore();
    vi.mocked(api.postRegister).mockResolvedValue({ message: "ok" } as any);
    expect(await store.asyncRegister({ name: "n", email: "e", password: "p" })).toBe(true);
    expect(store.isAuthRegister).toBe(true);
    vi.mocked(api.postRegister).mockRejectedValue(new Error("x"));
    expect(await store.asyncRegister({ name: "n", email: "e", password: "p" })).toBe(false);
    expect(store.isAuthRegister).toBe(false);
  });

  it("asyncLogout menghapus token (request sukses)", async () => {
    localStorage.setItem("delcom_token", "t");
    createMockPinia();
    const store = useAuthStore();
    vi.mocked(api.postLogout).mockResolvedValue({} as any);
    expect(await store.asyncLogout()).toBe(true);
    expect(store.token).toBeNull();
    expect(localStorage.getItem("delcom_token")).toBeNull();
    expect(store.isAuthLogout).toBe(true);
    expect(store.isAuthLogin).toBe(false);
  });

  it("asyncLogout tetap menghapus token walau request gagal", async () => {
    localStorage.setItem("delcom_token", "t");
    createMockPinia();
    const store = useAuthStore();
    vi.mocked(api.postLogout).mockRejectedValue(new Error("offline"));
    expect(await store.asyncLogout()).toBe(true);
    expect(localStorage.getItem("delcom_token")).toBeNull();
  });
});
