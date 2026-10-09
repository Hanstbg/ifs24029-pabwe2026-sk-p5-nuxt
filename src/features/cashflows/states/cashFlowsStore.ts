import { ref } from "vue";
import { defineStore } from "pinia";
import * as api from "../api/cashFlowApi";
import { runAction } from "../../../helpers/storeHelper";

export interface CashFlow {
  id: number;
  user_id: number;
  type: "inflow" | "outflow";
  source: "cash" | "savings" | "loans";
  label: string;
  description: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

export interface CashFlowStats {
  cashflow: number;
  total_inflow: number;
  total_outflow: number;
  cash: number;
  savings: number;
  loans: number;
}

export interface CashFlowQueryParams {
  type?: "inflow" | "outflow" | "";
  source?: "cash" | "savings" | "loans" | "";
  label?: string;
  start_date?: string;
  end_date?: string;
}

export type SeriesMap = Record<string, number>;
export interface DailyStats { stats_inflow: SeriesMap; stats_outflow: SeriesMap; stats_cashflow: SeriesMap }

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  statsDaily: DailyStats | null;
  statsMonthly: DailyStats | null;
}

const emptyStats = (): CashFlowStats => ({ cashflow: 0, total_inflow: 0, total_outflow: 0, cash: 0, savings: 0, loans: 0 });

export function toStats(raw: Record<string, any> | undefined): CashFlowStats {
  const n = (key: string) => Number(raw?.[key]) || 0;
  return {
    cashflow: n("cashflow"),
    total_inflow: n("total_inflow"),
    total_outflow: n("total_outflow"),
    cash: n("total_inflow_cash") - n("total_outflow_cash"),
    savings: n("total_inflow_savings") - n("total_outflow_savings"),
    loans: n("total_inflow_loans") - n("total_outflow_loans"),
  };
}

export const useCashFlowsStore = defineStore("cashFlows", () => {
  const cashFlows = ref<CashFlow[]>([]);
  const cashFlow = ref<CashFlow | null>(null);
  const stats = ref<CashFlowStats>(emptyStats());
  const labels = ref<string[]>([]);
  const statsDaily = ref<DailyStats | null>(null);
  const statsMonthly = ref<DailyStats | null>(null);

  const isCashFlow = ref(false);
  const isCashFlowAdd = ref(false), isCashFlowAdded = ref(false);
  const isCashFlowChange = ref(false), isCashFlowChanged = ref(false);
  const isCashFlowDelete = ref(false), isCashFlowDeleted = ref(false);
  const isCashFlowDeleteAll = ref(false), isCashFlowDeletedAll = ref(false);

  async function asyncGetCashFlows(params: CashFlowQueryParams = {}) {
    const res = await runAction(isCashFlow, () => api.getCashFlows(params));
    if (res) {
      cashFlows.value = res.data.cash_flows;
      stats.value = toStats(res.data.stats);
    }
  }

  async function asyncGetCashFlow(id: number | string) {
    cashFlow.value = null;
    const res = await runAction(isCashFlow, () => api.getCashFlow(id));
    if (res) cashFlow.value = res.data.cash_flow;
    return !!res;
  }

  async function asyncGetLabels() {
    const res = await runAction(isCashFlow, () => api.getLabels());
    if (res) labels.value = res.data.labels;
  }

  async function asyncGetStatsDaily(params: Record<string, any> = {}) {
    const res = await runAction(isCashFlow, () => api.getStatsDaily(params));
    if (res) statsDaily.value = res.data;
  }

  async function asyncGetStatsMonthly(params: Record<string, any> = {}) {
    const res = await runAction(isCashFlow, () => api.getStatsMonthly(params));
    if (res) statsMonthly.value = res.data;
  }

  async function mutate(busy: { value: boolean }, done: { value: boolean }, fn: () => Promise<any>) {
    done.value = false;
    const res = await runAction(busy, fn, { success: true });
    done.value = !!res;
    return !!res;
  }

  const asyncAddCashFlow = (p: api.CashFlowPayload) => mutate(isCashFlowAdd, isCashFlowAdded, () => api.postCashFlow(p));
  const asyncChangeCashFlow = (id: number | string, p: api.CashFlowPayload) => mutate(isCashFlowChange, isCashFlowChanged, () => api.putCashFlow(id, p));
  const asyncDeleteCashFlow = (id: number | string) => mutate(isCashFlowDelete, isCashFlowDeleted, () => api.deleteCashFlow(id));
  const asyncDeleteAllCashFlows = () => mutate(isCashFlowDeleteAll, isCashFlowDeletedAll, () => api.deleteAllCashFlows());

  return {
    cashFlows, cashFlow, stats, labels, statsDaily, statsMonthly, isCashFlow,
    isCashFlowAdd, isCashFlowAdded, isCashFlowChange, isCashFlowChanged,
    isCashFlowDelete, isCashFlowDeleted, isCashFlowDeleteAll, isCashFlowDeletedAll,
    asyncGetCashFlows, asyncGetCashFlow, asyncGetLabels, asyncGetStatsDaily, asyncGetStatsMonthly,
    asyncAddCashFlow, asyncChangeCashFlow, asyncDeleteCashFlow, asyncDeleteAllCashFlows,
  };
});
