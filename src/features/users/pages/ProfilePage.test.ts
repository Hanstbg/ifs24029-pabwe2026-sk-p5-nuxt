import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ProfilePage from "./ProfilePage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/userApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (orig) => ({
  ...(await orig<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const user = { id: 1, name: "Budi", email: "budi@del.ac.id", photo: "/p.png" };
const val = (w: any, sel: string) => (w.find(sel).element as HTMLInputElement).value;

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getMe).mockResolvedValue({ data: { user } } as any);
  });

  it("memuat profil ke dalam form dan menampilkan foto", async () => {
    const { wrapper } = await renderWithProviders(ProfilePage);
    expect(api.getMe).toHaveBeenCalled();
    expect(val(wrapper, "#name")).toBe("Budi");
    expect(val(wrapper, "#email")).toBe("budi@del.ac.id");
    expect(wrapper.find("img").attributes("src")).toBe("https://open-api.delcom.org/p.png");
  });

  it("menyimpan data akun lalu memuat ulang profil", async () => {
    vi.mocked(api.putMe).mockResolvedValue({ message: "ok" } as any);
    const { wrapper } = await renderWithProviders(ProfilePage);
    await wrapper.find("#name").setValue("Budi Baru");
    await wrapper.find("#email").setValue("baru@del.ac.id");
    await wrapper.findAll("form")[0].trigger("submit");
    await flushPromises();
    expect(api.putMe).toHaveBeenCalledWith({ name: "Budi Baru", email: "baru@del.ac.id" });
    expect(api.getMe).toHaveBeenCalledTimes(2);
  });

  it("mengganti foto saat file dipilih", async () => {
    vi.mocked(api.postPhoto).mockResolvedValue({ message: "ok" } as any);
    const { wrapper } = await renderWithProviders(ProfilePage);
    const file = new File(["x"], "a.png", { type: "image/png" });
    const input = wrapper.find("#photo");
    Object.defineProperty(input.element, "files", { value: [file], configurable: true });
    await input.trigger("change");
    await flushPromises();
    expect(api.postPhoto).toHaveBeenCalledWith(file);
  });

  it("tidak melakukan apa-apa jika tidak ada file dipilih", async () => {
    const { wrapper } = await renderWithProviders(ProfilePage);
    const input = wrapper.find("#photo");
    Object.defineProperty(input.element, "files", { value: [], configurable: true });
    await input.trigger("change");
    expect(api.postPhoto).not.toHaveBeenCalled();
  });

  it("ubah password: konfirmasi tidak cocok", async () => {
    const { wrapper } = await renderWithProviders(ProfilePage);
    await wrapper.find("#old").setValue("lama");
    await wrapper.find("#new").setValue("baru123");
    await wrapper.find("#confirm").setValue("beda");
    await wrapper.findAll("form")[1].trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok");
    expect(api.putPassword).not.toHaveBeenCalled();
  });

  it("ubah password berhasil mengosongkan field", async () => {
    vi.mocked(api.putPassword).mockResolvedValue({ message: "ok" } as any);
    const { wrapper } = await renderWithProviders(ProfilePage);
    await wrapper.find("#old").setValue("lama");
    await wrapper.find("#new").setValue("baru123");
    await wrapper.find("#confirm").setValue("baru123");
    await wrapper.findAll("form")[1].trigger("submit");
    await flushPromises();
    expect(api.putPassword).toHaveBeenCalledWith({ password: "lama", new_password: "baru123", new_password_confirmation: "baru123" });
    expect(val(wrapper, "#old")).toBe("");
    expect(val(wrapper, "#new")).toBe("");
    expect(val(wrapper, "#confirm")).toBe("");
  });

  it("ubah password gagal mempertahankan field", async () => {
    vi.mocked(api.putPassword).mockRejectedValue(new Error("sandi salah"));
    const { wrapper } = await renderWithProviders(ProfilePage);
    await wrapper.find("#old").setValue("lama");
    await wrapper.find("#new").setValue("baru123");
    await wrapper.find("#confirm").setValue("baru123");
    await wrapper.findAll("form")[1].trigger("submit");
    await flushPromises();
    expect(val(wrapper, "#old")).toBe("lama");
  });
});
