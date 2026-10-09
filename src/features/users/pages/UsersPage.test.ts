import { describe, it, expect, vi, beforeEach } from "vitest";
import UsersPage from "./UsersPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/userApi";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (orig) => ({
  ...(await orig<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("UsersPage", () => {
  beforeEach(() => vi.resetAllMocks());

  it("menampilkan status memuat selama request berjalan", async () => {
    vi.mocked(api.getUsers).mockReturnValue(new Promise(() => {}) as any);
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.text()).toContain("Memuat...");
  });

  it("menampilkan daftar pengguna", async () => {
    vi.mocked(api.getUsers).mockResolvedValue({
      data: { users: [
        { id: 1, name: "Budi", email: "budi@del.ac.id", photo: "/b.png" },
        { id: 2, name: "Sari", email: "sari@del.ac.id", photo: null },
      ] },
    } as any);
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.text()).toContain("Daftar Pengguna");
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("sari@del.ac.id");
    expect(wrapper.findAll("img")).toHaveLength(2);
    expect(wrapper.text()).not.toContain("Memuat...");
  });
});
