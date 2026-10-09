<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { LogOut, Menu, Wallet } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { photoUrl, showConfirmDialog } from "../../../helpers/toolsHelper";

defineEmits(["toggle"]);
const auth = useAuthStore();
const users = useUsersStore();
const router = useRouter();
const username = computed(() => users.profile?.email?.split("@")[0] ?? "");

async function logout() {
  if (!(await showConfirmDialog("Kamu akan keluar dari akun ini."))) return;
  await auth.asyncLogout();
  router.push("/auth/login");
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
      <div class="flex items-center gap-3">
        <button class="lg:hidden" aria-label="Menu" @click="$emit('toggle')"><Menu class="h-6 w-6" /></button>
        <RouterLink to="/" class="flex items-center gap-2 text-lg font-extrabold text-emerald-700"><Wallet class="h-6 w-6" /> Delcom Cash Flow</RouterLink>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="users.profile" class="flex items-center gap-2">
          <img :src="photoUrl(users.profile.photo)" alt="Foto" class="h-9 w-9 rounded-full bg-slate-200 object-cover" />
          <div class="hidden text-right text-sm leading-tight sm:block">
            <p class="font-bold">{{ users.profile.name }}</p>
            <p class="text-xs text-slate-500">@{{ username }} · Sesi aktif</p>
          </div>
        </div>
        <button class="btn-ghost" @click="logout"><LogOut class="h-4 w-4" /> Keluar</button>
      </div>
    </div>
  </header>
</template>