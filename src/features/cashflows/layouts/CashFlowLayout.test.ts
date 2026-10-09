import { describe, it, expect, vi, beforeEach } from "vitest";
import CashFlowLayout from "./CashFlowLayout.vue";
import { renderWithProviders } from "../../../test-utils";
import * as userApi from "../../users/api/userApi";

vi.mock("../../users/api/userApi");
vi.mock("../../../helpers/toolsHelper", async (orig) => ({
  ...(await orig<typeof import("../../../helpers/toolsHelper")>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("CashFlowLayout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(userApi.getMe).mockResolvedValue({ data: { user: { name: "Budi", email: "b@x.id", photo: "" } } } as any);
  });

  it("memuat profil saat mounted dan merender navbar, sidebar, serta RouterView", async () => {
    const { wrapper } = await renderWithProviders(CashFlowLayout);
    expect(userApi.getMe).toHaveBeenCalledTimes(1);
    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find("aside").exists()).toBe(true);
    expect(wrapper.find('[data-testid="route-stub"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Budi");
  });

  it("tombol menu membuka lalu overlay menutup sidebar", async () => {
    const { wrapper } = await renderWithProviders(CashFlowLayout);
    expect(wrapper.find(".fixed.inset-0").exists()).toBe(false);
    await wrapper.find('button[aria-label="Menu"]').trigger("click");
    expect(wrapper.find(".fixed.inset-0").exists()).toBe(true);
    await wrapper.find(".fixed.inset-0").trigger("click");
    expect(wrapper.find(".fixed.inset-0").exists()).toBe(false);
  });
});
