<script setup lang="ts">
import { watch } from "vue";
import { X } from "lucide-vue-next";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const props = defineProps<{ show: boolean; cashFlow: any }>();
const emit = defineEmits(["close", "changed"]);
const store = useCashFlowsStore();
const [type, onType] = useInput("inflow");
const [source, onSource] = useInput("cash");
const [label, onLabel] = useInput("");
const [nominal, onNominal] = useInput("");
const [description, onDescription] = useInput("");

watch(() => props.show, (s) => {
  if (s && props.cashFlow) {
    const c = props.cashFlow;
    onType(c.type); onSource(c.source); onLabel(c.label); onNominal(c.nominal); onDescription(c.description || "");
  }
});

async function submit() {
  if (!label.value || !(Number(nominal.value) > 0)) return showErrorDialog("Label dan nominal (> 0) wajib diisi");
  const ok = await store.asyncChangeCashFlow(props.cashFlow.id, {
    type: type.value, source: source.value, label: label.value, nominal: Number(nominal.value), description: description.value,
  });
  if (ok) { emit("changed"); emit("close"); }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" @click.self="emit('close')">
    <form class="my-auto w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl" @submit.prevent="submit">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-extrabold">Ubah Arus Kas</h2>
        <button type="button" aria-label="Tutup" @click="emit('close')"><X class="h-5 w-5" /></button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="label" for="type">Jenis</label>
          <select id="type" class="input" :value="type" @change="onType"><option value="inflow">Inflow (Pemasukan)</option><option value="outflow">Outflow (Pengeluaran)</option></select>
        </div>
        <div>
          <label class="label" for="source">Sumber Dana</label>
          <select id="source" class="input" :value="source" @change="onSource"><option value="cash">Tunai</option><option value="savings">Tabungan</option><option value="loans">Pinjaman</option></select>
        </div>
      </div>
      <div><label class="label" for="label">Label Kategori</label><input id="label" class="input" placeholder="mis. gaji" :value="label" @input="onLabel" /></div>
      <div><label class="label" for="nominal">Nominal (Rp)</label><input id="nominal" type="number" min="1" class="input" :value="nominal" @input="onNominal" /></div>
      <div><label class="label" for="description">Keterangan</label><textarea id="description" rows="3" class="input" :value="description" @input="onDescription"></textarea></div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-ghost" @click="emit('close')">Batal</button>
        <button class="btn-primary" :disabled="store.isCashFlowChange">Simpan</button>
      </div>
    </form>
  </div>
</template>
