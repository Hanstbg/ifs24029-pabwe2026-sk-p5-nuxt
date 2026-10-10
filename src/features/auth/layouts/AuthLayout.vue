<script setup lang="ts">
import { Wallet } from "lucide-vue-next";
</script>

<template>
  <main class="grid min-h-screen lg:grid-cols-2">
    <div class="hidden flex-col justify-center bg-gradient-to-br from-emerald-700 to-teal-800 p-12 text-white lg:flex">
      <Wallet class="mb-6 h-12 w-12" />
      <p class="text-4xl font-extrabold" aria-hidden="true">Delcom Cash Flow</p>
      <p class="mt-3 max-w-md text-emerald-100">Catat pemasukan dan pengeluaran, pantau saldo kasmu setiap hari.</p>
    </div>
    <div class="flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <h1 class="mb-4 text-2xl font-extrabold text-slate-900 lg:sr-only">Delcom Cash Flow</h1>
        <div class="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-center text-sm font-semibold">
          <RouterLink to="/auth/login" class="rounded-lg py-2" active-class="bg-white text-emerald-700 shadow">Masuk Akun</RouterLink>
          <RouterLink to="/auth/register" class="rounded-lg py-2" active-class="bg-white text-emerald-700 shadow">Daftar Baru</RouterLink>
        </div>
        <div class="card"><RouterView /></div>
      </div>
    </div>
  </main>
</template>