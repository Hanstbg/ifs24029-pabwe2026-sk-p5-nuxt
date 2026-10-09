<script setup lang="ts">
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { photoUrl } from "../../../helpers/toolsHelper";

const store = useUsersStore();
onMounted(() => store.asyncGetUsers());
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-extrabold">Daftar Pengguna</h1>
    <p v-if="store.isUsers" class="text-slate-500">Memuat...</p>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="u in store.users" :key="u.id" class="card flex items-center gap-3">
        <img :src="photoUrl(u.photo)" :alt="u.name" class="h-12 w-12 rounded-full bg-slate-200 object-cover" />
        <div class="min-w-0">
          <p class="truncate font-bold">{{ u.name }}</p>
          <p class="truncate text-sm text-slate-500">{{ u.email }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
