<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { formatDate, formatRupiah, showConfirmDialog } from "../../../helpers/toolsHelper";

const store = useCashFlowsStore();
const route = useRoute();
const router = useRouter();
const showChange = ref(false);
const sourceName: Record<string, string> = { cash: "Tunai", savings: "Tabungan", loans: "Pinjaman" };

const load = () => store.asyncGetCashFlow(route.params.cashFlowId as string);
onMounted(load);

async function remove() {
  if (await showConfirmDialog("Transaksi ini akan dihapus.") && (await store.asyncDeleteCashFlow(store.cashFlow.id))) router.push("/");
}
</script>

<template>
  <section v-if="store.cashFlow" class="mx-auto max-w-2xl space-y-5">
    <RouterLink to="/" class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600"><ArrowLeft class="h-4 w-4" /> Kembali</RouterLink>
    <div class="card space-y-3">
      <div class="flex items-start justify-between">
        <h1 class="text-2xl font-extrabold">{{ store.cashFlow.label }}</h1>
        <span class="rounded-full px-3 py-1 text-xs font-bold" :class="store.cashFlow.type === 'inflow' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
          {{ store.cashFlow.type === "inflow" ? "Pemasukan" : "Pengeluaran" }}
        </span>
      </div>
      <p class="text-3xl font-extrabold" :class="store.cashFlow.type === 'inflow' ? 'text-emerald-600' : 'text-rose-600'">{{ formatRupiah(store.cashFlow.nominal) }}</p>
      <dl class="grid gap-2 text-sm sm:grid-cols-2">
        <div><dt class="text-slate-500">Sumber dana</dt><dd class="font-semibold">{{ sourceName[store.cashFlow.source] }}</dd></div>
        <div><dt class="text-slate-500">Dibuat</dt><dd class="font-semibold">{{ formatDate(store.cashFlow.created_at) }}</dd></div>
        <div><dt class="text-slate-500">Diperbarui</dt><dd class="font-semibold">{{ formatDate(store.cashFlow.updated_at) }}</dd></div>
      </dl>
      <div><p class="text-sm text-slate-500">Deskripsi</p><p class="whitespace-pre-line">{{ store.cashFlow.description || "-" }}</p></div>
      <div class="flex gap-2 pt-2">
        <button class="btn-ghost" @click="showChange = true"><Pencil class="h-4 w-4" /> Ubah</button>
        <button class="btn-danger" @click="remove"><Trash2 class="h-4 w-4" /> Hapus</button>
      </div>
    </div>
    <ChangeModal :show="showChange" :cash-flow="store.cashFlow" @close="showChange = false" @changed="load" />
  </section>
  <p v-else-if="store.isCashFlow" class="text-slate-500">Memuat...</p>
  <p v-else class="card text-center text-slate-500">Transaksi tidak ditemukan.</p>
</template>
