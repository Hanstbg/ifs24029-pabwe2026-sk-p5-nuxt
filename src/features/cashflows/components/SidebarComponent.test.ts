import { describe, it, expect } from "vitest";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

describe("SidebarComponent", () => {
  it("menampilkan tiga menu navigasi", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: false } });
    expect(wrapper.findAll("a").map((a) => a.attributes("href"))).toEqual(["/", "/users", "/profile"]);
    expect(wrapper.text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.text()).toContain("Direktori Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("overlay hanya muncul saat open dan menutup saat diklik", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: false } });
    expect(wrapper.find(".fixed.inset-0").exists()).toBe(false);
    expect(wrapper.find("aside").classes()).not.toContain("translate-x-0");
    await wrapper.setProps({ open: true });
    expect(wrapper.find("aside").classes()).toContain("translate-x-0");
    await wrapper.find(".fixed.inset-0").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("mengklik menu memicu event close", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    await wrapper.findAll("a")[1].trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });
});
