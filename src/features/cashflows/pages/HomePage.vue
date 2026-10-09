<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from "lucide-vue-next";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { formatDate, formatRupiah, showConfirmDialog } from "../../../helpers/toolsHelper";

const store = useCashFlowsStore();
const filters = reactive({ type: "", source: "", label: "", start: "", end: "" });
const showAdd = ref(false);
const editing = ref<any>(null);

const sourceName: Record<string, string> = { cash: "Tunai", savings: "Tabungan", loans: "Pinjaman" };

const params = () => ({
  type: filters.type, source: filters.source, label: filters.label,
  start_date: filters.start ? `${filters.start} 00:00:00` : "",
  end_date: filters.end ? `${filters.end} 23:59:59` : "",
});
const load = () => { store.asyncGetCashFlows(params()); store.asyncGetStatsDaily(); };
watch(filters, load);
onMounted(() => { load(); store.asyncGetLabels(); });

const cards = computed(() => [
  { title: "Total Saldo Kas Bersih", value: store.stats.cashflow, tone: "text-slate-900" },
  { title: "Total Pemasukan (Inflow)", value: store.stats.total_inflow, tone: "text-emerald-600" },
  { title: "Total Pengeluaran (Outflow)", value: store.stats.total_outflow, tone: "text-rose-600" },
  { title: "Saldo Kas Tunai", value: store.stats.cash, tone: "text-slate-900" },
  { title: "Saldo Rekening Tabungan", value: store.stats.savings, tone: "text-slate-900" },
  { title: "Saldo Pinjaman", value: store.stats.loans, tone: "text-slate-900" },
]);

const daily = computed(() => {
  const d = store.statsDaily;
  if (!d) return [];
  const max = Math.max(1, ...Object.values(d.stats_inflow), ...Object.values(d.stats_outflow));
  return Object.keys(d.stats_inflow).map((day) => ({
    day: day.slice(0, 5), inflow: (d.stats_inflow[day] / max) * 100, outflow: (d.stats_outflow[day] / max) * 100,
  }));
});

async function remove(c: any) {
  if (await showConfirmDialog("Transaksi ini akan dihapus.") && (await store.asyncDeleteCashFlow(c.id))) load();
}
async function reset() {
  if (await showConfirmDialog("Seluruh transaksi milikmu akan dihapus permanen.", "Reset semua transaksi?")
    && (await store.asyncDeleteAllCashFlows())) { load(); store.asyncGetLabels(); }
}
const afterMutation = () => { load(); store.asyncGetLabels(); };
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-extrabold">Ringkasan Arus Kas</h1>
      <div class="flex gap-2">
        <button class="btn-danger" @click="reset"><RotateCcw class="h-4 w-4" /> Reset Semua</button>
        <button class="btn-primary" @click="showAdd = true"><Plus class="h-4 w-4" /> Tambah Transaksi</button>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="c in cards" :key="c.title" class="card">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ c.title }}</p>
        <p class="mt-1 text-2xl font-extrabold" :class="c.tone">{{ formatRupiah(c.value) }}</p>
      </div>
    </div>

    <div v-if="daily.length" class="card">
      <h2 class="mb-3 font-bold">Statistik Harian</h2>
      <div class="flex h-32 items-end gap-2">
        <div v-for="d in daily" :key="d.day" class="flex flex-1 flex-col items-center gap-1">
          <div class="flex h-24 w-full items-end gap-0.5">
            <div class="w-1/2 rounded-t bg-emerald-500" :style="{ height: d.inflow + '%' }" title="Inflow"></div>
            <div class="w-1/2 rounded-t bg-rose-500" :style="{ height: d.outflow + '%' }" title="Outflow"></div>
          </div>
          <span class="text-[10px] text-slate-500">{{ d.day }}</span>
        </div>
      </div>
    </div>

    <div class="card grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div><label class="label" for="f-type">Jenis</label>
        <select id="f-type" v-model="filters.type" class="input"><option value="">Semua</option><option value="inflow">Inflow</option><option value="outflow">Outflow</option></select></div>
      <div><label class="label" for="f-source">Sumber</label>
        <select id="f-source" v-model="filters.source" class="input"><option value="">Semua</option><option value="cash">Tunai</option><option value="savings">Tabungan</option><option value="loans">Pinjaman</option></select></div>
      <div><label class="label" for="f-label">Label</label>
        <select id="f-label" v-model="filters.label" class="input"><option value="">Semua</option><option v-for="l in store.labels" :key="l" :value="l">{{ l }}</option></select></div>
      <div><label class="label" for="f-start">Tanggal Awal</label><input id="f-start" v-model="filters.start" type="date" class="input" /></div>
      <div><label class="label" for="f-end">Tanggal Akhir</label><input id="f-end" v-model="filters.end" type="date" class="input" /></div>
    </div>

    <p v-if="store.isCashFlow" class="text-slate-500">Memuat...</p>
    <p v-else-if="!store.cashFlows.length" class="card text-center text-slate-500">Belum ada transaksi.</p>

    <div v-if="store.cashFlows.length" class="card overflow-x-auto !p-0">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr><th class="px-4 py-3">Tanggal</th><th class="px-4 py-3">Jenis</th><th class="px-4 py-3">Label</th><th class="px-4 py-3">Sumber</th><th class="px-4 py-3 text-right">Nominal</th><th class="px-4 py-3 text-right">Aksi</th></tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="c in store.cashFlows" :key="c.id">
            <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(c.created_at) }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-bold" :class="c.type === 'inflow' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                {{ c.type === "inflow" ? "Pemasukan" : "Pengeluaran" }}
              </span>
            </td>
            <td class="px-4 py-3">{{ c.label }}</td>
            <td class="px-4 py-3">{{ sourceName[c.source] }}</td>
            <td class="px-4 py-3 text-right font-semibold" :class="c.type === 'inflow' ? 'text-emerald-600' : 'text-rose-600'">{{ formatRupiah(c.nominal) }}</td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1">
                <RouterLink :to="`/cash-flows/${c.id}`" class="btn-ghost !px-2 !py-1" aria-label="Detail"><Eye class="h-4 w-4" /></RouterLink>
                <button class="btn-ghost !px-2 !py-1" aria-label="Ubah" @click="editing = c"><Pencil class="h-4 w-4" /></button>
                <button class="btn-danger !px-2 !py-1" aria-label="Hapus" @click="remove(c)"><Trash2 class="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AddModal :show="showAdd" @close="showAdd = false" @added="afterMutation" />
    <ChangeModal :show="!!editing" :cash-flow="editing" @close="editing = null" @changed="afterMutation" />
  </section>
</template>
