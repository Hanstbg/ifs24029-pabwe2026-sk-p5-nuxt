import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import HomePage from "./HomePage.vue";
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

const rows = [
  { id: 1, type: "inflow", source: "cash", label: "gaji", nominal: 5000000, description: "", created_at: "2026-10-01 08:00:00", updated_at: "2026-10-01 08:00:00" },
  { id: 2, type: "outflow", source: "savings", label: "makan", nominal: 25000, description: "x", created_at: "2026-10-02 08:00:00", updated_at: "2026-10-02 08:00:00" },
];
const stats = { cashflow: 4975000, total_inflow: 5000000, total_outflow: 25000, total_inflow_cash: 5000000, total_outflow_savings: 25000 };
const daily = { stats_inflow: { "01/10/2026": 500, "02/10/2026": 0 }, stats_outflow: { "01/10/2026": 0, "02/10/2026": 250 }, stats_cashflow: {} };

const calls = () => vi.mocked(api.getCashFlows).mock.calls.length;
const lastParams = () => vi.mocked(api.getCashFlows).mock.lastCall![0];
const clickBtn = (w: any, text: string) => w.findAll("button").find((b: any) => b.text().includes(text))!.trigger("click");

function mockOk(over: { rows?: any[]; daily?: any } = {}) {
  vi.mocked(api.getCashFlows).mockResolvedValue({ data: { cash_flows: over.rows ?? rows, stats } } as any);
  vi.mocked(api.getStatsDaily).mockResolvedValue({ data: "daily" in over ? over.daily : daily } as any);
  vi.mocked(api.getLabels).mockResolvedValue({ data: { labels: ["gaji", "makan"] } } as any);
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockOk();
  });

  it("memuat data awal dengan filter kosong", async () => {
    await renderWithProviders(HomePage);
    expect(api.getCashFlows).toHaveBeenCalledWith({ type: "", source: "", label: "", start_date: "", end_date: "" });
    expect(api.getStatsDaily).toHaveBeenCalled();
    expect(api.getLabels).toHaveBeenCalled();
  });

  it("menampilkan kartu ringkasan dan tabel transaksi", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).toContain("Total Saldo Kas Bersih");
    expect(wrapper.text()).toContain("4.975.000");
    expect(wrapper.findAll("tbody tr")).toHaveLength(2);
    expect(wrapper.text()).toContain("Pemasukan");
    expect(wrapper.text()).toContain("Pengeluaran");
    expect(wrapper.text()).toContain("Tunai");
    expect(wrapper.text()).toContain("Tabungan");
    expect(wrapper.find('a[aria-label="Detail"]').attributes("href")).toBe("/cash-flows/1");
  });

  it("menampilkan grafik statistik harian", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).toContain("Statistik Harian");
    expect(wrapper.text()).toContain("01/10");
    expect(wrapper.text()).toContain("02/10");
  });

  it("tanpa statistik harian grafik disembunyikan", async () => {
    mockOk({ daily: null });
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).not.toContain("Statistik Harian");
  });

  it("menampilkan status kosong", async () => {
    mockOk({ rows: [] });
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).toContain("Belum ada transaksi.");
    expect(wrapper.find("table").exists()).toBe(false);
  });

  it("menampilkan status memuat selama semua request berjalan", async () => {
    const pending = () => new Promise(() => {}) as any;
    vi.mocked(api.getCashFlows).mockReturnValue(pending());
    vi.mocked(api.getStatsDaily).mockReturnValue(pending());
    vi.mocked(api.getLabels).mockReturnValue(pending());
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).toContain("Memuat...");
  });

  it("mengubah filter memuat ulang data dengan parameter yang benar", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    await wrapper.find("#f-type").setValue("inflow");
    await flushPromises();
    expect(lastParams()).toMatchObject({ type: "inflow" });
    await wrapper.find("#f-source").setValue("cash");
    await flushPromises();
    expect(lastParams()).toMatchObject({ type: "inflow", source: "cash" });
    await wrapper.find("#f-label").setValue("gaji");
    await flushPromises();
    expect(lastParams()).toMatchObject({ label: "gaji" });
    await wrapper.find("#f-start").setValue("2026-10-01");
    await wrapper.find("#f-end").setValue("2026-10-31");
    await flushPromises();
    expect(lastParams()).toMatchObject({ start_date: "2026-10-01 00:00:00", end_date: "2026-10-31 23:59:59" });
  });

  it("menambah transaksi lewat modal lalu memuat ulang", async () => {
    vi.mocked(api.postCashFlow).mockResolvedValue({ message: "ok" } as any);
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).not.toContain("Catat Arus Kas");
    await clickBtn(wrapper, "Tambah Transaksi");
    expect(wrapper.text()).toContain("Catat Arus Kas");
    const before = calls();
    await wrapper.find("#label").setValue("bonus");
    await wrapper.find("#nominal").setValue("1000");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(api.postCashFlow).toHaveBeenCalled();
    expect(calls()).toBe(before + 1);
    expect(wrapper.text()).not.toContain("Catat Arus Kas");
  });

  it("menutup modal tambah dengan tombol Batal", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    await clickBtn(wrapper, "Tambah Transaksi");
    await clickBtn(wrapper, "Batal");
    expect(wrapper.text()).not.toContain("Catat Arus Kas");
  });

  it("mengubah transaksi lewat modal lalu memuat ulang", async () => {
    vi.mocked(api.putCashFlow).mockResolvedValue({ message: "ok" } as any);
    const { wrapper } = await renderWithProviders(HomePage);
    await wrapper.find('button[aria-label="Ubah"]').trigger("click");
    expect(wrapper.text()).toContain("Ubah Arus Kas");
    expect((wrapper.find("#label").element as HTMLInputElement).value).toBe("gaji");
    const before = calls();
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(api.putCashFlow).toHaveBeenCalledWith(1, expect.objectContaining({ label: "gaji" }));
    expect(calls()).toBe(before + 1);
    expect(wrapper.text()).not.toContain("Ubah Arus Kas");
  });

  it("menutup modal ubah dengan tombol Batal", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    await wrapper.find('button[aria-label="Ubah"]').trigger("click");
    await clickBtn(wrapper, "Batal");
    expect(wrapper.text()).not.toContain("Ubah Arus Kas");
  });

  it("hapus transaksi: dibatalkan, berhasil, dan gagal", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    const del = () => wrapper.find('button[aria-label="Hapus"]').trigger("click");

    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    await del(); await flushPromises();
    expect(api.deleteCashFlow).not.toHaveBeenCalled();

    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(api.deleteCashFlow).mockRejectedValue(new Error("gagal"));
    let before = calls();
    await del(); await flushPromises();
    expect(calls()).toBe(before);

    vi.mocked(api.deleteCashFlow).mockResolvedValue({ message: "ok" } as any);
    before = calls();
    await del(); await flushPromises();
    expect(api.deleteCashFlow).toHaveBeenLastCalledWith(1);
    expect(calls()).toBe(before + 1);
  });

  it("reset semua: dibatalkan, gagal, dan berhasil", async () => {
    const { wrapper } = await renderWithProviders(HomePage);

    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    await clickBtn(wrapper, "Reset Semua"); await flushPromises();
    expect(api.deleteAllCashFlows).not.toHaveBeenCalled();

    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(api.deleteAllCashFlows).mockRejectedValue(new Error("gagal"));
    let before = calls();
    await clickBtn(wrapper, "Reset Semua"); await flushPromises();
    expect(calls()).toBe(before);

    vi.mocked(api.deleteAllCashFlows).mockResolvedValue({ message: "ok" } as any);
    before = calls();
    const labelCalls = vi.mocked(api.getLabels).mock.calls.length;
    await clickBtn(wrapper, "Reset Semua"); await flushPromises();
    expect(calls()).toBe(before + 1);
    expect(vi.mocked(api.getLabels).mock.calls.length).toBe(labelCalls + 1);
  });
});
