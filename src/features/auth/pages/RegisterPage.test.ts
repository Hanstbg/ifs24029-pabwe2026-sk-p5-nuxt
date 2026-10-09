import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import RegisterPage from "./RegisterPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as authApi from "../api/authApi";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

async function fillAndSubmit(wrapper: any, v: { name?: string; email?: string; password?: string; confirm?: string }) {
  await wrapper.find("#name").setValue(v.name ?? "");
  await wrapper.find("#email").setValue(v.email ?? "");
  await wrapper.find("#password").setValue(v.password ?? "");
  await wrapper.find("#confirm").setValue(v.confirm ?? "");
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

describe("RegisterPage", () => {
  beforeEach(() => vi.resetAllMocks());

  it("validasi: kolom wajib kosong (nama / email / password)", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    await fillAndSubmit(wrapper, { email: "a@b.c", password: "123456", confirm: "123456" });
    expect(wrapper.text()).toContain("Semua kolom wajib diisi");
    await fillAndSubmit(wrapper, { name: "A", password: "123456", confirm: "123456" });
    expect(wrapper.text()).toContain("Semua kolom wajib diisi");
    await fillAndSubmit(wrapper, { name: "A", email: "a@b.c" });
    expect(wrapper.text()).toContain("Semua kolom wajib diisi");
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("validasi: password kurang dari 6 karakter", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    await fillAndSubmit(wrapper, { name: "A", email: "a@b.c", password: "123", confirm: "123" });
    expect(wrapper.text()).toContain("Kata sandi minimal 6 karakter");
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("validasi: konfirmasi tidak cocok", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    await fillAndSubmit(wrapper, { name: "A", email: "a@b.c", password: "123456", confirm: "654321" });
    expect(wrapper.text()).toContain("Konfirmasi kata sandi tidak cocok");
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("registrasi berhasil -> pindah ke login", async () => {
    vi.mocked(authApi.postRegister).mockResolvedValue({ message: "ok" } as any);
    const { wrapper, router } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    await fillAndSubmit(wrapper, { name: "A", email: "a@b.c", password: "123456", confirm: "123456" });
    expect(authApi.postRegister).toHaveBeenCalledWith({ name: "A", email: "a@b.c", password: "123456" });
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("registrasi gagal -> tetap di halaman register", async () => {
    vi.mocked(authApi.postRegister).mockRejectedValue(new Error("Email dipakai"));
    const { wrapper, router } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    await fillAndSubmit(wrapper, { name: "A", email: "a@b.c", password: "123456", confirm: "123456" });
    expect(router.currentRoute.value.path).toBe("/auth/register");
  });
});
