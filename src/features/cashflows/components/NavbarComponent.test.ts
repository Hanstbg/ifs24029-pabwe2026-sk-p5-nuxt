import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import NavbarComponent from "./NavbarComponent.vue";
import { renderWithProviders } from "../../../test-utils";
import { useUsersStore } from "../../users/states/usersStore";
import * as authApi from "../../auth/api/authApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../../auth/api/authApi");
vi.mock("../../../helpers/toolsHelper", async (orig) => ({
  ...(await orig<typeof import("../../../helpers/toolsHelper")>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const profile = { name: "Budi", email: "budi@del.ac.id", photo: "/p.png" };

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authApi.postLogout).mockResolvedValue({} as any);
  });

  it("tanpa profil: hanya brand dan tombol keluar", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(wrapper.find("img").exists()).toBe(false);
    expect((wrapper.vm as any).username).toBe("");
  });

  it("dengan profil: menampilkan nama, username, dan foto", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent, {
      beforeMount: (pinia) => { (useUsersStore(pinia) as any).profile = profile; },
    });
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("@budi");
    expect(wrapper.find("img").attributes("src")).toBe("https://open-api.delcom.org/p.png");
  });

  it("profil tanpa email -> username kosong", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent, {
      beforeMount: (pinia) => { (useUsersStore(pinia) as any).profile = { name: "X", photo: "" }; },
    });
    expect((wrapper.vm as any).username).toBe("");
    expect(wrapper.text()).toContain("@");
  });

  it("tombol menu memicu event toggle", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    await wrapper.find('button[aria-label="Menu"]').trigger("click");
    expect(wrapper.emitted("toggle")).toHaveLength(1);
  });

  it("logout dibatalkan", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    const { wrapper, router } = await renderWithProviders(NavbarComponent, { route: "/profile" });
    await wrapper.find("button.btn-ghost").trigger("click");
    await flushPromises();
    expect(authApi.postLogout).not.toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe("/profile");
  });

  it("logout dikonfirmasi -> hapus token dan ke halaman login", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    localStorage.setItem("delcom_token", "t");
    const { wrapper, router } = await renderWithProviders(NavbarComponent, { route: "/profile" });
    await wrapper.find("button.btn-ghost").trigger("click");
    await flushPromises();
    expect(authApi.postLogout).toHaveBeenCalled();
    expect(localStorage.getItem("delcom_token")).toBeNull();
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });
});
