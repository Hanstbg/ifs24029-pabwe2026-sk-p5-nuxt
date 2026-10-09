import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import * as api from "./cashFlowApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ status: "success" }) }));

const payload: api.CashFlowPayload = { type: "inflow", source: "cash", label: "gaji", nominal: 100, description: "d" };

describe("cashFlowApi", () => {
  beforeEach(() => vi.mocked(apiFetch).mockClear());

  it("getCashFlows (dengan & tanpa params)", async () => {
    await api.getCashFlows({ type: "inflow" });
    expect(apiFetch).toHaveBeenLastCalledWith("/cash-flows", { params: { type: "inflow" } });
    await api.getCashFlows();
    expect(apiFetch).toHaveBeenLastCalledWith("/cash-flows", { params: {} });
  });

  it("getCashFlow", async () => {
    await api.getCashFlow(7);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/7");
  });

  it("postCashFlow", async () => {
    await api.postCashFlow(payload);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows", { method: "POST", body: payload });
  });

  it("putCashFlow", async () => {
    await api.putCashFlow(7, payload);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/7", { method: "PUT", body: payload });
  });

  it("deleteCashFlow", async () => {
    await api.deleteCashFlow(7);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/7", { method: "DELETE" });
  });

  it("getLabels", async () => {
    await api.getLabels();
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/labels");
  });

  it("getStatsDaily & getStatsMonthly (dengan & tanpa params)", async () => {
    await api.getStatsDaily({ a: 1 });
    expect(apiFetch).toHaveBeenLastCalledWith("/cash-flows/stats/daily", { params: { a: 1 } });
    await api.getStatsDaily();
    expect(apiFetch).toHaveBeenLastCalledWith("/cash-flows/stats/daily", { params: {} });
    await api.getStatsMonthly({ b: 2 });
    expect(apiFetch).toHaveBeenLastCalledWith("/cash-flows/stats/monthly", { params: { b: 2 } });
    await api.getStatsMonthly();
    expect(apiFetch).toHaveBeenLastCalledWith("/cash-flows/stats/monthly", { params: {} });
  });

  it("deleteAllCashFlows", async () => {
    await api.deleteAllCashFlows();
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows", { method: "DELETE" });
  });
});
