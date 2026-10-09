import { describe, it, expect, vi, beforeEach } from "vitest";
import { h } from "vue";
import { flushPromises } from "@vue/test-utils";
import DetailPage from "./DetailPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/cashFlowApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", async (orig) => ({
  ...(await orig<typeof import("../../../helpers/toolsHelper")>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const Stub = { render: () => h("div") };
const routes = [
  { path: "/cash-flows/:cashFlowId", component: Stub },
  { path: "/:pathMatch(.*)*", component: Stub },
];
const inflow = { id: 5, type: "inflow", source: "cash", label: "gaji", nominal: 5000000, description: "bulanan", created_at: "2026-10-01 08:00:00", updated_at: "2026-10-02 09:00:00" };
const outflow = { ...inflow, id: 6, type: "outflow", source: "savings", label: "makan", description: "" };

const render = (id = 5) => renderWithProviders(DetailPage, { route: `/cash-flows/${id}`, routes });
const clickBtn = (w: any, text: string) => w.findAll("button").find((b: any) => b.text().includes(text))!.trigger("click");

describe("DetailPage", () => {
  beforeEach(() => vi.resetAllMocks());

  it("menampilkan status memuat", async () => {
    vi.mocked(api.getCashFlow).mockReturnValue(new Promise(() => {}) as any);
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("Memuat...");
  });

  it("menampilkan pesan tidak ditemukan saat gagal", async () => {
    vi.mocked(api.getCashFlow).mockRejectedValue(new Error("404"));
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("Transaksi tidak ditemukan.");
  });

  it("menampilkan detail pemasukan", async () => {
    vi.mocked(api.getCashFlow).mockResolvedValue({ data: { cash_flow: inflow } } as any);
    const { wrapper } = await render();
    expect(api.getCashFlow).toHaveBeenCalledWith("5");
    expect(wrapper.text()).toContain("gaji");
    expect(wrapper.text()).toContain("Pemasukan");
    expect(wrapper.text()).toContain("Tunai");
    expect(wrapper.text()).toContain("bulanan");
    expect(wrapper.text()).toContain("5.000.000");
    expect(wrapper.find("p.text-3xl").classes()).toContain("text-emerald-600");
  });

  it("menampilkan detail pengeluaran tanpa deskripsi", async () => {
    vi.mocked(api.getCashFlow).mockResolvedValue({ data: { cash_flow: outflow } } as any);
    const { wrapper } = await render(6);
    expect(wrapper.text()).toContain("Pengeluaran");
    expect(wrapper.text()).toContain("Tabungan");
    expect(wrapper.find("p.text-3xl").classes()).toContain("text-rose-600");
    expect(wrapper.find("p.whitespace-pre-line").text()).toBe("-");
  });

  it("mengubah transaksi lewat modal lalu memuat ulang", async () => {
    vi.mocked(api.getCashFlow).mockResolvedValue({ data: { cash_flow: inflow } } as any);
    vi.mocked(api.putCashFlow).mockResolvedValue({ message: "ok" } as any);
    const { wrapper } = await render();
    expect(wrapper.text()).not.toContain("Ubah Arus Kas");
    await clickBtn(wrapper, "Ubah");
    expect(wrapper.text()).toContain("Ubah Arus Kas");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(api.putCashFlow).toHaveBeenCalledWith(5, expect.objectContaining({ label: "gaji", nominal: 5000000 }));
    expect(api.getCashFlow).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).not.toContain("Ubah Arus Kas");
  });

  it("menutup modal ubah lewat tombol Batal", async () => {
    vi.mocked(api.getCashFlow).mockResolvedValue({ data: { cash_flow: inflow } } as any);
    const { wrapper } = await render();
    await clickBtn(wrapper, "Ubah");
    await clickBtn(wrapper, "Batal");
    expect(wrapper.text()).not.toContain("Ubah Arus Kas");
  });

  it("hapus dibatalkan", async () => {
    vi.mocked(api.getCashFlow).mockResolvedValue({ data: { cash_flow: inflow } } as any);
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    const { wrapper, router } = await render();
    await clickBtn(wrapper, "Hapus");
    await flushPromises();
    expect(api.deleteCashFlow).not.toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe("/cash-flows/5");
  });

  it("hapus berhasil -> kembali ke beranda", async () => {
    vi.mocked(api.getCashFlow).mockResolvedValue({ data: { cash_flow: inflow } } as any);
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(api.deleteCashFlow).mockResolvedValue({ message: "ok" } as any);
    const { wrapper, router } = await render();
    await clickBtn(wrapper, "Hapus");
    await flushPromises();
    expect(api.deleteCashFlow).toHaveBeenCalledWith(5);
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("hapus gagal -> tetap di halaman detail", async () => {
    vi.mocked(api.getCashFlow).mockResolvedValue({ data: { cash_flow: inflow } } as any);
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(api.deleteCashFlow).mockRejectedValue(new Error("gagal"));
    const { wrapper, router } = await render();
    await clickBtn(wrapper, "Hapus");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/cash-flows/5");
  });
});
