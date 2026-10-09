import { describe, it, expect } from "vitest";
import AuthLayout from "./AuthLayout.vue";
import { renderWithProviders } from "../../../test-utils";

describe("AuthLayout", () => {
  it("menampilkan branding, tab login/register, dan slot rute", async () => {
    const { wrapper } = await renderWithProviders(AuthLayout, { route: "/auth/login" });
    expect(wrapper.text()).toContain("Delcom Cash Flow");
    const links = wrapper.findAll("a");
    expect(links.map((a) => a.attributes("href"))).toEqual(["/auth/login", "/auth/register"]);
    expect(wrapper.text()).toContain("Masuk Akun");
    expect(wrapper.text()).toContain("Daftar Baru");
    expect(wrapper.find('[data-testid="route-stub"]').exists()).toBe(true);
  });
});
