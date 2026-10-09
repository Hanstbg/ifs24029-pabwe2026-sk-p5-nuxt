<script setup lang="ts">
import { onMounted, ref } from "vue";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useUsersStore } from "../../users/states/usersStore";

const open = ref(false);
const users = useUsersStore();
onMounted(() => users.asyncGetProfile());
</script>

<template>
  <div class="min-h-screen">
    <NavbarComponent @toggle="open = !open" />
    <div class="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <SidebarComponent :open="open" @close="open = false" />
      <main class="min-w-0 flex-1"><RouterView /></main>
    </div>
  </div>
</template>
