<script setup lang="ts">
import { LayoutDashboard, Users, UserCog } from "lucide-vue-next";

defineProps<{ open: boolean }>();
defineEmits(["close"]);

const items = [
  { to: "/", label: "Ringkasan Arus Kas", icon: LayoutDashboard },
  { to: "/users", label: "Direktori Pengguna", icon: Users },
  { to: "/profile", label: "Profil Saya", icon: UserCog },
];
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-30 bg-black/40 lg:hidden" @click="$emit('close')"></div>
  <aside
    class="fixed inset-y-0 left-0 z-40 w-64 -translate-x-full bg-white p-4 pt-20 shadow-xl transition lg:static lg:z-auto lg:w-56 lg:translate-x-0 lg:bg-transparent lg:p-0 lg:shadow-none"
    :class="{ 'translate-x-0': open }"
  >
    <nav class="space-y-1">
      <RouterLink
        v-for="item in items" :key="item.to" :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
        @click="$emit('close')"
      >
        <component :is="item.icon" class="h-4 w-4" /> {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
