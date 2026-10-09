import { apiFetch } from "../../../helpers/apiHelper";

export interface CashFlowPayload {
  type: "inflow" | "outflow";
  source: "cash" | "savings" | "loans";
  label: string;
  nominal: number;
  description: string;
}

export const getCashFlows = (params: Record<string, any> = {}) => apiFetch("/cash-flows", { params });
export const getCashFlow = (id: number | string) => apiFetch(`/cash-flows/${id}`);
export const postCashFlow = (p: CashFlowPayload) => apiFetch("/cash-flows", { method: "POST", body: p });
export const putCashFlow = (id: number | string, p: CashFlowPayload) => apiFetch(`/cash-flows/${id}`, { method: "PUT", body: p });
export const deleteCashFlow = (id: number | string) => apiFetch(`/cash-flows/${id}`, { method: "DELETE" });
export const getLabels = () => apiFetch("/cash-flows/labels");
export const getStatsDaily = (params: Record<string, any> = {}) => apiFetch("/cash-flows/stats/daily", { params });
export const getStatsMonthly = (params: Record<string, any> = {}) => apiFetch("/cash-flows/stats/monthly", { params });
export const deleteAllCashFlows = () => apiFetch("/cash-flows", { method: "DELETE" });
