import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPinia } from "../../../test-utils";
import { useCashFlowsStore, toStats } from "./cashFlowsStore";
import * as api from "../api/cashFlowApi";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));
const m = (fn: any) => fn as ReturnType<typeof vi.fn>;

describe("cashFlowsStore", () => {
  let store: ReturnType<typeof useCashFlowsStore>;
  beforeEach(() => { vi.resetAllMocks(); createMockPinia(); store = useCashFlowsStore(); });

  it("toStats menghitung saldo per sumber", () => {
    expect(toStats(undefined).cash).toBe(0);
    const s = toStats({ cashflow: 5, total_inflow: 9, total_outflow: 4, total_inflow_cash: 10, total_outflow_cash: 3, total_inflow_savings: 2, total_outflow_loans: 1 });
    expect(s).toMatchObject({ cashflow: 5, cash: 7, savings: 2, loans: -1 });
  });

  it("mengambil list, detail, label, statistik", async () => {
    m(api.getCashFlows).mockResolvedValue({ data: { cash_flows: [{ id: 1 }], stats: { total_inflow: 3 } } });
    await store.asyncGetCashFlows({ type: "inflow" });
    expect(store.cashFlows).toHaveLength(1);
    expect(store.stats.total_inflow).toBe(3);
    m(api.getCashFlow).mockResolvedValue({ data: { cash_flow: { id: 2 } } });
    expect(await store.asyncGetCashFlow(2)).toBe(true);
    m(api.getLabels).mockResolvedValue({ data: { labels: ["gaji"] } });
    await store.asyncGetLabels();
    expect(store.labels).toEqual(["gaji"]);
    m(api.getStatsDaily).mockResolvedValue({ data: { stats_inflow: {} } });
    m(api.getStatsMonthly).mockResolvedValue({ data: { stats_inflow: {} } });
    await store.asyncGetStatsDaily(); await store.asyncGetStatsMonthly();
    expect(store.statsDaily).not.toBeNull();
    expect(store.statsMonthly).not.toBeNull();
  });

  it("gagal mengambil data tidak mengubah state", async () => {
    m(api.getCashFlow).mockRejectedValue(new Error("x"));
    expect(await store.asyncGetCashFlow(1)).toBe(false);
    expect(store.cashFlow).toBeNull();
  });

  it("mutasi", async () => {
    const ok = { message: "ok" };
    m(api.postCashFlow).mockResolvedValue(ok); m(api.putCashFlow).mockResolvedValue(ok);
    m(api.deleteCashFlow).mockResolvedValue(ok); m(api.deleteAllCashFlows).mockResolvedValue(ok);
    const p: any = {};
    expect(await store.asyncAddCashFlow(p)).toBe(true);
    expect(await store.asyncChangeCashFlow(1, p)).toBe(true);
    expect(await store.asyncDeleteCashFlow(1)).toBe(true);
    expect(await store.asyncDeleteAllCashFlows()).toBe(true);
    expect(store.isCashFlowAdded && store.isCashFlowDeletedAll).toBe(true);
    m(api.postCashFlow).mockRejectedValue(new Error("gagal"));
    expect(await store.asyncAddCashFlow(p)).toBe(false);
  });
  it("semua aksi ambil data gagal tidak mengubah state", async () => {
    const err = new Error("gagal");
    m(api.getCashFlows).mockRejectedValue(err);
    m(api.getLabels).mockRejectedValue(err);
    m(api.getStatsDaily).mockRejectedValue(err);
    m(api.getStatsMonthly).mockRejectedValue(err);
    await store.asyncGetCashFlows();
    await store.asyncGetLabels();
    await store.asyncGetStatsDaily();
    await store.asyncGetStatsMonthly();
    expect(store.cashFlows).toEqual([]);
    expect(store.labels).toEqual([]);
    expect(store.statsDaily).toBeNull();
    expect(store.statsMonthly).toBeNull();
  });

  it("mutasi gagal untuk change, delete, dan delete all", async () => {
    const err = new Error("gagal");
    m(api.putCashFlow).mockRejectedValue(err);
    m(api.deleteCashFlow).mockRejectedValue(err);
    m(api.deleteAllCashFlows).mockRejectedValue(err);
    expect(await store.asyncChangeCashFlow(1, {} as any)).toBe(false);
    expect(await store.asyncDeleteCashFlow(1)).toBe(false);
    expect(await store.asyncDeleteAllCashFlows()).toBe(false);
  });
});
