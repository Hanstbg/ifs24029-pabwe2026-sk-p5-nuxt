import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import LoginPage from "./LoginPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as authApi from "../api/authApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

async function fillAndSubmit(wrapper: any, email: string, password: string) {
  await wrapper.find("#login-email-input").setValue(email);
  await wrapper.find("#login-password-input").setValue(password);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

describe("LoginPage", () => {
  beforeEach(() => vi.resetAllMocks());

  it("menampilkan form login", async () => {
    const { wrapper } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    expect(wrapper.text()).toContain("Alamat Email");
    expect(wrapper.text()).toContain("Kata Sandi");
    expect(wrapper.text()).toContain("Masuk Sekarang");
  });

  it("validasi: email kosong", async () => {
    const { wrapper } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    await fillAndSubmit(wrapper, "", "rahasia");
    expect(wrapper.text()).toContain("Email dan kata sandi wajib diisi");
    expect(authApi.postLogin).not.toHaveBeenCalled();
  });

  it("validasi: password kosong", async () => {
    const { wrapper } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    await fillAndSubmit(wrapper, "a@b.c", "");
    expect(wrapper.text()).toContain("Email dan kata sandi wajib diisi");
    expect(authApi.postLogin).not.toHaveBeenCalled();
  });

  it("login berhasil -> simpan token & pindah ke beranda", async () => {
    vi.mocked(authApi.postLogin).mockResolvedValue({ data: { token: "abc" } } as any);
    const { wrapper, router } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    await fillAndSubmit(wrapper, "a@b.c", "rahasia");
    expect(authApi.postLogin).toHaveBeenCalledWith({ email: "a@b.c", password: "rahasia" });
    expect(localStorage.getItem("delcom_token")).toBe("abc");
    expect(router.currentRoute.value.path).toBe("/");
    expect(wrapper.text()).not.toContain("wajib diisi");
  });

  it("login gagal -> tetap di halaman login", async () => {
    vi.mocked(authApi.postLogin).mockRejectedValue(new Error("Email atau sandi salah"));
    const { wrapper, router } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    await fillAndSubmit(wrapper, "a@b.c", "rahasia");
    expect(showErrorDialog).toHaveBeenCalledWith("Email atau sandi salah");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });
});